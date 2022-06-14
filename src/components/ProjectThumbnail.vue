<script setup lang="ts">
import { extractPalette } from '@/utils/gradient';
import { generateProjectLink } from '@/utils/navigation';
import { computed } from '@vue/reactivity';
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

const isImage = (
  el: HTMLElement | HTMLImageElement | null
): el is HTMLImageElement => {
  if (el && (el as HTMLImageElement)?.src) {
    return true;
  }
  return false;
};

const props = defineProps<ProjectThumbnailProps>();

const style = computed(() => ({
  gridColumnStart:
    typeof props.project.size.x === 'number'
      ? props.project.size.x + 3
      : undefined,
  gridRowStart:
    typeof props.project.size.y === 'number' ? props.project.size.y : undefined,
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
    }
  }
};

const onHover2 = (e: MouseEvent) => {
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
  if (isDifferent) {
    console.log('leave', isDifferent);
    gradientData.resetDefaultColors(true);
  }
};
</script>

<template>
  <div
    :class="`col-${project.size.width + 2} row-${
      project.size.height + 1
    } project__thumbnail__container hover__parent`"
    :style="style"
  >
    <router-link
      :to="generateProjectLink(project)"
      class="project__thumbnail"
      @mouseover="onHover2"
      @mouseleave="onLeave"
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

  &::first-of-type
    grid-column-start: 3 !important
    grid-row-start: 2 !important


.project__thumbnail
  width: calc(100% - $cell-width * 2 - $unit * 2)
  height: calc(100% - $cell-height - $unit)
  display: flex
  overflow: hidden
  cursor: pointer

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
