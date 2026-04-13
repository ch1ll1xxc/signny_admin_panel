import type {
  AdminFaqItem,
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
import { syncPublishedSnapshot } from '@/api/publicSyncApi'

const WORKFLOW_STORAGE_KEY = 'signny-admin-workflow-state-v3'

interface PersistedWorkflowState {
  exhibits: Exhibit[]
  versions: Version[]
  reviewComments: ReviewComment[]
  jobs: WorkflowJob[]
  auditEvents: AuditEvent[]
  faqItems: AdminFaqItem[]
}

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
    description: 'Экспонат охватывает историю стеклоделия от античных мастерских до современных реставрационных лабораторий. Посетитель узнаёт, как менялись технологии выплавки и какую роль играло стекло в культуре разных эпох.',
    expositionId: 'exp-01',
    currentVersionId: 'v-101-2',
  },
  {
    id: 'x-102',
    title: 'Лесные саундскейпы',
    owner: 'А. Петрова',
    summary: 'Иммерсивный экспонат с полевыми записями и картами маршрутов.',
    description: 'Аудиальный экспонат, в котором посетитель погружается в звуки леса. Полевые записи сопровождаются картами маршрутов и пояснениями к каждому фрагменту звукового ландшафта.',
    expositionId: 'exp-02',
    currentVersionId: 'v-102-3',
  },
  {
    id: 'x-103',
    title: 'Слои окаменелостей',
    owner: 'Д. Смирнов',
    summary: 'Маршрут по стратиграфии с интерактивными образцами.',
    description: 'Интерактивная экспозиция, где посетитель последовательно изучает слои горных пород, рассматривает образцы окаменелостей и узнаёт об эволюции жизни через геологические эпохи.',
    expositionId: 'exp-03',
    currentVersionId: 'v-103-1',
  },
]

const versions: Version[] = [
  { id: 'v-101-2', exhibitId: 'x-101', number: 2, status: 'on_review', sourceText: 'Стеклоделие зародилось в Древнем Египте около 3500 лет до нашей эры. Первые изделия из стекла — бусины и амулеты — изготавливались из непрозрачного стекла.', adaptedText: 'Стекло появилось давно — в Египте. Сначала делали бусины. Потом научились делать прозрачное стекло.', updatedAt: new Date().toISOString() },
  { id: 'v-102-3', exhibitId: 'x-102', number: 3, status: 'draft', sourceText: 'Полевые записи леса включают звуки птиц, ветра в кронах и шум ручья. Каждый фрагмент привязан к точке на маршруте.', updatedAt: new Date().toISOString() },
  { id: 'v-103-1', exhibitId: 'x-103', number: 1, status: 'approved', sourceText: 'Стратиграфия — наука о последовательности залегания горных пород. Каждый слой хранит следы жизни определённой эпохи.', adaptedText: 'Земля состоит из слоёв. В каждом слое — свои окаменелости. Чем глубже — тем старше.', updatedAt: new Date().toISOString() },
]

const reviewComments: ReviewComment[] = [
  {
    id: 'c-1',
    versionId: 'v-101-2',
    authorRole: 'curator',
    message: 'Проверьте историческую атрибуцию во втором разделе.',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
]

const faqItems: AdminFaqItem[] = [
  {
    id: 'faq-1',
    exhibitId: 'x-101',
    exhibitTitle: 'Рождение стекла',
    question: 'Из чего делали первое стекло?',
    answer: 'Первое стекло делали из песка, соды и извести. Позже научились добавлять оксиды металлов для цвета.',
    videoUrl: '/videos/glass-origin.mp4',
    subtitles: 'Стекло появилось в Египте. Песок плавили при высокой температуре.',
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: 'faq-2',
    exhibitId: 'x-102',
    exhibitTitle: 'Лесные саундскейпы',
    question: 'Какие звуки записаны в экспозиции?',
    answer: 'Записаны звуки птиц, шум ветра в кронах, журчание ручья и хруст веток.',
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: 'faq-3',
    exhibitId: 'x-103',
    exhibitTitle: 'Слои окаменелостей',
    question: 'Как определить возраст окаменелости?',
    answer: 'Возраст определяют по глубине залегания слоя и методом радиоуглеродного датирования.',
    updatedAt: new Date().toISOString(),
    isPublished: false,
  },
]

const jobs: WorkflowJob[] = []
const auditEvents: AuditEvent[] = []

const canUseStorage = (): boolean => typeof window !== 'undefined' && Boolean(window.localStorage)

const saveState = () => {
  if (!canUseStorage()) {
    return
  }

  const payload: PersistedWorkflowState = {
    exhibits,
    versions,
    reviewComments,
    jobs,
    auditEvents,
    faqItems,
  }

  window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(payload))
}

const loadState = () => {
  if (!canUseStorage()) {
    return
  }

  try {
    const raw = window.localStorage.getItem(WORKFLOW_STORAGE_KEY)
    if (!raw) {
      return
    }

    const parsed = JSON.parse(raw) as Partial<PersistedWorkflowState>
    if (Array.isArray(parsed.exhibits)) {
      exhibits.splice(0, exhibits.length, ...parsed.exhibits)
    }
    if (Array.isArray(parsed.versions)) {
      versions.splice(0, versions.length, ...parsed.versions)
    }
    if (Array.isArray(parsed.reviewComments)) {
      reviewComments.splice(0, reviewComments.length, ...parsed.reviewComments)
    }
    if (Array.isArray(parsed.jobs)) {
      jobs.splice(0, jobs.length, ...parsed.jobs)
    }
    if (Array.isArray(parsed.auditEvents)) {
      auditEvents.splice(0, auditEvents.length, ...parsed.auditEvents)
    }
    if (Array.isArray(parsed.faqItems)) {
      faqItems.splice(0, faqItems.length, ...parsed.faqItems)
    }
  } catch {
    // ignore malformed persisted payload and continue with defaults
  }
}

loadState()

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
  saveState()
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
  saveState()
  pushAuditEvent('job.queued', `${type} поставлен в очередь для ${versionId}`, requestedBy)
  await delay(160)
  job.status = 'running'
  saveState()
  pushAuditEvent('job.running', `${type} выполняется для ${versionId}`, requestedBy)
  await delay(220)
  job.status = 'completed'
  job.finishedAt = new Date().toISOString()
  saveState()
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

  async publishApproved(role: Role): Promise<{ publishedCount: number; synced: boolean; syncMessage: string }> {
    await delay()
    if (role !== 'admin') {
      throw new Error('Только администратор может публиковать согласованные версии')
    }

    const approvedVersions = versions.filter((version) => version.status === 'approved')
    for (const version of approvedVersions) {
      await this.transitionVersion(version.id, 'publish', role)
    }

    const syncResult = await syncPublishedSnapshot({
      exhibits,
      versions,
      faqItems,
    })

    if (syncResult.ok) {
      pushAuditEvent('publish.sync_public.ok', `Public contour synced (status=${syncResult.status})`, role)
    } else {
      pushAuditEvent('publish.sync_public.failed', `Public contour sync failed: ${syncResult.message}`, role)
    }

    pushAuditEvent('publish.bulk', `Bulk publish completed, count=${approvedVersions.length}`, role)
    return {
      publishedCount: approvedVersions.length,
      synced: syncResult.ok,
      syncMessage: syncResult.message,
    }
  },

  async listFaqItems(): Promise<AdminFaqItem[]> {
    await delay(80)
    return clone(faqItems)
  },

  async addFaqItem(input: { exhibitId: string; question: string; answer: string; videoUrl?: string; subtitles?: string }, role: Role): Promise<AdminFaqItem> {
    await delay(140)

    if (!['editor', 'curator', 'admin'].includes(role)) {
      throw new Error('Недостаточно прав для добавления FAQ')
    }

    const question = input.question.trim()
    const answer = input.answer.trim()

    if (!input.exhibitId) {
      throw new Error('Необходимо выбрать экспонат')
    }

    if (!question || !answer) {
      throw new Error('Вопрос и ответ обязательны')
    }

    const exhibit = getExhibitById(input.exhibitId)

    const nextItem: AdminFaqItem = {
      id: nextId('faq'),
      exhibitId: input.exhibitId,
      exhibitTitle: exhibit.title,
      question,
      answer,
      videoUrl: input.videoUrl?.trim() || undefined,
      subtitles: input.subtitles?.trim() || undefined,
      updatedAt: new Date().toISOString(),
      isPublished: false,
    }

    faqItems.unshift(nextItem)
    saveState()
    pushAuditEvent('faq.created', `FAQ создан: ${nextItem.id} для ${exhibit.title}`, role)

    return clone(nextItem)
  },

  async updateExhibit(exhibitId: string, data: { title?: string; summary?: string; description?: string; imageUrl?: string }, role: Role): Promise<Exhibit> {
    await delay()
    if (!['editor', 'admin'].includes(role)) {
      throw new Error('Недостаточно прав для редактирования экспоната')
    }
    const exhibit = getExhibitById(exhibitId)
    if (data.title !== undefined) exhibit.title = data.title
    if (data.summary !== undefined) exhibit.summary = data.summary
    if (data.description !== undefined) exhibit.description = data.description
    if (data.imageUrl !== undefined) exhibit.imageUrl = data.imageUrl
    pushAuditEvent('exhibit.updated', `Экспонат ${exhibitId} обновлён`, role)
    return clone(exhibit)
  },

  async updateVersion(versionId: string, data: { sourceText?: string; adaptedText?: string }, role: Role): Promise<Version> {
    await delay()
    if (!['editor', 'admin'].includes(role)) {
      throw new Error('Недостаточно прав для редактирования версии')
    }
    const version = getVersionById(versionId)
    if (version.status !== 'draft' && version.status !== 'needs_revision') {
      throw new Error('Редактирование доступно только для черновика или версии на доработке')
    }
    if (data.sourceText !== undefined) version.sourceText = data.sourceText
    if (data.adaptedText !== undefined) version.adaptedText = data.adaptedText
    bumpVersionTimestamp(version)
    pushAuditEvent('version.content_updated', `Контент версии ${versionId} обновлён`, role)
    return clone(version)
  },

  async updateFaqItem(faqId: string, data: { question?: string; answer?: string; videoUrl?: string; subtitles?: string; isPublished?: boolean }, role: Role): Promise<AdminFaqItem> {
    await delay()
    if (!['editor', 'curator', 'admin'].includes(role)) {
      throw new Error('Недостаточно прав для редактирования FAQ')
    }
    const item = faqItems.find((f) => f.id === faqId)
    if (!item) throw new Error('FAQ не найден')
    if (data.question !== undefined) item.question = data.question
    if (data.answer !== undefined) item.answer = data.answer
    if (data.videoUrl !== undefined) item.videoUrl = data.videoUrl
    if (data.subtitles !== undefined) item.subtitles = data.subtitles
    if (data.isPublished !== undefined) item.isPublished = data.isPublished
    item.updatedAt = new Date().toISOString()
    saveState()
    pushAuditEvent('faq.updated', `FAQ ${faqId} обновлён`, role)
    return clone(item)
  },

  async deleteFaqItem(faqId: string, role: Role): Promise<void> {
    await delay()
    if (!['admin'].includes(role)) {
      throw new Error('Только администратор может удалять FAQ')
    }
    const index = faqItems.findIndex((f) => f.id === faqId)
    if (index === -1) throw new Error('FAQ не найден')
    faqItems.splice(index, 1)
    saveState()
    pushAuditEvent('faq.deleted', `FAQ ${faqId} удалён`, role)
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
