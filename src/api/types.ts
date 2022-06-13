import {identifier} from "../store/projectData";

export type defaultAttributes = {
  [k: string]: unknown;
}

export interface ApiItem<T = defaultAttributes> {
  attributes: T,
  id: identifier
}

export interface ApiData<T = defaultAttributes> {
  data: ApiItem<T>;
}

export type MediaExtension = '.png' | '.jpg' | '.mp4' | '.avi' | '.webp' | '.jpeg';

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
}

export interface ProjectThumbnail_Raw extends ApiData<{
  alternativeText: string;
  caption: string;
  createdAt: string;
  ext: MediaExtension;
  hash: string;
  name: string;
  formats: {
    large: MediaFormat;
    medium: MediaFormat;
    small: MediaFormat;
    thumbnail: MediaFormat;
  };
  height: number;
  width: number;
  size: number;
  url: string;
  updatedAt: string;
}> {
  title: string;
  updatedAt: string;
}

export type Project_Raw = ApiItem<{
  client: string;
  createdAt: string;
  publishedAt: string;
  size: {
    width: number;
    height: number;
    id: identifier;
  },
  thumbnail: ProjectThumbnail_Raw;
}>

export type ApiProjectResponse = {
  data: ApiItem<Project_Raw>[]
}
