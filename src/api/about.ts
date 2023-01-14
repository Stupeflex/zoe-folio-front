import client from '@/api/client';
import {
  AboutData,
  AboutData__Raw,
  ApiClientResponse,
  Client,
  Client_Raw,
} from '@/api/types';
import { MediaType } from '@/store/projectData';

export const fetchClients = (): Promise<Client[]> => {
  return client('/clients?populate=*-nested')
    .then((raw: ApiClientResponse) => formatClients(raw))
    .catch((e) => {
      return [];
    });
};

const formatClients = (raw: ApiClientResponse): Client[] => {
  const format = (c: Client_Raw): Client => ({
    name: c.attributes.name,
    id: c.id,
    logo:
      !!c.attributes.logo.data && c.attributes.logo.data.attributes
        ? {
            url: c.attributes.logo.data.attributes.url, // eslint-disable-line prettier/prettier
            type: MediaType.image, // eslint-disable-line prettier/prettier
            id: c.id, // eslint-disable-line prettier/prettier
          } // eslint-disable-line prettier/prettier
        : null,
  });

  return raw.data.map((c) => format(c));
};

export const fetchAboutData = (): Promise<AboutData> =>
  client('/about-section?populate=*-nested').then((raw: AboutData__Raw) =>
    formatAboutData(raw)
  );

const formatAboutData = (raw: AboutData__Raw): AboutData => {
  const image = {
    type: MediaType.image,
    id: raw.data.id,
    url: raw.data.attributes.image.data.attributes.url,
  };

  return {
    description: raw.data.attributes.description,
    image,
  };
};
