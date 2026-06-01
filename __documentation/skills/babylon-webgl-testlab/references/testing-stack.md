# Babylon/WebGL Test-Stack

## Kostenlose/Offizielle Bausteine

- Babylon.js Dokumentation als Engine- und Debug-Layer-Basis: <https://doc.babylonjs.com/>
- Babylon.js ES6-Support fuer lokalen Debug-Layer-/Inspector-Import ohne impliziten CDN-Pfad: <https://doc.babylonjs.com/setup/frameworkPackages/es6Support>
- SpectorJS aus dem Babylon-Umfeld fuer WebGL-Frame-Inspektion und Capture-Export: <https://github.com/BabylonJS/Spector.js/>
- Playwright Visual Comparisons fuer Screenshot-Baselines, `stylePath` und Snapshot-Review: <https://playwright.dev/docs/test-snapshots>
- Playwright Screenshot-API fuer `animations`, `mask`, `maskColor` und Skalierungsoptionen: <https://playwright.dev/docs/api/class-page#page-screenshot>
- Playwright ARIA Snapshots fuer stabile Struktur-/Semantik-Regressionen: <https://playwright.dev/docs/aria-snapshots>
- Playwright Test Agents fuer offizielle agentische Testplanung, -erzeugung und -reparatur: <https://playwright.dev/docs/test-agents>
- Playwright Trace Viewer fuer reproduzierbare Fehlersuche mit DOM-, Netzwerk- und Konsolen-Kontext: <https://playwright.dev/docs/trace-viewer-intro>
- Playwright Tracing API fuer gezieltes HAR-Scoping mit `tracing.startHar()` / `tracing.stopHar()`: <https://playwright.dev/docs/api/class-tracing>
- Playwright Release Notes fuer `page.screencast`, CLI-Traceanalyse, `retain-on-failure-and-retries`, `page.ariaSnapshot()`, `browser.bind()` und `--debug=cli`: <https://playwright.dev/docs/release-notes>
- Playwright Release Notes fuer Playwright 1.60 mit Page-`toMatchAriaSnapshot()`, `boxes` in ARIA-Snapshots, HAR-on-tracing und `test.abort()`: <https://playwright.dev/docs/release-notes>
- Playwright Release Notes fuer `Speedboard`, Timeline sowie `page.consoleMessages()` und `page.pageErrors()`: <https://playwright.dev/docs/release-notes>
- Playwright Page API fuer `page.requests()` und `page.requestGC()` als leichte Netz- und Leak-Probes: <https://playwright.dev/docs/api/class-page>
- Playwright Browser API fuer gebundene Browser-Sessions: <https://playwright.dev/docs/api/class-browser#browser-bind>
- Playwright TestConfig `webServer` fuer belastbare Server-Readiness statt Sleeps: <https://playwright.dev/docs/api/class-testconfig>
- Playwright Browsers-Dokumentation fuer Browser-Binaries, Channels und reproduzierbare Visual-Baselines: <https://playwright.dev/docs/browsers>
- Playwright Coding Agents / CLI fuer Dashboard-, Session- und Attach-Workflows: <https://playwright.dev/agent-cli/introduction>
- Chrome DevTools Performance Panel fuer CPU-/Thread-Analyse: <https://developer.chrome.com/docs/devtools/performance/overview>
- Chrome DevTools Performance Features Reference fuer Live Metrics, Screenshots, Throttling und Long-Task-Auswertung: <https://developer.chrome.com/docs/devtools/performance/reference>
- Chrome DevTools Rendering Tab fuer Paint-/Layout-/Layer-Overlays und Rendering-Statistiken: <https://developer.chrome.com/docs/devtools/rendering>
- Chrome DevTools Memory-Analyse fuer Heap-Snapshots, Detached DOM Trees und Allocation Timelines: <https://developer.chrome.com/docs/devtools/memory-problems>
- Chrome DevTools AI assistance / Chat als optionale Auswertungsschicht auf vorhandenen Profilen, DOM- oder Netzwerk-Kontexten: <https://developer.chrome.com/docs/devtools/ai-assistance/chat#ai-assistance-for-performance>
- Chrome DevTools MCP fuer agentengetriebene Browser-Verifikation und Performance-Traces: <https://developer.chrome.com/blog/chrome-devtools-mcp>
- Chrome 147 DevTools-Update zu AI assistance mit automatischer Kontextwahl und Trace-Start: <https://developer.chrome.com/blog/new-in-devtools-147?hl=en>
- Chrome 147 DevTools-Update zu integrierten Lighthouse-Audits, Memory-Leak-Detection-Skill und `pageId`-Routing fuer Agenten: <https://developer.chrome.com/blog/new-in-devtools-147?hl=en>
- Chrome 148 DevTools-Update zu Crash reports, vollem Accessibility-Tree und MCP-0.24-Reliability-Verbesserungen: <https://developer.chrome.com/blog/new-in-devtools-148?hl=en>
- Firefox Profiler als offizielle zweite CPU-/Thread-Sicht fuer browseruebergreifende Performanceanalyse: <https://firefox-source-docs.mozilla.org/tools/profiler/index.html>
- MDN `webglcontextlost`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event>
- MDN `webglcontextrestored`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event>
- MDN `webglcontextcreationerror`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event>
- MDN `WebGLRenderingContext.isContextLost()`: <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/isContextLost>
- MDN `WebGLRenderingContext.getContextAttributes()`: <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getContextAttributes>
- MDN WebGL Best Practices fuer VRAM-Budget, Flush-/Stall-Regeln und Shader-Kompilierung: <https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices>
- MDN `WEBGL_lose_context.loseContext()` fuer gezielte Teardown-/Chaos-Proben und aktives Freigeben nicht mehr benoetigter Kontexte: <https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext>
- MDN `WEBGL_lose_context.restoreContext()`: <https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/restoreContext>
- MDN `WEBGL_debug_renderer_info`: <https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info>

## Repo-spezifische Teststrategie

1. `crystal_katalog` immer ueber den Workspace-Sandbox-Server starten.
2. Mit `?testlab=1` das eingebaute Diagnose-Overlay aktivieren.
3. Fuer reproduzierbare Checks zuerst DOM-Report statt Desktop-Screenshot nutzen.
4. Fuer Browserautomation zuerst semantische und maschinenlesbare Signale pruefen:
   - DOM-Report
   - Playwright Assertions
   - ARIA-Snapshots
5. Screenshot-Diffs nur in stabiler Umgebung und zuerst mit `stylePath`, danach bei Bedarf mit `mask`/`maskColor` und deaktivierten Animationen stabilisieren.
6. Wenn Playwright verfuegbar ist, neue Artefaktarten bewusst trennen:
   - `page.pageErrors()` und `page.consoleMessages()` fuer billige Vorab-Hinweise auf Runtime-Fehler
   - `page.requests()` fuer schnelle Hinweise auf asset- oder datenbezogene Fehlschlaege ohne sofortigen Voll-Trace
   - ARIA-Snapshot-Assertions oder direkte `ariaSnapshot()`-Artefakte fuer Semantik; bei Whole-Page-Checks seit 1.60 auch direkt auf `page`
   - `boxes` in ARIA-Snapshots nur zuschalten, wenn Layout-/Bounding-Box-Kontext fuer Agenten oder visuelle Strukturpruefung wirklich gebraucht wird
   - Screenshot-Baselines fuer visuelle Regressionen
   - Trace-Dateien fuer Fehlerpfade, bei flaky Tests mit `retain-on-failure-and-retries`
   - gezielt gescoptes HAR via Tracing, wenn Netzwerk-/Asset-Diagnose mehr Kontext als `page.requests()` braucht, aber kein breit gestreuter Voll-Trace noetig ist
   - HTML-Report `Speedboard` und Timeline fuer ploetzliche Laufzeitverschiebungen, worker-ungleiche Last oder Retry-Ausreisser
   - Screencasts nur fuer menschliche Review-Walkthroughs und Agenten-Receipts
   - gebundene Browser-Sessions und CLI-Debugging fuer agentische Diagnose oder gemeinsame Mensch-/Agent-Review
   - offizielle Playwright Test Agents fuer Testplan-, Generierungs- oder Heiler-Loops, aber nur mit nachgelagerter Artefaktpruefung
   - `test.abort()` fuer fruehen Abbruch bei ungueltiger Testumgebung oder verbotenen Seiteneffekten
   - Readiness ueber `webServer.url`, `webServer.port` oder `webServer.wait`, nicht ueber starre Sleeps
7. Bei unklarer Laufzeitqualitaet vor dem Voll-Trace zuerst Rendering Tab, Performance Monitor oder Live Metrics zur schnellen Einordnung nutzen.
8. Trace-Aufzeichnung fuer flaky oder schwer reproduzierbare Fehler standardmaessig mitdenken. Fuer Agenten-/Terminalarbeit zuerst pruefen, ob `npx playwright trace` schneller zum relevanten Schritt fuehrt als der GUI-Trace-Viewer.
9. Wenn ein Problem visuell, GPU-nah oder im Tiefenpuffer steckt:
   - Babylon Inspector fuer interaktive Szenenpruefung; in Modulprojekten lokal importieren statt auf verdeckte CDN-Nachladung zu bauen
   - SpectorJS fuer Frame-Capture
   - Browser DevTools Performance/Rendering
   - Chrome Crash reports bei Browserabsturz, GPU-Reset oder tabweiten Haengern
   - optional Lighthouse im DevTools-Panel oder ueber DevTools MCP als fruehes Qualitaets-, Accessibility- oder Performance-Gate
   - Firefox Profiler als zweite CPU-/Thread-Sicht, wenn Chrome keine klare Zuordnung liefert
   - Memory Panel bei Asset-Churn, Scene-Switches oder schleichender Degradation
   - `page.requestGC()` bei reproduzierbaren Freigabepunkten als Leak-Hinweis, nicht als alleiniger Beweis
   - bei Nicht-RAF-Diagnosepfaden `gl.flush()` gezielt als Hilfsprobe erwägen; im normalen RAF-Pfad nicht reflexhaft einschalten
   - `WEBGL_lose_context.loseContext()` als gezielten Teardown-/Chaos-Test nutzen, wenn Kontexte aktiv beendet oder Restore-Pfade bewusst geprüft werden sollen
   - optional DevTools AI assistance zur schnelleren Profil-Einordnung
   - optional Chrome DevTools MCP, wenn ein Coding-Agent den Browserlauf oder Performance-Trace selbst erzeugen soll
10. Danach erst Code-Hypothesen festziehen.

## Mindestanforderungen fuer einen stabilen Testlauf

- keine Browser-Desktop-Screenshots auf die Arbeitsflaeche
- Fehler muessen im Overlay oder Report auftauchen
- Auswahl und Viewstate per Query-Parameter reproduzierbar sein
- Form-4-Faelle immer mindestens in Root-View testbar
- bei Kontextverlust muss der Wiederaufbau von WebGL-Ressourcen als eigener Check betrachtet werden
- bei lang laufenden Sessions muss mindestens einmal auf Memory-Wachstum oder haengende DOM-/Scene-Reste geprueft werden

## Was sich gegenueber dem alten Stand geaendert hat

- Playwright ist nicht mehr nur fuer UI-Mode interessant, sondern auch fuer drei klar getrennte Artefakte:
  - Screenshot-Baselines mit Stabilisierung
  - ARIA-Snapshots fuer semantische Regressionen
  - Traces fuer Fehlersuche und Nachvollziehbarkeit
- Playwright 1.57 veraendert die Reproduzierbarkeitsannahme fuer visuelle Tests: Default-Laeufe nutzen Chrome-for-Testing-Binaries statt der frueheren Chromium-Builds. Browser-/Channel-Angaben sollten deshalb bei Baseline-Entscheidungen bewusst mitprotokolliert werden.
- Playwrights Screenshot-API ist inzwischen relevant genug fuer den Testpfad selbst, weil `animations`, `mask` und `maskColor` volatile Bereiche sauberer stabilisieren als ad-hoc CSS allein.
- Playwright 1.58 erweitert den praktischen Diagnosepfad vor dem Voll-Trace: `Speedboard` und die HTML-Report-Timeline machen langsame, worker-ungleiche oder retry-lastige 3D-Tests frueher sichtbar.
- Playwright 1.56 liefert mit `page.consoleMessages()` und `page.pageErrors()` einen leichten Vorab-Check, der haeufig schon vor Trace/Spector zeigt, ob der Lauf an Runtime-Fehlern statt an Rendering selbst scheitert.
- Playwright 1.59 erweitert den praktischen Testpfad: `page.screencast` liefert annotierte Review-Videos, `npx playwright trace` macht gespeicherte Traces terminal-/agententauglich, `retain-on-failure-and-retries` erleichtert flaky-Vergleiche, direkte ARIA-Snapshot-Methoden liefern schnelle Semantik-Artefakte, und `browser.bind()` plus `playwright-cli show`/`--debug=cli` machen gemeinsame Mensch-/Agent-Diagnose praktikabler.
- Playwright 1.60 ist fuer diese Skill-Doku relevant, obwohl es kein kompletter Methodenwechsel ist: `expect(page).toMatchAriaSnapshot()` vereinfacht Whole-Page-Semantikpruefungen, `boxes` ergaenzt ARIA-Artefakte um Bounding-Box-Kontext fuer agentische oder layoutnahe Reviews, `tracing.startHar()`/`stopHar()` machen gezieltes Netz-Artefakt-Scoping praktikabler, und `test.abort()` reduziert irrelevante Folgefehler in ungueltigen Laeufen.
- Playwrights offizielle Test-Agents-Dokumentation macht AI-unterstuetzte Testplanung, -generierung und -reparatur inzwischen zu einem klar benannten Wartungspfad. Fuer diese Skill-Doku heisst das: Agenten duerfen beschleunigen, aber nicht den manuellen Artefakt-Review ersetzen.
- `page.requests()` und `page.requestGC()` sind fuer diese Repo-Teststrategie inzwischen relevant genug, um sie als leichte Vorab-Probes vor HAR, Voll-Trace oder tiefer Memory-Forensik zu fuehren.
- Kontext-Restore sollte nicht als simples "Event kam zurueck, also okay" bewertet werden. Nach offiziellem MDN-Hinweis sind alte WebGL-Ressourcen nach Restore ungueltig und muessen neu erstellt werden.
- MDN betont staerker als frueher, dass VRAM-Budgets, gezieltes Flush-Verhalten und das Vermeiden blockierender WebGL-Calls Teil der Stabilitaetsdiagnose sind, nicht nur Engine-Optimierung.
- Chrome DevTools deckt den schnellen Vorfilter inzwischen besser ab: Rendering-Overlays, Live Metrics, Performance Monitor und Memory-Workflows sollten vor tiefen Einzelwerkzeugen eingesetzt werden.
- Chrome DevTools hat inzwischen eine offizielle AI-Assistenz als allgemeines Chat-Panel mit Performance-, DOM-, Netzwerk- und Sources-Kontext. Das ist nuetzlich fuer Triage, ersetzt aber keine Rohdaten und kein manuelles Profil-Review.
- Seit dem Chrome-147-Update vom 7. April 2026 kann DevTools AI assistance den Kontext haeufig selbst waehlen und bei offenen Performance-Fragen direkt einen Trace starten. Das beschleunigt Triage, aendert aber nicht die Belegpflicht.
- Das Chrome-147-Update vom 7. April 2026 erweitert den agentischen DevTools-Pfad praktisch: integrierte Lighthouse-Audits, ein offizieller Memory-Leak-Detection-Skill ueber `take_memory_snapshot` und `pageId`-Routing fuer parallele Agenten machen fruehe Qualitaets- und Leak-Triage billiger, bevor tiefe Handarbeit startet.
- Seit dem Chrome-148-Update vom 5. Mai 2026 gibt es zusaetzlich einen Crash-reports-Kontext in DevTools. Das ist fuer browserbasierte 3D-Diagnostik relevant, wenn Tab- oder GPU-Abstuerze sonst faelschlich nur im App-Code gesucht wuerden.
- Das Chrome-148-Update vom 5. Mai 2026 verbessert ausserdem den manuellen Review-Pfad: der Full-Page-Accessibility-Tree ist jetzt Standard, die Network-Ansicht zeigt auf Wunsch die absolute Request-Reihenfolge, und empfohlene Throttling-Presets orientieren sich an Felddaten. Das hilft bei Asset-Order-, Accessibility- und Realnetz-Triage ohne Sonderwerkzeuge.
- Chrome DevTools MCP ist als offizieller Preview-Pfad fuer agentengetriebene Browser-Verifikation und Performance-Traces relevant, aber nur als Werkzeug zur Artefakt-Erzeugung. Die Bewertung bleibt an Rohdaten und Review gebunden.
- Chrome 148 dokumentiert zudem Reliability-Fixes fuer den DevTools-MCP-/CLI-Pfad, etwa automatisch abgefangene Browser-Dialoge. Das senkt Stoerquellen in agentischen Browserlaeufen, aendert aber nicht die Anforderung an Belegartefakte.
- Chrome 148 erweitert den DevTools-fuer-Agenten-Pfad ausserdem um Extension-Debugging, experimentelles WebMCP-Tool-Calling und eine Lighthouse-Kategorie fuer agentisches Browsing. Fuer dieses Repo ist das vorerst kein Standardpfad, aber relevant, falls Browser- oder Tooling-Oberflaechen spaeter agentisch mitgeprueft werden.
- Firefox Profiler ist als kostenfreie Gegenprobe weiter aufgewertet worden: Er bleibt kein WebGL-Spezialwerkzeug, ist aber fuer CPU-Stacks, Marker und browseruebergreifende Thread-Jank-Abgrenzung jetzt klarer als empfohlene Zweitmeinung einzuordnen.
- Die offizielle Babylon-ES6-Doku macht fuer Test- und Debug-Laeufe einen stillen Fallstrick expliziter: In Modulprojekten sollte der Inspector lokal eingebunden werden, damit Offline-, CSP- oder Firmenproxy-Probleme nicht wie App-Fehler aussehen.
- MDN hebt fuer WebGL-Best-Practice-Diagnostik weiterhin zwei fuer Tests relevante Regeln hervor: `flush()` nur in Nicht-RAF-/Wartepfaden gezielt verwenden und Kontexte nach echter Fertigstellung bewusst verlieren lassen statt auf implizite Freigabe zu hoffen.
- `WEBGL_debug_renderer_info` sollte wegen eingeschraenkter Verfuegbarkeit und Datenschutz-Fingerprinting-Risiken nur noch als Edge-Case-Diagnose dienen.
- Sleep-basierte Server-Warteketten sollten fuer Browser-QA umgerahmt werden: aktuelle Playwright-Versionen bieten bessere Readiness-Signale direkt im Test-Setup.

## Was weiter gueltig bleibt

- Das repo-lokale Testlab-Overlay bleibt der schnellste Einstieg.
- Der Sandbox-Server bleibt Pflicht fuer reproduzierbare repo-interne Laeufe.
- SpectorJS bleibt das beste freie Werkzeug fuer konkrete WebGL-Frame-Inspektion.
- Browser-Performance-Tools bleiben Pflicht bei Framedrops, Hitches, Main-Thread-Blockaden und unklarer GPU-/CPU-Verteilung.
- Firefox Profiler ist ein sinnvolles Zusatzwerkzeug geblieben, wenn ein Performanceproblem nicht sicher an Chrome oder Babylon allein haengt.
- ARIA-Snapshots bleiben der robusteste kostenlose Gegenpol zu fragilen Pixeltests, wenn Struktur wichtiger ist als exakte Renderausgabe.
- Video-/Screencast-Artefakte helfen beim Review komplexer 3D-Flows, bleiben aber ein Begleitnachweis.

## Zu deprecaten oder umzurahmen

- Desktop-Screenshots als primaerer Nachweis: deprecated.
- Reine Pixel-Checks ohne Stabilisierung oder Begleitartefakt: umrahmen als schwaches Signal.
- Reine Video-Receipts ohne Assertion, DOM-Report, Trace oder Profil: umrahmen als Review-Material, nicht als Regressionstest.
- Feste Sleep-Wartezeiten vor Sandbox- oder Browserstarts: deprecated, wenn ein Readiness-Signal verfuegbar ist.
- Renderer-/Vendor-Auslese als Standardtestpfad: deprecated, nur Edge-Case-Diagnose.
- Dauerhafte `getError()`-/`getParameter()`-Abfragen im Renderpfad: deprecated als allgemeine Testprobe, nur gezielt ausserhalb heisser Pfade einsetzen.
- Dauerhaft geoeffneter Babylon Inspector im Standardworkflow: umrahmen als ad-hoc Debugpfad statt Regressionstool.
- Implizite CDN-Nachladung des Babylon-Inspectors in Modulprojekten: umrahmen als Komfort-Fallback, nicht als verlassliche Standardmethode fuer reproduzierbare Repo-Diagnostik.
- `WEBGL_lose_context` als Dauer-Simulation in jedem Smoke-Test: deprecated; nur gezielt fuer Teardown-, Restore- oder Chaos-Proben einsetzen.

## Update-Regel fuer spaetere Automationen

- pruefen, ob der Sandbox-Server noch startet
- pruefen, ob die DOM-Probe noch einen verwertbaren Testlab-Report liefert
- Playwright/SpectorJS/Browser-Hinweise gegen offizielle Quellen gegenlesen
- nur neue Quellen aufnehmen, wenn sie die Testentscheidung oder den Ablauf real veraendern
- nur echte Aenderungen an Links, Verfahren oder Stolpersteinen dokumentieren
