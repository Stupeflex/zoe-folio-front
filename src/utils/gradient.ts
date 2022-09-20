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
    .map((_v) => generateHexComponent());
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
  console.log(rgba);
  const hex = `#${(
    (1 << 24) +
    (parseInt(rgba[0]) << 16) +
    (parseInt(rgba[1]) << 8) +
    parseInt(rgba[2])
  )
    .toString(16)
    .slice(1)}`;
  return hex;
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
      console.warn('get palette failed', e);
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

export const defaultPalette = [
  '#111114',
  '#D18D24',
  '#539A84',
  '#223',
  '#111114',
].map((hex) => hexToRgb(hex));

export const studioSectionPalette = [
  '#564592',
  '#E271DF',
  '#CA7DF9',
  '#724CF9',
  '#564592',
].map((hex) => hexToRgb(hex));

export const processSectionPalette = [
  '#D8CFAF',
  '#E6B89C',
  '#ED9390',
  '#F374AE',
  '#6E8776',
].map((hex) => hexToRgb(hex));
