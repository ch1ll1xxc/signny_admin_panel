<template>
  <AdminLayout>
    <template #title>Halls</template>

    <div class="space-y-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Museum halls</h2>
          <p class="text-sm text-gray-500">Simple CRUD shell for migration parity.</p>
        </div>

        <button
          class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          :disabled="!canManageHalls"
          @click="createHall('New hall', `hall-${Date.now()}`)"
        >
          Add hall
        </button>
      </div>

      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Code</th>
              <th class="px-4 py-3">Exhibits</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hall in halls" :key="hall.id" class="border-t border-gray-100">
              <td class="px-4 py-3 font-medium text-gray-800">{{ hall.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ hall.code }}</td>
              <td class="px-4 py-3 text-gray-600">{{ hall.exhibitsCount }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:text-gray-300"
                  :disabled="!canManageHalls || hall.exhibitsCount > 0"
                  @click="deleteHall(hall.id)"
                >
                  Delete
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
