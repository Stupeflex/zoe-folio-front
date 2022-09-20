<script lang="ts" setup>
import { computed, ref } from 'vue';
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

const scrollIndicatorStyle = computed(() => {
  const progress =
    scrollData.progress[props.direction === 'vertical' ? 'y' : 'x'];
  return {
    transform: `scaleX(${progress})`,
  };
});
</script>

<template>
  <div id="scroll__container">
    <div id="scroller" ref="mainRef" data-scroll-container>
      <slot></slot>
    </div>
    <div id="scrollbar" :data-direction="direction">
      <div id="scrollbar__indicator" :style="scrollIndicatorStyle"></div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
#scroll__container
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0

div#scroller
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  z-index: 1

#scrollbar
  position: fixed
  background-color: rgba(255, 255, 255, .1)
  bottom: 0
  left: 0
  z-index: 10
  height: calc($unit / 4)
  right: 0
  width: 100%

  #scrollbar__indicator
    height: 100%
    width: 100%
    transform: scaleX(0.01)
    @include blur-bg
    background-color: rgba(255, 255, 255, .3)
    transform-origin: left bottom
</style>
