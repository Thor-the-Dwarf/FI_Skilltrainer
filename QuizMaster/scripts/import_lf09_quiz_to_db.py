#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import configure_course


base = configure_course(
    course_code="LF09",
    scenario_dir_name="LF09-Scenarien",
    quiz_db_filename="LF09-Quiz.db",
    base_question_count=59,
    pre_stage_question_count=118,
    short_text_distractors=(
        (
            "Sie bleibt bei Netzwerken zu allgemein und verbindet Anforderung, Planung und Betrieb nicht belastbar.",
            "Eine tragfaehige LF09-Antwort muss Anforderung, Planung und Betrieb nachvollziehbar zusammenfuehren.",
        ),
        (
            "Sie nennt Einzelschritte, ohne Dienste, Pruefung und Wirtschaftlichkeit sauber zu verknuepfen.",
            "Bei LF09 muessen Dienste, Pruefung und wirtschaftliche Bewertung erkennbar zusammenhaengen.",
        ),
        (
            "Sie konzentriert sich fast nur auf Einzelgeraete und blendet Netzstruktur, Bereitstellung und Sicherheit aus.",
            "LF09 fragt nach tragfaehigen Netzwerkloesungen mit Struktur-, Bereitstellungs- und Sicherheitsbezug und nicht nur nach Einzelgeraeten.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
