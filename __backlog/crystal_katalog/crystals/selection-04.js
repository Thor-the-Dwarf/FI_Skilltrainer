export function getSelection04DetailItems(metadata) {
  const crystalEntry = metadata?.crystalRuneEntry ? [metadata.crystalRuneEntry] : [];
  const fragmentEntries = (metadata?.fragmentEntries || [])
    .slice()
    .sort((left, right) => left.faceIndex - right.faceIndex);
  const runeEntries = (metadata?.runeFragmentEntries || [])
    .slice()
    .sort((left, right) => {
      if (left.faceIndex !== right.faceIndex) {
        return left.faceIndex - right.faceIndex;
      }

      return left.runeIndex - right.runeIndex;
    });

  return [...crystalEntry, ...fragmentEntries, ...runeEntries];
}

export function getSelection04VaultLodConfig() {
  return {
    enterDistance: 10.8,
    exitDistance: 11.9
  };
}
