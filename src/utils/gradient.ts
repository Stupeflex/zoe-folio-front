import ColorThief from 'colorthief';

/**
 * Color stop used to generate gradients
 *
 * @public
 */
export declare interface ColorStop {
  color: number | string;
  offset: number;
}

export type rgbColor = [r: number, g: number, b: number, a?: number];

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const generateHexComponent = () => {
  let component = Math.round(clamp(Math.random() * 17, 0, 16)).toString(16);
  if (component === '10') {
    component = '9';
  }
  return component;
};

export const generateRandomHexColor = () => {
  const components = Array(6)
    .fill('')
    .map(() => generateHexComponent());
  return '#' + components.join('');
};

const RgbaEx = /^rgba?\(|\s+|\)$/g;

export const hexToRgb = (color: string): rgbColor => {
  if (color[0] === '#') {
    color = color.slice(1);
  }
  if (color.length === 3) {
    return [
      parseInt(color[0], 16) * 17,
      parseInt(color[1], 16) * 17,
      parseInt(color[2], 16) * 17,
    ];
  }
  if (color.length === 6) {
    return [
      parseInt(color.slice(0, 2), 16),
      parseInt(color.slice(2, 4), 16),
      parseInt(color.slice(4, 6), 16),
    ];
  }
  throw new Error('unsupported string provided to HexToRgb');
};

export const rgbToVec3 = (color: rgbColor): Vec3 => {
  return {
    x: color[0] / 255,
    y: color[1] / 255,
    z: color[2] / 255,
  };
};

export const extractRgbaFromString = (color: string): rgbColor => {
  const rgb = color
    .replace(RgbaEx, '')
    .split(',')
    .map((n: string) => parseInt(n));
  if (rgb.length >= 3) {
    return rgb as rgbColor;
  }
  return [0, 0, 0, 0];
};

export const vec3ArrayToUniforms = (vectors: Vec3[]): number[] => {
  return vectors.reduce(
    (acc: number[], vec: Vec3): number[] => [...acc, ...[vec.x, vec.y, vec.z]],
    []
  );
};

export const rgba2hex = (color: string): string => {
  const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
  return `#${(
    (1 << 24) +
    (parseInt(rgba[0]) << 16) +
    (parseInt(rgba[1]) << 8) +
    parseInt(rgba[2])
  )
    .toString(16)
    .slice(1)}`;
};

const thief = new ColorThief();

/**
 * @param img fully loaded <img/> element with crossorigin="anonymous" attribute
 * @param shuffle whether to shuffle resulting palette colors
 * @param count number of colors to extract from image
 */

export const extractPalette = (
  img: HTMLImageElement,
  shuffle = false,
  count = 5
): rgbColor[] | null => {
  if (img.complete) {
    try {
      const palette = thief.getPalette(img, count, 25);
      if (shuffle) return palette.sort(() => 0.5 - Math.random());
      return palette;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const formatRgbaString = (c: rgbColor): string =>
  `rgba(${c[0]},${c[1]},${c[2]},${c[3] || 1})`;

// const gradientData = useGradientData();
export const extractPaletteFromUrl = (
  imgUrl: string
): Promise<rgbColor[] | null> =>
  new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'Anonymous';

    i.addEventListener('load', () => {
      try {
        const palette = extractPalette(i, true);
        if (palette) {
          return resolve(palette);
        }
        return resolve(null);
      } catch (e) {
        console.error(e);
        return reject(null);
      }
    });
    i.addEventListener('error', (e) => console.error(e));
    i.src = imgUrl;
  });

export const defaultPaletteOld = [
  '#111114',
  '#D18D24',
  '#539A84',
  '#223',
  '#111114',
].map((hex) => hexToRgb(hex));

export const processSectionPalette = [
  '#738290',
  '#a1b5d8',
  '#223',
  '#e4f0d0',
  '#c2d8b9',
].map((hex) => hexToRgb(hex));

export const studioSectionPalette = [
  '#564592',
  '#E271DF',
  '#CA7DF9',
  '#724CF9',
  '#564592',
].map((hex) => hexToRgb(hex));

export const defaultPalette = [
  '#161518',
  '#2D2E3B',
  '#020215',
  '#c2d8b9',
  '#111114',
  // '#D18D24',
  // '#E6F589',
  // '#3A3E41',
].map((hex) => hexToRgb(hex));

export const aboutSectionPalette = [
  '#6c0f7e',
  '#3d6dfd',
  '#c95c13',
  '#f996a2',
  '#d92ae9',
].map((hex) => hexToRgb(hex));

export const adminPanelPalette = [
  '#165c80',
  '#04948b',
  '#98e9c2',
  '#cbab69',
  '#f23bd0',
].map((hex) => hexToRgb(hex));

export const palette1 = ['#8ab0ab', '#3e505b', '#26413c', '#1a1d1a', '#03120e'];
