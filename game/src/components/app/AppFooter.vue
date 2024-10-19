<script lang="ts" setup>
import { EarnTaskType } from "~/types";

const icons: Record<string, string> = useIconsAssets();
const route = useRoute();

const { appData } = useAppData();

const earnTasksIndicator = useState<boolean>(
    "earnTasksIndicator",
    () => appData.earnTasks.data.value.find(task => !task.completed && task.type !== EarnTaskType.INVITE_FRIENDS) !== undefined,
);
const uncompletedTasksCount = computed<number>(() => {
    return appData.earnTasks.data.value.filter(task => !task.completed && task.type !== EarnTaskType.INVITE_FRIENDS).length ?? 0;
});

const navItems = [
    { name: "Heros", url: "/app/heros", icon: "heros", indicator: ref<boolean>(false) },
    { name: "Earn", url: "/app/earn", icon: "earn", indicator: earnTasksIndicator },
    { name: "", url: "/app/", icon: "coin", indicator: ref<boolean>(false), main: true },
    { name: "Friends", url: "/app/friends", icon: "friends", indicator: ref<boolean>(false) },
    { name: "Airdrop", url: "/app/airdrop", icon: "airdrop", indicator: ref<boolean>(false) },
];
</script>

<template>
  <footer class="max-w-lg w-full fixed bottom-0 select-none text-white py-2 px-0.5">
    <div
      class="flex justify-between w-full h-20 rounded-full px-5 py-1
    bg-blue-950 bg-opacity-80 border-gray-600 backdrop-blur-sm shadow-sm shadow-blue-700"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        class="flex justify-center"
        :class="[
          item.url === route.path && !item.main ? 'border-b-2 border-yellow-400' : '',
        ]"
        :to="item.url"
      >
        <div class="relative flex flex-col items-center justify-center">
          <img
            :src="icons[item.icon]"
            :alt="item.name"
            :class="[
              item.main ? '-top-8 w-20 h-20' : '',
            ]"
            class="object-contain w-12 h-12 pointer-events-none"
          />
          <span
            class="text-sm font-semibold"
            :class="[item.main ? 'text-yellow-400 font-bold absolute bottom-1.5' : 'text-gray-400']"
          >
            {{ item.name }}
          </span>

          <div
            v-if="item.indicator.value"
            class="absolute top-0 -right-3 flex items-center justify-center h-7 w-7 bg-red-500 rounded-full"
          >
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span
              class="relative inline-flex rounded-full text-xl font-bold"
              style="top: -1px"
            >
              {{ uncompletedTasksCount }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </footer>
</template>

<style>

</style>
