<script setup lang="ts">
import { ProjectMedia } from '@/store/projectData';

type ProjectMediaProps = {
  media: ProjectMedia;
  preview?: boolean;
  blur?: boolean;
};
const props = defineProps<ProjectMediaProps>();

const emit = defineEmits(['preview']);

const togglePreview = () => {
  emit('preview', props.media.id);
};
</script>

<template>
  <div
    :class="{ project__media: true, hover__parent: true, preview, blur }"
    @click="togglePreview"
  >
    <img :src="media.url" :alt="'media ' + media.id" />
  </div>
</template>

<style lang="sass" scoped>

.project__media
  width: 100%
  height: 100%
  display: flex
  overflow: hidden
  cursor: pointer
  align-items: center
  justify-content: center
  transition: filter 0.6s $bezier 0s, opacity 0.6s $bezier 0s

  img
    object-fit: contain
    width: auto
    height: 100%
    object-position: center
    transition: object-position 0.6s $bezier 0s

    @media only screen and (max-width: $b-tablet)
      height: 100%
      width: 100%
      object-fit: cover

    @media only screen and (max-width: $b-mobile)
      //object-fit: contain
      //object-position: top left

  &.preview img
    height: 100%
    width: 100%
    object-position: center center
    object-fit: contain

  &.blur
    opacity: 0.7
    filter: blur(20px)
</style>
