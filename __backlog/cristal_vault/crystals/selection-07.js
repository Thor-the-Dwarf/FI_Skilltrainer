import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 7,
  familyLabel: "prism-cap",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => ((faceIndex ?? 0) === 0 ? 1 : 2),
  vaultLodConfig: {
    enterDistance: 10.3,
    exitDistance: 11.5
  }
});

export const getSelection07DetailItems = moduleApi.getDetailItems;
export const getSelection07VaultLodConfig = moduleApi.getVaultLodConfig;
