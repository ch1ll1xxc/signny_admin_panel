# API Contract: Админка <-> Публичный контур

## 1. Цель
Зафиксировать единый API-контракт, чтобы безболезненно связать административный контур (редактура/согласование/публикация) и публичный контур (чтение только опубликованных материалов).

## 2. Границы контуров
- Admin API (`/api/admin/v1`): CRUD, workflow, review, jobs, publish, audit, exports.
- Public API (`/api/public/v1`): только опубликованные данные для мобильного/публичного приложения.
- Integration API (`/api/integration/v1`): машинный обмен snapshots/events между контурами.

## 3. Базовые принципы
- Версионирование API через префикс `/v1`.
- Публичный контур никогда не читает `draft/on_review/needs_revision/approved`.
- Публикация атомарная: публичный контур видит только активный `publish_snapshot`.
- Все mutation-запросы в admin-контуре возвращают `auditEventId`.
- Идемпотентность обязательна для publish/export/job-trigger через `Idempotency-Key`.
- Корреляция запросов через `X-Correlation-Id` (генерируется клиентом или сервером).

## 4. Доменная модель (минимум)

```ts
type Role = 'editor' | 'curator' | 'admin';
type VersionStatus = 'draft' | 'on_review' | 'approved' | 'published' | 'needs_revision' | 'archived';

interface Exposition {
  id: string;
  title: string;
  hall: string;
}

interface Exhibit {
  id: string;
  expositionId: string;
  title: string;
  shortAdaptedDescription?: string;
  imageAssetId?: string;
  currentVersionId: string;
}

interface ExhibitVersion {
  id: string;
  exhibitId: string;
  number: number;
  status: VersionStatus;
  sourceContentRu?: string;
  generatedDraft?: string;
  editorContent?: string;
  updatedAt: string;
}

interface ReviewComment {
  id: string;
  targetType: 'exhibitVersion' | 'faqVersion';
  targetId: string;
  authorRole: Role;
  message: string;
  createdAt: string;
}

interface PublishSnapshot {
  id: string;
  publishedAt: string;
  publishedBy: string;
  manifestRef: string;
  active: boolean;
}
```

## 5. Admin API (`/api/admin/v1`)

### 5.1 Экспозиции/Экспонаты

- `GET /expositions`
- `POST /expositions`
- `GET /exhibits?expositionId=&status=&q=&page=&pageSize=`
- `POST /exhibits`
- `GET /exhibits/{exhibitId}`
- `PATCH /exhibits/{exhibitId}`
- `POST /exhibits/{exhibitId}/versions`
- `GET /exhibits/{exhibitId}/versions`
- `GET /exhibits/{exhibitId}/versions/{versionId}`
- `PATCH /exhibits/{exhibitId}/versions/{versionId}`

### 5.2 Workflow переходы

- `POST /versions/{versionId}/transitions`

Request:
```json
{
  "action": "submit_for_review",
  "comment": "optional, required for request_revision"
}
```

Response:
```json
{
  "versionId": "ver_123",
  "from": "draft",
  "to": "on_review",
  "auditEventId": "aud_987",
  "correlationId": "c_abc"
}
```

Правила переходов:
- `draft -> on_review` (`editor|admin`)
- `on_review -> approved` (`curator|admin`)
- `on_review -> needs_revision` (`curator|admin`, comment required)
- `needs_revision -> draft` (`editor|admin`)
- `approved -> published` (`admin`, только через publish job)

### 5.3 Комментарии согласования

- `GET /review-comments?targetType=&targetId=`
- `POST /review-comments`

### 5.4 FAQ

- `GET /faq`
- `POST /faq`
- `GET /faq/{faqId}/versions`
- `POST /faq/{faqId}/versions`
- `PATCH /faq/{faqId}/versions/{versionId}`
- `POST /faq/{faqId}/versions/{versionId}/transitions`

### 5.5 Async jobs

- `POST /jobs` (types: `preprocess`, `publish_build`, `publish_commit`, `qr_generate`, `export_generate`)
- `GET /jobs/{jobId}`
- `GET /jobs?targetType=&targetId=&status=&type=`
- `POST /jobs/{jobId}/retry`

### 5.6 Публикация

- `POST /publish/preflight`
- `POST /publish/commit`
- `GET /publish/snapshots`
- `GET /publish/snapshots/{snapshotId}`
- `POST /publish/rollback` (опционально для v1.1)

Preflight response:
```json
{
  "ok": true,
  "approvedVersions": 14,
  "blockingIssues": []
}
```

Commit response:
```json
{
  "snapshotId": "snap_2026_03_24_001",
  "status": "queued",
  "jobId": "job_pub_01",
  "auditEventId": "aud_pub_01"
}
```

### 5.7 Аудит/Аналитика/Выгрузки

- `GET /audit-events?action=&actorRole=&from=&to=&page=`
- `GET /analytics/user?from=&to=`
- `GET /analytics/admin?from=&to=`
- `POST /exports`
- `GET /exports/{exportId}`

## 6. Public API (`/api/public/v1`)

- `GET /health`
- `GET /expositions`
- `GET /expositions/{expositionId}/exhibits`
- `GET /exhibits/{exhibitId}`
- `GET /faq`
- `GET /qr/{code}` -> redirect/resolve published material

Требование:
- Ответы public API должны строиться только из **активного publish snapshot**.

## 7. Integration API (`/api/integration/v1`)

### 7.1 Snapshot pull
- `GET /snapshots/active`
- `GET /snapshots/{snapshotId}/manifest`

### 7.2 Event push (опционально)
- `POST /events/published`

Event payload:
```json
{
  "event": "snapshot.published",
  "snapshotId": "snap_2026_03_24_001",
  "publishedAt": "2026-03-24T12:00:00Z",
  "correlationId": "c_pub_001"
}
```

## 8. Ошибки и коды

Единый формат:
```json
{
  "error": {
    "code": "FORBIDDEN_TRANSITION",
    "message": "Нельзя выполнить переход draft -> published",
    "details": {},
    "correlationId": "c_err_001"
  }
}
```

Рекомендуемые коды:
- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 CONFLICT` (stale version / publish lock)
- `422 FORBIDDEN_TRANSITION`
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`

## 9. Безопасность
- Admin API: JWT + RBAC (`editor/curator/admin`).
- Public API: read-only, без доступа к административным endpoint.
- Для `/publish/*`, `/exports`, `/jobs` обязательно:
  - `Idempotency-Key`
  - `X-Correlation-Id`
  - аудит действия.

## 10. Observability и Grafana-ready метрики

Минимальный набор метрик:
- `workflow_versions_total{status}`
- `workflow_transition_total{from,to,role}`
- `review_cycle_seconds_bucket`
- `publish_jobs_total{status}`
- `publish_duration_seconds`
- `audit_events_total{action,actor_role}`
- `exports_total{status,type}`

Логи (structured):
- `correlationId`, `actorRole`, `action`, `entityType`, `entityId`, `result`, `latencyMs`.

## 11. План внедрения

### Phase 1
- Заморозить контракт (`v1`) и добавить OpenAPI.
- Реализовать admin endpoints для exhibits/versions/transitions/comments.

### Phase 2
- Реализовать publish preflight + commit + snapshots.
- Поднять public read API на active snapshot.

### Phase 3
- Интеграция monitoring: Prometheus -> Grafana.
- Экспорт/аудит и SLA/alerts.

## 12. Что согласовать до реализации
- rollback в `v1` или `v1.1`.
- push events vs pull snapshots для public контура.
- SLA publish (например p95 < 30s).
- обязательные поля аудита для юридической прозрачности.
