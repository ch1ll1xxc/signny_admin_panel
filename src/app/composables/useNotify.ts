import { ElMessage } from 'element-plus'

export const useNotify = () => {
  const success = (text: string) => {
    ElMessage({ message: text, type: 'success', duration: 3000 })
  }

  const error = (text: string) => {
    ElMessage({ message: text, type: 'error', duration: 4000 })
  }

  const info = (text: string) => {
    ElMessage({ message: text, type: 'info', duration: 3000 })
  }

  const warning = (text: string) => {
    ElMessage({ message: text, type: 'warning', duration: 4000 })
  }

  return { success, error, info, warning }
}
