#!/usr/bin/env python3

import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
KURSE_DIR = ROOT / "data" / "Kurse"
SCHEMA_PATH = ROOT / "QuizMaster" / "sql" / "quiz_db_schema_v1.sql"


def main() -> None:
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    db_paths = sorted(KURSE_DIR.glob("*-Quiz.db"))

    for db_path in db_paths:
        with sqlite3.connect(db_path) as conn:
            conn.executescript(schema_sql)
            conn.commit()
        print(db_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
