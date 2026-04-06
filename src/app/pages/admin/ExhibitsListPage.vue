<template>
  <AdminLayout>
    <template #title>Exhibits</template>

    <div class="space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Exhibit catalog</h2>
          <p class="text-sm text-gray-500">Migration S3 mock dataset and filters.</p>
        </div>

        <button
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          :disabled="!canWrite"
        >
          Create exhibit
        </button>
      </div>

      <div class="grid gap-3 md:grid-cols-3">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search exhibits"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <select v-model="hallFilter" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All halls</option>
          <option v-for="hall in halls" :key="hall" :value="hall">{{ hall }}</option>
        </select>

        <select v-model="statusFilter" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="Published">Published</option>
          <option value="OnReview">On review</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Hall</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Video</th>
              <th class="px-4 py-3">Subtitles</th>
              <th class="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exhibit in filteredExhibits" :key="exhibit.id" class="border-t border-gray-100">
              <td class="px-4 py-3 font-medium text-gray-800">{{ exhibit.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ exhibit.hall }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusClass(exhibit.status)">
                  {{ exhibit.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ exhibit.hasVideo ? 'Yes' : 'No' }}</td>
              <td class="px-4 py-3 text-gray-600">
                {{ exhibit.hasSubtitles ? exhibit.subtitlesType || 'Yes' : 'No' }}
              </td>
              <td class="px-4 py-3 text-gray-600">{{ exhibit.updated }}</td>
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
