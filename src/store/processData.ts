import { defineStore } from 'pinia';
import { ProcessStep } from '@/api/types';
import { Vector2 } from '@/utils/gestures';
import { ref } from 'vue';
import { fetchProcessData } from '@/api/process';

export const useProcessData = defineStore('processData', () => {
  const cards = ref<ProcessStep[]>([]);
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
