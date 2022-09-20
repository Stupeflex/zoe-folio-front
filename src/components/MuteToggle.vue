<script lang="ts" setup>
import { useProjectData } from '@/store/projectData';
import { computed } from 'vue';
import Sound from './icons/Sound.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const projectData = useProjectData();
const label = computed(() =>
  t(`project.sound.${projectData.soundActive ? 'on' : 'off'}`)
);
</script>

<template>
  <button
    title="toggle sound"
    type="button"
    @click="projectData.toggleSound"
    id="mute__toggle"
    class="details__btn hover__parent"
  >
    <Sound :active="projectData.soundActive" />
    <span
      :class="{
        hover__underline: true,
        hover__active: !projectData.soundActive,
      }"
      >{{ label }}</span
    >
  </button>
</template>

<style lang="sass">
#mute__toggle
  gap: $unit-h
  z-index: 2
  pointer-events: all
</style>
