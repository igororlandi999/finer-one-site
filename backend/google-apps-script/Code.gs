/**
 * Finer One — recetor dos formulários do website (Google Apps Script).
 *
 * Guarda as inscrições numa Folha de Cálculo Google da conta da empresa:
 *   - separador "Finer Pioneers"
 *   - separador "Lista de espera"
 *   - separador "Explorar — leads" (pedidos de análise completa do Explore)
 *
 * O Explore NÃO envia valores da simulação — só o tipo de cenário e o horizonte.
 * Fases do lead (coluna "Fase"): captado · pediu_relatorio · pediu_contacto · oportunidade
 * ("oportunidade" é marcada à mão pela equipa).
 *
 * Instalação: ver SETUP.md nesta pasta. Não contém credenciais.
 *
 * Proteções:
 *   - campo-armadilha ("website") e tempo mínimo de preenchimento;
 *   - limite de envios por email e limite global por minuto;
 *   - validação e limites de tamanho de todos os campos;
 *   - neutralização de fórmulas (=, +, -, @) para a folha não executar nada;
 *   - inscrições repetidas na lista de espera não são duplicadas;
 *   - bloqueio (LockService) para envios simultâneos.
 */

var SHEETS = {
  pioneers: { name: 'Finer Pioneers', headers: ['Data', 'Nome', 'Empresa', 'Setor', 'Email', 'Principal desafio financeiro', 'Consentimento (versão)', 'Idioma', 'Estado'] },
  waitlist: { name: 'Lista de espera', headers: ['Data', 'Nome', 'Email', 'Consentimento (versão)', 'Idioma', 'Dimensão da empresa', 'O que quer acompanhar'] },
  explore: { name: 'Explorar — leads', headers: ['Data', 'Última atividade', 'Lead ID', 'Nome', 'Email', 'Empresa', 'País', 'Dimensão', 'Setor', 'Telefone', 'Moeda', 'Origem', 'Tipo de simulação', 'Horizonte (meses)', 'Estado do relatório', 'Fase', 'Contacto comercial', 'Marketing', 'Versão do aviso', 'Idioma', 'Pedidos'] },
};
var SCENARIOS = ['treasury', 'clients'];
var STAGES = ['captado', 'pediu_relatorio', 'pediu_contacto', 'oportunidade'];
var CURRENCIES = ['EUR', 'GBP', 'USD', 'CHF', 'BRL', 'AOA', 'MZN'];

var LIMITS = { name: 100, company: 120, sector: 80, email: 254, challenge: 1500, size: 40, interests: 200, country: 60, phone: 30, role: 80, leadId: 64, scenario: 20, source: 40, marketing: 5, currency: 3, horizon: 1, stage: 20, reportStatus: 20 };
var MIN_FILL_MS = 3000;
var PER_EMAIL_SECONDS = 600; // 1 envio por email a cada 10 minutos
var GLOBAL_PER_MINUTE = 30;

/** Opcional: email da equipa para aviso de nova candidatura Pioneers (vazio = desligado). */
var NOTIFY_EMAIL = '';

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var kind = body.kind;
    if (!SHEETS[kind]) return reply({ ok: false, error: 'invalid' });

    // Robôs: fingir sucesso, não guardar nada.
    if ((body.website || '').toString().trim() !== '' || Number(body.elapsedMs) < MIN_FILL_MS) {
      return reply({ ok: true });
    }

    var f = body.fields || {};
    var clean = {
      name: text(f.name, LIMITS.name),
      company: text(f.company, LIMITS.company),
      sector: text(f.sector, LIMITS.sector),
      email: text(f.email, LIMITS.email).toLowerCase(),
      challenge: text(f.challenge, LIMITS.challenge),
      size: text(f.size, LIMITS.size),
      interests: text(f.interests, LIMITS.interests),
      country: text(f.country, LIMITS.country),
      role: text(f.role, LIMITS.role),
      phone: text(f.phone, LIMITS.phone).replace(/[^\d+ ()-]/g, ''),
      leadId: text(f.leadId, LIMITS.leadId),
      scenario: text(f.scenario, LIMITS.scenario),
      source: text(f.source, LIMITS.source),
      currency: text(f.currency, LIMITS.currency).toUpperCase(),
      horizon: text(f.horizon, LIMITS.horizon),
      stage: text(f.stage, LIMITS.stage),
      reportStatus: text(f.reportStatus, LIMITS.reportStatus),
      contact: text(f.contact, LIMITS.marketing) === 'sim' ? 'sim' : 'não',
      marketing: text(f.marketing, LIMITS.marketing) === 'sim' ? 'sim' : 'não',
    };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email)) return reply({ ok: false, error: 'invalid' });
    if (clean.name.length < 2) return reply({ ok: false, error: 'invalid' });
    if (kind === 'explore') {
      if (!/^[A-Za-z0-9-]{8,64}$/.test(clean.leadId) || clean.company.length < 2 || !clean.country) return reply({ ok: false, error: 'invalid' });
      if (SCENARIOS.indexOf(clean.scenario) < 0 || ['3', '6'].indexOf(clean.horizon) < 0) return reply({ ok: false, error: 'invalid' });
      if (CURRENCIES.indexOf(clean.currency) < 0) clean.currency = 'EUR';
      if (STAGES.indexOf(clean.stage) < 0) clean.stage = 'pediu_relatorio';
      if (clean.phone && clean.phone.replace(/\D/g, '').length < 7) clean.phone = '';
    }
    if (kind === 'pioneers' && (clean.company.length < 2 || !clean.sector || clean.challenge.length < 10)) return reply({ ok: false, error: 'invalid' });

    var cache = CacheService.getScriptCache();
    var emailKey = 'e:' + kind + ':' + clean.email;
    if (cache.get(emailKey)) return reply({ ok: false, error: 'rate' });
    var minuteKey = 'g:' + Math.floor(Date.now() / 60000);
    var count = Number(cache.get(minuteKey) || 0);
    if (count >= GLOBAL_PER_MINUTE) return reply({ ok: false, error: 'rate' });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet(kind);
      var consent = text(body.consentVersion, 40);
      var lang = text(body.lang, 10);

      if (kind === 'explore') {
        saveExploreLead(sheet, clean, consent, lang);
      } else if (kind === 'waitlist') {
        if (emailExists(sheet, clean.email, 3)) return reply({ ok: true }); // já inscrito
        // Colunas novas no fim, para o email continuar na coluna 3 (verificação de duplicados).
        sheet.appendRow([new Date(), safe(clean.name), safe(clean.email), consent, lang, safe(clean.size), safe(clean.interests)]);
      } else {
        sheet.appendRow([new Date(), safe(clean.name), safe(clean.company), safe(clean.sector), safe(clean.email), safe(clean.challenge), consent, lang, 'Nova']);
        if (NOTIFY_EMAIL) {
          MailApp.sendEmail(NOTIFY_EMAIL, 'Nova candidatura Finer Pioneers', clean.name + ' — ' + clean.company + ' (' + clean.sector + ')');
        }
      }
    } finally {
      lock.releaseLock();
    }

    cache.put(emailKey, '1', PER_EMAIL_SECONDS);
    cache.put(minuteKey, String(count + 1), 120);
    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

/** Resposta simples a quem abrir o endereço no browser. */
function doGet() {
  return reply({ ok: true, service: 'finer-one-forms' });
}

function getSheet(kind) {
  var cfg = SHEETS[kind];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(cfg.name);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.name);
    sheet.appendRow(cfg.headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight('bold');
  }
  return sheet;
}

function emailExists(sheet, email, column) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, column, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).replace(/^'/, '').toLowerCase() === email) return true;
  }
  return false;
}

function text(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

/**
 * Explore: um lead por email. Se o email já existir, atualiza a linha (última
 * atividade, cenário, horizonte, fase e contador de pedidos) em vez de duplicar.
 * A fase nunca desce (ex.: quem pediu contacto não volta a "pediu_relatorio").
 */
function saveExploreLead(sheet, c, consent, lang) {
  var now = new Date();
  var row = findRow(sheet, c.email, 5);
  if (row > 0) {
    var cur = sheet.getRange(row, 1, 1, 21).getValues()[0];
    var stage = STAGES.indexOf(c.stage) > STAGES.indexOf(String(cur[15])) ? c.stage : cur[15];
    sheet.getRange(row, 2).setValue(now);
    sheet.getRange(row, 13, 1, 9).setValues([[c.scenario, c.horizon, c.reportStatus || 'pedido', stage, c.contact === 'sim' ? 'sim' : cur[16], c.marketing, consent, lang, Number(cur[20] || 1) + 1]]);
    return;
  }
  sheet.appendRow([now, now, c.leadId, safe(c.name), safe(c.email), safe(c.company), safe(c.country), safe(c.size), safe(c.sector), safe(c.phone), c.currency, safe(c.source || 'Explore Finer One'), c.scenario, c.horizon, c.reportStatus || 'pedido', c.stage, c.contact, c.marketing, consent, lang, 1]);
}

function findRow(sheet, email, column) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var values = sheet.getRange(2, column, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).replace(/^'/, '').toLowerCase() === email) return i + 2;
  }
  return -1;
}

/** Impede que um valor começado por =, +, - ou @ seja interpretado como fórmula. */
function safe(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
