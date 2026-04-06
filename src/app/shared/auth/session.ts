import type { AuthSession, AuthUser } from '../../domain/auth'

const STORAGE_KEYS = {
  token: 'session_token',
  user: 'session_user',
} as const

export const readStoredSession = (): { session: AuthSession; user: AuthUser } | null => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  const rawUser = localStorage.getItem(STORAGE_KEYS.user)

  if (!token || !rawUser) {
    return null
  }

  let user: AuthUser

  try {
    user = JSON.parse(rawUser) as AuthUser
  } catch {
    clearSession()
    return null
  }
  const session: AuthSession = {
    token,
    expiresAtIso: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  }

  return { session, user }
}

export const persistSession = (session: AuthSession, user: AuthUser): void => {
  localStorage.setItem(STORAGE_KEYS.token, session.token)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.user)
}
