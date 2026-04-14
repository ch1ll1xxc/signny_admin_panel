import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Role } from '@/types/workflow'

const ROLES: Role[] = ['editor', 'curator', 'admin', 'analyst']
const STORAGE_KEY = 'museum-cms-role'

const resolveInitialRole = (): Role => {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw && ROLES.includes(raw as Role) ? (raw as Role) : 'editor'
}

export const useAuthStore = defineStore('auth', () => {
  const role = ref<Role>(resolveInitialRole())

  watch(role, (nextRole) => {
    localStorage.setItem(STORAGE_KEY, nextRole)
  })

  const isAdmin = computed(() => role.value === 'admin')

  const setRole = (nextRole: Role) => {
    role.value = nextRole
  }

  return {
    role,
    isAdmin,
    setRole,
  }
})
