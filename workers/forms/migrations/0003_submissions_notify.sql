-- Finer One — notificação interna por email da Lista de Espera e do Finer Pioneers.
-- Só acrescenta colunas (mesmo padrão de explore_leads); nenhuma coluna ou linha existente é
-- apagada ou alterada nos seus dados. O código anterior continua a funcionar com estas colunas:
-- o INSERT dele nomeia as colunas e as novas ficam com o valor por omissão.
ALTER TABLE submissions ADD COLUMN notify_status TEXT NOT NULL DEFAULT 'pending' CHECK (notify_status IN ('pending', 'sent', 'failed', 'skipped'));
ALTER TABLE submissions ADD COLUMN notify_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN notify_error TEXT;              -- só um código curto (ex.: http_429), nunca dados pessoais
ALTER TABLE submissions ADD COLUMN notify_last_attempt_at TEXT;    -- última tentativa (intervalo entre reenvios)
ALTER TABLE submissions ADD COLUMN notified_at TEXT;

-- Inscrições anteriores às notificações: nunca geram email retroativo.
UPDATE submissions SET notify_status = 'skipped', notify_error = 'before_notifications';

CREATE INDEX submissions_notify_pending ON submissions (notify_status, created_at) WHERE notify_status = 'pending';
