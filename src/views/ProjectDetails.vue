<script setup lang="ts">
import { identifier, ProjectMedia, useProjectData } from '@/store/projectData';
import { useRoute } from 'vue-router';
import { watch, nextTick } from 'vue';
import { computed, ref } from 'vue';

import { fetchProjectById } from '@/api/projects';

import Scroller from '@/views/ScrollContainer.vue';
import { useGradientData } from '@/store/gradientData';
import { extractPaletteFromUrl } from '@/utils/gradient';
import { useScrollData } from '@/store/scrollData';
import NextProject from '@/components/NextProject.vue';
import ProjectContents from '@/components/Project/ProjectContents.vue';

const projectData = useProjectData();
const gradientData = useGradientData();
const scrollData = useScrollData();
const route = useRoute();

const loaded = ref<boolean>(false);
const index = ref<number>(0);

const fetchProject = async () => {
  const ID: identifier | null = route?.params?.id
    ? String(route.params.id)
    : null;
  try {
    if (ID) {
      loaded.value = false;
      projectData.selectProject(Number(ID));
      projectData.inTransitionId = null;
      projectData.hoveringId = null;
      const projectIndex = projectData.getIndexOfId(Number(ID));
      preloadNextProject(projectIndex);
      // set display index
      index.value = projectIndex;

      // don't reload data
      let fetchedProject = projectData.selectedProject;
      if (!fetchedProject?.fullyFetched) {
        const justFetched = await fetchProjectById(ID);
        if (justFetched !== null && !Array.isArray(justFetched)) {
          fetchedProject = justFetched;
        }
      }
      if (
        fetchedProject &&
        fetchedProject?.id &&
        !Array.isArray(fetchedProject)
      ) {
        projectData.updateProject(fetchedProject, true);

        loaded.value = true;
        // generate new color palette only if project palette not already generated
        const maybeProjectPalette = projectData.palettes.find(
          ({ id }) => id === fetchedProject?.id
        );
        if (maybeProjectPalette && maybeProjectPalette.palette) {
          gradientData.setColorsRgb(maybeProjectPalette.palette, true);
        } else {
          try {
            const generatedPalette = await extractPaletteFromUrl(
              fetchedProject.thumbnailUrl
            );
            if (generatedPalette) {
              gradientData.setColorsRgb(generatedPalette, true);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const preloadNextProject = (projectIndex: number) => {
  const index =
    projectIndex < projectData.projects.length - 1 ? projectIndex + 1 : 0;
  const nextProject = projectData.projects[index];
};

watch(
  () => loaded.value,
  (value) => {
    if (value) {
      nextTick(() => {
        setTimeout(() => {
          scrollData.update();
        }, 1000);
        // scrollData.scrollTo(0);
      });
    }
  }
);

const project = computed(() => projectData?.selectedProject);

watch(() => route.params.id, fetchProject);

fetchProject();
</script>

<template>
  <Scroller direction="vertical">
    <div id="scroll__container">
      <project-contents :project="project" :projectIndex="index" />
      <next-project></next-project>
    </div>
  </Scroller>
</template>

<style lang="sass" scoped>
#scroll__container
  width: 100%
</style>
