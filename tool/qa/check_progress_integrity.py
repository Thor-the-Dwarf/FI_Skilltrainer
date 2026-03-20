#!/usr/bin/env python3
"""Validate scenario progress bindings and evaluator coverage."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
KURSE_DIR = ROOT / "Kurse"
INDEX_HTML = ROOT / "index.html"
STRUCTURAL_TYPES = {"context_card", "followup_divider"}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def sanitize_folder_filter(values: list[str] | None) -> set[str]:
    if not values:
        return set()
    return {value.strip() for value in values if value.strip()}


def extract_supported_types(index_html: str, kind: str) -> set[str]:
    if kind == "evaluate":
        pattern = r'if \(q\.type === "([^"]+)"\) return evaluate'
    elif kind == "render":
        pattern = r'if \(q\.type === "([^"]+)"\) body = render'
    elif kind == "answered":
        pattern = r'if \(question\.type === "([^"]+)"\)'
    else:
        raise ValueError(f"Unknown kind: {kind}")
    return set(re.findall(pattern, index_html))


def extract_skill_ids(skill_payload: dict) -> tuple[set[str], list[str]]:
    ids: set[str] = set()
    duplicates: list[str] = []
    for section in skill_payload.get("sections", []):
        if not isinstance(section, dict):
            continue
        for subsection in section.get("subsections", []):
            if not isinstance(subsection, dict):
                continue
            raw = subsection.get("id") or subsection.get("progressId") or subsection.get("skillId")
            value = str(raw or "").strip().lower()
            if not value:
                continue
            if value in ids:
                duplicates.append(value)
            ids.add(value)
    return ids, duplicates


def scenario_manifest_files(folder: Path) -> set[str]:
    manifest_path = folder / "scenario-manifest.json"
    if not manifest_path.exists():
        return set()
    payload = load_json(manifest_path)
    source = payload.get("scenarios", payload)
    result = set()
    if isinstance(source, list):
        for entry in source:
            if isinstance(entry, dict):
                file_name = str(entry.get("file") or "").strip()
                if file_name:
                    result.add(file_name)
    return result


def iter_scenario_folders(folder_filter: set[str]) -> list[Path]:
    folders = sorted(
        path for path in KURSE_DIR.iterdir()
        if path.is_dir() and path.name.endswith("-Scenarien")
    )
    if not folder_filter:
        return folders
    return [path for path in folders if path.name in folder_filter]


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate progress bindings for scenario folders.")
    parser.add_argument(
        "--folder",
        action="append",
        dest="folders",
        help="Only validate a specific *-Scenarien folder. Can be passed multiple times."
    )
    args = parser.parse_args()
    folder_filter = sanitize_folder_filter(args.folders)

    index_html = INDEX_HTML.read_text(encoding="utf-8")
    supported_by_eval = extract_supported_types(index_html, "evaluate")
    supported_by_render = extract_supported_types(index_html, "render")
    supported_by_answered = extract_supported_types(index_html, "answered")

    problems: list[str] = []
    type_counter: Counter[str] = Counter()
    checked_folders = 0
    checked_scenarios = 0
    checked_questions = 0

    for folder in iter_scenario_folders(folder_filter):
        checked_folders += 1
        skill_path = folder / "possible_skills.json"
        if not skill_path.exists():
            problems.append(f"{folder.name}: missing possible_skills.json")
            continue

        skill_payload = load_json(skill_path)
        known_skill_ids, duplicate_skill_ids = extract_skill_ids(skill_payload)
        for duplicate in duplicate_skill_ids:
            problems.append(f"{folder.name}: duplicate skill id '{duplicate}' in possible_skills.json")

        manifest_files = scenario_manifest_files(folder)
        disk_scenario_files = sorted(
            path for path in folder.glob("*.json")
            if path.name not in {"possible_skills.json", "scenario-manifest.json"}
        )
        disk_file_names = {path.name for path in disk_scenario_files}

        for file_name in sorted(manifest_files - disk_file_names):
            problems.append(f"{folder.name}: manifest references missing scenario file '{file_name}'")

        if manifest_files:
            scenario_files = [path for path in disk_scenario_files if path.name in manifest_files]
        else:
            scenario_files = disk_scenario_files

        for scenario_path in scenario_files:
            checked_scenarios += 1
            payload = load_json(scenario_path)
            questions = payload.get("questions", [])
            if not isinstance(questions, list):
                problems.append(f"{folder.name}/{scenario_path.name}: questions is not a list")
                continue

            question_ids: set[str] = set()
            for question in questions:
                if not isinstance(question, dict):
                    problems.append(f"{folder.name}/{scenario_path.name}: invalid question entry {question!r}")
                    continue

                qid = str(question.get("id") or "").strip()
                qtype = str(question.get("type") or "").strip()
                if not qid:
                    problems.append(f"{folder.name}/{scenario_path.name}: question without id")
                    continue
                if qid in question_ids:
                    problems.append(f"{folder.name}/{scenario_path.name}: duplicate question id '{qid}'")
                question_ids.add(qid)

                if qtype in STRUCTURAL_TYPES:
                    continue

                checked_questions += 1
                type_counter[qtype] += 1

                links = question.get("progressLinks")
                if not isinstance(links, list) or not links:
                    problems.append(f"{folder.name}/{scenario_path.name}/{qid}: missing progressLinks")
                else:
                    for raw_link in links:
                        progress_id = str(raw_link or "").strip().lower()
                        if not progress_id:
                            problems.append(f"{folder.name}/{scenario_path.name}/{qid}: empty progressLink")
                            continue
                        if progress_id not in known_skill_ids:
                            problems.append(
                                f"{folder.name}/{scenario_path.name}/{qid}: unknown progressLink '{progress_id}'"
                            )

                if qtype not in supported_by_eval:
                    problems.append(f"{folder.name}/{scenario_path.name}/{qid}: no evaluateQuestion support for '{qtype}'")
                if qtype not in supported_by_render:
                    problems.append(f"{folder.name}/{scenario_path.name}/{qid}: no renderQuestion support for '{qtype}'")
                if qtype not in supported_by_answered:
                    problems.append(f"{folder.name}/{scenario_path.name}/{qid}: no completion-state support for '{qtype}'")

    if problems:
        print(f"FAIL - {len(problems)} problem(s) found")
        for entry in problems:
            print(f"- {entry}")
        return 1

    print(
        "PASS - "
        f"{checked_folders} folder(s), {checked_scenarios} scenario(s), {checked_questions} scored question(s), "
        f"{len(type_counter)} question type(s) checked"
    )
    print("Question types:", ", ".join(sorted(type_counter)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
