<template>
  <el-container class="min-h-screen">
    <el-aside width="260px" class="hidden border-r border-slate-200 bg-white lg:block">
      <div class="border-b border-slate-200 px-5 py-5">
        <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-600">Signny</p>
        <h1 class="mt-1 text-lg font-semibold text-slate-900">Админ-панель</h1>
      </div>

      <nav class="mt-2 flex flex-col gap-0.5 px-3">
        <router-link
          v-for="item in visibleNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="route.path === item.to
            ? 'bg-cyan-50 text-cyan-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="route.path === item.to ? 'bg-cyan-500' : 'bg-slate-300'" />
          {{ item.label }}
        </router-link>
      </nav>

      <div class="mt-auto border-t border-slate-100 px-4 py-4">
        <div class="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" :class="roleAvatarClass">
            {{ roleInitial }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">{{ user?.email || 'Гость' }}</p>
            <p class="text-xs" :class="roleLabelClass">{{ roleLabel }}</p>
          </div>
        </div>
        <button
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          @click="handleLogout"
        >
          Выйти
        </button>
      </div>
    </el-aside>

    <el-container>
      <el-header class="!h-auto border-b border-slate-200 bg-white px-5 py-4 md:px-8">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Административный контур</p>
            <h2 class="text-2xl font-semibold text-slate-900">
              <slot name="title">Страница</slot>
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="roleBadgeClass">
              {{ roleLabel }}
            </span>
            <span class="text-sm text-slate-500">{{ user?.email || 'Пользователь' }}</span>
          </div>
        </div>
      </el-header>

      <el-main class="bg-slate-50 px-5 pb-8 pt-8 md:px-8 md:pt-10">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const { user } = auth

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
  const map: Record<string, string> = { admin: 'bg-cyan-600', editor: 'bg-emerald-600', curator: 'bg-amber-600', analyst: 'bg-violet-600' }
  return map[user.value?.role ?? ''] ?? 'bg-slate-400'
})

const roleBadgeClass = computed(() => {
  const map: Record<string, string> = {
    admin: 'bg-cyan-100 text-cyan-800',
    editor: 'bg-emerald-100 text-emerald-800',
    curator: 'bg-amber-100 text-amber-800',
    analyst: 'bg-violet-100 text-violet-800',
  }
  return map[user.value?.role ?? ''] ?? 'bg-slate-100 text-slate-600'
})

const roleLabelClass = computed(() => {
  const map: Record<string, string> = { admin: 'text-cyan-600', editor: 'text-emerald-600', curator: 'text-amber-600', analyst: 'text-violet-600' }
  return map[user.value?.role ?? ''] ?? 'text-slate-400'
})

const handleLogout = () => {
  auth.logout()
  router.push('/admin/login')
}
</script>
