<template>
  <AdminLayout>
    <template #title>Dashboard</template>

    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Welcome to Signny Admin</h2>
          <p class="text-sm text-gray-500">Track moderation flow, publication state, and public contour sync.</p>
        </div>
        <p class="text-sm text-gray-600">Active role: <strong>{{ auth.user?.role || 'unknown' }}</strong></p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Tracked versions</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ metrics.total }}</p>
        </article>
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">On review</p>
          <p class="mt-2 text-3xl font-bold text-amber-700">{{ metrics.onReview }}</p>
        </article>
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Needs revision</p>
          <p class="mt-2 text-3xl font-bold text-red-700">{{ metrics.needsRevision }}</p>
        </article>
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Published</p>
          <p class="mt-2 text-3xl font-bold text-green-700">{{ metrics.published }}</p>
        </article>
      </div>

      <section class="rounded-lg border border-gray-200 bg-white p-6">
        <h3 class="text-lg font-semibold text-gray-900">Quick actions</h3>
        <div class="mt-4 flex flex-wrap gap-3">
          <router-link
            to="/admin/exhibits"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View exhibits
          </router-link>
          <router-link
            v-if="auth.can('exhibits.read')"
            to="/admin/review"
            class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Open review queue
          </router-link>
          <router-link
            v-if="auth.can('audit.read')"
            to="/admin/audit"
            class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Audit journal
          </router-link>
        </div>
      </section>

      <section class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Public contour sync</h3>
            <p class="text-sm text-gray-500">Push currently published versions into public contour integration endpoint.</p>
          </div>
          <button
            class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSyncing || !canSync"
            @click="syncPublicContour"
          >
            {{ isSyncing ? 'Syncing...' : 'Sync publication now' }}
          </button>
        </div>

        <p v-if="syncMessage" class="mt-3 text-sm text-gray-600">{{ syncMessage }}</p>

        <div class="mt-4 rounded-md bg-slate-50 p-4 text-sm">
          <p v-if="publicStateError" class="text-red-700">{{ publicStateError }}</p>
          <div v-else-if="publicState" class="grid gap-2 sm:grid-cols-2">
            <p>Public exhibits: <strong>{{ publicState.exhibits.publishedCount }}</strong></p>
            <p>Public FAQ items: <strong>{{ publicState.faq.publishedCount }}</strong></p>
            <p>Content versions: <strong>{{ publicState.contentVersions.totalCount }}</strong></p>
            <p>Generated at: <strong>{{ publicState.generatedAt }}</strong></p>
          </div>
          <p v-else class="text-gray-500">Loading public contour state...</p>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useDashboardSync } from '../../composables/useDashboardSync'
import { useWorkflowStore } from '../../store/modules/workflow'

const auth = useAuth()
const workflow = useWorkflowStore()
workflow.hydrateState()

const metrics = workflow.metrics

const { canSync, isSyncing, publicState, publicStateError, syncMessage, syncPublicContour } =
  useDashboardSync()
</script>
