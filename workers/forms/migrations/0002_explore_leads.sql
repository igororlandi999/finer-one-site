-- Finer One — pedidos da análise completa do Explorar (simulador de tesouraria).
-- Tabela própria: a tabela `submissions` (Lista de Espera e Finer Pioneers) não é alterada.
--
-- Minimização: só se guardam os valores da simulação que entram no cálculo (meses do
-- horizonte escolhido; saldo e pagamentos só quando o visitante os indicou). Os resultados
-- são recalculados no servidor a partir desses valores, nunca aceites do navegador.
-- Sem endereço IP, sem NIF, sem dados bancários.
CREATE TABLE explore_leads (
  id                TEXT PRIMARY KEY,                     -- identificador do pedido (gerado no navegador, reutilizado nas novas tentativas)
  created_at        TEXT NOT NULL,                        -- ISO 8601, UTC
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,                        -- sempre em minúsculas
  company           TEXT NOT NULL,
  phone             TEXT,                                 -- formato internacional (+351912345678) ou NULL
  contact_requested INTEGER NOT NULL DEFAULT 0 CHECK (contact_requested IN (0, 1)),
  marketing_opt_in  INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
  source            TEXT NOT NULL DEFAULT 'explorar' CHECK (source = 'explorar'),

  -- Contexto da simulação
  simulation_id     TEXT NOT NULL,
  scenario          TEXT NOT NULL CHECK (scenario IN ('treasury', 'clients')),
  horizon           INTEGER NOT NULL CHECK (horizon IN (3, 6)),
  currency          TEXT NOT NULL,
  reference_month   TEXT NOT NULL,                        -- primeiro mês simulado (AAAA-MM)
  sim_hash          TEXT NOT NULL,                        -- SHA-256 dos valores (deteção de pedidos repetidos)
  sim_inputs        TEXT NOT NULL CHECK (json_valid(sim_inputs)),
  sim_results       TEXT NOT NULL CHECK (json_valid(sim_results)),
  lowest_balance    REAL,                                 -- saldo mais baixo com atrasos (NULL sem saldo indicado)
  max_gap           REAL NOT NULL,                        -- maior quebra de liquidez provocada pelo atraso
  funding_need      REAL,                                 -- valor a assegurar para manter 1 mês de pagamentos de reserva

  lang              TEXT NOT NULL,
  consent_version   TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'nova',         -- nova, contactada, oportunidade, sem_interesse

  -- Notificação interna por email (independente da gravação)
  notify_status     TEXT NOT NULL DEFAULT 'pending' CHECK (notify_status IN ('pending', 'sent', 'failed')),
  notify_attempts   INTEGER NOT NULL DEFAULT 0,
  notify_error      TEXT,                                 -- só um código curto (ex.: http_429), nunca dados pessoais
  notify_last_attempt_at TEXT,                            -- última tentativa (intervalo entre reenvios)
  notified_at       TEXT
);

CREATE INDEX explore_leads_email_created ON explore_leads (email, created_at);
CREATE INDEX explore_leads_created ON explore_leads (created_at);
CREATE INDEX explore_leads_notify_pending ON explore_leads (notify_status, created_at) WHERE notify_status = 'pending';
