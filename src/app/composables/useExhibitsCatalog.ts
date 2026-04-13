import { computed, onMounted, ref } from 'vue'
import { workflowApi } from '@/api/workflowApi'
import type { ExhibitListItem, VersionStatus } from '@/types/workflow'

type DisplayStatus = 'Опубликовано' | 'На согласовании' | 'Черновик' | 'Согласовано' | 'Доработка' | 'Архив'

const statusDisplay: Record<VersionStatus, DisplayStatus> = {
  published: 'Опубликовано',
  on_review: 'На согласовании',
  draft: 'Черновик',
  approved: 'Согласовано',
  needs_revision: 'Доработка',
  archived: 'Архив',
}

export interface CatalogExhibit {
  id: string
  name: string
  hall: string
  status: DisplayStatus
  rawStatus: VersionStatus
  owner: string
  updated: string
}

export const useExhibitsCatalog = () => {
  const searchQuery = ref('')
  const hallFilter = ref<string>('all')
  const statusFilter = ref<string>('all')
  const exhibits = ref<CatalogExhibit[]>([])
  const isLoading = ref(false)

  const loadExhibits = async () => {
    isLoading.value = true
    try {
      const items: ExhibitListItem[] = await workflowApi.listExhibits()
      exhibits.value = items.map((item) => ({
        id: item.id,
        name: item.title,
        hall: item.expositionTitle,
        status: statusDisplay[item.currentStatus] ?? 'Черновик',
        rawStatus: item.currentStatus,
        owner: item.owner,
        updated: item.updatedAt.slice(0, 10),
      }))
    } finally {
      isLoading.value = false
    }
  }

  const halls = computed(() => {
    const names = new Set(exhibits.value.map((e) => e.hall))
    return Array.from(names)
  })

  const filteredExhibits = computed(() => {
    return exhibits.value.filter((exhibit) => {
      const matchesSearch = exhibit.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesHall = hallFilter.value === 'all' || exhibit.hall === hallFilter.value
      const matchesStatus = statusFilter.value === 'all' || exhibit.status === statusFilter.value
      return matchesSearch && matchesHall && matchesStatus
    })
  })

  onMounted(loadExhibits)

  return {
    exhibits,
    halls,
    searchQuery,
    hallFilter,
    statusFilter,
    filteredExhibits,
    isLoading,
    reload: loadExhibits,
  }
}
