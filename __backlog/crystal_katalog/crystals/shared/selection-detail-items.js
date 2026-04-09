import {
  getCrystalSelectionDefinition,
  getSelectionPlaceholderDetailProfile,
  supportsFullHierarchy
} from "../registry.js";
import { getSelection04DetailItems } from "../selection-04.js";
import { getSelection05DetailItems } from "../selection-05.js";
import { getSelection06DetailItems } from "../selection-06.js";
import { getSelection08DetailItems } from "../selection-08.js";
import { buildSelectionPlaceholderDetailItems } from "./placeholder-shell.js";

export function resolveSelectionDetailItems({
  selectionId,
  metadata,
  faceEntries,
  selectionTitle,
  shapeKind,
  fragmentRuneCountResolver,
  faceAccentResolver
}) {
  if (supportsFullHierarchy(selectionId)) {
    return getSelection04DetailItems(metadata);
  }

  const selectionDefinition = getCrystalSelectionDefinition(selectionId);
  const placeholderProfile = getSelectionPlaceholderDetailProfile(selectionId);
  const selectionContext = {
    selectionId,
    metadata,
    faceEntries,
    selectionTitle,
    familyLabel: placeholderProfile.familyLabel || selectionDefinition.shapeFamily || shapeKind,
    shapeKind,
    fragmentRuneCountResolver,
    faceAccentResolver
  };

  switch (selectionId) {
    case 5:
      return getSelection05DetailItems(selectionContext);
    case 6:
      return getSelection06DetailItems(selectionContext);
    case 8:
      return getSelection08DetailItems(selectionContext);
    default:
      break;
  }

  return buildSelectionPlaceholderDetailItems({
    selectionId,
    selectionTitle,
    faceEntries,
    familyLabel: selectionContext.familyLabel,
    fragmentCount: placeholderProfile.fragmentCount,
    fragmentRuneCountResolver,
    faceAccentResolver
  });
}
