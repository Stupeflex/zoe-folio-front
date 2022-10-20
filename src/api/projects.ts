import {
  ApiProjectResponse,
  isFullyFetchedProjectMediaComponentArray,
  NullableSize,
  Project_Raw,
  ProjectMediaComponent__Raw,
} from './types';
import client, { baseUrl } from './client';
import {
  identifier,
  Project,
  MediaType,
  ProjectMedia,
} from '@/store/projectData';

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

export const toNullish = <T>(arg: T | null | undefined): T | undefined => {
  if (arg === null) return undefined;
  return arg;
};

interface NormalizedSize {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export const formatMediaSize = <T extends NullableSize>(
  size: T
): NormalizedSize => ({
    width: size.width ?? 5, // eslint-disable-line prettier/prettier
    height: size.height ?? 5, // eslint-disable-line prettier/prettier
    x: toNullish(size.x), // eslint-disable-line prettier/prettier
    y: toNullish(size.y), // eslint-disable-line prettier/prettier
  }); // eslint-disable-line prettier/prettier

export const formatProjects = (
  rawData: ApiProjectResponse,
  isFullData = false
): Project | Project[] => {
  const format = (raw: Project_Raw): Project => {
    console.log(raw.attributes.Medias);
    return {
      id: raw.id,
      client: raw.attributes.client,
      title: raw.attributes.title,
      thumbnailUrl: baseUrl + raw.attributes.thumbnail.data.attributes.url,
      size: formatMediaSize(raw.attributes.size),
      informations: [],
      media:
        raw.attributes.Medias.length > 0 &&
        isFullyFetchedProjectMediaComponentArray(raw.attributes.Medias)
          ? formatRawMediaArray(raw.attributes.Medias, (m) => ({
            size: formatMediaSize(m.size), // eslint-disable-line prettier/prettier
          })) // eslint-disable-line prettier/prettier
          : undefined,
      type: raw.attributes.type,
      date: raw.attributes.date ? new Date(raw.attributes.date) : undefined,
      videoUrl: raw.attributes.video.data?.attributes?.url
        ? baseUrl + raw.attributes.video.data.attributes.url
        : undefined,
      fullyFetched: isFullData,
    };
  };

  if (Array.isArray(rawData.data))
    return rawData.data.map(format).sort((a, b) => (a.id < b.id ? -1 : 1));

  return format(rawData.data);
};

type Media = Omit<ProjectMedia, 'size'>;
type MediaRaw = Omit<ProjectMediaComponent__Raw, 'size'>;

export const formatRawMediaArray = <
  M extends MediaRaw,
  T extends Record<string, unknown>
>(
  medias: M[], // eslint-disable-line
    dataExtractor?: (m: M) => T // eslint-disable-line
  ): (Media & T)[] => // eslint-disable-line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
    medias // eslint-disable-line prettier/prettier
      .filter((m) => !m.pending) // eslint-disable-line prettier/prettier
      .map((m) => ({ // eslint-disable-line prettier/prettier
        id: m.id, // eslint-disable-line prettier/prettier
        url: baseUrl + m.media.data.attributes.url, // eslint-disable-line prettier/prettier
        type: MediaType.image, // eslint-disable-line prettier/prettier
        ...(dataExtractor ? dataExtractor(m) : {}), // eslint-disable-line prettier/prettier
      })); // eslint-disable-line prettier/prettier

export const addMediasToProject = async (
  projectId: identifier,
  projectMediaCount: number,
  files: File[]
) => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('file' + index, file);
    });
    const medias = client(`/projects/${projectId}/media/add`, {
      method: 'POST',
      body: formData,
    });
    console.log(medias);
    return medias;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const deleteProjectMedia = (
  projectId: identifier,
  mediaId: identifier
) => {
  console.log(projectId, mediaId);
  return client(`/projects/${projectId}/media/delete/${mediaId}`, {
    method: 'DELETE',
  })
    .then((res) => !!res)
    .catch(() => false);
};

export const setMediaSizes = (
  projectId: identifier,
  projectMedias: {
    id: identifier;
    size: {
      width: number;
      height: number;
      x: number;
      y: number;
    };
  }[]
) => {
  const sizes = projectMedias.map(({ id, size }) => ({
    id,
    size,
  }));
  return client(`/projects/${projectId}/media/sizes`, {
    method: 'PATCH',
    body: JSON.stringify({ sizes }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => !!res)
    .catch(() => false);
};

export const updateProject = async (
  update: Pick<Project, 'id' | 'title' | 'type' | 'date' | 'client'>
) => {
  const payload = {
    title: update.title,
    client: update.client,
    type: update.type,
    date: update.date,
  };

  console.log(payload);
};
