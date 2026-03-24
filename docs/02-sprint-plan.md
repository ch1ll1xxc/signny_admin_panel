# Sprint Plan (Vue Demo)

## Команда и зоны ответственности
- FE Lead: маршрутизация, state management, экранные контракты, интеграция API.
- BE Lead: workflow/state machine, publish boundary, audit/events, jobs API.
- QA: acceptance matrix, smoke demo, проверка контрактов и edge cases.
- PM/BA: финализация открытых продуктовых решений, приоритизация scope.

## Sprint 1 (1 неделя) - Workflow Foundation

| Task | Owner | Effort | Done when |
|---|---|---|---|
| Vue app shell + router + role guards | FE | M | Доступ к ключевым route с role checks |
| Exhibit + source content CRUD (минимум) | FE + BE | L | Можно создать экспонат и source; данные возвращаются из API |
| Версии и переходы `draft/on_review/needs_revision` | FE + BE | L | Переходы работают по роли и правилам |
| Review comments как отдельная сущность | BE + FE | M | Комментарии видны в timeline и истории |
| Базовый audit event на mutation | BE | M | Любое изменение фиксируется событием |
| QA acceptance для сценариев 1-2 (черновой) | QA | M | Пройдены P0 кейсы по workflow foundation |

Sprint 1 Exit:
- Сквозной сценарий с возвратом на доработку демонстрируется стабильно.

## Sprint 2 (1 неделя) - Async + Publish

| Task | Owner | Effort | Done when |
|---|---|---|---|
| Async jobs model + jobs endpoints | BE | M | Есть job lifecycle `queued/running/succeeded/failed` |
| Jobs UI (polling/progress/retry) | FE | M | Статусы видны и обновляются без блокировки UI |
| FAQ lifecycle | FE + BE | M | FAQ проходит те же статусы, что и exhibit content |
| Assembly + publish candidate validation | FE + BE | L | Видны блокирующие проблемы перед publish |
| Atomic publish + snapshots | BE + FE | L | Publish переключает snapshot атомарно |
| QA acceptance для сценариев 1-3 | QA | M | Нет утечки draft в public read path |

Sprint 2 Exit:
- Демонстрируется публикация approved контента и FAQ без downtime.

## Sprint 3 (0.5-1 неделя) - Governance + Demo Polish

| Task | Owner | Effort | Done when |
|---|---|---|---|
| Analytics split (user/admin) | FE + BE | M | Два раздельных источника/вкладки метрик |
| Async exports | FE + BE | M | Запрос, статус, скачивание результата |
| Security/governance hardening (RBAC gaps, redaction) | BE | M | Пройдены security чек-листы для демо |
| Demo fixtures and deterministic script | FE + QA | S | Один воспроизводимый сценарий показа |
| Final smoke + bugfix buffer | FE + BE + QA | M | P0 дефекты закрыты, чек-лист green |

Sprint 3 Exit:
- Готов демонстрационный пакет для заказчика с доказуемой трассировкой и стабильным UX.

## Риски и буферы
- Риск контрактов API: зафиксировать DTO freeze после Sprint 1.
- Риск async-нестабильности: отдельный буфер на retry/error UX.
- Риск scope creep: держать MVP только на 4 сценариях из `01-mvp-demo-scenarios.md`.
