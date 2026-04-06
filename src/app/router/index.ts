import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginPage from '../pages/admin/LoginPage.vue'
import DashboardPage from '../pages/admin/DashboardPage.vue'

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
  const requiresAuth = to.meta.requiresAuth !== false
  const isLoggedIn = !!localStorage.getItem('session_token')

  if (requiresAuth && !isLoggedIn) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
  } else if (to.path === '/admin/login' && isLoggedIn) {
    next({ name: 'AdminDashboard' })
  } else {
    next()
  }
})

export default router
