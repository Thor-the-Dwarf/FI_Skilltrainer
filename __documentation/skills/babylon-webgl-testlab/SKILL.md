---
name: babylon-webgl-testlab
description: Repo-lokales Skill fuer Babylon.js-, WebGL- und 3D-Frontend-Diagnostik in FI_Skilltrainer. Nutze es, wenn crystal_katalog oder andere Canvas/WebGL-Prototypen reproduzierbar getestet, mit einem Sandbox-Server gestartet, per DOM-Probe verifiziert oder auf Rendering-/Kontextfehler untersucht werden sollen.
---

# Babylon WebGL Testlab

Nutze dieses Skill fuer alle Babylon-/WebGL-lastigen Prototypen in diesem Repo, wenn normales DOM-QA nicht reicht.

## Ziel

- keine Desktop-Screenshots auf der Arbeitsflaeche
- reproduzierbare Sandbox-Laeufe aus dem Workspace
- sichtbare Runtime-Fehler statt stiller WebGL-/Renderfehler
- ein klarer Pfad fuer visuelle und technische 3D-Diagnostik

## Projekt-Workflow

1. Starte den Workspace-Sandbox-Server:
   `node __documentation/skills/babylon-webgl-testlab/scripts/start_workspace_sandbox_server.mjs`
2. Oeffne die Zielseite bevorzugt mit Testparametern:
   `http://127.0.0.1:8137/__backlog/crystal_katalog/index.html?selection=4&testlab=1`
3. Nutze zuerst das eingebaute Testlab-Overlay und `window.__crystalTestLab.getReport()`.
4. Fuer headless Checks verwende zuerst den DOM-Probe-Script:
   `zsh __documentation/skills/babylon-webgl-testlab/scripts/run_crystal_katalog_dom_probe.sh`
5. Wenn Playwright im Projekt verfuegbar ist, nutze ihn fuer wiederholbare Browserlaeufe:
   - `toHaveScreenshot()` nur in stabiler Umgebung und mit bewusstem Baseline-Review
   - fuer Screenshot-Stabilisierung zuerst `stylePath`, dann `mask`/`maskColor`, bei Bedarf `animations: 'disabled'`
   - `stylePath` zum Ausblenden volatiler UI-Anteile
   - `toMatchAriaSnapshot()` fuer Struktur-/Label-Regressionen statt nur Pixelbild
   - Trace-Aufzeichnung mindestens `on-first-retry`, bei lokaler Fehlersuche notfalls `--trace on`
6. Erst wenn Rendering-/Frame-Probleme danach unklar bleiben:
   - Babylon Inspector / Debug Layer fuer Szene-, Material-, Kamera- und State-Inspektion
   - SpectorJS fuer WebGL-Frame-Capture, Draw-Calls, Ressourcen und Pipeline-Zustaende
   - Browser-Performance-Tools zuerst fuer Live-Metriken, Rendering-Overlays, CPU-, Main-Thread- und Long-Task-Analyse
   - Chrome DevTools AI assistance nur als Erklaerungs-/Priorisierungshilfe auf bereits aufgezeichneten Profilen
7. Fuehre am Ende jedes Auftrags das Schlussprotokoll aus:
   `references/closeout-protocol.md`

## Was zuerst pruefen

- `window.onerror` / `unhandledrejection`
- `webglcontextlost`, `webglcontextrestored`, `webglcontextcreationerror`
- bei Restore-Faellen nicht nur Event protokollieren, sondern Ressourcen und State explizit neu aufbauen
- `gl.isContextLost()` und `gl.getContextAttributes()` bei unklaren GPU-/Fallback-Faellen mitprotokollieren
- bei lang laufenden Szenen oder Asset-Churn frueh Memory-Panel, Heap-Snapshots und Detached-DOM-Pruefung einplanen
- H1/H2/H3-Anzahlen und Sichtbarkeit im Testlab-Report
- Root- und Detail-View separat
- Kontextverlust und Restore nur gezielt simulieren, nicht dauernd
- `gl.getError()` und breite `getParameter()`-Probes nicht im Frame-Loop lassen; nur gezielt fuer Diagnose

## Werkzeug-Entscheidung

- Testlab-Overlay plus DOM-Probe ist der Standardpfad fuer repo-interne Smoke- und Strukturtests.
- Playwright ist der naechste Schritt, wenn reproduzierbare Browserinteraktion, Screenshot-Diffs, ARIA-Snapshots oder Traces gebraucht werden.
- Babylon Inspector ist interaktiv stark, aber kein belastbarer Ersatz fuer automatisierte Regressionen.
- SpectorJS ist die richtige Wahl fuer Draw-Call-, FBO-, Shader-, Texture- oder Clear-Order-Fragen.
- Chrome/Firefox DevTools sind fuer Performance, Memory-Druck, Event-Timing und GPU-nahe Laufzeitbilder gedacht, nicht fuer semantische UI-Regressionen.
- Chrome Rendering Tab und Performance Monitor sind der schnelle Vorfilter, bevor du schwere Traces oder Spector-Captures sammelst.
- Das Memory Panel ist Pflicht, wenn Babylon-Szenen, DOM-Overlays oder Asset-Wechsel ueber Zeit langsamer oder instabiler werden.
- AI-Assistance in DevTools darf Hypothesen verdichten, aber nie die primaeren Artefakte ersetzen. Behalte immer Trace, Overlay-Report oder Spector-Capture als Beleg.

## Veraltete oder umzurahmende Methoden

- Desktop-Screenshots auf die Arbeitsflaeche bleiben de facto deprecated. Nutze stattdessen Testlab-Reports, Playwright-Artefakte oder gezielte Browser-Captures.
- Reine Pixelvergleiche ohne Trace, DOM-Report oder klare Stabilisierungsmassnahmen sind fuer 3D-UI zu fragil.
- `WEBGL_debug_renderer_info` nur fuer gezielte GPU-Diagnose nutzen. Nicht als allgemeine Testentscheidung oder Fingerprinting-Abkuerzung einplanen.
- Dauerhafte `gl.getError()`-/`getParameter()`-Polls im Renderpfad sind als Standardprobe deprecated, weil sie Stalls und Jank verstecken oder sogar erzeugen koennen.
- Babylon Inspector nicht dauerhaft im Produktworkflow verdrahten. Er ist Diagnosewerkzeug, kein Standardbestandteil des reproduzierbaren Testpfads.

## Artefakte

- Sandbox-Server: `scripts/start_workspace_sandbox_server.mjs`
- Headless DOM-Probe: `scripts/run_crystal_katalog_dom_probe.sh`
- Referenzen: `references/testing-stack.md`
- Schlussprotokoll: `references/closeout-protocol.md`

## Parallel-Workflow mit spezialisierten Agenten

- Wenn der aktuelle Auftrag Parallel-Agenten erlaubt oder ausdruecklich verlangt, nutze spezialisierte Agenten parallel statt alles seriell lokal zu pruefen.
- Verteile klar getrennte Teilaufgaben:
  - Laufzeit-/Rendering-Diagnostik
  - Testharness/Sandbox
  - Kommentar-/Dokupass
  - Verifikation/Regression
- Reaktiviere vorhandene Agenten bevorzugt per Resume/Weitergabe statt jedes Mal neue Agenten ohne Projektkontext zu starten.
- Warte nur dann aktiv auf Agenten, wenn der naechste kritische Schritt wirklich blockiert ist.
- Halte die Ergebnisse so zusammen, dass am Ende ein gemeinsamer stabiler Abschlusslauf moeglich ist.

## Wann Referenzen laden

- Fuer aktuelle freie Tools, offizielle Links und Aktualisierungsregeln:
  `references/testing-stack.md`
- Fuer Abschlussregeln zu Kommentaren, Review, Tests und Commits:
  `references/closeout-protocol.md`
