import { applyD1Migrations } from 'cloudflare:test'
import { env } from 'cloudflare:workers'

// Cada ficheiro de testes começa com a base de dados D1 local já migrada.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
