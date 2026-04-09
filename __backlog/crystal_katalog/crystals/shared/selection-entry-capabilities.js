import {
  canOpenDetailShell as selectionCanOpenDetailShell,
  canOpenPresenterShell
} from "../registry.js";

export function canOpenSelectionPresenterView(selectionId) {
  // Ziel: Alle Selections schon jetzt ueber dieselbe Presenter-Shell betreten koennen.
  // Warum: Der echte Fachcontent bleibt kristallspezifisch, aber der Einstiegspfad soll fuer die Rollout-Wellen bereits stabil und wiederverwendbar sein.
  return canOpenPresenterShell(selectionId);
}

export function canOpenSelectionDetailShell(selectionId) {
  return selectionId !== null && selectionCanOpenDetailShell(selectionId);
}
