import { supportsVaultProxyLod } from "../registry.js";
import { getSelection04VaultLodConfig } from "../selection-04.js";
import { getSelection05VaultLodConfig } from "../selection-05.js";
import { normalizeVaultLodConfig } from "./vault-lod.js";

export function supportsVaultCloseByDetail(selectionId) {
  return supportsVaultProxyLod(selectionId);
}

export function getSelectionVaultLodConfig(selectionId) {
  return normalizeVaultLodConfig(
    selectionId === 4
      ? getSelection04VaultLodConfig()
      : selectionId === 5
        ? getSelection05VaultLodConfig()
        : {}
  );
}
