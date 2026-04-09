export function createRollingMetric() {
  return {
    samples: [],
    lastMs: 0,
    avgMs: 0,
    maxMs: 0
  };
}

export function createDiagnosticsState(startupConfig) {
  return {
    enabled: startupConfig.testlab,
    errorEntries: [],
    eventEntries: [],
    conditionEntries: new Map(),
    seenKeys: new Set(),
    metrics: {
      selectionId: startupConfig.selectionId,
      detailOpen: false,
      viewMode: "detail",
      faceEntries: 0,
      h1: 0,
      h2: 0,
      h3: 0,
      visibleH1: 0,
      visibleH2: 0,
      visibleH3: 0
    },
    performance: {
      sceneRenderMs: createRollingMetric(),
      detailLayoutMs: createRollingMetric(),
      detailHoverPickMs: createRollingMetric()
    },
    performancePanelUpdatedAt: 0,
    samples: []
  };
}

export function recordRollingMetric(metric, durationMs) {
  if (!metric || !Number.isFinite(durationMs)) {
    return;
  }

  metric.samples.push(durationMs);

  if (metric.samples.length > 45) {
    metric.samples.shift();
  }

  metric.lastMs = durationMs;
  metric.maxMs = Math.max(metric.maxMs, durationMs);
  metric.avgMs = metric.samples.reduce((sum, sample) => sum + sample, 0) / metric.samples.length;
}

export function formatRollingMetric(metric) {
  if (!metric?.samples?.length) {
    return "n/a";
  }

  return `${metric.avgMs.toFixed(2)}ms avg`;
}

export function recordDiagnosticMetric(diagnostics, metricKey, durationMs) {
  recordRollingMetric(diagnostics?.performance?.[metricKey], durationMs);
}

export function formatDiagnosticMetric(diagnostics, metricKey) {
  return formatRollingMetric(diagnostics?.performance?.[metricKey]);
}

export function formatDiagnosticValue(value) {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

export function toSerializableVector3(vector) {
  if (!vector) {
    return null;
  }

  return {
    x: Number(vector.x.toFixed(4)),
    y: Number(vector.y.toFixed(4)),
    z: Number(vector.z.toFixed(4))
  };
}

export function createRuneReport(entry) {
  const worldPosition = entry?.runeAnchor?.getAbsolutePosition
    ? entry.runeAnchor.getAbsolutePosition()
    : entry?.runeAnchor?.position || null;

  return {
    entryId: entry?.entryId || null,
    level: entry?.level || "unknown",
    title: entry?.detail?.title || "",
    enabled: typeof entry?.runeGlyphMesh?.isEnabled === "function"
      ? entry.runeGlyphMesh.isEnabled()
      : false,
    rootScale: entry?.rootRuneScale || 0,
    detailScale: entry?.detailRuneScale || 0,
    meshScale: entry?.runeGlyphMesh?.scaling
      ? toSerializableVector3(entry.runeGlyphMesh.scaling)
      : null,
    position: toSerializableVector3(worldPosition)
  };
}

export function collectRuntimeDiagnosticsSnapshot({
  selectedId,
  extractionStage,
  extractionViewMode,
  faceEntries,
  metadata
}) {
  const crystalEntry = metadata?.crystalRuneEntry ? [metadata.crystalRuneEntry] : [];
  const fragmentEntries = Array.isArray(metadata?.fragmentEntries) ? metadata.fragmentEntries : [];
  const runeEntries = Array.isArray(metadata?.runeFragmentEntries) ? metadata.runeFragmentEntries : [];

  return {
    metrics: {
      selectionId: selectedId ?? "vault",
      detailOpen: extractionStage === "expanded",
      viewMode: extractionViewMode,
      faceEntries: faceEntries.length,
      h1: crystalEntry.length,
      h2: fragmentEntries.length,
      h3: runeEntries.length,
      visibleH1: crystalEntry.filter((entry) => entry?.runeGlyphMesh?.isEnabled?.()).length,
      visibleH2: fragmentEntries.filter((entry) => entry?.runeGlyphMesh?.isEnabled?.()).length,
      visibleH3: runeEntries.filter((entry) => entry?.runeGlyphMesh?.isEnabled?.()).length
    },
    samples: [
      ...crystalEntry.map(createRuneReport),
      ...fragmentEntries.slice(0, 4).map(createRuneReport),
      ...runeEntries.slice(0, 4).map(createRuneReport)
    ],
    crystalEntry,
    fragmentEntries,
    runeEntries
  };
}

export function applyRuntimeDiagnosticsSnapshot(diagnostics, snapshot) {
  if (!diagnostics || !snapshot) {
    return;
  }

  diagnostics.metrics = snapshot.metrics;
  diagnostics.samples = snapshot.samples;
}

export function buildRuntimeDiagnosticReport({
  state,
  diagnostics,
  distanceBetween
}) {
  const metadata = state?.crystalRoot?.metadata || null;
  const cameraPosition = state?.camera?.globalPosition || null;
  const vaultLodRoots = state?.crystalRoot?.metadata?.vaultCrystalRootsById;

  return {
    selectionId: state?.selectedId ?? null,
    detailOpen: state?.extraction?.stage === "expanded",
    viewMode: state?.extraction?.viewMode || "detail",
    activeContentEntryId: state?.extraction?.activeContentEntryId || null,
    metrics: { ...(diagnostics?.metrics || {}) },
    performance: Object.fromEntries(
      Object.entries(diagnostics?.performance || {}).map(([key, metric]) => [
        key,
        {
          lastMs: metric.lastMs,
          avgMs: metric.avgMs,
          maxMs: metric.maxMs
        }
      ])
    ),
    conditions: [...(diagnostics?.conditionEntries?.entries?.() || [])].map(([key, value]) => ({ key, ...value })),
    errors: (diagnostics?.errorEntries || []).map((entry) => ({ ...entry })),
    events: (diagnostics?.eventEntries || []).map((entry) => ({ ...entry })),
    vaultLod: metadata?.isVault && vaultLodRoots?.entries
      ? [...vaultLodRoots.entries()].map(([selectionId, root]) => ({
        selectionId,
        tier: root?.metadata?.vaultLod?.tier || null,
        distanceToCamera: cameraPosition && typeof distanceBetween === "function"
          ? distanceBetween(cameraPosition, root.getAbsolutePosition())
          : null
      }))
      : [],
    crystalRune: metadata?.crystalRuneEntry ? createRuneReport(metadata.crystalRuneEntry) : null,
    fragmentRunes: (metadata?.fragmentEntries || []).map(createRuneReport),
    runeFragmentRunes: (metadata?.runeFragmentEntries || []).map(createRuneReport)
  };
}

export function syncRuntimeDiagnosticsState({
  diagnostics,
  selectedId,
  extractionStage,
  extractionViewMode,
  faceEntries,
  metadata,
  hierarchyDiagnosticsActive = false,
  hierarchyDiagnosticLabel = `Selection ${selectedId || "?"}`,
  setDiagnosticCondition,
  onUpdate
}) {
  const snapshot = collectRuntimeDiagnosticsSnapshot({
    selectedId,
    extractionStage,
    extractionViewMode,
    faceEntries,
    metadata
  });

  applyRuntimeDiagnosticsSnapshot(diagnostics, snapshot);

  setDiagnosticCondition?.(
    "missing-h1",
    `${hierarchyDiagnosticLabel} hat kein H1-Zentralsymbol im Metadata-Pfad.`,
    hierarchyDiagnosticsActive && !snapshot.crystalEntry.length
  );
  setDiagnosticCondition?.(
    "missing-h2",
    `${hierarchyDiagnosticLabel} hat keine H2-Fragmentsymbole im Metadata-Pfad.`,
    hierarchyDiagnosticsActive && !snapshot.fragmentEntries.length
  );

  onUpdate?.();
  return snapshot;
}

export function createRuntimeDiagnosticsController({
  diagnostics,
  setDiagnosticCondition,
  onUpdate
}) {
  return {
    recordTiming(metricKey, durationMs) {
      recordDiagnosticMetric(diagnostics, metricKey, durationMs);
    },
    formatTiming(metricKey) {
      return formatDiagnosticMetric(diagnostics, metricKey);
    },
    syncState({
      selectedId,
      extractionStage,
      extractionViewMode,
      faceEntries,
      metadata,
      hierarchyDiagnosticsActive,
      hierarchyDiagnosticLabel
    }) {
      return syncRuntimeDiagnosticsState({
        diagnostics,
        selectedId,
        extractionStage,
        extractionViewMode,
        faceEntries,
        metadata,
        hierarchyDiagnosticsActive,
        hierarchyDiagnosticLabel,
        setDiagnosticCondition,
        onUpdate
      });
    },
    buildReport(state, distanceBetween) {
      return buildRuntimeDiagnosticReport({
        state,
        diagnostics,
        distanceBetween
      });
    }
  };
}
