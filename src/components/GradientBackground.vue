<script setup lang="ts">
import { Application } from '@pixi/app';
import { Sprite } from '@pixi/sprite';
import { Filter, Texture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { KawaseBlurFilter } from '@pixi/filter-kawase-blur';
import { OldFilmFilter } from '@pixi/filter-old-film';
import { TwistFilter } from '@pixi/filter-twist';

import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { createGradientTexture, ColorStop } from '../utils/gradient';
import { Point } from '@pixi/math';
import { useMouseData } from '../store/mouseData';
import { useGradientData } from '../store/gradientData';
import { Graphics } from '@pixi/graphics';

import fragmentShader from '../shaders/gradient.frag';

let app: Application;
let halfTick: boolean = false;
const MaxCanvasWidth = 650;

const mouseData = useMouseData();
const gradientData = useGradientData();

const generateDimensions = (): { width: number; height: number } => {
  const ratio = window.innerWidth / window.innerHeight;
  const width = Math.min(window.innerWidth, MaxCanvasWidth);
  const height = Math.min(window.innerHeight, MaxCanvasWidth / ratio);
  console.log(ratio, width, height);
  return { width, height };
};

const dimensions = ref<{ width: number; height: number }>(generateDimensions());

const gradientFilter = new Filter(undefined, fragmentShader, {
  iResolution: {
    x: dimensions.value.width,
    y: dimensions.value.height,
  },
  u_colors: gradientData.uniforms,
  u_colorsCount: gradientData.colors.length,
});

const twistFilter = new TwistFilter({
  radius: Math.max(window.innerWidth / 2, window.innerHeight / 2),
  angle: 2,
  offset: new Point(window.innerWidth / 2, window.innerHeight / 2),
});

const noiseFilter = new OldFilmFilter({
  sepia: 0,
  scratch: 0,
  scratchDensity: 0,
  noise: 0.05,
  noiseSize: 0.5,
  vignetting: 0,
});
// noiseFilter.blendMode = BLEND_MODES.EXCLUSION
// noiseFilter.resolution = 0.2

// const cursorShape = new Graphics();
// cursorShape.beginFill(0xffffff, 0.5);
// cursorShape.drawCircle(0, 0, 500);
// cursorShape.x = window.innerWidth / 2;
// cursorShape.y = window.innerHeight / 2;
// cursorShape.endFill();

const gradientSprite = new Sprite(Texture.WHITE);
gradientSprite.width = dimensions.value.width;
gradientSprite.height = dimensions.value.height;
// gradientSprite.height = dimensions.value.height;
// gradientSprite.height = dimensions.value.height;

gradientSprite.filters = [gradientFilter];

const initPixi = () => {
  const canvas = document.getElementById('blur-gradient');

  // initPixiPlugins()
  // const { width, height } = generateDimensions();

  if (canvas) {
    app = new Application({
      width: dimensions.value.width,
      height: dimensions.value.height,
      // antialias: true,
      backgroundAlpha: 0,
      view: canvas as HTMLCanvasElement,
      //resizeTo: window,
      // autoStart: false
    });

    app.stage.addChild(gradientSprite);
    // app.stage.addChild(cursorShape);

    app.stage.filters = [
      // gradientFilter,
      new KawaseBlurFilter(10, 3, true),
      twistFilter,
      noiseFilter,
    ];

    // app.render()
    app.ticker.add(onFrame);
  }
};

const onResize = () => {
  // const { width, height } = generateDimensions();
  dimensions.value = generateDimensions();
  app.renderer.resize(dimensions.value.width, dimensions.value.height);
  gradientSprite.width = dimensions.value.width;
  gradientSprite.height = dimensions.value.height;
  gradientFilter.uniforms.iResolution.x = dimensions.value.width;
  gradientFilter.uniforms.iResolution.y = dimensions.value.height;
  app.renderer.render(app.stage);
};

watch(
  () => mouseData.normalizedMousePos,
  (pos) => {
    twistFilter.offset.x =
      dimensions.value.width / 2 - (pos.x * dimensions.value.width) / 4;
    twistFilter.offset.y =
      dimensions.value.height / 2 - (pos.y * dimensions.value.height) / 4;
    twistFilter.angle = 4 * pos.x;
    // twistFilter.radius =
    //   Math.max(dimensions.value.width, dimensions.value.height) *
    //   (1 - Math.abs(pos.y)) *
    //   2;
  }
);

const onFrame = (deltaTime: number) => {
  // cursorShape.clear();
  // gradientFilter.uniforms.iResolution.x = window.innerWidth;
  // gradientFilter.uniforms.iResolution.y = window.innerHeight;
  gradientFilter.uniforms.u_colors = gradientData.uniforms;

  // twistFilter.offset.x =
  //   window.innerWidth / 2 +
  //   (mouseData.normalizedMousePos.x * window.innerWidth) / 4;
  // twistFilter.offset.y =
  //   window.innerHeight / 2 +
  //   (mouseData.normalizedMousePos.y * window.innerHeight) / 4;
  // twistFilter.angle = 4 * mouseData.normalizedMousePos.x;
  // twistFilter.radius =
  //   Math.max(window.innerWidth, window.innerHeight) *
  //   (1 - Math.abs(mouseData.normalizedMousePos.y)) *
  //   2;
  if (halfTick) {
    noiseFilter.seed = Math.random() * 0.01;
  }
  // cursorShape.x = mouseData.mousePos.x;
  // cursorShape.y = mouseData.mousePos.y;
  halfTick = !halfTick;
};

onMounted(() => {
  initPixi();

  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  app.ticker.remove(onFrame);
  window.removeEventListener('resize', onResize);
  app.destroy();
});
</script>

<template>
  <canvas id="blur-gradient"></canvas>
</template>

<style scoped lang="sass">
#blur-gradient
  width: 100%
  height: 100%
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  z-index: 0

  #blur-gradient__rect
    fill: url(#blur-gradient__gradient)
    filter: url(#blur-gradient__displacement)
</style>
