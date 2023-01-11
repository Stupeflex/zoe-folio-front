import { defineStore } from 'pinia';
import Scroller from '@/utils/scroller/Main';
import type { Options, Vec2 } from '@/utils/scroller/types';
import { useGradientData } from '@/store/gradientData';
import {
  clamp,
  defaultPalette,
  processSectionPalette,
  studioSectionPalette,
  aboutSectionPalette,
} from '@/utils/gradient';
import { reactive, ref, watch } from 'vue';
import { gridLength } from '@/utils/grid';
import { useProcessData } from '@/store/processData';
import { unit } from '@/utils/responsive';
import { useResponsiveData } from '@/store/responsiveData';

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
      top: number;
      bottom: number;
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
  instance: {
    scroll: {
      x: number;
      y: number;
    };
  };
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
  const scrollPos = reactive<Vec2>({ x: 0, y: 0 });
  const limit = reactive<Vec2>({ x: window.innerWidth, y: window.innerHeight });
  const activeSection = ref<ScrollSectionId | undefined>(undefined);
  const speed = ref<number>(0);
  const progress = ref<Vec2>({ x: 0, y: 0 });
  const processData = useProcessData();
  const responsiveData = useResponsiveData();

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
      return scroller.value.scrollTo(target, options);
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
      case 'about':
        return setColorsRgb(aboutSectionPalette, true);
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

  const translateProcessCards = (e: scrollEvent) => {
    const cards = Object.values(e.currentElements).filter(({ id }) =>
      id.includes('process-step')
    );

    const l = responsiveData.getValue({
      mobile: 6,
      tablet: 7,
      default: 9,
    });
    const visibleLength = unit() * 2 + gridLength(l, 'x');
    const trackLength = gridLength(l - 1, 'x');
    cards.forEach((card) => {
      const deltaX = e.scroll.x + visibleLength - card.left;
      const height = window.innerHeight - card.top;
      const x = Math.max(deltaX, 0);
      const yRatio = x / trackLength;
      const coef = clamp(yRatio, 0, 1);
      const sinCoef = Math.abs(clamp(deltaX, -0.1, 0));
      const y = clamp(coef - Math.sin(sinCoef), 0, 1) * height;
      const index = Number(card.id.split('-')[2]);
      processData.updateTranslate(index, { x, y });
    });
  };

  const onScroll = (e: scrollEvent) => {
    scrollPos.x = e.scroll.x;
    scrollPos.y = e.scroll.y;
    limit.x = e.limit.x;
    limit.y = e.limit.y;
    const pX = e.scroll.x / e.limit.x;
    const pY = e.scroll.y / e.limit.y;
    progress.value.x = isNaN(pX) ? 0 : pX;
    progress.value.y = isNaN(pY) ? 0 : pY;
    speed.value = e.speed ?? 0;
    // ScrollTrigger.update();
    activeSection.value = getCurrentActiveSection(e);
    translateProcessCards(e);
  };

  watch(activeSection, updateSectionColor);

  return {
    scroller,
    target,
    activeSection,
    scrollPos,
    speed,
    progress,
    limit,
    init,
    update,
    destroy,
    scrollTo,
    start,
    stop,
    updateSectionColor,
  };
});
