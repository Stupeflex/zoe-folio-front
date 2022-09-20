<script setup lang="ts">
import { Project, useProjectData } from '@/store/projectData';
import { computed } from '@vue/reactivity';
import { reactive, ref } from 'vue';
import { formatNumber } from '@/utils/format';
import Scroller from '../Scroller.vue';
import MuteToggle from '@/components/MuteToggle.vue';
import ProjectMedia from '@/components/ProjectMedia.vue';

const projectData = useProjectData();

const project = reactive<Partial<Project>>({});

const formattedDate = computed<string>(() => {
  if (!project?.date) return '0';
  let m = project?.date?.getMonth();
  const M = m && m < 10 ? `0${m}` : String(m);
  return `${M}/${project?.date?.getFullYear()}`;
});

const index = ref<string>('01');

const onCoverChange = (e) => {
  console.log(e.target.files);
};
</script>

<template>
  <Scroller direction="vertical" :delay="600">
    <div id="scroll__container">
      <section
        id="page__project__details"
        class="has-scroll-dragging"
        data-scroll-section
      >
        <div id="project__cover__container" data-scroll data-scroll-speed="2">
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
            v-else-if="project.thumbnailUrl"
            crossorigin="anonymous"
            class="project__cover"
            :src="project?.thumbnailUrl"
            :alt="project?.title"
          />
          <label v-else class="project__cover">
            <div id="cover__input__inside"></div>
            <input type="file" @change="onCoverChange" />
          </label>
        </div>
        <span id="project__type" class="project__info">{{
          project?.type
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
          class="details__btn"
          @click="scrollDown"
        >
          <span> Scroll</span>
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
    margin: -$unit
    margin-bottom: 0
    z-index: 1

  .project__cover
    width: 100%
    height: 100%
    object-fit: cover
    pointer-events: none
    user-select: none
    -webkit-user-select: none

    #cover__input__inside
      width: 100%
      height: 100%
      background-color: red
      pointer-events: all
      user-select: all

    input[type="file"]
      display: none

  #project__type
    grid-column-start: 4
    grid-row-start: 8
    @media screen and (max-width: 600px)
      grid-column-start: 1
      grid-row-start: 7

  #project__date
    grid-column-start: 5
    grid-row-start: 8
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
    cursor: pointer

    .icon__container
      transition: transform .3s ease-in

    svg
      margin-top: 3.5px
      height: 12px

    &:hover .icon__container
      transform: translateY(math.div($unit, 2))

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

.project__count
  @include detail
  color: $c-white
  opacity: 0.7
</style>
