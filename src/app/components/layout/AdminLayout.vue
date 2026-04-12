<template>
  <el-container class="min-h-screen">
    <el-aside width="260px" class="hidden border-r border-slate-200 bg-white lg:block">
      <div class="border-b border-slate-200 px-5 py-5">
        <p class="text-xs uppercase tracking-[0.2em] text-cyan-700">Signny Admin</p>
        <h1 class="mt-1 text-xl font-semibold text-slate-900">Панель управления</h1>
      </div>

      <el-menu :default-active="route.path" class="border-0" router>
        <el-menu-item v-for="item in visibleNavItems" :key="item.to" :index="item.to">
          {{ item.label }}
        </el-menu-item>
      </el-menu>

      <div class="px-4 py-4">
        <el-button type="danger" plain class="w-full" @click="handleLogout">Выйти</el-button>
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
            <el-tag effect="plain" type="info">{{ user?.role || 'guest' }}</el-tag>
            <el-text type="info">
              <slot name="user-info">{{ user?.email || 'Пользователь' }}</slot>
            </el-text>
          </div>
        </div>
      </el-header>

      <el-main class="px-5 pb-8 pt-8 md:px-8 md:pt-10">
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

const handleLogout = () => {
  auth.logout()
  router.push('/admin/login')
}
</script>
