import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage.vue'
import AdminExhibitsPage from '@/pages/admin/AdminExhibitsPage.vue'
import AdminReviewQueuePage from '@/pages/admin/AdminReviewQueuePage.vue'
import AdminFaqPage from '@/pages/admin/AdminFaqPage.vue'
import AdminPublishPage from '@/pages/admin/AdminPublishPage.vue'
import AdminAuditPage from '@/pages/admin/AdminAuditPage.vue'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage.vue'
import AdminExportsPage from '@/pages/admin/AdminExportsPage.vue'
import ExhibitDetailPage from '@/pages/ExhibitDetailPage.vue'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/workflow'

type AppRouteMeta = {
  roles?: Role[]
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { roles: ['editor', 'curator', 'admin'] } as AppRouteMeta,
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: AdminDashboardPage, meta: { roles: ['editor', 'curator', 'admin'] } as AppRouteMeta },
        { path: 'exhibits', component: AdminExhibitsPage, meta: { roles: ['editor', 'curator', 'admin'] } as AppRouteMeta },
        { path: 'review-queue', component: AdminReviewQueuePage, meta: { roles: ['curator', 'admin'] } as AppRouteMeta },
        { path: 'faq', component: AdminFaqPage, meta: { roles: ['editor', 'curator', 'admin'] } as AppRouteMeta },
        { path: 'publish', component: AdminPublishPage, meta: { roles: ['admin'] } as AppRouteMeta },
        { path: 'audit', component: AdminAuditPage, meta: { roles: ['admin'] } as AppRouteMeta },
        { path: 'analytics', component: AdminAnalyticsPage, meta: { roles: ['curator', 'admin'] } as AppRouteMeta },
        { path: 'exports', component: AdminExportsPage, meta: { roles: ['curator', 'admin'] } as AppRouteMeta },
      ],
    },
    {
      path: '/exhibit/:id',
      component: ExhibitDetailPage,
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const routeWithRoles = [...to.matched].reverse().find((record) => {
    const routeMeta = record.meta as AppRouteMeta
    return Array.isArray(routeMeta.roles)
  })
  const requiredRoles = (routeWithRoles?.meta as AppRouteMeta | undefined)?.roles

  if (requiredRoles && !requiredRoles.includes(authStore.role)) {
    return '/admin/dashboard'
  }

  return true
})

export default router
