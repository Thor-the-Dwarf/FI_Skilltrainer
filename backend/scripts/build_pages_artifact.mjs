import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const PROJECT_ROOT = path.resolve(".");
const DIST_ROOT = path.resolve("dist-pages");
const FRONTEND_ROOT = path.resolve("frontend");
const DATA_ROOT = path.resolve("backend", "data");
const COURSES_ROOT = path.join(DATA_ROOT, "Kurse");
const ACCESS_KEYS_PATH = path.join(DATA_ROOT, "access-keys.json");
const ACCESS_BUNDLES_PATH = path.join(DATA_ROOT, "access-bundles.json");
const ROOT_FILES = ["index.html", "index.js", "styles.css"];
const EXCLUDED_ARTIFACTS = [
  "backend/QuizMaster/**",
  "backend/scripts/**",
  "backend/server.mjs",
  "backend/output/**",
  "backend/comment-mode/**",
  "backend/tool/**",
  "frontend/presenter/**",
  "frontend/vendor/vendor/babylon/**"
];

function sanitizeFolderName(value = "") {
  const folder = String(value || "").trim();
  return /^[A-Za-z0-9_-]+$/.test(folder) ? folder : "";
}

function normalizeAccessKey(rawKey = "") {
  let key = String(rawKey || "").trim().toUpperCase();
  if (!key) return "";
  key = key.replace(/\s+/g, "");
  key = key.replace(/-/g, "_");
  key = key.replace(/^LF_(\d{2}_\d{2}_\d{2})$/, "LF$1");
  return key;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function copyFileIfExists(sourcePath, targetPath) {
  if (!(await exists(sourcePath))) return false;
  await ensureDir(path.dirname(targetPath));
  await fs.copyFile(sourcePath, targetPath);
  return true;
}

async function copyDirIfExists(sourcePath, targetPath) {
  if (!(await exists(sourcePath))) return false;
  await ensureDir(path.dirname(targetPath));
  await fs.cp(sourcePath, targetPath, { recursive: true });
  return true;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function buildPublicAccessBundlePayload(accessConfig) {
  const hashedKeys = {};
  for (const [rawKey, rawValue] of Object.entries(accessConfig || {})) {
    const normalizedKey = normalizeAccessKey(rawKey);
    if (!normalizedKey || rawValue == null) continue;
    const digest = createHash("sha256").update(normalizedKey).digest("hex");
    hashedKeys[digest] = rawValue;
  }
  return {
    algorithm: "sha256",
    hashedKeys
  };
}

async function loadPublicAccessBundlePayload() {
  if (await exists(ACCESS_BUNDLES_PATH)) {
    const payload = await readJson(ACCESS_BUNDLES_PATH);
    if (payload && typeof payload === "object" && payload.hashedKeys && typeof payload.hashedKeys === "object") {
      return payload;
    }
  }
  if (!(await exists(ACCESS_KEYS_PATH))) {
    throw new Error("Weder access-bundles.json noch access-keys.json gefunden.");
  }
  return buildPublicAccessBundlePayload(await readJson(ACCESS_KEYS_PATH));
}

function ensurePublicAccessBundlePayload(payload) {
  if (payload && typeof payload === "object" && payload.hashedKeys && typeof payload.hashedKeys === "object") {
    return payload;
  }
  return buildPublicAccessBundlePayload(payload || {});
}

async function listScenarioFolders() {
  const entries = await fs.readdir(COURSES_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && /-Scenarien$/i.test(entry.name))
    .map((entry) => sanitizeFolderName(entry.name))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
}

async function resolvePublicScenarioFolders() {
  const accessConfig = ensurePublicAccessBundlePayload(await loadPublicAccessBundlePayload());
  const allScenarioFolders = await listScenarioFolders();
  const allScenarioSet = new Set(allScenarioFolders);
  const allowed = new Set();

  const addFolder = (rawFolder) => {
    const folder = sanitizeFolderName(rawFolder);
    if (folder && allScenarioSet.has(folder)) {
      allowed.add(folder);
    }
  };

  const addByPrefix = (rawPrefix) => {
    const prefix = String(rawPrefix || "").trim().toUpperCase();
    if (!prefix) return;
    allScenarioFolders.forEach((folder) => {
      if (folder.toUpperCase().startsWith(prefix)) {
        allowed.add(folder);
      }
    });
  };

  const sourceEntries = accessConfig && typeof accessConfig === "object" && accessConfig.hashedKeys && typeof accessConfig.hashedKeys === "object"
    ? Object.values(accessConfig.hashedKeys)
    : Object.values(accessConfig || {});
  for (const rawValue of sourceEntries) {
    if (typeof rawValue === "string") {
      addFolder(rawValue);
      continue;
    }
    if (!rawValue || typeof rawValue !== "object") continue;
    if (rawValue.allFolders) {
      allScenarioFolders.forEach((folder) => allowed.add(folder));
    }
    addFolder(rawValue.folder);
    (Array.isArray(rawValue.folders) ? rawValue.folders : []).forEach(addFolder);
    (Array.isArray(rawValue.folderPrefixes) ? rawValue.folderPrefixes : []).forEach(addByPrefix);
  }

  return [...allowed].sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
}

async function copyCourseAssets(scenarioFolders) {
  const distCoursesRoot = path.join(DIST_ROOT, "backend", "data", "Kurse");
  await ensureDir(distCoursesRoot);
  const existingCourseFiles = await fs.readdir(COURSES_ROOT);

  for (const scenarioFolder of scenarioFolders) {
    await copyDirIfExists(
      path.join(COURSES_ROOT, scenarioFolder),
      path.join(distCoursesRoot, scenarioFolder)
    );

    const quizFolder = sanitizeFolderName(scenarioFolder.replace(/-Scenarien$/i, "-Quiz"));
    if (!quizFolder) continue;

    await copyDirIfExists(
      path.join(COURSES_ROOT, quizFolder),
      path.join(distCoursesRoot, quizFolder)
    );

    const dbFiles = existingCourseFiles.filter((entry) => {
      const lower = entry.toLowerCase();
      return lower === `${quizFolder.toLowerCase()}.db` ||
        (lower.startsWith(`${quizFolder.toLowerCase()}.`) && lower.endsWith(".db"));
    });
    for (const dbFile of dbFiles) {
      await copyFileIfExists(
        path.join(COURSES_ROOT, dbFile),
        path.join(distCoursesRoot, dbFile)
      );
    }
  }
}

async function main() {
  await fs.rm(DIST_ROOT, { recursive: true, force: true });
  await ensureDir(DIST_ROOT);
  const accessConfig = await loadPublicAccessBundlePayload();
  const allScenarioFolders = await listScenarioFolders();

  for (const file of ROOT_FILES) {
    await copyFileIfExists(path.join(PROJECT_ROOT, file), path.join(DIST_ROOT, file));
  }

  await copyDirIfExists(FRONTEND_ROOT, path.join(DIST_ROOT, "frontend"));
  await fs.rm(path.join(DIST_ROOT, "frontend", "presenter"), { recursive: true, force: true });
  await fs.rm(path.join(DIST_ROOT, "frontend", "vendor", "vendor", "babylon"), { recursive: true, force: true });
  await ensureDir(path.join(DIST_ROOT, "backend", "data"));
  await fs.writeFile(
    path.join(DIST_ROOT, "backend", "data", "access-bundles.json"),
    JSON.stringify(accessConfig, null, 2),
    "utf8"
  );

  const scenarioFolders = await resolvePublicScenarioFolders();
  const excludedScenarioFolders = allScenarioFolders.filter((folder) => !scenarioFolders.includes(folder));
  await copyCourseAssets(scenarioFolders);

  console.log(JSON.stringify({
    distRoot: DIST_ROOT,
    scenarioFolders,
    excludedScenarioFolders,
    publicAccessManifest: path.relative(PROJECT_ROOT, path.join(DIST_ROOT, "backend", "data", "access-bundles.json")),
    excludedArtifacts: EXCLUDED_ARTIFACTS
  }, null, 2));
}

main().catch((error) => {
  console.error("Pages-Artefakt fehlgeschlagen:", error);
  process.exitCode = 1;
});
