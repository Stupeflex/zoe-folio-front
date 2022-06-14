<template>
  <div id="grid__overlay" v-if="show">
    <template v-if="showCols">
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
      <div class="grid__column"></div>
    </template>
    <template v-if="showRows">
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
      <div class="grid__row"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useGradientData } from '@/store/gradientData';
import { generateRandomHexColor } from '@/utils/gradient';

const gradientData = useGradientData();

const show = ref<boolean>(false);
const showRows = ref<boolean>(false);
const showCols = ref<boolean>(false);

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'g' || e.key === 'G') {
    console.log('toggle grid');
    show.value = !show.value;
  }
  if (e.key === 'r' || e.key === 'R') {
    showRows.value = !showRows.value;
    if (showRows.value && !show.value) {
      show.value = true;
    }
  }
  if (e.key === 'c' || e.key === 'C') {
    showCols.value = !showCols.value;
    if (showCols.value && !show.value) {
      show.value = true;
    }
  }
  if (e.key === '@') {
    const colors = Array(5)
      .fill('')
      .map((_v) => generateRandomHexColor());
    console.log(colors);
    gradientData.setColors(colors, true);
    console.log(gradientData.uniforms);
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
});
</script>

<style lang="sass" scoped>
#grid__overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  display: grid
  grid-template-columns: repeat(19, 1fr)
  grid-template-rows: repeat(12, 1fr)
  gap: $unit
  padding: $unit
  pointer-events: none
  user-select: none
  z-index: 1000


.grid__column
  grid-row: 1 / -1
  // height: 100%
  // width: 100%
  background: rgba(255, 255, 255, 0.1)
  @for $i from 1 through 19
    &:nth-child(#{$i})
      grid-column: $i / span 1

.grid__row
  background: rgba(255, 255, 255, 0.1)
  // height: 100%
  // width: 100%
  grid-column: 1 / -1

  @for $i from 1 through 12
    &:nth-child(#{$i + 19})
      grid-row: $i / span 1
</style>
