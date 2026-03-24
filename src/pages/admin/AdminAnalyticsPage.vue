<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold">Аналитика</h2>
        <p class="text-sm text-slate-500">Пользовательские метрики и административная наблюдаемость</p>
      </div>
      <span class="rounded bg-slate-100 px-2 py-1 text-xs">Режим интеграции Grafana</span>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <article v-for="stat in stats" :key="stat.label" class="rounded-lg border border-slate-200 bg-white p-4">
        <p class="text-sm text-slate-500">{{ stat.label }}</p>
        <p class="mt-1 text-2xl font-semibold">{{ stat.value }}</p>
      </article>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Топ экспонатов за неделю</h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="item in topExhibits" :key="item.title" class="flex items-center justify-between">
            <span>{{ item.title }}</span>
            <span class="text-slate-500">{{ item.views }} просмотров</span>
          </li>
        </ul>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h3 class="text-base font-semibold">Динамика публикаций (7 дней)</h3>
        <div class="mt-4 flex h-40 items-end gap-2">
          <div v-for="bar in publishTrend" :key="bar.day" class="flex flex-1 flex-col items-center gap-1">
            <div class="w-full rounded-t bg-slate-800" :style="{ height: `${bar.value * 12}px` }"></div>
            <span class="text-[11px] text-slate-500">{{ bar.day }}</span>
          </div>
        </div>
      </article>
    </div>

    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-base font-semibold">Grafana-ready источники</h3>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="item in grafanaSources" :key="item.metric" class="flex items-center justify-between">
          <span class="font-medium">{{ item.metric }}</span>
          <span class="text-slate-500">{{ item.meaning }}</span>
        </li>
      </ul>
    </article>

    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-base font-semibold">Отказоустойчивость пайплайна</h3>
      <ul class="mt-3 space-y-2 text-sm">
        <li v-for="item in reliability" :key="item.label" class="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
          <span>{{ item.label }}</span>
          <span class="font-semibold" :class="item.ok ? 'text-emerald-700' : 'text-amber-700'">{{ item.value }}</span>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { label: 'Уникальные пользователи', value: '18 420' },
  { label: 'Средняя сессия', value: '6м 12с' },
  { label: 'Доля завершений', value: '72%' },
]

const topExhibits = [
  { title: 'Космические минералы', views: 4420 },
  { title: 'Рождение стекла', views: 3610 },
  { title: 'Лесные саундскейпы', views: 3185 },
]

const publishTrend = [
  { day: 'Пн', value: 3 },
  { day: 'Вт', value: 4 },
  { day: 'Ср', value: 2 },
  { day: 'Чт', value: 5 },
  { day: 'Пт', value: 4 },
  { day: 'Сб', value: 1 },
  { day: 'Вс', value: 2 },
]

const grafanaSources = [
  { metric: 'public_views_total{exhibit_id}', meaning: 'Просмотры контента пользователями' },
  { metric: 'workflow_transition_total{from,to}', meaning: 'Переходы между статусами' },
  { metric: 'publish_duration_seconds', meaning: 'Время публикационного контура' },
  { metric: 'audit_events_total{actor_role,action}', meaning: 'Служебная активность админки' },
]

const reliability = [
  { label: 'Успешные publish jobs (24ч)', value: '97.8%', ok: true },
  { label: 'Ошибки preprocess jobs (24ч)', value: '2.1%', ok: true },
  { label: 'Средний lag очереди review', value: '18 мин', ok: true },
  { label: 'Экспорт > 30 сек', value: '4 случая', ok: false },
]
</script>
