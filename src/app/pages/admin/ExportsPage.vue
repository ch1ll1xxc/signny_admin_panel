<template>
  <AdminLayout>
    <template #title>Выгрузки</template>

    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">Выгрузки данных</h2>
        <p class="text-sm text-slate-600">Формирование CSV-отчётов для аналитика и администратора.</p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 class="font-semibold text-slate-900">Статусы версий</h3>
          <p class="text-sm text-slate-600">Текущий статус всех версий экспонатов.</p>
          <button
            class="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:bg-slate-300"
            :disabled="exporting === 'versions'"
            @click="exportVersions"
          >
            {{ exporting === 'versions' ? 'Выгружаем...' : 'Скачать CSV' }}
          </button>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 class="font-semibold text-slate-900">Журнал аудита</h3>
          <p class="text-sm text-slate-600">Все действия пользователей в системе.</p>
          <button
            class="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:bg-slate-300"
            :disabled="exporting === 'audit'"
            @click="exportAudit"
          >
            {{ exporting === 'audit' ? 'Выгружаем...' : 'Скачать CSV' }}
          </button>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 class="font-semibold text-slate-900">FAQ</h3>
          <p class="text-sm text-slate-600">Все вопросы и ответы с метаданными.</p>
          <button
            class="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:bg-slate-300"
            :disabled="exporting === 'faq'"
            @click="exportFaq"
          >
            {{ exporting === 'faq' ? 'Выгружаем...' : 'Скачать CSV' }}
          </button>
        </div>
      </div>

      <div v-if="lastExport" class="rounded-2xl border border-green-200 bg-green-50 p-4">
        <p class="text-sm text-green-800">Файл <span class="font-medium">{{ lastExport }}</span> скачан.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { workflowApi } from '@/api/workflowApi'

const exporting = ref<string | null>(null)
const lastExport = ref<string | null>(null)

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  lastExport.value = filename
}

const exportVersions = async () => {
  exporting.value = 'versions'
  try {
    const exhibits = await workflowApi.listExhibits()
    const header = 'ID,Название,Экспозиция,Ответственный,Статус,Обновлено\n'
    const rows = exhibits.map((e) => `${e.id},"${e.title}","${e.expositionTitle}","${e.owner}",${e.currentStatus},${e.updatedAt}`).join('\n')
    downloadCsv(`versions_${Date.now()}.csv`, header + rows)
  } finally {
    exporting.value = null
  }
}

const exportAudit = async () => {
  exporting.value = 'audit'
  try {
    const events = await workflowApi.listAuditEvents()
    const header = 'ID,Действие,Детали,Роль,Дата\n'
    const rows = events.map((e) => `${e.id},"${e.action}","${e.details}",${e.actorRole},${e.createdAt}`).join('\n')
    downloadCsv(`audit_${Date.now()}.csv`, header + rows)
  } finally {
    exporting.value = null
  }
}

const exportFaq = async () => {
  exporting.value = 'faq'
  try {
    const items = await workflowApi.listFaqItems()
    const header = 'ID,Вопрос,Ответ,Опубликован,Обновлено\n'
    const rows = items.map((f) => `${f.id},"${f.question}","${f.answer}",${f.isPublished},${f.updatedAt}`).join('\n')
    downloadCsv(`faq_${Date.now()}.csv`, header + rows)
  } finally {
    exporting.value = null
  }
}
</script>
