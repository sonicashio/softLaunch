import type { EntityManager } from "@mikro-orm/postgresql";
import { FortuneWheelItemDto } from "~/types/dto";
import { CacheConstants, UserRole } from "~/types";
import { FortuneWheelItem } from "~/server/entities/fortune-wheel";
import { User } from "~/server/entities/user";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

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

    const items: FortuneWheelItem[] = await em.findAll(
        FortuneWheelItem,
        { cache: [CacheConstants.FORTUNE_WHEEL_ITEMS_KEY, 600_000], orderBy: { index: "ASC" } },
    );

    return items.map(item => FortuneWheelItemDto.fromFortuneWheelItem(item, true));
});
