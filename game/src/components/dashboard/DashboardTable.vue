<script lang="ts" setup>
defineProps<{
    columns: string[];
    selectable?: boolean;
}>();

const emit = defineEmits<{
    allSelected: [checked: boolean];
}>();

const checked = ref<boolean>(false);
function selectAll(): void {
    checked.value = !checked.value;
    emit("allSelected", checked.value);
}
</script>

<template>
  <div class="overflow-auto grow basis-0 min-h-80">
    <!-- Table -->
    <table class="table table-zebra table-pin-rows mt-2 rounded-box">
      <thead>
        <tr>
          <th v-if="selectable">
            <input
              aria-label="Check all"
              type="checkbox"
              class="checkbox checkbox-xs"
              :checked="checked"
              @change="selectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col"
          >
            <span class="text-sm font-medium text-base-content/80">{{ col }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <slot />
      </tbody>

      <tfoot>
        <tr>
          <th v-if="selectable">
            <input
              aria-label="Check all"
              type="checkbox"
              class="checkbox checkbox-xs"
              :checked="checked"
              @change="selectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col"
          >
            <span class="text-sm font-medium text-base-content/80">{{ col }}</span>
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style>

</style>
