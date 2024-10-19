import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import type { FortuneWheelItemReward } from "~/types";
import { CacheConstants, FortuneWheelItemType, UserRole } from "~/types";
import { FortuneWheelItem } from "~/server/entities/fortune-wheel";
import { User } from "~/server/entities/user";
import { FortuneWheelService } from "~/server/services";

const baseTaskSchema = z.object({
    index: z.number()
        .min(0, { message: "Index is required" }),

    title: z.string()
        .min(1, { message: "Title is required" })
        .max(64, { message: "Title must not exceed 64 characters" }),

    chance: z.number()
        .min(0, { message: "Chance must be a non-negative number" })
        .max(100, { message: "Chance must not exceed 100%" }),
});

const nothingSchema = baseTaskSchema.extend({
    type: z.literal(FortuneWheelItemType.NOTHING),
});

const balanceSchema = baseTaskSchema.extend({
    type: z.literal(FortuneWheelItemType.BALANCE),
    balance: z.number()
        .min(0, { message: "Balance must be a non-negative number" }),
});

const chargesSchema = baseTaskSchema.extend({
    type: z.literal(FortuneWheelItemType.ENERGY_REPLENISHMENT),
    charges: z.number()
        .min(1, { message: "Charges must be a positive number" }),
});

const itemSchema = z.discriminatedUnion("type", [
    nothingSchema,
    balanceSchema,
    chargesSchema,
]);

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = itemSchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body = bodyResult.data;
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

    const items: FortuneWheelItem[] = await em.findAll(FortuneWheelItem, { orderBy: { index: "ASC" } });

    // Validate chances
    if (items.reduce((sum, item) => sum + item.chance, 0) + body.chance > 100) {
        throw createError({
            statusCode: 400,
            statusMessage: "Chance must not exceed 100%",
        });
    }

    const fortuneWheelService = new FortuneWheelService(em);

    let reward: FortuneWheelItemReward;
    switch (body.type) {
        case FortuneWheelItemType.NOTHING:
            reward = {};
            break;
        case FortuneWheelItemType.BALANCE:
            reward = { balance: body.balance };
            break;
        case FortuneWheelItemType.ENERGY_REPLENISHMENT:
            reward = { charges: body.charges };
            break;
        default:
            throw createError({
                statusCode: 500,
                statusMessage: "Unreachable code, invalid fortune wheel item type",
                fatal: true,
            });
    }

    // Re set indexes
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].index = i + (i >= body.index ? 1 : 0);
    }

    // Create new item
    await fortuneWheelService.create(new FortuneWheelItem(body.index, body.title, body.type, body.chance, reward));
    await em.clearCache(CacheConstants.FORTUNE_WHEEL_ITEMS_KEY);

    return { success: true };
});
