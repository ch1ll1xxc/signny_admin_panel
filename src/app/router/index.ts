import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginPage from '../pages/admin/LoginPage.vue'
import DashboardPage from '../pages/admin/DashboardPage.vue'
import ExhibitsListPage from '../pages/admin/ExhibitsListPage.vue'
import UnauthorizedPage from '../pages/admin/UnauthorizedPage.vue'
import type { Permission } from '../domain/auth'
import { useAuthStore } from '../store/modules/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: LoginPage,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      requiredPermission: 'dashboard.read',
    },
  },
  {
    path: '/admin/exhibits',
    name: 'AdminExhibits',
    component: ExhibitsListPage,
    meta: {
      requiresAuth: true,
      requiredPermission: 'exhibits.read',
    },
  },
  {
    path: '/admin/forbidden',
    name: 'AdminForbidden',
    component: UnauthorizedPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: DashboardPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  auth.hydrate()

  const requiresAuth = to.meta.requiresAuth !== false
  const requiredPermission = to.meta.requiredPermission as Permission | undefined

  if (requiresAuth && !auth.isAuthenticated) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    return
  }

  if (requiredPermission && !auth.can(requiredPermission)) {
    next({ name: 'AdminForbidden' })
    return
  }

  if (to.path === '/admin/login' && auth.isAuthenticated) {
    next({ name: 'AdminDashboard' })
    return
  }

  next()
})

export default router
