<script setup lang="ts">
import Projects from '@/views/sections/Projects.vue';
import Scroller from '@/views/Scroller.vue';
import { useProjectData } from '@/store/projectData';

const projectData = useProjectData();
</script>

<template>
  <Scroller :dependencies="projectData.projects">
    <Projects />
  </Scroller>
</template>
