const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

interface ResolveAdminApiBaseUrlInput {
  envBaseUrl?: string
  browserOrigin?: string
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveAdminApiBaseUrl(input: ResolveAdminApiBaseUrlInput = {}): string {
  const configured = input.envBaseUrl?.trim()
  if (configured) {
    return trimTrailingSlash(configured)
  }

  const runtimeOrigin =
    input.browserOrigin ??
    (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : undefined)

  if (runtimeOrigin) {
    try {
      const parsed = new URL(runtimeOrigin)
      if (!LOCAL_HOSTNAMES.has(parsed.hostname)) {
        return trimTrailingSlash(runtimeOrigin)
      }
    } catch {
      // ignore malformed runtime origin and fallback to localhost
    }
  }

  return 'http://localhost:4100'
}
