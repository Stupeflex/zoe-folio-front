<script lang="ts" setup>
import { computed } from 'vue';
import { useGradientData } from '@/store/gradientData';
import { Project, useProjectData } from '@/store/projectData';
import { formatNumber } from '@/utils/format';
import { generateProjectLink } from '@/utils/navigation';
import ArrowBig from '@/components/icons/ArrowBig.vue';
import { useI18n } from 'vue-i18n';

const projectData = useProjectData();
const gradientData = useGradientData();
const { t } = useI18n();

const index = computed<number>(
  () => projectData.getVisibleIndexOfId(projectData.selectedId) + 1
);

const nextProject = computed<Project>(
  () =>
    projectData.visibleProjects[index.value] || projectData.visibleProjects[0]
);

const onHover = () => {
  const palette = projectData.palettes.find(
    ({ id }) => id === nextProject.value.id
  );
  if (palette?.palette) {
    gradientData.setColorsRgb(palette.palette, true);
  }
};

const onLeave = () => {
  const palette = projectData.palettes.find(
    ({ id }) => id === projectData.selectedId
  );
  if (palette?.palette) {
    gradientData.setColorsRgb(palette.palette, true);
  }
};
</script>

<template>
  <router-link
    id="next__project"
    class="hover__parent"
    @mouseenter="onHover"
    @mouseleave="onLeave"
    data-scroll-section
    data-scroll-speed="0.1"
    :to="generateProjectLink(nextProject)"
    :title="`Go to ${nextProject.title}`"
  >
    <div id="thumbnail__container">
      <img
        :src="nextProject.thumbnailUrl"
        :alt="nextProject.title"
        id="thumbnail"
      />
    </div>
    <span id="next__project__index__container">
      <span class="project__index project__info">{{
        formatNumber(index + 1)
      }}</span>
      <span class="project__count"
        >/{{ formatNumber(projectData.visibleProjects.length) }}</span
      >
    </span>
    <div id="next__project__content">
      <div id="next__project__info">
        <div id="next__project__credits">
          <h5
            v-if="nextProject.client"
            id="next__project__client"
            class="project__info"
          >
            {{ nextProject.client }} —
          </h5>
          <h4
            id="next__project__title"
            class="project__title project__info hover__underline"
          >
            {{ nextProject.title }}
          </h4>
        </div>
        <span id="next__project__type">
          [
          <em>{{ nextProject.type }}</em>
          ]
        </span>
      </div>
      <div id="next__project__cta">
        <arrow-big :rotation="180" />
        <h2 class="hover__underline hover__active">{{ t('project.next') }}</h2>
      </div>
    </div>
  </router-link>
</template>

<style lang="sass" scoped>

.project__info
  @include body
  color: $c-white
  text-transform: capitalize
  z-index: 2

.project__count
  @include detail
  color: $c-white
  opacity: 0.7

#next__project
  @include grid($columns, true, 5)
  width: 100%
  min-width: 100%
  text-align: left
  cursor: pointer
  z-index: 0
  position: relative
  margin-top: calc($cell-height + $unit)

  @media only screen and (max-width: $b-mobile)
    @include grid($columns, true, 8)

  &::before
    @include blur-bg
    position: absolute
    z-index: 0
    content: ""
    height: 100%
    width: 100%
    top: 0
    left: 0
    transition: all 0.3s $bezier 0s

  &:hover
    &::before
      height: calc(100% - $unit)
      width: calc(100% - $unit)
      top: $unit-h
      left: $unit-h
      border-radius: $unit-d

    #thumbnail__container
      border-radius: calc($unit * 1.5)

      img#thumbnail
        transform: scale(1.1)

  #thumbnail__container
    grid-column: 1 / span 9
    grid-row: 1 / -1
    height: 100%
    width: 100%
    z-index: 1
    overflow: hidden
    transition: all 0.9s $bezier 0s, border-radius 0.3s $bezier 0s

    @media only screen and (max-width: $b-tablet)
      grid-column-end: span 6

    @media only screen and (max-width: $b-mobile)
      grid-column-end: span 7
      grid-row-end: span 4

    img#thumbnail
      height: 100%
      width: 100%
      object-fit: cover
      transition: transform 0.6s $bezier 0s

  #next__project__index__container
    grid-column: $columns / -1
    grid-row: 1 / span 1
    padding-top: $unit
    z-index: 1
    @media only screen and (max-width: $b-mobile)
      grid-column-start: calc($columns - 3)
      text-align: right

  #next__project__content
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: flex-end
    gap: $unit-d
    grid-column: 10 / -1
    grid-row: 2 / -1
    width: 100%
    height: 100%
    padding-bottom: $unit
    padding-left: $unit
    z-index: 1

    @media only screen and (max-width: $b-tablet)
      grid-column-start: 7

    @media only screen and (max-width: $b-mobile)
      grid-column-start: 1
      grid-row-end: -2
      padding-left: 0

    #next__project__cta
      display: flex
      align-items: baseline
      gap: $unit
      transition: transform 0.3s ease
      z-index: 1

      svg
        width: 52px

      @media only screen and (max-width: $b-mobile)
        width: 100%
        justify-content: center
        margin-left: -26px

        h2
          @include title-medium-tablet

    #next__project__info
      @include grid(4, true, 1)
      grid-template-rows: auto
      padding: 0
      align-items: end
      z-index: 1

      @media only screen and (max-width: $b-mobile)
        @include grid(7, true, 1)
        padding: 0


      #next__project__credits
        grid-column: 1 / -1
        grid-row: 1 / 1

        @media only screen and (max-width: $b-mobile)
          align-self: start

        #next__project__client
          font-weight: 350

      #next__project__type
        @include body
        text-transform: capitalize
        color: $c-white
        font-weight: 200
        grid-column: 4 / 6
        grid-row: 1 / 1
        margin-left: $unit-n

        @media only screen and (max-width: $b-mobile)
          grid-column: 6 / -1
          justify-self: end
          align-self: start

  &:hover #next__project__cta
    transform: translateX($unit-d)
</style>
