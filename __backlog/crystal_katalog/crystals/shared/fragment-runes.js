export const DEFAULT_H3_RUNES_PER_FRAGMENT = 10;
export const MAX_H3_RUNES_PER_FRAGMENT = 10;

export function normalizeFragmentRuneCount(requestedCount) {
  if (!Number.isFinite(requestedCount)) {
    return DEFAULT_H3_RUNES_PER_FRAGMENT;
  }

  return Math.max(1, Math.min(MAX_H3_RUNES_PER_FRAGMENT, Math.round(requestedCount)));
}

export function getDefaultFragmentRuneCount(selectionId, faceIndex) {
  // Ziel: Auch ohne explizite Konfiguration pro H2-Fragment unterschiedliche H3-Anzahlen erzeugen.
  // Warum: Der Prototyp soll die 1..10-Faehigkeit direkt sichtbar vorfuehren; viermal der alte 10er-Zustand wuerde sonst wie ein nicht umgesetzter Umbau wirken.
  const defaultCounts = [1, 3, 6, 10];
  return defaultCounts[faceIndex] || DEFAULT_H3_RUNES_PER_FRAGMENT;
}

export function resolveRequestedFragmentRuneCount(selectionId, faceIndex, configuredCount) {
  if (Number.isFinite(configuredCount)) {
    return normalizeFragmentRuneCount(configuredCount);
  }

  return getDefaultFragmentRuneCount(selectionId, faceIndex);
}
