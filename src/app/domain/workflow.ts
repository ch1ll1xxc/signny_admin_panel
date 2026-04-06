export type ContentLifecycleStatus =
  | 'draft'
  | 'on_review'
  | 'approved'
  | 'published'
  | 'needs_revision'
  | 'archived'

export interface ReviewVersion {
  id: string
  exhibitTitle: string
  status: ContentLifecycleStatus
  submitterEmail: string
  submittedAt: string
  reviewerEmail?: string
  reviewerComment?: string
}

export interface AdminAuditEvent {
  id: string
  actorEmail: string
  action: 'submit_review' | 'approve' | 'request_revision' | 'publish'
  entity: string
  outcome: 'success' | 'rejected'
  createdAt: string
  note?: string
}
