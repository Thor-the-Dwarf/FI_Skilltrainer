#!/usr/bin/env node

import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.PORT || process.argv[2] || 8137);
const root = process.cwd();

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".mjs", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"]
]);

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  res.end(body);
}

async function resolveTargetPath(urlPathname) {
  const rawPath = decodeURIComponent(urlPathname === "/" ? "/index.html" : urlPathname);
  const absolutePath = path.resolve(root, `.${rawPath}`);

  if (!absolutePath.startsWith(root)) {
    throw new Error("forbidden");
  }

  const stat = await fs.stat(absolutePath).catch(() => null);

  if (stat?.isDirectory()) {
    return path.join(absolutePath, "index.html");
  }

  return absolutePath;
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    send(res, 400, "Missing request URL.");
    return;
  }

  const requestUrl = new URL(req.url, `http://${host}:${port}`);

  if (requestUrl.pathname === "/__sandbox__/health") {
    send(res, 200, JSON.stringify({ ok: true, root, port }), "application/json; charset=utf-8");
    return;
  }

  let targetPath;

  try {
    targetPath = await resolveTargetPath(requestUrl.pathname);
  } catch (error) {
    send(res, 403, "Forbidden.");
    return;
  }

  const fileBuffer = await fs.readFile(targetPath).catch(() => null);

  if (!fileBuffer) {
    send(res, 404, "Not found.");
    return;
  }

  const extension = path.extname(targetPath).toLowerCase();
  const contentType = mimeTypes.get(extension) || "application/octet-stream";
  send(res, 200, fileBuffer, contentType);
});

server.listen(port, host, () => {
  const baseUrl = `http://${host}:${port}`;
  console.log(`Sandbox server läuft auf ${baseUrl}`);
  console.log(`Crystal Katalog: ${baseUrl}/__backlog/crystal_katalog/index.html?selection=4&testlab=1`);
  console.log(`Healthcheck: ${baseUrl}/__sandbox__/health`);
});

