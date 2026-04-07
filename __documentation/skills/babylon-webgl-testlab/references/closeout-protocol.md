# Schlussprotokoll

Dieses Protokoll ist am Ende jedes Auftrags verpflichtend.

## 1. Parallel-Agenten sauber abschliessen

- Laufende Spezialagenten auf Ergebnisse pruefen, offene Arbeit integrieren und nicht mehr benoetigte Agenten sauber schliessen.
- Bestehende Agenten moeglichst wiederverwenden oder reaktivieren, damit sie ihr Projektwissen behalten und nicht jedes Mal neu eingearbeitet werden muessen.

## 2. Kommentare aktualisieren

Aktualisiere bei allen geaenderten Methoden und allen relevanten, nicht offensichtlichen Stellen die Kommentare. Fokus ist nicht auf "was", sondern auf:

- welches Ziel die Stelle verfolgt
- warum sie genau so geloest wurde
- welche Regel, Einschraenkung oder Abwaegung dahintersteht

Verwende fuer solche Kommentare immer dieses Format:

```txt
Ziel: ...
Warum: ...
```

Pflicht:

- jede geaenderte Methode bekommt bei Bedarf einen solchen Kommentarblock
- komplexe Datenfluesse, Debugpfade, Render-Workarounds, Testharness-Logik und Performance-Tricks ebenfalls
- Kommentare muessen auch fuer Tester und andere spezialisierte Subagenten verstaendlich sein

## 3. Kommentar- und Architektur-Review

Nach dem Kommentarpass:

- lies neue und bestehende Kommentare zusammen
- frage dich, ob das Ziel stabiler, performanter oder einfacher erreichbar waere
- verbessere den Code gegebenenfalls direkt
- evaluiere, ob weitere Tests noetig sind
- evaluiere, ob weitere Kommentaraktualisierungen noetig sind

## 4. Abschluss-Tests

Vor dem Abschluss mindestens:

- Syntax-/Build-Checks
- den projektpassenden Sandbox-/Testlab-Lauf
- gezielte Regression auf die veraenderten Stellen

Wenn ein visueller oder WebGL-lastiger Pfad betroffen ist:

- Testlab-Report oder aehnliche maschinenlesbare Diagnose sichern
- nicht nur auf Gefuehl oder Codeannahmen vertrauen

## 5. Lokal committen

Am Ende jedes Auftrags lokal committen.

Wenn der Arbeitszustand auf einem Detached-HEAD liegt:

- die Arbeit nicht auf losem HEAD stehen lassen
- zuerst einen lokalen Branch oder einen lokalen Referenzpunkt auf den aktuellen Arbeitsstand ziehen
- erst dann committen

Das Ziel ist: keine ungesicherte Arbeit, kein schwer wiederfindbarer Stand.
