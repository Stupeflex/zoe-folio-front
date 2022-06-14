<script lang="ts" setup>
import { useProjectData } from '@/store/projectData';
import { computed } from '@vue/reactivity';
import Sound from './icons/Sound.vue';

const projectData = useProjectData();
const soundActive = computed(() => projectData.soundActive);
</script>

<template>
  <button
    title="toggle sound"
    type="button"
    @click="projectData.toggleSound"
    id="mute__toggle"
    class="details__btn"
  >
    <Sound :active="soundActive" />
    <span>Sound {{ soundActive ? 'on' : 'off' }}</span>
  </button>
</template>

<style lang="sass">

#mute__toggle
  gap: math.div($unit, 2)
  z-index: 2
  pointer-events: all
</style>
