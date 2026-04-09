const DEFAULT_SELECTION_DEFINITION = Object.freeze({
  shapeFamily: "generic",
  rolloutState: "partial",
  supportsDetailShell: true,
  supportsPresenterShell: true,
  supportsFullHierarchy: false,
  supportsVaultLod: false,
  placeholderFragmentCount: 1
});

function createSelectionDefinition(selectionId, overrides = {}) {
  const normalizedSelectionId = Math.max(1, Math.round(Number(selectionId) || 1));

  return {
    placeholderFragmentCount: normalizedSelectionId,
    ...overrides
  };
}

const SELECTION_DEFINITIONS = new Map([
  [1, createSelectionDefinition(1, { shapeFamily: "cell-cluster", rolloutState: "partial" })],
  [2, createSelectionDefinition(2, { shapeFamily: "cell-cluster", rolloutState: "partial" })],
  [3, createSelectionDefinition(3, { shapeFamily: "cell-cluster", rolloutState: "partial" })],
  [
    4,
    createSelectionDefinition(4, {
      shapeFamily: "tetrahedral",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [
    5,
    createSelectionDefinition(5, {
      shapeFamily: "pyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [
    6,
    createSelectionDefinition(6, {
      shapeFamily: "prismatic",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [7, createSelectionDefinition(7, { shapeFamily: "prism-cap", rolloutState: "partial" })],
  [
    8,
    createSelectionDefinition(8, {
      shapeFamily: "bipyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [9, createSelectionDefinition(9, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" })],
  [
    10,
    createSelectionDefinition(10, {
      shapeFamily: "bipyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [
    11,
    createSelectionDefinition(11, {
      shapeFamily: "corner-cut-bipyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [12, createSelectionDefinition(12, { shapeFamily: "dodecahedral", rolloutState: "partial" })],
  [13, createSelectionDefinition(13, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" })],
  [
    14,
    createSelectionDefinition(14, {
      shapeFamily: "bipyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [15, createSelectionDefinition(15, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" })],
  [
    16,
    createSelectionDefinition(16, {
      shapeFamily: "bipyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [17, createSelectionDefinition(17, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" })],
  [
    18,
    createSelectionDefinition(18, {
      shapeFamily: "bipyramidal",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ],
  [19, createSelectionDefinition(19, { shapeFamily: "corner-cut-bipyramidal", rolloutState: "partial" })],
  [
    20,
    createSelectionDefinition(20, {
      shapeFamily: "icosahedral",
      rolloutState: "full",
      supportsFullHierarchy: true,
      supportsVaultLod: true
    })
  ]
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

export function usesPlaceholderDetailShell(selectionId) {
  const selectionDefinition = getCrystalSelectionDefinition(selectionId);
  return selectionDefinition.supportsDetailShell && !selectionDefinition.supportsFullHierarchy;
}

export function getSelectionPlaceholderDetailProfile(selectionId) {
  const selectionDefinition = getCrystalSelectionDefinition(selectionId);

  return Object.freeze({
    selectionId: Number(selectionId),
    familyLabel: selectionDefinition.shapeFamily,
    rolloutState: selectionDefinition.rolloutState,
    fragmentCount: Math.max(1, Math.round(selectionDefinition.placeholderFragmentCount || 1))
  });
}
