import type { D1Migration } from '@cloudflare/vitest-plugin'

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database
      TEST_MIGRATIONS: D1Migration[]
      TURNSTILE_SECRET: string
      ALLOWED_ORIGINS: string
      ALLOWED_HOSTNAMES: string
    }
  }
}
export {}
