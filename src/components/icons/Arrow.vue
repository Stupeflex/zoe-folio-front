<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  rotation?: number;
  flip?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rotation: 0,
  flip: false,
  size: 13,
});
const ratio = 13 / 10;
const height = props.size ?? 13 / ratio;

const style = computed(
  () =>
    `transform: rotate(${props.rotation}deg) scaleX(${props.flip ? -1 : 1});`
);
</script>

<template>
  <svg
    :width="size ?? 13"
    :height="height"
    viewBox="0 0 13 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
  >
    <path
      d="M12 0.833496V6.3335L1 6.3335M1 6.3335C2.22222 6.02794 4.66667 4.86683 4.66667 2.66683M1 6.3335C2.22222 6.63905 4.66667 7.80016 4.66667 10.0002"
      stroke="white"
      stroke-width="1.5"
    />
  </svg>
</template>
