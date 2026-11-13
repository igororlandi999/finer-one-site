/**
 * Finer One — recetor dos formulários do website (Google Apps Script).
 *
 * Fluxo de cada submissão válida:
 *   1. valida e limpa os dados (os mesmos limites do site);
 *   2. GUARDA a linha na Folha de Cálculo da conta da empresa
 *      (separadores "Lista de espera" e "Finer Pioneers") — o lead nunca se perde;
 *   3. envia um email para NOTIFY_EMAIL com os dados;
 *   4. se o email falhar, a linha fica com Notificação = "Pendente" e a função
 *      resendPending() (acionador de 15 em 15 min) volta a tentar.
 * O site só mostra "sucesso" depois de o passo 2 estar concluído.
 *
 * Instalação: ver SETUP.md nesta pasta. Não contém credenciais nem segredos.
 *
 * Proteções:
 *   - campo-armadilha ("website") e tempo mínimo de preenchimento;
 *   - identificador de submissão: repetir o mesmo envio (duplo clique, nova
 *     tentativa após falha de rede) não cria uma segunda linha nem um segundo email;
 *   - o mesmo email no mesmo formulário só é aceite uma vez a cada 10 minutos;
 *   - limite global por minuto;
 *   - validação e limites de tamanho de todos os campos;
 *   - neutralização de fórmulas (=, +, -, @) para a folha não executar nada;
 *   - lista de espera: o mesmo email não é inscrito duas vezes;
 *   - bloqueio (LockService) para envios simultâneos.
 */

/** Destinatário oficial das notificações. */
var NOTIFY_EMAIL = 'geral.finerone@gmail.com';

var SOURCES = {
  waitlist: {
    sheet: 'Lista de espera',
    subject: 'Finer One — Lista de Espera',
    // O email fica na coluna 3 (verificação de duplicados). Colunas novas vão sempre para o fim.
    headers: ['Data', 'Nome', 'Email', 'Consentimento (versão)', 'Idioma', 'Dimensão da empresa', 'O que quer acompanhar', 'ID', 'Notificação'],
    labels: [['name', 'Nome'], ['email', 'Email'], ['size', 'Dimensão da empresa'], ['interests', 'O que quer acompanhar']],
  },
  pioneers: {
    sheet: 'Finer Pioneers',
    subject: 'Finer One — Finer Pioneer',
    headers: ['Data', 'Nome', 'Empresa', 'Setor', 'Email', 'Principal desafio financeiro', 'Consentimento (versão)', 'Idioma', 'Estado', 'ID', 'Notificação'],
    labels: [['name', 'Nome'], ['email', 'Email'], ['company', 'Empresa'], ['sector', 'Setor de atividade'], ['challenge', 'Principal desafio financeiro']],
  },
};

var LIMITS = { name: 100, company: 120, sector: 80, email: 254, challenge: 1500, size: 40, interests: 200 };
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var MIN_FILL_MS = 3000;
var PER_EMAIL_SECONDS = 600; // o mesmo email, no mesmo formulário, 1 vez a cada 10 minutos
var SUBMISSION_ID_SECONDS = 21600; // um envio repetido com o mesmo ID é reconhecido durante 6 h
var GLOBAL_PER_MINUTE = 30;

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var kind = body.kind;
    var src = SOURCES[kind];
    if (!src) return reply({ ok: false, error: 'invalid' });

    // Robôs: fingir sucesso, não guardar nada.
    if (String(body.website || '').trim() !== '' || !(Number(body.elapsedMs) >= MIN_FILL_MS)) {
      return reply({ ok: true });
    }

    var f = body.fields || {};
    var clean = {
      name: text(f.name, LIMITS.name),
      company: text(f.company, LIMITS.company),
      sector: text(f.sector, LIMITS.sector),
      email: text(f.email, LIMITS.email).toLowerCase(),
      challenge: text(f.challenge, LIMITS.challenge, true),
      size: text(f.size, LIMITS.size),
      interests: text(f.interests, LIMITS.interests),
    };
    var invalid = validate(kind, clean);
    if (invalid) return reply({ ok: false, error: 'invalid', field: invalid });

    var submissionId = text(body.submissionId, 64).replace(/[^A-Za-z0-9-]/g, '');
    var cache = CacheService.getScriptCache();
    var idKey = submissionId ? 'id:' + submissionId : '';
    var emailKey = 'e:' + kind + ':' + clean.email;

    // Mesmo envio repetido (duplo clique, nova tentativa): já está guardado.
    if (idKey && cache.get(idKey)) return reply({ ok: true, duplicate: true });
    // O mesmo email acabado de aceitar: na lista de espera já está inscrito; numa
    // candidatura Pioneers diferente avisamos, em vez de fingir que a guardámos.
    if (cache.get(emailKey)) return reply(kind === 'waitlist' ? { ok: true, duplicate: true } : { ok: false, error: 'duplicate' });

    var minuteKey = 'g:' + Math.floor(Date.now() / 60000);
    var count = Number(cache.get(minuteKey) || 0);
    if (count >= GLOBAL_PER_MINUTE) return reply({ ok: false, error: 'rate' });

    var consent = text(body.consentVersion, 40);
    var lang = text(body.lang, 10);
    var id = submissionId || Utilities.getUuid();
    var sheet, row;

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet = getSheet(kind);
      if (kind === 'waitlist') {
        if (findEmailRow(sheet, clean.email, 3)) {
          remember(cache, idKey, emailKey);
          return reply({ ok: true, duplicate: true }); // já inscrito
        }
        sheet.appendRow([new Date(), safe(clean.name), safe(clean.email), consent, lang, safe(clean.size), safe(clean.interests), id, 'A enviar']);
      } else {
        sheet.appendRow([new Date(), safe(clean.name), safe(clean.company), safe(clean.sector), safe(clean.email), safe(clean.challenge), consent, lang, 'Nova', id, 'A enviar']);
      }
      row = sheet.getLastRow();
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    remember(cache, idKey, emailKey);
    cache.put(minuteKey, String(count + 1), 120);

    // A partir daqui o lead está guardado: uma falha de email não é um erro para o visitante.
    var notified = notify(kind, clean, { id: id, lang: lang, consent: consent, date: new Date() });
    setNotification(sheet, row, src.headers.length, notified);

    return reply({ ok: true, id: id, notified: notified });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

/** Resposta simples a quem abrir o endereço no browser (verificação de que está ativo). */
function doGet() {
  return reply({ ok: true, service: 'finer-one-forms' });
}

function validate(kind, c) {
  if (c.name.length < 2) return 'name';
  if (!EMAIL_RE.test(c.email)) return 'email';
  if (kind === 'waitlist') {
    if (!c.size) return 'size';
    if (!c.interests) return 'interests';
  } else {
    if (c.company.length < 2) return 'company';
    if (!c.sector) return 'sector';
    if (c.challenge.length < 10) return 'challenge';
  }
  return '';
}

function remember(cache, idKey, emailKey) {
  if (idKey) cache.put(idKey, '1', SUBMISSION_ID_SECONDS);
  cache.put(emailKey, '1', PER_EMAIL_SECONDS);
}

/** Envia o email de notificação. Devolve true se o Google aceitou o envio. */
function notify(kind, c, meta) {
  var src = SOURCES[kind];
  try {
    var when = Utilities.formatDate(meta.date, 'Europe/Lisbon', 'dd/MM/yyyy HH:mm');
    var rows = src.labels.map(function (l) { return [l[1], c[l[0]] || '—']; });
    rows.push(['Idioma do site', meta.lang === 'en' ? 'Inglês' : 'Português']);
    rows.push(['Consentimento', 'Aceite (aviso de privacidade ' + (meta.consent || '—') + ')']);
    rows.push(['Data (Lisboa)', when]);
    rows.push(['ID da submissão', meta.id]);

    var plain = src.subject + '\n\n' + rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
      '\n\nRegisto guardado na folha "' + src.sheet + '".';
    var html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#070D2B">' +
      '<h2 style="margin:0 0 4px;font-size:18px">' + esc(src.subject) + '</h2>' +
      '<p style="margin:0 0 16px;color:#5A6280;font-size:13px">Nova submissão recebida pelo website.</p>' +
      '<table cellpadding="8" style="border-collapse:collapse;font-size:14px;max-width:640px">' +
      rows.map(function (r) {
        return '<tr><td style="border-bottom:1px solid #E6EAF2;color:#5A6280;vertical-align:top;white-space:nowrap">' + esc(r[0]) +
          '</td><td style="border-bottom:1px solid #E6EAF2;white-space:pre-wrap">' + esc(r[1]) + '</td></tr>';
      }).join('') +
      '</table><p style="margin:16px 0 0;color:#5A6280;font-size:12px">Registo guardado na folha &quot;' + esc(src.sheet) + '&quot;.</p></div>';

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: src.subject + ' — ' + c.name + (c.company ? ' (' + c.company + ')' : ''),
      body: plain,
      htmlBody: html,
      replyTo: c.email,
      name: 'Website Finer One',
    });
    return true;
  } catch (err) {
    console.error('Notificação falhou: ' + err);
    return false;
  }
}

function setNotification(sheet, row, column, notified) {
  try {
    sheet.getRange(row, column).setValue(notified ? 'Enviada ' + Utilities.formatDate(new Date(), 'Europe/Lisbon', 'dd/MM HH:mm') : 'Pendente');
  } catch (err) {
    console.error(err);
  }
}

/**
 * Volta a enviar as notificações "Pendente" (ou presas em "A enviar" há mais de 10 min).
 * Corre sozinha depois de installTriggers(); também pode ser executada à mão.
 */
function resendPending() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SOURCES).forEach(function (kind) {
    var src = SOURCES[kind];
    var sheet = ss.getSheetByName(src.sheet);
    if (!sheet || sheet.getLastRow() < 2) return;
    var cols = src.headers.length;
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, cols).getValues();
    values.forEach(function (v, i) {
      var state = String(v[cols - 1]);
      var stale = state === 'A enviar' && Date.now() - new Date(v[0]).getTime() > 10 * 60 * 1000;
      if (state !== 'Pendente' && !stale) return;
      var c = kind === 'waitlist'
        ? { name: unsafe(v[1]), email: unsafe(v[2]), size: unsafe(v[5]), interests: unsafe(v[6]) }
        : { name: unsafe(v[1]), company: unsafe(v[2]), sector: unsafe(v[3]), email: unsafe(v[4]), challenge: unsafe(v[5]) };
      var meta = kind === 'waitlist'
        ? { id: v[7], consent: v[3], lang: v[4], date: new Date(v[0]) }
        : { id: v[9], consent: v[6], lang: v[7], date: new Date(v[0]) };
      setNotification(sheet, i + 2, cols, notify(kind, c, meta));
    });
  });
}

/** Executar UMA vez, à mão, no editor: cria o acionador de reenvio (15 em 15 min). */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'resendPending') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('resendPending').timeBased().everyMinutes(15).create();
}

/** Executar à mão no editor para confirmar que o email chega (não grava nada na folha). */
function testNotification() {
  var ok = notify('waitlist', { name: 'Teste interno', email: NOTIFY_EMAIL, size: '—', interests: '—' }, { id: 'teste-' + Date.now(), lang: 'pt', consent: 'teste', date: new Date() });
  console.log(ok ? 'Email de teste enviado para ' + NOTIFY_EMAIL : 'Falhou — ver o registo de execuções');
}

function getSheet(kind) {
  var src = SOURCES[kind];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(src.sheet);
  if (!sheet) {
    sheet = ss.insertSheet(src.sheet);
    sheet.appendRow(src.headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, src.headers.length).setFontWeight('bold');
  } else if (sheet.getLastColumn() < src.headers.length) {
    // Folha criada pela versão anterior: acrescenta os cabeçalhos novos no fim.
    sheet.getRange(1, 1, 1, src.headers.length).setValues([src.headers]).setFontWeight('bold');
  }
  return sheet;
}

function findEmailRow(sheet, email, column) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, column, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).replace(/^'/, '').toLowerCase() === email) return i + 2;
  }
  return 0;
}

/** Limpa caracteres de controlo. Só o texto livre (multiline) mantém as mudanças de linha. */
function text(value, max, multiline) {
  var s = String(value == null ? '' : value).replace(/\r\n?/g, '\n');
  s = multiline ? s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ') : s.replace(/[\u0000-\u001F\u007F]/g, ' ');
  return s.trim().slice(0, max);
}

/** Impede que um valor começado por =, +, - ou @ seja interpretado como fórmula. */
function safe(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function unsafe(value) {
  return String(value == null ? '' : value).replace(/^'/, '');
}

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
