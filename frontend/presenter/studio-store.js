(function initPresentationStudioStore(global) {
  "use strict";

  function clamp(value, min, max) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
    return Math.min(max, Math.max(min, safeValue));
  }

  function cloneVector(vector) {
    const source = vector && typeof vector === "object" ? vector : {};
    return Object.freeze({
      x: Number(source.x || 0),
      y: Number(source.y || 0),
      z: Number(source.z || 0)
    });
  }

  function clonePose(pose) {
    const source = pose && typeof pose === "object" ? pose : {};
    return Object.freeze({
      position: cloneVector(source.position),
      target: cloneVector(source.target),
      rotation: cloneVector(source.rotation)
    });
  }

  function cloneSpan(span) {
    const source = span && typeof span === "object" ? span : {};
    return Object.freeze({
      spanId: String(source.spanId || ""),
      startMs: clamp(source.startMs || 0, 0, Number.MAX_SAFE_INTEGER),
      endMs: clamp(source.endMs || 0, 0, Number.MAX_SAFE_INTEGER),
      durationMs: clamp(source.durationMs || (Number(source.endMs || 0) - Number(source.startMs || 0)), 0, Number.MAX_SAFE_INTEGER),
      easing: String(source.easing || "easeInOutCubic"),
      startPose: clonePose(source.startPose),
      endPose: clonePose(source.endPose)
    });
  }

  function cloneScene(scene) {
    const source = scene && typeof scene === "object" ? scene : {};
    return Object.freeze({
      sceneId: String(source.sceneId || ""),
      name: String(source.name || "Neue Scene"),
      durationMs: clamp(source.durationMs || 0, 0, Number.MAX_SAFE_INTEGER),
      createdAt: Number(source.createdAt || Date.now()),
      updatedAt: Number(source.updatedAt || Date.now()),
      cameraSpans: Object.freeze((Array.isArray(source.cameraSpans) ? source.cameraSpans : []).map(cloneSpan))
    });
  }

  function cloneSnapshot(state) {
    const scenes = Object.freeze(state.savedScenes.map(cloneScene));
    return Object.freeze({
      mode: state.mode,
      presentationId: state.presentationId,
      presentationName: state.presentationName,
      presentationTitle: state.presentationTitle,
      studioPanelOpen: Boolean(state.studioPanelOpen),
      playingSceneId: String(state.playingSceneId || ""),
      draftScene: state.draftScene ? cloneScene(state.draftScene) : null,
      savedScenes: scenes,
      scenes
    });
  }

  function getPresentationScenes(presentation) {
    const safePresentation = presentation && typeof presentation === "object" ? presentation : {};
    if (Array.isArray(safePresentation.scenes)) {
      return safePresentation.scenes;
    }
    if (Array.isArray(safePresentation.savedScenes)) {
      return safePresentation.savedScenes;
    }
    if (safePresentation.scene && typeof safePresentation.scene === "object") {
      return [safePresentation.scene];
    }
    return [];
  }

  function normalizeImportedPresentation(presentation) {
    const presenterDataApi = global.PresenterData && typeof global.PresenterData === "object"
      ? global.PresenterData
      : null;
    if (presenterDataApi && typeof presenterDataApi.normalizeImportedPresentation === "function") {
      return presenterDataApi.normalizeImportedPresentation(presentation);
    }
    const safePresentation = presentation && typeof presentation === "object" ? presentation : {};
    return {
      ...safePresentation,
      scenes: getPresentationScenes(safePresentation)
    };
  }

  function serializePresentationForExport(presentation) {
    const presenterDataApi = global.PresenterData && typeof global.PresenterData === "object"
      ? global.PresenterData
      : null;
    if (presenterDataApi && typeof presenterDataApi.serializePresentation === "function") {
      return presenterDataApi.serializePresentation(presentation);
    }
    return {
      ...presentation,
      scenes: getPresentationScenes(presentation)
    };
  }

  function createStore(options = {}) {
    const initialPresentation = options.initialPresentation && typeof options.initialPresentation === "object"
      ? options.initialPresentation
      : null;
    const initialPresentationName = String(
      options.presentationName ||
      initialPresentation?.name ||
      initialPresentation?.title ||
      "Untitled Presentation"
    ).trim() || "Untitled Presentation";
    const initialPresentationTitle = String(
      options.presentationTitle ||
      initialPresentation?.title ||
      initialPresentation?.name ||
      initialPresentationName
    ).trim() || initialPresentationName;
    const state = {
      mode: "player",
      presentationId: String(options.presentationId || initialPresentation?.presentationId || initialPresentation?.id || ""),
      presentationName: initialPresentationName,
      presentationTitle: initialPresentationTitle,
      studioPanelOpen: false,
      playingSceneId: "",
      draftScene: null,
      savedScenes: [],
      nextSceneNumber: 1
    };
    const listeners = new Set();

    const initialScenes = Array.isArray(options.initialScenes) && options.initialScenes.length
      ? options.initialScenes
      : getPresentationScenes(initialPresentation);
    if (Array.isArray(initialScenes) && initialScenes.length) {
      state.savedScenes = initialScenes.map(cloneScene);
      const highestSceneNumber = state.savedScenes.reduce((maxValue, scene) => {
        const match = String(scene?.sceneId || "").match(/scene-(\d+)/i);
        if (!match) return maxValue;
        return Math.max(maxValue, Number(match[1] || 0));
      }, 0);
      state.nextSceneNumber = Math.max(state.nextSceneNumber, highestSceneNumber + 1);
    }

    function emit() {
      const snapshot = cloneSnapshot(state);
      listeners.forEach((listener) => {
        try {
          listener(snapshot);
        } catch {
        }
      });
      return snapshot;
    }

    function getSnapshot() {
      return cloneSnapshot(state);
    }

    function reserveSceneIdentity() {
      const sceneNumber = state.nextSceneNumber;
      state.nextSceneNumber += 1;
      return Object.freeze({
        sceneId: `scene-${String(sceneNumber).padStart(3, "0")}`,
        name: `Scene ${String(sceneNumber).padStart(2, "0")}`
      });
    }

    function updateNextSceneNumberFromSavedScenes() {
      const highestSceneNumber = state.savedScenes.reduce((maxValue, scene) => {
        const match = String(scene?.sceneId || "").match(/scene-(\d+)/i);
        if (!match) return maxValue;
        return Math.max(maxValue, Number(match[1] || 0));
      }, 0);
      state.nextSceneNumber = Math.max(state.nextSceneNumber, highestSceneNumber + 1);
    }

    function ensureDraftScene() {
      if (!state.draftScene) {
        const identity = reserveSceneIdentity();
        state.draftScene = {
          sceneId: identity.sceneId,
          name: identity.name,
          durationMs: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cameraSpans: []
        };
        state.playingSceneId = "";
      }
      return state.draftScene;
    }

    const api = Object.freeze({
      subscribe(listener) {
        if (typeof listener !== "function") {
          return () => {
          };
        }
        listeners.add(listener);
        listener(getSnapshot());
        return () => {
          listeners.delete(listener);
        };
      },
      getSnapshot,
      openStudioPanel() {
        state.studioPanelOpen = true;
        state.mode = state.draftScene ? "editing" : "player";
        return emit();
      },
      closeStudioPanel() {
        state.studioPanelOpen = false;
        state.mode = state.draftScene ? "editing" : "player";
        return emit();
      },
      beginDraftScene(name) {
        if (state.draftScene) {
          state.studioPanelOpen = true;
          state.mode = "editing";
          if (name) {
            state.draftScene.name = String(name).trim() || state.draftScene.name;
          }
          state.draftScene.updatedAt = Date.now();
          return emit();
        }
        const identity = reserveSceneIdentity();
        state.draftScene = {
          sceneId: identity.sceneId,
          name: String(name || "").trim() || identity.name,
          durationMs: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cameraSpans: []
        };
        state.studioPanelOpen = true;
        state.mode = "editing";
        state.playingSceneId = "";
        return emit();
      },
      renameDraftScene(name) {
        const draftScene = ensureDraftScene();
        draftScene.name = String(name || "").trim() || draftScene.name;
        draftScene.updatedAt = Date.now();
        state.mode = "editing";
        state.studioPanelOpen = true;
        return emit();
      },
      appendSpan(span) {
        if (!span || typeof span !== "object") return getSnapshot();
        const draftScene = ensureDraftScene();
        const nextSpan = {
          spanId: String(span.spanId || `${draftScene.sceneId}-span-${String(draftScene.cameraSpans.length + 1).padStart(3, "0")}`),
          startMs: clamp(span.startMs || draftScene.durationMs, 0, Number.MAX_SAFE_INTEGER),
          endMs: clamp(span.endMs || draftScene.durationMs, 0, Number.MAX_SAFE_INTEGER),
          durationMs: clamp(span.durationMs || 0, 0, Number.MAX_SAFE_INTEGER),
          easing: String(span.easing || "easeInOutCubic"),
          startPose: clonePose(span.startPose),
          endPose: clonePose(span.endPose)
        };
        nextSpan.durationMs = Math.max(0, nextSpan.endMs - nextSpan.startMs);
        draftScene.cameraSpans.push(nextSpan);
        draftScene.durationMs = Math.max(draftScene.durationMs, nextSpan.endMs);
        draftScene.updatedAt = Date.now();
        state.mode = "editing";
        state.studioPanelOpen = true;
        return emit();
      },
      saveDraftScene() {
        if (!state.draftScene) return null;
        const draftScene = state.draftScene;
        if (!draftScene.cameraSpans.length) return null;
        const savedScene = cloneScene(draftScene);
        const nextScene = {
          sceneId: savedScene.sceneId,
          name: savedScene.name,
          durationMs: savedScene.durationMs,
          createdAt: savedScene.createdAt,
          updatedAt: Date.now(),
          cameraSpans: savedScene.cameraSpans.map((span) => ({
            spanId: span.spanId,
            startMs: span.startMs,
            endMs: span.endMs,
            durationMs: span.durationMs,
            easing: span.easing,
            startPose: span.startPose,
            endPose: span.endPose
          }))
        };
        const existingIndex = state.savedScenes.findIndex((scene) => scene.sceneId === nextScene.sceneId);
        if (existingIndex >= 0) {
          state.savedScenes.splice(existingIndex, 1, nextScene);
        } else {
          state.savedScenes.push(nextScene);
        }
        state.draftScene = null;
        state.mode = "player";
        state.studioPanelOpen = true;
        state.playingSceneId = "";
        updateNextSceneNumberFromSavedScenes();
        emit();
        return cloneScene(nextScene);
      },
      discardDraftScene() {
        state.draftScene = null;
        state.mode = "player";
        state.studioPanelOpen = true;
        return emit();
      },
      loadSavedSceneIntoDraft(sceneId) {
        const targetSceneId = String(sceneId || "").trim();
        const savedScene = state.savedScenes.find((scene) => scene.sceneId === targetSceneId);
        if (!savedScene) return getSnapshot();
        state.draftScene = {
          sceneId: savedScene.sceneId,
          name: savedScene.name,
          durationMs: savedScene.durationMs,
          createdAt: savedScene.createdAt,
          updatedAt: Date.now(),
          cameraSpans: savedScene.cameraSpans.map((span) => ({
            spanId: span.spanId,
            startMs: span.startMs,
            endMs: span.endMs,
            durationMs: span.durationMs,
            easing: span.easing,
            startPose: clonePose(span.startPose),
            endPose: clonePose(span.endPose)
          }))
        };
        state.mode = "editing";
        state.studioPanelOpen = true;
        state.playingSceneId = "";
        return emit();
      },
      deleteSavedScene(sceneId) {
        const targetSceneId = String(sceneId || "").trim();
        state.savedScenes = state.savedScenes.filter((scene) => scene.sceneId !== targetSceneId);
        if (state.playingSceneId === targetSceneId) {
          state.playingSceneId = "";
        }
        if (state.draftScene?.sceneId === targetSceneId) {
          state.draftScene = null;
          state.mode = "player";
        }
        return emit();
      },
      setPlayingScene(sceneId) {
        const targetSceneId = String(sceneId || "").trim();
        const sceneExists = state.savedScenes.some((scene) => scene.sceneId === targetSceneId);
        state.playingSceneId = sceneExists ? targetSceneId : "";
        return emit();
      },
      setStudioMode(mode) {
        const normalized = String(mode || "player").trim().toLowerCase();
        state.mode = normalized === "editing" ? "editing" : "player";
        return emit();
      },
      replaceSavedScenes(nextScenes) {
        state.savedScenes = Array.isArray(nextScenes)
          ? nextScenes.map((scene) => ({
            sceneId: String(scene.sceneId || reserveSceneIdentity().sceneId),
            name: String(scene.name || "Scene"),
            durationMs: clamp(scene.durationMs || 0, 0, Number.MAX_SAFE_INTEGER),
            createdAt: Number(scene.createdAt || Date.now()),
            updatedAt: Number(scene.updatedAt || Date.now()),
            cameraSpans: (Array.isArray(scene.cameraSpans) ? scene.cameraSpans : []).map((span) => ({
              spanId: String(span.spanId || ""),
              startMs: clamp(span.startMs || 0, 0, Number.MAX_SAFE_INTEGER),
              endMs: clamp(span.endMs || 0, 0, Number.MAX_SAFE_INTEGER),
              durationMs: clamp(span.durationMs || (Number(span.endMs || 0) - Number(span.startMs || 0)), 0, Number.MAX_SAFE_INTEGER),
              easing: String(span.easing || "easeInOutCubic"),
              startPose: clonePose(span.startPose),
              endPose: clonePose(span.endPose)
            }))
          }))
          : [];
        updateNextSceneNumberFromSavedScenes();
        return emit();
      },
      replacePresentationScenes(nextScenes) {
        return api.replaceSavedScenes(nextScenes);
      },
      importPresentation(presentation) {
        const safePresentation = normalizeImportedPresentation(presentation);
        const nextPresentationId = String(safePresentation.presentationId || state.presentationId || "").trim();
        const nextPresentationName = String(
          safePresentation.name ||
          safePresentation.title ||
          state.presentationName ||
          state.presentationTitle ||
          "Untitled Presentation"
        ).trim() || "Untitled Presentation";
        const nextPresentationTitle = String(
          safePresentation.title ||
          safePresentation.name ||
          state.presentationTitle ||
          state.presentationName ||
          "Untitled Presentation"
        ).trim() || nextPresentationName;
        state.presentationId = nextPresentationId;
        state.presentationName = nextPresentationName;
        state.presentationTitle = nextPresentationTitle;
        state.savedScenes = getPresentationScenes(safePresentation).map(cloneScene);
        state.draftScene = null;
        state.playingSceneId = "";
        state.mode = "player";
        updateNextSceneNumberFromSavedScenes();
        return emit();
      },
      exportPresentation() {
        const scenes = Object.freeze(state.savedScenes.map(cloneScene));
        const serializedPresentation = serializePresentationForExport({
          schemaVersion: "scene-presentation-v1",
          presentationId: state.presentationId,
          name: state.presentationName,
          title: state.presentationTitle,
          mode: "player",
          scenes
        });
        return Object.freeze(serializedPresentation);
      }
    });

    return api;
  }

  global.PresentationStudioStore = Object.freeze({
    createStore,
    cloneScene,
    cloneSpan,
    clonePose
  });
})(window);
