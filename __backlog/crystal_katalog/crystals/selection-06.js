import { getSelectionPlaceholderDetailProfile } from "./registry.js";
import { buildSelectionPlaceholderDetailItems } from "./shared/placeholder-shell.js";

function flattenSelection06HierarchyItems(metadata = {}) {
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

export function getSelection06DetailItems({
  metadata,
  selectionId,
  selectionTitle,
  faceEntries,
  familyLabel,
  faceAccentResolver,
  fragmentRuneCountResolver
}) {
  if (metadata?.crystalRuneEntry) {
    return flattenSelection06HierarchyItems(metadata);
  }

  const placeholderProfile = getSelectionPlaceholderDetailProfile(selectionId);

  return buildSelectionPlaceholderDetailItems({
    selectionId,
    selectionTitle,
    faceEntries,
    familyLabel: familyLabel || placeholderProfile.familyLabel || "prismatic",
    fragmentCount: placeholderProfile.fragmentCount,
    fragmentRuneCountResolver: (faceEntry, faceIndex) => (
      fragmentRuneCountResolver?.(faceEntry, faceIndex)
      ?? ((faceIndex ?? 0) < 2 ? 1 : 2)
    ),
    faceAccentResolver
  });
}

export function getSelection06VaultLodConfig() {
  return {
    enterDistance: 10.4,
    exitDistance: 11.5
  };
}
