import type { ReviewVersion } from '../../domain/workflow'

export interface PublicSyncExhibit {
  id: string
  slug: string
  title: string
  status: string
  created_at: string
  updated_at: string
}

export interface PublicSyncFaqItem {
  id: string
  exhibit_id: string
  question: string
  answer_text: string
  order_no: number
  is_published: boolean
}

export interface PublicSyncContentVersion {
  id: string
  exhibit_id: string
  version_no: number
  status: string
  created_at: string
  published_at: string
}

export interface PublicSyncPayload {
  exhibits: PublicSyncExhibit[]
  faqItems: PublicSyncFaqItem[]
  contentVersions: PublicSyncContentVersion[]
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const buildPublicSyncPayload = (versions: ReviewVersion[]): PublicSyncPayload => {
  const publishedVersions = versions.filter((version) => version.status === 'published')

  return {
    exhibits: publishedVersions.map((version) => ({
      id: version.id,
      slug: slugify(version.exhibitTitle),
      title: version.exhibitTitle,
      status: version.status,
      created_at: version.submittedAt,
      updated_at: new Date().toISOString(),
    })),
    faqItems: publishedVersions.map((version, index) => ({
      id: `faq-${version.id}`,
      exhibit_id: version.id,
      question: `What is special about ${version.exhibitTitle}?`,
      answer_text: 'Generated from admin publication sync baseline.',
      order_no: index + 1,
      is_published: true,
    })),
    contentVersions: publishedVersions.map((version, index) => ({
      id: `cv-${version.id}`,
      exhibit_id: version.id,
      version_no: index + 1,
      status: version.status,
      created_at: version.submittedAt,
      published_at: new Date().toISOString(),
    })),
  }
}

export async function pushPublicSync(payload: PublicSyncPayload): Promise<void> {
  const baseUrl =
    (import.meta.env.VITE_PUBLIC_CONTOUR_API_BASE_URL as string | undefined) ||
    'http://localhost:3000'
  const syncKey = import.meta.env.VITE_PUBLIC_CONTOUR_SYNC_KEY as string | undefined

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/integration/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(syncKey ? { 'X-Admin-Sync-Key': syncKey } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Sync failed with status ${response.status}`)
  }
}
