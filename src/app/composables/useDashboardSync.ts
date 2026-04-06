import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../store/modules/auth'
import { useWorkflowStore } from '../store/modules/workflow'
import {
  buildPublicSyncPayload,
  pushPublicSync,
} from '../shared/integration/push-public-sync'
import {
  getPublicContourState,
  type PublicContourState,
} from '../shared/integration/public-contour'

export const useDashboardSync = () => {
  const auth = useAuthStore()
  const workflow = useWorkflowStore()

  const publicState = ref<PublicContourState | null>(null)
  const publicStateError = ref<string | null>(null)
  const syncMessage = ref<string | null>(null)
  const isSyncing = ref(false)

  const canSync = computed(() => auth.can('exhibits.write'))

  const loadPublicState = async (): Promise<void> => {
    try {
      publicState.value = await getPublicContourState()
      publicStateError.value = null
    } catch (error) {
      publicState.value = null
      publicStateError.value =
        error instanceof Error ? error.message : 'Failed to load public contour state'
    }
  }

  const syncPublicContour = async (): Promise<void> => {
    if (!canSync.value) {
      return
    }

    isSyncing.value = true
    syncMessage.value = null

    try {
      const payload = buildPublicSyncPayload(workflow.versions)
      await pushPublicSync(payload)
      syncMessage.value = 'Publication sync completed.'
      await loadPublicState()
    } catch (error) {
      syncMessage.value =
        error instanceof Error ? error.message : 'Failed to synchronize public contour.'
    } finally {
      isSyncing.value = false
    }
  }

  onMounted(() => {
    loadPublicState()
  })

  return {
    publicState,
    publicStateError,
    syncMessage,
    isSyncing,
    canSync,
    loadPublicState,
    syncPublicContour,
  }
}
