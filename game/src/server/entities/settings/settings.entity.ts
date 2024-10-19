import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "settings" })
export class Settings {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property({ length: 64, nullable: true })
    public telegramChannelId: string;

    @Property()
    public userStartingBalance: number;

    @Property()
    public maxDailyEnergyReplenishment: number;

    @Property()
    public maxOfflineProfitHours: number;

    @Property()
    public referralReward: number;

    @Property()
    public dailyReward: number;

    @Property()
    public startingEnergyLimit: number;

    @Property()
    public energyLimitPerCharacter: number;

    @Property()
    public energyLimitPerLevel: number;

    @Property()
    public energyLimitPerBooster: number;

    @Property()
    public maxReferralsForFortuneWheelPerDay: number;

    @Property()
    public fortuneWheelSpinsPerReferral: number;

    constructor() {
        this.telegramChannelId = "-1002217295250";
        this.userStartingBalance = 5_000;
        this.maxDailyEnergyReplenishment = 6;
        this.maxOfflineProfitHours = 3;
        this.referralReward = 5_000;
        this.dailyReward = 5_000;
        this.startingEnergyLimit = 100;
        this.energyLimitPerCharacter = 100;
        this.energyLimitPerLevel = 100;
        this.energyLimitPerBooster = 100;
        this.maxReferralsForFortuneWheelPerDay = 5;
        this.fortuneWheelSpinsPerReferral = 2;
    }
}
