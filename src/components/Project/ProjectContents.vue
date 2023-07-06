<script setup lang="ts">
import {
  identifier,
  Project,
  ProjectMedia,
  useProjectData,
} from '@/store/projectData';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import MuteToggle from '@/components/MuteToggle.vue';
import Arrow from '@/components/icons/Arrow.vue';
import { useI18n } from 'vue-i18n';
import { useScrollData } from '@/store/scrollData';
import { GridLayoutData, gridPosition, PartialGridItem } from '@/utils/grid';
import GridLayout from '@/components/GridLayout/v2/GridLayout.vue';
import ProjectMediaItem from '@/components/ProjectMedia.vue';
import { formatNumber } from '@/utils/format';
import { useResponsiveData } from '@/store/responsiveData';
import { useDropzone } from 'vue3-dropzone';
import {
  convertMediasResponsive,
  convertSizeToResponsive,
} from '@/utils/grid.v2/position/responsive';
import { GridItemWithPosition } from '@/utils/grid.v2/types';

type Props = {
  project?: Project | Partial<Project>;
  projectIndex?: number;
  editable?: boolean;
};

const projectData = useProjectData();
const scrollData = useScrollData();
const responsiveData = useResponsiveData();
const { t } = useI18n();

const props = defineProps<Props>();
const emit = defineEmits(['deleteItem', 'gridLayout', 'editMedia']);

const videoRef = ref<HTMLVideoElement>();
const forceShowThumbnail = ref(!props.project?.videoUrl);

const formattedDate = computed<string>(() => {
  if (!props.project?.date) return 'No date set';
  let m = props.project?.date?.getMonth() + 1;
  const M = m && m < 10 ? `0${m}` : String(m);
  return `${M}/${props.project?.date?.getFullYear()}`;
});

const type = computed<string>(() => {
  if (!props.project?.type) return 'No type set';
  return t(`project.type.${props.project.type}`);
});

const title = computed<string>(() => {
  if (!props.project?.title) return 'Untitled';
  return props.project.title;
});

const index = computed<string>(() => {
  return formatNumber(
    props.projectIndex !== undefined
      ? props.projectIndex + 1
      : projectData.projects.length
  );
});

const gridColumns = computed(() =>
  responsiveData.breakpoint === 'mobile'
    ? responsiveData.columns
    : responsiveData.columns - 2
);

const placedItems = ref<GridItemWithPosition<{ media: ProjectMedia }>[]>([]);

const projectMediaGridItems = ref<PartialGridItem<{ media: ProjectMedia }>[]>(
  convertMediasResponsive(props.project?.media ?? [], gridColumns.value)
);

watchEffect(() => {
  if (props.project?.media) {
    const sameLength =
      props.project.media.length === projectMediaGridItems.value.length;

    if (sameLength) return;
    // merge incoming medias into current ones while conserving size
    projectMediaGridItems.value = props.project.media.map((media) => {
      const baseMedia = {
        ...media,
        size: keepMediaPosition(media),
      };
      const size = convertSizeToResponsive(baseMedia, gridColumns.value);
      return {
        ...size,
        id: media.id,
        extraData: {
          media: media,
        },
      };
    });
  }
});

const keepMediaPosition = (newMedia: ProjectMedia) => {
  const oldSize = placedItems.value.find(({ id }) => id === newMedia.id);
  if (!oldSize) return newMedia.size;
  const { height, width, x, y } = oldSize;
  console.log(oldSize);
  return { height, width, x, y };
};

watch(
  () => gridColumns.value,
  () => {
    if (props.editable || props.project?.media === undefined) return;
    projectMediaGridItems.value = convertMediasResponsive(
      props.project?.media ?? [],
      gridColumns.value
    );
  }
);

const previewId = ref<identifier | null>(null);

const scrollDown = () => {
  const toRemove = responsiveData.breakpoint === 'mobile' ? 4 : 2;
  const scrollHeight = gridPosition(responsiveData.rows - toRemove, 'y');
  scrollData.scrollTo(scrollHeight);
};

const onLayout = (l: GridLayoutData) => {
  scrollData.update();
  placedItems.value = l.items as GridItemWithPosition<{
    media: ProjectMedia;
  }>[];
  emit('gridLayout', l);
};

const onDeleteItem = (itemId: identifier) => {
  if (props.editable) {
    emit('deleteItem', itemId);
  }
};

const onPreview = (itemId: identifier) => {
  if (previewId.value === itemId) {
    previewId.value = null;
  } else {
    previewId.value = itemId;
  }
};

const toggleThumbnailPreview = (force: boolean) => {
  forceShowThumbnail.value = force;
};

const onDrop = async (files: File[]) => {
  if (files.length > 0 && props.project?.id) {
    emit('editMedia', {
      files,
      type: forceShowThumbnail.value ? 'image' : 'video',
    });
  }
};

const { getInputProps, getRootProps } = useDropzone({
  onDrop,
  accept: 'image/*,video/*',
});

onMounted(() => {
  if (videoRef.value) {
    videoRef.value?.play();
  }
});
</script>

<template>
  <section
    id="page__project__details"
    class="has-scroll-dragging"
    data-scroll-section
    data-scroll
  >
    <div id="project__cover__target"></div>
    <div
      id="project__cover__container"
      data-scroll
      data-scroll-sticky
      data-scroll-target="#project__cover__target"
    >
      <video
        v-if="project?.videoUrl && !forceShowThumbnail"
        crossorigin="use-credentials"
        class="project__cover"
        id="project__video"
        :src="project.videoUrl"
        preload="auto"
        ref="videoRef"
        loop
        autoplay
        playsinline
        :muted="!projectData.soundActive"
      ></video>
      <img
        v-else-if="project?.thumbnailUrl"
        crossorigin="use-credentials"
        class="project__cover"
        :src="project?.thumbnailUrl"
        :alt="project?.title"
      />
      <div v-else class="project__cover project__no__cover">
        Missing thumbnail or video.
      </div>
    </div>
    <span v-if="project?.type" id="project__type" class="project__info">{{
      type
    }}</span>
    <span id="project__date" class="project__info">{{ formattedDate }}</span>
    <div id="project__title__container" data-scroll>
      <h3 v-if="project?.client" id="project__client" class="project__info">
        — {{ project?.client }}
      </h3>
      <h1 id="project__title">
        {{ title }}
      </h1>
      <span id="project__index__container">
        <span class="project__info project__index">{{ index }}</span>
        <span class="project__count"
          >/{{ formatNumber(projectData.visibleProjects.length) }}</span
        >
      </span>
    </div>

    <div id="project__cover__toggle" v-if="editable">
      <button
        @click="toggleThumbnailPreview(false)"
        :class="{
          active: !forceShowThumbnail,
        }"
      >
        Video
      </button>
      <button
        @click="toggleThumbnailPreview(true)"
        :class="{
          active: forceShowThumbnail,
        }"
      >
        Image
      </button>
      <div id="edit" v-bind="getRootProps()">
        Edit
        <input type="file" v-bind="getInputProps()" />
      </div>
    </div>

    <div id="mute__toggle__container">
      <MuteToggle />
    </div>

    <button
      type="button"
      id="scroll__indicator"
      class="details__btn hover__parent"
      @click="scrollDown"
    >
      <span class="hover__underline hover__active">{{
        t('project.scroll')
      }}</span>
      <span class="icon__container">
        <Arrow :rotation="-90" />
      </span>
    </button>
  </section>
  <section
    id="project__media__grid"
    data-scroll-section
    v-if="project?.media && project?.media?.length > 0"
  >
    <GridLayout
      :items="projectMediaGridItems"
      :rows="12"
      :columns="gridColumns"
      :marginY="responsiveData.breakpoint === 'mobile' ? 1 : 0"
      :marginX="0"
      axis="y"
      :editable="editable"
      :allow-delete="editable"
      @layout="onLayout"
      @first-layout="onLayout"
      @deleteItem="onDeleteItem"
      :preview-allowed="!editable"
      :preview-id="previewId"
      @endPreview="previewId = null"
    >
      <template v-slot="{ media, id }">
        <project-media-item
          :media="media"
          @preview="onPreview"
          :preview="!editable && previewId === id"
          :blur="!editable && previewId !== null && previewId !== id"
        />
      </template>
    </GridLayout>
  </section>
</template>

<style lang="sass" scoped>

#page__project__details
  @include grid($columns, true, calc($rows - 2), row)
  width: 100%
  max-width: 100vw
  height: calc($cell-height * ($rows - 2) + $unit * ($rows - 2))
  padding-bottom: 0
  overflow: hidden

  @media only screen and (max-width: $b-mobile)
    @include grid($columns, true, calc($rows - 4), row)
    height: calc($cell-height * ($rows - 4) + $unit * ($rows - 4))

  #project__cover__target
    position: absolute
    top: 0
    left: 0
    height: 200%
    width: 100%
    opacity: 0.1
    pointer-events: none

  #project__cover__container
    grid-column: 1 / -1
    grid-row: 1 / -1
    width: calc(100% + $unit * 2)
    height: calc(100% + $unit)
    margin: $unit-n
    z-index: 1
    position: relative

  .project__cover
    width: 100%
    height: 100%
    object-fit: cover
    pointer-events: none
    user-select: none
    -webkit-user-select: none
    z-index: 1

  .project__no__cover
    display: flex
    align-items: center
    justify-content: center
    background: rgba(0,0,0,0.4)
    color: $c-white
    @include body

  #project__cover__toggle
    position: absolute
    bottom: calc($cell-height - $unit * 3)
    left: 0
    right: 0
    width: 100%
    display: flex
    justify-content: center
    align-items: center
    height: calc($unit * 3)
    z-index: 100
    transform: translateZ(0)

    button
      @include blur-bg()
      padding: $unit
      @include detail
      pointer-events: all
      cursor: pointer
      height: calc($unit * 3)
      transition: all 0.3s $bezier 0s
      color: $c-white

      &.active:not(.disabled)
        background: $c-white
        color: $c-black

      &:not(.active):hover
        font-variation-settings: "wght" 500

      &.disabled
        color: rgb(0, 0, 0, 0.4)

      &:first-child
        padding-left: calc($unit * 1.5)
        border-top-left-radius: calc($unit * 1.5)
        border-bottom-left-radius: calc($unit * 1.5)

      &:nth-child(2)
        padding-right: calc($unit * 1.5)
        border-top-right-radius: calc($unit * 1.5)
        border-bottom-right-radius: calc($unit * 1.5)

    #edit
      border-radius: calc($unit * 1.5)
      font-variation-settings: "wght" 550
      border: 1px solid $c-white
      @include process-step
      display: flex
      align-items: center
      justify-content: center
      margin-left: $unit
      height: calc($unit * 3)
      width: calc($unit * 3)
      background: $c-white
      color: $c-black

      input
        display: none

  #project__type
    grid-column: 3 / span 2
    grid-row-start: 7
    text-shadow: $text-shadow
    position: relative
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

    @media screen and (max-width: $b-tablet)
      grid-column-start: 2
      grid-column-end: span 3

    @media only screen and (max-width: $b-mobile)
      grid-column: 1 / span 4
      grid-row-start: 6
      @include process-step


  #project__date
    grid-column: 5 / span 2
    grid-row-start: 7
    text-shadow: $text-shadow
    position: relative
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

    @media screen and (max-width: $b-tablet)
      grid-column-start: 5
      grid-column-end: span 3

    @media screen and (max-width: $b-mobile)
      grid-column: 4 / -1
      grid-row-start: 6
      justify-self: start
      @include process-step

  #project__title__container
    grid-column-start: 7
    grid-column-end: -2
    grid-row-start: 7
    grid-row-end: 11
    height: 100%
    min-width: min-content
    width: 100%
    max-width: max-content
    display: flex
    flex-direction: column
    gap: 0
    align-items: flex-start
    justify-content: flex-start
    z-index: 2
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

    @media screen and (max-width: $b-tablet)
      grid-column-start: 2
      grid-row: 8 / span 3

    @media screen and (max-width: $b-mobile)
      grid-column-start: 1
      grid-column-end: -1
      grid-row-start: 7

  #project__index__container
    align-self: flex-end

  #project__title
    transform: translateX(-5px)
    z-index: 3
    max-width: 100%
    min-width: min-content
    width: auto
    text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4)

    @media screen and (max-width: $b-mobile)
      transform: translateX(0)

  .details__btn
    @include link
    height: max-content
    width: max-content
    display: flex
    color: $c-white
    align-items: flex-start
    text-decoration: none
    padding: 0
    z-index: 2

  #scroll__indicator
    grid-column-start: -5
    grid-column-end: -2
    grid-row: -2 / span 1
    justify-self: end
    z-index: 2
    cursor: pointer
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

    .icon__container
      transition: transform .3s ease-in

    svg
      margin-top: 3.5px
      height: 12px

    &:hover .icon__container
      transform: translateY($unit-h)

    @media only screen and (max-width: $b-mobile)
      grid-column-end: -1

  #mute__toggle__container
    grid-column-start: 2
    grid-column-end: 5
    grid-row: -2 / span 1
    z-index: 2
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

    @media only screen and (max-width: $b-mobile)
      grid-column-start: 1

.project__info
  @include body
  color: $c-white
  text-transform: capitalize
  z-index: 2
  text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4)

.project__count
  @include detail
  color: $c-white
  opacity: 0.7
  text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4)

#project__media__grid
  width: 100%
  padding: calc($cell-height * 0.5 + $unit * 2) calc($cell-width + $unit * 2) $unit calc($cell-width + $unit * 2)
  height: auto

  @media only screen and (max-width: $b-mobile)
    padding: calc($cell-height * 0.5 + $unit * 2) $unit $unit $unit
</style>
