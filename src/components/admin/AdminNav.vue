<template>
  <nav id="nav__admin" :class="{ clear: clearNav, open }">
    <span id="email__tagline">{{ t('nav.hook') }}</span>
    <div id="email__container">
      <arrow-big />
      <a
        id="email"
        class="hover__underline"
        target="_blank"
        rel="noopener noreferrer"
        href="mailto:hello@zoecandito.studio"
        >hello@zoecandito.studio
      </a>
    </div>
    <router-link to="/admin" id="nav__logo">
      <Logo :height="20" />
      <span id="nav__logo__text"> admin panel </span>
    </router-link>
    <transition name="fade">
      <button
        v-if="displayBackButton"
        id="nav__goback"
        :class="{
          nav__link: true,
          hover__parent: true,
        }"
        @click="router.back()"
      >
        <span class="link__index">00</span>
        <span
          :class="{
            link__title: true,
            hover__underline: true,
            hover__active: true,
          }"
        >
          <Arrow :rotation="0" />
          {{ t('nav.back') }}
        </span>
      </button>
    </transition>
    <div id="nav__links">
      <router-link
        :to="link.to"
        v-for="(link, index) in links"
        :key="link.title"
        :class="{
          nav__link: true,
          hover__parent: true,
        }"
        exactActiveClass="active"
      >
        <span class="link__index"> 0{{ index + 1 }} </span>
        <span
          :class="{
            link__title: true,
            hover__underline: true,
            hover__active: true,
          }"
        >
          {{ link.title }}
        </span>
      </router-link>
    </div>
    <button
      @click="toggleContactOpen"
      :class="{
        nav__link: true,
        active: open,
        hover__parent: true,
      }"
      id="nav__contact"
    >
      <span class="link__index">05</span>
      <span
        :class="{
          link__title: true,
          hover__underline: true,
          hover__active: !open,
        }"
        >{{ t('nav.contact') }}</span
      >
    </button>
  </nav>

  <div
    v-if="open"
    @click="close"
    @wheel="close"
    @touchstart="close"
    @scroll="close"
    id="close__trigger"
    ref="closeTrigger"
  ></div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { ScrollSectionId, useScrollData } from '@/store/scrollData';
import ArrowBig from '@/components/icons/ArrowBig.vue';
import { useI18n } from 'vue-i18n';
import Arrow from '@/components/icons/Arrow.vue';
import Logo from '@/components/icons/NavLogo.vue';
import { adminPanelLinks } from '@/utils/navigation';

type navLink = {
  title: string;
  to: string;
  identifier?: string;
  id: ScrollSectionId;
  [key: string]: string | undefined;
};

const scrollData = useScrollData();
const route = useRoute();
const { t } = useI18n();
const router = useRouter();

const links: navLink[] = adminPanelLinks.map(({ title, ...rest }) => ({
  title: t(title),
  ...rest,
}));

const clearRoutes = ['projectEditor', 'projectEditorCreate'];

const routeNeedsClearBg = computed(() =>
  clearRoutes.includes(String(route?.name || 'no route'))
);

const scrolledDown = computed<boolean>(
  () => scrollData.scrollPos.y >= window.innerHeight / 2
);

const open = ref(false);
const closeTrigger = ref<HTMLElement | null>(null);

const clearNav = computed<boolean>(
  () => !open.value && routeNeedsClearBg.value && !scrolledDown.value
);

const toggleContactOpen = () => {
  open.value = !open.value;
};

const close = () => {
  open.value = false;
};

const displayBackButton = computed(() => route.name === 'projectDetails');
</script>

<style lang="sass">
#nav__admin
  position: fixed
  top: 0
  left: 0
  right: 0
  padding: $unit $unit 20px $unit
  min-height: max-content
  height: auto
  display: grid
  grid-template-columns: repeat($columns, $cell-width)
  grid-template-rows: repeat(3, $cell-height) auto
  grid-gap: $unit
  z-index: 10
  color: white
  transition: backdrop-filter 0.6s linear 0s, background-color 0.6s linear 0s, transform 0.6s $bezier 0s
  @media screen and (max-width: $b-mobile)
    padding: $unit

  &:not(.clear)
    @include blur-bg

  &:not(.open)
    transform: translateY(calc(($cell-height * 3 + $unit * 4) * -1))

    #email__container
      opacity: 0

  #nav__logo
    align-self: end
    grid-column: 2 / span 6
    grid-row: 4 / span 1
    transform: translateY(5px)

    @media only screen and (max-width: $b-tablet)
      grid-column-start: 1

    @media only screen and (max-width: $b-mobile)
      grid-column: 1 / span 1

    #nav__logo__text
      font-family: 'Monument', sans-serif
      font-weight: 500
      color: $c-white
      font-size: 18px
      text-transform: uppercase

      @media only screen and (max-width: $b-mobile)
        display: none

  #nav__goback
    grid-column: 7 / span 2
    grid-row: 4 / span 1
    cursor: pointer
    width: max-content

    @media only screen and (max-width: $b-tablet)
      grid-column-start: 6

    @media only screen and (max-width: $b-mobile)
      display: none

  #nav__links
    display: flex
    gap: $unit-d
    grid-column: 13 / -3
    grid-row: 4 / span 1
    padding-top: 20px

    @media only screen and (max-width: $b-tablet)
      grid-column-start: 8

    @media only screen and (max-width: $b-mobile)
      grid-column: 2 / -2
      justify-content: center

    &:hover .link__title
      opacity: 0.7


  .nav__link
    display: flex
    flex-direction: column
    justify-content: flex-end

    @media only screen and (max-width: $b-mobile)
      grid-column-end: span 2

    .link__index
      @include detail
      opacity: 0.7
      color: $c-grey

    .link__title
      @include link
      color: $c-white
      position: relative
      transform: translateX(0)
      transition: transform .3s $bezier, opacity .3s $bezier
      text-decoration: none

      &:before
        content: ""
        position: absolute
        left: calc($unit * -0.75)
        bottom: calc($unit * 0.35)
        height: calc($unit / 2)
        width: calc($unit / 2)
        border-radius: 50%
        background-color: $c-white
        transform: scale(0)
        transform-origin: left center
        transition: transform .3s $bezier

        @media only screen and (max-width: $b-mobile)
          height: calc($unit * 0.75)
          width: calc($unit * 0.75)
          bottom: calc($unit * 0.6)
          left: calc($unit * -1.25)

      &:after
        bottom: 0

    &.active > .link__title
      transform: translateX(calc(0.75 * $unit))

      @media only screen and (max-width: $b-mobile)
        transform: translateX(calc($unit * 1.25))

      &:before
        transform: scale(1)

    &:hover .link__title
      opacity: 1 !important

  #nav__contact
    grid-column: -4 / -2
    grid-row: 4 / span 1
    justify-self: end
    cursor: pointer
    outline: none

    @media screen and (max-width: $b-mobile)
      grid-column: -3 / -1

  #email__tagline
    @include body
    color: $c-grey
    grid-column: 5 / -5
    grid-row: 1 / 1
    align-self: end

    @media screen and (max-width: $b-tablet)
      grid-column: 2 / -2

  #email__container
    display: flex
    align-items: baseline
    gap: $unit
    grid-column: 5 / -2
    grid-row: 2 / 2
    transition: opacity 0.6s $bezier 0.3s

    @media screen and (max-width: $b-tablet)
      grid-column: 4 / -2
      justify-self: start

  #email
    @include title-medium
    text-decoration: none
    color: $c-white

#close__trigger
  width: 100%
  height: 100%
  position: fixed
  z-index: 9
  top: 0
  left: 0
</style>
