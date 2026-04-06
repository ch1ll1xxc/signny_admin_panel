import { computed, ref } from 'vue'
import { useAuthStore } from '../store/modules/auth'
import { useWorkflowStore } from '../store/modules/workflow'

export const useReviewWorkflow = () => {
  const auth = useAuthStore()
  const workflow = useWorkflowStore()
  const commentDraft = ref<Record<string, string>>({})

  const canModerate = computed(() => {
    const role = auth.user?.role
    return role === 'admin' || role === 'curator'
  })

  const approve = (versionId: string): boolean => {
    if (!auth.user) {
      return false
    }

    return workflow.approveVersion(versionId, auth.user.email, commentDraft.value[versionId])
  }

  const requestRevision = (versionId: string): boolean => {
    if (!auth.user) {
      return false
    }

    const comment = commentDraft.value[versionId] || 'Needs revision'
    return workflow.requestRevision(versionId, auth.user.email, comment)
  }

  const publish = (versionId: string): boolean => {
    if (!auth.user) {
      return false
    }

    return workflow.publishVersion(versionId, auth.user.email)
  }

  return {
    pendingReview: workflow.pendingReview,
    allVersions: workflow.versions,
    canModerate,
    commentDraft,
    approve,
    requestRevision,
    publish,
  }
}
