export type UserRole = 'admin' | 'editor' | 'curator' | 'analyst';

export type ContentLifecycleStatus =
  | 'draft'
  | 'on_review'
  | 'approved'
  | 'published'
  | 'needs_revision'
  | 'archived';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  user?: User;
  error?: string;
}

export interface LogoutResult {
  success: boolean;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  timestamp: Date;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface SourceText {
  id: string;
  exhibitId: string;
  versionId: string;
  content: string;
  language: 'ru';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentVersion {
  id: string;
  exhibitId: string;
  status: ContentLifecycleStatus;
  revision: number;
  sourceTextId?: string;
  preprocessedText?: string;
  publishedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExhibitCard {
  id: string;
  title: string;
  hallId: string;
  shortDescription?: string;
  imageUrl?: string;
  publishedVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewComment {
  id: string;
  versionId: string;
  authorId: string;
  decision?: 'approve' | 'needs_revision' | 'comment';
  message: string;
  createdAt: Date;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  subtitlesUrl?: string;
  status: ContentLifecycleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
