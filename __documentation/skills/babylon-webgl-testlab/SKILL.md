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
4. Fuer headless Checks verwende den DOM-Probe-Script:
   `zsh __documentation/skills/babylon-webgl-testlab/scripts/run_crystal_katalog_dom_probe.sh`
5. Erst wenn Rendering-/Frame-Probleme unklar bleiben:
   - Babylon Inspector / Debug Layer
   - SpectorJS
   - Browser-Performance-Tools
6. Fuehre am Ende jedes Auftrags das Schlussprotokoll aus:
   `references/closeout-protocol.md`

## Was zuerst pruefen

- `window.onerror` / `unhandledrejection`
- `webglcontextlost`, `webglcontextrestored`, `webglcontextcreationerror`
- H1/H2/H3-Anzahlen und Sichtbarkeit im Testlab-Report
- Root- und Detail-View separat
- Kontextverlust und Restore nur gezielt simulieren, nicht dauernd

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
