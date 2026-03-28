#!/usr/bin/env python3

import hashlib
import json
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUIZ_JSON_PATH = (
    ROOT
    / "data"
    / "Kurse"
    / "Pruefungsvorbereitung-2-FIAE-Quiz"
    / "quiz_ap2_fiae_gesamtpool"
    / "quiz01_V01_ap2_fiae_gesamtpool.json"
)
QUIZ_DB_PATH = ROOT / "data" / "Kurse" / "Pruefungsvorbereitung-2-FIAE-Quiz.db"


def stable_id(namespace: str, value: str) -> str:
    digest = hashlib.blake2s(f"{namespace}::{value}".encode("utf-8"), digest_size=16).hexdigest()
    return digest[:12]


def main() -> None:
    data = json.loads(QUIZ_JSON_PATH.read_text(encoding="utf-8"))
    pool_slug = "ap2-fiae-gesamtpool"
    pool_id = stable_id("pool", pool_slug)

    with sqlite3.connect(QUIZ_DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(
            """
            DELETE FROM quiz_accepted_answer;
            DELETE FROM quiz_sequence_item;
            DELETE FROM quiz_option;
            DELETE FROM quiz_question;
            DELETE FROM quiz_pool_topic;
            DELETE FROM quiz_pool;
            DELETE FROM quiz_db_meta;
            """
        )

        conn.execute(
            """
            INSERT INTO quiz_db_meta (
              id,
              schema_version,
              db_key,
              course_key,
              title,
              description,
              language_code,
              default_badge_label
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                1,
                1,
                "Pruefungsvorbereitung-2-FIAE-Quiz",
                "PV2FIAE",
                "Prüfungsvorbereitung 2 FIAE",
                "Read-only Quizdatenbank für AP2-FIAE-Aufgaben.",
                "de",
                data.get("defaultBadgeLabel", ""),
            ),
        )

        conn.execute(
            """
            INSERT INTO quiz_pool (
              id,
              slug,
              label,
              description,
              sort_order,
              default_interaction_type,
              default_question_kind,
              default_badge_label,
              source_ref,
              is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pool_id,
                pool_slug,
                data.get("title", "AP2 FIAE Gesamtpool"),
                data.get("description", ""),
                1,
                data.get("defaultInteractionType"),
                data.get("defaultQuestionKind"),
                data.get("defaultBadgeLabel", ""),
                str(QUIZ_JSON_PATH.relative_to(ROOT)),
                1,
            ),
        )

        for topic in data.get("topics", []):
            conn.execute(
                "INSERT INTO quiz_pool_topic (pool_id, topic) VALUES (?, ?)",
                (pool_id, topic),
            )

        question_ids: set[str] = set()
        concept_ids: set[str] = set()
        variant_ids: set[str] = set()
        option_ids: set[str] = set()

        for index, question in enumerate(data.get("questions", []), start=1):
            question_id = stable_id("question", question["id"])
            concept_id = stable_id("concept", question["conceptId"])
            variant_id = stable_id("variant", question["variantId"])
            question_ids.add(question_id)
            concept_ids.add(concept_id)
            variant_ids.add(variant_id)

            conn.execute(
                """
                INSERT INTO quiz_question (
                  id,
                  pool_id,
                  concept_id,
                  variant_id,
                  sort_order,
                  interaction_type,
                  question_kind,
                  badge_label,
                  prompt,
                  instructions,
                  context,
                  max_selections,
                  is_new,
                  sentence_template,
                  gap_key,
                  source_ref,
                  is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    question_id,
                    pool_id,
                    concept_id,
                    variant_id,
                    index,
                    question.get("interactionType"),
                    question.get("questionKind"),
                    question.get("badgeLabel", ""),
                    question.get("prompt", ""),
                    "",
                    "",
                    question.get("maxSelections", 1) or 1,
                    1 if question.get("isNew") else 0,
                    "",
                    "",
                    question.get("id", ""),
                    1,
                ),
            )

            for option_index, option in enumerate(question.get("options", []), start=1):
                source_option_id = option.get("id") or f"opt{option_index}"
                option_id = stable_id("option", f"{question['id']}::{source_option_id}::{option_index}")
                option_ids.add(option_id)
                option_key = str(source_option_id).upper()
                conn.execute(
                    """
                    INSERT INTO quiz_option (
                      id,
                      question_id,
                      option_key,
                      sort_order,
                      short_label,
                      text,
                      explanation,
                      is_correct,
                      is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        option_id,
                        question_id,
                        option_key,
                        option_index,
                        option_key if len(option_key) <= 3 else "",
                        option.get("text", ""),
                        option.get("explanation", ""),
                        1 if option.get("correct") else 0,
                        1,
                    ),
                )

        conn.commit()

    print(f"db={QUIZ_DB_PATH.relative_to(ROOT)}")
    print(f"pool_id={pool_id}")
    print(f"questions={len(question_ids)}")
    print(f"concepts={len(concept_ids)}")
    print(f"variants={len(variant_ids)}")
    print(f"options={len(option_ids)}")


if __name__ == "__main__":
    main()
