import type { Permission } from '../domain/auth'
import { useAuthStore } from '../store/modules/auth'

export const usePermissions = () => {
  const auth = useAuthStore()

  const can = (permission: Permission): boolean => auth.can(permission)

  return {
    can,
  }
}
