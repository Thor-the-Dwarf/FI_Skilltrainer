import { getSelectionPlaceholderDetailProfile } from "./registry.js";
import { buildSelectionPlaceholderDetailItems } from "./shared/placeholder-shell.js";

export function getSelection05DetailItems({
  selectionId,
  selectionTitle,
  faceEntries,
  familyLabel,
  faceAccentResolver,
  fragmentRuneCountResolver
}) {
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
