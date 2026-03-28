#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[2]
JSON_TARGETS = [
    ROOT / "data" / "Kurse",
    ROOT / "QuizMaster" / "Kurse",
]
DB_TARGETS = [ROOT / "data" / "Kurse"]

JSON_EXCLUDED_KEYS = {
    "id",
    "conceptId",
    "variantId",
    "versionId",
    "ticketId",
    "scenarioFolder",
    "quizFolder",
    "scenarioFile",
    "quizFile",
    "slug",
    "type",
    "interactionType",
    "questionKind",
    "questionId",
    "fieldId",
    "optionId",
    "itemId",
    "gap_key",
    "source_ref",
    "db_key",
    "course_key",
    "normalized_answer",
    "language_code",
    "date",
    "from",
    "to",
    "subject_id",
    "station_id",
    "progressLinks",
}

DB_EXCLUDED_COLUMNS = {
    "db_key",
    "course_key",
    "language_code",
    "slug",
    "source_ref",
    "gap_key",
    "interaction_type",
    "question_kind",
    "default_interaction_type",
    "default_question_kind",
}

WORD_RE = re.compile(r"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'-]*")
HAS_TRANSLIT_RE = re.compile(r"(ae|oe|ue|Ae|Oe|Ue)")
PRESERVE_PATTERNS = [
    re.compile(pattern)
    for pattern in (
        r"(?i)known-issue",
        r"(?i)quell",
        r"(?i)sequ",
        r"(?i)konseq",
        r"(?i)request",
        r"(?i)queue",
        r"(?i)^true$",
        r"(?i)fiae",
        r"(?i)manuell",
        r"(?i)aktuell",
        r"(?i)visuell",
        r"(?i)virtuell",
        r"(?i)eue",
        r"(?i)aue",
        r"(?i)oei",
        r"(?i)steu",
        r"(?i)^zue",
        r"(?i)blau",
        r"(?i)duell",
        r"(?i)^ae+$",
        r"(?i)^[a-f]*(ae|oe|ue)[a-f]*$",
    )
]


@dataclass
class MigrationStats:
    json_files_changed: int = 0
    db_files_changed: int = 0
    db_cells_changed: int = 0
    mapped_words: int = 0


def is_pathlike(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return True
    if stripped.startswith(("http://", "https://", "./", "../")):
        return True
    if "/" in stripped and " " not in stripped:
        return True
    return False


def should_skip_string(text: str, key: str | None = None) -> bool:
    if key in JSON_EXCLUDED_KEYS:
        return True
    stripped = text.strip()
    if not stripped:
        return True
    if is_pathlike(stripped):
        return True
    return False


def should_preserve_word(word: str) -> bool:
    if any(pattern.search(word) for pattern in PRESERVE_PATTERNS):
        return True
    if re.search(r"[a-zäöüß][A-ZÄÖÜ]", word):
        return True
    return False


def to_umlaut(word: str) -> str:
    return (
        word.replace("Ae", "Ä")
        .replace("Oe", "Ö")
        .replace("Ue", "Ü")
        .replace("ae", "ä")
        .replace("oe", "ö")
        .replace("ue", "ü")
    )


def collect_words_from_text(text: str) -> Iterable[str]:
    if not HAS_TRANSLIT_RE.search(text):
        return ()
    parts = text.split("`")
    words: list[str] = []
    for index, part in enumerate(parts):
        if index % 2 == 1:
            continue
        for word in WORD_RE.findall(part):
            if HAS_TRANSLIT_RE.search(word):
                words.append(word)
    return words


def rewrite_text(text: str, word_map: dict[str, str]) -> str:
    if not HAS_TRANSLIT_RE.search(text):
        return text

    parts = text.split("`")
    rewritten_parts: list[str] = []
    for index, part in enumerate(parts):
        if index % 2 == 1:
            rewritten_parts.append(part)
            continue

        rewritten_parts.append(
            WORD_RE.sub(lambda match: word_map.get(match.group(0), match.group(0)), part)
        )

    return "`".join(rewritten_parts)


def iter_json_strings(value: Any, key: str | None = None) -> Iterable[str]:
    if isinstance(value, dict):
        for child_key, child_value in value.items():
            yield from iter_json_strings(child_value, child_key)
        return

    if isinstance(value, list):
        for item in value:
            yield from iter_json_strings(item, key)
        return

    if isinstance(value, str) and not should_skip_string(value, key):
        yield value


def transform_json_value(value: Any, word_map: dict[str, str], key: str | None = None) -> Any:
    if isinstance(value, dict):
        changed = False
        transformed: dict[str, Any] = {}
        for child_key, child_value in value.items():
            next_value = transform_json_value(child_value, word_map, child_key)
            transformed[child_key] = next_value
            changed = changed or next_value != child_value
        return transformed if changed else value

    if isinstance(value, list):
        changed = False
        transformed_items: list[Any] = []
        for item in value:
            next_item = transform_json_value(item, word_map, key)
            transformed_items.append(next_item)
            changed = changed or next_item != item
        return transformed_items if changed else value

    if isinstance(value, str) and not should_skip_string(value, key):
        return rewrite_text(value, word_map)

    return value


def get_db_text_columns(cursor: sqlite3.Cursor, table: str) -> list[str]:
    columns = cursor.execute(f"PRAGMA table_info({table})").fetchall()
    selected: list[str] = []
    for _, name, declared_type, *_ in columns:
        declared = (declared_type or "").upper()
        if "TEXT" not in declared:
            continue
        if name in DB_EXCLUDED_COLUMNS:
            continue
        if "slug" in name.lower() or name.endswith("_key"):
            continue
        selected.append(name)
    return selected


def iter_db_strings() -> Iterable[str]:
    for db_root in DB_TARGETS:
        for db_path in sorted(db_root.rglob("*.db")):
            connection = sqlite3.connect(db_path)
            try:
                cursor = connection.cursor()
                tables = [row[0] for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")]
                for table in tables:
                    columns = get_db_text_columns(cursor, table)
                    if not columns:
                        continue
                    for row in cursor.execute(f"SELECT {', '.join(columns)} FROM {table}"):
                        for value in row:
                            if isinstance(value, str) and not should_skip_string(value):
                                yield value
            finally:
                connection.close()


def build_word_map() -> dict[str, str]:
    word_map: dict[str, str] = {}

    for base in JSON_TARGETS:
        if not base.is_dir():
            continue
        for json_path in sorted(base.rglob("*.json")):
            data = json.loads(json_path.read_text(encoding="utf-8"))
            for text in iter_json_strings(data):
                for word in collect_words_from_text(text):
                    if word in word_map or should_preserve_word(word):
                        continue
                    rewritten = to_umlaut(word)
                    if rewritten != word:
                        word_map[word] = rewritten

    for text in iter_db_strings():
        for word in collect_words_from_text(text):
            if word in word_map or should_preserve_word(word):
                continue
            rewritten = to_umlaut(word)
            if rewritten != word:
                word_map[word] = rewritten

    return word_map


def migrate_json_files(word_map: dict[str, str], stats: MigrationStats) -> None:
    for base in JSON_TARGETS:
        if not base.is_dir():
            continue
        for json_path in sorted(base.rglob("*.json")):
            original_text = json_path.read_text(encoding="utf-8")
            data = json.loads(original_text)
            transformed = transform_json_value(data, word_map)
            if transformed == data:
                continue
            json_path.write_text(
                json.dumps(transformed, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            stats.json_files_changed += 1


def migrate_db_files(word_map: dict[str, str], stats: MigrationStats) -> None:
    for db_root in DB_TARGETS:
        for db_path in sorted(db_root.rglob("*.db")):
            changed_in_file = False
            connection = sqlite3.connect(db_path)
            try:
                cursor = connection.cursor()
                tables = [row[0] for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")]
                for table in tables:
                    columns = get_db_text_columns(cursor, table)
                    if not columns:
                        continue
                    rows = cursor.execute(f"SELECT rowid, {', '.join(columns)} FROM {table}").fetchall()
                    for row in rows:
                        rowid = row[0]
                        values = list(row[1:])
                        next_values = []
                        changed_columns: list[str] = []
                        for column, value in zip(columns, values):
                            if not isinstance(value, str) or should_skip_string(value):
                                next_values.append(value)
                                continue
                            next_value = rewrite_text(value, word_map)
                            if column == "normalized_answer":
                                next_value = next_value.strip().casefold()
                            next_values.append(next_value)
                            if next_value != value:
                                changed_columns.append(column)
                        if not changed_columns:
                            continue
                        assignments = ", ".join(f"{column} = ?" for column in columns)
                        cursor.execute(
                            f"UPDATE {table} SET {assignments} WHERE rowid = ?",
                            [*next_values, rowid],
                        )
                        changed_in_file = True
                        stats.db_cells_changed += len(changed_columns)
                if changed_in_file:
                    connection.commit()
                    stats.db_files_changed += 1
                else:
                    connection.rollback()
            finally:
                connection.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Restore visible German umlauts in JSON content and SQLite text columns.")
    parser.parse_args()

    stats = MigrationStats()
    word_map = build_word_map()
    stats.mapped_words = len(word_map)

    migrate_json_files(word_map, stats)
    migrate_db_files(word_map, stats)

    print(f"mapped_words={stats.mapped_words}")
    print(f"json_files_changed={stats.json_files_changed}")
    print(f"db_files_changed={stats.db_files_changed}")
    print(f"db_cells_changed={stats.db_cells_changed}")


if __name__ == "__main__":
    main()
