import { getSelection01DetailItems, getSelection01VaultLodConfig } from "./selection-01.js";
import { getSelection02DetailItems, getSelection02VaultLodConfig } from "./selection-02.js";
import { getSelection03DetailItems, getSelection03VaultLodConfig } from "./selection-03.js";
import { getSelection04DetailItems, getSelection04VaultLodConfig } from "./selection-04.js";
import { getSelection05DetailItems, getSelection05VaultLodConfig } from "./selection-05.js";
import { getSelection06DetailItems, getSelection06VaultLodConfig } from "./selection-06.js";
import { getSelection07DetailItems, getSelection07VaultLodConfig } from "./selection-07.js";
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
  [1, { detailItems: getSelection01DetailItems, vaultLodConfig: getSelection01VaultLodConfig, interiorKind: "spherical" }],
  [2, { detailItems: getSelection02DetailItems, vaultLodConfig: getSelection02VaultLodConfig, interiorKind: "cell-cluster" }],
  [3, { detailItems: getSelection03DetailItems, vaultLodConfig: getSelection03VaultLodConfig, interiorKind: "cell-cluster" }],
  [4, { detailItems: getSelection04DetailItems, vaultLodConfig: getSelection04VaultLodConfig, interiorKind: "tetrahedron", diagnosticLabel: "Form 4", requiresHierarchyDiagnostics: true, pauseDetachedAnchorSyncWhileExpanded: true }],
  [5, { detailItems: getSelection05DetailItems, vaultLodConfig: getSelection05VaultLodConfig, interiorKind: "pyramid" }],
  [6, { detailItems: getSelection06DetailItems, vaultLodConfig: getSelection06VaultLodConfig, interiorKind: "prism" }],
  [7, { detailItems: getSelection07DetailItems, vaultLodConfig: getSelection07VaultLodConfig, interiorKind: "prism-cap" }],
  [8, { detailItems: getSelection08DetailItems, vaultLodConfig: getSelection08VaultLodConfig, interiorKind: "bipyramid" }],
  [9, { detailItems: getSelection09DetailItems, vaultLodConfig: getSelection09VaultLodConfig, interiorKind: "corner-cut-bipyramidal" }],
  [10, { detailItems: getSelection10DetailItems, vaultLodConfig: getSelection10VaultLodConfig, interiorKind: "bipyramidal" }],
  [11, { detailItems: getSelection11DetailItems, vaultLodConfig: getSelection11VaultLodConfig, interiorKind: "corner-cut-bipyramidal" }],
  [12, { detailItems: getSelection12DetailItems, vaultLodConfig: getSelection12VaultLodConfig, interiorKind: "dodecahedral" }],
  [13, { detailItems: getSelection13DetailItems, vaultLodConfig: getSelection13VaultLodConfig, interiorKind: "corner-cut-bipyramidal" }],
  [14, { detailItems: getSelection14DetailItems, vaultLodConfig: getSelection14VaultLodConfig, interiorKind: "bipyramidal" }],
  [15, { detailItems: getSelection15DetailItems, vaultLodConfig: getSelection15VaultLodConfig, interiorKind: "corner-cut-bipyramidal" }],
  [16, { detailItems: getSelection16DetailItems, vaultLodConfig: getSelection16VaultLodConfig, interiorKind: "bipyramidal" }],
  [17, { detailItems: getSelection17DetailItems, vaultLodConfig: getSelection17VaultLodConfig, interiorKind: "corner-cut-bipyramidal" }],
  [18, { detailItems: getSelection18DetailItems, vaultLodConfig: getSelection18VaultLodConfig, interiorKind: "bipyramidal" }],
  [19, { detailItems: getSelection19DetailItems, vaultLodConfig: getSelection19VaultLodConfig, interiorKind: "corner-cut-bipyramidal" }],
  [20, { detailItems: getSelection20DetailItems, vaultLodConfig: getSelection20VaultLodConfig, interiorKind: "icosahedral" }]
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
