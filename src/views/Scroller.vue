<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import Locomotive from 'locomotive-scroll';
import { onMounted, nextTick } from '@vue/runtime-dom';

let scroll: { update: () => void };

const mainRef = ref<HTMLElement | null>(null);

const initLocomotive = () => {
  if (mainRef.value) {
    console.log(mainRef.value);
    nextTick(() => {
      scroll = new Locomotive({
        el: mainRef.value,
        smooth: true,
        smoothMobile: true,
        getDirection: true,
        getSpeed: true,
        direction: 'horizontal',
        gestureDirection: 'both',
      });
    });
  }
};

onMounted(() => {
  initLocomotive();
});
</script>

<template>
  <div id="scroller" ref="mainRef" data-scroll-container>
    <slot></slot>
  </div>
</template>

<style lang="sass" scoped>
div#scroller
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  z-index: 1
  display: flex
</style>
