(function initPresentationStudioUi(global) {
  "use strict";

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function clamp(value, min, max) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
    return Math.min(max, Math.max(min, safeValue));
  }

  function formatDurationLabel(ms) {
    const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function createUi(options = {}) {
    const compactPanel = options.compactPanel === true;
    const callbacks = {
      onToggleStudioPanel: typeof options.onToggleStudioPanel === "function" ? options.onToggleStudioPanel : () => {
      },
      onStartPlayer: typeof options.onStartPlayer === "function" ? options.onStartPlayer : () => {
      },
      onCreateScene: typeof options.onCreateScene === "function" ? options.onCreateScene : () => {
      },
      onRenameDraftScene: typeof options.onRenameDraftScene === "function" ? options.onRenameDraftScene : () => {
      },
      onStartRecording: typeof options.onStartRecording === "function" ? options.onStartRecording : () => {
      },
      onStopRecording: typeof options.onStopRecording === "function" ? options.onStopRecording : () => {
      },
      onSaveDraftScene: typeof options.onSaveDraftScene === "function" ? options.onSaveDraftScene : () => {
      },
      onDiscardDraftScene: typeof options.onDiscardDraftScene === "function" ? options.onDiscardDraftScene : () => {
      },
      onPlaySavedScene: typeof options.onPlaySavedScene === "function" ? options.onPlaySavedScene : () => {
      },
      onPlayAllScenes: typeof options.onPlayAllScenes === "function" ? options.onPlayAllScenes : () => {
      },
      onStopSceneSequence: typeof options.onStopSceneSequence === "function" ? options.onStopSceneSequence : () => {
      },
      onEditSavedScene: typeof options.onEditSavedScene === "function" ? options.onEditSavedScene : () => {
      },
      onDeleteSavedScene: typeof options.onDeleteSavedScene === "function" ? options.onDeleteSavedScene : () => {
      },
      onSavePresentationToLibrary: typeof options.onSavePresentationToLibrary === "function" ? options.onSavePresentationToLibrary : () => {
      },
      onCreatePresentation: typeof options.onCreatePresentation === "function" ? options.onCreatePresentation : () => {
      },
      onLoadPresentation: typeof options.onLoadPresentation === "function" ? options.onLoadPresentation : () => {
      },
      onDeletePresentation: typeof options.onDeletePresentation === "function" ? options.onDeletePresentation : () => {
      },
      onSelectProjectFolder: typeof options.onSelectProjectFolder === "function" ? options.onSelectProjectFolder : () => {
      },
      onProjectFolderChange: typeof options.onProjectFolderChange === "function" ? options.onProjectFolderChange : () => {
      }
    };

    const root = createNode("section", "presenter-studio-shell");
    root.dataset.variant = compactPanel ? "compact" : "default";
    const launcherRow = createNode("div", "presenter-studio-launcher");
    const modeRail = createNode("div", "presenter-studio-mode-rail");
    const playerModePill = createNode("span", "presenter-meta-pill presenter-studio-mode-pill", "Player");
    const editorModePill = createNode("span", "presenter-meta-pill presenter-studio-mode-pill", "Erstellungsmodus");
    modeRail.append(playerModePill, editorModePill);
    const toggleButton = createNode("button", "btn-secondary presenter-studio-toggle", "Presentationsmodus");
    toggleButton.type = "button";
    const launcherHint = createNode("span", "presenter-meta-pill presenter-studio-hint", "Player aktiv · Studio geschlossen");
    const newSceneButton = createNode("button", "btn-primary presenter-studio-newscene", "Neue Scene");
    newSceneButton.type = "button";
    launcherRow.append(modeRail, toggleButton, launcherHint, newSceneButton);

    const body = createNode("div", "presenter-studio-body");
    const bodyIntro = createNode("div", "presenter-studio-intro");
    const bodyIntroTitle = createNode("strong", "presenter-studio-intro-title", "Recorder Shell");
    const bodyIntroCopy = createNode("span", "presenter-studio-intro-copy", "Lege eine Scene an und zeichne die Kamera in mehreren Segmenten auf.");
    bodyIntro.append(bodyIntroTitle, bodyIntroCopy);
    const summaryPanel = createNode("div", "presenter-studio-summary");
    const summaryHeading = createNode("div", "presenter-studio-summary-heading");
    const summaryKicker = createNode("span", "presenter-studio-summary-kicker", "Aktive ScenePresentation");
    const summaryTitle = createNode("strong", "presenter-studio-summary-title", "Unbenannte ScenePresentation");
    summaryHeading.append(summaryKicker, summaryTitle);
    const summaryMeta = createNode("div", "presenter-studio-summary-meta");
    const summaryScenes = createNode("span", "presenter-meta-pill presenter-studio-summary-pill", "0 scenes[]");
    const summarySpans = createNode("span", "presenter-meta-pill presenter-studio-summary-pill is-soft", "0 cameraSpans[]");
    const summaryDraft = createNode("span", "presenter-meta-pill presenter-studio-summary-pill is-soft", "Kein draftScene");
    const summaryStartMode = createNode("span", "presenter-meta-pill presenter-studio-summary-pill is-soft", "Start: manuell");
    summaryMeta.append(summaryScenes, summarySpans, summaryDraft, summaryStartMode);
    const summaryFlow = createNode("span", "presenter-studio-summary-flow", "draftScene -> cameraSpans[] -> Speichern -> presentation.scenes[]");
    summaryPanel.append(summaryHeading, summaryMeta, summaryFlow);
    const statePanel = createNode("div", "presenter-studio-state-panel");
    const stateBadge = createNode("span", "presenter-meta-pill presenter-studio-state-badge", "Leer");
    const stateTitle = createNode("strong", "presenter-studio-state-title", "Leere ScenePresentation");
    const stateCopy = createNode("span", "presenter-studio-state-copy", "Erzeuge die erste Scene, um die Presentation von einem leeren Zustand in eine echte scenes[]-Liste zu ueberfuehren.");
    statePanel.append(stateBadge, stateTitle, stateCopy);
    const startPanel = createNode("div", "presenter-studio-start-panel");
    const startPanelBadge = createNode("span", "presenter-meta-pill presenter-studio-start-badge", "Kein AutoPlay");
    const startPanelTitle = createNode("strong", "presenter-studio-start-title", "Bewusst starten");
    const startPanelCopy = createNode("span", "presenter-studio-start-copy", "Starte den Player bewusst oder springe direkt in den Erstellungsmodus.");
    const startPanelActions = createNode("div", "presenter-studio-start-actions");
    const startPlayerButton = createNode("button", "btn-primary presenter-studio-start-action", "Player starten");
    startPlayerButton.type = "button";
    const startDraftButton = createNode("button", "btn-secondary presenter-studio-start-action", "Erste Scene aufnehmen");
    startDraftButton.type = "button";
    startPanelActions.append(startPlayerButton, startDraftButton);
    startPanel.append(startPanelBadge, startPanelTitle, startPanelCopy, startPanelActions);
    const smokePanel = createNode("div", "presenter-studio-smoke-panel");
    const smokeTitle = createNode("strong", "presenter-studio-smoke-title", "Smoke-Check");
    const smokeGuide = createNode("span", "presenter-studio-smoke-guide", "Pruefpfad: Player starten -> Neue Scene -> Draft -> Speichern -> Scene-Library");
    const smokeGrid = createNode("div", "presenter-studio-smoke-grid");
    const smokePlayer = createNode("span", "presenter-meta-pill presenter-studio-smoke-pill", "Player: laedt");
    const smokeDraft = createNode("span", "presenter-meta-pill presenter-studio-smoke-pill", "Draft: keiner");
    const smokeSave = createNode("span", "presenter-meta-pill presenter-studio-smoke-pill", "Speichern: ausstehend");
    const smokeLibrary = createNode("span", "presenter-meta-pill presenter-studio-smoke-pill", "Library: leer");
    smokeGrid.append(smokePlayer, smokeDraft, smokeSave, smokeLibrary);
    smokePanel.append(smokeTitle, smokeGuide, smokeGrid);
    const handoffPanel = createNode("div", "presenter-studio-handoff");
    const handoffTitle = createNode("strong", "presenter-studio-handoff-title", "Recorder-Flow");
    const handoffGrid = createNode("div", "presenter-studio-handoff-grid");
    const handoffCurrent = createNode("span", "presenter-meta-pill presenter-studio-handoff-pill", "Aktiver Schritt: wartet");
    const handoffNext = createNode("span", "presenter-meta-pill presenter-studio-handoff-pill", "Naechster Klick: Player starten");
    const handoffTarget = createNode("span", "presenter-meta-pill presenter-studio-handoff-pill", "Ziel: Scene-Library fuellen");
    handoffGrid.append(handoffCurrent, handoffNext, handoffTarget);
    handoffPanel.append(handoffTitle, handoffGrid);
    const flowRail = createNode("div", "presenter-studio-flow-rail");
    const flowSteps = [
      { key: "newscene", number: "1", label: "Neue Scene", hint: "Draft starten" },
      { key: "draft", number: "2", label: "Draft", hint: "cameraSpans[] aufbauen" },
      { key: "save", number: "3", label: "Speichern", hint: "In scenes[] uebernehmen" },
      { key: "library", number: "4", label: "Scene-Library", hint: "presentation.scenes[]" }
    ].map((config) => {
      const step = createNode("article", "presenter-studio-flow-step");
      const badge = createNode("span", "presenter-studio-flow-step-badge", config.number);
      const label = createNode("strong", "presenter-studio-flow-step-label", config.label);
      const hint = createNode("span", "presenter-studio-flow-step-hint", config.hint);
      step.append(badge, label, hint);
      flowRail.appendChild(step);
      return { ...config, step, hint };
    });
    const header = createNode("div", "presenter-studio-header");
    const titleWrap = createNode("div", "presenter-studio-titlewrap");
    const title = createNode("strong", "presenter-studio-title", "Scene Recorder");
    const draftMeta = createNode("span", "presenter-studio-meta", "Noch keine Scene aktiv");
    titleWrap.append(title, draftMeta);
    const nameInput = createNode("input", "presenter-studio-name");
    nameInput.type = "text";
    nameInput.placeholder = "Scene benennen";
    nameInput.setAttribute("aria-label", "Scene-Name");
    const headerActions = createNode("div", "presenter-studio-header-actions");
    const compactNewSceneButton = createNode("button", "btn-primary presenter-studio-header-action", "Neue Scene");
    compactNewSceneButton.type = "button";
    const compactCloseButton = createNode("button", "btn-secondary presenter-studio-header-action", "Control Panel schliessen");
    compactCloseButton.type = "button";
    headerActions.append(compactNewSceneButton, compactCloseButton);
    header.append(titleWrap, nameInput, headerActions);

    const actionRow = createNode("div", "presenter-studio-actions");
    const recordButton = createNode("button", "btn-primary presenter-studio-action", "Play");
    recordButton.type = "button";
    const stopButton = createNode("button", "btn-secondary presenter-studio-action", "Stop");
    stopButton.type = "button";
    const saveButton = createNode("button", "btn-secondary presenter-studio-action", "Speichern");
    saveButton.type = "button";
    const discardButton = createNode("button", "btn-secondary presenter-studio-action", "Verwerfen");
    discardButton.type = "button";
    const statusBadge = createNode("span", "presenter-status-badge presenter-studio-status", "Bereit");
    statusBadge.dataset.tone = "ready";
    actionRow.append(recordButton, stopButton, saveButton, discardButton, statusBadge);
    const actionGuide = createNode("span", "presenter-studio-action-guide", "Neue Scene erzeugt den Draft. Danach Aufnahme starten, Segment beenden und Speichern.");

    const trackViewport = createNode("div", "presenter-studio-track-viewport");
    const trackCanvas = createNode("div", "presenter-studio-track-canvas");
    const trackFill = createNode("div", "presenter-studio-track-fill");
    const playhead = createNode("span", "presenter-studio-playhead");
    const markerLayer = createNode("div", "presenter-studio-marker-layer");
    const trackPlaceholder = createNode("span", "presenter-studio-track-placeholder", "Noch kein draftScene aktiv");
    trackCanvas.append(trackFill, markerLayer, playhead, trackPlaceholder);
    trackViewport.appendChild(trackCanvas);

    const projects = createNode("div", "presenter-studio-projects");
    const projectsHeader = createNode("div", "presenter-studio-projects-header");
    const projectsTitle = createNode("strong", "presenter-studio-projects-title", "Projektverwaltung");
    const projectsActions = createNode("div", "presenter-studio-projects-actions");
    const projectNewButton = createNode("button", "btn-secondary presenter-studio-projects-action", "Neue Presentation");
    projectNewButton.type = "button";
    const projectSaveButton = createNode("button", "btn-primary presenter-studio-projects-action", "In Projekt speichern");
    projectSaveButton.type = "button";
    projectsActions.append(projectNewButton, projectSaveButton);
    projectsHeader.append(projectsTitle, projectsActions);
    const projectsMeta = createNode("span", "presenter-studio-projects-meta", "Noch keine lokalen Presentations gespeichert.");
    const projectsFolderRow = createNode("div", "presenter-studio-projects-folder-row");
    const projectsFolderLabel = createNode("span", "presenter-studio-projects-folder-label", "Zielordner");
    const projectsFolderInput = createNode("input", "presenter-studio-projects-folder-input");
    projectsFolderInput.type = "text";
    projectsFolderInput.placeholder = "Presentations";
    projectsFolderInput.setAttribute("aria-label", "Zielordner fuer lokale ScenePresentations");
    projectsFolderRow.append(projectsFolderLabel, projectsFolderInput);
    const projectsTree = createNode("div", "presenter-studio-projects-tree");
    projects.append(projectsHeader, projectsMeta, projectsFolderRow, projectsTree);

    const library = createNode("div", "presenter-studio-library");
    const libraryHeader = createNode("div", "presenter-studio-library-header");
    const libraryTitle = createNode("strong", "presenter-studio-library-title", "Gespeicherte Scenes");
    const libraryPlayAll = createNode("button", "btn-secondary presenter-studio-library-playall", "Alle abspielen");
    libraryPlayAll.type = "button";
    libraryHeader.append(libraryTitle, libraryPlayAll);
    const libraryMeta = createNode("span", "presenter-studio-library-meta", "Noch keine gespeicherten Scenes");
    const libraryList = createNode("div", "presenter-studio-library-list");
    library.append(libraryHeader, libraryMeta, libraryList);

    body.append(bodyIntro, summaryPanel, statePanel, startPanel, smokePanel, handoffPanel, flowRail, header, actionRow, actionGuide, trackViewport, projects, library);
    root.append(launcherRow, body);

    toggleButton.addEventListener("click", () => {
      callbacks.onToggleStudioPanel();
    });
    startPlayerButton.addEventListener("click", () => {
      callbacks.onStartPlayer();
    });
    startDraftButton.addEventListener("click", () => {
      callbacks.onCreateScene();
    });
    newSceneButton.addEventListener("click", () => {
      callbacks.onCreateScene();
    });
    compactNewSceneButton.addEventListener("click", () => {
      callbacks.onCreateScene();
    });
    compactCloseButton.addEventListener("click", () => {
      callbacks.onToggleStudioPanel();
    });
    nameInput.addEventListener("input", () => {
      callbacks.onRenameDraftScene(nameInput.value);
    });
    recordButton.addEventListener("click", () => {
      callbacks.onStartRecording();
    });
    stopButton.addEventListener("click", () => {
      callbacks.onStopRecording();
    });
    saveButton.addEventListener("click", () => {
      callbacks.onSaveDraftScene();
    });
    discardButton.addEventListener("click", () => {
      callbacks.onDiscardDraftScene();
    });
    libraryPlayAll.addEventListener("click", () => {
      if (libraryPlayAll.dataset.mode === "stop") {
        callbacks.onStopSceneSequence();
        return;
      }
      callbacks.onPlayAllScenes();
    });
    projectNewButton.addEventListener("click", () => {
      callbacks.onCreatePresentation();
    });
    projectSaveButton.addEventListener("click", () => {
      callbacks.onSavePresentationToLibrary();
    });
    projectsFolderInput.addEventListener("input", () => {
      callbacks.onProjectFolderChange(projectsFolderInput.value);
    });

    return Object.freeze({
      root,
      render(model = {}) {
        const studioOpen = compactPanel
          ? Boolean(model.studioPanelOpen || model.draftScene || model.isRecording)
          : Boolean(
            model.studioPanelOpen ||
            model.draftScene ||
            (Array.isArray(model.scenes) && model.scenes.length)
          );
        const draftScene = model.draftScene || null;
        const scenes = Array.isArray(model.scenes) ? model.scenes : [];
        const isRecording = Boolean(model.isRecording);
        const playingSceneId = String(model.playingSceneId || "");
        const runtimeReady = Boolean(model.runtimeReady);
        const autoPlayEnabled = model.autoPlayEnabled !== false;
        const playerStatus = String(model.playerStatus || "loading").trim().toLowerCase();
        const playerActionLabel = String(model.playerActionLabel || "Player starten").trim() || "Player starten";
        const playerCanStart = Boolean(model.playerCanStart);
        const presentationLibrary = model.presentationLibrary && typeof model.presentationLibrary === "object"
          ? model.presentationLibrary
          : { total: 0, folders: [] };
        const projectFolderPath = String(model.projectFolderPath || "").trim() || "Presentations";
        const recorderState = model.recorderState && typeof model.recorderState === "object" ? model.recorderState : {};
        const editorStatus = String(recorderState.editorStatus || "idle").trim().toLowerCase();
        const recorderActiveSceneId = String(recorderState.activeSceneId || "").trim();
        const presentationId = String(model.presentationId || "").trim();
        const isSequencePlaying = Boolean(model.isSequencePlaying);
        const presentationTitle = String(model.presentationTitle || "Unbenannte ScenePresentation").trim() || "Unbenannte ScenePresentation";
        const visualMode = (draftScene || isRecording) ? "editor" : "player";
        const presentationState = draftScene ? "drafting" : (scenes.length ? "filled" : "empty");
        const hasDraftSpans = Boolean(draftScene && Array.isArray(draftScene.cameraSpans) && draftScene.cameraSpans.length);
        const totalSpans = scenes.reduce(
          (sum, scene) => sum + (Array.isArray(scene?.cameraSpans) ? scene.cameraSpans.length : 0),
          0
        );
        const savedSceneLabel = editorStatus === "saved"
          ? scenes.find((scene) => scene.sceneId === recorderActiveSceneId)?.name || recorderActiveSceneId || "Scene"
          : "";
        const showStartPanel = studioOpen &&
          !draftScene &&
          !isRecording &&
          !playingSceneId &&
          !autoPlayEnabled &&
          (playerStatus === "ready" || playerStatus === "paused" || playerStatus === "completed");
        root.dataset.open = studioOpen ? "true" : "false";
        root.dataset.mode = visualMode;
        root.dataset.presentationState = presentationState;
        root.hidden = compactPanel ? !studioOpen : false;
        if (compactPanel) {
          root.style.display = studioOpen ? "grid" : "none";
        } else {
          root.style.removeProperty("display");
        }
        body.dataset.presentationState = presentationState;
        summaryPanel.dataset.presentationState = presentationState;
        statePanel.dataset.presentationState = presentationState;
        trackCanvas.dataset.presentationState = presentationState;
        library.dataset.presentationState = presentationState;
        body.hidden = !studioOpen;
        launcherRow.hidden = compactPanel;
        summaryPanel.hidden = compactPanel;
        statePanel.hidden = compactPanel;
        smokePanel.hidden = compactPanel;
        handoffPanel.hidden = compactPanel;
        flowRail.hidden = compactPanel;
        toggleButton.textContent = studioOpen ? "Presentationsmodus offen" : "Presentationsmodus";
        const playerModeHint = scenes.length
          ? (autoPlayEnabled ? "Player aktiv · Scene-Library bereit" : "Player bereit · Scene-Library bereit")
          : (autoPlayEnabled ? "Player aktiv · bereit fuer Neue Scene" : "Player bereit · manueller Start");
        launcherHint.textContent = !studioOpen
          ? (autoPlayEnabled ? "Player aktiv · AutoPlay bereit" : "Player bereit · Studio geschlossen")
          : (visualMode === "editor"
            ? (isRecording ? "Erstellungsmodus · Aufnahme laeuft" : "Erstellungsmodus · Draft in Arbeit")
            : playerModeHint);
        playerModePill.dataset.active = visualMode === "player" ? "true" : "false";
        editorModePill.dataset.active = visualMode === "editor" ? "true" : "false";
        const liveDurationMs = clamp(model.liveDurationMs || draftScene?.durationMs || 0, 0, Number.MAX_SAFE_INTEGER);
        summaryTitle.textContent = presentationTitle;
        summaryScenes.textContent = `${scenes.length} scenes[]`;
        summarySpans.textContent = `${totalSpans} cameraSpans[]`;
        summaryDraft.textContent = draftScene
          ? `draftScene aktiv: ${draftScene.name || "Scene"}`
          : "Kein draftScene";
        summaryStartMode.textContent = autoPlayEnabled ? "Start: AutoPlay" : "Start: manuell";
        startPanel.hidden = compactPanel ? true : !showStartPanel;
        startPlayerButton.disabled = !playerCanStart;
        startDraftButton.disabled = !runtimeReady || Boolean(draftScene) || isRecording;
        startPlayerButton.textContent = playerActionLabel;
        startDraftButton.textContent = scenes.length ? "Weitere Scene aufnehmen" : "Erste Scene aufnehmen";
        startPanelBadge.textContent = autoPlayEnabled ? "AutoPlay aktiv" : "Kein AutoPlay";
        startPanelTitle.textContent = scenes.length ? "Player oder ScenePresentation erweitern" : "Player oder erste Scene starten";
        startPanelCopy.textContent = scenes.length
          ? "Starte den Player bewusst oder erweitere die bestehende ScenePresentation direkt ueber einen neuen Draft."
          : "Du faellst nicht mehr in Auto-Playback. Waehle bewusst zwischen Player und Erstellungsmodus.";
        smokePlayer.textContent = `Player: ${
          playerStatus === "playing"
            ? "laeuft"
            : playerStatus === "paused"
              ? "pausiert"
              : playerStatus === "completed"
                ? "beendet"
                : playerCanStart
                  ? "startbereit"
                  : "laedt"
        }`;
        smokeDraft.textContent = draftScene
          ? `Draft: ${draftScene.cameraSpans.length} cameraSpan${draftScene.cameraSpans.length === 1 ? "" : "s"}[]`
          : "Draft: keiner";
        smokeSave.textContent = editorStatus === "saved"
          ? `Speichern: ok${savedSceneLabel ? ` (${savedSceneLabel})` : ""}`
          : (draftScene && hasDraftSpans && !isRecording ? "Speichern: bereit" : "Speichern: ausstehend");
        smokeLibrary.textContent = `Library: ${scenes.length ? `${scenes.length} Scene${scenes.length === 1 ? "" : "s"}` : "leer"}`;
        smokePlayer.dataset.state = playerStatus === "playing"
          ? "live"
          : (playerCanStart ? "ready" : "pending");
        smokeDraft.dataset.state = draftScene
          ? (isRecording ? "live" : "ready")
          : "pending";
        smokeSave.dataset.state = editorStatus === "saved"
          ? "complete"
          : (draftScene && hasDraftSpans && !isRecording ? "ready" : "pending");
        smokeLibrary.dataset.state = scenes.length
          ? (editorStatus === "saved" ? "complete" : "ready")
          : "pending";

        let handoffCurrentLabel = "Aktiver Schritt: wartet";
        let handoffNextLabel = "Naechster Klick: Player starten";
        let handoffTargetLabel = "Ziel: Scene-Library fuellen";
        let handoffState = "pending";
        if (editorStatus === "saved") {
          handoffCurrentLabel = `Aktiver Schritt: gespeichert${savedSceneLabel ? ` (${savedSceneLabel})` : ""}`;
          handoffNextLabel = "Naechster Klick: Library pruefen oder Scene abspielen";
          handoffTargetLabel = "Ziel: Neuer Eintrag in presentation.scenes[] sichtbar";
          handoffState = "complete";
        } else if (isRecording) {
          handoffCurrentLabel = "Aktiver Schritt: Segmentaufnahme laeuft";
          handoffNextLabel = "Naechster Klick: Segment beenden";
          handoffTargetLabel = "Ziel: cameraSpan[] sauber in den Draft schreiben";
          handoffState = "live";
        } else if (draftScene && hasDraftSpans) {
          handoffCurrentLabel = `Aktiver Schritt: Draft bereit (${draftScene.cameraSpans.length} cameraSpans[])`;
          handoffNextLabel = "Naechster Klick: Scene speichern oder weiteres Segment";
          handoffTargetLabel = "Ziel: Draft nach presentation.scenes[] uebergeben";
          handoffState = "ready";
        } else if (draftScene) {
          handoffCurrentLabel = "Aktiver Schritt: Draft angelegt";
          handoffNextLabel = "Naechster Klick: Aufnahme starten";
          handoffTargetLabel = "Ziel: Ersten cameraSpan[] erzeugen";
          handoffState = "ready";
        } else if (scenes.length) {
          handoffCurrentLabel = `Aktiver Schritt: Scene-Library bereit (${scenes.length} Scene${scenes.length === 1 ? "" : "s"})`;
          handoffNextLabel = playerCanStart ? "Naechster Klick: Player starten oder Scene bearbeiten" : "Naechster Klick: Scene in der Library pruefen";
          handoffTargetLabel = "Ziel: Player und Erstellungsmodus sauber getrennt halten";
          handoffState = "complete";
        } else if (playerCanStart) {
          handoffCurrentLabel = "Aktiver Schritt: Player startbereit";
          handoffNextLabel = "Naechster Klick: Player starten oder Erste Scene";
          handoffTargetLabel = "Ziel: Erste ScenePresentation aufbauen";
          handoffState = "ready";
        }
        handoffCurrent.textContent = handoffCurrentLabel;
        handoffNext.textContent = handoffNextLabel;
        handoffTarget.textContent = handoffTargetLabel;
        handoffCurrent.dataset.state = handoffState;
        handoffNext.dataset.state = handoffState === "live" ? "live" : (handoffState === "complete" ? "complete" : "ready");
        handoffTarget.dataset.state = handoffState === "complete" ? "complete" : "ready";

        const activeFlowKey = isRecording
          ? "draft"
          : draftScene
            ? (hasDraftSpans ? "save" : "draft")
            : ((editorStatus === "saved" || scenes.length) ? "library" : "newscene");
        const compactLibraryOnly = compactPanel && !draftScene && !isRecording;
        root.dataset.activeFlowStep = activeFlowKey;
        root.dataset.playerState = smokePlayer.dataset.state || "pending";
        root.dataset.draftState = smokeDraft.dataset.state || "pending";
        root.dataset.saveState = smokeSave.dataset.state || "pending";
        root.dataset.libraryState = smokeLibrary.dataset.state || "pending";
        compactNewSceneButton.disabled = !runtimeReady || isRecording || Boolean(draftScene);
        compactNewSceneButton.textContent = draftScene
          ? "Draft aktiv"
          : (scenes.length ? "Neue Scene" : "Erste Scene");
        compactCloseButton.disabled = Boolean(draftScene) || isRecording;
        compactCloseButton.textContent = draftScene || isRecording
          ? "Recorder aktiv"
          : "Schliessen";
        headerActions.hidden = !compactPanel;
        bodyIntro.hidden = compactPanel
          ? (!draftScene && !scenes.length && !playerCanStart) || compactLibraryOnly
          : false;
        bodyIntroCopy.hidden = compactPanel && !draftScene && scenes.length > 0;
        actionGuide.hidden = compactPanel;
        actionRow.hidden = compactPanel && !draftScene;
        trackViewport.hidden = compactPanel && !draftScene;
        libraryMeta.hidden = compactPanel;
        root.dataset.compactState = compactLibraryOnly
          ? "library"
          : (compactPanel && draftScene ? "draft" : (compactPanel ? "start" : "default"));

        flowSteps.forEach((flowStep) => {
          let stepState = "pending";
          let stepHint = flowStep.hint;
          if (flowStep.key === "newscene") {
            stepState = (draftScene || scenes.length) ? "complete" : (activeFlowKey === "newscene" ? "active" : "pending");
            stepHint = draftScene ? "Draft erzeugt" : (scenes.length ? "Weitere Scene moeglich" : "Startpunkt");
          } else if (flowStep.key === "draft") {
            stepState = isRecording ? "live" : (draftScene ? "active" : (hasDraftSpans || editorStatus === "saved" || scenes.length ? "complete" : "pending"));
            stepHint = isRecording
              ? "Aufnahme schreibt cameraSpans[]"
              : (draftScene ? `${draftScene.cameraSpans.length} Segment${draftScene.cameraSpans.length === 1 ? "" : "e"} im Draft` : "Noch kein Draft");
          } else if (flowStep.key === "save") {
            stepState = editorStatus === "saved"
              ? "complete"
              : (draftScene && hasDraftSpans && !isRecording ? "active" : (scenes.length && !draftScene ? "complete" : "pending"));
            stepHint = editorStatus === "saved"
              ? "Zuletzt gespeichert"
              : (draftScene && hasDraftSpans ? "Bereit fuer Speichern" : "Wartet auf Draft");
          } else if (flowStep.key === "library") {
            stepState = scenes.length
              ? ((editorStatus === "saved" || activeFlowKey === "library") ? "active" : "complete")
              : "pending";
            stepHint = scenes.length
              ? `${scenes.length} Scene${scenes.length === 1 ? "" : "s"} in presentation.scenes[]`
              : "Noch leer";
          }
          flowStep.step.dataset.state = stepState;
          flowStep.hint.textContent = stepHint;
        });

        newSceneButton.disabled = !runtimeReady || isRecording || Boolean(draftScene);
        newSceneButton.textContent = draftScene
          ? "Draft aktiv"
          : (scenes.length ? "Weitere Scene" : "Erste Scene");

        if (!draftScene) {
          stateBadge.textContent = scenes.length ? "Gefuellt" : "Leer";
          stateTitle.textContent = scenes.length ? "Befuellte ScenePresentation" : "Leere ScenePresentation";
          stateCopy.textContent = scenes.length
            ? "Es existieren bereits gespeicherte scenes[]. Du kannst sie abspielen, bearbeiten oder um weitere Scenes erweitern."
            : "Es gibt noch keine gespeicherte Scene. Starte mit Neue Scene, um den ersten Draft und damit den ersten Eintrag in presentation.scenes[] aufzubauen.";
          bodyIntroTitle.textContent = "Player-Modus";
          bodyIntroCopy.textContent = studioOpen
            ? (autoPlayEnabled
              ? "Der Hauptplayer bleibt sichtbar. AutoPlay ist verfuegbar, aber Neue Scene fuehrt direkt in den Recorder-Flow dieser ScenePresentation."
              : "Der Hauptplayer startet bewusst manuell. Neue Scene erzeugt einen Draft, den du anschliessend als Teil dieser ScenePresentation speicherst.")
            : "Studio geschlossen. Oeffne den Presentationsmodus, um eigene Scenes aufzubauen.";
          if (compactPanel) {
            bodyIntroTitle.textContent = scenes.length ? "Scene Library" : "Erste Scene";
            bodyIntroCopy.textContent = scenes.length
              ? "Gespeicherte Scenes spielen, bearbeiten oder neue Aufnahme starten."
              : "Neue Scene startet den ersten Draft fuer diese Presentation.";
          }
          title.textContent = compactPanel
            ? (scenes.length ? "Scene Library" : "Neue Scene")
            : "Scene Recorder";
          nameInput.value = "";
          nameInput.disabled = true;
          nameInput.hidden = compactPanel;
          recordButton.textContent = "Aufnahme starten";
          stopButton.textContent = "Segment beenden";
          saveButton.textContent = "Speichern";
          discardButton.textContent = "Verwerfen";
          recordButton.disabled = true;
          stopButton.disabled = true;
          saveButton.disabled = true;
          discardButton.disabled = true;
          actionGuide.textContent = scenes.length
            ? "Waehle eine vorhandene Scene zum Bearbeiten oder lege mit Weitere Scene einen neuen Draft an."
            : "Starte mit Erste Scene. Danach kannst du im Draft die erste Aufnahme beginnen.";
          draftMeta.textContent = compactPanel
            ? (scenes.length
              ? `${scenes.length} Scene${scenes.length === 1 ? "" : "s"} gespeichert`
              : "Start mit Neue Scene")
            : (studioOpen
              ? "Lege eine neue Scene an, um cameraSpans[] fuer die ScenePresentation aufzuzeichnen."
              : "Noch keine Scene aktiv");
          if (compactPanel && !studioOpen) {
            draftMeta.textContent = "Control Panel geschlossen";
          }
          statusBadge.textContent = studioOpen
            ? (autoPlayEnabled ? "Player bereit oder neue Scene starten" : "Player bereit fuer Studio-Flow")
            : "Bereit";
          statusBadge.dataset.tone = "ready";
          markerLayer.innerHTML = "";
          trackFill.style.width = "0px";
          playhead.style.left = "0";
          trackPlaceholder.hidden = false;
          trackPlaceholder.textContent = scenes.length
            ? "Keine draftScene aktiv. Waehle Bearbeiten oder Neue Scene."
            : "Leere ScenePresentation. Neue Scene startet den ersten Draft.";
        } else {
          stateBadge.textContent = scenes.length ? "Draft + Library" : "Erster Draft";
          stateTitle.textContent = scenes.length ? "Draft innerhalb einer befuellten ScenePresentation" : "Erste Scene im Aufbau";
          stateCopy.textContent = isRecording
            ? "Die aktuelle Kamerabewegung schreibt direkt in draftScene.cameraSpans[]."
            : "Dieser Draft ist noch nicht Teil von presentation.scenes[]. Erst Speichern ueberfuehrt ihn in die persistierte Scene-Liste.";
          bodyIntroTitle.textContent = isRecording ? "Aufnahme laeuft" : "Erstellungsmodus";
          bodyIntroCopy.textContent = isRecording
            ? "Die Kamera schreibt gerade ein neues Segment in den Scene-Balken."
            : "Bearbeite Name, nimm weitere Segmente auf und schliesse den Flow mit Speichern in presentation.scenes[] ab.";
          if (compactPanel) {
            bodyIntroTitle.textContent = isRecording ? "Recorder laeuft" : "Aktive Scene";
            bodyIntroCopy.textContent = isRecording
              ? "Die Kamera schreibt gerade ein neues Segment in den Scene-Balken."
              : "Segment aufnehmen, pruefen und erst am Ende in die Library speichern.";
          }
          title.textContent = compactPanel ? "Aktive Scene" : "Scene Recorder";
          nameInput.disabled = false;
          nameInput.hidden = false;
          if (nameInput.value !== draftScene.name) {
            nameInput.value = draftScene.name;
          }
          recordButton.textContent = isRecording
            ? "Aufnahme laeuft"
            : (draftScene.cameraSpans.length ? "Weiteres Segment" : "Aufnahme starten");
          stopButton.textContent = "Segment beenden";
          saveButton.textContent = "Scene speichern";
          discardButton.textContent = "Draft verwerfen";
          recordButton.disabled = isRecording || !runtimeReady;
          stopButton.disabled = !isRecording;
          saveButton.disabled = !draftScene.cameraSpans.length || isRecording;
          discardButton.disabled = false;
          actionGuide.textContent = isRecording
            ? "Bewege jetzt die Kamera. Segment beenden schliesst den aktuellen cameraSpan[]."
            : (draftScene.cameraSpans.length
              ? "Draft enthaelt Segmente. Speichern uebernimmt ihn in presentation.scenes[] oder du nimmst ein weiteres Segment auf."
              : "Starte die erste Aufnahme. Danach kannst du das Segment beenden und den Draft spaeter speichern.");
          draftMeta.textContent = `${draftScene.cameraSpans.length} cameraSpan${draftScene.cameraSpans.length === 1 ? "" : "s"}[] · ${formatDurationLabel(liveDurationMs)}`;
          statusBadge.textContent = isRecording ? "Aufnahme laeuft" : "Scene bereit";
          statusBadge.dataset.tone = isRecording ? "live" : "ready";

          const contentWidth = Math.max(720, Math.ceil((liveDurationMs / 1000) * 64), 720);
          const scaleDurationMs = Math.max(liveDurationMs, 1000);
          trackCanvas.style.width = `${contentWidth}px`;
          trackFill.style.width = `${contentWidth}px`;
          playhead.style.left = `${contentWidth - 2}px`;
          trackPlaceholder.hidden = true;
          markerLayer.innerHTML = "";

          draftScene.cameraSpans.forEach((span) => {
            const left = (clamp(span.startMs || 0, 0, scaleDurationMs) / scaleDurationMs) * contentWidth;
            const width = Math.max(8, ((Math.max(1, Number(span.endMs || 0) - Number(span.startMs || 0))) / scaleDurationMs) * contentWidth);
            const segment = createNode("span", "presenter-studio-segment");
            segment.style.left = `${left}px`;
            segment.style.width = `${width}px`;
            segment.title = `${formatDurationLabel(span.startMs)} - ${formatDurationLabel(span.endMs)}`;
            markerLayer.appendChild(segment);
          });

          if (isRecording) {
            const activeStartMs = clamp(draftScene.durationMs || 0, 0, scaleDurationMs);
            const activeLeft = (activeStartMs / scaleDurationMs) * contentWidth;
            const activeWidth = Math.max(8, (((liveDurationMs - activeStartMs) || 1) / scaleDurationMs) * contentWidth);
            const recordingSegment = createNode("span", "presenter-studio-segment is-recording");
            recordingSegment.style.left = `${activeLeft}px`;
            recordingSegment.style.width = `${activeWidth}px`;
            markerLayer.appendChild(recordingSegment);
          }

          trackViewport.scrollLeft = Math.max(0, trackCanvas.scrollWidth - trackViewport.clientWidth);
        }

        library.hidden = false;
        libraryTitle.textContent = scenes.length
          ? (compactPanel ? `Library · ${scenes.length}` : `Scenes dieser Presentation (${scenes.length})`)
          : (compactPanel ? "Library" : "Scenes dieser Presentation");
        libraryPlayAll.disabled = isRecording || Boolean(draftScene) || (!isSequencePlaying && scenes.length < 2);
        libraryPlayAll.hidden = false;
        libraryPlayAll.dataset.mode = isSequencePlaying ? "stop" : "play";
        libraryPlayAll.textContent = isSequencePlaying ? "Sequenz stoppen" : "Alle abspielen";
        libraryPlayAll.classList.toggle("is-danger", isSequencePlaying);
        libraryMeta.textContent = editorStatus === "saved"
          ? "Speichern abgeschlossen: Der Draft wurde in `presentation.scenes[]` uebernommen und ist jetzt als Scene-Library-Eintrag sichtbar."
          : (scenes.length
            ? "Diese Liste bildet das Zielmodell der aktuellen ScenePresentation. Scenes koennen von hier aus wiedergegeben oder erneut in den Draft geladen werden."
            : "Sobald du speicherst, wandert dein Draft aus der Recorder-Shell in die `presentation.scenes[]`-Liste.");
        libraryList.innerHTML = "";
        if (!scenes.length) {
          const emptyCard = createNode("article", "presenter-studio-library-card is-empty");
          const emptyTitle = createNode("strong", "presenter-studio-library-card-title", "Diese ScenePresentation hat noch keine Scenes");
          const emptyMeta = createNode("span", "presenter-studio-library-card-meta", "Nutze Neue Scene, nimm Segmente auf und fuege den Draft dann mit Speichern in die Presentation ein.");
          emptyCard.append(emptyTitle, emptyMeta);
          libraryList.appendChild(emptyCard);
        }
        scenes.forEach((scene) => {
          const card = createNode("article", "presenter-studio-library-card");
          const isPlaying = playingSceneId === scene.sceneId;
          const isEditingScene = draftScene?.sceneId === scene.sceneId;
          const isFreshlySaved = editorStatus === "saved" && recorderActiveSceneId === scene.sceneId;
          const draftLocked = Boolean(draftScene);
          const isSeededScene = presentationId
            ? String(scene.sceneId || "").startsWith(`${presentationId}-scene-`)
            : false;
          card.dataset.playing = isPlaying ? "true" : "false";
          card.dataset.editing = isEditingScene ? "true" : "false";
          card.dataset.saved = isFreshlySaved ? "true" : "false";
          card.dataset.seeded = isSeededScene ? "true" : "false";
          const cardTitle = createNode("strong", "presenter-studio-library-card-title", scene.name || "Scene");
          const cardMeta = createNode(
            "span",
            "presenter-studio-library-card-meta",
            `${formatDurationLabel(scene.durationMs || 0)} · ${Array.isArray(scene.cameraSpans) ? scene.cameraSpans.length : 0} cameraSpan${Array.isArray(scene.cameraSpans) && scene.cameraSpans.length === 1 ? "" : "s"}[]`
          );
          const cardStateRow = createNode("div", "presenter-studio-library-card-state");
          const cardState = createNode("span", "presenter-meta-pill presenter-studio-library-card-statepill");
          const showCompactStatePill = !compactPanel || isFreshlySaved || isPlaying || isEditingScene;
          if (isFreshlySaved) {
            cardState.textContent = "Neu in presentation.scenes[]";
            cardState.dataset.state = "complete";
          } else if (isPlaying) {
            cardState.textContent = "Aktuell im Player";
            cardState.dataset.state = "live";
          } else if (isEditingScene) {
            cardState.textContent = "Zurueck im Draft";
            cardState.dataset.state = "ready";
          } else {
            cardState.textContent = "Library-Eintrag";
            cardState.dataset.state = "pending";
          }
          if (showCompactStatePill) {
            cardStateRow.appendChild(cardState);
          }
          const cardFlag = isFreshlySaved
            ? createNode("span", "presenter-meta-pill presenter-studio-library-card-flag", "Gerade in presentation.scenes[] gespeichert")
            : null;
          const actionRow = createNode("div", "presenter-studio-library-card-actions");
          card.dataset.sceneId = String(scene.sceneId || "");
          const playSceneButton = createNode("button", "btn-secondary presenter-studio-library-action", isPlaying ? (compactPanel ? "Aktiv" : "Im Player aktiv") : (compactPanel ? "Abspielen" : "Im Player abspielen"));
          playSceneButton.type = "button";
          playSceneButton.dataset.action = "play";
          playSceneButton.disabled = !runtimeReady || isRecording || isPlaying || draftLocked;
          playSceneButton.addEventListener("click", () => {
            callbacks.onPlaySavedScene(scene.sceneId);
          });
          const editSceneButton = createNode("button", "btn-secondary presenter-studio-library-action", isEditingScene ? (compactPanel ? "Im Draft" : "Im Draft aktiv") : (compactPanel ? "Bearbeiten" : "In Draft laden"));
          editSceneButton.type = "button";
          editSceneButton.dataset.action = "edit";
          editSceneButton.disabled = isRecording || isPlaying || (draftLocked && !isEditingScene);
          editSceneButton.addEventListener("click", () => {
            callbacks.onEditSavedScene(scene.sceneId);
          });
          actionRow.append(playSceneButton, editSceneButton);
          if (!isSeededScene) {
            const deleteSceneButton = createNode("button", "btn-secondary presenter-studio-library-action is-danger", compactPanel ? "Loeschen" : "Aus Library loeschen");
            deleteSceneButton.type = "button";
            deleteSceneButton.dataset.action = "delete";
            deleteSceneButton.disabled = isRecording || isPlaying || draftLocked;
            deleteSceneButton.addEventListener("click", () => {
              callbacks.onDeleteSavedScene(scene.sceneId);
            });
            actionRow.appendChild(deleteSceneButton);
          }
          card.append(cardTitle, cardMeta);
          if (showCompactStatePill) {
            card.appendChild(cardStateRow);
          }
          if (cardFlag) {
            card.appendChild(cardFlag);
          }
          card.appendChild(actionRow);
          libraryList.appendChild(card);
        });

        projectsMeta.textContent = presentationLibrary.total
          ? `${presentationLibrary.total} lokale ScenePresentation${presentationLibrary.total === 1 ? "" : "s"} im Projektordner`
          : "Noch keine lokalen ScenePresentations gespeichert.";
        projectsFolderInput.disabled = isRecording;
        if (projectsFolderInput.value !== projectFolderPath) {
          projectsFolderInput.value = projectFolderPath;
        }
        projectNewButton.disabled = isRecording;
        projectSaveButton.disabled = isRecording || !runtimeReady;
        projectsTree.innerHTML = "";
        if (!presentationLibrary.folders.length) {
          const emptyNote = createNode("div", "presenter-studio-projects-empty", "Noch keine lokalen Projekte gespeichert. Nutze In Projekt speichern.");
          projectsTree.appendChild(emptyNote);
        } else {
          presentationLibrary.folders.forEach((folder) => {
            const folderBlock = createNode("div", "presenter-studio-project-folder");
            const folderHeader = createNode("div", "presenter-studio-project-folder-header");
            const folderName = createNode("strong", "presenter-studio-project-folder-name", folder.label || folder.path || "Ordner");
            const folderMeta = createNode("span", "presenter-studio-project-folder-meta", `${folder.count || 0} Presentation${(folder.count || 0) === 1 ? "" : "s"}`);
            const folderPick = createNode("button", "btn-secondary presenter-studio-project-folder-action", "Als Ziel");
            folderPick.type = "button";
            folderPick.disabled = isRecording;
            folderPick.addEventListener("click", () => {
              callbacks.onSelectProjectFolder(folder.path || folder.label || "");
            });
            folderHeader.append(folderName, folderMeta, folderPick);
            const folderList = createNode("div", "presenter-studio-project-folder-list");
            (Array.isArray(folder.entries) ? folder.entries : []).forEach((entry) => {
              const card = createNode("article", "presenter-studio-project-card");
              card.dataset.presentationId = String(entry.presentationId || "");
              card.dataset.active = entry.isActive ? "true" : "false";
              const cardTitle = createNode("strong", "presenter-studio-project-card-title", entry.title || entry.name || "Presentation");
              const cardMeta = createNode(
                "span",
                "presenter-studio-project-card-meta",
                `${entry.sceneCount || 0} Scene${entry.sceneCount === 1 ? "" : "s"} · ${entry.spanCount || 0} CameraSpan${entry.spanCount === 1 ? "" : "s"}`
              );
              const cardActions = createNode("div", "presenter-studio-project-card-actions");
              const loadButton = createNode("button", "btn-secondary presenter-studio-project-action", entry.isActive ? "Aktiv" : "Laden");
              loadButton.type = "button";
              loadButton.disabled = entry.isActive || isRecording || Boolean(draftScene);
              loadButton.addEventListener("click", () => {
                callbacks.onLoadPresentation(entry.presentationId);
              });
              cardActions.appendChild(loadButton);
              const deleteButton = createNode("button", "btn-secondary presenter-studio-project-action is-danger", "Entfernen");
              deleteButton.type = "button";
              deleteButton.disabled = entry.isActive || isRecording || Boolean(draftScene);
              deleteButton.addEventListener("click", () => {
                callbacks.onDeletePresentation(entry.presentationId);
              });
              cardActions.appendChild(deleteButton);
              card.append(cardTitle, cardMeta, cardActions);
              folderList.appendChild(card);
            });
            folderBlock.append(folderHeader, folderList);
            projectsTree.appendChild(folderBlock);
          });
        }
      }
    });
  }

  global.PresentationStudioUi = Object.freeze({
    createUi
  });
})(window);
