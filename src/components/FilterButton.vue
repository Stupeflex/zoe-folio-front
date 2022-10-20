<template>
  <button @click="toggle" class="filter">
    <div :class="{ active: isSelected, filter__indicator: true }" />
    <slot />
    ({{ count }})
  </button>
</template>

<script setup lang="ts">
import { useProjectData } from '@/store/projectData';
import { ProjectType } from '@/api/types';
import { computed } from 'vue';

const props = defineProps<{ filter: ProjectType }>();

const projectData = useProjectData();
const toggle = () => {
  projectData.toggleFilter(props.filter);
};
const count = projectData.projects.filter(
  ({ type }) => type === props.filter
).length;
const isSelected = computed(() => projectData.filters.includes(props.filter));
</script>

<style lang="sass" scoped>

.filter
  @include blur-bg
  @include process-step
  height: $unit-d
  padding: $unit-h
  display: flex
  align-items: center
  justify-content: center
  border-radius: calc($unit * 1.5)
  gap: calc($unit / 2)
  border: 1px solid $c-grey
  color: $c-grey
  user-select: none
  cursor: pointer
  z-index: 5
  pointer-events: all
  transition: filter 0.4s $bezier 0s, color .4s $bezier 0s

  @media only screen and (max-width: $b-mobile)
    padding: $unit-d
    height: calc($unit * 4)
    border-radius: $unit-d

  &:first-child
    grid-column-start: 2

  .filter__indicator
    height: $unit
    width: $unit
    border-radius: 50%
    border: 1px solid $c-white

    &.active
      background: $c-white

  &:hover
    backdrop-filter: blur(16px) saturate(600%)
    -webkit-backdrop-filter: blur(16px) saturate(800%)
    color: $c-white
</style>
