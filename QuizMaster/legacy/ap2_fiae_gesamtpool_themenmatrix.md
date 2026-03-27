# AP2 FIAE Gesamtpool Themenmatrix

Stand: 2026-03-26

## Ziel

Diese Matrix dient als Arbeitsbasis fuer einen grossen, einzelnen Fragenpool im Ordner `Kurse/Pruefungsvorbereitung-2-FIAE-Quiz`.

Der Pool soll:

- sichtbare Ticket-/Versionsverweise vermeiden
- den Themenpool aus vergangenen AP2-FIAE-Aufgaben breit abdecken
- repo-nahe Szenarien und externe AP2-Themencluster zusammenfuehren
- nicht nur Hauptthemen, sondern auch Mikrothemen und typische Verwechslungen abdecken

## Quellenbasis

1. Repo-interne PV2-Quellen
   - `Kurse/Pruefungsvorbereitung-2-FIAE-Scenarien/possible_skills.json`
   - `Kurse/Pruefungsvorbereitung-2-FIAE-Scenarien/scenario-manifest.json`
   - Mappings unter `__documentation/agents/AP22fiae2Ticket-Workflow/`
2. Externe Themenbasis
   - IT-Berufe-Podcast: moegliche Themen fuer AP2 FIAE
   - IT-Berufe-Podcast: Themen und historische Haeufigkeiten bisheriger AP2-FIAE-Pruefungen
3. Offizielle Orientierungsquellen
   - FIAusbV
   - KMK-Rahmenlehrplan
   - BIBB-Umsetzungshilfe

## Hohe Prioritaet aus der historischen AP2-Auswertung

Nach der IT-Berufe-Podcast-Auswertung liegen die groessten Themenbloecke bei:

- Algorithmen
- Datenbanken
- UML
- SQL
- Softwareentwicklung
- Datenbankmodelle und -modellierung
- Testen
- Projektmanagement
- Qualitaetssicherung
- Softwareergonomie
- IT-Sicherheit

Besonders starke Einzelthemen sind dort u. a.:

- Pseudocode
- SELECT
- relationales Datenmodell
- Aktivitaetsdiagramm
- Klassendiagramm
- ERM
- Sequenzdiagramm
- Zustandsdiagramm
- Objektorientierung
- Use-Case-Diagramm
- Code Coverage
- INSERT, UPDATE, DELETE, UNION
- Vorgehensmodelle
- Schreibtischtest
- Design Patterns
- Mockups
- Stakeholder
- Usability
- Observer
- Verschluesselung
- Anforderungsanalyse
- XML, JSON
- dokumentenorientierte Datenbank
- Sortieralgorithmen
- Risikoanalyse
- Unit-Tests
- UI-Design
- Sicherheitsanforderungen
- Transaktionen
- CI/CD
- HTTP-Methoden
- HTTP-Statuscodes
- Datenqualitaet
- Versionsverwaltung

## Repo-nahe Szenariobloecke

Die PV2-Quellen im Repo bringen fuer den Gesamtpool zusaetzlich konkrete Aufgabenkontexte mit:

- Verbrauchsdaten, Statistik, Testlogik und SQL-Grundlagen
- Parkbetrieb, Besucherzaehlung, Aktivitaetslogik und SQL-Auswertung
- Investor-Portal, Sicherheitslogik, Sortierung und SQL-Berichte
- Praxisportal, Terminvergabe, Passwortlogik, 2D-Belegungsplaene und ERM
- historische AP2-Faelle 2021 bis 2025 mit Sequenzdiagrammen, API-Aufgaben, Unit-Tests, Datenqualitaet, Archivierung, DDL/DML und Aggregationen

## Abdeckungslogik fuer den Gesamtpool

Der Gesamtpool wird entlang dieser Cluster aufgebaut:

1. Algorithmen und Pseudocode
2. UML, OOP und Modellverstaendnis
3. Datenmodellierung und Normalisierung
4. SQL-Abfragen
5. Datenbankobjekte und Datenbankpraxis
6. Testen, Qualitaetssicherung und Auswertung
7. Sicherheit, Datenschutz und typische Angriffe
8. Web, APIs und Architektur
9. Anforderungen, UX und Vorgehen
10. Erweiterte Praxis: Versionsverwaltung, Patterns, Datenqualitaet, Risiko, Backup/Archivierung, VPN

## Generierungsprinzip

Pro Konzept werden mehrere unterschiedliche Fragetypen erzeugt, damit der Pool nicht aus identischen Umformulierungen besteht:

- Begriff zu Definition
- Definition zu Begriff
- Beispiel erkennen
- Gegenbeispiel erkennen
- Aussage bewerten
- beste Massnahme im Mini-Szenario
- Ursache/Folge erkennen
- Unterschied sauber abgrenzen
- fehlenden Punkt erkennen
- mehrere korrekte Aussagen waehlen
- Denkfehler finden
- Ziel-Mittel-Zuordnung

## Qualitätsgrenzen

- sichtbare Texte ohne Ticket-, Dateinamen- oder Versionsverweise
- keine offene Spekulation ueber Regeln oder Standards
- dort, wo die Repo-Mappings konkrete AP2-Logik zeigen, wird diese als Mini-Szenario oder Beispielkontext aufgegriffen
- dort, wo IT-Berufe-Podcast nur Themen nennt, werden nur fachlich stabile Grundbegriffe und Standardunterscheidungen verwendet
