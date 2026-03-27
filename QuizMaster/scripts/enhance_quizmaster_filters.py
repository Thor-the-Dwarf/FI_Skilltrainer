#!/usr/bin/env python3

from __future__ import annotations

import sqlite3
from pathlib import Path


def seed_thema(
    thema_objekt_id: str,
    label: str,
    oberthema_id: str,
    definition: str,
    example_text: str,
    risk_text: str,
    contrast_label: str,
    contrast_diff: str,
    source_id: str,
    misconception_text: str | None = None,
) -> dict[str, str]:
    return {
        "thema_objekt_id": thema_objekt_id,
        "label": label,
        "oberthema_id": oberthema_id,
        "definition": definition,
        "example_text": example_text,
        "non_example_text": f"Ein Fall, der eher {contrast_label} betrifft als {label}.",
        "best_practice_text": f"Zweck, Grenzen und Einsatz von {label} sauber von benachbarten Themen trennen.",
        "risk_text": risk_text,
        "contrast_label": contrast_label,
        "contrast_diff": contrast_diff,
        "misconception_text": misconception_text or f"{label} ist nicht einfach nur {contrast_label}.",
        "source_id": source_id,
        "origin_path": "QuizMaster/scripts/enhance_quizmaster_filters.py",
        "extraction_status": "seed_from_curriculum_filters",
    }


def curriculum_node(
    node_id: str,
    framework: str,
    label: str,
    node_type: str,
    *,
    parent_node_id: str | None = None,
    area_id: str | None = None,
    specialty: str = "alle",
    source_id: str = "internal_ausbildungsrahmenplan",
    sort_order: int = 0,
    notes: str = "",
    oberthemen: list[str] | None = None,
    direct_theme_ids: list[str] | None = None,
) -> dict[str, object]:
    return {
        "node_id": node_id,
        "framework": framework,
        "parent_node_id": parent_node_id,
        "label": label,
        "node_type": node_type,
        "area_id": area_id,
        "specialty": specialty,
        "source_id": source_id,
        "sort_order": sort_order,
        "notes": notes,
        "oberthemen": oberthemen or [],
        "direct_theme_ids": direct_theme_ids or [],
    }


EXTRA_SOURCES = [
    {
        "source_id": "external_fiausbv_anlage",
        "title": "FIAusbV Anlage Ausbildungsrahmenplan",
        "url": "https://www.gesetze-im-internet.de/fiausbv/anlage.html",
        "source_group": "external_official",
        "reuse_status": "allowed",
        "reuse_note": "Amtliche Anlage der FIAusbV; als amtliches Werk nach § 5 UrhG als kommerzielle Arbeitsbasis nutzbar.",
    },
    {
        "source_id": "internal_modulplan_screenshots",
        "title": "Nutzer-Screenshots zum Modul- und Ausbildungsplan",
        "url": "thread://screenshots/2026-03-27-modulplan",
        "source_group": "internal_seed",
        "reuse_status": "internal",
        "reuse_note": "Vom Nutzer bereitgestellte Strukturhinweise für zusätzliche Filterebenen wie Fachspezifisches Modul II und Projektmanagement und Projektarbeit.",
    },
]


EXTRA_OBERTHEMEN = [
    {
        "oberthema_id": "prozessanalyse_und_monitoring",
        "label": "Prozessanalyse, Monitoring und Datenqualität",
        "short_description": "Prozessdarstellung, Kennzahlen, Monitoringsysteme, Datenqualität und auswertungsbezogene Optimierung.",
        "scope": "Spezialisierung",
        "source_basis": "FIAusbV Abschnitt D sowie Nutzer-Screenshots",
    },
    {
        "oberthema_id": "arbeitssicherheit_und_umweltschutz",
        "label": "Arbeitssicherheit und Umweltschutz",
        "short_description": "Arbeitsschutz, Unfallverhütung, Brandschutz, Umweltschutz und ressourcenschonendes Verhalten.",
        "scope": "gemeinsame Grundlagen",
        "source_basis": "FIAusbV Abschnitt F sowie Nutzer-Screenshots",
    },
]


EXTRA_AREA_OBERTHEMA = {
    "ausbildungsjahr_1": ["arbeitssicherheit_und_umweltschutz"],
    "ausbildungsjahr_2": ["arbeitssicherheit_und_umweltschutz"],
    "ausbildungsjahr_3": ["prozessanalyse_und_monitoring", "arbeitssicherheit_und_umweltschutz"],
    "pruefung_1": ["arbeitssicherheit_und_umweltschutz"],
    "pruefung_2_2": ["prozessanalyse_und_monitoring"],
    "pruefung_2_3": ["arbeitssicherheit_und_umweltschutz"],
}


EXTRA_THEMEN = [
    seed_thema(
        "proj_projektdefinition",
        "Projektdefinition",
        "projektmanagement_und_wirtschaftlichkeit",
        "die klare Festlegung von Ausgangslage, Ziel, Rahmen und Ergebnis eines Projekts",
        "Zu Beginn eines Vorhabens wird schriftlich festgehalten, welches Problem gelöst und welches Ergebnis erreicht werden soll.",
        "Ohne Projektdefinition laufen Zielbild, Aufwand und Zuständigkeiten auseinander.",
        "spontane Aufgabenliste",
        "Eine Projektdefinition grenzt Ziel und Rahmen ab, eine spontane Aufgabenliste enthält nur lose Tätigkeiten.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_smart_prinzip",
        "SMART-Prinzip",
        "projektmanagement_und_wirtschaftlichkeit",
        "ein Zielschema, nach dem Ziele spezifisch, messbar, akzeptiert, realistisch und terminiert formuliert werden",
        "Ein Projektziel wird so beschrieben, dass Erfolg, Frist und Umfang nachvollziehbar überprüft werden können.",
        "Unklare Ziele erschweren Planung, Abnahme und Steuerung.",
        "vage Zielbeschreibung",
        "Das SMART-Prinzip macht Ziele überprüfbar, eine vage Zielbeschreibung bleibt auslegbar.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_lastenheft",
        "Lastenheft",
        "projektmanagement_und_wirtschaftlichkeit",
        "die Beschreibung der fachlichen Anforderungen aus Sicht des Auftraggebers",
        "Ein Kunde beschreibt, welche Funktionen, Randbedingungen und Ziele eine Lösung erfüllen muss.",
        "Ohne sauberes Lastenheft werden Anforderungen zu spät oder widersprüchlich sichtbar.",
        "Pflichtenheft",
        "Das Lastenheft beschreibt das Was aus Auftraggebersicht, das Pflichtenheft das Wie aus Umsetzungssicht.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_pflichtenheft",
        "Pflichtenheft",
        "projektmanagement_und_wirtschaftlichkeit",
        "die Beschreibung, wie ein Auftragnehmer die Anforderungen fachlich und technisch umsetzen will",
        "Ein Umsetzungsteam beschreibt Architektur, Abläufe, Schnittstellen und Prüfkriterien für eine Lösung.",
        "Ohne Pflichtenheft fehlen belastbare Aussagen zur geplanten Umsetzung.",
        "Lastenheft",
        "Das Pflichtenheft konkretisiert die Umsetzung, das Lastenheft formuliert die Anforderungen.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_arbeitspaket",
        "Arbeitspaket",
        "projektmanagement_und_wirtschaftlichkeit",
        "eine klar abgegrenzte Einheit von Aufgaben mit Ergebnis, Verantwortung und Aufwand",
        "Ein Teil der Projektarbeit wird mit Zuständigkeit, Inhalt und erwartetem Ergebnis einzeln geplant.",
        "Unklare Arbeitspakete führen zu Doppelarbeit und unklarer Verantwortung.",
        "lose Tätigkeit",
        "Ein Arbeitspaket ist plan- und kontrollierbar, eine lose Tätigkeit ist nicht sauber abgegrenzt.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_projektstrukturplan",
        "Projektstrukturplan",
        "projektmanagement_und_wirtschaftlichkeit",
        "die hierarchische Zerlegung eines Projekts in planbare Teilbereiche und Arbeitspakete",
        "Ein Projekt wird in Phasen, Teilaufgaben und Arbeitspakete gegliedert, damit Zuständigkeiten und Umfang sichtbar werden.",
        "Ohne Projektstrukturplan bleiben Umfang und Abhängigkeiten schwer steuerbar.",
        "Zeitplan",
        "Der Projektstrukturplan zerlegt Inhalte, der Zeitplan ordnet Termine und Reihenfolge.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_zeitplan",
        "Zeitplan",
        "projektmanagement_und_wirtschaftlichkeit",
        "die zeitliche Planung von Vorgängen, Meilensteinen und Terminen",
        "Für Analyse, Umsetzung und Test werden konkrete Zeitfenster und Abhängigkeiten festgelegt.",
        "Ohne Zeitplan werden Verzögerungen erst spät sichtbar.",
        "Projektstrukturplan",
        "Ein Zeitplan legt Reihenfolge und Termine fest, ein Projektstrukturplan gliedert die Inhalte.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_ressourcenplan",
        "Ressourcenplan",
        "projektmanagement_und_wirtschaftlichkeit",
        "die Planung von Personal, Zeit, Material und weiteren benötigten Mitteln",
        "Für ein Vorhaben wird festgelegt, welche Personen, Werkzeuge und Zeiten benötigt werden.",
        "Fehlende Ressourcenplanung erzeugt Engpässe und Terminprobleme.",
        "Kostenplan",
        "Ein Ressourcenplan beschreibt benötigte Mittel, ein Kostenplan bewertet sie finanziell.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_kostenplan",
        "Kostenplan",
        "projektmanagement_und_wirtschaftlichkeit",
        "die strukturierte Planung der erwarteten Projektkosten",
        "Aufwand für Personal, Infrastruktur und externe Leistungen wird vorab finanziell bewertet.",
        "Ohne Kostenplan fehlen belastbare Aussagen zur Wirtschaftlichkeit.",
        "Ressourcenplan",
        "Ein Kostenplan bewertet Kosten, ein Ressourcenplan beschreibt die eingesetzten Mittel.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_qualitaetsplan",
        "Qualitätsplan",
        "projektmanagement_und_wirtschaftlichkeit",
        "die Festlegung von Qualitätszielen, Prüfungen, Nachweisen und Verantwortlichkeiten im Projekt",
        "Ein Projekt legt fest, wann getestet, dokumentiert und anhand welcher Kriterien geprüft wird.",
        "Ohne Qualitätsplan bleiben Qualitätsziele und Prüfpunkte unscharf.",
        "Testprotokoll",
        "Ein Qualitätsplan legt Regeln und Prüfpunkte fest, ein Testprotokoll dokumentiert einzelne Prüfergebnisse.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_kickoff_meeting",
        "Kick-off-Meeting",
        "projektmanagement_und_wirtschaftlichkeit",
        "das formale Starttreffen eines Projekts zur Klärung von Ziel, Rollen, Vorgehen und Organisation",
        "Zum Projektstart werden Erwartungen, Zuständigkeiten und Kommunikationswege gemeinsam abgestimmt.",
        "Ohne sauberen Starttermin bleibt die Arbeitsorganisation oft unklar.",
        "Statusmeeting",
        "Ein Kick-off startet ein Projekt, ein Statusmeeting verfolgt einen laufenden Stand.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_abnahme",
        "Abnahme",
        "projektmanagement_und_wirtschaftlichkeit",
        "die formale Bestätigung, dass ein Ergebnis die vereinbarten Anforderungen erfüllt",
        "Nach Prüfung der vereinbarten Kriterien bestätigt der Auftraggeber die Leistung.",
        "Ohne Abnahme bleibt unklar, ob die vereinbarte Leistung als erfüllt gilt.",
        "Zwischenfeedback",
        "Eine Abnahme ist formal und abschließend, Zwischenfeedback begleitet nur den Verlauf.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "proj_abschlussbericht",
        "Abschlussbericht",
        "projektmanagement_und_wirtschaftlichkeit",
        "die strukturierte Zusammenfassung von Verlauf, Ergebnis, Abweichungen und Erkenntnissen eines Projekts",
        "Zum Projektende werden Ergebnisse, offene Punkte und Lernerfahrungen nachvollziehbar dokumentiert.",
        "Ohne Abschlussbericht gehen Erfahrungen und Nachweise leicht verloren.",
        "Statusnotiz",
        "Ein Abschlussbericht bewertet das gesamte Vorhaben, eine Statusnotiz beschreibt nur einen Zwischenstand.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "safe_arbeitsschutz",
        "Arbeitsschutz",
        "arbeitssicherheit_und_umweltschutz",
        "alle Maßnahmen und Regeln zum Schutz von Sicherheit und Gesundheit bei der Arbeit",
        "Ein Arbeitsplatz wird so organisiert, dass Gefährdungen erkannt und Schutzmaßnahmen umgesetzt werden.",
        "Missachteter Arbeitsschutz erhöht Unfall- und Gesundheitsrisiken.",
        "reine Bequemlichkeitsregel",
        "Arbeitsschutz schützt Menschen vor Gefährdung, eine Bequemlichkeitsregel nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "safe_unfallverhuetung",
        "Unfallverhütung",
        "arbeitssicherheit_und_umweltschutz",
        "vorbeugende Maßnahmen zur Vermeidung von Arbeitsunfällen",
        "Gefährliche Situationen werden erkannt und vor Beginn der Tätigkeit abgesichert.",
        "Ohne Unfallverhütung steigen Personen- und Sachschäden.",
        "Reparaturmaßnahme nach dem Schaden",
        "Unfallverhütung wirkt vorbeugend, eine Reparaturmaßnahme reagiert erst nach dem Ereignis.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "safe_brandschutz",
        "Brandschutz",
        "arbeitssicherheit_und_umweltschutz",
        "organisatorische und technische Maßnahmen zur Vermeidung und Bekämpfung von Bränden",
        "Fluchtwege, Brandmelder und passende Reaktionen im Brandfall werden geplant und geübt.",
        "Fehlender Brandschutz gefährdet Menschen, Betrieb und Infrastruktur.",
        "allgemeiner Gebäudekomfort",
        "Brandschutz schützt vor Brandfolgen, allgemeiner Gebäudekomfort nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "safe_umweltschutz",
        "Umweltschutz",
        "arbeitssicherheit_und_umweltschutz",
        "Maßnahmen zur Verringerung negativer Umweltwirkungen im betrieblichen Handeln",
        "Ein Betrieb achtet auf Entsorgung, Materialverbrauch und umweltschonende Abläufe.",
        "Missachteter Umweltschutz verursacht unnötige Belastungen und Regelverstöße.",
        "reine Kostenfrage",
        "Umweltschutz betrifft ökologische Verantwortung und Regeln, nicht nur Kosten.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "dpa_prozessanalyse",
        "Prozessanalyse",
        "prozessanalyse_und_monitoring",
        "die systematische Untersuchung eines Arbeits- oder Geschäftsprozesses auf Ablauf, Beteiligte, Schwachstellen und Ziele",
        "Ein Prozess wird aufgenommen, beschrieben und auf Engpässe oder Medienbrüche geprüft.",
        "Ohne Prozessanalyse werden Probleme häufig nur technisch statt fachlich betrachtet.",
        "Einzellösung ohne Prozesssicht",
        "Eine Prozessanalyse betrachtet den Gesamtablauf, eine Einzellösung nur einen Ausschnitt.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "dpa_datenquelle",
        "Datenquelle",
        "prozessanalyse_und_monitoring",
        "der Ursprung von Daten, aus dem Informationen übernommen oder ausgewertet werden",
        "Daten stammen etwa aus Office-Dateien, Webquellen, Cloud-Diensten oder Datenbanken.",
        "Unklare Datenquellen erschweren Qualität, Rechteprüfung und Nachvollziehbarkeit.",
        "Datenziel",
        "Eine Datenquelle liefert Daten, ein Datenziel nimmt sie auf.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "dpa_datenklassifizierung",
        "Datenklassifizierung",
        "prozessanalyse_und_monitoring",
        "die Einordnung von Daten nach Schutzbedarf, Sensibilität oder Verwendungsart",
        "Daten werden etwa nach intern, vertraulich oder besonders schutzwürdig unterschieden.",
        "Ohne Datenklassifizierung werden Schutzmaßnahmen oft falsch gewählt.",
        "beliebige Dateibenennung",
        "Datenklassifizierung bewertet Schutz- und Verwendungsbedarf, eine Dateibenennung nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "dpa_kennzahl",
        "Kennzahl",
        "prozessanalyse_und_monitoring",
        "eine verdichtete Messgröße zur Bewertung von Leistung, Qualität oder Zielerreichung",
        "Bearbeitungszeiten, Fehlerraten oder Auslastungen werden als Kennzahlen ausgewertet.",
        "Ungeeignete Kennzahlen führen zu falschen Entscheidungen.",
        "Einzelbeobachtung",
        "Eine Kennzahl verdichtet Messwerte systematisch, eine Einzelbeobachtung nicht.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "dpa_monitoringsystem",
        "Monitoringsystem",
        "prozessanalyse_und_monitoring",
        "ein System zur laufenden Beobachtung von Zuständen, Kennzahlen und Abweichungen",
        "Messwerte und Warnschwellen werden fortlaufend erfasst und ausgewertet.",
        "Ohne Monitoringsystem bleiben kritische Abweichungen oft zu lange unbemerkt.",
        "Einmalige Auswertung",
        "Ein Monitoringsystem beobachtet laufend, eine einmalige Auswertung nur punktuell.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_berechtigungskonzept",
        "Berechtigungskonzept",
        "it_sicherheit_und_datenschutz",
        "die Festlegung, wer auf welche Systeme, Daten und Funktionen in welchem Umfang zugreifen darf",
        "Rollen und Rechte werden so beschrieben, dass nur passende Zugriffe möglich sind.",
        "Ohne Berechtigungskonzept entstehen Überberechtigungen und unnötige Risiken.",
        "spontane Freigabe",
        "Ein Berechtigungskonzept ist systematisch und nachvollziehbar, eine spontane Freigabe nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_datensicherungskonzept",
        "Datensicherungskonzept",
        "it_sicherheit_und_datenschutz",
        "die geplante Regelung, wie Daten gesichert, aufbewahrt und wiederhergestellt werden",
        "Ein Betrieb legt Sicherungsart, Rhythmus, Aufbewahrung und Prüfungen der Wiederherstellung fest.",
        "Ohne Datensicherungskonzept bleibt unklar, ob und wie Daten nach einem Vorfall zurückgeholt werden können.",
        "Einzelbackup",
        "Ein Datensicherungskonzept beschreibt die Gesamtregelung, ein Einzelbackup nur eine einzelne Sicherung.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_systemwiederherstellung",
        "Systemwiederherstellung",
        "it_sicherheit_und_datenschutz",
        "die Rückführung eines Systems in einen funktionsfähigen Zustand nach Ausfall oder Schaden",
        "Nach einem Vorfall werden Daten, Dienste und Konfiguration kontrolliert wiederhergestellt.",
        "Ohne geübte Wiederherstellung verlängern sich Ausfälle unnötig.",
        "Neuinstallation ohne Zielbild",
        "Systemwiederherstellung stellt gezielt den Sollzustand wieder her, eine beliebige Neuinstallation nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_systemuebergabe",
        "Systemübergabe",
        "service_und_supportprozesse",
        "die abgestimmte Übergabe eines Systems an Betrieb, Support oder Kunden nach Umsetzung und Prüfung",
        "Vor der Nutzung werden Zuständigkeiten, Dokumentation und Betriebsinformationen übergeben.",
        "Ohne saubere Übergabe entstehen Wissenslücken und Betriebsprobleme.",
        "bloßer Versand eines Links",
        "Eine Systemübergabe umfasst abgestimmte Informationen und Verantwortung, ein bloßer Versand eines Links nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_systemauslastung",
        "Systemauslastung",
        "netzwerkdienste_und_virtualisierung",
        "die Inanspruchnahme von Ressourcen wie CPU, Speicher, Netz oder Speicherplatz durch ein System",
        "Ein Betrieb beobachtet Lastwerte, um Engpässe und Überlasten früh zu erkennen.",
        "Unbeobachtete Auslastung führt leicht zu Leistungsproblemen und Ausfällen.",
        "Einmalige Systembeschreibung",
        "Systemauslastung beschreibt laufende Ressourcennutzung, eine einmalige Systembeschreibung nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_stoerungsmeldung",
        "Störungsmeldung",
        "service_und_supportprozesse",
        "die strukturierte Meldung eines Problems oder Ausfalls an Support oder Betrieb",
        "Ein Vorfall wird mit Symptomen, Zeitpunkt und betroffenen Systemen nachvollziehbar aufgenommen.",
        "Unvollständige Störungsmeldungen verlangsamen Analyse und Behebung.",
        "vage Beschwerde",
        "Eine Störungsmeldung enthält verwertbare technische Informationen, eine vage Beschwerde nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_netzwerkprotokoll",
        "Netzwerkprotokoll",
        "netzwerke_und_adressierung",
        "eine festgelegte Regelmenge für Aufbau, Austausch und Interpretation von Daten in Netzwerken",
        "Beteiligte Systeme kommunizieren nach gemeinsam vereinbarten Regeln über das Netz.",
        "Unpassende Protokollwahl führt zu Kommunikations- und Integrationsproblemen.",
        "Netzwerkkabel",
        "Ein Netzwerkprotokoll regelt die Kommunikation, ein Netzwerkkabel ist nur das Übertragungsmedium.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "sys_netzwerkschnittstelle",
        "Netzwerkschnittstelle",
        "netzwerke_und_adressierung",
        "eine technische Anbindung, über die Systeme Daten in einem Netzwerk senden und empfangen",
        "Eine Komponente stellt eine definierte Verbindung zu anderen Netzwerkteilnehmern her.",
        "Fehlende oder falsch konfigurierte Schnittstellen verhindern Kommunikation.",
        "Anwendungsfenster",
        "Eine Netzwerkschnittstelle verbindet Systeme technisch, ein Anwendungsfenster nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "dv_cyber_physisches_system",
        "Cyber-physisches System",
        "cyber_physische_systeme_und_iot",
        "ein System, in dem Software, Vernetzung, Sensorik und physische Prozesse eng zusammenwirken",
        "Sensoren, Aktoren und Software steuern gemeinsam einen realen technischen Ablauf.",
        "Wer cyber-physische Systeme nur als normales Büroprogramm betrachtet, unterschätzt Echtzeit- und Sicherheitsanforderungen.",
        "reine Office-Anwendung",
        "Ein cyber-physisches System koppelt digitale Logik mit physischen Prozessen, eine reine Office-Anwendung nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "dv_anomalieerkennung",
        "Anomalieerkennung",
        "cyber_physische_systeme_und_iot",
        "das Erkennen auffälliger Abweichungen von erwarteten Zuständen oder Messwerten",
        "Messwerte werden so überwacht, dass ungewöhnliche Muster als Warnsignal erkannt werden.",
        "Ohne Anomalieerkennung bleiben Störungen und Angriffe länger unbemerkt.",
        "Normalbetrieb",
        "Anomalieerkennung sucht gezielt Abweichungen, Normalbetrieb beschreibt den erwarteten Zustand.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "doc_technische_dokumentation",
        "Technische Dokumentation",
        "praesentation_dokumentation_und_reflexion",
        "eine strukturierte Beschreibung von Aufbau, Betrieb, Nutzung oder Pflege eines technischen Systems",
        "Ein System wird so dokumentiert, dass Betrieb, Support und Weiterentwicklung nachvollziehbar möglich sind.",
        "Fehlende technische Dokumentation erschwert Übergabe, Pflege und Fehlersuche.",
        "mündliche Einzelabsprache",
        "Technische Dokumentation ist dauerhaft und nachvollziehbar, eine mündliche Einzelabsprache nicht.",
        "external_fiausbv_anlage",
    ),
    seed_thema(
        "test_testplan",
        "Testplan",
        "testen_und_qualitaetssicherung",
        "die geplante Festlegung von Testzielen, Testumfang, Verfahren, Zuständigkeiten und Terminen",
        "Vor Beginn der Tests wird festgelegt, was geprüft wird, wie geprüft wird und wer verantwortlich ist.",
        "Ohne Testplan bleiben Umfang und Verantwortung von Tests unscharf.",
        "Einzelner Testfall",
        "Ein Testplan beschreibt den Gesamtansatz, ein Testfall nur eine konkrete Prüfung.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "test_testfall",
        "Testfall",
        "testen_und_qualitaetssicherung",
        "eine konkrete Prüfsituation mit Eingaben, Schritten und erwartetem Ergebnis",
        "Für eine definierte Eingabe wird festgelegt, welches Verhalten das System zeigen muss.",
        "Unpräzise Testfälle erzeugen unklare Ergebnisse.",
        "Teststrategie",
        "Ein Testfall beschreibt eine einzelne Prüfung, eine Teststrategie die übergeordnete Ausrichtung.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "test_testprotokoll",
        "Testprotokoll",
        "testen_und_qualitaetssicherung",
        "die nachvollziehbare Dokumentation eines Testdurchlaufs und seiner Ergebnisse",
        "Nach einem Test werden Durchführung, Beobachtung und Ergebnis sauber festgehalten.",
        "Ohne Testprotokoll lassen sich Ergebnisse später schlecht nachweisen.",
        "Testplan",
        "Ein Testprotokoll dokumentiert die Durchführung, ein Testplan die vorherige Planung.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "test_testauswertung",
        "Testauswertung",
        "testen_und_qualitaetssicherung",
        "die fachliche Bewertung von Testergebnissen, Abweichungen und daraus abgeleiteten Maßnahmen",
        "Testdaten werden so bewertet, dass Fehler, Risiken und nächste Schritte sichtbar werden.",
        "Ohne Testauswertung bleiben Ergebnisse ohne klare Konsequenz.",
        "Rohdatenliste",
        "Eine Testauswertung bewertet Ergebnisse, eine Rohdatenliste sammelt sie nur.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "arch_entwicklungsumgebung",
        "Entwicklungsumgebung",
        "softwarearchitektur_und_entwurfsmuster",
        "die Arbeitsumgebung aus Werkzeugen, Einstellungen und Hilfsmitteln zur Softwareentwicklung",
        "Ein Team nutzt IDE, Build-Werkzeuge, Testwerkzeuge und Konfigurationen für die Umsetzung.",
        "Ungeeignete Entwicklungsumgebungen bremsen Umsetzung und Qualität.",
        "Produktivsystem",
        "Eine Entwicklungsumgebung dient der Erstellung und Prüfung, ein Produktivsystem dem laufenden Betrieb.",
        "internal_modulplan_screenshots",
    ),
    seed_thema(
        "arch_framework",
        "Framework",
        "softwarearchitektur_und_entwurfsmuster",
        "ein vorgegebener Anwendungsrahmen mit Strukturen, Regeln und Hilfsfunktionen für eine bestimmte Art von Software",
        "Ein Projekt nutzt einen bestehenden Rahmen, um Oberflächen, Anfragen oder Komponenten schneller umzusetzen.",
        "Wer ein Framework mit einer beliebigen Bibliothek gleichsetzt, übersieht oft seine vorgegebene Struktur.",
        "Bibliothek",
        "Ein Framework gibt stärker Struktur und Ablauf vor, eine Bibliothek liefert eher gezielte Bausteine.",
        "internal_modulplan_screenshots",
    ),
]


CURRICULUM_NODES = [
    curriculum_node(
        "curriculum_year_1",
        "ausbildungsjahr",
        "Ausbildungsjahr 1",
        "year",
        area_id="ausbildungsjahr_1",
        sort_order=1,
        notes="Gemeinsame Grundlagen des ersten Ausbildungsjahres.",
        oberthemen=[
            "ausbildung_und_betriebsrolle",
            "arbeitsrecht_und_mitbestimmung",
            "betrieb_markt_und_wertschoepfung",
            "praesentation_dokumentation_und_reflexion",
            "hardware_und_arbeitsplatzsysteme",
            "netzwerke_und_adressierung",
            "it_sicherheit_und_datenschutz",
            "datenmodellierung_und_normalisierung",
            "sql_und_relationale_datenpraxis",
            "arbeitssicherheit_und_umweltschutz",
        ],
    ),
    curriculum_node(
        "curriculum_year_2",
        "ausbildungsjahr",
        "Ausbildungsjahr 2",
        "year",
        area_id="ausbildungsjahr_2",
        sort_order=2,
        notes="Gemeinsame Grundlagen des zweiten Ausbildungsjahres.",
        oberthemen=[
            "service_und_supportprozesse",
            "cyber_physische_systeme_und_iot",
            "datenintegration_und_datenaustausch",
            "objektorientierung_und_uml",
            "anforderungen_ux_und_barrierefreiheit",
            "testen_und_qualitaetssicherung",
            "netzwerkdienste_und_virtualisierung",
            "projektmanagement_und_wirtschaftlichkeit",
            "it_sicherheit_und_datenschutz",
            "arbeitssicherheit_und_umweltschutz",
        ],
    ),
    curriculum_node(
        "curriculum_year_3",
        "ausbildungsjahr",
        "Ausbildungsjahr 3",
        "year",
        area_id="ausbildungsjahr_3",
        sort_order=3,
        notes="Spezialisierungsbezogene Vertiefung.",
        oberthemen=[
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
            "prozessanalyse_und_monitoring",
            "arbeitssicherheit_und_umweltschutz",
        ],
    ),
    curriculum_node(
        "lf01",
        "lernfeld",
        "Lernfeld 1: Das Unternehmen und die eigene Rolle im Betrieb beschreiben",
        "learning_field",
        parent_node_id="curriculum_year_1",
        area_id="ausbildungsjahr_1",
        sort_order=1,
        notes="Repo-basierte Lernfeldstruktur.",
        oberthemen=[
            "ausbildung_und_betriebsrolle",
            "arbeitsrecht_und_mitbestimmung",
            "betrieb_markt_und_wertschoepfung",
            "praesentation_dokumentation_und_reflexion",
        ],
    ),
    curriculum_node(
        "lf02",
        "lernfeld",
        "Lernfeld 2: Arbeitsplätze nach Kundenwunsch ausstatten",
        "learning_field",
        parent_node_id="curriculum_year_1",
        area_id="ausbildungsjahr_1",
        sort_order=2,
        oberthemen=["hardware_und_arbeitsplatzsysteme", "projektmanagement_und_wirtschaftlichkeit"],
    ),
    curriculum_node(
        "lf03",
        "lernfeld",
        "Lernfeld 3: Clients in Netzwerke einbinden",
        "learning_field",
        parent_node_id="curriculum_year_1",
        area_id="ausbildungsjahr_1",
        sort_order=3,
        oberthemen=["netzwerke_und_adressierung", "web_apis_und_schnittstellen"],
    ),
    curriculum_node(
        "lf04",
        "lernfeld",
        "Lernfeld 4: Schutzbedarfsanalyse im eigenen Arbeitsbereich durchführen",
        "learning_field",
        parent_node_id="curriculum_year_1",
        area_id="ausbildungsjahr_1",
        sort_order=4,
        oberthemen=["it_sicherheit_und_datenschutz", "arbeitssicherheit_und_umweltschutz"],
    ),
    curriculum_node(
        "lf05",
        "lernfeld",
        "Lernfeld 5: Software zur Verwaltung von Daten anpassen",
        "learning_field",
        parent_node_id="curriculum_year_1",
        area_id="ausbildungsjahr_1",
        sort_order=5,
        oberthemen=[
            "datenmodellierung_und_normalisierung",
            "sql_und_relationale_datenpraxis",
            "testen_und_qualitaetssicherung",
        ],
    ),
    curriculum_node(
        "lf06",
        "lernfeld",
        "Lernfeld 6: Serviceanfragen bearbeiten",
        "learning_field",
        parent_node_id="curriculum_year_2",
        area_id="ausbildungsjahr_2",
        sort_order=6,
        oberthemen=["service_und_supportprozesse", "praesentation_dokumentation_und_reflexion"],
    ),
    curriculum_node(
        "lf07",
        "lernfeld",
        "Lernfeld 7: Cyber-physische Systeme ergänzen",
        "learning_field",
        parent_node_id="curriculum_year_2",
        area_id="ausbildungsjahr_2",
        sort_order=7,
        oberthemen=["cyber_physische_systeme_und_iot", "it_sicherheit_und_datenschutz"],
    ),
    curriculum_node(
        "lf08",
        "lernfeld",
        "Lernfeld 8: Daten systemübergreifend bereitstellen",
        "learning_field",
        parent_node_id="curriculum_year_2",
        area_id="ausbildungsjahr_2",
        sort_order=8,
        oberthemen=[
            "datenintegration_und_datenaustausch",
            "objektorientierung_und_uml",
            "anforderungen_ux_und_barrierefreiheit",
            "testen_und_qualitaetssicherung",
        ],
    ),
    curriculum_node(
        "lf09",
        "lernfeld",
        "Lernfeld 9: Netzwerke und Dienste bereitstellen",
        "learning_field",
        parent_node_id="curriculum_year_2",
        area_id="ausbildungsjahr_2",
        sort_order=9,
        oberthemen=[
            "netzwerkdienste_und_virtualisierung",
            "projektmanagement_und_wirtschaftlichkeit",
            "it_sicherheit_und_datenschutz",
        ],
    ),
    curriculum_node(
        "lf10_fiae",
        "lernfeld",
        "Lernfeld 10 FIAE: Benutzerschnittstellen gestalten und entwickeln",
        "learning_field",
        parent_node_id="curriculum_year_3",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        sort_order=10,
        oberthemen=["anforderungen_ux_und_barrierefreiheit", "softwarearchitektur_und_entwurfsmuster"],
    ),
    curriculum_node(
        "lf11_fiae",
        "lernfeld",
        "Lernfeld 11 FIAE: Funktionalität in Anwendungen realisieren",
        "learning_field",
        parent_node_id="curriculum_year_3",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        sort_order=11,
        oberthemen=[
            "algorithmen_und_datenstrukturen",
            "objektorientierung_und_uml",
            "datenmodellierung_und_normalisierung",
            "web_apis_und_schnittstellen",
        ],
    ),
    curriculum_node(
        "lf12_fiae",
        "lernfeld",
        "Lernfeld 12 FIAE: Kundenspezifische Anwendungsentwicklung durchführen",
        "learning_field",
        parent_node_id="curriculum_year_3",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        sort_order=12,
        oberthemen=[
            "projektmanagement_und_wirtschaftlichkeit",
            "praesentation_dokumentation_und_reflexion",
            "testen_und_qualitaetssicherung",
        ],
    ),
    curriculum_node(
        "fiausbv_root",
        "ausbildungsrahmenplan_official",
        "Ausbildungsrahmenplan (FIAusbV, amtliche Anlage)",
        "framework_root",
        source_id="external_fiausbv_anlage",
        sort_order=100,
        notes="Offizielle Anlage der Fachinformatikerausbildungsverordnung.",
    ),
    curriculum_node(
        "fiausbv_a",
        "ausbildungsrahmenplan_official",
        "Abschnitt A: fachrichtungsübergreifende berufsprofilgebende Fertigkeiten, Kenntnisse und Fähigkeiten",
        "official_section",
        parent_node_id="fiausbv_root",
        source_id="external_fiausbv_anlage",
        sort_order=101,
        specialty="alle",
        oberthemen=[
            "projektmanagement_und_wirtschaftlichkeit",
            "praesentation_dokumentation_und_reflexion",
            "hardware_und_arbeitsplatzsysteme",
            "algorithmen_und_datenstrukturen",
            "datenmodellierung_und_normalisierung",
            "sql_und_relationale_datenpraxis",
            "testen_und_qualitaetssicherung",
            "it_sicherheit_und_datenschutz",
            "service_und_supportprozesse",
            "netzwerke_und_adressierung",
        ],
    ),
    curriculum_node(
        "fiausbv_a_1",
        "ausbildungsrahmenplan_official",
        "Planen, Vorbereiten und Durchführen von Arbeitsaufgaben",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=1,
        oberthemen=["projektmanagement_und_wirtschaftlichkeit", "praesentation_dokumentation_und_reflexion"],
        direct_theme_ids=[
            "proj_projektdefinition",
            "proj_smart_prinzip",
            "proj_arbeitspaket",
            "proj_zeitplan",
            "proj_kostenplan",
        ],
    ),
    curriculum_node(
        "fiausbv_a_2",
        "ausbildungsrahmenplan_official",
        "Informieren und Beraten von Kunden und Kundinnen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=2,
        oberthemen=["anforderungen_ux_und_barrierefreiheit", "praesentation_dokumentation_und_reflexion", "betrieb_markt_und_wertschoepfung"],
    ),
    curriculum_node(
        "fiausbv_a_3",
        "ausbildungsrahmenplan_official",
        "Beurteilen marktgängiger IT-Systeme und kundenspezifischer Lösungen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=3,
        oberthemen=["hardware_und_arbeitsplatzsysteme", "betrieb_markt_und_wertschoepfung", "projektmanagement_und_wirtschaftlichkeit"],
    ),
    curriculum_node(
        "fiausbv_a_4",
        "ausbildungsrahmenplan_official",
        "Entwickeln, Erstellen und Betreuen von IT-Lösungen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=4,
        oberthemen=[
            "algorithmen_und_datenstrukturen",
            "datenmodellierung_und_normalisierung",
            "sql_und_relationale_datenpraxis",
            "softwarearchitektur_und_entwurfsmuster",
        ],
    ),
    curriculum_node(
        "fiausbv_a_5",
        "ausbildungsrahmenplan_official",
        "Durchführen und Dokumentieren von qualitätssichernden Maßnahmen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=5,
        oberthemen=["testen_und_qualitaetssicherung", "praesentation_dokumentation_und_reflexion"],
        direct_theme_ids=["test_testplan", "test_testprotokoll", "test_testauswertung"],
    ),
    curriculum_node(
        "fiausbv_a_6",
        "ausbildungsrahmenplan_official",
        "Umsetzen, Integrieren und Prüfen von Maßnahmen zur IT-Sicherheit und zum Datenschutz",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=6,
        oberthemen=["it_sicherheit_und_datenschutz"],
        direct_theme_ids=["sys_berechtigungskonzept", "sys_datensicherungskonzept"],
    ),
    curriculum_node(
        "fiausbv_a_7",
        "ausbildungsrahmenplan_official",
        "Erbringen der Leistungen und Auftragsabschluss",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=7,
        oberthemen=["praesentation_dokumentation_und_reflexion", "projektmanagement_und_wirtschaftlichkeit"],
        direct_theme_ids=["proj_abnahme", "proj_abschlussbericht"],
    ),
    curriculum_node(
        "fiausbv_a_8",
        "ausbildungsrahmenplan_official",
        "Betreiben von IT-Systemen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=8,
        oberthemen=["service_und_supportprozesse", "netzwerkdienste_und_virtualisierung", "praesentation_dokumentation_und_reflexion"],
        direct_theme_ids=["sys_stoerungsmeldung", "sys_systemauslastung", "doc_technische_dokumentation"],
    ),
    curriculum_node(
        "fiausbv_a_9",
        "ausbildungsrahmenplan_official",
        "Inbetriebnehmen von Speicherlösungen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=9,
        oberthemen=["datenbankobjekte_und_transaktionen", "it_sicherheit_und_datenschutz"],
        direct_theme_ids=["sys_berechtigungskonzept", "sys_datensicherungskonzept", "sys_systemwiederherstellung"],
    ),
    curriculum_node(
        "fiausbv_a_10",
        "ausbildungsrahmenplan_official",
        "Programmieren von Softwarelösungen",
        "official_part",
        parent_node_id="fiausbv_a",
        source_id="external_fiausbv_anlage",
        sort_order=10,
        oberthemen=["algorithmen_und_datenstrukturen", "datenmodellierung_und_normalisierung", "web_apis_und_schnittstellen"],
        direct_theme_ids=["arch_framework", "arch_entwicklungsumgebung"],
    ),
    curriculum_node(
        "fiausbv_b",
        "ausbildungsrahmenplan_official",
        "Abschnitt B: Fachrichtung Anwendungsentwicklung",
        "official_section",
        parent_node_id="fiausbv_root",
        source_id="external_fiausbv_anlage",
        sort_order=102,
        specialty="fiae",
        oberthemen=[
            "anforderungen_ux_und_barrierefreiheit",
            "softwarearchitektur_und_entwurfsmuster",
            "datenintegration_und_datenaustausch",
            "sql_und_relationale_datenpraxis",
            "testen_und_qualitaetssicherung",
            "versionsverwaltung_und_lieferketten",
            "it_sicherheit_und_datenschutz",
        ],
    ),
    curriculum_node(
        "fiausbv_b_1",
        "ausbildungsrahmenplan_official",
        "Konzipieren und Umsetzen von kundenspezifischen Softwareanwendungen",
        "official_part",
        parent_node_id="fiausbv_b",
        source_id="external_fiausbv_anlage",
        specialty="fiae",
        sort_order=1,
        oberthemen=[
            "anforderungen_ux_und_barrierefreiheit",
            "softwarearchitektur_und_entwurfsmuster",
            "objektorientierung_und_uml",
            "datenintegration_und_datenaustausch",
            "sql_und_relationale_datenpraxis",
            "web_apis_und_schnittstellen",
        ],
        direct_theme_ids=["arch_entwicklungsumgebung", "arch_framework"],
    ),
    curriculum_node(
        "fiausbv_b_2",
        "ausbildungsrahmenplan_official",
        "Sicherstellen der Qualität von Softwareanwendungen",
        "official_part",
        parent_node_id="fiausbv_b",
        source_id="external_fiausbv_anlage",
        specialty="fiae",
        sort_order=2,
        oberthemen=["testen_und_qualitaetssicherung", "versionsverwaltung_und_lieferketten", "it_sicherheit_und_datenschutz"],
        direct_theme_ids=["test_testplan", "test_testfall", "test_testprotokoll", "test_testauswertung"],
    ),
    curriculum_node(
        "fiausbv_c",
        "ausbildungsrahmenplan_official",
        "Abschnitt C: Fachrichtung Systemintegration",
        "official_section",
        parent_node_id="fiausbv_root",
        source_id="external_fiausbv_anlage",
        sort_order=103,
        specialty="fisi",
        oberthemen=[
            "netzwerke_und_adressierung",
            "netzwerkdienste_und_virtualisierung",
            "service_und_supportprozesse",
            "it_sicherheit_und_datenschutz",
            "testen_und_qualitaetssicherung",
        ],
    ),
    curriculum_node(
        "fiausbv_c_1",
        "ausbildungsrahmenplan_official",
        "Konzipieren und Realisieren von IT-Systemen",
        "official_part",
        parent_node_id="fiausbv_c",
        source_id="external_fiausbv_anlage",
        specialty="fisi",
        sort_order=1,
        oberthemen=["netzwerkdienste_und_virtualisierung", "it_sicherheit_und_datenschutz", "testen_und_qualitaetssicherung"],
        direct_theme_ids=["sys_systemuebergabe"],
    ),
    curriculum_node(
        "fiausbv_c_2",
        "ausbildungsrahmenplan_official",
        "Installieren und Konfigurieren von Netzwerken",
        "official_part",
        parent_node_id="fiausbv_c",
        source_id="external_fiausbv_anlage",
        specialty="fisi",
        sort_order=2,
        oberthemen=["netzwerke_und_adressierung", "it_sicherheit_und_datenschutz"],
        direct_theme_ids=["sys_netzwerkprotokoll", "sys_netzwerkschnittstelle"],
    ),
    curriculum_node(
        "fiausbv_c_3",
        "ausbildungsrahmenplan_official",
        "Administrieren von IT-Systemen",
        "official_part",
        parent_node_id="fiausbv_c",
        source_id="external_fiausbv_anlage",
        specialty="fisi",
        sort_order=3,
        oberthemen=["service_und_supportprozesse", "it_sicherheit_und_datenschutz", "netzwerkdienste_und_virtualisierung"],
        direct_theme_ids=[
            "sys_berechtigungskonzept",
            "sys_datensicherungskonzept",
            "sys_systemwiederherstellung",
            "sys_systemauslastung",
            "sys_stoerungsmeldung",
        ],
    ),
    curriculum_node(
        "fiausbv_d",
        "ausbildungsrahmenplan_official",
        "Abschnitt D: Fachrichtung Daten- und Prozessanalyse",
        "official_section",
        parent_node_id="fiausbv_root",
        source_id="external_fiausbv_anlage",
        sort_order=104,
        specialty="fidp",
        oberthemen=[
            "prozessanalyse_und_monitoring",
            "datenintegration_und_datenaustausch",
            "it_sicherheit_und_datenschutz",
            "projektmanagement_und_wirtschaftlichkeit",
        ],
    ),
    curriculum_node(
        "fiausbv_d_1",
        "ausbildungsrahmenplan_official",
        "Analysieren von Arbeits- und Geschäftsprozessen",
        "official_part",
        parent_node_id="fiausbv_d",
        source_id="external_fiausbv_anlage",
        specialty="fidp",
        sort_order=1,
        oberthemen=["prozessanalyse_und_monitoring", "projektmanagement_und_wirtschaftlichkeit"],
        direct_theme_ids=["dpa_prozessanalyse"],
    ),
    curriculum_node(
        "fiausbv_d_2",
        "ausbildungsrahmenplan_official",
        "Analysieren von Datenquellen und Bereitstellen von Daten",
        "official_part",
        parent_node_id="fiausbv_d",
        source_id="external_fiausbv_anlage",
        specialty="fidp",
        sort_order=2,
        oberthemen=["prozessanalyse_und_monitoring", "datenintegration_und_datenaustausch", "it_sicherheit_und_datenschutz"],
        direct_theme_ids=["dpa_datenquelle", "dpa_datenklassifizierung"],
    ),
    curriculum_node(
        "fiausbv_d_3",
        "ausbildungsrahmenplan_official",
        "Nutzen der Daten zur Optimierung von Arbeits- und Geschäftsprozessen sowie zur Optimierung digitaler Geschäftsmodelle",
        "official_part",
        parent_node_id="fiausbv_d",
        source_id="external_fiausbv_anlage",
        specialty="fidp",
        sort_order=3,
        oberthemen=["prozessanalyse_und_monitoring", "algorithmen_und_datenstrukturen"],
        direct_theme_ids=["dpa_kennzahl", "dpa_monitoringsystem"],
    ),
    curriculum_node(
        "fiausbv_d_4",
        "ausbildungsrahmenplan_official",
        "Umsetzen des Datenschutzes und der Schutzziele der Datensicherheit",
        "official_part",
        parent_node_id="fiausbv_d",
        source_id="external_fiausbv_anlage",
        specialty="fidp",
        sort_order=4,
        oberthemen=["it_sicherheit_und_datenschutz", "prozessanalyse_und_monitoring"],
        direct_theme_ids=["sys_berechtigungskonzept", "sys_datensicherungskonzept"],
    ),
    curriculum_node(
        "fiausbv_e",
        "ausbildungsrahmenplan_official",
        "Abschnitt E: Fachrichtung Digitale Vernetzung",
        "official_section",
        parent_node_id="fiausbv_root",
        source_id="external_fiausbv_anlage",
        sort_order=105,
        specialty="fidv",
        oberthemen=[
            "cyber_physische_systeme_und_iot",
            "netzwerke_und_adressierung",
            "it_sicherheit_und_datenschutz",
            "projektmanagement_und_wirtschaftlichkeit",
            "prozessanalyse_und_monitoring",
        ],
    ),
    curriculum_node(
        "fiausbv_e_1",
        "ausbildungsrahmenplan_official",
        "Analysieren und Planen von Systemen zur Vernetzung von Prozessen und Produkten",
        "official_part",
        parent_node_id="fiausbv_e",
        source_id="external_fiausbv_anlage",
        specialty="fidv",
        sort_order=1,
        oberthemen=["cyber_physische_systeme_und_iot", "netzwerke_und_adressierung", "it_sicherheit_und_datenschutz", "projektmanagement_und_wirtschaftlichkeit"],
        direct_theme_ids=["dv_cyber_physisches_system", "sys_netzwerkprotokoll", "sys_netzwerkschnittstelle"],
    ),
    curriculum_node(
        "fiausbv_e_2",
        "ausbildungsrahmenplan_official",
        "Errichten, Ändern und Prüfen von vernetzten Systemen",
        "official_part",
        parent_node_id="fiausbv_e",
        source_id="external_fiausbv_anlage",
        specialty="fidv",
        sort_order=2,
        oberthemen=["cyber_physische_systeme_und_iot", "it_sicherheit_und_datenschutz", "testen_und_qualitaetssicherung"],
        direct_theme_ids=["dv_cyber_physisches_system", "test_testplan", "test_testprotokoll"],
    ),
    curriculum_node(
        "fiausbv_e_3",
        "ausbildungsrahmenplan_official",
        "Betreiben von vernetzten Systemen und Sicherstellung der Systemverfügbarkeit",
        "official_part",
        parent_node_id="fiausbv_e",
        source_id="external_fiausbv_anlage",
        specialty="fidv",
        sort_order=3,
        oberthemen=["cyber_physische_systeme_und_iot", "prozessanalyse_und_monitoring", "it_sicherheit_und_datenschutz", "service_und_supportprozesse"],
        direct_theme_ids=["dv_anomalieerkennung", "sys_systemauslastung", "sys_stoerungsmeldung", "dpa_monitoringsystem"],
    ),
    curriculum_node(
        "fiausbv_f",
        "ausbildungsrahmenplan_official",
        "Abschnitt F: fachrichtungsübergreifende, integrativ zu vermittelnde Fertigkeiten, Kenntnisse und Fähigkeiten",
        "official_section",
        parent_node_id="fiausbv_root",
        source_id="external_fiausbv_anlage",
        sort_order=106,
        specialty="alle",
        oberthemen=[
            "ausbildung_und_betriebsrolle",
            "arbeitsrecht_und_mitbestimmung",
            "betrieb_markt_und_wertschoepfung",
            "arbeitssicherheit_und_umweltschutz",
            "praesentation_dokumentation_und_reflexion",
        ],
    ),
    curriculum_node(
        "fiausbv_f_1",
        "ausbildungsrahmenplan_official",
        "Berufsbildung sowie Arbeits- und Tarifrecht",
        "official_part",
        parent_node_id="fiausbv_f",
        source_id="external_fiausbv_anlage",
        sort_order=1,
        oberthemen=["ausbildung_und_betriebsrolle", "arbeitsrecht_und_mitbestimmung"],
    ),
    curriculum_node(
        "fiausbv_f_2",
        "ausbildungsrahmenplan_official",
        "Aufbau und Organisation des Ausbildungsbetriebes",
        "official_part",
        parent_node_id="fiausbv_f",
        source_id="external_fiausbv_anlage",
        sort_order=2,
        oberthemen=["betrieb_markt_und_wertschoepfung", "arbeitsrecht_und_mitbestimmung"],
    ),
    curriculum_node(
        "fiausbv_f_3",
        "ausbildungsrahmenplan_official",
        "Sicherheit und Gesundheitsschutz bei der Arbeit",
        "official_part",
        parent_node_id="fiausbv_f",
        source_id="external_fiausbv_anlage",
        sort_order=3,
        oberthemen=["arbeitssicherheit_und_umweltschutz"],
        direct_theme_ids=["safe_arbeitsschutz", "safe_unfallverhuetung", "safe_brandschutz"],
    ),
    curriculum_node(
        "fiausbv_f_4",
        "ausbildungsrahmenplan_official",
        "Umweltschutz",
        "official_part",
        parent_node_id="fiausbv_f",
        source_id="external_fiausbv_anlage",
        sort_order=4,
        oberthemen=["arbeitssicherheit_und_umweltschutz"],
        direct_theme_ids=["safe_umweltschutz"],
    ),
    curriculum_node(
        "fiausbv_f_5",
        "ausbildungsrahmenplan_official",
        "Vernetztes Zusammenarbeiten unter Nutzung digitaler Medien",
        "official_part",
        parent_node_id="fiausbv_f",
        source_id="external_fiausbv_anlage",
        sort_order=5,
        oberthemen=["praesentation_dokumentation_und_reflexion", "it_sicherheit_und_datenschutz"],
    ),
    curriculum_node(
        "modulplan_root",
        "modulplan_seed",
        "Modul- und Themenplan aus Nutzer-Screenshots",
        "framework_root",
        source_id="internal_modulplan_screenshots",
        sort_order=200,
        notes="Zusätzliche, vom Nutzer gewünschte Filterstruktur auf Basis der bereitgestellten Screenshots.",
    ),
    curriculum_node(
        "modul_fue_i",
        "modulplan_seed",
        "Fachrichtungsübergreifendes Modul I",
        "module",
        parent_node_id="modulplan_root",
        area_id="ausbildungsjahr_1",
        source_id="internal_modulplan_screenshots",
        sort_order=201,
        oberthemen=[
            "ausbildung_und_betriebsrolle",
            "arbeitsrecht_und_mitbestimmung",
            "netzwerke_und_adressierung",
            "datenmodellierung_und_normalisierung",
            "algorithmen_und_datenstrukturen",
        ],
    ),
    curriculum_node(
        "modul_fue_i_duales_system",
        "modulplan_seed",
        "Berufliche Bildung im dualen System; Arbeits- und Tarifrecht",
        "module_part",
        parent_node_id="modul_fue_i",
        area_id="ausbildungsjahr_1",
        source_id="internal_modulplan_screenshots",
        sort_order=1,
        oberthemen=["ausbildung_und_betriebsrolle", "arbeitsrecht_und_mitbestimmung"],
    ),
    curriculum_node(
        "modul_fue_i_it_systeme",
        "modulplan_seed",
        "Betreiben von IT-Systemen",
        "module_part",
        parent_node_id="modul_fue_i",
        area_id="ausbildungsjahr_1",
        source_id="internal_modulplan_screenshots",
        sort_order=2,
        oberthemen=["netzwerke_und_adressierung", "service_und_supportprozesse"],
        direct_theme_ids=["sys_netzwerkprotokoll", "sys_netzwerkschnittstelle", "sys_stoerungsmeldung"],
    ),
    curriculum_node(
        "modul_fue_i_programmieren",
        "modulplan_seed",
        "Programmieren von Softwarelösungen",
        "module_part",
        parent_node_id="modul_fue_i",
        area_id="ausbildungsjahr_1",
        source_id="internal_modulplan_screenshots",
        sort_order=3,
        oberthemen=["algorithmen_und_datenstrukturen", "datenmodellierung_und_normalisierung", "web_apis_und_schnittstellen"],
    ),
    curriculum_node(
        "modul_fs_i_ae",
        "modulplan_seed",
        "Fachspezifisches Modul I (Anwendungsentwicklung)",
        "module",
        parent_node_id="modulplan_root",
        area_id="ausbildungsjahr_2",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=202,
        oberthemen=[
            "anforderungen_ux_und_barrierefreiheit",
            "softwarearchitektur_und_entwurfsmuster",
            "objektorientierung_und_uml",
            "it_sicherheit_und_datenschutz",
            "testen_und_qualitaetssicherung",
        ],
    ),
    curriculum_node(
        "modul_fs_i_ae_vorgehen",
        "modulplan_seed",
        "Vorgehensmodelle, Entwicklungsumgebungen und Bibliotheken",
        "module_part",
        parent_node_id="modul_fs_i_ae",
        area_id="ausbildungsjahr_2",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=1,
        oberthemen=["softwarearchitektur_und_entwurfsmuster"],
        direct_theme_ids=["arch_entwicklungsumgebung", "arch_framework"],
    ),
    curriculum_node(
        "modul_fs_i_ae_analyse_design",
        "modulplan_seed",
        "Analyse- und Designverfahren",
        "module_part",
        parent_node_id="modul_fs_i_ae",
        area_id="ausbildungsjahr_2",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=2,
        oberthemen=["objektorientierung_und_uml", "anforderungen_ux_und_barrierefreiheit"],
    ),
    curriculum_node(
        "modul_fs_i_ae_ui",
        "modulplan_seed",
        "Benutzerschnittstellen ergonomisch gestalten und anpassen",
        "module_part",
        parent_node_id="modul_fs_i_ae",
        area_id="ausbildungsjahr_2",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=3,
        oberthemen=["anforderungen_ux_und_barrierefreiheit"],
    ),
    curriculum_node(
        "modul_fs_i_ae_security_integrity",
        "modulplan_seed",
        "Sicherheitsaspekte und Datenintegrität berücksichtigen",
        "module_part",
        parent_node_id="modul_fs_i_ae",
        area_id="ausbildungsjahr_2",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=4,
        oberthemen=["it_sicherheit_und_datenschutz", "datenbankobjekte_und_transaktionen"],
        direct_theme_ids=["sys_berechtigungskonzept", "sys_datensicherungskonzept"],
    ),
    curriculum_node(
        "modul_fs_i_ae_modultests",
        "modulplan_seed",
        "Modultests erstellen und durchführen",
        "module_part",
        parent_node_id="modul_fs_i_ae",
        area_id="ausbildungsjahr_2",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=5,
        oberthemen=["testen_und_qualitaetssicherung"],
        direct_theme_ids=["test_testplan", "test_testfall", "test_testprotokoll"],
    ),
    curriculum_node(
        "modul_pm",
        "modulplan_seed",
        "Projektmanagement und Projektarbeit",
        "module",
        parent_node_id="modulplan_root",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=203,
        oberthemen=["projektmanagement_und_wirtschaftlichkeit", "praesentation_dokumentation_und_reflexion"],
        direct_theme_ids=[
            "proj_projektdefinition",
            "proj_smart_prinzip",
            "proj_lastenheft",
            "proj_pflichtenheft",
            "proj_arbeitspaket",
            "proj_projektstrukturplan",
            "proj_zeitplan",
            "proj_ressourcenplan",
            "proj_kostenplan",
            "proj_qualitaetsplan",
            "proj_kickoff_meeting",
            "proj_abnahme",
            "proj_abschlussbericht",
        ],
    ),
    curriculum_node(
        "modul_pm_definition",
        "modulplan_seed",
        "Definitionsphase",
        "module_part",
        parent_node_id="modul_pm",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=1,
        oberthemen=["projektmanagement_und_wirtschaftlichkeit"],
        direct_theme_ids=["proj_projektdefinition", "proj_smart_prinzip", "proj_lastenheft", "proj_pflichtenheft", "proj_kickoff_meeting"],
    ),
    curriculum_node(
        "modul_pm_planung",
        "modulplan_seed",
        "Planungsphase",
        "module_part",
        parent_node_id="modul_pm",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=2,
        oberthemen=["projektmanagement_und_wirtschaftlichkeit"],
        direct_theme_ids=["proj_arbeitspaket", "proj_projektstrukturplan", "proj_zeitplan", "proj_ressourcenplan", "proj_kostenplan", "proj_qualitaetsplan"],
    ),
    curriculum_node(
        "modul_pm_realisierung",
        "modulplan_seed",
        "Realisierungsphase",
        "module_part",
        parent_node_id="modul_pm",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=3,
        oberthemen=["projektmanagement_und_wirtschaftlichkeit", "testen_und_qualitaetssicherung"],
    ),
    curriculum_node(
        "modul_pm_abschluss",
        "modulplan_seed",
        "Abschlussphase",
        "module_part",
        parent_node_id="modul_pm",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=4,
        oberthemen=["projektmanagement_und_wirtschaftlichkeit", "praesentation_dokumentation_und_reflexion"],
        direct_theme_ids=["proj_abnahme", "proj_abschlussbericht"],
    ),
    curriculum_node(
        "modul_fue_ii",
        "modulplan_seed",
        "Fachrichtungsübergreifendes Modul II",
        "module",
        parent_node_id="modulplan_root",
        area_id="ausbildungsjahr_2",
        source_id="internal_modulplan_screenshots",
        sort_order=204,
        oberthemen=[
            "betrieb_markt_und_wertschoepfung",
            "arbeitssicherheit_und_umweltschutz",
            "service_und_supportprozesse",
            "it_sicherheit_und_datenschutz",
            "datenbankobjekte_und_transaktionen",
            "algorithmen_und_datenstrukturen",
        ],
    ),
    curriculum_node(
        "modul_fue_ii_betrieb",
        "modulplan_seed",
        "Aufbau und Organisation des Ausbildungsbetriebes",
        "module_part",
        parent_node_id="modul_fue_ii",
        area_id="ausbildungsjahr_2",
        source_id="internal_modulplan_screenshots",
        sort_order=1,
        oberthemen=["betrieb_markt_und_wertschoepfung", "arbeitsrecht_und_mitbestimmung"],
    ),
    curriculum_node(
        "modul_fue_ii_schutz",
        "modulplan_seed",
        "Sicherheit, Gesundheits- und Umweltschutz",
        "module_part",
        parent_node_id="modul_fue_ii",
        area_id="ausbildungsjahr_2",
        source_id="internal_modulplan_screenshots",
        sort_order=2,
        oberthemen=["arbeitssicherheit_und_umweltschutz"],
        direct_theme_ids=["safe_arbeitsschutz", "safe_unfallverhuetung", "safe_brandschutz", "safe_umweltschutz"],
    ),
    curriculum_node(
        "modul_fue_ii_systeme",
        "modulplan_seed",
        "Vertiefung: Betreiben von IT-Systemen",
        "module_part",
        parent_node_id="modul_fue_ii",
        area_id="ausbildungsjahr_2",
        source_id="internal_modulplan_screenshots",
        sort_order=3,
        oberthemen=["service_und_supportprozesse", "praesentation_dokumentation_und_reflexion"],
        direct_theme_ids=["sys_stoerungsmeldung", "doc_technische_dokumentation"],
    ),
    curriculum_node(
        "modul_fue_ii_speicher",
        "modulplan_seed",
        "Inbetriebnehmen von Speicherlösungen",
        "module_part",
        parent_node_id="modul_fue_ii",
        area_id="ausbildungsjahr_2",
        source_id="internal_modulplan_screenshots",
        sort_order=4,
        oberthemen=["datenbankobjekte_und_transaktionen", "it_sicherheit_und_datenschutz"],
        direct_theme_ids=["sys_berechtigungskonzept", "sys_datensicherungskonzept"],
    ),
    curriculum_node(
        "modul_fue_ii_programmieren",
        "modulplan_seed",
        "Vertiefung: Programmieren von Softwarelösungen",
        "module_part",
        parent_node_id="modul_fue_ii",
        area_id="ausbildungsjahr_2",
        source_id="internal_modulplan_screenshots",
        sort_order=5,
        oberthemen=["algorithmen_und_datenstrukturen", "softwarearchitektur_und_entwurfsmuster"],
    ),
    curriculum_node(
        "modul_fs_ii_ae",
        "modulplan_seed",
        "Fachspezifisches Modul II (Anwendungsentwicklung)",
        "module",
        parent_node_id="modulplan_root",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=205,
        oberthemen=[
            "softwarearchitektur_und_entwurfsmuster",
            "datenintegration_und_datenaustausch",
            "sql_und_relationale_datenpraxis",
            "versionsverwaltung_und_lieferketten",
            "testen_und_qualitaetssicherung",
            "praesentation_dokumentation_und_reflexion",
        ],
    ),
    curriculum_node(
        "modul_fs_ii_ae_architektur",
        "modulplan_seed",
        "Anwendungslösungen unter Berücksichtigung der bestehenden Systemarchitektur entwerfen und realisieren",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=1,
        oberthemen=["softwarearchitektur_und_entwurfsmuster", "anforderungen_ux_und_barrierefreiheit"],
    ),
    curriculum_node(
        "modul_fs_ii_ae_anpassen",
        "modulplan_seed",
        "Bestehende Anwendungslösungen anpassen",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=2,
        oberthemen=["softwarearchitektur_und_entwurfsmuster"],
    ),
    curriculum_node(
        "modul_fs_ii_ae_datenaustausch",
        "modulplan_seed",
        "Datenaustausch zwischen Systemen realisieren und unterschiedliche Datenquellen nutzen",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=3,
        oberthemen=["datenintegration_und_datenaustausch", "web_apis_und_schnittstellen"],
        direct_theme_ids=["dpa_datenquelle"],
    ),
    curriculum_node(
        "modul_fs_ii_ae_abfragen",
        "modulplan_seed",
        "Komplexe Abfragen aus unterschiedlichen Datenquellen durchführen und Datenbestandsberichte erstellen",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=4,
        oberthemen=["sql_und_relationale_datenpraxis", "datenintegration_und_datenaustausch", "prozessanalyse_und_monitoring"],
    ),
    curriculum_node(
        "modul_fs_ii_ae_versionsverwaltung",
        "modulplan_seed",
        "Werkzeuge zur Versionsverwaltung einsetzen",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=5,
        oberthemen=["versionsverwaltung_und_lieferketten"],
    ),
    curriculum_node(
        "modul_fs_ii_ae_testkonzepte",
        "modulplan_seed",
        "Testkonzepte erstellen und Tests durchführen sowie Testergebnisse bewerten und dokumentieren",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=6,
        oberthemen=["testen_und_qualitaetssicherung"],
        direct_theme_ids=["test_testplan", "test_testfall", "test_testprotokoll", "test_testauswertung"],
    ),
    curriculum_node(
        "modul_fs_ii_ae_testpraesentation",
        "modulplan_seed",
        "Daten und Sachverhalte aus Tests multimedial aufbereiten und präsentieren",
        "module_part",
        parent_node_id="modul_fs_ii_ae",
        area_id="ausbildungsjahr_3",
        specialty="fiae",
        source_id="internal_modulplan_screenshots",
        sort_order=7,
        oberthemen=["praesentation_dokumentation_und_reflexion", "testen_und_qualitaetssicherung"],
        direct_theme_ids=["doc_technische_dokumentation", "test_testauswertung"],
    ),
    curriculum_node(
        "modul_qus2",
        "modulplan_seed",
        "Qualitätsmanagement, IT-Sicherheit und Datenschutz Teil II",
        "module",
        parent_node_id="modulplan_root",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=206,
        oberthemen=["testen_und_qualitaetssicherung", "it_sicherheit_und_datenschutz", "prozessanalyse_und_monitoring"],
    ),
    curriculum_node(
        "modul_qus2_qm",
        "modulplan_seed",
        "Qualitätsmessung, -überwachung und -verbesserung",
        "module_part",
        parent_node_id="modul_qus2",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=1,
        oberthemen=["testen_und_qualitaetssicherung", "prozessanalyse_und_monitoring"],
        direct_theme_ids=["dpa_kennzahl", "test_testauswertung", "test_testprotokoll"],
    ),
    curriculum_node(
        "modul_qus2_security",
        "modulplan_seed",
        "IT-Sicherheit und Datenschutz: Bedrohungsszenarien, Schadenspotenziale und Maßnahmenwirksamkeit",
        "module_part",
        parent_node_id="modul_qus2",
        area_id="ausbildungsjahr_3",
        source_id="internal_modulplan_screenshots",
        sort_order=2,
        oberthemen=["it_sicherheit_und_datenschutz", "prozessanalyse_und_monitoring"],
        direct_theme_ids=["sys_berechtigungskonzept", "sys_datensicherungskonzept", "dv_anomalieerkennung"],
    ),
]


def ensure_enhancement_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS curriculum_nodes (
            node_id TEXT PRIMARY KEY,
            framework TEXT NOT NULL,
            parent_node_id TEXT REFERENCES curriculum_nodes(node_id),
            label TEXT NOT NULL,
            node_type TEXT NOT NULL,
            area_id TEXT REFERENCES areas(area_id),
            specialty TEXT NOT NULL,
            source_id TEXT NOT NULL REFERENCES sources(source_id),
            sort_order INTEGER NOT NULL,
            notes TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS curriculum_node_thema_objekt (
            node_id TEXT NOT NULL REFERENCES curriculum_nodes(node_id),
            thema_objekt_id TEXT NOT NULL REFERENCES thema_objekte(thema_objekt_id),
            assignment_basis TEXT NOT NULL,
            PRIMARY KEY (node_id, thema_objekt_id)
        );
        """
    )


def insert_sources(conn: sqlite3.Connection) -> None:
    conn.executemany(
        """
        INSERT OR IGNORE INTO sources(source_id, title, url, source_group, reuse_status, reuse_note)
        VALUES(:source_id, :title, :url, :source_group, :reuse_status, :reuse_note)
        """,
        EXTRA_SOURCES,
    )


def insert_oberthemen(conn: sqlite3.Connection) -> None:
    conn.executemany(
        """
        INSERT OR IGNORE INTO oberthemen(oberthema_id, label, short_description, scope, source_basis)
        VALUES(:oberthema_id, :label, :short_description, :scope, :source_basis)
        """,
        EXTRA_OBERTHEMEN,
    )
    rows = []
    for area_id, oberthemen in EXTRA_AREA_OBERTHEMA.items():
        for oberthema_id in oberthemen:
            rows.append(
                {
                    "area_id": area_id,
                    "oberthema_id": oberthema_id,
                    "seed_status": "seed_from_filter_extension",
                    "note": "Ergänzende Zuordnung für Lernfeld- und Ausbildungsrahmenplanfilter.",
                }
            )
    conn.executemany(
        """
        INSERT OR IGNORE INTO area_oberthema(area_id, oberthema_id, seed_status, note)
        VALUES(:area_id, :oberthema_id, :seed_status, :note)
        """,
        rows,
    )


def insert_extra_themen(conn: sqlite3.Connection) -> None:
    conn.executemany(
        """
        INSERT OR IGNORE INTO thema_objekte(
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
        EXTRA_THEMEN,
    )
    conn.execute(
        """
        UPDATE thema_objekte
        SET oberthema_id = 'prozessanalyse_und_monitoring'
        WHERE thema_objekt_id = 'ext_datenqualitaet'
        """
    )


def rebuild_area_thema_objekte(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM area_thema_objekt")
    conn.execute(
        """
        INSERT INTO area_thema_objekt(area_id, thema_objekt_id, assignment_basis)
        SELECT ao.area_id,
               t.thema_objekt_id,
               'Ableitung aus der Bereich-zu-Oberthema-Zuordnung.'
        FROM area_oberthema ao
        JOIN thema_objekte t ON t.oberthema_id = ao.oberthema_id
        GROUP BY ao.area_id, t.thema_objekt_id
        """
    )


def insert_curriculum_nodes(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM curriculum_node_thema_objekt")
    conn.execute("DELETE FROM curriculum_nodes")
    rows = [
        {
            "node_id": node["node_id"],
            "framework": node["framework"],
            "parent_node_id": node["parent_node_id"],
            "label": node["label"],
            "node_type": node["node_type"],
            "area_id": node["area_id"],
            "specialty": node["specialty"],
            "source_id": node["source_id"],
            "sort_order": node["sort_order"],
            "notes": node["notes"],
        }
        for node in CURRICULUM_NODES
    ]
    conn.executemany(
        """
        INSERT INTO curriculum_nodes(
            node_id,
            framework,
            parent_node_id,
            label,
            node_type,
            area_id,
            specialty,
            source_id,
            sort_order,
            notes
        )
        VALUES(
            :node_id,
            :framework,
            :parent_node_id,
            :label,
            :node_type,
            :area_id,
            :specialty,
            :source_id,
            :sort_order,
            :notes
        )
        """,
        rows,
    )


def rebuild_curriculum_links(conn: sqlite3.Connection) -> None:
    thema_by_oberthema: dict[str, set[str]] = {}
    for oberthema_id, thema_objekt_id in conn.execute(
        "SELECT oberthema_id, thema_objekt_id FROM thema_objekte"
    ):
        thema_by_oberthema.setdefault(oberthema_id, set()).add(thema_objekt_id)

    link_rows: list[dict[str, str]] = []
    for node in CURRICULUM_NODES:
        direct_only = node["node_type"] == "module_part" and bool(node["direct_theme_ids"])
        linked = set(node["direct_theme_ids"])
        if not direct_only:
            for oberthema_id in node["oberthemen"]:
                linked.update(thema_by_oberthema.get(oberthema_id, set()))
        for thema_objekt_id in sorted(linked):
            link_rows.append(
                {
                    "node_id": node["node_id"],
                    "thema_objekt_id": thema_objekt_id,
                    "assignment_basis": "Zuordnung aus Curriculum-Knoten auf passende Oberthemen und ergänzende Direktverknüpfungen.",
                }
            )
    conn.executemany(
        """
        INSERT INTO curriculum_node_thema_objekt(node_id, thema_objekt_id, assignment_basis)
        VALUES(:node_id, :thema_objekt_id, :assignment_basis)
        """,
        link_rows,
    )


def render_sources_md(conn: sqlite3.Connection) -> str:
    rows = conn.execute(
        """
        SELECT title, url, reuse_status, reuse_note
        FROM sources
        ORDER BY
            CASE reuse_status
                WHEN 'allowed' THEN 1
                WHEN 'internal' THEN 2
                WHEN 'pending' THEN 3
                WHEN 'rejected' THEN 4
                ELSE 5
            END,
            title
        """
    ).fetchall()
    groups = {"allowed": [], "internal": [], "pending": [], "rejected": []}
    for row in rows:
        groups.setdefault(row[2], []).append(row)

    def add_group(lines: list[str], title: str, key: str) -> None:
        lines.extend([title, ""])
        for row in groups.get(key, []):
            lines.extend(
                [
                    f"### {row[0]}",
                    f"- URL: {row[1]}",
                    f"- Einstufung: {row[2]}",
                    f"- Begründung: {row[3]}",
                    "",
                ]
            )

    lines = [
        "# Kommerziell nutzbare Quellenbasis",
        "",
        "Diese Liste trennt strikt zwischen externer Wiederverwendungsfreiheit, interner Arbeitsbasis und vorläufig ausgeschlossenen Quellen.",
        "",
    ]
    add_group(lines, "## Für den Außen-Research nutzbar", "allowed")
    add_group(lines, "## Interne Arbeitsbasis", "internal")
    add_group(lines, "## Noch zu klären", "pending")
    add_group(lines, "## Vorläufig ausgeschlossen", "rejected")
    return "\n".join(lines).strip() + "\n"


def render_structure_md(conn: sqlite3.Connection) -> str:
    lines = [
        "# Oberthemen-Arbeitsstruktur",
        "",
        "Die Datenbank trennt jetzt zwischen Bereichen, Oberthemen, Thema-Objekten und zusätzlichen Curriculum-Filtern.",
        "",
        "## Begriffslogik",
        "",
        "- Bereich: Ausbildungsjahr oder Prüfungsteil",
        "- Oberthema: fachlicher Hauptblock",
        "- Thema-Objekt: kleinste fachliche Einheit",
        "- Curriculum-Knoten: filterbarer Eintrag aus Lernfeld, Ausbildungsrahmenplan oder Modulstruktur",
        "",
        "## Bereiche und Oberthemen",
        "",
    ]
    area_rows = conn.execute(
        """
        SELECT a.area_id, a.label, a.notes
        FROM areas a
        ORDER BY a.sort_order
        """
    ).fetchall()
    for area_id, label, notes in area_rows:
        lines.append(f"### {label}")
        lines.append(f"- Hinweis: {notes}")
        lines.append("- Oberthemen:")
        for (ob_label,) in conn.execute(
            """
            SELECT o.label
            FROM area_oberthema ao
            JOIN oberthemen o ON o.oberthema_id = ao.oberthema_id
            WHERE ao.area_id = ?
            ORDER BY o.label
            """,
            (area_id,),
        ):
            lines.append(f"  - {ob_label}")
        lines.append("")

    lines.extend(
        [
            "## Curriculum-Filterebenen",
            "",
        ]
    )
    for framework, count in conn.execute(
        """
        SELECT framework, COUNT(*)
        FROM curriculum_nodes
        GROUP BY framework
        ORDER BY framework
        """
    ):
        lines.append(f"- `{framework}`: {count} Knoten")
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def render_definition_md(conn: sqlite3.Connection) -> str:
    total = conn.execute("SELECT COUNT(*) FROM thema_objekte").fetchone()[0]
    lines = [
        "# Begriffserklärungen Ausgangsbasis",
        "",
        "Diese Datei bündelt den aktuell vorhandenen Bestand an Thema-Objekten nach Oberthemen.",
        "",
        f"## Aktuell erklärte Thema-Objekte: {total}",
        "",
    ]
    for oberthema_id, label, short_description in conn.execute(
        """
        SELECT oberthema_id, label, short_description
        FROM oberthemen
        ORDER BY label
        """
    ):
        items = conn.execute(
            """
            SELECT thema_objekt_id, label, definition, example_text, contrast_label, contrast_diff
            FROM thema_objekte
            WHERE oberthema_id = ?
            ORDER BY label
            """,
            (oberthema_id,),
        ).fetchall()
        if not items:
            continue
        lines.append(f"## {label}")
        lines.append(f"- Oberthema-Beschreibung: {short_description}")
        lines.append(f"- Aktuell erklärte Thema-Objekte: {len(items)}")
        lines.append("")
        for item in items:
            lines.append(f"### {item[1]}")
            lines.append(f"- ID: `{item[0]}`")
            lines.append(f"- Definition: {item[2]}")
            lines.append(f"- Beispiel: {item[3]}")
            lines.append(f"- Abgrenzung zu: {item[4]}")
            lines.append(f"- Unterschied: {item[5]}")
            lines.append("")
    return "\n".join(lines).strip() + "\n"


def render_filter_doc(conn: sqlite3.Connection) -> str:
    lines = [
        "# Filterstruktur und SQL-Beispiele",
        "",
        "Die Datenbank kann jetzt über drei Ebenen gefiltert werden:",
        "",
        "- `areas`: Ausbildungsjahre und Prüfungsteile",
        "- `curriculum_nodes`: Lernfelder, offizielle Teile des Ausbildungsrahmenplans und Modulgliederungen",
        "- `oberthemen`: fachliche Hauptblöcke",
        "",
        "## Relevante Tabellen",
        "",
        "- `areas`",
        "- `area_thema_objekt`",
        "- `oberthemen`",
        "- `thema_objekte`",
        "- `curriculum_nodes`",
        "- `curriculum_node_thema_objekt`",
        "",
        "## Vorhandene Curriculum-Frameworks",
        "",
    ]
    for framework, count in conn.execute(
        "SELECT framework, COUNT(*) FROM curriculum_nodes GROUP BY framework ORDER BY framework"
    ):
        lines.append(f"- `{framework}`: {count} Knoten")
    lines.extend(
        [
            "",
            "## Beispiel: nach Ausbildungsjahr filtern",
            "",
            "```sql",
            "SELECT DISTINCT t.thema_objekt_id, t.label",
            "FROM thema_objekte t",
            "JOIN area_thema_objekt ato ON ato.thema_objekt_id = t.thema_objekt_id",
            "WHERE ato.area_id = 'ausbildungsjahr_2'",
            "ORDER BY t.label;",
            "```",
            "",
            "## Beispiel: nach Lernfeld filtern",
            "",
            "```sql",
            "SELECT DISTINCT t.thema_objekt_id, t.label",
            "FROM curriculum_nodes n",
            "JOIN curriculum_node_thema_objekt cnt ON cnt.node_id = n.node_id",
            "JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id",
            "WHERE n.node_id = 'lf05'",
            "ORDER BY t.label;",
            "```",
            "",
            "## Beispiel: nach Fachspezifisches Modul II filtern",
            "",
            "```sql",
            "SELECT DISTINCT t.thema_objekt_id, t.label",
            "FROM curriculum_nodes root",
            "JOIN curriculum_nodes child ON child.parent_node_id = root.node_id OR child.node_id = root.node_id",
            "JOIN curriculum_node_thema_objekt cnt ON cnt.node_id = child.node_id",
            "JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id",
            "WHERE root.node_id = 'modul_fs_ii_ae'",
            "ORDER BY t.label;",
            "```",
            "",
            "## Beispiel: nach offiziellem Ausbildungsrahmenplan-Teil filtern",
            "",
            "```sql",
            "SELECT DISTINCT t.thema_objekt_id, t.label",
            "FROM curriculum_node_thema_objekt cnt",
            "JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id",
            "WHERE cnt.node_id = 'fiausbv_d_3'",
            "ORDER BY t.label;",
            "```",
            "",
            "## Beispiel: nach offiziellem Abschnitt und Fachrichtung filtern",
            "",
            "```sql",
            "SELECT DISTINCT t.thema_objekt_id, t.label",
            "FROM curriculum_nodes n",
            "JOIN curriculum_node_thema_objekt cnt ON cnt.node_id = n.node_id",
            "JOIN thema_objekte t ON t.thema_objekt_id = cnt.thema_objekt_id",
            "WHERE n.parent_node_id = 'fiausbv_c' OR n.node_id = 'fiausbv_c'",
            "ORDER BY t.label;",
            "```",
            "",
        ]
    )
    return "\n".join(lines).strip() + "\n"


def write_docs(conn: sqlite3.Connection, quizmaster_root: Path) -> None:
    (quizmaster_root / "KommerziellNutzbareQuellen.md").write_text(
        render_sources_md(conn), encoding="utf-8"
    )
    (quizmaster_root / "Oberthemen_Arbeitsstruktur.md").write_text(
        render_structure_md(conn), encoding="utf-8"
    )
    (quizmaster_root / "Begriffserklärungen_Ausgangsbasis.md").write_text(
        render_definition_md(conn), encoding="utf-8"
    )
    (quizmaster_root / "Filterstruktur_und_SQL.md").write_text(
        render_filter_doc(conn), encoding="utf-8"
    )


def enhance_database(db_path: Path, quizmaster_root: Path) -> dict[str, int]:
    conn = sqlite3.connect(db_path)
    try:
        ensure_enhancement_schema(conn)
        insert_sources(conn)
        insert_oberthemen(conn)
        insert_extra_themen(conn)
        rebuild_area_thema_objekte(conn)
        insert_curriculum_nodes(conn)
        rebuild_curriculum_links(conn)
        write_docs(conn, quizmaster_root)
        conn.commit()

        return {
            "areas": conn.execute("SELECT COUNT(*) FROM areas").fetchone()[0],
            "oberthemen": conn.execute("SELECT COUNT(*) FROM oberthemen").fetchone()[0],
            "thema_objekte": conn.execute("SELECT COUNT(*) FROM thema_objekte").fetchone()[0],
            "curriculum_nodes": conn.execute("SELECT COUNT(*) FROM curriculum_nodes").fetchone()[0],
            "curriculum_links": conn.execute("SELECT COUNT(*) FROM curriculum_node_thema_objekt").fetchone()[0],
        }
    finally:
        conn.close()
