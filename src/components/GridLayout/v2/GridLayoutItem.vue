<script setup lang="ts">
import {
  getItemDimensions,
  GridItemWithPosition,
  screenToGrid,
} from '@/utils/grid';
import { computed, reactive, ref, watch } from 'vue';
import { useMouseData } from '@/store/mouseData';
import { Vector2 } from '@/utils/gestures';
import { useScrollData } from '@/store/scrollData';
import { formatCssTranslate } from '@/utils/format';
import {
  cellHeight,
  cssCellHeight,
  cssCellWidth,
  cssUnit,
  unit,
} from '@/utils/responsive';
import { useResponsiveData } from '@/store/responsiveData';
import { formatItemStyle } from '@/utils/grid.v2/layout';
import { Border, borders, corners } from '@/utils/grid.v2/types';

const mouseData = useMouseData();
const scrollData = useScrollData();
const responsiveData = useResponsiveData();

const props = defineProps<{
  item: GridItemWithPosition;
  editable?: boolean;
  allowDelete?: boolean;
  movable?: boolean;
  preview?: boolean;
}>();

const emit = defineEmits([
  'move',
  'moveStart',
  'moveEnd',
  'delete',
  'resize',
  'unpin',
  'endPreview',
]);

const activeBorders = reactive({
  top: false,
  bottom: false,
  left: false,
  right: false,
});

const activeBorderNames = computed(() =>
  Object.entries(activeBorders)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, v]) => v)
    .map(([s]) => s as Border)
);

const mouseDown = ref(false);
const mouseDownPos = reactive({
  x: 0,
  y: 0,
});

const mouseDragDistance = reactive({
  x: 0,
  y: 0,
});

const transformOffset = reactive({
  x: 0,
  y: 0,
});

const sizeOffset = reactive({
  width: 0,
  height: 0,
});

const gridDelta = ref({
  x: 0,
  y: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

const preMovePosition = reactive({
  x: props.item.x,
  y: props.item.y,
});

const preMoveSize = reactive({
  height: props.item.height,
  width: props.item.width,
});

const dimensions = computed(() => getItemDimensions(props.item));

const cursor = computed(() => {
  const b = Object.entries(activeBorders)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, v]) => v)
    .map(([s]) => s);
  if (props.editable && props.movable) {
    if (b.length === 1) {
      switch (b[0]) {
        case 'top':
        case 'bottom':
          return 'row-resize';
        case 'left':
        case 'right':
          return 'col-resize';
      }
    }
    if (b.length === 2) {
      if (
        (b.includes('top') && b.includes('right')) ||
        (b.includes('bottom') && b.includes('left'))
      ) {
        return 'nesw-resize';
      } else {
        return 'nwse-resize';
      }
    }
    return 'move';
  }
  return 'default';
});

const previewStyle = computed(() => {
  const transform = formatCssTranslate({
    y: `calc(${scrollData.scrollPos.y}px - ${cssCellHeight(0.5)} - ${cssUnit(
      3
    )} - ${cssCellHeight(responsiveData.rows - 2)} + ${
      responsiveData.navHeight
    }px)`,
    x:
      responsiveData.breakpoint === 'mobile'
        ? cssUnit(-1)
        : `calc(${cssCellWidth(-1, true)} - ${cssUnit(2)})`,
  });
  const width = `calc(${cssCellWidth(responsiveData.columns)} + ${cssUnit(2)})`;
  const height = `calc(100vh - ${responsiveData.navHeight}px)`;
  return {
    transform,
    width,
    height,
  };
});

const fixTransform = ref(false);
const onTop = ref(false);
const doPreview = ref(false);
const forcePreview = ref(false);

watch(
  () => props.preview,
  (next, prev) => {
    if (!prev && next) {
      onTop.value = true;
      setTimeout(() => {
        fixTransform.value = true;
      }, 600);
    }
    if (prev && !next) {
      fixTransform.value = false;
    }
    if (scrollData.scrollPos.y < window.innerHeight / 2) {
      forcePreview.value = true;
    }
    doPreview.value = !!next;
  }
);

watch(doPreview, (next, prev) => {
  if (!prev && next) {
    onTop.value = true;
  }
  if (prev && !next) {
    setTimeout(() => {
      onTop.value = false;
    }, 600);
  }
});

const style = computed(() => {
  const s = doPreview.value
    ? previewStyle.value
    : formatItemStyle(dimensions.value, transformOffset, sizeOffset);
  return {
    ...s,
    cursor: cursor.value,
  };
});

const setActiveBorder = (borders: Border[] | Border, weight: boolean) => {
  if (!mouseDown.value) {
    if (Array.isArray(borders)) {
      borders.forEach((border) => {
        activeBorders[border] = weight;
      });
    } else {
      activeBorders[borders] = weight;
    }
  }
};

const onMouseDown = (e: PointerEvent | MouseEvent) => {
  if (props.editable && props.movable) {
    emit('moveStart', props.item.id);
    fixTransform.value = true;
    mouseDown.value = true;
    mouseDownPos.x = e.clientX;
    mouseDownPos.y = e.clientY;
    preMovePosition.x = props.item.x;
    preMovePosition.y = props.item.y;
    preMoveSize.height = props.item.height;
    preMoveSize.width = props.item.width;
  }
};

const onMouseUp = (pos: Vector2) => {
  transformOffset.x = 0;
  transformOffset.y = 0;
  sizeOffset.width = 0;
  sizeOffset.height = 0;
  mouseDownPos.x = pos.x;
  mouseDownPos.y = pos.y;
  setActiveBorder([...borders], false);
  if (mouseDown.value && props.editable && props.movable) {
    mouseDown.value = false;
    fixTransform.value = false;

    const b = Object.entries(activeBorders)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, v]) => v)
      .map(([s]) => s);
    if (b.length === 0) {
      emit('move', props.item.id, gridDelta.value);
    }
    if (b.length === 1) {
      emit('resize', props.item.id, {
        [b[0]]: gridDelta.value[b[0] as Border],
      });
    }
    if (b.length === 2) {
      b.forEach((side) => {
        emit('resize', props.item.id, {
          [side]: gridDelta.value[side as Border],
        });
      });
    }
    emit('moveEnd');
  }
};

const onMouseMove = (pos: Vector2) => {
  if (mouseDown.value) {
    const delta = {
      x: pos.x - mouseDownPos.x,
      y: pos.y - mouseDownPos.y,
    };
    mouseDragDistance.x = delta.x;
    mouseDragDistance.y = delta.y;
    if (props.editable && props.movable) {
      if (activeBorderNames.value.length === 0) {
        transformOffset.x = delta.x;
        transformOffset.y = delta.y;
      }
      if (activeBorderNames.value.length > 0) {
        if (activeBorderNames.value.includes('top')) {
          transformOffset.y = delta.y;
          sizeOffset.height = -delta.y;
        }
        if (activeBorderNames.value.includes('bottom')) {
          sizeOffset.height = delta.y;
        }
        if (activeBorderNames.value.includes('left')) {
          transformOffset.x = delta.x;
          sizeOffset.width = -delta.x;
        }
        if (activeBorderNames.value.includes('right')) {
          sizeOffset.width = delta.x;
        }
      }
      const gridDistance = screenToGrid(mouseDragDistance);
      gridDelta.value = {
        x: preMovePosition.x + gridDistance.x,
        y: preMovePosition.y + gridDistance.y,
        right: preMoveSize.width + gridDistance.x,
        bottom: preMoveSize.height + gridDistance.y,
        top: preMoveSize.height - gridDistance.y,
        left: preMoveSize.width - gridDistance.x,
      };
    }
  }
};

mouseData.$subscribe((mutation, state) => {
  onMouseMove(state.mousePos);
});

watch(
  () => mouseData.mouseDown,
  (isDown) => {
    if (!isDown) {
      onMouseUp(mouseData.mousePos);
    }
  }
);

watch(scrollData.scrollPos, (pos) => {
  const half = window.innerHeight / 2;
  const scrolledToEnd =
    pos.y < half || pos.y > scrollData.limit.y - cellHeight() * 3 - unit() * 3;
  if (scrolledToEnd && !forcePreview.value && doPreview.value) {
    doPreview.value = false;
    emit('endPreview');
  }
  if (forcePreview.value && pos.y >= half) {
    forcePreview.value = false;
  }
});
</script>

<template>
  <article
    :class="{
      grid__item: true,
      editable: editable,
      hovering: mouseDown,
      preview: doPreview,
      'fix-transform': fixTransform,
      'on-top': onTop,
    }"
    :style="style"
    @mousedown="onMouseDown"
    @pointerdown="onMouseDown"
  >
    <template v-if="editable">
      <div
        v-for="side in borders"
        :key="side"
        :class="{ grid__item__border: true, ['border__' + side]: true }"
        @mouseover="setActiveBorder(side, true)"
        @mouseout="setActiveBorder(side, false)"
      ></div>
      <div
        v-for="corner in corners"
        :key="corner.join('-')"
        :class="`grid__item__corner corner__${corner.join('__')}`"
        @mouseover="setActiveBorder(corner, true)"
        @mouseout="setActiveBorder(corner, false)"
      ></div>
      <span class="grid__item__id"
        >{{ item.id }} <em v-if="item.isPinned"><br />pinned</em></span
      >
      <button
        v-if="allowDelete"
        class="grid__item__delete hover__underline"
        @click="$emit('delete', item.id)"
      >
        Delete
      </button>

      <button
        v-if="item.isPinned"
        class="grid__item__unpin hover__underline"
        @click="$emit('unpin', item.id)"
      >
        Unpin
      </button>
    </template>
    <slot></slot>
  </article>
</template>

<style lang="sass" scoped>
.grid__item
  position: absolute
  top: 0
  left: 0
  z-index: 1
  opacity: 1
  transition: box-shadow 0.6s $bezier 0s, transform 0.6s $bezier 0s, height 0.6s $bezier 0s, width 0.6s $bezier 0s, padding 0.3s $bezier 0s

  &.fix-transform
    transition: box-shadow 0.6s $bezier 0s, transform 0s $bezier 0s, height 0.6s $bezier 0s, width 0.6s $bezier 0s, padding 0.3s $bezier 0s

  &.on-top
    z-index: 99

  &.preview
    padding: $unit

  &.blur
    opacity: 0.7
    filter: blur(20px)

  &.editable
    @include blur-bg
    border: 1px solid $c-grey
    border-radius: $unit-h
    transition: box-shadow 0.6s $bezier 0s, transform 0.3s $bezier 0s, height 0.3s $bezier 0s, width 0.3s $bezier 0s

    &.fix-transform
      transition: box-shadow 0.6s $bezier 0s, transform 0s $bezier 0s, height 0s $bezier 0s, width 0s $bezier 0s

    &.hovering
      z-index: 10
      box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4)

    .grid__item__corner
      height: $unit
      width: $unit

    .grid__item__border, .grid__item__corner
      position: absolute
      transition: all 0.3s $bezier 0s
      z-index: 100
      pointer-events: all

      &.border__top
        left: 0
        right: 0
        top: 0
        height: $unit-h

      &.border__bottom
        left: 0
        right: 0
        bottom: 0
        height: $unit-h

      &.border__left
        left: 0
        bottom: 0
        top: 0
        width: $unit-h

      &.border__right
        bottom: 0
        right: 0
        top: 0
        width: $unit-h

      &.corner__top__right
        top: 0
        right: 0

      &.corner__top__left
        top: 0
        left: 0

      &.corner__bottom__left
        bottom: 0
        left: 0

      &.corner__bottom__right
        bottom: 0
        right: 0

      &:hover
        background-color: rgba(255, 255, 255, .5)

    .grid__item__delete, .grid__item__unpin
      @include body
      position: absolute
      right: $unit
      color: $c-white
      cursor: pointer
      z-index: 11
      pointer-events: all

    .grid__item__delete
      top: $unit

    .grid__item__unpin
      bottom: $unit

    .grid__item__id
      @include detail
      position: absolute
      left: $unit
      top: $unit
      color: $c-white
</style>
