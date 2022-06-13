import { Rectangle } from '@pixi/math';
import { RenderTexture, Texture } from '@pixi/core';
import type { Renderer } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

/**
 * Color stop used to generate gradients
 *
 * @public
 */
export declare interface ColorStop {
  color: number | string;
  offset: number;
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
  console.warn(options);
  const canvas = document.createElement('canvas');

  canvas.width = renderTexture.width;
  canvas.height = renderTexture.height;

  const context = canvas.getContext('2d');

  console.log(context === null);
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
  console.log('aaaaaa');
  // renderer.batch.flush();

  console.log(renderTarget === null, renderer, renderSprite);

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
  console.warn(options);
  const canvas = document.createElement('canvas');

  canvas.width = dims.width;
  canvas.height = dims.height;

  const context = canvas.getContext('2d');

  console.log(context === null);
  if (context === null) return null;

  const gradient = context.createLinearGradient(x0, y0, x1, y1);
  console.log(colorStops);
  colorStops.forEach((stop) => {
    gradient.addColorStop(stop.offset, cssColor(stop.color));
  });
  console.log(gradient);
  context.fillStyle = gradient;
  context.fillRect(0, 0, dims.width, dims.height);
  return Texture.from(canvas);
};
