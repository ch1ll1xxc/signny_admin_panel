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
      <ul class="space-y-3 text-sm">
        <li v-for="item in faq" :key="item.question" class="rounded-md border border-slate-100 p-3">
          <p class="font-medium">{{ item.question }}</p>
          <p class="mt-1 text-slate-600">{{ item.answer }}</p>
          <p class="mt-2 text-xs text-slate-500">Обновлено: {{ item.updated }}</p>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

type FaqItem = {
  question: string
  answer: string
  updated: string
}

const showComposer = ref(false)
const draftQuestion = ref('')
const draftAnswer = ref('')
const errorMessage = ref('')
const isSaving = ref(false)
const { pushToast } = useToast()

const faq = ref<FaqItem[]>([
  {
    question: 'Как отправить экспонат на согласование?',
    answer: 'Откройте карточку экспоната, заполните обязательные поля и отправьте версию в очередь согласования.',
    updated: 'сегодня',
  },
  {
    question: 'Можно ли запланировать публикацию на выходные?',
    answer: 'Да, для согласованной версии используйте публикационный контур и задайте окно выкладки.',
    updated: '2 дня назад',
  },
  {
    question: 'Что фиксируется в журнале аудита?',
    answer: 'Каждый переход статуса, правка контента и действие публикации автоматически логируются.',
    updated: 'неделю назад',
  },
])

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
  const previous = [...faq.value]
  faq.value.unshift({ question, answer, updated: 'just now' })
  try {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const duplicated = previous.some((item) => item.question.toLowerCase() === question.toLowerCase())
    if (duplicated) {
      throw new Error('FAQ с таким вопросом уже существует.')
    }
    resetDraft()
    showComposer.value = false
    pushToast('success', 'FAQ-запись добавлена')
  } catch (error) {
    faq.value = previous
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось сохранить FAQ-запись'
    pushToast('error', errorMessage.value)
  } finally {
    isSaving.value = false
  }
}
</script>
