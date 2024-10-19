import type { EntityManager } from "@mikro-orm/postgresql";
import { FortuneWheelItem } from "~/server/entities/fortune-wheel";
import { User } from "~/server/entities/user";
import { SettingsService } from "~/server/services";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService, UserCharacterService, UserService } from "~/server/services/user";
import { CacheConstants } from "~/types";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    const items: FortuneWheelItem[] = await em.findAll(
        FortuneWheelItem,
        { cache: [CacheConstants.FORTUNE_WHEEL_ITEMS_KEY, 600_000], orderBy: { index: "ASC" } },
    );

    const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
    const randomNumber = Math.random() * totalChance;

    let selectedItem: FortuneWheelItem | undefined = undefined;
    let accumulatedChance: number = 0;
    for (const item of items) {
        accumulatedChance += item.chance;
        if (randomNumber < accumulatedChance) {
            selectedItem = item;
            break;
        }
    }

    if (selectedItem === undefined) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to spin the wheel, please contact support",
            fatal: true,
        });
    }

    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    await userService.spinFortuneWheel(user, selectedItem);
    return selectedItem.index;
});
