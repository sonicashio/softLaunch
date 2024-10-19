<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { FortuneWheelItemType } from "~/types";
import type { FortuneWheelItemDto } from "~/types/dto";

definePageMeta({
    layout: "app-logged-in",
});

const isLoading = ref<boolean>(false);

// User
const { user, sync: userSync } = useUser();

// Wheel
function transfromItems(items: FortuneWheelItemDto[]): { title: string; icon?: string }[] {
    items = items.sort((a, b) => a.index - b.index);

    return items.map((item) => {
        let icon: string | undefined;
        switch (item.type) {
            case FortuneWheelItemType.BALANCE:
                icon = "coin";
                break;

            case FortuneWheelItemType.ENERGY_REPLENISHMENT:
                icon = "energy-limit";
                break;

            default:
                icon = undefined;
                break;
        }

        return {
            title: item.title,
            icon: icon,
        };
    });
}

const { appData } = useAppData();
const wheelItems = ref<{ title: string; icon?: string }[]>(transfromItems(appData.fortuneWheel.data.value));

watch(appData.fortuneWheel.data, () => {
    wheelItems.value = transfromItems(appData.fortuneWheel.data.value);
});

async function spinWheel(): Promise<number | null> {
    isLoading.value = true;
    let rewardIndex: number = 0;
    try {
        rewardIndex = await $fetch("/api/fortune-wheel/spin", {
            method: "POST",
        });

        await userSync(0);
    } catch (error) {
        toast.error("Failed to claim fortune wheel reward: " + getErrorMsg(error));
        isLoading.value = false;
        return null;
    }

    isLoading.value = false;
    return rewardIndex;
}

async function spinFinished(itemIndex: number): Promise<void> {
    if (wheelItems.value[itemIndex].icon === undefined) {
        return;
    }

    toast.success("Fortune wheel reward claimed", { autoClose: 1000 });
}
</script>

<template>
  <section
    v-if="user !== null && wheelItems !== null"
    class="flex flex-col grow mx-2"
  >
    <!-- Main Menu -->
    <AppMainMenu class="mt-1" />

    <!-- Spins left -->
    <div class="flex space-x-1.5 justify-center items-center select-none my-2.5">
      <span class="text-3xl select-none">🎁</span>
      <span class="text-3xl font-extrabold text-gradient">Spins left: {{ user?.fortuneWheelSpinsLeft }}</span>
    </div>

    <div class="flex flex-col items-center justify-center grow">
      <AppFortuneWheel
        :items="wheelItems"
        :disabled="isLoading || user.fortuneWheelSpinsLeft === 0"
        :start-callback="spinWheel"
        @animation-finish="spinFinished"
      />
    </div>

    <div class="h-20" />
  </section>

  <div v-else-if="user === null">
    User not logged in
  </div>

  <div v-else>
    Failed to load fortune wheel. Please try again later.
  </div>
</template>

<style>

</style>
