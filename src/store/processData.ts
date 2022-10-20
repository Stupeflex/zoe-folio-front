import { defineStore } from 'pinia';
import process1Animation from '@/assets/animations/process1.json';
import process2Animation from '@/assets/animations/process2.json';
import process3Animation from '@/assets/animations/process3.json';
import { ProcessStep } from '@/api/types';
import { Vector2 } from '@/utils/gestures';

export interface ProcessCard extends ProcessStep {
  translate: Vector2;
}

interface State {
  cards: ProcessCard[];
}

export const useProcessData = defineStore('processData', {
  state: (): State => ({
    cards: [
      {
        title: 'Récupération du projet',
        content:
          'Neque voluptatem sapiente commodi tenetur minima autem totam occaecati. Tempore sint dolore illo eos sed qui aliquid reiciendis corporis. Rerum alias voluptatibus in optio aut. Quis ea autem reiciendis vero. Ex reprehenderit aperiam et. Neque voluptatem sapiente commodi tenetur minima autem totam occaecati.\n\nNeque voluptatem sapiente commodi tenetur minima autem totam occaecati. Tempore sint dolore illo eos sed qui aliquid reiciendis corporis.',
        size: {},
        animation: process1Animation,
        index: 0,
        translate: {
          x: 0,
          y: 0,
        },
      },
      {
        title: 'Conformation des rushs',
        content:
          'Sed rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
        size: {},
        animation: process3Animation,
        index: 1,
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
        index: 2,
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
        index: 3,
        translate: {
          x: 0,
          y: 0,
        },
      },
    ],
  }),
  actions: {
    updateTranslate(index: number, translate: Vector2) {
      const card = this.cards[index];
      if (!card) return;
      this.cards[index].translate.x = translate.x;
      this.cards[index].translate.y = translate.y;
    },
    getCard(index: number): ProcessCard {
      return this.cards[index];
    },
  },
});
