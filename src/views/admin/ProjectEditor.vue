<script setup lang="ts">
import { identifier, Project, useProjectData } from '@/store/projectData';
import { computed, watch } from 'vue';
import { reactive, ref } from 'vue';
import Scroller from '../ScrollContainer.vue';
import ProjectContents from '@/components/Project/ProjectContents.vue';
import { useRoute } from 'vue-router';
import {
  addMediasToProject,
  deleteProjectMedia,
  fetchProjectById,
  setMediaSizes,
  updateProject,
} from '@/api/projects';
import { useI18n } from 'vue-i18n';
import { FileRejectReason, useDropzone } from 'vue3-dropzone';
import ProjectMediaItem from '@/components/ProjectMedia.vue';
import { formatNumber } from '@/utils/format';
import { GridLayoutData } from '@/utils/grid';

const route = useRoute();
const projectData = useProjectData();
const { t } = useI18n();

const mediaPanelOpen = ref(false);
const infoPanelOpen = ref(false);
const saving = ref(false);
const saved = ref(false);
const infoPanelRef = ref<HTMLElement>();
const mediaPanelRef = ref<HTMLElement>();

const project = reactive<Partial<Project>>({
  title: 'New Project',
  ...(projectData.selectedProject ?? {}),
});

const isInfoFilled = ({
  id,
  type,
  date,
  title,
  client,
}: Partial<Project>): boolean =>
  !!client && !!type && !!id && !!title && !!date && title?.length > 0;

const infoSaveAllowed = computed(() => isInfoFilled(project));

const gridLayout = ref<GridLayoutData>();

const displayDate = computed({
  get() {
    const D = project.date ?? new Date(Date.now());
    const m = D.getMonth() + 1;
    const d = D.getDate();
    const y = D.getFullYear();
    const s = `${y}-${formatNumber(m)}-${d}`;
    console.log(s);
    return s;
  },
  set(newVal: string) {
    project.date = new Date(newVal);
  },
});

const toggleInfoPanel = () => {
  infoPanelOpen.value = !infoPanelOpen.value;
};

const toggleMediaPanel = () => {
  mediaPanelOpen.value = !mediaPanelOpen.value;
};

const fetchProject = async (updateMedia?: boolean) => {
  const ID: identifier | null = route?.params?.id
    ? String(route.params.id)
    : null;
  if (ID) {
    projectData.selectProject(Number(String(project.id ?? route.params.id)));
    let fetchedProject = projectData.selectedProject;
    if (!fetchedProject?.fullyFetched || updateMedia) {
      console.warn('project ' + fetchedProject?.title + ' needs full fetch');
      const justFetched = await fetchProjectById(ID);
      if (justFetched !== null && !Array.isArray(justFetched)) {
        fetchedProject = justFetched;
      }
    }
    if (
      fetchedProject &&
      fetchedProject?.id &&
      !Array.isArray(fetchedProject)
    ) {
      console.log(fetchedProject, fetchedProject.media);
      projectData.updateProject(fetchedProject, true);
      if (updateMedia && fetchedProject.media) {
        project.media = fetchedProject.media;
      }
    }
    return fetchedProject;
  }
};

const onDrop = async (files: File[], rejectReasons: FileRejectReason[]) => {
  console.log(rejectReasons);
  if (files.length > 0 && project.id) {
    const response = await addMediasToProject(
      project.id,
      project.media?.length ?? 0,
      files
    );
    if (response) {
      fetchProject(true);
    }
  }
};

const { getInputProps, getRootProps, isDragActive } = useDropzone({
  onDrop,
  accept: 'image/*',
});

const onInfoPanelScroll = (e: WheelEvent) => {
  if (!infoPanelRef.value) return;
  infoPanelRef.value.scrollTop += e.deltaY;
};

const onMediaPanelScroll = (e: WheelEvent) => {
  if (!mediaPanelRef.value) return;
  mediaPanelRef.value.scrollTop += e.deltaY;
};

const deleteMedia = async (mediaId: identifier) => {
  if (project.id) {
    const res = await deleteProjectMedia(project.id, mediaId);
    if (res) {
      fetchProject(true);
    }
  }
};

const onGridLayout = (l: GridLayoutData) => {
  gridLayout.value = l;
};

const saveLayout = async () => {
  console.log('save btn press', gridLayout.value);
  if (
    gridLayout.value &&
    project.media &&
    (project.media ?? []).length > 0 &&
    project.id &&
    !saving.value
  ) {
    console.log('saving');
    saving.value = true;
    const mediaSizes = (gridLayout.value?.items ?? []).map((item) => ({
      id: item.id,
      size: {
        width: item.width,
        height: item.height,
        x: item.x,
        y: item.y,
      },
    }));
    const res = await setMediaSizes(project.id, mediaSizes);
    if (res) {
      await fetchProject(true);
      saved.value = true;
    }
    saving.value = false;
  }
};

const saveProjectInfo = async () => {
  const p = Object.assign({}, project);
  if (isInfoFilled(p)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateProject(p);
  }
};

watch(
  () => route.params.id,
  () => fetchProject()
);

watch(
  () => projectData.selectedProject,
  (data) => {
    Object.entries(data ?? {}).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (project[key] !== value && saved.value) {
        saved.value = false;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      project[key] = value;
    });
  }
);

fetchProject();
</script>

<template>
  <Scroller direction="vertical" :delay="600">
    <div id="scroll__container">
      <project-contents
        :project="project"
        editable
        @deleteItem="deleteMedia"
        @gridLayout="onGridLayout"
      />
    </div>
  </Scroller>
  <button
    id="btn__open__info"
    :class="{ active: !infoPanelOpen, edit__btn: true }"
    @click="toggleInfoPanel"
  >
    Info
  </button>

  <button
    id="btn__open__media"
    :class="{ active: !mediaPanelOpen, edit__btn: true }"
    @click="toggleMediaPanel"
  >
    Media
  </button>
  <button
    id="btn__save__layout"
    :disabled="saving || !gridLayout"
    :class="{
      active: mediaPanelOpen,
      disabled: saving || !gridLayout,
      edit__btn: true,
    }"
    @click="saveLayout"
  >
    {{ saving ? 'Saving' : saved ? 'Saved!' : 'Save layout' }}
  </button>
  <button id="btn__unpin" :class="{ active: mediaPanelOpen, edit__btn: true }">
    Unpin all
  </button>

  <button
    id="btn__save__info"
    :disabled="saving || !infoSaveAllowed"
    :class="{
      active: infoPanelOpen,
      disabled: saving || !infoSaveAllowed,
      edit__btn: true,
    }"
    @click="saveProjectInfo"
  >
    {{ saving ? 'Saving' : saved ? 'Saved!' : 'Save info' }}
  </button>
  <aside
    id="edit__panel"
    :class="{ open: infoPanelOpen }"
    @wheel.prevent="onInfoPanelScroll"
  >
    <button
      id="btn__close__info"
      class="active edit__btn"
      @click="toggleInfoPanel"
    >
      Close
    </button>
    <h2>Info</h2>
    <div class="edit__content" ref="infoPanelRef">
      <label
        >Title
        <input type="text" v-model="project.title" />
      </label>
      <label
        >Client
        <input type="text" v-model="project.client" />
      </label>
      <label
        >Date
        <input type="date" v-model="displayDate" />
      </label>
      <label
        >Category
        <select v-model="project.type">
          <option value="pub">{{ t('project.type.pub') }}</option>
          <option value="fiction">{{ t('project.type.fiction') }}</option>
          <option value="clip">{{ t('project.type.clip') }}</option>
        </select>
      </label>
    </div>
  </aside>
  <aside
    id="edit__media__panel"
    :class="{ open: mediaPanelOpen }"
    @wheel.prevent="onMediaPanelScroll"
  >
    <button
      id="btn__close__media"
      class="active edit__btn"
      @click="toggleMediaPanel"
    >
      Close
    </button>
    <h2>Medias</h2>
    <div class="edit__content" ref="mediaPanelRef">
      <div id="dropzone__container">
        <div id="dropzone" :class="{ isDragActive }" v-bind="getRootProps()">
          <input type="file" v-bind="getInputProps()" />
          <p v-if="isDragActive">Drop the files here ...</p>
          <p v-else>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </div>
      <div id="edit__medias">
        <template v-if="project.media && project.media.length > 0">
          <article
            class="editor__media"
            v-for="(media, index) in project.media"
            :key="media.id"
          >
            <project-media-item :media="media" />
            <span class="media__index">{{ formatNumber(index + 1) }}</span>
            <button
              class="btn__delete hover__underline"
              @click="deleteMedia(media.id)"
            >
              Delete
            </button>
          </article>
        </template>
      </div>
    </div>
  </aside>
</template>

<style lang="sass" scoped>

#scroll__container
  width: 100%
  min-height: var(--app-height)
  padding-bottom: calc($cell-height + $unit)

aside
  @include blur-bg
  position: fixed

  top: calc($cell-height + $unit-d)
  bottom: calc($unit * 5)
  width: calc($cell-width * 5 + $unit * 4)
  border-radius: $unit
  z-index: 10
  padding: $unit
  transition: transform 0.6s $bezier 0s
  display: flex
  flex-direction: column
  gap: $unit

  &#edit__panel
    right: $unit
    transform: translateX(0)

    &:not(.open)
      transform: translateX(calc($cell-width * 5 + $unit * 5))

  &#edit__media__panel
    left: $unit
    transform: translateX(0)

    &:not(.open)
      transform: translateX(calc($cell-width * -5 - $unit * 5))

    h2
      text-align: right

    #edit__medias
      display: flex
      flex-direction: column
      gap: $unit-h
      padding-bottom: $cell-height

  .edit__content
    display: flex
    width: 100%
    flex-grow: 1
    flex-direction: column
    gap: $unit
    padding: $unit 0
    overflow-y: scroll
    border-radius: $unit

    ::-webkit-scrollbar
      display: none

  label, .label
    @include detail
    display: flex
    flex-direction: column
    gap: $unit-h
    width: 100%
    color: $c-grey

  input, select, #dropzone
    @include blur-bg
    @include body
    background: rgba(0, 0, 0, 0.25)
    color: $c-white
    padding: $unit-h
    width: 100%
    border-radius: $unit-h
    color-scheme: dark

  input[type="file"]
    display: none

  #dropzone
    border: 1px solid $c-grey
    height: calc($cell-height * 1)
    @include detail
    display: flex
    align-items: center
    justify-content: center
    flex-grow: 1
    backdrop-filter: blur(10px)
    -webkit-backdrop-filter: blur(10px)
    background: rgba(255, 255, 255, 0.1)

  #dropzone__container
    display: flex
    gap: $unit-h
    position: fixed
    bottom: $unit-h
    left: $unit-h
    right: $unit-h
    z-index: 10

  #btn__files
    height: 100%
    padding: $unit-h
    background: $c-grey
    color: $c-black
    border-radius: $unit-h

    span
      @include detail

  .editor__media
    width: 100%
    height: calc($cell-height * 3 + $unit-d)
    border-radius: $unit-h
    overflow: hidden
    position: relative

    .media__index
      position: absolute
      top: $unit
      left: $unit
      color: $c-grey

    .btn__delete
      @include body
      position: absolute
      top: $unit
      right: $unit
      color: $c-white

.edit__btn
  position: fixed
  @include detail
  height: calc($unit * 3)
  width: calc($unit * 3)
  border-radius: calc($unit * 1.5)
  background: $c-white
  color: $c-black
  z-index: 11
  cursor: pointer
  transform: scale(1)
  transition: transform 0.6s $bezier 0s

  &:not(.active)
    transform: scale(0)

  &.disabled
    background: $c-black
    color: $c-grey
    cursor: not-allowed

#btn__close__info
  top: $unit
  right: $unit

#btn__close__media
  top: $unit
  left: $unit

#btn__save__layout
  bottom: $unit
  left: calc($cell-width * 3 + $unit * 4)
  width: calc($cell-width * 2 + $unit)


#btn__unpin
  bottom: $unit
  width: calc($unit * 6)
  left: $unit

#btn__open__info
  right: $unit-d
  top: calc($cell-height + $unit * 3)

#btn__open__media
  left: $unit-d
  top: calc($cell-height + $unit * 3)

#btn__save__info
  right: $unit
  bottom: $unit
  width: calc($cell-width * 5 + $unit * 4)
</style>
