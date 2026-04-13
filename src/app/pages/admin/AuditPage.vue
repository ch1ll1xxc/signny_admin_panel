<template>
  <AdminLayout>
    <template #title>Журнал аудита</template>

    <div class="space-y-4">
      <div class="grid gap-3 md:grid-cols-2">
        <select v-model="actorFilter" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          <option value="all">Все пользователи</option>
          <option v-for="actor in actors" :key="actor" :value="actor">{{ actor }}</option>
        </select>

        <select v-model="outcomeFilter" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          <option value="all">Все результаты</option>
          <option value="success">Успех</option>
          <option value="rejected">Отклонено</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Время</th>
              <th class="px-4 py-3">Пользователь</th>
              <th class="px-4 py-3">Действие</th>
              <th class="px-4 py-3">Объект</th>
              <th class="px-4 py-3">Результат</th>
              <th class="px-4 py-3">Примечание</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in filteredEvents" :key="event.id" class="border-t border-slate-100">
              <td class="px-4 py-3 text-slate-600">{{ event.createdAt }}</td>
              <td class="px-4 py-3 text-slate-700">{{ event.actorEmail }}</td>
              <td class="px-4 py-3 text-slate-700">{{ event.action }}</td>
              <td class="px-4 py-3 text-slate-600">{{ event.entity }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="event.outcome === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ event.outcome }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ event.note || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuditJournal } from '../../composables/useAuditJournal'

const { actorFilter, actors, filteredEvents, outcomeFilter } = useAuditJournal()
</script>
