import { computed, ref } from 'vue'
import { workflowApi } from '@/api/workflowApi'
import type { MediaFile } from '../domain/catalog'

const mediaSeed: MediaFile[] = [
  {
    id: 'seed-1',
    name: 'ancient-pottery-rsl.mp4',
    type: 'video',
    status: 'ready',
    usedIn: ['Ancient pottery of Neolithic era'],
    uploadDate: '2026-02-20',
    size: '125 MB',
  },
  {
    id: 'seed-2',
    name: 'ancient-pottery-subtitles.vtt',
    type: 'subtitles',
    status: 'ready',
    usedIn: ['Ancient pottery of Neolithic era'],
    uploadDate: '2026-02-20',
    size: '12 KB',
  },
  {
    id: 'seed-3',
    name: 'medieval-manuscripts-rsl.mp4',
    type: 'video',
    status: 'processing',
    usedIn: ['Medieval manuscripts'],
    uploadDate: '2026-02-18',
    size: '98 MB',
  },
]

export const useMediaLibrary = () => {
  const searchQuery = ref('')
  const selectedMediaId = ref<string | null>(null)
  const mediaFiles = ref<MediaFile[]>(mediaSeed)

  const hydrateFromApi = async (): Promise<void> => {
    try {
      const assets = await workflowApi.listMediaAssets()
      if (assets.length === 0) {
        return
      }

      mediaFiles.value = assets.map((asset) => ({
        id: asset.id,
        name: asset.fileName,
        type: asset.mimeType.includes('vtt') ? 'subtitles' : 'video',
        status: 'ready',
        usedIn: ['Синхронизированные публикации'],
        uploadDate: asset.createdAt.slice(0, 10),
        size: 'n/a',
      }))
    } catch {
      // keep seeded fallback if backend is unavailable
    }
  }

  const filteredMedia = computed(() => {
    return mediaFiles.value.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  const selectedMedia = computed(() => {
    if (!selectedMediaId.value) {
      return null
    }

    return mediaFiles.value.find((item) => item.id === selectedMediaId.value) ?? null
  })

  const selectMedia = (id: string): void => {
    selectedMediaId.value = id
  }

  return {
    searchQuery,
    mediaFiles,
    filteredMedia,
    selectedMedia,
    selectMedia,
    hydrateFromApi,
  }
}
