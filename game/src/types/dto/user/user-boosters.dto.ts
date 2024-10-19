export class UserBoostersDto {
    public curEnergyLimitLevel!: number;
    public energyLimitLevels!: { level: number; price: number }[];
    public curClickPowerLevel!: number;
    public clickPowerLevels!: { level: number; price: number }[];
    public energyReplenishment!: number;
    public energyReplenishmentUsed!: number;
    public canUseEnergyReplenishment!: boolean;
}
