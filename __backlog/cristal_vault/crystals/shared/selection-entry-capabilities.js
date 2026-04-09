import {
  canOpenDetailShell as selectionCanOpenDetailShell,
  canOpenPresenterShell
} from "../registry.js";

export function canOpenSelectionPresenterView(selectionId) {
  return canOpenPresenterShell(selectionId);
}

export function canOpenSelectionDetailShell(selectionId) {
  return selectionId !== null && selectionCanOpenDetailShell(selectionId);
}
