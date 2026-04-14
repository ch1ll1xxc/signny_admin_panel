<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
      <div class="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur md:grid md:grid-cols-2">
      <section class="hidden border-r border-slate-200/70 bg-gradient-to-br from-slate-900 to-violet-900 p-10 text-slate-100 md:block">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200">Signny Admin</p>
        <h1 class="mt-6 text-4xl font-bold leading-tight">Панель управления</h1>
        <p class="mt-4 text-sm text-violet-100/90">
          Единая система модерации, публикации и синхронизации с публичным контуром.
        </p>

        <ul class="mt-8 space-y-3 text-sm">
          <li class="rounded-xl bg-white/10 px-4 py-3">Авторизация по email и паролю</li>
          <li class="rounded-xl bg-white/10 px-4 py-3">Полный цикл модерации и аудита</li>
          <li class="rounded-xl bg-white/10 px-4 py-3">Адаптивный интерфейс для любого устройства</li>
        </ul>
      </section>

      <section class="p-6 sm:p-8 md:p-10">
        <h2 class="text-2xl font-bold text-slate-900">Вход в систему</h2>
        <p class="mt-1 text-sm text-slate-600">Введите учётные данные для доступа к административной панели.</p>

        <el-form label-position="top" class="mt-6" @submit.prevent="handleLogin">
          <el-form-item label="Email">
            <el-input v-model="email" type="email" placeholder="user@museum.local" />
          </el-form-item>

          <el-form-item label="Пароль">
            <el-input v-model="password" type="password" show-password placeholder="Введите пароль" />
          </el-form-item>

          <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {{ errorMessage }}
          </div>

          <el-button type="primary" :loading="isLoading" class="w-full" native-type="submit">
            Войти
          </el-button>
        </el-form>

        <div class="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>&nbsp;</span>
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

// unused presets removed — server determines role from user account

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const { isLoading } = auth

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const resolveRedirect = (): string => {
  const redirect = route.query.redirect as string | undefined
  if (redirect && redirect.startsWith('/admin/')) {
    return redirect
  }
  return '/admin/dashboard'
}

const resetLocalSession = (): void => {
  auth.logout()
  errorMessage.value = 'Сессия сброшена. Войдите снова.'
}

const handleLogin = async () => {
  if (!email.value) {
    errorMessage.value = 'Введите email для продолжения.'
    return
  }
  if (!password.value) {
    errorMessage.value = 'Введите пароль.'
    return
  }

  errorMessage.value = ''

  try {
    // Role is determined by the server from the user's account, pass 'admin' as fallback
    // since auth.login requires a role param but the server ignores it for JWT mode
    await auth.login(email.value, 'admin' as UserRole, password.value)
    await router.replace(resolveRedirect())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка входа. Попробуйте снова.'
  }
}

onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated.value) {
    void router.replace('/admin/dashboard')
  }
})
</script>
