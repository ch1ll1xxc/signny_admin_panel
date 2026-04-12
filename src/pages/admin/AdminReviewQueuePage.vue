<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-2xl font-semibold">Очередь согласования</h2>
      <p class="text-sm text-slate-500">Материалы, ожидающие решения куратора</p>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <article v-for="bucket in buckets" :key="bucket.label" class="rounded-lg border border-slate-200 bg-white p-4">
        <p class="text-sm text-slate-500">{{ bucket.label }}</p>
        <p class="mt-1 text-2xl font-semibold">{{ bucket.count }}</p>
      </article>
    </div>

    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-base font-semibold">Next items</h3>
      <ul class="mt-3 space-y-3 text-sm">
        <li v-for="item in queue" :key="item.id" class="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
          <div>
            <p class="font-medium">{{ item.title }}</p>
            <p class="text-slate-500">{{ item.reason }}</p>
          </div>
          <RouterLink :to="`/exhibit/${item.id}`" class="rounded-md border border-slate-300 px-3 py-1.5">Открыть</RouterLink>
        </li>
      </ul>
      <p v-if="!queue.length" class="mt-3 text-sm text-slate-500">Очередь согласования пуста.</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { workflowApi } from '@/api/workflowApi'
import type { ExhibitListItem } from '@/types/workflow'

const exhibits = ref<ExhibitListItem[]>([])

const buckets = computed(() => {
  const waiting = exhibits.value.filter((item) => item.currentStatus === 'on_review').length
  const needsRevision = exhibits.value.filter((item) => item.currentStatus === 'needs_revision').length
  const ready = exhibits.value.filter((item) => item.currentStatus === 'approved').length
  return [
    { label: 'На согласовании', count: waiting },
    { label: 'Нужна доработка', count: needsRevision },
    { label: 'Готово к публикации', count: ready },
  ]
})

const queue = computed(() => {
  return exhibits.value
    .filter((item) => item.currentStatus === 'on_review' || item.currentStatus === 'needs_revision')
    .map((item) => ({
      id: item.id,
      title: item.title,
      reason: item.currentStatus === 'on_review' ? 'Ожидает решения куратора' : 'Возвращен на редакторскую доработку',
    }))
})

onMounted(async () => {
  exhibits.value = await workflowApi.listExhibits()
})
</script>
