import Index from './views/SectionIndex.vue';
import ProjectDetails from './views/ProjectDetails.vue';
import Contact from './views/Contact.vue';
import ProjectEditor from './views/admin/ProjectEditor.vue';
import AdminPanel from './views/admin/AdminPanel.vue';
import ProjectList from './views/admin/ProjectList.vue';
import AdminDashboard from './views/admin/AdminDashboard.vue';

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
  {
    path: '/admin/new-project',
    component: ProjectEditor,
    name: 'projectEditor',
  },
  {
    path: '/admin',
    component: AdminPanel,
    name: 'AdminPanel',
    children: [
      {
        path: 'projects',
        component: ProjectList,
      },
      {
        path: '',
        component: AdminDashboard,
      },
      {
        path: 'media',
        component: ProjectList,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

router.afterEach((to, from) => {
  const betweenProjects =
    to.name === 'projectDetails' && from.name === 'projectDetails';
  to.meta.transitionName = betweenProjects ? 'slide-up' : 'fade';
});

export default router;
