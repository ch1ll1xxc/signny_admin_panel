import { afterEach, describe, expect, it, vi } from 'vitest'

import { syncPublishedSnapshot } from '@/api/publicSyncApi'

describe('publish to public visibility contract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sync payload contains only published versions and exhibits', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await syncPublishedSnapshot({
      exhibits: [
        {
          id: 'x-pub',
          title: 'Опубликованный экспонат',
          owner: 'Редактор',
          summary: 'Доступен для посетителей',
          expositionId: 'exp-01',
          currentVersionId: 'v-pub',
        },
        {
          id: 'x-draft',
          title: 'Черновик экспоната',
          owner: 'Редактор',
          summary: 'Не должен попасть в public контур',
          expositionId: 'exp-01',
          currentVersionId: 'v-draft',
        },
      ],
      versions: [
        {
          id: 'v-pub',
          exhibitId: 'x-pub',
          number: 3,
          status: 'published',
          updatedAt: '2026-04-09T10:00:00Z',
        },
        {
          id: 'v-draft',
          exhibitId: 'x-draft',
          number: 1,
          status: 'draft',
          updatedAt: '2026-04-09T10:00:00Z',
        },
      ],
      faqItems: [
        {
          id: 'faq-pub',
          question: 'Что важно?',
          answer: 'Показываем только опубликованные данные.',
          updatedAt: '2026-04-09T10:00:00Z',
          isPublished: true,
        },
        {
          id: 'faq-hidden',
          question: 'Служебный вопрос',
          answer: 'Не должен попасть в payload.',
          updatedAt: '2026-04-09T10:00:00Z',
          isPublished: false,
        },
      ],
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const payload = JSON.parse(String(requestInit.body)) as {
      exhibits: Array<{ id: string; status: string }>
      contentVersions: Array<{ id: string; status: string; exhibit_id: string }>
      faqItems: Array<{ id: string; exhibit_id: string }>
    }

    expect(payload.exhibits).toHaveLength(1)
    expect(payload.exhibits[0]).toMatchObject({ id: 'x-pub', status: 'published' })

    expect(payload.contentVersions).toHaveLength(1)
    expect(payload.contentVersions[0]).toMatchObject({ id: 'v-pub', status: 'published', exhibit_id: 'x-pub' })

    expect(payload.faqItems).toHaveLength(1)
    expect(payload.faqItems[0]).toMatchObject({ id: 'faq-pub', exhibit_id: 'x-pub' })
  })
})
