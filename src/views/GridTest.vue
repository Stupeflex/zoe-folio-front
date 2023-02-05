<script lang="ts" setup>
import { GridItem } from '@/utils/grid';
import GridLayout from '@/components/GridLayout/v2/GridLayout.vue';
import ScrollContainer from '@/views/ScrollContainer.vue';
import { useScrollData } from '@/store/scrollData';
import { nextTick, ref } from 'vue';

const scrollData = useScrollData();

const items: Partial<GridItem<{ string: string }>>[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    width: Math.ceil(Math.random() * 8) + 1,
    height: Math.ceil(Math.random() * 4) + 1,
    extraData: {
      string: 'i am an extra string' + index,
    },
  })),
  {
    width: 4,
    height: 5,
    x: 1,
    y: 0,
    extraData: {
      string: 'i am pinned',
    },
  },
];

const count = ref(0);

const onReSize = () => {
  nextTick(scrollData.update);
};

const onLayout = () => {
  count.value++;
};

const axis = 'y';

const direction = axis === 'y' ? 'vertical' : 'horizontal';
</script>

<template>
  <ScrollContainer :direction="direction">
    <section id="grid__test" data-scroll-section data-scroll>
      <GridLayout
        :items="items"
        :marginX="0"
        :marginY="0"
        :rows="11"
        :columns="19"
        :axis="axis"
        editable
        allow-delete
        @resize="onReSize"
        @layout="onLayout"
      >
      </GridLayout>
    </section>
  </ScrollContainer>
</template>

<style scoped lang="sass">
#grid__test
  padding: calc($cell-height + $unit + $unit) $unit $unit $unit
  width: min-content
  height: min-content
</style>
