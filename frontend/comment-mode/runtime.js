const DEFAULT_HEALTH = Object.freeze({
  maxAttachments: 5,
  maxMessageLength: 2000,
  maxTotalUploadBytes: 25 * 1024 * 1024,
  storageMode: "local-archive",
  storageLabel: "Lokales Archiv",
  driveConfigured: false
});

function isHostedOnGithubPages() {
  return /\.github\.io$/i.test(String(window.location.hostname || "").trim());
}

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

function sanitizeFileList(files) {
  return Array.isArray(files) ? files.filter((file) => file instanceof File) : [];
}

function formatBytes(value) {
  const size = Math.max(0, Number(value) || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

function summarizeContext(context = {}) {
  const safe = context && typeof context === "object" ? context : {};
  const surface = String(safe.surface || "generic").trim() || "generic";
  const viewLabel = String(safe.viewLabel || safe.pageTitle || "Kommentar").trim() || "Kommentar";
  const chips = [];
  if (safe.ticketId) chips.push(`Ticket ${safe.ticketId}`);
  if (safe.questionId) chips.push(`Frage ${safe.questionId}`);
  if (safe.entityId && !chips.includes(`Ticket ${safe.entityId}`) && !chips.includes(`Frage ${safe.entityId}`)) {
    chips.push(`ID ${safe.entityId}`);
  }
  if (safe.folder) chips.push(String(safe.folder));
  if (safe.deckKey) chips.push(`Deck ${safe.deckKey}`);
  return {
    title: viewLabel,
    subtitle: literal(
      {
        training: "DoomScrollQuiz",
        training_question: "DoomScrollQuiz",
        scenario: "Ticket / Aufgabe",
        presenter: "Babylon Presenter",
        challenge: "Challenge",
        home: "Startseite",
        generic: "Allgemeiner Kontext"
      }[surface] || "Allgemeiner Kontext"
    ),
    chips
  };
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
    "<h3 class='comment-mode-context-title'></h3>" +
    "<p class='comment-mode-context-subtitle'></p>" +
    "</section>" +
    "<label class='comment-mode-field'>" +
    `<textarea class='comment-mode-textarea' rows='6' maxlength='${DEFAULT_HEALTH.maxMessageLength}' placeholder='${t("comment_mode.message.placeholder", "Was ist unklar, falsch oder stoert dich gerade?")}'>` +
    "</textarea>" +
    "</label>" +
    "<div class='comment-mode-tools'>" +
    `<button type='button' class='comment-mode-attach-button' aria-label='${t("comment_mode.attach.aria", "Dateien hinzufuegen")}'>` +
    "<span class='comment-mode-attach-icon' aria-hidden='true'>+</span>" +
    `<span class='comment-mode-attach-label'>${t("comment_mode.attach.label", "Dateien anhaengen")}</span>` +
    "</button>" +
    "<input class='comment-mode-file-input' type='file' multiple />" +
    "</div>" +
    "<ul class='comment-mode-file-list hidden'></ul>" +
    "<p class='comment-mode-status hidden'></p>" +
    "<div class='comment-mode-footer'>" +
    "<div class='comment-mode-footer-reactions'>" +
    `<button type='button' class='comment-mode-fab comment-mode-fab-like' aria-label='${t("comment_mode.fab.like", "Like")}'>` +
    "<svg class='comment-mode-fab-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" +
    "<path d='M4 12h4v8H4zM9 12l3-6h4l-1 6h5l-2 8H9z' fill='currentColor'/>" +
    "</svg>" +
    "</button>" +
    `<button type='button' class='comment-mode-fab comment-mode-fab-dislike' aria-label='${t("comment_mode.fab.dislike", "Dislike")}'>` +
    "<svg class='comment-mode-fab-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" +
    "<path d='M4 4h4v8H4zM9 12l3 6h4l-1-6h5l-2-8H9z' fill='currentColor'/>" +
    "</svg>" +
    "</button>" +
    "</div>" +
    "<div class='comment-mode-actions'>" +
    `<button type='button' class='comment-mode-submit'>${t("comment_mode.submit", "Senden")}</button>` +
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
  const attachButton = root.querySelector(".comment-mode-attach-button");
  const fileInput = root.querySelector(".comment-mode-file-input");
  const textarea = root.querySelector(".comment-mode-textarea");
  const status = root.querySelector(".comment-mode-status");
  const fileList = root.querySelector(".comment-mode-file-list");
  const contextTitle = root.querySelector(".comment-mode-context-title");
  const contextSubtitle = root.querySelector(".comment-mode-context-subtitle");
  const title = root.querySelector(".comment-mode-title");

  const state = {
    open: false,
    submitting: false,
    reaction: 0,
    files: [],
    dragActive: false,
    context: inferGenericContext(),
    health: { ...DEFAULT_HEALTH },
    healthLoaded: false,
    healthPromise: null
  };

  function updateStaticText() {
    title.textContent = t("comment_mode.title", "Kommentar");
    textarea.placeholder = t("comment_mode.message.placeholder", "Was ist unklar, falsch oder stoert dich gerade?");
    const attachLabel = attachButton.querySelector(".comment-mode-attach-label");
    if (attachLabel) {
      attachLabel.textContent = t("comment_mode.attach.label", "Dateien anhaengen");
    }
    submitButton.textContent = t("comment_mode.submit", "Senden");
    if (likeFab) {
      likeFab.setAttribute("aria-label", t("comment_mode.fab.like", "Like"));
    }
    if (dislikeFab) {
      dislikeFab.setAttribute("aria-label", t("comment_mode.fab.dislike", "Dislike"));
    }
    if (fabMain) {
      fabMain.setAttribute("aria-label", t("comment_mode.fab.main", "Feedback"));
    }
    syncUi();
  }

  function getCombinedAttachmentBytes(files = state.files) {
    return sanitizeFileList(files).reduce((sum, file) => sum + Math.max(0, Number(file.size) || 0), 0);
  }

  function setStatus(message = "", type = "info") {
    const text = String(message || "").trim();
    status.textContent = text;
    status.classList.toggle("hidden", !text);
    status.dataset.state = text ? type : "";
  }

  function removeFileAt(index) {
    state.files = state.files.filter((_, fileIndex) => fileIndex !== index);
    syncUi();
  }

  function syncFileList() {
    const files = sanitizeFileList(state.files);
    fileList.innerHTML = "";
    fileList.classList.toggle("hidden", files.length === 0);
    files.forEach((file, index) => {
      const item = document.createElement("li");
      item.className = "comment-mode-file-item";
      const meta = document.createElement("div");
      meta.className = "comment-mode-file-meta";
      const name = document.createElement("strong");
      name.textContent = file.name;
      const detail = document.createElement("span");
      detail.textContent = `${file.type || "Datei"} · ${formatBytes(file.size)}`;
      meta.append(name, detail);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "comment-mode-file-remove";
      remove.textContent = t("comment_mode.remove_file", "Entfernen");
      remove.addEventListener("click", () => {
        removeFileAt(index);
      });
      item.append(meta, remove);
      fileList.appendChild(item);
    });
  }

  function syncContextCard() {
    const summary = summarizeContext(state.context);
    contextTitle.textContent = summary.title;
    contextSubtitle.textContent = summary.subtitle;
  }

  function syncUi() {
    const text = String(textarea.value || "");
    submitButton.disabled = state.submitting || !text.trim();
    attachButton.disabled = state.submitting || state.files.length >= Number(state.health.maxAttachments || DEFAULT_HEALTH.maxAttachments);
    attachButton.classList.toggle("is-dragging", state.dragActive);
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
    const surface = String(state.context?.surface || "");
    const isGateSurface = surface === "training" || surface === "training_question" || surface === "scenario";
    const isEvaluated = Boolean(state.context?.isEvaluated);
    const fabVisible = !isGateSurface || isEvaluated;
    if (!fabVisible && state.open) {
      state.open = false;
    }
    if (fabStack) {
      fabStack.classList.toggle("hidden", !fabVisible);
      fabStack.setAttribute("aria-hidden", fabVisible ? "false" : "true");
    }
    root.classList.toggle("is-open", state.open);
    panel.classList.toggle("is-open", state.open);
    panel.setAttribute("aria-hidden", state.open ? "false" : "true");
    backdrop.classList.add("hidden");
    document.body.classList.toggle("comment-mode-drawer-open", state.open);
    syncContextCard();
    syncFileList();
  }

  async function loadHealth(force = false) {
    if (!force && state.healthLoaded) return state.health;
    if (!force && state.healthPromise) return state.healthPromise;
    state.healthPromise = fetch("/api/comment-mode/health", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Health-Check fehlgeschlagen (${response.status})`);
        }
        return response.json();
      })
      .then((payload) => {
        state.healthLoaded = true;
        state.health = {
          ...DEFAULT_HEALTH,
          ...(payload && typeof payload === "object" ? payload : {})
        };
        textarea.maxLength = Number(state.health.maxMessageLength || DEFAULT_HEALTH.maxMessageLength);
        if (!state.health.driveConfigured && state.health.storageMode !== "google-drive") {
          setStatus(t("comment_mode.status.local_archive", "Server archiviert aktuell lokal. Google Drive ist noch nicht konfiguriert."), "warning");
        }
        syncUi();
        return state.health;
      })
      .catch((error) => {
        state.healthLoaded = false;
        state.health = { ...DEFAULT_HEALTH };
        setStatus(error instanceof Error ? error.message : t("comment_mode.status.server_unreachable", "Comment-Mode-Server ist gerade nicht erreichbar."), "error");
        syncUi();
        return state.health;
      })
      .finally(() => {
        state.healthPromise = null;
      });
    return state.healthPromise;
  }

  function refreshContext() {
    const bridge = getCommentBridge();
    state.context = bridge && typeof bridge.getContext === "function"
      ? bridge.getContext() || inferGenericContext()
      : inferGenericContext();
    syncUi();
  }

  function openPanel() {
    if (typeof window.__closeLeftDrawers === "function") {
      window.__closeLeftDrawers();
    }
    state.open = true;
    refreshContext();
    loadHealth().catch(() => {});
    syncUi();
    window.setTimeout(() => {
      textarea.focus();
    }, 0);
  }

  function closePanel() {
    if (state.submitting) return;
    state.open = false;
    syncUi();
  }

  function appendFiles(nextFiles) {
    const existing = sanitizeFileList(state.files);
    const additions = sanitizeFileList(nextFiles);
    if (!additions.length) return;
    const uniqueByKey = new Map(existing.map((file) => [`${file.name}::${file.size}::${file.lastModified}`, file]));
    additions.forEach((file) => {
      uniqueByKey.set(`${file.name}::${file.size}::${file.lastModified}`, file);
    });
    const merged = [...uniqueByKey.values()];
    const maxAttachments = Number(state.health.maxAttachments || DEFAULT_HEALTH.maxAttachments);
    const trimmed = merged.slice(0, maxAttachments);
    const maxBytes = Number(state.health.maxTotalUploadBytes || DEFAULT_HEALTH.maxTotalUploadBytes);
    while (getCombinedAttachmentBytes(trimmed) > maxBytes && trimmed.length) {
      trimmed.pop();
    }
    state.files = trimmed;
    if (merged.length > trimmed.length) {
      setStatus(
        t("comment_mode.status.file_limit", "Es werden nur die ersten {count} Dateien innerhalb des Upload-Limits uebernommen.", {
          count: trimmed.length
        }),
        "warning"
      );
    }
    syncUi();
  }

  function setDragActive(value) {
    state.dragActive = value;
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
    if (!payload.message) {
      setStatus(t("comment_mode.status.message_required", "Bitte zuerst einen Kommentar eingeben."), "error");
      return;
    }
    await loadHealth();
    state.submitting = true;
    setStatus(t("comment_mode.status.submitting", "Kommentar wird gesendet ..."), "info");
    syncUi();
    try {
      refreshContext();
      const formData = new FormData();
      formData.append("payload", JSON.stringify(buildPayload()));
      sanitizeFileList(state.files).forEach((file) => {
        formData.append("attachments[]", file, file.name);
      });
      const response = await fetch("/api/comment-mode/submissions", {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || `Kommentar konnte nicht gespeichert werden (${response.status})`);
      }
      textarea.value = "";
      state.files = [];
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
  attachButton.addEventListener("click", () => {
    if (!state.submitting) fileInput.click();
  });
  attachButton.addEventListener("dragenter", (event) => {
    event.preventDefault();
    if (state.submitting) return;
    setDragActive(true);
  });
  attachButton.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (state.submitting) return;
    setDragActive(true);
  });
  attachButton.addEventListener("dragleave", (event) => {
    event.preventDefault();
    if (state.submitting) return;
    setDragActive(false);
  });
  attachButton.addEventListener("drop", (event) => {
    event.preventDefault();
    if (state.submitting) return;
    setDragActive(false);
    const dropped = [...(event.dataTransfer?.files || [])];
    if (dropped.length) {
      appendFiles(dropped);
    }
  });
  fileInput.addEventListener("change", () => {
    appendFiles([...fileInput.files]);
    fileInput.value = "";
  });
  textarea.addEventListener("input", () => {
    syncUi();
  });
  submitButton.addEventListener("click", () => {
    submitComment().catch(() => {});
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
      state.context = nextContext || inferGenericContext();
      if (state.open) {
        syncUi();
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
  loadHealth().catch(() => {});
  window.__closeCommentModeDrawer = () => {
    if (!state.open) return;
    state.open = false;
    syncUi();
  };
  return {
    refreshContext,
    loadHealth
  };
}

function initializeCommentModeRuntime() {
  if (window.__EasyPVCommentModeRuntime) return window.__EasyPVCommentModeRuntime;
  if (isHostedOnGithubPages()) {
    const root = document.getElementById("commentModeRoot");
    if (root) {
      root.innerHTML = "";
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
    }
    window.__closeCommentModeDrawer = () => {};
    window.__EasyPVCommentModeRuntime = {
      disabled: true,
      reason: "github-pages",
      refreshContext() {},
      async loadHealth() {
        return { ...DEFAULT_HEALTH };
      }
    };
    return window.__EasyPVCommentModeRuntime;
  }
  const runtime = createCommentModeRuntime();
  window.__EasyPVCommentModeRuntime = runtime;
  return runtime;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCommentModeRuntime, { once: true });
} else {
  initializeCommentModeRuntime();
}
