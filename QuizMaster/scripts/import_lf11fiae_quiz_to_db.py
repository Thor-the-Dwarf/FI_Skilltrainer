#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import configure_course


base = configure_course(
    course_code="LF11FIAE",
    scenario_dir_name="LF11FIAE-Scenarien",
    quiz_db_filename="LF11FIAE-Quiz.db",
    base_question_count=59,
    pre_stage_question_count=118,
    short_text_distractors=(
        (
            "Sie bleibt bei Funktionalitaet zu allgemein und verbindet Entwurf, Logik und Umsetzung nicht sauber.",
            "Eine belastbare LF11FIAE-Antwort muss Entwurf, Logik und Umsetzung nachvollziehbar zusammenfuehren.",
        ),
        (
            "Sie nennt einzelne Bausteine, ohne Datenstrukturen, Tests und Dokumentation erkennbar zu verknuepfen.",
            "Bei LF11FIAE muessen Datenstrukturen, Tests und Dokumentation sauber miteinander verknuepft sein.",
        ),
        (
            "Sie konzentriert sich auf Codefragmente und blendet Modularisierung, Algorithmen und Nachvollziehbarkeit aus.",
            "LF11FIAE fragt nach tragfaehigen Anwendungsloesungen mit Modularisierungs-, Algorithmus- und Nachvollziehbarkeitsbezug und nicht nur nach Einzelcode.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
