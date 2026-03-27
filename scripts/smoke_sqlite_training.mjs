import fs from "node:fs/promises";

const targetUrl = process.argv[2] || "http://127.0.0.1:4175/index.html";
const outputPath = process.argv[3] || "/tmp/project_tickets_v01_sqlite_smoke.png";
const remotePort = Number(process.env.CDP_PORT || 9222);
const mobilePortrait = process.env.MOBILE_PORTRAIT === "1";
const deckFolder = String(process.env.DECK_FOLDER || "Pruefungsvorbereitung-2-FIAE-Scenarien").trim();
const accessKey = String(process.env.ACCESS_KEY || "PV2FIAE_03_26").trim();
const expectedMinCount = Math.max(1, Number(process.env.EXPECTED_MIN_COUNT || 500));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fuer ${url}`);
  }
  return response.json();
}

async function waitForDebugger(timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      return await fetchJson(`http://127.0.0.1:${remotePort}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome Debugger-Port wurde nicht rechtzeitig erreichbar.");
}

async function createTarget(url) {
  const endpoint = `http://127.0.0.1:${remotePort}/json/new?${encodeURIComponent(url)}`;
  try {
    return await fetchJson(endpoint, { method: "PUT" });
  } catch {
    return fetchJson(endpoint);
  }
}

class CdpClient {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", () => reject(new Error("CDP-WebSocket konnte nicht geöffnet werden.")), { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const payload = JSON.parse(String(event.data || "{}"));
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve, reject } = this.pending.get(payload.id);
        this.pending.delete(payload.id);
        if (payload.error) reject(new Error(payload.error.message || "CDP-Fehler"));
        else resolve(payload.result || {});
        return;
      }
      if (!payload.method) return;
      const listeners = this.eventListeners.get(payload.method) || [];
      listeners.forEach((listener) => listener(payload.params || {}));
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  waitForEvent(method, predicate = () => true, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        detach();
        reject(new Error(`CDP-Event ${method} kam nicht rechtzeitig.`));
      }, timeoutMs);
      const handler = (params) => {
        if (!predicate(params)) return;
        clearTimeout(timeout);
        detach();
        resolve(params);
      };
      const detach = () => {
        const listeners = this.eventListeners.get(method) || [];
        this.eventListeners.set(method, listeners.filter((entry) => entry !== handler));
      };
      const listeners = this.eventListeners.get(method) || [];
      listeners.push(handler);
      this.eventListeners.set(method, listeners);
    });
  }

  close() {
    try {
      this.socket.close();
    } catch {
    }
  }
}

const preloadStorageScript = `
(() => {
  localStorage.setItem("sr_access_entries", JSON.stringify([
    { key: ${JSON.stringify(accessKey)}, folder: ${JSON.stringify(deckFolder)} }
  ]));
  localStorage.setItem("sr_active_folder", ${JSON.stringify(deckFolder)});
  localStorage.setItem("sr_access_key", ${JSON.stringify(accessKey)});
  localStorage.setItem("sr_access_folder", ${JSON.stringify(deckFolder)});
  localStorage.setItem("sr_home_skills_folder", ${JSON.stringify(deckFolder)});
})();
`;

const evaluationExpression = `
(async () => {
  await toggleTrainingMenu(true);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const menuCount = document.querySelector(".training-menu-count")?.textContent?.trim() || "";
  const menuSubtitle = document.querySelector(".training-menu-subtitle")?.textContent?.trim() || "";
  await startTrainingDeck(${JSON.stringify(deckFolder)});
  await new Promise((resolve) => setTimeout(resolve, 1200));
  document.querySelector(".doomscroll-option-button")?.click();
  await new Promise((resolve) => setTimeout(resolve, 150));
  document.querySelector(".doomscroll-lock-button")?.click();
  await new Promise((resolve) => setTimeout(resolve, 700));
  const reviewSlot = document.querySelector(".doomscroll-review-slot");
  const actions = document.querySelector(".doomscroll-question-actions");
  return {
    menuCount,
    menuSubtitle,
    kicker: document.querySelector(".doomscroll-question-kicker")?.textContent?.trim() || "",
    title: document.querySelector(".doomscroll-question-title")?.textContent?.trim() || "",
    badge: document.querySelector(".doomscroll-question-mode-pill")?.textContent?.trim() || "",
    optionCount: document.querySelectorAll(".doomscroll-option-button").length,
    reviewNodeCount: document.querySelectorAll(".doomscroll-review-slot .review-node").length,
    hasReviewSplit: document.querySelector(".doomscroll-question-card")?.classList.contains("has-review") || false,
    reviewParentIsMainPanel: reviewSlot?.parentElement?.classList.contains("doomscroll-question-main") || false,
    reviewBeforeActions: Boolean(reviewSlot && actions && reviewSlot.nextElementSibling === actions)
  };
})()
`;

async function main() {
  await waitForDebugger();
  const target = await createTarget("about:blank");
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  if (mobilePortrait) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 932,
      deviceScaleFactor: 3,
      mobile: true,
      screenOrientation: {
        type: "portraitPrimary",
        angle: 0
      }
    });
    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5
    });
  }
  await client.send("Page.addScriptToEvaluateOnNewDocument", { source: preloadStorageScript });
  const loadPromise = client.waitForEvent("Page.loadEventFired", () => true, 20000);
  await client.send("Page.navigate", { url: targetUrl });
  await loadPromise;
  await sleep(1200);
  const evaluation = await client.send("Runtime.evaluate", {
    expression: evaluationExpression,
    awaitPromise: true,
    returnByValue: true
  });
  const result = evaluation?.result?.value || {};
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png"
  });
  await fs.writeFile(outputPath, Buffer.from(String(screenshot.data || ""), "base64"));
  client.close();

  const countValue = Number.parseInt(String(result.menuCount || "").replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(countValue) || countValue < expectedMinCount) {
    throw new Error(`Erwartete Deck-Groesse nicht erreicht. Menue zeigte: ${result.menuCount || "leer"}`);
  }
  if (!result.title || Number(result.optionCount || 0) < 2) {
    throw new Error("Training startete nicht mit einer nutzbaren Karte.");
  }
  if (!result.hasReviewSplit || Number(result.reviewNodeCount || 0) < 2) {
    throw new Error("Die neue Review-Darstellung im DoomScrollQuiz wurde nicht aufgebaut.");
  }
  if (mobilePortrait && (!result.reviewParentIsMainPanel || !result.reviewBeforeActions)) {
    throw new Error("Die Review-Bubbles sitzen im Portrait-Modus nicht direkt unter den Antworten.");
  }

  console.log(JSON.stringify({
    ok: true,
    deckFolder,
    accessKey,
    expectedMinCount,
    mobilePortrait,
    result,
    screenshot: outputPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
