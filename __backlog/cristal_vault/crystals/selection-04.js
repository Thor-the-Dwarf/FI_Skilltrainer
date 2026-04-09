import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 4,
  familyLabel: "tetrahedral",
  fragmentRuneCountResolver: () => 1,
  vaultLodConfig: {
    enterDistance: 10.8,
    exitDistance: 11.9
  }
});

export const getSelection04DetailItems = moduleApi.getDetailItems;
export const getSelection04VaultLodConfig = moduleApi.getVaultLodConfig;
