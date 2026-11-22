import { defineConfig } from 'vitest/config'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'

export default defineConfig(async () => {
  const migrations = await readD1Migrations('./migrations')
  return {
    plugins: [
      cloudflareTest({
        main: './src/public.ts',
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            TURNSTILE_SECRET: 'segredo-de-teste',
            ALLOWED_ORIGINS: 'https://www.finer-one.com,http://localhost:5173',
            ALLOWED_HOSTNAMES: 'www.finer-one.com',
          },
        },
      }),
    ],
    test: { setupFiles: ['./test/setup.ts'] },
  }
})
