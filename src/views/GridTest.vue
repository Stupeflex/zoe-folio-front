<script lang="ts" setup>
import { GridItem, GridLayoutData, logMatrix } from '@/utils/grid';
import GridLayout from '@/components/GridLayout/GridLayout.vue';
import ScrollContainer from '@/views/ScrollContainer.vue';
import { useScrollData } from '@/store/scrollData';
import { nextTick } from 'vue';

const scrollData = useScrollData();

const items: Partial<GridItem<{ string: string }>>[] = Array.from(
  { length: 10 },
  (_, index) => ({
    width: Math.round(3),
    height: Math.round(3),
    extraData: {
      string: 'i am an extra string' + index,
    },
  })
);

const onReSize = () => {
  nextTick(scrollData.update);
};

const onLayout = (l: GridLayoutData) => {
  logMatrix(l.matrix);
};
</script>

<template>
  <ScrollContainer>
    <section id="grid__test" data-scroll-section data-scroll>
      <GridLayout
        :items="items"
        :marginX="1"
        :marginY="1"
        :rows="11"
        :columns="19"
        axis="y"
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
  height: 100%
</style>
