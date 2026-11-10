import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/converter',
    name: 'converter',
    component: () => import('@/views/ConverterView.vue'),
  },
  {
    path: '/cadence',
    name: 'cadence',
    component: () => import('@/views/CadenceView.vue'),
  },
  {
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/EditorView.vue'),
  },
  {
    path: '/editor/:id',
    name: 'editor-project',
    component: () => import('@/views/EditorView.vue'),
  },
  {
    path: '/reminder',
    name: 'reminder',
    component: () => import('@/views/ReminderView.vue'),
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/LibraryView.vue'),
  },
  {
    path: '/player',
    name: 'player',
    component: () => import('@/views/PlayerView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
