<script lang="ts" setup>
import { useProjectData } from '@/store/projectData';
import { useGradientData } from '@/store/gradientData';
import { useScrollData } from '@/store/scrollData';
import { computed, onMounted } from 'vue';
import FilterButton from '@/components/FilterButton.vue';
import { scrollSpeedToBlurStyle } from '@/utils/effects';
import { useI18n } from 'vue-i18n';
import { tr } from '@/translations';
import ProjectGrid from '@/components/GridLayout/ProjectGrid.vue';

const { t } = useI18n();

const projectData = useProjectData();
const gradientData = useGradientData();
const scrollData = useScrollData();

onMounted(() => {
  gradientData.resetDefaultColors();
});

const doBlur = computed<boolean>(() => scrollData.scrollPos.x > 50);
const blurStyle = computed(() => scrollSpeedToBlurStyle(scrollData.speed));

const sectionStyle = computed(() => ({
  width: projectData.gridLayout.layoutDimensions.width,
}));
</script>

<template>
  <section
    id="section__projects"
    :style="sectionStyle"
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
    <ProjectGrid />
  </section>
</template>

<style lang="sass" scoped>
#section__projects
  @include grid(auto-fit, true, calc($rows - 1))
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

  h1
    align-self: end
    grid-column: 2 / -1

  @media only screen and (max-width: $b-mobile)
    grid-row-end: -3
    grid-column-end: span calc($columns - 1)

#filters
  display: flex
  justify-content: flex-start
  align-items: baseline
  gap: $unit
  grid-row-start: -2
  grid-column-start: 3
  grid-column-end: span 9

  @media only screen and (max-width: $b-mobile)
    background: red
    grid-column: 1 / span calc($columns)
    justify-content: space-between
</style>
