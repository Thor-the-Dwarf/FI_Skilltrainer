(function initPresenterRuntime(global) {
  "use strict";

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

  const BABYLON_SCRIPT_SOURCES = Object.freeze([
    Object.freeze({
      src: "./frontend/vendor/vendor/babylon/babylon.js",
      label: "Babylon.js lokal"
    }),
    Object.freeze({
      src: "https://cdn.babylonjs.com/babylon.js",
      label: "Babylon.js CDN"
    }),
    Object.freeze({
      src: "https://cdn.jsdelivr.net/npm/babylonjs@7.48.3/babylon.js",
      label: "Babylon.js CDN"
    })
  ]);
  const externalScriptPromisesBySrc = Object.create(null);
  const SVG_NS = "http://www.w3.org/2000/svg";

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function createSvgNode(tagName, attributes = {}) {
    const node = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      node.setAttribute(key, String(value));
    });
    return node;
  }

  function createPresenterControlIcon(iconName) {
    const svg = createSvgNode("svg", {
      class: "presenter-control-button-glyph",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.8",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false"
    });

    switch (String(iconName || "").trim()) {
      case "loading":
        svg.append(
          createSvgNode("path", { d: "M12 4.75a7.25 7.25 0 1 0 7.25 7.25" }),
          createSvgNode("circle", { cx: "12", cy: "4.75", r: "1.35", fill: "currentColor", stroke: "none" })
        );
        break;
      case "pause":
        svg.append(
          createSvgNode("path", { d: "M9 7v10" }),
          createSvgNode("path", { d: "M15 7v10" })
        );
        break;
      case "blocked":
        svg.append(
          createSvgNode("circle", { cx: "12", cy: "12", r: "7.25" }),
          createSvgNode("path", { d: "M8.25 15.75 15.75 8.25" })
        );
        break;
      case "restart":
        svg.append(
          createSvgNode("path", { d: "M8 7.5A7 7 0 1 1 5 13" }),
          createSvgNode("path", { d: "M8 4.75V8.5H4.25" })
        );
        break;
      case "replay":
        svg.append(
          createSvgNode("path", { d: "M16 7.5A7 7 0 1 0 19 13" }),
          createSvgNode("path", { d: "M16 4.75V8.5h3.75" })
        );
        break;
      case "edit":
        svg.append(
          createSvgNode("path", { d: "M6.75 16.75 16.6 6.9" }),
          createSvgNode("path", { d: "M15.25 5.55 18.45 8.75" }),
          createSvgNode("path", { d: "M6 18l3.55-.7L17.7 9.15" }),
          createSvgNode("path", { d: "M5.75 18.25h12.5" })
        );
        break;
      case "save":
        svg.append(
          createSvgNode("path", { d: "M6.5 5.75h9l2 2v10.5H6.5Z" }),
          createSvgNode("path", { d: "M9 5.75v4.5h5.25v-4.5" }),
          createSvgNode("path", { d: "M9 16h6" }),
          createSvgNode("path", { d: "m9.2 13.1 1.65 1.65 3.35-3.35" })
        );
        break;
      case "cancel":
        svg.append(
          createSvgNode("circle", { cx: "12", cy: "12", r: "7.25" }),
          createSvgNode("path", { d: "M9.25 9.25 14.75 14.75" }),
          createSvgNode("path", { d: "M14.75 9.25 9.25 14.75" })
        );
        break;
      case "camera-save":
        svg.append(
          createSvgNode("path", { d: "M7.25 9.25h9.5a1.75 1.75 0 0 1 1.75 1.75v5a1.75 1.75 0 0 1-1.75 1.75h-9.5A1.75 1.75 0 0 1 5.5 16v-5a1.75 1.75 0 0 1 1.75-1.75Z" }),
          createSvgNode("path", { d: "M9.2 9.25 10.35 7.5h3.3l1.15 1.75" }),
          createSvgNode("circle", { cx: "12", cy: "13.25", r: "2.1" }),
          createSvgNode("path", { d: "m17.2 6.25 1.2 1.2 2.1-2.1" })
        );
        break;
      case "recenter":
        svg.append(
          createSvgNode("circle", { cx: "12", cy: "12", r: "5.75" }),
          createSvgNode("path", { d: "M12 4.5v2.25" }),
          createSvgNode("path", { d: "M12 17.25v2.25" }),
          createSvgNode("path", { d: "M4.5 12h2.25" }),
          createSvgNode("path", { d: "M17.25 12h2.25" }),
          createSvgNode("circle", { cx: "12", cy: "12", r: "1.4", fill: "currentColor", stroke: "none" })
        );
        break;
      case "jumps-off":
        svg.append(
          createSvgNode("circle", { cx: "7.25", cy: "7.5", r: "1.25", fill: "currentColor", stroke: "none" }),
          createSvgNode("circle", { cx: "7.25", cy: "12", r: "1.25", fill: "currentColor", stroke: "none" }),
          createSvgNode("circle", { cx: "7.25", cy: "16.5", r: "1.25", fill: "currentColor", stroke: "none" }),
          createSvgNode("path", { d: "M10 7.5h6.5" }),
          createSvgNode("path", { d: "M13.75 5.75 16.5 7.5l-2.75 1.75" }),
          createSvgNode("path", { d: "M10 12h6.5" }),
          createSvgNode("path", { d: "M13.75 10.25 16.5 12l-2.75 1.75" }),
          createSvgNode("path", { d: "M10 16.5h6.5" }),
          createSvgNode("path", { d: "M13.75 14.75 16.5 16.5l-2.75 1.75" }),
          createSvgNode("path", { d: "M6 18 18 6" })
        );
        break;
      case "jumps-on":
        svg.append(
          createSvgNode("circle", { cx: "7.25", cy: "7.5", r: "1.25", fill: "currentColor", stroke: "none" }),
          createSvgNode("circle", { cx: "7.25", cy: "12", r: "1.25", fill: "currentColor", stroke: "none" }),
          createSvgNode("circle", { cx: "7.25", cy: "16.5", r: "1.25", fill: "currentColor", stroke: "none" }),
          createSvgNode("path", { d: "M10 7.5h6.5" }),
          createSvgNode("path", { d: "M13.75 5.75 16.5 7.5l-2.75 1.75" }),
          createSvgNode("path", { d: "M10 12h6.5" }),
          createSvgNode("path", { d: "M13.75 10.25 16.5 12l-2.75 1.75" }),
          createSvgNode("path", { d: "M10 16.5h6.5" }),
          createSvgNode("path", { d: "M13.75 14.75 16.5 16.5l-2.75 1.75" })
        );
        break;
      case "studio":
        svg.append(
          createSvgNode("path", { d: "M7 6.25v11.5" }),
          createSvgNode("path", { d: "M12 6.25v11.5" }),
          createSvgNode("path", { d: "M17 6.25v11.5" }),
          createSvgNode("circle", { cx: "7", cy: "9", r: "1.5", fill: "currentColor", stroke: "none" }),
          createSvgNode("circle", { cx: "12", cy: "14.5", r: "1.5", fill: "currentColor", stroke: "none" }),
          createSvgNode("circle", { cx: "17", cy: "10.5", r: "1.5", fill: "currentColor", stroke: "none" })
        );
        break;
      case "volume-off":
        svg.append(
          createSvgNode("path", { d: "M5.75 10.25h3.25L13 6.75v10.5L9 13.75H5.75Z" }),
          createSvgNode("path", { d: "M16 9 19 15" }),
          createSvgNode("path", { d: "M19 9 16 15" })
        );
        break;
      case "volume-on":
        svg.append(
          createSvgNode("path", { d: "M5.75 10.25h3.25L13 6.75v10.5L9 13.75H5.75Z" }),
          createSvgNode("path", { d: "M16 10a3 3 0 0 1 0 4" }),
          createSvgNode("path", { d: "M17.75 7.75a6 6 0 0 1 0 8.5" })
        );
        break;
      case "fullscreen-exit":
        svg.append(
          createSvgNode("path", { d: "M9 5.5v3.5H5.5" }),
          createSvgNode("path", { d: "M15 5.5v3.5h3.5" }),
          createSvgNode("path", { d: "M9 18.5V15H5.5" }),
          createSvgNode("path", { d: "M15 18.5V15h3.5" })
        );
        break;
      case "fullscreen-enter":
        svg.append(
          createSvgNode("path", { d: "M8.75 5.5H5.5v3.25" }),
          createSvgNode("path", { d: "M15.25 5.5h3.25v3.25" }),
          createSvgNode("path", { d: "M8.75 18.5H5.5v-3.25" }),
          createSvgNode("path", { d: "M15.25 18.5h3.25v-3.25" })
        );
        break;
      case "play":
      default:
        svg.append(
          createSvgNode("path", { d: "M8.75 7.25v9.5L16.5 12l-7.75-4.75Z", fill: "currentColor", stroke: "none" }),
          createSvgNode("path", { d: "M6 6.25v11.5" })
        );
        break;
    }

    return svg;
  }

  function setPresenterButtonContent(button, options = {}) {
    if (!button) return;
    const iconName = String(options.icon || "play").trim() || "play";
    const label = options.label === undefined || options.label === null ? "" : String(options.label);
    const iconOnly = Boolean(options.iconOnly);
    const accessibleLabel = String(options.accessibleLabel || label || "").trim();
    const title = String(options.title || accessibleLabel || label || "").trim();
    button.dataset.icon = iconName;
    button.classList.toggle("presenter-control-button-icononly", iconOnly);
    button.replaceChildren();
    const iconWrap = createNode("span", "presenter-control-button-icon");
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(createPresenterControlIcon(iconName));
    button.appendChild(iconWrap);
    if (!iconOnly) {
      button.appendChild(createNode("span", "presenter-control-button-label", label));
    }
    if (accessibleLabel) {
      button.setAttribute("aria-label", accessibleLabel);
    }
    if (title) {
      button.setAttribute("title", title);
    }
  }

  function clamp(value, min, max) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
    return Math.min(max, Math.max(min, safeValue));
  }

  function formatDurationLabel(ms) {
    const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function getPresentationScenes(presentation) {
    const safePresentation = presentation && typeof presentation === "object" ? presentation : {};
    if (Array.isArray(safePresentation.scenes) && safePresentation.scenes.length) {
      return safePresentation.scenes;
    }
    return safePresentation.scene ? [safePresentation.scene] : [];
  }

  function getPrimaryScene(presentation) {
    return getPresentationScenes(presentation)[0] || null;
  }

  function getSnapshotScenes(snapshot) {
    const safeSnapshot = snapshot && typeof snapshot === "object" ? snapshot : {};
    if (Array.isArray(safeSnapshot.scenes)) {
      return safeSnapshot.scenes;
    }
    if (Array.isArray(safeSnapshot.savedScenes)) {
      return safeSnapshot.savedScenes;
    }
    return [];
  }

  function ensureExternalScriptLoaded(src) {
    const safeSrc = String(src || "").trim();
    if (!safeSrc) {
      return Promise.reject(new Error(lt("Script-Quelle fehlt.")));
    }
    if (!externalScriptPromisesBySrc[safeSrc]) {
      externalScriptPromisesBySrc[safeSrc] = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${safeSrc}"]`);
        const script = existing || document.createElement("script");

        function cleanup() {
          script.removeEventListener("load", handleLoad);
          script.removeEventListener("error", handleError);
        }

        function handleLoad() {
          script.dataset.loaded = "true";
          script.dataset.failed = "false";
          cleanup();
          resolve();
        }

        function handleError() {
          script.dataset.loaded = "false";
          script.dataset.failed = "true";
          cleanup();
          reject(new Error(lt(`Script konnte nicht geladen werden: ${safeSrc}`)));
        }

        if (!existing) {
          script.src = safeSrc;
          script.async = true;
          script.dataset.loaded = "false";
          script.dataset.failed = "false";
          script.addEventListener("load", handleLoad, { once: true });
          script.addEventListener("error", handleError, { once: true });
          document.head.appendChild(script);
          return;
        }

        if (script.dataset.loaded === "true") {
          resolve();
          return;
        }
        if (script.dataset.failed === "true") {
          reject(new Error(lt(`Script konnte nicht geladen werden: ${safeSrc}`)));
          return;
        }
        script.addEventListener("load", handleLoad, { once: true });
        script.addEventListener("error", handleError, { once: true });
      }).catch((error) => {
        externalScriptPromisesBySrc[safeSrc] = null;
        throw error;
      });
    }
    return externalScriptPromisesBySrc[safeSrc];
  }

  async function ensureBabylonLoaded() {
    if (global.BABYLON && typeof global.BABYLON.Engine === "function") {
      return {
        library: global.BABYLON,
        label: "Babylon.js aktiv"
      };
    }
    let lastError = null;
    for (const source of BABYLON_SCRIPT_SOURCES) {
      try {
        await ensureExternalScriptLoaded(source.src);
        if (global.BABYLON && typeof global.BABYLON.Engine === "function") {
          return {
            library: global.BABYLON,
            label: source.label
          };
        }
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(lt("Babylon.js konnte nicht geladen werden."));
  }

  function resolveActiveCue(cues, elapsedMs) {
    const cueList = Array.isArray(cues) ? cues : [];
    if (!cueList.length) return null;
    const safeElapsed = Math.max(0, Number(elapsedMs) || 0);
    for (const cue of cueList) {
      if (safeElapsed >= Number(cue.startMs || 0) && safeElapsed < Number(cue.endMs || 0)) {
        return cue;
      }
    }
    if (safeElapsed >= Number(cueList[cueList.length - 1]?.endMs || 0)) {
      return cueList[cueList.length - 1] || null;
    }
    return cueList.find((cue) => safeElapsed < Number(cue.startMs || 0)) || cueList[0] || null;
  }

  function resolveActiveSpeechSegment(segments, elapsedMs) {
    const safeSegments = Array.isArray(segments) ? segments : [];
    if (!safeSegments.length) return null;
    const safeElapsed = Math.max(0, Number(elapsedMs) || 0);
    let active = null;
    for (const segment of safeSegments) {
      const startMs = Number(segment?.startMs || 0);
      if (safeElapsed < startMs) break;
      active = segment;
    }
    return active || safeSegments[0] || null;
  }

  function createSpeechController(segments, locale) {
    const synth = global.speechSynthesis;
    const UtteranceCtor = global.SpeechSynthesisUtterance;
    const queue = (Array.isArray(segments) ? segments : [])
      .filter((entry) => entry && typeof entry === "object")
      .slice()
      .sort((left, right) => Number(left.startMs || 0) - Number(right.startMs || 0));
    const supportsSpeech = Boolean(synth && UtteranceCtor);
    let timers = [];

    function clearTimers() {
      timers.forEach((timerId) => global.clearTimeout(timerId));
      timers = [];
    }

    function cancelSpeech() {
      if (!supportsSpeech) return;
      try {
        synth.cancel();
      } catch {
      }
    }

    function resolveVoice() {
      if (!supportsSpeech || typeof synth.getVoices !== "function") return null;
      const voices = synth.getVoices();
      if (!Array.isArray(voices) || !voices.length) return null;
      const normalizedLocale = String(locale || "de-DE").toLowerCase();
      return voices.find((voice) => String(voice.lang || "").toLowerCase() === normalizedLocale) ||
        voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith("de")) ||
        voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(normalizedLocale.split("-")[0])) ||
        voices[0] ||
        null;
    }

    function speakSegment(segment) {
      if (!supportsSpeech) return;
      const utterance = new UtteranceCtor(String(segment?.text || "").trim());
      utterance.lang = locale || "de-DE";
      utterance.rate = 1.02;
      utterance.pitch = 0.96;
      const voice = resolveVoice();
      if (voice) utterance.voice = voice;
      synth.speak(utterance);
    }

    function scheduleFrom(elapsedMs) {
      if (!supportsSpeech) return;
      clearTimers();
      queue.forEach((segment) => {
        const startMs = Number(segment?.startMs || 0);
        if (startMs < elapsedMs - 80) return;
        const delayMs = Math.max(0, startMs - elapsedMs);
        const timerId = global.setTimeout(() => {
          speakSegment(segment);
        }, delayMs);
        timers.push(timerId);
      });
    }

    return Object.freeze({
      available: supportsSpeech,
      startAt(elapsedMs = 0) {
        if (!supportsSpeech) return;
        cancelSpeech();
        scheduleFrom(Math.max(0, Number(elapsedMs) || 0));
      },
      pause() {
        clearTimers();
        if (!supportsSpeech) return;
        if (typeof synth.pause === "function" && (synth.speaking || synth.pending)) {
          try {
            synth.pause();
            return;
          } catch {
          }
        }
        cancelSpeech();
      },
      resume(elapsedMs = 0) {
        if (!supportsSpeech) return;
        if (typeof synth.resume === "function" && synth.paused) {
          try {
            synth.resume();
            scheduleFrom(Math.max(0, Number(elapsedMs) || 0));
            return;
          } catch {
          }
        }
        this.startAt(elapsedMs);
      },
      stop() {
        clearTimers();
        cancelSpeech();
      }
    });
  }

  function buildSceneRuntime(BABYLON, canvas, presentation) {
    const sceneData = getPrimaryScene(presentation) || {};
    const sceneKind = String(sceneData.kind || "raid0_hardware_story").trim() || "raid0_hardware_story";
    if (sceneKind === "tls_https_story") {
      return buildTlsHttpsSceneRuntime(BABYLON, canvas, presentation);
    }
    if (
      sceneKind === "symmetric_crypto_story"
      || sceneKind === "asymmetric_crypto_story"
      || sceneKind === "hybrid_crypto_story"
      || sceneKind === "end_to_end_crypto_story"
    ) {
      return buildSymmetricCryptoSceneRuntime(BABYLON, canvas, presentation);
    }
    return buildRaid0SceneRuntime(BABYLON, canvas, presentation);
  }

  function buildRaid0SceneRuntime(BABYLON, canvas, presentation) {
    const sceneData = getPrimaryScene(presentation) || {};
    const palette = sceneData.palette || {};
    const cameraConfig = sceneData.camera || {};
    const cues = Array.isArray(sceneData.cues) ? sceneData.cues : [];
    const durationMs = Math.max(1000, Number(sceneData.durationMs || 1000));
    const cueById = new Map(cues.map((cue) => [cue.id, cue]));
    const labelNodes = new Set();
    const playerCameraState = {
      jumpsEnabled: true,
      playbackActive: false
    };
    const cameraPreviewState = {
      active: false,
      startedAtMs: 0,
      durationMs: 0,
      startPose: null,
      endPose: null,
      restoreFreeFlyEnabled: false
    };

    function color3(hex, fallback = "#6bdff0") {
      return BABYLON.Color3.FromHexString(String(hex || fallback));
    }

    function color4(hex, alpha = 1, fallback = "#050814") {
      const base = color3(hex, fallback);
      return new BABYLON.Color4(base.r, base.g, base.b, alpha);
    }

    function toVector3(position, fallback = [0, 0, 0]) {
      const source = Array.isArray(position) ? position : fallback;
      return new BABYLON.Vector3(
        Number(source[0] || 0),
        Number(source[1] || 0),
        Number(source[2] || 0)
      );
    }

    function lerpNumber(start, end, progress) {
      return start + ((end - start) * clamp(progress, 0, 1));
    }

    function ease(progress) {
      const safe = clamp(progress, 0, 1);
      return safe * safe * (3 - (2 * safe));
    }

    function blendVector(left, right, progress) {
      return BABYLON.Vector3.Lerp(left, right, clamp(progress, 0, 1));
    }

    function cue(id) {
      return cueById.get(id) || { startMs: 0, endMs: 1 };
    }

    function cueProgress(id, elapsedMs) {
      const activeCue = cue(id);
      const span = Math.max(1, Number(activeCue.endMs || 0) - Number(activeCue.startMs || 0));
      return ease((Number(elapsedMs || 0) - Number(activeCue.startMs || 0)) / span);
    }

    function cueEnvelope(id, elapsedMs, fadeMs = 420) {
      const activeCue = cue(id);
      const safeElapsed = Number(elapsedMs || 0);
      const startMs = Number(activeCue.startMs || 0);
      const endMs = Number(activeCue.endMs || 0);
      if (safeElapsed <= startMs - fadeMs || safeElapsed >= endMs + fadeMs) return 0;
      if (safeElapsed < startMs) return ease((safeElapsed - (startMs - fadeMs)) / fadeMs);
      if (safeElapsed > endMs) return 1 - ease((safeElapsed - endMs) / fadeMs);
      return 1;
    }

    function buildPathSampler(points) {
      const vectors = (Array.isArray(points) ? points : []).map((point) => toVector3(point));
      const cumulative = [0];
      let totalLength = 0;
      for (let index = 1; index < vectors.length; index += 1) {
        totalLength += BABYLON.Vector3.Distance(vectors[index - 1], vectors[index]);
        cumulative.push(totalLength);
      }
      const safeLength = Math.max(totalLength, 0.0001);
      return Object.freeze({
        path: vectors,
        sample(progress) {
          const safeProgress = clamp(progress, 0, 1);
          if (!vectors.length) return BABYLON.Vector3.Zero();
          if (vectors.length === 1) return vectors[0].clone();
          const targetLength = safeLength * safeProgress;
          for (let index = 1; index < cumulative.length; index += 1) {
            if (targetLength <= cumulative[index]) {
              const segmentLength = Math.max(0.0001, cumulative[index] - cumulative[index - 1]);
              const localProgress = (targetLength - cumulative[index - 1]) / segmentLength;
              return blendVector(vectors[index - 1], vectors[index], localProgress);
            }
          }
          return vectors[vectors.length - 1].clone();
        }
      });
    }

    function createSurfaceMaterial(id, diffuseHex, emissiveStrength = 0.3, alpha = 1) {
      const material = new BABYLON.StandardMaterial(id, scene);
      const diffuse = color3(diffuseHex, "#6bdff0");
      material.diffuseColor = diffuse;
      material.emissiveColor = diffuse.scale(emissiveStrength);
      material.specularColor = BABYLON.Color3.Black();
      material.alpha = alpha;
      material.backFaceCulling = false;
      return material;
    }

    function drawLabelTexture(texture, text, options = {}) {
      const width = Number(options.width || 1024);
      const height = Number(options.height || 256);
      const ctx = texture.getContext();
      const lines = String(text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const backgroundAlpha = clamp(Number(options.backgroundAlpha ?? 0.32), 0, 1);
      const radius = Number(options.radius || 26);
      const fillStyle = `rgba(7, 14, 28, ${backgroundAlpha})`;
      const borderStyle = options.borderStyle || "rgba(115, 242, 255, 0.18)";
      const textColor = options.textColor || String(palette.label || "#eff6ff");
      const fontSize = Number(options.fontSize || 92);
      const fontWeight = options.fontWeight || "700";
      ctx.clearRect(0, 0, width, height);
      if (backgroundAlpha > 0) {
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.lineWidth = Number(options.borderWidth || 4);
        ctx.strokeStyle = borderStyle;
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight} ${fontSize}px Arial`;
      const lineHeight = Number(options.lineHeight || fontSize * 0.94);
      const offsetY = ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, (height / 2) - offsetY + (index * lineHeight));
      });
      texture.update();
    }

    function createLabelNode(id, text, options = {}) {
      let sourceText = String(text || "");
      let baseOptions = { ...options };
      const plane = BABYLON.MeshBuilder.CreatePlane(id, {
        width: Number(options.planeWidth || 4.4),
        height: Number(options.planeHeight || 1.05)
      }, scene);
      plane.billboardMode = options.billboard === false ? BABYLON.Mesh.BILLBOARDMODE_NONE : BABYLON.Mesh.BILLBOARDMODE_ALL;
      const texture = new BABYLON.DynamicTexture(`${id}Texture`, {
        width: Number(options.textureWidth || 1024),
        height: Number(options.textureHeight || 256)
      }, scene, true);
      texture.hasAlpha = true;
      drawLabelTexture(texture, lt(sourceText), baseOptions);
      const material = new BABYLON.StandardMaterial(`${id}Material`, scene);
      material.diffuseTexture = texture;
      material.emissiveTexture = texture;
      material.opacityTexture = texture;
      material.diffuseColor = BABYLON.Color3.White();
      material.emissiveColor = BABYLON.Color3.White();
      material.specularColor = BABYLON.Color3.Black();
      material.backFaceCulling = false;
      material.alpha = Number(options.alpha ?? 1);
      plane.material = material;
      const labelNode = {
        plane,
        material,
        texture,
        getSourceText() {
          return sourceText;
        },
        getBaseOptions() {
          return baseOptions;
        },
        redraw(nextText, nextOptions = {}) {
          sourceText = String(nextText || "");
          baseOptions = { ...baseOptions, ...nextOptions };
          drawLabelTexture(texture, lt(sourceText), baseOptions);
        },
        setAlpha(alpha) {
          const safeAlpha = clamp(alpha, 0, 1);
          plane.setEnabled(safeAlpha > 0.01);
          material.alpha = safeAlpha;
        }
      };
      labelNodes.add(labelNode);
      return Object.freeze(labelNode);
    }

    function refreshLabelTranslations() {
      labelNodes.forEach((labelNode) => {
        drawLabelTexture(labelNode.texture, lt(labelNode.getSourceText()), labelNode.getBaseOptions());
      });
    }

    function createModule(id, labelText, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      const size = config.size || { width: 3.4, height: 1.5, depth: 2.2 };
      const body = BABYLON.MeshBuilder.CreateBox(`${id}Body`, size, scene);
      body.parent = root;
      const bodyMaterial = createSurfaceMaterial(`${id}BodyMaterial`, config.color || palette.chassisBase || "#101f3b", 0.22, config.alpha ?? 1);
      body.material = bodyMaterial;
      const shell = BABYLON.MeshBuilder.CreateBox(`${id}Shell`, {
        width: size.width + 0.16,
        height: size.height + 0.16,
        depth: size.depth + 0.16
      }, scene);
      shell.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}ShellMaterial`, config.accent || palette.chassisAccent || "#6fe6ff", 0.45, 0.12);
      shell.material = shellMaterial;
      const accentStrip = BABYLON.MeshBuilder.CreateBox(`${id}Accent`, {
        width: Math.max(0.22, size.width - 0.6),
        height: Math.max(0.08, size.height * 0.11),
        depth: 0.08
      }, scene);
      accentStrip.parent = root;
      accentStrip.position = new BABYLON.Vector3(0, (size.height / 2) - 0.2, (size.depth / 2) + 0.03);
      const accentMaterial = createSurfaceMaterial(`${id}AccentMaterial`, config.accent || palette.chassisAccent || "#6fe6ff", 0.88, 0.95);
      accentStrip.material = accentMaterial;
      const indicator = BABYLON.MeshBuilder.CreateSphere(`${id}Indicator`, { diameter: 0.16, segments: 12 }, scene);
      indicator.parent = root;
      indicator.position = new BABYLON.Vector3((size.width / 2) - 0.28, -(size.height / 2) + 0.24, (size.depth / 2) + 0.06);
      const indicatorMaterial = createSurfaceMaterial(`${id}IndicatorMaterial`, config.accent || palette.chassisAccent || "#6fe6ff", 0.8, 1);
      indicator.material = indicatorMaterial;
      const label = createLabelNode(`${id}Label`, labelText, {
        planeWidth: Number(config.labelWidth || 4.4),
        planeHeight: Number(config.labelHeight || 1.0),
        textureWidth: 1024,
        textureHeight: 240,
        fontSize: Number(config.fontSize || 90),
        backgroundAlpha: 0.2
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, (size.height / 2) + Number(config.labelYOffset || 0.95), 0);
      return Object.freeze({
        root,
        bodyMaterial,
        shellMaterial,
        accentMaterial,
        indicatorMaterial,
        basePosition: position.clone(),
        baseColor: color3(config.color || palette.chassisBase || "#101f3b"),
        accentColor: color3(config.accent || palette.chassisAccent || "#6fe6ff"),
        label,
        shellBaseAlpha: 0.1,
        shellPulseAlpha: 0.16
      });
    }

    function createChipPart(id, parent, options = {}) {
      const mesh = BABYLON.MeshBuilder.CreateBox(id, {
        width: Number(options.width || 0.8),
        height: Number(options.height || 0.5),
        depth: Number(options.depth || 0.12)
      }, scene);
      mesh.parent = parent;
      const position = Array.isArray(options.position)
        ? toVector3(options.position)
        : (options.position instanceof BABYLON.Vector3 ? options.position : BABYLON.Vector3.Zero());
      mesh.position.copyFrom(position);
      mesh.rotation.x = Number(options.rotationX || 0);
      mesh.rotation.y = Number(options.rotationY || 0);
      mesh.rotation.z = Number(options.rotationZ || 0);
      const material = options.material || createSurfaceMaterial(
        `${id}Material`,
        options.color || "#1f2534",
        Number(options.emissiveStrength ?? 0.12),
        Number(options.alpha ?? 1)
      );
      mesh.material = material;
      return Object.freeze({
        mesh,
        material
      });
    }

    function createPcieNic(id, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      root.rotation.y = -0.08;
      const board = BABYLON.MeshBuilder.CreateBox(`${id}Board`, {
        width: 3.95,
        height: 2.15,
        depth: 0.14
      }, scene);
      board.parent = root;
      const bodyMaterial = createSurfaceMaterial(`${id}BoardMaterial`, config.color || "#3b8066", 0.16, 1);
      board.material = bodyMaterial;

      const frame = BABYLON.MeshBuilder.CreateBox(`${id}Frame`, {
        width: 4.08,
        height: 2.28,
        depth: 0.2
      }, scene);
      frame.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}FrameMaterial`, config.accent || "#6fe6ff", 0.34, 0.1);
      frame.material = shellMaterial;

      const bracket = BABYLON.MeshBuilder.CreateBox(`${id}Bracket`, {
        width: 0.24,
        height: 2.42,
        depth: 0.34
      }, scene);
      bracket.parent = root;
      bracket.position = new BABYLON.Vector3(-1.98, 0, 0.02);
      const bracketMaterial = createSurfaceMaterial(`${id}BracketMaterial`, "#b8c8d8", 0.08, 0.96);
      bracket.material = bracketMaterial;

      const jackOuter = BABYLON.MeshBuilder.CreateBox(`${id}JackOuter`, {
        width: 0.88,
        height: 0.74,
        depth: 0.46
      }, scene);
      jackOuter.parent = root;
      jackOuter.position = new BABYLON.Vector3(-1.5, 0.52, 0.14);
      const jackOuterMaterial = createSurfaceMaterial(`${id}JackOuterMaterial`, "#d7e2ee", 0.08, 0.98);
      jackOuter.material = jackOuterMaterial;

      const jackInner = BABYLON.MeshBuilder.CreateBox(`${id}JackInner`, {
        width: 0.64,
        height: 0.48,
        depth: 0.32
      }, scene);
      jackInner.parent = root;
      jackInner.position = new BABYLON.Vector3(-1.48, 0.52, 0.2);
      jackInner.material = createSurfaceMaterial(`${id}JackInnerMaterial`, "#161b24", 0.04, 1);

      const contactMaterial = createSurfaceMaterial(`${id}ContactMaterial`, "#d9b45c", 0.18, 1);
      Array.from({ length: 9 }, (_, index) => index).forEach((index) => {
        const pin = BABYLON.MeshBuilder.CreateBox(`${id}JackPin_${index}`, {
          width: 0.045,
          height: 0.045,
          depth: 0.1
        }, scene);
        pin.parent = root;
        pin.position = new BABYLON.Vector3(-1.72 + (index * 0.055), 0.77, 0.31);
        pin.material = contactMaterial;
      });

      const indicatorMaterial = createSurfaceMaterial(`${id}LinkLedMaterial`, "#74f7b2", 0.95, 1);
      [-0.16, 0.16].forEach((offset, index) => {
        const led = BABYLON.MeshBuilder.CreateSphere(`${id}Led_${index}`, { diameter: 0.12, segments: 10 }, scene);
        led.parent = root;
        led.position = new BABYLON.Vector3(-1.1, 0.86 + offset, 0.16);
        led.material = indicatorMaterial;
      });

      const mainChip = createChipPart(`${id}MainChip`, root, {
        width: 0.98,
        height: 0.72,
        depth: 0.16,
        position: [0.28, 0.26, 0.08],
        color: "#1e2433",
        emissiveStrength: 0.1
      });
      const phyChip = createChipPart(`${id}PhyChip`, root, {
        width: 0.76,
        height: 0.5,
        depth: 0.14,
        position: [-0.38, -0.38, 0.08],
        color: "#23293a",
        emissiveStrength: 0.1
      });
      const memoryChip = createChipPart(`${id}MemoryChip`, root, {
        width: 0.58,
        height: 0.42,
        depth: 0.14,
        position: [0.94, -0.4, 0.08],
        color: "#23293a",
        emissiveStrength: 0.1
      });

      const accentMaterial = createSurfaceMaterial(`${id}TraceMaterial`, config.accent || "#6fe6ff", 0.52, 0.96);
      [
        { width: 1.6, y: -0.78, x: 0.1 },
        { width: 1.15, y: 0.95, x: 0.32 },
        { width: 0.9, y: -0.02, x: 1.0 }
      ].forEach((trace, index) => {
        const line = BABYLON.MeshBuilder.CreateBox(`${id}Trace_${index}`, {
          width: trace.width,
          height: 0.04,
          depth: 0.04
        }, scene);
        line.parent = root;
        line.position = new BABYLON.Vector3(trace.x, trace.y, 0.09);
        line.material = accentMaterial;
      });

      Array.from({ length: 11 }, (_, index) => index).forEach((index) => {
        const skip = index === 5;
        if (skip) return;
        const finger = BABYLON.MeshBuilder.CreateBox(`${id}Finger_${index}`, {
          width: 0.18,
          height: 0.2,
          depth: 0.05
        }, scene);
        finger.parent = root;
        finger.position = new BABYLON.Vector3(-0.82 + (index * 0.21), -1.17, 0.09);
        finger.material = contactMaterial;
      });

      const label = createLabelNode(`${id}Label`, config.labelText || "NIC /\nNetzwerkkarte", {
        planeWidth: Number(config.labelWidth || 3.2),
        planeHeight: Number(config.labelHeight || 0.88),
        textureWidth: 1024,
        textureHeight: 240,
        fontSize: Number(config.fontSize || 74),
        backgroundAlpha: 0.2
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, 1.85, 0);

      return Object.freeze({
        root,
        bodyMaterial,
        shellMaterial,
        accentMaterial,
        indicatorMaterial,
        basePosition: position.clone(),
        baseColor: color3(config.color || "#3b8066"),
        accentColor: color3(config.accent || "#6fe6ff"),
        label,
        shellBaseAlpha: 0.12,
        shellPulseAlpha: 0.18,
        detailMaterials: Object.freeze([
          bracketMaterial,
          jackOuterMaterial,
          contactMaterial,
          mainChip.material,
          phyChip.material,
          memoryChip.material
        ])
      });
    }

    function createCpuProcessor(id, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      root.rotation.y = 0.08;

      const socketBase = BABYLON.MeshBuilder.CreateBox(`${id}SocketBase`, {
        width: 3.8,
        height: 0.46,
        depth: 3.8
      }, scene);
      socketBase.parent = root;
      socketBase.position.y = -0.28;
      const bodyMaterial = createSurfaceMaterial(`${id}SocketBaseMaterial`, "#2a313f", 0.12, 1);
      socketBase.material = bodyMaterial;

      const socketFrame = BABYLON.MeshBuilder.CreateBox(`${id}SocketFrame`, {
        width: 4.0,
        height: 0.62,
        depth: 4.0
      }, scene);
      socketFrame.parent = root;
      socketFrame.position.y = -0.22;
      const shellMaterial = createSurfaceMaterial(`${id}SocketFrameMaterial`, "#93a6bb", 0.12, 0.92);
      socketFrame.material = shellMaterial;

      const substrate = BABYLON.MeshBuilder.CreateBox(`${id}Substrate`, {
        width: 3.18,
        height: 0.18,
        depth: 3.18
      }, scene);
      substrate.parent = root;
      substrate.position.y = 0.1;
      const substrateMaterial = createSurfaceMaterial(`${id}SubstrateMaterial`, config.color || "#36555b", 0.14, 1);
      substrate.material = substrateMaterial;

      const heatSpreader = BABYLON.MeshBuilder.CreateBox(`${id}HeatSpreader`, {
        width: 2.42,
        height: 0.2,
        depth: 2.42
      }, scene);
      heatSpreader.parent = root;
      heatSpreader.position.y = 0.3;
      const accentMaterial = createSurfaceMaterial(`${id}HeatSpreaderMaterial`, "#d7dde7", 0.16, 0.98);
      heatSpreader.material = accentMaterial;

      const dieCap = BABYLON.MeshBuilder.CreateBox(`${id}DieCap`, {
        width: 1.12,
        height: 0.08,
        depth: 1.12
      }, scene);
      dieCap.parent = root;
      dieCap.position = new BABYLON.Vector3(0, 0.45, 0);
      dieCap.material = createSurfaceMaterial(`${id}DieCapMaterial`, "#a9b9cb", 0.28, 0.96);

      const contactMaterial = createSurfaceMaterial(`${id}PadMaterial`, "#d2ad58", 0.18, 1);
      for (let row = -3; row <= 3; row += 1) {
        for (let col = -3; col <= 3; col += 1) {
          const pad = BABYLON.MeshBuilder.CreateBox(`${id}Pad_${row}_${col}`, {
            width: 0.14,
            height: 0.04,
            depth: 0.14
          }, scene);
          pad.parent = root;
          pad.position = new BABYLON.Vector3(col * 0.4, -0.54, row * 0.4);
          pad.material = contactMaterial;
        }
      }

      const indicatorMaterial = createSurfaceMaterial(`${id}CornerMarkMaterial`, config.accent || "#f4f8ff", 0.88, 1);
      const cornerMark = BABYLON.MeshBuilder.CreateSphere(`${id}CornerMark`, { diameter: 0.12, segments: 10 }, scene);
      cornerMark.parent = root;
      cornerMark.position = new BABYLON.Vector3(-1.2, 0.5, -1.2);
      cornerMark.material = indicatorMaterial;

      [-1, 1].forEach((sign, index) => {
        const clampBar = BABYLON.MeshBuilder.CreateBox(`${id}Clamp_${index}`, {
          width: 0.12,
          height: 0.36,
          depth: 3.35
        }, scene);
        clampBar.parent = root;
        clampBar.position = new BABYLON.Vector3(sign * 1.84, -0.05, 0);
        clampBar.material = shellMaterial;
      });

      const label = createLabelNode(`${id}Label`, config.labelText || "CPU /\nOS /\nApp", {
        planeWidth: Number(config.labelWidth || 2.85),
        planeHeight: Number(config.labelHeight || 1.16),
        textureWidth: 1024,
        textureHeight: 260,
        fontSize: Number(config.fontSize || 66),
        backgroundAlpha: 0.2
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, 2, 0);

      return Object.freeze({
        root,
        bodyMaterial: substrateMaterial,
        shellMaterial,
        accentMaterial,
        indicatorMaterial,
        basePosition: position.clone(),
        baseColor: color3(config.color || "#36555b"),
        accentColor: color3(config.accent || "#f4f8ff"),
        label,
        shellBaseAlpha: 0.82,
        shellPulseAlpha: 0.12,
        detailMaterials: Object.freeze([bodyMaterial, contactMaterial])
      });
    }

    function createRamStick(id, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      root.rotation.z = -0.08;

      const board = BABYLON.MeshBuilder.CreateBox(`${id}Board`, {
        width: 5.45,
        height: 1.82,
        depth: 0.14
      }, scene);
      board.parent = root;
      const bodyMaterial = createSurfaceMaterial(`${id}BoardMaterial`, config.color || "#2d7a59", 0.14, 1);
      board.material = bodyMaterial;

      const frame = BABYLON.MeshBuilder.CreateBox(`${id}Frame`, {
        width: 5.62,
        height: 1.98,
        depth: 0.18
      }, scene);
      frame.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}FrameMaterial`, config.accent || "#46c9ff", 0.36, 0.12);
      frame.material = shellMaterial;

      const contactMaterial = createSurfaceMaterial(`${id}ContactMaterial`, "#d6b45f", 0.18, 1);
      const contactOffsets = [-2.34, -1.98, -1.62, -1.26, -0.9, -0.54, -0.18, 0.42, 0.78, 1.14, 1.5, 1.86, 2.22];
      contactOffsets.forEach((offset, index) => {
        const finger = BABYLON.MeshBuilder.CreateBox(`${id}Contact_${index}`, {
          width: 0.22,
          height: 0.22,
          depth: 0.05
        }, scene);
        finger.parent = root;
        finger.position = new BABYLON.Vector3(offset, -1.0, 0.09);
        finger.material = contactMaterial;
      });

      const chipMaterial = createSurfaceMaterial(`${id}ChipMaterial`, "#202633", 0.12, 1);
      [-2.08, -1.24, -0.4, 0.44, 1.28, 2.12].forEach((offset, index) => {
        const chip = BABYLON.MeshBuilder.CreateBox(`${id}Chip_${index}`, {
          width: 0.66,
          height: 0.76,
          depth: 0.12
        }, scene);
        chip.parent = root;
        chip.position = new BABYLON.Vector3(offset, 0.14, 0.08);
        chip.material = chipMaterial;
      });

      const accentMaterial = createSurfaceMaterial(`${id}BusMaterial`, config.accent || "#46c9ff", 0.48, 0.94);
      [
        { width: 4.55, y: 0.88, x: 0 },
        { width: 1.15, y: -0.48, x: -1.9 },
        { width: 1.15, y: -0.48, x: 1.9 }
      ].forEach((trace, index) => {
        const line = BABYLON.MeshBuilder.CreateBox(`${id}Bus_${index}`, {
          width: trace.width,
          height: 0.04,
          depth: 0.04
        }, scene);
        line.parent = root;
        line.position = new BABYLON.Vector3(trace.x, trace.y, 0.09);
        line.material = accentMaterial;
      });

      const spdChip = createChipPart(`${id}Spd`, root, {
        width: 0.38,
        height: 0.36,
        depth: 0.12,
        position: [2.36, 0.74, 0.08],
        color: "#283040",
        emissiveStrength: 0.12
      });
      const indicatorMaterial = createSurfaceMaterial(`${id}ActivityMaterial`, "#f4f8ff", 0.88, 1);
      const marker = BABYLON.MeshBuilder.CreateSphere(`${id}Marker`, { diameter: 0.11, segments: 10 }, scene);
      marker.parent = root;
      marker.position = new BABYLON.Vector3(-2.48, 0.84, 0.1);
      marker.material = indicatorMaterial;

      const label = createLabelNode(`${id}Label`, config.labelText || "RAM", {
        planeWidth: Number(config.labelWidth || 1.8),
        planeHeight: Number(config.labelHeight || 0.68),
        textureWidth: 640,
        textureHeight: 220,
        fontSize: Number(config.fontSize || 86),
        backgroundAlpha: 0.2
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, 1.82, 0);

      return Object.freeze({
        root,
        bodyMaterial,
        shellMaterial,
        accentMaterial,
        indicatorMaterial,
        basePosition: position.clone(),
        baseColor: color3(config.color || "#2d7a59"),
        accentColor: color3(config.accent || "#46c9ff"),
        label,
        shellBaseAlpha: 0.12,
        shellPulseAlpha: 0.18,
        detailMaterials: Object.freeze([contactMaterial, chipMaterial, spdChip.material])
      });
    }

    function createDataBlock(id, labelText) {
      const root = new BABYLON.TransformNode(`block_${id}_root`, scene);
      const body = BABYLON.MeshBuilder.CreateBox(`block_${id}_body`, {
        width: 1.02,
        height: 0.72,
        depth: 0.5
      }, scene);
      body.parent = root;
      const bodyMaterial = createSurfaceMaterial(`block_${id}_body_material`, palette.dataSignal || "#ff9b4d", 0.86, 1);
      body.material = bodyMaterial;
      const shell = BABYLON.MeshBuilder.CreateBox(`block_${id}_shell`, {
        width: 1.14,
        height: 0.84,
        depth: 0.62
      }, scene);
      shell.parent = root;
      const shellMaterial = createSurfaceMaterial(`block_${id}_shell_material`, palette.requestSignal || "#f4f8ff", 0.42, 0.12);
      shell.material = shellMaterial;
      const label = createLabelNode(`block_${id}_label`, labelText, {
        planeWidth: 0.82,
        planeHeight: 0.42,
        textureWidth: 512,
        textureHeight: 256,
        fontSize: 136,
        backgroundAlpha: 0.06
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, 0, 0.32);
      return Object.freeze({
        root,
        bodyMaterial,
        shellMaterial,
        label
      });
    }

    function createPulse(id, colorHex, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      const isSphere = config.shape === "sphere";
      const mesh = isSphere
        ? BABYLON.MeshBuilder.CreateSphere(`${id}Mesh`, { diameter: Number(config.diameter || 0.24), segments: 12 }, scene)
        : BABYLON.MeshBuilder.CreateBox(`${id}Mesh`, {
            width: Number(config.width || 0.42),
            height: Number(config.height || 0.18),
            depth: Number(config.depth || 0.18)
          }, scene);
      mesh.parent = root;
      const material = createSurfaceMaterial(`${id}Material`, colorHex, Number(config.emissiveStrength || 0.95), 1);
      mesh.material = material;
      root.setEnabled(false);
      return Object.freeze({
        root,
        material
      });
    }

    function createConduit(id, points, radius = 0.08) {
      const sampler = buildPathSampler(points);
      const mesh = BABYLON.MeshBuilder.CreateTube(id, {
        path: sampler.path,
        radius,
        tessellation: 20
      }, scene);
      const material = createSurfaceMaterial(`${id}Material`, palette.conduitBase || "#21406a", 0.4, 0.55);
      mesh.material = material;
      return Object.freeze({
        sampler,
        mesh,
        material
      });
    }

    function createDrive(id, title, position) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      const shell = BABYLON.MeshBuilder.CreateBox(`${id}Shell`, {
        width: 3.5,
        height: 4.8,
        depth: 2.85
      }, scene);
      shell.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}ShellMaterial`, palette.diskShell || "#d7e2ff", 0.2, 0.12);
      shell.material = shellMaterial;
      const frame = BABYLON.MeshBuilder.CreateBox(`${id}Frame`, {
        width: 3.68,
        height: 4.98,
        depth: 3.03
      }, scene);
      frame.parent = root;
      const frameMaterial = createSurfaceMaterial(`${id}FrameMaterial`, palette.chassisAccent || "#6fe6ff", 0.42, 0.11);
      frame.material = frameMaterial;
      const backPlate = BABYLON.MeshBuilder.CreateBox(`${id}BackPlate`, {
        width: 2.95,
        height: 4.0,
        depth: 0.12
      }, scene);
      backPlate.parent = root;
      backPlate.position = new BABYLON.Vector3(0, 0, -1.2);
      backPlate.material = createSurfaceMaterial(`${id}BackPlateMaterial`, palette.chassisBase || "#101f3b", 0.28, 0.82);
      const controllerBoard = BABYLON.MeshBuilder.CreateBox(`${id}Controller`, {
        width: 2.45,
        height: 0.6,
        depth: 0.32
      }, scene);
      controllerBoard.parent = root;
      controllerBoard.position = new BABYLON.Vector3(0, -1.65, 0.45);
      const controllerMaterial = createSurfaceMaterial(`${id}ControllerMaterial`, palette.chassisBase || "#101f3b", 0.5, 0.98);
      controllerBoard.material = controllerMaterial;
      const ingressPort = BABYLON.MeshBuilder.CreateBox(`${id}Ingress`, {
        width: 0.42,
        height: 0.44,
        depth: 0.6
      }, scene);
      ingressPort.parent = root;
      ingressPort.position = new BABYLON.Vector3(-1.75, 1.45, 0);
      ingressPort.material = createSurfaceMaterial(`${id}IngressMaterial`, palette.requestSignal || "#f4f8ff", 0.58, 0.95);
      const platters = [
        new BABYLON.Vector3(0, 0.92, 0),
        new BABYLON.Vector3(0, -0.05, 0)
      ].map((platterPosition, index) => {
        const platter = BABYLON.MeshBuilder.CreateCylinder(`${id}Platter_${index}`, {
          diameter: 2.25,
          height: 0.14,
          tessellation: 48
        }, scene);
        platter.parent = root;
        platter.position = platterPosition;
        platter.rotation.x = Math.PI / 2;
        platter.material = createSurfaceMaterial(`${id}PlatterMaterial_${index}`, palette.diskCore || "#8fa4cf", 0.34, 0.96);
        return platter;
      });
      const spindle = BABYLON.MeshBuilder.CreateCylinder(`${id}Spindle`, {
        diameter: 0.24,
        height: 1.18,
        tessellation: 24
      }, scene);
      spindle.parent = root;
      spindle.rotation.x = Math.PI / 2;
      spindle.position = new BABYLON.Vector3(0, 0.44, 0);
      spindle.material = createSurfaceMaterial(`${id}SpindleMaterial`, palette.requestSignal || "#f4f8ff", 0.65, 1);
      const armPivot = new BABYLON.TransformNode(`${id}ArmPivot`, scene);
      armPivot.parent = root;
      armPivot.position = new BABYLON.Vector3(0.88, 0.44, 0);
      const arm = BABYLON.MeshBuilder.CreateBox(`${id}Arm`, {
        width: 1.32,
        height: 0.08,
        depth: 0.16
      }, scene);
      arm.parent = armPivot;
      arm.position = new BABYLON.Vector3(-0.65, 0, 0);
      const armMaterial = createSurfaceMaterial(`${id}ArmMaterial`, palette.requestSignal || "#f4f8ff", 0.5, 0.96);
      arm.material = armMaterial;
      const head = BABYLON.MeshBuilder.CreateBox(`${id}Head`, {
        width: 0.18,
        height: 0.16,
        depth: 0.2
      }, scene);
      head.parent = armPivot;
      head.position = new BABYLON.Vector3(-1.28, 0, 0);
      head.material = createSurfaceMaterial(`${id}HeadMaterial`, palette.requestSignal || "#f4f8ff", 0.82, 1);
      const led = BABYLON.MeshBuilder.CreateSphere(`${id}Led`, { diameter: 0.18, segments: 12 }, scene);
      led.parent = root;
      led.position = new BABYLON.Vector3(1.42, -1.84, 1.12);
      const ledMaterial = createSurfaceMaterial(`${id}LedMaterial`, palette.statusSignal || "#74f7b2", 0.8, 1);
      led.material = ledMaterial;
      const sectorLights = [
        new BABYLON.Vector3(0, 0.92, 0),
        new BABYLON.Vector3(0, -0.05, 0)
      ].map((sectorPosition, index) => {
        const sectorLight = BABYLON.MeshBuilder.CreateSphere(`${id}Sector_${index}`, {
          diameter: 0.22,
          segments: 10
        }, scene);
        sectorLight.parent = root;
        sectorLight.position = sectorPosition;
        const sectorMaterial = createSurfaceMaterial(`${id}SectorMaterial_${index}`, palette.dataSignal || "#ff9b4d", 1, 0);
        sectorLight.material = sectorMaterial;
        return {
          mesh: sectorLight,
          material: sectorMaterial,
          basePosition: sectorPosition
        };
      });
      const label = createLabelNode(`${id}Label`, title, {
        planeWidth: 2.7,
        planeHeight: 0.78,
        textureWidth: 768,
        textureHeight: 220,
        fontSize: 84,
        backgroundAlpha: 0.2
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, 3.15, 0);
      return Object.freeze({
        root,
        shellMaterial,
        frameMaterial,
        controllerMaterial,
        armMaterial,
        ledMaterial,
        platters,
        armPivot,
        ingressPoint: position.add(new BABYLON.Vector3(-1.92, 1.45, 0)),
        sectorLights,
        basePosition: position.clone(),
        label
      });
    }

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = color4(palette.backgroundBottom, 1, "#030713");
    scene.ambientColor = color3(palette.conduitBase, "#21406a");

    const camera = new BABYLON.ArcRotateCamera(
      "presenterCamera",
      Number(cameraConfig.alpha || -1.08),
      Number(cameraConfig.beta || 1.05),
      Number(cameraConfig.radius || 29),
      toVector3(cameraConfig.target, [0, 2.8, 0]),
      scene
    );
    scene.activeCamera = camera;
    camera.inputs.clear();
    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = 32;
    camera.lowerBetaLimit = 0.42;
    camera.upperBetaLimit = 1.34;
    camera.minZ = 0.1;
    camera.maxZ = 160;
    camera.fov = 0.72;

    const freeCamera = new BABYLON.UniversalCamera(
      "presenterFreeCamera",
      camera.position.clone(),
      scene
    );
    freeCamera.minZ = 0.1;
    freeCamera.maxZ = 160;
    freeCamera.fov = 0.76;
    freeCamera.speed = 0.46;
    freeCamera.inertia = 0.76;
    freeCamera.angularSensibility = 2600;
    freeCamera.applyGravity = false;
    freeCamera.checkCollisions = false;
    freeCamera.keysUp = [87, 38];
    freeCamera.keysDown = [83, 40];
    freeCamera.keysLeft = [65, 37];
    freeCamera.keysRight = [68, 39];
    freeCamera.setTarget(toVector3(cameraConfig.target, [0, 2.8, 0]));

    const hemiLight = new BABYLON.HemisphericLight("presenterHemiLight", new BABYLON.Vector3(-0.12, 1, -0.18), scene);
    hemiLight.intensity = 0.95;
    hemiLight.diffuse = color3("#edf6ff", "#edf6ff");
    hemiLight.groundColor = color3("#091222", "#091222");

    const keyLight = new BABYLON.PointLight("presenterKeyLight", new BABYLON.Vector3(-8.5, 10.5, -8.2), scene);
    keyLight.intensity = 1.65;
    keyLight.diffuse = color3("#7cf0ff", "#7cf0ff");

    const rimLight = new BABYLON.PointLight("presenterRimLight", new BABYLON.Vector3(13, 8, 9), scene);
    rimLight.intensity = 1.3;
    rimLight.diffuse = color3("#ffb15b", "#ffb15b");

    const ground = BABYLON.MeshBuilder.CreateGround("presenterGround", {
      width: 40,
      height: 24
    }, scene);
    ground.position.y = -0.12;
    const groundMaterial = createSurfaceMaterial("presenterGroundMaterial", palette.floor || "#0a1629", 0.28, 1);
    groundMaterial.backFaceCulling = false;
    ground.material = groundMaterial;

    const floorLineColor = color3(palette.floorLine, "#17375c");
    for (let index = -4; index <= 4; index += 1) {
      const z = index * 2.45;
      const line = BABYLON.MeshBuilder.CreateLines(`presenterFloorLine_${index}`, {
        points: [
          new BABYLON.Vector3(-18.8, 0.02, z),
          new BABYLON.Vector3(18.8, 0.02, z)
        ]
      }, scene);
      line.color = floorLineColor.scale(index === 0 ? 0.9 : 0.4);
    }
    for (let index = -3; index <= 3; index += 1) {
      const x = index * 4.8;
      const line = BABYLON.MeshBuilder.CreateLines(`presenterFloorCross_${index}`, {
        points: [
          new BABYLON.Vector3(x, 0.02, -10.5),
          new BABYLON.Vector3(x, 0.02, 10.5)
        ]
      }, scene);
      line.color = floorLineColor.scale(0.22);
    }

    const glowLayer = new BABYLON.GlowLayer("presenterGlow", scene);
    glowLayer.intensity = 0.7;

    const layout = sceneData.layout || {};
    const positions = Object.freeze({
      lan: toVector3(layout.lan, [-15.8, 2.9, 0]),
      nic: toVector3(layout.nic, [-11.45, 2.85, 0]),
      cpu: toVector3(layout.cpu, [-5.35, 4.55, -0.15]),
      ram: toVector3(layout.ram, [-5.05, 1.82, 0.18]),
      raid: toVector3(layout.raid, [1.55, 2.7, 0]),
      disk0: toVector3(layout.disk0, [11.2, 3.25, -4.25]),
      disk1: toVector3(layout.disk1, [11.2, 3.25, 4.25])
    });

    const lanRoot = new BABYLON.TransformNode("presenterLanRoot", scene);
    lanRoot.position.copyFrom(positions.lan);
    const lanRing = BABYLON.MeshBuilder.CreateTorus("presenterLanRing", {
      diameter: 1.5,
      thickness: 0.12,
      tessellation: 48
    }, scene);
    lanRing.parent = lanRoot;
    lanRing.rotation.x = Math.PI / 2;
    const lanRingMaterial = createSurfaceMaterial("presenterLanRingMaterial", palette.requestSignal || "#f4f8ff", 0.6, 0.9);
    lanRing.material = lanRingMaterial;
    const lanCore = BABYLON.MeshBuilder.CreateCylinder("presenterLanCore", {
      diameter: 0.52,
      height: 0.4,
      tessellation: 32
    }, scene);
    lanCore.parent = lanRoot;
    lanCore.rotation.x = Math.PI / 2;
    const lanCoreMaterial = createSurfaceMaterial("presenterLanCoreMaterial", palette.dataSignal || "#ff9b4d", 0.8, 1);
    lanCore.material = lanCoreMaterial;
    const lanLabel = createLabelNode("presenterLanLabel", "LAN", {
      planeWidth: 1.4,
      planeHeight: 0.56,
      textureWidth: 512,
      textureHeight: 220,
      fontSize: 96,
      backgroundAlpha: 0.18
    });
    lanLabel.plane.parent = lanRoot;
    lanLabel.plane.position = new BABYLON.Vector3(0, 1.16, 0);

    const nicModule = createPcieNic("presenterNic", positions.nic, {
      color: "#2d765e",
      accent: palette.chassisAccent || "#6fe6ff",
      labelText: "NIC /\nNetzwerkkarte",
      labelWidth: 3.2,
      labelHeight: 0.88,
      fontSize: 74
    });
    const cpuModule = createCpuProcessor("presenterCpu", positions.cpu, {
      color: "#304c53",
      accent: palette.requestSignal || "#f4f8ff",
      labelText: "CPU /\nOS /\nApp",
      labelWidth: 2.85,
      labelHeight: 1.16,
      fontSize: 66
    });
    const ramModule = createRamStick("presenterRam", positions.ram, {
      color: "#2b7a5d",
      accent: palette.pageCache || "#46c9ff",
      labelText: "RAM",
      labelWidth: 1.8,
      labelHeight: 0.68,
      fontSize: 86
    });
    const pageCacheZone = BABYLON.MeshBuilder.CreateBox("presenterPageCacheZone", {
      width: 4.84,
      height: 1.18,
      depth: 0.08
    }, scene);
    pageCacheZone.parent = ramModule.root;
    pageCacheZone.position = new BABYLON.Vector3(0, 0.14, 0.14);
    const pageCacheMaterial = createSurfaceMaterial("presenterPageCacheMaterial", palette.pageCache || "#46c9ff", 0.56, 0.08);
    pageCacheZone.material = pageCacheMaterial;
    const pageCacheLabel = createLabelNode("presenterPageCacheLabel", "Page Cache / dirty", {
      planeWidth: 3.4,
      planeHeight: 0.52,
      textureWidth: 896,
      textureHeight: 220,
      fontSize: 74,
      backgroundAlpha: 0.16
    });
    pageCacheLabel.plane.parent = ramModule.root;
    pageCacheLabel.plane.position = new BABYLON.Vector3(0, 1.34, 0.2);
    pageCacheLabel.setAlpha(0);
    const cacheMissLabel = createLabelNode("presenterCacheMissLabel", "Cache miss", {
      planeWidth: 2.4,
      planeHeight: 0.58,
      textureWidth: 768,
      textureHeight: 220,
      fontSize: 90,
      backgroundAlpha: 0.22,
      borderStyle: "rgba(255, 95, 114, 0.4)"
    });
    cacheMissLabel.plane.parent = ramModule.root;
    cacheMissLabel.plane.position = new BABYLON.Vector3(0, 2.06, 0);
    cacheMissLabel.setAlpha(0);
    const raidModule = createModule("presenterRaid", "Dateisystem +\nRAID 0", positions.raid, {
      color: palette.raidBase || "#ffb15b",
      accent: palette.requestSignal || "#f4f8ff",
      size: { width: 4.15, height: 1.6, depth: 2.65 },
      labelWidth: 3.5,
      labelHeight: 0.92,
      fontSize: 72
    });
    const logicalVolumeLabel = createLabelNode("presenterLogicalVolume", sceneData.logicalVolumeLabel || "Logisches Laufwerk RAID 0", {
      planeWidth: 6.1,
      planeHeight: 0.78,
      textureWidth: 1400,
      textureHeight: 220,
      fontSize: 84,
      backgroundAlpha: 0.18
    });
    logicalVolumeLabel.plane.position = positions.raid.add(new BABYLON.Vector3(0, 4.7, 0));
    const stripeSizeLabel = createLabelNode("presenterStripeSize", sceneData.stripeSizeLabel || "64 KiB Stripe-Elemente", {
      planeWidth: 3.8,
      planeHeight: 0.58,
      textureWidth: 960,
      textureHeight: 220,
      fontSize: 72,
      backgroundAlpha: 0.18
    });
    stripeSizeLabel.plane.position = positions.raid.add(new BABYLON.Vector3(0, 2.1, 0));
    stripeSizeLabel.setAlpha(0);
    const dmaLabel = createLabelNode("presenterDmaLabel", "DMA", {
      planeWidth: 1.34,
      planeHeight: 0.48,
      textureWidth: 512,
      textureHeight: 220,
      fontSize: 96,
      backgroundAlpha: 0.14
    });
    dmaLabel.plane.position = positions.nic.add(new BABYLON.Vector3(2.55, -0.18, 0.55));
    dmaLabel.setAlpha(0);
    const irqLabel = createLabelNode("presenterIrqLabel", "IRQ", {
      planeWidth: 1.18,
      planeHeight: 0.48,
      textureWidth: 512,
      textureHeight: 220,
      fontSize: 92,
      backgroundAlpha: 0.14
    });
    irqLabel.plane.position = positions.cpu.add(new BABYLON.Vector3(-1.1, -0.3, 0.2));
    irqLabel.setAlpha(0);
    const writeLabel = createLabelNode("presenterWriteLabel", "write()", {
      planeWidth: 1.8,
      planeHeight: 0.48,
      textureWidth: 640,
      textureHeight: 220,
      fontSize: 84,
      backgroundAlpha: 0.16
    });
    writeLabel.plane.position = positions.raid.add(new BABYLON.Vector3(-2.4, 1.28, 0));
    writeLabel.setAlpha(0);
    const readLabel = createLabelNode("presenterReadLabel", "read()", {
      planeWidth: 1.62,
      planeHeight: 0.48,
      textureWidth: 640,
      textureHeight: 220,
      fontSize: 84,
      backgroundAlpha: 0.16
    });
    readLabel.plane.position = positions.raid.add(new BABYLON.Vector3(-1.5, 1.95, 0));
    readLabel.setAlpha(0);

    const drive0 = createDrive("presenterDisk0", "Disk 0", positions.disk0);
    const drive1 = createDrive("presenterDisk1", "Disk 1", positions.disk1);

    const fileFrame = BABYLON.MeshBuilder.CreateBox("presenterFileFrame", {
      width: 4.75,
      height: 0.92,
      depth: 0.62
    }, scene);
    const fileFrameMaterial = createSurfaceMaterial("presenterFileFrameMaterial", palette.requestSignal || "#f4f8ff", 0.5, 0.08);
    fileFrame.material = fileFrameMaterial;
    const fileLabel = createLabelNode("presenterFileLabel", sceneData.fileLabel || "Datei F", {
      planeWidth: 1.78,
      planeHeight: 0.48,
      textureWidth: 640,
      textureHeight: 220,
      fontSize: 90,
      backgroundAlpha: 0.16
    });

    const stripeBoard = new BABYLON.TransformNode("presenterStripeBoardRoot", scene);
    stripeBoard.position = positions.raid.add(new BABYLON.Vector3(0.15, -1.3, -4.15));
    const stripeBoardPanel = BABYLON.MeshBuilder.CreatePlane("presenterStripeBoardPanel", {
      width: 5.8,
      height: 3.1
    }, scene);
    stripeBoardPanel.parent = stripeBoard;
    const stripeBoardPanelMaterial = createSurfaceMaterial("presenterStripeBoardPanelMaterial", palette.backgroundTop || "#081529", 0.42, 0.72);
    stripeBoardPanel.material = stripeBoardPanelMaterial;
    const stripeBoardTitle = createLabelNode("presenterStripeBoardTitle", "Stripe-Beispiel", {
      planeWidth: 3.4,
      planeHeight: 0.46,
      textureWidth: 896,
      textureHeight: 200,
      fontSize: 82,
      backgroundAlpha: 0
    });
    stripeBoardTitle.plane.parent = stripeBoard;
    stripeBoardTitle.plane.position = new BABYLON.Vector3(0, 1.1, -0.02);
    const stripeBoardDisk0Label = createLabelNode("presenterStripeBoardDisk0", "Disk 0", {
      planeWidth: 1.5,
      planeHeight: 0.36,
      textureWidth: 512,
      textureHeight: 180,
      fontSize: 72,
      backgroundAlpha: 0
    });
    stripeBoardDisk0Label.plane.parent = stripeBoard;
    stripeBoardDisk0Label.plane.position = new BABYLON.Vector3(-2.05, 0.28, -0.02);
    const stripeBoardDisk1Label = createLabelNode("presenterStripeBoardDisk1", "Disk 1", {
      planeWidth: 1.5,
      planeHeight: 0.36,
      textureWidth: 512,
      textureHeight: 180,
      fontSize: 72,
      backgroundAlpha: 0
    });
    stripeBoardDisk1Label.plane.parent = stripeBoard;
    stripeBoardDisk1Label.plane.position = new BABYLON.Vector3(-2.05, -0.74, -0.02);

    const stripingMiniBlocks = {
      d0A: createDataBlock("stripe_board_d0a", "A"),
      d0C: createDataBlock("stripe_board_d0c", "C"),
      d1B: createDataBlock("stripe_board_d1b", "B"),
      d1D: createDataBlock("stripe_board_d1d", "D")
    };
    [
      { key: "d0A", position: new BABYLON.Vector3(0.15, 0.26, -0.02) },
      { key: "d0C", position: new BABYLON.Vector3(1.48, 0.26, -0.02) },
      { key: "d1B", position: new BABYLON.Vector3(0.15, -0.74, -0.02) },
      { key: "d1D", position: new BABYLON.Vector3(1.48, -0.74, -0.02) }
    ].forEach((entry) => {
      const block = stripingMiniBlocks[entry.key];
      block.root.parent = stripeBoard;
      block.root.position.copyFrom(entry.position);
      block.root.scaling.setAll(0.52);
    });
    stripeBoard.setEnabled(false);

    const warningBanner = createLabelNode("presenterWarningBanner", "Schnell, aber ohne Sicherheit", {
      planeWidth: 7.2,
      planeHeight: 0.92,
      textureWidth: 1600,
      textureHeight: 240,
      fontSize: 88,
      backgroundAlpha: 0.34,
      borderStyle: "rgba(255, 95, 114, 0.48)"
    });
    warningBanner.plane.position = new BABYLON.Vector3(2.2, 7.65, 0);
    warningBanner.setAlpha(0);

    const conduits = Object.freeze({
      lanToNic: createConduit("presenterLanToNic", [
        positions.lan.add(new BABYLON.Vector3(0.82, 0, 0)),
        positions.nic.add(new BABYLON.Vector3(-1.9, 0, 0))
      ], 0.11),
      irqToCpu: createConduit("presenterIrqToCpu", [
        positions.nic.add(new BABYLON.Vector3(1.22, 0.44, 0)),
        positions.cpu.add(new BABYLON.Vector3(-1.7, -0.28, 0.2))
      ], 0.045),
      dmaToRam: createConduit("presenterDmaToRam", [
        positions.nic.add(new BABYLON.Vector3(1.25, -0.32, 0)),
        positions.nic.add(new BABYLON.Vector3(2.8, -0.42, 0)),
        positions.ram.add(new BABYLON.Vector3(-2.35, 0.22, 0))
      ], 0.08),
      cpuToRaid: createConduit("presenterCpuToRaid", [
        positions.cpu.add(new BABYLON.Vector3(1.65, -0.26, 0)),
        positions.raid.add(new BABYLON.Vector3(-2.3, 0.78, 0))
      ], 0.05),
      ramToRaid: createConduit("presenterRamToRaid", [
        positions.ram.add(new BABYLON.Vector3(2.2, 0.16, 0)),
        positions.raid.add(new BABYLON.Vector3(-2.25, -0.06, 0))
      ], 0.08),
      raidToDisk0: createConduit("presenterRaidToDisk0", [
        positions.raid.add(new BABYLON.Vector3(2.3, 0.42, -0.18)),
        positions.raid.add(new BABYLON.Vector3(5.2, 0.62, -1.9)),
        drive0.ingressPoint
      ], 0.08),
      raidToDisk1: createConduit("presenterRaidToDisk1", [
        positions.raid.add(new BABYLON.Vector3(2.3, 0.42, 0.18)),
        positions.raid.add(new BABYLON.Vector3(5.2, 0.62, 1.9)),
        drive1.ingressPoint
      ], 0.08)
    });

    const readSamplers = Object.freeze({
      disk0ToRam: buildPathSampler([
        drive0.ingressPoint.asArray(),
        positions.raid.add(new BABYLON.Vector3(5.05, 0.55, -1.86)).asArray(),
        positions.raid.add(new BABYLON.Vector3(2.22, 0.18, -0.14)).asArray(),
        positions.ram.add(new BABYLON.Vector3(2.1, 0.22, 0)).asArray(),
        positions.ram.add(new BABYLON.Vector3(-1.8, 0.22, 0)).asArray()
      ]),
      disk1ToRam: buildPathSampler([
        drive1.ingressPoint.asArray(),
        positions.raid.add(new BABYLON.Vector3(5.05, 0.55, 1.86)).asArray(),
        positions.raid.add(new BABYLON.Vector3(2.22, 0.18, 0.14)).asArray(),
        positions.ram.add(new BABYLON.Vector3(2.1, 0.22, 0)).asArray(),
        positions.ram.add(new BABYLON.Vector3(-1.8, 0.22, 0)).asArray()
      ]),
      status0: buildPathSampler([
        drive0.ingressPoint.add(new BABYLON.Vector3(0.2, -0.22, 0)).asArray(),
        positions.raid.add(new BABYLON.Vector3(4.5, 1.2, -1.4)).asArray(),
        positions.raid.add(new BABYLON.Vector3(0.8, 1.5, 0)).asArray(),
        positions.cpu.add(new BABYLON.Vector3(-0.2, -0.15, 0)).asArray()
      ]),
      status1: buildPathSampler([
        drive1.ingressPoint.add(new BABYLON.Vector3(0.2, -0.22, 0)).asArray(),
        positions.raid.add(new BABYLON.Vector3(4.5, 1.2, 1.4)).asArray(),
        positions.raid.add(new BABYLON.Vector3(0.8, 1.5, 0)).asArray(),
        positions.cpu.add(new BABYLON.Vector3(-0.2, -0.15, 0)).asArray()
      ])
    });

    const networkPulses = Array.from({ length: 6 }, (_, index) => createPulse(`presenterNetworkPulse_${index}`, palette.dataSignal || "#ff9b4d"));
    const dmaPulses = Array.from({ length: 5 }, (_, index) => createPulse(`presenterDmaPulse_${index}`, palette.dataSignal || "#ff9b4d", {
      width: 0.34,
      height: 0.16,
      depth: 0.22
    }));
    const irqPulse = createPulse("presenterIrqPulse", palette.statusSignal || "#74f7b2", {
      shape: "sphere",
      diameter: 0.22
    });
    const writeRequestPulses = Array.from({ length: 2 }, (_, index) => createPulse(`presenterWriteRequest_${index}`, palette.requestSignal || "#f4f8ff", {
      width: 0.26,
      height: 0.14,
      depth: 0.14
    }));
    const readRequestPulses0 = Array.from({ length: 2 }, (_, index) => createPulse(`presenterReadRequest0_${index}`, palette.requestSignal || "#f4f8ff", {
      width: 0.26,
      height: 0.14,
      depth: 0.14
    }));
    const readRequestPulses1 = Array.from({ length: 2 }, (_, index) => createPulse(`presenterReadRequest1_${index}`, palette.requestSignal || "#f4f8ff", {
      width: 0.26,
      height: 0.14,
      depth: 0.14
    }));
    const statusPulses0 = Array.from({ length: 2 }, (_, index) => createPulse(`presenterStatus0_${index}`, palette.statusSignal || "#74f7b2", {
      shape: "sphere",
      diameter: 0.22
    }));
    const statusPulses1 = Array.from({ length: 2 }, (_, index) => createPulse(`presenterStatus1_${index}`, palette.statusSignal || "#74f7b2", {
      shape: "sphere",
      diameter: 0.22
    }));

    const dataBlocks = Object.fromEntries((Array.isArray(sceneData.blockIds) ? sceneData.blockIds : ["A", "B", "C", "D"]).map((id) => [id, createDataBlock(id, id)]));
    const ramSlots = Object.freeze({
      A: positions.ram.add(new BABYLON.Vector3(-1.35, 0.68, -0.55)),
      B: positions.ram.add(new BABYLON.Vector3(-0.45, 0.68, -0.18)),
      C: positions.ram.add(new BABYLON.Vector3(0.45, 0.68, 0.18)),
      D: positions.ram.add(new BABYLON.Vector3(1.35, 0.68, 0.55))
    });
    const raidSlots = Object.freeze({
      A: positions.raid.add(new BABYLON.Vector3(-1.25, 1.15, -0.75)),
      B: positions.raid.add(new BABYLON.Vector3(-0.35, 1.15, -0.25)),
      C: positions.raid.add(new BABYLON.Vector3(0.55, 1.15, 0.25)),
      D: positions.raid.add(new BABYLON.Vector3(1.45, 1.15, 0.75))
    });
    const diskApproach = Object.freeze({
      A: drive0.ingressPoint.add(new BABYLON.Vector3(-0.15, 0.2, -0.14)),
      C: drive0.ingressPoint.add(new BABYLON.Vector3(-0.15, -0.24, 0.14)),
      B: drive1.ingressPoint.add(new BABYLON.Vector3(-0.15, 0.2, 0.14)),
      D: drive1.ingressPoint.add(new BABYLON.Vector3(-0.15, -0.24, -0.14))
    });
    const finalRamSlots = Object.freeze({
      A: positions.ram.add(new BABYLON.Vector3(-1.45, 0.7, -0.52)),
      B: positions.ram.add(new BABYLON.Vector3(-0.48, 0.7, -0.18)),
      C: positions.ram.add(new BABYLON.Vector3(0.48, 0.7, 0.18)),
      D: positions.ram.add(new BABYLON.Vector3(1.45, 0.7, 0.52))
    });
    const writeTravel = Object.freeze({
      A: { start: 28900, end: 32400, sampler: conduits.raidToDisk0.sampler },
      B: { start: 29600, end: 33100, sampler: conduits.raidToDisk1.sampler },
      C: { start: 30900, end: 34200, sampler: conduits.raidToDisk0.sampler },
      D: { start: 31600, end: 34900, sampler: conduits.raidToDisk1.sampler }
    });
    const readTravel = Object.freeze({
      A: { start: 57600, end: 60600, sampler: readSamplers.disk0ToRam },
      B: { start: 58500, end: 61500, sampler: readSamplers.disk1ToRam },
      C: { start: 60100, end: 63200, sampler: readSamplers.disk0ToRam },
      D: { start: 61000, end: 64000, sampler: readSamplers.disk1ToRam }
    });

    let currentElapsedMs = 0;
    const freeFlyState = {
      enabled: true,
      ascend: false,
      descend: false,
      forwardLeft: false,
      forwardRight: false,
      backwardLeft: false,
      backwardRight: false,
      mouseHeld: false
    };
    const defaultMoveKeysPressed = new Set();

    function focusSceneCanvas() {
      if (typeof canvas.focus !== "function") return;
      try {
        canvas.focus({ preventScroll: true });
      } catch {
        canvas.focus();
      }
    }

    function isTextEntryElement(node) {
      if (!(node instanceof HTMLElement)) return false;
      const tagName = String(node.tagName || "").toLowerCase();
      if (tagName === "textarea" || tagName === "select") return true;
      if (tagName === "input") {
        const inputType = String(node.getAttribute("type") || "text").toLowerCase();
        return inputType !== "button" && inputType !== "checkbox" && inputType !== "radio" && inputType !== "range";
      }
      return node.isContentEditable;
    }

    function isFreeFlyKeyboardActive() {
      if (!freeFlyState.enabled) return false;
      if (freeFlyState.mouseHeld) return true;
      if (document.activeElement === canvas) return true;
      return !isTextEntryElement(document.activeElement);
    }

    function hasActiveFreeFlyInput() {
      return freeFlyState.mouseHeld
        || defaultMoveKeysPressed.size > 0
        || freeFlyState.ascend
        || freeFlyState.descend
        || freeFlyState.forwardLeft
        || freeFlyState.forwardRight
        || freeFlyState.backwardLeft
        || freeFlyState.backwardRight;
    }

    function isDefaultMovementKey(event) {
      const code = String(event?.code || "");
      return code === "KeyW"
        || code === "KeyA"
        || code === "KeyS"
        || code === "KeyD"
        || code === "ArrowUp"
        || code === "ArrowDown"
        || code === "ArrowLeft"
        || code === "ArrowRight";
    }

    function clearFreeFlyMovement() {
      freeFlyState.ascend = false;
      freeFlyState.descend = false;
      freeFlyState.forwardLeft = false;
      freeFlyState.forwardRight = false;
      freeFlyState.backwardLeft = false;
      freeFlyState.backwardRight = false;
      defaultMoveKeysPressed.clear();
    }

    function handleFreeFlyKeyEvent(event, isPressed) {
      if (!event || (isPressed && !isFreeFlyKeyboardActive())) return;
      if (isPressed) {
        focusSceneCanvas();
      }
      const code = String(event.code || "");
      if (isDefaultMovementKey(event)) {
        if (isPressed) {
          defaultMoveKeysPressed.add(code);
        } else {
          defaultMoveKeysPressed.delete(code);
        }
      }
      const key = String(event.key || "");
      if (code === "Space") {
        freeFlyState.ascend = isPressed;
        event.preventDefault();
        return;
      }
      if (
        code === "ShiftLeft" ||
        code === "ShiftRight" ||
        code === "ControlLeft" ||
        code === "ControlRight"
      ) {
        freeFlyState.descend = isPressed;
        event.preventDefault();
        return;
      }
      if (code === "KeyQ") {
        freeFlyState.forwardLeft = isPressed;
        event.preventDefault();
        return;
      }
      if (code === "KeyE") {
        freeFlyState.forwardRight = isPressed;
        event.preventDefault();
        return;
      }
      if (code === "KeyX" || key === "x" || key === "X") {
        freeFlyState.backwardRight = isPressed;
        event.preventDefault();
        return;
      }
      if (code === "IntlBackslash" || code === "Comma" || key === "<" || key === ",") {
        freeFlyState.backwardLeft = isPressed;
        event.preventDefault();
      }
    }

    const handleFreeFlyKeyDown = (event) => {
      handleFreeFlyKeyEvent(event, true);
    };
    const handleFreeFlyKeyUp = (event) => {
      handleFreeFlyKeyEvent(event, false);
    };
    global.addEventListener("keydown", handleFreeFlyKeyDown);
    global.addEventListener("keyup", handleFreeFlyKeyUp);
    global.addEventListener("blur", clearFreeFlyMovement);
    canvas.addEventListener("blur", clearFreeFlyMovement);

    function setLabelAlpha(labelNode, alpha) {
      if (!labelNode) return;
      labelNode.setAlpha(alpha);
    }

    function setPulseState(pulse, sampler, progress, alpha = 1, scale = 1) {
      const safeAlpha = clamp(alpha, 0, 1);
      if (!pulse || !sampler || safeAlpha <= 0.02 || progress < 0 || progress > 1) {
        if (pulse) pulse.root.setEnabled(false);
        return;
      }
      pulse.root.setEnabled(true);
      pulse.root.position.copyFrom(sampler.sample(progress));
      pulse.root.scaling.setAll(scale);
      pulse.material.alpha = safeAlpha;
      pulse.material.emissiveColor = pulse.material.diffuseColor.scale(0.8 + (0.45 * safeAlpha));
    }

    function updatePulseTrain(pulses, sampler, elapsedMs, options = {}) {
      const startMs = Number(options.startMs || 0);
      const endMs = Number(options.endMs || startMs + 1);
      const colorAlpha = Number(options.alpha ?? 1);
      const cycles = Math.max(0.6, Number(options.cycles || pulses.length || 1));
      const spacing = Number(options.spacing || 0.18);
      const scale = Number(options.scale || 1);
      const safeElapsed = Number(elapsedMs || 0);
      if (safeElapsed < startMs || safeElapsed > endMs) {
        pulses.forEach((pulse) => {
          pulse.root.setEnabled(false);
        });
        return;
      }
      const localProgress = (safeElapsed - startMs) / Math.max(1, endMs - startMs);
      pulses.forEach((pulse, index) => {
        const travel = (localProgress * cycles) - (index * spacing);
        const wrapped = travel - Math.floor(travel);
        const visibility = travel >= 0 && travel <= cycles + 0.35 ? 1 : 0;
        setPulseState(pulse, sampler, wrapped, visibility * colorAlpha, scale);
      });
    }

    function updateModuleVisual(module, elapsedMs, intensity = 0) {
      const safeIntensity = clamp(intensity, 0, 1.25);
      const shellBaseAlpha = Number(module.shellBaseAlpha ?? 0.1);
      const shellPulseAlpha = Number(module.shellPulseAlpha ?? 0.16);
      const bob = Math.sin((elapsedMs * 0.0015) + (module.basePosition.x * 0.11)) * (0.03 + (0.05 * safeIntensity));
      module.root.position.x = module.basePosition.x;
      module.root.position.y = module.basePosition.y + bob;
      module.root.position.z = module.basePosition.z;
      module.bodyMaterial.emissiveColor = module.baseColor.scale(0.18 + (0.26 * safeIntensity)).add(module.accentColor.scale(0.16 * safeIntensity));
      module.shellMaterial.alpha = shellBaseAlpha + (shellPulseAlpha * safeIntensity);
      module.accentMaterial.emissiveColor = module.accentColor.scale(0.48 + (0.68 * safeIntensity));
      module.indicatorMaterial.emissiveColor = module.accentColor.scale(0.42 + (1.15 * safeIntensity));
      if (Array.isArray(module.detailMaterials)) {
        module.detailMaterials.forEach((material, index) => {
          if (!material || !material.diffuseColor) return;
          material.emissiveColor = material.diffuseColor.scale(0.06 + (safeIntensity * (0.08 + (index * 0.01))));
        });
      }
      module.label.material.alpha = 0.78 + (0.2 * safeIntensity);
    }

    function updateDriveVisual(drive, elapsedMs, activity = 0, mode = "idle") {
      const safeActivity = clamp(activity, 0, 1.4);
      drive.root.position.copyFrom(drive.basePosition);
      drive.root.position.y += Math.sin((elapsedMs * 0.0013) + (drive.basePosition.z * 0.06)) * (0.02 + (0.02 * safeActivity));
      const spin = (elapsedMs * (0.0022 + (safeActivity * 0.0048)));
      drive.platters.forEach((platter, index) => {
        platter.rotation.y = spin * (index % 2 === 0 ? 1 : -1);
      });
      drive.armPivot.rotation.y = -0.84 + (safeActivity * 0.92) + (Math.sin((elapsedMs * 0.0024) + drive.basePosition.z) * 0.08 * safeActivity);
      drive.shellMaterial.alpha = 0.1 + (safeActivity * 0.08);
      drive.frameMaterial.alpha = 0.11 + (safeActivity * 0.17);
      drive.controllerMaterial.emissiveColor = color3(mode === "danger" ? palette.danger : palette.chassisBase, "#101f3b").scale(0.28 + (safeActivity * 0.68));
      drive.ledMaterial.emissiveColor = color3(
        mode === "status" ? palette.statusSignal :
          mode === "danger" ? palette.danger :
            palette.dataSignal,
        "#ff9b4d"
      ).scale(0.34 + (safeActivity * 1.1));
      drive.sectorLights.forEach((sectorLight, index) => {
        const angle = spin * 2.4 + (index * 0.7);
        const radius = 0.82 + (0.1 * index);
        sectorLight.mesh.position.x = Math.cos(angle) * radius;
        sectorLight.mesh.position.y = sectorLight.basePosition.y;
        sectorLight.mesh.position.z = Math.sin(angle) * radius;
        sectorLight.material.diffuseColor = color3(
          mode === "status" ? palette.statusSignal :
            mode === "danger" ? palette.danger :
              palette.dataSignal,
          "#ff9b4d"
        );
        sectorLight.material.emissiveColor = sectorLight.material.diffuseColor.scale(0.8 + (0.62 * safeActivity));
        sectorLight.material.alpha = safeActivity * 0.88;
      });
      drive.label.material.alpha = mode === "danger" ? 0.98 : 0.84;
    }

    function setBlockState(block, options = {}) {
      const visible = Boolean(options.visible);
      block.root.setEnabled(visible);
      if (!visible) return;
      if (options.position) {
        block.root.position.copyFrom(options.position);
      }
      const scale = Number(options.scale || 1);
      block.root.scaling.setAll(scale);
      block.root.rotation.y = Number(options.rotationY || 0);
      const alpha = clamp(Number(options.alpha ?? 1), 0, 1);
      block.bodyMaterial.alpha = alpha;
      block.bodyMaterial.emissiveColor = color3(palette.dataSignal || "#ff9b4d").scale(0.72 + (0.45 * alpha));
      block.shellMaterial.alpha = 0.1 * alpha;
      block.label.material.alpha = alpha;
    }

    function vector3ToPlain(vector) {
      return Object.freeze({
        x: Number(vector?.x || 0),
        y: Number(vector?.y || 0),
        z: Number(vector?.z || 0)
      });
    }

    function getBaseCameraPose() {
      const fallbackTarget = Array.isArray(cameraConfig.target) ? cameraConfig.target : [0, 2.8, 0];
      const target = toVector3(cameraConfig.target, fallbackTarget);
      const alpha = Number(cameraConfig.alpha || -1.08);
      const beta = clamp(Number(cameraConfig.beta || 1.05), 0.05, Math.PI - 0.05);
      const radius = Math.max(0.1, Number(cameraConfig.radius || 29));
      const sinBeta = Math.sin(beta);
      const position = new BABYLON.Vector3(
        target.x + (radius * Math.cos(alpha) * sinBeta),
        target.y + (radius * Math.cos(beta)),
        target.z + (radius * Math.sin(alpha) * sinBeta)
      );
      return Object.freeze({
        position: vector3ToPlain(position),
        target: vector3ToPlain(target),
        rotation: Object.freeze({
          x: beta - (Math.PI / 2),
          y: alpha + (Math.PI / 2),
          z: 0
        })
      });
    }

    function getCueCameraPose(cueCamera = null) {
      const safeCamera = cueCamera && typeof cueCamera === "object" ? cueCamera : {};
      const fallbackTarget = Array.isArray(cameraConfig.target) ? cameraConfig.target : [0, 2.8, 0];
      const target = toVector3(safeCamera.target, fallbackTarget);
      const alpha = Number.isFinite(Number(safeCamera.alpha)) ? Number(safeCamera.alpha) : Number(cameraConfig.alpha || -1.08);
      const beta = clamp(
        Number.isFinite(Number(safeCamera.beta)) ? Number(safeCamera.beta) : Number(cameraConfig.beta || 1.05),
        0.05,
        Math.PI - 0.05
      );
      const radius = Math.max(
        0.1,
        Number.isFinite(Number(safeCamera.radius)) ? Number(safeCamera.radius) : Number(cameraConfig.radius || 29)
      );
      const sinBeta = Math.sin(beta);
      const position = new BABYLON.Vector3(
        target.x + (radius * Math.cos(alpha) * sinBeta),
        target.y + (radius * Math.cos(beta)),
        target.z + (radius * Math.sin(alpha) * sinBeta)
      );
      return Object.freeze({
        position: vector3ToPlain(position),
        target: vector3ToPlain(target),
        rotation: Object.freeze({
          x: beta - (Math.PI / 2),
          y: alpha + (Math.PI / 2),
          z: 0
        })
      });
    }

    function getNormalizedPlayerJumpSequence() {
      const cueList = Array.isArray(cues) ? cues : [];
      return cueList.map((cue, index) => {
        const safeCue = cue && typeof cue === "object" ? cue : {};
        const startMs = clamp(index === 0 ? 0 : Number(safeCue.startMs || 0), 0, durationMs);
        const nextCue = cueList[index + 1] || null;
        const fallbackEndMs = nextCue
          ? clamp(Number(nextCue.startMs || 0), startMs, durationMs)
          : durationMs;
        const requestedEndMs = Number(safeCue.endMs);
        const endMs = Number.isFinite(requestedEndMs) && requestedEndMs > startMs
          ? clamp(requestedEndMs, startMs, durationMs)
          : fallbackEndMs;
        return Object.freeze({
          cue: safeCue,
          index,
          startMs,
          endMs,
          pose: getCueCameraPose(safeCue.camera)
        });
      });
    }

    function getPlayerJumpTransitionDuration(currentEntry, nextEntry) {
      const startMs = clamp(Number(currentEntry?.startMs || 0), 0, durationMs);
      const boundaryMs = clamp(
        nextEntry ? Number(nextEntry.startMs || startMs) : Number(currentEntry?.endMs || durationMs),
        startMs,
        durationMs
      );
      const availableMs = Math.max(0, boundaryMs - startMs);
      if (availableMs <= 0) return 0;
      return Math.min(availableMs, clamp(availableMs * 0.4, 900, 1800));
    }

    function blendPlayerCameraPose(startPose, endPose, progress) {
      const safeStartPose = startPose && typeof startPose === "object" ? startPose : {};
      const safeEndPose = endPose && typeof endPose === "object" ? endPose : {};
      const safeProgress = clamp(progress, 0, 1);
      const slideProgress = safeProgress <= 0.65 ? ease(safeProgress / 0.65) : 1;
      const lookProgress = safeProgress <= 0.35 ? 0 : ease((safeProgress - 0.35) / 0.65);
      const startPosition = safeStartPose.position || {};
      const endPosition = safeEndPose.position || {};
      const startTarget = safeStartPose.target || {};
      const endTarget = safeEndPose.target || {};
      const startRotation = safeStartPose.rotation || {};
      const endRotation = safeEndPose.rotation || {};
      return Object.freeze({
        position: Object.freeze({
          x: lerpNumber(Number(startPosition.x || 0), Number(endPosition.x || 0), slideProgress),
          y: lerpNumber(Number(startPosition.y || 0), Number(endPosition.y || 0), slideProgress),
          z: lerpNumber(Number(startPosition.z || 0), Number(endPosition.z || 0), slideProgress)
        }),
        target: Object.freeze({
          x: lerpNumber(Number(startTarget.x || 0), Number(endTarget.x || 0), lookProgress),
          y: lerpNumber(Number(startTarget.y || 0), Number(endTarget.y || 0), lookProgress),
          z: lerpNumber(Number(startTarget.z || 0), Number(endTarget.z || 0), lookProgress)
        }),
        rotation: Object.freeze({
          x: lerpNumber(Number(startRotation.x || 0), Number(endRotation.x || 0), lookProgress),
          y: lerpNumber(Number(startRotation.y || 0), Number(endRotation.y || 0), lookProgress),
          z: lerpNumber(Number(startRotation.z || 0), Number(endRotation.z || 0), lookProgress)
        })
      });
    }

    function resolvePlayerCameraPose(elapsedMs) {
      const safeElapsed = clamp(elapsedMs, 0, durationMs);
      const basePose = getBaseCameraPose();
      if (!playerCameraState.jumpsEnabled) {
        return basePose;
      }
      const jumpSequence = getNormalizedPlayerJumpSequence();
      if (!jumpSequence.length) {
        return basePose;
      }
      if (jumpSequence.length === 1 || safeElapsed <= jumpSequence[0].startMs) {
        return jumpSequence[0].pose || basePose;
      }
      for (let index = jumpSequence.length - 1; index >= 1; index -= 1) {
        const currentEntry = jumpSequence[index];
        if (safeElapsed < currentEntry.startMs) {
          continue;
        }
        const previousEntry = jumpSequence[index - 1] || currentEntry;
        const nextEntry = jumpSequence[index + 1] || null;
        const transitionDurationMs = getPlayerJumpTransitionDuration(currentEntry, nextEntry);
        if (transitionDurationMs > 0 && safeElapsed <= currentEntry.startMs + transitionDurationMs) {
          return blendPlayerCameraPose(
            previousEntry.pose || basePose,
            currentEntry.pose || previousEntry.pose || basePose,
            (safeElapsed - currentEntry.startMs) / transitionDurationMs
          );
        }
        return currentEntry.pose || previousEntry.pose || basePose;
      }
      return jumpSequence[0].pose || basePose;
    }

    function applyPoseToFreeCamera(nextPose) {
      const pose = nextPose && typeof nextPose === "object" ? nextPose : null;
      if (!pose) return false;
      scene.activeCamera = freeCamera;
      if (pose.position && typeof pose.position === "object") {
        freeCamera.position.copyFromFloats(
          Number(pose.position.x || 0),
          Number(pose.position.y || 0),
          Number(pose.position.z || 0)
        );
      }
      if (pose.target && typeof pose.target === "object") {
        freeCamera.setTarget(new BABYLON.Vector3(
          Number(pose.target.x || 0),
          Number(pose.target.y || 0),
          Number(pose.target.z || 0)
        ));
      } else if (pose.rotation && typeof pose.rotation === "object") {
        freeCamera.rotation.copyFromFloats(
          Number(pose.rotation.x || 0),
          Number(pose.rotation.y || 0),
          Number(pose.rotation.z || 0)
        );
      }
      if (freeCamera.cameraDirection?.setAll) freeCamera.cameraDirection.setAll(0);
      if (freeCamera.cameraRotation) {
        freeCamera.cameraRotation.x = 0;
        freeCamera.cameraRotation.y = 0;
      }
      return true;
    }

    function getCurrentFreeCameraPose() {
      const currentTarget = typeof freeCamera.getTarget === "function"
        ? freeCamera.getTarget()
        : freeCamera.position.add(freeCamera.getForwardRay().direction.clone().normalize().scale(8));
      return Object.freeze({
        position: vectorToPlain(freeCamera.position),
        target: vectorToPlain(currentTarget),
        rotation: vectorToPlain(freeCamera.rotation)
      });
    }

    function clearCameraPreview(options = {}) {
      const shouldApplyEndPose = options.applyEndPose !== false;
      const shouldRestoreFreeFly = options.restoreFreeFly !== false;
      if (!cameraPreviewState.active) return false;
      const endPose = cameraPreviewState.endPose;
      const restoreFreeFlyEnabled = cameraPreviewState.restoreFreeFlyEnabled;
      cameraPreviewState.active = false;
      cameraPreviewState.startedAtMs = 0;
      cameraPreviewState.durationMs = 0;
      cameraPreviewState.startPose = null;
      cameraPreviewState.endPose = null;
      cameraPreviewState.restoreFreeFlyEnabled = false;
      if (shouldApplyEndPose && endPose) {
        applyPoseToFreeCamera(endPose);
      }
      if (shouldRestoreFreeFly && restoreFreeFlyEnabled && !playerCameraState.playbackActive) {
        freeFlyState.enabled = true;
      }
      return true;
    }

    function startPlayerCameraPreview(nextPose, durationMs = 0) {
      const endPose = nextPose && typeof nextPose === "object" ? nextPose : null;
      if (!endPose) return false;
      clearCameraPreview({ applyEndPose: false, restoreFreeFly: false });
      cameraPreviewState.active = true;
      cameraPreviewState.startedAtMs = global.performance.now();
      cameraPreviewState.durationMs = clamp(durationMs || 1100, 220, 2200);
      cameraPreviewState.startPose = getCurrentFreeCameraPose();
      cameraPreviewState.endPose = endPose;
      cameraPreviewState.restoreFreeFlyEnabled = freeFlyState.enabled;
      freeFlyState.enabled = false;
      clearFreeFlyMovement();
      scene.activeCamera = freeCamera;
      return true;
    }

    function syncPlayerCameraPose(elapsedMs = currentElapsedMs) {
      return applyPoseToFreeCamera(resolvePlayerCameraPose(elapsedMs));
    }

    function getFreeFlyTravelSpeed() {
      if (typeof freeCamera._computeLocalCameraSpeed === "function") {
        return freeCamera._computeLocalCameraSpeed();
      }
      const fps = Number(engine.getFps?.() || 60);
      const deltaTime = Number(engine.getDeltaTime?.() || 16.6667);
      const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 60;
      const safeDelta = Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : 16.6667;
      return freeCamera.speed * (safeDelta / (safeFps * 10));
    }

    function updateFreeFlyCamera() {
      if (!freeFlyState.enabled) return;
      const travelSpeed = getFreeFlyTravelSpeed();
      const verticalDirection = Number(freeFlyState.ascend) - Number(freeFlyState.descend);
      if (verticalDirection) {
        freeCamera.cameraDirection.y += verticalDirection * travelSpeed;
      }
      const lateralDirection = Number(freeFlyState.forwardRight || freeFlyState.backwardRight) - Number(freeFlyState.forwardLeft || freeFlyState.backwardLeft);
      const forwardDirection = Number(freeFlyState.forwardLeft || freeFlyState.forwardRight) - Number(freeFlyState.backwardLeft || freeFlyState.backwardRight);
      if (!lateralDirection && !forwardDirection) return;
      const forward = freeCamera.getForwardRay().direction.clone();
      forward.y = 0;
      if (forward.lengthSquared() < 0.0001) {
        forward.copyFromFloats(0, 0, 1);
      } else {
        forward.normalize();
      }
      const right = BABYLON.Vector3.Cross(BABYLON.Axis.Y, forward);
      if (right.lengthSquared() < 0.0001) {
        right.copyFromFloats(1, 0, 0);
      } else {
        right.normalize();
      }
      const movement = forward.scale(forwardDirection).add(right.scale(lateralDirection));
      if (movement.lengthSquared() < 0.0001) return;
      movement.normalize().scaleInPlace(travelSpeed);
      freeCamera.cameraDirection.addInPlace(movement);
    }

    function focusFreeCameraOnCurrentCue() {
      syncPlayerCameraPose(currentElapsedMs);
      scene.activeCamera = freeCamera;
      focusSceneCanvas();
    }

    function vectorToPlain(vector) {
      return Object.freeze({
        x: Number(vector?.x || 0),
        y: Number(vector?.y || 0),
        z: Number(vector?.z || 0)
      });
    }

    function getFreeCameraPose() {
      const forward = freeCamera.getForwardRay().direction.clone();
      if (forward.lengthSquared() < 0.0001) {
        forward.copyFromFloats(0, 0, 1);
      } else {
        forward.normalize();
      }
      const target = freeCamera.position.add(forward.scale(8));
      return Object.freeze({
        position: vectorToPlain(freeCamera.position),
        target: vectorToPlain(target),
        rotation: vectorToPlain(freeCamera.rotation)
      });
    }

    function getFreeCameraCueConfig(referenceCamera = null) {
      const safeReference = referenceCamera && typeof referenceCamera === "object" ? referenceCamera : {};
      const forward = freeCamera.getForwardRay().direction.clone();
      if (forward.lengthSquared() < 0.0001) {
        forward.copyFromFloats(0, 0, 1);
      } else {
        forward.normalize();
      }
      const target = freeCamera.position.add(forward.scale(Math.max(4, Number(safeReference.radius || cameraConfig.radius || 18))));
      const offset = freeCamera.position.subtract(target);
      const radius = Math.max(0.1, offset.length());
      const normalizedY = clamp(offset.y / radius, -1, 1);
      return Object.freeze({
        alpha: Math.atan2(offset.z, offset.x),
        beta: clamp(Math.acos(normalizedY), 0.05, Math.PI - 0.05),
        radius,
        target: Object.freeze([
          Number(target.x || 0),
          Number(target.y || 0),
          Number(target.z || 0)
        ])
      });
    }

    function updateBlockTimeline(elapsedMs) {
      const overviewWeight = cueEnvelope("cue_overview", elapsedMs);
      const assembleWeight = cueEnvelope("cue_os_assembly", elapsedMs);
      const pageCacheWeight = cueEnvelope("cue_page_cache", elapsedMs);
      const splitWeight = cueEnvelope("cue_raid_split", elapsedMs);
      const reassembleWeight = cueEnvelope("cue_reassemble", elapsedMs);
      const riskWeight = cueEnvelope("cue_risk", elapsedMs);

      Object.entries(dataBlocks).forEach(([id, block]) => {
        const writeConfig = writeTravel[id];
        const readConfig = readTravel[id];
        if (elapsedMs < cue("cue_os_assembly").startMs) {
          setBlockState(block, { visible: false });
          return;
        }
        if (elapsedMs <= cue("cue_page_cache").endMs) {
          const progressToRam = elapsedMs < cue("cue_os_assembly").startMs
            ? 0
            : cueProgress("cue_os_assembly", elapsedMs);
          const startPosition = positions.nic.add(new BABYLON.Vector3(2.6, -0.2, 0));
          const targetPosition = blendVector(startPosition, ramSlots[id], progressToRam);
          const alpha = Math.max(assembleWeight, pageCacheWeight, overviewWeight * 0.2);
          setBlockState(block, {
            visible: alpha > 0.02,
            position: targetPosition,
            alpha,
            scale: 0.92 + (0.08 * alpha)
          });
          return;
        }
        if (elapsedMs <= cue("cue_raid_split").endMs) {
          const progress = cueProgress("cue_raid_split", elapsedMs);
          setBlockState(block, {
            visible: true,
            position: blendVector(ramSlots[id], raidSlots[id], progress),
            alpha: 1,
            scale: 1
          });
          return;
        }
        if (elapsedMs < Number(writeConfig.start)) {
          setBlockState(block, {
            visible: true,
            position: raidSlots[id],
            alpha: 1,
            scale: 1
          });
          return;
        }
        if (elapsedMs <= Number(writeConfig.end)) {
          const progress = ease((elapsedMs - Number(writeConfig.start)) / Math.max(1, Number(writeConfig.end) - Number(writeConfig.start)));
          const sampledPosition = writeConfig.sampler.sample(progress);
          const offset = id === "A" || id === "B"
            ? new BABYLON.Vector3(0, 0.16, 0)
            : new BABYLON.Vector3(0, -0.16, 0);
          setBlockState(block, {
            visible: true,
            position: sampledPosition.add(offset),
            alpha: 1,
            scale: 0.98
          });
          return;
        }
        if (elapsedMs < cue("cue_parallel_read").startMs) {
          setBlockState(block, { visible: false });
          return;
        }
        if (elapsedMs <= Number(readConfig.end)) {
          const progress = ease((elapsedMs - Number(readConfig.start)) / Math.max(1, Number(readConfig.end) - Number(readConfig.start)));
          const sampledPosition = readConfig.sampler.sample(progress);
          const offset = id === "A" || id === "B"
            ? new BABYLON.Vector3(0, 0.12, 0)
            : new BABYLON.Vector3(0, -0.12, 0);
          setBlockState(block, {
            visible: elapsedMs >= Number(readConfig.start),
            position: sampledPosition.add(offset),
            alpha: 1,
            scale: 0.98
          });
          return;
        }
        if (elapsedMs <= cue("cue_reassemble").endMs) {
          const progress = cueProgress("cue_reassemble", elapsedMs);
          const settlePosition = blendVector(
            readConfig.sampler.sample(1),
            finalRamSlots[id],
            progress
          );
          setBlockState(block, {
            visible: true,
            position: settlePosition,
            alpha: 1,
            scale: 1
          });
          return;
        }
        const failureAlpha = id === "B" || id === "D" ? 1 - (riskWeight * 0.78) : 1;
        setBlockState(block, {
          visible: failureAlpha > 0.04,
          position: finalRamSlots[id],
          alpha: failureAlpha,
          scale: 1
        });
      });
    }

    function updateVisualState() {
      const safeElapsed = clamp(currentElapsedMs, 0, durationMs);
      if (cameraPreviewState.active) {
        const previewProgress = clamp(
          (global.performance.now() - cameraPreviewState.startedAtMs) / Math.max(1, cameraPreviewState.durationMs),
          0,
          1
        );
        applyPoseToFreeCamera(blendPlayerCameraPose(
          cameraPreviewState.startPose,
          cameraPreviewState.endPose,
          previewProgress
        ));
        if (previewProgress >= 1) {
          clearCameraPreview({ applyEndPose: true, restoreFreeFly: true });
        }
      } else if (playerCameraState.playbackActive) {
        if (freeFlyState.enabled && hasActiveFreeFlyInput()) {
          updateFreeFlyCamera();
        } else {
          syncPlayerCameraPose(safeElapsed);
        }
      } else if (freeFlyState.enabled) {
        updateFreeFlyCamera();
      }

      const overviewWeight = cueEnvelope("cue_overview", safeElapsed);
      const ingressWeight = cueEnvelope("cue_network_ingress", safeElapsed);
      const dmaWeight = cueEnvelope("cue_dma_irq", safeElapsed);
      const assembleWeight = cueEnvelope("cue_os_assembly", safeElapsed);
      const cacheWeight = cueEnvelope("cue_page_cache", safeElapsed);
      const splitWeight = cueEnvelope("cue_raid_split", safeElapsed);
      const stripeWeight = cueEnvelope("cue_striping", safeElapsed);
      const parallelWriteWeight = cueEnvelope("cue_parallel_write", safeElapsed);
      const hddInsideWeight = cueEnvelope("cue_hdd_inside", safeElapsed);
      const completionWeight = cueEnvelope("cue_write_complete", safeElapsed);
      const cacheMissWeight = cueEnvelope("cue_cache_miss", safeElapsed);
      const parallelReadWeight = cueEnvelope("cue_parallel_read", safeElapsed);
      const reassembleWeight = cueEnvelope("cue_reassemble", safeElapsed);
      const riskWeight = cueEnvelope("cue_risk", safeElapsed);

      updateModuleVisual(nicModule, safeElapsed, Math.max(overviewWeight * 0.35, ingressWeight, dmaWeight * 0.65));
      updateModuleVisual(cpuModule, safeElapsed, Math.max(overviewWeight * 0.3, dmaWeight * 0.38, assembleWeight, completionWeight * 0.8, cacheMissWeight * 0.56, reassembleWeight * 0.7));
      updateModuleVisual(ramModule, safeElapsed, Math.max(overviewWeight * 0.3, dmaWeight, assembleWeight, cacheWeight, parallelReadWeight * 0.8, reassembleWeight));
      updateModuleVisual(raidModule, safeElapsed, Math.max(overviewWeight * 0.32, splitWeight, stripeWeight, parallelWriteWeight, completionWeight, parallelReadWeight, riskWeight * 0.8));

      lanRing.rotation.z = safeElapsed * 0.0022;
      lanRingMaterial.emissiveColor = color3(palette.requestSignal || "#f4f8ff").scale(0.4 + (ingressWeight * 1.08));
      lanCoreMaterial.emissiveColor = color3(palette.dataSignal || "#ff9b4d").scale(0.56 + (ingressWeight * 1.2));
      lanLabel.material.alpha = 0.84;

      const pageCacheAlpha = 0.08 + (cacheWeight * 0.42) - (cacheMissWeight * 0.05);
      pageCacheMaterial.alpha = clamp(pageCacheAlpha, 0.04, 0.52);
      pageCacheMaterial.emissiveColor = color3(cacheMissWeight > 0.4 ? palette.danger : palette.pageCache, "#46c9ff").scale(0.28 + (cacheWeight * 0.82) + (cacheMissWeight * 0.52));
      setLabelAlpha(pageCacheLabel, cacheWeight);
      setLabelAlpha(cacheMissLabel, cacheMissWeight);
      setLabelAlpha(dmaLabel, dmaWeight);
      setLabelAlpha(irqLabel, dmaWeight);
      setLabelAlpha(writeLabel, Math.max(cacheWeight * 0.85, splitWeight * 0.5));
      setLabelAlpha(readLabel, Math.max(cacheMissWeight * 0.7, parallelReadWeight));
      setLabelAlpha(stripeSizeLabel, Math.max(splitWeight, stripeWeight * 0.65));
      setLabelAlpha(warningBanner, riskWeight);

      stripeBoard.setEnabled((splitWeight + stripeWeight) > 0.08);
      stripeBoard.rotation.y = -0.12 + (Math.sin(safeElapsed * 0.0009) * 0.04);
      stripeBoardPanelMaterial.alpha = 0.2 + (Math.max(splitWeight, stripeWeight) * 0.52);

      conduits.lanToNic.material.emissiveColor = color3(palette.dataSignal || "#ff9b4d").scale(0.12 + (ingressWeight * 0.9));
      conduits.irqToCpu.material.emissiveColor = color3(palette.statusSignal || "#74f7b2").scale(0.12 + (dmaWeight * 0.82));
      conduits.dmaToRam.material.emissiveColor = color3(palette.dataSignal || "#ff9b4d").scale(0.12 + (dmaWeight * 0.96));
      conduits.cpuToRaid.material.emissiveColor = color3(palette.requestSignal || "#f4f8ff").scale(0.1 + (Math.max(cacheWeight, cacheMissWeight) * 0.78));
      conduits.ramToRaid.material.emissiveColor = color3(palette.dataSignal || "#ff9b4d").scale(0.12 + (Math.max(cacheWeight, splitWeight) * 0.84));
      conduits.raidToDisk0.material.emissiveColor = color3(
        parallelReadWeight > 0.2 ? palette.requestSignal : palette.dataSignal,
        "#ff9b4d"
      ).scale(0.12 + (Math.max(stripeWeight, parallelWriteWeight, parallelReadWeight) * 0.82));
      conduits.raidToDisk1.material.emissiveColor = color3(
        parallelReadWeight > 0.2 ? palette.requestSignal : palette.dataSignal,
        "#ff9b4d"
      ).scale(0.12 + (Math.max(stripeWeight, parallelWriteWeight, parallelReadWeight) * 0.82));

      updatePulseTrain(networkPulses, conduits.lanToNic.sampler, safeElapsed, {
        startMs: cue("cue_network_ingress").startMs,
        endMs: cue("cue_network_ingress").endMs,
        cycles: 5.4,
        spacing: 0.18,
        scale: 0.96
      });
      updatePulseTrain(dmaPulses, conduits.dmaToRam.sampler, safeElapsed, {
        startMs: cue("cue_dma_irq").startMs,
        endMs: cue("cue_dma_irq").endMs,
        cycles: 4.3,
        spacing: 0.2,
        scale: 0.92
      });
      setPulseState(irqPulse, conduits.irqToCpu.sampler, cueProgress("cue_dma_irq", safeElapsed), dmaWeight, 1);
      updatePulseTrain(writeRequestPulses, conduits.cpuToRaid.sampler, safeElapsed, {
        startMs: cue("cue_page_cache").startMs,
        endMs: cue("cue_raid_split").endMs,
        cycles: 2.8,
        spacing: 0.46,
        scale: 0.82
      });
      updatePulseTrain(readRequestPulses0, conduits.raidToDisk0.sampler, safeElapsed, {
        startMs: cue("cue_parallel_read").startMs,
        endMs: cue("cue_parallel_read").endMs,
        cycles: 2.6,
        spacing: 0.5,
        scale: 0.82
      });
      updatePulseTrain(readRequestPulses1, conduits.raidToDisk1.sampler, safeElapsed, {
        startMs: cue("cue_parallel_read").startMs + 350,
        endMs: cue("cue_parallel_read").endMs,
        cycles: 2.6,
        spacing: 0.5,
        scale: 0.82
      });
      updatePulseTrain(statusPulses0, readSamplers.status0, safeElapsed, {
        startMs: cue("cue_write_complete").startMs,
        endMs: cue("cue_write_complete").endMs,
        cycles: 1.9,
        spacing: 0.55,
        scale: 1
      });
      updatePulseTrain(statusPulses1, readSamplers.status1, safeElapsed, {
        startMs: cue("cue_write_complete").startMs + 350,
        endMs: cue("cue_write_complete").endMs,
        cycles: 1.9,
        spacing: 0.55,
        scale: 1
      });

      const drive0Activity = Math.max(stripeWeight * 0.45, parallelWriteWeight, hddInsideWeight, parallelReadWeight * 0.88);
      const drive1Activity = Math.max(stripeWeight * 0.45, parallelWriteWeight, hddInsideWeight, parallelReadWeight * 0.88);
      updateDriveVisual(drive0, safeElapsed, drive0Activity, riskWeight > 0.52 ? "danger" : completionWeight > 0.2 ? "status" : "data");
      updateDriveVisual(drive1, safeElapsed, riskWeight > 0.15 ? Math.max(drive1Activity, riskWeight) : drive1Activity, riskWeight > 0.16 ? "danger" : completionWeight > 0.2 ? "status" : "data");
      drive1.root.scaling.x = 1 - (riskWeight * 0.22);
      drive1.root.scaling.y = 1 - (riskWeight * 0.08);
      drive1.root.scaling.z = 1 - (riskWeight * 0.08);
      drive1.root.position.x = drive1.basePosition.x + (riskWeight * 0.58);
      drive1.shellMaterial.emissiveColor = color3(riskWeight > 0.16 ? palette.danger : palette.diskShell, "#d7e2ff").scale(0.18 + (riskWeight * 0.75));
      drive0.shellMaterial.emissiveColor = color3(palette.diskShell || "#d7e2ff").scale(0.18 + (drive0Activity * 0.28));

      fileFrame.position.copyFrom(positions.ram.add(new BABYLON.Vector3(0, 0.68, 0)));
      fileFrame.scaling.x = 1 + (splitWeight * 0.12);
      fileFrame.scaling.y = 1;
      fileFrame.scaling.z = 1;
      fileFrameMaterial.alpha = Math.max(assembleWeight * 0.18, cacheWeight * 0.18, reassembleWeight * 0.22, riskWeight * 0.16);
      fileFrameMaterial.emissiveColor = color3(riskWeight > 0.2 ? palette.danger : palette.requestSignal, "#f4f8ff").scale(0.28 + (reassembleWeight * 0.46));
      fileFrame.setEnabled(fileFrameMaterial.alpha > 0.02);
      fileLabel.plane.position.copyFrom(fileFrame.position.add(new BABYLON.Vector3(0, 0.72, 0)));
      setLabelAlpha(fileLabel, Math.max(assembleWeight, cacheWeight * 0.92, reassembleWeight, riskWeight * 0.8));

      logicalVolumeLabel.plane.position.y = 7.1 + (Math.sin(safeElapsed * 0.0008) * 0.08);
      logicalVolumeLabel.material.alpha = 0.84 + (riskWeight * 0.1);
      logicalVolumeLabel.material.emissiveColor = color3(riskWeight > 0.2 ? palette.danger : palette.label, "#eff6ff").scale(0.74 + (riskWeight * 0.55));

      updateBlockTimeline(safeElapsed);
    }

    focusFreeCameraOnCurrentCue();
    freeCamera.attachControl(canvas, false);

    engine.runRenderLoop(() => {
      updateVisualState();
      scene.render();
    });

    return Object.freeze({
      setElapsedMs(nextElapsedMs) {
        currentElapsedMs = clamp(nextElapsedMs, 0, durationMs);
      },
      applyCameraPose(nextPose) {
        return applyPoseToFreeCamera(nextPose);
      },
      setUserCameraEnabled(nextEnabled) {
        freeFlyState.enabled = Boolean(nextEnabled);
        if (!freeFlyState.enabled) {
          clearFreeFlyMovement();
          syncPlayerCameraPose(currentElapsedMs);
        }
        scene.activeCamera = freeCamera;
        return freeFlyState.enabled;
      },
      setJumpPlaybackEnabled(nextEnabled) {
        playerCameraState.jumpsEnabled = Boolean(nextEnabled);
        if (!freeFlyState.enabled && playerCameraState.playbackActive) {
          clearCameraPreview({ applyEndPose: false, restoreFreeFly: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        return playerCameraState.jumpsEnabled;
      },
      setPlayerPlaybackActive(nextEnabled) {
        playerCameraState.playbackActive = Boolean(nextEnabled);
        if (playerCameraState.playbackActive && !freeFlyState.enabled) {
          clearCameraPreview({ applyEndPose: false, restoreFreeFly: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        return playerCameraState.playbackActive;
      },
      syncPlayerCameraToElapsed(nextElapsedMs = currentElapsedMs) {
        currentElapsedMs = clamp(nextElapsedMs, 0, durationMs);
        clearCameraPreview({ applyEndPose: false, restoreFreeFly: false });
        return syncPlayerCameraPose(currentElapsedMs);
      },
      previewPlayerCameraToCue(cueIndex = 0, durationMs = 0) {
        const jumpSequence = getNormalizedPlayerJumpSequence();
        const targetEntry = jumpSequence[Math.max(0, Number(cueIndex) || 0)] || null;
        const nextEntry = targetEntry ? jumpSequence[(Math.max(0, Number(cueIndex) || 0)) + 1] || null : null;
        const previewDuration = durationMs || getPlayerJumpTransitionDuration(targetEntry, nextEntry) || 1100;
        return startPlayerCameraPreview(targetEntry?.pose || getBaseCameraPose(), previewDuration);
      },
      setFreeFlyEnabled(nextEnabled) {
        const shouldEnable = Boolean(nextEnabled);
        freeFlyState.enabled = shouldEnable;
        if (shouldEnable) {
          clearCameraPreview({ applyEndPose: false, restoreFreeFly: false });
          focusFreeCameraOnCurrentCue();
        } else {
          clearFreeFlyMovement();
          scene.activeCamera = freeCamera;
          syncPlayerCameraPose(currentElapsedMs);
        }
        return freeFlyState.enabled;
      },
      snapFreeCameraToCue() {
        focusFreeCameraOnCurrentCue();
        return true;
      },
      getCameraPose() {
        return getFreeCameraPose();
      },
      getCueCameraConfig(referenceCamera = null) {
        return getFreeCameraCueConfig(referenceCamera);
      },
      isFreeFlyEnabled() {
        return true;
      },
      resize() {
        engine.resize();
      },
      refreshTranslations() {
        refreshLabelTranslations();
      },
      dispose() {
        clearFreeFlyMovement();
        freeCamera.detachControl(canvas);
        global.removeEventListener("keydown", handleFreeFlyKeyDown);
        global.removeEventListener("keyup", handleFreeFlyKeyUp);
        global.removeEventListener("blur", clearFreeFlyMovement);
        canvas.removeEventListener("blur", clearFreeFlyMovement);
        engine.stopRenderLoop();
        glowLayer.dispose();
        scene.dispose();
        engine.dispose();
      }
    });
  }

  function buildSymmetricCryptoSceneRuntime(BABYLON, canvas, presentation) {
    const sceneData = getPrimaryScene(presentation) || {};
    const sceneKind = String(sceneData.kind || "symmetric_crypto_story").trim() || "symmetric_crypto_story";
    const isEndToEnd = sceneKind === "end_to_end_crypto_story";
    const isAsymmetric = sceneKind === "asymmetric_crypto_story";
    const isHybrid = sceneKind === "hybrid_crypto_story";
    const palette = {
      backgroundTop: "#07101f",
      backgroundBottom: "#02050d",
      stageLine: "#17375c",
      senderBase: "#4fbef7",
      receiverBase: "#78f2c1",
      cryptoBase: "#9f7cff",
      networkBase: "#ffb15b",
      attackerBase: "#ff6a7a",
      vaultBase: "#d7e2ff",
      safePath: "#6be99c",
      unsafePath: "#ff6a7a",
      keyBase: "#ffe082",
      plaintext: "#f4f8ff",
      ciphertext: "#9fd0ff",
      label: "#eff6ff",
      subtle: "#9aa9c7"
    };
    Object.assign(palette, sceneData.palette || {});
    const layout = sceneData.layout || {};
    const cameraConfig = sceneData.camera || {};
    const cues = Array.isArray(sceneData.cues) ? sceneData.cues : [];
    const durationMs = Math.max(1000, Number(sceneData.durationMs || 1000));
    const cueById = new Map(cues.map((cue) => [cue.id, cue]));
    const labelNodes = new Set();
    const playerCameraState = {
      jumpsEnabled: true,
      playbackActive: false
    };
    const cameraPreviewState = {
      active: false,
      startedAtMs: 0,
      durationMs: 0,
      startPose: null,
      endPose: null,
      restoreUserControl: true
    };
    const cameraState = {
      userEnabled: true
    };
    const plainText = String(sceneData.messagePlain || "Treffen um 15 Uhr");
    const cipherShort = String(
      sceneData.messageCipherShort
      || sceneData.messageCipher
      || (isEndToEnd ? "7F 91 C2 ..." : "8A F2 91 C4 ...")
    );
    const cipherLong = String(sceneData.messageCipher || (isEndToEnd ? "7F 91 C2 D8 44 0A F1 6E" : "8A F2 91 C4 7B 11 0D EE"));
    const wrongKeyText = String(
      sceneData.wrongKeyText
      || (isAsymmetric ? "MIT PUB NICHT LESBAR" : (isEndToEnd ? "ENDGERAET KOMPROMITTIERT" : (isHybrid ? "NOCH KEINE SESSION" : "FEHLER / DATENMUELL")))
    );
    const finalQuote = String(
      sceneData.finalQuote
      || (isEndToEnd
        ? "Lesbar nur an den Enden.\nNicht in der Mitte."
        : (isHybrid
        ? "Asymmetrisch fuer den Schluessel.\nSymmetrisch fuer die Daten."
        : (isAsymmetric
        ? "Oeffentlich verschluesseln.\nPrivat entschluesseln."
        : "Nicht das Netz muss geheim sein.\nDer Schluessel muss geheim bleiben.")))
    );
    const principleText = String(sceneData.principleText || (() => {
      if (isEndToEnd) {
        return [
          "Anna-Geraet -> verschluesseln -> Geheimtext",
          "Server / Netz transportieren nur weiter",
          "Ben-Geraet -> entschluesseln -> Klartext"
        ].join("\n");
      }
      if (isHybrid) {
        return [
          "1. Sender erzeugt einen Sitzungsschluessel",
          "2. Nur dieser kleine Schluessel wird asymmetrisch geschuetzt",
          "3. Die eigentlichen Daten laufen danach schnell symmetrisch"
        ].join("\n");
      }
      if (isAsymmetric) {
        return [
          "Oeffentlicher Schluessel darf verteilt werden",
          "Klartext + PUB -> Geheimtext",
          "Geheimtext + PRIV -> Klartext"
        ].join("\n");
      }
      return [
        "Klartext -> Verschluesselung -> Geheimtext",
        "Geheimtext -> Entschluesselung -> Klartext",
        "Derselbe geheime Schluessel links und rechts"
      ].join("\n");
    })());
    const finaleSchemaText = String(sceneData.finaleSchemaText || (() => {
      if (isEndToEnd) {
        return [
          "Klartext bleibt nur auf den Endgeraeten lesbar",
          "In der Mitte reist nur Geheimtext",
          "Metadaten und kompromittierte Endgeraete bleiben die Grenze"
        ].join("\n");
      }
      if (isHybrid) {
        return [
          "Oeffentlicher Schluessel -> schuetzt Sitzungsschluessel",
          "Sitzungsschluessel -> schuetzt grosse Datenmenge",
          "Praxis = sicherer Austausch plus Tempo"
        ].join("\n");
      }
      if (isAsymmetric) {
        return [
          "Oeffentlicher Schluessel -> frei verteilt",
          "Nachricht + PUB -> Geheimtext",
          "Nur PRIV macht daraus wieder Klartext"
        ].join("\n");
      }
      return [
        "Klartext -> Verschluesselung + Schluessel -> Geheimtext",
        "Geheimtext durchs unsichere Netz",
        "Entschluesselung + derselbe Schluessel -> Klartext"
      ].join("\n");
    })());
    const performanceBoardText = String(sceneData.performanceBoardText || (isHybrid
      ? [
          "Asymmetrisch: loest den Austausch",
          "Symmetrisch: schnell fuer grosse Datenmengen",
          "Hybrid: erst Schluessel, dann Datenstrom"
        ].join("\n")
      : [
          "Asymmetrisch: gut fuer kleine Geheimnisse",
          "Symmetrisch: schneller fuer grosse Datenmengen",
          "Praxis: oft erst Schluesseltausch, dann Datenstrom"
        ].join("\n")));
    const sharedKeyBannerText = isEndToEnd
      ? "Nur die Endgeraete koennen den Inhalt lesen"
      : (isHybrid
      ? "Oben kleiner Sitzungsschluessel. Unten grosse Daten."
      : (isAsymmetric
      ? "Schluesselpaar: oeffentlich + privat"
      : "Gemeinsamer geheimer Schluessel"));
    const encryptDefaultText = isEndToEnd
      ? "Noch auf Annas Geraet\nverschluesseln"
      : (isHybrid
      ? "Kleiner Schluessel mit PUB\noder Daten mit Session"
      : (isAsymmetric
      ? "Klartext\n+ oeffentlicher Schluessel"
      : "Klartext\n+ geheimer Schluessel"));
    const decryptDefaultText = isEndToEnd
      ? "Erst auf Bens Geraet\nentschluesseln"
      : (isHybrid
      ? "Erst Session freilegen,\ndann Daten entschluesseln"
      : (isAsymmetric
      ? "Geheimtext\n+ privater Schluessel"
      : "Geheimtext\n+ derselbe Schluessel"));
    const vaultDefaultText = isEndToEnd ? "Ungeschuetztes\nCloud-Backup" : ((isAsymmetric || isHybrid) ? "Privater\nSchluessel" : "Geheimer\nSchluessel");
    const publicKeyText = String(
      sceneData.publicKeyText
      || (isHybrid
        ? "Oeffentlicher Schluessel"
        : (isAsymmetric ? "Oeffentlicher\nSchluessel" : "KEY"))
    );
    const privateKeyText = String(
      sceneData.privateKeyText
      || (isHybrid
        ? "Privater Schluessel"
        : (isAsymmetric ? "Privater\nSchluessel" : "KEY"))
    );
    const sessionKeyText = String(
      sceneData.sessionKeyText
      || (isHybrid ? "Sitzungsschluessel" : (isAsymmetric ? publicKeyText : "KEY"))
    );
    const keyHubTokenText = isEndToEnd ? "E2E" : (isHybrid ? "SESS" : (isAsymmetric ? publicKeyText : "KEY"));
    const leftKeyTokenText = isEndToEnd ? "LOCK" : (isHybrid ? "PUB" : (isAsymmetric ? publicKeyText : "KEY"));
    const rightKeyTokenText = isEndToEnd ? "LOCK" : (isHybrid ? "PRIV" : (isAsymmetric ? privateKeyText : "KEY"));
    const pulseKeyTokenText = isEndToEnd ? "META" : (isHybrid ? "SESS" : (isAsymmetric ? publicKeyText : "KEY"));
    const wrongKeyTokenText = isEndToEnd ? "MAL" : (isHybrid ? "SESS?" : (isAsymmetric ? "PUB passt\nnicht" : "KEY?"));
    const safeKeyTokenText = isEndToEnd ? "E2E" : (isHybrid ? "SESS" : (isAsymmetric ? publicKeyText : "KEY"));
    const unsafeKeyTokenText = isEndToEnd ? "META" : (isHybrid ? "PRIV" : (isAsymmetric ? privateKeyText : "KEY"));
    const stolenKeyTokenText = isEndToEnd ? "LEAK" : (isHybrid ? "PRIV" : (isAsymmetric ? privateKeyText : "KEY"));
    const senderTitle = String(sceneData.senderLabel || (isEndToEnd ? "Anna" : "Sender"));
    const receiverTitle = String(sceneData.receiverLabel || (isEndToEnd ? "Ben" : "Empfaenger"));
    const serverTitle = String(sceneData.serverLabel || "Server");
    const metadataTitle = String(sceneData.metadataTitle || "Server sieht Metadaten");
    const transportOnlyText = String(sceneData.transportOnlyText || "Transportiert nur Geheimtext");
    const metadataBoardText = String(
      sceneData.metadataBoardText
      || [
        "Von: Anna",
        "An: Ben",
        "Zeit: 14:02",
        "Datenmenge: 4.2 KB",
        `Inhalt: ${cipherShort}`
      ].join("\n")
    );
    const limitBoardText = String(
      sceneData.limitBoardText
      || "Grenze: kompromittiertes Endgeraet\noder ungeschuetztes Backup"
    );
    const payloadText = String(sceneData.payloadText || plainText);
    const payloadCipherText = String(sceneData.payloadCipherText || (isHybrid ? "Geheimtext / Daten" : cipherShort));
    const wrappedSessionText = String(sceneData.wrappedSessionText || (isHybrid ? "geschuetzte Session" : safeKeyTokenText));
    const hybridConceptText = String(sceneData.hybridConceptText || "Hybrid kombiniert beide Verfahren");
    let currentElapsedMs = 0;

    function color3(hex, fallback = "#6bdff0") {
      return BABYLON.Color3.FromHexString(String(hex || fallback));
    }

    function color4(hex, alpha = 1, fallback = "#050814") {
      const base = color3(hex, fallback);
      return new BABYLON.Color4(base.r, base.g, base.b, alpha);
    }

    function toVector3(position, fallback = [0, 0, 0]) {
      const source = Array.isArray(position) ? position : fallback;
      return new BABYLON.Vector3(
        Number(source[0] || 0),
        Number(source[1] || 0),
        Number(source[2] || 0)
      );
    }

    function lerpNumber(start, end, progress) {
      return start + ((end - start) * clamp(progress, 0, 1));
    }

    function ease(progress) {
      const safe = clamp(progress, 0, 1);
      return safe * safe * (3 - (2 * safe));
    }

    function cue(id) {
      return cueById.get(id) || { startMs: 0, endMs: 1 };
    }

    function cueProgress(id, elapsedMs) {
      const activeCue = cue(id);
      const span = Math.max(1, Number(activeCue.endMs || 0) - Number(activeCue.startMs || 0));
      return ease((Number(elapsedMs || 0) - Number(activeCue.startMs || 0)) / span);
    }

    function buildPathSampler(points) {
      const vectors = (Array.isArray(points) ? points : []).map((point) => (
        point instanceof BABYLON.Vector3 ? point.clone() : toVector3(point)
      ));
      const cumulative = [0];
      let totalLength = 0;
      for (let index = 1; index < vectors.length; index += 1) {
        totalLength += BABYLON.Vector3.Distance(vectors[index - 1], vectors[index]);
        cumulative.push(totalLength);
      }
      const safeLength = Math.max(totalLength, 0.0001);
      return Object.freeze({
        points: vectors,
        sample(progress) {
          const safeProgress = clamp(progress, 0, 1);
          if (!vectors.length) return BABYLON.Vector3.Zero();
          if (vectors.length === 1) return vectors[0].clone();
          const targetLength = safeLength * safeProgress;
          for (let index = 1; index < cumulative.length; index += 1) {
            if (targetLength <= cumulative[index]) {
              const segmentLength = Math.max(0.0001, cumulative[index] - cumulative[index - 1]);
              const localProgress = (targetLength - cumulative[index - 1]) / segmentLength;
              return BABYLON.Vector3.Lerp(vectors[index - 1], vectors[index], localProgress);
            }
          }
          return vectors[vectors.length - 1].clone();
        }
      });
    }

    function vectorToPlain(vector) {
      return Object.freeze({
        x: Number(vector?.x || 0),
        y: Number(vector?.y || 0),
        z: Number(vector?.z || 0)
      });
    }

    function getBaseCameraPose() {
      return getCueCameraPose(cameraConfig);
    }

    function getCueCameraPose(cueCamera = null) {
      const safeCamera = cueCamera && typeof cueCamera === "object" ? cueCamera : {};
      const fallbackTarget = Array.isArray(cameraConfig.target) ? cameraConfig.target : [0, 1.8, 0];
      const target = toVector3(safeCamera.target, fallbackTarget);
      const alpha = Number.isFinite(Number(safeCamera.alpha)) ? Number(safeCamera.alpha) : Number(cameraConfig.alpha || -1.35);
      const beta = clamp(
        Number.isFinite(Number(safeCamera.beta)) ? Number(safeCamera.beta) : Number(cameraConfig.beta || 0.98),
        0.05,
        Math.PI - 0.05
      );
      const radius = Math.max(
        0.1,
        Number.isFinite(Number(safeCamera.radius)) ? Number(safeCamera.radius) : Number(cameraConfig.radius || 29)
      );
      const sinBeta = Math.sin(beta);
      const position = new BABYLON.Vector3(
        target.x + (radius * Math.cos(alpha) * sinBeta),
        target.y + (radius * Math.cos(beta)),
        target.z + (radius * Math.sin(alpha) * sinBeta)
      );
      return Object.freeze({
        position: vectorToPlain(position),
        target: vectorToPlain(target),
        rotation: Object.freeze({
          x: beta - (Math.PI / 2),
          y: alpha + (Math.PI / 2),
          z: 0
        })
      });
    }

    function getNormalizedPlayerJumpSequence() {
      return cues.map((entryCue, index) => {
        const startMs = clamp(index === 0 ? 0 : Number(entryCue?.startMs || 0), 0, durationMs);
        const nextCue = cues[index + 1] || null;
        const endMs = nextCue
          ? clamp(Number(nextCue.startMs || 0), startMs, durationMs)
          : durationMs;
        return Object.freeze({
          cue: entryCue,
          index,
          startMs,
          endMs,
          pose: getCueCameraPose(entryCue?.camera)
        });
      });
    }

    function getPlayerJumpTransitionDuration(currentEntry, nextEntry) {
      const startMs = clamp(Number(currentEntry?.startMs || 0), 0, durationMs);
      const boundaryMs = clamp(
        nextEntry ? Number(nextEntry.startMs || startMs) : Number(currentEntry?.endMs || durationMs),
        startMs,
        durationMs
      );
      const availableMs = Math.max(0, boundaryMs - startMs);
      if (availableMs <= 0) return 0;
      return Math.min(availableMs, clamp(availableMs * 0.42, 900, 1800));
    }

    function blendPlayerCameraPose(startPose, endPose, progress) {
      const safeStartPose = startPose && typeof startPose === "object" ? startPose : {};
      const safeEndPose = endPose && typeof endPose === "object" ? endPose : {};
      const safeProgress = clamp(progress, 0, 1);
      const slideProgress = safeProgress <= 0.65 ? ease(safeProgress / 0.65) : 1;
      const lookProgress = safeProgress <= 0.35 ? 0 : ease((safeProgress - 0.35) / 0.65);
      const startPosition = safeStartPose.position || {};
      const endPosition = safeEndPose.position || {};
      const startTarget = safeStartPose.target || {};
      const endTarget = safeEndPose.target || {};
      const startRotation = safeStartPose.rotation || {};
      const endRotation = safeEndPose.rotation || {};
      return Object.freeze({
        position: Object.freeze({
          x: lerpNumber(Number(startPosition.x || 0), Number(endPosition.x || 0), slideProgress),
          y: lerpNumber(Number(startPosition.y || 0), Number(endPosition.y || 0), slideProgress),
          z: lerpNumber(Number(startPosition.z || 0), Number(endPosition.z || 0), slideProgress)
        }),
        target: Object.freeze({
          x: lerpNumber(Number(startTarget.x || 0), Number(endTarget.x || 0), lookProgress),
          y: lerpNumber(Number(startTarget.y || 0), Number(endTarget.y || 0), lookProgress),
          z: lerpNumber(Number(startTarget.z || 0), Number(endTarget.z || 0), lookProgress)
        }),
        rotation: Object.freeze({
          x: lerpNumber(Number(startRotation.x || 0), Number(endRotation.x || 0), lookProgress),
          y: lerpNumber(Number(startRotation.y || 0), Number(endRotation.y || 0), lookProgress),
          z: lerpNumber(Number(startRotation.z || 0), Number(endRotation.z || 0), lookProgress)
        })
      });
    }

    function resolvePlayerCameraPose(elapsedMs) {
      const safeElapsed = clamp(elapsedMs, 0, durationMs);
      const basePose = getBaseCameraPose();
      if (!playerCameraState.jumpsEnabled) {
        return basePose;
      }
      const jumpSequence = getNormalizedPlayerJumpSequence();
      if (!jumpSequence.length) {
        return basePose;
      }
      if (jumpSequence.length === 1 || safeElapsed <= jumpSequence[0].startMs) {
        return jumpSequence[0].pose || basePose;
      }
      for (let index = jumpSequence.length - 1; index >= 1; index -= 1) {
        const currentEntry = jumpSequence[index];
        if (safeElapsed < currentEntry.startMs) continue;
        const previousEntry = jumpSequence[index - 1] || currentEntry;
        const nextEntry = jumpSequence[index + 1] || null;
        const transitionDurationMs = getPlayerJumpTransitionDuration(currentEntry, nextEntry);
        if (transitionDurationMs > 0 && safeElapsed <= currentEntry.startMs + transitionDurationMs) {
          return blendPlayerCameraPose(
            previousEntry.pose || basePose,
            currentEntry.pose || previousEntry.pose || basePose,
            (safeElapsed - currentEntry.startMs) / transitionDurationMs
          );
        }
        return currentEntry.pose || previousEntry.pose || basePose;
      }
      return jumpSequence[0].pose || basePose;
    }

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    });
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = color4(palette.backgroundTop, 1, "#07101f");
    scene.ambientColor = color3("#1d2a42", "#1d2a42");
    const glowLayer = new BABYLON.GlowLayer("symmetricCryptoGlow", scene);
    glowLayer.intensity = 0.42;

    const freeCamera = new BABYLON.UniversalCamera("symmetricCryptoFreeCamera", BABYLON.Vector3.Zero(), scene);
    freeCamera.minZ = 0.1;
    freeCamera.speed = 0.38;
    freeCamera.inertia = 0.62;
    freeCamera.angularSensibility = 4200;
    freeCamera.keysUp = [87, 38];
    freeCamera.keysDown = [83, 40];
    freeCamera.keysLeft = [65, 37];
    freeCamera.keysRight = [68, 39];
    scene.activeCamera = freeCamera;

    function applyPoseToFreeCamera(nextPose) {
      const pose = nextPose && typeof nextPose === "object" ? nextPose : null;
      if (!pose) return false;
      scene.activeCamera = freeCamera;
      if (pose.position && typeof pose.position === "object") {
        freeCamera.position.copyFromFloats(
          Number(pose.position.x || 0),
          Number(pose.position.y || 0),
          Number(pose.position.z || 0)
        );
      }
      if (pose.target && typeof pose.target === "object") {
        freeCamera.setTarget(new BABYLON.Vector3(
          Number(pose.target.x || 0),
          Number(pose.target.y || 0),
          Number(pose.target.z || 0)
        ));
      } else if (pose.rotation && typeof pose.rotation === "object") {
        freeCamera.rotation.copyFromFloats(
          Number(pose.rotation.x || 0),
          Number(pose.rotation.y || 0),
          Number(pose.rotation.z || 0)
        );
      }
      if (freeCamera.cameraDirection?.setAll) freeCamera.cameraDirection.setAll(0);
      if (freeCamera.cameraRotation) {
        freeCamera.cameraRotation.x = 0;
        freeCamera.cameraRotation.y = 0;
      }
      return true;
    }

    function updateCameraAttachment() {
      if (cameraState.userEnabled) {
        freeCamera.attachControl(canvas, false);
      } else {
        freeCamera.detachControl(canvas);
      }
    }

    function getCurrentFreeCameraPose() {
      const currentTarget = typeof freeCamera.getTarget === "function"
        ? freeCamera.getTarget()
        : freeCamera.position.add(freeCamera.getForwardRay().direction.clone().normalize().scale(8));
      return Object.freeze({
        position: vectorToPlain(freeCamera.position),
        target: vectorToPlain(currentTarget),
        rotation: vectorToPlain(freeCamera.rotation)
      });
    }

    function getFreeCameraCueConfig(referenceCamera = null) {
      const safeReference = referenceCamera && typeof referenceCamera === "object" ? referenceCamera : {};
      const forward = freeCamera.getForwardRay().direction.clone();
      if (forward.lengthSquared() < 0.0001) {
        forward.copyFromFloats(0, 0, 1);
      } else {
        forward.normalize();
      }
      const target = freeCamera.position.add(forward.scale(Math.max(4, Number(safeReference.radius || cameraConfig.radius || 18))));
      const offset = freeCamera.position.subtract(target);
      const radius = Math.max(0.1, offset.length());
      const normalizedY = clamp(offset.y / radius, -1, 1);
      return Object.freeze({
        alpha: Math.atan2(offset.z, offset.x),
        beta: clamp(Math.acos(normalizedY), 0.05, Math.PI - 0.05),
        radius,
        target: Object.freeze([
          Number(target.x || 0),
          Number(target.y || 0),
          Number(target.z || 0)
        ])
      });
    }

    function clearCameraPreview(options = {}) {
      const shouldApplyEndPose = options.applyEndPose !== false;
      const shouldRestoreUserControl = options.restoreUserControl !== false;
      if (!cameraPreviewState.active) return false;
      const endPose = cameraPreviewState.endPose;
      const restoreUserControl = cameraPreviewState.restoreUserControl;
      cameraPreviewState.active = false;
      cameraPreviewState.startedAtMs = 0;
      cameraPreviewState.durationMs = 0;
      cameraPreviewState.startPose = null;
      cameraPreviewState.endPose = null;
      cameraPreviewState.restoreUserControl = true;
      if (shouldApplyEndPose && endPose) {
        applyPoseToFreeCamera(endPose);
      }
      if (shouldRestoreUserControl) {
        cameraState.userEnabled = restoreUserControl;
        updateCameraAttachment();
      }
      return true;
    }

    function startPlayerCameraPreview(nextPose, previewDurationMs = 0) {
      const safePose = nextPose && typeof nextPose === "object" ? nextPose : resolvePlayerCameraPose(currentElapsedMs);
      const currentPose = getCurrentFreeCameraPose();
      clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
      cameraPreviewState.active = true;
      cameraPreviewState.startedAtMs = global.performance.now();
      cameraPreviewState.durationMs = clamp(previewDurationMs || 1100, 220, 2200);
      cameraPreviewState.startPose = currentPose;
      cameraPreviewState.endPose = safePose;
      cameraPreviewState.restoreUserControl = cameraState.userEnabled;
      cameraState.userEnabled = false;
      updateCameraAttachment();
      return true;
    }

    function syncPlayerCameraPose(elapsedMs) {
      currentElapsedMs = clamp(elapsedMs, 0, durationMs);
      if (cameraPreviewState.active) return false;
      return applyPoseToFreeCamera(resolvePlayerCameraPose(currentElapsedMs));
    }

    function focusCameraOnCurrentCue() {
      return applyPoseToFreeCamera(resolvePlayerCameraPose(currentElapsedMs));
    }

    applyPoseToFreeCamera(getBaseCameraPose());
    updateCameraAttachment();

    const hemisphericLight = new BABYLON.HemisphericLight("symmetricCryptoHemi", new BABYLON.Vector3(0.12, 1, -0.28), scene);
    hemisphericLight.intensity = 1.18;
    const fillLight = new BABYLON.PointLight("symmetricCryptoFill", new BABYLON.Vector3(0, 9, -9), scene);
    fillLight.intensity = 0.9;
    const rimLight = new BABYLON.PointLight("symmetricCryptoRim", new BABYLON.Vector3(0, 5, 12), scene);
    rimLight.intensity = 0.38;

    function createSurfaceMaterial(id, diffuseHex, emissiveStrength = 0.28, alpha = 1) {
      const material = new BABYLON.StandardMaterial(id, scene);
      const diffuse = color3(diffuseHex, "#6bdff0");
      material.diffuseColor = diffuse;
      material.emissiveColor = diffuse.scale(emissiveStrength);
      material.specularColor = BABYLON.Color3.Black();
      material.alpha = alpha;
      material.backFaceCulling = false;
      return material;
    }

    function drawLabelTexture(texture, text, options = {}) {
      const width = Number(options.width || 1024);
      const height = Number(options.height || 256);
      const ctx = texture.getContext();
      const lines = String(text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const backgroundAlpha = clamp(Number(options.backgroundAlpha ?? 0.28), 0, 1);
      const radius = Number(options.radius || 24);
      const fillStyle = `rgba(7, 14, 28, ${backgroundAlpha})`;
      const borderStyle = options.borderStyle || "rgba(115, 242, 255, 0.16)";
      const textColor = options.textColor || String(palette.label || "#eff6ff");
      const fontSize = Number(options.fontSize || 86);
      const fontWeight = options.fontWeight || "700";
      ctx.clearRect(0, 0, width, height);
      if (backgroundAlpha > 0) {
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.lineWidth = Number(options.borderWidth || 4);
        ctx.strokeStyle = borderStyle;
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight} ${fontSize}px Arial`;
      const lineHeight = Number(options.lineHeight || fontSize * 0.92);
      const offsetY = ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, (height / 2) - offsetY + (index * lineHeight));
      });
      texture.update();
    }

    function createTextLabel(id, text, options = {}) {
      const plane = BABYLON.MeshBuilder.CreatePlane(id, {
        width: Number(options.planeWidth || 4.4),
        height: Number(options.planeHeight || 1.0)
      }, scene);
      plane.billboardMode = options.billboard === false ? BABYLON.Mesh.BILLBOARDMODE_NONE : BABYLON.Mesh.BILLBOARDMODE_ALL;
      const texture = new BABYLON.DynamicTexture(`${id}Texture`, {
        width: Number(options.textureWidth || 1024),
        height: Number(options.textureHeight || 256)
      }, scene, true);
      texture.hasAlpha = true;
      const material = new BABYLON.StandardMaterial(`${id}Material`, scene);
      material.diffuseTexture = texture;
      material.emissiveTexture = texture;
      material.opacityTexture = texture;
      material.diffuseColor = BABYLON.Color3.White();
      material.emissiveColor = BABYLON.Color3.White();
      material.specularColor = BABYLON.Color3.Black();
      material.backFaceCulling = false;
      material.alpha = Number(options.alpha ?? 1);
      plane.material = material;
      const labelNode = {
        plane,
        material,
        texture,
        sourceText: String(text || ""),
        baseOptions: { ...options },
        lastSignature: ""
      };
      labelNode.redraw = function redraw(nextText, nextOptions = {}) {
        labelNode.sourceText = String(nextText || "");
        labelNode.baseOptions = { ...labelNode.baseOptions, ...nextOptions };
        drawLabelTexture(texture, lt(labelNode.sourceText), labelNode.baseOptions);
      };
      labelNode.setAlpha = function setAlpha(alpha) {
        const safeAlpha = clamp(alpha, 0, 1);
        plane.setEnabled(safeAlpha > 0.01);
        material.alpha = safeAlpha;
      };
      labelNode.redraw(labelNode.sourceText, labelNode.baseOptions);
      labelNodes.add(labelNode);
      return labelNode;
    }

    function refreshLabelTranslations() {
      labelNodes.forEach((labelNode) => {
        labelNode.redraw(labelNode.sourceText, labelNode.baseOptions);
      });
    }

    function updateLabelText(labelNode, nextText, nextOptions = null) {
      if (!labelNode) return;
      const safeText = String(nextText || "");
      const safeOptions = nextOptions && typeof nextOptions === "object" ? nextOptions : {};
      const signature = `${safeText}::${JSON.stringify(safeOptions)}`;
      if (labelNode.lastSignature === signature) return;
      labelNode.lastSignature = signature;
      labelNode.redraw(safeText, safeOptions);
    }

    function createPanel(id, titleText, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      const size = config.size || { width: 4.2, height: 3.0, depth: 0.7 };
      const hasVariant = Boolean(config.variant);
      const backdropDepth = hasVariant ? Math.max(0.14, Number(size.depth || 0.7) * 0.24) : Number(size.depth || 0.7);
      const body = BABYLON.MeshBuilder.CreateBox(`${id}Body`, {
        width: size.width,
        height: size.height,
        depth: backdropDepth
      }, scene);
      body.parent = root;
      if (hasVariant) {
        body.position.z = -0.16;
      }
      const bodyMaterial = createSurfaceMaterial(`${id}BodyMaterial`, config.color || palette.senderBase, 0.18, 0.96);
      body.material = bodyMaterial;
      const frame = BABYLON.MeshBuilder.CreateBox(`${id}Frame`, {
        width: size.width + 0.18,
        height: size.height + 0.18,
        depth: backdropDepth + 0.18
      }, scene);
      frame.parent = root;
      if (hasVariant) {
        frame.position.z = -0.18;
      }
      const shellMaterial = createSurfaceMaterial(`${id}FrameMaterial`, config.accent || config.color || palette.senderBase, 0.42, 0.12);
      frame.material = shellMaterial;
      const accent = BABYLON.MeshBuilder.CreateBox(`${id}Accent`, {
        width: Math.max(0.24, size.width - 0.48),
        height: Math.max(0.08, size.height * 0.1),
        depth: 0.08
      }, scene);
      accent.parent = root;
      accent.position = new BABYLON.Vector3(0, (size.height / 2) - 0.22, (backdropDepth / 2) + 0.05);
      const accentMaterial = createSurfaceMaterial(`${id}AccentMaterial`, config.accent || config.color || palette.senderBase, 0.86, 0.96);
      accent.material = accentMaterial;
      const detailMaterials = [];
      const detailLabels = [];
      const variantRoot = new BABYLON.TransformNode(`${id}VariantRoot`, scene);
      variantRoot.parent = root;
      variantRoot.position.z = hasVariant ? 0.2 : 0;
      const baseColorHex = String(config.color || palette.senderBase);
      const accentColorHex = String(config.accent || config.color || palette.senderBase);

      function trackDetailMaterial(material, options = {}) {
        detailMaterials.push({
          material,
          colorHex: String(options.colorHex || accentColorHex),
          alphaMin: Number(options.alphaMin ?? 0.18),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.08),
          emissiveMax: Number(options.emissiveMax ?? 0.9),
          fixedDiffuse: options.fixedDiffuse === true
        });
        return material;
      }

      function trackDetailLabel(labelNode, options = {}) {
        detailLabels.push({
          labelNode,
          minAlpha: Number(options.minAlpha ?? 0.18),
          maxAlpha: Number(options.maxAlpha ?? 0.96)
        });
        return labelNode;
      }

      function createDarkAccentMaterial(materialId, tintHex, alpha = 0.92) {
        const material = new BABYLON.StandardMaterial(materialId, scene);
        material.diffuseColor = color3("#07101f", "#07101f");
        material.emissiveColor = color3(tintHex, tintHex).scale(0.68);
        material.specularColor = BABYLON.Color3.Black();
        material.alpha = alpha;
        material.backFaceCulling = false;
        return material;
      }

      function createVariantScreen(idSuffix, width, height, positionVector, tintHex, options = {}) {
        const screen = BABYLON.MeshBuilder.CreatePlane(`${id}${idSuffix}`, {
          width,
          height
        }, scene);
        screen.parent = variantRoot;
        screen.position.copyFrom(positionVector);
        const screenMaterial = createDarkAccentMaterial(`${id}${idSuffix}Material`, tintHex, Number(options.alpha ?? 0.94));
        screen.material = screenMaterial;
        trackDetailMaterial(screenMaterial, {
          colorHex: String(options.colorHex || tintHex),
          alphaMin: Number(options.alphaMin ?? 0.42),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.2),
          emissiveMax: Number(options.emissiveMax ?? 0.92),
          fixedDiffuse: true
        });
        return screen;
      }

      function createVariantTube(idSuffix, localPoints, radius, tintHex, options = {}) {
        const safePoints = Array.isArray(localPoints) ? localPoints.map((point) => (
          point instanceof BABYLON.Vector3 ? point.clone() : toVector3(point)
        )) : [];
        const tube = BABYLON.MeshBuilder.CreateTube(`${id}${idSuffix}`, {
          path: safePoints,
          radius: Number(radius || 0.1),
          tessellation: Number(options.tessellation || 18)
        }, scene);
        tube.parent = variantRoot;
        tube.position.copyFromFloats(0, 0, 0);
        const tubeMaterial = createSurfaceMaterial(`${id}${idSuffix}Material`, tintHex, Number(options.emissiveStrength ?? 0.64), Number(options.alpha ?? 0.92));
        tube.material = tubeMaterial;
        trackDetailMaterial(tubeMaterial, {
          colorHex: tintHex,
          alphaMin: Number(options.alphaMin ?? 0.26),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.14),
          emissiveMax: Number(options.emissiveMax ?? 0.94)
        });
        return tube;
      }

      if (config.variant === "phone") {
        const phoneBody = BABYLON.MeshBuilder.CreateBox(`${id}PhoneBody`, {
          width: 2.1,
          height: 3.7,
          depth: 0.22
        }, scene);
        phoneBody.parent = variantRoot;
        phoneBody.position = new BABYLON.Vector3(0, 0.18, 0.18);
        const phoneBodyMaterial = createSurfaceMaterial(`${id}PhoneBodyMaterial`, baseColorHex, 0.14, 0.96);
        phoneBodyMaterial.diffuseColor = color3("#091120", "#091120");
        phoneBody.material = phoneBodyMaterial;
        trackDetailMaterial(phoneBodyMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.72,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.42,
          fixedDiffuse: true
        });
        createVariantScreen("PhoneScreen", 1.72, 2.88, new BABYLON.Vector3(0, 0.2, 0.31), accentColorHex, {
          alphaMin: 0.46,
          alphaMax: 0.98,
          emissiveMin: 0.16,
          emissiveMax: 0.96
        });
        const notch = BABYLON.MeshBuilder.CreateBox(`${id}PhoneNotch`, {
          width: 0.54,
          height: 0.12,
          depth: 0.04
        }, scene);
        notch.parent = variantRoot;
        notch.position = new BABYLON.Vector3(0, 1.56, 0.38);
        const notchMaterial = createSurfaceMaterial(`${id}PhoneNotchMaterial`, "#0d1526", 0.12, 0.98);
        notch.material = notchMaterial;
        trackDetailMaterial(notchMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.74,
          alphaMax: 0.98,
          emissiveMin: 0.04,
          emissiveMax: 0.16,
          fixedDiffuse: true
        });
        const camera = BABYLON.MeshBuilder.CreateSphere(`${id}PhoneCamera`, {
          diameter: 0.14,
          segments: 12
        }, scene);
        camera.parent = variantRoot;
        camera.position = new BABYLON.Vector3(0.34, 1.56, 0.4);
        const cameraMaterial = createSurfaceMaterial(`${id}PhoneCameraMaterial`, accentColorHex, 0.92, 0.98);
        camera.material = cameraMaterial;
        trackDetailMaterial(cameraMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.78,
          alphaMax: 1,
          emissiveMin: 0.28,
          emissiveMax: 1
        });
        const homeBar = BABYLON.MeshBuilder.CreateBox(`${id}PhoneHomeBar`, {
          width: 0.72,
          height: 0.08,
          depth: 0.04
        }, scene);
        homeBar.parent = variantRoot;
        homeBar.position = new BABYLON.Vector3(0, -1.36, 0.38);
        const homeBarMaterial = createSurfaceMaterial(`${id}PhoneHomeBarMaterial`, accentColorHex, 0.54, 0.98);
        homeBar.material = homeBarMaterial;
        trackDetailMaterial(homeBarMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.62,
          alphaMax: 0.98,
          emissiveMin: 0.16,
          emissiveMax: 0.84
        });
      } else if (config.variant === "terminal") {
        const monitorFrame = BABYLON.MeshBuilder.CreateBox(`${id}MonitorFrame`, {
          width: 2.8,
          height: 1.9,
          depth: 0.18
        }, scene);
        monitorFrame.parent = variantRoot;
        monitorFrame.position = new BABYLON.Vector3(0, 0.38, 0.28);
        const monitorFrameMaterial = createSurfaceMaterial(`${id}MonitorFrameMaterial`, baseColorHex, 0.16, 0.95);
        monitorFrameMaterial.diffuseColor = color3("#0b1325", "#0b1325");
        monitorFrameMaterial.emissiveColor = color3(accentColorHex, accentColorHex).scale(0.16);
        monitorFrame.material = monitorFrameMaterial;
        trackDetailMaterial(monitorFrameMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.56,
          alphaMax: 0.98,
          emissiveMin: 0.1,
          emissiveMax: 0.46,
          fixedDiffuse: true
        });
        createVariantScreen("Screen", 2.35, 1.42, new BABYLON.Vector3(0, 0.38, 0.39), accentColorHex, {
          alphaMin: 0.44,
          alphaMax: 0.98,
          emissiveMin: 0.18,
          emissiveMax: 0.96
        });
        const stand = BABYLON.MeshBuilder.CreateCylinder(`${id}MonitorStand`, {
          height: 0.58,
          diameter: 0.18
        }, scene);
        stand.parent = variantRoot;
        stand.position = new BABYLON.Vector3(0, -0.62, 0.18);
        const standMaterial = createSurfaceMaterial(`${id}MonitorStandMaterial`, accentColorHex, 0.34, 0.9);
        stand.material = standMaterial;
        trackDetailMaterial(standMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.48,
          alphaMax: 0.96,
          emissiveMin: 0.14,
          emissiveMax: 0.72
        });
        const keyboard = BABYLON.MeshBuilder.CreateBox(`${id}Keyboard`, {
          width: 1.85,
          height: 0.08,
          depth: 0.66
        }, scene);
        keyboard.parent = variantRoot;
        keyboard.position = new BABYLON.Vector3(0, -1.02, 0.58);
        keyboard.rotation.x = 0.28;
        const keyboardMaterial = createSurfaceMaterial(`${id}KeyboardMaterial`, accentColorHex, 0.24, 0.86);
        keyboardMaterial.diffuseColor = color3("#10192f", "#10192f");
        keyboard.material = keyboardMaterial;
        trackDetailMaterial(keyboardMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.38,
          alphaMax: 0.9,
          emissiveMin: 0.08,
          emissiveMax: 0.52,
          fixedDiffuse: true
        });
        const statusLed = BABYLON.MeshBuilder.CreateSphere(`${id}StatusLed`, {
          diameter: 0.16,
          segments: 16
        }, scene);
        statusLed.parent = variantRoot;
        statusLed.position = new BABYLON.Vector3(1.18, -0.3, 0.46);
        const ledMaterial = createSurfaceMaterial(`${id}StatusLedMaterial`, accentColorHex, 0.94, 0.98);
        statusLed.material = ledMaterial;
        trackDetailMaterial(ledMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.84,
          alphaMax: 1,
          emissiveMin: 0.42,
          emissiveMax: 1
        });
      } else if (config.variant === "crypto") {
        const lockBody = BABYLON.MeshBuilder.CreateBox(`${id}LockBody`, {
          width: 2.95,
          height: 1.8,
          depth: 0.78
        }, scene);
        lockBody.parent = variantRoot;
        lockBody.position = new BABYLON.Vector3(0, 0.12, 0.26);
        const lockBodyMaterial = createSurfaceMaterial(`${id}LockBodyMaterial`, baseColorHex, 0.26, 0.94);
        lockBodyMaterial.diffuseColor = color3("#130f24", "#130f24");
        lockBody.material = lockBodyMaterial;
        trackDetailMaterial(lockBodyMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.62,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.42,
          fixedDiffuse: true
        });
        createVariantTube("Shackle", [
          new BABYLON.Vector3(-0.82, 0.72, 0.34),
          new BABYLON.Vector3(-0.82, 1.72, 0.34),
          new BABYLON.Vector3(0.82, 1.72, 0.34),
          new BABYLON.Vector3(0.82, 0.72, 0.34)
        ], 0.12, accentColorHex, {
          alphaMin: 0.42,
          alphaMax: 0.98,
          emissiveMin: 0.16,
          emissiveMax: 0.96
        });
        const keySlotTop = BABYLON.MeshBuilder.CreateCylinder(`${id}KeySlotTop`, {
          height: 0.12,
          diameter: 0.28,
          tessellation: 24
        }, scene);
        keySlotTop.parent = variantRoot;
        keySlotTop.position = new BABYLON.Vector3(0, 0.28, 0.68);
        keySlotTop.rotation.x = Math.PI / 2;
        const keySlotMaterial = createSurfaceMaterial(`${id}KeySlotMaterial`, accentColorHex, 0.94, 0.96);
        keySlotMaterial.diffuseColor = color3("#120d1e", "#120d1e");
        keySlotTop.material = keySlotMaterial;
        trackDetailMaterial(keySlotMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.74,
          alphaMax: 0.98,
          emissiveMin: 0.28,
          emissiveMax: 1,
          fixedDiffuse: true
        });
        const keySlotStem = BABYLON.MeshBuilder.CreateBox(`${id}KeySlotStem`, {
          width: 0.14,
          height: 0.42,
          depth: 0.08
        }, scene);
        keySlotStem.parent = variantRoot;
        keySlotStem.position = new BABYLON.Vector3(0, -0.04, 0.72);
        keySlotStem.material = keySlotMaterial;
        const portLeft = BABYLON.MeshBuilder.CreateBox(`${id}PortLeft`, {
          width: 0.62,
          height: 0.1,
          depth: 0.18
        }, scene);
        portLeft.parent = variantRoot;
        portLeft.position = new BABYLON.Vector3(-1.92, 0.08, 0.5);
        const portRight = portLeft.clone(`${id}PortRight`);
        portRight.parent = variantRoot;
        portRight.position = new BABYLON.Vector3(1.92, 0.08, 0.5);
        const portMaterial = createSurfaceMaterial(`${id}PortMaterial`, accentColorHex, 0.72, 0.9);
        portLeft.material = portMaterial;
        portRight.material = portMaterial;
        trackDetailMaterial(portMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.48,
          alphaMax: 0.96,
          emissiveMin: 0.14,
          emissiveMax: 0.84
        });
      } else if (config.variant === "attacker") {
        const hood = BABYLON.MeshBuilder.CreateCylinder(`${id}Hood`, {
          height: 1.95,
          diameterTop: 0.9,
          diameterBottom: 2.0,
          tessellation: 24
        }, scene);
        hood.parent = variantRoot;
        hood.position = new BABYLON.Vector3(-1.75, -0.02, 0.18);
        const hoodMaterial = createSurfaceMaterial(`${id}HoodMaterial`, baseColorHex, 0.26, 0.94);
        hoodMaterial.diffuseColor = color3("#150d16", "#150d16");
        hood.material = hoodMaterial;
        trackDetailMaterial(hoodMaterial, {
          colorHex: palette.attackerBase,
          alphaMin: 0.68,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.36,
          fixedDiffuse: true
        });
        const head = BABYLON.MeshBuilder.CreateSphere(`${id}Head`, {
          diameter: 0.92,
          segments: 20
        }, scene);
        head.parent = variantRoot;
        head.position = new BABYLON.Vector3(-1.75, 1.05, 0.26);
        const headMaterial = createSurfaceMaterial(`${id}HeadMaterial`, "#1d1520", 0.16, 0.96);
        head.material = headMaterial;
        trackDetailMaterial(headMaterial, {
          colorHex: palette.attackerBase,
          alphaMin: 0.72,
          alphaMax: 0.98,
          emissiveMin: 0.04,
          emissiveMax: 0.18,
          fixedDiffuse: true
        });
        createVariantScreen("AttackerVisor", 0.9, 0.26, new BABYLON.Vector3(-1.75, 1.02, 0.7), palette.attackerBase, {
          alphaMin: 0.54,
          alphaMax: 0.98,
          emissiveMin: 0.28,
          emissiveMax: 1
        });
        const interceptor = BABYLON.MeshBuilder.CreateBox(`${id}InterceptorScreenFrame`, {
          width: 2.95,
          height: 1.48,
          depth: 0.16
        }, scene);
        interceptor.parent = variantRoot;
        interceptor.position = new BABYLON.Vector3(1.75, 0.28, 0.24);
        const interceptorFrameMaterial = createSurfaceMaterial(`${id}InterceptorFrameMaterial`, palette.attackerBase, 0.18, 0.94);
        interceptorFrameMaterial.diffuseColor = color3("#0f1326", "#0f1326");
        interceptor.material = interceptorFrameMaterial;
        trackDetailMaterial(interceptorFrameMaterial, {
          colorHex: palette.attackerBase,
          alphaMin: 0.54,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.44,
          fixedDiffuse: true
        });
        createVariantScreen("InterceptorScreen", 2.46, 1.08, new BABYLON.Vector3(1.75, 0.28, 0.38), palette.attackerBase, {
          alphaMin: 0.44,
          alphaMax: 0.98,
          emissiveMin: 0.18,
          emissiveMax: 0.98
        });
      } else if (config.variant === "vault") {
        const vaultBody = BABYLON.MeshBuilder.CreateBox(`${id}VaultBody`, {
          width: 2.35,
          height: 1.9,
          depth: 1.22
        }, scene);
        vaultBody.parent = variantRoot;
        vaultBody.position = new BABYLON.Vector3(0, 0.04, 0.18);
        const vaultBodyMaterial = createSurfaceMaterial(`${id}VaultBodyMaterial`, baseColorHex, 0.24, 0.96);
        vaultBodyMaterial.diffuseColor = color3("#141c33", "#141c33");
        vaultBody.material = vaultBodyMaterial;
        trackDetailMaterial(vaultBodyMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.72,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.34,
          fixedDiffuse: true
        });
        const vaultDoor = BABYLON.MeshBuilder.CreateCylinder(`${id}VaultDoor`, {
          height: 0.22,
          diameter: 1.46,
          tessellation: 28
        }, scene);
        vaultDoor.parent = variantRoot;
        vaultDoor.position = new BABYLON.Vector3(0, 0.04, 0.86);
        vaultDoor.rotation.x = Math.PI / 2;
        const vaultDoorMaterial = createSurfaceMaterial(`${id}VaultDoorMaterial`, accentColorHex, 0.62, 0.96);
        vaultDoor.material = vaultDoorMaterial;
        trackDetailMaterial(vaultDoorMaterial, {
          colorHex: accentColorHex,
          alphaMin: 0.84,
          alphaMax: 1,
          emissiveMin: 0.18,
          emissiveMax: 0.92
        });
        const wheelHub = BABYLON.MeshBuilder.CreateCylinder(`${id}VaultWheelHub`, {
          height: 0.16,
          diameter: 0.28,
          tessellation: 20
        }, scene);
        wheelHub.parent = variantRoot;
        wheelHub.position = new BABYLON.Vector3(0, 0.04, 1.02);
        wheelHub.rotation.x = Math.PI / 2;
        const wheelMaterial = createSurfaceMaterial(`${id}VaultWheelMaterial`, palette.keyBase, 0.84, 0.98);
        wheelHub.material = wheelMaterial;
        trackDetailMaterial(wheelMaterial, {
          colorHex: palette.keyBase,
          alphaMin: 0.82,
          alphaMax: 1,
          emissiveMin: 0.26,
          emissiveMax: 1
        });
        ["x", "y", "d"].forEach((axis, index) => {
          const spoke = BABYLON.MeshBuilder.CreateBox(`${id}VaultSpoke${axis.toUpperCase()}`, {
            width: axis === "x" ? 0.72 : 0.1,
            height: axis === "y" ? 0.72 : 0.1,
            depth: axis === "d" ? 0.72 : 0.1
          }, scene);
          spoke.parent = variantRoot;
          spoke.position = new BABYLON.Vector3(0, 0.04, 1.02);
          if (axis === "d") {
            spoke.rotation.z = Math.PI / 4;
          }
          spoke.material = wheelMaterial;
        });
      }
      const titleLabel = createTextLabel(`${id}Title`, titleText, {
        planeWidth: Number(config.titleWidth || Math.max(3.6, size.width - 0.2)),
        planeHeight: Number(config.titleHeight || 0.86),
        textureWidth: 1024,
        textureHeight: 196,
        fontSize: Number(config.titleFontSize || 78),
        backgroundAlpha: 0.16,
        borderStyle: "rgba(244,248,255,0.12)"
      });
      titleLabel.plane.parent = root;
      titleLabel.plane.position = new BABYLON.Vector3(0, (size.height / 2) + Number(config.titleYOffset || 0.72), 0);
      const contentLabel = createTextLabel(`${id}Content`, config.contentText || "", {
        planeWidth: Number(config.contentWidth || Math.max(3.3, size.width - 0.45)),
        planeHeight: Number(config.contentHeight || Math.max(1.2, size.height - 0.9)),
        textureWidth: 1024,
        textureHeight: 384,
        fontSize: Number(config.contentFontSize || 60),
        backgroundAlpha: 0.2,
        borderStyle: "rgba(244,248,255,0.08)",
        lineHeight: Number(config.contentLineHeight || 64)
      });
      contentLabel.plane.parent = root;
      const contentOffset = Array.isArray(config.contentOffset)
        ? config.contentOffset
        : [0, -0.04, (backdropDepth / 2) + 0.08];
      contentLabel.plane.position = toVector3(contentOffset);
      return {
        root,
        bodyMaterial,
        shellMaterial,
        accentMaterial,
        titleLabel,
        contentLabel,
        detailMaterials,
        detailLabels,
        baseColor: baseColorHex,
        accentColor: accentColorHex,
        basePosition: position.clone()
      };
    }

    function createPathMesh(id, points, radius, colorHex) {
      const sampler = buildPathSampler(points);
      const mesh = BABYLON.MeshBuilder.CreateTube(id, {
        path: sampler.points,
        radius: Number(radius || 0.08),
        tessellation: 18
      }, scene);
      const material = createSurfaceMaterial(`${id}Material`, colorHex || palette.networkBase, 0.64, 0.6);
      mesh.material = material;
      return {
        mesh,
        material,
        sampler,
        baseColor: String(colorHex || palette.networkBase)
      };
    }

    function createToken(id, text, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      const variant = String(config.variant || "").trim();
      const detailMaterials = [];
      const variantRoot = new BABYLON.TransformNode(`${id}VariantRoot`, scene);
      variantRoot.parent = root;
      variantRoot.position.z = variant ? 0.08 : 0;
      const body = BABYLON.MeshBuilder.CreateBox(`${id}Body`, {
        width: Number(config.width || 1.4),
        height: Number(config.height || 0.46),
        depth: Number(config.depth || 0.3)
      }, scene);
      body.parent = root;
      const bodyMaterial = createSurfaceMaterial(`${id}BodyMaterial`, config.color || palette.keyBase, 0.62, 0.96);
      body.material = bodyMaterial;
      const shell = BABYLON.MeshBuilder.CreateBox(`${id}Shell`, {
        width: Number(config.width || 1.4) + 0.12,
        height: Number(config.height || 0.46) + 0.12,
        depth: Number(config.depth || 0.3) + 0.12
      }, scene);
      shell.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}ShellMaterial`, config.color || palette.keyBase, 0.92, 0.12);
      shell.material = shellMaterial;

      function trackDetailMaterial(material, options = {}) {
        detailMaterials.push({
          material,
          colorHex: String(options.colorHex || config.color || palette.keyBase),
          alphaMin: Number(options.alphaMin ?? 0.18),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.08),
          emissiveMax: Number(options.emissiveMax ?? 0.94),
          fixedDiffuse: options.fixedDiffuse === true
        });
        return material;
      }

      if (variant === "document") {
        body.scaling.z = 0.42;
        shell.scaling.z = 0.46;
        const sheet = BABYLON.MeshBuilder.CreateBox(`${id}Sheet`, {
          width: Math.max(1.05, Number(config.width || 1.4) * 0.9),
          height: Math.max(0.68, Number(config.height || 0.46) * 1.82),
          depth: 0.06
        }, scene);
        sheet.parent = variantRoot;
        sheet.position = new BABYLON.Vector3(0, -0.08, 0.06);
        const sheetMaterial = createSurfaceMaterial(`${id}SheetMaterial`, config.color || palette.plaintext, 0.42, 0.98);
        sheetMaterial.diffuseColor = color3("#f8fbff", "#f8fbff");
        sheet.material = sheetMaterial;
        trackDetailMaterial(sheetMaterial, {
          colorHex: config.color || palette.plaintext,
          alphaMin: 0.82,
          alphaMax: 1,
          emissiveMin: 0.06,
          emissiveMax: 0.24,
          fixedDiffuse: true
        });
        const fold = BABYLON.MeshBuilder.CreateBox(`${id}Fold`, {
          width: 0.26,
          height: 0.22,
          depth: 0.05
        }, scene);
        fold.parent = variantRoot;
        fold.position = new BABYLON.Vector3(0.46, 0.46, 0.1);
        fold.rotation.z = -0.38;
        const foldMaterial = createSurfaceMaterial(`${id}FoldMaterial`, palette.subtle, 0.34, 0.94);
        fold.material = foldMaterial;
        trackDetailMaterial(foldMaterial, {
          colorHex: palette.subtle,
          alphaMin: 0.72,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.28
        });
        [-0.18, 0.0, 0.18].forEach((offsetY, index) => {
          const line = BABYLON.MeshBuilder.CreateBox(`${id}Line${index + 1}`, {
            width: 0.72 - (index * 0.08),
            height: 0.05,
            depth: 0.02
          }, scene);
          line.parent = variantRoot;
          line.position = new BABYLON.Vector3(-0.08, offsetY, 0.12);
          const lineMaterial = createSurfaceMaterial(`${id}LineMaterial${index + 1}`, palette.senderBase, 0.54, 0.92);
          line.material = lineMaterial;
          trackDetailMaterial(lineMaterial, {
            colorHex: palette.senderBase,
            alphaMin: 0.58,
            alphaMax: 0.96,
            emissiveMin: 0.12,
            emissiveMax: 0.62
          });
        });
      } else if (variant === "data") {
        body.scaling.z = 0.52;
        shell.scaling.z = 0.56;
        const chip = BABYLON.MeshBuilder.CreateBox(`${id}Chip`, {
          width: Math.max(0.92, Number(config.width || 1.4) * 0.92),
          height: Math.max(0.42, Number(config.height || 0.46) * 1.06),
          depth: 0.14
        }, scene);
        chip.parent = variantRoot;
        chip.position = new BABYLON.Vector3(0, 0, 0.08);
        const chipMaterial = createSurfaceMaterial(`${id}ChipMaterial`, config.color || palette.ciphertext, 0.76, 0.98);
        chipMaterial.diffuseColor = color3("#0b1529", "#0b1529");
        chip.material = chipMaterial;
        trackDetailMaterial(chipMaterial, {
          colorHex: config.color || palette.ciphertext,
          alphaMin: 0.74,
          alphaMax: 1,
          emissiveMin: 0.18,
          emissiveMax: 0.92,
          fixedDiffuse: true
        });
        [-0.18, 0, 0.18].forEach((offsetY, index) => {
          const bar = BABYLON.MeshBuilder.CreateBox(`${id}BitBar${index + 1}`, {
            width: 0.72 - (index * 0.08),
            height: 0.06,
            depth: 0.04
          }, scene);
          bar.parent = variantRoot;
          bar.position = new BABYLON.Vector3(0, offsetY, 0.18);
          const barMaterial = createSurfaceMaterial(`${id}BitBarMaterial${index + 1}`, config.color || palette.ciphertext, 0.92, 0.96);
          bar.material = barMaterial;
          trackDetailMaterial(barMaterial, {
            colorHex: config.color || palette.ciphertext,
            alphaMin: 0.68,
            alphaMax: 1,
            emissiveMin: 0.22,
            emissiveMax: 1
          });
        });
        [-0.46, 0.46].forEach((offsetX, index) => {
          const node = BABYLON.MeshBuilder.CreateSphere(`${id}BitNode${index + 1}`, {
            diameter: 0.12,
            segments: 12
          }, scene);
          node.parent = variantRoot;
          node.position = new BABYLON.Vector3(offsetX, 0.3 - (index * 0.6), 0.2);
          const nodeMaterial = createSurfaceMaterial(`${id}BitNodeMaterial${index + 1}`, config.color || palette.ciphertext, 0.96, 0.98);
          node.material = nodeMaterial;
          trackDetailMaterial(nodeMaterial, {
            colorHex: config.color || palette.ciphertext,
            alphaMin: 0.76,
            alphaMax: 1,
            emissiveMin: 0.26,
            emissiveMax: 1
          });
        });
      } else if (variant === "key") {
        body.scaling.copyFromFloats(0.74, 0.74, 0.46);
        shell.scaling.copyFromFloats(0.78, 0.78, 0.5);
        const ring = BABYLON.MeshBuilder.CreateTorus(`${id}Ring`, {
          diameter: 0.54,
          thickness: 0.1,
          tessellation: 24
        }, scene);
        ring.parent = variantRoot;
        ring.position = new BABYLON.Vector3(-0.32, 0.02, 0.1);
        const keyMaterial = createSurfaceMaterial(`${id}KeyMaterial`, config.color || palette.keyBase, 0.92, 0.98);
        ring.material = keyMaterial;
        trackDetailMaterial(keyMaterial, {
          colorHex: config.color || palette.keyBase,
          alphaMin: 0.76,
          alphaMax: 1,
          emissiveMin: 0.24,
          emissiveMax: 1
        });
        const shaft = BABYLON.MeshBuilder.CreateBox(`${id}Shaft`, {
          width: 0.64,
          height: 0.12,
          depth: 0.1
        }, scene);
        shaft.parent = variantRoot;
        shaft.position = new BABYLON.Vector3(0.12, 0.02, 0.1);
        shaft.material = keyMaterial;
        const toothA = BABYLON.MeshBuilder.CreateBox(`${id}ToothA`, {
          width: 0.12,
          height: 0.18,
          depth: 0.08
        }, scene);
        toothA.parent = variantRoot;
        toothA.position = new BABYLON.Vector3(0.32, -0.09, 0.1);
        toothA.material = keyMaterial;
        const toothB = BABYLON.MeshBuilder.CreateBox(`${id}ToothB`, {
          width: 0.12,
          height: 0.12,
          depth: 0.08
        }, scene);
        toothB.parent = variantRoot;
        toothB.position = new BABYLON.Vector3(0.48, -0.06, 0.1);
        toothB.material = keyMaterial;
      } else if (variant === "lock") {
        body.scaling.copyFromFloats(0.78, 0.84, 0.52);
        shell.scaling.copyFromFloats(0.84, 0.9, 0.58);
        const shackleMaterial = createSurfaceMaterial(`${id}LockMaterial`, config.color || palette.keyBase, 0.92, 0.98);
        trackDetailMaterial(shackleMaterial, {
          colorHex: config.color || palette.keyBase,
          alphaMin: 0.74,
          alphaMax: 1,
          emissiveMin: 0.24,
          emissiveMax: 1
        });
        const shackleLeft = BABYLON.MeshBuilder.CreateCylinder(`${id}ShackleLeft`, {
          height: 0.54,
          diameter: 0.1,
          tessellation: 18
        }, scene);
        shackleLeft.parent = variantRoot;
        shackleLeft.position = new BABYLON.Vector3(-0.22, 0.34, 0.1);
        shackleLeft.material = shackleMaterial;
        const shackleRight = shackleLeft.clone(`${id}ShackleRight`);
        shackleRight.parent = variantRoot;
        shackleRight.position = new BABYLON.Vector3(0.22, 0.34, 0.1);
        const shackleTop = BABYLON.MeshBuilder.CreateCylinder(`${id}ShackleTop`, {
          height: 0.5,
          diameter: 0.1,
          tessellation: 18
        }, scene);
        shackleTop.parent = variantRoot;
        shackleTop.position = new BABYLON.Vector3(0, 0.58, 0.1);
        shackleTop.rotation.z = Math.PI / 2;
        shackleTop.material = shackleMaterial;
        const lockCore = BABYLON.MeshBuilder.CreateBox(`${id}LockCore`, {
          width: 0.68,
          height: 0.5,
          depth: 0.12
        }, scene);
        lockCore.parent = variantRoot;
        lockCore.position = new BABYLON.Vector3(0, 0.04, 0.14);
        const lockCoreMaterial = createSurfaceMaterial(`${id}LockCoreMaterial`, config.color || palette.keyBase, 0.72, 0.96);
        lockCoreMaterial.diffuseColor = color3("#101825", "#101825");
        lockCore.material = lockCoreMaterial;
        trackDetailMaterial(lockCoreMaterial, {
          colorHex: config.color || palette.keyBase,
          alphaMin: 0.64,
          alphaMax: 0.98,
          emissiveMin: 0.12,
          emissiveMax: 0.76,
          fixedDiffuse: true
        });
      }

      const label = createTextLabel(`${id}Label`, text, {
        planeWidth: Number(config.labelWidth || Math.max(1.8, (Number(config.width || 1.4) + 0.6))),
        planeHeight: Number(config.labelHeight || 0.54),
        textureWidth: 768,
        textureHeight: 180,
        fontSize: Number(config.fontSize || 58),
        backgroundAlpha: 0.22,
        borderStyle: "rgba(244,248,255,0.08)"
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, Number(config.labelYOffset || (variant === "document" ? 0.82 : 0.52)), 0);
      return {
        root,
        bodyMaterial,
        shellMaterial,
        detailMaterials,
        label,
        baseColor: String(config.color || palette.keyBase)
      };
    }

    function createNetworkCluster(id, position, colorHex = palette.networkBase) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      const materials = [];
      const orbiters = [];

      function trackMaterial(material, options = {}) {
        materials.push({
          material,
          colorHex: String(options.colorHex || colorHex),
          alphaMin: Number(options.alphaMin ?? 0.16),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.08),
          emissiveMax: Number(options.emissiveMax ?? 0.92),
          fixedDiffuse: options.fixedDiffuse === true
        });
        return material;
      }

      const core = BABYLON.MeshBuilder.CreateSphere(`${id}Core`, {
        diameter: 0.96,
        segments: 20
      }, scene);
      core.parent = root;
      core.position = new BABYLON.Vector3(0, 0.16, 0.18);
      const coreMaterial = createSurfaceMaterial(`${id}CoreMaterial`, colorHex, 0.84, 0.96);
      core.material = coreMaterial;
      trackMaterial(coreMaterial, {
        alphaMin: 0.48,
        alphaMax: 1,
        emissiveMin: 0.22,
        emissiveMax: 1
      });

      const satellitePoints = [
        new BABYLON.Vector3(-1.28, 0.74, 0.02),
        new BABYLON.Vector3(1.24, 0.88, 0.02),
        new BABYLON.Vector3(1.05, -0.78, 0.18),
        new BABYLON.Vector3(-1.16, -0.9, 0.18)
      ];
      satellitePoints.forEach((localPoint, index) => {
        const node = BABYLON.MeshBuilder.CreateSphere(`${id}Node${index + 1}`, {
          diameter: 0.42,
          segments: 16
        }, scene);
        node.parent = root;
        node.position.copyFrom(localPoint);
        const nodeMaterial = createSurfaceMaterial(`${id}NodeMaterial${index + 1}`, colorHex, 0.72, 0.94);
        node.material = nodeMaterial;
        trackMaterial(nodeMaterial, {
          alphaMin: 0.32,
          alphaMax: 0.98,
          emissiveMin: 0.16,
          emissiveMax: 0.94
        });
        orbiters.push({
          mesh: node,
          basePosition: localPoint.clone(),
          phase: index * 0.7
        });

        const link = BABYLON.MeshBuilder.CreateTube(`${id}Link${index + 1}`, {
          path: [BABYLON.Vector3.Zero(), localPoint],
          radius: 0.05,
          tessellation: 12
        }, scene);
        link.parent = root;
        link.position.copyFromFloats(0, 0, 0);
        const linkMaterial = createSurfaceMaterial(`${id}LinkMaterial${index + 1}`, colorHex, 0.56, 0.9);
        link.material = linkMaterial;
        trackMaterial(linkMaterial, {
          alphaMin: 0.18,
          alphaMax: 0.82,
          emissiveMin: 0.1,
          emissiveMax: 0.76
        });
      });

      return {
        root,
        materials,
        orbiters,
        baseColor: String(colorHex),
        basePosition: position.clone()
      };
    }

    function setNetworkClusterState(cluster, alpha = 0.4, colorHex = cluster.baseColor) {
      const safeAlpha = clamp(alpha, 0, 1);
      cluster.root.setEnabled(safeAlpha > 0.01);
      if (!cluster.root.isEnabled()) return;
      const tint = color3(colorHex || cluster.baseColor, cluster.baseColor);
      cluster.materials.forEach((entry) => {
        if (!entry?.material) return;
        entry.material.alpha = lerpNumber(entry.alphaMin, entry.alphaMax, safeAlpha);
        entry.material.emissiveColor = tint.scale(lerpNumber(entry.emissiveMin, entry.emissiveMax, safeAlpha));
        if (!entry.fixedDiffuse) {
          entry.material.diffuseColor = tint;
        }
      });
      const scale = 0.9 + (safeAlpha * 0.18);
      cluster.root.scaling.copyFromFloats(scale, scale, scale);
    }

    function setPanelState(panel, emphasis = 0.15, colorHex = panel.baseColor, options = {}) {
      const safeEmphasis = clamp(emphasis, 0, 1);
      const visible = safeEmphasis > 0.01 || options.forceVisible === true;
      panel.root.setEnabled(visible);
      if (!visible) return;
      const tint = color3(colorHex || panel.baseColor, panel.baseColor);
      const scale = 1 + (safeEmphasis * 0.04);
      panel.root.scaling.copyFromFloats(scale, scale, 1);
      panel.bodyMaterial.alpha = 0.2 + (safeEmphasis * 0.52);
      panel.bodyMaterial.emissiveColor = tint.scale(0.06 + (safeEmphasis * 0.32));
      panel.shellMaterial.alpha = 0.08 + (safeEmphasis * 0.16);
      panel.shellMaterial.emissiveColor = tint.scale(0.18 + (safeEmphasis * 0.74));
      panel.accentMaterial.emissiveColor = tint.scale(0.56 + (safeEmphasis * 0.54));
      panel.titleLabel.setAlpha(0.36 + (safeEmphasis * 0.64));
      panel.contentLabel.setAlpha(0.24 + (safeEmphasis * 0.76));
      (panel.detailMaterials || []).forEach((detail) => {
        if (!detail?.material) return;
        const detailTint = color3(detail.colorHex || colorHex || panel.accentColor, panel.accentColor);
        detail.material.alpha = lerpNumber(detail.alphaMin, detail.alphaMax, safeEmphasis);
        detail.material.emissiveColor = detailTint.scale(lerpNumber(detail.emissiveMin, detail.emissiveMax, safeEmphasis));
        if (!detail.fixedDiffuse) {
          detail.material.diffuseColor = detailTint;
        }
      });
      (panel.detailLabels || []).forEach((detail) => {
        if (!detail?.labelNode) return;
        detail.labelNode.setAlpha(lerpNumber(detail.minAlpha, detail.maxAlpha, safeEmphasis));
      });
    }

    function setPathState(pathEntry, alpha = 0, colorHex = pathEntry.baseColor) {
      const safeAlpha = clamp(alpha, 0, 1);
      pathEntry.mesh.setEnabled(safeAlpha > 0.01);
      if (!pathEntry.mesh.isEnabled()) return;
      const tint = color3(colorHex || pathEntry.baseColor, pathEntry.baseColor);
      pathEntry.material.alpha = 0.08 + (safeAlpha * 0.78);
      pathEntry.material.emissiveColor = tint.scale(0.18 + (safeAlpha * 0.86));
    }

    function setTokenState(token, options = {}) {
      const visible = options.visible !== false;
      const alpha = clamp(Number(options.alpha ?? 1), 0, 1);
      const scale = Number(options.scale || 1);
      token.root.setEnabled(visible && alpha > 0.01);
      if (!token.root.isEnabled()) return;
      if (options.position instanceof BABYLON.Vector3) {
        token.root.position.copyFrom(options.position);
      } else if (Array.isArray(options.position)) {
        token.root.position.copyFrom(toVector3(options.position));
      }
      token.root.scaling.copyFromFloats(scale, scale, scale);
      const tint = color3(options.color || token.baseColor, token.baseColor);
      token.bodyMaterial.alpha = 0.3 + (alpha * 0.66);
      token.bodyMaterial.emissiveColor = tint.scale(0.38 + (alpha * 0.72));
      token.shellMaterial.alpha = 0.06 + (alpha * 0.2);
      token.shellMaterial.emissiveColor = tint.scale(0.22 + (alpha * 0.7));
      (token.detailMaterials || []).forEach((detail) => {
        if (!detail?.material) return;
        const detailTint = color3(options.color || detail.colorHex || token.baseColor, token.baseColor);
        detail.material.alpha = lerpNumber(detail.alphaMin, detail.alphaMax, alpha);
        detail.material.emissiveColor = detailTint.scale(lerpNumber(detail.emissiveMin, detail.emissiveMax, alpha));
        if (!detail.fixedDiffuse) {
          detail.material.diffuseColor = detailTint;
        }
      });
      token.label.setAlpha(alpha);
      if (options.text !== undefined) {
        updateLabelText(token.label, options.text);
      }
    }

    const positions = {
      sender: toVector3(layout.sender, [-12, 2.1, 0]),
      encrypt: toVector3(layout.encrypt, [-5.2, 2.1, 0]),
      network: toVector3(layout.network, [0, 2.1, 0]),
      decrypt: toVector3(layout.decrypt, [5.2, 2.1, 0]),
      receiver: toVector3(layout.receiver, [12, 2.1, 0]),
      attacker: toVector3(layout.attacker, isEndToEnd ? [-9.2, -2.45, 0] : [0, -2.45, 0]),
      server: toVector3(layout.server, [0, -2.45, 0]),
      vault: toVector3(layout.vault, [9.2, -2.2, -0.4]),
      quote: toVector3(layout.quote, [0, 5.3, 0])
    };

    const senderPanel = createPanel("symmetricSender", senderTitle, positions.sender, {
      variant: isEndToEnd ? "phone" : "terminal",
      size: isEndToEnd ? { width: 3.45, height: 5.1, depth: 0.52 } : { width: 4.3, height: 3.15, depth: 0.82 },
      color: palette.senderBase,
      accent: palette.senderBase,
      contentText: plainText,
      contentWidth: isEndToEnd ? 2.05 : 2.9,
      contentHeight: isEndToEnd ? 1.76 : 0.84,
      contentFontSize: isEndToEnd ? 42 : 50,
      contentLineHeight: isEndToEnd ? 46 : 54,
      contentOffset: isEndToEnd ? [0, 0.05, 0.64] : [0, 0.38, 0.72],
      titleWidth: isEndToEnd ? 3.2 : undefined,
      titleFontSize: isEndToEnd ? 66 : undefined
    });
    const encryptPanel = createPanel("symmetricEncrypt", "Verschluesselung", positions.encrypt, {
      variant: "crypto",
      size: { width: 4.8, height: 3.2, depth: 0.9 },
      color: palette.cryptoBase,
      accent: palette.keyBase,
      contentText: encryptDefaultText,
      contentWidth: 3.85,
      contentHeight: 0.95,
      contentFontSize: 50,
      contentLineHeight: 54,
      contentOffset: [0, -1.18, 0.52]
    });
    const decryptPanel = createPanel("symmetricDecrypt", "Entschluesselung", positions.decrypt, {
      variant: "crypto",
      size: { width: 4.8, height: 3.2, depth: 0.9 },
      color: palette.cryptoBase,
      accent: palette.keyBase,
      contentText: decryptDefaultText,
      contentWidth: 3.85,
      contentHeight: 0.95,
      contentFontSize: 50,
      contentLineHeight: 54,
      contentOffset: [0, -1.18, 0.52]
    });
    const receiverPanel = createPanel("symmetricReceiver", receiverTitle, positions.receiver, {
      variant: isEndToEnd ? "phone" : "terminal",
      size: isEndToEnd ? { width: 3.45, height: 5.1, depth: 0.52 } : { width: 4.3, height: 3.15, depth: 0.82 },
      color: palette.receiverBase,
      accent: palette.receiverBase,
      contentText: isEndToEnd ? "Noch kein Klartext" : "Wartet auf Entschluesselung",
      contentWidth: isEndToEnd ? 2.05 : 2.9,
      contentHeight: isEndToEnd ? 1.76 : 0.84,
      contentFontSize: isEndToEnd ? 40 : 48,
      contentLineHeight: isEndToEnd ? 44 : 52,
      contentOffset: isEndToEnd ? [0, 0.05, 0.64] : [0, 0.38, 0.72],
      titleWidth: isEndToEnd ? 3.2 : undefined,
      titleFontSize: isEndToEnd ? 66 : undefined
    });
    const attackerPanel = createPanel("symmetricAttacker", "Angreifer", positions.attacker, {
      variant: "attacker",
      size: isEndToEnd ? { width: 6.4, height: 2.9, depth: 0.82 } : { width: 7.2, height: 3.05, depth: 0.82 },
      color: palette.attackerBase,
      accent: palette.attackerBase,
      contentText: "Beobachtet den Transport",
      contentWidth: isEndToEnd ? 3.1 : 3.35,
      contentHeight: 0.94,
      contentFontSize: 46,
      contentLineHeight: 52,
      contentOffset: [1.75, 0.26, 0.72]
    });
    const vaultPanel = createPanel("symmetricVault", isEndToEnd ? "Cloud-Backup" : ((isAsymmetric || isHybrid) ? "Privater Schluessel" : "Schluesseltresor"), positions.vault, {
      variant: "vault",
      size: { width: 3.7, height: 2.72, depth: 0.9 },
      color: palette.vaultBase,
      accent: palette.keyBase,
      contentText: vaultDefaultText,
      contentFontSize: 50,
      contentLineHeight: 54,
      contentWidth: 2.3,
      contentHeight: 0.82,
      contentOffset: [0, -0.94, 0.98]
    });
    const serverPanel = isEndToEnd ? createPanel("symmetricServer", serverTitle, positions.server, {
      variant: "terminal",
      size: { width: 5.4, height: 3.0, depth: 0.82 },
      color: palette.networkBase,
      accent: palette.ciphertext,
      contentText: transportOnlyText,
      contentWidth: 3.4,
      contentHeight: 1.0,
      contentFontSize: 42,
      contentLineHeight: 46,
      contentOffset: [0, 0.34, 0.72],
      titleWidth: 4.2,
      titleFontSize: 68
    }) : null;

    const ground = BABYLON.MeshBuilder.CreateGround("symmetricCryptoGround", {
      width: 34,
      height: 18
    }, scene);
    ground.position.y = -4.1;
    const groundMaterial = createSurfaceMaterial("symmetricCryptoGroundMaterial", "#0c1530", 0.14, 0.95);
    groundMaterial.diffuseColor = color3("#0b1325", "#0b1325");
    groundMaterial.emissiveColor = color3(palette.stageLine || "#17375c", "#17375c").scale(0.12);
    ground.material = groundMaterial;

    const networkLabel = createTextLabel("symmetricNetworkLabel", isEndToEnd ? "Server / Internet / Netz" : "Unsicheres Netz", {
      planeWidth: 5.2,
      planeHeight: 0.82,
      textureWidth: 1024,
      textureHeight: 196,
      fontSize: 74,
      backgroundAlpha: 0.16
    });
    const networkLabelBasePosition = positions.network.add(new BABYLON.Vector3(0, 2.1, 0));
    networkLabel.plane.position.copyFrom(networkLabelBasePosition);
    const networkCluster = createNetworkCluster("symmetricNetworkCluster", positions.network.add(new BABYLON.Vector3(0, 0.1, 0.04)));
    const plainFlowLabel = createTextLabel("symmetricPlainFlowLabel", "Klartext", {
      planeWidth: 2.8,
      planeHeight: 0.56,
      textureWidth: 640,
      textureHeight: 160,
      fontSize: 56,
      backgroundAlpha: 0.14,
      borderStyle: "rgba(244,248,255,0.12)"
    });
    const plainFlowLabelBasePosition = positions.encrypt.add(new BABYLON.Vector3(-1.8, 1.18, 0.12));
    plainFlowLabel.plane.position.copyFrom(plainFlowLabelBasePosition);
    const cipherFlowLabel = createTextLabel("symmetricCipherFlowLabel", "Geheimtext", {
      planeWidth: 3.2,
      planeHeight: 0.56,
      textureWidth: 768,
      textureHeight: 160,
      fontSize: 56,
      backgroundAlpha: 0.14,
      borderStyle: "rgba(159,208,255,0.14)"
    });
    const cipherFlowLabelBasePosition = positions.network.add(new BABYLON.Vector3(0, 1.18, 0.16));
    cipherFlowLabel.plane.position.copyFrom(cipherFlowLabelBasePosition);
    const sharedKeyLabel = createTextLabel("symmetricSharedKeyLabel", sharedKeyBannerText, {
      planeWidth: 5.6,
      planeHeight: 0.62,
      textureWidth: 1280,
      textureHeight: 180,
      fontSize: 52,
      backgroundAlpha: 0.16,
      borderStyle: "rgba(255,224,130,0.18)"
    });
    const sharedKeyLabelBasePosition = (
      isEndToEnd
        ? positions.network.add(new BABYLON.Vector3(0, 3.7, 0.1))
        : ((isAsymmetric || isHybrid)
        ? positions.network.add(new BABYLON.Vector3(0, 3.7, 0.1))
        : positions.sender.add(new BABYLON.Vector3(5.4, 3.9, 0.1)))
    );
    sharedKeyLabel.plane.position.copyFrom(sharedKeyLabelBasePosition);

    const schemaBoard = createTextLabel("symmetricSchemaBoard", principleText, {
      planeWidth: 11.2,
      planeHeight: 2.7,
      textureWidth: 1600,
      textureHeight: 540,
      fontSize: 64,
      lineHeight: 70,
      backgroundAlpha: 0.24,
      borderStyle: "rgba(159,124,255,0.18)"
    });
    schemaBoard.plane.position.copyFrom(positions.quote.add(new BABYLON.Vector3(0, -1.35, 0)));
    const quoteBoard = createTextLabel("symmetricQuoteBoard", finalQuote, {
      planeWidth: 10.8,
      planeHeight: 1.8,
      textureWidth: 1600,
      textureHeight: 360,
      fontSize: 86,
      lineHeight: 88,
      backgroundAlpha: 0.28,
      borderStyle: "rgba(255,224,130,0.22)"
    });
    quoteBoard.plane.position.copyFrom(positions.quote);

    const algorithmBoard = createTextLabel("symmetricAlgorithmBoard", "Algorithmus bekannt", {
      planeWidth: 5.2,
      planeHeight: 0.88,
      textureWidth: 1024,
      textureHeight: 196,
      fontSize: 72,
      backgroundAlpha: 0.18,
      borderStyle: "rgba(244,248,255,0.12)"
    });
    algorithmBoard.plane.position.copyFrom(new BABYLON.Vector3(0, -0.15, -0.1));

    const keyHubPosition = isAsymmetric
      ? positions.receiver.add(new BABYLON.Vector3(-1.2, 3.15, 0.08))
      : (isEndToEnd
        ? positions.network.add(new BABYLON.Vector3(0, 3.35, 0.08))
        : positions.sender.add(new BABYLON.Vector3(1.9, 3.15, 0.08)));
    const leftKeyPosition = positions.encrypt.add(new BABYLON.Vector3(0, 2.2, 0));
    const rightKeyPosition = positions.decrypt.add(new BABYLON.Vector3(0, 2.2, 0));
    const unsafeInterceptPosition = positions.attacker.add(new BABYLON.Vector3(0, 1.35, 0));
    const vaultKeyPosition = positions.vault.add(new BABYLON.Vector3(0, 0.9, 0.35));
    const serverTapPosition = positions.server.add(new BABYLON.Vector3(0, 1.32, 0.24));
    const senderLockPosition = positions.sender.add(new BABYLON.Vector3(0.88, 2.32, 0.36));
    const receiverLockPosition = positions.receiver.add(new BABYLON.Vector3(-0.88, 2.32, 0.36));
    const receiverLeakPosition = positions.receiver.add(new BABYLON.Vector3(-0.45, 0.22, 0.44));
    const backupVaultPosition = positions.vault.add(new BABYLON.Vector3(0, 1.08, 0.5));

    const senderOut = positions.sender.add(new BABYLON.Vector3(2.6, 0.05, 0.42));
    const encryptIn = positions.encrypt.add(new BABYLON.Vector3(-2.45, 0.05, 0.42));
    const encryptOut = positions.encrypt.add(new BABYLON.Vector3(2.45, 0.05, 0.42));
    const decryptIn = positions.decrypt.add(new BABYLON.Vector3(-2.45, 0.05, 0.42));
    const decryptOut = positions.decrypt.add(new BABYLON.Vector3(2.45, 0.05, 0.42));
    const receiverIn = positions.receiver.add(new BABYLON.Vector3(-2.45, 0.05, 0.42));
    const networkLeft = positions.network.add(new BABYLON.Vector3(-2.2, 0.05, 0.42));
    const networkRight = positions.network.add(new BABYLON.Vector3(2.2, 0.05, 0.42));
    const networkCenter = positions.network.add(new BABYLON.Vector3(0, 0.05, 0.42));

    const senderToEncryptRail = createPathMesh("symmetricSenderToEncryptRail", [senderOut, encryptIn], 0.08, palette.plaintext);
    const openNetworkRail = createPathMesh("symmetricOpenNetworkRail", [senderOut, networkCenter, receiverIn], 0.08, palette.plaintext);
    const cipherRail = createPathMesh("symmetricCipherRail", [encryptOut, networkLeft, networkRight, decryptIn], 0.12, palette.networkBase);
    const decryptRail = createPathMesh("symmetricDecryptRail", [decryptIn, positions.decrypt, decryptOut, receiverIn], 0.08, palette.receiverBase);
    const attackerTapRail = createPathMesh("symmetricAttackerTapRail", [networkCenter, unsafeInterceptPosition], 0.08, palette.attackerBase);
    const serverTapRail = isEndToEnd
      ? createPathMesh("symmetricServerTapRail", [networkCenter, serverTapPosition], 0.08, palette.networkBase)
      : null;
    const deviceLeakRail = isEndToEnd
      ? createPathMesh("symmetricDeviceLeakRail", [receiverLeakPosition, positions.network.add(new BABYLON.Vector3(3.2, -0.4, 0.24)), unsafeInterceptPosition], 0.08, palette.attackerBase)
      : null;
    const backupRail = isEndToEnd
      ? createPathMesh("symmetricBackupRail", [receiverIn, positions.network.add(new BABYLON.Vector3(4.4, -0.72, 0.28)), backupVaultPosition], 0.08, palette.vaultBase)
      : null;
    const keyBridgeLeft = createPathMesh("symmetricKeyBridgeLeft", isAsymmetric
      ? [
          keyHubPosition,
          positions.receiver.add(new BABYLON.Vector3(-3.2, 3.7, 0.08)),
          positions.network.add(new BABYLON.Vector3(0, 4.25, 0.08)),
          positions.encrypt.add(new BABYLON.Vector3(0.8, 3.15, 0.08)),
          leftKeyPosition
        ]
      : [
          keyHubPosition,
          positions.sender.add(new BABYLON.Vector3(4.2, 3.2, 0.08)),
          leftKeyPosition
        ], 0.05, isAsymmetric ? palette.safePath : palette.keyBase);
    const keyBridgeRight = createPathMesh("symmetricKeyBridgeRight", (isAsymmetric || isHybrid)
      ? [
          vaultKeyPosition,
          positions.decrypt.add(new BABYLON.Vector3(1.4, 0.25, 0.08)),
          positions.decrypt.add(new BABYLON.Vector3(1.0, 1.55, 0.08)),
          rightKeyPosition
        ]
      : [
          keyHubPosition,
          positions.sender.add(new BABYLON.Vector3(5.2, 3.95, 0.08)),
          positions.network.add(new BABYLON.Vector3(0, 4.25, 0.08)),
          positions.decrypt.add(new BABYLON.Vector3(0.7, 3.15, 0.08)),
          rightKeyPosition
        ], 0.05, palette.keyBase);
    const safeExchangeRail = createPathMesh("symmetricSafeExchangeRail", isAsymmetric
      ? [
          keyHubPosition,
          positions.network.add(new BABYLON.Vector3(0, 5.0, 0)),
          positions.sender.add(new BABYLON.Vector3(0, 4.0, 0))
        ]
      : (isHybrid
        ? [
            positions.receiver.add(new BABYLON.Vector3(0, 4.0, 0)),
            positions.network.add(new BABYLON.Vector3(0, 5.0, 0)),
            positions.sender.add(new BABYLON.Vector3(0, 4.0, 0))
          ]
      : [
          positions.sender.add(new BABYLON.Vector3(0, -0.35, 0)),
          positions.network.add(new BABYLON.Vector3(0, 5.0, 0)),
          positions.receiver.add(new BABYLON.Vector3(0, -0.35, 0))
        ]), 0.08, palette.safePath);
    const unsafeExchangeRail = createPathMesh("symmetricUnsafeExchangeRail", isAsymmetric
      ? [
          vaultKeyPosition,
          positions.network.add(new BABYLON.Vector3(5.2, -0.2, 0.1)),
          positions.network.add(new BABYLON.Vector3(0, -1.2, 0)),
          positions.sender.add(new BABYLON.Vector3(0, -1.2, 0))
        ]
      : [
          positions.sender.add(new BABYLON.Vector3(0, -1.2, 0)),
          positions.network.add(new BABYLON.Vector3(0, -1.2, 0)),
          positions.receiver.add(new BABYLON.Vector3(0, -1.2, 0))
        ], 0.08, palette.unsafePath);
    const stolenKeyRail = createPathMesh("symmetricStolenKeyRail", isAsymmetric
      ? [
          vaultKeyPosition,
          positions.network.add(new BABYLON.Vector3(5.0, 0.1, 0.1)),
          unsafeInterceptPosition.add(new BABYLON.Vector3(2.2, 0.25, 0))
        ]
      : [
          vaultKeyPosition,
          positions.network.add(new BABYLON.Vector3(5.4, -0.3, 0.1)),
          unsafeInterceptPosition.add(new BABYLON.Vector3(2.2, 0.25, 0))
        ], 0.08, palette.attackerBase);

    const plainToken = createToken("symmetricPlainToken", plainText, {
      variant: "document",
      width: 2.2,
      height: 0.5,
      depth: 0.3,
      labelWidth: 3.2,
      color: palette.plaintext,
      fontSize: 48
    });
    const cipherToken = createToken("symmetricCipherToken", cipherShort, {
      variant: "data",
      width: 1.9,
      height: 0.5,
      depth: 0.3,
      labelWidth: 2.8,
      color: palette.ciphertext,
      fontSize: 48
    });
    const keyHubToken = createToken("symmetricKeyHubToken", keyHubTokenText, {
      variant: "key",
      width: 1.2,
      height: 0.42,
      depth: 0.26,
      labelWidth: 1.8,
      color: palette.keyBase
    });
    const leftKeyToken = createToken("symmetricLeftKeyToken", leftKeyTokenText, {
      variant: "key",
      width: 1.2,
      height: 0.42,
      depth: 0.26,
      labelWidth: 1.8,
      color: (isAsymmetric || isHybrid) ? palette.safePath : palette.keyBase
    });
    const rightKeyToken = createToken("symmetricRightKeyToken", rightKeyTokenText, {
      variant: "key",
      width: 1.2,
      height: 0.42,
      depth: 0.26,
      labelWidth: 1.8,
      color: palette.keyBase
    });
    const keyPulseToken = createToken("symmetricKeyPulseToken", pulseKeyTokenText, {
      variant: "key",
      width: 1.1,
      height: 0.38,
      depth: 0.24,
      labelWidth: 1.6,
      color: isAsymmetric ? palette.safePath : palette.keyBase,
      fontSize: 52
    });
    const wrongKeyToken = createToken("symmetricWrongKeyToken", wrongKeyTokenText, {
      variant: "key",
      width: 1.25,
      height: 0.42,
      depth: 0.24,
      labelWidth: 1.9,
      color: palette.attackerBase
    });
    const safeKeyToken = createToken("symmetricSafeKeyToken", safeKeyTokenText, {
      variant: "key",
      width: 1.15,
      height: 0.42,
      depth: 0.26,
      labelWidth: 1.8,
      color: palette.safePath
    });
    const unsafeKeyToken = createToken("symmetricUnsafeKeyToken", unsafeKeyTokenText, {
      variant: "key",
      width: 1.15,
      height: 0.42,
      depth: 0.26,
      labelWidth: 1.8,
      color: palette.unsafePath
    });
    const stolenKeyToken = createToken("symmetricStolenKeyToken", stolenKeyTokenText, {
      variant: "key",
      width: 1.15,
      height: 0.42,
      depth: 0.26,
      labelWidth: 1.8,
      color: palette.attackerBase
    });
    const attackerCipherToken = createToken("symmetricAttackerCipherToken", cipherShort, {
      variant: "data",
      width: 1.9,
      height: 0.5,
      depth: 0.3,
      labelWidth: 2.8,
      color: palette.ciphertext,
      fontSize: 48
    });
    const senderLockToken = isEndToEnd ? createToken("symmetricSenderLockToken", "E2E", {
      variant: "lock",
      width: 1.08,
      height: 0.42,
      depth: 0.24,
      labelWidth: 1.7,
      color: palette.keyBase,
      fontSize: 42
    }) : null;
    const receiverLockToken = isEndToEnd ? createToken("symmetricReceiverLockToken", "E2E", {
      variant: "lock",
      width: 1.08,
      height: 0.42,
      depth: 0.24,
      labelWidth: 1.7,
      color: palette.keyBase,
      fontSize: 42
    }) : null;
    const serverCipherToken = isEndToEnd ? createToken("symmetricServerCipherToken", cipherShort, {
      variant: "data",
      width: 1.82,
      height: 0.5,
      depth: 0.28,
      labelWidth: 2.6,
      color: palette.ciphertext,
      fontSize: 44
    }) : null;
    const malwareToken = isEndToEnd ? createToken("symmetricMalwareToken", "MAL", {
      variant: "data",
      width: 1.35,
      height: 0.42,
      depth: 0.24,
      labelWidth: 1.8,
      color: palette.attackerBase,
      fontSize: 42
    }) : null;
    const backupToken = isEndToEnd ? createToken("symmetricBackupToken", "Backup", {
      variant: "document",
      width: 1.5,
      height: 0.46,
      depth: 0.26,
      labelWidth: 2.1,
      color: palette.vaultBase,
      fontSize: 40
    }) : null;

    keyHubToken.root.position.copyFrom(keyHubPosition);
    leftKeyToken.root.position.copyFrom(leftKeyPosition);
    rightKeyToken.root.position.copyFrom(rightKeyPosition);
    if (senderLockToken) senderLockToken.root.position.copyFrom(senderLockPosition);
    if (receiverLockToken) receiverLockToken.root.position.copyFrom(receiverLockPosition);

    function setBoardState(board, text, alpha, options = null) {
      updateLabelText(board, text, options);
      board.setAlpha(alpha);
    }

    function applyBaseVisualState() {
      setPanelState(senderPanel, 0.18, palette.senderBase, { forceVisible: true });
      setPanelState(encryptPanel, 0.02, palette.cryptoBase, { forceVisible: false });
      setPanelState(decryptPanel, 0.02, palette.cryptoBase, { forceVisible: false });
      setPanelState(receiverPanel, 0.18, palette.receiverBase, { forceVisible: true });
      setPanelState(
        attackerPanel,
        (isHybrid || isEndToEnd) ? 0.02 : 0.14,
        palette.attackerBase,
        { forceVisible: !isHybrid && !isEndToEnd }
      );
      setPanelState(vaultPanel, 0.02, palette.vaultBase, { forceVisible: false });
      if (serverPanel) {
        setPanelState(serverPanel, 0.12, palette.networkBase, { forceVisible: true });
      }
      setNetworkClusterState(networkCluster, 0.48, palette.networkBase);
      setPathState(senderToEncryptRail, 0, palette.plaintext);
      setPathState(openNetworkRail, 0.06, palette.plaintext);
      setPathState(cipherRail, 0, palette.networkBase);
      setPathState(decryptRail, 0, palette.receiverBase);
      setPathState(attackerTapRail, 0.04, palette.attackerBase);
      if (serverTapRail) setPathState(serverTapRail, 0, palette.networkBase);
      if (deviceLeakRail) setPathState(deviceLeakRail, 0, palette.attackerBase);
      if (backupRail) setPathState(backupRail, 0, palette.vaultBase);
      setPathState(keyBridgeLeft, 0, palette.keyBase);
      setPathState(keyBridgeRight, 0, palette.keyBase);
      setPathState(safeExchangeRail, 0, palette.safePath);
      setPathState(unsafeExchangeRail, 0, palette.unsafePath);
      setPathState(stolenKeyRail, 0, palette.attackerBase);
      networkLabel.setAlpha(0.46);
      plainFlowLabel.setAlpha(0.42);
      cipherFlowLabel.setAlpha(0.42);
      sharedKeyLabel.setAlpha(0);
      schemaBoard.setAlpha(0);
      quoteBoard.setAlpha(0);
      algorithmBoard.setAlpha(0);
      updateLabelText(senderPanel.titleLabel, senderTitle);
      updateLabelText(receiverPanel.titleLabel, receiverTitle);
      updateLabelText(attackerPanel.titleLabel, "Angreifer");
      updateLabelText(vaultPanel.titleLabel, isEndToEnd ? "Cloud-Backup" : ((isAsymmetric || isHybrid) ? "Privater Schluessel" : "Schluesseltresor"));
      if (serverPanel) {
        updateLabelText(serverPanel.titleLabel, serverTitle);
      }
      updateLabelText(networkLabel, isEndToEnd ? "Server / Internet / Netz" : "Unsicheres Netz");
      updateLabelText(senderPanel.contentLabel, plainText);
      updateLabelText(receiverPanel.contentLabel, isEndToEnd ? "Noch kein Klartext" : "Wartet auf Geheimtext");
      updateLabelText(attackerPanel.contentLabel, "Beobachtet den Transport");
      updateLabelText(vaultPanel.contentLabel, vaultDefaultText);
      if (serverPanel) {
        updateLabelText(serverPanel.contentLabel, transportOnlyText);
      }
      updateLabelText(sharedKeyLabel, sharedKeyBannerText);
      updateLabelText(encryptPanel.contentLabel, encryptDefaultText);
      updateLabelText(decryptPanel.contentLabel, decryptDefaultText);
      updateLabelText(vaultPanel.contentLabel, vaultDefaultText);
      setTokenState(plainToken, { visible: false });
      setTokenState(cipherToken, { visible: false });
      setTokenState(keyHubToken, { visible: false });
      setTokenState(leftKeyToken, { visible: false });
      setTokenState(rightKeyToken, { visible: false });
      setTokenState(keyPulseToken, { visible: false });
      setTokenState(wrongKeyToken, { visible: false });
      setTokenState(safeKeyToken, { visible: false });
      setTokenState(unsafeKeyToken, { visible: false });
      setTokenState(stolenKeyToken, { visible: false });
      setTokenState(attackerCipherToken, { visible: false });
      if (senderLockToken) setTokenState(senderLockToken, { visible: false });
      if (receiverLockToken) setTokenState(receiverLockToken, { visible: false });
      if (serverCipherToken) setTokenState(serverCipherToken, { visible: false });
      if (malwareToken) setTokenState(malwareToken, { visible: false });
      if (backupToken) setTokenState(backupToken, { visible: false });
    }

    function updateEndToEndVisualState(activeCueId, safeElapsed) {
      if (activeCueId === "cue_problem") {
        const progress = cueProgress("cue_problem", safeElapsed);
        const rewindPhase = progress >= 0.42 && progress < 0.64;
        const securePhase = progress >= 0.64;
        setPanelState(senderPanel, 0.96, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.84, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, securePhase ? 0.78 : 0.02, palette.cryptoBase, { forceVisible: securePhase });
        setPanelState(decryptPanel, securePhase ? 0.78 : 0.02, palette.cryptoBase, { forceVisible: securePhase });
        setPanelState(attackerPanel, securePhase ? 0.48 : 0.82, securePhase ? palette.networkBase : palette.attackerBase, { forceVisible: true });
        updateLabelText(attackerPanel.titleLabel, "Zwischenstationen");
        if (serverPanel) {
          setPanelState(serverPanel, securePhase ? 0.58 : 0.92, securePhase ? palette.networkBase : palette.plaintext, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, securePhase ? serverTitle : "Zwischenstation");
          updateLabelText(serverPanel.contentLabel, securePhase ? cipherShort : plainText);
        }
        setNetworkClusterState(networkCluster, securePhase ? 0.82 : 0.72, securePhase ? palette.networkBase : palette.plaintext);
        plainFlowLabel.setAlpha(securePhase ? 0.14 : 0.9);
        cipherFlowLabel.setAlpha(securePhase ? 0.86 : 0);
        sharedKeyLabel.setAlpha(securePhase ? 0.82 : 0);
        updateLabelText(networkLabel, securePhase ? "Schutz direkt an den Enden" : "Offene Uebertragung");
        updateLabelText(attackerPanel.contentLabel, securePhase ? "sehen nur Geheimtext" : "lesen Klartext mit");
        setPathState(senderToEncryptRail, securePhase ? 0.46 : 0, palette.plaintext);
        setPathState(openNetworkRail, securePhase ? 0.08 : 0.84, palette.plaintext);
        setPathState(cipherRail, securePhase ? 0.72 : 0, palette.networkBase);
        setPathState(decryptRail, 0, palette.receiverBase);
        setPathState(attackerTapRail, securePhase ? 0.32 : 0.62, securePhase ? palette.subtle : palette.attackerBase);
        if (serverTapRail) {
          setPathState(serverTapRail, securePhase ? 0.42 : 0.7, securePhase ? palette.networkBase : palette.plaintext);
        }
        if (senderLockToken) {
          setTokenState(senderLockToken, {
            visible: securePhase,
            position: senderLockPosition,
            alpha: securePhase ? 0.92 : 0,
            color: palette.keyBase
          });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, {
            visible: securePhase,
            position: receiverLockPosition,
            alpha: securePhase ? 0.92 : 0,
            color: palette.keyBase
          });
        }
        if (!securePhase) {
          const pathProgress = rewindPhase
            ? 1 - ((progress - 0.42) / 0.22)
            : (progress / 0.42);
          setTokenState(plainToken, {
            visible: true,
            position: openNetworkRail.sampler.sample(pathProgress),
            alpha: 0.98,
            color: palette.plaintext,
            text: plainText
          });
        } else {
          const cipherProgress = clamp((progress - 0.68) / 0.24, 0, 1);
          setTokenState(cipherToken, {
            visible: true,
            position: cipherRail.sampler.sample(cipherProgress),
            alpha: 0.96,
            color: palette.ciphertext,
            text: cipherShort
          });
          if (serverCipherToken && serverTapRail) {
            setTokenState(serverCipherToken, {
              visible: true,
              position: serverTapRail.sampler.sample(0.36 + (cipherProgress * 0.2)),
              alpha: 0.92,
              color: palette.ciphertext,
              text: cipherShort
            });
          }
        }
      } else if (activeCueId === "cue_end_to_end_idea") {
        const progress = cueProgress("cue_end_to_end_idea", safeElapsed);
        setPanelState(senderPanel, 0.56, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.56, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.98, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.98, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        if (serverPanel) {
          setPanelState(serverPanel, 0.42, palette.networkBase, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, serverTitle);
          updateLabelText(serverPanel.contentLabel, transportOnlyText);
        }
        setNetworkClusterState(networkCluster, 0.62, palette.subtle);
        plainFlowLabel.setAlpha(0.52);
        cipherFlowLabel.setAlpha(0.82);
        sharedKeyLabel.setAlpha(0.96);
        setBoardState(schemaBoard, principleText, 0.94);
        updateLabelText(networkLabel, "Mitte = Transport");
        if (senderLockToken) {
          setTokenState(senderLockToken, { visible: true, position: senderLockPosition, alpha: 0.96, color: palette.keyBase });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, { visible: true, position: receiverLockPosition, alpha: 0.96, color: palette.keyBase });
        }
        setPathState(senderToEncryptRail, 0.44, palette.plaintext);
        setPathState(cipherRail, 0.82, palette.networkBase);
        setPathState(decryptRail, 0.44, palette.receiverBase);
        setPathState(attackerTapRail, 0.04, palette.subtle);
        if (serverTapRail) setPathState(serverTapRail, 0.28, palette.subtle);
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(progress),
          alpha: 0.96,
          color: palette.ciphertext,
          text: cipherShort
        });
      } else if (activeCueId === "cue_server_metadata") {
        const progress = cueProgress("cue_server_metadata", safeElapsed);
        setPanelState(senderPanel, 0.36, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.36, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.52, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.52, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        if (serverPanel) {
          setPanelState(serverPanel, 1, palette.networkBase, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, metadataTitle);
          updateLabelText(serverPanel.contentLabel, metadataBoardText);
        }
        setNetworkClusterState(networkCluster, 0.86, palette.networkBase);
        sharedKeyLabel.setAlpha(0.62);
        cipherFlowLabel.setAlpha(0.82);
        setBoardState(algorithmBoard, "Metadaten sind sichtbar\nInhalt bleibt Geheimtext", 0.88);
        updateLabelText(networkLabel, "Metadaten bleiben sichtbar");
        if (senderLockToken) {
          setTokenState(senderLockToken, { visible: true, position: senderLockPosition, alpha: 0.92, color: palette.keyBase });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, { visible: true, position: receiverLockPosition, alpha: 0.92, color: palette.keyBase });
        }
        setPathState(cipherRail, 0.7, palette.networkBase);
        setPathState(attackerTapRail, 0.04, palette.subtle);
        if (serverTapRail) setPathState(serverTapRail, 0.74, palette.networkBase);
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(0.22 + (progress * 0.56)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: cipherShort
        });
        if (serverCipherToken) {
          setTokenState(serverCipherToken, {
            visible: true,
            position: serverTapPosition,
            alpha: 0.96,
            color: palette.ciphertext,
            text: cipherShort
          });
        }
      } else if (activeCueId === "cue_practical_flow") {
        const progress = cueProgress("cue_practical_flow", safeElapsed);
        setPanelState(senderPanel, 0.88, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.88, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        if (serverPanel) {
          setPanelState(serverPanel, 0.54, palette.networkBase, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, serverTitle);
          updateLabelText(serverPanel.contentLabel, `Sieht nur:\n${cipherShort}`);
        }
        setNetworkClusterState(networkCluster, 0.82, palette.networkBase);
        plainFlowLabel.setAlpha(0.8);
        cipherFlowLabel.setAlpha(0.88);
        sharedKeyLabel.setAlpha(0.88);
        updateLabelText(networkLabel, "Klartext bleibt auf Annas Geraet");
        updateLabelText(receiverPanel.contentLabel, progress >= 0.72 ? plainText : "Entschluesselt erst am Ende");
        if (senderLockToken) {
          setTokenState(senderLockToken, { visible: true, position: senderLockPosition, alpha: 0.96, color: palette.keyBase });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, { visible: true, position: receiverLockPosition, alpha: 0.96, color: palette.keyBase });
        }
        setPathState(senderToEncryptRail, 0.82, palette.plaintext);
        setPathState(cipherRail, 0.88, palette.networkBase);
        setPathState(decryptRail, 0.76, palette.receiverBase);
        setPathState(attackerTapRail, 0.04, palette.subtle);
        if (serverTapRail) setPathState(serverTapRail, 0.36, palette.subtle);
        if (progress <= 0.28) {
          setTokenState(plainToken, {
            visible: true,
            position: senderToEncryptRail.sampler.sample(progress / 0.28),
            alpha: 0.98,
            color: palette.plaintext,
            text: plainText
          });
        } else if (progress <= 0.72) {
          setTokenState(cipherToken, {
            visible: true,
            position: cipherRail.sampler.sample((progress - 0.28) / 0.44),
            alpha: 0.96,
            color: palette.ciphertext,
            text: cipherShort
          });
        } else {
          setTokenState(plainToken, {
            visible: true,
            position: decryptRail.sampler.sample(clamp((progress - 0.72) / 0.28, 0, 1)),
            alpha: 0.98,
            color: palette.plaintext,
            text: plainText
          });
        }
      } else if (activeCueId === "cue_middle_attack") {
        const progress = cueProgress("cue_middle_attack", safeElapsed);
        setPanelState(senderPanel, 0.52, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.52, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.66, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.66, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.96, palette.attackerBase, { forceVisible: true });
        updateLabelText(attackerPanel.titleLabel, "Admin / Angreifer");
        updateLabelText(attackerPanel.contentLabel, `Nur Geheimtext:\n${cipherShort}`);
        if (serverPanel) {
          setPanelState(serverPanel, 0.92, palette.attackerBase, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, "Kompromittierter Server");
          updateLabelText(serverPanel.contentLabel, `Sieht nur:\n${cipherShort}`);
        }
        setNetworkClusterState(networkCluster, 0.86, palette.attackerBase);
        sharedKeyLabel.setAlpha(0.88);
        cipherFlowLabel.setAlpha(0.94);
        setBoardState(algorithmBoard, "Mitte kompromittiert\nInhalt bleibt unlesbar", 0.86);
        updateLabelText(networkLabel, "Mitte angegriffen");
        if (senderLockToken) {
          setTokenState(senderLockToken, { visible: true, position: senderLockPosition, alpha: 0.94, color: palette.keyBase });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, { visible: true, position: receiverLockPosition, alpha: 0.94, color: palette.keyBase });
        }
        setPathState(cipherRail, 0.86, palette.networkBase);
        setPathState(attackerTapRail, 0.86, palette.attackerBase);
        if (serverTapRail) setPathState(serverTapRail, 0.78, palette.attackerBase);
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(0.1 + (progress * 0.7)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: cipherShort
        });
        setTokenState(attackerCipherToken, {
          visible: true,
          position: attackerTapRail.sampler.sample(0.32 + (progress * 0.42)),
          alpha: 0.94,
          color: palette.ciphertext,
          text: cipherShort
        });
        if (serverCipherToken) {
          setTokenState(serverCipherToken, {
            visible: true,
            position: serverTapPosition,
            alpha: 0.96,
            color: palette.ciphertext,
            text: cipherShort
          });
        }
      } else if (activeCueId === "cue_endpoint_limit") {
        const progress = cueProgress("cue_endpoint_limit", safeElapsed);
        setPanelState(senderPanel, 0.58, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.94, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.44, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.52, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.9, palette.attackerBase, { forceVisible: true });
        updateLabelText(attackerPanel.titleLabel, "Schadsoftware / Zugriff");
        updateLabelText(attackerPanel.contentLabel, progress > 0.54 ? plainText : "liest direkt am Endgeraet mit");
        if (serverPanel) {
          setPanelState(serverPanel, 0.22, palette.networkBase, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, serverTitle);
          updateLabelText(serverPanel.contentLabel, transportOnlyText);
        }
        setPanelState(vaultPanel, 0.96, palette.vaultBase, { forceVisible: true });
        updateLabelText(vaultPanel.titleLabel, "Cloud-Backup");
        updateLabelText(vaultPanel.contentLabel, "Wenn ungeschuetzt,\nliegt Klartext ausserhalb E2E");
        setNetworkClusterState(networkCluster, 0.62, palette.safePath);
        sharedKeyLabel.setAlpha(0.82);
        cipherFlowLabel.setAlpha(0.62);
        setBoardState(algorithmBoard, limitBoardText, 0.94);
        updateLabelText(networkLabel, "Uebertragung geschuetzt, Ende bleibt Risiko");
        if (senderLockToken) {
          setTokenState(senderLockToken, { visible: true, position: senderLockPosition, alpha: 0.9, color: palette.keyBase });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, { visible: true, position: receiverLockPosition, alpha: 0.9, color: palette.keyBase });
        }
        setPathState(cipherRail, 0.64, palette.networkBase);
        if (deviceLeakRail) setPathState(deviceLeakRail, 0.84, palette.attackerBase);
        if (backupRail) setPathState(backupRail, 0.78, palette.vaultBase);
        if (malwareToken) {
          setTokenState(malwareToken, {
            visible: true,
            position: receiverLeakPosition,
            alpha: 0.94,
            color: palette.attackerBase,
            text: "MAL"
          });
        }
        setTokenState(attackerCipherToken, {
          visible: true,
          position: unsafeInterceptPosition.add(new BABYLON.Vector3(1.8, 0.2, 0)),
          alpha: 0.94,
          color: progress > 0.54 ? palette.plaintext : palette.ciphertext,
          text: progress > 0.54 ? plainText : cipherShort
        });
        if (backupToken && backupRail) {
          setTokenState(backupToken, {
            visible: true,
            position: backupRail.sampler.sample(clamp((progress - 0.28) / 0.52, 0, 1)),
            alpha: 0.94,
            color: palette.vaultBase,
            text: "Backup"
          });
        }
      } else if (activeCueId === "cue_finale") {
        const progress = cueProgress("cue_finale", safeElapsed);
        setPanelState(senderPanel, 0.68, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.68, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.78, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.78, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.18, palette.attackerBase, { forceVisible: true });
        updateLabelText(attackerPanel.titleLabel, "Mitte");
        updateLabelText(attackerPanel.contentLabel, cipherShort);
        if (serverPanel) {
          setPanelState(serverPanel, 0.32, palette.networkBase, { forceVisible: true });
          updateLabelText(serverPanel.titleLabel, serverTitle);
          updateLabelText(serverPanel.contentLabel, "nur Weiterleitung");
        }
        setPanelState(vaultPanel, 0.18, palette.vaultBase, { forceVisible: true });
        updateLabelText(vaultPanel.titleLabel, "Randrisiko");
        updateLabelText(vaultPanel.contentLabel, "Endgeraet / Backup");
        setNetworkClusterState(networkCluster, 0.84, palette.networkBase);
        plainFlowLabel.setAlpha(0.72);
        cipherFlowLabel.setAlpha(0.9);
        sharedKeyLabel.setAlpha(0.9);
        updateLabelText(networkLabel, "In der Mitte nur Geheimtext");
        if (senderLockToken) {
          setTokenState(senderLockToken, { visible: true, position: senderLockPosition, alpha: 0.96, color: palette.keyBase });
        }
        if (receiverLockToken) {
          setTokenState(receiverLockToken, { visible: true, position: receiverLockPosition, alpha: 0.96, color: palette.keyBase });
        }
        setPathState(senderToEncryptRail, 0.44, palette.plaintext);
        setPathState(cipherRail, 0.82, palette.networkBase);
        setPathState(decryptRail, 0.52, palette.receiverBase);
        setBoardState(schemaBoard, finaleSchemaText, 0.84);
        setBoardState(quoteBoard, finalQuote, clamp((progress - 0.18) / 0.46, 0, 1));
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(0.18 + (progress * 0.62)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: cipherShort
        });
      }
    }

    function updateHybridVisualState(activeCueId, safeElapsed) {
      if (activeCueId === "cue_problem") {
        const progress = cueProgress("cue_problem", safeElapsed);
        const comparePhase = clamp(progress / 0.34, 0, 1);
        const tradeoffPhase = clamp((progress - 0.28) / 0.3, 0, 1);
        const publicKeyTravelPhase = clamp((progress - 0.18) / 0.34, 0, 1);
        const mergePhase = clamp((progress - 0.64) / 0.24, 0, 1);
        const hybridDataPhase = clamp((progress - 0.74) / 0.16, 0, 1);
        setPanelState(senderPanel, 0.84 + (comparePhase * 0.1), palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.82 + (tradeoffPhase * 0.1), palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.92, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.9, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.74 + (mergePhase * 0.14), palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.54 + (mergePhase * 0.18), palette.networkBase);
        plainFlowLabel.setAlpha(0.92);
        cipherFlowLabel.setAlpha(0.86);
        sharedKeyLabel.setAlpha(0.28 + (mergePhase * 0.64));
        updateLabelText(networkLabel, mergePhase > 0.1 ? "Hybrid verbindet beide Staerken" : "Tempo links, Austausch rechts");
        updateLabelText(plainFlowLabel, tradeoffPhase > 0.2 ? "links: grosse Daten schnell" : "symmetrisch = Tempo");
        updateLabelText(cipherFlowLabel, tradeoffPhase > 0.16 ? "Schluesselaustausch" : "asymmetrisch = Austausch");
        updateLabelText(sharedKeyLabel, mergePhase > 0.08 ? hybridConceptText : "Noch zwei getrennte Aufgaben");
        updateLabelText(senderPanel.titleLabel, "Symmetrisch");
        updateLabelText(senderPanel.contentLabel, comparePhase > 0.42 ? "staerkste Seite:\nTempo fuer Masse" : "viel Daten schnell");
        updateLabelText(encryptPanel.titleLabel, "Blitz");
        updateLabelText(encryptPanel.contentLabel, "Payload wird schnell\nzu Geheimtext");
        updateLabelText(receiverPanel.titleLabel, "Asymmetrisch");
        updateLabelText(receiverPanel.contentLabel, tradeoffPhase > 0.34 ? "staerkste Seite:\nSchluesselaustausch" : "loest den Austausch");
        updateLabelText(decryptPanel.titleLabel, "Schluesselpaar");
        updateLabelText(decryptPanel.contentLabel, "PUB darf raus,\nPRIV bleibt lokal");
        updateLabelText(vaultPanel.titleLabel, "Privater Schluessel");
        updateLabelText(vaultPanel.contentLabel, mergePhase > 0.16 ? "bleibt auch im Hybrid lokal" : "bleibt lokal");
        setBoardState(schemaBoard, [
          "Symmetrisch = schnell fuer grosse Datenmengen.",
          "Asymmetrisch = sicherer beim Schluesselaustausch.",
          "Keines von beiden loest allein alles optimal.",
          "Die Praxis kombiniert deshalb beide Verfahren."
        ].join("\n"), 0.74 + (mergePhase * 0.14));
        setBoardState(algorithmBoard, mergePhase > 0.14
          ? "Hybrid: kleiner Schluessel,\ndanach grosse Daten"
          : "Links: Datenstrom\nRechts: Schluesselweg", 0.76 + (mergePhase * 0.14));
        setPathState(senderToEncryptRail, 0.38 + (comparePhase * 0.18), palette.plaintext);
        setPathState(cipherRail, hybridDataPhase * 0.3, palette.networkBase);
        setPathState(safeExchangeRail, 0.18 + (publicKeyTravelPhase * 0.38), palette.safePath);
        setTokenState(plainToken, {
          visible: true,
          position: senderToEncryptRail.sampler.sample(0.14 + (comparePhase * 0.2)),
          alpha: 0.96,
          color: palette.plaintext,
          text: payloadText,
          scale: 1.12
        });
        setTokenState(rightKeyToken, {
          visible: true,
          position: vaultKeyPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: privateKeyText
        });
        if (publicKeyTravelPhase < 0.94) {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(publicKeyTravelPhase),
            alpha: 0.98,
            color: palette.safePath,
            text: publicKeyText
          });
        } else {
          setTokenState(leftKeyToken, {
            visible: true,
            position: leftKeyPosition,
            alpha: 0.94,
            color: palette.safePath,
            text: publicKeyText
          });
        }
        if (mergePhase > 0.08) {
          setTokenState(keyHubToken, {
            visible: true,
            position: keyHubPosition,
            alpha: 0.22 + (mergePhase * 0.74),
            color: palette.keyBase,
            text: sessionKeyText,
            scale: 0.92 + (mergePhase * 0.1)
          });
        }
        if (hybridDataPhase > 0.08) {
          setTokenState(cipherToken, {
            visible: true,
            position: cipherRail.sampler.sample(0.08 + (hybridDataPhase * 0.16)),
            alpha: 0.68 + (hybridDataPhase * 0.24),
            color: palette.ciphertext,
            text: payloadCipherText,
            scale: 1.18
          });
        }
      } else if (activeCueId === "cue_shared_key_principle") {
        const progress = cueProgress("cue_shared_key_principle", safeElapsed);
        const publicKeyPhase = clamp(progress / 0.24, 0, 1);
        const sessionRevealPhase = clamp((progress - 0.24) / 0.16, 0, 1);
        const wrappedSessionPhase = clamp((progress - 0.42) / 0.22, 0, 1);
        const dataPhase = clamp((progress - 0.58) / 0.24, 0, 1);
        setPanelState(senderPanel, 0.54, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.54, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.88, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.74, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.34, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.76, palette.networkBase);
        plainFlowLabel.setAlpha(0.88);
        cipherFlowLabel.setAlpha(0.84);
        sharedKeyLabel.setAlpha(0.96);
        updateLabelText(networkLabel, "Die Grundidee");
        updateLabelText(plainFlowLabel, dataPhase > 0.06 ? "unten: grosse Nutzdaten" : "unten: grosse Nutzdaten warten");
        updateLabelText(cipherFlowLabel, progress < 0.42 ? "oben: PUB und kleine Session" : "oben: geschuetzte Session");
        updateLabelText(sharedKeyLabel, "Nicht die ganze Nachricht wird asymmetrisch verschluesselt");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, progress < 0.26 ? "wartet erst auf PUB" : "erzeugt dann die Session");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, progress < 0.28 ? "stellt zuerst PUB bereit" : "PRIV bleibt lokal");
        updateLabelText(encryptPanel.titleLabel, "Asymmetrisch schuetzen");
        updateLabelText(encryptPanel.contentLabel, progress < 0.42 ? "PUB kommt an" : "Session + PUB");
        updateLabelText(decryptPanel.titleLabel, "Symmetrisch fuer die Daten");
        updateLabelText(decryptPanel.contentLabel, "Nutzdaten + Session");
        updateLabelText(vaultPanel.titleLabel, "Privater Schluessel");
        updateLabelText(vaultPanel.contentLabel, "bleibt lokal");
        setBoardState(schemaBoard, principleText, 0.92);
        setBoardState(algorithmBoard, "Klein oben, gross unten", 0.82);
        setPathState(safeExchangeRail, 0.78, palette.safePath);
        setPathState(cipherRail, 0.7, palette.networkBase);
        if (sessionRevealPhase > 0.05) {
          setTokenState(keyHubToken, {
            visible: true,
            position: keyHubPosition,
            alpha: 0.28 + (sessionRevealPhase * 0.64),
            color: palette.keyBase,
            text: sessionKeyText
          });
        }
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.24 + (publicKeyPhase * 0.66),
          color: palette.safePath,
          text: publicKeyText
        });
        if (progress < 0.42) {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(publicKeyPhase),
            alpha: 0.96,
            color: palette.safePath,
            text: publicKeyText
          });
        } else {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(1 - wrappedSessionPhase),
            alpha: 0.96,
            color: palette.safePath,
            text: wrappedSessionText
          });
        }
        if (dataPhase > 0.06) {
          setTokenState(cipherToken, {
            visible: true,
            position: cipherRail.sampler.sample(0.08 + (dataPhase * 0.34)),
            alpha: 0.96,
            color: palette.ciphertext,
            text: payloadCipherText,
            scale: 1.22
          });
        }
      } else if (activeCueId === "cue_key_security") {
        const progress = cueProgress("cue_key_security", safeElapsed);
        setPanelState(senderPanel, 0.28, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.94, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.2, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.26, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.98, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.54, palette.networkBase);
        plainFlowLabel.setAlpha(0.68);
        cipherFlowLabel.setAlpha(0.66);
        sharedKeyLabel.setAlpha(0.94);
        updateLabelText(networkLabel, "Schritt 1: Schluesselpaar beim Empfaenger");
        updateLabelText(plainFlowLabel, "PUB darf raus");
        updateLabelText(cipherFlowLabel, "PRIV bleibt lokal");
        updateLabelText(sharedKeyLabel, "Oeffentlicher Schluessel darf zum Sender. Privater bleibt lokal.");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "wartet auf PUB");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, "besitzt PUB + PRIV");
        updateLabelText(encryptPanel.titleLabel, "Asymmetrisch");
        updateLabelText(encryptPanel.contentLabel, "nimmt spaeter die Session");
        updateLabelText(decryptPanel.titleLabel, "Empfaenger");
        updateLabelText(decryptPanel.contentLabel, "haelt PRIV zurueck");
        updateLabelText(vaultPanel.titleLabel, "Privater Schluessel");
        updateLabelText(vaultPanel.contentLabel, "bleibt im Tresor");
        setBoardState(schemaBoard, [
          "Der Empfaenger besitzt ein Schluesselpaar.",
          "PUB darf zum Sender.",
          "PRIV bleibt lokal im Tresor."
        ].join("\n"), 0.86);
        setPathState(safeExchangeRail, 0.82, palette.safePath);
        setTokenState(rightKeyToken, {
          visible: true,
          position: vaultKeyPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: privateKeyText
        });
        if (progress < 0.78) {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(progress * 0.9),
            alpha: 0.98,
            color: palette.safePath,
            text: publicKeyText
          });
        } else {
          setTokenState(leftKeyToken, {
            visible: true,
            position: leftKeyPosition,
            alpha: 0.96,
            color: palette.safePath,
            text: publicKeyText
          });
        }
      } else if (activeCueId === "cue_key_exchange_weakness") {
        const progress = cueProgress("cue_key_exchange_weakness", safeElapsed);
        setPanelState(senderPanel, 0.96, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.24, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.42, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.12, palette.cryptoBase, { forceVisible: false });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.18, palette.vaultBase, { forceVisible: false });
        setNetworkClusterState(networkCluster, 0.38, palette.networkBase);
        plainFlowLabel.setAlpha(0.72);
        cipherFlowLabel.setAlpha(0.42);
        sharedKeyLabel.setAlpha(0.92);
        updateLabelText(networkLabel, "Schritt 2: Sitzungsschluessel erzeugen");
        updateLabelText(plainFlowLabel, "neu / frisch / temporaer");
        updateLabelText(cipherFlowLabel, "grosse Datei wartet");
        updateLabelText(sharedKeyLabel, "Neu, frisch und nur fuer diese Sitzung");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "erzeugt den Sitzungsschluessel");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, "wartet am Ziel");
        updateLabelText(encryptPanel.titleLabel, "Sitzungsschluessel");
        updateLabelText(encryptPanel.contentLabel, "kommt als naechstes in die Crypto-Box");
        setBoardState(schemaBoard, [
          "Der Sender erzeugt einen neuen symmetrischen Sitzungsschluessel.",
          "Er gilt nur fuer diese eine Verbindung oder Sitzung."
        ].join("\n"), 0.78);
        setBoardState(algorithmBoard, "gilt nur fuer diese Sitzung", 0.84);
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.76 + (progress * 0.22),
          color: palette.keyBase,
          text: sessionKeyText,
          scale: 0.94 + (progress * 0.12)
        });
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.78,
          color: palette.safePath,
          text: publicKeyText
        });
        setTokenState(plainToken, {
          visible: true,
          position: senderOut.add(new BABYLON.Vector3(-0.4, -0.16, 0)),
          alpha: 0.86,
          color: palette.plaintext,
          text: payloadText,
          scale: 1.14
        });
      } else if (activeCueId === "cue_sender_encrypt") {
        const progress = cueProgress("cue_sender_encrypt", safeElapsed);
        const wrapPhase = clamp((progress - 0.36) / 0.5, 0, 1);
        setPanelState(senderPanel, 0.9, palette.senderBase, { forceVisible: true });
        setPanelState(encryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.34, palette.receiverBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.2, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.34, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.66, palette.networkBase);
        plainFlowLabel.setAlpha(0.78);
        cipherFlowLabel.setAlpha(0.82);
        sharedKeyLabel.setAlpha(0.94);
        updateLabelText(networkLabel, "Schritt 3: Sitzungsschluessel asymmetrisch schuetzen");
        updateLabelText(plainFlowLabel, "grosse Datei wartet");
        updateLabelText(cipherFlowLabel, "geschuetzte Session");
        updateLabelText(sharedKeyLabel, "Nur der kleine Sitzungsschluessel wird asymmetrisch geschuetzt");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "hat Session und PUB");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, "wartet auf die geschuetzte Session");
        updateLabelText(encryptPanel.titleLabel, "Asymmetrisch schuetzen");
        updateLabelText(encryptPanel.contentLabel, "Session + PUB");
        updateLabelText(decryptPanel.titleLabel, "Noch nicht der Datenkanal");
        updateLabelText(decryptPanel.contentLabel, "zuerst nur die Session");
        updateLabelText(vaultPanel.titleLabel, "Privater Schluessel");
        updateLabelText(vaultPanel.contentLabel, "kommt erst spaeter zum Einsatz");
        setBoardState(schemaBoard, [
          "Die grosse Datei wird hier noch nicht asymmetrisch verschluesselt.",
          "Nur der kleine Sitzungsschluessel wird mit PUB geschuetzt."
        ].join("\n"), 0.86);
        setBoardState(algorithmBoard, "Nicht die ganze Datei asymmetrisch", 0.92);
        setPathState(keyBridgeLeft, 0.8, palette.keyBase);
        setPathState(safeExchangeRail, 0.8, palette.safePath);
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: sessionKeyText
        });
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.96,
          color: palette.safePath,
          text: publicKeyText
        });
        if (progress <= 0.42) {
          setTokenState(keyPulseToken, {
            visible: true,
            position: keyBridgeLeft.sampler.sample(progress / 0.42),
            alpha: 0.98,
            color: palette.keyBase,
            text: sessionKeyText
          });
        }
        if (progress >= 0.38) {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(1 - wrapPhase),
            alpha: 0.98,
            color: palette.safePath,
            text: wrappedSessionText
          });
        }
        setTokenState(plainToken, {
          visible: true,
          position: senderOut.add(new BABYLON.Vector3(-0.42, -0.16, 0)),
          alpha: 0.58,
          color: palette.plaintext,
          text: payloadText,
          scale: 1.1
        });
      } else if (activeCueId === "cue_performance_tradeoff") {
        const progress = cueProgress("cue_performance_tradeoff", safeElapsed);
        const dataPhase = clamp((progress - 0.24) / 0.62, 0, 1);
        setPanelState(senderPanel, 0.84, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.36, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.46, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.18, palette.vaultBase, { forceVisible: false });
        setNetworkClusterState(networkCluster, 0.86, palette.networkBase);
        plainFlowLabel.setAlpha(0.9);
        cipherFlowLabel.setAlpha(0.86);
        sharedKeyLabel.setAlpha(0.94);
        updateLabelText(networkLabel, "Schritt 4: Nutzdaten symmetrisch verschluesseln");
        updateLabelText(plainFlowLabel, "grosse Datenmenge");
        updateLabelText(cipherFlowLabel, "schneller Datenstrom");
        updateLabelText(sharedKeyLabel, "Jetzt kommt der schnelle Teil");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "setzt jetzt die Session fuer die Daten ein");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, "wartet auf Datenpakete");
        updateLabelText(encryptPanel.titleLabel, "Symmetrisch verschluesseln");
        updateLabelText(encryptPanel.contentLabel, "Nutzdaten + Session");
        updateLabelText(decryptPanel.titleLabel, "Spaeter symmetrisch entschluesseln");
        updateLabelText(decryptPanel.contentLabel, "erst auf der rechten Seite");
        setBoardState(schemaBoard, performanceBoardText, 0.88);
        setBoardState(algorithmBoard, "Session schuetzt jetzt die Masse", 0.88);
        setPathState(senderToEncryptRail, 0.78, palette.plaintext);
        setPathState(cipherRail, 0.9, palette.networkBase);
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.94,
          color: palette.keyBase,
          text: sessionKeyText
        });
        if (progress <= 0.36) {
          setTokenState(plainToken, {
            visible: true,
            position: senderToEncryptRail.sampler.sample(progress / 0.36),
            alpha: 0.98,
            color: palette.plaintext,
            text: payloadText,
            scale: 1.12
          });
        }
        if (progress >= 0.24) {
          setTokenState(cipherToken, {
            visible: true,
            position: cipherRail.sampler.sample(0.08 + (dataPhase * 0.66)),
            alpha: 0.98,
            color: palette.ciphertext,
            text: payloadCipherText,
            scale: 1.24
          });
        }
      } else if (activeCueId === "cue_receiver_decrypt") {
        const progress = cueProgress("cue_receiver_decrypt", safeElapsed);
        const arrivalPhase = clamp(progress / 0.42, 0, 1);
        const unlockPhase = clamp((progress - 0.24) / 0.42, 0, 1);
        setPanelState(senderPanel, 0.28, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.86, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.24, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 1, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.58, palette.networkBase);
        plainFlowLabel.setAlpha(0.84);
        cipherFlowLabel.setAlpha(0.82);
        sharedKeyLabel.setAlpha(0.94);
        updateLabelText(networkLabel, "Schritt 5: Empfaenger stellt den Schluessel wieder her");
        updateLabelText(plainFlowLabel, "geschuetzte Session trifft ein");
        updateLabelText(cipherFlowLabel, "PRIV bleibt lokal");
        updateLabelText(sharedKeyLabel, "Erst den kleinen Schluessel wieder lesbar machen");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "hat dieselbe Session noch links");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, progress > 0.58 ? "hat jetzt denselben Sitzungsschluessel" : "stellt die Session wieder her");
        updateLabelText(encryptPanel.titleLabel, "Oben lief schon die geschuetzte Session");
        updateLabelText(encryptPanel.contentLabel, "unten folgen die Daten");
        updateLabelText(decryptPanel.titleLabel, "Asymmetrisch freilegen");
        updateLabelText(decryptPanel.contentLabel, "geschuetzte Session + PRIV");
        updateLabelText(vaultPanel.titleLabel, "Privater Schluessel");
        updateLabelText(vaultPanel.contentLabel, "verlaesst das Ziel nie");
        setBoardState(schemaBoard, [
          "Zuerst kommt die geschuetzte Session am Ziel an.",
          "Dann macht nur der private Schluessel sie wieder lesbar."
        ].join("\n"), 0.84);
        setPathState(safeExchangeRail, 0.84, palette.safePath);
        setPathState(keyBridgeRight, 0.86, palette.keyBase);
        if (progress < 0.68) {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(1 - (arrivalPhase * 0.92)),
            alpha: 0.98,
            color: palette.safePath,
            text: wrappedSessionText
          });
        }
        setTokenState(rightKeyToken, {
          visible: true,
          position: vaultKeyPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: privateKeyText
        });
        if (progress >= 0.2 && progress <= 0.62) {
          setTokenState(keyPulseToken, {
            visible: true,
            position: keyBridgeRight.sampler.sample(unlockPhase),
            alpha: 0.98,
            color: palette.keyBase,
            text: privateKeyText
          });
        }
        if (progress >= 0.56) {
          setTokenState(keyHubToken, {
            visible: true,
            position: rightKeyPosition,
            alpha: 0.96,
            color: palette.keyBase,
            text: sessionKeyText
          });
        }
      } else if (activeCueId === "cue_cipher_transport") {
        const progress = cueProgress("cue_cipher_transport", safeElapsed);
        setPanelState(senderPanel, 0.18, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 1, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.2, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.96, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.46, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.74, palette.networkBase);
        plainFlowLabel.setAlpha(0.86);
        cipherFlowLabel.setAlpha(0.88);
        sharedKeyLabel.setAlpha(0.96);
        updateLabelText(networkLabel, "Schritt 6: Nutzdaten entschluesseln");
        updateLabelText(plainFlowLabel, "Geheimtext / Datenpakete");
        updateLabelText(cipherFlowLabel, "Klartext am Ziel");
        updateLabelText(sharedKeyLabel, "Sicherer Austausch plus schnelle Datenuebertragung");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "links ist die Arbeit erledigt");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, progress > 0.58 ? payloadText : "Nutzdaten werden wieder lesbar");
        updateLabelText(encryptPanel.titleLabel, "Die Session ist schon da");
        updateLabelText(encryptPanel.contentLabel, "jetzt folgen nur noch Daten");
        updateLabelText(decryptPanel.titleLabel, "Symmetrisch entschluesseln");
        updateLabelText(decryptPanel.contentLabel, "Geheimtext + Session");
        setPathState(cipherRail, 0.42, palette.networkBase);
        setPathState(decryptRail, 0.9, palette.receiverBase);
        setTokenState(keyHubToken, {
          visible: true,
          position: rightKeyPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: sessionKeyText
        });
        setTokenState(cipherToken, {
          visible: true,
          position: decryptRail.sampler.sample(progress * 0.7),
          alpha: 0.98,
          color: palette.ciphertext,
          text: payloadCipherText,
          scale: 1.24
        });
        if (progress >= 0.56) {
          setTokenState(plainToken, {
            visible: true,
            position: receiverIn.add(new BABYLON.Vector3(0.28, 0.18, 0.08)),
            alpha: 0.94,
            color: palette.plaintext,
            text: payloadText,
            scale: 1.08
          });
        }
      } else if (activeCueId === "cue_finale") {
        const progress = cueProgress("cue_finale", safeElapsed);
        setPanelState(senderPanel, 0.66, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.72, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.84, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.84, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.72, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.86, palette.networkBase);
        plainFlowLabel.setAlpha(0.92);
        cipherFlowLabel.setAlpha(0.9);
        sharedKeyLabel.setAlpha(0.96);
        updateLabelText(networkLabel, "Fazit");
        updateLabelText(plainFlowLabel, "oben: Sitzungsschluessel");
        updateLabelText(cipherFlowLabel, "unten: grosse Datenmenge");
        updateLabelText(sharedKeyLabel, "Asymmetrisch fuer den Schluessel. Symmetrisch fuer die Daten.");
        updateLabelText(senderPanel.titleLabel, senderTitle);
        updateLabelText(senderPanel.contentLabel, "PUB schuetzt die Session");
        updateLabelText(receiverPanel.titleLabel, receiverTitle);
        updateLabelText(receiverPanel.contentLabel, "Session schuetzt die Daten");
        updateLabelText(encryptPanel.titleLabel, "Praxisweg");
        updateLabelText(encryptPanel.contentLabel, "erst klein asymmetrisch");
        updateLabelText(decryptPanel.titleLabel, "Praxisweg");
        updateLabelText(decryptPanel.contentLabel, "dann schnell symmetrisch");
        updateLabelText(vaultPanel.titleLabel, "Privater Schluessel");
        updateLabelText(vaultPanel.contentLabel, "bleibt rechts am Ziel");
        setPathState(safeExchangeRail, 0.78, palette.safePath);
        setPathState(keyBridgeLeft, 0.42, palette.keyBase);
        setPathState(keyBridgeRight, 0.58, palette.keyBase);
        setPathState(cipherRail, 0.82, palette.networkBase);
        setPathState(decryptRail, 0.54, palette.receiverBase);
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.94,
          color: palette.safePath,
          text: publicKeyText
        });
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.9,
          color: palette.keyBase,
          text: sessionKeyText
        });
        setTokenState(safeKeyToken, {
          visible: true,
          position: safeExchangeRail.sampler.sample(0.36),
          alpha: 0.96,
          color: palette.safePath,
          text: wrappedSessionText
        });
        setTokenState(rightKeyToken, {
          visible: true,
          position: rightKeyPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: privateKeyText
        });
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(0.58),
          alpha: 0.98,
          color: palette.ciphertext,
          text: payloadCipherText,
          scale: 1.22
        });
        setTokenState(plainToken, {
          visible: true,
          position: receiverIn.add(new BABYLON.Vector3(0.28, 0.18, 0.08)),
          alpha: 0.9,
          color: palette.plaintext,
          text: payloadText,
          scale: 1.06
        });
        setBoardState(schemaBoard, finaleSchemaText, 0.82);
        setBoardState(quoteBoard, finalQuote, clamp((progress - 0.18) / 0.48, 0, 1));
      } else {
        setPanelState(senderPanel, 0.4, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.4, palette.receiverBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.54, palette.networkBase);
        setPathState(cipherRail, 0.22, palette.networkBase);
      }
    }

    function updateSymmetricVisualState() {
      const safeElapsed = clamp(currentElapsedMs, 0, durationMs);
      if (cameraPreviewState.active) {
        const previewProgress = clamp(
          (global.performance.now() - cameraPreviewState.startedAtMs) / Math.max(1, cameraPreviewState.durationMs),
          0,
          1
        );
        applyPoseToFreeCamera(blendPlayerCameraPose(
          cameraPreviewState.startPose,
          cameraPreviewState.endPose,
          previewProgress
        ));
        if (previewProgress >= 1) {
          clearCameraPreview();
        }
      } else if (!cameraState.userEnabled) {
        syncPlayerCameraPose(safeElapsed);
      }

      applyBaseVisualState();

      const activeCue = resolveActiveCue(cues, safeElapsed);
      const activeCueId = String(activeCue?.id || "");

      if (isEndToEnd) {
        updateEndToEndVisualState(activeCueId, safeElapsed);
      } else if (isHybrid) {
        updateHybridVisualState(activeCueId, safeElapsed);
      } else if (activeCueId === "cue_problem") {
        const progress = cueProgress("cue_problem", safeElapsed);
        if (isAsymmetric) {
          const oldProblemPhase = progress < 0.58;
          const revealPhase = clamp((progress - 0.58) / 0.32, 0, 1);
          setPanelState(senderPanel, 0.9, palette.senderBase, { forceVisible: true });
          setPanelState(receiverPanel, 0.86, palette.receiverBase, { forceVisible: true });
          setPanelState(attackerPanel, 0.86, palette.attackerBase, { forceVisible: true });
          setPanelState(encryptPanel, oldProblemPhase ? 0.02 : 0.72, palette.cryptoBase, { forceVisible: !oldProblemPhase });
          setPanelState(decryptPanel, oldProblemPhase ? 0.02 : 0.58, palette.cryptoBase, { forceVisible: !oldProblemPhase });
          setPanelState(vaultPanel, oldProblemPhase ? 0.12 : 0.86, palette.vaultBase, { forceVisible: !oldProblemPhase });
          setNetworkClusterState(networkCluster, oldProblemPhase ? 0.76 : 0.72, palette.networkBase);
          plainFlowLabel.setAlpha(oldProblemPhase ? 0.16 : 0.52);
          cipherFlowLabel.setAlpha(oldProblemPhase ? 0 : 0.18);
          sharedKeyLabel.setAlpha(oldProblemPhase ? 0.82 : 0.94);
          updateLabelText(sharedKeyLabel, oldProblemPhase ? "Problem: ein gemeinsamer geheimer Schluessel" : "Empfaenger hat zwei Schluessel: oeffentlich + privat");
          updateLabelText(networkLabel, "Unsicheres Netz");
          updateLabelText(receiverPanel.contentLabel, oldProblemPhase ? "Braucht denselben geheimen Schluessel" : "Besitzt Schluesselpaar");
          updateLabelText(attackerPanel.contentLabel, oldProblemPhase ? "kann den Schluessel abfangen" : "PUB darf sichtbar sein");
          updateLabelText(encryptPanel.contentLabel, oldProblemPhase ? "Noch kein neues Modell" : "Nimmt spaeter PUB");
          updateLabelText(decryptPanel.contentLabel, oldProblemPhase ? "Noch nicht aktiv" : "Nur PRIV passt");
          updateLabelText(vaultPanel.contentLabel, vaultDefaultText);
          setPathState(unsafeExchangeRail, oldProblemPhase ? 0.9 : 0.08, palette.unsafePath);
          setPathState(attackerTapRail, oldProblemPhase ? 0.48 : 0.16, palette.attackerBase);
          if (oldProblemPhase) {
            setTokenState(unsafeKeyToken, {
              visible: true,
              position: unsafeExchangeRail.sampler.sample(clamp(progress / 0.52, 0, 1)),
              alpha: 0.98,
              color: palette.unsafePath,
              text: "Shared KEY",
              scale: 1.06
            });
          } else {
            setTokenState(keyHubToken, {
              visible: true,
              position: keyHubPosition,
              alpha: 0.42 + (revealPhase * 0.58),
              color: palette.safePath,
              text: keyHubTokenText
            });
            setTokenState(leftKeyToken, {
              visible: true,
              position: positions.receiver.add(new BABYLON.Vector3(-0.25, 2.0, 0.18)),
              alpha: 0.24 + (revealPhase * 0.62),
              color: palette.safePath,
              text: keyHubTokenText
            });
            setTokenState(rightKeyToken, {
              visible: true,
              position: vaultKeyPosition,
              alpha: 0.36 + (revealPhase * 0.64),
              color: palette.keyBase,
              text: rightKeyTokenText
            });
            setPathState(keyBridgeLeft, 0.26 + (revealPhase * 0.36), palette.safePath);
            setPathState(keyBridgeRight, 0.18 + (revealPhase * 0.34), palette.keyBase);
          }
        } else {
          const rewindPhase = progress >= 0.42 && progress < 0.62;
          const cipherPhase = progress >= 0.62;
          setPanelState(senderPanel, 0.92, palette.senderBase, { forceVisible: true });
          setPanelState(receiverPanel, 0.78, palette.receiverBase, { forceVisible: true });
          setPanelState(attackerPanel, 0.8, palette.attackerBase, { forceVisible: true });
          setPanelState(encryptPanel, cipherPhase ? 0.84 : 0.02, palette.cryptoBase, { forceVisible: cipherPhase });
          setPanelState(decryptPanel, 0.02, palette.cryptoBase, { forceVisible: false });
          setNetworkClusterState(networkCluster, cipherPhase ? 0.86 : 0.68, cipherPhase ? palette.networkBase : palette.plaintext);
          plainFlowLabel.setAlpha(cipherPhase ? 0.18 : 0.82);
          cipherFlowLabel.setAlpha(cipherPhase ? 0.84 : 0);
          sharedKeyLabel.setAlpha(cipherPhase ? 0.78 : 0);
          setPathState(senderToEncryptRail, cipherPhase ? 0.66 : 0, palette.plaintext);
          setPathState(openNetworkRail, cipherPhase ? 0.08 : 0.78, palette.plaintext);
          setPathState(cipherRail, cipherPhase ? 0.66 : 0, palette.networkBase);
          setPathState(decryptRail, 0, palette.receiverBase);
          setPathState(attackerTapRail, 0.38, cipherPhase ? palette.subtle : palette.attackerBase);
          updateLabelText(attackerPanel.contentLabel, cipherPhase ? cipherShort : plainText);
          updateLabelText(receiverPanel.contentLabel, cipherPhase ? "Nur Geheimtext sichtbar" : plainText);
          updateLabelText(encryptPanel.contentLabel, cipherPhase ? "Vor dem Versand\nverschluesseln" : "Noch kein Schutz");
          updateLabelText(decryptPanel.contentLabel, "Noch nicht aktiv");
          if (!cipherPhase) {
            const pathProgress = rewindPhase
              ? 1 - ((progress - 0.42) / 0.20)
              : (progress / 0.42);
            setTokenState(plainToken, {
              visible: true,
              position: openNetworkRail.sampler.sample(pathProgress),
              alpha: 0.98,
              color: palette.plaintext,
              text: plainText
            });
          } else {
            const keyReveal = clamp((progress - 0.62) / 0.16, 0, 1);
            const cipherProgress = clamp((progress - 0.72) / 0.28, 0, 1);
            setTokenState(keyHubToken, {
              visible: true,
              position: keyHubPosition,
              alpha: 0.48 + (keyReveal * 0.52),
              color: palette.keyBase
            });
            setTokenState(leftKeyToken, {
              visible: true,
              position: leftKeyPosition,
              alpha: 0.4 + (keyReveal * 0.6),
              color: palette.keyBase
            });
            setTokenState(rightKeyToken, {
              visible: true,
              position: positions.receiver.add(new BABYLON.Vector3(-0.35, 2.1, 0.18)),
              alpha: 0.28 + (keyReveal * 0.72),
              color: palette.keyBase
            });
            setPathState(keyBridgeLeft, 0.36 + (keyReveal * 0.32), palette.keyBase);
            setPathState(keyBridgeRight, 0, palette.keyBase);
            updateLabelText(senderPanel.contentLabel, cipherProgress > 0.32 ? cipherShort : plainText);
            setTokenState(cipherToken, {
              visible: true,
              position: cipherRail.sampler.sample(cipherProgress),
              alpha: 0.95,
              color: palette.ciphertext,
              text: cipherShort
            });
          }
        }
      } else if (activeCueId === "cue_shared_key_principle") {
        const progress = cueProgress("cue_shared_key_principle", safeElapsed);
        const leftPhase = clamp(progress / 0.45, 0, 1);
        const rightPhase = clamp((progress - 0.45) / 0.45, 0, 1);
        setPanelState(senderPanel, 0.4, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.4, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.92, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.92, palette.cryptoBase, { forceVisible: true });
        setPanelState(vaultPanel, isAsymmetric ? 0.9 : 0.12, palette.vaultBase, { forceVisible: isAsymmetric });
        setNetworkClusterState(networkCluster, 0.62, palette.networkBase);
        plainFlowLabel.setAlpha(isAsymmetric ? 0.38 : 0.66);
        cipherFlowLabel.setAlpha(0.66);
        sharedKeyLabel.setAlpha(0.96);
        updateLabelText(sharedKeyLabel, isAsymmetric ? "Oeffentlicher Schluessel darf verteilt werden | Privater bleibt geheim" : sharedKeyBannerText);
        updateLabelText(senderPanel.contentLabel, isAsymmetric ? "Klartext" : "Klartext");
        updateLabelText(receiverPanel.contentLabel, isAsymmetric ? "gibt PUB frei" : "Klartext");
        updateLabelText(encryptPanel.contentLabel, isAsymmetric ? "Verschluesseln\nmit PUB" : "Verschluesseln");
        updateLabelText(decryptPanel.contentLabel, isAsymmetric ? "Entschluesseln\nmit PRIV" : "Entschluesseln");
        updateLabelText(vaultPanel.contentLabel, vaultDefaultText);
        updateLabelText(networkLabel, isAsymmetric ? "PUB darf durchs Netz" : "Unsicheres Netz");
        setBoardState(schemaBoard, principleText, 0.92);
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.92,
          color: isAsymmetric ? palette.safePath : palette.keyBase,
          text: keyHubTokenText
        });
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.36 + (leftPhase * 0.64),
          color: isAsymmetric ? palette.safePath : palette.keyBase,
          text: leftKeyTokenText
        });
        setTokenState(rightKeyToken, {
          visible: true,
          position: rightKeyPosition,
          alpha: 0.24 + (rightPhase * 0.76),
          color: palette.keyBase,
          text: rightKeyTokenText
        });
        setPathState(keyBridgeLeft, 0.34 + (leftPhase * 0.46), isAsymmetric ? palette.safePath : palette.keyBase);
        setPathState(keyBridgeRight, 0.2 + (rightPhase * 0.6), palette.keyBase);
        setPathState(cipherRail, 0.34, palette.networkBase);
        setPathState(safeExchangeRail, isAsymmetric ? 0.56 : 0, palette.safePath);
        if (progress < 0.5) {
          setTokenState(keyPulseToken, {
            visible: true,
            position: keyBridgeLeft.sampler.sample(clamp(progress / 0.45, 0, 1)),
            alpha: 0.96,
            color: isAsymmetric ? palette.safePath : palette.keyBase,
            text: pulseKeyTokenText
          });
        } else {
          setTokenState(keyPulseToken, {
            visible: true,
            position: keyBridgeRight.sampler.sample(clamp((progress - 0.48) / 0.36, 0, 1)),
            alpha: 0.96,
            color: palette.keyBase,
            text: isAsymmetric ? rightKeyTokenText : pulseKeyTokenText
          });
        }
      } else if (activeCueId === "cue_sender_encrypt") {
        const progress = cueProgress("cue_sender_encrypt", safeElapsed);
        setPanelState(senderPanel, 0.9, palette.senderBase, { forceVisible: true });
        setPanelState(encryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(receiverPanel, isAsymmetric ? 0.42 : 0.18, palette.receiverBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.16, palette.attackerBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.52, palette.networkBase);
        plainFlowLabel.setAlpha(0.88);
        cipherFlowLabel.setAlpha(0.28);
        sharedKeyLabel.setAlpha(0.76);
        updateLabelText(sharedKeyLabel, isAsymmetric ? "Sender verschluesselt mit dem oeffentlichen Schluessel des Empfaengers" : sharedKeyBannerText);
        updateLabelText(receiverPanel.contentLabel, isAsymmetric ? "stellt den oeffentlichen Schluessel bereit" : "Wartet auf Geheimtext");
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.76,
          color: isAsymmetric ? palette.safePath : palette.keyBase,
          text: keyHubTokenText
        });
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.92,
          color: isAsymmetric ? palette.safePath : palette.keyBase,
          text: leftKeyTokenText
        });
        setPathState(keyBridgeLeft, 0.72, isAsymmetric ? palette.safePath : palette.keyBase);
        setPathState(senderToEncryptRail, 0.82, palette.plaintext);
        setPathState(cipherRail, 0.36, palette.networkBase);
        updateLabelText(senderPanel.contentLabel, plainText);
        updateLabelText(encryptPanel.contentLabel, encryptDefaultText);
        if (progress <= 0.42) {
          setTokenState(plainToken, {
            visible: true,
            position: senderToEncryptRail.sampler.sample(clamp(progress / 0.42, 0, 1)),
            alpha: 0.98,
            color: palette.plaintext,
            text: plainText
          });
        }
        if (progress >= 0.16 && progress <= 0.58) {
          setTokenState(keyPulseToken, {
            visible: true,
            position: keyBridgeLeft.sampler.sample(clamp((progress - 0.16) / 0.28, 0, 1)),
            alpha: 0.96,
            color: isAsymmetric ? palette.safePath : palette.keyBase,
            text: pulseKeyTokenText
          });
        }
        if (progress >= 0.45) {
          const cipherProgress = clamp((progress - 0.45) / 0.42, 0, 0.42);
          setTokenState(cipherToken, {
            visible: true,
            position: cipherRail.sampler.sample(cipherProgress),
            alpha: 0.96,
            color: palette.ciphertext,
            text: cipherShort
          });
          updateLabelText(attackerPanel.contentLabel, cipherProgress > 0.18 ? cipherShort : "Noch kein lesbarer Inhalt");
        }
      } else if (activeCueId === "cue_cipher_transport") {
        const progress = cueProgress("cue_cipher_transport", safeElapsed);
        setPanelState(encryptPanel, 0.32, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.38, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.88, palette.attackerBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.96, palette.networkBase);
        plainFlowLabel.setAlpha(0.16);
        cipherFlowLabel.setAlpha(0.94);
        sharedKeyLabel.setAlpha(isAsymmetric ? 0.84 : 0.58);
        setPathState(cipherRail, 0.9, palette.networkBase);
        setPathState(attackerTapRail, 0.68, palette.attackerBase);
        updateLabelText(networkLabel, "Geheimtext im unsicheren Netz");
        updateLabelText(sharedKeyLabel, isAsymmetric ? "Der oeffentliche Schluessel allein reicht nicht zum Entschluesseln" : sharedKeyBannerText);
        updateLabelText(attackerPanel.contentLabel, isAsymmetric ? "Sieht Geheimtext\n+ kennt den oeffentlichen Schluessel" : cipherLong);
        updateLabelText(receiverPanel.contentLabel, "Sieht erst spaeter wieder Klartext");
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample((progress * 1.15) % 1),
          alpha: 0.98,
          color: palette.ciphertext,
          text: cipherShort
        });
        setTokenState(attackerCipherToken, {
          visible: true,
          position: attackerTapRail.sampler.sample(clamp((progress - 0.12) / 0.56, 0, 1)),
          alpha: 0.94,
          color: palette.ciphertext,
          text: cipherShort
        });
        if (isAsymmetric && progress >= 0.34) {
          setTokenState(wrongKeyToken, {
            visible: true,
            position: positions.attacker.add(new BABYLON.Vector3(-1.2, 1.08, 0.48)),
            alpha: 0.94,
            color: palette.safePath,
            text: keyHubTokenText
          });
        }
      } else if (activeCueId === "cue_receiver_decrypt") {
        const progress = cueProgress("cue_receiver_decrypt", safeElapsed);
        const wrongKeyPhase = progress >= 0.72 && progress <= 0.84;
        setPanelState(decryptPanel, 1, palette.cryptoBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.92, palette.receiverBase, { forceVisible: true });
        setPanelState(vaultPanel, isAsymmetric ? 0.94 : 0.02, palette.vaultBase, { forceVisible: isAsymmetric });
        setNetworkClusterState(networkCluster, 0.58, palette.networkBase);
        plainFlowLabel.setAlpha(progress > 0.52 ? 0.82 : 0.24);
        cipherFlowLabel.setAlpha(0.74);
        sharedKeyLabel.setAlpha(0.8);
        updateLabelText(sharedKeyLabel, isAsymmetric ? "Nur der private Schluessel passt zur Entschluesselung" : sharedKeyBannerText);
        setTokenState(keyHubToken, {
          visible: isAsymmetric,
          position: keyHubPosition,
          alpha: 0.52,
          color: palette.safePath,
          text: keyHubTokenText
        });
        setTokenState(rightKeyToken, {
          visible: true,
          position: rightKeyPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: rightKeyTokenText
        });
        setPathState(keyBridgeRight, 0.82, palette.keyBase);
        setPathState(cipherRail, 0.46, palette.networkBase);
        setPathState(decryptRail, 0.76, palette.receiverBase);
        updateLabelText(attackerPanel.contentLabel, cipherShort);
        updateLabelText(decryptPanel.contentLabel, decryptDefaultText);
        setTokenState(cipherToken, {
          visible: true,
          position: decryptRail.sampler.sample(clamp(progress / 0.58, 0, 1)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: cipherShort
        });
        if (progress >= 0.18 && progress <= 0.5) {
          setTokenState(keyPulseToken, {
            visible: true,
            position: keyBridgeRight.sampler.sample(clamp((progress - 0.18) / 0.24, 0, 1)),
            alpha: 0.98,
            color: palette.keyBase,
            text: isAsymmetric ? rightKeyTokenText : pulseKeyTokenText
          });
        }
        if (wrongKeyPhase) {
          updateLabelText(receiverPanel.contentLabel, wrongKeyText);
          setTokenState(wrongKeyToken, {
            visible: true,
            position: positions.decrypt.add(new BABYLON.Vector3(0, 1.1, 0.5)),
            alpha: 0.96,
            color: isAsymmetric ? palette.safePath : palette.attackerBase,
            text: isAsymmetric ? keyHubTokenText : wrongKeyTokenText
          });
        } else if (progress >= 0.5) {
          updateLabelText(receiverPanel.contentLabel, plainText);
        } else {
          updateLabelText(receiverPanel.contentLabel, "Geheimtext wird entschluesselt");
        }
      } else if (activeCueId === "cue_key_security") {
        const progress = cueProgress("cue_key_security", safeElapsed);
        if (isAsymmetric) {
          const privateWarningPhase = clamp((progress - 0.52) / 0.32, 0, 1);
          setPanelState(senderPanel, 0.52, palette.senderBase, { forceVisible: true });
          setPanelState(receiverPanel, 0.7, palette.receiverBase, { forceVisible: true });
          setPanelState(encryptPanel, 0.42, palette.cryptoBase, { forceVisible: true });
          setPanelState(decryptPanel, 0.42, palette.cryptoBase, { forceVisible: true });
          setPanelState(attackerPanel, 0.42, palette.attackerBase, { forceVisible: true });
          setPanelState(vaultPanel, 0.98, palette.vaultBase, { forceVisible: true });
          setNetworkClusterState(networkCluster, 0.66, palette.networkBase);
          plainFlowLabel.setAlpha(0.24);
          cipherFlowLabel.setAlpha(0.32);
          sharedKeyLabel.setAlpha(0.94);
          updateLabelText(sharedKeyLabel, "Oeffentlicher Schluessel reist. Privater Schluessel bleibt lokal.");
          updateLabelText(networkLabel, "Schluesselaustausch entschaerft");
          updateLabelText(attackerPanel.contentLabel, "sieht PUB und Geheimtext");
          updateLabelText(encryptPanel.contentLabel, "PUB darf verteilt werden");
          updateLabelText(decryptPanel.contentLabel, "PRIV bleibt beim Empfaenger");
          setBoardState(algorithmBoard, "Privaten Schluessel niemals versenden", 0.9);
          setPathState(safeExchangeRail, 0.88, palette.safePath);
          setPathState(keyBridgeLeft, 0.7, palette.safePath);
          setPathState(keyBridgeRight, 0.62, palette.keyBase);
          setPathState(unsafeExchangeRail, 0.28 + (privateWarningPhase * 0.34), palette.unsafePath);
          setTokenState(keyHubToken, {
            visible: true,
            position: keyHubPosition,
            alpha: 0.94,
            color: palette.safePath,
            text: keyHubTokenText
          });
          setTokenState(leftKeyToken, {
            visible: true,
            position: leftKeyPosition,
            alpha: 0.9,
            color: palette.safePath,
            text: leftKeyTokenText
          });
          setTokenState(rightKeyToken, {
            visible: true,
            position: rightKeyPosition,
            alpha: 0.92,
            color: palette.keyBase,
            text: rightKeyTokenText
          });
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample((progress * 1.2) % 1),
            alpha: 0.96,
            color: palette.safePath,
            text: safeKeyTokenText
          });
          setTokenState(unsafeKeyToken, {
            visible: true,
            position: unsafeExchangeRail.sampler.sample(Math.min(0.16 + (privateWarningPhase * 0.1), 0.28)),
            alpha: 0.92,
            color: palette.attackerBase,
            text: unsafeKeyTokenText
          });
        } else {
          const stolenPhase = progress >= 0.42;
          setPanelState(encryptPanel, 0.34, palette.subtle, { forceVisible: true });
          setPanelState(decryptPanel, 0.34, palette.subtle, { forceVisible: true });
          setPanelState(attackerPanel, stolenPhase ? 0.96 : 0.52, palette.attackerBase, { forceVisible: true });
          setPanelState(vaultPanel, 0.92, stolenPhase ? palette.attackerBase : palette.vaultBase, { forceVisible: true });
          setNetworkClusterState(networkCluster, stolenPhase ? 0.72 : 0.44, stolenPhase ? palette.attackerBase : palette.networkBase);
          plainFlowLabel.setAlpha(stolenPhase ? 0.66 : 0.18);
          cipherFlowLabel.setAlpha(0.62);
          sharedKeyLabel.setAlpha(0.86);
          setBoardState(algorithmBoard, "Algorithmus bekannt", 0.8);
          updateLabelText(encryptPanel.contentLabel, "Algorithmus\nbekannt");
          updateLabelText(decryptPanel.contentLabel, "Algorithmus\nbekannt");
          setPathState(stolenKeyRail, stolenPhase ? 0.72 : 0.16, palette.attackerBase);
          if (!stolenPhase) {
            setTokenState(stolenKeyToken, {
              visible: true,
              position: vaultKeyPosition,
              alpha: 0.94,
              color: palette.keyBase
            });
            updateLabelText(attackerPanel.contentLabel, cipherShort);
            setTokenState(attackerCipherToken, {
              visible: true,
              position: positions.attacker.add(new BABYLON.Vector3(0, 0.7, 0.48)),
              alpha: 0.92,
              color: palette.ciphertext,
              text: cipherShort
            });
          } else {
            const pathProgress = clamp((progress - 0.42) / 0.36, 0, 1);
            setTokenState(stolenKeyToken, {
              visible: true,
              position: pathProgress < 1 ? stolenKeyRail.sampler.sample(pathProgress) : unsafeInterceptPosition.add(new BABYLON.Vector3(2.2, 0.25, 0)),
              alpha: 0.98,
              color: progress > 0.78 ? palette.attackerBase : palette.keyBase
            });
            updateLabelText(attackerPanel.contentLabel, progress > 0.78 ? plainText : cipherShort);
            setTokenState(attackerCipherToken, {
              visible: true,
              position: positions.attacker.add(new BABYLON.Vector3(0, 0.7, 0.48)),
              alpha: 0.92,
              color: progress > 0.78 ? palette.plaintext : palette.ciphertext,
              text: progress > 0.78 ? plainText : cipherShort
            });
          }
        }
      } else if (activeCueId === "cue_key_exchange_weakness") {
        const progress = cueProgress("cue_key_exchange_weakness", safeElapsed);
        const safePhase = clamp(progress / 0.4, 0, 1);
        const unsafePhase = clamp((progress - 0.28) / 0.52, 0, 1);
        setPanelState(senderPanel, 0.56, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.56, palette.receiverBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.88, palette.attackerBase, { forceVisible: true });
        setPanelState(vaultPanel, 0.02, palette.vaultBase, { forceVisible: false });
        setNetworkClusterState(networkCluster, 0.82, palette.unsafePath);
        plainFlowLabel.setAlpha(0.12);
        cipherFlowLabel.setAlpha(0.18);
        sharedKeyLabel.setAlpha(0.92);
        updateLabelText(networkLabel, "Schluesselaustausch");
        updateLabelText(attackerPanel.contentLabel, unsafePhase > 0.72 ? "Schluessel abgefangen" : "wartet am roten Weg");
        setPathState(safeExchangeRail, 0.76, palette.safePath);
        setPathState(unsafeExchangeRail, 0.86, palette.unsafePath);
        if (progress < 0.45) {
          setTokenState(safeKeyToken, {
            visible: true,
            position: safeExchangeRail.sampler.sample(safePhase),
            alpha: 0.98,
            color: palette.safePath
          });
        }
        if (unsafePhase < 0.74) {
          setTokenState(unsafeKeyToken, {
            visible: true,
            position: unsafeExchangeRail.sampler.sample(unsafePhase),
            alpha: 0.98,
            color: palette.unsafePath
          });
        } else {
          setTokenState(stolenKeyToken, {
            visible: true,
            position: unsafeInterceptPosition,
            alpha: 0.98,
            color: palette.attackerBase
          });
        }
      } else if (activeCueId === "cue_performance_tradeoff") {
        const progress = cueProgress("cue_performance_tradeoff", safeElapsed);
        const sessionKeyPhase = clamp(progress / 0.42, 0, 1);
        const largeDataPhase = clamp((progress - 0.28) / 0.58, 0, 1);
        setPanelState(senderPanel, 0.66, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.66, palette.receiverBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.84, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.62, palette.cryptoBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.02, palette.attackerBase, { forceVisible: false });
        setPanelState(vaultPanel, 0.46, palette.vaultBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.76, palette.networkBase);
        plainFlowLabel.setAlpha(0.72);
        cipherFlowLabel.setAlpha(0.64);
        sharedKeyLabel.setAlpha(0.9);
        updateLabelText(sharedKeyLabel, "Asymmetrisch fuer den kleinen Schluesseltausch, symmetrisch fuer grosse Daten");
        updateLabelText(networkLabel, "Praxis: oft Hybrid");
        updateLabelText(senderPanel.contentLabel, "kleiner Sitzungsschluessel");
        updateLabelText(receiverPanel.contentLabel, "grosse Daten danach symmetrisch");
        updateLabelText(encryptPanel.contentLabel, "Asymmetrisch\nlangsamer");
        updateLabelText(decryptPanel.contentLabel, "Symmetrisch fuer Masse");
        setBoardState(schemaBoard, performanceBoardText, 0.88);
        setPathState(keyBridgeLeft, 0.76, palette.safePath);
        setPathState(safeExchangeRail, 0.68, palette.safePath);
        setPathState(cipherRail, 0.54, palette.networkBase);
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.86,
          color: palette.safePath,
          text: keyHubTokenText
        });
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.88,
          color: palette.safePath,
          text: leftKeyTokenText
        });
        setTokenState(keyPulseToken, {
          visible: true,
          position: keyBridgeLeft.sampler.sample(sessionKeyPhase),
          alpha: 0.98,
          color: palette.safePath,
          text: "Session"
        });
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(Math.min(0.1 + (largeDataPhase * 0.28), 0.42)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: "Grosse Datei",
          scale: 1.24
        });
      } else if (activeCueId === "cue_finale") {
        const progress = cueProgress("cue_finale", safeElapsed);
        setPanelState(senderPanel, 0.68, palette.senderBase, { forceVisible: true });
        setPanelState(encryptPanel, 0.76, palette.cryptoBase, { forceVisible: true });
        setPanelState(decryptPanel, 0.76, palette.cryptoBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.68, palette.receiverBase, { forceVisible: true });
        setPanelState(attackerPanel, isAsymmetric ? 0.18 : 0.28, palette.attackerBase, { forceVisible: true });
        setPanelState(vaultPanel, isAsymmetric ? 0.82 : 0.02, palette.vaultBase, { forceVisible: isAsymmetric });
        setNetworkClusterState(networkCluster, 0.88, palette.networkBase);
        plainFlowLabel.setAlpha(0.76);
        cipherFlowLabel.setAlpha(0.88);
        sharedKeyLabel.setAlpha(0.9);
        updateLabelText(sharedKeyLabel, isAsymmetric ? "Oeffentlich verschluesseln. Privat entschluesseln." : sharedKeyBannerText);
        updateLabelText(senderPanel.contentLabel, plainText);
        updateLabelText(receiverPanel.contentLabel, plainText);
        updateLabelText(attackerPanel.contentLabel, cipherShort);
        setPathState(senderToEncryptRail, 0.48, palette.plaintext);
        setPathState(cipherRail, 0.74, palette.networkBase);
        setPathState(decryptRail, 0.58, palette.receiverBase);
        setPathState(keyBridgeLeft, 0.54, isAsymmetric ? palette.safePath : palette.keyBase);
        setPathState(keyBridgeRight, 0.54, palette.keyBase);
        setPathState(safeExchangeRail, isAsymmetric ? 0.52 : 0, palette.safePath);
        setTokenState(keyHubToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.92,
          color: isAsymmetric ? palette.safePath : palette.keyBase,
          text: keyHubTokenText
        });
        setTokenState(leftKeyToken, {
          visible: true,
          position: leftKeyPosition,
          alpha: 0.92,
          color: isAsymmetric ? palette.safePath : palette.keyBase,
          text: leftKeyTokenText
        });
        setTokenState(rightKeyToken, {
          visible: true,
          position: rightKeyPosition,
          alpha: 0.92,
          color: palette.keyBase,
          text: rightKeyTokenText
        });
        setTokenState(cipherToken, {
          visible: true,
          position: cipherRail.sampler.sample(0.12 + (progress * 0.76)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: cipherShort
        });
        setBoardState(schemaBoard, finaleSchemaText, 0.78);
        setBoardState(quoteBoard, finalQuote, clamp((progress - 0.18) / 0.48, 0, 1));
      } else {
        setPanelState(senderPanel, 0.4, palette.senderBase, { forceVisible: true });
        setPanelState(receiverPanel, 0.4, palette.receiverBase, { forceVisible: true });
        setNetworkClusterState(networkCluster, 0.54, palette.networkBase);
        setPathState(cipherRail, 0.22, palette.networkBase);
      }

      networkLabel.plane.position.x = networkLabelBasePosition.x;
      networkLabel.plane.position.y = networkLabelBasePosition.y + (Math.sin(safeElapsed * 0.0007) * 0.05);
      networkLabel.plane.position.z = networkLabelBasePosition.z;
      plainFlowLabel.plane.position.x = plainFlowLabelBasePosition.x;
      plainFlowLabel.plane.position.y = plainFlowLabelBasePosition.y + (Math.sin(safeElapsed * 0.0008 + 0.6) * 0.03);
      plainFlowLabel.plane.position.z = plainFlowLabelBasePosition.z;
      cipherFlowLabel.plane.position.x = cipherFlowLabelBasePosition.x;
      cipherFlowLabel.plane.position.y = cipherFlowLabelBasePosition.y + (Math.sin(safeElapsed * 0.0008 + 1.1) * 0.03);
      cipherFlowLabel.plane.position.z = cipherFlowLabelBasePosition.z;
      sharedKeyLabel.plane.position.x = sharedKeyLabelBasePosition.x;
      sharedKeyLabel.plane.position.y = sharedKeyLabelBasePosition.y + (Math.sin(safeElapsed * 0.0008 + 1.7) * 0.03);
      sharedKeyLabel.plane.position.z = sharedKeyLabelBasePosition.z;
      networkCluster.root.rotation.y = safeElapsed * 0.00024;
      networkCluster.root.rotation.z = Math.sin(safeElapsed * 0.0005) * 0.08;
      networkCluster.root.position.y = networkCluster.basePosition.y + (Math.sin(safeElapsed * 0.0009) * 0.06);
      networkCluster.orbiters.forEach((orbiter) => {
        orbiter.mesh.position.x = orbiter.basePosition.x + (Math.cos((safeElapsed * 0.0011) + orbiter.phase) * 0.08);
        orbiter.mesh.position.y = orbiter.basePosition.y + (Math.sin((safeElapsed * 0.0013) + orbiter.phase) * 0.08);
      });
      keyHubToken.root.position.y = keyHubPosition.y + (Math.sin(safeElapsed * 0.0012) * 0.08);
      leftKeyToken.root.position.y = leftKeyPosition.y + (Math.sin(safeElapsed * 0.0013) * 0.06);
      rightKeyToken.root.position.y = rightKeyPosition.y + (Math.sin(safeElapsed * 0.0013 + 1.2) * 0.06);
      senderPanel.root.position.y = senderPanel.basePosition.y + (Math.sin(safeElapsed * 0.0007) * 0.03);
      receiverPanel.root.position.y = receiverPanel.basePosition.y + (Math.sin(safeElapsed * 0.0007 + 0.9) * 0.03);
      attackerPanel.root.position.y = attackerPanel.basePosition.y + (Math.sin(safeElapsed * 0.0007 + 0.3) * 0.03);
      vaultPanel.root.position.y = vaultPanel.basePosition.y + (Math.sin(safeElapsed * 0.0007 + 1.8) * 0.03);
      if (serverPanel) {
        serverPanel.root.position.y = serverPanel.basePosition.y + (Math.sin(safeElapsed * 0.0007 + 1.25) * 0.03);
      }
      if (senderLockToken) {
        senderLockToken.root.position.y = senderLockPosition.y + (Math.sin(safeElapsed * 0.0014 + 0.2) * 0.05);
      }
      if (receiverLockToken) {
        receiverLockToken.root.position.y = receiverLockPosition.y + (Math.sin(safeElapsed * 0.0014 + 0.9) * 0.05);
      }
    }

    engine.runRenderLoop(() => {
      updateSymmetricVisualState();
      scene.render();
    });

    return Object.freeze({
      setElapsedMs(nextElapsedMs) {
        currentElapsedMs = clamp(nextElapsedMs, 0, durationMs);
      },
      applyCameraPose(nextPose) {
        return applyPoseToFreeCamera(nextPose);
      },
      setUserCameraEnabled(nextEnabled) {
        cameraState.userEnabled = Boolean(nextEnabled);
        if (!cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        updateCameraAttachment();
        return cameraState.userEnabled;
      },
      setJumpPlaybackEnabled(nextEnabled) {
        playerCameraState.jumpsEnabled = Boolean(nextEnabled);
        if (!cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        return playerCameraState.jumpsEnabled;
      },
      setPlayerPlaybackActive(nextEnabled) {
        playerCameraState.playbackActive = Boolean(nextEnabled);
        if (playerCameraState.playbackActive && !cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        return playerCameraState.playbackActive;
      },
      syncPlayerCameraToElapsed(nextElapsedMs = currentElapsedMs) {
        currentElapsedMs = clamp(nextElapsedMs, 0, durationMs);
        clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
        return syncPlayerCameraPose(currentElapsedMs);
      },
      previewPlayerCameraToCue(cueIndex = 0, previewDurationMs = 0) {
        const jumpSequence = getNormalizedPlayerJumpSequence();
        const targetEntry = jumpSequence[Math.max(0, Number(cueIndex) || 0)] || null;
        const nextEntry = targetEntry ? jumpSequence[(Math.max(0, Number(cueIndex) || 0)) + 1] || null : null;
        const durationHint = previewDurationMs || getPlayerJumpTransitionDuration(targetEntry, nextEntry) || 1100;
        return startPlayerCameraPreview(targetEntry?.pose || getBaseCameraPose(), durationHint);
      },
      setFreeFlyEnabled(nextEnabled) {
        cameraState.userEnabled = Boolean(nextEnabled);
        if (!cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        updateCameraAttachment();
        return cameraState.userEnabled;
      },
      snapFreeCameraToCue() {
        focusCameraOnCurrentCue();
        return true;
      },
      getCameraPose() {
        return getCurrentFreeCameraPose();
      },
      getCueCameraConfig(referenceCamera = null) {
        return getFreeCameraCueConfig(referenceCamera);
      },
      isFreeFlyEnabled() {
        return cameraState.userEnabled;
      },
      resize() {
        engine.resize();
      },
      refreshTranslations() {
        refreshLabelTranslations();
      },
      dispose() {
        clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
        freeCamera.detachControl(canvas);
        engine.stopRenderLoop();
        glowLayer.dispose();
        scene.dispose();
        engine.dispose();
      }
    });
  }

  function buildTlsHttpsSceneRuntime(BABYLON, canvas, presentation) {
    const sceneData = getPrimaryScene(presentation) || {};
    const palette = {
      backgroundTop: "#07121f",
      backgroundBottom: "#02060d",
      stageLine: "#18385a",
      browserBase: "#5cc8ff",
      serverBase: "#68e8a5",
      httpBase: "#f6c35b",
      tlsBase: "#7ed6ff",
      networkBase: "#ffb56d",
      attackerBase: "#ff6f7a",
      certBase: "#f2f7ff",
      keyBase: "#ffe38b",
      plaintext: "#f5fbff",
      ciphertext: "#9ac9ff",
      shieldBase: "#7bf0b0",
      warningBase: "#ff9a61",
      label: "#eff6ff",
      subtle: "#a5b3ca"
    };
    Object.assign(palette, sceneData.palette || {});
    const layout = sceneData.layout || {};
    const cameraConfig = sceneData.camera || {};
    const cues = Array.isArray(sceneData.cues) ? sceneData.cues : [];
    const durationMs = Math.max(1000, Number(sceneData.durationMs || 1000));
    const cueById = new Map(cues.map((cue) => [cue.id, cue]));
    const labelNodes = new Set();
    const playerCameraState = {
      jumpsEnabled: true,
      playbackActive: false
    };
    const cameraPreviewState = {
      active: false,
      startedAtMs: 0,
      durationMs: 0,
      startPose: null,
      endPose: null,
      restoreUserControl: true
    };
    const cameraState = {
      userEnabled: true
    };
    let currentElapsedMs = 0;

    const browserLabel = String(sceneData.browserLabel || "Browser");
    const serverLabel = String(sceneData.serverLabel || "Webserver");
    const httpLabel = String(sceneData.httpLabel || "HTTP = Webinhalt");
    const tlsLabel = String(sceneData.tlsLabel || "TLS = Schutzschicht");
    const httpsLockLabel = String(sceneData.httpsLockLabel || "HTTPS");
    const loginPlainText = String(sceneData.loginPlainText || "POST /login\npasswort=geheim123");
    const formPlainText = String(sceneData.formPlainText || "POST /formular\ntext=Kontaktanfrage");
    const cookieText = String(sceneData.cookieText || "Cookie: SESSION=4F7A9C");
    const cipherPacketText = String(sceneData.cipherPacketText || "17 03 03 8A F2 91 C4 7B ...");
    const certificateDomain = String(sceneData.certificateDomain || "shop.beispiel.de");
    const certificateIssuer = String(sceneData.certificateIssuer || "CA: Vertrauensstelle");
    const certificateKeyLabel = String(sceneData.certificateKeyLabel || "Public Key");
    const invalidCertificateText = String(sceneData.invalidCertificateText || "WARNUNG:\nZertifikat ungueltig");
    const finalQuote = String(sceneData.finalQuote || "TLS schuetzt die Verbindung.\nHTTPS nutzt das fuer das Web.");

    const problemBoardText = [
      "Du loggst dich ein oder sendest ein Formular.",
      "Im selben WLAN koennte ein Angreifer mitlesen.",
      "HTTPS blendet danach die geschuetzte Verbindung ein."
    ].join("\n");
    const layerBoardText = [
      "HTTP = Webinhalt",
      "TLS = Schutzschicht darunter",
      "Zusammen wird daraus HTTPS"
    ].join("\n");
    const certificateBoardText = [
      "Zertifikat pruefen:",
      "Domainname",
      "Public Key",
      "Aussteller"
    ].join("\n");
    const handshakeBoardText = [
      "Kurz asymmetrisch fuer den Aufbau",
      "Dann entsteht ein Sitzungsschluessel",
      "Danach laufen die Daten symmetrisch und schnell"
    ].join("\n");
    const protectedBoardText = [
      "Geschuetzt sind z. B.",
      "Passwoerter",
      "Formulare",
      "Cookies",
      "Seiteninhalte",
      "Angreifer sehen nur Geheimtext-Pakete"
    ].join("\n");
    const limitsBoardText = [
      "HTTPS schuetzt die Leitung.",
      "Nicht automatisch die Website.",
      "Nicht automatisch dein Geraet."
    ].join("\n");
    const summaryBoardText = [
      "Browser -> Zertifikat pruefen",
      "-> sichere Sitzung aufbauen",
      "-> verschluesselte HTTP-Daten",
      "-> Webserver"
    ].join("\n");

    function color3(hex, fallback = "#6bdff0") {
      return BABYLON.Color3.FromHexString(String(hex || fallback));
    }

    function color4(hex, alpha = 1, fallback = "#050814") {
      const base = color3(hex, fallback);
      return new BABYLON.Color4(base.r, base.g, base.b, alpha);
    }

    function toVector3(position, fallback = [0, 0, 0]) {
      const source = Array.isArray(position) ? position : fallback;
      return new BABYLON.Vector3(
        Number(source[0] || 0),
        Number(source[1] || 0),
        Number(source[2] || 0)
      );
    }

    function lerpNumber(start, end, progress) {
      return start + ((end - start) * clamp(progress, 0, 1));
    }

    function ease(progress) {
      const safe = clamp(progress, 0, 1);
      return safe * safe * (3 - (2 * safe));
    }

    function cue(id) {
      return cueById.get(id) || { startMs: 0, endMs: 1 };
    }

    function cueProgress(id, elapsedMs) {
      const activeCue = cue(id);
      const span = Math.max(1, Number(activeCue.endMs || 0) - Number(activeCue.startMs || 0));
      return ease((Number(elapsedMs || 0) - Number(activeCue.startMs || 0)) / span);
    }

    function buildPathSampler(points) {
      const vectors = (Array.isArray(points) ? points : []).map((point) => (
        point instanceof BABYLON.Vector3 ? point.clone() : toVector3(point)
      ));
      const cumulative = [0];
      let totalLength = 0;
      for (let index = 1; index < vectors.length; index += 1) {
        totalLength += BABYLON.Vector3.Distance(vectors[index - 1], vectors[index]);
        cumulative.push(totalLength);
      }
      const safeLength = Math.max(totalLength, 0.0001);
      return Object.freeze({
        points: vectors,
        sample(progress) {
          const safeProgress = clamp(progress, 0, 1);
          if (!vectors.length) return BABYLON.Vector3.Zero();
          if (vectors.length === 1) return vectors[0].clone();
          const targetLength = safeLength * safeProgress;
          for (let index = 1; index < cumulative.length; index += 1) {
            if (targetLength <= cumulative[index]) {
              const segmentLength = Math.max(0.0001, cumulative[index] - cumulative[index - 1]);
              const localProgress = (targetLength - cumulative[index - 1]) / segmentLength;
              return BABYLON.Vector3.Lerp(vectors[index - 1], vectors[index], localProgress);
            }
          }
          return vectors[vectors.length - 1].clone();
        }
      });
    }

    function vectorToPlain(vector) {
      return Object.freeze({
        x: Number(vector?.x || 0),
        y: Number(vector?.y || 0),
        z: Number(vector?.z || 0)
      });
    }

    function getBaseCameraPose() {
      return getCueCameraPose(cameraConfig);
    }

    function getCueCameraPose(cueCamera = null) {
      const safeCamera = cueCamera && typeof cueCamera === "object" ? cueCamera : {};
      const fallbackTarget = Array.isArray(cameraConfig.target) ? cameraConfig.target : [0, 1.8, 0];
      const target = toVector3(safeCamera.target, fallbackTarget);
      const alpha = Number.isFinite(Number(safeCamera.alpha)) ? Number(safeCamera.alpha) : Number(cameraConfig.alpha || -1.34);
      const beta = clamp(
        Number.isFinite(Number(safeCamera.beta)) ? Number(safeCamera.beta) : Number(cameraConfig.beta || 0.98),
        0.05,
        Math.PI - 0.05
      );
      const radius = Math.max(
        0.1,
        Number.isFinite(Number(safeCamera.radius)) ? Number(safeCamera.radius) : Number(cameraConfig.radius || 30)
      );
      const sinBeta = Math.sin(beta);
      const position = new BABYLON.Vector3(
        target.x + (radius * Math.cos(alpha) * sinBeta),
        target.y + (radius * Math.cos(beta)),
        target.z + (radius * Math.sin(alpha) * sinBeta)
      );
      return Object.freeze({
        position: vectorToPlain(position),
        target: vectorToPlain(target),
        rotation: Object.freeze({
          x: beta - (Math.PI / 2),
          y: alpha + (Math.PI / 2),
          z: 0
        })
      });
    }

    function getNormalizedPlayerJumpSequence() {
      return cues.map((entryCue, index) => {
        const startMs = clamp(index === 0 ? 0 : Number(entryCue?.startMs || 0), 0, durationMs);
        const nextCue = cues[index + 1] || null;
        const endMs = nextCue
          ? clamp(Number(nextCue.startMs || 0), startMs, durationMs)
          : durationMs;
        return Object.freeze({
          cue: entryCue,
          index,
          startMs,
          endMs,
          pose: getCueCameraPose(entryCue?.camera)
        });
      });
    }

    function getPlayerJumpTransitionDuration(currentEntry, nextEntry) {
      const startMs = clamp(Number(currentEntry?.startMs || 0), 0, durationMs);
      const boundaryMs = clamp(
        nextEntry ? Number(nextEntry.startMs || startMs) : Number(currentEntry?.endMs || durationMs),
        startMs,
        durationMs
      );
      const availableMs = Math.max(0, boundaryMs - startMs);
      if (availableMs <= 0) return 0;
      return Math.min(availableMs, clamp(availableMs * 0.42, 900, 1800));
    }

    function blendPlayerCameraPose(startPose, endPose, progress) {
      const safeStartPose = startPose && typeof startPose === "object" ? startPose : {};
      const safeEndPose = endPose && typeof endPose === "object" ? endPose : {};
      const safeProgress = clamp(progress, 0, 1);
      const slideProgress = safeProgress <= 0.65 ? ease(safeProgress / 0.65) : 1;
      const lookProgress = safeProgress <= 0.35 ? 0 : ease((safeProgress - 0.35) / 0.65);
      const startPosition = safeStartPose.position || {};
      const endPosition = safeEndPose.position || {};
      const startTarget = safeStartPose.target || {};
      const endTarget = safeEndPose.target || {};
      const startRotation = safeStartPose.rotation || {};
      const endRotation = safeEndPose.rotation || {};
      return Object.freeze({
        position: Object.freeze({
          x: lerpNumber(Number(startPosition.x || 0), Number(endPosition.x || 0), slideProgress),
          y: lerpNumber(Number(startPosition.y || 0), Number(endPosition.y || 0), slideProgress),
          z: lerpNumber(Number(startPosition.z || 0), Number(endPosition.z || 0), slideProgress)
        }),
        target: Object.freeze({
          x: lerpNumber(Number(startTarget.x || 0), Number(endTarget.x || 0), lookProgress),
          y: lerpNumber(Number(startTarget.y || 0), Number(endTarget.y || 0), lookProgress),
          z: lerpNumber(Number(startTarget.z || 0), Number(endTarget.z || 0), lookProgress)
        }),
        rotation: Object.freeze({
          x: lerpNumber(Number(startRotation.x || 0), Number(endRotation.x || 0), lookProgress),
          y: lerpNumber(Number(startRotation.y || 0), Number(endRotation.y || 0), lookProgress),
          z: lerpNumber(Number(startRotation.z || 0), Number(endRotation.z || 0), lookProgress)
        })
      });
    }

    function resolvePlayerCameraPose(elapsedMs) {
      const safeElapsed = clamp(elapsedMs, 0, durationMs);
      const basePose = getBaseCameraPose();
      if (!playerCameraState.jumpsEnabled) {
        return basePose;
      }
      const jumpSequence = getNormalizedPlayerJumpSequence();
      if (!jumpSequence.length) {
        return basePose;
      }
      if (jumpSequence.length === 1 || safeElapsed <= jumpSequence[0].startMs) {
        return jumpSequence[0].pose || basePose;
      }
      for (let index = jumpSequence.length - 1; index >= 1; index -= 1) {
        const currentEntry = jumpSequence[index];
        if (safeElapsed < currentEntry.startMs) continue;
        const previousEntry = jumpSequence[index - 1] || currentEntry;
        const nextEntry = jumpSequence[index + 1] || null;
        const transitionDurationMs = getPlayerJumpTransitionDuration(currentEntry, nextEntry);
        if (transitionDurationMs > 0 && safeElapsed <= currentEntry.startMs + transitionDurationMs) {
          return blendPlayerCameraPose(
            previousEntry.pose || basePose,
            currentEntry.pose || previousEntry.pose || basePose,
            (safeElapsed - currentEntry.startMs) / transitionDurationMs
          );
        }
        return currentEntry.pose || previousEntry.pose || basePose;
      }
      return jumpSequence[0].pose || basePose;
    }

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    });
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = color4(palette.backgroundTop, 1, "#07121f");
    scene.ambientColor = color3("#1d2a42", "#1d2a42");
    const glowLayer = new BABYLON.GlowLayer("tlsHttpsGlow", scene);
    glowLayer.intensity = 0.38;

    const freeCamera = new BABYLON.UniversalCamera("tlsHttpsFreeCamera", BABYLON.Vector3.Zero(), scene);
    freeCamera.minZ = 0.1;
    freeCamera.speed = 0.38;
    freeCamera.inertia = 0.62;
    freeCamera.angularSensibility = 4200;
    freeCamera.keysUp = [87, 38];
    freeCamera.keysDown = [83, 40];
    freeCamera.keysLeft = [65, 37];
    freeCamera.keysRight = [68, 39];
    scene.activeCamera = freeCamera;

    function applyPoseToFreeCamera(nextPose) {
      const pose = nextPose && typeof nextPose === "object" ? nextPose : null;
      if (!pose) return false;
      scene.activeCamera = freeCamera;
      if (pose.position && typeof pose.position === "object") {
        freeCamera.position.copyFromFloats(
          Number(pose.position.x || 0),
          Number(pose.position.y || 0),
          Number(pose.position.z || 0)
        );
      }
      if (pose.target && typeof pose.target === "object") {
        freeCamera.setTarget(new BABYLON.Vector3(
          Number(pose.target.x || 0),
          Number(pose.target.y || 0),
          Number(pose.target.z || 0)
        ));
      } else if (pose.rotation && typeof pose.rotation === "object") {
        freeCamera.rotation.copyFromFloats(
          Number(pose.rotation.x || 0),
          Number(pose.rotation.y || 0),
          Number(pose.rotation.z || 0)
        );
      }
      if (freeCamera.cameraDirection?.setAll) freeCamera.cameraDirection.setAll(0);
      if (freeCamera.cameraRotation) {
        freeCamera.cameraRotation.x = 0;
        freeCamera.cameraRotation.y = 0;
      }
      return true;
    }

    function updateCameraAttachment() {
      if (cameraState.userEnabled) {
        freeCamera.attachControl(canvas, false);
      } else {
        freeCamera.detachControl(canvas);
      }
    }

    function getCurrentFreeCameraPose() {
      const currentTarget = typeof freeCamera.getTarget === "function"
        ? freeCamera.getTarget()
        : freeCamera.position.add(freeCamera.getForwardRay().direction.clone().normalize().scale(8));
      return Object.freeze({
        position: vectorToPlain(freeCamera.position),
        target: vectorToPlain(currentTarget),
        rotation: vectorToPlain(freeCamera.rotation)
      });
    }

    function getFreeCameraCueConfig(referenceCamera = null) {
      const safeReference = referenceCamera && typeof referenceCamera === "object" ? referenceCamera : {};
      const forward = freeCamera.getForwardRay().direction.clone();
      if (forward.lengthSquared() < 0.0001) {
        forward.copyFromFloats(0, 0, 1);
      } else {
        forward.normalize();
      }
      const target = freeCamera.position.add(forward.scale(Math.max(4, Number(safeReference.radius || cameraConfig.radius || 18))));
      const offset = freeCamera.position.subtract(target);
      const radius = Math.max(0.1, offset.length());
      const normalizedY = clamp(offset.y / radius, -1, 1);
      return Object.freeze({
        alpha: Math.atan2(offset.z, offset.x),
        beta: clamp(Math.acos(normalizedY), 0.05, Math.PI - 0.05),
        radius,
        target: Object.freeze([
          Number(target.x || 0),
          Number(target.y || 0),
          Number(target.z || 0)
        ])
      });
    }

    function clearCameraPreview(options = {}) {
      const shouldApplyEndPose = options.applyEndPose !== false;
      const shouldRestoreUserControl = options.restoreUserControl !== false;
      if (!cameraPreviewState.active) return false;
      const endPose = cameraPreviewState.endPose;
      const restoreUserControl = cameraPreviewState.restoreUserControl;
      cameraPreviewState.active = false;
      cameraPreviewState.startedAtMs = 0;
      cameraPreviewState.durationMs = 0;
      cameraPreviewState.startPose = null;
      cameraPreviewState.endPose = null;
      cameraPreviewState.restoreUserControl = true;
      if (shouldApplyEndPose && endPose) {
        applyPoseToFreeCamera(endPose);
      }
      if (shouldRestoreUserControl) {
        cameraState.userEnabled = restoreUserControl;
        updateCameraAttachment();
      }
      return true;
    }

    function startPlayerCameraPreview(nextPose, previewDurationMs = 0) {
      const safePose = nextPose && typeof nextPose === "object" ? nextPose : resolvePlayerCameraPose(currentElapsedMs);
      const currentPose = getCurrentFreeCameraPose();
      clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
      cameraPreviewState.active = true;
      cameraPreviewState.startedAtMs = global.performance.now();
      cameraPreviewState.durationMs = clamp(previewDurationMs || 1100, 220, 2200);
      cameraPreviewState.startPose = currentPose;
      cameraPreviewState.endPose = safePose;
      cameraPreviewState.restoreUserControl = cameraState.userEnabled;
      cameraState.userEnabled = false;
      updateCameraAttachment();
      return true;
    }

    function syncPlayerCameraPose(elapsedMs) {
      currentElapsedMs = clamp(elapsedMs, 0, durationMs);
      if (cameraPreviewState.active) return false;
      return applyPoseToFreeCamera(resolvePlayerCameraPose(currentElapsedMs));
    }

    function focusCameraOnCurrentCue() {
      return applyPoseToFreeCamera(resolvePlayerCameraPose(currentElapsedMs));
    }

    applyPoseToFreeCamera(getBaseCameraPose());
    updateCameraAttachment();

    const hemisphericLight = new BABYLON.HemisphericLight("tlsHttpsHemi", new BABYLON.Vector3(0.12, 1, -0.28), scene);
    hemisphericLight.intensity = 1.18;
    const fillLight = new BABYLON.PointLight("tlsHttpsFill", new BABYLON.Vector3(0, 9, -9), scene);
    fillLight.intensity = 0.9;
    const rimLight = new BABYLON.PointLight("tlsHttpsRim", new BABYLON.Vector3(0, 5, 12), scene);
    rimLight.intensity = 0.38;

    function createSurfaceMaterial(id, diffuseHex, emissiveStrength = 0.28, alpha = 1) {
      const material = new BABYLON.StandardMaterial(id, scene);
      const diffuse = color3(diffuseHex, "#6bdff0");
      material.diffuseColor = diffuse;
      material.emissiveColor = diffuse.scale(emissiveStrength);
      material.specularColor = BABYLON.Color3.Black();
      material.alpha = alpha;
      material.backFaceCulling = false;
      return material;
    }

    function drawLabelTexture(texture, text, options = {}) {
      const width = Number(options.width || 1024);
      const height = Number(options.height || 256);
      const ctx = texture.getContext();
      const lines = String(text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const backgroundAlpha = clamp(Number(options.backgroundAlpha ?? 0.28), 0, 1);
      const radius = Number(options.radius || 24);
      const fillStyle = `rgba(7, 14, 28, ${backgroundAlpha})`;
      const borderStyle = options.borderStyle || "rgba(115, 242, 255, 0.16)";
      const textColor = options.textColor || String(palette.label || "#eff6ff");
      const fontSize = Number(options.fontSize || 86);
      const fontWeight = options.fontWeight || "700";
      ctx.clearRect(0, 0, width, height);
      if (backgroundAlpha > 0) {
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.lineWidth = Number(options.borderWidth || 4);
        ctx.strokeStyle = borderStyle;
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight} ${fontSize}px Arial`;
      const lineHeight = Number(options.lineHeight || fontSize * 0.92);
      const offsetY = ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, (height / 2) - offsetY + (index * lineHeight));
      });
      texture.update();
    }

    function createTextLabel(id, text, options = {}) {
      const plane = BABYLON.MeshBuilder.CreatePlane(id, {
        width: Number(options.planeWidth || 4.4),
        height: Number(options.planeHeight || 1.0)
      }, scene);
      plane.billboardMode = options.billboard === false ? BABYLON.Mesh.BILLBOARDMODE_NONE : BABYLON.Mesh.BILLBOARDMODE_ALL;
      const texture = new BABYLON.DynamicTexture(`${id}Texture`, {
        width: Number(options.textureWidth || 1024),
        height: Number(options.textureHeight || 256)
      }, scene, true);
      texture.hasAlpha = true;
      const material = new BABYLON.StandardMaterial(`${id}Material`, scene);
      material.diffuseTexture = texture;
      material.emissiveTexture = texture;
      material.opacityTexture = texture;
      material.diffuseColor = BABYLON.Color3.White();
      material.emissiveColor = BABYLON.Color3.White();
      material.specularColor = BABYLON.Color3.Black();
      material.backFaceCulling = false;
      material.alpha = Number(options.alpha ?? 1);
      plane.material = material;
      const labelNode = {
        plane,
        material,
        texture,
        sourceText: String(text || ""),
        baseOptions: { ...options },
        lastSignature: ""
      };
      labelNode.redraw = function redraw(nextText, nextOptions = {}) {
        labelNode.sourceText = String(nextText || "");
        labelNode.baseOptions = { ...labelNode.baseOptions, ...nextOptions };
        drawLabelTexture(texture, lt(labelNode.sourceText), labelNode.baseOptions);
      };
      labelNode.setAlpha = function setAlpha(alpha) {
        const safeAlpha = clamp(alpha, 0, 1);
        plane.setEnabled(safeAlpha > 0.01);
        material.alpha = safeAlpha;
      };
      labelNode.redraw(labelNode.sourceText, labelNode.baseOptions);
      labelNodes.add(labelNode);
      return labelNode;
    }

    function refreshLabelTranslations() {
      labelNodes.forEach((labelNode) => {
        labelNode.redraw(labelNode.sourceText, labelNode.baseOptions);
      });
    }

    function updateLabelText(labelNode, nextText, nextOptions = null) {
      if (!labelNode) return;
      const safeText = String(nextText || "");
      const safeOptions = nextOptions && typeof nextOptions === "object" ? nextOptions : {};
      const signature = `${safeText}::${JSON.stringify(safeOptions)}`;
      if (labelNode.lastSignature === signature) return;
      labelNode.lastSignature = signature;
      labelNode.redraw(safeText, safeOptions);
    }

    function createPanel(id, titleText, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      const size = config.size || { width: 4.2, height: 3.0, depth: 0.72 };
      const variant = String(config.variant || "").trim();
      const detailMaterials = [];
      const body = BABYLON.MeshBuilder.CreateBox(`${id}Body`, size, scene);
      body.parent = root;
      const bodyMaterial = createSurfaceMaterial(`${id}BodyMaterial`, config.color || palette.browserBase, 0.18, 0.94);
      body.material = bodyMaterial;
      const shell = BABYLON.MeshBuilder.CreateBox(`${id}Shell`, {
        width: size.width + 0.18,
        height: size.height + 0.18,
        depth: size.depth + 0.18
      }, scene);
      shell.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}ShellMaterial`, config.accent || config.color || palette.browserBase, 0.42, 0.12);
      shell.material = shellMaterial;
      const accent = BABYLON.MeshBuilder.CreateBox(`${id}Accent`, {
        width: Math.max(0.24, size.width - 0.48),
        height: Math.max(0.08, size.height * 0.1),
        depth: 0.08
      }, scene);
      accent.parent = root;
      accent.position = new BABYLON.Vector3(0, (size.height / 2) - 0.2, (size.depth / 2) + 0.05);
      const accentMaterial = createSurfaceMaterial(`${id}AccentMaterial`, config.accent || config.color || palette.browserBase, 0.88, 0.96);
      accent.material = accentMaterial;

      function trackDetailMaterial(material, options = {}) {
        detailMaterials.push({
          material,
          colorHex: String(options.colorHex || config.accent || config.color || palette.browserBase),
          alphaMin: Number(options.alphaMin ?? 0.18),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.08),
          emissiveMax: Number(options.emissiveMax ?? 0.94),
          fixedDiffuse: options.fixedDiffuse === true
        });
        return material;
      }

      if (variant === "browser") {
        const monitorFrame = BABYLON.MeshBuilder.CreateBox(`${id}MonitorFrame`, {
          width: 2.9,
          height: 1.95,
          depth: 0.18
        }, scene);
        monitorFrame.parent = root;
        monitorFrame.position = new BABYLON.Vector3(0, 0.34, 0.28);
        const monitorFrameMaterial = createSurfaceMaterial(`${id}MonitorFrameMaterial`, config.color || palette.browserBase, 0.14, 0.96);
        monitorFrameMaterial.diffuseColor = color3("#0b1325", "#0b1325");
        monitorFrame.material = monitorFrameMaterial;
        trackDetailMaterial(monitorFrameMaterial, {
          colorHex: config.accent || config.color || palette.browserBase,
          alphaMin: 0.56,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.42,
          fixedDiffuse: true
        });
        const screen = BABYLON.MeshBuilder.CreatePlane(`${id}Screen`, {
          width: 2.42,
          height: 1.48
        }, scene);
        screen.parent = root;
        screen.position = new BABYLON.Vector3(0, 0.34, 0.4);
        const screenMaterial = createSurfaceMaterial(`${id}ScreenMaterial`, config.accent || config.color || palette.browserBase, 0.58, 0.94);
        screenMaterial.diffuseColor = color3("#0e1730", "#0e1730");
        screen.material = screenMaterial;
        trackDetailMaterial(screenMaterial, {
          colorHex: config.accent || config.color || palette.browserBase,
          alphaMin: 0.44,
          alphaMax: 0.98,
          emissiveMin: 0.18,
          emissiveMax: 0.96,
          fixedDiffuse: true
        });
        const stand = BABYLON.MeshBuilder.CreateCylinder(`${id}Stand`, {
          height: 0.58,
          diameter: 0.18
        }, scene);
        stand.parent = root;
        stand.position = new BABYLON.Vector3(0, -0.64, 0.18);
        const standMaterial = createSurfaceMaterial(`${id}StandMaterial`, config.accent || config.color || palette.browserBase, 0.28, 0.92);
        stand.material = standMaterial;
        trackDetailMaterial(standMaterial, {
          colorHex: config.accent || config.color || palette.browserBase,
          alphaMin: 0.42,
          alphaMax: 0.96,
          emissiveMin: 0.12,
          emissiveMax: 0.64
        });
        const keyboard = BABYLON.MeshBuilder.CreateBox(`${id}Keyboard`, {
          width: 1.9,
          height: 0.08,
          depth: 0.7
        }, scene);
        keyboard.parent = root;
        keyboard.position = new BABYLON.Vector3(0, -1.04, 0.58);
        keyboard.rotation.x = 0.28;
        const keyboardMaterial = createSurfaceMaterial(`${id}KeyboardMaterial`, config.accent || config.color || palette.browserBase, 0.22, 0.88);
        keyboardMaterial.diffuseColor = color3("#10192f", "#10192f");
        keyboard.material = keyboardMaterial;
        trackDetailMaterial(keyboardMaterial, {
          colorHex: config.accent || config.color || palette.browserBase,
          alphaMin: 0.38,
          alphaMax: 0.9,
          emissiveMin: 0.08,
          emissiveMax: 0.48,
          fixedDiffuse: true
        });
      } else if (variant === "server") {
        const rack = BABYLON.MeshBuilder.CreateBox(`${id}Rack`, {
          width: 2.35,
          height: 2.38,
          depth: 0.94
        }, scene);
        rack.parent = root;
        rack.position = new BABYLON.Vector3(0, 0.1, 0.18);
        const rackMaterial = createSurfaceMaterial(`${id}RackMaterial`, config.color || palette.serverBase, 0.16, 0.96);
        rackMaterial.diffuseColor = color3("#10192b", "#10192b");
        rack.material = rackMaterial;
        trackDetailMaterial(rackMaterial, {
          colorHex: config.accent || config.color || palette.serverBase,
          alphaMin: 0.62,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.34,
          fixedDiffuse: true
        });
        [-0.58, 0, 0.58].forEach((offsetY, index) => {
          const slot = BABYLON.MeshBuilder.CreateBox(`${id}Slot${index + 1}`, {
            width: 1.9,
            height: 0.34,
            depth: 0.08
          }, scene);
          slot.parent = root;
          slot.position = new BABYLON.Vector3(0, offsetY, 0.72);
          const slotMaterial = createSurfaceMaterial(`${id}SlotMaterial${index + 1}`, config.accent || config.color || palette.serverBase, 0.74, 0.96);
          slotMaterial.diffuseColor = color3("#0d1524", "#0d1524");
          slot.material = slotMaterial;
          trackDetailMaterial(slotMaterial, {
            colorHex: config.accent || config.color || palette.serverBase,
            alphaMin: 0.56,
            alphaMax: 0.98,
            emissiveMin: 0.12,
            emissiveMax: 0.82,
            fixedDiffuse: true
          });
          const led = BABYLON.MeshBuilder.CreateSphere(`${id}Led${index + 1}`, {
            diameter: 0.12,
            segments: 12
          }, scene);
          led.parent = root;
          led.position = new BABYLON.Vector3(0.88, offsetY, 0.8);
          const ledMaterial = createSurfaceMaterial(`${id}LedMaterial${index + 1}`, config.accent || config.color || palette.serverBase, 0.92, 0.98);
          led.material = ledMaterial;
          trackDetailMaterial(ledMaterial, {
            colorHex: config.accent || config.color || palette.serverBase,
            alphaMin: 0.74,
            alphaMax: 1,
            emissiveMin: 0.22,
            emissiveMax: 1
          });
        });
      } else if (variant === "attacker") {
        const hood = BABYLON.MeshBuilder.CreateCylinder(`${id}Hood`, {
          height: 1.95,
          diameterTop: 0.9,
          diameterBottom: 2.0,
          tessellation: 24
        }, scene);
        hood.parent = root;
        hood.position = new BABYLON.Vector3(-1.5, -0.02, 0.18);
        const hoodMaterial = createSurfaceMaterial(`${id}HoodMaterial`, config.color || palette.attackerBase, 0.22, 0.94);
        hoodMaterial.diffuseColor = color3("#150d16", "#150d16");
        hood.material = hoodMaterial;
        trackDetailMaterial(hoodMaterial, {
          colorHex: config.color || palette.attackerBase,
          alphaMin: 0.68,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.34,
          fixedDiffuse: true
        });
        const visor = BABYLON.MeshBuilder.CreatePlane(`${id}Visor`, {
          width: 0.92,
          height: 0.28
        }, scene);
        visor.parent = root;
        visor.position = new BABYLON.Vector3(-1.5, 1.0, 0.72);
        const visorMaterial = createSurfaceMaterial(`${id}VisorMaterial`, config.color || palette.attackerBase, 0.94, 0.98);
        visor.material = visorMaterial;
        trackDetailMaterial(visorMaterial, {
          colorHex: config.color || palette.attackerBase,
          alphaMin: 0.54,
          alphaMax: 0.98,
          emissiveMin: 0.28,
          emissiveMax: 1
        });
        const screenFrame = BABYLON.MeshBuilder.CreateBox(`${id}ScreenFrame`, {
          width: 2.86,
          height: 1.44,
          depth: 0.14
        }, scene);
        screenFrame.parent = root;
        screenFrame.position = new BABYLON.Vector3(1.6, 0.24, 0.24);
        const screenFrameMaterial = createSurfaceMaterial(`${id}ScreenFrameMaterial`, config.color || palette.attackerBase, 0.14, 0.94);
        screenFrameMaterial.diffuseColor = color3("#0f1326", "#0f1326");
        screenFrame.material = screenFrameMaterial;
        trackDetailMaterial(screenFrameMaterial, {
          colorHex: config.color || palette.attackerBase,
          alphaMin: 0.52,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.42,
          fixedDiffuse: true
        });
        const screen = BABYLON.MeshBuilder.CreatePlane(`${id}Screen`, {
          width: 2.42,
          height: 1.06
        }, scene);
        screen.parent = root;
        screen.position = new BABYLON.Vector3(1.6, 0.24, 0.38);
        const screenMaterial = createSurfaceMaterial(`${id}ScreenMaterial`, config.color || palette.attackerBase, 0.84, 0.96);
        screenMaterial.diffuseColor = color3("#0e1322", "#0e1322");
        screen.material = screenMaterial;
        trackDetailMaterial(screenMaterial, {
          colorHex: config.color || palette.attackerBase,
          alphaMin: 0.42,
          alphaMax: 0.96,
          emissiveMin: 0.18,
          emissiveMax: 0.98,
          fixedDiffuse: true
        });
      } else if (variant === "layer") {
        const glowStrip = BABYLON.MeshBuilder.CreateBox(`${id}GlowStrip`, {
          width: Math.max(0.3, size.width - 0.4),
          height: 0.18,
          depth: 0.12
        }, scene);
        glowStrip.parent = root;
        glowStrip.position = new BABYLON.Vector3(0, 0, (size.depth / 2) + 0.08);
        const glowStripMaterial = createSurfaceMaterial(`${id}GlowStripMaterial`, config.accent || config.color || palette.tlsBase, 0.92, 0.94);
        glowStrip.material = glowStripMaterial;
        trackDetailMaterial(glowStripMaterial, {
          colorHex: config.accent || config.color || palette.tlsBase,
          alphaMin: 0.44,
          alphaMax: 0.98,
          emissiveMin: 0.22,
          emissiveMax: 1
        });
      }

      const titleLabel = createTextLabel(`${id}Title`, titleText, {
        planeWidth: Number(config.titleWidth || Math.max(3.6, size.width - 0.2)),
        planeHeight: Number(config.titleHeight || 0.76),
        textureWidth: 1024,
        textureHeight: 196,
        fontSize: Number(config.titleFontSize || 74),
        backgroundAlpha: 0.16,
        borderStyle: "rgba(244,248,255,0.12)"
      });
      titleLabel.plane.parent = root;
      titleLabel.plane.position = new BABYLON.Vector3(0, (size.height / 2) + Number(config.titleYOffset || 0.68), 0);
      const contentLabel = createTextLabel(`${id}Content`, config.contentText || "", {
        planeWidth: Number(config.contentWidth || Math.max(3.1, size.width - 0.5)),
        planeHeight: Number(config.contentHeight || Math.max(1.0, size.height - 1.0)),
        textureWidth: 1024,
        textureHeight: 384,
        fontSize: Number(config.contentFontSize || 52),
        backgroundAlpha: 0.2,
        borderStyle: "rgba(244,248,255,0.08)",
        lineHeight: Number(config.contentLineHeight || 58)
      });
      contentLabel.plane.parent = root;
      contentLabel.plane.position = Array.isArray(config.contentOffset)
        ? toVector3(config.contentOffset)
        : new BABYLON.Vector3(0, -0.04, (size.depth / 2) + 0.08);

      return {
        root,
        bodyMaterial,
        shellMaterial,
        accentMaterial,
        titleLabel,
        contentLabel,
        detailMaterials,
        baseColor: String(config.color || palette.browserBase),
        accentColor: String(config.accent || config.color || palette.browserBase)
      };
    }

    function createTransitNode(id, titleText, position, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      root.position.copyFrom(position.clone());
      const variant = String(config.variant || "").trim();
      const materials = [];

      function trackMaterial(material, options = {}) {
        materials.push({
          material,
          colorHex: String(options.colorHex || config.color || palette.networkBase),
          alphaMin: Number(options.alphaMin ?? 0.16),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.08),
          emissiveMax: Number(options.emissiveMax ?? 0.92),
          fixedDiffuse: options.fixedDiffuse === true
        });
        return material;
      }

      if (variant === "wifi") {
        const mast = BABYLON.MeshBuilder.CreateBox(`${id}Mast`, {
          width: 0.18,
          height: 1.0,
          depth: 0.18
        }, scene);
        mast.parent = root;
        const mastMaterial = createSurfaceMaterial(`${id}MastMaterial`, config.color || palette.networkBase, 0.54, 0.96);
        mast.material = mastMaterial;
        trackMaterial(mastMaterial, {
          colorHex: config.color || palette.networkBase,
          alphaMin: 0.48,
          alphaMax: 0.98,
          emissiveMin: 0.14,
          emissiveMax: 0.88
        });
        [0.42, 0.7, 1.0].forEach((diameter, index) => {
          const ring = BABYLON.MeshBuilder.CreateTorus(`${id}Ring${index + 1}`, {
            diameter,
            thickness: 0.04,
            tessellation: 24
          }, scene);
          ring.parent = root;
          ring.position = new BABYLON.Vector3(0, 0.36 + (index * 0.18), 0.1);
          ring.rotation.x = Math.PI / 2;
          const ringMaterial = createSurfaceMaterial(`${id}RingMaterial${index + 1}`, config.color || palette.networkBase, 0.82, 0.94);
          ring.material = ringMaterial;
          trackMaterial(ringMaterial, {
            colorHex: config.color || palette.networkBase,
            alphaMin: 0.28,
            alphaMax: 0.96,
            emissiveMin: 0.18,
            emissiveMax: 0.96
          });
        });
      } else if (variant === "router") {
        const base = BABYLON.MeshBuilder.CreateBox(`${id}Base`, {
          width: 1.2,
          height: 0.42,
          depth: 0.74
        }, scene);
        base.parent = root;
        const baseMaterial = createSurfaceMaterial(`${id}BaseMaterial`, config.color || palette.networkBase, 0.28, 0.96);
        baseMaterial.diffuseColor = color3("#121c2d", "#121c2d");
        base.material = baseMaterial;
        trackMaterial(baseMaterial, {
          colorHex: config.color || palette.networkBase,
          alphaMin: 0.52,
          alphaMax: 0.98,
          emissiveMin: 0.08,
          emissiveMax: 0.42,
          fixedDiffuse: true
        });
        [-0.3, 0.3].forEach((offsetX, index) => {
          const antenna = BABYLON.MeshBuilder.CreateCylinder(`${id}Antenna${index + 1}`, {
            height: 0.84,
            diameter: 0.06
          }, scene);
          antenna.parent = root;
          antenna.position = new BABYLON.Vector3(offsetX, 0.62, -0.18);
          const antennaMaterial = createSurfaceMaterial(`${id}AntennaMaterial${index + 1}`, config.color || palette.networkBase, 0.74, 0.96);
          antenna.material = antennaMaterial;
          trackMaterial(antennaMaterial, {
            colorHex: config.color || palette.networkBase,
            alphaMin: 0.42,
            alphaMax: 0.96,
            emissiveMin: 0.16,
            emissiveMax: 0.92
          });
        });
      } else {
        [
          new BABYLON.Vector3(-0.36, 0.1, 0),
          new BABYLON.Vector3(0, 0.32, 0),
          new BABYLON.Vector3(0.36, 0.1, 0),
          new BABYLON.Vector3(-0.14, -0.08, 0),
          new BABYLON.Vector3(0.14, -0.08, 0)
        ].forEach((offset, index) => {
          const cloudPart = BABYLON.MeshBuilder.CreateSphere(`${id}Part${index + 1}`, {
            diameter: index === 1 ? 0.72 : 0.58,
            segments: 16
          }, scene);
          cloudPart.parent = root;
          cloudPart.position.copyFrom(offset);
          const cloudMaterial = createSurfaceMaterial(`${id}PartMaterial${index + 1}`, config.color || palette.networkBase, 0.68, 0.96);
          cloudPart.material = cloudMaterial;
          trackMaterial(cloudMaterial, {
            colorHex: config.color || palette.networkBase,
            alphaMin: 0.38,
            alphaMax: 0.98,
            emissiveMin: 0.16,
            emissiveMax: 0.96
          });
        });
      }

      const label = createTextLabel(`${id}Label`, titleText, {
        planeWidth: 2.2,
        planeHeight: 0.52,
        textureWidth: 512,
        textureHeight: 160,
        fontSize: 52,
        backgroundAlpha: 0.16,
        borderStyle: "rgba(244,248,255,0.08)"
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, 1.28, 0);
      return {
        root,
        materials,
        label,
        baseColor: String(config.color || palette.networkBase),
        basePosition: position.clone()
      };
    }

    function createPathMesh(id, points, radius, colorHex) {
      const sampler = buildPathSampler(points);
      const mesh = BABYLON.MeshBuilder.CreateTube(id, {
        path: sampler.points,
        radius: Number(radius || 0.08),
        tessellation: 18
      }, scene);
      const material = createSurfaceMaterial(`${id}Material`, colorHex || palette.networkBase, 0.64, 0.6);
      mesh.material = material;
      return {
        mesh,
        material,
        sampler,
        baseColor: String(colorHex || palette.networkBase)
      };
    }

    function createToken(id, text, config = {}) {
      const root = new BABYLON.TransformNode(`${id}Root`, scene);
      const variant = String(config.variant || "").trim();
      const detailMaterials = [];
      const variantRoot = new BABYLON.TransformNode(`${id}VariantRoot`, scene);
      variantRoot.parent = root;
      variantRoot.position.z = variant ? 0.08 : 0;
      const body = BABYLON.MeshBuilder.CreateBox(`${id}Body`, {
        width: Number(config.width || 1.4),
        height: Number(config.height || 0.46),
        depth: Number(config.depth || 0.3)
      }, scene);
      body.parent = root;
      const bodyMaterial = createSurfaceMaterial(`${id}BodyMaterial`, config.color || palette.keyBase, 0.62, 0.96);
      body.material = bodyMaterial;
      const shell = BABYLON.MeshBuilder.CreateBox(`${id}Shell`, {
        width: Number(config.width || 1.4) + 0.12,
        height: Number(config.height || 0.46) + 0.12,
        depth: Number(config.depth || 0.3) + 0.12
      }, scene);
      shell.parent = root;
      const shellMaterial = createSurfaceMaterial(`${id}ShellMaterial`, config.color || palette.keyBase, 0.92, 0.12);
      shell.material = shellMaterial;

      function trackDetailMaterial(material, options = {}) {
        detailMaterials.push({
          material,
          colorHex: String(options.colorHex || config.color || palette.keyBase),
          alphaMin: Number(options.alphaMin ?? 0.18),
          alphaMax: Number(options.alphaMax ?? 0.98),
          emissiveMin: Number(options.emissiveMin ?? 0.08),
          emissiveMax: Number(options.emissiveMax ?? 0.94),
          fixedDiffuse: options.fixedDiffuse === true
        });
        return material;
      }

      if (variant === "document") {
        body.scaling.z = 0.42;
        shell.scaling.z = 0.46;
        const sheet = BABYLON.MeshBuilder.CreateBox(`${id}Sheet`, {
          width: Math.max(1.05, Number(config.width || 1.4) * 0.9),
          height: Math.max(0.68, Number(config.height || 0.46) * 1.82),
          depth: 0.06
        }, scene);
        sheet.parent = variantRoot;
        sheet.position = new BABYLON.Vector3(0, -0.08, 0.06);
        const sheetMaterial = createSurfaceMaterial(`${id}SheetMaterial`, config.color || palette.plaintext, 0.42, 0.98);
        sheetMaterial.diffuseColor = color3("#f8fbff", "#f8fbff");
        sheet.material = sheetMaterial;
        trackDetailMaterial(sheetMaterial, {
          colorHex: config.color || palette.plaintext,
          alphaMin: 0.82,
          alphaMax: 1,
          emissiveMin: 0.06,
          emissiveMax: 0.24,
          fixedDiffuse: true
        });
        [-0.18, 0.0, 0.18].forEach((offsetY, index) => {
          const line = BABYLON.MeshBuilder.CreateBox(`${id}Line${index + 1}`, {
            width: 0.72 - (index * 0.08),
            height: 0.05,
            depth: 0.02
          }, scene);
          line.parent = variantRoot;
          line.position = new BABYLON.Vector3(-0.08, offsetY, 0.12);
          const lineMaterial = createSurfaceMaterial(`${id}LineMaterial${index + 1}`, config.color || palette.browserBase, 0.54, 0.92);
          line.material = lineMaterial;
          trackDetailMaterial(lineMaterial, {
            colorHex: config.color || palette.browserBase,
            alphaMin: 0.58,
            alphaMax: 0.96,
            emissiveMin: 0.12,
            emissiveMax: 0.62
          });
        });
      } else if (variant === "data") {
        body.scaling.z = 0.52;
        shell.scaling.z = 0.56;
        const chip = BABYLON.MeshBuilder.CreateBox(`${id}Chip`, {
          width: Math.max(0.92, Number(config.width || 1.4) * 0.92),
          height: Math.max(0.42, Number(config.height || 0.46) * 1.06),
          depth: 0.14
        }, scene);
        chip.parent = variantRoot;
        chip.position = new BABYLON.Vector3(0, 0, 0.08);
        const chipMaterial = createSurfaceMaterial(`${id}ChipMaterial`, config.color || palette.ciphertext, 0.76, 0.98);
        chipMaterial.diffuseColor = color3("#0b1529", "#0b1529");
        chip.material = chipMaterial;
        trackDetailMaterial(chipMaterial, {
          colorHex: config.color || palette.ciphertext,
          alphaMin: 0.74,
          alphaMax: 1,
          emissiveMin: 0.18,
          emissiveMax: 0.92,
          fixedDiffuse: true
        });
        [-0.18, 0, 0.18].forEach((offsetY, index) => {
          const bar = BABYLON.MeshBuilder.CreateBox(`${id}BitBar${index + 1}`, {
            width: 0.72 - (index * 0.08),
            height: 0.06,
            depth: 0.04
          }, scene);
          bar.parent = variantRoot;
          bar.position = new BABYLON.Vector3(0, offsetY, 0.18);
          const barMaterial = createSurfaceMaterial(`${id}BitBarMaterial${index + 1}`, config.color || palette.ciphertext, 0.92, 0.96);
          bar.material = barMaterial;
          trackDetailMaterial(barMaterial, {
            colorHex: config.color || palette.ciphertext,
            alphaMin: 0.68,
            alphaMax: 1,
            emissiveMin: 0.22,
            emissiveMax: 1
          });
        });
      } else if (variant === "key") {
        body.scaling.copyFromFloats(0.74, 0.74, 0.46);
        shell.scaling.copyFromFloats(0.78, 0.78, 0.5);
        const ring = BABYLON.MeshBuilder.CreateTorus(`${id}Ring`, {
          diameter: 0.54,
          thickness: 0.1,
          tessellation: 24
        }, scene);
        ring.parent = variantRoot;
        ring.position = new BABYLON.Vector3(-0.32, 0.02, 0.1);
        const keyMaterial = createSurfaceMaterial(`${id}KeyMaterial`, config.color || palette.keyBase, 0.92, 0.98);
        ring.material = keyMaterial;
        trackDetailMaterial(keyMaterial, {
          colorHex: config.color || palette.keyBase,
          alphaMin: 0.76,
          alphaMax: 1,
          emissiveMin: 0.24,
          emissiveMax: 1
        });
        const shaft = BABYLON.MeshBuilder.CreateBox(`${id}Shaft`, {
          width: 0.64,
          height: 0.12,
          depth: 0.1
        }, scene);
        shaft.parent = variantRoot;
        shaft.position = new BABYLON.Vector3(0.12, 0.02, 0.1);
        shaft.material = keyMaterial;
        const tooth = BABYLON.MeshBuilder.CreateBox(`${id}Tooth`, {
          width: 0.12,
          height: 0.18,
          depth: 0.08
        }, scene);
        tooth.parent = variantRoot;
        tooth.position = new BABYLON.Vector3(0.38, -0.08, 0.1);
        tooth.material = keyMaterial;
      } else if (variant === "lock") {
        body.scaling.copyFromFloats(0.86, 0.94, 0.54);
        shell.scaling.copyFromFloats(0.92, 1.0, 0.58);
        const shackle = BABYLON.MeshBuilder.CreateTube(`${id}Shackle`, {
          path: [
            new BABYLON.Vector3(-0.28, 0.08, 0.1),
            new BABYLON.Vector3(-0.28, 0.58, 0.1),
            new BABYLON.Vector3(0.28, 0.58, 0.1),
            new BABYLON.Vector3(0.28, 0.08, 0.1)
          ],
          radius: 0.06,
          tessellation: 18
        }, scene);
        shackle.parent = variantRoot;
        const lockMaterial = createSurfaceMaterial(`${id}LockMaterial`, config.color || palette.shieldBase, 0.94, 0.98);
        shackle.material = lockMaterial;
        trackDetailMaterial(lockMaterial, {
          colorHex: config.color || palette.shieldBase,
          alphaMin: 0.76,
          alphaMax: 1,
          emissiveMin: 0.26,
          emissiveMax: 1
        });
      }

      const label = createTextLabel(`${id}Label`, text, {
        planeWidth: Number(config.labelWidth || Math.max(1.8, (Number(config.width || 1.4) + 0.6))),
        planeHeight: Number(config.labelHeight || 0.54),
        textureWidth: 768,
        textureHeight: 180,
        fontSize: Number(config.fontSize || 58),
        backgroundAlpha: 0.22,
        borderStyle: "rgba(244,248,255,0.08)"
      });
      label.plane.parent = root;
      label.plane.position = new BABYLON.Vector3(0, Number(config.labelYOffset || 0.62), 0);
      return {
        root,
        bodyMaterial,
        shellMaterial,
        detailMaterials,
        label,
        baseColor: String(config.color || palette.keyBase)
      };
    }

    function setPanelState(panel, emphasis = 0.15, colorHex = panel.baseColor, options = {}) {
      const safeEmphasis = clamp(emphasis, 0, 1);
      const visible = safeEmphasis > 0.01 || options.forceVisible === true;
      panel.root.setEnabled(visible);
      if (!visible) return;
      const tint = color3(colorHex || panel.baseColor, panel.baseColor);
      const scale = 1 + (safeEmphasis * 0.04);
      panel.root.scaling.copyFromFloats(scale, scale, 1);
      panel.bodyMaterial.alpha = 0.2 + (safeEmphasis * 0.52);
      panel.bodyMaterial.emissiveColor = tint.scale(0.06 + (safeEmphasis * 0.32));
      panel.shellMaterial.alpha = 0.08 + (safeEmphasis * 0.16);
      panel.shellMaterial.emissiveColor = tint.scale(0.18 + (safeEmphasis * 0.74));
      panel.accentMaterial.emissiveColor = tint.scale(0.56 + (safeEmphasis * 0.54));
      panel.titleLabel.setAlpha(0.36 + (safeEmphasis * 0.64));
      panel.contentLabel.setAlpha(0.24 + (safeEmphasis * 0.76));
      (panel.detailMaterials || []).forEach((detail) => {
        if (!detail?.material) return;
        const detailTint = color3(detail.colorHex || colorHex || panel.accentColor, panel.accentColor);
        detail.material.alpha = lerpNumber(detail.alphaMin, detail.alphaMax, safeEmphasis);
        detail.material.emissiveColor = detailTint.scale(lerpNumber(detail.emissiveMin, detail.emissiveMax, safeEmphasis));
        if (!detail.fixedDiffuse) {
          detail.material.diffuseColor = detailTint;
        }
      });
    }

    function setTransitNodeState(node, emphasis = 0.3, colorHex = node.baseColor) {
      const safeEmphasis = clamp(emphasis, 0, 1);
      const visible = safeEmphasis > 0.01;
      node.root.setEnabled(visible);
      if (!visible) return;
      const tint = color3(colorHex || node.baseColor, node.baseColor);
      node.root.scaling.copyFromFloats(0.96 + (safeEmphasis * 0.08), 0.96 + (safeEmphasis * 0.08), 1);
      node.label.setAlpha(0.28 + (safeEmphasis * 0.72));
      node.materials.forEach((entry) => {
        if (!entry?.material) return;
        entry.material.alpha = lerpNumber(entry.alphaMin, entry.alphaMax, safeEmphasis);
        entry.material.emissiveColor = tint.scale(lerpNumber(entry.emissiveMin, entry.emissiveMax, safeEmphasis));
        if (!entry.fixedDiffuse) {
          entry.material.diffuseColor = tint;
        }
      });
    }

    function setPathState(pathEntry, alpha = 0, colorHex = pathEntry.baseColor) {
      const safeAlpha = clamp(alpha, 0, 1);
      pathEntry.mesh.setEnabled(safeAlpha > 0.01);
      if (!pathEntry.mesh.isEnabled()) return;
      const tint = color3(colorHex || pathEntry.baseColor, pathEntry.baseColor);
      pathEntry.material.alpha = 0.08 + (safeAlpha * 0.78);
      pathEntry.material.emissiveColor = tint.scale(0.18 + (safeAlpha * 0.86));
    }

    function setTokenState(token, options = {}) {
      const visible = options.visible !== false;
      const alpha = clamp(Number(options.alpha ?? 1), 0, 1);
      const scale = Number(options.scale || 1);
      token.root.setEnabled(visible && alpha > 0.01);
      if (!token.root.isEnabled()) return;
      if (options.position instanceof BABYLON.Vector3) {
        token.root.position.copyFrom(options.position);
      } else if (Array.isArray(options.position)) {
        token.root.position.copyFrom(toVector3(options.position));
      }
      token.root.scaling.copyFromFloats(scale, scale, scale);
      const tint = color3(options.color || token.baseColor, token.baseColor);
      token.bodyMaterial.alpha = 0.3 + (alpha * 0.66);
      token.bodyMaterial.emissiveColor = tint.scale(0.38 + (alpha * 0.72));
      token.shellMaterial.alpha = 0.06 + (alpha * 0.2);
      token.shellMaterial.emissiveColor = tint.scale(0.22 + (alpha * 0.7));
      (token.detailMaterials || []).forEach((detail) => {
        if (!detail?.material) return;
        const detailTint = color3(options.color || detail.colorHex || token.baseColor, token.baseColor);
        detail.material.alpha = lerpNumber(detail.alphaMin, detail.alphaMax, alpha);
        detail.material.emissiveColor = detailTint.scale(lerpNumber(detail.emissiveMin, detail.emissiveMax, alpha));
        if (!detail.fixedDiffuse) {
          detail.material.diffuseColor = detailTint;
        }
      });
      token.label.setAlpha(alpha);
      if (options.text !== undefined) {
        updateLabelText(token.label, options.text);
      }
    }

    function setBoardState(board, text, alpha, options = null) {
      updateLabelText(board, text, options);
      board.setAlpha(alpha);
    }

    const positions = {
      browser: toVector3(layout.browser, [-12.2, 2.2, 0]),
      httpLayer: toVector3(layout.httpLayer, [-4.8, 3.9, 0]),
      tlsLayer: toVector3(layout.tlsLayer, [-4.8, 1.6, 0]),
      network: toVector3(layout.network, [0.2, 2.0, 0]),
      server: toVector3(layout.server, [12.2, 2.2, 0]),
      attacker: toVector3(layout.attacker, [0.15, -2.8, 0]),
      certificate: toVector3(layout.certificate, [5.6, 4.35, 0.12]),
      note: toVector3(layout.note, [0, 5.45, 0]),
      warningLeft: toVector3(layout.warningLeft, [-7.1, -4.15, 0]),
      warningCenter: toVector3(layout.warningCenter, [0, -4.55, 0]),
      warningRight: toVector3(layout.warningRight, [7.1, -4.15, 0])
    };

    const transitPositions = {
      wifi: positions.network.add(new BABYLON.Vector3(-6.2, -1.05, 0.1)),
      router: positions.network.add(new BABYLON.Vector3(0, -1.05, 0.1)),
      internet: positions.network.add(new BABYLON.Vector3(6.2, -0.95, 0.1))
    };
    const keyHubPosition = positions.network.add(new BABYLON.Vector3(0, 3.95, 0.12));
    const browserSessionPosition = positions.browser.add(new BABYLON.Vector3(1.7, 3.05, 0.12));
    const serverSessionPosition = positions.server.add(new BABYLON.Vector3(-1.7, 3.05, 0.12));
    const browserOut = positions.browser.add(new BABYLON.Vector3(2.8, 0.18, 0.48));
    const serverIn = positions.server.add(new BABYLON.Vector3(-2.8, 0.18, 0.48));
    const browserTop = positions.browser.add(new BABYLON.Vector3(0, 3.2, 0.18));
    const serverTop = positions.server.add(new BABYLON.Vector3(0, 3.2, 0.18));
    const httpIn = positions.httpLayer.add(new BABYLON.Vector3(-2.55, 0, 0.34));
    const httpOut = positions.httpLayer.add(new BABYLON.Vector3(2.55, 0, 0.34));
    const tlsIn = positions.tlsLayer.add(new BABYLON.Vector3(-2.55, 0, 0.34));
    const tlsOut = positions.tlsLayer.add(new BABYLON.Vector3(2.55, 0, 0.34));
    const attackerInterceptPosition = positions.attacker.add(new BABYLON.Vector3(0, 1.18, 0.42));
    const certificateAnchor = positions.certificate.add(new BABYLON.Vector3(0, -0.64, 0.18));

    const browserPanel = createPanel("tlsBrowser", browserLabel, positions.browser, {
      variant: "browser",
      size: { width: 4.4, height: 3.2, depth: 0.84 },
      color: palette.browserBase,
      accent: palette.browserBase,
      contentText: "Website geoeffnet",
      contentWidth: 3.0,
      contentHeight: 0.9,
      contentFontSize: 48,
      contentLineHeight: 52,
      contentOffset: [0, 0.42, 0.72]
    });
    const httpLayerPanel = createPanel("tlsHttpLayer", "HTTP", positions.httpLayer, {
      variant: "layer",
      size: { width: 5.7, height: 1.1, depth: 0.42 },
      color: palette.httpBase,
      accent: palette.httpBase,
      contentText: "Webinhalt",
      contentWidth: 4.4,
      contentHeight: 0.7,
      contentFontSize: 48,
      contentLineHeight: 52,
      contentOffset: [0, -0.04, 0.32]
    });
    const tlsLayerPanel = createPanel("tlsTlsLayer", "TLS", positions.tlsLayer, {
      variant: "layer",
      size: { width: 5.7, height: 1.1, depth: 0.42 },
      color: palette.tlsBase,
      accent: palette.shieldBase,
      contentText: "Schutzschicht",
      contentWidth: 4.4,
      contentHeight: 0.7,
      contentFontSize: 48,
      contentLineHeight: 52,
      contentOffset: [0, -0.04, 0.32]
    });
    const serverPanel = createPanel("tlsServer", serverLabel, positions.server, {
      variant: "server",
      size: { width: 4.2, height: 3.2, depth: 0.88 },
      color: palette.serverBase,
      accent: palette.serverBase,
      contentText: "wartet auf HTTPS",
      contentWidth: 3.0,
      contentHeight: 0.9,
      contentFontSize: 48,
      contentLineHeight: 52,
      contentOffset: [0, -1.02, 0.72]
    });
    const attackerPanel = createPanel("tlsAttacker", "Angreifer", positions.attacker, {
      variant: "attacker",
      size: { width: 6.8, height: 3.0, depth: 0.82 },
      color: palette.attackerBase,
      accent: palette.attackerBase,
      contentText: "beobachtet die Leitung",
      contentWidth: 3.2,
      contentHeight: 0.92,
      contentFontSize: 44,
      contentLineHeight: 48,
      contentOffset: [1.6, 0.22, 0.72]
    });
    const certificatePanel = createPanel("tlsCertificate", "Zertifikat", positions.certificate, {
      size: { width: 4.4, height: 2.8, depth: 0.64 },
      color: palette.certBase,
      accent: palette.keyBase,
      contentText: `${certificateDomain}\n${certificateKeyLabel}\n${certificateIssuer}`,
      contentWidth: 3.4,
      contentHeight: 1.24,
      contentFontSize: 42,
      contentLineHeight: 48,
      contentOffset: [0, -0.22, 0.42]
    });

    const wifiNode = createTransitNode("tlsWifiNode", "WLAN", transitPositions.wifi, {
      variant: "wifi",
      color: palette.networkBase
    });
    const routerNode = createTransitNode("tlsRouterNode", "Router", transitPositions.router, {
      variant: "router",
      color: palette.networkBase
    });
    const internetNode = createTransitNode("tlsInternetNode", "Internet", transitPositions.internet, {
      variant: "internet",
      color: palette.networkBase
    });

    const noteBoard = createTextLabel("tlsNoteBoard", problemBoardText, {
      planeWidth: 12.8,
      planeHeight: 2.1,
      textureWidth: 1700,
      textureHeight: 520,
      fontSize: 64,
      lineHeight: 70,
      backgroundAlpha: 0.22,
      borderStyle: "rgba(126,214,255,0.18)"
    });
    noteBoard.plane.position.copyFrom(positions.note);
    const quoteBoard = createTextLabel("tlsQuoteBoard", finalQuote, {
      planeWidth: 10.8,
      planeHeight: 1.7,
      textureWidth: 1500,
      textureHeight: 320,
      fontSize: 84,
      lineHeight: 86,
      backgroundAlpha: 0.28,
      borderStyle: "rgba(123,240,176,0.22)"
    });
    quoteBoard.plane.position.copyFrom(positions.note.add(new BABYLON.Vector3(0, -1.9, 0)));
    const validBoard = createTextLabel("tlsValidBoard", "Zertifikat OK", {
      planeWidth: 4.2,
      planeHeight: 0.88,
      textureWidth: 900,
      textureHeight: 220,
      fontSize: 72,
      backgroundAlpha: 0.24,
      borderStyle: "rgba(123,240,176,0.22)"
    });
    validBoard.plane.position.copyFrom(positions.certificate.add(new BABYLON.Vector3(0, -2.0, 0.15)));
    const invalidBoard = createTextLabel("tlsInvalidBoard", invalidCertificateText, {
      planeWidth: 4.6,
      planeHeight: 1.16,
      textureWidth: 900,
      textureHeight: 280,
      fontSize: 58,
      lineHeight: 62,
      backgroundAlpha: 0.26,
      borderStyle: "rgba(255,111,122,0.22)"
    });
    invalidBoard.plane.position.copyFrom(positions.browser.add(new BABYLON.Vector3(0.2, 4.5, 0.15)));
    const laneShieldLabel = createTextLabel("tlsLaneShieldLabel", "Schutz nur auf der Leitung", {
      planeWidth: 5.8,
      planeHeight: 0.72,
      textureWidth: 1100,
      textureHeight: 180,
      fontSize: 56,
      backgroundAlpha: 0.18,
      borderStyle: "rgba(123,240,176,0.18)"
    });
    laneShieldLabel.plane.position.copyFrom(positions.network.add(new BABYLON.Vector3(0, 2.95, 0.08)));
    const phishingBoard = createTextLabel("tlsPhishingBoard", "Phishing-Seite", {
      planeWidth: 3.6,
      planeHeight: 0.76,
      textureWidth: 800,
      textureHeight: 180,
      fontSize: 54,
      backgroundAlpha: 0.22,
      borderStyle: "rgba(255,154,97,0.18)"
    });
    phishingBoard.plane.position.copyFrom(positions.warningLeft);
    const malwareBoard = createTextLabel("tlsMalwareBoard", "Malware auf Geraet", {
      planeWidth: 4.2,
      planeHeight: 0.82,
      textureWidth: 900,
      textureHeight: 200,
      fontSize: 52,
      backgroundAlpha: 0.22,
      borderStyle: "rgba(255,154,97,0.18)"
    });
    malwareBoard.plane.position.copyFrom(positions.warningCenter);
    const contentBoard = createTextLabel("tlsContentBoard", "Problematischer Serverinhalt", {
      planeWidth: 4.8,
      planeHeight: 0.82,
      textureWidth: 980,
      textureHeight: 200,
      fontSize: 48,
      backgroundAlpha: 0.22,
      borderStyle: "rgba(255,154,97,0.18)"
    });
    contentBoard.plane.position.copyFrom(positions.warningRight);

    const ground = BABYLON.MeshBuilder.CreateGround("tlsHttpsGround", {
      width: 38,
      height: 20
    }, scene);
    ground.position.y = -5.1;
    const groundMaterial = createSurfaceMaterial("tlsHttpsGroundMaterial", "#0c1530", 0.14, 0.95);
    groundMaterial.diffuseColor = color3("#0b1325", "#0b1325");
    groundMaterial.emissiveColor = color3(palette.stageLine || "#18385a", "#18385a").scale(0.12);
    ground.material = groundMaterial;

    const openFlowRail = createPathMesh("tlsOpenFlowRail", [
      browserOut,
      transitPositions.wifi.add(new BABYLON.Vector3(0, 0.58, 0.12)),
      transitPositions.router.add(new BABYLON.Vector3(0, 0.6, 0.12)),
      transitPositions.internet.add(new BABYLON.Vector3(0, 0.58, 0.12)),
      serverIn
    ], 0.08, palette.plaintext);
    const protectedFlowRail = createPathMesh("tlsProtectedFlowRail", [
      browserOut.add(new BABYLON.Vector3(0, 1.44, -0.12)),
      transitPositions.wifi.add(new BABYLON.Vector3(0, 2.02, 0.04)),
      transitPositions.router.add(new BABYLON.Vector3(0, 2.08, 0.04)),
      transitPositions.internet.add(new BABYLON.Vector3(0, 2.02, 0.04)),
      serverIn.add(new BABYLON.Vector3(0, 1.44, -0.12))
    ], 0.11, palette.shieldBase);
    const browserToHttpRail = createPathMesh("tlsBrowserToHttpRail", [
      browserOut.add(new BABYLON.Vector3(0, 0.86, -0.08)),
      httpIn
    ], 0.06, palette.httpBase);
    const httpToTlsRail = createPathMesh("tlsHttpToTlsRail", [
      httpOut,
      positions.tlsLayer.add(new BABYLON.Vector3(0, 1.05, 0.32)),
      tlsIn
    ], 0.06, palette.tlsBase);
    const tlsToServerRail = createPathMesh("tlsTlsToServerRail", [
      tlsOut,
      transitPositions.router.add(new BABYLON.Vector3(0, 1.9, 0.04)),
      transitPositions.internet.add(new BABYLON.Vector3(0, 1.84, 0.04)),
      serverIn.add(new BABYLON.Vector3(0, 1.02, -0.08))
    ], 0.08, palette.shieldBase);
    const certRail = createPathMesh("tlsCertRail", [
      serverTop,
      certificateAnchor,
      positions.browser.add(new BABYLON.Vector3(-0.8, 4.0, 0.14))
    ], 0.06, palette.certBase);
    const handshakeRail = createPathMesh("tlsHandshakeRail", [
      browserTop,
      keyHubPosition,
      serverTop
    ], 0.06, palette.keyBase);
    const sessionLeftRail = createPathMesh("tlsSessionLeftRail", [
      keyHubPosition,
      browserSessionPosition
    ], 0.05, palette.keyBase);
    const sessionRightRail = createPathMesh("tlsSessionRightRail", [
      keyHubPosition,
      serverSessionPosition
    ], 0.05, palette.keyBase);
    const attackerTapRail = createPathMesh("tlsAttackerTapRail", [
      transitPositions.router.add(new BABYLON.Vector3(0, 0.52, 0.12)),
      attackerInterceptPosition
    ], 0.08, palette.attackerBase);

    const plainToken = createToken("tlsPlainToken", "Passwort", {
      variant: "document",
      width: 2.1,
      height: 0.5,
      depth: 0.3,
      labelWidth: 2.9,
      color: palette.plaintext,
      fontSize: 48
    });
    const formToken = createToken("tlsFormToken", "Formular", {
      variant: "document",
      width: 2.0,
      height: 0.5,
      depth: 0.3,
      labelWidth: 2.8,
      color: palette.plaintext,
      fontSize: 48
    });
    const cookieToken = createToken("tlsCookieToken", "Cookie", {
      variant: "data",
      width: 1.7,
      height: 0.46,
      depth: 0.28,
      labelWidth: 2.4,
      color: palette.plaintext,
      fontSize: 48
    });
    const cipherToken = createToken("tlsCipherToken", cipherPacketText, {
      variant: "data",
      width: 2.3,
      height: 0.5,
      depth: 0.3,
      labelWidth: 3.6,
      color: palette.ciphertext,
      fontSize: 38
    });
    const attackerCipherToken = createToken("tlsAttackerCipherToken", cipherPacketText, {
      variant: "data",
      width: 2.3,
      height: 0.5,
      depth: 0.3,
      labelWidth: 3.6,
      color: palette.ciphertext,
      fontSize: 38
    });
    const certificateToken = createToken("tlsCertificateToken", "CERT", {
      variant: "document",
      width: 1.8,
      height: 0.48,
      depth: 0.28,
      labelWidth: 2.2,
      color: palette.certBase,
      fontSize: 48
    });
    const sessionKeyToken = createToken("tlsSessionKeyToken", "Session Key", {
      variant: "key",
      width: 1.45,
      height: 0.42,
      depth: 0.26,
      labelWidth: 2.4,
      color: palette.keyBase,
      fontSize: 44
    });
    const browserKeyToken = createToken("tlsBrowserKeyToken", "KEY", {
      variant: "key",
      width: 1.15,
      height: 0.38,
      depth: 0.24,
      labelWidth: 1.7,
      color: palette.keyBase,
      fontSize: 48
    });
    const serverKeyToken = createToken("tlsServerKeyToken", "KEY", {
      variant: "key",
      width: 1.15,
      height: 0.38,
      depth: 0.24,
      labelWidth: 1.7,
      color: palette.keyBase,
      fontSize: 48
    });
    const httpsLockToken = createToken("tlsHttpsLockToken", httpsLockLabel, {
      variant: "lock",
      width: 1.32,
      height: 0.44,
      depth: 0.26,
      labelWidth: 2.0,
      color: palette.shieldBase,
      fontSize: 48,
      labelYOffset: 0.78
    });

    function applyBaseVisualState() {
      setPanelState(browserPanel, 0.18, palette.browserBase, { forceVisible: true });
      setPanelState(httpLayerPanel, 0.02, palette.httpBase, { forceVisible: false });
      setPanelState(tlsLayerPanel, 0.02, palette.tlsBase, { forceVisible: false });
      setPanelState(serverPanel, 0.18, palette.serverBase, { forceVisible: true });
      setPanelState(attackerPanel, 0.14, palette.attackerBase, { forceVisible: true });
      setPanelState(certificatePanel, 0.02, palette.certBase, { forceVisible: false });
      setTransitNodeState(wifiNode, 0.32, palette.networkBase);
      setTransitNodeState(routerNode, 0.32, palette.networkBase);
      setTransitNodeState(internetNode, 0.32, palette.networkBase);
      setPathState(openFlowRail, 0.06, palette.plaintext);
      setPathState(protectedFlowRail, 0, palette.shieldBase);
      setPathState(browserToHttpRail, 0, palette.httpBase);
      setPathState(httpToTlsRail, 0, palette.tlsBase);
      setPathState(tlsToServerRail, 0, palette.shieldBase);
      setPathState(certRail, 0, palette.certBase);
      setPathState(handshakeRail, 0, palette.keyBase);
      setPathState(sessionLeftRail, 0, palette.keyBase);
      setPathState(sessionRightRail, 0, palette.keyBase);
      setPathState(attackerTapRail, 0.04, palette.attackerBase);
      updateLabelText(browserPanel.contentLabel, "Website geoeffnet");
      updateLabelText(httpLayerPanel.contentLabel, "Webinhalt");
      updateLabelText(tlsLayerPanel.contentLabel, "Schutzschicht");
      updateLabelText(serverPanel.contentLabel, "wartet auf HTTPS");
      updateLabelText(attackerPanel.contentLabel, "beobachtet die Leitung");
      updateLabelText(certificatePanel.contentLabel, `${certificateDomain}\n${certificateKeyLabel}\n${certificateIssuer}`);
      noteBoard.setAlpha(0);
      quoteBoard.setAlpha(0);
      validBoard.setAlpha(0);
      invalidBoard.setAlpha(0);
      laneShieldLabel.setAlpha(0);
      updateLabelText(laneShieldLabel, "Schutz nur auf der Leitung");
      phishingBoard.setAlpha(0);
      malwareBoard.setAlpha(0);
      contentBoard.setAlpha(0);
      setTokenState(plainToken, { visible: false });
      setTokenState(formToken, { visible: false });
      setTokenState(cookieToken, { visible: false });
      setTokenState(cipherToken, { visible: false });
      setTokenState(attackerCipherToken, { visible: false });
      setTokenState(certificateToken, { visible: false });
      setTokenState(sessionKeyToken, { visible: false });
      setTokenState(browserKeyToken, { visible: false });
      setTokenState(serverKeyToken, { visible: false });
      setTokenState(httpsLockToken, { visible: false });
    }

    function updateTlsHttpsVisualState() {
      const safeElapsed = clamp(currentElapsedMs, 0, durationMs);
      if (cameraPreviewState.active) {
        const previewProgress = clamp(
          (global.performance.now() - cameraPreviewState.startedAtMs) / Math.max(1, cameraPreviewState.durationMs),
          0,
          1
        );
        applyPoseToFreeCamera(blendPlayerCameraPose(
          cameraPreviewState.startPose,
          cameraPreviewState.endPose,
          previewProgress
        ));
        if (previewProgress >= 1) {
          clearCameraPreview();
        }
      } else if (!cameraState.userEnabled) {
        syncPlayerCameraPose(safeElapsed);
      }

      applyBaseVisualState();

      const activeCue = resolveActiveCue(cues, safeElapsed);
      const activeCueId = String(activeCue?.id || "");

      if (activeCueId === "cue_everyday_problem") {
        const progress = cueProgress("cue_everyday_problem", safeElapsed);
        const securePhase = progress >= 0.58;
        const secureProgress = clamp((progress - 0.58) / 0.42, 0, 1);
        setPanelState(browserPanel, 0.96, palette.browserBase, { forceVisible: true });
        setPanelState(serverPanel, 0.82, palette.serverBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.84, palette.attackerBase, { forceVisible: true });
        setTransitNodeState(wifiNode, 0.74, palette.networkBase);
        setTransitNodeState(routerNode, 0.82, palette.networkBase);
        setTransitNodeState(internetNode, 0.74, palette.networkBase);
        setBoardState(noteBoard, problemBoardText, 0.94);
        setPathState(openFlowRail, securePhase ? 0.12 : 0.94, palette.plaintext);
        setPathState(protectedFlowRail, securePhase ? 0.86 : 0.02, palette.shieldBase);
        setPathState(attackerTapRail, securePhase ? 0.34 : 0.7, securePhase ? palette.subtle : palette.attackerBase);
        updateLabelText(browserPanel.contentLabel, securePhase ? "HTTPS aktiv\nSchutz wird aufgebaut" : loginPlainText);
        updateLabelText(serverPanel.contentLabel, securePhase ? "antwortet per HTTPS" : "offener Webverkehr");
        updateLabelText(attackerPanel.contentLabel, securePhase ? cipherPacketText : loginPlainText);
        if (!securePhase) {
          setTokenState(plainToken, {
            visible: true,
            position: openFlowRail.sampler.sample(clamp(progress / 0.58, 0, 1)),
            alpha: 0.98,
            color: palette.plaintext,
            text: "Passwort"
          });
        } else {
          setTokenState(httpsLockToken, {
            visible: true,
            position: positions.browser.add(new BABYLON.Vector3(1.45, 4.38, 0.12)),
            alpha: 0.64 + (secureProgress * 0.34),
            color: palette.shieldBase
          });
          setTokenState(cipherToken, {
            visible: true,
            position: protectedFlowRail.sampler.sample(secureProgress),
            alpha: 0.96,
            color: palette.ciphertext,
            text: cipherPacketText
          });
        }
      } else if (activeCueId === "cue_https_layers") {
        const progress = cueProgress("cue_https_layers", safeElapsed);
        setPanelState(browserPanel, 0.42, palette.browserBase, { forceVisible: true });
        setPanelState(httpLayerPanel, 0.96, palette.httpBase, { forceVisible: true });
        setPanelState(tlsLayerPanel, 0.96, palette.tlsBase, { forceVisible: true });
        setPanelState(serverPanel, 0.42, palette.serverBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.12, palette.attackerBase, { forceVisible: false });
        setTransitNodeState(wifiNode, 0.18, palette.networkBase);
        setTransitNodeState(routerNode, 0.18, palette.networkBase);
        setTransitNodeState(internetNode, 0.18, palette.networkBase);
        setBoardState(noteBoard, layerBoardText, 0.94);
        setPathState(browserToHttpRail, 0.82, palette.httpBase);
        setPathState(httpToTlsRail, 0.88, palette.tlsBase);
        setPathState(tlsToServerRail, 0.9, palette.shieldBase);
        updateLabelText(httpLayerPanel.contentLabel, httpLabel);
        updateLabelText(tlsLayerPanel.contentLabel, tlsLabel);
        updateLabelText(browserPanel.contentLabel, "Browser sendet HTTP");
        updateLabelText(serverPanel.contentLabel, "Webserver bekommt HTTPS");
        setTokenState(httpsLockToken, {
          visible: progress >= 0.42,
          position: positions.httpLayer.add(new BABYLON.Vector3(0, -1.05, 0.12)),
          alpha: clamp((progress - 0.42) / 0.3, 0, 1),
          color: palette.shieldBase
        });
        if (progress < 0.34) {
          setTokenState(plainToken, {
            visible: true,
            position: browserToHttpRail.sampler.sample(clamp(progress / 0.34, 0, 1)),
            alpha: 0.96,
            color: palette.plaintext,
            text: "HTTP"
          });
        } else if (progress < 0.62) {
          setTokenState(plainToken, {
            visible: true,
            position: httpToTlsRail.sampler.sample(clamp((progress - 0.34) / 0.28, 0, 1)),
            alpha: 0.96,
            color: palette.httpBase,
            text: "HTTP"
          });
        } else {
          setTokenState(cipherToken, {
            visible: true,
            position: tlsToServerRail.sampler.sample(clamp((progress - 0.62) / 0.38, 0, 1)),
            alpha: 0.96,
            color: palette.ciphertext,
            text: "HTTPS"
          });
        }
      } else if (activeCueId === "cue_certificate_check") {
        const progress = cueProgress("cue_certificate_check", safeElapsed);
        setPanelState(browserPanel, 0.88, palette.browserBase, { forceVisible: true });
        setPanelState(serverPanel, 0.88, palette.serverBase, { forceVisible: true });
        setPanelState(certificatePanel, 1, palette.certBase, { forceVisible: true });
        setPanelState(tlsLayerPanel, 0.42, palette.tlsBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.16, palette.attackerBase, { forceVisible: true });
        setTransitNodeState(wifiNode, 0.28, palette.networkBase);
        setTransitNodeState(routerNode, 0.28, palette.networkBase);
        setTransitNodeState(internetNode, 0.28, palette.networkBase);
        setBoardState(noteBoard, certificateBoardText, 0.94);
        setPathState(certRail, 0.94, palette.certBase);
        updateLabelText(browserPanel.contentLabel, "prueft Zertifikat");
        updateLabelText(serverPanel.contentLabel, "sendet Zertifikat");
        setTokenState(certificateToken, {
          visible: true,
          position: certRail.sampler.sample(clamp(progress / 0.66, 0, 1)),
          alpha: 0.98,
          color: palette.certBase,
          text: "CERT"
        });
        invalidBoard.setAlpha(progress > 0.28 && progress < 0.46 ? 0.9 : 0);
        validBoard.setAlpha(progress > 0.62 ? 0.96 : 0);
        setPathState(protectedFlowRail, progress > 0.64 ? 0.44 + (clamp((progress - 0.64) / 0.26, 0, 1) * 0.36) : 0, palette.shieldBase);
        setTokenState(httpsLockToken, {
          visible: progress > 0.7,
          position: positions.browser.add(new BABYLON.Vector3(1.45, 4.38, 0.12)),
          alpha: clamp((progress - 0.7) / 0.2, 0, 1),
          color: palette.shieldBase
        });
      } else if (activeCueId === "cue_session_setup") {
        const progress = cueProgress("cue_session_setup", safeElapsed);
        const handshakePhase = clamp(progress / 0.46, 0, 1);
        const sessionPhase = clamp((progress - 0.42) / 0.58, 0, 1);
        setPanelState(browserPanel, 0.84, palette.browserBase, { forceVisible: true });
        setPanelState(serverPanel, 0.84, palette.serverBase, { forceVisible: true });
        setPanelState(certificatePanel, 0.5, palette.certBase, { forceVisible: true });
        setPanelState(tlsLayerPanel, 1, palette.tlsBase, { forceVisible: true });
        setPanelState(httpLayerPanel, 0.36, palette.httpBase, { forceVisible: true });
        setTransitNodeState(wifiNode, 0.44, palette.networkBase);
        setTransitNodeState(routerNode, 0.44, palette.networkBase);
        setTransitNodeState(internetNode, 0.44, palette.networkBase);
        setBoardState(noteBoard, handshakeBoardText, 0.94);
        setPathState(handshakeRail, 0.88, palette.keyBase);
        setPathState(sessionLeftRail, sessionPhase * 0.88, palette.keyBase);
        setPathState(sessionRightRail, sessionPhase * 0.88, palette.keyBase);
        setPathState(protectedFlowRail, 0.42 + (sessionPhase * 0.34), palette.shieldBase);
        laneShieldLabel.setAlpha(progress > 0.46 ? 0.72 : 0.42);
        updateLabelText(laneShieldLabel, progress > 0.46 ? "TLS-Tunnel wird aktiv" : "Kurzer TLS-Handshake");
        updateLabelText(browserPanel.contentLabel, progress < 0.46 ? "Client Hello\nwill HTTPS" : "Sitzungsschluessel\nist bereit");
        updateLabelText(serverPanel.contentLabel, progress < 0.46 ? "Server Hello\nTLS bereit" : "sicherer Tunnel\nsteht");
        updateLabelText(tlsLayerPanel.contentLabel, progress < 0.46 ? "kurzer Aufbau" : "Tunnel + Sitzung");
        if (progress < 0.46) {
          setTokenState(sessionKeyToken, {
            visible: true,
            position: handshakeRail.sampler.sample(handshakePhase),
            alpha: 0.98,
            color: palette.keyBase,
            text: "Handshake"
          });
        } else {
          setTokenState(sessionKeyToken, {
            visible: true,
            position: keyHubPosition,
            alpha: 0.96,
            color: palette.keyBase,
            text: "Session Key"
          });
          setTokenState(browserKeyToken, {
            visible: true,
            position: browserSessionPosition,
            alpha: 0.52 + (sessionPhase * 0.44),
            color: palette.keyBase
          });
          setTokenState(serverKeyToken, {
            visible: true,
            position: serverSessionPosition,
            alpha: 0.52 + (sessionPhase * 0.44),
            color: palette.keyBase
          });
          setTokenState(cipherToken, {
            visible: sessionPhase > 0.22,
            position: protectedFlowRail.sampler.sample(clamp((sessionPhase - 0.22) / 0.62, 0, 1)),
            alpha: clamp((sessionPhase - 0.22) / 0.22, 0, 1),
            color: palette.ciphertext,
            text: "Datenstrom"
          });
        }
        setTokenState(httpsLockToken, {
          visible: true,
          position: positions.browser.add(new BABYLON.Vector3(1.45, 4.38, 0.12)),
          alpha: 0.72 + (sessionPhase * 0.24),
          color: palette.shieldBase
        });
      } else if (activeCueId === "cue_protected_data") {
        const progress = cueProgress("cue_protected_data", safeElapsed);
        setPanelState(browserPanel, 0.92, palette.browserBase, { forceVisible: true });
        setPanelState(serverPanel, 0.92, palette.serverBase, { forceVisible: true });
        setPanelState(tlsLayerPanel, 1, palette.tlsBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.9, palette.attackerBase, { forceVisible: true });
        setTransitNodeState(wifiNode, 0.76, palette.networkBase);
        setTransitNodeState(routerNode, 0.84, palette.networkBase);
        setTransitNodeState(internetNode, 0.76, palette.networkBase);
        setBoardState(noteBoard, protectedBoardText, 0.94);
        setPathState(protectedFlowRail, 0.98, palette.shieldBase);
        setPathState(attackerTapRail, 0.7, palette.attackerBase);
        setPathState(sessionLeftRail, 0.74, palette.keyBase);
        setPathState(sessionRightRail, 0.74, palette.keyBase);
        laneShieldLabel.setAlpha(0.86);
        updateLabelText(laneShieldLabel, "Verschluesselte HTTPS-Verbindung");
        updateLabelText(browserPanel.contentLabel, `${loginPlainText}\n${cookieText}`);
        updateLabelText(serverPanel.contentLabel, "entschluesselt\nund verarbeitet");
        updateLabelText(attackerPanel.contentLabel, "sieht nur Geheimtext-\nPakete");
        setTokenState(httpsLockToken, {
          visible: true,
          position: positions.browser.add(new BABYLON.Vector3(1.45, 4.38, 0.12)),
          alpha: 0.96,
          color: palette.shieldBase
        });
        setTokenState(sessionKeyToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.94,
          color: palette.keyBase,
          text: "Session Key"
        });
        setTokenState(browserKeyToken, {
          visible: true,
          position: browserSessionPosition,
          alpha: 0.94,
          color: palette.keyBase
        });
        setTokenState(serverKeyToken, {
          visible: true,
          position: serverSessionPosition,
          alpha: 0.94,
          color: palette.keyBase
        });
        setTokenState(cipherToken, {
          visible: true,
          position: protectedFlowRail.sampler.sample((progress * 1.08) % 1),
          alpha: 0.96,
          color: palette.ciphertext,
          text: "Login"
        });
        setTokenState(formToken, {
          visible: true,
          position: protectedFlowRail.sampler.sample((progress * 1.08 + 0.28) % 1),
          alpha: 0.94,
          color: palette.ciphertext,
          text: "Formular"
        });
        setTokenState(cookieToken, {
          visible: true,
          position: protectedFlowRail.sampler.sample((progress * 1.08 + 0.56) % 1),
          alpha: 0.94,
          color: palette.ciphertext,
          text: "Cookie"
        });
        setTokenState(attackerCipherToken, {
          visible: true,
          position: attackerTapRail.sampler.sample(clamp((progress - 0.1) / 0.62, 0, 1)),
          alpha: 0.94,
          color: palette.ciphertext,
          text: cipherPacketText
        });
      } else if (activeCueId === "cue_limits") {
        const progress = cueProgress("cue_limits", safeElapsed);
        setPanelState(browserPanel, 0.72, palette.browserBase, { forceVisible: true });
        setPanelState(serverPanel, 0.72, palette.serverBase, { forceVisible: true });
        setPanelState(tlsLayerPanel, 0.96, palette.tlsBase, { forceVisible: true });
        setPanelState(httpLayerPanel, 0.34, palette.httpBase, { forceVisible: true });
        setPanelState(certificatePanel, 0.26, palette.certBase, { forceVisible: true });
        setPanelState(attackerPanel, 0.22, palette.attackerBase, { forceVisible: true });
        setTransitNodeState(wifiNode, 0.54, palette.networkBase);
        setTransitNodeState(routerNode, 0.54, palette.networkBase);
        setTransitNodeState(internetNode, 0.54, palette.networkBase);
        setBoardState(noteBoard, limitsBoardText, 0.94);
        laneShieldLabel.setAlpha(0.92);
        updateLabelText(laneShieldLabel, "Schutz nur auf der Leitung");
        setPathState(protectedFlowRail, 0.88, palette.shieldBase);
        setPathState(sessionLeftRail, 0.52, palette.keyBase);
        setPathState(sessionRightRail, 0.52, palette.keyBase);
        updateLabelText(browserPanel.contentLabel, "Schutz endet\nam Webserver");
        updateLabelText(serverPanel.contentLabel, "Inhalt kann\ntrotzdem problematisch sein");
        updateLabelText(attackerPanel.contentLabel, "Leitung geschuetzt");
        phishingBoard.setAlpha(clamp(progress / 0.28, 0, 1));
        malwareBoard.setAlpha(clamp((progress - 0.18) / 0.28, 0, 1));
        contentBoard.setAlpha(clamp((progress - 0.42) / 0.32, 0, 1));
        setTokenState(httpsLockToken, {
          visible: true,
          position: positions.browser.add(new BABYLON.Vector3(1.45, 4.38, 0.12)),
          alpha: 0.96,
          color: palette.shieldBase
        });
      } else if (activeCueId === "cue_summary") {
        const progress = cueProgress("cue_summary", safeElapsed);
        setPanelState(browserPanel, 0.84, palette.browserBase, { forceVisible: true });
        setPanelState(httpLayerPanel, 0.74, palette.httpBase, { forceVisible: true });
        setPanelState(tlsLayerPanel, 0.96, palette.tlsBase, { forceVisible: true });
        setPanelState(serverPanel, 0.84, palette.serverBase, { forceVisible: true });
        setPanelState(certificatePanel, 0.72, palette.certBase, { forceVisible: true });
        setTransitNodeState(wifiNode, 0.62, palette.networkBase);
        setTransitNodeState(routerNode, 0.7, palette.networkBase);
        setTransitNodeState(internetNode, 0.62, palette.networkBase);
        setBoardState(noteBoard, summaryBoardText, 0.94);
        quoteBoard.setAlpha(clamp((progress - 0.18) / 0.42, 0, 1));
        validBoard.setAlpha(0.76);
        setPathState(certRail, 0.52, palette.certBase);
        setPathState(handshakeRail, 0.58, palette.keyBase);
        setPathState(sessionLeftRail, 0.74, palette.keyBase);
        setPathState(sessionRightRail, 0.74, palette.keyBase);
        setPathState(protectedFlowRail, 0.94, palette.shieldBase);
        updateLabelText(browserPanel.contentLabel, "Browser + HTTPS");
        updateLabelText(serverPanel.contentLabel, "Webserver + TLS");
        setTokenState(httpsLockToken, {
          visible: true,
          position: positions.browser.add(new BABYLON.Vector3(1.45, 4.38, 0.12)),
          alpha: 0.96,
          color: palette.shieldBase
        });
        setTokenState(certificateToken, {
          visible: true,
          position: positions.certificate.add(new BABYLON.Vector3(0, -0.18, 0.36)),
          alpha: 0.96,
          color: palette.certBase,
          text: "CERT"
        });
        setTokenState(sessionKeyToken, {
          visible: true,
          position: keyHubPosition,
          alpha: 0.96,
          color: palette.keyBase,
          text: "Session Key"
        });
        setTokenState(cipherToken, {
          visible: true,
          position: protectedFlowRail.sampler.sample(0.08 + (progress * 0.78)),
          alpha: 0.96,
          color: palette.ciphertext,
          text: "HTTP-Daten"
        });
      }

      noteBoard.plane.position.y = positions.note.y + (Math.sin(safeElapsed * 0.00062) * 0.04);
      quoteBoard.plane.position.y = positions.note.y - 1.9 + (Math.sin(safeElapsed * 0.00074 + 0.4) * 0.03);
      validBoard.plane.position.y = positions.certificate.y - 2.0 + (Math.sin(safeElapsed * 0.00084 + 0.9) * 0.03);
      laneShieldLabel.plane.position.y = positions.network.y + 2.95 + (Math.sin(safeElapsed * 0.00072 + 1.1) * 0.04);
      wifiNode.root.rotation.z = Math.sin(safeElapsed * 0.0009) * 0.03;
      routerNode.root.rotation.y = Math.sin(safeElapsed * 0.0007) * 0.12;
      internetNode.root.rotation.y = safeElapsed * 0.00028;
      browserPanel.root.position.y = positions.browser.y + (Math.sin(safeElapsed * 0.00076) * 0.03);
      serverPanel.root.position.y = positions.server.y + (Math.sin(safeElapsed * 0.00076 + 0.8) * 0.03);
      attackerPanel.root.position.y = positions.attacker.y + (Math.sin(safeElapsed * 0.00068 + 1.6) * 0.03);
    }

    engine.runRenderLoop(() => {
      updateTlsHttpsVisualState();
      scene.render();
    });

    return Object.freeze({
      setElapsedMs(nextElapsedMs) {
        currentElapsedMs = clamp(nextElapsedMs, 0, durationMs);
      },
      applyCameraPose(nextPose) {
        return applyPoseToFreeCamera(nextPose);
      },
      setUserCameraEnabled(nextEnabled) {
        cameraState.userEnabled = Boolean(nextEnabled);
        if (!cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        updateCameraAttachment();
        return cameraState.userEnabled;
      },
      setJumpPlaybackEnabled(nextEnabled) {
        playerCameraState.jumpsEnabled = Boolean(nextEnabled);
        if (!cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        return playerCameraState.jumpsEnabled;
      },
      setPlayerPlaybackActive(nextEnabled) {
        playerCameraState.playbackActive = Boolean(nextEnabled);
        if (playerCameraState.playbackActive && !cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        return playerCameraState.playbackActive;
      },
      syncPlayerCameraToElapsed(nextElapsedMs = currentElapsedMs) {
        currentElapsedMs = clamp(nextElapsedMs, 0, durationMs);
        clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
        return syncPlayerCameraPose(currentElapsedMs);
      },
      previewPlayerCameraToCue(cueIndex = 0, previewDurationMs = 0) {
        const jumpSequence = getNormalizedPlayerJumpSequence();
        const targetEntry = jumpSequence[Math.max(0, Number(cueIndex) || 0)] || null;
        const nextEntry = targetEntry ? jumpSequence[(Math.max(0, Number(cueIndex) || 0)) + 1] || null : null;
        const durationHint = previewDurationMs || getPlayerJumpTransitionDuration(targetEntry, nextEntry) || 1100;
        return startPlayerCameraPreview(targetEntry?.pose || getBaseCameraPose(), durationHint);
      },
      setFreeFlyEnabled(nextEnabled) {
        cameraState.userEnabled = Boolean(nextEnabled);
        if (!cameraState.userEnabled) {
          clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
          syncPlayerCameraPose(currentElapsedMs);
        }
        updateCameraAttachment();
        return cameraState.userEnabled;
      },
      snapFreeCameraToCue() {
        focusCameraOnCurrentCue();
        return true;
      },
      getCameraPose() {
        return getCurrentFreeCameraPose();
      },
      getCueCameraConfig(referenceCamera = null) {
        return getFreeCameraCueConfig(referenceCamera);
      },
      isFreeFlyEnabled() {
        return cameraState.userEnabled;
      },
      resize() {
        engine.resize();
      },
      refreshTranslations() {
        refreshLabelTranslations();
      },
      dispose() {
        clearCameraPreview({ applyEndPose: false, restoreUserControl: false });
        freeCamera.detachControl(canvas);
        engine.stopRenderLoop();
        glowLayer.dispose();
        scene.dispose();
        engine.dispose();
      }
    });
  }

  async function mount(container, presentation, options = {}) {
    if (!(container instanceof HTMLElement)) {
      throw new Error(lt("Kein gueltiger Presenter-Container uebergeben."));
    }
    const entry = presentation && typeof presentation === "object" ? presentation : null;
    const presentationScenes = getPresentationScenes(entry);
    const primaryScene = presentationScenes[0] || null;
    const shouldAutoPlay = options.autoPlay === true;
    if (!primaryScene) {
      throw new Error(lt("Praesentationsdaten sind unvollstaendig."));
    }

    const durationMs = Math.max(1000, Number(primaryScene.durationMs || 1000));
    const cues = Array.isArray(primaryScene.cues) ? primaryScene.cues : [];
    const ttsSegments = Array.isArray(primaryScene.ttsSegments)
      ? primaryScene.ttsSegments.slice().sort((left, right) => Number(left?.startMs || 0) - Number(right?.startMs || 0))
      : [];
    const speaker = createSpeechController(ttsSegments, primaryScene.locale);

	    function getRuntimeNoteText() {
	      if (speaker.available) {
	        return shouldAutoPlay
	          ? t("presenter.note.autoplay_tts", "Die Praesentation startet direkt im Player. Ueber Control Panel kannst du optional eigene Scenes aufnehmen oder gespeicherte Scenes pruefen. Bei Pause setzt die Wiedergabe am naechsten sinnvollen Cue fort. Die freie Kamera bleibt aktiv: WASD oder Pfeile, Q/E diagonal vor, </X diagonal zurueck, Leertaste hoch, Shift runter, Maus zum Umschauen. Neu ausrichten setzt den Blick auf die aktuelle Cue-Perspektive.")
	          : t("presenter.note.manual_tts", "Die Praesentation startet bewusst manuell. Bei Pause setzt die Wiedergabe am naechsten sinnvollen Cue fort. Die freie Kamera bleibt aktiv: WASD oder Pfeile, Q/E diagonal vor, </X diagonal zurueck, Leertaste hoch, Shift runter, Maus zum Umschauen. Neu ausrichten setzt den Blick auf die aktuelle Cue-Perspektive.");
	      }
	      return shouldAutoPlay
	        ? t("presenter.note.autoplay_no_tts", "Die Praesentation laeuft auch ohne TTS direkt an. Ueber Control Panel kannst du optional eigene Scenes aufnehmen oder gespeicherte Scenes pruefen. Alle Sprecherinhalte bleiben als sichtbare Text-Cues erhalten. Die freie Kamera bleibt aktiv: WASD oder Pfeile, Q/E diagonal vor, </X diagonal zurueck, Leertaste hoch, Shift runter, Maus zum Umschauen. Neu ausrichten setzt den Blick auf die aktuelle Cue-Perspektive.")
	        : t("presenter.note.manual_no_tts", "Die Praesentation startet bewusst manuell und laeuft auch ohne TTS. Alle Sprecherinhalte bleiben als sichtbare Text-Cues erhalten. Die freie Kamera bleibt aktiv: WASD oder Pfeile, Q/E diagonal vor, </X diagonal zurueck, Leertaste hoch, Shift runter, Maus zum Umschauen. Neu ausrichten setzt den Blick auf die aktuelle Cue-Perspektive.");
	    }

    container.innerHTML = "";
    const root = createNode("section", "presenter-shell");
    const hero = createNode("section", "panel presenter-hero");
    const heroTop = createNode("div", "presenter-hero-top");
    const backButton = createNode("button", "btn-secondary presenter-back-button presenter-back-icon", "←");
    backButton.setAttribute("title", t("presenter.button.back", "Zur Uebersicht"));
    backButton.type = "button";
    const heroTitle = createNode("strong", "presenter-hero-inline-title", lt(entry.title || "Praesentation"));
    const jumpEditorToolbar = createNode("div", "presenter-hero-actions");
    const jumpEditorButton = createNode("button", "btn-secondary presenter-control-button presenter-hero-action presenter-jump-editor-button");
    jumpEditorButton.type = "button";
    const studioPanelButton = createNode("button", "btn-secondary presenter-control-button presenter-control-panel-button presenter-hero-action presenter-jump-toggle-button");
    studioPanelButton.type = "button";
    studioPanelButton.hidden = true;
    const heroAudioButton = createNode("button", "btn-secondary presenter-control-button presenter-audio-toggle presenter-toolbar-icon-button");
    heroAudioButton.type = "button";
    heroAudioButton.setAttribute("aria-label", lt("Ton umschalten"));
    heroAudioButton.setAttribute("title", lt("Ton umschalten"));
    jumpEditorToolbar.append(jumpEditorButton, studioPanelButton);
    heroTop.append(backButton, heroTitle, jumpEditorToolbar);
    hero.append(heroTop);
    const rendererPill = null;

    const player = createNode("section", "panel presenter-player");
    const stageFrame = createNode("div", "presenter-stage-frame");
    const canvasWrap = createNode("div", "presenter-canvas-wrap");
    const canvas = createNode("canvas", "presenter-canvas");
    canvas.setAttribute("aria-label", t("presenter.aria.canvas_scene", "{title} Szene", {
      title: lt(entry.title || "Praesentation")
    }));
    canvas.tabIndex = 0;
    canvasWrap.appendChild(canvas);
    const stageOverlay = createNode("div", "presenter-stage-overlay");
    stageOverlay.setAttribute("aria-live", "polite");
    const overlayCaption = createNode("p", "presenter-stage-caption", lt(entry.summary || ""));
    stageOverlay.append(overlayCaption);
    const stagePlayOverlay = createNode("button", "presenter-stage-play-overlay");
    stagePlayOverlay.type = "button";
    stagePlayOverlay.setAttribute("aria-label", lt("Player starten"));
    const stagePlayIcon = createNode("span", "presenter-stage-play-icon", "▶");
    stagePlayOverlay.appendChild(stagePlayIcon);
    const stageControls = createNode("div", "presenter-video-controls");
    stageControls.setAttribute("aria-label", lt("Videosteuerung"));
    stageFrame.dataset.controlsVisible = "true";
    stageFrame.dataset.fullscreenActive = "false";
    stageFrame.dataset.playState = "idle";
    stageFrame.append(canvasWrap, stageOverlay, stageControls);

    const controlRow = createNode("div", "presenter-control-row");
    const controlLeft = createNode("div", "presenter-control-group presenter-control-group-left");
    const controlRight = createNode("div", "presenter-control-group presenter-control-group-right");
    const playButton = createNode("button", "btn-primary presenter-control-button presenter-toolbar-icon-button");
    playButton.type = "button";
    playButton.disabled = true;
    const restartButton = createNode("button", "btn-secondary presenter-control-button presenter-toolbar-icon-button");
    restartButton.type = "button";
    restartButton.disabled = true;
    const freeFlyButton = createNode("button", "btn-secondary presenter-control-button presenter-freefly-button presenter-toolbar-icon-button");
    freeFlyButton.type = "button";
    freeFlyButton.disabled = true;
    const fullscreenButton = createNode("button", "btn-secondary presenter-control-button presenter-fullscreen-button presenter-toolbar-icon-button");
    fullscreenButton.type = "button";
    fullscreenButton.disabled = true;
    const cameraModeHint = createNode("span", "presenter-meta-pill presenter-control-hint", lt("Freie Kamera aktiv"));
    cameraModeHint.dataset.mode = "freefly";
    cameraModeHint.hidden = true;
    const sequencePill = createNode("span", "presenter-meta-pill presenter-sequence-pill", "");
    sequencePill.hidden = true;
    const statusBadge = createNode("span", "presenter-status-badge", lt("Lade Babylon.js"));
    statusBadge.dataset.tone = "loading";
    function setPlayButtonUi(label, icon = "play") {
      setPresenterButtonContent(playButton, {
        icon,
        iconOnly: true,
        accessibleLabel: label,
        title: label
      });
    }
    function setRestartButtonUi(label) {
      setPresenterButtonContent(restartButton, {
        icon: "restart",
        iconOnly: true,
        accessibleLabel: label,
        title: label
      });
    }
    function setFreeFlyButtonUi(label) {
      setPresenterButtonContent(freeFlyButton, {
        icon: "recenter",
        iconOnly: true,
        accessibleLabel: label,
        title: label
      });
    }
    function setJumpToolbarSecondaryButtonUi(isEditing, jumpsEnabled) {
      if (isEditing) {
        setPresenterButtonContent(studioPanelButton, {
          icon: "cancel",
          label: lt("Abbrechen")
        });
        return;
      }
      const jumpsActive = Boolean(jumpsEnabled);
      setPresenterButtonContent(studioPanelButton, {
        icon: jumpsActive ? "jumps-on" : "jumps-off",
        label: lt(jumpsActive ? "Jumps deaktivieren" : "Jumps aktivieren")
      });
    }
    function setJumpEditorPrimaryButtonUi(isEditing) {
      setPresenterButtonContent(jumpEditorButton, {
        icon: isEditing ? "save" : "edit",
        label: lt(isEditing ? "Jumps speichern" : "Jumps bearbeiten")
      });
    }
    function setFullscreenButtonUi(label, isActive) {
      setPresenterButtonContent(fullscreenButton, {
        icon: isActive ? "fullscreen-exit" : "fullscreen-enter",
        iconOnly: true,
        accessibleLabel: label,
        title: label
      });
    }
    setPlayButtonUi(lt("Lade Szene ..."), "loading");
    setRestartButtonUi(lt("Neu starten"));
    setFreeFlyButtonUi(lt("Neu ausrichten"));
    setJumpEditorPrimaryButtonUi(false);
    setJumpToolbarSecondaryButtonUi(false, true);
    setFullscreenButtonUi(lt("Vollbild"), false);
    setPresenterButtonContent(heroAudioButton, {
      icon: "volume-on",
      iconOnly: true,
      accessibleLabel: lt("Ton umschalten"),
      title: lt("Ton umschalten")
    });
    controlLeft.append(playButton, restartButton, sequencePill);
    controlRight.append(cameraModeHint, statusBadge, freeFlyButton, heroAudioButton, fullscreenButton);

    const timelineBlock = createNode("div", "presenter-timeline-block");
    const timeText = createNode("div", "presenter-time-label", `00:00 / ${formatDurationLabel(durationMs)}`);
    const timeline = createNode("div", "presenter-timeline");
    timeline.tabIndex = 0;
    timeline.setAttribute("role", "slider");
    timeline.setAttribute("aria-label", lt("Animationsfortschritt"));
    timeline.setAttribute("aria-valuemin", "0");
    timeline.setAttribute("aria-valuemax", String(durationMs));
    const timelineFill = createNode("span", "presenter-timeline-fill");
    timeline.appendChild(timelineFill);
    let timelineMarkers = [];
    timelineBlock.append(timeText, timeline);

    const cueGrid = createNode("section", "presenter-cue-grid");
    let cueCards = [];

    controlRow.append(controlLeft, controlRight);
    stageControls.append(timelineBlock, controlRow);
    const stageLayout = createNode("div", "presenter-stage-layout");
    stageLayout.dataset.jumpsEnabled = "true";
    player.append(stageFrame);
    stageLayout.append(player, cueGrid);
    root.append(hero, stageLayout);
    container.appendChild(root);

    let destroyed = false;
    let runtimeHandle = null;
    let frameId = 0;
    let resizeHandler = null;
    let rendererPillSource = "Renderer: wird geladen";
    let statusBadgeSource = { text: "Lade Babylon.js" };
    let speakerMuted = false;
    const state = {
      status: "loading",
      startStamp: 0,
      pausedElapsedMs: 0,
      elapsedMs: 0,
      activeCueId: "",
      freeFlyEnabled: true,
      jumpsEnabled: true
    };
    function focusStageCanvas() {
      if (typeof canvas.focus !== "function") return;
      try {
        canvas.focus({ preventScroll: true });
      } catch {
        canvas.focus();
      }
    }
    const cueSegmentPlayback = {
      active: false,
      cueIndex: -1,
      stopAtMs: 0
    };
    const jumpEditorState = {
      active: false,
      draftCues: []
    };
    const studioStore = typeof global.PresentationStudioStore?.createStore === "function"
      ? global.PresentationStudioStore.createStore({
        presentationId: entry.presentationId || entry.id,
        presentationName: entry.name || entry.title,
        presentationTitle: entry.title || entry.name,
        initialPresentation: entry
      })
      : null;
    const studioRecorder = typeof global.PresentationStudioRecorder?.createRecorder === "function"
      ? global.PresentationStudioRecorder.createRecorder({
        now: () => global.performance.now(),
        capturePose: () => runtimeHandle?.getCameraPose?.() || null
      })
      : null;
    let studioUnsubscribe = null;
    const studioUi = typeof global.PresentationStudioUi?.createUi === "function"
      ? global.PresentationStudioUi.createUi({
        compactPanel: true,
        onToggleStudioPanel: handleStudioToggle,
        onStartPlayer: handleStudioStartPlayer,
        onCreateScene: handleStudioCreateScene,
        onRenameDraftScene: handleStudioRenameScene,
        onStartRecording: handleStudioStartRecording,
        onStopRecording: handleStudioStopRecording,
        onSaveDraftScene: handleStudioSaveScene,
        onDiscardDraftScene: handleStudioDiscardScene,
        onPlaySavedScene: handleStudioPlaySavedScene,
        onPlayAllScenes: handleStudioPlayAllScenes,
        onStopSceneSequence: handleStudioStopSceneSequence,
        onEditSavedScene: handleStudioEditSavedScene,
        onDeleteSavedScene: handleStudioDeleteSavedScene,
        onSavePresentationToLibrary: handleSavePresentationToLibrary,
        onCreatePresentation: handleCreatePresentation,
        onLoadPresentation: handleLoadPresentation,
        onDeletePresentation: handleDeletePresentation,
        onSelectProjectFolder: handleSelectProjectFolder,
        onProjectFolderChange: handleProjectFolderChange
      })
      : null;
    const studioScenePlayback = {
      sceneId: "",
      scene: null,
      queue: [],
      mode: "single",
      sequenceIndex: 0,
      sequenceTotal: 0,
      startedAtMs: 0,
      elapsedMs: 0,
      completionTimerId: 0
    };
    const studioRecorderState = {
      mode: "player",
      editorStatus: "idle",
      activeSceneId: "",
      activeSpanId: "",
      recordingStartedAtMs: 0
    };
    let projectFolderPath = "Presentations";

    if (studioUi) {
      stageFrame.appendChild(studioUi.root);
    }

    function cloneCueCameraConfig(source = null) {
      const safeSource = source && typeof source === "object" ? source : {};
      const fallbackTarget = Array.isArray(primaryScene?.camera?.target) ? primaryScene.camera.target : [0, 2.8, 0];
      const targetSource = Array.isArray(safeSource.target)
        ? safeSource.target
        : fallbackTarget;
      return {
        alpha: Number.isFinite(Number(safeSource.alpha)) ? Number(safeSource.alpha) : Number(primaryScene?.camera?.alpha || -1.08),
        beta: Number.isFinite(Number(safeSource.beta)) ? Number(safeSource.beta) : Number(primaryScene?.camera?.beta || 1.05),
        radius: Math.max(0.1, Number(safeSource.radius || primaryScene?.camera?.radius || 18)),
        target: [
          Number(targetSource[0] || 0),
          Number(targetSource[1] || 0),
          Number(targetSource[2] || 0)
        ]
      };
    }

    function getCueStartMs(cue, index = 0) {
      const safeCue = cue && typeof cue === "object" ? cue : {};
      return clamp(index === 0 ? 0 : Number(safeCue.startMs || 0), 0, durationMs);
    }

    function getCueEndMs(cue, index = 0, cueList = cues) {
      const safeCue = cue && typeof cue === "object" ? cue : {};
      const startMs = getCueStartMs(safeCue, index);
      const safeCueList = Array.isArray(cueList) ? cueList : [];
      const nextCue = safeCueList[index + 1] || null;
      const fallbackEndMs = nextCue ? getCueStartMs(nextCue, index + 1) : durationMs;
      const requestedEndMs = Number(safeCue.endMs);
      if (Number.isFinite(requestedEndMs) && requestedEndMs > startMs) {
        return clamp(requestedEndMs, startMs, durationMs);
      }
      return clamp(fallbackEndMs, startMs, durationMs);
    }

    function clearCueSegmentPlayback() {
      cueSegmentPlayback.active = false;
      cueSegmentPlayback.cueIndex = -1;
      cueSegmentPlayback.stopAtMs = 0;
    }

    function getCueSegmentStopMs(cueIndex = 0, cueList = cues) {
      const safeCueList = Array.isArray(cueList) ? cueList : [];
      const safeIndex = Math.max(0, Number(cueIndex) || 0);
      const currentCue = safeCueList[safeIndex] || null;
      if (!currentCue) return null;
      const cueStart = getCueStartMs(currentCue, safeIndex);
      const nextCue = safeCueList[safeIndex + 1] || null;
      if (!nextCue) return durationMs;
      const nextCueStart = getCueStartMs(nextCue, safeIndex + 1);
      return clamp(Math.max(cueStart, nextCueStart - 1), cueStart, durationMs);
    }

    function cloneCueDraft(cue, index = 0, cueList = cues) {
      const safeCue = cue && typeof cue === "object" ? cue : {};
      return {
        id: String(safeCue.id || `cue-${String(index + 1).padStart(3, "0")}`),
        nodeId: String(safeCue.nodeId || ""),
        title: String(safeCue.title || safeCue.nodeId || `Cue ${index + 1}`),
        caption: String(safeCue.caption || ""),
        startMs: getCueStartMs(safeCue, index),
        endMs: getCueEndMs(safeCue, index, cueList),
        camera: cloneCueCameraConfig(safeCue.camera)
      };
    }

    function cloneCueDrafts(sourceCues = cues) {
      const safeCueList = Array.isArray(sourceCues) ? sourceCues : [];
      return safeCueList.map((cue, index) => cloneCueDraft(cue, index, safeCueList));
    }

    function getRenderableCues() {
      return jumpEditorState.active ? jumpEditorState.draftCues : cues;
    }

    function updateJumpEditorToolbar() {
      const studioSnapshot = getStudioSnapshot();
      const hasStudioConflict = Boolean(studioSnapshot.draftScene)
        || (Boolean(studioRecorder) && typeof studioRecorder.isRecording === "function" && studioRecorder.isRecording())
        || isStudioScenePlaybackActive();
      const hasCues = cues.length > 0;
      const canEdit = jumpEditorState.active
        || (
          hasCues
          && state.status !== "loading"
          && state.status !== "error"
          && !hasStudioConflict
        );
      const shouldShowJumpEditorButton = hasCues && (state.jumpsEnabled || jumpEditorState.active);
      jumpEditorToolbar.hidden = !hasCues;
      jumpEditorButton.hidden = !shouldShowJumpEditorButton;
      jumpEditorButton.disabled = !canEdit || !shouldShowJumpEditorButton;
      studioPanelButton.hidden = !hasCues;
      studioPanelButton.disabled = jumpEditorState.active ? false : state.status === "loading" || state.status === "error";
      studioPanelButton.classList.toggle("is-active", Boolean(!jumpEditorState.active && state.jumpsEnabled && hasCues));
      setJumpEditorPrimaryButtonUi(jumpEditorState.active);
      setJumpToolbarSecondaryButtonUi(jumpEditorState.active, state.jumpsEnabled);
    }

    function syncCueDraftToLiveCue(targetCue, draftCue) {
      if (!targetCue || !draftCue) return;
      targetCue.title = String(draftCue.title || draftCue.nodeId || targetCue.nodeId || "Cue").trim();
      targetCue.caption = String(draftCue.caption || "");
      targetCue.camera = cloneCueCameraConfig(draftCue.camera);
    }

    function focusCueAtTime(cue, cueIndex = 0) {
      if (state.status === "loading" || state.status === "error") return false;
      if (getStudioSnapshot().draftScene || isStudioScenePlaybackActive()) return false;
      const cueStart = getCueStartMs(cue, cueIndex);
      if (state.status === "playing") {
        seekPlayback(cueStart);
      } else {
        seekPlayback(cueStart, { skipCameraSync: true });
        runtimeHandle?.previewPlayerCameraToCue?.(cueIndex);
      }
      focusStageCanvas();
      setStatusBadge(`Cue ${formatDurationLabel(cueStart)} positioniert`, "ready");
      return true;
    }

    function playCueSegment(cue, cueIndex = 0) {
      if (state.status === "loading" || state.status === "error") return false;
      if (jumpEditorState.active) return false;
      if (getStudioSnapshot().draftScene || isStudioScenePlaybackActive()) return false;
      const renderableCues = getRenderableCues();
      const safeIndex = Math.max(0, Number(cueIndex) || 0);
      const activeCue = cue || renderableCues[safeIndex] || null;
      if (!activeCue) return false;
      const cueStart = getCueStartMs(activeCue, safeIndex);
      const stopAtMs = getCueSegmentStopMs(safeIndex, renderableCues);
      if (!Number.isFinite(stopAtMs)) return false;
      const hasFollowingCue = Boolean(renderableCues[safeIndex + 1]);
      if (hasFollowingCue && stopAtMs <= cueStart) {
        seekPlayback(cueStart);
        setStatusBadge("Zwischen diesen Jumps liegt kein Abspielraum", "pause");
        return false;
      }
      seekPlayback(cueStart);
      clearCueSegmentPlayback();
      cueSegmentPlayback.active = stopAtMs < durationMs;
      cueSegmentPlayback.cueIndex = safeIndex;
      cueSegmentPlayback.stopAtMs = stopAtMs;
      if (state.status !== "playing") {
        playPlayback();
      }
      focusStageCanvas();
      return true;
    }

    function renderTimelineMarkers() {
      timelineMarkers.forEach((entryMarker) => {
        entryMarker?.marker?.remove?.();
      });
      const renderableCues = getRenderableCues();
      timelineMarkers = renderableCues.map((cue, index) => {
        const marker = createNode("span", "presenter-timeline-marker");
        const startMs = getCueStartMs(cue, index);
        const endMs = getCueEndMs(cue, index, renderableCues);
        const startPct = clamp((startMs / durationMs) * 100, 0, 100);
        const widthPct = clamp(((endMs - startMs) / durationMs) * 100, 4, 100);
        marker.style.left = `${startPct}%`;
        marker.style.width = `${widthPct}%`;
        marker.title = lt(String(cue.title || cue.nodeId || "Cue"));
        timeline.appendChild(marker);
        return { cue, marker, index };
      });
    }

    function createCueEditorField(labelText, fieldNode) {
      const wrapper = createNode("label", "presenter-cue-editor-field");
      const label = createNode("span", "presenter-cue-editor-label", labelText);
      wrapper.append(label, fieldNode);
      return wrapper;
    }

    function renderCueGrid() {
      cueGrid.replaceChildren();
      cueCards = getRenderableCues().map((cue, index) => {
        const card = createNode("article", "presenter-cue-card");
        let cuePlayButton = null;
        const cueTime = createNode("span", "presenter-cue-card-time", formatDurationLabel(getCueStartMs(cue, index)));
        if (jumpEditorState.active) {
          card.classList.add("is-editing");
          const cueNode = createNode("span", "presenter-cue-editor-node", lt(cue.nodeId || cue.id || `Jump ${index + 1}`));
          const header = createNode("div", "presenter-cue-editor-header");
          header.append(cueTime, cueNode);

          const titleInput = document.createElement("input");
          titleInput.className = "presenter-cue-editor-input";
          titleInput.type = "text";
          titleInput.value = String(cue.title || "");
          titleInput.placeholder = lt("Jump-Titel");
          titleInput.addEventListener("input", () => {
            cue.title = titleInput.value;
            if (timelineMarkers[index]?.marker) {
              timelineMarkers[index].cue = cue;
              timelineMarkers[index].marker.title = lt(String(cue.title || cue.nodeId || "Cue"));
            }
            renderCueState(state.elapsedMs);
          });

          const copyInput = document.createElement("textarea");
          copyInput.className = "presenter-cue-editor-textarea";
          copyInput.rows = 4;
          copyInput.placeholder = lt("Jump-Text");
          copyInput.value = String(cue.caption || "");
          copyInput.addEventListener("input", () => {
            cue.caption = copyInput.value;
            renderCueState(state.elapsedMs);
          });

          const actionRow = createNode("div", "presenter-cue-editor-actions");
          const rememberCameraButton = createNode("button", "btn-secondary presenter-control-button presenter-cue-editor-action");
          rememberCameraButton.type = "button";
          setPresenterButtonContent(rememberCameraButton, {
            icon: "camera-save",
            label: lt("Kameraposition merken")
          });
          const cameraHint = createNode("p", "presenter-cue-editor-camera-copy", lt("Merkt Position und Blickrichtung der aktuellen freien Kamera."));

          rememberCameraButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!runtimeHandle?.getCueCameraConfig) {
              setStatusBadge("Kamera noch nicht bereit", "error");
              return;
            }
            cue.camera = cloneCueCameraConfig(runtimeHandle.getCueCameraConfig(cue.camera));
            cameraHint.textContent = lt("Aktuelle Kameraposition fuer diesen Jump gemerkt.");
            setStatusBadge(`Kamera fuer ${cue.title || cue.nodeId || "Jump"} gemerkt`, "ready");
          });

          actionRow.append(rememberCameraButton);
          card.append(
            header,
            createCueEditorField(lt("Titel"), titleInput),
            createCueEditorField(lt("Text"), copyInput),
            actionRow,
            cameraHint
          );
        } else {
          const cueTitle = createNode("strong", "presenter-cue-card-title", lt(cue.title || cue.nodeId || "Cue"));
          const cueCopy = createNode("p", "presenter-cue-card-copy", lt(cue.caption || ""));
          const actionRow = createNode("div", "presenter-cue-card-actions");
          cuePlayButton = createNode("button", "btn-secondary presenter-control-button presenter-cue-card-action");
          cuePlayButton.type = "button";
          setPresenterButtonContent(cuePlayButton, {
            icon: "play",
            label: lt("Ab hier spielen"),
            accessibleLabel: lt(`Ab ${cue.title || cue.nodeId || "diesem Jump"} bis zum naechsten Jump abspielen`),
            title: lt("Bis zum naechsten Jump abspielen")
          });
          cuePlayButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            playCueSegment(cue, index);
          });
          actionRow.append(cuePlayButton);
          card.append(cueTime, cueTitle);
          if (cueCopy.textContent) card.appendChild(cueCopy);
          card.appendChild(actionRow);
          card.addEventListener("click", () => {
            focusCueAtTime(cue, index);
          });
        }
        cueGrid.appendChild(card);
        return { cue, card, index, cuePlayButton };
      });
      renderCueState(state.elapsedMs);
    }

    function persistJumpEdits() {
      const presenterDataApi = global.PresenterData;
      if (!presenterDataApi || typeof presenterDataApi.saveLocalPresentation !== "function") {
        return null;
      }
      const activePresentationId = String(entry.presentationId || entry.id || "").trim();
      const currentLocalEntry = getLocalPresentationEntries().find((item) => String(item?.presentationId || "").trim() === activePresentationId) || null;
      const folderPath = String(currentLocalEntry?.folderPath || projectFolderPath || "Presentations").trim() || "Presentations";
      return presenterDataApi.saveLocalPresentation(entry, { folderPath });
    }

    function cancelJumpEditMode() {
      if (!jumpEditorState.active) return;
      jumpEditorState.active = false;
      jumpEditorState.draftCues = [];
      renderTimelineMarkers();
      renderCueGrid();
      updateButtons();
      updateJumpEditorToolbar();
      setStatusBadge("Jump-Bearbeitung abgebrochen", "pause");
    }

    function saveJumpEditMode() {
      if (!jumpEditorState.active) return;
      if (jumpEditorState.draftCues[0]) {
        jumpEditorState.draftCues[0].startMs = 0;
      }
      jumpEditorState.draftCues.forEach((draftCue, index) => {
        syncCueDraftToLiveCue(cues[index], draftCue);
      });
      if (cues[0]) {
        cues[0].startMs = 0;
      }
      jumpEditorState.active = false;
      jumpEditorState.draftCues = [];
      entry.updatedAt = Date.now();
      if (primaryScene && typeof primaryScene === "object") {
        primaryScene.updatedAt = Date.now();
        primaryScene.cameraSpans = [];
      }
      if (entry.scene && typeof entry.scene === "object") {
        entry.scene.cameraSpans = [];
      }
      persistJumpEdits();
      renderTimelineMarkers();
      renderCueGrid();
      renderProgress(state.elapsedMs);
      updateButtons();
      updateJumpEditorToolbar();
      setStatusBadge("Jumps gespeichert", "complete");
    }

    function enterJumpEditMode() {
      if (state.status === "loading" || state.status === "error") return;
      const studioSnapshot = getStudioSnapshot();
      const hasStudioConflict = Boolean(studioSnapshot.draftScene)
        || (Boolean(studioRecorder) && typeof studioRecorder.isRecording === "function" && studioRecorder.isRecording())
        || isStudioScenePlaybackActive();
      if (hasStudioConflict) {
        setStatusBadge("Jump-Bearbeitung ist waehrend Scene-Playback oder Studio-Aufnahmen nicht verfuegbar", "pause");
        return;
      }
      if (state.status === "playing") {
        pausePlayback();
      }
      jumpEditorState.active = true;
      jumpEditorState.draftCues = cloneCueDrafts(cues);
      state.jumpsEnabled = true;
      renderTimelineMarkers();
      renderCueGrid();
      updateButtons();
      updateJumpEditorToolbar();
      setPlayerChromeVisible(true);
      setStatusBadge("Jump-Bearbeitung aktiv", "pause");
    }

    function setRendererPillText(text) {
      rendererPillSource = String(text || "").trim() || "Renderer: wird geladen";
      if (rendererPill) {
        rendererPill.textContent = lt(rendererPillSource);
      }
    }

    function resolveStatusBadgeText() {
      if (statusBadgeSource && statusBadgeSource.key) {
        const params = statusBadgeSource.params && typeof statusBadgeSource.params === "object"
          ? Object.fromEntries(
              Object.entries(statusBadgeSource.params).map(([key, value]) => [key, typeof value === "string" ? lt(value) : value])
            )
          : null;
        return t(statusBadgeSource.key, statusBadgeSource.fallback || statusBadgeSource.key, params);
      }
      return lt(statusBadgeSource?.text || "Bereit");
    }

    function getStudioRecorderStateSnapshot() {
      return Object.freeze({
        mode: String(studioRecorderState.mode || "player"),
        editorStatus: String(studioRecorderState.editorStatus || "idle"),
        activeSceneId: String(studioRecorderState.activeSceneId || ""),
        activeSpanId: String(studioRecorderState.activeSpanId || ""),
        recordingStartedAtMs: clamp(studioRecorderState.recordingStartedAtMs || 0, 0, Number.MAX_SAFE_INTEGER)
      });
    }

    function syncStudioRecorderState(snapshot = getStudioSnapshot(), overrides = {}) {
      const safeSnapshot = snapshot && typeof snapshot === "object" ? snapshot : {};
      const draftScene = safeSnapshot.draftScene || null;
      const activeRecording = studioRecorder?.getActiveRecordingSnapshot?.() || null;
      const draftSpanCount = Array.isArray(draftScene?.cameraSpans) ? draftScene.cameraSpans.length : 0;
      const snapshotPlayingSceneId = String(safeSnapshot.playingSceneId || "").trim();
      const savedSceneIds = new Set(
        getSnapshotScenes(safeSnapshot)
          .map((scene) => String(scene?.sceneId || "").trim())
          .filter(Boolean)
      );
      const preserveSavedState = (
        !draftScene &&
        !activeRecording &&
        String(studioRecorderState.editorStatus || "") === "saved" &&
        savedSceneIds.has(String(studioRecorderState.activeSceneId || "").trim())
      );
      let nextEditorStatus = activeRecording
        ? "recording"
        : (draftScene ? (draftSpanCount ? "dirty" : "idle") : (preserveSavedState ? "saved" : "idle"));
      if (overrides.editorStatus) {
        nextEditorStatus = String(overrides.editorStatus).trim().toLowerCase() || nextEditorStatus;
      }
      studioRecorderState.mode = draftScene ? "editor" : "player";
      if (Object.prototype.hasOwnProperty.call(overrides, "mode")) {
        studioRecorderState.mode = String(overrides.mode || studioRecorderState.mode).trim().toLowerCase() || studioRecorderState.mode;
      }
      studioRecorderState.editorStatus = nextEditorStatus;
      const fallbackActiveSceneId = snapshotPlayingSceneId || (preserveSavedState ? studioRecorderState.activeSceneId : "");
      studioRecorderState.activeSceneId = String(
        overrides.activeSceneId ??
        draftScene?.sceneId ??
        fallbackActiveSceneId ??
        ""
      ).trim();
      studioRecorderState.activeSpanId = String(overrides.activeSpanId ?? activeRecording?.spanId ?? "").trim();
      studioRecorderState.recordingStartedAtMs = clamp(
        overrides.recordingStartedAtMs ?? activeRecording?.startedAtMs ?? 0,
        0,
        Number.MAX_SAFE_INTEGER
      );
      return getStudioRecorderStateSnapshot();
    }

    function setPlayerChromeVisible(nextVisible) {
      stageFrame.dataset.controlsVisible = nextVisible ? "true" : "false";
    }

    function getOverlayPlayEligibility() {
      const studioSnapshot = getStudioSnapshot();
      if (studioSnapshot.studioPanelOpen || studioSnapshot.draftScene || studioRecorder?.isRecording()) {
        return { show: false, allowClick: false };
      }
      const status = String(state.status || "").trim().toLowerCase();
      const show = status !== "playing";
      return { show, allowClick: show };
    }

    function updateStagePlayOverlay() {
      stagePlayOverlay.hidden = true;
      stagePlayOverlay.disabled = true;
    }

    function getVerificationSnapshot() {
      if (isStudioScenePlaybackActive()) {
        updateStudioScenePlaybackFrame();
      }
      const snapshot = getStudioSnapshot();
      return Object.freeze({
        autoPlayEnabled: shouldAutoPlay,
        runtimeReady: Boolean(runtimeHandle),
        playerStatus: String(state.status || ""),
        playerElapsedMs: clamp(state.elapsedMs || 0, 0, Number.MAX_SAFE_INTEGER),
        playerPausedElapsedMs: clamp(state.pausedElapsedMs || 0, 0, Number.MAX_SAFE_INTEGER),
        activeCueId: String(state.activeCueId || ""),
        stageStatus: String(statusBadge.textContent || "").trim(),
        stageTone: String(statusBadge.dataset.tone || "").trim(),
        studioRecorderState: getStudioRecorderStateSnapshot(),
        studioScenePlaybackActive: isStudioScenePlaybackActive(),
        studioScenePlaybackSceneId: String(studioScenePlayback.sceneId || ""),
        studioScenePlaybackElapsedMs: clamp(studioScenePlayback.elapsedMs || 0, 0, Number.MAX_SAFE_INTEGER),
        studioSnapshotSummary: getStudioSnapshotSummary(snapshot)
      });
    }

    async function requestStageFullscreen() {
      if (document.fullscreenElement === stageFrame) return true;
      if (typeof stageFrame.requestFullscreen !== "function") return false;
      try {
        await stageFrame.requestFullscreen();
        return true;
      } catch {
        return false;
      }
    }

    function handleFullscreenChange() {
      const isFullscreen = document.fullscreenElement === stageFrame;
      stageFrame.dataset.fullscreenActive = isFullscreen ? "true" : "false";
      stageLayout.dataset.fullscreenActive = isFullscreen ? "true" : "false";
      if (runtimeHandle) runtimeHandle.resize();
      updateButtons();
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    function updateCameraModeUi() {
      freeFlyButton.classList.remove("is-active");
      setFreeFlyButtonUi(lt("Neu ausrichten"));
      cameraModeHint.dataset.mode = "freefly";
      cameraModeHint.textContent = lt("Freie Kamera: WASD, Pfeile, Q/E, </X, Leertaste, Shift");
      cameraModeHint.hidden = true;
    }

    function getStudioSnapshot() {
      if (!studioStore) {
        return {
          studioPanelOpen: false,
          playingSceneId: "",
          draftScene: null,
          scenes: []
        };
      }
      return studioStore.getSnapshot();
    }

    function getStudioSnapshotSummary(snapshot = getStudioSnapshot()) {
      const safeSnapshot = snapshot && typeof snapshot === "object" ? snapshot : {};
      const draftScene = safeSnapshot.draftScene || null;
      const scenes = getSnapshotScenes(safeSnapshot);
      return Object.freeze({
        studioPanelOpen: Boolean(safeSnapshot.studioPanelOpen),
        playingSceneId: String(safeSnapshot.playingSceneId || "").trim(),
        draftSceneId: String(draftScene?.sceneId || "").trim(),
        draftSceneName: String(draftScene?.name || "").trim(),
        draftSpanCount: Array.isArray(draftScene?.cameraSpans) ? draftScene.cameraSpans.length : 0,
        savedSceneCount: scenes.length,
        savedSceneIds: Object.freeze(
          scenes
            .map((scene) => String(scene?.sceneId || "").trim())
            .filter(Boolean)
        ),
        savedSceneSummaries: Object.freeze(
          scenes.map((scene) => Object.freeze({
            sceneId: String(scene?.sceneId || "").trim(),
            name: String(scene?.name || "").trim(),
            durationMs: clamp(scene?.durationMs || 0, 0, Number.MAX_SAFE_INTEGER),
            spanCount: Array.isArray(scene?.cameraSpans) ? scene.cameraSpans.length : 0
          }))
        )
      });
    }

    function getLocalPresentationEntries() {
      if (global.PresenterData && typeof global.PresenterData.listLocalPresentations === "function") {
        return global.PresenterData.listLocalPresentations();
      }
      return [];
    }

    function buildPresentationLibraryModel(snapshot = getStudioSnapshot()) {
      const entries = getLocalPresentationEntries();
      const activePresentationId = String(snapshot.presentationId || "").trim();
      const grouped = new Map();
      entries.forEach((entry) => {
        const presentation = entry && typeof entry.presentation === "object" ? entry.presentation : entry;
        const presentationId = String(entry.presentationId || presentation?.presentationId || presentation?.id || "").trim();
        if (!presentationId) return;
        const folderPath = String(entry.folderPath || "Presentations").trim() || "Presentations";
        const scenes = Array.isArray(presentation?.scenes)
          ? presentation.scenes
          : (presentation?.scene ? [presentation.scene] : []);
        const spanCount = scenes.reduce(
          (sum, scene) => sum + (Array.isArray(scene?.cameraSpans) ? scene.cameraSpans.length : 0),
          0
        );
        const entrySummary = {
          presentationId,
          name: String(presentation?.name || presentation?.title || "Presentation"),
          title: String(presentation?.title || presentation?.name || "Presentation"),
          sceneCount: scenes.length,
          spanCount,
          updatedAt: Number(entry.updatedAt || presentation?.updatedAt || 0),
          isActive: presentationId === activePresentationId
        };
        if (!grouped.has(folderPath)) {
          grouped.set(folderPath, []);
        }
        grouped.get(folderPath).push(entrySummary);
      });
      const folders = Array.from(grouped.entries()).map(([path, folderEntries]) => ({
        path,
        label: path,
        count: folderEntries.length,
        entries: folderEntries
      }));
      return {
        total: entries.length,
        folders
      };
    }

    function refreshHeroJumpTools() {
      updateJumpEditorToolbar();
    }

    function renderStudioUi() {
      if (!studioUi) return;
      const snapshot = getStudioSnapshot();
      const recorderState = syncStudioRecorderState(snapshot);
      const isSequencePlaying = isStudioScenePlaybackActive() && studioScenePlayback.mode === "sequence";
      const presentationLibrary = buildPresentationLibraryModel(snapshot);
      refreshHeroJumpTools();
      studioUi.render({
        presentationId: snapshot.presentationId,
        presentationName: snapshot.presentationName,
        presentationTitle: snapshot.presentationTitle,
        autoPlayEnabled: shouldAutoPlay,
        playerStatus: state.status,
        playerActionLabel: playButton.textContent,
        playerCanStart: !playButton.disabled,
        studioPanelOpen: snapshot.studioPanelOpen,
        playingSceneId: snapshot.playingSceneId,
        draftScene: snapshot.draftScene,
        scenes: snapshot.scenes,
        isRecording: Boolean(studioRecorder?.isRecording()),
        liveDurationMs: studioRecorder?.getLiveDurationMs(snapshot.draftScene) || snapshot.draftScene?.durationMs || 0,
        runtimeReady: Boolean(runtimeHandle),
        recorderState,
        isSequencePlaying,
        presentationLibrary,
        projectFolderPath
      });
    }

    function isStudioScenePlaybackActive() {
      return Boolean(studioScenePlayback.scene);
    }

    function clearStudioScenePlaybackCompletionTimer() {
      if (!studioScenePlayback.completionTimerId) return;
      global.clearTimeout(studioScenePlayback.completionTimerId);
      studioScenePlayback.completionTimerId = 0;
    }

    function scheduleStudioScenePlaybackCompletion(scene) {
      clearStudioScenePlaybackCompletionTimer();
      const safeDurationMs = clamp(scene?.durationMs || 0, 0, Number.MAX_SAFE_INTEGER);
      if (!safeDurationMs) return;
      studioScenePlayback.completionTimerId = global.setTimeout(() => {
        studioScenePlayback.completionTimerId = 0;
        if (!isStudioScenePlaybackActive() || studioScenePlayback.sceneId !== String(scene?.sceneId || "").trim()) {
          return;
        }
        studioScenePlayback.elapsedMs = safeDurationMs;
        stopStudioScenePlayback({ reason: "completed" });
      }, safeDurationMs + 32);
    }

    function easeStudioSceneProgress(progress, easingName) {
      const safeProgress = clamp(progress, 0, 1);
      const easing = String(easingName || "easeInOutCubic").trim();
      if (easing === "linear") {
        return safeProgress;
      }
      return ease(safeProgress);
    }

    function clonePoseVector(source) {
      const safeSource = source && typeof source === "object" ? source : {};
      return {
        x: Number(safeSource.x || 0),
        y: Number(safeSource.y || 0),
        z: Number(safeSource.z || 0)
      };
    }

    function blendPose(startPose, endPose, progress, easingName) {
      const safeStartPose = startPose && typeof startPose === "object" ? startPose : {};
      const safeEndPose = endPose && typeof endPose === "object" ? endPose : {};
      const easedProgress = easeStudioSceneProgress(progress, easingName);
      const startPosition = clonePoseVector(safeStartPose.position);
      const endPosition = clonePoseVector(safeEndPose.position);
      const startTarget = clonePoseVector(safeStartPose.target);
      const endTarget = clonePoseVector(safeEndPose.target);
      const startRotation = clonePoseVector(safeStartPose.rotation);
      const endRotation = clonePoseVector(safeEndPose.rotation);
      return Object.freeze({
        position: {
          x: lerpNumber(startPosition.x, endPosition.x, easedProgress),
          y: lerpNumber(startPosition.y, endPosition.y, easedProgress),
          z: lerpNumber(startPosition.z, endPosition.z, easedProgress)
        },
        target: {
          x: lerpNumber(startTarget.x, endTarget.x, easedProgress),
          y: lerpNumber(startTarget.y, endTarget.y, easedProgress),
          z: lerpNumber(startTarget.z, endTarget.z, easedProgress)
        },
        rotation: {
          x: lerpNumber(startRotation.x, endRotation.x, easedProgress),
          y: lerpNumber(startRotation.y, endRotation.y, easedProgress),
          z: lerpNumber(startRotation.z, endRotation.z, easedProgress)
        }
      });
    }

    function resolveStudioScenePose(scene, elapsedMs) {
      const spans = Array.isArray(scene?.cameraSpans) ? scene.cameraSpans : [];
      if (!spans.length) return null;
      const safeElapsedMs = clamp(elapsedMs, 0, Number(scene?.durationMs || 0));
      const firstSpan = spans[0];
      if (safeElapsedMs <= Number(firstSpan.startMs || 0)) {
        return firstSpan.startPose || null;
      }
      for (let index = 0; index < spans.length; index += 1) {
        const span = spans[index];
        const startMs = Number(span?.startMs || 0);
        const endMs = Number(span?.endMs || startMs);
        if (safeElapsedMs < startMs) {
          return spans[Math.max(0, index - 1)]?.endPose || span.startPose || null;
        }
        if (safeElapsedMs <= endMs) {
          const spanDuration = Math.max(1, endMs - startMs);
          return blendPose(
            span.startPose,
            span.endPose,
            (safeElapsedMs - startMs) / spanDuration,
            span.easing
          );
        }
      }
      return spans[spans.length - 1]?.endPose || null;
    }

    function stopStudioScenePlayback(options = {}) {
      if (!isStudioScenePlaybackActive()) return;
      clearStudioScenePlaybackCompletionTimer();
      const snapshot = getStudioSnapshot();
      const completedSceneName = studioScenePlayback.scene?.name || "";
      const shouldAdvance = options.reason === "completed" &&
        studioScenePlayback.mode === "sequence" &&
        Array.isArray(studioScenePlayback.queue) &&
        studioScenePlayback.queue.length > 0;
      studioScenePlayback.sceneId = "";
      studioScenePlayback.scene = null;
      studioScenePlayback.mode = "single";
      studioScenePlayback.startedAtMs = 0;
      studioScenePlayback.elapsedMs = 0;
      runtimeHandle?.setUserCameraEnabled?.(true);
      studioStore?.setPlayingScene("");
      syncStudioRecorderState();
      if (options.reason === "completed") {
        setStatusBadge(`Scene ${completedSceneName || "Playback"} beendet`, "complete", {
          key: "presenter.status.scene_completed",
          fallback: "Scene {scene} beendet",
          params: { scene: completedSceneName || "Playback" }
        });
      } else if (options.reason === "stopped") {
        setStatusBadge("Scene-Playback gestoppt", "pause");
      }
      if (!snapshot.draftScene) {
        updateButtons();
      }
      renderStudioUi();
      if (shouldAdvance) {
        const nextScene = studioScenePlayback.queue.shift();
        if (nextScene) {
          studioScenePlayback.sequenceIndex += 1;
          startStudioScenePlayback(nextScene, { mode: "sequence" });
        }
      } else {
        studioScenePlayback.queue = [];
        studioScenePlayback.sequenceIndex = 0;
        studioScenePlayback.sequenceTotal = 0;
      }
    }

    function updateStudioScenePlaybackFrame() {
      if (!isStudioScenePlaybackActive() || !runtimeHandle) return;
      const scene = studioScenePlayback.scene;
      const elapsedMs = clamp(
        global.performance.now() - studioScenePlayback.startedAtMs,
        0,
        Number(scene?.durationMs || 0)
      );
      studioScenePlayback.elapsedMs = elapsedMs;
      const pose = resolveStudioScenePose(scene, elapsedMs);
      runtimeHandle.setUserCameraEnabled?.(false);
      if (pose) {
        runtimeHandle.applyCameraPose?.(pose);
      }
      if (elapsedMs >= Number(scene?.durationMs || 0)) {
        stopStudioScenePlayback({ reason: "completed" });
      }
    }

    function handleStudioToggle() {
      if (!studioStore) return;
      const snapshot = getStudioSnapshot();
      if (snapshot.draftScene || studioRecorder?.isRecording()) {
        studioStore.openStudioPanel();
        setPlayerChromeVisible(true);
        return;
      }
      if (snapshot.studioPanelOpen) {
        studioStore.closeStudioPanel();
        setPlayerChromeVisible(true);
        setStatusBadge("Control Panel geschlossen", "ready");
        return;
      }
      studioStore.openStudioPanel();
      setPlayerChromeVisible(true);
      setStatusBadge("Control Panel offen", "ready");
    }

    function handleStudioStartPlayer() {
      if (getStudioSnapshot().draftScene || isStudioScenePlaybackActive()) return;
      playPlayback();
      renderStudioUi();
    }

    function handleStudioCreateScene() {
      if (!studioStore) return;
      if (!runtimeHandle) {
        setStatusBadge("Babylon-Szene laedt noch", "error");
        return;
      }
      pausePlayback();
      speaker.stop();
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      if (studioRecorder?.isRecording()) {
        studioRecorder.cancelSpan();
      }
      studioStore.beginDraftScene();
      runtimeHandle.setUserCameraEnabled?.(true);
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "editor",
        editorStatus: "idle"
      });
      setStatusBadge("Neue Scene aktiv", "ready");
    }

    function handleStudioRenameScene(name) {
      if (!studioStore) return;
      studioStore.renameDraftScene(name);
    }

    function handleStudioStartRecording() {
      if (!studioStore || !studioRecorder) return;
      if (!runtimeHandle) {
        setStatusBadge("Babylon-Szene laedt noch", "error");
        return;
      }
      pausePlayback();
      speaker.stop();
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      let snapshot = getStudioSnapshot();
      if (!snapshot.draftScene) {
        studioStore.beginDraftScene();
        snapshot = getStudioSnapshot();
      }
      const activeSpan = studioRecorder.beginSpan(snapshot.draftScene);
      if (!activeSpan) {
        setStatusBadge("Kamera noch nicht bereit", "error");
        return;
      }
      studioStore.openStudioPanel();
      studioStore.setStudioMode("editing");
      runtimeHandle.setUserCameraEnabled?.(true);
      const activeRecording = studioRecorder.getActiveRecordingSnapshot?.() || null;
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "editor",
        editorStatus: "recording",
        activeSceneId: snapshot.draftScene?.sceneId || "",
        activeSpanId: activeSpan.spanId,
        recordingStartedAtMs: activeRecording?.startedAtMs || global.performance.now()
      });
      setStatusBadge("Scene-Aufnahme laeuft", "live");
      renderStudioUi();
    }

    function handleStudioStopRecording() {
      if (!studioStore || !studioRecorder || !studioRecorder.isRecording()) return;
      const span = studioRecorder.endSpan();
      if (!span) {
        setStatusBadge("Segment konnte nicht beendet werden", "error");
        return;
      }
      studioStore.appendSpan(span);
      runtimeHandle?.setUserCameraEnabled?.(true);
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "editor",
        editorStatus: "dirty"
      });
      setStatusBadge("Segment gespeichert", "ready");
      renderStudioUi();
    }

    function handleStudioSaveScene() {
      if (!studioStore) return;
      if (studioRecorder?.isRecording()) {
        handleStudioStopRecording();
      }
      const savedScene = studioStore.saveDraftScene();
      if (!savedScene) {
      setStatusBadge("Noch keine Segmente gespeichert", "pause");
        return;
      }
      runtimeHandle?.setUserCameraEnabled?.(true);
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "player",
        editorStatus: "saved",
        activeSceneId: savedScene.sceneId,
        activeSpanId: "",
        recordingStartedAtMs: 0
      });
      setStatusBadge(`Scene ${savedScene.name} gespeichert`, "complete", {
        key: "presenter.status.scene_saved",
        fallback: "Scene {scene} gespeichert",
        params: { scene: savedScene.name }
      });
      renderStudioUi();
    }

    function handleSavePresentationToLibrary() {
      if (!studioStore) return;
      const presenterDataApi = global.PresenterData;
      if (!presenterDataApi || typeof presenterDataApi.saveLocalPresentation !== "function") {
        setStatusBadge("Lokale Library ist nicht verfuegbar", "error");
        return;
      }
      const payload = studioStore.exportPresentation();
      const folderPath = String(projectFolderPath || "Presentations").trim() || "Presentations";
      const savedEntry = presenterDataApi.saveLocalPresentation(payload, { folderPath });
      if (!savedEntry) {
        setStatusBadge("Presentation konnte nicht gespeichert werden", "error");
        return;
      }
      setStatusBadge("Presentation lokal gespeichert", "complete");
      renderStudioUi();
    }

    function handleCreatePresentation() {
      if (!studioStore) return;
      if (studioRecorder?.isRecording()) {
        handleStudioStopRecording();
      }
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      pausePlayback();
      speaker.stop();
      const presenterDataApi = global.PresenterData;
      const timestamp = Date.now();
      const nextId = `presentation-${timestamp}`;
      const baseTitle = `Neue Presentation ${new Date(timestamp).toLocaleDateString("de-DE")}`;
      const draftPresentation = presenterDataApi?.createScenePresentationDraft
        ? presenterDataApi.createScenePresentationDraft({
          presentationId: nextId,
          name: baseTitle,
          mode: "editor"
        })
        : {
          schemaVersion: "scene-presentation-v1",
          presentationId: nextId,
          name: baseTitle,
          mode: "editor",
          scenes: []
        };
      studioStore.importPresentation(draftPresentation);
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "player",
        editorStatus: "idle",
        activeSceneId: "",
        activeSpanId: "",
        recordingStartedAtMs: 0
      });
      setStatusBadge("Neue Presentation geladen", "ready");
      renderStudioUi();
    }

    function handleLoadPresentation(presentationId) {
      if (!studioStore) return;
      const presenterDataApi = global.PresenterData;
      if (!presenterDataApi || typeof presenterDataApi.getLocalPresentation !== "function") {
        setStatusBadge("Lokale Library ist nicht verfuegbar", "error");
        return;
      }
      const presentation = presenterDataApi.getLocalPresentation(presentationId);
      if (!presentation) {
        setStatusBadge("Presentation nicht gefunden", "error");
        return;
      }
      if (studioRecorder?.isRecording()) {
        handleStudioStopRecording();
      }
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      pausePlayback();
      speaker.stop();
      studioStore.importPresentation(presentation);
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "player",
        editorStatus: "idle",
        activeSceneId: "",
        activeSpanId: "",
        recordingStartedAtMs: 0
      });
      setStatusBadge("Presentation geladen", "ready");
      renderStudioUi();
    }

    function handleDeletePresentation(presentationId) {
      const presenterDataApi = global.PresenterData;
      if (!presenterDataApi || typeof presenterDataApi.deleteLocalPresentation !== "function") {
        setStatusBadge("Lokale Library ist nicht verfuegbar", "error");
        return;
      }
      const safeId = String(presentationId || "").trim();
      if (!safeId) return;
      if (safeId === String(getStudioSnapshot().presentationId || "")) {
        setStatusBadge("Aktive Presentation kann nicht entfernt werden", "pause");
        return;
      }
      const removed = presenterDataApi.deleteLocalPresentation(safeId);
      setStatusBadge(removed ? "Presentation entfernt" : "Presentation nicht gefunden", removed ? "complete" : "pause");
      renderStudioUi();
    }

    function handleSelectProjectFolder(folderPath) {
      projectFolderPath = String(folderPath || "").trim() || "Presentations";
      renderStudioUi();
    }

    function handleProjectFolderChange(folderPath) {
      projectFolderPath = String(folderPath || "").trim() || "Presentations";
      renderStudioUi();
    }

    function handleStudioDiscardScene() {
      if (!studioStore) return;
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      if (studioRecorder?.isRecording()) {
        studioRecorder.cancelSpan();
      }
      studioStore.discardDraftScene();
      runtimeHandle?.setUserCameraEnabled?.(true);
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "player",
        editorStatus: "idle",
        activeSceneId: "",
        activeSpanId: "",
        recordingStartedAtMs: 0
      });
      setStatusBadge("Scene-Draft verworfen", "pause");
      renderStudioUi();
    }

    function startStudioScenePlayback(scene, options = {}) {
      if (!studioStore || !runtimeHandle || !scene) return false;
      if (!Array.isArray(scene.cameraSpans) || !scene.cameraSpans.length) {
        setStatusBadge("Scene enthaelt noch keine Kamerasegmente", "error");
        return false;
      }
      pausePlayback();
      speaker.stop();
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      studioScenePlayback.sceneId = scene.sceneId;
      studioScenePlayback.scene = scene;
      studioScenePlayback.mode = options.mode === "sequence" ? "sequence" : "single";
      if (studioScenePlayback.mode === "single") {
        studioScenePlayback.queue = [];
        studioScenePlayback.sequenceIndex = 0;
        studioScenePlayback.sequenceTotal = 0;
      }
      studioScenePlayback.startedAtMs = global.performance.now();
      studioScenePlayback.elapsedMs = 0;
      scheduleStudioScenePlaybackCompletion(scene);
      studioStore.openStudioPanel();
      studioStore.setPlayingScene(scene.sceneId);
      runtimeHandle.setUserCameraEnabled?.(false);
      runtimeHandle.applyCameraPose?.(resolveStudioScenePose(scene, 0));
      syncStudioRecorderState(getStudioSnapshot(), {
        mode: "player",
        editorStatus: "idle",
        activeSceneId: scene.sceneId,
        activeSpanId: "",
        recordingStartedAtMs: 0
      });
      setStatusBadge(`Scene ${scene.name || "Playback"} laeuft`, "live", {
        key: "presenter.status.scene_running",
        fallback: "Scene {scene} laeuft",
        params: { scene: scene.name || "Playback" }
      });
      renderStudioUi();
      updateButtons();
      return true;
    }

    function handleStudioPlaySavedScene(sceneId) {
      if (!studioStore || !runtimeHandle) return;
      const snapshot = getStudioSnapshot();
      if (snapshot.draftScene) {
        studioStore.openStudioPanel();
        setStatusBadge("Aktiven Draft zuerst speichern oder verwerfen", "pause");
        return;
      }
      const targetScene = getSnapshotScenes(snapshot).find((scene) => scene.sceneId === String(sceneId || "").trim());
      startStudioScenePlayback(targetScene, { mode: "single" });
    }

    function handleStudioPlayAllScenes() {
      if (!studioStore || !runtimeHandle) return;
      const snapshot = getStudioSnapshot();
      if (snapshot.draftScene) {
        studioStore.openStudioPanel();
        setStatusBadge("Aktiven Draft zuerst speichern oder verwerfen", "pause");
        return;
      }
      const scenes = getSnapshotScenes(snapshot);
      if (scenes.length < 2) {
        setStatusBadge("Mindestens zwei Scenes notwendig", "pause");
        return;
      }
      const playableScenes = scenes.filter((scene) => Array.isArray(scene.cameraSpans) && scene.cameraSpans.length);
      if (playableScenes.length < 2) {
        setStatusBadge("Zu wenige Scenes mit Kamerasegmenten", "pause");
        return;
      }
      studioScenePlayback.sequenceIndex = 1;
      studioScenePlayback.sequenceTotal = playableScenes.length;
      studioScenePlayback.queue = playableScenes.slice(1);
      startStudioScenePlayback(playableScenes[0], { mode: "sequence" });
    }

    function handleStudioStopSceneSequence() {
      if (!isStudioScenePlaybackActive()) return;
      studioScenePlayback.queue = [];
      stopStudioScenePlayback({ reason: "stopped" });
      setStatusBadge("Sequenz gestoppt", "pause");
    }

    function handleStudioEditSavedScene(sceneId) {
      if (!studioStore) return;
      const snapshot = getStudioSnapshot();
      if (snapshot.draftScene && snapshot.draftScene.sceneId !== String(sceneId || "").trim()) {
        studioStore.openStudioPanel();
        setStatusBadge("Aktiven Draft zuerst speichern oder verwerfen", "pause");
        return;
      }
      if (studioRecorder?.isRecording()) {
        setStatusBadge("Laufende Aufnahme zuerst stoppen", "pause");
        return;
      }
      if (isStudioScenePlaybackActive()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      pausePlayback();
      speaker.stop();
      studioStore.loadSavedSceneIntoDraft(sceneId);
      runtimeHandle?.setUserCameraEnabled?.(true);
      const nextSnapshot = getStudioSnapshot();
      syncStudioRecorderState(nextSnapshot, {
        mode: "editor",
        editorStatus: Array.isArray(nextSnapshot.draftScene?.cameraSpans) && nextSnapshot.draftScene.cameraSpans.length ? "dirty" : "idle",
        activeSceneId: nextSnapshot.draftScene?.sceneId || ""
      });
      setStatusBadge("Scene im Draft geoeffnet", "ready");
      renderStudioUi();
      updateButtons();
    }

    function handleStudioDeleteSavedScene(sceneId) {
      if (!studioStore) return;
      const snapshot = getStudioSnapshot();
      if (snapshot.draftScene) {
        studioStore.openStudioPanel();
        setStatusBadge("Aktiven Draft zuerst speichern oder verwerfen", "pause");
        return;
      }
      if (isStudioScenePlaybackActive() && studioScenePlayback.sceneId === String(sceneId || "").trim()) {
        stopStudioScenePlayback({ reason: "stopped" });
      }
      studioStore.deleteSavedScene(sceneId);
      syncStudioRecorderState();
      setStatusBadge("Scene geloescht", "pause");
      renderStudioUi();
      updateButtons();
    }

    function updateButtons() {
      const studioSnapshot = getStudioSnapshot();
      const studioEditing = Boolean(studioSnapshot.draftScene);
      const studioScenePlaying = isStudioScenePlaybackActive();
      const isFullscreen = document.fullscreenElement === stageFrame;
      const isSequencePlaying = studioScenePlaying && studioScenePlayback.mode === "sequence";
      const jumpsAvailable = cueCards.length > 0;
      const jumpsVisible = jumpsAvailable && (state.jumpsEnabled || jumpEditorState.active);
      const cueSegmentButtonDisabled = state.status === "loading"
        || state.status === "error"
        || jumpEditorState.active
        || studioEditing
        || studioScenePlaying;
      stageLayout.dataset.jumpsEnabled = jumpsVisible ? "true" : "false";
      stageFrame.dataset.playState = String(state.status || "idle");
      updateJumpEditorToolbar();
      cueCards.forEach((entryCue) => {
        if (entryCue?.cuePlayButton) {
          entryCue.cuePlayButton.disabled = cueSegmentButtonDisabled;
        }
      });
      const shouldRunPlayerCamera = !studioEditing
        && !studioScenePlaying
        && state.status === "playing"
        && state.jumpsEnabled;
      runtimeHandle?.setJumpPlaybackEnabled?.(Boolean(state.jumpsEnabled));
      runtimeHandle?.setPlayerPlaybackActive?.(shouldRunPlayerCamera);
      const shouldEnableUserCamera = !studioEditing && !studioScenePlaying;
      runtimeHandle?.setUserCameraEnabled?.(shouldEnableUserCamera);
      if (state.status === "loading") {
        setPlayButtonUi(lt("Lade Szene ..."), "loading");
        playButton.disabled = true;
        restartButton.disabled = true;
        freeFlyButton.disabled = true;
        fullscreenButton.disabled = true;
        setFullscreenButtonUi(lt("Vollbild"), false);
        sequencePill.hidden = true;
        updateCameraModeUi();
        setPlayerChromeVisible(false);
        updateStagePlayOverlay();
        return;
      }
      if (state.status === "error") {
        setPlayButtonUi(lt("Szene nicht verfuegbar"), "blocked");
        playButton.disabled = true;
        restartButton.disabled = true;
        freeFlyButton.disabled = true;
        fullscreenButton.disabled = false;
        setFullscreenButtonUi(lt(isFullscreen ? "Vollbild verlassen" : "Vollbild"), isFullscreen);
        sequencePill.hidden = true;
        updateCameraModeUi();
        setPlayerChromeVisible(false);
        updateStagePlayOverlay();
        return;
      }
      playButton.disabled = false;
      restartButton.disabled = false;
      freeFlyButton.disabled = !runtimeHandle;
      fullscreenButton.disabled = false;
      setRestartButtonUi(lt("Neu starten"));
      setFullscreenButtonUi(lt(isFullscreen ? "Vollbild verlassen" : "Vollbild"), isFullscreen);
      if (isSequencePlaying && studioScenePlayback.sequenceTotal > 0) {
        sequencePill.hidden = false;
        sequencePill.textContent = `Sequenz ${studioScenePlayback.sequenceIndex}/${studioScenePlayback.sequenceTotal}`;
      } else {
        sequencePill.hidden = true;
        sequencePill.textContent = "";
      }
      setPlayerChromeVisible(true);
      updateStagePlayOverlay();
      if (jumpEditorState.active) {
        setPlayButtonUi(lt("Bearbeitung aktiv"), "edit");
        playButton.disabled = true;
        restartButton.disabled = true;
        updateCameraModeUi();
        setPlayerChromeVisible(true);
        updateStagePlayOverlay();
        return;
      }
      if (studioEditing) {
        setPlayButtonUi(lt("Player pausiert"), "pause");
        playButton.disabled = true;
        restartButton.disabled = true;
        updateCameraModeUi();
        setPlayerChromeVisible(true);
        updateStagePlayOverlay();
        return;
      }
      if (studioScenePlaying) {
        setPlayButtonUi(lt("Scene laeuft"), "loading");
        playButton.disabled = true;
        restartButton.disabled = true;
        freeFlyButton.disabled = true;
        updateCameraModeUi();
        setPlayerChromeVisible(true);
        updateStagePlayOverlay();
        return;
      }
      if (state.status === "playing") {
        setPlayButtonUi(lt(shouldAutoPlay ? "Pause" : "Player pausieren"), "pause");
        updateCameraModeUi();
        setPlayerChromeVisible(true);
        updateStagePlayOverlay();
        return;
      }
      if (state.status === "paused") {
        setPlayButtonUi(lt(shouldAutoPlay ? "Weiter" : "Player fortsetzen"), "play");
        updateCameraModeUi();
        setPlayerChromeVisible(true);
        updateStagePlayOverlay();
        return;
      }
      if (state.status === "completed") {
        setPlayButtonUi(lt(shouldAutoPlay ? "Noch mal abspielen" : "Player neu starten"), "replay");
        updateCameraModeUi();
        setPlayerChromeVisible(true);
        updateStagePlayOverlay();
        return;
      }
      setPlayButtonUi(lt(shouldAutoPlay ? "Play" : "Player starten"), "play");
      updateCameraModeUi();
      setPlayerChromeVisible(true);
      updateStagePlayOverlay();
    }

    function setStatusBadge(label, tone, i18n = null) {
      statusBadgeSource = i18n && typeof i18n === "object" && i18n.key
        ? {
            key: String(i18n.key || "").trim(),
            fallback: String(i18n.fallback || label || "").trim(),
            params: i18n.params || null
          }
        : { text: String(label || "").trim() || "Bereit" };
      statusBadge.textContent = resolveStatusBadgeText();
      statusBadge.dataset.tone = String(tone || "ready").trim().toLowerCase();
    }

    function renderCueState(elapsedMs) {
      const renderableCues = getRenderableCues();
      const activeCue = resolveActiveCue(renderableCues, elapsedMs);
      const activeSpeech = resolveActiveSpeechSegment(ttsSegments, elapsedMs);
      const subtitleText = String(activeSpeech?.text || activeCue?.caption || entry.summary || "").trim();
      state.activeCueId = activeCue?.id || "";
      overlayCaption.textContent = lt(subtitleText);
      stageOverlay.hidden = !overlayCaption.textContent;
      cueCards.forEach((entryCue) => {
        const startMs = getCueStartMs(entryCue.cue, entryCue.index);
        const endMs = getCueEndMs(entryCue.cue, entryCue.index, renderableCues);
        const isActive = entryCue.cue.id === state.activeCueId;
        const isComplete = elapsedMs >= endMs;
        entryCue.card.classList.toggle("is-active", isActive);
        entryCue.card.classList.toggle("is-complete", !isActive && isComplete);
        entryCue.card.classList.toggle("is-upcoming", elapsedMs < startMs);
      });
      timelineMarkers.forEach((entryMarker) => {
        const startMs = getCueStartMs(entryMarker.cue, entryMarker.index);
        const endMs = getCueEndMs(entryMarker.cue, entryMarker.index, renderableCues);
        const isActive = entryMarker.cue.id === state.activeCueId;
        entryMarker.marker.classList.toggle("is-active", isActive);
        entryMarker.marker.classList.toggle("is-complete", !isActive && elapsedMs >= endMs);
        entryMarker.marker.classList.toggle("is-upcoming", elapsedMs < startMs);
      });
    }

    function renderProgress(elapsedMs) {
      const safeElapsed = clamp(elapsedMs, 0, durationMs);
      state.elapsedMs = safeElapsed;
      state.pausedElapsedMs = safeElapsed;
      timeText.textContent = `${formatDurationLabel(safeElapsed)} / ${formatDurationLabel(durationMs)}`;
      timelineFill.style.width = `${(safeElapsed / durationMs) * 100}%`;
      timeline.setAttribute("aria-valuenow", String(Math.round(safeElapsed)));
      timeline.setAttribute("aria-valuetext", t("presenter.timeline.value_text", "{current} von {total}", {
        current: formatDurationLabel(safeElapsed),
        total: formatDurationLabel(durationMs)
      }));
      renderCueState(safeElapsed);
      if (runtimeHandle) {
        runtimeHandle.setElapsedMs(safeElapsed);
      }
    }

    function seekPlayback(nextElapsedMs, options = {}) {
      const safeElapsed = clamp(nextElapsedMs, 0, durationMs);
      const skipCameraSync = options.skipCameraSync === true;
      if (options.preserveCueSegment !== true) {
        clearCueSegmentPlayback();
      }
      const wasPlaying = state.status === "playing";
      const wasCompleted = state.status === "completed";
      if (wasPlaying) {
        state.startStamp = global.performance.now() - safeElapsed;
        state.pausedElapsedMs = safeElapsed;
        renderProgress(safeElapsed);
        if (!skipCameraSync) {
          runtimeHandle?.syncPlayerCameraToElapsed?.(safeElapsed);
        }
        if (!speakerMuted && speaker.available) {
          speaker.startAt(safeElapsed);
        } else {
          speaker.stop();
        }
        setStatusBadge("Praesentation laeuft", "live");
        updateButtons();
        renderStudioUi();
        return;
      }
      if (wasCompleted) {
        state.status = "paused";
      }
      state.pausedElapsedMs = safeElapsed;
      renderProgress(safeElapsed);
      if (!skipCameraSync) {
        runtimeHandle?.syncPlayerCameraToElapsed?.(safeElapsed);
      }
      speaker.stop();
      if (state.status === "ready") {
        setStatusBadge("Startposition gesetzt", "ready");
      } else {
        setStatusBadge("Sprung im Ablauf gesetzt", "pause");
      }
      updateButtons();
      renderStudioUi();
    }

    function finishPlayback() {
      if (state.status === "completed") return;
      clearCueSegmentPlayback();
      state.status = "completed";
      state.pausedElapsedMs = durationMs;
      renderProgress(durationMs);
      speaker.stop();
      setStatusBadge("Praesentation beendet", "complete");
      updateButtons();
      renderStudioUi();
    }

    function pausePlaybackAt(nextElapsedMs, options = {}) {
      if (state.status !== "playing") return;
      const safeElapsed = clamp(nextElapsedMs, 0, durationMs);
      clearCueSegmentPlayback();
      state.pausedElapsedMs = safeElapsed;
      state.status = "paused";
      renderProgress(safeElapsed);
      if (!speakerMuted && speaker.available) {
        speaker.pause();
      } else {
        speaker.stop();
      }
      setStatusBadge(String(options.label || "Pausiert"), String(options.tone || "pause"));
      updateButtons();
      renderStudioUi();
    }

    function playPlayback(options = {}) {
      if (state.status === "loading" || state.status === "error") return;
      const studioSnapshot = getStudioSnapshot();
      if (!studioSnapshot.draftScene && !studioRecorder?.isRecording()) {
        studioStore?.closeStudioPanel?.();
      }
      const previousStatus = state.status;
      const shouldRestart = Boolean(options.restart) || previousStatus === "completed";
      const startAtMs = shouldRestart ? 0 : clamp(state.pausedElapsedMs, 0, durationMs);
      setPlayerChromeVisible(false);
      state.status = "playing";
      state.startStamp = global.performance.now() - startAtMs;
      state.pausedElapsedMs = startAtMs;
      if (!speakerMuted && speaker.available) {
        if (shouldRestart || previousStatus === "ready") {
          speaker.startAt(startAtMs);
        } else if (previousStatus === "paused") {
          speaker.resume(startAtMs);
        } else {
          speaker.startAt(startAtMs);
        }
      } else {
        speaker.stop();
      }
      focusStageCanvas();
      setStatusBadge("Praesentation laeuft", "live");
      updateButtons();
      renderStudioUi();
    }

    function pausePlayback() {
      pausePlaybackAt(global.performance.now() - state.startStamp, { label: "Pausiert", tone: "pause" });
    }

    function restartPlayback() {
      clearCueSegmentPlayback();
      speaker.stop();
      renderProgress(0);
      playPlayback({ restart: true });
    }

    function tick() {
      if (destroyed) return;
      if (state.status === "playing") {
        const elapsedMs = clamp(global.performance.now() - state.startStamp, 0, durationMs);
        if (cueSegmentPlayback.active && elapsedMs >= cueSegmentPlayback.stopAtMs) {
          pausePlaybackAt(cueSegmentPlayback.stopAtMs, {
            label: "Segment pausiert vor dem naechsten Jump",
            tone: "pause"
          });
        } else {
          renderProgress(elapsedMs);
        }
        if (elapsedMs >= durationMs) {
          finishPlayback();
        }
      } else {
        renderProgress(state.pausedElapsedMs);
      }
      if (isStudioScenePlaybackActive()) {
        updateStudioScenePlaybackFrame();
      }
      if (studioRecorder?.isRecording()) {
        renderStudioUi();
      }
      frameId = global.requestAnimationFrame(tick);
    }

    playButton.addEventListener("click", () => {
      if (state.status === "playing") {
        pausePlayback();
        return;
      }
      playPlayback();
    });

    restartButton.addEventListener("click", () => {
      restartPlayback();
    });

    freeFlyButton.addEventListener("click", () => {
      if (!runtimeHandle || state.status === "loading" || state.status === "error") return;
      runtimeHandle.snapFreeCameraToCue?.();
      state.freeFlyEnabled = true;
      updateButtons();
    });

    studioPanelButton.addEventListener("click", () => {
      if (studioPanelButton.disabled) return;
      if (jumpEditorState.active) {
        cancelJumpEditMode();
        return;
      }
      state.jumpsEnabled = !state.jumpsEnabled;
      updateButtons();
    });

    jumpEditorButton.addEventListener("click", () => {
      if (jumpEditorButton.disabled) return;
      if (jumpEditorState.active) {
        saveJumpEditMode();
        return;
      }
      enterJumpEditMode();
    });

    function updateAudioToggle() {
      const muted = speakerMuted || !speaker.available;
      heroAudioButton.classList.toggle("is-muted", muted);
      heroAudioButton.disabled = !speaker.available;
      setPresenterButtonContent(heroAudioButton, {
        icon: muted ? "volume-off" : "volume-on",
        iconOnly: true,
        accessibleLabel: lt("Ton umschalten"),
        title: lt("Ton umschalten")
      });
    }

    heroAudioButton.addEventListener("click", () => {
      if (!speaker.available) return;
      speakerMuted = !speakerMuted;
      if (speakerMuted) {
        speaker.stop();
      } else if (state.status === "playing") {
        speaker.startAt(clamp(state.pausedElapsedMs, 0, durationMs));
      }
      updateAudioToggle();
    });


    timeline.addEventListener("click", (event) => {
      if (state.status === "loading" || state.status === "error") return;
      if (getStudioSnapshot().draftScene || isStudioScenePlaybackActive()) return;
      const rect = timeline.getBoundingClientRect();
      if (!rect.width) return;
      const progress = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      seekPlayback(progress * durationMs);
    });

    timeline.addEventListener("keydown", (event) => {
      if (state.status === "loading" || state.status === "error") return;
      if (getStudioSnapshot().draftScene || isStudioScenePlaybackActive()) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        seekPlayback(state.elapsedMs + 5000);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekPlayback(state.elapsedMs - 5000);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        seekPlayback(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        seekPlayback(durationMs);
      }
    });

    const clickMaxMs = 200;
    const moveThresholdPx = 6;
    let pointerActiveOnStage = false;
    let pointerStartTime = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerMoved = false;
    let pointerHoldExceeded = false;
    let activePointerId = null;
    let holdTimer = null;

    const isStagePointerEvent = (event) => {
      return stageFrame.contains(event.target) || (event.composedPath?.() || []).includes(stageFrame);
    };

    const handleStagePointerDown = (event) => {
      if (event.button !== 0) return;
      pointerActiveOnStage = true;
      activePointerId = event.pointerId;
      pointerStartTime = event.timeStamp || global.performance.now();
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerMoved = false;
      pointerHoldExceeded = false;
      if (holdTimer) {
        global.clearTimeout(holdTimer);
      }
      holdTimer = global.setTimeout(() => {
        pointerHoldExceeded = true;
      }, clickMaxMs + 1);
      freeFlyState.mouseHeld = true;
      if (typeof canvas.focus === "function") {
        try {
          canvas.focus({ preventScroll: true });
        } catch {
          canvas.focus();
        }
      }
      setPlayerChromeVisible(false);
      if (typeof stageFrame.setPointerCapture === "function") {
        try {
          stageFrame.setPointerCapture(event.pointerId);
        } catch {
        }
      }
    };

    stageFrame.addEventListener("pointerdown", handleStagePointerDown);
    global.addEventListener("pointerdown", (event) => {
      if (!isStagePointerEvent(event)) return;
      handleStagePointerDown(event);
    }, { capture: true });

    stageFrame.addEventListener("pointermove", (event) => {
      if (!pointerActiveOnStage || activePointerId !== event.pointerId) return;
      const dx = event.clientX - pointerStartX;
      const dy = event.clientY - pointerStartY;
      if ((dx * dx + dy * dy) >= (moveThresholdPx * moveThresholdPx)) {
        pointerMoved = true;
      }
    });

    const handlePointerRelease = (event, cancelled = false) => {
      if (!pointerActiveOnStage || (activePointerId !== null && activePointerId !== event.pointerId)) return;
      if (holdTimer) {
        global.clearTimeout(holdTimer);
        holdTimer = null;
      }
      const durationMs = Math.max(0, (event.timeStamp || global.performance.now()) - pointerStartTime);
      const isShortClick = !cancelled && !pointerMoved && !pointerHoldExceeded && durationMs < clickMaxMs;
      pointerActiveOnStage = false;
      activePointerId = null;
      freeFlyState.mouseHeld = false;
      clearFreeFlyMovement();
      setPlayerChromeVisible(true);
      if (typeof stageFrame.releasePointerCapture === "function" && event.pointerId != null) {
        try {
          stageFrame.releasePointerCapture(event.pointerId);
        } catch {
        }
      }
      if (!isShortClick) return;
    };

    stageFrame.addEventListener("pointerup", (event) => handlePointerRelease(event, false));
    stageFrame.addEventListener("pointercancel", (event) => handlePointerRelease(event, true));
    global.addEventListener("pointerup", (event) => handlePointerRelease(event, false));
    global.addEventListener("pointercancel", (event) => handlePointerRelease(event, true));

    fullscreenButton.addEventListener("click", () => {
      if (document.fullscreenElement === stageFrame && typeof document.exitFullscreen === "function") {
        try {
          const exitResult = document.exitFullscreen();
          if (exitResult && typeof exitResult.catch === "function") {
            exitResult.catch(() => {
            });
          }
        } catch {
        }
        return;
      }
      void requestStageFullscreen();
    });

    backButton.addEventListener("click", () => {
      if (document.fullscreenElement === stageFrame && typeof document.exitFullscreen === "function") {
        try {
          const exitResult = document.exitFullscreen();
          if (exitResult && typeof exitResult.catch === "function") {
            exitResult.catch(() => {
            });
          }
        } catch {
        }
      }
      if (typeof options.onExit === "function") {
        options.onExit(entry.id);
      }
    });

    if (studioStore) {
      studioUnsubscribe = studioStore.subscribe(() => {
        renderStudioUi();
        updateButtons();
      });
    }
    renderTimelineMarkers();
    renderCueGrid();
    updateButtons();
    syncStudioRecorderState();
    setPlayerChromeVisible(false);
    refreshHeroJumpTools();
    updateAudioToggle();
    renderStudioUi();
    renderProgress(0);
    frameId = global.requestAnimationFrame(tick);
    if (shouldAutoPlay) {
      void requestStageFullscreen();
    }
    const stopLocaleSync = onLocaleChanged(() => {
      heroTitle.textContent = lt(entry.title || "Praesentation");
      refreshHeroJumpTools();
      updateAudioToggle();
      setRendererPillText(rendererPillSource);
      canvas.setAttribute("aria-label", t("presenter.aria.canvas_scene", "{title} Szene", {
        title: lt(entry.title || "Praesentation")
      }));
      stageControls.setAttribute("aria-label", lt("Videosteuerung"));
      timeline.setAttribute("aria-label", lt("Animationsfortschritt"));
      runtimeHandle?.refreshTranslations?.();
      statusBadge.textContent = resolveStatusBadgeText();
      renderTimelineMarkers();
      renderCueGrid();
      updateButtons();
      renderProgress(state.elapsedMs);
    });

    try {
      const babylonRuntime = await ensureBabylonLoaded();
      if (destroyed) {
        return {
          destroy() {
          }
        };
      }
      runtimeHandle = buildSceneRuntime(babylonRuntime.library, canvas, entry);
      resizeHandler = () => {
        if (runtimeHandle) runtimeHandle.resize();
      };
      global.addEventListener("resize", resizeHandler);
      runtimeHandle.setElapsedMs(0);
      runtimeHandle.setUserCameraEnabled(true);
      state.freeFlyEnabled = true;
      state.status = "ready";
      setRendererPillText(`Renderer: ${babylonRuntime.label}`);
      setStatusBadge(
        speaker.available
          ? (shouldAutoPlay
            ? `${babylonRuntime.label} bereit`
            : `${babylonRuntime.label} bereit - Player oder Studio bewusst starten`)
          : (shouldAutoPlay
            ? `${babylonRuntime.label} ohne TTS bereit`
            : `${babylonRuntime.label} ohne TTS bereit - Player oder Studio bewusst starten`),
        "ready",
        {
          key: speaker.available
            ? (shouldAutoPlay ? "presenter.status.renderer_ready_tts_autoplay" : "presenter.status.renderer_ready_tts_manual")
            : (shouldAutoPlay ? "presenter.status.renderer_ready_no_tts_autoplay" : "presenter.status.renderer_ready_no_tts_manual"),
          fallback: speaker.available
            ? (shouldAutoPlay ? "{renderer} bereit" : "{renderer} bereit - Player oder Studio bewusst starten")
            : (shouldAutoPlay ? "{renderer} ohne TTS bereit" : "{renderer} ohne TTS bereit - Player oder Studio bewusst starten"),
          params: { renderer: babylonRuntime.label }
        }
      );
      renderStudioUi();
      updateButtons();
      if (shouldAutoPlay) {
        playPlayback({ restart: true });
      }
    } catch (error) {
      state.status = "error";
      setRendererPillText("Renderer: nicht geladen");
      setStatusBadge("Babylon.js konnte nicht geladen werden", "error");
      overlayCaption.textContent = lt(error instanceof Error ? error.message : "Unbekannter Fehler in der Presenter-Runtime.");
      stageOverlay.hidden = !overlayCaption.textContent;
      renderStudioUi();
      updateButtons();
    }

    return {
      getStudioRecorderState() {
        return getStudioRecorderStateSnapshot();
      },
      getVerificationSnapshot() {
        return getVerificationSnapshot();
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        stopLocaleSync();
        speaker.stop();
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        stageFrame.removeEventListener("pointerup", showPlayerChrome);
        stageFrame.removeEventListener("pointercancel", showPlayerChrome);
        if (studioUnsubscribe) {
          studioUnsubscribe();
          studioUnsubscribe = null;
        }
        if (frameId) {
          global.cancelAnimationFrame(frameId);
          frameId = 0;
        }
        clearStudioScenePlaybackCompletionTimer();
        if (resizeHandler) {
          global.removeEventListener("resize", resizeHandler);
          resizeHandler = null;
        }
        if (runtimeHandle) {
          runtimeHandle.dispose();
          runtimeHandle = null;
        }
      }
    };
  }

  global.PresenterRuntime = Object.freeze({
    mount
  });
})(window);
