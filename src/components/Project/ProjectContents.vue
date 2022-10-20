<script setup lang="ts">
import {
  identifier,
  Project,
  ProjectMedia,
  useProjectData,
} from '@/store/projectData';
import { computed, onMounted, ref } from 'vue';
import MuteToggle from '@/components/MuteToggle.vue';
import Arrow from '@/components/icons/Arrow.vue';
import { useI18n } from 'vue-i18n';
import { useScrollData } from '@/store/scrollData';
import { GridLayoutData, gridPosition, PartialGridItem } from '@/utils/grid';
import GridLayout from '@/components/GridLayout/GridLayout.vue';
import ProjectMediaItem from '@/components/ProjectMedia.vue';
import { formatNumber } from '@/utils/format';
import { useResponsiveData } from '@/store/responsiveData';

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
const emit = defineEmits(['deleteItem', 'gridLayout']);

const videoRef = ref<HTMLVideoElement>();

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
    props.projectIndex ? props.projectIndex + 1 : projectData.projects.length
  );
});

const projectMediaGridItems = computed<
  PartialGridItem<{ media: ProjectMedia }>[]
>(() => {
  return (props.project?.media ?? []).map((media) => ({
    ...media.size,
    id: media.id,
    extraData: {
      media: media,
    },
  }));
});

const previewId = ref<identifier | null>(null);

const scrollDown = () => {
  const toRemove = responsiveData.breakpoint === 'mobile' ? 4 : 2;
  const scrollHeight = gridPosition(responsiveData.rows - toRemove, 'y');
  scrollData.scrollTo(scrollHeight);
};

const onLayout = (l: GridLayoutData) => {
  scrollData.update();
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

const gridColumns = computed(() => responsiveData.columns - 2);

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
        v-if="project?.videoUrl"
        crossorigin="anonymous"
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
        v-else
        crossorigin="anonymous"
        class="project__cover"
        :src="project?.thumbnailUrl"
        :alt="project?.title"
      />
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
          >/{{ formatNumber(projectData.projects.length) }}</span
        >
      </span>
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
      :marginY="1"
      :marginX="1"
      axis="x"
      :editable="editable"
      :allow-delete="editable"
      @layout="onLayout"
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

  #project__type
    grid-column: 3 / span 2
    grid-row-start: 7
    text-shadow: $text-shadow
    position: relative
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

    @media screen and (max-width: $b-tablet)
      grid-column-start: 2

    @media only screen and (max-width: $b-mobile)
      grid-column: 2 / span 4
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
      grid-column-start: 4

    @media screen and (max-width: $b-mobile)
      grid-column: -6 / span 4
      grid-row-start: 6
      justify-self: end
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
      grid-column-start: 4
      grid-row: 8 / span 3

    @media screen and (max-width: $b-mobile)
      grid-column-start: 2
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

  #mute__toggle__container
    grid-column-start: 2
    grid-column-end: 5
    grid-row: -2 / span 1
    z-index: 2
    -webkit-transform: translateZ(0)
    -webkit-backface-visibility: hidden

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
</style>
