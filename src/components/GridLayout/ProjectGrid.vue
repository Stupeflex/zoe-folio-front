<script setup lang="ts">
import { useProjectData } from '@/store/projectData';
import { nextTick } from 'vue';
import GridLayout from '@/components/GridLayout/v2/GridLayout.vue';
import { useScrollData } from '@/store/scrollData';
import ProjectThumbnail from '@/components/ProjectThumbnail.vue';

const projectData = useProjectData();
const scrollData = useScrollData();

const onResize = () => {
  nextTick(scrollData.update);
};
</script>

<template>
  <GridLayout
    :staticLayout="{
      items: projectData.gridItems,
      data: projectData.gridLayout,
    }"
    @resize="onResize"
  >
    <template v-slot="{ project }">
      <ProjectThumbnail :project="project" />
    </template>
  </GridLayout>
</template>
