<script setup lang="ts">
import { identifier, useProjectData } from '@/store/projectData';
import { useRoute } from 'vue-router';
import { watch, nextTick } from 'vue';
import { computed, ref } from 'vue';

import { fetchProjectById } from '@/api/projects';

import Scroller from '@/views/ScrollContainer.vue';
import { useGradientData } from '@/store/gradientData';
import { extractPaletteFromUrl } from '@/utils/gradient';
import Arrow from '../components/icons/Arrow.vue';
import MuteToggle from '@/components/MuteToggle.vue';
import ProjectMedia from '@/components/ProjectMedia.vue';
import { useScrollData } from '@/store/scrollData';
import { formatNumber } from '@/utils/format';
import NextProject from '@/components/NextProject.vue';
import { useI18n } from 'vue-i18n';

const projectData = useProjectData();
const gradientData = useGradientData();
const scrollData = useScrollData();
const route = useRoute();
const { t } = useI18n();

const loaded = ref<boolean>(false);
const index = ref<string>('01');

const videoRef = ref<HTMLVideoElement>();

const fetchProject = async () => {
  const ID: identifier | null = route?.params?.id
    ? String(route.params.id)
    : null;
  try {
    if (ID) {
      loaded.value = false;
      projectData.selectProject(Number(ID));
      projectData.inTransitionId = null;
      projectData.hoveringId = null;
      const projectIndex = projectData.getIndexOfId(Number(ID));
      preloadNextProject(projectIndex);
      // set display index
      index.value = formatNumber(projectIndex + 1);
      console.log(index.value);

      // don't reload data
      let fetchedProject = projectData.selectedProject;
      if (!fetchedProject?.fullyFetched) {
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
        projectData.updateProject(fetchedProject, true);

        loaded.value = true;
        // generate new color palette only if project palette not already generated
        const maybeProjectPalette = projectData.palettes.find(
          ({ id }) => id === fetchedProject?.id
        );
        if (maybeProjectPalette && maybeProjectPalette.palette) {
          console.log('set stored palette');
          gradientData.setColorsRgb(maybeProjectPalette.palette, true);
        } else {
          try {
            const generatedPalette = await extractPaletteFromUrl(
              fetchedProject.thumbnailUrl
            );
            if (generatedPalette) {
              console.log('set fetched palette');
              gradientData.setColorsRgb(generatedPalette, true);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const preloadNextProject = (projectIndex: number) => {
  const index =
    projectIndex < projectData.projects.length - 1 ? projectIndex + 1 : 0;
  const nextProject = projectData.projects[index];
  console.log(nextProject.fullyFetched);
};

watch(
  () => loaded.value,
  (value) => {
    if (value) {
      console.warn('NEW PROJECT');
      nextTick(() => {
        setTimeout(() => {
          scrollData.update();
        }, 1000);
        // scrollData.scrollTo(0);
      });
    }
  }
);

const project = computed(() => projectData?.selectedProject);

const formattedDate = computed<string>(() => {
  let m = project.value?.date?.getMonth();
  const M = m && m < 10 ? `0${m}` : String(m);
  return `${M}/${project.value?.date?.getFullYear()}`;
});

const scrollDown = () => {
  scrollData.scrollTo(window.innerHeight);
};

watch(() => route.params.id, fetchProject);

fetchProject();
</script>

<template>
  <Scroller direction="vertical">
    <div id="scroll__container">
      <section
        id="page__project__details"
        class="has-scroll-dragging"
        data-scroll-section
      >
        <div id="project__cover__container" data-scroll>
          <video
            v-if="project?.videoUrl"
            crossorigin="anonymous"
            class="project__cover"
            id="project__video"
            :src="project.videoUrl"
            disablePictureInPicture
            preload="auto"
            ref="videoRef"
            loop
            autoplay
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
          t(`project.type.${project.type}`)
        }}</span>
        <span id="project__date" class="project__info">{{
          formattedDate
        }}</span>
        <div id="project__title__container">
          <h3 v-if="project?.client" id="project__client" class="project__info">
            — {{ project?.client }}
          </h3>
          <h1 id="project__title">
            {{ project?.title }}
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
          <div class="icon__container">
            <Arrow :rotation="-90" />
          </div>
        </button>

        <project-media
          v-if="project?.media && project?.media?.length > 0"
          v-for="media in project?.media"
          :key="media.id"
          :media="media"
        />
      </section>
      <next-project></next-project>
    </div>
  </Scroller>
</template>

<style lang="sass" scoped>
#scroll__container
  width: 100%

#page__project__details
  @include grid(19, true, auto-fit, row)
  // padding-top: calc($cell-height + $unit + $unit)
  width: 100%
  max-width: 100vw
  height: max-content !important
  min-height: max-content
  // min-height: max-content

  #project__cover__container
    grid-column: 1 / -1
    grid-row: 1 / span 11
    width: calc(100% + $unit * 2)
    height: calc(100% + $unit)
    margin: -$unit -$unit 0 -$unit
    z-index: 1

  .project__cover
    width: 100%
    height: 100%
    object-fit: cover
    pointer-events: none
    user-select: none
    -webkit-user-select: none

  #project__type
    grid-column-start: 4
    grid-row-start: 8
    text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4)
    @media screen and (max-width: 600px)
      grid-column-start: 1
      grid-row-start: 7

  #project__date
    grid-column-start: 5
    grid-row-start: 8
    text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4)
    @media screen and (max-width: 600px)
      grid-column-start: 3
      grid-row-start: 7

  #project__title__container
    grid-column-start: 7
    grid-column-end: 18
    grid-row-start: 8
    grid-row-end: 11
    height: 100%
    width: max-content
    max-width: 100%
    display: flex
    flex-direction: column
    gap: 0px
    align-items: flex-start
    justify-content: flex-start
    z-index: 2

    @media screen and (max-width: 600px)
      grid-column-start: 1
      grid-row-start: 8
      grid-column-end: -1

  #project__index__container
    align-self: flex-end

  #project__title
    transform: translateX(-5px)
    z-index: 2
    max-width: 100%
    width: auto
    word-break: break-word
    text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4)

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
    grid-row: 11 / span 1
    justify-self: end
    z-index: 2
    cursor: pointer

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
    grid-row: 11 / span 1
    z-index: 2

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
</style>
