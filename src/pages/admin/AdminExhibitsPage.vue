<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold">Экспонаты</h2>
        <p class="text-sm text-slate-500">Карточки экспонатов и их workflow-статусы</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" :disabled="isReloading" @click="reload">
          {{ isReloading ? 'Обновляем...' : 'Обновить' }}
        </button>
        <button
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isCreating"
          @click="createExhibit"
        >
          {{ isCreating ? 'Создаем...' : 'Новый экспонат' }}
        </button>
      </div>
    </header>
    <p v-if="feedback" class="text-sm text-slate-600">{{ feedback }}</p>

    <article class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr>
            <th class="px-4 py-3">Экспонат</th>
            <th class="px-4 py-3">Экспозиция</th>
            <th class="px-4 py-3">Ответственный</th>
            <th class="px-4 py-3">Статус версии</th>
            <th class="px-4 py-3">Обновлено</th>
            <th class="px-4 py-3">Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in exhibits" :key="item.id" class="border-t border-slate-100">
            <td class="px-4 py-3 font-medium">{{ item.title }}</td>
            <td class="px-4 py-3">{{ item.expositionTitle }}</td>
            <td class="px-4 py-3">{{ item.owner }}</td>
            <td class="px-4 py-3">
              <span class="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{{ statusLabel[item.currentStatus] }}</span>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ formatDate(item.updatedAt) }}</td>
            <td class="px-4 py-3">
              <RouterLink :to="`/exhibit/${item.id}`" class="text-slate-700 underline">Открыть</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { workflowApi } from '@/api/workflowApi'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { ExhibitListItem, VersionStatus } from '@/types/workflow'

const exhibits = ref<ExhibitListItem[]>([])
const feedback = ref('')
const auth = useAuthStore()
const { pushToast } = useToast()
const isReloading = ref(false)
const isCreating = ref(false)

const statusLabel: Record<VersionStatus, string> = {
  draft: 'Черновик',
  on_review: 'На согласовании',
  approved: 'Согласовано',
  published: 'Опубликовано',
  needs_revision: 'Нужна доработка',
  archived: 'Архив',
}

const formatDate = (isoDate: string): string => new Date(isoDate).toLocaleString()

const roleLabel = () => {
  if (auth.role === 'editor') return 'Редактор'
  if (auth.role === 'curator') return 'Куратор'
  return 'Администратор'
}

const reload = async () => {
  isReloading.value = true
  try {
    exhibits.value = await workflowApi.listExhibits()
  } finally {
    isReloading.value = false
  }
}

const createExhibit = async () => {
  feedback.value = ''
  isCreating.value = true
  const previous = [...exhibits.value]
  const optimisticId = `optimistic-${Date.now()}`
  const optimistic: ExhibitListItem = {
    id: optimisticId,
    title: `Новый экспонат ${new Date().toLocaleTimeString()}`,
    expositionTitle: 'Истоки стекла',
    owner: roleLabel(),
    currentStatus: 'draft',
    updatedAt: new Date().toISOString(),
  }
  exhibits.value = [optimistic, ...exhibits.value]
  try {
    const title = optimistic.title
    await workflowApi.createExhibit(title, auth.role)
    await reload()
    feedback.value = 'Создан новый экспонат в статусе черновика.'
    pushToast('success', 'Экспонат создан')
  } catch (error) {
    exhibits.value = previous
    feedback.value = error instanceof Error ? error.message : 'Не удалось создать экспонат'
    pushToast('error', feedback.value)
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  await reload()
})
</script>
