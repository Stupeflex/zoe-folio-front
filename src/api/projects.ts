/* eslint-disable prettier/prettier */
import {
  ApiError,
  ApiItem,
  ApiProjectResponse,
  isFullyFetchedProjectMediaComponentArray,
  NullableSize,
  Project_Raw,
  ProjectMediaComponent__Raw,
  Token,
} from './types';
import client, { authenticatedClientFactory, Methods } from './client';
import {
  identifier,
  Project,
  MediaType,
  ProjectMedia,
} from '@/store/projectData';

const authenticatedClient = authenticatedClientFactory();

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

export const randomImgQuery = (url: string): string => {
  return url + '?ts=' +  String((Math.random() * 1000).toFixed(0));
};

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
    return {
      id: raw.id,
      client: raw.attributes.client,
      title: raw.attributes.title,
      archived: raw.attributes.archived,
      thumbnailUrl: randomImgQuery(raw.attributes.thumbnail.data.attributes.formats?.large?.url ?? raw.attributes.thumbnail.data?.attributes?.url ?? 'https://zoecandito.s3.eu-west-3.amazonaws.com/no_thumbnail_74019aaea9.png'),
      size: formatMediaSize(raw.attributes.size),
      informations: [],
      media:
        raw.attributes.Medias.length > 0 &&
        isFullyFetchedProjectMediaComponentArray(raw.attributes.Medias)
          ? formatRawMediaArray(raw.attributes.Medias, (m) => ({
              size: formatMediaSize(m.size), // eslint-disable-line prettier/prettier
              mediaHeight: m.media.data.attributes.height,
              mediaWidth: m.media.data.attributes.width,
            })) // eslint-disable-line prettier/prettier
          : undefined,
      type: raw.attributes.type,
      date: raw.attributes.date ? new Date(raw.attributes.date) : undefined,
      videoUrl: raw.attributes.video.data?.attributes?.url
        ? raw.attributes.video.data.attributes.url
        : undefined,
      videoId: raw.attributes.video.data?.id ?? undefined,
      thumbnailId: raw.attributes.thumbnail.data?.id ?? undefined,
      fullyFetched: isFullData,
      index: raw.attributes.index,
    };
  };

  if (Array.isArray(rawData.data))
    return rawData.data.map(format).sort((a, b) => (a.id < b.id ? -1 : 1));

  return format(rawData.data);
};

type Media = Omit<ProjectMedia, 'size'>;
type MediaRaw = Omit<ProjectMediaComponent__Raw, 'size'>;

/* eslint-disable prettier/prettier */
export const formatRawMediaArray = <
  M extends MediaRaw,
  T extends Record<string, unknown>
>(
  medias: M[],
  dataExtractor?: (m: M) => T
): (Media & T)[] =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  medias
    .filter((m) => !m.pending)
    .map((m) => ({
      id: m.id,
      url: randomImgQuery(m.media.data.attributes.url),
      type: MediaType.image,
      ...(dataExtractor ? dataExtractor(m) : {}),
    }));

/* eslint-enable prettier/prettier */

/* eslint-disable prettier/prettier */
export const addMediasToProject =
  (token?: Token) =>
    async (projectId: identifier, projectMediaCount: number, files: File[]) => {
      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append('file' + index, file);
        });
        return await authenticatedClient(
          `/projects/${projectId}/media/add`,
          token,
          {
            method: Methods.post,
            body: formData,
          }
        );
      } catch (e) {
        console.error(e);
        return false;
      }
    };

/* eslint-enable prettier/prettier */

export const deleteProjectMedia =
  (token?: Token) => (projectId: identifier, mediaId: identifier) => {
    return authenticatedClient(
      `/projects/${projectId}/media/delete/${mediaId}`,
      token,
      {
        method: Methods.delete,
      }
    )
      .then((res) => !!res)
      .catch(() => false);
  };

/* eslint-disable prettier/prettier */
export const setMediaSizes =
  (token?: Token) =>
  (
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
    return authenticatedClient(`/projects/${projectId}/media/sizes`, token, {
      method: Methods.patch,
      body: JSON.stringify({ sizes }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => !!res)
      .catch(() => false);
  };
/* eslint-enable prettier/prettier */

/* eslint-disable prettier/prettier */
export const updateProject =
  (token?: Token) =>
  async (
    update: Pick<Project, 'id' | 'title' | 'type' | 'date' | 'client'>
  ) => {
    const payload = {
      data: {
        title: update.title,
        client: update.client,
        type: update.type,
        date: update.date,
      },
    };

    return authenticatedClient(`/projects/${update.id}`, token, {
      method: Methods.put,
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => !!res)
      .catch(() => false);
  };
/* eslint-enable prettier/prettier */

/* eslint-disable prettier/prettier */
export const setArchived =
  (token?: Token) => (id: identifier, archived: boolean) => {
    const payload = JSON.stringify({
      data: {
        archived,
      },
    });

    return authenticatedClient(`/projects/${id}`, token, {
      method: Methods.put,
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => !!res)
      .catch(() => false);
  };

interface CreateProjectResponse {
  data?: ApiItem<Partial<Project>>;
  error?: ApiError;
}

/* eslint-enable prettier/prettier */
export const createNewProject =
  (token?: Token) => async (data: Partial<Project>) => {
    const payload = {
      data: {
        ...data,
        archived: true,
      },
    };

    return authenticatedClient('/projects/?populate=*-nested', token, {
      method: Methods.post,
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res: CreateProjectResponse) => {
        if (res.error || !res.data || !res.data.id) return null;
        return {
          id: res.data.id,
          ...res.data.attributes,
        };
      })
      .catch((e) => {
        console.error(e);
        return null;
      });
  };

export const setThumbnailData =
  (token?: Token) =>
  async (
    id: identifier,
    file: File,
    isVideo: boolean,
    previousFileId?: identifier
  ) => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('ref', 'api::project.project');
    formData.append('refId', String(id));
    formData.append('field', isVideo ? 'video' : 'thumbnail');
    const endpoint =
      previousFileId !== undefined ? `/upload?id=${previousFileId}` : '/upload';
    return authenticatedClient(endpoint, token, {
      method: Methods.post,
      body: formData,
    })
      .then((res) => {
        return !!res;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  };

export interface ProjectSize {
  id: identifier;
  size: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  };
}

export const setProjectSizes =
  (token?: Token) => async (projectSizes: ProjectSize[]) => {
    return authenticatedClient('/projects/sizes', token, {
      method: Methods.patch,
      body: JSON.stringify({ projectSizes }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        return !!res;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  };

export const adminProjectClient = (token?: Token) => ({
  setMediaSizes: setMediaSizes(token),
  deleteProjectMedia: deleteProjectMedia(token),
  addMediasToProject: addMediasToProject(token),
  updateProject: updateProject(token),
  setArchived: setArchived(token),
  createNewProject: createNewProject(token),
  setThumbnail: setThumbnailData(token),
  setProjectSizes: setProjectSizes(token),
});
