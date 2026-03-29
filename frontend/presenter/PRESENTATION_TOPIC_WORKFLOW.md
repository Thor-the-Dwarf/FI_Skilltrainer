# Presentation Topic Workflow

Diese Datei beschreibt den lokalen Agenten-Workflow fuer Babylon-Praesentationen, die auf Thema-Objekten aus der Kerndatenbank basieren.

## Kernkomponenten

- Kerndatenbank: `backend/QuizMaster/output/quizmaster.sqlite`
- Filter- und SQL-Hinweise: `backend/QuizMaster/Filterstruktur_und_SQL.md`
- Topic-Coverage-Registry: `frontend/presenter/presentation_topic_registry.json`
- Topic-Claim-Registry: `frontend/presenter/presentation_topic_claims.json`
- Next-free-Helper: `backend/QuizMaster/scripts/find_next_free_presentation_topic.py`
- Claim-Helper: `backend/QuizMaster/scripts/claim_next_presentation_topic.py`
- Claim-Update-Helper: `backend/QuizMaster/scripts/update_presentation_topic_claim.py`
- Registry-Validator: `backend/QuizMaster/scripts/validate_presentation_topic_registry.py`
- Globaler Skill: `/Users/thor/.codex/skills/create-babylon-presentation/SKILL.md`
- Projektlokaler Overlay-Skill: `.codex/skills/create-babylon-presentation/SKILL.md`

## Ziel

Ein Agent soll spaeter auf Zuruf:

- das naechste freie Thema finden
- das Thema vor parallelen Agenten konservativ reservieren
- feststellen koennen, ob ein breites Thema bereits nur teilweise abgedeckt ist
- eine neue Praesentation sauber an ein `thema_objekt` anbinden
- die Coverage danach explizit aktualisieren

## Grundsaetze

- Keine Titelraten, wenn die Kerndatenbank verfuegbar ist.
- Kein stillschweigendes `eine Praesentation = ein ganzes Thema`.
- Breite Themen koennen mehrere abgeleitete Praesentationen haben.
- `partial` ist ein erlaubter und wichtiger Zustand.
- Aktive Claims reservieren ein Thema konservativ fuer genau einen laufenden Agenten-Start.

## Paket- und Fortschrittsdisziplin

Fuer Babylon-Praesentationen in diesem Projekt gilt zusaetzlich der lokale Overlay-Skill.

Wichtige Kurzregeln:

- Vor Implementierung erst Coarse Pass, dann zwei Detail-Paesse, dann Holistic-Continuity-Pass.
- Ein groesseres 8-Szenen-Skript wird standardmaessig in sehr viele kleine Pakete zerlegt, nicht in wenige grobe Sammelpakete.
- In den beiden Detail-Paessen ist die sichere Default-Granularitaet: eine Szene pro Paket.
- Ein realistischer Mindestplan fuer ein 8-Szenen-Skript liegt damit eher bei deutlich ueber 20 Paketen als bei 14.
- Wenn ein Agent bei einer substanziellen Praesentation vier oder mehr Pakete in einem Durchlauf erledigt, war der Plan zu grob und muss feiner werden.
- Ein Babylon-Paketplan ist unvollstaendig, wenn die User-Abnahme nicht als eigenes Schluss-Paket auftaucht.
- Wenn mitten in der Arbeit ein neuer User-Task kommt, wird zuerst der Plan erweitert oder umgebaut.
- `GesamtFortschritt` wird nach Scope-Aenderungen ehrlich neu berechnet und darf deutlich fallen.
- `GesamtFortschritt` darf erst `100%` sein, wenn die Praesentation die User-Abnahme bestanden hat.
- Wenn Implementierung und Validierung fertig sind, muss das letzte offene Paket die User-Abnahme selbst sein.
- Der Paketnenner muss das spaetere User-Abnahme-Paket von Beginn an enthalten.
- Statusmeldungen muessen immer `Aktueller PaketName`, `Paket`, `PaketFortschritt` und `GesamtFortschritt` enthalten.

Praktische Obergrenzen fuer `GesamtFortschritt`:

- nach Coarse Plan meist hoechstens `10%`
- nach allen Detailpaessen meist hoechstens `55%`
- nach Alignment meist hoechstens `65%`
- nach Implementierung meist hoechstens `80%`
- nach Validierung meist hoechstens `90%`
- `100%` erst nach User-Abnahme

Korrekte Denkweise:

- Nach technischer Validierung ist die Praesentation noch nicht "fertig", solange die User-Abnahme offen ist.
- Ein Status wie `Paket: 27/27` mit `PaketFortschritt: 0%` und offenem Abnahme-Paket ist korrekt.
- Ein Status wie `Paket: 3/3` oder `14/14` mit `GesamtFortschritt: 100%` vor User-Abnahme ist fuer Babylon-Arbeit falsch.
- Vor User-Abnahme darf auch die Schlusskommunikation nur "review-bereit" oder "abnahme-bereit" sein, nicht "abgeschlossen".

## Wenn der User sagt: "Nimm dir das naechste freie Thema"

### Global frei

```bash
python3 backend/QuizMaster/scripts/find_next_free_presentation_topic.py --next-free
```

### Direkt claimen und Starter-Brief ausgeben

```bash
python3 backend/QuizMaster/scripts/claim_next_presentation_topic.py --agent codex-agent-01 --json
```

### In einem Oberthema suchen

```bash
python3 backend/QuizMaster/scripts/find_next_free_presentation_topic.py --oberthema "IT-Sicherheit und Datenschutz" --limit 12
```

### In einem bestehenden breiten Thema weiter vertiefen

```bash
python3 backend/QuizMaster/scripts/find_next_free_presentation_topic.py --topic Verschluesselung --include-partial --next-free
```

### Partielle Vertiefung claimen

```bash
python3 backend/QuizMaster/scripts/claim_next_presentation_topic.py --agent codex-agent-02 --topic Verschluesselung --include-partial --derived-subtopic-key asymmetrische_verschluesselung --derived-subtopic-title "Asymmetrische Verschluesselung" --json
```

## Wenn eine neue Praesentation entsteht

1. Thema in `quizmaster.sqlite` bestimmen.
2. In `frontend/presenter/data.js` explizite Source-Metadaten pflegen:
   - `sourceDatabase`
   - `sourceTopicIds`
   - `sourceTopicLabels`
   - `sourceOberthemaIds`
   - `sourceOberthemaLabels`
   - `coverageMode`
   - `derivedSubtopicKey`
   - `derivedSubtopicTitle`
   - `coverageNotes`
3. Den gleichen Stand in `frontend/presenter/presentation_topic_registry.json` eintragen oder aktualisieren.
4. Registry validieren:

```bash
python3 backend/QuizMaster/scripts/validate_presentation_topic_registry.py
```
5. Claim abschliessen oder freigeben:

```bash
python3 backend/QuizMaster/scripts/update_presentation_topic_claim.py --claim-id <claimId> --status done --presentation-id <presentationId>
```

## Source of Truth

- `frontend/presenter/data.js` ist die Runtime-Quelle fuer tatsaechlich vorhandene Praesentationen.
- `frontend/presenter/presentation_topic_registry.json` ist die operative Quelle fuer Themenabdeckung.
- `frontend/presenter/presentation_topic_claims.json` ist die operative Quelle fuer laufende Reservierungen.
- Alle drei muessen zusammen konsistent gehalten werden.

## Coverage-Regeln

- `full`: Das Thema soll durch diese Praesentation als vollstaendig abgedeckt gelten.
- `partial`: Die Praesentation deckt nur einen Teil eines breiteren Thema-Objekts ab.
- `unknown`: Noch keine belastbare Themenzuordnung oder Coverage-Aussage gepflegt.

## Aktueller Projektstand

- `symmetric_encryption_3min` ist an `sec_verschluesselung` gekoppelt.
- Diese Abdeckung ist bewusst `partial`, weil das Thema `Verschluesselung` breiter ist als nur symmetrische Verschluesselung.
- `raid0_network_io_demo` ist aktuell noch `unknown`, bis eine belastbare DB-Zuordnung gepflegt wird.
- Noch offene oder neue Claims muessen immer in `presentation_topic_claims.json` sichtbar sein.
