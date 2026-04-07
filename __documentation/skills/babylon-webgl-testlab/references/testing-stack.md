# Babylon/WebGL Test-Stack

## Kostenlose/Offizielle Bausteine

- Babylon.js Dokumentation: <https://doc.babylonjs.com/>
- SpectorJS vom Babylon-Umfeld fuer WebGL-Frame-Inspektion: <https://spector.babylonjs.com/>
- Playwright UI Mode fuer wiederholbare Browserlaeufe, Attachments und Screenshot-Diffs: <https://playwright.dev/docs/test-ui-mode>
- MDN `WEBGL_lose_context.restoreContext()` fuer kontrollierte Restore-Tests: <https://developer.mozilla.org/de/docs/Web/API/WEBGL_lose_context/restoreContext>

## Repo-spezifische Teststrategie

1. `crystal_katalog` immer ueber den Workspace-Sandbox-Server starten.
2. Mit `?testlab=1` das eingebaute Diagnose-Overlay aktivieren.
3. Fuer reproduzierbare Checks zuerst DOM-Report statt Desktop-Screenshot nutzen.
4. Wenn ein Problem visuell oder im Tiefenpuffer steckt:
   - SpectorJS
   - Browser DevTools Performance/Rendering
   - danach erst Code-Hypothesen

## Mindestanforderungen fuer einen stabilen Testlauf

- keine Browser-Desktop-Screenshots auf die Arbeitsflaeche
- Fehler muessen im Overlay oder Report auftauchen
- Auswahl und Viewstate per Query-Parameter reproduzierbar sein
- Form-4-Faelle immer mindestens in Root-View testbar

## Update-Regel fuer spaetere Automationen

- pruefen, ob der Sandbox-Server noch startet
- pruefen, ob die DOM-Probe noch einen verwertbaren Testlab-Report liefert
- Playwright/SpectorJS/Browser-Hinweise gegen offizielle Quellen gegenlesen
- nur echte Aenderungen an Links, Verfahren oder Stolpersteinen dokumentieren

