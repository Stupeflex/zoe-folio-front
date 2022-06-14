import { Project } from '@/store/projectData';

export const generateProjectLink = (project: Project) =>
  `/project/${project.id}/${project.title.replaceAll(' ', '-').toLowerCase()}`;
