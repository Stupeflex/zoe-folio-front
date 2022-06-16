import { defineStore } from 'pinia';
import Scroller from '@/utils/scroller/Main';
import type { Options, Vec2 } from '@/utils/scroller/types';

type target = HTMLElement | Document | null;

type scrollTarget = HTMLElement | string | number;

type scrollToOptions = {
  offset?: string | number;
  callback?: () => void;
};

type scrollEvent = {
  delta: Vec2;
  direction?: string;
  limit: Vec2;
  scroll: Vec2;
  speed?: number;
};

type State = {
  scroller?: {
    update: () => void;
    destroy: () => void;
    on: (event: string, cb: (e: scrollEvent) => void) => void;
    scrollTo: (target: scrollTarget, options?: scrollToOptions) => void;
    stop: () => void;
    start: () => void;
  };
  target?: target;
  scrollPos: Vec2;
};

export const useScrollData = defineStore('scrollData', {
  state: (): State => ({
    scroller: undefined,
    target: null,
    scrollPos: {
      x: 0,
      y: 0,
    },
  }),
  actions: {
    init(options: Options) {
      this.target = options?.el || undefined;
      if (this.scroller) {
        this.scroller.destroy();
      }
      this.scroller = new Scroller(options);
      if (this.scroller) {
        // console.log('init on scroll event');
        this.scroller.on('scroll', (e) => {
          this.scrollPos.x = e.scroll.x;
          this.scrollPos.y = e.scroll.y;
        });
      }
    },
    update() {
      if (this.scroller) {
        this.scroller.update();
      }
    },
    destroy() {
      if (this.scroller) {
        this.scroller.destroy();
      }
    },
    scrollTo(target: string | number, options?: scrollToOptions) {
      if (this.scroller) {
        this.scroller.scrollTo(target, options);
      }
    },
    start() {
      if (this.scroller) {
        this.scroller.start();
      }
    },
    stop() {
      if (this.scroller) {
        this.scroller.stop();
      }
    },
  },
});
