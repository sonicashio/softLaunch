// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FortuneWheelNothingItemReward {
}

export interface FortuneWheelBalaceItemReward {
    balance: number;
}

export interface FortuneWheelEnergyReplenishmentItemReward {
    charges: number;
}

export type FortuneWheelItemReward =
    FortuneWheelNothingItemReward |
    FortuneWheelBalaceItemReward |
    FortuneWheelEnergyReplenishmentItemReward;
