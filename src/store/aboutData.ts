import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiMedia, Client } from '@/api/types';
import { fetchAboutData, fetchClients } from '@/api/about';

export const useAboutData = defineStore('aboutData', () => {
  const clients = ref<Client[]>([]);
  const description = ref<string>();
  const image = ref<ApiMedia>();
  const loaded = ref(false);

  const getClients = async () => {
    clients.value = await fetchClients();
    console.log(clients.value);
    return true;
  };

  const getAboutData = async () => {
    const res = await fetchAboutData();
    description.value = res.description;
    image.value = res.image;
    console.log(res.image);
    return true;
  };

  const fetchAll = async () => {
    console.log('fetch all');
    if (!loaded.value) {
      await Promise.all([getClients(), getAboutData()]);
    }
    loaded.value = true;
  };

  return {
    getClients,
    fetchAll,
    loaded,
    clients,
    description,
    image,
  };
});
