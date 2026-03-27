#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import os
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG_PATH = ROOT / "QuizMaster" / "output" / "helper_watchdog_config.json"
DEFAULT_STATE_PATH = ROOT / "QuizMaster" / "output" / "helper_watchdog_state.json"
DEFAULT_LOG_PATH = ROOT / "QuizMaster" / "output" / "helper_watchdog.log"
DEFAULT_CODEX_PATH = Path(
    shutil.which("codex") or "/Applications/Codex.app/Contents/Resources/codex"
)
DEFAULT_INTERVAL_MINUTES = 10
DEFAULT_RESUME_SESSION_ID = os.environ.get("CODEX_THREAD_ID", "").strip()


@dataclass
class HelperConfig:
    agent_id: str
    label: str
    db_path: str
    target_questions: int = 1000


@dataclass
class HelperStatus:
    agent_id: str
    label: str
    db_path: str
    target_questions: int
    question_count: int
    previous_question_count: int | None
    db_mtime: float | None
    previous_db_mtime: float | None
    changed_since_last_cycle: bool
    stalled_cycles: int
    is_complete: bool


DEFAULT_CONFIG: dict[str, Any] = {
    "interval_minutes": DEFAULT_INTERVAL_MINUTES,
    "model": "gpt-5.4-mini",
    "resume_session_id": DEFAULT_RESUME_SESSION_ID,
    "helpers": [
        {
            "agent_id": "019d2d39-c95d-78b0-84a4-7bec1847319e",
            "label": "PV1-FIAE",
            "db_path": str(ROOT / "Kurse" / "Pruefungsvorbereitung-1-FIAE-Quiz.db"),
            "target_questions": 1000,
        },
        {
            "agent_id": "019d2d52-0289-7062-b1b7-ad2a3875faf4",
            "label": "QuS2",
            "db_path": str(ROOT / "Kurse" / "QuS2-Quiz.db"),
            "target_questions": 1000,
        },
        {
            "agent_id": "019d2d4f-2784-7b02-b53c-c42dd22f37c9",
            "label": "LF12FIAE",
            "db_path": str(ROOT / "Kurse" / "LF12FIAE-Quiz.db"),
            "target_questions": 1000,
        },
        {
            "agent_id": "019d2d53-cd05-7350-9285-feee343bfd42",
            "label": "PV3-WISO",
            "db_path": str(ROOT / "Kurse" / "Pruefungsvorbereitung-3-WISO-Quiz.db"),
            "target_questions": 1000,
        },
    ],
}


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_default_config_if_missing(config_path: Path) -> None:
    if config_path.exists():
        return
    ensure_parent(config_path)
    config_path.write_text(
        json.dumps(DEFAULT_CONFIG, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    ensure_parent(path)
    path.write_text(json.dumps(data, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def load_config(config_path: Path) -> tuple[int, str, str, list[HelperConfig]]:
    raw = load_json(config_path, DEFAULT_CONFIG)
    interval_minutes = int(raw.get("interval_minutes") or DEFAULT_INTERVAL_MINUTES)
    model = str(raw.get("model") or "gpt-5.4-mini").strip()
    resume_session_id = str(raw.get("resume_session_id") or "").strip()
    helpers = [HelperConfig(**item) for item in raw.get("helpers", [])]
    if not helpers:
        raise ValueError(f"Keine Helfer in {config_path} konfiguriert.")
    return interval_minutes, model, resume_session_id, helpers


def get_question_count(db_path: Path) -> int:
    with sqlite3.connect(db_path) as conn:
        row = conn.execute("SELECT COUNT(*) FROM quiz_question").fetchone()
    return int(row[0] if row else 0)


def get_db_mtime(db_path: Path) -> float | None:
    if not db_path.exists():
        return None
    return db_path.stat().st_mtime


def build_statuses(helpers: list[HelperConfig], state: dict[str, Any]) -> list[HelperStatus]:
    previous_helpers = state.get("helpers", {})
    statuses: list[HelperStatus] = []

    for helper in helpers:
        db_path = Path(helper.db_path)
        question_count = get_question_count(db_path)
        db_mtime = get_db_mtime(db_path)
        previous = previous_helpers.get(helper.agent_id, {})
        previous_count = previous.get("question_count")
        previous_mtime = previous.get("db_mtime")

        changed = False
        if previous_count is None or previous_mtime is None:
            changed = True
        elif question_count != previous_count or db_mtime != previous_mtime:
            changed = True

        stalled_cycles = 0 if changed else int(previous.get("stalled_cycles", 0)) + 1
        statuses.append(
            HelperStatus(
                agent_id=helper.agent_id,
                label=helper.label,
                db_path=helper.db_path,
                target_questions=helper.target_questions,
                question_count=question_count,
                previous_question_count=previous_count,
                db_mtime=db_mtime,
                previous_db_mtime=previous_mtime,
                changed_since_last_cycle=changed,
                stalled_cycles=stalled_cycles,
                is_complete=question_count >= helper.target_questions,
            )
        )

    return statuses


def statuses_to_state(statuses: list[HelperStatus]) -> dict[str, Any]:
    return {
        "last_run_at": datetime.now().isoformat(timespec="seconds"),
        "helpers": {
            status.agent_id: {
                "label": status.label,
                "db_path": status.db_path,
                "question_count": status.question_count,
                "db_mtime": status.db_mtime,
                "stalled_cycles": status.stalled_cycles,
            }
            for status in statuses
        },
    }


def build_quizmaster_message(statuses: list[HelperStatus]) -> str:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    inactive = [
        status for status in statuses if not status.changed_since_last_cycle and not status.is_complete
    ]
    active = [status for status in statuses if status.changed_since_last_cycle and not status.is_complete]
    complete = [status for status in statuses if status.is_complete]

    lines = [
        "Statusupdate vom lokalen Helfer-Watchdog.",
        f"Zeitpunkt: {timestamp}",
        "",
        "Nicht aktiv seit dem letzten Zyklus:",
    ]

    if inactive:
        for status in inactive:
            lines.append(
                (
                    f"- {status.label} | session={status.agent_id} | "
                    f"fragen={status.question_count}/{status.target_questions} | "
                    f"stalled_cycles={status.stalled_cycles} | db={status.db_path}"
                )
            )
    else:
        lines.append("- niemand")

    lines.extend(["", "Aktiv mit sichtbarem Fortschritt:"])
    if active:
        for status in active:
            lines.append(
                (
                    f"- {status.label} | session={status.agent_id} | "
                    f"fragen={status.question_count}/{status.target_questions} | "
                    f"stalled_cycles={status.stalled_cycles}"
                )
            )
    else:
        lines.append("- niemand")

    lines.extend(["", "Bereits voll/fertig:"])
    if complete:
        for status in complete:
            lines.append(
                f"- {status.label} | session={status.agent_id} | fragen={status.question_count}/{status.target_questions}"
            )
    else:
        lines.append("- niemand")

    lines.extend(
        [
            "",
            "Bitte nur als Statusmeldung behandeln.",
        ]
    )
    return "\n".join(lines)


def append_log(log_path: Path, text: str) -> None:
    ensure_parent(log_path)
    timestamp = datetime.now().isoformat(timespec="seconds")
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {text.rstrip()}\n")


def run_codex(
    codex_path: Path,
    model: str,
    resume_session_id: str,
    prompt: str,
    output_log: Path,
) -> tuple[int, str, str]:
    if not resume_session_id:
        raise ValueError("Kein resume_session_id konfiguriert; der Watchdog kann den Thread nicht wecken.")

    with tempfile.NamedTemporaryFile(prefix="helper_watchdog_", suffix=".txt", delete=False) as tmp:
        output_file = Path(tmp.name)

    command = [
        str(codex_path),
        "exec",
        "resume",
        "--full-auto",
        "--skip-git-repo-check",
        "-m",
        model,
        "-o",
        str(output_file),
        resume_session_id,
        prompt,
    ]
    completed = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    last_message = output_file.read_text(encoding="utf-8") if output_file.exists() else ""
    output_file.unlink(missing_ok=True)

    append_log(
        output_log,
        "\n".join(
            part
            for part in [
                f"codex_exit={completed.returncode}",
                f"codex_stdout={completed.stdout.strip()}",
                f"codex_stderr={completed.stderr.strip()}",
                f"codex_last_message={last_message.strip()}",
            ]
            if part and not part.endswith("=")
        ),
    )
    return completed.returncode, completed.stdout, last_message


def run_cycle(
    *,
    config_path: Path,
    state_path: Path,
    log_path: Path,
    codex_path: Path,
    use_codex: bool,
) -> list[HelperStatus]:
    interval_minutes, model, resume_session_id, helpers = load_config(config_path)
    _ = interval_minutes
    state = load_json(state_path, {})
    statuses = build_statuses(helpers, state)
    prompt = build_quizmaster_message(statuses)

    append_log(log_path, "quizmaster_message=" + prompt.replace("\n", " | "))

    if use_codex:
        run_codex(codex_path, model, resume_session_id, prompt, log_path)
    else:
        append_log(log_path, "dry_run_only=yes")
        print(prompt)

    save_json(state_path, statuses_to_state(statuses))
    return statuses


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Weckt Codex CLI alle 10 Minuten fuer einen Helfer-Check."
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG_PATH)
    parser.add_argument("--state", type=Path, default=DEFAULT_STATE_PATH)
    parser.add_argument("--log", type=Path, default=DEFAULT_LOG_PATH)
    parser.add_argument("--codex", type=Path, default=DEFAULT_CODEX_PATH)
    parser.add_argument("--once", action="store_true", help="Nur einen Zyklus ausfuehren.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Kein Codex exec aufrufen, nur Prompt bauen und loggen.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    write_default_config_if_missing(args.config)
    interval_minutes, _, _, _ = load_config(args.config)
    sleep_seconds = max(60, interval_minutes * 60)

    try:
        while True:
            statuses = run_cycle(
                config_path=args.config,
                state_path=args.state,
                log_path=args.log,
                codex_path=args.codex,
                use_codex=not args.dry_run,
            )
            summary = ", ".join(
                f"{status.label}:{status.question_count}/{status.target_questions}"
                for status in statuses
            )
            print(f"[watchdog] {datetime.now().isoformat(timespec='seconds')} {summary}")
            sys.stdout.flush()

            if args.once:
                return 0

            time.sleep(sleep_seconds)
    except KeyboardInterrupt:
        print("\n[watchdog] beendet")
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
