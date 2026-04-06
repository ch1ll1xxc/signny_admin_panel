<template>
  <AdminLayout>
    <template #title>Exhibits</template>

    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Exhibit catalog</h2>
          <p class="text-sm text-gray-500">Vue S2 RBAC baseline page.</p>
        </div>

        <button
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          :disabled="!canWrite"
        >
          Create exhibit
        </button>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white">
        <div class="border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Name
        </div>
        <div class="px-4 py-5 text-sm text-gray-500">No exhibits yet.</div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { usePermissions } from '../../composables/usePermissions'

const { can } = usePermissions()
const canWrite = computed(() => can('exhibits.write'))
</script>
