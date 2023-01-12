<script setup lang="ts">
interface CheckBoxProps {
  checked?: boolean;
}

defineProps<CheckBoxProps>();

defineEmits(['toggle']);
</script>

<template>
  <div
    :class="{ checked, checkbox: true }"
    @click.prevent.capture.stop="$emit('toggle', !checked)"
  ></div>
</template>

<style lang="sass" scoped>
.checkbox
  display: inline-block
  height: $unit-d
  width: $unit-d
  border-radius: $unit-h
  @include blur-bg
  border: 1px solid $c-grey
  position: relative
  transition: all 0.3s $bezier 0s
  pointer-events: all
  z-index: 10

  &:after
    position: absolute
    content: ""
    height: calc(100% - 4px)
    width: calc(100% - 4px)
    top: 2px
    left: 2px
    border-radius: 50%
    background-color: $c-white
    transform: scale(0)
    transition: transform 0.3s $bezier 0s

  &.checked
    border-radius: $unit
    border-color: $c-white

    &:after
      transform: scale(1)

    &:hover
      border-radius: $unit-h
      &:after
        transform: scale(0.8)

  &:not(.checked):hover
    &:after
      transform: scale(0.5)
</style>
