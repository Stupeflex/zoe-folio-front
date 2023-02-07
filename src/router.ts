import { createRouter, createWebHistory } from 'vue-router';
import Index from './views/SectionIndex.vue';
const ProjectDetails = () => import('@/views/ProjectDetails.vue');
const AdminPanel = () => import('@/views/admin/AdminPanel.vue');
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue');
const ProjectList = () => import('@/views/admin/ProjectList.vue');
const ProjectEditor = () => import('@/views/admin/ProjectEditor.vue');
const ProjectListEditor = () => import('@/views/admin/ProjectListEditor.vue');
const AdminLogin = () => import('@/views/admin/AdminLogin.vue');

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
    path: '/admin',
    component: AdminPanel,
    name: 'AdminPanel',
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
      },
      {
        path: 'projects',
        name: 'projectList',
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
