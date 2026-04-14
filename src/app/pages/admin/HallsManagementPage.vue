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
          @click="openCreateDialog"
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
              <template v-if="editingId === hall.id">
                <td class="px-4 py-2">
                  <input v-model="editName" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-violet-400" />
                </td>
                <td class="px-4 py-2">
                  <input v-model="editCode" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-violet-400" />
                </td>
                <td class="px-4 py-3 text-slate-600">{{ hall.exhibitsCount }}</td>
                <td class="px-4 py-3 text-right space-x-1">
                  <button class="rounded-lg px-2 py-1 text-xs text-violet-600 hover:bg-violet-50" @click="saveEdit(hall.id)">Сохранить</button>
                  <button class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50" @click="editingId = null">Отмена</button>
                </td>
              </template>
              <template v-else>
                <td class="px-4 py-3 font-medium text-slate-800">{{ hall.name }}</td>
                <td class="px-4 py-3 text-slate-600">{{ hall.code }}</td>
                <td class="px-4 py-3 text-slate-600">{{ hall.exhibitsCount }}</td>
                <td class="px-4 py-3 text-right space-x-1">
                  <button
                    class="rounded-lg px-2 py-1 text-xs text-violet-600 transition hover:bg-violet-50 disabled:text-slate-300"
                    :disabled="!canManageHalls"
                    @click="startEdit(hall)"
                  >
                    Изменить
                  </button>
                  <button
                    class="rounded-lg px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:text-slate-300"
                    :disabled="!canManageHalls || hall.exhibitsCount > 0"
                    @click="deleteHall(hall.id)"
                  >
                    Удалить
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Диалог создания -->
      <div v-if="showCreateDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreateDialog = false">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
          <h3 class="text-lg font-semibold">Новый зал</h3>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Название</label>
            <input v-model="newName" type="text" placeholder="Зал А" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Код</label>
            <input v-model="newCode" type="text" placeholder="hall-a" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div class="flex justify-end gap-2">
            <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" @click="showCreateDialog = false">Отмена</button>
            <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700" @click="confirmCreate">Создать</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useHallsManager } from '../../composables/useHallsManager'
import type { HallSummary } from '../../domain/catalog'

const auth = useAuth()
const canManageHalls = computed(() => auth.can('halls.write'))

const { createHall, updateHall, deleteHall, halls } = useHallsManager()

const editingId = ref<number | null>(null)
const editName = ref('')
const editCode = ref('')

const showCreateDialog = ref(false)
const newName = ref('')
const newCode = ref('')

const startEdit = (hall: HallSummary) => {
  editingId.value = hall.id
  editName.value = hall.name
  editCode.value = hall.code
}

const saveEdit = (id: number) => {
  if (editName.value.trim()) {
    updateHall(id, editName.value.trim(), editCode.value.trim())
  }
  editingId.value = null
}

const openCreateDialog = () => {
  newName.value = ''
  newCode.value = ''
  showCreateDialog.value = true
}

const confirmCreate = () => {
  if (newName.value.trim()) {
    createHall(newName.value.trim(), newCode.value.trim() || `hall-${Date.now()}`)
    showCreateDialog.value = false
  }
}
</script>
