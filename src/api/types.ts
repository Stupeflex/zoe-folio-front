import { identifier, MediaType } from '@/store/projectData';

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

export interface NullableSize {
  x: number | null;
  y: number | null;
  width: number;
  height: number;
}

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

export type ApiMedia__Raw = ApiData<Media__Raw>;

export interface ApiMedia {
  url: string;
  type: MediaType;
  id: identifier;
}

export type ProjectMediaComponent__Raw = {
  id: identifier;
  size: ProjectMediaSize__Raw;
  media: ApiMedia__Raw;
  pending?: boolean;
};

export type ProjectMediaComponent__Partial = {
  id: identifier;
  pending: true;
};

export const isFullyFetchedProjectMediaComponent = (
  media: ProjectMediaComponent__Raw | ProjectMediaComponent__Partial
): media is ProjectMediaComponent__Raw => {
  const m = media as ProjectMediaComponent__Raw;
  return !!m?.media && !m.pending;
};

export const isFullyFetchedProjectMediaComponentArray = (
  medias: (ProjectMediaComponent__Raw | ProjectMediaComponent__Partial)[]
): medias is ProjectMediaComponent__Raw[] => {
  return !!(
    medias.length > 0 &&
    medias.every((m) => isFullyFetchedProjectMediaComponent(m))
  );
};

export type ProjectMediaSize = {
  width: number;
  height: number;
  x?: number;
  y?: number;
  id: identifier;
};

export interface ProjectMediaSize__Raw extends NullableSize {
  id: identifier;
}

export type Project_Raw = ApiItem<{
  client: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  size: ProjectMediaSize__Raw;
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

export interface ProcessStep {
  index: number;
  title: string;
  content: string;
  id?: identifier;
  size?: {
    y?: number;
    x?: number;
    height?: number;
    width?: number;
  };
  animation: Record<string, unknown>;
}

export interface StudioMedia_Raw {
  id: identifier;
  title: string;
  media: ApiMedia__Raw;
}

export interface StudioMedia extends ApiMedia {
  title: string;
}

export type StudioData_Raw = ApiData<{
  address: string;
  contact_email: string;
  createdAt: string;
  updatedAt: string;
  hook: string;
  publishedAt: string;
  photos: StudioMedia_Raw[];
}>;

export type StudioData = {
  address: string;
  contact_email: string;
  createdAt: string;
  updatedAt: string;
  hook: string;
  publishedAt: string;
  photos: StudioMedia[];
};

export type Client_Raw = ApiItem<{
  name: string;
  id: identifier;
  logo: ApiData<Media__Raw | null>;
}>;

export interface Client {
  id: identifier;
  name: string;
  logo: ApiMedia | null;
}

export type ApiClientResponse = {
  data: Client_Raw[];
};

export type AboutData__Raw = ApiData<{
  description: string;
  image: ApiMedia__Raw;
}>;

export type AboutData = {
  description: string;
  image: ApiMedia;
};
