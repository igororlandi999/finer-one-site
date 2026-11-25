-- Finer One — Finer Pioneers: novos campos (telefone, website) e verificação do email do candidato.
-- Só acrescenta colunas e tabelas: nenhuma linha existente é apagada nem alterada nos seus dados.
-- O código anterior continua a funcionar com estas colunas (o INSERT dele nomeia as colunas e as
-- novas ficam com o valor por omissão), por isso esta migração aplica-se ANTES do deploy do Worker.
--
-- Três estados independentes na mesma linha — não confundir:
--   status          avaliação comercial da candidatura (nova, contactada, selecionada, …) — não muda aqui
--   email_status    verificação do contacto: o candidato provou que o endereço é dele?
--   confirm_status  envio do email de confirmação: o Resend aceitou a mensagem? ("enviado" não é "confirmado")
ALTER TABLE submissions ADD COLUMN phone TEXT;                     -- formato internacional (+351912345678)
ALTER TABLE submissions ADD COLUMN company_url TEXT;               -- website da empresa (opcional, normalizado)

ALTER TABLE submissions ADD COLUMN email_status TEXT NOT NULL DEFAULT 'not_requested' CHECK (email_status IN ('not_requested', 'pending', 'verified'));
ALTER TABLE submissions ADD COLUMN email_verified_at TEXT;

ALTER TABLE submissions ADD COLUMN confirm_status TEXT NOT NULL DEFAULT 'none' CHECK (confirm_status IN ('none', 'pending', 'sent', 'failed'));
ALTER TABLE submissions ADD COLUMN confirm_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN confirm_error TEXT;             -- só um código curto (ex.: http_429), nunca dados pessoais
ALTER TABLE submissions ADD COLUMN confirm_last_attempt_at TEXT;
ALTER TABLE submissions ADD COLUMN confirm_sent_at TEXT;
ALTER TABLE submissions ADD COLUMN confirm_resends INTEGER NOT NULL DEFAULT 0;   -- reenvios pedidos pelo candidato
ALTER TABLE submissions ADD COLUMN confirm_last_resend_at TEXT;

-- Candidatura repetida pelo mesmo email em poucos minutos: fica gravada e aponta para a primeira.
-- A resposta pública é igual à de uma candidatura nova; a duplicação vê-se aqui, na base de dados.
ALTER TABLE submissions ADD COLUMN duplicate_of TEXT;

-- As inscrições existentes ficam 'not_requested' / 'none' (valores por omissão): continuam válidas,
-- não recebem email retroativo e não são tratadas como "por verificar".

CREATE INDEX submissions_duplicate_of ON submissions (duplicate_of) WHERE duplicate_of IS NOT NULL;
CREATE INDEX submissions_confirm_pending ON submissions (confirm_status, created_at) WHERE confirm_status = 'pending';

-- Ligações de verificação. Só se guarda o SHA-256 do token: quem ler a base de dados não
-- consegue reconstruir nenhuma ligação. Apagar a candidatura apaga também as suas ligações.
CREATE TABLE email_tokens (
  token_hash    TEXT PRIMARY KEY,                                  -- SHA-256 (hex) do token enviado por email
  submission_id TEXT NOT NULL REFERENCES submissions (id) ON DELETE CASCADE,
  created_at    TEXT NOT NULL,                                     -- ISO 8601, UTC
  expires_at    TEXT NOT NULL,
  used_at       TEXT                                               -- preenchido na confirmação (uso único) ou quando é substituído
);
CREATE INDEX email_tokens_submission ON email_tokens (submission_id);
CREATE INDEX email_tokens_expires ON email_tokens (expires_at);

-- Contadores por minuto das rotas de verificação e de reenvio (limite de abuso).
-- Sem endereço IP nem qualquer dado pessoal: só o nome da rota, o minuto e a contagem.
CREATE TABLE rate_counters (
  name   TEXT NOT NULL,
  minute TEXT NOT NULL,                                            -- AAAA-MM-DDTHH:MM (UTC)
  n      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (name, minute)
);
