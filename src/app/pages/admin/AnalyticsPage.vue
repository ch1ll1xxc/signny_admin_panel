<template>
  <AdminLayout>
    <template #title>Analytics</template>

    <div class="space-y-5">
      <div class="grid gap-4 md:grid-cols-4">
        <article
          v-for="card in cards"
          :key="card.key"
          class="rounded-lg border border-gray-200 bg-white p-4"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ card.label }}</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ card.value }}</p>
        </article>
      </div>

      <section class="rounded-lg border border-gray-200 bg-white p-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Recent workflow activity</h3>
        <ul class="mt-3 space-y-2">
          <li
            v-for="event in recentAudit"
            :key="event.id"
            class="rounded-md border border-gray-100 px-3 py-2 text-sm"
          >
            <span class="font-medium text-gray-800">{{ event.action }}</span>
            by {{ event.actorEmail }} on {{ event.entity }}
            <span class="ml-2 text-xs text-gray-500">{{ event.createdAt }}</span>
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
