<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import GradientBackground from './components/GradientBackground.vue';
import { useMouseData } from './store/mouseData';
import { useProjectData } from './store/projectData';
import GestureHandler, { Vector2 } from './utils/gestures';
// import Scroller from './views/Scroller.vue';
import Projects from './views/sections/Projects.vue';
import NavBar from './components/Nav.vue';

import GridOverlay from './components/GridOverlay.vue';

let gestures: GestureHandler;
const mouseData = useMouseData();
const projectData = useProjectData();

const onMove = (pos: Vector2, delta: Vector2) => {
  mouseData.setMousePos(pos);
};

onMounted(() => {
  projectData.fetch(true);
  gestures = new GestureHandler({
    onMove,
  });
});

projectData.$subscribe((state) => {
  console.log(state);
});

onBeforeUnmount(() => {
  if (gestures) {
    gestures.destroy();
  }
});
</script>

<template>
  <GradientBackground />
  <!-- <transition> -->
  <router-view v-slot="{ Component, route }">
    <transition :name="(route.meta.transitionName as string | undefined)">
      <component v-if="projectData.fetched" :is="Component" :key="route.path" />
    </transition>
  </router-view>
  <!-- </transition> -->
  <NavBar />
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
  transition-delay: 1s

.fade-enter-from,
.fade-leave-to
  opacity: 0 !important

.slide-up-enter-active
  transition: transform .6s ease-out 0s

.slide-up-leave-active
  transition: opacity 0.6s ease 0s, transform .6s ease-in 0s

.slide-up-enter-from
  transform: translateY(100vh)
  // transition-delay: 1s

.slide-up-enter-to
  transform: translateY(0) !important

.slide-up-leave-to
  opacity: 0 !important
  // transform: translateY(-100vh) !important
</style>
