import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 8,
  familyLabel: "bipyramidal",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => ((faceIndex ?? 0) % 2 === 0 ? 1 : 2),
  vaultLodConfig: {
    enterDistance: 10.6,
    exitDistance: 11.8
  }
});

export const getSelection08DetailItems = moduleApi.getDetailItems;
export const getSelection08VaultLodConfig = moduleApi.getVaultLodConfig;
