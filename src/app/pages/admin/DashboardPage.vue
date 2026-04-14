<template>
  <AdminLayout>
    <template #title>Дашборд</template>

    <div class="space-y-6">
      <section class="bento-card p-6">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Административный контур</p>
            <h2 class="mt-2 text-3xl font-bold text-slate-900">Контроль публикаций и модерации</h2>
            <p class="mt-2 max-w-2xl text-sm text-slate-600">
              Отслеживайте жизненный цикл контента, прогресс согласования и синхронизацию с публичным контуром.
            </p>
          </div>

          <div class="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            <p class="font-semibold">Текущая роль: {{ roleLabel }}</p>
            <p class="mt-1 text-xs text-violet-700">{{ user?.email || '' }}</p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <article
          v-for="card in metricCards"
          :key="card.key"
          class="bento-card relative overflow-hidden p-5"
        >
          <div class="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20" :class="card.bgClass" />
          <div class="relative flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
              <p class="mt-2 text-4xl font-bold text-slate-900">{{ card.value }}</p>
            </div>
            <el-icon :size="22" :class="card.iconClass">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </article>
      </section>

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article class="bento-card p-5 xl:col-span-2">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-slate-900">Быстрые действия</h3>
            <el-icon class="text-violet-600" :size="20"><Lightning /></el-icon>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <router-link
              to="/admin/exhibits"
              class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              К экспонатам
            </router-link>
            <router-link
              to="/admin/review"
              class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              Очередь модерации
            </router-link>
            <router-link
              to="/admin/audit"
              class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              Журнал аудита
            </router-link>
          </div>

          <div class="mt-5">
            <h4 class="text-sm font-semibold text-slate-700">Состояние пайплайна</h4>
            <div class="mt-3 space-y-3">
              <div v-for="lane in progressLanes" :key="lane.label">
                <div class="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{{ lane.label }}</span>
                  <span>{{ lane.value }}</span>
                </div>
                <el-progress :percentage="lane.percentage" :stroke-width="10" :show-text="false" :color="lane.color" />
              </div>
            </div>
          </div>
        </article>

        <article class="bento-card p-5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-slate-900">Синхронизация</h3>
            <el-icon class="text-emerald-600" :size="20"><Connection /></el-icon>
          </div>

          <p class="mt-2 text-sm text-slate-600">
            Передача опубликованных версий в публичный контур и проверка состояния snapshot.
          </p>

          <el-button
            class="mt-4 w-full"
            type="primary"
            :loading="isSyncing"
            :disabled="!canSync"
            @click="syncPublicContour"
          >
            {{ isSyncing ? 'Синхронизация...' : 'Синхронизировать публикации' }}
          </el-button>

          <p v-if="syncMessage" class="mt-3 text-sm text-emerald-700">{{ syncMessage }}</p>

          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Всего версий</span>
              <strong class="text-slate-800">{{ metrics.total }}</strong>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-slate-500">Опубликовано</span>
              <strong class="text-slate-800">{{ metrics.published }}</strong>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-slate-500">На согласовании</span>
              <strong class="text-slate-800">{{ metrics.onReview }}</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Connection, DataAnalysis, Lightning, WarningFilled } from '@element-plus/icons-vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useDashboardSync } from '../../composables/useDashboardSync'
import { useWorkflowStore } from '../../store/modules/workflow'

const auth = useAuth()
const { user } = auth
const workflow = useWorkflowStore()
workflow.hydrateState()

const metrics = workflow.metrics

const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: 'Администратор', editor: 'Редактор', curator: 'Куратор', analyst: 'Аналитик' }
  return map[user.value?.role ?? ''] ?? 'Гость'
})

const { canSync, isSyncing, syncMessage, syncPublicContour } =
  useDashboardSync()

const metricCards = computed(() => [
  {
    key: 'total',
    label: 'Всего версий',
    value: metrics.total,
    icon: DataAnalysis,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-400',
  },
  {
    key: 'draft',
    label: 'Черновики',
    value: metrics.draft,
    icon: DataAnalysis,
    iconClass: 'text-slate-500',
    bgClass: 'bg-slate-400',
  },
  {
    key: 'review',
    label: 'На согласовании',
    value: metrics.onReview,
    icon: WarningFilled,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-400',
  },
  {
    key: 'approved',
    label: 'Согласовано',
    value: metrics.approved,
    icon: Check,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-400',
  },
  {
    key: 'revision',
    label: 'Нужна доработка',
    value: metrics.needsRevision,
    icon: WarningFilled,
    iconClass: 'text-rose-600',
    bgClass: 'bg-rose-400',
  },
  {
    key: 'published',
    label: 'Опубликовано',
    value: metrics.published,
    icon: Check,
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-400',
  },
])

const progressLanes = computed(() => {
  const total = Math.max(metrics.total, 1)
  return [
    {
      label: 'Черновики',
      value: metrics.draft,
      percentage: Math.round((metrics.draft / total) * 100),
      color: '#94a3b8',
    },
    {
      label: 'На согласовании',
      value: metrics.onReview,
      percentage: Math.round((metrics.onReview / total) * 100),
      color: '#f59e0b',
    },
    {
      label: 'Согласовано',
      value: metrics.approved,
      percentage: Math.round((metrics.approved / total) * 100),
      color: '#8b5cf6',
    },
    {
      label: 'Доработка',
      value: metrics.needsRevision,
      percentage: Math.round((metrics.needsRevision / total) * 100),
      color: '#f43f5e',
    },
    {
      label: 'Опубликовано',
      value: metrics.published,
      percentage: Math.round((metrics.published / total) * 100),
      color: '#10b981',
    },
  ]
})
</script>
