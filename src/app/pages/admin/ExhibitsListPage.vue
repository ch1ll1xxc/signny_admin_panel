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
          class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="!canWrite"
        >
          Создать экспонат
        </button>
      </div>

      <div class="grid gap-3 md:grid-cols-3">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Поиск по экспонатам"
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />

        <select v-model="hallFilter" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          <option value="all">Все залы</option>
          <option v-for="hall in halls" :key="hall" :value="hall">{{ hall }}</option>
        </select>

        <select v-model="statusFilter" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          <option value="all">Все статусы</option>
          <option value="Published">Опубликовано</option>
          <option value="OnReview">На согласовании</option>
          <option value="Draft">Черновик</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Название</th>
              <th class="px-4 py-3">Зал</th>
              <th class="px-4 py-3">Статус</th>
              <th class="px-4 py-3">Видео</th>
              <th class="px-4 py-3">Субтитры</th>
              <th class="px-4 py-3">Обновлено</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exhibit in filteredExhibits" :key="exhibit.id" class="border-t border-slate-100 cursor-pointer hover:bg-slate-50 transition" @click="$router.push(`/admin/exhibits/${exhibit.id}`)">
              <td class="px-4 py-3 font-medium text-violet-700 hover:text-violet-900">{{ exhibit.name }}</td>
              <td class="px-4 py-3 text-slate-600">{{ exhibit.hall }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusClass(exhibit.status)">
                  {{ exhibit.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ exhibit.hasVideo ? 'Да' : 'Нет' }}</td>
              <td class="px-4 py-3 text-slate-600">
                {{ exhibit.hasSubtitles ? exhibit.subtitlesType || 'Да' : 'Нет' }}
              </td>
              <td class="px-4 py-3 text-slate-600">{{ exhibit.updated }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExhibitSummary } from '../../domain/catalog'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useExhibitsCatalog } from '../../composables/useExhibitsCatalog'

const auth = useAuth()
const canWrite = computed(() => auth.can('exhibits.write'))

const { filteredExhibits, hallFilter, halls, searchQuery, statusFilter } = useExhibitsCatalog()

const statusClass = (status: ExhibitSummary['status']): string => {
  if (status === 'Published') {
    return 'bg-green-100 text-green-700'
  }

  if (status === 'OnReview') {
    return 'bg-amber-100 text-amber-700'
  }

  return 'bg-gray-100 text-gray-700'
}
</script>
