/**
 * Notificação interna por email (só para a equipa Finer One) de um pedido do Explorar
 * (tabela explore_leads) e de uma inscrição da Lista de Espera ou do Finer Pioneers
 * (tabela submissions, colunas da migração 0003). O mecanismo é o mesmo para as duas.
 *
 * Serviço: Resend (plano gratuito). Sem domínio verificado, o Resend só entrega no
 * email da própria conta — por isso a conta é criada com o email da equipa e o
 * remetente é o endereço de testes do Resend. Não exige DNS nem meio de pagamento.
 *
 * A notificação é independente da gravação: o lead já está na D1 antes de qualquer
 * tentativa de envio. Cada tentativa fica registada na própria linha (notify_status,
 * notify_attempts, notify_error, notify_last_attempt_at). O acionador agendado
 * (scheduled, de 15 em 15 min) repete as falhas com intervalos crescentes
 * (RETRY_AFTER_MIN: 15 min, 1 h, 4 h, 12 h) até MAX_ATTEMPTS; depois a linha fica
 * 'failed' e identifica-se com uma consulta SQL. Os intervalos cobrem uma quota
 * diária esgotada e terminam antes das 24 h em que o Resend guarda a chave de
 * idempotência. Sem RESEND_API_KEY, os pedidos ficam 'pending' (sem gastar
 * tentativas) e são enviados quando a chave for configurada.
 *
 * Duplicados: (1) cada tentativa é reservada na D1 antes do envio (UPDATE
 * condicional ao número de tentativas lido), por isso dois processos não enviam a
 * mesma tentativa; (2) a chave de idempotência (`explore-<id>`, `waitlist-<id>`,
 * `pioneers-<id>`) faz o Resend devolver
 * o envio original, sem novo email, se uma tentativa chegou ao Resend mas a resposta
 * se perdeu (válida 24 h, segundo a documentação do Resend).
 */
import type { ExploreSimulation } from './explore'
import { logError } from './shared'

export const MAX_ATTEMPTS = 5
/** Espera mínima (minutos) desde a última tentativa, indexada pelo n.º de tentativas já feitas. */
export const RETRY_AFTER_MIN = [0, 15, 60, 240, 720] as const
const RESEND_URL = 'https://api.resend.com/emails'
const BATCH = 20

export interface NotifyEnv {
  DB: D1Database
  /** Chave da API do Resend (wrangler secret put RESEND_API_KEY). */
  RESEND_API_KEY?: string
  /** Destinatário: o email da conta Resend (ex.: geral.finerone@gmail.com). */
  NOTIFY_TO?: string
  /** Remetente (sem domínio verificado: "Finer One <onboarding@resend.dev>"). */
  NOTIFY_FROM?: string
}

/** Só as colunas usadas no email: os valores e resultados da simulação nunca são lidos aqui. */
const EXPLORE_COLUMNS = 'id, name, email, company, phone, contact_requested, scenario, simulation_id, notify_status, notify_attempts, notify_last_attempt_at'
type ExploreRow = {
  id: string
  name: string
  email: string
  company: string
  phone: string | null
  contact_requested: number
  scenario: ExploreSimulation['scenario']
  simulation_id: string
  notify_status: string
  notify_attempts: number
  notify_last_attempt_at: string | null
}

/**
 * Endereço de resposta (Reply-To): só um endereço simples, validado de forma estrita.
 * Sem vírgulas, aspas, <>, espaços, ponto e vírgula nem caracteres de controlo — por isso
 * não é possível injetar cabeçalhos nem acrescentar destinatários. O lead continua aceite
 * pela validação geral; se o endereço não passar aqui, o email sai sem Reply-To.
 */
const REPLY_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/
export function replyTo(email: string): string | null {
  const e = String(email ?? '').trim().toLowerCase()
  if (e.length > 254 || e.split('@')[0].length > 64) return null
  return REPLY_RE.test(e) ? e : null
}

export const configured = (env: NotifyEnv) => !!(env.RESEND_API_KEY && env.NOTIFY_TO && env.NOTIFY_FROM)

/** Tenta notificar um lead do Explorar. Nunca lança: o resultado fica registado na linha. */
export function notifyLead(env: NotifyEnv, id: string): Promise<Outcome> {
  return notifyRow(env, EXPLORE, id)
}

/** Tenta notificar uma inscrição da Lista de Espera ou do Finer Pioneers. Nunca lança. */
export function notifySubmission(env: NotifyEnv, id: string): Promise<Outcome> {
  return notifyRow(env, SUBMISSIONS, id)
}

type Outcome = 'sent' | 'pending' | 'failed' | 'skipped'
type Base = { id: string; email: string; notify_status: string; notify_attempts: number; notify_last_attempt_at: string | null }

/** Uma origem de notificações: tabela, colunas lidas, chave de idempotência e conteúdo. */
interface Source<R extends Base> {
  table: 'explore_leads' | 'submissions'
  columns: string
  key: (row: R) => string
  subject: (row: R) => string
  text: (row: R, reply: string | null) => string
  /** Se devolver um código, a linha fica 'skipped' com esse código e nada é enviado. */
  skip?: (row: R) => string
}

async function notifyRow<R extends Base>(env: NotifyEnv, src: Source<R>, id: string): Promise<Outcome> {
  try {
    if (!configured(env)) {
      await env.DB.prepare(`UPDATE ${src.table} SET notify_error = 'not_configured' WHERE id = ? AND notify_status = 'pending'`).bind(id).run()
      return 'pending'
    }
    const row = await env.DB.prepare(`SELECT ${src.columns} FROM ${src.table} WHERE id = ?`).bind(id).first<R>()
    if (!row || row.notify_status !== 'pending' || row.notify_attempts >= MAX_ATTEMPTS) return 'skipped'
    const reason = src.skip?.(row)
    if (reason) {
      await env.DB.prepare(`UPDATE ${src.table} SET notify_status = 'skipped', notify_error = ? WHERE id = ? AND notify_status = 'pending'`).bind(reason, id).run()
      return 'skipped'
    }
    // Reserva a tentativa: se outro processo já a reservou, não envia de novo.
    const claim = await env.DB.prepare(`UPDATE ${src.table} SET notify_attempts = notify_attempts + 1, notify_last_attempt_at = ? WHERE id = ? AND notify_status = ? AND notify_attempts = ?`)
      .bind(new Date().toISOString(), id, 'pending', row.notify_attempts)
      .run()
    if (!claim.meta.changes) return 'skipped'
    const attempt = row.notify_attempts + 1

    let error = ''
    const reply = replyTo(row.email)
    try {
      const res = await fetch(RESEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': src.key(row) },
        body: JSON.stringify({ from: env.NOTIFY_FROM, to: [env.NOTIFY_TO], ...(reply ? { reply_to: [reply] } : {}), subject: src.subject(row), text: src.text(row, reply) }),
      })
      if (!res.ok) error = `http_${res.status}`
    } catch {
      error = 'network'
    }

    if (!error) {
      await env.DB.prepare(`UPDATE ${src.table} SET notify_status = 'sent', notified_at = ?, notify_error = NULL WHERE id = ?`).bind(new Date().toISOString(), id).run()
      return 'sent'
    }
    const final = attempt >= MAX_ATTEMPTS
    await env.DB.prepare(`UPDATE ${src.table} SET notify_status = ?, notify_error = ? WHERE id = ?`).bind(final ? 'failed' : 'pending', error, id).run()
    logError('notify_failed', new Error(error))
    return final ? 'failed' : 'pending'
  } catch (err) {
    logError('notify_error', err)
    return 'pending'
  }
}

/** Já passou o intervalo desde a última tentativa? (1 min de folga para o atraso do acionador) */
export function due(attempts: number, last: string | null, now = Date.now()): boolean {
  if (!last || attempts <= 0) return true
  const wait = RETRY_AFTER_MIN[Math.min(attempts, RETRY_AFTER_MIN.length - 1)]
  return now - Date.parse(last) >= (wait - 1) * 60_000
}

/**
 * Acionador agendado: reenvia o que está por notificar e cujo intervalo já passou (mais antigos
 * primeiro), primeiro o Explorar e depois a Lista de Espera e o Finer Pioneers. No máximo BATCH
 * envios por execução no total (plano gratuito: 50 pedidos externos por invocação). Uma falha
 * numa origem (por exemplo, migração 0003 ainda não aplicada) não impede a outra.
 */
export async function retryPending(env: NotifyEnv, now = Date.now()): Promise<number> {
  if (!configured(env)) return 0
  let budget = BATCH
  let sent = 0
  for (const src of [EXPLORE, SUBMISSIONS] as Source<Base>[]) {
    if (budget <= 0) break
    try {
      const { results } = await env.DB.prepare(`SELECT id, notify_attempts, notify_last_attempt_at FROM ${src.table} WHERE notify_status = 'pending' AND notify_attempts < ? ORDER BY created_at LIMIT 100`)
        .bind(MAX_ATTEMPTS)
        .all<{ id: string; notify_attempts: number; notify_last_attempt_at: string | null }>()
      const ready = results.filter((r) => due(r.notify_attempts, r.notify_last_attempt_at, now)).slice(0, budget)
      budget -= ready.length
      for (const { id } of ready) if ((await notifyRow(env, src, id)) === 'sent') sent++
    } catch (err) {
      logError('notify_retry_error', err)
    }
  }
  return sent
}

// ---------- Conteúdo ----------
// Só dados de contacto, se pediu contacto da equipa, e o tipo e o identificador da simulação
// (aviso de privacidade v3). Nenhum valor financeiro sai da D1 por email. O aviso só permite
// contactar quem o pediu: o email di-lo de forma explícita.

const SCENARIO = { treasury: 'A minha tesouraria', clients: 'Os meus clientes' } as const

function exploreSubject(row: ExploreRow) {
  return `Novo lead Explorar — ${row.company} | Finer One`
}

function exploreBody(row: ExploreRow, reply: string | null): string {
  return [
    'Novo pedido da análise completa no Explorar.',
    '',
    `Nome: ${row.name}`,
    `Email: ${row.email}`,
    `Empresa: ${row.company}`,
    `Telefone: ${row.phone ?? '—'}`,
    row.contact_requested
      ? 'Pediu contacto da equipa: Sim'
      : 'Pediu contacto da equipa: Não (não contactar comercialmente; o pedido da análise já está registado)',
    `Tipo de simulação: ${SCENARIO[row.scenario] ?? row.scenario}`,
    `ID da simulação: ${row.simulation_id}`,
    '',
    'Os valores e resultados da simulação estão só na base de dados: painel da Cloudflare → D1 → finer-one-forms → tabela explore_leads (procurar pelo ID da simulação).',
    reply
      ? `Para responder ao contacto, use "Responder": a resposta segue para ${reply}. O remetente onboarding@resend.dev é apenas técnico e não recebe respostas.`
      : 'Este email não tem resposta automática (endereço do contacto fora do formato simples): escreva diretamente para o email acima.',
  ].join('\n')
}

const EXPLORE: Source<ExploreRow> = {
  table: 'explore_leads',
  columns: EXPLORE_COLUMNS,
  key: (row) => `explore-${row.id}`,
  subject: exploreSubject,
  text: exploreBody,
}

// ---------- Lista de Espera e Finer Pioneers ----------
// Notificação operacional para a equipa, não inscrição em campanhas. Só os campos pedidos:
// Lista de Espera — nome, email, data, origem e identificador (sem dimensão nem temas);
// Finer Pioneers — nome, email, empresa, setor, desafio, data e identificador; a partir do
// aviso v5, também o telefone e o website indicados na candidatura.

/**
 * Versões do aviso de privacidade que preveem este email interno. O aviso v3 diz que estes
 * formulários NÃO geram email: as inscrições feitas com ele (ou anteriores) ficam 'skipped'.
 * Acrescentar aqui a versão aprovada que passar a prever a notificação (ver proposta v4).
 */
export const SUBMISSION_NOTIFY_CONSENTS: readonly string[] = ['2026-11-v4', '2026-11-v5']

const SUBMISSION_COLUMNS = 'id, kind, created_at, name, email, company, sector, challenge, phone, company_url, consent_version, notify_status, notify_attempts, notify_last_attempt_at'
type SubmissionRow = Base & {
  kind: 'waitlist' | 'pioneers'
  created_at: string
  name: string
  company: string | null
  sector: string | null
  challenge: string | null
  phone: string | null
  company_url: string | null
  consent_version: string
}

const LISBON = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
export function lisbonDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${LISBON.format(d)} (hora de Lisboa)`
}

const dash = (v: string | null) => (v && v.trim() ? v : '—')

function replyLine(reply: string | null) {
  return reply
    ? `Para responder, use "Responder": a resposta segue para ${reply}. O remetente onboarding@resend.dev é apenas técnico e não recebe respostas.`
    : 'Este email não tem resposta automática (endereço fora do formato simples): escreva diretamente para o email acima.'
}

function submissionBody(row: SubmissionRow, reply: string | null): string {
  const where = 'Registo completo: painel da Cloudflare → D1 → finer-one-forms → tabela submissions (procurar pelo identificador).'
  if (row.kind === 'waitlist') {
    return [
      'Nova inscrição na Lista de Espera.',
      '',
      `Nome: ${row.name}`,
      `Email: ${row.email}`,
      `Data da inscrição: ${lisbonDate(row.created_at)}`,
      'Origem: Lista de Espera',
      `Identificador interno: ${row.id}`,
      '',
      'Pelo aviso de privacidade, a Lista de Espera só recebe comunicações de lançamento (sem newsletters nem promoções).',
      where,
      replyLine(reply),
    ].join('\n')
  }
  return [
    'Nova candidatura ao programa Finer Pioneers.',
    '',
    `Nome: ${row.name}`,
    `Email: ${row.email}`,
    `Empresa: ${dash(row.company)}`,
    // Telefone e website: só existem nas candidaturas feitas com o aviso que os prevê (v5).
    ...(row.phone ? [`Telefone: ${row.phone}`] : []),
    ...(row.company_url ? [`Website: ${row.company_url}`] : []),
    `Setor: ${dash(row.sector)}`,
    `Principal desafio financeiro: ${dash(row.challenge)}`,
    `Data da candidatura: ${lisbonDate(row.created_at)}`,
    `Identificador interno: ${row.id}`,
    '',
    'Pelo aviso de privacidade, estes dados servem só para avaliar a candidatura e contactar sobre o programa.',
    where,
    replyLine(reply),
  ].join('\n')
}

const SUBMISSIONS: Source<SubmissionRow> = {
  table: 'submissions',
  columns: SUBMISSION_COLUMNS,
  key: (row) => `${row.kind}-${row.id}`,
  subject: (row) => (row.kind === 'waitlist' ? 'Novo lead Lista de Espera | Finer One' : 'Nova candidatura Finer Pioneers | Finer One'),
  text: submissionBody,
  skip: (row) => (SUBMISSION_NOTIFY_CONSENTS.includes(row.consent_version) ? '' : 'consent_version'),
}
