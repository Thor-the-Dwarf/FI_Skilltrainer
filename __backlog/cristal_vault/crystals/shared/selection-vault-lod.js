import { supportsVaultProxyLod } from "../registry.js";
import { normalizeVaultLodConfig } from "./vault-lod.js";

export function supportsVaultCloseByDetail(selectionId) {
  return supportsVaultProxyLod(selectionId);
}

export function getSelectionVaultLodConfig(selectionId, config = {}) {
  return normalizeVaultLodConfig(config, { enterDistance: 8, exitDistance: 10 });
}
