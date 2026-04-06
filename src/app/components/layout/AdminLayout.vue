<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-900">Museum Admin</h1>
      </div>
      <nav class="mt-6">
        <router-link
          to="/admin/dashboard"
          class="block px-6 py-2 text-gray-700 hover:bg-gray-100"
          active-class="bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="auth.can('exhibits.read')"
          to="/admin/exhibits"
          class="block px-6 py-2 text-gray-700 hover:bg-gray-100"
          active-class="bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        >
          Exhibits
        </router-link>
        <button
          @click="handleLogout"
          class="w-full text-left px-6 py-2 text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="bg-white shadow">
        <div class="px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900">
            <slot name="title">Page</slot>
          </h2>
          <div class="text-sm text-gray-500">
            <slot name="user-info">
              {{ auth.user?.email || 'Admin User' }}
            </slot>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const handleLogout = () => {
  auth.logout()
  router.push('/admin/login')
}
</script>
