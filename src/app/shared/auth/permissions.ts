import type { Permission, UserRole } from '../../domain/auth'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard.read',
    'exhibits.read',
    'exhibits.write',
    'media.read',
    'media.write',
    'halls.read',
    'halls.write',
    'audit.read',
  ],
  editor: [
    'dashboard.read',
    'exhibits.read',
    'exhibits.write',
    'media.read',
    'media.write',
  ],
  curator: ['dashboard.read', 'exhibits.read', 'media.read'],
  analyst: ['dashboard.read', 'exhibits.read', 'audit.read'],
}

export const getPermissionsForRole = (role: UserRole): Permission[] => ROLE_PERMISSIONS[role]

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role].includes(permission)
}
