import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 1,
  familyLabel: "spherical",
  fragmentRuneCountResolver: () => 1,
  vaultLodConfig: {
    enterDistance: 9.4,
    exitDistance: 10.6
  }
});

export const getSelection01DetailItems = moduleApi.getDetailItems;
export const getSelection01VaultLodConfig = moduleApi.getVaultLodConfig;
