<template>
  <AdminLayout>
    <template #title>Публикация</template>

    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">Публикация в публичный контур</h2>
        <p class="text-sm text-slate-600">Предварительная проверка и публикация согласованных версий.</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900">Предварительная проверка</h3>

        <button
          class="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-300"
          :disabled="isChecking"
          @click="runPreflight"
        >
          {{ isChecking ? 'Проверяем...' : 'Запустить проверку' }}
        </button>

        <div v-if="preflightResult" class="grid gap-3 md:grid-cols-3">
          <div class="rounded-xl bg-green-50 border border-green-200 p-4">
            <p class="text-xs uppercase tracking-wide text-green-600">Готовы к публикации</p>
            <p class="mt-1 text-2xl font-semibold text-green-800">{{ preflightResult.approved }}</p>
          </div>
          <div class="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p class="text-xs uppercase tracking-wide text-amber-600">На согласовании</p>
            <p class="mt-1 text-2xl font-semibold text-amber-800">{{ preflightResult.onReview }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Черновики</p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">{{ preflightResult.draft }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900">Массовая публикация</h3>
        <p class="text-sm text-slate-600">
          Все согласованные версии будут опубликованы и синхронизированы с публичным контуром.
        </p>

        <button
          class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:bg-slate-300"
          :disabled="isPublishing || (preflightResult && preflightResult.approved === 0)"
          @click="handlePublish"
        >
          {{ isPublishing ? 'Публикуем...' : 'Опубликовать всё согласованное' }}
        </button>

        <div v-if="publishResult" class="rounded-xl p-4" :class="publishResult.synced ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'">
          <p class="text-sm font-medium" :class="publishResult.synced ? 'text-green-800' : 'text-amber-800'">
            Опубликовано версий: {{ publishResult.publishedCount }}
          </p>
          <p class="mt-1 text-xs" :class="publishResult.synced ? 'text-green-600' : 'text-amber-600'">
            {{ publishResult.syncMessage }}
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { workflowApi } from '@/api/workflowApi'

const auth = useAuth()

const isChecking = ref(false)
const isPublishing = ref(false)
const preflightResult = ref<{ approved: number; onReview: number; draft: number } | null>(null)
const publishResult = ref<{ publishedCount: number; synced: boolean; syncMessage: string } | null>(null)

const runPreflight = async () => {
  isChecking.value = true
  try {
    preflightResult.value = await workflowApi.runPreflightChecks()
  } finally {
    isChecking.value = false
  }
}

const handlePublish = async () => {
  isPublishing.value = true
  publishResult.value = null
  try {
    const role = auth.user.value?.role as 'admin' ?? 'admin'
    publishResult.value = await workflowApi.publishApproved(role)
    preflightResult.value = null
  } finally {
    isPublishing.value = false
  }
}
</script>
