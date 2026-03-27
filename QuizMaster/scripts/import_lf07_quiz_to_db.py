#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import configure_course


base = configure_course(
    course_code="LF07",
    scenario_dir_name="LF07-Scenarien",
    quiz_db_filename="LF07-Quiz.db",
    base_question_count=59,
    pre_stage_question_count=118,
    short_text_distractors=(
        (
            "Sie bleibt bei CPS zu allgemein und verbindet System, Prozess und Erweiterung nicht nachvollziehbar.",
            "Eine belastbare LF07-Antwort muss System, Prozess und Erweiterung nachvollziehbar zusammenfuehren.",
        ),
        (
            "Sie nennt einzelne Komponenten, ohne Kommunikation, Inbetriebnahme und Optimierung sauber zu verknuepfen.",
            "Bei LF07 muessen Kommunikation, Inbetriebnahme und Optimierung erkennbar miteinander verknuepft sein.",
        ),
        (
            "Sie konzentriert sich auf Einzelgeraete und blendet Datenfluss, Automatisierung und Betriebswirkung aus.",
            "LF07 fragt nach tragfaehigen CPS-Loesungen mit Datenfluss-, Automatisierungs- und Betriebsbezug und nicht nur nach Einzelgeraeten.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
