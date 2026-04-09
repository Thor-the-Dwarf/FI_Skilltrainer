import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 20,
  familyLabel: "icosahedral",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => ((faceIndex ?? 0) % 3 === 0 ? 1 : 2),
  vaultLodConfig: {
    enterDistance: 11.4,
    exitDistance: 12.7
  }
});

export const getSelection20DetailItems = moduleApi.getDetailItems;
export const getSelection20VaultLodConfig = moduleApi.getVaultLodConfig;
