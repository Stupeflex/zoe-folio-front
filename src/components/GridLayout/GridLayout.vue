<template>
  <div class="grid__layout" :style="containerStyle" @mouseup="onMoveEnd">
    <grid-layout-item
      v-for="item in layout.items"
      :key="item.id"
      :item="item"
      :editable="editable"
      :movable="movingId === null || item.id === movingId"
      :allowDelete="allowDelete"
      :preview="previewAllowed && previewId === item.id"
      @move="onMove"
      @moveStart="onMoveStart"
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
import {
  GridItem,
  generateGridLayout,
  BorderEditData,
  Axis,
  Dimensions,
  GridLayoutData,
} from '@/utils/grid';
import { computed, ref, watch } from 'vue';
import GridLayoutItem from '@/components/GridLayout/GridLayoutItem.vue';
import { identifier } from '@/store/projectData';
import { Vector2 } from '@/utils/gestures';
import { columns, rows, unit } from '@/utils/responsive';

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
}

const props = withDefaults(defineProps<GridLayoutProps>(), {
  rows: rows(),
  columns: columns(),
  gap: unit(),
  marginX: 0,
  marginY: 0,
  axis: 'x',
});

const emit = defineEmits(['layout', 'resize', 'deleteItem', 'endPreview']);

const movingId = ref<identifier | null>(null);
const lastEditedId = ref<identifier | null>(null);
const lastAction = ref<'move' | 'resize' | 'delete' | null>(null);

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
const layout = computed(() =>
  props.staticLayout
    ? props.staticLayout.data
    : generateGridLayout(internalItems.value, props)
);

const containerStyle = computed(() => ({
  ...layout.value.layoutDimensions,
  gridRowStart: '1',
  gridColumnStart: '1',
  gridRowEnd: 'span ' + layout.value.matrixSize.width,
  gridColumnEnd: 'span ' + layout.value.matrixSize.height,
}));

const onMoveStart = (itemId: identifier) => {
  movingId.value = itemId;
};

const onMoveEnd = () => {
  lastEditedId.value = movingId.value;
  movingId.value = null;
};

const unpinLastEditedItem = () => {
  const item = internalItems.value.find(
    (item) => item.id === lastEditedId.value
  );
  if (item) {
    switch (lastAction.value) {
      case 'resize':
        unpinItem(item);
        break;
    }
  }
};

const unpinItem = (item: Partial<GridItem>) => {
  item.x = undefined;
  item.y = undefined;
};

const findItem = (itemId: identifier) =>
  internalItems.value.find((item) => item.id === itemId);

const onMove = (itemId: identifier, position: Vector2) => {
  unpinLastEditedItem();
  const item = findItem(itemId);
  if (!item) return;
  const limitX =
    props.axis === 'y' ? Infinity : props.columns - (item.width ?? 0);
  const limitY =
    props.axis === 'x' ? Infinity : props.rows - (item.height ?? 0);
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
  item.x = positionedItem.x;
  item.y = positionedItem.y;

  const b = Object.entries(borders);
  b.forEach(([side, value]) => {
    switch (side) {
      case 'bottom': {
        const limit =
          props.axis === 'y' ? props.rows - positionedItem.y : Infinity;
        item.height = Math.min(Math.max(value, 1), limit);
        break;
      }
      case 'top': {
        const limit = props.axis === 'y' ? props.rows - value : Infinity;
        item.y = Math.max(positionedItem.y + (item.height ?? 1) - value, 0);
        item.height = Math.min(Math.max(value, 1), limit);
        break;
      }
      case 'right': {
        const limit =
          props.axis === 'y' ? Infinity : props.columns - positionedItem.x;
        item.width = Math.min(Math.max(value, 1), limit);
        break;
      }
      case 'left': {
        const limit = props.axis === 'y' ? Infinity : props.columns - value;
        item.x = Math.max(positionedItem.x + (item.width ?? 1) - value, 0);
        item.width = Math.min(Math.max(value, 1), limit);
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
