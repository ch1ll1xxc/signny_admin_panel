import { computed, ref } from 'vue'
import { useAuthStore } from '../store/modules/auth'
import { useWorkflowStore } from '../store/modules/workflow'
import { usePublicationSync } from './usePublicationSync'

export const useReviewWorkflow = () => {
  const auth = useAuthStore()
  const workflow = useWorkflowStore()
  workflow.hydrateState()
  const publicationSync = usePublicationSync()
  const commentDraft = ref<Record<string, string>>({})

  const canModerate = computed(() => {
    const role = auth.user?.role
    return role === 'admin' || role === 'curator'
  })

  const approve = async (versionId: string): Promise<boolean> => {
    if (!auth.user) {
      return false
    }

    return workflow.approveVersion(
      versionId,
      auth.user.email,
      auth.user.role,
      commentDraft.value[versionId],
    )
  }

  const requestRevision = async (versionId: string): Promise<boolean> => {
    if (!auth.user) {
      return false
    }

    const comment = commentDraft.value[versionId] || 'Needs revision'
    return workflow.requestRevision(versionId, auth.user.email, auth.user.role, comment)
  }

  const publish = async (versionId: string): Promise<boolean> => {
    if (!auth.user) {
      return false
    }

    const published = await workflow.publishVersion(versionId, auth.user.email, auth.user.role)
    if (!published) {
      return false
    }

    return publicationSync.syncPublishedVersions()
  }

  return {
    pendingReview: workflow.pendingReview,
    allVersions: workflow.versions,
    canModerate,
    commentDraft,
    isSyncingPublication: publicationSync.isSyncing,
    syncError: publicationSync.syncError,
    syncInfo: publicationSync.syncInfo,
    approve,
    requestRevision,
    publish,
  }
}
