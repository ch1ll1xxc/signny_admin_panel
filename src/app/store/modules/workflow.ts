import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { workflowApi } from '@/api/workflowApi'
import type { AdminAuditEvent, ContentLifecycleStatus, ReviewVersion } from '../../domain/workflow'
import type { AuditEvent, VersionStatus } from '@/types/workflow'

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
    exhibitTitle: 'Рождение стекла',
    status: 'on_review',
    submitterEmail: 'editor@museum.local',
    submittedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'ver-002',
    exhibitTitle: 'Лесные саундскейпы',
    status: 'approved',
    submitterEmail: 'editor@museum.local',
    submittedAt: '2026-04-04T08:00:00Z',
    reviewerEmail: 'curator@museum.local',
    reviewerComment: 'Нарративная последовательность одобрена.',
  },
  {
    id: 'ver-003',
    exhibitTitle: 'Слои окаменелостей',
    status: 'needs_revision',
    submitterEmail: 'editor@museum.local',
    submittedAt: '2026-04-03T09:00:00Z',
    reviewerEmail: 'curator@museum.local',
    reviewerComment: 'Требуется корректировка таймингов субтитров.',
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
    note: 'Отправлено на согласование куратору',
  },
  {
    id: 'audit-002',
    actorEmail: 'curator@museum.local',
    action: 'approve',
    entity: 'ver-002',
    outcome: 'success',
    createdAt: '2026-04-04T08:20:00Z',
    note: 'Нарративная последовательность одобрена',
  },
  {
    id: 'audit-003',
    actorEmail: 'curator@museum.local',
    action: 'request_revision',
    entity: 'ver-003',
    outcome: 'success',
    createdAt: '2026-04-03T09:30:00Z',
    note: 'Требуется корректировка таймингов субтитров',
  },
  {
    id: 'audit-004',
    actorEmail: 'admin@museum.local',
    action: 'publish',
    entity: 'ver-002',
    outcome: 'success',
    createdAt: '2026-04-04T12:00:00Z',
    note: 'Опубликовано в публичный контур',
  },
  {
    id: 'audit-005',
    actorEmail: 'editor@museum.local',
    action: 'submit_review',
    entity: 'ver-003',
    outcome: 'rejected',
    createdAt: '2026-04-02T14:15:00Z',
    note: 'Автоматическая проверка: отсутствует адаптированный текст',
  },
]

function mapVersionStatusToLifecycle(status: VersionStatus): ContentLifecycleStatus {
  if (status === 'draft') return 'draft'
  if (status === 'on_review') return 'on_review'
  if (status === 'approved') return 'approved'
  if (status === 'published') return 'published'
  if (status === 'needs_revision') return 'needs_revision'
  return 'archived'
}

function mapAuditEvent(event: AuditEvent): AdminAuditEvent {
  return {
    id: event.id,
    actorEmail: `${event.actorRole}@museum.local`,
    action: event.action.includes('approve')
      ? 'approve'
      : event.action.includes('request')
        ? 'request_revision'
        : event.action.includes('publish')
          ? 'publish'
          : 'submit_review',
    entity: event.details,
    outcome: 'success',
    createdAt: event.createdAt,
    note: event.details,
  }
}

function toRole(input: string): 'editor' | 'curator' | 'admin' {
  if (input === 'admin' || input === 'curator' || input === 'editor') {
    return input
  }
  return 'editor'
}

function actionForTransition(nextStatus: ContentLifecycleStatus): 'approve' | 'request_revision' | 'publish' {
  if (nextStatus === 'approved') return 'approve'
  if (nextStatus === 'needs_revision') return 'request_revision'
  return 'publish'
}

export const useWorkflowStore = defineStore('workflow', () => {
  const versions = ref<ReviewVersion[]>(seededVersions)
  const auditEvents = ref<AdminAuditEvent[]>(seededAudit)
  const isHydrated = ref(false)

  const persistState = (): void => {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(versions.value))
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditEvents.value))
  }

  const syncFromApi = async (): Promise<void> => {
    const exhibits = await workflowApi.listExhibits()
    const normalizedVersions = await Promise.all(
      exhibits.map(async (item) => {
        const exhibitVersions = await workflowApi.listVersions(item.id)
        const latest = [...exhibitVersions].sort((a, b) => b.number - a.number)[0]
        if (!latest) {
          return null
        }
        return {
          id: latest.id,
          exhibitTitle: item.title,
          status: mapVersionStatusToLifecycle(latest.status),
          submitterEmail: `${item.owner}@museum.local`,
          submittedAt: latest.updatedAt,
        } as ReviewVersion
      }),
    )

    const remoteAudit = await workflowApi.listAuditEvents()
    versions.value = normalizedVersions.filter((item): item is ReviewVersion => Boolean(item))
    auditEvents.value = remoteAudit.map(mapAuditEvent)
    persistState()
  }

  const hydrateState = (): void => {
    if (!isHydrated.value) {
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

      isHydrated.value = true
    }

    // Always sync from API to pick up fresh data (publish, transitions, etc.)
    void syncFromApi().catch(() => {
      // keep local fallback state when backend is unavailable
    })
  }

  const pendingReview = computed(() =>
    versions.value.filter((version) => version.status === 'on_review'),
  )

  const metrics = computed(() => {
    const total = versions.value.length
    const draft = versions.value.filter((version) => version.status === 'draft').length
    const onReview = versions.value.filter((version) => version.status === 'on_review').length
    const approved = versions.value.filter((version) => version.status === 'approved').length
    const published = versions.value.filter((version) => version.status === 'published').length
    const needsRevision = versions.value.filter(
      (version) => version.status === 'needs_revision',
    ).length
    const archived = versions.value.filter((version) => version.status === 'archived').length

    return { total, draft, onReview, approved, published, needsRevision, archived }
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

  const transitionVersion = async (
    versionId: string,
    nextStatus: ContentLifecycleStatus,
    actorEmail: string,
    actorRole: string,
    action: AdminAuditEvent['action'],
    comment?: string,
  ): Promise<boolean> => {
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

    try {
      await workflowApi.transitionVersion(
        version.id,
        actionForTransition(nextStatus),
        toRole(actorRole),
        comment,
      )
      version.status = nextStatus
      version.reviewerEmail = actorEmail
      version.reviewerComment = comment
      appendAuditEvent(actorEmail, action, version.id, 'success', comment)
      persistState()
      return true
    } catch {
      appendAuditEvent(actorEmail, action, version.id, 'rejected', 'Transition request failed')
      return false
    }
  }

  const approveVersion = async (
    versionId: string,
    actorEmail: string,
    actorRole: string,
    comment?: string,
  ): Promise<boolean> => {
    return transitionVersion(versionId, 'approved', actorEmail, actorRole, 'approve', comment)
  }

  const requestRevision = async (
    versionId: string,
    actorEmail: string,
    actorRole: string,
    comment: string,
  ): Promise<boolean> => {
    return transitionVersion(versionId, 'needs_revision', actorEmail, actorRole, 'request_revision', comment)
  }

  const publishVersion = async (
    versionId: string,
    actorEmail: string,
    actorRole: string,
  ): Promise<boolean> => {
    return transitionVersion(versionId, 'published', actorEmail, actorRole, 'publish')
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
