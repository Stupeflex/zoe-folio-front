<template>
  <div id="grid__overlay" v-if="show">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const show = ref<boolean>(true);

const onKey = (e: KeyboardEvent) => {
  console.log(e.key);
  if (e.key === 'g' || e.key === 'G') {
    console.log('toggle grid');
    show.value = !show.value;
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
  gap: $unit
  padding: 0 $unit
  pointer-events: none
  user-select: none
  z-index: 1000


.grid__column
  height: 100%
  width: 100%
  background: rgba(255, 255, 255, 0.1)
</style>
