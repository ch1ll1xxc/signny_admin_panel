import { beforeEach, describe, expect, it, vi } from 'vitest'

import { workflowApi } from '@/api/workflowApi'

describe('workflowApi media and QR adapters', () => {
  beforeEach(() => {
    window.localStorage.setItem('museum-cms-role', 'admin')
    vi.restoreAllMocks()
  })

  it('loads media assets from backend endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 'media-1',
            fileName: 'guide.mp4',
            mimeType: 'video/mp4',
            url: 'https://cdn.local/guide.mp4',
            createdAt: '2026-04-09T10:00:00Z',
          },
        ],
      }),
    )

    const media = await workflowApi.listMediaAssets()
    expect(media).toHaveLength(1)
    expect(media[0].fileName).toBe('guide.mp4')
  })

  it('creates QR entries via backend endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'qr-1',
        exhibitId: 'x-101',
        href: '/exh/x-101/tag?mode=ar&entry=qr',
        createdAt: '2026-04-09T10:00:00Z',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const qr = await workflowApi.generateQr('x-101')
    expect(qr.exhibitId).toBe('x-101')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4100/api/v1/qr/generate',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
