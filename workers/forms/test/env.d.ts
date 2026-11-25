import type { D1Migration } from '@cloudflare/vitest-plugin'

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database
      TEST_MIGRATIONS: D1Migration[]
      TURNSTILE_SECRET: string
      ALLOWED_ORIGINS: string
      ALLOWED_HOSTNAMES: string
      NOTIFY_TO: string
      NOTIFY_FROM: string
      RESEND_API_KEY?: string
      CONFIRM_FROM?: string
      CONFIRM_REPLY_TO?: string
      CONFIRM_BASE_URL?: string
    }
  }
}
export {}
