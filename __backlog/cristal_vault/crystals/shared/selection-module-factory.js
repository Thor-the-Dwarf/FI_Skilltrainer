import { getSelectionPlaceholderDetailProfile } from "../registry.js";
import { buildSelectionPlaceholderDetailItems } from "./placeholder-shell.js";

function flattenSelectionHierarchyItems(metadata = {}) {
  const crystalEntry = metadata?.crystalRuneEntry ? [metadata.crystalRuneEntry] : [];
  const fragmentEntries = (metadata?.fragmentEntries || [])
    .slice()
    .sort((left, right) => (left.faceIndex ?? 0) - (right.faceIndex ?? 0));
  const fractalEntries = (metadata?.runeFragmentEntries || [])
    .slice()
    .sort((left, right) => {
      if ((left.faceIndex ?? 0) !== (right.faceIndex ?? 0)) {
        return (left.faceIndex ?? 0) - (right.faceIndex ?? 0);
      }

      return (left.runeIndex ?? 0) - (right.runeIndex ?? 0);
    });

  return [...crystalEntry, ...fragmentEntries, ...fractalEntries];
}

export function createSelectionModule({
  selectionId,
  familyLabel,
  fragmentRuneCountResolver,
  vaultLodConfig
}) {
  return {
    getDetailItems(selectionContext = {}) {
      const {
        metadata,
        selectionTitle,
        faceEntries,
        faceAccentResolver
      } = selectionContext;

      if (metadata?.crystalRuneEntry) {
        return flattenSelectionHierarchyItems(metadata);
      }

      const placeholderProfile = getSelectionPlaceholderDetailProfile(selectionId);

      return buildSelectionPlaceholderDetailItems({
        selectionId,
        selectionTitle,
        faceEntries,
        familyLabel: familyLabel || placeholderProfile.familyLabel || "generic",
        fragmentCount: placeholderProfile.fragmentCount,
        fragmentRuneCountResolver: (faceEntry, faceIndex) => (
          fragmentRuneCountResolver?.(faceEntry, faceIndex)
          ?? 1
        ),
        faceAccentResolver
      });
    },

    getVaultLodConfig() {
      return { ...(vaultLodConfig || {}) };
    }
  };
}
