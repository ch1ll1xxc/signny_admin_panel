<template>
  <AdminLayout>
    <template #title>Медиатека</template>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Поиск по медиафайлам"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />

        <div class="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Файл</th>
                <th class="px-4 py-3">Тип</th>
                <th class="px-4 py-3">Статус</th>
                <th class="px-4 py-3">Размер</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredMedia"
                :key="item.id"
                class="cursor-pointer border-t border-slate-100 transition hover:bg-violet-50/50"
                @click="selectMedia(item.id)"
              >
                <td class="px-4 py-3 font-medium text-slate-800">{{ item.name }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.type }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.status }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.size }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Детали</h3>
        <div v-if="selectedMedia" class="mt-3 space-y-2 text-sm">
          <p><span class="font-medium text-slate-700">Название:</span> {{ selectedMedia.name }}</p>
          <p><span class="font-medium text-slate-700">Загружен:</span> {{ selectedMedia.uploadDate }}</p>
          <p><span class="font-medium text-slate-700">Используется в:</span></p>
          <ul class="list-inside list-disc text-slate-600">
            <li v-for="place in selectedMedia.usedIn" :key="place">{{ place }}</li>
          </ul>
        </div>
        <p v-else class="mt-3 text-sm text-slate-500">Выберите файл, чтобы увидеть детали.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useMediaLibrary } from '../../composables/useMediaLibrary'

const { filteredMedia, searchQuery, selectedMedia, selectMedia, hydrateFromApi } = useMediaLibrary()

onMounted(() => {
  void hydrateFromApi()
})
</script>
