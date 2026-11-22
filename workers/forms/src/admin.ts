/**
 * Finer One — consulta administrativa das inscrições (Cloudflare Worker separado).
 *
 * Está num Worker próprio para que o recetor público nunca exponha rotas de
 * consulta. Todas as rotas /api/* exigem autenticação:
 *   - Cloudflare Access (preferido): o Worker valida também o JWT que o Access
 *     envia (assinatura, audiência, emissor, validade e email autorizado);
 *   - token de administração (alternativa, se o Access não estiver ativo):
 *     segredo com 32+ caracteres, enviado como "Authorization: Bearer".
 * Se o Access estiver configurado, o token não é aceite. Sem nenhum dos dois,
 * tudo é recusado.
 *
 * GET  /                    página mínima (não contém dados)
 * GET  /api/summary         totais por formulário
 * GET  /api/submissions     ?kind=waitlist|pioneers&limit=&offset=
 * GET  /api/export.csv      ?kind=waitlist|pioneers (ou todos)
 * POST /api/delete          { id } | { ids: [...] } | { email }
 * POST /api/status          { id, status }
 */
import { KINDS, type Kind, json, list, logError } from './shared'

export interface Env {
  DB: D1Database
  ACCESS_TEAM_DOMAIN?: string // ex.: finerone.cloudflareaccess.com
  ACCESS_AUD?: string // "Application Audience (AUD) Tag" da aplicação Access
  ADMIN_EMAILS?: string // emails autorizados, separados por vírgulas
  ADMIN_TOKEN?: string // alternativa ao Access (wrangler secret put ADMIN_TOKEN)
}

export const STATUSES = ['nova', 'contactada', 'selecionada', 'nao_selecionada', 'em_programa', 'concluida'] as const
const SECURITY = { 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer' }
const COLUMNS = ['id', 'kind', 'created_at', 'name', 'email', 'company', 'sector', 'challenge', 'size', 'interests', 'lang', 'consent_version', 'status'] as const

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    try {
      if (request.method === 'GET' && url.pathname === '/') return page(env)
      if (!url.pathname.startsWith('/api/')) return json({ ok: false, error: 'not_found' }, 404, SECURITY)

      const auth = await authorize(request, env)
      if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status, SECURITY)

      if (request.method === 'POST' && !sameOriginJson(request, url)) return json({ ok: false, error: 'forbidden' }, 403, SECURITY)

      if (request.method === 'GET' && url.pathname === '/api/summary') return summary(env)
      if (request.method === 'GET' && url.pathname === '/api/submissions') return submissions(env, url)
      if (request.method === 'GET' && url.pathname === '/api/export.csv') return exportCsv(env, url)
      if (request.method === 'POST' && url.pathname === '/api/delete') return remove(env, request, auth.who)
      if (request.method === 'POST' && url.pathname === '/api/status') return setStatus(env, request)
      return json({ ok: false, error: 'not_found' }, 404, SECURITY)
    } catch (err) {
      logError('admin_failed', err)
      return json({ ok: false, error: 'server' }, 500, SECURITY)
    }
  },
} satisfies ExportedHandler<Env>

/* Autenticação */

type Auth = { ok: true; who: string } | { ok: false; status: number; error: string }

export async function authorize(request: Request, env: Env): Promise<Auth> {
  if (env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion')
    if (!jwt) return { ok: false, status: 401, error: 'unauthorized' }
    const claims = await verifyAccessJwt(jwt, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD)
    if (!claims) return { ok: false, status: 403, error: 'forbidden' }
    const email = String(claims.email ?? '').toLowerCase()
    const allowed = list(env.ADMIN_EMAILS).map((e) => e.toLowerCase())
    if (!allowed.length || !allowed.includes(email)) return { ok: false, status: 403, error: 'forbidden' }
    return { ok: true, who: 'access' }
  }
  if (env.ADMIN_TOKEN && env.ADMIN_TOKEN.length >= 32) {
    const header = request.headers.get('Authorization') ?? ''
    const given = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (given && (await timingSafeEqual(given, env.ADMIN_TOKEN))) return { ok: true, who: 'token' }
    return { ok: false, status: 401, error: 'unauthorized' }
  }
  return { ok: false, status: 503, error: 'not_configured' }
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))])
  return crypto.subtle.timingSafeEqual(ha, hb)
}

type JwtClaims = { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string }
let certsCache: { domain: string; at: number; keys: JsonWebKey[] } | null = null

function b64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  return Uint8Array.from(atob(pad), (ch) => ch.charCodeAt(0))
}

export async function verifyAccessJwt(token: string, teamDomain: string, aud: string): Promise<JwtClaims | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  let header: { alg?: string; kid?: string }, claims: JwtClaims
  try {
    header = JSON.parse(new TextDecoder().decode(b64url(parts[0])))
    claims = JSON.parse(new TextDecoder().decode(b64url(parts[1])))
  } catch {
    return null
  }
  if (header.alg !== 'RS256' || !header.kid) return null

  if (!certsCache || certsCache.domain !== teamDomain || Date.now() - certsCache.at > 10 * 60 * 1000) {
    const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`)
    if (!res.ok) return null
    const body = (await res.json()) as { keys?: (JsonWebKey & { kid?: string })[] }
    certsCache = { domain: teamDomain, at: Date.now(), keys: body.keys ?? [] }
  }
  const jwk = (certsCache.keys as (JsonWebKey & { kid?: string })[]).find((k) => k.kid === header.kid)
  if (!jwk) return null

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`))
  if (!valid) return null

  const now = Math.floor(Date.now() / 1000)
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!audiences.includes(aud)) return null
  if (claims.iss !== `https://${teamDomain}`) return null
  if (typeof claims.exp !== 'number' || claims.exp <= now) return null
  if (typeof claims.nbf === 'number' && claims.nbf > now + 60) return null
  return claims
}

/** Pedidos que alteram dados: JSON, cabeçalho próprio e (se presente) a mesma origem — contra CSRF. */
function sameOriginJson(request: Request, url: URL): boolean {
  if (!(request.headers.get('Content-Type') ?? '').startsWith('application/json')) return false
  if (request.headers.get('X-Finer-Admin') !== '1') return false
  const origin = request.headers.get('Origin')
  return !origin || origin === url.origin
}

/* Consultas */

function kindParam(url: URL): Kind | null {
  const k = url.searchParams.get('kind')
  return k && (KINDS as readonly string[]).includes(k) ? (k as Kind) : null
}

async function summary(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT kind, COUNT(*) AS total FROM submissions GROUP BY kind').all<{ kind: Kind; total: number }>()
  const totals = { waitlist: 0, pioneers: 0 }
  for (const r of results) totals[r.kind] = r.total
  return json({ ok: true, totals, total: totals.waitlist + totals.pioneers }, 200, SECURITY)
}

async function submissions(env: Env, url: URL): Promise<Response> {
  const kind = kindParam(url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 500)
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0)
  const stmt = kind
    ? env.DB.prepare(`SELECT ${COLUMNS.join(', ')} FROM submissions WHERE kind = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(kind, limit, offset)
    : env.DB.prepare(`SELECT ${COLUMNS.join(', ')} FROM submissions ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(limit, offset)
  const { results } = await stmt.all()
  return json({ ok: true, rows: results, limit, offset }, 200, SECURITY)
}

/** CSV seguro para Excel/Sheets: aspas escapadas e valores começados por = + - @ neutralizados. */
export function csvCell(value: unknown): string {
  let s = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

async function exportCsv(env: Env, url: URL): Promise<Response> {
  const kind = kindParam(url)
  const stmt = kind
    ? env.DB.prepare(`SELECT ${COLUMNS.join(', ')} FROM submissions WHERE kind = ? ORDER BY created_at`).bind(kind)
    : env.DB.prepare(`SELECT ${COLUMNS.join(', ')} FROM submissions ORDER BY created_at`)
  const { results } = await stmt.all<Record<string, unknown>>()
  const lines = [COLUMNS.join(','), ...results.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','))]
  const name = `finer-one-${kind ?? 'inscricoes'}-${new Date().toISOString().slice(0, 10)}.csv`
  return new Response('﻿' + lines.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'no-store', ...SECURITY },
  })
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const raw = await request.text()
  if (raw.length > 64 * 1024) return null
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  } catch {
    return null
  }
}

async function remove(env: Env, request: Request, who: string): Promise<Response> {
  const body = await readJson(request)
  if (!body) return json({ ok: false, error: 'invalid' }, 400, SECURITY)
  let result: D1Result
  if (typeof body.email === 'string' && body.email.includes('@')) {
    result = await env.DB.prepare('DELETE FROM submissions WHERE email = ?').bind(body.email.trim().toLowerCase()).run()
  } else {
    const ids = (Array.isArray(body.ids) ? body.ids : [body.id]).filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 64)
    if (!ids.length || ids.length > 500) return json({ ok: false, error: 'invalid' }, 400, SECURITY)
    result = await env.DB.prepare(`DELETE FROM submissions WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).run()
  }
  console.log('admin_delete', who, result.meta.changes) // sem dados pessoais
  return json({ ok: true, deleted: result.meta.changes }, 200, SECURITY)
}

async function setStatus(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request)
  const id = typeof body?.id === 'string' ? body.id : ''
  const status = typeof body?.status === 'string' ? body.status : ''
  if (!id || !(STATUSES as readonly string[]).includes(status)) return json({ ok: false, error: 'invalid' }, 400, SECURITY)
  const result = await env.DB.prepare('UPDATE submissions SET status = ? WHERE id = ?').bind(status, id).run()
  return json({ ok: true, updated: result.meta.changes }, 200, SECURITY)
}

/* Página mínima: sem dados no HTML; tudo é pedido às rotas /api com autenticação. */

function page(env: Env): Response {
  const nonce = crypto.randomUUID().replace(/-/g, '')
  const tokenMode = !(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD)
  const html = `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Finer One — Inscrições</title>
<style nonce="${nonce}">body{font:14px/1.5 system-ui,sans-serif;margin:24px;color:#070D2B}h1{font-size:20px}table{border-collapse:collapse;width:100%;margin-top:12px}
td,th{border-bottom:1px solid #E6EAF2;padding:6px 8px;text-align:left;vertical-align:top}th{background:#F7F9FE}button,select,input{font:inherit;padding:4px 8px}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.muted{color:#5A6280}.wrap{white-space:pre-wrap;max-width:420px}.mt{margin-top:8px}</style></head>
<body><h1>Finer One — Inscrições do site</h1>
<div class="bar">${tokenMode ? '<input id="token" type="password" placeholder="Token de administração" autocomplete="off">' : ''}
<select id="kind"><option value="">Todos</option><option value="waitlist">Lista de espera</option><option value="pioneers">Finer Pioneers</option></select>
<button id="load">Atualizar</button><button id="csv">Exportar CSV</button><span id="totals" class="muted"></span></div>
<div class="bar mt"><input id="delEmail" type="email" placeholder="Eliminar todos os registos de um email"><button id="delByEmail">Eliminar</button></div>
<p id="msg" class="muted" role="status"></p><table><thead><tr><th>Data</th><th>Formulário</th><th>Nome</th><th>Email</th><th>Detalhes</th><th>Estado</th><th></th></tr></thead><tbody id="rows"></tbody></table>
<script nonce="${nonce}">
const S=${JSON.stringify(STATUSES)};const $=(id)=>document.getElementById(id);
const headers=()=>{const h={};const t=$('token');if(t&&t.value)h.Authorization='Bearer '+t.value;return h};
const say=(m)=>{$('msg').textContent=m};
async function api(path,opts={}){const r=await fetch(path,{...opts,headers:{...headers(),...(opts.headers||{})}});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||r.status)}return r}
function cell(t,cls){const td=document.createElement('td');td.textContent=t??'';if(cls)td.className=cls;return td}
async function load(){try{const k=$('kind').value;const s=await (await api('/api/summary')).json();$('totals').textContent='Lista de espera: '+s.totals.waitlist+' · Finer Pioneers: '+s.totals.pioneers;
const d=await (await api('/api/submissions?limit=500'+(k?'&kind='+k:''))).json();const tb=$('rows');tb.replaceChildren();
for(const r of d.rows){const tr=document.createElement('tr');tr.append(cell(r.created_at.replace('T',' ').slice(0,16)),cell(r.kind==='waitlist'?'Lista de espera':'Finer Pioneers'),cell(r.name),cell(r.email),
cell(r.kind==='waitlist'?[r.size,r.interests].join(' · '):[r.company,r.sector,r.challenge].join(' · '),'wrap'));
const st=document.createElement('td');const sel=document.createElement('select');for(const o of S){const op=document.createElement('option');op.value=o;op.textContent=o;sel.append(op)}sel.value=r.status;
sel.onchange=async()=>{try{await api('/api/status',{method:'POST',headers:{'Content-Type':'application/json','X-Finer-Admin':'1'},body:JSON.stringify({id:r.id,status:sel.value})});say('Estado atualizado.')}catch(e){say('Erro: '+e.message)}};st.append(sel);tr.append(st);
const del=document.createElement('td');const b=document.createElement('button');b.textContent='Eliminar';b.onclick=async()=>{if(!confirm('Eliminar definitivamente este registo?'))return;try{await api('/api/delete',{method:'POST',headers:{'Content-Type':'application/json','X-Finer-Admin':'1'},body:JSON.stringify({id:r.id})});load()}catch(e){say('Erro: '+e.message)}};del.append(b);tr.append(del);tb.append(tr)}
say(d.rows.length+' registos.')}catch(e){say('Erro: '+e.message)}}
$('load').onclick=load;$('kind').onchange=load;
$('csv').onclick=async()=>{try{const k=$('kind').value;const r=await api('/api/export.csv'+(k?'?kind='+k:''));const u=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=u;a.download=(r.headers.get('Content-Disposition')||'').split('filename=')[1]?.replace(/"/g,'')||'inscricoes.csv';a.click();URL.revokeObjectURL(u)}catch(e){say('Erro: '+e.message)}};
$('delByEmail').onclick=async()=>{const e=$('delEmail').value.trim();if(!e||!confirm('Eliminar definitivamente todos os registos deste email?'))return;try{const r=await (await api('/api/delete',{method:'POST',headers:{'Content-Type':'application/json','X-Finer-Admin':'1'},body:JSON.stringify({email:e})})).json();say(r.deleted+' registo(s) eliminado(s).');load()}catch(x){say('Erro: '+x.message)}};
${tokenMode ? '' : 'load();'}
</script></body></html>`
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; img-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'`,
      'X-Content-Type-Options': 'nosniff',
      ...SECURITY,
    },
  })
}
