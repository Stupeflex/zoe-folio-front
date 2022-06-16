export type Vec2 = {
  x: number;
  y: number;
  [k: string]: number;
};

export type Direction = 'vertical' | 'horizontal';
export type GestureDirection = 'vertical' | 'horizontal' | 'both';

export type DeviceOptions = {
  smooth?: boolean;
  direction?: Direction;
  gestureDirection?: GestureDirection;
};

export interface TabletOptions extends DeviceOptions {
  breakpoint: number;
}

export interface Options {
  el?: HTMLElement | Document;
  name?: string;
  offset?: [top: number, bottom: number];
  repeat?: boolean;
  smooth?: boolean;
  initPosition?: Vec2;
  direction?: Direction;
  gestureDirection?: GestureDirection;
  reloadOnContextChange?: boolean;
  lerp?: number;
  class?: string;
  scrollbarContainer?: boolean;
  scrollbarClass?: string;
  scrollingClass?: string;
  draggingClass?: string;
  smoothClass?: string;
  initClass?: string;
  getSpeed?: boolean;
  getDirection?: boolean;
  scrollFromAnywhere?: boolean;
  multiplier?: number;
  firefoxMultiplier?: number;
  touchMultiplier?: number;
  resetNativeScroll?: boolean;
  tablet?: TabletOptions;
  smartphone?: DeviceOptions;
}

export interface DefaultOptions {
  el: HTMLElement | Document;
  name: string;
  offset: [top: number, bottom: number];
  repeat: boolean;
  smooth: boolean;
  initPosition: Vec2;
  direction: Direction;
  gestureDirection: GestureDirection;
  reloadOnContextChange: boolean;
  lerp: number;
  class: string;
  scrollbarContainer: boolean;
  scrollbarClass: string;
  scrollingClass: string;
  draggingClass: string;
  smoothClass: string;
  initClass: string;
  getSpeed: boolean;
  getDirection: boolean;
  scrollFromAnywhere: boolean;
  multiplier: number;
  firefoxMultiplier: number;
  touchMultiplier: number;
  resetNativeScroll: boolean;
  tablet: TabletOptions;
  smartphone: DeviceOptions;
}

export interface SmoothInternalOptions extends DefaultOptions {
  isMobile: boolean;
  isTablet: boolean;
}

export interface SmoothInterface extends DefaultOptions {
  options: Options;
  smartphone: DeviceOptions;
  tablet: TabletOptions;
}
