#!/usr/bin/env python3

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from import_pv3wiso_quiz_to_db import strip_ticket_prefix


ROOT = Path(__file__).resolve().parents[2]
SCENARIO_ROOT = ROOT / "data" / "Kurse" / "LF12FIAE-Scenarien"
SCENARIO_MANIFEST_PATH = SCENARIO_ROOT / "scenario-manifest.json"
POSSIBLE_SKILLS_PATH = SCENARIO_ROOT / "possible_skills.json"
QUIZ_ROOT = ROOT / "data" / "Kurse" / "LF12FIAE-Quiz"
QUIZ_MANIFEST_PATH = QUIZ_ROOT / "quiz-manifest.json"

QUESTION_META_BY_TYPE = {
    "single_choice": {
        "interactionType": "single",
        "questionKind": "eine_richtige_antwort_waehlen",
        "badgeLabel": "Welche Antwort trifft am besten zu?",
    },
    "multi_select": {
        "interactionType": "multi",
        "questionKind": "mehrere_richtige_antworten_waehlen",
        "badgeLabel": "Welche Aussagen sind korrekt?",
    },
}


def clean_text(value: Any) -> str:
    text = str(value or "").replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s*\n\s*", " ", text)
    return text.strip()


def slugify_text(value: str) -> str:
    slug = clean_text(value).lower()
    slug = slug.replace("ae", "ae").replace("oe", "oe").replace("ue", "ue").replace("ss", "ss")
    slug = re.sub(r"[^a-z0-9]+", "_", slug).strip("_")
    return slug or "frage"


def load_topic_titles() -> dict[str, str]:
    data = json.loads(POSSIBLE_SKILLS_PATH.read_text(encoding="utf-8"))
    titles: dict[str, str] = {}

    def walk_sections(sections: list[dict[str, Any]]) -> None:
        for section in sections:
            if not isinstance(section, dict):
                continue
            section_id = str(section.get("id", "")).strip()
            title = clean_text(section.get("title", ""))
            if section_id and title:
                titles[section_id] = title
            for key in ("sections", "subsections"):
                nested = section.get(key, [])
                if isinstance(nested, list):
                    walk_sections(nested)

    walk_sections(data.get("sections", []))
    return titles


def get_correct_flags(question: dict[str, Any]) -> list[bool]:
    options = question.get("options", [])
    if not isinstance(options, list):
        return []

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


def build_ticket_id(scenario_filename: str) -> str:
    match = re.match(r"^ticket(\d+)_V\d+_(.+)\.json$", scenario_filename)
    if not match:
        raise ValueError(f"Kann ticketId aus {scenario_filename!r} nicht ableiten.")
    return f"{match.group(1)}_easy_{match.group(2)}.json"


def build_pool_description(scenario_data: dict[str, Any]) -> str:
    station_profile = clean_text(scenario_data.get("scenario", {}).get("station", {}).get("profile", ""))
    mission = clean_text(scenario_data.get("scenario", {}).get("mission", ""))
    if station_profile and mission:
        return f"{station_profile}. {mission}"
    return station_profile or mission


def clean_prompt(prompt: str, question_type: str) -> str:
    cleaned = clean_text(prompt)
    if question_type == "multi_select" and cleaned.endswith("(Mehrfachauswahl)"):
        cleaned = cleaned.removesuffix("(Mehrfachauswahl)").rstrip()
    return cleaned


def select_supported_questions(scenario_data: dict[str, Any], limit: int = 2) -> list[dict[str, Any]]:
    supported = [
        question
        for question in scenario_data.get("questions", [])
        if isinstance(question, dict) and question.get("type") in QUESTION_META_BY_TYPE
    ]
    if len(supported) < limit:
        raise ValueError("Zu wenige unterstuetzte Single-/Multi-Choice-Fragen im LF12-Szenario.")
    return supported[:limit]


def build_topics(
    label: str,
    selected_questions: list[dict[str, Any]],
    topic_titles: dict[str, str],
) -> list[str]:
    topics: list[str] = []
    seen: set[str] = set()

    def push(topic: str) -> None:
        value = clean_text(topic)
        if not value or value in seen:
            return
        seen.add(value)
        topics.append(value)

    push(label)
    for question in selected_questions:
        for progress_link in question.get("progressLinks", []):
            push(topic_titles.get(str(progress_link).strip(), ""))
    return topics or [label]


def build_question_record(pool_slug: str, raw_question: dict[str, Any], question_index: int) -> dict[str, Any]:
    question_type = str(raw_question.get("type", "")).strip()
    meta = QUESTION_META_BY_TYPE[question_type]
    source_question_id = str(raw_question.get("id", "")).strip()
    title = clean_text(raw_question.get("title", ""))
    prompt = clean_prompt(str(raw_question.get("prompt", "")), question_type)
    if not source_question_id or not prompt:
        raise ValueError("Unterstuetzte LF12-Fragen brauchen ID und Prompt.")

    correct_flags = get_correct_flags(raw_question)
    correct_count = sum(1 for flag in correct_flags if flag)
    if question_type == "single_choice" and correct_count != 1:
        raise ValueError(f"Single-Choice-Frage {source_question_id} hat {correct_count} richtige Antworten.")
    if question_type == "multi_select" and correct_count < 2:
        raise ValueError(f"Multi-Select-Frage {source_question_id} hat zu wenige richtige Antworten.")

    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    concept_core = progress_links[0] if progress_links else f"{pool_slug}_{slugify_text(title or prompt)}"
    title_slug = slugify_text(title or prompt)
    concept_id = f"{concept_core}_{title_slug}"
    variant_id = f"{concept_id}_v01"

    options: list[dict[str, Any]] = []
    for option_index, raw_option in enumerate(raw_question.get("options", []), start=1):
        if not isinstance(raw_option, dict):
            raise ValueError(f"Option {option_index} in {source_question_id} ist kein Objekt.")
        options.append(
            {
                "id": f"opt{option_index}",
                "text": clean_text(raw_option.get("text", "")),
                "correct": bool(correct_flags[option_index - 1]),
                "explanation": clean_text(raw_option.get("rationale", "")),
            }
        )

    return {
        "id": f"{pool_slug}_{source_question_id}",
        "conceptId": concept_id,
        "variantId": variant_id,
        "interactionType": meta["interactionType"],
        "questionKind": meta["questionKind"],
        "badgeLabel": meta["badgeLabel"],
        "isNew": question_index == 1,
        "prompt": prompt,
        "maxSelections": correct_count,
        "options": options,
    }


def build_quiz_file(entry: dict[str, Any], topic_titles: dict[str, str]) -> tuple[str, dict[str, Any], dict[str, Any]]:
    scenario_rel_path = str(entry.get("file", "")).strip()
    if not scenario_rel_path:
        raise ValueError("Szenarioeintrag ohne Dateipfad gefunden.")

    scenario_path = SCENARIO_ROOT / scenario_rel_path
    scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
    selected_questions = select_supported_questions(scenario_data, limit=2)

    label = clean_text(strip_ticket_prefix(str(entry.get("label", "")))) or clean_text(scenario_path.stem)
    quiz_folder_name = scenario_path.parent.name.replace("ticket_", "quiz_", 1)
    quiz_filename = scenario_path.name.replace("ticket", "quiz", 1)
    quiz_rel_path = f"{quiz_folder_name}/{quiz_filename}"
    pool_slug = quiz_folder_name.removeprefix("quiz_")

    questions = [
        build_question_record(pool_slug, raw_question, question_index)
        for question_index, raw_question in enumerate(selected_questions, start=1)
    ]
    topics = build_topics(label, selected_questions, topic_titles)

    quiz = {
        "scenarioFolder": "LF12FIAE-Scenarien",
        "quizFolder": "LF12FIAE-Quiz",
        "scenarioFile": scenario_rel_path,
        "quizFile": quiz_rel_path,
        "ticketId": build_ticket_id(scenario_path.name),
        "versionId": "V01",
        "title": label,
        "description": build_pool_description(scenario_data) or f"Quizfragen zu {label}.",
        "topics": topics,
        "questions": questions,
    }

    manifest_entry = {
        "file": quiz_rel_path,
        "label": label,
        "ticketId": quiz["ticketId"],
        "versionId": quiz["versionId"],
        "questionCount": len(questions),
        "topics": topics,
        "interactionTypes": sorted({question["interactionType"] for question in questions}),
        "questionKinds": sorted({question["questionKind"] for question in questions}),
        "dominantBadge": questions[0]["badgeLabel"] if questions else "",
    }

    return quiz_rel_path, quiz, manifest_entry


def main() -> None:
    manifest = json.loads(SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
    topic_titles = load_topic_titles()
    manifest_items: list[dict[str, Any]] = []

    for entry in manifest.get("scenarios", []):
        if not isinstance(entry, dict):
            continue
        quiz_rel_path, quiz, manifest_entry = build_quiz_file(entry, topic_titles)
        quiz_path = QUIZ_ROOT / quiz_rel_path
        quiz_path.parent.mkdir(parents=True, exist_ok=True)
        quiz_path.write_text(json.dumps(quiz, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
        manifest_items.append(manifest_entry)

    quiz_manifest = {
        "scenarioFolder": "LF12FIAE-Scenarien",
        "quizFolder": "LF12FIAE-Quiz",
        "items": manifest_items,
    }
    QUIZ_MANIFEST_PATH.write_text(json.dumps(quiz_manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")

    print(f"quiz_files={len(manifest_items)}")
    print(f"question_total={sum(item['questionCount'] for item in manifest_items)}")


if __name__ == "__main__":
    main()
