// Teste da hidratação das páginas pré-renderizadas (corre sobre dist/, depois de `npm run build`).
//
// Para cada página e cenário (português/inglês guardado, mobile/desktop, movimento reduzido,
// visitante recorrente), marca os elementos do HTML pré-renderizado no instante em que o
// navegador acaba de ler o documento — antes de o JavaScript correr — e verifica, no fim:
//   - que o React REAPROVEITOU esses elementos (hidratação). Uma reconstrução completa (o React
//     deita fora o HTML e monta tudo de novo) deixa-os fora da página e conta como falha;
//   - que não houve erros de página, console.error, nem avisos de hidratação ("[hydrate]");
//   - que o idioma, o título e o lang do documento ficam corretos.
// Também verifica a navegação entre páginas e campos preenchidos antes da hidratação.
//
// Uso: npm run build && npm run test:hydration
import http from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const dist = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const PAGES = ['/', '/explorar/', '/sobre/', '/lista-espera/', '/pioneers/', '/guias/falta-de-liquidez/', '/guias/prazo-medio-recebimentos/', '/privacidade/']
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' }
const MIN_REUSED = 0.9 // fração mínima de elementos pré-renderizados que têm de continuar na página

if (!existsSync(join(dist, 'index.html'))) {
  console.error('test-hydration: falta dist/. Correr `npm run build` primeiro.')
  process.exit(1)
}

// Servidor estático mínimo (como o GitHub Pages: /pasta/ -> /pasta/index.html, 404 para o resto).
const server = http.createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0].split('#')[0])
  let file = join(dist, path)
  if (!file.startsWith(dist)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) return res.writeHead(404, { 'Content-Type': 'text/html' }).end(existsSync(join(dist, '404.html')) ? readFileSync(join(dist, '404.html')) : '')
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

// Marca os elementos pré-renderizados quando o documento acaba de ser lido (readyState
// "interactive"), antes de os scripts de módulo correrem; regista avisos e erros.
const INSTRUMENT = () => {
  window.__fo = { marked: 0, logs: [], plays: 0 }
  document.addEventListener('readystatechange', () => {
    if (document.readyState !== 'interactive') return
    const root = document.getElementById('root')
    if (!root) return
    for (const el of root.querySelectorAll('*')) el.__foPre = 1
    window.__fo.marked = root.querySelectorAll('*').length
  })
  document.addEventListener('play', () => window.__fo.plays++, true)
}

const SCENARIOS = [
  { name: 'pt-desktop-novo', viewport: { width: 1366, height: 900 } },
  { name: 'pt-mobile-novo', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: 'en-desktop', viewport: { width: 1366, height: 900 }, storage: { 'finer-one-lang': 'en' } },
  { name: 'en-mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storage: { 'finer-one-lang': 'en' } },
  { name: 'reduzido-desktop', viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' },
  { name: 'reduzido-mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
  {
    name: 'recorrente-mobile',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    storage: { 'finer-one-lang': 'pt', 'fo-form-submissions': '[]' },
    session: { 'fo-bar': '0' },
  },
]

const failures = []
const fail = (msg) => failures.push(msg)

async function newContext(browser, sc) {
  const ctx = await browser.newContext({ viewport: sc.viewport, isMobile: !!sc.isMobile, hasTouch: !!sc.hasTouch, reducedMotion: sc.reducedMotion || 'no-preference' })
  await ctx.addInitScript(INSTRUMENT)
  if (sc.storage || sc.session) {
    await ctx.addInitScript(([storage, session]) => {
      try {
        for (const [k, v] of Object.entries(storage || {})) localStorage.setItem(k, v)
        for (const [k, v] of Object.entries(session || {})) sessionStorage.setItem(k, v)
      } catch {}
    }, [sc.storage, sc.session])
  }
  return ctx
}

function watch(page, logs) {
  page.on('console', (m) => {
    const type = m.type()
    if (type === 'error' || type === 'warning') logs.push(`${type}: ${m.text().slice(0, 220)}`)
  })
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message.slice(0, 220)}`))
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.getElementById('root')
    const all = root ? [...root.querySelectorAll('*')] : []
    return {
      marked: window.__fo.marked,
      reused: all.filter((el) => el.__foPre).length,
      total: all.length,
      lang: document.documentElement.lang,
      title: document.title,
      h1: (document.querySelector('h1')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      hidden: getComputedStyle(root).visibility,
      // Estrutura da página (raiz, cabeçalho, conteúdo, rodapé): numa reconstrução completa é toda substituída.
      shell: [root.firstElementChild, root.querySelector('header'), root.querySelector('main'), root.querySelector('footer')].every((el) => el && el.__foPre),
      plays: window.__fo.plays,
    }
  })
}

// Estado final de #root: etiquetas, atributos (incluindo estilos em linha) e texto, mais a posição
// calculada dos elementos de topo. Normaliza só o que difere por natureza entre o HTML gerado no
// build e uma montagem no navegador: sufixos de useId e os <link rel="preload"> que o React
// acrescenta ao gerar HTML.
const SNAPSHOT = () => {
  const out = []
  const norm = (v) => v.replace(/_[rR]_[0-9a-z]+_/g, '_id_')
  // Declarações visualmente neutras que o motion deixa (ou não) em linha conforme o percurso.
  const neutralStyle = (css) => css.split(';').map((d) => d.trim()).filter((d) => d && !/^(opacity: 1|transform: none|transform-origin: .*|will-change: .*)$/.test(d)).join('; ')
  // Progresso da revelação dos títulos (depende do momento em que o título entra no ecrã).
  const neutralClass = (c) => c.replace(/\s*\bfo-title-(in|done)\b/g, '')
  const walk = (n, d) => {
    if (n.nodeType === 3) {
      const t = n.textContent.replace(/\s+/g, ' ').trim()
      if (t) out.push(d + '#' + t)
      return
    }
    if (n.nodeType !== 1) return
    if (n.tagName === 'LINK' && n.getAttribute('rel') === 'preload') return
    // Estilo lido já interpretado pelo navegador (o HTML gerado escreve "a:1", o navegador "a: 1;").
    const attrs = [...n.attributes].filter((a) => !['selected', 'muted'].includes(a.name) && !(a.name === 'style' && !neutralStyle(n.style.cssText))).map((a) => `${a.name}=${norm(a.name === 'style' ? neutralStyle(n.style.cssText) : a.name === 'class' ? neutralClass(a.value) : a.value)}`).sort().join(' ')
    out.push(`${d}${n.tagName} ${attrs}`)
    for (const c of n.childNodes) walk(c, d + ' ')
  }
  const root = document.getElementById('root')
  walk(root, '')
  for (const el of [root.querySelector('header'), root.querySelector('main'), root.querySelector('footer')]) if (el) out.push(`@${el.tagName} position=${getComputedStyle(el).position}`)
  return out
}

// A mesma página sem o HTML pré-renderizado (#root vazio): o React monta tudo do zero, como antes.
async function withoutPrerender(page) {
  await page.route(/\/(index\.html)?(\?.*)?$/, async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue()
    const res = await route.fetch()
    const html = (await res.text()).replace(/<div id="root">[\s\S]*<\/div>(\s*<\/body>)/, '<div id="root"></div>$1')
    await route.fulfill({ response: res, body: html })
  })
}

function diffSnapshots(a, b) {
  const count = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map())
  const ca = count(a), cb = count(b)
  const onlyA = [...ca].filter(([x, n]) => (cb.get(x) || 0) < n).map(([x]) => x.trim())
  const onlyB = [...cb].filter(([x, n]) => (ca.get(x) || 0) < n).map(([x]) => x.trim())
  return { onlyA, onlyB }
}

const browser = await chromium.launch()
const rows = []

for (const sc of SCENARIOS) {
  for (const path of PAGES) {
    const ctx = await newContext(browser, sc)
    const page = await ctx.newPage()
    const logs = []
    watch(page, logs)
    await page.goto(BASE + path, { waitUntil: 'load' })
    await page.waitForTimeout(2500)
    const r = await inspect(page)
    const hydrated = await page.evaluate(SNAPSHOT)
    const ratio = r.marked ? r.reused / r.marked : 0
    const en = sc.storage?.['finer-one-lang'] === 'en'
    const problems = []
    if (!r.marked) problems.push('HTML sem conteúdo pré-renderizado')
    // Português: o HTML coincide com o primeiro render, por isso quase tudo é reaproveitado.
    // Inglês guardado: a hidratação é feita em português e o texto passa a inglês numa atualização
    // normal (que recria parte dos elementos); exige-se a estrutura intacta e nenhuma recuperação.
    if (!r.shell) problems.push('reconstruído (estrutura da página substituída)')
    if (!en && ratio < MIN_REUSED) problems.push(`reconstruído (${r.reused}/${r.marked} elementos reaproveitados)`)
    if (logs.length) problems.push(...logs)
    if (en && r.lang !== 'en') problems.push(`lang=${r.lang} (esperado en)`)
    if (!en && r.lang !== 'pt-PT') problems.push(`lang=${r.lang} (esperado pt-PT)`)
    if (r.hidden !== 'visible') problems.push(`#root continua invisível (${r.hidden})`)
    if (sc.reducedMotion === 'reduce' && r.plays > 0) problems.push(`${r.plays} vídeo(s) arrancaram com movimento reduzido`)
    rows.push(`${problems.length ? 'FALHA' : 'ok   '} ${sc.name.padEnd(18)} ${path.padEnd(27)} reaproveitados ${String(r.reused).padStart(4)}/${String(r.marked).padEnd(4)} lang=${r.lang.padEnd(5)} h1="${r.h1}"`)
    // Referência: a mesma página montada do zero (sem HTML pré-renderizado) tem de acabar igual.
    const ref = await ctx.newPage()
    await withoutPrerender(ref)
    await ref.goto(BASE + path, { waitUntil: 'load' })
    await ref.waitForTimeout(2500)
    const fresh = await ref.evaluate(SNAPSHOT)
    const { onlyA, onlyB } = diffSnapshots(hydrated, fresh)
    if (onlyA.length || onlyB.length) {
      const msg = `estado final diferente da montagem do zero — hidratado: ${JSON.stringify(onlyA.slice(0, 3)).slice(0, 400)} | do zero: ${JSON.stringify(onlyB.slice(0, 3)).slice(0, 400)}`
      problems.push(msg)
      fail(`${sc.name} ${path}: ${msg}`)
      rows[rows.length - 1] = rows[rows.length - 1].replace(/^ok   /, 'FALHA')
    }
    for (const p of problems) if (!p.startsWith('estado final')) fail(`${sc.name} ${path}: ${p}`)
    await ctx.close()
  }
}

// Navegação entre páginas (links reais da navegação e âncoras), com hidratação em cada página.
{
  const ctx = await newContext(browser, SCENARIOS[0])
  const page = await ctx.newPage()
  const logs = []
  watch(page, logs)
  const steps = [
    ['/', 'a[href="/explorar/"]'],
    ['/explorar/', 'a[href="/sobre/"]'],
    ['/sobre/', 'a[href="/lista-espera/"]'],
    ['/lista-espera/', 'a[href="/pioneers/"]'],
    ['/pioneers/', 'a[href="/#precos"]'],
  ]
  await page.goto(BASE + '/', { waitUntil: 'load' })
  for (const [at, link] of steps) {
    await page.waitForTimeout(1200)
    const r = await inspect(page)
    if (r.reused / (r.marked || 1) < MIN_REUSED) fail(`navegação ${at}: reconstruído (${r.reused}/${r.marked})`)
    const a = page.locator(link).first()
    if (!(await a.count())) {
      fail(`navegação ${at}: link ${link} não encontrado`)
      break
    }
    await Promise.all([page.waitForLoadState('load'), a.evaluate((el) => el.click())])
    await page.waitForLoadState('load')
  }
  await page.waitForTimeout(1500)
  const end = await inspect(page)
  const hash = await page.evaluate(() => location.pathname + location.hash)
  if (hash !== '/#precos') fail(`navegação: terminou em ${hash} (esperado /#precos)`)
  if (end.reused / (end.marked || 1) < MIN_REUSED) fail(`navegação /#precos: reconstruído (${end.reused}/${end.marked})`)
  for (const l of logs) fail(`navegação: ${l}`)
  rows.push(`${logs.length ? 'FALHA' : 'ok   '} navegação          / -> explorar -> sobre -> lista-espera -> pioneers -> /#precos`)
  await ctx.close()
}

// Formulários antes da hidratação: o JavaScript é atrasado e o visitante tenta escrever e enviar
// no formulário pré-renderizado. A guarda (scripts/prerender.mjs) tem de impedir a escrita e o envio
// nativo (que poria os campos no endereço); depois da hidratação, o formulário funciona normalmente.
for (const [path, fields, next] of [
  ['/lista-espera/', { '#wl-name': 'Ana Sintética', '#wl-email': 'ana@exemplo-sintetico.pt', '#wl-phone': '912345678' }, '#wl-size-1'],
  ['/pioneers/', { '#pio-name': 'Ana Sintética', '#pio-email': 'ana@exemplo-sintetico.pt', '#pio-phone': '912345678' }, '#pio-company'],
]) {
  const ctx = await newContext(browser, SCENARIOS[0])
  const page = await ctx.newPage()
  const logs = []
  watch(page, logs)
  let release
  const gate = new Promise((r) => (release = r))
  await page.route('**/assets/*.js', async (route) => {
    await gate
    await route.continue()
  })
  // Os scripts de módulo estão retidos: espera só pelo HTML lido (o formulário já está visível).
  await page.goto(BASE + path, { waitUntil: 'commit' })
  await page.waitForFunction(() => document.readyState !== 'loading')
  for (const [sel, value] of Object.entries(fields)) await page.locator(sel).pressSequentially(value, { delay: 5 })
  await page.locator('form button[type=submit]').first().click()
  await page.waitForTimeout(300)
  const before = await page.evaluate((sels) => ({ values: sels.map((x) => document.querySelector(x)?.value ?? null), url: location.pathname + location.search }), Object.keys(fields))
  const typed = before.values.filter(Boolean)
  if (typed.length) fail(`${path}: foi possível escrever antes da hidratação (${typed.join(', ')})`)
  if (before.url !== path) fail(`${path}: envio antes da hidratação navegou para ${before.url}`)
  release()
  await page.waitForLoadState('load')
  await page.waitForFunction(() => !document.documentElement.classList.contains('fo-prehydrate'), null, { timeout: 15000 })
  for (const [sel, value] of Object.entries(fields)) await page.locator(sel).fill(value)
  await page.locator('form button[type=submit]').first().click()
  await page.waitForTimeout(800)
  const advanced = await page.locator(next).count()
  const alerts = await page.locator('form [role=alert]').allTextContents()
  if (!advanced) fail(`${path}: depois da hidratação o formulário não avançou (${alerts.join(' | ') || 'sem mensagem'})`)
  for (const l of logs) fail(`${path} (formulário antes da hidratação): ${l}`)
  const ok = !typed.length && before.url === path && advanced && !logs.length
  rows.push(`${ok ? 'ok   ' : 'FALHA'} form-pré-hidrat.   ${path.padEnd(27)} escrita bloqueada=${!typed.length} sem envio nativo=${before.url === path} depois funciona=${!!advanced}`)
  await ctx.close()
}

// Visitante num mês posterior ao do build: o simulador do Explorar mostra meses. A hidratação
// usa o mês do build (sem diferenças) e o simulador passa logo aos meses do visitante.
{
  const ctx = await newContext(browser, SCENARIOS[1])
  const page = await ctx.newPage()
  const logs = []
  watch(page, logs)
  await page.clock.setFixedTime(new Date('2027-01-15T10:00:00'))
  await page.goto(BASE + '/explorar/', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  const r = await inspect(page)
  const months = await page.evaluate(() => document.getElementById('simulacao')?.innerText || '')
  const ok = r.shell && r.reused / (r.marked || 1) >= 0.8 && !logs.length && /\bfev\b/i.test(months)
  if (!r.shell) fail('mês posterior /explorar/: reconstruído')
  if (!/\bfev\b/i.test(months)) fail('mês posterior /explorar/: o simulador não mostra os meses do visitante (esperado a partir de fev)')
  for (const l of logs) fail(`mês posterior /explorar/: ${l}`)
  rows.push(`${ok ? 'ok   ' : 'FALHA'} mês posterior      /explorar/ (relógio em jan/2027) reaproveitados ${r.reused}/${r.marked}, meses do visitante=${/\bfev\b/i.test(months)}`)
  await ctx.close()
}

// Vídeos, menu, idioma e visitante com inglês guardado (comportamento igual ao site anterior).
{
  const plays = async (sc, path) => {
    const ctx = await newContext(browser, sc)
    const page = await ctx.newPage()
    await page.goto(BASE + path, { waitUntil: 'load' })
    await page.waitForTimeout(3000)
    const v = await page.evaluate(() => [...document.querySelectorAll('video')].filter((x) => !x.paused).map((x) => (x.currentSrc || '').split('/').pop()).sort())
    await ctx.close()
    return v
  }
  const expectPlaying = [
    [SCENARIOS[0], '/', ['hero-demo.mp4', 'hero-earth.mp4']],
    [SCENARIOS[1], '/', ['hero-demo-mobile.mp4']],
    [SCENARIOS[0], '/lista-espera/', []],
    [SCENARIOS[4], '/', []],
    [SCENARIOS[5], '/', []],
  ]
  for (const [sc, path, want] of expectPlaying) {
    const got = await plays(sc, path)
    const ok = JSON.stringify(got) === JSON.stringify(want)
    if (!ok) fail(`vídeos ${sc.name} ${path}: a tocar ${JSON.stringify(got)}, esperado ${JSON.stringify(want)}`)
    rows.push(`${ok ? 'ok   ' : 'FALHA'} vídeos             ${sc.name.padEnd(18)} ${path.padEnd(16)} a tocar=${JSON.stringify(got)}`)
  }

  // Menu mobile e troca de idioma depois da hidratação.
  const ctx = await newContext(browser, SCENARIOS[1])
  const page = await ctx.newPage()
  await page.goto(BASE + '/sobre/', { waitUntil: 'load' })
  await page.waitForFunction(() => !document.documentElement.classList.contains('fo-prehydrate'))
  const menu = page.locator('header button[aria-expanded]').first()
  await menu.click()
  await page.waitForTimeout(600)
  const opened = (await menu.getAttribute('aria-expanded')) === 'true' && (await page.locator('a[href="/explorar/"]:visible').count()) > 0
  if (!opened) fail('menu mobile não abriu depois da hidratação')
  rows.push(`${opened ? 'ok   ' : 'FALHA'} menu mobile        abre depois da hidratação`)
  await page.goto(BASE + '/sobre/', { waitUntil: 'load' })
  await page.waitForFunction(() => !document.documentElement.classList.contains('fo-prehydrate'))
  await page.getByRole('button', { name: /EN|English|Mudar para inglês|Switch/ }).first().click()
  await page.waitForTimeout(600)
  const switched = await page.evaluate(() => [document.documentElement.lang, document.title, localStorage.getItem('finer-one-lang'), document.querySelector('h1').textContent.trim().slice(0, 12)])
  await page.reload({ waitUntil: 'load' })
  await page.waitForTimeout(1500)
  const kept = await page.evaluate(() => [document.documentElement.lang, document.querySelector('h1').textContent.trim().slice(0, 12)])
  const langOk = switched[0] === 'en' && switched[1] === 'About us | Finer One' && switched[2] === 'en' && switched[3].startsWith('No company') && kept[0] === 'en' && kept[1].startsWith('No company')
  if (!langOk) fail(`troca de idioma: ${JSON.stringify({ switched, kept })}`)
  rows.push(`${langOk ? 'ok   ' : 'FALHA'} idioma             PT -> EN guardado e mantido ao recarregar`)
  await ctx.close()

  // Inglês guardado: antes da hidratação a página fica invisível (nunca mostra o português).
  const ctx2 = await newContext(browser, SCENARIOS[2])
  const p2 = await ctx2.newPage()
  let release
  const gate = new Promise((r) => (release = r))
  await p2.route('**/assets/*.js', async (route) => {
    await gate
    await route.continue()
  })
  await p2.goto(BASE + '/', { waitUntil: 'commit' })
  await p2.waitForFunction(() => document.readyState !== 'loading')
  const hiddenBefore = await p2.evaluate(() => getComputedStyle(document.getElementById('root')).visibility)
  release()
  await p2.waitForLoadState('load')
  await p2.waitForTimeout(1500)
  const after = await p2.evaluate(() => [getComputedStyle(document.getElementById('root')).visibility, document.querySelector('h1').textContent.trim().slice(0, 14)])
  const enOk = hiddenBefore === 'hidden' && after[0] === 'visible' && after[1].startsWith('Your company')
  if (!enOk) fail(`inglês guardado: antes=${hiddenBefore} depois=${JSON.stringify(after)}`)
  rows.push(`${enOk ? 'ok   ' : 'FALHA'} inglês guardado    invisível antes da hidratação=${hiddenBefore === 'hidden'}, depois em inglês=${after[1].startsWith('Your company')}`)
  await ctx2.close()
}

// Envio dos três formulários depois da hidratação, com o recetor interceptado (nada sai da
// máquina). Só corre quando o build foi feito com um recetor de teste:
//   VITE_FORMS_ENDPOINT=https://forms.example.test/ npm run build
const testEndpoint = readFileSync(join(dist, 'lista-espera', 'index.html'), 'utf8') && [...new Set((await import('node:fs')).readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('').match(/https:\/\/forms\.example\.test\//g) || [])].length > 0
if (testEndpoint) {
  const submit = async (path, act) => {
    const ctx = await newContext(browser, SCENARIOS[1])
    const page = await ctx.newPage()
    const logs = []
    watch(page, logs)
    const sent = []
    // Turnstile simulado (build com VITE_FORMS_PROVIDER=cloudflare): devolve um token de teste.
    await page.route('https://challenges.cloudflare.com/**', (route) => route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: "window.turnstile={render:function(el,o){setTimeout(function(){o.callback('token-teste')},50);return 'w1'},remove:function(){}}",
    }))
    await page.route('https://forms.example.test/**', async (route) => {
      sent.push(JSON.parse(route.request().postData()))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'teste-local' }) })
    })
    await page.goto(BASE + path, { waitUntil: 'load' })
    await page.waitForFunction(() => !document.documentElement.classList.contains('fo-prehydrate'))
    await act(page)
    await page.waitForTimeout(4500)
    await ctx.close()
    return { sent, logs }
  }
  const forms = [
    ['/lista-espera/', 'waitlist', async (pg) => {
      await pg.fill('#wl-name', 'Ana Sintética'); await pg.fill('#wl-email', 'ana@exemplo-sintetico.pt'); await pg.fill('#wl-phone', '912 345 678')
      await pg.locator('form button[type=submit]').first().click(); await pg.waitForTimeout(600)
      await pg.click('#wl-size-1'); await pg.waitForTimeout(700)
      await pg.click('#wl-interests-0'); await pg.click('#wl-consent')
      await pg.locator('form button[type=submit]').first().click()
    }],
    ['/pioneers/', 'pioneers', async (pg) => {
      await pg.fill('#pio-name', 'Ana Sintética'); await pg.fill('#pio-email', 'ana@exemplo-sintetico.pt'); await pg.fill('#pio-phone', '912 345 678')
      await pg.locator('form button[type=submit]').first().click(); await pg.waitForTimeout(700)
      await pg.fill('#pio-company', 'Empresa Sintética'); await pg.selectOption('#pio-sector', { index: 1 })
      await pg.locator('form button[type=submit]').first().click(); await pg.waitForTimeout(700)
      await pg.fill('#pio-challenge', 'Desafio de tesouraria de teste sintético.'); await pg.click('#pio-consent')
      await pg.locator('form button[type=submit]').first().click()
    }],
    ['/explorar/', 'explore', async (pg) => {
      await pg.getByRole('button', { name: 'Ver a minha análise completa' }).first().click(); await pg.waitForTimeout(900)
      await pg.fill('#lf-name', 'Ana Sintética'); await pg.fill('#lf-email', 'ana@exemplo-sintetico.pt'); await pg.fill('#lf-company', 'Empresa Exemplo'); await pg.fill('#lf-phone', '912 345 678')
      await pg.click('#lf-request')
      await pg.locator('form:has(#lf-name) button[type=submit]').click()
    }],
  ]
  for (const [path, kind, act] of forms) {
    const { sent, logs } = await submit(path, act)
    const b = sent[0]
    const problems = []
    if (sent.length !== 1) problems.push(`${sent.length} envios`)
    if (b && b.kind !== kind) problems.push(`kind=${b.kind}`)
    if (b && !/^\+351 ?912345678$/.test(String(b.fields?.phone))) problems.push(`telefone=${b.fields?.phone}`)
    if (b && b.consentVersion !== '2026-11-v7') problems.push(`aviso=${b.consentVersion}`)
    if (b && process.env.VITE_FORMS_PROVIDER === 'cloudflare' && b.turnstileToken !== 'token-teste') problems.push(`turnstile=${b.turnstileToken}`)
    if (b && kind === 'explore' && (b.fields.contact !== '0' || b.fields.marketing !== '0' || b.fields.privacy !== '1')) problems.push(`consentimentos=${JSON.stringify([b.fields.contact, b.fields.marketing, b.fields.privacy])}`)
    for (const l of logs) problems.push(l)
    for (const pr of problems) fail(`envio ${path}: ${pr}`)
    rows.push(`${problems.length ? 'FALHA' : 'ok   '} envio              ${path.padEnd(16)} kind=${b?.kind} telefone=${b?.fields?.phone} aviso=${b?.consentVersion}`)
  }
} else rows.push('--    envio              (build sem recetor de teste: envio dos formulários não verificado)')

await browser.close()
server.close()

console.log(rows.join('\n'))
if (failures.length) {
  console.error(`\ntest-hydration: ${failures.length} falha(s):\n - ` + failures.join('\n - '))
  process.exit(1)
}
console.log(`\ntest-hydration: ok (${rows.length} verificações)`)
