<script lang="ts" setup>
import { useProjectData } from '@/store/projectData';

const projectData = useProjectData();
</script>

<template>
  <div id="project__list">
    <table>
      <tr>
        <th>#</th>
        <th>Titre</th>
      </tr>
      <tr v-for="(project, index) in projectData.projects" :key="project.id">
        <td>{{ index }}</td>
        <td>{{ project.title }}</td>
      </tr>
    </table>
  </div>
</template>

<style lang="sass" scoped></style>
