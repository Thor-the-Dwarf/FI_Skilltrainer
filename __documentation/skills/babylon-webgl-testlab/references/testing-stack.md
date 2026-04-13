# Babylon/WebGL Test-Stack

## Kostenlose/Offizielle Bausteine

- Babylon.js Dokumentation als Engine- und Debug-Layer-Basis: <https://doc.babylonjs.com/>
- SpectorJS aus dem Babylon-Umfeld fuer WebGL-Frame-Inspektion und Capture-Export: <https://github.com/BabylonJS/Spector.js/>
- Playwright Visual Comparisons fuer Screenshot-Baselines, `stylePath` und Snapshot-Review: <https://playwright.dev/docs/test-snapshots>
- Playwright Screenshot-API fuer `animations`, `mask`, `maskColor` und Skalierungsoptionen: <https://playwright.dev/docs/api/class-page#page-screenshot>
- Playwright ARIA Snapshots fuer stabile Struktur-/Semantik-Regressionen: <https://playwright.dev/docs/aria-snapshots>
- Playwright Trace Viewer fuer reproduzierbare Fehlersuche mit DOM-, Netzwerk- und Konsolen-Kontext: <https://playwright.dev/docs/trace-viewer-intro>
- Chrome DevTools Performance Panel fuer CPU-/Thread-Analyse: <https://developer.chrome.com/docs/devtools/performance/overview>
- Chrome DevTools Performance Features Reference fuer Live Metrics, Screenshots, Throttling und Long-Task-Auswertung: <https://developer.chrome.com/docs/devtools/performance/reference>
- Chrome DevTools Rendering Tab fuer Paint-/Layout-/Layer-Overlays und Rendering-Statistiken: <https://developer.chrome.com/docs/devtools/rendering>
- Chrome DevTools Memory-Analyse fuer Heap-Snapshots, Detached DOM Trees und Allocation Timelines: <https://developer.chrome.com/docs/devtools/memory-problems>
- Chrome DevTools AI assistance for performance als optionale Auswertungsschicht auf vorhandenen Profiles: <https://developer.chrome.com/docs/devtools/ai-assistance/performance>
- Chrome 147 DevTools-Update zu AI assistance mit automatischer Kontextwahl und Trace-Start: <https://developer.chrome.com/blog/new-in-devtools-147?hl=en>
- MDN `webglcontextlost`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event>
- MDN `webglcontextrestored`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event>
- MDN `webglcontextcreationerror`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event>
- MDN `WebGLRenderingContext.isContextLost()`: <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/isContextLost>
- MDN `WebGLRenderingContext.getContextAttributes()`: <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getContextAttributes>
- MDN WebGL Best Practices fuer VRAM-Budget, Flush-/Stall-Regeln und Shader-Kompilierung: <https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices>
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
6. Bei unklarer Laufzeitqualitaet vor dem Voll-Trace zuerst Rendering Tab, Performance Monitor oder Live Metrics zur schnellen Einordnung nutzen.
7. Trace-Aufzeichnung fuer flaky oder schwer reproduzierbare Fehler standardmaessig mitdenken.
8. Wenn ein Problem visuell, GPU-nah oder im Tiefenpuffer steckt:
   - Babylon Inspector fuer interaktive Szenenpruefung
   - SpectorJS fuer Frame-Capture
   - Browser DevTools Performance/Rendering
   - Memory Panel bei Asset-Churn, Scene-Switches oder schleichender Degradation
   - optional DevTools AI assistance zur schnelleren Profil-Einordnung
9. Danach erst Code-Hypothesen festziehen.

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
- Playwrights Screenshot-API ist inzwischen relevant genug fuer den Testpfad selbst, weil `animations`, `mask` und `maskColor` volatile Bereiche sauberer stabilisieren als ad-hoc CSS allein.
- Kontext-Restore sollte nicht als simples "Event kam zurueck, also okay" bewertet werden. Nach offiziellem MDN-Hinweis sind alte WebGL-Ressourcen nach Restore ungueltig und muessen neu erstellt werden.
- MDN betont staerker als frueher, dass VRAM-Budgets, gezieltes Flush-Verhalten und das Vermeiden blockierender WebGL-Calls Teil der Stabilitaetsdiagnose sind, nicht nur Engine-Optimierung.
- Chrome DevTools deckt den schnellen Vorfilter inzwischen besser ab: Rendering-Overlays, Live Metrics, Performance Monitor und Memory-Workflows sollten vor tiefen Einzelwerkzeugen eingesetzt werden.
- Chrome DevTools hat inzwischen eine offizielle AI-Assistenz fuer Performance-Profile. Das ist nuetzlich fuer Triage, ersetzt aber keine Rohdaten und kein manuelles Profil-Review.
- Seit dem Chrome-147-Update vom 7. April 2026 kann DevTools AI assistance den Kontext haeufig selbst waehlen und bei offenen Performance-Fragen direkt einen Trace starten. Das beschleunigt Triage, aendert aber nicht die Belegpflicht.
- `WEBGL_debug_renderer_info` sollte wegen eingeschraenkter Verfuegbarkeit und Datenschutz-Fingerprinting-Risiken nur noch als Edge-Case-Diagnose dienen.

## Was weiter gueltig bleibt

- Das repo-lokale Testlab-Overlay bleibt der schnellste Einstieg.
- Der Sandbox-Server bleibt Pflicht fuer reproduzierbare repo-interne Laeufe.
- SpectorJS bleibt das beste freie Werkzeug fuer konkrete WebGL-Frame-Inspektion.
- Browser-Performance-Tools bleiben Pflicht bei Framedrops, Hitches, Main-Thread-Blockaden und unklarer GPU-/CPU-Verteilung.
- ARIA-Snapshots bleiben der robusteste kostenlose Gegenpol zu fragilen Pixeltests, wenn Struktur wichtiger ist als exakte Renderausgabe.

## Zu deprecaten oder umzurahmen

- Desktop-Screenshots als primaerer Nachweis: deprecated.
- Reine Pixel-Checks ohne Stabilisierung oder Begleitartefakt: umrahmen als schwaches Signal.
- Renderer-/Vendor-Auslese als Standardtestpfad: deprecated, nur Edge-Case-Diagnose.
- Dauerhafte `getError()`-/`getParameter()`-Abfragen im Renderpfad: deprecated als allgemeine Testprobe, nur gezielt ausserhalb heisser Pfade einsetzen.
- Dauerhaft geoeffneter Babylon Inspector im Standardworkflow: umrahmen als ad-hoc Debugpfad statt Regressionstool.

## Update-Regel fuer spaetere Automationen

- pruefen, ob der Sandbox-Server noch startet
- pruefen, ob die DOM-Probe noch einen verwertbaren Testlab-Report liefert
- Playwright/SpectorJS/Browser-Hinweise gegen offizielle Quellen gegenlesen
- nur neue Quellen aufnehmen, wenn sie die Testentscheidung oder den Ablauf real veraendern
- nur echte Aenderungen an Links, Verfahren oder Stolpersteinen dokumentieren
