#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SESSION_ID = "019d2ae2-8525-7792-a341-161adc031e73"
DEFAULT_MODEL = "gpt-5.4-mini"
DEFAULT_CODEX_PATH = Path(
    shutil.which("codex") or "/Applications/Codex.app/Contents/Resources/codex"
)
DEFAULT_QUEUE_PATH = ROOT / "QuizMaster" / "output" / "quizmaster_handoffs.ndjson"
DEFAULT_HANDOFF_DIR = ROOT / "QuizMaster" / "output" / "handoffs"


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value.strip())
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned.strip("-") or "handoff"


def build_message(args: argparse.Namespace) -> str:
    lines = [
        f"{args.label} ist fertig.",
        f"DB: {args.db_path}",
        f"Stand: {args.total_questions}/{args.target_questions} Fragen.",
    ]
    if args.delta:
        lines.append(f"Paket: {args.delta}.")
    if args.importer_path:
        lines.append(f"Importer: {args.importer_path}.")
    if args.validation:
        lines.append("Checks: " + "; ".join(args.validation))
    if args.note:
        lines.append(f"Hinweis: {args.note}")
    if args.request:
        lines.append(args.request)
    return "\n".join(lines)


def attempt_delivery(
    *,
    codex_path: Path,
    model: str,
    session_id: str,
    message: str,
) -> dict[str, Any]:
    with tempfile.NamedTemporaryFile(prefix="quizmaster_handoff_", suffix=".txt", delete=False) as tmp:
        output_path = Path(tmp.name)

    command = [
        str(codex_path),
        "exec",
        "resume",
        "--full-auto",
        "--skip-git-repo-check",
        "-m",
        model,
        "-o",
        str(output_path),
        session_id,
        message,
    ]
    completed = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    last_message = output_path.read_text(encoding="utf-8") if output_path.exists() else ""
    output_path.unlink(missing_ok=True)

    return {
        "attempted": True,
        "delivered": completed.returncode == 0,
        "exit_code": completed.returncode,
        "stdout": completed.stdout.strip(),
        "stderr": completed.stderr.strip(),
        "last_message": last_message.strip(),
    }


def append_queue_record(queue_path: Path, record: dict[str, Any]) -> None:
    ensure_parent(queue_path)
    with queue_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_handoff_markdown(path: Path, record: dict[str, Any]) -> None:
    ensure_parent(path)
    delivery = record["delivery"]
    lines = [
        "# QuizMaster Handoff",
        "",
        f"- Timestamp: {record['timestamp']}",
        f"- Label: {record['label']}",
        f"- Session: {record['session_id']}",
        f"- DB: {record['db_path']}",
        f"- Stand: {record['total_questions']}/{record['target_questions']}",
        f"- Paket: {record['delta'] or 'n/a'}",
        f"- Importer: {record['importer_path'] or 'n/a'}",
        f"- Delivery: {'delivered' if delivery['delivered'] else 'queued'}",
        "",
        "## Checks",
    ]
    if record["validation"]:
        for item in record["validation"]:
            lines.append(f"- {item}")
    else:
        lines.append("- none")

    lines.extend(
        [
            "",
            "## Message",
            "",
            record["message"],
            "",
            "## Delivery Details",
            "",
            f"- Attempted: {delivery['attempted']}",
            f"- Exit code: {delivery['exit_code']}",
            f"- Stdout: {delivery['stdout'] or 'n/a'}",
            f"- Stderr: {delivery['stderr'] or 'n/a'}",
            f"- Last message: {delivery['last_message'] or 'n/a'}",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Notify QuizMaster, then fall back to a local handoff record if delivery fails."
    )
    parser.add_argument("--label", required=True)
    parser.add_argument("--db-path", required=True)
    parser.add_argument("--total-questions", type=int, required=True)
    parser.add_argument("--target-questions", type=int, default=1000)
    parser.add_argument("--delta", default="")
    parser.add_argument("--importer-path", default="")
    parser.add_argument("--validation", action="append", default=[])
    parser.add_argument("--note", default="")
    parser.add_argument("--request", default="Bitte Folgeauftrag oder Reassignment geben.")
    parser.add_argument("--session-id", default=DEFAULT_SESSION_ID)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--codex-path", type=Path, default=DEFAULT_CODEX_PATH)
    parser.add_argument("--queue-path", type=Path, default=DEFAULT_QUEUE_PATH)
    parser.add_argument("--handoff-dir", type=Path, default=DEFAULT_HANDOFF_DIR)
    parser.add_argument("--skip-delivery", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    timestamp = datetime.now().isoformat(timespec="seconds")
    message = build_message(args)

    delivery: dict[str, Any]
    if args.skip_delivery:
        delivery = {
            "attempted": False,
            "delivered": False,
            "exit_code": None,
            "stdout": "",
            "stderr": "delivery skipped",
            "last_message": "",
        }
    else:
        delivery = attempt_delivery(
            codex_path=args.codex_path,
            model=args.model,
            session_id=args.session_id,
            message=message,
        )

    record = {
        "timestamp": timestamp,
        "label": args.label,
        "session_id": args.session_id,
        "db_path": args.db_path,
        "total_questions": args.total_questions,
        "target_questions": args.target_questions,
        "delta": args.delta,
        "importer_path": args.importer_path,
        "validation": args.validation,
        "note": args.note,
        "request": args.request,
        "message": message,
        "delivery": delivery,
    }

    append_queue_record(args.queue_path, record)

    handoff_name = f"{timestamp.replace(':', '').replace('-', '')}_{slugify(args.label)}.md"
    handoff_path = args.handoff_dir / handoff_name
    write_handoff_markdown(handoff_path, record)

    print(f"queue_record={args.queue_path}")
    print(f"handoff_file={handoff_path}")
    print(f"delivery_delivered={int(delivery['delivered'])}")
    if delivery["stderr"]:
        print(f"delivery_stderr={delivery['stderr']}")

    return 0 if delivery["delivered"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
