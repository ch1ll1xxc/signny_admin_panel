import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { resolveAdminApiBaseUrl } from '@/api/adminApiBaseUrl'
import type { AuthSession, AuthUser, Permission, UserRole } from '../../domain/auth'
import { clearSession, persistSession, readStoredSession } from '../../shared/auth/session'
import { getPermissionsForRole } from '../../shared/auth/permissions'

const API_BASE = resolveAdminApiBaseUrl({ envBaseUrl: import.meta.env.VITE_ADMIN_API_URL })
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

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

  const login = async (email: string, role: UserRole, password?: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      let nextUser: AuthUser
      let nextSession: AuthSession

      if (USE_MOCK) {
        nextUser = { id: `user_${Date.now()}`, email, role }
        nextSession = {
          token: role,
          expiresAtIso: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        }
      } else {
        // In real mode, the role comes from the server — ignore the 'role' parameter
        const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: password ?? role }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
          throw new Error(body.error?.message ?? `Login failed (${res.status})`)
        }

        const data = await res.json() as { token: string; user: { id: string; email: string; role: string } }
        nextUser = { id: data.user.id, email: data.user.email, role: data.user.role as UserRole }
        nextSession = {
          token: data.token,
          expiresAtIso: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        }
      }

      user.value = nextUser
      session.value = nextSession
      permissions.value = getPermissionsForRole(nextUser.role)
      persistSession(nextSession, nextUser)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
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
