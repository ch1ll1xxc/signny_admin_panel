import { computed, ref } from 'vue'
import { useWorkflowStore } from '../store/modules/workflow'

export const useAuditJournal = () => {
  const workflow = useWorkflowStore()
  const actorFilter = ref('all')
  const outcomeFilter = ref<'all' | 'success' | 'rejected'>('all')

  const actors = computed(() => {
    const unique = new Set(workflow.auditEvents.map((event) => event.actorEmail))
    return Array.from(unique)
  })

  const filteredEvents = computed(() => {
    return workflow.auditEvents.filter((event) => {
      const byActor = actorFilter.value === 'all' || event.actorEmail === actorFilter.value
      const byOutcome = outcomeFilter.value === 'all' || event.outcome === outcomeFilter.value
      return byActor && byOutcome
    })
  })

  return {
    actorFilter,
    outcomeFilter,
    actors,
    filteredEvents,
  }
}
