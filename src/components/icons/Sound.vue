<script lang="ts" setup>
interface Props {
  active: boolean;
}

withDefaults(defineProps<Props>(), { active: false });
</script>

<template>
  <svg
    width="12"
    height="11"
    viewBox="0 0 12 11"
    fill="none"
    :class="{ active }"
    xmlns="http://www.w3.org/2000/svg"
    id="icon__sound"
  >
    <line x1="1" y1="0" x2="1" y2="11" />
    <line x1="3" y1="0" x2="3" y2="11" />
    <line x1="5" y1="0" x2="5" y2="11" />
    <line x1="7" y1="0" x2="7" y2="11" />
    <line x1="9" y1="0" x2="9" y2="11" />
    <line x1="11" y1="0" x2="11" y2="11" />
  </svg>
</template>

<style lang="sass">
@keyframes pulse
  0%
    transform: scaleY(0.5)

  25%
    transform: scaleY(1)

  50%
    transform: scaleY(0.3)

  75%
    transform: scaleY(0.7)

  100%
    transform: scaleY(0.5)

#icon__sound
  margin-top: 3.5px

  line
    transform-origin: bottom center
    stroke: $c-white
    transition: transform 0.25s $bezier 0s

  &:not(.active) line
    transform: scaleY(calc(1 / 12 * 2))
    transition: transform 0.6s $bezier 0s

  &.active line
    // animation-name: pulse
    animation: pulse 1.5s infinite

  @for $i from 1 through 6
    line:nth-child(#{$i})
      animation-delay: $i * .12s
</style>
