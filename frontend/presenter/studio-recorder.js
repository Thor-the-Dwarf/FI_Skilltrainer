(function initPresentationStudioRecorder(global) {
  "use strict";

  function clamp(value, min, max) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
    return Math.min(max, Math.max(min, safeValue));
  }

  function cloneVector(vector) {
    const source = vector && typeof vector === "object" ? vector : {};
    return Object.freeze({
      x: Number(source.x || 0),
      y: Number(source.y || 0),
      z: Number(source.z || 0)
    });
  }

  function clonePose(pose) {
    const source = pose && typeof pose === "object" ? pose : {};
    return Object.freeze({
      position: cloneVector(source.position),
      target: cloneVector(source.target),
      rotation: cloneVector(source.rotation)
    });
  }

  function createRecorder(options = {}) {
    const now = typeof options.now === "function"
      ? options.now
      : () => global.performance.now();
    const capturePose = typeof options.capturePose === "function"
      ? options.capturePose
      : () => null;
    let activeRecording = null;
    let nextSpanNumber = 1;

    function getElapsedMs() {
      if (!activeRecording) return 0;
      return clamp(now() - activeRecording.startedAtMs, 0, Number.MAX_SAFE_INTEGER);
    }

    return Object.freeze({
      isRecording() {
        return Boolean(activeRecording);
      },
      beginSpan(draftScene) {
        if (activeRecording) return null;
        const draft = draftScene && typeof draftScene === "object" ? draftScene : null;
        const startPose = capturePose();
        if (!draft || !startPose) return null;
        activeRecording = {
          spanId: `${String(draft.sceneId || "scene")}-span-${String(nextSpanNumber).padStart(3, "0")}`,
          startedAtMs: now(),
          draftOffsetMs: clamp(draft.durationMs || 0, 0, Number.MAX_SAFE_INTEGER),
          startPose: clonePose(startPose)
        };
        nextSpanNumber += 1;
        return Object.freeze({
          spanId: activeRecording.spanId,
          startMs: activeRecording.draftOffsetMs,
          startPose: activeRecording.startPose
        });
      },
      endSpan() {
        if (!activeRecording) return null;
        const endPose = capturePose();
        if (!endPose) return null;
        const elapsedMs = Math.max(120, getElapsedMs());
        const span = Object.freeze({
          spanId: activeRecording.spanId,
          startMs: activeRecording.draftOffsetMs,
          endMs: activeRecording.draftOffsetMs + elapsedMs,
          durationMs: elapsedMs,
          easing: "easeInOutCubic",
          startPose: activeRecording.startPose,
          endPose: clonePose(endPose)
        });
        activeRecording = null;
        return span;
      },
      cancelSpan() {
        activeRecording = null;
      },
      getLiveDurationMs(draftScene) {
        const baseDuration = clamp(draftScene?.durationMs || 0, 0, Number.MAX_SAFE_INTEGER);
        if (!activeRecording) return baseDuration;
        return baseDuration + getElapsedMs();
      },
      getActiveRecordingSnapshot() {
        if (!activeRecording) return null;
        return Object.freeze({
          spanId: activeRecording.spanId,
          startedAtMs: activeRecording.startedAtMs,
          draftOffsetMs: activeRecording.draftOffsetMs,
          elapsedMs: getElapsedMs(),
          startPose: activeRecording.startPose
        });
      }
    });
  }

  global.PresentationStudioRecorder = Object.freeze({
    createRecorder,
    clonePose
  });
})(window);
