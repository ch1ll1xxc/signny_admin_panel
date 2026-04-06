<template>
  <AdminLayout>
    <template #title>Audit journal</template>

    <div class="rounded-lg border border-gray-200 bg-white p-5">
      <h2 class="text-lg font-semibold text-gray-900">Audit events</h2>
      <p class="mt-2 text-sm text-gray-600">
        Audit table and filters are staged for S4 parity implementation.
      </p>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
</script>
