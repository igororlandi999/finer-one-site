/**
 * Notificação interna por email de um pedido do Explorar (só para a equipa Finer One).
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
 * mesma tentativa; (2) a chave de idempotência `explore-<id>` faz o Resend devolver
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
const COLUMNS = 'id, name, email, company, phone, contact_requested, scenario, simulation_id, notify_status, notify_attempts, notify_last_attempt_at'
type Row = {
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

/** Tenta notificar um lead. Nunca lança: o resultado fica registado na linha. */
export async function notifyLead(env: NotifyEnv, id: string): Promise<'sent' | 'pending' | 'failed' | 'skipped'> {
  try {
    if (!configured(env)) {
      await env.DB.prepare("UPDATE explore_leads SET notify_error = 'not_configured' WHERE id = ? AND notify_status = 'pending'").bind(id).run()
      return 'pending'
    }
    const row = await env.DB.prepare(`SELECT ${COLUMNS} FROM explore_leads WHERE id = ?`).bind(id).first<Row>()
    if (!row || row.notify_status !== 'pending' || row.notify_attempts >= MAX_ATTEMPTS) return 'skipped'
    // Reserva a tentativa: se outro processo já a reservou, não envia de novo.
    const claim = await env.DB.prepare('UPDATE explore_leads SET notify_attempts = notify_attempts + 1, notify_last_attempt_at = ? WHERE id = ? AND notify_status = ? AND notify_attempts = ?')
      .bind(new Date().toISOString(), id, 'pending', row.notify_attempts)
      .run()
    if (!claim.meta.changes) return 'skipped'
    const attempt = row.notify_attempts + 1

    let error = ''
    const reply = replyTo(row.email)
    try {
      const res = await fetch(RESEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `explore-${row.id}` },
        body: JSON.stringify({ from: env.NOTIFY_FROM, to: [env.NOTIFY_TO], ...(reply ? { reply_to: [reply] } : {}), subject: subject(row), text: body(row, reply) }),
      })
      if (!res.ok) error = `http_${res.status}`
    } catch {
      error = 'network'
    }

    if (!error) {
      await env.DB.prepare("UPDATE explore_leads SET notify_status = 'sent', notified_at = ?, notify_error = NULL WHERE id = ?").bind(new Date().toISOString(), id).run()
      return 'sent'
    }
    const final = attempt >= MAX_ATTEMPTS
    await env.DB.prepare('UPDATE explore_leads SET notify_status = ?, notify_error = ? WHERE id = ?').bind(final ? 'failed' : 'pending', error, id).run()
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

/** Acionador agendado: reenvia os pedidos por notificar cujo intervalo já passou (mais antigos primeiro). */
export async function retryPending(env: NotifyEnv, now = Date.now()): Promise<number> {
  if (!configured(env)) return 0
  const { results } = await env.DB.prepare("SELECT id, notify_attempts, notify_last_attempt_at FROM explore_leads WHERE notify_status = 'pending' AND notify_attempts < ? ORDER BY created_at LIMIT 100")
    .bind(MAX_ATTEMPTS)
    .all<{ id: string; notify_attempts: number; notify_last_attempt_at: string | null }>()
  // No máximo BATCH envios por execução (plano gratuito: 50 pedidos externos por invocação).
  const ready = results.filter((r) => due(r.notify_attempts, r.notify_last_attempt_at, now)).slice(0, BATCH)
  let sent = 0
  for (const { id } of ready) if ((await notifyLead(env, id)) === 'sent') sent++
  return sent
}

// ---------- Conteúdo ----------
// Só dados de contacto, se pediu contacto da equipa, e o tipo e o identificador da simulação
// (aviso de privacidade v3). Nenhum valor financeiro sai da D1 por email. O aviso só permite
// contactar quem o pediu: o email di-lo de forma explícita.

const SCENARIO = { treasury: 'A minha tesouraria', clients: 'Os meus clientes' } as const

function subject(row: Row) {
  return `Novo lead Explorar — ${row.company} | Finer One`
}

function body(row: Row, reply: string | null): string {
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
