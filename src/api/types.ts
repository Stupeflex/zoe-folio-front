import { identifier } from '../store/projectData';

export type defaultAttributes = {
  [k: string]: unknown;
};

export interface ApiItem<T = defaultAttributes> {
  attributes: T;
  id: identifier;
}

export interface ApiData<T = defaultAttributes> {
  data: ApiItem<T>;
}

export enum MediaExtension {
  PNG = '.png',
  JPG = '.jpg',
  MP4 = '.mp4',
  AVI = '.avi',
  WEBP = '.webp',
}

export enum ProjectType {
  clip = 'clip',
  fiction = 'fiction',
  pub = 'pub',
}

export type MediaFormat = {
  ext: MediaExtension;
  hash: string;
  height: number;
  mime: string;
  name: string;
  path?: string;
  size: number;
  url: string;
  width: number;
};

export type Media__Raw = {
  alternativeText: string;
  caption: string;
  createdAt: string;
  ext: MediaExtension;
  hash: string;
  name: string;
  mime: string;
  formats?: {
    large?: MediaFormat;
    medium?: MediaFormat;
    small?: MediaFormat;
    thumbnail?: MediaFormat;
  };
  height?: number;
  width?: number;
  size: number;
  url: string;
  previewUrl?: string;
  updatedAt: string;
};

export interface ProjectThumbnail__Raw extends ApiData<Media__Raw> {
  title: string;
  updatedAt: string;
}

export type ProjectVideo__Raw = ApiItem<Media__Raw>;

export type ProjectMedia__Raw = ApiData<Media__Raw>;

export type ProjectMediaComponent__Raw = {
  id: identifier;
  size: ProjectMediaSize;
  media: ProjectMedia__Raw;
};

export type ProjectMediaComponent__Partial = {
  id: identifier;
};

export const isFullyFetchedProjectMediaComponent = (
  media: ProjectMediaComponent__Raw | ProjectMediaComponent__Partial
): media is ProjectMediaComponent__Raw => {
  const m = media as ProjectMediaComponent__Raw;
  if (m?.media && m?.size) {
    return true;
  }
  return false;
};

export const isFullyFetchedProjectMediaComponentArray = (
  medias: (ProjectMediaComponent__Raw | ProjectMediaComponent__Partial)[]
): medias is ProjectMediaComponent__Raw[] => {
  if (
    medias.length > 0 &&
    medias.every((m) => isFullyFetchedProjectMediaComponent(m))
  ) {
    return true;
  }
  return false;
};

export type ProjectMediaSize = {
  width: number;
  height: number;
  x?: number;
  y?: number;
  id: identifier;
};

export type Project_Raw = ApiItem<{
  client: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  size: ProjectMediaSize;
  thumbnail: ProjectThumbnail__Raw;
  type: ProjectType;
  date?: string;
  video: {
    data?: ProjectVideo__Raw;
  };
  Medias: (ProjectMediaComponent__Raw | ProjectMediaComponent__Partial)[];
}>;

export type ApiProjectResponse = {
  data: Project_Raw[] | Project_Raw;
};
