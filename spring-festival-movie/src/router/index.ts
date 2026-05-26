import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'form',
    component: () => import('../views/FormPage.vue'),
  },
  {
    path: '/submitted',
    name: 'submitted',
    component: () => import('../views/SubmittedPage.vue'),
  },
  {
    path: '/closed',
    name: 'closed',
    component: () => import('../views/ClosedPage.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
