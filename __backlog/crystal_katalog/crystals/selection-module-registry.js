import { getSelection03DetailItems, getSelection03VaultLodConfig } from "./selection-03.js";
import { getSelection04DetailItems, getSelection04VaultLodConfig } from "./selection-04.js";
import { getSelection05DetailItems, getSelection05VaultLodConfig } from "./selection-05.js";
import { getSelection06DetailItems, getSelection06VaultLodConfig } from "./selection-06.js";
import { getSelection08DetailItems, getSelection08VaultLodConfig } from "./selection-08.js";
import { getSelection09DetailItems, getSelection09VaultLodConfig } from "./selection-09.js";
import { getSelection10DetailItems, getSelection10VaultLodConfig } from "./selection-10.js";
import { getSelection11DetailItems, getSelection11VaultLodConfig } from "./selection-11.js";
import { getSelection12DetailItems, getSelection12VaultLodConfig } from "./selection-12.js";
import { getSelection13DetailItems, getSelection13VaultLodConfig } from "./selection-13.js";
import { getSelection14DetailItems, getSelection14VaultLodConfig } from "./selection-14.js";
import { getSelection15DetailItems, getSelection15VaultLodConfig } from "./selection-15.js";
import { getSelection16DetailItems, getSelection16VaultLodConfig } from "./selection-16.js";
import { getSelection17DetailItems, getSelection17VaultLodConfig } from "./selection-17.js";
import { getSelection18DetailItems, getSelection18VaultLodConfig } from "./selection-18.js";
import { getSelection19DetailItems, getSelection19VaultLodConfig } from "./selection-19.js";
import { getSelection20DetailItems, getSelection20VaultLodConfig } from "./selection-20.js";

const SELECTION_MODULES = new Map([
  [
    3,
    {
      detailItems: (selectionContext) => getSelection03DetailItems(selectionContext),
      vaultLodConfig: () => getSelection03VaultLodConfig(),
      interiorKind: "cylinder"
    }
  ],
  [
    4,
    {
      detailItems: ({ metadata }) => getSelection04DetailItems(metadata),
      vaultLodConfig: () => getSelection04VaultLodConfig(),
      interiorKind: "tetrahedron",
      diagnosticLabel: "Form 4",
      requiresHierarchyDiagnostics: true,
      pauseDetachedAnchorSyncWhileExpanded: true
    }
  ],
  [
    5,
    {
      detailItems: (selectionContext) => getSelection05DetailItems(selectionContext),
      vaultLodConfig: () => getSelection05VaultLodConfig(),
      interiorKind: "pyramid"
    }
  ],
  [
    6,
    {
      detailItems: (selectionContext) => getSelection06DetailItems(selectionContext),
      vaultLodConfig: () => getSelection06VaultLodConfig(),
      interiorKind: "prism"
    }
  ],
  [
    8,
    {
      detailItems: (selectionContext) => getSelection08DetailItems(selectionContext),
      vaultLodConfig: () => getSelection08VaultLodConfig(),
      interiorKind: "bipyramid"
    }
  ],
  [
    9,
    {
      detailItems: (selectionContext) => getSelection09DetailItems(selectionContext),
      vaultLodConfig: () => getSelection09VaultLodConfig(),
      interiorKind: "corner-cut-bipyramid"
    }
  ],
  [
    10,
    {
      detailItems: (selectionContext) => getSelection10DetailItems(selectionContext),
      vaultLodConfig: () => getSelection10VaultLodConfig(),
      interiorKind: "bipyramid"
    }
  ],
  [
    11,
    {
      detailItems: (selectionContext) => getSelection11DetailItems(selectionContext),
      vaultLodConfig: () => getSelection11VaultLodConfig(),
      interiorKind: "corner-cut-bipyramid"
    }
  ],
  [
    12,
    {
      detailItems: (selectionContext) => getSelection12DetailItems(selectionContext),
      vaultLodConfig: () => getSelection12VaultLodConfig(),
      interiorKind: "dodecahedron"
    }
  ],
  [
    13,
    {
      detailItems: (selectionContext) => getSelection13DetailItems(selectionContext),
      vaultLodConfig: () => getSelection13VaultLodConfig(),
      interiorKind: "corner-cut-bipyramid"
    }
  ],
  [
    14,
    {
      detailItems: (selectionContext) => getSelection14DetailItems(selectionContext),
      vaultLodConfig: () => getSelection14VaultLodConfig(),
      interiorKind: "bipyramid"
    }
  ],
  [
    15,
    {
      detailItems: (selectionContext) => getSelection15DetailItems(selectionContext),
      vaultLodConfig: () => getSelection15VaultLodConfig(),
      interiorKind: "corner-cut-bipyramid"
    }
  ],
  [
    16,
    {
      detailItems: (selectionContext) => getSelection16DetailItems(selectionContext),
      vaultLodConfig: () => getSelection16VaultLodConfig(),
      interiorKind: "bipyramid"
    }
  ],
  [
    17,
    {
      detailItems: (selectionContext) => getSelection17DetailItems(selectionContext),
      vaultLodConfig: () => getSelection17VaultLodConfig(),
      interiorKind: "corner-cut-bipyramid"
    }
  ],
  [
    18,
    {
      detailItems: (selectionContext) => getSelection18DetailItems(selectionContext),
      vaultLodConfig: () => getSelection18VaultLodConfig(),
      interiorKind: "bipyramid"
    }
  ],
  [
    19,
    {
      detailItems: (selectionContext) => getSelection19DetailItems(selectionContext),
      vaultLodConfig: () => getSelection19VaultLodConfig(),
      interiorKind: "corner-cut-bipyramid"
    }
  ],
  [
    20,
    {
      detailItems: (selectionContext) => getSelection20DetailItems(selectionContext),
      vaultLodConfig: () => getSelection20VaultLodConfig(),
      interiorKind: "icosahedron"
    }
  ]
]);

export function getSelectionModule(selectionId) {
  return SELECTION_MODULES.get(Number(selectionId)) || null;
}

export function resolveSelectionModuleDetailItems(selectionId, selectionContext) {
  const selectionModule = getSelectionModule(selectionId);
  return selectionModule?.detailItems ? selectionModule.detailItems(selectionContext) : null;
}

export function resolveSelectionModuleVaultLodConfig(selectionId) {
  const selectionModule = getSelectionModule(selectionId);
  return selectionModule?.vaultLodConfig ? selectionModule.vaultLodConfig() : null;
}

export function resolveSelectionInteriorKind(selectionId) {
  const selectionModule = getSelectionModule(selectionId);
  return selectionModule?.interiorKind || null;
}

export function resolveSelectionDiagnosticLabel(selectionId) {
  const selectionModule = getSelectionModule(selectionId);
  return selectionModule?.diagnosticLabel || `Selection ${selectionId}`;
}

export function requiresSelectionHierarchyDiagnostics(selectionId) {
  const selectionModule = getSelectionModule(selectionId);
  return Boolean(selectionModule?.requiresHierarchyDiagnostics);
}

export function shouldPauseDetachedAnchorSync(selectionId, extractionStage) {
  const selectionModule = getSelectionModule(selectionId);
  return Boolean(
    selectionModule?.pauseDetachedAnchorSyncWhileExpanded
    && extractionStage === "expanded"
  );
}
