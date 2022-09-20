<template>
  <article
    :class="`process__step col-${size.width}`"
    :style="style"
    data-scroll
    data-scroll-speed="1"
  >
    <header :id="'step__header__' + step.index" data-scroll>
      <div class="process__step__number__container">
        <span class="process__step__number">0{{ step.index + 1 }}</span>
      </div>
      <div
        class="process__step__title__container"
        data-scroll
        data-scroll-position="right"
        data-scroll-sticky
        data-scroll-offset="-24"
        data-scroll-speed="1"
        :data-scroll-target="'#step__header__' + step.index"
      >
        <h3 class="process__step__title">{{ step.title }}</h3>
      </div>
    </header>

    <p v-if="step.content" :innerHTML="content"></p>
  </article>
</template>

<script setup lang="ts">
import type { ProcessStep } from '@/api/types';
import { computed } from 'vue';

interface ProcessStepProps {
  step: ProcessStep;
}

interface Size {
  x: number | undefined;
  y: number | undefined;
  height: number | undefined;
  width: number | undefined;
}

const defaultSize: Size = {
  y: undefined,
  x: undefined,
  height: undefined,
  width: 5,
};

// eslint-disable-next-line no-undef
const props = defineProps<ProcessStepProps>();

const size = computed<Size>(() =>
  Object.assign({}, defaultSize, props.step.size)
);

const style = computed(() => ({
  gridColumnStart:
    typeof size.value.x === 'number' ? size.value.x + 3 : undefined,
  gridRowStart: typeof size.value.y === 'number' ? size.value.y : undefined,
}));

const content =
  props.step.content?.replace(/(?:\r\n|\r|\n)/g, '<br/>') ?? undefined;
</script>

<style scoped lang="sass">
@include col-x
@include row-x

.process__step
  @include blur-bg
  display: flex
  flex-direction: column
  gap: $unit * 2
  padding: $unit * 3 $unit $unit $unit
  border: 1px solid $c-grey
  border-radius: $unit
  position: relative
  z-index: 1
  height: max-content

  header
    display: flex
    flex-direction: row
    height: $unit * 3
    width: 100%
    gap: $unit
    position: absolute
    top: -$unit * 1.5
    left: -$unit * 1.5
    z-index: 2
    transform: scale(1)

    .process__step__number__container
      display: flex
      height: $unit * 3
      width: $unit * 3
      min-width: $unit * 3
      background-color: $c-black
      border-radius: 50%
      justify-content: center
      padding: calc($unit / 2)
      align-items: center

      span
        @include process-step
        color: $c-white

    .process__step__title__container
      justify-content: center
      align-items: center
      display: flex
      border-radius: $unit * 1.5
      background-color: $c-white
      height: $unit * 3
      width: max-content
      padding: calc($unit / 2) $unit
      z-index: 2


      h3
        @include process-step
        color: $c-black

  p
    width: 100%
    @include body
    color: $c-grey
    height: max-content
    min-height: max-content
    white-space: normal
</style>
