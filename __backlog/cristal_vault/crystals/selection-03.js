import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 3,
  familyLabel: "cell-cluster",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => (faceIndex === 0 ? 2 : 1),
  vaultLodConfig: {
    enterDistance: 9.8,
    exitDistance: 11
  }
});

export const getSelection03DetailItems = moduleApi.getDetailItems;
export const getSelection03VaultLodConfig = moduleApi.getVaultLodConfig;
