#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import configure_course


base = configure_course(
    course_code="LF06",
    scenario_dir_name="LF06-Scenarien",
    quiz_db_filename="LF06-Quiz.db",
    base_question_count=60,
    pre_stage_question_count=120,
    short_text_distractors=(
        (
            "Sie bleibt bei Servicearbeit zu allgemein und verbindet Anfrage, Analyse und Reaktion nicht klar.",
            "Eine belastbare LF06-Antwort muss Anfrage, Analyse und passende Reaktion nachvollziehbar verbinden.",
        ),
        (
            "Sie sammelt Einzelbeobachtungen, ohne Prioritaet, Kommunikation und Loesungsweg sauber zusammenzufuehren.",
            "Bei LF06 muessen Prioritaet, Kommunikation und Loesungsweg sauber zusammengefuehrt werden.",
        ),
        (
            "Sie konzentriert sich fast nur auf Technik und blendet Kundenwirkung, Prozess und Praevention aus.",
            "LF06 fragt nach tragfaehigem Servicehandeln mit Kunden-, Prozess- und Praeventionsbezug und nicht nur nach Technikdetails.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
