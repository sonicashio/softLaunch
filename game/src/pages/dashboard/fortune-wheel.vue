<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { FortuneWheelItemType } from "~/types";
import { FortuneWheelItemDto } from "~/types/dto";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);

function transformFn(items: FortuneWheelItemDto[]): { item: FortuneWheelItemDto; selected: boolean }[] {
    return items.map((item) => {
        return {
            item: item,
            selected: false,
        };
    });
}

const { data: wheelItems, error } = await useFetch("/api/dashboard/fortune-wheel", {
    transform: transformFn,
});
if (error.value) {
    toast.error("Failed to fetch fortune wheel items: " + getErrorMsg(error.value));
}

// Modal
const isModalOpen = ref<boolean>(false);
const selectedItem = ref<FortuneWheelItemDto>(new FortuneWheelItemDto());
const isNewItemModal = ref<boolean>(false);
const isDeleteModalOpen = ref<boolean>(false);
const isDeleteSelectedItemsModal = ref<boolean>(false);

// Show/hide fields based on item type
const showBalanceField = computed(() => {
    return selectedItem.value.type === FortuneWheelItemType.BALANCE;
});

const showChargesField = computed(() => {
    return selectedItem.value.type === FortuneWheelItemType.ENERGY_REPLENISHMENT;
});

function openEditModal(item: FortuneWheelItemDto): void {
    selectedItem.value = item;
    isNewItemModal.value = false;
    isModalOpen.value = true;
    isDeleteModalOpen.value = false;
    isDeleteSelectedItemsModal.value = false;
}

function openNewModal(): void {
    selectedItem.value = new FortuneWheelItemDto();
    isNewItemModal.value = true;
    isDeleteModalOpen.value = false;
    isModalOpen.value = true;
    isDeleteSelectedItemsModal.value = false;
}

function openDeleteModal(item: FortuneWheelItemDto): void {
    selectedItem.value = item;
    isNewItemModal.value = false;
    isModalOpen.value = false;
    isDeleteModalOpen.value = true;
    isDeleteSelectedItemsModal.value = false;
}

function openDeleteSelectedModal(): void {
    if (wheelItems.value?.filter(item => item.selected).length === 0) {
        return;
    }

    isNewItemModal.value = false;
    isModalOpen.value = false;
    isDeleteModalOpen.value = false;
    isDeleteSelectedItemsModal.value = true;
}

async function editOrAddWheelItem(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/fortune-wheel", {
            method: isNewItemModal.value ? "POST" : "PUT",
            body: {
                ...selectedItem.value,
                balance: selectedItem.value.rewardBalance,
                charges: selectedItem.value.rewardCharges,
            },
        });

        wheelItems.value = transformFn(await $fetch("/api/dashboard/fortune-wheel"));

        toast.success("Fortune wheel item saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit or add fortune wheel item: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function deleteItems(indexies: number[]): Promise<void> {
    if (indexies.length === 0) {
        return;
    }

    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/fortune-wheel", {
            method: "DELETE",
            body: indexies,
        });

        wheelItems.value = transformFn(await $fetch("/api/dashboard/fortune-wheel"));

        toast.success("Fortune wheel items deleted", { autoClose: 1000 });
        isDeleteModalOpen.value = false;
        isDeleteSelectedItemsModal.value = false;
    } catch (error) {
        toast.error("Failed to delete fortune wheel items: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

function deleteItem(itemIndex: number): Promise<void> {
    return deleteItems([itemIndex]);
}

function deleteSelectedItems(): Promise<void> {
    return deleteItems(wheelItems.value?.filter(item => item.selected).map(item => item.item.index) ?? []);
}

// Table
function selectAllItems(checked: boolean): void {
    for (const item of wheelItems.value!) {
        item.selected = checked;
    }
}
</script>

<template>
  <div class="flex flex-col grow drawer-content">
    <h3 class="text-lg font-bold">
      Fortune Wheel
    </h3>

    <div class="card card-bordered grow mt-5 bg-base-100">
      <div class="card-body p-0">
        <!-- Table header -->
        <div class="flex items-center justify-between px-5 pt-5">
          <div class="inline-flex items-center gap-3" />

          <div class="inline-flex items-center gap-3">
            <button
              class="btn hidden sm:flex btn-sm btn-primary"
              @click="openNewModal"
            >
              <Icon
                name="mdi:plus"
                size="16"
              />
              <span>New Item</span>
            </button>

            <button
              class="btn flex btn-sm btn-error"
              :disabled="isLoading"
              @click="openDeleteSelectedModal"
            >
              <Icon
                name="mdi:minus"
                size="16"
              />
              <span>Delete Items</span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <DashboardTable
          :columns="['Index', 'Title', 'Type', 'Reward', 'Chance', 'Action']"
          :selectable="true"
          @all-selected="selectAllItems"
        >
          <tr
            v-for="itemInfo in wheelItems"
            :key="itemInfo.item.index"
            class="cursor-pointer hover:bg-base-200/40"
          >
            <th>
              <input
                v-model="itemInfo.selected"
                type="checkbox"
                class="checkbox checkbox-xs"
              />
            </th>

            <!-- Index -->
            <td>
              <div class="font-medium">
                {{ itemInfo.item.index }}
              </div>
            </td>

            <!-- Title -->
            <td>
              <div class="flex items-center space-x-3 truncate">
                <div class="font-medium">
                  {{ itemInfo.item.title }}
                </div>
              </div>
            </td>

            <!-- Type -->
            <td>
              <div class="font-medium">
                {{ itemInfo.item.type }}
              </div>
            </td>

            <!-- Reward -->
            <td>
              <div class="text-sm font-medium">
                {{ itemInfo.item.rewardBalance?.toLocaleString("en-US") ?? itemInfo.item.rewardCharges?.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Chance -->
            <td>
              <div class="text-sm font-medium">
                {{ itemInfo.item.chance }}
              </div>
            </td>

            <!-- Action -->
            <td>
              <div class="inline-flex w-fit">
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  @click="openEditModal(itemInfo.item)"
                >
                  <Icon
                    class="text-base-content/70"
                    name="mdi:pencil-outline"
                    size="20"
                  />
                </button>

                <button
                  class="btn text-error/70 hover:bg-error/20 btn-sm btn-square btn-ghost"
                  @click="openDeleteModal(itemInfo.item)"
                >
                  <Icon
                    name="ic:round-delete-outline"
                    size="20"
                  />
                </button>
              </div>
            </td>
          </tr>
        </DashboardTable>
      </div>
    </div>

    <DashboardModal v-model="isModalOpen">
      <h2 class="card-title text-lg font-bold mb-4">
        {{ isNewItemModal ? "New Item" : "Edit Item" }}
      </h2>

      <form @submit.prevent="editOrAddWheelItem">
        <!-- ID -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="id"
          >
            <span class="label-text">ID</span>
          </label>
          <input
            id="id"
            v-model="selectedItem.id"
            type="number"
            placeholder="Enter ID"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Index -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="index"
          >
            <span class="label-text">Index</span>
          </label>
          <input
            id="index"
            v-model="selectedItem.index"
            type="number"
            placeholder="Enter Index"
            class="input input-bordered"
          />
        </div>

        <!-- Title -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="title"
          >
            <span class="label-text">Title</span>
          </label>
          <input
            id="title"
            v-model="selectedItem.title"
            type="text"
            placeholder="Enter Title"
            class="input input-bordered"
          />
        </div>

        <!-- Chance -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="chance"
          >
            <span class="label-text">Chance</span>
          </label>
          <input
            id="chance"
            v-model="selectedItem.chance"
            type="number"
            placeholder="Enter Chance"
            class="input input-bordered"
          />
        </div>

        <!-- Type -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="type"
          >
            <span class="label-text">Item Type</span>
          </label>
          <select
            id="type"
            v-model="selectedItem.type"
            class="select select-bordered"
          >
            <option value="nothing">
              Nothing
            </option>
            <option value="balance">
              Balance
            </option>
            <option value="energy_replenishment">
              Energy Replenishment
            </option>
          </select>
        </div>

        <!-- Balance Field -->
        <div
          v-if="showBalanceField"
          class="form-control mb-4"
        >
          <label
            class="label"
            for="balance"
          >
            <span class="label-text">Balance</span>
          </label>
          <input
            id="balance"
            v-model="selectedItem.rewardBalance"
            type="number"
            placeholder="Enter balance"
            class="input input-bordered"
          />
        </div>

        <!-- Charges Field -->
        <div
          v-if="showChargesField"
          class="form-control mb-4"
        >
          <label
            class="label"
            for="charges"
          >
            <span class="label-text">Charges</span>
          </label>
          <input
            id="charges"
            v-model="selectedItem.rewardCharges"
            type="number"
            placeholder="Enter Charges"
            class="input input-bordered"
          />
        </div>

        <!-- Submit Button -->
        <div class="form-control">
          <button
            type="submit"
            class="btn btn-primary"
          >
            {{ isNewItemModal ? "Add" : "Save" }}
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Delete Confirm Modal -->
    <DashboardConfirmModal
      v-model="isDeleteModalOpen"
      :title="'Delete ' + selectedItem.title + '?'"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteItem(selectedItem.index)"
    />

    <!-- Delete Selected Confirm Modal -->
    <DashboardConfirmModal
      v-model="isDeleteSelectedItemsModal"
      title="Delete selected items?"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteSelectedItems"
    />
  </div>
</template>

<style>

</style>
