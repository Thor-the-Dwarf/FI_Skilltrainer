#!/usr/bin/env python3

from __future__ import annotations

import argparse
from collections import Counter
from copy import deepcopy
import json
import re
import sqlite3
from pathlib import Path
from typing import Any

from import_pv3wiso_quiz_to_db import (
    build_pool_description,
    normalize_visible_text as base_normalize_visible_text,
    slugify_visible_text,
    stable_id,
    strip_ticket_prefix,
    validate_visible_texts,
)


ROOT = Path(__file__).resolve().parents[2]
SCENARIO_ROOT = ROOT / "Kurse" / "LF01-Scenarien"
SCENARIO_MANIFEST_PATH = SCENARIO_ROOT / "scenario-manifest.json"
POSSIBLE_SKILLS_PATH = SCENARIO_ROOT / "possible_skills.json"
QUIZ_DB_PATH = ROOT / "Kurse" / "LF01-Quiz.db"
SCHEMA_PATH = ROOT / "QuizMaster" / "sql" / "quiz_db_schema_v1.sql"
BASE_QUESTION_COUNT = 59
PRE_STAGE_QUESTION_COUNT = 118
BATCH_SIZE = 100
DEFAULT_QUESTION_LIMIT = 100
MAX_STAGE_COUNT = 9
MAX_QUESTION_LIMIT = PRE_STAGE_QUESTION_COUNT + (MAX_STAGE_COUNT * BATCH_SIZE)

QUESTION_META_BY_TYPE = {
    "single_choice": {
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
    },
    "multi_select": {
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
    },
    "ordering": {
        "interaction_type": "sequence",
        "question_kind": "reihenfolge_bestimmen",
    },
    "number": {
        "interaction_type": "gap_fill_text",
        "question_kind": "luecke_fuellen",
    },
}

BADGE_LABEL_BY_INTERACTION = {
    "single": "Welche Antwort passt am besten?",
    "multi": "Welche Aussagen treffen zu?",
    "sequence": "Was kommt zuerst / danach / zuletzt?",
    "gap_fill_text": "Welche Eingabe ergänzt die Angabe sinnvoll?",
}

SHORT_TEXT_BASE_PROMPTS = (
    "Welche Fassung trifft bei {title} den erwarteten Kern am besten?",
    "Welche Antwort passt bei {title} am besten zu einer belastbaren Ausarbeitung?",
    "Welche Formulierung deckt bei {title} die wesentlichen Punkte am vollständigsten ab?",
)

SINGLE_RATIONALE_PROMPTS = (
    "Welche Begründung erklärt bei {title} die richtige Antwort am besten?",
    "Welche Erläuterung trägt die passende Entscheidung bei {title} am zuverlässigsten?",
    "Welche Begründung macht den richtigen Schritt bei {title} am deutlichsten?",
)

MULTI_COUNTEREXAMPLE_PROMPTS = (
    "Welche Aussage passt bei {title} fachlich am wenigsten?",
    "Welche Aussage wäre bei {title} das klarste Gegenbeispiel zu sauberem Vorgehen?",
    "Welche Aussage ist bei {title} am ehesten unzutreffend?",
)

ORDERING_FIRST_PROMPTS = (
    "Welcher Schritt eröffnet {title} sinnvoll?",
    "Womit sollte {title} fachlich beginnen?",
    "Welcher Einstieg passt bei {title} zuerst?",
)

ORDERING_LAST_PROMPTS = (
    "Welcher Schritt schließt {title} sinnvoll ab?",
    "Womit endet {title} in einer belastbaren Reihenfolge?",
    "Welcher Schritt steht bei {title} ganz am Ende?",
)

NUMBER_INTERPRETATION_PROMPTS = (
    "Welche Aussage beschreibt das Ergebnis von {title} richtig?",
    "Welche Formulierung passt bei {title} zum berechneten Wert?",
    "Welche Aussage deutet das Ergebnis von {title} fachlich korrekt?",
)

SHORT_TEXT_DISTRACTORS: tuple[tuple[str, str], ...] = (
    (
        "Sie bleibt absichtlich allgemein und vermeidet klare Verantwortlichkeiten.",
        "Eine belastbare Antwort braucht konkrete Verantwortungen und bleibt nicht bewusst vage.",
    ),
    (
        "Sie sammelt lose Stichworte, ohne einen nachvollziehbaren roten Faden zu bilden.",
        "Stichworte allein reichen nicht; die Antwort muss die Punkte erkennbar verbinden.",
    ),
    (
        "Sie konzentriert sich fast nur auf persönliche Vorlieben statt auf die betriebliche Aufgabe.",
        "LF01 fragt nach professionellem Handeln im Betrieb und nicht nach bloßen Vorlieben.",
    ),
)

OPTION_ORDER_VARIANTS: dict[int, tuple[tuple[int, ...], ...]] = {
    3: ((1, 0, 2), (2, 0, 1), (1, 2, 0)),
    4: ((1, 3, 0, 2), (2, 0, 3, 1), (3, 1, 0, 2), (2, 3, 1, 0)),
    5: ((2, 0, 4, 1, 3), (1, 4, 0, 2, 3), (3, 0, 2, 4, 1), (4, 1, 3, 0, 2)),
}

STAGE_VARIANT_CONFIGS = (
    {
        "stage_label": "stage1",
        "stage_suffix": "fokus_v2",
        "single_templates": (
            "Welche Entscheidung passt bei {title}?",
            "Welche Antwort trägt {title} fachlich am besten?",
            "Was trifft bei {title} am besten zu?",
        ),
        "multi_templates": (
            "Welche Punkte passen bei {title}?",
            "Welche Aussagen tragen {title} fachlich?",
            "Was gehört bei {title} dazu?",
        ),
    },
    {
        "stage_label": "stage2",
        "stage_suffix": "praxis_v3",
        "single_templates": (
            "Welche Lösung passt im Praxisfall {title}?",
            "Welche Reaktion ist bei {title} tragfähig?",
            "Was ist bei {title} der passende Schritt?",
        ),
        "multi_templates": (
            "Welche Punkte tragen den Praxisfall {title}?",
            "Welche Aussagen sind bei {title} praxisnah richtig?",
            "Was gehört im Fall {title} fachlich dazu?",
        ),
    },
    {
        "stage_label": "stage3",
        "stage_suffix": "einordnung_v4",
        "single_templates": (
            "Wie ist {title} fachlich einzuordnen?",
            "Welche Antwort ordnet {title} richtig ein?",
            "Welche Auswahl passt zur Einordnung von {title}?",
        ),
        "multi_templates": (
            "Welche Punkte ordnen {title} richtig ein?",
            "Welche Aussagen passen zur Einordnung von {title}?",
            "Was ist bei {title} fachlich einzuordnen?",
        ),
    },
    {
        "stage_label": "stage4",
        "stage_suffix": "steuerung_v5",
        "single_templates": (
            "Welche Antwort steuert {title} in die richtige Richtung?",
            "Welche Entscheidung hält {title} auf Kurs?",
            "Welcher Schritt trägt die Steuerung bei {title}?",
        ),
        "multi_templates": (
            "Welche Punkte halten {title} auf Kurs?",
            "Welche Aussagen tragen die Steuerung bei {title}?",
            "Was ist für die Steuerung von {title} wichtig?",
        ),
    },
    {
        "stage_label": "stage5",
        "stage_suffix": "bewertung_v6",
        "single_templates": (
            "Welche Antwort bewertet {title} am treffendsten?",
            "Welche Entscheidung ist bei {title} am belastbarsten?",
            "Welche Auswahl passt zur Bewertung von {title}?",
        ),
        "multi_templates": (
            "Welche Punkte bewerten {title} treffend?",
            "Welche Aussagen sind bei {title} belastbar?",
            "Was passt zur Bewertung von {title}?",
        ),
    },
    {
        "stage_label": "stage6",
        "stage_suffix": "vertiefung_v7",
        "single_templates": (
            "Welche Antwort vertieft {title} sinnvoll?",
            "Welche Entscheidung passt in der Vertiefung von {title}?",
            "Was trägt {title} in der Vertiefung?",
        ),
        "multi_templates": (
            "Welche Punkte vertiefen {title} sinnvoll?",
            "Welche Aussagen passen in der Vertiefung von {title}?",
            "Was gehört zur Vertiefung von {title}?",
        ),
    },
    {
        "stage_label": "stage7",
        "stage_suffix": "transfer_v8",
        "single_templates": (
            "Welche Antwort überträgt {title} sauber in die Praxis?",
            "Welche Entscheidung passt im Transfer von {title}?",
            "Was zeigt bei {title} guten Transfer?",
        ),
        "multi_templates": (
            "Welche Punkte übertragen {title} sauber in die Praxis?",
            "Welche Aussagen passen im Transfer von {title}?",
            "Was zeigt bei {title} guten Transfer?",
        ),
    },
    {
        "stage_label": "stage8",
        "stage_suffix": "reflexion_v9",
        "single_templates": (
            "Welche Antwort reflektiert {title} fachlich richtig?",
            "Welche Entscheidung passt in der Reflexion von {title}?",
            "Was hält die Reflexion bei {title} tragfähig?",
        ),
        "multi_templates": (
            "Welche Punkte reflektieren {title} fachlich richtig?",
            "Welche Aussagen passen in der Reflexion von {title}?",
            "Was gehört in die Reflexion von {title}?",
        ),
    },
    {
        "stage_label": "stage9",
        "stage_suffix": "abschluss_v10",
        "single_templates": (
            "Welche Antwort schließt {title} fachlich sauber ab?",
            "Welche Entscheidung passt zum Abschluss von {title}?",
            "Was rundet {title} tragfähig ab?",
        ),
        "multi_templates": (
            "Welche Punkte schließen {title} fachlich sauber ab?",
            "Welche Aussagen passen zum Abschluss von {title}?",
            "Was rundet {title} tragfähig ab?",
        ),
    },
)


def normalize_visible_text(value: Any) -> str:
    text = base_normalize_visible_text(value)
    text = text.replace(" (Mehrfachauswahl)", "")
    text = re.sub(r"\bTicket\b", "Vorgang", text)
    text = re.sub(r"\bticket\b", "vorgang", text)
    text = re.sub(r"\bTickets\b", "Vorgänge", text)
    text = re.sub(r"\btickets\b", "vorgänge", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_prompt(value: Any) -> str:
    return normalize_visible_text(value)


def normalize_answer(value: Any) -> str:
    text = normalize_visible_text(value).lower()
    text = text.replace(",", ".")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_pool_slug(value: str) -> str:
    slug = slugify_visible_text(strip_ticket_prefix(value))
    return slug or "lf01-pool"


def build_concept_key(pool_slug: str, title: str) -> str:
    return f"lf01::{pool_slug}::{slugify_visible_text(title)}"


def badge_label_for_interaction(interaction_type: str) -> str:
    return BADGE_LABEL_BY_INTERACTION.get(str(interaction_type or "").strip(), "Aufgabe")


def collapse_single_value(values: list[str]) -> str | None:
    unique_values = sorted({value for value in values if value})
    if len(unique_values) == 1:
        return unique_values[0]
    return None


def load_topic_titles() -> dict[str, str]:
    data = json.loads(POSSIBLE_SKILLS_PATH.read_text(encoding="utf-8"))
    titles: dict[str, str] = {}

    def walk_sections(sections: list[dict[str, Any]]) -> None:
        for section in sections:
            if not isinstance(section, dict):
                continue
            section_id = str(section.get("id", "")).strip()
            title = normalize_visible_text(section.get("title", ""))
            if section_id and title:
                titles[section_id] = title
            for key in ("sections", "subsections"):
                nested = section.get(key, [])
                if isinstance(nested, list):
                    walk_sections(nested)

    walk_sections(data.get("sections", []))
    return titles


def collect_pool_topics(
    fallback_label: str,
    questions: list[dict[str, Any]],
    topic_titles: dict[str, str],
) -> list[str]:
    topics: list[str] = [fallback_label]
    seen = {fallback_label}

    for question in questions:
        for progress_link in question.get("progress_links", []):
            title = topic_titles.get(progress_link)
            if not title or title in seen:
                continue
            seen.add(title)
            topics.append(title)

    return topics


def get_correct_flags(question: dict[str, Any]) -> list[bool]:
    options = question.get("options", [])
    raw_correct_index = question.get("correctIndex")
    correct_index = raw_correct_index if isinstance(raw_correct_index, int) else None

    flags: list[bool] = []
    for index, option in enumerate(options):
        if not isinstance(option, dict):
            flags.append(False)
            continue
        if "correct" in option:
            flags.append(bool(option.get("correct")))
        else:
            flags.append(correct_index == index)
    return flags


def build_option_records(
    option_specs: list[dict[str, Any]],
    source_ref: str,
) -> tuple[list[dict[str, Any]], int]:
    records: list[dict[str, Any]] = []
    correct_count = 0

    for option_index, option in enumerate(option_specs, start=1):
        text = normalize_visible_text(option.get("text", ""))
        explanation = normalize_visible_text(option.get("explanation", ""))
        if not text:
            raise ValueError(f"Leere Option in {source_ref}.")
        validate_visible_texts([text, explanation])
        is_correct = 1 if option.get("correct") else 0
        correct_count += is_correct
        records.append(
            {
                "source_option_id": str(option.get("id") or option_index),
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": text,
                "explanation": explanation,
                "is_correct": is_correct,
            }
        )

    return records, correct_count


def build_choice_question(
    *,
    source_ref: str,
    concept_key: str,
    variant_key: str,
    title: str,
    prompt: str,
    interaction_type: str,
    question_kind: str,
    option_specs: list[dict[str, Any]],
    progress_links: list[str],
    badge_label: str | None = None,
) -> dict[str, Any]:
    options, correct_count = build_option_records(option_specs, source_ref)
    if interaction_type == "single" and correct_count != 1:
        raise ValueError(f"{source_ref} braucht genau eine richtige Antwort.")
    if interaction_type == "multi" and correct_count < 2:
        raise ValueError(f"{source_ref} braucht mindestens zwei richtige Antworten.")

    normalized_title = normalize_visible_text(title)
    normalized_prompt = normalize_prompt(prompt)
    validate_visible_texts([normalized_title, normalized_prompt])

    return {
        "source_ref": source_ref,
        "concept_key": concept_key,
        "variant_key": variant_key,
        "title": normalized_title,
        "prompt": normalized_prompt,
        "context": "",
        "interaction_type": interaction_type,
        "question_kind": question_kind,
        "badge_label": normalize_visible_text(badge_label or badge_label_for_interaction(interaction_type)),
        "max_selections": 1 if interaction_type == "single" else correct_count,
        "is_new": 0,
        "options": options,
        "sequence_items": [],
        "accepted_answers": [],
        "progress_links": progress_links,
    }


def build_sequence_question(
    *,
    source_ref: str,
    concept_key: str,
    variant_key: str,
    title: str,
    prompt: str,
    items: list[str],
    progress_links: list[str],
) -> dict[str, Any]:
    clean_items = [normalize_visible_text(item) for item in items if normalize_visible_text(item)]
    if len(clean_items) < 2:
        raise ValueError(f"Zu wenige Reihenfolge-Elemente in {source_ref}.")
    validate_visible_texts([normalize_visible_text(title), normalize_prompt(prompt), *clean_items])

    return {
        "source_ref": source_ref,
        "concept_key": concept_key,
        "variant_key": variant_key,
        "title": normalize_visible_text(title),
        "prompt": normalize_prompt(prompt),
        "context": "",
        "interaction_type": "sequence",
        "question_kind": "reihenfolge_bestimmen",
        "badge_label": badge_label_for_interaction("sequence"),
        "max_selections": len(clean_items),
        "is_new": 0,
        "options": [],
        "sequence_items": [
            {
                "item_key": f"ITEM{index}",
                "sort_order": index,
                "text": item,
            }
            for index, item in enumerate(clean_items, start=1)
        ],
        "accepted_answers": [],
        "progress_links": progress_links,
    }


def infer_number_unit(prompt: str) -> str:
    for unit in ("Minuten", "Stunden", "EUR", "Euro", "Punkte", "Meilensteine", "Anforderungen"):
        if unit in prompt:
            return unit
    return ""


def build_numeric_answers(expected: Any, prompt: str) -> list[dict[str, Any]]:
    answer_text = normalize_visible_text(expected)
    answers = [answer_text]
    unit = infer_number_unit(normalize_visible_text(prompt))
    if unit:
        answers.append(f"{answer_text} {unit}")

    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw_answer in answers:
        normalized = normalize_answer(raw_answer)
        if normalized in seen:
            continue
        seen.add(normalized)
        records.append(
            {
                "answer_text": normalize_visible_text(raw_answer),
                "normalized_answer": normalized,
                "is_primary": 1 if not records else 0,
            }
        )
    return records


def build_gap_fill_question(
    *,
    source_ref: str,
    concept_key: str,
    variant_key: str,
    title: str,
    prompt: str,
    expected: Any,
    progress_links: list[str],
) -> dict[str, Any]:
    validate_visible_texts([normalize_visible_text(title), normalize_prompt(prompt)])
    return {
        "source_ref": source_ref,
        "concept_key": concept_key,
        "variant_key": variant_key,
        "title": normalize_visible_text(title),
        "prompt": normalize_prompt(prompt),
        "context": "",
        "interaction_type": "gap_fill_text",
        "question_kind": "luecke_fuellen",
        "badge_label": badge_label_for_interaction("gap_fill_text"),
        "max_selections": 1,
        "is_new": 0,
        "options": [],
        "sequence_items": [],
        "accepted_answers": build_numeric_answers(expected, prompt),
        "progress_links": progress_links,
    }


def split_outline_components(outline: Any) -> list[str]:
    text = normalize_visible_text(outline).strip().rstrip(".")
    if not text:
        return []
    parts = [part.strip() for part in re.split(r",|\bund\b", text) if part.strip()]
    return parts or [text]


def join_visible_list(parts: list[str]) -> str:
    cleaned = [normalize_visible_text(part).strip().rstrip(".") for part in parts if normalize_visible_text(part)]
    if not cleaned:
        return ""
    if len(cleaned) == 1:
        return cleaned[0]
    if len(cleaned) == 2:
        return f"{cleaned[0]} und {cleaned[1]}"
    return f"{', '.join(cleaned[:-1])} und {cleaned[-1]}"


def build_short_text_base_question(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]
    outline_parts = split_outline_components(raw_question.get("expectedOutline", ""))
    outline_text = join_visible_list(outline_parts)
    correct_text = f"Sie verbindet {outline_text}." if outline_text else "Sie greift die geforderten Punkte klar und nachvollziehbar auf."
    prompt = pick_template(f"{source_key}::short_text_base", SHORT_TEXT_BASE_PROMPTS).format(title=title)

    option_specs = [
        {
            "id": "a",
            "text": correct_text,
            "correct": True,
            "explanation": "Diese Fassung deckt den erwarteten Kern am vollständigsten ab.",
        }
    ]
    for index, (text, explanation) in enumerate(SHORT_TEXT_DISTRACTORS, start=1):
        option_specs.append(
            {
                "id": f"b{index}",
                "text": text,
                "correct": False,
                "explanation": explanation,
            }
        )

    return build_choice_question(
        source_ref=f"{source_key}::basis_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::basis_v1",
        title=title,
        prompt=prompt,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=option_specs,
        progress_links=progress_links,
        badge_label="Welche Fassung passt am besten?",
    )


def build_base_question(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
) -> dict[str, Any]:
    question_type = str(raw_question.get("type", "")).strip()
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]

    if question_type == "short_text":
        return build_short_text_base_question(
            scenario_rel_path=scenario_rel_path,
            pool_slug=pool_slug,
            raw_question=raw_question,
        )

    question_meta = QUESTION_META_BY_TYPE[question_type]
    prompt = normalize_prompt(raw_question.get("prompt", ""))

    if question_type in {"single_choice", "multi_select"}:
        correct_flags = get_correct_flags(raw_question)
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
        return build_choice_question(
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
        return build_sequence_question(
            source_ref=f"{source_key}::basis_v1",
            concept_key=concept_key,
            variant_key=f"{concept_key}::basis_v1",
            title=title,
            prompt=prompt,
            items=list(raw_question.get("correctOrder") or raw_question.get("items") or []),
            progress_links=progress_links,
        )

    if question_type == "number":
        return build_gap_fill_question(
            source_ref=f"{source_key}::basis_v1",
            concept_key=concept_key,
            variant_key=f"{concept_key}::basis_v1",
            title=title,
            prompt=prompt,
            expected=raw_question.get("expected", ""),
            progress_links=progress_links,
        )

    raise ValueError(f"Unbekannter Fragetyp {question_type!r} in {source_key}.")


def pick_template(source_key: str, templates: tuple[str, ...]) -> str:
    if not templates:
        raise ValueError("Leere Template-Liste.")
    return templates[sum(ord(char) for char in source_key) % len(templates)]


def reorder_existing_options(source_key: str, options: list[dict[str, Any]]) -> list[dict[str, Any]]:
    orders = OPTION_ORDER_VARIANTS.get(len(options))
    if not orders:
        return [deepcopy(option) for option in options]

    order = orders[sum(ord(char) for char in source_key) % len(orders)]
    reordered: list[dict[str, Any]] = []
    for new_sort_order, old_index in enumerate(order, start=1):
        option = deepcopy(options[old_index])
        option["sort_order"] = new_sort_order
        reordered.append(option)
    return reordered


def build_single_rationale_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]
    correct_flags = get_correct_flags(raw_question)
    option_specs: list[dict[str, Any]] = []

    for index, option in enumerate(raw_question.get("options", []), start=1):
        option_specs.append(
            {
                "id": f"r{index}",
                "text": option.get("rationale", ""),
                "correct": correct_flags[index - 1],
                "explanation": "Diese Begründung gehört zur passenden Antwort." if correct_flags[index - 1] else "Diese Begründung trägt die richtige Antwort nicht.",
            }
        )

    return build_choice_question(
        source_ref=f"{source_key}::begruendung_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::begruendung_v1",
        title=f"{title}: Begründung prüfen",
        prompt=pick_template(f"{source_key}::begruendung_prompt", SINGLE_RATIONALE_PROMPTS).format(title=title),
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=option_specs,
        progress_links=progress_links,
        badge_label="Welche Begründung passt?",
    )


def build_multi_counterexample_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]
    options = list(raw_question.get("options", []))
    correct_flags = get_correct_flags(raw_question)
    wrong_indices = [index for index, flag in enumerate(correct_flags) if not flag]
    right_indices = [index for index, flag in enumerate(correct_flags) if flag]
    if not wrong_indices or len(right_indices) < 2:
        raise ValueError(f"Multi-Gegenbeispiel braucht falsche und richtige Aussagen in {source_key}.")

    chosen_wrong = wrong_indices[0]
    candidate_indices = [chosen_wrong] + right_indices[:3]
    option_specs: list[dict[str, Any]] = []
    for position, index in enumerate(candidate_indices, start=1):
        option = options[index]
        option_specs.append(
            {
                "id": f"c{position}",
                "text": option.get("text", ""),
                "correct": index == chosen_wrong,
                "explanation": option.get("rationale", ""),
            }
        )

    return build_choice_question(
        source_ref=f"{source_key}::gegenbeispiel_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::gegenbeispiel_v1",
        title=f"{title}: Gegenbeispiel erkennen",
        prompt=pick_template(f"{source_key}::gegenbeispiel_prompt", MULTI_COUNTEREXAMPLE_PROMPTS).format(title=title),
        interaction_type="single",
        question_kind="gegenbeispiel_erkennen",
        option_specs=option_specs,
        progress_links=progress_links,
        badge_label="Welche Aussage passt am wenigsten?",
    )


def build_ordering_edge_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    edge: str,
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]
    ordered_items = [normalize_visible_text(item) for item in raw_question.get("correctOrder", []) if normalize_visible_text(item)]
    if len(ordered_items) < 2:
        raise ValueError(f"Zu wenige Reihenfolge-Elemente in {source_key}.")

    correct_item = ordered_items[0] if edge == "first" else ordered_items[-1]
    prompt_templates = ORDERING_FIRST_PROMPTS if edge == "first" else ORDERING_LAST_PROMPTS
    option_specs = [
        {
            "id": f"o{index}",
            "text": item,
            "correct": item == correct_item,
            "explanation": "Dieser Schritt passt an diese Stelle im Ablauf." if item == correct_item else "Dieser Schritt gehört an eine andere Stelle der Reihenfolge.",
        }
        for index, item in enumerate(ordered_items, start=1)
    ]

    return build_choice_question(
        source_ref=f"{source_key}::{'einstieg' if edge == 'first' else 'abschluss'}_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::{'einstieg' if edge == 'first' else 'abschluss'}_v1",
        title=f"{title}: {'Einstieg' if edge == 'first' else 'Abschluss'} bestimmen",
        prompt=pick_template(f"{source_key}::{edge}_prompt", prompt_templates).format(title=title),
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=option_specs,
        progress_links=progress_links,
        badge_label="Welcher Schritt passt hier?",
    )


def build_number_values(expected: int | float) -> list[int | float]:
    base = float(expected)
    if base >= 100:
        offsets = [10, -10, 20]
    elif base >= 20:
        offsets = [5, -5, 8]
    else:
        offsets = [2, -2, 3]

    values: list[int | float] = [expected]
    for offset in offsets:
        candidate = base + offset
        if candidate >= 0 and candidate not in values:
            if float(candidate).is_integer():
                values.append(int(candidate))
            else:
                values.append(round(candidate, 2))
    return values[:4]


def build_number_interpretation_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [str(link).strip() for link in raw_question.get("progressLinks", []) if str(link).strip()]
    prompt_text = normalize_prompt(raw_question.get("prompt", ""))
    expected = raw_question.get("expected", 0)
    unit = infer_number_unit(prompt_text)
    values = build_number_values(int(expected) if isinstance(expected, int) else float(expected))
    option_specs: list[dict[str, Any]] = []

    for index, value in enumerate(values, start=1):
        label = f"{value} {unit}".strip()
        option_specs.append(
            {
                "id": f"n{index}",
                "text": f"Das Ergebnis beträgt {label}.",
                "correct": value == expected,
                "explanation": f"Die korrekte Berechnung führt zu {label}." if value == expected else f"Dieser Wert ergibt sich aus der Aufgabe nicht korrekt.",
            }
        )

    return build_choice_question(
        source_ref=f"{source_key}::aussage_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::aussage_v1",
        title=f"{title}: Ergebnis deuten",
        prompt=pick_template(f"{source_key}::zahl_prompt", NUMBER_INTERPRETATION_PROMPTS).format(title=title),
        interaction_type="single",
        question_kind="vergleich_treffen",
        option_specs=option_specs,
        progress_links=progress_links,
        badge_label="Welche Aussage passt zum Ergebnis?",
    )


def collect_questions_for_scenario(
    scenario_rel_path: str,
    scenario_data: dict[str, Any],
) -> list[dict[str, Any]]:
    pool_slug = normalize_pool_slug(Path(scenario_rel_path).parent.name)
    questions: list[dict[str, Any]] = []
    base_count = 0

    for raw_question in scenario_data.get("questions", []):
        question_type = str(raw_question.get("type", "")).strip()
        if question_type == "followup_divider":
            continue

        questions.append(
            build_base_question(
                scenario_rel_path=scenario_rel_path,
                pool_slug=pool_slug,
                raw_question=raw_question,
            )
        )
        base_count += 1

        if question_type == "single_choice":
            questions.append(
                build_single_rationale_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                )
            )
        elif question_type == "multi_select":
            questions.append(
                build_multi_counterexample_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                )
            )
        elif question_type == "ordering":
            questions.append(
                build_ordering_edge_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    edge="first",
                )
            )
            questions.append(
                build_ordering_edge_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    edge="last",
                )
            )
        elif question_type == "number":
            questions.append(
                build_number_interpretation_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                )
            )

    if base_count <= 0:
        raise ValueError(f"Keine Basisfragen in {scenario_rel_path} gefunden.")

    return questions


def build_pre_stage_pools() -> list[dict[str, Any]]:
    manifest = json.loads(SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
    topic_titles = load_topic_titles()
    pools: list[dict[str, Any]] = []

    for entry in manifest.get("scenarios", []):
        scenario_rel_path = str(entry.get("file", "")).strip()
        if not scenario_rel_path:
            continue

        scenario_path = SCENARIO_ROOT / scenario_rel_path
        scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
        questions = collect_questions_for_scenario(scenario_rel_path, scenario_data)
        label = normalize_visible_text(strip_ticket_prefix(str(entry.get("label", ""))))
        description = normalize_visible_text(build_pool_description(scenario_data))
        validate_visible_texts([label, description])

        pools.append(
            {
                "id": stable_id("pool", scenario_rel_path),
                "slug": normalize_pool_slug(scenario_path.parent.name),
                "label": label,
                "description": description,
                "source_ref": scenario_rel_path,
                "default_interaction_type": collapse_single_value([question["interaction_type"] for question in questions]),
                "default_question_kind": collapse_single_value([question["question_kind"] for question in questions]),
                "default_badge_label": collapse_single_value([question["badge_label"] for question in questions]) or "Aufgabe",
                "topics": collect_pool_topics(label, questions, topic_titles),
                "questions": questions,
            }
        )

    total_questions = sum(len(pool["questions"]) for pool in pools)
    if total_questions != PRE_STAGE_QUESTION_COUNT:
        raise ValueError(
            f"LF01-Vorstufe erzeugt {total_questions} Fragen statt {PRE_STAGE_QUESTION_COUNT}."
        )

    base_only = sum(
        1
        for pool in pools
        for question in pool["questions"]
        if question["variant_key"].endswith("basis_v1")
    )
    if base_only != BASE_QUESTION_COUNT:
        raise ValueError(
            f"LF01-Basis erzeugt {base_only} Fragen statt {BASE_QUESTION_COUNT}."
        )

    return pools


def clone_pool_structure(pools: list[dict[str, Any]], include_questions: bool) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    cloned_pools: list[dict[str, Any]] = []
    by_id: dict[str, dict[str, Any]] = {}

    for pool in pools:
        cloned_pool = {
            key: deepcopy(value)
            for key, value in pool.items()
            if key != "questions"
        }
        cloned_pool["questions"] = [deepcopy(question) for question in pool["questions"]] if include_questions else []
        cloned_pools.append(cloned_pool)
        by_id[pool["id"]] = cloned_pool

    return cloned_pools, by_id


def select_pre_stage_pools(
    pools: list[dict[str, Any]],
    target_question_count: int,
) -> list[dict[str, Any]]:
    selected_pools, _ = clone_pool_structure(pools, include_questions=False)
    if target_question_count >= PRE_STAGE_QUESTION_COUNT:
        for selected_pool, pool in zip(selected_pools, pools):
            selected_pool["questions"] = [deepcopy(question) for question in pool["questions"]]
        return selected_pools

    round_index = 0
    selected_count = 0
    while selected_count < target_question_count:
        progressed = False
        for selected_pool, pool in zip(selected_pools, pools):
            if selected_count >= target_question_count:
                break
            if round_index >= len(pool["questions"]):
                continue
            selected_pool["questions"].append(deepcopy(pool["questions"][round_index]))
            selected_count += 1
            progressed = True
        if not progressed:
            break
        round_index += 1

    return selected_pools


def build_choice_candidate_cycle(pools: list[dict[str, Any]]) -> list[tuple[str, dict[str, Any]]]:
    by_concept: dict[str, list[tuple[str, dict[str, Any]]]] = {}

    for pool in pools:
        for question in pool["questions"]:
            if question["interaction_type"] not in {"single", "multi"}:
                continue
            by_concept.setdefault(question["concept_key"], []).append((pool["id"], question))

    concept_keys = sorted(by_concept)
    for concept_key in concept_keys:
        by_concept[concept_key].sort(key=lambda entry: entry[1]["source_ref"])

    selected: list[tuple[str, dict[str, Any]]] = []
    round_index = 0
    while True:
        progressed = False
        for concept_key in concept_keys:
            candidates = by_concept[concept_key]
            if round_index >= len(candidates):
                continue
            selected.append(candidates[round_index])
            progressed = True
        if not progressed:
            break
        round_index += 1

    return selected


def select_stage_candidates(
    candidate_cycle: list[tuple[str, dict[str, Any]]],
    *,
    offset: int,
    target: int,
) -> list[tuple[str, dict[str, Any], int]]:
    if not candidate_cycle:
        raise ValueError("Keine Choice-Kandidaten für LF01-Stufenvarianten gefunden.")

    cycle_length = len(candidate_cycle)
    start_index = offset % cycle_length
    selected: list[tuple[str, dict[str, Any], int]] = []

    for local_index in range(target):
        stage_index = start_index + local_index
        pass_index = stage_index // cycle_length
        pool_id, question = candidate_cycle[stage_index % cycle_length]
        selected.append((pool_id, question, pass_index))

    return selected


def build_choice_variant_suffix(question: dict[str, Any], stage_suffix: str) -> str:
    current_suffix = str(question["variant_key"]).split("::")[-1]
    if re.match(r".+_v\d+$", current_suffix):
        current_suffix = re.sub(r"_v\d+$", "", current_suffix)
    return f"{current_suffix}_{stage_suffix}"


def clone_choice_stage_variant(
    question: dict[str, Any],
    *,
    stage_suffix: str,
    pass_index: int,
    single_templates: tuple[str, ...],
    multi_templates: tuple[str, ...],
) -> dict[str, Any]:
    templates = multi_templates if question["interaction_type"] == "multi" else single_templates
    title = normalize_visible_text(question.get("title", "diesem Punkt"))
    stage_variant_suffix = stage_suffix if pass_index == 0 else f"{stage_suffix}_p{pass_index + 1}"
    variant_suffix = build_choice_variant_suffix(question, stage_variant_suffix)
    cloned = deepcopy(question)
    cloned["source_ref"] = f"{question['source_ref']}::{variant_suffix}"
    cloned["variant_key"] = f"{question['concept_key']}::{variant_suffix}"
    cloned["prompt"] = normalize_visible_text(
        pick_template(f"{question['source_ref']}::{stage_variant_suffix}", templates).format(title=title)
    )
    cloned["options"] = reorder_existing_options(cloned["source_ref"], question["options"])
    cloned["is_new"] = 0
    validate_visible_texts([cloned["title"], cloned["prompt"], cloned["badge_label"]])
    return cloned


def add_choice_stage_variants(
    pools: list[dict[str, Any]],
    pool_by_id: dict[str, dict[str, Any]],
    *,
    candidate_cycle: list[tuple[str, dict[str, Any]]],
    offset: int,
    target: int,
    stage_suffix: str,
    single_templates: tuple[str, ...],
    multi_templates: tuple[str, ...],
) -> int:
    selected = select_stage_candidates(candidate_cycle, offset=offset, target=target)
    for pool_id, question, pass_index in selected:
        pool_by_id[pool_id]["questions"].append(
            clone_choice_stage_variant(
                question,
                stage_suffix=stage_suffix,
                pass_index=pass_index,
                single_templates=single_templates,
                multi_templates=multi_templates,
            )
        )
    return len(selected)


def collect_pools(target_question_count: int) -> tuple[list[dict[str, Any]], list[tuple[str, int]]]:
    if target_question_count < 0:
        raise ValueError("Negatives LF01-Ziel ist unzulässig.")
    if target_question_count > MAX_QUESTION_LIMIT:
        raise ValueError(
            f"LF01-Ziel {target_question_count} überschreitet das Maximalziel {MAX_QUESTION_LIMIT}."
        )

    pre_stage_pools = build_pre_stage_pools()
    stage_results: list[tuple[str, int]] = []

    if target_question_count <= PRE_STAGE_QUESTION_COUNT:
        return select_pre_stage_pools(pre_stage_pools, target_question_count), stage_results

    selected_pools, pool_by_id = clone_pool_structure(pre_stage_pools, include_questions=True)
    candidate_cycle = build_choice_candidate_cycle(pre_stage_pools)
    additional_needed = target_question_count - PRE_STAGE_QUESTION_COUNT
    offset = 0

    for config in STAGE_VARIANT_CONFIGS:
        if additional_needed <= 0:
            break
        stage_target = min(BATCH_SIZE, additional_needed)
        added = add_choice_stage_variants(
            selected_pools,
            pool_by_id,
            candidate_cycle=candidate_cycle,
            offset=offset,
            target=stage_target,
            stage_suffix=config["stage_suffix"],
            single_templates=config["single_templates"],
            multi_templates=config["multi_templates"],
        )
        stage_results.append((config["stage_label"], added))
        additional_needed -= added
        offset += BATCH_SIZE

    if additional_needed > 0:
        raise ValueError(f"LF01 fehlen noch {additional_needed} Fragen bis {target_question_count}.")

    return selected_pools, stage_results


def load_course_description() -> str:
    data = json.loads(POSSIBLE_SKILLS_PATH.read_text(encoding="utf-8"))
    subtitle = normalize_visible_text(data.get("subtitle", ""))
    intro_parts = [normalize_visible_text(entry) for entry in data.get("intro", []) if normalize_visible_text(entry)]
    intro = " ".join(intro_parts).strip()
    if subtitle and intro:
        return f"Quizdatenbank für {subtitle}. {intro}"
    if subtitle:
        return f"Quizdatenbank für {subtitle}."
    return "Quizdatenbank für LF01."


def rebuild_database(pools: list[dict[str, Any]]) -> tuple[int, int, int, int]:
    question_count = sum(len(pool["questions"]) for pool in pools)
    option_count = sum(len(question["options"]) for pool in pools for question in pool["questions"])
    sequence_item_count = sum(len(question["sequence_items"]) for pool in pools for question in pool["questions"])
    accepted_answer_count = sum(len(question["accepted_answers"]) for pool in pools for question in pool["questions"])

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")

    with sqlite3.connect(QUIZ_DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(schema_sql)
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
                "LF01-Quiz",
                "LF01",
                "LF01",
                load_course_description(),
                "de",
                "",
            ),
        )

        for pool_sort_order, pool in enumerate(pools, start=1):
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
                    pool["id"],
                    pool["slug"],
                    pool["label"],
                    pool["description"],
                    pool_sort_order,
                    pool["default_interaction_type"],
                    pool["default_question_kind"],
                    pool["default_badge_label"],
                    pool["source_ref"],
                    1,
                ),
            )

            for topic in pool["topics"]:
                conn.execute(
                    "INSERT INTO quiz_pool_topic (pool_id, topic) VALUES (?, ?)",
                    (pool["id"], topic),
                )

            for question_sort_order, question in enumerate(pool["questions"], start=1):
                question_id = stable_id("question", question["source_ref"])
                concept_id = stable_id("concept", question["concept_key"])
                variant_id = stable_id("variant", question["variant_key"])

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
                        pool["id"],
                        concept_id,
                        variant_id,
                        question_sort_order,
                        question["interaction_type"],
                        question["question_kind"],
                        question["badge_label"],
                        question["prompt"],
                        question["title"],
                        "",
                        question["max_selections"],
                        question["is_new"],
                        "",
                        "",
                        question["source_ref"],
                        1,
                    ),
                )

                for option in question["options"]:
                    option_id = stable_id(
                        "option",
                        f"{question['source_ref']}::{option['source_option_id']}::{option['sort_order']}",
                    )
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
                            option["option_key"],
                            option["sort_order"],
                            "",
                            option["text"],
                            option["explanation"],
                            option["is_correct"],
                            1,
                        ),
                    )

                for item in question["sequence_items"]:
                    item_id = stable_id("sequence_item", f"{question['source_ref']}::{item['item_key']}")
                    conn.execute(
                        """
                        INSERT INTO quiz_sequence_item (
                          id,
                          question_id,
                          item_key,
                          sort_order,
                          text
                        ) VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            item_id,
                            question_id,
                            item["item_key"],
                            item["sort_order"],
                            item["text"],
                        ),
                    )

                for answer_index, answer in enumerate(question["accepted_answers"], start=1):
                    answer_id = stable_id("accepted_answer", f"{question['source_ref']}::{answer_index}")
                    conn.execute(
                        """
                        INSERT INTO quiz_accepted_answer (
                          id,
                          question_id,
                          answer_text,
                          normalized_answer,
                          is_primary
                        ) VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            answer_id,
                            question_id,
                            answer["answer_text"],
                            answer["normalized_answer"],
                            answer["is_primary"],
                        ),
                    )

        conn.commit()

    return question_count, option_count, sequence_item_count, accepted_answer_count


def get_existing_question_count() -> int:
    if not QUIZ_DB_PATH.exists():
        return 0
    with sqlite3.connect(QUIZ_DB_PATH) as conn:
        row = conn.execute("SELECT COUNT(*) FROM quiz_question").fetchone()
    return int(row[0] if row else 0)


def resolve_target_question_count(question_limit: int | None) -> int:
    if question_limit is not None:
        return question_limit

    existing_count = get_existing_question_count()
    if existing_count <= 0:
        return DEFAULT_QUESTION_LIMIT
    return min(max(existing_count + BATCH_SIZE, DEFAULT_QUESTION_LIMIT), MAX_QUESTION_LIMIT)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importiert LF01-Trainingsfragen in die SQLite-Quizdatenbank.")
    parser.add_argument("--question-limit", type=int, default=None)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    target_question_count = resolve_target_question_count(args.question_limit)
    pools, stage_results = collect_pools(target_question_count)
    question_count, option_count, sequence_item_count, accepted_answer_count = rebuild_database(pools)

    print(f"db={QUIZ_DB_PATH.relative_to(ROOT)}")
    print(f"pools={len(pools)}")
    print(f"questions={question_count}")
    print(f"options={option_count}")
    print(f"sequence_items={sequence_item_count}")
    print(f"accepted_answers={accepted_answer_count}")
    for stage_label, added_questions in stage_results:
        print(f"{stage_label}_questions={added_questions}")


if __name__ == "__main__":
    main()
