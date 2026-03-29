(function initChallengeRuntime(global) {
  "use strict";

  const controllers = new Map();

  function formatTemplate(template = "", params = null) {
    const source = String(template || "");
    if (!params || typeof params !== "object") return source;
    return source.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token) => {
      if (!Object.prototype.hasOwnProperty.call(params, token)) return match;
      return String(params[token] ?? "");
    });
  }

  function getI18nBridge() {
    return global.EasyPVUiI18nBridge && typeof global.EasyPVUiI18nBridge === "object"
      ? global.EasyPVUiI18nBridge
      : null;
  }

  function t(messageKey, fallback = "", params = null) {
    const bridge = getI18nBridge();
    if (bridge && typeof bridge.t === "function") {
      return bridge.t(messageKey, fallback, params);
    }
    return formatTemplate(String(fallback || messageKey), params);
  }

  function lt(value = "") {
    const source = String(value ?? "");
    const bridge = getI18nBridge();
    if (bridge && typeof bridge.literal === "function") {
      return bridge.literal(source);
    }
    return source;
  }

  function onLocaleChanged(listener) {
    const bridge = getI18nBridge();
    if (bridge && typeof bridge.onLocaleChanged === "function") {
      return bridge.onLocaleChanged(listener);
    }
    return () => {};
  }

  const OUTCOME_CONFIG = Object.freeze({
    success: Object.freeze({
      overlayKicker: "Runde geschafft",
      defaultTitle: "Sauber einsortiert",
      defaultStatusText: "Runde beendet. Alle Karten sind korrekt versorgt.",
      defaultTone: "ok",
      sound: "complete"
    }),
    wrong: Object.freeze({
      overlayKicker: "Nicht korrekt",
      defaultTitle: "Diesmal noch nicht korrekt",
      defaultStatusText: "Runde beendet. Der Versuch war fachlich nicht korrekt.",
      defaultTone: "bad",
      sound: "error"
    }),
    timeout: Object.freeze({
      overlayKicker: "Zeit abgelaufen",
      defaultTitle: "Noch nicht ganz geschafft",
      defaultStatusText: "Die Zeit ist abgelaufen. Du kannst direkt neu starten.",
      defaultTone: "warn",
      sound: "error"
    })
  });

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function formatTimeLabel(remainingMs) {
    const totalSeconds = Math.max(0, Math.ceil(Number(remainingMs || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function isTerminalStatus(status) {
    return status === "success" || status === "wrong" || status === "timeout";
  }

  function normalizeOutcome(result = {}) {
    const explicitOutcome = String(result.outcome || result.resultType || "").trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(OUTCOME_CONFIG, explicitOutcome)) {
      return explicitOutcome;
    }
    if (result.success === false) {
      return "wrong";
    }
    return "success";
  }

  function createAudioEngine() {
    let context = null;

    function ensureContext() {
      const AudioCtor = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtor) return null;
      if (!context) context = new AudioCtor();
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }
      return context;
    }

    function play(kind = "tap") {
      const ctx = ensureContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;
      const config = {
        tap: { frequency: 432, length: 0.07, volume: 0.032, type: "triangle" },
        success: { frequency: 622, length: 0.12, volume: 0.042, type: "triangle" },
        error: { frequency: 196, length: 0.14, volume: 0.038, type: "sawtooth" },
        complete: { frequency: 784, length: 0.2, volume: 0.05, type: "sine" }
      }[kind] || { frequency: 432, length: 0.08, volume: 0.03, type: "triangle" };
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(config.volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + config.length);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + config.length + 0.02);
    }

    return Object.freeze({ play });
  }

  function registerType(type, controller) {
    const normalizedType = String(type || "").trim().toLowerCase();
    if (!normalizedType) {
      throw new Error(lt("Challenge-Typ fehlt."));
    }
    if (!controller || typeof controller.mount !== "function") {
      throw new Error(lt(`Challenge-Controller fuer ${normalizedType} ist unvollstaendig.`));
    }
    controllers.set(normalizedType, controller);
  }

  function mount(container, deck, options = {}) {
    if (!(container instanceof HTMLElement)) {
      throw new Error(lt("Kein gueltiger Challenge-Container uebergeben."));
    }

    const normalizedDeck = deck && typeof deck === "object" ? deck : null;
    const controller = controllers.get(String(normalizedDeck?.type || "").trim().toLowerCase());
    if (!normalizedDeck || !controller) {
      throw new Error(lt("Kein passender Challenge-Typ registriert."));
    }

    container.innerHTML = "";
    const audioEngine = createAudioEngine();
    const session = {
      deck: normalizedDeck,
      status: "intro",
      score: 0,
      soundEnabled: true,
      startedAtMs: 0,
      remainingMs: Math.max(1000, Number(normalizedDeck.timeLimitMs || (Number(normalizedDeck.timeLimitSec || 90) * 1000))),
      timerId: 0,
      completion: null
    };

    const root = createNode("section", "challenge-shell");
    const header = createNode("header", "challenge-shell-head");
    const kicker = createNode("p", "challenge-shell-kicker", lt(normalizedDeck.kicker || "Challenge"));
    const title = createNode("h2", "challenge-shell-title", lt(normalizedDeck.title || "Challenge"));
    const subtitle = createNode("p", "challenge-shell-subtitle", lt(normalizedDeck.subtitle || normalizedDeck.description || ""));
    const statRow = createNode("div", "challenge-shell-stats");
    const timerCard = createNode("div", "challenge-stat-card");
    const timerLabel = createNode("span", "challenge-stat-label", lt("Timer"));
    const timerValue = createNode("strong", "challenge-stat-value", formatTimeLabel(session.remainingMs));
    timerCard.append(timerLabel, timerValue);
    const scoreCard = createNode("div", "challenge-stat-card");
    const scoreLabel = createNode("span", "challenge-stat-label", lt(normalizedDeck.pointsLabel || "Punkte"));
    const scoreValue = createNode("strong", "challenge-stat-value", "0");
    scoreCard.append(scoreLabel, scoreValue);
    const soundButton = createNode("button", "challenge-sound-toggle");
    soundButton.type = "button";
    statRow.append(timerCard, scoreCard, soundButton);
    header.append(kicker, title);
    if (subtitle.textContent) header.appendChild(subtitle);
    header.appendChild(statRow);

    const panel = createNode("section", "panel challenge-panel");
    const panelStatus = createNode("div", "challenge-panel-status");
    const statusText = createNode("p", "challenge-panel-status-text", lt("Bereit fuer den lokalen Preview-Lauf."));
    const detailText = createNode("p", "challenge-panel-detail-text", "");
    panelStatus.append(statusText, detailText);
    const stageFrame = createNode("div", "challenge-stage-frame");
    const stageMount = createNode("div", "challenge-stage-mount");
    const overlay = createNode("div", "challenge-overlay");
    const overlayCard = createNode("div", "challenge-overlay-card");
    const overlayKicker = createNode("span", "challenge-overlay-kicker", lt("Challenge V1"));
    const overlayTitle = createNode("h3", "challenge-overlay-title", lt(normalizedDeck.introTitle || normalizedDeck.title || "Challenge"));
    const overlayBody = createNode("p", "challenge-overlay-body", lt(normalizedDeck.introText || normalizedDeck.description || ""));
    const overlayTips = createNode("ul", "challenge-overlay-tips");
    const overlayActions = createNode("div", "challenge-overlay-actions");
    const primaryButton = createNode("button", "btn-primary challenge-overlay-primary");
    primaryButton.type = "button";
    const secondaryButton = createNode("button", "challenge-overlay-secondary");
    secondaryButton.type = "button";
    overlayActions.append(primaryButton, secondaryButton);
    overlayCard.append(overlayKicker, overlayTitle);
    if (overlayBody.textContent) overlayCard.appendChild(overlayBody);
    overlayCard.append(overlayTips, overlayActions);
    overlay.appendChild(overlayCard);
    stageFrame.append(stageMount, overlay);
    panel.append(panelStatus, stageFrame);
    root.append(header, panel);
    container.appendChild(root);

    let controllerHandle = null;

    function setSoundEnabled(enabled) {
      session.soundEnabled = Boolean(enabled);
      soundButton.setAttribute("aria-pressed", session.soundEnabled ? "true" : "false");
      soundButton.textContent = lt(`${normalizedDeck.soundLabel || "Sound"}: ${session.soundEnabled ? "an" : "aus"}`);
    }

    function setStatusText(text, tone = "") {
      statusText.textContent = lt(String(text || "").trim() || "Bereit.");
      panelStatus.dataset.tone = String(tone || "").trim().toLowerCase();
    }

    function setDetailText(text) {
      detailText.textContent = lt(String(text || "").trim());
      detailText.classList.toggle("hidden", !detailText.textContent);
    }

    function setScore(nextValue) {
      session.score = Math.max(0, Math.round(Number(nextValue) || 0));
      scoreValue.textContent = String(session.score);
    }

    function addScore(delta) {
      setScore(session.score + (Number(delta) || 0));
    }

    function playSound(kind) {
      if (!session.soundEnabled) return;
      audioEngine.play(kind);
    }

    function clearTimer() {
      if (!session.timerId) return;
      global.clearInterval(session.timerId);
      session.timerId = 0;
    }

    function updateTimer() {
      timerValue.textContent = formatTimeLabel(session.remainingMs);
      timerCard.classList.toggle("is-warning", session.status === "running" && session.remainingMs <= 15000);
    }

    function renderOverlay() {
      overlayTips.innerHTML = "";
      overlay.classList.remove("is-hidden");
      root.dataset.challengeState = session.status;
      if (session.status === "intro") {
        overlayKicker.textContent = lt(normalizedDeck.kicker || "Challenge");
        overlayTitle.textContent = lt(normalizedDeck.introTitle || normalizedDeck.title || "Challenge");
        overlayBody.textContent = lt(normalizedDeck.introText || normalizedDeck.description || "");
        for (const tip of Array.isArray(normalizedDeck.tips) ? normalizedDeck.tips : []) {
          const item = createNode("li", "", lt(tip));
          overlayTips.appendChild(item);
        }
        primaryButton.textContent = lt("Runde starten");
        secondaryButton.textContent = lt("Zur Startseite");
        secondaryButton.classList.remove("hidden");
        return;
      }

      if (isTerminalStatus(session.status)) {
        const completion = session.completion || {};
        const outcomeConfig = OUTCOME_CONFIG[completion.outcome] || OUTCOME_CONFIG.success;
        overlayKicker.textContent = lt(completion.overlayKicker || outcomeConfig.overlayKicker);
        overlayTitle.textContent = lt(completion.title || outcomeConfig.defaultTitle);
        overlayBody.textContent = lt(completion.summary || "");
        const lines = Array.isArray(completion.lines) ? completion.lines : [];
        for (const line of lines) {
          overlayTips.appendChild(createNode("li", "", lt(line)));
        }
        primaryButton.textContent = lt("Neu starten");
        secondaryButton.textContent = lt("Zur Startseite");
        secondaryButton.classList.remove("hidden");
        return;
      }

      overlay.classList.add("is-hidden");
    }

    function finish(result = {}) {
      if (isTerminalStatus(session.status)) return;
      clearTimer();
      if (controllerHandle && typeof controllerHandle.stop === "function") {
        controllerHandle.stop();
      }
      const outcome = normalizeOutcome(result);
      const outcomeConfig = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.success;
      session.status = outcome;
      session.completion = {
        outcome,
        overlayKicker: String(result.overlayKicker || "").trim(),
        title: String(result.title || "").trim(),
        summary: String(result.summary || "").trim(),
        lines: Array.isArray(result.lines) ? result.lines.map((entry) => String(entry || "").trim()).filter(Boolean) : [],
        statusText: String(result.statusText || "").trim(),
        statusTone: String(result.statusTone || "").trim().toLowerCase()
      };
      if (Object.prototype.hasOwnProperty.call(result, "detailText")) {
        setDetailText(result.detailText);
      }
      setStatusText(
        session.completion.statusText || outcomeConfig.defaultStatusText,
        session.completion.statusTone || outcomeConfig.defaultTone
      );
      playSound(outcomeConfig.sound);
      renderOverlay();
    }

    function tick() {
      if (session.status !== "running") return;
      const elapsedMs = Date.now() - session.startedAtMs;
      const totalMs = Math.max(1000, Number(normalizedDeck.timeLimitMs || (Number(normalizedDeck.timeLimitSec || 90) * 1000)));
      session.remainingMs = Math.max(0, totalMs - elapsedMs);
      updateTimer();
      if (session.remainingMs <= 0) {
        finish({
          outcome: "timeout",
          title: "Die Runde braucht noch einen Anlauf",
          summary: "Der lokale Preview-Flow bleibt offen, aber diese Runde ist wegen des Timers beendet.",
          lines: [
            t("challenge.timeout.score", "Score: {score}", { score: session.score }),
            t("challenge.timeout.type", "Challenge-Type: {type}", { type: normalizedDeck.type }),
            "Neu starten ist jederzeit moeglich."
          ]
        });
      }
    }

    function startRound() {
      if (session.status === "running") return;
      session.status = "running";
      session.completion = null;
      session.remainingMs = Math.max(1000, Number(normalizedDeck.timeLimitMs || (Number(normalizedDeck.timeLimitSec || 90) * 1000)));
      session.startedAtMs = Date.now();
      updateTimer();
      renderOverlay();
      setStatusText("Ziehe die Karte aus dem Zentrum auf ein Ziel oder auf den Ablagestapel.", "");
      playSound("tap");
      if (controllerHandle && typeof controllerHandle.start === "function") {
        controllerHandle.start();
      }
      clearTimer();
      session.timerId = global.setInterval(tick, 250);
    }

    setSoundEnabled(true);
    updateTimer();

    const api = Object.freeze({
      session,
      setStatusText,
      setDetailText,
      setScore,
      addScore,
      playSound,
      finish
    });

    controllerHandle = controller.mount(stageMount, normalizedDeck, api) || null;
    const stopLocaleSync = onLocaleChanged(() => {
      kicker.textContent = lt(normalizedDeck.kicker || "Challenge");
      title.textContent = lt(normalizedDeck.title || "Challenge");
      subtitle.textContent = lt(normalizedDeck.subtitle || normalizedDeck.description || "");
      timerLabel.textContent = lt("Timer");
      scoreLabel.textContent = lt(normalizedDeck.pointsLabel || "Punkte");
      setSoundEnabled(session.soundEnabled);
      if (session.status === "intro") {
        setStatusText("Bereit fuer den lokalen Preview-Lauf.", panelStatus.dataset.tone || "");
      } else if (session.status === "running") {
        setStatusText("Ziehe die Karte aus dem Zentrum auf ein Ziel oder auf den Ablagestapel.", panelStatus.dataset.tone || "");
      } else if (isTerminalStatus(session.status)) {
        const outcomeConfig = OUTCOME_CONFIG[session.completion?.outcome] || OUTCOME_CONFIG[session.status] || OUTCOME_CONFIG.success;
        setStatusText(session.completion?.statusText || outcomeConfig.defaultStatusText, panelStatus.dataset.tone || outcomeConfig.defaultTone);
      }
      setDetailText(detailText.textContent);
      renderOverlay();
    });

    primaryButton.addEventListener("click", () => {
      if (session.status === "intro") {
        startRound();
        return;
      }
      if (typeof options.onRestart === "function") {
        options.onRestart(normalizedDeck.id);
      }
    });

    secondaryButton.addEventListener("click", () => {
      if (typeof options.onExit === "function") {
        options.onExit();
      }
    });

    soundButton.addEventListener("click", () => {
      setSoundEnabled(!session.soundEnabled);
    });

    renderOverlay();

    return {
      deck: normalizedDeck,
      session,
      destroy() {
        stopLocaleSync();
        clearTimer();
        if (controllerHandle && typeof controllerHandle.destroy === "function") {
          controllerHandle.destroy();
        }
      }
    };
  }

  global.ChallengeRuntime = Object.freeze({
    registerType,
    mount
  });
})(window);
