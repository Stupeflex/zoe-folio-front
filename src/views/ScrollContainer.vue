<script lang="ts" setup>
import { ref } from 'vue';
import { onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useScrollData } from '@/store/scrollData';

const scrollData = useScrollData();

interface ScrollerProps {
  direction?: 'horizontal' | 'vertical';
  dependencies?: any;
  delay?: number;
}

const props = withDefaults(defineProps<ScrollerProps>(), {
  direction: 'horizontal',
});

const mainRef = ref<HTMLElement | null>(null);

const initLocomotive = () => {
  if (mainRef.value) {
    // document.addEventListener('DOMContentLoaded', () => {
    console.log(props.direction);
    scrollData.init({
      el: mainRef.value,
      smooth: true,
      getDirection: true,
      getSpeed: true,
      direction: props.direction,
      gestureDirection:
        props.direction === 'vertical' ? props.direction : 'both',
      reloadOnContextChange: true,
      repeat: true,
      scrollFromAnywhere: true,
      smartphone: {
        smooth: true,
        direction: props.direction,
        gestureDirection: props.direction,
      },
      lerp: 0.05,
    });

    nextTick(() => {
      setTimeout(() => {
        console.log('update scroll');
        scrollData.update();
      }, 300);
    });
  }
};
if (props.dependencies) {
  watch(
    () => props?.dependencies,
    () => {
      console.log('scroller dependency changed');
      if (scrollData.scroller) {
        setTimeout(() => {
          console.log('update scroll');
          scrollData.update();
        }, 300);
      }
    }
  );
}

// setupUpdateDeps();

onMounted(() => {
  console.log('onMounted scroller');
  if (props.delay) {
    setTimeout(initLocomotive, props.delay);
  } else {
    initLocomotive();
  }
  // setupUpdateDeps();
});

onBeforeUnmount(() => {
  if (scrollData.scroller) {
    console.log('destroy scroll');
    scrollData.destroy();
  }
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
  //display: flex
  //flex-direction: row
  //gap: calc($cell-width * 2 + $unit)
</style>
