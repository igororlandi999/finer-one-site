// Teste estático do HTML pré-renderizado (corre sobre dist/, depois de `npm run build`).
//
// Para cada página pública confirma: conteúdo dentro de #root, um único h1, texto principal,
// links internos da navegação, canonical correto (uma vez), title e description próprios e sem
// repetição entre páginas, lang pt-PT, sem noindex, guarda de hidratação e <noscript> uma vez,
// e ausência de dados privados (só os endereços de email públicos do site; sem chaves nem recetores).
// Confirma também que o sitemap lista exatamente estas páginas.
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://www.finer-one.com'
const PAGES = {
  '/': 'index.html',
  '/sobre/': 'sobre/index.html',
  '/explorar/': 'explorar/index.html',
  '/pioneers/': 'pioneers/index.html',
  '/lista-espera/': 'lista-espera/index.html',
  '/privacidade/': 'privacidade/index.html',
  '/guias/falta-de-liquidez/': 'guias/falta-de-liquidez/index.html',
  '/guias/prazo-medio-recebimentos/': 'guias/prazo-medio-recebimentos/index.html',
}
// Links que a navegação e o rodapé têm de levar em todas as páginas.
const NAV_LINKS = ['/explorar/', '/sobre/', '/lista-espera/', '/pioneers/', '/privacidade/']
// Endereços de email que podem aparecer no HTML: contacto público, contacto de privacidade e exemplo dos campos.
const PUBLIC_EMAILS = new Set(['info@finer-one.com', 'geral.finerone@gmail.com', 'nome@empresa.pt', 'name@company.com'])
const FORBIDDEN = [/workers\.dev/i, /forms\.example\.test/i, /script\.google\.com\/macros/i, /\bre_[A-Za-z0-9]{12,}/, /RESEND_API_KEY|CONFIRM_FROM|NOTIFY_TO/, /0x4AAAA[A-Za-z0-9_-]{10,}/]

const failures = []
const fail = (page, msg) => failures.push(`${page}: ${msg}`)
const text = (html) => html.replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
const titles = new Map()
const descriptions = new Map()

for (const [path, file] of Object.entries(PAGES)) {
  const full = join(dist, file)
  if (!existsSync(full)) {
    fail(path, `falta ${file} (correr npm run build)`)
    continue
  }
  const html = readFileSync(full, 'utf8')
  const start = html.indexOf('<div id="root">')
  if (start < 0) {
    fail(path, 'sem <div id="root">')
    continue
  }
  const body = html.slice(start)
  const head = html.slice(0, start)

  if (body.startsWith('<div id="root"></div>')) fail(path, '#root vazio (sem pré-renderização)')
  const h1 = body.match(/<h1[\s>]/g) || []
  if (h1.length !== 1) fail(path, `${h1.length} h1 (esperado 1)`)
  const h1Text = text((body.match(/<h1[\s\S]*?<\/h1>/) || [''])[0])
  if (h1Text.length < 10) fail(path, `h1 sem texto ("${h1Text}")`)
  const words = text(body).split(' ').length
  if (words < 150) fail(path, `pouco texto principal (${words} palavras)`)
  const links = new Set([...body.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]))
  for (const l of NAV_LINKS) if (!links.has(l)) fail(path, `falta o link interno ${l}`)
  if (!links.has('/')) fail(path, 'falta o link para a página inicial')

  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1])
  if (canon.length !== 1 || canon[0] !== SITE + path) fail(path, `canonical ${JSON.stringify(canon)} (esperado ${SITE + path})`)
  const title = (head.match(/<title>([^<]*)<\/title>/) || [])[1] || ''
  if (title.length < 15 || title.length > 70) fail(path, `title com ${title.length} caracteres ("${title}")`)
  if (!/Finer One/.test(title)) fail(path, 'title sem "Finer One"')
  if (titles.has(title)) fail(path, `title igual ao de ${titles.get(title)}`)
  titles.set(title, path)
  const desc = (head.match(/name="description"\s+content="([^"]*)"/) || [])[1] || ''
  if (desc.length < 70 || desc.length > 170) fail(path, `description com ${desc.length} caracteres`)
  if (descriptions.has(desc)) fail(path, `description igual à de ${descriptions.get(desc)}`)
  descriptions.set(desc, path)
  if (!/<html lang="pt-PT"/.test(html)) fail(path, 'lang do documento não é pt-PT')
  if (/noindex/i.test(head)) fail(path, 'noindex no documento')
  const og = (head.match(/property="og:url"\s+content="([^"]+)"/) || [])[1]
  if (og && og !== SITE + path) fail(path, `og:url ${og} (esperado ${SITE + path})`)

  const count = (needle) => html.split(needle).length - 1
  if (count("h.classList.add('fo-prehydrate')") !== 1) fail(path, 'guarda de hidratação em falta ou repetida')
  if (count('<noscript><style>#root') !== 1) fail(path, '<noscript> em falta ou repetido')

  for (const email of new Set(html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g) || [])) {
    if (!PUBLIC_EMAILS.has(email)) fail(path, `endereço de email inesperado: ${email}`)
  }
  for (const re of FORBIDDEN) if (re.test(html)) fail(path, `conteúdo que não pode ser publicado: ${re}`)

  console.log(`${path.padEnd(27)} h1="${h1Text.slice(0, 40)}" palavras=${words} links=${links.size} title=${title.length}c description=${desc.length}c`)
}

// Sitemap: exatamente as páginas pré-renderizadas.
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort()
const expected = Object.keys(PAGES).map((p) => SITE + p).sort()
if (JSON.stringify(locs) !== JSON.stringify(expected)) failures.push(`sitemap: ${JSON.stringify(locs)} (esperado ${JSON.stringify(expected)})`)
// Guias: datas sincronizadas e nunca futuras (data de Lisboa).
// - data visível (<time datetime>) = dateModified (Article) = article:modified_time = lastmod do sitemap;
// - datePublished (Article) = article:published_time; publicação ≤ modificação ≤ hoje.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date())
for (const [path, file] of Object.entries(PAGES)) {
  if (!path.startsWith('/guias/') || !existsSync(join(dist, file))) continue
  const html = readFileSync(join(dist, file), 'utf8')
  const pick = (re) => (html.match(re) || [])[1]
  const d = {
    visivel: pick(/<time datetime="([^"]+)"/i),
    datePublished: pick(/"datePublished":\s*"([^"]+)"/),
    dateModified: pick(/"dateModified":\s*"([^"]+)"/),
    ogPublished: pick(/property="article:published_time" content="([^"]+)"/),
    ogModified: pick(/property="article:modified_time" content="([^"]+)"/),
    sitemap: (sitemap.match(new RegExp(`<loc>${SITE}${path}</loc>\\s*<lastmod>([^<]+)</lastmod>`)) || [])[1],
  }
  const missing = Object.entries(d).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length) { fail(path, `datas em falta: ${missing.join(', ')}`); continue }
  if (new Set([d.visivel, d.dateModified, d.ogModified, d.sitemap]).size !== 1) fail(path, `datas de atualização diferentes: ${JSON.stringify(d)}`)
  if (d.datePublished !== d.ogPublished) fail(path, `datas de publicação diferentes: ${JSON.stringify(d)}`)
  if (d.datePublished > d.dateModified) fail(path, `publicação depois da modificação: ${JSON.stringify(d)}`)
  if (d.dateModified > today) fail(path, `data futura (${d.dateModified}; hoje em Lisboa: ${today})`)
  console.log(`${path.padEnd(27)} publicado=${d.datePublished} atualizado=${d.dateModified} (visível, Article, Open Graph e sitemap coincidem)`)
}

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8')
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`) || /Disallow:\s*\/\s*$/m.test(robots)) failures.push('robots.txt: sitemap em falta ou site bloqueado')

if (failures.length) {
  console.error(`\ntest-prerender: ${failures.length} falha(s):\n - ` + failures.join('\n - '))
  process.exit(1)
}
console.log(`\ntest-prerender: ok (${Object.keys(PAGES).length} páginas, sitemap e robots.txt)`)
