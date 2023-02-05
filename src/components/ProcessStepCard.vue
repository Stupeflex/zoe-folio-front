<template>
  <article
    class="process__step__container"
    data-scroll
    :data-scroll-id="`process-step-${index}`"
    :class="`col-${size.width} row-${size.height}`"
    :style="style"
  >
    <div class="process__step" :style="cardStyle">
      <header :id="'step__header__' + index" data-scroll>
        <div class="process__step__title__container">
          <h3 class="process__step__title">{{ card.title }}</h3>
        </div>
      </header>

      <Vue3Lottie
        v-if="responsiveData.breakpoint !== 'mobile'"
        :animation-data="card.animation"
        :speed="0.75"
        :height="animationHeight"
      />

      <div class="process__step__text__container">
        <span class="process__step__number">0{{ index + 1 }}</span>
        <p v-if="card.content" v-html="content"></p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { useProcessData } from '@/store/processData';
import { useResponsiveData } from '@/store/responsiveData';

interface ProcessStepProps {
  index: number;
}

const processData = useProcessData();
const responsiveData = useResponsiveData();
const card = computed(() => processData.getCard(props.index));

const props = defineProps<ProcessStepProps>();

const width = computed(() =>
  responsiveData.getValue(
    {
      mobile: 9,
      tablet: 10,
      default: 8,
    },
    responsiveData.breakpoint
  )
);

const startX = computed(() =>
  responsiveData.getValue(
    {
      mobile: 8,
      tablet: 20,
      default: 12,
    },
    responsiveData.breakpoint
  )
);

const size = computed(() => ({
  y: responsiveData.getValue({
    default: 3,
    tablet: 5,
    mobile: 5,
  }),
  x: props.index * width.value,
  width: width.value,
  height: responsiveData.getValue({
    default: 9,
    tablet: 8,
    mobile: 11,
  }),
}));

const animationHeight = computed(() =>
  responsiveData.getValue({
    default: '50%',
    tablet: '40%',
    mobile: '30%',
  })
);

const style = computed(() => ({
  gridColumnStart: size.value.x + startX.value,
  gridColumnEnd: 'span ' + size.value.width,
  gridRowStart: size.value.y,
  zIndex: 2 + props.index,
}));

const cardStyle = computed(() => ({
  transform: `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${card.value.translate.x},${card.value.translate.y},0,1)`,
}));

const content = computed(() =>
  (card.value.content ?? '').replace(/\r\n|\r|\n/g, '<br/>')
);
</script>

<style scoped lang="sass">
@include col-x
@include row-x

.process__step__container
  position: relative
  //width: calc($cell-width * 8 + $unit * 7)
  margin-right: calc($cell-width + $unit)
  grid-column-end: span 8

.process__step
  @include blur-bg
  display: flex
  flex-direction: column
  gap: $unit-d
  padding: calc($unit * 3)
  padding-left: calc($unit * 4)
  border: 1px solid $c-grey
  border-radius: $unit
  border-top-left-radius: calc($unit * 3)
  height: 100%
  width: 100%
  z-index: 1
  position: relative
  max-height: max-content

  @media only screen and (max-width: $b-tablet)
    padding-left: $unit-d
    padding-right: $unit-d

  header
    display: flex
    flex-direction: column
    width: calc($unit * 3)
    height: auto
    gap: $unit
    position: absolute
    top: calc($unit * 3)
    left: calc($unit * -1.625)
    z-index: 2
    transform: scale(1)

    .process__step__title__container
      justify-content: center
      align-items: center
      display: flex
      border-radius: calc($unit * 1.5)
      background-color: $c-white
      width: calc($unit * 3)
      height: max-content
      padding: $unit $unit-h
      z-index: 2


      h3
        @include process-step
        color: $c-black
        text-orientation: mixed
        writing-mode: vertical-lr
        transform: rotate(180deg)

  .process__step__text__container
    display: grid
    grid-template-columns: calc($cell-width * 2 - $unit-d) 1fr
    gap: 0
    min-height: calc($cell-height * 3 - $unit)
    height: max-content
    padding-right: calc($cell-width - $unit-d)

    align-items: baseline

    @media only screen and (max-width: $b-tablet)
      grid-template-columns: calc($cell-width * 3 - ($unit * 3)) 1fr

    .process__step__number
      @include title-medium
      color: $c-grey
      text-shadow: $text-shadow

  p
    width: 100%
    @include body
    color: $c-white
    height: max-content
    min-height: max-content
    white-space: normal

    @media only screen and (max-width: $b-mobile)
      @include process-step
</style>
