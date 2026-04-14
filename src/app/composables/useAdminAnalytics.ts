import { computed } from 'vue'
import { useWorkflowStore } from '../store/modules/workflow'

const actionLabelsRu: Record<string, string> = {
  submit_review: 'Отправка на согласование',
  submit_for_review: 'Отправка на согласование',
  approve: 'Согласование',
  request_revision: 'Возврат на доработку',
  return_to_draft: 'Возврат в черновик',
  publish: 'Публикация',
  archive: 'Архивирование',
  'publish.preflight': 'Предварительная проверка',
  'publish.approved': 'Публикация в контур',
  'publish.retry_sync': 'Повтор синхронизации',
  'version.transition': 'Смена статуса версии',
  'exhibit.create': 'Создание экспоната',
  'exhibit.update': 'Обновление экспоната',
  'version.update': 'Обновление версии',
  'faq.create': 'Добавление FAQ',
  'faq.update': 'Обновление FAQ',
  'faq.delete': 'Удаление FAQ',
  'job.completed': 'Задача завершена',
  'media.upload': 'Загрузка медиа',
  'qr.generate': 'Генерация QR-кода',
}

export const useAdminAnalytics = () => {
  const workflow = useWorkflowStore()
  workflow.hydrateState()

  const cards = computed(() => [
    {
      key: 'total',
      label: 'Всего версий',
      value: workflow.metrics.total,
    },
    {
      key: 'review',
      label: 'На согласовании',
      value: workflow.metrics.onReview,
    },
    {
      key: 'revision',
      label: 'Нужна доработка',
      value: workflow.metrics.needsRevision,
    },
    {
      key: 'published',
      label: 'Опубликовано',
      value: workflow.metrics.published,
    },
  ])

  const recentAudit = computed(() =>
    workflow.auditEvents.slice(0, 10).map((event) => ({
      ...event,
      action: actionLabelsRu[event.action] ?? event.action,
    })),
  )

  return {
    cards,
    recentAudit,
  }
}
