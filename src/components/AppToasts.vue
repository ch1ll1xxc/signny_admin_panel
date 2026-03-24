<template>
  <div class="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
    <article
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto rounded-md border px-3 py-2 text-sm shadow-sm"
      :class="toastClass[toast.type]"
    >
      <div class="flex items-start justify-between gap-2">
        <p>{{ toast.message }}</p>
        <button class="text-xs opacity-70 hover:opacity-100" @click="removeToast(toast.id)">x</button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClass = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-slate-200 bg-white text-slate-700',
}
</script>
