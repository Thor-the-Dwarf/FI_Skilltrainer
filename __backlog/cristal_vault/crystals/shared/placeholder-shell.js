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

function buildPlaceholderFaceEntries(sortedFaceEntries, fragmentCount) {
  const requestedFragmentCount = Math.max(sortedFaceEntries.length, Number(fragmentCount) || 0, 1);
  const normalizedEntries = [];

  for (let index = 0; index < requestedFragmentCount; index += 1) {
    const sourceEntry = sortedFaceEntries[index] || null;
    normalizedEntries.push({
      ...(sourceEntry || {}),
      faceIndex: Number.isFinite(sourceEntry?.faceIndex) ? sourceEntry.faceIndex : index,
      placeholderFace: !sourceEntry
    });
  }

  return normalizedEntries;
}

export function buildSelectionPlaceholderDetailItems({
  selectionId,
  selectionTitle,
  faceEntries,
  familyLabel,
  faceAccentResolver,
  fragmentCount,
  fragmentRuneCountResolver
}) {
  const sortedFaceEntries = getSortedFaceEntries(faceEntries);
  const fragmentSources = buildPlaceholderFaceEntries(sortedFaceEntries, fragmentCount);
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
    const fragmentRuneCount = Math.max(1, Math.round(fragmentRuneCountResolver?.(faceEntry, normalizedFaceIndex) || 1));

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

    for (let runeIndex = 0; runeIndex < fragmentRuneCount; runeIndex += 1) {
      const fractalEntryId = `selection-${selectionId}__placeholder__h3__${normalizedFaceIndex + 1}__${runeIndex + 1}`;
      const runeSymbol = FRACTAL_SYMBOLS[(sourceIndex + runeIndex) % FRACTAL_SYMBOLS.length] || fractalSymbol;

      items.push({
        entryId: fractalEntryId,
        selectionId,
        level: "h3",
        parentId: fragmentEntryId,
        faceIndex: normalizedFaceIndex,
        runeIndex,
        runeSymbol,
        placeholder: true,
        detail: {
          accentHex,
          title: `Fraktal ${fragmentLabel}${runeIndex + 1} ${runeSymbol}`,
          subtitle: `Placeholder fuer Fraktal ${fragmentLabel}${runeIndex + 1} in der Familie ${familyLabel}.`
        }
      });
    }
  });

  return items;
}
