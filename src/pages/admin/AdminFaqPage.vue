<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold">FAQ</h2>
        <p class="text-sm text-slate-500">Частые вопросы для публичного контура</p>
      </div>
      <button class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" @click="toggleComposer">
        {{ showComposer ? 'Закрыть форму' : 'Добавить вопрос' }}
      </button>
    </header>

    <article v-if="showComposer" class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-base font-semibold">Новая FAQ-запись</h3>
      <div class="mt-3 grid gap-3">
        <input
          v-model="draftQuestion"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Вопрос"
        />
        <textarea
          v-model="draftAnswer"
          class="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Ответ"
        />
      </div>
      <div class="mt-3 flex gap-2">
        <button class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSaving" @click="saveFaq">
          {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
        </button>
        <button class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSaving" @click="resetDraft">
          Сбросить
        </button>
      </div>
      <p v-if="errorMessage" class="mt-2 text-sm text-rose-600">{{ errorMessage }}</p>
    </article>

    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <p v-if="isLoading" class="mb-3 text-sm text-slate-500">Загружаем FAQ...</p>
      <ul class="space-y-3 text-sm">
        <li v-for="item in faq" :key="item.id" class="rounded-md border border-slate-100 p-3">
          <p class="font-medium">{{ item.question }}</p>
          <p class="mt-1 text-slate-600">{{ item.answer }}</p>
          <p class="mt-2 text-xs text-slate-500">Обновлено: {{ formatUpdated(item.updatedAt) }}</p>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { workflowApi } from '@/api/workflowApi'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { AdminFaqItem } from '@/types/workflow'

const showComposer = ref(false)
const draftQuestion = ref('')
const draftAnswer = ref('')
const errorMessage = ref('')
const isSaving = ref(false)
const isLoading = ref(false)
const auth = useAuthStore()
const { pushToast } = useToast()

const faq = ref<AdminFaqItem[]>([])

const formatUpdated = (isoDate: string) => new Date(isoDate).toLocaleString()

const loadFaq = async () => {
  isLoading.value = true
  try {
    faq.value = await workflowApi.listFaqItems()
  } finally {
    isLoading.value = false
  }
}

const toggleComposer = () => {
  showComposer.value = !showComposer.value
  errorMessage.value = ''
}

const resetDraft = () => {
  draftQuestion.value = ''
  draftAnswer.value = ''
  errorMessage.value = ''
}

const saveFaq = async () => {
  const question = draftQuestion.value.trim()
  const answer = draftAnswer.value.trim()
  if (!question || !answer) {
    errorMessage.value = 'Вопрос и ответ обязательны.'
    pushToast('error', errorMessage.value)
    return
  }
  isSaving.value = true
  try {
    await workflowApi.addFaqItem(question, answer)
    await loadFaq()
    resetDraft()
    showComposer.value = false
    pushToast('success', 'FAQ-запись добавлена')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось сохранить FAQ-запись'
    pushToast('error', errorMessage.value)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await loadFaq()
})
</script>
