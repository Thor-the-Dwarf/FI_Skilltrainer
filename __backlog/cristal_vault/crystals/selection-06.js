import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 6,
  familyLabel: "prismatic",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => ((faceIndex ?? 0) < 2 ? 1 : 2),
  vaultLodConfig: {
    enterDistance: 10.4,
    exitDistance: 11.5
  }
});

export const getSelection06DetailItems = moduleApi.getDetailItems;
export const getSelection06VaultLodConfig = moduleApi.getVaultLodConfig;
