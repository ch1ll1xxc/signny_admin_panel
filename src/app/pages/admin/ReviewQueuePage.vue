<template>
  <AdminLayout>
    <template #title>Очередь модерации</template>

    <div class="space-y-5">
      <div class="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
        <h2 class="text-lg font-semibold text-slate-900">Ожидают модерации</h2>
        <p class="mt-1 text-sm text-slate-600">
          Куратор и админ могут согласовать, вернуть на доработку или опубликовать версию.
        </p>
        <p v-if="syncInfo" class="mt-2 text-sm text-emerald-700">{{ syncInfo }}</p>
        <p v-if="syncError" class="mt-2 text-sm text-red-700">{{ syncError }}</p>
      </div>

      <div class="space-y-4">
        <article
          v-for="version in allVersions"
          :key="version.id"
          class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 class="text-base font-semibold text-slate-900">{{ version.exhibitTitle }}</h3>
              <p class="text-sm text-slate-600">
                {{ version.id }} · отправил: {{ version.submitterEmail }}
              </p>
              <p class="mt-1 text-xs text-slate-500">Дата отправки: {{ version.submittedAt }}</p>
            </div>
            <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusClass(version.status)">
              {{ version.status }}
            </span>
          </div>

          <textarea
            v-model="commentDraft[version.id]"
            class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            rows="2"
            placeholder="Комментарий модератора"
            :disabled="!canModerate"
          />

          <div class="mt-3 flex flex-wrap gap-2">
            <button
              class="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              :disabled="!canModerate || version.status !== 'on_review'"
              @click="approve(version.id)"
            >
              Согласовать
            </button>
            <button
              class="rounded-xl bg-amber-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              :disabled="!canModerate || version.status !== 'on_review'"
              @click="requestRevision(version.id)"
            >
              На доработку
            </button>
            <button
              class="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              :disabled="!canModerate || version.status !== 'approved' || isSyncingPublication"
              @click="handlePublish(version.id)"
            >
              {{ isSyncingPublication ? 'Публикация...' : 'Опубликовать' }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import type { ContentLifecycleStatus } from '../../domain/workflow'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useReviewWorkflow } from '../../composables/useReviewWorkflow'

const {
  allVersions,
  approve,
  canModerate,
  commentDraft,
  isSyncingPublication,
  publish,
  requestRevision,
  syncError,
  syncInfo,
} = useReviewWorkflow()

const handlePublish = async (versionId: string): Promise<void> => {
  await publish(versionId)
}

const statusClass = (status: ContentLifecycleStatus): string => {
  if (status === 'published') {
    return 'bg-green-100 text-green-700'
  }
  if (status === 'approved') {
    return 'bg-blue-100 text-blue-700'
  }
  if (status === 'on_review') {
    return 'bg-amber-100 text-amber-700'
  }
  if (status === 'needs_revision') {
    return 'bg-red-100 text-red-700'
  }
  return 'bg-gray-100 text-gray-700'
}
</script>
