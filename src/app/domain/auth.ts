export type UserRole = 'admin' | 'editor' | 'curator' | 'analyst'

export type Permission =
  | 'dashboard.read'
  | 'exhibits.read'
  | 'exhibits.write'
  | 'media.read'
  | 'media.write'
  | 'halls.read'
  | 'halls.write'
  | 'audit.read'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface AuthSession {
  token: string
  expiresAtIso: string
}
