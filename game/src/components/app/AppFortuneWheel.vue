<script lang="ts" setup>
const props = defineProps<{
    items: { title: string; icon?: string }[];
    disabled?: boolean;
    startCallback: () => (number | null) | Promise<number | null>;
}>();

const emit = defineEmits<{
    animationFinish: [itemIndex: number];
}>();

const icons: Record<string, string> = useIconsAssets();

const isSpinning = ref<boolean>(false);
const wheelRef = ref<HTMLElement | null>(null);

const animation = ref<Animation | null>(null);
const previousEndDegree = ref<number>(0);

function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

async function spinWheelOfFortune(): Promise<void> {
    if (props.disabled) {
        return;
    }

    isSpinning.value = true;

    const targetIndex: number | null = await props.startCallback();
    if (targetIndex === null) {
        isSpinning.value = false;
        return;
    }

    if (animation.value) {
        animation.value.cancel(); // Reset the animation if it already exists
    }

    const modifire: number = targetIndex + getRandomArbitrary(-0.4, 0.4);
    const randomAdditionalDegrees: number = ((modifire / props.items.length) * -360) + (360 * 5); // 5 is count of spins
    const newEndDegree: number = previousEndDegree.value + randomAdditionalDegrees;

    animation.value = wheelRef.value!.animate(
        [
            { transform: `rotate(${previousEndDegree.value}deg)` },
            { transform: `rotate(${newEndDegree}deg)` },
        ],
        {
            duration: 4000,
            direction: "normal",
            easing: "cubic-bezier(0.440, -0.205, 0.000, 1.130)",
            fill: "forwards",
            iterations: 1,
        },
    );

    animation.value.onfinish = (): void => {
        isSpinning.value = false;
        emit("animationFinish", targetIndex);
    };

    // previousEndDegree.value = newEndDegree;
}

onMounted(() => {
    if (props.items.length < 4) {
        return;
    }

    const startPoint: number = 90;
    previousEndDegree.value = startPoint;
    wheelRef.value!.style.transform = `rotate(${startPoint}deg)`;
});
</script>

<template>
  <div
    v-if="items.length >= 4"
    class="p-4 rounded-full circle-outer"
  >
    <fieldset
      class="ui-wheel-of-fortune"
      :class="{
        'cursor-pointer': !disabled,
      }"
      @click="spinWheelOfFortune"
    >
      <ul ref="wheelRef">
        <li
          v-for="(item, index) in items"
          :key="item.title"
          :style="[
            `--rotate: calc(360deg / ${items.length} * calc(${index + 1} - 1))`,
            `aspect-ratio: 1 / calc(2 * tan(180deg / ${items.length}));`,
            `rotate: var(--rotate)`,
          ]"
        >
          <div class="flex items-center gap-2 w-[80%]">
            <img
              v-if="item.icon !== undefined"
              class="object-contain h-6 pointer-events-none"
              :src="icons[item.icon]"
            />
            <span
              class="font-bold"
              :class="{
                'text-2xl': item.title.length < 8,
                'text-xl': item.title.length >= 8 && item.title.length < 15,
                'text-lg': item.title.length >= 15 && item.title.length < 20,
                'text-sm': item.title.length >= 20,
              }"
            >
              {{ item.title }}
            </span>
          </div>
        </li>
      </ul>
      <button
        type="button"
        :disabled="isSpinning || disabled"
        @click="spinWheelOfFortune"
      >
        <span class="text-xl font-bold text-slate-600">SPIN</span>
      </button>
    </fieldset>
  </div>

  <div v-else>
    <span class="text-2xl font-extrabold pb-1">Fortune wheel must have at least 4 items</span>
  </div>
</template>

<style scoped>
.circle-outer {
  background: linear-gradient(to bottom, #575def, #202731);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90vw;
  height: 90vw;
  max-width: 490px;
  max-height: 490px;
}

.ui-wheel-of-fortune {
    border: 4px solid #282e3e;
    border-radius: 50%;
    background: radial-gradient(circle, #4960b2, #282e3e);
}

:where(.ui-wheel-of-fortune) {
  all: unset;
  aspect-ratio: 1 / 1;
  container-type: inline-size;
  direction: ltr;
  display: grid;
  position: relative;
  width: 100%;

  /* Indicator */
  &::after {
    aspect-ratio: 1/cos(30deg);
    background-color: #000;
    clip-path: polygon(50% 100%, 100% 0, 0 0);
    content: "";
    height: 4cqi;
    position: absolute;
    place-self: start center;
    scale: 1.4;
  }

  & > * { position: absolute; }

  button {
    aspect-ratio: 1 / 1;
    background: #eec855;
    border: 8px solid #b07a14;
    border-radius: 50%;
    cursor: pointer;
    font-size: 5cqi;
    place-self: center;
    width: 22cqi;
    display: block;

    &:disabled {
      opacity: 0.5;
        cursor: not-allowed;
    }
  }

  ul {
    all: unset;
    clip-path: inset(0 0 0 0 round 50%);
    display: grid;
    inset: 0;
    place-content: center start;

    li {
      align-content: center;
      clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
      display: grid;
      font-size: 5cqi;
      grid-area: 1 / -1;
      padding-left: 1ch;
      transform-origin: center right;
      user-select: none;
      width: 50cqi;
      background: linear-gradient(to left, #b30909, #9b0808);

      /* Border */
      &::before {
        content: '';
        width: 100%;
        height: 100%;
        background: #282e3e;
        display: block;
        position: absolute;
        top: 0px;
        left: 0px;
        clip-path: polygon(0% 0%, 100% 50%, 0% 4%);
        transform: inherit;
      }

      &:nth-child(odd) {
        background: linear-gradient(to left, #b30909, #9b0808);
        /* background: radial-gradient(circle, #b30909, #282e3e); */
      }

      &:nth-child(even) {
        background: linear-gradient(to left, #ffb924, #af7f18);
        /* background: radial-gradient(circle, #ffb924, #282e3e); */
      }
    }
  }
}
</style>
