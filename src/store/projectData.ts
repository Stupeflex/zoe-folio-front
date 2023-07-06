import { ProjectType } from '@/api/types';
import { defineStore } from 'pinia';
import { fetchProjects } from '@/api/projects';
import { extractPaletteFromUrl, rgbColor } from '@/utils/gradient';
import { computed, ref } from 'vue';
import {
  Breakpoint,
  columns,
  gridRatios,
  responsiveMap,
  rows,
} from '@/utils/responsive';
import { useResponsiveData } from '@/store/responsiveData';
import {
  GridItem,
  GridLayoutData,
  GridLayoutOptions,
} from '@/utils/grid.v2/types';
import { normalizeGridItems } from '@/utils/grid.v2/items';
import { generateGridLayout } from '@/utils/grid.v2';

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
  mediaHeight?: number;
  mediaWidth?: number;
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
  archived: boolean;
  id: identifier;
  thumbnailUrl: string;
  size: MediaSize;
  media?: ProjectMedia[];
  description?: string;
  informations: ProjectInfo[];
  type: ProjectType;
  date?: Date;
  videoUrl?: string;
  videoId?: identifier;
  thumbnailId?: identifier;
  fullyFetched?: boolean;
  index: number;
};

export const projectsToGridItems = (
  projects: Project[]
): Partial<GridItem<{ project: Project }>>[] =>
  projects.map((project) => ({
    ...project.size,
    id: project.id,
    extraData: {
      project,
    },
  }));

const projectGridReservedSpace = (b: Breakpoint) => {
  const titleHeight = b == 'mobile' ? 4 : b === 'tablet' ? 4 : 3;
  const titleWidth = b === 'mobile' ? columns() - 2 : b === 'tablet' ? 11 : 10;
  let spaces = [
    {
      x: 0,
      y: rows() - titleHeight - 2,
      width: titleWidth,
      height: titleHeight,
    },
    {
      x: 0,
      y: 0,
      height: rows(),
      width: b === 'mobile' ? 2 : 3,
    },
  ];
  if (b === 'tablet') {
    spaces = [
      ...spaces,
      {
        x: 0,
        y: 12,
        width: 100,
        height: rows() - 12,
      },
    ];
  }
  if (b === 'mobile') {
    spaces = [
      {
        x: 0,
        y: Math.floor(rows() / 2),
        height: rows() - Math.floor(rows() / 2),
        width: 0,
      },
      // {
      //   x: 0,
      //   y: rows() - 2,
      //   height: 2,
      //   width: 100,
      // },
      {
        x: 0,
        y: 12,
        width: 100,
        height: rows() - 12,
      },
    ];
  }
  return spaces;
};

export const projectGridOptions = (b: Breakpoint): GridLayoutOptions => ({
  marginX: 2,
  marginY: 1,
  rows: responsiveMap.rows[b] - 2,
  columns: responsiveMap.columns[b],
  axis: 'x',
  reservedSpace: projectGridReservedSpace(b),
  fillAvailable: false,
});

export const useProjectData = defineStore('projectData', () => {
  const projects = ref<Project[]>([]);
  const selectedId = ref<identifier>('default');
  const filters = ref<ProjectType[]>([]);
  const palettes = ref<ProjectPalette[]>([]);
  const fetched = ref(false);
  const soundActive = ref(false);
  const inTransitionId = ref<identifier | null>(null);
  const hoveringId = ref<identifier | null>(null);

  const responsiveData = useResponsiveData();

  // getters
  const selectedProject = computed((): Project | undefined =>
    projects.value.find(({ id }) => id === selectedId.value)
  );

  const visibleProjects = computed(() =>
    projects.value.filter(({ archived }) => !archived)
  );

  const filteredProjects = computed((): Project[] =>
    filters.value.length > 0
      ? visibleProjects.value.filter((project) =>
          filters.value.includes(project.type)
        )
      : visibleProjects.value
  );
  const gridItems = computed((): (Partial<GridItem> & { id: identifier })[] => {
    const columnRatio = gridRatios.columns[responsiveData.breakpoint];
    const rowRatio = gridRatios.rows[responsiveData.breakpoint];
    const scale = responsiveMap.thumbnailScale[responsiveData.breakpoint];
    return normalizeGridItems(projectsToGridItems(filteredProjects.value)).map(
      (item) => {
        const shouldAutoPosition =
          responsiveData.breakpoint === 'tablet' ||
          responsiveData.breakpoint === 'mobile';
        const width = Math.round(item.width * columnRatio * scale);
        const height = Math.round(item.height * rowRatio * scale);
        return {
          ...item,
          width,
          height,
          x: shouldAutoPosition ? undefined : item.x,
          y: shouldAutoPosition ? undefined : item.y,
        };
      }
    );
  });
  const gridLayout = computed(
    (): GridLayoutData =>
      generateGridLayout(
        gridItems.value,
        projectGridOptions(responsiveData.breakpoint)
      )
  );

  // actions

  const setProjects = (p: Project[]) => {
    projects.value = p;
  };
  const fetch = async (
    selectFirstProject = false
  ): Promise<Project[] | null> => {
    try {
      const res = await fetchProjects();
      if (Array.isArray(res)) {
        setProjects(res);
        const pls = await Promise.all(
          res.map(({ thumbnailUrl }) => extractPaletteFromUrl(thumbnailUrl))
        );
        palettes.value = res.map(({ id }, index) => ({
          id,
          palette: pls[index],
        }));
        fetched.value = true;
        if (res[0]?.id && selectFirstProject) {
          selectedId.value = res[0].id;
        }
        return res;
      }
      return null;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const selectProject = (sid: identifier) => {
    if (projects.value.some(({ id }) => id === sid)) {
      selectedId.value = sid;
    }
  };

  const getIndexOfId = (projectId: identifier): number => {
    return projects.value.findIndex((p) => p.id === projectId);
  };

  const getVisibleIndexOfId = (projectId: identifier): number => {
    return visibleProjects.value.findIndex((p) => p.id === projectId);
  };

  const updateProject = (project: Project, setAsSelected = false) => {
    const i = projects.value.findIndex((p) => p.id === project.id);
    if (i >= 0) {
      projects.value[i] = project;
      if (setAsSelected) {
        selectProject(project.id);
      }
    }
  };

  const setProjectArchived = (id: identifier, archived: boolean) => {
    const i = projects.value.findIndex((p) => p.id === id);
    if (i >= 0) {
      projects.value[i].archived = archived;
    }
  };

  const setSound = (active: boolean) => {
    soundActive.value = active;
  };

  const toggleSound = () => {
    setSound(!soundActive.value);
  };

  const replacePalette = (id: identifier, palette: rgbColor[]) => {
    const index = palettes.value.findIndex((p) => p.id === id);
    if (palettes.value[index].palette === null) {
      palettes.value[index].palette = palette;
    }
  };

  const toggleFilter = (filter: ProjectType) => {
    const filterIndex = filters.value.indexOf(filter);
    if (filterIndex >= 0) {
      filters.value.splice(filterIndex, 1);
    } else {
      filters.value.push(filter);
    }
  };

  return {
    projects,
    visibleProjects,
    filteredProjects,
    selectedId,
    filters,
    palettes,
    fetched,
    soundActive,
    inTransitionId,
    hoveringId,
    selectedProject,
    gridItems,
    gridLayout,
    setProjects,
    fetch,
    selectProject,
    getIndexOfId,
    getVisibleIndexOfId,
    updateProject,
    setSound,
    toggleSound,
    replacePalette,
    toggleFilter,
    setProjectArchived,
  };
});
