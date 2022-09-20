<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import GradientBackground from './components/GradientBackground.vue';
import { useMouseData } from './store/mouseData';
import { useProjectData } from './store/projectData';
import GestureHandler, { Vector2 } from './utils/gestures';
import NavBar from './components/Nav.vue';

import GridOverlay from './components/GridOverlay.vue';

let gestures: GestureHandler;
const mouseData = useMouseData();
const projectData = useProjectData();
const route = useRoute();

const onMove = (pos: Vector2, delta: Vector2) => {
  mouseData.setMousePos(pos);
};

onMounted(() => {
  projectData.fetch(true);
  gestures = new GestureHandler({
    onMove,
  });
});

onBeforeUnmount(() => {
  if (gestures) {
    gestures.destroy();
  }
});

const isAdminRoute = computed(() => route.path.includes('admin'));
</script>

<template>
  <GradientBackground />
  <!-- <transition> -->
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transitionName">
      <component v-if="projectData.fetched" :is="Component" :key="route.path" />
    </transition>
  </router-view>
  <!-- </transition> -->

  <NavBar v-if="!isAdminRoute" />
  <GridOverlay />
</template>

<style lang="sass">

#app
  width: 100%
  height: 100%

.fade-enter-active,
.fade-leave-active
  transition: opacity 1s ease

.fade-enter-active
  //transition-delay: 0.5s

.fade-enter-from,
.fade-leave-to
  opacity: 0 !important

.slide-up-enter-active
  transition: transform .6s ease-out 0s

.slide-up-leave-active
  transition: opacity 0.6s ease 0s, transform .9s ease-in 0s
  transform-origin: center bottom

.slide-up-enter-from
  transform: translateY(100vh)
   transition-delay: 1s

.slide-up-enter-to
  transform: translateY(0) !important

.slide-up-leave-to
  opacity: 0.5 !important
  transform: scale(0.95)
  // transform: translateY(-100vh) !important
</style>
