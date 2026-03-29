(function initPresenterData(global) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
    return Math.min(max, Math.max(min, safeValue));
  }

  function normalizeVector3(source) {
    const safeSource = source && typeof source === "object" ? source : {};
    return Object.freeze({
      x: Number(safeSource.x || 0),
      y: Number(safeSource.y || 0),
      z: Number(safeSource.z || 0)
    });
  }

  function normalizePose(source) {
    const safeSource = source && typeof source === "object" ? source : {};
    return Object.freeze({
      position: normalizeVector3(safeSource.position),
      target: normalizeVector3(safeSource.target),
      rotation: normalizeVector3(safeSource.rotation)
    });
  }

  function orbitCameraToPose(cameraConfig, fallbackTarget = [0, 0, 0]) {
    const safeTarget = Array.isArray(cameraConfig?.target) ? cameraConfig.target : fallbackTarget;
    const target = {
      x: Number(safeTarget[0] || 0),
      y: Number(safeTarget[1] || 0),
      z: Number(safeTarget[2] || 0)
    };
    const alpha = Number(cameraConfig?.alpha || 0);
    const beta = clamp(Number(cameraConfig?.beta || Math.PI / 2), 0.05, Math.PI - 0.05);
    const radius = Math.max(0.1, Number(cameraConfig?.radius || 12));
    const sinBeta = Math.sin(beta);
    const position = {
      x: target.x + (radius * Math.cos(alpha) * sinBeta),
      y: target.y + (radius * Math.cos(beta)),
      z: target.z + (radius * Math.sin(alpha) * sinBeta)
    };
    const rotation = {
      x: beta - (Math.PI / 2),
      y: alpha + (Math.PI / 2),
      z: 0
    };
    return Object.freeze({
      position: normalizeVector3(position),
      target: normalizeVector3(target),
      rotation: normalizeVector3(rotation)
    });
  }

  function normalizeCameraSpan(span, index = 0) {
    const safeSpan = span && typeof span === "object" ? span : {};
    const startMs = clamp(safeSpan.startMs || 0, 0, Number.MAX_SAFE_INTEGER);
    const endMs = clamp(safeSpan.endMs || startMs, startMs, Number.MAX_SAFE_INTEGER);
    return Object.freeze({
      spanId: String(safeSpan.spanId || `span-${String(index + 1).padStart(3, "0")}`),
      startMs,
      endMs,
      durationMs: Math.max(0, endMs - startMs),
      easing: String(safeSpan.easing || "easeInOutCubic"),
      startPose: normalizePose(safeSpan.startPose),
      endPose: normalizePose(safeSpan.endPose)
    });
  }

  function buildCameraSpansFromCues(scene) {
    const safeScene = scene && typeof scene === "object" ? scene : {};
    const cues = Array.isArray(safeScene.cues) ? safeScene.cues.slice() : [];
    const durationMs = Math.max(1000, Number(safeScene.durationMs || 1000));
    const fallbackCamera = safeScene.camera || {};
    if (!cues.length) {
      const fallbackPose = orbitCameraToPose(fallbackCamera, fallbackCamera.target || [0, 0, 0]);
      return Object.freeze([
        normalizeCameraSpan({
          spanId: "span-001",
          startMs: 0,
          endMs: durationMs,
          startPose: fallbackPose,
          endPose: fallbackPose,
          easing: "linear"
        }, 0)
      ]);
    }

    return Object.freeze(cues.map((cue, index) => {
      const nextCue = cues[index + 1] || null;
      const cueCamera = cue?.camera || fallbackCamera;
      const nextCamera = nextCue?.camera || cueCamera;
      const startPose = orbitCameraToPose(cueCamera, cueCamera.target || fallbackCamera.target || [0, 0, 0]);
      const endPose = orbitCameraToPose(nextCamera, nextCamera.target || cueCamera.target || fallbackCamera.target || [0, 0, 0]);
      const startMs = clamp(cue?.startMs || 0, 0, durationMs);
      const endMs = clamp(
        nextCue?.startMs ?? cue?.endMs ?? durationMs,
        startMs,
        durationMs
      );
      return normalizeCameraSpan({
        spanId: String(cue?.id || `span-${String(index + 1).padStart(3, "0")}`),
        startMs,
        endMs,
        startPose,
        endPose,
        easing: "easeInOutCubic"
      }, index);
    }));
  }

  function normalizeScene(rawScene, index, presentationId) {
    const safeScene = rawScene && typeof rawScene === "object" ? rawScene : {};
    const sceneId = String(
      safeScene.sceneId ||
      `${String(presentationId || "presentation").trim() || "presentation"}-scene-${String(index + 1).padStart(3, "0")}`
    );
    const durationMs = Math.max(1000, Number(safeScene.durationMs || 1000));
    const cameraSpans = Array.isArray(safeScene.cameraSpans) && safeScene.cameraSpans.length
      ? safeScene.cameraSpans.map((span, spanIndex) => normalizeCameraSpan(span, spanIndex))
      : buildCameraSpansFromCues({
        ...safeScene,
        durationMs
      });
    return Object.freeze({
      ...clone(safeScene),
      sceneId,
      name: String(safeScene.name || safeScene.title || `Scene ${String(index + 1).padStart(2, "0")}`),
      durationMs,
      cameraSpans
    });
  }

  function normalizePresentation(rawPresentation) {
    const safePresentation = rawPresentation && typeof rawPresentation === "object" ? rawPresentation : {};
    const presentationId = String(safePresentation.presentationId || safePresentation.id || "").trim();
    const scenesSource = Array.isArray(safePresentation.scenes)
      ? safePresentation.scenes
      : (Array.isArray(safePresentation.savedScenes)
          ? safePresentation.savedScenes
          : (safePresentation.scene ? [safePresentation.scene] : []));
    const scenes = Object.freeze(
      scenesSource.map((scene, index) => normalizeScene(scene, index, presentationId))
    );
    const totalDurationMs = scenes.reduce((sum, scene) => sum + Math.max(0, Number(scene.durationMs || 0)), 0);
    return Object.freeze({
      ...clone(safePresentation),
      schemaVersion: "scene-presentation-v1",
      presentationId,
      id: presentationId,
      name: String(safePresentation.name || safePresentation.title || presentationId || "Untitled Presentation"),
      title: String(safePresentation.title || safePresentation.name || presentationId || "Untitled Presentation"),
      // Launch intent only. Actual playback state stays in runtime/editor state, not in the data model.
      mode: String(safePresentation.mode || "player"),
      scenes,
      // Compatibility bridge for older reader paths. `scenes[]` remains authoritative.
      scene: scenes[0] || null,
      estimatedDurationMs: Math.max(1000, Number(safePresentation.estimatedDurationMs || totalDurationMs || 1000))
    });
  }

  function serializeCameraSpan(rawSpan, index = 0) {
    const span = normalizeCameraSpan(rawSpan, index);
    return {
      spanId: span.spanId,
      startMs: span.startMs,
      endMs: span.endMs,
      durationMs: span.durationMs,
      easing: span.easing,
      startPose: clone(span.startPose),
      endPose: clone(span.endPose)
    };
  }

  function serializeScene(rawScene, index = 0, presentationId = "") {
    const scene = normalizeScene(rawScene, index, presentationId);
    return {
      ...clone(scene),
      cameraSpans: scene.cameraSpans.map((span, spanIndex) => serializeCameraSpan(span, spanIndex))
    };
  }

  function serializePresentation(rawPresentation, options = {}) {
    const presentation = normalizePresentation(rawPresentation);
    const payload = {
      ...clone(presentation),
      scenes: presentation.scenes.map((scene, index) => serializeScene(scene, index, presentation.presentationId))
    };
    if (!options.includeLegacySceneAlias) {
      delete payload.scene;
    }
    if (options.includeLegacySavedScenesAlias) {
      payload.savedScenes = clone(payload.scenes);
    } else {
      delete payload.savedScenes;
    }
    return payload;
  }

  const LOCAL_LIBRARY_STORAGE_KEY = "presenter_local_presentation_library_v1";
  let localLibraryCache = null;

  function cloneLocalLibrary(library) {
    const safeLibrary = library && typeof library === "object" ? library : {};
    const presentations = Array.isArray(safeLibrary.presentations) ? safeLibrary.presentations : [];
    return {
      version: 1,
      presentations: presentations.map((entry) => ({
        presentationId: String(entry?.presentationId || ""),
        folderPath: String(entry?.folderPath || "Presentations"),
        updatedAt: Number(entry?.updatedAt || 0),
        presentation: entry?.presentation ? clone(entry.presentation) : null
      }))
    };
  }

  function loadLocalLibrary() {
    if (localLibraryCache) {
      return cloneLocalLibrary(localLibraryCache);
    }
    if (typeof localStorage === "undefined") {
      return { version: 1, presentations: [] };
    }
    try {
      const raw = localStorage.getItem(LOCAL_LIBRARY_STORAGE_KEY);
      if (!raw) {
        return { version: 1, presentations: [] };
      }
      const parsed = JSON.parse(raw);
      const normalized = cloneLocalLibrary(parsed);
      localLibraryCache = clone(normalized);
      return normalized;
    } catch {
      return { version: 1, presentations: [] };
    }
  }

  function persistLocalLibrary(library) {
    const safeLibrary = cloneLocalLibrary(library);
    localLibraryCache = clone(safeLibrary);
    if (typeof localStorage === "undefined") {
      return false;
    }
    try {
      localStorage.setItem(LOCAL_LIBRARY_STORAGE_KEY, JSON.stringify(safeLibrary));
      return true;
    } catch {
      return false;
    }
  }

  function normalizeLocalPresentationEntry(entry) {
    const safeEntry = entry && typeof entry === "object" ? entry : {};
    const presentation = normalizePresentation(
      safeEntry.presentation && typeof safeEntry.presentation === "object"
        ? safeEntry.presentation
        : safeEntry
    );
    const presentationId = String(safeEntry.presentationId || presentation.presentationId || presentation.id || "").trim();
    const folderPath = String(safeEntry.folderPath || "Presentations").trim() || "Presentations";
    const updatedAt = Number(safeEntry.updatedAt || presentation.updatedAt || Date.now());
    return {
      presentationId: presentationId || `presentation-${String(Date.now())}`,
      folderPath,
      updatedAt,
      presentation
    };
  }

  function listLocalPresentations() {
    const library = loadLocalLibrary();
    return library.presentations
      .map((entry) => normalizeLocalPresentationEntry(entry))
      .filter((entry) => entry.presentationId);
  }

  function saveLocalPresentation(rawPresentation, options = {}) {
    const normalized = normalizePresentation(rawPresentation);
    const presentationId = String(normalized.presentationId || normalized.id || "").trim() || `presentation-${String(Date.now())}`;
    const folderPath = String(options.folderPath || "Presentations").trim() || "Presentations";
    const payload = {
      ...serializePresentation({
        ...normalized,
        presentationId,
        id: presentationId,
        kicker: normalized.kicker || "Lokale ScenePresentation",
        summary: normalized.summary || `Lokale Presentation mit ${normalized.scenes.length} Scene${normalized.scenes.length === 1 ? "" : "s"}.`
      }),
      updatedAt: Date.now()
    };
    const nextEntry = {
      presentationId,
      folderPath,
      updatedAt: Date.now(),
      presentation: payload
    };
    const library = loadLocalLibrary();
    const existingIndex = library.presentations.findIndex((entry) => String(entry?.presentationId || "") === presentationId);
    if (existingIndex >= 0) {
      library.presentations[existingIndex] = nextEntry;
    } else {
      library.presentations.push(nextEntry);
    }
    persistLocalLibrary(library);
    return cloneLocalLibrary({ presentations: [nextEntry] }).presentations[0] || null;
  }

  function deleteLocalPresentation(presentationId) {
    const safeId = String(presentationId || "").trim();
    if (!safeId) return false;
    const library = loadLocalLibrary();
    const nextPresentations = library.presentations.filter((entry) => String(entry?.presentationId || "") !== safeId);
    if (nextPresentations.length === library.presentations.length) {
      return false;
    }
    persistLocalLibrary({
      version: 1,
      presentations: nextPresentations
    });
    return true;
  }

  function getLocalPresentation(presentationId) {
    const safeId = String(presentationId || "").trim();
    if (!safeId) return null;
    const entry = listLocalPresentations().find((item) => item.presentationId === safeId);
    return entry ? clone(normalizePresentation(entry.presentation)) : null;
  }

  function createCameraSpanDraft(overrides = {}) {
    return {
      spanId: String(overrides.spanId || "span-001"),
      startMs: Math.max(0, Number(overrides.startMs || 0)),
      endMs: Math.max(0, Number(overrides.endMs || overrides.durationMs || 0)),
      durationMs: Math.max(0, Number(overrides.durationMs || ((Number(overrides.endMs || 0)) - Number(overrides.startMs || 0)))),
      easing: String(overrides.easing || "easeInOutCubic"),
      startPose: clone(normalizePose(overrides.startPose)),
      endPose: clone(normalizePose(overrides.endPose))
    };
  }

  function createSceneDraft(overrides = {}) {
    const now = Date.now();
    return {
      sceneId: String(overrides.sceneId || "scene-001"),
      name: String(overrides.name || "Neue Scene"),
      durationMs: Math.max(0, Number(overrides.durationMs || 0)),
      createdAt: Number(overrides.createdAt || now),
      updatedAt: Number(overrides.updatedAt || now),
      cameraSpans: Array.isArray(overrides.cameraSpans)
        ? overrides.cameraSpans.map((span, index) => createCameraSpanDraft({
          ...span,
          spanId: span?.spanId || `span-${String(index + 1).padStart(3, "0")}`
        }))
        : []
    };
  }

  function createScenePresentationDraft(overrides = {}) {
    return {
      schemaVersion: "scene-presentation-v1",
      presentationId: String(overrides.presentationId || "presentation-001"),
      name: String(overrides.name || "Neue ScenePresentation"),
      mode: String(overrides.mode || "editor"),
      scenes: Array.isArray(overrides.scenes)
        ? overrides.scenes.map((scene, index) => createSceneDraft({
          ...scene,
          sceneId: scene?.sceneId || `scene-${String(index + 1).padStart(3, "0")}`
        }))
        : []
    };
  }

  function createCatalogEntry(presentation) {
    const safePresentation = presentation && typeof presentation === "object" ? presentation : {};
    const firstScene = safePresentation.scenes?.[0] || safePresentation.scene || {};
    const scenes = Array.isArray(safePresentation.scenes) ? safePresentation.scenes : [];
    return Object.freeze({
      id: safePresentation.presentationId,
      presentationId: safePresentation.presentationId,
      name: safePresentation.name,
      previewTitle: safePresentation.previewTitle,
      title: safePresentation.title,
      kicker: safePresentation.kicker,
      summary: safePresentation.summary,
      description: safePresentation.description,
      estimatedDurationLabel: safePresentation.estimatedDurationLabel,
      estimatedDurationMs: safePresentation.estimatedDurationMs,
      tags: Array.isArray(safePresentation.tags) ? safePresentation.tags.slice() : [],
      topicClusterId: String(safePresentation.topicClusterId || ""),
      topicClusterTitle: String(safePresentation.topicClusterTitle || ""),
      presentationType: String(safePresentation.presentationType || ""),
      presentationTypeNotes: String(safePresentation.presentationTypeNotes || ""),
      sourceDatabase: String(safePresentation.sourceDatabase || ""),
      sourceTopicIds: Array.isArray(safePresentation.sourceTopicIds) ? safePresentation.sourceTopicIds.slice() : [],
      sourceTopicLabels: Array.isArray(safePresentation.sourceTopicLabels) ? safePresentation.sourceTopicLabels.slice() : [],
      sourceOberthemaIds: Array.isArray(safePresentation.sourceOberthemaIds) ? safePresentation.sourceOberthemaIds.slice() : [],
      sourceOberthemaLabels: Array.isArray(safePresentation.sourceOberthemaLabels) ? safePresentation.sourceOberthemaLabels.slice() : [],
      coverageMode: String(safePresentation.coverageMode || ""),
      derivedSubtopicKey: String(safePresentation.derivedSubtopicKey || ""),
      derivedSubtopicTitle: String(safePresentation.derivedSubtopicTitle || ""),
      coverageNotes: String(safePresentation.coverageNotes || ""),
      thumbnail: safePresentation.thumbnail ? clone(safePresentation.thumbnail) : null,
      sceneCount: scenes.length,
      spanCount: scenes.reduce((sum, scene) => sum + (Array.isArray(scene.cameraSpans) ? scene.cameraSpans.length : 0), 0),
      cueCount: Array.isArray(firstScene.cues) ? firstScene.cues.length : 0
    });
  }

  const RAW_PRESENTATIONS = Object.freeze([
    Object.freeze({
      id: "raid0_network_io_demo",
      kicker: "Babylon Presenter",
      previewTitle: "Erster Prototyp",
      ctaLabel: "RAID-Animation starten",
      title: "RAID 0: Netzwerk, DMA, Striping, Cache-Miss",
      summary: "Eine Datei kommt ueber die NIC ins System, landet per DMA im RAM, wird im RAID 0 in 64-KiB-Stripe-Elemente zerlegt und parallel auf zwei HDDs geschrieben und wieder gelesen.",
      description: "Hardware-nahe Demo mit zwei HDDs, RAID 0 ohne Redundanz, sichtbarem DMA-Pfad, Page Cache, Striping und parallelem Lesen bei bewusstem Cache-Miss.",
      estimatedDurationLabel: "ca. 01:18",
      tags: Object.freeze(["RAID 0", "DMA", "Cache-Miss"]),
      coverageMode: "unknown",
      coverageNotes: "Noch keine belastbare Zuordnung zu einem thema_objekt in der Kerndatenbank gepflegt.",
      thumbnail: Object.freeze({
        kind: "hardware-raid0",
        accentStart: "#73f2ff",
        accentEnd: "#ff9c57",
        pathNodes: Object.freeze(["LAN", "NIC", "RAM", "RAID 0", "2x HDD"])
      }),
      scene: Object.freeze({
        kind: "raid0_hardware_story",
        locale: "de-DE",
        durationMs: 78000,
        stripeSizeLabel: "64 KiB Stripe-Elemente",
        fileLabel: "Datei F",
        logicalVolumeLabel: "Logisches Laufwerk RAID 0",
        blockIds: Object.freeze(["A", "B", "C", "D"]),
        palette: Object.freeze({
          backgroundTop: "#081529",
          backgroundBottom: "#030713",
          floor: "#0a1629",
          floorLine: "#17375c",
          chassisBase: "#101f3b",
          chassisAccent: "#6fe6ff",
          cpuBase: "#7f98ff",
          ramBase: "#6ff5cf",
          nicBase: "#72dbff",
          raidBase: "#ffb15b",
          diskShell: "#d7e2ff",
          diskCore: "#8fa4cf",
          label: "#eff6ff",
          pageCache: "#46c9ff",
          dataSignal: "#ff9b4d",
          requestSignal: "#f4f8ff",
          statusSignal: "#74f7b2",
          danger: "#ff5f72",
          conduitBase: "#21406a"
        }),
        layout: Object.freeze({
          lan: Object.freeze([-15.8, 2.9, 0]),
          nic: Object.freeze([-11.45, 2.85, 0]),
          cpu: Object.freeze([-5.35, 4.55, -0.15]),
          ram: Object.freeze([-5.05, 1.82, 0.18]),
          raid: Object.freeze([1.55, 2.7, 0]),
          disk0: Object.freeze([11.2, 3.25, -4.25]),
          disk1: Object.freeze([11.2, 3.25, 4.25])
        }),
        camera: Object.freeze({
          alpha: -1.08,
          beta: 1.05,
          radius: 29,
          target: Object.freeze([0, 2.9, 0])
        }),
        cues: Object.freeze([
          Object.freeze({
            id: "cue_overview",
            nodeId: "RAID 0",
            title: "Aufbau: logisches RAID-0-Volume",
            caption: "CPU, RAM, NIC, RAID-0-Schicht und zwei HDDs werden als ein gemeinsamer Datenpfad gezeigt.",
            startMs: 0,
            endMs: 4500,
            camera: Object.freeze({
              alpha: -1.05,
              beta: 1.0,
              radius: 29,
              target: Object.freeze([0.8, 2.9, 0])
            })
          }),
          Object.freeze({
            id: "cue_network_ingress",
            nodeId: "NIC",
            title: "Die Datei kommt ueber das Netzwerk an",
            caption: "Orange Paketpulse laufen durchs LAN in die Netzwerkkarte. Noch geht nichts direkt auf die Platten.",
            startMs: 4500,
            endMs: 9000,
            camera: Object.freeze({
              alpha: -1.58,
              beta: 1.04,
              radius: 18.5,
              target: Object.freeze([-11.2, 2.7, 0])
            })
          }),
          Object.freeze({
            id: "cue_dma_irq",
            nodeId: "DMA + IRQ",
            title: "NIC kopiert per DMA in den RAM",
            caption: "Orange Daten gehen per DMA in den RAM, ein gruener IRQ-Impuls meldet der CPU den Status.",
            startMs: 9000,
            endMs: 14000,
            camera: Object.freeze({
              alpha: -1.34,
              beta: 1.0,
              radius: 19.5,
              target: Object.freeze([-7.6, 2.8, 0])
            })
          }),
          Object.freeze({
            id: "cue_os_assembly",
            nodeId: "CPU / OS / App",
            title: "OS und App setzen die Datei zusammen",
            caption: "Im RAM werden aus den Netzwerkdaten die eigentlichen Dateibloecke. Erst hier wird aus Paketen wieder Datei F.",
            startMs: 14000,
            endMs: 18500,
            camera: Object.freeze({
              alpha: -1.14,
              beta: 0.96,
              radius: 18,
              target: Object.freeze([-5.4, 3.1, 0])
            })
          }),
          Object.freeze({
            id: "cue_page_cache",
            nodeId: "Page Cache",
            title: "Buffered Write landet zuerst im RAM-Cache",
            caption: "Datei F wird als dirty im Page Cache markiert, bevor ueberhaupt ein physischer Schreibvorgang startet.",
            startMs: 18500,
            endMs: 23000,
            camera: Object.freeze({
              alpha: -1.04,
              beta: 1.02,
              radius: 17.2,
              target: Object.freeze([-4.7, 2.1, 0.2])
            })
          }),
          Object.freeze({
            id: "cue_raid_split",
            nodeId: "Dateisystem + RAID 0",
            title: "Die RAID-0-Schicht zerlegt den Datenstrom",
            caption: "Aus Datei F werden gleich grosse Stripe-Elemente A, B, C und D mit 64 KiB pro Element.",
            startMs: 23000,
            endMs: 28500,
            camera: Object.freeze({
              alpha: -0.98,
              beta: 0.94,
              radius: 17.8,
              target: Object.freeze([0.6, 2.75, 0])
            })
          }),
          Object.freeze({
            id: "cue_striping",
            nodeId: "Striping",
            title: "A C auf Disk 0, B D auf Disk 1",
            caption: "Die Stripe-Elemente werden abwechselnd auf beide Laufwerke verteilt.",
            startMs: 28500,
            endMs: 34500,
            camera: Object.freeze({
              alpha: -0.9,
              beta: 0.96,
              radius: 20.5,
              target: Object.freeze([4.7, 2.9, 0])
            })
          }),
          Object.freeze({
            id: "cue_parallel_write",
            nodeId: "Parallel Write",
            title: "Beide HDDs schreiben gleichzeitig",
            caption: "Orange Datenpfade laufen parallel in beide Drives. Genau das ist der Performance-Effekt von RAID 0.",
            startMs: 34500,
            endMs: 40000,
            camera: Object.freeze({
              alpha: -0.84,
              beta: 0.94,
              radius: 18.8,
              target: Object.freeze([8.6, 3.15, 0])
            })
          }),
          Object.freeze({
            id: "cue_hdd_inside",
            nodeId: "HDD Innenleben",
            title: "Im Laufwerk arbeitet Controller, Kopf und Platter",
            caption: "Die Animation zeigt vereinfacht: Block rein, Kopf positioniert sich, markierte Sektoren leuchten kurz auf.",
            startMs: 40000,
            endMs: 47000,
            camera: Object.freeze({
              alpha: -0.56,
              beta: 0.92,
              radius: 14.2,
              target: Object.freeze([11.1, 3.35, 0])
            })
          }),
          Object.freeze({
            id: "cue_write_complete",
            nodeId: "Completion",
            title: "Schreiben abgeschlossen",
            caption: "Gruene Statussignale wandern von beiden Drives ueber die RAID-Schicht zur CPU zurueck.",
            startMs: 47000,
            endMs: 52000,
            camera: Object.freeze({
              alpha: -0.98,
              beta: 0.98,
              radius: 22,
              target: Object.freeze([3.5, 3.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_cache_miss",
            nodeId: "Cache Miss",
            title: "Lesen startet absichtlich ohne RAM-Hit",
            caption: "Der Cache wird ausgegraut. Die Anwendung muss die Datei jetzt wirklich von den HDDs holen.",
            startMs: 52000,
            endMs: 57000,
            camera: Object.freeze({
              alpha: -1.02,
              beta: 0.98,
              radius: 18.2,
              target: Object.freeze([-1.5, 2.8, 0])
            })
          }),
          Object.freeze({
            id: "cue_parallel_read",
            nodeId: "Parallel Read",
            title: "RAID 0 liest A C und B D parallel",
            caption: "Weisse Requests gehen raus, orange Daten kommen gleichzeitig von beiden Laufwerken in den RAM zurueck.",
            startMs: 57000,
            endMs: 64500,
            camera: Object.freeze({
              alpha: -0.86,
              beta: 0.95,
              radius: 18.8,
              target: Object.freeze([6.8, 3.05, 0])
            })
          }),
          Object.freeze({
            id: "cue_reassemble",
            nodeId: "Reassembly",
            title: "Im RAM entsteht wieder die lineare Datei",
            caption: "Die Stripe-Elemente werden in der Reihenfolge A, B, C, D zusammengesetzt, erst dann bekommt die App die Datei.",
            startMs: 64500,
            endMs: 71000,
            camera: Object.freeze({
              alpha: -1.12,
              beta: 0.98,
              radius: 18,
              target: Object.freeze([-3.8, 2.65, 0])
            })
          }),
          Object.freeze({
            id: "cue_risk",
            nodeId: "Risiko",
            title: "Schnell, aber ohne Sicherheit",
            caption: "Faellt eine einzige Platte aus, wird das gesamte RAID-0-Volume unbrauchbar.",
            startMs: 71000,
            endMs: 78000,
            camera: Object.freeze({
              alpha: -1.02,
              beta: 0.92,
              radius: 24.5,
              target: Object.freeze([2.2, 3.15, 0])
            })
          })
        ]),
        ttsSegments: Object.freeze([
          Object.freeze({
            id: "tts_overview",
            startMs: 350,
            text: "RAID null verbindet mehrere physische Laufwerke zu einem logischen Volume. Die Daten werden in gleich grosse Stuecke zerlegt und abwechselnd auf die Laufwerke verteilt. Es gibt dabei keine Spiegelung und keine Paritaet."
          }),
          Object.freeze({
            id: "tts_network_ingress",
            startMs: 4700,
            text: "Die Datei kommt nicht direkt in die Festplatte. Zuerst empfaengt die Netzwerkkarte die Pakete."
          }),
          Object.freeze({
            id: "tts_dma_irq",
            startMs: 9300,
            text: "Die Netzwerkkarte kopiert die Paketdaten per Direct Memory Access direkt in den Arbeitsspeicher. Danach meldet sie dem Betriebssystem, wo die Daten liegen."
          }),
          Object.freeze({
            id: "tts_os_assembly",
            startMs: 14300,
            text: "Jetzt verarbeitet das Betriebssystem die Netzpakete. Die Anwendung bekommt daraus den eigentlichen Dateiinhalt."
          }),
          Object.freeze({
            id: "tts_page_cache",
            startMs: 18800,
            text: "Im ueblichen buffered I O Pfad landet ein Schreibzugriff zuerst im RAM Cache. Von dort wird er anschliessend auf das Speichersystem geschrieben."
          }),
          Object.freeze({
            id: "tts_raid_split",
            startMs: 23400,
            text: "Die RAID null Schicht nimmt den linearen Datenstrom und zerlegt ihn in gleich grosse Stripe Elemente."
          }),
          Object.freeze({
            id: "tts_striping",
            startMs: 28900,
            text: "Bei zwei Laufwerken wird abwechselnd verteilt. Das erste Stueck geht auf Laufwerk null, das zweite auf Laufwerk eins, das dritte wieder auf Laufwerk null und das vierte wieder auf Laufwerk eins."
          }),
          Object.freeze({
            id: "tts_parallel_write",
            startMs: 34900,
            text: "Der Vorteil: Beide Laufwerke koennen gleichzeitig arbeiten. Genau das ist der Performance Gedanke von RAID null."
          }),
          Object.freeze({
            id: "tts_hdd_inside",
            startMs: 40400,
            text: "Fuer die Animation reicht diese Vereinfachung: Der Laufwerkscontroller uebernimmt den Block, positioniert den Kopf und schreibt die Daten an die zugewiesenen Sektoren."
          }),
          Object.freeze({
            id: "tts_write_complete",
            startMs: 47400,
            text: "Sind die Stripe Elemente geschrieben, melden die Laufwerke die Operation als abgeschlossen zurueck."
          }),
          Object.freeze({
            id: "tts_cache_miss",
            startMs: 52400,
            text: "Damit die Laufwerke sichtbar arbeiten, gehen wir jetzt von einem Cache Miss aus. Sonst koennte der Inhalt direkt aus dem RAM kommen."
          }),
          Object.freeze({
            id: "tts_parallel_read",
            startMs: 57500,
            text: "Beim Lesen fragt die RAID null Schicht die benoetigten Stripe Elemente auf beiden Laufwerken parallel an."
          }),
          Object.freeze({
            id: "tts_reassemble",
            startMs: 64900,
            text: "Die zurueckgelesenen Teile werden wieder in die urspruengliche Reihenfolge gebracht. Erst danach sieht die Anwendung wieder die komplette Datei."
          }),
          Object.freeze({
            id: "tts_risk",
            startMs: 71400,
            text: "RAID null ist schnell, aber riskant. Faellt nur ein einziges Laufwerk aus, ist das gesamte Volume unbrauchbar."
          })
        ])
      })
    }),
    Object.freeze({
      id: "symmetric_encryption_3min",
      kicker: "Babylon Presenter",
      previewTitle: "Derselbe Schluessel auf beiden Seiten",
      ctaLabel: "Krypto-Demo starten",
      title: "Synchrone Verschluesselung in 3 Minuten",
      summary: "Synchrone Verschluesselung meint hier: Sender und Empfaenger nutzen denselben geheimen Schluessel. Klartext wird zu Geheimtext, reist durchs unsichere Netz und wird nur mit genau diesem Schluessel wieder lesbar.",
      description: "Kurze Schema-Demo zur sogenannten synchronen Verschluesselung mit gemeinsamem geheimem Schluessel auf beiden Seiten. Fachsprachlich ist damit in der Regel symmetrische Verschluesselung gemeint.",
      estimatedDurationLabel: "ca. 03:20",
      tags: Object.freeze(["Kryptografie", "Schluessel", "Synchron", "Symmetrisch"]),
      topicClusterId: "verschluesselung",
      topicClusterTitle: "Verschluesselung",
      presentationType: "sender_receiver_flow",
      presentationTypeNotes: "Klarer Sender-Empfaenger-Fluss mit sichtbarer Umwandlung von Klartext zu Geheimtext, Angreifer-Sicht und Schluesselproblem als Hauptkonflikt.",
      sourceDatabase: "backend/QuizMaster/output/quizmaster.sqlite",
      sourceTopicIds: Object.freeze(["sec_verschluesselung"]),
      sourceTopicLabels: Object.freeze(["Verschluesselung"]),
      sourceOberthemaIds: Object.freeze(["it_sicherheit_und_datenschutz"]),
      sourceOberthemaLabels: Object.freeze(["IT-Sicherheit und Datenschutz"]),
      coverageMode: "partial",
      derivedSubtopicKey: "symmetrische_verschluesselung",
      derivedSubtopicTitle: "Symmetrische Verschluesselung",
      coverageNotes: "User-facing Titel und Sprechertext verwenden hier bewusst 'synchrone Verschluesselung' fuer den Fall eines gemeinsamen geheimen Schluessels. Fachlich bleibt dies eine partielle Abdeckung des breiten Thema-Objekts 'Verschluesselung' im Sinn symmetrischer Verschluesselung.",
      thumbnail: Object.freeze({
        accentStart: "#73f2ff",
        accentEnd: "#9f7cff",
        pathNodes: Object.freeze(["Sender", "Schluessel", "Geheimtext", "Netz", "Empfaenger"])
      }),
      scene: Object.freeze({
        kind: "symmetric_crypto_story",
        locale: "de-DE",
        durationMs: 200000,
        messagePlain: "Treffen um 15 Uhr",
        messageCipher: "8A F2 91 C4 7B 11 0D EE",
        messageCipherShort: "8A F2 91 C4 ...",
        wrongKeyText: "FEHLER / DATENMUELL",
        finalQuote: "Nicht das Netz muss geheim sein.\nDer Schluessel muss geheim bleiben.",
        palette: Object.freeze({
          backgroundTop: "#07101f",
          backgroundBottom: "#02050d",
          stageLine: "#17375c",
          senderBase: "#4fbef7",
          receiverBase: "#78f2c1",
          cryptoBase: "#9f7cff",
          networkBase: "#ffb15b",
          attackerBase: "#ff6a7a",
          vaultBase: "#d7e2ff",
          safePath: "#6be99c",
          unsafePath: "#ff6a7a",
          keyBase: "#ffe082",
          plaintext: "#f4f8ff",
          ciphertext: "#9fd0ff",
          label: "#eff6ff",
          subtle: "#9aa9c7"
        }),
        layout: Object.freeze({
          sender: Object.freeze([-12, 2.1, 0]),
          encrypt: Object.freeze([-5.2, 2.1, 0]),
          network: Object.freeze([0, 2.1, 0]),
          decrypt: Object.freeze([5.2, 2.1, 0]),
          receiver: Object.freeze([12, 2.1, 0]),
          attacker: Object.freeze([0, -2.45, 0]),
          vault: Object.freeze([9.2, -2.2, -0.4]),
          quote: Object.freeze([0, 5.3, 0])
        }),
        camera: Object.freeze({
          alpha: -1.34,
          beta: 0.94,
          radius: 30.4,
          target: Object.freeze([0, 1.68, -0.05])
        }),
        cues: Object.freeze([
          Object.freeze({
            id: "cue_problem",
            nodeId: "Grundproblem",
            title: "Das Grundproblem",
            caption: "Ohne Verschluesselung ist eine lesbare Nachricht im offenen Netz fuer den Angreifer sichtbar. Danach erscheint der gemeinsame Schluessel, und dieselbe Nachricht kippt vor dem Versand in Geheimtext um.",
            startMs: 0,
            endMs: 20000,
            camera: Object.freeze({
              alpha: -1.34,
              beta: 0.94,
              radius: 30.4,
              target: Object.freeze([0, 1.68, -0.05])
            })
          }),
          Object.freeze({
            id: "cue_shared_key_principle",
            nodeId: "Derselbe Schluessel",
            title: "Was hier synchron bedeutet",
            caption: "Hier bedeutet synchron nicht gleichzeitig. Gemeint ist: Beide Seiten arbeiten mit demselben Schluessel, links zum Verschluesseln und rechts zum Entschluesseln.",
            startMs: 20000,
            endMs: 45000,
            camera: Object.freeze({
              alpha: -1.56,
              beta: 0.94,
              radius: 24,
              target: Object.freeze([0, 2.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_sender_encrypt",
            nodeId: "Sender",
            title: "Verschluesselung beim Sender",
            caption: "Lesbarer Klartext und geheimer Schluessel laufen gemeinsam in die Crypto-Box. Heraus kommt unleserlicher Geheimtext.",
            startMs: 45000,
            endMs: 80000,
            camera: Object.freeze({
              alpha: -1.82,
              beta: 1.0,
              radius: 16.8,
              target: Object.freeze([-5.3, 2.15, 0])
            })
          }),
          Object.freeze({
            id: "cue_cipher_transport",
            nodeId: "Transport",
            title: "Transport durchs Netz",
            caption: "Durchs unsichere Netz wandert nur noch Geheimtext. Der Angreifer sieht zwar Daten, aber keinen lesbaren Klartext.",
            startMs: 80000,
            endMs: 105000,
            camera: Object.freeze({
              alpha: -1.55,
              beta: 1.06,
              radius: 18.2,
              target: Object.freeze([0.2, 1.3, 0])
            })
          }),
          Object.freeze({
            id: "cue_receiver_decrypt",
            nodeId: "Empfaenger",
            title: "Entschluesselung beim Empfaenger",
            caption: "Nur mit demselben geheimen Schluessel wird aus Geheimtext wieder Klartext. Ein falscher Schluessel liefert nur Muell.",
            startMs: 105000,
            endMs: 140000,
            camera: Object.freeze({
              alpha: -1.18,
              beta: 1.0,
              radius: 16.8,
              target: Object.freeze([5.5, 2.05, 0])
            })
          }),
          Object.freeze({
            id: "cue_key_security",
            nodeId: "Schluesseldiebstahl",
            title: "Der entscheidende Schutzpunkt",
            caption: "Nicht der Algorithmus muss geheim sein, sondern der Schluessel. Wird er gestohlen, wird abgefangener Geheimtext wieder lesbar.",
            startMs: 140000,
            endMs: 165000,
            camera: Object.freeze({
              alpha: -0.98,
              beta: 1.02,
              radius: 18,
              target: Object.freeze([6.6, 0.3, -0.2])
            })
          }),
          Object.freeze({
            id: "cue_key_exchange_weakness",
            nodeId: "Schluesselaustausch",
            title: "Die groesste Schwaeche ist der Austausch",
            caption: "Beide Seiten brauchen denselben Schluessel schon vorher. Ein unsicherer Austausch gefaehrdet das ganze Verfahren sofort.",
            startMs: 165000,
            endMs: 185000,
            camera: Object.freeze({
              alpha: -1.56,
              beta: 1.08,
              radius: 22,
              target: Object.freeze([0, 1.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_finale",
            nodeId: "Fazit",
            title: "Fazit",
            caption: "Synchrone Verschluesselung ist schnell und praktisch, aber nur solange der gemeinsame geheime Schluessel wirklich geheim bleibt.",
            startMs: 185000,
            endMs: 200000,
            camera: Object.freeze({
              alpha: -1.5,
              beta: 0.92,
              radius: 26,
              target: Object.freeze([0, 2.2, 0])
            })
          })
        ]),
        ttsSegments: Object.freeze([
          Object.freeze({
            id: "tts_problem_1",
            startMs: 300,
            text: "Wenn Daten offen ueber ein Netzwerk uebertragen werden, koennen andere sie mitlesen."
          }),
          Object.freeze({
            id: "tts_problem_2",
            startMs: 7200,
            text: "Genau deshalb braucht man Verschluesselung."
          }),
          Object.freeze({
            id: "tts_problem_3",
            startMs: 12800,
            text: "Bei der synchronen Verschluesselung nutzen Sender und Empfaenger denselben geheimen Schluessel."
          }),
          Object.freeze({
            id: "tts_principle_1",
            startMs: 20500,
            text: "Hier bedeutet synchron nicht gleichzeitig."
          }),
          Object.freeze({
            id: "tts_principle_2",
            startMs: 29200,
            text: "Gemeint ist: Beide Seiten arbeiten mit demselben Schluessel. Der Sender verschluesselt damit, und der Empfaenger entschluesselt mit genau diesem gleichen Schluessel wieder zurueck."
          }),
          Object.freeze({
            id: "tts_sender_1",
            startMs: 45500,
            text: "Der Sender hat einen lesbaren Klartext."
          }),
          Object.freeze({
            id: "tts_sender_2",
            startMs: 52600,
            text: "Zum Beispiel: Treffen um 15 Uhr. Diese Daten gehen in einen Verschluesselungsalgorithmus, waehrend gleichzeitig der geheime Schluessel verwendet wird."
          }),
          Object.freeze({
            id: "tts_sender_3",
            startMs: 62500,
            text: "Der Algorithmus verarbeitet beides zusammen."
          }),
          Object.freeze({
            id: "tts_sender_4",
            startMs: 68800,
            text: "Das Ergebnis ist Geheimtext, also unlesbare Daten."
          }),
          Object.freeze({
            id: "tts_transport_1",
            startMs: 80500,
            text: "Jetzt wird nur noch der Geheimtext uebertragen."
          }),
          Object.freeze({
            id: "tts_transport_2",
            startMs: 88000,
            text: "Ein Angreifer kann die Daten zwar abfangen, aber ohne den Schluessel kann er mit dem Inhalt nichts Sinnvolles anfangen."
          }),
          Object.freeze({
            id: "tts_receiver_1",
            startMs: 105500,
            text: "Der Empfaenger bekommt den Geheimtext."
          }),
          Object.freeze({
            id: "tts_receiver_2",
            startMs: 112700,
            text: "Jetzt nutzt er denselben geheimen Schluessel."
          }),
          Object.freeze({
            id: "tts_receiver_3",
            startMs: 119600,
            text: "Nur dann kann der Entschluesselungsalgorithmus die urspruengliche Nachricht wieder korrekt herstellen."
          }),
          Object.freeze({
            id: "tts_receiver_4",
            startMs: 128600,
            text: "Mit einem falschen Schluessel entsteht nur Muell."
          }),
          Object.freeze({
            id: "tts_security_1",
            startMs: 140500,
            text: "Die Sicherheit haengt nicht daran, dass der Algorithmus geheim ist."
          }),
          Object.freeze({
            id: "tts_security_2",
            startMs: 147000,
            text: "Der Algorithmus darf sichtbar sein."
          }),
          Object.freeze({
            id: "tts_security_3",
            startMs: 152800,
            text: "Entscheidend ist, dass der Schluessel geheim bleibt."
          }),
          Object.freeze({
            id: "tts_security_4",
            startMs: 158300,
            text: "Wird der Schluessel gestohlen, kann ein Angreifer abgefangene Daten wieder lesbar machen."
          }),
          Object.freeze({
            id: "tts_exchange_1",
            startMs: 165400,
            text: "Die groesste Schwaeche ist der Schluesselaustausch."
          }),
          Object.freeze({
            id: "tts_exchange_2",
            startMs: 172600,
            text: "Beide Seiten brauchen denselben Schluessel schon vorher."
          }),
          Object.freeze({
            id: "tts_exchange_3",
            startMs: 177800,
            text: "Wenn dieser Austausch unsicher ist, ist das ganze Verfahren gefaehrdet."
          }),
          Object.freeze({
            id: "tts_finale_1",
            startMs: 185400,
            text: "Synchrone Verschluesselung bedeutet also: Ein gemeinsamer geheimer Schluessel schuetzt die Daten auf beiden Seiten."
          }),
          Object.freeze({
            id: "tts_finale_2",
            startMs: 191500,
            text: "Das Verfahren ist schnell und praktisch."
          }),
          Object.freeze({
            id: "tts_finale_3",
            startMs: 196000,
            text: "Aber nur solange der Schluessel wirklich geheim bleibt."
          })
        ])
      })
    }),
    Object.freeze({
      id: "asymmetric_encryption_3min",
      kicker: "Babylon Presenter",
      previewTitle: "Zwei Schluessel statt einem",
      ctaLabel: "Asymmetrische Demo starten",
      title: "Asymmetrische Verschluesselung in 3 Minuten",
      summary: "Der Empfaenger besitzt ein Schluesselpaar. Mit dem oeffentlichen Schluessel wird verschluesselt, aber nur der private Schluessel kann die Nachricht wieder lesbar machen.",
      description: "Schema-Demo zur asymmetrischen Verschluesselung mit oeffentlichem und privatem Schluessel, entschaerftem Schluesselaustausch und dem Praxis-Hinweis, dass grosse Datenmengen meist nicht rein asymmetrisch uebertragen werden.",
      estimatedDurationLabel: "ca. 03:20",
      tags: Object.freeze(["Kryptografie", "Schluesselpaar", "Asymmetrisch", "Public Key"]),
      topicClusterId: "verschluesselung",
      topicClusterTitle: "Verschluesselung",
      presentationType: "problem_to_solution",
      presentationTypeNotes: "Problem-zur-Loesung-Aufbau: erst das Austauschproblem des Shared Keys, dann das Schluesselpaar als Loesung und schliesslich der Performance-Kompromiss.",
      sourceDatabase: "backend/QuizMaster/output/quizmaster.sqlite",
      sourceTopicIds: Object.freeze(["sec_verschluesselung"]),
      sourceTopicLabels: Object.freeze(["Verschluesselung"]),
      sourceOberthemaIds: Object.freeze(["it_sicherheit_und_datenschutz"]),
      sourceOberthemaLabels: Object.freeze(["IT-Sicherheit und Datenschutz"]),
      coverageMode: "partial",
      derivedSubtopicKey: "asymmetrische_verschluesselung",
      derivedSubtopicTitle: "Asymmetrische Verschluesselung",
      coverageNotes: "Diese Praesentation deckt die asymmetrische Seite des breiten Thema-Objekts 'Verschluesselung' ab. Fuer grosse Datenmengen verweist sie bewusst auf hybride Praxis mit spaeterem symmetrischem Datenstrom.",
      thumbnail: Object.freeze({
        accentStart: "#73f2ff",
        accentEnd: "#ffd26f",
        pathNodes: Object.freeze(["PUB", "Geheimtext", "PRIV", "Empfaenger"])
      }),
      scene: Object.freeze({
        kind: "asymmetric_crypto_story",
        locale: "de-DE",
        durationMs: 200000,
        messagePlain: "Treffen um 15 Uhr",
        messageCipher: "5D 81 2A 93 C1 07 F4 B8",
        messageCipherShort: "5D 81 2A ...",
        wrongKeyText: "Mit PUB\nnicht lesbar",
        finalQuote: "Oeffentlich verschluesseln.\nPrivat entschluesseln.",
        principleText: "Oeffentlicher Schluessel darf verteilt werden\nPrivater Schluessel bleibt geheim\nMit PUB verschluesseln, nur PRIV entschluesseln",
        performanceBoardText: "Asymmetrisch: loest den Schluesselaustausch\nFuer grosse Datenmengen meist langsamer\nPraxis: oft nur fuer Sitzungsschluessel",
        finaleSchemaText: "Oeffentlicher Schluessel -> frei verteilt\nNachricht -> damit verschluesselt\nPrivater Schluessel -> lokal geheim\nEntschluesselung nur beim Empfaenger",
        publicKeyText: "Oeffentlicher\nSchluessel",
        privateKeyText: "Privater\nSchluessel",
        palette: Object.freeze({
          backgroundTop: "#07101f",
          backgroundBottom: "#02050d",
          stageLine: "#17375c",
          senderBase: "#4fbef7",
          receiverBase: "#78f2c1",
          cryptoBase: "#6f86ff",
          networkBase: "#ffb15b",
          attackerBase: "#ff6a7a",
          vaultBase: "#d7e2ff",
          safePath: "#73f2ff",
          unsafePath: "#ff6a7a",
          keyBase: "#ffd26f",
          plaintext: "#f4f8ff",
          ciphertext: "#9fd0ff",
          label: "#eff6ff",
          subtle: "#9aa9c7"
        }),
        layout: Object.freeze({
          sender: Object.freeze([-12, 2.1, 0]),
          encrypt: Object.freeze([-5.2, 2.1, 0]),
          network: Object.freeze([0, 2.1, 0]),
          decrypt: Object.freeze([5.2, 2.1, 0]),
          receiver: Object.freeze([12, 2.1, 0]),
          attacker: Object.freeze([0, -2.45, 0]),
          vault: Object.freeze([9.2, -2.2, -0.4]),
          quote: Object.freeze([0, 5.3, 0])
        }),
        camera: Object.freeze({
          alpha: -1.35,
          beta: 0.98,
          radius: 29,
          target: Object.freeze([0, 1.9, 0])
        }),
        cues: Object.freeze([
          Object.freeze({
            id: "cue_problem",
            nodeId: "Problem",
            title: "Warum zwei Schluessel?",
            caption: "Beim alten Shared-Key-Modell muesste derselbe geheime Schluessel durchs unsichere Netz. Danach kippt das Bild auf ein Schluesselpaar aus oeffentlich und privat.",
            startMs: 0,
            endMs: 20000,
            camera: Object.freeze({
              alpha: -1.32,
              beta: 0.98,
              radius: 29,
              target: Object.freeze([0, 1.9, 0])
            })
          }),
          Object.freeze({
            id: "cue_shared_key_principle",
            nodeId: "Schluesselpaar",
            title: "Die Grundidee",
            caption: "Asymmetrisch bedeutet: Ein Schluessel darf offen verteilt werden, der andere bleibt streng privat. Was mit PUB verschluesselt wird, macht nur PRIV wieder lesbar.",
            startMs: 20000,
            endMs: 45000,
            camera: Object.freeze({
              alpha: -1.56,
              beta: 0.94,
              radius: 24,
              target: Object.freeze([0, 2.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_sender_encrypt",
            nodeId: "Sender",
            title: "Verschluesselung beim Sender",
            caption: "Der Sender nimmt den oeffentlichen Schluessel des Empfaengers, kombiniert ihn mit dem Klartext und erzeugt daraus Geheimtext.",
            startMs: 45000,
            endMs: 80000,
            camera: Object.freeze({
              alpha: -1.82,
              beta: 1.0,
              radius: 16.8,
              target: Object.freeze([-5.3, 2.15, 0])
            })
          }),
          Object.freeze({
            id: "cue_cipher_transport",
            nodeId: "Netz",
            title: "Geheimtext im offenen Netz",
            caption: "Ein Angreifer kann den Geheimtext abfangen und sogar den oeffentlichen Schluessel kennen. Trotzdem reicht das noch nicht, um die Nachricht lesbar zu machen.",
            startMs: 80000,
            endMs: 100000,
            camera: Object.freeze({
              alpha: -1.55,
              beta: 1.06,
              radius: 18.2,
              target: Object.freeze([0.2, 1.3, 0])
            })
          }),
          Object.freeze({
            id: "cue_receiver_decrypt",
            nodeId: "Empfaenger",
            title: "Entschluesselung beim Empfaenger",
            caption: "Erst der private Schluessel des Empfaengers passt zur zweiten Crypto-Box und macht aus Geheimtext wieder den urspruenglichen Klartext.",
            startMs: 100000,
            endMs: 130000,
            camera: Object.freeze({
              alpha: -1.18,
              beta: 1.0,
              radius: 16.8,
              target: Object.freeze([5.5, 2.05, 0])
            })
          }),
          Object.freeze({
            id: "cue_key_security",
            nodeId: "Vorteil",
            title: "Der Vorteil beim Austausch",
            caption: "Der private Schluessel muss nie durchs Netz. Nur der oeffentliche Schluessel wird verteilt, und genau das entschaerft das Austauschproblem deutlich.",
            startMs: 130000,
            endMs: 155000,
            camera: Object.freeze({
              alpha: -1.02,
              beta: 1.02,
              radius: 18,
              target: Object.freeze([6.7, 0.6, -0.15])
            })
          }),
          Object.freeze({
            id: "cue_performance_tradeoff",
            nodeId: "Nachteil",
            title: "Warum man es nicht fuer alles nutzt",
            caption: "Asymmetrische Verfahren sind bei grossen Datenmengen meist langsamer. In der Praxis werden deshalb oft nur kleine Sitzungsschluessel asymmetrisch uebertragen und die eigentlichen Daten danach symmetrisch geschuetzt.",
            startMs: 155000,
            endMs: 180000,
            camera: Object.freeze({
              alpha: -1.48,
              beta: 1.0,
              radius: 22,
              target: Object.freeze([0, 1.8, 0])
            })
          }),
          Object.freeze({
            id: "cue_finale",
            nodeId: "Fazit",
            title: "Fazit",
            caption: "Asymmetrische Verschluesselung heisst: oeffentlich verschluesseln, privat entschluesseln. Das loest das Austauschproblem besser, ist aber fuer grosse Datenmengen meist nicht die schnellste Wahl.",
            startMs: 180000,
            endMs: 200000,
            camera: Object.freeze({
              alpha: -1.5,
              beta: 0.92,
              radius: 26,
              target: Object.freeze([0, 2.2, 0])
            })
          })
        ]),
        ttsSegments: Object.freeze([
          Object.freeze({
            id: "tts_problem_1",
            startMs: 400,
            text: "Bei der symmetrischen Verschluesselung gibt es ein Problem. Beide Seiten brauchen denselben geheimen Schluessel."
          }),
          Object.freeze({
            id: "tts_problem_2",
            startMs: 8600,
            text: "Aber wie tauscht man diesen sicher aus?"
          }),
          Object.freeze({
            id: "tts_problem_3",
            startMs: 13800,
            text: "Genau dafuer ist die asymmetrische Verschluesselung wichtig. Hier gibt es nicht einen, sondern zwei verschiedene Schluessel."
          }),
          Object.freeze({
            id: "tts_principle_1",
            startMs: 20400,
            text: "Asymmetrisch bedeutet: Es gibt ein Schluesselpaar. Einen oeffentlichen Schluessel und einen privaten Schluessel."
          }),
          Object.freeze({
            id: "tts_principle_2",
            startMs: 28800,
            text: "Der oeffentliche Schluessel darf verteilt werden. Der private Schluessel bleibt streng geheim."
          }),
          Object.freeze({
            id: "tts_principle_3",
            startMs: 36600,
            text: "Was mit dem oeffentlichen Schluessel verschluesselt wird, kann nur mit dem passenden privaten Schluessel wieder entschluesselt werden."
          }),
          Object.freeze({
            id: "tts_sender_1",
            startMs: 45500,
            text: "Der Sender will eine Nachricht an den Empfaenger senden."
          }),
          Object.freeze({
            id: "tts_sender_2",
            startMs: 54800,
            text: "Dazu nimmt er den oeffentlichen Schluessel des Empfaengers."
          }),
          Object.freeze({
            id: "tts_sender_3",
            startMs: 67600,
            text: "Mit diesem Schluessel verschluesselt er die Nachricht. Das Ergebnis ist Geheimtext."
          }),
          Object.freeze({
            id: "tts_transport_1",
            startMs: 80500,
            text: "Jetzt wird der Geheimtext uebertragen. Ein Angreifer kann die Daten abfangen."
          }),
          Object.freeze({
            id: "tts_transport_2",
            startMs: 90200,
            text: "Aber der oeffentliche Schluessel allein reicht nicht aus, um die Nachricht wieder lesbar zu machen."
          }),
          Object.freeze({
            id: "tts_receiver_1",
            startMs: 100500,
            text: "Der Empfaenger erhaelt den Geheimtext. Jetzt kommt sein privater Schluessel ins Spiel."
          }),
          Object.freeze({
            id: "tts_receiver_2",
            startMs: 109200,
            text: "Nur mit diesem privaten Schluessel kann die Nachricht wieder korrekt entschluesselt werden."
          }),
          Object.freeze({
            id: "tts_receiver_3",
            startMs: 120000,
            text: "Danach erscheint wieder der urspruengliche Klartext."
          }),
          Object.freeze({
            id: "tts_advantage_1",
            startMs: 130500,
            text: "Der grosse Vorteil ist klar: Der geheime private Schluessel muss nie durchs Netz geschickt werden."
          }),
          Object.freeze({
            id: "tts_advantage_2",
            startMs: 140200,
            text: "Nur der oeffentliche Schluessel wird verteilt. Dadurch wird das Problem des sicheren Schluesselaustauschs deutlich entschaerft."
          }),
          Object.freeze({
            id: "tts_performance_1",
            startMs: 155400,
            text: "Der Nachteil ist die Geschwindigkeit. Asymmetrische Verfahren sind fuer grosse Datenmengen meist langsamer."
          }),
          Object.freeze({
            id: "tts_performance_2",
            startMs: 166200,
            text: "Deshalb nutzt man sie in der Praxis oft nur fuer den sicheren Austausch eines Sitzungsschluessels."
          }),
          Object.freeze({
            id: "tts_performance_3",
            startMs: 173500,
            text: "Die eigentlichen grossen Datenstroeme laufen danach haeufig symmetrisch."
          }),
          Object.freeze({
            id: "tts_finale_1",
            startMs: 180500,
            text: "Asymmetrische Verschluesselung bedeutet: Jeder Empfaenger besitzt ein Schluesselpaar."
          }),
          Object.freeze({
            id: "tts_finale_2",
            startMs: 189800,
            text: "Oeffentlich verschluesseln, privat entschluesseln."
          }),
          Object.freeze({
            id: "tts_finale_3",
            startMs: 195800,
            text: "Das loest das Austauschproblem besser, ist aber fuer grosse Datenmengen meist nicht die schnellste Loesung."
          })
        ])
      })
    }),
    Object.freeze({
      id: "hybrid_encryption_3min",
      kicker: "Babylon Presenter",
      previewTitle: "Sicherer Austausch plus Tempo",
      ctaLabel: "Hybrid-Demo starten",
      title: "Hybride Verschluesselung in 3 Minuten",
      summary: "Hybrid kombiniert asymmetrischen Schutz fuer den kleinen Sitzungsschluessel mit schneller symmetrischer Verschluesselung fuer die eigentlichen Nutzdaten.",
      description: "Praxisnahe Demo zur hybriden Verschluesselung: warum man symmetrische und asymmetrische Verfahren kombiniert, wie der Sitzungsschluessel sicher transportiert wird und weshalb grosse Datenmengen danach symmetrisch laufen.",
      estimatedDurationLabel: "ca. 03:30",
      tags: Object.freeze(["Kryptografie", "Hybrid", "Sitzungsschluessel", "Public Key"]),
      topicClusterId: "verschluesselung",
      topicClusterTitle: "Verschluesselung",
      presentationType: "problem_to_solution",
      presentationTypeNotes: "Zwei Ebenen werden klar getrennt gezeigt: asymmetrisch fuer den kleinen Schluessel, symmetrisch fuer die grosse Datenmenge.",
      sourceDatabase: "backend/QuizMaster/output/quizmaster.sqlite",
      sourceTopicIds: Object.freeze(["sec_verschluesselung"]),
      sourceTopicLabels: Object.freeze(["Verschluesselung"]),
      sourceOberthemaIds: Object.freeze(["it_sicherheit_und_datenschutz"]),
      sourceOberthemaLabels: Object.freeze(["IT-Sicherheit und Datenschutz"]),
      coverageMode: "partial",
      derivedSubtopicKey: "hybride_verschluesselung",
      derivedSubtopicTitle: "Hybride Verschluesselung",
      coverageNotes: "Teilabdeckung des breiten Thema-Objekts 'Verschluesselung' mit Fokus auf dem Praxisweg: asymmetrischer Schutz des Sitzungsschluessels und anschliessender symmetrischer Schutz der eigentlichen Nutzdaten.",
      thumbnail: Object.freeze({
        accentStart: "#6cc7ff",
        accentEnd: "#ffd26f",
        pathNodes: Object.freeze(["PUB", "Session", "Nutzdaten", "Hybrid"])
      }),
      scene: Object.freeze({
        kind: "hybrid_crypto_story",
        locale: "de-DE",
        durationMs: 210000,
        messagePlain: "Nutzdaten / grosse Datei",
        messageCipher: "A4 9C 1F 72 D0 8E 41 B6",
        messageCipherShort: "A4 9C 1F ...",
        wrongKeyText: "NOCH KEINE SESSION",
        finalQuote: "Asymmetrisch fuer den Schluessel.\nSymmetrisch fuer die Daten.",
        principleText: "1. Sitzungsschluessel erzeugen\n2. Nur diesen kleinen Schluessel asymmetrisch schuetzen\n3. Grosse Daten danach schnell symmetrisch verschluesseln",
        performanceBoardText: "Asymmetrisch: loest den Austausch\nSymmetrisch: schnell fuer grosse Datenmengen\nHybrid: erst Schluessel, dann Datenstrom",
        finaleSchemaText: "Oeffentlicher Schluessel -> schuetzt Sitzungsschluessel\nSitzungsschluessel -> schuetzt grosse Datenmenge\nPraxis = sicherer Austausch plus Tempo",
        payloadText: "Nutzdaten / grosse Datei",
        payloadCipherText: "Geheimtext / Datenpakete",
        publicKeyText: "Oeffentlicher Schluessel",
        privateKeyText: "Privater Schluessel",
        sessionKeyText: "Sitzungsschluessel",
        wrappedSessionText: "geschuetzter Sitzungsschluessel",
        hybridConceptText: "Hybrid = sicherer Austausch + Tempo",
        palette: Object.freeze({
          backgroundTop: "#07101f",
          backgroundBottom: "#02050d",
          stageLine: "#17375c",
          senderBase: "#4fbef7",
          receiverBase: "#78f2c1",
          cryptoBase: "#8b7dff",
          networkBase: "#ffb15b",
          attackerBase: "#ff6a7a",
          vaultBase: "#d7e2ff",
          safePath: "#73f2ff",
          unsafePath: "#ff6a7a",
          keyBase: "#ffe082",
          plaintext: "#f4f8ff",
          ciphertext: "#9fd0ff",
          label: "#eff6ff",
          subtle: "#9aa9c7"
        }),
        layout: Object.freeze({
          sender: Object.freeze([-12, 2.1, 0]),
          encrypt: Object.freeze([-5.2, 2.1, 0]),
          network: Object.freeze([0, 2.1, 0]),
          decrypt: Object.freeze([5.2, 2.1, 0]),
          receiver: Object.freeze([12, 2.1, 0]),
          attacker: Object.freeze([0, -2.45, 0]),
          vault: Object.freeze([9.2, -2.2, -0.4]),
          quote: Object.freeze([0, 5.3, 0])
        }),
        camera: Object.freeze({
          alpha: -1.35,
          beta: 0.98,
          radius: 29,
          target: Object.freeze([0, 1.9, 0])
        }),
        cues: Object.freeze([
          Object.freeze({
            id: "cue_problem",
            nodeId: "Praxisproblem",
            title: "Das Praxisproblem",
            caption: "Zuerst stehen die beiden Staerken noch getrennt auf der Buehne: links Tempo fuer grosse Datenmengen, rechts sicherer Schluesselaustausch mit Schluesselpaar. Erst zum Ende der Szene erscheint die Hybrid-Idee als Kombination beider Aufgaben.",
            startMs: 0,
            endMs: 20000,
            camera: Object.freeze({
              alpha: -1.32,
              beta: 0.98,
              radius: 29,
              target: Object.freeze([0, 1.9, 0])
            })
          }),
          Object.freeze({
            id: "cue_shared_key_principle",
            nodeId: "Grundidee",
            title: "Die Grundidee",
            caption: "Bei hybrider Verschluesselung wird nicht die ganze Nachricht asymmetrisch verschluesselt. Zuerst entsteht ein symmetrischer Sitzungsschluessel. Nur dieser kleine Schluessel wird asymmetrisch geschuetzt, die eigentlichen Nutzdaten laufen danach schnell symmetrisch.",
            startMs: 20000,
            endMs: 45000,
            camera: Object.freeze({
              alpha: -1.52,
              beta: 0.94,
              radius: 24,
              target: Object.freeze([0, 2.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_key_security",
            nodeId: "Schluesselpaar",
            title: "Schritt 1: Schluesselpaar beim Empfaenger",
            caption: "Der Empfaenger besitzt ein Schluesselpaar aus oeffentlichem und privatem Schluessel. Den oeffentlichen Schluessel kann er dem Sender bereitstellen, der private bleibt lokal geschuetzt.",
            startMs: 45000,
            endMs: 65000,
            camera: Object.freeze({
              alpha: -0.98,
              beta: 1.02,
              radius: 18,
              target: Object.freeze([7.0, 0.5, -0.15])
            })
          }),
          Object.freeze({
            id: "cue_key_exchange_weakness",
            nodeId: "Session",
            title: "Schritt 2: Sitzungsschluessel erzeugen",
            caption: "Jetzt erzeugt der Sender einen neuen symmetrischen Sitzungsschluessel. Dieser Schluessel gilt nur fuer diese eine Verbindung oder Sitzung und ist damit bewusst frisch und temporaer.",
            startMs: 65000,
            endMs: 85000,
            camera: Object.freeze({
              alpha: -1.88,
              beta: 1.0,
              radius: 17.4,
              target: Object.freeze([-6.2, 2.0, 0])
            })
          }),
          Object.freeze({
            id: "cue_sender_encrypt",
            nodeId: "Schutz",
            title: "Schritt 3: Sitzungsschluessel asymmetrisch schuetzen",
            caption: "Der Sender verschluesselt jetzt nur den kleinen Sitzungsschluessel mit dem oeffentlichen Schluessel des Empfaengers. Nicht die ganze grosse Datei wird asymmetrisch geschuetzt, sondern nur dieser Transport-Schluessel.",
            startMs: 85000,
            endMs: 115000,
            camera: Object.freeze({
              alpha: -1.72,
              beta: 1.0,
              radius: 17,
              target: Object.freeze([-4.6, 2.05, 0])
            })
          }),
          Object.freeze({
            id: "cue_performance_tradeoff",
            nodeId: "Datenstrom",
            title: "Schritt 4: Nutzdaten symmetrisch verschluesseln",
            caption: "Jetzt kommt der schnelle Teil. Die eigentlichen Nutzdaten werden mit dem Sitzungsschluessel symmetrisch verschluesselt. So kann auch eine grosse Datenmenge effizient uebertragen werden.",
            startMs: 115000,
            endMs: 145000,
            camera: Object.freeze({
              alpha: -1.46,
              beta: 0.98,
              radius: 21.5,
              target: Object.freeze([0, 1.8, 0])
            })
          }),
          Object.freeze({
            id: "cue_receiver_decrypt",
            nodeId: "Wiederherstellung",
            title: "Schritt 5: Schluessel wiederherstellen",
            caption: "Am Ziel angekommen entschluesselt der Empfaenger zuerst den geschuetzten Sitzungsschluessel mit seinem privaten Schluessel. Danach besitzt er denselben symmetrischen Sitzungsschluessel wie der Sender.",
            startMs: 145000,
            endMs: 170000,
            camera: Object.freeze({
              alpha: -1.12,
              beta: 1.0,
              radius: 16.8,
              target: Object.freeze([5.6, 1.95, 0])
            })
          }),
          Object.freeze({
            id: "cue_cipher_transport",
            nodeId: "Entschluesselung",
            title: "Schritt 6: Nutzdaten entschluesseln",
            caption: "Mit dem wiederhergestellten Sitzungsschluessel kann der Empfaenger jetzt die eigentlichen Nutzdaten symmetrisch entschluesseln. Genau dadurch verbindet hybrid sicheren Austausch mit schneller Datenuebertragung.",
            startMs: 170000,
            endMs: 190000,
            camera: Object.freeze({
              alpha: -1.08,
              beta: 1.0,
              radius: 17.2,
              target: Object.freeze([7.2, 2.0, 0])
            })
          }),
          Object.freeze({
            id: "cue_finale",
            nodeId: "Fazit",
            title: "Fazit",
            caption: "Hybride Verschluesselung verbindet die Staerken beider Welten. Asymmetrisch schuetzt den Sitzungsschluessel. Symmetrisch schuetzt die eigentlichen Daten schnell und effizient. Genau deshalb ist dieses Modell in der Praxis so wichtig.",
            startMs: 190000,
            endMs: 210000,
            camera: Object.freeze({
              alpha: -1.48,
              beta: 0.92,
              radius: 26,
              target: Object.freeze([0, 2.15, 0])
            })
          })
        ]),
        ttsSegments: Object.freeze([
          Object.freeze({
            id: "tts_problem_1",
            startMs: 300,
            text: "Symmetrische Verschluesselung ist schnell und stark bei grossen Datenmengen."
          }),
          Object.freeze({
            id: "tts_problem_2",
            startMs: 6100,
            text: "Ihr Problem ist aber der sichere Austausch des geheimen Schluessels. Asymmetrische Verschluesselung loest genau dieses Austauschproblem."
          }),
          Object.freeze({
            id: "tts_problem_3",
            startMs: 12300,
            text: "Fuer grosse Datenmengen ist asymmetrisch oft zu langsam. Die praktische Loesung ist deshalb hybrid: Man kombiniert beide Verfahren."
          }),
          Object.freeze({
            id: "tts_idea",
            startMs: 20300,
            text: "Bei der hybriden Verschluesselung wird nicht die ganze Nachricht asymmetrisch verschluesselt. Stattdessen wird zuerst ein symmetrischer Sitzungsschluessel erzeugt. Dieser eine Sitzungsschluessel wird dann asymmetrisch geschuetzt und sicher uebertragen. Danach werden die eigentlichen Nutzdaten schnell symmetrisch verschluesselt."
          }),
          Object.freeze({
            id: "tts_keypair",
            startMs: 45300,
            text: "Der Empfaenger besitzt zunaechst wie bei der asymmetrischen Verschluesselung ein Schluesselpaar: einen oeffentlichen und einen privaten Schluessel. Den oeffentlichen Schluessel kann er dem Sender bereitstellen."
          }),
          Object.freeze({
            id: "tts_session",
            startMs: 65300,
            text: "Jetzt erzeugt der Sender einen neuen symmetrischen Sitzungsschluessel. Dieser Schluessel gilt nur fuer diese eine Verbindung oder Sitzung."
          }),
          Object.freeze({
            id: "tts_wrap",
            startMs: 85300,
            text: "Diesen Sitzungsschluessel verschluesselt der Sender jetzt mit dem oeffentlichen Schluessel des Empfaengers. Dadurch kann spaeter nur der Empfaenger mit seinem privaten Schluessel genau diesen Sitzungsschluessel wieder freilegen."
          }),
          Object.freeze({
            id: "tts_payload_encrypt",
            startMs: 115300,
            text: "Jetzt kommt der schnelle Teil. Die eigentlichen Nutzdaten werden mit diesem Sitzungsschluessel symmetrisch verschluesselt. So kann auch eine grosse Datenmenge effizient uebertragen werden."
          }),
          Object.freeze({
            id: "tts_recover",
            startMs: 145300,
            text: "Am Ziel angekommen entschluesselt der Empfaenger zuerst den geschuetzten Sitzungsschluessel mit seinem privaten Schluessel. Danach besitzt er denselben symmetrischen Sitzungsschluessel wie der Sender."
          }),
          Object.freeze({
            id: "tts_payload_decrypt",
            startMs: 170300,
            text: "Jetzt kann der Empfaenger mit dem wiederhergestellten Sitzungsschluessel die eigentlichen Nutzdaten symmetrisch entschluesseln. Genau deshalb ist hybrid so stark: sicherer Austausch plus schnelle Datenuebertragung."
          }),
          Object.freeze({
            id: "tts_finale",
            startMs: 190300,
            text: "Hybride Verschluesselung verbindet die Staerken beider Welten. Asymmetrisch schuetzt den Sitzungsschluessel. Symmetrisch schuetzt die eigentlichen Daten schnell und effizient. Genau deshalb ist dieses Modell in der Praxis so wichtig."
          })
        ])
      })
    }),
    Object.freeze({
      id: "end_to_end_encryption_3min",
      kicker: "Babylon Presenter",
      previewTitle: "Lesbar nur an den Enden",
      ctaLabel: "E2E-Demo starten",
      title: "Ende-zu-Ende-Verschluesselung in 3 Minuten",
      summary: "Die Nachricht wird direkt auf Annas Geraet verschluesselt, reist als Geheimtext ueber Server und Netz und wird erst auf Bens Geraet wieder lesbar. Die Mitte sieht im Idealfall nur Metadaten und Ciphertext.",
      description: "Kurze Erklaer-Demo zu Ende-zu-Ende-Verschluesselung: was sie bedeutet, was Server noch sehen, warum die Mitte meist nur weiterleitet und wo die Schutzgrenze bei kompromittierten Endgeraeten oder ungeschuetzten Backups liegt.",
      estimatedDurationLabel: "ca. 03:00",
      tags: Object.freeze(["Ende-zu-Ende", "Verschluesselung", "Metadaten", "Vertraulichkeit"]),
      topicClusterId: "verschluesselung",
      topicClusterTitle: "Verschluesselung",
      presentationType: "sender_receiver_flow",
      presentationTypeNotes: "Sender-Empfaenger-Story mit klar getrenntem Klartext an den Enden und neutraler Transportmitte.",
      sourceDatabase: "backend/QuizMaster/output/quizmaster.sqlite",
      sourceTopicIds: Object.freeze(["sec_verschluesselung"]),
      sourceTopicLabels: Object.freeze(["Verschluesselung"]),
      sourceOberthemaIds: Object.freeze(["it_sicherheit_und_datenschutz"]),
      sourceOberthemaLabels: Object.freeze(["IT-Sicherheit und Datenschutz"]),
      coverageMode: "partial",
      derivedSubtopicKey: "ende_zu_ende_verschluesselung",
      derivedSubtopicTitle: "Ende-zu-Ende-Verschluesselung",
      coverageNotes: "Die Praesentation behandelt Ende-zu-Ende-Verschluesselung als fokussierte Teilabdeckung des breiten Thema-Objekts 'Verschluesselung'. Im Mittelpunkt stehen Lesbarkeit nur an den Endgeraeten, Metadaten in der Mitte und die Grenze bei kompromittierten Endgeraeten oder ungeschuetzten Backups.",
      thumbnail: Object.freeze({
        accentStart: "#6bc4ff",
        accentEnd: "#72efb3",
        pathNodes: Object.freeze(["Anna", "Verschluesselung", "Server", "Entschluesselung", "Ben"])
      }),
      scene: Object.freeze({
        kind: "end_to_end_crypto_story",
        locale: "de-DE",
        durationMs: 180000,
        senderLabel: "Anna",
        receiverLabel: "Ben",
        serverLabel: "Server",
        metadataTitle: "Server sieht Metadaten",
        transportOnlyText: "Transportiert nur Geheimtext",
        metadataBoardText: "Absender: Anna\nEmpfaenger: Ben\nUhrzeit: 14:02\nDatenmenge: 4.2 KB\nInhalt: 7F 91 C2 ...",
        limitBoardText: "Grenze: kompromittiertes Endgeraet\noder ungeschuetztes Backup",
        messagePlain: "Treffen um 15 Uhr",
        messageCipher: "7F 91 C2 D8 44 0A F1 6E",
        messageCipherShort: "7F 91 C2 ...",
        finalQuote: "Lesbar nur an den Enden.\nNicht in der Mitte.",
        palette: Object.freeze({
          backgroundTop: "#081120",
          backgroundBottom: "#02060d",
          stageLine: "#18385a",
          senderBase: "#5cc8ff",
          receiverBase: "#72efb3",
          cryptoBase: "#8f7cff",
          networkBase: "#ffb56d",
          attackerBase: "#ff6f7a",
          vaultBase: "#d9e3ff",
          safePath: "#7ef0bf",
          unsafePath: "#ff7d87",
          keyBase: "#ffe082",
          plaintext: "#f5f8ff",
          ciphertext: "#9fd3ff",
          label: "#eff6ff",
          subtle: "#9ba8c6"
        }),
        layout: Object.freeze({
          sender: Object.freeze([-13.2, 1.95, 0]),
          encrypt: Object.freeze([-6.2, 2.05, 0]),
          network: Object.freeze([0, 2.05, 0]),
          decrypt: Object.freeze([6.2, 2.05, 0]),
          receiver: Object.freeze([13.2, 1.95, 0]),
          attacker: Object.freeze([-9.6, -2.5, 0]),
          server: Object.freeze([0, -2.55, 0]),
          vault: Object.freeze([9.4, -2.3, -0.4]),
          quote: Object.freeze([0, 5.35, 0])
        }),
        camera: Object.freeze({
          alpha: -1.34,
          beta: 0.98,
          radius: 31,
          target: Object.freeze([0, 1.6, 0])
        }),
        cues: Object.freeze([
          Object.freeze({
            id: "cue_problem",
            nodeId: "Grundproblem",
            title: "Das Grundproblem",
            caption: "Ohne Ende-zu-Ende-Verschluesselung kann eine lesbare Nachricht unterwegs ueber Server und Zwischenstationen sichtbar sein. Dann spult die Szene zurueck und zeigt den Schutz direkt an den Endgeraeten.",
            startMs: 0,
            endMs: 20000,
            camera: Object.freeze({
              alpha: -1.34,
              beta: 0.98,
              radius: 31,
              target: Object.freeze([0, 1.6, 0])
            })
          }),
          Object.freeze({
            id: "cue_end_to_end_idea",
            nodeId: "Grundidee",
            title: "Die Grundidee",
            caption: "Die Nachricht wird auf Annas Geraet verschluesselt und erst auf Bens Geraet wieder entschluesselt. Dazwischen bleibt die Mitte Transportstrecke fuer Geheimtext.",
            startMs: 20000,
            endMs: 45000,
            camera: Object.freeze({
              alpha: -1.5,
              beta: 0.94,
              radius: 26,
              target: Object.freeze([0, 2.0, 0])
            })
          }),
          Object.freeze({
            id: "cue_server_metadata",
            nodeId: "Metadaten",
            title: "Was der Server noch sieht",
            caption: "Server sehen haeufig weiterhin Metadaten wie Absender, Empfaenger, Uhrzeit oder Datenmenge. Der eigentliche Nachrichteninhalt bleibt dagegen nur als Geheimtext sichtbar.",
            startMs: 45000,
            endMs: 75000,
            camera: Object.freeze({
              alpha: -1.12,
              beta: 1.04,
              radius: 16.5,
              target: Object.freeze([0, -1.65, 0])
            })
          }),
          Object.freeze({
            id: "cue_practical_flow",
            nodeId: "Praxisablauf",
            title: "Praktischer Ablauf",
            caption: "Anna tippt Klartext, verschluesselt ihn noch auf dem eigenen Smartphone und schickt danach nur Geheimtext durch Netz und Server. Erst auf Bens Geraet erscheint wieder lesbarer Klartext.",
            startMs: 75000,
            endMs: 110000,
            camera: Object.freeze({
              alpha: -1.78,
              beta: 1.0,
              radius: 18.5,
              target: Object.freeze([-4.6, 2.0, 0])
            })
          }),
          Object.freeze({
            id: "cue_middle_attack",
            nodeId: "Vorteil",
            title: "Der grosse Vorteil",
            caption: "Selbst wenn die Mitte kompromittiert wird, soll sie nur Geheimtext sehen. Lesbarer Inhalt bleibt auf Annas und Bens Endgeraeten.",
            startMs: 110000,
            endMs: 135000,
            camera: Object.freeze({
              alpha: -1.22,
              beta: 0.98,
              radius: 21,
              target: Object.freeze([-2.2, 0.35, 0])
            })
          }),
          Object.freeze({
            id: "cue_endpoint_limit",
            nodeId: "Grenze",
            title: "Die Grenze",
            caption: "Die Leitung bleibt zwar geschuetzt, aber ein kompromittiertes Endgeraet oder ein ungeschuetztes Cloud-Backup kann Klartext trotzdem wieder offenlegen.",
            startMs: 135000,
            endMs: 165000,
            camera: Object.freeze({
              alpha: -0.7,
              beta: 1.0,
              radius: 18.5,
              target: Object.freeze([8.3, -0.8, 0])
            })
          }),
          Object.freeze({
            id: "cue_finale",
            nodeId: "Fazit",
            title: "Fazit",
            caption: "Nur die Endgeraete koennen den Inhalt lesen. Alles dazwischen transportiert im Idealfall nur Geheimtext, genau deshalb ist Ende-zu-Ende-Verschluesselung so wichtig fuer vertrauliche Kommunikation.",
            startMs: 165000,
            endMs: 180000,
            camera: Object.freeze({
              alpha: -1.36,
              beta: 0.98,
              radius: 28,
              target: Object.freeze([0, 1.7, 0])
            })
          })
        ]),
        ttsSegments: Object.freeze([
          Object.freeze({
            id: "tts_problem",
            startMs: 0,
            text: "Wenn du eine Nachricht verschickst, laeuft sie meistens ueber Server, Netze und viele technische Zwischenstationen. Die Frage ist: Wer kann diese Nachricht unterwegs lesen? Genau darum geht es bei der Ende-zu-Ende-Verschluesselung."
          }),
          Object.freeze({
            id: "tts_idea",
            startMs: 20000,
            text: "Ende-zu-Ende-Verschluesselung bedeutet: Die Nachricht wird direkt beim Sender verschluesselt und erst beim Empfaenger wieder entschluesselt. Die Server dazwischen transportieren die Daten nur weiter. Sie sehen im Idealfall nur Geheimtext, aber nicht den eigentlichen Inhalt."
          }),
          Object.freeze({
            id: "tts_metadata",
            startMs: 45000,
            text: "Der Server sieht oft trotzdem noch einige Dinge. Zum Beispiel, wer mit wem kommuniziert, wann eine Nachricht gesendet wurde oder dass ueberhaupt Daten uebertragen werden. Was er aber nicht lesen soll, ist der eigentliche Nachrichteninhalt."
          }),
          Object.freeze({
            id: "tts_flow",
            startMs: 75000,
            text: "Anna schreibt zum Beispiel: Treffen um 15 Uhr. Noch auf ihrem eigenen Geraet wird diese Nachricht verschluesselt. Durch das Netz und ueber den Server laeuft danach nur noch Geheimtext. Erst auf Bens Geraet wird mit dem passenden Schluessel wieder lesbarer Klartext daraus."
          }),
          Object.freeze({
            id: "tts_advantage",
            startMs: 110000,
            text: "Der grosse Vorteil ist klar: Selbst wenn ein Server kompromittiert wird oder ein Betreiber neugierig ist, kann der Inhalt der Nachricht nicht einfach gelesen werden. Die eigentliche Lesbarkeit existiert nur an den beiden Enden der Kommunikation."
          }),
          Object.freeze({
            id: "tts_limit",
            startMs: 135000,
            text: "Ende-zu-Ende-Verschluesselung schuetzt die Uebertragung zwischen den Endgeraeten. Aber sie schuetzt nicht automatisch vor allem. Wenn das Geraet selbst kompromittiert ist, wenn jemand direkt auf dem Endgeraet mitliest oder wenn Backups ungeschuetzt gespeichert werden, dann hilft auch Ende-zu-Ende-Verschluesselung nur begrenzt."
          }),
          Object.freeze({
            id: "tts_finale",
            startMs: 165000,
            text: "Ende-zu-Ende-Verschluesselung bedeutet also: Nur die Endgeraete koennen den Inhalt lesen. Alles dazwischen transportiert im Idealfall nur Geheimtext. Genau das macht sie so wichtig fuer vertrauliche Kommunikation."
          })
        ])
      })
    }),
    Object.freeze({
      id: "tls_https_real_example_3min",
      kicker: "Babylon Presenter",
      previewTitle: "Browser, Zertifikat, Sitzungsschluessel",
      ctaLabel: "TLS/HTTPS-Demo starten",
      title: "TLS/HTTPS als reales Praxisbeispiel in 3 Minuten",
      summary: "Browser und Webserver bauen zuerst Vertrauen per Zertifikat auf, vereinbaren dann geschuetzte Sitzungsdaten und schicken anschliessend HTTP-Inhalte verschluesselt ueber HTTPS.",
      description: "Praxisnahe Demo zu HTTPS mit TLS: offener Webverkehr, Zertifikatspruefung, Handshake, Sitzungsschluessel, geschuetzte Login- und Formulardaten und die klare Grenze, was HTTPS nicht automatisch loest.",
      estimatedDurationLabel: "ca. 03:00",
      tags: Object.freeze(["TLS", "HTTPS", "Zertifikat", "Websicherheit"]),
      topicClusterId: "verschluesselung",
      topicClusterTitle: "Verschluesselung",
      presentationType: "component_interaction_story",
      presentationTypeNotes: "Praxisnahe Komponenten-Interaktion zwischen Browser, Zertifikat, TLS-Schutzschicht, Netzwerk und Webserver mit realem Webbeispiel.",
      sourceDatabase: "backend/QuizMaster/output/quizmaster.sqlite",
      sourceTopicIds: Object.freeze(["sec_verschluesselung", "ext_zertifikat"]),
      sourceTopicLabels: Object.freeze(["Verschluesselung", "Zertifikat"]),
      sourceOberthemaIds: Object.freeze(["it_sicherheit_und_datenschutz"]),
      sourceOberthemaLabels: Object.freeze(["IT-Sicherheit und Datenschutz"]),
      coverageMode: "partial",
      derivedSubtopicKey: "tls_https_webverbindung",
      derivedSubtopicTitle: "TLS/HTTPS als abgesicherte Webverbindung",
      coverageNotes: "Die Praesentation verbindet das breite Thema Verschluesselung mit dem Thema Zertifikat als reales Praxisbeispiel fuer Webkommunikation. Gezeigt werden Zertifikatspruefung, TLS-Handshake, Sitzungsschluessel und die Grenze, dass HTTPS nur die Leitung schuetzt.",
      thumbnail: Object.freeze({
        accentStart: "#5cc8ff",
        accentEnd: "#68e8a5",
        pathNodes: Object.freeze(["Browser", "Zertifikat", "TLS", "HTTPS", "Server"])
      }),
      scene: Object.freeze({
        kind: "tls_https_story",
        locale: "de-DE",
        durationMs: 180000,
        browserLabel: "Browser",
        serverLabel: "Webserver",
        httpLabel: "HTTP = Webinhalt",
        tlsLabel: "TLS = Schutzschicht",
        httpsLockLabel: "HTTPS",
        loginPlainText: "POST /login\npasswort=geheim123",
        formPlainText: "POST /formular\ntext=Kontaktanfrage",
        cookieText: "Cookie: SESSION=4F7A9C",
        cipherPacketText: "17 03 03 8A F2 91 C4 7B ...",
        certificateDomain: "shop.beispiel.de",
        certificateIssuer: "CA: Vertrauensstelle",
        certificateKeyLabel: "Public Key",
        invalidCertificateText: "WARNUNG:\nZertifikat ungueltig",
        finalQuote: "TLS schuetzt die Verbindung.\nHTTPS nutzt das fuer das Web.",
        palette: Object.freeze({
          backgroundTop: "#07121f",
          backgroundBottom: "#02060d",
          stageLine: "#18385a",
          browserBase: "#5cc8ff",
          serverBase: "#68e8a5",
          httpBase: "#f6c35b",
          tlsBase: "#7ed6ff",
          networkBase: "#ffb56d",
          attackerBase: "#ff6f7a",
          certBase: "#f2f7ff",
          keyBase: "#ffe38b",
          plaintext: "#f5fbff",
          ciphertext: "#9ac9ff",
          shieldBase: "#7bf0b0",
          warningBase: "#ff9a61",
          label: "#eff6ff",
          subtle: "#a5b3ca"
        }),
        layout: Object.freeze({
          browser: Object.freeze([-12.2, 2.2, 0]),
          httpLayer: Object.freeze([-4.8, 3.9, 0]),
          tlsLayer: Object.freeze([-4.8, 1.6, 0]),
          network: Object.freeze([0.2, 2.0, 0]),
          server: Object.freeze([12.2, 2.2, 0]),
          attacker: Object.freeze([0.15, -2.8, 0]),
          certificate: Object.freeze([5.6, 4.35, 0.12]),
          note: Object.freeze([0, 5.45, 0]),
          warningLeft: Object.freeze([-7.1, -4.15, 0]),
          warningCenter: Object.freeze([0, -4.55, 0]),
          warningRight: Object.freeze([7.1, -4.15, 0])
        }),
        camera: Object.freeze({
          alpha: -1.34,
          beta: 0.98,
          radius: 30,
          target: Object.freeze([0, 1.9, 0])
        }),
        cues: Object.freeze([
          Object.freeze({
            id: "cue_everyday_problem",
            nodeId: "Alltag",
            title: "Das Alltagsproblem",
            caption: "Ohne Schutz waeren Login- oder Formulardaten auf dem Weg durch WLAN, Router und Internet lesbar. Danach erscheint das Schloss: HTTPS schaltet die geschuetzte Verbindung ein.",
            startMs: 0,
            endMs: 20000,
            camera: Object.freeze({
              alpha: -1.34,
              beta: 0.98,
              radius: 30,
              target: Object.freeze([0, 1.9, 0])
            })
          }),
          Object.freeze({
            id: "cue_https_layers",
            nodeId: "Schichten",
            title: "Was HTTPS eigentlich ist",
            caption: "HTTP bleibt der Webinhalt. TLS legt darunter die Schutzschicht, damit der Webverkehr verschluesselt und die Gegenstelle geprueft wird.",
            startMs: 20000,
            endMs: 40000,
            camera: Object.freeze({
              alpha: -1.62,
              beta: 0.95,
              radius: 23,
              target: Object.freeze([-4.8, 2.45, 0])
            })
          }),
          Object.freeze({
            id: "cue_certificate_check",
            nodeId: "Zertifikat",
            title: "Der Verbindungsaufbau",
            caption: "Der Server sendet sein Zertifikat. Der Browser prueft Domain, oeffentlichen Schluessel und Aussteller. Gueltig gibt gruene Freigabe, ungueltig fuehrt zur Warnung.",
            startMs: 40000,
            endMs: 75000,
            camera: Object.freeze({
              alpha: -0.98,
              beta: 0.95,
              radius: 20,
              target: Object.freeze([5.8, 3.1, 0])
            })
          }),
          Object.freeze({
            id: "cue_session_setup",
            nodeId: "Handshake",
            title: "Schluessel fuer die Verbindung",
            caption: "Der Aufbau nutzt vereinfacht asymmetrische Kryptografie. Danach bleibt fuer die eigentlichen Daten ein schneller symmetrischer Sitzungsschluessel aktiv.",
            startMs: 75000,
            endMs: 110000,
            camera: Object.freeze({
              alpha: -1.34,
              beta: 0.98,
              radius: 23,
              target: Object.freeze([0.5, 2.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_protected_data",
            nodeId: "Geschuetzte Daten",
            title: "Was dann geschuetzt ist",
            caption: "Passwoerter, Formulardaten, Cookies oder Seiteninhalte laufen nun verschluesselt durch das Netz. Der Angreifer sieht Pakete, aber nicht den lesbaren Inhalt.",
            startMs: 110000,
            endMs: 140000,
            camera: Object.freeze({
              alpha: -1.5,
              beta: 1.04,
              radius: 18.4,
              target: Object.freeze([0.2, 1.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_limits",
            nodeId: "Grenzen",
            title: "Was HTTPS nicht leistet",
            caption: "Das Schutzschild liegt nur auf der Leitung zwischen Browser und Webserver. Phishing, Malware oder boeser Serverinhalt werden dadurch nicht automatisch sicher.",
            startMs: 140000,
            endMs: 165000,
            camera: Object.freeze({
              alpha: -1.42,
              beta: 1.08,
              radius: 24,
              target: Object.freeze([0, -1.2, 0])
            })
          }),
          Object.freeze({
            id: "cue_summary",
            nodeId: "Fazit",
            title: "Fazit",
            caption: "Erst Zertifikat pruefen, dann sichere Sitzung aufbauen, danach HTTP-Daten verschluesselt uebertragen. TLS schuetzt die Verbindung, HTTPS nutzt es fuer das Web.",
            startMs: 165000,
            endMs: 180000,
            camera: Object.freeze({
              alpha: -1.48,
              beta: 0.92,
              radius: 28,
              target: Object.freeze([0, 2.35, 0])
            })
          })
        ]),
        ttsSegments: Object.freeze([
          Object.freeze({
            id: "tts_problem_1",
            startMs: 400,
            text: "Du oeffnest eine Website, loggst dich ein oder sendest ein Formular ab."
          }),
          Object.freeze({
            id: "tts_problem_2",
            startMs: 6200,
            text: "Ohne Schutz koennten andere im selben Netz mitlesen."
          }),
          Object.freeze({
            id: "tts_problem_3",
            startMs: 13200,
            text: "Genau dafuer gibt es HTTPS. Dahinter arbeitet TLS und schuetzt die Verbindung zwischen deinem Browser und dem Webserver."
          }),
          Object.freeze({
            id: "tts_layers_1",
            startMs: 20300,
            text: "HTTPS ist vereinfacht gesagt normales HTTP mit Schutz durch TLS."
          }),
          Object.freeze({
            id: "tts_layers_2",
            startMs: 28300,
            text: "HTTP regelt den Webverkehr. TLS sorgt dafuer, dass die Verbindung verschluesselt ist und dass der Browser mit dem richtigen Server spricht."
          }),
          Object.freeze({
            id: "tts_certificate_1",
            startMs: 40300,
            text: "Bevor Daten sicher fliessen, bauen Browser und Server zuerst Vertrauen auf."
          }),
          Object.freeze({
            id: "tts_certificate_2",
            startMs: 49200,
            text: "Der Server zeigt dem Browser sein Zertifikat. Darin stehen zum Beispiel der Domainname, ein oeffentlicher Schluessel und der Aussteller."
          }),
          Object.freeze({
            id: "tts_certificate_3",
            startMs: 61800,
            text: "Der Browser prueft das Zertifikat. Ist es gueltig, geht es weiter. Ist es ungueltig, erscheint eine Warnung."
          }),
          Object.freeze({
            id: "tts_session_1",
            startMs: 75400,
            text: "Danach einigen sich Browser und Server auf geheime Sitzungsdaten fuer genau diese Verbindung."
          }),
          Object.freeze({
            id: "tts_session_2",
            startMs: 84800,
            text: "Vereinfacht gesagt hilft asymmetrische Kryptografie beim sicheren Aufbau."
          }),
          Object.freeze({
            id: "tts_session_3",
            startMs: 94400,
            text: "Anschliessend schuetzt ein schneller symmetrischer Sitzungsschluessel die eigentlichen Webdaten."
          }),
          Object.freeze({
            id: "tts_protected_1",
            startMs: 110500,
            text: "Ab jetzt laufen zum Beispiel Passwoerter, Formulardaten, Cookies oder Seiteninhalte verschluesselt durch das Netz."
          }),
          Object.freeze({
            id: "tts_protected_2",
            startMs: 122800,
            text: "Jemand im WLAN oder unterwegs im Internet sieht zwar Datenpakete, aber den Inhalt nicht einfach lesbar."
          }),
          Object.freeze({
            id: "tts_limits_1",
            startMs: 140500,
            text: "HTTPS schuetzt die Verbindung zwischen deinem Browser und dem Webserver."
          }),
          Object.freeze({
            id: "tts_limits_2",
            startMs: 148500,
            text: "Es bedeutet aber nicht automatisch, dass die Website selbst vertrauenswuerdig ist oder dass dein Geraet sauber ist."
          }),
          Object.freeze({
            id: "tts_limits_3",
            startMs: 156500,
            text: "Bei Phishing, Malware oder boesem Serverinhalt reicht HTTPS allein nicht aus."
          }),
          Object.freeze({
            id: "tts_summary_1",
            startMs: 165500,
            text: "HTTPS mit TLS ist das reale Alltagsbeispiel fuer sichere Webkommunikation."
          }),
          Object.freeze({
            id: "tts_summary_2",
            startMs: 171500,
            text: "Erst wird Vertrauen aufgebaut, dann entstehen Sitzungsdaten, und danach schuetzt schnelle Verschluesselung den eigentlichen Webverkehr."
          })
        ])
      })
    })
  ]);

  const PRESENTATIONS = Object.freeze(RAW_PRESENTATIONS.map((entry) => normalizePresentation(entry)));
  const CATALOG = Object.freeze(PRESENTATIONS.map((entry) => createCatalogEntry(entry)));

  function getCatalog() {
    const catalogEntries = CATALOG.map((entry) => clone(entry));
    const seen = new Set(catalogEntries.map((entry) => String(entry.id || entry.presentationId || "").trim()));
    const localEntries = listLocalPresentations().map((entry) => {
      const presentation = normalizePresentation(entry.presentation);
      const localPresentation = {
        ...presentation,
        presentationId: presentation.presentationId || entry.presentationId,
        id: presentation.presentationId || entry.presentationId,
        kicker: presentation.kicker || "Lokale ScenePresentation",
        tags: Array.isArray(presentation.tags) ? presentation.tags.concat(["Lokal"]) : ["Lokal"]
      };
      return createCatalogEntry(localPresentation);
    });
    localEntries.forEach((entry) => {
      const id = String(entry.id || entry.presentationId || "").trim();
      if (!id || seen.has(id)) return;
      seen.add(id);
      catalogEntries.push(entry);
    });
    return clone(catalogEntries);
  }

  function normalizeImportedPresentation(rawPresentation) {
    return serializePresentation(rawPresentation, {
      includeLegacySceneAlias: true,
      includeLegacySavedScenesAlias: true
    });
  }

  function getPresentation(id) {
    const normalizedId = String(id || "").trim();
    if (!normalizedId) return null;
    const localPresentation = getLocalPresentation(normalizedId);
    if (localPresentation) return clone(localPresentation);
    const presentation = PRESENTATIONS.find((entry) => entry.presentationId === normalizedId || entry.id === normalizedId) || null;
    if (presentation) return clone(presentation);
    return null;
  }

  global.PresenterData = Object.freeze({
    getCatalog,
    getPresentation,
    listLocalPresentations,
    saveLocalPresentation,
    deleteLocalPresentation,
    getLocalPresentation,
    normalizeImportedPresentation,
    serializePresentation,
    serializeScene,
    serializeCameraSpan,
    createCameraSpanDraft,
    createSceneDraft,
    createScenePresentationDraft
  });
})(window);
