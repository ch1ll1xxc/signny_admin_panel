<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div class="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur md:grid md:grid-cols-2">
      <section class="hidden border-r border-slate-200/70 bg-gradient-to-br from-slate-900 to-cyan-900 p-10 text-slate-100 md:block">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">Signny Admin</p>
        <h1 class="mt-6 text-4xl font-bold leading-tight">Curation Control Deck</h1>
        <p class="mt-4 text-sm text-cyan-100/90">
          Unified panel for moderation workflow, publishing, and public contour sync.
        </p>

        <ul class="mt-8 space-y-3 text-sm">
          <li class="rounded-xl bg-white/10 px-4 py-3">Fast demo login with role presets</li>
          <li class="rounded-xl bg-white/10 px-4 py-3">Server-backed lifecycle and audit flow</li>
          <li class="rounded-xl bg-white/10 px-4 py-3">Responsive dashboard for desktop and laptop</li>
        </ul>
      </section>

      <section class="p-6 sm:p-8 md:p-10">
        <h2 class="text-2xl font-bold text-slate-900">Sign in</h2>
        <p class="mt-1 text-sm text-slate-600">Демо-режим: пароль не обязателен.</p>

        <div class="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
            @click="quickLogin('admin@museum.local', 'admin')"
          >
            Войти как админ
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50"
            @click="quickLogin('editor@museum.local', 'editor')"
          >
            Войти как редактор
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50"
            @click="quickLogin('curator@museum.local', 'curator')"
          >
            Войти как куратор
          </button>
        </div>

        <el-form label-position="top" class="mt-6" @submit.prevent="handleLogin">
          <el-form-item label="Email">
            <el-input v-model="email" type="email" placeholder="admin@museum.local" />
          </el-form-item>

          <el-form-item label="Пароль">
            <el-input v-model="password" type="password" show-password placeholder="Необязательно в демо" />
          </el-form-item>

          <el-form-item label="Роль">
            <el-select v-model="role" class="w-full">
              <el-option value="admin" label="Админ" />
              <el-option value="editor" label="Редактор" />
              <el-option value="curator" label="Куратор" />
              <el-option value="analyst" label="Аналитик" />
            </el-select>
          </el-form-item>

          <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {{ errorMessage }}
          </div>

          <el-button type="primary" :loading="auth.isLoading" class="w-full" native-type="submit">
            Открыть админку
          </el-button>
        </el-form>

        <div class="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Прямой вход: <code>/admin/login</code></span>
          <el-button text type="primary" @click="resetLocalSession">Сбросить сессию</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { UserRole } from '../../domain/auth'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const email = ref('admin@museum.local')
const password = ref('demo')
const role = ref<UserRole>('admin')
const errorMessage = ref('')

const presets: Array<{ email: string; role: UserRole }> = [
  { email: 'admin@museum.local', role: 'admin' },
  { email: 'editor@museum.local', role: 'editor' },
  { email: 'curator@museum.local', role: 'curator' },
  { email: 'analyst@museum.local', role: 'analyst' },
]

const applyPreset = (nextEmail: string, nextRole: UserRole): void => {
  email.value = nextEmail
  role.value = nextRole
  password.value = 'demo'
}

const resolveRedirect = (): string => {
  const redirect = route.query.redirect as string | undefined
  if (redirect && redirect.startsWith('/admin/')) {
    return redirect
  }
  return '/admin/dashboard'
}

const quickLogin = async (nextEmail: string, nextRole: UserRole): Promise<void> => {
  applyPreset(nextEmail, nextRole)
  await handleLogin()
}

const resetLocalSession = (): void => {
  auth.logout()
  errorMessage.value = 'Session cleared. Sign in again.'
}

const handleLogin = async () => {
  if (!email.value) {
    errorMessage.value = 'Fill email to continue.'
    return
  }

  errorMessage.value = ''

  try {
    await auth.login(email.value, role.value)
    await router.replace(resolveRedirect())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed. Try again.'
  }
}

onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated.value) {
    void router.replace('/admin/dashboard')
  }
})
</script>
