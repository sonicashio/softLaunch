import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { SettingsService } from "~/server/services";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService, UserCharacterService, UserService } from "~/server/services/user";
import { UserRole } from "~/types";
import { UserDto } from "~/types/dto/user";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

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

    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    const usersStatics = await getStaticsUsers(em);
    const userCanSpinFortuneWheelForFree: boolean = userService.canSpinFortuneWheelForFree(usersStatics.mostActiveUser);
    return {
        ...usersStatics,
        mostActiveUser: await UserDto.fromUser(em, usersStatics.mostActiveUser, null, true, userCanSpinFortuneWheelForFree),
    };
});
