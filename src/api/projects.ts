import type { Project } from '../store/projectData';
import client from './client';

export const fetchProjects = (): Promise<Project[]> => {
  return client('projects?populate=*')
    .then((res: Project[]) => res)
    .catch(() => [])
} 
