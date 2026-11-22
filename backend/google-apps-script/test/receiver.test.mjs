/**
 * Teste SIMULADO do recetor (Code.gs): corre o script real com imitações dos
 * serviços Google (folha, cache, bloqueio, email). Não envia nada nem toca na
 * conta da empresa. Uso: npm run test:forms
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const code = readFileSync(fileURLToPath(new URL('../Code.gs', import.meta.url)), 'utf8')

function makeEnv({ mailFails = false } = {}) {
  const sheets = {}
  const cache = new Map()
  const mails = []
  const sheetApi = (name) => {
    const rows = []
    sheets[name] = rows
    return {
      rows,
      appendRow: (r) => rows.push([...r]),
      getLastRow: () => rows.length,
      getLastColumn: () => (rows[0] || []).length,
      setFrozenRows() {},
      getRange: (row, col, nRows = 1, nCols = 1) => ({
        setFontWeight() { return this },
        getValue: () => rows[row - 1][col - 1],
        setValue: (v) => { rows[row - 1][col - 1] = v },
        setValues: (vals) => { vals.forEach((r, i) => r.forEach((v, j) => { (rows[row - 1 + i] ||= [])[col - 1 + j] = v })) ; return { setFontWeight() {} } },
        getValues: () => rows.slice(row - 1, row - 1 + nRows).map((r) => r.slice(col - 1, col - 1 + nCols)),
      }),
    }
  }
  const byName = {}
  const env = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: (n) => byName[n] || null, insertSheet: (n) => (byName[n] = sheetApi(n)) }),
      flush() {},
    },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    MailApp: { sendEmail: (m) => { if (mailFails) throw new Error('quota'); mails.push(m) } },
    Utilities: { getUuid: () => 'uuid-' + Math.random().toString(36).slice(2), formatDate: () => '13/11/2026 17:00' },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ setMimeType: () => ({ body: JSON.parse(s) }) }) },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({}) },
    console: { error() {}, log() {} },
  }
  const fn = new Function(...Object.keys(env), code + '\nreturn { doPost, doGet, resendPending };')
  const api = fn(...Object.values(env))
  const post = (payload) => api.doPost({ postData: { contents: JSON.stringify(payload) } }).body
  return { ...api, post, sheets, mails, cache, setMail: (fails) => { env.MailApp.sendEmail = (m) => { if (fails) throw new Error('quota'); mails.push(m) } } }
}

const wl = (over = {}) => ({ kind: 'waitlist', fields: { name: 'Ana Silva', email: 'Ana@Empresa.pt', size: '2 a 9 pessoas', interests: 'Tesouraria, Previsões' }, submissionId: 'wl-1', website: '', elapsedMs: 9000, consentVersion: '2026-11-rascunho', lang: 'pt', ...over })
const pio = (over = {}) => ({ kind: 'pioneers', fields: { name: 'Rui Costa', email: 'rui@empresa.pt', company: 'Costa Lda', sector: 'Comércio', challenge: '=Recebimentos em atraso.\nClientes pagam tarde.' }, submissionId: 'pio-1', website: '', elapsedMs: 12000, consentVersion: '2026-11-rascunho', lang: 'en', ...over })

const exp = (over = {}) => ({ kind: 'explore', fields: { name: 'Marta Lopes', email: 'Marta@Loja.pt', company: 'Loja Lopes', country: 'Portugal', size: '10–49 colaboradores', sector: 'Comércio', phone: '+351 912 345 678', currency: 'eur', scenario: 'treasury', horizon: '6', stage: 'pediu_relatorio', contact: 'não', marketing: 'sim', source: 'Explore Finer One' }, submissionId: 'exp-1', website: '', elapsedMs: 9000, consentVersion: '2026-11-v2', lang: 'pt', ...over })

let passed = 0
const test = (name, f) => { f(); passed++; console.log('  ok  ' + name) }

console.log('Recetor dos formulários (simulado)')

test('lista de espera: guarda, notifica e identifica a origem', () => {
  const e = makeEnv()
  const r = e.post(wl())
  assert.equal(r.ok, true); assert.equal(r.notified, true)
  const rows = e.sheets['Lista de espera']
  assert.equal(rows.length, 2)
  assert.equal(rows[1][2], 'ana@empresa.pt')
  assert.match(rows[1][8], /^Enviada/)
  assert.equal(e.mails.length, 1)
  assert.equal(e.mails[0].to, 'geral.finerone@gmail.com')
  assert.match(e.mails[0].subject, /^Finer One — Lista de Espera — Ana Silva/)
  assert.match(e.mails[0].body, /Tesouraria, Previsões/)
  assert.equal(e.mails[0].replyTo, 'ana@empresa.pt')
})

test('finer pioneer: assunto próprio, dados organizados, fórmula neutralizada, HTML escapado', () => {
  const e = makeEnv()
  const r = e.post(pio({ fields: { ...pio().fields, company: '<b>Costa</b> Lda' } }))
  assert.equal(r.ok, true)
  const row = e.sheets['Finer Pioneers'][1]
  assert.equal(row[5].startsWith("'="), true)
  assert.equal(row[8], 'Nova')
  assert.match(e.mails[0].subject, /^Finer One — Finer Pioneer — Rui Costa/)
  assert.ok(!e.mails[0].htmlBody.includes('<b>Costa'))
  assert.match(e.mails[0].body, /Clientes pagam tarde/)
  assert.equal(e.sheets['Lista de espera'], undefined, 'não mistura origens')
})

test('mesmo envio repetido (duplo clique / nova tentativa) não duplica', () => {
  const e = makeEnv()
  e.post(wl()); const r = e.post(wl())
  assert.equal(r.ok, true); assert.equal(r.duplicate, true)
  assert.equal(e.sheets['Lista de espera'].length, 2); assert.equal(e.mails.length, 1)
})

test('lista de espera: email já inscrito não cria nova linha', () => {
  const e = makeEnv()
  e.post(wl()); e.cache.clear()
  const r = e.post(wl({ submissionId: 'wl-2' }))
  assert.equal(r.ok, true); assert.equal(r.duplicate, true)
  assert.equal(e.sheets['Lista de espera'].length, 2)
})

test('pioneers: segunda candidatura com o mesmo email em 10 min é recusada com aviso', () => {
  const e = makeEnv()
  e.post(pio()); const r = e.post(pio({ submissionId: 'pio-2' }))
  assert.deepEqual(r, { ok: false, error: 'duplicate' })
})

test('email falha depois de guardar: lead mantido como "Pendente" e reenviado', () => {
  const e = makeEnv({ mailFails: true })
  const r = e.post(pio())
  assert.equal(r.ok, true); assert.equal(r.notified, false)
  const row = e.sheets['Finer Pioneers'][1]
  assert.equal(row[10], 'Pendente')
  e.setMail(false); e.resendPending()
  assert.match(row[10], /^Enviada/); assert.equal(e.mails.length, 1)
  assert.match(e.mails[0].body, /=Recebimentos em atraso/)
})

test('validação no servidor: campos em falta ou inválidos são recusados sem guardar', () => {
  const e = makeEnv()
  assert.equal(e.post(wl({ fields: { ...wl().fields, email: 'x@y' } })).error, 'invalid')
  assert.equal(e.post(wl({ fields: { ...wl().fields, size: '' } })).field, 'size')
  assert.equal(e.post(pio({ fields: { ...pio().fields, challenge: 'curto' } })).field, 'challenge')
  assert.equal(e.post({ kind: 'outro' }).error, 'invalid')
  assert.equal(e.mails.length, 0)
})

test('robôs: campo-armadilha ou envio instantâneo fingem sucesso e não guardam', () => {
  const e = makeEnv()
  assert.equal(e.post(wl({ website: 'http://spam' })).ok, true)
  assert.equal(e.post(wl({ elapsedMs: 500, submissionId: 'b' })).ok, true)
  assert.equal(e.post(wl({ elapsedMs: undefined, submissionId: 'c' })).ok, true)
  assert.equal(e.sheets['Lista de espera'], undefined); assert.equal(e.mails.length, 0)
})

test('limite global por minuto', () => {
  const e = makeEnv()
  for (let i = 0; i < 30; i++) e.post(wl({ submissionId: 's' + i, fields: { ...wl().fields, email: `p${i}@a.pt` } }))
  assert.equal(e.post(wl({ submissionId: 'x', fields: { ...wl().fields, email: 'z@a.pt' } })).error, 'rate')
})

test('nome com quebras de linha não chega ao assunto do email', () => {
  const e = makeEnv()
  e.post(wl({ fields: { ...wl().fields, name: 'Ana\r\nBcc: x@y.pt' } }))
  assert.ok(!/[\r\n]/.test(e.mails[0].subject))
})

test('explorar: guarda o pedido no separador próprio, sem valores da simulação, e notifica', () => {
  const e = makeEnv()
  const r = e.post(exp())
  assert.equal(r.ok, true); assert.equal(r.notified, true)
  const rows = e.sheets['Explorar — leads']
  assert.equal(rows.length, 2)
  const row = Object.fromEntries(rows[0].map((h, i) => [h, rows[1][i]]))
  assert.equal(row['Email'], 'marta@loja.pt')
  assert.equal(row['Moeda'], 'EUR')
  assert.equal(row['Tipo de simulação'], 'A minha tesouraria')
  assert.equal(row['Fase'], 'Pediu relatório')
  assert.equal(row['Novidades'], 'Sim')
  assert.equal(row['Estado'], 'Nova')
  assert.match(row['Notificação'], /^Enviada/)
  assert.match(e.mails[0].subject, /^Finer One — Explorar — Marta Lopes \(Loja Lopes\)/)
  assert.equal(e.mails[0].replyTo, 'marta@loja.pt')
})

test('explorar: o mesmo email não duplica e só sobe a fase quando pede contacto', () => {
  const e = makeEnv()
  e.post(exp())
  e.cache.clear()
  const r = e.post(exp({ submissionId: 'exp-2', fields: { ...exp().fields, stage: 'pediu_contacto', contact: 'sim' } }))
  assert.equal(r.ok, true); assert.equal(r.duplicate, true)
  const rows = e.sheets['Explorar — leads']
  assert.equal(rows.length, 2)
  assert.equal(rows[1][11], 'Pediu contacto comercial'); assert.equal(rows[1][12], 'Sim')
  e.cache.clear()
  e.post(exp({ submissionId: 'exp-3' }))
  assert.equal(rows[1][11], 'Pediu contacto comercial')
  assert.equal(e.mails.length, 1)
})

test('explorar: sem empresa, país ou horizonte válido é recusado sem guardar', () => {
  const e = makeEnv()
  assert.equal(e.post(exp({ fields: { ...exp().fields, country: '' } })).ok, false)
  assert.equal(e.post(exp({ submissionId: 'b', fields: { ...exp().fields, company: '' } })).ok, false)
  assert.equal(e.post(exp({ submissionId: 'c', fields: { ...exp().fields, horizon: '12' } })).ok, false)
  assert.equal(e.sheets['Explorar — leads'], undefined)
})

console.log(`\n${passed} testes simulados passaram.`)
