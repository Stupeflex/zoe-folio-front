import { defineStore } from 'pinia';
import process1Animation from '@/assets/animations/process1.json';
import process2Animation from '@/assets/animations/process2.json';
import process3Animation from '@/assets/animations/process3.json';
import { ProcessStep } from '@/api/types';
import { Vector2 } from '@/utils/gestures';
import { ref } from 'vue';
import { fetchProcessData } from '@/api/process';

export const useProcessData = defineStore('processData', () => {
  const cards = ref<ProcessStep[]>([
    {
      title: 'Conformation des rushs',
      content:
        'Sed rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
      size: {},
      animation: process3Animation,
      index: 0,
      translate: {
        x: 0,
        y: 0,
      },
    },
    {
      title: 'Étalonnage',
      content:
        'Voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo',
      size: {},
      animation: process2Animation,
      index: 1,
      translate: {
        x: 0,
        y: 0,
      },
    },
    {
      title: 'Export',
      content:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.',
      size: {},
      animation: process1Animation,
      index: 2,
      translate: {
        x: 0,
        y: 0,
      },
    },
  ]);
  const hook = ref<string>('');
  const loaded = ref<boolean>(false);

  const fetch = async () => {
    const data = await fetchProcessData();
    hook.value = data.hook;
    cards.value = data.steps;
    loaded.value = true;
  };

  const updateTranslate = (index: number, translate: Vector2) => {
    const card = cards.value[index];
    if (!card) return;
    cards.value[index].translate.x = translate.x;
    cards.value[index].translate.y = translate.y;
  };

  const getCard = (index: number) => cards.value[index];

  return {
    cards,
    hook,
    loaded,
    updateTranslate,
    getCard,
    fetch,
  };
});
