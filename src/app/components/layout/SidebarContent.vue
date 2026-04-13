<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-slate-200 px-5 py-5">
      <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-600">Signny</p>
      <h1 class="mt-1 text-lg font-semibold text-slate-900">Админ-панель</h1>
    </div>

    <nav class="mt-2 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
        :class="route.path === item.to
          ? 'bg-violet-50 text-violet-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        @click="$emit('navigate')"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="route.path === item.to ? 'bg-violet-500' : 'bg-slate-300'" />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="border-t border-slate-100 px-4 py-4">
      <div class="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" :class="avatarClass">
          {{ initial }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-800">{{ email }}</p>
          <p class="text-xs" :class="labelClass">{{ label }}</p>
        </div>
      </div>
      <button
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        @click="$emit('logout')"
      >
        Выйти
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

defineEmits<{ navigate: []; logout: [] }>()

const props = defineProps<{
  navItems: ReadonlyArray<{ to: string; label: string }>
  email: string
  label: string
  initial: string
  avatarClass: string
  labelClass: string
}>()

const route = useRoute()
</script>
