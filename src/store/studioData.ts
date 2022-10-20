import { defineStore } from 'pinia';
import { fetchStudio } from '@/api/studio';
import { StudioData } from '@/api/types';

type Nullable<T> = { [K in keyof T]: T[K] | null };

interface State {
  data: Nullable<StudioData>;
  fetched: boolean;
}

export const useStudioData = defineStore('studioData', {
  state: (): State => ({
    data: {
      address: null,
      contact_email: null,
      createdAt: null,
      updatedAt: null,
      hook: null,
      publishedAt: null,
      photos: [],
    },
    fetched: false,
  }),
  actions: {
    async fetch() {
      try {
        this.data = await fetchStudio();
        this.fetched = true;
      } catch (e) {
        console.error(e);
        this.fetched = false;
      }
    },
  },
});
