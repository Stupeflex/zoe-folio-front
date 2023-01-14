<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { tr } from '@/translations';
import { useAboutData } from '@/store/aboutData';
import { computed, onMounted } from 'vue';
import { scrollSpeedToBlurStyle } from '@/utils/effects';
import { useScrollData } from '@/store/scrollData';

const { t } = useI18n();
const aboutData = useAboutData();
const scrollData = useScrollData();

const blurStyle = computed(() => scrollSpeedToBlurStyle(scrollData.speed));

onMounted(async () => {
  await aboutData.fetchAll();
  scrollData.update();
});

const clientColumnsCount = computed(
  () => Math.ceil(aboutData.clients.length / 3) * 3 + 2
);
</script>

<template>
  <section
    id="section__about"
    data-scroll-section
    data-scroll
    data-scroll-call="section,about"
    data-scroll-id="about"
  >
    <div
      id="about__title"
      data-scroll
      data-scroll-speed="-4"
      data-scroll-sticky
      data-scroll-target="#section__about"
    >
      <h1
        class="section__title"
        :style="blurStyle"
        v-html="tr(t, 'titles.about')"
      />
    </div>

    <img
      id="about__img"
      v-if="aboutData.loaded"
      :src="aboutData.image?.url"
      alt="Zoë Candito"
    />
    <div id="about__info" v-if="aboutData.loaded">
      <p id="about__bio">
        Zoë Candito <br />
        Freelance colorist
      </p>
      <p v-html="tr(t, 'sections.studio.address')"></p>
    </div>

    <div id="about__description">
      <p>{{ aboutData.description }}</p>
    </div>
    <div
      id="about__clients"
      v-if="aboutData.loaded"
      :style="{
        gridColumnEnd: `span ${clientColumnsCount}`,
      }"
    >
      <h2 id="about__clients__title">{{ t('sections.about.clients') }}</h2>
      <article
        class="about__client"
        v-for="client in aboutData.clients"
        :key="client.id"
      >
        <inline-svg :src="client.logo.url" v-if="!!client?.logo" />
        <div v-else class="client__name">
          <span>
            {{ client.name }}
          </span>
        </div>
        <div class="tl corner"></div>
        <div class="tr corner"></div>
        <div class="bl corner"></div>
        <div class="br corner"></div>
      </article>
    </div>
  </section>
</template>

<style lang="sass">
$clients-start: 20
$clients-row-start: 3

#section__about
  @include grid(auto-fit, true, calc($rows - 1))
  display: inline-grid
  padding-top: calc($cell-height + $unit + $unit)
  height: 100%
  min-width: max-content
  position: relative
  z-index: 1

#about__title
  grid-row-start: 1
  grid-column-end: span 17
  grid-row-end: span 2
  grid-column-start: 2
  align-self: end

#about__img
  grid-column: 1 / span 6
  grid-row: 4 / span 8
  object-fit: cover
  //height: calc(100% - $cell-height / 2)
  width: 100%
  height: 100%
  align-self: end

#about__clients__title
  grid-column: 1 / span 9
  grid-row: 1 / span 2

#about__clients
  grid-column: 19 / span 9
  grid-row-start: $clients-row-start
  grid-row-end: span 8
  @include grid(auto-fit, true, 8)
  grid-auto-flow: column
  padding: 0

  @media only screen and (max-width: $b-mobile)
    grid-column-start: 15

  .about__client
    height: 100%
    width: 100%
    grid-column-end: span 3
    grid-row-end: span 2
    position: relative
    padding: $unit-h
    display: flex
    align-items: center
    text-align: center

    .corner
      position: absolute
      height: $unit-h
      width: $unit-h
      border-color: $c-grey
      border-width: 1px
      opacity: 0.7
      transition: transform 0.6s $bezier 0s

      &.tl, &.tr
        top: calc($unit * -1 + 0.5px)
        border-bottom-style: solid

      &.bl, &.br
        bottom: calc($unit * -1 + 0.5px)
        border-top-style: solid

      &.tl, &.bl
        left: calc($unit * -1 + 0.5px)
        border-right-style: solid

      &.tr, &.br
        right: calc($unit * -1 + 0.5px)
        border-left-style: solid


    svg
      width: calc(100% - $unit)
      height: calc(100% - $unit)
      margin-left: $unit-h
      margin-top: $unit-h
      opacity: 0.7
      transition: transform 0.6s $bezier 0s, opacity 0.6s $bezier 0s
      z-index: 1

      path
        fill: $c-white !important

    .client__name
      height: 100%
      width: 100%
      position: relative
      min-width: 100%
      display: flex
      justify-content: center
      align-items: center
      opacity: 0.7
      transition: transform 0.6s $bezier 0s, opacity 0.6s $bezier 0s
      z-index: 1

      span
        @include body-big
        color: $c-white
        transition: font-variation-settings 0.6s $bezier 0s

        @media only screen and (max-width: $b-mobile)
          @include body


    &:before
      position: absolute
      content: ""
      top: $unit
      left: calc(50% - $cell-height + $unit-h)
      height: calc($cell-height * 2 - $unit)
      width: calc($cell-height * 2 - $unit)
      border-radius: 50%
      @include blur-bg
      transform: scale(0)
      transition: transform 0.6s $bezier 0s
      z-index: 0

    &:hover

      &:before
        transform: scale(1)

      svg, .client__name
        opacity: 1
        transform: scale(1.1)

      .client__name span
        font-variation-settings: "wght" 450

      .tr
        transform: translate(calc($unit * -1), calc($unit * 1))

      .tl
        transform: translate(calc($unit * 1), calc($unit * 1))

      .bl
        transform: translate(calc($unit * 1), calc($unit * -1))

      .br
        transform: translate(calc($unit * -1), calc($unit * -1))

#about__info
  grid-column: 8 / span 2
  grid-row: 4 / -1
  display: grid
  grid-auto-rows: $cell-height
  gap: $unit
  grid-template-columns: 1fr
  grid-auto-flow: row

  p
    @include body
    color: $c-white


  @media only screen and (max-width: $b-tablet)
    grid-column: 8 / span 4

    #about__bio
      @include body-big
      grid-row-end: span 2

  @media only screen and (max-width: $b-mobile)
    grid-row: 12 / -1
    grid-column: 2 / span 4

#about__description
  grid-column: 13 / span 4
  grid-row: 5 / -1
  width: 100%

  p
    @include body
    color: $c-white
    white-space: normal

  @media only screen and (max-width: $b-tablet)
    grid-row-start: 6

  @media only screen and (max-width: $b-mobile)
    grid-row-start: 4
    grid-column: 8 / span 5
</style>
