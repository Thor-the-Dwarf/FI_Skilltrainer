const CRYSTAL_SYMBOL = "ᚱ";
const FRAGMENT_SYMBOLS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ"];
const FRACTAL_SYMBOLS = ["ᚾ", "ᚺ", "ᚹ", "ᚷ", "ᚲ", "ᚱ", "ᚨ", "ᚦ", "ᚢ", "ᚠ"];

function getFragmentLabel(index) {
  return index >= 0 && index < 26
    ? String.fromCharCode(65 + index)
    : String(index + 1);
}

function getSortedFaceEntries(faceEntries = []) {
  return faceEntries
    .filter(Boolean)
    .slice()
    .sort((left, right) => (left.faceIndex ?? 0) - (right.faceIndex ?? 0));
}

export function buildSelectionPlaceholderDetailItems({
  selectionId,
  selectionTitle,
  faceEntries,
  familyLabel,
  faceAccentResolver
}) {
  const sortedFaceEntries = getSortedFaceEntries(faceEntries);
  const fragmentSources = sortedFaceEntries.length ? sortedFaceEntries : [{ faceIndex: 0 }];
  const firstAccentHex = faceAccentResolver?.(fragmentSources[0], 0) || "#d8dde8";
  const crystalEntryId = `selection-${selectionId}__placeholder__h1`;
  const items = [
    {
      entryId: crystalEntryId,
      selectionId,
      level: "h1",
      parentId: null,
      faceIndex: -1,
      runeIndex: -1,
      runeSymbol: CRYSTAL_SYMBOL,
      placeholder: true,
      detail: {
        accentHex: firstAccentHex,
        title: `Kristall ${selectionTitle} ${CRYSTAL_SYMBOL}`,
        subtitle: `Detail-Shell fuer Kristall ${selectionTitle} aus der Familie ${familyLabel}.`
      }
    }
  ];

  fragmentSources.forEach((faceEntry, sourceIndex) => {
    const normalizedFaceIndex = Number.isFinite(faceEntry?.faceIndex) ? faceEntry.faceIndex : sourceIndex;
    const fragmentLabel = getFragmentLabel(sourceIndex);
    const fragmentSymbol = FRAGMENT_SYMBOLS[sourceIndex % FRAGMENT_SYMBOLS.length];
    const fractalSymbol = FRACTAL_SYMBOLS[sourceIndex % FRACTAL_SYMBOLS.length];
    const accentHex = faceAccentResolver?.(faceEntry, normalizedFaceIndex) || firstAccentHex;
    const fragmentEntryId = `selection-${selectionId}__placeholder__h2__${normalizedFaceIndex + 1}`;
    const fractalEntryId = `selection-${selectionId}__placeholder__h3__${normalizedFaceIndex + 1}__1`;

    items.push({
      entryId: fragmentEntryId,
      selectionId,
      level: "h2",
      parentId: crystalEntryId,
      faceIndex: normalizedFaceIndex,
      runeIndex: -1,
      runeSymbol: fragmentSymbol,
      placeholder: true,
      detail: {
        accentHex,
        title: `Fragment ${fragmentLabel} ${fragmentSymbol}`,
        subtitle: `H2-Fragment ${fragmentLabel} des Kristalls wird in einer spaeteren Ausbaustufe verfeinert.`
      }
    });

    items.push({
      entryId: fractalEntryId,
      selectionId,
      level: "h3",
      parentId: fragmentEntryId,
      faceIndex: normalizedFaceIndex,
      runeIndex: 0,
      runeSymbol: fractalSymbol,
      placeholder: true,
      detail: {
        accentHex,
        title: `Fraktal ${fragmentLabel}1 ${fractalSymbol}`,
        subtitle: `Placeholder fuer das erste Fraktal in Fragment ${fragmentLabel}.`
      }
    });
  });

  return items;
}
