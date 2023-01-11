<script setup lang="ts">
import Arrow from '@/components/icons/Arrow.vue';

interface Props {
  to?: string;
  onClick?: (e: MouseEvent) => void;
  internal?: boolean;
}

defineProps<Props>();
</script>
<template>
  <template v-if="to">
    <a
      :href="to"
      class="cta hover__parent"
      target="_blank"
      rel="noopener noreferrer"
      @click="onClick"
    >
      <div class="inner">
        <slot name="icon">
          <Arrow />
        </slot>
      </div>
      <div class="cta__content">
        <span class="hover__underline">
          <slot></slot>
        </span>
      </div>
    </a>
  </template>
  <template v-else>
    <button
      class="cta hover__parent"
      rel="noopener noreferrer"
      @click="onClick"
    >
      <div class="inner">
        <slot name="icon">
          <Arrow />
        </slot>
      </div>
      <div class="cta__content">
        <span class="hover__underline">
          <slot></slot>
        </span>
      </div>
    </button>
  </template>
</template>

<style lang="sass">

.cta
  display: flex
  align-items: center
  justify-content: space-between
  grid-column-end: span 3
  //padding: calc($unit / 2)
  //padding-right: $unit * 1.5
  width: 100%
  min-width: max-content
  height: calc($unit * 4)
  position: relative
  cursor: pointer

  //&:before
  //  content: ""
  //  position: absolute
  //  top: 0
  //  left: 0
  //  bottom: 0
  //  right: 0
  //  border-radius: $unit * 2
  //  z-index: 1
  //  -webkit-mask: radial-gradient(farthest-side,$c-white 98%,transparent 100%) calc($unit / 2)/calc($unit * 3) calc($unit * 3) no-repeat, linear-gradient($c-white,$c-white)
  //  -webkit-mask-composite: destination-out
  //  mask: radial-gradient(farthest-side,$c-white 98%,transparent 100%) calc($unit / 2)/calc($unit * 3) calc($unit * 3) no-repeat, linear-gradient($c-white,$c-white)
  //  mask-composite: exclude
  //  transition: background-color .6s $bezier 0s, border .6s $bezier 0s

  span
    @include body
    color: $c-black
    z-index: 2
    transition: color .6s $bezier 0s

  .inner
    background-color: $c-white
    height: calc($unit * 4)
    width: calc($unit * 4)
    display: flex
    align-items: center
    justify-content: center
    z-index: 2
    border-radius: 50%
    transition: filter 0.6s $bezier 0s, background-color 0.6s $bezier 0s

    svg
      transform: scaleX(-1) !important
      height: $unit-d

      & > *, path
        stroke: $c-black
        transition: stroke 0.3s $bezier 0s

  .cta__content
    height: 100%
    border-radius: $unit-d
    display: flex
    align-items: center
    justify-content: center
    flex-grow: 1
    margin-left: -2px
    background-color: $c-white
    padding: 0 $unit
    transition: filter 0.6s $bezier 0s, background-color 0.6s $bezier 0s

  &:hover
    .cta__content
      @include blur-bg

    .inner
      @include blur-bg
      backdrop-filter: blur(16px) saturate(800%)
      -webkit-backdrop-filter: blur(20px) saturate(360%)
      outline: none

      svg *
        stroke: $c-white

    span
      color: $c-white
      transition: color .2s $bezier 0s
</style>
