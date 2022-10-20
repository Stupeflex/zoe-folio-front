<template>
  <div id="grid__overlay" v-if="show">
    <template v-if="showCols">
      <div
        :class="`grid__column c${c}`"
        v-for="c in colCount"
        :key="'col' + c"
      ></div>
    </template>
    <template v-if="showRows">
      <div
        :class="`grid__row r${r}`"
        v-for="r in rowCount"
        :key="'row' + r"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useGradientData } from '@/store/gradientData';
import { generateRandomHexColor } from '@/utils/gradient';
import { columns, rows } from '@/utils/responsive';

const gradientData = useGradientData();

const show = ref<boolean>(false);
const showRows = ref<boolean>(false);
const showCols = ref<boolean>(true);

const rowCount = ref(rows());
const colCount = ref(columns());

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

const onResize = () => {
  rowCount.value = rows();
  console.log(rowCount.value);
  colCount.value = columns();
};

onMounted(() => {
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', onResize);
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
  grid-template-columns: repeat($columns, 1fr)
  grid-template-rows: repeat($rows, 1fr)
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
  @for $i from 0 through 19
    &.c#{$i}
      grid-column: $i / span 1

.grid__row
  background: rgba(255, 255, 255, 0.1)
  // height: 100%
  // width: 100%
  grid-column: 1 / -1

  @for $i from 1 through 18
    &.r#{$i}
      grid-row: $i / span 1
</style>
