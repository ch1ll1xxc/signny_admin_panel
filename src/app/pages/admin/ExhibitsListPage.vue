<template>
  <AdminLayout>
    <template #title>Экспонаты</template>

    <div class="space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Каталог экспонатов</h2>
          <p class="text-sm text-slate-600">Фильтрация и просмотр текущих карточек.</p>
        </div>

        <button
          v-if="canWrite"
          class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:bg-slate-300"
          :disabled="isCreating"
          @click="handleCreate"
        >
          {{ isCreating ? 'Создаем...' : 'Создать экспонат' }}
        </button>
      </div>

      <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Новый экспонат создается как черновик: он виден в админке сразу, а в публичном контуре появится только после публикации.
      </div>

      <div v-if="createError" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        {{ createError }}
      </div>

      <div class="grid gap-3 md:grid-cols-3">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Поиск по экспонатам"
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />

        <select v-model="hallFilter" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          <option value="all">Все экспозиции</option>
          <option v-for="hall in halls" :key="hall" :value="hall">{{ hall }}</option>
        </select>

        <select v-model="statusFilter" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          <option value="all">Все статусы</option>
          <option value="Опубликовано">Опубликовано</option>
          <option value="На согласовании">На согласовании</option>
          <option value="Черновик">Черновик</option>
          <option value="Согласовано">Согласовано</option>
          <option value="Доработка">Доработка</option>
        </select>
      </div>

      <div v-if="isLoading" class="text-sm text-slate-500">Загружаем экспонаты...</div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Название</th>
              <th class="px-4 py-3">Экспозиция</th>
              <th class="px-4 py-3">Статус</th>
              <th class="px-4 py-3">Ответственный</th>
              <th class="px-4 py-3">Обновлено</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="exhibit in filteredExhibits"
              :key="exhibit.id"
              class="border-t border-slate-100 cursor-pointer transition hover:bg-violet-50"
              @click="$router.push(`/admin/exhibits/${exhibit.id}`)"
            >
              <td class="px-4 py-3 font-medium text-violet-700">{{ exhibit.name }}</td>
              <td class="px-4 py-3 text-slate-600">{{ exhibit.hall }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusClass(exhibit.rawStatus)">
                  {{ exhibit.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ exhibit.owner }}</td>
              <td class="px-4 py-3 text-slate-600">{{ exhibit.updated }}</td>
            </tr>
            <tr v-if="!filteredExhibits.length">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">Экспонаты не найдены.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useNotify } from '../../composables/useNotify'
import { useExhibitsCatalog } from '../../composables/useExhibitsCatalog'
import { ApiError, workflowApi } from '@/api/workflowApi'
import type { VersionStatus } from '@/types/workflow'

const auth = useAuth()
const notify = useNotify()
const canWrite = computed(() => auth.can('exhibits.write'))

const { filteredExhibits, hallFilter, halls, searchQuery, statusFilter, isLoading, reload } = useExhibitsCatalog()

const isCreating = ref(false)
const createError = ref('')

const handleCreate = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    const role = auth.user.value?.role as 'editor' | 'admin' ?? 'editor'
    const autoTitle = `Новый экспонат ${new Date().toLocaleString('ru-RU')}`
    await workflowApi.createExhibit(autoTitle, role)
    searchQuery.value = ''
    hallFilter.value = 'all'
    statusFilter.value = 'all'
    notify.success('Экспонат создан как черновик. Для публичного контура требуется публикация.')
    await reload()
  } catch (e) {
    let message = e instanceof Error ? e.message : 'Ошибка создания'
    if (e instanceof ApiError && e.statusCode === 403) {
      message = 'Недостаточно прав для создания экспоната. Нужна роль редактора или администратора.'
    }
    if (e instanceof ApiError && e.statusCode === 401) {
      message = 'Сессия истекла. Войдите заново и повторите создание.'
    }
    createError.value = message
    notify.error(message)
  } finally {
    isCreating.value = false
  }
}

const statusClass = (status: VersionStatus): string => {
  const map: Record<VersionStatus, string> = {
    published: 'bg-green-100 text-green-700',
    on_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-violet-100 text-violet-700',
    needs_revision: 'bg-rose-100 text-rose-700',
    draft: 'bg-gray-100 text-gray-600',
    archived: 'bg-slate-100 text-slate-500',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}
</script>
