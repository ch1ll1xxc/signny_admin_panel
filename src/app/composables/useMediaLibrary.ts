import { computed, ref } from 'vue'
import type { MediaFile } from '../domain/catalog'

const mediaSeed: MediaFile[] = [
  {
    id: 1,
    name: 'ancient-pottery-rsl.mp4',
    type: 'video',
    status: 'ready',
    usedIn: ['Ancient pottery of Neolithic era'],
    uploadDate: '2026-02-20',
    size: '125 MB',
  },
  {
    id: 2,
    name: 'ancient-pottery-subtitles.vtt',
    type: 'subtitles',
    status: 'ready',
    usedIn: ['Ancient pottery of Neolithic era'],
    uploadDate: '2026-02-20',
    size: '12 KB',
  },
  {
    id: 3,
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
  const selectedMediaId = ref<number | null>(null)
  const mediaFiles = ref<MediaFile[]>(mediaSeed)

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

  const selectMedia = (id: number): void => {
    selectedMediaId.value = id
  }

  return {
    searchQuery,
    mediaFiles,
    filteredMedia,
    selectedMedia,
    selectMedia,
  }
}
