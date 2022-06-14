<script setup lang="ts">
import { extractPalette } from '@/utils/gradient';
import { generateProjectLink } from '@/utils/navigation';
import { computed } from '@vue/reactivity';
import { defineProps } from 'vue';
import { Project, ProjectMedia, useProjectData } from '../store/projectData';
import { useGradientData } from '@/store/gradientData';
import { RouterLink } from 'vue-router';

type ProjectMediaProps = {
  media: ProjectMedia;
};

const gradientData = useGradientData();
const projectData = useProjectData();

const props = defineProps<ProjectMediaProps>();

const style = computed(() => ({
  gridColumnStart:
    typeof props.media.size.x === 'number' ? props.media.size.x : undefined,
  gridRowStart:
    typeof props.media.size.y === 'number' ? props.media.size.y : undefined,
}));
</script>

<template>
  <div
    :class="`col-${media.size.width + 2} row-${
      media.size.height + 1
    } project__media hover__parent`"
    :style="style"
  >
    <img :src="media.url" :alt="'media ' + media.id" crossorigin="anonymous" />
  </div>
</template>

<style lang="sass" scoped>
@include col-x
@include row-x

.project__media
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
</style>
