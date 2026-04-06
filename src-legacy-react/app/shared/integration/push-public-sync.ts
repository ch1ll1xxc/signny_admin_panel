export interface PublicSyncExhibit {
  id: string;
  slug: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PublicSyncFaqItem {
  id: string;
  exhibit_id: string;
  question: string;
  answer_text: string;
  order_no: number;
  is_published: boolean;
}

export interface PublicSyncContentVersion {
  id: string;
  exhibit_id: string;
  version_no: number;
  status: string;
  created_at: string;
  published_at: string;
}

export interface PublicSyncPayload {
  exhibits: PublicSyncExhibit[];
  faqItems: PublicSyncFaqItem[];
  contentVersions: PublicSyncContentVersion[];
}

export const demoPublicSyncPayload: PublicSyncPayload = {
  exhibits: [
    {
      id: 'exhibit-001',
      slug: 'ancient-pottery',
      title: 'Древняя керамика эпохи неолита',
      status: 'published',
      created_at: '2026-02-01T10:00:00.000Z',
      updated_at: '2026-04-05T10:00:00.000Z',
    },
    {
      id: 'exhibit-002',
      slug: 'medieval-manuscripts',
      title: 'Средневековые рукописи',
      status: 'published',
      created_at: '2026-02-02T10:00:00.000Z',
      updated_at: '2026-04-05T10:00:00.000Z',
    },
  ],
  faqItems: [
    {
      id: 'faq-001',
      exhibit_id: 'exhibit-001',
      question: 'Откуда этот экспонат?',
      answer_text: 'Экспонат найден в ходе археологических раскопок в регионе.',
      order_no: 1,
      is_published: true,
    },
    {
      id: 'faq-002',
      exhibit_id: 'exhibit-002',
      question: 'Как датируется рукопись?',
      answer_text: 'По палеографическим признакам и материалу пергамента.',
      order_no: 1,
      is_published: true,
    },
  ],
  contentVersions: [
    {
      id: 'cv-001',
      exhibit_id: 'exhibit-001',
      version_no: 1,
      status: 'published',
      created_at: '2026-02-01T10:00:00.000Z',
      published_at: '2026-04-05T10:00:00.000Z',
    },
    {
      id: 'cv-002',
      exhibit_id: 'exhibit-002',
      version_no: 1,
      status: 'published',
      created_at: '2026-02-02T10:00:00.000Z',
      published_at: '2026-04-05T10:00:00.000Z',
    },
  ],
};

export async function pushPublicSync(payload: PublicSyncPayload): Promise<void> {
  const baseUrl =
    (import.meta.env.VITE_PUBLIC_CONTOUR_API_BASE_URL as string | undefined) ||
    'http://localhost:3000';
  const syncKey = import.meta.env.VITE_PUBLIC_CONTOUR_SYNC_KEY as string | undefined;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/integration/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(syncKey ? { 'X-Admin-Sync-Key': syncKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sync failed with status ${response.status}`);
  }
}
