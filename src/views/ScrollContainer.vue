<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useScrollData } from '@/store/scrollData';

const scrollData = useScrollData();

interface ScrollerProps {
  direction?: 'horizontal' | 'vertical';
  dependencies?: unknown;
  delay?: number;
}

const props = withDefaults(defineProps<ScrollerProps>(), {
  direction: 'horizontal',
});

const mainRef = ref<HTMLElement | null>(null);
const hoveringScrollBar = ref<boolean>(false);
const dragStart = reactive({ x: 0, y: 0 });
const preDragPos = reactive({ x: 0, y: 0 });
const dragging = ref(false);

const initLocomotive = () => {
  if (mainRef.value) {
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
      scrollFromAnywhere: false,
      smartphone: {
        smooth: true,
        direction: props.direction,
        gestureDirection: props.direction,
      },
      tablet: {
        smooth: true,
        breakpoint: 1440,
        direction: props.direction,
        gestureDirection: props.direction,
      },
      lerp: 0.05,
      touchMultiplier: 3,
    });

    nextTick(() => {
      setTimeout(() => {
        scrollData.update();
      }, 300);
    });
  }
};
if (props.dependencies) {
  watch(
    () => props?.dependencies,
    () => {
      if (scrollData.scroller) {
        setTimeout(() => {
          scrollData.update();
        }, 300);
      }
    }
  );
}

// setupUpdateDeps();
onBeforeUnmount(() => {
  if (scrollData.scroller) {
    scrollData.destroy();
  }
});

const scrollIndicatorStyle = computed(() => {
  const isVertical = props.direction === 'vertical';
  const progress = scrollData.progress[isVertical ? 'y' : 'x'];
  const prop = isVertical ? 'height' : 'width';
  return {
    [prop]: `${progress * 100}%`,
  };
});

const onDragStart = (e: MouseEvent) => {
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  preDragPos.x = scrollData.progress.x;
  preDragPos.y = scrollData.progress.y;
  dragging.value = true;
};

const onDragEnd = (e: MouseEvent) => {
  dragging.value = false;
  onDragMove(e);
  hoveringScrollBar.value = false;
};

const onDragMove = (e: MouseEvent) => {
  if (!dragging.value) return;
  const isVertical = props.direction === 'vertical';
  const current = isVertical ? e.clientY : e.clientX;
  const dir = isVertical ? 'y' : 'x';
  const windowLength = isVertical ? window.innerHeight : window.innerWidth;
  const progress = (current - dragStart[dir]) / windowLength + preDragPos[dir];
  const limit = scrollData.limit[dir];
  const target = progress * limit;

  scrollData.scrollTo(target, { duration: 100 });
};

onMounted(() => {
  if (props.delay) {
    setTimeout(initLocomotive, props.delay);
  } else {
    initLocomotive();
  }

  window.addEventListener('pointerup', onDragEnd);
  window.addEventListener('pointercancel', onDragEnd);
  window.addEventListener('pointermove', onDragMove);
});

const onHoverLeave = () => {
  if (!dragging.value) {
    hoveringScrollBar.value = false;
  }
};
</script>

<template>
  <div id="scroll__container">
    <div id="scroller" ref="mainRef" data-scroll-container>
      <slot></slot>
    </div>
    <div
      id="scrollbar"
      :class="{ hovering: hoveringScrollBar }"
      :data-direction="direction"
      @mouseover="hoveringScrollBar = true"
      @mouseleave="onHoverLeave"
    >
      <div
        id="scrollbar__indicator"
        :style="scrollIndicatorStyle"
        @pointerdown="onDragStart"
      ></div>
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
  z-index: 100000
  bottom: 0
  right: 0
  transition: transform 0.3s $bezier 0s
  pointer-events: all

  &:before
    position: absolute
    content: ""
    right: 0
    bottom: 0
    height: 100%
    width: 100%
    background-color: rgba(255, 255, 255, .1)

  #scrollbar__indicator
    position: absolute
    height: 100%
    width: 100%
    @include blur-bg
    background-color: rgba(255, 255, 255, .5)
    transition: bottom 0.3s $bezier 0s, right 0.3s $bezier 0s, border-radius 0.3s $bezier 0s, background-color 0.3s $bezier 0s
    cursor: grab

  &[data-direction="horizontal"]
    left: 0
    width: 100%
    height: $unit
    transform-origin: center bottom

    &:before
      height: calc($unit / 4)
      bottom: 0

    #scrollbar__indicator
      height: $unit
      bottom: calc($unit * -0.75)
      transform-origin: left bottom
      min-width: $cell-width

  &[data-direction="vertical"]
    top: 0
    height: 100%
    width: calc($unit)
    transform-origin: right

    &:before
      width: calc($unit / 4)
      right: 0

    #scrollbar__indicator
      right: 0
      width: calc($unit / 4)
      transform-origin: right top
      min-height: $cell-height


#scrollbar.hovering > #scrollbar__indicator
  background-color: rgba(255, 255, 255, 0.6)

#scrollbar.hovering[data-direction="horizontal"] > #scrollbar__indicator
  bottom: 0
  border-top-right-radius: $unit

#scrollbar.hovering[data-direction="vertical"] > #scrollbar__indicator
  width: $unit
  border-bottom-left-radius: $unit
</style>
