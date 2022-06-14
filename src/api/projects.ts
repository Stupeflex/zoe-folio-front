import {
  ApiProjectResponse,
  isFullyFetchedProjectMediaComponentArray,
  Project_Raw,
} from './types';
import client, { baseUrl } from './client';
import { identifier, Project, MediaType } from '@/store/projectData';

export const fetchProjects = (): Promise<Project[] | Project> => {
  return client('/projects?populate=*')
    .then((res: ApiProjectResponse) => formatProjects(res))
    .catch(() => []);
};

export const fetchProjectById = (id: identifier) => {
  return client(`/projects/${id}?populate=*-nested`)
    .then((res: { data: Project_Raw }) => formatProjects(res, true))
    .catch((e) => {
      console.error(e);
      return null;
    });
};

export const formatProjects = (
  rawData: ApiProjectResponse,
  isFullData = false
): Project | Project[] => {
  console.log(rawData.data);

  const format = (raw: Project_Raw): Project => ({
    id: raw.id,
    client: raw.attributes.client,
    title: raw.attributes.title,
    thumbnailUrl: baseUrl + raw.attributes.thumbnail.data.attributes.url,
    size: {
      width: raw.attributes.size.width,
      height: raw.attributes.size.height,
      x: raw.attributes.size.x,
      y: raw.attributes.size.y,
    },
    informations: [],
    media:
      raw.attributes.Medias.length > 0 &&
      isFullyFetchedProjectMediaComponentArray(raw.attributes.Medias)
        ? raw.attributes.Medias.map((m) => ({
            id: m.id,
            url: baseUrl + m.media.data.attributes.url,
            type: MediaType.image,
            size: m.size,
          }))
        : undefined,
    type: raw.attributes.type,
    date: raw.attributes.date ? new Date(raw.attributes.date) : undefined,
    videoUrl: raw.attributes.video.data?.attributes?.url
      ? baseUrl + raw.attributes.video.data.attributes.url
      : undefined,
    fullyFetched: isFullData,
  });

  if (Array.isArray(rawData.data)) return rawData.data.map(format);

  return format(rawData.data);
};
