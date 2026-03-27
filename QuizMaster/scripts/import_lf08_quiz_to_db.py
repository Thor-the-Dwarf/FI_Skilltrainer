#!/usr/bin/env python3

from __future__ import annotations

from import_lf_course_wrapper import build_extra_stage_config, configure_course


base = configure_course(
    course_code="LF08",
    scenario_dir_name="LF08-Scenarien",
    quiz_db_filename="LF08-Quiz.db",
    base_question_count=12,
    pre_stage_question_count=24,
    max_stage_count=10,
    extra_stage_variant_configs=(build_extra_stage_config(10),),
    short_text_distractors=(
        (
            "Sie bleibt bei Datenintegration zu allgemein und verbindet Quelle, Ziel und Qualitaet nicht sauber.",
            "Eine belastbare LF08-Antwort muss Quelle, Ziel und Datenqualitaet nachvollziehbar zusammenfuehren.",
        ),
        (
            "Sie sammelt lose Stichworte, ohne Modellierung, Bereitstellung und Pruefung erkennbar zu verknuepfen.",
            "Bei LF08 muessen Modellierung, Bereitstellung und Pruefung sauber miteinander verknuepft sein.",
        ),
        (
            "Sie konzentriert sich auf Einzeltools und blendet Schnittstellen, Datenkonsistenz und Abnahme aus.",
            "LF08 fragt nach tragfaehigen Integrationsloesungen mit Schnittstellen-, Konsistenz- und Abnahmebezug und nicht nur nach Werkzeugnamen.",
        ),
    ),
)


if __name__ == "__main__":
    base.main()
