import { describe, expect, it } from 'vitest'

import { getAllowedActions, workflowApi } from '@/api/mockWorkflowApi'

describe('workflow transition matrix', () => {
  it('exposes role-based allowed actions for lifecycle statuses', () => {
    expect(getAllowedActions('draft', 'editor')).toEqual(['submit_for_review'])
    expect(getAllowedActions('on_review', 'curator')).toEqual(['approve', 'request_revision'])
    expect(getAllowedActions('approved', 'admin')).toEqual(['publish'])
    expect(getAllowedActions('published', 'editor')).toEqual([])
  })

  it('requires comment when requesting revision', async () => {
    await expect(workflowApi.transitionVersion('v-101-2', 'request_revision', 'curator')).rejects.toThrow(
      'Для возврата на доработку обязателен комментарий',
    )
  })

  it('denies publish transition for non-admin role', async () => {
    await expect(workflowApi.transitionVersion('v-103-1', 'publish', 'curator')).rejects.toThrow(
      'Действие publish недоступно',
    )
  })
})
