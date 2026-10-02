-- IdeaMap Dossier Factory — initial schema (Phase 1 of IDEAMAP_DOSSIER_FACTORY_PROMPT.md §7.1).
--
-- Not yet wired into the running app: no route or server function imports
-- lib/db.ts or queries these tables. This migration exists so the schema can
-- be reviewed and run against a real Postgres instance (Neon recommended —
-- see README note in lib/db.ts) before any code depends on it, keeping the
-- live site's current Redis-backed persistence fully intact in the meantime.
--
-- Run with: psql "$DATABASE_URL" -f db/migrations/0001_init.sql
-- (or your provider's migration runner of choice — this file has no
-- framework-specific syntax, plain SQL only.)

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('holder', 'coordinator', 'admin')),
  cin_hash      TEXT,                 -- holders: hashed CIN, used for login lookup
  display_name  TEXT NOT NULL,
  phone_enc     TEXT,                 -- encrypted at rest — see §8
  email_enc     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_cin_hash_idx ON users (cin_hash) WHERE cin_hash IS NOT NULL;

-- A scope is a (préfecture, promo) pair — the unit every coordinator's
-- access is restricted to, enforced in every query below via scope_id.
CREATE TABLE IF NOT EXISTS scopes (
  id          TEXT PRIMARY KEY,
  prefecture  TEXT NOT NULL,
  promo       TEXT NOT NULL,
  UNIQUE (prefecture, promo)
);

CREATE TABLE IF NOT EXISTS user_scopes (
  user_id   TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  scope_id  TEXT NOT NULL REFERENCES scopes (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, scope_id)
);

CREATE TABLE IF NOT EXISTS imports (
  id           TEXT PRIMARY KEY,
  scope_id     TEXT NOT NULL REFERENCES scopes (id),
  uploaded_by  TEXT NOT NULL REFERENCES users (id),
  file_key     TEXT NOT NULL,         -- object storage key, see lib/storage.ts
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'parsing', 'validated', 'generating', 'done', 'error')),
  rows         INTEGER NOT NULL DEFAULT 0,
  warnings     INTEGER NOT NULL DEFAULT 0,
  errors       INTEGER NOT NULL DEFAULT 0,
  totals_json  JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS imports_scope_idx ON imports (scope_id);

CREATE TABLE IF NOT EXISTS dossiers (
  id               TEXT PRIMARY KEY,
  scope_id         TEXT NOT NULL REFERENCES scopes (id),
  import_id        TEXT REFERENCES imports (id) ON DELETE CASCADE,
  holder_user_id   TEXT REFERENCES users (id),
  numero           TEXT,              -- committee-sheet row number, when import_id is set
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'enriching', 'ready', 'error')),
  data             JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {row?, proj, plan, budget, comp} — see lib/ideamap/dossier/schema.ts
  content_hash     TEXT,              -- idempotency key input, see §7.3
  ai_state         TEXT NOT NULL DEFAULT 'pending' CHECK (ai_state IN ('pending', 'ok', 'fallback')),
  assumptions      JSONB,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- A dossier belongs to exactly one origin: a bulk import OR a holder's own flow.
  CHECK ((import_id IS NOT NULL) OR (holder_user_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS dossiers_scope_status_idx ON dossiers (scope_id, status);
CREATE INDEX IF NOT EXISTS dossiers_import_idx ON dossiers (import_id);

CREATE TABLE IF NOT EXISTS jobs (
  id               TEXT PRIMARY KEY,
  kind             TEXT NOT NULL CHECK (kind IN ('parse_import', 'enrich', 'render', 'consolidate')),
  dossier_id       TEXT REFERENCES dossiers (id) ON DELETE CASCADE,
  import_id        TEXT REFERENCES imports (id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'running', 'done', 'failed')),
  attempts         INTEGER NOT NULL DEFAULT 0,
  idempotency_key  TEXT NOT NULL UNIQUE,
  error            TEXT,
  started_at       TIMESTAMPTZ,
  finished_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS jobs_status_kind_idx ON jobs (status, kind);

CREATE TABLE IF NOT EXISTS artifacts (
  id                 TEXT PRIMARY KEY,
  dossier_id         TEXT REFERENCES dossiers (id) ON DELETE CASCADE,
  import_id          TEXT REFERENCES imports (id) ON DELETE CASCADE,
  kind               TEXT NOT NULL CHECK (kind IN ('deck', 'fiche_projet', 'fiche_technique', 'business_plan', 'committee_excel', 'bundle_zip')),
  file_key           TEXT NOT NULL,
  bytes              BIGINT,
  generator_version  TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS artifacts_dossier_idx ON artifacts (dossier_id);

-- Admin-edited starting assumptions for the business-plan inputs a committee
-- Excel never carries — see lib/ideamap/dossier/finance.ts for the seed
-- values and the application code that reads this table once wired up.
CREATE TABLE IF NOT EXISTS sector_benchmarks (
  sector         TEXT PRIMARY KEY,
  panier_moyen   NUMERIC NOT NULL,
  clients_jour   NUMERIC NOT NULL,
  jours_mois     NUMERIC NOT NULL,
  matieres_pct   NUMERIC NOT NULL,
  charges_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
  croissance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by     TEXT REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS ai_cache (
  prompt_hash  TEXT PRIMARY KEY,
  response     JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (id),
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  action      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agent_messages_user_idx ON agent_messages (user_id, created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (id),
  action      TEXT NOT NULL,
  target      TEXT,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_user_idx ON audit_log (user_id, created_at);
