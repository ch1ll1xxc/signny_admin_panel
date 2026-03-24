<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex min-h-screen max-w-7xl">
      <aside class="w-72 border-r border-slate-200 bg-white p-5">
        <h1 class="text-xl font-semibold">Музейная админ-панель</h1>
        <p class="mt-1 text-sm text-slate-500">Редактура, согласование и публикация</p>

        <label class="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Активная роль
          <select
            :value="auth.role"
            class="mt-2 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700"
            @change="onRoleChange"
          >
            <option value="editor">Редактор</option>
            <option value="curator">Куратор</option>
            <option value="admin">Администратор</option>
          </select>
        </label>

        <nav class="mt-6 space-y-2">
          <RouterLink
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            class="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="flex-1 p-6 md:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/workflow'

const auth = useAuthStore()

const navItems = [
  { label: 'Дашборд', to: '/admin/dashboard', roles: ['editor', 'curator', 'admin'] as Role[] },
  { label: 'Экспонаты', to: '/admin/exhibits', roles: ['editor', 'curator', 'admin'] as Role[] },
  { label: 'Очередь согласования', to: '/admin/review-queue', roles: ['curator', 'admin'] as Role[] },
  { label: 'FAQ', to: '/admin/faq', roles: ['editor', 'curator', 'admin'] as Role[] },
  { label: 'Публикация', to: '/admin/publish', roles: ['admin'] as Role[] },
  { label: 'Аудит', to: '/admin/audit', roles: ['admin'] as Role[] },
  { label: 'Аналитика', to: '/admin/analytics', roles: ['curator', 'admin'] as Role[] },
  { label: 'Выгрузки', to: '/admin/exports', roles: ['curator', 'admin'] as Role[] },
]

const visibleNavItems = computed(() => navItems.filter((item) => item.roles.includes(auth.role)))

const onRoleChange = (event: Event) => {
  const nextRole = (event.target as HTMLSelectElement).value as Role
  auth.setRole(nextRole)
}
</script>
