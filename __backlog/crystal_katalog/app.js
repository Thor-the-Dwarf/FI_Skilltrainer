const catalogItems = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  title: String(index + 1)
}));

const items = [...catalogItems];
const itemsById = new Map(items.map((item) => [item.id, item]));

const palette = [
  "#ef4444",
  "#f97316",
  "#fb923c",
  "#fbbf24",
  "#fde047",
  "#a3e635",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6"
];

const TAU = Math.PI * 2;
const DEFAULT_CUBE_EDGE = 1.85;
const DEFAULT_CUBE_RADIUS = DEFAULT_CUBE_EDGE / Math.SQRT2;
const TETRA_RUNE_SYMBOLS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ"];
const SUBCRYSTAL_RUNE_SYMBOLS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ"];
const CRYSTAL_RUNE_SYMBOL = "ᚱ";
const NEUTRAL_CRYSTAL_COLOR_HEX = "#d8dde8";
const DEFAULT_CRYSTAL_ALPHA = 0.82;
const FRAGMENT_CRYSTAL_ALPHA = 0.75;
const RUNE_FRAGMENT_ALPHA = 0.1;
const RUNE_GLYPH_ALPHA = 0.5;
const RUNE_HALO_ALPHA = 0.36;
const runeGlyphLayoutCache = new Map();
const H3_ROOT_RUNE_SCALE = 0.24;
const H3_DETAIL_RUNE_SCALE = 0.475;
const H2_ROOT_RUNE_SCALE = 1.02;
const H2_DETAIL_RUNE_SCALE = 0.88;
const H1_ROOT_RUNE_SCALE = 2.2;
const H1_DETAIL_RUNE_SCALE = 1.22;
const INITIAL_CRYSTAL_ROTATION = Object.freeze({
  x: -0.34,
  y: 0.62,
  z: 0
});
const SURFACE_BALANCE_CLASS = Object.freeze({
  STRICT_EQUAL_AREA: "strict-equal-area",
  SUBJECTIVE_BALANCED: "subjective-balanced"
});
const STRICT_EQUAL_AREA_SELECTIONS = new Set([4, 6, 8, 10, 12, 14, 16, 18, 20]);

const listView = document.getElementById("listView");
const catalogSelect = document.getElementById("catalogSelect");
const selectionPill = document.getElementById("selectionPill");
const enginePill = document.getElementById("enginePill");
const renderCanvas = document.getElementById("renderCanvas");
const detailExperience = document.getElementById("detailExperience");
const detailLines = document.getElementById("detailLines");
const detailCards = document.getElementById("detailCards");
const contentExperience = document.getElementById("contentExperience");
const contentCrystalPanel = document.getElementById("contentCrystalPanel");
const contentLavaBallCanvas = document.getElementById("contentLavaBallCanvas");
const contentToc = document.getElementById("contentToc");
const contentStage = document.getElementById("contentStage");
const detailAdvanceButton = document.getElementById("detailAdvanceButton");
const runtimeDebug = document.getElementById("runtimeDebug");
const runtimeDebugMode = document.getElementById("runtimeDebugMode");
const runtimeDebugSummary = document.getElementById("runtimeDebugSummary");
const runtimeDebugLog = document.getElementById("runtimeDebugLog");
const STARTUP_CONFIG = parseStartupConfig();
const diagnostics = createDiagnosticsState(STARTUP_CONFIG);
const DEFAULT_CAMERA_RADIUS = 6.1;
const DETAIL_CAMERA_RADIUS = 6.35;
const CONTENT_CAMERA_RADIUS = 6.7;
const CONTENT_ENTER_TRANSITION_MS = 1280;
const CONTENT_EXIT_TRANSITION_MS = 920;
const CONTENT_REDUCED_MOTION_TRANSITION_MS = 220;
const EXPLODED_CRYSTAL_OFFSET_X = 0;
const DETAIL_PANE_MIN_WIDTH_PX = 280;
const DETAIL_PANE_PADDING_PX = 34;
const DEFAULT_H3_RUNES_PER_FRAGMENT = 10;
const MAX_H3_RUNES_PER_FRAGMENT = 10;
const PRESENTER_ROTATION_SPEED = Object.freeze({
  x: 0.12,
  y: 0.18,
  z: 0.08
});
const reducedMotionQuery = typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;

const state = {
  selectedId: STARTUP_CONFIG.selectionId,
  buttons: [],
  selectionColors: new Map(),
  scene: null,
  camera: null,
  shadowGenerator: null,
  crystalRoot: null,
  focusedFaceEntry: null,
  materials: [],
  faceEntries: [],
  extraction: {
    root: null,
    materials: [],
    lights: [],
    hiddenMeshes: [],
    hiddenLights: [],
    networkConnectors: [],
    livePaneWidthPx: null,
    stage: "idle",
    stageStartTime: 0,
    items: [],
    viewMode: "detail",
    activeContentEntryId: null,
    hoveredCardEntryId: null,
    hoveredRuneEntryId: null,
    transition: {
      phase: "hidden",
      startTime: 0,
      durationMs: 0,
      direction: "idle",
      seed: Math.random() * 1000,
      pendingViewMode: null,
      particles: [],
      lastTimestamp: 0,
      lastSpawnTime: 0
    }
  },
  snap: {
    active: false,
    startTime: 0,
    durationMs: 220,
    fromQuaternion: null,
    toQuaternion: null
  },
  drag: {
    active: false,
    pointerId: null,
    button: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
    pressedFaceEntry: null,
    pressedRuneEntry: null
  },
  movement: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 4.6
  }
};

function prefersReducedMotion() {
  return Boolean(reducedMotionQuery?.matches);
}

function clearContentLavaBallCanvas() {
  if (!contentLavaBallCanvas) {
    return;
  }

  const context = contentLavaBallCanvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, contentLavaBallCanvas.width, contentLavaBallCanvas.height);
}

function resetExtractionTransition(phase = "hidden") {
  const transition = state.extraction.transition;
  transition.phase = phase;
  transition.startTime = 0;
  transition.durationMs = 0;
  transition.direction = "idle";
  transition.pendingViewMode = null;
  transition.particles = [];
  transition.lastTimestamp = 0;
  transition.lastSpawnTime = 0;
  contentCrystalPanel?.style.setProperty("--content-lavaball-opacity", phase === "hidden" ? "0" : "0.98");
  contentCrystalPanel?.style.setProperty("--content-lavaball-scale", "1");

  if (phase === "hidden") {
    clearContentLavaBallCanvas();
  }
}

function startExtractionTransition(phase, durationMs, direction, pendingViewMode = null) {
  const transition = state.extraction.transition;
  transition.phase = phase;
  transition.startTime = performance.now();
  transition.durationMs = durationMs;
  transition.direction = direction;
  transition.seed = (transition.seed + 0.61803398875) % 1000;
  transition.pendingViewMode = pendingViewMode;
  transition.particles = [];
  transition.lastTimestamp = 0;
  transition.lastSpawnTime = transition.startTime;
}

installGlobalDiagnosticHooks();
renderList();
renderQuickSelects();
bindDetailAdvanceButton();
bindContentCrystalPanel();
updateSelection(STARTUP_CONFIG.selectionId);
setupBabylonScene();

function renderList() {
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const row = document.createElement("div");
    const button = document.createElement("button");
    const presenterButton = document.createElement("button");
    const canOpenPresenter = supportsPresenterView(item.id);
    row.className = "list-item-row";
    button.type = "button";
    button.className = "list-item list-item-select";
    button.dataset.itemId = String(item.id);
    button.innerHTML = `<span class="list-item-title">${item.title}</span>`;
    button.addEventListener("click", () => updateSelection(item.id));
    presenterButton.type = "button";
    presenterButton.className = "list-item-presenter";
    presenterButton.setAttribute(
      "aria-label",
      canOpenPresenter
        ? `Kristall ${item.title} direkt im PresenterView oeffnen`
        : `PresenterView fuer Kristall ${item.title} ist noch nicht verfuegbar`
    );
    presenterButton.innerHTML = `<span class="list-item-presenter-icon" aria-hidden="true"></span>`;
    presenterButton.disabled = !canOpenPresenter;
    presenterButton.addEventListener("click", () => openPresenterFromList(item.id));
    row.append(button, presenterButton);
    fragment.appendChild(row);
    state.buttons.push(button);
  });

  listView.appendChild(fragment);
}

function supportsPresenterView(selectionId) {
  // Ziel: Presenter-Einstiege nur fuer Kristalle anbieten, die die Presenter-Ansicht bereits wirklich tragen.
  // Warum: Ein aktiver, aber leerlaufender Button wuerde wie ein kaputter Einstieg wirken; deshalb markieren wir unausgebaute Formen klar statt sie stillschweigend ins Nichts zu schicken.
  return selectionId === 4;
}

function openPresenterFromList(selectionId) {
  // Ziel: Den kleinen Listen-Button als direkten Sprung in den PresenterView nutzen.
  // Warum: Der Nutzer will nicht erst ueber Root und Detail gehen, wenn der Einstieg in die Praesentation schon in der Liste sichtbar angeboten wird.
  updateSelection(selectionId);

  if (!supportsPresenterView(selectionId)) {
    return;
  }

  showTetrahedronDetails();
  setExtractionViewMode("content");
}

function renderQuickSelects() {
  populateSelect(catalogSelect, "Kristall springen", catalogItems);

  catalogSelect.addEventListener("change", () => {
    const selectedValue = Number(catalogSelect.value);

    if (!Number.isNaN(selectedValue) && selectedValue > 0) {
      updateSelection(selectedValue);
    }
  });
}

function bindDetailAdvanceButton() {
  // Ziel: Den vorhandenen Rail-Button als Eintritt in die naechste Ansichts-Ebene nutzbar machen.
  // Warum: Der Wechsel vom reinen Detail-Overlay zu Inhaltsverzeichnis plus Content soll ueber genau denselben prominenten Einstieg passieren, statt neue UI-Hebel einzufuehren.
  if (!detailAdvanceButton) {
    return;
  }

  detailAdvanceButton.addEventListener("click", () => {
    if (!isTetrahedronExpanded()) {
      return;
    }

    if (state.extraction.viewMode === "content") {
      setExtractionViewMode("detail");
      return;
    }

    setExtractionViewMode("content");
  });

  updateDetailAdvanceButtonState();
}

function bindContentCrystalPanel() {
  // Ziel: Den Kristall im linken oberen Content-Fenster als direkten Rueckweg in den DetailView nutzbar machen.
  // Warum: Der Nutzer soll dieselbe Geometrie, die ihn in die Content-Ebene begleitet, auch wieder intuitiv zurueck in die Detail-Ebene klicken koennen.
  if (!contentCrystalPanel) {
    return;
  }

  const activateReturn = () => {
    if (!isTetrahedronExpanded() || state.extraction.viewMode !== "content") {
      return;
    }

    requestContentReturnToDetail();
  };

  contentCrystalPanel.addEventListener("click", activateReturn);
  contentCrystalPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    activateReturn();
  });
}

function requestContentReturnToDetail() {
  // Ziel: Den Rueckweg aus dem PresenterView als kurze Portal-Transition statt als harten View-Sprung fahren.
  // Warum: Der kleine Kristall oben links ist semantisch der Rueckbutton; sein LavaBall-Effekt soll den Wechsel tragen und nicht nach dem Klick einfach abrupt verschwinden.
  if (state.extraction.viewMode !== "content") {
    setExtractionViewMode("detail", { immediate: true });
    return;
  }

  if (prefersReducedMotion()) {
    startExtractionTransition("exit", CONTENT_REDUCED_MOTION_TRANSITION_MS, "backward", "detail");
    return;
  }

  if (state.extraction.transition.phase === "exit") {
    return;
  }

  startExtractionTransition("exit", CONTENT_EXIT_TRANSITION_MS, "backward", "detail");
}

function populateSelect(select, placeholder, sourceItems) {
  if (!select) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  fragment.appendChild(placeholderOption);

  sourceItems.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = item.title;
    fragment.appendChild(option);
  });

  select.appendChild(fragment);
}

function parseStartupConfig() {
  const params = new URLSearchParams(window.location.search);
  const selectionCandidate = Number(params.get("selection") || "1");
  const fragmentRuneCounts = (params.get("h3counts") || "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  return {
    selectionId: itemsById.has(selectionCandidate) ? selectionCandidate : 1,
    openDetails: ["1", "true", "yes"].includes((params.get("detail") || "").toLowerCase()),
    openContent: ["1", "true", "yes"].includes((params.get("content") || "").toLowerCase()),
    testlab: params.has("testlab") || params.has("debug"),
    hoverEntryId: params.get("hover") || null,
    fragmentRuneCounts
  };
}

function createDiagnosticsState(startupConfig) {
  return {
    enabled: startupConfig.testlab,
    errorEntries: [],
    eventEntries: [],
    conditionEntries: new Map(),
    seenKeys: new Set(),
    metrics: {
      selectionId: startupConfig.selectionId,
      detailOpen: false,
      viewMode: "detail",
      faceEntries: 0,
      h1: 0,
      h2: 0,
      h3: 0,
      visibleH1: 0,
      visibleH2: 0,
      visibleH3: 0
    },
    samples: []
  };
}

function formatDiagnosticValue(value) {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function pushDiagnostic(level, message, details = null, key = null) {
  const target = level === "error" ? diagnostics.errorEntries : diagnostics.eventEntries;
  const entryKey = key || `${level}:${message}`;

  if (diagnostics.seenKeys.has(entryKey)) {
    return;
  }

  diagnostics.seenKeys.add(entryKey);
  target.unshift({
    level,
    message,
    details: details ? formatDiagnosticValue(details) : ""
  });
  target.splice(10);
  updateRuntimeDebugPanel();
}

function setDiagnosticCondition(key, message, isActive, details = null) {
  if (isActive) {
    diagnostics.conditionEntries.set(key, {
      level: "error",
      message,
      details: details ? formatDiagnosticValue(details) : ""
    });
  } else {
    diagnostics.conditionEntries.delete(key);
  }

  updateRuntimeDebugPanel();
}

function updateRuntimeDebugPanel() {
  if (!runtimeDebug || !runtimeDebugSummary || !runtimeDebugLog || !runtimeDebugMode) {
    return;
  }

  const shouldShow = diagnostics.enabled || diagnostics.errorEntries.length > 0;
  runtimeDebug.hidden = !shouldShow;

  if (!shouldShow) {
    return;
  }

  const metrics = diagnostics.metrics;
  const liveConditionEntries = [...diagnostics.conditionEntries.values()];
  const errorCount = liveConditionEntries.length + diagnostics.errorEntries.length;
  const eventCount = diagnostics.eventEntries.length;

  runtimeDebug.dataset.level = errorCount > 0 ? "error" : "info";
  runtimeDebugMode.textContent = errorCount > 0 ? "fehler" : diagnostics.enabled ? "testlab aktiv" : "live";
  runtimeDebugSummary.textContent = [
    `Selection ${metrics.selectionId} · Faces ${metrics.faceEntries} · Detail ${metrics.detailOpen ? "offen" : "zu"} · Modus ${metrics.viewMode}`,
    `H1 ${metrics.visibleH1}/${metrics.h1} · H2 ${metrics.visibleH2}/${metrics.h2} · H3 ${metrics.visibleH3}/${metrics.h3}`,
    `Errors ${errorCount} · Events ${eventCount}`
  ].join("\n");

  runtimeDebugLog.textContent = [...liveConditionEntries, ...diagnostics.errorEntries, ...diagnostics.eventEntries]
    .slice(0, 10)
    .map((entry) => `[${entry.level.toUpperCase()}] ${entry.message}${entry.details ? `\n${entry.details}` : ""}`)
    .join("\n\n");

  if (!runtimeDebugLog.textContent && diagnostics.enabled && diagnostics.samples.length) {
    runtimeDebugLog.textContent = diagnostics.samples
      .map((entry) => {
        return [
          `${entry.level} ${entry.title}`,
          `enabled=${entry.enabled} root=${entry.rootScale} detail=${entry.detailScale}`,
          `mesh=${formatDiagnosticValue(entry.meshScale)}`,
          `pos=${formatDiagnosticValue(entry.position)}`
        ].join("\n");
      })
      .join("\n\n");
  }

  if (enginePill) {
    enginePill.textContent = errorCount > 0
      ? `Babylon.js lokal · ${errorCount} Fehler`
      : diagnostics.enabled
        ? "Babylon.js lokal · Testlab aktiv"
        : "Babylon.js lokal";
    enginePill.classList.toggle("overlay-pill-error", errorCount > 0);
  }
}

function toSerializableVector3(vector) {
  if (!vector) {
    return null;
  }

  return {
    x: Number(vector.x.toFixed(4)),
    y: Number(vector.y.toFixed(4)),
    z: Number(vector.z.toFixed(4))
  };
}

function createRuneReport(entry) {
  const worldPosition = entry?.runeAnchor?.getAbsolutePosition
    ? entry.runeAnchor.getAbsolutePosition()
    : entry?.runeAnchor?.position || null;

  return {
    entryId: entry?.entryId || null,
    level: entry?.level || "unknown",
    title: entry?.detail?.title || "",
    enabled: typeof entry?.runeGlyphMesh?.isEnabled === "function"
      ? entry.runeGlyphMesh.isEnabled()
      : false,
    rootScale: entry?.rootRuneScale || 0,
    detailScale: entry?.detailRuneScale || 0,
    meshScale: entry?.runeGlyphMesh?.scaling
      ? toSerializableVector3(entry.runeGlyphMesh.scaling)
      : null,
    position: toSerializableVector3(worldPosition)
  };
}

function refreshRuntimeDiagnostics() {
  const metadata = state.crystalRoot?.metadata || null;
  const crystalEntry = metadata?.crystalRuneEntry ? [metadata.crystalRuneEntry] : [];
  const fragmentEntries = Array.isArray(metadata?.fragmentEntries) ? metadata.fragmentEntries : [];
  const runeEntries = Array.isArray(metadata?.runeFragmentEntries) ? metadata.runeFragmentEntries : [];

  diagnostics.metrics = {
    selectionId: state.selectedId,
    detailOpen: state.extraction.stage === "expanded",
    viewMode: state.extraction.viewMode,
    faceEntries: state.faceEntries.length,
    h1: crystalEntry.length,
    h2: fragmentEntries.length,
    h3: runeEntries.length,
    visibleH1: crystalEntry.filter((entry) => entry?.runeGlyphMesh?.isEnabled?.()).length,
    visibleH2: fragmentEntries.filter((entry) => entry?.runeGlyphMesh?.isEnabled?.()).length,
    visibleH3: runeEntries.filter((entry) => entry?.runeGlyphMesh?.isEnabled?.()).length
  };
  diagnostics.samples = [
    ...crystalEntry.map(createRuneReport),
    ...fragmentEntries.slice(0, 4).map(createRuneReport),
    ...runeEntries.slice(0, 4).map(createRuneReport)
  ];

  setDiagnosticCondition(
    "missing-h1",
    "Form 4 hat kein H1-Zentralsymbol im Metadata-Pfad.",
    state.selectedId === 4 && !crystalEntry.length
  );
  setDiagnosticCondition(
    "missing-h2",
    "Form 4 hat keine H2-Fragmentsymbole im Metadata-Pfad.",
    state.selectedId === 4 && !fragmentEntries.length
  );

  updateRuntimeDebugPanel();
}

function syncDetachedRuneAnchors() {
  // Ziel: Legacy-Helfer nur fuer wirklich geloeste Symbol-Anker ausfuehren.
  // Warum: H1/H2 sollen wieder an ihrer echten Kristallgeometrie haengen; kameraseitiges Nachziehen war der Hauptgrund dafuer, dass Zentrums- und Flaechensymbole nicht dort erschienen, wo sie semantisch hingehoeren.
  const root = state.crystalRoot;
  const metadata = root?.metadata;
  const cameraPosition = state.camera?.globalPosition;

  if (!root || !metadata || !cameraPosition) {
    return;
  }

  const entries = [
    metadata.crystalRuneEntry,
    ...(metadata.fragmentEntries || [])
  ].filter((entry) => entry?.followCrystalTransform);

  if (!entries.length) {
    return;
  }

  const worldMatrix = root.computeWorldMatrix(true);

  entries.forEach((entry) => {
    const worldPoint = BABYLON.Vector3.TransformCoordinates(entry.rootRunePosition, worldMatrix);
    const towardCamera = cameraPosition.subtract(worldPoint);
    const visibilityLift = entry.level === "h1" ? 0.3 : 0.12;

    if (towardCamera.lengthSquared() > 0.000001) {
      worldPoint.addInPlace(towardCamera.normalize().scale(visibilityLift));
    }

    entry.runeAnchor.position.copyFrom(worldPoint);
  });
}

function installGlobalDiagnosticHooks() {
  if (window.__crystalTestLabHooksInstalled) {
    return;
  }

  window.__crystalTestLabHooksInstalled = true;

  const originalConsoleError = console.error.bind(console);
  console.error = (...args) => {
    pushDiagnostic("error", "console.error", args.map((value) => formatDiagnosticValue(value)).join(" | "));
    originalConsoleError(...args);
  };

  window.addEventListener("error", (event) => {
    pushDiagnostic("error", event.message || "window.error", event.error || event.filename || null);
  });

  window.addEventListener("unhandledrejection", (event) => {
    pushDiagnostic("error", "Unhandled promise rejection", event.reason || null);
  });

  window.__crystalTestLab = {
    getReport() {
      const metadata = state.crystalRoot?.metadata || null;

      return {
        selectionId: state.selectedId,
        detailOpen: state.extraction.stage === "expanded",
        viewMode: state.extraction.viewMode,
        activeContentEntryId: state.extraction.activeContentEntryId,
        metrics: { ...diagnostics.metrics },
        conditions: [...diagnostics.conditionEntries.entries()].map(([key, value]) => ({ key, ...value })),
        errors: diagnostics.errorEntries.map((entry) => ({ ...entry })),
        events: diagnostics.eventEntries.map((entry) => ({ ...entry })),
        crystalRune: metadata?.crystalRuneEntry ? createRuneReport(metadata.crystalRuneEntry) : null,
        fragmentRunes: (metadata?.fragmentEntries || []).map(createRuneReport),
        runeFragmentRunes: (metadata?.runeFragmentEntries || []).map(createRuneReport)
      };
    },
    openDetails() {
      showTetrahedronDetails();
      refreshRuntimeDiagnostics();
      return this.getReport();
    },
    openContentMode() {
      showTetrahedronDetails();
      setExtractionViewMode("content");
      refreshRuntimeDiagnostics();
      return this.getReport();
    },
    closeContentMode() {
      setExtractionViewMode("detail");
      refreshRuntimeDiagnostics();
      return this.getReport();
    },
    hoverDetail(entryId) {
      setHoveredDetailCardEntry(entryId || null);
      refreshRuntimeDiagnostics();
      return this.getReport();
    },
    clearHover() {
      setHoveredDetailCardEntry(null);
      setHoveredRuneEntry(null);
      refreshRuntimeDiagnostics();
      return this.getReport();
    },
    closeDetails() {
      collapseTetrahedronIntoGroundView();
      refreshRuntimeDiagnostics();
      return this.getReport();
    },
    setSelection(nextSelectionId) {
      updateSelection(nextSelectionId);
      refreshRuntimeDiagnostics();
      return this.getReport();
    }
  };
}

function updateSelection(id) {
  state.selectedId = id;

  state.buttons.forEach((button) => {
    const isActive = Number(button.dataset.itemId) === id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    if (isActive) {
      button.scrollIntoView({ block: "nearest" });
    }
  });

  selectionPill.textContent = `Aktiv: ${itemsById.get(id)?.title || id}`;
  syncQuickSelects(id);

  if (state.scene) {
    syncCrystalForSelection();
  }

  refreshRuntimeDiagnostics();
}

function syncQuickSelects(id) {
  if (catalogSelect) {
    catalogSelect.value = catalogItems.some((item) => item.id === id) ? String(id) : "";
  }
}

function syncExperienceCamera() {
  // Ziel: Die Kamera an den aktiven UI-Zustand koppeln, statt alle Ansichten mit demselben Framing zu erzwingen.
  // Warum: Detail-Overlay und Inhalts-/Content-Ansicht haben unterschiedliche Buehnenbreiten; ohne kameraseitige Anpassung wird der Kristall entweder zu klein oder abgeschnitten.
  if (!state.camera) {
    return;
  }

  if (state.extraction.stage !== "expanded") {
    state.camera.radius = DEFAULT_CAMERA_RADIUS;
    return;
  }

  state.camera.radius = state.extraction.viewMode === "content"
    ? CONTENT_CAMERA_RADIUS
    : DETAIL_CAMERA_RADIUS;
}

function getContentCrystalSafePadding(panelRect) {
  const minDimension = Math.max(1, Math.min(panelRect.width, panelRect.height));
  return Math.min(56, Math.max(24, minDimension * 0.12));
}

function getProjectedCrystalBounds(projectionContext) {
  // Ziel: Den sichtbaren Aussenkoerper des Kristalls als 2D-Bounds im aktuellen Canvas bestimmen.
  // Warum: Der PresenterView soll nicht mit einer festen Kamerazahl arbeiten, sondern den real projizierten Kristall gegen den Container einpassen.
  if (!projectionContext || !state.crystalRoot || !state.faceEntries.length) {
    return null;
  }

  state.crystalRoot.computeWorldMatrix(true);
  const worldMatrix = state.crystalRoot.getWorldMatrix();
  const uniqueVertices = new Map();
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  state.faceEntries.forEach((entry) => {
    entry.vertices.forEach((vertex) => {
      const key = getVertexKey(vertex);

      if (!uniqueVertices.has(key)) {
        uniqueVertices.set(key, vertex.clone());
      }
    });
  });

  uniqueVertices.forEach((vertex) => {
    const worldVertex = BABYLON.Vector3.TransformCoordinates(vertex, worldMatrix);
    const point = projectWorldPointToStageWithContext(worldVertex, projectionContext);

    if (!point) {
      return;
    }

    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) * 0.5,
    centerY: (minY + maxY) * 0.5
  };
}

function syncPresenterCrystalFraming() {
  // Ziel: Den kleinen Presenter-Kristall innerhalb seines Panels vollstaendig und mit harmonischem Padding sichtbar halten.
  // Warum: Der PresenterView ist hier eher ein schicker Rueck-Button als eine zweite Hauptszene; abgeschnittene Spitzen zerstoeren genau diesen Eindruck.
  if (
    state.extraction.stage !== "expanded"
    || state.extraction.viewMode !== "content"
    || !state.camera
    || !contentCrystalPanel
  ) {
    return;
  }

  const projectionContext = createStageProjectionContext();
  const panelRect = contentCrystalPanel.getBoundingClientRect();
  const bounds = getProjectedCrystalBounds(projectionContext);

  if (!projectionContext || !bounds || !panelRect.width || !panelRect.height) {
    return;
  }

  const safePadding = getContentCrystalSafePadding(panelRect);
  const availableWidth = Math.max(32, panelRect.width - (safePadding * 2));
  const availableHeight = Math.max(32, panelRect.height - (safePadding * 2));
  const fitRatio = Math.max(bounds.width / availableWidth, bounds.height / availableHeight);
  const currentRadius = state.camera.radius || CONTENT_CAMERA_RADIUS;
  let targetRadius = CONTENT_CAMERA_RADIUS;

  if (fitRatio > 1.001) {
    targetRadius = currentRadius * fitRatio;
  } else if (fitRatio < 0.84) {
    targetRadius = currentRadius * Math.max(0.9, fitRatio / 0.84);
  } else {
    targetRadius = currentRadius;
  }

  targetRadius = Math.max(state.camera.lowerRadiusLimit || 0, Math.min(state.camera.upperRadiusLimit || targetRadius, targetRadius));
  state.camera.radius = BABYLON.Scalar.Lerp(currentRadius, targetRadius, 0.12);
  contentCrystalPanel.style.setProperty("--content-crystal-safe-padding", `${safePadding}px`);
}

function clearLiveDetailPaneWidth() {
  // Ziel: Die dynamische Detailbreite verlassen, sobald kein Tree mehr auf der rechten Seite steht.
  // Warum: Root- und PresentationsView sollen nicht versehentlich die schmale Tree-Breite des DetailViews mitschleppen.
  if (state.extraction.livePaneWidthPx === null) {
    return;
  }

  document.body.style.removeProperty("--detail-pane-live-width");
  state.extraction.livePaneWidthPx = null;
  state.scene?.getEngine?.().resize();
}

function syncLiveDetailPaneWidth() {
  // Ziel: Die rechte Detailflaeche an die echte Breite des sichtbaren Trees koppeln.
  // Warum: Wenn der Tree inhaltsgetrieben schmaler wird, muss die 3D-Buehne links entsprechend mitwachsen, damit der Kristall wieder harmonisch zentriert wirkt.
  if (
    !detailCards
    || !renderCanvas
    || state.extraction.stage !== "expanded"
    || state.extraction.viewMode !== "detail"
  ) {
    clearLiveDetailPaneWidth();
    return;
  }

  if (window.innerWidth <= 920) {
    clearLiveDetailPaneWidth();
    return;
  }

  const stageFrame = renderCanvas.parentElement;
  const stageRect = stageFrame?.getBoundingClientRect?.();
  const treeRect = detailCards.getBoundingClientRect();

  if (!stageRect || !treeRect.width) {
    return;
  }

  const advanceWidth = detailAdvanceButton?.getBoundingClientRect?.().width || 0;
  const desiredWidth = Math.ceil(treeRect.width + advanceWidth + DETAIL_PANE_PADDING_PX);
  const clampedWidth = Math.max(
    DETAIL_PANE_MIN_WIDTH_PX,
    Math.min(Math.floor(stageRect.width * 0.58), desiredWidth)
  );

  if (Math.abs((state.extraction.livePaneWidthPx || 0) - clampedWidth) < 1) {
    return;
  }

  document.body.style.setProperty("--detail-pane-live-width", `${clampedWidth}px`);
  state.extraction.livePaneWidthPx = clampedWidth;
  state.scene?.getEngine?.().resize();
}

function updateDetailAdvanceButtonState() {
  // Ziel: Dem Rail-Button klar machen, ob er vorwaerts in den Content-Modus oder zurueck in den Detail-Modus fuehrt.
  // Warum: Dieselbe Rail bleibt der zentrale Hebel zwischen beiden Ebenen; ohne expliziten Zustandswechsel wirkt die Navigation zufaellig.
  if (!detailAdvanceButton) {
    return;
  }

  const isContentMode = state.extraction.viewMode === "content";
  detailAdvanceButton.classList.toggle("is-back", isContentMode);
  detailAdvanceButton.setAttribute(
    "aria-label",
    isContentMode ? "Zurueck zu Details" : "Zum Inhaltsverzeichnis und Content"
  );
}

function commitExtractionViewMode(viewMode) {
  // Ziel: Zwischen klassischem Detail-Overlay und Inhalts-/Content-Ansicht als echte Zustandsmaschine wechseln.
  // Warum: Beide Ansichten teilen sich dieselben Symbol- und Hierarchiedaten, brauchen aber unterschiedliche Panels, Pointer-Logik und Kamerarahmen.
  const nextMode = viewMode === "content" ? "content" : "detail";

  state.extraction.viewMode = nextMode;
  document.body.classList.toggle("is-content-mode", nextMode === "content");

  if (contentExperience) {
    contentExperience.setAttribute("aria-hidden", String(nextMode !== "content"));
  }

  if (nextMode === "content") {
    const firstContentEntry = state.extraction.items.find((item) => item.level === "h3")
      || state.extraction.items.find((item) => item.level === "h2")
      || state.extraction.items.find((item) => item.level === "h1")
      || null;

    if (!state.extraction.activeContentEntryId || !state.extraction.items.some((item) => item.entryId === state.extraction.activeContentEntryId)) {
      state.extraction.activeContentEntryId = firstContentEntry?.entryId || null;
    }

    mountContentExperience(state.extraction.items);
  }

  updateDetailAdvanceButtonState();
  syncLiveDetailPaneWidth();
  syncExperienceCamera();
  refreshRuntimeDiagnostics();
}

function setExtractionViewMode(viewMode, options = {}) {
  // Ziel: Den View-Wechsel um Presenter-spezifische Eintritts- und Ruecktransitionen erweitern.
  // Warum: Der Wechsel zum kleinen Kristallportal soll nicht nur ein CSS-Umschalten sein, sondern einen klaren Beginn und ein klares Ende haben.
  const nextMode = viewMode === "content" ? "content" : "detail";
  const immediate = options.immediate === true;

  if (nextMode === "content") {
    commitExtractionViewMode("content");
    startExtractionTransition(
      "enter",
      prefersReducedMotion() ? CONTENT_REDUCED_MOTION_TRANSITION_MS : CONTENT_ENTER_TRANSITION_MS,
      "forward"
    );
    return;
  }

  if (state.extraction.viewMode === "content" && !immediate) {
    requestContentReturnToDetail();
    return;
  }

  commitExtractionViewMode("detail");
  resetExtractionTransition("hidden");
}

function applyExplodedLayout(isActive) {
  // Ziel: Im Detailzustand eine Buehne schaffen, auf der der Kristall links gross, zentriert und unbeschnitten lesbar bleibt.
  // Warum: Das relevante Qualitaetskriterium ist hier nicht ein starres Prozentverhaeltnis, sondern dass der Kristall klar praesentiert wird und die Details trotzdem rechts genug Platz haben.
  document.body.classList.toggle("is-exploded", isActive);

  if (detailExperience) {
    detailExperience.setAttribute("aria-hidden", String(!isActive));
  }

  if (state.crystalRoot) {
    state.crystalRoot.position.x = isActive ? EXPLODED_CRYSTAL_OFFSET_X : 0;
  }

  if (!isActive) {
    document.body.classList.remove("is-content-mode");

    if (contentExperience) {
      contentExperience.setAttribute("aria-hidden", "true");
    }
  }

  if (!isActive) {
    clearLiveDetailPaneWidth();
  } else {
    requestAnimationFrame(() => {
      syncLiveDetailPaneWidth();
    });
  }

  syncExperienceCamera();
  updateDetailAdvanceButtonState();

  requestAnimationFrame(() => {
    state.scene?.getEngine().resize();
  });
}

function setupBabylonScene() {
  if (!window.BABYLON) {
    enginePill.textContent = "Babylon.js fehlt";
    return;
  }

  const engine = new BABYLON.Engine(renderCanvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    adaptToDeviceRatio: true
  });

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.35,
    DEFAULT_CAMERA_RADIUS,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.lowerRadiusLimit = 4.6;
  camera.upperRadiusLimit = 8.8;
  camera.wheelDeltaPercentage = 0.01;
  camera.minZ = 0.05;

  state.scene = scene;
  state.camera = camera;

  const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.42;
  hemiLight.diffuse = BABYLON.Color3.FromHexString("#dce6ff");
  hemiLight.groundColor = BABYLON.Color3.FromHexString("#141414");

  const keyLight = new BABYLON.DirectionalLight("keyLight", new BABYLON.Vector3(-0.42, -0.88, 0.22), scene);
  keyLight.position = new BABYLON.Vector3(4.8, 6.2, -3.2);
  keyLight.intensity = 2.05;
  keyLight.diffuse = BABYLON.Color3.FromHexString("#fff1db");
  keyLight.specular = BABYLON.Color3.FromHexString("#fff8ef");

  const rimLight = new BABYLON.DirectionalLight("rimLight", new BABYLON.Vector3(0.6, -0.24, -0.62), scene);
  rimLight.position = new BABYLON.Vector3(-4.6, 2.2, 4.1);
  rimLight.intensity = 0.52;
  rimLight.diffuse = BABYLON.Color3.FromHexString("#8fe6ff");

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, keyLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 24;
  shadowGenerator.bias = 0.0006;
  shadowGenerator.normalBias = 0.02;
  state.shadowGenerator = shadowGenerator;

  syncCrystalForSelection();
  refreshRuntimeDiagnostics();
  enableBoxDragging(camera, renderCanvas);
  enableViewerMovement(camera);
  installWebGLCanvasDiagnostics(renderCanvas);

  if (STARTUP_CONFIG.openDetails && STARTUP_CONFIG.selectionId === 4) {
    requestAnimationFrame(() => {
      showTetrahedronDetails();
      refreshRuntimeDiagnostics();
    });
  }

  engine.runRenderLoop(() => {
    updateSnapAnimation();
    updateExtractionAnimation();
    updatePresenterRotation(scene);
    updateViewerMovement(scene);
    syncDetachedRuneAnchors();
    try {
      scene.render();
    } catch (error) {
      pushDiagnostic("error", "scene.render() fehlgeschlagen", error, "render-loop-crash");
      return;
    }
    syncExplodedDetailLayout();
  });

  window.addEventListener("resize", () => {
    engine.resize();
    syncLiveDetailPaneWidth();
  });
}

function installWebGLCanvasDiagnostics(canvas) {
  if (!canvas || canvas.dataset.webglDiagnosticsBound === "true") {
    return;
  }

  canvas.dataset.webglDiagnosticsBound = "true";
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pushDiagnostic("error", "WebGL-Kontext verloren", null, "webgl-context-lost");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    pushDiagnostic("event", "WebGL-Kontext wiederhergestellt", null, "webgl-context-restored");
  });
  canvas.addEventListener("webglcontextcreationerror", (event) => {
    pushDiagnostic("error", "WebGL-Kontext konnte nicht erstellt werden", event.statusMessage || null, "webgl-context-creation-error");
  });
}

function syncCrystalForSelection() {
  const shapeConfig = getShapeConfigForSelection(state.selectedId);
  rebuildCrystal(shapeConfig, state.selectedId);
}

function rebuildCrystal(shapeConfig, selectionId) {
  disposeCurrentCrystal();

  const crystal = createCrystalByConfig(state.scene, shapeConfig, selectionId);
  crystal.root.rotationQuaternion = getInitialQuaternionForShape(shapeConfig, crystal);

  syncExperienceCamera();

  crystal.root.position.x = state.extraction.stage === "expanded" ? EXPLODED_CRYSTAL_OFFSET_X : 0;

  state.crystalRoot = crystal.root;
  state.materials = crystal.materials;
  state.faceEntries = crystal.faceEntries;
  refreshRuntimeDiagnostics();
}

function getInitialQuaternionForShape(shapeConfig, crystal) {
  return BABYLON.Quaternion.FromEulerAngles(
    INITIAL_CRYSTAL_ROTATION.x,
    INITIAL_CRYSTAL_ROTATION.y,
    INITIAL_CRYSTAL_ROTATION.z
  );
}

function disposeCurrentCrystal() {
  state.snap.active = false;
  state.snap.fromQuaternion = null;
  state.snap.toQuaternion = null;
  clearExtractedCrystal();
  applyExplodedLayout(false);
  clearFocusedFace();
  state.materials.forEach((material) => material.dispose());
  state.materials = [];
  state.faceEntries = [];

  if (state.crystalRoot) {
    state.crystalRoot.metadata?.detachedRuneAnchors?.forEach((anchor) => {
      anchor?.dispose?.();
    });
    state.crystalRoot.dispose(false);
    state.crystalRoot = null;
  }
}

function createFaceIdentity(selectionId, shapeKind, faceName, faceIndex) {
  return {
    selectionId,
    shapeKind,
    faceName,
    faceIndex,
    faceId: `selection-${selectionId}__${shapeKind}__${faceName}__${faceIndex + 1}`
  };
}

function applyFaceIdentity(mesh, identity) {
  mesh.name = identity.faceId;
  mesh.metadata = {
    ...(mesh.metadata || {}),
    ...identity
  };
}

function getShapeConfigForSelection(id) {
  let shapeConfig;

  switch (id) {
    case 1:
      shapeConfig = getCellClusterConfig(1);
      break;
    case 2:
      shapeConfig = getCellClusterConfig(2);
      break;
    case 3:
      shapeConfig = getCellClusterConfig(3);
      break;
    case 4:
      shapeConfig = { kind: "tetrahedron", radius: 1.62 };
      break;
    case 5:
      shapeConfig = {
        kind: "pyramid",
        sides: 4,
        radius: 1.08,
        height: 2.02,
        rotationOffset: Math.PI / 4
      };
      break;
    case 6:
      shapeConfig = {
        kind: "prism",
        sides: 4,
        radius: DEFAULT_CUBE_RADIUS,
        height: DEFAULT_CUBE_EDGE,
        rotationOffset: Math.PI / 4
      };
      break;
    case 7:
      shapeConfig = getPrismCapConfig(3);
      break;
    case 8:
      shapeConfig = getBipyramidConfig(4);
      break;
    case 9:
      shapeConfig = getCornerCutBipyramidConfig(4);
      break;
    case 10:
      shapeConfig = getBipyramidConfig(5);
      break;
    case 11:
      shapeConfig = getCornerCutBipyramidConfig(5, {
        corner: "top",
        heightScale: 0.65,
        truncateRatio: 0.46
      });
      break;
    case 12:
      shapeConfig = { kind: "dodecahedron", radius: 1.58 };
      break;
    case 13:
      shapeConfig = getCornerCutBipyramidConfig(6, {
        corner: "top",
        heightScale: 0.92,
        truncateRatio: 0.51
      });
      break;
    case 14:
      shapeConfig = getBipyramidConfig(7);
      break;
    case 15:
      shapeConfig = getCornerCutBipyramidConfig(7, {
        corner: "top",
        heightScale: 0.99,
        truncateRatio: 0.48
      });
      break;
    case 16:
      shapeConfig = getBipyramidConfig(8);
      break;
    case 17:
      shapeConfig = getCornerCutBipyramidConfig(8, {
        corner: "top",
        heightScale: 0.98,
        truncateRatio: 0.46
      });
      break;
    case 18:
      shapeConfig = getBipyramidConfig(9);
      break;
    case 19:
      shapeConfig = getCornerCutBipyramidConfig(9, {
        corner: "top",
        heightScale: 0.9,
        truncateRatio: 0.45
      });
      break;
    case 20:
      shapeConfig = { kind: "icosahedron", radius: 1.58 };
      break;
    default:
      shapeConfig = {
        kind: "prism",
        sides: 4,
        radius: DEFAULT_CUBE_RADIUS,
        height: DEFAULT_CUBE_EDGE,
        rotationOffset: Math.PI / 4
      };
      break;
  }

  return withSurfaceBalanceClass(id, shapeConfig);
}

function withSurfaceBalanceClass(selectionId, shapeConfig) {
  return {
    ...shapeConfig,
    surfaceBalanceClass: getSurfaceBalanceClassForSelection(selectionId)
  };
}

function getSurfaceBalanceClassForSelection(selectionId) {
  return STRICT_EQUAL_AREA_SELECTIONS.has(selectionId)
    ? SURFACE_BALANCE_CLASS.STRICT_EQUAL_AREA
    : SURFACE_BALANCE_CLASS.SUBJECTIVE_BALANCED;
}

function getCellClusterConfig(cellCount) {
  const singleCellRadius = 1.34;

  switch (cellCount) {
    case 1:
      return {
        kind: "segmented-sphere",
        segmentCount: 1,
        radius: singleCellRadius
      };
    case 2:
      return {
        kind: "cone",
        radius: singleCellRadius * 0.96,
        height: singleCellRadius * 2.16
      };
    case 3:
      return {
        kind: "cylinder",
        radius: singleCellRadius * 0.98,
        height: singleCellRadius * 2.02
      };
    default:
      return {
        kind: "segmented-sphere",
        segmentCount: 1,
        radius: singleCellRadius
      };
  }
}

function getPrismCapConfig(sides) {
  const radius = getCrystalRadiusForSides(sides, 0.88, 1.08);
  const edgeLength = getPolygonEdgeLength(sides, radius);
  const prismHeight = Math.max(edgeLength * 0.96, 0.84);
  const capHeight = Math.max(edgeLength * 0.82, radius * 0.72);

  return {
    kind: "prism-cap",
    sides,
    radius,
    prismHeight,
    capHeight,
    rotationOffset: getCrystalRotationOffset(sides)
  };
}

function getBipyramidConfig(sides) {
  const radius = getCrystalRadiusForSides(sides, 0.92, 1.16);
  const edgeLength = getPolygonEdgeLength(sides, radius);
  const height = Math.max(radius * 1.92, edgeLength * 1.74);

  return {
    kind: "bipyramid",
    sides,
    radius,
    height,
    rotationOffset: getCrystalRotationOffset(sides)
  };
}

function getCornerCutBipyramidConfig(sides, overrides = {}) {
  const baseConfig = getBipyramidConfig(sides);
  const tuning = { ...getCornerCutTuning(sides), ...overrides };

  return {
    ...baseConfig,
    height: baseConfig.height * tuning.heightScale,
    kind: "corner-cut-bipyramid",
    truncateRatio: tuning.truncateRatio,
    corner: tuning.corner || "equator_1"
  };
}

function getCornerCutTuning(sides) {
  const tuningMap = {
    4: { heightScale: 0.8, truncateRatio: 0.55 },
    5: { heightScale: 0.91, truncateRatio: 0.53 },
    6: { heightScale: 0.92, truncateRatio: 0.51 },
    7: { heightScale: 0.99, truncateRatio: 0.48 },
    8: { heightScale: 0.98, truncateRatio: 0.46 },
    9: { heightScale: 0.9, truncateRatio: 0.45 }
  };

  return tuningMap[sides] || { heightScale: 0.92, truncateRatio: 0.5 };
}

function getAugmentedCubeConfig(pyramidFaces, tetraFaces = []) {
  return {
    kind: "augmented-cube",
    edge: 1.38,
    pyramidFaces,
    tetraFaces
  };
}

function getAugmentedPrismConfig(sides, pyramidFaces, tetraFaces = []) {
  const edge = getAugmentedPrismEdge(sides);

  return {
    kind: "augmented-prism",
    sides,
    radius: edge / (2 * Math.sin(Math.PI / sides)),
    height: edge,
    rotationOffset: getCrystalRotationOffset(sides),
    pyramidFaces,
    tetraFaces
  };
}

function getGrownCrystalConfig(faceCount) {
  const sides = (faceCount - 1) / 2;
  const edgeLength = getGrownCrystalEdge(sides);

  return {
    kind: "grown-crystal",
    sides,
    radius: edgeLength / (2 * Math.sin(Math.PI / sides)),
    bodyHeight: edgeLength * (2.18 + (sides * 0.1)),
    tipHeight: edgeLength * (0.72 + (sides * 0.04)),
    rotationOffset: getCrystalRotationOffset(sides),
    seed: faceCount * 1.173
  };
}

function createCrystalByConfig(scene, shapeConfig, selectionId) {
  let faces = [];

  switch (shapeConfig.kind) {
    case "segmented-sphere":
      return createSegmentedSphere(scene, shapeConfig, selectionId);
    case "cone":
      return createCone(scene, shapeConfig, selectionId);
    case "cylinder":
      return createCylinder(scene, shapeConfig, selectionId);
    case "cell-cluster":
      return createCellCluster(scene, shapeConfig, selectionId);
    case "prism":
      faces = buildRegularPrismFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.height,
        shapeConfig.rotationOffset || 0
      );
      break;
    case "pyramid":
      faces = buildRegularPyramidFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.height,
        shapeConfig.rotationOffset || 0
      );
      break;
    case "prism-cap":
      faces = buildPrismCapFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.prismHeight,
        shapeConfig.capHeight,
        shapeConfig.rotationOffset || 0
      );
      break;
    case "bipyramid":
      faces = buildRegularBipyramidFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.height,
        shapeConfig.rotationOffset || 0
      );
      break;
    case "corner-cut-bipyramid":
      faces = buildCornerCutBipyramidFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.height,
        shapeConfig.rotationOffset || 0,
        shapeConfig.truncateRatio,
        shapeConfig.corner
      );
      break;
    case "augmented-cube":
      faces = buildAugmentedCubeFaces(
        shapeConfig.edge,
        shapeConfig.pyramidFaces,
        shapeConfig.tetraFaces
      );
      break;
    case "augmented-prism":
      faces = buildAugmentedPrismFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.height,
        shapeConfig.rotationOffset || 0,
        shapeConfig.pyramidFaces,
        shapeConfig.tetraFaces
      );
      break;
    case "grown-crystal":
      faces = buildGrownCrystalFaces(
        shapeConfig.sides,
        shapeConfig.radius,
        shapeConfig.bodyHeight,
        shapeConfig.tipHeight,
        shapeConfig.rotationOffset || 0,
        shapeConfig.seed
      );
      break;
    case "tetrahedron":
      faces = buildTetrahedronFaces(shapeConfig.radius);
      break;
    case "dodecahedron":
      faces = buildDodecahedronFaces(shapeConfig.radius);
      break;
    case "icosahedron":
      faces = buildIcosahedronFaces(shapeConfig.radius);
      break;
    default:
      faces = buildRegularPrismFaces(4, DEFAULT_CUBE_RADIUS, DEFAULT_CUBE_EDGE, Math.PI / 4);
      break;
  }

  return createTransparentCrystal(scene, shapeConfig.kind, faces, selectionId);
}

function createCellCluster(scene, shapeConfig, selectionId) {
  const root = new BABYLON.TransformNode(`vault_${shapeConfig.kind}_root`, scene);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();
  const materials = [];
  const faceEntries = [];
  const occluderMaterial = shapeConfig.cellCount > 1
    ? createCellOccluderMaterial(scene, `${shapeConfig.kind}_occluder`)
    : null;

  if (occluderMaterial) {
    materials.push(occluderMaterial);
  }

  shapeConfig.cells.forEach((cell, index) => {
    const identity = createFaceIdentity(selectionId, shapeConfig.kind, `cell_${index + 1}`, index);
    const cellColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_cell_${index + 1}`);
    const material = createCellMaterial(scene, identity.faceId, cellColor);
    const cellPosition = new BABYLON.Vector3(cell.x, cell.y, cell.z);
    const cellRadius = shapeConfig.cellRadius * (cell.scale || 1);
    const mesh = BABYLON.MeshBuilder.CreateSphere(identity.faceId, {
      diameter: cellRadius * 2,
      segments: 44
    }, scene);
    const cellNormal = cellPosition.lengthSquared() > 0.0001
      ? cellPosition.clone().normalize()
      : new BABYLON.Vector3(0, 0, 1);

    mesh.parent = root;
    mesh.position.copyFrom(cellPosition);
    mesh.material = material;
    mesh.isPickable = true;
    mesh.receiveShadows = true;
    mesh.renderingGroupId = 1;
    applyFaceIdentity(mesh, identity);
    state.shadowGenerator?.addShadowCaster(mesh);

    if (occluderMaterial) {
      const occluder = BABYLON.MeshBuilder.CreateSphere(`vaultCellMask_${index + 1}`, {
        diameter: cellRadius * 2 * 0.9,
        segments: 28
      }, scene);
      occluder.parent = mesh;
      occluder.material = occluderMaterial;
      occluder.isPickable = false;
      occluder.receiveShadows = false;
      occluder.renderingGroupId = 0;
    }

    materials.push(material);
    faceEntries.push({
      ...identity,
      mesh,
      material,
      localNormal: cellNormal,
      snapEligible: shapeConfig.cellCount > 1
    });
  });

  return { root, materials, faceEntries };
}

function createSegmentedSphere(scene, shapeConfig, selectionId) {
  const root = new BABYLON.TransformNode(`vault_${shapeConfig.kind}_root`, scene);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();
  const materials = [];
  const faceEntries = [];
  const segmentCount = Math.max(1, shapeConfig.segmentCount || 1);
  const arcFraction = 1 / segmentCount;
  const rotationOffset = -Math.PI / 2;

  for (let index = 0; index < segmentCount; index += 1) {
    const identity = createFaceIdentity(selectionId, shapeConfig.kind, `segment_${index + 1}`, index);
    const segmentColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_segment_${index + 1}`);
    const material = createCellMaterial(scene, identity.faceId, segmentColor);
    const mesh = BABYLON.MeshBuilder.CreateSphere(identity.faceId, {
      diameter: shapeConfig.radius * 2,
      segments: 52,
      arc: arcFraction
    }, scene);
    const centerAngle = rotationOffset + (((index + 0.5) / segmentCount) * TAU);
    const localNormal = segmentCount === 1
      ? new BABYLON.Vector3(0, 0, 1)
      : new BABYLON.Vector3(Math.cos(centerAngle), 0, Math.sin(centerAngle)).normalize();

    mesh.parent = root;
    mesh.rotation.y = rotationOffset + ((index / segmentCount) * TAU);
    mesh.material = material;
    mesh.isPickable = true;
    mesh.receiveShadows = true;
    mesh.renderingGroupId = 1;
    applyFaceIdentity(mesh, identity);
    state.shadowGenerator?.addShadowCaster(mesh);

    materials.push(material);
    faceEntries.push({
      ...identity,
      mesh,
      material,
      localNormal,
      snapEligible: segmentCount > 1
    });
  }

  return { root, materials, faceEntries };
}

function createCone(scene, shapeConfig, selectionId) {
  const root = new BABYLON.TransformNode(`vault_${shapeConfig.kind}_root`, scene);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();
  const materials = [];
  const faceEntries = [];

  const sideIdentity = createFaceIdentity(selectionId, shapeConfig.kind, "side", 0);
  const baseIdentity = createFaceIdentity(selectionId, shapeConfig.kind, "base", 1);
  const sideColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_side`);
  const baseColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_base`);
  const sideMaterial = createFaceMaterial(scene, sideIdentity.faceId, sideColor, 0.8);
  const baseMaterial = createFaceMaterial(scene, baseIdentity.faceId, baseColor, 0.8);

  const sideMesh = BABYLON.MeshBuilder.CreateCylinder(sideIdentity.faceId, {
    diameterTop: 0.0001,
    diameterBottom: shapeConfig.radius * 2,
    height: shapeConfig.height,
    tessellation: 72,
    subdivisions: 1,
    cap: BABYLON.Mesh.NO_CAP
  }, scene);
  sideMesh.parent = root;
  sideMesh.material = sideMaterial;
  sideMesh.isPickable = true;
  sideMesh.receiveShadows = true;
  applyFaceIdentity(sideMesh, sideIdentity);
  state.shadowGenerator?.addShadowCaster(sideMesh);

  const baseMesh = BABYLON.MeshBuilder.CreateDisc(baseIdentity.faceId, {
    radius: shapeConfig.radius,
    tessellation: 72
  }, scene);
  baseMesh.parent = root;
  baseMesh.position.y = -shapeConfig.height / 2;
  baseMesh.rotation.x = Math.PI / 2;
  baseMesh.material = baseMaterial;
  baseMesh.isPickable = true;
  baseMesh.receiveShadows = true;
  applyFaceIdentity(baseMesh, baseIdentity);
  state.shadowGenerator?.addShadowCaster(baseMesh);

  materials.push(sideMaterial, baseMaterial);
  faceEntries.push({
    ...sideIdentity,
    mesh: sideMesh,
    material: sideMaterial,
    localNormal: new BABYLON.Vector3(0, 0, 1),
    snapEligible: true
  });
  faceEntries.push({
    ...baseIdentity,
    mesh: baseMesh,
    material: baseMaterial,
    localNormal: new BABYLON.Vector3(0, -1, 0),
    snapEligible: true
  });

  return { root, materials, faceEntries };
}

function createCylinder(scene, shapeConfig, selectionId) {
  const root = new BABYLON.TransformNode(`vault_${shapeConfig.kind}_root`, scene);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();
  const materials = [];
  const faceEntries = [];

  const sideIdentity = createFaceIdentity(selectionId, shapeConfig.kind, "side", 0);
  const topIdentity = createFaceIdentity(selectionId, shapeConfig.kind, "top", 1);
  const bottomIdentity = createFaceIdentity(selectionId, shapeConfig.kind, "bottom", 2);
  const sideColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_side`);
  const topColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_top`);
  const bottomColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_bottom`);
  const sideMaterial = createFaceMaterial(scene, sideIdentity.faceId, sideColor, 0.8);
  const topMaterial = createFaceMaterial(scene, topIdentity.faceId, topColor, 0.8);
  const bottomMaterial = createFaceMaterial(scene, bottomIdentity.faceId, bottomColor, 0.8);

  const sideMesh = BABYLON.MeshBuilder.CreateCylinder(sideIdentity.faceId, {
    diameter: shapeConfig.radius * 2,
    height: shapeConfig.height,
    tessellation: 72,
    subdivisions: 1,
    cap: BABYLON.Mesh.NO_CAP
  }, scene);
  sideMesh.parent = root;
  sideMesh.material = sideMaterial;
  sideMesh.isPickable = true;
  sideMesh.receiveShadows = true;
  applyFaceIdentity(sideMesh, sideIdentity);
  state.shadowGenerator?.addShadowCaster(sideMesh);

  const topMesh = BABYLON.MeshBuilder.CreateDisc(topIdentity.faceId, {
    radius: shapeConfig.radius,
    tessellation: 72
  }, scene);
  topMesh.parent = root;
  topMesh.position.y = shapeConfig.height / 2;
  topMesh.rotation.x = -Math.PI / 2;
  topMesh.material = topMaterial;
  topMesh.isPickable = true;
  topMesh.receiveShadows = true;
  applyFaceIdentity(topMesh, topIdentity);
  state.shadowGenerator?.addShadowCaster(topMesh);

  const bottomMesh = BABYLON.MeshBuilder.CreateDisc(bottomIdentity.faceId, {
    radius: shapeConfig.radius,
    tessellation: 72
  }, scene);
  bottomMesh.parent = root;
  bottomMesh.position.y = -shapeConfig.height / 2;
  bottomMesh.rotation.x = Math.PI / 2;
  bottomMesh.material = bottomMaterial;
  bottomMesh.isPickable = true;
  bottomMesh.receiveShadows = true;
  applyFaceIdentity(bottomMesh, bottomIdentity);
  state.shadowGenerator?.addShadowCaster(bottomMesh);

  materials.push(sideMaterial, topMaterial, bottomMaterial);
  faceEntries.push({
    ...sideIdentity,
    mesh: sideMesh,
    material: sideMaterial,
    localNormal: new BABYLON.Vector3(0, 0, 1),
    snapEligible: true
  });
  faceEntries.push({
    ...topIdentity,
    mesh: topMesh,
    material: topMaterial,
    localNormal: new BABYLON.Vector3(0, 1, 0),
    snapEligible: true
  });
  faceEntries.push({
    ...bottomIdentity,
    mesh: bottomMesh,
    material: bottomMaterial,
    localNormal: new BABYLON.Vector3(0, -1, 0),
    snapEligible: true
  });

  return { root, materials, faceEntries };
}

function createClippedCellMesh(scene, name, cellPosition, cellRadius, neighborCells) {
  if (!neighborCells.length) {
    const fallbackSphere = BABYLON.MeshBuilder.CreateSphere(name, {
      diameter: cellRadius * 2,
      segments: 44
    }, scene);
    return fallbackSphere;
  }

  const clipPlanes = neighborCells
    .map((neighborCell) => {
      const direction = neighborCell.position.subtract(cellPosition);
      const centerDistance = direction.length();

      if (centerDistance <= 0.0001) {
        return null;
      }

      const normal = direction.scale(1 / centerDistance);
      const planeDistanceFromCell = (
        (centerDistance * centerDistance)
        + (cellRadius * cellRadius)
        - (neighborCell.radius * neighborCell.radius)
      ) / (2 * centerDistance);

      return { normal, limit: planeDistanceFromCell };
    })
    .filter(Boolean);

  return createOpenClippedSphereMesh(scene, name, cellRadius, clipPlanes);
}

function createOpenClippedSphereMesh(scene, name, radius, clipPlanes) {
  const mesh = new BABYLON.Mesh(name, scene);
  const latSegments = 34;
  const lonSegments = 52;
  const positions = [];
  const indices = [];
  const normals = [];
  const keptVertexFlags = [];
  const epsilon = 0.018;
  const rowVertexCount = lonSegments + 1;

  for (let latIndex = 0; latIndex <= latSegments; latIndex += 1) {
    const v = latIndex / latSegments;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lonIndex = 0; lonIndex <= lonSegments; lonIndex += 1) {
      const u = lonIndex / lonSegments;
      const phi = u * TAU;
      const position = new BABYLON.Vector3(
        Math.cos(phi) * sinTheta * radius,
        cosTheta * radius,
        Math.sin(phi) * sinTheta * radius
      );
      const keepVertex = clipPlanes.every((clipPlane) => {
        return BABYLON.Vector3.Dot(position, clipPlane.normal) <= clipPlane.limit + epsilon;
      });

      positions.push(position.x, position.y, position.z);
      keptVertexFlags.push(keepVertex);
    }
  }

  for (let latIndex = 0; latIndex < latSegments; latIndex += 1) {
    for (let lonIndex = 0; lonIndex < lonSegments; lonIndex += 1) {
      const topLeft = (latIndex * rowVertexCount) + lonIndex;
      const topRight = topLeft + 1;
      const bottomLeft = ((latIndex + 1) * rowVertexCount) + lonIndex;
      const bottomRight = bottomLeft + 1;

      if (keptVertexFlags[topLeft] && keptVertexFlags[bottomLeft] && keptVertexFlags[topRight]) {
        indices.push(topLeft, topRight, bottomLeft);
      }

      if (keptVertexFlags[topRight] && keptVertexFlags[bottomLeft] && keptVertexFlags[bottomRight]) {
        indices.push(topRight, bottomRight, bottomLeft);
      }
    }
  }

  BABYLON.VertexData.ComputeNormals(positions, indices, normals);

  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh);

  return mesh;
}

function createTransparentCrystal(scene, shapeName, faces, selectionId) {
  const root = new BABYLON.TransformNode(`vault_${shapeName}_root`, scene);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();
  root.metadata = {
    runeLights: [],
    runeEntries: [],
    crystalRuneEntry: null,
    fragmentEntries: [],
    runeFragmentEntries: [],
    fragmentFaceKeys: new Set(),
    subcrystalFaceKeys: new Set(),
    detachedRuneAnchors: []
  };
  const materials = [];
  const faceEntries = [];

  faces.forEach((face, index) => {
    const identity = createFaceIdentity(selectionId, shapeName, face.name, index);
    const faceColor = getBodyColorForSelection(selectionId, `${shapeName}_${face.name}_${index + 1}`);
    const material = createFaceMaterial(
      scene,
      identity.faceId,
      faceColor,
      face.alpha ?? (shapeName === "tetrahedron" ? FRAGMENT_CRYSTAL_ALPHA : DEFAULT_CRYSTAL_ALPHA)
    );
    const faceMesh = createFaceMesh(scene, identity.faceId, face.vertices, material);
    const mesh = faceMesh.mesh;
    mesh.parent = root;
    mesh.isPickable = true;
    mesh.receiveShadows = true;
    mesh.renderingGroupId = shapeName === "tetrahedron" ? 1 : 0;
    applyFaceIdentity(mesh, identity);
    state.shadowGenerator?.addShadowCaster(mesh);
    materials.push(material);
    faceEntries.push({
      ...identity,
      mesh,
      material,
      vertices: face.vertices.map((vertex) => vertex.clone()),
      faceCenter: computeFaceCenter(face.vertices),
      localNormal: faceMesh.localNormal,
      snapEligible: face.snapEligible !== false
    });
  });

  if (shapeName === "tetrahedron") {
    createTetrahedronInteriorCrystals(scene, root, faces, selectionId, materials);
  }

  return { root, materials, faceEntries };
}

function createTetrahedronInteriorCrystals(scene, root, faces, selectionId, materials) {
  // Ziel: Die Form-4-Hierarchie als klar lesbare H1/H2/H3-Raumlogik aufbauen.
  // Warum: Das groesste Symbol muss im Kristallzentrum dominant lesbar sein, die H2-Symbole explizit auf den Aussenflaechen sitzen und die H3-Symbole als kleine Einschluss-Zentren der Fraktale erkennbar bleiben.
  const centroid = computeUniqueVerticesCenter(faces);
  const crystalFaceEntries = buildPolyhedronFaceEntries(faces.map((face) => face.vertices));
  const crystalHeightLine = computePreferredTetrahedronHeightLine(faces);
  const crystalRunePosition = computeMaximumInscribedSphere(crystalFaceEntries).center;
  const crystalRuneGlyphSize = 0.92;
  const crystalRuneGlyphPlaneOffset = 0;
  const crystalRuneGlyphLayout = measureRuneGlyphLayout(CRYSTAL_RUNE_SYMBOL, 512, 24);
  const crystalRunePlacement = computeBalancedRuneRotationAtCenter(
    faces,
    crystalRunePosition,
    crystalHeightLine.axis,
    crystalRuneGlyphSize * H1_ROOT_RUNE_SCALE * crystalRuneGlyphLayout.squareRatio,
    crystalRuneGlyphSize * H1_ROOT_RUNE_SCALE * crystalRuneGlyphLayout.squareRatio,
    crystalRuneGlyphPlaneOffset
  );
  const crystalRuneRotation = crystalRunePlacement.rotation;
  const crystalRuneColor = getBodyColorForSelection(selectionId, "tetrahedron_crystal_rune_primary");
  const crystalRuneMeshes = createRuneMeshes(
    scene,
    `tetrahedron_crystal_rune_${selectionId}`,
    CRYSTAL_RUNE_SYMBOL,
    crystalRuneColor,
    {
      showHalo: true,
      glyphSize: crystalRuneGlyphSize,
      haloScale: 1.76,
      billboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
      emissiveIntensity: 3.4,
      alwaysVisible: true,
      renderingGroupId: 3,
      glyphPlaneOffset: crystalRuneGlyphPlaneOffset,
      haloPlaneOffset: -0.024,
      alphaMode: BABYLON.Engine.ALPHA_COMBINE,
      textureSize: 512,
      outlineWidth: 24
    }
  );

  // Ziel: Das H1-Symbol geometrisch wirklich im Kristallzentrum halten.
  // Warum: Fuer das gewuenschte Lesen der Form zaehlt hier weder der Volumenschwerpunkt noch die pure Linienmitte, sondern die Position, an der die quadratische Symbolflaeche entlang der Koerperachse gleichmaessig Luft zu den Tetraederflaechen hat.
  crystalRuneMeshes.anchor.parent = root;
  crystalRuneMeshes.anchor.position.copyFrom(crystalRunePosition);
  crystalRuneMeshes.anchor.rotationQuaternion = crystalRuneRotation.clone();
  crystalRuneMeshes.anchor.scaling.setAll(1);
  materials.push(...crystalRuneMeshes.materials);
  root.metadata.crystalRuneEntry = {
    entryId: `tetrahedron_crystal_${selectionId}`,
    level: "h1",
    parentId: null,
    selectionId,
    accentHex: crystalRuneColor,
    runeSymbol: CRYSTAL_RUNE_SYMBOL,
    runeAnchor: crystalRuneMeshes.anchor,
    runeAnchorMesh: crystalRuneMeshes.anchor,
    runeGlyphMesh: crystalRuneMeshes.glyphMesh,
    runeHaloMesh: crystalRuneMeshes.haloMesh,
    rootRunePosition: crystalRunePosition.clone(),
    detailRunePosition: crystalRunePosition.clone(),
    rootRuneRotation: crystalRuneRotation.clone(),
    rootRuneScale: H1_ROOT_RUNE_SCALE,
    detailRuneScale: H1_DETAIL_RUNE_SCALE,
    rootBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
    detailBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_ALL,
    detail: createCrystalDetailData({
      selectionId,
      runeSymbol: CRYSTAL_RUNE_SYMBOL,
      accentHex: crystalRuneColor
    })
  };

  faces.forEach((face, faceIndex) => {
    const requestedFragmentRuneCount = getRequestedFragmentRuneCount(selectionId, faceIndex);
    const fractalLayout = getTetrahedronRuneLayout(face.vertices, centroid, requestedFragmentRuneCount);
    const fragmentColor = getBodyColorForSelection(selectionId, `tetrahedron_${face.name}_${faceIndex + 1}`);
    const fragmentRuneColor = getBodyColorForSelection(selectionId, `tetrahedron_fragment_rune_${faceIndex + 1}`);
    const fragmentFaces = buildTetrahedronFragmentFaces(face.vertices, centroid);
    const fragmentRunePosition = computeFragmentFaceRunePosition(face.vertices, centroid);
    const fragmentRuneRotation = quaternionFromUnitVectors(BABYLON.Axis.Z, computeOutwardNormal(face.vertices));
    const fragmentRuneSize = 0.78;
    const fragmentRuneMeshes = createRuneMeshes(
      scene,
      `tetrahedron_fragment_rune_${faceIndex + 1}`,
      TETRA_RUNE_SYMBOLS[faceIndex % TETRA_RUNE_SYMBOLS.length],
      fragmentRuneColor,
      {
        showHalo: true,
        glyphSize: fragmentRuneSize,
        haloScale: 1.7,
        billboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
        emissiveIntensity: 2.8,
        alwaysVisible: false,
        renderingGroupId: 3,
        glyphPlaneOffset: 0.028,
        haloPlaneOffset: -0.018,
        alphaMode: BABYLON.Engine.ALPHA_COMBINE,
        textureSize: 512,
        outlineWidth: 22
      }
    );

    // Ziel: Die H2-Symbole stabil direkt an ihren Fragmentflaechen verankern.
    // Warum: Fragmentsymbole gehoeren auf die nach aussen zeigende Flaeche; ein geloester World-Sync macht daraus nur scheinbar sichtbare Marker statt echte Flaechensymbole.
    fragmentRuneMeshes.anchor.parent = root;
    fragmentRuneMeshes.anchor.position.copyFrom(fragmentRunePosition);
    fragmentRuneMeshes.anchor.rotationQuaternion = fragmentRuneRotation.clone();
    fragmentRuneMeshes.anchor.scaling.setAll(1);
    materials.push(...fragmentRuneMeshes.materials);
    createTetrahedronFragmentBoundaries(
      scene,
      root,
      `tetrahedron_fragment_${faceIndex + 1}`,
      fragmentFaces.slice(1),
      fragmentColor,
      materials
    );

    const fragmentEntry = {
      entryId: `tetrahedron_fragment_${faceIndex + 1}`,
      level: "h2",
      parentId: root.metadata.crystalRuneEntry.entryId,
      selectionId,
      faceIndex,
      faceName: face.name,
      h3Count: requestedFragmentRuneCount,
      accentHex: fragmentRuneColor,
      runeSymbol: TETRA_RUNE_SYMBOLS[faceIndex % TETRA_RUNE_SYMBOLS.length],
      runeAnchor: fragmentRuneMeshes.anchor,
      runeAnchorMesh: fragmentRuneMeshes.anchor,
      runeGlyphMesh: fragmentRuneMeshes.glyphMesh,
      runeHaloMesh: fragmentRuneMeshes.haloMesh,
      rootRunePosition: fragmentRunePosition.clone(),
      detailRunePosition: fragmentRunePosition.clone(),
      rootRuneRotation: fragmentRuneRotation.clone(),
      rootRuneScale: H2_ROOT_RUNE_SCALE,
      detailRuneScale: H2_DETAIL_RUNE_SCALE,
      rootBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
      detailBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_ALL,
      detail: createFragmentDetailData({
        selectionId,
        faceIndex,
        runeSymbol: TETRA_RUNE_SYMBOLS[faceIndex % TETRA_RUNE_SYMBOLS.length],
        accentHex: fragmentRuneColor
      })
    };

    root.metadata.fragmentEntries.push(fragmentEntry);

    fractalLayout.forEach((fractalLayoutItem) => {
      const accentSeed = `tetrahedron_${face.name}_${faceIndex + 1}_fractal_${fractalLayoutItem.runeIndex + 1}`;
      const runeColor = getBodyColorForSelection(selectionId, accentSeed);
      const subcrystal = createTetrahedronRuneSubcrystal(
        scene,
        root,
        `tetrahedron_fractal_${faceIndex + 1}_${fractalLayoutItem.runeIndex + 1}`,
        fractalLayoutItem,
        face.vertices,
        centroid,
        runeColor
      );
      materials.push(...subcrystal.materials);

      const runeSymbol = SUBCRYSTAL_RUNE_SYMBOLS[fractalLayoutItem.runeIndex % SUBCRYSTAL_RUNE_SYMBOLS.length];
      const runeMeshes = createRuneMeshes(
        scene,
        `tetrahedron_base_rune_${faceIndex + 1}_${fractalLayoutItem.runeIndex + 1}`,
        runeSymbol,
        runeColor,
        {
          showHalo: true,
          glyphSize: fractalLayoutItem.runeSize,
          haloScale: 1.52,
          billboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
          emissiveIntensity: 1.45,
          glyphPlaneOffset: 0,
          haloPlaneOffset: -0.006
        }
      );

      runeMeshes.anchor.parent = root;
      runeMeshes.anchor.position.copyFrom(fractalLayoutItem.rootRunePosition);
      runeMeshes.anchor.rotationQuaternion = fractalLayoutItem.rootRuneRotation.clone();
      runeMeshes.anchor.scaling.setAll(1);
      runeMeshes.glyphMesh.renderingGroupId = 3;

      if (runeMeshes.haloMesh) {
        runeMeshes.haloMesh.renderingGroupId = 3;
      }

      root.metadata?.runeLights?.push(...runeMeshes.lights);
      materials.push(...runeMeshes.materials);
      const runeEntry = {
        entryId: `${fragmentEntry.entryId}_rune_${fractalLayoutItem.runeIndex + 1}`,
        level: "h3",
        parentId: fragmentEntry.entryId,
        faceIndex,
        faceName: face.name,
        runeIndex: fractalLayoutItem.runeIndex,
        selectionId,
        accentHex: runeColor,
        runeSymbol,
        runeAnchor: runeMeshes.anchor,
        runeAnchorMesh: runeMeshes.anchor,
        runeGlyphMesh: runeMeshes.glyphMesh,
        runeHaloMesh: runeMeshes.haloMesh,
        rootRunePosition: fractalLayoutItem.rootRunePosition.clone(),
        detailRunePosition: fractalLayoutItem.detailRunePosition.clone(),
        rootRuneRotation: fractalLayoutItem.rootRuneRotation.clone(),
        rootRuneScale: H3_ROOT_RUNE_SCALE,
        detailRuneScale: H3_DETAIL_RUNE_SCALE,
        rootBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
        detailBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_ALL,
        detail: createRuneFragmentDetailData({
          selectionId,
          faceName: face.name,
          faceIndex,
          runeIndex: fractalLayoutItem.runeIndex,
          runeSymbol,
          accentHex: runeColor
        })
      };

      root.metadata.runeFragmentEntries.push(runeEntry);
    });
  });

  root.metadata.runeEntries = [
    root.metadata.crystalRuneEntry,
    ...root.metadata.fragmentEntries,
    ...root.metadata.runeFragmentEntries
  ];
  root.metadata.runeEntries.forEach((item) => {
    setRuneHalosEnabled(item, false);
    setRuneDisplayMode(item, false);
  });
}

function createExtractedTetrahedronCrystal(scene, parent, entry, centroidLocal, allFaceEntries) {
  const root = new BABYLON.TransformNode(`vault_tetrahedron_extract_${entry.faceId}`, scene);
  root.parent = parent;
  root.position.copyFrom(entry.faceCenter);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();

  const materials = [];
  const baseColor = getBodyColorForSelection(entry.selectionId, `tetrahedron_${entry.faceName}_${entry.faceIndex + 1}`);
  const baseMaterial = createFaceMaterial(scene, `${entry.faceId}_extract_base`, baseColor, 0.82);
  applyColorToMaterial(baseMaterial, baseColor);
  baseMaterial.metadata.baseEmissiveColor = baseMaterial.emissiveColor.clone();
  const baseMeshData = createFaceMesh(
    scene,
    `${entry.faceId}_extract_base`,
    entry.vertices.map((vertex) => vertex.subtract(entry.faceCenter)),
    baseMaterial
  );
  const baseMesh = baseMeshData.mesh;

  baseMesh.parent = root;
  baseMesh.isPickable = true;
  baseMesh.receiveShadows = true;
  baseMesh.renderingGroupId = 2;
  baseMesh.metadata = {
    kind: "tetrahedron-exploded-piece",
    sourceFaceId: entry.faceId
  };
  state.shadowGenerator?.addShadowCaster(baseMesh);
  materials.push(baseMaterial);

  entry.vertices.forEach((vertex, vertexIndex) => {
    const nextVertex = entry.vertices[(vertexIndex + 1) % entry.vertices.length];
    const adjacentEntry = findAdjacentFaceEntryForEdge(entry, vertex, nextVertex, allFaceEntries);
    const adjacentColor = adjacentEntry
      ? getBodyColorForSelection(
        adjacentEntry.selectionId,
        `tetrahedron_${adjacentEntry.faceName}_${adjacentEntry.faceIndex + 1}`
      )
      : baseColor;
    const sideColor = mixHexColors(baseColor, adjacentColor, 0.5);
    const sideMaterial = createFaceMaterial(
      scene,
      `${entry.faceId}_extract_side_${vertexIndex + 1}`,
      sideColor,
      0.7
    );
    applyColorToMaterial(sideMaterial, sideColor);
    sideMaterial.metadata.baseEmissiveColor = sideMaterial.emissiveColor.clone();
    const sideMeshData = createFaceMesh(
      scene,
      `${entry.faceId}_extract_side_${vertexIndex + 1}`,
      [
        vertex.subtract(entry.faceCenter),
        nextVertex.subtract(entry.faceCenter),
        centroidLocal.subtract(entry.faceCenter)
      ],
      sideMaterial
    );
    const sideMesh = sideMeshData.mesh;

    sideMesh.parent = root;
    sideMesh.isPickable = true;
    sideMesh.receiveShadows = true;
    sideMesh.renderingGroupId = 2;
    sideMesh.metadata = {
      kind: "tetrahedron-exploded-piece",
      sourceFaceId: entry.faceId
    };
    state.shadowGenerator?.addShadowCaster(sideMesh);
    materials.push(sideMaterial);
  });

  const runeAnchorLocal = centroidLocal.subtract(entry.faceCenter).scale(0.74);
  const runeMeshes = createRuneMeshes(
    scene,
    `${entry.faceId}_rune`,
    TETRA_RUNE_SYMBOLS[entry.faceIndex % TETRA_RUNE_SYMBOLS.length],
    baseColor,
    { showHalo: true }
  );

  runeMeshes.anchor.parent = root;
  runeMeshes.anchor.position.copyFrom(runeAnchorLocal);
  materials.push(...runeMeshes.materials);

  return {
    root,
    materials,
    heightAxisLocal: centroidLocal.subtract(entry.faceCenter).normalize(),
    runeAnchorMesh: runeMeshes.anchor,
    runeHaloMesh: runeMeshes.haloMesh,
    lights: runeMeshes.lights
  };
}

function measureRuneGlyphLayout(runeSymbol, textureSize, outlineWidth) {
  // Ziel: Das sichtbare Symbol als quadratischen Grundkasten fuer Zeichnung und Clearance-Berechnung normieren.
  // Warum: Die Nutzerregel bezieht sich explizit auf eine quadratische Symbolflaeche. Deshalb muessen sichtbare Silhouette und Platzierungsmaße dieselbe Quadrat-Logik verwenden statt ein natuerlich hohes Font-Rechteck zu mischen.
  const cacheKey = `${runeSymbol}__${textureSize}__${outlineWidth}`;
  const cachedLayout = runeGlyphLayoutCache.get(cacheKey);

  if (cachedLayout) {
    return cachedLayout;
  }

  const canvas = document.createElement("canvas");
  canvas.width = textureSize;
  canvas.height = textureSize;
  const context = canvas.getContext("2d");
  const fontSize = Math.round(textureSize * 0.46);

  context.font = `700 ${fontSize}px 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Arial Unicode MS', 'Times New Roman'`;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";

  const glyphMetrics = context.measureText(runeSymbol);
  const left = Number.isFinite(glyphMetrics.actualBoundingBoxLeft) ? glyphMetrics.actualBoundingBoxLeft : fontSize * 0.28;
  const right = Number.isFinite(glyphMetrics.actualBoundingBoxRight) ? glyphMetrics.actualBoundingBoxRight : fontSize * 0.28;
  const ascent = Number.isFinite(glyphMetrics.actualBoundingBoxAscent) ? glyphMetrics.actualBoundingBoxAscent : fontSize * 0.38;
  const descent = Number.isFinite(glyphMetrics.actualBoundingBoxDescent) ? glyphMetrics.actualBoundingBoxDescent : fontSize * 0.18;
  const padding = Math.max(outlineWidth * 0.85, textureSize * 0.065);
  const naturalWidthRatio = Math.min(0.96, ((left + right) + (padding * 2)) / textureSize);
  const naturalHeightRatio = Math.min(0.96, ((ascent + descent) + (padding * 2)) / textureSize);
  const squareRatio = Math.min(0.94, Math.max(0.24, Math.min(naturalWidthRatio, naturalHeightRatio)));
  const safeWidthRatio = Math.max(naturalWidthRatio, 0.0001);
  const safeHeightRatio = Math.max(naturalHeightRatio, 0.0001);
  const layout = {
    offsetX: (left - right) / 2,
    offsetY: (ascent - descent) / 2,
    naturalWidthRatio,
    naturalHeightRatio,
    squareRatio,
    widthRatio: squareRatio,
    heightRatio: squareRatio,
    drawScaleX: squareRatio / safeWidthRatio,
    drawScaleY: squareRatio / safeHeightRatio
  };

  runeGlyphLayoutCache.set(cacheKey, layout);
  return layout;
}

function createRuneMeshes(scene, name, runeSymbol, accentHex, options = {}) {
  const {
    showHalo = true,
    glyphSize = 0.38,
    haloScale = 1.47,
    billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL,
    emissiveIntensity = 1.35,
    alwaysVisible = false,
    renderingGroupId = 3,
    glyphPlaneOffset = 0.006,
    haloPlaneOffset = -0.006,
    alphaMode = BABYLON.Engine.ALPHA_COMBINE,
    textureSize = 256,
    outlineWidth = 14
  } = options;
  // Ziel: Symbole als wiederverwendbaren Renderbaustein fuer Root- und Detail-View bereitstellen.
  // Warum: Die Symbole muessen je nach Ebene zwischen unauffaelligem Einschluss, dominantem Zentralsymbol und klar lesbarer Detailansicht umschalten koennen, ohne pro Ebene komplett getrennte Mesh-Pfade zu pflegen.
  const anchor = new BABYLON.TransformNode(`${name}_anchor`, scene);
  const runeTexture = new BABYLON.DynamicTexture(`${name}_glyph_texture`, { width: textureSize, height: textureSize }, scene, true);
  const haloTexture = showHalo
    ? new BABYLON.DynamicTexture(`${name}_halo_texture`, { width: textureSize, height: textureSize }, scene, true)
    : null;
  const accentColor = BABYLON.Color3.FromHexString(accentHex);
  const runeContext = runeTexture.getContext();
  const haloContext = haloTexture?.getContext() || null;
  const halfTexture = textureSize / 2;
  const fontSize = Math.round(textureSize * 0.46);
  const shadowBlur = Math.round(textureSize * (alwaysVisible ? 0.17 : 0.1));
  const haloRadius = Math.round(textureSize * 0.34);
  const haloLineWidth = Math.max(4, Math.round(textureSize * 0.02));
  const glyphLayout = measureRuneGlyphLayout(runeSymbol, textureSize, outlineWidth);

  runeContext.clearRect(0, 0, textureSize, textureSize);
  runeContext.save();
  runeContext.translate(halfTexture, halfTexture);
  runeContext.scale(glyphLayout.drawScaleX, glyphLayout.drawScaleY);
  runeContext.fillStyle = accentHex;
  runeContext.shadowColor = `${accentHex}ee`;
  runeContext.shadowBlur = shadowBlur;
  runeContext.strokeStyle = "rgba(0, 0, 0, 0.88)";
  runeContext.lineWidth = outlineWidth;
  runeContext.lineJoin = "round";
  runeContext.font = `700 ${fontSize}px 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Arial Unicode MS', 'Times New Roman'`;
  runeContext.textAlign = "center";
  runeContext.textBaseline = "alphabetic";
  runeContext.strokeText(runeSymbol, glyphLayout.offsetX, glyphLayout.offsetY);
  runeContext.fillText(runeSymbol, glyphLayout.offsetX, glyphLayout.offsetY);
  runeContext.restore();
  runeTexture.update();

  if (haloContext && haloTexture) {
    haloContext.clearRect(0, 0, textureSize, textureSize);
    haloContext.save();
    haloContext.translate(halfTexture, halfTexture);
    haloContext.beginPath();
    haloContext.arc(0, 0, haloRadius, 0, TAU);
    haloContext.lineWidth = haloLineWidth;
    haloContext.strokeStyle = `${accentHex}dd`;
    haloContext.shadowColor = accentHex;
    haloContext.shadowBlur = shadowBlur;
    haloContext.stroke();
    haloContext.restore();
    haloTexture.update();
  }

  const glyphMaterial = new BABYLON.StandardMaterial(`${name}_glyph_material`, scene);
  glyphMaterial.diffuseTexture = runeTexture;
  glyphMaterial.opacityTexture = runeTexture;
  glyphMaterial.diffuseColor = BABYLON.Color3.White();
  glyphMaterial.emissiveColor = accentColor.scale(emissiveIntensity * 0.34);
  glyphMaterial.specularColor = new BABYLON.Color3(0.92, 0.94, 1.0);
  glyphMaterial.specularPower = 96;
  glyphMaterial.alpha = RUNE_GLYPH_ALPHA;
  glyphMaterial.disableLighting = false;
  glyphMaterial.backFaceCulling = false;
  glyphMaterial.useAlphaFromDiffuseTexture = true;
  glyphMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  glyphMaterial.alphaMode = alphaMode;
  glyphMaterial.disableDepthWrite = alwaysVisible;
  glyphMaterial.zOffset = alwaysVisible ? -6 : 0;

  const haloMaterial = showHalo
    ? new BABYLON.StandardMaterial(`${name}_halo_material`, scene)
    : null;

  if (haloMaterial && haloTexture) {
    haloMaterial.diffuseTexture = haloTexture;
    haloMaterial.opacityTexture = haloTexture;
    haloMaterial.diffuseColor = BABYLON.Color3.White();
    haloMaterial.emissiveColor = accentColor.scale(Math.max(0.7, emissiveIntensity * 0.24));
    haloMaterial.specularColor = new BABYLON.Color3(0.88, 0.9, 0.96);
    haloMaterial.specularPower = 72;
    haloMaterial.alpha = RUNE_HALO_ALPHA;
    haloMaterial.disableLighting = false;
    haloMaterial.backFaceCulling = false;
    haloMaterial.useAlphaFromDiffuseTexture = true;
    haloMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    haloMaterial.alphaMode = alphaMode;
    haloMaterial.disableDepthWrite = alwaysVisible;
    haloMaterial.zOffset = alwaysVisible ? -7 : 0;
  }

  const glyphMesh = BABYLON.MeshBuilder.CreatePlane(`${name}_glyph`, {
    width: glyphSize,
    height: glyphSize
  }, scene);
  const haloMesh = showHalo
    ? BABYLON.MeshBuilder.CreatePlane(`${name}_halo`, {
      width: glyphSize * haloScale,
      height: glyphSize * haloScale
    }, scene)
    : null;

  glyphMesh.parent = anchor;
  glyphMesh.material = glyphMaterial;
  glyphMesh.renderingGroupId = renderingGroupId;
  glyphMesh.isPickable = true;
  glyphMesh.alwaysSelectAsActiveMesh = alwaysVisible;
  glyphMesh.billboardMode = billboardMode;
  glyphMesh.position.z = glyphPlaneOffset;

  if (haloMesh && haloMaterial) {
    haloMesh.parent = anchor;
    haloMesh.material = haloMaterial;
    haloMesh.renderingGroupId = renderingGroupId;
    haloMesh.isPickable = false;
    haloMesh.alwaysSelectAsActiveMesh = alwaysVisible;
    haloMesh.billboardMode = billboardMode;
    haloMesh.position.z = haloPlaneOffset;
    haloMesh.setEnabled(false);
  }

  if (alwaysVisible) {
    const applyAlwaysDepthMode = () => {
      const engine = scene.getEngine();

      if (typeof engine.setDepthFunctionToAlways === "function") {
        engine.setDepthFunctionToAlways();
      }
    };
    const restoreDepthMode = () => {
      const engine = scene.getEngine();

      if (typeof engine.setDepthFunctionToLessOrEqual === "function") {
        engine.setDepthFunctionToLessOrEqual();
      }
    };

    glyphMesh.onBeforeRenderObservable.add(applyAlwaysDepthMode);
    glyphMesh.onAfterRenderObservable.add(restoreDepthMode);

    if (haloMesh) {
      haloMesh.onBeforeRenderObservable.add(applyAlwaysDepthMode);
      haloMesh.onAfterRenderObservable.add(restoreDepthMode);
    }
  }

  return {
    anchor,
    glyphMesh,
    haloMesh,
    materials: [glyphMaterial, haloMaterial].filter(Boolean),
    lights: []
  };
}

function createTetrahedronRuneSubcrystal(scene, parent, name, layoutItem, faceVertices, centroid, accentHex) {
  const root = new BABYLON.TransformNode(name, scene);
  const materials = [];
  const subcrystalFaces = layoutItem.fractalFaces
    ? layoutItem.fractalFaces.map((vertices) => vertices.map((vertex) => vertex.clone()))
    : buildTetrahedronSubcrystalFaces(layoutItem);
  const renderedFaceKeys = parent.metadata?.subcrystalFaceKeys;

  root.parent = parent;

  subcrystalFaces.forEach((vertices, index) => {
    const faceKey = getFaceKey(vertices);

    if (renderedFaceKeys?.has(faceKey)) {
      return;
    }

    renderedFaceKeys?.add(faceKey);
    const material = createFaceMaterial(scene, `${name}_face_${index + 1}`, accentHex, RUNE_FRAGMENT_ALPHA);
    applyColorToMaterial(material, accentHex);
    material.metadata.baseEmissiveColor = material.emissiveColor.clone();
    material.needDepthPrePass = false;
    material.separateCullingPass = false;
    material.forceDepthWrite = false;
    material.zOffset = -2;
    const faceMesh = createFaceMesh(scene, `${name}_face_${index + 1}`, vertices, material);

    faceMesh.mesh.parent = root;
    faceMesh.mesh.isPickable = false;
    faceMesh.mesh.receiveShadows = true;
    faceMesh.mesh.renderingGroupId = 2;
    state.shadowGenerator?.addShadowCaster(faceMesh.mesh);
    materials.push(material);
  });

  return { root, materials };
}

function createFaceMaterial(scene, name, colorHex, alpha = 0.8) {
  const material = new BABYLON.StandardMaterial(`vaultMaterial_${name}`, scene);
  applyColorToMaterial(material, colorHex);
  material.specularColor = BABYLON.Color3.Black();
  material.specularPower = 1;
  material.alpha = alpha;
  material.disableLighting = false;
  material.backFaceCulling = false;
  material.twoSidedLighting = true;
  material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
  material.needDepthPrePass = true;
  material.separateCullingPass = true;
  material.metadata = {
    baseEmissiveColor: material.emissiveColor.clone()
  };
  return material;
}

function createCellMaterial(scene, name, colorHex) {
  const material = new BABYLON.StandardMaterial(`vaultCellMaterial_${name}`, scene);
  const color = BABYLON.Color3.FromHexString(colorHex);

  material.diffuseColor = color.scale(1.02);
  material.ambientColor = color.scale(0.3);
  material.emissiveColor = color.scale(0.035);
  material.specularColor = BABYLON.Color3.Black();
  material.specularPower = 1;
  material.alpha = DEFAULT_CRYSTAL_ALPHA;
  material.disableLighting = false;
  material.backFaceCulling = true;
  material.twoSidedLighting = false;
  material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
  material.needDepthPrePass = false;
  material.metadata = {
    baseEmissiveColor: material.emissiveColor.clone()
  };

  return material;
}

function createCellOccluderMaterial(scene, name) {
  const material = new BABYLON.StandardMaterial(`vaultCellOccluder_${name}`, scene);
  material.alpha = 0;
  material.disableLighting = true;
  material.backFaceCulling = true;
  material.forceDepthWrite = true;
  material.disableColorWrite = true;
  return material;
}

function getBodyColorForSelection(selectionId, partKey = "body") {
  let cachedColors = state.selectionColors.get(selectionId);

  if (!cachedColors) {
    cachedColors = new Map();
    state.selectionColors.set(selectionId, cachedColors);
  }

  const cachedColor = cachedColors.get(partKey);

  if (cachedColor) {
    return cachedColor;
  }

  const hue = Math.random() * 360;
  const saturation = 70 + (Math.random() * 12);
  const lightness = 64 + (Math.random() * 10);
  const colorHex = hslToHex(hue, saturation, lightness);

  cachedColors.set(partKey, colorHex);
  return colorHex;
}

function hslToHex(hue, saturation, lightness) {
  const normalizedHue = (((hue % 360) + 360) % 360) / 360;
  const normalizedSaturation = Math.max(0, Math.min(1, saturation / 100));
  const normalizedLightness = Math.max(0, Math.min(1, lightness / 100));

  if (normalizedSaturation === 0) {
    const gray = Math.round(normalizedLightness * 255).toString(16).padStart(2, "0");
    return `#${gray}${gray}${gray}`;
  }

  const q = normalizedLightness < 0.5
    ? normalizedLightness * (1 + normalizedSaturation)
    : normalizedLightness + normalizedSaturation - (normalizedLightness * normalizedSaturation);
  const p = (2 * normalizedLightness) - q;
  const toChannel = (offset) => {
    let channelHue = normalizedHue + offset;

    if (channelHue < 0) {
      channelHue += 1;
    }

    if (channelHue > 1) {
      channelHue -= 1;
    }

    let channel;

    if (channelHue < 1 / 6) {
      channel = p + ((q - p) * 6 * channelHue);
    } else if (channelHue < 1 / 2) {
      channel = q;
    } else if (channelHue < 2 / 3) {
      channel = p + ((q - p) * (2 / 3 - channelHue) * 6);
    } else {
      channel = p;
    }

    return Math.round(channel * 255).toString(16).padStart(2, "0");
  };

  return `#${toChannel(1 / 3)}${toChannel(0)}${toChannel(-1 / 3)}`;
}

function mixHexColors(leftHex, rightHex, mixAmount = 0.5) {
  const leftColor = BABYLON.Color3.FromHexString(leftHex);
  const rightColor = BABYLON.Color3.FromHexString(rightHex);
  const mixedColor = BABYLON.Color3.Lerp(leftColor, rightColor, mixAmount);

  return mixedColor.toHexString();
}

function findAdjacentFaceEntryForEdge(sourceEntry, leftVertex, rightVertex, faceEntries) {
  const edgeKey = getVertexPairKey(leftVertex, rightVertex);

  return faceEntries.find((entry) => {
    if (entry === sourceEntry || entry.shapeKind !== sourceEntry.shapeKind || !entry.vertices) {
      return false;
    }

    return entry.vertices.some((vertex, index) => {
      const nextVertex = entry.vertices[(index + 1) % entry.vertices.length];
      return getVertexPairKey(vertex, nextVertex) === edgeKey;
    });
  }) || null;
}

function applyColorToMaterial(material, colorHex) {
  const color = BABYLON.Color3.FromHexString(colorHex);
  material.diffuseColor = color.scale(1.04);
  material.ambientColor = color.scale(0.32);
  material.emissiveColor = color.scale(0.055);
}

function createFaceMesh(scene, name, vertices, material) {
  const mesh = new BABYLON.Mesh(`vaultFace_${name}`, scene);
  const positions = vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);
  let indices = [];
  const normals = [];
  const localNormal = computeFaceNormal(vertices);
  const faceCenter = computeFaceCenter(vertices);
  const shouldFlip = BABYLON.Vector3.Dot(localNormal, faceCenter) < 0;

  for (let index = 1; index < vertices.length - 1; index += 1) {
    if (shouldFlip) {
      indices.push(0, index + 1, index);
    } else {
      indices.push(0, index, index + 1);
    }
  }

  BABYLON.VertexData.ComputeNormals(positions, indices, normals);

  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh);

  mesh.material = material;
  return {
    mesh,
    localNormal: shouldFlip ? localNormal.scale(-1) : localNormal
  };
}

function buildRegularPrismFaces(sides, radius, height, rotationOffset = 0) {
  const top = buildRegularPolygonVertices(sides, radius, height / 2, rotationOffset);
  const bottom = buildRegularPolygonVertices(sides, radius, -height / 2, rotationOffset);
  const faces = [
    { name: "top", vertices: top.slice().reverse() },
    { name: "bottom", vertices: bottom.slice() }
  ];

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    faces.push({
      name: `side_${index + 1}`,
      vertices: [
        top[index].clone(),
        top[nextIndex].clone(),
        bottom[nextIndex].clone(),
        bottom[index].clone()
      ]
    });
  }

  return faces;
}

function buildRegularPyramidFaces(sides, radius, height, rotationOffset = 0) {
  const base = buildRegularPolygonVertices(sides, radius, -height / 2, rotationOffset);
  const apex = new BABYLON.Vector3(0, height / 2, 0);
  const faces = [
    { name: "base", vertices: base.slice() }
  ];

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    faces.push({
      name: `side_${index + 1}`,
      vertices: [
        base[index].clone(),
        base[nextIndex].clone(),
        apex.clone()
      ]
    });
  }

  return faces;
}

function buildPrismCapFaces(sides, radius, prismHeight, capHeight, rotationOffset = 0) {
  const totalHeight = prismHeight + capHeight;
  const bottomY = -totalHeight / 2;
  const topY = bottomY + prismHeight;
  const apexY = totalHeight / 2;
  const bottom = buildRegularPolygonVertices(sides, radius, bottomY, rotationOffset);
  const top = buildRegularPolygonVertices(sides, radius, topY, rotationOffset);
  const apex = new BABYLON.Vector3(0, apexY, 0);
  const faces = [
    { name: "base", vertices: bottom.slice() }
  ];

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    faces.push({
      name: `prism_side_${index + 1}`,
      vertices: [
        top[index].clone(),
        top[nextIndex].clone(),
        bottom[nextIndex].clone(),
        bottom[index].clone()
      ]
    });
  }

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    faces.push({
      name: `cap_side_${index + 1}`,
      vertices: [
        top[index].clone(),
        apex.clone(),
        top[nextIndex].clone()
      ]
    });
  }

  return faces;
}

function buildRegularBipyramidFaces(sides, radius, height, rotationOffset = 0) {
  const base = buildRegularPolygonVertices(sides, radius, 0, rotationOffset);
  const topApex = new BABYLON.Vector3(0, height / 2, 0);
  const bottomApex = new BABYLON.Vector3(0, -height / 2, 0);
  const faces = [];

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    faces.push({
      name: `top_${index + 1}`,
      vertices: [
        base[index].clone(),
        base[nextIndex].clone(),
        topApex.clone()
      ]
    });
    faces.push({
      name: `bottom_${index + 1}`,
      vertices: [
        base[nextIndex].clone(),
        base[index].clone(),
        bottomApex.clone()
      ]
    });
  }

  return faces;
}

function buildCornerCutBipyramidFaces(sides, radius, height, rotationOffset = 0, truncateRatio = 0.34, corner = "top") {
  const base = buildRegularPolygonVertices(sides, radius, 0, rotationOffset);
  const topApex = new BABYLON.Vector3(0, height / 2, 0);
  const bottomApex = new BABYLON.Vector3(0, -height / 2, 0);

  if (corner.startsWith("equator_")) {
    const cornerIndex = (Number(corner.split("_")[1]) - 1 + sides) % sides;
    const previousIndex = (cornerIndex - 1 + sides) % sides;
    const nextIndex = (cornerIndex + 1) % sides;
    const cornerVertex = base[cornerIndex];
    const previousVertex = base[previousIndex];
    const nextVertex = base[nextIndex];
    const topCut = BABYLON.Vector3.Lerp(cornerVertex, topApex, truncateRatio);
    const bottomCut = BABYLON.Vector3.Lerp(cornerVertex, bottomApex, truncateRatio);
    const previousCut = BABYLON.Vector3.Lerp(cornerVertex, previousVertex, truncateRatio);
    const nextCut = BABYLON.Vector3.Lerp(cornerVertex, nextVertex, truncateRatio);
    const faces = [
      {
        name: `${corner}_cut`,
        vertices: [
          topCut.clone(),
          nextCut.clone(),
          bottomCut.clone(),
          previousCut.clone()
        ]
      }
    ];

    for (let index = 0; index < sides; index += 1) {
      const nextIndexLoop = (index + 1) % sides;

      if (index === cornerIndex) {
        faces.push({
          name: `top_${index + 1}`,
          vertices: [
            base[nextIndexLoop].clone(),
            topApex.clone(),
            topCut.clone(),
            nextCut.clone()
          ]
        });
        faces.push({
          name: `bottom_${index + 1}`,
          vertices: [
            base[nextIndexLoop].clone(),
            nextCut.clone(),
            bottomCut.clone(),
            bottomApex.clone()
          ]
        });
        continue;
      }

      if (nextIndexLoop === cornerIndex) {
        faces.push({
          name: `top_${index + 1}`,
          vertices: [
            base[index].clone(),
            previousCut.clone(),
            topCut.clone(),
            topApex.clone()
          ]
        });
        faces.push({
          name: `bottom_${index + 1}`,
          vertices: [
            base[index].clone(),
            bottomApex.clone(),
            bottomCut.clone(),
            previousCut.clone()
          ]
        });
        continue;
      }

      faces.push({
        name: `top_${index + 1}`,
        vertices: [
          base[index].clone(),
          base[nextIndexLoop].clone(),
          topApex.clone()
        ]
      });
      faces.push({
        name: `bottom_${index + 1}`,
        vertices: [
          base[nextIndexLoop].clone(),
          base[index].clone(),
          bottomApex.clone()
        ]
      });
    }

    return faces;
  }

  const cutApex = corner === "bottom" ? bottomApex : topApex;
  const fixedApex = corner === "bottom" ? topApex : bottomApex;
  const cutRing = base.map((vertex) => BABYLON.Vector3.Lerp(cutApex, vertex, truncateRatio));
  const faces = [
    {
      name: `${corner}_cut`,
      vertices: cutRing.map((vertex) => vertex.clone())
    }
  ];

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;

    if (corner === "top") {
      faces.push({
        name: `top_${index + 1}`,
        vertices: [
          base[index].clone(),
          base[nextIndex].clone(),
          cutRing[nextIndex].clone(),
          cutRing[index].clone()
        ]
      });
      faces.push({
        name: `bottom_${index + 1}`,
        vertices: [
          base[nextIndex].clone(),
          base[index].clone(),
          fixedApex.clone()
        ]
      });
    } else {
      faces.push({
        name: `top_${index + 1}`,
        vertices: [
          base[index].clone(),
          base[nextIndex].clone(),
          fixedApex.clone()
        ]
      });
      faces.push({
        name: `bottom_${index + 1}`,
        vertices: [
          base[nextIndex].clone(),
          base[index].clone(),
          cutRing[index].clone(),
          cutRing[nextIndex].clone()
        ]
      });
    }
  }

  return faces;
}

function buildAugmentedCubeFaces(edge, pyramidFaces, tetraFaces) {
  const cubeFaces = buildRegularPrismFaces(4, edge / Math.SQRT2, edge, Math.PI / 4)
    .map((face) => ({ ...face, key: face.name }));
  const pyramidFaceSet = new Set(pyramidFaces);
  let faces = [];

  cubeFaces.forEach((face) => {
    if (!pyramidFaceSet.has(face.key)) {
      faces.push(face);
      return;
    }

    const augmentedFaces = augmentFaceWithRegularApex(
      face,
      getSquarePyramidHeight(face),
      `${face.key}_pyramid`
    );
    faces.push(...augmentedFaces);
  });

  tetraFaces.forEach((targetKey) => {
    const targetIndex = faces.findIndex((face) => face.key === targetKey);

    if (targetIndex === -1) {
      return;
    }

    const targetFace = faces[targetIndex];
    const augmentedFaces = augmentFaceWithRegularApex(
      targetFace,
      getTetrahedronHeight(targetFace),
      `${targetFace.key}_tetra`
    );

    faces.splice(targetIndex, 1, ...augmentedFaces);
  });

  return faces.map((face) => ({
    name: face.key,
    vertices: face.vertices
  }));
}

function buildAugmentedPrismFaces(sides, radius, height, rotationOffset = 0, pyramidFaces = [], tetraFaces = []) {
  let faces = buildRegularPrismFaces(sides, radius, height, rotationOffset)
    .map((face) => ({ ...face, key: face.name }));

  pyramidFaces.forEach((targetKey) => {
    const targetIndex = faces.findIndex((face) => face.key === targetKey);

    if (targetIndex === -1) {
      return;
    }

    const targetFace = faces[targetIndex];
    const augmentedFaces = augmentFaceWithRegularApex(
      targetFace,
      getSquarePyramidHeight(targetFace),
      `${targetFace.key}_pyramid`
    );

    faces.splice(targetIndex, 1, ...augmentedFaces);
  });

  tetraFaces.forEach((targetKey) => {
    const targetIndex = faces.findIndex((face) => face.key === targetKey);

    if (targetIndex === -1) {
      return;
    }

    const targetFace = faces[targetIndex];
    const augmentedFaces = augmentFaceWithRegularApex(
      targetFace,
      getTetrahedronHeight(targetFace),
      `${targetFace.key}_tetra`
    );

    faces.splice(targetIndex, 1, ...augmentedFaces);
  });

  return faces.map((face) => ({
    name: face.key,
    vertices: face.vertices
  }));
}

function buildGrownCrystalFaces(sides, radius, bodyHeight, tipHeight, rotationOffset = 0, seed = 1) {
  const totalHeight = bodyHeight + tipHeight;
  const bottomY = -totalHeight / 2;
  const shoulderY = bottomY + bodyHeight;
  const leanX = seededRange(seed, 1, -0.12, 0.12) * radius;
  const leanZ = seededRange(seed, 2, -0.12, 0.12) * radius;
  const lobeCount = Math.max(2, Math.min(4, Math.round(sides / 3)));
  const lobePhase = rotationOffset + seededRange(seed, 3, -0.3, 0.3);
  const bottomOffset = new BABYLON.Vector3(-leanX * 0.42, 0, -leanZ * 0.42);
  const shoulderOffset = new BABYLON.Vector3(leanX, 0, leanZ);
  const bottom = buildIrregularCrystalRingVertices(
    sides,
    radius * seededRange(seed, 4, 0.34, 0.48),
    bottomY,
    rotationOffset + seededRange(seed, 5, -0.08, 0.08),
    seed + 10,
    0.08,
    0.03,
    bottomOffset,
    {
      lobes: lobeCount,
      amplitude: 0.04,
      phase: lobePhase
    }
  );
  const shoulder = buildIrregularCrystalRingVertices(
    sides,
    radius * seededRange(seed, 6, 0.96, 1.08),
    shoulderY,
    rotationOffset + seededRange(seed, 7, -0.12, 0.12),
    seed + 30,
    0.12,
    0.06,
    shoulderOffset,
    {
      lobes: lobeCount,
      amplitude: 0.2,
      phase: lobePhase
    }
  );
  const tipTargets = buildClusterTipTargets(
    lobeCount,
    shoulderY,
    tipHeight,
    radius * 0.24,
    shoulderOffset,
    seed,
    lobePhase
  );
  const faces = [
    {
      name: "base",
      vertices: bottom.slice(),
      alpha: 0.8,
      snapEligible: false
    }
  ];

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    faces.push({
      name: `shaft_${index + 1}`,
      vertices: [
        shoulder[index].clone(),
        shoulder[nextIndex].clone(),
        bottom[nextIndex].clone(),
        bottom[index].clone()
      ]
    });
  }

  for (let index = 0; index < sides; index += 1) {
    const nextIndex = (index + 1) % sides;
    const tipIndex = Math.floor((((index + 0.5) / sides) * lobeCount)) % lobeCount;
    faces.push({
      name: `tip_${index + 1}`,
      vertices: [
        shoulder[index].clone(),
        tipTargets[tipIndex].clone(),
        shoulder[nextIndex].clone()
      ]
    });
  }

  return faces;
}

function buildClusterTipTargets(count, shoulderY, tipHeight, spread, offset, seed, phase) {
  return Array.from({ length: count }, (_, index) => {
    const angle = phase
      + ((index / count) * Math.PI * 2)
      + seededRange(seed, 100 + index, -0.16, 0.16);
    const radialDistance = spread * seededRange(seed, 120 + index, 0.4, 1);

    return new BABYLON.Vector3(
      offset.x + (Math.cos(angle) * radialDistance),
      shoulderY + (tipHeight * seededRange(seed, 140 + index, 0.86, 1.06)),
      offset.z + (Math.sin(angle) * radialDistance)
    );
  });
}

function augmentFaceWithRegularApex(face, height, keyPrefix) {
  const center = computeFaceCenter(face.vertices);
  const normal = computeOutwardNormal(face.vertices, center);
  const apex = center.add(normal.scale(height));

  return face.vertices.map((vertex, index, vertices) => {
    const nextVertex = vertices[(index + 1) % vertices.length];

    return {
      key: `${keyPrefix}_${index + 1}`,
      vertices: [
        vertex.clone(),
        nextVertex.clone(),
        apex.clone()
      ]
    };
  });
}

function getSquarePyramidHeight(face) {
  const edgeLength = BABYLON.Vector3.Distance(face.vertices[0], face.vertices[1]);
  return edgeLength / Math.SQRT2;
}

function getTetrahedronHeight(face) {
  const edgeLength = BABYLON.Vector3.Distance(face.vertices[0], face.vertices[1]);
  return edgeLength * Math.sqrt(2 / 3);
}

function getAugmentedPrismEdge(sides) {
  return Math.max(0.82, 1.18 - ((sides - 3) * 0.07));
}

function getGrownCrystalEdge(sides) {
  return Math.max(0.58, 0.82 - ((sides - 4) * 0.035));
}

function buildTetrahedronFaces(radius) {
  const vertices = normalizeVertices([
    new BABYLON.Vector3(1, 1, 1),
    new BABYLON.Vector3(-1, -1, 1),
    new BABYLON.Vector3(-1, 1, -1),
    new BABYLON.Vector3(1, -1, -1)
  ], radius);

  return buildPolyhedronFaces("tetrahedron", vertices, [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2]
  ]);
}

function buildIcosahedronFaces(radius) {
  const data = getIcosahedronData(radius);
  return buildPolyhedronFaces("icosahedron", data.vertices, data.faces);
}

function buildDodecahedronFaces(radius) {
  const icosahedron = getIcosahedronData(1);
  const dodecaVertices = icosahedron.faces.map((face) => {
    const centroid = BABYLON.Vector3.Zero();

    face.forEach((vertexIndex) => {
      centroid.addInPlace(icosahedron.vertices[vertexIndex]);
    });

    centroid.scaleInPlace(1 / face.length);
    return centroid.normalize().scale(radius);
  });

  return icosahedron.vertices.map((vertex, vertexIndex) => {
    const adjacentFaceIndices = icosahedron.faces.reduce((matches, face, faceIndex) => {
      if (face.includes(vertexIndex)) {
        matches.push(faceIndex);
      }

      return matches;
    }, []);

    const normal = vertex.clone().normalize();
    const referenceAxis = Math.abs(normal.y) < 0.9
      ? new BABYLON.Vector3(0, 1, 0)
      : new BABYLON.Vector3(1, 0, 0);
    const tangent = BABYLON.Vector3.Cross(referenceAxis, normal).normalize();
    const bitangent = BABYLON.Vector3.Cross(normal, tangent).normalize();

    const orderedFaceIndices = adjacentFaceIndices
      .map((faceIndex) => {
        const point = dodecaVertices[faceIndex];
        const projected = point.subtract(normal.scale(BABYLON.Vector3.Dot(point, normal)));
        const angle = Math.atan2(
          BABYLON.Vector3.Dot(projected, bitangent),
          BABYLON.Vector3.Dot(projected, tangent)
        );

        return { faceIndex, angle };
      })
      .sort((left, right) => left.angle - right.angle)
      .map((entry) => entry.faceIndex);

    return {
      name: `face_${vertexIndex + 1}`,
      vertices: orderedFaceIndices.map((faceIndex) => dodecaVertices[faceIndex].clone())
    };
  });
}

function getIcosahedronData(radius) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const rawVertices = [
    new BABYLON.Vector3(-1, phi, 0),
    new BABYLON.Vector3(1, phi, 0),
    new BABYLON.Vector3(-1, -phi, 0),
    new BABYLON.Vector3(1, -phi, 0),
    new BABYLON.Vector3(0, -1, phi),
    new BABYLON.Vector3(0, 1, phi),
    new BABYLON.Vector3(0, -1, -phi),
    new BABYLON.Vector3(0, 1, -phi),
    new BABYLON.Vector3(phi, 0, -1),
    new BABYLON.Vector3(phi, 0, 1),
    new BABYLON.Vector3(-phi, 0, -1),
    new BABYLON.Vector3(-phi, 0, 1)
  ];

  return {
    vertices: normalizeVertices(rawVertices, radius),
    faces: [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1]
    ]
  };
}

function buildPolyhedronFaces(name, vertices, faceIndices) {
  return faceIndices.map((indices, index) => ({
    name: `${name}_${index + 1}`,
    vertices: indices.map((vertexIndex) => vertices[vertexIndex].clone())
  }));
}

function buildRegularPolygonVertices(sides, radius, y, rotationOffset = 0) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotationOffset + ((index / sides) * Math.PI * 2);
    return new BABYLON.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
  });
}

function buildIrregularCrystalRingVertices(sides, radius, y, rotationOffset, seed, radialJitter, angleJitter, offset = BABYLON.Vector3.Zero(), profile = null) {
  return Array.from({ length: sides }, (_, index) => {
    const baseAngle = rotationOffset + ((index / sides) * Math.PI * 2);
    const angle = baseAngle + seededRange(seed, index + 1, -angleJitter, angleJitter);
    const radiusFactor = 1 + seededRange(seed, sides + index + 1, -radialJitter, radialJitter);
    const lobeWave = profile
      ? Math.max(0, Math.cos((baseAngle - profile.phase) * profile.lobes))
      : 0;
    const lobeFactor = 1 + (lobeWave * (profile?.amplitude || 0));

    return new BABYLON.Vector3(
      (Math.cos(angle) * radius * radiusFactor * lobeFactor) + offset.x,
      y,
      (Math.sin(angle) * radius * radiusFactor * lobeFactor) + offset.z
    );
  });
}

function getPolygonEdgeLength(sides, radius) {
  return 2 * radius * Math.sin(Math.PI / sides);
}

function getCrystalRadiusForSides(sides, minRadius, maxRadius) {
  const preferredEdgeLength = 1.04;
  const unclampedRadius = preferredEdgeLength / (2 * Math.sin(Math.PI / sides));
  return Math.max(minRadius, Math.min(maxRadius, unclampedRadius));
}

function getCrystalRotationOffset(sides) {
  return sides % 2 === 0 ? Math.PI / sides : Math.PI / (sides * 2);
}

function getVertexKey(vertex) {
  return `${vertex.x.toFixed(5)}|${vertex.y.toFixed(5)}|${vertex.z.toFixed(5)}`;
}

function getVertexPairKey(leftVertex, rightVertex) {
  return [getVertexKey(leftVertex), getVertexKey(rightVertex)].sort().join("__");
}

function getFaceKey(vertices) {
  return vertices
    .map((vertex) => getVertexKey(vertex))
    .sort()
    .join("__");
}

function seededRange(seed, step, min, max) {
  const raw = Math.sin((seed * 91.337) + (step * 47.113)) * 43758.5453123;
  const normalized = raw - Math.floor(raw);
  return min + ((max - min) * normalized);
}

function normalizeVertices(vertices, radius) {
  return vertices.map((vertex) => vertex.clone().normalize().scale(radius));
}

function computeFaceCenter(vertices) {
  const center = BABYLON.Vector3.Zero();

  vertices.forEach((vertex) => {
    center.addInPlace(vertex);
  });

  center.scaleInPlace(1 / vertices.length);
  return center;
}

function computeUniqueVerticesCenter(faces) {
  const uniqueVertices = new Map();

  faces.forEach((face) => {
    face.vertices.forEach((vertex) => {
      uniqueVertices.set(getVertexKey(vertex), vertex.clone());
    });
  });

  return computeFaceCenter(Array.from(uniqueVertices.values()));
}

function computeLongestBodyHeightLine(faces) {
  // Ziel: Die Hoehenlinie strikt nach der Nutzerregel als laengste Linie im Koerper bestimmen.
  // Warum: Die Hierarchie Zentrum - Flaeche - Zentrum soll spaeter rekursiv funktionieren. Dafuer brauchen H1 und H3 dieselbe eindeutige Definition: entweder Spitze-zu-Spitze oder Spitze-zu-Gegenflaeche, nie eine bloesse Darstellungsheuristik.
  const uniqueVertices = new Map();
  const presentationQuaternion = BABYLON.Quaternion.FromEulerAngles(
    INITIAL_CRYSTAL_ROTATION.x,
    INITIAL_CRYSTAL_ROTATION.y,
    INITIAL_CRYSTAL_ROTATION.z
  );
  const presentationMatrix = BABYLON.Matrix.Identity();
  const vertices = [];

  presentationQuaternion.toRotationMatrix(presentationMatrix);

  faces.forEach((face) => {
    face.vertices.forEach((vertex) => {
      const key = getVertexKey(vertex);

      if (!uniqueVertices.has(key)) {
        uniqueVertices.set(key, vertex.clone());
        vertices.push(vertex.clone());
      }
    });
  });

  const candidates = [];

  for (let leftIndex = 0; leftIndex < vertices.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < vertices.length; rightIndex += 1) {
      const start = vertices[leftIndex];
      const end = vertices[rightIndex];
      const distanceSquared = BABYLON.Vector3.DistanceSquared(start, end);
      const startToEndAxis = end.subtract(start).normalize();
      const axisWorld = BABYLON.Vector3.TransformNormal(startToEndAxis, presentationMatrix);
      const baseCenter = axisWorld.y >= 0 ? start.clone() : end.clone();
      const apex = axisWorld.y >= 0 ? end.clone() : start.clone();
      const axis = apex.subtract(baseCenter).normalize();

      candidates.push({
        apex,
        baseCenter,
        axis,
        midpoint: BABYLON.Vector3.Lerp(baseCenter, apex, 0.5),
        lengthSquared: distanceSquared,
        verticalScore: Math.abs(axisWorld.y)
      });
    }
  }

  vertices.forEach((vertex) => {
    faces.forEach((face) => {
      const containsVertex = face.vertices.some((faceVertex) => {
        return getVertexKey(faceVertex) === getVertexKey(vertex);
      });

      if (containsVertex) {
        return;
      }

      const baseCenter = computeFaceCenter(face.vertices);
      const axisVector = vertex.subtract(baseCenter);
      const distanceSquared = axisVector.lengthSquared();

      if (distanceSquared <= 0.000001) {
        return;
      }

      const axisLocal = axisVector.normalize();
      const axisWorld = BABYLON.Vector3.TransformNormal(axisLocal, presentationMatrix);
      const orientedBaseCenter = axisWorld.y >= 0 ? baseCenter.clone() : vertex.clone();
      const orientedApex = axisWorld.y >= 0 ? vertex.clone() : baseCenter.clone();
      const axis = orientedApex.subtract(orientedBaseCenter).normalize();

      candidates.push({
        apex: orientedApex,
        baseCenter: orientedBaseCenter,
        axis,
        midpoint: BABYLON.Vector3.Lerp(orientedBaseCenter, orientedApex, 0.5),
        lengthSquared: distanceSquared,
        verticalScore: Math.abs(axisWorld.y)
      });
    });
  });

  return candidates.sort((left, right) => {
    if (Math.abs(right.lengthSquared - left.lengthSquared) > 0.000001) {
      return right.lengthSquared - left.lengthSquared;
    }

    return right.verticalScore - left.verticalScore;
  })[0] || {
    apex: BABYLON.Axis.Y.clone(),
    baseCenter: BABYLON.Vector3.Zero(),
    axis: BABYLON.Axis.Y.clone(),
    midpoint: BABYLON.Vector3.Zero()
  };
}

function computePreferredTetrahedronHeightLine(faces) {
  // Ziel: Die Tetraeder-Hoehe direkt aus der allgemeinen Koerperregel ableiten.
  // Warum: H1 und H3 sollen nicht je nach Form unterschiedliche Achsen-Heuristiken bekommen; das Tetraeder ist nur ein Spezialfall derselben Hoehenlinien-Definition.
  return computeLongestBodyHeightLine(faces);
}

function solveLinearSystem(matrixRows, rhsValues) {
  const size = rhsValues.length;
  const augmented = matrixRows.map((row, index) => [...row, rhsValues[index]]);

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
    let bestRow = pivotIndex;
    let bestValue = Math.abs(augmented[pivotIndex][pivotIndex]);

    for (let rowIndex = pivotIndex + 1; rowIndex < size; rowIndex += 1) {
      const nextValue = Math.abs(augmented[rowIndex][pivotIndex]);

      if (nextValue > bestValue) {
        bestValue = nextValue;
        bestRow = rowIndex;
      }
    }

    if (bestValue <= 0.0000001) {
      return null;
    }

    if (bestRow !== pivotIndex) {
      [augmented[pivotIndex], augmented[bestRow]] = [augmented[bestRow], augmented[pivotIndex]];
    }

    for (let rowIndex = pivotIndex + 1; rowIndex < size; rowIndex += 1) {
      const factor = augmented[rowIndex][pivotIndex] / augmented[pivotIndex][pivotIndex];

      if (Math.abs(factor) <= 0.0000001) {
        continue;
      }

      for (let columnIndex = pivotIndex; columnIndex <= size; columnIndex += 1) {
        augmented[rowIndex][columnIndex] -= augmented[pivotIndex][columnIndex] * factor;
      }
    }
  }

  const solution = new Array(size).fill(0);

  for (let rowIndex = size - 1; rowIndex >= 0; rowIndex -= 1) {
    let value = augmented[rowIndex][size];

    for (let columnIndex = rowIndex + 1; columnIndex < size; columnIndex += 1) {
      value -= augmented[rowIndex][columnIndex] * solution[columnIndex];
    }

    if (Math.abs(augmented[rowIndex][rowIndex]) <= 0.0000001) {
      return null;
    }

    solution[rowIndex] = value / augmented[rowIndex][rowIndex];
  }

  return solution;
}

function forEachCombination(length, pickCount, visitor) {
  const combination = [];

  function walk(startIndex) {
    if (combination.length === pickCount) {
      visitor(combination.slice());
      return;
    }

    for (let index = startIndex; index <= length - (pickCount - combination.length); index += 1) {
      combination.push(index);
      walk(index + 1);
      combination.pop();
    }
  }

  walk(0);
}

function computeMaximumInscribedSphere(faceEntries) {
  // Ziel: Das Zentrum der groesstmoeglichen Innenkugel eines Parent-Koerpers bestimmen.
  // Warum: Fuer H1 und H3 ist ab jetzt nicht mehr ein Schwerpunkt oder Achsenmittelpunkt massgeblich, sondern der Punkt, der innerhalb des Parent-Koerpers den groessten gleichmaessigen Abstand zu seinen Begrenzungsflaechen erlaubt.
  const constraints = faceEntries.map((faceEntry) => {
    const normal = faceEntry.outwardNormal.clone().normalize();
    return {
      normal,
      offset: BABYLON.Vector3.Dot(normal, faceEntry.faceCenter)
    };
  });
  let bestCandidate = null;

  if (constraints.length >= 4) {
    forEachCombination(constraints.length, 4, (indices) => {
      const matrix = indices.map((constraintIndex) => {
        const constraint = constraints[constraintIndex];
        return [constraint.normal.x, constraint.normal.y, constraint.normal.z, 1];
      });
      const rhs = indices.map((constraintIndex) => constraints[constraintIndex].offset);
      const solution = solveLinearSystem(matrix, rhs);

      if (!solution || solution.some((value) => !Number.isFinite(value))) {
        return;
      }

      const [x, y, z, radius] = solution;

      if (radius < -0.00001) {
        return;
      }

      const center = new BABYLON.Vector3(x, y, z);
      let minClearance = Number.POSITIVE_INFINITY;

      for (const constraint of constraints) {
        const clearance = constraint.offset - BABYLON.Vector3.Dot(constraint.normal, center);

        if (clearance < -0.00001) {
          return;
        }

        minClearance = Math.min(minClearance, clearance);
      }

      if (!bestCandidate || minClearance > bestCandidate.radius + 0.000001) {
        bestCandidate = {
          center,
          radius: minClearance
        };
      }
    });
  }

  if (bestCandidate) {
    return bestCandidate;
  }

  const fallbackCenter = computePolyhedronCenterFromFaces(faceEntries.map((faceEntry) => faceEntry.vertices));
  const fallbackRadius = faceEntries.reduce((minimum, faceEntry) => {
    return Math.min(
      minimum,
      faceEntry.faceCenter && faceEntry.outwardNormal
        ? BABYLON.Vector3.Dot(faceEntry.outwardNormal, faceEntry.faceCenter.subtract(fallbackCenter))
        : computeNearestTetrahedronFaceClearance(fallbackCenter, faceEntries)
    );
  }, Number.POSITIVE_INFINITY);

  return {
    center: fallbackCenter,
    radius: Math.max(0, fallbackRadius)
  };
}

function computeBalancedRuneRotationAtCenter(faces, center, symmetryAxis, runeWidth, runeHeight, glyphPlaneOffset) {
  // Ziel: Die Rotation eines quadratischen Symbols am festen Koerperzentrum ueber seine Eckabstaende bestimmen.
  // Warum: H1 und H3 sollen im Mittelpunkt der groesstmoeglichen Innenkugel verankert bleiben. Die Symmetrieachse dient hier nur noch als stabile Rollachse fuer symmetrische Faelle, waehrend die eigentliche Wahl aus den Quadrat-Eckenabstaenden kommt.
  const axis = symmetryAxis.clone().normalize();
  const baseRotation = quaternionFromUnitVectors(BABYLON.Axis.Y, axis);
  const halfWidth = runeWidth * 0.5;
  const halfHeight = runeHeight * 0.5;
  let bestCandidate = {
    axis,
    position: center.clone(),
    rotation: baseRotation.clone(),
    spread: Number.POSITIVE_INFINITY,
    minClearance: Number.NEGATIVE_INFINITY
  };

  for (let rollStep = 0; rollStep < 96; rollStep += 1) {
    const rollAngle = (rollStep / 96) * TAU;
    const rotation = BABYLON.Quaternion.RotationAxis(axis, rollAngle).multiply(baseRotation);
    const rotationMatrix = BABYLON.Matrix.Identity();

    rotation.toRotationMatrix(rotationMatrix);

    const right = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, rotationMatrix).normalize();
    const forward = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, rotationMatrix).normalize();
    const planeCenter = center.add(forward.scale(glyphPlaneOffset));
    const corners = [
      planeCenter.add(right.scale(-halfWidth)).add(axis.scale(-halfHeight)),
      planeCenter.add(right.scale(halfWidth)).add(axis.scale(-halfHeight)),
      planeCenter.add(right.scale(-halfWidth)).add(axis.scale(halfHeight)),
      planeCenter.add(right.scale(halfWidth)).add(axis.scale(halfHeight))
    ];
    const clearances = corners.map((corner) => computeNearestTetrahedronFaceClearance(corner, faces));
    const minClearance = Math.min(...clearances);
    const maxClearance = Math.max(...clearances);
    const spread = maxClearance - minClearance;
    const isValidInteriorFit = minClearance >= 0;

    if (
      isValidInteriorFit
      && (
        minClearance > bestCandidate.minClearance + 0.000001
        || (
          Math.abs(minClearance - bestCandidate.minClearance) <= 0.000001
          && spread < bestCandidate.spread - 0.000001
        )
      )
    ) {
      bestCandidate = {
        axis: axis.clone(),
        position: center.clone(),
        rotation: rotation.clone(),
        spread,
        minClearance
      };
    }
  }

  return {
    axis: bestCandidate.axis,
    position: bestCandidate.position,
    rotation: bestCandidate.rotation
  };
}

function computeNearestTetrahedronFaceClearance(point, faces) {
  return faces.reduce((minimumDistance, face) => {
    const faceCenter = face.faceCenter ? face.faceCenter.clone() : computeFaceCenter(face.vertices);
    const outwardNormal = face.outwardNormal
      ? face.outwardNormal.clone().normalize()
      : computeOutwardNormal(face.vertices, faceCenter);
    const signedDistance = BABYLON.Vector3.Dot(outwardNormal, point.subtract(faceCenter));
    const interiorClearance = -signedDistance;

    return Math.min(minimumDistance, interiorClearance);
  }, Number.POSITIVE_INFINITY);
}

function computeFaceNormal(vertices) {
  const edgeA = vertices[1].subtract(vertices[0]);
  const edgeB = vertices[2].subtract(vertices[0]);
  return BABYLON.Vector3.Cross(edgeA, edgeB).normalize();
}

function computeOutwardNormal(vertices, center = computeFaceCenter(vertices)) {
  const normal = computeFaceNormal(vertices);
  return BABYLON.Vector3.Dot(normal, center) < 0 ? normal.scale(-1) : normal;
}

function setFocusedFace(entry) {
  if (state.focusedFaceEntry === entry) {
    return;
  }

  if (state.focusedFaceEntry) {
    applyFaceFocus(state.focusedFaceEntry, false);
  }

  state.focusedFaceEntry = entry || null;

  if (state.focusedFaceEntry) {
    applyFaceFocus(state.focusedFaceEntry, true);
  }
}

function clearFocusedFace() {
  setFocusedFace(null);
}

function applyFaceFocus(entry, isFocused) {
  if (!entry?.mesh || !entry.material) {
    return;
  }

  const baseEmissiveColor = entry.material.metadata?.baseEmissiveColor?.clone()
    || entry.material.emissiveColor.clone();

  if (isFocused) {
    entry.material.emissiveColor = baseEmissiveColor.scale(1.55);
    entry.mesh.renderOutline = true;
    entry.mesh.outlineWidth = 0.022;
    entry.mesh.outlineColor = baseEmissiveColor.toColor4(0.95);
    return;
  }

  entry.material.emissiveColor = baseEmissiveColor;
  entry.mesh.renderOutline = false;
}

function focusFaceEntry(entry) {
  if (!entry) {
    return;
  }

  if (state.selectedId === 4 && entry.shapeKind === "tetrahedron") {
    stopSnapAnimation();
    showTetrahedronDetails();
    return;
  }

  setFocusedFace(entry);
  centerFaceEntry(entry);
}

function centerFaceEntry(entry) {
  if (!entry?.snapEligible || !state.crystalRoot || !state.camera) {
    return;
  }

  const currentRotation = (state.crystalRoot.rotationQuaternion || BABYLON.Quaternion.Identity()).clone();
  const desiredDirection = state.camera.globalPosition
    .subtract(state.crystalRoot.getAbsolutePosition())
    .normalize();
  const currentWorldNormal = rotateVectorByQuaternion(entry.localNormal, currentRotation);
  const snapDelta = quaternionFromUnitVectors(currentWorldNormal, desiredDirection);
  const targetRotation = snapDelta.multiply(currentRotation);

  targetRotation.normalize();
  startSnapAnimation(currentRotation, targetRotation);
}

function pickMeshFromPointerEvent(scene, canvas, event) {
  if (!scene) {
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;
  const engine = scene.getEngine();
  const renderScaleX = engine.getRenderWidth() / rect.width;
  const renderScaleY = engine.getRenderHeight() / rect.height;
  const attempts = [
    [localX, localY],
    [localX * renderScaleX, localY * renderScaleY]
  ];

  let pickResult = null;

  for (const [pickX, pickY] of attempts) {
    pickResult = scene.pick(
      pickX,
      pickY,
      (mesh) => Boolean(mesh?.isPickable),
      false,
      state.camera
    );

    if (pickResult?.hit && pickResult.pickedMesh) {
      break;
    }
  }

  return pickResult?.hit && pickResult.pickedMesh ? pickResult.pickedMesh : null;
}

function getFaceEntryFromPointerEvent(scene, canvas, event) {
  const pickedMesh = pickMeshFromPointerEvent(scene, canvas, event);

  if (!pickedMesh) {
    return null;
  }

  return state.faceEntries.find((entry) => entry.mesh === pickedMesh) || null;
}

function getRuneEntryFromPointerEvent(scene, canvas, event) {
  // Ziel: Root- und Detail-Symbole direkt als klickbaren Einstiegspfad auffindbar machen.
  // Warum: Im Root-View liegen die Symbole visuell oft vor den Außenflächen; wenn nur Face-Meshes klickbar sind, fühlt sich der Einstieg in den DetailView kaputt an.
  const pickedMesh = pickMeshFromPointerEvent(scene, canvas, event);

  if (!pickedMesh || !state.crystalRoot?.metadata?.runeEntries) {
    return null;
  }

  return state.crystalRoot.metadata.runeEntries.find((entry) => entry.runeGlyphMesh === pickedMesh) || null;
}

function isTetrahedronExpanded() {
  return state.extraction.stage !== "idle";
}

function createTetrahedronDetailData(entry) {
  const faceLabel = String.fromCharCode(65 + entry.faceIndex);
  const itemLabel = `${faceLabel}${entry.runeIndex + 1}`;

  return {
    runeSymbol: entry.runeSymbol,
    accentHex: entry.accentHex,
    title: `Symbol ${itemLabel} ${entry.runeSymbol}`,
    subtitle: `Detail des Subkristalls ${itemLabel}.`
  };
}

function createCrystalDetailData(entry) {
  return {
    accentHex: entry.accentHex,
    title: `Kristall ${entry.selectionId} ${entry.runeSymbol}`,
    subtitle: "H1-Zentralsymbol des Gesamtkristalls."
  };
}

function createFragmentDetailData(entry) {
  const fragmentLabel = getTetrahedronFragmentLabel(entry.faceIndex);

  return {
    accentHex: entry.accentHex,
    title: `Fragment ${fragmentLabel} ${entry.runeSymbol}`,
    subtitle: `H2-Fragment ${fragmentLabel} des Kristalls.`
  };
}

function createRuneFragmentDetailData(entry) {
  const fragmentLabel = getTetrahedronFragmentLabel(entry.faceIndex);

  return {
    accentHex: entry.accentHex,
    title: `Fraktal ${fragmentLabel}${entry.runeIndex + 1} ${entry.runeSymbol}`,
    subtitle: `H3-Fraktal in Fragment ${fragmentLabel}.`
  };
}

function getTetrahedronFragmentLabel(faceIndex) {
  return String.fromCharCode(65 + faceIndex);
}

function buildTetrahedronFragmentFaces(vertices, centroid) {
  return [
    vertices.map((vertex) => vertex.clone()),
    [vertices[0].clone(), vertices[1].clone(), centroid.clone()],
    [vertices[1].clone(), vertices[2].clone(), centroid.clone()],
    [vertices[2].clone(), vertices[0].clone(), centroid.clone()]
  ];
}

function computeFragmentFaceRunePosition(vertices, centroid, planeLift = 0.004, glyphPlaneOffset = 0.028) {
  // Ziel: H2-Symbole mit ihrer sichtbaren Glyphflaeche direkt an die Aussenflaeche des Segments setzen.
  // Warum: Der Ankerpunkt allein reicht hier nicht; weil das Symbol selbst lokal vor dem Anchor liegt, muss der Anchor leicht nach innen versetzt werden, sonst wirkt die H2 im RootView wie ein schwebender Aufkleber.
  const faceCenter = computeFaceCenter(vertices);
  const outwardNormal = computeOutwardNormal(vertices, faceCenter);
  const anchorOffset = planeLift - glyphPlaneOffset;
  return faceCenter.add(outwardNormal.scale(anchorOffset));
}

function createTetrahedronFragmentBoundaries(scene, parent, name, faces, accentHex, materials) {
  const renderedFaceKeys = parent.metadata?.fragmentFaceKeys;

  faces.forEach((vertices, index) => {
    const faceKey = getFaceKey(vertices);

    if (renderedFaceKeys?.has(faceKey)) {
      return;
    }

    renderedFaceKeys?.add(faceKey);
    const material = createFaceMaterial(scene, `${name}_boundary_${index + 1}`, accentHex, FRAGMENT_CRYSTAL_ALPHA);
    applyColorToMaterial(material, accentHex);
    material.metadata.baseEmissiveColor = material.emissiveColor.clone();
    material.needDepthPrePass = false;
    material.separateCullingPass = false;
    material.forceDepthWrite = false;
    material.zOffset = -1;
    const boundaryFace = createFaceMesh(scene, `${name}_boundary_${index + 1}`, vertices, material);

    boundaryFace.mesh.parent = parent;
    boundaryFace.mesh.isPickable = false;
    boundaryFace.mesh.receiveShadows = true;
    boundaryFace.mesh.renderingGroupId = 1;
    state.shadowGenerator?.addShadowCaster(boundaryFace.mesh);
    materials.push(material);
  });
}

function buildTetrahedronSubcrystalFaces(layoutItem) {
  if (Array.isArray(layoutItem.subcrystalFaces) && layoutItem.subcrystalFaces.length) {
    return layoutItem.subcrystalFaces.map((faceVertices) => faceVertices.map((vertex) => vertex.clone()));
  }

  if (layoutItem.baseVertices && layoutItem.apex) {
    const baseVertices = [
      layoutItem.baseVertices[0],
      layoutItem.baseVertices[1],
      layoutItem.baseVertices[2]
    ];
    const apex = layoutItem.apex.clone();

    return [
      baseVertices,
      [baseVertices[0], baseVertices[1], apex],
      [baseVertices[1], baseVertices[2], apex],
      [baseVertices[2], baseVertices[0], apex]
    ];
  }

  const frontVertices = [
    layoutItem.frontVertices[0],
    layoutItem.frontVertices[1],
    layoutItem.frontVertices[2]
  ];
  const backVertices = [
    layoutItem.backVertices[0],
    layoutItem.backVertices[1],
    layoutItem.backVertices[2]
  ];
  const backCenter = computeFaceCenter(backVertices);
  const isTopCell = backVertices.every((vertex) => {
    return BABYLON.Vector3.DistanceSquared(vertex, backCenter) < 0.000001;
  });

  return isTopCell
    ? [
      frontVertices,
      [frontVertices[0], frontVertices[1], backCenter],
      [frontVertices[1], frontVertices[2], backCenter],
      [frontVertices[2], frontVertices[0], backCenter]
    ]
    : [
      frontVertices,
      [backVertices[0], backVertices[2], backVertices[1]],
      [frontVertices[0], frontVertices[1], backVertices[1], backVertices[0]],
      [frontVertices[1], frontVertices[2], backVertices[2], backVertices[1]],
      [frontVertices[2], frontVertices[0], backVertices[0], backVertices[2]]
    ];
}

function computeExtremaMidpoint(points) {
  if (!points.length) {
    return BABYLON.Vector3.Zero();
  }

  let bestStart = points[0];
  let bestEnd = points[0];
  let bestDistanceSquared = -1;

  for (let leftIndex = 0; leftIndex < points.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < points.length; rightIndex += 1) {
      const distanceSquared = BABYLON.Vector3.DistanceSquared(points[leftIndex], points[rightIndex]);

      if (distanceSquared > bestDistanceSquared) {
        bestDistanceSquared = distanceSquared;
        bestStart = points[leftIndex];
        bestEnd = points[rightIndex];
      }
    }
  }

  return bestStart.add(bestEnd).scale(0.5);
}

function computePolyhedronRuneCenter(faces) {
  const uniqueVertices = [];
  const seenVertices = new Set();

  faces.forEach((faceVertices) => {
    faceVertices.forEach((vertex) => {
      const key = `${vertex.x.toFixed(6)}|${vertex.y.toFixed(6)}|${vertex.z.toFixed(6)}`;

      if (!seenVertices.has(key)) {
        seenVertices.add(key);
        uniqueVertices.push(vertex);
      }
    });
  });

  const vertexMidpoint = computeExtremaMidpoint(uniqueVertices);
  const faceCenters = faces.map((faceVertices) => computeFaceCenter(faceVertices));
  const faceMidpoint = computeExtremaMidpoint(faceCenters);

  return vertexMidpoint.add(faceMidpoint).scale(0.5);
}

function computePolyhedronCenterFromFaces(faceVerticesCollection) {
  const uniqueVertices = new Map();

  faceVerticesCollection.forEach((faceVertices) => {
    faceVertices.forEach((vertex) => {
      uniqueVertices.set(getVertexKey(vertex), vertex.clone());
    });
  });

  return computeFaceCenter(Array.from(uniqueVertices.values()));
}

function buildPolyhedronFaceEntries(faceVerticesCollection) {
  const polyhedronCenter = computePolyhedronCenterFromFaces(faceVerticesCollection);

  return faceVerticesCollection.map((faceVertices) => {
    const vertices = faceVertices.map((vertex) => vertex.clone());
    const faceCenter = computeFaceCenter(vertices);
    const normal = computeFaceNormal(vertices);
    const outwardNormal = BABYLON.Vector3.Dot(normal, faceCenter.subtract(polyhedronCenter)) < 0
      ? normal.scale(-1)
      : normal;

    return {
      vertices,
      faceCenter,
      outwardNormal
    };
  });
}

function normalizeFragmentRuneCount(requestedCount) {
  if (!Number.isFinite(requestedCount)) {
    return DEFAULT_H3_RUNES_PER_FRAGMENT;
  }

  return Math.max(1, Math.min(MAX_H3_RUNES_PER_FRAGMENT, Math.round(requestedCount)));
}

function getDefaultFragmentRuneCount(selectionId, faceIndex) {
  // Ziel: Auch ohne explizite Konfiguration pro H2-Fragment unterschiedliche H3-Anzahlen erzeugen.
  // Warum: Der Prototyp soll die 1..10-Faehigkeit direkt sichtbar vorfuehren; viermal der alte 10er-Zustand wuerde sonst wie ein nicht umgesetzter Umbau wirken.
  const defaultCounts = [1, 3, 6, 10];
  return defaultCounts[faceIndex] || DEFAULT_H3_RUNES_PER_FRAGMENT;
}

function getRequestedFragmentRuneCount(selectionId, faceIndex) {
  const configuredCount = STARTUP_CONFIG.fragmentRuneCounts?.[faceIndex];

  if (Number.isFinite(configuredCount)) {
    return normalizeFragmentRuneCount(configuredCount);
  }

  return getDefaultFragmentRuneCount(selectionId, faceIndex);
}

function buildTetrahedronSegmentCells(vertices, centroid) {
  // Ziel: Das H2-Segment in eine feine, vollstaendig schliessende Zellstruktur zerlegen.
  // Warum: Die spaeteren H3-Fraktale sollen aus echten Volumenzellen zusammengesetzt werden, statt als Symbol-Zellen plus getrennte Filler behandelt zu werden.
  const [leftVertex, rightVertex, tipVertex] = vertices;
  const subdivision = 4;
  const cells = [];
  const upwardCandidates = [];
  const rawFaceNormal = computeFaceNormal(vertices);
  const faceCenter = computeFaceCenter(vertices);
  const faceNormal = BABYLON.Vector3.Dot(rawFaceNormal, faceCenter) < 0
    ? rawFaceNormal.scale(-1).normalize()
    : rawFaceNormal.normalize();
  const inwardNormal = faceNormal.scale(-1);
  const planeDepth = Math.max(
    0.08,
    BABYLON.Vector3.Dot(centroid.subtract(faceCenter), inwardNormal)
  );
  const inset = planeDepth * 0.015;
  const u = rightVertex.subtract(leftVertex).scale(1 / subdivision);
  const v = tipVertex.subtract(leftVertex).scale(1 / subdivision);
  let cellIndex = 0;

  for (let row = 0; row < subdivision; row += 1) {
    for (let column = 0; column < subdivision - row; column += 1) {
      const surfaceA = leftVertex.add(u.scale(column)).add(v.scale(row));
      const surfaceB = leftVertex.add(u.scale(column + 1)).add(v.scale(row));
      const surfaceC = leftVertex.add(u.scale(column)).add(v.scale(row + 1));
      const upwardBaseVertices = [surfaceA, surfaceB, surfaceC].map((vertex) => {
        return vertex.add(inwardNormal.scale(inset));
      });
      const upwardSubcrystalFaces = buildTetrahedronSubcrystalFaces({
        baseVertices: upwardBaseVertices,
        apex: centroid
      });
      const upwardAverageEdgeLength = (
        BABYLON.Vector3.Distance(upwardBaseVertices[0], upwardBaseVertices[1])
        + BABYLON.Vector3.Distance(upwardBaseVertices[1], upwardBaseVertices[2])
        + BABYLON.Vector3.Distance(upwardBaseVertices[2], upwardBaseVertices[0])
      ) / 3;
      const upwardCell = {
        row,
        column,
        cellIndex,
        isRuneCandidate: true,
        baseVertices: upwardBaseVertices,
        apex: centroid.clone(),
        baseRadius: upwardAverageEdgeLength * 0.34,
        height: BABYLON.Vector3.Distance(computeFaceCenter(upwardBaseVertices), centroid),
        runeSize: Math.max(0.15, upwardAverageEdgeLength * 0.56),
        distributionPoint: computeFaceCenter(upwardBaseVertices),
        subcrystalFaces: upwardSubcrystalFaces
      };

      cells.push(upwardCell);
      upwardCandidates.push(upwardCell);
      cellIndex += 1;

      if (column >= subdivision - row - 1) {
        continue;
      }

      const surfaceD = leftVertex.add(u.scale(column + 1)).add(v.scale(row + 1));
      const downwardBaseVertices = [surfaceB, surfaceD, surfaceC].map((vertex) => {
        return vertex.add(inwardNormal.scale(inset));
      });
      const downwardAverageEdgeLength = (
        BABYLON.Vector3.Distance(downwardBaseVertices[0], downwardBaseVertices[1])
        + BABYLON.Vector3.Distance(downwardBaseVertices[1], downwardBaseVertices[2])
        + BABYLON.Vector3.Distance(downwardBaseVertices[2], downwardBaseVertices[0])
      ) / 3;
      const downwardSubcrystalFaces = buildTetrahedronSubcrystalFaces({
        baseVertices: downwardBaseVertices,
        apex: centroid
      });

      cells.push({
        row,
        column,
        cellIndex,
        isRuneCandidate: false,
        baseVertices: downwardBaseVertices,
        apex: centroid.clone(),
        baseRadius: downwardAverageEdgeLength * 0.34,
        height: BABYLON.Vector3.Distance(computeFaceCenter(downwardBaseVertices), centroid),
        runeSize: Math.max(0.15, downwardAverageEdgeLength * 0.56),
        distributionPoint: computeFaceCenter(downwardBaseVertices),
        subcrystalFaces: downwardSubcrystalFaces
      });
      cellIndex += 1;
    }
  }

  return { cells, upwardCandidates };
}

function buildTetrahedronCellAdjacency(cells) {
  const adjacency = new Map(cells.map((cell) => [cell.cellIndex, new Set()]));
  const faceOwners = new Map();

  cells.forEach((cell) => {
    cell.subcrystalFaces.forEach((faceVertices) => {
      const faceKey = getFaceKey(faceVertices);
      const owners = faceOwners.get(faceKey) || [];
      owners.push(cell.cellIndex);
      faceOwners.set(faceKey, owners);
    });
  });

  faceOwners.forEach((owners) => {
    if (owners.length !== 2) {
      return;
    }

    adjacency.get(owners[0])?.add(owners[1]);
    adjacency.get(owners[1])?.add(owners[0]);
  });

  return adjacency;
}

function assignCellsToFractalSeeds(cells, seedCells) {
  // Ziel: Alle Segmentzellen genau einem H3-Fraktal zuordnen.
  // Warum: H3 soll 1:1 einen echten Parent-Koerper haben; anonyme Filler-Zellen wuerden die Parent-Logik des Nutzers wieder brechen.
  const adjacency = buildTetrahedronCellAdjacency(cells);
  const cellById = new Map(cells.map((cell) => [cell.cellIndex, cell]));
  const seedById = new Map(seedCells.map((cell) => [cell.cellIndex, cell]));
  const assignments = new Map(seedCells.map((cell) => [cell.cellIndex, []]));
  const assignedCellToSeed = new Map();
  const frontier = seedCells.map((seedCell, seedOrder) => ({
    cellIndex: seedCell.cellIndex,
    seedCellIndex: seedCell.cellIndex,
    seedOrder,
    graphDistance: 0,
    euclideanDistance: 0
  }));

  while (frontier.length) {
    frontier.sort((left, right) => {
      if (left.graphDistance !== right.graphDistance) {
        return left.graphDistance - right.graphDistance;
      }

      if (Math.abs(left.euclideanDistance - right.euclideanDistance) > 0.000001) {
        return left.euclideanDistance - right.euclideanDistance;
      }

      if (left.seedOrder !== right.seedOrder) {
        return left.seedOrder - right.seedOrder;
      }

      return left.cellIndex - right.cellIndex;
    });

    const current = frontier.shift();

    if (!current || assignedCellToSeed.has(current.cellIndex)) {
      continue;
    }

    assignedCellToSeed.set(current.cellIndex, current.seedCellIndex);
    assignments.get(current.seedCellIndex)?.push(cellById.get(current.cellIndex));

    const seedCell = seedById.get(current.seedCellIndex);
    const neighborIds = Array.from(adjacency.get(current.cellIndex) || []);

    neighborIds.forEach((neighborId) => {
      if (assignedCellToSeed.has(neighborId)) {
        return;
      }

      frontier.push({
        cellIndex: neighborId,
        seedCellIndex: current.seedCellIndex,
        seedOrder: current.seedOrder,
        graphDistance: current.graphDistance + 1,
        euclideanDistance: BABYLON.Vector3.DistanceSquared(
          cellById.get(neighborId).distributionPoint,
          seedCell.distributionPoint
        )
      });
    });
  }

  return assignments;
}

function buildClusterBoundaryFaces(clusterCells) {
  const faceOccurrences = new Map();

  clusterCells.forEach((cell) => {
    cell.subcrystalFaces.forEach((faceVertices) => {
      const faceKey = getFaceKey(faceVertices);
      const entry = faceOccurrences.get(faceKey) || {
        count: 0,
        vertices: faceVertices.map((vertex) => vertex.clone())
      };

      entry.count += 1;
      faceOccurrences.set(faceKey, entry);
    });
  });

  return Array.from(faceOccurrences.values())
    .filter((entry) => entry.count === 1)
    .map((entry) => entry.vertices.map((vertex) => vertex.clone()));
}

function computePreferredPolyhedronHeightLine(faces) {
  return computeLongestBodyHeightLine(faces);
}

function buildFractalLayoutItem(
  clusterCells,
  runeIndex,
  totalFractalCount,
  parentSegmentFaces = null,
  parentSegmentHeightLine = null
) {
  const boundaryFaces = totalFractalCount === 1 && Array.isArray(parentSegmentFaces) && parentSegmentFaces.length
    ? parentSegmentFaces.map((faceVertices) => faceVertices.map((vertex) => vertex.clone()))
    : buildClusterBoundaryFaces(clusterCells);
  const faceEntries = buildPolyhedronFaceEntries(boundaryFaces);
  const inscribedSphere = computeMaximumInscribedSphere(faceEntries);
  const runeSymbol = SUBCRYSTAL_RUNE_SYMBOLS[runeIndex % SUBCRYSTAL_RUNE_SYMBOLS.length];
  const runeGlyphLayout = measureRuneGlyphLayout(runeSymbol, 256, 14);
  const maxRuneSize = clusterCells.reduce((maximum, cell) => {
    return Math.max(maximum, cell.runeSize || 0);
  }, 0);
  const baseRuneSize = maxRuneSize * Math.max(1, Math.sqrt(clusterCells.length) * 0.78);
  const runeSizeCap = totalFractalCount === 1 ? 0.28 : 0.62;
  const runeSize = Math.max(0.16, Math.min(runeSizeCap, baseRuneSize));
  const heightLine = totalFractalCount === 1 && parentSegmentHeightLine
    ? {
      apex: parentSegmentHeightLine.apex.clone(),
      baseCenter: parentSegmentHeightLine.baseCenter.clone(),
      axis: parentSegmentHeightLine.axis.clone(),
      midpoint: parentSegmentHeightLine.midpoint.clone()
    }
    : computePreferredPolyhedronHeightLine(faceEntries);
  const balancedPlacement = computeBalancedRuneRotationAtCenter(
    faceEntries,
    inscribedSphere.center,
    heightLine.axis,
    runeSize * H3_ROOT_RUNE_SCALE * runeGlyphLayout.squareRatio,
    runeSize * H3_ROOT_RUNE_SCALE * runeGlyphLayout.squareRatio,
    0
  );

  return {
    cellIndex: clusterCells[0]?.cellIndex ?? runeIndex,
    hasRune: true,
    runeIndex,
    // Ziel: H3-Symbole mit derselben Parent-Logik wie H1 im echten Koerper ihres Fraktals platzieren.
    // Warum: Sobald ein Segment nur ein einziges Fraktal traegt, ist dieses Fraktal identisch mit dem Segment. Dann darf die H3 nicht auf einer aus Zellgrenzen rekonstruierten Ersatzgeometrie landen, sondern muss sich am wirklichen Parent-Koerper orientieren.
    position: inscribedSphere.center.clone(),
    runePosition: inscribedSphere.center.clone(),
    rootRunePosition: inscribedSphere.center.clone(),
    detailRunePosition: inscribedSphere.center.clone(),
    rootRuneRotation: balancedPlacement.rotation.clone(),
    runeSize,
    distributionPoint: computePolyhedronCenterFromFaces(boundaryFaces),
    subcrystalFaces: boundaryFaces,
    childCellIndices: clusterCells.map((cell) => cell.cellIndex)
  };
}

function selectDistributedRuneCells(candidateCells, requestedCount, faceVertices) {
  // Ziel: Fuer 1..10 H3-Knoten eine raeumlich verteilte Auswahl aus den moeglichen Symbol-Zellen treffen.
  // Warum: Kleinere H3-Zahlen sollen nicht stumpf in den ersten Rasterfeldern landen, sondern weiter die Ecken und Spitzen des Parent-Fragments lesbar besetzen.
  if (!candidateCells.length) {
    return new Set();
  }

  const targetCount = Math.min(candidateCells.length, normalizeFragmentRuneCount(requestedCount));

  if (targetCount >= candidateCells.length) {
    return new Set(candidateCells.map((_, index) => index));
  }

  const presentationQuaternion = BABYLON.Quaternion.FromEulerAngles(
    INITIAL_CRYSTAL_ROTATION.x,
    INITIAL_CRYSTAL_ROTATION.y,
    INITIAL_CRYSTAL_ROTATION.z
  );
  const presentationMatrix = BABYLON.Matrix.Identity();

  presentationQuaternion.toRotationMatrix(presentationMatrix);

  const preferredVertex = faceVertices
    .map((vertex) => ({
      vertex,
      worldY: BABYLON.Vector3.TransformCoordinates(vertex, presentationMatrix).y
    }))
    .sort((left, right) => right.worldY - left.worldY)[0]?.vertex || faceVertices[0];
  const selectedIndices = [];
  const selectedIndexSet = new Set();

  let seedIndex = 0;
  let bestSeedDistance = Number.POSITIVE_INFINITY;

  candidateCells.forEach((candidate, candidateIndex) => {
    const distance = BABYLON.Vector3.DistanceSquared(candidate.distributionPoint, preferredVertex);

    if (distance < bestSeedDistance) {
      bestSeedDistance = distance;
      seedIndex = candidateIndex;
    }
  });

  selectedIndices.push(seedIndex);
  selectedIndexSet.add(seedIndex);

  while (selectedIndices.length < targetCount) {
    let bestCandidateIndex = -1;
    let bestCandidateScore = Number.NEGATIVE_INFINITY;

    candidateCells.forEach((candidate, candidateIndex) => {
      if (selectedIndexSet.has(candidateIndex)) {
        return;
      }

      const minDistanceToSelection = selectedIndices.reduce((minimum, selectedIndex) => {
        const selectedCandidate = candidateCells[selectedIndex];

        return Math.min(
          minimum,
          BABYLON.Vector3.DistanceSquared(candidate.distributionPoint, selectedCandidate.distributionPoint)
        );
      }, Number.POSITIVE_INFINITY);

      if (minDistanceToSelection > bestCandidateScore) {
        bestCandidateScore = minDistanceToSelection;
        bestCandidateIndex = candidateIndex;
      }
    });

    if (bestCandidateIndex === -1) {
      break;
    }

    selectedIndices.push(bestCandidateIndex);
    selectedIndexSet.add(bestCandidateIndex);
  }

  return selectedIndexSet;
}

function getTetrahedronRuneLayout(vertices, centroid, requestedRuneCount = DEFAULT_H3_RUNES_PER_FRAGMENT) {
  const { cells, upwardCandidates } = buildTetrahedronSegmentCells(vertices, centroid);
  const selectedCandidateIndices = selectDistributedRuneCells(upwardCandidates, requestedRuneCount, vertices);
  const seedCells = upwardCandidates.filter((_, candidateIndex) => selectedCandidateIndices.has(candidateIndex));
  const clusterAssignments = assignCellsToFractalSeeds(cells, seedCells);
  const parentSegmentFaces = buildTetrahedronFragmentFaces(vertices, centroid);
  const parentSegmentBaseCenter = computeFaceCenter(vertices);
  const parentSegmentApex = centroid.clone();
  const parentSegmentAxis = parentSegmentApex.subtract(parentSegmentBaseCenter).normalize();
  const parentSegmentHeightLine = {
    apex: parentSegmentApex,
    baseCenter: parentSegmentBaseCenter,
    axis: parentSegmentAxis,
    midpoint: BABYLON.Vector3.Lerp(parentSegmentBaseCenter, parentSegmentApex, 0.5)
  };

  return seedCells.map((seedCell, runeIndex) => {
    const clusterCells = clusterAssignments.get(seedCell.cellIndex) || [seedCell];
    return buildFractalLayoutItem(
      clusterCells,
      runeIndex,
      seedCells.length,
      parentSegmentFaces,
      parentSegmentHeightLine
    );
  });
}

function setRuneHalosEnabled(item, isEnabled) {
  const haloMeshes = item.runeHaloMeshes
    || (item.runeHaloMesh ? [item.runeHaloMesh] : []);

  haloMeshes.forEach((haloMesh) => {
    haloMesh?.setEnabled(isEnabled);
  });
}

function setRuneDisplayMode(item, isDetailView) {
  if (!item?.runeAnchor || !item?.runeGlyphMesh) {
    return;
  }
  // Ziel: Die Hierarchie H1/H2/H3 nicht nur datenlogisch, sondern auch optisch eindeutig machen.
  // Warum: Die Symbolgroessen muessen sichtbar zwischen Kristall, Fragment und Fraktal unterscheiden; direkte Mesh-Skalierung ist hier robuster als nur ueber den Parent-Transform zu gehen.
  const nextScale = isDetailView ? (item.detailRuneScale || 1) : (item.rootRuneScale || 1);

  item.runeAnchor.position.copyFrom(
    isDetailView
      ? (item.detailRunePosition || item.rootRunePosition || item.runeAnchor.position)
      : (item.rootRunePosition || item.runeAnchor.position)
  );

  if (item.rootRuneRotation) {
    item.runeAnchor.rotationQuaternion = item.rootRuneRotation.clone();
  }

  item.runeAnchor.scaling.setAll(1);
  item.runeGlyphMesh.scaling.setAll(nextScale);
  const nextBillboardMode = isDetailView
    ? (item.detailBillboardMode ?? BABYLON.AbstractMesh.BILLBOARDMODE_ALL)
    : (item.rootBillboardMode ?? BABYLON.AbstractMesh.BILLBOARDMODE_NONE);
  item.runeGlyphMesh.billboardMode = nextBillboardMode;

  if (item.runeHaloMesh) {
    item.runeHaloMesh.scaling.setAll(nextScale);
    item.runeHaloMesh.billboardMode = nextBillboardMode;
  }
}

function getActiveDetailHoverEntryId() {
  // Ziel: Einen einzigen sichtbaren Hover-Zustand fuer Detail-zu-Symbol-Verbindungen ableiten.
  // Warum: Karte und Symbol koennen unabhaengig gehovert werden; fuer die Connector-Sichtbarkeit brauchen wir daraus eine einfache, priorisierte Leselogik.
  return state.extraction.hoveredCardEntryId || state.extraction.hoveredRuneEntryId || null;
}

function syncDetailConnectorVisibility() {
  // Ziel: Connectoren standardmaessig unsichtbar halten und nur fuer den aktiv gehoverteten Eintrag zeigen.
  // Warum: Die Linien sollen den Blick nicht dauerhaft ueberladen, sondern nur als gezielte Orientierungsbruecke zwischen Detail und Symbol dienen.
  const activeEntryId = getActiveDetailHoverEntryId();

  state.extraction.items.forEach((item) => {
    if (!item.detailConnectorElement) {
      return;
    }

    if (!activeEntryId || item.entryId !== activeEntryId) {
      item.detailConnectorElement.setAttribute("visibility", "hidden");
    }
  });
}

function setHoveredDetailCardEntry(entryId) {
  // Ziel: Card-Hover explizit in den Connector-Zustand ueberfuehren.
  // Warum: Die Detailkarten liegen in einer eigenen DOM-Ebene und muessen dieselbe Hover-Quelle bedienen wie die 3D-Symbole im Canvas.
  state.extraction.hoveredCardEntryId = entryId;
  syncDetailConnectorVisibility();
}

function setHoveredRuneEntry(entryId) {
  // Ziel: Symbol-Hover aus der Szene in dieselbe Connector-Logik wie Card-Hover einspeisen.
  // Warum: Die Linie soll auftauchen, egal ob der Nutzer am Text oder direkt am Symbol andockt.
  state.extraction.hoveredRuneEntryId = entryId;
  syncDetailConnectorVisibility();
}

function getDetailCardTitleText(item) {
  // Ziel: Den reinen Knotentitel ohne angehaengtes Symbolzeichen fuer die Baumansicht liefern.
  // Warum: Das Symbol wird in der neuen Tree-Struktur als eigenes, links stehendes Element gerendert und soll nicht noch einmal im Text auftauchen.
  if (!item?.detail?.title) {
    return "";
  }

  const runeSuffix = item.runeSymbol ? ` ${item.runeSymbol}` : "";
  return runeSuffix && item.detail.title.endsWith(runeSuffix)
    ? item.detail.title.slice(0, -runeSuffix.length)
    : item.detail.title;
}

function createDetailCard(item) {
  const card = document.createElement("article");
  const row = document.createElement("div");
  const rune = document.createElement("span");
  const titleTagName = item.level === "h1" ? "h2" : item.level === "h2" ? "h3" : "h4";
  const title = document.createElement(titleTagName);

  card.className = `detail-card detail-card-${item.level}`;
  card.style.setProperty("--detail-accent", item.detail.accentHex);
  row.className = "detail-card-row";
  rune.className = `detail-card-rune detail-card-rune-${item.level}`;
  rune.textContent = item.runeSymbol || "";
  rune.setAttribute("aria-hidden", "true");
  title.className = "detail-card-title";
  title.textContent = getDetailCardTitleText(item);
  row.append(rune, title);
  card.append(row);
  card.addEventListener("pointerenter", () => {
    setHoveredDetailCardEntry(item.entryId);
  });
  card.addEventListener("pointerleave", () => {
    if (state.extraction.hoveredCardEntryId === item.entryId) {
      setHoveredDetailCardEntry(null);
    }
  });

  item.detailCardElement = card;
  setRuneDisplayMode(item, true);
  setRuneHalosEnabled(item, false);

  return card;
}

function mountDetailHoverConnectors(items) {
  // Ziel: Fuer jeden Detaileintrag eine eigene Verbindung zu seinem Symbol vorbereiten.
  // Warum: Die alte permanente Linienwand wird durch bedarfsorientierte Hover-Connectoren ersetzt, damit die Zuordnung nur bei Interesse sichtbar wird.
  if (!detailLines) {
    return;
  }

  items.forEach((item) => {
    if (!item.runeAnchorMesh) {
      item.detailConnectorElement = null;
      return;
    }

    const connectorLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    connectorLine.classList.add("detail-connector");
    connectorLine.style.setProperty("--detail-accent", item.detail.accentHex);
    connectorLine.setAttribute("visibility", "hidden");
    detailLines.appendChild(connectorLine);
    item.detailConnectorElement = connectorLine;

    [item.runeGlyphMesh, item.runeHaloMesh].filter(Boolean).forEach((mesh) => {
      mesh.metadata = {
        ...(mesh.metadata || {}),
        detailHoverEntryId: item.entryId
      };
    });
  });
}

function mountRuneNetworkConnectors(items) {
  // Ziel: Nur die eigentliche H1/H2/H3-Hierarchie als dauerhaftes Netz zeigen.
  // Warum: Die Baumstruktur bleibt lesbar und deutlich leichter als das fruehere H2-Hub-Netz, ohne die Orientierung im DetailView zu verlieren.
  if (!detailLines) {
    return;
  }

  const h1Entry = items.find((item) => item.level === "h1" && item.runeAnchorMesh) || null;
  const h2Entries = items.filter((item) => item.level === "h2" && item.runeAnchorMesh);
  const h3EntriesByParentId = new Map();
  state.extraction.networkConnectors = [];

  items
    .filter((item) => item.level === "h3" && item.runeAnchorMesh && item.parentId)
    .forEach((item) => {
      const collection = h3EntriesByParentId.get(item.parentId) || [];
      collection.push(item);
      h3EntriesByParentId.set(item.parentId, collection);
    });

  const appendConnector = (sourceEntry, targetEntry) => {
    if (!sourceEntry || !targetEntry) {
      return;
    }

      const connectorLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      connectorLine.classList.add("detail-connector", "detail-connector-network");
      connectorLine.setAttribute("visibility", "visible");
      detailLines.appendChild(connectorLine);
      state.extraction.networkConnectors.push({
        sourceEntryId: sourceEntry.entryId,
        targetEntryId: targetEntry.entryId,
        element: connectorLine
      });
  };

  h2Entries.forEach((fragmentEntry) => {
    appendConnector(h1Entry, fragmentEntry);

    (h3EntriesByParentId.get(fragmentEntry.entryId) || []).forEach((runeFragmentEntry) => {
      appendConnector(fragmentEntry, runeFragmentEntry);
    });
  });
}

function mountExplodedDetails(items) {
  if (!detailCards || !detailLines) {
    return;
  }

  detailCards.innerHTML = "";
  detailLines.innerHTML = "";
  const crystalEntry = items.find((item) => item.level === "h1") || null;
  const fragmentEntries = items
    .filter((item) => item.level === "h2")
    .sort((left, right) => left.faceIndex - right.faceIndex);
  const runeEntriesByParent = new Map();

  items
    .filter((item) => item.level === "h3")
    .forEach((item) => {
      const collection = runeEntriesByParent.get(item.parentId) || [];
      collection.push(item);
      runeEntriesByParent.set(item.parentId, collection);
    });

  if (crystalEntry) {
    detailCards.appendChild(createDetailCard(crystalEntry));
  }

  fragmentEntries.forEach((fragmentEntry) => {
    const branch = document.createElement("section");
    const children = document.createElement("div");
    const h3Entries = (runeEntriesByParent.get(fragmentEntry.entryId) || [])
      .slice()
      .sort((left, right) => left.runeIndex - right.runeIndex);

    branch.className = "detail-branch";
    branch.style.setProperty("--detail-accent", fragmentEntry.detail.accentHex);
    children.className = "detail-children";
    branch.appendChild(createDetailCard(fragmentEntry));

    h3Entries.forEach((h3Entry) => {
      children.appendChild(createDetailCard(h3Entry));
    });

    branch.appendChild(children);
    detailCards.appendChild(branch);
  });

  mountDetailHoverConnectors(items);
  mountRuneNetworkConnectors(items);
  syncDetailConnectorVisibility();
  requestAnimationFrame(() => {
    syncLiveDetailPaneWidth();
  });
}

function setActiveContentEntry(entryId) {
  // Ziel: Einen aktiven Inhaltsknoten setzen und sofort die Content-Ansicht neu aufbauen.
  // Warum: Das Inhaltsverzeichnis soll schon im Dummy-Zustand wie ein echtes Arbeits-Navi reagieren und nicht nur statisch dekorativ bleiben.
  if (!entryId) {
    return;
  }

  state.extraction.activeContentEntryId = entryId;
  mountContentExperience(state.extraction.items);
}

function createContentTocButton(item, className) {
  // Ziel: Aus bestehenden H2/H3-Detaileintraegen ein klickbares Inhaltsverzeichnis bilden.
  // Warum: Die neue Ansicht soll dieselben Hierarchiedaten weiterverwenden, statt eine zweite manuell gepflegte Gliederung einzufuehren.
  const button = document.createElement("button");

  button.type = "button";
  button.className = className;
  button.textContent = item.detail.title;
  button.classList.toggle("is-active", state.extraction.activeContentEntryId === item.entryId);
  button.addEventListener("click", () => {
    setActiveContentEntry(item.entryId);
  });

  return button;
}

function createDummyContentPayload(activeEntry, crystalEntry, itemsById) {
  // Ziel: Fuer die rechte Spalte nur einen schlanken Placeholder erzeugen, der die spaetere Content-Flaeche markiert.
  // Warum: In diesem Schritt sind Bereichsanordnung und Ruecktransition wichtig; ein ueberladener Dummy wuerde eher vom eigentlichen Layoutziel ablenken.
  const levelLabel = activeEntry.level.toUpperCase();
  const parentEntry = activeEntry.parentId ? itemsById.get(activeEntry.parentId) : null;
  const pathTitles = [
    crystalEntry?.detail?.title || "Kristall",
    parentEntry && parentEntry.level !== "h1" ? parentEntry.detail.title : null,
    activeEntry.level !== "h1" ? activeEntry.detail.title : null
  ].filter(Boolean);

  return {
    eyebrow: `${levelLabel} · ${pathTitles.join(" / ")}`,
    title: activeEntry.detail.title,
    lead: activeEntry.detail.subtitle,
    placeholderTitle: "Content Placeholder",
    placeholderCopy: activeEntry.level === "h3"
      ? "Hier landet spaeter der eigentliche Fachinhalt dieses Fraktals."
      : activeEntry.level === "h2"
        ? "Hier landet spaeter der Abschnittsinhalt dieses Fragments."
        : "Hier landet spaeter der Oberinhalt der Hauptrune."
  };
}

function mountContentExperience(items) {
  // Ziel: Die Detaildaten als linkes Inhaltsverzeichnis mit rechter Dummy-Contentflaeche darstellen.
  // Warum: Der Rail-Button soll schon jetzt in die naechste Interaktionsebene fuehren, bevor der echte Fachcontent aus der Praesentation voll integriert ist.
  if (!contentToc || !contentStage) {
    return;
  }

  contentToc.innerHTML = "";
  contentStage.innerHTML = "";

  const crystalEntry = items.find((item) => item.level === "h1") || null;
  const fragmentEntries = items
    .filter((item) => item.level === "h2")
    .sort((left, right) => left.faceIndex - right.faceIndex);
  const runeEntriesByParent = new Map();
  const itemsById = new Map(items.map((item) => [item.entryId, item]));

  items
    .filter((item) => item.level === "h3")
    .forEach((item) => {
      const collection = runeEntriesByParent.get(item.parentId) || [];
      collection.push(item);
      runeEntriesByParent.set(item.parentId, collection);
    });

  const label = document.createElement("p");
  const crystalTitle = document.createElement("h2");
  label.className = "content-toc__label";
  label.textContent = "Inhaltsverzeichnis";
  crystalTitle.className = "content-toc__crystal-title";
  crystalTitle.textContent = crystalEntry?.detail.title || "Kristall";
  contentToc.append(label, crystalTitle);

  fragmentEntries.forEach((fragmentEntry) => {
    const group = document.createElement("section");
    const children = document.createElement("div");
    const runeEntries = (runeEntriesByParent.get(fragmentEntry.entryId) || [])
      .slice()
      .sort((left, right) => left.runeIndex - right.runeIndex);

    group.className = "content-toc__group";
    children.className = "content-toc__children";
    group.appendChild(createContentTocButton(fragmentEntry, "content-toc__link content-toc__link--h2"));

    runeEntries.forEach((entry) => {
      children.appendChild(createContentTocButton(entry, "content-toc__link content-toc__link--h3"));
    });

    group.appendChild(children);
    contentToc.appendChild(group);
  });

  const activeEntry = itemsById.get(state.extraction.activeContentEntryId)
    || items.find((item) => item.level === "h3")
    || items.find((item) => item.level === "h2")
    || crystalEntry
    || null;

  if (!activeEntry) {
    return;
  }

  const content = createDummyContentPayload(activeEntry, crystalEntry, itemsById);
  const sheet = document.createElement("article");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h2");
  const lead = document.createElement("p");
  const placeholder = document.createElement("section");
  const placeholderTitle = document.createElement("h3");
  const placeholderCopy = document.createElement("p");

  sheet.className = "content-sheet";
  eyebrow.className = "content-sheet__eyebrow";
  eyebrow.textContent = content.eyebrow;
  title.className = "content-sheet__title";
  title.textContent = content.title;
  lead.className = "content-sheet__lead";
  lead.textContent = content.lead;
  placeholder.className = "content-sheet__placeholder";
  placeholderTitle.className = "content-sheet__placeholder-title";
  placeholderTitle.textContent = content.placeholderTitle;
  placeholderCopy.className = "content-sheet__placeholder-copy";
  placeholderCopy.textContent = content.placeholderCopy;

  placeholder.append(placeholderTitle, placeholderCopy);
  sheet.append(eyebrow, title, lead, placeholder);
  contentStage.appendChild(sheet);
}

function clearExplodedDetails() {
  state.extraction.items.forEach((item) => {
    setRuneHalosEnabled(item, false);
    setRuneDisplayMode(item, false);
    [item.runeGlyphMesh, item.runeHaloMesh].filter(Boolean).forEach((mesh) => {
      if (!mesh.metadata) {
        return;
      }

      delete mesh.metadata.detailHoverEntryId;
    });
  });

  state.extraction.hoveredCardEntryId = null;
  state.extraction.hoveredRuneEntryId = null;
  state.extraction.networkConnectors = [];
  updateDetailAdvanceButtonState();

  if (detailCards) {
    detailCards.innerHTML = "";
  }

  if (contentToc) {
    contentToc.innerHTML = "";
  }

  if (contentStage) {
    contentStage.innerHTML = "";
  }

  if (detailLines) {
    detailLines.innerHTML = "";
  }

  refreshRuntimeDiagnostics();
}

function showTetrahedronDetails() {
  if (
    state.selectedId !== 4
    || !state.scene
    || !state.crystalRoot
    || isTetrahedronExpanded()
  ) {
    return;
  }

  const tetraEntries = state.faceEntries
    .filter((faceEntry) => faceEntry.shapeKind === "tetrahedron" && faceEntry.vertices)
    .sort((left, right) => left.faceIndex - right.faceIndex);

  if (!tetraEntries.length) {
    return;
  }

  stopSnapAnimation();
  clearFocusedFace();
  clearExtractedCrystal();
  state.extraction.viewMode = "detail";
  state.extraction.activeContentEntryId = null;
  applyExplodedLayout(true);
  const detailItems = getTetrahedronDetailItems(state.crystalRoot.metadata);

  mountExplodedDetails(detailItems);
  state.extraction.items = detailItems;
  state.extraction.stage = "expanded";

  if (STARTUP_CONFIG.hoverEntryId) {
    setHoveredDetailCardEntry(STARTUP_CONFIG.hoverEntryId);
  }

  if (STARTUP_CONFIG.openContent) {
    setExtractionViewMode("content");
  }

  refreshRuntimeDiagnostics();
}

function getTetrahedronDetailItems(metadata) {
  const crystalEntry = metadata?.crystalRuneEntry ? [metadata.crystalRuneEntry] : [];
  const fragmentEntries = (metadata?.fragmentEntries || [])
    .slice()
    .sort((left, right) => left.faceIndex - right.faceIndex);
  const runeEntries = (metadata?.runeFragmentEntries || [])
    .slice()
    .sort((left, right) => {
      if (left.faceIndex !== right.faceIndex) {
        return left.faceIndex - right.faceIndex;
      }

      return left.runeIndex - right.runeIndex;
    });

  return [...crystalEntry, ...fragmentEntries, ...runeEntries];
}

function collapseTetrahedronIntoGroundView() {
  if (state.extraction.stage !== "expanded") {
    return;
  }

  clearExtractedCrystal();
}

function clearExtractedCrystal() {
  clearExplodedDetails();
  state.extraction.root = null;
  state.extraction.materials = [];
  state.extraction.lights = [];
  state.extraction.hiddenMeshes = [];
  state.extraction.hiddenLights = [];
  state.extraction.stage = "idle";
  state.extraction.stageStartTime = 0;
  state.extraction.items = [];
  state.extraction.viewMode = "detail";
  state.extraction.activeContentEntryId = null;
  resetExtractionTransition("hidden");
  applyExplodedLayout(false);
  refreshRuntimeDiagnostics();
}

function projectWorldPointToStage(worldPoint) {
  const projectionContext = createStageProjectionContext();

  if (!projectionContext) {
    return null;
  }

  return projectWorldPointToStageWithContext(worldPoint, projectionContext);
}

function createStageProjectionContext() {
  // Ziel: Alle teuren Canvas-/Viewport-Daten pro Frame nur einmal lesen.
  // Warum: Bei vielen Symbolen und Verbindungslinien wurde dieselbe DOM- und Babylon-Projektionsarbeit hunderte Male pro Frame wiederholt und hat den Presenter spuerbar gebremst.
  if (!state.scene || !state.camera) {
    return null;
  }

  const engine = state.scene.getEngine();
  const canvasRect = renderCanvas.getBoundingClientRect();

  if (!canvasRect.width || !canvasRect.height) {
    return null;
  }

  const renderWidth = engine.getRenderWidth();
  const renderHeight = engine.getRenderHeight();

  return {
    canvasRect,
    renderWidth,
    renderHeight,
    viewport: state.camera.viewport.toGlobal(renderWidth, renderHeight),
    transformMatrix: state.scene.getTransformMatrix()
  };
}

function projectWorldPointToStageWithContext(worldPoint, projectionContext) {
  // Ziel: Weltpunkte mit einem bereits vorbereiteten Projektionskontext auf die Stage abbilden.
  // Warum: So lassen sich viele Symbol-Punkte in einem Rutsch billiger umrechnen, statt pro Punkt erneut Canvas, Viewport und Matrizen zu berechnen.
  if (!projectionContext) {
    return null;
  }

  const projected = BABYLON.Vector3.Project(
    worldPoint,
    BABYLON.Matrix.Identity(),
    projectionContext.transformMatrix,
    projectionContext.viewport
  );

  if (projected.z < 0 || projected.z > 1) {
    return null;
  }

  return {
    x: (projected.x / projectionContext.renderWidth) * projectionContext.canvasRect.width,
    y: (projected.y / projectionContext.renderHeight) * projectionContext.canvasRect.height
  };
}

function pickDetailItemFromRuneHover(scene, canvas, event) {
  // Ziel: Einen gehoverten Detaileintrag ueber das sichtbare Symbol im Canvas finden.
  // Warum: Ein screen-space Hover-Test an den projizierten Symbol-Ankern ist stabiler als Pickbarkeit umzuschalten und bewahrt den bestehenden Face-Klickpfad.
  if (!scene || !state.camera) {
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const cameraRight = state.camera.getDirection(BABYLON.Axis.X).normalize();
  const projectionContext = createStageProjectionContext();
  let bestMatch = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.extraction.items.forEach((item) => {
    if (!item.runeAnchorMesh || !item.runeGlyphMesh) {
      return;
    }

    const centerWorld = item.runeAnchorMesh.getAbsolutePosition();
    const centerPoint = projectWorldPointToStageWithContext(centerWorld, projectionContext);

    if (!centerPoint) {
      return;
    }

    const radiusWorld = item.runeGlyphMesh.getBoundingInfo()?.boundingSphere?.radiusWorld || 0.18;
    const edgePoint = projectWorldPointToStageWithContext(
      centerWorld.add(cameraRight.scale(radiusWorld)),
      projectionContext
    );
    const radiusPx = edgePoint
      ? Math.hypot(edgePoint.x - centerPoint.x, edgePoint.y - centerPoint.y)
      : 18;
    const hoverRadius = Math.max(12, radiusPx * 1.15);
    const pointerDistance = Math.hypot(pointerX - centerPoint.x, pointerY - centerPoint.y);

    if (pointerDistance <= hoverRadius && pointerDistance < bestDistance) {
      bestDistance = pointerDistance;
      bestMatch = item;
    }
  });

  return bestMatch;
}

function syncExplodedDetailLayout() {
  // Ziel: Die Hover-Connectoren framegenau zwischen Symbol und zugehoeriger Detailkarte halten.
  // Warum: Die Karten leben im DOM und die Symbole im Babylon-Canvas; nur eine laufende Projektion haelt beide Ebenen deckungsgleich verbunden.
  if (!detailCards || !detailLines || !state.extraction.items.length) {
    return;
  }

  const projectionContext = createStageProjectionContext();

  if (!projectionContext) {
    return;
  }

  const activeEntryId = getActiveDetailHoverEntryId();
  const isContentMode = state.extraction.viewMode === "content";
  const runePointByEntryId = new Map();

  state.extraction.items.forEach((item) => {
    if (!item.runeAnchorMesh) {
      return;
    }

    const projectedPoint = projectWorldPointToStageWithContext(
      item.runeAnchorMesh.getAbsolutePosition(),
      projectionContext
    );

    if (projectedPoint) {
      runePointByEntryId.set(item.entryId, projectedPoint);
    }
  });

  state.extraction.items.forEach((item) => {
    if (!item.detailConnectorElement || !item.detailCardElement || !item.runeAnchorMesh) {
      return;
    }

    if (isContentMode) {
      item.detailConnectorElement.setAttribute("visibility", "hidden");
      return;
    }

    const sourcePoint = runePointByEntryId.get(item.entryId) || null;
    const cardRect = item.detailCardElement.getBoundingClientRect();
    const canvasRect = projectionContext.canvasRect;
    const targetPoint = {
      x: (cardRect.left - canvasRect.left) + 2,
      y: (cardRect.top - canvasRect.top) + (cardRect.height / 2)
    };

    if (!sourcePoint) {
      item.detailConnectorElement.setAttribute("visibility", "hidden");
      return;
    }

    item.detailConnectorElement.setAttribute(
      "visibility",
      activeEntryId && item.entryId === activeEntryId ? "visible" : "hidden"
    );
    item.detailConnectorElement.setAttribute("x1", String(sourcePoint.x));
    item.detailConnectorElement.setAttribute("y1", String(sourcePoint.y));
    item.detailConnectorElement.setAttribute("x2", String(targetPoint.x));
    item.detailConnectorElement.setAttribute("y2", String(targetPoint.y));
  });

  const entriesById = new Map(state.extraction.items.map((item) => [item.entryId, item]));

  state.extraction.networkConnectors.forEach((connector) => {
    const sourceEntry = entriesById.get(connector.sourceEntryId);
    const targetEntry = entriesById.get(connector.targetEntryId);

    if (!connector.element || !sourceEntry?.runeAnchorMesh || !targetEntry?.runeAnchorMesh) {
      return;
    }

    const sourcePoint = runePointByEntryId.get(sourceEntry.entryId) || null;
    const targetPoint = runePointByEntryId.get(targetEntry.entryId) || null;

    if (!sourcePoint || !targetPoint) {
      connector.element.setAttribute("visibility", "hidden");
      return;
    }

    connector.element.setAttribute("visibility", "visible");
    connector.element.setAttribute("x1", String(sourcePoint.x));
    connector.element.setAttribute("y1", String(sourcePoint.y));
    connector.element.setAttribute("x2", String(targetPoint.x));
    connector.element.setAttribute("y2", String(targetPoint.y));
  });

  syncDetailConnectorVisibility();
}

function fract(value) {
  return value - Math.floor(value);
}

function pseudoRandom(seed) {
  return fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453123);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) * 0.5;
}

function syncContentLavaBallCanvas(panelRect) {
  if (!contentLavaBallCanvas || !panelRect.width || !panelRect.height) {
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(panelRect.width));
  const height = Math.max(1, Math.round(panelRect.height));
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));

  if (contentLavaBallCanvas.width !== pixelWidth || contentLavaBallCanvas.height !== pixelHeight) {
    contentLavaBallCanvas.width = pixelWidth;
    contentLavaBallCanvas.height = pixelHeight;
  }

  const context = contentLavaBallCanvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    context,
    width,
    height,
    dpr
  };
}

function createContentLavaBallMetrics(now, projectionContext) {
  // Ziel: Den Presenter-Effekt aus dem echten kleinen Kristall und seinem Container ableiten.
  // Warum: LavaBall, Burst und Kameraframing sollen am sichtbaren Mini-Kristall haengen und nicht an starren Magic Numbers.
  if (!contentCrystalPanel) {
    return null;
  }

  const panelRect = contentCrystalPanel.getBoundingClientRect();
  const canvasInfo = syncContentLavaBallCanvas(panelRect);
  const bounds = getProjectedCrystalBounds(projectionContext);

  if (!canvasInfo || !panelRect.width || !panelRect.height) {
    return null;
  }

  const safePadding = getContentCrystalSafePadding(panelRect);
  const fallbackCenterX = panelRect.width * 0.5;
  const fallbackCenterY = panelRect.height * 0.5;
  const centerX = bounds?.centerX ?? fallbackCenterX;
  const centerY = bounds?.centerY ?? fallbackCenterY;
  const crystalExtent = Math.max(bounds?.width || 0, bounds?.height || 0, Math.min(panelRect.width, panelRect.height) * 0.36);
  const minDimension = Math.min(panelRect.width, panelRect.height);
  const baseRadius = Math.min(
    (minDimension * 0.5) - (safePadding * 0.35),
    Math.max(minDimension * 0.24, (crystalExtent * 0.58) + (safePadding * 0.2))
  );

  const holeRadius = baseRadius * 0.66;
  const shellRadius = baseRadius * 1.04;
  const shellThickness = Math.max(baseRadius * 0.28, safePadding * 0.75);

  return {
    ...canvasInfo,
    panelRect,
    bounds,
    safePadding,
    centerX,
    centerY,
    crystalExtent,
    baseRadius,
    holeRadius,
    shellRadius,
    shellThickness,
    seed: state.extraction.transition.seed,
    now,
    timeSeconds: now / 1000,
    yCompression: 0.92
  };
}

function sampleLavaBallWave(angle, timeSeconds, seed) {
  const layerA = Math.sin((angle * 2.5) + (timeSeconds * 0.34) + (seed * 0.9));
  const layerB = Math.sin((angle * 5.2) - (timeSeconds * 0.58) + (seed * 1.7));
  const layerC = Math.cos((angle * 8.6) + (timeSeconds * 0.24) - (seed * 0.55));
  return (layerA * 0.55) + (layerB * 0.3) + (layerC * 0.15);
}

function drawLavaBallCore(context, metrics, burstStrength) {
  const {
    centerX,
    centerY,
    holeRadius,
    shellRadius,
    yCompression
  } = metrics;
  const brightInnerRadius = holeRadius * (1.03 + (burstStrength * 0.045));
  const outerHeatRadius = shellRadius * (1.02 + (burstStrength * 0.025));

  context.save();
  context.translate(centerX, centerY);
  context.scale(1, yCompression);
  context.globalCompositeOperation = "lighter";

  for (let pass = 0; pass < 4; pass += 1) {
    const radius = pass < 2
      ? brightInnerRadius + (pass * 4.2)
      : outerHeatRadius + ((pass - 2) * 6.8);

    context.beginPath();
    context.arc(0, 0, radius, 0, TAU);
    context.lineWidth = pass === 0 ? 4.4 : pass === 1 ? 7.6 : 10 + ((pass - 2) * 4);
    context.strokeStyle = pass === 0
      ? "rgba(255, 249, 236, 0.96)"
      : pass === 1
        ? `rgba(255, 214, 122, ${0.48 + (burstStrength * 0.16)})`
        : `rgba(255, 108, 28, ${0.18 + (burstStrength * 0.06)})`;
    context.shadowBlur = pass < 2 ? 24 + (pass * 10) : 30 + ((pass - 2) * 8);
    context.shadowColor = pass < 2
      ? "rgba(255, 233, 182, 0.72)"
      : "rgba(255, 109, 22, 0.34)";
    context.stroke();
  }

  context.restore();
}

function drawLavaBallMembrane(context, metrics, burstStrength, layerIndex) {
  const {
    centerX,
    centerY,
    timeSeconds,
    seed,
    holeRadius,
    shellRadius,
    shellThickness,
    yCompression
  } = metrics;
  const stepCount = 144;
  const outerBase = shellRadius + (layerIndex * 4.6);
  const innerBase = holeRadius * (1.02 + (layerIndex * 0.04));
  const thickness = (shellThickness * (0.92 - (layerIndex * 0.18))) + (burstStrength * 12);
  const outerWaveAmp = (shellThickness * 0.26) + (burstStrength * 10) + (layerIndex * 1.5);
  const innerWaveAmp = (shellThickness * 0.11) + (layerIndex * 1.1);

  context.save();
  context.translate(centerX, centerY);
  context.scale(1, yCompression);
  context.beginPath();

  for (let step = 0; step <= stepCount; step += 1) {
    const angle = (step / stepCount) * TAU;
    const wave = sampleLavaBallWave(angle, timeSeconds + (layerIndex * 0.18), seed + (layerIndex * 0.73));
    const rip = Math.max(0, Math.sin((angle * (3.6 + (layerIndex * 0.68))) - (timeSeconds * (0.72 + (layerIndex * 0.14))) + seed));
    const radius = outerBase + thickness + (wave * outerWaveAmp) + (rip * shellThickness * 0.16);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (step === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  for (let step = stepCount; step >= 0; step -= 1) {
    const angle = (step / stepCount) * TAU;
    const wave = sampleLavaBallWave(angle, (timeSeconds * 0.84) - (layerIndex * 0.12), seed + 10 + (layerIndex * 1.17));
    const rip = Math.max(0, Math.cos((angle * (4.3 + (layerIndex * 0.5))) + (timeSeconds * (0.46 + (layerIndex * 0.1))) + seed));
    const radius = innerBase + (wave * innerWaveAmp) + (rip * shellThickness * 0.08);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    context.lineTo(x, y);
  }

  context.closePath();

  const fillGradient = context.createRadialGradient(0, 0, innerBase * 0.92, 0, 0, outerBase + (thickness * 1.3));
  fillGradient.addColorStop(0, `rgba(255, 252, 243, ${0.03 + (burstStrength * 0.01)})`);
  fillGradient.addColorStop(0.18, `rgba(255, 237, 192, ${0.06 + (layerIndex * 0.02)})`);
  fillGradient.addColorStop(0.42, `rgba(255, 191, 84, ${0.22 + (layerIndex * 0.05)})`);
  fillGradient.addColorStop(0.72, `rgba(255, 112, 28, ${0.38 + (burstStrength * 0.08)})`);
  fillGradient.addColorStop(1, "rgba(255, 78, 18, 0)");
  context.fillStyle = fillGradient;
  context.fill("evenodd");

  context.globalCompositeOperation = "lighter";
  context.lineWidth = 5.2 - (layerIndex * 0.9);
  context.strokeStyle = layerIndex === 0
    ? `rgba(255, 236, 188, ${0.44 + (burstStrength * 0.12)})`
    : `rgba(255, 142, 52, ${0.26 + (burstStrength * 0.08)})`;
  context.shadowBlur = 20 + (burstStrength * 14);
  context.shadowColor = layerIndex === 0 ? "rgba(255, 207, 116, 0.42)" : "rgba(255, 94, 16, 0.3)";
  context.stroke();

  context.beginPath();
  context.arc(0, 0, innerBase + (layerIndex * 1.8), 0, TAU);
  context.lineWidth = 1.8 + (burstStrength * 0.7);
  context.strokeStyle = `rgba(255, 248, 224, ${0.16 + (burstStrength * 0.04)})`;
  context.stroke();
  context.restore();
}

function drawLavaBallCoronalGaps(context, metrics, burstStrength) {
  const {
    centerX,
    centerY,
    holeRadius,
    shellThickness,
    timeSeconds,
    seed,
    yCompression
  } = metrics;
  const gapCount = prefersReducedMotion() ? 2 : 4;

  context.save();
  context.translate(centerX, centerY);
  context.scale(1, yCompression);
  context.globalCompositeOperation = "destination-out";

  for (let index = 0; index < gapCount; index += 1) {
    const anchor = (index / gapCount) * TAU;
    const drift = sampleLavaBallWave(anchor, timeSeconds * 0.22, seed + (index * 2.1)) * 0.12;
    const angle = anchor + drift;
    const spread = 0.18 + (pseudoRandom(seed + (index * 4.3)) * 0.12);

    context.beginPath();
    context.arc(0, 0, holeRadius * (1.18 + (pseudoRandom(seed + index) * 0.08)), angle - spread, angle + spread);
    context.lineWidth = shellThickness * (0.46 + (burstStrength * 0.08));
    context.strokeStyle = `rgba(0, 0, 0, ${0.22 + (burstStrength * 0.08)})`;
    context.shadowBlur = 18;
    context.shadowColor = "rgba(0, 0, 0, 0.24)";
    context.stroke();
  }

  context.restore();
}

function drawLavaBallTentacles(context, metrics, burstStrength) {
  const {
    centerX,
    centerY,
    shellRadius,
    timeSeconds,
    seed,
    yCompression
  } = metrics;
  const tentacleCount = prefersReducedMotion() ? 3 : 5 + Math.round(burstStrength * 4);

  context.save();
  context.translate(centerX, centerY);
  context.scale(1, yCompression);
  context.globalCompositeOperation = "lighter";

  for (let index = 0; index < tentacleCount; index += 1) {
    const lane = index / tentacleCount;
    const angle = (lane * TAU) + (sampleLavaBallWave(lane * TAU, timeSeconds * 0.24, seed + index) * 0.12);
    const launchRadius = shellRadius + (Math.max(0, Math.sin((timeSeconds * 0.92) + (index * 0.52) + seed)) * burstStrength * 12);
    const length = (shellRadius * (0.26 + (pseudoRandom(seed + (index * 2.17)) * 0.18))) + (burstStrength * 20);
    const tangent = angle + ((pseudoRandom(seed + (index * 5.1)) - 0.5) * 0.55);
    const startX = Math.cos(angle) * launchRadius;
    const startY = Math.sin(angle) * launchRadius;
    const tipX = Math.cos(angle) * (launchRadius + length);
    const tipY = Math.sin(angle) * (launchRadius + length);
    const controlX = (startX * 0.32) + (tipX * 0.68) + (Math.cos(tangent) * length * 0.34);
    const controlY = (startY * 0.32) + (tipY * 0.68) + (Math.sin(tangent) * length * 0.34);

    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, tipX, tipY);
    context.lineWidth = 2.8 + (burstStrength * 1.3);
    context.strokeStyle = `rgba(255, 171, 72, ${0.22 + (burstStrength * 0.12)})`;
    context.shadowBlur = 18;
    context.shadowColor = "rgba(255, 116, 28, 0.3)";
    context.stroke();

    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, tipX, tipY);
    context.lineWidth = 1.4 + (burstStrength * 0.5);
    context.strokeStyle = `rgba(255, 241, 196, ${0.16 + (burstStrength * 0.06)})`;
    context.stroke();
  }

  context.restore();
}

function createLavaBallParticle(now, metrics, burstStrength, particleIndex) {
  const seed = state.extraction.transition.seed + particleIndex + (now * 0.001);
  const typeRoll = pseudoRandom(seed + 8.8);
  const type = typeRoll < 0.56
    ? "island"
    : typeRoll < 0.87
      ? "drifter"
      : "flyer";
  const lifeMs = type === "flyer"
    ? 1180 + (pseudoRandom(seed + 0.4) * 640) + (burstStrength * 220)
    : 1480 + (pseudoRandom(seed + 0.4) * 920) + (burstStrength * 320);
  const angle = pseudoRandom(seed + 1.2) * TAU;
  const arc = type === "flyer"
    ? (pseudoRandom(seed + 2.3) - 0.5) * (0.5 + (burstStrength * 0.52))
    : (pseudoRandom(seed + 2.3) - 0.5) * 0.22;
  const launch = type === "flyer"
    ? (metrics.shellRadius * (0.16 + (pseudoRandom(seed + 3.1) * 0.16))) + (burstStrength * 18)
    : type === "drifter"
      ? (metrics.shellRadius * (0.1 + (pseudoRandom(seed + 3.1) * 0.12))) + (burstStrength * 8)
      : (metrics.shellRadius * (0.04 + (pseudoRandom(seed + 3.1) * 0.06))) + (burstStrength * 3.5);
  const size = type === "island"
    ? 5.8 + (pseudoRandom(seed + 4.8) * 7.6) + (burstStrength * 2.2)
    : type === "drifter"
      ? 3.8 + (pseudoRandom(seed + 4.8) * 4.8) + (burstStrength * 1.3)
      : 2.3 + (pseudoRandom(seed + 4.8) * 2.7) + (burstStrength * 1.1);

  return {
    type,
    bornAt: now,
    lifeMs,
    angle,
    arc,
    launch,
    size,
    emberStart: type === "flyer"
      ? 0.58 + (pseudoRandom(seed + 7.9) * 0.12)
      : 0.72 + (pseudoRandom(seed + 7.9) * 0.1),
    history: []
  };
}

function updateLavaBallParticles(now, metrics, burstStrength) {
  const transition = state.extraction.transition;

  if (prefersReducedMotion()) {
    transition.particles = [];
    return;
  }

  const targetCount = Math.round(4 + (burstStrength * 9));
  const spawnInterval = Math.max(120, 420 - (burstStrength * 180));

  while (
    transition.lastSpawnTime > 0
    && now - transition.lastSpawnTime >= spawnInterval
    && transition.particles.length < targetCount
  ) {
    transition.lastSpawnTime += spawnInterval;
    transition.particles.push(
      createLavaBallParticle(now, metrics, burstStrength, transition.particles.length)
    );
  }

  transition.particles = transition.particles.filter((particle) => {
    const progress = (now - particle.bornAt) / particle.lifeMs;

    if (progress >= 1) {
      return false;
    }

    let liftCurve = 0;

    if (particle.type === "flyer") {
      const arcProgress = Math.sin(progress * Math.PI);
      liftCurve = arcProgress * (1 - (progress * 0.18));
    } else if (particle.type === "drifter") {
      liftCurve = Math.sin(progress * Math.PI * 0.72) * (0.84 - (progress * 0.12));
    } else {
      const rise = Math.min(1, progress / 0.3);
      const settle = progress > 0.62 ? (progress - 0.62) / 0.38 : 0;
      liftCurve = (easeOutCubic(rise) * 0.72) - (easeInOutSine(Math.min(1, settle)) * 0.26);
    }

    const radius = metrics.shellRadius + (particle.launch * liftCurve);
    const angle = particle.angle + (particle.arc * liftCurve);
    const x = metrics.centerX + (Math.cos(angle) * radius);
    const y = metrics.centerY + (Math.sin(angle) * radius * metrics.yCompression);
    particle.progress = progress;
    particle.x = x;
    particle.y = y;
    particle.history.unshift({ x, y, progress });
    particle.history.length = particle.type === "island" ? 18 : 14;
    return true;
  });
}

function drawLavaBallParticles(context, metrics, burstStrength) {
  const particles = state.extraction.transition.particles;

  if (!particles.length) {
    return;
  }

  context.save();
  context.globalCompositeOperation = "lighter";

  particles.forEach((particle) => {
    if (!particle.history.length) {
      return;
    }

    context.beginPath();
    particle.history.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.lineWidth = particle.size * (
      particle.type === "island"
        ? (1.55 - (particle.progress * 0.32))
        : 1.18 - (particle.progress * 0.42)
    );
    context.strokeStyle = particle.type === "island"
      ? `rgba(255, 126, 38, ${0.3 + (burstStrength * 0.12)})`
      : particle.progress >= particle.emberStart
        ? `rgba(255, 243, 205, ${0.36 + (burstStrength * 0.16)})`
        : `rgba(255, 140, 44, ${0.28 + (burstStrength * 0.16)})`;
    context.shadowBlur = 16 + (particle.size * 2.8);
    context.shadowColor = particle.type === "island"
      ? "rgba(255, 102, 16, 0.38)"
      : particle.progress >= particle.emberStart
        ? "rgba(255, 239, 192, 0.4)"
        : "rgba(255, 110, 16, 0.34)";
    context.stroke();

    context.beginPath();
    particle.history.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.lineWidth = particle.size * (
      particle.type === "island"
        ? (0.8 - (particle.progress * 0.18))
        : 0.5
    );
    context.strokeStyle = particle.progress >= particle.emberStart
      ? `rgba(255, 243, 205, ${0.36 + (burstStrength * 0.16)})`
      : `rgba(255, 140, 44, ${0.28 + (burstStrength * 0.16)})`;
    context.stroke();

    if (particle.type === "island") {
      context.beginPath();
      context.ellipse(
        particle.x,
        particle.y,
        particle.size * 0.92,
        particle.size * 0.64,
        particle.angle,
        0,
        TAU
      );
      context.fillStyle = "rgba(255, 118, 34, 0.36)";
      context.fill();
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.size * (particle.progress >= particle.emberStart ? 0.55 : 0.75), 0, TAU);
    context.fillStyle = particle.type === "island"
      ? "rgba(255, 212, 132, 0.82)"
      : particle.progress >= particle.emberStart
        ? "rgba(255, 247, 220, 0.92)"
        : "rgba(255, 189, 98, 0.8)";
    context.fill();
  });

  context.restore();
}

function carveLavaBallSightHole(context, metrics, burstStrength) {
  // Ziel: Den Kristall trotz Front-Layer klar durch den LavaBall hindurch sichtbar halten.
  // Warum: Der Effekt soll vor dem Kristall sitzen, ihn aber nicht mit einer voll deckenden Flaeche verdecken; das Sichtloch ist deshalb Teil der Form statt nur reduzierte Gesamtdeckkraft.
  const {
    centerX,
    centerY,
    holeRadius,
    yCompression
  } = metrics;

  context.save();
  context.translate(centerX, centerY);
  context.scale(1, yCompression);
  context.globalCompositeOperation = "destination-out";
  const cutGradient = context.createRadialGradient(0, 0, holeRadius * 0.22, 0, 0, holeRadius * 1.08);
  cutGradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
  cutGradient.addColorStop(0.58, "rgba(0, 0, 0, 0.74)");
  cutGradient.addColorStop(0.88, `rgba(0, 0, 0, ${0.28 + (burstStrength * 0.08)})`);
  cutGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = cutGradient;
  context.beginPath();
  context.ellipse(0, 0, holeRadius * 1.12, holeRadius * 0.98, 0, 0, TAU);
  context.fill();
  context.restore();

  context.save();
  context.translate(centerX, centerY);
  context.scale(1, yCompression);
  context.globalCompositeOperation = "lighter";
  const sheenGradient = context.createRadialGradient(0, 0, holeRadius * 0.3, 0, 0, holeRadius * 1.08);
  sheenGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  sheenGradient.addColorStop(0.72, `rgba(255, 240, 206, ${0.045 + (burstStrength * 0.02)})`);
  sheenGradient.addColorStop(1, `rgba(255, 176, 74, ${0.12 + (burstStrength * 0.04)})`);
  context.fillStyle = sheenGradient;
  context.beginPath();
  context.ellipse(0, 0, holeRadius * 1.08, holeRadius * 0.94, 0, 0, TAU);
  context.fill();
  context.restore();
}

function drawContentLavaBall(now, metrics, burstStrength, idlePulse) {
  // Ziel: Den Presenter-Kristall als eigenes Rueck-Portal mit einem warmen LavaBall visualisieren.
  // Warum: Das kleine Panel soll nicht wie ein abgeschnittener zweiter View wirken, sondern wie ein hypnotischer, hochwertiger Rueckbutton mit solarer, schlickiger Tiefe.
  const { context, width, height } = metrics;
  context.clearRect(0, 0, width, height);

  const backdropGradient = context.createRadialGradient(
    metrics.centerX,
    metrics.centerY,
    metrics.holeRadius * 0.9,
    metrics.centerX,
    metrics.centerY,
    metrics.shellRadius * 1.95
  );
  backdropGradient.addColorStop(0, "rgba(255, 240, 208, 0)");
  backdropGradient.addColorStop(0.38, `rgba(255, 198, 98, ${0.04 + (burstStrength * 0.035)})`);
  backdropGradient.addColorStop(0.7, `rgba(255, 104, 24, ${0.1 + (idlePulse * 0.05)})`);
  backdropGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = backdropGradient;
  context.fillRect(0, 0, width, height);

  drawLavaBallMembrane(context, metrics, burstStrength, 0);
  drawLavaBallMembrane(context, metrics, burstStrength * 0.82, 1);
  drawLavaBallCoronalGaps(context, metrics, burstStrength);
  drawLavaBallTentacles(context, metrics, burstStrength);
  drawLavaBallCore(context, metrics, burstStrength);
  updateLavaBallParticles(now, metrics, burstStrength);
  drawLavaBallParticles(context, metrics, burstStrength);
  carveLavaBallSightHole(context, metrics, burstStrength);
}

function updateExtractionAnimation() {
  const transition = state.extraction.transition;
  const isContentVisible = state.extraction.stage === "expanded" && state.extraction.viewMode === "content";

  if (!isContentVisible && transition.phase === "hidden") {
    clearContentLavaBallCanvas();
    return;
  }

  const now = performance.now();
  const progress = transition.durationMs > 0
    ? Math.min(1, Math.max(0, (now - transition.startTime) / transition.durationMs))
    : 1;
  let burstStrength = 0;

  if (isContentVisible) {
    syncPresenterCrystalFraming();
  }

  if (transition.phase === "enter") {
    burstStrength = 1 - easeOutCubic(progress);

    if (progress >= 1) {
      transition.phase = "idle";
      transition.durationMs = 0;
      transition.startTime = 0;
    }
  } else if (transition.phase === "exit") {
    burstStrength = Math.sin(progress * Math.PI);

    if (progress >= 1) {
      const pendingViewMode = transition.pendingViewMode || "detail";
      commitExtractionViewMode(pendingViewMode);
      resetExtractionTransition("hidden");
      return;
    }
  }

  if (!isContentVisible && transition.phase !== "exit") {
    clearContentLavaBallCanvas();
    return;
  }

  const projectionContext = createStageProjectionContext();
  const metrics = createContentLavaBallMetrics(now, projectionContext);

  if (!metrics) {
    clearContentLavaBallCanvas();
    return;
  }

  const idlePulse = prefersReducedMotion()
    ? 0.18
    : 0.2 + (Math.sin((now / 1000) * 0.62) * 0.06);
  const reducedBurstStrength = prefersReducedMotion() ? 0.12 : burstStrength;
  const lavaBallOpacity = Math.min(1, 0.86 + idlePulse + (reducedBurstStrength * 0.12));
  const lavaBallScale = 1 + (reducedBurstStrength * 0.025);

  contentCrystalPanel?.style.setProperty("--content-lavaball-opacity", `${lavaBallOpacity}`);
  contentCrystalPanel?.style.setProperty("--content-lavaball-scale", `${lavaBallScale}`);
  drawContentLavaBall(now, metrics, reducedBurstStrength, idlePulse);
}

function updatePresenterRotation(scene) {
  // Ziel: Den Kristall im Presenter-/Content-Mode ruhig und kontinuierlich auf allen drei Achsen rotieren lassen.
  // Warum: In dieser Ansicht ist der Kristall Teil der Praesentation und soll lebendig wirken, ohne dass die Root-Ansicht oder die manuelle Rechtsklick-Steuerung beeinflusst werden.
  if (
    !scene
    || !state.crystalRoot
    || state.extraction.stage !== "expanded"
    || state.extraction.viewMode !== "content"
    || state.snap.active
  ) {
    return;
  }

  if (state.drag.active && state.drag.button === 2) {
    return;
  }

  const deltaSeconds = Math.min(scene.getEngine().getDeltaTime() / 1000, 1 / 30);

  if (deltaSeconds <= 0) {
    return;
  }

  const currentRotation = state.crystalRoot.rotationQuaternion || BABYLON.Quaternion.Identity();
  const deltaRotation = BABYLON.Quaternion.RotationYawPitchRoll(
    PRESENTER_ROTATION_SPEED.y * deltaSeconds,
    PRESENTER_ROTATION_SPEED.x * deltaSeconds,
    PRESENTER_ROTATION_SPEED.z * deltaSeconds
  );
  const nextRotation = currentRotation.multiply(deltaRotation);

  nextRotation.normalize();
  state.crystalRoot.rotationQuaternion = nextRotation;
}

function enableBoxDragging(camera, canvas) {
  const dragState = state.drag;
  const dragSensitivity = 0.0035;
  const clickThresholdPx = 8;

  canvas.style.cursor = "grab";
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.button !== 2) {
      return;
    }

    stopSnapAnimation();
    dragState.active = true;
    dragState.pointerId = event.pointerId;
    dragState.button = event.button;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
    dragState.moved = false;
    dragState.pressedFaceEntry = getFaceEntryFromPointerEvent(state.scene, canvas, event);
    dragState.pressedRuneEntry = getRuneEntryFromPointerEvent(state.scene, canvas, event);
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (isTetrahedronExpanded()) {
      if (dragState.active) {
        setHoveredRuneEntry(null);
      } else if (state.extraction.viewMode === "content") {
        setHoveredRuneEntry(null);
      } else {
        const hoveredDetailItem = pickDetailItemFromRuneHover(state.scene, canvas, event);
        setHoveredRuneEntry(hoveredDetailItem?.entryId || null);
      }
    }

    if (event.pointerId !== dragState.pointerId || !dragState.active || !state.crystalRoot) {
      return;
    }

    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;
    const distanceFromStart = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);

    if (distanceFromStart > clickThresholdPx) {
      dragState.moved = true;
    }

    if (dragState.button === 2) {
      const yawAxis = camera.getDirection(BABYLON.Axis.Y).normalize();
      const pitchAxis = camera.getDirection(BABYLON.Axis.X).normalize();
      const yawRotation = BABYLON.Quaternion.RotationAxis(yawAxis, -deltaX * dragSensitivity);
      const pitchRotation = BABYLON.Quaternion.RotationAxis(pitchAxis, -deltaY * dragSensitivity);
      const currentRotation = state.crystalRoot.rotationQuaternion || BABYLON.Quaternion.Identity();
      const nextRotation = yawRotation.multiply(pitchRotation).multiply(currentRotation);

      nextRotation.normalize();
      state.crystalRoot.rotationQuaternion = nextRotation;
    }

    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
  });

  const endDrag = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    const pickedMesh = !dragState.moved
      ? (dragState.pressedFaceEntry?.mesh || pickMeshFromPointerEvent(state.scene, canvas, event))
      : null;
    const focusedSymbolEntry = !dragState.moved
      ? (dragState.pressedRuneEntry || getRuneEntryFromPointerEvent(state.scene, canvas, event))
      : null;
    const focusedEntry = pickedMesh
      ? (dragState.pressedFaceEntry || state.faceEntries.find((entry) => entry.mesh === pickedMesh) || null)
      : null;
    const releasedButton = dragState.button;
    dragState.active = false;
    dragState.pointerId = null;
    dragState.button = null;
    dragState.pressedFaceEntry = null;
    dragState.pressedRuneEntry = null;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = "grab";

    if (releasedButton === 2) {
      return;
    }

    if (isTetrahedronExpanded()) {
      if (state.extraction.viewMode === "content") {
        if (!dragState.moved) {
          // Ziel: Im Content-Modus per Linksklick auf den Kristallbereich wieder in die Detail-Ebene zurueckkehren.
          // Warum: Der Rueckweg darf nicht nur am Rail-Button haengen; der Kristall oben links ist selbst die semantische Zurueck-Aktion.
          requestContentReturnToDetail();
        }

        return;
      }

      if (!dragState.moved && !pickedMesh) {
        collapseTetrahedronIntoGroundView();
      }
      return;
    }

    if (!dragState.moved && state.selectedId === 4) {
      // Ziel: Den Einstieg in den Form-4-DetailView auch dann robust halten, wenn transparentes Innenleben das Picking unzuverlaessig macht.
      // Warum: Fuer den Nutzer ist der Linksklick auf den Grundkristall die semantische Aktion; ob Babylon dabei gerade eine Aussenflaeche, ein Symbol oder gar nichts liefert, darf den Einstieg nicht blockieren.
      if (!focusedEntry && !focusedSymbolEntry) {
        stopSnapAnimation();
        showTetrahedronDetails();
        return;
      }
    }

    if (!focusedEntry && focusedSymbolEntry && state.selectedId === 4) {
      stopSnapAnimation();
      showTetrahedronDetails();
      return;
    }

    if (focusedEntry) {
      focusFaceEntry(focusedEntry);
    }
  };

  const cancelDrag = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    dragState.active = false;
    dragState.pointerId = null;
    dragState.button = null;
    dragState.pressedFaceEntry = null;
    dragState.pressedRuneEntry = null;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = "grab";
  };

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", cancelDrag);
  canvas.addEventListener("pointerleave", () => {
    setHoveredRuneEntry(null);
  });
}

function enableViewerMovement(camera) {
  const isInteractiveTarget = (target) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(target.closest("input, textarea, select, button, [contenteditable='true']"));
  };

  const setMovementFlag = (code, isPressed) => {
    switch (code) {
      case "KeyW":
        state.movement.forward = isPressed;
        return true;
      case "KeyS":
        state.movement.backward = isPressed;
        return true;
      case "KeyA":
        state.movement.left = isPressed;
        return true;
      case "KeyD":
        state.movement.right = isPressed;
        return true;
      default:
        return false;
    }
  };

  window.addEventListener("keydown", (event) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    if (setMovementFlag(event.code, true)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (setMovementFlag(event.code, false)) {
      event.preventDefault();
    }
  });

  window.addEventListener("blur", () => {
    state.movement.forward = false;
    state.movement.backward = false;
    state.movement.left = false;
    state.movement.right = false;
  });
}

function updateViewerMovement(scene) {
  if (!state.camera) {
    return;
  }

  const forwardAmount = Number(state.movement.forward) - Number(state.movement.backward);
  const strafeAmount = Number(state.movement.right) - Number(state.movement.left);

  if (forwardAmount === 0 && strafeAmount === 0) {
    return;
  }

  const deltaSeconds = scene.getEngine().getDeltaTime() / 1000;
  const cameraForward = state.camera.target
    .subtract(state.camera.globalPosition)
    .normalize();
  const cameraRight = state.camera.getDirection(BABYLON.Axis.X).normalize();
  const movementVector = cameraForward.scale(forwardAmount).add(cameraRight.scale(strafeAmount));

  if (movementVector.lengthSquared() < 1e-6) {
    return;
  }

  movementVector.normalize();
  const translation = movementVector.scale(state.movement.speed * deltaSeconds);
  state.camera.target.addInPlace(translation);
}

function snapNearestFaceToFront() {
  if (!state.crystalRoot || state.faceEntries.length === 0 || !state.camera) {
    return;
  }

  const currentRotation = (state.crystalRoot.rotationQuaternion || BABYLON.Quaternion.Identity()).clone();
  const desiredDirection = state.camera.globalPosition
    .subtract(state.crystalRoot.getAbsolutePosition())
    .normalize();

  let bestEntry = null;
  let bestScore = -Infinity;

  state.faceEntries.forEach((entry) => {
    if (entry.snapEligible === false) {
      return;
    }

    const worldNormal = rotateVectorByQuaternion(entry.localNormal, currentRotation);
    const score = BABYLON.Vector3.Dot(worldNormal, desiredDirection);

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  });

  if (!bestEntry) {
    return;
  }

  const currentWorldNormal = rotateVectorByQuaternion(bestEntry.localNormal, currentRotation);
  const snapDelta = quaternionFromUnitVectors(currentWorldNormal, desiredDirection);
  const targetRotation = snapDelta.multiply(currentRotation);
  targetRotation.normalize();
  startSnapAnimation(currentRotation, targetRotation);
}

function rotateVectorByQuaternion(vector, quaternion) {
  const matrix = BABYLON.Matrix.Identity();
  quaternion.toRotationMatrix(matrix);
  return BABYLON.Vector3.TransformNormal(vector, matrix).normalize();
}

function quaternionFromUnitVectors(fromVector, toVector) {
  const from = fromVector.clone().normalize();
  const to = toVector.clone().normalize();
  const dot = BABYLON.Vector3.Dot(from, to);

  if (dot > 0.999999) {
    return BABYLON.Quaternion.Identity();
  }

  if (dot < -0.999999) {
    const axis = Math.abs(from.x) < 0.9
      ? BABYLON.Vector3.Cross(from, BABYLON.Axis.X)
      : BABYLON.Vector3.Cross(from, BABYLON.Axis.Y);
    axis.normalize();
    return BABYLON.Quaternion.RotationAxis(axis, Math.PI);
  }

  const axis = BABYLON.Vector3.Cross(from, to);
  const quaternion = new BABYLON.Quaternion(axis.x, axis.y, axis.z, 1 + dot);
  quaternion.normalize();
  return quaternion;
}

function startSnapAnimation(fromQuaternion, toQuaternion) {
  state.snap.active = true;
  state.snap.startTime = performance.now();
  state.snap.fromQuaternion = fromQuaternion.clone();
  state.snap.toQuaternion = toQuaternion.clone();
}

function stopSnapAnimation() {
  state.snap.active = false;
  state.snap.fromQuaternion = null;
  state.snap.toQuaternion = null;
}

function updateSnapAnimation() {
  if (!state.snap.active || !state.crystalRoot || !state.snap.fromQuaternion || !state.snap.toQuaternion) {
    return;
  }

  const elapsed = performance.now() - state.snap.startTime;
  const rawProgress = Math.min(1, elapsed / state.snap.durationMs);
  const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
  const nextRotation = BABYLON.Quaternion.Slerp(
    state.snap.fromQuaternion,
    state.snap.toQuaternion,
    easedProgress
  );

  nextRotation.normalize();
  state.crystalRoot.rotationQuaternion = nextRotation;

  if (rawProgress >= 1) {
    stopSnapAnimation();
  }
}
