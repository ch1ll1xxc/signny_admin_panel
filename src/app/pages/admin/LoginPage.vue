<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="text-center text-4xl font-bold text-gray-900">Museum Admin</h1>
        <h2 class="mt-6 text-center text-2xl font-semibold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label for="role" class="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            v-model="role"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="curator">Curator</option>
            <option value="analyst">Analyst</option>
          </select>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
        </div>

        <button
          type="submit"
          :disabled="auth.isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="!auth.isLoading">Sign in</span>
          <span v-else>Signing in...</span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-600">
        Demo: any email/password will work for this scaffold
      </p>
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

const email = ref('')
const password = ref('')
const role = ref<UserRole>('editor')
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  errorMessage.value = ''

  try {
    await auth.login(email.value, role.value)

    const redirect = route.query.redirect as string
    router.push(redirect || '/admin/dashboard')
  } catch {
    errorMessage.value = 'Login failed. Please try again.'
  }
}
</script>
