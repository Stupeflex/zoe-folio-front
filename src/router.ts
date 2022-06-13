import Index from './views/Index.vue';
import ProjectDetails from './views/ProjectDetails.vue';

import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: Index,
  }, {
    path: '/project/:id/:title',
    component: ProjectDetails,
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

export default router;
