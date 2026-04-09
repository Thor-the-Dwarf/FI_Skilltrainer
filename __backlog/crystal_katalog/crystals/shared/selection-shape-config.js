const SURFACE_BALANCE_CLASS = Object.freeze({
  STRICT_EQUAL_AREA: "strict-equal-area",
  SUBJECTIVE_BALANCED: "subjective-balanced"
});

const STRICT_EQUAL_AREA_SELECTIONS = new Set([4, 6, 8, 10, 12, 14, 16, 18, 20]);

export const DEFAULT_CUBE_EDGE = 1.85;
export const DEFAULT_CUBE_RADIUS = DEFAULT_CUBE_EDGE / Math.SQRT2;

export function getShapeConfigForSelection(id) {
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

function getAugmentedPrismEdge(sides) {
  return Math.max(0.82, 1.18 - ((sides - 3) * 0.07));
}

function getGrownCrystalEdge(sides) {
  return Math.max(0.58, 0.82 - ((sides - 4) * 0.035));
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
