#!/usr/bin/env python3

from __future__ import annotations

import argparse
from collections import Counter
import json
import re
import sqlite3
from pathlib import Path
from typing import Any

from import_pv3wiso_quiz_to_db import (
    build_pool_description,
    merge_prompt,
    normalize_visible_text as base_normalize_visible_text,
    render_context_card,
    slugify_visible_text,
    stable_id,
    strip_ticket_prefix,
    validate_visible_texts,
)
from pv1fiae_short_text_specs import SHORT_TEXT_DERIVED_SPECS, SHORT_TEXT_KEYWORD_DISTRACTORS


ROOT = Path(__file__).resolve().parents[2]
SCENARIO_ROOT = ROOT / "data" / "Kurse" / "Pruefungsvorbereitung-1-FIAE-Scenarien"
SCENARIO_MANIFEST_PATH = SCENARIO_ROOT / "scenario-manifest.json"
POSSIBLE_SKILLS_PATH = SCENARIO_ROOT / "possible_skills.json"
QUIZ_DB_PATH = ROOT / "data" / "Kurse" / "Pruefungsvorbereitung-1-FIAE-Quiz.db"
SCHEMA_PATH = ROOT / "QuizMaster" / "sql" / "quiz_db_schema_v1.sql"

DIRECT_QUESTION_META_BY_TYPE = {
    "single_choice": {
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "badge_label": "Welche Antwort trifft am besten zu?",
    },
    "multi_select": {
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "badge_label": "Welche Aussagen sind korrekt?",
    },
}

DEFAULT_PACKAGE_INCREMENT = 100
BASE_DERIVED_SCENARIO_BUDGET = 12

BADGE_LABEL_BY_QUESTION_KIND = {
    "eine_richtige_antwort_waehlen": "Welche Antwort trifft am besten zu?",
    "mehrere_richtige_antworten_waehlen": "Welche Aussagen sind korrekt?",
    "reihenfolge_bestimmen": "Welche Reihenfolge stimmt?",
}

PROMPT_CONTEXT_HINTS = (
    "beschrieb",
    "gezeig",
    "diesem",
    "dieses",
    "dieser",
    "vorgegeben",
    "vorgelegt",
    "hier",
    "dabei",
    "im projektkontext",
)

PV1_VISIBLE_REPLACEMENTS = (
    ("Aerzte", "Ärzte"),
    ("Aerzten", "Ärzten"),
    ("aerztliche", "ärztliche"),
    ("Oberflaeche", "Oberfläche"),
    ("Gesamtloesung", "Gesamtlösung"),
    ("Loesungsideen", "Lösungsideen"),
    ("Loesungsstruktur", "Lösungsstruktur"),
    ("Loesungen", "Lösungen"),
    ("Loesung", "Lösung"),
    ("Schluesselregeln", "Schlüsselregeln"),
    ("Schluesselbildung", "Schlüsselbildung"),
    ("Schluesselmaterial", "Schlüsselmaterial"),
    ("Lizenzschluessel", "Lizenzschlüssel"),
    ("Kunstschluessel", "Kunstschlüssel"),
    ("Fremdschluessel", "Fremdschlüssel"),
    ("Schluessel", "Schlüssel"),
    ("schluessel", "schlüssel"),
    ("Buendelung", "Bündelung"),
    ("Arbeitsplaetze", "Arbeitsplätze"),
    ("Plaetzen", "Plätzen"),
    ("Plaetze", "Plätze"),
    ("Einfuegeanomalie", "Einfügeanomalie"),
    ("einfuegen", "einfügen"),
    ("entstuenden", "entstünden"),
    ("Sonderwuensche", "Sonderwünsche"),
    ("Fahrgaeste", "Fahrgäste"),
    ("Hinzufuegen", "Hinzufügen"),
    ("Bauchgefuehl", "Bauchgefühl"),
    ("Nutzungsgefuehl", "Nutzungsgefühl"),
    ("Datensaetzen", "Datensätzen"),
    ("Datensaetze", "Datensätze"),
    ("Gesamtlaenge", "Gesamtlänge"),
    ("gesamtlaenge", "gesamtlänge"),
    ("Arbeitsablaeufe", "Arbeitsabläufe"),
    ("Benutzerablaeufe", "Benutzerabläufe"),
    ("Reservierungsablaeufen", "Reservierungsabläufen"),
    ("Ablaeufe", "Abläufe"),
    ("bezueglich", "bezüglich"),
    ("zuverlaessig", "zuverlässig"),
    ("verlaesslich", "verlässlich"),
    ("Hauefig", "Häufig"),
    ("praesentieren", "präsentieren"),
    ("Domaenenwissen", "Domänenwissen"),
    ("Geruechte", "Gerüchte"),
    ("fuegt", "fügt"),
    ("faelschlich", "fälschlich"),
    ("Erlaeuterung", "Erläuterung"),
    ("erlaeutern", "erläutern"),
    ("Erlaeutern", "Erläutern"),
    ("erlaeutert", "erläutert"),
    ("Erlaeutert", "Erläutert"),
    ("Verzoegerungen", "Verzögerungen"),
    ("Verzoegerung", "Verzögerung"),
    ("verzoegert", "verzögert"),
    ("verzoegern", "verzögern"),
    ("spuerbar", "spürbar"),
    ("Spuerbar", "Spürbar"),
    ("Benutzeroberflaeche", "Benutzeroberfläche"),
    ("benutzeroberflaeche", "benutzeroberfläche"),
    ("Benutzeroberflaechen", "Benutzeroberflächen"),
    ("kuenstlicher", "künstlicher"),
    ("kuenstlich", "künstlich"),
    ("zehnkoepfigen", "zehnköpfigen"),
    ("Hauptmenue", "Hauptmenü"),
    ("gemaess", "gemäß"),
    ("Maengel", "Mängel"),
    ("reprasentativen", "repräsentativen"),
    ("Guete", "Güte"),
    ("waechst", "wächst"),
    ("schlaegt", "schlägt"),
    ("schoenes", "schönes"),
    ("schoener", "schöner"),
    ("Stoerungs", "Störungs"),
    ("Stoerungen", "Störungen"),
    ("Supportfaelle", "Supportfälle"),
    ("Testfaelle", "Testfälle"),
    ("Echtfaelle", "Echtfälle"),
    ("ueberfluessig", "überflüssig"),
    ("Ueberfluessig", "Überflüssig"),
    ("überfluessig", "überflüssig"),
    ("Überfluessig", "Überflüssig"),
    ("Rückspruenge", "Rücksprünge"),
    ("Übergaenge", "Übergänge"),
    ("Ungeklaerte", "Ungeklärte"),
    ("geklaert", "geklärt"),
    ("klaeren", "klären"),
    ("entschaerft", "entschärft"),
    ("entschaerfen", "entschärfen"),
    ("abwaegen", "abwägen"),
    ("loesen", "lösen"),
    ("schuetzt", "schützt"),
    ("standardmaessig", "standardmäßig"),
    ("Aufwandsschaetzungen", "Aufwandsschätzungen"),
    ("Verlaeufe", "Verläufe"),
    ("null bis viele", "0 bis viele"),
    ("Sicherheitsluecken", "Sicherheitslücken"),
    ("Kommunikationsluecken", "Kommunikationslücken"),
    ("kommunikationsluecken", "kommunikationslücken"),
    ("Luecken", "Lücken"),
    ("luecken", "lücken"),
    ("Netzwerkpraefix", "Netzwerkpräfix"),
    ("netzwerkpraefix", "netzwerkpräfix"),
    ("widerspruechlich", "widersprüchlich"),
    ("Widerspruechlich", "Widersprüchlich"),
    ("abschaetzbar", "abschätzbar"),
    ("Abschaetzbar", "Abschätzbar"),
    ("Parkplaetze", "Parkplätze"),
    ("parkplaetze", "parkplätze"),
    ("aussen", "außen"),
    ("Aussen", "Außen"),
    ("einschliesslich", "einschließlich"),
    ("Einschliesslich", "Einschließlich"),
    ("Vorschlaege", "Vorschläge"),
    ("vorschlaege", "vorschläge"),
    ("Schaltflaeche", "Schaltfläche"),
    ("Schaltflaechen", "Schaltflächen"),
    ("schaltflaeche", "schaltfläche"),
    ("schaltflaechen", "schaltflächen"),
    ("gewoehnlicher", "gewöhnlicher"),
    ("gewoehnliche", "gewöhnliche"),
    ("gewoehnlich", "gewöhnlich"),
    ("Grosses", "Großes"),
    ("grosses", "großes"),
    ("grossem", "großem"),
    ("grosser", "großer"),
    ("grossen", "großen"),
    ("grosse", "große"),
    ("Grossbuchstaben", "Großbuchstaben"),
    ("fehleraermer", "fehlerärmer"),
    (
        "Beim Login eines User werden email und password verwendet.",
        "Beim Login werden die Felder email und password verwendet.",
    ),
    (
        "Das Ergebnis wird später mit dem hinterlegten Datenbankwert über validatePassword() verglichen; bei Übereinstimmung wird true zurückgegeben.",
        "Das Ergebnis wird später mit dem hinterlegten Datenbankwert über validatePassword() verglichen; bei Übereinstimmung gilt die Prüfung als erfolgreich.",
    ),
    (
        "Bei Übereinstimmung wird true zurückgegeben",
        "Bei Übereinstimmung gilt die Prüfung als erfolgreich.",
    ),
)


def normalize_pool_slug(folder_name: str) -> str:
    slug = folder_name.removeprefix("ticket_").strip("_")
    return slug.replace("_", "-")


def normalize_visible_text(value: Any) -> str:
    text = base_normalize_visible_text(value)
    for source, target in PV1_VISIBLE_REPLACEMENTS:
        text = text.replace(source, target)
    while "öfff" in text:
        text = text.replace("öfff", "öff")
    while "Öfff" in text:
        text = text.replace("Öfff", "Öff")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def badge_label_for_question_kind(question_kind: str) -> str:
    return BADGE_LABEL_BY_QUESTION_KIND.get(str(question_kind or "").strip(), "")


def choose_text_variant(key: str, variants: list[str]) -> str:
    if not variants:
        return ""
    choice_index = int(stable_id("text_variant", key), 16) % len(variants)
    return variants[choice_index]


def shorten_visible_title(text: str, limit: int = 108) -> str:
    normalized = normalize_visible_text(text)
    if len(normalized) <= limit:
        return normalized
    if ": " in normalized:
        prefix, suffix = normalized.split(": ", 1)
        available = max(18, limit - len(prefix) - 2)
        compact_suffix = compact_focus_text(suffix, available)
        candidate = normalize_visible_text(f"{prefix}: {compact_suffix}").rstrip(" /")
        if len(candidate) <= limit:
            return candidate
    head = normalized[:limit].rstrip(" ,:;/")
    last_space = head.rfind(" ")
    if last_space >= limit // 2:
        head = head[:last_space]
    return trim_trailing_stop_words(head)


def trim_trailing_stop_words(text: str) -> str:
    trailing_stop_words = {
        "der",
        "die",
        "das",
        "dem",
        "den",
        "des",
        "ein",
        "eine",
        "einer",
        "einem",
        "einen",
        "mit",
        "von",
        "für",
        "zu",
        "und",
        "oder",
        "als",
        "im",
        "in",
        "am",
        "an",
        "auf",
    }
    tokens = normalize_visible_text(text).split()
    while len(tokens) > 3 and tokens[-1].casefold() in trailing_stop_words:
        tokens.pop()
    return normalize_visible_text(" ".join(tokens)).rstrip(" ,:;.")


def build_rationale_title(base_title: str, qualifier: str, limit: int = 140) -> str:
    qualifier_text = normalize_visible_text(qualifier)
    available = max(18, limit - len(qualifier_text) - 2)
    focus_text = compact_focus_text(base_title, available).rstrip(" .!?;:")
    return normalize_visible_text(f"{focus_text}: {qualifier_text}")


def extract_quoted_focus(text: Any) -> str:
    normalized = normalize_visible_text(text)
    match = re.search(r"„([^“]+)“", normalized)
    if not match:
        return ""
    return normalize_visible_text(match.group(1))


def clean_rationale_option_text(text: str) -> str:
    normalized = normalize_visible_text(text)
    for prefix in ("Richtig, weil ", "Falsch, weil "):
        if normalized.startswith(prefix):
            return normalize_visible_text(normalized[len(prefix):])
    return normalized


def explanation_to_rationale_sentence(text: str) -> str:
    normalized = normalize_visible_text(text)
    for prefix in ("Richtig, weil ", "Falsch, weil "):
        if normalized.startswith(prefix):
            fragment = normalize_visible_text(normalized[len(prefix):]).rstrip(" ")
            if fragment and fragment[-1] not in ".!?":
                fragment = f"{fragment}."
            return normalize_visible_text(f"Weil {fragment}")
    return normalized


def compact_focus_text(text: str, limit: int = 96) -> str:
    normalized = normalize_visible_text(text)
    if len(normalized) <= limit:
        return normalized.rstrip(" /")

    label_match = re.match(r"^((?:Modell|Variante)\s+[A-ZÄÖÜ0-9]+)\s*:", normalized)
    if label_match:
        return label_match.group(1)

    split_patterns = (
        r"\s+/\s+",
        r";",
        r",",
        r"\.",
        r"\s+aber\s+",
        r"\s+weil\s+",
        r"\s+damit\s+",
        r"\s+wodurch\s+",
        r"\s+nicht\s+",
        r"\s+nur\s+",
    )
    for pattern in split_patterns:
        parts = re.split(pattern, normalized, maxsplit=1)
        if not parts:
            continue
        head = trim_trailing_stop_words(parts[0])
        if 18 <= len(head) <= limit:
            return head

    removable_words = {
        "aber",
        "aktuelle",
        "aktuellen",
        "bereits",
        "dabei",
        "dadurch",
        "danach",
        "derselben",
        "desselben",
        "die",
        "diesem",
        "diesen",
        "dieser",
        "eigentliche",
        "eigentlichen",
        "erste",
        "ersten",
        "fachlich",
        "innerhalb",
        "mehrere",
        "mehreren",
        "nur",
        "passende",
        "passender",
        "passendes",
        "passenden",
        "sind",
        "soll",
        "sollen",
        "wird",
        "werden",
    }
    significant_tokens = [
        token.strip(".,:;/")
        for token in normalized.split()
        if token.strip(".,:;/") and token.strip(".,:;/").casefold() not in removable_words
    ]
    keyword_variants: list[list[str]] = []
    if len(significant_tokens) >= 3:
        keyword_variants.extend(
            [
                significant_tokens[:1] + significant_tokens[-2:],
                significant_tokens[:2] + significant_tokens[-1:],
                significant_tokens[:2] + significant_tokens[-2:],
            ]
        )
    for variant_tokens in keyword_variants:
        variant_text = trim_trailing_stop_words(" ".join(variant_tokens))
        if 18 <= len(variant_text) <= limit:
            return variant_text

    words = normalized.split()
    compact_words: list[str] = []
    for word in words:
        next_text = normalize_visible_text(" ".join(compact_words + [word]))
        if compact_words and len(next_text) > limit:
            break
        compact_words.append(word)
    compact_text = trim_trailing_stop_words(" ".join(compact_words))
    if len(compact_text) >= 18:
        return compact_text

    return choose_text_variant(
        normalized,
        [
            "die ausgewählte Aussage",
            "die genannte Option",
            "diese Aussage",
        ],
    )


def unique_texts(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for raw_value in values:
        value = normalize_visible_text(raw_value)
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def shuffled_options(
    source_ref: str,
    correct_text: str,
    wrong_texts: list[str],
    correct_explanation: str,
) -> list[dict[str, Any]]:
    raw_options = [
        {
            "text": normalize_visible_text(correct_text),
            "is_correct": 1,
            "explanation": normalize_visible_text(correct_explanation),
        }
    ]
    raw_options.extend(
        {
            "text": normalize_visible_text(text),
            "is_correct": 0,
            "explanation": "",
        }
        for text in wrong_texts
    )
    unique_records: list[dict[str, Any]] = []
    seen: set[str] = set()
    for record in raw_options:
        text = str(record["text"])
        if not text or text in seen:
            continue
        seen.add(text)
        unique_records.append(record)

    ordered_records = sorted(
        unique_records,
        key=lambda record: stable_id("short_text_option_order", f"{source_ref}::{record['text']}"),
    )

    correct_option = next(record for record in ordered_records if record["is_correct"] == 1)
    correct_text_normalized = str(correct_option["text"])
    for record in ordered_records:
        if record["is_correct"] == 1:
            continue
        record["explanation"] = normalize_visible_text(
            f"Falsch, weil hier nicht „{record['text']}“, sondern „{correct_text_normalized}“ den Kern trifft."
        )

    options: list[dict[str, Any]] = []
    for option_index, record in enumerate(ordered_records, start=1):
        validate_visible_texts([str(record["text"]), str(record["explanation"])])
        options.append(
            {
                "source_option_id": f"opt_{option_index}",
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": str(record["text"]),
                "explanation": str(record["explanation"]),
                "is_correct": int(record["is_correct"]),
            }
        )
    return options


def summarize_context(context_text: str, max_chars: int = 220) -> str:
    normalized = normalize_visible_text(context_text)
    if not normalized:
        return ""
    if normalized.startswith("Kontext "):
        _, _, tail = normalized.partition(":")
        if tail.strip():
            normalized = normalize_visible_text(tail)
    first_sentence = re.split(r"(?<=[.!?])\s+", normalized, maxsplit=1)[0]
    lead = normalize_visible_text(first_sentence or normalized)
    if len(lead) <= max_chars:
        return lead
    return ""


def compose_prompt(prompt: Any, context_text: str) -> str:
    base_prompt = normalize_visible_text(prompt)
    if not base_prompt:
        return ""
    if not context_text:
        return base_prompt
    lowered = base_prompt.casefold()
    if not any(hint in lowered for hint in PROMPT_CONTEXT_HINTS):
        return base_prompt
    merged_prompt = merge_prompt(summarize_context(context_text, max_chars=120), base_prompt)
    if len(merged_prompt) <= 240:
        return merged_prompt
    shorter_merged_prompt = merge_prompt(summarize_context(context_text, max_chars=70), base_prompt)
    if len(shorter_merged_prompt) <= 240:
        return shorter_merged_prompt
    return base_prompt


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


def render_diagram_option(diagram: dict[str, Any]) -> str:
    if not isinstance(diagram, dict):
        return ""

    entity_title_by_id: dict[str, str] = {}
    entity_parts: list[str] = []
    for entity in diagram.get("entities", []):
        if not isinstance(entity, dict):
            continue
        entity_id = str(entity.get("id", "")).strip()
        title = normalize_visible_text(entity.get("title", ""))
        if entity_id and title:
            entity_title_by_id[entity_id] = title
        fields = unique_texts([str(field) for field in entity.get("fields", []) if str(field).strip()])
        if fields:
            preview = ", ".join(fields[:4])
            if len(fields) > 4:
                preview += ", ..."
            entity_parts.append(f"{title} ({preview})" if title else preview)
        elif title:
            entity_parts.append(title)

    relation_parts: list[str] = []
    for relation in diagram.get("relations", []):
        if not isinstance(relation, dict):
            continue
        from_text = entity_title_by_id.get(
            str(relation.get("from", "")).strip(),
            normalize_visible_text(relation.get("from", "")),
        )
        to_text = entity_title_by_id.get(
            str(relation.get("to", "")).strip(),
            normalize_visible_text(relation.get("to", "")),
        )
        label = normalize_visible_text(relation.get("label", ""))
        from_card = normalize_visible_text(relation.get("fromCard", ""))
        to_card = normalize_visible_text(relation.get("toCard", ""))
        cards = ""
        if from_card or to_card:
            cards = f" [{from_card} -> {to_card}]".strip()
        if from_text and to_text and label:
            relation_parts.append(f"{from_text} {label} {to_text}{cards}")
        elif from_text and to_text:
            relation_parts.append(f"{from_text} zu {to_text}{cards}")

    parts: list[str] = []
    if entity_parts:
        parts.append("Entitäten: " + "; ".join(entity_parts[:5]) + ".")
    if relation_parts:
        parts.append("Beziehungen: " + "; ".join(relation_parts[:4]) + ".")
    return normalize_visible_text(" ".join(parts))


def render_option_text(raw_option: dict[str, Any]) -> str:
    text = normalize_visible_text(raw_option.get("text", ""))
    if text:
        return text

    label = normalize_visible_text(raw_option.get("label", ""))
    code = normalize_visible_text(raw_option.get("code", ""))
    if code:
        return normalize_visible_text(f"{label}: {code}" if label else code)

    diagram_summary = render_diagram_option(raw_option.get("diagram", {}))
    if diagram_summary and label:
        return normalize_visible_text(f"{label}: {diagram_summary}")
    if diagram_summary:
        return diagram_summary
    if label:
        return label
    return ""


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


def progress_key(progress_links: list[str]) -> str:
    if not progress_links:
        return "ohne_progress"
    return "+".join(progress_links)


def build_direct_concept_source(pool_slug: str, progress_links: list[str]) -> str:
    return f"{pool_slug}::{progress_key(progress_links)}::direkt"


def build_direct_concept_source_for_question(
    pool_slug: str,
    progress_links: list[str],
    title: str,
) -> str:
    title_slug = slugify_visible_text(title)
    return f"{build_direct_concept_source(pool_slug, progress_links)}::{title_slug}"


def current_question_total() -> int:
    if not QUIZ_DB_PATH.exists():
        return 0
    try:
        with sqlite3.connect(QUIZ_DB_PATH) as conn:
            row = conn.execute("SELECT count(*) FROM quiz_question").fetchone()
    except sqlite3.Error:
        return 0
    return int(row[0] or 0) if row else 0


def build_match_pair_title(parent_title: str, left_text: str) -> str:
    combined_title = normalize_visible_text(f"{parent_title}: {left_text}")
    if len(combined_title) <= 108:
        return combined_title
    left_title = normalize_visible_text(left_text)
    if len(left_title) <= 108:
        return left_title
    return compact_focus_text(left_title, 108)


def build_reverse_match_pair_title(parent_title: str, right_text: str, limit: int = 108) -> str:
    focus_title = normalize_visible_text(right_text)
    if len(focus_title) <= limit:
        return focus_title

    qualifier = "umgekehrte Zuordnung"
    available = max(36, limit - len(qualifier) - 2)
    parent_focus = shorten_visible_title(parent_title, available)
    return normalize_visible_text(f"{parent_focus}: {qualifier}")


def build_reverse_table_cell_title(parent_title: str, expected_text: str, limit: int = 108) -> str:
    focus_title = normalize_visible_text(expected_text)
    if len(focus_title) <= limit:
        return focus_title

    qualifier = "umgekehrte Ergänzung"
    available = max(36, limit - len(qualifier) - 2)
    parent_focus = shorten_visible_title(parent_title, available)
    return normalize_visible_text(f"{parent_focus}: {qualifier}")


def build_reverse_table_cell_prompt(expected_text: str, column_header: str, source_ref: str) -> str:
    expected = normalize_visible_text(expected_text)
    column = normalize_visible_text(column_header)
    if column:
        return choose_text_variant(
            source_ref,
            [
                f"Zu welcher Zeile gehört in der Spalte „{column}“ die Aussage „{expected}“ am besten?",
                f"Welche Zeile wird in der Spalte „{column}“ durch „{expected}“ fachlich am treffendsten ergänzt?",
                f"Welche Zuordnung passt für „{expected}“ in der Spalte „{column}“ am besten?",
            ],
        )
    return choose_text_variant(
        source_ref,
        [
            f"Zu welcher Zeile gehört die Aussage „{expected}“ am besten?",
            f"Welche Zeile wird durch „{expected}“ fachlich am treffendsten ergänzt?",
            f"Welche Zuordnung passt für „{expected}“ hier am besten?",
        ],
    )


def build_match_pair_prompt(left_text: str, source_ref: str) -> str:
    left = normalize_visible_text(left_text)
    return choose_text_variant(
        source_ref,
        [
            f"Welche Zuordnung passt für „{left}“ am besten?",
            f"Welche Option ordnet „{left}“ fachlich richtig ein?",
            f"Welche Ergänzung beschreibt für „{left}“ die passendste Zuordnung?",
        ],
    )


def build_match_pair_explanation(
    left_text: str,
    option_text: str,
    correct_text: str,
    related_left_by_option: dict[str, str],
    is_correct: bool,
    source_ref: str,
) -> str:
    left = normalize_visible_text(left_text)
    option = normalize_visible_text(option_text)
    correct = normalize_visible_text(correct_text)
    if is_correct:
        return choose_text_variant(
            source_ref,
            [
                f"Für „{left}“ passt „{correct}“, weil genau diese Zuordnung den beschriebenen Schwerpunkt trifft.",
                f"„{correct}“ ist hier richtig, weil diese Zuordnung den Fall „{left}“ fachlich am direktesten erklärt.",
                f"Die richtige Verbindung lautet „{left}“ zu „{correct}“, weil genau dort der passende Bezug liegt.",
            ],
        )

    other_left = normalize_visible_text(related_left_by_option.get(option, ""))
    if other_left:
        return choose_text_variant(
            f"{source_ref}::{option}",
            [
                f"„{option}“ passt eher zu „{other_left}“ als zu „{left}“.",
                f"Diese Zuordnung gehört eher zum Punkt „{other_left}“ und nicht zu „{left}“.",
                f"Für „{left}“ führt „{option}“ in die falsche Richtung; diese Option passt eher zu „{other_left}“.",
            ],
        )

    return choose_text_variant(
        f"{source_ref}::{option}",
        [
            f"„{option}“ erklärt den Punkt „{left}“ nicht am treffendsten.",
            f"Diese Option passt fachlich nicht sauber zu „{left}“.",
        ],
    )


def classify_table_column(column_header: str) -> str:
    header = normalize_visible_text(column_header).casefold()
    if "nachweis" in header:
        return "evidence"
    if "rolle" in header or "zuständig" in header or "zustaendig" in header or "federführ" in header or "federfuehr" in header:
        return "role"
    if "kontaktweg" in header:
        return "contact"
    if "qualitätsziel" in header or "qualitaetsziel" in header or header == "ziel":
        return "goal"
    if "maßnahme" in header or "massnahme" in header:
        return "measure"
    if "quelle" in header:
        return "source"
    if "vorgabe" in header:
        return "requirement"
    if "standardbehandlung" in header or header == "standard":
        return "standard"
    if "ausnahmepunkt" in header or "ausnahme" in header:
        return "exception"
    if "prüffokus" in header or "prueffokus" in header:
        return "focus"
    return "generic"


def build_table_cell_title(parent_title: str, row_label: str, column_header: str, cell_label: str) -> str:
    label = normalize_visible_text(cell_label)
    if "/" in label:
        left, right = [normalize_visible_text(part) for part in label.split("/", 1)]
        combined_label = normalize_visible_text(f"{left}: {right}")
        if len(combined_label) <= 108:
            return combined_label
        if len(left) <= 108:
            return left
        return compact_focus_text(left, 108)
    if not column_header or normalize_visible_text(column_header) == normalize_visible_text(row_label):
        combined_title = normalize_visible_text(f"{parent_title}: {row_label}")
    else:
        combined_title = normalize_visible_text(f"{parent_title}: {row_label} / {column_header}")
    row_title = normalize_visible_text(row_label)
    if " / " in combined_title and len(combined_title) > 96:
        if len(row_title) <= 108:
            return row_title
        return compact_focus_text(row_title, 108)
    if len(combined_title) <= 108:
        return combined_title
    if len(row_title) <= 108:
        return row_title
    return compact_focus_text(row_title, 108)


def build_table_cell_prompt(row_label: str, column_header: str, source_ref: str) -> str:
    row = normalize_visible_text(row_label)
    column = normalize_visible_text(column_header)
    if not column or column == row:
        return choose_text_variant(
            source_ref,
            [
                f"Welche Ergänzung passt für „{row}“ am besten?",
                f"Welche Option vervollständigt „{row}“ fachlich richtig?",
                f"Welche Zuordnung beschreibt „{row}“ hier am treffendsten?",
            ],
        )
    prompt_kind = classify_table_column(column)
    variants_by_kind = {
        "evidence": [
            f"Welcher Nachweis passt für „{row}“ am besten?",
            f"Welche Dokumentation belegt „{row}“ am tragfähigsten?",
            f"Welcher Nachweis ist für „{row}“ hier zuerst am sinnvollsten?",
        ],
        "role": [
            f"Wer sollte für „{row}“ zuerst federführend sein?",
            f"Welche Rolle trägt für „{row}“ hier die erste Federführung?",
            f"Wer ist für „{row}“ zunächst am klarsten zuständig?",
        ],
        "contact": [
            f"Welcher Kontaktweg passt für „{row}“ am besten?",
            f"Wie sollte „{row}“ hier am sinnvollsten alarmiert oder erreicht werden?",
            f"Welcher Kontaktweg ist für „{row}“ hier am tragfähigsten?",
        ],
        "goal": [
            f"Welches Qualitätsziel passt zur Beobachtung „{row}“ am besten?",
            f"Welche Zielbeschreibung ergänzt „{row}“ fachlich am treffendsten?",
            f"Welches Ziel sollte für „{row}“ hier festgelegt werden?",
        ],
        "measure": [
            f"Welche erste Maßnahme passt für „{row}“ am besten?",
            f"Welcher erste Schritt ist für „{row}“ hier am sinnvollsten?",
            f"Welche Maßnahme ergänzt „{row}“ fachlich am treffendsten?",
        ],
        "source": [
            f"Welche Quelle passt für „{row}“ am besten?",
            f"Woraus sollte „{row}“ hier am sinnvollsten abgeleitet oder hergestellt werden?",
            f"Welche Quelle ist für „{row}“ hier die passende Grundlage?",
        ],
        "requirement": [
            f"Welche Vorgabe passt für „{row}“ am besten?",
            f"Welche Anforderung sollte für „{row}“ hier verbindlich gelten?",
            f"Welche Vorgabe ergänzt „{row}“ fachlich am treffendsten?",
        ],
        "standard": [
            f"Welche Standardbehandlung passt für „{row}“ am besten?",
            f"Wie sollte „{row}“ im Regelfall behandelt werden?",
            f"Welche Standardlinie ergänzt „{row}“ fachlich am sinnvollsten?",
        ],
        "exception": [
            f"Welcher Ausnahmepunkt gehört bei „{row}“ am ehesten dazu?",
            f"Welche Ausnahmefrage sollte bei „{row}“ hier zuerst geprüft werden?",
            f"Welcher Ausnahmepunkt passt für „{row}“ am besten?",
        ],
        "focus": [
            f"Welcher Prüffokus passt für „{row}“ am besten?",
            f"Worauf sollte sich die Prüfung bei „{row}“ hier zuerst richten?",
            f"Welcher Schwerpunkt ergänzt „{row}“ fachlich am sinnvollsten?",
        ],
        "generic": [
            f"Welche Ergänzung passt in der Spalte „{column}“ für „{row}“ am besten?",
            f"Welche Option ergänzt „{row}“ in „{column}“ fachlich richtig?",
            f"Welche Zuordnung passt für „{row}“ in der Spalte „{column}“ am besten?",
        ],
    }
    return choose_text_variant(source_ref, variants_by_kind[prompt_kind])


def build_table_cell_explanation(
    row_label: str,
    column_header: str,
    option_text: str,
    correct_text: str,
    related_row_by_option: dict[str, str],
    is_correct: bool,
    source_ref: str,
) -> str:
    row = normalize_visible_text(row_label)
    column = normalize_visible_text(column_header)
    option = normalize_visible_text(option_text)
    correct = normalize_visible_text(correct_text)
    prompt_kind = classify_table_column(column)
    if is_correct:
        variants_by_kind = {
            "evidence": [
                f"„{correct}“ ist hier richtig, weil damit für „{row}“ ein belastbarer Nachweis vorliegt.",
                f"Für „{row}“ passt „{correct}“, weil genau so der Nachweis nachvollziehbar gesichert wird.",
            ],
            "role": [
                f"Für „{row}“ liegt die erste Federführung bei „{correct}“, weil diese Rolle den Aspekt unmittelbar steuert.",
                f"„{correct}“ ist hier richtig, weil diese Rolle für „{row}“ zuerst Verantwortung übernehmen muss.",
            ],
            "contact": [
                f"„{correct}“ passt hier, weil dieser Kontaktweg „{row}“ verlässlich abdeckt.",
                f"Für „{row}“ ist „{correct}“ richtig, weil dieser Weg die Erreichbarkeit tragfähig macht.",
            ],
            "goal": [
                f"„{correct}“ ist hier das passende Ziel, weil damit „{row}“ konkret und prüfbar beschrieben wird.",
                f"Für „{row}“ passt „{correct}“, weil diese Zielbeschreibung messbar und nachvollziehbar bleibt.",
            ],
            "measure": [
                f"„{correct}“ ist hier die richtige Maßnahme, weil damit „{row}“ unmittelbar adressiert wird.",
                f"Für „{row}“ passt „{correct}“, weil dieser Schritt den beschriebenen Punkt zuerst stabilisiert.",
            ],
            "source": [
                f"„{correct}“ ist hier richtig, weil diese Quelle den passenden fachlichen Ursprung für „{row}“ liefert.",
                f"Für „{row}“ passt „{correct}“, weil genau daraus der Punkt belastbar abgeleitet werden kann.",
            ],
            "requirement": [
                f"„{correct}“ ist hier die passende Vorgabe, weil damit „{row}“ verbindlich und kontrollierbar geregelt wird.",
                f"Für „{row}“ passt „{correct}“, weil diese Vorgabe den beschriebenen Fall tragfähig absichert.",
            ],
            "standard": [
                f"„{correct}“ ist hier die passende Standardbehandlung, weil damit „{row}“ im Regelfall sauber gesteuert wird.",
                f"Für „{row}“ passt „{correct}“, weil diese Linie die normale Behandlung nachvollziehbar festlegt.",
            ],
            "exception": [
                f"„{correct}“ ist hier der richtige Ausnahmepunkt, weil genau diese Frage den Regelfall bei „{row}“ durchbrechen kann.",
                f"Für „{row}“ passt „{correct}“, weil daran entschieden wird, ob der Standardfall ausnahmsweise nicht reicht.",
            ],
            "focus": [
                f"„{correct}“ ist hier der passende Prüffokus, weil genau darauf sich die Bewertung bei „{row}“ zuerst richten sollte.",
                f"Für „{row}“ passt „{correct}“, weil dieser Schwerpunkt das eigentliche Prüfziel am klarsten trifft.",
            ],
            "generic": [
                (
                    f"„{correct}“ ergänzt „{row}“ in der Spalte „{column}“ fachlich am treffendsten."
                    if column and column != row
                    else f"„{correct}“ ergänzt „{row}“ fachlich am treffendsten."
                ),
                f"Für „{row}“ ist „{correct}“ hier die passende Ergänzung.",
            ],
        }
        return choose_text_variant(source_ref, variants_by_kind[prompt_kind])

    other_row = normalize_visible_text(related_row_by_option.get(option, ""))
    if other_row:
        return choose_text_variant(
            f"{source_ref}::{option}",
            [
                f"„{option}“ passt eher zu „{other_row}“ als zu „{row}“.",
                f"Diese Option gehört fachlich eher zu „{other_row}“ und nicht zu „{row}“.",
            ],
        )

    return choose_text_variant(
        f"{source_ref}::{option}",
        [
            (
                f"„{option}“ ergänzt „{row}“ in „{column}“ nicht passend."
                if column and column != row
                else f"„{option}“ ergänzt „{row}“ nicht passend."
            ),
            f"Diese Option trifft den Punkt „{row}“ in der Spalte „{column}“ nicht am besten.",
        ],
    )


def build_reverse_table_cell_explanation(
    expected_text: str,
    column_header: str,
    option_row: str,
    correct_row: str,
    related_expected_by_row: dict[str, str],
    is_correct: bool,
    source_ref: str,
) -> str:
    expected = normalize_visible_text(expected_text)
    column = normalize_visible_text(column_header)
    option = normalize_visible_text(option_row)
    correct = normalize_visible_text(correct_row)
    if is_correct:
        return choose_text_variant(
            source_ref,
            [
                (
                    f"Für „{expected}“ passt in der Spalte „{column}“ „{correct}“, weil genau dort diese Ergänzung fachlich hingehört."
                    if column
                    else f"Für „{expected}“ passt „{correct}“, weil genau dort diese Ergänzung fachlich hingehört."
                ),
                (
                    f"„{correct}“ ist hier richtig, weil diese Aussage in der Spalte „{column}“ genau zu dieser Zeile gehört."
                    if column
                    else f"„{correct}“ ist hier richtig, weil diese Aussage genau zu dieser Zeile gehört."
                ),
            ],
        )

    other_expected = normalize_visible_text(related_expected_by_row.get(option, ""))
    if other_expected:
        return choose_text_variant(
            f"{source_ref}::{option}",
            [
                (
                    f"„{option}“ gehört in der Spalte „{column}“ eher zu „{other_expected}“ und nicht zu „{expected}“."
                    if column
                    else f"„{option}“ gehört eher zu „{other_expected}“ und nicht zu „{expected}“."
                ),
                f"Diese Zeile passt fachlich eher zu „{other_expected}“ als zu „{expected}“.",
            ],
        )

    return choose_text_variant(
        f"{source_ref}::{option}",
        [
            (
                f"„{option}“ ist in der Spalte „{column}“ nicht die passende Zeile für „{expected}“."
                if column
                else f"„{option}“ ist nicht die passende Zeile für „{expected}“."
            ),
            f"Diese Zuordnung trifft für „{expected}“ fachlich nicht am besten zu.",
        ],
    )


def row_anchor_label(row: list[Any], column_header: str, cell: dict[str, Any]) -> str:
    if row and not isinstance(row[0], dict):
        return normalize_visible_text(row[0])
    return normalize_visible_text(cell.get("label") or column_header or cell.get("expected", ""))


def collect_direct_question(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_context: str,
    pool_slug: str,
) -> dict[str, Any]:
    question_type = str(raw_question.get("type", "")).strip()
    meta = DIRECT_QUESTION_META_BY_TYPE[question_type]
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Frage ohne ID in {scenario_rel_path}.")

    title = normalize_visible_text(raw_question.get("title", ""))
    prompt = compose_prompt(raw_question.get("prompt", ""), active_context)
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    concept_source = build_direct_concept_source_for_question(pool_slug, progress_links, title or question_id)
    variant_source = f"{concept_source}::{question_id}::direct"

    correct_flags = get_correct_flags(raw_question)
    correct_count = sum(1 for is_correct in correct_flags if is_correct)
    if question_type == "single_choice" and correct_count != 1:
        raise ValueError(
            f"Single-Choice-Frage {question_id} in {scenario_rel_path} hat {correct_count} richtige Antworten."
        )
    if question_type == "multi_select" and correct_count < 2:
        raise ValueError(
            f"Multi-Select-Frage {question_id} in {scenario_rel_path} hat zu wenige richtige Antworten."
        )

    options: list[dict[str, Any]] = []
    for option_index, raw_option in enumerate(raw_question.get("options", []), start=1):
        option_text = render_option_text(raw_option)
        explanation = normalize_visible_text(
            raw_option.get("rationale") or raw_option.get("explanation", "")
        )
        if not option_text:
            raise ValueError(
                f"Option {option_index} in {scenario_rel_path}#{question_id} konnte nicht sichtbar gerendert werden."
            )
        validate_visible_texts([option_text, explanation])
        options.append(
            {
                "source_option_id": str(raw_option.get("id") or option_index),
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": option_text,
                "explanation": explanation,
                "is_correct": 1 if correct_flags[option_index - 1] else 0,
            }
        )

    validate_visible_texts([title, prompt])
    return {
        "source_type": question_type,
        "source_question_id": question_id,
        "source_ref": f"{scenario_rel_path}#{question_id}",
        "title": title,
        "prompt": prompt,
        "instructions": title,
        "context": "",
        "interaction_type": meta["interaction_type"],
        "question_kind": meta["question_kind"],
        "badge_label": meta["badge_label"],
        "max_selections": correct_count,
        "options": options,
        "sequence_items": [],
        "accepted_answers": [],
        "progress_links": progress_links,
        "concept_source": concept_source,
        "variant_source": variant_source,
    }


def collect_direct_rationale_questions(direct_question: dict[str, Any]) -> list[dict[str, Any]]:
    options = [option for option in direct_question["options"] if normalize_visible_text(option.get("explanation", ""))]
    if len(options) < 3:
        return []

    source_ref = str(direct_question["source_ref"])
    title = normalize_visible_text(direct_question["title"])
    concept_source = str(direct_question["concept_source"])
    progress_links = list(direct_question["progress_links"])

    correct_options = [option for option in options if option["is_correct"] == 1]
    wrong_options = [option for option in options if option["is_correct"] == 0]
    records: list[dict[str, Any]] = []

    if correct_options and len(wrong_options) >= 2:
        focus_option = correct_options[0]
        focus_text = compact_focus_text(str(focus_option["text"]))
        prompt = choose_text_variant(
            f"{source_ref}::why_fit",
            [
                f"Welche Begründung erklärt am besten, warum „{focus_text}“ hier fachlich passt?",
                f"Warum ist „{focus_text}“ in diesem Zusammenhang die passende Aussage?",
                f"Welche Begründung stützt „{focus_text}“ hier am besten?",
            ],
        )
        rationale_options = shuffled_options(
            f"{source_ref}::why_fit",
            str(focus_option["explanation"]),
            [str(option["explanation"]) for option in wrong_options[:2]],
            "Richtig, weil diese Begründung genau erklärt, warum die ausgewählte Aussage im Fachkontext passt.",
        )
        rationale_title = build_rationale_title(title, "passende Begründung")
        validate_visible_texts([rationale_title, prompt])
        records.append(
            {
                "source_type": "direct_rationale_fit",
                "source_question_id": f"{direct_question['source_question_id']}::why_fit",
                "source_ref": f"{source_ref}::why_fit",
                "title": rationale_title,
                "prompt": prompt,
                "instructions": rationale_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Begründung passt am besten?",
                "max_selections": 1,
                "options": rationale_options,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
                "concept_source": concept_source,
                "variant_source": f"{concept_source}::why_fit",
            }
        )

    if wrong_options and len(options) >= 3:
        focus_option = wrong_options[0]
        focus_text = compact_focus_text(str(focus_option["text"]))
        alternative_explanations = [
            str(option["explanation"])
            for option in options
            if option is not focus_option
        ]
        if len(unique_texts(alternative_explanations)) >= 2:
            prompt = choose_text_variant(
                f"{source_ref}::why_not_fit",
                [
                    f"Welche Begründung erklärt am besten, warum „{focus_text}“ hier nicht passt?",
                    f"Warum ist „{focus_text}“ in diesem Zusammenhang fachlich unpassend?",
                    f"Welche Begründung zeigt am besten, warum „{focus_text}“ hier nicht die richtige Wahl ist?",
                ],
            )
            rationale_options = shuffled_options(
                f"{source_ref}::why_not_fit",
                str(focus_option["explanation"]),
                unique_texts(alternative_explanations)[:2],
                "Richtig, weil diese Begründung genau den Denkfehler der unpassenden Option beschreibt.",
            )
            rationale_title = build_rationale_title(title, "unpassende Begründung")
            validate_visible_texts([rationale_title, prompt])
            records.append(
                {
                    "source_type": "direct_rationale_misfit",
                    "source_question_id": f"{direct_question['source_question_id']}::why_not_fit",
                    "source_ref": f"{source_ref}::why_not_fit",
                    "title": rationale_title,
                    "prompt": prompt,
                    "instructions": rationale_title,
                    "context": "",
                    "interaction_type": "single",
                    "question_kind": "eine_richtige_antwort_waehlen",
                    "badge_label": "Welche Begründung passt am besten?",
                    "max_selections": 1,
                    "options": rationale_options,
                    "sequence_items": [],
                    "accepted_answers": [],
                    "progress_links": progress_links,
                    "concept_source": concept_source,
                    "variant_source": f"{concept_source}::why_not_fit",
                }
            )

    return records


def is_generic_selection_rationale_text(text: str) -> bool:
    normalized = normalize_visible_text(text)
    generic_patterns = (
        "Diese Option trifft den Punkt ",
        "Diese Zuordnung gehört eher zu ",
        "Diese Option gehört fachlich eher zu ",
    )
    if normalized.startswith(generic_patterns):
        return True
    if " passt eher zu " in normalized:
        return True
    if normalized.endswith(" nicht passend.") or normalized.endswith(" nicht am besten."):
        return True
    return False


def collect_selection_rationale_questions(group_questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not group_questions:
        return []

    source_type = str(group_questions[0].get("source_type", "")).strip()
    if source_type not in {"table_fill", "match_pairs", "match_pairs_reverse"}:
        return []

    correct_explanation_by_source_ref: dict[str, str] = {}
    for question in group_questions:
        for option in question["options"]:
            if option["is_correct"] == 1 and normalize_visible_text(option.get("explanation", "")):
                correct_explanation_by_source_ref[str(question["source_ref"])] = clean_rationale_option_text(
                    str(option["explanation"])
                )
                break

    records: list[dict[str, Any]] = []
    for question in group_questions:
        options = [option for option in question["options"] if normalize_visible_text(option.get("explanation", ""))]
        if len(options) < 3:
            continue

        correct_options = [option for option in options if option["is_correct"] == 1]
        if not correct_options:
            continue

        source_ref = str(question["source_ref"])
        sibling_explanations = [
            explanation
            for other_source_ref, explanation in correct_explanation_by_source_ref.items()
            if other_source_ref != source_ref
        ]
        fallback_wrong_explanations = [
            normalize_visible_text(option["explanation"])
            for option in options
            if option["is_correct"] == 0 and not is_generic_selection_rationale_text(str(option["explanation"]))
        ]
        wrong_explanations = unique_texts(sibling_explanations + fallback_wrong_explanations)
        if len(wrong_explanations) < 2:
            continue

        title = normalize_visible_text(question["title"])
        focus_source = normalize_visible_text(question.get("focus_source", "")) or extract_quoted_focus(
            question.get("prompt", "")
        ) or title
        focus_text = (
            focus_source
            if source_type == "match_pairs_reverse"
            else compact_focus_text(focus_source, 120)
        )
        concept_source = str(question["concept_source"])
        answer_kind = "Zuordnung" if source_type in {"match_pairs", "match_pairs_reverse"} else "Ergänzung"
        prompt = choose_text_variant(
            f"{source_ref}::why_fit",
            [
                f"Welche Begründung erklärt am besten, warum die passende {answer_kind} zu „{focus_text}“ fachlich trägt?",
                f"Warum passt die richtige {answer_kind} zu „{focus_text}“ in diesem Fall fachlich am besten?",
                f"Welche Begründung stützt die passende {answer_kind} zu „{focus_text}“ am klarsten?",
            ],
        )
        rationale_options = shuffled_options(
            f"{source_ref}::why_fit",
            str(correct_options[0]["explanation"]),
            wrong_explanations[:2],
            f"Richtig, weil diese Begründung den fachlichen Kern der passenden {answer_kind} hier am klarsten erklärt.",
        )
        title_source = title if source_type == "match_pairs_reverse" else focus_source
        rationale_title = build_rationale_title(title_source, "passende Begründung")
        validate_visible_texts([rationale_title, prompt])
        records.append(
            {
                "source_type": f"{source_type}_rationale_fit",
                "source_question_id": f"{question['source_question_id']}::why_fit",
                "source_ref": f"{source_ref}::why_fit",
                "title": rationale_title,
                "prompt": prompt,
                "instructions": rationale_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Begründung passt am besten?",
                "max_selections": 1,
                "options": rationale_options,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": list(question["progress_links"]),
                "concept_source": concept_source,
                "variant_source": f"{question['variant_source']}::why_fit",
                "focus_source": focus_source,
            }
        )

    return records


def collect_selection_misfit_rationale_questions(group_questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not group_questions:
        return []

    source_type = str(group_questions[0].get("source_type", "")).strip()
    if source_type not in {"match_pairs", "table_fill"}:
        return []

    correct_explanation_by_source_ref: dict[str, str] = {}
    for question in group_questions:
        for option in question["options"]:
            if option["is_correct"] == 1 and normalize_visible_text(option.get("explanation", "")):
                correct_explanation_by_source_ref[str(question["source_ref"])] = clean_rationale_option_text(
                    str(option["explanation"])
                )
                break

    records: list[dict[str, Any]] = []
    for question in group_questions:
        source_ref = str(question["source_ref"])
        specific_wrong_explanations = unique_texts(
            [
                str(option["explanation"])
                for option in question["options"]
                if option["is_correct"] == 0 and not is_generic_selection_rationale_text(str(option["explanation"]))
            ]
        )
        sibling_explanations = unique_texts(
            [
                explanation
                for other_source_ref, explanation in correct_explanation_by_source_ref.items()
                if other_source_ref != source_ref
            ]
        )
        if not specific_wrong_explanations or len(sibling_explanations) < 2:
            continue

        focus_source = normalize_visible_text(question.get("focus_source", "")) or normalize_visible_text(
            question["title"]
        )
        focus_text = compact_focus_text(focus_source, 120)
        answer_kind = "Zuordnung" if source_type == "match_pairs" else "Ergänzung"
        prompt = choose_text_variant(
            f"{source_ref}::why_not_fit",
            [
                f"Welche Begründung erklärt am besten, warum eine andere {answer_kind} zu „{focus_text}“ hier fachlich nicht trägt?",
                f"Warum ist eine naheliegende, aber falsche {answer_kind} zu „{focus_text}“ in diesem Fall fachlich unpassend?",
                f"Welche Begründung zeigt am klarsten, warum eine alternative {answer_kind} zu „{focus_text}“ hier nicht passt?",
            ],
        )
        rationale_options = shuffled_options(
            f"{source_ref}::why_not_fit",
            specific_wrong_explanations[0],
            sibling_explanations[:2],
            f"Richtig, weil diese Begründung den falschen Bezug der unpassenden {answer_kind} hier am klarsten erklärt.",
        )
        rationale_title = build_rationale_title(focus_source, "unpassende Begründung")
        validate_visible_texts([rationale_title, prompt])
        records.append(
            {
                "source_type": f"{source_type}_rationale_misfit",
                "source_question_id": f"{question['source_question_id']}::why_not_fit",
                "source_ref": f"{source_ref}::why_not_fit",
                "title": rationale_title,
                "prompt": prompt,
                "instructions": rationale_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Begründung passt am besten?",
                "max_selections": 1,
                "options": rationale_options,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": list(question["progress_links"]),
                "concept_source": str(question["concept_source"]),
                "variant_source": f"{question['variant_source']}::why_not_fit",
                "focus_source": focus_source,
            }
        )

    return records


def collect_short_text_rationale_questions(group_questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not group_questions:
        return []

    if any(
        str(question.get("source_type", "")).strip() not in {"short_text_manual", "short_text_keywords"}
        for question in group_questions
    ):
        return []

    correct_explanation_by_source_ref: dict[str, str] = {}
    for question in group_questions:
        for option in question["options"]:
            if option["is_correct"] == 1 and normalize_visible_text(option.get("explanation", "")):
                correct_explanation_by_source_ref[str(question["source_ref"])] = explanation_to_rationale_sentence(
                    str(option["explanation"])
                )
                break

    records: list[dict[str, Any]] = []
    for question in group_questions:
        source_ref = str(question["source_ref"])
        sibling_explanations = unique_texts(
            [
                explanation
                for other_source_ref, explanation in correct_explanation_by_source_ref.items()
                if other_source_ref != source_ref
            ]
        )
        if len(sibling_explanations) < 2:
            continue

        focus_source = normalize_visible_text(question["title"])
        focus_text = compact_focus_text(focus_source, 120)
        prompt = choose_text_variant(
            f"{source_ref}::why_fit",
            [
                f"Welche Begründung erklärt am besten, warum „{focus_text}“ hier fachlich den richtigen Antwortkern trifft?",
                f"Warum passt die richtige Antwort zu „{focus_text}“ hier fachlich am besten?",
                f"Welche Begründung stützt bei „{focus_text}“ die fachlich passende Antwort am klarsten?",
            ],
        )
        correct_explanation = correct_explanation_by_source_ref.get(source_ref)
        if not correct_explanation:
            continue
        rationale_options = shuffled_options(
            f"{source_ref}::why_fit",
            correct_explanation,
            sibling_explanations[:2],
            "Richtig, weil diese Begründung den fachlichen Kern der passenden Kurzantwort hier am klarsten erklärt.",
        )
        rationale_title = build_rationale_title(focus_source, "passende Begründung")
        validate_visible_texts([rationale_title, prompt])
        records.append(
            {
                "source_type": "short_text_rationale_fit",
                "source_question_id": f"{question['source_question_id']}::why_fit",
                "source_ref": f"{source_ref}::why_fit",
                "title": rationale_title,
                "prompt": prompt,
                "instructions": rationale_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Begründung passt am besten?",
                "max_selections": 1,
                "options": rationale_options,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": list(question["progress_links"]),
                "concept_source": str(question["concept_source"]),
                "variant_source": f"{question['variant_source']}::why_fit",
                "focus_source": focus_source,
            }
        )

    return records


def collect_match_pair_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> list[dict[str, Any]]:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Match-Pairs-Frage ohne ID in {scenario_rel_path}.")

    title = normalize_visible_text(raw_question.get("title", ""))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    options = unique_texts([str(option) for option in raw_question.get("options", [])])
    pairs = [
        pair
        for pair in raw_question.get("pairs", [])
        if isinstance(pair, dict)
        and normalize_visible_text(pair.get("left", ""))
        and normalize_visible_text(pair.get("right", ""))
    ]
    related_left_by_option = {
        normalize_visible_text(pair.get("right", "")): normalize_visible_text(pair.get("left", ""))
        for pair in pairs
    }

    records: list[dict[str, Any]] = []
    concept_source = f"{pool_slug}::{progress_key(progress_links)}::match::{question_id}"
    for pair_index, pair in enumerate(pairs, start=1):
        left_text = normalize_visible_text(pair.get("left", ""))
        right_text = normalize_visible_text(pair.get("right", ""))
        pair_key = str(pair.get("key") or pair_index).strip()
        source_ref = f"{scenario_rel_path}#{question_id}::{pair_key}"
        prompt = build_match_pair_prompt(left_text, source_ref)
        local_options = unique_texts(options + [right_text])
        option_records: list[dict[str, Any]] = []
        for option_index, option_text in enumerate(local_options, start=1):
            is_correct = option_text == right_text
            option_records.append(
                {
                    "source_option_id": f"{pair_key}_{option_index}",
                    "option_key": f"OPT{option_index}",
                    "sort_order": option_index,
                    "text": option_text,
                    "explanation": build_match_pair_explanation(
                        left_text,
                        option_text,
                        right_text,
                        related_left_by_option,
                        is_correct,
                        source_ref,
                    ),
                    "is_correct": 1 if is_correct else 0,
                }
            )

        derived_title = build_match_pair_title(title, left_text)
        validate_visible_texts([derived_title, prompt, left_text, right_text])
        records.append(
            {
                "source_type": "match_pairs",
                "source_question_id": f"{question_id}::{pair_key}",
                "source_ref": source_ref,
                "title": derived_title,
                "prompt": prompt,
                "instructions": derived_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Zuordnung passt am besten?",
                "max_selections": 1,
                "options": option_records,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
                "concept_source": concept_source,
                "variant_source": f"{concept_source}::{pair_key}",
                "focus_source": left_text,
            }
        )

    return records


def collect_match_pair_reverse_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> list[dict[str, Any]]:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Match-Pairs-Frage ohne ID in {scenario_rel_path}.")

    title = normalize_visible_text(raw_question.get("title", ""))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    pairs = [
        pair
        for pair in raw_question.get("pairs", [])
        if isinstance(pair, dict)
        and normalize_visible_text(pair.get("left", ""))
        and normalize_visible_text(pair.get("right", ""))
    ]
    right_counts = Counter(normalize_visible_text(pair.get("right", "")) for pair in pairs)
    related_right_by_left = {
        normalize_visible_text(pair.get("left", "")): normalize_visible_text(pair.get("right", ""))
        for pair in pairs
    }
    left_options = unique_texts([str(pair.get("left", "")) for pair in pairs])

    records: list[dict[str, Any]] = []
    concept_source = f"{pool_slug}::{progress_key(progress_links)}::match_reverse::{question_id}"
    for pair_index, pair in enumerate(pairs, start=1):
        left_text = normalize_visible_text(pair.get("left", ""))
        right_text = normalize_visible_text(pair.get("right", ""))
        if right_counts.get(right_text, 0) > 1:
            continue
        pair_key = str(pair.get("key") or pair_index).strip()
        source_ref = f"{scenario_rel_path}#{question_id}::{pair_key}::reverse"
        prompt = build_match_pair_prompt(right_text, source_ref)
        option_records: list[dict[str, Any]] = []
        for option_index, option_text in enumerate(left_options, start=1):
            is_correct = option_text == left_text
            option_records.append(
                {
                    "source_option_id": f"{pair_key}_reverse_{option_index}",
                    "option_key": f"OPT{option_index}",
                    "sort_order": option_index,
                    "text": option_text,
                    "explanation": build_match_pair_explanation(
                        right_text,
                        option_text,
                        left_text,
                        related_right_by_left,
                        is_correct,
                        source_ref,
                    ),
                    "is_correct": 1 if is_correct else 0,
                }
            )

        derived_title = build_reverse_match_pair_title(title, right_text)
        validate_visible_texts([derived_title, prompt, left_text, right_text])
        records.append(
            {
                "source_type": "match_pairs_reverse",
                "source_question_id": f"{question_id}::{pair_key}::reverse",
                "source_ref": source_ref,
                "title": derived_title,
                "prompt": prompt,
                "instructions": derived_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Zuordnung passt am besten?",
                "max_selections": 1,
                "options": option_records,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
                "concept_source": concept_source,
                "variant_source": f"{concept_source}::{pair_key}",
                "focus_source": right_text,
            }
        )

    return records


def collect_table_fill_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> list[dict[str, Any]]:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Table-Fill-Frage ohne ID in {scenario_rel_path}.")

    parent_title = normalize_visible_text(raw_question.get("title", ""))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    columns = [normalize_visible_text(column) for column in raw_question.get("columns", [])]
    rows = [row for row in raw_question.get("rows", []) if isinstance(row, list) and row]

    expected_row_by_column: dict[int, dict[str, str]] = {}
    for row in rows:
        row_has_header = bool(row) and not isinstance(row[0], dict)
        start_index = 1 if row_has_header else 0
        for column_index, cell in enumerate(row[start_index:], start=start_index):
            if not isinstance(cell, dict):
                continue
            expected_text = normalize_visible_text(cell.get("expected", ""))
            if not expected_text:
                continue
            column_header = columns[column_index] if column_index < len(columns) else normalize_visible_text(cell.get("label", ""))
            row_label = row_anchor_label(row, column_header, cell)
            expected_row_by_column.setdefault(column_index, {})[expected_text] = row_label

    records: list[dict[str, Any]] = []
    for row_index, row in enumerate(rows, start=1):
        row_has_header = bool(row) and not isinstance(row[0], dict)
        start_index = 1 if row_has_header else 0
        for column_index, cell in enumerate(row[start_index:], start=start_index):
            if not isinstance(cell, dict):
                continue

            expected_text = normalize_visible_text(cell.get("expected", ""))
            if not expected_text:
                continue

            local_options = unique_texts([str(option) for option in cell.get("options", [])] + [expected_text])
            if len(local_options) < 2:
                continue

            column_header = columns[column_index] if column_index < len(columns) else normalize_visible_text(cell.get("label", ""))
            row_label = row_anchor_label(row, column_header, cell)
            source_key = str(cell.get("key") or f"r{row_index}_c{column_index}").strip()
            source_ref = f"{scenario_rel_path}#{question_id}::{source_key}"
            prompt = build_table_cell_prompt(row_label, column_header, source_ref)
            related_rows = expected_row_by_column.get(column_index, {})
            concept_source = (
                f"{pool_slug}::{progress_key(progress_links)}::table::{question_id}::"
                f"{normalize_visible_text(column_header).casefold()}"
            )

            option_records: list[dict[str, Any]] = []
            for option_index, option_text in enumerate(local_options, start=1):
                is_correct = option_text == expected_text
                option_records.append(
                    {
                        "source_option_id": f"{source_key}_{option_index}",
                        "option_key": f"OPT{option_index}",
                        "sort_order": option_index,
                        "text": option_text,
                        "explanation": build_table_cell_explanation(
                            row_label,
                            column_header,
                            option_text,
                            expected_text,
                            related_rows,
                            is_correct,
                            source_ref,
                        ),
                        "is_correct": 1 if is_correct else 0,
                    }
                )

            derived_title = build_table_cell_title(
                parent_title,
                row_label,
                column_header,
                str(cell.get("label") or ""),
            )
            validate_visible_texts([derived_title, prompt, expected_text, row_label, column_header])
            records.append(
                {
                    "source_type": "table_fill",
                    "source_question_id": f"{question_id}::{source_key}",
                    "source_ref": source_ref,
                    "title": derived_title,
                    "prompt": prompt,
                    "instructions": derived_title,
                    "context": "",
                    "interaction_type": "single",
                    "question_kind": "eine_richtige_antwort_waehlen",
                    "badge_label": "Welche Ergänzung passt hier am besten?",
                    "max_selections": 1,
                    "options": option_records,
                    "sequence_items": [],
                    "accepted_answers": [],
                    "progress_links": progress_links,
                    "concept_source": concept_source,
                    "variant_source": f"{concept_source}::{source_key}",
                    "focus_source": row_label,
                }
            )

    return records


def collect_table_fill_reverse_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> list[dict[str, Any]]:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Table-Fill-Frage ohne ID in {scenario_rel_path}.")

    parent_title = normalize_visible_text(raw_question.get("title", ""))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    columns = [normalize_visible_text(column) for column in raw_question.get("columns", [])]
    rows = [row for row in raw_question.get("rows", []) if isinstance(row, list) and row]

    duplicate_counter: Counter[tuple[str, str]] = Counter()
    expected_by_row_for_column: dict[int, dict[str, str]] = {}
    row_labels_by_column: dict[int, list[str]] = {}
    cell_records: list[dict[str, Any]] = []

    for row_index, row in enumerate(rows, start=1):
        row_has_header = bool(row) and not isinstance(row[0], dict)
        start_index = 1 if row_has_header else 0
        for column_index, cell in enumerate(row[start_index:], start=start_index):
            if not isinstance(cell, dict):
                continue
            expected_text = normalize_visible_text(cell.get("expected", ""))
            if not expected_text:
                continue
            column_header = columns[column_index] if column_index < len(columns) else normalize_visible_text(cell.get("label", ""))
            row_label = row_anchor_label(row, column_header, cell)
            source_key = str(cell.get("key") or f"r{row_index}_c{column_index}").strip()

            duplicate_counter[(column_header, expected_text)] += 1
            expected_by_row_for_column.setdefault(column_index, {})[row_label] = expected_text
            row_labels_by_column.setdefault(column_index, []).append(row_label)
            cell_records.append(
                {
                    "column_index": column_index,
                    "column_header": column_header,
                    "expected_text": expected_text,
                    "row_label": row_label,
                    "source_key": source_key,
                }
            )

    records: list[dict[str, Any]] = []
    for cell in cell_records:
        column_index = int(cell["column_index"])
        column_header = str(cell["column_header"])
        expected_text = str(cell["expected_text"])
        row_label = str(cell["row_label"])
        source_key = str(cell["source_key"])

        if duplicate_counter[(column_header, expected_text)] > 1:
            continue

        row_options = unique_texts(row_labels_by_column.get(column_index, []))
        if len(row_options) < 2:
            continue

        source_ref = f"{scenario_rel_path}#{question_id}::{source_key}::reverse"
        prompt = build_reverse_table_cell_prompt(expected_text, column_header, source_ref)
        concept_source = (
            f"{pool_slug}::{progress_key(progress_links)}::table_reverse::{question_id}::"
            f"{normalize_visible_text(column_header).casefold()}"
        )
        related_expected = expected_by_row_for_column.get(column_index, {})

        option_records: list[dict[str, Any]] = []
        for option_index, option_text in enumerate(row_options, start=1):
            is_correct = option_text == row_label
            option_records.append(
                {
                    "source_option_id": f"{source_key}_reverse_{option_index}",
                    "option_key": f"OPT{option_index}",
                    "sort_order": option_index,
                    "text": option_text,
                    "explanation": build_reverse_table_cell_explanation(
                        expected_text,
                        column_header,
                        option_text,
                        row_label,
                        related_expected,
                        is_correct,
                        source_ref,
                    ),
                    "is_correct": 1 if is_correct else 0,
                }
            )

        derived_title = build_reverse_table_cell_title(parent_title, expected_text)
        validate_visible_texts([derived_title, prompt, expected_text, row_label, column_header])
        records.append(
            {
                "source_type": "table_fill_reverse",
                "source_question_id": f"{question_id}::{source_key}::reverse",
                "source_ref": source_ref,
                "title": derived_title,
                "prompt": prompt,
                "instructions": derived_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Zuordnung passt am besten?",
                "max_selections": 1,
                "options": option_records,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
                "concept_source": concept_source,
                "variant_source": f"{concept_source}::{source_key}",
                "focus_source": expected_text,
            }
        )

    return records


def collect_ordering_question(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> dict[str, Any] | None:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Ordering-Frage ohne ID in {scenario_rel_path}.")

    correct_order = raw_question.get("correctOrder") or raw_question.get("items") or []
    sequence_items = [
        normalize_visible_text(item)
        for item in correct_order
        if normalize_visible_text(item)
    ]
    if len(sequence_items) < 2:
        return None

    title = normalize_visible_text(raw_question.get("title", ""))
    prompt = normalize_visible_text(raw_question.get("prompt", ""))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    concept_source = f"{pool_slug}::{progress_key(progress_links)}::ordering::{question_id}"
    validate_visible_texts([title, prompt] + sequence_items)
    return {
        "source_type": "ordering",
        "source_question_id": question_id,
        "source_ref": f"{scenario_rel_path}#{question_id}",
        "title": title,
        "prompt": prompt,
        "instructions": title,
        "context": "",
        "interaction_type": "sequence",
        "question_kind": "reihenfolge_bestimmen",
        "badge_label": "Welche Reihenfolge stimmt?",
        "max_selections": len(sequence_items),
        "options": [],
        "sequence_items": sequence_items,
        "accepted_answers": [],
        "progress_links": progress_links,
        "concept_source": concept_source,
        "variant_source": f"{concept_source}::v1",
    }


def collect_ordering_followup_question(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> dict[str, Any] | None:
    question_id = str(raw_question.get("id", "")).strip()
    if not question_id:
        raise ValueError(f"Ordering-Folgefrage ohne ID in {scenario_rel_path}.")

    correct_order = [
        normalize_visible_text(item)
        for item in (raw_question.get("correctOrder") or raw_question.get("items") or [])
        if normalize_visible_text(item)
    ]
    if len(correct_order) < 2:
        return None

    title = shorten_visible_title(
        f"{normalize_visible_text(raw_question.get('title', ''))}: erster Schritt"
    )
    prompt = choose_text_variant(
        f"{scenario_rel_path}#{question_id}::ordering_first",
        [
            "Welcher Schritt muss in diesem Ablauf fachlich am Anfang stehen?",
            "Mit welchem Schritt sollte dieser Ablauf fachlich beginnen?",
            "Welche Aktion gehört in dieser Reihenfolge an die erste Stelle?",
        ],
    )
    correct_text = correct_order[0]
    wrong_texts = correct_order[1:]
    options = shuffled_options(
        f"{scenario_rel_path}#{question_id}::ordering_first",
        correct_text,
        wrong_texts,
        "Richtig, weil dieser Schritt den Ablauf fachlich eröffnet und die übrigen Schritte erst darauf aufbauen.",
    )
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    concept_source = f"{pool_slug}::{progress_key(progress_links)}::ordering::{question_id}"
    validate_visible_texts([title, prompt, correct_text])
    return {
        "source_type": "ordering_first_step",
        "source_question_id": f"{question_id}::first",
        "source_ref": f"{scenario_rel_path}#{question_id}::first_step",
        "title": title,
        "prompt": prompt,
        "instructions": title,
        "context": "",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "badge_label": "Welche Antwort trifft am besten zu?",
        "max_selections": 1,
        "options": options,
        "sequence_items": [],
        "accepted_answers": [],
        "progress_links": progress_links,
        "concept_source": concept_source,
        "variant_source": f"{concept_source}::first_step",
    }


def build_keyword_combo(source_ref: str, current_keywords: list[str]) -> tuple[str, list[str]]:
    normalized_current = unique_texts(current_keywords)
    correct_text = " / ".join(normalized_current)
    distractors = unique_texts(SHORT_TEXT_KEYWORD_DISTRACTORS.get(source_ref, []))
    if len(distractors) < 2:
        raise ValueError(f"Zu wenige Keyword-Distraktoren für {source_ref}.")
    return correct_text, distractors[:2]


def collect_short_text_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    pool_slug: str,
) -> list[dict[str, Any]]:
    question_id = str(raw_question.get("id", "")).strip()
    source_ref_base = f"{scenario_rel_path}#{question_id}"
    if not question_id:
        raise ValueError(f"Short-Text-Frage ohne ID in {scenario_rel_path}.")

    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    concept_source = f"{pool_slug}::{progress_key(progress_links)}::short_text::{question_id}"

    specs = SHORT_TEXT_DERIVED_SPECS.get(source_ref_base, [])
    records: list[dict[str, Any]] = []
    for spec_index, spec in enumerate(specs, start=1):
        local_source_ref = f"{source_ref_base}::st{spec_index}"
        options = shuffled_options(
            local_source_ref,
            str(spec["correct_text"]),
            [str(text) for text in spec["wrong_texts"]],
            str(spec["correct_explanation"]),
        )
        title = normalize_visible_text(spec["title"])
        prompt = normalize_visible_text(spec["prompt"])
        validate_visible_texts([title, prompt])
        records.append(
            {
                "source_type": "short_text_manual",
                "source_question_id": f"{question_id}::st{spec_index}",
                "source_ref": local_source_ref,
                "title": title,
                "prompt": prompt,
                "instructions": title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Antwort trifft am besten zu?",
                "max_selections": 1,
                "options": options,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
                "concept_source": concept_source,
                "variant_source": f"{concept_source}::manual::{spec_index}",
            }
        )

    required_keywords = [
        str(keyword).strip()
        for keyword in raw_question.get("requiredKeywords", [])
        if str(keyword).strip()
    ]
    if required_keywords:
        correct_text, distractors = build_keyword_combo(
            source_ref_base,
            required_keywords,
        )
        keyword_title = shorten_visible_title(
            f"{normalize_visible_text(raw_question.get('title', ''))}: Schlüsselbegriffe"
        )
        keyword_prompt = choose_text_variant(
            f"{source_ref_base}::keywords",
            [
                "Welche Begriffskombination sollte in einer starken Kurzantwort am ehesten vorkommen?",
                "Welche Begriffskombination markiert den Kern einer guten Kurzantwort hier am besten?",
                "Welche Begriffe passen als Signalwörter zu einer fachlich starken Antwort am besten zusammen?",
            ],
        )
        keyword_options = shuffled_options(
            f"{source_ref_base}::keywords",
            correct_text,
            distractors,
            "Richtig, weil diese Begriffe den fachlichen Kern der erwarteten Kurzantwort am klarsten markieren.",
        )
        validate_visible_texts([keyword_title, keyword_prompt, correct_text])
        records.append(
            {
                "source_type": "short_text_keywords",
                "source_question_id": f"{question_id}::keywords",
                "source_ref": f"{source_ref_base}::keywords",
                "title": keyword_title,
                "prompt": keyword_prompt,
                "instructions": keyword_title,
                "context": "",
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": "Welche Antwort trifft am besten zu?",
                "max_selections": 1,
                "options": keyword_options,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
                "concept_source": concept_source,
                "variant_source": f"{concept_source}::keywords",
            }
        )

    return records


def collect_questions_for_scenario(
    scenario_rel_path: str,
    scenario_data: dict[str, Any],
    pool_slug: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], Counter[str]]:
    direct_questions: list[dict[str, Any]] = []
    derived_candidates: list[dict[str, Any]] = []
    skipped_types: Counter[str] = Counter()
    active_context = ""

    for raw_question in scenario_data.get("questions", []):
        question_type = str(raw_question.get("type", "")).strip()

        if question_type == "followup_divider":
            active_context = ""
            continue
        if question_type == "context_card":
            active_context = normalize_visible_text(render_context_card(raw_question))
            continue

        if question_type in DIRECT_QUESTION_META_BY_TYPE:
            direct_question = collect_direct_question(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                active_context=active_context,
                pool_slug=pool_slug,
            )
            direct_questions.append(direct_question)
            derived_candidates.extend(collect_direct_rationale_questions(direct_question))
            continue

        if question_type == "table_fill":
            table_fill_questions = collect_table_fill_questions(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            table_fill_reverse_questions = collect_table_fill_reverse_questions(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            derived_candidates.extend(table_fill_questions)
            derived_candidates.extend(table_fill_reverse_questions)
            derived_candidates.extend(collect_selection_rationale_questions(table_fill_questions))
            derived_candidates.extend(collect_selection_misfit_rationale_questions(table_fill_questions))
            continue

        if question_type == "match_pairs":
            match_pair_questions = collect_match_pair_questions(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            match_pair_reverse_questions = collect_match_pair_reverse_questions(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            derived_candidates.extend(match_pair_questions)
            derived_candidates.extend(match_pair_reverse_questions)
            derived_candidates.extend(collect_selection_rationale_questions(match_pair_questions))
            derived_candidates.extend(collect_selection_rationale_questions(match_pair_reverse_questions))
            derived_candidates.extend(collect_selection_misfit_rationale_questions(match_pair_questions))
            continue

        if question_type == "ordering":
            ordering_record = collect_ordering_question(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            if ordering_record:
                direct_questions.append(ordering_record)
            else:
                skipped_types[question_type] += 1
            ordering_followup = collect_ordering_followup_question(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            if ordering_followup:
                derived_candidates.append(ordering_followup)
            continue
        if question_type == "short_text":
            short_text_questions = collect_short_text_questions(
                scenario_rel_path=scenario_rel_path,
                raw_question=raw_question,
                pool_slug=pool_slug,
            )
            derived_candidates.extend(short_text_questions)
            derived_candidates.extend(collect_short_text_rationale_questions(short_text_questions))
            continue

        skipped_types[question_type or "<leer>"] += 1

    for candidate_index, candidate in enumerate(derived_candidates, start=1):
        candidate["candidate_order"] = candidate_index
    source_type_priority = {
        "ordering_first_step": 0,
        "table_fill": 1,
        "table_fill_reverse": 2,
        "match_pairs": 3,
        "match_pairs_reverse": 4,
        "short_text_manual": 5,
        "short_text_keywords": 6,
        "ordering": 7,
        "direct_rationale_fit": 8,
        "direct_rationale_misfit": 9,
        "table_fill_rationale_misfit": 10,
        "table_fill_rationale_fit": 11,
        "match_pairs_rationale_fit": 12,
        "short_text_rationale_fit": 13,
        "match_pairs_rationale_misfit": 14,
    }
    derived_candidates.sort(
        key=lambda candidate: (
            source_type_priority.get(candidate["source_type"], 9),
            candidate["candidate_order"],
        )
    )

    return direct_questions, derived_candidates, skipped_types


def allocate_derived_budgets(
    scenario_order: list[str],
    candidate_counts: dict[str, int],
    target_total: int,
) -> dict[str, int]:
    total_available = sum(candidate_counts.values())
    if total_available < target_total:
        raise ValueError(
            f"Es stehen nur {total_available} abgeleitete Fragen zur Verfügung, benötigt werden aber {target_total}."
        )

    budgets = {
        scenario_rel_path: min(BASE_DERIVED_SCENARIO_BUDGET, candidate_counts[scenario_rel_path])
        for scenario_rel_path in scenario_order
    }
    current_total = sum(budgets.values())

    if current_total > target_total:
        while current_total > target_total:
            reduced = False
            for scenario_rel_path in reversed(scenario_order):
                if budgets[scenario_rel_path] > 0:
                    budgets[scenario_rel_path] -= 1
                    current_total -= 1
                    reduced = True
                    if current_total == target_total:
                        break
            if not reduced:
                break

    while current_total < target_total:
        added = False
        for scenario_rel_path in sorted(
            scenario_order,
            key=lambda key: (candidate_counts[key] - budgets[key], -scenario_order.index(key)),
            reverse=True,
        ):
            if budgets[scenario_rel_path] >= candidate_counts[scenario_rel_path]:
                continue
            budgets[scenario_rel_path] += 1
            current_total += 1
            added = True
            if current_total == target_total:
                break
        if not added:
            break

    if sum(budgets.values()) != target_total:
        raise ValueError(f"Die Budgetverteilung ergab {sum(budgets.values())} statt {target_total} Fragen.")

    return budgets


def resolve_derived_target(total_direct_questions: int, question_target_total: int) -> int:
    if question_target_total < total_direct_questions:
        raise ValueError(
            f"Das Ziel von {question_target_total} Fragen liegt unter den {total_direct_questions} direkten Fragen."
        )
    return question_target_total - total_direct_questions


def collect_pools(
    question_target_total: int,
) -> tuple[list[dict[str, Any]], Counter[str], Counter[str], int, int, int]:
    manifest = json.loads(SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
    topic_titles = load_topic_titles()

    scenario_entries: list[dict[str, Any]] = []
    candidate_counts: dict[str, int] = {}
    scenario_order: list[str] = []
    skipped_totals: Counter[str] = Counter()
    selected_type_totals: Counter[str] = Counter()
    total_direct_questions = 0

    for entry in manifest.get("scenarios", []):
        scenario_rel_path = str(entry.get("file", "")).strip()
        if not scenario_rel_path:
            continue

        scenario_path = SCENARIO_ROOT / scenario_rel_path
        scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
        pool_slug = normalize_pool_slug(scenario_path.parent.name)
        direct_questions, derived_candidates, skipped_types = collect_questions_for_scenario(
            scenario_rel_path=scenario_rel_path,
            scenario_data=scenario_data,
            pool_slug=pool_slug,
        )

        scenario_order.append(scenario_rel_path)
        candidate_counts[scenario_rel_path] = len(derived_candidates)
        skipped_totals.update(skipped_types)
        scenario_entries.append(
            {
                "scenario_rel_path": scenario_rel_path,
                "scenario_data": scenario_data,
                "scenario_path": scenario_path,
                "pool_slug": pool_slug,
                "label": normalize_visible_text(strip_ticket_prefix(str(entry.get("label", "")))),
                "direct_questions": direct_questions,
                "derived_candidates": derived_candidates,
            }
        )
        total_direct_questions += len(direct_questions)

    derived_question_target = resolve_derived_target(total_direct_questions, question_target_total)
    total_available_derived = sum(candidate_counts.values())
    budgets = allocate_derived_budgets(
        scenario_order=scenario_order,
        candidate_counts=candidate_counts,
        target_total=derived_question_target,
    )

    pools: list[dict[str, Any]] = []
    for scenario_entry in scenario_entries:
        scenario_rel_path = scenario_entry["scenario_rel_path"]
        label = scenario_entry["label"]
        direct_questions = scenario_entry["direct_questions"]
        derived_candidates = scenario_entry["derived_candidates"]
        selected_derived = derived_candidates[: budgets[scenario_rel_path]]
        skipped_derived = derived_candidates[budgets[scenario_rel_path] :]

        for question in direct_questions:
            selected_type_totals[question["source_type"]] += 1
        for question in selected_derived:
            selected_type_totals[question["source_type"]] += 1
        for question in skipped_derived:
            skipped_totals[f"{question['source_type']}_nicht_importiert"] += 1

        questions = direct_questions + selected_derived
        if not questions:
            continue

        description = normalize_visible_text(build_pool_description(scenario_entry["scenario_data"]))
        validate_visible_texts([label, description])

        pools.append(
            {
                "id": stable_id("pool", scenario_rel_path),
                "slug": scenario_entry["pool_slug"],
                "label": label,
                "description": description,
                "source_ref": scenario_rel_path,
                "default_interaction_type": Counter(
                    question["interaction_type"] for question in questions
                ).most_common(1)[0][0],
                "default_question_kind": Counter(
                    question["question_kind"] for question in questions
                ).most_common(1)[0][0],
                "default_badge_label": Counter(
                    question["badge_label"] for question in questions
                ).most_common(1)[0][0],
                "topics": collect_pool_topics(label, questions, topic_titles),
                "questions": questions,
            }
        )

    return (
        pools,
        skipped_totals,
        selected_type_totals,
        derived_question_target,
        total_direct_questions,
        total_available_derived,
    )


def rebuild_database(pools: list[dict[str, Any]]) -> tuple[int, int, int, int]:
    question_count = sum(len(pool["questions"]) for pool in pools)
    option_count = sum(len(question["options"]) for pool in pools for question in pool["questions"])
    sequence_item_count = sum(
        len(question["sequence_items"]) for pool in pools for question in pool["questions"]
    )
    accepted_answer_count = sum(
        len(question["accepted_answers"]) for pool in pools for question in pool["questions"]
    )

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
                "Pruefungsvorbereitung-1-FIAE-Quiz",
                "PV1FIAE",
                "Prüfungsvorbereitung 1 FIAE",
                "Quizdatenbank für AP2-FIAE-Teil-1-Aufgaben aus den PV1-Szenarien.",
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
                concept_id = stable_id("concept", question["concept_source"])
                variant_id = stable_id("variant", question["variant_source"])

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
                        question["instructions"],
                        question["context"],
                        question["max_selections"],
                        0,
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

                for item_index, item_text in enumerate(question["sequence_items"], start=1):
                    item_id = stable_id("sequence_item", f"{question['source_ref']}::{item_index}")
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
                            f"ITEM{item_index}",
                            item_index,
                            item_text,
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Importiert PV1-FIAE-Fragen in die Quiz-Datenbank mit steuerbarem Gesamtziel."
    )
    parser.add_argument(
        "--question-target-total",
        type=int,
        default=None,
        help="Gewünschte Gesamtzahl an Fragen in der PV1-FIAE-Quiz-Datenbank.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    question_target_total = args.question_target_total
    if question_target_total is None:
        current_total = current_question_total()
        question_target_total = max(DEFAULT_PACKAGE_INCREMENT, current_total + DEFAULT_PACKAGE_INCREMENT)
    (
        pools,
        skipped_totals,
        selected_type_totals,
        derived_question_target,
        total_direct_questions,
        total_available_derived,
    ) = collect_pools(
        question_target_total=question_target_total
    )
    question_count, option_count, sequence_item_count, accepted_answer_count = rebuild_database(pools)

    print(f"db={QUIZ_DB_PATH.relative_to(ROOT)}")
    print(f"pools={len(pools)}")
    print(f"question_target_total={question_target_total}")
    print(f"total_direct_questions={total_direct_questions}")
    print(f"total_available_derived={total_available_derived}")
    print(f"derived_question_target={derived_question_target}")
    print(f"max_question_total={total_direct_questions + total_available_derived}")
    print(f"questions={question_count}")
    print(f"options={option_count}")
    print(f"sequence_items={sequence_item_count}")
    print(f"accepted_answers={accepted_answer_count}")
    for key, count in sorted(selected_type_totals.items()):
        print(f"selected_{key}={count}")
    for key, count in sorted(skipped_totals.items()):
        print(f"skipped_{key}={count}")


if __name__ == "__main__":
    main()
