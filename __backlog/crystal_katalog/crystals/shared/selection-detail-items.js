import {
  getCrystalSelectionDefinition,
  getSelectionPlaceholderDetailProfile,
  supportsFullHierarchy
} from "../registry.js";
import { resolveSelectionModuleDetailItems } from "../selection-module-registry.js";
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

  const selectionSpecificItems = resolveSelectionModuleDetailItems(selectionId, selectionContext);

  if (selectionSpecificItems?.length) {
    return selectionSpecificItems;
  }

  if (supportsFullHierarchy(selectionId)) {
    return [];
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
