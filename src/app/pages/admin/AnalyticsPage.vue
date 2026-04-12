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
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Последняя активность workflow</h3>
        <ul class="mt-3 space-y-2">
          <li
            v-for="event in recentAudit"
            :key="event.id"
            class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm"
          >
            <span class="font-medium text-slate-800">{{ event.action }}</span>
            — {{ event.actorEmail }}, объект: {{ event.entity }}
            <span class="ml-2 text-xs text-slate-500">{{ event.createdAt }}</span>
          </li>
        </ul>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAdminAnalytics } from '../../composables/useAdminAnalytics'

const { cards, recentAudit } = useAdminAnalytics()
</script>
