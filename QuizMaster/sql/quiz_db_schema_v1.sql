PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS quiz_db_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  schema_version INTEGER NOT NULL,
  db_key TEXT NOT NULL UNIQUE,
  course_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  language_code TEXT NOT NULL DEFAULT 'de',
  default_badge_label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_pool (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 12),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  default_interaction_type TEXT CHECK (
    default_interaction_type IS NULL OR
    default_interaction_type IN (
      'binary',
      'single',
      'multi',
      'best',
      'sequence',
      'gap_fill_choice',
      'gap_fill_text'
    )
  ),
  default_question_kind TEXT CHECK (
    default_question_kind IS NULL OR
    default_question_kind IN (
      'aussage_bewerten',
      'eine_richtige_antwort_waehlen',
      'mehrere_richtige_antworten_waehlen',
      'beste_option_im_mini_szenario',
      'begriff_zu_definition',
      'definition_zu_begriff',
      'beispiel_erkennen',
      'gegenbeispiel_erkennen',
      'kategorie_zuordnen',
      'reihenfolge_bestimmen',
      'fehler_finden',
      'luecke_fuellen',
      'vergleich_treffen',
      'prioritaet_setzen',
      'ursache_folge_erkennen',
      'was_fehlt',
      'passende_massnahme_auswaehlen',
      'ziel_mittel_zuordnung'
    )
  ),
  default_badge_label TEXT NOT NULL DEFAULT '',
  source_ref TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_pool_topic (
  pool_id TEXT NOT NULL REFERENCES quiz_pool(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  PRIMARY KEY (pool_id, topic)
);

CREATE TABLE IF NOT EXISTS quiz_question (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 12),
  pool_id TEXT NOT NULL REFERENCES quiz_pool(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL CHECK (length(concept_id) = 12),
  variant_id TEXT NOT NULL CHECK (length(variant_id) = 12),
  sort_order INTEGER NOT NULL DEFAULT 0,
  interaction_type TEXT NOT NULL CHECK (
    interaction_type IN (
      'binary',
      'single',
      'multi',
      'best',
      'sequence',
      'gap_fill_choice',
      'gap_fill_text'
    )
  ),
  question_kind TEXT NOT NULL CHECK (
    question_kind IN (
      'aussage_bewerten',
      'eine_richtige_antwort_waehlen',
      'mehrere_richtige_antworten_waehlen',
      'beste_option_im_mini_szenario',
      'begriff_zu_definition',
      'definition_zu_begriff',
      'beispiel_erkennen',
      'gegenbeispiel_erkennen',
      'kategorie_zuordnen',
      'reihenfolge_bestimmen',
      'fehler_finden',
      'luecke_fuellen',
      'vergleich_treffen',
      'prioritaet_setzen',
      'ursache_folge_erkennen',
      'was_fehlt',
      'passende_massnahme_auswaehlen',
      'ziel_mittel_zuordnung'
    )
  ),
  badge_label TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  max_selections INTEGER NOT NULL DEFAULT 1 CHECK (max_selections >= 1),
  is_new INTEGER NOT NULL DEFAULT 0 CHECK (is_new IN (0, 1)),
  sentence_template TEXT NOT NULL DEFAULT '',
  gap_key TEXT NOT NULL DEFAULT '',
  source_ref TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (concept_id, variant_id)
);

CREATE TABLE IF NOT EXISTS quiz_option (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 12),
  question_id TEXT NOT NULL REFERENCES quiz_question(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  short_label TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  UNIQUE (question_id, option_key),
  UNIQUE (question_id, sort_order)
);

CREATE TABLE IF NOT EXISTS quiz_sequence_item (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 12),
  question_id TEXT NOT NULL REFERENCES quiz_question(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 1),
  text TEXT NOT NULL,
  UNIQUE (question_id, item_key),
  UNIQUE (question_id, sort_order)
);

CREATE TABLE IF NOT EXISTS quiz_accepted_answer (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 12),
  question_id TEXT NOT NULL REFERENCES quiz_question(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  normalized_answer TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  UNIQUE (question_id, normalized_answer)
);

CREATE INDEX IF NOT EXISTS idx_quiz_pool_active_sort
  ON quiz_pool (is_active, sort_order, label);

CREATE INDEX IF NOT EXISTS idx_quiz_pool_topic_pool
  ON quiz_pool_topic (pool_id);

CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_active
  ON quiz_question (pool_id, is_active);

CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_concept
  ON quiz_question (pool_id, concept_id);

CREATE INDEX IF NOT EXISTS idx_quiz_question_concept
  ON quiz_question (concept_id);

CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_kind
  ON quiz_question (pool_id, question_kind);

CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_interaction
  ON quiz_question (pool_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_quiz_question_variant
  ON quiz_question (variant_id);

CREATE INDEX IF NOT EXISTS idx_quiz_option_question_sort
  ON quiz_option (question_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_quiz_sequence_item_question_sort
  ON quiz_sequence_item (question_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_quiz_accepted_answer_question
  ON quiz_accepted_answer (question_id);
