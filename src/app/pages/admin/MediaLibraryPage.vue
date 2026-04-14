<template>
  <AdminLayout>
    <template #title>Медиатека</template>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <div class="flex gap-3">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Поиск по медиафайлам"
            class="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <button
            v-if="canWrite"
            class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:bg-slate-300"
            :disabled="isUploading"
            @click="triggerUpload"
          >
            {{ isUploading ? 'Загрузка...' : 'Загрузить файл' }}
          </button>
          <input ref="fileInput" type="file" class="hidden" accept="video/*,image/*,.glb,.gltf,.obj,.fbx,.vtt,.srt" @change="handleFileChange" />
        </div>

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
        <div v-if="selectedMedia && canWrite" class="mt-4 border-t border-slate-100 pt-3">
          <button
            class="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
            @click="handleDelete(selectedMedia.id)"
          >
            Удалить файл
          </button>
        </div>
        <p v-else-if="!selectedMedia" class="mt-3 text-sm text-slate-500">Выберите файл, чтобы увидеть детали.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useNotify } from '../../composables/useNotify'
import { useMediaLibrary } from '../../composables/useMediaLibrary'

const auth = useAuth()
const notify = useNotify()
const canWrite = computed(() => auth.can('media.write'))
const isUploading = ref(false)

const { filteredMedia, searchQuery, selectedMedia, selectMedia, hydrateFromApi, uploadFile, deleteMedia } = useMediaLibrary()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerUpload = () => fileInput.value?.click()

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploading.value = true
  try {
    await uploadFile(file)
    notify.success(`${file.name} загружен`)
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка загрузки')
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteMedia(id)
    notify.success('Файл удалён')
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка удаления')
  }
}

onMounted(() => {
  void hydrateFromApi()
})
</script>
