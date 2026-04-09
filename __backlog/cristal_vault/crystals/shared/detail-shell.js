function isRenderableEntry(entry) {
  return Boolean(entry && typeof entry === "object" && entry.entryId);
}

function compareByFaceIndexThenEntryId(left, right) {
  const leftFaceIndex = Number.isFinite(left?.faceIndex) ? left.faceIndex : Number.POSITIVE_INFINITY;
  const rightFaceIndex = Number.isFinite(right?.faceIndex) ? right.faceIndex : Number.POSITIVE_INFINITY;

  if (leftFaceIndex !== rightFaceIndex) {
    return leftFaceIndex - rightFaceIndex;
  }

  return String(left?.entryId || "").localeCompare(String(right?.entryId || ""));
}

function compareByRuneIndexThenFaceIndexThenEntryId(left, right) {
  const leftRuneIndex = Number.isFinite(left?.runeIndex) ? left.runeIndex : Number.POSITIVE_INFINITY;
  const rightRuneIndex = Number.isFinite(right?.runeIndex) ? right.runeIndex : Number.POSITIVE_INFINITY;

  if (leftRuneIndex !== rightRuneIndex) {
    return leftRuneIndex - rightRuneIndex;
  }

  return compareByFaceIndexThenEntryId(left, right);
}

function getItemLevel(item) {
  return typeof item?.level === "string" ? item.level.toLowerCase() : "";
}

function getDefaultContentEntry(model) {
  return (
    model?.items?.find?.((item) => getItemLevel(item) === "h3")
    || model?.fragmentEntries?.[0]
    || model?.crystalEntry
    || null
  );
}

export function createDetailShellModel(items = []) {
  const normalizedItems = Array.isArray(items)
    ? items.filter(isRenderableEntry)
    : [];
  const entriesById = new Map(normalizedItems.map((item) => [item.entryId, item]));
  const crystalEntry = normalizedItems.find((item) => getItemLevel(item) === "h1") || null;
  const fragmentEntries = normalizedItems
    .filter((item) => getItemLevel(item) === "h2")
    .slice()
    .sort(compareByFaceIndexThenEntryId);
  const runeEntriesByParent = new Map();

  normalizedItems
    .filter((item) => getItemLevel(item) === "h3")
    .forEach((item) => {
      const parentId = item.parentId || null;
      const collection = runeEntriesByParent.get(parentId) || [];
      collection.push(item);
      runeEntriesByParent.set(parentId, collection);
    });

  runeEntriesByParent.forEach((entries, parentId) => {
    entries.sort(compareByRuneIndexThenFaceIndexThenEntryId);
    runeEntriesByParent.set(parentId, Object.freeze(entries.slice()));
  });

  return Object.freeze({
    items: Object.freeze(normalizedItems.slice()),
    crystalEntry,
    fragmentEntries: Object.freeze(fragmentEntries.slice()),
    entriesById,
    runeEntriesByParent
  });
}

export function getDetailShellDefaultContentEntryId(model) {
  return getDefaultContentEntry(model)?.entryId || null;
}

export function resolveDetailShellActiveEntry(model, preferredEntryId = null) {
  if (!model) {
    return null;
  }

  if (preferredEntryId && model.entriesById?.has?.(preferredEntryId)) {
    return model.entriesById.get(preferredEntryId) || null;
  }

  return getDefaultContentEntry(model);
}

export function resolveDetailShellActiveContentEntry(model, preferredEntryId = null) {
  return resolveDetailShellActiveEntry(model, preferredEntryId);
}
