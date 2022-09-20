<template>
  <main id="admin__panel">
    <aside>
      <ul>
        <li v-for="route in routes" :key="route.to">
          <RouterLink :to="route.to">{{ route.title }}</RouterLink>
        </li>
      </ul>
    </aside>
    <section id="admin__content">
      <router-view />
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router';
const routes = [
  {
    title: 'Dashboard',
    to: '/admin/',
  },
  {
    title: 'Projets',
    to: '/admin/projects',
  },
  {
    title: 'Medias',
    to: '/admin/media',
  },
];
</script>

<style scoped lang="sass">
#admin__panel
  @include grid(19, true, 12)
  height: 100%
  width: 100%

  aside
    @include blur-bg
    grid-column-start: 1
    grid-column-end: 5
    grid-row: 1 / -1
    padding: $unit
    border-radius: $unit

    ul
      list-style: none

      li a
        color: $c-white
        text-decoration: none
        @include body

  #admin__content
    grid-column: 5 / -1
    grid-row: 1 / -1
</style>
