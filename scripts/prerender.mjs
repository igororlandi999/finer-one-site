// Pré-renderização das páginas públicas (corre depois do `vite build`, em `npm run build`).
//
// Porquê: cada página do site é uma aplicação React e o HTML publicado só trazia
// <div id="root"></div>. Os motores de busca tinham de executar o JavaScript para ver o
// conteúdo, os títulos e os links; quando um ficheiro JS falhava no rastreio, a página ficava
// vazia (verificado no Search Console, inspeção do /explorar/ a 25/11/2026). Aqui o mesmo
// código React gera, no build, o HTML de cada rota, que fica dentro de #root.
//
// No navegador, o React reaproveita este HTML (hydrateRoot) em vez de construir a página do zero:
// a primeira pintura deixa de esperar pelo JavaScript. O que depende do navegador (tamanho do ecrã,
// idioma guardado, movimento reduzido) é lido logo a seguir à hidratação — ver useMediaQuery,
// usePrefersReducedMotion e lib/currentPath. Se a geração falhar, o build falha (não se publica HTML
// incompleto).
import { build } from 'vite'
import { readFile, writeFile, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const out = join(root, 'node_modules', '.prerender')
const MARKER = '<div id="root"></div>'

// Sem JavaScript, os elementos com animação de entrada (motion) ficariam invisíveis (opacity:0 em
// linha). Só se aplica quando o JavaScript está desligado.
const NOSCRIPT = '<noscript><style>#root [style*="opacity:0"]{opacity:1!important}</style></noscript>'

// Guarda até o React hidratar (removida pelo LanguageProvider no fim da hidratação):
//  - formulários: impede escrever, escolher e enviar no HTML pré-renderizado antes de o React estar
//    pronto. Sem isto, o texto escrito ficava no campo mas fora do estado do React (o formulário
//    pedia de novo o nome com o campo preenchido) e um envio antes do JavaScript seria um envio
//    nativo do navegador (campos no endereço). Antes da pré-renderização o formulário nem existia
//    antes do JavaScript, por isso nada se perde face ao comportamento anterior;
//  - visitante com inglês guardado: a página fica invisível até o inglês estar aplicado (nunca vê
//    o HTML em português), com um limite de 4 s caso o JavaScript falhe.
const GUARD = `<script>(function(d){var h=d.documentElement;h.classList.add('fo-prehydrate');try{if(localStorage.getItem('finer-one-lang')==='en'){h.classList.add('fo-lang-wait');setTimeout(function(){h.classList.remove('fo-lang-wait')},4000)}}catch(e){}function g(e){if(!h.classList.contains('fo-prehydrate'))return;var t=e.target;if(!t||!t.closest||!t.closest('#root'))return;var n=t.tagName,y=t.type;if(e.type==='submit'||e.type==='beforeinput'||e.type==='paste'||e.type==='drop'||(e.type==='click'&&(y==='checkbox'||y==='radio'))||(n==='SELECT'&&(e.type==='mousedown'||(e.type==='keydown'&&e.key!=='Tab')))){e.preventDefault()}}['submit','beforeinput','paste','drop','click','mousedown','keydown'].forEach(function(n){d.addEventListener(n,g,true)})})(document)</script><style>.fo-lang-wait #root{visibility:hidden}</style>`

// O simulador do Explorar mostra meses: o HTML gerado aqui tem de usar o mesmo mês do build do
// site (definido em vite.config.ts), para a hidratação coincidir. Usa-se o mês em que o build do
// site escreveu dist/index.html.
process.env.FO_BUILD_MONTH ||= (await stat(join(dist, 'index.html'))).mtime.toISOString().slice(0, 7)

await rm(out, { recursive: true, force: true })
await build({
  root,
  mode: 'production',
  logLevel: 'warn',
  build: { ssr: 'src/ssr/entry-server.tsx', outDir: out, emptyOutDir: true, minify: false, rollupOptions: { output: { format: 'esm', entryFileNames: 'entry-server.mjs' } } },
  ssr: { noExternal: true },
})

const { routes, render } = await import(pathToFileURL(join(out, 'entry-server.mjs')).href)

let done = 0
for (const [path, route] of Object.entries(routes)) {
  const file = join(dist, route.file)
  if (!existsSync(file)) throw new Error(`prerender: falta ${route.file} no build`)
  const html = await readFile(file, 'utf8')
  if (!html.includes(MARKER)) throw new Error(`prerender: ${route.file} não tem ${MARKER}`)
  globalThis.__FO_PRERENDER_PATH__ = path
  let body = render(path)
  if (body.length < 500) throw new Error(`prerender: HTML demasiado curto em ${path} (${body.length} caracteres)`)
  // O React acrescenta <link rel="preload" as="image"> para as imagens da página. As imagens
  // já estão no HTML e são pedidas na leitura; os pré-carregamentos extra só competiam com o
  // JavaScript na rede (medido em mobile lento: LCP pior em /sobre/, /pioneers/ e no guia).
  body = body.replace(/<link rel="preload" as="image"(?![^>]*fetchpriority)[^>]*\/?>/gi, '')
  const h1 = (body.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) throw new Error(`prerender: ${path} tem ${h1} h1 (esperado 1)`)
  const result = html.replace(MARKER, `<div id="root">${body}</div>`).replace('</head>', `    ${GUARD}\n    ${NOSCRIPT}\n  </head>`)
  await writeFile(file, result)
  done++
  console.log(`prerender: ${path} (${Math.round(body.length / 1024)} KB de HTML)`)
}
await rm(out, { recursive: true, force: true })
console.log(`prerender: ${done} páginas geradas`)
