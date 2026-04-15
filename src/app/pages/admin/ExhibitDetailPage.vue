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
              <label class="block text-xs font-medium text-slate-500 mb-1">Описание</label>
              <textarea v-model="editDescription" rows="4" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">URL изображения</label>
              <input v-model="editImageUrl" type="text" placeholder="https://..." class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Экспозиция</label>
              <select v-if="expositions.length" v-model="editExpositionId" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
                <option value="">— не выбрана —</option>
                <option v-for="exp in expositions" :key="exp.id" :value="exp.id">{{ exp.title }}{{ exp.hall ? ` (${exp.hall})` : '' }}</option>
                <option value="__new__">+ Новая экспозиция...</option>
              </select>
              <div v-if="editExpositionId === '__new__' || !expositions.length" class="mt-2 space-y-2">
                <input v-model="newExpositionTitle" type="text" placeholder="Название экспозиции" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
                <input v-model="newExpositionHall" type="text" placeholder="Зал (необязательно)" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">AR-сцена (анимированная 3D-модель)</label>
              <div v-if="editModel3dUrl" class="flex items-center gap-2 mb-2 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2">
                <span class="text-sm text-violet-700 truncate flex-1">{{ editModel3dUrl }}</span>
                <button class="text-xs text-red-500 hover:text-red-700" @click="editModel3dUrl = ''">Удалить</button>
              </div>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <span>{{ isUploadingScene ? 'Загрузка...' : 'Загрузить файл (.glb, .gltf, .mp4)' }}</span>
                <input type="file" accept=".glb,.gltf,.mp4,.fbx" class="hidden" :disabled="isUploadingScene" @change="uploadArScene" />
              </label>
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
              <p class="text-xs text-slate-500">Экспозиция</p>
              <p class="font-medium">{{ currentExpositionTitle }}</p>
            </div>
          </div>
          <p v-if="exhibit?.description" class="text-sm text-slate-700">{{ exhibit.description }}</p>
          <img v-if="exhibit?.imageUrl" :src="exhibit.imageUrl" alt="Фото экспоната" class="max-h-64 rounded-xl object-cover" />
          <div v-if="(exhibit as any)?.model3dUrl" class="rounded-xl bg-violet-50 border border-violet-200 p-3">
            <p class="text-xs font-medium text-violet-600 mb-1">AR-сцена</p>
            <p class="text-sm text-slate-700 break-all">{{ (exhibit as any).model3dUrl }}</p>
          </div>
        </template>
      </div>

      <!-- Контент и версии -->
      <div v-if="currentVersion" class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <!-- Заголовок с версией и статусом -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-slate-900">Версия {{ currentVersion.number }}</h2>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="versionStatusClass(currentVersion.status)">
              {{ statusLabels[currentVersion.status] }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="canWrite && canEditContent && !isEditingContent"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              @click="startEditContent"
            >
              Редактировать
            </button>
            <button
              v-if="canWrite && canEditContent"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              :disabled="isJobRunning"
              @click="runPreprocess"
            >
              {{ isJobRunning ? 'Обработка...' : 'Предобработка РЖЯ' }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ errorMessage }}</p>

        <!-- Баннер: опубликовано — предложить новую версию -->
        <div v-if="currentVersion.status === 'published'" class="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center justify-between">
          <p class="text-sm text-green-800">Контент опубликован и доступен на сайте.</p>
          <div class="flex gap-2">
            <button
              v-if="canWrite"
              class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300"
              :disabled="isCreatingVersion"
              @click="createNewVersion"
            >
              {{ isCreatingVersion ? 'Создаём...' : 'Новая версия' }}
            </button>
            <button
              v-if="canPublish"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              :disabled="isTransitioning"
              @click="applyAction('archive')"
            >
              В архив
            </button>
          </div>
        </div>

        <!-- Баннер: архив -->
        <div v-else-if="currentVersion.status === 'archived'" class="rounded-xl bg-slate-100 border border-slate-200 p-4 flex items-center justify-between">
          <p class="text-sm text-slate-600">Версия в архиве.</p>
          <button
            v-if="canWrite"
            class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300"
            :disabled="isCreatingVersion"
            @click="createNewVersion"
          >
            {{ isCreatingVersion ? 'Создаём...' : 'Новая версия' }}
          </button>
        </div>

        <!-- Редактирование контента -->
        <template v-if="isEditingContent">
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-slate-500">Исходный текст (русский)</label>
                <label class="cursor-pointer rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                  Загрузить из файла
                  <input type="file" accept=".txt,.doc,.docx" class="hidden" @change="loadSourceFromFile" />
                </label>
              </div>
              <textarea v-model="editSourceText" rows="6" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" placeholder="Введите исходный текст описания экспоната..." />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Адаптированный текст (для РЖЯ)</label>
              <textarea v-model="editAdaptedText" rows="6" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" placeholder="Адаптированный текст после обработки или ручной правки..." />
            </div>
            <div class="flex gap-2">
              <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300" :disabled="isSaving" @click="saveContent">
                {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
              </button>
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="isEditingContent = false">Отмена</button>
            </div>
          </div>
        </template>

        <!-- Просмотр контента -->
        <template v-else-if="currentVersion.status !== 'published' && currentVersion.status !== 'archived'">
          <div v-if="currentVersion.sourceText" class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs font-medium text-slate-500 mb-2">Исходный текст</p>
            <p class="text-sm text-slate-800 whitespace-pre-wrap">{{ currentVersion.sourceText }}</p>
          </div>
          <div v-if="currentVersion.adaptedText" class="rounded-xl bg-violet-50 border border-violet-100 p-4">
            <p class="text-xs font-medium text-violet-600 mb-2">Адаптированный текст</p>
            <p class="text-sm text-slate-800 whitespace-pre-wrap">{{ currentVersion.adaptedText }}</p>
          </div>
          <p v-if="!currentVersion.sourceText && !currentVersion.adaptedText" class="text-sm text-slate-500">Контент ещё не добавлен. Нажмите «Редактировать».</p>
        </template>

        <!-- Кнопка публикации (для черновиков) -->
        <div v-if="canPublish && !['published', 'archived'].includes(currentVersion.status)" class="pt-2 border-t border-slate-100">
          <button
            class="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:bg-slate-300"
            :disabled="isTransitioning"
            @click="quickPublish"
          >
            {{ isTransitioning ? 'Публикуем...' : 'Опубликовать' }}
          </button>
          <p class="mt-1 text-xs text-slate-400">Контент пройдёт согласование и появится на публичном сайте.</p>
        </div>

        <!-- Компактная история версий -->
        <div v-if="versions.length > 1" class="pt-2 border-t border-slate-100">
          <button class="text-xs text-slate-500 hover:text-slate-700" @click="showVersionHistory = !showVersionHistory">
            {{ showVersionHistory ? 'Скрыть историю' : `Показать все версии (${versions.length})` }}
          </button>
          <div v-if="showVersionHistory" class="mt-2 space-y-1">
            <div v-for="version in versions" :key="version.id" class="flex items-center justify-between rounded-lg px-3 py-2 text-xs" :class="version.id === currentVersion.id ? 'bg-violet-50' : 'bg-slate-50'">
              <div class="flex items-center gap-2">
                <span class="font-medium">v{{ version.number }}</span>
                <span class="rounded-full px-1.5 py-0.5 text-[10px] font-medium" :class="versionStatusClass(version.status)">{{ statusLabels[version.status] }}</span>
                <span class="text-slate-400">{{ new Date(version.updatedAt).toLocaleDateString('ru') }}</span>
              </div>
              <button
                v-if="version.id !== currentVersion.id && canWrite"
                class="rounded px-2 py-0.5 text-violet-600 hover:bg-violet-100 disabled:opacity-50"
                :disabled="isSwitchingVersion"
                @click="switchToVersion(version)"
              >
                Переключиться
              </button>
              <span v-else-if="version.id === currentVersion.id" class="text-violet-600 font-medium">текущая</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ экспоната -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">FAQ экспоната</h2>
          <button
            v-if="canWrite"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="showFaqForm = !showFaqForm"
          >
            {{ showFaqForm ? 'Отмена' : 'Добавить вопрос' }}
          </button>
        </div>

        <div v-if="showFaqForm" class="space-y-3 rounded-xl bg-slate-50 p-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Вопрос</label>
            <input v-model="newFaqQuestion" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Ответ</label>
            <textarea v-model="newFaqAnswer" rows="3" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">URL видео (необязательно)</label>
            <input v-model="newFaqVideoUrl" type="text" placeholder="https://..." class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Субтитры (необязательно)</label>
            <textarea v-model="newFaqSubtitles" rows="2" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-400" placeholder="Текст субтитров или URL файла (.vtt, .srt)" />
          </div>
          <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:bg-slate-300" :disabled="!newFaqQuestion.trim() || !newFaqAnswer.trim()" @click="addFaq">
            Сохранить вопрос
          </button>
        </div>

        <div v-for="faq in exhibitFaq" :key="faq.id" class="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ faq.question }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ faq.answer }}</p>
              <p v-if="faq.videoUrl" class="mt-1 text-xs text-violet-600">Видео: {{ faq.videoUrl }}</p>
              <p v-if="faq.subtitles" class="mt-0.5 text-xs text-slate-400">Субтитры: {{ faq.subtitles.slice(0, 80) }}{{ faq.subtitles.length > 80 ? '...' : '' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="rounded-lg px-2 py-1 text-xs transition"
                :class="faq.isPublished ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'"
                @click="toggleFaqPublish(faq)"
              >
                {{ faq.isPublished ? 'Опубликован' : 'Скрыт' }}
              </button>
              <button v-if="canWrite" class="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50" @click="removeFaq(faq.id)">Удалить</button>
            </div>
          </div>
        </div>
        <p v-if="!exhibitFaq.length" class="text-sm text-slate-500">FAQ пока не добавлен.</p>
      </div>

      <!-- Комментарии -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 class="text-lg font-semibold text-slate-900">Комментарии</h2>
        <div class="space-y-2">
          <textarea
            v-model="reviewComment"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            rows="2"
            placeholder="Написать комментарий..."
          />
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            :disabled="!reviewComment.trim() || isCommentSubmitting"
            @click="submitComment"
          >
            {{ isCommentSubmitting ? 'Сохраняем...' : 'Отправить' }}
          </button>
        </div>
        <div v-for="comment in comments" :key="comment.id" class="rounded-xl bg-slate-50 p-3 text-sm">
          <p class="font-medium text-slate-800">{{ comment.authorRole }}</p>
          <p class="text-slate-600">{{ comment.message }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ new Date(comment.createdAt).toLocaleString('ru') }}</p>
        </div>
        <p v-if="!comments.length" class="text-sm text-slate-500">Комментариев пока нет.</p>
      </div>

      <!-- QR-код -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">QR-код</h2>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="generateQr"
          >
            Сгенерировать QR
          </button>
          <button
            v-if="qrGenerated"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="downloadQr"
          >
            Скачать PNG
          </button>
          <button
            v-if="qrGenerated"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            @click="printQr"
          >
            Печать
          </button>
        </div>
        <div class="flex flex-col items-center gap-2">
          <canvas ref="qrCanvas" :class="{ hidden: !qrGenerated }" />
          <p v-if="qrGenerated" class="text-xs text-slate-500">{{ qrUrl }}</p>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useNotify } from '../../composables/useNotify'
import { workflowApi } from '@/api/workflowApi'
import type { AdminFaqItem, Exhibit, ReviewComment, Role, Version, VersionStatus, WorkflowAction, WorkflowJob } from '@/types/workflow'

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

const exhibitFaq = ref<AdminFaqItem[]>([])
const showFaqForm = ref(false)
const newFaqQuestion = ref('')
const newFaqAnswer = ref('')
const newFaqVideoUrl = ref('')
const newFaqSubtitles = ref('')

const isEditingExhibit = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editImageUrl = ref('')
const editExpositionId = ref('')

const expositions = ref<{ id: string; title: string; hall: string }[]>([])
const newExpositionTitle = ref('')
const newExpositionHall = ref('')
const editModel3dUrl = ref('')
const isUploadingScene = ref(false)
const showVersionHistory = ref(false)
const isSwitchingVersion = ref(false)
const isCreatingVersion = ref(false)

const canCreateNewVersion = computed(() => {
  if (!currentVersion.value) return false
  return ['published', 'archived'].includes(currentVersion.value.status)
})
const isEditingContent = ref(false)
const editSourceText = ref('')
const editAdaptedText = ref('')

const notify = useNotify()
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

const canPublish = computed(() => ['admin', 'curator'].includes(userRole.value))

const currentExpositionTitle = computed(() => {
  const exp = expositions.value.find((e) => e.id === exhibit.value?.expositionId)
  return exp ? `${exp.title} (${exp.hall})` : exhibit.value?.expositionId ?? '-'
})

const statusLabels: Record<VersionStatus, string> = {
  draft: 'Черновик',
  on_review: 'На согласовании',
  approved: 'Согласовано',
  published: 'Опубликовано',
  needs_revision: 'Нужна доработка',
  archived: 'Архив',
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
    const [exhibitData, versionsList, expositionsList] = await Promise.all([
      workflowApi.getExhibitDetail(exhibitId.value),
      workflowApi.listVersions(exhibitId.value),
      workflowApi.listExpositions().catch(() => [] as { id: string; title: string; hall: string }[]),
    ])
    exhibit.value = exhibitData
    versions.value = versionsList
    expositions.value = expositionsList
    if (currentVersion.value) {
      comments.value = await workflowApi.listReviewComments(currentVersion.value.id)
      versionJobs.value = await workflowApi.listJobs(currentVersion.value.id)
    }
    const allFaq = await workflowApi.listFaqItems().catch(() => [] as AdminFaqItem[])
    exhibitFaq.value = allFaq.filter((f) => f.exhibitId === exhibitId.value)
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Не удалось загрузить экспонат'
  } finally {
    isLoading.value = false
  }
}

const startEditExhibit = () => {
  if (!exhibit.value) return
  editTitle.value = exhibit.value.title
  editDescription.value = exhibit.value.description ?? ''
  editImageUrl.value = exhibit.value.imageUrl ?? ''
  editExpositionId.value = exhibit.value.expositionId ?? ''
  editModel3dUrl.value = (exhibit.value as Record<string, unknown>).model3dUrl as string ?? ''
  isEditingExhibit.value = true
}

const saveExhibit = async () => {
  isSaving.value = true
  try {
    let resolvedExpositionId = editExpositionId.value
    if (editExpositionId.value === '__new__' || (!expositions.value.length && newExpositionTitle.value.trim())) {
      // Generate a simple exposition ID from the title
      resolvedExpositionId = 'exp-' + newExpositionTitle.value.trim().toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 20)
    }
    await workflowApi.updateExhibit(exhibitId.value, {
      title: editTitle.value,
      description: editDescription.value,
      imageUrl: editImageUrl.value || undefined,
      expositionId: resolvedExpositionId || undefined,
      model3dUrl: editModel3dUrl.value || undefined,
    } as Record<string, string | undefined>, userRole.value)
    newExpositionTitle.value = ''
    newExpositionHall.value = ''
    isEditingExhibit.value = false
    notify.success('Карточка сохранена')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка сохранения')
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

const uploadArScene = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  isUploadingScene.value = true
  try {
    const media = await workflowApi.uploadFile(file)
    editModel3dUrl.value = media.url
    notify.success(`Загружен: ${file.name}`)
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка загрузки файла')
  } finally {
    isUploadingScene.value = false
    input.value = ''
  }
}

const loadSourceFromFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    editSourceText.value = (reader.result as string).trim()
    notify.success(`Загружен: ${file.name}`)
  }
  reader.readAsText(file, 'utf-8')
  input.value = ''
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
    notify.success('Контент сохранён')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка сохранения контента')
  } finally {
    isSaving.value = false
  }
}

const quickPublish = async () => {
  if (!currentVersion.value) return
  isTransitioning.value = true
  errorMessage.value = ''
  try {
    const vid = currentVersion.value.id
    const status = currentVersion.value.status

    // Chain transitions to reach 'approved'
    if (status === 'draft' || status === 'needs_revision') {
      if (status === 'needs_revision') {
        await workflowApi.transitionVersion(vid, 'return_to_draft', userRole.value)
      }
      await workflowApi.transitionVersion(vid, 'submit_for_review', userRole.value)
      await workflowApi.transitionVersion(vid, 'approve', userRole.value)
    } else if (status === 'on_review') {
      await workflowApi.transitionVersion(vid, 'approve', userRole.value)
    }

    // Publish all approved + sync
    const result = await workflowApi.publishApproved(userRole.value)
    if (result.synced) {
      notify.success('Экспонат опубликован и синхронизирован')
    } else {
      notify.warning(`Опубликовано, но синхронизация не удалась: ${result.syncMessage}`)
    }
    await refresh()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Не удалось опубликовать'
  } finally {
    isTransitioning.value = false
  }
}

const applyAction = async (action: WorkflowAction) => {
  if (!currentVersion.value) return
  isTransitioning.value = true
  errorMessage.value = ''
  try {
    await workflowApi.transitionVersion(currentVersion.value.id, action, userRole.value, reviewComment.value || undefined)
    // After archiving, re-sync so the exhibit is removed from public site
    if (action === 'archive') {
      await workflowApi.publishApproved(userRole.value)
    }
    notify.success('Готово')
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
    // Обновляем версии чтобы показать сгенерированный адаптированный текст
    versions.value = await workflowApi.listVersions(exhibitId.value)
    notify.success('Предобработка завершена')
  } finally {
    isJobRunning.value = false
  }
}

const createNewVersion = async () => {
  isCreatingVersion.value = true
  try {
    await workflowApi.createVersion(exhibitId.value)
    notify.success('Новая версия создана')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка создания версии')
  } finally {
    isCreatingVersion.value = false
  }
}

const switchToVersion = async (version: Version) => {
  isSwitchingVersion.value = true
  try {
    await workflowApi.updateExhibit(exhibitId.value, {
      currentVersionId: version.id,
    } as Record<string, string>, userRole.value)
    notify.success(`Переключено на версию ${version.number}`)
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка переключения версии')
  } finally {
    isSwitchingVersion.value = false
  }
}

// --- FAQ ---
const addFaq = async () => {
  try {
    await workflowApi.addFaqItem({
      exhibitId: exhibitId.value,
      question: newFaqQuestion.value.trim(),
      answer: newFaqAnswer.value.trim(),
      videoUrl: newFaqVideoUrl.value.trim() || undefined,
      subtitles: newFaqSubtitles.value.trim() || undefined,
    }, userRole.value)
    newFaqQuestion.value = ''
    newFaqAnswer.value = ''
    newFaqVideoUrl.value = ''
    newFaqSubtitles.value = ''
    showFaqForm.value = false
    notify.success('Вопрос добавлен')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка добавления FAQ')
  }
}

const toggleFaqPublish = async (faq: AdminFaqItem) => {
  try {
    await workflowApi.updateFaqItem(faq.id, { isPublished: !faq.isPublished }, userRole.value)
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка обновления FAQ')
  }
}

const removeFaq = async (faqId: string) => {
  try {
    await workflowApi.deleteFaqItem(faqId, userRole.value)
    notify.success('Вопрос удалён')
    await refresh()
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка удаления FAQ')
  }
}

// --- QR-код ---
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrGenerated = ref(false)
const qrUrl = computed(() => `${window.location.origin}/exh/${exhibitId.value}`)

const generateQr = async () => {
  await nextTick()
  const canvas = qrCanvas.value
  if (!canvas) return
  try {
    await QRCode.toCanvas(canvas, qrUrl.value, { width: 200, margin: 2 })
    qrGenerated.value = true
  } catch (e) {
    notify.error('Ошибка генерации QR')
  }
}

const downloadQr = () => {
  const canvas = qrCanvas.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `qr-${exhibitId.value}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const printQr = () => {
  const canvas = qrCanvas.value
  if (!canvas) return
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<img src="${canvas.toDataURL('image/png')}" onload="window.print();window.close()" />`)
}

watch(() => [auth.user.value?.role, exhibitId.value], () => { void refresh() })
onMounted(refresh)
</script>
