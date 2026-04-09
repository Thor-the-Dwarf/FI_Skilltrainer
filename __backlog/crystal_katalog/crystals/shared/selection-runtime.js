export {
  canOpenSelectionDetailShell,
  canOpenSelectionPresenterView
} from "./selection-entry-capabilities.js";

export {
  DEFAULT_H3_RUNES_PER_FRAGMENT,
  normalizeFragmentRuneCount,
  resolveConfiguredDetailFragmentRuneCount,
  resolveConfiguredFragmentRuneCount
} from "./fragment-runes.js";

export { resolveSelectionDetailItemsForRuntime } from "./selection-detail-items.js";

export {
  DEFAULT_CUBE_EDGE,
  DEFAULT_CUBE_RADIUS,
  getShapeConfigForSelection
} from "./selection-shape-config.js";

export {
  getSelectionVaultLodConfig,
  supportsVaultCloseByDetail
} from "./selection-vault-lod.js";

export {
  requiresSelectionHierarchyDiagnostics,
  resolveSelectionDiagnosticLabel,
  resolveSelectionInteriorKind,
  shouldPauseDetachedAnchorSync
} from "../selection-module-registry.js";
