const catalogItems = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  title: String(index + 1),
  mark: "Slot"
}));

const surfacePrototypeItems = [
  { id: 21, title: "GF Kreis", mark: "Proto" },
  { id: 22, title: "GF Dreieck", mark: "Proto" },
  { id: 23, title: "GF Quadrat", mark: "Proto" },
  { id: 24, title: "GF Viereck", mark: "Proto" },
  { id: 25, title: "GF Fuenfeck", mark: "Proto" },
  { id: 26, title: "GF Sechseck", mark: "Proto" },
  { id: 27, title: "GF Siebeneck", mark: "Proto" },
  { id: 28, title: "GF Achteck", mark: "Proto" },
  { id: 29, title: "GF Neuneck", mark: "Proto" }
];

const items = [...catalogItems, ...surfacePrototypeItems];
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
const prototypeSelect = document.getElementById("prototypeSelect");
const selectionPill = document.getElementById("selectionPill");
const enginePill = document.getElementById("enginePill");
const renderCanvas = document.getElementById("renderCanvas");

const state = {
  selectedId: 1,
  buttons: [],
  selectionColors: new Map(),
  scene: null,
  camera: null,
  shadowGenerator: null,
  crystalRoot: null,
  focusedFaceEntry: null,
  materials: [],
  faceEntries: [],
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
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
    pressedFaceEntry: null
  }
};

renderList();
renderQuickSelects();
updateSelection(1);
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
  populateSelect(prototypeSelect, "Grundform springen", surfacePrototypeItems);

  catalogSelect.addEventListener("change", () => {
    const selectedValue = Number(catalogSelect.value);

    if (!Number.isNaN(selectedValue) && selectedValue > 0) {
      updateSelection(selectedValue);
    }
  });

  prototypeSelect.addEventListener("change", () => {
    const selectedValue = Number(prototypeSelect.value);

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
}

function syncQuickSelects(id) {
  const isCatalogSelection = catalogItems.some((item) => item.id === id);
  const isPrototypeSelection = surfacePrototypeItems.some((item) => item.id === id);

  if (catalogSelect) {
    catalogSelect.value = isCatalogSelection ? String(id) : "";
  }

  if (prototypeSelect) {
    prototypeSelect.value = isPrototypeSelection ? String(id) : "";
  }
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
  enableBoxDragging(camera, renderCanvas);

  engine.runRenderLoop(() => {
    updateSnapAnimation();
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
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
    state.camera.radius = shapeConfig.kind === "surface-prototype" ? 6.9 : 6.1;
  }

  state.crystalRoot = crystal.root;
  state.materials = crystal.materials;
  state.faceEntries = crystal.faceEntries;
}

function getInitialQuaternionForShape(shapeConfig, crystal) {
  if (shapeConfig.kind === "surface-prototype" && crystal.faceEntries.length > 0 && state.camera) {
    const localNormal = crystal.faceEntries[0].localNormal || new BABYLON.Vector3(0, 0, 1);
    const desiredDirection = state.camera.globalPosition.subtract(BABYLON.Vector3.Zero()).normalize();
    return quaternionFromUnitVectors(localNormal, desiredDirection);
  }

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
  clearFocusedFace();
  state.materials.forEach((material) => material.dispose());
  state.materials = [];
  state.faceEntries = [];

  if (state.crystalRoot) {
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
    case 21:
      shapeConfig = getSurfacePrototypeConfig("disc");
      break;
    case 22:
      shapeConfig = getSurfacePrototypeConfig("triangle");
      break;
    case 23:
      shapeConfig = getSurfacePrototypeConfig("square");
      break;
    case 24:
      shapeConfig = getSurfacePrototypeConfig("quad");
      break;
    case 25:
      shapeConfig = getSurfacePrototypeConfig("pentagon");
      break;
    case 26:
      shapeConfig = getSurfacePrototypeConfig("hexagon");
      break;
    case 27:
      shapeConfig = getSurfacePrototypeConfig("heptagon");
      break;
    case 28:
      shapeConfig = getSurfacePrototypeConfig("octagon");
      break;
    case 29:
      shapeConfig = getSurfacePrototypeConfig("nonagon");
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

function getSurfacePrototypeConfig(surfaceType) {
  const prototypeRadius = 1.46;

  switch (surfaceType) {
    case "disc":
      return {
        kind: "surface-prototype",
        surfaceType,
        radius: prototypeRadius,
        tessellation: 72
      };
    case "triangle":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(3, prototypeRadius, -Math.PI / 2)
      };
    case "square":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(4, prototypeRadius, Math.PI / 4)
      };
    case "quad":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: centerVertices([
          new BABYLON.Vector3(-1.52, -0.86, 0),
          new BABYLON.Vector3(1.28, -1.04, 0),
          new BABYLON.Vector3(1.48, 0.78, 0),
          new BABYLON.Vector3(-1.14, 1.12, 0)
        ])
      };
    case "pentagon":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(5, prototypeRadius, -Math.PI / 2)
      };
    case "hexagon":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(6, prototypeRadius, -Math.PI / 2)
      };
    case "heptagon":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(7, prototypeRadius, -Math.PI / 2)
      };
    case "octagon":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(8, prototypeRadius, Math.PI / 8)
      };
    case "nonagon":
      return {
        kind: "surface-prototype",
        surfaceType,
        vertices: buildPrototypePolygonVertices(9, prototypeRadius, -Math.PI / 2)
      };
    default:
      return {
        kind: "surface-prototype",
        surfaceType: "square",
        vertices: buildPrototypePolygonVertices(4, prototypeRadius, Math.PI / 4)
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
    case "surface-prototype":
      return createSurfacePrototype(scene, shapeConfig, selectionId);
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

function createSurfacePrototype(scene, shapeConfig, selectionId) {
  const root = new BABYLON.TransformNode(`vault_${shapeConfig.kind}_${shapeConfig.surfaceType}_root`, scene);
  root.rotationQuaternion = BABYLON.Quaternion.Identity();
  const materials = [];
  const faceEntries = [];
  const identity = createFaceIdentity(selectionId, shapeConfig.kind, shapeConfig.surfaceType, 0);
  const faceColor = getBodyColorForSelection(selectionId, `${shapeConfig.kind}_${shapeConfig.surfaceType}`);
  const material = createFaceMaterial(scene, identity.faceId, faceColor, 0.8);
  let mesh;
  let localNormal;

  if (shapeConfig.surfaceType === "disc") {
    mesh = BABYLON.MeshBuilder.CreateDisc(identity.faceId, {
      radius: shapeConfig.radius,
      tessellation: shapeConfig.tessellation || 72
    }, scene);
    localNormal = new BABYLON.Vector3(0, 0, 1);
  } else {
    const faceMesh = createFaceMesh(scene, identity.faceId, shapeConfig.vertices, material);
    mesh = faceMesh.mesh;
    localNormal = faceMesh.localNormal;
  }

  mesh.parent = root;
  mesh.material = material;
  mesh.isPickable = true;
  mesh.receiveShadows = true;
  applyFaceIdentity(mesh, identity);
  state.shadowGenerator?.addShadowCaster(mesh);

  materials.push(material);
  faceEntries.push({
    ...identity,
    mesh,
    material,
    localNormal,
    snapEligible: true
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
  const materials = [];
  const faceEntries = [];

  faces.forEach((face, index) => {
    const identity = createFaceIdentity(selectionId, shapeName, face.name, index);
    const faceColor = getBodyColorForSelection(selectionId, `${shapeName}_${face.name}_${index + 1}`);
    const material = createFaceMaterial(scene, identity.faceId, faceColor, face.alpha);
    const faceMesh = createFaceMesh(scene, identity.faceId, face.vertices, material);
    const mesh = faceMesh.mesh;
    mesh.parent = root;
    mesh.isPickable = true;
    mesh.receiveShadows = true;
    applyFaceIdentity(mesh, identity);
    state.shadowGenerator?.addShadowCaster(mesh);
    materials.push(material);
    faceEntries.push({
      ...identity,
      mesh,
      material,
      localNormal: faceMesh.localNormal,
      snapEligible: face.snapEligible !== false
    });
  });

  return { root, materials, faceEntries };
}

function createFaceMaterial(scene, name, colorHex, alpha = 0.8) {
  const material = new BABYLON.StandardMaterial(`vaultMaterial_${name}`, scene);
  const color = BABYLON.Color3.FromHexString(colorHex);
  applyColorToMaterial(material, colorHex);
  material.specularColor = color.scale(0.18).add(new BABYLON.Color3(0.05, 0.05, 0.05));
  material.specularPower = 34;
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
  material.ambientColor = color.scale(0.34);
  material.emissiveColor = color.scale(0.06);
  material.specularColor = color.scale(0.16).add(new BABYLON.Color3(0.05, 0.05, 0.05));
  material.specularPower = 30;
  material.alpha = 0.8;
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

function buildPrototypePolygonVertices(sides, radius, rotationOffset = 0) {
  return centerVertices(
    Array.from({ length: sides }, (_, index) => {
      const angle = rotationOffset + ((index / sides) * Math.PI * 2);
      return new BABYLON.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
    })
  );
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

function centerVertices(vertices) {
  const center = computeFaceCenter(vertices);
  return vertices.map((vertex) => vertex.clone().subtract(center));
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

function getFaceEntryFromPointerEvent(scene, canvas, event) {
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

  if (!pickResult?.hit || !pickResult.pickedMesh) {
    return null;
  }

  return state.faceEntries.find((entry) => entry.mesh === pickResult.pickedMesh) || null;
}

function enableBoxDragging(camera, canvas) {
  const dragState = state.drag;
  const dragSensitivity = 0.0035;
  const clickThresholdPx = 8;

  canvas.style.cursor = "grab";

  canvas.addEventListener("pointerdown", (event) => {
    stopSnapAnimation();
    dragState.active = true;
    dragState.pointerId = event.pointerId;
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

    const yawAxis = camera.getDirection(BABYLON.Axis.Y).normalize();
    const pitchAxis = camera.getDirection(BABYLON.Axis.X).normalize();
    const yawRotation = BABYLON.Quaternion.RotationAxis(yawAxis, -deltaX * dragSensitivity);
    const pitchRotation = BABYLON.Quaternion.RotationAxis(pitchAxis, -deltaY * dragSensitivity);
    const currentRotation = state.crystalRoot.rotationQuaternion || BABYLON.Quaternion.Identity();
    const nextRotation = yawRotation.multiply(pitchRotation).multiply(currentRotation);

    nextRotation.normalize();
    state.crystalRoot.rotationQuaternion = nextRotation;

    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
  });

  const endDrag = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    const focusedEntry = !dragState.moved
      ? (dragState.pressedFaceEntry || getFaceEntryFromPointerEvent(state.scene, canvas, event))
      : null;
    dragState.active = false;
    dragState.pointerId = null;
    dragState.pressedFaceEntry = null;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = "grab";

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
    dragState.pressedFaceEntry = null;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = "grab";
  };

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", cancelDrag);
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
