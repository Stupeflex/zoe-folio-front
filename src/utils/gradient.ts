import { Rectangle } from '@pixi/math';
import { RenderTexture, Texture } from '@pixi/core';
import type { Renderer } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import ColorThief from 'colorthief';
import { useGradientData } from '@/store/gradientData';

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

/**
 * Converts a hexadecimal color into a CSS color string.
 *
 * @ignore
 * @param color - The hexadecimal form of the color.
 */
function cssColor(color: string | number) {
  if (typeof color === 'string') {
    return color;
  }
  let string = color.toString(16);

  while (string.length < 6) {
    string = `0${string}`;
  }

  return `#${string}`;
}

const tempSourceFrame = new Rectangle();
const tempDestinationFrame = new Rectangle();

/**
 * Renders a linear-gradient into `renderTexture` that starts from (x0, y0) and ends at (x1, y1). These
 * coordinates are defined in the **texture's space**. That means only the frame (0, 0, `renderTexture.width`, `renderTexture.height`)
 * will be rendered.
 *
 * This method can be called inside a render cycle, and will preserve the renderer state. However, the current implementation
 * causes a batch renderer flush.
 *
 * @param renderer - The renderer to use for drawing the gradient.
 * @param renderTexture - The texture to render the gradient into.
 * @param options - The gradient parameters.
 * @param options.x0 - The x-coordinate of the gradient's start point.
 * @param options.y0 - The y-coordinate of the gradient's start point.
 * @param options.x1 - The x-coordinate of the gradient's end point.
 * @param options.y1 - The y-coordinate of the gradient's end point.
 * @param options.colorStops - The color stops along the gradient pattern.
 * @todo This implementation is currently using the Canvas API (slow). It will be converted to a WebGL shader.
 * @todo This implementation causes a batch renderer flush. This will be optimized in a future release.
 */
export const createLinearGradient = (
  renderer: Renderer,
  renderTexture: RenderTexture,
  options: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    colorStops: ColorStop[];
  }
): RenderTexture => {
  const { x0, y0, x1, y1, colorStops } = options;
  const canvas = document.createElement('canvas');

  canvas.width = renderTexture.width;
  canvas.height = renderTexture.height;

  const context = canvas.getContext('2d');

  if (context === null) return renderTexture;

  const gradient = context.createLinearGradient(x0, y0, x1, y1);

  colorStops.forEach((stop) => {
    gradient.addColorStop(stop.offset, cssColor(stop.color));
  });

  context.fillStyle = gradient;
  context.fillRect(0, 0, renderTexture.width, renderTexture.height);

  // Store the current render-texture binding.
  const renderTarget = renderer.renderTexture.current;

  const sourceFrame = tempSourceFrame.copyFrom(
    renderer.renderTexture.sourceFrame
  );
  const destinationFrame = tempDestinationFrame.copyFrom(
    renderer.renderTexture.destinationFrame
  );

  const renderSprite = new Sprite(Texture.from(canvas));
  // renderer.batch.flush();

  renderer.renderTexture.bind(renderTexture);
  renderSprite.render(renderer);
  if (renderTarget === null) return renderTexture;

  // renderer.batch.flush();
  // renderer.renderTexture.bind(renderTarget, sourceFrame, destinationFrame);

  return renderTexture;
};

export const createGradientTexture = (
  dims: { width: number; height: number },
  options: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    colorStops: ColorStop[];
  }
) => {
  const { x0, y0, x1, y1, colorStops } = options;
  const canvas = document.createElement('canvas');

  canvas.width = dims.width;
  canvas.height = dims.height;

  const context = canvas.getContext('2d');

  if (context === null) return null;

  const gradient = context.createLinearGradient(x0, y0, x1, y1);
  colorStops.forEach((stop) => {
    gradient.addColorStop(stop.offset, cssColor(stop.color));
  });
  context.fillStyle = gradient;
  context.fillRect(0, 0, dims.width, dims.height);
  return Texture.from(canvas);
};

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
 * @param shuffle whether to suffle resulting palette colors
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
