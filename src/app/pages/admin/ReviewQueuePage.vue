<template>
  <AdminLayout>
    <template #title>Review queue</template>

    <div class="space-y-5">
      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <h2 class="text-lg font-semibold text-gray-900">Pending moderation</h2>
        <p class="mt-1 text-sm text-gray-600">
          Curator/admin can approve, request revision, or publish approved versions.
        </p>
        <p v-if="syncInfo" class="mt-2 text-sm text-emerald-700">{{ syncInfo }}</p>
        <p v-if="syncError" class="mt-2 text-sm text-red-700">{{ syncError }}</p>
      </div>

      <div class="space-y-4">
        <article
          v-for="version in allVersions"
          :key="version.id"
          class="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 class="text-base font-semibold text-gray-900">{{ version.exhibitTitle }}</h3>
              <p class="text-sm text-gray-600">
                {{ version.id }} · submitted by {{ version.submitterEmail }}
              </p>
              <p class="mt-1 text-xs text-gray-500">Submitted: {{ version.submittedAt }}</p>
            </div>
            <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusClass(version.status)">
              {{ version.status }}
            </span>
          </div>

          <textarea
            v-model="commentDraft[version.id]"
            class="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows="2"
            placeholder="Reviewer comment"
            :disabled="!canModerate"
          />

          <div class="mt-3 flex flex-wrap gap-2">
            <button
              class="rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="!canModerate || version.status !== 'on_review'"
              @click="approve(version.id)"
            >
              Approve
            </button>
            <button
              class="rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="!canModerate || version.status !== 'on_review'"
              @click="requestRevision(version.id)"
            >
              Request revision
            </button>
            <button
              class="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="!canModerate || version.status !== 'approved' || isSyncingPublication"
              @click="handlePublish(version.id)"
            >
              {{ isSyncingPublication ? 'Publishing...' : 'Publish' }}
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
