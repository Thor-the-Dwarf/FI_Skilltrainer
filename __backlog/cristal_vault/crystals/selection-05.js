import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 5,
  familyLabel: "pyramidal",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => Math.max(1, (faceIndex ?? 0) + 1),
  vaultLodConfig: {
    enterDistance: 10.2,
    exitDistance: 11.4
  }
});

export const getSelection05DetailItems = moduleApi.getDetailItems;
export const getSelection05VaultLodConfig = moduleApi.getVaultLodConfig;
