import { computed, ref } from 'vue'
import type { ExhibitSummary } from '../domain/catalog'

const seedExhibits: ExhibitSummary[] = [
  {
    id: 1,
    name: 'Ancient pottery of Neolithic era',
    hall: 'Archaeology',
    status: 'Published',
    hasVideo: true,
    hasSubtitles: true,
    subtitlesType: 'file',
    updated: '2026-02-20',
  },
  {
    id: 2,
    name: 'Medieval manuscripts',
    hall: 'History',
    status: 'OnReview',
    hasVideo: true,
    hasSubtitles: true,
    subtitlesType: 'embedded',
    updated: '2026-02-18',
  },
  {
    id: 3,
    name: '17th century coin collection',
    hall: 'Numismatics',
    status: 'Draft',
    hasVideo: true,
    hasSubtitles: false,
    subtitlesType: null,
    updated: '2026-02-15',
  },
]

export const useExhibitsCatalog = () => {
  const searchQuery = ref('')
  const hallFilter = ref<'all' | string>('all')
  const statusFilter = ref<'all' | ExhibitSummary['status']>('all')

  const exhibits = ref<ExhibitSummary[]>(seedExhibits)

  const halls = computed(() => {
    const names = new Set(exhibits.value.map((exhibit) => exhibit.hall))
    return Array.from(names)
  })

  const filteredExhibits = computed(() => {
    return exhibits.value.filter((exhibit) => {
      const matchesSearch = exhibit.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
      const matchesHall = hallFilter.value === 'all' || exhibit.hall === hallFilter.value
      const matchesStatus =
        statusFilter.value === 'all' || exhibit.status === statusFilter.value

      return matchesSearch && matchesHall && matchesStatus
    })
  })

  return {
    exhibits,
    halls,
    searchQuery,
    hallFilter,
    statusFilter,
    filteredExhibits,
  }
}
