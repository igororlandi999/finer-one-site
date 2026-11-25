# Finer Pioneers — novos campos, verificação de email e email institucional

Proposta e implementação local de 24/11/2026. **Nada foi publicado:** sem commit, push, merge,
migração remota, deploy, DNS ou alteração de segredos. O remetente e o destinatário atuais das
notificações (`NOTIFY_FROM`, `NOTIFY_TO`) não foram tocados.

## 0. Diagnóstico da arquitetura atual

| Peça | Estado encontrado |
| --- | --- |
| Site | Vite multi-página no GitHub Pages; `main` publica sozinho. Recetor escolhido por `VITE_FORMS_PROVIDER`. |
| Recetor | Worker `finer-one-forms` (`workers/forms/src/public.ts`) em `workers.dev`, D1 `finer-one-forms` (UE), cron `*/15`. |
| Tabelas | `submissions` (Lista de Espera + Pioneers; migrações 0001 e 0003) e `explore_leads` (0002). |
| Campos Pioneers | nome, email, empresa, setor, desafio + `lang`, `consent_version`, `status` (avaliação comercial). Sem telefone nem website. |
| Email | Resend, plano gratuito, **sem domínio verificado**: `NOTIFY_FROM = onboarding@resend.dev`, `NOTIFY_TO = geral.finerone@gmail.com`. Só notificações internas; o candidato não recebe nada. |
| Privacidade | Aviso `2026-11-v4`, em vigor. |
| Testes | 104 testes no Worker (o README dizia 78), todos a passar antes das alterações. |

Três pontos que não consegui confirmar a partir do repositório e que convém verificar antes de publicar:

1. **O que está realmente em produção no Worker.** O `CLAUDE.md` diz (22/11) que o site publicado usa
   um recetor "sem email, sem Explorar"; o código local já tem ambos. Confirmar a versão publicada,
   se a migração 0003 foi aplicada e se `RESEND_API_KEY` existe:
   `npx wrangler deployments list`, `npx wrangler d1 migrations list finer-one-forms --remote`,
   `npx wrangler secret list`.
2. **Ramo e PR (verificado a 24/11, 22h).** `main` local = `origin/main` (`aa99d39`). Trabalho no ramo
   `dev/pioneers-verificacao`, sem commit. PR abertas: #10 `dev/seo-correcoes` e #7
   `dev/regressao-formularios-v3`; as PR de SEO #3 e #4 já estão em `main`. A fusão de ensaio deste ramo
   com a #10 e a #7 não tem conflitos; build e 166 testes do Worker passam no resultado.
3. **DNS de finer-one.com:** lido a 24/11 (só leitura) — ver secção 6.

### Turnstile (verificação pedida)

| Pergunta | Resultado |
| --- | --- |
| Token validado no backend? | Sim. `verifyTurnstile` chama `siteverify` com o segredo, o IP e confere o `hostname` devolvido contra `ALLOWED_HOSTNAMES`. |
| Bypass em produção? | Não encontrei. Sem segredo ou sem token → recusa. O endereço alternativo de verificação só é aceite se for `http://localhost`/`127.0.0.1`; a chave de teste `1x00…AA` só existe em `env.dev`. |
| Envios repetidos? | Identificador de submissão idempotente, email único na Lista de Espera, 10 min entre candidaturas Pioneers do mesmo email, 30/min global, 5/hora por navegador, campo-armadilha e tempo mínimo. |
| Erros tratados? | `siteverify` indisponível → 500 genérico (o candidato pode repetir); token recusado → 403 `verification`; no site, mensagem própria. Coberto por testes. |

Conclusão: **não é preciso um segundo Turnstile.** O reenvio de confirmação por email reutiliza o mesmo widget.

Observações (não alterei, para decisão):

- **Corrigido:** o Pioneers já não responde `409 duplicate`. Uma candidatura repetida pelo mesmo email em
  10 minutos recebe a resposta de uma candidatura nova; fica gravada, ligada à primeira em `duplicate_of`
  e sem segundo aviso à equipa. Consulta: `SELECT d.id, d.created_at, d.duplicate_of FROM submissions d
  WHERE d.duplicate_of IS NOT NULL;`
- Por corrigir (fora do pedido): na Lista de Espera, `{ ok, duplicate }` ainda se distingue de `{ ok, id }`
  para quem chamar o recetor diretamente e passar o Turnstile.
- A verificação do identificador repetido acontece antes do Turnstile. O identificador é um UUID
  imprevisível, por isso não é explorável na prática.
- Os limites são globais (sem IP, por opção de privacidade): um atacante que passe o Turnstile pode
  esgotar o limite por minuto e atrasar envios legítimos.

## 1. Arquitetura proposta

```
candidato ─ formulário (telefone + website) ─ POST / ──────────> Worker ── INSERT ──> D1 submissions
                                                                    │  (resposta { ok, id, verification: "pending" })
                                                                    ├─ depois da resposta: notificação interna (como hoje)
                                                                    └─ depois da resposta: email de confirmação ── Resend ──> candidato
candidato ─ abre a ligação ─> www.finer-one.com/pioneers/confirmar/#t=TOKEN   (o fragmento não chega a nenhum servidor)
          ─ carrega em "Confirmar email" ─ POST /verify { token } ─> Worker ─ compara SHA-256 ─> email_status = verified
          ─ ligação expirada / não recebeu ─ POST /resend ─────────> Worker ─ nova ligação (com limites)
cron */15 ─ repete notificações internas e emails de confirmação falhados; limpa ligações e contadores antigos
```

Três estados **independentes** na mesma linha:

| Coluna | Significado | Valores |
| --- | --- | --- |
| `status` | Avaliação comercial (não muda com nada disto) | nova, contactada, selecionada, nao_selecionada, em_programa, concluida |
| `email_status` | O candidato provou que o endereço é dele | not_requested, pending, verified |
| `confirm_status` | O Resend aceitou o email de confirmação | none, pending, sent, failed |

`confirm_status = sent` quer dizer "aceite pelo Resend", não "entregue" nem "confirmado". Só
`email_status = verified` significa endereço confirmado.

Decisões de segurança:

- **Token** de 256 bits (`crypto.getRandomValues`), em base64url. Na D1 fica só o SHA-256.
- **Uso único** e validade de **48 horas**. Confirmar invalida as outras ligações da candidatura.
- **Token no fragmento** (`#t=`), não no caminho nem em parâmetros: não aparece nos registos do GitHub
  Pages, em `Referer` nem em ferramentas de análise. A página remove-o da barra de endereços.
- **Botão + POST**, não ligação GET: os filtros de email que abrem ligações não gastam a ligação.
- **Sem enumeração:** o reenvio por email responde sempre `{ ok: true }` e trabalha depois da resposta.
  `/verify` nunca devolve dados da candidatura nem o estado de avaliação.
- **Limites:** 60/min em `/verify`, 10/min em `/resend`, 3 reenvios por candidatura com 10 minutos de
  intervalo, 4 emails por endereço em 24 h, Turnstile no reenvio por email.
- **O email não leva texto escrito no formulário** (nem nome, nem empresa): o formulário não serve
  para enviar conteúdo a endereços de terceiros.
- **Logs:** só nomes de erro. Nem token, nem email. (Os logs do Worker continuam desligados.)
- **Nunca perder candidaturas:** a linha é gravada antes de qualquer email; falhas do Resend ficam na
  linha e são repetidas (15 min, 1 h, 4 h, 12 h). Se a migração 0004 faltar, o Worker grava com as
  colunas antigas em vez de falhar.
- **Dormente por omissão:** sem `CONFIRM_FROM` não sai nenhum email ao candidato, e a candidatura fica
  `not_requested` — exatamente o comportamento de hoje. Um `CONFIRM_FROM` mal formado ou em `resend.dev`
  também deixa a confirmação desligada (`confirmFrom` em `verify.ts`).
- **Confirma-se o endereço:** confirmar vale para todas as candidaturas Pioneers desse email que estavam
  por confirmar (por exemplo, uma repetida).
- **Trava de publicação:** `npm run build` falha no GitHub Actions enquanto o aviso estiver em rascunho
  (`scripts/check-release.mjs`); o site publicado fica como estava.

Explorar e Lista de Espera: sem alterações de comportamento (testado).

## 2. Migração D1

`workers/forms/migrations/0004_pioneers_verification.sql` — só acrescenta:

- em `submissions`: `phone`, `company_url`, `duplicate_of`, `email_status`, `email_verified_at`, `confirm_status`,
  `confirm_attempts`, `confirm_error`, `confirm_last_attempt_at`, `confirm_sent_at`, `confirm_resends`,
  `confirm_last_resend_at`;
- tabela `email_tokens` (hash, candidatura, criação, validade, uso; apaga em cascata com a candidatura);
- tabela `rate_counters` (rota, minuto, contagem; sem IP).

As linhas existentes ficam `not_requested` / `none`: continuam válidas e não recebem email retroativo.
O Worker atual continua a funcionar com as colunas novas, por isso a migração aplica-se **antes** do
deploy. Verificado numa base com linhas anteriores: dados intactos e `INSERT` antigo aceite.

## 3. Novos endpoints (mesmo Worker, mesma origem autorizada)

| Rota | Corpo | Respostas |
| --- | --- | --- |
| `POST /` (existente) | Pioneers passa a aceitar `fields.phone` (obrigatório com o aviso v5) e `fields.companyUrl` (opcional) | como antes, mais `verification: "pending"` quando um email de confirmação foi posto em fila |
| `POST /verify` | `{ token }` | `200 { ok, status: "verified" }` · `200 { …, already: true }` · `410 expired` · `404 invalid` · `429 rate` |
| `POST /resend` | `{ token }` (ligação expirada) ou `{ email, turnstileToken }` | `200 { ok: true }` sempre que o pedido é aceite · `403 verification` · `429 rate` · `503 unavailable` |

Um `GET /verify` devolve 405 e não confirma nada.

Validação: telefone em formato internacional (7 a 15 dígitos); para `+351`, nove dígitos começados por
2, 3 ou 9. Website: só `http(s)`, com domínio; recusa `javascript:`, credenciais, portas, IP e `localhost`.
Páginas antigas em cache (aviso v4, sem telefone) continuam a ser aceites, sem os campos novos.

Variáveis novas (não são segredos): `CONFIRM_BASE_URL` (já no `wrangler.jsonc`), `CONFIRM_FROM` e
`CONFIRM_REPLY_TO` (comentadas, para ativar mais tarde). Nenhum segredo novo.

## 4. Alterações de frontend

- `src/pages/PioneersPage.tsx`: passo 1 com **contacto telefónico** (indicativo + número); passo 2 com
  **website** opcional; ecrã final com "Candidatura: recebida" e "Email: confirmação pendente" quando o
  recetor confirma que pôs o email em fila. Sem essa indicação, mostra a mensagem de sempre.
- `src/pages/PioneersConfirmPage.tsx` + `pioneers/confirmar/index.html` (`noindex`, `no-referrer`), só gerada com
  `VITE_PIONEERS_EMAIL_VERIFICATION=on` (desligada por omissão: a página não é publicada):
  confirmação pendente, a confirmar, email confirmado, já confirmado, ligação expirada, ligação inválida,
  erro, pedir nova ligação, reenvio solicitado, indisponível. PT-PT e EN.
- `src/lib/forms.ts`: `verifyEmail`, `requestConfirmationLink`, `PRIVACY_VERSION = 2026-11-v5`.
- `src/lib/contactFields.ts`, `src/config/contact.ts`, entrada em `vite.config.ts` e título EN.

Rever os estados em `npm run dev`: `/pioneers/confirmar/?estado=expired` (ou `ready`, `verified`,
`already`, `invalid`, `error`, `request`, `requested`, `unavailable`) e `/pioneers/?estado=pendente`.

## 5. Fluxo completo

1. O candidato envia a candidatura. O Worker valida, passa o Turnstile e **grava**.
2. Resposta imediata `{ ok, id, verification: "pending" }`. O site mostra "Candidatura recebida" e
   "Confirmação pendente".
3. Fora da resposta: notificação interna (inalterada) e email de confirmação no idioma da candidatura.
4. O candidato abre a ligação, carrega em "Confirmar email". O Worker confere o hash, a validade e o uso.
5. `email_status = verified`, com data. `status` não muda.
6. Ligação expirada → "Enviar nova ligação" (um clique). Não recebeu → `/pioneers/confirmar/`, escreve o
   email, Turnstile, resposta neutra.
7. Resend em falha → candidatura intacta, nova tentativa automática; ao fim de 5, `confirm_status = failed`.

Recuperação manual (painel D1):

```sql
-- Candidaturas por estado de verificação
SELECT created_at, name, email, phone, status, email_status, confirm_status, confirm_error
FROM submissions WHERE kind = 'pioneers' ORDER BY created_at DESC;

-- Voltar a enviar o email de confirmação (o acionador envia nos 15 min seguintes)
UPDATE submissions SET confirm_status = 'pending', confirm_attempts = 0, confirm_error = NULL
WHERE id = 'ID' AND email_status = 'pending';

-- Contacto confirmado por outra via (por exemplo, por telefone)
UPDATE submissions SET email_status = 'verified', email_verified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = 'ID';
```

## 6. Domínio, Resend e info@finer-one.com

### DNS atual de finer-one.com (leitura a 24/11/2026, via DNS público; nada foi alterado)

| Registo | Valor | Leitura |
| --- | --- | --- |
| NS | `dns1`–`dns4.host-redirect.com` | DNS gerido no fornecedor do domínio (não na Cloudflare) |
| A (raiz) | `185.199.108–111.153` | GitHub Pages |
| MX (raiz) | `10 receive-sae1.forge.rmta.net` | **Receção do Resend** (Resend Receiving) — não é Google nem Microsoft |
| TXT `resend._domainkey` | chave DKIM presente | DKIM do Resend publicado |
| CNAME `send` | `send.forge.rmta.net` | SPF/Return-Path do Resend publicado |
| TXT `_dmarc` | `v=DMARC1; p=none;` | DMARC em modo de observação, sem endereço de relatórios |
| TXT (raiz) | só `google-site-verification` | sem SPF na raiz (não é preciso para o Resend) |

Conclusão: **o domínio já tem os registos de envio e de receção do Resend.** O que não se vê no DNS, e
tem de ser confirmado no painel do Resend (só leitura): se `finer-one.com` aparece como *verified* para
envio e para receção, em que conta, e para onde vai o correio recebido (caixa/inbox do Resend, webhook ou
reencaminhamento). Sem um destino configurado, o correio para `info@` é aceite pelo Resend mas ninguém o lê.

Com `onboarding@resend.dev` o Resend só entrega no email da própria conta; para enviar ao candidato o
remetente tem de ser do domínio verificado. Até `CONFIRM_FROM` existir, o código fica dormente.

O que é preciso, por esta ordem:

1. **Confirmar no painel do Resend** o estado do domínio (envio e receção *verified*) e a conta a que
   pertence — tem de ser a mesma da `RESEND_API_KEY` do Worker.
2. **Dar um destino legível a `info@`.** O MX já entrega no Resend; falta garantir que alguém lê: uma
   caixa no Resend, ou um reencaminhamento para `geral.finerone@gmail.com`. Decidir também como a equipa
   **responde como** `info@` (hoje respondem do Gmail).
3. **DMARC:** já existe em `p=none`. Acrescentar `rua=mailto:…` para receber relatórios e só endurecer
   para `quarantine`/`reject` depois de relatórios limpos. É uma alteração de DNS: fica para autorização.
4. **Testar** `info@` nos dois sentidos: enviar de fora e confirmar que chega a uma pessoa; enviar pelo
   Resend como `info@finer-one.com` para Gmail e Outlook e ver SPF, DKIM e DMARC a passar, fora do spam.
5. Só então: `CONFIRM_FROM = "Finer One <info@finer-one.com>"` e `CONFIRM_REPLY_TO = "info@finer-one.com"`.
6. Numa etapa separada e posterior: `NOTIFY_FROM` e `NOTIFY_TO`.

Notas sobre o passo 6 (não feito):

- Mudar `NOTIFY_TO` sem mudar `NOTIFY_FROM` falha (403): `resend.dev` só entrega na conta.
- `notify.ts` tem a frase "O remetente onboarding@resend.dev é apenas técnico" em dois sítios, e três
  testes fixam remetente e destinatário. Mudam juntos.
- O **Reply-To** das notificações internas é o email do lead, e deve continuar. O Reply-To do email ao
  candidato é a caixa da equipa.
- Os três formulários (Explorar, Lista de Espera, Pioneers) partilham `NOTIFY_*`: a troca afeta os três.
- Plano gratuito do Resend: 100 emails/dia, 3 000/mês, 1 domínio. Notificações internas e confirmações
  contam para o mesmo limite.

Referências **públicas** a `geral.finerone@gmail.com` (substituir só depois do passo 4):

| Ficheiro | Onde |
| --- | --- |
| `index.html:47` | JSON-LD da organização |
| `src/components/footer/SiteFooter.tsx:28` | rodapé de todas as páginas |
| `src/pages/PrivacyPage.tsx:29` | contacto do aviso (e as frases sobre a "conta Gmail", linhas ~105 e ~232, que deixam de ser verdade) |
| `src/pages/WaitlistPage.tsx:53, 99` | mensagem de formulário indisponível |
| `src/config/contact.ts` | Pioneers e página de confirmação (já centralizado) |
| `src/pages/PioneersPageClassic.tsx`, `WaitlistPageClassic.tsx` | variantes só de desenvolvimento |

Referências internas (não públicas): `wrangler.jsonc` (`NOTIFY_TO`), `wrangler.admin.jsonc`
(`ADMIN_EMAILS` — é identidade de login, não mudar), `Code.gs`, `SETUP.md`, READMEs e testes.

## 7. Privacidade

O aviso v4 **não cobre**: o telefone e o website no Pioneers, o envio de um email ao candidato, o estado
de verificação e a conservação das ligações. Proposta v5 aplicada em `PrivacyPage.tsx` (PT e EN), com
`APPROVED = false` — a página mostra "Rascunho em revisão" até os três fundadores aprovarem:

- alínea b): dados passam a incluir contacto telefónico e, opcionalmente, website; registo de se e quando
  o email foi confirmado; finalidade inclui confirmar o endereço e contactar por email ou telefone;
- novo ponto "Confirmação do email": ligação pessoal, uso único, 48 horas, reenvios limitados, sem dados
  da candidatura, sem inscrição em listas; guarda-se só um código irreversível, eliminado até 30 dias
  depois de expirar; confirmar não é decisão sobre a candidatura;
- alínea d): o Turnstile também é usado no pedido de nova ligação;
- "Onde ficam os dados", "Transferências" e "Eliminação": o Resend passa a enviar também o email de
  confirmação; a notificação interna do Pioneers inclui telefone e website.

Prazos de conservação: inalterados (os campos novos são eliminados com a candidatura).
Ao aprovar: `APPROVED = true` e atualizar `NOTICE_DATE`. Os candidatos **não** são adicionados a nenhuma
campanha: o email é transacional e único por pedido.

Quando o contacto passar a `info@`, o aviso precisa de nova revisão (caixa e fornecedor de correio).

## 8. Testes e riscos

Worker: `npm test` em `workers/forms` — **163 testes** (104 anteriores + 59 novos), `tsc` limpo.
Cobrem: campos novos e validação, página antiga em cache, email só com hash na base, PT/EN, falha do
Resend sem perda, repetição pelo cron, uso único, pedidos simultâneos, expiração, tokens adulterados,
ausência de dados pessoais nas respostas e nos logs, não enumeração, limites, candidaturas existentes e
Worker publicado antes da migração.

Site (sobre `origin/main` + estas alterações): `npm ci`, `npm run lint` (tsc) e `npm run build` completo
sem erros; `npm run test:forms` 14/14. Formulário e página de confirmação exercitados num navegador em
1280 px e 390 px, em PT-PT e EN, com o recetor simulado: nenhum pedido antes do clique, token só no corpo
do POST, fragmento removido do endereço, sem erros de página nem deslocamento horizontal.

Não testado: envio real pelo Resend, entregabilidade, DNS, e o fluxo ponta a ponta em produção.

| Risco | Mitigação |
| --- | --- |
| Domínio novo cai em spam | SPF/DKIM/DMARC, texto simples + HTML sóbrio, volume baixo; testar com Gmail e Outlook |
| Limite de 100 emails/dia | máximo de 4 por endereço/dia; falhas ficam em fila e repetem |
| Candidato não confirma | a candidatura é válida na mesma; a equipa vê `email_status = pending` |
| Reversão para o Google Apps Script | o recetor Google não conhece telefone, website nem verificação |
| Limites globais sem IP | um abuso pode atrasar pedidos legítimos; não perde candidaturas |
| Aviso v5 publicado sem aprovação | `APPROVED = false` mostra "Rascunho"; não fazer merge antes |

## 9. Deploy e rollback (cada passo precisa de autorização)

Pré-requisitos: aviso v5 aprovado pelos três fundadores; para o passo 6, domínio verificado e `info@` a funcionar.

1. No ramo `dev/pioneers-verificacao`: `npm run build`, `npm run test:forms`, `npm run test:workers`, commit.
   Fundir primeiro as PR #10 e #7 em `main` (sem conflitos com este ramo) e atualizar o ramo.
2. Cópia de segurança: `npx wrangler d1 export finer-one-forms --remote --output backup.sql` e anotar
   `npx wrangler d1 time-travel info finer-one-forms`.
3. Migração: `npx wrangler d1 migrations apply finer-one-forms --remote`. O Worker atual continua a funcionar.
4. Worker: `npx wrangler deploy` (em `workers/forms`). Sem `CONFIRM_FROM`, comportamento igual ao de hoje.
   Testar os três formulários com dados fictícios e apagar as linhas.
5. Site: só depois da aprovação do aviso (`APPROVED = true`, `NOTICE_DATE`), PR → `main`. Com o aviso em
   rascunho o build do GitHub Actions falha de propósito e nada é publicado. O telefone passa a ser pedido;
   ainda sem email ao candidato.
6. Ativar a verificação (nesta ordem): variável `VITE_PIONEERS_EMAIL_VERIFICATION=on` no GitHub e publicar
   o site (passa a existir `/pioneers/confirmar/`); rever a v5 (o texto da verificação está no condicional);
   só depois descomentar `CONFIRM_FROM` / `CONFIRM_REPLY_TO`, `npx wrangler deploy`,
   candidatura de teste com um email dos fundadores, confirmar a ligação, apagar a linha.
7. Mais tarde, em separado: `NOTIFY_FROM` / `NOTIFY_TO` e as referências públicas ao email.

Rollback, do mais leve para o mais pesado:

- **Desligar só a verificação:** retirar `CONFIRM_FROM` e publicar. As candidaturas continuam a entrar.
- **Worker:** painel → Workers → `finer-one-forms` → Deployments → versão anterior → Rollback. O código
  antigo funciona com as colunas novas. Depois, confirmar `TURNSTILE_SECRET` e `ALLOWED_*`.
- **Site:** reverter o commit em `main` (o deploy é automático).
- **Migração:** é aditiva; não precisa de reversão. Se for mesmo necessário:
  `DROP TABLE email_tokens; DROP TABLE rate_counters;` (as colunas podem ficar).
