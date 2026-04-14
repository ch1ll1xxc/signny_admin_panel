<template>
  <AdminLayout>
    <template #title>FAQ</template>

    <div class="space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Управление FAQ</h2>
          <p class="text-sm text-slate-600">Вопросы и ответы привязаны к экспонатам.</p>
        </div>

        <button
          v-if="canWrite"
          class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
          @click="showAddForm = !showAddForm"
        >
          {{ showAddForm ? 'Скрыть форму' : 'Добавить FAQ' }}
        </button>
      </div>

      <!-- Create form -->
      <div v-if="showAddForm" class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900">Новый вопрос</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Экспонат</label>
            <select
              v-model="newExhibitId"
              class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">Выберите экспонат</option>
              <option v-for="ex in exhibitsList" :key="ex.id" :value="ex.id">{{ ex.title }}</option>
            </select>
          </div>
          <input v-model="newQuestion" type="text" placeholder="Вопрос" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          <textarea v-model="newAnswer" placeholder="Ответ" rows="3" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Видеофайл</label>
            <input type="file" accept="video/*" class="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100" @change="onVideoFile($event, 'new')" />
            <p v-if="newVideoUrl" class="mt-1 text-xs text-violet-600">{{ newVideoUrl }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Субтитры (.vtt / текст)</label>
            <input type="file" accept=".vtt,.srt,.txt" class="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100" @change="onSubtitlesFile($event, 'new')" />
            <textarea v-model="newSubtitles" placeholder="Или вставьте текст субтитров" rows="2" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>

          <button
            class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:bg-slate-300"
            :disabled="!newExhibitId || !newQuestion.trim() || !newAnswer.trim() || isSubmitting"
            @click="handleAdd"
          >
            {{ isSubmitting ? 'Сохраняем...' : 'Сохранить' }}
          </button>
        </div>
      </div>

      <!-- Filter by exhibit -->
      <select
        v-model="exhibitFilter"
        class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        <option value="all">Все экспонаты</option>
        <option v-for="ex in exhibitsList" :key="ex.id" :value="ex.id">{{ ex.title }}</option>
      </select>

      <div v-if="isLoading" class="text-sm text-slate-500">Загружаем FAQ...</div>

      <div v-else class="space-y-3">
        <div
          v-for="item in filteredFaq"
          :key="item.id"
          class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <template v-if="editingId === item.id">
            <input v-model="editQuestion" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            <textarea v-model="editAnswer" rows="3" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Видеофайл</label>
              <input type="file" accept="video/*" class="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100" @change="onVideoFile($event, 'edit')" />
              <p v-if="editVideoUrl" class="mt-1 text-xs text-violet-600">{{ editVideoUrl }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Субтитры</label>
              <input type="file" accept=".vtt,.srt,.txt" class="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100" @change="onSubtitlesFile($event, 'edit')" />
              <textarea v-model="editSubtitles" placeholder="Текст субтитров" rows="2" class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div class="flex gap-2">
              <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300" :disabled="isSubmitting" @click="handleUpdate(item.id)">Сохранить</button>
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="cancelEdit">Отмена</button>
            </div>
          </template>

          <template v-else>
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <p class="text-xs font-medium text-violet-600">{{ item.exhibitTitle || 'Без экспоната' }}</p>
                <h3 class="mt-1 font-semibold text-slate-900">{{ item.question }}</h3>
                <p class="mt-1 text-sm text-slate-600">{{ item.answer }}</p>
                <div v-if="item.videoUrl" class="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                  <span>Видео:</span> {{ item.videoUrl }}
                </div>
                <div v-if="item.subtitles" class="mt-1 text-xs text-slate-500">
                  Субтитры: {{ item.subtitles.slice(0, 80) }}{{ item.subtitles.length > 80 ? '...' : '' }}
                </div>
              </div>
              <span class="rounded-full px-2 py-1 text-xs font-medium" :class="item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ item.isPublished ? 'Опубликован' : 'Скрыт' }}
              </span>
            </div>

            <div v-if="canWrite" class="flex gap-2 border-t border-slate-100 pt-3">
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="startEdit(item)">Редактировать</button>
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="handleTogglePublish(item)">
                {{ item.isPublished ? 'Скрыть' : 'Опубликовать' }}
              </button>
              <button
                v-if="auth.can('publish.execute')"
                class="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                @click="handleDelete(item.id)"
              >
                Удалить
              </button>
            </div>
          </template>
        </div>

        <p v-if="!filteredFaq.length" class="text-sm text-slate-500">FAQ не найдены.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useNotify } from '../../composables/useNotify'
import { workflowApi } from '@/api/workflowApi'
import type { AdminFaqItem, ExhibitListItem } from '@/types/workflow'

const auth = useAuth()
const notify = useNotify()
const canWrite = computed(() => auth.can('faq.write'))
const userRole = computed(() => (auth.user.value?.role ?? 'editor') as 'editor' | 'curator' | 'admin')

const faqItems = ref<AdminFaqItem[]>([])
const exhibitsList = ref<ExhibitListItem[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const showAddForm = ref(false)
const exhibitFilter = ref<string>('all')

const newExhibitId = ref('')
const newQuestion = ref('')
const newAnswer = ref('')
const newVideoUrl = ref('')
const newSubtitles = ref('')

const editingId = ref<string | null>(null)
const editQuestion = ref('')
const editAnswer = ref('')
const editVideoUrl = ref('')
const editSubtitles = ref('')

const filteredFaq = computed(() => {
  if (exhibitFilter.value === 'all') return faqItems.value
  return faqItems.value.filter((f) => f.exhibitId === exhibitFilter.value)
})

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file, file.name)

  const token = localStorage.getItem('session_token')
  const baseUrl = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4100'
  const res = await fetch(`${baseUrl}/api/v1/media/upload`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json() as { url: string }
  return data.url
}

const onVideoFile = async (event: Event, target: 'new' | 'edit') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const url = await uploadFile(file)
    if (target === 'new') newVideoUrl.value = url
    else editVideoUrl.value = url
    notify.success('Видео загружено')
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка загрузки видео')
  }
}

const onSubtitlesFile = async (event: Event, target: 'new' | 'edit') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  // For subtitles, read as text (small files)
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    if (target === 'new') newSubtitles.value = text
    else editSubtitles.value = text
  }
  reader.readAsText(file)
}

const refresh = async () => {
  isLoading.value = true
  try {
    faqItems.value = await workflowApi.listFaqItems()
    exhibitsList.value = await workflowApi.listExhibits()
  } finally {
    isLoading.value = false
  }
}

const handleAdd = async () => {
  isSubmitting.value = true
  try {
    await workflowApi.addFaqItem({
      exhibitId: newExhibitId.value,
      question: newQuestion.value,
      answer: newAnswer.value,
      videoUrl: newVideoUrl.value || undefined,
      subtitles: newSubtitles.value || undefined,
    }, userRole.value)
    newExhibitId.value = ''
    newQuestion.value = ''
    newAnswer.value = ''
    newVideoUrl.value = ''
    newSubtitles.value = ''
    showAddForm.value = false
    notify.success('FAQ добавлен')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка при добавлении')
  } finally {
    isSubmitting.value = false
  }
}

const startEdit = (item: AdminFaqItem) => {
  editingId.value = item.id
  editQuestion.value = item.question
  editAnswer.value = item.answer
  editVideoUrl.value = item.videoUrl ?? ''
  editSubtitles.value = item.subtitles ?? ''
}

const cancelEdit = () => { editingId.value = null }

const handleUpdate = async (id: string) => {
  isSubmitting.value = true
  try {
    await workflowApi.updateFaqItem(id, {
      question: editQuestion.value,
      answer: editAnswer.value,
      videoUrl: editVideoUrl.value || undefined,
      subtitles: editSubtitles.value || undefined,
    }, userRole.value)
    editingId.value = null
    notify.success('FAQ обновлён')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка при обновлении')
  } finally {
    isSubmitting.value = false
  }
}

const handleTogglePublish = async (item: AdminFaqItem) => {
  await workflowApi.updateFaqItem(item.id, { isPublished: !item.isPublished }, userRole.value)
  notify.success(item.isPublished ? 'FAQ скрыт' : 'FAQ опубликован')
  await refresh()
}

const handleDelete = async (id: string) => {
  await workflowApi.deleteFaqItem(id, userRole.value)
  notify.success('FAQ удалён')
  await refresh()
}

onMounted(refresh)
</script>
