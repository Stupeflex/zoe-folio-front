<script lang="ts" setup>
import { useProjectData } from '@/store/projectData';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import CTA from '@/components/CTA.vue';

const projectData = useProjectData();
const { t } = useI18n();
</script>

<template>
  <div id="project__list">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Titre</th>
          <th>Catégorie</th>
          <th>Date</th>
        </tr>
      </thead>
      <tr v-for="project in projectData.projects" :key="project.id">
        <td>{{ project.id }}</td>
        <td>
          <router-link
            class="flex hover__parent"
            :to="`/admin/project-editor/${project.id}`"
          >
            <div class="thumbnail">
              <img :src="project.thumbnailUrl" :alt="project.title" />
            </div>
            <span class="hover__underline hover__active">
              {{ project.title }}
            </span>
          </router-link>
        </td>
        <td v-if="project?.type">
          <div class="tag">
            {{ t(`project.type.${project.type}`) }}
          </div>
        </td>
        <td>
          {{ new Date(project.date).toLocaleDateString() }}
        </td>
      </tr>
    </table>
    <div id="new__cta">
      <c-t-a>New Project</c-t-a>
    </div>
  </div>
</template>

<style lang="sass" scoped>
#project__list
  position: relative
  height: 100%
  width: 100%

  table
    width: 100%
    border-radius: $unit
    max-height: 100%
    overflow: auto


    thead
      width: 100%
      padding: $unit
      height: auto
      border-radius: $unit
      overflow: hidden

      tr
        @include blur-bg
        border-radius: $unit
        overflow: hidden


    tr
      border-spacing: $unit

    th, td
      height: calc($unit * 4)
      padding: $unit

    th
      @include process-step
      text-align: left
      color: $c-white

    td, a
      @include body
      color: $c-grey

      a
        color: $c-white



      .flex
        display: inline-flex
        align-items: center
        justify-content: flex-start
        gap: $unit-h
        height: 100%

      .tag
        background: $c-grey
        padding: $unit-h $unit
        border-radius: $unit-h
        width: max-content
        color: $c-black



    .thumbnail
      height: calc($unit * 3)
      width: calc($unit * 4)
      border-radius: $unit-h
      overflow: hidden

      img
        height: 100%
        width: 100%
        object-position: center center
        object-fit: cover

  #new__cta
    position: fixed
    bottom: $unit
    right: $unit
    width: calc($cell-width * 3 + $unit * 2)
</style>
