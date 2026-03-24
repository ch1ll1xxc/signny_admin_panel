# Vue Admin Demo - Implementation Pack

## 1. Цель пакета
Этот документ фиксирует единый набор артефактов для команды `frontend/backend/qa` по демо-версии админ-панели на Vue: экранные контракты, API DTO, итерационный план и критерии выхода.

## 2. Экранные контракты (route -> components -> actions)

| Route | Ключевые компоненты | Основные действия | Роли |
|---|---|---|---|
| `/admin/dashboard` | KPI cards, queues, failures widget | Смотреть состояние пайплайна, перейти в очереди | editor/curator/admin |
| `/admin/exhibits` | ExhibitsTable, Filters, CreateExhibitModal | Создать экспонат, фильтрация по статусам, открыть карточку | editor/admin |
| `/admin/exhibits/:id` | ExhibitForm, MediaPanel, QRPanel, VersionsList | Редактировать метаданные, генерировать QR, создать новую версию | editor/admin |
| `/admin/exhibits/:id/versions/:versionId` | SourceEditor, DraftEditor, StateTimeline, TransitionBar, CommentsPanel | Запустить preprocess, редактировать draft, отправить на review, переходы статусов | editor/curator/admin (по правам) |
| `/admin/source-content` | SourceTable, SourceEditDrawer | Создать/редактировать RU source, привязать к экспонату/версии | editor/admin |
| `/admin/review-queue` | ReviewQueueTable, CommentComposer | Оставить комментарий, approve, needs_revision | curator/admin |
| `/admin/faq` | FAQTable, FAQEditor, FAQVersions | CRUD FAQ, lifecycle-переходы, публикация через publish-процесс | editor/curator/admin (по правам) |
| `/admin/jobs` | JobsTable, JobProgress, RetryDialog | Мониторинг async jobs, retry/cancel | editor/admin |
| `/admin/assembly` | AssemblyBuilder, ValidationPanel | Связать avatar scene + published exhibits + published FAQ | admin |
| `/admin/publish` | PublishCandidateView, PublishDialog, SnapshotsList | Preflight валидация, atomic publish, просмотр snapshots | admin |
| `/admin/audit` | AuditTable, Filters, EventDetail | Фильтрация журнала, трассировка по correlation id | admin (full), curator/editor (ограниченно) |
| `/admin/analytics` | UserMetricsTab, AdminMetricsTab | Просмотр агрегированных метрик по двум доменам | admin |
| `/admin/exports` | ExportRequestForm, ExportHistory | Запросить выгрузку, скачать результат | admin |

### UI/UX обязательства
- Любая долгая операция (`preprocess`, `publish`, `export`, `qr`) выполняется асинхронно.
- UI не блокируется, статус виден в `Jobs` и контексте текущего экрана.
- Любое mutation-действие возвращает ссылку на событие аудита (`auditEventId`/`correlationId`).

## 3. Workflow contract (единый для ExhibitVersion и FAQVersion)

### Допустимые статусы
`draft`, `on_review`, `approved`, `published`, `needs_revision`, `archived`

### Переходы
- `draft -> on_review` (editor/admin)
- `on_review -> approved` (curator/admin)
- `on_review -> needs_revision` (curator/admin, с обязательной причиной)
- `needs_revision -> draft` (editor/admin)
- `approved -> published` (admin, только через publish job)
- `published -> archived` (admin)

### Запрещенные переходы
- `draft -> published`
- `published -> draft`
- approve/publish не своей ролью

## 4. API DTO Appendix (frontend/backend sync)

```ts
type Role = 'editor' | 'curator' | 'admin';
type VersionState =
  | 'draft'
  | 'on_review'
  | 'approved'
  | 'published'
  | 'needs_revision'
  | 'archived';

type JobType = 'preprocess' | 'draft_generate' | 'publish_build' | 'publish_commit' | 'qr_generate' | 'export_generate';
type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | 'waiting_retry';

interface ExhibitDTO {
  id: string;
  title: string;
  imageAssetId?: string;
  shortAdaptedDescription?: string;
  currentPublishedVersionId?: string;
  updatedAt: string;
}

interface ExhibitVersionDTO {
  id: string;
  exhibitId: string;
  versionNumber: number;
  state: VersionState;
  sourceContentId?: string;
  generatedDraft?: string;
  editorContent?: string;
  reviewSubmittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
}

interface FAQItemDTO {
  id: string;
  question: string;
  category?: string;
  currentPublishedVersionId?: string;
}

interface FAQVersionDTO {
  id: string;
  faqId: string;
  versionNumber: number;
  state: VersionState;
  sourceContentRu?: string;
  draftAnswer?: string;
  finalAnswer?: string;
}

interface ReviewCommentDTO {
  id: string;
  targetType: 'exhibitVersion' | 'faqVersion';
  targetId: string;
  authorId: string;
  result: 'approve' | 'request_revision' | 'note';
  why: string;
  createdAt: string;
}

interface JobDTO {
  id: string;
  type: JobType;
  status: JobStatus;
  targetType?: 'exhibitVersion' | 'faqVersion' | 'assembly' | 'export';
  targetId?: string;
  progress?: number;
  errorCode?: string;
  errorMessage?: string;
  requestedBy: string;
  correlationId: string;
}

interface PublishSnapshotDTO {
  id: string;
  assemblyId: string;
  publishedAt: string;
  publishedBy: string;
  manifestRef: string;
}

interface AuditEventDTO {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: string;
  afterState?: string;
  reason?: string;
  correlationId: string;
}
```

## 5. Критерии выхода по итерациям

### Iteration 1 (Core workflow)
- Vue shell + auth/rbac guards.
- Exhibit + source content + version CRUD.
- Review comments + transition rules.
- Базовый audit log.

Exit criteria:
- Проходит сценарий `draft -> on_review -> needs_revision -> draft -> on_review`.

### Iteration 2 (Async + publish)
- Jobs module (polling/status/retry).
- FAQ lifecycle.
- Assembly + publish candidate validation.
- Atomic publish snapshots.

Exit criteria:
- Проходит сценарий `approved -> published` без утечки draft.

### Iteration 3 (Governance + demo hardening)
- Analytics split (user/admin).
- Export async lifecycle.
- Набор demo fixtures + smoke checklist.

Exit criteria:
- Полный E2E demo-script + доказуемый audit trail.
