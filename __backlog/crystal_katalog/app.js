const catalogItems = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  title: String(index + 1),
  mark: "Slot"
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
const runtimeDebug = document.getElementById("runtimeDebug");
const runtimeDebugMode = document.getElementById("runtimeDebugMode");
const runtimeDebugSummary = document.getElementById("runtimeDebugSummary");
const runtimeDebugLog = document.getElementById("runtimeDebugLog");
const STARTUP_CONFIG = parseStartupConfig();
const diagnostics = createDiagnosticsState(STARTUP_CONFIG);

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
    stage: "idle",
    stageStartTime: 0,
    items: []
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
    pressedFaceEntry: null
  },
  movement: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 4.6
  }
};

installGlobalDiagnosticHooks();
renderList();
renderQuickSelects();
updateSelection(STARTUP_CONFIG.selectionId);
setupBabylonScene();

function renderList() {
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "list-item";
    button.dataset.itemId = String(item.id);
    button.innerHTML = `
      <span class="list-item-title">${item.title}</span>
      <span class="list-item-mark">${item.mark || "Slot"}</span>
    `;
    button.addEventListener("click", () => updateSelection(item.id));
    fragment.appendChild(button);
    state.buttons.push(button);
  });

  listView.appendChild(fragment);
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

  return {
    selectionId: itemsById.has(selectionCandidate) ? selectionCandidate : 1,
    openDetails: ["1", "true", "yes"].includes((params.get("detail") || "").toLowerCase()),
    testlab: params.has("testlab") || params.has("debug")
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
    `Selection ${metrics.selectionId} · Faces ${metrics.faceEntries} · Detail ${metrics.detailOpen ? "offen" : "zu"}`,
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
    "Form 4 hat keine H1-Zentralrune im Metadata-Pfad.",
    state.selectedId === 4 && !crystalEntry.length
  );
  setDiagnosticCondition(
    "missing-h2",
    "Form 4 hat keine H2-Fragmentrunen im Metadata-Pfad.",
    state.selectedId === 4 && !fragmentEntries.length
  );

  updateRuntimeDebugPanel();
}

function syncDetachedRuneAnchors() {
  // Ziel: Legacy-Helfer nur fuer wirklich geloeste Rune-Anker ausfuehren.
  // Warum: H1/H2 sollen wieder an ihrer echten Kristallgeometrie haengen; kameraseitiges Nachziehen war der Hauptgrund dafuer, dass Zentrums- und Flaechenrunen nicht dort erschienen, wo sie semantisch hingehoeren.
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

function applyExplodedLayout(isActive) {
  document.body.classList.toggle("is-exploded", isActive);

  if (detailExperience) {
    detailExperience.setAttribute("aria-hidden", String(!isActive));
  }

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
    6.1,
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

  if (state.camera) {
    state.camera.radius = 6.1;
  }

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
  // Warum: Die groesste Rune muss im Kristallzentrum dominant lesbar sein, die H2-Runen explizit auf den Aussenflaechen sitzen und die H3-Runen als kleine Einschluss-Zentren der RunenFragmente erkennbar bleiben.
  const centroid = computeUniqueVerticesCenter(faces);
  const crystalHeightAxis = computePreferredTetrahedronHeightAxis(faces);
  const crystalRuneRotation = quaternionFromUnitVectors(BABYLON.Axis.Y, crystalHeightAxis);
  const crystalRuneColor = getBodyColorForSelection(selectionId, "tetrahedron_crystal_rune_primary");
  const crystalRuneMeshes = createRuneMeshes(
    scene,
    `tetrahedron_crystal_rune_${selectionId}`,
    CRYSTAL_RUNE_SYMBOL,
    crystalRuneColor,
    {
      showHalo: true,
      glyphSize: 0.92,
      haloScale: 1.76,
      billboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
      emissiveIntensity: 3.4,
      alwaysVisible: true,
      renderingGroupId: 3,
      glyphPlaneOffset: 0.04,
      haloPlaneOffset: -0.024,
      alphaMode: BABYLON.Engine.ALPHA_COMBINE,
      textureSize: 512,
      outlineWidth: 24
    }
  );

  // Ziel: Die H1-Rune geometrisch wirklich im Kristallzentrum halten.
  // Warum: Sobald der Anchor vom Kristall geloest und pro Frame zur Kamera gezogen wird, ist die Hauptrune zwar vielleicht sichtbarer, aber nicht mehr im Zentrum des Koerpers.
  crystalRuneMeshes.anchor.parent = root;
  crystalRuneMeshes.anchor.position.copyFrom(centroid);
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
    rootRunePosition: centroid.clone(),
    detailRunePosition: centroid.clone(),
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
    const runeLayout = getTetrahedronRuneLayout(face.vertices, centroid);
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

    // Ziel: Die H2-Runen stabil direkt an ihren Fragmentflaechen verankern.
    // Warum: Fragmentrunen gehoeren auf die nach aussen zeigende Flaeche; ein geloester World-Sync macht daraus nur scheinbar sichtbare Marker statt echte Flaechenrunen.
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

    runeLayout.forEach((runeLayoutItem) => {
      const accentSeed = runeLayoutItem.hasRune
        ? `tetrahedron_${face.name}_${faceIndex + 1}_rune_${runeLayoutItem.runeIndex + 1}`
        : `tetrahedron_${face.name}_${faceIndex + 1}_filler_${runeLayoutItem.cellIndex + 1}`;
      const runeColor = getBodyColorForSelection(selectionId, accentSeed);
      const subcrystal = createTetrahedronRuneSubcrystal(
        scene,
        root,
        `tetrahedron_subcrystal_${faceIndex + 1}_${runeLayoutItem.cellIndex + 1}`,
        runeLayoutItem,
        face.vertices,
        centroid,
        runeColor
      );
      materials.push(...subcrystal.materials);

      if (!runeLayoutItem.hasRune) {
        return;
      }

      const runeSymbol = SUBCRYSTAL_RUNE_SYMBOLS[runeLayoutItem.runeIndex % SUBCRYSTAL_RUNE_SYMBOLS.length];
      const runeMeshes = createRuneMeshes(
        scene,
        `tetrahedron_base_rune_${faceIndex + 1}_${runeLayoutItem.runeIndex + 1}`,
        runeSymbol,
        runeColor,
        {
          showHalo: true,
          glyphSize: runeLayoutItem.runeSize,
          haloScale: 1.52,
          billboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
          emissiveIntensity: 1.45
        }
      );

      runeMeshes.anchor.parent = root;
      runeMeshes.anchor.position.copyFrom(runeLayoutItem.rootRunePosition);
      runeMeshes.anchor.rotationQuaternion = runeLayoutItem.rootRuneRotation.clone();
      runeMeshes.anchor.scaling.setAll(1);
      runeMeshes.glyphMesh.renderingGroupId = 3;

      if (runeMeshes.haloMesh) {
        runeMeshes.haloMesh.renderingGroupId = 3;
      }

      root.metadata?.runeLights?.push(...runeMeshes.lights);
      materials.push(...runeMeshes.materials);
      const runeEntry = {
        entryId: `${fragmentEntry.entryId}_rune_${runeLayoutItem.runeIndex + 1}`,
        level: "h3",
        parentId: fragmentEntry.entryId,
        faceIndex,
        faceName: face.name,
        runeIndex: runeLayoutItem.runeIndex,
        selectionId,
        accentHex: runeColor,
        runeSymbol,
        runeAnchor: runeMeshes.anchor,
        runeAnchorMesh: runeMeshes.anchor,
        runeGlyphMesh: runeMeshes.glyphMesh,
        runeHaloMesh: runeMeshes.haloMesh,
        rootRunePosition: runeLayoutItem.rootRunePosition.clone(),
        detailRunePosition: runeLayoutItem.detailRunePosition.clone(),
        rootRuneRotation: runeLayoutItem.rootRuneRotation.clone(),
        rootRuneScale: H3_ROOT_RUNE_SCALE,
        detailRuneScale: H3_DETAIL_RUNE_SCALE,
        rootBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_NONE,
        detailBillboardMode: BABYLON.AbstractMesh.BILLBOARDMODE_ALL,
        detail: createRuneFragmentDetailData({
          selectionId,
          faceName: face.name,
          faceIndex,
          runeIndex: runeLayoutItem.runeIndex,
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
  // Ziel: Runen als wiederverwendbaren Renderbaustein fuer Root- und Detail-View bereitstellen.
  // Warum: Die Runen muessen je nach Ebene zwischen unauffaelligem Einschluss, dominanter Zentralrune und klar lesbarer Detailansicht umschalten koennen, ohne pro Ebene komplett getrennte Mesh-Pfade zu pflegen.
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

  runeContext.clearRect(0, 0, textureSize, textureSize);
  runeContext.save();
  runeContext.translate(halfTexture, halfTexture);
  runeContext.fillStyle = accentHex;
  runeContext.shadowColor = `${accentHex}ee`;
  runeContext.shadowBlur = shadowBlur;
  runeContext.strokeStyle = "rgba(0, 0, 0, 0.88)";
  runeContext.lineWidth = outlineWidth;
  runeContext.lineJoin = "round";
  runeContext.font = `700 ${fontSize}px 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Arial Unicode MS', 'Times New Roman'`;
  runeContext.textAlign = "center";
  runeContext.textBaseline = "middle";
  runeContext.strokeText(runeSymbol, 0, Math.round(textureSize * 0.03));
  runeContext.fillText(runeSymbol, 0, 8);
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
  glyphMesh.isPickable = false;
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
  const subcrystalFaces = buildTetrahedronSubcrystalFaces(layoutItem);
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

function computePreferredTetrahedronHeightAxis(faces) {
  // Ziel: Eine stabile Hauptachse fuer die H1-Rune aus der Tetraedergeometrie ableiten.
  // Warum: Beim regulaeren Tetraeder sind mehrere Hoehen formal gleichwertig; ueber die praesentierte Startrotation waehlen wir die Achse, die im aktuellen Kristallbild am klarsten als oben-unten gelesen wird.
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

  const candidates = vertices.map((vertex, index) => {
    const oppositeFace = vertices.filter((_, otherIndex) => otherIndex !== index);
    const oppositeCenter = computeFaceCenter(oppositeFace);
    const axisLocal = vertex.subtract(oppositeCenter).normalize();
    const axisWorld = BABYLON.Vector3.TransformNormal(axisLocal, presentationMatrix);

    return {
      axisLocal,
      score: axisWorld.y
    };
  });

  return candidates.sort((left, right) => right.score - left.score)[0]?.axisLocal || BABYLON.Axis.Y.clone();
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

function isTetrahedronExpanded() {
  return state.extraction.stage !== "idle";
}

function createTetrahedronDetailData(entry) {
  const faceLabel = String.fromCharCode(65 + entry.faceIndex);
  const itemLabel = `${faceLabel}${entry.runeIndex + 1}`;

  return {
    runeSymbol: entry.runeSymbol,
    accentHex: entry.accentHex,
    title: `Rune ${itemLabel} ${entry.runeSymbol}`,
    subtitle: `Detail des Subkristalls ${itemLabel}.`
  };
}

function createCrystalDetailData(entry) {
  return {
    accentHex: entry.accentHex,
    title: `Kristall ${entry.selectionId} ${entry.runeSymbol}`,
    subtitle: "H1-Zentralrune des Gesamtkristalls."
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
    title: `Runenfragment ${fragmentLabel}${entry.runeIndex + 1} ${entry.runeSymbol}`,
    subtitle: `H3-Unterteilung von Fragment ${fragmentLabel}.`
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

function computeFragmentFaceRunePosition(vertices, centroid, surfaceLift = 0.032) {
  // Ziel: H2-Runen direkt auf der nach aussen zeigenden Fragmentflaeche verankern.
  // Warum: Die Fragmentrunen sollen als zweite Hierarchieebene klar auf den Aussenflaechen liegen; ein kleiner Lift macht sie sichtbar, ohne dass sie wie abgeloeste Marker weit vor dem Fragment schweben.
  const faceCenter = computeFaceCenter(vertices);
  const outwardNormal = computeOutwardNormal(vertices, faceCenter);
  return faceCenter.add(outwardNormal.scale(surfaceLift));
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

function getTetrahedronRuneLayout(vertices, centroid) {
  const [leftVertex, rightVertex, tipVertex] = vertices;
  const subdivision = 4;
  const positions = [];
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
  let runeIndex = 0;
  let cellIndex = 0;

  for (let row = 0; row < subdivision; row += 1) {
    for (let column = 0; column < subdivision - row; column += 1) {
      const surfaceA = leftVertex.add(u.scale(column)).add(v.scale(row));
      const surfaceB = leftVertex.add(u.scale(column + 1)).add(v.scale(row));
      const surfaceC = leftVertex.add(u.scale(column)).add(v.scale(row + 1));
      const upwardBaseVertices = [surfaceA, surfaceB, surfaceC].map((vertex) => {
        return vertex.add(inwardNormal.scale(inset));
      });
      const upwardAverageEdgeLength = (
        BABYLON.Vector3.Distance(upwardBaseVertices[0], upwardBaseVertices[1])
        + BABYLON.Vector3.Distance(upwardBaseVertices[1], upwardBaseVertices[2])
        + BABYLON.Vector3.Distance(upwardBaseVertices[2], upwardBaseVertices[0])
      ) / 3;
      const upwardSubcrystalFaces = buildTetrahedronSubcrystalFaces({
        baseVertices: upwardBaseVertices,
        apex: centroid
      });
      const upwardDetailRunePosition = computePolyhedronRuneCenter(upwardSubcrystalFaces);
      const upwardRootRunePosition = upwardDetailRunePosition.clone();
      const upwardRootRuneRotation = quaternionFromUnitVectors(
        BABYLON.Axis.Z,
        computeOutwardNormal(vertices)
      );

      positions.push({
        row,
        column,
        cellIndex,
        hasRune: true,
        runeIndex,
        position: upwardDetailRunePosition.clone(),
        runePosition: upwardDetailRunePosition,
        rootRunePosition: upwardRootRunePosition,
        detailRunePosition: upwardDetailRunePosition,
        rootRuneRotation: upwardRootRuneRotation,
        baseVertices: upwardBaseVertices,
        apex: centroid.clone(),
        baseRadius: upwardAverageEdgeLength * 0.34,
        height: BABYLON.Vector3.Distance(computeFaceCenter(upwardBaseVertices), centroid),
        runeSize: Math.max(0.15, upwardAverageEdgeLength * 0.56)
      });
      runeIndex += 1;
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
      const downwardCenter = computePolyhedronRuneCenter(downwardSubcrystalFaces);

      positions.push({
        row,
        column,
        cellIndex,
        hasRune: false,
        runeIndex: null,
        position: downwardCenter.clone(),
        runePosition: downwardCenter,
        baseVertices: downwardBaseVertices,
        apex: centroid.clone(),
        baseRadius: downwardAverageEdgeLength * 0.34,
        height: BABYLON.Vector3.Distance(computeFaceCenter(downwardBaseVertices), centroid),
        runeSize: 0
      });
      cellIndex += 1;
    }
  }

  return positions;
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
  // Warum: Die Rune-Groessen muessen sichtbar zwischen Kristall, Fragment und RunenFragment unterscheiden; direkte Mesh-Skalierung ist hier robuster als nur ueber den Parent-Transform zu gehen.
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

function createDetailCard(item) {
  const card = document.createElement("article");
  const titleTagName = item.level === "h1" ? "h2" : item.level === "h2" ? "h3" : "h4";
  const title = document.createElement(titleTagName);
  const subtitle = document.createElement("p");
  const connectorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

  card.className = `detail-card detail-card-${item.level}`;
  card.style.setProperty("--detail-accent", item.detail.accentHex);
  title.className = "detail-card-title";
  title.textContent = item.detail.title;
  subtitle.className = "detail-card-subtitle";
  subtitle.textContent = item.detail.subtitle;
  card.append(title, subtitle);

  connectorPath.classList.add("detail-connector");
  connectorPath.style.setProperty("--detail-accent", item.detail.accentHex);
  detailLines?.appendChild(connectorPath);

  item.detailCardElement = card;
  item.connectorPathElement = connectorPath;
  setRuneDisplayMode(item, true);
  setRuneHalosEnabled(item, true);

  return card;
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
}

function clearExplodedDetails() {
  state.extraction.items.forEach((item) => {
    setRuneHalosEnabled(item, false);
    setRuneDisplayMode(item, false);
  });

  if (detailCards) {
    detailCards.innerHTML = "";
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
  applyExplodedLayout(true);
  const detailItems = getTetrahedronDetailItems(state.crystalRoot.metadata);

  mountExplodedDetails(detailItems);
  state.extraction.items = detailItems;
  state.extraction.stage = "expanded";
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
  applyExplodedLayout(false);
  refreshRuntimeDiagnostics();
}

function projectWorldPointToStage(worldPoint) {
  if (!state.scene || !state.camera) {
    return null;
  }

  const engine = state.scene.getEngine();
  const canvasRect = renderCanvas.getBoundingClientRect();

  if (!canvasRect.width || !canvasRect.height) {
    return null;
  }

  const viewport = state.camera.viewport.toGlobal(
    engine.getRenderWidth(),
    engine.getRenderHeight()
  );
  const projected = BABYLON.Vector3.Project(
    worldPoint,
    BABYLON.Matrix.Identity(),
    state.scene.getTransformMatrix(),
    viewport
  );

  if (projected.z < 0 || projected.z > 1) {
    return null;
  }

  return {
    x: (projected.x / engine.getRenderWidth()) * canvasRect.width,
    y: (projected.y / engine.getRenderHeight()) * canvasRect.height
  };
}

function syncExplodedDetailLayout() {
  if (!detailCards || !detailLines || !state.extraction.items.length) {
    return;
  }

  const canvasRect = renderCanvas.getBoundingClientRect();

  state.extraction.items.forEach((item) => {
    if (!item.detailCardElement || !item.connectorPathElement || !item.runeAnchorMesh) {
      return;
    }

    const sourcePoint = projectWorldPointToStage(item.runeAnchorMesh.getAbsolutePosition());
    const cardRect = item.detailCardElement.getBoundingClientRect();
    const targetPoint = {
      x: (cardRect.left - canvasRect.left) + 2,
      y: (cardRect.top - canvasRect.top) + (cardRect.height / 2)
    };

    if (!sourcePoint) {
      item.connectorPathElement.setAttribute("d", "");
      return;
    }

    const bend = Math.max(60, (targetPoint.x - sourcePoint.x) * 0.32);
    item.connectorPathElement.setAttribute(
      "d",
      [
        `M ${sourcePoint.x} ${sourcePoint.y}`,
        `C ${sourcePoint.x + bend} ${sourcePoint.y},`,
        `${targetPoint.x - bend} ${targetPoint.y},`,
        `${targetPoint.x} ${targetPoint.y}`
      ].join(" ")
    );
  });
}

function updateExtractionAnimation() {
  return;
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
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
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
    const focusedEntry = pickedMesh
      ? (dragState.pressedFaceEntry || state.faceEntries.find((entry) => entry.mesh === pickedMesh) || null)
      : null;
    const releasedButton = dragState.button;
    dragState.active = false;
    dragState.pointerId = null;
    dragState.button = null;
    dragState.pressedFaceEntry = null;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = "grab";

    if (releasedButton === 2) {
      return;
    }

    if (isTetrahedronExpanded()) {
      if (!dragState.moved && !pickedMesh) {
        collapseTetrahedronIntoGroundView();
      }
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
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = "grab";
  };

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", cancelDrag);
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
