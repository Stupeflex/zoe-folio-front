<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import GradientBackground from './components/GradientBackground.vue';
import { useMouseData } from './store/mouseData';
import { useProjectData } from './store/projectData';
import GestureHandler, { Vector2 } from './utils/gestures';
import Scroller from './views/Scroller.vue';
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
  projectData.fetch();
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
  <Scroller>
    <Projects />
  </Scroller>
  <NavBar />
  <GridOverlay />
</template>

<style lang="sass">

#app
  width: 100%
  height: 100%

  section
    height: 100%
</style>
