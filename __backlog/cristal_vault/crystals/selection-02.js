import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 2,
  familyLabel: "cell-cluster",
  fragmentRuneCountResolver: () => 1,
  vaultLodConfig: {
    enterDistance: 9.6,
    exitDistance: 10.8
  }
});

export const getSelection02DetailItems = moduleApi.getDetailItems;
export const getSelection02VaultLodConfig = moduleApi.getVaultLodConfig;
