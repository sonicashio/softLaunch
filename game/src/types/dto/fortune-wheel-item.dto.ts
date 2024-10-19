import type { FortuneWheelItem } from "~/server/entities/fortune-wheel";
import { FortuneWheelItemType } from "~/types";
import type { FortuneWheelBalaceItemReward, FortuneWheelEnergyReplenishmentItemReward } from "~/types";

export class FortuneWheelItemDto {
    public index!: number;
    public title!: string;
    public type!: FortuneWheelItemType;
    public id?: number;
    public chance?: number;
    public rewardBalance?: number;
    public rewardCharges?: number;

    public static fromFortuneWheelItem(item: FortuneWheelItem, includeAdminData: boolean): FortuneWheelItemDto {
        const dto = new FortuneWheelItemDto();

        dto.index = item.index;
        dto.title = item.title;
        dto.type = item.type;

        if (!includeAdminData) {
            return dto;
        }

        dto.id = item.id;
        dto.chance = item.chance;

        switch (item.type) {
            case FortuneWheelItemType.BALANCE:
                dto.rewardBalance = (<FortuneWheelBalaceItemReward>item.reward).balance;
                break;
            case FortuneWheelItemType.ENERGY_REPLENISHMENT:
                dto.rewardCharges = (<FortuneWheelEnergyReplenishmentItemReward>item.reward).charges;
                break;
        }
        return dto;
    }
}
