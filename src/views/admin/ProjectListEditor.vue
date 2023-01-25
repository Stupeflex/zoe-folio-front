<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import GridLayout from '@/components/GridLayout/GridLayout.vue';
import {
  projectGridOptions,
  projectsToGridItems,
  useProjectData,
  Project,
} from '@/store/projectData';
import { useResponsiveData } from '@/store/responsiveData';
import ProjectThumbnail from '@/components/ProjectThumbnail.vue';
import { useI18n } from 'vue-i18n';
import { tr } from '@/translations';
import { GridItemWithPosition, GridLayoutData } from '@/utils/grid';
import { adminProjectClient, ProjectSize } from '@/api/projects';
import { useAdminData } from '@/store/adminData';

const projectData = useProjectData();
const responsiveData = useResponsiveData();
const adminData = useAdminData();

const client = computed(() => adminProjectClient(adminData.token));

const containerRef = ref<HTMLElement>();

const { t } = useI18n();

const items = ref(projectsToGridItems(projectData.projects));

const gridItems = ref<GridItemWithPosition<{ project: Project }>[]>([]);

const gridOptions = projectGridOptions(responsiveData.breakpoint);

const edited = ref(false);
const saving = ref(false);

onMounted(() => {
  window.onbeforeunload = function (e) {
    e.preventDefault();
    return false;
  };
});

const resetLayout = () => {
  items.value = projectsToGridItems(projectData.projects);
  edited.value = false;
};

const unpinAll = () => {
  items.value = items.value.map((item) => ({
    ...item,
    x: undefined,
    y: undefined,
  }));
};

const pinAll = () => {
  items.value = items.value.map((item) => {
    const gridItem = gridItems.value.find((i) => i.id === item.id);
    return {
      ...item,
      x: gridItem?.x ?? item.x,
      y: gridItem?.y ?? item.y,
    };
  });
};

const saveLayout = async () => {
  if (saving.value) return;
  saving.value = true;
  const projectSizes: ProjectSize[] = gridItems.value
    .filter((gridItem) => gridItem.extraData?.project.id !== undefined)
    .map((gridItem) => {
      return {
        id: gridItem.extraData?.project.id,
        x: gridItem.x,
        y: gridItem.y,
        width: gridItem.width,
        height: gridItem.height,
      } as unknown as ProjectSize;
    });

  try {
    await client.value.setProjectSizes(projectSizes);
    await projectData.fetch();
    items.value = projectsToGridItems(projectData.projects);
  } catch (e) {
    console.error(e);
  }
  saving.value = false;
  edited.value = false;
};

const updateGridItems = (layout: GridLayoutData) => {
  gridItems.value = layout.items as GridItemWithPosition<{
    project: Project;
  }>[];
};

const onLayout = (layout: GridLayoutData) => {
  edited.value = true;
  updateGridItems(layout);
};

const onFirstLayout = (layout: GridLayoutData) => {
  updateGridItems(layout);
};
</script>

<template>
  <section id="project__section__editor" ref="containerRef">
    <div id="projects__title">
      <h1 class="section__title" v-html="tr(t, 'titles.projects')" />
    </div>
    <GridLayout
      v-bind="{
        items,
        ...gridOptions,
        editable: true,
      }"
      @layout="onLayout"
      @firstLayout="onFirstLayout"
    >
      <template v-slot="{ project }">
        <ProjectThumbnail :project="project" display />
      </template>
    </GridLayout>
    <button
      id="reset__cta"
      :class="{
        edit__btn: true,
        secondary: true,
        active: edited,
      }"
      @click="resetLayout"
    >
      Reset list layout
    </button>

    <button
      id="unpin__cta"
      :class="{
        edit__btn: true,
        secondary: true,
        active: true,
      }"
      @click="unpinAll"
    >
      Unpin all
    </button>

    <button
      id="pin__cta"
      :class="{
        edit__btn: true,
        secondary: true,
        active: true,
      }"
      @click="pinAll"
    >
      Pin all
    </button>

    <button
      id="save__cta"
      :class="{ edit__btn: true, active: true, disabled: !edited || saving }"
      @click="saveLayout"
    >
      {{ saving ? 'Saving...' : 'Save list layout' }}
    </button>
  </section>
</template>

<style lang="sass" scoped>
#project__section__editor
  @include grid(auto-fit, true, calc($rows - 1))
  width: calc(100% + $unit-d)
  height: var(--app-height)
  overflow-x: scroll
  overflow-y: hidden
  pointer-events: all
  display: inline-grid
  margin: $unit-n $unit-n 0
  padding-right: $unit-d

.cta__container
  position: fixed
  bottom: $unit

.edit__btn
  position: fixed
  @include detail
  height: calc($unit * 3)
  width: calc($cell-width * 2 + $unit)
  border-radius: calc($unit * 1.5)
  background: $c-white
  color: $c-black
  z-index: 11
  cursor: pointer
  transform: scale(1)
  transition: transform 0.6s $bezier 0s
  bottom: $unit

  &.secondary
    @include blur-bg
    color: $c-white
    border: 1px solid $c-white

  &:not(.active)
    transform: scale(0)

  &.disabled
    background: $c-black
    color: $c-grey
    cursor: not-allowed

#save__cta
  right: $unit

#reset__cta
  right: calc($cell-width * 2 + $unit * 3)

#unpin__cta
  left: $unit
  width: $cell-width

#pin__cta
  left: calc($cell-width + $unit * 2)
  width: $cell-width

#projects__title
  grid-column-start: 1
  grid-column-end: span 11
  grid-row-end: -3
  grid-row-start: 6
  align-self: end
  z-index: 0
  display: grid
  grid-template-columns: repeat(11, $cell-width)
  gap: $unit

  h1
    align-self: end
    grid-column: 2 / -1

  @media only screen and (max-width: $b-mobile)
    grid-row-end: -3
    grid-column-end: span calc($columns - 1)
</style>
