import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Application } from '@pixi/app';
import { TickerPlugin } from '@pixi/ticker';
import { BatchRenderer, Renderer, extensions } from '@pixi/core';
import { AccessibilityManager } from '@pixi/accessibility';
import { InteractionManager } from '@pixi/interaction';
import { Extract } from '@pixi/extract';
import { AppLoaderPlugin } from '@pixi/loaders';
import { ParticleRenderer } from '@pixi/particle-container';
import { Prepare } from '@pixi/prepare';
import { createI18n } from 'vue-i18n';

import 'vue3-lottie/dist/style.css';

import router from './router';
import App from './App.vue';
import { translations } from '@/translations';
import InlineSvg from 'vue-inline-svg';

const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: translations,
});

const app = createApp(App);
app.use(pinia);

app.component('inline-svg', InlineSvg);

app.use(i18n);
app.use(router);

const initPixiPlugins = () => {
  // Install renderer plugins
  extensions.add(
    AccessibilityManager,
    Extract,
    InteractionManager,
    ParticleRenderer,
    Prepare,
    BatchRenderer,
    TickerPlugin,
    AppLoaderPlugin
  );

  // Install application plugins
};

initPixiPlugins();

app.mount('#app');
