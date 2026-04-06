export interface PublicContourState {
  generatedAt: string;
  exhibits: {
    publishedCount: number;
    ids: string[];
  };
  faq: {
    publishedCount: number;
  };
  contentVersions: {
    totalCount: number;
  };
}

export async function getPublicContourState(): Promise<PublicContourState> {
  const baseUrl =
    (import.meta.env.VITE_PUBLIC_CONTOUR_API_BASE_URL as string | undefined) ||
    'http://localhost:3000';

  const response = await fetch(
    `${baseUrl.replace(/\/$/, '')}/api/integration/public-state`
  );

  if (!response.ok) {
    throw new Error(`Public contour is unavailable (${response.status})`);
  }

  return (await response.json()) as PublicContourState;
}
