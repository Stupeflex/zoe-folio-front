import Index from './views/Index.vue';
import ProjectDetails from './views/ProjectDetails.vue';
import Contact from './views/Contact.vue';

import { createRouter, createWebHistory } from 'vue-router';
// import { identifier, useProjectData } from './store/projectData';
// import { fetchProjectById } from './api/projects';
// import { extractPaletteFromUrl } from './utils/gradient';

// const fetchProject = async (ID: identifier) => {
//   conprojectData = useProjectData();
//   try {
//     if (ID) {
//       projectData.selectProject(ID);
//       const fetchedProject = await fetchProjectById(ID);
//       if (fetchedProject && !Array.isArray(fetchedProject)) {
//         console.log(fetchedProject);
//         const palette = await extractPaletteFromUrl(
//           fetchedProject.thumbnailUrl
//         );
//         projectData.updateProject(fetchedProject, true);
//       }
//     }
//   } catch (e) {
//     console.error(e);
//   }
// };

const routes = [
  {
    path: '/',
    component: Index,
    name: 'index',
  },
  {
    path: '/project/:id/:title',
    component: ProjectDetails,
    name: 'projectDetails',
    // beforeEnter: (to: { params: { id: string }}) => {
    //   console.log(to);
    // },
  },
  {
    path: '/contact',
    component: Contact,
    name: 'contact',
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

export default router;
