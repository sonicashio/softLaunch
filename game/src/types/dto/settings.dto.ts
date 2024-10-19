import type { Settings } from "~/server/entities/settings";

export class SettingsDto {
    public telegramChannelId!: string;
    public userStartingBalance!: number;
    public maxDailyEnergyReplenishment!: number;
    public maxOfflineProfitHours!: number;
    public referralReward!: number;
    public dailyReward!: number;
    public startingEnergyLimit!: number;
    public energyLimitPerCharacter!: number;
    public energyLimitPerLevel!: number;
    public energyLimitPerBooster!: number;
    public maxReferralsForFortuneWheelPerDay!: number;
    public fortuneWheelSpinsPerReferral!: number;

    public static fromSettings(settings: Settings): SettingsDto {
        const dto = new SettingsDto();
        dto.telegramChannelId = settings.telegramChannelId;
        dto.userStartingBalance = settings.userStartingBalance;
        dto.maxDailyEnergyReplenishment = settings.maxDailyEnergyReplenishment;
        dto.maxOfflineProfitHours = settings.maxOfflineProfitHours;
        dto.referralReward = settings.referralReward;
        dto.dailyReward = settings.dailyReward;
        dto.startingEnergyLimit = settings.startingEnergyLimit;
        dto.energyLimitPerCharacter = settings.energyLimitPerCharacter;
        dto.energyLimitPerLevel = settings.energyLimitPerLevel;
        dto.energyLimitPerBooster = settings.energyLimitPerBooster;
        dto.maxReferralsForFortuneWheelPerDay = settings.maxReferralsForFortuneWheelPerDay;
        dto.fortuneWheelSpinsPerReferral = settings.fortuneWheelSpinsPerReferral;

        return dto;
    }
}
