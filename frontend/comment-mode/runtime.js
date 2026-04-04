import { submitFeedback } from "./firebase-submission.js";

const DEFAULT_HEALTH = Object.freeze({
  maxAttachments: 5,
  maxMessageLength: 2000,
  maxTotalUploadBytes: 25 * 1024 * 1024,
  storageMode: "firebase",
  storageLabel: "Firebase",
  driveConfigured: true
});

function formatTemplate(template = "", params = null) {
  const source = String(template || "");
  if (!params || typeof params !== "object") return source;
  return source.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token) => {
    if (!Object.prototype.hasOwnProperty.call(params, token)) return match;
    return String(params[token] ?? "");
  });
}

function getI18nBridge() {
  return window.EasyPVUiI18nBridge && typeof window.EasyPVUiI18nBridge === "object"
    ? window.EasyPVUiI18nBridge
    : null;
}

function t(messageKey, fallback = "", params = null) {
  const bridge = getI18nBridge();
  if (bridge && typeof bridge.t === "function") {
    return bridge.t(messageKey, fallback, params);
  }
  return formatTemplate(String(fallback || messageKey), params);
}

function literal(value = "") {
  const bridge = getI18nBridge();
  if (bridge && typeof bridge.literal === "function") {
    return bridge.literal(String(value || ""));
  }
  return String(value || "");
}

function getCommentBridge() {
  return window.EasyPVCommentModeBridge && typeof window.EasyPVCommentModeBridge === "object"
    ? window.EasyPVCommentModeBridge
    : null;
}

function inferGenericContext() {
  return {
    surface: "generic",
    entityType: "generic",
    entityId: "",
    viewLabel: document.title || "FI Skilltrainer",
    pageTitle: document.title || "",
    pageUrl: window.location.href,
    capturedAt: new Date().toISOString()
  };
}

function basename(value = "") {
  const safe = String(value || "").trim();
  if (!safe) return "";
  const parts = safe.split(/[\\/]/);
  return parts[parts.length - 1] || safe;
}

function stripExtension(value = "") {
  return String(value || "").replace(/\.[a-z0-9]+$/i, "");
}

function humanizeIdentifier(value = "") {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortenText(value = "", maxLength = 96) {
  const safe = String(value || "").replace(/\s+/g, " ").trim();
  if (!safe) return "";
  return safe.length > maxLength ? `${safe.slice(0, maxLength - 1).trim()}…` : safe;
}

function extractCourseCode(value = "") {
  const safe = String(value || "").trim();
  if (!safe) return "";
  const match = safe.match(/^([A-Za-z]{2,4}\d{1,2})/);
  return match ? match[1].toUpperCase() : safe;
}

function extractTrainingTaskId(context = {}) {
  const safe = context && typeof context === "object" ? context : {};
  const sourceStem = humanizeIdentifier(stripExtension(basename(safe.sourceFile || "")));
  const questionId = humanizeIdentifier(String(safe.questionId || "").trim());
  const conceptId = humanizeIdentifier(String(safe.conceptId || "").trim());
  return sourceStem || questionId || conceptId || "*";
}

function summarizeContext(context = {}) {
  const safe = context && typeof context === "object" ? context : {};
  const surface = String(safe.surface || "generic").trim() || "generic";
  const chips = [];

  const areaLabel = literal({
    training: "Training",
    training_question: "Training",
    scenario: "Ticket",
    presenter: "Babylon Presenter",
    challenge: "Challenge",
    home: "Startseite",
    generic: "FI Skilltrainer"
  }[surface] || "FI Skilltrainer");

  let title = "";

  if (surface === "training_question") {
    const courseCode = extractCourseCode(safe.folder || "");
    const taskId = extractTrainingTaskId(safe);
    title = [courseCode || "Training", `AufgabenID: ${taskId}`].join(" ");
  } else if (surface === "training") {
    const courseCode = extractCourseCode(safe.folder || "");
    title = courseCode || "Training";
  } else if (surface === "scenario") {
    const ticketId = String(safe.ticketId || safe.stationId || safe.entityId || "").trim() || "*";
    title = `TicketID: ${ticketId}`;
  } else if (surface === "presenter") {
    title = String(safe.viewLabel || safe.presentationId || "Praesentation").trim();
  } else if (surface === "challenge") {
    title = String(safe.viewLabel || safe.challengeId || "Challenge").trim();
    if (safe.folder) chips.push(safe.folder);
  } else if (surface === "home") {
    const subViewLabel = {
      unlock: "Schluessel hinzufuegen",
      "skill-tree": "SkillTree",
      training: "Trainingsmenue",
      course: "Kursmenue",
      scenario: "Szenariomenue"
    }[safe.subView || ""] || "SkillTree";
    const courseCode = extractCourseCode(safe.folder || "");
    title = courseCode || subViewLabel;
    if (subViewLabel) {
      chips.push(subViewLabel);
    }
    return { areaLabel: subViewLabel, title, chips: [] };
  } else {
    title = String(safe.viewLabel || safe.pageTitle || "Kommentar").trim() || "Kommentar";
  }

  return { areaLabel, title, chips };
}

function buildContextSignature(context = {}) {
  const safe = context && typeof context === "object" ? context : {};
  return [
    String(safe.surface || "").trim(),
    String(safe.entityType || "").trim(),
    String(safe.entityId || "").trim(),
    String(safe.folder || "").trim(),
    String(safe.ticketId || "").trim(),
    String(safe.questionId || "").trim(),
    String(safe.deckKey || "").trim(),
    String(safe.subView || "").trim()
  ].join("::");
}

function createCommentModeRuntime() {
  const root = document.getElementById("commentModeRoot");
  if (!root) return null;

  root.innerHTML =
    "<div class='comment-mode-shell'>" +
    "<button type='button' class='comment-mode-backdrop hidden' aria-label='Kommentarfenster schliessen'></button>" +
    "<section class='comment-mode-panel hidden' aria-hidden='true' aria-label='Comment-Mode'>" +
    "<div class='comment-mode-panel-head'>" +
    "<div class='comment-mode-panel-title-wrap'>" +
    `<h2 class='comment-mode-title'>${t("comment_mode.title", "Kommentar")}</h2>` +
    "</div>" +
    "</div>" +
    "<section class='comment-mode-context-card'>" +
    "<p class='comment-mode-context-subtitle'></p>" +
    "<h3 class='comment-mode-context-title'></h3>" +
    "<div class='comment-mode-context-chips'></div>" +
    "</section>" +
    "<label class='comment-mode-field'>" +
    `<textarea class='comment-mode-textarea' rows='6' maxlength='${DEFAULT_HEALTH.maxMessageLength}' placeholder='${t("comment_mode.message.placeholder", "Was ist unklar, falsch oder stoert dich gerade?")}'>` +
    "</textarea>" +
    "</label>" +
    "<p class='comment-mode-status hidden'></p>" +
    "<div class='comment-mode-footer'>" +
    "<div class='comment-mode-actions'>" +
    `<button type='button' class='comment-mode-submit'>${t("comment_mode.submit", "Senden")}</button>` +
    "</div>" +
    "<div class='comment-mode-footer-reactions'>" +
    `<button type='button' class='comment-mode-fab comment-mode-fab-dislike' aria-label='${t("comment_mode.fab.dislike", "Dislike")}'>` +
    "<svg class='comment-mode-fab-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" +
    "<path d='M4 4h4v8H4zM9 12l3 6h4l-1-6h5l-2-8H9z' fill='currentColor'/>" +
    "</svg>" +
    "</button>" +
    `<button type='button' class='comment-mode-fab comment-mode-fab-like' aria-label='${t("comment_mode.fab.like", "Like")}'>` +
    "<svg class='comment-mode-fab-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" +
    "<path d='M4 12h4v8H4zM9 12l3-6h4l-1 6h5l-2 8H9z' fill='currentColor'/>" +
    "</svg>" +
    "</button>" +
    "</div>" +
    "</div>" +
    "</section>" +
    "<div class='comment-mode-fab-stack' aria-hidden='false'>" +
    `<button type='button' class='comment-mode-fab comment-mode-fab-main' aria-label='${t("comment_mode.fab.main", "Feedback")}'>` +
    "<svg class='comment-mode-fab-plus' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" +
    "<path d='M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z' fill='currentColor'/>" +
    "</svg>" +
    "</button>" +
    "</div>" +
    "</div>";

  const panel = root.querySelector(".comment-mode-panel");
  const backdrop = root.querySelector(".comment-mode-backdrop");
  const fabStack = root.querySelector(".comment-mode-fab-stack");
  const fabMain = root.querySelector(".comment-mode-fab-main");
  const likeFab = root.querySelector(".comment-mode-fab-like");
  const dislikeFab = root.querySelector(".comment-mode-fab-dislike");
  const submitButton = root.querySelector(".comment-mode-submit");
  const textarea = root.querySelector(".comment-mode-textarea");
  const status = root.querySelector(".comment-mode-status");
  const contextTitle = root.querySelector(".comment-mode-context-title");
  const contextSubtitle = root.querySelector(".comment-mode-context-subtitle");
  const contextChips = root.querySelector(".comment-mode-context-chips");
  const title = root.querySelector(".comment-mode-title");

  const state = {
    open: false,
    submitting: false,
    reaction: 0,
    context: inferGenericContext(),
    contextSignature: "",
    health: { ...DEFAULT_HEALTH }
  };

  function updateStaticText() {
    title.textContent = t("comment_mode.title", "Kommentar");
    textarea.placeholder = t("comment_mode.message.placeholder", "Was ist unklar, falsch oder stoert dich gerade?");
    submitButton.textContent = t("comment_mode.submit", "Senden");
    if (likeFab) likeFab.setAttribute("aria-label", t("comment_mode.fab.like", "Like"));
    if (dislikeFab) dislikeFab.setAttribute("aria-label", t("comment_mode.fab.dislike", "Dislike"));
    if (fabMain) fabMain.setAttribute("aria-label", t("comment_mode.fab.main", "Feedback"));
    syncUi();
  }

  function setStatus(message = "", type = "info") {
    const text = String(message || "").trim();
    status.textContent = text;
    status.classList.toggle("hidden", !text);
    status.dataset.state = text ? type : "";
  }

  function resetTransientUi(options = {}) {
    const keepReaction = options.keepReaction === true;
    if (!keepReaction) {
      state.reaction = 0;
    }
    setStatus("", "info");
  }

  function syncContextCard() {
    const summary = summarizeContext(state.context);
    contextSubtitle.textContent = summary.areaLabel;
    contextTitle.textContent = summary.title;
    if (contextChips) {
      contextChips.innerHTML = "";
      summary.chips.forEach((chip) => {
        const span = document.createElement("span");
        span.className = "comment-mode-context-chip";
        span.textContent = String(chip || "");
        contextChips.appendChild(span);
      });
      contextChips.classList.toggle("hidden", summary.chips.length === 0);
    }
  }

  function syncUi() {
    const text = String(textarea.value || "");
    submitButton.disabled = state.submitting || (!text.trim() && state.reaction === 0);
    textarea.disabled = state.submitting;
    if (likeFab) {
      likeFab.disabled = state.submitting;
      likeFab.classList.toggle("is-active", state.reaction === 1);
      likeFab.setAttribute("aria-pressed", state.reaction === 1 ? "true" : "false");
    }
    if (dislikeFab) {
      dislikeFab.disabled = state.submitting;
      dislikeFab.classList.toggle("is-active", state.reaction === -1);
      dislikeFab.setAttribute("aria-pressed", state.reaction === -1 ? "true" : "false");
    }
    if (fabStack) {
      fabStack.classList.remove("hidden");
      fabStack.setAttribute("aria-hidden", "false");
    }
    root.classList.toggle("is-open", state.open);
    panel.classList.toggle("is-open", state.open);
    panel.setAttribute("aria-hidden", state.open ? "false" : "true");
    backdrop.classList.add("hidden");
    document.body.classList.toggle("comment-mode-drawer-open", state.open);
    syncContextCard();
  }

  function refreshContext() {
    const bridge = getCommentBridge();
    const nextContext = bridge && typeof bridge.getContext === "function"
      ? bridge.getContext() || inferGenericContext()
      : inferGenericContext();
    const nextSignature = buildContextSignature(nextContext);
    const contextChanged = nextSignature !== state.contextSignature;
    state.context = nextContext;
    state.contextSignature = nextSignature;
    if (contextChanged) {
      resetTransientUi();
    }
    syncUi();
    if (state.open) {
      window.requestAnimationFrame(() => {
        syncBottomOffset();
      });
    }
  }

  function openPanel() {
    if (typeof window.__closeLeftDrawers === "function") {
      window.__closeLeftDrawers();
    }
    state.open = true;
    resetTransientUi();
    refreshContext();
    syncUi();
    window.setTimeout(() => {
      textarea.focus();
    }, 0);
  }

  function closePanel() {
    if (state.submitting) return;
    state.open = false;
    resetTransientUi();
    syncUi();
  }

  function buildPayload() {
    const text = String(textarea.value || "").trim();
    return {
      message: text,
      reaction: state.reaction,
      contextRef: {
        ...(state.context || inferGenericContext()),
        capturedAt: new Date().toISOString()
      },
      client: {
        pageUrl: window.location.href,
        pageTitle: document.title || "",
        userAgent: navigator.userAgent,
        language: navigator.language || "",
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };
  }

  async function submitComment() {
    const payload = buildPayload();
    if (!payload.message && payload.reaction === 0) {
      setStatus(t("comment_mode.status.message_required", "Bitte zuerst einen Kommentar eingeben oder Like/Dislike waehlen."), "error");
      return;
    }
    state.submitting = true;
    setStatus(t("comment_mode.status.submitting", "Kommentar wird gesendet ..."), "info");
    syncUi();
    try {
      refreshContext();
      const result = await submitFeedback(buildPayload());
      if (!result.ok) {
        throw new Error(result.error || t("comment_mode.status.failure", "Kommentar konnte nicht gesendet werden."));
      }
      textarea.value = "";
      state.reaction = 0;
      setStatus(
        t("comment_mode.status.success", "Kommentar gespeichert. Referenz: {id}", {
          id: result.submissionId || "n/a"
        }),
        "success"
      );
      syncUi();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("comment_mode.status.failure", "Kommentar konnte nicht gesendet werden."), "error");
    } finally {
      state.submitting = false;
      syncUi();
    }
  }

  function syncBottomOffset() {
    const submitBar = document.querySelector(".submit-bar");
    const submitVisible = submitBar && !submitBar.classList.contains("hidden");
    const submitHeight = submitVisible ? Math.ceil(submitBar.getBoundingClientRect().height) : 0;
    const baseOffset = submitVisible ? submitHeight + 28 : 20;
    root.style.setProperty("--comment-mode-bottom-offset", `${baseOffset}px`);
  }

  if (fabMain) {
    fabMain.addEventListener("click", () => {
      if (state.open) {
        closePanel();
        return;
      }
      openPanel();
    });
  }
  if (likeFab) {
    likeFab.addEventListener("click", () => {
      if (state.submitting) return;
      state.reaction = state.reaction === 1 ? 0 : 1;
      syncUi();
    });
  }
  if (dislikeFab) {
    dislikeFab.addEventListener("click", () => {
      if (state.submitting) return;
      state.reaction = state.reaction === -1 ? 0 : -1;
      syncUi();
    });
  }
  backdrop.addEventListener("click", closePanel);
  textarea.addEventListener("input", () => {
    syncUi();
  });
  submitButton.addEventListener("click", () => {
    submitComment().catch(() => {});
  });
  document.addEventListener("click", (event) => {
    if (!state.open || state.submitting) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (panel.contains(target)) return;
    if (fabStack && fabStack.contains(target)) return;
    closePanel();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.open) {
      event.preventDefault();
      closePanel();
    }
  });
  window.addEventListener("resize", syncBottomOffset);

  const bridge = getCommentBridge();
  if (bridge && typeof bridge.onContextChanged === "function") {
    bridge.onContextChanged((nextContext) => {
      const resolvedContext = nextContext || inferGenericContext();
      const nextSignature = buildContextSignature(resolvedContext);
      const contextChanged = nextSignature !== state.contextSignature;
      state.context = resolvedContext;
      state.contextSignature = nextSignature;
      if (contextChanged) {
        resetTransientUi();
      }
      if (state.open) {
        syncUi();
        window.requestAnimationFrame(() => {
          syncBottomOffset();
        });
      }
    });
  }

  const i18nBridge = getI18nBridge();
  if (i18nBridge && typeof i18nBridge.onLocaleChanged === "function") {
    i18nBridge.onLocaleChanged(() => {
      refreshContext();
      updateStaticText();
    });
  }

  const submitBar = document.querySelector(".submit-bar");
  if (submitBar && typeof MutationObserver === "function") {
    const submitBarObserver = new MutationObserver(() => {
      syncBottomOffset();
    });
    submitBarObserver.observe(submitBar, {
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }
  if (submitBar && typeof ResizeObserver === "function") {
    const submitBarResizeObserver = new ResizeObserver(() => {
      syncBottomOffset();
    });
    submitBarResizeObserver.observe(submitBar);
  }

  closePanel();
  refreshContext();
  syncBottomOffset();
  updateStaticText();
  syncUi();
  window.__closeCommentModeDrawer = () => {
    if (!state.open) return;
    state.open = false;
    syncUi();
  };
  return {
    refreshContext,
    async loadHealth() {
      return { ...state.health };
    }
  };
}

function initializeCommentModeRuntime() {
  if (window.__EasyPVCommentModeRuntime) return window.__EasyPVCommentModeRuntime;
  const runtime = createCommentModeRuntime();
  window.__EasyPVCommentModeRuntime = runtime;
  return runtime;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCommentModeRuntime, { once: true });
} else {
  initializeCommentModeRuntime();
}
