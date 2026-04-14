import { describe, expect, it } from 'vitest'

import { resolveAdminApiBaseUrl } from '@/api/adminApiBaseUrl'

describe('admin API base URL resolution', () => {
  it('does not fallback to localhost for non-localhost browser origin when env is missing', () => {
    const baseUrl = resolveAdminApiBaseUrl({
      envBaseUrl: '',
      browserOrigin: 'https://admin.signny.tuna.am',
    })

    expect(baseUrl).toBe('https://admin.signny.tuna.am')
  })
})
