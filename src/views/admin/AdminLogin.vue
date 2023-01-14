<script setup lang="ts">
import { ref } from 'vue';
import CTA from '@/components/CTA.vue';
import { useAdminData } from '@/store/adminData';
import { useRouter, useRoute } from 'vue-router';

const adminData = useAdminData();
const router = useRouter();
const route = useRoute();
const email = ref<string>();
const password = ref<string>();
const errorMessage = ref<string | null>(null);

// eslint-disable-next-line no-undef
const onSubmit = async (e: SubmitEvent) => {
  if (!e.target) return;
  const formData = new FormData(e.target as HTMLFormElement);
  const credentials = Object.fromEntries(formData) as {
    password: string;
    email: string;
  };
  if (credentials.email.length === 0 || credentials.password.length === 0) {
    return setErrorMessage('Email or password is empty.');
  }
  await adminData.login(credentials, {
    onSuccess: () => {
      resetErrorMessage();
      if (adminData.previousRoute && adminData.previousRoute !== route.path) {
        router.push({ path: adminData.previousRoute });
        adminData.previousRoute = undefined;
      }
    },
    onError: setErrorMessage,
  });
};

const setErrorMessage = (message: string) => {
  errorMessage.value = message;
};

const resetErrorMessage = () => {
  errorMessage.value = null;
};
</script>

<template>
  <div id="admin__login">
    <h1>Admin Panel</h1>
    <h3>Log in</h3>
    <p id="info">
      Log in with your admin credentials to edit and manage the website&apos;s
      content.<br />
      This allows you to add and/or archive projects and edit the main
      sections&apos; written text.
    </p>

    <form id="form" @submit.prevent="onSubmit">
      <label id="email__label">
        Email address
        <input type="email" name="email" id="email" v-bind="email" />
      </label>

      <label id="password__label">
        Password
        <input
          type="password"
          name="password"
          id="password"
          v-bind="password"
        />
      </label>

      <span id="error" v-if="errorMessage">{{ errorMessage }}</span>
      <CTA>Log in</CTA>
    </form>
  </div>
</template>

<style lang="sass" scoped>
#admin__login
  @include grid($columns, true, calc($rows - 1))
  padding: 0
  height: 100%
  width: 100%

  h1
    grid-column: 4 / -1
    grid-row-end: span 2
    align-self: end

  h3
    @include body-big
    color: $c-grey
    grid-column: 4 / span 4
    align-self: end

  #info
    @include body
    color: $c-grey
    grid-column: 4 / span 4

  #form
    grid-column: calc($columns - 8) / span 4
    grid-row-start: 4
    padding: 0

  #email__label, #password__label, .cta
    grid-column-end: span 4

  input
    font-variation-settings: "wght" 400
    height: $cell-height
    margin-top: $unit-h
    border: 1px solid rgba(255, 255, 255, 0.5)

  label
    @include body
    align-self: end
    color: $c-grey
    display: block

    &:nth-child(2)
      padding-top: $unit-d

  #error
    @include body
    display: block
    font-variation-settings: "wght" 620
    font-size: $unit
    margin: $unit-h 0
    color: #dc5b5b

  .cta
    margin-top: $unit-d

  @media only screen and (max-width: $b-tablet)
    h1, h3, #info
      grid-column-start: 3

    h3, #info, #form
      grid-column-end: span 5

    #form
      grid-column-start: 9

  @media only screen and (max-width: $b-mobile)
    h1, h3, #info, #form
      grid-column-start: 2
      grid-column-end: span calc($columns - 2)

    #form
      grid-row-start: 6
</style>
