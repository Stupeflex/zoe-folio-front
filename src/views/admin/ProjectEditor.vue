<script setup lang="ts">
import { identifier, Project, useProjectData } from '@/store/projectData';
import { computed, watch } from 'vue';
import { reactive, ref } from 'vue';
import Scroller from '../ScrollContainer.vue';
import ProjectContents from '@/components/Project/ProjectContents.vue';
import { useRoute, useRouter } from 'vue-router';
import { adminProjectClient, fetchProjectById } from '@/api/projects';
import { useI18n } from 'vue-i18n';
import { FileRejectReason, useDropzone } from 'vue3-dropzone';
import ProjectMediaItem from '@/components/ProjectMedia.vue';
import { formatNumber } from '@/utils/format';
import { GridLayoutData } from '@/utils/grid';
import { useAdminData } from '@/store/adminData';

const route = useRoute();
const router = useRouter();
const projectData = useProjectData();
const adminData = useAdminData();
const { t } = useI18n();

const mediaPanelOpen = ref(false);
const infoPanelOpen = ref(false);
const saving = ref(false);
const saved = ref(false);
const updating = ref(false);
const updated = ref(false);
const infoPanelRef = ref<HTMLElement>();
const mediaPanelRef = ref<HTMLElement>();

const isNewProject = () => route.path === '/admin/project-editor/new';

const project = reactive<Partial<Project>>({
  title: 'New Project',
  ...(isNewProject() ? {} : projectData.selectedProject ?? {}),
});

const client = computed(() => adminProjectClient(adminData.token));

const isInfoFilled = ({
  id,
  type,
  date,
  title,
  client,
}: Partial<Project>): boolean => {
  const baseInfoFilled =
    !!client && !!type && !!title && !!date && title?.length > 0;
  return isNewProject() ? baseInfoFilled : baseInfoFilled && !!id;
};

const infoSaveAllowed = computed(() => isInfoFilled(project));

const gridLayout = ref<GridLayoutData>();

const displayDate = computed({
  get() {
    const D = project.date ?? new Date(Date.now());
    const m = D.getMonth() + 1;
    const d = D.getDate();
    const y = D.getFullYear();
    return `${y}-${formatNumber(m)}-${d}`;
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

const fetchProject = async (updateMedia?: boolean, updateInfo?: boolean) => {
  const ID: identifier | null = route?.params?.id
    ? String(route.params.id)
    : null;

  if (ID === null) return null;

  projectData.selectProject(Number(String(route.params.id ?? project.id)));
  let fetchedProject = projectData.selectedProject;
  if (!fetchedProject?.fullyFetched || updateMedia || updateInfo) {
    const justFetched = await fetchProjectById(ID);
    if (justFetched && !Array.isArray(justFetched)) {
      fetchedProject = justFetched;
    }
  }
  if (fetchedProject && fetchedProject?.id && !Array.isArray(fetchedProject)) {
    projectData.updateProject(fetchedProject, true);
    if (
      updateInfo &&
      (fetchedProject.thumbnailUrl || fetchedProject.videoUrl)
    ) {
      project.thumbnailUrl = fetchedProject.thumbnailUrl;
      project.videoUrl = fetchedProject.videoUrl;
    }
    if (updateMedia && fetchedProject.media) {
      project.media = fetchedProject.media;
    }
  }
  return fetchedProject;
};

const onDrop = async (files: File[]) => {
  if (files.length > 0 && project.id) {
    const response = await client.value.addMediasToProject(
      project.id,
      project.media?.length ?? 0,
      files
    );
    if (response) {
      await fetchProject(true);
    }
  }
};

const { getInputProps, getRootProps, isDragActive } = useDropzone({
  onDrop,
  accept: 'image/*',
  multiple: true,
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
    const res = await client.value.deleteProjectMedia(project.id, mediaId);
    if (res) {
      await fetchProject(true);
    }
  }
};

const onGridLayout = (l: GridLayoutData) => {
  gridLayout.value = l;
};

const unpinAll = () => {
  if (project.media && (project.media ?? []).length > 0) {
    project.media = project.media.map((media) => {
      return {
        ...media,
        size: {
          ...media.size,
          x: undefined,
          y: undefined,
        },
      };
    });
  }
};

const saveLayout = async () => {
  if (
    gridLayout.value &&
    project.media &&
    (project.media ?? []).length > 0 &&
    project.id &&
    !saving.value
  ) {
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
    const res = await client.value.setMediaSizes(project.id, mediaSizes);
    if (res) {
      await fetchProject(true);
      saved.value = true;
    }
    saving.value = false;
  }
};

const createNewProject = async () => {
  const res = await client.value.createNewProject({
    ...project,
    index: projectData.projects.length,
    size: {
      height: 4,
      width: 5,
    },
  });
  if (!res) return;
  // reload fetched projects
  await projectData.fetch();

  // set is new project to false
  await router.replace(`/admin/project-editor/${res.id}`);
  return res;
};

const onSaveClick = () =>
  isNewProject() ? createNewProject() : saveProjectInfo();

const saveProjectInfo = async () => {
  const p = Object.assign({}, project);
  if (isInfoFilled(p) && !updating.value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    try {
      updating.value = true;

      const res = await client.value.updateProject(p as Project);
      if (res) {
        await fetchProject(false, true);
        updated.value = true;
      }
      updating.value = false;
    } catch (e) {
      console.error(e);
      updating.value = false;
    }
  }
};

watch(route.params, (next) => {
  fetchProject(true, true);
});

watch(
  () => projectData.selectedProject,
  (data) => {
    if (isNewProject()) return;
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

const setupNewProject = () => {
  projectData.selectedId = 'default';
  project.title = 'New project';
  project.client = 'Unnamed client';
  project.date = new Date(Date.now());
};

const onSetup = () => {
  if (isNewProject()) {
    setupNewProject();
  } else {
    fetchProject();
  }
};

const onMediaEdit = async (payload: {
  type: 'image' | 'video';
  files: File[];
}) => {
  try {
    if (project.id === undefined) return;
    const isVideo = payload.type === 'video';
    const previousFileId = isVideo ? project.videoId : project.thumbnailId;
    const res = await client.value.setThumbnail(
      project.id,
      payload.files[0],
      isVideo,
      previousFileId
    );
    fetchProject(false, true);
  } catch (e) {
    console.error(e);
  }
};

onSetup();
</script>

<template>
  <Scroller direction="vertical" :delay="600">
    <div id="scroll__container">
      <project-contents
        :project="project"
        :project-index="
          isNewProject() ? projectData.projects.length : undefined
        "
        editable
        @deleteItem="deleteMedia"
        @gridLayout="onGridLayout"
        @editMedia="onMediaEdit"
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
  <button
    id="btn__unpin"
    :class="{ active: mediaPanelOpen, edit__btn: true }"
    @click="unpinAll"
  >
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
    @click="onSaveClick"
  >
    {{ updating ? 'Updating' : updated ? 'Updated!' : 'Update project info' }}
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
    <h2>Media</h2>
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
      @include detail
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
