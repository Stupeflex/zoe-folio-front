<script lang="ts" setup>
import { ProcessStep } from '@/api/types';
import ProcessStepCard from '@/components/ProcessStepCard.vue';
import { computed } from 'vue';
import { useScrollData } from '@/store/scrollData';
import { scrollSpeedToBlurStyle } from '@/utils/effects';

const scrollData = useScrollData();

const steps: ProcessStep[] = [
  {
    title: 'Récupération du projet',
    content:
      'Neque voluptatem sapiente commodi tenetur minima autem totam occaecati. Tempore sint dolore illo eos sed qui aliquid reiciendis corporis. Rerum alias voluptatibus in optio aut. Quis ea autem reiciendis vero. Ex reprehenderit aperiam et. Neque voluptatem sapiente commodi tenetur minima autem totam occaecati.\n\nNeque voluptatem sapiente commodi tenetur minima autem totam occaecati. Tempore sint dolore illo eos sed qui aliquid reiciendis corporis.',
    index: 0,
    size: {
      y: 4,
      width: 4,
      x: 0,
    },
  },
  {
    title: 'Conformation des rushs',
    content:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
    index: 1,
    size: {
      y: 6,
      x: 5,
      width: 3,
    },
  },
  {
    title: 'Étalonnage',
    content:
      'Voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo',
    index: 2,
    size: {
      x: 7,
      width: 3,
      height: 4,
    },
  },
  {
    title: 'Export',
    content:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.',
    index: 3,
    size: {
      x: 10,
      width: 3,
      y: 7,
      height: 3,
    },
  },
];

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
      <h1 class="section__title" :style="blurStyle">Processus</h1>
    </div>
    <process-step-card
      v-for="(step, index) in steps"
      :step="step"
      :key="'step' + index"
    />
  </section>
</template>

<style lang="sass" scoped>
#section__process
  @include grid(20, true, 11)
  display: inline-grid
  padding-top: calc($cell-height + $unit + $unit)
  height: 100%
  min-width: max-content

#process__title
  grid-column-start: 2
  grid-column-end: span 11
  grid-row-start: 1
  grid-row-end: 3
  align-self: end

  @media screen and (max-width: 500px)
    opacity: 0.7
</style>
