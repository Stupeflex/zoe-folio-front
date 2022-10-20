import { clamp } from '@/utils/gradient';

export const scrollSpeedToBlurStyle = (speed: number, max = 4) => ({
  filter: `blur(${clamp(Number(Math.abs(speed / 4).toFixed(2)), 0, max)}px)`,
});
