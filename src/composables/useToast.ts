import { readonly, ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  type: ToastType
  message: string
}

const toasts = ref<ToastItem[]>([])

const nextId = () => `toast-${Math.random().toString(36).slice(2, 8)}`

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

const pushToast = (type: ToastType, message: string) => {
  const id = nextId()
  toasts.value.push({ id, type, message })
  setTimeout(() => removeToast(id), 3000)
}

export const useToast = () => {
  return {
    toasts: readonly(toasts),
    pushToast,
    removeToast,
  }
}
