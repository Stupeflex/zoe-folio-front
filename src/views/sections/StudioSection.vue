<script setup lang="ts">
import { useScrollData } from '@/store/scrollData';
import { computed } from 'vue';
import Arrow from '@/components/icons/Arrow.vue';
import { scrollSpeedToBlurStyle } from '@/utils/effects';
import { useI18n } from 'vue-i18n';
import { tr } from '@/translations';
import { useStudioData } from '@/store/studioData';

const scrollData = useScrollData();
const studioData = useStudioData();
const { t } = useI18n();

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
      data-scroll-target="#section__studio"
    >
      <div id="studio__title">
        <h1
          class="section__title"
          :style="blurStyle"
          v-html="tr(t, 'titles.studio')"
        />
      </div>

      <p id="studio__address" v-html="tr(t, 'sections.studio.address')" />
      <div id="studio__hook__container">
        <p id="studio__hook">{{ t('sections.studio.hook') }}</p>

        <a
          href="mailto:hello@zoecandito.studio"
          id="studio__cta"
          class="hover__parent"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="inner">
            <Arrow />
          </div>
          <div class="cta__content">
            <span class="hover__underline">{{ t('sections.studio.cta') }}</span>
          </div>
        </a>
      </div>
    </div>

    <div
      v-for="(photo, index) in studioData.data.photos"
      :key="'studio' + index"
      :id="'studio__photo' + index"
      class="studio__photo"
      data-scroll-speed="1"
      :data-scroll-delay="String((0.5 + index / 2).toFixed(2))"
    >
      <img :src="photo.url" :alt="photo.title" />
      <span class="studio__count">0{{ index + 1 }}</span>
      <p>{{ photo.title }}</p>
    </div>
  </section>
</template>

<style lang="sass">
#section__studio
  @include grid(auto-fit, true, calc($rows - 1))
  display: inline-grid
  padding-top: calc($cell-height + $unit-d)
  padding-right: calc($cell-width * 2 + $unit-d)
  height: 100%
  min-width: max-content
  position: relative
  z-index: 1

#studio__info
  display: grid
  grid-template-rows: repeat(3, $cell-height)
  grid-template-columns: repeat($columns, $cell-width)
  grid-row-start: calc($rows - 4)
  grid-row-end: span 3
  gap: $unit
  grid-column-start: 1
  grid-column-end: span $columns

  @media only screen and (max-width: $b-tablet)
    grid-row: calc($rows - 5) / span 5
    grid-template-rows: repeat(5, $cell-height)
    grid-template-columns: repeat(calc($columns - 1), $cell-width)

  @media only screen and (max-width: $b-mobile)
    grid-row: 10 / span 7
    grid-template-columns: repeat(calc($columns), $cell-width)
    grid-template-rows: repeat(7, $cell-height)

#studio__title
  grid-column-start: 2
  grid-column-end: span 11
  grid-row-start: 1
  grid-row-end: span 3
  align-self: end

  @media only screen and (max-width: $b-mobile)
    grid-column: 1 / -1
    grid-row-end: span 2

.studio__photo
  grid-column-end: span 7
  grid-row-start: 1
  grid-row-end: span calc($rows - 6)
  position: relative
  display: flex
  z-index: 2


  &#studio__photo0
    grid-column-start: 4

  @media only screen and (max-width: $b-tablet)
    grid-column-end: span 9
    grid-row-end: span calc($rows - 6)

  @media only screen and (max-width: $b-mobile)
    grid-row-start: 2
    grid-column-end: span $columns
    grid-row-end: span 7
    margin-bottom: calc($cell-height / 2)


  .studio__count
    @include detail
    position: absolute
    right: $unit
    top: $unit
    color: $c-grey
    opacity: 0.7
    z-index: 2

  p
    @include body
    color: $c-grey
    position: absolute
    bottom: calc($unit * -2.6666)
    left: 0
    z-index: 2

    @media only screen and (max-width: $b-mobile)
      @include process-step

  img
    height: 100%
    width: 100%
    object-fit: cover
    transform: translate3d(0, 0, 0)
    position: relative
    z-index: 2
    mix-blend-mode: overlay

#studio__address
  @include body
  color: $c-white
  grid-column-start: 10
  grid-column-end: span 3
  grid-row: 3 / 3
  align-self: end
  transform: translateY(calc($cell-height * 0.06))

  @media only screen and (max-width: $b-tablet)
    grid-column-start: 9

  @media only screen and (max-width: $b-mobile)
    @include process-step
    grid-row: 3 / 3
    grid-column: 6 / -1
    transform: translateY(0)
    align-self: start

#studio__hook__container
  grid-column-start: -5
  grid-column-end: span 3
  grid-row-start: 2
  grid-row-end: span 2
  align-self: end
  display: flex
  flex-direction: column
  gap: $unit

  @media only screen and (max-width: $b-tablet)
    display: grid
    grid-template-columns: repeat(auto-fill, $cell-width)
    grid-template-rows: 1fr
    grid-column: 2 / -1
    grid-row-start: 4
    grid-row-end: span 2
    flex-direction: row
    align-items: center
    height: 100%

  @media only screen and (max-width: $b-mobile)
    grid-column: 2 / -2
    grid-row: 4 / -1
    align-self: start
    height: unset
    grid-template-rows: repeat(4, $cell-height)
    gap: $unit

#studio__hook
  @include process-step
  white-space: normal
  color: $c-grey

  @media only screen and (max-width: $b-tablet)
    grid-column: 3 / span 5

  @media only screen and (max-width: $b-mobile)
    @include detail
    grid-column: 1 / span 4
    grid-row: 1 / span 2
    align-self: start
    margin-top: calc($cell-height / -2 + $unit)


#studio__cta
  display: flex
  align-items: center
  justify-content: space-between
  grid-column-end: span 3
  width: 100%
  min-width: max-content
  height: calc($unit * 4)
  position: relative
  cursor: pointer

  @media only screen and (max-width: $b-tablet)
    grid-column: 10 / -1

  @media only screen and (max-width: $b-mobile)
    height: $cell-height
    border-radius: calc($cell-height / 2)
    grid-column: 1 / -1
    grid-row: 3 / span 1

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

    @media only screen and (max-width: $b-mobile)
      height: $cell-height
      width: $cell-height


    svg
      transform: scaleX(-1) !important
      height: $unit-d

      *
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

    @media only screen and (max-width: $b-mobile)
      border-radius: calc($cell-height / 2)


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
