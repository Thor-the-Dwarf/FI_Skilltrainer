import { getSelectionPlaceholderDetailProfile } from "./registry.js";
import { buildSelectionPlaceholderDetailItems } from "./shared/placeholder-shell.js";

function flattenSelection07HierarchyItems(metadata = {}) {
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

export function getSelection07DetailItems({
  metadata,
  selectionId,
  selectionTitle,
  faceEntries,
  familyLabel,
  faceAccentResolver,
  fragmentRuneCountResolver
}) {
  if (metadata?.crystalRuneEntry) {
    return flattenSelection07HierarchyItems(metadata);
  }

  const placeholderProfile = getSelectionPlaceholderDetailProfile(selectionId);

  return buildSelectionPlaceholderDetailItems({
    selectionId,
    selectionTitle,
    faceEntries,
    familyLabel: familyLabel || placeholderProfile.familyLabel || "prism-cap",
    fragmentCount: placeholderProfile.fragmentCount,
    fragmentRuneCountResolver: (faceEntry, faceIndex) => (
      fragmentRuneCountResolver?.(faceEntry, faceIndex)
      ?? ((faceIndex ?? 0) === 0 ? 1 : 2)
    ),
    faceAccentResolver
  });
}

export function getSelection07VaultLodConfig() {
  return {
    enterDistance: 10.3,
    exitDistance: 11.5
  };
}
