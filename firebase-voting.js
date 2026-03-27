const DEFAULT_SDK_VERSION = "12.7.0";
const PREVIEW_STORAGE_KEY = "sr_doomscroll_feedback_preview_v1";
const CLIENT_ID_STORAGE_KEY = "sr_doomscroll_feedback_client_v1";
const LOCAL_OVERRIDE_STORAGE_KEY = "sr_enable_doomscroll_feedback";
const COMMENT_MAX_LENGTH = 600;

function readRuntimeConfig() {
  const source = window.__FI_SKILLTRAINER_FIREBASE__ && typeof window.__FI_SKILLTRAINER_FIREBASE__ === "object"
    ? window.__FI_SKILLTRAINER_FIREBASE__
    : {};
  const app = source.app && typeof source.app === "object" ? source.app : {};
  const firestore = source.firestore && typeof source.firestore === "object" ? source.firestore : {};
  return {
    enabled: Boolean(source.enabled),
    allowLocalOverride: source.allowLocalOverride !== false,
    mode: String(source.mode || "preview").trim().toLowerCase() === "firebase" ? "firebase" : "preview",
    sdkVersion: String(source.sdkVersion || DEFAULT_SDK_VERSION).trim() || DEFAULT_SDK_VERSION,
    app: {
      apiKey: String(app.apiKey || "").trim(),
      authDomain: String(app.authDomain || "").trim(),
      projectId: String(app.projectId || "").trim(),
      appId: String(app.appId || "").trim(),
      storageBucket: String(app.storageBucket || "").trim(),
      messagingSenderId: String(app.messagingSenderId || "").trim(),
      measurementId: String(app.measurementId || "").trim()
    },
    firestore: {
      feedbackCollection: String(firestore.feedbackCollection || "doomscroll_feedback").trim() || "doomscroll_feedback",
      voteCollection: String(firestore.voteCollection || "votes").trim() || "votes",
      commentCollection: String(firestore.commentCollection || "comments").trim() || "comments",
      commentLimit: Math.max(1, Number(firestore.commentLimit) || 12)
    }
  };
}

function isLocalDevelopmentHost() {
  const hostname = String(window.location?.hostname || "").trim().toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isFeatureLocallyOverridden(config) {
  if (!config.allowLocalOverride || !isLocalDevelopmentHost()) return false;
  return String(safeStorageGet(LOCAL_OVERRIDE_STORAGE_KEY) || "").trim() === "1";
}

function isFeatureEnabled(config) {
  return Boolean(config.enabled) || isFeatureLocallyOverridden(config);
}

function isFirebaseConfigComplete(appConfig) {
  return Boolean(appConfig.apiKey && appConfig.projectId && appConfig.appId);
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
  }
}

function generateId(prefix = "id") {
  try {
    if (window.crypto?.randomUUID) return `${prefix}_${window.crypto.randomUUID()}`;
  } catch {
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getClientId() {
  const existing = String(safeStorageGet(CLIENT_ID_STORAGE_KEY) || "").trim();
  if (existing) return existing;
  const nextId = generateId("client");
  safeStorageSet(CLIENT_ID_STORAGE_KEY, nextId);
  return nextId;
}

function normalizeQuestionEntry(entry) {
  const source = entry && typeof entry === "object" ? entry : {};
  const questionKey = String(source.questionKey || source.questionId || "").trim();
  if (!questionKey) {
    throw new Error("Voting-Eintrag ohne questionKey.");
  }
  return {
    questionKey,
    questionId: String(source.questionId || questionKey).trim() || questionKey,
    deckKey: String(source.deckKey || "").trim(),
    folder: String(source.folder || "").trim(),
    prompt: String(source.prompt || "").trim(),
    badgeLabel: String(source.badgeLabel || "").trim(),
    sourceFile: String(source.sourceFile || "").trim(),
    ticketId: String(source.ticketId || "").trim(),
    conceptId: String(source.conceptId || "").trim(),
    variantId: String(source.variantId || "").trim()
  };
}

function sanitizeCommentBody(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, COMMENT_MAX_LENGTH);
}

function loadPreviewStore() {
  const raw = safeStorageGet(PREVIEW_STORAGE_KEY);
  if (!raw) {
    return { questions: Object.create(null) };
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? {
          questions: parsed.questions && typeof parsed.questions === "object"
            ? parsed.questions
            : Object.create(null)
        }
      : { questions: Object.create(null) };
  } catch {
    return { questions: Object.create(null) };
  }
}

function savePreviewStore(store) {
  safeStorageSet(PREVIEW_STORAGE_KEY, JSON.stringify(store));
}

function ensurePreviewQuestionRecord(store, entry) {
  const questionKey = String(entry.questionKey || "").trim();
  if (!questionKey) {
    throw new Error("Preview-Record ohne questionKey.");
  }
  const questions = store.questions && typeof store.questions === "object"
    ? store.questions
    : (store.questions = Object.create(null));
  const existing = questions[questionKey] && typeof questions[questionKey] === "object"
    ? questions[questionKey]
    : {
        meta: {},
        votesByClient: Object.create(null),
        comments: []
      };
  existing.meta = {
    ...existing.meta,
    questionKey,
    questionId: entry.questionId || questionKey,
    deckKey: entry.deckKey || "",
    folder: entry.folder || "",
    prompt: entry.prompt || "",
    badgeLabel: entry.badgeLabel || "",
    sourceFile: entry.sourceFile || "",
    ticketId: entry.ticketId || "",
    conceptId: entry.conceptId || "",
    variantId: entry.variantId || ""
  };
  if (!existing.votesByClient || typeof existing.votesByClient !== "object") {
    existing.votesByClient = Object.create(null);
  }
  if (!Array.isArray(existing.comments)) {
    existing.comments = [];
  }
  questions[questionKey] = existing;
  return existing;
}

function buildPreviewQuestionState(store, entry, clientId, statusText = "") {
  const record = ensurePreviewQuestionRecord(store, entry);
  const votes = Object.values(record.votesByClient || {});
  const likes = votes.filter((value) => Number(value) > 0).length;
  const dislikes = votes.filter((value) => Number(value) < 0).length;
  const comments = [...(Array.isArray(record.comments) ? record.comments : [])]
    .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
    .slice(0, 100)
    .map((comment) => ({
      id: String(comment.id || generateId("comment")),
      body: String(comment.body || "").trim(),
      createdAtMs: Number(comment.createdAtMs || 0),
      createdAtIso: String(comment.createdAtIso || ""),
      authorLabel: String(comment.clientId || "") === clientId ? "Du" : "Lernende",
      isOwn: String(comment.clientId || "") === clientId
    }))
    .filter((comment) => comment.body);
  return {
    mode: "preview",
    ready: true,
    canWrite: true,
    questionKey: entry.questionKey,
    likes,
    dislikes,
    userVote: Number(record.votesByClient?.[clientId] || 0),
    comments,
    statusText: statusText || "Lokaler Preview-Modus aktiv. Firebase-Daten fehlen noch.",
    error: ""
  };
}

function createPreviewService(config, reason = "") {
  const clientId = getClientId();
  let previewStore = loadPreviewStore();
  const listenersByKey = new Map();
  const statusText = String(reason || "Lokaler Preview-Modus aktiv. Firebase-Daten fehlen noch.").trim();

  function emit(questionKey) {
    const listeners = listenersByKey.get(questionKey);
    if (!listeners?.size) return;
    const entry = { questionKey };
    const snapshot = buildPreviewQuestionState(previewStore, entry, clientId, statusText);
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
      }
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== PREVIEW_STORAGE_KEY) return;
    previewStore = loadPreviewStore();
    listenersByKey.forEach((_, questionKey) => emit(questionKey));
  });

  return {
    mode: "preview",
    clientId,
    async describe() {
      return {
        mode: "preview",
        clientId,
        statusText
      };
    },
    async subscribeQuestion(rawEntry, onChange) {
      const entry = normalizeQuestionEntry(rawEntry);
      ensurePreviewQuestionRecord(previewStore, entry);
      savePreviewStore(previewStore);
      const listeners = listenersByKey.get(entry.questionKey) || new Set();
      listeners.add(onChange);
      listenersByKey.set(entry.questionKey, listeners);
      onChange(buildPreviewQuestionState(previewStore, entry, clientId, statusText));
      return () => {
        const current = listenersByKey.get(entry.questionKey);
        if (!current) return;
        current.delete(onChange);
        if (!current.size) listenersByKey.delete(entry.questionKey);
      };
    },
    async setVote(rawEntry, value) {
      const entry = normalizeQuestionEntry(rawEntry);
      const record = ensurePreviewQuestionRecord(previewStore, entry);
      const normalizedValue = Number(value) > 0 ? 1 : Number(value) < 0 ? -1 : 0;
      if (!normalizedValue) {
        delete record.votesByClient[clientId];
      } else {
        record.votesByClient[clientId] = normalizedValue;
      }
      savePreviewStore(previewStore);
      emit(entry.questionKey);
      return buildPreviewQuestionState(previewStore, entry, clientId, statusText);
    },
    async addComment(rawEntry, body) {
      const entry = normalizeQuestionEntry(rawEntry);
      const text = sanitizeCommentBody(body);
      if (!text) throw new Error("Kommentar ist leer.");
      const record = ensurePreviewQuestionRecord(previewStore, entry);
      const createdAtMs = Date.now();
      record.comments.push({
        id: generateId("comment"),
        clientId,
        body: text,
        createdAtMs,
        createdAtIso: new Date(createdAtMs).toISOString()
      });
      savePreviewStore(previewStore);
      emit(entry.questionKey);
      return buildPreviewQuestionState(previewStore, entry, clientId, statusText);
    }
  };
}

async function createFirebaseService(config) {
  const sdkVersion = config.sdkVersion || DEFAULT_SDK_VERSION;
  const appModule = await import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`);
  const firestoreModule = await import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-firestore.js`);
  const clientId = getClientId();
  const firebaseApp = appModule.getApps().length
    ? appModule.getApp()
    : appModule.initializeApp(config.app);
  const firestore = firestoreModule.getFirestore(firebaseApp);

  function getQuestionDoc(entry) {
    return firestoreModule.doc(
      firestore,
      config.firestore.feedbackCollection,
      entry.questionKey
    );
  }

  function buildQuestionMeta(entry) {
    const nowMs = Date.now();
    return {
      questionKey: entry.questionKey,
      questionId: entry.questionId,
      deckKey: entry.deckKey,
      folder: entry.folder,
      prompt: entry.prompt,
      badgeLabel: entry.badgeLabel,
      sourceFile: entry.sourceFile,
      ticketId: entry.ticketId,
      conceptId: entry.conceptId,
      variantId: entry.variantId,
      lastTouchedAt: firestoreModule.serverTimestamp(),
      lastTouchedAtMs: nowMs
    };
  }

  async function ensureQuestionMeta(entry) {
    const questionDoc = getQuestionDoc(entry);
    await firestoreModule.setDoc(questionDoc, buildQuestionMeta(entry), { merge: true });
    return questionDoc;
  }

  return {
    mode: "firebase",
    clientId,
    async describe() {
      return {
        mode: "firebase",
        clientId,
        statusText: `Live in Firebase (${config.app.projectId}).`
      };
    },
    async subscribeQuestion(rawEntry, onChange) {
      const entry = normalizeQuestionEntry(rawEntry);
      const questionDoc = getQuestionDoc(entry);
      let votesLoaded = false;
      let commentsLoaded = false;
      let snapshotState = {
        mode: "firebase",
        ready: false,
        canWrite: true,
        questionKey: entry.questionKey,
        likes: 0,
        dislikes: 0,
        userVote: 0,
        comments: [],
        statusText: `Verbinde Firebase (${config.app.projectId}) ...`,
        error: ""
      };

      function emit(patch = {}) {
        snapshotState = {
          ...snapshotState,
          ...patch,
          ready: votesLoaded && commentsLoaded && !patch.error
        };
        onChange(snapshotState);
      }

      emit();
      ensureQuestionMeta(entry).catch((error) => {
        emit({
          statusText: "Firebase-Metadaten konnten nicht gespeichert werden.",
          error: error instanceof Error ? error.message : "Metadatenfehler"
        });
      });

      const votesCollection = firestoreModule.collection(questionDoc, config.firestore.voteCollection);
      const commentsQuery = firestoreModule.query(
        firestoreModule.collection(questionDoc, config.firestore.commentCollection),
        firestoreModule.orderBy("createdAtMs", "desc"),
        firestoreModule.limit(config.firestore.commentLimit)
      );

      const unsubscribeVotes = firestoreModule.onSnapshot(
        votesCollection,
        (snapshot) => {
          votesLoaded = true;
          let likes = 0;
          let dislikes = 0;
          let userVote = 0;
          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data() || {};
            const value = Number(data.value || 0);
            if (value > 0) likes += 1;
            if (value < 0) dislikes += 1;
            if (String(data.clientId || docSnapshot.id) === clientId) {
              userVote = value > 0 ? 1 : value < 0 ? -1 : 0;
            }
          });
          emit({
            likes,
            dislikes,
            userVote,
            statusText: `Live in Firebase (${config.app.projectId}).`,
            error: ""
          });
        },
        (error) => {
          votesLoaded = true;
          emit({
            statusText: "Firebase-Votes konnten nicht geladen werden.",
            error: error instanceof Error ? error.message : "Vote-Ladefehler"
          });
        }
      );

      const unsubscribeComments = firestoreModule.onSnapshot(
        commentsQuery,
        (snapshot) => {
          commentsLoaded = true;
          const comments = snapshot.docs
            .map((docSnapshot) => {
              const data = docSnapshot.data() || {};
              const body = String(data.body || "").trim();
              if (!body) return null;
              return {
                id: docSnapshot.id,
                body,
                createdAtMs: Number(data.createdAtMs || 0),
                createdAtIso: String(data.createdAtIso || ""),
                authorLabel: String(data.clientId || "") === clientId ? "Du" : "Lernende",
                isOwn: String(data.clientId || "") === clientId
              };
            })
            .filter(Boolean);
          emit({
            comments,
            statusText: `Live in Firebase (${config.app.projectId}).`,
            error: ""
          });
        },
        (error) => {
          commentsLoaded = true;
          emit({
            statusText: "Firebase-Kommentare konnten nicht geladen werden.",
            error: error instanceof Error ? error.message : "Kommentar-Ladefehler"
          });
        }
      );

      return () => {
        try {
          unsubscribeVotes();
        } catch {
        }
        try {
          unsubscribeComments();
        } catch {
        }
      };
    },
    async setVote(rawEntry, value) {
      const entry = normalizeQuestionEntry(rawEntry);
      const questionDoc = await ensureQuestionMeta(entry);
      const normalizedValue = Number(value) > 0 ? 1 : Number(value) < 0 ? -1 : 0;
      const voteDoc = firestoreModule.doc(questionDoc, config.firestore.voteCollection, clientId);
      if (!normalizedValue) {
        await firestoreModule.deleteDoc(voteDoc);
        return;
      }
      const updatedAtMs = Date.now();
      await firestoreModule.setDoc(voteDoc, {
        clientId,
        value: normalizedValue,
        questionKey: entry.questionKey,
        questionId: entry.questionId,
        deckKey: entry.deckKey,
        folder: entry.folder,
        updatedAt: firestoreModule.serverTimestamp(),
        updatedAtMs
      }, { merge: true });
    },
    async addComment(rawEntry, body) {
      const entry = normalizeQuestionEntry(rawEntry);
      const text = sanitizeCommentBody(body);
      if (!text) throw new Error("Kommentar ist leer.");
      const questionDoc = await ensureQuestionMeta(entry);
      const createdAtMs = Date.now();
      await firestoreModule.addDoc(
        firestoreModule.collection(questionDoc, config.firestore.commentCollection),
        {
          clientId,
          body: text,
          questionKey: entry.questionKey,
          questionId: entry.questionId,
          deckKey: entry.deckKey,
          folder: entry.folder,
          prompt: entry.prompt,
          badgeLabel: entry.badgeLabel,
          sourceFile: entry.sourceFile,
          ticketId: entry.ticketId,
          conceptId: entry.conceptId,
          variantId: entry.variantId,
          createdAt: firestoreModule.serverTimestamp(),
          createdAtMs,
          createdAtIso: new Date(createdAtMs).toISOString()
        }
      );
    }
  };
}

async function buildVotingService() {
  const config = readRuntimeConfig();
  if (!isFeatureEnabled(config)) {
    return {
      mode: "disabled",
      clientId: "",
      async describe() {
        return {
          mode: "disabled",
          enabled: false,
          clientId: "",
          statusText: "DoomScroll-Feedback ist deaktiviert."
        };
      },
      async subscribeQuestion(_entry, onChange) {
        if (typeof onChange === "function") {
          onChange({
            mode: "disabled",
            ready: false,
            canWrite: false,
            likes: 0,
            dislikes: 0,
            userVote: 0,
            comments: [],
            statusText: "DoomScroll-Feedback ist deaktiviert.",
            error: ""
          });
        }
        return () => {};
      },
      async setVote() {},
      async addComment() {}
    };
  }
  if (config.mode !== "firebase") {
    return createPreviewService(config, "Lokaler Preview-Modus aktiv. Firebase-Daten fehlen noch.");
  }
  if (!isFirebaseConfigComplete(config.app)) {
    return createPreviewService(config, "Firebase-Modus ist vorbereitet, aber apiKey/projectId/appId fehlen noch.");
  }
  try {
    return await createFirebaseService(config);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Firebase konnte nicht geladen werden.";
    return createPreviewService(config, `Firebase-Start fehlgeschlagen. Lokaler Preview-Modus aktiv. ${detail}`);
  }
}

const votingServicePromise = buildVotingService();

window.DoomScrollVotingBridge = {
  isEnabled() {
    return isFeatureEnabled(readRuntimeConfig());
  },
  async describe() {
    const service = await votingServicePromise;
    return service.describe();
  },
  async subscribeQuestion(entry, onChange) {
    const service = await votingServicePromise;
    return service.subscribeQuestion(entry, onChange);
  },
  async setVote(entry, value) {
    const service = await votingServicePromise;
    return service.setVote(entry, value);
  },
  async addComment(entry, body) {
    const service = await votingServicePromise;
    return service.addComment(entry, body);
  }
};
