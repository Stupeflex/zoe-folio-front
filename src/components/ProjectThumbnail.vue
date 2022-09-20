<script setup lang="ts">
import { extractPalette } from '@/utils/gradient';
import {
  generateProjectLink,
  transitionToProjectPage,
} from '@/utils/navigation';
import { computed, ref } from 'vue';
import { Project, useProjectData } from '@/store/projectData';
import { useGradientData } from '@/store/gradientData';
import { useRouter } from 'vue-router';
import { useScrollData } from '@/store/scrollData';

type ProjectThumbnailProps = {
  project: Project;
  x?: number;
  y?: number;
};

const gradientData = useGradientData();
const projectData = useProjectData();
const scrollData = useScrollData();
const router = useRouter();

const inTransition = ref<boolean>(false);
const img = ref<HTMLDivElement>();
const info = ref<HTMLDivElement>();

const MAX_WIDTH = 9;

const isImage = (
  el: HTMLElement | HTMLImageElement | null
): el is HTMLImageElement => {
  if (el && (el as HTMLImageElement)?.src) {
    return true;
  }
  return false;
};

// eslint-disable-next-line no-undef
const props = defineProps<ProjectThumbnailProps>();

const size = computed(() => ({
  ...props.project.size,
  width:
    window.innerWidth < 600
      ? props.project.size.width + 7
      : props.project.size.width,
  // height:
  //   window.innerWidth < 600
  //     ? props.project.size.height - 1
  //     : props.project.size.height,
}));

const style = computed(() => ({
  gridColumnStart:
    typeof size.value.x === 'number' ? size.value.x + 3 : undefined,
  gridRowStart: typeof size.value.y === 'number' ? size.value.y : undefined,
}));

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

const speed = computed(
  () => (1 - (size.value?.width || MAX_WIDTH) / MAX_WIDTH) * 4
);

const spacingX = computed(() => (window.innerWidth < 600 ? 5 : 2));
const spacingY = computed(() => (window.innerWidth < 600 ? 0 : 1));

const applyPalette = (e: MouseEvent) => {
  const palette = projectData.palettes.find(
    ({ id }) => id === props.project.id
  );
  if (palette?.palette) {
    gradientData.setColorsRgb(palette.palette, true);
  } else {
    console.warn('use fallback palette hover');
    extractPaletteFallback(e);
  }
};

const getAllThumbnailContainers = () =>
  document.querySelectorAll('.project__thumbnail__container');

const onHover = (e: MouseEvent) => {
  applyPalette(e);
  projectData.hoveringId = props.project.id;
};

const onLeave = () => {
  const isDifferent = gradientData.targetColors.some(
    (color, index) => color !== gradientData.defaultColors[index]
  );
  if (isDifferent && !inTransition.value) {
    gradientData.resetDefaultColors(true);
    console.log('reset gradient');
  }
  projectData.hoveringId = null;
};

const onClick = (e: MouseEvent) => {
  e.preventDefault();
  scrollData.stop();
  scrollData.destroy();
  projectData.inTransitionId = props.project.id;
  inTransition.value = true;
  // applyPalette(e);
  transitionToProjectPage(img.value, info.value, () =>
    router.push(generateProjectLink(props.project))
  );
};
</script>

<template>
  <div
    :class="{
      [`col-${size.width + spacingX}`]: true,
      [`row-${size.height + spacingY}`]: true,
      project__thumbnail__container: true,
      hover__parent: true,
      transition: inTransition,
      blurred:
        !!projectData.hoveringId && projectData.hoveringId !== project.id,
      hidden:
        !!projectData.inTransitionId &&
        projectData.inTransitionId !== project.id,
    }"
    :style="style"
    :data-scroll-speed="speed"
    data-scroll
    :data-scroll-delay="speed"
    :id="`project__thumbnail__${project.id}`"
  >
    <a
      :href="generateProjectLink(project)"
      class="project__thumbnail"
      @mouseover="onHover"
      @mouseleave="onLeave"
      @mouseout="onLeave"
      @click="onClick"
      ref="img"
    >
      <img
        :src="project.thumbnailUrl"
        :alt="project.title"
        crossorigin="anonymous"
      />
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
    transform: translateX(-100%) scale(1)
  100%
    transform: translateX(0) scale(1)

.project__thumbnail__container
  display: flex
  flex-direction: column
  gap: $unit
  z-index: 2
  width: 100%
  height: 100%

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


.project__thumbnail
  width: calc(100% - $cell-width * 2 - $unit * 2)
  height: calc(100% - $cell-height - $unit)
  display: flex
  overflow: hidden
  cursor: pointer
  transition: border-radius 0.3s $bezier 0s, opacity 0.6s $bezier 0s, filter 0.6s $bezier 0s

  @media screen and (max-width: 600px)
    width: calc(100% - $cell-width * 5 - $unit * 5)
    height: 100%

  @for $i from 1 to 50
    &:nth-child(#{$i}) img
      animation-duration: 1s + 0.6s * $i

  img
    object-fit: cover
    transition: transform 0.3s $bezier 0s
    width: 100%
    height: 100%
    animation: appear $bezier


  &:hover img
    transition: transform 0.6s $bezier 0s
    transform: translateX(0) scale(1.1)

  &:hover
    border-radius: $unit * 2

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
  position: relative


  .project__client
    @include body
    font-weight: 300
    color: $c-white
    opacity: 0.7
    transition: all 0.6s $bezier 0s

  .project__title
    @include body
    color: $c-white
    position: relative
    transition: all 0.9s $bezier 0s

  &.transition
    z-index: 11

    .project__title
      @include title-big
      transform: translateX(-5px)

      &:after
        width: 0

    .project__client
      font-weight: 400
      opacity: 1

      &:before
        content: "— "
</style>
