/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
