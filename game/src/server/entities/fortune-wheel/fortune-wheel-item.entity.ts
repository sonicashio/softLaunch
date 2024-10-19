import { z } from "zod";
import { Entity, Enum, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import type { FortuneWheelItemReward } from "~/types";
import { FortuneWheelItemType } from "~/types";

const ctorSchema = z.object({
    title: z.string().min(1).max(64),
    type: z.nativeEnum(FortuneWheelItemType),
    chance: z.number().min(0).max(100),
    reward: z.union([
        z.object({ }),
        z.object({ balance: z.number().min(1) }),
        z.object({ charges: z.number().min(1) }),
    ]),
});

@Entity({ tableName: "fortune_wheel" })
export class FortuneWheelItem {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property()
    public readonly createdAt: Date;

    @Property({ onUpdate: () => new Date() })
    public readonly updatedAt: Date;

    @Property()
    public index: number;

    @Property({ length: 64 })
    @Unique()
    public title: string;

    @Enum({ items: () => FortuneWheelItemType, nativeEnumName: "fortune_wheel_item_type" })
    public type: FortuneWheelItemType;

    @Property()
    public chance: number;

    @Property({ type: "json" })
    public reward: FortuneWheelItemReward;

    constructor(index: number, title: string, type: FortuneWheelItemType, chance: number, reward: FortuneWheelItemReward) {
        ctorSchema.parse({ title, type, chance, reward });

        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.index = index;
        this.title = title;
        this.type = type;
        this.chance = chance;
        this.reward = reward;
    }
}
