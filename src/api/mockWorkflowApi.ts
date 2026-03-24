import type {
  AuditEvent,
  Exhibit,
  ExhibitListItem,
  Exposition,
  JobType,
  ReviewComment,
  Role,
  Version,
  VersionStatus,
  WorkflowAction,
  WorkflowJob,
} from '@/types/workflow'

interface TransitionRule {
  from: VersionStatus[]
  to: VersionStatus
  roles: Role[]
}

const transitionRules: Record<WorkflowAction, TransitionRule> = {
  submit_for_review: {
    from: ['draft'],
    to: 'on_review',
    roles: ['editor', 'admin'],
  },
  approve: {
    from: ['on_review'],
    to: 'approved',
    roles: ['curator', 'admin'],
  },
  request_revision: {
    from: ['on_review'],
    to: 'needs_revision',
    roles: ['curator', 'admin'],
  },
  return_to_draft: {
    from: ['needs_revision'],
    to: 'draft',
    roles: ['editor', 'admin'],
  },
  publish: {
    from: ['approved'],
    to: 'published',
    roles: ['admin'],
  },
  archive: {
    from: ['published'],
    to: 'archived',
    roles: ['admin'],
  },
}

const expositions: Exposition[] = [
  { id: 'exp-01', title: 'Истоки стекла', hall: 'Зал А' },
  { id: 'exp-02', title: 'Звуки леса', hall: 'Зал Б' },
  { id: 'exp-03', title: 'Слои окаменелостей', hall: 'Зал В' },
]

const exhibits: Exhibit[] = [
  {
    id: 'x-101',
    title: 'Рождение стекла',
    owner: 'М. Иванов',
    summary: 'Коллекция о происхождении стеклоделия и реставрационных находках.',
    expositionId: 'exp-01',
    currentVersionId: 'v-101-2',
  },
  {
    id: 'x-102',
    title: 'Лесные саундскейпы',
    owner: 'А. Петрова',
    summary: 'Иммерсивный экспонат с полевыми записями и картами маршрутов.',
    expositionId: 'exp-02',
    currentVersionId: 'v-102-3',
  },
  {
    id: 'x-103',
    title: 'Слои окаменелостей',
    owner: 'Д. Смирнов',
    summary: 'Маршрут по стратиграфии с интерактивными образцами.',
    expositionId: 'exp-03',
    currentVersionId: 'v-103-1',
  },
]

const versions: Version[] = [
  { id: 'v-101-2', exhibitId: 'x-101', number: 2, status: 'on_review', updatedAt: new Date().toISOString() },
  { id: 'v-102-3', exhibitId: 'x-102', number: 3, status: 'draft', updatedAt: new Date().toISOString() },
  { id: 'v-103-1', exhibitId: 'x-103', number: 1, status: 'approved', updatedAt: new Date().toISOString() },
]

const reviewComments: ReviewComment[] = [
  {
    id: 'c-1',
    versionId: 'v-101-2',
    authorRole: 'curator',
    message: 'Please verify historical attribution in section 2.',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
]

const jobs: WorkflowJob[] = []
const auditEvents: AuditEvent[] = []

const delay = async (ms = 180): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T

const roleLabel = (role: Role): string => {
  if (role === 'editor') return 'Редактор'
  if (role === 'curator') return 'Куратор'
  return 'Администратор'
}

const getVersionById = (versionId: string): Version => {
  const version = versions.find((item) => item.id === versionId)
  if (!version) {
    throw new Error('Версия не найдена')
  }
  return version
}

const getExhibitById = (exhibitId: string): Exhibit => {
  const exhibit = exhibits.find((item) => item.id === exhibitId)
  if (!exhibit) {
    throw new Error('Экспонат не найден')
  }
  return exhibit
}

const getExpositionById = (expositionId: string): Exposition => {
  const exposition = expositions.find((item) => item.id === expositionId)
  if (!exposition) {
    throw new Error('Экспозиция не найдена')
  }
  return exposition
}

const bumpVersionTimestamp = (version: Version) => {
  version.updatedAt = new Date().toISOString()
}

const setExhibitCurrentVersion = (version: Version) => {
  const exhibit = getExhibitById(version.exhibitId)
  exhibit.currentVersionId = version.id
}

const nextId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

const pushAuditEvent = (action: string, details: string, actorRole: Role) => {
  auditEvents.unshift({
    id: nextId('audit'),
    action,
    details,
    actorRole,
    createdAt: new Date().toISOString(),
  })
}

const runJobInternal = async (versionId: string, type: JobType, requestedBy: Role): Promise<WorkflowJob> => {
  const job: WorkflowJob = {
    id: nextId('job'),
    versionId,
    type,
    status: 'queued',
    requestedBy,
    createdAt: new Date().toISOString(),
  }
  jobs.unshift(job)
  pushAuditEvent('job.queued', `${type} поставлен в очередь для ${versionId}`, requestedBy)
  await delay(160)
  job.status = 'running'
  pushAuditEvent('job.running', `${type} выполняется для ${versionId}`, requestedBy)
  await delay(220)
  job.status = 'completed'
  job.finishedAt = new Date().toISOString()
  pushAuditEvent('job.completed', `${type} завершен для ${versionId}`, requestedBy)
  return clone(job)
}

export const getAllowedActions = (status: VersionStatus, role: Role): WorkflowAction[] => {
  return (Object.keys(transitionRules) as WorkflowAction[]).filter((action) => {
    const rule = transitionRules[action]
    return rule.from.includes(status) && rule.roles.includes(role)
  })
}

export const workflowApi = {
  async createExhibit(title: string, role: Role): Promise<Exhibit> {
    await delay()
    if (!['editor', 'admin'].includes(role)) {
      throw new Error('Только редактор и администратор могут создавать экспонаты')
    }
    const exhibitId = nextId('x')
    const versionId = nextId('v')
    const exhibit: Exhibit = {
      id: exhibitId,
      title,
      owner: roleLabel(role),
      summary: 'Черновик нового экспоната. Добавьте source-текст и запустите предобработку.',
      expositionId: expositions[0].id,
      currentVersionId: versionId,
    }
    const version: Version = {
      id: versionId,
      exhibitId,
      number: 1,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    }
    exhibits.unshift(exhibit)
    versions.unshift(version)
    pushAuditEvent('exhibit.created', `Создан экспонат ${exhibitId}`, role)
    return clone(exhibit)
  },

  async listExhibits(): Promise<ExhibitListItem[]> {
    await delay()
    return clone(
      exhibits.map((exhibit) => {
        const currentVersion = getVersionById(exhibit.currentVersionId)
        const exposition = getExpositionById(exhibit.expositionId)
        return {
          id: exhibit.id,
          title: exhibit.title,
          expositionTitle: exposition.title,
          owner: exhibit.owner,
          currentStatus: currentVersion.status,
          updatedAt: currentVersion.updatedAt,
        }
      }),
    )
  },

  async listExpositions(): Promise<Exposition[]> {
    await delay(100)
    return clone(expositions)
  },

  async getExhibitDetail(exhibitId: string): Promise<Exhibit> {
    await delay()
    return clone(getExhibitById(exhibitId))
  },

  async listVersions(exhibitId: string): Promise<Version[]> {
    await delay()
    return clone(versions.filter((version) => version.exhibitId === exhibitId).sort((a, b) => b.number - a.number))
  },

  async listReviewComments(versionId: string): Promise<ReviewComment[]> {
    await delay()
    return clone(reviewComments.filter((comment) => comment.versionId === versionId))
  },

  async addReviewComment(versionId: string, message: string, authorRole: Role): Promise<ReviewComment> {
    await delay()
    const version = getVersionById(versionId)
    if (!['on_review', 'needs_revision'].includes(version.status)) {
      throw new Error('Комментарии доступны только на этапах согласования и доработки')
    }
    const created: ReviewComment = {
      id: nextId('comment'),
      versionId,
      authorRole,
      message,
      createdAt: new Date().toISOString(),
    }
    reviewComments.unshift(created)
    pushAuditEvent('review.comment_added', `Comment added for ${versionId}`, authorRole)
    return clone(created)
  },

  async transitionVersion(versionId: string, action: WorkflowAction, role: Role, message?: string): Promise<Version> {
    await delay()
    const version = getVersionById(versionId)
    const rule = transitionRules[action]
    const isActionAllowed = rule.from.includes(version.status) && rule.roles.includes(role)
    if (!isActionAllowed) {
      throw new Error(`Действие ${action} недоступно из статуса ${version.status} для роли ${role}`)
    }

    if (action === 'request_revision' && !message?.trim()) {
      throw new Error('Для возврата на доработку обязателен комментарий')
    }

    version.status = rule.to
    bumpVersionTimestamp(version)
    setExhibitCurrentVersion(version)
    pushAuditEvent('workflow.transition', `${versionId}: ${action} -> ${rule.to}`, role)

    if (message?.trim()) {
      reviewComments.unshift({
        id: nextId('comment'),
        versionId,
        authorRole: role,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      })
      pushAuditEvent('review.comment_added', `Transition comment added for ${versionId}`, role)
    }

    if (action === 'publish') {
      await runJobInternal(versionId, 'preprocess', role)
      await runJobInternal(versionId, 'publish', role)
      pushAuditEvent('publish.completed', `Версия ${versionId} опубликована`, role)
    }

    return clone(version)
  },

  async runJob(versionId: string, type: JobType, role: Role): Promise<WorkflowJob> {
    await delay()
    getVersionById(versionId)

    if (type === 'preprocess' && !['editor', 'curator', 'admin'].includes(role)) {
      throw new Error('Недостаточно прав для запуска preprocess-задачи')
    }

    if (type === 'publish' && role !== 'admin') {
      throw new Error('Только администратор может запускать publish-задачи')
    }

    if (type === 'export' && !['curator', 'admin'].includes(role)) {
      throw new Error('Только куратор и администратор могут запускать export-задачи')
    }

    return runJobInternal(versionId, type, role)
  },

  async publishApproved(role: Role): Promise<{ publishedCount: number }> {
    await delay()
    if (role !== 'admin') {
      throw new Error('Только администратор может публиковать согласованные версии')
    }

    const approvedVersions = versions.filter((version) => version.status === 'approved')
    for (const version of approvedVersions) {
      await this.transitionVersion(version.id, 'publish', role)
    }

    pushAuditEvent('publish.bulk', `Bulk publish completed, count=${approvedVersions.length}`, role)
    return { publishedCount: approvedVersions.length }
  },

  async runPreflightChecks(): Promise<{ approved: number; onReview: number; draft: number }> {
    await delay(120)
    return {
      approved: versions.filter((version) => version.status === 'approved').length,
      onReview: versions.filter((version) => version.status === 'on_review').length,
      draft: versions.filter((version) => version.status === 'draft').length,
    }
  },

  async listAuditEvents(): Promise<AuditEvent[]> {
    await delay(80)
    return clone(auditEvents)
  },

  async listJobs(versionId?: string): Promise<WorkflowJob[]> {
    await delay(90)
    const filteredJobs = versionId ? jobs.filter((job) => job.versionId === versionId) : jobs
    return clone(filteredJobs)
  },
}
