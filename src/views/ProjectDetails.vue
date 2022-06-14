<script setup lang="ts">
import { identifier, useProjectData } from '@/store/projectData';
import { useRoute } from 'vue-router';
import { watch, onMounted } from '@vue/runtime-dom';
import { computed, ref } from '@vue/reactivity';

import { fetchProjectById } from '@/api/projects';

import Scroller from '@/views/Scroller.vue';
import { useGradientData } from '@/store/gradientData';
import { extractPalette, extractPaletteFromUrl } from '@/utils/gradient';
import Arrow from '../components/icons/Arrow.vue';
import MuteToggle from '@/components/MuteToggle.vue';
import ProjectMedia from '@/components/ProjectMedia.vue';

const projectData = useProjectData();
const gradientData = useGradientData();
const route = useRoute();

const loaded = ref<boolean>(false);
const rendered = ref(false);
const index = ref<string>('01');

const videoRef = ref<HTMLVideoElement>();

const formatNumber = (index: number): string =>
  index < 10 ? '0' + index.toString() : String(index);

const fetchProject = async () => {
  const ID: identifier | null = route?.params?.id
    ? String(route.params.id)
    : null;
  try {
    if (ID) {
      projectData.selectProject(Number(ID));
      console.log(ID);
      index.value = formatNumber(projectData.getIndexOfId(Number(ID)) + 1);
      console.log(index.value);
      const fetchedProject = await fetchProjectById(ID);
      if (fetchedProject && !Array.isArray(fetchedProject)) {
        console.log(fetchedProject);
        projectData.updateProject(fetchedProject, true);
        loaded.value = true;
        // generate new color palette only if project palette not already generated
        const maybeProjectPalette = projectData.palettes.find(
          ({ id }) => id === fetchedProject.id
        );
        if (maybeProjectPalette && maybeProjectPalette.palette) {
          gradientData.setColorsRgb(maybeProjectPalette.palette, true);
        } else {
          try {
            const generatedPalette = await extractPaletteFromUrl(
              fetchedProject.thumbnailUrl
            );
            if (generatedPalette) {
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

const project = computed(() => projectData?.selectedProject);

const formattedDate = computed<string>(() => {
  let m = project.value?.date?.getMonth();
  const M = m && m < 10 ? `0${m}` : String(m);
  return `${M}/${project.value?.date?.getFullYear()}`;
});

watch(() => route.params.id, fetchProject);

fetchProject();

onMounted(() => {
  if (loaded.value) {
    rendered.value = true;
  } else {
    watch(
      () => loaded.value,
      (newVal) => {
        console.log('aaaaa');
        if (newVal) {
          rendered.value = true;
        }
      }
    );
  }
});
</script>

<template>
  <Scroller v-if="loaded" direction="vertical" :dependencies="rendered">
    <section id="page__project__details" data-scroll-section>
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
        :muted="!projectData.soundActive"
      ></video>
      <img
        v-else
        crossorigin="anonymous"
        class="project__cover"
        :src="project?.thumbnailUrl"
        :alt="project?.title"
      />
      <span id="project__type" class="project__info">{{ project?.type }}</span>
      <span id="project__date" class="project__info">{{ formattedDate }}</span>
      <div id="project__title__container">
        <h2 v-if="project?.client" id="project__client" class="project__info">
          — {{ project?.client }}
        </h2>
        <h1 id="project__title">{{ project?.title }}</h1>
        <span id="project__index__container">
          <span id="project__index" class="project__info">{{ index }}</span>
          <span id="project__count"
            >/{{ formatNumber(projectData.projects.length) }}</span
          >
        </span>
      </div>

      <div id="mute__toggle__container">
        <MuteToggle />
      </div>

      <button type="button" id="scroll__indicator" class="details__btn">
        <span> Scroll</span>
        <Arrow :rotation="-90" />
      </button>

      <project-media
        v-if="project?.media && project?.media?.length > 0"
        v-for="media in project?.media"
        :key="media.id"
        :media="media"
      />
    </section>
  </Scroller>
</template>

<style lang="sass">
#page__project__details
  @include grid(19, true, 35, row)
  // padding-top: calc($cell-height + $unit + $unit)
  width: 100%
  // min-height: 100%
  height: 200vh !important
  // min-height: max-content
  // min-height: max-content

  .project__cover
    grid-column: 1 / -1
    grid-row: 1 / span 11
    width: calc(100% + $unit * 2)
    height: calc(100% + $unit)
    object-fit: cover
    margin: -$unit
    margin-bottom: 0
    pointer-events: none
    user-select: none
    -webkit-user-select: none
    z-index: 1

  .project__info
    @include body
    color: $c-white
    text-transform: capitalize
    z-index: 2

  #project__type
    grid-column-start: 4
    grid-row-start: 8

  #project__date
    grid-column-start: 5
    grid-row-start: 8

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

  #project__index__container
    align-self: flex-end

  #project__title
    transform: translateX(-5px)
    z-index: 2

  #project__count
    @include detail
    color: $c-white
    opacity: 0.7

  .details__btn
    @include link
    height: max-content
    width: max-content
    display: flex
    color: $c-white
    align-items: flex-start
    padding: 0
    z-index: 2


  #scroll__indicator
    grid-column-start: -5
    grid-column-end: -2
    grid-row: 11 / span 1
    justify-self: end
    z-index: 2

    svg
      margin-top: 3.5px
      height: 12px

  #mute__toggle__container
    grid-column-start: 2
    grid-column-end: 5
    grid-row: 11 / span 1
    z-index: 2
</style>
