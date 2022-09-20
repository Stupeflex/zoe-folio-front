import { defineStore } from 'pinia';
import Scroller from '@/utils/scroller/Main';
import type { Options, Vec2 } from '@/utils/scroller/types';
import { useGradientData } from '@/store/gradientData';
import {
  defaultPalette,
  processSectionPalette,
  rgbColor,
  studioSectionPalette,
} from '@/utils/gradient';
import { ref, watch } from 'vue';

type target = HTMLElement | Document | null | undefined;

type scrollTarget = HTMLElement | string | number;

type scrollToOptions = {
  offset?: string | number;
  duration?: number;
  callback?: () => void;
};

type scrollEvent = {
  delta: Vec2;
  direction?: string;
  limit: Vec2;
  scroll: Vec2;
  speed?: number;
  currentElements: {
    [k: string]: {
      progress: number;
      id: string;
      el: HTMLElement;
      left: number;
      right: number;
    };
  };
};

interface Scroller {
  update: () => void;
  destroy: () => void;
  on: (event: string, cb: (e: scrollEvent) => void) => void;
  off: (event: string, cb: (e: scrollEvent) => void) => void;
  scrollTo: (target: scrollTarget, options?: scrollToOptions) => void;
  stop: () => void;
  start: () => void;
}

const sectionIds = ['process', 'projects', 'studio', 'about'];
export type ScrollSectionId = typeof sectionIds[number];

const getCurrentActiveSection = (
  e: scrollEvent
): ScrollSectionId | undefined => {
  const sections = Object.values(e.currentElements);
  if (sections.length === 1) return sections[0].id;
  const active = sections
    .filter(({ id }) => sectionIds.includes(id))
    .reduce(
      (
        acc: { id: ScrollSectionId | undefined; leftToCenter: number },
        section
      ) => {
        const center = window.innerWidth / 2;
        const left = section.left - e.scroll.x;
        const leftToCenter = left - center;
        return leftToCenter < 0 && leftToCenter > acc.leftToCenter
          ? { id: section.id, leftToCenter }
          : acc;
      },
      {
        id: undefined,
        leftToCenter: -Infinity,
      }
    );
  return active.id;
};

export const useScrollData = defineStore('scrollData', () => {
  const scroller = ref<Scroller | null>(null);
  const target = ref<target>(null);
  const scrollPos = ref<Vec2>({ x: 0, y: 0 });
  const activeSection = ref<ScrollSectionId | undefined>(undefined);
  const speed = ref<number>(0);
  const progress = ref<Vec2>({ x: 0, y: 0 });

  const init = (options: Options) => {
    target.value = options?.el || undefined;
    if (scroller.value) {
      scroller.value.destroy();
    }
    scroller.value = new Scroller(options);
    update();

    window.addEventListener('resize', onResize);
  };
  const update = () => {
    if (scroller.value) {
      scroller.value.off('scroll', onScroll);
      scroller.value.on('scroll', onScroll);
      scroller.value.update();
    }
  };
  const destroy = () => {
    if (scroller.value) {
      scroller.value.destroy();
      scroller.value.off('scroll', onScroll);
    }
    window.removeEventListener('resize', onResize);
  };
  const scrollTo = (target: string | number, options?: scrollToOptions) => {
    if (scroller.value) {
      scroller.value.scrollTo(target, options);
    }
  };
  const start = () => {
    if (scroller.value) {
      scroller.value.start();
    }
  };
  const stop = () => {
    if (scroller.value) {
      scroller.value.stop();
    }
  };
  const updateSectionColor = () => {
    const { setColorsRgb } = useGradientData();
    if (!activeSection.value) return;
    switch (activeSection.value) {
      case 'studio':
        return setColorsRgb(studioSectionPalette, true);
      case 'process':
        return setColorsRgb(processSectionPalette, true);
      case 'projects':
        return setColorsRgb(defaultPalette, true);
      default:
        return;
    }
  };

  const scrollToSection = (section: ScrollSectionId) => {
    const identifier = '#section__' + section;
    scrollTo(identifier, {
      duration: 200,
    });
  };

  const onResize = () => {
    update();
    if (activeSection.value) {
      scrollToSection(activeSection.value);
    }
  };

  const onScroll = (e: scrollEvent) => {
    scrollPos.value.x = e.scroll.x;
    scrollPos.value.y = e.scroll.y;
    progress.value.x = e.scroll.x / e.limit.x;
    progress.value.y = e.scroll.y / e.limit.y;
    speed.value = e.speed ?? 0;
    activeSection.value = getCurrentActiveSection(e);
  };

  watch(activeSection, updateSectionColor);

  return {
    scroller,
    target,
    activeSection,
    scrollPos,
    speed,
    progress,
    init,
    update,
    destroy,
    scrollTo,
    start,
    stop,
    updateSectionColor,
  };
});
