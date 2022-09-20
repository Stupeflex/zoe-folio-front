<script setup lang="ts">
import { useScrollData } from '@/store/scrollData';
import { computed } from 'vue';
import Arrow from '@/components/icons/Arrow.vue';
import { scrollSpeedToBlurStyle } from '@/utils/effects';

const photos = Array(5).fill({
  image:
    'https://images.unsplash.com/photo-1602858772342-d2a149c9be14?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1697&q=80',
  title: 'title',
});

const scrollData = useScrollData();

const blurStyle = computed(() => scrollSpeedToBlurStyle(scrollData.speed));
</script>

<template>
  <section
    id="section__studio"
    data-scroll-section
    data-scroll
    data-scroll-call="section,studio"
    data-scroll-id="studio"
  >
    <div
      id="studio__info"
      data-scroll-speed="-4"
      data-scroll
      data-scroll-sticky
      data-scroll-position="left"
      data-scroll-target="#section__studio"
    >
      <div id="studio__title">
        <h1 class="section__title" :style="blurStyle">
          Un studio créatif<br />
          en plein Paris
        </h1>
      </div>

      <p id="studio__address">
        24, Rue de Saint Antoine<br />
        4ème arrondissement<br />
        75004 Paris
      </p>
      <div id="studio__hook__container">
        <p id="studio__hook">
          Entre brainstorming et ajustements de courbes, le studio sait
          s’effacer pour laisser libre court à la vision de vos projets.
        </p>

        <button id="studio__cta" class="hover__parent">
          <div class="inner">
            <Arrow />
          </div>
          <span class="hover__underline">Prendre rendez-vous </span>
        </button>
      </div>
    </div>

    <div
      v-for="(photo, index) in photos"
      :key="'studio' + index"
      class="studio__photo"
    >
      <span class="studio__count">0{{ index + 1 }}</span>
      <div>
        <img :src="photo.image" :alt="photo.title" />
      </div>
      <p>{{ photo.title }}</p>
    </div>
  </section>
</template>

<style lang="sass">
#section__studio
  @include grid(auto-fit, true, 11)
  display: inline-grid
  padding-top: calc($cell-height + $unit + $unit)
  height: 100%
  min-width: max-content

#studio__info
  display: grid
  grid-template-rows: repeat(3, $cell-height)
  grid-template-columns: repeat(19, $cell-width)
  grid-row-start: 8
  grid-row-end: -1
  gap: $unit
  grid-column-start: 1
  grid-column-end: span 19

#studio__title
  grid-column-start: 2
  grid-column-end: span 11
  grid-row-start: 1
  grid-row-end: span 3
  align-self: end

  @media screen and (max-width: 500px)
    opacity: 0.7

.studio__photo
  grid-column-end: span 5
  grid-row-start: 1
  grid-row-end: span 7
  position: relative
  display: flex

  .studio__count
    @include detail
    position: absolute
    right: $unit
    top: $unit
    color: $c-grey
    opacity: 0.7
  p
    @include body
    color: $c-grey
    position: absolute
    bottom: -$unit * 2.6666
    left: 0


  img
    height: 100%
    width: 100%
    object-fit: cover

#studio__address
  @include body
  color: $c-white
  grid-column-start: 10
  grid-column-end: span 3
  grid-row: 3 / 3
  align-self: end
  transform: translateY(calc($cell-height * 0.07))

#studio__hook__container
  grid-column-start: 15
  grid-column-end: span 3
  grid-row-start: 2
  grid-row-end: span 2
  align-self: end
  display: flex
  flex-direction: column
  gap: $unit

#studio__hook
  @include process-step
  white-space: normal
  color: $c-grey


#studio__cta
  display: flex
  align-items: center
  justify-content: space-between
  padding: calc($unit / 2)
  padding-right: $unit * 1.5
  gap: $unit
  width: max-content
  height: $unit * 4
  position: relative
  cursor: pointer

  &:before
    content: ""
    position: absolute
    top: 0
    left: 0
    bottom: 0
    right: 0
    background-color: $c-white
    border-radius: $unit * 2
    z-index: 1
    -webkit-mask: radial-gradient(farthest-side,$c-white 99%,transparent 100%) calc($unit / 2)/calc($unit * 3) calc($unit * 3) no-repeat, linear-gradient($c-white,$c-white)
    -webkit-mask-composite: destination-out
    mask: radial-gradient(farthest-side,$c-white 99%,transparent 100%) calc($unit / 2)/calc($unit * 3) calc($unit * 3) no-repeat, linear-gradient($c-white,$c-white)
    mask-composite: exclude
    transition: background-color .6s $bezier 0s, border .6s $bezier 0s

  span
    @include body
    color: $c-black
    z-index: 2
    transition: color .6s $bezier 0s

  .inner
    height: $unit * 3
    width: $unit * 3
    display: flex
    align-items: center
    justify-content: center
    @include blur-bg
    outline: 1px solid $c-white
    z-index: 2
    border-radius: 50%
    transition: filter .6s $bezier

    svg
      transform: scaleX(-1) !important
  &:hover
    &:before
      @include blur-bg
      border: 1px solid $c-grey
      transition: background-color .4s $bezier 0s border .2s $bezier 0s

    .inner
      backdrop-filter: blur(16px) saturate(800%)
      -webkit-backdrop-filter: blur(20px) saturate(360%)
      outline: none
      transition: filter .4s $bezier

    span
      color: $c-white
      transition: color .2s $bezier 0s
</style>
