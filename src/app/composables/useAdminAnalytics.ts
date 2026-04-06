import { computed } from 'vue'
import { useWorkflowStore } from '../store/modules/workflow'

export const useAdminAnalytics = () => {
  const workflow = useWorkflowStore()

  const cards = computed(() => [
    {
      key: 'total',
      label: 'Tracked versions',
      value: workflow.metrics.total,
    },
    {
      key: 'review',
      label: 'On review',
      value: workflow.metrics.onReview,
    },
    {
      key: 'revision',
      label: 'Needs revision',
      value: workflow.metrics.needsRevision,
    },
    {
      key: 'published',
      label: 'Published',
      value: workflow.metrics.published,
    },
  ])

  const recentAudit = computed(() => workflow.auditEvents.slice(0, 5))

  return {
    cards,
    recentAudit,
  }
}
