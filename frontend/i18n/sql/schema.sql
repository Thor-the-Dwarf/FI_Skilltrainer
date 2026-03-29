CREATE TABLE IF NOT EXISTS ui_locale (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  native_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ui_message (
  locale_code TEXT NOT NULL,
  message_key TEXT NOT NULL,
  message_text TEXT NOT NULL,
  PRIMARY KEY (locale_code, message_key)
);

CREATE TABLE IF NOT EXISTS ui_literal_translation (
  locale_code TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  PRIMARY KEY (locale_code, source_text)
);
