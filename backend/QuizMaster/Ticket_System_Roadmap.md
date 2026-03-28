# Ticket-System Roadmap

Ziel: Die Ticket-Datenbank soll als SQL-gestuetzte, hierarchische Wissens- und Aufgabenbasis fuer den SkillTree dienen. Inhalte muessen aus kommerziell nutzbaren Quellen ableitbar sein, klar strukturiert, kompakt und spaeter unbegrenzt erweiterbar.

## Zielbild

- Tickets sind fachliche Arbeitsauftraege mit klarer Lernabsicht.
- Thema-Objekte sind die kleinsten fachlichen Einheiten innerhalb eines Tickets.
- SkillTree-Knoten, Oberthemen und Themenobjekte werden sauber getrennt.
- Fortschritt muss auf mehreren Ebenen messbar sein:
  - pro Thema-Objekt
  - pro Oberthema
  - pro Ticket
  - pro SkillTree-Knoten
- Cores sind die Freischaltwaehrung fuer neue Tickets.
- Ein Ticket ist einmalig bearbeitbar, sein Ergebnis kann aber in den SkillTree und in den Fortschritt rueckgekoppelt werden.

## Arbeitsaenderung in Paketen

Bis zum optischen Review liegen vor uns voraussichtlich **4 fachliche Pakete**; danach folgt Paket 5 fuer den optischen Review und anschliessend Paket 6 fuer Proxy-/Pages-Auslieferung:

1. Zielmodell, Begriffslogik und Datenvertrag
   - Ticket, Thema-Objekt, Oberthema, SkillTree-Knoten, Core, Freischaltung
   - N-n-Beziehungen zwischen Ticket und SkillTree
   - Bewertungslogik auf Ebene der Knoten und Themenobjekte

2. SQL-Schema und Importstruktur
   - Ticket-Tabellen oder Ticket-Ansicht im SQL-Modell
   - Quellen, Versionen, Themenobjekte und Zuordnungen
   - Generierbare Struktur fuer unbegrenzt viele Tickets
  - Basis-Scaffold fuer `backend/QuizMaster/output/ticketmaster.sqlite` und `backend/QuizMaster/scripts/build_ticketmaster_workspace.py`

3. Qualitaet, Komprimierung und Generierungsregeln
   - kuerzere, lesbare Tickettexte
   - Zerlegung von Mischpunkten in atomare Themenobjekte
   - neue Aufgabenmuster und Wiederholungslogik
   - erste Ticketfamilien und Blueprint-Instanzen sind seeding-seitig aufgesetzt

4. Core-, Unlock- und Fortschrittslogik
   - Cores sammeln
   - Ticket-Freischaltung
   - Fortschritt in SkillTree und Ticketwelt koppeln
   - Bewertungsraster an die groessere Ticketmenge anpassen
   - SQLite-Laufzeit jetzt per `ticket_runtime_engine.py` und Smoke-Test validiert

Danach folgt der **optische Review** als eigenes Paket:

5. UI, Layout, Benachrichtigungen und Lesbarkeit
   - Ticket-Icon mit Freischaltzustand
   - Core-Badges und Hinweistexte
   - zu viel Text reduzieren
   - visuelle Hierarchie und Uebersicht verbessern

6. SQL-Spiegel, Proxy-Ordner und GitHub-Pages-Auslieferung
   - SQL-Dateien als interne Spiegelung unter `__documentation/sql/`
   - konkrete Pack- und Shard-Konventionen fuer JSON-Lieferung
   - separate, einfache GitHub-Pages-Seiten fuer JSON-Abfragen und Shards
   - Hauptprojekt bleibt an seinem aktuellen Ort erreichbar
   - Proxy-Ordner beschreibt Routing, Manifest-Layout und GET-Zugriff auf die JSON-Dateien
   - erste echte Pack-Exporte und Loader-Smoke sind lokal erzeugt und geprueft
   - Host-Seiten sind jetzt kompaktere Kartenansichten mit sichtbaren Pack-/Shard-Metadaten und im Browser lokal verifiziert

## Referenzdokumente

- `backend/QuizMaster/Oberthemen_Arbeitsstruktur.md`
- `backend/QuizMaster/ThemenObjektErzeugungsFormel.md`
- `backend/QuizMaster/AufgabenErzeugungsFormel.md`
- `backend/QuizMaster/Filterstruktur_und_SQL.md`
- `backend/QuizMaster/KommerziellNutzbareQuellen.md`

## Naechster Arbeitsschritt

Paket 1 bis 4 sind aufgesetzt. Paket 3 ist mit den vier Ticketfamilien, 16 Generierungsmustern und den ersten Blueprint-Instanzen umgesetzt. Paket 4 ist mit der SQLite-Laufzeit-Engine, Seed-Daten, Core-Gewinn, Freischaltkette und Smoke-Test jetzt umgesetzt und verifiziert. Als naechstes folgt Paket 5: der optische Review. Paket 6 laeuft bereits mit Proxy-/Shard-Konventionen, der JSON-Lieferstruktur, ersten echten Pack-Exports, Loader-Smoke und card-artigen Host-Seiten; die Browser-Sanitaetspruefung ist lokal abgeschlossen.

ChiefDeveloper-Ergaenzung 2026-03-28:

- Die autoritative Quellen-DB fuer erlaubte Ticket-Neuerzeugung ist `backend/QuizMaster/output/quizmaster.sqlite`.
- Der operative Runtime-Zielbaum fuer Quiz- und Szenario-Dateien ist `backend/data/Kurse`.
- `backend/QuizMaster/Kurse` darf aktuell nicht als operativer Runtime-Zielpfad verwechselt werden.
