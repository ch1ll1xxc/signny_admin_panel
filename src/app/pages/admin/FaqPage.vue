<template>
  <AdminLayout>
    <template #title>FAQ</template>

    <div class="space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Управление FAQ</h2>
          <p class="text-sm text-slate-600">Вопросы и ответы для публичного контура.</p>
        </div>

        <button
          v-if="canWrite"
          class="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
          @click="showAddForm = !showAddForm"
        >
          {{ showAddForm ? 'Скрыть форму' : 'Добавить FAQ' }}
        </button>
      </div>

      <div v-if="showAddForm" class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900">Новый вопрос</h3>
        <div class="space-y-3">
          <input
            v-model="newQuestion"
            type="text"
            placeholder="Вопрос"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          <textarea
            v-model="newAnswer"
            placeholder="Ответ"
            rows="3"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          <input
            v-model="newVideoUrl"
            type="text"
            placeholder="Ссылка на видео (необязательно)"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          <textarea
            v-model="newSubtitles"
            placeholder="Субтитры (необязательно)"
            rows="2"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          <button
            class="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:bg-slate-300"
            :disabled="!newQuestion.trim() || !newAnswer.trim() || isSubmitting"
            @click="handleAdd"
          >
            {{ isSubmitting ? 'Сохраняем...' : 'Сохранить' }}
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="text-sm text-slate-500">Загружаем FAQ...</div>

      <div v-else class="space-y-3">
        <div
          v-for="item in faqItems"
          :key="item.id"
          class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <template v-if="editingId === item.id">
            <input
              v-model="editQuestion"
              type="text"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <textarea
              v-model="editAnswer"
              rows="3"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              v-model="editVideoUrl"
              type="text"
              placeholder="Ссылка на видео"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <textarea
              v-model="editSubtitles"
              rows="2"
              placeholder="Субтитры"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <div class="flex gap-2">
              <button
                class="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-700 disabled:bg-slate-300"
                :disabled="isSubmitting"
                @click="handleUpdate(item.id)"
              >
                Сохранить
              </button>
              <button
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                @click="cancelEdit"
              >
                Отмена
              </button>
            </div>
          </template>

          <template v-else>
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h3 class="font-semibold text-slate-900">{{ item.question }}</h3>
                <p class="mt-1 text-sm text-slate-600">{{ item.answer }}</p>
                <div v-if="item.videoUrl" class="mt-2 text-xs text-cyan-700">
                  Видео: {{ item.videoUrl }}
                </div>
                <div v-if="item.subtitles" class="mt-1 text-xs text-slate-500">
                  Субтитры: {{ item.subtitles.slice(0, 80) }}{{ item.subtitles.length > 80 ? '...' : '' }}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="rounded-full px-2 py-1 text-xs font-medium"
                  :class="item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ item.isPublished ? 'Опубликован' : 'Скрыт' }}
                </span>
              </div>
            </div>

            <div v-if="canWrite" class="flex gap-2 border-t border-slate-100 pt-3">
              <button
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                @click="startEdit(item)"
              >
                Редактировать
              </button>
              <button
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                @click="handleTogglePublish(item)"
              >
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

        <p v-if="!faqItems.length" class="text-sm text-slate-500">FAQ пока нет.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { workflowApi } from '@/api/workflowApi'
import type { AdminFaqItem } from '@/types/workflow'

const auth = useAuth()
const canWrite = computed(() => auth.can('faq.write'))

const faqItems = ref<AdminFaqItem[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const showAddForm = ref(false)

const newQuestion = ref('')
const newAnswer = ref('')
const newVideoUrl = ref('')
const newSubtitles = ref('')

const editingId = ref<string | null>(null)
const editQuestion = ref('')
const editAnswer = ref('')
const editVideoUrl = ref('')
const editSubtitles = ref('')

const refresh = async () => {
  isLoading.value = true
  try {
    faqItems.value = await workflowApi.listFaqItems()
  } finally {
    isLoading.value = false
  }
}

const handleAdd = async () => {
  isSubmitting.value = true
  try {
    await workflowApi.addFaqItem(
      { question: newQuestion.value, answer: newAnswer.value },
      auth.user.value?.role as 'editor' | 'curator' | 'admin' ?? 'editor',
    )
    newQuestion.value = ''
    newAnswer.value = ''
    newVideoUrl.value = ''
    newSubtitles.value = ''
    showAddForm.value = false
    await refresh()
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

const cancelEdit = () => {
  editingId.value = null
}

const handleUpdate = async (id: string) => {
  isSubmitting.value = true
  try {
    await workflowApi.updateFaqItem(
      id,
      {
        question: editQuestion.value,
        answer: editAnswer.value,
        videoUrl: editVideoUrl.value || undefined,
        subtitles: editSubtitles.value || undefined,
      },
      auth.user.value?.role as 'editor' | 'curator' | 'admin' ?? 'editor',
    )
    editingId.value = null
    await refresh()
  } finally {
    isSubmitting.value = false
  }
}

const handleTogglePublish = async (item: AdminFaqItem) => {
  await workflowApi.updateFaqItem(
    item.id,
    { isPublished: !item.isPublished },
    auth.user.value?.role as 'editor' | 'curator' | 'admin' ?? 'editor',
  )
  await refresh()
}

const handleDelete = async (id: string) => {
  await workflowApi.deleteFaqItem(
    id,
    auth.user.value?.role as 'admin' ?? 'admin',
  )
  await refresh()
}

onMounted(refresh)
</script>
