<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-2xl font-semibold">Выгрузки</h2>
      <p class="text-sm text-slate-500">Экспорт отчетов и служебных данных</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Создать выгрузку</h3>
        <div class="mt-3 space-y-2 text-sm">
          <button
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isGenerating"
            @click="requestExport('Экспонаты со статусами workflow', 'workflow-status')"
          >
            Экспонаты со статусами workflow
          </button>
          <button
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isGenerating"
            @click="requestExport('События аудита за 30 дней', 'audit-events')"
          >
            События аудита за 30 дней
          </button>
          <button
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isGenerating"
            @click="requestExport('Аналитика (CSV)', 'analytics-overview')"
          >
            Аналитика (CSV)
          </button>
        </div>
        <p v-if="feedback" class="mt-3 text-sm text-slate-600">{{ feedback }}</p>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Последние файлы</h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="file in files" :key="file.name" class="flex items-center justify-between">
            <span>{{ file.name }}</span>
            <span class="text-slate-500">{{ file.size }}</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

type ExportFile = {
  name: string
  size: string
}

const feedback = ref('')
const isGenerating = ref(false)
const { pushToast } = useToast()
const auth = useAuthStore()
const files = ref<ExportFile[]>([
  { name: 'workflow-status-2026-03-23.csv', size: '128 KB' },
  { name: 'audit-log-2026-03-22.csv', size: '2.1 MB' },
  { name: 'analytics-week-12.csv', size: '340 KB' },
])

const requestExport = async (label: string, exportKey: string) => {
  isGenerating.value = true
  feedback.value = ''
  const previous = [...files.value]
  const fileName = `${exportKey}-${new Date().toISOString().slice(0, 10)}.csv`
  const fileSize = `${Math.floor(Math.random() * 900 + 100)} KB`
  files.value.unshift({ name: fileName, size: fileSize })
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (!['curator', 'admin'].includes(auth.role)) {
      throw new Error('Недостаточно прав для запуска выгрузки')
    }
    feedback.value = `Выгрузка создана: ${fileName}`
    pushToast('success', feedback.value)
  } catch (error) {
    files.value = previous
    feedback.value = error instanceof Error ? error.message : 'Не удалось создать выгрузку'
    pushToast('error', feedback.value)
  } finally {
    isGenerating.value = false
  }
}
</script>
