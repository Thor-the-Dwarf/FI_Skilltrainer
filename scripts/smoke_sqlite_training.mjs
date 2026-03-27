import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { promisify } from "node:util";

const rawArgs = process.argv.slice(2);
const positionalArgs = rawArgs.filter((arg) => arg !== "--mobile");
const targetUrl = positionalArgs[0] || "http://127.0.0.1:4175/index.html";
const outputPath = positionalArgs[1] || "/tmp/project_tickets_v01_sqlite_smoke.png";
const remotePort = Number(process.env.CDP_PORT || 9222);
const mobilePortrait = process.env.MOBILE_PORTRAIT === "1" || rawArgs.includes("--mobile");
const deckFolder = String(process.env.DECK_FOLDER || "Pruefungsvorbereitung-2-FIAE-Scenarien").trim();
const accessKey = String(process.env.ACCESS_KEY || "PV2FIAE_03_26").trim();
const expectedMinCount = Math.max(1, Number(process.env.EXPECTED_MIN_COUNT || 500));
const targetHost = (() => {
  try {
    return String(new URL(targetUrl).hostname || "").trim().toLowerCase();
  } catch {
    return "";
  }
})();
const localTarget = targetHost === "localhost" || targetHost === "127.0.0.1";
const enableFeedback = process.env.ENABLE_FEEDBACK === "1" || (process.env.ENABLE_FEEDBACK !== "0" && localTarget);
const expectFeedback = process.env.EXPECT_FEEDBACK === "1" || (process.env.EXPECT_FEEDBACK !== "0" && localTarget);
const reportOnly = process.env.REPORT_ONLY === "1";
const execFileAsync = promisify(execFile);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const target = new URL(url);
  const transport = target.protocol === "https:" ? https : http;
  const method = String(options.method || "GET").toUpperCase();
  try {
    return await new Promise((resolve, reject) => {
      const request = transport.request(target, {
        method,
        headers: {
          Accept: "application/json",
          ...(options.headers || {})
        }
      }, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if ((response.statusCode || 500) >= 400) {
            reject(new Error(`HTTP ${response.statusCode} fuer ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(body || "{}"));
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Antwort war kein JSON."));
          }
        });
      });
      request.on("error", reject);
      request.end();
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const shouldFallbackToCurl = /EPERM|EACCES|ECONNREFUSED|fetch failed/i.test(message);
    if (!shouldFallbackToCurl) {
      throw error;
    }
    const args = [
      "-sS",
      "-X",
      method,
      "-H",
      "Accept: application/json",
      url
    ];
    const { stdout } = await execFileAsync("curl", args);
    return JSON.parse(stdout || "{}");
  }
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
  localStorage.removeItem("sr_doomscroll_feedback_preview_v1");
  if (${JSON.stringify(enableFeedback)}) {
    localStorage.setItem("sr_enable_doomscroll_feedback", "1");
  } else {
    localStorage.removeItem("sr_enable_doomscroll_feedback");
  }
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
  if (${JSON.stringify(enableFeedback)}) {
    document.querySelector("[data-feedback-action='like']")?.click();
    await new Promise((resolve) => setTimeout(resolve, 250));
    document.querySelector("[data-feedback-action='comment']")?.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const feedbackTextarea = document.querySelector(".doomscroll-feedback-textarea");
    if (feedbackTextarea) {
      feedbackTextarea.value = "Smoke-Test Kommentar";
      feedbackTextarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
    document.querySelector(".doomscroll-feedback-send")?.click();
    const feedbackDeadline = Date.now() + 2200;
    while (Date.now() < feedbackDeadline) {
      const liveLikePressed = document.querySelector("[data-feedback-action='like']")?.getAttribute("aria-pressed") === "true";
      const liveCommentCount = Number.parseInt(document.querySelector("[data-feedback-count='comment']")?.textContent?.trim() || "0", 10) || 0;
      const liveRenderedComments = document.querySelectorAll(".doomscroll-feedback-comment").length;
      if (liveLikePressed && liveCommentCount >= 1 && liveRenderedComments >= 1) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  document.querySelector(".doomscroll-lock-button")?.click();
  const reviewDeadline = Date.now() + 2200;
  while (Date.now() < reviewDeadline) {
    const liveReviewNodeCount = document.querySelectorAll(".doomscroll-review-slot .review-node").length;
    if (liveReviewNodeCount >= 2) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  const feedbackPanel = document.querySelector(".doomscroll-feedback-panel");
  const feedbackMode = document.querySelector(".doomscroll-feedback")?.dataset.feedbackMode || "";
  const feedbackStatus = document.querySelector(".doomscroll-feedback-status")?.textContent?.trim() || "";
  const likePressed = document.querySelector("[data-feedback-action='like']")?.getAttribute("aria-pressed") === "true";
  const commentCount = Number.parseInt(document.querySelector("[data-feedback-count='comment']")?.textContent?.trim() || "0", 10) || 0;
  const renderedCommentCount = document.querySelectorAll(".doomscroll-feedback-comment").length;
  const feedbackComposerOpen = Boolean(feedbackPanel && !feedbackPanel.classList.contains("hidden"));
  const firstTitle = document.querySelector(".doomscroll-question-title")?.textContent?.trim() || "";
  document.querySelector(".doomscroll-secondary-button:not(.hidden)")?.click();
  await new Promise((resolve) => setTimeout(resolve, 900));
  const feed = document.getElementById("doomscrollQuestionFeed");
  const panels = [...document.querySelectorAll(".doomscroll-panel")];
  const panelTitles = [...document.querySelectorAll(".doomscroll-question-title")]
    .map((element) => element.textContent?.trim() || "")
    .filter(Boolean);
  const scrollTopAfterContinue = Math.round(Number(feed?.scrollTop || 0));
  if (feed) {
    feed.scrollTop = 0;
  }
  await new Promise((resolve) => setTimeout(resolve, 260));
  const reviewSlot = document.querySelector(".doomscroll-review-slot");
  const actions = document.querySelector(".doomscroll-question-actions");
  return {
    menuCount,
    menuSubtitle,
    kicker: document.querySelector(".doomscroll-question-kicker")?.textContent?.trim() || "",
    title: document.querySelector(".doomscroll-question-title")?.textContent?.trim() || "",
    badge: document.querySelector(".doomscroll-question-mode-pill")?.textContent?.trim() || "",
    optionCount: document.querySelectorAll(".doomscroll-option-button").length,
    panelCount: panels.length,
    uniquePanelTitles: panelTitles.length,
    firstTitle,
    latestTitle: panelTitles[panelTitles.length - 1] || "",
    scrollTopAfterContinue,
    historyReturnedToTop: Number(feed?.scrollTop || 0) < 10,
    feedClientHeight: Math.round(Number(feed?.clientHeight || 0)),
    feedScrollHeight: Math.round(Number(feed?.scrollHeight || 0)),
    secondPanelOffsetTop: Math.round(Number(panels[1]?.offsetTop || 0)),
    firstPanelHeight: Math.round(Number(panels[0]?.getBoundingClientRect?.().height || 0)),
    secondPanelHeight: Math.round(Number(panels[1]?.getBoundingClientRect?.().height || 0)),
    reviewNodeCount: document.querySelectorAll(".doomscroll-review-slot .review-node").length,
    hasReviewSplit: document.querySelector(".doomscroll-question-card")?.classList.contains("has-review") || false,
    reviewParentIsMainPanel: reviewSlot?.parentElement?.classList.contains("doomscroll-question-main") || false,
    reviewBeforeActions: Boolean(reviewSlot && actions && reviewSlot.nextElementSibling === actions),
    feedbackMode,
    feedbackStatus,
    likePressed,
    commentCount,
    renderedCommentCount,
    feedbackComposerOpen
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

  if (reportOnly) {
    console.log(JSON.stringify({
      ok: true,
      deckFolder,
      accessKey,
      expectedMinCount,
      mobilePortrait,
      result,
      screenshot: outputPath
    }, null, 2));
    return;
  }

  const countValue = Number.parseInt(String(result.menuCount || "").replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(countValue) || countValue < expectedMinCount) {
    throw new Error(`Erwartete Deck-Groesse nicht erreicht. Menue zeigte: ${result.menuCount || "leer"}`);
  }
  if (!result.title || Number(result.optionCount || 0) < 2) {
    throw new Error("Training startete nicht mit einer nutzbaren Karte.");
  }
  if (Number(result.panelCount || 0) < 2 || Number(result.uniquePanelTitles || 0) < 2) {
    throw new Error("Der DoomScroll-Feed baut keine Verlaufshistorie aus mehreren Karten auf.");
  }
  if (Number(result.feedScrollHeight || 0) <= Number(result.feedClientHeight || 0) + 40 || Number(result.secondPanelOffsetTop || 0) < 100) {
    throw new Error("Der DoomScroll-Feed scrollt nicht wie ein vertikaler Verlauf zwischen alten und neuen Karten.");
  }
  if (expectFeedback) {
    if (!result.feedbackMode || !result.feedbackStatus || !result.likePressed) {
      throw new Error("Die neue Voting-Leiste im DoomScrollQuiz wurde nicht sauber aktiviert.");
    }
    if (Number(result.commentCount || 0) < 1 || Number(result.renderedCommentCount || 0) < 1 || !result.feedbackComposerOpen) {
      throw new Error("Das Kommentar-System im DoomScrollQuiz reagiert nicht wie erwartet.");
    }
  } else if (result.feedbackMode || result.feedbackStatus || result.likePressed || Number(result.commentCount || 0) > 0 || Number(result.renderedCommentCount || 0) > 0) {
    throw new Error("Das Feedback-Feature ist ohne lokalen Freischalter sichtbar.");
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
