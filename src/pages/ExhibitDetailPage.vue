<template>
  <section class="mx-auto min-h-screen max-w-4xl space-y-6 p-6 md:p-8">
    <RouterLink to="/admin/exhibits" class="text-sm text-slate-600 underline">Назад к списку экспонатов</RouterLink>

    <header class="rounded-lg border border-slate-200 bg-white p-5">
      <h1 class="text-2xl font-semibold">{{ exhibit?.title ?? `Exhibit ${exhibitId}` }}</h1>
      <p class="mt-2 text-sm text-slate-600">{{ exhibit?.summary ?? 'Карточка экспоната с редакционным и публикационным контекстом' }}</p>
    </header>

    <article class="rounded-lg border border-slate-200 bg-white p-5">
      <h2 class="text-lg font-semibold">Текущий статус</h2>
      <div class="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-slate-500">Workflow</p>
          <p class="font-medium">{{ currentVersion ? statusLabels[currentVersion.status] : '-' }}</p>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-slate-500">Версия</p>
          <p class="font-medium">{{ currentVersion ? `v${currentVersion.number}` : '-' }}</p>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-slate-500">Ответственный</p>
          <p class="font-medium">{{ exhibit?.owner ?? '-' }}</p>
        </div>
      </div>
      <div class="mt-3 rounded-md bg-slate-50 p-3 text-sm">
        <p class="text-slate-500">Экспозиция</p>
        <p class="font-medium">{{ expositionTitle }}</p>
      </div>
    </article>

    <article class="rounded-lg border border-slate-200 bg-white p-5">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">Действия по версии</h2>
        <p class="text-xs text-slate-500">Активная роль: {{ roleLabel(auth.role) }}</p>
      </header>

      <p v-if="errorMessage" class="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        {{ errorMessage }}
      </p>

      <div v-if="availableActions.length" class="mt-3 flex flex-wrap gap-2 text-sm">
        <button
          v-for="action in availableActions"
          :key="action"
          class="rounded-md border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isTransitioning"
          @click="applyAction(action)"
        >
          {{ isTransitioning && currentAction === action ? `${actionLabels[action]}...` : actionLabels[action] }}
        </button>
      </div>
      <p v-else class="mt-3 text-sm text-slate-500">Для текущей роли нет доступных переходов.</p>

      <label class="mt-4 block text-sm font-medium text-slate-700">
        Комментарий к согласованию
        <textarea
          v-model="reviewComment"
          class="mt-2 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Обязательно при переводе в 'Нужна доработка'."
        />
      </label>

      <button
        class="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isCommentSubmitting || !reviewComment.trim()"
        @click="submitComment"
      >
        {{ isCommentSubmitting ? 'Сохраняем комментарий...' : 'Добавить комментарий' }}
      </button>
    </article>

    <article class="rounded-lg border border-slate-200 bg-white p-5">
      <h2 class="text-lg font-semibold">Комментарии</h2>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="comment in comments" :key="comment.id" class="rounded-md bg-slate-50 p-3">
          <p class="font-medium">{{ comment.authorRole }}</p>
          <p class="text-slate-700">{{ comment.message }}</p>
        </li>
      </ul>
      <p v-if="!comments.length" class="mt-3 text-sm text-slate-500">Комментариев пока нет.</p>
    </article>

    <article class="rounded-lg border border-slate-200 bg-white p-5">
      <header class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">Задачи</h2>
        <button
          class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isJobRunning"
          @click="runExport"
        >
          {{ isJobRunning ? 'Запускаем экспорт...' : 'Запустить экспорт' }}
        </button>
      </header>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="job in versionJobs" :key="job.id" class="flex items-center justify-between rounded-md bg-slate-50 p-3">
          <span>{{ job.type }}</span>
          <span class="font-medium">{{ job.status }}</span>
        </li>
      </ul>
      <p v-if="!versionJobs.length" class="mt-3 text-sm text-slate-500">Для этой версии задач пока нет.</p>
    </article>

    <article class="rounded-lg border border-slate-200 bg-white p-5">
      <h2 class="text-lg font-semibold">Версии</h2>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="version in versions" :key="version.id" class="flex items-center justify-between rounded-md bg-slate-50 p-3">
          <span>v{{ version.number }}</span>
          <span class="font-medium">{{ statusLabels[version.status] }}</span>
        </li>
      </ul>
      <p v-if="!versions.length" class="mt-3 text-sm text-slate-500">Версий пока нет.</p>
    </article>

    <article v-if="isLoading" class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">Загружаем карточку экспоната...</article>
    <article v-if="loadError" class="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{{ loadError }}</article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getAllowedActions, workflowApi } from '@/api/mockWorkflowApi'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { Exhibit, Exposition, ReviewComment, Role, Version, VersionStatus, WorkflowAction, WorkflowJob } from '@/types/workflow'

const route = useRoute()
const auth = useAuthStore()

const exhibit = ref<Exhibit | null>(null)
const expositions = ref<Exposition[]>([])
const versions = ref<Version[]>([])
const comments = ref<ReviewComment[]>([])
const versionJobs = ref<WorkflowJob[]>([])
const isLoading = ref(false)
const isTransitioning = ref(false)
const isCommentSubmitting = ref(false)
const isJobRunning = ref(false)
const currentAction = ref<WorkflowAction | null>(null)
const errorMessage = ref('')
const loadError = ref('')
const reviewComment = ref('')
const { pushToast } = useToast()

const exhibitId = computed(() => String(route.params.id ?? 'unknown'))
const currentVersion = computed(() => {
  if (!exhibit.value) {
    return null
  }
  return versions.value.find((item) => item.id === exhibit.value?.currentVersionId) ?? versions.value[0] ?? null
})

const availableActions = computed(() => {
  if (!currentVersion.value) {
    return []
  }
  return getAllowedActions(currentVersion.value.status, auth.role)
})

const expositionTitle = computed(() => {
  if (!exhibit.value) {
    return '-'
  }
  return expositions.value.find((item) => item.id === exhibit.value?.expositionId)?.title ?? '-'
})

const roleLabel = (role: Role) => {
  if (role === 'editor') return 'Редактор'
  if (role === 'curator') return 'Куратор'
  return 'Администратор'
}

const statusLabels: Record<VersionStatus, string> = {
  draft: 'Черновик',
  on_review: 'На согласовании',
  approved: 'Согласовано',
  published: 'Опубликовано',
  needs_revision: 'Нужна доработка',
  archived: 'Архив',
}

const actionLabels: Record<WorkflowAction, string> = {
  submit_for_review: 'Отправить на согласование',
  approve: 'Согласовать',
  request_revision: 'Вернуть на доработку',
  return_to_draft: 'Вернуть в черновик',
  publish: 'Опубликовать',
  archive: 'В архив',
}

const refresh = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    exhibit.value = await workflowApi.getExhibitDetail(exhibitId.value)
    expositions.value = await workflowApi.listExpositions()
    versions.value = await workflowApi.listVersions(exhibitId.value)
    if (currentVersion.value) {
      comments.value = await workflowApi.listReviewComments(currentVersion.value.id)
      versionJobs.value = await workflowApi.listJobs(currentVersion.value.id)
    } else {
      comments.value = []
      versionJobs.value = []
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Не удалось загрузить карточку экспоната'
  } finally {
    isLoading.value = false
  }
}

const applyAction = async (action: WorkflowAction) => {
  if (!currentVersion.value) {
    return
  }
  isTransitioning.value = true
  currentAction.value = action
  errorMessage.value = ''
  const previousVersions = [...versions.value]
  const previousCurrentVersionId = exhibit.value?.currentVersionId
  const previousComments = [...comments.value]
  const nextStatusByAction: Record<WorkflowAction, VersionStatus> = {
    submit_for_review: 'on_review',
    approve: 'approved',
    request_revision: 'needs_revision',
    return_to_draft: 'draft',
    publish: 'published',
    archive: 'archived',
  }
  versions.value = versions.value.map((version) =>
    version.id === currentVersion.value?.id
      ? {
          ...version,
          status: nextStatusByAction[action],
          updatedAt: new Date().toISOString(),
        }
      : version,
  )
  try {
    await workflowApi.transitionVersion(
      currentVersion.value.id,
      action,
      auth.role,
      action === 'request_revision' ? reviewComment.value : undefined,
    )
    if (action === 'request_revision') {
      reviewComment.value = ''
    }
    pushToast('success', `Переход выполнен: ${actionLabels[action]}`)
    await refresh()
  } catch (error) {
    versions.value = previousVersions
    if (exhibit.value && previousCurrentVersionId) {
      exhibit.value.currentVersionId = previousCurrentVersionId
    }
    comments.value = previousComments
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось выполнить переход'
    pushToast('error', errorMessage.value)
  } finally {
    isTransitioning.value = false
    currentAction.value = null
  }
}

const submitComment = async () => {
  if (!currentVersion.value || !reviewComment.value.trim()) {
    return
  }
  isCommentSubmitting.value = true
  errorMessage.value = ''
  try {
    await workflowApi.addReviewComment(currentVersion.value.id, reviewComment.value, auth.role)
    reviewComment.value = ''
    comments.value = await workflowApi.listReviewComments(currentVersion.value.id)
    pushToast('success', 'Комментарий добавлен')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось сохранить комментарий'
    pushToast('error', errorMessage.value)
  } finally {
    isCommentSubmitting.value = false
  }
}

const runExport = async () => {
  if (!currentVersion.value) {
    return
  }
  isJobRunning.value = true
  errorMessage.value = ''
  try {
    await workflowApi.runJob(currentVersion.value.id, 'export', auth.role)
    versionJobs.value = await workflowApi.listJobs(currentVersion.value.id)
    pushToast('success', 'Экспорт выполнен')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось запустить экспорт'
    pushToast('error', errorMessage.value)
  } finally {
    isJobRunning.value = false
  }
}

watch(
  () => [auth.role, exhibitId.value],
  async () => {
    await refresh()
  },
)

onMounted(async () => {
  await refresh()
})
</script>
