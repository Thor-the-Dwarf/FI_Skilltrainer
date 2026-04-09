import { getSelectionPlaceholderDetailProfile } from "./registry.js";
import { buildSelectionPlaceholderDetailItems } from "./shared/placeholder-shell.js";

function flattenSelection05HierarchyItems(metadata = {}) {
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

export function getSelection05DetailItems({
  metadata,
  selectionId,
  selectionTitle,
  faceEntries,
  familyLabel,
  faceAccentResolver,
  fragmentRuneCountResolver
}) {
  if (metadata?.crystalRuneEntry) {
    return flattenSelection05HierarchyItems(metadata);
  }

  const placeholderProfile = getSelectionPlaceholderDetailProfile(selectionId);

  return buildSelectionPlaceholderDetailItems({
    selectionId,
    selectionTitle,
    faceEntries,
    familyLabel: familyLabel || placeholderProfile.familyLabel || "pyramidal",
    fragmentCount: placeholderProfile.fragmentCount,
    fragmentRuneCountResolver: (faceEntry, faceIndex) => (
      fragmentRuneCountResolver?.(faceEntry, faceIndex)
      ?? Math.max(1, (faceIndex ?? 0) + 1)
    ),
    faceAccentResolver
  });
}

export function getSelection05VaultLodConfig() {
  return {
    enterDistance: 10.2,
    exitDistance: 11.4
  };
}
