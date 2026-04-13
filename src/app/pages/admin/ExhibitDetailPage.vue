<template>
  <AdminLayout>
    <template #title>{{ exhibit?.title ?? 'Экспонат' }}</template>

    <div v-if="isLoading" class="text-sm text-slate-500">Загружаем карточку экспоната...</div>
    <div v-else-if="loadError" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ loadError }}</div>

    <div v-else class="space-y-6">
      <router-link to="/admin/exhibits" class="inline-flex items-center gap-1 text-sm text-violet-700 hover:text-violet-900">
        ← Назад к списку
      </router-link>

      <!-- Карточка экспоната -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Карточка экспоната</h2>
          <button
            v-if="canWrite && !isEditingExhibit"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="startEditExhibit"
          >
            Редактировать
          </button>
        </div>

        <template v-if="isEditingExhibit">
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Название</label>
              <input v-model="editTitle" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Краткое описание</label>
              <input v-model="editSummary" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Полное описание</label>
              <textarea v-model="editDescription" rows="4" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">URL изображения</label>
              <input v-model="editImageUrl" type="text" placeholder="https://..." class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div class="flex gap-2">
              <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300" :disabled="isSaving" @click="saveExhibit">
                {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
              </button>
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="isEditingExhibit = false">Отмена</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="grid gap-3 md:grid-cols-3 text-sm">
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Статус</p>
              <p class="font-medium">{{ currentVersion ? statusLabels[currentVersion.status] : '-' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Версия</p>
              <p class="font-medium">{{ currentVersion ? `v${currentVersion.number}` : '-' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Ответственный</p>
              <p class="font-medium">{{ exhibit?.owner ?? '-' }}</p>
            </div>
          </div>
          <p v-if="exhibit?.summary" class="text-sm text-slate-600">{{ exhibit.summary }}</p>
          <p v-if="exhibit?.description" class="text-sm text-slate-700">{{ exhibit.description }}</p>
          <img v-if="exhibit?.imageUrl" :src="exhibit.imageUrl" alt="Фото экспоната" class="max-h-64 rounded-xl object-cover" />
        </template>
      </div>

      <!-- Контент версии -->
      <div v-if="currentVersion" class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Контент версии v{{ currentVersion.number }}</h2>
          <button
            v-if="canWrite && canEditContent && !isEditingContent"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="startEditContent"
          >
            Редактировать контент
          </button>
        </div>

        <template v-if="isEditingContent">
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Исходный текст (русский)</label>
              <textarea v-model="editSourceText" rows="6" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" placeholder="Введите исходный текст описания экспоната..." />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Адаптированный текст (для РЖЯ)</label>
              <textarea v-model="editAdaptedText" rows="6" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" placeholder="Адаптированный текст после обработки или ручной правки..." />
            </div>
            <div class="flex gap-2">
              <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300" :disabled="isSaving" @click="saveContent">
                {{ isSaving ? 'Сохраняем...' : 'Сохранить контент' }}
              </button>
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="isEditingContent = false">Отмена</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="currentVersion.sourceText" class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs font-medium text-slate-500 mb-2">Исходный текст</p>
            <p class="text-sm text-slate-800 whitespace-pre-wrap">{{ currentVersion.sourceText }}</p>
          </div>
          <div v-if="currentVersion.adaptedText" class="rounded-xl bg-violet-50 border border-violet-100 p-4">
            <p class="text-xs font-medium text-violet-600 mb-2">Адаптированный текст</p>
            <p class="text-sm text-slate-800 whitespace-pre-wrap">{{ currentVersion.adaptedText }}</p>
          </div>
          <p v-if="!currentVersion.sourceText && !currentVersion.adaptedText" class="text-sm text-slate-500">Контент ещё не добавлен. Нажмите «Редактировать контент».</p>
        </template>
      </div>

      <!-- Действия по версии -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">Действия по версии</h2>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ errorMessage }}</p>

        <div v-if="availableActions.length" class="flex flex-wrap gap-2">
          <button
            v-for="action in availableActions"
            :key="action"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-50 disabled:opacity-50"
            :disabled="isTransitioning"
            @click="applyAction(action)"
          >
            {{ actionLabels[action] }}
          </button>
        </div>
        <p v-else class="text-sm text-slate-500">Для текущей роли нет доступных переходов.</p>

        <div class="space-y-2">
          <textarea
            v-model="reviewComment"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            rows="2"
            placeholder="Комментарий к согласованию"
          />
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            :disabled="!reviewComment.trim() || isCommentSubmitting"
            @click="submitComment"
          >
            {{ isCommentSubmitting ? 'Сохраняем...' : 'Добавить комментарий' }}
          </button>
        </div>
      </div>

      <!-- Комментарии -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 class="text-lg font-semibold text-slate-900">Комментарии</h2>
        <div v-for="comment in comments" :key="comment.id" class="rounded-xl bg-slate-50 p-3 text-sm">
          <p class="font-medium text-slate-800">{{ comment.authorRole }}</p>
          <p class="text-slate-600">{{ comment.message }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ new Date(comment.createdAt).toLocaleString('ru') }}</p>
        </div>
        <p v-if="!comments.length" class="text-sm text-slate-500">Комментариев пока нет.</p>
      </div>

      <!-- Задачи -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Задачи</h2>
          <div class="flex gap-2">
            <button
              v-if="canWrite"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              :disabled="isJobRunning"
              @click="runPreprocess"
            >
              {{ isJobRunning ? 'Выполняем...' : 'Запустить предобработку' }}
            </button>
          </div>
        </div>
        <div v-for="job in versionJobs" :key="job.id" class="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
          <span>{{ job.type }}</span>
          <span class="rounded-full px-2 py-1 text-xs font-medium" :class="job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
            {{ job.status }}
          </span>
        </div>
        <p v-if="!versionJobs.length" class="text-sm text-slate-500">Задач пока нет.</p>
      </div>

      <!-- Версии -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 class="text-lg font-semibold text-slate-900">История версий</h2>
        <div v-for="version in versions" :key="version.id" class="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
          <span class="font-medium">v{{ version.number }}</span>
          <span class="rounded-full px-2 py-1 text-xs font-medium" :class="versionStatusClass(version.status)">
            {{ statusLabels[version.status] }}
          </span>
        </div>
        <p v-if="!versions.length" class="text-sm text-slate-500">Версий пока нет.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { getAllowedActions, workflowApi } from '@/api/workflowApi'
import type { Exhibit, ReviewComment, Role, Version, VersionStatus, WorkflowAction, WorkflowJob } from '@/types/workflow'

const route = useRoute()
const auth = useAuth()

const exhibit = ref<Exhibit | null>(null)
const versions = ref<Version[]>([])
const comments = ref<ReviewComment[]>([])
const versionJobs = ref<WorkflowJob[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const isTransitioning = ref(false)
const isCommentSubmitting = ref(false)
const isJobRunning = ref(false)
const errorMessage = ref('')
const loadError = ref('')
const reviewComment = ref('')

const isEditingExhibit = ref(false)
const editTitle = ref('')
const editSummary = ref('')
const editDescription = ref('')
const editImageUrl = ref('')

const isEditingContent = ref(false)
const editSourceText = ref('')
const editAdaptedText = ref('')

const canWrite = computed(() => auth.can('exhibits.write'))
const exhibitId = computed(() => String(route.params.id ?? ''))
const userRole = computed(() => (auth.user.value?.role ?? 'editor') as Role)

const currentVersion = computed(() => {
  if (!exhibit.value) return null
  return versions.value.find((v) => v.id === exhibit.value?.currentVersionId) ?? versions.value[0] ?? null
})

const canEditContent = computed(() => {
  if (!currentVersion.value) return false
  return ['draft', 'needs_revision'].includes(currentVersion.value.status)
})

const availableActions = computed(() => {
  if (!currentVersion.value) return []
  return getAllowedActions(currentVersion.value.status, userRole.value)
})

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

const versionStatusClass = (status: VersionStatus) => {
  if (status === 'published') return 'bg-green-100 text-green-700'
  if (status === 'on_review') return 'bg-amber-100 text-amber-700'
  if (status === 'approved') return 'bg-violet-100 text-violet-700'
  if (status === 'needs_revision') return 'bg-rose-100 text-rose-700'
  return 'bg-gray-100 text-gray-600'
}

const refresh = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    exhibit.value = await workflowApi.getExhibitDetail(exhibitId.value)
    versions.value = await workflowApi.listVersions(exhibitId.value)
    if (currentVersion.value) {
      comments.value = await workflowApi.listReviewComments(currentVersion.value.id)
      versionJobs.value = await workflowApi.listJobs(currentVersion.value.id)
    }
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Не удалось загрузить экспонат'
  } finally {
    isLoading.value = false
  }
}

const startEditExhibit = () => {
  if (!exhibit.value) return
  editTitle.value = exhibit.value.title
  editSummary.value = exhibit.value.summary
  editDescription.value = exhibit.value.description ?? ''
  editImageUrl.value = exhibit.value.imageUrl ?? ''
  isEditingExhibit.value = true
}

const saveExhibit = async () => {
  isSaving.value = true
  try {
    await workflowApi.updateExhibit(exhibitId.value, {
      title: editTitle.value,
      summary: editSummary.value,
      description: editDescription.value,
      imageUrl: editImageUrl.value || undefined,
    }, userRole.value)
    isEditingExhibit.value = false
    await refresh()
  } finally {
    isSaving.value = false
  }
}

const startEditContent = () => {
  if (!currentVersion.value) return
  editSourceText.value = currentVersion.value.sourceText ?? ''
  editAdaptedText.value = currentVersion.value.adaptedText ?? ''
  isEditingContent.value = true
}

const saveContent = async () => {
  if (!currentVersion.value) return
  isSaving.value = true
  try {
    await workflowApi.updateVersion(currentVersion.value.id, {
      sourceText: editSourceText.value,
      adaptedText: editAdaptedText.value,
    }, userRole.value)
    isEditingContent.value = false
    await refresh()
  } finally {
    isSaving.value = false
  }
}

const applyAction = async (action: WorkflowAction) => {
  if (!currentVersion.value) return
  isTransitioning.value = true
  errorMessage.value = ''
  try {
    await workflowApi.transitionVersion(currentVersion.value.id, action, userRole.value, reviewComment.value || undefined)
    if (action === 'request_revision') reviewComment.value = ''
    await refresh()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Не удалось выполнить переход'
  } finally {
    isTransitioning.value = false
  }
}

const submitComment = async () => {
  if (!currentVersion.value || !reviewComment.value.trim()) return
  isCommentSubmitting.value = true
  try {
    await workflowApi.addReviewComment(currentVersion.value.id, reviewComment.value, userRole.value)
    reviewComment.value = ''
    comments.value = await workflowApi.listReviewComments(currentVersion.value.id)
  } finally {
    isCommentSubmitting.value = false
  }
}

const runPreprocess = async () => {
  if (!currentVersion.value) return
  isJobRunning.value = true
  try {
    await workflowApi.runJob(currentVersion.value.id, 'preprocess', userRole.value)
    versionJobs.value = await workflowApi.listJobs(currentVersion.value.id)
  } finally {
    isJobRunning.value = false
  }
}

watch(() => [auth.user.value?.role, exhibitId.value], () => { void refresh() })
onMounted(refresh)
</script>
