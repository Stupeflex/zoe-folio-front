<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Arrow from '@/components/icons/Arrow.vue';
import { useProjectData } from '@/store/projectData';
import { computed } from 'vue';
import { formatNumber } from '@/utils/format';
import { RouterLink } from 'vue-router';
import { useAdminData } from '@/store/adminData';

const { t } = useI18n();
const projectData = useProjectData();
const adminData = useAdminData();

const projectCount = computed(() => formatNumber(projectData.projects.length));
const archivedProjectCount = computed(() =>
  formatNumber(projectData.projects.filter(({ archived }) => archived).length)
);
</script>

<template>
  <div id="admin__panel">
    <h1>Admin Panel</h1>
    <h3>– Dashboard</h3>

    <div id="user">
      <span
        >Logged in as
        <span id="username">{{
          adminData.user?.username ?? 'User'
        }}</span></span
      >
      <button
        id="btn__logout"
        class="hover__underline hover__active"
        @click="adminData.logout"
      >
        Logout
      </button>
    </div>
    <p id="info">
      Manage all of this website's data.<br />
      Find shortcuts to dedicated editing utilities and see usage statistics.
    </p>
    <h4>Shortcuts</h4>
    <router-link
      to="/admin/clients"
      class="admin__panel__card hover__parent"
      id="c__clients"
    >
      <div class="c__inner"></div>
      <div class="row">
        <h5 class="hover__underline">{{ t('admin.dashboard.clients') }}</h5>
        <span class="icon__container">
          <Arrow flip />
        </span>
      </div>
    </router-link>
    <router-link
      to="/admin/projects"
      class="admin__panel__card hover__parent hover__parent"
      id="c__projects"
    >
      <div class="c__inner">
        <span class="number">{{ projectCount }}</span>
        <div class="stat">
          {{ t('admin.dashboard.totalProjects') }}
        </div>
        <span class="number">{{ archivedProjectCount }}</span>
        <div class="stat">
          {{ t('admin.dashboard.archivedProjects') }}
        </div>

        <p class="description">
          Add, manage and archive projects. <br />
          Edit a project's info and define its medias' layout.
        </p>
      </div>
      <div class="row">
        <h5 class="hover__underline">{{ t('admin.dashboard.projects') }}</h5>
        <span class="icon__container">
          <Arrow flip />
        </span>
      </div>
    </router-link>
    <router-link
      to="/admin/sections"
      class="admin__panel__card hover__parent"
      id="c__sections"
    >
      <div class="c__inner">
        <span class="number">04</span>
        <span class="stat">{{ t('admin.dashboard.mainSections') }}</span>
        <p class="description">Edit most of this website's copy.</p>
      </div>
      <div class="row">
        <h5 class="hover__underline">{{ t('admin.dashboard.content') }}</h5>
        <span class="icon__container">
          <Arrow flip />
        </span>
      </div>
    </router-link>
    <router-link
      to="/admin/usage"
      class="admin__panel__card hover__parent"
      id="c__usage"
    >
      <div class="c__inner"></div>
      <div class="row">
        <h5 class="hover__underline">{{ t('admin.dashboard.usage') }}</h5>
        <span class="icon__container">
          <Arrow flip />
        </span>
      </div>
    </router-link>
  </div>
</template>

<style scoped lang="sass">
#admin__panel
  @include grid($columns, true, calc($rows - 1))
  height: 100%
  width: 100%
  padding: 0

  h1
    grid-column: 4 / -1
    grid-row-start: 1
    grid-row-end: span 2
    align-self: end

  h3
    @include body-big
    color: $c-grey
    grid-column: 4 / -1
    align-self: end

  h4
    @include body
    color: $c-grey
    grid-column: 9 / span 4
    grid-row-start: 4
    align-self: end

  #info
    @include process-step
    color: $c-grey
    grid-column: 4 / span 5
    padding-right: $cell-width
    grid-row: 4 / -1
    align-self: start

  #user
    grid-column: -7 / span 3
    grid-row: 2 / span 1
    display: flex
    gap: $unit-h
    flex-direction: column
    align-items: flex-end
    align-self: end
    position: relative

    #btn__logout
      position: absolute
      text-align: left
      bottom: calc($unit-n * 2)
      @include body
      color: $c-white
      transition: all 0.3s $bezier 0s

      &:hover
        font-variation-settings: 'wght' 500

    > span
      @include body
      color: $c-grey

      #username
        font-variation-settings: 'wght' 500

  .admin__panel__card
    @include blur-bg
    border-radius: $unit-h
    padding: $unit-d
    padding-bottom: $unit
    padding-right: $unit
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: space-between
    grid-column-end: span 4
    grid-row-end: span 3
    transition: all 0.3s $bezier 0s, backdrop-filter 0s linear 0s
    outline: 1px solid transparent

    .c__inner
      width: 100%
      flex-grow: 1
      display: grid
      grid-template-columns: min-content 1fr
      grid-auto-rows: min-content
      grid-column-gap: $unit-h
      grid-row-gap: $unit

      align-items: baseline

      .number
        @include body
        color: $c-white
        font-variation-settings: "wght" 550
        grid-column: 1 / span 1

      .stat
        @include body
        color: $c-grey

      .description
        @include process-step
        color: $c-grey
        grid-column: 1 / -1
        height: max-content

    .row
      display: flex
      align-items: baseline
      justify-content: flex-end
      width: 100%
      gap: $unit

      .icon__container
        transform: scale(2) translate(-16px, -3px)
        transition: all 0.3s $bezier 0s
        opacity: 0

      h5
        @include body-big
        font-variation-settings: "wght" 400
        color: $c-white
        width: max-content
        transform: translateX($unit-d)
        transition: all 0.3s $bezier 0s

    &:hover
      outline-color: $c-white
      @include blur-bg(20px, 250%)

      .icon__container
        transform: scale(2) translate(0px, -3px)
        opacity: 1

      h5
        transform: translateX(0px)

  @media only screen and (max-width: $b-tablet)
    h1, h3, #info
      grid-column-start: 3

    h3, #info
      grid-column-end: span 5

    h4
      grid-row-start: 5
      grid-column-start: 6

    #c__projects
      grid-row-start: 6
      grid-column-start: 6

    #c__clients
      grid-row-start: 5
      grid-column-start: 10

    #c__usage
      grid-row-start: 9
      grid-column-start: 6

    #c__sections
      grid-row-start: 8
      grid-column-start: 10

  @media only screen and (max-width: $b-mobile)

    #admin__panel
      @include grid($columns, true, calc($rows - 2))
      padding: 0
      padding-top: calc($cell-height + $unit)

    h1
      white-space: nowrap

    h1, h3, #info
      grid-column-start: 2
      grid-column-end: span calc($columns - 2)

    #info
      grid-row-end: span 4

    h4
      grid-row-start: 7
      grid-column-start: 2

    .admin__panel__card
      grid-column-end: span 5
      grid-row-end: span 4

    #c__projects
      grid-row-start: 8

    #c__usage
      grid-row-start: 12

    #c__clients
      grid-row-start: 7

    #c__sections
      grid-row-start: 11

    #c__projects, #c__usage
      grid-column-start: 1

    #c__clients, #c__sections
      grid-column-start: 6
</style>
