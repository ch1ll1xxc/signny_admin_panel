<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold">Операционный дашборд</h2>
        <p class="text-sm text-slate-500">Сводка по экспозициям, экспонатам и редакционному контуру</p>
      </div>
      <button class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" @click="goToExhibits">Создать экспонат</button>
    </header>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <article v-for="metric in metrics" :key="metric.label" class="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
        <p class="text-sm text-slate-500">{{ metric.label }}</p>
        <p class="mt-1 text-2xl font-semibold">{{ metric.value }}</p>
        <p class="text-xs text-emerald-600">{{ metric.trend }}</p>
      </article>
    </div>
    <p v-if="isLoading" class="text-sm text-slate-500">Обновляем метрики...</p>

    <div class="grid gap-4 lg:grid-cols-3">
      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Статусы workflow</h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="status in workflow" :key="status.name" class="flex items-center justify-between">
            <span>{{ status.name }}</span>
            <span class="rounded bg-slate-100 px-2 py-1 font-medium">{{ status.count }}</span>
          </li>
        </ul>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Прогресс по экспозициям</h3>
        <ul class="mt-4 space-y-3 text-sm">
          <li v-for="item in expositionProgress" :key="item.title" class="space-y-1">
            <div class="flex items-center justify-between">
              <span>{{ item.title }}</span>
              <span class="text-xs text-slate-500">{{ item.percent }}%</span>
            </div>
            <div class="h-2 rounded bg-slate-100">
              <div class="h-2 rounded bg-slate-800" :style="{ width: `${item.percent}%` }"></div>
            </div>
          </li>
        </ul>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Быстрые действия</h3>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            v-for="action in quickActions"
            :key="action.label"
            class="rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
            @click="runQuickAction(action.route)"
          >
            {{ action.label }}
          </button>
        </div>
      </article>
    </div>

    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold">Grafana-ready панели</h3>
        <span class="rounded bg-slate-100 px-2 py-1 text-xs">prometheus labels</span>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="panel in grafanaPanels" :key="panel.metric" class="rounded-md border border-slate-200 p-3">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ panel.metric }}</p>
          <p class="mt-1 text-sm text-slate-700">{{ panel.desc }}</p>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { workflowApi } from '@/api/workflowApi'
import type { ExhibitListItem, Exposition } from '@/types/workflow'

const router = useRouter()

const isLoading = ref(false)
const exhibits = ref<ExhibitListItem[]>([])
const expositions = ref<Exposition[]>([])

const metrics = computed(() => {
  const draftCount = exhibits.value.filter((item) => item.currentStatus === 'draft').length
  const reviewCount = exhibits.value.filter((item) => item.currentStatus === 'on_review').length
  const approvedCount = exhibits.value.filter((item) => item.currentStatus === 'approved').length
  return [
    { label: 'Экспозиции в работе', value: expositions.value.length, trend: 'по всем залам' },
    { label: 'Экспонаты в черновике', value: draftCount, trend: `${reviewCount} на согласовании` },
    { label: 'Готово к публикации', value: approvedCount, trend: 'по текущему контуру' },
    { label: 'Системные инциденты', value: 2, trend: 'mock-наблюдаемость' },
  ]
})

const workflow = computed(() => [
  { name: 'Черновик', count: exhibits.value.filter((item) => item.currentStatus === 'draft').length },
  { name: 'На согласовании', count: exhibits.value.filter((item) => item.currentStatus === 'on_review').length },
  { name: 'Нужна доработка', count: exhibits.value.filter((item) => item.currentStatus === 'needs_revision').length },
  { name: 'Согласовано', count: exhibits.value.filter((item) => item.currentStatus === 'approved').length },
  { name: 'Опубликовано', count: exhibits.value.filter((item) => item.currentStatus === 'published').length },
])

const expositionProgress = computed(() => {
  return expositions.value.map((exposition) => {
    const related = exhibits.value.filter((item) => item.expositionTitle === exposition.title)
    const published = related.filter((item) => item.currentStatus === 'published').length
    const percent = related.length ? Math.round((published / related.length) * 100) : 0
    return { title: exposition.title, percent }
  })
})

const quickActions = [
  { label: 'Создать экспонат', route: '/admin/exhibits' },
  { label: 'Открыть очередь согласования', route: '/admin/review-queue' },
  { label: 'Запустить публикацию', route: '/admin/publish' },
  { label: 'Сделать выгрузку', route: '/admin/exports' },
]

const grafanaPanels = [
  { metric: 'workflow_versions_total{status}', desc: 'Распределение версий по статусам.' },
  { metric: 'review_cycle_seconds_bucket', desc: 'Длительность цикла от draft до approved.' },
  { metric: 'publish_jobs_total{status}', desc: 'Успех/ошибки публикационных задач.' },
  { metric: 'audit_events_total{action}', desc: 'Интенсивность действий в админке.' },
]

const goToExhibits = () => {
  router.push('/admin/exhibits')
}

const runQuickAction = (route: string) => {
  router.push(route)
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [exhibitData, expositionData] = await Promise.all([workflowApi.listExhibits(), workflowApi.listExpositions()])
    exhibits.value = exhibitData
    expositions.value = expositionData
  } finally {
    isLoading.value = false
  }
})
</script>
