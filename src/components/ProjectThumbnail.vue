<script setup lang="ts">
import { extractPalette } from '@/utils/gradient';
import { generateProjectLink } from '@/utils/navigation';
import { computed, ref } from '@vue/reactivity';
import { defineProps } from 'vue';
import { Project, useProjectData } from '../store/projectData';
import { useGradientData } from '@/store/gradientData';
import { RouterLink } from 'vue-router';

type ProjectThumbnailProps = {
  project: Project;
  x?: number;
  y?: number;
};

const gradientData = useGradientData();
const projectData = useProjectData();

const inTransition = ref<boolean>(false);

const MAX_WIDTH = 9;

const isImage = (
  el: HTMLElement | HTMLImageElement | null
): el is HTMLImageElement => {
  if (el && (el as HTMLImageElement)?.src) {
    return true;
  }
  return false;
};

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
  () => (1 - (size.value?.width || MAX_WIDTH) / MAX_WIDTH) * 2
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

const onLeave = () => {
  const isDifferent = gradientData.targetColors.some(
    (color, index) => color !== gradientData.defaultColors[index]
  );
  if (isDifferent && !inTransition.value) {
    console.log('leave', isDifferent);
    gradientData.resetDefaultColors(true);
  }
};

const onClick = (e: MouseEvent) => {
  inTransition.value = true;
  applyPalette(e);
};
</script>

<template>
  <div
    :class="`col-${size.width + spacingX} row-${
      size.height + spacingY
    } project__thumbnail__container hover__parent`"
    :style="style"
    data-scroll
    :data-scroll-speed="speed"
    data-scroll-offset="1200, -1200"
  >
    <router-link
      :to="generateProjectLink(project)"
      class="project__thumbnail"
      @mouseover="applyPalette"
      @mouseleave="onLeave"
      @click="onClick"
    >
      <img
        :src="project.thumbnailUrl"
        :alt="project.title"
        crossorigin="anonymous"
      />
    </router-link>
    <div class="project__info">
      <h5 v-if="project.client" class="project__client">
        {{ project.client }}
      </h5>
      <h4 class="project__title hover__underline">{{ project.title }}</h4>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@include col-x
@include row-x

.project__thumbnail__container
  display: flex
  flex-direction: column
  gap: $unit
  z-index: 2
  width: 100%
  height: 100%

  &::first-of-type
    grid-column-start: 3 !important
    grid-row-start: 2 !important


.project__thumbnail
  width: calc(100% - $cell-width * 2 - $unit * 2)
  height: calc(100% - $cell-height - $unit)
  display: flex
  overflow: hidden
  cursor: pointer

  @media screen and (max-width: 600px)
    width: calc(100% - $cell-width * 5 - $unit * 5)
    height: 100%

  img
    object-fit: cover
    transition: transform 0.3s ease-in-out 0s
    width: 100%
    height: 100%

  &:hover img
    transform: scale(1.1)
    transition: transform 0.5s ease-in-out 0s

.project__info
  width: max-content

.project__client
  @include body
  font-weight: 300
  color: $c-white
  opacity: 0.7

.project__title
  @include body
  color: $c-white
</style>
