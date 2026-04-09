const DEFAULT_SELECTION_DEFINITION = Object.freeze({
  shapeFamily: "generic",
  rolloutState: "partial",
  supportsDetailShell: true,
  supportsPresenterShell: true,
  supportsFullHierarchy: false,
  supportsVaultLod: false
});

const SELECTION_DEFINITIONS = new Map([
  [1, { shapeFamily: "cell-cluster", rolloutState: "partial" }],
  [2, { shapeFamily: "cell-cluster", rolloutState: "partial" }],
  [3, { shapeFamily: "cell-cluster", rolloutState: "partial" }],
  [
    4,
    {
      shapeFamily: "tetrahedral",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    }
  ],
  [5, { shapeFamily: "pyramidal", rolloutState: "partial" }],
  [6, { shapeFamily: "prismatic", rolloutState: "partial" }],
  [7, { shapeFamily: "prism-cap", rolloutState: "partial" }],
  [8, { shapeFamily: "bipyramidal", rolloutState: "partial" }],
  [9, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" }],
  [10, { shapeFamily: "bipyramidal", rolloutState: "partial" }],
  [11, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" }],
  [12, { shapeFamily: "dodecahedral", rolloutState: "partial" }],
  [13, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" }],
  [14, { shapeFamily: "bipyramidal", rolloutState: "partial" }],
  [15, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" }],
  [16, { shapeFamily: "bipyramidal", rolloutState: "partial" }],
  [17, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" }],
  [18, { shapeFamily: "bipyramidal", rolloutState: "partial" }],
  [19, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" }],
  [20, { shapeFamily: "icosahedral", rolloutState: "partial" }]
]);

export function getCrystalSelectionDefinition(selectionId) {
  const normalizedSelectionId = Number(selectionId);
  const override = SELECTION_DEFINITIONS.get(normalizedSelectionId);
  return Object.freeze({
    ...DEFAULT_SELECTION_DEFINITION,
    ...(override || {})
  });
}

export function canOpenDetailShell(selectionId) {
  return getCrystalSelectionDefinition(selectionId).supportsDetailShell;
}

export function canOpenPresenterShell(selectionId) {
  return getCrystalSelectionDefinition(selectionId).supportsPresenterShell;
}

export function supportsFullHierarchy(selectionId) {
  return getCrystalSelectionDefinition(selectionId).supportsFullHierarchy;
}

export function supportsVaultProxyLod(selectionId) {
  return getCrystalSelectionDefinition(selectionId).supportsVaultLod;
}
