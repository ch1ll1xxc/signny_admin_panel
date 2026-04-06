import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdminAuditEvent, ContentLifecycleStatus, ReviewVersion } from '../../domain/workflow'

const WORKFLOW_STORAGE_KEY = 'admin_workflow_versions'
const AUDIT_STORAGE_KEY = 'admin_workflow_audit'

const transitionMap: Record<ContentLifecycleStatus, ContentLifecycleStatus[]> = {
  draft: ['on_review'],
  on_review: ['approved', 'needs_revision'],
  approved: ['published'],
  published: ['archived', 'needs_revision'],
  needs_revision: ['draft'],
  archived: [],
}

const seededVersions: ReviewVersion[] = [
  {
    id: 'ver-001',
    exhibitTitle: 'Ancient pottery of Neolithic era',
    status: 'on_review',
    submitterEmail: 'editor@museum.local',
    submittedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'ver-002',
    exhibitTitle: 'Medieval manuscripts',
    status: 'approved',
    submitterEmail: 'editor@museum.local',
    submittedAt: '2026-04-04T08:00:00Z',
    reviewerEmail: 'curator@museum.local',
    reviewerComment: 'Narrative sequence is approved.',
  },
  {
    id: 'ver-003',
    exhibitTitle: '17th century coin collection',
    status: 'needs_revision',
    submitterEmail: 'editor@museum.local',
    submittedAt: '2026-04-03T09:00:00Z',
    reviewerEmail: 'curator@museum.local',
    reviewerComment: 'Need clearer subtitles timing.',
  },
]

const seededAudit: AdminAuditEvent[] = [
  {
    id: 'audit-001',
    actorEmail: 'editor@museum.local',
    action: 'submit_review',
    entity: 'ver-001',
    outcome: 'success',
    createdAt: '2026-04-05T10:01:00Z',
  },
  {
    id: 'audit-002',
    actorEmail: 'curator@museum.local',
    action: 'approve',
    entity: 'ver-002',
    outcome: 'success',
    createdAt: '2026-04-04T08:20:00Z',
  },
]

export const useWorkflowStore = defineStore('workflow', () => {
  const versions = ref<ReviewVersion[]>(seededVersions)
  const auditEvents = ref<AdminAuditEvent[]>(seededAudit)

  const persistState = (): void => {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(versions.value))
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditEvents.value))
  }

  const hydrateState = (): void => {
    const rawVersions = localStorage.getItem(WORKFLOW_STORAGE_KEY)
    const rawAudit = localStorage.getItem(AUDIT_STORAGE_KEY)

    if (rawVersions) {
      try {
        versions.value = JSON.parse(rawVersions) as ReviewVersion[]
      } catch {
        versions.value = seededVersions
      }
    }

    if (rawAudit) {
      try {
        auditEvents.value = JSON.parse(rawAudit) as AdminAuditEvent[]
      } catch {
        auditEvents.value = seededAudit
      }
    }
  }

  const pendingReview = computed(() =>
    versions.value.filter((version) => version.status === 'on_review'),
  )

  const metrics = computed(() => {
    const total = versions.value.length
    const published = versions.value.filter((version) => version.status === 'published').length
    const onReview = versions.value.filter((version) => version.status === 'on_review').length
    const needsRevision = versions.value.filter(
      (version) => version.status === 'needs_revision',
    ).length

    return { total, published, onReview, needsRevision }
  })

  const appendAuditEvent = (
    actorEmail: string,
    action: AdminAuditEvent['action'],
    entity: string,
    outcome: AdminAuditEvent['outcome'],
    note?: string,
  ): void => {
    auditEvents.value.unshift({
      id: `audit-${Date.now()}`,
      actorEmail,
      action,
      entity,
      outcome,
      note,
      createdAt: new Date().toISOString(),
    })
    persistState()
  }

  const transitionVersion = (
    versionId: string,
    nextStatus: ContentLifecycleStatus,
    actorEmail: string,
    action: AdminAuditEvent['action'],
    comment?: string,
  ): boolean => {
    const version = versions.value.find((item) => item.id === versionId)
    if (!version) {
      appendAuditEvent(actorEmail, action, versionId, 'rejected', 'Version not found')
      return false
    }

    const allowed = transitionMap[version.status]
    if (!allowed.includes(nextStatus)) {
      appendAuditEvent(actorEmail, action, version.id, 'rejected', 'Invalid transition')
      return false
    }

    version.status = nextStatus
    version.reviewerEmail = actorEmail
    version.reviewerComment = comment
    appendAuditEvent(actorEmail, action, version.id, 'success', comment)
    persistState()
    return true
  }

  const approveVersion = (versionId: string, actorEmail: string, comment?: string): boolean => {
    return transitionVersion(versionId, 'approved', actorEmail, 'approve', comment)
  }

  const requestRevision = (
    versionId: string,
    actorEmail: string,
    comment: string,
  ): boolean => {
    return transitionVersion(versionId, 'needs_revision', actorEmail, 'request_revision', comment)
  }

  const publishVersion = (versionId: string, actorEmail: string): boolean => {
    return transitionVersion(versionId, 'published', actorEmail, 'publish')
  }

  return {
    versions,
    pendingReview,
    auditEvents,
    metrics,
    hydrateState,
    approveVersion,
    requestRevision,
    publishVersion,
  }
})
