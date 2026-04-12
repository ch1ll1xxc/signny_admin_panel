<template>
  <AdminLayout>
    <template #title>Залы</template>

    <div class="space-y-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Залы музея</h2>
          <p class="text-sm text-slate-600">Управление залами и распределением экспонатов.</p>
        </div>

        <button
          class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="!canManageHalls"
          @click="createHall('New hall', `hall-${Date.now()}`)"
        >
          Добавить зал
        </button>
      </div>

      <div class="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Название</th>
              <th class="px-4 py-3">Код</th>
              <th class="px-4 py-3">Экспонатов</th>
              <th class="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hall in halls" :key="hall.id" class="border-t border-slate-100">
              <td class="px-4 py-3 font-medium text-slate-800">{{ hall.name }}</td>
              <td class="px-4 py-3 text-slate-600">{{ hall.code }}</td>
              <td class="px-4 py-3 text-slate-600">{{ hall.exhibitsCount }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  class="rounded-lg px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:text-slate-300"
                  :disabled="!canManageHalls || hall.exhibitsCount > 0"
                  @click="deleteHall(hall.id)"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useHallsManager } from '../../composables/useHallsManager'

const auth = useAuth()
const canManageHalls = computed(() => auth.can('halls.write'))

const { createHall, deleteHall, halls } = useHallsManager()
</script>
