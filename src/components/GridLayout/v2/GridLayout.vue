<template>
  <div class="grid__layout" :style="containerStyle">
    <grid-layout-item
      v-for="item in layout.items"
      :key="item.id"
      :item="item"
      :editable="editable"
      :movable="selectedItemId === null || item.id === selectedItemId"
      :preview="previewAllowed && previewId === item.id"
      @moveStart="onMoveStart"
      @move="onMove"
      @moveEnd="onMoveEnd"
      @delete="onDelete"
      @resize="onResize"
      @unpin="onUnpin"
      @endPreview="$emit('endPreview')"
    >
      <slot v-bind="{ ...item.extraData, id: item.id }"></slot>
    </grid-layout-item>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import GridLayoutItem from '@/components/GridLayout/v2/GridLayoutItem.vue';
import { identifier } from '@/store/projectData';
import { columns, rows, unit } from '@/utils/responsive';
import { generateGridLayout } from '@/utils/grid.v2';
import {
  Axis,
  Dimensions,
  GridItem,
  GridLayoutData,
} from '@/utils/grid.v2/types';
import { Vector2 } from '@/utils/gestures';
import { BorderEditData } from '@/utils/grid';

interface GridLayoutProps {
  items?: Partial<GridItem>[];
  rows?: number;
  columns?: number;
  marginX?: number;
  marginY?: number;
  axis?: Axis;
  reservedSpace?: Dimensions[];
  staticLayout?: {
    data: GridLayoutData;
    items: (Partial<GridItem> & { id: identifier })[];
  };
  editable?: boolean;
  allowDelete?: boolean;
  previewAllowed?: boolean;
  previewId?: identifier;
  fillAvailable?: boolean;
  bottomPadding?: boolean;
}

const props = withDefaults(defineProps<GridLayoutProps>(), {
  rows: rows(),
  columns: columns(),
  gap: unit(),
  marginX: 1,
  marginY: 0,
  axis: 'x',
  fillAvailable: false,
  bottomPadding: false,
});

const selectedItemId = ref<identifier | null>(null);
const lastSelectedItemId = ref<identifier | null>(null);
const moving = ref(false);
const lastAction = ref<'move' | 'resize' | 'delete' | null>(null);
const selectedItemWasPinned = ref(false);

const emit = defineEmits([
  'layout',
  'firstLayout',
  'resize',
  'deleteItem',
  'endPreview',
]);

const normalizeItems = (items: Partial<GridItem>[]) =>
  items.map((item, index) => ({
    ...item,
    id: item.id ?? 'grid__item__' + index,
  }));

const internalItems = ref(
  props.staticLayout
    ? props.staticLayout.items
    : props.items
    ? normalizeItems(props.items)
    : []
);

console.log(props);

const layout = computed(() =>
  props.staticLayout
    ? props.staticLayout.data
    : generateGridLayout(internalItems.value, props)
);

const onMoveStart = (itemId: identifier) => {
  selectedItemId.value = itemId;
  moving.value = true;
};

const onMoveEnd = () => {
  lastSelectedItemId.value = selectedItemId.value;
  moving.value = false;
  selectedItemId.value = null;
  selectedItemWasPinned.value = false;
};

const unpinItem = (item: Partial<GridItem>) => {
  item.x = undefined;
  item.y = undefined;
};

const findItem = (itemId: identifier) =>
  internalItems.value.find((item) => item.id === itemId);

const onMove = (itemId: identifier, position: Vector2) => {
  const item = findItem(itemId);
  if (!item) return;
  const limitX =
    props.axis === 'x' ? Infinity : props.columns - (item.width ?? 0);
  const limitY =
    props.axis === 'y' ? Infinity : props.rows - (item.height ?? 0);
  item.x = Math.min(Math.max(position.x, 0), limitX);
  item.y = Math.min(Math.max(position.y, 0), limitY);
  lastAction.value = 'move';
};

const onDelete = (itemId: identifier) => {
  const item = internalItems.value.find((item) => item.id === itemId);
  if (!item) return;
  const itemIndex = internalItems.value.indexOf(item);
  if (itemIndex < 0) return;
  internalItems.value.splice(itemIndex, 1);
  emit('deleteItem', itemId);
};

const onResize = (itemId: identifier, borders: BorderEditData) => {
  const item = internalItems.value.find((item) => item.id === itemId);
  const positionedItem = layout.value.items.find((item) => item.id === itemId);
  if (!item || !positionedItem) return;
  lastAction.value = 'resize';

  // pin item to current position before resizing
  selectedItemWasPinned.value = !!positionedItem.isPinned;
  item.x = positionedItem.x;
  item.y = positionedItem.y;

  const b = Object.entries(borders);
  b.forEach(([side, value]) => {
    switch (side) {
      case 'bottom': {
        const limit =
          props.axis === 'y' ? Infinity : props.rows - positionedItem.y;
        item.height = Math.min(Math.max(value, 1), limit);
        break;
      }
      case 'top': {
        const limit =
          props.axis === 'y' ? Infinity : props.rows - positionedItem.y;
        item.y = Math.max(positionedItem.y + (item.height ?? 1) - value, 0);
        item.height = Math.min(Math.max(value, 1), limit);
        break;
      }
      case 'right': {
        const limit =
          props.axis === 'x' ? Infinity : props.columns - positionedItem.x;
        item.width = Math.min(Math.max(value, 1), limit);
        break;
      }
      case 'left': {
        const limit =
          props.axis === 'x'
            ? Infinity
            : Math.min(positionedItem.width + positionedItem.x, props.columns);
        item.x = Math.max(positionedItem.x + (item.width ?? 1) - value, 0);
        item.width = Math.max(Math.min(value, limit), 1);
        break;
      }
    }
  });
};

const onUnpin = (itemId: identifier) => {
  const item = findItem(itemId);
  if (!item) return;
  unpinItem(item);
};

const containerStyle = computed(() => ({
  ...layout.value.layoutDimensions,
  gridRowStart: '1',
  gridColumnStart: '1',
  gridRowEnd: 'span ' + layout.value.matrixSize.width,
  gridColumnEnd: 'span ' + layout.value.matrixSize.height,
}));

emit('firstLayout', layout.value);
watch(layout, (l) => {
  emit('layout', l);
});

watch(
  () => layout.value.matrixSize,
  (s) => {
    emit('resize', s);
  }
);

watch(
  () => props.items,
  (i) => {
    if (i) {
      internalItems.value = normalizeItems(i);
    }
  }
);
</script>

<style scoped lang="sass">
.grid__layout
  min-width: max-content
  min-height: max-content
  position: relative
  color: $c-white
</style>
