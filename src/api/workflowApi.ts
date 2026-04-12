import {
  getAllowedActions as getAllowedActionsMock,
  workflowApi as mockWorkflowApi,
} from '@/api/mockWorkflowApi'
import type {
  AdminFaqItem,
  AuditEvent,
  Exhibit,
  ExhibitListItem,
  Exposition,
  JobType,
  MediaAsset,
  QrCodeEntry,
  ReviewComment,
  Role,
  Version,
  VersionStatus,
  WorkflowAction,
  WorkflowJob,
} from '@/types/workflow'

const config = {
  baseUrl: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4100',
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
}

export class ApiError extends Error {
  code: string
  statusCode: number

  constructor(code: string, statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

function mapErrorResponse(statusCode: number, payload: unknown): ApiError {
  const data = payload as { error?: { code?: string; message?: string } }
  const message = data.error?.message ?? `HTTP ${statusCode}`

  if (statusCode === 401) {
    return new ApiError('unauthorized', 401, message)
  }
  if (statusCode === 403) {
    return new ApiError('forbidden', 403, message)
  }
  if (statusCode === 409) {
    return new ApiError('conflict', 409, message)
  }

  return new ApiError(data.error?.code ?? 'unknown_error', statusCode, message)
}

function resolveBearerRole(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const legacyRole = window.localStorage.getItem('museum-cms-role')
  if (legacyRole) {
    return legacyRole
  }

  const rawSessionUser = window.localStorage.getItem('session_user')
  if (rawSessionUser) {
    try {
      const parsed = JSON.parse(rawSessionUser) as { role?: string }
      if (parsed.role) {
        return parsed.role
      }
    } catch {
      // ignore malformed session user
    }
  }

  const legacyToken = window.localStorage.getItem('auth-token')
  if (legacyToken) {
    return legacyToken
  }

  return null
}

async function request<T>(method: 'GET' | 'POST' | 'PATCH', endpoint: string, body?: unknown): Promise<T> {
  const token = resolveBearerRole()
  const response = await fetch(`${config.baseUrl}/api/v1${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw mapErrorResponse(response.status, payload)
  }

  return payload as T
}

function roleLabel(role: Role): string {
  if (role === 'editor') return 'Редактор'
  if (role === 'curator') return 'Куратор'
  return 'Администратор'
}

function mapVersionStatus(status: string): VersionStatus {
  if (status === 'draft') return 'draft'
  if (status === 'on_review') return 'on_review'
  if (status === 'approved') return 'approved'
  if (status === 'published') return 'published'
  if (status === 'needs_revision') return 'needs_revision'
  return 'archived'
}

async function mapExhibitToListItem(exhibit: Exhibit): Promise<ExhibitListItem> {
  let currentStatus: VersionStatus = 'draft'
  let updatedAt = new Date().toISOString()

  try {
    const versions = await request<Version[]>('GET', `/exhibits/${exhibit.id}/versions`)
    const current = versions.find((item) => item.id === exhibit.currentVersionId) ?? versions[0]
    if (current) {
      currentStatus = mapVersionStatus(current.status)
      updatedAt = current.updatedAt
    }
  } catch {
    // keep fallback values
  }

  return {
    id: exhibit.id,
    title: exhibit.title,
    expositionTitle: exhibit.expositionId,
    owner: exhibit.owner,
    currentStatus,
    updatedAt,
  }
}

const fallbackExpositions: Exposition[] = [
  { id: 'exp-01', title: 'Истоки стекла', hall: 'Зал А' },
  { id: 'exp-02', title: 'Звуки леса', hall: 'Зал Б' },
  { id: 'exp-03', title: 'Слои окаменелостей', hall: 'Зал В' },
]

export const workflowApi = {
  async listExhibits(): Promise<ExhibitListItem[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listExhibits()
    }

    const exhibits = await request<Exhibit[]>('GET', '/exhibits')
    return Promise.all(exhibits.map((item) => mapExhibitToListItem(item)))
  },

  async createExhibit(title: string, role: Role): Promise<Exhibit> {
    if (config.useMockApi) {
      return mockWorkflowApi.createExhibit(title, role)
    }

    return request<Exhibit>('POST', '/exhibits', { title, owner: roleLabel(role) })
  },

  async getExhibitDetail(exhibitId: string): Promise<Exhibit> {
    if (config.useMockApi) {
      return mockWorkflowApi.getExhibitDetail(exhibitId)
    }

    return request<Exhibit>('GET', `/exhibits/${exhibitId}`)
  },

  async listExpositions(): Promise<Exposition[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listExpositions()
    }

    return fallbackExpositions
  },

  async listVersions(exhibitId: string): Promise<Version[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listVersions(exhibitId)
    }

    return request<Version[]>('GET', `/exhibits/${exhibitId}/versions`)
  },

  async listReviewComments(versionId: string): Promise<ReviewComment[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listReviewComments(versionId)
    }

    try {
      return await request<ReviewComment[]>('GET', `/versions/${versionId}/comments`)
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return []
      }
      throw error
    }
  },

  async addReviewComment(versionId: string, message: string, authorRole: Role): Promise<ReviewComment> {
    if (config.useMockApi) {
      return mockWorkflowApi.addReviewComment(versionId, message, authorRole)
    }

    return request<ReviewComment>('POST', `/versions/${versionId}/comments`, { message })
  },

  async transitionVersion(versionId: string, action: WorkflowAction, role: Role, message?: string): Promise<Version> {
    if (config.useMockApi) {
      return mockWorkflowApi.transitionVersion(versionId, action, role, message)
    }

    return request<Version>('POST', `/versions/${versionId}/transition`, { action, message })
  },

  async runJob(versionId: string, type: JobType, role: Role): Promise<WorkflowJob> {
    if (config.useMockApi) {
      return mockWorkflowApi.runJob(versionId, type, role)
    }

    return request<WorkflowJob>('POST', `/versions/${versionId}/jobs`, { type })
  },

  async publishApproved(role: Role): Promise<{ publishedCount: number; synced: boolean; syncMessage: string }> {
    if (config.useMockApi) {
      return mockWorkflowApi.publishApproved(role)
    }

    const result = await request<{
      publishedCount: number
      syncStatus: 'ok' | 'failed'
      syncMessage: string
    }>('POST', '/publish/approved', {})

    return {
      publishedCount: result.publishedCount,
      synced: result.syncStatus === 'ok',
      syncMessage: result.syncMessage,
    }
  },

  async publishPreflight(): Promise<{ canPublish: boolean; message: string; approvedCount: number }> {
    if (config.useMockApi) {
      const result = await mockWorkflowApi.runPreflightChecks()
      return {
        canPublish: result.approved > 0,
        approvedCount: result.approved,
        message: `onReview=${result.onReview}, draft=${result.draft}`,
      }
    }

    const result = await request<{ approved: number; onReview: number; draft: number; pendingSync: number }>(
      'POST',
      '/publish/preflight',
      {},
    )

    return {
      canPublish: result.approved > 0,
      approvedCount: result.approved,
      message: `onReview=${result.onReview}, draft=${result.draft}, pendingSync=${result.pendingSync}`,
    }
  },

  async listFaqItems(): Promise<AdminFaqItem[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listFaqItems()
    }

    return request<AdminFaqItem[]>('GET', '/faq')
  },

  async addFaqItem(input: { question: string; answer: string }, role: Role): Promise<AdminFaqItem> {
    if (config.useMockApi) {
      return mockWorkflowApi.addFaqItem(input, role)
    }

    return request<AdminFaqItem>('POST', '/faq', input)
  },

  async updateFaqItem(faqId: string, data: { question?: string; answer?: string; videoUrl?: string; subtitles?: string; isPublished?: boolean }, role: Role): Promise<AdminFaqItem> {
    if (config.useMockApi) {
      return mockWorkflowApi.updateFaqItem(faqId, data, role)
    }

    return request<AdminFaqItem>('PATCH', `/faq/${faqId}`, data)
  },

  async deleteFaqItem(faqId: string, role: Role): Promise<void> {
    if (config.useMockApi) {
      return mockWorkflowApi.deleteFaqItem(faqId, role)
    }

    await request<void>('POST', `/faq/${faqId}/delete`, {})
  },

  async updateExhibit(exhibitId: string, data: { title?: string; summary?: string; description?: string; imageUrl?: string }, role: Role): Promise<Exhibit> {
    if (config.useMockApi) {
      return mockWorkflowApi.updateExhibit(exhibitId, data, role)
    }

    return request<Exhibit>('PATCH', `/exhibits/${exhibitId}`, data)
  },

  async updateVersion(versionId: string, data: { sourceText?: string; adaptedText?: string }, role: Role): Promise<Version> {
    if (config.useMockApi) {
      return mockWorkflowApi.updateVersion(versionId, data, role)
    }

    return request<Version>('PATCH', `/versions/${versionId}`, data)
  },

  async runPreflightChecks(): Promise<{ approved: number; onReview: number; draft: number }> {
    if (config.useMockApi) {
      return mockWorkflowApi.runPreflightChecks()
    }

    return request<{ approved: number; onReview: number; draft: number }>('POST', '/publish/preflight', {})
  },

  async listAuditEvents(): Promise<AuditEvent[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listAuditEvents()
    }

    try {
      return await request<AuditEvent[]>('GET', '/audit')
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return []
      }
      throw error
    }
  },

  async listJobs(versionId?: string): Promise<WorkflowJob[]> {
    if (config.useMockApi) {
      return mockWorkflowApi.listJobs(versionId)
    }

    if (!versionId) {
      return []
    }

    try {
      return await request<WorkflowJob[]>('GET', `/versions/${versionId}/jobs`)
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return []
      }
      throw error
    }
  },

  async listMediaAssets(): Promise<MediaAsset[]> {
    if (config.useMockApi) {
      return []
    }

    return request<MediaAsset[]>('GET', '/media')
  },

  async uploadMedia(fileName: string, mimeType: string, url?: string): Promise<MediaAsset> {
    if (config.useMockApi) {
      return {
        id: `media-${Date.now()}`,
        fileName,
        mimeType,
        url: url ?? `https://cdn.local/${fileName}`,
        createdAt: new Date().toISOString(),
      }
    }

    return request<MediaAsset>('POST', '/media/upload', { fileName, mimeType, url })
  },

  async listQrCodes(): Promise<QrCodeEntry[]> {
    if (config.useMockApi) {
      return []
    }

    return request<QrCodeEntry[]>('GET', '/qr')
  },

  async generateQr(exhibitId: string): Promise<QrCodeEntry> {
    if (config.useMockApi) {
      return {
        id: `qr-${Date.now()}`,
        exhibitId,
        href: `/exh/${exhibitId}/tag?mode=ar&entry=qr`,
        createdAt: new Date().toISOString(),
      }
    }

    return request<QrCodeEntry>('POST', '/qr/generate', { exhibitId })
  },
}

export const getAllowedActions = getAllowedActionsMock
