import { toast } from "vue3-toastify";
import type { DailyLoginRewardDto, FortuneWheelItemDto, ReferralDto } from "~/types/dto";
import type { EarnTaskDto } from "~/types/dto/earn";
import { UserBoostersDto, UserCharacterDto } from "~/types/dto/user";

export interface AppData {
    earnTasks: { data: Ref<EarnTaskDto[]>; fetch: () => Promise<boolean> };
    dailies: { data: Ref<{ dailies: DailyLoginRewardDto[]; dailyReward: number }>; fetch: () => Promise<boolean> };
    fortuneWheel: { data: Ref<FortuneWheelItemDto[]>; fetch: () => Promise<boolean> };
    userCharacters: { data: Ref<UserCharacterDto[]>; fetch: () => Promise<boolean> };
    userBoosters: { data: Ref<UserBoostersDto>; fetch: () => Promise<boolean> };
    userReferrals: { data: Ref<{ referralReward: number; referrals: ReferralDto[] }>; fetch: () => Promise<boolean> };
}

// Earn tasks
const earnTasksData = ref<EarnTaskDto[]>([]);

async function earnTasksFetch(): Promise<boolean> {
    try {
        earnTasksData.value = await $fetch("/api/earn/task-list");
    } catch {
        toast.error("Failed to fetch earn tasks data");
        return false;
    }

    return true;
}

// Dailies
const dailiesData = ref<{ dailies: DailyLoginRewardDto[]; dailyReward: number }>({
    dailies: [],
    dailyReward: 0,
});

async function dailiesFetch(): Promise<boolean> {
    try {
        dailiesData.value = await $fetch("/api/dailies");
    } catch {
        toast.error("Failed to fetch dailies data");
        return false;
    }

    return true;
}

// Fortune wheel
const fortuneWheelData = ref<FortuneWheelItemDto[]>([]);

async function fortuneWheelFetch(): Promise<boolean> {
    try {
        fortuneWheelData.value = await $fetch("/api/fortune-wheel/items");
    } catch {
        toast.error("Failed to fetch fortune wheel data");
        return false;
    }

    return true;
}

// User characters
const userCharactersData = ref<UserCharacterDto[]>([]);

async function userCharactersFetch(): Promise<boolean> {
    try {
        userCharactersData.value = await $fetch("/api/character/list");
    } catch {
        toast.error("Failed to fetch user characters data");
        return false;
    }

    return true;
}

// User Boosters
const userBoostersData = ref<UserBoostersDto>(new UserBoostersDto());

async function userBoostersFetch(): Promise<boolean> {
    try {
        userBoostersData.value = await $fetch("/api/user/booster/status");
    } catch {
        toast.error("Failed to fetch user boosters data");
        return false;
    }

    return true;
}

// User Referrals
const userReferralsData = ref<{ referralReward: number; referrals: ReferralDto[] }>({ referralReward: 0, referrals: [] });

async function userReferralsFetch(): Promise<boolean> {
    try {
        userReferralsData.value = await $fetch("/api/user/referrals");
    } catch {
        toast.error("Failed to fetch user refferals data");
        return false;
    }

    return true;
}

const appData: AppData = {
    earnTasks: { data: earnTasksData, fetch: earnTasksFetch },
    dailies: { data: dailiesData, fetch: dailiesFetch },
    fortuneWheel: { data: fortuneWheelData, fetch: fortuneWheelFetch },
    userCharacters: { data: userCharactersData, fetch: userCharactersFetch },
    userBoosters: { data: userBoostersData, fetch: userBoostersFetch },
    userReferrals: { data: userReferralsData, fetch: userReferralsFetch },
};

/**
 * Get app data, Don't call fetch more than once(only in login page)
 *
 * @note returned appData will be null only in login page, otherwise it will be filled
*/
export function useAppData(): {
    appData: AppData;
    fetch: () => Promise<boolean>;
} {
    async function fetch(): Promise<boolean> {
        // Fetch all
        const allFetched: boolean = (await Promise.all([
            earnTasksFetch(),
            dailiesFetch(),
            fortuneWheelFetch(),
            userCharactersFetch(),
            userBoostersFetch(),
            userReferralsFetch(),
        ])).every(success => success);
        if (!allFetched) {
            toast.error("Failed to fetch app data");
            return false;
        }

        return true;
    }

    return {
        appData,
        fetch,
    };
}
