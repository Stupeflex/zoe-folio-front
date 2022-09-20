<template>
  <div class="grid"></div>
</template>

<script setup lang="ts">
import { defaultGridOptions, GridProps, orderItems } from '@/utils/grid';
import { computed } from 'vue';

const { items, ...props } = withDefaults(
  defineProps<GridProps>(),
  defaultGridOptions
);

const orderedItems = computed(() => orderItems(items, props));
</script>

<style scoped></style>
