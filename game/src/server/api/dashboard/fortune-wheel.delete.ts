import { z } from "zod";
import { type EntityManager } from "@mikro-orm/postgresql";
import { CacheConstants, UserRole } from "~/types";
import { FortuneWheelItem } from "~/server/entities/fortune-wheel";
import { User } from "~/server/entities/user";
import { FortuneWheelService } from "~/server/services";

const indexiesSchema = z.array(z.number().min(0, { message: "Invalid Index" }));

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = indexiesSchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body: number[] = bodyResult.data;
    const em: EntityManager = useEntityManager<EntityManager>(event);

    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Current user not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is not an admin",
        });
    }

    const itemsToDelete: FortuneWheelItem[] = await em.find(FortuneWheelItem, { index: { $in: body } });
    if (itemsToDelete.length !== body.length) {
        throw createError({
            statusCode: 404,
            statusMessage: "Some fortune wheel items not found",
        });
    }

    const itemsCount: number = await em.count(FortuneWheelItem);
    if (itemsCount - itemsToDelete.length < 4) {
        throw createError({
            statusCode: 400,
            statusMessage: "Minimum number of fortune wheel items is 4",
            fatal: true,
        });
    }

    const fortuneWheelService = new FortuneWheelService(em);
    await fortuneWheelService.delete(itemsToDelete);

    // Re set indexes
    const items: FortuneWheelItem[] = await em.findAll(FortuneWheelItem, { orderBy: { index: "ASC" } });
    for (let i = 0; i < items.length; i++) {
        items[i].index = i;
    }
    await em.persistAndFlush(items);

    await em.clearCache(CacheConstants.FORTUNE_WHEEL_ITEMS_KEY);
    return { success: true };
});
