<script lang="ts" setup>
import ProcessStepCard from '@/components/ProcessStepCard.vue';
import { computed, onMounted } from 'vue';
import { useScrollData } from '@/store/scrollData';
import { scrollSpeedToBlurStyle } from '@/utils/effects';
import { useI18n } from 'vue-i18n';
import { useProcessData } from '@/store/processData';

const processData = useProcessData();
const scrollData = useScrollData();
const { t } = useI18n();

onMounted(async () => {
  await processData.fetch();
  scrollData.update();
});

const blurStyle = computed(() => scrollSpeedToBlurStyle(scrollData.speed));
</script>

<template>
  <section
    id="section__process"
    data-scroll-section
    data-scroll
    data-scroll-call="section,process"
    data-scroll-id="process"
  >
    <div
      id="process__title"
      data-scroll
      data-scroll-speed="-4"
      data-scroll-sticky
      data-scroll-target="#section__process"
    >
      <h1 class="section__title" :style="blurStyle">
        {{ t('titles.process') }}
      </h1>
    </div>
    <div
      id="process__hook"
      data-scroll
      data-scroll-sticky
      data-scroll-target="#section__process"
    >
      <p>
        {{ processData.hook }}
      </p>
    </div>

    <process-step-card
      v-for="(step, index) in processData.cards"
      :index="index"
      :key="'step' + step.id ?? index"
    />
  </section>
</template>

<style lang="sass" scoped>
#section__process
  @include grid(auto-fit, true, 11)
  display: inline-grid
  padding-top: calc($cell-height + $unit + $unit)
  padding-right: calc($cell-width * 2 + $unit-d)
  height: 100%
  min-width: max-content

  @media only screen and (max-width: $b-mobile)
    //margin-left: calc($cell-width * -4 + $unit * -4)



#process__title
  grid-column-start: 1
  grid-column-end: calc($columns - 5)
  grid-row-start: 1
  grid-row-end: 3
  align-self: end
  margin-left: calc($cell-width + $unit)

  @media only screen and (max-width: $b-tablet)
    grid-column-end: $columns

#process__hook
  grid-column: 4 / span 9
  grid-row-start: 5
  grid-row-end: -2
  @include padding-x(4, right)

  p
    color: $c-grey
    white-space: normal
    @include body-big

  @media only screen and (max-width: $b-tablet)
    grid-column: 3 / $columns
    grid-row-start: 4
    @include padding-x(8, right)

    p
      @include body

  @media only screen and (max-width: $b-mobile)
    grid-column: 2 / $columns
    grid-row-start: 4
    @include padding-x(0, right)



#steps__limit
  grid-column-start: 10
  grid-row: 2 / -1
  @include grid(28, true, 10)
  padding: 0
  min-width: max-content
  background: red

  @media only screen and (max-width: $b-tablet)
    grid-column-start: 7

  @media only screen and (max-width: $b-mobile)
    grid-column-start: 2
</style>
