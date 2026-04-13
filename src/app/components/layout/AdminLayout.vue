<template>
  <el-container class="min-h-screen">
    <!-- Desktop sidebar -->
    <el-aside width="260px" class="hidden border-r border-slate-200 bg-white lg:block">
      <SidebarContent
        :nav-items="visibleNavItems"
        :email="user?.email || 'Гость'"
        :label="roleLabel"
        :initial="roleInitial"
        :avatar-class="roleAvatarClass"
        :label-class="roleLabelClass"
        @logout="handleLogout"
      />
    </el-aside>

    <!-- Mobile drawer -->
    <el-drawer v-model="drawerOpen" direction="ltr" :size="280" :show-close="false" class="!p-0">
      <SidebarContent
        :nav-items="visibleNavItems"
        :email="user?.email || 'Гость'"
        :label="roleLabel"
        :initial="roleInitial"
        :avatar-class="roleAvatarClass"
        :label-class="roleLabelClass"
        @navigate="drawerOpen = false"
        @logout="handleLogout"
      />
    </el-drawer>

    <el-container>
      <el-header class="!h-auto border-b border-slate-200 bg-white">
        <div class="flex items-center gap-3 px-4 py-3 md:px-8">
          <button class="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition" @click="drawerOpen = true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>

          <h2 class="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">
            <slot name="title">Страница</slot>
          </h2>

          <div class="flex shrink-0 items-center gap-2">
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="roleBadgeClass">
              {{ roleLabel }}
            </span>
            <span class="hidden text-sm text-slate-500 md:inline">{{ user?.email || '' }}</span>
          </div>
        </div>
      </el-header>

      <el-main class="bg-slate-50 px-4 pb-8 pt-6 md:px-8 md:pt-8">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import SidebarContent from './SidebarContent.vue'

const router = useRouter()
const auth = useAuth()
const { user } = auth

const drawerOpen = ref(false)

const navItems = [
  { to: '/admin/dashboard', label: 'Дашборд', permission: 'dashboard.read' },
  { to: '/admin/exhibits', label: 'Экспонаты', permission: 'exhibits.read' },
  { to: '/admin/faq', label: 'FAQ', permission: 'faq.read' },
  { to: '/admin/media', label: 'Медиатека', permission: 'media.read' },
  { to: '/admin/halls', label: 'Залы', permission: 'halls.read' },
  { to: '/admin/review', label: 'Модерация', permission: 'exhibits.read' },
  { to: '/admin/publish', label: 'Публикация', permission: 'publish.execute' },
  { to: '/admin/audit', label: 'Аудит', permission: 'audit.read' },
  { to: '/admin/analytics', label: 'Аналитика', permission: 'audit.read' },
  { to: '/admin/exports', label: 'Выгрузки', permission: 'exports.read' },
] as const

const visibleNavItems = computed(() => navItems.filter((item) => auth.can(item.permission)))

const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: 'Администратор', editor: 'Редактор', curator: 'Куратор', analyst: 'Аналитик' }
  return map[user.value?.role ?? ''] ?? 'Гость'
})

const roleInitial = computed(() => roleLabel.value.charAt(0))

const roleAvatarClass = computed(() => {
  const map: Record<string, string> = { admin: 'bg-violet-600', editor: 'bg-emerald-600', curator: 'bg-amber-600', analyst: 'bg-violet-600' }
  return map[user.value?.role ?? ''] ?? 'bg-slate-400'
})

const roleBadgeClass = computed(() => {
  const map: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-800',
    editor: 'bg-emerald-100 text-emerald-800',
    curator: 'bg-amber-100 text-amber-800',
    analyst: 'bg-violet-100 text-violet-800',
  }
  return map[user.value?.role ?? ''] ?? 'bg-slate-100 text-slate-600'
})

const roleLabelClass = computed(() => {
  const map: Record<string, string> = { admin: 'text-violet-600', editor: 'text-emerald-600', curator: 'text-amber-600', analyst: 'text-violet-600' }
  return map[user.value?.role ?? ''] ?? 'text-slate-400'
})

const handleLogout = () => {
  auth.logout()
  drawerOpen.value = false
  router.push('/admin/login')
}
</script>
