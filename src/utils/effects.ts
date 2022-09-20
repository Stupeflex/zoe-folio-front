export const scrollSpeedToBlurStyle = (speed: number, max = 4) => ({
  filter: `blur(${Math.min(Math.abs(speed / 4), max)}px)`,
});
