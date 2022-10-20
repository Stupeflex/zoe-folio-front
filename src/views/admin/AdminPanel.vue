<template>
  <main id="admin__panel">
    <admin-nav />
    <section id="admin__content">
      <router-view />
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import AdminNav from '@/components/admin/AdminNav.vue';
</script>

<style scoped lang="sass">
#admin__panel
  padding: calc($cell-height + $unit * 2) $unit $unit $unit
  height: 100%
  width: 100%

  #admin__content
    grid-column: 4 / -1
    grid-row: 1 / -1
    position: relative

    & > *
      opacity: 1
      position: relative
      z-index: 1
</style>
