declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SYNC_URL?: string
  readonly VITE_PUBLIC_SYNC_KEY?: string
  readonly VITE_PUBLIC_CONTOUR_API_BASE_URL?: string
  readonly VITE_PUBLIC_CONTOUR_SYNC_KEY?: string
  readonly VITE_ADMIN_API_URL?: string
  readonly VITE_USE_MOCK_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
