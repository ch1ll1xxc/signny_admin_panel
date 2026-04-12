<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
      <div class="absolute -right-12 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
    </div>

    <div class="relative z-10 max-w-md rounded-2xl border border-white/25 bg-white/90 p-6 shadow-2xl backdrop-blur">
      <h1 class="text-xl font-semibold text-slate-900">Доступ запрещен</h1>
      <p class="mt-2 text-sm text-slate-600">
        У вашей роли нет прав для этой страницы.
      </p>
      <router-link
        to="/admin/dashboard"
        class="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Вернуться в дашборд
      </router-link>
    </div>
  </div>
</template>
