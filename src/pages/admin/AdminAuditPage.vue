<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between gap-3">
      <div>
      <h2 class="text-2xl font-semibold">Журнал аудита</h2>
      <p class="text-sm text-slate-500">История действий редакционного и публикационного контуров</p>
      </div>
      <button class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" :disabled="isRefreshing" @click="refresh">
        {{ isRefreshing ? 'Обновляем...' : 'Обновить' }}
      </button>
    </header>

    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <ul class="space-y-3 text-sm">
        <li v-for="event in events" :key="event.id" class="grid gap-1 border-b border-slate-100 pb-3 last:border-0">
          <div class="flex items-center justify-between">
            <p class="font-medium">{{ event.action }}</p>
            <span class="text-xs text-slate-500">{{ formatTime(event.createdAt) }}</span>
          </div>
          <p class="text-slate-600">{{ event.details }}</p>
          <p class="text-xs text-slate-500">Роль: {{ roleLabel(event.actorRole) }}</p>
        </li>
      </ul>
      <p v-if="!events.length" class="mt-3 text-sm text-slate-500">Пока нет событий аудита. Выполните действия в системе, чтобы увидеть трассу.</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { workflowApi } from '@/api/workflowApi'
import { useToast } from '@/composables/useToast'
import type { AuditEvent, Role } from '@/types/workflow'

const events = ref<AuditEvent[]>([])
const isRefreshing = ref(false)
const { pushToast } = useToast()

const formatTime = (isoDate: string) => new Date(isoDate).toLocaleString()

const roleLabel = (role: Role) => {
  if (role === 'editor') return 'Редактор'
  if (role === 'curator') return 'Куратор'
  return 'Администратор'
}

const refresh = async () => {
  isRefreshing.value = true
  try {
    events.value = await workflowApi.listAuditEvents()
    pushToast('info', 'Журнал аудита обновлен')
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  await refresh()
})
</script>
