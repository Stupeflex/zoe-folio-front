<script setup lang="ts">
import { computed } from 'vue';
import { ProjectMedia, useProjectData } from '../store/projectData';

type ProjectMediaProps = {
  media: ProjectMedia;
};

const projectData = useProjectData();

const props = defineProps<ProjectMediaProps>();

const style = computed(() => ({
  gridColumnStart:
    typeof props.media.size.x === 'number' ? props.media.size.x : undefined,
  gridRowStart:
    typeof props.media.size.y === 'number'
      ? props.media.size.y + 12
      : undefined,
}));
</script>

<template>
  <div
    :class="`col-${media.size.width} row-${
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
  width: 100%
  height: calc(100% - $cell-height - $unit)
  display: flex
  overflow: hidden
  cursor: pointer

  img
    object-fit: cover
    width: 100%
    height: 100%
</style>
