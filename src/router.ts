import Index from './views/SectionIndex.vue';
import ProjectDetails from './views/ProjectDetails.vue';
import Contact from './views/Contact.vue';
import ProjectEditor from './views/admin/ProjectEditor.vue';
import AdminPanel from './views/admin/AdminPanel.vue';
import ProjectList from './views/admin/ProjectList.vue';
import AdminDashboard from './views/admin/AdminDashboard.vue';
import AdminLogin from './views/admin/AdminLogin.vue';

import GridTest from './views/GridTest.vue';

import { createRouter, createWebHistory } from 'vue-router';
import ProjectListEditor from '@/views/admin/ProjectListEditor.vue';

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
  },
  {
    path: '/contact',
    component: Contact,
    name: 'contact',
  },
  {
    path: '/admin',
    component: AdminPanel,
    name: 'AdminPanel',
    children: [
      {
        path: '',
        name: 'AdminDasboard',
        component: AdminDashboard,
      },
      {
        path: 'projects',
        name: 'projectList',
        component: ProjectList,
      },
      {
        path: 'clients',
        component: ProjectList,
      },
      {
        path: 'project-editor/:id',
        component: ProjectEditor,
        name: 'projectEditor',
      },
      {
        path: 'project-editor/new',
        component: ProjectEditor,
        name: 'projectEditorCreate',
      },
      {
        path: 'login',
        component: AdminLogin,
        name: 'AdminLogin',
      },
      {
        path: 'project-list-editor',
        component: ProjectListEditor,
        name: 'ProjectListEditor',
      },
    ],
  },
  {
    path: '/grid-test',
    component: GridTest,
    name: 'GridTest',
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

router.afterEach((to, from) => {
  const betweenProjects =
    to.name === 'projectDetails' && from.name === 'projectDetails';
  to.meta.transitionName =
    to?.meta?.transitionName ?? betweenProjects ? 'fade' : 'fade';
});

export default router;
