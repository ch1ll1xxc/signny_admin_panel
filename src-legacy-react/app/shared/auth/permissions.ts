import { UserRole } from '../../domain/contracts';

export type Permission =
  | 'dashboard.read'
  | 'exhibits.read'
  | 'exhibits.write'
  | 'media.read'
  | 'media.write'
  | 'halls.read'
  | 'halls.write'
  | 'audit.read';

const rolePermissions: Record<UserRole, Permission[]> = {
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
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}
