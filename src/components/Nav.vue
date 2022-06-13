<template>
  <nav id="nav">
    <span id="nav__logo">zoë candito</span>
    <div id="nav__links">
      <a
        :href="link.to"
        v-for="(link, index) in links"
        :key="link.title"
        class="nav__link"
      >
        <span class="link__index"> 0{{ index + 1 }} </span>
        <span class="link__title"> {{ link.title }} </span>
      </a>
    </div>

    <a href="/contact" class="nav__link" id="nav__contact">
      <span class="link__index">05</span>
      <span class="link__title">Contact</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
export type navLink = {
  title: string;
  to: string;
  [key: string]: string;
};

const links: navLink[] = [
  { title: 'Projets', to: '#projects' },
  { title: 'Processus', to: '#process' },
  { title: 'Studio', to: '#studio' },
  { title: 'A propos', to: '#about' },
];
</script>

<style lang="sass">
#nav
  position: fixed
  top: 0
  left: 0
  right: 0
  padding: 20px $unit
  display: grid
  grid-template-columns: repeat(19, $cell-width)
  grid-gap: $unit
  z-index: 10
  color: white
  backdrop-filter: blur(20px) saturate(180%)
  background-color: rgba(255, 255, 255, .1)

  #nav__logo
    font-family: 'Monument'
    font-weight: 500
    font-size: 18px
    text-transform: uppercase
    align-self: end
    grid-column: 2 / span 5


  #nav__links
    display: flex
    gap: $unit
    grid-column: 13 / -3

  .nav__link
    display: flex
    flex-direction: column
    color: white

    .link__index
      @include detail
      opacity: 0.7

    .link__title
      @include nav-link

  #nav__contact
    grid-column: -3/ -1
</style>
