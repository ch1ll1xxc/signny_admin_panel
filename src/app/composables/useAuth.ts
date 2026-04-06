import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/modules/auth'

export const useAuth = () => {
  const store = useAuthStore()
  const refs = storeToRefs(store)

  return {
    ...refs,
    login: store.login,
    logout: store.logout,
    can: store.can,
    hydrate: store.hydrate,
  }
}
