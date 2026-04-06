<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div class="absolute -bottom-28 -right-12 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
    </div>

    <div class="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-2">
      <section class="hidden bg-gradient-to-br from-cyan-500/30 to-indigo-600/20 p-10 text-slate-100 md:block">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">Signny Admin</p>
        <h1 class="mt-6 text-4xl font-bold leading-tight">Curation control room</h1>
        <p class="mt-4 text-sm text-slate-200/90">
          Manage exhibits, moderation workflow, and publication telemetry from a single admin contour.
        </p>

        <ul class="mt-8 space-y-3 text-sm text-slate-100/90">
          <li class="rounded-xl bg-white/10 px-4 py-3">Role-based access for admin, editor, curator, analyst</li>
          <li class="rounded-xl bg-white/10 px-4 py-3">Workflow transitions with audit records</li>
          <li class="rounded-xl bg-white/10 px-4 py-3">Public contour synchronization ready</li>
        </ul>
      </section>

      <section class="bg-white p-6 sm:p-8 md:p-10">
        <h2 class="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p class="mt-1 text-sm text-slate-500">Sign in to continue to the admin dashboard.</p>

        <form class="mt-7 space-y-5" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="admin@museum.local"
            />
          </div>

          <div>
            <label for="password" class="text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="Any password for demo"
            />
          </div>

          <div>
            <label for="role" class="text-sm font-medium text-slate-700">Role</label>
            <select
              id="role"
              v-model="role"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="curator">Curator</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>

          <div class="rounded-xl bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick role presets</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="preset in presets"
                :key="preset.email"
                type="button"
                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
                @click="applyPreset(preset.email, preset.role)"
              >
                {{ preset.role }}
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="auth.isLoading"
            class="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <span v-if="!auth.isLoading">Sign in</span>
            <span v-else>Signing in...</span>
          </button>
        </form>

        <div class="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Cannot get in? Open <code>/admin/login</code> or <code>/login</code>.</span>
          <button
            type="button"
            class="font-semibold text-cyan-700 hover:text-cyan-800"
            @click="resetLocalSession"
          >
            Reset session
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const resetLocalSession = (): void => {
  auth.logout()
  errorMessage.value = 'Session cleared. Sign in again.'
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Fill email and password to continue.'
    return
  }

  errorMessage.value = ''

  try {
    await auth.login(email.value, role.value)
    const redirect = route.query.redirect as string
    router.push(redirect || '/admin/dashboard')
  } catch {
    errorMessage.value = 'Login failed. Try again.'
  }
}
</script>
