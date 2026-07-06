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
   - fuer schnelle Repo-Retests nach kleinen Babylon-/UI-Aenderungen zuerst `npx playwright test --only-changed` oder `npx playwright test --only-changed=<ref>` pruefen, bevor der volle Suite-Lauf oder breite Retry-Serien starten
   - fuer Server-Readiness keine Sleeps verdrahten; stattdessen `webServer.url`, `webServer.port` oder `webServer.wait` mit echtem Readiness-Signal nutzen
   - vor tiefen Traces zuerst leichte Fehlerartefakte sichern: `page.pageErrors()` und `page.consoleMessages()` fuer die juengsten Laufzeitfehler/Konsolenhinweise abfragen, wenn die installierte Playwright-Version das unterstuetzt
   - bei Asset- oder Ladeverdacht zuerst `page.requests()` fuer den juengsten Anfrage-Satz pruefen, bevor ein voller Trace oder HAR noetig wird
   - wenn `page.requests()` nicht reicht, HAR gezielt mit `context.tracing.startHar()` oder `tracing.stopHar()` auf den fraglichen Ablauf begrenzen, statt pauschal jeden Lauf mit Voll-Trace und separatem HAR aufzublaehen
   - seit Playwright 1.61 erfassen HAR- und Trace-Artefakte dabei auch WebSocket-Verkehr; bei live gestreamten Szene-, Tool- oder Eventdaten deshalb zuerst diesen offiziellen Mitschnitt pruefen, bevor ad-hoc Debug-Logs oder eigene Socket-Probes eingebaut werden
   - `toHaveScreenshot()` nur in stabiler Umgebung und mit bewusstem Baseline-Review
   - fuer Screenshot-Stabilisierung zuerst `stylePath`, dann `mask`/`maskColor`, bei Bedarf `animations: 'disabled'`
   - `stylePath` zum Ausblenden volatiler UI-Anteile
   - `toMatchAriaSnapshot()` fuer Struktur-/Label-Regressionen statt nur Pixelbild; seit Playwright 1.60 bei Bedarf direkt auf `page` statt nur auf `locator`
   - `page.ariaSnapshot()` oder `locator.ariaSnapshot({ depth, mode, boxes })` fuer schnelle Semantik-Artefakte ohne Snapshot-Datei; `boxes` nur dann zuschalten, wenn Bounding-Boxes fuer agentische oder visuelle Layout-Pruefung wirklich gebraucht werden
   - Trace-Aufzeichnung mindestens `on-first-retry`, bei flaky 3D-Laeufen bevorzugt `retain-on-failure-and-retries`, damit erfolgreiche und fehlgeschlagene Versuche vergleichbar bleiben
   - `npx playwright show-trace trace.zip` oder `npx playwright show-trace trace/` für agenten- oder terminaltaugliche Trace-Sichtung nutzen, wenn kein GUI-Trace-Viewer sinnvoll ist
   - HTML-Report `Speedboard` und Timeline nutzen, wenn 3D-Tests ploetzlich langsamer oder nur unter Last flaky werden; das ist der schnelle Weg vor tiefen Performance-Profilen
   - `page.screencast` nur als Review-/Walkthrough-Artefakt mit klaren Kapiteln/Aktionsmarkern einsetzen; es ersetzt keine Assertions, Screenshots, Traces oder Testlab-Reports
   - fuer agentische Review-Loops sind `browser.bind()`, `playwright-cli show`, `npx playwright test --debug=cli` und gebundene Browser-Sessions sinnvoll, wenn ein Agent und ein Mensch denselben Lauf untersuchen muessen
   - fuer agentische Testgenerierung oder Reparatur nur die offiziellen Playwright Test Agents (`planner`, `generator`, `healer`) und frisch erzeugte Agent-Definitionen verwenden; generierte Tests immer gegen DOM-Report, Screenshot-Baseline oder Trace verifizieren
   - bei Testumgebungs-Missbrauch oder verbotenen Seiteneffekten frueh `test.abort()` einsetzen, statt den Lauf mit irrefuehrenden Folgefehlern weiterlaufen zu lassen
   - bei Visual-Baselines Browseridentitaet bewusst festhalten: Seit Playwright 1.57 laufen Default-Builds auf Chrome for Testing statt auf frueheren Chromium-Binaries
6. Erst wenn Rendering-/Frame-Probleme danach unklar bleiben:
   - Babylon Inspector / Debug Layer für Szene-, Material-, Kamera- und State-Inspektion; bei Modul-Builds den Inspector lokal importieren statt still auf CDN-Fallbacks zu vertrauen
   - SpectorJS fuer WebGL-Frame-Capture, Draw-Calls, Ressourcen und Pipeline-Zustaende
   - Browser-Performance-Tools zuerst fuer Live-Metriken, Rendering-Overlays, CPU-, Main-Thread- und Long-Task-Analyse
   - für schnelle Qualitäts-, Accessibility- oder Performance-Triage optional zuerst Lighthouse im DevTools-Panel oder über Chrome DevTools for agents laufen lassen; tiefe 3D-Befunde danach immer mit Trace, Report oder manueller Inspektion absichern
   - bei Browserabsturz, GPU-Reset oder tabweiten Haengern zusaetzlich Chrome DevTools Crash reports sichten, bevor das Problem nur der Szene oder Babylon selbst zugeschrieben wird
   - Firefox Profiler als zweite CPU-/Main-Thread-Sicht hinzuziehen, wenn Chrome-Traces zu vage bleiben oder ein browseruebergreifender Jank-Verdacht besteht
   - Chrome DevTools AI assistance nur als Erklaerungs-/Priorisierungshilfe auf bereits aufgezeichneten Profilen
   - Chrome DevTools for agents als offiziellen stabilen Agentenpfad für Browserverifikation, Lighthouse-Audits, Memory-Snapshot-Leak-Triage oder Performance-Traces nutzen; seit Chrome 149/V1.1.1 kann auch gezielte Header-Emulation fuer geschuetzte Staging- oder Auth-Repros nuetzlich sein
   - experimentelle WebMCP- oder page-exposed-tools-Pfade nur bewusst zuschalten; sie sind nicht der Ersatz fuer MCP/CLI und Ergebnisse muessen immer mit Rohtrace, Heap-Artefakt, Screenshot, DOM-Report oder manuellem Review belegt werden
   - im DevTools Responsive Device Mode keine feste Alt-Android-UA mehr unterstellen; seit Chrome 149 ist die Default-UA dynamisch, daher fuer UA-sensitive Bugs oder Baselines explizite Emulation dokumentieren
7. Fuehre am Ende jedes Auftrags das Schlussprotokoll aus:
   `references/closeout-protocol.md`

## Was zuerst pruefen

- `window.onerror` / `unhandledrejection`
- `webglcontextlost`, `webglcontextrestored`, `webglcontextcreationerror`
- bei Restore-Faellen nicht nur Event protokollieren, sondern Ressourcen und State explizit neu aufbauen
- `gl.isContextLost()` und `gl.getContextAttributes()` bei unklaren GPU-/Fallback-Faellen mitprotokollieren
- wenn Diagnose- oder Capture-Pfade bewusst ausserhalb von `requestAnimationFrame` rendern, gezielt `gl.flush()` als Hilfsprobe einplanen; im normalen RAF-Pfad nicht pauschal erzwingen
- bei lang laufenden Szenen oder Asset-Churn frueh Memory-Panel, Heap-Snapshots und Detached-DOM-Pruefung einplanen
- fuer Leak-Verdacht in browserautomatisierten Laeufen nach reproduzierbaren Freigabepunkten `page.requestGC()` als Hilfsprobe einplanen; Freigabe immer ueber WeakRef-/Objektbeobachtung oder Heap-Artefakt absichern
- H1/H2/H3-Anzahlen und Sichtbarkeit im Testlab-Report
- Root- und Detail-View separat
- Kontextverlust und Restore nur gezielt simulieren, nicht dauernd
- `gl.getError()` und breite `getParameter()`-Probes nicht im Frame-Loop lassen; nur gezielt fuer Diagnose

## Werkzeug-Entscheidung

- Testlab-Overlay plus DOM-Probe ist der Standardpfad fuer repo-interne Smoke- und Strukturtests.
- Playwright ist der naechste Schritt, wenn reproduzierbare Browserinteraktion, Screenshot-Diffs, ARIA-Snapshots oder Traces gebraucht werden.
- Playwright sollte vor tiefen Traces zuerst die leichten Artefakte liefern: juengste `pageErrors`, Konsolenmeldungen, ARIA-Snapshots und nur dann den schweren Trace.
- `npx playwright test --only-changed` ist fuer diese Repo-Praxis der billigste erste Retest nach kleinen Babylon-/UI-Aenderungen; Vollsuite, Retry-Serien oder schwere Traces erst nachziehen, wenn dieser Lauf signalisiert, dass der Fehler breiter ist.
- Playwright ist seit den aktuellen Releases auch fuer agentengetriebene Reviews brauchbarer geworden: gebundene Browser-Sessions, CLI-Debugging und CLI-Traceanalyse verkuerzen den Weg zwischen Fehler, Artefakt und Review.
- Playwrights juengste leichte Diagnosepfade sind fuer 3D-QA wertvoll: `page.requests()` deckt fehlende Asset-, Shader- oder Datenanfragen frueh auf, und `page.requestGC()` hilft bei kontrollierten Leak-Proben in langen Szenen.
- Playwright 1.60 staerkt zwei bereits sinnvolle Pfade: page-weite ARIA-Snapshots vereinfachen semantische Whole-Page-Checks, und HAR direkt im Tracing-Pfad macht gezielte Netz-Artefakte leichter wartbar als ad-hoc Doppelerfassung.
- Playwright 1.61 macht denselben HAR-/Trace-Pfad fuer browserbasierte 3D-Apps noch nuetzlicher: WebSocket-Verkehr landet jetzt ebenfalls in den offiziellen Artefakten. Fuer gestreamte Laufzeitdaten, kollaborative States oder Tool-Events ist das der neue Standardbeleg vor eigener Socket-Instrumentierung.
- Offizielle Playwright Test Agents sind nuetzlich fuer AI-gestuetzte Testplanung, -erzeugung und -reparatur, aber nur als beschleunigender Pfad. Die repo-lokale Wahrheit bleibt im DOM-Report, in Traces, Baselines und manueller Review.
- Playwright-Screencasts sind hilfreich fuer menschliche Review-Nachweise von komplexen 3D-Flows, aber nur zusaetzlich zu maschinenlesbaren Checks.
- Speedboard und Timeline im HTML-Report sind der schnellste kostenfreie Vorfilter, wenn 3D-Tests ploetzlich langsam, worker-unausgewogen oder nur unter Retry flaky werden.
- Fuer repo-lokale Serverstarts sind explizite Readiness-Signale belastbarer als Sleeps oder "Port wird schon offen sein"-Annahmen.
- Playwright-CLI-Traceanalyse ist sinnvoll, wenn ein Agent oder Terminal-Workflow schnell herausfinden muss, welcher Schritt in einem gespeicherten Trace kippt.
- `test.abort()` ist fuer Reliability-Workflows nuetzlich, wenn eine Testumgebung erkennbar ungueltig geworden ist oder ein Lauf verbotene Side-Effects ausloesen wuerde; das spart Folge-Rauschen.
- Babylon Inspector ist interaktiv stark, aber kein belastbarer Ersatz fuer automatisierte Regressionen.
- Fuer Babylon-Inspector-Laeufe in Modulprojekten ist der lokale ES-Modul-Import belastbarer als ein impliziter CDN-Nachladepfad; das reduziert falsch-negative Debug-Sitzungen durch Offline-/Policy-Probleme.
- SpectorJS ist die richtige Wahl fuer Draw-Call-, FBO-, Shader-, Texture- oder Clear-Order-Fragen.
- Chrome/Firefox DevTools sind fuer Performance, Memory-Druck, Event-Timing und GPU-nahe Laufzeitbilder gedacht, nicht fuer semantische UI-Regressionen.
- Chrome DevTools Crash reports sind ein eigener Diagnosepfad fuer Browserinstabilitaet unter GPU-, Treiber- oder Tabdruck und sollten vor reiner App-Schuldzuweisung geprueft werden.
- Firefox Profiler ist die passende Zweitmeinung fuer CPU- und Thread-Jank, wenn ein Problem nicht klar Babylon-, App- oder Chrome-spezifisch ist.
- Chrome Rendering Tab, Performance Monitor, der Default-Full-Page-Accessibility-Tree und die empfohlenen Throttling-Presets sind der schnelle Vorfilter, bevor du schwere Traces oder Spector-Captures sammelst.
- Das Memory Panel ist Pflicht, wenn Babylon-Szenen, DOM-Overlays oder Asset-Wechsel ueber Zeit langsamer oder instabiler werden.
- AI-Assistance in DevTools darf Hypothesen verdichten, aber nie die primaeren Artefakte ersetzen. Behalte immer Trace, Overlay-Report oder Spector-Capture als Beleg.
- Chrome DevTools for agents kann einen Coding-Agenten in echte Chrome-Laufzeit bringen. Nutze den seit 19. Mai 2026 stabilen Pfad für Verifikation, Lighthouse-Audits, Memory-Snapshot-Triage und Trace-Erzeugung, nicht als alleinige Bewertungsinstanz.
- Seit Chrome 149/V1.1.1 lohnt sich Chrome DevTools for agents zusaetzlich fuer gezielte Header-Emulation bei geschuetzten Testumgebungen; experimentelle WebMCP- oder page-exposed-tools-Pfade bleiben dagegen Opt-in und kein Standardwerkzeug fuer dieses Repo.
- Seit Chrome 149 ist der Responsive Device Mode fuer manuelle Mobile-Repros weniger "statisch": die Default-UA wird heuristisch modernisiert. Fuer UA-sensitive Fehler oder Baselines deshalb explizite Emulation bzw. dokumentierte Browser-/Device-Angaben erzwingen.
- Chrome-149-Erweiterungen wie experimentelles WebMCP-Debugging, page-exposed tools und Header-Emulation sind interessant für spezialisierte Agentenläufe, aber noch kein Standardpfad für dieses Repo.

## Veraltete oder umzurahmende Methoden

- Desktop-Screenshots auf die Arbeitsflaeche bleiben de facto deprecated. Nutze stattdessen Testlab-Reports, Playwright-Artefakte oder gezielte Browser-Captures.
- Reine Pixelvergleiche ohne Trace, DOM-Report oder klare Stabilisierungsmassnahmen sind fuer 3D-UI zu fragil.
- Reine Video-/Screencast-Receipts ohne Assertions oder maschinenlesbares Diagnoseartefakt sind nur Review-Hilfe, kein Regressionstest.
- Sleep-basierte Warteketten vor Browserstarts sind als Standardmethode deprecated; nutze stattdessen echte Server-Readiness ueber Playwright oder den Sandbox-Report.
- `WEBGL_debug_renderer_info` nur fuer gezielte GPU-Diagnose nutzen. Nicht als allgemeine Testentscheidung oder Fingerprinting-Abkuerzung einplanen.
- Dauerhafte `gl.getError()`-/`getParameter()`-Polls im Renderpfad sind als Standardprobe deprecated, weil sie Stalls und Jank verstecken oder sogar erzeugen koennen.
- Kontextverlust-Dauerschleifen als allgemeiner Smoke-Test sind umzurahmen: `WEBGL_lose_context` gezielt fuer Teardown-, Restore- oder Chaos-Proben nutzen, nicht als permanenten Standardlauf.
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
