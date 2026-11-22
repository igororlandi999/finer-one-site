# Formulários do site em Cloudflare (Workers + D1 + Turnstile)

Alternativa gratuita ao recetor Google Apps Script (`backend/google-apps-script/`).
Os dois recetores existem no repositório; **só um fica ativo em produção**, escolhido
pela variável de build `VITE_FORMS_PROVIDER` (`google` por omissão, `cloudflare`).

Estado (15/11/2026): recetor ativo na conta gratuita `geral.finerone@gmail.com`
(Workers Free, sem meio de pagamento), em `https://finer-one-forms.geral-finerone.workers.dev/`,
ligado à D1 `finer-one-forms` (jurisdição UE, id no `wrangler.jsonc`) e ao widget Turnstile
"Finer One - formularios do site" (sitekey pública `0x4AAAAAAGCZmNaMZOnS986M`; hostnames
`finer-one.com` e `www.finer-one.com`; segredo rodado a 15/11/2026). Logs do Worker
desligados. Verificado a 22/11/2026: o site publicado usa este recetor (VITE_FORMS_PROVIDER=cloudflare), que não envia emails nem aceita o Explorar — ver backend/google-apps-script/SETUP.md, secção Explorar.

**Decisão dos fundadores (15/11/2026): sem área de administração própria.** O Cloudflare
Access exige cartão e o modo token não será publicado. O Worker `finer-one-admin`
(`src/admin.ts`) fica no repositório, **não publicado**. Os leads consultam-se e gerem-se
no painel autenticado da Cloudflare (ver "Consultar e gerir inscrições").

## Arquitetura

```
www.finer-one.com (GitHub Pages)
  └─ formulário ──(1) token Turnstile (só no envio)──> challenges.cloudflare.com
                └─(2) POST JSON + token ─────────────> finer-one-forms.<conta>.workers.dev
                                                          ├─ valida Origin, tamanho, campos
                                                          ├─ valida o token (siteverify)
                                                          ├─ limites e duplicados
                                                          └─ INSERT parametrizado ─> D1 (UE)
fundadores ──(login no painel da Cloudflare)──> D1 → Console / Explore Data
```

- **Dois Workers separados.** O recetor público (`src/public.ts`) só aceita envios;
  não tem nenhuma rota de leitura. A área de administração (`src/admin.ts`) é outro
  Worker, para o Cloudflare Access poder proteger todas as suas rotas sem bloquear o
  recetor.
- **Sem email.** Nenhum dado pessoal sai por email; os fundadores consultam a D1 no
  painel da Cloudflare. (Notificações por email da Cloudflare exigiriam DNS na Cloudflare.)
- **Nunca há falso sucesso.** O recetor só responde `ok` com `id` (registo guardado) ou
  `duplicate` (já existia). Campo-armadilha preenchido ou envio com menos de 3 s recebem a
  mesma resposta de um Turnstile recusado (`403 verification`), dada depois da verificação
  do token — não revela qual proteção falhou. O site exige `id` ou `duplicate` para mostrar
  a confirmação; um envio legítimo rápido espera o tempo mínimo em vez de ser descartado.
- **Sem DNS.** Tudo em `workers.dev`; o domínio e o GitHub Pages ficam como estão.

## Segurança

| Medida | Onde |
| --- | --- |
| CORS só para `https://www.finer-one.com` e `https://finer-one.com` (não é autenticação) | `ALLOWED_ORIGINS` |
| Origin obrigatório e permitido em cada POST (403) | `public.ts` |
| Corpo até 16 KB (413), JSON objeto, mesmas regras de validação do Apps Script | `shared.ts` |
| Turnstile validado no servidor (segredo, IP, hostname esperado) | `public.ts` |
| SQL sempre parametrizado (`prepare().bind()`) | ambos |
| Duplicados: ID de submissão, email único na lista de espera, 10 min nos Pioneers | `public.ts` + índice único |
| Limite global de 30 envios/minuto | `public.ts` |
| Logs sem dados pessoais (só o tipo de erro) | `logError` |
| Erros genéricos para o visitante (`invalid`, `verification`, `rate`, `server`) | `public.ts` |
| Sinais de robô = mesma resposta do Turnstile recusado; sem sucesso fingido | `public.ts` |
| Admin: Access (JWT RS256 verificado: assinatura, `aud`, `iss`, validade, email autorizado) ou token ≥32 caracteres em comparação de tempo constante; sem configuração = 503 | `admin.ts` |
| Admin: POST só com `application/json` + `X-Finer-Admin: 1` + mesma origem (CSRF); CSP com nonce; `X-Frame-Options: DENY` | `admin.ts` |
| CSV com BOM, aspas escapadas e neutralização de fórmulas (`= + - @`) | `admin.ts` |
| Nenhuma chave de administração no frontend | — |

## Base de dados (D1)

`migrations/0001_submissions.sql` — tabela `submissions`: `id` (ID de submissão),
`kind` (`waitlist` | `pioneers`), `created_at`, campos do formulário, `lang`,
`consent_version` (versão do aviso de privacidade aceite), `status`
(`nova`, `contactada`, `selecionada`, `nao_selecionada`, `em_programa`, `concluida`).
Novas alterações = novo ficheiro numerado em `migrations/`.

## Consultar e gerir inscrições (painel da Cloudflare)

Só para fundadores autorizados, com login na conta Cloudflare da Finer One
(geral.finerone@gmail.com). Não há página pública de consulta: a D1 só é acessível pelo
Worker (que apenas grava) e pelo painel/API autenticados da conta.

**Antes de começar:** ativar a verificação em dois passos da conta (Perfil → Authentication →
Two-Factor Authentication, de preferência com app TOTP) e guardar os códigos de recuperação.
Não partilhar a password; para dar acesso a outro fundador, usar Manage account → Members.

Caminho: painel → Storage & databases → D1 SQLite Database → `finer-one-forms`.
- **Console** — escrever SQL e carregar em Execute (bom para contagens e eliminações).
- **Explore Data** — editor de consultas com tabela de resultados e botão **Export** (CSV).

Consultas (copiar e colar):

```sql
-- Total de registos, e por formulário
SELECT COUNT(*) AS total FROM submissions;
SELECT kind, COUNT(*) AS total FROM submissions GROUP BY kind;

-- Lista de Espera (mais recentes primeiro)
SELECT created_at, name, email, size, interests, lang, status
FROM submissions WHERE kind = 'waitlist' ORDER BY created_at DESC;

-- Finer Pioneers
SELECT created_at, name, email, company, sector, challenge, lang, status
FROM submissions WHERE kind = 'pioneers' ORDER BY created_at DESC;

-- Localizar uma pessoa (o email é guardado em minúsculas)
SELECT id, kind, created_at, name, email FROM submissions WHERE email = 'nome@empresa.pt';

-- Atualizar o estado de uma inscrição
UPDATE submissions SET status = 'contactada' WHERE id = 'ID-DA-INSCRICAO';
-- estados: nova, contactada, selecionada, nao_selecionada, em_programa, concluida
```

**Exportar:** em Explore Data, correr a consulta pretendida (ex.: Lista de Espera) →
**Export** → formato CSV → Export. Exportar só quando necessário, guardar o ficheiro num
local protegido e apagá-lo quando deixar de ser preciso. Ao abrir no Excel, usar
Dados → De Texto/CSV (não duplo clique), para o Excel não interpretar como fórmula um
valor começado por `=`, `+`, `-` ou `@`.

**Eliminar (pedido de apagamento ou fim do prazo de conservação):**
1. Confirmar o que será apagado: `SELECT id, kind, email, created_at FROM submissions WHERE email = 'nome@empresa.pt';`
2. Apagar: `DELETE FROM submissions WHERE email = 'nome@empresa.pt';` (ou `WHERE id = '…'`
   para uma só inscrição).
3. Verificar: repetir o `SELECT` (deve devolver vazio).
4. Registar a data do pedido e da eliminação (sem copiar os dados apagados).

Prazos de conservação (aviso de privacidade, rascunho), por exemplo:
`DELETE FROM submissions WHERE kind = 'pioneers' AND status = 'nao_selecionada' AND created_at < 'AAAA-MM-DD';`

**Histórico (D1 Time Travel):** sempre ativo, não pode ser desligado. No plano gratuito
permite restaurar a base a qualquer minuto dos **últimos 7 dias**; um registo eliminado
pode, portanto, ser recuperável até 7 dias depois, deixando de o ser a seguir. Não usar
"restore" sem acordo dos fundadores: repõe a base inteira, incluindo registos já eliminados.

## Desenvolvimento e testes

```
cd workers/forms
npm install            # .npmrc usa legacy-peer-deps (bug do npm 10 com o vitest 4)
npm run typecheck
npm test               # 38 testes (Miniflare: Worker + D1 reais em memória)
npm run db:migrate:local
npm run dev            # recetor em http://localhost:8787 (chaves de teste do Turnstile)
npm run dev:admin      # admin em http://localhost:8788 (ADMIN_TOKEN em .dev.vars)
```

Site contra o Worker local:
`VITE_FORMS_PROVIDER=cloudflare VITE_FORMS_ENDPOINT=http://localhost:8787/ VITE_TURNSTILE_SITEKEY=1x00000000000000000000AA npm run dev`
(as chaves `1x…AA` são as chaves públicas de teste da Cloudflare: passam sempre).

## Configuração na Cloudflare (precisa de autorização dos fundadores)

Conta Cloudflare gratuita com o email da empresa. Sem meio de pagamento.

1. `npx wrangler login`
2. `npx wrangler d1 create finer-one-forms --jurisdiction=eu` — a jurisdição UE só
   pode ser escolhida na criação. Copiar o `database_id` para `wrangler.jsonc` e
   `wrangler.admin.jsonc`.
3. `npx wrangler d1 migrations apply finer-one-forms --remote`
4. Painel → Turnstile → novo widget, modo **Managed**, hostnames `finer-one.com` e
   `www.finer-one.com`. Guardar a sitekey (pública) e o segredo.
5. `npx wrangler secret put TURNSTILE_SECRET` e `npx wrangler deploy`
6. `npx wrangler deploy --config wrangler.admin.jsonc`, depois:
   - **Preferido:** Workers → `finer-one-admin` → Settings → Domains & Routes →
     `workers.dev` → ativar Cloudflare Access; política só para os emails dos
     fundadores. Copiar a *team domain* e o *AUD* para `ACCESS_TEAM_DOMAIN` e
     `ACCESS_AUD` e voltar a publicar. Confirmar no momento se o Zero Trust pede
     meio de pagamento — se pedir, **não** introduzir e usar a alternativa.
   - **Alternativa:** `npx wrangler secret put ADMIN_TOKEN` (≥32 caracteres
     aleatórios, guardado num gestor de palavras-passe).
7. Testar o recetor real com dados fictícios e apagá-los no Console da D1.
8. GitHub → Settings → Variables: `VITE_FORMS_PROVIDER=cloudflare`,
   `VITE_TURNSTILE_SITEKEY=<sitekey>`, `VITE_FORMS_ENDPOINT=https://finer-one-forms.<conta>.workers.dev/`.
   O próximo deploy do site passa a usar a Cloudflare.

## Reversão

Repor `VITE_FORMS_PROVIDER=google` e `VITE_FORMS_ENDPOINT=<URL do Apps Script>` nas
variáveis do GitHub e voltar a correr o workflow de deploy. O Apps Script e a Folha
Google não são alterados por esta migração. Inscrições recebidas na D1 entretanto
exportam-se em CSV no Explore Data da D1.

Reversão do Worker (só o recetor): painel → Workers & Pages → `finer-one-forms` →
Deployments → versão anterior → Rollback. Versões de referência: `53499000` (antes da
correção dos falsos sucessos) e `b0cd3730` (com a correção, 15/11/2026; o segredo rodado
e as variáveis foram publicados em versões seguintes). Atenção: uma versão anterior à
rotação do segredo pode trazer o segredo antigo do Turnstile, que deixou de ser válido —
depois de um rollback, confirmar `TURNSTILE_SECRET` e `ALLOWED_*` em Settings e testar.
Alternativa que só troca o código: Edit code → colar a versão anterior de `src/public.ts`
compilada (`npx wrangler deploy --dry-run --outdir dist`) → Deploy.

## Plano gratuito (verificar antes de ativar)

Workers: 100 000 pedidos/dia. D1: 5 GB, 5 M linhas lidas e 100 000 escritas por dia;
ao atingir um limite os pedidos falham (não há cobrança). Turnstile: gratuito.
Cloudflare Access: gratuito até 50 utilizadores. Os limites podem mudar — confirmar
na documentação da Cloudflare no dia da ativação.
