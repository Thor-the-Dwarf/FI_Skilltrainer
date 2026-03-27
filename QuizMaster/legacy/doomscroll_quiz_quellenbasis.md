# DoomScroll Quiz Quellenbasis

Stand: 2026-03-26

## Arbeitsregeln fuer neue `quiz*.json`

- Pflichtbasis vor jeder Ueberarbeitung:
  - `DOOMSCROLL_QUIZ_CONTRACT.md`
  - `doomscroll-quiz.schema.json`
  - `doomscroll-quiz-manifest.schema.json`
  - `Kurse/Ausbildungsrahmenplan.md`
  - passendes `Kurse/<Ordner>-Quiz/quiz-manifest.json`
  - vorhandene Varianten im Zielordner
  - passendes `Kurse/<Ordner>-Scenarien/possible_skills.json`
  - passendes `Kurse/<Ordner>-Scenarien/scenario-manifest.json`
  - passendes Szenario-Ticket `ticket*.json`
- Sichtbare Texte duerfen keine Ticket-Verweise enthalten.
  - Verboten in sichtbaren Texten: `Ticket`, Ticketnummern, Dateinamen, Pfade, `V01/V02/...`, Repo-Sprache.
  - Betroffene Felder: `title`, `description`, `label`, `prompt`, `context`, `explanation`, `badgeLabel`.
  - Interne Felder duerfen bleiben: `ticketId`, `scenarioFile`, `quizFile`, `conceptId`, `variantId`.
- Variantenregel:
  - gleiche Lernziele und gleiche Konzeptabdeckung behalten
  - gleiche `conceptId` behalten
  - neue `variantId` verwenden
  - Formulierung, Distraktoren, Mini-Szenario, Perspektive, Reihenfolge und Fragetyp duerfen sich aendern
  - Fragenanzahl darf leicht schwanken, aber kein Konzept darf verschwinden
- Qualitaetsgrenze:
  - zuerst repo-nahe Quellen
  - dann offizielle oder klar unterrichtstaugliche Fachquellen
  - keine erfundenen Regeln, Gesetze, Prozesse oder Fachbegriffe
  - wenn etwas nicht sauber belegbar ist: neutral formulieren oder weglassen
- Produktionssichere Interaktionstypen laut Contract:
  - `binary`, `single`, `multi`, `best`
  - `sequence`, `gap_fill_choice`, `gap_fill_text` nur sehr bewusst einsetzen, da laut Contract noch kein spezialisierter Renderer garantiert ist

## UI-relevante Felder

- Das Trainingsmenue zeigt den Manifest-`label`.
- Die Fragekarte zeigt `question.prompt`.
- Das Modus-Badge zeigt `badgeLabel` bzw. den `questionKind`-Fallback.
- Konsequenz:
  - Ticket-/Versionsverweise muessen mindestens aus `quiz-manifest.json` `label` und aus jedem `prompt` entfernt werden.

## Quellen-Prioritaet

1. Repo-interne Kursquellen im passenden Szenario- und Quizordner
2. Repo-interne Mapping- und Workflow-Dokumente unter `__documentation/agents/`
3. Offizielle Ordnungs- und Fachquellen
4. Nur wenn noetig: neutrale alltagssprachliche Ableitung ohne neue Fachbehauptungen

## Themenpool pro Kursordner

- `LF01-Quiz`
  - Basis: `Kurse/LF01-Scenarien/possible_skills.json`, `Kurse/LF01-Scenarien/scenario-manifest.json`
  - Fokus: duales System, Rechte/Pflichten, Mitbestimmung, Berufsplanung, Betrieb/Unternehmensziele, Wertschoepfung, Marktumfeld, Praesentation, Reflexion
- `LF02-Quiz`
  - Basis: `Kurse/LF02-Scenarien/possible_skills.json`, `Kurse/LF02-Scenarien/scenario-manifest.json`
  - Fokus: Hardware, Arbeitsplatzplanung, Kompatibilitaet, Aufbau, Stoerungsanalyse, Angebotsvergleich, Kalkulation, Abnahme/Uebergabe
- `LF03-Quiz`
  - Basis: `Kurse/LF03-Scenarien/possible_skills.json`, `Kurse/LF03-Scenarien/scenario-manifest.json`
  - Fokus: Netzwerke, Uebertragungsmedien, Topologien, Verkabelung, TCP/IP, Adressierung, Client-Setup, Cloud/Anmeldung, Wartung, Green-IT
- `LF04-Quiz`
  - Basis: `Kurse/LF04-Scenarien/possible_skills.json`, `Kurse/LF04-Scenarien/scenario-manifest.json`
  - Fokus: Informationssicherheit, Rollen, Gesetze/Standards, Grundschutz, Bedrohungen, Social Engineering, TOMs, Schutzbedarf, mobile Datentraeger, Verfuegbarkeit, Dokumentation
- `LF05-Quiz`
  - Basis: `Kurse/LF05-Scenarien/possible_skills.json`, `Kurse/LF05-Scenarien/scenario-manifest.json`
  - Fokus: Datenverwaltung, Softwareumfeld, Informationssicherheit, Anforderungen, Python/Werkzeuge, Datenbanken, SQL, Test, Dokumentation
- `LF06-Quiz`
  - Basis: `Kurse/LF06-Scenarien/possible_skills.json`, `Kurse/LF06-Scenarien/scenario-manifest.json`
  - Fokus: Servicearten, Rahmenwerke, Ticketannahme, Analyse/Monitoring, Teamkoordination, Kundenkommunikation, Deeskalation, Praevention, Schulung, Reflexion
- `LF07-Quiz`
  - Basis: `Kurse/LF07-Scenarien/possible_skills.json`, `Kurse/LF07-Scenarien/scenario-manifest.json`
  - Fokus: CPS-/IoT-Grundlagen, Protokolle, Flussanalyse, Erweiterungsplanung, Prototyp/Inbetriebnahme, Review/Test, FMEA, Dokumentation
- `LF08-Quiz`
  - Basis: `Kurse/LF08-Scenarien/possible_skills.json`, `Kurse/LF08-Scenarien/scenario-manifest.json`
  - Fokus: Datenintegration, Datenqualitaet, OO-Planung, UML, UI, Java/Python, Datenbankloesungen, systemuebergreifende Anbindung, Test, Abnahme, Doku
- `LF09-Quiz`
  - Basis: `Kurse/LF09-Scenarien/possible_skills.json`, `Kurse/LF09-Scenarien/scenario-manifest.json`
  - Fokus: Netzwerkanforderungen, Ist-Analyse, technische Planung, Wirtschaftlichkeit/Sicherheit/Nachhaltigkeit, Pflichtenheft/Vergabe, Installation/Konfiguration/Rollout, Messung/Dokumentation, Virtualisierung
- `LF10FIAE-Quiz`
  - Basis: `Kurse/LF10FIAE-Scenarien/possible_skills.json`, `Kurse/LF10FIAE-Scenarien/scenario-manifest.json`
  - Fokus: UI-Anforderungen, Produktdesign/Architektur, Ergonomie, Frameworks, Implementierung, UX-Tests, Dokumentation, Abschlussreflexion
- `LF11FIAE-Quiz`
  - Basis: `Kurse/LF11FIAE-Scenarien/possible_skills.json`, `Kurse/LF11FIAE-Scenarien/scenario-manifest.json`
  - Fokus: Komponenten, Modularisierung, UML, Datenstrukturen, Python/Java, Algorithmen, Sortierung, Kompression, Krypto, Hashing, JSON, Webservices, Datenbanken, Unit-Tests, Schnittstellen-Doku
- `LF12FIAE-Quiz`
  - Basis: `Kurse/LF12FIAE-Scenarien/possible_skills.json`, `Kurse/LF12FIAE-Scenarien/scenario-manifest.json`
  - Fokus: Kundenauftrag, PM-Organisation, Zielsetzung, Planung/Wirtschaftlichkeit, Projektdurchfuehrung, Test/Doku, Praesentation, Bewertung/Reflexion
- `Pruefungsvorbereitung-1-FIAE-Quiz`
  - Basis: `Kurse/Pruefungsvorbereitung-1-FIAE-Scenarien/possible_skills.json`, `scenario-manifest.json`, Mapping-Dokus unter `__documentation/agents/AP21fiae2Ticket-Workflow/`
  - Fokus: Konzeptions- und Modellierungsaufgaben aus vergangenen AP2/FIAE1-Aufgaben; u. a. Use Cases, ERM/3NF, JSON, Datenschutz, Netzwerke, UML, REST, Teststrategie, Design Patterns, MongoDB, OAuth/TLS
- `Pruefungsvorbereitung-2-FIAE-Quiz`
  - Basis: `Kurse/Pruefungsvorbereitung-2-FIAE-Scenarien/possible_skills.json`, `scenario-manifest.json`, Mapping-Dokus unter `__documentation/agents/AP22fiae2Ticket-Workflow/`
  - Fokus: vergangene AP2/FIAE2-Aufgaben; u. a. Algorithmen, Pseudocode, UML-Aktivitaet/Sequenz/Zustand, HTTP/API, Tests, SQL, Joins/Aggregationen, ERM, 3NF, Trigger, Indizes
- `Pruefungsvorbereitung-3-WISO-Quiz`
  - Basis: `Kurse/Pruefungsvorbereitung-3-WISO-Scenarien/possible_skills.json`, `scenario-manifest.json`, Mapping-Dokus unter `__documentation/agents/AP2wiso2Ticket-Workflow/`
  - Fokus: vergangene AP2/WISO-Aufgaben; Arbeitsrecht, Ausbildung, Jugendarbeitsschutz, Mitbestimmung, Tarifrecht, Sozialversicherung, Unternehmensformen, Wirtschaftlichkeit, Arbeitsschutz, Umwelt, Diversity
- `QuS2-Quiz`
  - Basis: `Kurse/QuS2-Scenarien/possible_skills.json`, `Kurse/QuS2-Scenarien/scenario-manifest.json`, `progress.md`, Agenda aus dem bereitgestellten Screenshot
  - Fokus: Qualitaetsmanagement, IT-Sicherheit und Datenschutz Teil II; Ursachenanalyse, Qualitaetsziele, Rollen/Nachweise, Incident-Eingrenzung, Meldewege, Fernwartung, Aufbewahrung/Loeschung, Restore/Wiederanlauf, Berechtigungsreview, Schwachstellenmanagement, Dienstleister-Offboarding, Geraetverlust/MDM, Alarmierung/Eskalation

## QuS2 Agenda-Kernpunkte aus dem Screenshot

- Block 1: Qualitaetsmessung, -ueberwachung und -verbesserung
  - Ursachen von Qualitaetsmaengeln feststellen, beseitigen und dokumentieren
  - Qualitaetsplanung und Qualitaetslenkung
  - Pruef- und Testverfahren
  - Soll-Ist-Vergleich und Kontrolle der Zielerreichung
  - KVP
  - Kennzahlenberechnung
  - Abweichungen identifizieren
  - Ergebnisse dokumentieren, z. B. Test- und Abnahmeprotokolle
- Block 2: IT-Sicherheit und Datenschutz
  - Bedrohungsszenarien und Schadenspotenziale wirtschaftlich und technisch einschaetzen
  - Malware-, Social-Engineering-, Spam-, Bot-, DoS-/DDoS- und MitM-nahe Lagen erkennen
  - Gefahrenquellen und Gegenmassnahmen unterscheiden
  - Schadenseintritt verhindern, Security by Design anwenden
  - vorbeugende Massnahmen, IT-Sicherheitskriterien und BSI-Grundschutz
  - Kundenberatung zu IT-Sicherheit und Datenschutz
  - Sicherheitscheck und Risikoanalyse
  - Wirksamkeit/Effizienz von Massnahmen pruefen
  - Testverfahren und Tools einsetzen
  - Zutritt, Zugang und Zugriff kontrollieren

## Offizielle externe Quellen

- Fachinformatikerausbildungsverordnung (FIAusbV)
  - https://www.gesetze-im-internet.de/fiausbv/inhalts_bersicht.html
- KMK-Rahmenlehrplan fuer Fachinformatiker/Fachinformatikerin (Beschluss vom 13.12.2019)
  - https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf
- BIBB Umsetzungshilfe `Fachinformatiker/Fachinformatikerin`
  - https://www.bibb.de/dienst/publikationen/de/16661
- BSI-Standards Uebersicht
  - https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/BSI-Standards/bsi-standards.html
- BSI-Standard 200-1 `Managementsysteme fuer Informationssicherheit`
  - https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/BSI-Standards/BSI-Standard-200-1-Managementsysteme-fuer-Informationssicherheit/bsi-standard-200-1-managementsysteme-fuer-informationssicherheit_node.html
- BSI-Standard 200-2 `IT-Grundschutz-Methodik`
  - https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/BSI-Standards/BSI-Standard-200-2-IT-Grundschutz-Methodik/bsi-standard-200-2-it-grundschutz-methodik_node.html
- BSI-Standard 200-3 `Risikomanagement`
  - https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/BSI-Standards/BSI-Standard-200-3-Risikomanagement/bsi-standard-200-3-risikomanagement_node.html
- IT-Grundschutz-Kompendium
  - https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz-Kompendium/it-grundschutz-kompendium_node.html
- DSGVO / Verordnung (EU) 2016/679
  - https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de

## Schnellablauf fuer spaetere Ueberschreibungen

1. Zielordner nennen lassen.
2. Vorhandene Quizdatei plus zugehoeriges Szenario-Ticket lesen.
3. Themenpool aus `possible_skills.json` und `scenario-manifest.json` abgleichen.
4. Neue sichtbare Texte ohne Ticket-/Versionsverweise formulieren.
5. Gleiche `conceptId`, neue `variantId`, gleiche Konzeptabdeckung sichern.
6. Quizdatei ueberschreiben, ggf. neue Varianten anlegen und `quiz-manifest.json` mit sichtbaren neutralen Labels aktualisieren.
