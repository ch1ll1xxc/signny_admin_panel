import { ref } from 'vue'
import type { HallSummary } from '../domain/catalog'

const hallSeed: HallSummary[] = [
  { id: 1, name: 'Archaeology', code: 'archaeology', exhibitsCount: 12 },
  { id: 2, name: 'History', code: 'history', exhibitsCount: 8 },
  { id: 3, name: 'Numismatics', code: 'numismatics', exhibitsCount: 6 },
]

export const useHallsManager = () => {
  const halls = ref<HallSummary[]>(hallSeed)

  const createHall = (name: string, code: string): void => {
    const nextId = Math.max(...halls.value.map((hall) => hall.id), 0) + 1
    halls.value.push({ id: nextId, name, code, exhibitsCount: 0 })
  }

  const deleteHall = (id: number): void => {
    halls.value = halls.value.filter((hall) => hall.id !== id)
  }

  return {
    halls,
    createHall,
    deleteHall,
  }
}
