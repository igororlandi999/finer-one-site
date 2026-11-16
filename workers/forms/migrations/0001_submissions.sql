-- Finer One — inscrições do site (Lista de Espera e Finer Pioneers).
-- Uma tabela para os dois formulários; colunas que só um deles usa ficam NULL.
CREATE TABLE submissions (
  id              TEXT PRIMARY KEY,                       -- identificador da submissão (gerado no navegador)
  kind            TEXT NOT NULL CHECK (kind IN ('waitlist', 'pioneers')),
  created_at      TEXT NOT NULL,                          -- ISO 8601, UTC
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,                          -- sempre em minúsculas
  company         TEXT,
  sector          TEXT,
  challenge       TEXT,
  size            TEXT,
  interests       TEXT,
  lang            TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'nova'
);

-- A lista de espera nunca inscreve o mesmo email duas vezes.
CREATE UNIQUE INDEX submissions_waitlist_email ON submissions (email) WHERE kind = 'waitlist';
CREATE INDEX submissions_kind_created ON submissions (kind, created_at);
CREATE INDEX submissions_email ON submissions (email);
CREATE INDEX submissions_created ON submissions (created_at);
