#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import sqlite3
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUIZMASTER = ROOT / "QuizMaster"
OUTPUT = QUIZMASTER / "output"
LEGACY = QUIZMASTER / "legacy"
DB_PATH = OUTPUT / "quizmaster.sqlite"


AREAS = [
    {
        "id": "ausbildungsjahr_1",
        "label": "Ausbildungsjahr 1",
        "area_group": "ausbildung",
        "sort_order": 1,
        "notes": "Lernfelder 1-5; gemeinsame Grundlagen.",
    },
    {
        "id": "ausbildungsjahr_2",
        "label": "Ausbildungsjahr 2",
        "area_group": "ausbildung",
        "sort_order": 2,
        "notes": "Lernfelder 6-9; gemeinsame Grundlagen.",
    },
    {
        "id": "ausbildungsjahr_3",
        "label": "Ausbildungsjahr 3",
        "area_group": "ausbildung",
        "sort_order": 3,
        "notes": "Lernfelder 10-13; spezialisierungsbezogene Vertiefung für Fachinformatiker.",
    },
    {
        "id": "pruefung_1",
        "label": "Prüfung 1",
        "area_group": "pruefung",
        "sort_order": 4,
        "notes": "Gemeinsame Grundlagen.",
    },
    {
        "id": "pruefung_2_1",
        "label": "Prüfung 2/1",
        "area_group": "pruefung",
        "sort_order": 5,
        "notes": "Gemeinsame Grundlagen plus spezialisierungsbezogene Anteile.",
    },
    {
        "id": "pruefung_2_2",
        "label": "Prüfung 2/2",
        "area_group": "pruefung",
        "sort_order": 6,
        "notes": "Spezialisierungsbezogene schriftliche Vertiefung.",
    },
    {
        "id": "pruefung_2_3",
        "label": "Prüfung 2/3",
        "area_group": "pruefung",
        "sort_order": 7,
        "notes": "Wirtschafts- und Sozialkunde.",
    },
    {
        "id": "pruefung_2_4",
        "label": "Prüfung 2/4",
        "area_group": "pruefung",
        "sort_order": 8,
        "notes": "Fachgespräch plus spezialisierungsbezogene Argumentation.",
    },
]


OBERTHEMEN = [
    {
        "id": "ausbildung_und_betriebsrolle",
        "label": "Ausbildung und Betriebsrolle",
        "short_description": "Duales System, Rollen, Rechte, Pflichten und betriebliche Verantwortung.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "Kurse/Ausbildungsrahmenplan.md und LF01 possible_skills.json",
    },
    {
        "id": "arbeitsrecht_und_mitbestimmung",
        "label": "Arbeitsrecht und Mitbestimmung",
        "short_description": "Arbeitsrechtliche Grundlagen, Beteiligungsrechte und geregelte Eskalationswege.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF01 possible_skills.json und WISO-Struktur",
    },
    {
        "id": "betrieb_markt_und_wertschoepfung",
        "label": "Betrieb, Markt und Wertschöpfung",
        "short_description": "Unternehmensziele, Prozesse, Marktumfeld und wirtschaftliche Zusammenhänge.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF01 possible_skills.json",
    },
    {
        "id": "praesentation_dokumentation_und_reflexion",
        "label": "Präsentation, Dokumentation und Reflexion",
        "short_description": "Adressatengerechte Darstellung, Nachweise, Feedback und Verbesserungsarbeit.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF01 und LF12FIAE Fokus",
    },
    {
        "id": "hardware_und_arbeitsplatzsysteme",
        "label": "Hardware und Arbeitsplatzsysteme",
        "short_description": "Arbeitsplatzplanung, Hardwareauswahl, Kompatibilität und Inbetriebnahme.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF02 Fokus und Ausbildungsrahmenplan",
    },
    {
        "id": "netzwerke_und_adressierung",
        "label": "Netzwerke und Adressierung",
        "short_description": "Netzwerktechnik, Topologien, Protokolle, Adressierung und Client-Einbindung.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF03 Fokus und Ausbildungsrahmenplan",
    },
    {
        "id": "it_sicherheit_und_datenschutz",
        "label": "IT-Sicherheit und Datenschutz",
        "short_description": "Schutzziele, Bedrohungen, Schutzmaßnahmen, Rechte und datenschutzgerechte Verarbeitung.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF04, QuS2 und AP2-FIAE-Bestand",
    },
    {
        "id": "datenmodellierung_und_normalisierung",
        "label": "Datenmodellierung und Normalisierung",
        "short_description": "Fachmodelle, relationale Ableitung, Schlüssel, Normalformen und Anomalien.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF05, LF08 und AP2-FIAE-Bestand",
    },
    {
        "id": "sql_und_relationale_datenpraxis",
        "label": "SQL und relationale Datenpraxis",
        "short_description": "Abfragen, Filter, Joins, Aggregationen und datenbanknahe Praxisaufgaben.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF05, LF08 und AP2-FIAE-Bestand",
    },
    {
        "id": "datenbankobjekte_und_transaktionen",
        "label": "Datenbankobjekte und Transaktionen",
        "short_description": "DDL, Rechte, Trigger, Routinen, Transaktionslogik und Datenbankbetrieb.",
        "scope": "Spezialisierung",
        "source_basis": "AP2-FIAE-Bestand",
    },
    {
        "id": "service_und_supportprozesse",
        "label": "Service- und Supportprozesse",
        "short_description": "Serviceanfragen, Ticketarbeit, Monitoring, Kommunikation und Deeskalation.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF06 Fokus",
    },
    {
        "id": "cyber_physische_systeme_und_iot",
        "label": "Cyber-physische Systeme und IoT",
        "short_description": "CPS-Grundlagen, Sensorik, Protokolle, Inbetriebnahme und Review.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF07 Fokus",
    },
    {
        "id": "datenintegration_und_datenaustausch",
        "label": "Datenintegration und Datenaustausch",
        "short_description": "Datenquellen, Austauschformate, Integrationswege und Datenqualität.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF08 und Ausbildungsrahmenplan",
    },
    {
        "id": "objektorientierung_und_uml",
        "label": "Objektorientierung und UML",
        "short_description": "OO-Grundlagen, Verantwortungen, Beziehungen und UML-Diagrammarten.",
        "scope": "Spezialisierung",
        "source_basis": "LF08, LF11FIAE und AP2-FIAE-Bestand",
    },
    {
        "id": "algorithmen_und_datenstrukturen",
        "label": "Algorithmen und Datenstrukturen",
        "short_description": "Ablauflogik, Kontrollstrukturen, Such- und Sortierverfahren sowie Berechnungslogik.",
        "scope": "Spezialisierung",
        "source_basis": "LF11FIAE und AP2-FIAE-Bestand",
    },
    {
        "id": "web_apis_und_schnittstellen",
        "label": "Web, APIs und Schnittstellen",
        "short_description": "HTTP, REST, Datenformate, Zustandslosigkeit und Integrationsschnittstellen.",
        "scope": "Spezialisierung",
        "source_basis": "Ausbildungsrahmenplan und AP2-FIAE-Bestand",
    },
    {
        "id": "softwarearchitektur_und_entwurfsmuster",
        "label": "Softwarearchitektur und Entwurfsmuster",
        "short_description": "Architekturzuschnitte, Muster, Komponenten und systemischer Entwurf.",
        "scope": "Spezialisierung",
        "source_basis": "LF10FIAE, LF11FIAE und AP2-FIAE-Bestand",
    },
    {
        "id": "anforderungen_ux_und_barrierefreiheit",
        "label": "Anforderungen, UX und Barrierefreiheit",
        "short_description": "Stakeholder, Anforderungen, Mockups, Prototypen, Usability und barrierefreie Gestaltung.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF10FIAE, LF12FIAE und AP2-FIAE-Bestand",
    },
    {
        "id": "testen_und_qualitaetssicherung",
        "label": "Testen und Qualitätssicherung",
        "short_description": "Testarten, Testdesign, Auswertung, Qualitätsprüfung und Verbesserungszyklen.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF05, LF08, LF11FIAE und AP2-FIAE-Bestand",
    },
    {
        "id": "versionsverwaltung_und_lieferketten",
        "label": "Versionsverwaltung und Lieferketten",
        "short_description": "Historie, Zusammenarbeit, Integration, Auslieferung und wiederholbare Build-Ketten.",
        "scope": "Spezialisierung",
        "source_basis": "Ausbildungsrahmenplan und AP2-FIAE-Bestand",
    },
    {
        "id": "projektmanagement_und_wirtschaftlichkeit",
        "label": "Projektmanagement und Wirtschaftlichkeit",
        "short_description": "Planung, Aufwand, Zielsteuerung, Risiken, Wirtschaftlichkeit und Projektorganisation.",
        "scope": "gemeinsame Grundlagen und Spezialisierung",
        "source_basis": "LF09, LF12FIAE und QuS2-Struktur",
    },
    {
        "id": "netzwerkdienste_und_virtualisierung",
        "label": "Netzwerkdienste und Virtualisierung",
        "short_description": "Bereitstellung von Diensten, Rollout, Konfiguration, Messung und Virtualisierung.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "LF09 Fokus",
    },
    {
        "id": "wirtschafts_und_sozialkunde",
        "label": "Wirtschafts- und Sozialkunde",
        "short_description": "Arbeitswelt, Sozialversicherung, Unternehmensformen, Rechte, Pflichten und Wirtschaftspolitik.",
        "scope": "Prüfung 2/3",
        "source_basis": "Prüfungsvorbereitung-3-WISO-Struktur",
    },
    {
        "id": "fachgespraech_und_berufliche_argumentation",
        "label": "Fachgespräch und berufliche Argumentation",
        "short_description": "Fachlich begründete Entscheidungen, Projektreflexion, Präsentation und Verteidigung.",
        "scope": "Prüfung 2/4",
        "source_basis": "LF12FIAE und Prüfungsstruktur",
    },
]


AREA_OBERTHEMA = {
    "ausbildungsjahr_1": [
        "ausbildung_und_betriebsrolle",
        "arbeitsrecht_und_mitbestimmung",
        "betrieb_markt_und_wertschoepfung",
        "praesentation_dokumentation_und_reflexion",
        "hardware_und_arbeitsplatzsysteme",
        "netzwerke_und_adressierung",
        "it_sicherheit_und_datenschutz",
        "datenmodellierung_und_normalisierung",
        "sql_und_relationale_datenpraxis",
    ],
    "ausbildungsjahr_2": [
        "service_und_supportprozesse",
        "cyber_physische_systeme_und_iot",
        "datenintegration_und_datenaustausch",
        "objektorientierung_und_uml",
        "anforderungen_ux_und_barrierefreiheit",
        "testen_und_qualitaetssicherung",
        "netzwerkdienste_und_virtualisierung",
        "projektmanagement_und_wirtschaftlichkeit",
        "it_sicherheit_und_datenschutz",
    ],
    "ausbildungsjahr_3": [
        "anforderungen_ux_und_barrierefreiheit",
        "softwarearchitektur_und_entwurfsmuster",
        "objektorientierung_und_uml",
        "algorithmen_und_datenstrukturen",
        "datenmodellierung_und_normalisierung",
        "sql_und_relationale_datenpraxis",
        "datenbankobjekte_und_transaktionen",
        "web_apis_und_schnittstellen",
        "testen_und_qualitaetssicherung",
        "versionsverwaltung_und_lieferketten",
        "projektmanagement_und_wirtschaftlichkeit",
        "it_sicherheit_und_datenschutz",
        "fachgespraech_und_berufliche_argumentation",
    ],
    "pruefung_1": [
        "ausbildung_und_betriebsrolle",
        "hardware_und_arbeitsplatzsysteme",
        "netzwerke_und_adressierung",
        "it_sicherheit_und_datenschutz",
        "datenmodellierung_und_normalisierung",
        "sql_und_relationale_datenpraxis",
        "service_und_supportprozesse",
        "praesentation_dokumentation_und_reflexion",
    ],
    "pruefung_2_1": [
        "anforderungen_ux_und_barrierefreiheit",
        "objektorientierung_und_uml",
        "datenmodellierung_und_normalisierung",
        "sql_und_relationale_datenpraxis",
        "it_sicherheit_und_datenschutz",
        "projektmanagement_und_wirtschaftlichkeit",
        "praesentation_dokumentation_und_reflexion",
    ],
    "pruefung_2_2": [
        "algorithmen_und_datenstrukturen",
        "objektorientierung_und_uml",
        "datenmodellierung_und_normalisierung",
        "sql_und_relationale_datenpraxis",
        "datenbankobjekte_und_transaktionen",
        "web_apis_und_schnittstellen",
        "softwarearchitektur_und_entwurfsmuster",
        "testen_und_qualitaetssicherung",
        "versionsverwaltung_und_lieferketten",
        "it_sicherheit_und_datenschutz",
    ],
    "pruefung_2_3": [
        "wirtschafts_und_sozialkunde",
    ],
    "pruefung_2_4": [
        "fachgespraech_und_berufliche_argumentation",
        "projektmanagement_und_wirtschaftlichkeit",
        "softwarearchitektur_und_entwurfsmuster",
        "testen_und_qualitaetssicherung",
        "anforderungen_ux_und_barrierefreiheit",
        "it_sicherheit_und_datenschutz",
        "praesentation_dokumentation_und_reflexion",
    ],
}


SOURCES = [
    {
        "id": "internal_ausbildungsrahmenplan",
        "title": "Interne Zusammenfassung Ausbildungsrahmenplan",
        "url": "Kurse/Ausbildungsrahmenplan.md",
        "source_group": "internal_seed",
        "reuse_status": "internal",
        "reuse_note": "Interne Arbeitszusammenfassung. Dient nur als Ausgangsbasis für Struktur und Suchrichtungen.",
    },
    {
        "id": "internal_quellenbasis",
        "title": "Interne DoomScroll-Quiz-Quellenbasis",
        "url": "QuizMaster/legacy/doomscroll_quiz_quellenbasis.md",
        "source_group": "internal_seed",
        "reuse_status": "internal",
        "reuse_note": "Interne Ableitung der bisherigen Kurs- und Ordnerlogik.",
    },
    {
        "id": "internal_ap2_matrix",
        "title": "Interne AP2-FIAE-Themenmatrix",
        "url": "QuizMaster/legacy/ap2_fiae_gesamtpool_themenmatrix.md",
        "source_group": "internal_seed",
        "reuse_status": "internal",
        "reuse_note": "Interne Verdichtung der bisherigen AP2-FIAE-Schwerpunkte.",
    },
    {
        "id": "internal_ap2_generator",
        "title": "Interner AP2-FIAE-Generator mit Begriffserklärungen",
        "url": "QuizMaster/scripts/generate_pv2fiae_megaquiz.py",
        "source_group": "internal_seed",
        "reuse_status": "internal",
        "reuse_note": "Enthält 105 bereits formulierte Begriffserklärungen als Startbestand.",
    },
    {
        "id": "external_fiausbv",
        "title": "Fachinformatiker-Ausbildungsverordnung (FIAusbV)",
        "url": "https://www.gesetze-im-internet.de/fiausbv/inhalts_bersicht.html",
        "source_group": "external_official",
        "reuse_status": "allowed",
        "reuse_note": "Amtliche Werke sind nach § 5 UrhG nicht urheberrechtlich geschützt und damit als kommerzielle Arbeitsbasis nutzbar.",
    },
    {
        "id": "external_urhg_5",
        "title": "UrhG § 5 Amtliche Werke",
        "url": "https://www.gesetze-im-internet.de/urhg/__5.html",
        "source_group": "external_official",
        "reuse_status": "allowed",
        "reuse_note": "Rechtsgrundlage für die freie Nutzung amtlicher Werke.",
    },
    {
        "id": "external_gdpr_eurlex",
        "title": "DSGVO über EUR-Lex",
        "url": "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679",
        "source_group": "external_official",
        "reuse_status": "allowed",
        "reuse_note": "EU-Website-Inhalte sind laut Legal Notice grundsätzlich unter CC BY 4.0 wiederverwendbar, sofern nichts anderes vermerkt ist.",
    },
    {
        "id": "external_mdn_license",
        "title": "MDN Web Docs Lizenzhinweis",
        "url": "https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license",
        "source_group": "external_open_license",
        "reuse_status": "allowed",
        "reuse_note": "MDN-Dokumentation steht grundsätzlich unter CC BY-SA 2.5 oder später; kommerzielle Nutzung ist mit Attribution und Share-Alike möglich.",
    },
    {
        "id": "external_w3c_license",
        "title": "W3C Software and Document License 2023",
        "url": "https://www.w3.org/copyright/software-license-2023/",
        "source_group": "external_open_license",
        "reuse_status": "allowed",
        "reuse_note": "Kopieren, Ändern und Verteilen für jeden Zweck ohne Gebühr erlaubt; Hinweis- und Attributionspflichten beachten.",
    },
    {
        "id": "external_kmk_rlp",
        "title": "KMK-Rahmenlehrplan Fachinformatiker",
        "url": "https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf",
        "source_group": "external_official",
        "reuse_status": "rejected",
        "reuse_note": "KMK-Nutzungsbedingungen erlauben nur persönlichen, privaten und nicht kommerziellen Gebrauch. Daher nicht als kommerzielle Inhaltsbasis verwenden.",
    },
    {
        "id": "external_bsi_nutzung",
        "title": "BSI-Nutzungsbedingungen",
        "url": "https://www.bsi.bund.de/DE/Service/Nutzungsbedingungen/Nutzungsbedingungen_node.html",
        "source_group": "external_official",
        "reuse_status": "rejected",
        "reuse_note": "Kommerzielle Verwendung von BSI-Inhalten erfordert laut Nutzungsbedingungen eine gesonderte lizenzrechtliche Vereinbarung.",
    },
    {
        "id": "external_bibb_publication",
        "title": "BIBB-Publikation Fachinformatiker/Fachinformatikerin",
        "url": "https://www.bibb.de/dienst/publikationen/de/16661",
        "source_group": "external_official",
        "reuse_status": "pending",
        "reuse_note": "Bislang kein klarer offener Lizenzhinweis gefunden. Bis zur Klärung nicht als kommerzielle Inhaltsbasis einplanen.",
    },
]


DEFAULT_CLUSTER_TO_OBERTHEMA = {
    "Algorithmen": "algorithmen_und_datenstrukturen",
    "UML und OOP": "objektorientierung_und_uml",
    "Datenmodellierung": "datenmodellierung_und_normalisierung",
    "SQL": "sql_und_relationale_datenpraxis",
    "Datenbankobjekte": "datenbankobjekte_und_transaktionen",
    "Testen und QS": "testen_und_qualitaetssicherung",
    "Sicherheit und Datenschutz": "it_sicherheit_und_datenschutz",
    "Web und Architektur": "web_apis_und_schnittstellen",
    "Anforderungen und UX": "anforderungen_ux_und_barrierefreiheit",
    "Erweiterte Praxis": "versionsverwaltung_und_lieferketten",
}


CONCEPT_OVERRIDES = {
    "dbo_sql_injection": "it_sicherheit_und_datenschutz",
    "ext_observer": "softwarearchitektur_und_entwurfsmuster",
    "ext_factory_method": "softwarearchitektur_und_entwurfsmuster",
    "ext_datenqualitaet": "datenintegration_und_datenaustausch",
    "ext_risikoanalyse": "projektmanagement_und_wirtschaftlichkeit",
    "ext_backup": "it_sicherheit_und_datenschutz",
    "ext_archivierung": "it_sicherheit_und_datenschutz",
    "ext_zertifikat": "it_sicherheit_und_datenschutz",
    "ext_vpn": "it_sicherheit_und_datenschutz",
    "web_microservices": "softwarearchitektur_und_entwurfsmuster",
    "web_monolith": "softwarearchitektur_und_entwurfsmuster",
    "web_mvc": "softwarearchitektur_und_entwurfsmuster",
}


def load_concepts() -> list[dict[str, str]]:
    script_path = QUIZMASTER / "scripts" / "generate_pv2fiae_megaquiz.py"
    spec = importlib.util.spec_from_file_location("pv2_seed", script_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return list(module.CONCEPTS)


def oberthema_for_concept(item: dict[str, str]) -> str:
    return CONCEPT_OVERRIDES.get(
        item["id"],
        DEFAULT_CLUSTER_TO_OBERTHEMA[item["cluster"]],
    )


def ensure_clean_db(path: Path) -> sqlite3.Connection:
    if path.exists():
        path.unlink()
    return sqlite3.connect(path)


def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE sources (
            source_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            source_group TEXT NOT NULL,
            reuse_status TEXT NOT NULL,
            reuse_note TEXT NOT NULL
        );

        CREATE TABLE areas (
            area_id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            area_group TEXT NOT NULL,
            sort_order INTEGER NOT NULL,
            notes TEXT NOT NULL
        );

        CREATE TABLE oberthemen (
            oberthema_id TEXT PRIMARY KEY,
            label TEXT NOT NULL UNIQUE,
            short_description TEXT NOT NULL,
            scope TEXT NOT NULL,
            source_basis TEXT NOT NULL
        );

        CREATE TABLE area_oberthema (
            area_id TEXT NOT NULL REFERENCES areas(area_id),
            oberthema_id TEXT NOT NULL REFERENCES oberthemen(oberthema_id),
            seed_status TEXT NOT NULL,
            note TEXT NOT NULL,
            PRIMARY KEY (area_id, oberthema_id)
        );

        CREATE TABLE thema_objekte (
            thema_objekt_id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            oberthema_id TEXT NOT NULL REFERENCES oberthemen(oberthema_id),
            definition TEXT NOT NULL,
            example_text TEXT NOT NULL,
            non_example_text TEXT NOT NULL,
            best_practice_text TEXT NOT NULL,
            risk_text TEXT NOT NULL,
            contrast_label TEXT NOT NULL,
            contrast_diff TEXT NOT NULL,
            misconception_text TEXT NOT NULL,
            source_id TEXT NOT NULL REFERENCES sources(source_id),
            origin_path TEXT NOT NULL,
            extraction_status TEXT NOT NULL
        );

        CREATE TABLE area_thema_objekt (
            area_id TEXT NOT NULL REFERENCES areas(area_id),
            thema_objekt_id TEXT NOT NULL REFERENCES thema_objekte(thema_objekt_id),
            assignment_basis TEXT NOT NULL,
            PRIMARY KEY (area_id, thema_objekt_id)
        );
        """
    )


def seed_db(conn: sqlite3.Connection, concepts: list[dict[str, str]]) -> None:
    conn.executemany(
        """
        INSERT INTO sources(source_id, title, url, source_group, reuse_status, reuse_note)
        VALUES(:id, :title, :url, :source_group, :reuse_status, :reuse_note)
        """,
        SOURCES,
    )
    conn.executemany(
        """
        INSERT INTO areas(area_id, label, area_group, sort_order, notes)
        VALUES(:id, :label, :area_group, :sort_order, :notes)
        """,
        AREAS,
    )
    conn.executemany(
        """
        INSERT INTO oberthemen(oberthema_id, label, short_description, scope, source_basis)
        VALUES(:id, :label, :short_description, :scope, :source_basis)
        """,
        OBERTHEMEN,
    )

    area_rows = []
    for area_id, oberthemen in AREA_OBERTHEMA.items():
        for oberthema_id in oberthemen:
            area_rows.append(
                {
                    "area_id": area_id,
                    "oberthema_id": oberthema_id,
                    "seed_status": "seed_from_internal_structure",
                    "note": "Vorläufige Zuordnung aus Ausbildungsrahmenplan, Kursfoki und vorhandenen AP2-Ableitungen.",
                }
            )
    conn.executemany(
        """
        INSERT INTO area_oberthema(area_id, oberthema_id, seed_status, note)
        VALUES(:area_id, :oberthema_id, :seed_status, :note)
        """,
        area_rows,
    )

    thema_rows = []
    area_thema_rows = []
    for item in concepts:
        thema_rows.append(
            {
                "thema_objekt_id": item["id"],
                "label": item["term"],
                "oberthema_id": oberthema_for_concept(item),
                "definition": item["definition"],
                "example_text": item["example"],
                "non_example_text": item["non_example"],
                "best_practice_text": item["best_practice"],
                "risk_text": item["risk"],
                "contrast_label": item["contrast_term"],
                "contrast_diff": item["contrast_diff"],
                "misconception_text": item["false_claim"],
                "source_id": "internal_ap2_generator",
                "origin_path": "QuizMaster/scripts/generate_pv2fiae_megaquiz.py",
                "extraction_status": "seed_from_existing_definitions",
            }
        )
        for area_id in ("ausbildungsjahr_3", "pruefung_2_2"):
            area_thema_rows.append(
                {
                    "area_id": area_id,
                    "thema_objekt_id": item["id"],
                    "assignment_basis": "Vorhandene Begriffserklärung stammt aus bestehendem AP2-FIAE-Arbeitsbestand.",
                }
            )

    conn.executemany(
        """
        INSERT INTO thema_objekte(
            thema_objekt_id,
            label,
            oberthema_id,
            definition,
            example_text,
            non_example_text,
            best_practice_text,
            risk_text,
            contrast_label,
            contrast_diff,
            misconception_text,
            source_id,
            origin_path,
            extraction_status
        )
        VALUES(
            :thema_objekt_id,
            :label,
            :oberthema_id,
            :definition,
            :example_text,
            :non_example_text,
            :best_practice_text,
            :risk_text,
            :contrast_label,
            :contrast_diff,
            :misconception_text,
            :source_id,
            :origin_path,
            :extraction_status
        )
        """,
        thema_rows,
    )
    conn.executemany(
        """
        INSERT INTO area_thema_objekt(area_id, thema_objekt_id, assignment_basis)
        VALUES(:area_id, :thema_objekt_id, :assignment_basis)
        """,
        area_thema_rows,
    )
    conn.commit()


def render_initial_sources_md() -> str:
    allowed = [row for row in SOURCES if row["reuse_status"] == "allowed"]
    rejected = [row for row in SOURCES if row["reuse_status"] == "rejected"]
    pending = [row for row in SOURCES if row["reuse_status"] == "pending"]

    lines = [
        "# Kommerziell nutzbare Quellenbasis",
        "",
        "Diese Liste trennt strikt zwischen interner Arbeitsbasis und externen Quellen mit Blick auf kommerzielle Nutzbarkeit.",
        "",
        "## Für den Außen-Research nutzbar",
        "",
    ]
    for row in allowed:
        lines.extend(
            [
                f"### {row['title']}",
                f"- URL: {row['url']}",
                f"- Einstufung: {row['reuse_status']}",
                f"- Begründung: {row['reuse_note']}",
                "",
            ]
        )

    lines.extend(["## Vorläufig ausgeschlossen", ""])
    for row in rejected:
        lines.extend(
            [
                f"### {row['title']}",
                f"- URL: {row['url']}",
                f"- Einstufung: {row['reuse_status']}",
                f"- Begründung: {row['reuse_note']}",
                "",
            ]
        )

    lines.extend(["## Noch zu klären", ""])
    for row in pending:
        lines.extend(
            [
                f"### {row['title']}",
                f"- URL: {row['url']}",
                f"- Einstufung: {row['reuse_status']}",
                f"- Begründung: {row['reuse_note']}",
                "",
            ]
        )

    return "\n".join(lines).strip() + "\n"


def render_structure_md() -> str:
    oberthemen_by_id = {item["id"]: item for item in OBERTHEMEN}
    lines = [
        "# Oberthemen-Arbeitsstruktur",
        "",
        "Diese Struktur hält die Recherche-Anker fest. Sie trennt bewusst zwischen Bereichen, Oberthemen und Thema-Objekten.",
        "",
        "## Begriffslogik",
        "",
        "- Bereich: Ausbildungsjahr oder Prüfungsteil",
        "- Oberthema: fachlicher Hauptblock, nach dem gezielt recherchiert wird",
        "- Thema-Objekt: kleinste fachliche Einheit, zu der direkt Aufgaben gebaut werden können",
        "",
        "## Bereiche",
        "",
    ]
    for area in AREAS:
        lines.append(f"### {area['label']}")
        lines.append(f"- Hinweis: {area['notes']}")
        lines.append("- Oberthemen:")
        for oberthema_id in AREA_OBERTHEMA[area["id"]]:
            lines.append(f"  - {oberthemen_by_id[oberthema_id]['label']}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def render_definition_seed_md(concepts: list[dict[str, str]]) -> str:
    oberthemen_by_id = {item["id"]: item for item in OBERTHEMEN}
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for item in concepts:
        grouped[oberthema_for_concept(item)].append(item)

    lines = [
        "# Begriffserklärungen Ausgangsbasis",
        "",
        "Diese Datei bündelt nur den bereits vorhandenen Bestand aus den internen Arbeitsdateien.",
        "Sie ist noch nicht die finale, kommerziell geprüfte Außenrecherche.",
        "",
        "## Verwendete Bestandsdateien",
        "",
        "- Kurse/Ausbildungsrahmenplan.md",
        "- QuizMaster/legacy/doomscroll_quiz_quellenbasis.md",
        "- QuizMaster/legacy/ap2_fiae_gesamtpool_themenmatrix.md",
        "- QuizMaster/scripts/generate_pv2fiae_megaquiz.py",
        "",
        f"## Aktuell erklärte Thema-Objekte: {len(concepts)}",
        "",
    ]

    for oberthema_id in sorted(grouped, key=lambda key: oberthemen_by_id[key]["label"]):
        items = sorted(grouped[oberthema_id], key=lambda row: row["term"])
        lines.append(f"## {oberthemen_by_id[oberthema_id]['label']}")
        lines.append(f"- Oberthema-Beschreibung: {oberthemen_by_id[oberthema_id]['short_description']}")
        lines.append(f"- Aktuell erklärte Thema-Objekte: {len(items)}")
        lines.append("")
        for item in items:
            lines.append(f"### {item['term']}")
            lines.append(f"- ID: `{item['id']}`")
            lines.append(f"- Definition: {item['definition']}")
            lines.append(f"- Beispiel: {item['example']}")
            lines.append(f"- Gegenbeispiel: {item['non_example']}")
            lines.append(f"- Gute Praxis: {item['best_practice']}")
            lines.append(f"- Typisches Risiko: {item['risk']}")
            lines.append(f"- Abgrenzung zu: {item['contrast_term']}")
            lines.append(f"- Unterschied: {item['contrast_diff']}")
            lines.append(f"- Typischer Denkfehler: {item['false_claim']}")
            lines.append("")

    return "\n".join(lines).strip() + "\n"


def write_outputs(concepts: list[dict[str, str]]) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (QUIZMASTER / "KommerziellNutzbareQuellen.md").write_text(
        render_initial_sources_md(),
        encoding="utf-8",
    )
    (QUIZMASTER / "Oberthemen_Arbeitsstruktur.md").write_text(
        render_structure_md(),
        encoding="utf-8",
    )
    (QUIZMASTER / "Begriffserklärungen_Ausgangsbasis.md").write_text(
        render_definition_seed_md(concepts),
        encoding="utf-8",
    )


def main() -> None:
    concepts = load_concepts()
    write_outputs(concepts)
    with ensure_clean_db(DB_PATH) as conn:
        create_schema(conn)
        seed_db(conn, concepts)

    enhancer_path = QUIZMASTER / "scripts" / "enhance_quizmaster_filters.py"
    spec = importlib.util.spec_from_file_location("quizmaster_enhancer", enhancer_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    stats = module.enhance_database(DB_PATH, QUIZMASTER)

    with sqlite3.connect(DB_PATH) as conn:
        allowed_source_count = conn.execute(
            "SELECT COUNT(*) FROM sources WHERE reuse_status = 'allowed'"
        ).fetchone()[0]

    print(f"Wrote database to {DB_PATH}")
    print(f"areas={stats['areas']}")
    print(f"oberthemen={stats['oberthemen']}")
    print(f"thema_objekte={stats['thema_objekte']}")
    print(f"curriculum_nodes={stats['curriculum_nodes']}")
    print(f"curriculum_links={stats['curriculum_links']}")
    print(f"allowed_external_sources={allowed_source_count}")


if __name__ == "__main__":
    main()
