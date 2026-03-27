import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const port = Number(process.env.PORT || 4175);

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".wasm", "application/wasm"],
  [".db", "application/octet-stream"],
  [".sqlite", "application/octet-stream"]
]);

function resolveRequestPath(urlPathname = "/") {
  const decoded = decodeURIComponent(urlPathname.split("?")[0] || "/");
  const safeRelative = decoded === "/" ? "/index.html" : decoded;
  const absolutePath = path.resolve(rootDir, `.${safeRelative}`);
  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }
  return absolutePath;
}

async function readFilePayload(filePath) {
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return null;
  }
  let effectivePath = filePath;
  if (stat.isDirectory()) {
    effectivePath = path.join(filePath, "index.html");
    try {
      stat = await fs.stat(effectivePath);
    } catch {
      return null;
    }
  }
  if (!stat.isFile()) return null;
  const body = await fs.readFile(effectivePath);
  const ext = path.extname(effectivePath).toLowerCase();
  return {
    body,
    type: MIME_TYPES.get(ext) || "application/octet-stream"
  };
}

const server = http.createServer(async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  if (!["GET", "HEAD"].includes(method)) {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  const absolutePath = resolveRequestPath(req.url || "/");
  if (!absolutePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  try {
    const payload = await readFilePayload(absolutePath);
    if (!payload) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": payload.type,
      "Cache-Control": "no-store"
    });
    if (method === "HEAD") {
      res.end();
      return;
    }
    res.end(payload.body);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Server Error: ${error instanceof Error ? error.message : "unknown"}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static server ready at http://127.0.0.1:${port}/index.html`);
});
