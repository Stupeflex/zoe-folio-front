<script lang="ts" setup>
import { useProjectData } from '@/store/projectData';
import ProjectThumbnail from '@/components/ProjectThumbnail.vue';
import { useGradientData } from '@/store/gradientData';
import { useScrollData } from '@/store/scrollData';
import { computed, watch, onMounted } from 'vue';
import FilterButton from '@/components/FilterButton.vue';
import { nextTick } from 'vue';
import { scrollSpeedToBlurStyle } from '@/utils/effects';
import { useI18n } from 'vue-i18n';
import { tr } from '@/translations';

const { t } = useI18n();

const projectData = useProjectData();
const gradientData = useGradientData();
const scrollData = useScrollData();

onMounted(() => {
  gradientData.resetDefaultColors();
});

watch(projectData, (next, prev) => {
  if (next.filters.length !== prev.filters.length) {
    nextTick(scrollData.update);
  }
});

const doBlur = computed<boolean>(() => scrollData.scrollPos.x > 50);
const blurStyle = computed(() => scrollSpeedToBlurStyle(scrollData.speed));
</script>

<template>
  <section
    id="section__projects"
    data-scroll-section
    data-scroll
    data-scroll-call="section,projects"
    data-scroll-id="projects"
  >
    <div
      id="projects__title"
      data-scroll
      data-scroll-speed="-4"
      data-scroll-sticky
      data-scroll-target="#section__projects"
      :class="{ blur: doBlur }"
    >
      <h1
        class="section__title"
        :style="blurStyle"
        v-html="tr(t, 'titles.projects')"
      />
    </div>
    <div
      id="filters"
      data-scroll
      data-scroll-sticky
      data-scroll-target="#section__projects"
    >
      <filter-button filter="clip">{{ t('filters.clips') }}</filter-button>
      <filter-button filter="pub">{{ t('filters.pubs') }}</filter-button>
      <filter-button filter="fiction">{{ t('filters.fiction') }}</filter-button>
    </div>
    <ProjectThumbnail
      v-for="(project, index) in projectData.filteredProjects"
      :key="project.id"
      :project="project"
      :x="index === 0 ? 1 : undefined"
      :y="index === 0 ? 1 : undefined"
    />
  </section>
</template>

<style lang="sass" scoped>
#section__projects
  @include grid(auto-fit, true, 11)
  display: inline-grid
  padding-top: calc($cell-height + $unit + $unit)
  // min-width: 100%
  height: 100%
  min-width: max-content

#projects__title
  grid-column-start: 1
  grid-column-end: span 11
  grid-row-end: -3
  grid-row-start: 6
  align-self: end
  z-index: 0
  display: grid
  grid-template-columns: repeat(11, $cell-width)
  gap: $unit
  // filter: blur(3px)

  h1
    align-self: end
    grid-column: 2 / -1

  @media screen and (max-width: 500px)
    opacity: 0.7

#filters
  display: flex
  justify-content: flex-start
  align-items: baseline
  gap: $unit
  grid-row-start: -2
  grid-column-start: 3
  grid-column-end: span 9
</style>
