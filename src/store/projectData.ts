import { ProjectType } from '@/api/types';
import { defineStore } from 'pinia';
import { fetchProjects } from '@/api/projects';
import {
  extractPaletteFromUrl,
  rgbColor,
  defaultPalette,
} from '@/utils/gradient';

export type MediaSize = {
  width: number;
  height: number;
  x?: number;
  y?: number;
};

export enum MediaType {
  image = 'image',
  video = 'video',
}

export interface ProjectMedia {
  url: string;
  type: MediaType;
  size: MediaSize;
  id: identifier;
}

export interface ProjectInfo {
  [k: string]: string | number;
}

export type identifier = string | number;

export type ProjectPalette = {
  id: identifier;
  palette: rgbColor[] | null;
};

export type Project = {
  title: string;
  client?: string;
  id: identifier;
  thumbnailUrl: string;
  size: MediaSize;
  media?: ProjectMedia[];
  description?: string;
  informations: ProjectInfo[];
  type: ProjectType;
  date?: Date;
  videoUrl?: string;
  fullyFetched?: boolean;
};

interface State {
  projects: Project[];
  selectedId: identifier;
  filter: MediaType | null;
  palettes: ProjectPalette[];
  fetched: boolean;
  soundActive: boolean;
}

export const useProjectData = defineStore('projectData', {
  state: (): State => ({
    projects: [],
    selectedId: 'default',
    filter: null,
    palettes: [],
    fetched: false,
    soundActive: false,
  }),
  getters: {
    selectedProject: (state: State): Project | undefined =>
      state.projects.find(({ id }) => id === state.selectedId),
  },
  actions: {
    setProjects(projects: Project[]) {
      this.projects = projects;
    },
    async fetch(selectFirstProject = false): Promise<Project[] | null> {
      try {
        const res = await fetchProjects();
        if (Array.isArray(res)) {
          this.projects = res;
          const palettes = await Promise.all(
            res.map(({ thumbnailUrl }) => extractPaletteFromUrl(thumbnailUrl))
          );
          this.palettes = res.map(({ id }, index) => ({
            id,
            palette: palettes[index],
          }));
          this.fetched = true;
          if (res[0]?.id && selectFirstProject) {
            this.selectedId = res[0].id;
          }
          return res;
        }
        return null;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    selectProject(selectedId: identifier) {
      if (this.projects.some(({ id }) => id === selectedId)) {
        this.selectedId = selectedId;
      }
    },
    getIndexOfId(projectId: identifier): number {
      return this.projects.findIndex((p) => p.id === projectId);
    },
    updateProject(project: Project, setAsSelected = false) {
      const i = this.projects.findIndex((p) => p.id === project.id);
      if (i >= 0) {
        this.projects[i] = project;
        if (setAsSelected) {
          this.selectProject(project.id);
        }
      }
    },
    setSound(soundActive: boolean) {
      this.soundActive = soundActive;
    },
    toggleSound() {
      this.setSound(!this.soundActive);
    },
  },
});
