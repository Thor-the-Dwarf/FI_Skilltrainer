#!/usr/bin/env python3

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

import import_lf01_quiz_to_db as base


ROOT = Path(__file__).resolve().parents[2]
ORIGINAL_STAGE_VARIANT_CONFIGS = tuple(base.STAGE_VARIANT_CONFIGS)


def build_extra_stage_config(stage_number: int) -> dict[str, Any]:
    suffix_version = stage_number + 1
    return {
        "stage_label": f"stage{stage_number}",
        "stage_suffix": f"schlussrunde_v{suffix_version}",
        "single_templates": (
            "Welche Antwort verdichtet {title} jetzt am treffendsten?",
            "Welche Entscheidung passt in der Schlussrunde von {title}?",
            "Was rundet {title} fachlich belastbar ab?",
        ),
        "multi_templates": (
            "Welche Punkte verdichten {title} jetzt am treffendsten?",
            "Welche Aussagen passen in der Schlussrunde von {title}?",
            "Was rundet {title} fachlich belastbar ab?",
        ),
    }


def configure_course(
    *,
    course_code: str,
    scenario_dir_name: str,
    quiz_db_filename: str,
    base_question_count: int,
    pre_stage_question_count: int,
    short_text_distractors: tuple[tuple[str, str], ...],
    max_stage_count: int = 9,
    extra_stage_variant_configs: tuple[dict[str, Any], ...] = (),
):
    course_slug = base.slugify_visible_text(course_code).replace("-", "") or course_code.lower()

    base.SCENARIO_ROOT = ROOT / "data" / "Kurse" / scenario_dir_name
    base.SCENARIO_MANIFEST_PATH = base.SCENARIO_ROOT / "scenario-manifest.json"
    base.POSSIBLE_SKILLS_PATH = base.SCENARIO_ROOT / "possible_skills.json"
    base.QUIZ_DB_PATH = ROOT / "data" / "Kurse" / quiz_db_filename
    base.BASE_QUESTION_COUNT = base_question_count
    base.PRE_STAGE_QUESTION_COUNT = pre_stage_question_count
    base.BATCH_SIZE = 100
    base.DEFAULT_QUESTION_LIMIT = 100
    base.MAX_STAGE_COUNT = max_stage_count
    base.MAX_QUESTION_LIMIT = base.PRE_STAGE_QUESTION_COUNT + (base.MAX_STAGE_COUNT * base.BATCH_SIZE)
    base.SHORT_TEXT_DISTRACTORS = short_text_distractors
    base.STAGE_VARIANT_CONFIGS = tuple(ORIGINAL_STAGE_VARIANT_CONFIGS) + tuple(extra_stage_variant_configs)

    def normalize_pool_slug(value: str) -> str:
        slug = base.slugify_visible_text(base.strip_ticket_prefix(value))
        return slug or f"{course_slug}-pool"

    def build_concept_key(pool_slug: str, title: str) -> str:
        return f"{course_slug}::{pool_slug}::{base.slugify_visible_text(title)}"

    def load_course_description() -> str:
        data = json.loads(base.POSSIBLE_SKILLS_PATH.read_text(encoding="utf-8"))
        intro_parts = [
            base.normalize_visible_text(entry)
            for entry in data.get("intro", [])
            if base.normalize_visible_text(entry)
        ]
        intro = " ".join(intro_parts).strip()
        if intro:
            return f"Quizdatenbank fuer {course_code}. {intro}"
        return f"Quizdatenbank fuer {course_code}."

    def build_pre_stage_pools() -> list[dict[str, Any]]:
        manifest = json.loads(base.SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
        topic_titles = base.load_topic_titles()
        pools: list[dict[str, Any]] = []

        for entry in manifest.get("scenarios", []):
            scenario_rel_path = str(entry.get("file", "")).strip()
            if not scenario_rel_path.startswith("ticket_"):
                continue

            scenario_path = base.SCENARIO_ROOT / scenario_rel_path
            scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
            questions = base.collect_questions_for_scenario(scenario_rel_path, scenario_data)
            label = base.normalize_visible_text(base.strip_ticket_prefix(str(entry.get("label", ""))))
            description = base.normalize_visible_text(base.build_pool_description(scenario_data))
            base.validate_visible_texts([label, description])

            pools.append(
                {
                    "id": base.stable_id("pool", scenario_rel_path),
                    "slug": normalize_pool_slug(scenario_path.parent.name),
                    "label": label,
                    "description": description,
                    "source_ref": scenario_rel_path,
                    "default_interaction_type": base.collapse_single_value(
                        [question["interaction_type"] for question in questions]
                    ),
                    "default_question_kind": base.collapse_single_value(
                        [question["question_kind"] for question in questions]
                    ),
                    "default_badge_label": base.collapse_single_value(
                        [question["badge_label"] for question in questions]
                    )
                    or "Aufgabe",
                    "topics": base.collect_pool_topics(label, questions, topic_titles),
                    "questions": questions,
                }
            )

        total_questions = sum(len(pool["questions"]) for pool in pools)
        if total_questions != base.PRE_STAGE_QUESTION_COUNT:
            raise ValueError(
                f"{course_code}-Vorstufe erzeugt {total_questions} Fragen statt {base.PRE_STAGE_QUESTION_COUNT}."
            )

        base_only = sum(
            1
            for pool in pools
            for question in pool["questions"]
            if question["variant_key"].endswith("basis_v1")
        )
        if base_only != base.BASE_QUESTION_COUNT:
            raise ValueError(
                f"{course_code}-Basis erzeugt {base_only} Fragen statt {base.BASE_QUESTION_COUNT}."
            )

        return pools

    def build_base_question(scenario_rel_path: str, pool_slug: str, raw_question: dict[str, Any]) -> dict[str, Any]:
        source_key = f"{scenario_rel_path}#{raw_question['id']}"
        question_type = str(raw_question.get("type", "")).strip()
        title = base.normalize_visible_text(raw_question.get("title", ""))
        concept_key = build_concept_key(pool_slug, title)
        progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]

        if question_type == "short_text":
            return base.build_short_text_base_question(
                scenario_rel_path=scenario_rel_path,
                pool_slug=pool_slug,
                raw_question=raw_question,
            )

        question_meta = base.QUESTION_META_BY_TYPE[question_type]
        prompt = base.normalize_prompt(raw_question.get("prompt", ""))

        if question_type in {"single_choice", "multi_select"}:
            if title and title not in prompt and prompt.endswith("?"):
                prompt = f"{prompt.rstrip('?')} bei {title}?"
            correct_flags = base.get_correct_flags(raw_question)
            option_specs: list[dict[str, Any]] = []
            for index, option in enumerate(raw_question.get("options", []), start=1):
                option_specs.append(
                    {
                        "id": str(index),
                        "text": option.get("text", ""),
                        "correct": correct_flags[index - 1],
                        "explanation": option.get("rationale", ""),
                    }
                )
            return base.build_choice_question(
                source_ref=f"{source_key}::basis_v1",
                concept_key=concept_key,
                variant_key=f"{concept_key}::basis_v1",
                title=title,
                prompt=prompt,
                interaction_type=question_meta["interaction_type"],
                question_kind=question_meta["question_kind"],
                option_specs=option_specs,
                progress_links=progress_links,
            )

        if question_type == "ordering":
            if title and title not in prompt:
                prompt = f"{prompt.rstrip('.')} bei {title}."
            return base.build_sequence_question(
                source_ref=f"{source_key}::basis_v1",
                concept_key=concept_key,
                variant_key=f"{concept_key}::basis_v1",
                title=title,
                prompt=prompt,
                items=list(raw_question.get("correctOrder") or raw_question.get("items") or []),
                progress_links=progress_links,
            )

        if question_type == "number":
            return base.build_gap_fill_question(
                source_ref=f"{source_key}::basis_v1",
                concept_key=concept_key,
                variant_key=f"{concept_key}::basis_v1",
                title=title,
                prompt=prompt,
                expected=raw_question.get("expected", ""),
                progress_links=progress_links,
            )

        raise ValueError(f"Unbekannter Fragetyp {question_type!r} in {source_key}.")

    original_rebuild_database = base.rebuild_database

    def rebuild_database(pools: list[dict[str, Any]]) -> tuple[int, int, int, int]:
        result = original_rebuild_database(pools)
        with sqlite3.connect(base.QUIZ_DB_PATH) as conn:
            conn.execute(
                """
                UPDATE quiz_db_meta
                SET db_key = ?, course_key = ?, title = ?, description = ?, default_badge_label = ?
                WHERE id = 1
                """,
                (
                    Path(quiz_db_filename).stem,
                    course_code,
                    course_code,
                    load_course_description(),
                    "",
                ),
            )
            conn.commit()
        return result

    base.normalize_pool_slug = normalize_pool_slug
    base.build_concept_key = build_concept_key
    base.load_course_description = load_course_description
    base.build_pre_stage_pools = build_pre_stage_pools
    base.build_base_question = build_base_question
    base.rebuild_database = rebuild_database
    return base
