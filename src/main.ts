import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Application } from '@pixi/app';
import { TickerPlugin } from '@pixi/ticker';
import { BatchRenderer, Renderer } from '@pixi/core';
import { AccessibilityManager } from '@pixi/accessibility';
import { InteractionManager } from '@pixi/interaction';
import { Extract } from '@pixi/extract';
import { AppLoaderPlugin } from '@pixi/loaders';
import { ParticleRenderer } from '@pixi/particle-container';
import { Prepare } from '@pixi/prepare';

import router from './router'
import App from './App.vue';

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(router);

const initPixiPlugins = () => {
  // Install renderer plugins
  Renderer.registerPlugin('accessibility', AccessibilityManager);
  Renderer.registerPlugin('extract', Extract);
  Renderer.registerPlugin('interaction', InteractionManager);
  Renderer.registerPlugin('particle', ParticleRenderer);
  Renderer.registerPlugin('prepare', Prepare);
  Renderer.registerPlugin('batch', BatchRenderer);

  // Install application plugins
  Application.registerPlugin(TickerPlugin);
  Application.registerPlugin(AppLoaderPlugin);
};

initPixiPlugins();

app.mount('#app');
