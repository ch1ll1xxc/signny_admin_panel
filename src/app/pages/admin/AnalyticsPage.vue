<template>
  <AdminLayout>
    <template #title>Аналитика</template>

    <div class="space-y-5">
      <div class="grid gap-4 md:grid-cols-4">
        <article
          v-for="card in cards"
          :key="card.key"
          class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ card.value }}</p>
        </article>
      </div>

      <section class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Последняя активность</h3>
        <ul class="mt-3 space-y-2">
          <li
            v-for="event in recentAudit"
            :key="event.id"
            class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-slate-800">{{ event.action }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="event.outcome === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ event.outcome === 'success' ? 'Успех' : 'Отклонено' }}
              </span>
            </div>
            <p class="mt-1 text-xs text-slate-500">{{ event.actorEmail }} · {{ event.entity }} · {{ new Date(event.createdAt).toLocaleString('ru') }}</p>
            <p v-if="event.note" class="mt-0.5 text-xs text-slate-400">{{ event.note }}</p>
          </li>
        </ul>
        <p v-if="!recentAudit.length" class="mt-3 text-sm text-slate-500">Нет недавних действий.</p>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAdminAnalytics } from '../../composables/useAdminAnalytics'

const { cards, recentAudit } = useAdminAnalytics()
</script>
