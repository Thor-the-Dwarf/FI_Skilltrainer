(function initEasyPVI18n(global) {
  const SQLJS_LOCAL_BASE_PATH = "./frontend/vendor/vendor/sqljs";
  const SQLJS_CDN_BASE_PATH = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0";
  const SQLJS_LOCAL_SCRIPT_PATH = `${SQLJS_LOCAL_BASE_PATH}/sql-wasm.min.js`;
  const SQLJS_LOCAL_WASM_PATH = `${SQLJS_LOCAL_BASE_PATH}/sql-wasm.wasm`;
  const SQLJS_CDN_SCRIPT_PATH = `${SQLJS_CDN_BASE_PATH}/sql-wasm.min.js`;
  const SQLJS_CDN_WASM_PATH = `${SQLJS_CDN_BASE_PATH}/sql-wasm.wasm`;
  const DEFAULT_UI_LOCALE = "de";
  const UI_LANGUAGE_STORAGE_KEY = "sr_ui_language";
  const DEFAULT_SQL_PATHS = Object.freeze([
    "./frontend/i18n/sql/schema.sql",
    "./frontend/i18n/sql/locales.sql",
    "./frontend/i18n/sql/messages_de.sql",
    "./frontend/i18n/sql/messages_en.sql"
  ]);

  let sqlJsRuntimePromise = null;
  const externalScriptPromisesBySrc = Object.create(null);

  function ensureExternalScriptLoaded(src) {
    const safeSrc = String(src || "").trim();
    if (!safeSrc) {
      return Promise.reject(new Error("Missing script source."));
    }
    if (externalScriptPromisesBySrc[safeSrc]) {
      return externalScriptPromisesBySrc[safeSrc];
    }
    externalScriptPromisesBySrc[safeSrc] = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${safeSrc}"]`);
      const handleLoad = () => resolve(safeSrc);
      const handleError = () => reject(new Error(`Could not load script: ${safeSrc}`));
      if (!existing) {
        const script = document.createElement("script");
        script.src = safeSrc;
        script.async = true;
        script.addEventListener("load", handleLoad, { once: true });
        script.addEventListener("error", handleError, { once: true });
        document.head.appendChild(script);
        return;
      }
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
    });
    return externalScriptPromisesBySrc[safeSrc];
  }

  async function ensureSqlJsFactoryLoaded() {
    if (typeof global.initSqlJs === "function") return global.initSqlJs;
    try {
      await ensureExternalScriptLoaded(SQLJS_LOCAL_SCRIPT_PATH);
    } catch {
      await ensureExternalScriptLoaded(SQLJS_CDN_SCRIPT_PATH);
    }
    if (typeof global.initSqlJs !== "function") {
      throw new Error("SQLite runtime could not be initialized.");
    }
    return global.initSqlJs;
  }

  async function ensureSqlJsRuntime() {
    if (sqlJsRuntimePromise) return sqlJsRuntimePromise;
    sqlJsRuntimePromise = (async () => {
      const initSqlJs = await ensureSqlJsFactoryLoaded();
      try {
        return await initSqlJs({
          locateFile: () => SQLJS_LOCAL_WASM_PATH
        });
      } catch {
        return initSqlJs({
          locateFile: () => SQLJS_CDN_WASM_PATH
        });
      }
    })().catch((error) => {
      sqlJsRuntimePromise = null;
      throw error;
    });
    return sqlJsRuntimePromise;
  }

  function querySqliteRows(database, sql, params = []) {
    if (!database || !sql) return [];
    const statement = database.prepare(sql);
    try {
      if (Array.isArray(params) && params.length) {
        statement.bind(params);
      }
      const rows = [];
      while (statement.step()) {
        rows.push(statement.getAsObject());
      }
      return rows;
    } finally {
      statement.free();
    }
  }

  function createRuntime(options = {}) {
    const config = {
      sqlPaths: Array.isArray(options.sqlPaths) && options.sqlPaths.length ? options.sqlPaths : DEFAULT_SQL_PATHS,
      defaultLocale: normalizeUiLocale(options.defaultLocale || DEFAULT_UI_LOCALE),
      storageKey: String(options.storageKey || UI_LANGUAGE_STORAGE_KEY),
      documentTitleKey: String(options.documentTitleKey || "").trim(),
      documentTitleFallback: String(options.documentTitleFallback || document.title || "").trim()
    };

    let catalogPromise = null;
    let activeUiLocale = config.defaultLocale;
    let observer = null;
    const uiLocales = [];
    const uiMessagesByLocale = new Map();
    const uiLiteralTranslationsByLocale = new Map();
    const i18nTextSourceByNode = new WeakMap();
    const i18nAttributeSourceByElement = new WeakMap();
    const i18nMessageFallbackByElement = new WeakMap();
    const localeListeners = new Set();

    function normalizeUiLocale(value = "") {
      const raw = String(value || "").trim().toLowerCase();
      if (!raw) return config.defaultLocale;
      const base = raw.split(/[-_]/)[0];
      return base || config.defaultLocale;
    }

    function getIntlLocale() {
      return normalizeUiLocale(activeUiLocale) === "en" ? "en-US" : "de-DE";
    }

    function loadStoredUiLocale() {
      try {
        const stored = localStorage.getItem(config.storageKey);
        return stored ? normalizeUiLocale(stored) : "";
      } catch {
        return "";
      }
    }

    function persistUiLocale(locale) {
      try {
        localStorage.setItem(config.storageKey, normalizeUiLocale(locale));
      } catch {
      }
    }

    function getSupportedUiLocales() {
      return uiLocales.length
        ? [...uiLocales]
        : [{ code: config.defaultLocale, label: "German", nativeLabel: "Deutsch", isDefault: true }];
    }

    function getUiLocaleMeta(locale = "") {
      const normalized = normalizeUiLocale(locale || activeUiLocale);
      return getSupportedUiLocales().find((entry) => normalizeUiLocale(entry.code) === normalized) || null;
    }

    function formatI18nMessage(template = "", params = null) {
      const source = String(template || "");
      if (!params || typeof params !== "object") return source;
      return source.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token) => {
        if (!Object.prototype.hasOwnProperty.call(params, token)) return match;
        return String(params[token] ?? "");
      });
    }

    function t(messageKey, fallback = "", params = null) {
      const key = String(messageKey || "").trim();
      const locale = normalizeUiLocale(activeUiLocale);
      const activeMessages = uiMessagesByLocale.get(locale);
      const defaultMessages = uiMessagesByLocale.get(config.defaultLocale);
      const source = (activeMessages && activeMessages.get(key)) ||
        (defaultMessages && defaultMessages.get(key)) ||
        String(fallback || key);
      return formatI18nMessage(source, params);
    }

    function literal(value = "") {
      const source = String(value ?? "");
      if (!source) return source;
      const locale = normalizeUiLocale(activeUiLocale);
      if (locale === config.defaultLocale) return source;
      const translations = uiLiteralTranslationsByLocale.get(locale);
      return (translations && translations.get(source)) || source;
    }

    function isKnownI18nVariant(source = "", value = "") {
      const sourceText = String(source ?? "");
      const candidate = String(value ?? "");
      if (!sourceText || !candidate) return sourceText === candidate;
      if (candidate === sourceText) return true;
      for (const translations of uiLiteralTranslationsByLocale.values()) {
        if ((translations && translations.get(sourceText)) === candidate) {
          return true;
        }
      }
      return false;
    }

    function shouldSkipI18nForElement(element) {
      return Boolean(element?.closest?.("[data-i18n-skip='true']"));
    }

    function getTrackedElementAttributes(element) {
      let tracked = i18nAttributeSourceByElement.get(element);
      if (!tracked) {
        tracked = new Map();
        i18nAttributeSourceByElement.set(element, tracked);
      }
      return tracked;
    }

    function getTrackedMessageFallbacks(element) {
      let tracked = i18nMessageFallbackByElement.get(element);
      if (!tracked) {
        tracked = new Map();
        i18nMessageFallbackByElement.set(element, tracked);
      }
      return tracked;
    }

    function translateElementMessageText(element) {
      if (!element?.hasAttribute?.("data-i18n-key") || shouldSkipI18nForElement(element)) return;
      const messageKey = String(element.getAttribute("data-i18n-key") || "").trim();
      if (!messageKey) return;
      const tracked = getTrackedMessageFallbacks(element);
      if (!tracked.has("data-i18n-key")) {
        tracked.set("data-i18n-key", String(element.textContent || ""));
      }
      const fallback = tracked.get("data-i18n-key");
      const translated = t(messageKey, fallback);
      if (String(element.textContent || "") !== translated) {
        element.textContent = translated;
      }
    }

    function translateElementMessageAttribute(element, keyAttributeName, targetAttributeName) {
      if (!element?.hasAttribute?.(keyAttributeName) || shouldSkipI18nForElement(element)) return;
      const messageKey = String(element.getAttribute(keyAttributeName) || "").trim();
      if (!messageKey) return;
      const tracked = getTrackedMessageFallbacks(element);
      if (!tracked.has(keyAttributeName)) {
        tracked.set(keyAttributeName, String(element.getAttribute(targetAttributeName) || ""));
      }
      const fallback = tracked.get(keyAttributeName);
      const translated = t(messageKey, fallback);
      if (String(element.getAttribute(targetAttributeName) || "") !== translated) {
        element.setAttribute(targetAttributeName, translated);
      }
    }

    function translateElementAttribute(element, attributeName) {
      if (!element?.hasAttribute?.(attributeName) || shouldSkipI18nForElement(element)) return;
      if (attributeName === "title" && element.hasAttribute("data-i18n-title-key")) return;
      if (attributeName === "aria-label" && element.hasAttribute("data-i18n-aria-label-key")) return;
      if (attributeName === "placeholder" && element.hasAttribute("data-i18n-placeholder-key")) return;
      if (attributeName === "data-appbar-tooltip" && element.hasAttribute("data-i18n-appbar-tooltip-key")) return;
      const tracked = getTrackedElementAttributes(element);
      const currentValue = String(element.getAttribute(attributeName) || "");
      if (!tracked.has(attributeName)) {
        tracked.set(attributeName, currentValue);
      } else if (!isKnownI18nVariant(tracked.get(attributeName), currentValue)) {
        tracked.set(attributeName, currentValue);
      }
      const source = tracked.get(attributeName);
      const translated = literal(source);
      if (currentValue !== translated) {
        element.setAttribute(attributeName, translated);
      }
    }

    function translateElementAttributes(element) {
      if (!element || shouldSkipI18nForElement(element)) return;
      translateElementMessageText(element);
      translateElementMessageAttribute(element, "data-i18n-title-key", "title");
      translateElementMessageAttribute(element, "data-i18n-aria-label-key", "aria-label");
      translateElementMessageAttribute(element, "data-i18n-placeholder-key", "placeholder");
      translateElementMessageAttribute(element, "data-i18n-appbar-tooltip-key", "data-appbar-tooltip");
      translateElementAttribute(element, "title");
      translateElementAttribute(element, "aria-label");
      translateElementAttribute(element, "placeholder");
      translateElementAttribute(element, "data-appbar-tooltip");
    }

    function translateTextNode(node) {
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const parent = node.parentElement;
      if (!parent || shouldSkipI18nForElement(parent)) return;
      if (parent.hasAttribute("data-i18n-key")) return;
      if (["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"].includes(parent.tagName)) return;
      const currentValue = String(node.nodeValue || "");
      if (!currentValue.trim()) return;
      if (!i18nTextSourceByNode.has(node)) {
        i18nTextSourceByNode.set(node, currentValue);
      } else if (!isKnownI18nVariant(i18nTextSourceByNode.get(node), currentValue)) {
        i18nTextSourceByNode.set(node, currentValue);
      }
      const source = i18nTextSourceByNode.get(node);
      const translated = literal(source);
      if (currentValue !== translated) {
        node.nodeValue = translated;
      }
    }

    function translateDomSubtree(root) {
      if (!root) return;
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root);
        return;
      }
      const container = root.nodeType === Node.DOCUMENT_NODE
        ? root.documentElement
        : root;
      if (!container || container.nodeType !== Node.ELEMENT_NODE) return;
      translateElementAttributes(container);
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const current = walker.currentNode;
        if (current.nodeType === Node.TEXT_NODE) {
          translateTextNode(current);
        } else if (current.nodeType === Node.ELEMENT_NODE) {
          translateElementAttributes(current);
        }
      }
    }

    async function ensureCatalogLoaded() {
      if (catalogPromise) return catalogPromise;
      catalogPromise = (async () => {
        const [SQL, sqlScripts] = await Promise.all([
          ensureSqlJsRuntime(),
          Promise.all(config.sqlPaths.map(async (path) => {
            const response = await fetch(path, { cache: "no-store" });
            if (!response.ok) {
              throw new Error(`Could not load i18n SQL: ${path}`);
            }
            return response.text();
          }))
        ]);
        const database = new SQL.Database();
        try {
          for (const script of sqlScripts) {
            database.run(script);
          }

          uiLocales.length = 0;
          const localeRows = querySqliteRows(
            database,
            `SELECT code, label, native_label, sort_order, is_default
             FROM ui_locale
             ORDER BY sort_order, code COLLATE NOCASE`
          );
          localeRows.forEach((row) => {
            uiLocales.push({
              code: normalizeUiLocale(row.code || config.defaultLocale),
              label: String(row.label || row.code || "").trim() || String(row.code || "").trim(),
              nativeLabel: String(row.native_label || row.label || row.code || "").trim() || String(row.code || "").trim(),
              isDefault: Number(row.is_default) === 1
            });
          });

          uiMessagesByLocale.clear();
          const messageRows = querySqliteRows(
            database,
            `SELECT locale_code, message_key, message_text
             FROM ui_message
             ORDER BY locale_code, message_key`
          );
          messageRows.forEach((row) => {
            const locale = normalizeUiLocale(row.locale_code || config.defaultLocale);
            const map = uiMessagesByLocale.get(locale) || new Map();
            map.set(String(row.message_key || "").trim(), String(row.message_text || ""));
            uiMessagesByLocale.set(locale, map);
          });

          uiLiteralTranslationsByLocale.clear();
          const literalRows = querySqliteRows(
            database,
            `SELECT locale_code, source_text, translated_text
             FROM ui_literal_translation
             ORDER BY locale_code, source_text`
          );
          literalRows.forEach((row) => {
            const locale = normalizeUiLocale(row.locale_code || config.defaultLocale);
            const map = uiLiteralTranslationsByLocale.get(locale) || new Map();
            map.set(String(row.source_text || ""), String(row.translated_text || ""));
            uiLiteralTranslationsByLocale.set(locale, map);
          });

          return true;
        } finally {
          database.close();
        }
      })().catch((error) => {
        catalogPromise = null;
        throw error;
      });
      return catalogPromise;
    }

    function detectPreferredLocale() {
      const stored = loadStoredUiLocale();
      const supported = new Set(getSupportedUiLocales().map((entry) => normalizeUiLocale(entry.code)));
      if (stored && supported.has(stored)) return stored;
      const browserLocales = Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || config.defaultLocale];
      for (const candidate of browserLocales) {
        const normalized = normalizeUiLocale(candidate);
        if (supported.has(normalized)) return normalized;
      }
      return config.defaultLocale;
    }

    function updateDocumentState() {
      document.documentElement.lang = normalizeUiLocale(activeUiLocale);
      if (config.documentTitleKey) {
        document.title = t(config.documentTitleKey, config.documentTitleFallback || document.title);
      } else if (config.documentTitleFallback) {
        document.title = literal(config.documentTitleFallback);
      }
    }

    function notifyLocaleChanged() {
      localeListeners.forEach((listener) => {
        try {
          listener(activeUiLocale);
        } catch (error) {
          console.warn("Locale listener failed.", error);
        }
      });
    }

    function stopObserving() {
      observer?.disconnect();
      observer = null;
    }

    function observe(root = document.body) {
      stopObserving();
      if (!root) return;
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            translateTextNode(mutation.target);
            continue;
          }
          if (mutation.type === "attributes") {
            translateElementAttributes(mutation.target);
            continue;
          }
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              translateDomSubtree(node);
            });
          }
        }
      });
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          "title",
          "aria-label",
          "placeholder",
          "data-appbar-tooltip",
          "data-i18n-key",
          "data-i18n-title-key",
          "data-i18n-aria-label-key",
          "data-i18n-placeholder-key",
          "data-i18n-appbar-tooltip-key"
        ]
      });
    }

    async function init(preferredLocale = "") {
      try {
        await ensureCatalogLoaded();
        activeUiLocale = preferredLocale ? normalizeUiLocale(preferredLocale) : detectPreferredLocale();
      } catch (error) {
        activeUiLocale = config.defaultLocale;
        console.warn("UI i18n could not be initialized.", error);
      }
      updateDocumentState();
      return activeUiLocale;
    }

    async function setLocale(locale) {
      activeUiLocale = normalizeUiLocale(locale || config.defaultLocale);
      persistUiLocale(activeUiLocale);
      updateDocumentState();
      notifyLocaleChanged();
      return activeUiLocale;
    }

    function onLocaleChanged(listener) {
      if (typeof listener !== "function") return () => {};
      localeListeners.add(listener);
      return () => {
        localeListeners.delete(listener);
      };
    }

    return Object.freeze({
      init,
      ensureCatalogLoaded,
      observe,
      stopObserving,
      translateDomSubtree,
      t,
      literal,
      getIntlLocale,
      getLocale() {
        return activeUiLocale;
      },
      getLocaleMeta: getUiLocaleMeta,
      getSupportedLocales,
      setLocale,
      onLocaleChanged,
      storageKey: config.storageKey,
      defaultLocale: config.defaultLocale
    });
  }

  global.EasyPVI18n = Object.freeze({
    DEFAULT_UI_LOCALE,
    UI_LANGUAGE_STORAGE_KEY,
    UI_I18N_SQL_PATHS: DEFAULT_SQL_PATHS,
    ensureSqlJsRuntime,
    querySqliteRows,
    createRuntime
  });
})(window);
