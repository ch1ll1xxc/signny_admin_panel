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
      <!-- Аватарные материалы — экспонаты -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900">Аватарные материалы — экспонаты</h3>
        <p class="text-sm text-slate-600">Привязка сцен с анимированным аватаром к экспонатам для публичного контура.</p>

        <div v-if="isLoadingExhibits" class="text-sm text-slate-500">Загружаем...</div>
        <table v-else-if="exhibits.length" class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th class="py-2 pr-3">Экспонат</th>
              <th class="py-2 pr-3">Статус</th>
              <th class="py-2 pr-3">Сцена аватара</th>
              <th class="py-2 text-right">Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ex in exhibits" :key="ex.id" class="border-b border-slate-100">
              <td class="py-2 pr-3 font-medium">{{ ex.title }}</td>
              <td class="py-2 pr-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="ex.currentStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'">{{ ex.currentStatus }}</span>
              </td>
              <td class="py-2 pr-3">
                <span v-if="getBinding(ex.id)" class="text-green-600 text-xs">✓ Привязана</span>
                <span v-else class="text-slate-400 text-xs">Не привязана</span>
              </td>
              <td class="py-2 text-right">
                <button class="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" @click="openAvatarDialog(ex.id, 'exhibit', ex.title)">
                  {{ getBinding(ex.id) ? 'Изменить' : 'Привязать' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Аватарные материалы — FAQ -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900">Аватарные материалы — FAQ</h3>
        <p class="text-sm text-slate-600">Привязка сцен аватара к FAQ-элементам.</p>

        <table v-if="faqItems.length" class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th class="py-2 pr-3">Вопрос</th>
              <th class="py-2 pr-3">Сцена аватара</th>
              <th class="py-2 text-right">Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="faq in faqItems" :key="faq.id" class="border-b border-slate-100">
              <td class="py-2 pr-3 font-medium max-w-xs truncate">{{ faq.question }}</td>
              <td class="py-2 pr-3">
                <span v-if="getBinding(faq.id)" class="text-green-600 text-xs">✓ Привязана</span>
                <span v-else class="text-slate-400 text-xs">Не привязана</span>
              </td>
              <td class="py-2 text-right">
                <button class="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" @click="openAvatarDialog(faq.id, 'faq', faq.question)">
                  {{ getBinding(faq.id) ? 'Изменить' : 'Привязать' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-sm text-slate-500">FAQ элементов пока нет.</p>
      </div>

      <!-- Диалог привязки аватара -->
      <div v-if="avatarDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="avatarDialog = null">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
          <h3 class="text-lg font-semibold">Привязка аватарного материала</h3>
          <p class="text-sm text-slate-600 truncate">{{ avatarDialog.title }}</p>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">URL сцены с аватаром</label>
            <input v-model="avatarSceneUrl" type="text" placeholder="https://cdn.example.com/scenes/avatar.glb" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
            <p class="mt-1 text-xs text-slate-400">Ссылка на готовую сцену (glb, mp4, или URL потока)</p>
          </div>
          <div class="flex justify-end gap-2">
            <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" @click="avatarDialog = null">Отмена</button>
            <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700" @click="saveAvatarBinding">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useNotify } from '../../composables/useNotify'
import { useWorkflowStore } from '../../store/modules/workflow'
import { workflowApi } from '@/api/workflowApi'
import type { ExhibitListItem, AdminFaqItem } from '@/types/workflow'

const auth = useAuth()
const notify = useNotify()
const workflow = useWorkflowStore()

const isChecking = ref(false)
const isPublishing = ref(false)
const preflightResult = ref<{ approved: number; onReview: number; draft: number } | null>(null)
const publishResult = ref<{ publishedCount: number; synced: boolean; syncMessage: string } | null>(null)

const runPreflight = async () => {
  isChecking.value = true
  try {
    preflightResult.value = await workflowApi.runPreflightChecks()
    notify.info(`Готово к публикации: ${preflightResult.value.approved}`)
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка проверки')
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
    // Refresh workflow store so dashboard picks up new statuses
    workflow.hydrateState()
    // Reload exhibit list on this page
    loadExhibitsAndFaq()
    notify.success(`Опубликовано: ${publishResult.value.publishedCount} версий`)
  } catch (e) {
    notify.error(e instanceof Error ? e.message : 'Ошибка публикации')
  } finally {
    isPublishing.value = false
  }
}

// --- Аватарные материалы ---
const AVATAR_STORAGE_KEY = 'admin_avatar_bindings'

interface AvatarBinding {
  entityId: string
  entityType: 'exhibit' | 'faq'
  sceneUrl: string
  createdAt: string
}

const exhibits = ref<ExhibitListItem[]>([])
const faqItems = ref<AdminFaqItem[]>([])
const isLoadingExhibits = ref(false)
const avatarBindings = ref<AvatarBinding[]>([])
const avatarDialog = ref<{ entityId: string; entityType: 'exhibit' | 'faq'; title: string } | null>(null)
const avatarSceneUrl = ref('')

function loadBindings(): AvatarBinding[] {
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function persistBindings() {
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatarBindings.value))
}

const getBinding = (entityId: string) => avatarBindings.value.find((b) => b.entityId === entityId)

const openAvatarDialog = (entityId: string, entityType: 'exhibit' | 'faq', title: string) => {
  avatarDialog.value = { entityId, entityType, title }
  avatarSceneUrl.value = getBinding(entityId)?.sceneUrl ?? ''
}

const saveAvatarBinding = () => {
  if (!avatarDialog.value || !avatarSceneUrl.value.trim()) {
    notify.error('Укажите URL сцены')
    return
  }
  avatarBindings.value = [
    ...avatarBindings.value.filter((b) => b.entityId !== avatarDialog.value!.entityId),
    {
      entityId: avatarDialog.value.entityId,
      entityType: avatarDialog.value.entityType,
      sceneUrl: avatarSceneUrl.value.trim(),
      createdAt: new Date().toISOString(),
    },
  ]
  persistBindings()
  avatarDialog.value = null
  avatarSceneUrl.value = ''
  notify.success('Аватарный материал привязан')
}

const loadExhibitsAndFaq = async () => {
  isLoadingExhibits.value = true
  try {
    const [exList, faqList] = await Promise.all([
      workflowApi.listExhibits().catch(() => [] as ExhibitListItem[]),
      workflowApi.listFaqItems().catch(() => [] as AdminFaqItem[]),
    ])
    exhibits.value = exList
    faqItems.value = faqList
  } finally {
    isLoadingExhibits.value = false
  }
}

onMounted(() => {
  avatarBindings.value = loadBindings()
  loadExhibitsAndFaq()
})
</script>
