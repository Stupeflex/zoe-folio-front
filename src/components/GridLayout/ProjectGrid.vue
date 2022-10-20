<script setup lang="ts">
import { useProjectData } from '@/store/projectData';
import { nextTick } from 'vue';
import { GridLayoutData, logMatrix } from '@/utils/grid';
import GridLayout from '@/components/GridLayout/GridLayout.vue';
import { useScrollData } from '@/store/scrollData';
import ProjectThumbnail from '@/components/ProjectThumbnail.vue';

const projectData = useProjectData();
const scrollData = useScrollData();

const onResize = () => {
  nextTick(scrollData.update);
};

const onLayout = (l: GridLayoutData) => {
  console.log(l.items, projectData.gridItems.length);
  logMatrix(l.matrix);
};
</script>

<template>
  <GridLayout
    :staticLayout="{
      items: projectData.gridItems,
      data: projectData.gridLayout,
    }"
    @resize="onResize"
    @layout="onLayout"
    allow-delete
  >
    <template v-slot="{ project }">
      <ProjectThumbnail :project="project" />
    </template>
  </GridLayout>
</template>
