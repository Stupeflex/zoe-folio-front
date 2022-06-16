<template>
  <nav id="nav" :class="{ clear }">
    <router-link to="/" id="nav__logo">zoë candito</router-link>
    <div id="nav__links">
      <router-link
        :to="link.to"
        v-for="(link, index) in links"
        :key="link.title"
        class="nav__link"
      >
        <span class="link__index"> 0{{ index + 1 }} </span>
        <span class="link__title"> {{ link.title }} </span>
      </router-link>
    </div>

    <router-link to="/contact" class="nav__link" id="nav__contact">
      <span class="link__index">05</span>
      <span class="link__title">Contact</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { ref, computed } from '@vue/reactivity';
import { watch } from '@vue/runtime-dom';
import { useScrollData } from '@/store/scrollData';

export type navLink = {
  title: string;
  to: string;
  [key: string]: string;
};

const scrollData = useScrollData();
const route = useRoute();

const links: navLink[] = [
  { title: 'Projets', to: '/#projects' },
  { title: 'Processus', to: '/#process' },
  { title: 'Studio', to: '/#studio' },
  { title: 'A propos', to: '/#about' },
];

const clearRoutes = ['projectDetails'];
const needsClearBg = () =>
  clearRoutes.includes(String(route?.name || 'no route'));

const routeNeedsClearBg = computed(() =>
  clearRoutes.includes(String(route?.name || 'no route'))
);

const scrolledDown = computed<boolean>(
  () => scrollData.scrollPos.y >= window.innerHeight / 2
);

const clear = computed<boolean>(
  () => routeNeedsClearBg.value && !scrolledDown.value
);

watch(
  () => scrollData.scrollPos,
  (pos) => console.warn(pos)
);
</script>

<style lang="sass">
#nav
  position: fixed
  top: 0
  left: 0
  right: 0
  padding: 20px $unit
  height: $cell-height
  display: grid
  grid-template-columns: repeat(19, $cell-width)
  grid-gap: $unit
  z-index: 10
  color: white
  transition: backdrop-filter 0.6s linear 0s, background-color 0.6s linear 0s

  &:not(.clear)
    @include blur-bg

  #nav__logo
    font-family: 'Monument'
    font-weight: 500
    color: $c-white
    font-size: 18px
    text-transform: uppercase
    align-self: end
    grid-column: 2 / span 5
    transform: translateY(5px)

  #nav__links
    display: flex
    gap: $unit
    grid-column: 13 / -3
    grid-row: 1 / 1

  .nav__link
    display: flex
    flex-direction: column
    color: white
    justify-content: flex-end

    .link__index
      @include detail
      opacity: 0.7

    .link__title
      @include link

  #nav__contact
    grid-column: -5 / -2
    grid-row: 1 / 1
    justify-self: end
</style>
