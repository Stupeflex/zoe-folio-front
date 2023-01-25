<script lang="ts" setup>
import { identifier, useProjectData } from '@/store/projectData';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import CTA from '@/components/CTA.vue';
import CheckBox from '@/components/CheckBox.vue';
import { en } from '@/translations/en';
import { computed, ref } from 'vue';
import { useAdminData } from '@/store/adminData';
import { adminProjectClient } from '@/api/projects';

const projectData = useProjectData();
const adminData = useAdminData();
const router = useRouter();
const { t } = useI18n();
const updating = ref(false);
const client = computed(() => adminProjectClient(adminData.token));

const headers = Object.keys(en.admin.project.table.label).map((k) =>
  t('admin.project.table.label.' + k)
);

const goToProject = (id: identifier) => {
  router.push({ path: `/admin/project-editor/${id}` });
};

const toggleArchived = (id: identifier) => async (newArchived: boolean) => {
  if (!updating.value) {
    updating.value = true;
    const res = await client.value.setArchived(id, newArchived);
    if (res) {
      projectData.setProjectArchived(id, newArchived);
    }
    updating.value = false;
  }
};
</script>

<template>
  <div id="project__list">
    <table>
      <thead>
        <tr>
          <th v-for="h in headers" :key="h">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="project in projectData.projects"
          :key="project.id"
          class="hover__parent"
          @click="goToProject(project.id)"
        >
          <td>{{ project.id }}</td>
          <td>
            <div class="thumbnail">
              <img
                :src="project.thumbnailUrl"
                :alt="project.title"
                crossorigin="anonymous"
              />
            </div>
          </td>
          <td>
            <span class="hover__underline project__title">
              {{ project.title }}
            </span>
          </td>
          <td>{{ project.client ?? '–' }}</td>
          <td v-if="project?.type">
            <div class="tag">
              {{ t(`project.type.${project.type}`) }}
            </div>
          </td>
          <td>
            {{ new Date(project.date || Date.now()).toLocaleDateString() }}
          </td>
          <td>
            <CheckBox
              :checked="project.archived"
              @toggle="(checked: boolean) => toggleArchived(project.id)(checked)"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <div id="new__cta">
      <c-t-a :onClick="() => $router.push('/admin/project-editor/new')"
        >New Project</c-t-a
      >
    </div>
    <div id="layout__cta">
      <c-t-a :onClick="() => $router.push('/admin/project-list-editor')"
        >Edit list layout</c-t-a
      >
    </div>
  </div>
</template>

<style lang="sass" scoped>
#project__list
  position: relative
  height: 100%
  width: 100%

  .project__title
    transition: all 0.3s $bezier 0s

  table
    width: 100%
    max-height: 100%
    table-layout: fixed
    border-spacing: $unit-h
    -webkit-border-vertical-spacing: 0

    thead
      width: 100%
      padding: $unit
      height: auto
      border-radius: $unit
      overflow: hidden

    tr
      border-spacing: $unit

      &:hover .project__title
        font-variation-settings: "wght" 500

    th, td
      height: calc($unit * 4)
      padding: $unit
      transition: opacity 0.3s $bezier 0s

      &:first-child
        @include body
        text-align: center
        font-variation-settings: "wght" 500
        width: calc($unit * 4)

      &:last-child
        width: calc($unit * 10)
        text-align: center

    th
      @include process-step
      @include blur-bg
      text-align: left
      color: $c-grey
      border-radius: $unit-h

      &:first-child, &:last-child
        border-radius: $unit-d

      &:nth-child(2)
        border-top-left-radius: $unit-d
        border-bottom-left-radius: $unit-d

      &:nth-child(6)
        border-top-right-radius: $unit-d
        border-bottom-right-radius: $unit-d

    tbody
      &:hover td:not(:last-child)
        opacity: 0.7

      tr
        transition: all 0.3s $bezier 0s
        cursor: pointer

        &:hover *
          opacity: 1 !important

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
        @include blur-bg
        backdrop-filter: unset
        @include body

        padding: $unit-h $unit
        border-radius: $unit-h
        width: max-content
        color: $c-white
        transform: translateX($unit-n)

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

  #layout__cta
    position: fixed
    bottom: $unit
    left: $unit
    width: calc($cell-width * 3 + $unit * 2)
</style>
