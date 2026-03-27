#!/usr/bin/env python3

import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
KURSE_DIR = ROOT / "Kurse"


def main() -> None:
    quiz_dirs = sorted(
        path for path in KURSE_DIR.iterdir() if path.is_dir() and path.name.endswith("-Quiz")
    )
    for quiz_dir in quiz_dirs:
        db_path = quiz_dir.with_suffix(".db")
        with sqlite3.connect(db_path):
            pass
        print(db_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
