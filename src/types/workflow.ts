export type Role = 'editor' | 'curator' | 'admin'

export type VersionStatus =
  | 'draft'
  | 'on_review'
  | 'approved'
  | 'published'
  | 'needs_revision'
  | 'archived'

export type WorkflowAction =
  | 'submit_for_review'
  | 'approve'
  | 'request_revision'
  | 'return_to_draft'
  | 'publish'
  | 'archive'

export type JobType = 'preprocess' | 'publish' | 'export'
export type JobStatus = 'queued' | 'running' | 'completed'

export interface Exhibit {
  id: string
  title: string
  owner: string
  summary: string
  expositionId: string
  currentVersionId: string
}

export interface ExhibitListItem {
  id: string
  title: string
  expositionTitle: string
  owner: string
  currentStatus: VersionStatus
  updatedAt: string
}

export interface Exposition {
  id: string
  title: string
  hall: string
}

export interface Version {
  id: string
  exhibitId: string
  number: number
  status: VersionStatus
  updatedAt: string
}

export interface ReviewComment {
  id: string
  versionId: string
  authorRole: Role
  message: string
  createdAt: string
}

export interface AdminFaqItem {
  id: string
  question: string
  answer: string
  updatedAt: string
  isPublished: boolean
}

export interface WorkflowJob {
  id: string
  versionId: string
  type: JobType
  status: JobStatus
  requestedBy: Role
  createdAt: string
  finishedAt?: string
}

export interface AuditEvent {
  id: string
  action: string
  details: string
  actorRole: Role
  createdAt: string
}

export interface MediaAsset {
  id: string
  fileName: string
  url: string
  mimeType: string
  createdAt: string
}

export interface QrCodeEntry {
  id: string
  exhibitId: string
  href: string
  createdAt: string
}
