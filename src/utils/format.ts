import { Vector2 } from '@/utils/gestures';

export const formatNumber = (index: number): string =>
  index < 10 ? '0' + index.toString() : String(index);

export const formatCssTransform = (pos: Vector2) =>
  `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${pos.x},${pos.y},0,1)`;

export const formatCssTranslate = (pos: { x: string; y: string }) =>
  `translate(${pos.x}, ${pos.y})`;

export const setAppHeight = () => {
  const height = window.innerHeight + 'px';
  const doc = document.documentElement;
  doc.style.setProperty('--app-height', height);
  return height;
};
