<script setup lang="ts">
import { extractPalette } from '@/utils/gradient';
import {
  generateProjectLink,
  transitionToProjectPage,
} from '@/utils/navigation';
import { computed, nextTick, ref } from 'vue';
import { Project, useProjectData } from '@/store/projectData';
import { useGradientData } from '@/store/gradientData';
import { useRouter } from 'vue-router';
import { useScrollData } from '@/store/scrollData';

type ProjectThumbnailProps = {
  project: Project;
  x?: number;
  y?: number;
  display?: boolean;
};

const gradientData = useGradientData();
const projectData = useProjectData();
const scrollData = useScrollData();
const router = useRouter();

const inTransition = ref<boolean>(false);
const img = ref<HTMLDivElement>();
const info = ref<HTMLDivElement>();

const MAX_WIDTH = 10;

const isImage = (
  el: HTMLElement | HTMLImageElement | null
): el is HTMLImageElement => {
  return !!(el && (el as HTMLImageElement)?.src);
};

// eslint-disable-next-line no-undef
const props = defineProps<ProjectThumbnailProps>();

const extractPaletteFallback = (e: MouseEvent) => {
  let i: HTMLImageElement | null = null;
  if (e.target) {
    const target = e.target as HTMLElement;
    if (isImage(target)) {
      i = target;
    } else {
      const maybeImage = target.querySelector('img');
      if (isImage(maybeImage)) {
        i = maybeImage;
      }
    }
  }
  if (i) {
    const palette = extractPalette(i, true);
    if (palette) {
      gradientData.setColorsRgb(palette, true);
      projectData.replacePalette(props.project.id, palette);
    }
  }
};

const speed = computed(() =>
  (
    (1 -
      Math.min(props.project.size?.width || MAX_WIDTH, MAX_WIDTH) / MAX_WIDTH) *
    3.9
  ).toFixed(1)
);

const applyPalette = (e: MouseEvent) => {
  const palette = projectData.palettes.find(
    ({ id }) => id === props.project.id
  );
  if (palette?.palette) {
    gradientData.setColorsRgb(palette.palette, true);
  } else {
    extractPaletteFallback(e);
  }
};

const onHover = (e: MouseEvent) => {
  applyPalette(e);
  if (props.display) return;
  projectData.hoveringId = props.project.id;
};

const onLeave = () => {
  const isDifferent = gradientData.targetColors.some(
    (color, index) => color !== gradientData.defaultColors[index]
  );
  if (isDifferent && !inTransition.value) {
    gradientData.resetDefaultColors(true);
  }
  projectData.hoveringId = null;
};

const onClick = (e: MouseEvent) => {
  e.preventDefault();
  if (props.display) return;
  scrollData.stop();
  scrollData.destroy();
  projectData.inTransitionId = props.project.id;
  inTransition.value = true;
  nextTick(() => {
    transitionToProjectPage(img.value, info.value, () =>
      router.push(generateProjectLink(props.project))
    );
  });
};
</script>

<template>
  <div
    :class="{
      project__thumbnail__container: true,
      hover__parent: true,
      transition: inTransition,
      blurred:
        !!projectData.hoveringId && projectData.hoveringId !== project.id,
      hidden:
        !!projectData.inTransitionId &&
        projectData.inTransitionId !== project.id,
    }"
    :data-scroll-speed="speed"
    data-scroll
    :id="`project__thumbnail__${project.id}`"
  >
    <a
      :href="generateProjectLink(project)"
      :class="{
        project__thumbnail: true,
        display,
      }"
      @mouseover="onHover"
      @mouseleave="onLeave"
      @mouseout="onLeave"
      @click="onClick"
      ref="img"
    >
      <img :src="project.thumbnailUrl" :alt="project.title" />
    </a>
    <div class="project__info" ref="info">
      <h5 v-if="project.client" class="project__client">
        {{ project.client }}
      </h5>
      <h4 class="project__title hover__underline">
        {{ project.title }}
      </h4>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@include col-x
@include row-x

@keyframes appear
  0%
    filter: blur(30px)
    opacity: 0

  100%
    filter: blur(0px)
    opacity: 1

@keyframes appear-info
  0%
    opacity: 0

  100%
    opacity: 1

.project__thumbnail__container
  display: flex
  flex-direction: column
  gap: $unit
  z-index: 2
  width: 100%
  height: 100%
  position: relative

  &:first-of-type
    grid-column-start: 3 !important
    grid-row-start: 2 !important

  &.blurred
    .project__thumbnail
      opacity: 0.4
      filter: blur(10px)

    .project__info
      filter: blur(20px)

  &.transition
    z-index: 10
    position: relative

  &.hidden
    pointer-events: none
    .project__thumbnail
      opacity: 0
      filter: blur(20px)

    .project__info
      opacity: 0
      filter: blur(20px)

  @for $i from 1 to 50
    &:nth-child(#{$i}) .project__thumbnail
      animation-duration: 0.9s + 0.3s * $i

    &:nth-child(#{$i}) .project__info
      animation-duration: 0.9s + 0.3s * $i

.project__thumbnail
  width: 100%
  height: 100%
  display: flex
  overflow: hidden
  cursor: pointer
  transition: border-radius 0.3s $bezier 0s, opacity 0.6s $bezier 0s, filter 0.6s $bezier 0s
  animation: appear $bezier

  &.display
    cursor: grab

  img
    object-fit: cover
    transition: transform 0.3s $bezier 0s
    width: 100%
    height: 100%


  &:hover img
    transition: transform 0.6s $bezier 0s
    transform: translateX(0) scale(1.1)

  &:hover
    border-radius: $unit-d

  &.transition
    transform-origin: top left
    transition: border-radius 0.3s $bezier 0s, opacity 0.6s $bezier 0s, filter 0.6s $bezier 0s
    border-radius: 0 !important
    z-index: 10

    img
      transform: translateX(0) scale(1)

.project__info
  width: max-content
  transition: filter 0.6s $bezier 0s
  z-index: auto
  transform-origin: top left
  position: absolute
  top: calc(100% + $unit)
  left: 0
  animation: appear-info $bezier

  .project__client
    @include body
    color: $c-white
    opacity: 0.7
    transition: all 0.6s $bezier 0s
    font-weight: 300

    @media only screen and (max-width: $b-mobile)
      @include detail

  .project__title
    @include body
    color: $c-white
    position: relative
    transition: all 0.9s $bezier 0s
    width: 100%
    white-space: normal

  &.transition
    z-index: 11

    .project__title
      @include title-big
      transform: translateX(-5px)

      @media only screen and (max-width: $b-mobile)
        transform: translateY(0)

      &:after
        width: 0

    .project__client
      font-weight: 400
      opacity: 1
      @include body

      &:before
        content: "— "
</style>
