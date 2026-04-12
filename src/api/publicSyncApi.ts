import type { AdminFaqItem, Exhibit, Version } from '@/types/workflow'

interface SyncResult {
  ok: boolean
  status: number
  message: string
}

const DEFAULT_SYNC_URL = 'http://localhost:3000/api/integration/sync'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function buildPayload(exhibits: Exhibit[], versions: Version[], faqItems: AdminFaqItem[]) {
  const nowIso = new Date().toISOString()

  const publishedVersions = versions.filter((item) => item.status === 'published')
  const publishedVersionByExhibit = new Map(publishedVersions.map((item) => [item.exhibitId, item]))

  const publishedExhibits = exhibits
    .filter((item) => publishedVersionByExhibit.has(item.id))
    .map((item) => ({
      id: item.id,
      slug: slugify(item.title),
      title: item.title,
      status: 'published',
      description: item.summary,
      created_at: nowIso,
      updated_at: nowIso,
    }))

  const publishedFaq = faqItems
    .filter((item) => item.isPublished)
    .map((item, index) => ({
      id: item.id,
      exhibit_id: publishedExhibits[0]?.id ?? 'exhibit-001',
      question: item.question,
      answer_text: item.answer,
      order_no: index + 1,
      is_published: true,
    }))

  const contentVersions = publishedVersions.map((item) => ({
    id: item.id,
    exhibit_id: item.exhibitId,
    version_no: item.number,
    status: item.status,
    created_at: item.updatedAt,
    published_at: item.updatedAt,
  }))

  return {
    exhibits: publishedExhibits,
    faqItems: publishedFaq,
    contentVersions,
  }
}

export async function syncPublishedSnapshot(params: {
  exhibits: Exhibit[]
  versions: Version[]
  faqItems: AdminFaqItem[]
}): Promise<SyncResult> {
  const syncUrl = import.meta.env.VITE_PUBLIC_SYNC_URL ?? DEFAULT_SYNC_URL
  const syncKey = import.meta.env.VITE_PUBLIC_SYNC_KEY as string | undefined

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(syncKey ? { 'x-admin-sync-key': syncKey } : {}),
      },
      body: JSON.stringify(buildPayload(params.exhibits, params.versions, params.faqItems)),
    })

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: `Public sync failed with status ${response.status}`,
      }
    }

    return {
      ok: true,
      status: response.status,
      message: 'Public sync completed',
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Public sync request failed',
    }
  }
}
