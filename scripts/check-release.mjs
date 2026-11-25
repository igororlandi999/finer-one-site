// Trava de publicação: o site nunca é publicado com o aviso de privacidade em rascunho.
// O workflow de deploy (GitHub Actions) corre `npm run build`; com APPROVED = false em
// src/pages/PrivacyPage.tsx o build falha e o site publicado fica como estava.
// Num build local é só um aviso, para se poder rever a proposta (npm run build / npm run dev).
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../src/pages/PrivacyPage.tsx', import.meta.url), 'utf8')
const approved = /^const APPROVED = (true|false)\b/m.exec(page)?.[1]
const version = /export const PRIVACY_VERSION = '([^']+)'/.exec(readFileSync(new URL('../src/lib/forms.ts', import.meta.url), 'utf8'))?.[1]
const publishing = process.env.GITHUB_ACTIONS === 'true' || process.env.RELEASE === '1'

if (approved === 'true') process.exit(0)
const why = approved === 'false' ? `o aviso de privacidade ${version} está marcado como rascunho (APPROVED = false)` : 'não foi possível ler APPROVED em src/pages/PrivacyPage.tsx'
if (publishing) {
  console.error(`\nPublicação bloqueada: ${why}.\nAprovar o aviso (três fundadores), pôr APPROVED = true e atualizar NOTICE_DATE antes de publicar.\n`)
  process.exit(1)
}
console.warn(`\nAviso: ${why}. Build local permitido; a publicação (GitHub Actions) fica bloqueada.\n`)
