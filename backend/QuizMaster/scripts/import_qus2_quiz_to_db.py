#!/usr/bin/env python3

from __future__ import annotations

import argparse
from collections import Counter
import json
import re
import sqlite3
from pathlib import Path
from typing import Any

from import_pv3wiso_quiz_to_db import (
    build_pool_description,
    normalize_visible_text as base_normalize_visible_text,
    render_context_card,
    stable_id,
    strip_ticket_prefix,
    validate_visible_texts,
)


ROOT = Path(__file__).resolve().parents[2]
SCENARIO_ROOT = ROOT / "data" / "Kurse" / "QuS2-Scenarien"
SCENARIO_MANIFEST_PATH = SCENARIO_ROOT / "scenario-manifest.json"
POSSIBLE_SKILLS_PATH = SCENARIO_ROOT / "possible_skills.json"
QUIZ_DB_PATH = ROOT / "data" / "Kurse" / "QuS2-Quiz.db"
SCHEMA_PATH = ROOT / "QuizMaster" / "sql" / "quiz_db_schema_v1.sql"
DERIVED_QUESTION_BUDGET_PER_SCENARIO = 10
ADDITIONAL_VARIANT_BATCH_SIZE = 100
DEFAULT_QUESTION_LIMIT = 1000

QUESTION_META_BY_TYPE = {
    "single_choice": {
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
    },
    "multi_select": {
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
    },
    "ordering": {
        "interaction_type": "sequence",
        "question_kind": "reihenfolge_bestimmen",
    },
    "number": {
        "interaction_type": "gap_fill_text",
        "question_kind": "luecke_fuellen",
    },
}

BADGE_LABEL_BY_QUESTION_KIND = {
    "eine_richtige_antwort_waehlen": "Welche Antwort trifft am besten zu?",
    "mehrere_richtige_antworten_waehlen": "Welche Aussagen sind korrekt?",
    "reihenfolge_bestimmen": "Was kommt zuerst / danach / zuletzt?",
    "luecke_fuellen": "Welche Eingabe ergänzt die Angabe sinnvoll?",
}

MATCH_PAIR_BADGE_VARIANTS = (
    "Welche Zuordnung passt am besten?",
    "Welche Verbindung ist fachlich richtig?",
    "Welche Einordnung trifft hier am besten zu?",
)

TABLE_BADGE_VARIANTS_BY_KIND = {
    "evidence": (
        "Welcher Nachweis passt am besten?",
        "Welche Dokumentation trägt hier am besten?",
        "Welcher Beleg ist hier am stärksten?",
    ),
    "role": (
        "Welche Zuständigkeit passt am besten?",
        "Welche Rolle ist hier zuerst dran?",
        "Wer trägt hier zuerst Verantwortung?",
    ),
    "contact": (
        "Welcher Kontaktweg passt hier?",
        "Wie wird hier passend erreicht?",
        "Welcher Weg ist hier am tragfähigsten?",
    ),
    "goal": (
        "Welches Ziel ergänzt den Punkt?",
        "Welche Zielsetzung passt am besten?",
        "Welches Qualitätsziel trifft hier zu?",
    ),
    "measure": (
        "Welche Maßnahme passt hier?",
        "Welcher erste Schritt ist passend?",
        "Welche Reaktion ergänzt den Punkt?",
    ),
    "source": (
        "Welche Quelle ist hier richtig?",
        "Welche Wiederherstellungsquelle passt?",
        "Welche Grundlage trägt hier am besten?",
    ),
    "requirement": (
        "Welche Vorgabe gilt hier?",
        "Welche Anforderung passt am besten?",
        "Welche Regel ergänzt den Punkt?",
    ),
    "standard": (
        "Welche Standardlinie passt hier?",
        "Wie wird der Regelfall sauber behandelt?",
        "Welche Standardbehandlung ist richtig?",
    ),
    "exception": (
        "Welche Ausnahme ist hier relevant?",
        "Welche Ausnahmeregel passt am besten?",
        "Welcher Sonderfall muss hier mitgedacht werden?",
    ),
    "focus": (
        "Welcher Prüffokus passt hier?",
        "Worauf richtet sich die Prüfung zuerst?",
        "Welcher Schwerpunkt ist hier entscheidend?",
    ),
    "generic": (
        "Welche Ergänzung passt hier am besten?",
        "Welche Auswahl ergänzt den Punkt sinnvoll?",
        "Welche Option trifft hier fachlich zu?",
    ),
}

NUMBER_PROMPT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_dienstleisterwechsel_rueckgabe_loeschbestaetigung/ticket08_V01_ausbildungsbetrieb_dienstleisterwechsel_rueckgabe_loeschbestaetigung.json#q05": "34 Projektordner insgesamt: 10 intern übernehmen, 5 befristet halten, 7 schon zurückgegeben. Wie viele können direkt in die Lösch- oder Abschlussbestätigung gehen?",
    "ticket_ausbildungsbetrieb_geraetverlust_mdm_sperre_restdaten/ticket09_V01_ausbildungsbetrieb_geraetverlust_mdm_sperre_restdaten.json#q05": "9 mobile Verbindungen insgesamt: 3 bereits serverseitig wirkungslos, 2 vor der Verlustmeldung regulär beendet. Wie viele Verbindungen müssen jetzt noch aktiv gesperrt oder widerrufen werden?",
    "ticket_ausbildungsbetrieb_alarmierung_rufbereitschaft_eskalation/ticket10_V01_ausbildungsbetrieb_alarmierung_rufbereitschaft_eskalation.json#q05": "14 Kontaktpunkte insgesamt: 8 verifiziert, 3 heute aktualisiert, 1 externer Kontakt gültig bestätigt. Wie viele Kontaktpunkte bleiben vor der Freigabe noch offen?",
    "ticket_ausbildungsbetrieb_berechtigungsreview_rollen_altkonten/ticket06_V01_ausbildungsbetrieb_berechtigungsreview_rollen_altkonten.json#q05": "41 aktive Konten insgesamt: 28 bleiben unverändert, 4 befristet mit Enddatum, 3 noch fachlich offen. Wie viele Konten können im Review direkt entzogen oder herabgestuft werden?",
}

NUMBER_ALT_PROMPT_OVERRIDES = {
    "ticket_ausbildungsbetrieb_fernwartung_freigabe_protokollierung/ticket03_V01_ausbildungsbetrieb_fernwartung_freigabe_protokollierung.json#q05": "21:30 bis 23:00 Gesamtfenster, davon 15 Minuten Vorprüfung und 20 Minuten Abschlusskontrolle. Wie viele Minuten bleiben netto für die eigentliche Wartung?",
    "ticket_ausbildungsbetrieb_aufbewahrung_bereinigung_nachweise/ticket04_V01_ausbildungsbetrieb_aufbewahrung_bereinigung_nachweise.json#q05": "48 Dateien im Upload-Cache: 17 gehören noch zu offenen Vorgängen, 9 müssen für dokumentierte Rückfragen vorerst bleiben. Wie viele Dateien können in der Standardbereinigung entfernt werden?",
    "ticket_ausbildungsbetrieb_restoretest_wiederanlauf_nachweise/ticket05_V01_ausbildungsbetrieb_restoretest_wiederanlauf_nachweise.json#q05": "180 Minuten Testfenster insgesamt: 45 für die Termindatenbank, 35 für den Upload-Speicher, 20 für die Rechtekonfiguration und 30 für fachliche Stichproben. Wie viele Minuten Reserve bleiben?",
    "ticket_ausbildungsbetrieb_berechtigungsreview_rollen_altkonten/ticket06_V01_ausbildungsbetrieb_berechtigungsreview_rollen_altkonten.json#q05": "41 aktive Konten insgesamt: 28 bleiben unverändert, 4 befristet mit Enddatum, 3 noch fachlich offen. Wie viele Konten können direkt entzogen oder herabgestuft werden?",
    "ticket_ausbildungsbetrieb_dienstleisterwechsel_rueckgabe_loeschbestaetigung/ticket08_V01_ausbildungsbetrieb_dienstleisterwechsel_rueckgabe_loeschbestaetigung.json#q05": "Von 34 Projektordnern sind 10 intern zu übernehmen, 5 vorerst als Ausnahme markiert und 7 schon sauber zurückgegeben. Für wie viele Ordner kann direkt die Lösch- oder Abschlussbestätigung vorbereitet werden?",
    "ticket_ausbildungsbetrieb_geraetverlust_mdm_sperre_restdaten/ticket09_V01_ausbildungsbetrieb_geraetverlust_mdm_sperre_restdaten.json#q05": "9 mobile Verbindungen insgesamt, davon 3 schon serverseitig wirkungslos und 2 vor der Verlustmeldung regulär beendet. Wie viele Verbindungen bleiben für aktive Sperre oder Widerruf übrig?",
    "ticket_ausbildungsbetrieb_alarmierung_rufbereitschaft_eskalation/ticket10_V01_ausbildungsbetrieb_alarmierung_rufbereitschaft_eskalation.json#q05": "Die Alarmierungsliste hat 14 Kontaktpunkte. 8 sind verifiziert, 3 heute aktualisiert und 1 externer Kontakt bereits gültig bestätigt. Wie viele Kontaktpunkte sind vor der Freigabe noch offen?",
}

ALT_BADGE_VARIANTS_BY_INTERACTION = {
    "single": (
        "Welche Auswahl trägt den Fall am besten?",
        "Welche Antwort ist hier am tragfähigsten?",
        "Welche Entscheidung passt fachlich?",
    ),
    "multi": (
        "Welche Punkte treffen zu?",
        "Welche Aussagen sind belastbar?",
        "Was gehört fachlich dazu?",
    ),
    "sequence": (
        "Wie ist die richtige Reihenfolge?",
        "Was folgt in sinnvoller Abfolge?",
        "Wie greifen die Schritte nacheinander?",
    ),
    "gap_fill_text": (
        "Welche Zahl ergibt sich hier?",
        "Welcher Wert fehlt hier?",
        "Welche Berechnung passt?",
    ),
}

SEQUENCE_ITEM_OVERRIDES = {
    "ticket_ausbildungsbetrieb_exportfehler_meldeweg_schutzmassnahmen/ticket02_V01_ausbildungsbetrieb_exportfehler_meldeweg_schutzmassnahmen.json#q07": [
        "Freigabelink deaktivieren und weiteren Zugriff stoppen.",
        "Datenumfang und betroffene Inhalte eingrenzen.",
        "Empfängerkreis sowie Logstand sichern.",
        "Rollen für Bewertung, Kommunikation und Dokumentation festziehen.",
        "Risiko für Betroffene und Betrieb einschätzen.",
        "Maßnahmen, Rückmeldungen und offene Punkte im Vorfallsbericht festhalten.",
    ],
    "ticket_ausbildungsbetrieb_fernwartung_freigabe_protokollierung/ticket03_V01_ausbildungsbetrieb_fernwartung_freigabe_protokollierung.json#q07": [
        "Freigaben, Konto, Zeitfenster und Rückfallweg final bestätigen.",
        "Temporären Zugang aktivieren, Protokollierung prüfen und die freigegebene Wartung am Gateway durchführen.",
        "Funktionstest, Abschlusskontrolle und Deaktivierung des Zugangs durchführen.",
        "Änderungsstand, Logs und Restpunkte dokumentieren.",
    ],
    "ticket_ausbildungsbetrieb_aufbewahrung_bereinigung_nachweise/ticket04_V01_ausbildungsbetrieb_aufbewahrung_bereinigung_nachweise.json#q07": [
        "Datenquellen, Kategorien und offene Ausnahmen vollständig aufnehmen.",
        "Standardbehandlung je Datenart festlegen.",
        "Bereinigung technisch durchführen und protokollieren.",
        "Ergebnis, Ausnahmen und Wiedervorlage kommunizieren.",
    ],
    "ticket_ausbildungsbetrieb_restoretest_wiederanlauf_nachweise/ticket05_V01_ausbildungsbetrieb_restoretest_wiederanlauf_nachweise.json#q07": [
        "Testumgebung bereitstellen.",
        "Sicherungsstand und Umfang final festziehen.",
        "Komponenten und Abhängigkeiten für die Wiederherstellung ordnen.",
        "Restore technisch durchführen und Logstand sichern.",
        "Fachliche Stichprobe für Termine, Dokumente und Rechte prüfen.",
        "Abschlussbefund, Restpunkte und Wiedervorlage dokumentieren.",
    ],
    "ticket_ausbildungsbetrieb_berechtigungsreview_rollen_altkonten/ticket06_V01_ausbildungsbetrieb_berechtigungsreview_rollen_altkonten.json#q07": [
        "Betroffene Systeme, Kontotypen und Referenzlisten für den Review zusammenziehen.",
        "Auffällige Konten, Rollenwechsel, Partnerzugriffe und Ausnahmen fachlich prüfen.",
        "Je Konto Entscheidung treffen, technisch umsetzen und Nachweisablage kontrollieren.",
        "Abschluss mit Restpunkten und Wiedervorlage für Audit und Teamleitung freigeben.",
    ],
    "ticket_ausbildungsbetrieb_dienstleisterwechsel_rueckgabe_loeschbestaetigung/ticket08_V01_ausbildungsbetrieb_dienstleisterwechsel_rueckgabe_loeschbestaetigung.json#q07": [
        "Betroffene Daten, Ordner, Postfächer und technischen Zugänge vollständig zusammenziehen.",
        "Rückgabe, Übernahme und offene fachliche Ausnahmen pro Bereich klären.",
        "Konten und Tokens technisch entziehen.",
        "Sonstige Restzugriffe begrenzen oder entfernen.",
        "Rückgabe-, Entzugs- und Löschvorgänge je Bereich nachweisen.",
        "Abschluss mit Ausnahmen und Restpunkten für Monatsende freigeben.",
    ],
    "ticket_ausbildungsbetrieb_geraetverlust_mdm_sperre_restdaten/ticket09_V01_ausbildungsbetrieb_geraetverlust_mdm_sperre_restdaten.json#q07": [
        "Verlustmeldung, letzte Sichtung und betroffene Funktionen sauber festhalten.",
        "Gerät über MDM sperren sowie begleitende Sitzungen oder Tokens eingrenzen.",
        "Mögliche Restdaten, Cache-Nutzung und Meldeweg bewerten.",
        "Abschlussbild mit MDM-Stand, Restpunkt und Wiedervorlage dokumentieren.",
    ],
}

VISIBLE_PHRASE_REPLACEMENTS = (
    ("Change- oder Patchticket", "Change- oder Patcheintrag"),
    ("Freigabedokument oder Ticket mit", "Freigabedokument oder Vorgang mit"),
    ("Logo und Kontaktdaten des Partners im Ticket.", "Logo und Kontaktdaten des Partners im Vorgang."),
    ("Nur mit Ticketreferenz befristet behalten; ohne Bezug nach Abschluss entfernen.", "Nur mit Vorgangsreferenz befristet behalten; ohne Bezug nach Abschluss entfernen."),
    ("Ist der Screenshot noch Teil eines offenen Tickets oder eines dokumentierten Befunds?", "Ist der Screenshot noch Teil eines offenen Vorgangs oder eines dokumentierten Befunds?"),
    ("Mailbox-, Ticket- und Screenshot-Bezuege zusammenziehen", "Mailbox-, Vorgangs- und Screenshot-Bezüge zusammenziehen"),
    ("aus Ticket und Mailbox zusammenfuehrt", "aus Vorgang und Mailbox zusammenführt"),
    ("Das Ticket wurde intern als wichtig markiert.", "Der Vorgang wurde intern als wichtig markiert."),
    ("Ticketprotokoll", "Vorgangsprotokoll"),
    ("Ticketlaufzeiten", "Vorgangslaufzeiten"),
    ("Ticketlaufzeit", "Vorgangslaufzeit"),
    ("Ticketbearbeitung", "Vorgangsbearbeitung"),
    ("Ticketstatus", "Vorgangsstatus"),
    ("Ticketreferenz", "Vorgangsreferenz"),
    ("Tickets bleiben lange offen", "Vorgänge bleiben lange offen"),
    ("Tickets bleiben", "Vorgänge bleiben"),
    ("Ticketstau", "Vorgangsstau"),
)

VISIBLE_FRAGMENT_REPLACEMENTS = (
    ("Empfaeng", "Empfäng"),
    ("empfaeng", "empfäng"),
    ("Stoer", "Stör"),
    ("stoer", "stör"),
    ("Schwaech", "Schwäch"),
    ("schwaech", "schwäch"),
    ("Temporaer", "Temporär"),
    ("temporaer", "temporär"),
    ("Lueck", "Lück"),
    ("lueck", "lück"),
    ("Klaer", "Klär"),
    ("klaer", "klär"),
    ("Aelt", "Ält"),
    ("aelt", "ält"),
    ("Praesent", "Präsent"),
    ("praesent", "präsent"),
    ("Bruech", "Brüch"),
    ("bruech", "brüch"),
    ("Widerspruech", "Widersprüch"),
    ("widerspruech", "widersprüch"),
    ("Gefuehl", "Gefühl"),
    ("gefuehl", "gefühl"),
    ("Vorlaeu", "Vorläu"),
    ("vorlaeu", "vorläu"),
    ("Tatsaech", "Tatsäch"),
    ("tatsaech", "tatsäch"),
    ("Kuemm", "Kümm"),
    ("kuemm", "kümm"),
    ("Maess", "Mäß"),
    ("maess", "mäß"),
    ("Loesung", "Lösung"),
    ("loesung", "lösung"),
    ("Laeng", "Läng"),
    ("laeng", "läng"),
    ("Postfaech", "Postfäch"),
    ("postfaech", "postfäch"),
    ("Naecht", "Nächt"),
    ("naecht", "nächt"),
    ("Naechlich", "Nächtlich"),
    ("naechlich", "nächtlich"),
    ("Entzueg", "Entzüg"),
    ("entzueg", "entzüg"),
    ("Oberflaech", "Oberfläch"),
    ("oberflaech", "oberfläch"),
    ("Vorgaeng", "Vorgäng"),
    ("vorgaeng", "vorgäng"),
    ("Aufklaer", "Aufklär"),
    ("aufklaer", "aufklär"),
    ("Abwaeg", "Abwäg"),
    ("abwaeg", "abwäg"),
    ("Uebrig", "Übrig"),
    ("uebrig", "übrig"),
    ("Ergaenz", "Ergänz"),
    ("ergaenz", "ergänz"),
    ("Uebergaeng", "Übergäng"),
    ("uebergaeng", "übergäng"),
    ("übergaeng", "übergäng"),
    ("Gaeng", "Gäng"),
    ("gaeng", "gäng"),
    ("Untergraeb", "Untergräb"),
    ("untergraeb", "untergräb"),
    ("Kalendereintraeg", "Kalendereinträg"),
    ("kalendereintraeg", "kalendereinträg"),
    ("Aufgeraeumt", "Aufgeräumt"),
    ("aufgeraeumt", "aufgeräumt"),
    ("Gross", "Groß"),
    ("gross", "groß"),
    ("Angestoss", "Angestoß"),
    ("angestoss", "angestoß"),
    ("Benoannt", "Benannt"),
    ("benoannt", "benannt"),
)


def normalize_visible_text(value: Any) -> str:
    text = base_normalize_visible_text(value)
    for source, target in VISIBLE_PHRASE_REPLACEMENTS:
        text = text.replace(source, target)
    for source, target in VISIBLE_FRAGMENT_REPLACEMENTS:
        text = text.replace(source, target)
    return text


def normalize_context_text(value: Any) -> str:
    text = normalize_visible_text(value)
    return re.sub(r"^Kontext zum [^:]+:\s*", "", text)


def normalize_pool_slug(folder_name: str) -> str:
    slug = folder_name.removeprefix("ticket_").strip("_")
    return slug.replace("_", "-")


def badge_label_for_question_kind(question_kind: str) -> str:
    return BADGE_LABEL_BY_QUESTION_KIND.get(str(question_kind or "").strip(), "")


def choose_text_variant(key: str, variants: list[str]) -> str:
    if not variants:
        return ""
    choice_index = int(stable_id("text_variant", key), 16) % len(variants)
    return variants[choice_index]


def lowercase_first(text: str) -> str:
    text = normalize_visible_text(text).strip()
    if not text:
        return ""
    return text[:1].lower() + text[1:]


def shorten_visible_title(text: str, limit: int = 108) -> str:
    normalized = normalize_visible_text(text)
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 3].rstrip(" ,:;/") + "..."


def normalize_answer(value: Any) -> str:
    return normalize_visible_text(value).casefold()


def base_source_ref(source_ref: str) -> str:
    return re.sub(r"::alt\d+$", "", normalize_visible_text(source_ref))


def variant_refinement_phrase(source_ref: str) -> str:
    match = re.search(r"::(alt\d+)$", normalize_visible_text(source_ref))
    if not match:
        return "im beschriebenen Fall"

    return {
        "alt1": "im ersten Zugriff",
        "alt2": "in der nächsten Abwägung",
        "alt3": "in der Vertiefung",
        "alt4": "im Folgecheck",
        "alt5": "in der erneuten Prüfung",
        "alt6": "im Abgleich",
        "alt7": "in der Schlussbetrachtung",
        "alt8": "bei der letzten Abwägung",
    }.get(match.group(1), "im beschriebenen Fall")


def build_alternate_badge(question: dict[str, Any], variant_suffix: str = "alt1") -> str:
    interaction_type = str(question.get("interaction_type", "")).strip()
    variants = ALT_BADGE_VARIANTS_BY_INTERACTION.get(interaction_type, ())
    base_ref = base_source_ref(str(question.get("source_ref", "")).strip())
    return choose_text_variant(f"{base_ref}::{variant_suffix}::alt_badge", list(variants)) or question.get("badge_label", "")


def build_alternate_prompt(question: dict[str, Any], variant_suffix: str = "alt1") -> str:
    source_ref = base_source_ref(str(question.get("source_ref", "")).strip())
    variant_round = int(variant_suffix.removeprefix("alt") or "1")
    title = normalize_visible_text(question.get("title", "diesem Punkt"))
    interaction_type = str(question.get("interaction_type", "")).strip()

    if interaction_type == "gap_fill_text":
        if variant_round == 1:
            return NUMBER_ALT_PROMPT_OVERRIDES.get(
                source_ref,
                f"Berechnen Sie den fehlenden Wert zu „{title}“.",
            )
        if variant_round == 2:
            return f"Welche Zahl ergibt sich bei „{title}“?"
        if variant_round == 3:
            return f"Welcher Zahlenwert ist für „{title}“ rechnerisch richtig?"
        if variant_round == 4:
            return f"Bestimmen Sie den passenden Rechenwert zu „{title}“."
        if variant_round == 5:
            return f"Wie hoch fällt der richtige Zahlenwert bei „{title}“ aus?"
        if variant_round == 6:
            return f"Welche Zahl muss bei „{title}“ fachlich richtig eingesetzt werden?"
        if variant_round == 7:
            return f"Leiten Sie für „{title}“ den zutreffenden Zahlenwert her."
        if variant_round == 8:
            return f"Welche rechnerische Lösung passt zu „{title}“?"
        return choose_text_variant(
            f"{source_ref}::{variant_suffix}::alt_prompt",
            [
                f"Bestimmen Sie für „{title}“ den belastbaren Zahlenwert.",
                f"Welche Zahl vervollständigt „{title}“ rechnerisch richtig?",
                f"Welcher Rechenwert gehört bei „{title}“ an die fehlende Stelle?",
            ],
        )

    if interaction_type == "sequence":
        if variant_round == 1:
            return f"Ordnen Sie die Schritte zu „{title}“ in die passende Reihenfolge."
        if variant_round == 2:
            return f"Bringen Sie „{title}“ in die sachgerechte Reihenfolge."
        if variant_round == 3:
            return f"Wie läuft „{title}“ in einer fachlich stimmigen Abfolge ab?"
        if variant_round == 4:
            return f"Welche Abfolge passt für „{title}“ am besten?"
        if variant_round == 5:
            return f"Wie ordnet sich „{title}“ Schritt für Schritt fachlich richtig ein?"
        if variant_round == 6:
            return f"Welche Reihenfolge trägt „{title}“ sachlich am besten?"
        if variant_round == 7:
            return f"In welcher Reihenfolge sollte „{title}“ sauber abgearbeitet werden?"
        if variant_round == 8:
            return f"Wie greifen die Schritte bei „{title}“ sinnvoll ineinander?"
        return choose_text_variant(
            f"{source_ref}::{variant_suffix}::alt_prompt",
            [
                f"Welche Reihenfolge bildet „{title}“ fachlich am verlässlichsten ab?",
                f"Ordnen Sie „{title}“ in die belastbarste Schrittfolge.",
                f"Wie sieht für „{title}“ die sachlich richtige Schrittkette aus?",
            ],
        )

    if interaction_type == "multi":
        if variant_round == 1:
            return f"Welche Aussagen treffen bei „{title}“ zu?"
        if variant_round == 2:
            return f"Welche Aussagen sind bei „{title}“ belastbar?"
        if variant_round == 3:
            return f"Prüfen Sie den Punkt „{title}“ und markieren Sie die zutreffenden Aussagen."
        if variant_round == 4:
            return f"Markieren Sie bei „{title}“ die fachlich zutreffenden Punkte."
        if variant_round == 5:
            return f"Welche Punkte gehören bei „{title}“ fachlich dazu?"
        if variant_round == 6:
            return f"Welche Aspekte gehören bei „{title}“ sachlich dazu?"
        if variant_round == 7:
            return f"Welche Aussagen lassen sich bei „{title}“ fachlich halten?"
        if variant_round == 8:
            return f"Welche Punkte sind für „{title}“ sachlich richtig?"
        return choose_text_variant(
            f"{source_ref}::{variant_suffix}::alt_prompt",
            [
                f"Welche Aussagen passen bei „{title}“ fachlich sauber zusammen?",
                f"Welche Punkte treffen bei „{title}“ belastbar zu?",
                f"Welche Aussagen gehören bei „{title}“ sachlich in die richtige Auswahl?",
            ],
        )

    if interaction_type == "single":
        if variant_round == 1:
            return f"Welche Auswahl passt zu „{title}“ fachlich am besten?"
        if variant_round == 2:
            return f"Welche Antwort trägt „{title}“ fachlich am besten?"
        if variant_round == 3:
            return f"Bestimmen Sie für „{title}“ die tragfähigste Antwort."
        if variant_round == 4:
            return f"Welche Auswahl ist für „{title}“ am tragfähigsten?"
        if variant_round == 5:
            return f"Welche Entscheidung trägt „{title}“ hier am besten?"
        if variant_round == 6:
            return f"Welche Entscheidung passt bei „{title}“ hier am besten?"
        if variant_round == 7:
            return f"Welche Antwort ist für „{title}“ sachlich am belastbarsten?"
        if variant_round == 8:
            return f"Welche Option erklärt „{title}“ hier am verlässlichsten?"
        return choose_text_variant(
            f"{source_ref}::{variant_suffix}::alt_prompt",
            [
                f"Welche Auswahl stützt „{title}“ fachlich am saubersten?",
                f"Welche Antwort passt für „{title}“ hier am verlässlichsten?",
                f"Welche Option trägt „{title}“ sachlich am besten?",
            ],
        )

    return normalize_visible_text(question.get("prompt", ""))


def reorder_option_records(options: list[dict[str, Any]], source_ref: str) -> list[dict[str, Any]]:
    copied = [{**option} for option in options]
    if len(copied) < 2:
        return copied

    shift = int(stable_id("option_shift", source_ref), 16) % len(copied)
    if shift == 0:
        shift = 1
    rotated = copied[shift:] + copied[:shift]

    reordered: list[dict[str, Any]] = []
    for option_index, option in enumerate(rotated, start=1):
        reordered.append(
            {
                **option,
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
            }
        )
    return reordered


def get_correct_flags(question: dict[str, Any]) -> list[bool]:
    options = question.get("options", [])
    raw_correct_index = question.get("correctIndex")
    correct_index = raw_correct_index if isinstance(raw_correct_index, int) else None

    flags: list[bool] = []
    for index, option in enumerate(options):
        if not isinstance(option, dict):
            flags.append(False)
            continue
        if "correct" in option:
            flags.append(bool(option.get("correct")))
        else:
            flags.append(correct_index == index)
    return flags


def build_concept_key(pool_slug: str, question: dict[str, Any]) -> str:
    return f"{pool_slug}::{base_source_ref(question['source_ref'])}"


def build_match_pair_title(parent_title: str, left_text: str) -> str:
    return shorten_visible_title(f"{parent_title}: {left_text}")


def build_match_pair_badge(source_ref: str) -> str:
    return choose_text_variant(f"{source_ref}::badge", list(MATCH_PAIR_BADGE_VARIANTS))


def build_match_pair_prompt(parent_title: str, left_text: str, source_ref: str) -> str:
    parent = normalize_visible_text(parent_title)
    left = normalize_visible_text(left_text)
    return choose_text_variant(
        source_ref,
        [
            f"Welche Zuordnung passt für „{left}“ in „{parent}“ am besten?",
            f"Ordnen Sie „{left}“ in „{parent}“ der fachlich passendsten Ergänzung zu.",
            f"Bestimmen Sie die zutreffendste Einordnung für „{left}“ in „{parent}“.",
            f"Welche Option ordnet „{left}“ in „{parent}“ fachlich richtig ein?",
            f"Welche Ergänzung beschreibt für „{left}“ in „{parent}“ die passendste Zuordnung?",
        ],
    )


def build_match_pair_explanation(
    left_text: str,
    option_text: str,
    correct_text: str,
    related_left_by_option: dict[str, str],
    is_correct: bool,
    source_ref: str,
) -> str:
    left = normalize_visible_text(left_text)
    option = normalize_visible_text(option_text)
    correct = normalize_visible_text(correct_text)
    if is_correct:
        return choose_text_variant(
            source_ref,
            [
                f"Für „{left}“ passt „{correct}“, weil genau diese Zuordnung den beschriebenen Schwerpunkt trifft.",
                f"„{correct}“ ist hier richtig, weil diese Zuordnung den Fall „{left}“ fachlich am direktesten erklärt.",
                f"Die richtige Verbindung lautet „{left}“ zu „{correct}“, weil genau dort der passende Bezug liegt.",
            ],
        )

    other_left = normalize_visible_text(related_left_by_option.get(option, ""))
    if other_left:
        return choose_text_variant(
            f"{source_ref}::{option}",
            [
                f"„{option}“ passt eher zu „{other_left}“ als zu „{left}“.",
                f"Diese Zuordnung gehört eher zum Punkt „{other_left}“ und nicht zu „{left}“.",
                f"Für „{left}“ führt „{option}“ in die falsche Richtung; diese Option passt eher zu „{other_left}“.",
            ],
        )

    return choose_text_variant(
        f"{source_ref}::{option}",
        [
            f"„{option}“ erklärt den Punkt „{left}“ nicht am treffendsten.",
            f"Diese Option passt fachlich nicht sauber zu „{left}“.",
        ],
    )


def classify_table_column(column_header: str) -> str:
    header = normalize_visible_text(column_header).casefold()
    if "nachweis" in header:
        return "evidence"
    if "rolle" in header or "zuständig" in header or "zustaendig" in header or "federführ" in header or "federfuehr" in header:
        return "role"
    if "kontaktweg" in header:
        return "contact"
    if "qualitätsziel" in header or "qualitaetsziel" in header or header == "ziel":
        return "goal"
    if "maßnahme" in header or "massnahme" in header:
        return "measure"
    if "quelle" in header:
        return "source"
    if "vorgabe" in header:
        return "requirement"
    if "standardbehandlung" in header or header == "standard":
        return "standard"
    if "ausnahmepunkt" in header or "ausnahme" in header:
        return "exception"
    if "prüffokus" in header or "prueffokus" in header:
        return "focus"
    return "generic"


def build_table_cell_title(parent_title: str, row_label: str, column_header: str, cell_label: str) -> str:
    label = normalize_visible_text(cell_label)
    if "/" in label:
        left, right = [normalize_visible_text(part) for part in label.split("/", 1)]
        return shorten_visible_title(f"{left}: {right}")
    return shorten_visible_title(f"{parent_title}: {row_label} / {column_header}")


def build_table_cell_badge(column_header: str, source_ref: str) -> str:
    prompt_kind = classify_table_column(column_header)
    return choose_text_variant(
        f"{source_ref}::badge",
        list(TABLE_BADGE_VARIANTS_BY_KIND[prompt_kind]),
    )


def build_table_cell_prompt(row_label: str, column_header: str, source_ref: str) -> str:
    row = normalize_visible_text(row_label)
    column = normalize_visible_text(column_header)
    prompt_kind = classify_table_column(column)
    variants_by_kind = {
        "evidence": [
            f"Welcher Nachweis passt für „{row}“ am besten?",
            f"Bestimmen Sie den tragfähigsten Nachweis für „{row}“.",
            f"Welche Dokumentation belegt „{row}“ am tragfähigsten?",
            f"Welcher Nachweis ist für „{row}“ hier zuerst am sinnvollsten?",
        ],
        "role": [
            f"Wer sollte für „{row}“ zuerst federführend sein?",
            f"Bestimmen Sie die erste Federführung für „{row}“.",
            f"Welche Rolle trägt für „{row}“ hier die erste Federführung?",
            f"Wer ist für „{row}“ zunächst am klarsten zuständig?",
        ],
        "contact": [
            f"Welcher Kontaktweg passt für „{row}“ am besten?",
            f"Wählen Sie den tragfähigsten Kontaktweg für „{row}“.",
            f"Wie sollte „{row}“ hier am sinnvollsten alarmiert oder erreicht werden?",
            f"Welcher Kontaktweg ist für „{row}“ hier am tragfähigsten?",
        ],
        "goal": [
            f"Welches Qualitätsziel passt zur Beobachtung „{row}“ am besten?",
            f"Bestimmen Sie das passendste Qualitätsziel für „{row}“.",
            f"Welche Zielbeschreibung ergänzt „{row}“ fachlich am treffendsten?",
            f"Welches Ziel sollte für „{row}“ hier festgelegt werden?",
        ],
        "measure": [
            f"Welche erste Maßnahme passt für „{row}“ am besten?",
            f"Wählen Sie den sinnvollsten ersten Schritt für „{row}“.",
            f"Welcher erste Schritt ist für „{row}“ hier am sinnvollsten?",
            f"Welche Maßnahme ergänzt „{row}“ fachlich am treffendsten?",
        ],
        "source": [
            f"Welche Wiederherstellungsquelle passt für „{row}“ am besten?",
            f"Bestimmen Sie die passende Wiederherstellungsquelle für „{row}“.",
            f"Woraus sollte „{row}“ hier am sinnvollsten wiederhergestellt werden?",
            f"Welche Quelle ist für „{row}“ hier die passende Grundlage?",
        ],
        "requirement": [
            f"Welche Vorgabe passt für „{row}“ am besten?",
            f"Wählen Sie die verbindliche Vorgabe für „{row}“.",
            f"Welche Anforderung sollte für „{row}“ hier verbindlich gelten?",
            f"Welche Vorgabe ergänzt „{row}“ fachlich am treffendsten?",
        ],
        "standard": [
            f"Welche Standardbehandlung passt für „{row}“ am besten?",
            f"Bestimmen Sie die passende Regellinie für „{row}“.",
            f"Wie sollte „{row}“ im Regelfall behandelt werden?",
            f"Welche Standardlinie ergänzt „{row}“ fachlich am sinnvollsten?",
        ],
        "exception": [
            f"Welcher Ausnahmepunkt gehört bei „{row}“ am ehesten dazu?",
            f"Wählen Sie die passende Ausnahmefrage für „{row}“.",
            f"Welche Ausnahmefrage sollte bei „{row}“ hier zuerst geprüft werden?",
            f"Welcher Ausnahmepunkt passt für „{row}“ am besten?",
        ],
        "focus": [
            f"Welcher Prüffokus passt für „{row}“ am besten?",
            f"Bestimmen Sie den ersten Prüffokus für „{row}“.",
            f"Worauf sollte sich die Prüfung bei „{row}“ hier zuerst richten?",
            f"Welcher Schwerpunkt ergänzt „{row}“ fachlich am sinnvollsten?",
        ],
        "generic": [
            f"Welche Ergänzung passt in der Spalte „{column}“ für „{row}“ am besten?",
            f"Bestimmen Sie die passende Ergänzung für „{row}“ in „{column}“.",
            f"Welche Option ergänzt „{row}“ in „{column}“ fachlich richtig?",
            f"Welche Zuordnung passt für „{row}“ in der Spalte „{column}“ am besten?",
        ],
    }
    return choose_text_variant(source_ref, variants_by_kind[prompt_kind])


def build_table_cell_explanation(
    row_label: str,
    column_header: str,
    option_text: str,
    correct_text: str,
    related_row_by_option: dict[str, str],
    is_correct: bool,
    source_ref: str,
) -> str:
    row = normalize_visible_text(row_label)
    column = normalize_visible_text(column_header)
    option = normalize_visible_text(option_text)
    correct = normalize_visible_text(correct_text)
    prompt_kind = classify_table_column(column)
    if is_correct:
        variants_by_kind = {
            "evidence": [
                f"„{correct}“ ist hier richtig, weil damit für „{row}“ ein belastbarer Nachweis vorliegt.",
                f"Für „{row}“ passt „{correct}“, weil genau so der Nachweis nachvollziehbar gesichert wird.",
            ],
            "role": [
                f"Für „{row}“ liegt die erste Federführung bei „{correct}“, weil diese Rolle den Aspekt unmittelbar steuert.",
                f"„{correct}“ ist hier richtig, weil diese Rolle für „{row}“ zuerst Verantwortung übernehmen muss.",
            ],
            "contact": [
                f"„{correct}“ passt hier, weil dieser Kontaktweg „{row}“ verlässlich abdeckt.",
                f"Für „{row}“ ist „{correct}“ richtig, weil dieser Weg den Alarm oder die Erreichbarkeit tragfähig macht.",
            ],
            "goal": [
                f"„{correct}“ ist hier das passende Ziel, weil damit „{row}“ konkret und prüfbar beschrieben wird.",
                f"Für „{row}“ passt „{correct}“, weil diese Zielbeschreibung messbar und nachvollziehbar bleibt.",
            ],
            "measure": [
                f"„{correct}“ ist hier die richtige Maßnahme, weil damit „{row}“ unmittelbar adressiert wird.",
                f"Für „{row}“ passt „{correct}“, weil dieser Schritt den beschriebenen Punkt zuerst stabilisiert.",
            ],
            "source": [
                f"„{correct}“ ist hier richtig, weil diese Quelle den freigegebenen Wiederherstellungsstand für „{row}“ abbildet.",
                f"Für „{row}“ passt „{correct}“, weil genau daraus die Wiederherstellung belastbar gestartet werden kann.",
            ],
            "requirement": [
                f"„{correct}“ ist hier die passende Vorgabe, weil damit „{row}“ verbindlich und kontrollierbar geregelt wird.",
                f"Für „{row}“ passt „{correct}“, weil diese Vorgabe den beschriebenen Fall tragfähig absichert.",
            ],
            "standard": [
                f"„{correct}“ ist hier die passende Standardbehandlung, weil damit „{row}“ im Regelfall sauber gesteuert wird.",
                f"Für „{row}“ passt „{correct}“, weil diese Linie die normale Behandlung nachvollziehbar festlegt.",
            ],
            "exception": [
                f"„{correct}“ ist hier der richtige Ausnahmepunkt, weil genau diese Frage den Regelfall bei „{row}“ durchbrechen kann.",
                f"Für „{row}“ passt „{correct}“, weil daran entschieden wird, ob der Standardfall ausnahmsweise nicht reicht.",
            ],
            "focus": [
                f"„{correct}“ ist hier der passende Prüffokus, weil genau darauf sich die Bewertung bei „{row}“ zuerst richten sollte.",
                f"Für „{row}“ passt „{correct}“, weil dieser Schwerpunkt das eigentliche Prüfziel am klarsten trifft.",
            ],
            "generic": [
                f"„{correct}“ ergänzt „{row}“ in der Spalte „{column}“ fachlich am treffendsten.",
                f"Für „{row}“ ist „{correct}“ hier die passende Ergänzung.",
            ],
        }
        return choose_text_variant(source_ref, variants_by_kind[prompt_kind])

    other_row = normalize_visible_text(related_row_by_option.get(option, ""))
    if other_row:
        return choose_text_variant(
            f"{source_ref}::{option}",
            [
                f"„{option}“ passt eher zu „{other_row}“ als zu „{row}“.",
                f"Diese Option gehört fachlich eher zu „{other_row}“ und nicht zu „{row}“.",
            ],
        )

    return choose_text_variant(
        f"{source_ref}::{option}",
        [
            f"„{option}“ ergänzt „{row}“ in „{column}“ nicht passend.",
            f"Diese Option trifft den Punkt „{row}“ in der Spalte „{column}“ nicht am besten.",
        ],
    )


def collect_match_pair_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_context: str,
    max_items: int,
) -> list[dict[str, Any]]:
    if max_items <= 0:
        return []
    question_id = str(raw_question.get("id", "")).strip()
    title = normalize_visible_text(raw_question.get("title", ""))
    context_text = normalize_context_text(active_context)
    options = [normalize_visible_text(option) for option in raw_question.get("options", []) if normalize_visible_text(option)]
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    pairs = [
        pair for pair in raw_question.get("pairs", [])
        if isinstance(pair, dict) and normalize_visible_text(pair.get("left", "")) and normalize_visible_text(pair.get("right", ""))
    ]
    related_left_by_option = {
        normalize_visible_text(pair.get("right", "")): normalize_visible_text(pair.get("left", ""))
        for pair in pairs
    }
    records: list[dict[str, Any]] = []

    for pair_index, pair in enumerate(pairs, start=1):
        if len(records) >= max_items:
            break
        left_text = normalize_visible_text(pair.get("left", ""))
        right_text = normalize_visible_text(pair.get("right", ""))
        source_ref = f"{scenario_rel_path}#{question_id}::{str(pair.get('key') or pair_index).strip()}"
        prompt = build_match_pair_prompt(title, left_text, source_ref)
        option_records = []
        for option_index, option_text in enumerate(options, start=1):
            is_correct = option_text == right_text
            option_records.append(
                {
                    "source_option_id": f"{pair_index}_{option_index}",
                    "option_key": f"OPT{option_index}",
                    "sort_order": option_index,
                    "text": option_text,
                    "explanation": build_match_pair_explanation(
                        left_text,
                        option_text,
                        right_text,
                        related_left_by_option,
                        is_correct,
                        source_ref,
                    ),
                    "is_correct": 1 if is_correct else 0,
                }
            )
        validate_visible_texts([title, left_text, prompt, context_text, right_text])
        records.append(
            {
                "source_question_id": f"{question_id}::{str(pair.get('key') or pair_index).strip()}",
                "source_ref": source_ref,
                "title": build_match_pair_title(title, left_text),
                "prompt": prompt,
                "context": context_text,
                "interaction_type": "single",
                "question_kind": "eine_richtige_antwort_waehlen",
                "badge_label": build_match_pair_badge(source_ref),
                "max_selections": 1,
                "options": option_records,
                "sequence_items": [],
                "accepted_answers": [],
                "progress_links": progress_links,
            }
        )

    return records


def collect_table_fill_questions(
    scenario_rel_path: str,
    raw_question: dict[str, Any],
    active_context: str,
    max_items: int,
) -> list[dict[str, Any]]:
    if max_items <= 0:
        return []
    question_id = str(raw_question.get("id", "")).strip()
    parent_title = normalize_visible_text(raw_question.get("title", ""))
    context_text = normalize_context_text(active_context)
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    columns = [normalize_visible_text(column) for column in raw_question.get("columns", [])]
    rows = [row for row in raw_question.get("rows", []) if isinstance(row, list) and row]

    # Build lookups so wrong explanations can reference the row where an alternative actually belongs.
    expected_row_by_column: dict[int, dict[str, str]] = {}
    for row in rows:
        row_label = normalize_visible_text(row[0])
        for column_index, cell in enumerate(row[1:], start=1):
            if not isinstance(cell, dict):
                continue
            expected_text = normalize_visible_text(cell.get("expected", ""))
            if not expected_text:
                continue
            expected_row_by_column.setdefault(column_index, {})[expected_text] = row_label

    records: list[dict[str, Any]] = []
    for row in rows:
        if len(records) >= max_items:
            break
        row_label = normalize_visible_text(row[0])
        for column_index, cell in enumerate(row[1:], start=1):
            if len(records) >= max_items:
                break
            if not isinstance(cell, dict):
                continue
            expected_text = normalize_visible_text(cell.get("expected", ""))
            if not expected_text:
                continue
            options = [
                normalize_visible_text(option)
                for option in cell.get("options", [])
                if normalize_visible_text(option)
            ]
            if len(options) < 2:
                continue
            column_header = columns[column_index] if column_index < len(columns) else cell.get("label", "")
            source_key = str(cell.get("key") or f"col{column_index}_{len(records)+1}").strip()
            source_ref = f"{scenario_rel_path}#{question_id}::{source_key}"
            prompt = build_table_cell_prompt(row_label, column_header, source_ref)
            related_rows = expected_row_by_column.get(column_index, {})
            option_records = []
            for option_index, option_text in enumerate(options, start=1):
                is_correct = option_text == expected_text
                option_records.append(
                    {
                        "source_option_id": f"{source_key}_{option_index}",
                        "option_key": f"OPT{option_index}",
                        "sort_order": option_index,
                        "text": option_text,
                        "explanation": build_table_cell_explanation(
                            row_label,
                            column_header,
                            option_text,
                            expected_text,
                            related_rows,
                            is_correct,
                            source_ref,
                        ),
                        "is_correct": 1 if is_correct else 0,
                    }
                )
            title = build_table_cell_title(parent_title, row_label, column_header, str(cell.get("label") or ""))
            validate_visible_texts([title, prompt, context_text, expected_text, row_label, column_header])
            records.append(
                {
                    "source_question_id": f"{question_id}::{source_key}",
                    "source_ref": source_ref,
                    "title": title,
                    "prompt": prompt,
                    "context": context_text,
                    "interaction_type": "single",
                    "question_kind": "eine_richtige_antwort_waehlen",
                    "badge_label": build_table_cell_badge(column_header, source_ref),
                    "max_selections": 1,
                    "options": option_records,
                    "sequence_items": [],
                    "accepted_answers": [],
                    "progress_links": progress_links,
                }
            )

    return records


def load_topic_titles() -> dict[str, str]:
    data = json.loads(POSSIBLE_SKILLS_PATH.read_text(encoding="utf-8"))
    titles: dict[str, str] = {}

    def walk_sections(sections: list[dict[str, Any]]) -> None:
        for section in sections:
            if not isinstance(section, dict):
                continue
            section_id = str(section.get("id", "")).strip()
            title = normalize_visible_text(section.get("title", ""))
            if section_id and title:
                titles[section_id] = title
            for key in ("sections", "subsections"):
                nested = section.get(key, [])
                if isinstance(nested, list):
                    walk_sections(nested)

    walk_sections(data.get("sections", []))
    return titles


def collect_pool_topics(
    fallback_label: str,
    questions: list[dict[str, Any]],
    topic_titles: dict[str, str],
) -> list[str]:
    topics: list[str] = [fallback_label]
    seen = {fallback_label}

    for question in questions:
        for progress_link in question.get("progress_links", []):
            title = topic_titles.get(progress_link)
            if not title or title in seen:
                continue
            seen.add(title)
            topics.append(title)

    return topics


def collect_supported_questions(
    scenario_rel_path: str,
    scenario_data: dict[str, Any],
) -> tuple[list[dict[str, Any]], Counter[str]]:
    collected: list[dict[str, Any]] = []
    skipped_types: Counter[str] = Counter()
    active_context = ""
    derived_question_count = 0

    for raw_question in scenario_data.get("questions", []):
        question_type = str(raw_question.get("type", "")).strip()

        if question_type == "followup_divider":
            active_context = ""
            continue
        if question_type == "context_card":
            active_context = normalize_context_text(render_context_card(raw_question))
            continue
        if question_type == "match_pairs":
            remaining_budget = max(0, DERIVED_QUESTION_BUDGET_PER_SCENARIO - derived_question_count)
            derived_records = collect_match_pair_questions(
                scenario_rel_path,
                raw_question,
                active_context,
                remaining_budget,
            )
            derived_question_count += len(derived_records)
            if derived_records:
                collected.extend(derived_records)
            else:
                skipped_types[question_type] += len(raw_question.get("pairs", []))
            continue
        if question_type == "table_fill":
            remaining_budget = max(0, DERIVED_QUESTION_BUDGET_PER_SCENARIO - derived_question_count)
            derived_records = collect_table_fill_questions(
                scenario_rel_path,
                raw_question,
                active_context,
                remaining_budget,
            )
            derived_question_count += len(derived_records)
            skipped_cells = 0
            for row in raw_question.get("rows", []):
                if isinstance(row, list):
                    skipped_cells += sum(1 for cell in row[1:] if isinstance(cell, dict) and "expected" in cell)
            skipped_cells = max(0, skipped_cells - len(derived_records))
            if derived_records:
                collected.extend(derived_records)
            if skipped_cells:
                skipped_types[question_type] += skipped_cells
            continue
        if question_type not in QUESTION_META_BY_TYPE:
            skipped_types[question_type or "<leer>"] += 1
            continue

        question_id = str(raw_question.get("id", "")).strip()
        if not question_id:
            raise ValueError(f"Frage ohne ID in {scenario_rel_path}.")

        meta = QUESTION_META_BY_TYPE[question_type]
        title = normalize_visible_text(raw_question.get("title", ""))
        source_ref = f"{scenario_rel_path}#{question_id}"
        prompt = normalize_visible_text(raw_question.get("prompt", ""))
        if question_type == "number":
            prompt = NUMBER_PROMPT_OVERRIDES.get(source_ref, prompt)
        context_text = normalize_context_text(active_context)
        progress_links = [
            str(link).strip()
            for link in raw_question.get("progressLinks", [])
            if str(link).strip()
        ]

        record: dict[str, Any] = {
            "source_question_id": question_id,
            "source_ref": source_ref,
            "title": title,
            "prompt": prompt,
            "context": context_text,
            "interaction_type": meta["interaction_type"],
            "question_kind": meta["question_kind"],
            "badge_label": badge_label_for_question_kind(meta["question_kind"]),
            "max_selections": 1,
            "options": [],
            "sequence_items": [],
            "accepted_answers": [],
            "progress_links": progress_links,
        }

        if question_type in {"single_choice", "multi_select"}:
            correct_flags = get_correct_flags(raw_question)
            correct_count = sum(1 for is_correct in correct_flags if is_correct)
            if question_type == "single_choice" and correct_count != 1:
                raise ValueError(
                    f"Single-Choice-Frage {question_id} in {scenario_rel_path} hat {correct_count} richtige Antworten."
                )
            if question_type == "multi_select" and correct_count < 2:
                raise ValueError(
                    f"Multi-Select-Frage {question_id} in {scenario_rel_path} hat zu wenige richtige Antworten."
                )

            options: list[dict[str, Any]] = []
            for option_index, raw_option in enumerate(raw_question.get("options", []), start=1):
                option_text = normalize_visible_text(raw_option.get("text", ""))
                explanation = normalize_visible_text(
                    raw_option.get("rationale") or raw_option.get("explanation", "")
                )
                validate_visible_texts([option_text, explanation])
                options.append(
                    {
                        "source_option_id": str(raw_option.get("id") or option_index),
                        "option_key": f"OPT{option_index}",
                        "sort_order": option_index,
                        "text": option_text,
                        "explanation": explanation,
                        "is_correct": 1 if correct_flags[option_index - 1] else 0,
                    }
                )

            record["options"] = options
            record["max_selections"] = correct_count
        elif question_type == "ordering":
            correct_order = raw_question.get("correctOrder") or raw_question.get("items") or []
            sequence_items = [
                normalize_visible_text(item)
                for item in correct_order
                if normalize_visible_text(item)
            ]
            sequence_items = SEQUENCE_ITEM_OVERRIDES.get(source_ref, sequence_items)
            if len(sequence_items) < 2:
                raise ValueError(f"Ordering-Frage {question_id} in {scenario_rel_path} hat zu wenige Schritte.")
            record["sequence_items"] = sequence_items
            record["max_selections"] = len(sequence_items)
        elif question_type == "number":
            expected = raw_question.get("expected")
            if expected is None or normalize_visible_text(expected) == "":
                raise ValueError(f"Number-Frage {question_id} in {scenario_rel_path} hat keinen Erwartungswert.")
            answer_text = normalize_visible_text(expected)
            record["accepted_answers"] = [
                {
                    "answer_text": answer_text,
                    "normalized_answer": normalize_answer(answer_text),
                    "is_primary": 1,
                }
            ]

        validate_visible_texts([title, prompt, context_text])
        collected.append(record)

    return collected, skipped_types


def clone_question_variant(question: dict[str, Any], variant_suffix: str = "alt1") -> dict[str, Any]:
    source_ref = f"{question['source_ref']}::{variant_suffix}"
    cloned = {
        "source_question_id": f"{question['source_question_id']}::{variant_suffix}",
        "source_ref": source_ref,
        "title": question["title"],
        "prompt": build_alternate_prompt(question, variant_suffix=variant_suffix),
        "context": question["context"],
        "interaction_type": question["interaction_type"],
        "question_kind": question["question_kind"],
        "badge_label": build_alternate_badge(question, variant_suffix=variant_suffix),
        "max_selections": question["max_selections"],
        "options": reorder_option_records(question["options"], source_ref),
        "sequence_items": list(question["sequence_items"]),
        "accepted_answers": [{**answer} for answer in question["accepted_answers"]],
        "progress_links": list(question["progress_links"]),
    }
    validate_visible_texts([cloned["title"], cloned["prompt"], cloned["context"], cloned["badge_label"]])
    return cloned


def is_base_question(question: dict[str, Any]) -> bool:
    return base_source_ref(question["source_ref"]) == question["source_ref"]


def collect_variant_bases(pools: list[dict[str, Any]], variant_suffix: str) -> set[str]:
    suffix = f"::{variant_suffix}"
    return {
        base_source_ref(question["source_ref"])
        for pool in pools
        for question in pool["questions"]
        if question["source_ref"].endswith(suffix)
    }


def round_robin_single_questions(
    pools: list[dict[str, Any]],
    limit: int,
    *,
    excluded_base_refs: set[str] | None = None,
    used_base_refs: set[str] | None = None,
) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    excluded_base_refs = excluded_base_refs or set()
    used_base_refs = used_base_refs or set()
    per_pool: list[tuple[dict[str, Any], list[dict[str, Any]]]] = []
    for pool in pools:
        single_questions = [
            question
            for question in pool["questions"]
            if question["interaction_type"] == "single"
            and is_base_question(question)
            and base_source_ref(question["source_ref"]) not in excluded_base_refs
            and base_source_ref(question["source_ref"]) not in used_base_refs
        ]
        per_pool.append((pool, single_questions))

    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
    while len(selected) < limit:
        progressed = False
        for pool, questions in per_pool:
            if not questions or len(selected) >= limit:
                continue
            selected.append((pool, questions.pop(0)))
            progressed = True
        if not progressed:
            break
    return selected


def select_variant_questions(
    pools: list[dict[str, Any]],
    limit: int,
    *,
    previous_variant_suffix: str | None = None,
) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    if limit <= 0:
        return []

    preferred_excluded = collect_variant_bases(pools, previous_variant_suffix) if previous_variant_suffix else set()
    used_base_refs: set[str] = set()
    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []

    def append_priority_questions(excluded_base_refs: set[str]) -> None:
        nonlocal selected
        for interaction_type in ("multi", "sequence", "gap_fill_text"):
            for pool in pools:
                for question in pool["questions"]:
                    base_ref = base_source_ref(question["source_ref"])
                    if (
                        len(selected) >= limit
                        or question["interaction_type"] != interaction_type
                        or not is_base_question(question)
                        or base_ref in excluded_base_refs
                        or base_ref in used_base_refs
                    ):
                        continue
                    selected.append((pool, question))
                    used_base_refs.add(base_ref)
                    if len(selected) >= limit:
                        return

    append_priority_questions(preferred_excluded)
    if len(selected) < limit:
        append_priority_questions(set())

    if len(selected) < limit:
        selected.extend(
            round_robin_single_questions(
                pools,
                limit - len(selected),
                excluded_base_refs=preferred_excluded,
                used_base_refs=used_base_refs,
            )
        )
        used_base_refs.update(base_source_ref(question["source_ref"]) for _, question in selected)

    if len(selected) < limit:
        selected.extend(
            round_robin_single_questions(
                pools,
                limit - len(selected),
                used_base_refs=used_base_refs,
            )
        )

    return selected[:limit]


def add_additional_variants(
    pools: list[dict[str, Any]],
    target: int,
    *,
    variant_suffix: str = "alt1",
    previous_variant_suffix: str | None = None,
) -> int:
    if target <= 0:
        return 0

    selected = select_variant_questions(pools, target, previous_variant_suffix=previous_variant_suffix)

    for pool, question in selected:
        pool["questions"].append(clone_question_variant(question, variant_suffix=variant_suffix))

    return len(selected)


def build_dedupe_prompt(question: dict[str, Any], pool_label: str, occurrence_index: int) -> str:
    focus = shorten_visible_title(question.get("title") or pool_label, limit=88)
    source_ref = str(question.get("source_ref", "")).strip()
    interaction_type = str(question.get("interaction_type", "")).strip()

    if interaction_type == "gap_fill_text":
        templates = [
            f"Für „{focus}“ ist der passende Zahlenwert zu bestimmen.",
            f"Bei „{focus}“ soll der rechnerisch stimmige Wert ermittelt werden.",
            f"Ermitteln Sie für „{focus}“ den fehlenden Zahlenwert.",
        ]
    elif interaction_type == "sequence":
        templates = [
            f"Für „{focus}“ ist die sachgerechte Schrittfolge festzulegen.",
            f"Bei „{focus}“ soll die Ablaufkette in eine stimmige Reihenfolge gebracht werden.",
            f"Ordnen Sie für „{focus}“ die Schritte in fachlich passender Folge.",
        ]
    elif interaction_type == "multi":
        templates = [
            f"Für „{focus}“ sind die fachlich tragenden Aussagen herauszuarbeiten.",
            f"Bei „{focus}“ sollen die zutreffenden Punkte belastbar markiert werden.",
            f"Arbeiten Sie für „{focus}“ die fachlich passenden Aussagen heraus.",
        ]
    else:
        templates = [
            f"Für „{focus}“ ist die tragfähigste Antwort fachlich einzuordnen.",
            f"Bei „{focus}“ soll die fachlich stimmigste Auswahl bestimmt werden.",
            f"Entscheiden Sie für „{focus}“, welche Antwort den Fall am besten trägt.",
        ]

    return choose_text_variant(f"{source_ref}::dedupe::{occurrence_index}", templates)


def uniquify_prompts(pools: list[dict[str, Any]]) -> None:
    for _ in range(4):
        grouped: dict[str, list[tuple[str, dict[str, Any]]]] = {}
        for pool in pools:
            for question in pool["questions"]:
                prompt = normalize_visible_text(question.get("prompt", ""))
                question["prompt"] = prompt
                grouped.setdefault(prompt, []).append((pool["label"], question))

        duplicate_groups = {prompt: entries for prompt, entries in grouped.items() if len(entries) > 1}
        if not duplicate_groups:
            return

        for prompt, entries in duplicate_groups.items():
            for occurrence_index, (pool_label, question) in enumerate(entries[1:], start=1):
                adjusted = normalize_visible_text(build_dedupe_prompt(question, pool_label, occurrence_index))
                if not adjusted or adjusted == prompt:
                    focus = shorten_visible_title(question.get("title") or pool_label, limit=72)
                    source_ref = str(question.get("source_ref", "")).strip()
                    adjusted = normalize_visible_text(
                        choose_text_variant(
                            f"{source_ref}::fallback_dedupe::{occurrence_index}",
                            [
                                f"Für „{focus}“ gilt {variant_refinement_phrase(source_ref)}: {lowercase_first(prompt)}",
                                f"Für den Fall „{focus}“ ist {variant_refinement_phrase(source_ref)} ausschlaggebend: {lowercase_first(prompt)}",
                                f"Auf „{focus}“ bezogen gilt {variant_refinement_phrase(source_ref)} fachlich: {lowercase_first(prompt)}",
                                f"Für „{focus}“ ist {variant_refinement_phrase(source_ref)} entscheidend: {lowercase_first(prompt)}",
                            ],
                        )
                    )
                question["prompt"] = adjusted
                validate_visible_texts([question["prompt"]])


def rebuild_database(pools: list[dict[str, Any]]) -> tuple[int, int, int, int]:
    question_count = sum(len(pool["questions"]) for pool in pools)
    option_count = sum(len(question["options"]) for pool in pools for question in pool["questions"])
    sequence_item_count = sum(
        len(question["sequence_items"]) for pool in pools for question in pool["questions"]
    )
    accepted_answer_count = sum(
        len(question["accepted_answers"]) for pool in pools for question in pool["questions"]
    )

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")

    with sqlite3.connect(QUIZ_DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(schema_sql)
        conn.executescript(
            """
            DELETE FROM quiz_accepted_answer;
            DELETE FROM quiz_sequence_item;
            DELETE FROM quiz_option;
            DELETE FROM quiz_question;
            DELETE FROM quiz_pool_topic;
            DELETE FROM quiz_pool;
            DELETE FROM quiz_db_meta;
            """
        )

        conn.execute(
            """
            INSERT INTO quiz_db_meta (
              id,
              schema_version,
              db_key,
              course_key,
              title,
              description,
              language_code,
              default_badge_label
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                1,
                1,
                "QuS2-Quiz",
                "QUS2",
                "QuS2",
                "Quizdatenbank für Qualitätsmanagement, IT-Sicherheit und Datenschutz Teil II.",
                "de",
                "",
            ),
        )

        for pool_sort_order, pool in enumerate(pools, start=1):
            default_interaction_type = pool["default_interaction_type"]
            default_question_kind = pool["default_question_kind"]
            default_badge_label = badge_label_for_question_kind(default_question_kind)
            conn.execute(
                """
                INSERT INTO quiz_pool (
                  id,
                  slug,
                  label,
                  description,
                  sort_order,
                  default_interaction_type,
                  default_question_kind,
                  default_badge_label,
                  source_ref,
                  is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    pool["id"],
                    pool["slug"],
                    pool["label"],
                    pool["description"],
                    pool_sort_order,
                    default_interaction_type,
                    default_question_kind,
                    default_badge_label,
                    pool["source_ref"],
                    1,
                ),
            )

            for topic in pool["topics"]:
                conn.execute(
                    "INSERT INTO quiz_pool_topic (pool_id, topic) VALUES (?, ?)",
                    (pool["id"], topic),
                )

            for question_sort_order, question in enumerate(pool["questions"], start=1):
                question_id = stable_id("question", question["source_ref"])
                concept_id = stable_id("concept", build_concept_key(pool["slug"], question))
                variant_id = stable_id("variant", f"{question['source_ref']}::v1")

                conn.execute(
                    """
                    INSERT INTO quiz_question (
                      id,
                      pool_id,
                      concept_id,
                      variant_id,
                      sort_order,
                      interaction_type,
                      question_kind,
                      badge_label,
                      prompt,
                      instructions,
                      context,
                      max_selections,
                      is_new,
                      sentence_template,
                      gap_key,
                      source_ref,
                      is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        question_id,
                        pool["id"],
                        concept_id,
                        variant_id,
                        question_sort_order,
                        question["interaction_type"],
                        question["question_kind"],
                        question["badge_label"],
                        question["prompt"],
                        question["title"],
                        "",
                        question["max_selections"],
                        0,
                        "",
                        "",
                        question["source_ref"],
                        1,
                    ),
                )

                for option in question["options"]:
                    option_id = stable_id(
                        "option",
                        f"{question['source_ref']}::{option['source_option_id']}::{option['sort_order']}",
                    )
                    conn.execute(
                        """
                        INSERT INTO quiz_option (
                          id,
                          question_id,
                          option_key,
                          sort_order,
                          short_label,
                          text,
                          explanation,
                          is_correct,
                          is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            option_id,
                            question_id,
                            option["option_key"],
                            option["sort_order"],
                            "",
                            option["text"],
                            option["explanation"],
                            option["is_correct"],
                            1,
                        ),
                    )

                for item_index, item_text in enumerate(question["sequence_items"], start=1):
                    item_id = stable_id("sequence_item", f"{question['source_ref']}::{item_index}")
                    conn.execute(
                        """
                        INSERT INTO quiz_sequence_item (
                          id,
                          question_id,
                          item_key,
                          sort_order,
                          text
                        ) VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            item_id,
                            question_id,
                            f"ITEM{item_index}",
                            item_index,
                            item_text,
                        ),
                    )

                for answer_index, answer in enumerate(question["accepted_answers"], start=1):
                    answer_id = stable_id("accepted_answer", f"{question['source_ref']}::{answer_index}")
                    conn.execute(
                        """
                        INSERT INTO quiz_accepted_answer (
                          id,
                          question_id,
                          answer_text,
                          normalized_answer,
                          is_primary
                        ) VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            answer_id,
                            question_id,
                            answer["answer_text"],
                            answer["normalized_answer"],
                            answer["is_primary"],
                        ),
                    )

        conn.commit()

    return question_count, option_count, sequence_item_count, accepted_answer_count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importiert QuS2-Trainingsfragen in die SQLite-Quizdatenbank.")
    parser.add_argument(
        "--question-limit",
        type=int,
        default=DEFAULT_QUESTION_LIMIT,
        help="Zielstand der importierten Fragen nach Hinzufügen weiterer Varianten.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest = json.loads(SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
    topic_titles = load_topic_titles()
    pools: list[dict[str, Any]] = []
    skipped_totals: Counter[str] = Counter()

    for entry in manifest.get("scenarios", []):
        scenario_rel_path = str(entry.get("file", "")).strip()
        if not scenario_rel_path:
            continue

        scenario_path = SCENARIO_ROOT / scenario_rel_path
        scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
        questions, skipped_types = collect_supported_questions(scenario_rel_path, scenario_data)
        skipped_totals.update(skipped_types)
        if not questions:
            continue

        label = normalize_visible_text(strip_ticket_prefix(str(entry.get("label", ""))))
        description = normalize_visible_text(build_pool_description(scenario_data))
        validate_visible_texts([label, description])

        pools.append(
            {
                "id": stable_id("pool", scenario_rel_path),
                "slug": normalize_pool_slug(scenario_path.parent.name),
                "label": label,
                "description": description,
                "source_ref": scenario_rel_path,
                "default_interaction_type": Counter(
                    question["interaction_type"] for question in questions
                ).most_common(1)[0][0],
                "default_question_kind": Counter(
                    question["question_kind"] for question in questions
                ).most_common(1)[0][0],
                "topics": collect_pool_topics(label, questions, topic_titles),
                "questions": questions,
            }
        )

    direct_question_count = sum(len(pool["questions"]) for pool in pools)
    target_question_count = args.question_limit
    if target_question_count < direct_question_count:
        raise ValueError(f"Question-Limit unterschreitet den Direktbestand: {target_question_count} < {direct_question_count}")

    additional_needed = target_question_count - direct_question_count
    stage_counts: list[tuple[int, int]] = []
    stage_index = 1
    while additional_needed > 0:
        stage_target = min(ADDITIONAL_VARIANT_BATCH_SIZE, additional_needed)
        variant_suffix = f"alt{stage_index}"
        previous_variant_suffix = f"alt{stage_index - 1}" if stage_index > 1 else None
        added_count = add_additional_variants(
            pools,
            stage_target,
            variant_suffix=variant_suffix,
            previous_variant_suffix=previous_variant_suffix,
        )
        if added_count != stage_target:
            raise ValueError(f"Erwartet waren {stage_target} Varianten für {variant_suffix}, gefunden wurden {added_count}.")
        stage_counts.append((stage_index, added_count))
        additional_needed -= added_count
        stage_index += 1

    uniquify_prompts(pools)
    question_count, option_count, sequence_item_count, accepted_answer_count = rebuild_database(pools)

    print(f"db={QUIZ_DB_PATH.relative_to(ROOT)}")
    print(f"pools={len(pools)}")
    print(f"questions={question_count}")
    print(f"options={option_count}")
    print(f"sequence_items={sequence_item_count}")
    print(f"accepted_answers={accepted_answer_count}")
    print(f"direct_questions={direct_question_count}")
    print(f"added_variants={question_count - direct_question_count}")
    for stage_index, added_count in stage_counts:
        print(f"stage{stage_index}_questions={added_count}")
    for question_type, count in sorted(skipped_totals.items()):
        print(f"skipped_{question_type}={count}")


if __name__ == "__main__":
    main()
