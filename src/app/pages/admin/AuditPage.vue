<template>
  <AdminLayout>
    <template #title>Audit journal</template>

    <div class="space-y-4">
      <div class="grid gap-3 md:grid-cols-2">
        <select v-model="actorFilter" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All actors</option>
          <option v-for="actor in actors" :key="actor" :value="actor">{{ actor }}</option>
        </select>

        <select v-model="outcomeFilter" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All outcomes</option>
          <option value="success">Success</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Actor</th>
              <th class="px-4 py-3">Action</th>
              <th class="px-4 py-3">Entity</th>
              <th class="px-4 py-3">Outcome</th>
              <th class="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in filteredEvents" :key="event.id" class="border-t border-gray-100">
              <td class="px-4 py-3 text-gray-600">{{ event.createdAt }}</td>
              <td class="px-4 py-3 text-gray-700">{{ event.actorEmail }}</td>
              <td class="px-4 py-3 text-gray-700">{{ event.action }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.entity }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="event.outcome === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ event.outcome }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ event.note || '-' }}</td>
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
