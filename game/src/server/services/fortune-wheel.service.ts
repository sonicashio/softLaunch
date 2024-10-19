import type { EntityManager } from "@mikro-orm/postgresql";
import { FortuneWheelItem } from "~/server/entities/fortune-wheel";

export class FortuneWheelService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(item: FortuneWheelItem): Promise<FortuneWheelItem> {
        await this.em.persistAndFlush(item);
        return item;
    }

    public async delete(item: FortuneWheelItem | FortuneWheelItem[]): Promise<void> {
        await this.em.removeAndFlush(item);
    }

    public async update(item: FortuneWheelItem | FortuneWheelItem[]): Promise<void> {
        await this.em.persistAndFlush(item);
    }
}
