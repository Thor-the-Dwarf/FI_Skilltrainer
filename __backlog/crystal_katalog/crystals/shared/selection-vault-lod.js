import { supportsVaultProxyLod } from "../registry.js";
import { resolveSelectionModuleVaultLodConfig } from "../selection-module-registry.js";
import { normalizeVaultLodConfig } from "./vault-lod.js";

export function supportsVaultCloseByDetail(selectionId) {
  return supportsVaultProxyLod(selectionId);
}

export function getSelectionVaultLodConfig(selectionId) {
  return normalizeVaultLodConfig(resolveSelectionModuleVaultLodConfig(selectionId) || {});
}
