<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-2xl font-semibold">Публикация</h2>
      <p class="text-sm text-slate-500">Контроль выкладки в публичный контур</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Ближайшие релизы</h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="release in releases" :key="release.title" class="flex items-center justify-between">
            <span>{{ release.title }}</span>
            <span class="text-slate-500">{{ release.when }}</span>
          </li>
        </ul>
      </article>
      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Публикационные действия</h3>
        <div class="mt-3 space-y-2 text-sm">
          <button
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="busy"
            @click="publishAllApproved"
          >
            {{ busy && currentAction === 'publish' ? 'Публикуем...' : 'Опубликовать все согласованные экспонаты' }}
          </button>
          <button
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="busy"
            @click="runPreflight"
          >
            {{ busy && currentAction === 'preflight' ? 'Проверяем...' : 'Запустить preflight-проверки' }}
          </button>
          <button class="w-full rounded-md border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50" :disabled="busy" @click="generateNotes">
            Сформировать release notes
          </button>
        </div>
        <p v-if="feedback" class="mt-3 text-sm text-slate-600">{{ feedback }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { workflowApi } from '@/api/workflowApi'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const busy = ref(false)
const feedback = ref('')
const currentAction = ref<'publish' | 'preflight' | ''>('')
const { pushToast } = useToast()

const releases = [
  { title: 'Коллекция «Арктический свет»', when: 'Сегодня, 18:00' },
  { title: 'Расширение «Древние карты»', when: 'Чт, 09:00' },
  { title: 'Ботанический аудиогид', when: 'Пт, 14:30' },
]

const publishAllApproved = async () => {
  busy.value = true
  currentAction.value = 'publish'
  feedback.value = ''
  try {
    const result = await workflowApi.publishApproved(auth.role)
    feedback.value = `Опубликовано согласованных версий: ${result.publishedCount}. Синхронизация public: ${result.synced ? 'ok' : 'ошибка'} (${result.syncMessage}).`
    pushToast('success', feedback.value)
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : 'Ошибка публикации'
    pushToast('error', feedback.value)
  } finally {
    busy.value = false
    currentAction.value = ''
  }
}

const runPreflight = async () => {
  busy.value = true
  currentAction.value = 'preflight'
  feedback.value = ''
  try {
    const check = await workflowApi.publishPreflight()
    feedback.value = `Preflight: готово к публикации=${check.canPublish}, проверено=${check.approvedCount} версий. ${check.message}`
    pushToast('info', 'Preflight-проверка завершена')
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : 'Preflight-проверка завершилась с ошибкой'
    pushToast('error', feedback.value)
  } finally {
    busy.value = false
    currentAction.value = ''
  }
}

const generateNotes = () => {
  feedback.value = `Release notes сформированы в ${new Date().toLocaleTimeString()}.`
  pushToast('info', 'Release notes сформированы')
}
</script>
