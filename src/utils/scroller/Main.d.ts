// import {
//   Vec2,
//   DeviceOptions,
//   Options,
//   SmoothInternalOptions,
//   TabletOptions,
//   Direction,
//   GestureDirection,
// } from './types';

// type target = HTMLElement | string | number;

// declare class Main {
//   constructor(options: Options);

//   options: SmoothInternalOptions;
//   el: HTMLElement | Document;
//   name: string;
//   offset: [top: number, bottom: number];
//   repeat: boolean;
//   smooth: boolean;
//   initPosition: Vec2;
//   direction: Direction;
//   gestureDirection: GestureDirection;
//   reloadOnContextChange: boolean;
//   lerp: number;
//   class: string;
//   scrollbarContainer: boolean;
//   scrollbarClass: string;
//   scrollingClass: string;
//   draggingClass: string;
//   smoothClass: string;
//   initClass: string;
//   getSpeed: boolean;
//   getDirection: boolean;
//   scrollFromAnywhere: boolean;
//   multiplier: number;
//   firefoxMultiplier: number;
//   touchMultiplier: number;
//   resetNativeScroll: boolean;

//   tablet: TabletOptions;
//   smartphone: DeviceOptions;
//   scroll: SmoothScroll | NativeScroll;
//   isMobile: boolean;
//   isTablet: boolean;

//   init(): void;
//   update(): void;
//   start(): void;
//   stop(): void;
//   scrollTo(
//     target: target,
//     options: {
//       offset?: string | number;
//       callback?: () => void;
//     }
//   );
//   setScroll(x: number, y?: number): void;
// }
