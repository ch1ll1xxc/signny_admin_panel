import { ref } from 'vue'
import { useWorkflowStore } from '../store/modules/workflow'
import { buildPublicSyncPayload, pushPublicSync } from '../shared/integration/push-public-sync'

export const usePublicationSync = () => {
  const workflow = useWorkflowStore()

  const isSyncing = ref(false)
  const syncError = ref<string | null>(null)
  const syncInfo = ref<string | null>(null)

  const syncPublishedVersions = async (): Promise<boolean> => {
    isSyncing.value = true
    syncError.value = null
    syncInfo.value = null

    try {
      const payload = buildPublicSyncPayload(workflow.versions)
      await pushPublicSync(payload)
      const count = payload.exhibits.length
      syncInfo.value = `Synced ${count} published exhibit${count === 1 ? '' : 's'} to public contour.`
      return true
    } catch (error) {
      syncError.value =
        error instanceof Error ? error.message : 'Failed to synchronize published snapshot.'
      return false
    } finally {
      isSyncing.value = false
    }
  }

  return {
    isSyncing,
    syncError,
    syncInfo,
    syncPublishedVersions,
  }
}
