#!/usr/bin/env python3

from __future__ import annotations

from collections import Counter
import json
import re
import sqlite3
from pathlib import Path
from typing import Any

from import_pv3wiso_quiz_to_db import (
    build_pool_description,
    normalize_visible_text as base_normalize_visible_text,
    slugify_visible_text,
    stable_id,
    strip_ticket_prefix,
    validate_visible_texts,
)


ROOT = Path(__file__).resolve().parents[2]
SCENARIO_ROOT = ROOT / "Kurse" / "LF12FIAE-Scenarien"
SCENARIO_MANIFEST_PATH = SCENARIO_ROOT / "scenario-manifest.json"
POSSIBLE_SKILLS_PATH = SCENARIO_ROOT / "possible_skills.json"
QUIZ_DB_PATH = ROOT / "Kurse" / "LF12FIAE-Quiz.db"
SCHEMA_PATH = ROOT / "QuizMaster" / "sql" / "quiz_db_schema_v1.sql"
TARGET_QUESTION_COUNT = 200

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

BADGE_LABEL_BY_INTERACTION = {
    "single": "Beste Option",
    "multi": "Passende Aussagen",
    "sequence": "Reihenfolge",
    "gap_fill_text": "Wert berechnen",
}

VISIBLE_WORD_RE = re.compile(r"\b[A-Za-zÄÖÜäöüß-]+\b")

LF12_VISIBLE_REPLACEMENTS = (
    (" + ", " und "),
    (" & ", " und "),
    ("Dokuartefakte", "Dokumentationsartefakte"),
    ("Dokuabschluss", "Dokumentationsabschluss"),
    ("Dokuumfang", "Dokumentationsumfang"),
    ("Doku ", "Dokumentations-"),
)

LF12_POST_TRANSLITERATION_FIXES = (
    ("zürst", "zuerst"),
    ("Zürst", "Zuerst"),
)

SINGLE_RATIONALE_PROMPTS = (
    "Welche Begruendung traegt in „{title}“ die fachlich beste Entscheidung am ueberzeugendsten?",
    "Welche Erlaeuterung erklaert in „{title}“ die passende Reaktion am treffendsten?",
    "Welche Begruendung macht in „{title}“ den richtigen Schritt am belastbarsten?",
)

MULTI_COUNTEREXAMPLE_PROMPTS = (
    "Welche Aussage widerspricht in „{title}“ einem belastbaren Vorgehen am deutlichsten?",
    "Welche Aussage passt in „{title}“ fachlich am wenigsten zu sauberer Projektarbeit?",
    "Welche Aussage waere in „{title}“ das klarste Gegenbeispiel zu einer tragfaehigen Loesung?",
)

ORDERING_FIRST_PROMPTS = (
    "Mit welchem Schritt sollte „{title}“ fachlich beginnen?",
    "Welcher Schritt eroeffnet den Ablauf von „{title}“ sinnvoll?",
    "Welcher Einstieg passt bei „{title}“ als erster Schritt?",
)

ORDERING_LAST_PROMPTS = (
    "Welcher Schritt schliesst „{title}“ fachlich sinnvoll ab?",
    "Womit endet der Ablauf von „{title}“ in einer belastbaren Reihenfolge?",
    "Welcher Schritt steht bei „{title}“ ganz am Ende?",
)

SHORT_TEXT_COMPONENT_PROMPTS = (
    "Welche Bausteine darf „{title}“ inhaltlich nicht auslassen?",
    "Welche Punkte muessen in einer belastbaren Fassung zu „{title}“ sichtbar werden?",
    "Welche Bestandteile gehoeren zwingend in eine gute Antwort zu „{title}“?",
)

SHORT_TEXT_SUMMARY_PROMPTS = (
    "Welche Verdichtung bringt den Kern von „{title}“ am besten auf den Punkt?",
    "Welche Kurzfassung deckt bei „{title}“ den erwarteten Kern am vollstaendigsten ab?",
    "Welche Zusammenfassung trifft fuer „{title}“ den fachlichen Kern am treffsichersten?",
)

NUMBER_FORMULA_PROMPTS = (
    "Welcher Rechenweg bildet „{title}“ fachlich korrekt ab?",
    "Mit welcher Rechnung laesst sich bei „{title}“ der gesuchte Wert richtig bestimmen?",
    "Welche Rechnung passt in „{title}“ zum beschriebenen Zahlenproblem?",
)

NUMBER_INTERPRETATION_PROMPTS = (
    "Welche Aussage deutet das Ergebnis von „{title}“ fachlich richtig?",
    "Welche Formulierung beschreibt bei „{title}“ den berechneten Wert korrekt?",
    "Welche Aussage fasst bei „{title}“ die Bedeutung des Ergebnisses am besten zusammen?",
)

SHORT_TEXT_DISTRACTORS: tuple[tuple[str, str], ...] = (
    (
        "Eine bewusst vage Formulierung, damit spaetere Festlegungen offenbleiben",
        "Belastbare Kurztexte schaffen Klarheit und nicht zusaetzliche Unbestimmtheit.",
    ),
    (
        "Vor allem technische Details sammeln, ohne den fachlichen Kern zu verdichten",
        "Detailtiefe ersetzt keine tragfaehige inhaltliche Struktur.",
    ),
    (
        "Nur positive Eindruecke betonen und offene Punkte ausblenden",
        "Lernwirksame Antworten benennen auch kritische Aspekte transparent.",
    ),
    (
        "Einzelwerte lose aufzahlen, ohne daraus eine nachvollziehbare Aussage abzuleiten",
        "Zahlen oder Fakten helfen erst, wenn sie in eine klare Aussage eingebettet sind.",
    ),
    (
        "Den Ist-Zustand schildern, aber Konsequenzen oder Anschlussfaehigkeit offenlassen",
        "Ohne Konsequenz oder Anschluss bleibt der Text fuer die weitere Steuerung zu schwach.",
    ),
)

OPTION_ORDER_VARIANTS: dict[int, tuple[tuple[int, ...], ...]] = {
    3: ((1, 0, 2), (2, 0, 1), (1, 2, 0)),
    4: ((1, 3, 0, 2), (2, 0, 3, 1), (3, 1, 0, 2), (2, 3, 1, 0)),
    5: ((2, 0, 4, 1, 3), (1, 4, 0, 2, 3), (3, 0, 2, 4, 1), (4, 1, 3, 0, 2)),
}

SHORT_TEXT_VARIANTS: dict[str, dict[str, Any]] = {
    "ticket_ausbildungsbetrieb_bewertung_reflexion/ticket08_V01_ausbildungsbetrieb_bewertung_reflexion.json#q5": {
        "variant_key": "abschlussnotiz_kern_v1",
        "title": "Abschlussnotiz fachlich zuspitzen",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "prompt": "Welche Fassung beschreibt eine belastbare Projektabschlussnotiz am treffendsten?",
        "options": [
            {
                "text": "Sie zeigt den Stand der Zielerreichung, benennt eine Hauptursache fuer Abweichungen und leitet daraus eine konkrete Verbesserung fuer Folgeprojekte ab.",
                "correct": True,
                "explanation": "So wird der Abschluss nicht nur beschrieben, sondern fachlich ausgewertet und fuer kuenftige Projekte nutzbar gemacht.",
            },
            {
                "text": "Sie haelt nur fest, dass das Team viel gelernt hat, und verzichtet auf die Analyse der Zielabweichung.",
                "correct": False,
                "explanation": "Ohne Ursache und Verbesserung bleibt die Reflexion zu allgemein und hilft fuer die naechste Iteration kaum weiter.",
            },
            {
                "text": "Sie konzentriert sich auf positive Stimmung im Team und spart die Projektergebnisse bewusst aus.",
                "correct": False,
                "explanation": "Eine Abschlussnotiz muss das Ergebnis bewerten und darf nicht auf Atmosphaere statt Sachstand ausweichen.",
            },
            {
                "text": "Sie wiederholt den urspruenglichen Projektplan, ohne die reale Umsetzung oder Abweichungen zu betrachten.",
                "correct": False,
                "explanation": "Gerade der Soll-Ist-Abgleich macht den Abschluss belastbar; ein Planrueckblick allein reicht nicht.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q05": {
        "variant_key": "startbriefing_bestandteile_v1",
        "title": "Startbriefing inhaltlich absichern",
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "prompt": "Welche Bestandteile machen ein Startbriefing fuer den Auftraggeber belastbar?",
        "options": [
            {
                "text": "Ein klares Zielbild des Vorhabens",
                "correct": True,
                "explanation": "Der Auftraggeber muss verstehen, worauf das Projekt inhaltlich zielt.",
            },
            {
                "text": "Ein grober Plan mit erster Struktur fuer die Umsetzung",
                "correct": True,
                "explanation": "Ein belastbarer Start braucht einen nachvollziehbaren Weg und nicht nur eine Absichtserklaerung.",
            },
            {
                "text": "Ein benanntes Restrisiko oder ein offener Unsicherheitsfaktor",
                "correct": True,
                "explanation": "Ein gutes Briefing verschweigt Unsicherheiten nicht, sondern macht sie steuerbar.",
            },
            {
                "text": "Eine feste Zusage fuer alle Detailtermine ohne Aufwandsschaetzung",
                "correct": False,
                "explanation": "Verbindlichkeit entsteht nicht durch ungesicherte Terminversprechen, sondern durch transparente Planung.",
            },
            {
                "text": "Ein Sammelsurium technischer Einzelloesungen ohne Bezug zum Auftrag",
                "correct": False,
                "explanation": "Das Briefing muss vom Ziel und der Projektlogik ausgehen, nicht von losen Detailideen.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q13": {
        "variant_key": "budgetanpassung_entscheidung_v1",
        "title": "Budgetanpassung klar begruenden",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "prompt": "Welche Begruendung macht eine Plananpassung unter Budgetdeckel am tragfaehigsten?",
        "options": [
            {
                "text": "Wir priorisieren Muss-Themen, stellen den Nutzen der verbleibenden Pakete gegenueber und machen die Budgetfolge der Verschiebungen sichtbar.",
                "correct": True,
                "explanation": "So wird die Entscheidung sachlich an Nutzen, Prioritaet und Budgetwirkung ausgerichtet.",
            },
            {
                "text": "Wir kuerzen quer durch alle Pakete, damit jede Fachseite wenigstens ein bisschen beruecksichtigt wird.",
                "correct": False,
                "explanation": "Ohne Priorisierung sinkt die Wirksamkeit der Anpassung und die Entscheidung bleibt schwer nachvollziehbar.",
            },
            {
                "text": "Wir verschieben die Kostenbetrachtung auf spaeter und halten den bisherigen Plan zunaechst unveraendert.",
                "correct": False,
                "explanation": "Gerade bei einem Budgetdeckel muessen Kostenwirkung und Plananpassung frueh zusammen betrachtet werden.",
            },
            {
                "text": "Wir streichen zuerst die Abstimmung mit dem Auftraggeber, weil sie keine direkte Entwicklungszeit liefert.",
                "correct": False,
                "explanation": "Ohne abgestimmte Entscheidung steigt das Risiko, am Bedarf vorbei zu priorisieren.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q19": {
        "variant_key": "blockerstatus_bestandteile_v1",
        "title": "Blockerstatus anschlussfaehig machen",
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "prompt": "Welche Punkte darf eine belastbare Blocker-Statusmeldung nicht auslassen?",
        "options": [
            {
                "text": "Das Problem oder den Blocker klar benennen",
                "correct": True,
                "explanation": "Nur ein klar beschriebenes Problem ermoeglicht eine gerichtete Entscheidung.",
            },
            {
                "text": "Die konkrete Auswirkung auf Lieferobjekt, Termin oder Risiko darstellen",
                "correct": True,
                "explanation": "Die Bedeutung des Blockers wird erst durch seine Wirkung auf das Projekt greifbar.",
            },
            {
                "text": "Eine priorisierte naechste Aktion oder Entscheidungsbitte formulieren",
                "correct": True,
                "explanation": "Statuskommunikation bleibt nur dann handlungsfaehig, wenn daraus ein naechster Schritt folgt.",
            },
            {
                "text": "Die Hoffnung ausdruecken, dass sich das Problem ohne weitere Massnahmen aufloest",
                "correct": False,
                "explanation": "Hoffnung ersetzt keine belastbare Steuerungsinformation.",
            },
            {
                "text": "Alle technischen Details ungefiltert in die Meldung kippen, damit nichts fehlt",
                "correct": False,
                "explanation": "Entscheidend ist eine steuerbare Verdichtung, nicht ein unstrukturierter Informationsblock.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q24": {
        "variant_key": "abschlussnotiz_abnahme_v1",
        "title": "Abnahme- und Reflexionsnotiz fokussieren",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "prompt": "Welche Fassung passt am besten zu einer belastbaren Abnahme- und Reflexionsnotiz?",
        "options": [
            {
                "text": "Sie zeigt den Stand der Zielerreichung, benennt einen offenen Punkt mit Risiko und endet mit einem verbindlichen naechsten Schritt.",
                "correct": True,
                "explanation": "Damit sind Ergebnis, Restpunkt und Steuerung fuer den weiteren Verlauf sauber verbunden.",
            },
            {
                "text": "Sie erklaert, dass das Projekt im Kern geschafft ist, und laesst offene Punkte bewusst weg, um die Abnahme nicht zu belasten.",
                "correct": False,
                "explanation": "Gerade Restpunkte und ihre Risiken muessen fuer eine ehrliche Abnahme sichtbar bleiben.",
            },
            {
                "text": "Sie konzentriert sich auf die technische Eleganz der Loesung und spart den Kundennutzen aus.",
                "correct": False,
                "explanation": "Eine Abschlussnotiz muss am Auftragsergebnis ausgerichtet sein, nicht nur an der Technik.",
            },
            {
                "text": "Sie wiederholt die Testdokumentation wortgleich und verzichtet auf einen Ausblick.",
                "correct": False,
                "explanation": "Die Notiz soll Teststand, Restpunkt und weiteren Weg zusammenziehen statt nur Artefakte zu wiederholen.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_planung_wirtschaftlichkeit/ticket04_V01_ausbildungsbetrieb_planung_wirtschaftlichkeit.json#q5": {
        "variant_key": "wirtschaftlichkeitsnotiz_entscheidung_v1",
        "title": "Wirtschaftlichkeitsnotiz entscheidungsfaehig machen",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "prompt": "Welche Aussage passt am besten in eine belastbare Wirtschaftlichkeitsnotiz?",
        "options": [
            {
                "text": "Sie stellt Kosten und Nutzen gegenueber, nennt ein relevantes Risiko und endet mit einem klaren Entscheidungsvorschlag.",
                "correct": True,
                "explanation": "Eine Wirtschaftlichkeitsnotiz braucht ein sachliches Bild und eine ableitbare Entscheidung.",
            },
            {
                "text": "Sie benennt nur die Gesamtsumme, weil Nutzenbetrachtungen spaeter nachgereicht werden koennen.",
                "correct": False,
                "explanation": "Kosten allein sagen nichts ueber die Sinnhaftigkeit einer Projektentscheidung aus.",
            },
            {
                "text": "Sie empfiehlt das teuerste Vorgehen, um Reserven fuer moegliche Aenderungen offen zu halten.",
                "correct": False,
                "explanation": "Mehrkosten sind nur dann plausibel, wenn sie durch Nutzen oder Risikoabsicherung begruendet werden.",
            },
            {
                "text": "Sie vermeidet einen Entscheidungsvorschlag, damit sich keine Seite frueh festlegen muss.",
                "correct": False,
                "explanation": "Gerade der Vorschlag macht die Notiz fuer die weitere Steuerung nutzbar.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_pm_organisation/ticket02_V01_ausbildungsbetrieb_pm_organisation.json#q5": {
        "variant_key": "projektorganisation_bestandteile_v1",
        "title": "Projektorganisation tragfaehig beschreiben",
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "prompt": "Welche Elemente gehoeren in eine kompakte, aber belastbare Beschreibung der Projektorganisation?",
        "options": [
            {
                "text": "Klare Rollen mit erkennbaren Verantwortungen",
                "correct": True,
                "explanation": "Nur mit klaren Rollen wird sichtbar, wer Entscheidungen vorbereitet oder trifft.",
            },
            {
                "text": "Kommunikationswege fuer Regelabstimmung und Informationsfluss",
                "correct": True,
                "explanation": "Organisation wird erst im Zusammenspiel der Rollen ueber Kommunikationswege wirksam.",
            },
            {
                "text": "Ein abgestimmter Eskalationsweg fuer stoerungsrelevante Themen",
                "correct": True,
                "explanation": "Ein Eskalationspfad macht die Projektorganisation auch unter Druck handlungsfaehig.",
            },
            {
                "text": "Die Annahme, dass das Team Unklarheiten im Zweifel spontan loest",
                "correct": False,
                "explanation": "Improvisation ersetzt keine belastbare Organisationslogik.",
            },
            {
                "text": "Eine Liste aller Tools ohne Bezug zu Rollen und Entscheidungen",
                "correct": False,
                "explanation": "Werkzeuge koennen helfen, aber sie definieren keine Projektorganisation.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_praesentation_loesung/ticket07_V01_ausbildungsbetrieb_praesentation_loesung.json#q5": {
        "variant_key": "praesentationsabschluss_kern_v1",
        "title": "Praesentationsabschluss wirksam formulieren",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "prompt": "Welche Aussage bildet einen belastbaren Praesentationsabschluss am besten ab?",
        "options": [
            {
                "text": "Sie fasst den Kernnutzen zusammen, benennt einen offenen Punkt transparent und schliesst mit einem verbindlichen naechsten Schritt.",
                "correct": True,
                "explanation": "So endet die Praesentation nicht nur mit einem Rueckblick, sondern mit einer anschlussfaehigen Entscheidungslage.",
            },
            {
                "text": "Sie betont vor allem die technische Raffinesse und spart offene Punkte aus, damit der Eindruck positiv bleibt.",
                "correct": False,
                "explanation": "Ein Abschluss muss Vertrauen durch Klarheit schaffen, nicht durch Weglassen kritischer Aspekte.",
            },
            {
                "text": "Sie wiederholt die Demo wortgleich, weil sich darin bereits alle naechsten Schritte verstecken.",
                "correct": False,
                "explanation": "Der Abschluss sollte verdichten und orientieren, nicht die komplette Praesentation wiederholen.",
            },
            {
                "text": "Sie verschiebt jede Festlegung auf spaetere Mails, um Diskussionen im Termin zu vermeiden.",
                "correct": False,
                "explanation": "Ohne naechsten Schritt verliert die Praesentation ihren steuernden Charakter.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_projektdurchfuehrung_steuerung/ticket05_V01_ausbildungsbetrieb_projektdurchfuehrung_steuerung.json#q5": {
        "variant_key": "statusmeldung_bestandteile_v1",
        "title": "Statusmeldung steuerbar machen",
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "prompt": "Welche Punkte machen eine Statusmeldung in der Projektdurchfuehrung belastbar?",
        "options": [
            {
                "text": "Ein klarer Stand zu Arbeitspaketen oder Lieferobjekten",
                "correct": True,
                "explanation": "Ohne konkreten Stand bleibt unklar, worueber eigentlich entschieden werden soll.",
            },
            {
                "text": "Ein priorisiertes Risiko mit erkennbarer Wirkung auf den Verlauf",
                "correct": True,
                "explanation": "Risiken muessen sichtbar werden, bevor sie Termine oder Lieferobjekte kippen.",
            },
            {
                "text": "Eine konkrete naechste Aktion oder ein benoetigter Beschluss",
                "correct": True,
                "explanation": "Erst der naechste Schritt macht die Statusmeldung handlungsfaehig.",
            },
            {
                "text": "Die pauschale Aussage, dass das Team alles im Griff hat",
                "correct": False,
                "explanation": "Pauschale Beruhigung ersetzt weder Sachstand noch Steuerungsinformation.",
            },
            {
                "text": "Ein ungefilterter Dump aller internen Chat-Nachrichten",
                "correct": False,
                "explanation": "Statusmeldungen muessen verdichten und priorisieren, nicht Rohmaterial weiterreichen.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_testen_dokumentieren/ticket06_V01_ausbildungsbetrieb_testen_dokumentieren.json#q5": {
        "variant_key": "abnahmeunterlagen_bestandteile_v1",
        "title": "Abnahmeunterlagen klar zusammenziehen",
        "interaction_type": "multi",
        "question_kind": "mehrere_richtige_antworten_waehlen",
        "prompt": "Welche Bestandteile sollten in einer knappen Zusammenfassung der Abnahmeunterlagen sichtbar werden?",
        "options": [
            {
                "text": "Ein Testprotokoll oder eine vergleichbare Uebersicht der durchgefuehrten Nachweise",
                "correct": True,
                "explanation": "Damit wird klar, worauf sich die Abnahme fachlich stuetzt.",
            },
            {
                "text": "Ein Restpunkt oder offener Befund mit erkennbarem Status",
                "correct": True,
                "explanation": "Auch offene Punkte gehoeren in ein ehrliches Abnahmebild.",
            },
            {
                "text": "Der Umfang der vorliegenden Dokumentation fuer Nutzung oder Betrieb",
                "correct": True,
                "explanation": "Abnahmefaehigkeit haengt auch daran, ob die Unterlagen die weitere Nutzung absichern.",
            },
            {
                "text": "Eine unverbindliche Zusage, dass spaeter sicher noch alles nachgeliefert wird",
                "correct": False,
                "explanation": "Belastbare Unterlagen bestehen aus Nachweisen und Restpunkten, nicht aus Vertrauensappellen.",
            },
            {
                "text": "Eine ausschliesslich interne Toolliste ohne Bezug zur Abnahme",
                "correct": False,
                "explanation": "Die Zusammenfassung muss fuer die Abnahme lesbar sein und nicht nur interne Werkzeuge aufzahlen.",
            },
        ],
    },
    "ticket_ausbildungsbetrieb_zielsetzung_auftrag/ticket03_V01_ausbildungsbetrieb_zielsetzung_auftrag.json#q5": {
        "variant_key": "zielbild_kern_v1",
        "title": "Zielbild kompakt absichern",
        "interaction_type": "single",
        "question_kind": "eine_richtige_antwort_waehlen",
        "prompt": "Welche Aussage beschreibt ein klares Zielbild mit Scope-Abgrenzung und Abnahmekriterium am besten?",
        "options": [
            {
                "text": "Es nennt das Projektziel, grenzt Nicht-Ziele explizit aus und formuliert mindestens ein messbares Abnahmekriterium.",
                "correct": True,
                "explanation": "So wird sichtbar, was geliefert werden soll, was bewusst nicht dazugehort und wie Erfolg geprueft wird.",
            },
            {
                "text": "Es bleibt bewusst offen, damit das Team spaeter flexibel entscheiden kann, was zum Auftrag gehoert.",
                "correct": False,
                "explanation": "Ohne Abgrenzung und Kriterium steigt das Risiko, den Auftrag waehrend der Umsetzung auszuweiten.",
            },
            {
                "text": "Es beschreibt vor allem die bevorzugte Technologie und spart Fachziel und Abnahmebild aus.",
                "correct": False,
                "explanation": "Technik ist Mittel zum Zweck; fuer das Zielbild sind Auftragsergebnis und Abnahme entscheidend.",
            },
            {
                "text": "Es verspricht einen moeglichst schnellen Abschluss, ohne Umfang oder Qualitaet genauer zu definieren.",
                "correct": False,
                "explanation": "Tempo ersetzt kein klares Ziel und keine pruefbare Erwartung.",
            },
        ],
    },
}

SHORT_TEXT_COMPONENT_LABELS: dict[str, list[str]] = {
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q05": [
        "Ein klares Zielbild",
        "ein belastbarer Planansatz",
        "ein benanntes Restrisiko",
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q13": [
        "Eine erkennbare Priorisierung",
        "ein klarer Nutzenbezug",
        "eine sichtbare Budgetkonsequenz in der Entscheidung",
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q19": [
        "Ein klarer Blockerstatus",
        "eine benannte Auswirkung",
        "ein handlungsfaehiger naechster Schritt",
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q24": [
        "Ein klarer Zielstand",
        "offene Punkte mit Risiko",
        "ein verbindlicher naechster Schritt",
    ],
    "ticket_ausbildungsbetrieb_pm_organisation/ticket02_V01_ausbildungsbetrieb_pm_organisation.json#q5": [
        "Ein klares Rollenbild",
        "eine nachvollziehbare Kommunikationslogik",
        "ein abgestimmter Eskalationsweg",
    ],
    "ticket_ausbildungsbetrieb_zielsetzung_auftrag/ticket03_V01_ausbildungsbetrieb_zielsetzung_auftrag.json#q5": [
        "Ein klares Ziel",
        "explizite Nicht-Ziele",
        "mindestens ein messbares Kriterium",
    ],
    "ticket_ausbildungsbetrieb_planung_wirtschaftlichkeit/ticket04_V01_ausbildungsbetrieb_planung_wirtschaftlichkeit.json#q5": [
        "Ein Kosten-Nutzen-Bild",
        "ein relevanter Risikohinweis",
        "ein klarer Entscheidungsvorschlag",
    ],
    "ticket_ausbildungsbetrieb_projektdurchfuehrung_steuerung/ticket05_V01_ausbildungsbetrieb_projektdurchfuehrung_steuerung.json#q5": [
        "Ein klarer Projektstand",
        "ein priorisiertes Risiko",
        "eine konkrete Folgeaktion",
    ],
    "ticket_ausbildungsbetrieb_testen_dokumentieren/ticket06_V01_ausbildungsbetrieb_testen_dokumentieren.json#q5": [
        "Vorliegende Testnachweise",
        "sichtbare Restpunkte",
        "ein klarer Dokumentationsumfang",
    ],
    "ticket_ausbildungsbetrieb_praesentation_loesung/ticket07_V01_ausbildungsbetrieb_praesentation_loesung.json#q5": [
        "Ein adressatengerechter Abschluss mit Nutzen",
        "ein transparenter Restpunkt",
        "eine verbindliche Folgeaktion",
    ],
    "ticket_ausbildungsbetrieb_bewertung_reflexion/ticket08_V01_ausbildungsbetrieb_bewertung_reflexion.json#q5": [
        "Ein klares Abschlussbild",
        "eine benannte Ursache",
        "ein konkreter Verbesserungshebel",
    ],
}

NUMBER_COMPANIONS: dict[str, list[dict[str, Any]]] = {
    "ticket_ausbildungsbetrieb_bewertung_reflexion/ticket08_V01_ausbildungsbetrieb_bewertung_reflexion.json#q4": [
        {
            "variant_key": "zielerreichung_anzahl_v1",
            "title": "Erreichte Ziele aus Quote ableiten",
            "prompt": "Die Zielerreichung liegt bei 85 Prozent und es wurden insgesamt 20 Projektziele vereinbart. Wie viele Ziele wurden voll erreicht?",
            "options": [
                ("17 Ziele", True, "85 Prozent von 20 entsprechen 17 voll erreichten Zielen."),
                ("15 Ziele", False, "15 von 20 entspraechen nur 75 Prozent und waeren damit zu niedrig."),
                ("18 Ziele", False, "18 von 20 entspraechen 90 Prozent und liegen ueber der angegebenen Quote."),
                ("3 Ziele", False, "3 beschreibt nur die nicht voll erreichten Ziele und passt nicht zur Frage."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q04": [
        {
            "variant_key": "startpaket_stunden_v1",
            "title": "Analysestunden aus Gesamtbudget ableiten",
            "prompt": "Das Startpaket kostet insgesamt 1088 EUR. Wenn der Satz 68 EUR pro Stunde betraegt, wie viele Analysestunden sind eingeplant?",
            "options": [
                ("16 Stunden", True, "1088 EUR geteilt durch 68 EUR pro Stunde ergeben 16 Stunden."),
                ("12 Stunden", False, "12 Stunden wuerden bei 68 EUR pro Stunde nur 816 EUR ergeben."),
                ("18 Stunden", False, "18 Stunden waeren mit 1224 EUR zu teuer fuer das genannte Paket."),
                ("20 Stunden", False, "20 Stunden wuerden 1360 EUR kosten und passen nicht zum Gesamtbudget."),
            ],
        },
        {
            "variant_key": "startpaket_kostensenkung_v1",
            "title": "Kostenwirkung einer gekuerzten Analyse schaetzen",
            "prompt": "Wenn im Startpaket 4 der 16 Analysestunden entfallen und der Satz bei 68 EUR bleibt, um wie viele EUR sinken die Kosten?",
            "options": [
                ("272 EUR", True, "4 Stunden mal 68 EUR pro Stunde ergeben eine Entlastung von 272 EUR."),
                ("204 EUR", False, "204 EUR entspraechen nur 3 Stunden zu 68 EUR."),
                ("340 EUR", False, "340 EUR waeren 5 Stunden zu 68 EUR und damit zu hoch."),
                ("816 EUR", False, "816 EUR sind die Kosten fuer 12 Stunden, nicht die Differenz der kuerzung."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q08": [
        {
            "variant_key": "scopeaufschlag_stunden_v1",
            "title": "Zusatzstunden aus Mehrkosten ableiten",
            "prompt": "Der Zusatzaufwand fuer die Zielaenderung betraegt 648 EUR. Bei 72 EUR pro Stunde: Wie viele Zusatzstunden stecken dahinter?",
            "options": [
                ("9 Stunden", True, "648 EUR geteilt durch 72 EUR pro Stunde ergeben 9 Zusatzstunden."),
                ("8 Stunden", False, "8 Stunden waeren nur 576 EUR und damit zu niedrig."),
                ("10 Stunden", False, "10 Stunden wuerden 720 EUR kosten und damit ueber dem Betrag liegen."),
                ("12 Stunden", False, "12 Stunden entspraechen 864 EUR und passen nicht zum Zusatzaufwand."),
            ],
        },
        {
            "variant_key": "scopeaufschlag_neuer_betrag_v1",
            "title": "Reduzierte Zusatzstunden neu kalkulieren",
            "prompt": "Von den 9 Zusatzstunden koennen 3 Stunden entfallen. Wie hoch ist der neue Zusatzaufwand bei unveraendert 72 EUR pro Stunde?",
            "options": [
                ("432 EUR", True, "6 verbleibende Stunden mal 72 EUR ergeben 432 EUR."),
                ("216 EUR", False, "216 EUR entspraechen nur 3 Stunden und ignorieren den verbleibenden Rest."),
                ("504 EUR", False, "504 EUR waeren 7 Stunden zu 72 EUR und damit zu hoch."),
                ("576 EUR", False, "576 EUR entspraechen 8 Stunden und nicht den verbleibenden 6 Stunden."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q12": [
        {
            "variant_key": "sprintkosten_teilpaket_v1",
            "title": "Fehlendes Arbeitspaket aus Gesamtsumme ableiten",
            "prompt": "Die drei Arbeitspakete kosten zusammen 6540 EUR. Zwei Pakete liegen bei 2150 EUR und 1980 EUR. Wie teuer ist das dritte Paket?",
            "options": [
                ("2410 EUR", True, "6540 EUR minus 2150 EUR minus 1980 EUR ergeben 2410 EUR fuer das dritte Paket."),
                ("1980 EUR", False, "1980 EUR ist bereits eines der bekannten Pakete und kann nicht nochmals die Restsumme sein."),
                ("2150 EUR", False, "2150 EUR ist ebenfalls schon vergeben und ergibt die Restsumme nicht."),
                ("4560 EUR", False, "4560 EUR waeren die Gesamtkosten ohne das mittlere Paket, nicht die Kosten des fehlenden Pakets."),
            ],
        },
        {
            "variant_key": "sprintkosten_ohne_guenstigstes_paket_v1",
            "title": "Gesamtkosten nach Paketstreichung pruefen",
            "prompt": "Wenn das guenstigste der drei Arbeitspakete mit 1980 EUR entfellt, wie hoch sind die verbleibenden Gesamtkosten?",
            "options": [
                ("4560 EUR", True, "6540 EUR minus 1980 EUR ergeben 4560 EUR Restkosten."),
                ("4390 EUR", False, "4390 EUR entstehen nicht aus der genannten Differenz und sind zu niedrig."),
                ("2410 EUR", False, "2410 EUR beschreiben nur eines der Pakete, nicht die verbleibende Gesamtsumme."),
                ("6540 EUR", False, "Die Gesamtsumme veraendert sich natuerlich, wenn ein Paket entfaellt."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q17": [
        {
            "variant_key": "pufferzeit_gesamtaufwand_v1",
            "title": "Neuen Gesamtaufwand aus Zusatzbedarf bestimmen",
            "prompt": "Es waren 42 Stunden geplant und es kommen 5 Zusatzstunden hinzu. Wie hoch ist der neue Gesamtaufwand?",
            "options": [
                ("47 Stunden", True, "42 geplante Stunden plus 5 Zusatzstunden ergeben 47 Stunden Gesamtaufwand."),
                ("45 Stunden", False, "45 Stunden entspraechen nur 3 Zusatzstunden und sind daher zu niedrig."),
                ("52 Stunden", False, "52 Stunden waeren eine Ueberschaetzung des Zusatzbedarfs."),
                ("37 Stunden", False, "37 Stunden waeren sogar weniger als der urspruengliche Plan und passen nicht zum Zusatzbedarf."),
            ],
        },
        {
            "variant_key": "pufferzeit_begrenzter_mehraufwand_v1",
            "title": "Begrenzten Zusatzbedarf neu rechnen",
            "prompt": "Wenn der Zusatzbedarf statt 5 nur 3 Stunden betraegt und die Planung bei 42 Stunden bleibt, wie hoch waere der neue Aufwand?",
            "options": [
                ("45 Stunden", True, "42 Stunden plus 3 Zusatzstunden ergeben 45 Stunden Gesamtaufwand."),
                ("44 Stunden", False, "44 Stunden wuerden nur 2 Zusatzstunden beruecksichtigen."),
                ("47 Stunden", False, "47 Stunden entsprechen dem urspruenglichen groesseren Zusatzbedarf von 5 Stunden."),
                ("39 Stunden", False, "39 Stunden liegen unter dem Plan und koennen kein neuer Gesamtaufwand sein."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_kundenprojekt_serviceportal/ticket01_V01_ausbildungsbetrieb_kundenprojekt_serviceportal.json#q23": [
        {
            "variant_key": "testabdeckung_resttests_v1",
            "title": "Nicht abgeschlossene Tests beziffern",
            "prompt": "Von 28 geplanten Abnahmetests wurden 25 erfolgreich abgeschlossen. Wie viele Tests sind noch nicht erfolgreich abgeschlossen?",
            "options": [
                ("3 Tests", True, "28 geplante minus 25 erfolgreiche Tests ergeben 3 noch offene oder fehlgeschlagene Tests."),
                ("2 Tests", False, "2 waeren zu wenig; es fehlen tatsaechlich 3 Tests bis zum Vollstand."),
                ("4 Tests", False, "4 waeren zu viel und wuerden den erfolgreichen Stand unterschlagen."),
                ("25 Tests", False, "25 beschreibt die bereits erfolgreichen Tests und nicht den Rest."),
            ],
        },
        {
            "variant_key": "testabdeckung_neue_quote_v1",
            "title": "Verbesserte Erfolgsquote beurteilen",
            "prompt": "Wenn statt 25 nun 27 von 28 Abnahmetests erfolgreich waeren, wie hoch laege die Erfolgsquote gerundet?",
            "options": [
                ("96 Prozent", True, "27 durch 28 ergeben rund 96,43 Prozent und damit gerundet 96 Prozent."),
                ("93 Prozent", False, "93 Prozent waeren zu niedrig fuer 27 erfolgreiche Tests."),
                ("89 Prozent", False, "89 Prozent ist die alte Quote bei 25 erfolgreichen Tests."),
                ("100 Prozent", False, "100 Prozent waeren nur bei 28 erfolgreichen Tests erreicht."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_planung_wirtschaftlichkeit/ticket04_V01_ausbildungsbetrieb_planung_wirtschaftlichkeit.json#q4": [
        {
            "variant_key": "kalkulationssumme_dokuanteil_v1",
            "title": "Dokumentationsanteil aus Gesamtsumme ableiten",
            "prompt": "Die Gesamtsumme liegt bei 6200 EUR. Analyse, Umsetzung und Test kosten zusammen 5660 EUR. Wie hoch ist der Anteil fuer die Dokumentation?",
            "options": [
                ("540 EUR", True, "6200 EUR minus 5660 EUR ergeben 540 EUR fuer die Dokumentation."),
                ("980 EUR", False, "980 EUR gehoeren bereits zum Test und sind nicht der Restbetrag."),
                ("620 EUR", False, "620 EUR unterschreiten den benoetigten Dokumentationsanteil."),
                ("1260 EUR", False, "1260 EUR entsprechen dem Analyseanteil und nicht der fehlenden Restsumme."),
            ],
        },
        {
            "variant_key": "kalkulationssumme_mit_kuerzerer_doku_v1",
            "title": "Neue Gesamtsumme nach schlankerer Dokumentation berechnen",
            "prompt": "Analyse, Umsetzung und Test bleiben bei 1260 EUR, 3420 EUR und 980 EUR. Wenn die Dokumentation von 540 EUR auf 420 EUR sinkt, wie hoch ist die neue Gesamtsumme?",
            "options": [
                ("6080 EUR", True, "1260 EUR plus 3420 EUR plus 980 EUR plus 420 EUR ergeben 6080 EUR."),
                ("5960 EUR", False, "5960 EUR waeren zu niedrig und lassen 120 EUR zu viel verschwinden."),
                ("6200 EUR", False, "6200 EUR ist die alte Gesamtsumme vor der Reduktion der Dokumentation."),
                ("5540 EUR", False, "5540 EUR unterschlagen einen Teil der unveraenderten Arbeitspakete."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_pm_organisation/ticket02_V01_ausbildungsbetrieb_pm_organisation.json#q4": [
        {
            "variant_key": "meetingaufwand_statusanteil_v1",
            "title": "Statusmeeting-Anteil aus Gesamtaufwand bestimmen",
            "prompt": "Insgesamt fallen pro Woche 115 Minuten Meetingzeit an, davon 40 Minuten fuer das Risiko-Review. Wie viele Minuten entfallen zusammen auf die drei Statusmeetings?",
            "options": [
                ("75 Minuten", True, "115 Minuten gesamt minus 40 Minuten Risiko-Review ergeben 75 Minuten fuer die Statusmeetings."),
                ("65 Minuten", False, "65 Minuten waeren zu wenig und wuerden die Summe nicht erreichen."),
                ("85 Minuten", False, "85 Minuten waeren zu hoch, weil dann die Gesamtzeit ueber 115 Minuten laege."),
                ("25 Minuten", False, "25 Minuten entsprechen nur einem einzelnen Statusmeeting."),
            ],
        },
        {
            "variant_key": "meetingaufwand_gekuerztes_review_v1",
            "title": "Gesamtmeetingzeit nach gekuerztem Review neu rechnen",
            "prompt": "Wenn das Risiko-Review statt 40 nur 30 Minuten dauert und die drei Statusmeetings bei je 25 Minuten bleiben, wie viele Minuten fallen pro Woche insgesamt an?",
            "options": [
                ("105 Minuten", True, "3 Statusmeetings zu je 25 Minuten ergeben 75 Minuten; plus 30 Minuten Review sind es 105 Minuten."),
                ("100 Minuten", False, "100 Minuten wuerden die drei Statusmeetings oder das verkuerzte Review zu niedrig ansetzen."),
                ("95 Minuten", False, "95 Minuten liegen unter der korrekten Summe aus 75 und 30 Minuten."),
                ("115 Minuten", False, "115 Minuten waeren weiterhin der alte Wert mit 40 Minuten Review."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_praesentation_loesung/ticket07_V01_ausbildungsbetrieb_praesentation_loesung.json#q4": [
        {
            "variant_key": "vortragszeit_demoanteil_v1",
            "title": "Demozeit aus dem Praesentationsslot ableiten",
            "prompt": "Der gesamte Praesentationsslot dauert 35 Minuten. Davon entfallen 12 Minuten auf Kontext und 8 Minuten auf Fragen. Wie lang bleibt die Demo?",
            "options": [
                ("15 Minuten", True, "35 Minuten minus 12 Minuten Kontext minus 8 Minuten Fragen ergeben 15 Minuten fuer die Demo."),
                ("13 Minuten", False, "13 Minuten waeren zu kurz und wuerden den Gesamtslot nicht vollstaendig ausfuellen."),
                ("17 Minuten", False, "17 Minuten waeren zu lang und wuerden den Slot ueberschreiten."),
                ("23 Minuten", False, "23 Minuten lassen die Fragezeit unberuecksichtigt und sind daher falsch."),
            ],
        },
        {
            "variant_key": "vortragszeit_laengere_demo_v1",
            "title": "Gesamtslot bei laengerer Demo neu kalkulieren",
            "prompt": "Wenn der Kontext bei 12 Minuten und die Fragen bei 8 Minuten bleiben, die Demo aber 18 Minuten dauert: Wie lang ist dann der gesamte Praesentationsslot?",
            "options": [
                ("38 Minuten", True, "12 Minuten Kontext plus 18 Minuten Demo plus 8 Minuten Fragen ergeben 38 Minuten."),
                ("35 Minuten", False, "35 Minuten waeren weiterhin der alte Slot mit 15 Minuten Demo."),
                ("30 Minuten", False, "30 Minuten unterschlagen einen Teil des Slots."),
                ("26 Minuten", False, "26 Minuten decken nicht einmal Kontext und Demo vollstaendig ab."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_projektdurchfuehrung_steuerung/ticket05_V01_ausbildungsbetrieb_projektdurchfuehrung_steuerung.json#q4": [
        {
            "variant_key": "meilensteinquote_erreichte_anzahl_v1",
            "title": "Termingerechte Meilensteine aus Quote absichern",
            "prompt": "Die Terminquote liegt gerundet bei 77 Prozent und es gab insgesamt 13 geplante Meilensteine. Wie viele wurden im Termin erreicht?",
            "options": [
                ("10 Meilensteine", True, "10 von 13 entsprechen rund 76,92 Prozent und damit gerundet 77 Prozent."),
                ("9 Meilensteine", False, "9 von 13 entspraechen nur rund 69 Prozent und waeren zu niedrig."),
                ("11 Meilensteine", False, "11 von 13 waeren mit rund 85 Prozent deutlich hoeher."),
                ("3 Meilensteine", False, "3 beschreibt eher den Rest und nicht die termingerechte Anzahl."),
            ],
        },
        {
            "variant_key": "meilensteinquote_verpasste_anzahl_v1",
            "title": "Verpasste Meilensteine aus Gesamtzahl bestimmen",
            "prompt": "Von 13 geplanten Meilensteinen wurden 10 im Termin erreicht. Wie viele Meilensteine wurden damit nicht im Termin erreicht?",
            "options": [
                ("3 Meilensteine", True, "13 geplante minus 10 termingerechte Meilensteine ergeben 3 verpasste Termine."),
                ("2 Meilensteine", False, "2 Meilensteine waeren zu wenig, weil dann 11 statt 10 im Termin waeren."),
                ("10 Meilensteine", False, "10 beschreibt die termingerechten und nicht die verspaeteten Meilensteine."),
                ("23 Meilensteine", False, "23 liegt ueber der Gesamtzahl und kann nicht stimmen."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_testen_dokumentieren/ticket06_V01_ausbildungsbetrieb_testen_dokumentieren.json#q4": [
        {
            "variant_key": "fehlerquote_erfolgreiche_tests_v1",
            "title": "Erfolgreiche Tests aus Fehlerquote erschliessen",
            "prompt": "Von 40 Testfaellen schlagen 6 fehl. Wie viele Testfaelle waren damit erfolgreich?",
            "options": [
                ("34 Testfaelle", True, "40 Gesamtfaelle minus 6 Fehlfaelle ergeben 34 erfolgreiche Testfaelle."),
                ("30 Testfaelle", False, "30 waeren zu wenig und unterschlagen erfolgreiche Tests."),
                ("36 Testfaelle", False, "36 waeren nur dann richtig, wenn 4 statt 6 Testfaelle fehlgeschlagen waeren."),
                ("15 Testfaelle", False, "15 ist die Fehlerquote in Prozent und keine Anzahl erfolgreicher Faelle."),
            ],
        },
        {
            "variant_key": "fehlerquote_reduzierter_fehleranteil_v1",
            "title": "Verbesserte Fehlerquote nach weniger Fehlfaellen beurteilen",
            "prompt": "Wenn von 40 Testfaellen nur noch 4 statt 6 fehlschlagen, wie hoch waere die Fehlerquote in Prozent?",
            "options": [
                ("10 Prozent", True, "4 von 40 entsprechen 10 Prozent Fehlerquote."),
                ("4 Prozent", False, "4 Prozent waeren die Anzahl der Fehlfaelle ohne Bezug zur Gesamtmenge."),
                ("12 Prozent", False, "12 Prozent waeren zu hoch fuer 4 von 40 Testfaellen."),
                ("90 Prozent", False, "90 Prozent beschreiben die Erfolgsquote und nicht die Fehlerquote."),
            ],
        },
    ],
    "ticket_ausbildungsbetrieb_zielsetzung_auftrag/ticket03_V01_ausbildungsbetrieb_zielsetzung_auftrag.json#q4": [
        {
            "variant_key": "anforderungsumfang_kannanteil_v1",
            "title": "Kann-Anforderungen aus Gesamtumfang ableiten",
            "prompt": "Es gibt insgesamt 23 Anforderungen, davon 14 Muss-Anforderungen. Wie viele Kann-Anforderungen sind erfasst?",
            "options": [
                ("9 Anforderungen", True, "23 gesamt minus 14 Muss-Anforderungen ergeben 9 Kann-Anforderungen."),
                ("7 Anforderungen", False, "7 wuerden die Gesamtsumme unterschreiten."),
                ("14 Anforderungen", False, "14 beschreibt den Muss-Anteil und nicht die Kann-Seite."),
                ("23 Anforderungen", False, "23 ist der Gesamtumfang und nicht nur der Kann-Anteil."),
            ],
        },
        {
            "variant_key": "anforderungsumfang_reduzierter_kannanteil_v1",
            "title": "Restumfang nach gestrichenen Kann-Anforderungen bestimmen",
            "prompt": "Im Backlog stehen 14 Muss- und 9 Kann-Anforderungen. Wenn 2 Kann-Anforderungen gestrichen werden, wie viele Anforderungen bleiben insgesamt bestehen?",
            "options": [
                ("21 Anforderungen", True, "23 Gesamtanforderungen minus 2 gestrichene Kann-Anforderungen ergeben 21 verbleibende Anforderungen."),
                ("19 Anforderungen", False, "19 Anforderungen waeren nur dann richtig, wenn 4 statt 2 Eintraege entfallen wuerden."),
                ("11 Anforderungen", False, "11 Anforderungen unterschlagen den Muss-Anteil und passen nicht zum Backlog."),
                ("25 Anforderungen", False, "25 Anforderungen wuerden den Umfang vergroessern statt verringern."),
            ],
        },
    ],
}


def transliterate_ascii_umlauts(match: re.Match[str]) -> str:
    word = match.group(0)
    word = (
        word.replace("AE", "Ä")
        .replace("Ae", "Ä")
        .replace("ae", "ä")
        .replace("OE", "Ö")
        .replace("Oe", "Ö")
        .replace("oe", "ö")
    )
    word = re.sub(r"(?<![AEIOUaeiouÄÖÜäöüQq])UE", "Ü", word)
    word = re.sub(r"(?<![AEIOUaeiouÄÖÜäöüQq])Ue", "Ü", word)
    word = re.sub(r"(?<![AEIOUaeiouÄÖÜäöüQq])ue", "ü", word)
    return word


def normalize_visible_text(value: Any) -> str:
    text = base_normalize_visible_text(value)
    for source, target in LF12_VISIBLE_REPLACEMENTS:
        text = text.replace(source, target)
    text = VISIBLE_WORD_RE.sub(transliterate_ascii_umlauts, text)
    for source, target in LF12_POST_TRANSLITERATION_FIXES:
        text = text.replace(source, target)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def normalize_pool_slug(folder_name: str) -> str:
    slug = folder_name.removeprefix("ticket_").strip("_")
    return slug.replace("_", "-")


def normalize_answer(value: str) -> str:
    return normalize_visible_text(value).casefold()


def normalize_prompt(value: Any) -> str:
    prompt = normalize_visible_text(value)
    prompt = re.sub(r"\s*\((Mehrfachauswahl|Mehrfachwahl)\)\s*$", "", prompt)
    return prompt.strip()


def build_concept_key(pool_slug: str, title: str) -> str:
    return f"lf12fiae::{pool_slug}::{slugify_visible_text(title)}"


def badge_label_for_interaction(interaction_type: str) -> str:
    return BADGE_LABEL_BY_INTERACTION.get(str(interaction_type or "").strip(), "Aufgabe")


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


def build_option_records(
    option_specs: list[dict[str, Any]],
    source_ref: str,
) -> tuple[list[dict[str, Any]], int]:
    records: list[dict[str, Any]] = []
    correct_count = 0

    for option_index, option in enumerate(option_specs, start=1):
        text = normalize_visible_text(option.get("text", ""))
        explanation = normalize_visible_text(option.get("explanation", ""))
        if not text:
            raise ValueError(f"Leere Option in {source_ref}.")
        validate_visible_texts([text, explanation])
        is_correct = 1 if option.get("correct") else 0
        correct_count += is_correct
        records.append(
            {
                "source_option_id": str(option.get("id") or option_index),
                "option_key": f"OPT{option_index}",
                "sort_order": option_index,
                "text": text,
                "explanation": explanation,
                "is_correct": is_correct,
            }
        )

    return records, correct_count


def build_choice_question(
    *,
    source_ref: str,
    concept_key: str,
    variant_key: str,
    title: str,
    prompt: str,
    context: str,
    interaction_type: str,
    question_kind: str,
    option_specs: list[dict[str, Any]],
    progress_links: list[str],
) -> dict[str, Any]:
    options, correct_count = build_option_records(option_specs, source_ref)
    if interaction_type == "single" and correct_count != 1:
        raise ValueError(f"{source_ref} braucht genau eine richtige Antwort.")
    if interaction_type == "multi" and correct_count < 2:
        raise ValueError(f"{source_ref} braucht mindestens zwei richtige Antworten.")

    normalized_title = normalize_visible_text(title)
    normalized_prompt = normalize_prompt(prompt)
    normalized_context = normalize_visible_text(context)
    validate_visible_texts([normalized_title, normalized_prompt, normalized_context])

    return {
        "source_ref": source_ref,
        "source_question_id": source_ref.rsplit("#", 1)[-1],
        "concept_key": concept_key,
        "variant_key": variant_key,
        "title": normalized_title,
        "prompt": normalized_prompt,
        "context": normalized_context,
        "interaction_type": interaction_type,
        "question_kind": question_kind,
        "badge_label": badge_label_for_interaction(interaction_type),
        "max_selections": 1 if interaction_type == "single" else correct_count,
        "is_new": 0,
        "options": options,
        "sequence_items": [],
        "accepted_answers": [],
        "progress_links": progress_links,
    }


def render_followup_context(question: dict[str, Any]) -> str:
    title = normalize_visible_text(question.get("title", ""))
    body = normalize_visible_text(question.get("body", ""))
    subject = normalize_visible_text(question.get("subject", ""))
    parts = [part for part in (title, subject, body) if part]
    return " ".join(parts).strip()


def build_numeric_answers(expected: Any, prompt: str) -> list[dict[str, Any]]:
    answer_text = normalize_visible_text(expected)
    answers = [answer_text]
    prompt_text = normalize_visible_text(prompt)

    if "%" in prompt_text or "Prozent" in prompt_text:
        answers.extend([f"{answer_text} %", f"{answer_text} Prozent"])
    if "EUR" in prompt_text:
        answers.append(f"{answer_text} EUR")
    if "Stunden" in prompt_text:
        answers.append(f"{answer_text} Stunden")
    if "Minuten" in prompt_text:
        answers.append(f"{answer_text} Minuten")
    if "Anforderungen" in prompt_text:
        answers.append(f"{answer_text} Anforderungen")
    if "Tests" in prompt_text or "Testfaelle" in prompt_text:
        answers.append(f"{answer_text} Tests")
    if "Meilensteine" in prompt_text:
        answers.append(f"{answer_text} Meilensteine")
    if "Ziele" in prompt_text:
        answers.append(f"{answer_text} Ziele")

    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, raw_answer in enumerate(answers):
        normalized = normalize_answer(raw_answer)
        if normalized in seen:
            continue
        seen.add(normalized)
        records.append(
            {
                "answer_text": normalize_visible_text(raw_answer),
                "normalized_answer": normalized,
                "is_primary": 1 if not records else 0,
            }
        )

    return records


def build_base_question(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> dict[str, Any]:
    question_type = str(raw_question.get("type", "")).strip()
    question_meta = QUESTION_META_BY_TYPE[question_type]
    source_question_id = str(raw_question.get("id", "")).strip()
    source_ref = f"{scenario_rel_path}#{source_question_id}::base"
    title = normalize_visible_text(raw_question.get("title", ""))
    prompt = normalize_prompt(raw_question.get("prompt", ""))
    concept_key = build_concept_key(pool_slug, title)
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]

    if question_type in {"single_choice", "multi_select"}:
        correct_flags = get_correct_flags(raw_question)
        option_specs: list[dict[str, Any]] = []
        for index, option in enumerate(raw_question.get("options", []), start=1):
            option_specs.append(
                {
                    "id": str(index),
                    "text": option.get("text", ""),
                    "correct": correct_flags[index - 1],
                    "explanation": option.get("rationale") or option.get("explanation", ""),
                }
            )
        return build_choice_question(
            source_ref=source_ref,
            concept_key=concept_key,
            variant_key=f"{concept_key}::basis_v1",
            title=title,
            prompt=prompt,
            context=context,
            interaction_type=question_meta["interaction_type"],
            question_kind=question_meta["question_kind"],
            option_specs=option_specs,
            progress_links=progress_links,
        )

    if question_type == "ordering":
        items = [
            normalize_visible_text(item)
            for item in raw_question.get("correctOrder") or raw_question.get("items", [])
            if normalize_visible_text(item)
        ]
        if len(items) < 2:
            raise ValueError(f"Ordering-Frage {source_ref} hat zu wenige Schritte.")
        validate_visible_texts([title, prompt, context, *items])
        return {
            "source_ref": source_ref,
            "source_question_id": source_question_id,
            "concept_key": concept_key,
            "variant_key": f"{concept_key}::basis_v1",
            "title": title,
            "prompt": prompt,
            "context": normalize_visible_text(context),
            "interaction_type": question_meta["interaction_type"],
            "question_kind": question_meta["question_kind"],
            "badge_label": badge_label_for_interaction(question_meta["interaction_type"]),
            "max_selections": len(items),
            "is_new": 0,
            "options": [],
            "sequence_items": [
                {
                    "item_key": f"ITEM{index}",
                    "sort_order": index,
                    "text": item,
                }
                for index, item in enumerate(items, start=1)
            ],
            "accepted_answers": [],
            "progress_links": progress_links,
        }

    if question_type == "number":
        accepted_answers = build_numeric_answers(raw_question.get("expected", ""), prompt)
        validate_visible_texts([title, prompt, context])
        return {
            "source_ref": source_ref,
            "source_question_id": source_question_id,
            "concept_key": concept_key,
            "variant_key": f"{concept_key}::basis_v1",
            "title": title,
            "prompt": prompt,
            "context": normalize_visible_text(context),
            "interaction_type": question_meta["interaction_type"],
            "question_kind": question_meta["question_kind"],
            "badge_label": badge_label_for_interaction(question_meta["interaction_type"]),
            "max_selections": 1,
            "is_new": 0,
            "options": [],
            "sequence_items": [],
            "accepted_answers": accepted_answers,
            "progress_links": progress_links,
        }

    raise ValueError(f"Unbekannter Basistyp {question_type!r} in {scenario_rel_path}.")


def build_short_text_question(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    config = SHORT_TEXT_VARIANTS.get(source_key)
    if not config:
        raise ValueError(f"Keine Kurztext-Variante fuer {source_key} definiert.")

    title = normalize_visible_text(config["title"])
    prompt = normalize_prompt(config["prompt"])
    concept_key = build_concept_key(pool_slug, normalize_visible_text(raw_question.get("title", "")))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]

    return build_choice_question(
        source_ref=f"{source_key}::{config['variant_key']}",
        concept_key=concept_key,
        variant_key=f"{concept_key}::{config['variant_key']}",
        title=title,
        prompt=prompt,
        context=context,
        interaction_type=config["interaction_type"],
        question_kind=config["question_kind"],
        option_specs=config["options"],
        progress_links=progress_links,
    )


def reassemble_options(options: list[dict[str, Any]], order: list[int]) -> list[dict[str, Any]]:
    return [options[index] for index in order]


def pick_template(source_key: str, templates: tuple[str, ...]) -> str:
    if not templates:
        raise ValueError("Leere Template-Liste.")
    return templates[sum(ord(char) for char in source_key) % len(templates)]


def ensure_sentence(value: Any) -> str:
    text = normalize_visible_text(value).strip()
    if not text:
        return ""
    text = text[0].upper() + text[1:]
    if text[-1] not in ".!?":
        text += "."
    return text


def reorder_option_specs(source_key: str, option_specs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    orders = OPTION_ORDER_VARIANTS.get(len(option_specs))
    if not orders:
        return option_specs
    order = orders[sum(ord(char) for char in source_key) % len(orders)]
    return reassemble_options(option_specs, list(order))


def split_outline_components(outline: Any) -> list[str]:
    text = normalize_visible_text(outline).strip().rstrip(".")
    if not text:
        return []

    comma_parts = [part.strip() for part in text.split(",") if part.strip()]
    parts: list[str] = []

    if comma_parts:
        parts.extend(comma_parts[:-1])
        tail = comma_parts[-1]
    else:
        tail = text

    tail_parts = [part.strip() for part in re.split(r"\s+und\s+", tail) if part.strip()]
    if comma_parts:
        parts.extend(tail_parts)
    else:
        parts = tail_parts

    if len(parts) == 2 and " mit " in text:
        prefix, remainder = text.split(" mit ", 1)
        remainder_parts = [part.strip() for part in re.split(r"\s+und\s+", remainder) if part.strip()]
        if prefix.strip() and len(remainder_parts) >= 2:
            return [prefix.strip(), remainder_parts[0], remainder_parts[1]]

    return parts or [text]


def join_visible_list(parts: list[str]) -> str:
    cleaned: list[str] = []
    for part in parts:
        text = normalize_visible_text(part).strip().rstrip(".")
        if text:
            cleaned.append(text)

    if not cleaned:
        return ""
    if len(cleaned) == 1:
        return cleaned[0]
    if len(cleaned) == 2:
        return f"{cleaned[0]} und {cleaned[1]}"
    return f"{', '.join(cleaned[:-1])} und {cleaned[-1]}"


def join_quoted_list(parts: list[str]) -> str:
    return join_visible_list([f"„{part}“" for part in parts])


def build_outline_gap_statement(included: list[str], missing: list[str]) -> str:
    if len(included) == 1:
        return f"Sie betont vor allem „{included[0]}“, laesst aber {join_quoted_list(missing)} offen."
    return f"Sie verbindet {join_quoted_list(included)}, laesst aber {join_quoted_list(missing)} offen."


def collect_progress_links(raw_question: dict[str, Any]) -> list[str]:
    return [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]


def build_single_rationale_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    base_title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, base_title)
    progress_links = collect_progress_links(raw_question)
    correct_flags = get_correct_flags(raw_question)

    if sum(correct_flags) != 1:
        raise ValueError(f"Single-Choice-Begruendungsvariante braucht genau eine richtige Antwort in {source_key}.")

    option_specs: list[dict[str, Any]] = []
    for index, raw_option in enumerate(raw_question.get("options", [])):
        option_text = normalize_visible_text(raw_option.get("text", ""))
        rationale = ensure_sentence(
            raw_option.get("rationale") or raw_option.get("explanation") or raw_option.get("text", "")
        )
        is_correct = correct_flags[index]
        explanation = (
            f"Das erklaert treffend, warum „{option_text}“ hier die fachlich beste Entscheidung ist."
            if is_correct
            else f"Diese Begruendung gehoert zwar zu „{option_text}“, beschreibt aber gerade, warum die Option nicht traegt."
        )
        option_specs.append(
            {
                "text": rationale,
                "correct": is_correct,
                "explanation": explanation,
            }
        )

    return build_choice_question(
        source_ref=f"{source_key}::begruendung_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::begruendung_v1",
        title=f"{base_title}: Begruendung einordnen",
        prompt=pick_template(f"{source_key}::begruendung_prompt", SINGLE_RATIONALE_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(f"{source_key}::begruendung_options", option_specs),
        progress_links=progress_links,
    )


def build_multi_counterexample_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    base_title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, base_title)
    progress_links = collect_progress_links(raw_question)
    correct_flags = get_correct_flags(raw_question)

    true_options = [
        raw_option
        for raw_option, is_correct in zip(raw_question.get("options", []), correct_flags)
        if is_correct
    ]
    false_options = [
        raw_option
        for raw_option, is_correct in zip(raw_question.get("options", []), correct_flags)
        if not is_correct
    ]
    if len(true_options) < 3 or not false_options:
        raise ValueError(f"Multi-Choice-Gegenbeispiel kann fuer {source_key} nicht gebaut werden.")

    false_option = false_options[sum(ord(char) for char in source_key) % len(false_options)]
    option_specs: list[dict[str, Any]] = [
        {
            "text": false_option.get("text", ""),
            "correct": True,
            "explanation": (
                "Diese Aussage widerspricht einem belastbaren Vorgehen. "
                f"{ensure_sentence(false_option.get('rationale') or false_option.get('explanation', ''))}"
            ),
        }
    ]
    option_specs.extend(
        {
            "text": raw_option.get("text", ""),
            "correct": False,
            "explanation": (
                "Diese Aussage stuetzt eine saubere Projektarbeit. "
                f"{ensure_sentence(raw_option.get('rationale') or raw_option.get('explanation', ''))}"
            ),
        }
        for raw_option in true_options[:3]
    )

    return build_choice_question(
        source_ref=f"{source_key}::gegenbeispiel_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::gegenbeispiel_v1",
        title=f"{base_title}: Gegenbeispiel erkennen",
        prompt=pick_template(
            f"{source_key}::gegenbeispiel_prompt",
            MULTI_COUNTEREXAMPLE_PROMPTS,
        ).format(title=base_title),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(f"{source_key}::gegenbeispiel_options", option_specs),
        progress_links=progress_links,
    )


def build_ordering_companions(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> list[dict[str, Any]]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    base_title = normalize_visible_text(raw_question.get("title", ""))
    items = [
        normalize_visible_text(item)
        for item in raw_question.get("correctOrder") or raw_question.get("items", [])
        if normalize_visible_text(item)
    ]
    if len(items) < 5:
        raise ValueError(f"Zu wenige Schritte fuer Varianten in {source_key}.")

    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]
    concept_key = build_concept_key(pool_slug, base_title)

    before_target_index = 3
    before_correct_index = before_target_index - 1
    before_target = items[before_target_index]
    before_correct = items[before_correct_index]
    before_distractors = [items[0], items[1], items[4]]
    before_options = [
        {
            "text": before_correct,
            "correct": True,
            "explanation": f"In diesem Ablauf muss direkt vor „{before_target}“ der Schritt „{before_correct}“ liegen.",
        },
        {
            "text": before_distractors[0],
            "correct": False,
            "explanation": f"„{before_distractors[0]}“ liegt in der Reihenfolge deutlich frueher und steht nicht unmittelbar vor „{before_target}“.",
        },
        {
            "text": before_distractors[1],
            "correct": False,
            "explanation": f"„{before_distractors[1]}“ passiert ebenfalls vor dem gesuchten Schritt, aber noch nicht direkt davor.",
        },
        {
            "text": before_distractors[2],
            "correct": False,
            "explanation": f"„{before_distractors[2]}“ liegt nach „{before_target}“ und kann daher nicht davor stehen.",
        },
    ]

    after_target_index = 1
    after_correct_index = after_target_index + 1
    after_target = items[after_target_index]
    after_correct = items[after_correct_index]
    after_distractors = [items[0], items[3], items[4]]
    after_options = [
        {
            "text": after_correct,
            "correct": True,
            "explanation": f"Direkt nach „{after_target}“ folgt in diesem Ablauf der Schritt „{after_correct}“.",
        },
        {
            "text": after_distractors[0],
            "correct": False,
            "explanation": f"„{after_distractors[0]}“ gehoert zeitlich vor „{after_target}“ und kann kein Folgeschritt sein.",
        },
        {
            "text": after_distractors[1],
            "correct": False,
            "explanation": f"„{after_distractors[1]}“ liegt spaeter im Ablauf und kommt nicht unmittelbar nach „{after_target}“.",
        },
        {
            "text": after_distractors[2],
            "correct": False,
            "explanation": f"„{after_distractors[2]}“ ist noch spaeter und ueberspringt mindestens einen notwendigen Schritt.",
        },
    ]

    before_question = build_choice_question(
        source_ref=f"{source_key}::vorgaenger_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::vorgaenger_v1",
        title=f"{base_title}: Schritt davor erkennen",
        prompt=f"Welcher Schritt gehoert in diesem Ablauf unmittelbar vor „{before_target}“?",
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reassemble_options(before_options, [2, 0, 3, 1]),
        progress_links=progress_links,
    )

    after_question = build_choice_question(
        source_ref=f"{source_key}::folgeschritt_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::folgeschritt_v1",
        title=f"{base_title}: Folgeschritt erkennen",
        prompt=f"Welcher Schritt folgt in diesem Ablauf direkt auf „{after_target}“?",
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reassemble_options(after_options, [1, 3, 0, 2]),
        progress_links=progress_links,
    )

    first_correct = items[0]
    first_distractors = [items[1], items[2], items[4]]
    first_options = [
        {
            "text": first_correct,
            "correct": True,
            "explanation": f"Mit „{first_correct}“ startet der Ablauf sachlogisch, bevor weitere Struktur- oder Bewertungsarbeit folgt.",
        },
        {
            "text": first_distractors[0],
            "correct": False,
            "explanation": f"„{first_distractors[0]}“ setzt bereits einen frueheren Einstiegsschritt voraus und kann daher nicht zuerst kommen.",
        },
        {
            "text": first_distractors[1],
            "correct": False,
            "explanation": f"„{first_distractors[1]}“ folgt erst auf vorbereitende Klaerung und ist kein sinnvoller Startpunkt.",
        },
        {
            "text": first_distractors[2],
            "correct": False,
            "explanation": f"„{first_distractors[2]}“ liegt am Ende des Ablaufs und kann den Prozess nicht eroeffnen.",
        },
    ]

    last_correct = items[-1]
    last_distractors = [items[0], items[2], items[3]]
    last_options = [
        {
            "text": last_correct,
            "correct": True,
            "explanation": f"„{last_correct}“ schliesst den Ablauf ab, nachdem alle vorbereitenden Schritte erledigt wurden.",
        },
        {
            "text": last_distractors[0],
            "correct": False,
            "explanation": f"„{last_distractors[0]}“ ist ein frueher Einstiegsschritt und kein fachlich stimmiger Abschluss.",
        },
        {
            "text": last_distractors[1],
            "correct": False,
            "explanation": f"„{last_distractors[1]}“ liegt in der Mitte des Prozesses und bereitet den Abschluss nur vor.",
        },
        {
            "text": last_distractors[2],
            "correct": False,
            "explanation": f"„{last_distractors[2]}“ ist noch nicht der letzte Schritt des Ablaufs.",
        },
    ]

    first_question = build_choice_question(
        source_ref=f"{source_key}::einstieg_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::einstieg_v1",
        title=f"{base_title}: Einstieg bestimmen",
        prompt=pick_template(f"{source_key}::einstieg_prompt", ORDERING_FIRST_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(f"{source_key}::einstieg_options", first_options),
        progress_links=progress_links,
    )

    last_question = build_choice_question(
        source_ref=f"{source_key}::abschluss_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::abschluss_v1",
        title=f"{base_title}: Abschluss bestimmen",
        prompt=pick_template(f"{source_key}::abschluss_prompt", ORDERING_LAST_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(f"{source_key}::abschluss_options", last_options),
        progress_links=progress_links,
    )

    return [before_question, after_question, first_question, last_question]


def build_short_text_companions(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> list[dict[str, Any]]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    base_title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, base_title)
    progress_links = collect_progress_links(raw_question)
    outline_parts = split_outline_components(raw_question.get("expectedOutline", ""))
    if len(outline_parts) < 3:
        raise ValueError(f"Zu wenig Outline-Bausteine fuer Kurztext-Varianten in {source_key}.")
    component_labels = SHORT_TEXT_COMPONENT_LABELS.get(source_key, outline_parts[:3])
    if len(component_labels) < 3:
        raise ValueError(f"Zu wenig Komponenten-Labels fuer Kurztext-Varianten in {source_key}.")

    distractor_start = sum(ord(char) for char in source_key) % len(SHORT_TEXT_DISTRACTORS)
    distractor_specs = [
        SHORT_TEXT_DISTRACTORS[distractor_start],
        SHORT_TEXT_DISTRACTORS[(distractor_start + 2) % len(SHORT_TEXT_DISTRACTORS)],
    ]

    component_options = [
        {
            "text": label,
            "correct": True,
            "explanation": f"„{label}“ gehoert zum erwarteten Kern und sollte in einer guten Fassung sichtbar werden.",
        }
        for label in component_labels[:3]
    ]
    component_options.extend(
        {
            "text": text,
            "correct": False,
            "explanation": explanation,
        }
        for text, explanation in distractor_specs
    )

    summary_options = [
        {
            "text": f"Sie verbindet {join_quoted_list(component_labels[:3])}.",
            "correct": True,
            "explanation": "Diese Verdichtung deckt alle erwarteten Kernbausteine ab.",
        },
        {
            "text": build_outline_gap_statement(component_labels[:2], [component_labels[2]]),
            "correct": False,
            "explanation": f"Hier fehlt „{component_labels[2]}“ und damit ein zentraler Bestandteil.",
        },
        {
            "text": build_outline_gap_statement([component_labels[0], component_labels[2]], [component_labels[1]]),
            "correct": False,
            "explanation": f"Diese Fassung laesst „{component_labels[1]}“ aus und bleibt dadurch unvollstaendig.",
        },
        {
            "text": build_outline_gap_statement([component_labels[1]], [component_labels[0], component_labels[2]]),
            "correct": False,
            "explanation": (
                f"Eine tragfaehige Verdichtung braucht auch „{component_labels[0]}“ und „{component_labels[2]}“."
            ),
        },
    ]

    component_question = build_choice_question(
        source_ref=f"{source_key}::bausteine_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::bausteine_v1",
        title=f"{base_title}: Bausteine absichern",
        prompt=pick_template(f"{source_key}::bausteine_prompt", SHORT_TEXT_COMPONENT_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="multi",
        question_kind="mehrere_richtige_antworten_waehlen",
        option_specs=reorder_option_specs(f"{source_key}::bausteine_options", component_options),
        progress_links=progress_links,
    )

    summary_question = build_choice_question(
        source_ref=f"{source_key}::kernaussage_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::kernaussage_v1",
        title=f"{base_title}: Kernaussage treffen",
        prompt=pick_template(f"{source_key}::kernaussage_prompt", SHORT_TEXT_SUMMARY_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(f"{source_key}::kernaussage_options", summary_options),
        progress_links=progress_links,
    )

    return [component_question, summary_question]


def build_number_formula_specs(prompt_text: str) -> list[dict[str, Any]]:
    numbers = [int(value) for value in re.findall(r"\d+", prompt_text)]
    if len(numbers) < 2:
        raise ValueError(f"Zu wenige Zahlen im Rechenprompt: {prompt_text!r}")

    if "zu je" in prompt_text and "Minuten" in prompt_text:
        meeting_count, meeting_duration = numbers[0], numbers[1]
        review_duration = numbers[-1]
        return [
            {
                "text": f"{meeting_count} mal {meeting_duration} plus {review_duration}",
                "correct": True,
                "explanation": "Hier wird zuerst der Aufwand aller Statusmeetings berechnet und danach das Review addiert.",
            },
            {
                "text": f"{meeting_count} plus {meeting_duration} plus {review_duration}",
                "correct": False,
                "explanation": "Die Anzahl der Meetings muss mit der Dauer multipliziert werden; blosses Addieren reicht nicht.",
            },
            {
                "text": f"{meeting_duration} plus {review_duration}",
                "correct": False,
                "explanation": "Diese Rechnung beruecksichtigt nur ein Statusmeeting und laesst die Wiederholung aus.",
            },
            {
                "text": f"{meeting_count} mal {review_duration}",
                "correct": False,
                "explanation": "Das Risiko-Review findet nicht dreimal statt und darf nicht als Serienmeeting behandelt werden.",
            },
        ]

    if "EUR pro Stunde" in prompt_text:
        hours, rate = numbers[0], numbers[1]
        return [
            {
                "text": f"{hours} mal {rate}",
                "correct": True,
                "explanation": "Gesucht ist ein Geldbetrag aus Zeit mal Stundensatz.",
            },
            {
                "text": f"{hours} plus {rate}",
                "correct": False,
                "explanation": "Addition verknuepft Stunden und Stundensatz nicht zu einem Kostenbetrag.",
            },
            {
                "text": f"{rate} durch {hours}",
                "correct": False,
                "explanation": "Division liefert hier keinen Gesamtbetrag und dreht die Beziehung zwischen Stunden und Satz falsch herum.",
            },
            {
                "text": f"{hours} minus {rate}",
                "correct": False,
                "explanation": "Eine Differenz aus Stunden und EUR pro Stunde beschreibt die Kosten nicht sinnvoll.",
            },
        ]

    if "tatsaechlich werden" in prompt_text:
        planned, actual = numbers[0], numbers[1]
        return [
            {
                "text": f"{actual} minus {planned}",
                "correct": True,
                "explanation": "Gesucht ist nur der zusaetzliche Bedarf und damit die Differenz zwischen Ist und Plan.",
            },
            {
                "text": f"{planned} minus {actual}",
                "correct": False,
                "explanation": "Diese Rechnung vertauscht Ist und Plan und wuerde bei Zusatzbedarf das falsche Vorzeichen liefern.",
            },
            {
                "text": f"{planned} plus {actual}",
                "correct": False,
                "explanation": "Addition erzeugt einen Gesamtwert, obwohl nur der Mehrbedarf gesucht ist.",
            },
            {
                "text": f"{actual} durch {planned}",
                "correct": False,
                "explanation": "Division waere nur fuer eine Quote relevant, nicht fuer einen Stundenaufschlag.",
            },
        ]

    if "Prozent" in prompt_text:
        total, part = numbers[0], numbers[1]
        if total < part:
            total, part = part, total
        return [
            {
                "text": f"{part} durch {total} mal 100",
                "correct": True,
                "explanation": "Eine Quote entsteht aus Teil durch Gesamt, anschliessend multipliziert mit 100.",
            },
            {
                "text": f"{total} durch {part} mal 100",
                "correct": False,
                "explanation": "Diese Rechnung vertauscht Teil und Gesamt und produziert deshalb eine unpassende Quote.",
            },
            {
                "text": f"{total} minus {part}",
                "correct": False,
                "explanation": "Die Differenz liefert eine Anzahl, aber keine prozentuale Quote.",
            },
            {
                "text": f"{part} mal {total}",
                "correct": False,
                "explanation": "Multiplikation der beiden Werte ergibt keinen Prozentwert fuer den beschriebenen Sachverhalt.",
            },
        ]

    sum_numbers = numbers
    if len(sum_numbers) == 2:
        first, second = sum_numbers
        return [
            {
                "text": f"{first} plus {second}",
                "correct": True,
                "explanation": "Hier muessen die beiden genannten Teilwerte zum Gesamtumfang addiert werden.",
            },
            {
                "text": f"{first} mal {second}",
                "correct": False,
                "explanation": "Multiplikation wuerde einen unpassenden Produktwert liefern statt der gesuchten Summe.",
            },
            {
                "text": f"{first} minus {second}",
                "correct": False,
                "explanation": "Die Differenz bildet keinen Gesamtumfang ab.",
            },
            {
                "text": f"{second} minus {first}",
                "correct": False,
                "explanation": "Auch diese Differenz berechnet keinen Gesamtwert.",
            },
        ]

    sum_text = " plus ".join(str(number) for number in sum_numbers)
    omit_last_text = " plus ".join(str(number) for number in sum_numbers[:-1])
    subtract_last_text = f"{' plus '.join(str(number) for number in sum_numbers[:-1])} minus {sum_numbers[-1]}"
    multiply_first_text = f"{sum_numbers[0]} mal {sum_numbers[1]}"
    if len(sum_numbers) > 2:
        multiply_first_text += "".join(f" plus {number}" for number in sum_numbers[2:])

    return [
        {
            "text": sum_text,
            "correct": True,
            "explanation": "Hier muessen alle genannten Teilwerte zum gesuchten Gesamtwert zusammengerechnet werden.",
        },
        {
            "text": omit_last_text,
            "correct": False,
            "explanation": "Diese Rechnung laesst mindestens einen relevanten Teilwert weg und bleibt deshalb zu niedrig.",
        },
        {
            "text": subtract_last_text,
            "correct": False,
            "explanation": "Der letzte Teilwert gehoert dazu und darf nicht vom Zwischenergebnis abgezogen werden.",
        },
        {
            "text": multiply_first_text,
            "correct": False,
            "explanation": "Hier werden Teilwerte unpassend miteinander multipliziert, obwohl eine Summe gesucht ist.",
        },
    ]


def build_number_interpretation_specs(title: str, prompt_text: str, expected_text: str) -> list[dict[str, Any]]:
    title_text = normalize_visible_text(title)
    expected = normalize_visible_text(expected_text)

    if "EUR" in prompt_text:
        if "Zusatzaufwand" in prompt_text:
            correct = f"Der zusaetzliche Aufwand liegt bei {expected} EUR."
            wrongs = (
                f"{expected} EUR sind der neue Stundensatz.",
                f"{expected} EUR beschreiben nur die Anzahl der Zusatzstunden.",
                f"{expected} EUR stehen fuer den offenen Restbetrag und nicht fuer den Aufschlag.",
            )
        elif "Gesamtsumme" in prompt_text:
            correct = f"Die gesamte Kalkulation summiert sich auf {expected} EUR."
            wrongs = (
                f"{expected} EUR sind nur der Dokumentationsanteil.",
                f"{expected} EUR beschreiben den Stundenumfang der Umsetzung.",
                f"{expected} EUR stehen nur fuer den kuenftigen Puffer und nicht fuer die Gesamtplanung.",
            )
        else:
            correct = f"Der gesuchte Gesamtbetrag liegt bei {expected} EUR."
            wrongs = (
                f"{expected} EUR sind der Stundensatz der Aufgabe.",
                f"{expected} EUR beschreiben nur die Anzahl der Stunden.",
                f"{expected} EUR stehen fuer den offenen Rest und nicht fuer die Gesamtkosten.",
            )
    elif "Zusatzbedarf" in prompt_text:
        correct = f"Es werden {expected} Stunden mehr benoetigt als geplant."
        wrongs = (
            f"{expected} Stunden sind bereits der gesamte Projektaufwand.",
            f"{expected} Stunden beschreiben den urspruenglichen Planwert.",
            f"{expected} Stunden stehen fuer die Zahl der Arbeitspakete.",
        )
    elif "Erfolgsquote" in prompt_text:
        correct = f"Rund {expected} Prozent der geplanten Abnahmetests waren erfolgreich."
        wrongs = (
            f"{expected} Prozent der Tests sind noch offen.",
            f"{expected} Prozent ist die Anzahl erfolgreicher Testfaelle.",
            f"{expected} Prozent beschreiben den zusaetzlichen Testaufwand in Stunden.",
        )
    elif "Terminquote" in prompt_text:
        correct = f"Rund {expected} Prozent der Meilensteine wurden im Termin erreicht."
        wrongs = (
            f"{expected} Prozent der Meilensteine wurden verpasst.",
            f"{expected} Prozent ist die Anzahl aller Meilensteine.",
            f"{expected} Prozent beschreiben den offenen Kostenaufschlag.",
        )
    elif "Fehlerquote" in prompt_text:
        correct = f"{expected} Prozent der Testfaelle schlagen fehl."
        wrongs = (
            f"{expected} Prozent der Testfaelle waren erfolgreich.",
            f"{expected} Prozent ist die absolute Zahl der Fehlfaelle.",
            f"{expected} Prozent beschreibt den Dokumentationsstand des Tests.",
        )
    elif "Zielerreichung" in title_text or "Zielerreichung" in prompt_text:
        correct = f"Die Zielerreichung liegt bei {expected} Prozent."
        wrongs = (
            f"{expected} Prozent der Ziele sind noch offen.",
            f"{expected} Prozent ist die absolute Zahl der erreichten Ziele.",
            f"{expected} Prozent beschreibt nur den naechsten Verbesserungsaufschlag.",
        )
    elif "Minuten" in prompt_text and "Slot" in prompt_text:
        correct = f"Der Praesentationsslot dauert insgesamt {expected} Minuten."
        wrongs = (
            f"{expected} Minuten beschreiben nur die Demozeit.",
            f"{expected} Minuten stehen fuer den Fragenblock allein.",
            f"{expected} Minuten sind ein Restwert ohne Kontext und Fragen.",
        )
    elif "Minuten" in prompt_text:
        correct = f"Die gesamte Meetingzeit pro Woche liegt bei {expected} Minuten."
        wrongs = (
            f"{expected} Minuten entfallen nur auf das Risiko-Review.",
            f"{expected} Minuten beschreiben die Dauer eines einzelnen Statusmeetings.",
            f"{expected} Minuten stehen fuer die Zahl der beteiligten Personen.",
        )
    elif "Anforderungen" in prompt_text:
        correct = f"Insgesamt sind {expected} Anforderungen im Backlog erfasst."
        wrongs = (
            f"{expected} Anforderungen sind ausschliesslich Muss-Anforderungen.",
            f"{expected} Anforderungen wurden bereits gestrichen.",
            f"{expected} Anforderungen beschreiben nur den offenen Rest nach der Priorisierung.",
        )
    else:
        correct = f"Der berechnete Gesamtwert zu „{title_text}“ liegt bei {expected}."
        wrongs = (
            f"{expected} ist nur ein Teilwert und nicht das Ergebnis der Aufgabe.",
            f"{expected} beschreibt den Startwert vor der Berechnung.",
            f"{expected} steht fuer den Restbedarf und nicht fuer das gefragte Resultat.",
        )

    return [
        {
            "text": correct,
            "correct": True,
            "explanation": "Diese Aussage beschreibt den berechneten Wert im fachlichen Kontext der Aufgabe korrekt.",
        },
        {
            "text": wrongs[0],
            "correct": False,
            "explanation": "Diese Deutung verwechselt die Rolle des Ergebnisses im beschriebenen Fall.",
        },
        {
            "text": wrongs[1],
            "correct": False,
            "explanation": "Hier wird der Zahlenwert als andere Groesse missverstanden als in der Aufgabe gefragt.",
        },
        {
            "text": wrongs[2],
            "correct": False,
            "explanation": "Diese Aussage legt dem Ergebnis eine Bedeutung zu, die der Aufgabentext nicht hergibt.",
        },
    ]


def build_number_companions(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> list[dict[str, Any]]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    configs = NUMBER_COMPANIONS.get(source_key, [])
    if not configs:
        return []

    concept_key = build_concept_key(pool_slug, normalize_visible_text(raw_question.get("title", "")))
    progress_links = [
        str(link).strip()
        for link in raw_question.get("progressLinks", [])
        if str(link).strip()
    ]

    questions: list[dict[str, Any]] = []
    for config in configs:
        option_specs = [
            {
                "text": text,
                "correct": correct,
                "explanation": explanation,
            }
            for text, correct, explanation in config["options"]
        ]
        questions.append(
            build_choice_question(
                source_ref=f"{source_key}::{config['variant_key']}",
                concept_key=concept_key,
                variant_key=f"{concept_key}::{config['variant_key']}",
                title=config["title"],
                prompt=config["prompt"],
                context=context,
                interaction_type="single",
                question_kind="eine_richtige_antwort_waehlen",
                option_specs=option_specs,
                progress_links=progress_links,
            )
        )

    return questions


def build_number_formula_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    base_title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, base_title)
    progress_links = collect_progress_links(raw_question)
    prompt_text = normalize_prompt(raw_question.get("prompt", ""))

    return build_choice_question(
        source_ref=f"{source_key}::rechenweg_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::rechenweg_v1",
        title=f"{base_title}: Rechenweg pruefen",
        prompt=pick_template(f"{source_key}::rechenweg_prompt", NUMBER_FORMULA_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(
            f"{source_key}::rechenweg_options",
            build_number_formula_specs(prompt_text),
        ),
        progress_links=progress_links,
    )


def build_number_interpretation_companion(
    *,
    scenario_rel_path: str,
    pool_slug: str,
    raw_question: dict[str, Any],
    context: str,
) -> dict[str, Any]:
    source_key = f"{scenario_rel_path}#{raw_question['id']}"
    base_title = normalize_visible_text(raw_question.get("title", ""))
    concept_key = build_concept_key(pool_slug, base_title)
    progress_links = collect_progress_links(raw_question)
    prompt_text = normalize_prompt(raw_question.get("prompt", ""))
    expected_text = raw_question.get("expected", "")

    return build_choice_question(
        source_ref=f"{source_key}::aussage_v1",
        concept_key=concept_key,
        variant_key=f"{concept_key}::aussage_v1",
        title=f"{base_title}: Ergebnis deuten",
        prompt=pick_template(f"{source_key}::aussage_prompt", NUMBER_INTERPRETATION_PROMPTS).format(
            title=base_title
        ),
        context=context,
        interaction_type="single",
        question_kind="eine_richtige_antwort_waehlen",
        option_specs=reorder_option_specs(
            f"{source_key}::aussage_options",
            build_number_interpretation_specs(base_title, prompt_text, expected_text),
        ),
        progress_links=progress_links,
    )


def collect_questions_for_scenario(
    scenario_rel_path: str,
    scenario_data: dict[str, Any],
) -> list[dict[str, Any]]:
    pool_slug = normalize_pool_slug(Path(scenario_rel_path).parent.name)
    base_questions: list[dict[str, Any]] = []
    companion_questions: list[dict[str, Any]] = []
    active_context = ""
    skipped_types: Counter[str] = Counter()

    for raw_question in scenario_data.get("questions", []):
        question_type = str(raw_question.get("type", "")).strip()
        if question_type == "followup_divider":
            active_context = render_followup_context(raw_question)
            continue

        if question_type in {"single_choice", "multi_select", "ordering", "number"}:
            base_questions.append(
                build_base_question(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
        elif question_type == "short_text":
            base_questions.append(
                build_short_text_question(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
        else:
            skipped_types[question_type or "<leer>"] += 1
            continue

        if question_type == "ordering":
            companion_questions.extend(
                build_ordering_companions(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
        if question_type == "single_choice":
            companion_questions.append(
                build_single_rationale_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
        if question_type == "multi_select":
            companion_questions.append(
                build_multi_counterexample_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
        if question_type == "short_text":
            companion_questions.extend(
                build_short_text_companions(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
        if question_type == "number":
            companion_questions.extend(
                build_number_companions(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
            companion_questions.append(
                build_number_formula_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )
            companion_questions.append(
                build_number_interpretation_companion(
                    scenario_rel_path=scenario_rel_path,
                    pool_slug=pool_slug,
                    raw_question=raw_question,
                    context=active_context,
                )
            )

    if skipped_types:
        raise ValueError(f"Nicht unterstuetzte Fragearten in {scenario_rel_path}: {dict(skipped_types)}")

    return base_questions + companion_questions


def collapse_single_value(values: list[str]) -> str | None:
    unique_values = sorted({value for value in values if value})
    if len(unique_values) == 1:
        return unique_values[0]
    return None


def collect_pools() -> list[dict[str, Any]]:
    manifest = json.loads(SCENARIO_MANIFEST_PATH.read_text(encoding="utf-8"))
    topic_titles = load_topic_titles()
    pools: list[dict[str, Any]] = []

    for entry in manifest.get("scenarios", []):
        scenario_rel_path = str(entry.get("file", "")).strip()
        if not scenario_rel_path:
            continue

        scenario_path = SCENARIO_ROOT / scenario_rel_path
        scenario_data = json.loads(scenario_path.read_text(encoding="utf-8"))
        questions = collect_questions_for_scenario(scenario_rel_path, scenario_data)
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
                "default_interaction_type": collapse_single_value(
                    [question["interaction_type"] for question in questions]
                ),
                "default_question_kind": collapse_single_value(
                    [question["question_kind"] for question in questions]
                ),
                "default_badge_label": collapse_single_value(
                    [question["badge_label"] for question in questions]
                )
                or "Aufgabe",
                "topics": collect_pool_topics(label, questions, topic_titles),
                "questions": questions,
            }
        )

    total_questions = sum(len(pool["questions"]) for pool in pools)
    if total_questions != TARGET_QUESTION_COUNT:
        raise ValueError(
            f"LF12-Import erzeugt {total_questions} Fragen statt {TARGET_QUESTION_COUNT}."
        )

    return pools


def load_course_description() -> str:
    data = json.loads(POSSIBLE_SKILLS_PATH.read_text(encoding="utf-8"))
    subtitle = normalize_visible_text(data.get("subtitle", ""))
    intro_parts = [
        normalize_visible_text(entry)
        for entry in data.get("intro", [])
        if normalize_visible_text(entry)
    ]
    intro = " ".join(intro_parts).strip()
    if subtitle and intro:
        return f"Quizdatenbank fuer {subtitle}. {intro}"
    if subtitle:
        return f"Quizdatenbank fuer {subtitle}."
    return "Quizdatenbank fuer LF12 FIAE."


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
                "LF12FIAE-Quiz",
                "LF12FIAE",
                "LF12 FIAE",
                load_course_description(),
                "de",
                "",
            ),
        )

        for pool_sort_order, pool in enumerate(pools, start=1):
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
                    pool["default_interaction_type"],
                    pool["default_question_kind"],
                    pool["default_badge_label"],
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
                concept_id = stable_id("concept", question["concept_key"])
                variant_id = stable_id("variant", question["variant_key"])

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
                        question["context"],
                        question["max_selections"],
                        question["is_new"],
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

                for item in question["sequence_items"]:
                    item_id = stable_id("sequence_item", f"{question['source_ref']}::{item['item_key']}")
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
                            item["item_key"],
                            item["sort_order"],
                            item["text"],
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


def main() -> None:
    pools = collect_pools()
    question_count, option_count, sequence_item_count, accepted_answer_count = rebuild_database(pools)

    print(f"db={QUIZ_DB_PATH.relative_to(ROOT)}")
    print(f"pools={len(pools)}")
    print(f"questions={question_count}")
    print(f"options={option_count}")
    print(f"sequence_items={sequence_item_count}")
    print(f"accepted_answers={accepted_answer_count}")


if __name__ == "__main__":
    main()
