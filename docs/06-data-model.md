# Описание модели данных АК АС «Сайнни»

## 1. Основные сущности

### Exhibit (Экспонат)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| title | string | Название экспоната |
| owner | string | Ответственный (ФИО или роль) |
| summary | string | Краткое описание |
| description | string? | Полное описание |
| imageUrl | string? | URL изображения |
| expositionId | string | ID экспозиции (зала) |
| currentVersionId | string | ID текущей активной версии |

### Version (Версия контента)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| exhibitId | string | ID экспоната-владельца |
| number | number | Порядковый номер версии |
| status | VersionStatus | Текущий статус (см. жизненный цикл) |
| sourceText | string? | Исходный русский текст |
| adaptedText | string? | Адаптированный текст для РЖЯ |
| updatedAt | string (ISO 8601) | Дата последнего обновления |

### Exposition (Экспозиция / Зал)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| title | string | Название экспозиции |
| hall | string | Зал размещения |

### HallSummary (Зал)
| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Уникальный идентификатор |
| name | string | Название зала |
| code | string | Машинный код |
| exhibitsCount | number | Количество экспонатов |

### AdminFaqItem (FAQ)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| exhibitId | string | ID связанного экспоната |
| exhibitTitle | string? | Название экспоната (денормализация) |
| question | string | Текст вопроса |
| answer | string | Текст ответа |
| videoUrl | string? | URL видеоответа |
| subtitles | string? | Субтитры (текст или URL .vtt) |
| updatedAt | string (ISO 8601) | Дата обновления |
| isPublished | boolean | Опубликован ли в публичный контур |

### ReviewComment (Комментарий согласования)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| versionId | string | ID версии |
| authorRole | Role | Роль автора (editor/curator/admin) |
| message | string | Текст комментария |
| createdAt | string (ISO 8601) | Дата создания |

### AuditEvent (Событие журнала)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| action | string | Тип действия |
| details | string | Описание |
| actorRole | Role | Роль исполнителя |
| createdAt | string (ISO 8601) | Дата и время |

### WorkflowJob (Задача обработки)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| versionId | string | ID версии |
| type | JobType | Тип: preprocess / publish / export |
| status | JobStatus | Статус: queued / running / completed |
| requestedBy | Role | Роль инициатора |
| createdAt | string (ISO 8601) | Дата постановки |
| finishedAt | string? | Дата завершения |

### QrCodeEntry (QR-код)
| Поле | Тип | Описание |
|------|-----|----------|
| id | string | Уникальный идентификатор |
| exhibitId | string | ID экспоната |
| href | string | Закодированный URL |
| createdAt | string (ISO 8601) | Дата генерации |

## 2. Перечисления

### Role
`editor` | `curator` | `admin`

### VersionStatus (жизненный цикл)
| Статус | Описание |
|--------|----------|
| `draft` | Черновик, доступен для редактирования |
| `on_review` | Отправлен на согласование куратору |
| `approved` | Согласован, готов к публикации |
| `published` | Опубликован в публичный контур |
| `needs_revision` | Возвращён на доработку с комментарием |
| `archived` | Архивирован (устаревшая версия) |

### WorkflowAction (действия над версией)
| Действие | Из статусов | Роли |
|----------|------------|------|
| submit_for_review | draft | editor, admin |
| approve | on_review | curator, admin |
| request_revision | on_review | curator, admin |
| return_to_draft | needs_revision | editor, admin |
| publish | approved | admin |
| archive | published | admin |

### Permission (12 разрешений)
`exhibits.read`, `exhibits.write`, `media.read`, `media.write`, `halls.read`, `halls.write`, `audit.read`, `faq.read`, `faq.write`, `publish.execute`, `exports.read`, `dashboard.read`

## 3. Связи между сущностями

```
Exposition 1──N Exhibit
Exhibit    1──N Version
Exhibit    1──N AdminFaqItem
Version    1──N ReviewComment
Version    1──N WorkflowJob
Exhibit    1──1 QrCodeEntry
```

## 4. Хранение данных

В текущей реализации данные хранятся в localStorage браузера через mock API:
- Ключ `signny-admin-workflow-state-v3`: exhibits, versions, comments, jobs, audit, FAQ
- Ключ `admin_halls`: залы
- Ключ `admin_avatar_bindings`: привязки аватарных сцен
- Ключ `session_token`, `session_user`: сессия авторизации

При подключении бэкенда данные будут храниться в серверной БД через REST API.
