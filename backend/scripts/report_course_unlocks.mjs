import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

const DATA_ROOT = path.resolve("backend", "data");
const COURSES_ROOT = path.join(DATA_ROOT, "Kurse");
const ACCESS_KEYS_PATH = path.join(DATA_ROOT, "access-keys.json");
const ACCESS_BUNDLES_PATH = path.join(DATA_ROOT, "access-bundles.json");
const REPORT_PATH = path.resolve("backend", "docs", "release_ladder_report.md");
const PUBLIC_ACCESS_MANIFEST_PATH = "backend/data/access-bundles.json";
const EXCLUDED_ARTIFACTS = [
  "backend/QuizMaster/**",
  "backend/scripts/**",
  "backend/server.mjs",
  "backend/output/**",
  "backend/comment-mode/**",
  "backend/tool/**"
];

function sortNatural(values = []) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b), "de", {
    numeric: true,
    sensitivity: "base"
  }));
}

function sanitizeFolderName(value = "") {
  const folder = String(value || "").trim();
  return /^[A-Za-z0-9_-]+$/.test(folder) ? folder : "";
}

function normalizeScenarioResourcePath(rawPath = "") {
  const value = String(rawPath || "").trim().replace(/\\/g, "/");
  if (!value || value.startsWith("/") || value.includes("..")) return "";
  const parts = value.split("/").map((part) => String(part || "").trim()).filter(Boolean);
  if (!parts.length) return "";
  if (parts.some((part) => !/^[A-Za-z0-9._-]+$/.test(part))) return "";
  return parts.join("/");
}

function normalizeProgressId(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseScenarioBasename(fileName = "") {
  const baseName = normalizeScenarioResourcePath(fileName).split("/").pop() || "";
  const stem = baseName.replace(/\.(json|md)$/i, "").replace(/[._][a-z]{2}$/i, "");
  const legacyMatch = stem.match(/^(\d{2})_(easy|medium|hard)_([a-z0-9_]+)$/i);
  if (legacyMatch) {
    return {
      ticketNumber: legacyMatch[1],
      difficulty: legacyMatch[2].toLowerCase(),
      slug: legacyMatch[3].toLowerCase()
    };
  }
  const versionedMatch = stem.match(/^ticket(\d{2})_v(\d{2})_([a-z0-9_]+)$/i);
  if (versionedMatch) {
    return {
      ticketNumber: versionedMatch[1],
      difficulty: "easy",
      slug: versionedMatch[3].toLowerCase()
    };
  }
  return null;
}

function getScenarioStorageFileKey(fileName = "") {
  const normalizedPath = normalizeScenarioResourcePath(fileName);
  const parsed = parseScenarioBasename(normalizedPath);
  if (!parsed) return normalizedPath;
  return `${parsed.ticketNumber}_${parsed.difficulty}_${parsed.slug}.json`;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listScenarioFolders() {
  const entries = await fs.readdir(COURSES_ROOT, { withFileTypes: true });
  return sortNatural(
    entries
      .filter((entry) => entry.isDirectory() && /-Scenarien$/i.test(entry.name))
      .map((entry) => sanitizeFolderName(entry.name))
      .filter(Boolean)
  );
}

function collectFoldersFromAccessValue(rawValue, allScenarioFolders = []) {
  const allScenarioSet = new Set(allScenarioFolders);
  const folderSet = new Set();

  const addFolder = (rawFolder) => {
    const folder = sanitizeFolderName(rawFolder);
    if (folder && allScenarioSet.has(folder)) folderSet.add(folder);
  };

  const addByPrefix = (rawPrefix) => {
    const prefix = String(rawPrefix || "").trim().toUpperCase();
    if (!prefix) return;
    allScenarioFolders.forEach((folder) => {
      if (folder.toUpperCase().startsWith(prefix)) {
        folderSet.add(folder);
      }
    });
  };

  if (typeof rawValue === "string") {
    addFolder(rawValue);
    return sortNatural([...folderSet]);
  }
  if (!rawValue || typeof rawValue !== "object") {
    return [];
  }
  if (rawValue.allFolders) {
    allScenarioFolders.forEach((folder) => folderSet.add(folder));
  }
  addFolder(rawValue.folder);
  (Array.isArray(rawValue.folders) ? rawValue.folders : []).forEach(addFolder);
  (Array.isArray(rawValue.folderPrefixes) ? rawValue.folderPrefixes : []).forEach(addByPrefix);
  return sortNatural([...folderSet]);
}

async function resolveBundleVisibility() {
  const allScenarioFolders = await listScenarioFolders();
  const publicFolderSet = new Set();
  const bundleEntryCountByFolder = new Map();
  let accessEntries = [];

  if (await exists(ACCESS_BUNDLES_PATH)) {
    const accessConfig = await readJson(ACCESS_BUNDLES_PATH);
    const hashedEntries = accessConfig && typeof accessConfig === "object" && accessConfig.hashedKeys && typeof accessConfig.hashedKeys === "object"
      ? Object.entries(accessConfig.hashedKeys)
      : [];
    accessEntries = hashedEntries.map(([entryId, rawValue]) => ({ entryId, rawValue }));
  } else if (await exists(ACCESS_KEYS_PATH)) {
    const accessConfig = await readJson(ACCESS_KEYS_PATH);
    accessEntries = Object.entries(accessConfig || {}).map(([entryId, rawValue]) => ({ entryId, rawValue }));
  }

  for (const { rawValue } of accessEntries) {
    const folders = collectFoldersFromAccessValue(rawValue, allScenarioFolders);
    folders.forEach((folder) => {
      publicFolderSet.add(folder);
      bundleEntryCountByFolder.set(folder, Math.max(0, Number(bundleEntryCountByFolder.get(folder) || 0)) + 1);
    });
  }

  const publicScenarioFolders = sortNatural([...publicFolderSet]);
  const excludedScenarioFolders = allScenarioFolders.filter((folder) => !publicFolderSet.has(folder));
  return {
    allScenarioFolders,
    publicScenarioFolders,
    excludedScenarioFolders,
    bundleEntryCountByFolder
  };
}

function isMarkdownItem(entry = {}) {
  const format = String(entry.format || "").trim().toLowerCase();
  const file = normalizeScenarioResourcePath(entry.file || "");
  return format === "markdown" || format === "md" || /\.md$/i.test(file);
}

function normalizeScenarioManifestItems(payload) {
  const source = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.scenarios) ? payload.scenarios : []);
  const progressTicketSet = Array.isArray(payload?.progressTickets)
    ? new Set(payload.progressTickets.map((entry) => getScenarioStorageFileKey(entry)).filter(Boolean))
    : null;
  return source
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => {
      const file = normalizeScenarioResourcePath(entry.file || "");
      if (!file) return null;
      const countsTowardProgress = typeof entry.countsTowardProgress === "boolean"
        ? entry.countsTowardProgress
        : (progressTicketSet ? progressTicketSet.has(getScenarioStorageFileKey(file)) : !isMarkdownItem(entry));
      return {
        file,
        label: String(entry.label || entry.title || file).trim(),
        countsTowardProgress,
        format: isMarkdownItem(entry) ? "markdown" : "quiz"
      };
    })
    .filter(Boolean);
}

async function loadScenarioItems(folder) {
  const manifestPath = path.join(COURSES_ROOT, folder, "scenario-manifest.json");
  const fallbackPath = path.join(COURSES_ROOT, folder, "00_manifest.json");
  if (await exists(manifestPath)) {
    return normalizeScenarioManifestItems(await readJson(manifestPath));
  }
  if (await exists(fallbackPath)) {
    const payload = await readJson(fallbackPath);
    const scenarios = Array.isArray(payload?.scenario_order) ? payload.scenario_order : [];
    return scenarios
      .map((entry) => ({
        file: normalizeScenarioResourcePath(entry.file || ""),
        label: String(entry.title || entry.label || entry.file || "").trim(),
        countsTowardProgress: typeof entry.countsTowardProgress === "boolean" ? entry.countsTowardProgress : !isMarkdownItem(entry),
        format: isMarkdownItem(entry) ? "markdown" : "quiz"
      }))
      .filter((entry) => entry.file);
  }
  throw new Error("Kein Szenario-Manifest gefunden.");
}

async function loadQuizManifestItems(folder) {
  const quizFolder = sanitizeFolderName(folder.replace(/-Scenarien$/i, "-Quiz"));
  const manifestPath = path.join(COURSES_ROOT, quizFolder, "quiz-manifest.json");
  if (!(await exists(manifestPath))) {
    throw new Error("Kein Quiz-Manifest gefunden.");
  }
  const payload = await readJson(manifestPath);
  const source = Array.isArray(payload?.items) ? payload.items : [];
  return {
    quizFolder,
    items: source
      .map((entry) => ({
        file: normalizeScenarioResourcePath(entry.file || ""),
        ticketId: getScenarioStorageFileKey(entry.ticketId || entry.scenarioFile || entry.file || ""),
        label: String(entry.label || entry.file || "").trim()
      }))
      .filter((entry) => entry.file)
  };
}

async function querySqliteJson(databasePath, sql) {
  const { stdout } = await execFile("sqlite3", ["-json", databasePath, sql], {
    maxBuffer: 24 * 1024 * 1024
  });
  return JSON.parse(String(stdout || "[]").trim() || "[]");
}

async function collectUniqueTrainingUnitsFromSqlite(folder) {
  const quizFolder = sanitizeFolderName(folder.replace(/-Scenarien$/i, "-Quiz"));
  const databasePath = path.join(COURSES_ROOT, `${quizFolder}.db`);
  if (!(await exists(databasePath))) return null;

  const rows = await querySqliteJson(
    databasePath,
    `SELECT
       q.id,
       q.concept_id,
       q.variant_id,
       p.id AS pool_id,
       p.label AS pool_label,
       p.slug AS pool_slug
     FROM quiz_question q
     JOIN quiz_pool p
       ON p.id = q.pool_id
    WHERE p.is_active = 1
      AND q.is_active = 1
    ORDER BY p.sort_order, p.label COLLATE NOCASE, q.sort_order, q.created_at, q.id`
  );
  if (!Array.isArray(rows) || !rows.length) return null;

  const uniqueUnitIds = new Set();
  const poolIds = new Set();
  const sourceRefs = new Set();

  rows.forEach((row) => {
    const unitId = normalizeProgressId(row?.concept_id || row?.variant_id || row?.id || "");
    if (unitId) uniqueUnitIds.add(unitId);
    const poolId = String(row?.pool_id || "").trim();
    const poolRef = String(row?.pool_label || row?.pool_slug || poolId).trim();
    if (poolId) poolIds.add(poolId);
    if (poolRef) sourceRefs.add(poolRef);
  });

  return {
    dataSource: "sqlite",
    quizItemCount: poolIds.size,
    poolSizeUnique: uniqueUnitIds.size,
    sourceRefs: sortNatural([...sourceRefs]),
    fileIssues: []
  };
}

async function collectUniqueTrainingUnitsFromManifest(folder) {
  const { quizFolder, items } = await loadQuizManifestItems(folder);
  const uniqueUnitIds = new Set();
  const fileIssues = [];

  for (const item of items) {
    const quizPath = path.join(COURSES_ROOT, quizFolder, item.file);
    if (!(await exists(quizPath))) {
      fileIssues.push(`Fehlt: ${quizFolder}/${item.file}`);
      continue;
    }
    const payload = await readJson(quizPath);
    const questions = Array.isArray(payload?.questions) ? payload.questions : [];
    questions.forEach((question, questionIndex) => {
      const unitId = normalizeProgressId(
        question?.conceptId ||
        question?.variantId ||
        `${item.ticketId || item.file || "ticket"}::${question?.id || `q${questionIndex + 1}`}`
      );
      if (unitId) uniqueUnitIds.add(unitId);
    });
  }

  return {
    dataSource: "manifest",
    quizItemCount: items.length,
    poolSizeUnique: uniqueUnitIds.size,
    sourceRefs: sortNatural(items.map((item) => item.label || item.file).filter(Boolean)),
    fileIssues
  };
}

async function collectUniqueTrainingUnits(folder) {
  let sqliteError = "";
  try {
    const sqliteResult = await collectUniqueTrainingUnitsFromSqlite(folder);
    if (sqliteResult) return sqliteResult;
  } catch (error) {
    sqliteError = error instanceof Error ? error.message : String(error || "");
  }

  const manifestResult = await collectUniqueTrainingUnitsFromManifest(folder);
  if (sqliteError) {
    manifestResult.fileIssues.unshift(`SQLite-Analyse fehlgeschlagen, Manifest-Fallback genutzt: ${sqliteError}`);
  }
  return manifestResult;
}

function buildMilestones(unlockableItems, threshold) {
  return unlockableItems.map((item, index) => ({
    ticketIndex: index + 1,
    label: String(item?.label || item?.file || `Ticket ${index + 1}`).trim(),
    file: String(item?.file || "").trim(),
    requiredCorrect: index === 0 ? 0 : threshold * index
  }));
}

async function analyzeTrainingMappings(folder, unlockableItems) {
  const unlockableFiles = new Set(
    (Array.isArray(unlockableItems) ? unlockableItems : [])
      .map((item) => getScenarioStorageFileKey(item?.file || ""))
      .filter(Boolean)
  );
  try {
    const { quizFolder, items } = await loadQuizManifestItems(folder);
    const trainingOnlyItems = items
      .map((item) => {
        if (!item.ticketId) {
          return `${item.label || item.file} -> ohne Ticket-Mapping`;
        }
        if (!unlockableFiles.has(item.ticketId)) {
          return `${item.label || item.file} -> ${item.ticketId} fehlt im Szenario-Manifest`;
        }
        return "";
      })
      .filter(Boolean);
    return {
      quizFolder,
      manifestQuizItemCount: items.length,
      trainingOnlyItems
    };
  } catch (error) {
    return {
      quizFolder: sanitizeFolderName(folder.replace(/-Scenarien$/i, "-Quiz")),
      manifestQuizItemCount: 0,
      trainingOnlyItems: [],
      issue: error instanceof Error ? error.message : String(error || "")
    };
  }
}

async function analyzeCourse(folder, bundleEntryCountByFolder) {
  const scenarioItems = await loadScenarioItems(folder);
  const unlockableItems = scenarioItems.filter((item) => item.countsTowardProgress && item.format !== "markdown");
  const training = await collectUniqueTrainingUnits(folder);
  const trainingMappings = await analyzeTrainingMappings(folder, unlockableItems);
  const threshold = unlockableItems.length > 0 && training.poolSizeUnique > 0
    ? Math.ceil(training.poolSizeUnique / unlockableItems.length)
    : 0;

  return {
    folder,
    bundleEntryCount: Math.max(0, Number(bundleEntryCountByFolder.get(folder) || 0)),
    trainingDataSource: training.dataSource,
    trainingDataSourceRefs: training.sourceRefs,
    unlockableTicketCount: unlockableItems.length,
    visibleInfoPageCount: scenarioItems.length - unlockableItems.length,
    quizItemCount: training.quizItemCount,
    manifestQuizItemCount: trainingMappings.manifestQuizItemCount,
    poolSizeUnique: training.poolSizeUnique,
    threshold,
    milestones: buildMilestones(unlockableItems, threshold),
    trainingOnlyItems: trainingMappings.trainingOnlyItems,
    issues: sortNatural([
      ...(training.poolSizeUnique === 0 && unlockableItems.length > 0 ? ["Poolgröße konnte nicht eindeutig bestimmt werden."] : []),
      ...(trainingMappings.issue ? [trainingMappings.issue] : []),
      ...training.fileIssues
    ])
  };
}

function formatInlineCodeList(values = [], emptyLabel = "`keine`") {
  const items = sortNatural(values).map((entry) => `\`${entry}\``);
  return items.length ? items.join(", ") : emptyLabel;
}

function formatCourseSection(course) {
  const lines = [];
  lines.push(`## ${course.folder}`);
  lines.push(`- Bundle-Einträge: ${course.bundleEntryCount}`);
  lines.push(`- Datenquelle Poolgröße: \`${course.trainingDataSource}\``);
  lines.push(`- Datenquellen / Pools: ${formatInlineCodeList(course.trainingDataSourceRefs, "`keine ermittelt`")}`);
  lines.push(`- Eindeutige DoomScroll-Aufgaben: ${course.poolSizeUnique}`);
  lines.push(`- Freischaltbare Tickets: ${course.unlockableTicketCount}`);
  lines.push(`- Sichtbare Info-Seiten: ${course.visibleInfoPageCount}`);
  lines.push(`- Quiz-Pools laut aktiver Datenquelle: ${course.quizItemCount}`);
  lines.push(`- Quiz-Manifest-Einträge: ${course.manifestQuizItemCount}`);
  lines.push(`- Schwelle pro weiterem Ticket: ${course.threshold || "Datencheck"}`);
  if (course.milestones.length) {
    lines.push("- Freischaltreihenfolge:");
    course.milestones.forEach((entry) => {
      const prefix = entry.requiredCorrect === 0 ? "sofort offen" : `ab ${entry.requiredCorrect} korrekt`;
      lines.push(`  - ${prefix}: ${entry.label} (\`${entry.file}\`)`);
    });
  }
  if (course.trainingOnlyItems.length) {
    lines.push("- Training-only / unmapped Quizquellen:");
    course.trainingOnlyItems.forEach((entry) => {
      lines.push(`  - ${entry}`);
    });
  }
  if (course.issues.length) {
    lines.push("- Datenprobleme:");
    course.issues.forEach((issue) => {
      lines.push(`  - ${issue}`);
    });
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const {
    allScenarioFolders,
    publicScenarioFolders,
    excludedScenarioFolders,
    bundleEntryCountByFolder
  } = await resolveBundleVisibility();

  const courseReports = [];
  for (const folder of publicScenarioFolders) {
    try {
      courseReports.push(await analyzeCourse(folder, bundleEntryCountByFolder));
    } catch (error) {
      courseReports.push({
        folder,
        bundleEntryCount: Math.max(0, Number(bundleEntryCountByFolder.get(folder) || 0)),
        trainingDataSource: "unknown",
        trainingDataSourceRefs: [],
        unlockableTicketCount: 0,
        visibleInfoPageCount: 0,
        quizItemCount: 0,
        manifestQuizItemCount: 0,
        poolSizeUnique: 0,
        threshold: 0,
        milestones: [],
        trainingOnlyItems: [],
        issues: [error instanceof Error ? error.message : String(error || "Unbekannter Fehler")]
      });
    }
  }

  const report = [
    "# Release Ladder Report",
    "",
    `- Generiert: ${new Date().toISOString()}`,
    `- Öffentliche Kursordner: ${publicScenarioFolders.length} / ${allScenarioFolders.length}`,
    `- Deployte Kursordner: ${formatInlineCodeList(publicScenarioFolders)}`,
    `- Nicht deployte Kursordner: ${formatInlineCodeList(excludedScenarioFolders)}`,
    `- Öffentliches Bundle-Manifest: \`${PUBLIC_ACCESS_MANIFEST_PATH}\``,
    `- Ausgeschlossene Deploy-Artefakte: ${formatInlineCodeList(EXCLUDED_ARTIFACTS)}`,
    "",
    ...courseReports.map(formatCourseSection)
  ].join("\n");

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, report, "utf8");
  console.log(report);
}

main().catch((error) => {
  console.error("Release-Report fehlgeschlagen:", error);
  process.exitCode = 1;
});
