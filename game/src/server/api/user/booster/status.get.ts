import type { EntityManager } from "@mikro-orm/postgresql";
import { EnergyLimitLevelBooster, ClickPowerLevelBooster } from "~/server/entities/boosters";
import { Settings } from "~/server/entities/settings";
import { User } from "~/server/entities/user";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { SettingsService } from "~/server/services";
import { UserBoosterService, UserCharacterService, UserService } from "~/server/services/user";
import { UserBoostersDto } from "~/types/dto/user";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(
        User,
        { telegramId: session.user.telegramId },
        { populate: ["boosters.energyLimit.level", "boosters.clickPower.level"] },
    );
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

    let allResolve: [EnergyLimitLevelBooster[], ClickPowerLevelBooster[]];
    try {
        allResolve = await Promise.all([
            em.findAll(EnergyLimitLevelBooster, { cache: 600_000, orderBy: { level: "ASC" } }),
            em.findAll(ClickPowerLevelBooster, { cache: 600_000, orderBy: { level: "ASC" } }),
        ]);
    } catch (error) {
        console.error(error); // Replace with your own error logging
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error. Cannot get booster levels.",
        });
    }

    const [energyLimitLevels, clickPowerLevels] = allResolve;
    const energyLimitLevelsDto = energyLimitLevels.map((energyLimitLevel: EnergyLimitLevelBooster) => {
        return {
            level: energyLimitLevel.level,
            price: energyLimitLevel.price,
        };
    });

    const clickPowerLevelsDto = clickPowerLevels.map((clickPowerLevel: ClickPowerLevelBooster) => {
        return {
            level: clickPowerLevel.level,
            price: clickPowerLevel.price,
        };
    });

    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    const settingsService = new SettingsService(em);
    const settings: Settings = await settingsService.get();

    const dto = new UserBoostersDto();
    dto.curEnergyLimitLevel = user.boosters?.energyLimit.level ?? 0;
    dto.energyLimitLevels = energyLimitLevelsDto;
    dto.curClickPowerLevel = user.boosters?.clickPower.level ?? 0;
    dto.clickPowerLevels = clickPowerLevelsDto;
    dto.energyReplenishment = settings.maxDailyEnergyReplenishment;
    dto.energyReplenishmentUsed = user.dailyEnergyReplenishmentUsed;
    dto.canUseEnergyReplenishment = await userService.canClaimDailyEnergyReplenishment(user);

    return dto;
});
