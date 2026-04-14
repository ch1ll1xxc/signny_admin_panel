import { ref } from 'vue'
import type { HallSummary } from '../domain/catalog'

const HALLS_STORAGE_KEY = 'admin_halls'

const hallSeed: HallSummary[] = [
  { id: 1, name: 'Археология', code: 'archaeology', exhibitsCount: 12 },
  { id: 2, name: 'История', code: 'history', exhibitsCount: 8 },
  { id: 3, name: 'Нумизматика', code: 'numismatics', exhibitsCount: 6 },
]

function loadHalls(): HallSummary[] {
  try {
    const raw = localStorage.getItem(HALLS_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as HallSummary[]
  } catch { /* ignore */ }
  return hallSeed
}

function persistHalls(halls: HallSummary[]): void {
  localStorage.setItem(HALLS_STORAGE_KEY, JSON.stringify(halls))
}

export const useHallsManager = () => {
  const halls = ref<HallSummary[]>(loadHalls())

  const createHall = (name: string, code: string): void => {
    const nextId = Math.max(...halls.value.map((hall) => hall.id), 0) + 1
    halls.value.push({ id: nextId, name, code, exhibitsCount: 0 })
    persistHalls(halls.value)
  }

  const updateHall = (id: number, name: string, code: string): void => {
    const hall = halls.value.find((h) => h.id === id)
    if (hall) {
      hall.name = name
      hall.code = code
      persistHalls(halls.value)
    }
  }

  const deleteHall = (id: number): void => {
    halls.value = halls.value.filter((hall) => hall.id !== id)
    persistHalls(halls.value)
  }

  return {
    halls,
    createHall,
    updateHall,
    deleteHall,
  }
}
