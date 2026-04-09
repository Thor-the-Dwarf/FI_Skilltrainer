import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 12,
  familyLabel: "dodecahedral",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => ((faceIndex ?? 0) % 2 === 0 ? 1 : 2),
  vaultLodConfig: {
    enterDistance: 11.1,
    exitDistance: 12.3
  }
});

export const getSelection12DetailItems = moduleApi.getDetailItems;
export const getSelection12VaultLodConfig = moduleApi.getVaultLodConfig;
