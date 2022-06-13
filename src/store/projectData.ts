import { defineStore } from 'pinia';
import { fetchProjects } from '../api/projects';

export type MediaSize = {
  width: number;
  height: number;
}

export enum MediaType {
  image = 'image',
  video = 'video'
}

export interface ProjectMedia {
  url: string;
  type: MediaType,
  size: MediaSize,
}

export interface ProjectInfo {
  [k: string]: string | number;
}

export type identifier = string | number;

export type uid = string;

export type Project = {
  title: string;
  id: identifier;
  thumbnailUrl: string;
  size: MediaSize;
  media?: ProjectMedia[];
  description: string;
  informations: ProjectInfo[];
}

interface State {
  projects: Project[];
  selectedId: identifier;
}

export const useProjectData = defineStore('projectData', {
  state: (): State => ({
    projects: [],
    selectedId: 'default',
  }),
  getters: {
    selectedProject: (state: State): Project | undefined => state.projects.find(({ id }) => id === state.selectedId),
  },
  actions: {
    setProjects(projects: Project[]) {
      this.projects = projects;
    },
    async fetch(selectFirstProject = false): Promise<Project[]> {
      try {
        const res = await fetchProjects();
        console.log(res);
        this.projects = res;
        if(res[0]?.id && selectFirstProject) {
          this.selectedId = res[0].id;
        }
        return res;
      }
      catch(e) {
        console.error(e)
        return []
      }
    }
  }
  
})
