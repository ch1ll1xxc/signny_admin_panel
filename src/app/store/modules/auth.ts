import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthSession, AuthUser, Permission, UserRole } from '../../domain/auth'
import { clearSession, persistSession, readStoredSession } from '../../shared/auth/session'
import { getPermissionsForRole } from '../../shared/auth/permissions'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(null)
  const user = ref<AuthUser | null>(null)
  const permissions = ref<Permission[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(session.value && user.value))

  const hydrate = (): void => {
    const stored = readStoredSession()
    if (!stored) {
      return
    }

    session.value = stored.session
    user.value = stored.user
    permissions.value = getPermissionsForRole(stored.user.role)
  }

  const login = async (email: string, role: UserRole): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const nextUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        role,
      }

      const nextSession: AuthSession = {
        token: `token_${Date.now()}`,
        expiresAtIso: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      }

      user.value = nextUser
      session.value = nextSession
      permissions.value = getPermissionsForRole(role)
      persistSession(nextSession, nextUser)
    } finally {
      isLoading.value = false
    }
  }

  const logout = (): void => {
    clearSession()
    session.value = null
    user.value = null
    permissions.value = []
    error.value = null
  }

  const can = (permission: Permission): boolean => permissions.value.includes(permission)

  return {
    session,
    user,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    hydrate,
    login,
    logout,
    can,
  }
})
