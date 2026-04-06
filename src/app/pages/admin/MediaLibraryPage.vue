<template>
  <AdminLayout>
    <template #title>Media library</template>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search media files"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3">File</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredMedia"
                :key="item.id"
                class="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                @click="selectMedia(item.id)"
              >
                <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.type }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.status }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.size }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Details</h3>
        <div v-if="selectedMedia" class="mt-3 space-y-2 text-sm">
          <p><span class="font-medium text-gray-700">Name:</span> {{ selectedMedia.name }}</p>
          <p><span class="font-medium text-gray-700">Uploaded:</span> {{ selectedMedia.uploadDate }}</p>
          <p><span class="font-medium text-gray-700">Used in:</span></p>
          <ul class="list-inside list-disc text-gray-600">
            <li v-for="place in selectedMedia.usedIn" :key="place">{{ place }}</li>
          </ul>
        </div>
        <p v-else class="mt-3 text-sm text-gray-500">Select a file to view details.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useMediaLibrary } from '../../composables/useMediaLibrary'

const { filteredMedia, searchQuery, selectedMedia, selectMedia } = useMediaLibrary()
</script>
