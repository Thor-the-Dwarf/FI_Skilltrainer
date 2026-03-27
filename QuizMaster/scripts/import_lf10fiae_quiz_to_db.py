#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import configure_course


base = configure_course(
    course_code="LF10FIAE",
    scenario_dir_name="LF10FIAE-Scenarien",
    quiz_db_filename="LF10FIAE-Quiz.db",
    base_question_count=59,
    pre_stage_question_count=117,
    short_text_distractors=(
        (
            "Sie bleibt bei Oberflaechen zu allgemein und verbindet Anforderung, Gestaltung und Umsetzung nicht klar.",
            "Eine belastbare LF10FIAE-Antwort muss Anforderung, Gestaltung und Umsetzung nachvollziehbar zusammenfuehren.",
        ),
        (
            "Sie sammelt Design-Stichworte, ohne Nutzerbezug, Testbarkeit und Wartbarkeit sauber zu verknuepfen.",
            "Bei LF10FIAE muessen Nutzerbezug, Testbarkeit und Wartbarkeit erkennbar miteinander verknuepft sein.",
        ),
        (
            "Sie konzentriert sich auf Optik und blendet Struktur, Bedienbarkeit und technische Umsetzbarkeit aus.",
            "LF10FIAE fragt nach tragfaehigen UI-Loesungen mit Struktur-, Bedienbarkeits- und Umsetzungsbezug und nicht nur nach Optik.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
