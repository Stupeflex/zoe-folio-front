import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import glsl from 'vite-plugin-glsl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), glsl()],
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `
        @use "sass:math"
        @import "@/styles/vars.sass"
        @import "@/styles/reset.sass"
        @import "@/styles/fonts.sass"
        @import "@/styles/root.sass"
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
