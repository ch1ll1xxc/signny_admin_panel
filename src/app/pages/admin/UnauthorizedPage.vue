<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md rounded-xl border border-red-100 bg-white p-6 shadow">
      <h1 class="text-xl font-semibold text-gray-900">Access denied</h1>
      <p class="mt-2 text-sm text-gray-600">
        Your role does not have permission for this page.
      </p>
      <router-link
        to="/admin/dashboard"
        class="mt-4 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to dashboard
      </router-link>
    </div>
  </div>
</template>
