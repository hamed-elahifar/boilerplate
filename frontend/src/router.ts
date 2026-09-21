import { createRouter, createWebHistory } from 'vue-router';
import { onUnauthorized, token } from '@/lib/api';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    {
      path: '/',
      component: () => import('@/views/DashboardLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/DashboardView.vue') },
        { path: 'users', component: () => import('@/views/UsersView.vue') },
        {
          path: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  if (to.path !== '/login' && !token.get()) return '/login';
  if (to.path === '/login' && token.get()) return '/';
});

onUnauthorized.handler = () => void router.push('/login');
