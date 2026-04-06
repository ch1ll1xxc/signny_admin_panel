<template>
  <AdminLayout>
    <template #title>Dashboard</template>

    <div class="space-y-6">
      <h2 class="text-3xl font-bold text-gray-900">Welcome to the Admin Panel</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Total Exhibits</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">0</div>
          <p class="mt-2 text-xs text-gray-500">Exhibits in the system</p>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Pending Review</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">0</div>
          <p class="mt-2 text-xs text-gray-500">Awaiting curator approval</p>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Published</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">0</div>
          <p class="mt-2 text-xs text-gray-500">Live in public app</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="flex gap-4">
          <router-link
            to="/admin/exhibits"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            View Exhibits
          </router-link>
          <button
            :disabled="!canWrite"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Create Exhibit
          </button>
          <router-link
            v-if="auth.can('media.read')"
            to="/admin/media"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Media Library
          </router-link>
        </div>
      </div>

      <div class="text-sm text-gray-600 bg-gray-100 p-4 rounded-md">
        Active role: <strong>{{ auth.user?.role || 'unknown' }}</strong>
      </div>

      <div class="text-sm text-gray-500 bg-blue-50 p-4 rounded-md">
        <p><strong>Note:</strong> Vue Slice S2 introduces RBAC-aware navigation and actions. Content workflow pages will follow in next slices.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'

const auth = useAuth()
const canWrite = computed(() => auth.can('exhibits.write'))
</script>
