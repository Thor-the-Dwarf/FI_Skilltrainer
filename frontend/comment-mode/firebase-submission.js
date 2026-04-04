import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  increment,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyDGiMH6_7qRyu3F6xCybOvb7iTWe4Y7VN4",
  authDomain: "fi-skillstation.firebaseapp.com",
  projectId: "fi-skillstation",
  storageBucket: "fi-skillstation.firebasestorage.app",
  messagingSenderId: "1075408225012",
  appId: "1:1075408225012:web:227d2c8ce90c1105c894a1"
});

function getFirebaseApp() {
  const existing = getApps();
  return existing.length > 0 ? existing[0] : initializeApp(FIREBASE_CONFIG);
}

function getFeedbackCollectionNames() {
  const config = window.__FI_SKILLTRAINER_FIREBASE__ && typeof window.__FI_SKILLTRAINER_FIREBASE__ === "object"
    ? window.__FI_SKILLTRAINER_FIREBASE__
    : {};
  const firestore = config.firestore && typeof config.firestore === "object"
    ? config.firestore
    : {};
  const collection = String(firestore.feedbackCollection || "").trim();
  return [collection, "feedback", "doomscroll_feedback"].filter((value, index, list) => value && list.indexOf(value) === index);
}

function shortKurs(folder) {
  const safe = String(folder || "").trim();
  const match = safe.match(/^([A-Za-z]{2,4}\d{1,2})/i);
  if (match) return match[1].toUpperCase();
  return safe
    .replace(/[-_](Scenarien|Szenarien|Quiz|Scen|db)$/i, "")
    .replace(/[-_](Scenarien|Szenarien|Quiz|Scen|db)$/i, "") || safe;
}

function sanitizePart(value) {
  return String(value || "")
    .replace(/\.json$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function cleanQuestionId(questionId, folder) {
  if (!questionId || !folder) return questionId;
  const folderNorm = folder.toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  let result = questionId.startsWith(folderNorm + "_")
    ? questionId.slice(folderNorm.length + 1)
    : questionId;
  result = result.replace(/^db_/, "").replace(/^(?:ticket|quiz)_/, "");
  return result || questionId;
}

function cleanDeckKey(deckKey, folder) {
  if (!deckKey || !folder) return deckKey;
  const folderNorm = folder.toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return deckKey.replace(new RegExp(`[_-]${folderNorm.replace(/-/g, "[-_]")}$`, "i"), "") || deckKey;
}

function buildDoc(context) {
  const surface = String(context.surface || "generic");
  const folder = String(context.folder || "");
  const kurs = shortKurs(folder);
  const base = { surface, kurs };

  if (surface === "scenario") {
    const ticketId = sanitizePart(context.ticketId || context.entityId || "");
    const frageId = sanitizePart(context.questionId || "");
    const entity = frageId || ticketId;
    const docId = [kurs, "ticket", entity].filter(Boolean).join("_");
    return {
      docId,
      fields: { ...base, ...(ticketId && { ticketId }), ...(frageId && { frageId }) }
    };
  }

  if (surface === "training_question") {
    const rawId = sanitizePart(context.questionId || context.entityId || "");
    const frageId = cleanQuestionId(rawId, folder);
    const docId = [kurs, "training", frageId].filter(Boolean).join("_");
    return { docId, fields: { ...base, ...(frageId && { frageId }) } };
  }

  if (surface === "training") {
    const rawKey = sanitizePart(context.deckKey || context.entityId || "");
    const deckKey = cleanDeckKey(rawKey, folder);
    const docId = [kurs, "training", deckKey].filter(Boolean).join("_");
    return { docId, fields: { ...base, ...(deckKey && { deckKey }) } };
  }

  if (surface === "home") {
    const docId = kurs ? `SkillSet_${kurs}` : "SkillSet";
    return { docId, fields: base };
  }

  const entityId = sanitizePart(context.entityId || "");
  const docId = [kurs, "sonstige", entityId].filter(Boolean).join("_") || "sonstige";
  return { docId, fields: { ...base, ...(entityId && { entityId }) } };
}

export async function submitFeedback(payload = {}) {
  try {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const collectionNames = getFeedbackCollectionNames();

    const context = payload.contextRef && typeof payload.contextRef === "object"
      ? payload.contextRef
      : {};
    const { docId, fields } = buildDoc(context);
    if (!docId) throw new Error("Kontext konnte nicht bestimmt werden.");

    const update = { ...fields };
    const reaction = Number(payload.reaction) || 0;
    if (reaction === 1) update.likes = increment(1);
    if (reaction === -1) update.dislikes = increment(1);

    const message = String(payload.message || "").trim();
    if (message) {
      update.kommentare = arrayUnion({
        text: message,
        datum: new Date().toISOString()
      });
    }

    let lastError = null;
    for (const collectionName of collectionNames) {
      try {
        await setDoc(doc(db, collectionName, docId), update, { merge: true });
        return { ok: true, submissionId: docId };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Firebase-Fehler beim Speichern.");
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Firebase-Fehler beim Speichern."
    };
  }
}
