import { createSelectionModule } from "./shared/selection-module-factory.js";

const moduleApi = createSelectionModule({
  selectionId: 11,
  familyLabel: "corner-cut-bipyramidal",
  fragmentRuneCountResolver: (faceEntry, faceIndex) => ((faceIndex ?? 0) % 2 === 0 ? 1 : 2),
  vaultLodConfig: {
    enterDistance: 10.9,
    exitDistance: 12.1
  }
});

export const getSelection11DetailItems = moduleApi.getDetailItems;
export const getSelection11VaultLodConfig = moduleApi.getVaultLodConfig;
