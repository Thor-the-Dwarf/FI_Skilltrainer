#!/usr/bin/env python3

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUIZ_JSON_PATH = (
    ROOT
    / "Kurse"
    / "Pruefungsvorbereitung-2-FIAE-Quiz"
    / "quiz_ap2_fiae_gesamtpool"
    / "quiz01_V01_ap2_fiae_gesamtpool.json"
)

GLOBAL_REPLACEMENTS = {
    "Ergaenzung": "Ergänzung",
    "boersenweise": "börsenweise",
    "reprasentativen": "repräsentativen",
    "Ausmass": "Ausmaß",
}

PROMPT_PREFIX_REPLACEMENTS = {
    "Für einer ": "Bei einer ",
    "Für eine ": "Bei einer ",
    "Für einem ": "Bei einem ",
    "Für einen ": "Bei einem ",
    "Für ein ": "Bei einem ",
}


def normalize_visible_text(value: str, field_name: str) -> str:
    normalized = value
    for source, target in GLOBAL_REPLACEMENTS.items():
        normalized = normalized.replace(source, target)
    if field_name == "prompt":
        for source, target in PROMPT_PREFIX_REPLACEMENTS.items():
            if normalized.startswith(source):
                normalized = target + normalized[len(source) :]
                break
    return normalized


def main() -> None:
    data = json.loads(QUIZ_JSON_PATH.read_text(encoding="utf-8"))
    fields = ("title", "description", "defaultBadgeLabel")
    for field in fields:
        if isinstance(data.get(field), str):
            data[field] = normalize_visible_text(data[field], field)

    for question in data.get("questions", []):
        for field in ("badgeLabel", "prompt"):
            if isinstance(question.get(field), str):
                question[field] = normalize_visible_text(question[field], field)
        for option in question.get("options", []):
            for field in ("text", "explanation"):
                if isinstance(option.get(field), str):
                    option[field] = normalize_visible_text(option[field], field)

    QUIZ_JSON_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(QUIZ_JSON_PATH.relative_to(ROOT))


if __name__ == "__main__":
    main()
