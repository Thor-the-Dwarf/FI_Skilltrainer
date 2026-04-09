export function buildDetailHierarchyModel(items = []) {
  const crystalEntry = items.find((item) => item.level === "h1") || null;
  const fragmentEntries = items
    .filter((item) => item.level === "h2")
    .slice()
    .sort((left, right) => (left.faceIndex ?? 0) - (right.faceIndex ?? 0));
  const runeEntriesByParent = new Map();
  const entriesById = new Map(items.map((item) => [item.entryId, item]));

  items
    .filter((item) => item.level === "h3")
    .forEach((item) => {
      const collection = runeEntriesByParent.get(item.parentId) || [];
      collection.push(item);
      runeEntriesByParent.set(item.parentId, collection);
    });

  runeEntriesByParent.forEach((entries) => {
    entries.sort((left, right) => (left.runeIndex ?? 0) - (right.runeIndex ?? 0));
  });

  return {
    crystalEntry,
    fragmentEntries,
    runeEntriesByParent,
    entriesById
  };
}

export function getPreferredActiveContentEntry(items = [], activeEntryId = null) {
  return items.find((item) => item.entryId === activeEntryId)
    || items.find((item) => item.level === "h3")
    || items.find((item) => item.level === "h2")
    || items.find((item) => item.level === "h1")
    || null;
}
