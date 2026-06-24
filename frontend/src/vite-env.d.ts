/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL. 미설정 시 http://localhost:8000 (개발 기본). */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
