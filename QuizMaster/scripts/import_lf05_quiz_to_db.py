#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import configure_course


base = configure_course(
    course_code="LF05",
    scenario_dir_name="LF05-Scenarien",
    quiz_db_filename="LF05-Quiz.db",
    base_question_count=60,
    pre_stage_question_count=120,
    short_text_distractors=(
        (
            "Sie bleibt bei Datenarbeit zu allgemein und verbindet Anforderung, Modell und Umsetzung nicht sauber.",
            "Eine tragfaehige LF05-Antwort muss Anforderung, Datenmodell und Umsetzung nachvollziehbar zusammenfuehren.",
        ),
        (
            "Sie nennt lose Stichworte, ohne Datenqualitaet, Verarbeitung und Zweck erkennbar zu verknuepfen.",
            "Bei LF05 muessen Datenqualitaet, Verarbeitung und betrieblicher Zweck erkennbar verbunden sein.",
        ),
        (
            "Sie konzentriert sich fast nur auf Einzelwerkzeuge und blendet Test, Dokumentation und Nutzwert aus.",
            "LF05 fragt nach belastbaren Datenloesungen mit Test-, Dokumentations- und Nutzwertbezug und nicht nur nach Werkzeugnamen.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
