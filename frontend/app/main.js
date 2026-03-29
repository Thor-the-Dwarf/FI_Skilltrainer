    const workspaceLeft = document.getElementById("workspaceLeft");
    const submitBar = document.querySelector(".submit-bar");
    const devSubmitTools = document.getElementById("devSubmitTools");
    const devFillWrongButton = document.getElementById("btnDevFillWrong");
    const devFillCorrectButton = document.getElementById("btnDevFillCorrect");
    const submitButton = document.getElementById("btnSubmit");
    const taskNavDrawer = document.getElementById("taskNavDrawer");
    const taskNavDrawerList = document.getElementById("taskNavDrawerList");
    const taskNavDrawerToggleBtn = document.getElementById("btnTaskDrawerToggle");
    const taskNavDrawerCloseBtn = document.getElementById("btnTaskDrawerClose");
    const taskNavBackdrop = document.getElementById("taskNavBackdrop");
    const trainingProgressRail = document.getElementById("trainingProgressRail");
    const trainingProgressRailTrack = document.getElementById("trainingProgressRailTrack");
    const trainingProgressRailCorrect = document.getElementById("trainingProgressRailCorrect");
    const trainingProgressRailWrong = document.getElementById("trainingProgressRailWrong");
    const trainingProgressRailOpen = document.getElementById("trainingProgressRailOpen");
    const trainingNavBackdrop = document.getElementById("trainingNavBackdrop");
    const courseNavBackdrop = document.getElementById("courseNavBackdrop");
    const scenarioNavBackdrop = document.getElementById("scenarioNavBackdrop");
    const appbarShellSvg = document.getElementById("appbarShellSvg");
    const appbarShellPath = document.getElementById("appbarShellPath");
    const appbarLeftSlot = document.getElementById("appbarLeftSlot");
    const leftAppBar = document.getElementById("leftAppBar");
    const primaryNavControls = document.getElementById("primaryNavControls");
    const trainingMenuButton = document.getElementById("btnTrainingMenu");
    const trainingMenuCloseButton = document.getElementById("btnTrainingMenuClose");
    const courseMenuButton = document.getElementById("btnCourseMenu");
    const courseMenuCloseButton = document.getElementById("btnCourseMenuClose");
    const scenarioMenuButton = document.getElementById("btnScenarioMenu");
    const scenarioMenuButtonBadge = document.getElementById("scenarioMenuButtonBadge");
    const scenarioMenuCloseButton = document.getElementById("btnScenarioMenuClose");
    const presenterButton = document.getElementById("btnPresenter");
    const challengeAppbarAction = document.getElementById("challengeAppbarAction");
    const challengeButton = document.getElementById("btnChallenge");
    const homeButton = document.getElementById("btnHome");
    const tooltipToggleBtn = document.getElementById("btnTooltipToggle");
    const tooltipToggleIcon = document.getElementById("tooltipToggleIcon");
    const tooltipToggleLabel = document.getElementById("tooltipToggleLabel");
    const topRightMenuButton = document.getElementById("btnTopRightMenu");
    const topRightMenuPanel = document.getElementById("topRightMenuPanel");
    const accessManagerButton = document.getElementById("btnAccessManager");
    const trainingMenu = document.getElementById("trainingMenu");
    const trainingMenuOptions = document.getElementById("trainingMenuOptions");
    const courseMenu = document.getElementById("courseMenu");
    const courseMenuOptions = document.getElementById("courseMenuOptions");
    const scenarioMenu = document.getElementById("scenarioMenu");
    const scenarioMenuOptions = document.getElementById("scenarioMenuOptions");
    const languageMenuButton = document.getElementById("btnLanguageMenu");
    const languageButtonCode = document.getElementById("languageButtonCode");
    const languageMenuLabel = document.getElementById("languageMenuLabel");
    const languageMenu = document.getElementById("languageMenu");
    const languageMenuOptions = document.getElementById("languageMenuOptions");
    const themeToggleBtn = document.getElementById("btnThemeToggle");
    const themeToggleIcon = document.getElementById("themeToggleIcon");
    const themeToggleLabel = document.getElementById("themeToggleLabel");
    const desktopLeftAppBarQuery = window.matchMedia("(min-width: 981px)");
    const THEME_STORAGE_KEY = "sr_theme_mode";
    const TOOLTIP_VISIBILITY_STORAGE_KEY = "sr_ui_tooltips_enabled";
    const UI_LANGUAGE_STORAGE_KEY = "sr_ui_language";
    const ACCESS_ENTRIES_STORAGE_KEY = "sr_access_entries";
    const ACCESS_ACTIVE_FOLDER_STORAGE_KEY = "sr_active_folder";
    const ACCESS_KEY_STORAGE_KEY = "sr_access_key";
    const ACCESS_FOLDER_STORAGE_KEY = "sr_access_folder";
    const ACCESS_KEYS_CONFIG_PATH = "./backend/data/access-keys.json";
    const ACCESS_BUNDLES_CONFIG_PATH = "./backend/data/access-bundles.json";
    const LOCALHOST_ADMIN_SELECTED_KEY_STORAGE_KEY = "sr_local_admin_selected_key";
    const HOME_SKILLS_FOLDER_STORAGE_KEY = "sr_home_skills_folder";
    const SCENARIO_FOLDER_CATALOG_STORAGE_KEY = "sr_scenario_folder_catalog_v1";
    const SCENARIO_TREE_CACHE_STORAGE_KEY = "sr_scenario_tree_cache_v1";
    const TRAINING_DECK_CATALOG_STORAGE_KEY = "sr_training_deck_catalog_v1";
    const TRAINING_DECK_CACHE_STORAGE_KEY = "sr_training_deck_cache_v1";
    const COURSE_UNLOCK_STATE_STORAGE_KEY_PREFIX = "sr_course_unlock_v1";
    const SQLJS_LOCAL_BASE_PATH = "./frontend/vendor/vendor/sqljs";
    const SQLJS_CDN_BASE_PATH = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0";
    const SQLJS_LOCAL_SCRIPT_PATH = `${SQLJS_LOCAL_BASE_PATH}/sql-wasm.min.js`;
    const SQLJS_LOCAL_WASM_PATH = `${SQLJS_LOCAL_BASE_PATH}/sql-wasm.wasm`;
    const SQLJS_CDN_SCRIPT_PATH = `${SQLJS_CDN_BASE_PATH}/sql-wasm.min.js`;
    const SQLJS_CDN_WASM_PATH = `${SQLJS_CDN_BASE_PATH}/sql-wasm.wasm`;
    const UI_I18N_SQL_PATHS = Object.freeze([
      "./frontend/i18n/sql/schema.sql",
      "./frontend/i18n/sql/locales.sql",
      "./frontend/i18n/sql/messages_de.sql",
      "./frontend/i18n/sql/messages_en.sql"
    ]);
    const DEFAULT_UI_LOCALE = "de";
    const SKILL_PROGRESS_STORAGE_KEY_PREFIX = "sr_skill_progress_v1";
    const SCENARIO_RATING_STORAGE_KEY_PREFIX = "sr_scenario_rating_v1";
    const QUESTION_MARKER_STORAGE_KEY_PREFIX = "sr_question_marker_v1";
    const QUESTION_MARKER_INTERACTION_STORAGE_KEY_PREFIX = "sr_question_marker_touch_v1";
    const MANUAL_SHORTTEXT_CREDIT_BUTTON_KEY = "scenario.review.manual_credit";
    const DEFAULT_SKILL_TARGET_CORRECT = 8;
    const SUBMIT_BUTTON_READY_KEY = "scenario.submit.ready";
    const QUESTION_MARKER_STATE_ORDER = ["none", "answered", "marked"];
    const QUESTION_MARKER_META = Object.freeze({
      none: {
        label: "offen",
        uiLabel: "offen"
      },
      answered: {
        label: "bearbeitet",
        uiLabel: "bearbeitet"
      },
      marked: {
        label: "markiert",
        uiLabel: "markiert"
      }
    });
    const FALLBACK_ACCESS_KEY_TO_FOLDER = Object.freeze({
      LF01_03_26: "LF01-Scenarien",
      LF02_03_26: "LF02-Scenarien",
      LF03_03_26: "LF03-Scenarien",
      LF04_03_26: "LF04-Scenarien",
      LF05_03_26: "LF05-Scenarien",
      LF06_03_26: "LF06-Scenarien",
      LF07_03_26: "LF07-Scenarien",
      LF08_03_26: "LF08-Scenarien",
      LF09_03_26: "LF09-Scenarien",
      LF10FIAE_03_26: "LF10FIAE-Scenarien",
      LF11FIAE_03_26: "LF11FIAE-Scenarien",
      LF12FIAE_03_26: "LF12FIAE-Scenarien",
      QUS2_03_26: "QuS2-Scenarien"
    });
    const FALLBACK_ACCESS_KEY_TO_SCENARIO_ITEMS = Object.freeze({
      QUS2_03_26: Object.freeze({
        "QuS2-Scenarien": Object.freeze([
          "01_easy_ausbildungsbetrieb_ticketstau_rollenchaos_fehlende_abnahme.json"
        ])
      })
    });
    const DOOM_SCROLL_PSEUDO_QUESTION_TEMPLATES = Object.freeze([
      Object.freeze({
        promptKey: "training.pseudo.communication.prompt",
        prompt: "Die Kommunikation muss kanalgebunden, transparent und friktionsarm erfolgen.",
        options: Object.freeze([
          Object.freeze({
            textKey: "training.pseudo.communication.option.1",
            text: "Wir brauchen einen klaren Chat für Rückfragen und Absprachen."
          }),
          Object.freeze({
            textKey: "training.pseudo.communication.option.2",
            text: "Alle reden einfach gleichzeitig, Hauptsache schnell."
          }),
          Object.freeze({
            textKey: "training.pseudo.communication.option.3",
            text: "Nur die Teamleitung darf überhaupt noch schreiben."
          }),
          Object.freeze({
            textKey: "training.pseudo.communication.option.4",
            text: "Wir warten erstmal, bis das Problem von selbst verschwindet."
          })
        ]),
        correctIndex: 0,
        explanationKey: "training.pseudo.communication.explanation",
        explanation: "Der Fachsatz meint hier schlicht: ein gemeinsamer, klarer Kommunikationskanal hilft dem Team.",
        isNew: true
      }),
      Object.freeze({
        promptKey: "training.pseudo.ownership.prompt",
        prompt: "Die Rollenverteilung bleibt diffus, solange Ownership nicht explizit benannt wird.",
        options: Object.freeze([
          Object.freeze({
            textKey: "training.pseudo.ownership.option.1",
            text: "Niemand weiss so genau, wer was wirklich übernimmt."
          }),
          Object.freeze({
            textKey: "training.pseudo.ownership.option.2",
            text: "Alle Rollen sind bereits perfekt dokumentiert."
          }),
          Object.freeze({
            textKey: "training.pseudo.ownership.option.3",
            text: "Es gibt zu viele Monitore im Raum."
          }),
          Object.freeze({
            textKey: "training.pseudo.ownership.option.4",
            text: "Das Ticket ist automatisch abgeschlossen."
          })
        ]),
        correctIndex: 0,
        explanationKey: "training.pseudo.ownership.explanation",
        explanation: "Ownership meint hier Verantwortung. Ohne klare Zuständigkeit bleibt die Arbeit liegen.",
        isNew: true
      }),
      Object.freeze({
        promptKey: "training.pseudo.alignment.prompt",
        prompt: "Vor einer Entscheidung braucht das Team einen konsistenten Abgleich des aktuellen Stands.",
        options: Object.freeze([
          Object.freeze({
            textKey: "training.pseudo.alignment.option.1",
            text: "Wir sollten erst alle auf denselben Stand bringen."
          }),
          Object.freeze({
            textKey: "training.pseudo.alignment.option.2",
            text: "Jede Person entscheidet einfach für sich allein."
          }),
          Object.freeze({
            textKey: "training.pseudo.alignment.option.3",
            text: "Wir löschen vorsichtshalber alle bisherigen Notizen."
          }),
          Object.freeze({
            textKey: "training.pseudo.alignment.option.4",
            text: "Neue Tickets sind grundsätzlich wichtiger als alte."
          })
        ]),
        correctIndex: 0,
        explanationKey: "training.pseudo.alignment.explanation",
        explanation: "Gemeint ist: erst gemeinsamen Kontext herstellen, dann entscheiden.",
        isNew: false
      }),
      Object.freeze({
        promptKey: "training.pseudo.feedback.prompt",
        prompt: "Die Rückmeldung sollte zeitnah, konkret und anschlussfähig sein.",
        options: Object.freeze([
          Object.freeze({
            textKey: "training.pseudo.feedback.option.1",
            text: "Feedback soll schnell kommen und direkt helfen, weiterzuarbeiten."
          }),
          Object.freeze({
            textKey: "training.pseudo.feedback.option.2",
            text: "Rückmeldung hilft am meisten nach mehreren Wochen."
          }),
          Object.freeze({
            textKey: "training.pseudo.feedback.option.3",
            text: "Am besten sagt man nur, dass alles kompliziert ist."
          }),
          Object.freeze({
            textKey: "training.pseudo.feedback.option.4",
            text: "Feedback sollte möglichst gar keinen nächsten Schritt nennen."
          })
        ]),
        correctIndex: 0,
        explanationKey: "training.pseudo.feedback.explanation",
        explanation: "Anschlussfaehig heisst hier: so konkret, dass die andere Person direkt weiterarbeiten kann.",
        isNew: false
      })
    ]);
    const TRAINING_QUESTION_KIND_META = Object.freeze({
      aussage_bewerten: Object.freeze({
        badgeLabelKey: "training.kind.aussage_bewerten",
        badgeLabelFallback: "Stimmt diese Aussage?",
        defaultInteractionType: "binary"
      }),
      eine_richtige_antwort_waehlen: Object.freeze({
        badgeLabelKey: "training.kind.eine_richtige_antwort_waehlen",
        badgeLabelFallback: "Welche Antwort trifft am besten zu?",
        defaultInteractionType: "single"
      }),
      mehrere_richtige_antworten_waehlen: Object.freeze({
        badgeLabelKey: "training.kind.mehrere_richtige_antworten_waehlen",
        badgeLabelFallback: "Welche Aussagen sind korrekt?",
        defaultInteractionType: "multi"
      }),
      beste_option_im_mini_szenario: Object.freeze({
        badgeLabelKey: "training.kind.beste_option_im_mini_szenario",
        badgeLabelFallback: "Was waere hier der beste naechste Schritt?",
        defaultInteractionType: "best"
      }),
      begriff_zu_definition: Object.freeze({
        badgeLabelKey: "training.kind.begriff_zu_definition",
        badgeLabelFallback: "Welcher Begriff passt zu dieser Beschreibung?",
        defaultInteractionType: "single"
      }),
      definition_zu_begriff: Object.freeze({
        badgeLabelKey: "training.kind.definition_zu_begriff",
        badgeLabelFallback: "Was bedeutet dieser Begriff?",
        defaultInteractionType: "single"
      }),
      beispiel_erkennen: Object.freeze({
        badgeLabelKey: "training.kind.beispiel_erkennen",
        badgeLabelFallback: "Welches Beispiel passt zu X?",
        defaultInteractionType: "single"
      }),
      gegenbeispiel_erkennen: Object.freeze({
        badgeLabelKey: "training.kind.gegenbeispiel_erkennen",
        badgeLabelFallback: "Welches Beispiel passt gerade nicht zu X?",
        defaultInteractionType: "single"
      }),
      kategorie_zuordnen: Object.freeze({
        badgeLabelKey: "training.kind.kategorie_zuordnen",
        badgeLabelFallback: "Wozu gehoert dieser Fall / Begriff / Schritt?",
        defaultInteractionType: "single"
      }),
      reihenfolge_bestimmen: Object.freeze({
        badgeLabelKey: "training.kind.reihenfolge_bestimmen",
        badgeLabelFallback: "Was kommt zuerst / danach / zuletzt?",
        defaultInteractionType: "sequence"
      }),
      fehler_finden: Object.freeze({
        badgeLabelKey: "training.kind.fehler_finden",
        badgeLabelFallback: "Welche Option enthaelt den Denkfehler / Regelverstoss / Bruch?",
        defaultInteractionType: "single"
      }),
      luecke_fuellen: Object.freeze({
        badgeLabelKey: "training.kind.luecke_fuellen",
        badgeLabelFallback: "Welche Antwort ergaenzt den Satz sinnvoll?",
        defaultInteractionType: "gap_fill_choice"
      }),
      vergleich_treffen: Object.freeze({
        badgeLabelKey: "training.kind.vergleich_treffen",
        badgeLabelFallback: "Worin liegt der wichtigste Unterschied?",
        defaultInteractionType: "single"
      }),
      prioritaet_setzen: Object.freeze({
        badgeLabelKey: "training.kind.prioritaet_setzen",
        badgeLabelFallback: "Was ist hier am wichtigsten?",
        defaultInteractionType: "best"
      }),
      ursache_folge_erkennen: Object.freeze({
        badgeLabelKey: "training.kind.ursache_folge_erkennen",
        badgeLabelFallback: "Welche Folge ergibt sich am ehesten daraus?",
        defaultInteractionType: "single"
      }),
      was_fehlt: Object.freeze({
        badgeLabelKey: "training.kind.was_fehlt",
        badgeLabelFallback: "Welcher Punkt fehlt noch, damit es vollstaendig ist?",
        defaultInteractionType: "single"
      }),
      passende_massnahme_auswaehlen: Object.freeze({
        badgeLabelKey: "training.kind.passende_massnahme_auswaehlen",
        badgeLabelFallback: "Welche Massnahme passt am besten zur Situation?",
        defaultInteractionType: "best"
      }),
      ziel_mittel_zuordnung: Object.freeze({
        badgeLabelKey: "training.kind.ziel_mittel_zuordnung",
        badgeLabelFallback: "Welche Option hilft am ehesten, dieses Ziel zu erreichen?",
        defaultInteractionType: "single"
      })
    });
    const GITHUB_REPO_OWNER_FALLBACK = "Thor-the-Dwarf";
    const GITHUB_REPO_NAME_FALLBACK = "FI_Skilltrainer";
    const SCENARIO_FILENAME_CONVENTION = /^\d{2}_(easy|medium|hard)_[a-z0-9_]+(?:_[a-z]{2})?\.json$/i;
    const SCENARIO_VERSIONED_FILENAME_CONVENTION = /^ticket\d{2}_v\d{2}_[a-z0-9_]+(?:_[a-z]{2})?\.json$/i;
    const THEME_ORDER = ["light", "dark", "system"];
    const THEME_ICONS = {
      light: "<svg class='icon-svg' viewBox='0 0 24 24' aria-hidden='true'>" +
        "<circle cx='12' cy='12' r='4'></circle>" +
        "<path d='M12 2v3'></path>" +
        "<path d='M12 19v3'></path>" +
        "<path d='M2 12h3'></path>" +
        "<path d='M19 12h3'></path>" +
        "<path d='M4.6 4.6l2.2 2.2'></path>" +
        "<path d='M17.2 17.2l2.2 2.2'></path>" +
        "<path d='M19.4 4.6l-2.2 2.2'></path>" +
        "<path d='M6.8 17.2l-2.2 2.2'></path>" +
        "</svg>",
      dark: "<svg class='icon-svg' viewBox='0 0 24 24' aria-hidden='true'>" +
        "<path d='M15 3a7 7 0 1 0 6 11 8.5 8.5 0 0 1-6-11z'></path>" +
        "</svg>",
      system: "<svg class='icon-svg' viewBox='0 0 24 24' aria-hidden='true'>" +
        "<rect x='3' y='4' width='18' height='12' rx='2'></rect>" +
        "<path d='M9 20h6'></path>" +
        "<path d='M12 16v4'></path>" +
        "</svg>"
    };
    const TOOLTIP_TOGGLE_ICONS = Object.freeze({
      enabled: [
        "<path d='M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12'></path>",
        "<circle cx='12' cy='12' r='3'></circle>"
      ].join(""),
      disabled: [
        "<path d='M3 3l18 18'></path>",
        "<path d='M10.6 10.6a2 2 0 0 0 2.8 2.8'></path>",
        "<path d='M6.7 6.7C4.2 8.3 2.5 10.8 2 12c.6 1.3 2.8 4.7 6.9 6'></path>",
        "<path d='M10.1 5.3A10.7 10.7 0 0 1 12 5.1c7.2 0 10 6.9 10 6.9-.3.8-1.7 3-4.2 4.8'></path>"
      ].join("")
    });
    const GENERIC_TOOLTIP_TARGET_SELECTOR = [
      "button",
      "a[href]",
      "summary",
      "[role='button']",
      "[role='link']",
      "[role='menuitem']",
      "[role='menuitemradio']",
      "input:not([type='hidden'])",
      "select",
      "textarea"
    ].join(", ");
    const answers = {};
    const touchedQuestionIds = new Set();
    let scenarioData = null;
    let inlineSummary = null;
    let lastResults = null;
    let questionMarkerState = Object.create(null);
    let trainingMenuCloseTimer = 0;
    let courseMenuCloseTimer = 0;
    let scenarioMenuCloseTimer = 0;
    let availableScenarios = [];
    let homeSkillsCache = Object.create(null);
    let unlockedAccessEntries = [];
    let activeScenarioFolder = "";
    let activeScenarioFile = "";
    let activeScenarioCountsTowardProgress = false;
    let activeHomeSkillsFolder = "";
    let accessKeyToFolder = { ...FALLBACK_ACCESS_KEY_TO_FOLDER };
    let accessKeyToFolders = Object.create(null);
    let accessKeyToFolderPrefixes = Object.create(null);
    let accessKeyToAllFolders = Object.create(null);
    let accessKeyToScenarioItems = { ...FALLBACK_ACCESS_KEY_TO_SCENARIO_ITEMS };
    let accessKeyRawNameMap = Object.create(null);
    let accessKeyConfigByHash = Object.create(null);
    let accessKeyConfigUsesHashedKeys = false;
    let accessKeyConfigLoaded = false;
    let cachedScenarioFolders = [];
    let cachedScenarioMenuGroups = [];
    let liveScenarioFolders = [];
    let liveScenarioFoldersLoaded = false;
    let liveScenarioFoldersPromise = null;
    let scenarioTreeWarmupPromise = null;
    let scenarioTreeRefreshPromise = null;
    let scenarioFolderSyncMetaByFolder = Object.create(null);
    let scenarioFolderCatalogState = {
      mode: "known_only",
      knownCount: 0,
      liveCount: 0,
      mergedCount: 0,
      repoOnlyFolders: [],
      knownOnlyFolders: [],
      error: "",
      checkedAt: "",
      source: ""
    };
    let localhostAdminSelectedKey = "";
    let activeTrainingDeckKey = "";
    let activeTrainingFolder = "";
    let trainingSession = null;
    let activeChallengeDeckId = "";
    let activeChallengeView = null;
    let activePresenterSceneId = "";
    let activePresenterView = null;
    let activePresenterRequestToken = 0;
    let trainingDeckCatalog = [];
    let trainingDeckCatalogPromise = null;
    let trainingDeckCatalogRefreshPromise = null;
    let trainingDeckCacheByFolder = Object.create(null);
    let trainingDeckCacheSourceByFolder = Object.create(null);
    let courseUnlockSummaryByFolder = Object.create(null);
    let courseUnlockSummaryPromisesByFolder = Object.create(null);
    let trainingDeckRefreshPromisesByFolder = Object.create(null);
    let sqlJsRuntimePromise = null;
    let uiI18nCatalogPromise = null;
    let activeUiLocale = DEFAULT_UI_LOCALE;
    let activePrimaryView = "home";
    let languageMenuOpen = false;
    let topRightMenuOpen = false;
    let tooltipsEnabled = true;
    let tooltipRefreshFrame = 0;
    let tooltipMutationObserver = null;
    const uiLocales = [];
    const uiLocaleListeners = new Set();
    const commentModeContextListeners = new Set();
    const uiMessagesByLocale = new Map();
    const uiLiteralTranslationsByLocale = new Map();
    const i18nTextSourceByNode = new WeakMap();
    const i18nAttributeSourceByElement = new WeakMap();
    const i18nMessageFallbackByElement = new WeakMap();
    let commentModeContextBroadcastScheduled = false;
    const externalScriptPromisesBySrc = Object.create(null);

    function normalize(s) {
      return String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
    }

    function normalizeSectionTitle(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/\s+/g, " ")
        .trim();
    }

    function isPossibleTasksHomeSectionTitle(value) {
      const candidate = String(value || "").trim();
      return (
        isKnownI18nVariant(t("home.section.possible_tasks", "Moegliche Aufgaben im Betrieb"), candidate)
        || isKnownI18nVariant("Mögliche Aufgaben im Betrieb", candidate)
        || isKnownI18nVariant("Possible tasks at work", candidate)
      );
    }

    const HIDDEN_HOME_SECTION_TITLES = new Set([
      "sehr brauchbare verdichtung fuer den unterricht",
      "was eher noch nicht allein laufen sollte",
      "was ein arbeitgeber daraus ableiten koennte"
    ]);

    function isHiddenHomeSectionTitle(value) {
      return HIDDEN_HOME_SECTION_TITLES.has(normalizeSectionTitle(value));
    }

    function esc(s) {
      return String(s || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function formatDoomScrollFeedbackTimestamp(timestampMs, iso = "") {
      const locale = getUiIntlLocale();
      const numericValue = Number(timestampMs);
      if (Number.isFinite(numericValue) && numericValue > 0) {
        try {
          return new Intl.DateTimeFormat(locale, {
            dateStyle: "short",
            timeStyle: "short"
          }).format(new Date(numericValue));
        } catch {
          return new Date(numericValue).toLocaleString(locale);
        }
      }
      const fallback = String(iso || "").trim();
      if (!fallback) return "";
      const parsed = Date.parse(fallback);
      if (!Number.isFinite(parsed)) return fallback;
      try {
        return new Intl.DateTimeFormat(locale, {
          dateStyle: "short",
          timeStyle: "short"
        }).format(new Date(parsed));
      } catch {
        return new Date(parsed).toLocaleString(locale);
      }
    }

    function normalizeQuestionMarkerState(value) {
      const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
      if (normalized === "offen") return "none";
      if (normalized === "bearbeitet") return "answered";
      if (normalized === "markiert") return "marked";
      if (normalized === "double_checked" || normalized === "doublechecked" || normalized === "geprueft" || normalized === "geprüft") {
        return "marked";
      }
      return QUESTION_MARKER_STATE_ORDER.includes(normalized) ? normalized : "none";
    }

    function getQuestionMarkerMeta(state) {
      return QUESTION_MARKER_META[normalizeQuestionMarkerState(state)] || QUESTION_MARKER_META.none;
    }

    function getQuestionMarkerScenarioKey(data = scenarioData) {
      const fromFile = getScenarioStorageFileKey(activeScenarioFile);
      if (fromFile) return fromFile;
      const fromStation = normalizeProgressId(data?.scenario?.station?.id || "");
      if (fromStation) return `station_${fromStation}`;
      const fromSubject = normalizeProgressId(data?.scenario?.customerRequest?.subject || data?.scenario?.mission || "");
      if (fromSubject) return `scenario_${fromSubject}`;
      return "";
    }

    function getQuestionMarkerStorageKey(data = scenarioData, folder = "") {
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder) || "standalone";
      const scenarioKey = getQuestionMarkerScenarioKey(data);
      if (!scenarioKey) return "";
      return `${QUESTION_MARKER_STORAGE_KEY_PREFIX}::${safeFolder}::${scenarioKey}`;
    }

    function getQuestionMarkerInteractionStorageKey(data = scenarioData, folder = "") {
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder) || "standalone";
      const scenarioKey = getQuestionMarkerScenarioKey(data);
      if (!scenarioKey) return "";
      return `${QUESTION_MARKER_INTERACTION_STORAGE_KEY_PREFIX}::${safeFolder}::${scenarioKey}`;
    }

    function loadQuestionMarkerState(data = scenarioData, folder = "") {
      const key = getQuestionMarkerStorageKey(data, folder);
      const interactionKey = getQuestionMarkerInteractionStorageKey(data, folder);
      if (!key) return Object.create(null);
      try {
        if (!interactionKey || localStorage.getItem(interactionKey) !== "1") {
          localStorage.removeItem(key);
          return Object.create(null);
        }
        const raw = JSON.parse(localStorage.getItem(key) || "{}");
        const next = Object.create(null);
        for (const [questionId, stateRaw] of Object.entries(raw || {})) {
          const qid = String(questionId || "").trim();
          const state = normalizeQuestionMarkerState(stateRaw);
          if (!qid || state === "none") continue;
          next[qid] = state;
        }
        return next;
      } catch {
        return Object.create(null);
      }
    }

    function markQuestionMarkerInteracted(data = scenarioData, folder = "") {
      const key = getQuestionMarkerInteractionStorageKey(data, folder);
      if (!key) return;
      try {
        localStorage.setItem(key, "1");
      } catch {
      }
    }

    function saveQuestionMarkerState(data = scenarioData, folder = "") {
      const key = getQuestionMarkerStorageKey(data, folder);
      if (!key) return;
      const payload = {};
      for (const [questionId, stateRaw] of Object.entries(questionMarkerState || {})) {
        const qid = String(questionId || "").trim();
        const state = normalizeQuestionMarkerState(stateRaw);
        if (!qid || state === "none" || state === "answered") continue;
        payload[qid] = state;
      }
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
      }
    }

    function getQuestionById(questionId, data = scenarioData) {
      const qid = String(questionId || "").trim();
      if (!qid) return null;
      return (data?.questions || []).find((question) => String(question?.id || "").trim() === qid) || null;
    }

    function getQuestionMarkerEffectiveState(questionId, question = null, data = scenarioData) {
      const q = question || getQuestionById(questionId, data);
      const storedState = normalizeQuestionMarkerState(questionMarkerState[String(questionId || "").trim()]);
      if (storedState === "marked") return "marked";
      return q && isQuestionAnswered(q) ? "answered" : "none";
    }

    function updateQuestionMarkerElements(questionId, question = null, data = scenarioData) {
      const qid = String(questionId || "").trim();
      if (!qid) return;
      const state = getQuestionMarkerEffectiveState(qid, question, data);
      const meta = getQuestionMarkerMeta(state);
      const card = document.querySelector(`.question[data-qid="${qid}"]`);
      if (card) {
        card.dataset.markerState = state;
        const main = card.querySelector(".question-main");
        if (main) main.dataset.markerState = state;
        const button = card.querySelector(".question-marker-button");
        if (button) {
          button.dataset.markerState = state;
          button.title = `Fragenstatus: ${meta.uiLabel}.`;
          button.setAttribute("aria-label", `Fragenstatus ${meta.uiLabel} für ${qid}`);
          const stateLabel = button.querySelector(".question-marker-state");
          if (stateLabel) stateLabel.textContent = meta.uiLabel;
        }
      }
    }

    function syncQuestionMarkerWithAnswer(questionId, data = scenarioData) {
      const q = getQuestionById(questionId, data);
      if (!q || isStructuralQuestion(q)) return;
      const qid = String(q.id || "").trim();
      const currentState = normalizeQuestionMarkerState(questionMarkerState[qid]);
      if (currentState === "marked") {
        updateQuestionMarkerElements(qid, q, data);
        renderTaskNavDrawer(data);
        return;
      }
      delete questionMarkerState[qid];
      saveQuestionMarkerState(data);
      updateQuestionMarkerElements(qid, q, data);
      renderTaskNavDrawer(data);
    }

    function syncAllQuestionMarkersWithAnswers(data = scenarioData) {
      if (!data) return;
      for (const question of data.questions || []) {
        if (!question || isStructuralQuestion(question)) continue;
        syncQuestionMarkerWithAnswer(question.id, data);
      }
    }

    function cycleQuestionMarkerState(questionId, data = scenarioData) {
      const q = getQuestionById(questionId, data);
      if (!q || isStructuralQuestion(q)) return;
      const currentState = getQuestionMarkerEffectiveState(q.id, q, data);
      const answered = isQuestionAnswered(q);
      let nextState = "none";
      if (answered) {
        nextState = currentState === "marked" ? "none" : "marked";
      } else {
        nextState = currentState === "marked" ? "none" : "marked";
      }
      markQuestionMarkerInteracted(data);
      if (nextState === "none" || nextState === "answered") delete questionMarkerState[q.id];
      else questionMarkerState[q.id] = nextState;
      saveQuestionMarkerState(data);
      updateQuestionMarkerElements(q.id, q, data);
      renderTaskNavDrawer(data);
    }

    function createQuestionMarkerButton(question, data = scenarioData) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "question-marker-button";
      button.dataset.qid = question.id;
      button.innerHTML = "<span class='question-marker-state'></span>";
      const initialState = getQuestionMarkerEffectiveState(question.id, question, data);
      const meta = getQuestionMarkerMeta(initialState);
      button.dataset.markerState = initialState;
      button.title = `Fragenstatus: ${meta.uiLabel}.`;
      button.setAttribute("aria-label", `Fragenstatus ${meta.uiLabel} für ${question.id}`);
      button.querySelector(".question-marker-state").textContent = meta.uiLabel;
      button.addEventListener("click", () => {
        cycleQuestionMarkerState(question.id, data);
      });
      return button;
    }

    function normalizeAccessKey(rawKey) {
      let key = String(rawKey || "").trim().toUpperCase();
      if (!key) return "";
      key = key.replace(/\s+/g, "");
      key = key.replace(/-/g, "_");
      key = key.replace(/^LF_(\d{2}_\d{2}_\d{2})$/, "LF$1");
      return key;
    }

    function normalizeFolderPrefix(rawPrefix) {
      const prefix = String(rawPrefix || "").trim().toUpperCase();
      if (!prefix || !/^[A-Z0-9_-]+$/.test(prefix)) return "";
      return prefix;
    }

    function normalizeAccessFolderList(rawValue) {
      const source = Array.isArray(rawValue) ? rawValue : [rawValue];
      const seen = new Set();
      const folders = [];
      for (const item of source) {
        const folder = sanitizeFolderName(item);
        if (!folder || seen.has(folder)) continue;
        seen.add(folder);
        folders.push(folder);
      }
      return folders.sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
    }

    function normalizeAccessFolderPrefixes(rawValue) {
      const source = Array.isArray(rawValue) ? rawValue : [rawValue];
      const seen = new Set();
      const prefixes = [];
      for (const item of source) {
        const prefix = normalizeFolderPrefix(item);
        if (!prefix || seen.has(prefix)) continue;
        seen.add(prefix);
        prefixes.push(prefix);
      }
      return prefixes;
    }

    function normalizeAccessTicketMap(rawValue) {
      const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)
        ? rawValue
        : {};
      const normalized = {};
      for (const [rawFolder, rawItems] of Object.entries(source)) {
        const folder = sanitizeFolderName(rawFolder);
        if (!folder) continue;
        const files = [...new Set(
          (Array.isArray(rawItems) ? rawItems : [rawItems])
            .map((entry) => normalizeScenarioResourcePath(entry))
            .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
        if (!files.length) continue;
        normalized[folder] = files;
      }
      return normalized;
    }

    function applyAccessKeyConfigPayload(payload) {
      const normalized = normalizeAccessKeyConfig(payload);
      accessKeyToFolder = { ...FALLBACK_ACCESS_KEY_TO_FOLDER, ...normalized.singleFolderMap };
      accessKeyToFolders = { ...normalized.multiFolderMap };
      accessKeyToFolderPrefixes = { ...normalized.prefixMap };
      accessKeyToAllFolders = { ...(normalized.allFoldersMap || {}) };
      accessKeyToScenarioItems = { ...FALLBACK_ACCESS_KEY_TO_SCENARIO_ITEMS, ...(normalized.ticketMap || {}) };
      accessKeyRawNameMap = { ...(normalized.rawKeyMap || {}) };
    }

    function mergeAccessKeyConfigEntry(rawKey, rawValue) {
      const key = normalizeAccessKey(rawKey);
      if (!key || rawValue == null) return false;
      const normalized = normalizeAccessKeyConfig({ [key]: rawValue });
      if (normalized.singleFolderMap[key]) {
        accessKeyToFolder[key] = normalized.singleFolderMap[key];
      }
      if (normalized.multiFolderMap[key]) {
        accessKeyToFolders[key] = normalized.multiFolderMap[key];
      }
      if (normalized.prefixMap[key]) {
        accessKeyToFolderPrefixes[key] = normalized.prefixMap[key];
      }
      if (normalized.allFoldersMap[key]) {
        accessKeyToAllFolders[key] = true;
      }
      if (normalized.ticketMap[key]) {
        accessKeyToScenarioItems[key] = normalized.ticketMap[key];
      }
      accessKeyRawNameMap[key] = String(rawKey || key);
      return true;
    }

    function normalizeAccessKeyConfig(payload) {
      const source = payload && typeof payload === "object"
        ? (payload.keys && typeof payload.keys === "object" ? payload.keys : payload)
        : {};
      const normalized = {
        singleFolderMap: {},
        multiFolderMap: {},
        prefixMap: {},
        allFoldersMap: {},
        ticketMap: {},
        rawKeyMap: {}
      };
      for (const [rawKey, rawValue] of Object.entries(source || {})) {
        const key = normalizeAccessKey(rawKey);
        if (!key || rawValue == null) continue;
        normalized.rawKeyMap[key] = String(rawKey);

        if (typeof rawValue === "string") {
          const folder = sanitizeFolderName(rawValue);
          if (folder) normalized.singleFolderMap[key] = folder;
          continue;
        }

        const folderList = normalizeAccessFolderList(
          Array.isArray(rawValue) ? rawValue : (rawValue.folders || rawValue.folderList || [])
        );
        const singleFolder = Array.isArray(rawValue) ? "" : sanitizeFolderName(rawValue.folder || "");
        const prefixes = Array.isArray(rawValue)
          ? []
          : normalizeAccessFolderPrefixes(rawValue.folderPrefixes || rawValue.prefixes || rawValue.folderPrefix || []);
        const allFolders = !Array.isArray(rawValue) && Boolean(rawValue.allFolders);
        const ticketMap = Array.isArray(rawValue)
          ? {}
          : normalizeAccessTicketMap(rawValue.tickets || rawValue.ticketMap || rawValue.scenarios || rawValue.itemsByFolder || {});

        Object.keys(ticketMap).forEach((folder) => {
          if (singleFolder === folder) return;
          if (!folderList.includes(folder)) folderList.push(folder);
        });

        if (singleFolder) {
          normalized.singleFolderMap[key] = singleFolder;
          if (!folderList.includes(singleFolder)) folderList.unshift(singleFolder);
        }
        if (folderList.length) normalized.multiFolderMap[key] = normalizeAccessFolderList(folderList);
        if (prefixes.length) normalized.prefixMap[key] = prefixes;
        if (allFolders) normalized.allFoldersMap[key] = true;
        if (Object.keys(ticketMap).length) normalized.ticketMap[key] = ticketMap;
      }
      return normalized;
    }

    async function hashAccessKey(rawKey) {
      const key = normalizeAccessKey(rawKey);
      if (!key || !window.crypto?.subtle || typeof TextEncoder !== "function") return "";
      try {
        const bytes = new TextEncoder().encode(key);
        const buffer = await window.crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(buffer))
          .map((entry) => entry.toString(16).padStart(2, "0"))
          .join("");
      } catch {
      }
      return "";
    }

    async function ensureAccessKeyResolved(rawKey) {
      const key = normalizeAccessKey(rawKey);
      if (!key) return false;
      if (
        accessKeyToFolder[key] ||
        accessKeyToFolders[key] ||
        accessKeyToAllFolders[key] ||
        accessKeyToFolderPrefixes[key] ||
        accessKeyToScenarioItems[key]
      ) {
        return true;
      }
      if (!accessKeyConfigUsesHashedKeys) return false;
      const hash = await hashAccessKey(key);
      if (!hash) return false;
      const rawValue = accessKeyConfigByHash[hash];
      if (rawValue == null) return false;
      return mergeAccessKeyConfigEntry(key, rawValue);
    }

    async function ensureAccessKeyConfigLoaded() {
      if (accessKeyConfigLoaded) return;
      accessKeyConfigLoaded = true;
      try {
        const publicRes = await fetch(ACCESS_BUNDLES_CONFIG_PATH, { cache: "no-store" });
        if (publicRes.ok) {
          const publicPayload = await publicRes.json();
          const hashedKeys = publicPayload && typeof publicPayload === "object" && publicPayload.hashedKeys && typeof publicPayload.hashedKeys === "object"
            ? publicPayload.hashedKeys
            : null;
          if (hashedKeys) {
            accessKeyConfigByHash = { ...hashedKeys };
            accessKeyConfigUsesHashedKeys = true;
            return;
          }
        }
      } catch {
      }
      try {
        const res = await fetch(ACCESS_KEYS_CONFIG_PATH, { cache: "no-store" });
        if (!res.ok) return;
        const payload = await res.json();
        applyAccessKeyConfigPayload(payload);
        accessKeyConfigUsesHashedKeys = false;
        accessKeyConfigByHash = Object.create(null);
      } catch {
      }
    }

    function sortScenarioFolderNames(items) {
      return [...new Set((items || []).map((item) => sanitizeFolderName(item)).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
    }

    function getConfiguredScenarioFolders() {
      const seen = new Set();
      const folders = [];
      const pushFolder = (rawFolder) => {
        const folder = sanitizeFolderName(rawFolder);
        if (!folder || seen.has(folder)) return;
        seen.add(folder);
        folders.push(folder);
      };

      Object.values(FALLBACK_ACCESS_KEY_TO_FOLDER).forEach(pushFolder);
      Object.values(accessKeyToFolder).forEach(pushFolder);
      Object.values(accessKeyToFolders).forEach((folderList) => {
        (folderList || []).forEach(pushFolder);
      });
      unlockedAccessEntries.forEach((entry) => pushFolder(entry?.folder));

      return folders.sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
    }

    function loadStoredScenarioFolders() {
      try {
        return sortScenarioFolderNames(JSON.parse(localStorage.getItem(SCENARIO_FOLDER_CATALOG_STORAGE_KEY) || "[]"));
      } catch {
      }
      return [];
    }

    function saveStoredScenarioFolders(folders) {
      cachedScenarioFolders = sortScenarioFolderNames(folders);
      try {
        localStorage.setItem(SCENARIO_FOLDER_CATALOG_STORAGE_KEY, JSON.stringify(cachedScenarioFolders));
      } catch {
      }
    }

    function loadStoredScenarioMenuGroups() {
      try {
        return normalizeStoredScenarioMenuGroups(JSON.parse(localStorage.getItem(SCENARIO_TREE_CACHE_STORAGE_KEY) || "[]"));
      } catch {
      }
      return [];
    }

    function saveStoredScenarioMenuGroups(groups) {
      const normalizedGroups = normalizeStoredScenarioMenuGroups(groups);
      cachedScenarioMenuGroups = normalizedGroups;
      try {
        localStorage.setItem(SCENARIO_TREE_CACHE_STORAGE_KEY, JSON.stringify(normalizedGroups));
      } catch {
      }
    }

    function loadStoredTrainingDeckCatalog() {
      try {
        return normalizeStoredTrainingDeckCatalog(JSON.parse(localStorage.getItem(TRAINING_DECK_CATALOG_STORAGE_KEY) || "[]"));
      } catch {
      }
      return [];
    }

    function saveStoredTrainingDeckCatalog(decks) {
      const normalizedDecks = normalizeStoredTrainingDeckCatalog(decks);
      try {
        localStorage.setItem(TRAINING_DECK_CATALOG_STORAGE_KEY, JSON.stringify(normalizedDecks));
      } catch {
      }
    }

    function loadStoredTrainingDeckCache() {
      try {
        return normalizeStoredTrainingDeckCache(JSON.parse(localStorage.getItem(TRAINING_DECK_CACHE_STORAGE_KEY) || "{}"));
      } catch {
      }
      return Object.create(null);
    }

    function saveStoredTrainingDeckCache(decks) {
      const normalizedDecks = normalizeStoredTrainingDeckCache(decks);
      try {
        localStorage.setItem(TRAINING_DECK_CACHE_STORAGE_KEY, JSON.stringify(normalizedDecks));
      } catch {
      }
    }

    function getCourseUnlockStorageKey(folder = "") {
      const safeFolder = sanitizeFolderName(folder);
      return safeFolder ? `${COURSE_UNLOCK_STATE_STORAGE_KEY_PREFIX}::${safeFolder}` : "";
    }

    function normalizeStoredStringSet(rawValue, normalizer = (value) => String(value || "").trim()) {
      const values = new Set();
      const source = rawValue instanceof Set
        ? [...rawValue]
        : (Array.isArray(rawValue) ? rawValue : []);
      for (const entry of source) {
        const normalized = normalizer(entry);
        if (normalized) values.add(normalized);
      }
      return values;
    }

    function createEmptyCourseUnlockState() {
      return {
        solvedUnitIds: new Set(),
        correctSolvedCount: 0,
        unseenUnlockedFiles: new Set(),
        openedTicketFiles: new Set(),
        poolSizeUnique: 0,
        unlockableTicketCount: 0,
        threshold: 0
      };
    }

    function normalizeStoredCourseUnlockState(payload) {
      const source = payload && typeof payload === "object" ? payload : {};
      const solvedUnitIds = normalizeStoredStringSet(source.solvedUnitIds, (entry) => normalizeProgressId(entry));
      const unseenUnlockedFiles = normalizeStoredStringSet(source.unseenUnlockedFiles, (entry) => normalizeScenarioResourcePath(entry));
      const openedTicketFiles = normalizeStoredStringSet(source.openedTicketFiles, (entry) => normalizeScenarioResourcePath(entry));
      return {
        solvedUnitIds,
        correctSolvedCount: Math.max(solvedUnitIds.size, Math.floor(Number(source.correctSolvedCount) || 0)),
        unseenUnlockedFiles,
        openedTicketFiles,
        poolSizeUnique: Math.max(0, Math.floor(Number(source.poolSizeUnique) || 0)),
        unlockableTicketCount: Math.max(0, Math.floor(Number(source.unlockableTicketCount) || 0)),
        threshold: Math.max(0, Math.floor(Number(source.threshold) || 0))
      };
    }

    function loadCourseUnlockState(folder = "") {
      const storageKey = getCourseUnlockStorageKey(folder);
      if (!storageKey) return createEmptyCourseUnlockState();
      try {
        return normalizeStoredCourseUnlockState(JSON.parse(localStorage.getItem(storageKey) || "{}"));
      } catch {
      }
      return createEmptyCourseUnlockState();
    }

    function saveCourseUnlockState(folder = "", state = null, summary = null) {
      const storageKey = getCourseUnlockStorageKey(folder);
      if (!storageKey || !state) return;
      const nextState = {
        ...normalizeStoredCourseUnlockState(state),
        poolSizeUnique: Math.max(0, Math.floor(Number(summary?.poolSizeUnique ?? state.poolSizeUnique) || 0)),
        unlockableTicketCount: Math.max(0, Math.floor(Number(summary?.unlockableTicketCount ?? state.unlockableTicketCount) || 0)),
        threshold: Math.max(0, Math.floor(Number(summary?.threshold ?? state.threshold) || 0))
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          solvedUnitIds: [...nextState.solvedUnitIds].sort(),
          correctSolvedCount: Math.max(nextState.solvedUnitIds.size, nextState.correctSolvedCount),
          unseenUnlockedFiles: [...nextState.unseenUnlockedFiles].sort(),
          openedTicketFiles: [...nextState.openedTicketFiles].sort(),
          poolSizeUnique: nextState.poolSizeUnique,
          unlockableTicketCount: nextState.unlockableTicketCount,
          threshold: nextState.threshold
        }));
      } catch {
      }
    }

    function buildScenarioItemSignature(items = []) {
      return (Array.isArray(items) ? items : [])
        .map((item) => {
          const file = normalizeScenarioResourcePath(item?.file || "");
          const format = normalizeScenarioItemFormat(item?.format || "", file);
          return `${file}@@${format}@@${item?.countsTowardProgress ? "1" : "0"}`;
        })
        .filter(Boolean)
        .sort()
        .join("||");
    }

    function getScenarioGroupForFolder(folder = "", groups = availableScenarios) {
      const safeFolder = sanitizeFolderName(folder);
      return (Array.isArray(groups) ? groups : []).find((group) => sanitizeFolderName(group?.folder) === safeFolder) || null;
    }

    function isUnlockableScenarioTicket(item) {
      if (!item) return false;
      const file = normalizeScenarioResourcePath(item.file || "");
      return Boolean(file) &&
        Boolean(item.countsTowardProgress) &&
        normalizeScenarioItemFormat(item.format || "", file) !== "markdown";
    }

    function getVisibleScenarioItemsForFolder(folder = "", itemsHint = null) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return [];
      if (Array.isArray(itemsHint)) return itemsHint.filter(Boolean);
      return Array.isArray(getScenarioGroupForFolder(safeFolder)?.items)
        ? getScenarioGroupForFolder(safeFolder).items.filter(Boolean)
        : [];
    }

    function getUnlockableScenarioItemsForFolder(folder = "", itemsHint = null) {
      return getVisibleScenarioItemsForFolder(folder, itemsHint).filter((item) => isUnlockableScenarioTicket(item));
    }

    function computeCourseUnlockSummary(folder = "", itemsHint = null, options = {}) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return null;
      const visibleItems = getVisibleScenarioItemsForFolder(safeFolder, itemsHint);
      const unlockableItems = getUnlockableScenarioItemsForFolder(safeFolder, visibleItems);
      const state = normalizeStoredCourseUnlockState(options.state || loadCourseUnlockState(safeFolder));
      const deck = options.deck || trainingDeckCacheByFolder[safeFolder] || null;
      const uniqueUnitIds = new Set(
        (Array.isArray(deck?.questions) ? deck.questions : [])
          .map((question) => getTrainingProgressUnitId(question))
          .filter(Boolean)
      );
      const poolSizeUnique = uniqueUnitIds.size;
      const unlockableTicketCount = unlockableItems.length;
      const threshold = unlockableTicketCount > 0 && poolSizeUnique > 0
        ? Math.max(1, Math.ceil(poolSizeUnique / unlockableTicketCount))
        : 0;
      const correctSolvedCount = Math.max(state.solvedUnitIds.size, Math.floor(Number(state.correctSolvedCount) || 0));
      const unlockedTicketCount = unlockableTicketCount > 0
        ? Math.min(
          unlockableTicketCount,
          threshold > 0 ? 1 + Math.floor(correctSolvedCount / threshold) : 1
        )
        : 0;
      const unlockedTicketFiles = new Set(
        unlockableItems
          .slice(0, unlockedTicketCount)
          .map((item) => normalizeScenarioResourcePath(item.file || ""))
          .filter(Boolean)
      );
      const milestoneByFile = Object.create(null);
      unlockableItems.forEach((item, index) => {
        const file = normalizeScenarioResourcePath(item.file || "");
        if (!file) return;
        milestoneByFile[file] = index <= 0 ? 0 : threshold * index;
      });
      const unseenUnlockedFiles = new Set(
        [...state.unseenUnlockedFiles]
          .map((entry) => normalizeScenarioResourcePath(entry))
          .filter((entry) => entry && unlockedTicketFiles.has(entry) && !state.openedTicketFiles.has(entry))
      );
      return {
        folder: safeFolder,
        itemSignature: buildScenarioItemSignature(visibleItems),
        visibleItems,
        unlockableItems,
        poolSizeUnique,
        unlockableTicketCount,
        threshold,
        correctSolvedCount,
        unlockedTicketCount,
        unlockedTicketFiles,
        unseenUnlockedFiles,
        unseenUnlockedCount: unseenUnlockedFiles.size,
        milestoneByFile,
        hasDataIssue: Boolean(unlockableTicketCount > 0 && poolSizeUnique === 0),
        error: unlockableTicketCount > 0 && poolSizeUnique === 0
          ? t("scenario.unlock.data_issue", "Datencheck offen")
          : ""
      };
    }

    function setCachedCourseUnlockSummary(summary) {
      const safeFolder = sanitizeFolderName(summary?.folder || "");
      if (!safeFolder || !summary) return null;
      courseUnlockSummaryByFolder[safeFolder] = summary;
      return summary;
    }

    function getCachedCourseUnlockSummary(folder = "", itemsHint = null) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return null;
      const cached = courseUnlockSummaryByFolder[safeFolder] || null;
      if (!cached) return null;
      if (Array.isArray(itemsHint) && cached.itemSignature !== buildScenarioItemSignature(itemsHint)) {
        return null;
      }
      return cached;
    }

    async function ensureCourseUnlockSummaryLoaded(folder = "", itemsHint = null, options = {}) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return null;
      const cached = getCachedCourseUnlockSummary(safeFolder, itemsHint);
      if (cached && !options.forceRefresh) return cached;
      if (courseUnlockSummaryPromisesByFolder[safeFolder] && !options.forceRefresh) {
        return courseUnlockSummaryPromisesByFolder[safeFolder];
      }
      courseUnlockSummaryPromisesByFolder[safeFolder] = (async () => {
        let deck = trainingDeckCacheByFolder[safeFolder] || null;
        if (!deck) {
          try {
            deck = await loadTrainingDeck(safeFolder, false);
          } catch {
            deck = null;
          }
        }
        const summary = computeCourseUnlockSummary(safeFolder, itemsHint, {
          deck
        });
        if (summary) {
          const state = loadCourseUnlockState(safeFolder);
          saveCourseUnlockState(safeFolder, state, summary);
          setCachedCourseUnlockSummary(summary);
        }
        return summary;
      })().finally(() => {
        delete courseUnlockSummaryPromisesByFolder[safeFolder];
      });
      return courseUnlockSummaryPromisesByFolder[safeFolder];
    }

    function getCourseUnlockSummary(folder = "", itemsHint = null) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return null;
      const cached = getCachedCourseUnlockSummary(safeFolder, itemsHint);
      if (cached) return cached;
      const deck = trainingDeckCacheByFolder[safeFolder] || null;
      if (!deck) return null;
      const summary = computeCourseUnlockSummary(safeFolder, itemsHint, { deck });
      return setCachedCourseUnlockSummary(summary);
    }

    function getScenarioUnlockMeta(item, summary = null) {
      if (!item) {
        return {
          locked: false,
          isNew: false,
          statusLabel: t("scenario.ticket.status.info", "Info"),
          detailLabel: "",
          milestone: 0
        };
      }
      if (!isUnlockableScenarioTicket(item)) {
        return {
          locked: false,
          isNew: false,
          statusLabel: t("scenario.ticket.status.info", "Info"),
          detailLabel: "",
          milestone: 0
        };
      }
      const file = normalizeScenarioResourcePath(item.file || "");
      const effectiveSummary = summary && sanitizeFolderName(summary.folder) === sanitizeFolderName(item.folder)
        ? summary
        : getCourseUnlockSummary(item.folder);
      if (!effectiveSummary) {
        return {
          locked: file !== normalizeScenarioResourcePath(activeScenarioFile || ""),
          isNew: false,
          statusLabel: t("scenario.ticket.status.calculating", "Berechne ..."),
          detailLabel: "",
          milestone: 0
        };
      }
      const milestone = Math.max(0, Number(effectiveSummary.milestoneByFile[file]) || 0);
      const unlocked = milestone === 0 || effectiveSummary.unlockedTicketFiles.has(file);
      const isNew = unlocked && effectiveSummary.unseenUnlockedFiles.has(file);
      if (isNew) {
        return {
          locked: false,
          isNew: true,
          statusLabel: t("scenario.ticket.status.open", "Offen"),
          detailLabel: "",
          milestone
        };
      }
      if (unlocked) {
        return {
          locked: false,
          isNew: false,
          statusLabel: t("scenario.ticket.status.open", "Offen"),
          detailLabel: "",
          milestone
        };
      }
      const detailLabel = effectiveSummary.hasDataIssue
        ? t("scenario.ticket.status.data_issue", "Datencheck")
        : t("scenario.ticket.status.progress", "{current} / {required}", {
          current: effectiveSummary.correctSolvedCount,
          required: milestone
        });
      return {
        locked: true,
        isNew: false,
        statusLabel: t("scenario.ticket.status.locked", "Gesperrt"),
        detailLabel,
        milestone
      };
    }

    function getScenarioMenuBadgeCount() {
      return getUnlockedFolders().reduce((sum, folder) => {
        const summary = getCourseUnlockSummary(folder);
        if (summary) return sum + summary.unseenUnlockedCount;
        return sum + loadCourseUnlockState(folder).unseenUnlockedFiles.size;
      }, 0);
    }

    function updateScenarioMenuBadgeUi() {
      if (!scenarioMenuButtonBadge) return 0;
      const count = Math.max(0, Math.floor(Number(getScenarioMenuBadgeCount()) || 0));
      scenarioMenuButtonBadge.textContent = String(count);
      scenarioMenuButtonBadge.classList.toggle("hidden", count <= 0);
      scenarioMenuButtonBadge.setAttribute("aria-hidden", count > 0 ? "false" : "true");
      return count;
    }

    function updateScenarioUnlockUi(folder = "") {
      const safeFolder = sanitizeFolderName(folder);
      updateScenarioMenuBadgeUi();
      if (safeFolder && sanitizeFolderName(activeScenarioFolder) === safeFolder) {
        renderScenarioMenu(availableScenarios);
      }
      updateScenarioMenuButtonState(scenarioMenu?.classList.contains("is-open"));
    }

    function markScenarioTicketOpened(item) {
      if (!isUnlockableScenarioTicket(item)) return null;
      const safeFolder = sanitizeFolderName(item.folder || "");
      const file = normalizeScenarioResourcePath(item.file || "");
      if (!safeFolder || !file) return null;
      const state = loadCourseUnlockState(safeFolder);
      state.openedTicketFiles.add(file);
      state.unseenUnlockedFiles.delete(file);
      const summary = computeCourseUnlockSummary(safeFolder, null, {
        state,
        deck: trainingDeckCacheByFolder[safeFolder] || null
      });
      saveCourseUnlockState(safeFolder, state, summary);
      return setCachedCourseUnlockSummary(summary);
    }

    function applyCourseUnlockProgressForQuestion(question, exact = false) {
      if (!exact) return null;
      const safeFolder = sanitizeFolderName(question?.folder || activeTrainingFolder || activeScenarioFolder);
      const unitId = getTrainingProgressUnitId(question);
      if (!safeFolder || !unitId) return null;
      const state = loadCourseUnlockState(safeFolder);
      const deck = trainingDeckCacheByFolder[safeFolder] || trainingSession?.deck || null;
      const beforeSummary = computeCourseUnlockSummary(safeFolder, null, { state, deck });
      if (state.solvedUnitIds.has(unitId)) {
        return setCachedCourseUnlockSummary(beforeSummary);
      }
      state.solvedUnitIds.add(unitId);
      state.correctSolvedCount = state.solvedUnitIds.size;
      const afterSummary = computeCourseUnlockSummary(safeFolder, null, { state, deck });
      const previouslyUnlocked = beforeSummary?.unlockedTicketFiles || new Set();
      afterSummary?.unlockedTicketFiles?.forEach((file) => {
        if (!previouslyUnlocked.has(file) && !state.openedTicketFiles.has(file) && (afterSummary.milestoneByFile[file] || 0) > 0) {
          state.unseenUnlockedFiles.add(file);
        }
      });
      const persistedSummary = computeCourseUnlockSummary(safeFolder, null, { state, deck });
      saveCourseUnlockState(safeFolder, state, persistedSummary);
      setCachedCourseUnlockSummary(persistedSummary);
      updateScenarioUnlockUi(safeFolder);
      return persistedSummary;
    }

    async function refreshCourseUnlockSummariesInBackground(groups = availableScenarios) {
      const source = Array.isArray(groups) ? groups : [];
      await Promise.all(source.map(async (group) => {
        await ensureCourseUnlockSummaryLoaded(group?.folder || "", group?.items || []);
      }));
      updateScenarioUnlockUi(activeScenarioFolder);
    }

    function hydrateScenarioTreeCacheFromStorage() {
      cachedScenarioFolders = loadStoredScenarioFolders();
      cachedScenarioMenuGroups = loadStoredScenarioMenuGroups();
      updateScenarioFolderCatalogState(
        [...getConfiguredScenarioFolders(), ...cachedScenarioFolders],
        liveScenarioFolders
      );
    }

    function hydrateTrainingCacheFromStorage() {
      trainingDeckCatalog = loadStoredTrainingDeckCatalog();
      trainingDeckCacheByFolder = loadStoredTrainingDeckCache();
      trainingDeckCacheSourceByFolder = Object.create(null);
      courseUnlockSummaryByFolder = Object.create(null);
      Object.keys(trainingDeckCacheByFolder).forEach((folder) => {
        trainingDeckCacheSourceByFolder[folder] = "cache";
        const summary = computeCourseUnlockSummary(folder, null, { deck: trainingDeckCacheByFolder[folder] });
        if (summary) {
          setCachedCourseUnlockSummary(summary);
        }
      });
    }

    function updateScenarioFolderCatalogState(knownFolders, liveFolders, error = "", source = "") {
      const known = sortScenarioFolderNames(knownFolders);
      const live = sortScenarioFolderNames(liveFolders);
      const knownSet = new Set(known);
      const liveSet = new Set(live);
      const merged = sortScenarioFolderNames([...known, ...live]);
      scenarioFolderCatalogState = {
        mode: error
          ? "repo_error"
          : source
            ? "repo_compared"
            : "known_only",
        knownCount: known.length,
        liveCount: live.length,
        mergedCount: merged.length,
        repoOnlyFolders: live.filter((folder) => !knownSet.has(folder)),
        knownOnlyFolders: known.filter((folder) => !liveSet.has(folder)),
        error: String(error || ""),
        checkedAt: new Date().toISOString(),
        source: String(source || "")
      };
    }

    function getKnownScenarioFolders() {
      return sortScenarioFolderNames([
        ...getConfiguredScenarioFolders(),
        ...cachedScenarioFolders,
        ...liveScenarioFolders
      ]);
    }

    function normalizeLiveScenarioFolderItems(payload) {
      if (!Array.isArray(payload)) return [];
      return payload
        .filter((entry) => entry && entry.type === "dir" && /-Scenarien$/i.test(String(entry.name || "")))
        .map((entry) => sanitizeFolderName(entry.name))
        .filter(Boolean);
    }

    function extractScenarioFolderNamesFromDirectoryListingHtml(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(String(html || ""), "text/html");
      const folders = [];
      const pushFolder = (rawValue) => {
        let decoded = String(rawValue || "").split("?")[0].split("#")[0];
        try {
          decoded = decodeURIComponent(decoded);
        } catch {
        }
        decoded = decoded.trim();
        if (!decoded || decoded === "../") return;
        const candidate = decoded.replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
        if (!/-Scenarien$/i.test(candidate)) return;
        const folder = sanitizeFolderName(candidate);
        if (folder) folders.push(folder);
      };
      doc.querySelectorAll("a[href]").forEach((link) => {
        pushFolder(link.getAttribute("href"));
        pushFolder(link.textContent || "");
      });
      return sortScenarioFolderNames(folders);
    }

    async function fetchGithubScenarioFolders() {
      const res = await fetch(buildGithubRepoContentsUrlForParts(["backend", "data", "Kurse"]), {
        cache: "no-store",
        headers: {
          Accept: "application/vnd.github+json"
        }
      });
      if (!res.ok) {
        throw new Error(`Repository-Abgleich für Kurse fehlgeschlagen (HTTP ${res.status})`);
      }
      const payload = await res.json();
      return {
        folders: sortScenarioFolderNames(normalizeLiveScenarioFolderItems(payload)),
        source: "github_api"
      };
    }

    async function fetchLocalScenarioFolders() {
      const res = await fetch("./backend/data/Kurse/", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(t("scenario.folder.local_sync_failed", "Lokaler Repo-Abgleich fuer Kurse fehlgeschlagen (HTTP {status})", {
          status: res.status
        }));
      }
      const payload = await res.text();
      const folders = extractScenarioFolderNamesFromDirectoryListingHtml(payload);
      if (!folders.length) {
        throw new Error(t("scenario.folder.local_listing_unreadable", "Lokaler Repo-Abgleich liefert keine lesbare Ordnerliste."));
      }
      return {
        folders,
        source: "local_listing"
      };
    }

    async function fetchLiveScenarioFolders() {
      if (isHostedOnGithubPages()) return fetchGithubScenarioFolders();
      return fetchLocalScenarioFolders();
    }

    async function ensureScenarioFolderCatalogLoaded(forceRefresh = false) {
      const knownFolders = sortScenarioFolderNames([
        ...getConfiguredScenarioFolders(),
        ...cachedScenarioFolders
      ]);
      if (liveScenarioFoldersLoaded && !forceRefresh) {
        updateScenarioFolderCatalogState(knownFolders, liveScenarioFolders, "", scenarioFolderCatalogState.source || "");
        return scenarioFolderCatalogState;
      }
      if (liveScenarioFoldersPromise && !forceRefresh) return liveScenarioFoldersPromise;

      liveScenarioFoldersPromise = (async () => {
        try {
          const liveResult = await fetchLiveScenarioFolders();
          liveScenarioFolders = sortScenarioFolderNames(liveResult?.folders || []);
          liveScenarioFoldersLoaded = true;
          saveStoredScenarioFolders(liveScenarioFolders);
          updateScenarioFolderCatalogState(knownFolders, liveScenarioFolders, "", liveResult?.source || "");
        } catch (err) {
          liveScenarioFolders = [];
          liveScenarioFoldersLoaded = true;
          updateScenarioFolderCatalogState(
            knownFolders,
            [],
            err?.message || t("scenario.folder.catalog_unavailable", "Repository-Abgleich derzeit nicht verfuegbar."),
            ""
          );
        } finally {
          liveScenarioFoldersPromise = null;
        }
        return scenarioFolderCatalogState;
      })();

      return liveScenarioFoldersPromise;
    }

    function resolveFoldersFromAccessKey(rawKey) {
      const key = normalizeAccessKey(rawKey);
      if (!key) return [];

      const seen = new Set();
      const folders = [];
      const pushFolder = (rawFolder) => {
        const folder = sanitizeFolderName(rawFolder);
        if (!folder || seen.has(folder)) return;
        seen.add(folder);
        folders.push(folder);
      };

      pushFolder(accessKeyToFolder[key]);
      (accessKeyToFolders[key] || []).forEach(pushFolder);

      const prefixes = accessKeyToFolderPrefixes[key] || [];
      if (prefixes.length) {
        getKnownScenarioFolders().forEach((folder) => {
          const upperFolder = folder.toUpperCase();
          if (prefixes.some((prefix) => upperFolder.startsWith(prefix))) {
            pushFolder(folder);
          }
        });
      }

      if (accessKeyToAllFolders[key]) {
        getKnownScenarioFolders().forEach(pushFolder);
      }

      return folders.sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
    }

    function resolveFolderFromAccessKey(rawKey) {
      return resolveFoldersFromAccessKey(rawKey)[0] || "";
    }

    function doesAccessKeyAllowScenarioItem(rawKey, folder, filePath) {
      const safeFolder = sanitizeFolderName(folder);
      const safeFile = normalizeScenarioResourcePath(filePath);
      const key = normalizeAccessKey(rawKey);
      if (!safeFolder || !safeFile || !key) return false;
      if (!resolveFoldersFromAccessKey(key).includes(safeFolder)) return false;
      const ticketMap = accessKeyToScenarioItems[key] && typeof accessKeyToScenarioItems[key] === "object"
        ? accessKeyToScenarioItems[key]
        : null;
      if (ticketMap && Object.prototype.hasOwnProperty.call(ticketMap, safeFolder)) {
        const allowedFiles = Array.isArray(ticketMap[safeFolder]) ? ticketMap[safeFolder] : [];
        const aliases = getScenarioFileAliases(safeFile);
        return allowedFiles.some((entry) => aliases.includes(normalizeScenarioResourcePath(entry)));
      }
      return true;
    }

    function filterScenarioItemsForEntries(items, folder, entries = unlockedAccessEntries) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return [];
      const relevantEntries = uniqueAccessEntries(entries).filter((entry) => entry.folder === safeFolder);
      if (!relevantEntries.length) return [];
      return (Array.isArray(items) ? items : [])
        .filter((item) => relevantEntries.some((entry) => doesAccessKeyAllowScenarioItem(entry.key, safeFolder, item?.file || "")));
    }

    function sanitizeFolderName(folder) {
      const val = String(folder || "").trim();
      if (!/^[A-Za-z0-9_-]+$/.test(val)) return "";
      return val;
    }

    function normalizeAccessEntry(rawEntry) {
      if (!rawEntry || typeof rawEntry !== "object") return null;
      const key = normalizeAccessKey(rawEntry.key || "");
      if (!key) return null;
      const resolvedFolders = resolveFoldersFromAccessKey(key);
      const folder = sanitizeFolderName(rawEntry.folder || resolvedFolders[0] || "");
      if (!folder) return null;
      if (resolvedFolders.length && !resolvedFolders.includes(folder)) return null;
      return { key, folder };
    }

    function uniqueAccessEntries(entries) {
      const seen = new Set();
      const out = [];
      for (const raw of entries || []) {
        const entry = normalizeAccessEntry(raw);
        if (!entry) continue;
        const id = `${entry.key}@@${entry.folder}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push(entry);
      }
      return out;
    }

    function expandAccessEntriesFromKeys(entries) {
      const expanded = [];
      for (const rawEntry of entries || []) {
        const key = normalizeAccessKey(rawEntry?.key || "");
        if (!key) continue;
        const resolvedFolders = resolveFoldersFromAccessKey(key);
        if (resolvedFolders.length) {
          resolvedFolders.forEach((folder) => {
            expanded.push({ key, folder });
          });
          continue;
        }
        const fallbackFolder = sanitizeFolderName(rawEntry?.folder || "");
        if (fallbackFolder) expanded.push({ key, folder: fallbackFolder });
      }
      return uniqueAccessEntries(expanded);
    }

    function refreshUnlockedEntriesFromCatalog() {
      if (!hasUnlockedAccess()) return false;
      const expandedEntries = expandAccessEntriesFromKeys(unlockedAccessEntries);
      if (!expandedEntries.length) return false;
      const currentSignature = unlockedAccessEntries
        .map((entry) => `${entry.key}@@${entry.folder}`)
        .sort()
        .join("||");
      const nextSignature = expandedEntries
        .map((entry) => `${entry.key}@@${entry.folder}`)
        .sort()
        .join("||");
      if (currentSignature === nextSignature) return false;
      const preferredActiveFolder = sanitizeFolderName(activeScenarioFolder || activeHomeSkillsFolder || expandedEntries[0]?.folder || "");
      setUnlockedEntries(expandedEntries, preferredActiveFolder, { preserveRuntime: true });
      return true;
    }

    function getUnlockedFolders() {
      const seen = new Set();
      const folders = [];
      for (const entry of unlockedAccessEntries) {
        if (!entry || !entry.folder || seen.has(entry.folder)) continue;
        seen.add(entry.folder);
        folders.push(entry.folder);
      }
      return folders.sort((a, b) => a.localeCompare(b, "de", { numeric: true, sensitivity: "base" }));
    }

    function buildScenarioBasePath(folder) {
      return `./backend/data/Kurse/${folder}`;
    }

    function getContentLocale() {
      return normalizeUiLocale(activeUiLocale || DEFAULT_UI_LOCALE);
    }

    function stripLocaleSuffixFromStem(stem = "") {
      return String(stem || "").replace(/[._][a-z]{2}$/i, "");
    }

    function buildLocalizedResourcePaths(filePath = "", locale = "") {
      const normalized = normalizeScenarioResourcePath(filePath) || String(filePath || "").trim();
      if (!normalized) return [];
      const safeLocale = normalizeUiLocale(locale || "");
      const parts = normalized.split("/");
      const baseName = parts.pop() || "";
      const dotIndex = baseName.lastIndexOf(".");
      if (dotIndex <= 0) return [normalized];
      const stem = baseName.slice(0, dotIndex);
      const ext = baseName.slice(dotIndex);
      const baseStem = stripLocaleSuffixFromStem(stem);
      const manifestLike = ["quiz-manifest", "scenario-manifest", "possible_skills", "00_manifest"].includes(baseStem.toLowerCase());
      const useDotSuffix = manifestLike;
      const localizedStem = safeLocale && safeLocale !== DEFAULT_UI_LOCALE
        ? (useDotSuffix ? `${baseStem}.${safeLocale}` : `${baseStem}_${safeLocale}`)
        : baseStem;
      const localizedName = `${localizedStem}${ext}`;
      const baseNameClean = `${baseStem}${ext}`;
      const localizedPath = [...parts, localizedName].join("/");
      const basePath = [...parts, baseNameClean].join("/");
      return [...new Set([localizedPath, basePath].filter(Boolean))];
    }

    async function fetchFirstAvailable(paths = [], options = {}) {
      const candidates = Array.isArray(paths) ? paths.filter(Boolean) : [];
      if (!candidates.length) return null;
      let lastResponse = null;
      for (const path of candidates) {
        const res = await fetch(path, options);
        if (res.ok) return res;
        lastResponse = res;
        if (res.status !== 404) break;
      }
      return lastResponse;
    }

    function getQuizFolderName(folder = "") {
      const resolvedFolder = sanitizeFolderName(folder || activeTrainingFolder || activeScenarioFolder || activeHomeSkillsFolder);
      if (!resolvedFolder) return "";
      return sanitizeFolderName(resolvedFolder.replace(/-Scenarien$/i, "-Quiz"));
    }

    function getQuizBasePath(folder = "") {
      const quizFolder = getQuizFolderName(folder);
      return quizFolder ? buildScenarioBasePath(quizFolder) : "";
    }

    function getQuizDatabasePath(folder = "") {
      const quizFolder = getQuizFolderName(folder);
      return quizFolder ? `./backend/data/Kurse/${quizFolder}.db` : "";
    }

    function getQuizDatabasePaths(folder = "", locale = "") {
      const quizFolder = getQuizFolderName(folder);
      if (!quizFolder) return [];
      const safeLocale = normalizeUiLocale(locale || activeUiLocale);
      const localizedPath = safeLocale && safeLocale !== DEFAULT_UI_LOCALE
        ? `./backend/data/Kurse/${quizFolder}.${safeLocale}.db`
        : "";
      const defaultPath = `./backend/data/Kurse/${quizFolder}.db`;
      return [...new Set([localizedPath, defaultPath].filter(Boolean))];
    }

    function isTrainingSqliteEnabledForFolder(folder = "") {
      const quizFolder = getQuizFolderName(folder);
      return Boolean(quizFolder);
    }

    function hasUnlockedAccess() {
      return unlockedAccessEntries.length > 0;
    }

    function setUnlockedEntries(entries, activeFolderHint = "", options = {}) {
      const cleanedEntries = uniqueAccessEntries(entries);
      if (!cleanedEntries.length) {
        clearUnlockedAccess();
        return;
      }

      const preserveRuntime = Boolean(options?.preserveRuntime);

      unlockedAccessEntries = cleanedEntries;
      const folders = getUnlockedFolders();
      const hint = sanitizeFolderName(activeFolderHint);
      if (hint && folders.includes(hint)) {
        activeScenarioFolder = hint;
      } else if (!folders.includes(activeScenarioFolder)) {
        activeScenarioFolder = folders[0];
      }

      const preferredHomeFolder = sanitizeFolderName(activeHomeSkillsFolder);
      if (preferredHomeFolder && folders.includes(preferredHomeFolder)) {
        activeHomeSkillsFolder = preferredHomeFolder;
      } else if (folders.includes(activeScenarioFolder)) {
        activeHomeSkillsFolder = activeScenarioFolder;
      } else {
        activeHomeSkillsFolder = folders[0];
      }
      if (activeTrainingFolder && !folders.includes(activeTrainingFolder)) {
        clearTrainingSession();
      }

      homeSkillsCache = Object.create(null);
      if (!preserveRuntime) {
        availableScenarios = [];
        scenarioData = null;
        activeScenarioFile = "";
        activeScenarioCountsTowardProgress = false;
      }
      try {
        localStorage.setItem(ACCESS_ENTRIES_STORAGE_KEY, JSON.stringify(unlockedAccessEntries));
        localStorage.setItem(ACCESS_ACTIVE_FOLDER_STORAGE_KEY, activeScenarioFolder);
        localStorage.setItem(HOME_SKILLS_FOLDER_STORAGE_KEY, activeHomeSkillsFolder);
        const activeEntry = unlockedAccessEntries.find((entry) => entry.folder === activeScenarioFolder) || unlockedAccessEntries[0];
        if (activeEntry) {
          localStorage.setItem(ACCESS_KEY_STORAGE_KEY, activeEntry.key);
          localStorage.setItem(ACCESS_FOLDER_STORAGE_KEY, activeEntry.folder);
        }
      } catch {
      }
    }

    function mergeUnlockedEntry(entry, makeActive = true) {
      const normalized = normalizeAccessEntry(entry);
      if (!normalized) {
        throw new Error(t("access.error.invalid_key_folder_combo", "Key/Ordner-Kombination ist ungueltig."));
      }
      const next = [...unlockedAccessEntries, normalized];
      const nextActive = makeActive ? normalized.folder : activeScenarioFolder;
      setUnlockedEntries(next, nextActive);
      return normalized;
    }

    function clearUnlockedAccess() {
      unlockedAccessEntries = [];
      activeScenarioFolder = "";
      activeScenarioFile = "";
      activeScenarioCountsTowardProgress = false;
      activeHomeSkillsFolder = "";
      scenarioData = null;
      homeSkillsCache = Object.create(null);
      availableScenarios = [];
      courseUnlockSummaryByFolder = Object.create(null);
      clearTrainingSession();
      try {
        localStorage.removeItem(ACCESS_ENTRIES_STORAGE_KEY);
        localStorage.removeItem(ACCESS_ACTIVE_FOLDER_STORAGE_KEY);
        localStorage.removeItem(ACCESS_KEY_STORAGE_KEY);
        localStorage.removeItem(ACCESS_FOLDER_STORAGE_KEY);
        localStorage.removeItem(HOME_SKILLS_FOLDER_STORAGE_KEY);
      } catch {
      }
      updateScenarioMenuBadgeUi();
      queueCommentModeContextBroadcast();
    }

    async function loadStoredAccess() {
      try {
        const entriesRaw = localStorage.getItem(ACCESS_ENTRIES_STORAGE_KEY);
        const activeFolderRaw = sanitizeFolderName(localStorage.getItem(ACCESS_ACTIVE_FOLDER_STORAGE_KEY) || "");
        if (entriesRaw) {
          const parsed = JSON.parse(entriesRaw);
          const keys = [...new Set(
            (Array.isArray(parsed) ? parsed : [])
              .map((entry) => normalizeAccessKey(entry?.key || ""))
              .filter(Boolean)
          )];
          for (const key of keys) {
            await ensureAccessKeyResolved(key);
          }
          const entries = expandAccessEntriesFromKeys(Array.isArray(parsed) ? parsed : []);
          if (entries.length) {
            const folderList = [...new Set(entries.map((entry) => entry.folder))];
            const activeFolder = folderList.includes(activeFolderRaw) ? activeFolderRaw : folderList[0];
            return { entries, activeFolder };
          }
        }

        const storedKey = normalizeAccessKey(localStorage.getItem(ACCESS_KEY_STORAGE_KEY) || "");
        if (!storedKey) return null;
        await ensureAccessKeyResolved(storedKey);
        const storedFolder = String(localStorage.getItem(ACCESS_FOLDER_STORAGE_KEY) || "").trim();
        const resolvedFolders = resolveFoldersFromAccessKey(storedKey);
        if (resolvedFolders.length) {
          const folder = sanitizeFolderName(storedFolder || resolvedFolders[0] || "");
          if (!folder || !resolvedFolders.includes(folder)) {
            return {
              entries: resolvedFolders.map((resolvedFolder) => ({ key: storedKey, folder: resolvedFolder })),
              activeFolder: resolvedFolders[0]
            };
          }
          return {
            entries: resolvedFolders.map((resolvedFolder) => ({ key: storedKey, folder: resolvedFolder })),
            activeFolder: folder
          };
        }
        const folder = sanitizeFolderName(storedFolder || "");
        if (!folder) return null;
        return { entries: [{ key: storedKey, folder }], activeFolder: folder };
      } catch {
      }
      return null;
    }

    function loadStoredHomeSkillsFolder() {
      try {
        return sanitizeFolderName(localStorage.getItem(HOME_SKILLS_FOLDER_STORAGE_KEY) || "");
      } catch {
      }
      return "";
    }

    function loadStoredLocalhostAdminSelectedKey() {
      try {
        return normalizeAccessKey(localStorage.getItem(LOCALHOST_ADMIN_SELECTED_KEY_STORAGE_KEY) || "");
      } catch {
      }
      return "";
    }

    function persistLocalhostAdminSelectedKey(key) {
      try {
        const normalized = normalizeAccessKey(key);
        if (normalized) {
          localStorage.setItem(LOCALHOST_ADMIN_SELECTED_KEY_STORAGE_KEY, normalized);
        } else {
          localStorage.removeItem(LOCALHOST_ADMIN_SELECTED_KEY_STORAGE_KEY);
        }
      } catch {
      }
    }

    function getAccessKeyRawName(rawKey) {
      const key = normalizeAccessKey(rawKey);
      if (!key) return "";
      return accessKeyRawNameMap[key] || key;
    }

    function getAdminEditableAccessKeys() {
      return [...new Set([
        ...Object.keys(accessKeyRawNameMap || {}),
        ...Object.keys(accessKeyToFolder || {}),
        ...Object.keys(accessKeyToFolders || {}),
        ...Object.keys(accessKeyToAllFolders || {})
      ])]
        .filter(Boolean)
        .sort((a, b) => getAccessKeyRawName(a).localeCompare(getAccessKeyRawName(b), "de", { numeric: true, sensitivity: "base" }));
    }

    function getScenarioBasePath(folder = "") {
      const resolvedFolder = sanitizeFolderName(folder || activeScenarioFolder);
      if (!resolvedFolder) {
        throw new Error(t("access.error.page_locked", "Seite ist gesperrt. Bitte erst mit Key entsperren."));
      }
      return buildScenarioBasePath(resolvedFolder);
    }

    function getScenarioManifestPath(folder = "") {
      return `${getScenarioBasePath(folder)}/scenario-manifest.json`;
    }

    function getCourseManifestPath(folder = "") {
      return `${getScenarioBasePath(folder)}/00_manifest.json`;
    }

    function getHomeSkillsPath(folder = "") {
      return `${getScenarioBasePath(folder)}/possible_skills.json`;
    }

    function getQuizManifestPath(folder = "") {
      const basePath = getQuizBasePath(folder);
      if (!basePath) {
        throw new Error(t("training.error.no_quiz_folder", "Kein passender Quiz-Ordner gefunden."));
      }
      return `${basePath}/quiz-manifest.json`;
    }

    function ensureExternalScriptLoaded(src) {
      const safeSrc = String(src || "").trim();
      if (!safeSrc) {
        return Promise.reject(new Error(t("app.error.missing_script_path", "Kein Scriptpfad angegeben.")));
      }
      if (externalScriptPromisesBySrc[safeSrc]) {
        return externalScriptPromisesBySrc[safeSrc];
      }
      externalScriptPromisesBySrc[safeSrc] = new Promise((resolve, reject) => {
        const existing = Array.from(document.scripts || []).find((script) => String(script?.src || "").trim() === safeSrc);
        if (existing?.dataset?.loaded === "true") {
          resolve();
          return;
        }
        const script = existing || document.createElement("script");
        function handleLoad() {
          script.dataset.loaded = "true";
          script.dataset.failed = "false";
          resolve();
        }
        function handleError() {
          script.dataset.failed = "true";
          reject(new Error(`Script konnte nicht geladen werden: ${safeSrc}`));
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
        existing.addEventListener("load", handleLoad, { once: true });
        existing.addEventListener("error", handleError, { once: true });
      });
      return externalScriptPromisesBySrc[safeSrc];
    }

    async function ensureSqlJsFactoryLoaded() {
      if (typeof window.initSqlJs === "function") return window.initSqlJs;
      try {
        await ensureExternalScriptLoaded(SQLJS_LOCAL_SCRIPT_PATH);
      } catch {
        await ensureExternalScriptLoaded(SQLJS_CDN_SCRIPT_PATH);
      }
      if (typeof window.initSqlJs !== "function") {
        throw new Error("SQLite-Laufzeit konnte nicht initialisiert werden.");
      }
      return window.initSqlJs;
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

    function normalizeUiLocale(value = "") {
      const raw = String(value || "").trim().toLowerCase();
      if (!raw) return DEFAULT_UI_LOCALE;
      const base = raw.split(/[-_]/)[0];
      return base || DEFAULT_UI_LOCALE;
    }

    function getUiIntlLocale() {
      return normalizeUiLocale(activeUiLocale) === "en" ? "en-US" : "de-DE";
    }

    function loadStoredUiLocale() {
      try {
        const stored = localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
        return stored ? normalizeUiLocale(stored) : "";
      } catch {
        return "";
      }
    }

    function persistUiLocale(locale) {
      try {
        localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, normalizeUiLocale(locale));
      } catch {
      }
    }

    function getUiLocaleMeta(locale = "") {
      const normalized = normalizeUiLocale(locale || activeUiLocale);
      return uiLocales.find((entry) => normalizeUiLocale(entry?.code) === normalized) || null;
    }

    function getSupportedUiLocales() {
      return uiLocales.length
        ? [...uiLocales]
        : [{ code: DEFAULT_UI_LOCALE, label: "German", nativeLabel: "Deutsch", isDefault: true }];
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
      const activeLocale = normalizeUiLocale(activeUiLocale);
      const activeMessages = uiMessagesByLocale.get(activeLocale);
      const defaultMessages = uiMessagesByLocale.get(DEFAULT_UI_LOCALE);
      const source = (activeMessages && activeMessages.get(key)) ||
        (defaultMessages && defaultMessages.get(key)) ||
        String(fallback || key);
      return formatI18nMessage(source, params);
    }

    function lt(text = "") {
      return translateLiteralSource(text);
    }

    function joinTextParts(parts, separator = " ") {
      return (Array.isArray(parts) ? parts : [parts])
        .map((part) => String(part ?? "").trim())
        .filter(Boolean)
        .join(separator)
        .trim();
    }

    function onUiLanguageChanged(listener) {
      if (typeof listener !== "function") return () => {};
      uiLocaleListeners.add(listener);
      return () => {
        uiLocaleListeners.delete(listener);
      };
    }

    function notifyUiLanguageChanged() {
      uiLocaleListeners.forEach((listener) => {
        try {
          listener(activeUiLocale);
        } catch (error) {
          console.warn("UI-Locale-Listener fehlgeschlagen.", error);
        }
      });
    }

    function translateLiteralSource(value = "") {
      const source = String(value ?? "");
      if (!source) return source;
      const locale = normalizeUiLocale(activeUiLocale);
      if (locale === DEFAULT_UI_LOCALE) return source;
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
      } else {
        const rememberedSource = tracked.get(attributeName);
        if (!isKnownI18nVariant(rememberedSource, currentValue)) {
          tracked.set(attributeName, currentValue);
        }
      }
      const source = tracked.get(attributeName);
      const translated = translateLiteralSource(source);
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
      } else {
        const rememberedSource = i18nTextSourceByNode.get(node);
        if (!isKnownI18nVariant(rememberedSource, currentValue)) {
          i18nTextSourceByNode.set(node, currentValue);
        }
      }
      const source = i18nTextSourceByNode.get(node);
      const translated = translateLiteralSource(source);
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

    async function ensureUiI18nCatalogLoaded() {
      if (uiI18nCatalogPromise) return uiI18nCatalogPromise;
      uiI18nCatalogPromise = (async () => {
        const [SQL, sqlScripts] = await Promise.all([
          ensureSqlJsRuntime(),
          Promise.all(UI_I18N_SQL_PATHS.map(async (path) => {
            const response = await fetch(path, { cache: "no-store" });
            if (!response.ok) {
              throw new Error(`Sprachdatei konnte nicht geladen werden: ${path}`);
            }
            return response.text();
          }))
        ]);
        const database = new SQL.Database();
        try {
          for (const script of sqlScripts) {
            database.run(script);
          }
          const localeRows = querySqliteRows(
            database,
            `SELECT code, label, native_label, sort_order, is_default
             FROM ui_locale
             ORDER BY sort_order, code COLLATE NOCASE`
          );
          uiLocales.length = 0;
          localeRows.forEach((row) => {
            uiLocales.push({
              code: normalizeUiLocale(row.code || DEFAULT_UI_LOCALE),
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
            const locale = normalizeUiLocale(row.locale_code || DEFAULT_UI_LOCALE);
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
            const locale = normalizeUiLocale(row.locale_code || DEFAULT_UI_LOCALE);
            const map = uiLiteralTranslationsByLocale.get(locale) || new Map();
            map.set(String(row.source_text || ""), String(row.translated_text || ""));
            uiLiteralTranslationsByLocale.set(locale, map);
          });
          return true;
        } finally {
          database.close();
        }
      })().catch((error) => {
        uiI18nCatalogPromise = null;
        throw error;
      });
      return uiI18nCatalogPromise;
    }

    function detectPreferredUiLocale() {
      const stored = loadStoredUiLocale();
      const supported = new Set(getSupportedUiLocales().map((entry) => normalizeUiLocale(entry.code)));
      if (supported.has(stored)) return stored;
      const browserLocales = Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || DEFAULT_UI_LOCALE];
      for (const candidate of browserLocales) {
        const normalized = normalizeUiLocale(candidate);
        if (supported.has(normalized)) return normalized;
      }
      return DEFAULT_UI_LOCALE;
    }

    function getThemeModeDisplayLabel(mode) {
      const normalized = THEME_ORDER.includes(mode) ? mode : "system";
      return t(`theme.mode.${normalized}`, normalized);
    }

    function updateDocumentLanguageState() {
      document.documentElement.lang = normalizeUiLocale(activeUiLocale);
      document.title = t("meta.document_title", "FI Skilltrainer");
    }

    function loadTooltipPreference() {
      try {
        const saved = localStorage.getItem(TOOLTIP_VISIBILITY_STORAGE_KEY);
        if (saved === "1" || saved === "true") return true;
        if (saved === "0" || saved === "false") return false;
      } catch {
      }
      return true;
    }

    function persistTooltipPreference(enabled) {
      try {
        localStorage.setItem(TOOLTIP_VISIBILITY_STORAGE_KEY, enabled ? "1" : "0");
      } catch {
      }
    }

    function readLabelledByText(element) {
      const ids = String(element?.getAttribute?.("aria-labelledby") || "")
        .split(/\s+/)
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);
      if (!ids.length) return "";
      return ids
        .map((id) => document.getElementById(id)?.textContent || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function getTooltipTextFromElementContent(element) {
      if (!element) return "";
      const tagName = String(element.tagName || "").toUpperCase();
      const role = String(element.getAttribute?.("role") || "").toLowerCase();
      if (tagName === "INPUT") {
        const type = String(element.getAttribute("type") || "").toLowerCase();
        if (["button", "submit", "reset"].includes(type)) {
          return String(element.value || "").replace(/\s+/g, " ").trim();
        }
        return "";
      }
      if (["BUTTON", "A", "SUMMARY"].includes(tagName) || role.startsWith("menuitem") || role === "button" || role === "link") {
        return String(element.textContent || "").replace(/\s+/g, " ").trim();
      }
      return "";
    }

    function resolveTooltipPlacement(element) {
      if (!element?.closest) return "top";
      if (element.closest(".left-appbar")) return "right";
      if (element.closest(".top-right-menu-panel, .language-popover")) return "top";
      if (element.closest(".appbar")) return "bottom";
      return "top";
    }

    function syncTooltipForElement(element) {
      if (!(element instanceof HTMLElement)) return;
      const usesAppbarTooltip = element.matches(".appbar .icon-button[data-appbar-tooltip], .left-appbar .icon-button[data-appbar-tooltip]");
      if (usesAppbarTooltip) {
        if (element.hasAttribute("title")) {
          element.removeAttribute("title");
        }
        if (element.hasAttribute("data-ui-tooltip")) {
          element.removeAttribute("data-ui-tooltip");
        }
        if (element.hasAttribute("data-ui-tooltip-placement")) {
          element.removeAttribute("data-ui-tooltip-placement");
        }
        return;
      }

      const titleSource = String(element.getAttribute("title") || "").replace(/\s+/g, " ").trim();
      if (titleSource) {
        element.dataset.uiTooltipSource = titleSource;
      }
      const tooltipText = [
        String(element.getAttribute("data-eval-tooltip-text") || "").replace(/\s+/g, " ").trim(),
        titleSource,
        String(element.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim(),
        readLabelledByText(element),
        String(element.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim(),
        String(element.dataset.uiTooltipSource || "").replace(/\s+/g, " ").trim(),
        getTooltipTextFromElementContent(element),
        String(element.getAttribute("data-ui-tooltip") || "").replace(/\s+/g, " ").trim()
      ].find(Boolean) || "";

      if (titleSource) {
        element.removeAttribute("title");
      }

      if (!tooltipText) {
        if (element.hasAttribute("data-ui-tooltip")) {
          element.removeAttribute("data-ui-tooltip");
        }
        if (element.hasAttribute("data-ui-tooltip-placement")) {
          element.removeAttribute("data-ui-tooltip-placement");
        }
        return;
      }

      if (element.getAttribute("data-ui-tooltip") !== tooltipText) {
        element.setAttribute("data-ui-tooltip", tooltipText);
      }
      const placement = resolveTooltipPlacement(element);
      if (element.getAttribute("data-ui-tooltip-placement") !== placement) {
        element.setAttribute("data-ui-tooltip-placement", placement);
      }
    }

    function refreshInteractiveTooltips() {
      document.querySelectorAll(GENERIC_TOOLTIP_TARGET_SELECTOR).forEach((element) => {
        syncTooltipForElement(element);
      });
    }

    function scheduleTooltipRefresh() {
      if (tooltipRefreshFrame) return;
      tooltipRefreshFrame = window.requestAnimationFrame(() => {
        tooltipRefreshFrame = 0;
        refreshInteractiveTooltips();
      });
    }

    function observeInteractiveTooltipChanges() {
      if (tooltipMutationObserver || !document.body) return;
      tooltipMutationObserver = new MutationObserver(() => {
        scheduleTooltipRefresh();
      });
      tooltipMutationObserver.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["title", "aria-label", "placeholder", "data-appbar-tooltip", "data-eval-tooltip-text", "aria-labelledby"]
      });
    }

    function updateTooltipToggleUi() {
      if (!tooltipToggleBtn) return;
      tooltipToggleBtn.setAttribute("aria-pressed", String(tooltipsEnabled));
      tooltipToggleBtn.setAttribute("aria-label", tooltipsEnabled
        ? t("tooltip.toggle.aria.hide", "Tooltips ausblenden")
        : t("tooltip.toggle.aria.show", "Tooltips einblenden"));
      tooltipToggleBtn.dataset.appbarTooltip = t("tooltip.toggle.tooltip", "Tooltips");
      tooltipToggleBtn.removeAttribute("title");
      if (tooltipToggleIcon) {
        tooltipToggleIcon.innerHTML = tooltipsEnabled
          ? TOOLTIP_TOGGLE_ICONS.enabled
          : TOOLTIP_TOGGLE_ICONS.disabled;
      }
      if (tooltipToggleLabel) {
        tooltipToggleLabel.textContent = tooltipsEnabled
          ? t("tooltip.toggle.label.on", "Tooltips: An")
          : t("tooltip.toggle.label.off", "Tooltips: Aus");
      }
    }

    function applyTooltipPreference(enabled, options = {}) {
      tooltipsEnabled = Boolean(enabled);
      document.documentElement.setAttribute("data-tooltips", tooltipsEnabled ? "on" : "off");
      updateTooltipToggleUi();
      if (!options?.skipPersist) {
        persistTooltipPreference(tooltipsEnabled);
      }
      scheduleTooltipRefresh();
    }

    function toggleTooltips() {
      applyTooltipPreference(!tooltipsEnabled);
    }

    function updateTopRightMenuButtonUi() {
      if (!topRightMenuButton) return;
      topRightMenuButton.setAttribute("aria-label", topRightMenuOpen
        ? t("appbar.quick_menu.close", "Schnellzugriff schliessen")
        : t("appbar.quick_menu.open", "Schnellzugriff öffnen"));
      topRightMenuButton.dataset.appbarTooltip = t("appbar.tooltip.quick_menu", "Menü");
      topRightMenuButton.setAttribute("aria-expanded", String(topRightMenuOpen));
      topRightMenuButton.removeAttribute("title");
    }

    function toggleTopRightMenu(forceOpen) {
      if (!topRightMenuButton || !topRightMenuPanel) return;
      const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !topRightMenuOpen;
      topRightMenuOpen = nextOpen;
      topRightMenuPanel.classList.toggle("hidden", !nextOpen);
      topRightMenuPanel.setAttribute("aria-hidden", String(!nextOpen));
      if (!nextOpen) {
        toggleLanguageMenu(false);
      }
      updateTopRightMenuButtonUi();
      if (nextOpen) {
        scheduleTooltipRefresh();
      }
    }

    function updateLanguageMenuButtonUi() {
      if (!languageMenuButton) return;
      const locale = getUiLocaleMeta(activeUiLocale);
      const badgeLabel = String(locale?.code || activeUiLocale || DEFAULT_UI_LOCALE).toUpperCase();
      if (languageButtonCode) {
        languageButtonCode.textContent = badgeLabel;
      }
      if (languageMenuLabel) {
        languageMenuLabel.textContent = t("language.menu.label", "Sprache: {code}", { code: badgeLabel });
      }
      const buttonLabel = t("language.button.current", "Sprache wählen (aktuell: {language})", {
        language: locale?.nativeLabel || badgeLabel
      });
      languageMenuButton.setAttribute("aria-label", buttonLabel);
      languageMenuButton.dataset.appbarTooltip = t("language.menu.heading", "Sprache");
      languageMenuButton.removeAttribute("title");
      languageMenuButton.setAttribute("aria-expanded", String(languageMenuOpen));
      scheduleTooltipRefresh();
    }

    function renderLanguageMenuOptions() {
      if (!languageMenuOptions) return;
      languageMenuOptions.innerHTML = "";
      for (const locale of getSupportedUiLocales()) {
        const code = normalizeUiLocale(locale.code);
        const option = document.createElement("button");
        option.type = "button";
        option.className = "language-option";
        option.dataset.locale = code;
        option.dataset.i18nSkip = "true";
        option.setAttribute("role", "menuitemradio");
        option.setAttribute("aria-checked", String(code === normalizeUiLocale(activeUiLocale)));
        if (code === normalizeUiLocale(activeUiLocale)) {
          option.classList.add("is-active");
        }
        option.innerHTML =
          "<span class='language-option-main'>" +
          `<span class='language-option-native'>${esc(locale.nativeLabel || code.toUpperCase())}</span>` +
          `<span class='language-option-label'>${esc(locale.label || code.toUpperCase())}</span>` +
          "</span>" +
          `<span class='language-option-check' aria-hidden='true'>${code === normalizeUiLocale(activeUiLocale) ? "✓" : ""}</span>`;
        option.addEventListener("click", async () => {
          await setUiLanguage(code);
          toggleLanguageMenu(false);
        });
        languageMenuOptions.appendChild(option);
      }
      scheduleTooltipRefresh();
    }

    function toggleLanguageMenu(forceOpen) {
      if (!languageMenu || !languageMenuButton) return;
      const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !languageMenuOpen;
      languageMenuOpen = nextOpen;
      languageMenu.classList.toggle("hidden", !nextOpen);
      languageMenu.setAttribute("aria-hidden", String(!nextOpen));
      if (nextOpen) {
        renderLanguageMenuOptions();
      }
      updateLanguageMenuButtonUi();
      translateDomSubtree(languageMenu);
      scheduleTooltipRefresh();
    }

    function refreshUiLanguageState() {
      updateDocumentLanguageState();
      updateTopRightMenuButtonUi();
      updateTooltipToggleUi();
      updateLanguageMenuButtonUi();
      updateThemeToggleUi(loadThemeMode());
      updateTrainingMenuButtonState(trainingMenu?.classList.contains("is-open"));
      updateCourseMenuButtonState(courseMenu?.classList.contains("is-open"));
      updateScenarioMenuButtonState(scenarioMenu?.classList.contains("is-open"));
      updateTaskNavDrawerToggleState(taskNavDrawer?.classList.contains("hidden") === false);
      updateTrainingProgressUi();
      renderLanguageMenuOptions();
      refreshTrainingInteractionLanguageUi();
      if (scenarioData && lastResults) {
        lastResults = buildScenarioResults(scenarioData);
        renderInlineReview(lastResults);
      }
      notifyUiLanguageChanged();
      translateDomSubtree(document);
      scheduleTooltipRefresh();
    }

    async function setUiLanguage(locale) {
      activeUiLocale = normalizeUiLocale(locale);
      persistUiLocale(activeUiLocale);
      refreshUiLanguageState();
    }

    window.EasyPVUiI18nBridge = Object.freeze({
      t,
      literal: translateLiteralSource,
      translateDomSubtree,
      getIntlLocale: getUiIntlLocale,
      getLocale() {
        return activeUiLocale;
      },
      onLocaleChanged: onUiLanguageChanged
    });

    function buildCommentModeBaseContext() {
      return {
        app: "fi-skilltrainer",
        primaryView: String(activePrimaryView || "").trim().toLowerCase(),
        pageTitle: document.title || "",
        pageUrl: location.href,
        locale: normalizeUiLocale(activeUiLocale),
        capturedAt: new Date().toISOString()
      };
    }

    function getFocusedCommentModeQuestionId() {
      const activeElement = document.activeElement;
      if (!activeElement || typeof activeElement.closest !== "function") return "";
      const questionHost = activeElement.closest("[data-qid], .question[data-qid]");
      return String(
        questionHost?.dataset?.qid ||
        questionHost?.getAttribute?.("data-qid") ||
        ""
      ).trim();
    }

    function buildCommentModeTrainingContext() {
      const activeCardState = trainingSession?.activeCardState || null;
      const activeQuestion = activeCardState?.question || null;
      const feedbackEntry = activeQuestion ? buildTrainingFeedbackEntry(activeQuestion) : null;
      const deck = trainingSession?.deck || getActiveTrainingDeck();
      const folder = sanitizeFolderName(deck?.folder || activeTrainingFolder || activeScenarioFolder || activeHomeSkillsFolder || "");
      const deckKey = String(deck?.deckKey || activeTrainingDeckKey || "").trim();
      return {
        ...buildCommentModeBaseContext(),
        surface: activeQuestion ? "training_question" : "training",
        entityType: activeQuestion ? "doomscroll_question" : "training_deck",
        entityId: String(feedbackEntry?.questionId || deckKey || folder || "training").trim(),
        folder,
        deckKey,
        questionId: String(feedbackEntry?.questionId || "").trim(),
        ticketId: String(feedbackEntry?.ticketId || "").trim(),
        conceptId: String(feedbackEntry?.conceptId || "").trim(),
        variantId: String(feedbackEntry?.variantId || "").trim(),
        sourceFile: String(feedbackEntry?.sourceFile || "").trim(),
        badgeLabel: String(activeQuestion ? getTrainingQuestionBadgeLabel(activeQuestion) : "").trim(),
        questionPrompt: String(activeQuestion ? getTrainingQuestionPromptText(activeQuestion) : "").trim(),
        viewLabel: activeQuestion ? "DoomScrollQuiz Frage" : "DoomScrollQuiz",
        isEvaluated: Boolean(activeQuestion && activeCardState?.locked)
      };
    }

    function buildCommentModeScenarioContext() {
      const scenario = scenarioData?.scenario || {};
      const station = scenario.station || {};
      const focusedQuestionId = getFocusedCommentModeQuestionId();
      const ticketId = String(station.id || activeScenarioFile || "").trim();
      return {
        ...buildCommentModeBaseContext(),
        surface: "scenario",
        entityType: focusedQuestionId ? "scenario_question" : "ticket",
        entityId: String(focusedQuestionId || ticketId || activeScenarioFile || "scenario").trim(),
        folder: sanitizeFolderName(activeScenarioFolder || activeHomeSkillsFolder || ""),
        ticketId,
        questionId: focusedQuestionId,
        sourceFile: String(activeScenarioFile || "").trim(),
        stationId: ticketId,
        company: String(scenario.company || "").trim(),
        mission: String(scenario.mission || "").trim(),
        viewLabel: ticketId ? `Ticket ${ticketId}` : "Ticket / Aufgabe",
        isEvaluated: Boolean(Array.isArray(lastResults) && lastResults.length)
      };
    }

    function buildCommentModeChallengeContext() {
      const deck = activeChallengeDeckId && typeof window.ChallengeData?.getLocalhostChallengeDeck === "function"
        ? window.ChallengeData.getLocalhostChallengeDeck(activeChallengeDeckId)
        : null;
      return {
        ...buildCommentModeBaseContext(),
        surface: "challenge",
        entityType: "challenge_deck",
        entityId: String(activeChallengeDeckId || deck?.id || "challenge").trim(),
        folder: sanitizeFolderName(activeHomeSkillsFolder || activeScenarioFolder || ""),
        challengeId: String(activeChallengeDeckId || deck?.id || "").trim(),
        challengeType: String(deck?.type || "").trim(),
        viewLabel: String(deck?.title || deck?.subtitle || "Challenge").trim() || "Challenge"
      };
    }

    function buildCommentModePresenterContext() {
      const presentation = activePresenterSceneId && typeof window.PresenterData?.getPresentation === "function"
        ? window.PresenterData.getPresentation(activePresenterSceneId)
        : null;
      return {
        ...buildCommentModeBaseContext(),
        surface: "presenter",
        entityType: "presentation",
        entityId: String(activePresenterSceneId || presentation?.id || "presenter").trim(),
        presentationId: String(activePresenterSceneId || presentation?.id || "").trim(),
        viewLabel: String(presentation?.title || "Babylon Presenter").trim() || "Babylon Presenter"
      };
    }

    function buildCommentModeHomeContext() {
      const folder = sanitizeFolderName(activeHomeSkillsFolder || activeScenarioFolder || "");
      return {
        ...buildCommentModeBaseContext(),
        surface: "home",
        entityType: "generic",
        entityId: String(folder || "home").trim(),
        folder,
        viewLabel: "Startseite"
      };
    }

    function buildCommentModeContextSnapshot() {
      if (trainingSession?.questions?.length) {
        return buildCommentModeTrainingContext();
      }
      if (scenarioData) {
        return buildCommentModeScenarioContext();
      }
      if (activePresenterView || activePresenterSceneId || activePrimaryView === "presenter") {
        return buildCommentModePresenterContext();
      }
      if (activeChallengeView || activeChallengeDeckId || activePrimaryView === "challenge") {
        return buildCommentModeChallengeContext();
      }
      if (activePrimaryView === "home") {
        return buildCommentModeHomeContext();
      }
      return {
        ...buildCommentModeBaseContext(),
        surface: "generic",
        entityType: "generic",
        entityId: "",
        viewLabel: "FI Skilltrainer"
      };
    }

    function onCommentModeContextChanged(listener) {
      if (typeof listener !== "function") return () => {};
      commentModeContextListeners.add(listener);
      return () => {
        commentModeContextListeners.delete(listener);
      };
    }

    function notifyCommentModeContextChanged() {
      const snapshot = buildCommentModeContextSnapshot();
      commentModeContextListeners.forEach((listener) => {
        try {
          listener(snapshot);
        } catch (error) {
          console.warn("Comment-Mode-Kontextlistener fehlgeschlagen.", error);
        }
      });
    }

    function queueCommentModeContextBroadcast() {
      if (commentModeContextBroadcastScheduled) return;
      commentModeContextBroadcastScheduled = true;
      window.requestAnimationFrame(() => {
        commentModeContextBroadcastScheduled = false;
        notifyCommentModeContextChanged();
      });
    }

    window.EasyPVCommentModeBridge = Object.freeze({
      getContext: buildCommentModeContextSnapshot,
      onContextChanged: onCommentModeContextChanged
    });

    async function initUiLanguageFeature() {
      try {
        await ensureUiI18nCatalogLoaded();
        activeUiLocale = detectPreferredUiLocale();
      } catch (error) {
        activeUiLocale = DEFAULT_UI_LOCALE;
        console.warn("UI-Sprache konnte nicht initialisiert werden.", error);
      }
      refreshUiLanguageState();
      const observer = new MutationObserver((mutations) => {
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
      observer.observe(document.body, {
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

    async function openTrainingDatabase(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error(t("training.error.invalid_folder", "Ungueltiger Trainingsordner."));
      const dbPaths = getQuizDatabasePaths(safeFolder, getContentLocale());
      if (!dbPaths.length) throw new Error(t("training.error.no_database_path", "Kein passender Quiz-Datenbankpfad gefunden."));
      const [SQL, response] = await Promise.all([
        ensureSqlJsRuntime(),
        fetchFirstAvailable(dbPaths, { cache: "no-store" })
      ]);
      if (!response) {
        throw new Error(`Quiz-Datenbank für ${safeFolder} konnte nicht geladen werden (HTTP 404)`);
      }
      if (!response.ok) {
        throw new Error(`Quiz-Datenbank für ${safeFolder} konnte nicht geladen werden (HTTP ${response.status})`);
      }
      const buffer = await response.arrayBuffer();
      return new SQL.Database(new Uint8Array(buffer));
    }

    function isHostedOnGithubPages() {
      return /\.github\.io$/i.test(String(location.hostname || "").trim());
    }

    function isLocalDevelopmentHost() {
      const host = String(location.hostname || "").trim().toLowerCase();
      return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
    }

    function updateLocalhostChallengeVisibility() {
      if (!challengeAppbarAction) return;
      challengeAppbarAction.classList.toggle("hidden", !isLocalDevelopmentHost());
    }

    function updateDevSubmitToolsVisibility() {
      if (!devSubmitTools) return;
      devSubmitTools.classList.toggle("hidden", !isLocalDevelopmentHost());
    }

    function destroyActiveChallengeView(options = {}) {
      if (activeChallengeView && typeof activeChallengeView.destroy === "function") {
        activeChallengeView.destroy();
      }
      activeChallengeView = null;
      if (options.clearDeck !== false) {
        activeChallengeDeckId = "";
      }
      queueCommentModeContextBroadcast();
    }

    function getLocalhostChallengeCatalog() {
      return typeof window.ChallengeData?.getLocalhostChallengeCatalog === "function"
        ? window.ChallengeData.getLocalhostChallengeCatalog()
        : [];
    }

    function renderLocalhostChallengePreviewPanel() {
      if (!isLocalDevelopmentHost()) return "";
      const catalog = getLocalhostChallengeCatalog();
      if (!catalog.length) return "";
      const futureTypes = [...new Set(catalog.flatMap((entry) => Array.isArray(entry.futureTypes) ? entry.futureTypes : []).filter(Boolean))];
      const challengeButtons = catalog
        .map((entry) => {
          const label = String(entry.subtitle || entry.title || entry.type || "Challenge").trim();
          const isActive = String(activeChallengeDeckId || "").trim() === String(entry.id || "").trim();
          const description = String(entry.description || "Lokaler Demo-Typ im Challenge-Bereich.").trim();
          return (
            `<button type="button" class="challenge-inline-button home-subappbar-button${isActive ? " is-active" : ""}"` +
            ` data-launch-local-challenge="${esc(entry.id)}"` +
            ` title="${esc(description)}"` +
            ` aria-label="Challenge ${esc(label)} starten"` +
            ` aria-pressed="${isActive ? "true" : "false"}">${esc(label)}</button>`
          );
        })
        .join("");
      const futureText = futureTypes.length
        ? `<p class='status-text challenge-home-roadmap'>Architektur vorbereitet fuer: ${esc(futureTypes.join(" · "))}</p>`
        : "";
      return (
        "<section class='panel challenge-inline-panel'>" +
        "<div class='challenge-inline-head'>" +
        "<span class='challenge-home-kicker'>Localhost Preview</span>" +
        "<p class='status-text challenge-inline-copy'>Challenge-Typ direkt starten.</p>" +
        "</div>" +
        "<div class='challenge-inline-row' role='tablist' aria-label='Challenge Auswahl'>" +
        challengeButtons +
        "<button type='button' class='challenge-inline-button challenge-inline-overview home-subappbar-button' data-open-challenge-hub='true' aria-label='Challenge-Uebersicht anzeigen' aria-pressed='false'>Uebersicht</button>" +
        "</div>" +
        futureText +
        "</section>"
      );
    }

    function renderLocalhostChallengeHub() {
      const catalog = getLocalhostChallengeCatalog();
      if (!catalog.length) {
        return (
          "<section class='panel'>" +
          "<h2>Challenge</h2>" +
          "<p class='status-text'>Aktuell sind noch keine lokalen Challenge-Types registriert.</p>" +
          "</section>"
        );
      }
      const cards = catalog
        .map((entry) => {
          const meta = [
            entry.cardCount ? `${entry.cardCount} Karten` : "",
            entry.zoneCount ? `${entry.zoneCount} Ziele` : "",
            entry.roundCount ? `${entry.roundCount} Runde` : "",
            entry.optionCount ? `${entry.optionCount} Treffer` : "",
            entry.itemCount ? `${entry.itemCount} Schritte` : "",
            entry.timeLimitSec ? `${entry.timeLimitSec} Sek.` : ""
          ].filter(Boolean);
          const metaHtml = meta.map((value) => `<span class='challenge-home-pill'>${esc(value)}</span>`).join("");
          return (
            "<article class='panel challenge-hub-card'>" +
            "<div class='challenge-hub-card-head'>" +
            `<span class='challenge-home-kicker'>${esc(entry.title || "Challenge")}</span>` +
            `<h3 class='challenge-hub-card-title'>${esc(entry.subtitle || entry.type)}</h3>` +
            `<p class='challenge-hub-card-copy'>${esc(entry.description || "Lokaler Demo-Typ.")}</p>` +
            `</div><div class='challenge-hub-card-meta'>${metaHtml}</div>` +
            "<div class='challenge-hub-card-actions'>" +
            `<button type='button' class='btn-primary challenge-home-start' data-launch-local-challenge='${esc(entry.id)}'>Typ starten</button>` +
            "</div>" +
            "</article>"
          );
        })
        .join("");
      return (
        "<section class='challenge-shell challenge-hub-shell'>" +
        "<section class='panel challenge-home-panel'>" +
        "<div class='challenge-home-head'>" +
        "<span class='challenge-home-kicker'>Localhost Preview</span>" +
        "<h2>Challenge-Bereich</h2>" +
        "<p class='status-text'>Waehle den lokalen Demo-Type, den du in der bestehenden Runtime spielen moechtest.</p>" +
        "</div>" +
        "<div class='challenge-home-meta'>" +
        `<span class='challenge-home-pill'>${esc(String(catalog.length))} Typen verfuegbar</span>` +
        "</div>" +
        "<button type='button' class='challenge-overlay-secondary' data-challenge-back-home='true'>Zur Startseite</button>" +
        "</section>" +
        `<section class='challenge-hub-grid'>${cards}</section>` +
        "</section>"
      );
    }

    function bindLocalhostChallengePreviewPanel() {
      const hubButtons = workspaceLeft.querySelectorAll("[data-open-challenge-hub]");
      for (const button of hubButtons) {
        button.addEventListener("click", () => {
          showLocalhostChallengeHub().catch(() => {});
        });
      }
      const buttons = workspaceLeft.querySelectorAll("[data-launch-local-challenge]");
      for (const button of buttons) {
        button.addEventListener("click", () => {
          startLocalhostChallenge(button.dataset.launchLocalChallenge || "").catch(() => {});
        });
      }
      const backButtons = workspaceLeft.querySelectorAll("[data-challenge-back-home]");
      for (const button of backButtons) {
        button.addEventListener("click", () => {
          showHomeContent(activeHomeSkillsFolder || activeScenarioFolder).catch(() => {});
        });
      }
    }

    async function showLocalhostChallengeHub() {
      if (!isLocalDevelopmentHost()) {
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          "<h2>Challenge</h2>" +
          "<p class='status-text'>Dieser Bereich ist bewusst nur auf localhost sichtbar.</p>" +
          "</section>";
        return;
      }
      if (!hasUnlockedAccess()) {
        renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
        return;
      }
      toggleTrainingMenu(false);
      toggleCourseMenu(false);
      toggleScenarioMenu(false);
      setSubmitBarVisible(false);
      resetRuntimeState();
      setAppBarSelection("challenge");
      workspaceLeft.innerHTML = renderLocalhostChallengeHub();
      bindLocalhostChallengePreviewPanel();
      queueCommentModeContextBroadcast();
    }

    async function startLocalhostChallenge(deckId = "") {
      if (!deckId) {
        await showLocalhostChallengeHub();
        return;
      }
      if (!isLocalDevelopmentHost()) {
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          "<h2>Challenge</h2>" +
          "<p class='status-text'>Dieser Bereich ist bewusst nur auf localhost sichtbar.</p>" +
          "</section>";
        return;
      }
      if (!hasUnlockedAccess()) {
        renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
        return;
      }
      try {
        const deck = typeof window.ChallengeData?.getLocalhostChallengeDeck === "function"
          ? window.ChallengeData.getLocalhostChallengeDeck(deckId)
          : null;
        if (!deck) {
          throw new Error("Kein lokales Challenge-Deck gefunden.");
        }
        toggleTrainingMenu(false);
        toggleCourseMenu(false);
        toggleScenarioMenu(false);
        setSubmitBarVisible(false);
        resetRuntimeState();
        setAppBarSelection("challenge");
        activeChallengeDeckId = deck.id;
        activeChallengeView = window.ChallengeRuntime.mount(workspaceLeft, deck, {
          onExit: () => {
            destroyActiveChallengeView();
            showLocalhostChallengeHub().catch(() => {});
          },
          onRestart: (nextDeckId) => {
            startLocalhostChallenge(nextDeckId).catch(() => {});
          }
        });
        queueCommentModeContextBroadcast();
      } catch (err) {
        destroyActiveChallengeView();
        setAppBarSelection("");
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          "<h2>Challenge</h2>" +
          `<p class='status-text'>${esc(err?.message || "Challenge konnte nicht vorbereitet werden.")}</p>` +
          "</section>";
        queueCommentModeContextBroadcast();
      }
    }

    function destroyActivePresenterView(options = {}) {
      activePresenterRequestToken = 0;
      if (activePresenterView && typeof activePresenterView.destroy === "function") {
        activePresenterView.destroy();
      }
      activePresenterView = null;
      if (options.clearScene !== false) {
        activePresenterSceneId = "";
      }
      queueCommentModeContextBroadcast();
    }

    function getPresenterCatalog() {
      return typeof window.PresenterData?.getCatalog === "function"
        ? window.PresenterData.getCatalog()
        : [];
    }

    function renderPresenterPreviewGraphic(entry) {
      const thumbnail = entry && typeof entry === "object" ? entry.thumbnail || {} : {};
      const gradientId = `presenterPreviewLine_${String(entry?.id || "scene").replace(/[^a-z0-9_-]+/gi, "_")}`;
      if (thumbnail.kind === "hardware-raid0") {
        return (
          "<div class='presenter-preview-graphic' aria-hidden='true'>" +
          "<svg class='presenter-preview-svg' viewBox='0 0 100 70' preserveAspectRatio='none'>" +
          "<defs>" +
          `<linearGradient id='${gradientId}' x1='0%' y1='0%' x2='100%' y2='0%'>` +
          `<stop offset='0%' stop-color='${esc(thumbnail.accentStart || "#73f2ff")}' />` +
          `<stop offset='100%' stop-color='${esc(thumbnail.accentEnd || "#ff9c57")}' />` +
          "</linearGradient>" +
          "</defs>" +
          "<path d='M8 36 L20 36 L20 31 L33 31 L33 43 L49 43 L49 34 L63 34 L72 23 L90 23' fill='none' stroke='url(#" + gradientId + ")' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round' opacity='0.88' />" +
          "<path d='M63 34 L72 47 L90 47' fill='none' stroke='url(#" + gradientId + ")' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round' opacity='0.88' />" +
          "<rect x='7' y='31' width='10' height='10' rx='2.2' fill='rgba(244,248,255,0.12)' stroke='rgba(244,248,255,0.55)' />" +
          "<text x='12' y='37.7' text-anchor='middle' fill='rgba(239,246,255,0.92)' font-size='4.2' font-weight='700'>LAN</text>" +
          "<rect x='21' y='26' width='13' height='10' rx='2.4' fill='rgba(114,219,255,0.16)' stroke='rgba(114,219,255,0.64)' />" +
          "<text x='27.5' y='32.7' text-anchor='middle' fill='rgba(239,246,255,0.92)' font-size='3.8' font-weight='700'>NIC</text>" +
          "<rect x='36' y='37' width='15' height='10' rx='2.4' fill='rgba(111,245,207,0.16)' stroke='rgba(111,245,207,0.68)' />" +
          "<text x='43.5' y='43.7' text-anchor='middle' fill='rgba(239,246,255,0.92)' font-size='3.8' font-weight='700'>RAM</text>" +
          "<rect x='53' y='28' width='14' height='12' rx='2.5' fill='rgba(255,177,91,0.16)' stroke='rgba(255,177,91,0.72)' />" +
          "<text x='60' y='34.3' text-anchor='middle' fill='rgba(239,246,255,0.96)' font-size='3.7' font-weight='700'>RAID 0</text>" +
          "<text x='60' y='38.3' text-anchor='middle' fill='rgba(239,246,255,0.7)' font-size='2.6' font-weight='700'>64 KiB</text>" +
          "<rect x='80.5' y='15' width='11' height='16' rx='2.6' fill='rgba(215,226,255,0.12)' stroke='rgba(215,226,255,0.7)' />" +
          "<rect x='80.5' y='39' width='11' height='16' rx='2.6' fill='rgba(215,226,255,0.12)' stroke='rgba(215,226,255,0.7)' />" +
          "<text x='86' y='20.6' text-anchor='middle' fill='rgba(239,246,255,0.96)' font-size='3.5' font-weight='700'>HDD 0</text>" +
          "<text x='86' y='44.6' text-anchor='middle' fill='rgba(239,246,255,0.96)' font-size='3.5' font-weight='700'>HDD 1</text>" +
          "<circle cx='86' cy='26.2' r='3.1' fill='none' stroke='rgba(143,164,207,0.68)' stroke-width='1.2' />" +
          "<circle cx='86' cy='50.2' r='3.1' fill='none' stroke='rgba(143,164,207,0.68)' stroke-width='1.2' />" +
          "<rect x='57' y='19' width='4.7' height='4.7' rx='1.2' fill='rgba(255,155,77,0.92)' />" +
          "<rect x='62.3' y='19' width='4.7' height='4.7' rx='1.2' fill='rgba(255,155,77,0.92)' />" +
          "<rect x='57' y='44.6' width='4.7' height='4.7' rx='1.2' fill='rgba(255,155,77,0.92)' />" +
          "<rect x='62.3' y='44.6' width='4.7' height='4.7' rx='1.2' fill='rgba(255,155,77,0.92)' />" +
          "<text x='59.35' y='22.3' text-anchor='middle' fill='rgba(6,12,20,0.9)' font-size='2.9' font-weight='800'>A</text>" +
          "<text x='64.65' y='22.3' text-anchor='middle' fill='rgba(6,12,20,0.9)' font-size='2.9' font-weight='800'>B</text>" +
          "<text x='59.35' y='47.9' text-anchor='middle' fill='rgba(6,12,20,0.9)' font-size='2.9' font-weight='800'>C</text>" +
          "<text x='64.65' y='47.9' text-anchor='middle' fill='rgba(6,12,20,0.9)' font-size='2.9' font-weight='800'>D</text>" +
          "</svg>" +
          "<span class='presenter-preview-pulse' style='left:28%;top:31%;'></span>" +
          "</div>"
        );
      }
      const labels = Array.isArray(thumbnail.pathNodes) ? thumbnail.pathNodes.slice(0, 5) : [];
      const points = [
        { x: 10, y: 52 },
        { x: 31, y: 25 },
        { x: 52, y: 56 },
        { x: 73, y: 24 },
        { x: 90, y: 47 }
      ];
      const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
      const labelHtml = labels
        .map((label, index) => {
          const point = points[index] || points[points.length - 1];
          return (
            `<span class='presenter-preview-label' style='left:${point.x}%;top:${Math.max(10, point.y - 18)}%;'>${esc(label)}</span>`
          );
        })
        .join("");
      const dotHtml = points
        .map((point, index) => (
          `<span class='presenter-preview-dot${index === 0 ? " is-origin" : ""}' style='left:${point.x}%;top:${point.y}%;'></span>`
        ))
        .join("");
      return (
        "<div class='presenter-preview-graphic' aria-hidden='true'>" +
        "<svg class='presenter-preview-svg' viewBox='0 0 100 70' preserveAspectRatio='none'>" +
        "<defs>" +
        `<linearGradient id='${gradientId}' x1='0%' y1='0%' x2='100%' y2='0%'>` +
        `<stop offset='0%' stop-color='${esc(thumbnail.accentStart || "#73f2ff")}' />` +
        `<stop offset='100%' stop-color='${esc(thumbnail.accentEnd || "#ffaf5f")}' />` +
        "</linearGradient>" +
        "</defs>" +
        `<polyline points='${polyline}' fill='none' stroke='url(#${gradientId})' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round' />` +
        "</svg>" +
        "<span class='presenter-preview-pulse'></span>" +
        dotHtml +
        labelHtml +
        "</div>"
      );
    }

    function createPresenterPlaceholderEntry(slotNumber) {
      const safeSlot = Math.max(1, Number(slotNumber) || 1);
      const slotLabel = String(safeSlot).padStart(2, "0");
      return {
        id: `placeholder_slot_${slotLabel}`,
        kicker: "Reservierter Slot",
        title: `Weitere RAID-Animation ${slotLabel}`,
        summary: "Platzhalter fuer eine weitere ScenePresentation. Titel, Metadaten und CTA koennen spaeter direkt durch echte Inhalte ersetzt werden.",
        estimatedDurationLabel: "Bald verfuegbar",
        tags: ["Placeholder", "Grid", "Scrollslot"],
        thumbnail: {
          accentStart: "#73f2ff",
          accentEnd: "#9f7cff",
          pathNodes: ["Slot", "Scene", "Camera", "Cue", "Player"]
        }
      };
    }

    const ACTIVE_WORKSPACE_PRESENTATION_ID = "asymmetric_encryption_3min";

    function createPresenterWorkspacePlaceholderEntry(slotNumber) {
      const safeSlot = Math.max(1, Number(slotNumber) || 1);
      const slotLabel = String(safeSlot).padStart(2, "0");
      const fallbackEntry = {
        title: "Ende-zu-Ende-Verschluesselung in 3 Minuten",
        summary: "Hier entsteht gerade die neue Demo zur Ende-zu-Ende-Verschluesselung mit Anna, Ben, sichtbaren Metadaten in der Mitte und der klaren Schutzgrenze bei kompromittierten Endgeraeten oder ungeschuetzten Backups.",
        tags: ["Workspace", "Aktiv", "Babylon", "E2E", "Kryptografie"],
        thumbnail: {
          accentStart: "#6bc4ff",
          accentEnd: "#72efb3",
          pathNodes: ["Anna", "Geheimtext", "Server", "Ben", "E2E"]
        }
      };
      const activePresentation = typeof window.PresenterData?.getPresentation === "function"
        ? window.PresenterData.getPresentation(ACTIVE_WORKSPACE_PRESENTATION_ID)
        : null;
      const entry = activePresentation && typeof activePresentation === "object"
        ? activePresentation
        : fallbackEntry;
      const projectTitle = String(entry?.title || fallbackEntry.title).trim() || fallbackEntry.title;
      const projectLabel = projectTitle.replace(/\s+in 3 Minuten$/i, "").trim() || projectTitle;
      const projectSummary = String(entry?.summary || entry?.description || fallbackEntry.summary).trim() || fallbackEntry.summary;
      return {
        ...entry,
        id: `workspace_slot_${slotLabel}`,
        kicker: "Codex arbeitet hier",
        previewTitle: `Projekt: ${projectLabel}`,
        title: projectTitle,
        summary: `Aktives Babylon-Presenter-Projekt im Workspace. ${projectSummary}`,
        estimatedDurationLabel: "Aktiv im Workspace",
        tags: Array.isArray(entry?.tags) ? entry.tags : fallbackEntry.tags,
        placeholderCtaLabel: "Projekt im Workspace",
        thumbnail: entry?.thumbnail && typeof entry.thumbnail === "object"
          ? entry.thumbnail
          : fallbackEntry.thumbnail
      };
    }

	    function renderPresenterPreviewCard(entry, options = {}) {
	      const placeholder = options && options.placeholder === true;
	      const previewTitle = String(entry?.previewTitle || entry?.title || "Praesentation").trim() || "Praesentation";
	      const ctaLabel = String(entry?.ctaLabel || "Praesentation starten").trim() || "Praesentation starten";
	      const actionHtml = placeholder
	        ? `<button type='button' class='btn-primary presenter-card-start presenter-card-start-placeholder' disabled aria-disabled='true'>${esc(entry?.placeholderCtaLabel || "Slot reserviert")}</button>`
	        : `<button type='button' class='btn-primary presenter-card-start' data-start-presentation='${esc(entry?.id)}'>${esc(ctaLabel)}</button>`;
	      return (
        `<article class='presenter-card${placeholder ? " presenter-card-placeholder" : ""}'>` +
        renderPresenterPreviewGraphic(entry) +
        "<div class='presenter-card-body'>" +
        `<span class='presenter-card-kicker'>${esc(entry?.kicker || "ScenePresentation")}</span>` +
        `<h3 class='presenter-card-title'>${esc(previewTitle)}</h3>` +
        "<div class='presenter-card-actions'>" +
        actionHtml +
        "</div>" +
        "</div>" +
        "</article>"
      );
    }

    function renderPresenterPreviewPanel() {
      const catalog = getPresenterCatalog();
      const minimumScrollableSlots = 6;
      const workspacePlaceholderEntry = createPresenterWorkspacePlaceholderEntry(catalog.length + 1);
      const placeholderEntries = Array.from(
        { length: Math.max(0, minimumScrollableSlots - (catalog.length + 1)) },
        (_, index) => createPresenterPlaceholderEntry(catalog.length + index + 2)
      );
      const cards = catalog
        .map((entry) => renderPresenterPreviewCard(entry))
        .concat(renderPresenterPreviewCard(workspacePlaceholderEntry, { placeholder: true }))
        .concat(placeholderEntries.map((entry) => renderPresenterPreviewCard(entry, { placeholder: true })))
        .join("");
      return (
        "<section class='panel presenter-home-panel'>" +
        `<section class='presenter-home-grid'>${cards}</section>` +
        "</section>"
      );
    }

    function renderPresenterHub() {
      return (
        "<section class='presenter-shell presenter-hub-shell'>" +
        renderPresenterPreviewPanel() +
        "</section>"
      );
    }

    function bindPresenterPreviewPanel() {
      const buttons = workspaceLeft.querySelectorAll("[data-start-presentation]");
      for (const button of buttons) {
        button.addEventListener("click", () => {
          startPresenterScene(button.dataset.startPresentation || "").catch(() => {});
        });
      }
    }

    async function startPresenterScene(sceneId = "") {
      const safeSceneId = String(sceneId || "").trim();
      if (!safeSceneId) {
        await showPresenterHub();
        return;
      }
      if (!hasUnlockedAccess()) {
        renderUnlockScreen("Bitte zuerst gueltigen Key eingeben.");
        return;
      }
      const presentation = typeof window.PresenterData?.getPresentation === "function"
        ? window.PresenterData.getPresentation(safeSceneId)
        : null;
      if (!presentation) {
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          "<h2>Babylon Presenter</h2>" +
          "<p class='status-text'>Die gewaehlte Praesentation konnte nicht gefunden werden.</p>" +
          "</section>";
        return;
      }
      toggleTrainingMenu(false);
      toggleCourseMenu(false);
      toggleScenarioMenu(false);
      setSubmitBarVisible(false);
      resetRuntimeState();
      setAppBarSelection("presenter");
      activePresenterSceneId = presentation.id;
      const requestToken = Date.now() + Math.random();
      activePresenterRequestToken = requestToken;
      try {
        const mountedPresenterView = await window.PresenterRuntime.mount(workspaceLeft, presentation, {
          autoPlay: false,
          onExit: () => {
            destroyActivePresenterView();
            showPresenterHub().catch(() => {});
          }
        });
        if (activePresenterRequestToken !== requestToken || activePresenterSceneId !== presentation.id) {
          if (mountedPresenterView && typeof mountedPresenterView.destroy === "function") {
            mountedPresenterView.destroy();
          }
          return;
        }
        activePresenterView = mountedPresenterView;
        queueCommentModeContextBroadcast();
      } catch (err) {
        destroyActivePresenterView();
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          "<h2>Babylon Presenter</h2>" +
          `<p class='status-text'>${esc(err?.message || "Praesentation konnte nicht vorbereitet werden.")}</p>` +
          "</section>";
        queueCommentModeContextBroadcast();
      }
    }

    async function showPresenterHub() {
      if (!hasUnlockedAccess()) {
        renderUnlockScreen("Bitte zuerst gueltigen Key eingeben.");
        return;
      }
      toggleTrainingMenu(false);
      toggleCourseMenu(false);
      toggleScenarioMenu(false);
      setSubmitBarVisible(false);
      resetRuntimeState();
      setAppBarSelection("presenter");
      workspaceLeft.innerHTML = renderPresenterHub();
      bindPresenterPreviewPanel();
      queueCommentModeContextBroadcast();
    }

    function resolveGithubRepoContext() {
      if (isHostedOnGithubPages()) {
        const owner = String(location.hostname || "").split(".")[0] || GITHUB_REPO_OWNER_FALLBACK;
        const repo = String(location.pathname || "")
          .split("/")
          .filter(Boolean)[0] || GITHUB_REPO_NAME_FALLBACK;
        return { owner, repo };
      }
      return {
        owner: GITHUB_REPO_OWNER_FALLBACK,
        repo: GITHUB_REPO_NAME_FALLBACK
      };
    }

    function buildGithubRepoContentsUrlForParts(parts) {
      const { owner, repo } = resolveGithubRepoContext();
      const path = (Array.isArray(parts) ? parts : [])
        .map((part) => String(part || "").trim())
        .filter(Boolean)
        .map((part) => encodeURIComponent(part))
        .join("/");
      if (!path) return "";
      return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`;
    }

    function buildGithubRepoContentsUrl(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) return "";
      return buildGithubRepoContentsUrlForParts(["backend", "data", "Kurse", safeFolder]);
    }

    function getScenarioResourceBasename(fileName = "") {
      const normalizedPath = normalizeScenarioResourcePath(fileName);
      const fallback = String(fileName || "").trim().replace(/\\/g, "/");
      const source = normalizedPath || fallback;
      if (!source) return "";
      const parts = source.split("/").filter(Boolean);
      return parts[parts.length - 1] || "";
    }

    function parseScenarioBasename(fileName = "") {
      const base = stripLocaleSuffixFromStem(getScenarioResourceBasename(fileName).replace(/\.(json|md)$/i, ""));
      if (!base) return null;
      const legacyMatch = base.match(/^(\d{2})_(easy|medium|hard)_([a-z0-9_]+)$/i);
      if (legacyMatch) {
        return {
          ticketNumber: legacyMatch[1],
          difficulty: legacyMatch[2].toLowerCase(),
          slug: legacyMatch[3],
          version: "01",
          kind: "legacy"
        };
      }
      const versionedMatch = base.match(/^ticket(\d{2})_v(\d{2})_([a-z0-9_]+)$/i);
      if (versionedMatch) {
        return {
          ticketNumber: versionedMatch[1],
          difficulty: "easy",
          slug: versionedMatch[3],
          version: versionedMatch[2],
          kind: "versioned"
        };
      }
      return null;
    }

    function getScenarioStorageFileKey(fileName = "") {
      const normalizedPath = normalizeScenarioResourcePath(fileName);
      if (!normalizedPath) return "";
      const parsed = parseScenarioBasename(normalizedPath);
      if (!parsed) return normalizedPath;
      return `${parsed.ticketNumber}_${parsed.difficulty}_${parsed.slug}.json`;
    }

    function getScenarioFileAliases(fileName = "") {
      const exactPath = normalizeScenarioResourcePath(fileName);
      const baseName = getScenarioResourceBasename(fileName);
      const storageKey = getScenarioStorageFileKey(fileName);
      return [...new Set([exactPath, baseName, storageKey].filter(Boolean))];
    }

    function buildScenarioLabelFromFilename(fileName) {
      const parsed = parseScenarioBasename(fileName);
      if (parsed) {
        const words = parsed.slug.split("_").map((part) => {
          const lower = String(part || "").toLowerCase();
          if (!lower) return "";
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        }).filter(Boolean);
        const stationPrefix = `Ticket ${parsed.ticketNumber}`;
        return words.length ? `${stationPrefix} - ${words.join(" ")}` : stationPrefix;
      }
      const raw = getScenarioResourceBasename(fileName).replace(/\.json$/i, "");
      if (!raw) return "Ticket";
      const parts = raw.split("_");
      const ticketPart = parts[0] || "";
      const words = parts.slice(1).map((part) => {
        const lower = String(part || "").toLowerCase();
        if (!lower) return "";
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }).filter(Boolean);
      const prefix = /^\d{2}$/.test(ticketPart) ? `Ticket ${ticketPart}` : "Ticket";
      return words.length ? `${prefix} - ${words.join(" ")}` : prefix;
    }

    function getFolderShortcutLabel(folder) {
      const safe = sanitizeFolderName(folder);
      if (!safe) return "";
      const shortcutMatch = safe.match(/^([A-Za-z]{2}\d{2})/);
      if (shortcutMatch && shortcutMatch[1]) return shortcutMatch[1].toUpperCase();
      return safe.replace(/-?Scenarien$/i, "");
    }

    function splitScenarioTicketLabel(label = "") {
      const raw = String(label || "").trim();
      if (!raw) {
        return { badge: "", title: "Ticket" };
      }
      const match = raw.match(/^(Ticket\s+\d{2}|Ticket\s+\d+|\d{2})\s*[-–—:]\s*(.+)$/i);
      if (match) {
        const normalizedBadge = /^ticket/i.test(match[1]) ? match[1] : `Ticket ${match[1]}`;
        return {
          badge: normalizedBadge.replace(/\s+/g, " ").trim(),
          title: match[2].trim() || raw
        };
      }
      return { badge: "", title: raw };
    }

    function loadThemeMode() {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (THEME_ORDER.includes(saved)) return saved;
      } catch {
      }
      return "system";
    }

    function persistThemeMode(mode) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
      }
    }

    function updateThemeToggleUi(mode) {
      const next = THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length];
      if (themeToggleIcon) {
        themeToggleIcon.innerHTML = THEME_ICONS[mode] || THEME_ICONS.system;
      }
      themeToggleBtn.setAttribute("aria-label", t("theme.button.aria", "Theme wechseln (aktuell: {current}, nächstes: {next})", {
        current: getThemeModeDisplayLabel(mode),
        next: getThemeModeDisplayLabel(next)
      }));
      themeToggleBtn.dataset.appbarTooltip = t("appbar.tooltip.theme", "Theme");
      themeToggleBtn.removeAttribute("title");
      scheduleTooltipRefresh();
      if (themeToggleLabel) {
        themeToggleLabel.textContent = t("theme.menu.label", "Theme-Mode: {current}", {
          current: getThemeModeDisplayLabel(mode)
        });
      }
    }

    function updateScenarioTreeFolderEmoji(drawer) {
      if (!drawer) return;
      const icon = drawer.querySelector(".scenario-tree-folder-icon");
      if (!icon) return;
      icon.textContent = drawer.open ? "📂" : "📁";
    }

    function applyThemeMode(mode) {
      const normalized = THEME_ORDER.includes(mode) ? mode : "system";
      document.documentElement.dataset.themeMode = normalized;
      if (normalized === "system") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", normalized);
      }
      updateThemeToggleUi(normalized);
      persistThemeMode(normalized);
    }

    function cycleThemeMode() {
      const current = document.documentElement.dataset.themeMode || loadThemeMode();
      const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
      applyThemeMode(next);
    }

    function readCssPixelVariable(name, fallback) {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
      const parsed = Number.parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    function updateAppBarShellPath() {
      if (!appbarShellSvg || !appbarShellPath) return;
      const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
      const height = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
      if (!width || !height) return;

      const topHeight = readCssPixelVariable("--appbar-height", 62);
      const leftWidth = readCssPixelVariable("--left-appbar-width", 78);
      const desiredRadius = readCssPixelVariable("--appbar-corner-radius", 28);
      const inset = 0.5;
      const right = Math.max(inset, width - inset);
      const bottom = Math.max(inset, height - inset);
      const railRight = Math.min(right, Math.max(inset, leftWidth - inset));
      const shelfBottom = Math.min(bottom, Math.max(inset, topHeight - inset));
      const maxRadius = Math.max(0, Math.min(right - railRight, bottom - shelfBottom));
      const radius = Math.max(0, Math.min(desiredRadius, maxRadius));
      const cornerStartX = railRight + radius;
      const cornerEndY = shelfBottom + radius;

      const pathData = radius > 0
        ? [
            `M ${inset} ${inset}`,
            `H ${right}`,
            `V ${shelfBottom}`,
            `H ${cornerStartX}`,
            `A ${radius} ${radius} 0 0 0 ${railRight} ${cornerEndY}`,
            `V ${bottom}`,
            `H ${inset}`,
            "Z"
          ].join(" ")
        : [
            `M ${inset} ${inset}`,
            `H ${right}`,
            `V ${shelfBottom}`,
            `H ${railRight}`,
            `V ${bottom}`,
            `H ${inset}`,
            "Z"
          ].join(" ");

      appbarShellSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      appbarShellSvg.setAttribute("width", String(width));
      appbarShellSvg.setAttribute("height", String(height));
      appbarShellPath.setAttribute("d", pathData);
    }

    function isDesktopActivityLayout() {
      return Boolean(desktopLeftAppBarQuery?.matches);
    }

    function getOpenActivityPanelKey() {
      if (trainingMenu?.classList.contains("is-open")) return "training";
      if (courseMenu?.classList.contains("is-open")) return "course";
      if (scenarioMenu?.classList.contains("is-open")) return "scenario";
      return "";
    }

    function syncIdeWorkspaceLayout(activePanel = getOpenActivityPanelKey()) {
      const panelKey = isDesktopActivityLayout() ? String(activePanel || "").trim() : "";
      document.body.dataset.idePanel = panelKey;
      document.body.dataset.idePanelOpen = panelKey ? "true" : "false";
      updateAppBarShellPath();
    }

    function syncPrimaryNavPlacement() {
      if (!appbarLeftSlot || !leftAppBar || !primaryNavControls) return;
      const desktopMode = desktopLeftAppBarQuery.matches;
      const target = desktopMode ? leftAppBar : appbarLeftSlot;
      if (primaryNavControls.parentElement !== target) {
        target.appendChild(primaryNavControls);
      }
      leftAppBar.classList.toggle("hidden", !desktopMode);
      leftAppBar.setAttribute("aria-hidden", desktopMode ? "false" : "true");
      syncIdeWorkspaceLayout();
    }

    function setAppBarSelection(view = "") {
      const normalized = String(view || "").trim().toLowerCase();
      activePrimaryView = normalized;
      const isHome = normalized === "home";
      const isTraining = normalized === "training";
      const isPresenter = normalized === "presenter";
      const isChallenge = normalized === "challenge";
      homeButton.classList.toggle("is-active", isHome);
      homeButton.setAttribute("aria-pressed", isHome ? "true" : "false");
      if (trainingMenuButton) {
        trainingMenuButton.classList.toggle("is-active", isTraining);
        trainingMenuButton.setAttribute("aria-pressed", isTraining ? "true" : "false");
      }
      if (presenterButton) {
        presenterButton.classList.toggle("is-active", isPresenter);
        presenterButton.setAttribute("aria-pressed", isPresenter ? "true" : "false");
      }
      if (challengeButton) {
        challengeButton.classList.toggle("is-active", isChallenge);
        challengeButton.setAttribute("aria-pressed", isChallenge ? "true" : "false");
      }
      setTrainingProgressRailVisible(isTraining && Boolean(trainingSession?.questions?.length));
      queueCommentModeContextBroadcast();
    }

    function buildPseudoDoomScrollDeck(folder) {
      const safeFolder = sanitizeFolderName(folder);
      const shortLabel = getFolderShortcutLabel(safeFolder) || safeFolder || "Kurs";
      return {
        deckKey: `doomscroll_${normalizeProgressId(safeFolder || shortLabel)}`,
        folder: safeFolder,
        title: t("training.pseudo.deck.title", "DoomScrollQuiz {label}", { label: shortLabel }),
        description: t("training.pseudo.deck.description", 'Pseudo-Daten-Prototyp fuer ein schnelles Training im Stil "Was hat er gesagt?" fuer {label}.', { label: shortLabel }),
        topics: [
          t("training.pseudo.topic.said", "Was hat er gesagt?"),
          t("training.pseudo.topic.feedback", "Kurzfeedback"),
          t("training.pseudo.topic.everyday_language", "Alltagssprache")
        ],
        questions: DOOM_SCROLL_PSEUDO_QUESTION_TEMPLATES.map((template, index) => ({
          id: `${normalizeProgressId(safeFolder || shortLabel) || "kurs"}_doom_${index + 1}`,
          type: "single",
          maxSelections: 1,
          promptKey: String(template.promptKey || "").trim(),
          prompt: String(template.prompt || "").trim(),
          options: template.options.map((optionDef, optionIndex) => ({
            id: `${normalizeProgressId(safeFolder || shortLabel) || "kurs"}_doom_${index + 1}_opt_${optionIndex + 1}`,
            textKey: String(optionDef?.textKey || "").trim(),
            text: String(optionDef?.text || "").trim(),
            correct: optionIndex === template.correctIndex,
            explanationKey: optionIndex === template.correctIndex
              ? String(template.explanationKey || "").trim()
              : "training.pseudo.option.wrong",
            explanation: optionIndex === template.correctIndex
              ? String(template.explanation || "").trim()
              : t("training.pseudo.option.wrong", "Diese Antwort klingt moeglich, trifft den Fachsatz aber nicht praezise.")
          })),
          isNew: Boolean(template.isNew)
        }))
      };
    }

    function shuffleArray(list) {
      const clone = Array.isArray(list) ? [...list] : [];
      for (let index = clone.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
      }
      return clone;
    }

    function normalizeTrainingQuestions(deck) {
      const questions = Array.isArray(deck?.questions) ? deck.questions : [];
      const fresh = questions.filter((question) => question?.isNew);
      const established = questions.filter((question) => !question?.isNew);
      const ordered = [...shuffleArray(fresh), ...shuffleArray(established)];
      return ordered.map((question, sessionIndex) => ({
        ...question,
        sessionIndex,
        options: shuffleArray(question.options || []).map((option) => ({ ...option }))
      }));
    }

    function normalizeTrainingInteractionType(value = "") {
      const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
      switch (normalized) {
        case "binary":
        case "true_false":
          return "binary";
        case "single":
        case "single_choice":
          return "single";
        case "multi":
        case "multi_select":
        case "multiple":
          return "multi";
        case "best":
        case "best_option":
          return "best";
        case "sequence":
        case "ordering":
          return "sequence";
        case "gap_fill_choice":
        case "cloze_choice":
          return "gap_fill_choice";
        case "gap_fill_text":
        case "cloze_text":
          return "gap_fill_text";
        default:
          return "";
      }
    }

    function normalizeTrainingQuestionKind(value = "") {
      const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
      if (!normalized || !Object.prototype.hasOwnProperty.call(TRAINING_QUESTION_KIND_META, normalized)) {
        return "";
      }
      return normalized;
    }

    function getTrainingQuestionKindMeta(questionKind = "") {
      const normalizedKind = normalizeTrainingQuestionKind(questionKind);
      if (!normalizedKind) return null;
      const meta = TRAINING_QUESTION_KIND_META[normalizedKind] || null;
      if (!meta) return null;
      return {
        ...meta,
        badgeLabel: t(meta.badgeLabelKey, meta.badgeLabelFallback || "")
      };
    }

    function getTrainingQuestionPromptText(question = null) {
      if (!question || typeof question !== "object") return "";
      return String(
        question.promptKey
          ? t(question.promptKey, question.prompt || "")
          : (question.prompt || "")
      ).trim();
    }

    function getTrainingOptionText(option = null) {
      if (!option || typeof option !== "object") return "";
      return String(
        option.textKey
          ? t(option.textKey, option.text || "")
          : (option.text || "")
      ).trim();
    }

    function getTrainingOptionExplanation(option = null) {
      if (!option || typeof option !== "object") return "";
      return String(
        option.explanationKey
          ? t(option.explanationKey, option.explanation || "")
          : (option.explanation || "")
      ).trim();
    }

    function getTrainingDeckMenuSubtitle(deck = null) {
      const key = String(deck?.menuSubtitleKey || "").trim();
      if (key) {
        return t(key, deck?.menuSubtitleFallback || "");
      }
      const raw = String(deck?.menuSubtitle || "").trim();
      if (!raw) {
        return t("training.menu.subtitle", "Trainingspool des Kurses");
      }
      if (
        isKnownI18nVariant(t("training.menu.subtitle", "Trainingspool des Kurses"), raw)
        || isKnownI18nVariant("Trainingspool des Kurses", raw)
        || isKnownI18nVariant("Course training pool", raw)
      ) {
        return t("training.menu.subtitle", "Trainingspool des Kurses");
      }
      return translateLiteralSource(raw);
    }

    function normalizeTrainingDbMeta(rawMeta, folder = "") {
      if (!rawMeta || typeof rawMeta !== "object") return null;
      const safeFolder = sanitizeFolderName(folder);
      const dbKey = String(rawMeta.dbKey || rawMeta.db_key || getQuizFolderName(safeFolder) || "").trim();
      const courseKey = String(rawMeta.courseKey || rawMeta.course_key || safeFolder || "").trim();
      const title = String(rawMeta.title || "").trim();
      const description = String(rawMeta.description || "").trim();
      const defaultBadgeLabel = String(rawMeta.defaultBadgeLabel || rawMeta.default_badge_label || "").trim();
      if (!dbKey && !courseKey && !title && !description && !defaultBadgeLabel) return null;
      return {
        dbKey,
        courseKey,
        title,
        description,
        defaultBadgeLabel,
        languageCode: String(rawMeta.languageCode || rawMeta.language_code || "de").trim() || "de"
      };
    }

    function normalizeTrainingDbPoolMeta(rawPool) {
      if (!rawPool || typeof rawPool !== "object") return null;
      const id = String(rawPool.id || "").trim();
      if (!id) return null;
      const sortOrder = Number(rawPool.sortOrder ?? rawPool.sort_order);
      const defaultInteractionType = normalizeTrainingInteractionType(rawPool.defaultInteractionType || rawPool.default_interaction_type || "");
      const defaultQuestionKind = normalizeTrainingQuestionKind(rawPool.defaultQuestionKind || rawPool.default_question_kind || "");
      return {
        id,
        slug: String(rawPool.slug || "").trim(),
        label: String(rawPool.label || rawPool.title || "Trainingspool").trim() || "Trainingspool",
        description: String(rawPool.description || "").trim(),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        defaultInteractionType,
        defaultQuestionKind,
        defaultBadgeLabel: String(rawPool.defaultBadgeLabel || rawPool.default_badge_label || "").trim(),
        sourceRef: String(rawPool.sourceRef || rawPool.source_ref || "").trim(),
        questionCount: Math.max(0, Number(rawPool.questionCount ?? rawPool.question_count) || 0),
        topics: uniqueStringArray((Array.isArray(rawPool.topics) ? rawPool.topics : []).map((entry) => String(entry || "").trim()).filter(Boolean)),
        interactionTypes: uniqueStringArray((Array.isArray(rawPool.interactionTypes) ? rawPool.interactionTypes : []).map((entry) => normalizeTrainingInteractionType(entry)).filter(Boolean)),
        questionKinds: uniqueStringArray((Array.isArray(rawPool.questionKinds) ? rawPool.questionKinds : []).map((entry) => normalizeTrainingQuestionKind(entry)).filter(Boolean))
      };
    }

    function resolveTrainingRuntimeType(interactionType, correctCount = 0) {
      const normalizedType = normalizeTrainingInteractionType(interactionType);
      switch (normalizedType) {
        case "binary":
        case "multi":
        case "best":
        case "single":
          return normalizedType;
        default:
          return correctCount > 1 ? "multi" : "single";
      }
    }

    function extractTrainingQuestionDefaults(payload = {}) {
      const questionKind = normalizeTrainingQuestionKind(payload?.defaultQuestionKind || payload?.questionKind || "");
      const questionKindMeta = getTrainingQuestionKindMeta(questionKind);
      const interactionType = normalizeTrainingInteractionType(
        payload?.defaultInteractionType ||
        payload?.interactionType ||
        questionKindMeta?.defaultInteractionType ||
        ""
      );
      const badgeLabel = String(
        payload?.defaultBadgeLabel ||
        payload?.badgeLabel ||
        questionKindMeta?.badgeLabel ||
        ""
      ).trim();
      return {
        questionKind,
        interactionType,
        badgeLabel
      };
    }

    function getTrainingQuestionBadgeLabel(question = null) {
      const explicitLabel = String(question?.badgeLabel || "").trim();
      const explicitLabelKey = String(question?.badgeLabelKey || "").trim();
      if (explicitLabelKey) return t(explicitLabelKey, explicitLabel || "");
      if (explicitLabel) return explicitLabel;
      const questionKindMeta = getTrainingQuestionKindMeta(question?.questionKind || "");
      if (questionKindMeta?.badgeLabel) return questionKindMeta.badgeLabel;
      switch (normalizeTrainingInteractionType(question?.interactionType || question?.type || "")) {
        case "binary":
          return t("training.kind.aussage_bewerten", "Stimmt diese Aussage?");
        case "multi":
          return t("training.kind.mehrere_richtige_antworten_waehlen", "Welche Aussagen sind korrekt?");
        case "best":
          return t("training.kind.beste_option_im_mini_szenario", "Was waere hier der beste naechste Schritt?");
        case "single":
          return t("training.kind.eine_richtige_antwort_waehlen", "Welche Antwort trifft am besten zu?");
        default:
          return t("training.pseudo.topic.said", "Was hat er gesagt?");
      }
    }

    function normalizeStoredTrainingDeckMeta(rawDeck) {
      if (!rawDeck || typeof rawDeck !== "object") return null;
      const safeFolder = sanitizeFolderName(rawDeck.folder || rawDeck.scenarioFolder || "");
      if (!safeFolder) return null;
      const quizItems = (Array.isArray(rawDeck.quizItems) ? rawDeck.quizItems : [])
        .map((item) => normalizeTrainingManifestItem(item, safeFolder))
        .filter(Boolean);
      const dbPools = (Array.isArray(rawDeck.dbPools) ? rawDeck.dbPools : [])
        .map((pool) => normalizeTrainingDbPoolMeta(pool))
        .filter(Boolean);
      if (!quizItems.length && !dbPools.length) return null;
      const sourceType = String(rawDeck.dataSource || (dbPools.length ? "sqlite" : "manifest")).trim().toLowerCase();
      return buildTrainingDeckMeta(safeFolder, {
        dataSource: sourceType === "sqlite" ? "sqlite" : "manifest",
        quizItems,
        dbPools,
        dbMeta: sourceType === "sqlite" ? (rawDeck.dbMeta || rawDeck) : null,
        questionCount: Math.max(0, Number(rawDeck.questionCount) || 0),
        dominantBadge: String(rawDeck.dominantBadge || "").trim()
      });
    }

    function normalizeStoredTrainingDeckCatalog(payload) {
      const source = Array.isArray(payload) ? payload : [];
      const seen = new Set();
      return source
        .map(normalizeStoredTrainingDeckMeta)
        .filter((deck) => {
          const folder = sanitizeFolderName(deck?.folder);
          if (!folder || seen.has(folder)) return false;
          seen.add(folder);
          return true;
        });
    }

    function normalizeStoredTrainingQuestion(rawQuestion, folder = "", questionIndex = 0) {
      if (!rawQuestion || typeof rawQuestion !== "object") return null;
      const prompt = String(rawQuestion.prompt || rawQuestion.title || rawQuestion.question || "").trim();
      if (!prompt) return null;
      const sourceFile = normalizeScenarioResourcePath(rawQuestion.sourceFile || rawQuestion.file || "");
      const questionBaseId = normalizeProgressId(
        rawQuestion.id || buildTrainingQuestionId(folder, sourceFile, rawQuestion.id, questionIndex)
      ) || buildTrainingQuestionId(folder, sourceFile, rawQuestion.id, questionIndex);
      const options = (Array.isArray(rawQuestion.options) ? rawQuestion.options : [])
        .map((option, optionIndex) => normalizeTrainingOption(option, questionBaseId, optionIndex))
        .filter((option) => option && option.text);
      const correctCount = options.filter((option) => option.correct).length;
      if (options.length < 2 || correctCount < 1) return null;
      const questionKind = normalizeTrainingQuestionKind(rawQuestion.questionKind || rawQuestion.kind || "");
      const questionKindMeta = getTrainingQuestionKindMeta(questionKind);
      const interactionType = normalizeTrainingInteractionType(
        rawQuestion.interactionType ||
        rawQuestion.type ||
        questionKindMeta?.defaultInteractionType ||
        ""
      );
      return {
        id: questionBaseId,
        conceptId: normalizeProgressId(rawQuestion.conceptId || questionBaseId) || questionBaseId,
        variantId: normalizeProgressId(rawQuestion.variantId || sourceFile || questionBaseId) || questionBaseId,
        folder: sanitizeFolderName(folder),
        type: resolveTrainingRuntimeType(rawQuestion.type || interactionType, correctCount),
        interactionType: interactionType || resolveTrainingRuntimeType(rawQuestion.type || "", correctCount),
        questionKind,
        badgeLabel: String(rawQuestion.badgeLabel || rawQuestion.modeLabel || questionKindMeta?.badgeLabel || "").trim(),
        maxSelections: Math.max(1, Number(rawQuestion.maxSelections) || (correctCount > 1 ? correctCount : 1)),
        prompt,
        options,
        isNew: Boolean(rawQuestion.isNew),
        ticketId: getScenarioStorageFileKey(rawQuestion.ticketId || sourceFile || "") || "",
        sourceFile
      };
    }

    function normalizeStoredTrainingDeck(rawDeck, folderHint = "") {
      if (!rawDeck || typeof rawDeck !== "object") return null;
      const safeFolder = sanitizeFolderName(rawDeck.folder || folderHint || "");
      if (!safeFolder) return null;
      const metaDeck = normalizeStoredTrainingDeckMeta({
        ...rawDeck,
        folder: safeFolder
      });
      if (!metaDeck) return null;
      const questions = (Array.isArray(rawDeck.questions) ? rawDeck.questions : [])
        .map((question, questionIndex) => normalizeStoredTrainingQuestion(question, safeFolder, questionIndex))
        .filter(Boolean);
      if (!questions.length) return null;
      return {
        ...metaDeck,
        questions,
        questionCount: Math.max(questions.length, Number(metaDeck.questionCount) || 0)
      };
    }

    function normalizeStoredTrainingDeckCache(payload) {
      const source = payload && typeof payload === "object" ? payload : {};
      const decks = Object.create(null);
      Object.entries(source).forEach(([folder, rawDeck]) => {
        const normalized = normalizeStoredTrainingDeck(rawDeck, folder);
        if (!normalized) return;
        decks[normalized.folder] = normalized;
      });
      return decks;
    }

    function normalizeTrainingManifestItem(rawItem, folder = "") {
      if (!rawItem) return null;
      const safeFolder = sanitizeFolderName(folder);
      const source = typeof rawItem === "string" ? { file: rawItem } : rawItem;
      const file = assertScenarioResourcePath(source.file || "", [".json"]);
      const parsed = parseScenarioBasename(file);
      const label = String(source.label || buildScenarioLabelFromPath(file)).trim() || "Quiz";
      return {
        file,
        label,
        folder: safeFolder,
        ticketId: getScenarioStorageFileKey(source.ticketId || source.scenarioFile || file) || "",
        versionId: String(source.versionId || (parsed ? `V${parsed.version}` : "")).trim().toUpperCase(),
        questionCount: Math.max(0, Number(source.questionCount) || 0),
        topics: uniqueStringArray((Array.isArray(source.topics) ? source.topics : []).map((entry) => String(entry || "").trim()).filter(Boolean)),
        interactionTypes: uniqueStringArray((Array.isArray(source.interactionTypes) ? source.interactionTypes : []).map((entry) => normalizeTrainingInteractionType(entry)).filter(Boolean)),
        questionKinds: uniqueStringArray((Array.isArray(source.questionKinds) ? source.questionKinds : []).map((entry) => normalizeTrainingQuestionKind(entry)).filter(Boolean)),
        dominantBadge: String(source.dominantBadge || source.badgeLabel || "").trim()
      };
    }

    function normalizeTrainingManifest(payload, folder = "") {
      const source = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload?.quizzes) ? payload.quizzes : []));
      if (!source.length) throw new Error(t("training.error.manifest_empty", "Quiz-Manifest enthaelt keine Eintraege."));
      return source
        .map((entry) => normalizeTrainingManifestItem(entry, folder))
        .filter(Boolean);
    }

    async function fetchTrainingManifest(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error(t("training.error.invalid_folder", "Ungueltiger Trainingsordner."));
      const basePath = getQuizBasePath(safeFolder);
      const manifestCandidates = buildLocalizedResourcePaths("quiz-manifest.json", getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(manifestCandidates, { cache: "no-store" });
      if (!res) {
        throw new Error(t("training.error.manifest_http", "Quiz-Manifest fuer {folder} konnte nicht geladen werden (HTTP {status})", {
          folder: safeFolder,
          status: 404
        }));
      }
      if (!res.ok) {
        throw new Error(t("training.error.manifest_http", "Quiz-Manifest fuer {folder} konnte nicht geladen werden (HTTP {status})", {
          folder: safeFolder,
          status: res.status
        }));
      }
      const payload = await res.json();
      return normalizeTrainingManifest(payload, safeFolder);
    }

    function buildTrainingDeckMeta(folder, config = []) {
      const safeFolder = sanitizeFolderName(folder);
      const shortLabel = getFolderShortcutLabel(safeFolder) || safeFolder || "Kurs";
      const sourceConfig = Array.isArray(config) ? { quizItems: config } : (config && typeof config === "object" ? config : {});
      const items = Array.isArray(sourceConfig.quizItems) ? sourceConfig.quizItems : [];
      const dbPools = (Array.isArray(sourceConfig.dbPools) ? sourceConfig.dbPools : [])
        .map((pool) => normalizeTrainingDbPoolMeta(pool))
        .filter(Boolean);
      const dbMeta = normalizeTrainingDbMeta(sourceConfig.dbMeta || null, safeFolder);
      const dataSource = String(sourceConfig.dataSource || (dbPools.length ? "sqlite" : "manifest")).trim().toLowerCase() === "sqlite"
        ? "sqlite"
        : "manifest";
      const generatedTitle = t("training.deck.title", "DoomScrollQuiz {label}", { label: shortLabel });
      const generatedDescription = t("training.deck.description", "Training fuer {label}.", { label: shortLabel });
      const title = String(sourceConfig.title || dbMeta?.title || generatedTitle).trim() || generatedTitle;
      const description = String(sourceConfig.description || dbMeta?.description || generatedDescription).trim() || generatedDescription;
      const dominantBadge = String(
        sourceConfig.dominantBadge ||
        dbMeta?.defaultBadgeLabel ||
        items.find((item) => String(item?.dominantBadge || "").trim())?.dominantBadge ||
        dbPools.find((pool) => String(pool?.defaultBadgeLabel || "").trim())?.defaultBadgeLabel ||
        ""
      ).trim();
      const questionCount = Math.max(
        0,
        Number(sourceConfig.questionCount) ||
        (dbPools.length
          ? dbPools.reduce((sum, pool) => sum + Math.max(0, Number(pool?.questionCount) || 0), 0)
          : items.reduce((sum, item) => sum + Math.max(0, Number(item?.questionCount) || 0), 0))
      );
      return {
        deckKey: `doomscroll_${normalizeProgressId(safeFolder || shortLabel)}`,
        folder: safeFolder,
        quizFolder: getQuizFolderName(safeFolder),
        title,
        description,
        menuSubtitleKey: "training.menu.subtitle",
        menuSubtitleFallback: "Trainingspool des Kurses",
        dataSource,
        dbMeta,
        dbPools,
        topics: uniqueStringArray([
          ...items.flatMap((item) => item.topics || []),
          ...dbPools.flatMap((pool) => pool.topics || [])
        ]),
        interactionTypes: uniqueStringArray([
          ...items.flatMap((item) => item.interactionTypes || []),
          ...dbPools.flatMap((pool) => [
            ...(pool.interactionTypes || []),
            pool.defaultInteractionType || ""
          ]).filter(Boolean)
        ]),
        questionKinds: uniqueStringArray([
          ...items.flatMap((item) => item.questionKinds || []),
          ...dbPools.flatMap((pool) => [
            ...(pool.questionKinds || []),
            pool.defaultQuestionKind || ""
          ]).filter(Boolean)
        ]),
        dominantBadge,
        quizItems: items,
        questionCount,
        questions: []
      };
    }

    async function fetchTrainingDeckMetaFromSqlite(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder || !isTrainingSqliteEnabledForFolder(safeFolder)) return null;
      const database = await openTrainingDatabase(safeFolder);
      try {
        const dbMetaRow = querySqliteRows(
          database,
          `SELECT id, schema_version, db_key, course_key, title, description, language_code, default_badge_label
           FROM quiz_db_meta
           WHERE id = 1
           LIMIT 1`
        )[0] || null;
        const poolRows = querySqliteRows(
          database,
          `SELECT
             p.id,
             p.slug,
             p.label,
             p.description,
             p.sort_order,
             p.default_interaction_type,
             p.default_question_kind,
             p.default_badge_label,
             p.source_ref,
             COUNT(q.id) AS question_count
           FROM quiz_pool p
           LEFT JOIN quiz_question q
             ON q.pool_id = p.id
            AND q.is_active = 1
           WHERE p.is_active = 1
           GROUP BY
             p.id,
             p.slug,
             p.label,
             p.description,
             p.sort_order,
             p.default_interaction_type,
             p.default_question_kind,
             p.default_badge_label,
             p.source_ref
           ORDER BY p.sort_order, p.label COLLATE NOCASE, p.id`
        );
        if (!poolRows.length) return null;
        const topicRows = querySqliteRows(
          database,
          `SELECT pool_id, topic
           FROM quiz_pool_topic
           ORDER BY topic COLLATE NOCASE, pool_id`
        );
        const topicsByPoolId = new Map();
        topicRows.forEach((row) => {
          const poolId = String(row.pool_id || "").trim();
          const topic = String(row.topic || "").trim();
          if (!poolId || !topic) return;
          const collection = topicsByPoolId.get(poolId) || [];
          collection.push(topic);
          topicsByPoolId.set(poolId, collection);
        });
        const dbPools = poolRows
          .map((row) => normalizeTrainingDbPoolMeta({
            ...row,
            topics: topicsByPoolId.get(String(row.id || "").trim()) || []
          }))
          .filter(Boolean);
        if (!dbPools.length) return null;
        return buildTrainingDeckMeta(safeFolder, {
          dataSource: "sqlite",
          dbMeta: dbMetaRow,
          dbPools,
          questionCount: dbPools.reduce((sum, pool) => sum + Math.max(0, Number(pool?.questionCount) || 0), 0)
        });
      } finally {
        database.close();
      }
    }

    async function fetchTrainingDeckMeta(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error(t("training.error.invalid_folder", "Ungueltiger Trainingsordner."));
      if (isTrainingSqliteEnabledForFolder(safeFolder)) {
        const sqliteDeck = await fetchTrainingDeckMetaFromSqlite(safeFolder).catch(() => null);
        if (sqliteDeck) return sqliteDeck;
      }
      const quizItems = await fetchTrainingManifest(safeFolder);
      if (!quizItems.length) return null;
      return buildTrainingDeckMeta(safeFolder, {
        dataSource: "manifest",
        quizItems
      });
    }

    async function ensureTrainingDeckCatalogLoaded(forceRefresh = false) {
      if (!forceRefresh && getVisibleTrainingDecks().length) return getVisibleTrainingDecks();
      if (trainingDeckCatalogPromise && !forceRefresh) return trainingDeckCatalogPromise;
      trainingDeckCatalogPromise = (async () => {
        const folders = getUnlockedFolders();
        const existingDecksByFolder = new Map(
          (Array.isArray(trainingDeckCatalog) ? trainingDeckCatalog : [])
            .map((deck) => [sanitizeFolderName(deck?.folder), deck])
            .filter(([folder]) => Boolean(folder))
        );
        const decks = await Promise.all(folders.map(async (folder) => {
          try {
            return await fetchTrainingDeckMeta(folder);
          } catch {
            return existingDecksByFolder.get(sanitizeFolderName(folder)) || null;
          }
        }));
        trainingDeckCatalog = decks.filter((deck) => deck && (deck.questionCount > 0 || deck.quizItems.length > 0));
        saveStoredTrainingDeckCatalog(trainingDeckCatalog);
        return getVisibleTrainingDecks();
      })().finally(() => {
        trainingDeckCatalogPromise = null;
      });
      return trainingDeckCatalogPromise;
    }

    function buildTrainingQuestionId(folder, itemFile, questionId, questionIndex) {
      return normalizeProgressId(`${folder}::${itemFile}::${questionId || `q${questionIndex + 1}`}`) || `training_q_${questionIndex + 1}`;
    }

    function normalizeTrainingOption(rawOption, questionBaseId, optionIndex, correctIndex = -1) {
      const isGeneratedCorrectOption = optionIndex === correctIndex;
      const generatedExplanationKey = isGeneratedCorrectOption
        ? "training.option.explanation.correct_default"
        : "training.option.explanation.wrong_default";
      const generatedExplanation = isGeneratedCorrectOption
        ? t("training.option.explanation.correct_default", "Diese Antwort trifft die beabsichtigte Aussage.")
        : t("training.option.explanation.wrong_default", "Diese Antwort klingt moeglich, passt aber nicht zur Quiz-Idee.");
      if (typeof rawOption === "string") {
        return {
          id: `${questionBaseId}_opt_${optionIndex + 1}`,
          text: rawOption,
          correct: isGeneratedCorrectOption,
          explanationKey: generatedExplanationKey,
          explanation: generatedExplanation
        };
      }
      if (!rawOption || typeof rawOption !== "object") return null;
      const explicitExplanation = String(rawOption.explanation || rawOption.rationale || "").trim();
      return {
        id: normalizeProgressId(rawOption.id || `${questionBaseId}_opt_${optionIndex + 1}`) || `${questionBaseId}_opt_${optionIndex + 1}`,
        text: String(rawOption.text || rawOption.label || "").trim(),
        correct: Boolean(rawOption.correct),
        explanationKey: explicitExplanation ? String(rawOption.explanationKey || "").trim() : generatedExplanationKey,
        explanation: explicitExplanation || generatedExplanation
      };
    }

    function normalizeTrainingQuestionEntry(rawQuestion, item, folder = "", questionIndex = 0, defaults = null) {
      if (!rawQuestion || typeof rawQuestion !== "object") return null;
      const prompt = String(rawQuestion.prompt || rawQuestion.title || rawQuestion.question || "").trim();
      if (!prompt) return null;
      const questionBaseId = buildTrainingQuestionId(folder, item?.file || "", rawQuestion.id, questionIndex);
      const rawOptions = Array.isArray(rawQuestion.options) ? rawQuestion.options : [];
      const correctIndex = Number.isInteger(rawQuestion.correctIndex) ? Number(rawQuestion.correctIndex) : -1;
      const options = rawOptions
        .map((option, optionIndex) => normalizeTrainingOption(option, questionBaseId, optionIndex, correctIndex))
        .filter((option) => option && option.text);
      if (options.length < 2) return null;
      const correctCount = options.filter((option) => option.correct).length;
      const questionKind = normalizeTrainingQuestionKind(rawQuestion.questionKind || rawQuestion.kind || defaults?.questionKind || "");
      const questionKindMeta = getTrainingQuestionKindMeta(questionKind);
      const interactionType = normalizeTrainingInteractionType(
        rawQuestion.interactionType ||
        rawQuestion.type ||
        defaults?.interactionType ||
        questionKindMeta?.defaultInteractionType ||
        ""
      );
      return {
        id: questionBaseId,
        conceptId: normalizeProgressId(rawQuestion.conceptId || `${item?.ticketId || item?.file || "ticket"}::${rawQuestion.id || `q${questionIndex + 1}`}`) || questionBaseId,
        variantId: normalizeProgressId(rawQuestion.variantId || item?.file || questionBaseId) || questionBaseId,
        folder: sanitizeFolderName(folder),
        type: resolveTrainingRuntimeType(interactionType, correctCount),
        interactionType: interactionType || resolveTrainingRuntimeType("", correctCount),
        questionKind,
        badgeLabel: String(rawQuestion.badgeLabel || rawQuestion.modeLabel || defaults?.badgeLabel || questionKindMeta?.badgeLabel || "").trim(),
        maxSelections: Math.max(1, Number(rawQuestion.maxSelections) || (correctCount > 1 ? correctCount : 1)),
        prompt,
        options,
        isNew: Boolean(rawQuestion.isNew),
        ticketId: item?.ticketId || "",
        sourceFile: item?.file || ""
      };
    }

    async function loadTrainingQuizJsonByPath(filePath, folder = "") {
      const safeFile = assertScenarioResourcePath(filePath, [".json"]);
      const basePath = getQuizBasePath(folder);
      if (!basePath) throw new Error(t("training.error.no_quiz_path", "Kein Quiz-Pfad verfuegbar."));
      const candidates = buildLocalizedResourcePaths(safeFile, getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(candidates, { cache: "no-store" });
      if (!res) throw new Error(`${safeFile} (HTTP 404)`);
      if (!res.ok) throw new Error(`${safeFile} (HTTP ${res.status})`);
      return res.json();
    }

    async function loadTrainingDeck(folder, forceRefresh = false) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error(t("training.error.invalid_folder", "Ungueltiger Trainingsordner."));
      const cachedDeck = trainingDeckCacheByFolder[safeFolder] || null;
      if (!forceRefresh && cachedDeck) {
        return cachedDeck;
      }
      try {
        const catalog = await ensureTrainingDeckCatalogLoaded(forceRefresh);
        const metaDeck = catalog.find((deck) => sanitizeFolderName(deck?.folder) === safeFolder);
        if (!metaDeck || !metaDeck.quizItems.length) {
          if (!metaDeck || metaDeck.dataSource !== "sqlite" || !Array.isArray(metaDeck.dbPools) || !metaDeck.dbPools.length) {
            throw new Error(t("training.error.no_questions_for_folder", "Für {folder} sind noch keine Trainingsfragen verfügbar.", {
              folder: safeFolder
            }));
          }
        }
        let normalizedQuestions = [];
        if (metaDeck.dataSource === "sqlite" && Array.isArray(metaDeck.dbPools) && metaDeck.dbPools.length) {
          const database = await openTrainingDatabase(safeFolder);
          try {
            const dbMeta = normalizeTrainingDbMeta(metaDeck.dbMeta || null, safeFolder);
            const poolIds = metaDeck.dbPools
              .map((pool) => String(pool?.id || "").trim())
              .filter(Boolean);
            if (!poolIds.length) {
              throw new Error(t("training.error.no_questions_for_folder", "Für {folder} sind noch keine Trainingsfragen verfügbar.", {
                folder: safeFolder
              }));
            }
            const placeholders = poolIds.map(() => "?").join(", ");
            const questionRows = querySqliteRows(
              database,
              `SELECT
                 q.id,
                 q.pool_id,
                 q.concept_id,
                 q.variant_id,
                 q.sort_order,
                 q.interaction_type,
                 q.question_kind,
                 q.badge_label,
                 q.prompt,
                 q.instructions,
                 q.context,
                 q.max_selections,
                 q.is_new,
                 q.sentence_template,
                 q.gap_key,
                 q.source_ref
               FROM quiz_question q
               JOIN quiz_pool p
                 ON p.id = q.pool_id
              WHERE p.is_active = 1
                AND q.is_active = 1
                AND q.pool_id IN (${placeholders})
              ORDER BY p.sort_order, p.label COLLATE NOCASE, q.sort_order, q.created_at, q.id`,
              poolIds
            );
            if (!questionRows.length) {
              throw new Error(t("training.error.no_questions_for_folder", "Für {folder} sind noch keine Trainingsfragen verfügbar.", {
                folder: safeFolder
              }));
            }
            const optionRows = querySqliteRows(
              database,
              `SELECT
                 o.id,
                 o.question_id,
                 o.option_key,
                 o.sort_order,
                 o.short_label,
                 o.text,
                 o.explanation,
                 o.is_correct
               FROM quiz_option o
               JOIN quiz_question q
                 ON q.id = o.question_id
               JOIN quiz_pool p
                 ON p.id = q.pool_id
              WHERE p.is_active = 1
                AND q.is_active = 1
                AND o.is_active = 1
                AND q.pool_id IN (${placeholders})
              ORDER BY o.question_id, o.sort_order, o.id`,
              poolIds
            );
            const optionsByQuestionId = new Map();
            optionRows.forEach((row) => {
              const questionId = String(row.question_id || "").trim();
              if (!questionId) return;
              const collection = optionsByQuestionId.get(questionId) || [];
              collection.push({
                id: String(row.id || "").trim(),
                label: String(row.short_label || "").trim(),
                text: String(row.text || "").trim(),
                correct: Boolean(Number(row.is_correct)),
                explanation: String(row.explanation || "").trim()
              });
              optionsByQuestionId.set(questionId, collection);
            });
            const poolById = new Map(
              metaDeck.dbPools
                .map((pool) => normalizeTrainingDbPoolMeta(pool))
                .filter(Boolean)
                .map((pool) => [pool.id, pool])
            );
            normalizedQuestions = questionRows
              .map((row, questionIndex) => {
                const questionId = String(row.id || "").trim();
                const poolId = String(row.pool_id || "").trim();
                const poolMeta = poolById.get(poolId) || null;
                return normalizeTrainingQuestionEntry(
                  {
                    id: questionId,
                    conceptId: String(row.concept_id || "").trim(),
                    variantId: String(row.variant_id || "").trim(),
                    interactionType: String(row.interaction_type || "").trim(),
                    questionKind: String(row.question_kind || "").trim(),
                    badgeLabel: String(row.badge_label || "").trim(),
                    prompt: String(row.prompt || "").trim(),
                    instructions: String(row.instructions || "").trim(),
                    context: String(row.context || "").trim(),
                    maxSelections: Math.max(1, Number(row.max_selections) || 1),
                    isNew: Boolean(Number(row.is_new)),
                    sentenceTemplate: String(row.sentence_template || "").trim(),
                    gapKey: String(row.gap_key || "").trim(),
                    sourceRef: String(row.source_ref || "").trim(),
                    options: optionsByQuestionId.get(questionId) || []
                  },
                  {
                    ticketId: "",
                    file: `db/${poolMeta?.slug || poolId || "pool"}`,
                    label: poolMeta?.label || "Trainingspool"
                  },
                  safeFolder,
                  questionIndex,
                  {
                    interactionType: poolMeta?.defaultInteractionType || dbMeta?.defaultInteractionType || "",
                    questionKind: poolMeta?.defaultQuestionKind || dbMeta?.defaultQuestionKind || "",
                    badgeLabel: poolMeta?.defaultBadgeLabel || dbMeta?.defaultBadgeLabel || ""
                  }
                );
              })
              .filter(Boolean);
          } finally {
            database.close();
          }
        } else {
          for (const item of metaDeck.quizItems) {
            const payload = await loadTrainingQuizJsonByPath(item.file, safeFolder);
            const questionDefaults = extractTrainingQuestionDefaults(payload);
            const rawQuestions = Array.isArray(payload?.questions) ? payload.questions : [];
            rawQuestions.forEach((rawQuestion, questionIndex) => {
              const normalizedQuestion = normalizeTrainingQuestionEntry(rawQuestion, item, safeFolder, questionIndex, questionDefaults);
              if (normalizedQuestion) normalizedQuestions.push(normalizedQuestion);
            });
          }
        }
        const deck = {
          ...metaDeck,
          questions: normalizeTrainingQuestions({
            ...metaDeck,
            questions: normalizedQuestions
          }),
          questionCount: normalizedQuestions.length
        };
        trainingDeckCacheByFolder[safeFolder] = deck;
        trainingDeckCacheSourceByFolder[safeFolder] = "live";
        saveStoredTrainingDeckCache(trainingDeckCacheByFolder);
        trainingDeckCatalog = trainingDeckCatalog.map((entry) => sanitizeFolderName(entry?.folder) === safeFolder ? { ...entry, questionCount: deck.questionCount } : entry);
        saveStoredTrainingDeckCatalog(trainingDeckCatalog);
        setCachedCourseUnlockSummary(computeCourseUnlockSummary(safeFolder, null, { deck }));
        return deck;
      } catch (error) {
        if (cachedDeck) return cachedDeck;
        throw error;
      }
    }

    function getVisibleTrainingDecks() {
      const source = Array.isArray(trainingDeckCatalog) ? trainingDeckCatalog : [];
      const unlockedFolders = new Set(getUnlockedFolders());
      return source.filter((deck) => unlockedFolders.has(sanitizeFolderName(deck?.folder)));
    }

    function getActiveTrainingDeck(decks = getVisibleTrainingDecks()) {
      if (trainingSession?.deck) return trainingSession.deck;
      const source = Array.isArray(decks) ? decks : [];
      if (!source.length) return null;
      const preferredFolder = sanitizeFolderName(activeTrainingFolder || activeScenarioFolder || activeHomeSkillsFolder);
      return source.find((deck) => sanitizeFolderName(deck?.folder) === preferredFolder) || source[0] || null;
    }

    function randomIntegerBetween(min, max) {
      const lower = Math.max(0, Math.min(min, max));
      const upper = Math.max(lower, Math.max(min, max));
      return lower + Math.floor(Math.random() * (upper - lower + 1));
    }

    function createTrainingSessionFromDeck(deck) {
      return {
        deck,
        questions: normalizeTrainingQuestions(deck),
        questionStateById: Object.create(null),
        answered: 0,
        exactMatches: 0,
        progressTotalUnits: 0,
        progressAnsweredUnits: 0,
        progressCorrectUnits: 0,
        progressWrongUnits: 0,
        progressOpenUnits: 0,
        currentQuestionIndex: 0,
        activeCardState: null,
        feedCardStates: [],
        feedViewportCleanup: null,
        feedViewportSyncRaf: 0,
        feedSnapTimeout: 0,
        feedSnapLocked: false,
        feedSnapReleaseTimeout: 0,
        summaryAppended: false,
        openWrongReviewIn: randomIntegerBetween(3, 5),
        openCorrectReviewIn: randomIntegerBetween(12, 16),
        closedCorrectReviewIn: randomIntegerBetween(12, 16),
        lowWrongCorrectIn: 3
      };
    }

    function getTrainingQuestionBuckets() {
      const questions = Array.isArray(trainingSession?.questions) ? trainingSession.questions : [];
      const stateMap = trainingSession?.questionStateById || Object.create(null);
      const open = [];
      const wrong = [];
      const correct = [];
      for (const question of questions) {
        const questionState = String(stateMap[question.id] || "open");
        if (questionState === "correct") {
          correct.push(question);
        } else if (questionState === "wrong") {
          wrong.push(question);
        } else {
          open.push(question);
        }
      }
      return { open, wrong, correct };
    }

    function getTrainingProgressUnitId(question) {
      return normalizeProgressId(question?.conceptId || question?.variantId || question?.id || "");
    }

    function getTrainingProgressBuckets() {
      const questions = Array.isArray(trainingSession?.questions) ? trainingSession.questions : [];
      const stateMap = trainingSession?.questionStateById || Object.create(null);
      const unitsById = new Map();
      for (const question of questions) {
        const unitId = getTrainingProgressUnitId(question);
        if (!unitId) continue;
        let unit = unitsById.get(unitId);
        if (!unit) {
          unit = {
            id: unitId,
            questions: [],
            openCount: 0,
            wrongCount: 0,
            correctCount: 0
          };
          unitsById.set(unitId, unit);
        }
        unit.questions.push(question);
        const questionState = String(stateMap[question.id] || "open");
        if (questionState === "correct") {
          unit.correctCount += 1;
        } else if (questionState === "wrong") {
          unit.wrongCount += 1;
        } else {
          unit.openCount += 1;
        }
      }
      const open = [];
      const wrong = [];
      const correct = [];
      for (const unit of unitsById.values()) {
        if (unit.openCount > 0) {
          open.push(unit);
        } else if (unit.wrongCount > 0) {
          wrong.push(unit);
        } else {
          correct.push(unit);
        }
      }
      return {
        open,
        wrong,
        correct,
        total: unitsById.size
      };
    }

    function syncTrainingSessionCounts() {
      if (!trainingSession) return;
      const questionBuckets = getTrainingQuestionBuckets();
      trainingSession.answered = questionBuckets.wrong.length + questionBuckets.correct.length;
      trainingSession.exactMatches = questionBuckets.correct.length;
      const progressBuckets = getTrainingProgressBuckets();
      trainingSession.progressTotalUnits = progressBuckets.total;
      trainingSession.progressAnsweredUnits = progressBuckets.wrong.length + progressBuckets.correct.length;
      trainingSession.progressCorrectUnits = progressBuckets.correct.length;
      trainingSession.progressWrongUnits = progressBuckets.wrong.length;
      trainingSession.progressOpenUnits = progressBuckets.open.length;
    }

    function pickTrainingQuestionFromPool(pool, excludedQuestionId = "") {
      const source = Array.isArray(pool) ? pool.filter(Boolean) : [];
      if (!source.length) return null;
      const filtered = source.filter((question) => question.id !== excludedQuestionId);
      const candidates = filtered.length ? filtered : source;
      return candidates[Math.floor(Math.random() * candidates.length)] || null;
    }

    function selectNextTrainingQuestion(excludedQuestionId = "") {
      if (!trainingSession) return null;
      const buckets = getTrainingQuestionBuckets();
      const hasOpen = buckets.open.length > 0;
      const wrongCount = buckets.wrong.length;
      const correctCount = buckets.correct.length;

      let nextQuestion = null;
      let selectedPool = "open";

      if (hasOpen) {
        const shouldShowCorrect = correctCount > 0 && trainingSession.openCorrectReviewIn <= 1;
        const shouldShowWrong = wrongCount > 0 && trainingSession.openWrongReviewIn <= 1;

        if (shouldShowWrong) {
          nextQuestion = pickTrainingQuestionFromPool(buckets.wrong, excludedQuestionId);
          selectedPool = nextQuestion ? "wrong" : "open";
        }
        if (!nextQuestion && shouldShowCorrect) {
          nextQuestion = pickTrainingQuestionFromPool(buckets.correct, excludedQuestionId);
          selectedPool = nextQuestion ? "correct" : "open";
        }
        if (!nextQuestion) {
          nextQuestion = pickTrainingQuestionFromPool(buckets.open, excludedQuestionId) ||
            pickTrainingQuestionFromPool(buckets.wrong, excludedQuestionId) ||
            pickTrainingQuestionFromPool(buckets.correct, excludedQuestionId);
          selectedPool = buckets.open.length ? "open" : (buckets.wrong.length ? "wrong" : "correct");
        }

        trainingSession.openWrongReviewIn = selectedPool === "wrong"
          ? randomIntegerBetween(3, 5)
          : Math.max(1, Number(trainingSession.openWrongReviewIn || randomIntegerBetween(3, 5)) - 1);
        trainingSession.openCorrectReviewIn = selectedPool === "correct"
          ? randomIntegerBetween(12, 16)
          : Math.max(1, Number(trainingSession.openCorrectReviewIn || randomIntegerBetween(12, 16)) - 1);
        return nextQuestion;
      }

      if (wrongCount > 0) {
        const lowWrongPool = wrongCount < 17;
        const shouldShowCorrect = correctCount > 0 && (
          lowWrongPool
            ? trainingSession.lowWrongCorrectIn <= 1
            : trainingSession.closedCorrectReviewIn <= 1
        );

        if (shouldShowCorrect) {
          nextQuestion = pickTrainingQuestionFromPool(buckets.correct, excludedQuestionId);
          selectedPool = nextQuestion ? "correct" : "wrong";
        }
        if (!nextQuestion) {
          nextQuestion = pickTrainingQuestionFromPool(buckets.wrong, excludedQuestionId) ||
            pickTrainingQuestionFromPool(buckets.correct, excludedQuestionId);
          selectedPool = buckets.wrong.length ? "wrong" : "correct";
        }

        if (lowWrongPool) {
          trainingSession.lowWrongCorrectIn = selectedPool === "correct"
            ? 3
            : Math.max(1, Number(trainingSession.lowWrongCorrectIn || 3) - 1);
        } else {
          trainingSession.closedCorrectReviewIn = selectedPool === "correct"
            ? randomIntegerBetween(12, 16)
            : Math.max(1, Number(trainingSession.closedCorrectReviewIn || randomIntegerBetween(12, 16)) - 1);
        }
        return nextQuestion;
      }

      return pickTrainingQuestionFromPool(buckets.correct, excludedQuestionId) ||
        pickTrainingQuestionFromPool(buckets.open, excludedQuestionId);
    }

    function clearTrainingSession() {
      disposeTrainingFeedState(trainingSession);
      activeTrainingDeckKey = "";
      activeTrainingFolder = "";
      trainingSession = null;
      setTrainingProgressRailVisible(false);
    }

    function updateTrainingMenuButtonState(isOpen = false) {
      if (!trainingMenuButton) return;
      if (isOpen) {
        const closeLabel = t("nav.training.close", "Training schliessen");
        trainingMenuButton.setAttribute("aria-label", closeLabel);
        trainingMenuButton.dataset.appbarTooltip = t("appbar.tooltip.training", "Training");
        trainingMenuButton.removeAttribute("title");
        return;
      }
      const activeDeck = getActiveTrainingDeck();
      const activeLabel = getFolderShortcutLabel(activeDeck?.folder || activeTrainingFolder) || String(activeDeck?.folder || activeTrainingFolder || "").trim();
      const baseLabel = activeLabel
        ? t("nav.training.open_current", "Training öffnen (aktuell: {label})", { label: activeLabel })
        : t("nav.training.open", "Training öffnen");
      trainingMenuButton.setAttribute("aria-label", baseLabel);
      trainingMenuButton.dataset.appbarTooltip = t("appbar.tooltip.training", "Training");
      trainingMenuButton.removeAttribute("title");
    }

    function setTrainingProgressRailVisible(visible) {
      if (!trainingProgressRail) return;
      const nextVisible = Boolean(visible);
      trainingProgressRail.classList.toggle("hidden", !nextVisible);
      trainingProgressRail.setAttribute("aria-hidden", String(!nextVisible));
    }

    function getActiveScenarioGroup(groups = availableScenarios) {
      const source = Array.isArray(groups) ? groups : [];
      if (!source.length) return null;
      const activeFolder = sanitizeFolderName(activeScenarioFolder);
      return source.find((group) => sanitizeFolderName(group?.folder) === activeFolder) || source[0] || null;
    }

    function getActiveCourseMenuLabel() {
      const activeGroup = getActiveScenarioGroup(availableScenarios);
      const labelSource = activeGroup?.folder || activeScenarioFolder;
      return getFolderShortcutLabel(labelSource) || String(labelSource || "").trim();
    }

    function updateCourseMenuButtonState(isOpen = false) {
      if (!courseMenuButton) return;
      if (isOpen) {
        const closeLabel = t("nav.course.close", "Kursauswahl schliessen");
        courseMenuButton.setAttribute("aria-label", closeLabel);
        courseMenuButton.dataset.appbarTooltip = t("appbar.tooltip.course", "Kurse");
        courseMenuButton.removeAttribute("title");
        return;
      }
      const activeLabel = getActiveCourseMenuLabel();
      const baseLabel = activeLabel
        ? t("nav.course.open_current", "Kursauswahl öffnen (aktuell: {label})", { label: activeLabel })
        : t("nav.course.open", "Kursauswahl öffnen");
      courseMenuButton.setAttribute("aria-label", baseLabel);
      courseMenuButton.dataset.appbarTooltip = t("appbar.tooltip.course", "Kurse");
      courseMenuButton.removeAttribute("title");
    }

    function resetRuntimeState(options = {}) {
      if (!options.preserveTrainingSession) {
        disposeTrainingFeedState(trainingSession);
      }
      if (!options.preserveChallengeView) {
        destroyActiveChallengeView();
      }
      if (!options.preservePresenterView) {
        destroyActivePresenterView();
      }
      for (const key of Object.keys(answers)) delete answers[key];
      touchedQuestionIds.clear();
      questionMarkerState = Object.create(null);
      inlineSummary = null;
      lastResults = null;
      if (submitButton) {
        const readyLabel = t(SUBMIT_BUTTON_READY_KEY, "Abgeben und Auswertung anzeigen");
        submitButton.textContent = readyLabel;
        submitButton.classList.remove("is-pending");
        submitButton.title = readyLabel;
      }
    }

    function setSubmitBarVisible(visible) {
      submitBar.classList.toggle("hidden", !visible);
      if (!visible) toggleTaskNavDrawer(false);
      if (visible) updateSubmitButtonState();
    }

    function markQuestionTouched(questionId) {
      const qid = String(questionId || "").trim();
      if (!qid) return;
      touchedQuestionIds.add(qid);
      markQuestionMarkerInteracted(scenarioData);
      updateSubmitButtonState();
      syncQuestionMarkerWithAnswer(qid);
    }

    function isRequiredMetaFieldAnswered(field) {
      const fieldId = String(field?.id || "").trim();
      if (!fieldId) return true;
      if (!document.querySelector(`input[data-field-id="${fieldId}"]`)) return true;
      return String(answers["_meta_" + fieldId] || "").trim().length > 0;
    }

    function isContextCard(question) {
      return question && question.type === "context_card";
    }

    function isStructuralQuestion(question) {
      return isFollowupDivider(question) || isContextCard(question);
    }

    function getTableFillFields(question) {
      const rows = Array.isArray(question?.rows) ? question.rows : [];
      const fields = [];
      rows.forEach((row, rowIndex) => {
        (Array.isArray(row) ? row : []).forEach((cell, colIndex) => {
          if (!cell || typeof cell !== "object") return;
          if (!Object.prototype.hasOwnProperty.call(cell, "expected")) return;
          fields.push({
            rowIndex,
            colIndex,
            key: String(cell.key || `r${rowIndex}c${colIndex}`),
            cell
          });
        });
      });
      return fields;
    }

    function getGapFillFields(question) {
      return (Array.isArray(question?.lines) ? question.lines : [])
        .map((line, index) => ({
          index,
          key: String(line?.key || `line${index}`),
          line
        }))
        .filter((entry) => entry.line && typeof entry.line === "object" && Object.prototype.hasOwnProperty.call(entry.line, "answer"));
    }

    function normalizeGapFillChoicePoolEntry(entry, index) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const label = String(entry.label ?? entry.text ?? entry.value ?? entry.id ?? `Option ${index + 1}`);
        const value = String(entry.value ?? entry.label ?? entry.text ?? entry.id ?? "");
        return {
          id: `pool_${index}_${String(entry.id ?? label)}`,
          label,
          value
        };
      }
      const text = String(entry ?? "");
      return {
        id: `pool_${index}_${text}`,
        label: text,
        value: text
      };
    }

    function getGapFillChoicePoolEntries(question) {
      return Array.isArray(question?.choicePool)
        ? question.choicePool.map((entry, index) => normalizeGapFillChoicePoolEntry(entry, index))
        : [];
    }

    function resolveGapFillChoiceToken(question, rawValue, excludeIds = null) {
      const target = String(rawValue ?? "");
      if (!target) return null;
      return getGapFillChoicePoolEntries(question).find((entry) => {
        if (excludeIds && excludeIds.has(entry.id)) return false;
        return entry.id === target || entry.value === target;
      }) || null;
    }

    function resolveGapFillChoiceValue(question, rawValue) {
      const token = resolveGapFillChoiceToken(question, rawValue);
      return token ? token.value : String(rawValue ?? "");
    }

    function resolveGapFillChoiceLabel(question, rawValue) {
      const token = resolveGapFillChoiceToken(question, rawValue);
      return token ? token.label : String(rawValue ?? "");
    }

    function isCondensedSqlDragReviewQuestion(question) {
      return question?.type === "gap_fill_code" && question?.interaction === "drag_drop";
    }

    function getGapFillSolutionVariants(question, maxVariants = 8) {
      const fields = getGapFillFields(question);
      if (!fields.length) return [];
      let combinations = [[]];
      for (const field of fields) {
        const values = [...new Set(
          [field?.line?.answer, ...(Array.isArray(field?.line?.alternatives) ? field.line.alternatives : [])]
            .map((value) => String(value ?? "").trim())
            .filter(Boolean)
        )];
        const next = [];
        for (const prefix of combinations) {
          for (const value of values) {
            if (next.length >= maxVariants) break;
            next.push([...prefix, value]);
          }
          if (next.length >= maxVariants) break;
        }
        combinations = next;
        if (!combinations.length) break;
      }
      return [...new Set(combinations.map(formatGapFillSolutionVariant))];
    }

    function formatGapFillSolutionVariant(tokens) {
      return tokens
        .map((token) => String(token ?? "").trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .replace(/\s+([,.;])/g, "$1")
        .replace(/\s*\.\s*/g, ".")
        .replace(/\s+/g, " ")
        .trim();
    }

    function isQuestionAnswered(question) {
      if (!question || isStructuralQuestion(question)) return true;
      const questionId = String(question.id || "").trim();
      const user = answers[questionId];
      if (question.type === "single_choice") return Number.isInteger(user);
      if (question.type === "multi_select") return user instanceof Set && user.size > 0;
      if (question.type === "match_pairs") {
        const pairs = Array.isArray(question.pairs) ? question.pairs : [];
        if (!pairs.length) return true;
        if (!user || typeof user !== "object") return false;
        return pairs.every((pair, index) => String(user[String(pair?.key || index)] || "").trim().length > 0);
      }
      if (question.type === "ordering") {
        return touchedQuestionIds.has(questionId) && Array.isArray(user) && user.length > 0;
      }
      if (question.type === "table_fill") {
        const fields = getTableFillFields(question);
        if (!fields.length) return true;
        if (!user || typeof user !== "object") return false;
        return fields.every((field) => String(user[field.key] || "").trim().length > 0);
      }
      if (question.type === "gap_fill_code") {
        const fields = getGapFillFields(question);
        if (!fields.length) return true;
        if (!user || typeof user !== "object") return false;
        return fields.every((field) => String(user[field.key] || "").trim().length > 0);
      }
      if (question.type === "number") {
        const raw = String(user || "").trim();
        if (!raw) return false;
        return Number.isFinite(Number(raw.replace(",", ".")));
      }
      if (question.type === "short_text") {
        const hasText = String(user || "").trim().length > 0;
        if (!hasText) return false;
        if (question.requireInteraction) return touchedQuestionIds.has(questionId);
        return true;
      }
      return String(user || "").trim().length > 0;
    }

    function getScenarioCompletionState(data) {
      const questions = Array.isArray(data?.questions)
        ? data.questions.filter((q) => !isStructuralQuestion(q))
        : [];
      const requiredMetaFields = (data?.submission?.participantFields || []).filter((field) => field?.required);
      const unansweredQuestions = questions.filter((question) => !isQuestionAnswered(question));
      const unansweredMetaFields = requiredMetaFields.filter((field) => !isRequiredMetaFieldAnswered(field));
      const totalRequired = questions.length + requiredMetaFields.length;
      const completedCount = totalRequired - unansweredQuestions.length - unansweredMetaFields.length;
      return {
        totalRequired,
        completedCount,
        unansweredQuestions,
        unansweredMetaFields,
        missingCount: unansweredQuestions.length + unansweredMetaFields.length,
        firstIncompleteQuestionId: unansweredQuestions[0]?.id || ""
      };
    }

    function updateSubmitButtonState(data = scenarioData) {
      if (!submitButton) return;
      const readyLabel = t(SUBMIT_BUTTON_READY_KEY, "Abgeben und Auswertung anzeigen");
      if (!data) {
        submitButton.textContent = readyLabel;
        submitButton.classList.remove("is-pending");
        submitButton.title = readyLabel;
        return;
      }
      const completion = getScenarioCompletionState(data);
      if (completion.missingCount > 0) {
        const missingLabel = completion.missingCount === 1
          ? t("scenario.submit.missing_one", "Noch 1 Eingabe offen")
          : t("scenario.submit.missing_many", "Noch {count} Eingaben offen", { count: completion.missingCount });
        submitButton.textContent = missingLabel;
        submitButton.classList.add("is-pending");
        submitButton.title = t("scenario.submit.pending_title", "{label} - bitte erst alles ausfuellen", {
          label: missingLabel
        });
        return;
      }
      submitButton.textContent = readyLabel;
      submitButton.classList.remove("is-pending");
      submitButton.title = readyLabel;
    }

    function buildTaskNavigationItems(data) {
      const questions = Array.isArray(data?.questions) ? data.questions : [];
      const items = [];
      let visibleIndex = 0;
      for (const q of questions) {
        const qid = String(q?.id || "").trim();
        const title = String(q?.title || "").trim();
        if (!qid || !title) continue;
        const isDivider = isStructuralQuestion(q);
        const label = isDivider ? title : `${visibleIndex + 1}. ${title}`;
        if (!isDivider) visibleIndex += 1;
        items.push({
          qid,
          label,
          isDivider,
          markerState: isDivider ? "none" : getQuestionMarkerEffectiveState(qid, q, data)
        });
      }
      return items;
    }

    function scrollToQuestionById(questionId) {
      const qid = String(questionId || "").trim();
      if (!qid) return;
      const target = [...workspaceLeft.querySelectorAll(".question[data-qid]")]
        .find((el) => String(el.dataset.qid || "") === qid);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("task-nav-target");
      setTimeout(() => {
        target.classList.remove("task-nav-target");
      }, 1300);
    }

    function renderTaskNavDrawer(data) {
      if (!taskNavDrawerList) return;
      taskNavDrawerList.innerHTML = "";
      const items = buildTaskNavigationItems(data);
      if (!items.length) {
        taskNavDrawerList.innerHTML = `<p class='status-text'>${esc(t("task.empty", "Keine Aufgaben vorhanden."))}</p>`;
        return;
      }
      for (const item of items) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "task-nav-item";
        button.dataset.qid = item.qid;
        button.dataset.markerState = item.markerState;
        const label = document.createElement("span");
        label.className = "task-nav-item-label";
        label.textContent = item.label;
        button.appendChild(label);
        if (!item.isDivider) {
          const status = document.createElement("span");
          status.className = "task-nav-item-status";
          status.dataset.markerState = item.markerState;
          status.textContent = getQuestionMarkerMeta(item.markerState).uiLabel;
          button.appendChild(status);
        }
        button.addEventListener("click", () => {
          scrollToQuestionById(item.qid);
          toggleTaskNavDrawer(false);
        });
        taskNavDrawerList.appendChild(button);
      }
    }

    function updateTaskNavDrawerToggleState(isOpen = false) {
      if (!taskNavDrawerToggleBtn) return;
      const label = isOpen
        ? t("nav.task.close", "Aufgaben Navigation schliessen")
        : t("nav.task.open", "Aufgaben Navigation öffnen");
      taskNavDrawerToggleBtn.setAttribute("aria-label", label);
      taskNavDrawerToggleBtn.title = label;
    }

    function toggleTaskNavDrawer(forceOpen) {
      if (!taskNavDrawer || !taskNavDrawerToggleBtn || !taskNavBackdrop) return;
      const currentlyOpen = !taskNavDrawer.classList.contains("hidden");
      const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !currentlyOpen;
      if (nextOpen) {
        if (typeof window.__closeCommentModeDrawer === "function") {
          window.__closeCommentModeDrawer();
        }
        toggleTrainingMenu(false);
        toggleCourseMenu(false);
        toggleScenarioMenu(false);
      }
      taskNavDrawer.classList.toggle("hidden", !nextOpen);
      taskNavBackdrop.classList.toggle("hidden", !nextOpen);
      taskNavDrawer.setAttribute("aria-hidden", String(!nextOpen));
      taskNavDrawerToggleBtn.setAttribute("aria-expanded", String(nextOpen));
      updateTaskNavDrawerToggleState(nextOpen);
    }

    async function activateLocalhostAdmin(rawKey) {
      const key = normalizeAccessKey(rawKey);
      if (!isLocalDevelopmentHost()) {
        throw new Error("Lokale Schlüsselauswahl ist nur auf localhost verfügbar.");
      }
      if (!key) {
        throw new Error("Bitte zuerst einen Schlüssel auswählen.");
      }
      await ensureAccessKeyConfigLoaded();
      await ensureAccessKeyResolved(key);
      await ensureScenarioFolderCatalogLoaded(true);
      localhostAdminSelectedKey = key;
      persistLocalhostAdminSelectedKey(key);
      const mappedFolders = resolveFoldersFromAccessKey(key);
      if (!mappedFolders.length) {
        throw new Error("Dieser Schlüssel gibt aktuell keinen Ordner frei.");
      }
      for (const folder of mappedFolders) {
        await validateScenarioFolder(folder);
      }
      setUnlockedEntries(
        mappedFolders.map((folder) => ({ key, folder })),
        mappedFolders[0] || activeScenarioFolder
      );
      await initScenarioSelector();
      await showHomeContent(mappedFolders[0]);
      refreshTrainingCatalogInBackground().catch(() => {});
    }

    async function validateScenarioFolder(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error("Ungültiger Ordnername.");
      try {
        const result = await loadScenarioManifestForFolder(safeFolder);
        if (Array.isArray(result?.items) && result.items.length) return;
        throw new Error(`Ordner "${safeFolder}" enthält keine gültigen Szenarien.`);
      } catch (err) {
        throw new Error(
          err?.message || `Ordner "${safeFolder}" konnte nicht geladen werden.`
        );
      }
    }

    async function unlockWithKey(rawKey) {
      const key = normalizeAccessKey(rawKey);
      if (!key) {
        throw new Error("Bitte einen Key eingeben.");
      }

      await ensureAccessKeyConfigLoaded();
      await ensureAccessKeyResolved(key);
      await ensureScenarioFolderCatalogLoaded(true);
      const mappedFolders = resolveFoldersFromAccessKey(key);
      if (!mappedFolders.length) {
        throw new Error("Key ungültig. Bitte erneut prüfen.");
      }

      for (const folder of mappedFolders) {
        await validateScenarioFolder(folder);
      }

      const nextEntries = [
        ...unlockedAccessEntries,
        ...mappedFolders.map((folder) => ({ key, folder }))
      ];
      setUnlockedEntries(nextEntries, mappedFolders[0] || activeScenarioFolder);
      await initScenarioSelector();
      await showHomeContent();
      refreshTrainingCatalogInBackground().catch(() => {});
    }

    function renderUnlockScreen(message) {
      setAppBarSelection("");
      toggleTrainingMenu(false);
      toggleCourseMenu(false);
      toggleScenarioMenu(false);
      setSubmitBarVisible(false);
      resetRuntimeState();
      const adminKeys = isLocalDevelopmentHost() ? getAdminEditableAccessKeys() : [];
      const selectedAdminKey = normalizeAccessKey(localhostAdminSelectedKey || loadStoredLocalhostAdminSelectedKey());
      const adminKeyOptions = adminKeys.length
        ? adminKeys
          .map((key) => {
            const rawLabel = getAccessKeyRawName(key) || key;
            const selected = key === selectedAdminKey ? " selected" : "";
            return `<option value="${esc(key)}"${selected}>${esc(rawLabel)}</option>`;
          })
          .join("")
        : "<option value=''>Keine Schlüssel gefunden</option>";
      const localhostAdminHtml = isLocalDevelopmentHost()
        ? (
          "<section class='panel localhost-admin-panel'>" +
          "<h3>Lokale Schlüsselauswahl</h3>" +
          "<p class='status-text'>Wähle einen vorhandenen Schlüssel aus. Danach siehst du lokal genau die Kursbundles, die dieser Key aktuell freigibt.</p>" +
          "<div class='unlock-form localhost-admin-form'>" +
          "<label for='localAdminKeySelect'>Schlüssel</label>" +
          `<select id="localAdminKeySelect" class="unlock-input">${adminKeyOptions}</select>` +
          "<button id='btnLocalAdminActivate' class='btn-primary' type='button'>Key lokal öffnen</button>" +
          "<p id='localAdminStatus' class='status-text'></p>" +
          "</div>" +
          "</section>"
        )
        : "";
      workspaceLeft.innerHTML =
        "<section class='panel unlock-panel'>" +
        "<h2>Kursbundle freischalten</h2>" +
        "<p class='status-text'>Bitte Key eingeben, um deine Kursbundles freizuschalten. Tickets darin werden spaeter nur ueber DoomScroll-Fortschritt geoeffnet.</p>" +
        "<div class='unlock-form'>" +
        "<label for='unlockKeyInput'>Key</label>" +
        "<input id='unlockKeyInput' class='unlock-input' type='text' autocomplete='off' placeholder='z.B. LF02_03_26' />" +
        "<button id='btnUnlockAccess' class='btn-primary' type='button'>Entsperren</button>" +
        "<p id='unlockStatus' class='status-text'></p>" +
        "</div>" +
        "</section>" +
        localhostAdminHtml;

      const input = document.getElementById("unlockKeyInput");
      const unlockButton = document.getElementById("btnUnlockAccess");
      const status = document.getElementById("unlockStatus");

      if (message) {
        status.textContent = String(message);
      } else {
        status.textContent = "Ohne gültigen Key bleiben deine Kursbundles gesperrt.";
      }

      const submitUnlock = async () => {
        const typedKey = String(input.value || "").trim();
        unlockButton.disabled = true;
        status.textContent = "Key wird geprüft ...";
        try {
          await unlockWithKey(typedKey);
        } catch (err) {
          status.textContent = err.message;
          input.focus();
          input.select();
        } finally {
          unlockButton.disabled = false;
        }
      };

      unlockButton.addEventListener("click", submitUnlock);
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          submitUnlock();
        }
      });
      input.focus();

      if (isLocalDevelopmentHost()) {
        const adminSelect = document.getElementById("localAdminKeySelect");
        const adminButton = document.getElementById("btnLocalAdminActivate");
        const adminStatus = document.getElementById("localAdminStatus");
        if (adminStatus) {
          adminStatus.textContent = localhostAdminSelectedKey
            ? t("unlock.localhost.last_selected", "Zuletzt gewählt: {label}", {
              label: getAccessKeyRawName(localhostAdminSelectedKey)
            })
            : t("unlock.localhost.only_localhost", "Nur auf localhost sichtbar.");
        }
        const submitAdmin = async () => {
          const selectedKey = normalizeAccessKey(adminSelect?.value || "");
          if (!selectedKey) {
            if (adminStatus) adminStatus.textContent = t("unlock.localhost.pick_first", "Bitte zuerst einen Schlüssel auswählen.");
            return;
          }
          if (adminButton) adminButton.disabled = true;
          if (adminStatus) adminStatus.textContent = t("unlock.localhost.preparing", "Schlüsselansicht wird vorbereitet ...");
          try {
            await activateLocalhostAdmin(selectedKey);
            if (adminStatus) {
              adminStatus.textContent = t("unlock.localhost.ready", "Bereit: {label}.", {
                label: getAccessKeyRawName(selectedKey)
              });
            }
          } catch (err) {
            if (adminStatus) adminStatus.textContent = err.message;
          } finally {
            if (adminButton) adminButton.disabled = false;
          }
        };
        adminButton?.addEventListener("click", submitAdmin);
        adminSelect?.addEventListener("change", () => {
          persistLocalhostAdminSelectedKey(adminSelect.value || "");
        });
      }
    }

    function renderSelectionHint(message) {
      const text = message || t("selection.hint.default", "Bitte waehlen Sie oben links ein Szenario aus.");
      workspaceLeft.innerHTML =
        "<section class='panel'>" +
        `<h2>${esc(t("selection.hint.title", "Szenario-Auswahl"))}</h2>` +
        `<p class='status-text'>${esc(text)}</p>` +
        "</section>";
    }

    function asStringArray(value) {
      if (!Array.isArray(value)) return [];
      return value
        .map((entry) => String(entry || "").trim())
        .filter((entry) => entry.length > 0);
    }

    function toPositiveNumberOrNull(value) {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    }

    function normalizeProgressId(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");
    }

    function uniqueStringArray(list) {
      return [...new Set((list || []).filter(Boolean))];
    }

    function asSkillItemArray(value) {
      if (!Array.isArray(value)) return [];
      return value
        .map((entry) => {
          if (typeof entry === "string") {
            const text = String(entry || "").trim();
            if (!text) return null;
            return { text, progressId: "", targetCorrect: null };
          }
          if (!entry || typeof entry !== "object") return null;
          const text = String(entry.text || entry.title || entry.label || "").trim();
          if (!text) return null;
          return {
            text,
            progressId: normalizeProgressId(entry.progressId || entry.id || entry.skillId || ""),
            targetCorrect: toPositiveNumberOrNull(entry.targetCorrect || entry.progressTarget || entry.goal)
          };
        })
        .filter(Boolean);
    }

    function createEmptySkillProgressState() {
      return {
        pointsBySkill: {},
        solvedQuestionKeys: new Set(),
        migratedScenarioIds: new Set()
      };
    }

    function getSkillProgressStorageKey(folder = "") {
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder);
      if (!safeFolder) return "";
      return `${SKILL_PROGRESS_STORAGE_KEY_PREFIX}::${safeFolder}`;
    }

    function loadSkillProgressState(folder = "") {
      const key = getSkillProgressStorageKey(folder);
      if (!key) return createEmptySkillProgressState();
      try {
        const raw = JSON.parse(localStorage.getItem(key) || "{}");
        const rawPoints = raw && typeof raw.pointsBySkill === "object" ? raw.pointsBySkill : {};
        const pointsBySkill = {};
        for (const [idRaw, value] of Object.entries(rawPoints)) {
          const id = normalizeProgressId(idRaw);
          const points = Math.max(0, Math.floor(Number(value) || 0));
          if (id && points > 0) pointsBySkill[id] = points;
        }
        const solvedSource = Array.isArray(raw?.solvedQuestionKeys) ? raw.solvedQuestionKeys : [];
        const solvedQuestionKeys = new Set(
          solvedSource
            .map((entry) => String(entry || "").trim())
            .filter(Boolean)
        );
        const migratedScenarioIds = new Set(
          (Array.isArray(raw?.migratedScenarioIds) ? raw.migratedScenarioIds : [])
            .map((entry) => normalizeScenarioRatingId(entry))
            .filter(Boolean)
        );
        return { pointsBySkill, solvedQuestionKeys, migratedScenarioIds };
      } catch {
        return createEmptySkillProgressState();
      }
    }

    function saveSkillProgressState(state, folder = "") {
      const key = getSkillProgressStorageKey(folder);
      if (!key) return;
      const payload = {
        pointsBySkill: {},
        solvedQuestionKeys: [],
        migratedScenarioIds: []
      };
      for (const [idRaw, value] of Object.entries(state?.pointsBySkill || {})) {
        const id = normalizeProgressId(idRaw);
        const points = Math.max(0, Math.floor(Number(value) || 0));
        if (id && points > 0) payload.pointsBySkill[id] = points;
      }
      payload.solvedQuestionKeys = [...(state?.solvedQuestionKeys || new Set())]
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);
      payload.migratedScenarioIds = [...(state?.migratedScenarioIds || new Set())]
        .map((entry) => normalizeScenarioRatingId(entry))
        .filter(Boolean);
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
      }
    }

    function getSkillProgressPoints(state, progressId) {
      const id = normalizeProgressId(progressId);
      if (!id) return 0;
      return Math.max(0, Math.floor(Number(state?.pointsBySkill?.[id] || 0)));
    }

    function clampPercent(value) {
      return Math.max(0, Math.min(100, Number(value) || 0));
    }

    function normalizeScenarioRatingId(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "");
    }

    function createEmptyScenarioRatingState() {
      return { byScenario: {} };
    }

    function getScenarioRatingStorageKey(folder = "") {
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder);
      if (!safeFolder) return "";
      return `${SCENARIO_RATING_STORAGE_KEY_PREFIX}::${safeFolder}`;
    }

    function loadScenarioRatingState(folder = "") {
      const key = getScenarioRatingStorageKey(folder);
      if (!key) return createEmptyScenarioRatingState();
      try {
        const raw = JSON.parse(localStorage.getItem(key) || "{}");
        const rawByScenario = raw && typeof raw.byScenario === "object" ? raw.byScenario : {};
        const byScenario = {};
        for (const [scenarioRaw, scenarioValue] of Object.entries(rawByScenario)) {
          const scenarioId = normalizeScenarioRatingId(scenarioRaw);
          if (!scenarioId || !scenarioValue || typeof scenarioValue !== "object") continue;
          const totalQuestions = Math.max(0, Math.floor(Number(scenarioValue.totalQuestions) || 0));
          const achievedScore = Math.max(0, Number(scenarioValue.achievedScore) || 0);
          const totalUnits = Math.max(0, Math.floor(Number(scenarioValue.totalUnits) || totalQuestions || 0));
          const achievedUnits = Math.max(0, Number(scenarioValue.achievedUnits) || 0);
          const percent = clampPercent(scenarioValue.percent);
          const updatedAt = Math.max(0, Math.floor(Number(scenarioValue.updatedAt) || 0));
          const skillsById = {};
          const rawSkills = scenarioValue.skillsById && typeof scenarioValue.skillsById === "object"
            ? scenarioValue.skillsById
            : {};
          const manualCreditQuestionIds = uniqueStringArray(
            (Array.isArray(scenarioValue.manualCreditQuestionIds) ? scenarioValue.manualCreditQuestionIds : [])
              .map((entry) => normalizeProgressId(entry))
              .filter(Boolean)
          );
          for (const [skillRaw, rawSkill] of Object.entries(rawSkills)) {
            const skillId = normalizeProgressId(skillRaw);
            if (!skillId || !rawSkill || typeof rawSkill !== "object") continue;
            const maxScore = Math.max(0, Number(rawSkill.maxScore) || 0);
            const score = Math.max(0, Number(rawSkill.score) || 0);
            if (maxScore <= 0) continue;
            skillsById[skillId] = {
              score: Math.min(score, maxScore),
              maxScore
            };
          }
          byScenario[scenarioId] = {
            totalQuestions,
            achievedScore,
            totalUnits,
            achievedUnits: Math.min(achievedUnits, totalUnits || achievedUnits),
            percent,
            updatedAt,
            skillsById,
            manualCreditQuestionIds
          };
        }
        return { byScenario };
      } catch {
        return createEmptyScenarioRatingState();
      }
    }

    function saveScenarioRatingState(state, folder = "") {
      const key = getScenarioRatingStorageKey(folder);
      if (!key) return;
      const payload = { byScenario: {} };
      for (const [scenarioRaw, scenarioValue] of Object.entries(state?.byScenario || {})) {
        const scenarioId = normalizeScenarioRatingId(scenarioRaw);
        if (!scenarioId || !scenarioValue || typeof scenarioValue !== "object") continue;
        const totalQuestions = Math.max(0, Math.floor(Number(scenarioValue.totalQuestions) || 0));
        const achievedScore = Math.max(0, Number(scenarioValue.achievedScore) || 0);
        const totalUnits = Math.max(0, Math.floor(Number(scenarioValue.totalUnits) || totalQuestions || 0));
        const achievedUnits = Math.max(0, Number(scenarioValue.achievedUnits) || 0);
        const percent = clampPercent(scenarioValue.percent);
        const updatedAt = Math.max(0, Math.floor(Number(scenarioValue.updatedAt) || Date.now()));
        const skillsById = {};
        const manualCreditQuestionIds = uniqueStringArray(
          (Array.isArray(scenarioValue.manualCreditQuestionIds) ? scenarioValue.manualCreditQuestionIds : [])
            .map((entry) => normalizeProgressId(entry))
            .filter(Boolean)
        );
        for (const [skillRaw, skillValue] of Object.entries(scenarioValue.skillsById || {})) {
          const skillId = normalizeProgressId(skillRaw);
          if (!skillId || !skillValue || typeof skillValue !== "object") continue;
          const maxScore = Math.max(0, Number(skillValue.maxScore) || 0);
          const score = Math.max(0, Number(skillValue.score) || 0);
          if (maxScore <= 0) continue;
          skillsById[skillId] = {
            score: Math.min(score, maxScore),
            maxScore
          };
        }
        payload.byScenario[scenarioId] = {
          totalQuestions,
          achievedScore: Math.min(achievedScore, totalQuestions || achievedScore),
          totalUnits,
          achievedUnits: Math.min(achievedUnits, totalUnits || achievedUnits),
          percent,
          updatedAt,
          skillsById,
          manualCreditQuestionIds
        };
      }
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
      }
    }

    function getResultRatingWeight(status) {
      if (status === "ok") return 1;
      if (status === "partial") return 0.5;
      return 0;
    }

    function resolveScenarioRatingId(data) {
      const fromFile = normalizeScenarioRatingId(getScenarioStorageFileKey(activeScenarioFile));
      if (fromFile) return fromFile;
      const stationId = normalizeScenarioRatingId(data?.scenario?.station?.id || data?.scenario?.id || "");
      if (stationId) return stationId;
      return "scenario";
    }

    function getScenarioProgressUnitId(question) {
      return normalizeProgressId(question?.conceptId || question?.variantId || question?.id || "");
    }

    function buildScenarioRatingSnapshot(data, results, manualCreditQuestionIds = new Set()) {
      const questions = Array.isArray(data?.questions)
        ? data.questions.filter((q) => !isStructuralQuestion(q))
        : [];
      const resultsById = new Map((results || []).map((result) => [result?.id, result]));
      const skillsById = {};
      const manualCreditSet = manualCreditQuestionIds instanceof Set
        ? manualCreditQuestionIds
        : new Set(
          (Array.isArray(manualCreditQuestionIds) ? manualCreditQuestionIds : [])
            .map((entry) => normalizeProgressId(entry))
            .filter(Boolean)
        );
      let achievedScore = 0;
      const unitsById = new Map();

      for (const q of questions) {
        const result = resultsById.get(q.id);
        const questionProgressId = normalizeProgressId(q.id);
        const unitId = getScenarioProgressUnitId(q) || questionProgressId || q.id;
        const isManualCredit = Boolean(questionProgressId && manualCreditSet.has(questionProgressId));
        const weight = isManualCredit ? 1 : getResultRatingWeight(result?.status);
        achievedScore += weight;
        let unit = unitsById.get(unitId);
        if (!unit) {
          unit = {
            id: unitId,
            weights: [],
            progressLinks: new Set()
          };
          unitsById.set(unitId, unit);
        }
        unit.weights.push(weight);
        const links = resolveQuestionProgressLinks(q, data);
        for (const linkRaw of links) {
          const link = normalizeProgressId(linkRaw);
          if (!link) continue;
          unit.progressLinks.add(link);
        }
      }

      let achievedUnits = 0;
      for (const unit of unitsById.values()) {
        const unitScore = unit.weights.length
          ? unit.weights.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0) / unit.weights.length
          : 0;
        achievedUnits += unitScore;
        for (const link of unit.progressLinks) {
          if (!skillsById[link]) skillsById[link] = { score: 0, maxScore: 0 };
          skillsById[link].score += unitScore;
          skillsById[link].maxScore += 1;
        }
      }

      const totalQuestions = questions.length;
      const totalUnits = unitsById.size;
      const percent = totalUnits > 0
        ? clampPercent((achievedUnits / totalUnits) * 100)
        : 0;
      return { totalQuestions, achievedScore, totalUnits, achievedUnits, percent, skillsById };
    }

    function applyScenarioRatingFromResults(data, results, options = {}) {
      const folder = sanitizeFolderName(activeScenarioFolder);
      if (!folder) return null;
      const scenarioId = resolveScenarioRatingId(data);
      const state = loadScenarioRatingState(folder);
      const manualCreditQuestionId = normalizeProgressId(options?.manualCreditQuestionId || "");
      const manualCreditQuestionIds = new Set(
        (Array.isArray(state.byScenario?.[scenarioId]?.manualCreditQuestionIds)
          ? state.byScenario[scenarioId].manualCreditQuestionIds
          : [])
          .map((entry) => normalizeProgressId(entry))
          .filter(Boolean)
      );
      if (manualCreditQuestionId) manualCreditQuestionIds.add(manualCreditQuestionId);
      const snapshot = buildScenarioRatingSnapshot(data, results, manualCreditQuestionIds);
      state.byScenario[scenarioId] = {
        ...snapshot,
        updatedAt: Date.now(),
        manualCreditQuestionIds: [...manualCreditQuestionIds]
      };
      saveScenarioRatingState(state, folder);
      return {
        scenarioId,
        scenarioPercent: snapshot.percent,
        totalQuestions: snapshot.totalQuestions,
        totalUnits: snapshot.totalUnits,
        manualCreditQuestionId,
        manualCreditCount: manualCreditQuestionIds.size
      };
    }

    function getScenarioManualCreditQuestionIdSet(data) {
      const folder = sanitizeFolderName(activeScenarioFolder);
      if (!folder) return new Set();
      const scenarioId = resolveScenarioRatingId(data);
      const state = loadScenarioRatingState(folder);
      return new Set(
        (Array.isArray(state.byScenario?.[scenarioId]?.manualCreditQuestionIds)
          ? state.byScenario[scenarioId].manualCreditQuestionIds
          : [])
          .map((entry) => normalizeProgressId(entry))
          .filter(Boolean)
      );
    }

    function getSkillPercentFromScenarioRatings(state, progressId) {
      if (!state || typeof state !== "object" || typeof state.byScenario !== "object") return null;
      const skillId = normalizeProgressId(progressId);
      if (!skillId) return 0;
      let scored = 0;
      let maxScore = 0;
      for (const scenarioValue of Object.values(state.byScenario || {})) {
        const skill = scenarioValue?.skillsById?.[skillId];
        if (!skill || typeof skill !== "object") continue;
        const skillMax = Math.max(0, Number(skill.maxScore) || 0);
        if (skillMax <= 0) continue;
        const skillScore = Math.max(0, Number(skill.score) || 0);
        scored += Math.min(skillScore, skillMax);
        maxScore += skillMax;
      }
      if (maxScore <= 0) return 0;
      return clampPercent((scored / maxScore) * 100);
    }

    function resolveProgressTone(percent) {
      const pct = clampPercent(percent);
      if (pct < 10) {
        return {
          name: "gray",
          start: "hsl(218 9% 56%)",
          end: "hsl(218 10% 67%)",
          glow: "hsl(218 12% 72% / 0.45)"
        };
      }
      if (pct < 20) {
        return {
          name: "red",
          start: "hsl(0 86% 60%)",
          end: "hsl(8 92% 57%)",
          glow: "hsl(0 100% 67% / 0.55)"
        };
      }
      if (pct < 50) {
        return {
          name: "orange",
          start: "hsl(26 96% 57%)",
          end: "hsl(36 100% 56%)",
          glow: "hsl(30 100% 60% / 0.55)"
        };
      }
      if (pct < 70) {
        return {
          name: "yellow",
          start: "hsl(49 100% 56%)",
          end: "hsl(58 100% 63%)",
          glow: "hsl(55 100% 63% / 0.58)"
        };
      }
      if (pct < 90) {
        return {
          name: "green",
          start: "hsl(132 78% 50%)",
          end: "hsl(150 84% 48%)",
          glow: "hsl(142 86% 56% / 0.58)"
        };
      }
      return {
        name: "violet",
        start: "hsl(274 96% 66%)",
        end: "hsl(292 92% 69%)",
        glow: "hsl(282 100% 71% / 0.58)"
      };
    }

    function getSkillProgressPercent(state, progressId, targetCorrect = DEFAULT_SKILL_TARGET_CORRECT) {
      if (state && typeof state === "object" && typeof state.byScenario === "object") {
        const scenarioPercent = getSkillPercentFromScenarioRatings(state, progressId);
        if (scenarioPercent !== null) return scenarioPercent;
      }
      const target = toPositiveNumberOrNull(targetCorrect) || DEFAULT_SKILL_TARGET_CORRECT;
      const points = getSkillProgressPoints(state, progressId);
      return clampPercent((points / target) * 100);
    }

    function resolveQuestionProgressLinks(question, data) {
      const direct = uniqueStringArray(
        (Array.isArray(question?.progressLinks) ? question.progressLinks : [])
          .map((entry) => normalizeProgressId(entry))
          .filter(Boolean)
      );
      if (direct.length) return direct;
      return uniqueStringArray(
        (Array.isArray(data?.defaultProgressLinks) ? data.defaultProgressLinks : [])
          .map((entry) => normalizeProgressId(entry))
          .filter(Boolean)
      );
    }

    function buildQuestionProgressKey(questionId, scenarioKeySource = "") {
      const filePart = normalizeProgressId(
        getScenarioStorageFileKey(scenarioKeySource || activeScenarioFile || "") || scenarioData?.scenario?.station?.id || "scenario"
      );
      const qPart = normalizeProgressId(questionId || "") || String(questionId || "q");
      return `${filePart || "scenario"}::${qPart}`;
    }

    function awardQuestionProgressToState(state, question, data, options = {}) {
      if (!question || isStructuralQuestion(question)) {
        return { gainedPoints: 0, newlySolvedCount: 0, gainedBySkill: {} };
      }
      const scenarioKeySource = String(options?.scenarioKeySource || "").trim();
      const progressUnitId = getScenarioProgressUnitId(question) || normalizeProgressId(question.id) || question.id;
      const questionKey = buildQuestionProgressKey(progressUnitId, scenarioKeySource);
      const siblingQuestions = (Array.isArray(data?.questions) ? data.questions : [])
        .filter((entry) => entry && !isStructuralQuestion(entry) && getScenarioProgressUnitId(entry) === progressUnitId);
      const hasLegacySolvedSibling = siblingQuestions.some((entry) => state.solvedQuestionKeys.has(buildQuestionProgressKey(entry.id, scenarioKeySource)));
      if (state.solvedQuestionKeys.has(questionKey) || hasLegacySolvedSibling) {
        if (hasLegacySolvedSibling) {
          state.solvedQuestionKeys.add(questionKey);
        }
        return { gainedPoints: 0, newlySolvedCount: 0, gainedBySkill: {} };
      }
      const links = resolveQuestionProgressLinks(question, data);
      if (!links.length) {
        return { gainedPoints: 0, newlySolvedCount: 0, gainedBySkill: {} };
      }
      state.solvedQuestionKeys.add(questionKey);
      const gainedBySkill = {};
      let gainedPoints = 0;
      for (const skillId of links) {
        const id = normalizeProgressId(skillId);
        if (!id) continue;
        state.pointsBySkill[id] = getSkillProgressPoints(state, id) + 1;
        gainedBySkill[id] = Math.max(0, Math.floor(Number(gainedBySkill[id] || 0))) + 1;
        gainedPoints += 1;
      }
      return {
        gainedPoints,
        newlySolvedCount: gainedPoints > 0 ? 1 : 0,
        gainedBySkill
      };
    }

    function mergeProgressUpdates(...updates) {
      const merged = { gainedPoints: 0, newlySolvedCount: 0, gainedBySkill: {} };
      for (const update of updates) {
        if (!update || typeof update !== "object") continue;
        for (const [key, value] of Object.entries(update)) {
          if (key === "gainedPoints" || key === "newlySolvedCount") continue;
          if (key === "gainedBySkill") continue;
          merged[key] = value;
        }
        merged.gainedPoints += Math.max(0, Math.floor(Number(update.gainedPoints) || 0));
        merged.newlySolvedCount += Math.max(0, Math.floor(Number(update.newlySolvedCount) || 0));
        for (const [skillRaw, value] of Object.entries(update.gainedBySkill || {})) {
          const skillId = normalizeProgressId(skillRaw);
          if (!skillId) continue;
          merged.gainedBySkill[skillId] = Math.max(0, Math.floor(Number(merged.gainedBySkill[skillId] || 0))) +
            Math.max(0, Math.floor(Number(value) || 0));
        }
      }
      return merged;
    }

    function shouldCountScenarioTowardsSkillProgress(options = {}) {
      if (typeof options?.countsTowardProgress === "boolean") {
        return options.countsTowardProgress;
      }
      return Boolean(activeScenarioCountsTowardProgress);
    }

    function applySkillProgressFromResults(data, results, options = {}) {
      const folder = sanitizeFolderName(options?.folder || activeScenarioFolder);
      if (!folder) return { gainedPoints: 0, newlySolvedCount: 0, gainedBySkill: {} };
      if (!shouldCountScenarioTowardsSkillProgress(options)) {
        return {
          gainedPoints: 0,
          newlySolvedCount: 0,
          gainedBySkill: {},
          progressSuppressed: true
        };
      }
      const state = loadSkillProgressState(folder);
      const questionsById = new Map((data?.questions || []).map((q) => [q.id, q]));
      const manualCreditQuestionId = normalizeProgressId(options?.manualCreditQuestionId || "");
      const scenarioKeySource = String(options?.scenarioKeySource || activeScenarioFile || "").trim();
      let gainedPoints = 0;
      let newlySolvedCount = 0;
      const gainedBySkill = {};

      for (const result of results || []) {
        const q = questionsById.get(result.id);
        if (!q || isStructuralQuestion(q)) continue;
        const questionProgressId = normalizeProgressId(q.id);
        const isManualCredit = Boolean(questionProgressId && manualCreditQuestionId && questionProgressId === manualCreditQuestionId);
        if (result.status !== "ok" && !isManualCredit) continue;
        const questionUpdate = awardQuestionProgressToState(state, q, data, { scenarioKeySource });
        gainedPoints += questionUpdate.gainedPoints;
        newlySolvedCount += questionUpdate.newlySolvedCount;
        for (const [skillRaw, value] of Object.entries(questionUpdate.gainedBySkill || {})) {
          const skillId = normalizeProgressId(skillRaw);
          if (!skillId) continue;
          gainedBySkill[skillId] = Math.max(0, Math.floor(Number(gainedBySkill[skillId] || 0))) +
            Math.max(0, Math.floor(Number(value) || 0));
        }
      }

      if (newlySolvedCount > 0) {
        saveSkillProgressState(state, folder);
      }

      return { gainedPoints, newlySolvedCount, gainedBySkill };
    }

    async function ensureLegacySkillProgressMigration(folder = "") {
      const safeFolder = sanitizeFolderName(folder || activeHomeSkillsFolder || activeScenarioFolder);
      if (!safeFolder) return { migratedScenarioCount: 0, gainedPoints: 0 };
      const ratingState = loadScenarioRatingState(safeFolder);
      const scenarioEntries = Object.entries(ratingState.byScenario || {});
      if (!scenarioEntries.length) return { migratedScenarioCount: 0, gainedPoints: 0 };
      let progressEnabledFiles = null;
      try {
        const manifest = await loadScenarioManifestForFolder(safeFolder);
        progressEnabledFiles = new Map(
          (manifest?.items || [])
            .filter((item) => item?.countsTowardProgress)
            .map((item) => [
              normalizeScenarioRatingId(getScenarioStorageFileKey(item.file)),
              String(item.file || "").trim()
            ])
            .filter(([scenarioId, filePath]) => scenarioId && filePath)
        );
      } catch {
      }

      const skillState = loadSkillProgressState(safeFolder);
      let migratedScenarioCount = 0;
      let gainedPoints = 0;
      let shouldSave = false;

      for (const [scenarioRaw, scenarioValue] of scenarioEntries) {
        const scenarioId = normalizeScenarioRatingId(scenarioRaw);
        if (!scenarioId || skillState.migratedScenarioIds.has(scenarioId)) continue;
        if (!scenarioValue || clampPercent(scenarioValue.percent) < 100) continue;

        if (!matchesScenarioNamingConvention(scenarioId)) continue;
        if (progressEnabledFiles && !progressEnabledFiles.has(scenarioId)) continue;
        const scenarioFilePath = progressEnabledFiles?.get(scenarioId) || scenarioId;
        let data = null;
        try {
          data = await loadScenarioJsonByPath(scenarioFilePath, safeFolder);
        } catch {
          continue;
        }
        for (const question of data?.questions || []) {
          if (!question || isStructuralQuestion(question)) continue;
          const questionUpdate = awardQuestionProgressToState(skillState, question, data, {
            scenarioKeySource: scenarioFilePath
          });
          if (questionUpdate.gainedPoints > 0) {
            gainedPoints += questionUpdate.gainedPoints;
            shouldSave = true;
          }
        }
        skillState.migratedScenarioIds.add(scenarioId);
        migratedScenarioCount += 1;
        shouldSave = true;
      }

      if (shouldSave) saveSkillProgressState(skillState, safeFolder);
      return { migratedScenarioCount, gainedPoints };
    }

    function persistEvaluationProgress(data, results, options = {}) {
      const scenarioProgressUpdate = applyScenarioRatingFromResults(data, results, options);
      const skillProgressUpdate = applySkillProgressFromResults(data, results, options);
      const merged = mergeProgressUpdates(scenarioProgressUpdate, skillProgressUpdate);
      const folder = sanitizeFolderName(options?.folder || activeScenarioFolder);
      const scenarioId = normalizeScenarioRatingId(scenarioProgressUpdate?.scenarioId || "");
      if (
        folder &&
        scenarioId &&
        shouldCountScenarioTowardsSkillProgress(options) &&
        clampPercent(scenarioProgressUpdate?.scenarioPercent) >= 100
      ) {
        const skillState = loadSkillProgressState(folder);
        if (!skillState.migratedScenarioIds.has(scenarioId)) {
          skillState.migratedScenarioIds.add(scenarioId);
          saveSkillProgressState(skillState, folder);
        }
      }
      return merged;
    }

    function renderProgressMeter(baseClass, percent, ariaLabel) {
      const pct = clampPercent(percent);
      const label = String(ariaLabel || `Fortschritt ${Math.round(pct)} Prozent`);
      const tone = resolveProgressTone(pct);
      return (
        `<span class="${baseClass}" role="img" aria-label="${esc(label)}" data-progress-tone="${tone.name}" style="--progress-color-start:${tone.start};--progress-color-end:${tone.end};--progress-glow:${tone.glow};">` +
        `<span class="${baseClass}-fill" style="--progress-pct:${pct.toFixed(2)}%;"></span>` +
        "</span>"
      );
    }

    function renderList(items, className = "home-list", options = {}) {
      const list = asSkillItemArray(items);
      if (!list.length) return "<p class='status-text'>Keine Einträge vorhanden.</p>";
      const cfg = options && typeof options === "object" ? options : {};
      const showProgress = cfg.showProgress !== false;
      const progressState = cfg.progressState || createEmptySkillProgressState();
      const defaultProgressPercent = clampPercent(cfg.defaultProgressPercent || 0);
      const defaultTargetCorrect = toPositiveNumberOrNull(cfg.defaultTargetCorrect) || DEFAULT_SKILL_TARGET_CORRECT;

      return (
        `<ul class="${className}">` +
        list.map((entry) => {
          const text = entry.text;
          let progressPercent = defaultProgressPercent;
          if (showProgress && entry.progressId) {
            progressPercent = getSkillProgressPercent(
              progressState,
              entry.progressId,
              entry.targetCorrect || defaultTargetCorrect
            );
          }
          const progressValueText = `${Math.round(progressPercent)}%`;
          const progressHtml = showProgress
            ? (
              "<span class='home-list-progress-wrap'>" +
              renderProgressMeter("home-list-progress", progressPercent, `${text}: ${Math.round(progressPercent)} Prozent`) +
              `<span class='home-list-progress-value' aria-hidden='true'>${progressValueText}</span>` +
              "</span>"
            )
            : "";
          return (
            "<li class='home-list-item'>" +
            `<span class='home-list-text'>${esc(text)}</span>` +
            progressHtml +
            "</li>"
          );
        }).join("") +
        "</ul>"
      );
    }

    function renderParagraphs(paragraphs, className = "status-text") {
      const list = asStringArray(paragraphs);
      if (!list.length) return "";
      return list.map((text) => `<p class="${className}">${esc(text)}</p>`).join("");
    }

    function resolveDrawerProgressMeta(section, subsection, subsectionIndex, payload) {
      const explicitId = normalizeProgressId(subsection?.progressId || subsection?.id || subsection?.skillId || "");
      const fallbackId = normalizeProgressId(
        `${section?.title || "bereich"}_${subsection?.title || `punkt_${subsectionIndex + 1}`}`
      );
      const defaultTarget = toPositiveNumberOrNull(payload?.progressDefaults?.targetCorrect) || DEFAULT_SKILL_TARGET_CORRECT;
      const targetCorrect = toPositiveNumberOrNull(subsection?.targetCorrect || subsection?.progressTarget) || defaultTarget;
      return {
        id: explicitId || fallbackId || `skill_${subsectionIndex + 1}`,
        targetCorrect
      };
    }

    function renderHomeDrawer(drawer, context = {}) {
      const title = String(drawer.title || "Unterpunkt");
      const intro = renderParagraphs(drawer.intro, "status-text");
      const notes = renderParagraphs(drawer.notes, "status-text");
      const progressPercent = clampPercent(drawer.progressPercent || 0);
      const progressValueText = `${Math.round(progressPercent)}%`;
      const itemsHtml = renderList(drawer.items, "home-list", {
        showProgress: true,
        defaultProgressPercent: progressPercent,
        progressState: context.progressState,
        defaultTargetCorrect: drawer.targetCorrect
      });

      return (
        `<details class='panel home-drawer' data-progress-id='${esc(drawer.progressId || "")}'>` +
        "<summary class='home-drawer-summary'>" +
        `<span class='home-drawer-title'>${esc(title)}</span>` +
        "<span class='home-drawer-progress-wrap'>" +
        renderProgressMeter("home-drawer-progress", progressPercent, `${title}: ${progressValueText}`) +
        `<span class='home-drawer-progress-value' aria-hidden='true'>${progressValueText}</span>` +
        "</span>" +
        "</summary>" +
        "<div class='home-drawer-content'>" +
        intro +
        itemsHtml +
        notes +
        "</div>" +
        "</details>"
      );
    }

    function normalizeHomeSections(payload) {
      const sections = Array.isArray(payload.sections)
        ? payload.sections.filter((entry) => entry && typeof entry === "object")
        : [];
      if (sections.length) {
        return sections.filter((section) => !isHiddenHomeSectionTitle(section.title));
      }

      const categories = Array.isArray(payload.categories)
        ? payload.categories.filter((entry) => entry && typeof entry === "object")
        : [];
      if (!categories.length) return [];

      return [
        {
          title: t("home.section.possible_tasks", "Moegliche Aufgaben im Betrieb"),
          subsections: categories.map((category) => ({
            title: String(category.title || t("home.section.subsection_fallback", "Unterpunkt")),
            items: Array.isArray(category.skills) ? category.skills : []
          }))
        }
      ];
    }

    function extractSkillProgressIdsFromPayload(payload) {
      const ids = new Set();
      const sections = normalizeHomeSections(payload);
      sections.forEach((section) => {
        const subsections = Array.isArray(section?.subsections)
          ? section.subsections.filter((entry) => entry && typeof entry === "object")
          : [];
        subsections.forEach((subsection, subsectionIndex) => {
          const meta = resolveDrawerProgressMeta(section, subsection, subsectionIndex, payload);
          const progressId = normalizeProgressId(meta?.id || "");
          if (progressId) ids.add(progressId);
        });
      });
      return ids;
    }

    function collectUnknownScenarioProgressLinks(data, skillPayload) {
      const knownIds = extractSkillProgressIdsFromPayload(skillPayload);
      const unknown = [];
      const seen = new Set();
      (Array.isArray(data?.questions) ? data.questions : []).forEach((question) => {
        if (!question || isStructuralQuestion(question)) return;
        resolveQuestionProgressLinks(question, data).forEach((linkRaw) => {
          const progressId = normalizeProgressId(linkRaw);
          if (!progressId || knownIds.has(progressId)) return;
          const key = `${normalizeProgressId(question.id)}::${progressId}`;
          if (seen.has(key)) return;
          seen.add(key);
          unknown.push({
            questionId: String(question.id || "").trim(),
            questionTitle: String(question.title || question.id || t("home.section.question_fallback", "Frage")).trim(),
            progressId
          });
        });
      });
      return unknown;
    }

    async function validateScenarioProgressBindings(data, folder = "", scenarioFile = "") {
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder);
      if (!safeFolder || !data) return { ok: true, unknown: [] };
      try {
        const skillPayload = await loadHomeSkillsData(safeFolder);
        const unknown = collectUnknownScenarioProgressLinks(data, skillPayload);
        if (unknown.length) {
          console.warn(
            `[Progress] ${safeFolder}/${scenarioFile || activeScenarioFile || "scenario"} referenziert unbekannte Skill-IDs:`,
            unknown
          );
        }
        return {
          ok: unknown.length === 0,
          unknown
        };
      } catch (error) {
        console.warn(`[Progress] Skillset-Validierung für ${safeFolder} konnte nicht geladen werden.`, error);
        return {
          ok: false,
          unknown: [],
          error: error instanceof Error ? error.message : String(error || t("fallback.unknown_error", "Unbekannter Fehler"))
        };
      }
    }

    function renderHomeSection(section, context = {}) {
      const payload = context.payload || {};
      const progressState = context.progressState || createEmptySkillProgressState();
      const drawerPercents = Array.isArray(context.drawerPercents) ? context.drawerPercents : [];
      const title = String(section.title || t("home.section.title_fallback", "Abschnitt"));
      if (isHiddenHomeSectionTitle(title)) return "";
      const hideTitle = isPossibleTasksHomeSectionTitle(title);
      const titleHtml = hideTitle ? "" : `<h3 class='home-section-title'>${esc(title)}</h3>`;
      const introHtml = renderParagraphs(section.intro, "status-text");
      const notesHtml = renderParagraphs(section.notes, "status-text");
      const subsections = Array.isArray(section.subsections)
        ? section.subsections.filter((entry) => entry && typeof entry === "object")
        : [];

      if (subsections.length) {
        const drawerList = subsections
          .map((sub, subIdx) => {
            const progressMeta = resolveDrawerProgressMeta(section, sub, subIdx, payload);
            const progressPercent = getSkillProgressPercent(
              progressState,
              progressMeta.id,
              progressMeta.targetCorrect
            );
            drawerPercents.push(progressPercent);
            return renderHomeDrawer({
              title: String(sub.title || "Unterpunkt"),
              intro: Array.isArray(sub.intro) ? sub.intro : [],
              items: Array.isArray(sub.items) ? sub.items : [],
              notes: Array.isArray(sub.notes) ? sub.notes : [],
              progressId: progressMeta.id,
              progressPercent,
              targetCorrect: progressMeta.targetCorrect
            }, context);
          })
          .join("");

        return (
          "<section class='panel home-section'>" +
          titleHtml +
          introHtml +
          `<div class='home-drawer-list'>${drawerList}</div>` +
          notesHtml +
          "</section>"
        );
      }

      const itemsHtml = renderList(section.items, "home-list", { showProgress: false });
      return (
        "<section class='panel home-section'>" +
        titleHtml +
        introHtml +
        itemsHtml +
        notesHtml +
        "</section>"
      );
    }

    function renderHomeFolderSubAppBar(folders, activeFolder) {
      const availableFolders = Array.isArray(folders) ? folders : [];
      if (!availableFolders.length) return "";
      const options = availableFolders
        .map((folder) => {
          const safeFolder = sanitizeFolderName(folder);
          const isActive = safeFolder === activeFolder;
          const label = getFolderShortcutLabel(safeFolder) || safeFolder;
          return (
            `<button type="button" class="home-subappbar-button${isActive ? " is-active" : ""}"` +
            ` data-home-folder="${esc(safeFolder)}" title="${esc(safeFolder)}"` +
            ` aria-label="Skillset ${esc(label)} anzeigen"` +
            ` aria-pressed="${isActive ? "true" : "false"}">${esc(label)}</button>`
          );
        })
        .join("");

      return (
        "<section class='panel home-subappbar'>" +
        "<div class='home-subappbar-row' role='tablist' aria-label='possible_skills Auswahl'>" +
        options +
        "</div>" +
        "</section>"
      );
    }

    function bindHomeFolderSubAppBar() {
      const buttons = workspaceLeft.querySelectorAll(".home-subappbar-button[data-home-folder]");
      for (const button of buttons) {
        button.addEventListener("click", () => {
          const nextFolder = sanitizeFolderName(button.dataset.homeFolder || "");
          if (!nextFolder || nextFolder === activeHomeSkillsFolder) return;
          showHomeContent(nextFolder);
        });
      }
    }

    function renderHomeContent(data, context = {}) {
      const payload = data && typeof data === "object" ? data : {};
      const selectedFolder = sanitizeFolderName(context.homeFolder || activeHomeSkillsFolder || activeScenarioFolder);
      const availableFolders = Array.isArray(context.availableFolders) ? context.availableFolders : getUnlockedFolders();
      const sections = normalizeHomeSections(payload);
      const progressState = loadSkillProgressState(selectedFolder);
      const drawerPercents = [];
      const sectionsHtml = sections
        .map((section) => renderHomeSection(section, { payload, progressState, drawerPercents }))
        .join("");
      const overallProgress = drawerPercents.length
        ? drawerPercents.reduce((sum, val) => sum + val, 0) / drawerPercents.length
        : 0;
      const overallText = `${Math.round(overallProgress)}%`;
      const shortLabel = getFolderShortcutLabel(selectedFolder) || selectedFolder;
      const overallLabel = t("home.progress.overall", "Gesamtfortschritt: {percent}", { percent: overallText });
      const overallAria = t("home.progress.overall_aria", "Gesamtfortschritt {percent}", { percent: overallText });

      workspaceLeft.innerHTML =
        renderHomeFolderSubAppBar(availableFolders, selectedFolder) +
        renderLocalhostChallengePreviewPanel() +
        "<section class='panel home-skillset-banner'>" +
        `<h2>Skillset ${esc(shortLabel)}</h2>` +
        `<p class='status-text'>${esc(overallLabel)}</p>` +
        `<div class='home-banner-progress-line'>${renderProgressMeter("home-drawer-progress", overallProgress, overallAria)}</div>` +
        "</section>" +
        `<section class="home-layout">${sectionsHtml}</section>`;

      bindHomeFolderSubAppBar();
      bindLocalhostChallengePreviewPanel();
    }

    async function loadHomeSkillsData(folder = "") {
      const safeFolder = sanitizeFolderName(folder || activeHomeSkillsFolder || activeScenarioFolder);
      if (!safeFolder) {
        throw new Error("Kein Skillset-Ordner ausgewählt.");
      }
      if (homeSkillsCache[safeFolder] !== undefined) return homeSkillsCache[safeFolder];
      const basePath = getScenarioBasePath(safeFolder);
      const skillCandidates = buildLocalizedResourcePaths("possible_skills.json", getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(skillCandidates, { cache: "no-store" });
      if (!res) throw new Error(`${safeFolder}/possible_skills.json konnte nicht geladen werden (HTTP 404)`);
      if (!res.ok) throw new Error(`${safeFolder}/possible_skills.json konnte nicht geladen werden (HTTP ${res.status})`);
      const data = await res.json();
      if (!data || typeof data !== "object") {
        throw new Error(`${safeFolder}/possible_skills.json hat kein gültiges JSON-Objekt.`);
      }
      homeSkillsCache[safeFolder] = data;
      return homeSkillsCache[safeFolder];
    }

    async function showHomeContent(folderHint = "") {
      if (!hasUnlockedAccess()) {
        renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
        return;
      }
      setAppBarSelection("home");
      const folders = getUnlockedFolders();
      const hint = sanitizeFolderName(folderHint);
      if (hint && folders.includes(hint)) {
        activeHomeSkillsFolder = hint;
      } else if (!folders.includes(activeHomeSkillsFolder)) {
        if (folders.includes(activeScenarioFolder)) {
          activeHomeSkillsFolder = activeScenarioFolder;
        } else {
          activeHomeSkillsFolder = folders[0] || "";
        }
      }
      try {
        localStorage.setItem(HOME_SKILLS_FOLDER_STORAGE_KEY, activeHomeSkillsFolder);
      } catch {
      }
      if (!isDesktopActivityLayout()) {
        toggleTrainingMenu(false);
        toggleCourseMenu(false);
        toggleScenarioMenu(false);
      }
      setSubmitBarVisible(false);
      resetRuntimeState();
      const loadingLabel = getFolderShortcutLabel(activeHomeSkillsFolder);
      const loadingSuffix = loadingLabel ? ` (${loadingLabel})` : "";
      workspaceLeft.innerHTML =
        "<section class='panel'><h2>FI Skilltrainer</h2>" +
        `<p class='status-text'>${esc(t("home.loading", "Skills werden geladen{suffix} ...", { suffix: loadingSuffix }))}</p></section>`;
      try {
        const data = await loadHomeSkillsData(activeHomeSkillsFolder);
        await ensureLegacySkillProgressMigration(activeHomeSkillsFolder);
        renderHomeContent(data, {
          homeFolder: activeHomeSkillsFolder,
          availableFolders: folders
        });
        queueCommentModeContextBroadcast();
      } catch (err) {
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          "<h2>FI Skilltrainer</h2>" +
          `<p class='status-text'>${esc(err.message)}</p>` +
          "</section>";
        queueCommentModeContextBroadcast();
      }
    }

    async function toggleTrainingMenu(forceOpen) {
      if (!trainingMenu || !trainingMenuButton || !trainingNavBackdrop) return;
      const currentlyOpen = trainingMenu.classList.contains("is-open");
      const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !currentlyOpen;
      if (nextOpen) {
        if (typeof window.__closeCommentModeDrawer === "function") {
          window.__closeCommentModeDrawer();
        }
        toggleCourseMenu(false);
        toggleScenarioMenu(false);
        toggleTaskNavDrawer(false);
        const restoredFromCache = primeTrainingMenuFromCache();
        if (!restoredFromCache) {
          trainingMenuOptions.innerHTML = `<p class='status-text scenario-tree-empty'>${esc(t("training.loading", "Training wird geladen ..."))}</p>`;
          const decks = await ensureTrainingDeckCatalogLoaded(false).catch(() => []);
          renderTrainingMenu(decks);
        }
        if (hasUnlockedAccess()) {
          refreshTrainingCatalogInBackground().catch(() => {});
        }
      }
      window.clearTimeout(trainingMenuCloseTimer);
      if (nextOpen) {
        trainingMenu.classList.remove("hidden");
        trainingNavBackdrop.classList.remove("hidden");
        window.requestAnimationFrame(() => {
          trainingMenu.classList.add("is-open");
          trainingNavBackdrop.classList.add("is-open");
        });
      } else {
        trainingMenu.classList.remove("is-open");
        trainingNavBackdrop.classList.remove("is-open");
        trainingMenuCloseTimer = window.setTimeout(() => {
          if (trainingMenu.classList.contains("is-open")) return;
          trainingMenu.classList.add("hidden");
          trainingNavBackdrop.classList.add("hidden");
        }, 220);
      }
      trainingMenu.setAttribute("aria-hidden", String(!nextOpen));
      trainingMenuButton.setAttribute("aria-expanded", String(nextOpen));
      updateTrainingMenuButtonState(nextOpen);
      syncIdeWorkspaceLayout(nextOpen ? "training" : getOpenActivityPanelKey());
    }

    async function toggleCourseMenu(forceOpen) {
      if (!courseMenu || !courseMenuButton || !courseNavBackdrop) return;
      const currentlyOpen = courseMenu.classList.contains("is-open");
      const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !currentlyOpen;
      if (nextOpen) {
        if (typeof window.__closeCommentModeDrawer === "function") {
          window.__closeCommentModeDrawer();
        }
        toggleTrainingMenu(false);
        toggleScenarioMenu(false);
        toggleTaskNavDrawer(false);
        if (!availableScenarios.length) {
          const restoredFromCache = primeScenarioMenuFromCache();
          if (!restoredFromCache && hasUnlockedAccess()) {
            warmScenarioTreeFromKnownState().catch(() => {});
          }
        }
        renderCourseMenu(availableScenarios);
        if (hasUnlockedAccess()) {
          refreshScenarioTreeInBackground().catch(() => {});
        }
      }
      window.clearTimeout(courseMenuCloseTimer);
      if (nextOpen) {
        courseMenu.classList.remove("hidden");
        courseNavBackdrop.classList.remove("hidden");
        window.requestAnimationFrame(() => {
          courseMenu.classList.add("is-open");
          courseNavBackdrop.classList.add("is-open");
        });
      } else {
        courseMenu.classList.remove("is-open");
        courseNavBackdrop.classList.remove("is-open");
        courseMenuCloseTimer = window.setTimeout(() => {
          if (courseMenu.classList.contains("is-open")) return;
          courseMenu.classList.add("hidden");
          courseNavBackdrop.classList.add("hidden");
        }, 220);
      }
      courseMenu.setAttribute("aria-hidden", String(!nextOpen));
      courseMenuButton.setAttribute("aria-expanded", String(nextOpen));
      updateCourseMenuButtonState(nextOpen);
      syncIdeWorkspaceLayout(nextOpen ? "course" : getOpenActivityPanelKey());
    }

    async function toggleScenarioMenu(forceOpen) {
      if (!scenarioMenu || !scenarioMenuButton || !scenarioNavBackdrop) return;
      const currentlyOpen = scenarioMenu.classList.contains("is-open");
      const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !currentlyOpen;
      if (nextOpen) {
        if (typeof window.__closeCommentModeDrawer === "function") {
          window.__closeCommentModeDrawer();
        }
        toggleTrainingMenu(false);
        toggleCourseMenu(false);
        toggleTaskNavDrawer(false);
        if (!availableScenarios.length) {
          const restoredFromCache = primeScenarioMenuFromCache();
          if (!restoredFromCache && hasUnlockedAccess()) {
            warmScenarioTreeFromKnownState().catch(() => {});
          }
        }
        renderScenarioMenu(availableScenarios);
        if (hasUnlockedAccess()) {
          const activeGroup = getActiveScenarioGroup(availableScenarios);
          if (activeGroup) {
            ensureCourseUnlockSummaryLoaded(activeGroup.folder, activeGroup.items).then(() => {
              updateScenarioUnlockUi(activeGroup.folder);
            }).catch(() => {});
          }
          refreshScenarioTreeInBackground().catch(() => {});
        }
      }
      window.clearTimeout(scenarioMenuCloseTimer);
      if (nextOpen) {
        scenarioMenu.classList.remove("hidden");
        scenarioNavBackdrop.classList.remove("hidden");
        window.requestAnimationFrame(() => {
          scenarioMenu.classList.add("is-open");
          scenarioNavBackdrop.classList.add("is-open");
        });
      } else {
        scenarioMenu.classList.remove("is-open");
        scenarioNavBackdrop.classList.remove("is-open");
        scenarioMenuCloseTimer = window.setTimeout(() => {
          if (scenarioMenu.classList.contains("is-open")) return;
          scenarioMenu.classList.add("hidden");
          scenarioNavBackdrop.classList.add("hidden");
        }, 220);
      }
      scenarioMenu.setAttribute("aria-hidden", String(!nextOpen));
      scenarioMenuButton.setAttribute("aria-expanded", String(nextOpen));
      updateScenarioMenuButtonState(nextOpen);
      syncIdeWorkspaceLayout(nextOpen ? "scenario" : getOpenActivityPanelKey());
    }

    function getActiveScenarioMenuLabel() {
      for (const group of availableScenarios || []) {
        if (sanitizeFolderName(group?.folder) !== sanitizeFolderName(activeScenarioFolder)) continue;
        for (const item of group?.items || []) {
          if (String(item?.file || "").trim() === String(activeScenarioFile || "").trim()) {
            return String(item.label || "").trim();
          }
        }
      }
      if (activeScenarioFile) {
        return normalizeScenarioItemFormat("", activeScenarioFile) === "markdown"
          ? buildScenarioLabelFromPath(activeScenarioFile)
          : buildScenarioLabelFromFilename(activeScenarioFile.split("/").pop() || activeScenarioFile);
      }
      return "";
    }

    function updateScenarioMenuButtonState(isOpen = false) {
      if (!scenarioMenuButton) return;
      const badgeCount = Math.max(0, Math.floor(Number(updateScenarioMenuBadgeUi()) || 0));
      if (isOpen) {
        const closeLabel = t("nav.scenario.close", "Posteingang schliessen");
        const closeLabelWithBadge = badgeCount > 0
          ? t("nav.scenario.close_with_badge", "Posteingang schliessen. {count} neue Tickets.", {
            count: badgeCount
          })
          : closeLabel;
        scenarioMenuButton.setAttribute("aria-label", closeLabelWithBadge);
        scenarioMenuButton.dataset.appbarTooltip = t("appbar.tooltip.scenario", "Posteingang");
        scenarioMenuButton.removeAttribute("title");
        return;
      }
      const activeLabel = getActiveScenarioMenuLabel();
      const courseLabel = getActiveCourseMenuLabel();
      const baseLabel = activeLabel
        ? t("nav.scenario.open_course_current", "Posteingang öffnen (Kurs: {course}, aktuell: {label})", {
          course: courseLabel || t("fallback.unknown", "unbekannt"),
          label: activeLabel
        })
        : courseLabel
          ? t("nav.scenario.open_course", "Posteingang öffnen (Kurs: {course})", { course: courseLabel })
          : t("nav.scenario.open", "Posteingang öffnen");
      const labelWithBadge = badgeCount > 0
        ? t("nav.scenario.open_with_badge", "{base}. {count} neue Tickets.", {
          base: baseLabel,
          count: badgeCount
        })
        : baseLabel;
      scenarioMenuButton.setAttribute("aria-label", labelWithBadge);
      scenarioMenuButton.dataset.appbarTooltip = t("appbar.tooltip.scenario", "Posteingang");
      scenarioMenuButton.removeAttribute("title");
    }

    function normalizeScenarioItemFormat(value, fileName = "") {
      const explicit = String(value || "").trim().toLowerCase();
      if (explicit === "markdown" || explicit === "md") return "markdown";
      if (explicit === "quiz" || explicit === "json") return "quiz";
      return /\.md$/i.test(String(fileName || "").trim()) ? "markdown" : "quiz";
    }

    function normalizeScenarioResourcePath(rawPath) {
      const value = String(rawPath || "").trim().replace(/\\/g, "/");
      if (!value || value.startsWith("/") || value.includes("..")) return "";
      const parts = value.split("/").map((part) => String(part || "").trim()).filter(Boolean);
      if (!parts.length) return "";
      if (parts.some((part) => !/^[A-Za-z0-9._-]+$/.test(part))) return "";
      return parts.join("/");
    }

    function assertScenarioResourcePath(rawPath, allowedExtensions = [".json"]) {
      const value = normalizeScenarioResourcePath(rawPath);
      if (!value) {
        throw new Error("Ungültiger Pfad im Manifest: " + rawPath);
      }
      const lowerValue = value.toLowerCase();
      if (Array.isArray(allowedExtensions) && allowedExtensions.length) {
        const allowed = allowedExtensions.map((entry) => String(entry || "").trim().toLowerCase()).filter(Boolean);
        if (allowed.length && !allowed.some((ext) => lowerValue.endsWith(ext))) {
          throw new Error("Ungültiger Dateityp im Manifest: " + rawPath);
        }
      }
      return value;
    }

    function buildScenarioLabelFromSlug(rawValue) {
      const source = String(rawValue || "").trim().replace(/\.[^.]+$/i, "");
      if (!source) return "Ticket";
      const parts = source.split("_").filter(Boolean);
      const ticketPart = parts[0] || "";
      const words = parts.slice(1).map((part) => {
        const lower = String(part || "").toLowerCase();
        return lower ? lower.charAt(0).toUpperCase() + lower.slice(1) : "";
      }).filter(Boolean);
      const prefix = /^\d{2}$/.test(ticketPart) ? `Ticket ${ticketPart}` : "Ticket";
      return words.length ? `${prefix} - ${words.join(" ")}` : prefix;
    }

    function buildScenarioLabelFromPath(filePath) {
      const path = normalizeScenarioResourcePath(filePath);
      if (!path) return "Ticket";
      const fileName = getScenarioResourceBasename(path);
      if (matchesScenarioNamingConvention(fileName)) {
        return buildScenarioLabelFromFilename(fileName);
      }
      const parts = path.split("/");
      const base = parts.length > 1 ? parts[parts.length - 2] : fileName;
      return buildScenarioLabelFromSlug(base);
    }

    function normalizeStoredScenarioMenuItem(rawItem, folderHint = "") {
      if (!rawItem || typeof rawItem !== "object") return null;
      const folder = sanitizeFolderName(rawItem.folder || folderHint);
      const file = normalizeScenarioResourcePath(rawItem.file || "");
      if (!folder || !file) return null;
      const format = normalizeScenarioItemFormat(rawItem.format || "", file);
      return {
        file,
        label: String(
          rawItem.label ||
          (format === "markdown"
            ? buildScenarioLabelFromPath(file)
            : buildScenarioLabelFromFilename(file.split("/").pop() || file))
        ).trim() || "Ticket",
        folder,
        countsTowardProgress: typeof rawItem.countsTowardProgress === "boolean" ? rawItem.countsTowardProgress : format !== "markdown",
        format
      };
    }

    function normalizeStoredScenarioMenuGroups(payload) {
      if (!Array.isArray(payload)) return [];
      return payload
        .map((rawGroup) => {
          const folder = sanitizeFolderName(rawGroup?.folder || "");
          if (!folder) return null;
          const items = Array.isArray(rawGroup?.items)
            ? rawGroup.items
              .map((entry) => normalizeStoredScenarioMenuItem(entry, folder))
              .filter(Boolean)
            : [];
          const sync = rawGroup?.sync && typeof rawGroup.sync === "object"
            ? {
              folder,
              manifestCount: Math.max(0, Number(rawGroup.sync.manifestCount) || 0),
              liveCount: Math.max(0, Number(rawGroup.sync.liveCount) || 0),
              repoCompared: Boolean(rawGroup.sync.repoCompared),
              repoOnlyCount: Math.max(0, Number(rawGroup.sync.repoOnlyCount) || 0),
              knownOnlyCount: Math.max(0, Number(rawGroup.sync.knownOnlyCount) || 0),
              manifestError: String(rawGroup.sync.manifestError || "")
            }
            : null;
          const error = rawGroup?.error ? String(rawGroup.error) : "";
          return { folder, items, sync, error };
        })
        .filter(Boolean)
        .sort((a, b) => a.folder.localeCompare(b.folder, "de", { numeric: true, sensitivity: "base" }));
    }

    function getCachedScenarioGroupsForCurrentView() {
      if (!hasUnlockedAccess()) return [];
      const cachedGroups = normalizeStoredScenarioMenuGroups(cachedScenarioMenuGroups);
      const unlockedFolderSet = new Set(getUnlockedFolders());
      return cachedGroups
        .filter((group) => unlockedFolderSet.has(group.folder))
        .map((group) => ({
          ...group,
          items: filterScenarioItemsForEntries(group.items, group.folder)
        }))
        .filter((group) => group.error || group.items.length);
    }

    function primeScenarioMenuFromCache() {
      const groups = getCachedScenarioGroupsForCurrentView();
      if (!groups.length) return false;
      availableScenarios = groups;
      renderScenarioNavigation(groups);
      return true;
    }

    function primeTrainingMenuFromCache() {
      const decks = getVisibleTrainingDecks();
      if (!decks.length) return false;
      renderTrainingMenu(decks);
      return true;
    }

    async function warmScenarioTreeFromKnownState() {
      if (!hasUnlockedAccess()) return null;
      if (scenarioTreeWarmupPromise) return scenarioTreeWarmupPromise;
      scenarioTreeWarmupPromise = initScenarioSelector({ skipCatalogRefresh: true })
        .catch(() => {
        })
        .finally(() => {
          scenarioTreeWarmupPromise = null;
        });
      return scenarioTreeWarmupPromise;
    }

    async function refreshScenarioTreeInBackground() {
      if (scenarioTreeRefreshPromise) return scenarioTreeRefreshPromise;
      scenarioTreeRefreshPromise = (async () => {
        if (scenarioTreeWarmupPromise) {
          await scenarioTreeWarmupPromise;
        }
        await ensureScenarioFolderCatalogLoaded(true);
        const accessChanged = refreshUnlockedEntriesFromCatalog();
        if (hasUnlockedAccess()) {
          await initScenarioSelector({
            skipCatalogRefresh: true
          });
          if (accessChanged && workspaceLeft.querySelector(".home-layout")) {
            await showHomeContent(activeHomeSkillsFolder || activeScenarioFolder);
          }
        } else {
          renderScenarioNavigation([]);
        }
      })().catch(() => {
      }).finally(() => {
        scenarioTreeRefreshPromise = null;
      });
      return scenarioTreeRefreshPromise;
    }

    async function refreshTrainingCatalogInBackground() {
      if (trainingDeckCatalogRefreshPromise) return trainingDeckCatalogRefreshPromise;
      trainingDeckCatalogRefreshPromise = (async () => {
        const decks = await ensureTrainingDeckCatalogLoaded(true);
        if (trainingMenu.classList.contains("is-open")) {
          renderTrainingMenu(decks);
        }
        updateTrainingMenuButtonState(false);
        return decks;
      })().catch(() => {
        return getVisibleTrainingDecks();
      }).finally(() => {
        trainingDeckCatalogRefreshPromise = null;
      });
      return trainingDeckCatalogRefreshPromise;
    }

    async function refreshTrainingDeckInBackground(folder) {
      const safeFolder = sanitizeFolderName(folder || activeTrainingFolder);
      if (!safeFolder) return null;
      if (trainingDeckRefreshPromisesByFolder[safeFolder]) {
        return trainingDeckRefreshPromisesByFolder[safeFolder];
      }
      trainingDeckRefreshPromisesByFolder[safeFolder] = (async () => {
        const freshDeck = await loadTrainingDeck(safeFolder, true);
        if (trainingMenu.classList.contains("is-open")) {
          renderTrainingMenu(getVisibleTrainingDecks());
        }
        const canReplaceActiveSession = Boolean(
          trainingSession &&
          sanitizeFolderName(trainingSession?.deck?.folder || activeTrainingFolder) === safeFolder &&
          Number(trainingSession?.answered || 0) === 0 &&
          !trainingSession?.activeCardState?.locked &&
          !trainingSession?.activeCardState?.selectedIds?.size
        );
        if (canReplaceActiveSession) {
          activeTrainingDeckKey = freshDeck.deckKey;
          activeTrainingFolder = freshDeck.folder;
          trainingSession = createTrainingSessionFromDeck(freshDeck);
          renderDoomScrollQuiz();
        }
        setCachedCourseUnlockSummary(computeCourseUnlockSummary(safeFolder, null, { deck: freshDeck }));
        updateScenarioUnlockUi(safeFolder);
        return freshDeck;
      })().catch(() => {
        return trainingDeckCacheByFolder[safeFolder] || null;
      }).finally(() => {
        delete trainingDeckRefreshPromisesByFolder[safeFolder];
      });
      return trainingDeckRefreshPromisesByFolder[safeFolder];
    }

    function normalizeScenarioItem(raw) {
      if (typeof raw === "string") {
        return {
          file: raw,
          label: raw.replace(/\.json$/i, ""),
          countsTowardProgress: null,
          format: normalizeScenarioItemFormat("", raw)
        };
      }
      if (!raw || typeof raw !== "object" || !raw.file) return null;
      return {
        file: String(raw.file),
        label: String(raw.label || raw.file).replace(/\.json$/i, ""),
        countsTowardProgress: typeof raw.countsTowardProgress === "boolean" ? raw.countsTowardProgress : null,
        format: normalizeScenarioItemFormat(raw.format || "", raw.file)
      };
    }

    function extractManifestProgressTicketSet(payload) {
      if (!payload || typeof payload !== "object" || !Array.isArray(payload.progressTickets)) return null;
      const files = payload.progressTickets
        .map((entry) => assertScenarioResourcePath(entry, [".json"]))
        .filter((entry) => matchesScenarioNamingConvention(entry));
      return new Set(files.map((entry) => getScenarioStorageFileKey(entry)).filter(Boolean));
    }

    function normalizeScenarioManifestItems(payload, folder) {
      const safeFolder = sanitizeFolderName(folder);
      const source = Array.isArray(payload) ? payload : payload?.scenarios;
      if (!Array.isArray(source)) throw new Error("Manifest-Format ungültig");
      const progressTicketSet = extractManifestProgressTicketSet(payload);
      return source
        .map(normalizeScenarioItem)
        .filter((entry) => entry && entry.file.toLowerCase().endsWith(".json"))
        .filter((entry) => matchesScenarioNamingConvention(entry.file))
        .map((entry) => {
          const file = assertScenarioResourcePath(entry.file, [".json"]);
          const storageKey = getScenarioStorageFileKey(file);
          const countsTowardProgress = typeof entry.countsTowardProgress === "boolean"
            ? entry.countsTowardProgress
            : (progressTicketSet ? progressTicketSet.has(storageKey) : true);
          return {
            file,
            label: entry.label || buildScenarioLabelFromPath(file),
            folder: safeFolder,
            countsTowardProgress,
            format: "quiz"
          };
        });
    }

    async function fetchScenarioManifestItems(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error("Ungültiger Ordnername.");
      const basePath = getScenarioBasePath(safeFolder);
      const manifestCandidates = buildLocalizedResourcePaths("scenario-manifest.json", getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(manifestCandidates, { cache: "no-store" });
      if (!res) throw new Error("Manifest konnte nicht geladen werden (HTTP 404)");
      if (!res.ok) throw new Error("Manifest konnte nicht geladen werden (HTTP " + res.status + ")");
      const payload = await res.json();
      return normalizeScenarioManifestItems(payload, safeFolder);
    }

    function normalizeCourseManifestItems(payload, folder) {
      const safeFolder = sanitizeFolderName(folder);
      const source = Array.isArray(payload?.scenario_order) ? payload.scenario_order : [];
      if (!source.length) throw new Error("Kurs-Manifest ungültig");
      return source.map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const scenarioFolder = sanitizeFolderName(entry.folder || "");
        const scenarioFile = normalizeScenarioResourcePath(entry.file || "");
        if (!scenarioFolder || !scenarioFile) return null;
        const file = assertScenarioResourcePath(`${scenarioFolder}/${scenarioFile}`, [".json", ".md"]);
        const format = normalizeScenarioItemFormat(entry.format || "", file);
        return {
          file,
          label: String(entry.title || "").trim() || buildScenarioLabelFromPath(file),
          folder: safeFolder,
          countsTowardProgress: typeof entry.countsTowardProgress === "boolean"
            ? entry.countsTowardProgress
            : format !== "markdown",
          format
        };
      }).filter(Boolean);
    }

    async function fetchCourseManifestItems(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error("Ungültiger Ordnername.");
      const basePath = getScenarioBasePath(safeFolder);
      const manifestCandidates = buildLocalizedResourcePaths("00_manifest.json", getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(manifestCandidates, { cache: "no-store" });
      if (!res) throw new Error("Kurs-Manifest konnte nicht geladen werden (HTTP 404)");
      if (!res.ok) throw new Error("Kurs-Manifest konnte nicht geladen werden (HTTP " + res.status + ")");
      const payload = await res.json();
      return normalizeCourseManifestItems(payload, safeFolder);
    }

    async function fetchScenarioRepoItems(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder || !isHostedOnGithubPages()) return [];
      try {
        const collectedItems = [];
        const seenFiles = new Set();

        async function walk(parts = []) {
          const res = await fetch(buildGithubRepoContentsUrlForParts(["backend", "data", "Kurse", safeFolder, ...parts]), {
            cache: "no-store",
            headers: {
              Accept: "application/vnd.github+json"
            }
          });
          if (!res.ok) return;
          const payload = await res.json();
          if (!Array.isArray(payload)) return;
          for (const entry of payload) {
            if (!entry || typeof entry !== "object") continue;
            if (entry.type === "dir") {
              const dirName = String(entry.name || "").trim();
              if (!dirName) continue;
              await walk([...parts, dirName]);
              continue;
            }
            if (entry.type !== "file") continue;
            const fileName = String(entry.name || "").trim();
            const relativePath = assertScenarioResourcePath([...parts, fileName].filter(Boolean).join("/"), [".json"]);
            if (!matchesScenarioNamingConvention(relativePath) || seenFiles.has(relativePath)) continue;
            seenFiles.add(relativePath);
            collectedItems.push({
              file: relativePath,
              label: buildScenarioLabelFromPath(relativePath),
              folder: safeFolder,
              countsTowardProgress: false,
              format: "quiz"
            });
          }
        }

        await walk();
        return collectedItems.sort((a, b) => a.file.localeCompare(b.file, "de", { numeric: true, sensitivity: "base" }));
      } catch {
        return [];
      }
    }

    function mergeScenarioItems(liveItems, manifestItems) {
      const fallbackItems = Array.isArray(manifestItems) ? manifestItems : [];
      const primaryItems = Array.isArray(liveItems) ? liveItems : [];
      if (!primaryItems.length) return fallbackItems;
      const manifestByFile = new Map(
        fallbackItems.map((entry) => [String(entry.file || "").trim(), entry])
      );
      return primaryItems.map((entry) => {
        const manifestMatch = manifestByFile.get(String(entry.file || "").trim());
        return manifestMatch
          ? {
            ...entry,
            label: manifestMatch.label || entry.label,
            countsTowardProgress: Boolean(manifestMatch.countsTowardProgress),
            format: manifestMatch.format || entry.format || "quiz"
          }
          : entry;
      });
    }

    function buildScenarioFolderSyncMeta(folder, manifestItems, liveItems, manifestError = null) {
      const safeFolder = sanitizeFolderName(folder);
      const manifestList = Array.isArray(manifestItems) ? manifestItems : [];
      const liveList = Array.isArray(liveItems) ? liveItems : [];
      const manifestFiles = new Set(manifestList.map((entry) => String(entry?.file || "").trim()).filter(Boolean));
      const liveFiles = new Set(liveList.map((entry) => String(entry?.file || "").trim()).filter(Boolean));
      return {
        folder: safeFolder,
        manifestCount: manifestList.length,
        liveCount: liveList.length,
        repoCompared: isHostedOnGithubPages(),
        repoOnlyCount: liveList.filter((entry) => !manifestFiles.has(String(entry?.file || "").trim())).length,
        knownOnlyCount: manifestList.filter((entry) => !liveFiles.has(String(entry?.file || "").trim())).length,
        manifestError: manifestError?.message || ""
      };
    }

    function assertScenarioFilename(name) {
      const val = String(name || "").trim();
      if (!/^[a-z0-9._-]+\.json$/i.test(val)) {
        throw new Error("Ungültiger Dateiname in Manifest: " + val);
      }
      return val;
    }

    function matchesScenarioNamingConvention(fileName) {
      const baseName = getScenarioResourceBasename(fileName);
      return SCENARIO_FILENAME_CONVENTION.test(baseName) || SCENARIO_VERSIONED_FILENAME_CONVENTION.test(baseName);
    }

    async function loadScenarioManifestForFolder(folder) {
      const safeFolder = sanitizeFolderName(folder);
      if (!safeFolder) throw new Error("Ungültiger Ordnername.");
      let manifestItems = [];
      let manifestError = null;
      try {
        manifestItems = await fetchScenarioManifestItems(safeFolder);
      } catch (legacyErr) {
        try {
          manifestItems = await fetchCourseManifestItems(safeFolder);
          manifestError = null;
        } catch (courseErr) {
          manifestError = courseErr?.message ? courseErr : legacyErr;
        }
      }
      const liveRepoItems = await fetchScenarioRepoItems(safeFolder);
      const syncMeta = buildScenarioFolderSyncMeta(safeFolder, manifestItems, liveRepoItems, manifestError);
      scenarioFolderSyncMetaByFolder[safeFolder] = syncMeta;
      const mergedItems = mergeScenarioItems(liveRepoItems, manifestItems);
      if (mergedItems.length) return { items: mergedItems, sync: syncMeta };
      if (manifestItems.length) return { items: manifestItems, sync: syncMeta };
      throw manifestError || new Error("Keine gültigen Szenarien gefunden.");
    }

    async function loadScenarioJsonByPath(filePath, folder = "") {
      const safeFile = assertScenarioResourcePath(filePath, [".json"]);
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder);
      const basePath = getScenarioBasePath(safeFolder);
      const candidates = buildLocalizedResourcePaths(safeFile, getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(candidates, { cache: "no-store" });
      if (!res) throw new Error(`${safeFile} (HTTP 404)`);
      if (!res.ok) throw new Error(`${safeFile} (HTTP ${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data.questions)) {
        throw new Error(`${safeFile} ist kein gültiges Szenario-Prototyp-JSON (questions fehlt).`);
      }
      return data;
    }

    async function loadScenarioTextByPath(filePath, folder = "") {
      const safeFile = assertScenarioResourcePath(filePath, [".md"]);
      const safeFolder = sanitizeFolderName(folder || activeScenarioFolder);
      const basePath = getScenarioBasePath(safeFolder);
      const candidates = buildLocalizedResourcePaths(safeFile, getContentLocale())
        .map((entry) => `${basePath}/${entry}`);
      const res = await fetchFirstAvailable(candidates, { cache: "no-store" });
      if (!res) throw new Error(`${safeFile} (HTTP 404)`);
      if (!res.ok) throw new Error(`${safeFile} (HTTP ${res.status})`);
      return res.text();
    }

    function renderMarkdownDocument(markdown) {
      const article = document.createElement("article");
      article.className = "markdown-document";
      const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
      let paragraph = [];
      let listItems = [];
      let listType = "";

      const flushParagraph = () => {
        if (!paragraph.length) return;
        const entry = document.createElement("p");
        entry.className = "markdown-paragraph";
        appendInlineText(entry, paragraph.join(" ").replace(/\s+/g, " ").trim());
        article.appendChild(entry);
        paragraph = [];
      };

      const flushList = () => {
        if (!listItems.length) return;
        const list = document.createElement(listType === "ol" ? "ol" : "ul");
        list.className = "markdown-list";
        listItems.forEach((item) => {
          const li = document.createElement("li");
          appendInlineText(li, item);
          list.appendChild(li);
        });
        article.appendChild(list);
        listItems = [];
        listType = "";
      };

      const flushTextBlocks = () => {
        flushParagraph();
        flushList();
      };

      for (let index = 0; index < lines.length; index += 1) {
        const rawLine = lines[index];
        const line = String(rawLine || "");
        const trimmed = line.trim();

        const fenceMatch = trimmed.match(/^```([a-z0-9_-]+)?$/i);
        if (fenceMatch) {
          flushTextBlocks();
          const codeLines = [];
          index += 1;
          while (index < lines.length && !String(lines[index] || "").trim().match(/^```$/)) {
            codeLines.push(lines[index]);
            index += 1;
          }
          article.appendChild(buildHighlightedCodeBlock(codeLines.join("\n"), fenceMatch[1] || "", "markdown-code"));
          continue;
        }

        if (!trimmed) {
          flushTextBlocks();
          continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          flushTextBlocks();
          const level = Math.min(headingMatch[1].length, 6);
          const heading = document.createElement(`h${level}`);
          heading.className = `markdown-heading markdown-heading-${level}`;
          appendInlineText(heading, headingMatch[2]);
          article.appendChild(heading);
          continue;
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        const unorderedMatch = trimmed.match(/^-\s+(.+)$/);
        if (orderedMatch || unorderedMatch) {
          flushParagraph();
          const nextType = orderedMatch ? "ol" : "ul";
          if (listType && listType !== nextType) flushList();
          listType = nextType;
          listItems.push((orderedMatch || unorderedMatch)[1]);
          continue;
        }

        if (listItems.length) flushList();
        paragraph.push(trimmed);
      }

      flushTextBlocks();
      return article;
    }

    function renderMarkdownScenarioPage(item, markdown) {
      const panel = document.createElement("section");
      panel.className = "panel markdown-scenario-panel";
      const meta = document.createElement("div");
      meta.className = "markdown-scenario-meta";
      const typeBadge = document.createElement("span");
      typeBadge.className = "pill";
      typeBadge.textContent = "Kursfall";
      const folderBadge = document.createElement("span");
      folderBadge.className = "status-text markdown-scenario-folder";
      folderBadge.textContent = getFolderShortcutLabel(item?.folder || "") || String(item?.folder || "");
      meta.append(typeBadge, folderBadge);
      panel.appendChild(meta);
      panel.appendChild(renderMarkdownDocument(markdown));
      workspaceLeft.innerHTML = "";
      workspaceLeft.appendChild(panel);
      toggleTaskNavDrawer(false);
    }

    async function selectScenarioFolder(folder) {
      const safeFolder = sanitizeFolderName(folder);
      const unlockedFolders = getUnlockedFolders();
      if (!safeFolder || !unlockedFolders.includes(safeFolder)) return;
      const folderChanged = safeFolder !== activeScenarioFolder;
      activeScenarioFolder = safeFolder;
      activeHomeSkillsFolder = safeFolder;
      if (folderChanged) {
        scenarioData = null;
        activeScenarioFile = "";
        activeScenarioCountsTowardProgress = false;
      }
      try {
        localStorage.setItem(ACCESS_ACTIVE_FOLDER_STORAGE_KEY, activeScenarioFolder);
        localStorage.setItem(ACCESS_FOLDER_STORAGE_KEY, activeScenarioFolder);
        localStorage.setItem(HOME_SKILLS_FOLDER_STORAGE_KEY, activeHomeSkillsFolder);
        const activeEntry = unlockedAccessEntries.find((entry) => entry.folder === activeScenarioFolder) || unlockedAccessEntries[0];
        if (activeEntry) {
          localStorage.setItem(ACCESS_KEY_STORAGE_KEY, activeEntry.key);
        }
      } catch {
      }
      renderScenarioNavigation(availableScenarios);
      if (folderChanged || !activeScenarioFile || workspaceLeft.querySelector(".home-layout")) {
        await showHomeContent(safeFolder);
        return;
      }
      if (!isDesktopActivityLayout()) {
        toggleCourseMenu(false);
      }
    }

    async function selectScenario(item) {
      const unlockMeta = getScenarioUnlockMeta(item);
      if (unlockMeta?.locked) {
        renderSelectionHint(t("scenario.ticket.locked_message", "Dieses Ticket wird nach {required} korrekt geloesten DoomScroll-Aufgaben freigeschaltet. Aktuell: {current}.", {
          required: Math.max(0, Number(unlockMeta.milestone) || 0),
          current: Math.max(0, Number(getCourseUnlockSummary(item?.folder)?.correctSolvedCount) || 0)
        }));
        return;
      }
      markScenarioTicketOpened(item);
      updateScenarioUnlockUi(item?.folder || "");
      setAppBarSelection("");
      if (!isDesktopActivityLayout()) {
        toggleTrainingMenu(false);
        toggleCourseMenu(false);
        toggleScenarioMenu(false);
      }
      setSubmitBarVisible(false);
      renderSelectionHint(`Lade ${item.label} ...`);
      try {
        const nextFolder = sanitizeFolderName(item.folder || "");
        if (nextFolder) {
          activeHomeSkillsFolder = nextFolder;
        }
        if (nextFolder && nextFolder !== activeScenarioFolder) {
          activeScenarioFolder = nextFolder;
          homeSkillsCache = Object.create(null);
          try {
            localStorage.setItem(ACCESS_ACTIVE_FOLDER_STORAGE_KEY, activeScenarioFolder);
            localStorage.setItem(ACCESS_FOLDER_STORAGE_KEY, activeScenarioFolder);
            localStorage.setItem(HOME_SKILLS_FOLDER_STORAGE_KEY, activeHomeSkillsFolder);
          } catch {
          }
        }
        const scenarioFormat = normalizeScenarioItemFormat(item?.format || "", item?.file || "");
        if (scenarioFormat === "markdown") {
          const markdown = await loadScenarioTextByPath(item.file, item.folder);
          scenarioData = null;
          activeScenarioFile = item.file;
          activeScenarioCountsTowardProgress = false;
          resetRuntimeState();
          renderMarkdownScenarioPage(item, markdown);
          renderScenarioNavigation(availableScenarios);
          queueCommentModeContextBroadcast();
          return;
        }
        const data = await loadScenarioJsonByPath(item.file, item.folder);
        await validateScenarioProgressBindings(data, nextFolder || item.folder, item.file);
        scenarioData = data;
        activeScenarioFile = item.file;
        activeScenarioCountsTowardProgress = Boolean(item.countsTowardProgress);
        resetRuntimeState();
        buildPage(data);
        setSubmitBarVisible(true);
        renderScenarioNavigation(availableScenarios);
        queueCommentModeContextBroadcast();
      } catch (err) {
        scenarioData = null;
        activeScenarioFile = "";
        activeScenarioCountsTowardProgress = false;
        resetRuntimeState();
        renderScenarioNavigation(availableScenarios);
        const loadDetail = err?.message || t("scenario.error.load_generic_detail", "Szenario konnte nicht geladen werden.");
        renderSelectionHint(t("scenario.error.load_message", "{title}: {detail}", {
          title: t("scenario.error.load_title", "Fehler beim Laden"),
          detail: loadDetail
        }));
        queueCommentModeContextBroadcast();
      }
    }

    function renderTrainingMenu(decks = getVisibleTrainingDecks()) {
      if (!trainingMenuOptions) return;
      const source = Array.isArray(decks) ? decks : [];
      trainingMenuOptions.innerHTML = "";
      if (!source.length) {
        trainingMenuOptions.innerHTML = `<p class='status-text scenario-tree-empty'>${esc(t("training.menu.empty", "Noch kein Training für diesen Zugriff verfügbar."))}</p>`;
        return;
      }

      for (const deck of source) {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "training-menu-card";
        if (deck.deckKey === activeTrainingDeckKey || sanitizeFolderName(deck.folder) === sanitizeFolderName(activeTrainingFolder)) {
          option.classList.add("is-active");
          option.setAttribute("aria-current", "true");
        }
        option.innerHTML =
          "<span class='training-menu-icon' aria-hidden='true'>🧠</span>" +
          "<span class='training-menu-main'>" +
          `<span class='training-menu-title'>${esc(getFolderShortcutLabel(deck.folder) || deck.folder)}</span>` +
          `<span class='training-menu-subtitle'>${esc(getTrainingDeckMenuSubtitle(deck))}</span>` +
          "</span>" +
          `<span class='training-menu-count'>${Math.max(0, Number(deck.questionCount) || 0)}</span>`;
        option.addEventListener("click", async () => {
          await startTrainingDeck(deck.folder);
        });
        trainingMenuOptions.appendChild(option);
      }
    }

    function getTrainingQuestionFeed() {
      return document.getElementById("doomscrollQuestionFeed");
    }

    function scrollTrainingPanelIntoView(panel, behavior = "smooth") {
      if (!panel) return;
      const feed = getTrainingQuestionFeed();
      if (!feed || panel.parentElement !== feed) {
        panel.scrollIntoView({ behavior, block: "start" });
        return;
      }
      if (trainingSession) {
        trainingSession.feedSnapLocked = true;
        if (trainingSession.feedSnapReleaseTimeout) {
          window.clearTimeout(trainingSession.feedSnapReleaseTimeout);
        }
        trainingSession.feedSnapReleaseTimeout = window.setTimeout(() => {
          if (!trainingSession) return;
          trainingSession.feedSnapLocked = false;
          trainingSession.feedSnapReleaseTimeout = 0;
          queueTrainingFeedViewportSync();
        }, behavior === "auto" ? 40 : 420);
      }
      feed.scrollTo({
        top: Math.max(0, Number(panel.offsetTop) || 0),
        behavior
      });
    }

    function queueTrainingFeedViewportSync() {
      if (!trainingSession || trainingSession.feedViewportSyncRaf) return;
      trainingSession.feedViewportSyncRaf = window.requestAnimationFrame(() => {
        if (!trainingSession) return;
        trainingSession.feedViewportSyncRaf = 0;
        syncTrainingFeedViewportState();
      });
    }

    function queueTrainingFeedSnap() {
      if (!trainingSession) return;
      if (trainingSession.feedSnapTimeout) {
        window.clearTimeout(trainingSession.feedSnapTimeout);
      }
      trainingSession.feedSnapTimeout = window.setTimeout(() => {
        if (!trainingSession) return;
        trainingSession.feedSnapTimeout = 0;
        snapTrainingFeedToNearestPanel();
      }, 120);
    }

    function snapTrainingFeedToNearestPanel(force = false) {
      const feed = getTrainingQuestionFeed();
      if (!trainingSession || !feed || trainingSession.feedSnapLocked) return;
      const panels = [...feed.querySelectorAll(".doomscroll-panel")];
      if (!panels.length) return;
      const nearestPanel = panels.reduce((best, panel) => {
        if (!best) return panel;
        const bestDistance = Math.abs((Number(best.offsetTop) || 0) - feed.scrollTop);
        const panelDistance = Math.abs((Number(panel.offsetTop) || 0) - feed.scrollTop);
        return panelDistance < bestDistance ? panel : best;
      }, null);
      if (!nearestPanel) return;
      const targetTop = Math.max(0, Number(nearestPanel.offsetTop) || 0);
      if (Math.abs(feed.scrollTop - targetTop) <= 2) {
        queueTrainingFeedViewportSync();
        return;
      }
      scrollTrainingPanelIntoView(nearestPanel, force ? "auto" : "smooth");
    }

    function syncTrainingFeedViewportState() {
      const feed = getTrainingQuestionFeed();
      if (!feed) {
        setTrainingActiveCardState(null);
        return;
      }
      const panels = [...feed.querySelectorAll(".doomscroll-panel")];
      if (!panels.length) {
        setTrainingActiveCardState(null);
        return;
      }
      const feedRect = feed.getBoundingClientRect();
      const feedCenter = feedRect.top + (feedRect.height / 2);
      let bestPanel = null;
      let bestScore = Number.NEGATIVE_INFINITY;

      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const visibleHeight = Math.min(feedRect.bottom, rect.bottom) - Math.max(feedRect.top, rect.top);
        if (visibleHeight <= 0) return;
        const panelCenter = rect.top + (rect.height / 2);
        const distancePenalty = Math.abs(panelCenter - feedCenter) * 0.35;
        const score = visibleHeight - distancePenalty;
        if (score > bestScore) {
          bestScore = score;
          bestPanel = panel;
        }
      });

      setTrainingActiveCardState(bestPanel && bestPanel.__cardState ? bestPanel.__cardState : null);
    }

    function attachTrainingFeedViewportTracking() {
      const feed = getTrainingQuestionFeed();
      if (!trainingSession || !feed) return;
      if (typeof trainingSession.feedViewportCleanup === "function") {
        try {
          trainingSession.feedViewportCleanup();
        } catch {
        }
      }
      const handleScroll = () => {
        queueTrainingFeedViewportSync();
        if (!trainingSession?.feedSnapLocked) {
          queueTrainingFeedSnap();
        }
      };
      const handleResize = () => {
        snapTrainingFeedToNearestPanel(true);
        queueTrainingFeedViewportSync();
        refreshActiveTrainingReviewLayout();
      };
      feed.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize);
      trainingSession.feedViewportCleanup = () => {
        feed.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
      };
      queueTrainingFeedViewportSync();
    }

    function disposeTrainingFeedState(session = trainingSession) {
      if (!session) return;
      if (session.feedViewportSyncRaf) {
        window.cancelAnimationFrame(session.feedViewportSyncRaf);
      }
      session.feedViewportSyncRaf = 0;
      if (session.feedSnapTimeout) {
        window.clearTimeout(session.feedSnapTimeout);
      }
      session.feedSnapTimeout = 0;
      if (session.feedSnapReleaseTimeout) {
        window.clearTimeout(session.feedSnapReleaseTimeout);
      }
      session.feedSnapReleaseTimeout = 0;
      session.feedSnapLocked = false;
      if (typeof session.feedViewportCleanup === "function") {
        try {
          session.feedViewportCleanup();
        } catch {
        }
      }
      session.feedViewportCleanup = null;
      const cardStates = Array.isArray(session.feedCardStates) ? [...session.feedCardStates] : [];
      cardStates.forEach((cardState) => {
        disposeTrainingCardState(cardState);
      });
      session.feedCardStates = [];
      session.activeCardState = null;
      session.summaryAppended = false;
    }

    function updateTrainingProgressUi() {
      const total = Math.max(0, Number(trainingSession?.progressTotalUnits) || 0);
      const exact = Math.max(0, Number(trainingSession?.progressCorrectUnits) || 0);
      const wrong = Math.max(0, Number(trainingSession?.progressWrongUnits) || 0);
      const open = Math.max(0, Number(trainingSession?.progressOpenUnits) || 0);
      const correctPct = total ? (exact / total) * 100 : 0;
      const wrongPct = total ? (wrong / total) * 100 : 0;
      const openPct = total ? (open / total) * 100 : 0;
      if (trainingProgressRailCorrect) trainingProgressRailCorrect.style.width = `${correctPct}%`;
      if (trainingProgressRailWrong) trainingProgressRailWrong.style.width = `${wrongPct}%`;
      if (trainingProgressRailOpen) trainingProgressRailOpen.style.width = `${openPct}%`;
      if (trainingProgressRailTrack) {
        const label = t("progress.training.summary", "{exact} Inhaltseinheiten korrekt, {wrong} Inhaltseinheiten mit Fehlern, {open} Inhaltseinheiten noch offen", {
          exact,
          wrong,
          open
        });
        trainingProgressRailTrack.setAttribute("aria-label", label);
        trainingProgressRailTrack.title = label;
      }
    }

    function showTrainingPanel(panel, options = {}) {
      const feed = getTrainingQuestionFeed();
      if (!feed || !panel) return null;
      const shouldScroll = options.scrollIntoView !== false;
      const scrollBehavior = options.scrollBehavior || "smooth";
      panel.classList.add("doomscroll-panel");
      if (!panel.isConnected) {
        panel.classList.add("is-entering");
        feed.appendChild(panel);
        const panelCardState = panel.__cardState || null;
        if (panelCardState && trainingSession) {
          const feedCardStates = Array.isArray(trainingSession.feedCardStates)
            ? trainingSession.feedCardStates
            : (trainingSession.feedCardStates = []);
          if (!feedCardStates.includes(panelCardState)) {
            feedCardStates.push(panelCardState);
          }
        }
        window.requestAnimationFrame(() => {
          panel.classList.add("is-active");
          queueTrainingFeedViewportSync();
        });
      }
      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          scrollTrainingPanelIntoView(panel, scrollBehavior);
        });
      }
      return panel;
    }

    function getTrainingSelectionLabel(question) {
      switch (normalizeTrainingInteractionType(question?.interactionType || question?.type || "")) {
        case "binary":
          return t("training.selection.binary", "Richtig oder falsch");
        case "multi":
          return t("training.selection.multi", "Mehrere Antworten moeglich");
        case "best":
          return t("training.selection.best", "Beste Antwort");
        case "sequence":
          return t("training.selection.sequence", "Reihenfolge festlegen");
        case "gap_fill_choice":
          return t("training.selection.gap_fill_choice", "Luecke per Auswahl fuellen");
        case "gap_fill_text":
          return t("training.selection.gap_fill_text", "Luecke frei fuellen");
        case "single":
        default:
          return t("training.selection.single", "Eine Antwort");
      }
    }

    function setTrainingActiveCardState(cardState) {
      if (!trainingSession) return;
      const previousCardState = trainingSession.activeCardState || null;
      if (previousCardState?.card && previousCardState !== cardState) {
        previousCardState.card.classList.remove("is-current");
      }
      trainingSession.activeCardState = cardState || null;
      if (cardState?.card) {
        cardState.card.classList.add("is-current");
        trainingSession.currentQuestionIndex = Number(cardState.question?.sessionIndex) || trainingSession.currentQuestionIndex;
      }
      queueCommentModeContextBroadcast();
    }

    function buildTrainingFeedbackEntry(question) {
      const deck = trainingSession?.deck || getActiveTrainingDeck();
      const folder = sanitizeFolderName(deck?.folder || activeTrainingFolder || activeScenarioFolder || activeHomeSkillsFolder || "");
      const deckKey = String(deck?.deckKey || `doomscroll_${normalizeProgressId(folder || "training")}`).trim();
      const baseQuestionId = String(question?.id || normalizeProgressId(question?.prompt || "question") || "question").trim();
      const questionKey = normalizeProgressId(`${deckKey}::${baseQuestionId}`) || baseQuestionId;
      return {
        questionKey,
        questionId: baseQuestionId,
        deckKey,
        folder,
        prompt: String(question?.prompt || "").trim(),
        badgeLabel: String(getTrainingQuestionBadgeLabel(question) || "").trim(),
        sourceFile: String(question?.sourceFile || "").trim(),
        ticketId: String(question?.ticketId || "").trim(),
        conceptId: String(question?.conceptId || "").trim(),
        variantId: String(question?.variantId || "").trim()
      };
    }

    function updateTrainingLockButtonLabel(cardState) {
      if (!cardState?.lockButton) return;
      if (!cardState.locked) {
        cardState.lockButton.textContent = t("training.question.lock", "Antworten einloggen");
        return;
      }
      const exact = wasTrainingAnswerExact(cardState.question, cardState.selectedIds);
      cardState.lockButton.textContent = exact
        ? t("training.question.locked_exact", "Sauber eingeloggt")
        : t("training.question.locked_reviewed", "Ausgewertet");
    }

    function updateTrainingContinueButtonLabel(cardState) {
      if (!cardState?.continueButton) return;
      if (!cardState.locked) {
        cardState.continueButton.textContent = t("training.question.continue", "Weiter");
        return;
      }
      const nextPanel = ensureTrainingNextPanel(cardState);
      cardState.continueButton.textContent = nextPanel?.id === "doomscrollSummary"
        ? t("training.question.finish", "Zum Abschluss")
        : t("training.question.continue_down", "Weiter nach unten");
    }

    function refreshTrainingInteractionLanguageUi() {
      document.querySelectorAll("[data-training-card]").forEach((card) => {
        const cardState = card?.__cardState || null;
        if (!cardState) return;
        const kicker = card.querySelector(".doomscroll-question-kicker");
        if (kicker) {
          kicker.textContent = getFolderShortcutLabel(activeTrainingFolder) || activeTrainingFolder || t("training.menu.title", "Training");
        }
        const title = card.querySelector(".doomscroll-question-title");
        if (title) {
          title.textContent = getTrainingQuestionPromptText(cardState.question);
        }
        const modePill = card.querySelector(".doomscroll-question-mode-pill");
        if (modePill) {
          modePill.textContent = getTrainingQuestionBadgeLabel(cardState.question);
        }
        cardState.optionButtons.forEach(({ element, option }) => {
          const optionText = element.querySelector(".doomscroll-option-text");
          if (optionText) {
            optionText.textContent = getTrainingOptionText(option);
          }
        });
        updateTrainingLockButtonLabel(cardState);
        updateTrainingContinueButtonLabel(cardState);
        if (cardState.locked && cardState.reviewSlot && !cardState.reviewSlot.classList.contains("hidden")) {
          renderTrainingReview(cardState);
        }
      });
    }

    function disposeTrainingCardState(cardState) {
      if (!cardState || cardState.isDisposed) return;
      cardState.isDisposed = true;
      const feedCardStates = Array.isArray(trainingSession?.feedCardStates) ? trainingSession.feedCardStates : null;
      if (feedCardStates) {
        const cardIndex = feedCardStates.indexOf(cardState);
        if (cardIndex >= 0) {
          feedCardStates.splice(cardIndex, 1);
        }
      }
      if (trainingSession?.activeCardState === cardState) {
        trainingSession.activeCardState = null;
      }
      if (cardState.card) {
        cardState.card.__destroy = null;
      }
    }

    function getTrainingOptionStateClass(option, selectedIds) {
      const selected = selectedIds.has(option.id);
      if (selected && option.correct) return "is-correct";
      if (selected && !option.correct) return "is-wrong";
      if (!selected && option.correct) return "is-missed";
      return "is-neutral";
    }

    function getTrainingReviewStatus(option, selectedIds) {
      const selected = selectedIds.has(option.id);
      if (selected && option.correct) return "ok";
      if (selected && !option.correct) return "bad";
      if (!selected && option.correct) return "miss";
      return "neutral";
    }

    function buildTrainingReviewAssessments(cardState) {
      if (!cardState || !Array.isArray(cardState.optionButtons)) return [];
      return cardState.optionButtons.map(({ element, option }, optionIndex) => ({
        status: getTrainingReviewStatus(option, cardState.selectedIds),
        title: t("training.review.option_title", "Option {label}", {
          label: String.fromCharCode(65 + optionIndex)
        }),
        detail: getTrainingOptionText(option),
        explain: getTrainingOptionExplanation(option),
        sourceEl: element,
        anchorEl: element
      }));
    }

    function shouldInlineTrainingReviewBelowAnswers() {
      return Boolean(window.matchMedia?.("(max-width: 980px) and (orientation: portrait)")?.matches);
    }

    function syncTrainingReviewSlotPlacement(cardState) {
      const card = cardState?.card || null;
      const slot = cardState?.reviewSlot || null;
      const mainPanel = cardState?.mainPanel || null;
      const actions = cardState?.actions || null;
      if (!card || !slot || !mainPanel || !actions) return;
      if (shouldInlineTrainingReviewBelowAnswers()) {
        if (slot.parentElement !== mainPanel || slot.nextElementSibling !== actions) {
          mainPanel.insertBefore(slot, actions);
        }
        return;
      }
      if (slot.parentElement !== card) {
        card.appendChild(slot);
      }
    }

    function refreshActiveTrainingReviewLayout() {
      const cardState = trainingSession?.activeCardState || null;
      if (!cardState?.card?.isConnected) return;
      syncTrainingReviewSlotPlacement(cardState);
      if (!cardState.locked || cardState.reviewSlot?.classList.contains("hidden")) return;
      const assessments = buildTrainingReviewAssessments(cardState);
      if (!assessments.length) return;
      layoutReviewGraph(cardState.card, cardState.reviewSlot, assessments);
      window.requestAnimationFrame(() => {
        if (cardState.card?.isConnected && !cardState.reviewSlot?.classList.contains("hidden")) {
          layoutReviewGraph(cardState.card, cardState.reviewSlot, assessments);
        }
      });
    }

    function renderTrainingReview(cardState) {
      const card = cardState?.card || null;
      const slot = cardState?.reviewSlot || null;
      if (!card || !slot) return;
      const assessments = buildTrainingReviewAssessments(cardState);
      if (!assessments.length) return;
      card.classList.add("has-review");
      slot.classList.remove("hidden");
      syncTrainingReviewSlotPlacement(cardState);
      window.requestAnimationFrame(() => {
        layoutReviewGraph(card, slot, assessments);
      });
    }

    function wasTrainingAnswerExact(question, selectedIds) {
      const correctIds = new Set((question.options || []).filter((option) => option.correct).map((option) => option.id));
      if (correctIds.size !== selectedIds.size) return false;
      return [...correctIds].every((id) => selectedIds.has(id));
    }

    function toggleTrainingOption(cardState, optionId, element, question) {
      if (!cardState || cardState.locked) return;
      const maxSelections = Number(question?.maxSelections) || 1;
      const isSingle = maxSelections === 1;

      if (isSingle) {
        cardState.selectedIds.clear();
        cardState.optionButtons.forEach(({ element: optionEl }) => {
          optionEl.classList.remove("is-selected");
        });
        cardState.selectedIds.add(optionId);
        element.classList.add("is-selected");
      } else if (cardState.selectedIds.has(optionId)) {
        cardState.selectedIds.delete(optionId);
        element.classList.remove("is-selected");
      } else if (cardState.selectedIds.size < maxSelections) {
        cardState.selectedIds.add(optionId);
        element.classList.add("is-selected");
      }

      cardState.lockButton.disabled = cardState.selectedIds.size === 0;
      setTrainingActiveCardState(cardState);
    }

    function ensureTrainingNextPanel(cardState) {
      if (!trainingSession || !cardState) return null;
      if (cardState.nextPanel?.isConnected) {
        return cardState.nextPanel;
      }
      const nextQuestion = selectNextTrainingQuestion(cardState.question?.id || "");
      if (nextQuestion) {
        const nextPanel = showTrainingQuestionCard(nextQuestion, Number(nextQuestion.sessionIndex) || 0, {
          activate: false,
          scrollIntoView: false
        });
        cardState.nextPanel = nextPanel || null;
        return cardState.nextPanel;
      }
      if (!trainingSession.summaryAppended) {
        trainingSession.summaryAppended = true;
        cardState.nextPanel = showTrainingSummaryCard({ scrollIntoView: false });
        return cardState.nextPanel;
      }
      cardState.nextPanel = document.getElementById("doomscrollSummary");
      return cardState.nextPanel;
    }

    function goToNextTrainingStep(cardState) {
      if (!trainingSession || !cardState || !cardState.locked) return;
      const nextPanel = ensureTrainingNextPanel(cardState);
      if (!nextPanel) return;
      cardState.movedOn = true;
      cardState.continueButton.disabled = false;
      scrollTrainingPanelIntoView(nextPanel, "smooth");
      window.setTimeout(() => {
        queueTrainingFeedViewportSync();
      }, 260);
    }

    function lockTrainingQuestion(cardState) {
      if (!trainingSession || !cardState || cardState.locked || cardState.selectedIds.size === 0) return;
      cardState.locked = true;
      const exact = wasTrainingAnswerExact(cardState.question, cardState.selectedIds);
      if (cardState.question?.id) {
        trainingSession.questionStateById[cardState.question.id] = exact ? "correct" : "wrong";
      }
      syncTrainingSessionCounts();
      applyCourseUnlockProgressForQuestion(cardState.question, exact);

      cardState.optionButtons.forEach(({ element, option }) => {
        element.classList.add("is-locked", "is-revealed", getTrainingOptionStateClass(option, cardState.selectedIds));
        element.setAttribute("aria-disabled", "true");
      });

      cardState.lockButton.disabled = true;
      updateTrainingLockButtonLabel(cardState);
      cardState.continueButton.classList.remove("hidden");
      cardState.continueButton.disabled = false;
      renderTrainingReview(cardState);
      updateTrainingProgressUi();
      setTrainingActiveCardState(cardState);
      updateTrainingContinueButtonLabel(cardState);
    }

    function createTrainingQuestionCard(question, index = 0, options = {}) {
      const shouldActivate = options.activate !== false;
      const card = document.createElement("article");
      card.className = "panel doomscroll-question-card";
      card.dataset.trainingCard = question.id;

      const mainPanel = document.createElement("div");
      mainPanel.className = "question-main doomscroll-question-main";

      const reviewSlot = document.createElement("div");
      reviewSlot.className = "review-slot doomscroll-review-slot hidden";

      const cardState = {
        question,
        locked: false,
        movedOn: false,
        isDisposed: false,
        selectedIds: new Set(),
        optionButtons: [],
        lockButton: null,
        continueButton: null,
        card,
        reviewSlot,
        mainPanel,
        actions: null,
        nextPanel: null
      };
      card.__cardState = cardState;

      mainPanel.innerHTML =
        "<div class='doomscroll-question-head'>" +
        "<div class='doomscroll-question-head-main'>" +
        `<p class='doomscroll-question-kicker'>${esc(getFolderShortcutLabel(activeTrainingFolder) || activeTrainingFolder || t("training.menu.title", "Training"))}</p>` +
        `<h3 class='doomscroll-question-title'>${esc(getTrainingQuestionPromptText(question))}</h3>` +
        "</div>" +
        `<span class='doomscroll-question-mode-pill'>${esc(getTrainingQuestionBadgeLabel(question))}</span>` +
        "</div>";

      const optionList = document.createElement("div");
      optionList.className = "doomscroll-option-list";
      (question.options || []).forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "doomscroll-option-button";
        button.innerHTML =
          "<div class='doomscroll-option-topline'>" +
          `<span class='doomscroll-option-marker'>${String.fromCharCode(65 + optionIndex)}</span>` +
          `<p class='doomscroll-option-text'>${esc(getTrainingOptionText(option))}</p>` +
          "</div>";
        button.addEventListener("click", () => {
          setTrainingActiveCardState(cardState);
          toggleTrainingOption(cardState, option.id, button, question);
        });
        optionList.appendChild(button);
        cardState.optionButtons.push({ element: button, option });
      });
      mainPanel.appendChild(optionList);

      const actions = document.createElement("div");
      actions.className = "doomscroll-question-actions";
      const lockButton = document.createElement("button");
      lockButton.type = "button";
      lockButton.className = "doomscroll-lock-button";
      lockButton.textContent = t("training.question.lock", "Antworten einloggen");
      lockButton.disabled = true;
      lockButton.addEventListener("click", () => {
        setTrainingActiveCardState(cardState);
        lockTrainingQuestion(cardState);
      });
      const continueButton = document.createElement("button");
      continueButton.type = "button";
      continueButton.className = "doomscroll-secondary-button hidden";
      continueButton.textContent = t("training.question.continue", "Weiter");
      continueButton.disabled = true;
      continueButton.addEventListener("click", () => {
        setTrainingActiveCardState(cardState);
        goToNextTrainingStep(cardState);
      });
      actions.append(lockButton, continueButton);
      mainPanel.appendChild(actions);
      cardState.actions = actions;

      card.append(mainPanel);
      card.__destroy = () => {
        disposeTrainingCardState(cardState);
      };
      syncTrainingReviewSlotPlacement(cardState);

      cardState.lockButton = lockButton;
      cardState.continueButton = continueButton;
      if (shouldActivate) {
        trainingSession.currentQuestionIndex = index;
        setTrainingActiveCardState(cardState);
      }
      return card;
    }

    function createTrainingSummaryCard() {
      const total = Math.max(0, Number(trainingSession?.progressTotalUnits) || 0);
      const exact = Math.max(0, Number(trainingSession?.progressCorrectUnits) || 0);
      const ratio = total ? Math.round((exact / total) * 100) : 0;
      const card = document.createElement("article");
      card.id = "doomscrollSummary";
      card.className = "panel doomscroll-summary-card";
      card.innerHTML =
        `<p class='eyebrow'>${esc(t("training.summary.kicker", "Quiz beendet"))}</p>` +
        `<h2>${esc(t("training.summary.title", "{exact} von {total} Inhaltseinheiten komplett getroffen", { exact, total }))}</h2>` +
        `<p class='status-text'>${esc(t("training.summary.body", "Du bist mit {ratio}% durch diese Inhaltsversion geswipet. Starte dasselbe Training neu oder wähle ein anderes Deck.", { ratio }))}</p>` +
        "<div class='doomscroll-summary-actions'>" +
        `<button id='btnRestartTrainingDeck' type='button' class='btn-primary'>${esc(t("training.summary.restart", "Noch mal mit diesem Deck"))}</button>` +
        `<button id='btnOpenTrainingChooser' type='button' class='btn-secondary'>${esc(t("training.summary.choose_other", "Anderes Training"))}</button>` +
        "</div>";
      window.setTimeout(() => {
        const restartButton = document.getElementById("btnRestartTrainingDeck");
        if (restartButton) restartButton.addEventListener("click", () => startTrainingDeck(activeTrainingFolder));
        const chooserButton = document.getElementById("btnOpenTrainingChooser");
        if (chooserButton) chooserButton.addEventListener("click", () => toggleTrainingMenu(true).catch(() => {}));
      }, 0);
      card.__panelRole = "summary";
      return card;
    }

    function showTrainingSummaryCard(options = {}) {
      return showTrainingPanel(createTrainingSummaryCard(), options);
    }

    function showTrainingQuestionCard(question, index = 0, options = {}) {
      return showTrainingPanel(createTrainingQuestionCard(question, index, options), {
        scrollIntoView: options.scrollIntoView !== false,
        scrollBehavior: options.scrollBehavior || "smooth"
      });
    }

    function renderDoomScrollQuiz() {
      const deck = getActiveTrainingDeck();
      if (!deck?.questions?.length) {
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          `<h2>${esc(t("training.empty.title", "Training"))}</h2>` +
          `<p class='status-text'>${esc(t("training.empty.body", "Für diesen Kurs ist aktuell noch kein Trainingsdeck verfügbar."))}</p>` +
          "</section>";
        return;
      }

      workspaceLeft.innerHTML =
        "<section class='doomscroll-shell'>" +
        "<div class='doomscroll-swipe-stage' id='doomscrollQuestionFeed'></div>" +
        "</section>";

      attachTrainingFeedViewportTracking();
      syncTrainingSessionCounts();
      updateTrainingProgressUi();
      const nextQuestion = selectNextTrainingQuestion();
      if (nextQuestion) {
        showTrainingQuestionCard(nextQuestion, Number(nextQuestion.sessionIndex) || 0, {
          scrollIntoView: false,
          scrollBehavior: "auto"
        });
      }
      const feed = getTrainingQuestionFeed();
      if (feed) {
        feed.scrollTo({ top: 0, behavior: "auto" });
      }
      window.scrollTo({ top: 0, behavior: "auto" });
      queueTrainingFeedViewportSync();
    }

    async function startTrainingDeck(folder) {
      const safeFolder = sanitizeFolderName(folder);
      try {
        const previousTrainingSession = trainingSession;
        const deck = await loadTrainingDeck(safeFolder, false);
        if (!deck?.questions?.length) {
          throw new Error(t("training.error.no_questions_for_folder", "Für {folder} sind noch keine Trainingsfragen verfügbar.", {
            folder: safeFolder
          }));
        }
        disposeTrainingFeedState(previousTrainingSession);
        activeTrainingDeckKey = deck.deckKey;
        activeTrainingFolder = deck.folder;
        trainingSession = createTrainingSessionFromDeck(deck);
        setAppBarSelection("training");
        if (!isDesktopActivityLayout()) {
          toggleTrainingMenu(false);
          toggleCourseMenu(false);
          toggleScenarioMenu(false);
        }
        setSubmitBarVisible(false);
        resetRuntimeState({ preserveTrainingSession: true });
        renderTrainingMenu(getVisibleTrainingDecks());
        renderDoomScrollQuiz();
        if (trainingDeckCacheSourceByFolder[safeFolder] === "cache") {
          refreshTrainingDeckInBackground(safeFolder).catch(() => {});
        }
        queueCommentModeContextBroadcast();
      } catch (err) {
        trainingSession = null;
        activeTrainingDeckKey = "";
        activeTrainingFolder = safeFolder;
        setAppBarSelection("training");
        setSubmitBarVisible(false);
        workspaceLeft.innerHTML =
          "<section class='panel'>" +
          `<h2>${esc(t("training.empty.title", "Training"))}</h2>` +
          `<p class='status-text'>${esc(err?.message || t("training.error.generic", "Training konnte nicht geladen werden."))}</p>` +
          "</section>";
        queueCommentModeContextBroadcast();
      }
    }

    function renderCourseMenu(groups) {
      if (!courseMenuOptions) return;
      courseMenuOptions.innerHTML = "";
      if (!groups.length) {
        courseMenuOptions.innerHTML = `<p class='status-text scenario-tree-empty'>${esc(t("course.empty", "Keine Kurse gefunden."))}</p>`;
        return;
      }

      for (const group of groups) {
        const item = document.createElement("div");
        item.className = "scenario-tree-folder-entry";
        const option = document.createElement("button");
        option.type = "button";
        option.className = "scenario-tree-folder-button";
        if (group.folder === activeScenarioFolder) {
          option.classList.add("is-active");
          option.setAttribute("aria-current", "true");
        }
        const folderShortLabel = getFolderShortcutLabel(group.folder) || group.folder;
        const ticketCount = Array.isArray(group.items) ? group.items.length : 0;
        option.innerHTML =
          "<span class='scenario-tree-folder-icon' aria-hidden='true'>" +
          "📚" +
          "</span>" +
          "<span class='scenario-tree-folder-main'>" +
          `<span class='scenario-tree-folder-name'>${esc(folderShortLabel)}</span>` +
          "</span>" +
          `<span class='scenario-tree-folder-count'>${ticketCount}</span>`;
        option.addEventListener("click", () => {
          selectScenarioFolder(group.folder).catch(() => {});
        });
        item.appendChild(option);

        const noteText = group.error
          ? `Fehler: ${group.error}`
          : group.sync?.repoCompared && group.sync.repoOnlyCount > 0
            ? `Repo +${group.sync.repoOnlyCount} ${group.sync.repoOnlyCount === 1 ? "Ticket" : "Tickets"}`
            : group.sync?.manifestError
              ? "Manifestfehler. Live aus dem Repo ergänzt."
              : "";
        if (noteText) {
          const note = document.createElement("p");
          note.className = "status-text scenario-tree-folder-note";
          note.textContent = noteText;
          item.appendChild(note);
        }
        courseMenuOptions.appendChild(item);
      }
    }

    function renderScenarioMenu(groups) {
      if (!scenarioMenuOptions) return;
      scenarioMenuOptions.innerHTML = "";
      if (!groups.length) {
        scenarioMenuOptions.innerHTML = `<p class='status-text scenario-tree-empty'>${esc(t("scenario.menu.empty", "Keine Tickets gefunden."))}</p>`;
        return;
      }

      const activeGroup = getActiveScenarioGroup(groups);
      if (!activeGroup) {
        scenarioMenuOptions.innerHTML = `<p class='status-text scenario-tree-empty'>${esc(t("scenario.menu.pick_course", "Bitte zuerst einen Kurs auswaehlen."))}</p>`;
        return;
      }

      const content = document.createElement("div");
      content.className = "scenario-tree-ticket-list";
      scenarioMenuOptions.appendChild(content);

      if (activeGroup.sync?.repoCompared) {
        const syncText = document.createElement("p");
        syncText.className = "status-text scenario-tree-sync-note";
        if (activeGroup.sync.repoOnlyCount > 0) {
          syncText.textContent = `Repo +${activeGroup.sync.repoOnlyCount} ${activeGroup.sync.repoOnlyCount === 1 ? "Ticket" : "Tickets"}`;
        } else if (activeGroup.sync.manifestError) {
          syncText.textContent = "Manifestfehler. Live aus dem Repo ergänzt.";
        } else {
          syncText.textContent = "Repo und Manifest abgeglichen.";
        }
        content.appendChild(syncText);
      }

      if (activeGroup.error) {
        const errorText = document.createElement("p");
        errorText.className = "status-text scenario-tree-empty";
        errorText.textContent = `Ordnerfehler: ${activeGroup.error}`;
        content.appendChild(errorText);
        return;
      }

      if (!activeGroup.items.length) {
        const emptyText = document.createElement("p");
        emptyText.className = "status-text scenario-tree-empty";
        emptyText.textContent = "Keine Tickets im ausgewählten Kurs.";
        content.appendChild(emptyText);
        return;
      }

      const courseUnlockSummary = getCourseUnlockSummary(activeGroup.folder, activeGroup.items);

      for (const item of activeGroup.items) {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "scenario-tree-ticket";
        option.title = String(item.label || "");
        option.setAttribute("aria-label", String(item.label || "Ticket"));
        if (item.folder === activeScenarioFolder && item.file === activeScenarioFile) {
          option.classList.add("is-active");
          option.setAttribute("aria-current", "true");
        }
        const ticketLabel = splitScenarioTicketLabel(item.label);
        const ticketIcon = normalizeScenarioItemFormat(item?.format || "", item?.file || "") === "markdown" ? "📝" : "🎫";
        const unlockMeta = getScenarioUnlockMeta(item, courseUnlockSummary);
        const ticketStatusLabel = unlockMeta.statusLabel;
        const ticketDetailLabel = String(unlockMeta.detailLabel || "").trim();
        const isLocked = unlockMeta.locked;
        if (isLocked) {
          option.classList.add("is-locked");
          option.disabled = true;
        }
        option.innerHTML =
          "<span class='scenario-tree-ticket-icon' aria-hidden='true'>" +
          ticketIcon +
          "</span>" +
          "<span class='scenario-tree-ticket-main'>" +
          "<span class='scenario-tree-ticket-meta'>" +
          (ticketLabel.badge
            ? `<span class='scenario-tree-ticket-badge'>${esc(ticketLabel.badge)}</span>`
            : "") +
          `<span class='scenario-tree-ticket-status' data-progress='${item.countsTowardProgress ? "true" : "false"}' data-state='${esc(isLocked ? "locked" : (unlockMeta.isNew ? "new" : (isUnlockableScenarioTicket(item) ? "open" : "info")))}'>${esc(ticketStatusLabel)}</span>` +
          (ticketDetailLabel
            ? `<span class='scenario-tree-ticket-status' data-state='progress'>${esc(ticketDetailLabel)}</span>`
            : "") +
          (unlockMeta.isNew
            ? `<span class='scenario-tree-ticket-status' data-state='new'>${esc(t("scenario.ticket.status.new", "Neu"))}</span>`
            : "") +
          "</span>" +
          `<span class='scenario-tree-ticket-title'>${esc(ticketLabel.title || item.label)}</span>` +
          "</span>";
        if (!isLocked) {
          option.addEventListener("click", () => {
            selectScenario(item);
          });
        }
        content.appendChild(option);
      }
    }

    function renderScenarioNavigation(groups) {
      renderTrainingMenu();
      renderCourseMenu(groups);
      renderScenarioMenu(groups);
      updateTrainingMenuButtonState(false);
      updateCourseMenuButtonState(false);
      updateScenarioMenuButtonState(false);
    }

    async function initScenarioSelector(options = {}) {
      if (!hasUnlockedAccess()) {
        availableScenarios = [];
        scenarioFolderSyncMetaByFolder = Object.create(null);
        renderScenarioNavigation([]);
        return;
      }
      if (!options?.skipCatalogRefresh) {
        await ensureScenarioFolderCatalogLoaded();
      }
      const folders = getUnlockedFolders();
      const loadedGroups = await Promise.all(folders.map(async (folder) => {
        try {
          const result = await loadScenarioManifestForFolder(folder);
          return { folder, items: result.items, sync: result.sync };
        } catch (err) {
          return { folder, items: [], error: err.message };
        }
      }));
      saveStoredScenarioMenuGroups(loadedGroups);
      const visibleGroups = loadedGroups
        .map((group) => ({
          ...group,
          items: filterScenarioItemsForEntries(group.items, group.folder)
        }))
        .filter((group) => group.error || group.items.length);
      availableScenarios = visibleGroups;
      renderScenarioNavigation(visibleGroups);
      refreshCourseUnlockSummariesInBackground(visibleGroups).catch(() => {});
    }

    function initAppBar() {
      applyThemeMode(loadThemeMode());
      applyTooltipPreference(loadTooltipPreference(), { skipPersist: true });
      syncPrimaryNavPlacement();
      syncIdeWorkspaceLayout();
      setAppBarSelection("");
      updateLocalhostChallengeVisibility();
      updateTrainingMenuButtonState(false);
      updateCourseMenuButtonState(false);
      updateScenarioMenuButtonState(false);
      updateTaskNavDrawerToggleState(false);
      updateTopRightMenuButtonUi();
      updateTooltipToggleUi();
      updateLanguageMenuButtonUi();
      observeInteractiveTooltipChanges();
      scheduleTooltipRefresh();
      window.__closeLeftDrawers = () => {
        toggleTrainingMenu(false).catch(() => {});
        toggleCourseMenu(false).catch(() => {});
        toggleScenarioMenu(false).catch(() => {});
        toggleTaskNavDrawer(false);
      };
      tooltipToggleBtn?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleTooltips();
      });
      topRightMenuButton?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleTopRightMenu();
      });
      topRightMenuPanel?.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
      themeToggleBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        cycleThemeMode();
      });
      languageMenuButton?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!topRightMenuOpen) {
          toggleTopRightMenu(true);
        }
        toggleLanguageMenu();
      });
      languageMenu?.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
      accessManagerButton.addEventListener("click", () => {
        toggleTopRightMenu(false);
        renderUnlockScreen();
      });
      homeButton.addEventListener("click", () => {
        if (!hasUnlockedAccess()) {
          renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
          return;
        }
        showHomeContent();
      });

      trainingMenuButton.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        toggleTopRightMenu(false);
        if (!hasUnlockedAccess()) {
          renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
          return;
        }
        await toggleTrainingMenu();
      });

      courseMenuButton.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        toggleTopRightMenu(false);
        if (!hasUnlockedAccess()) {
          renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
          return;
        }
        await toggleCourseMenu();
      });

      scenarioMenuButton.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        toggleTopRightMenu(false);
        if (!hasUnlockedAccess()) {
          renderUnlockScreen("Bitte zuerst gültigen Key eingeben.");
          return;
        }
        await toggleScenarioMenu();
      });

      if (presenterButton) {
        presenterButton.addEventListener("click", (ev) => {
          ev.stopPropagation();
          showPresenterHub().catch(() => {});
        });
      }

      if (challengeButton) {
        challengeButton.addEventListener("click", (ev) => {
          ev.stopPropagation();
          showLocalhostChallengeHub().catch(() => {});
        });
      }

      if (typeof desktopLeftAppBarQuery.addEventListener === "function") {
        desktopLeftAppBarQuery.addEventListener("change", syncPrimaryNavPlacement);
      } else if (typeof desktopLeftAppBarQuery.addListener === "function") {
        desktopLeftAppBarQuery.addListener(syncPrimaryNavPlacement);
      }

      window.addEventListener("resize", updateAppBarShellPath, { passive: true });

      trainingNavBackdrop.addEventListener("click", () => {
        toggleTrainingMenu(false).catch(() => {});
      });

      trainingMenuCloseButton.addEventListener("click", () => {
        toggleTrainingMenu(false).catch(() => {});
      });

      trainingMenu.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });

      courseNavBackdrop.addEventListener("click", () => {
        toggleCourseMenu(false).catch(() => {});
      });

      courseMenuCloseButton.addEventListener("click", () => {
        toggleCourseMenu(false).catch(() => {});
      });

      courseMenu.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });

      scenarioNavBackdrop.addEventListener("click", () => {
        toggleScenarioMenu(false).catch(() => {});
      });

      scenarioMenuCloseButton.addEventListener("click", () => {
        toggleScenarioMenu(false).catch(() => {});
      });

      scenarioMenu.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });

      taskNavDrawerToggleBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!scenarioData) return;
        toggleTaskNavDrawer();
      });

      taskNavDrawerCloseBtn.addEventListener("click", () => {
        toggleTaskNavDrawer(false);
      });

      taskNavBackdrop.addEventListener("click", () => {
        toggleTaskNavDrawer(false);
      });

      taskNavDrawer.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });

      document.addEventListener("click", () => {
        toggleTopRightMenu(false);
        toggleLanguageMenu(false);
        if (isDesktopActivityLayout()) return;
        toggleTrainingMenu(false).catch(() => {});
        toggleCourseMenu(false).catch(() => {});
        toggleScenarioMenu(false).catch(() => {});
      });

      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          toggleTopRightMenu(false);
          toggleLanguageMenu(false);
          toggleTrainingMenu(false).catch(() => {});
          toggleCourseMenu(false).catch(() => {});
          toggleScenarioMenu(false).catch(() => {});
          toggleTaskNavDrawer(false);
        }
      });
    }

    function normalizeVisualList(input) {
      if (Array.isArray(input)) return input.filter((item) => item && typeof item === "object");
      return input && typeof input === "object" ? [input] : [];
    }

    function appendVisualHeader(container, title, caption, eyebrow = "") {
      if (!title && !caption && !eyebrow) return;
      const head = document.createElement("div");
      head.className = "visual-block-head";
      if (eyebrow) {
        const eye = document.createElement("div");
        eye.className = "visual-block-eyebrow";
        eye.textContent = eyebrow;
        head.appendChild(eye);
      }
      if (title) {
        const heading = document.createElement("h4");
        heading.textContent = title;
        head.appendChild(heading);
      }
      if (caption) {
        const text = document.createElement("p");
        text.className = "visual-block-caption";
        text.textContent = caption;
        head.appendChild(text);
      }
      container.appendChild(head);
    }

    function appendVisualNote(container, note) {
      if (!note) return;
      const text = document.createElement("p");
      text.className = "visual-block-note";
      text.textContent = note;
      container.appendChild(text);
    }

    function buildVisualTable(columns, rows) {
      const scroll = document.createElement("div");
      scroll.className = "visual-table-scroll";
      const table = document.createElement("table");
      table.className = "visual-table";
      if (Array.isArray(columns) && columns.length) {
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        columns.forEach((column) => {
          const th = document.createElement("th");
          appendInlineText(th, column || "");
          headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);
      }
      const body = document.createElement("tbody");
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        const tr = document.createElement("tr");
        (Array.isArray(row) ? row : []).forEach((cell) => {
          const td = document.createElement("td");
          appendInlineText(td, cell ?? "");
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.appendChild(body);
      scroll.appendChild(table);
      return scroll;
    }

    function createVisualShell(visual, extraClass = "") {
      const block = document.createElement("section");
      block.className = `visual-block${extraClass ? ` ${extraClass}` : ""}`;
      appendVisualHeader(block, visual.title || "", visual.caption || "", visual.eyebrow || "");
      return block;
    }

    function renderTableVisual(visual) {
      const block = createVisualShell(visual, "visual-block-table");
      block.appendChild(buildVisualTable(visual.columns, visual.rows));
      appendVisualNote(block, visual.note || "");
      return block;
    }

    function renderTableGroupVisual(visual) {
      const block = createVisualShell(visual, "visual-block-table-group");
      const buildTableCard = (entry) => {
        const card = document.createElement("section");
        card.className = "visual-subcard";
        if (entry?.title) {
          const heading = document.createElement("h5");
          heading.textContent = entry.title;
          card.appendChild(heading);
        }
        card.appendChild(buildVisualTable(entry?.columns, entry?.rows));
        return card;
      };

      if (Array.isArray(visual.tableRows) && visual.tableRows.length) {
        const rowsWrap = document.createElement("div");
        rowsWrap.className = "visual-table-group-rows";
        visual.tableRows.forEach((rowEntries) => {
          const row = document.createElement("div");
          row.className = "visual-table-group-row";
          const entries = Array.isArray(rowEntries) ? rowEntries : [];
          row.dataset.columns = String(entries.length || 1);
          entries.forEach((entry) => {
            row.appendChild(buildTableCard(entry));
          });
          rowsWrap.appendChild(row);
        });
        block.appendChild(rowsWrap);
      } else {
        const grid = document.createElement("div");
        grid.className = "visual-grid";
        (Array.isArray(visual.tables) ? visual.tables : []).forEach((entry) => {
          grid.appendChild(buildTableCard(entry));
        });
        block.appendChild(grid);
      }
      appendVisualNote(block, visual.note || "");
      return block;
    }

    const PYTHON_CODE_KEYWORDS = new Set([
      "and", "as", "break", "class", "continue", "def", "elif", "else", "False",
      "for", "if", "in", "is", "None", "not", "or", "pass", "return", "True",
      "while"
    ]);

    const PYTHON_CODE_BUILTINS = new Set([
      "append", "enumerate", "len", "list", "max", "min", "print", "range"
    ]);

    const JAVA_CODE_KEYWORDS = new Set([
      "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class",
      "const", "continue", "default", "do", "double", "else", "enum", "extends", "final",
      "finally", "float", "for", "if", "implements", "import", "instanceof", "int",
      "interface", "long", "native", "new", "null", "package", "private", "protected",
      "public", "return", "short", "static", "strictfp", "super", "switch", "synchronized",
      "this", "throw", "throws", "transient", "true", "try", "void", "volatile", "while"
    ]);

    const JAVA_CODE_BUILTINS = new Set([
      "ArrayList", "Arrays", "Integer", "List", "Math", "Object", "Objects", "String",
      "System", "assertEquals", "assertFalse", "assertNotNull", "assertNull", "assertThrows",
      "assertTrue", "fail", "Test"
    ]);

    const SQL_CODE_KEYWORDS = new Set([
      "ADD", "ALL", "ALTER", "AND", "AS", "ASC", "AVG", "BETWEEN", "BY", "COUNT", "CREATE",
      "DELETE", "DESC", "DISTINCT", "DROP", "EXISTS", "FROM", "GRANT", "GROUP", "HAVING",
      "IN", "INDEX", "INNER", "INSERT", "INTO", "IS", "JOIN", "LEFT", "LIKE", "NOT", "NULL",
      "ON", "OR", "ORDER", "OUTER", "REVOKE", "RIGHT", "ROUND", "SELECT", "SET", "SUM",
      "TABLE", "TO", "UNIQUE", "UPDATE", "USER", "VALUES", "WHERE", "WITH"
    ]);

    const SQL_CODE_BUILTINS = new Set([
      "COUNT", "DAYNAME", "MAX", "MIN", "MONTH", "ROUND", "SUM", "YEAR"
    ]);

    function appendCodeToken(container, type, value) {
      if (!value) return;
      if (!type || type === "plain") {
        container.appendChild(document.createTextNode(value));
        return;
      }
      const span = document.createElement("span");
      span.className = `code-token token-${type}`;
      span.textContent = value;
      container.appendChild(span);
    }

    function resolveCodeLanguage(code, language = "") {
      const explicit = String(language || "").trim().toLowerCase();
      if (explicit === "py") return "python";
      if (explicit === "pseudo" || explicit === "pseudocode") return "python";
      if (explicit === "python" || explicit === "java" || explicit === "sql") return explicit;
      const source = String(code || "");
      if (!source) return "";
      if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|GRANT|REVOKE|WITH)\b/im.test(source) &&
          /\b(FROM|INTO|TABLE|USER|ON|JOIN|WHERE|GROUP\s+BY|ORDER\s+BY)\b/i.test(source)) {
        return "sql";
      }
      if (/^\s*@\w+/m.test(source) || /\b(assertEquals|assertTrue|assertFalse)\b/.test(source)) return "java";
      if (/\b(?:public|private|protected|static|final)?\s*(?:void|int|long|double|float|boolean|char|byte|short|String)\s+[A-Za-z_]\w*\s*\([^)]*\)\s*\{/m.test(source)) return "java";
      return "";
    }

    function appendPythonHighlightedCode(container, source) {
      let index = 0;
      while (index < source.length) {
        const current = source[index];
        if (current === "#") {
          let end = index + 1;
          while (end < source.length && source[end] !== "\n") end += 1;
          appendCodeToken(container, "comment", source.slice(index, end));
          index = end;
          continue;
        }
        if (current === "'" || current === "\"") {
          const quote = current;
          let end = index + 1;
          while (end < source.length) {
            if (source[end] === "\\") {
              end += 2;
              continue;
            }
            if (source[end] === quote) {
              end += 1;
              break;
            }
            end += 1;
          }
          appendCodeToken(container, "string", source.slice(index, end));
          index = end;
          continue;
        }
        if (/[A-Za-z_]/.test(current)) {
          let end = index + 1;
          while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
          const word = source.slice(index, end);
          let type = "plain";
          if (PYTHON_CODE_KEYWORDS.has(word)) type = "keyword";
          else if (PYTHON_CODE_BUILTINS.has(word)) type = "builtin";
          else if (/^[A-Z]/.test(word)) type = "type";
          appendCodeToken(container, type, word);
          index = end;
          continue;
        }
        if (/[0-9]/.test(current)) {
          let end = index + 1;
          while (end < source.length && /[0-9_.]/.test(source[end])) end += 1;
          appendCodeToken(container, "number", source.slice(index, end));
          index = end;
          continue;
        }
        if ("=+-*/%<>![](){}:.,;".includes(current)) {
          let end = index + 1;
          if (end < source.length && "=<>".includes(source[end]) && "=<>!".includes(current)) end += 1;
          appendCodeToken(container, "operator", source.slice(index, end));
          index = end;
          continue;
        }
        appendCodeToken(container, "plain", current);
        index += 1;
      }
    }

    function appendJavaHighlightedCode(container, source) {
      let index = 0;
      while (index < source.length) {
        const current = source[index];
        const next = source[index + 1] || "";
        if (current === "/" && next === "/") {
          let end = index + 2;
          while (end < source.length && source[end] !== "\n") end += 1;
          appendCodeToken(container, "comment", source.slice(index, end));
          index = end;
          continue;
        }
        if (current === "/" && next === "*") {
          let end = index + 2;
          while (end < source.length - 1 && !(source[end] === "*" && source[end + 1] === "/")) end += 1;
          end = Math.min(source.length, end + 2);
          appendCodeToken(container, "comment", source.slice(index, end));
          index = end;
          continue;
        }
        if (current === "'" || current === "\"") {
          const quote = current;
          let end = index + 1;
          while (end < source.length) {
            if (source[end] === "\\") {
              end += 2;
              continue;
            }
            if (source[end] === quote) {
              end += 1;
              break;
            }
            end += 1;
          }
          appendCodeToken(container, "string", source.slice(index, end));
          index = end;
          continue;
        }
        if (current === "@") {
          let end = index + 1;
          while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
          appendCodeToken(container, "builtin", source.slice(index, end));
          index = end;
          continue;
        }
        if (/[A-Za-z_]/.test(current)) {
          let end = index + 1;
          while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
          const word = source.slice(index, end);
          let type = "plain";
          if (JAVA_CODE_KEYWORDS.has(word)) type = "keyword";
          else if (JAVA_CODE_BUILTINS.has(word)) type = "builtin";
          else if (/^[A-Z]/.test(word)) type = "type";
          appendCodeToken(container, type, word);
          index = end;
          continue;
        }
        if (/[0-9]/.test(current)) {
          let end = index + 1;
          while (end < source.length && /[0-9_.]/.test(source[end])) end += 1;
          appendCodeToken(container, "number", source.slice(index, end));
          index = end;
          continue;
        }
        if ("=+-*/%<>![](){}:.,;?&|".includes(current)) {
          let end = index + 1;
          if (end < source.length && "=<>!&|+-".includes(source[end]) && "=<>!&|+-".includes(current)) end += 1;
          appendCodeToken(container, "operator", source.slice(index, end));
          index = end;
          continue;
        }
        appendCodeToken(container, "plain", current);
        index += 1;
      }
    }

    function appendSqlHighlightedCode(container, source) {
      let index = 0;
      while (index < source.length) {
        const current = source[index];
        const next = source[index + 1] || "";
        if (current === "-" && next === "-") {
          let end = index + 2;
          while (end < source.length && source[end] !== "\n") end += 1;
          appendCodeToken(container, "comment", source.slice(index, end));
          index = end;
          continue;
        }
        if (current === "/" && next === "*") {
          let end = index + 2;
          while (end < source.length - 1 && !(source[end] === "*" && source[end + 1] === "/")) end += 1;
          end = Math.min(source.length, end + 2);
          appendCodeToken(container, "comment", source.slice(index, end));
          index = end;
          continue;
        }
        if (current === "'" || current === "\"") {
          const quote = current;
          let end = index + 1;
          while (end < source.length) {
            if (source[end] === "\\") {
              end += 2;
              continue;
            }
            if (source[end] === quote) {
              end += 1;
              break;
            }
            end += 1;
          }
          appendCodeToken(container, "string", source.slice(index, end));
          index = end;
          continue;
        }
        if (/[A-Za-z_]/.test(current)) {
          let end = index + 1;
          while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
          const word = source.slice(index, end);
          const upperWord = word.toUpperCase();
          let type = "plain";
          if (SQL_CODE_KEYWORDS.has(upperWord)) type = "keyword";
          else if (SQL_CODE_BUILTINS.has(upperWord)) type = "builtin";
          appendCodeToken(container, type, word);
          index = end;
          continue;
        }
        if (/[0-9]/.test(current)) {
          let end = index + 1;
          while (end < source.length && /[0-9_.]/.test(source[end])) end += 1;
          appendCodeToken(container, "number", source.slice(index, end));
          index = end;
          continue;
        }
        if ("=+-*/%<>![](){}:.,;?".includes(current)) {
          let end = index + 1;
          if (end < source.length && "=<>!".includes(source[end]) && "=<>!".includes(current)) end += 1;
          appendCodeToken(container, "operator", source.slice(index, end));
          index = end;
          continue;
        }
        appendCodeToken(container, "plain", current);
        index += 1;
      }
    }

    function appendHighlightedCode(container, code, language = "") {
      const source = String(code || "");
      const lang = resolveCodeLanguage(source, language);
      if (!source) return;
      if (lang === "python") {
        appendPythonHighlightedCode(container, source);
        return;
      }
      if (lang === "java") {
        appendJavaHighlightedCode(container, source);
        return;
      }
      if (lang === "sql") {
        appendSqlHighlightedCode(container, source);
        return;
      }
      if (!lang) {
        container.textContent = source;
        return;
      }
      container.textContent = source;
    }

    function buildHighlightedCodeBlock(code, language = "", className = "visual-code") {
      const pre = document.createElement("pre");
      pre.className = className;
      const codeEl = document.createElement("code");
      if (language) {
        codeEl.dataset.language = language;
        codeEl.className = `language-${language}`;
      }
      appendHighlightedCode(codeEl, code, language);
      pre.appendChild(codeEl);
      return pre;
    }

    function buildHighlightedCodeEditor(textarea, language = "") {
      const editor = document.createElement("div");
      editor.className = "short-text-code-editor";

      const preview = document.createElement("pre");
      preview.className = "short-text-code-preview";
      const codeEl = document.createElement("code");
      if (language) {
        codeEl.dataset.language = language;
        codeEl.className = `language-${language}`;
      }
      preview.appendChild(codeEl);

      textarea.classList.add("short-text-code", "short-text-code-input");
      textarea.spellcheck = false;
      textarea.wrap = "off";

      const syncScroll = () => {
        preview.scrollTop = textarea.scrollTop;
        preview.scrollLeft = textarea.scrollLeft;
      };

      const refresh = () => {
        codeEl.innerHTML = "";
        appendHighlightedCode(codeEl, textarea.value, language);
        textarea.style.height = "0px";
        const nextHeight = Math.max(280, textarea.scrollHeight);
        editor.style.height = `${nextHeight}px`;
        textarea.style.height = `${nextHeight}px`;
        preview.style.minHeight = `${nextHeight}px`;
        syncScroll();
      };

      textarea.addEventListener("scroll", syncScroll);
      textarea.addEventListener("input", refresh);

      editor.append(preview, textarea);
      refresh();
      return { editor, refresh };
    }

    const SVG_NS = "http://www.w3.org/2000/svg";

    function createSvgNode(tag, attrs = {}) {
      const node = document.createElementNS(SVG_NS, tag);
      Object.entries(attrs || {}).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        node.setAttribute(key, String(value));
      });
      return node;
    }

    function buildChoiceErmDiagram(diagram) {
      const wrap = document.createElement("div");
      wrap.className = "choice-erm";
      const width = Math.max(320, Number(diagram?.width) || 760);
      const height = Math.max(220, Number(diagram?.height) || 360);
      const headerHeight = 30;
      const fieldHeight = 18;
      const bodyPadding = 8;
      const svg = createSvgNode("svg", {
        class: "choice-erm-svg",
        viewBox: `0 0 ${width} ${height}`,
        preserveAspectRatio: "xMidYMid meet",
        "aria-hidden": "true"
      });

      const entityMap = new Map();
      (Array.isArray(diagram?.entities) ? diagram.entities : []).forEach((entity, index) => {
        const fields = Array.isArray(entity?.fields)
          ? entity.fields.map((field) => String(field || "")).filter(Boolean)
          : [];
        const x = Number(entity?.x) || 20 + (index * 180);
        const y = Number(entity?.y) || 20;
        const boxWidth = Number(entity?.width) || 200;
        const boxHeight = headerHeight + bodyPadding * 2 + Math.max(1, fields.length) * fieldHeight;
        entityMap.set(String(entity?.id || `entity_${index}`), {
          id: String(entity?.id || `entity_${index}`),
          title: String(entity?.title || "").trim(),
          fields,
          x,
          y,
          width: boxWidth,
          height: boxHeight,
          centerX: x + boxWidth / 2,
          centerY: y + boxHeight / 2
        });
      });

      const getAnchorPoint = (entity, side) => {
        if (side === "left") return { x: entity.x, y: entity.centerY };
        if (side === "right") return { x: entity.x + entity.width, y: entity.centerY };
        if (side === "top") return { x: entity.centerX, y: entity.y };
        return { x: entity.centerX, y: entity.y + entity.height };
      };

      const getRelationSides = (from, to) => {
        const horizontalGap = Math.max(
          to.x - (from.x + from.width),
          from.x - (to.x + to.width),
          0
        );
        const verticalGap = Math.max(
          to.y - (from.y + from.height),
          from.y - (to.y + to.height),
          0
        );
        if (verticalGap > horizontalGap) {
          return from.centerY <= to.centerY
            ? { fromSide: "bottom", toSide: "top" }
            : { fromSide: "top", toSide: "bottom" };
        }
        return from.centerX <= to.centerX
          ? { fromSide: "right", toSide: "left" }
          : { fromSide: "left", toSide: "right" };
      };

      const getLabelOffset = (side, distance) => {
        if (side === "left") return { x: -distance, y: -6 };
        if (side === "right") return { x: distance, y: -6 };
        if (side === "top") return { x: 0, y: -distance };
        return { x: 0, y: distance + 4 };
      };

      (Array.isArray(diagram?.relations) ? diagram.relations : []).forEach((relation) => {
        const from = entityMap.get(String(relation?.from || ""));
        const to = entityMap.get(String(relation?.to || ""));
        if (!from || !to) return;
        const { fromSide, toSide } = getRelationSides(from, to);
        const start = getAnchorPoint(from, fromSide);
        const end = getAnchorPoint(to, toSide);
        const horizontal = fromSide === "left" || fromSide === "right";
        const bend = horizontal
          ? Math.max(24, Math.abs(end.x - start.x) * 0.22)
          : Math.max(24, Math.abs(end.y - start.y) * 0.22);
        const cp1 = horizontal
          ? { x: start.x + (fromSide === "right" ? bend : -bend), y: start.y }
          : { x: start.x, y: start.y + (fromSide === "bottom" ? bend : -bend) };
        const cp2 = horizontal
          ? { x: end.x + (toSide === "left" ? -bend : bend), y: end.y }
          : { x: end.x, y: end.y + (toSide === "top" ? -bend : bend) };
        const path = createSvgNode("path", {
          d: `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`,
          class: "choice-erm-relation"
        });
        svg.appendChild(path);

        const addLabel = (textValue, x, y, className) => {
          if (!textValue) return;
          const label = createSvgNode("text", { x, y, class: className });
          label.textContent = String(textValue);
          svg.appendChild(label);
        };

        const startOffset = getLabelOffset(fromSide, 14);
        const endOffset = getLabelOffset(toSide, 14);
        addLabel(relation?.fromCard, start.x + startOffset.x, start.y + startOffset.y, "choice-erm-cardinality");
        addLabel(relation?.toCard, end.x + endOffset.x, end.y + endOffset.y, "choice-erm-cardinality");
        if (relation?.label) {
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          addLabel(
            relation.label,
            midX + (horizontal ? 0 : 16),
            midY + (horizontal ? -12 : 0),
            "choice-erm-label"
          );
        }
      });

      entityMap.forEach((entity) => {
        const group = createSvgNode("g", { class: "choice-erm-entity" });
        group.appendChild(createSvgNode("rect", {
          x: entity.x,
          y: entity.y,
          width: entity.width,
          height: entity.height,
          rx: 12,
          class: "choice-erm-box"
        }));
        group.appendChild(createSvgNode("rect", {
          x: entity.x,
          y: entity.y,
          width: entity.width,
          height: headerHeight,
          rx: 12,
          class: "choice-erm-box-head"
        }));
        group.appendChild(createSvgNode("line", {
          x1: entity.x,
          y1: entity.y + headerHeight,
          x2: entity.x + entity.width,
          y2: entity.y + headerHeight,
          class: "choice-erm-divider"
        }));
        const title = createSvgNode("text", {
          x: entity.x + entity.width / 2,
          y: entity.y + 20,
          class: "choice-erm-title"
        });
        title.textContent = entity.title;
        group.appendChild(title);

        entity.fields.forEach((field, index) => {
          const fieldText = createSvgNode("text", {
            x: entity.x + 14,
            y: entity.y + headerHeight + bodyPadding + 12 + index * fieldHeight,
            class: [
              "choice-erm-field",
              field.startsWith("PK ") ? "choice-erm-field-pk" : "",
              field.startsWith("FK ") ? "choice-erm-field-fk" : ""
            ].filter(Boolean).join(" ")
          });
          fieldText.textContent = field;
          group.appendChild(fieldText);
        });
        svg.appendChild(group);
      });

      wrap.appendChild(svg);
      return wrap;
    }

    function getChoiceOptionDisplayText(option, index = 0) {
      if (typeof option === "string") return option;
      if (!option || typeof option !== "object") return `Option ${index + 1}`;
      if (option.label) return String(option.label);
      if (option.text) return String(option.text);
      const code = String(option.code || "").trim();
      if (code) return code.split("\n").map((line) => line.trim()).find(Boolean) || `Option ${index + 1}`;
      return `Option ${index + 1}`;
    }

    function buildCodeCard(entry) {
      const card = document.createElement("section");
      card.className = "visual-subcard";
      if (entry?.title) {
        const heading = document.createElement("h5");
        heading.textContent = entry.title;
        card.appendChild(heading);
      }
      card.appendChild(buildHighlightedCodeBlock(entry?.code || "", entry?.language || "", "visual-code"));
      return card;
    }

    function renderCodeBlockVisual(visual) {
      const block = createVisualShell(visual, "visual-block-code");
      block.appendChild(buildCodeCard({
        title: visual.codeTitle || "",
        code: visual.code || "",
        language: visual.language || ""
      }));
      appendVisualNote(block, visual.note || "");
      return block;
    }

    function renderCodeCompareVisual(visual) {
      const block = createVisualShell(visual, "visual-block-code-compare");
      const grid = document.createElement("div");
      grid.className = "visual-grid";
      (Array.isArray(visual.blocks) ? visual.blocks : []).forEach((entry) => {
        grid.appendChild(buildCodeCard(entry));
      });
      block.appendChild(grid);
      appendVisualNote(block, visual.note || "");
      return block;
    }

    function renderDocumentVisual(visual) {
      const block = createVisualShell(visual, "visual-block-document");
      if (visual?.layout === "letter_sheet") {
        const paper = document.createElement("article");
        paper.className = "document-paper";

        if (visual.documentTitle) {
          const title = document.createElement("h5");
          title.className = "document-paper-title";
          title.textContent = String(visual.documentTitle || "");
          paper.appendChild(title);
        }

        const top = document.createElement("div");
        top.className = "document-paper-top";

        const leftColumn = document.createElement("div");
        leftColumn.className = "document-paper-column";
        const rightColumn = document.createElement("div");
        rightColumn.className = "document-paper-column";

        const appendField = (container, entry) => {
          if (!entry || typeof entry !== "object") return;
          const field = document.createElement("section");
          field.className = "document-paper-field";
          if (entry.label) {
            const label = document.createElement("div");
            label.className = "document-paper-label";
            label.textContent = String(entry.label || "");
            field.appendChild(label);
          }
          if (entry.value) {
            const value = document.createElement("div");
            value.className = "document-paper-value";
            value.textContent = String(entry.value || "");
            field.appendChild(value);
          }
          if (Array.isArray(entry.lines) && entry.lines.length) {
            const lines = document.createElement("div");
            lines.className = "document-paper-lines";
            entry.lines.forEach((line) => {
              const row = document.createElement("div");
              row.textContent = String(line || "");
              lines.appendChild(row);
            });
            field.appendChild(lines);
          }
          container.appendChild(field);
        };

        appendField(leftColumn, visual.identifier);
        (Array.isArray(visual.leftSections) ? visual.leftSections : []).forEach((entry) => {
          appendField(leftColumn, entry);
        });
        (Array.isArray(visual.rightSections) ? visual.rightSections : []).forEach((entry) => {
          appendField(rightColumn, entry);
        });

        top.append(leftColumn, rightColumn);
        paper.appendChild(top);

        const body = document.createElement("div");
        body.className = "document-paper-body";
        if (visual.salutation) {
          const salutation = document.createElement("p");
          salutation.className = "document-paper-salutation";
          salutation.textContent = String(visual.salutation || "");
          body.appendChild(salutation);
        }
        if (visual.bodyLead) {
          const lead = document.createElement("p");
          lead.textContent = String(visual.bodyLead || "");
          body.appendChild(lead);
        }
        if (Array.isArray(visual.entries) && visual.entries.length) {
          const entries = document.createElement("div");
          entries.className = "document-paper-entries";
          visual.entries.forEach((entry) => {
            const row = document.createElement("div");
            row.textContent = String(entry || "");
            entries.appendChild(row);
          });
          body.appendChild(entries);
        }
        if (visual.signoff) {
          const signoff = document.createElement("p");
          signoff.className = "document-paper-signoff";
          signoff.textContent = String(visual.signoff || "");
          body.appendChild(signoff);
        }
        paper.appendChild(body);
        block.appendChild(paper);
        appendVisualNote(block, visual.note || "");
        return block;
      }
      if (Array.isArray(visual.badges) && visual.badges.length) {
        const badges = document.createElement("div");
        badges.className = "visual-badges";
        visual.badges.forEach((badge) => {
          const chip = document.createElement("span");
          chip.className = "visual-badge";
          chip.textContent = String(badge || "");
          badges.appendChild(chip);
        });
        block.appendChild(badges);
      }
      if (Array.isArray(visual.facts) && visual.facts.length) {
        const facts = document.createElement("div");
        facts.className = "visual-facts";
        visual.facts.forEach((fact) => {
          const item = document.createElement("div");
          item.className = "visual-fact";
          const label = document.createElement("div");
          label.className = "visual-fact-label";
          label.textContent = String(fact?.label || "");
          const value = document.createElement("div");
          value.className = "visual-fact-value";
          value.textContent = String(fact?.value || "");
          item.append(label, value);
          facts.appendChild(item);
        });
        block.appendChild(facts);
      }
      if (Array.isArray(visual.sections) && visual.sections.length) {
        const grid = document.createElement("div");
        grid.className = "visual-grid";
        visual.sections.forEach((section) => {
          const card = document.createElement("section");
          card.className = "visual-subcard";
          if (section?.title) {
            const heading = document.createElement("h5");
            heading.textContent = section.title;
            card.appendChild(heading);
          }
          if (Array.isArray(section?.lines) && section.lines.length) {
            const lines = document.createElement("div");
            lines.className = "visual-lines";
            section.lines.forEach((line) => {
              const row = document.createElement("div");
              row.textContent = String(line || "");
              lines.appendChild(row);
            });
            card.appendChild(lines);
          }
          if (Array.isArray(section?.items) && section.items.length) {
            const list = document.createElement("ul");
            list.className = "visual-list";
            section.items.forEach((item) => {
              const li = document.createElement("li");
              li.textContent = String(item || "");
              list.appendChild(li);
            });
            card.appendChild(list);
          }
          grid.appendChild(card);
        });
        block.appendChild(grid);
      }
      appendVisualNote(block, visual.note || "");
      return block;
    }

    function renderVisualBlock(visual) {
      const type = String(visual?.type || "").trim();
      if (type === "table") return renderTableVisual(visual);
      if (type === "table_group") return renderTableGroupVisual(visual);
      if (type === "code_block") return renderCodeBlockVisual(visual);
      if (type === "code_compare") return renderCodeCompareVisual(visual);
      if (type === "document_card") return renderDocumentVisual(visual);
      return null;
    }

    function renderVisuals(input) {
      const visuals = normalizeVisualList(input);
      if (!visuals.length) return null;
      const stack = document.createElement("div");
      stack.className = "visual-stack";
      visuals.forEach((visual) => {
        const block = renderVisualBlock(visual);
        if (block) stack.appendChild(block);
      });
      return stack.childElementCount ? stack : null;
    }

    function appendInlineText(container, text) {
      const value = String(text ?? "");
      value.split(/(`[^`]+`)/g).forEach((part) => {
        if (!part) return;
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          const code = document.createElement("code");
          code.className = "inline-code";
          code.textContent = part.slice(1, -1);
          container.appendChild(code);
          return;
        }
        container.appendChild(document.createTextNode(part));
      });
    }

    function appendPlainText(container, text) {
      container.appendChild(document.createTextNode(String(text ?? "")));
    }

    function renderPromptText(text) {
      if (!text) return null;
      const block = document.createElement("div");
      block.className = "question-prompt";
      const lines = String(text).replace(/\r\n/g, "\n").split("\n");
      let paragraph = [];
      let listItems = [];
      let currentListIndex = null;

      const flushParagraph = () => {
        if (!paragraph.length) return;
        const entry = document.createElement("p");
        entry.className = "question-paragraph";
        appendPlainText(entry, paragraph.join(" ").replace(/\s+/g, " ").trim());
        block.appendChild(entry);
        paragraph = [];
      };

      const flushList = () => {
        if (!listItems.length) return;
        const list = document.createElement("ul");
        list.className = "question-list";
        listItems.forEach((item) => {
          const li = document.createElement("li");
          appendPlainText(li, item);
          list.appendChild(li);
        });
        block.appendChild(list);
        listItems = [];
        currentListIndex = null;
      };

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          flushParagraph();
          flushList();
          return;
        }
        if (trimmed.startsWith("- ")) {
          flushParagraph();
          listItems.push(trimmed.slice(2));
          currentListIndex = listItems.length - 1;
          return;
        }
        if (/^\s+/.test(line) && currentListIndex !== null) {
          listItems[currentListIndex] = `${listItems[currentListIndex]} ${trimmed}`.trim();
          return;
        }
        flushList();
        paragraph.push(trimmed);
      });

      flushParagraph();
      flushList();
      return block;
    }

    function splitQuestionPromptContext(q) {
      const rawContext = String(q?.context || "").trim();
      const rawPrompt = String(q?.prompt || "").trim();
      if (!rawContext) {
        return {
          contextText: "",
          promptText: rawPrompt
        };
      }
      if (!rawPrompt) {
        return {
          contextText: rawContext,
          promptText: ""
        };
      }

      const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
      const normalizedContext = normalize(rawContext);
      const normalizedPrompt = normalize(rawPrompt);
      if (!normalizedContext) {
        return {
          contextText: "",
          promptText: rawPrompt
        };
      }
      if (normalizedPrompt === normalizedContext) {
        return {
          contextText: rawContext,
          promptText: ""
        };
      }
      if (rawPrompt.startsWith(rawContext)) {
        return {
          contextText: rawContext,
          promptText: rawPrompt.slice(rawContext.length).replace(/^[\s:.-]+/, "").trim()
        };
      }
      if (normalizedPrompt.startsWith(normalizedContext)) {
        return {
          contextText: rawContext,
          promptText: normalizedPrompt.slice(normalizedContext.length).replace(/^[\s:.-]+/, "").trim()
        };
      }
      return {
        contextText: rawContext,
        promptText: rawPrompt
      };
    }

    function renderQuestionContent(q) {
      const stack = document.createElement("div");
      stack.className = "question-content";
      const blocks = Array.isArray(q?.contentBlocks)
        ? q.contentBlocks.filter((item) => item && typeof item === "object")
        : [];
      if (blocks.length) {
        blocks.forEach((block) => {
          const type = String(block?.type || "text").trim();
          if (type === "text") {
            const text = renderPromptText(block.text || "");
            if (text) stack.appendChild(text);
            return;
          }
          const visual = renderVisualBlock(block);
          if (visual) stack.appendChild(visual);
        });
        return stack.childElementCount ? stack : null;
      }
      const visuals = renderVisuals(q?.visuals);
      if (visuals) stack.appendChild(visuals);
      const { contextText, promptText } = splitQuestionPromptContext(q);
      const context = renderPromptText(contextText);
      if (context) {
        context.classList.add("question-context");
        stack.appendChild(context);
      }
      const prompt = renderPromptText(promptText);
      if (prompt) stack.appendChild(prompt);
      return stack.childElementCount ? stack : null;
    }

    function createRequestLetter(data, headingText = "", headingKey = "") {
      const letter = document.createElement("div");
      letter.className = "request-letter";
      const heading = document.createElement("h3");
      const resolvedHeading = headingText || t("scenario.request.heading.customer", "Kundenanfrage");
      const resolvedHeadingKey = headingKey || (!headingText ? "scenario.request.heading.customer" : "");
      heading.textContent = resolvedHeading;
      if (resolvedHeadingKey) heading.setAttribute("data-i18n-key", resolvedHeadingKey);
      letter.appendChild(heading);
      const meta = document.createElement("div");
      meta.className = "request-meta";
      const metaRows = [
        ["scenario.request.meta.from", "Von:", data?.from || "-"],
        ["scenario.request.meta.to", "An:", data?.to || "-"],
        ["scenario.request.meta.subject", "Betreff:", data?.subject || "-"],
        ["scenario.request.meta.date", "Datum:", data?.date || "-"]
      ];
      metaRows.forEach(([labelKey, labelText, valueText]) => {
        const row = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = labelText;
        strong.setAttribute("data-i18n-key", labelKey);
        row.appendChild(strong);
        row.append(` ${valueText}`);
        meta.appendChild(row);
      });
      letter.appendChild(meta);
      const body = document.createElement("div");
      body.className = "request-body";
      if (data?.body || data?.prompt) {
        body.textContent = data?.body || data?.prompt || "";
      } else {
        body.textContent = t("scenario.request.body.empty", "Keine Kundenanfrage hinterlegt.");
        body.setAttribute("data-i18n-key", "scenario.request.body.empty");
      }
      letter.appendChild(body);
      const visuals = renderVisuals(data?.visuals);
      if (visuals) letter.appendChild(visuals);
      return letter;
    }

    function createScenarioPanel(data) {
      const panel = document.createElement("section");
      panel.className = "panel";
      const s = data.scenario || {};
      const st = s.station || {};
      const req = s.customerRequest || {};
      panel.innerHTML =
        `<div class="meta-grid">` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.customer">${esc(t("scenario.panel.meta.customer", "Kunde"))}</strong>${esc(s.company || "")}</div>` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.size">${esc(t("scenario.panel.meta.size", "Groesse"))}</strong>${esc(s.scale || "")}</div>` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.context">${esc(t("scenario.panel.meta.context", "Einsatzkontext"))}</strong>${esc(s.context || "")}</div>` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.order">${esc(t("scenario.panel.meta.order", "Auftrag"))}</strong>${esc(s.mission || "")}</div>` +
        `</div>` +
        `<div class="meta-grid meta-grid-spaced">` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.ticket_id">${esc(t("scenario.panel.meta.ticket_id", "Ticket-ID"))}</strong>${esc(st.id || "")}</div>` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.department">${esc(t("scenario.panel.meta.department", "Bereich"))}</strong>${esc(st.department || "")}</div>` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.profile">${esc(t("scenario.panel.meta.profile", "Profil"))}</strong>${esc(st.profile || "")}</div>` +
        `<div class="meta-card"><strong data-i18n-key="scenario.panel.meta.constraints">${esc(t("scenario.panel.meta.constraints", "Randbedingungen"))}</strong><ul class="constraint-list">${(st.constraints || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` +
        `</div>`;
      panel.appendChild(createRequestLetter(req, t("scenario.request.heading.customer", "Kundenanfrage"), "scenario.request.heading.customer"));
      return panel;
    }

    function renderSingleChoice(q) {
      const wrap = document.createElement("div");
      (q.options || []).forEach((o, idx) => {
        const row = document.createElement("label");
        row.className = "choice-row";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = q.id;
        radio.value = String(idx);
        radio.dataset.qid = q.id;
        radio.dataset.optionIndex = String(idx);
        radio.addEventListener("change", () => {
          answers[q.id] = Number(radio.value);
          markQuestionTouched(q.id);
        });
        row.appendChild(radio);
        const labelText = document.createElement("div");
        labelText.className = "choice-option";
        if (o && typeof o === "object" && o.diagram?.type === "erm") {
          row.classList.add("choice-row-diagram");
          if (o.label) {
            const choiceLabel = document.createElement("div");
            choiceLabel.className = "choice-code-label";
            choiceLabel.textContent = String(o.label);
            labelText.appendChild(choiceLabel);
          }
          labelText.appendChild(buildChoiceErmDiagram(o.diagram));
          if (o.text) {
            const caption = document.createElement("div");
            caption.className = "choice-diagram-caption";
            appendPlainText(caption, o.text || "");
            labelText.appendChild(caption);
          }
        } else if (o && typeof o === "object" && o.code) {
          row.classList.add("choice-row-code");
          if (o.label) {
            const choiceLabel = document.createElement("div");
            choiceLabel.className = "choice-code-label";
            choiceLabel.textContent = String(o.label);
            labelText.appendChild(choiceLabel);
          }
          labelText.appendChild(buildHighlightedCodeBlock(o.code || "", o.language || "", "choice-code"));
          if (o.text) {
            const caption = document.createElement("div");
            caption.className = "choice-code-caption";
            appendPlainText(caption, o.text || "");
            labelText.appendChild(caption);
          }
        } else {
          appendPlainText(labelText, typeof o === "string" ? o : o?.text || "");
        }
        row.appendChild(labelText);
        wrap.appendChild(row);
      });
      return wrap;
    }

    function renderMultiSelect(q) {
      const wrap = document.createElement("div");
      const selected = new Set();
      answers[q.id] = selected;
      (q.options || []).forEach((o, idx) => {
        const row = document.createElement("label");
        row.className = "choice-row";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = String(idx);
        cb.dataset.qid = q.id;
        cb.dataset.optionIndex = String(idx);
        cb.addEventListener("change", () => {
          if (cb.checked) selected.add(idx);
          else selected.delete(idx);
          markQuestionTouched(q.id);
        });
        row.appendChild(cb);
        const labelText = document.createElement("span");
        appendPlainText(labelText, o.text || "");
        row.appendChild(labelText);
        wrap.appendChild(row);
      });
      return wrap;
    }

    function renderMatchPairs(q) {
      const state = answers[q.id] && typeof answers[q.id] === "object" && !(answers[q.id] instanceof Set)
        ? answers[q.id]
        : {};
      answers[q.id] = state;
      const options = Array.isArray(q.options) ? q.options : [];
      const useTableLayout = q.layout === "table" || (Array.isArray(q.columns) && q.columns.length > 0);
      if (useTableLayout) {
        const wrap = document.createElement("div");
        wrap.className = "match-pairs-table-wrap";
        const table = document.createElement("table");
        table.className = "visual-table match-pairs-table";
        if (Array.isArray(q.columns) && q.columns.length) {
          const thead = document.createElement("thead");
          const tr = document.createElement("tr");
          q.columns.forEach((column) => {
            const th = document.createElement("th");
            appendInlineText(th, column || "");
            tr.appendChild(th);
          });
          thead.appendChild(tr);
          table.appendChild(thead);
        }
        const tbody = document.createElement("tbody");
        (Array.isArray(q.pairs) ? q.pairs : []).forEach((pair, index) => {
          const key = String(pair?.key || index);
          const tr = document.createElement("tr");
          tr.className = "match-table-row";
          tr.dataset.pairKey = key;
          const leftTd = document.createElement("td");
          leftTd.className = "match-left match-table-left";
          appendInlineText(leftTd, pair?.left || "");
          const rightTd = document.createElement("td");
          rightTd.className = "match-table-right";
          const select = document.createElement("select");
          select.className = "match-select";
          select.dataset.qid = q.id;
          select.dataset.pairKey = key;
          select.dataset.evalInput = "1";
          const placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.textContent = t("scenario.input.choose", "Bitte waehlen");
          placeholder.setAttribute("data-i18n-key", "scenario.input.choose");
          select.appendChild(placeholder);
          options.forEach((option) => {
            const value = typeof option === "string" ? option : String(option?.value || option?.text || "");
            const label = typeof option === "string" ? option : String(option?.label || option?.text || option?.value || "");
            const el = document.createElement("option");
            el.value = value;
            el.textContent = label;
            select.appendChild(el);
          });
          select.value = String(state[key] || "");
          select.addEventListener("change", () => {
            state[key] = select.value;
            markQuestionTouched(q.id);
          });
          rightTd.appendChild(select);
          tr.append(leftTd, rightTd);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        return wrap;
      }
      const wrap = document.createElement("div");
      wrap.className = "match-pairs";
      (Array.isArray(q.pairs) ? q.pairs : []).forEach((pair, index) => {
        const key = String(pair?.key || index);
        const row = document.createElement("label");
        row.className = "match-row";
        row.dataset.pairKey = key;
        const left = document.createElement("div");
        left.className = "match-left";
        appendPlainText(left, pair?.left || "");
        const select = document.createElement("select");
        select.className = "match-select";
        select.dataset.qid = q.id;
        select.dataset.pairKey = key;
        select.dataset.evalInput = "1";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = t("scenario.input.choose", "Bitte waehlen");
        placeholder.setAttribute("data-i18n-key", "scenario.input.choose");
        select.appendChild(placeholder);
        options.forEach((option) => {
          const value = typeof option === "string" ? option : String(option?.value || option?.text || "");
          const label = typeof option === "string" ? option : String(option?.label || option?.text || option?.value || "");
          const el = document.createElement("option");
          el.value = value;
          el.textContent = label;
          select.appendChild(el);
        });
        select.value = String(state[key] || "");
        select.addEventListener("change", () => {
          state[key] = select.value;
          markQuestionTouched(q.id);
        });
        row.append(left, select);
        wrap.appendChild(row);
      });
      return wrap;
    }

    function renderOrdering(q) {
      const wrap = document.createElement("div");
      const order = [...(q.items || [])];
      answers[q.id] = order;
      function draw() {
        wrap.innerHTML = "";
        order.forEach((item, idx) => {
          const row = document.createElement("div");
          row.className = "ordering-row";
          const txt = document.createElement("div");
          appendPlainText(txt, `${idx + 1}. ${item}`);
          const up = document.createElement("button");
          up.textContent = t("scenario.input.move_up", "hoch");
          up.setAttribute("data-i18n-key", "scenario.input.move_up");
          up.disabled = idx === 0;
          const down = document.createElement("button");
          down.textContent = t("scenario.input.move_down", "runter");
          down.setAttribute("data-i18n-key", "scenario.input.move_down");
          down.disabled = idx === order.length - 1;
          up.addEventListener("click", () => {
            [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
            markQuestionTouched(q.id);
            draw();
          });
          down.addEventListener("click", () => {
            [order[idx + 1], order[idx]] = [order[idx], order[idx + 1]];
            markQuestionTouched(q.id);
            draw();
          });
          row.append(txt, up, down);
          wrap.appendChild(row);
        });
      }
      draw();
      return wrap;
    }

    function renderTableFill(q) {
      const wrap = document.createElement("div");
      wrap.className = "table-fill-wrap";
      const state = answers[q.id] && typeof answers[q.id] === "object" && !(answers[q.id] instanceof Set)
        ? answers[q.id]
        : {};
      answers[q.id] = state;
      const table = document.createElement("table");
      table.className = "visual-table table-fill-table";
      if (Array.isArray(q.columns) && q.columns.length) {
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");
        q.columns.forEach((column) => {
          const th = document.createElement("th");
          appendInlineText(th, column || "");
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
      }
      const tbody = document.createElement("tbody");
      (Array.isArray(q.rows) ? q.rows : []).forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        (Array.isArray(row) ? row : []).forEach((cell, colIndex) => {
          const td = document.createElement("td");
          if (cell && typeof cell === "object" && Object.prototype.hasOwnProperty.call(cell, "expected")) {
            const key = String(cell.key || `r${rowIndex}c${colIndex}`);
            if (cell.inputType === "select") {
              const select = document.createElement("select");
              select.className = "table-fill-select";
              select.dataset.qid = q.id;
              select.dataset.cellKey = key;
              select.dataset.evalInput = "1";
              const placeholder = document.createElement("option");
              placeholder.value = "";
              if (cell.placeholder) {
                placeholder.textContent = String(cell.placeholder);
              } else {
                placeholder.textContent = t("scenario.input.choose", "Bitte waehlen");
                placeholder.setAttribute("data-i18n-key", "scenario.input.choose");
              }
              select.appendChild(placeholder);
              (Array.isArray(cell.options) ? cell.options : []).forEach((option) => {
                const value = typeof option === "string" ? option : String(option?.value || option?.text || "");
                const label = typeof option === "string" ? option : String(option?.label || option?.text || option?.value || "");
                const el = document.createElement("option");
                el.value = value;
                el.textContent = label;
                select.appendChild(el);
              });
              select.value = String(state[key] || "");
              select.addEventListener("change", () => {
                state[key] = select.value;
                markQuestionTouched(q.id);
              });
              td.appendChild(select);
            } else {
              const input = document.createElement("input");
              const numeric = cell.inputType === "number" || typeof cell.expected === "number";
              input.type = numeric ? "number" : "text";
              if (numeric) input.step = "any";
              input.className = "table-fill-input";
              input.dataset.qid = q.id;
              input.dataset.cellKey = key;
              input.dataset.evalInput = "1";
              input.placeholder = String(cell.placeholder || "");
              input.value = String(state[key] || "");
              input.addEventListener("input", () => {
                state[key] = input.value;
                markQuestionTouched(q.id);
              });
              td.appendChild(input);
            }
          } else {
            const value = cell && typeof cell === "object" && Object.prototype.hasOwnProperty.call(cell, "text")
              ? cell.text
              : cell;
            appendInlineText(td, value ?? "");
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      return wrap;
    }

    function renderNumber(q) {
      const inp = document.createElement("input");
      inp.type = "number";
      inp.step = "any";
      inp.placeholder = t("scenario.input.number_placeholder", "Zahl eingeben");
      inp.setAttribute("data-i18n-placeholder-key", "scenario.input.number_placeholder");
      inp.dataset.qid = q.id;
      inp.dataset.evalInput = "1";
      inp.addEventListener("input", () => {
        answers[q.id] = inp.value;
        markQuestionTouched(q.id);
      });
      return inp;
    }

    function renderGapFillCode(q) {
      const wrap = document.createElement("div");
      wrap.className = "gap-fill-code";
      const slotGridMode = q.layout === "slot_grid";
      if (slotGridMode) wrap.classList.add("gap-fill-code--slot-grid");
      wrap.dataset.qid = q.id;
      const state = answers[q.id] && typeof answers[q.id] === "object" && !(answers[q.id] instanceof Set)
        ? answers[q.id]
        : {};
      answers[q.id] = state;
      const poolEntries = getGapFillChoicePoolEntries(q);
      const lines = Array.isArray(q.lines) ? q.lines : [];
      const fields = getGapFillFields(q);
      const useDragDrop = (q.interaction === "drag_drop" || poolEntries.length > 0)
        && fields.every((field) => typeof field.line.answer === "string");

      function setGapValue(key, value) {
        if (!key) return;
        if (value === null || value === undefined || value === "") delete state[key];
        else state[key] = String(value);
        markQuestionTouched(q.id);
        if (useDragDrop) draw();
      }

      function drawDragPool() {
        const bank = document.createElement("div");
        bank.className = "gap-fill-bank";
        const heading = document.createElement("div");
        heading.className = "gap-fill-bank-title";
        if (q.choicePoolTitle) {
          heading.textContent = String(q.choicePoolTitle);
        } else {
          heading.textContent = t("scenario.gap_pool.title", "Vorgaben");
          heading.setAttribute("data-i18n-key", "scenario.gap_pool.title");
        }
        bank.appendChild(heading);
        const tray = document.createElement("div");
        tray.className = "gap-fill-bank-tray";
        if (slotGridMode || q.poolLayout === "grid") tray.classList.add("is-grid-layout");
        tray.dataset.qid = q.id;
        tray.addEventListener("dragover", (event) => {
          event.preventDefault();
          tray.classList.add("is-target");
        });
        tray.addEventListener("dragleave", () => tray.classList.remove("is-target"));
        tray.addEventListener("drop", (event) => {
          event.preventDefault();
          tray.classList.remove("is-target");
          const sourceKey = event.dataTransfer?.getData("text/source-gap-key") || "";
          if (sourceKey) setGapValue(sourceKey, "");
        });
        const assignedIds = new Set();
        Object.values(state).forEach((value) => {
          const match = resolveGapFillChoiceToken(q, value, assignedIds);
          if (match) assignedIds.add(match.id);
        });
        poolEntries.forEach((choice, choiceIndex) => {
          if (assignedIds.has(choice.id)) return;
          const token = document.createElement("button");
          token.type = "button";
          token.className = "gap-fill-token";
          token.draggable = true;
          token.dataset.choiceIndex = String(choiceIndex);
          token.dataset.choiceId = choice.id;
          token.dataset.choiceValue = choice.value;
          token.textContent = choice.label;
          token.addEventListener("dragstart", (event) => {
            event.dataTransfer?.setData("text/plain", choice.id);
            event.dataTransfer?.setData("text/source-gap-key", "");
            token.classList.add("is-dragging");
          });
          token.addEventListener("dragend", () => token.classList.remove("is-dragging"));
          tray.appendChild(token);
        });
        if (!tray.childElementCount) {
          const hint = document.createElement("div");
          hint.className = "gap-fill-bank-empty";
          hint.textContent = t("scenario.gap_pool.empty", "Alle verwendbaren Vorgaben sind derzeit gesetzt.");
          hint.setAttribute("data-i18n-key", "scenario.gap_pool.empty");
          tray.appendChild(hint);
        }
        bank.appendChild(tray);
        return bank;
      }

      function buildDropZone(key, line) {
        const zone = document.createElement("button");
        zone.type = "button";
        zone.className = "gap-fill-dropzone";
        if (slotGridMode) zone.classList.add("is-uniform");
        zone.dataset.qid = q.id;
        zone.dataset.gapKey = key;
        zone.dataset.evalInput = "1";
        if (line.label) {
          zone.setAttribute("aria-label", String(line.label));
        } else {
          zone.setAttribute("aria-label", t("scenario.gap_dropzone.aria", "Baustein ablegen"));
          zone.setAttribute("data-i18n-aria-label-key", "scenario.gap_dropzone.aria");
        }
        if (state[key]) {
          zone.classList.add("is-filled");
          zone.textContent = resolveGapFillChoiceLabel(q, state[key]);
          zone.draggable = true;
          zone.addEventListener("dragstart", (event) => {
            event.dataTransfer?.setData("text/plain", String(state[key]));
            event.dataTransfer?.setData("text/source-gap-key", key);
            zone.classList.add("is-dragging");
          });
          zone.addEventListener("dragend", () => zone.classList.remove("is-dragging"));
          zone.addEventListener("click", () => setGapValue(key, ""));
        } else {
          const placeholder = Object.prototype.hasOwnProperty.call(line, "placeholder")
            ? line.placeholder
            : (Object.prototype.hasOwnProperty.call(q, "slotPlaceholder") ? q.slotPlaceholder : "...");
          zone.textContent = String(placeholder ?? "");
          zone.addEventListener("click", () => setGapValue(key, ""));
        }
        zone.addEventListener("dragover", (event) => {
          event.preventDefault();
          zone.classList.add("is-target");
        });
        zone.addEventListener("dragleave", () => zone.classList.remove("is-target"));
        zone.addEventListener("drop", (event) => {
          event.preventDefault();
          zone.classList.remove("is-target");
          const value = event.dataTransfer?.getData("text/plain") || "";
          const sourceKey = event.dataTransfer?.getData("text/source-gap-key") || "";
          if (!value) return;
          if (sourceKey && sourceKey !== key) delete state[sourceKey];
          setGapValue(key, value);
        });
        return zone;
      }

      function draw() {
        wrap.innerHTML = "";
        if (slotGridMode && useDragDrop) {
          lines.forEach((line) => {
            if (line && typeof line === "object" && Object.prototype.hasOwnProperty.call(line, "answer")) return;
            const note = document.createElement("div");
            note.className = "gap-fill-slot-note";
            appendInlineText(note, line?.text || "");
            wrap.appendChild(note);
          });
          const grid = document.createElement("div");
          grid.className = "gap-fill-slot-grid";
          fields.forEach((field) => {
            grid.appendChild(buildDropZone(field.key, field.line));
          });
          wrap.appendChild(grid);
          wrap.appendChild(drawDragPool());
          return;
        }
        lines.forEach((line, index) => {
          const row = document.createElement("div");
          row.className = "gap-fill-line";
          if (line && typeof line === "object" && Object.prototype.hasOwnProperty.call(line, "answer")) {
            const key = String(line.key || `line${index}`);
            const before = document.createElement("span");
            before.className = "gap-fill-chunk";
            appendInlineText(before, line.before || "");
            row.appendChild(before);
            if (useDragDrop) {
              row.appendChild(buildDropZone(key, line));
            } else {
              const input = document.createElement("input");
              const numeric = line.inputType === "number" || typeof line.answer === "number";
              input.type = numeric ? "number" : "text";
              if (numeric) input.step = "any";
              input.className = "gap-fill-input";
              input.dataset.qid = q.id;
              input.dataset.gapKey = key;
              input.dataset.evalInput = "1";
              input.placeholder = String(line.placeholder || "...");
              input.value = String(state[key] || "");
              input.style.width = `${Math.max(90, String(line.answer || "").length * 11)}px`;
              input.addEventListener("input", () => {
                state[key] = input.value;
                markQuestionTouched(q.id);
              });
              row.appendChild(input);
            }
            const after = document.createElement("span");
            after.className = "gap-fill-chunk";
            appendInlineText(after, line.after || "");
            row.appendChild(after);
          } else {
            appendInlineText(row, line?.text || "");
          }
          wrap.appendChild(row);
        });
        if (useDragDrop) wrap.appendChild(drawDragPool());
      }

      wrap.refreshGapFill = draw;
      draw();
      return wrap;
    }

    function renderShortText(q) {
      const wrap = document.createElement("div");
      wrap.className = "short-text-wrap";
      const ta = document.createElement("textarea");
      let codeEditor = null;
      const initialValue = String(q.initialValue || "");
      const currentValue = typeof answers[q.id] === "string" ? answers[q.id] : initialValue;
      answers[q.id] = currentValue;
      if (q.placeholder) {
        ta.placeholder = String(q.placeholder);
      } else {
        ta.placeholder = t("scenario.short_text.placeholder", "Antwort eingeben ...");
        ta.setAttribute("data-i18n-placeholder-key", "scenario.short_text.placeholder");
      }
      ta.dataset.qid = q.id;
      ta.dataset.evalInput = "1";
      ta.value = currentValue;
      if (q.inputMode === "code") {
        codeEditor = buildHighlightedCodeEditor(ta, q.language || "");
      }
      ta.addEventListener("input", () => {
        answers[q.id] = ta.value;
        markQuestionTouched(q.id);
      });
      if (q.resettable) {
        const toolbar = document.createElement("div");
        toolbar.className = "short-text-toolbar";
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "short-text-reset";
        if (q.resetLabel) {
          reset.textContent = String(q.resetLabel);
        } else {
          reset.textContent = t("scenario.short_text.reset", "Zuruecksetzen");
          reset.setAttribute("data-i18n-key", "scenario.short_text.reset");
        }
        reset.addEventListener("click", () => {
          ta.value = initialValue;
          answers[q.id] = initialValue;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
          if (codeEditor) codeEditor.refresh();
        });
        toolbar.appendChild(reset);
        wrap.appendChild(toolbar);
      }
      wrap.appendChild(codeEditor ? codeEditor.editor : ta);
      return wrap;
    }

    function isFollowupDivider(q) {
      return q && q.type === "followup_divider";
    }

    function renderQuestion(q, idx) {
      const card = document.createElement("section");
      card.className = "question";
      card.dataset.qid = q.id;
      const main = document.createElement("div");
      main.className = "question-main";
      if (isFollowupDivider(q)) {
        card.classList.add("question-divider");
        main.appendChild(createRequestLetter(q, q.title || t("scenario.question.followup", "Folgeauftrag"), q.title ? "" : "scenario.question.followup"));
        card.appendChild(main);
        return card;
      }
      if (isContextCard(q)) {
        card.classList.add("question-context");
        const head = document.createElement("div");
        head.className = "question-head";
        const title = document.createElement("h3");
        title.textContent = q.title || t("scenario.question.context", "Kontext");
        if (!q.title) title.setAttribute("data-i18n-key", "scenario.question.context");
        head.appendChild(title);
        main.appendChild(head);
        const content = renderQuestionContent(q);
        if (content) main.appendChild(content);
        card.appendChild(main);
        return card;
      }
      const titlePrefix = Number.isInteger(idx) ? `${idx + 1}. ` : "";
      const head = document.createElement("div");
      head.className = "question-head";
      const title = document.createElement("h3");
      title.textContent = `${titlePrefix}${q.title}`;
      head.append(title, createQuestionMarkerButton(q, scenarioData));
      main.appendChild(head);
      const content = renderQuestionContent(q);
      if (content) main.appendChild(content);

      let body = null;
      if (q.type === "single_choice") body = renderSingleChoice(q);
      if (q.type === "multi_select") body = renderMultiSelect(q);
      if (q.type === "match_pairs") body = renderMatchPairs(q);
      if (q.type === "ordering") body = renderOrdering(q);
      if (q.type === "table_fill") body = renderTableFill(q);
      if (q.type === "number") body = renderNumber(q);
      if (q.type === "gap_fill_code") body = renderGapFillCode(q);
      if (q.type === "short_text") body = renderShortText(q);
      if (!body) {
        body = document.createElement("div");
        body.textContent = t("scenario.question.unsupported", "Aufgabentyp noch nicht implementiert.");
        body.setAttribute("data-i18n-key", "scenario.question.unsupported");
      }
      main.appendChild(body);
      card.appendChild(main);
      const reviewSlot = document.createElement("div");
      reviewSlot.className = "review-slot hidden";
      reviewSlot.dataset.reviewFor = q.id;
      card.appendChild(reviewSlot);
      return card;
    }

    function toArraySet(setLike) {
      if (setLike instanceof Set) return [...setLike];
      return [];
    }

    function evaluateSingleChoice(q, user) {
      const chosen = Number.isInteger(user) ? user : null;
      const correct = q.correctIndex;
      const ok = chosen === correct;
      const selectedText = chosen === null
        ? t("scenario.review.display.no_selection", "(keine Auswahl)")
        : getChoiceOptionDisplayText(q.options?.[chosen], chosen);
      const expectedText = getChoiceOptionDisplayText(q.options?.[correct], correct);
      let why = "";
      if (ok) {
        why = q.feedback?.correct || t("scenario.review.generic.correct", "Richtig.");
      } else if (chosen === null) {
        why = joinTextParts([
          t("scenario.review.generic.unanswered", "Nicht beantwortet."),
          q.feedback?.wrong || ""
        ]);
      } else {
        const rationale = q.options[chosen]?.rationale || t("scenario.source.option.no_hint", "Option ohne Zusatzhinweis.");
        why = joinTextParts([
          q.feedback?.wrong || t("scenario.review.generic.wrong", "Falsch."),
          t("scenario.review.single_choice.reason", "Gewaehlt: {selected}. Grund: {reason}", {
            selected: selectedText,
            reason: rationale
          })
        ]);
      }
      return {
        status: ok ? "ok" : (chosen === null ? "bad" : "bad"),
        userDisplay: selectedText,
        expectedDisplay: expectedText,
        explanation: why
      };
    }

    function evaluateMultiSelect(q, userSet) {
      const user = new Set(toArraySet(userSet));
      const correctSet = new Set();
      (q.options || []).forEach((o, i) => { if (o.correct) correctSet.add(i); });

      const misses = [...correctSet].filter((i) => !user.has(i));
      const falsePos = [...user].filter((i) => !correctSet.has(i));
      const exact = misses.length === 0 && falsePos.length === 0;
      const unanswered = user.size === 0;
      const partial = !exact && !unanswered;

      const userLabels = [...user].map((i) => q.options[i]?.text).filter(Boolean);
      const expectedLabels = [...correctSet].map((i) => q.options[i]?.text).filter(Boolean);

      const details = [];
      if (misses.length) {
        for (const i of misses) {
          details.push(t("scenario.review.multi.missing_detail", "Fehlt: {label} -> {reason}", {
            label: q.options[i].text,
            reason: q.options[i].rationale || t("scenario.source.option.no_hint", "Option ohne Zusatzhinweis.")
          }));
        }
      }
      if (falsePos.length) {
        for (const i of falsePos) {
          details.push(t("scenario.review.multi.extra_detail", "Unpassend gewaehlt: {label} -> {reason}", {
            label: q.options[i].text,
            reason: q.options[i].rationale || t("scenario.source.option.no_hint", "Option ohne Zusatzhinweis.")
          }));
        }
      }
      let why = "";
      if (exact) why = q.feedback?.correct || t("scenario.review.generic.correct", "Richtig.");
      else if (unanswered) {
        why = joinTextParts([
          t("scenario.review.generic.unanswered", "Nicht beantwortet."),
          q.feedback?.wrong || ""
        ]);
      } else {
        why = joinTextParts([
          q.feedback?.wrong || t("scenario.review.multi.partial", "Teilweise falsch."),
          details.join(" | ")
        ]);
      }

      return {
        status: exact ? "ok" : (partial ? "partial" : "bad"),
        userDisplay: userLabels.length ? userLabels.join(" | ") : t("scenario.review.display.no_selection", "(keine Auswahl)"),
        expectedDisplay: expectedLabels.join(" | "),
        explanation: why
      };
    }

    function compareExpectedValue(actualRaw, expectedRaw, toleranceAbs = 0) {
      const actual = String(actualRaw || "").trim();
      const expected = String(expectedRaw ?? "").trim();
      if (!actual) {
        return {
          ok: false,
          expectedDisplay: expected || t("scenario.review.display.empty", "(leer)")
        };
      }
      const numericActual = Number(actual.replace(",", "."));
      const numericExpected = Number(String(expectedRaw ?? "").replace(",", "."));
      if (Number.isFinite(numericActual) && Number.isFinite(numericExpected)) {
        const ok = Math.abs(numericActual - numericExpected) <= Number(toleranceAbs || 0);
        return {
          ok,
          expectedDisplay: String(expectedRaw),
          actualDisplay: String(numericActual)
        };
      }
      return {
        ok: normalize(actual) === normalize(expected),
        expectedDisplay: expected || t("scenario.review.display.empty", "(leer)"),
        actualDisplay: actual
      };
    }

    function evaluateMatchPairs(q, userRaw) {
      const user = userRaw && typeof userRaw === "object" ? userRaw : {};
      const pairs = Array.isArray(q.pairs) ? q.pairs : [];
      let correctCount = 0;
      const details = [];
      pairs.forEach((pair, index) => {
        const key = String(pair?.key || index);
        const actual = String(user[key] || "").trim();
        const expected = String(pair?.right || "");
        const ok = normalize(actual) === normalize(expected);
        if (ok) correctCount += 1;
        else details.push(t("scenario.review.match.detail", "{left}: sollte {expected}", {
          left: pair?.left || t("scenario.source.title.match", "Zuordnung {index}", { index: index + 1 }),
          expected
        }));
      });
      const exact = pairs.length > 0 && correctCount === pairs.length;
      const partial = !exact && correctCount > 0;
      return {
        status: exact ? "ok" : (partial ? "partial" : "bad"),
        userDisplay: t("scenario.review.match.user", "{correct}/{total} Zuordnungen korrekt", {
          correct: correctCount,
          total: pairs.length
        }),
        expectedDisplay: pairs.map((pair) => `${pair.left} -> ${pair.right}`).join(" | "),
        explanation: exact
          ? (q.feedback?.correct || t("scenario.review.match.correct", "Alle Zuordnungen stimmen."))
          : joinTextParts([
            q.feedback?.wrong || t("scenario.review.match.wrong", "Bitte die Zuordnungen pruefen."),
            details.slice(0, 3).join(" | ")
          ])
      };
    }

    function evaluateOrdering(q, orderArr) {
      const user = Array.isArray(orderArr) ? orderArr : [];
      const expected = q.correctOrder || [];
      const maxLen = Math.max(user.length, expected.length);
      let same = 0;
      const diffs = [];
      for (let i = 0; i < maxLen; i++) {
        const u = user[i] || t("scenario.review.display.empty", "(leer)");
        const e = expected[i] || t("scenario.review.display.empty", "(leer)");
        if (normalize(u) === normalize(e)) same++;
        else diffs.push(t("scenario.review.order.diff", 'Pos {position}: ist "{actual}", sollte "{expected}"', {
          position: i + 1,
          actual: u,
          expected: e
        }));
      }
      const exact = diffs.length === 0;
      const partial = !exact && same >= Math.ceil(expected.length / 2);
      let why = "";
      if (exact) why = q.feedback?.correct || t("scenario.review.order.correct", "Richtige Reihenfolge.");
      else {
        why = joinTextParts([
          q.feedback?.wrong || t("scenario.review.order.wrong", "Reihenfolge fehlerhaft."),
          diffs.slice(0, 4).join(" | ")
        ]);
      }

      return {
        status: exact ? "ok" : (partial ? "partial" : "bad"),
        userDisplay: user.join(" -> "),
        expectedDisplay: expected.join(" -> "),
        explanation: why
      };
    }

    function evaluateTableFill(q, userRaw) {
      const user = userRaw && typeof userRaw === "object" ? userRaw : {};
      const fields = getTableFillFields(q);
      let correctCount = 0;
      const details = [];
      fields.forEach((field) => {
        const actual = user[field.key];
        const comparison = compareExpectedValue(actual, field.cell.expected, field.cell.toleranceAbs || q.toleranceAbs || 0);
        if (comparison.ok) correctCount += 1;
        else details.push(t("scenario.review.table.detail", "{label}: erwartet {expected}", {
          label: field.cell.label || field.key,
          expected: comparison.expectedDisplay
        }));
      });
      const exact = fields.length > 0 && correctCount === fields.length;
      const partial = !exact && correctCount > 0;
      return {
        status: exact ? "ok" : (partial ? "partial" : "bad"),
        userDisplay: t("scenario.review.table.user", "{correct}/{total} Felder korrekt", {
          correct: correctCount,
          total: fields.length
        }),
        expectedDisplay: t("scenario.review.table.expected", "{total} Felder mit Referenzwerten", {
          total: fields.length
        }),
        explanation: exact
          ? (q.feedback?.correct || t("scenario.review.table.correct", "Alle Felder stimmen."))
          : joinTextParts([
            q.feedback?.wrong || t("scenario.review.table.wrong", "Bitte die Eintraege pruefen."),
            details.slice(0, 4).join(" | ")
          ])
      };
    }

    function evaluateNumber(q, userRaw) {
      const n = Number(String(userRaw || "").replace(",", "."));
      const expected = Number(q.expected);
      const tol = Number(q.toleranceAbs || 0);
      const has = Number.isFinite(n);
      const ok = has && Math.abs(n - expected) <= tol;
      const formulaText = q.showExpectedFormula
        ? t("scenario.review.number.formula", "Formel: {formula}", { formula: q.showExpectedFormula })
        : "";
      let why = "";
      if (ok) {
        why = joinTextParts([
          q.feedback?.correct || t("scenario.review.generic.correct", "Richtig."),
          formulaText
        ]);
      } else if (!has) {
        why = joinTextParts([
          t("scenario.review.number.invalid", "Keine gueltige Zahl eingegeben."),
          q.feedback?.wrong || ""
        ]);
      } else {
        why = joinTextParts([
          q.feedback?.wrong || t("scenario.review.generic.wrong", "Falsch."),
          t("scenario.review.number.expected", "Erwartungswert: {expected}.", { expected }),
          formulaText
        ]);
      }
      return {
        status: ok ? "ok" : "bad",
        userDisplay: has ? String(n) : t("scenario.review.display.no_valid_number", "(keine gueltige Zahl)"),
        expectedDisplay: String(expected),
        explanation: why
      };
    }

    function evaluateGapFillCode(q, userRaw) {
      const user = userRaw && typeof userRaw === "object" ? userRaw : {};
      const fields = getGapFillFields(q);
      let correctCount = 0;
      const details = [];
      fields.forEach((field) => {
        const actual = resolveGapFillChoiceValue(q, user[field.key]);
        const answers = [field.line.answer, ...(Array.isArray(field.line.alternatives) ? field.line.alternatives : [])];
        const match = answers.some((expected) => compareExpectedValue(actual, expected, field.line.toleranceAbs || 0).ok);
        if (match) correctCount += 1;
        else details.push(t("scenario.review.gap.detail", "{label}: erwartet {expected}", {
          label: field.line.label || field.key,
          expected: String(field.line.answer)
        }));
      });
      const exact = fields.length > 0 && correctCount === fields.length;
      const partial = !exact && correctCount > 0;
      return {
        status: exact ? "ok" : (partial ? "partial" : "bad"),
        userDisplay: t("scenario.review.gap.user", "{correct}/{total} Luecken korrekt", {
          correct: correctCount,
          total: fields.length
        }),
        expectedDisplay: t("scenario.review.gap.expected", "{total} Luecken im Pseudocode", {
          total: fields.length
        }),
        explanation: exact
          ? (q.feedback?.correct || t("scenario.review.gap.correct", "Das Geruest ist korrekt vervollstaendigt."))
          : joinTextParts([
            q.feedback?.wrong || t("scenario.review.gap.wrong", "Bitte die Luecken pruefen."),
            details.slice(0, 4).join(" | ")
          ])
      };
    }

    function evaluateShortText(q, userRaw) {
      const txt = String(userRaw || "");
      const norm = normalize(txt);
      const minChars = Number(q.minChars || 0);
      const required = q.requiredKeywords || [];
      const hits = required.filter((k) => norm.includes(normalize(k)));
      const missing = required.filter((k) => !norm.includes(normalize(k)));
      const enoughLen = txt.trim().length >= minChars;
      const ratio = required.length ? hits.length / required.length : 1;
      let status = "bad";
      if (enoughLen && ratio >= 1) status = "ok";
      else if (enoughLen && ratio >= 0.5) status = "partial";
      else if (!txt.trim()) status = "bad";

      let why = "";
      if (status === "ok") {
        why = joinTextParts([
          q.feedback?.correct || t("scenario.review.generic.correct", "Richtig."),
          hits.length
            ? t("scenario.review.short.hits", "Enthaltene Kernbegriffe: {hits}.", {
              hits: hits.join(", ")
            })
            : ""
        ]);
      } else {
        const missInfo = missing.length
          ? t("scenario.review.short.missing", "Fehlende Kernbegriffe: {keywords}.", {
            keywords: missing.join(", ")
          })
          : "";
        const lenInfo = enoughLen
          ? ""
          : t("scenario.review.short.min_length", "Mindestlaenge {count} Zeichen nicht erreicht.", {
            count: minChars
          });
        const outlineInfo = q.expectedOutline
          ? t("scenario.review.short.reference_structure", "Referenzstruktur: {outline}", {
            outline: q.expectedOutline
          })
          : "";
        why = joinTextParts([
          q.feedback?.wrong || t("scenario.review.short.incomplete", "Unvollstaendig."),
          missInfo,
          lenInfo,
          outlineInfo
        ]);
      }
      return {
        status,
        userDisplay: txt.trim() ? txt.trim() : t("scenario.review.display.no_answer", "(keine Antwort)"),
        expectedDisplay: q.expectedOutline || t("scenario.review.expected.free_text", "Freitext mit Kernaspekten"),
        explanation: why
      };
    }

    function buildScenarioResults(data) {
      const results = [];
      for (const q of data?.questions || []) {
        if (isStructuralQuestion(q)) continue;
        results.push({
          id: q.id,
          title: q.title,
          ...evaluateQuestion(q)
        });
      }
      return results;
    }

    function evaluateQuestion(q) {
      const user = answers[q.id];
      if (q.type === "single_choice") return evaluateSingleChoice(q, user);
      if (q.type === "multi_select") return evaluateMultiSelect(q, user);
      if (q.type === "match_pairs") return evaluateMatchPairs(q, user);
      if (q.type === "ordering") return evaluateOrdering(q, user);
      if (q.type === "table_fill") return evaluateTableFill(q, user);
      if (q.type === "number") return evaluateNumber(q, user);
      if (q.type === "gap_fill_code") return evaluateGapFillCode(q, user);
      if (q.type === "short_text") return evaluateShortText(q, user);
      return {
        status: "bad",
        userDisplay: t("scenario.review.display.not_evaluated", "(nicht ausgewertet)"),
        expectedDisplay: t("scenario.review.display.no_evaluator", "(kein Evaluator)"),
        explanation: t("scenario.review.unsupported", "Aufgabentyp noch nicht auswertbar.")
      };
    }

    function markClassFromStatus(status) {
      if (status === "ok") return "mark-ok";
      if (status === "miss") return "mark-miss";
      if (status === "partial") return "mark-partial";
      if (status === "neutral") return "mark-neutral";
      return "mark-bad";
    }

    function explainClassFromStatus(status) {
      if (status === "ok") return "good";
      if (status === "miss") return "miss";
      if (status === "partial") return "partial";
      if (status === "neutral") return "neutral";
      return "bad";
    }

    function tooltipTextFromStatus(status) {
      if (status === "ok") return lt("richtig");
      if (status === "bad") return lt("falsch");
      if (status === "miss") return lt("waere richtig gewesen");
      if (status === "neutral") return lt("waere falsch gewesen");
      if (status === "partial") return lt("teilweise richtig");
      return lt("Auswertung");
    }

    function clearInputMarkers(card) {
      card.querySelectorAll(".choice-row, .ordering-row, .match-row, .match-table-row").forEach((el) => {
        el.classList.remove("mark-ok", "mark-partial", "mark-bad", "mark-miss", "mark-neutral");
      });
      card.querySelectorAll('[data-eval-input="1"]').forEach((el) => {
        el.classList.remove("mark-ok", "mark-partial", "mark-bad", "mark-neutral");
      });
      card.querySelectorAll('[data-eval-tooltip="1"]').forEach((el) => {
        el.removeAttribute("title");
        el.removeAttribute("data-eval-tooltip");
        el.removeAttribute("data-eval-tooltip-text");
      });
    }

    function buildSourceAssessments(card, q, result, context = {}) {
      const out = [];
      if (!card || !q) return out;
      const manualCreditQuestionIds = context.manualCreditQuestionIds instanceof Set
        ? context.manualCreditQuestionIds
        : new Set();

      if (q.type === "single_choice") {
        const chosen = Number.isInteger(answers[q.id]) ? answers[q.id] : null;
        const rows = [...card.querySelectorAll(".choice-row")];
        rows.forEach((row, idx) => {
          const opt = q.options?.[idx] || {};
          let status = "neutral";
          let explain = opt.rationale || t("scenario.source.option.no_hint", "Option ohne Zusatzhinweis.");
          if (idx === q.correctIndex && chosen === idx) {
            status = "ok";
            explain = joinTextParts([
              t("scenario.source.single.hit", "Treffer."),
              opt.rationale || ""
            ]);
          } else if (idx === q.correctIndex) {
            status = "miss";
            explain = joinTextParts([
              t("scenario.source.single.best", "Das waere die optimale Wahl."),
              opt.rationale || ""
            ]);
          } else if (chosen === idx) {
            status = "bad";
            explain = joinTextParts([
              t("scenario.source.single.selected_bad", "Ausgewaehlt, aber unpassend."),
              opt.rationale || ""
            ]);
          }
          out.push({
            sourceEl: row,
            anchorEl: row,
            status,
            title: getChoiceOptionDisplayText(opt, idx),
            detail: "",
            explain
          });
        });
        return out;
      }

      if (q.type === "multi_select") {
        const selected = answers[q.id] instanceof Set ? answers[q.id] : new Set();
        const rows = [...card.querySelectorAll(".choice-row")];
        rows.forEach((row, idx) => {
          const opt = q.options?.[idx] || {};
          const isSelected = selected.has(idx);
          let status = "neutral";
          let explain = opt.rationale || t("scenario.source.option.no_hint", "Option ohne Zusatzhinweis.");
          if (opt.correct && isSelected) {
            status = "ok";
            explain = joinTextParts([
              t("scenario.source.multi.correct_set", "Erforderlich und korrekt gesetzt."),
              opt.rationale || ""
            ]);
          } else if (opt.correct && !isSelected) {
            status = "miss";
            explain = joinTextParts([
              t("scenario.source.multi.missing", "Erforderlich, aber fehlt."),
              opt.rationale || ""
            ]);
          } else if (!opt.correct && isSelected) {
            status = "bad";
            explain = joinTextParts([
              t("scenario.source.multi.unnecessary", "Unnoetig gesetzt."),
              opt.rationale || ""
            ]);
          } else {
            status = "neutral";
            explain = joinTextParts([
              t("scenario.source.multi.skipped_ok", "Ausgelassen, das ist vertretbar."),
              opt.rationale || ""
            ]);
          }
          out.push({
            sourceEl: row,
            anchorEl: row,
            status,
            title: opt.text || t("scenario.source.title.option", "Option {index}", { index: idx + 1 }),
            detail: "",
            explain
          });
        });
        return out;
      }

      if (q.type === "match_pairs") {
        const selected = answers[q.id] && typeof answers[q.id] === "object" ? answers[q.id] : {};
        const rows = [...card.querySelectorAll(".match-row, .match-table-row")];
        rows.forEach((row, index) => {
          const pair = q.pairs?.[index] || {};
          const key = String(pair?.key || index);
          const actual = String(selected[key] || "").trim();
          const expected = String(pair?.right || "");
          let status = "bad";
          let explain = t("scenario.source.match.should", "Soll: {expected}", { expected });
          if (!actual) {
            status = "miss";
            explain = t("scenario.source.match.unassigned", "Noch nicht zugeordnet. Soll: {expected}", {
              expected
            });
          } else if (normalize(actual) === normalize(expected)) {
            status = "ok";
            explain = t("scenario.source.match.fits", "Passt: {expected}", { expected });
          } else {
            status = "bad";
            explain = t("scenario.source.match.current_should", "Aktuell: {actual}. Soll: {expected}", {
              actual,
              expected
            });
          }
          out.push({
            sourceEl: row,
            anchorEl: row.querySelector("select") || row,
            status,
            title: pair.left || t("scenario.source.title.match", "Zuordnung {index}", { index: index + 1 }),
            detail: "",
            explain
          });
        });
        return out;
      }

      if (q.type === "ordering") {
        const rows = [...card.querySelectorAll(".ordering-row")];
        const user = Array.isArray(answers[q.id]) ? answers[q.id] : [];
        const expected = q.correctOrder || [];
        rows.forEach((row, idx) => {
          const current = user[idx] || t("scenario.review.display.empty", "(leer)");
          const should = expected[idx] || t("scenario.review.display.empty", "(leer)");
          const ok = normalize(current) === normalize(should);
          out.push({
            sourceEl: row,
            anchorEl: row,
            status: ok ? "ok" : "bad",
            title: current,
            detail: "",
            explain: ok
              ? t("scenario.source.order.fits", "Position {position} passt.", { position: idx + 1 })
              : t("scenario.source.order.should", "Soll an Position {position}: {expected}", {
                position: idx + 1,
                expected: should
              })
          });
        });
        return out;
      }

      if (q.type === "table_fill") {
        const state = answers[q.id] && typeof answers[q.id] === "object" ? answers[q.id] : {};
        getTableFillFields(q).forEach((field) => {
          const input = card.querySelector(`.table-fill-input[data-cell-key="${field.key}"], .table-fill-select[data-cell-key="${field.key}"]`);
          const comparison = compareExpectedValue(state[field.key], field.cell.expected, field.cell.toleranceAbs || q.toleranceAbs || 0);
          out.push({
            sourceEl: input,
            anchorEl: input,
            status: comparison.ok ? "ok" : (String(state[field.key] || "").trim() ? "bad" : "miss"),
            title: field.cell.label || field.key,
            detail: t("scenario.source.reference", "Referenz: {expected}", {
              expected: comparison.expectedDisplay
            }),
            explain: comparison.ok
              ? t("scenario.source.table.field_correct", "Feld korrekt ausgefuellt.")
              : t("scenario.source.expected", "Erwartet: {expected}", {
                expected: comparison.expectedDisplay
              })
          });
        });
        return out;
      }

      if (q.type === "number") {
        const input = card.querySelector('input[type="number"]');
        out.push({
          sourceEl: input,
          anchorEl: input,
          status: result.status,
          title: t("scenario.review.calculation", "Rechenpruefung"),
          detail: `${lt("Referenz:")} ${result.expectedDisplay}`,
          explain: result.explanation
        });
        return out;
      }

      if (q.type === "gap_fill_code") {
        if (isCondensedSqlDragReviewQuestion(q)) {
          const wrap = card.querySelector(".gap-fill-code") || card.querySelector(".question-main") || card;
          const variants = getGapFillSolutionVariants(q);
          out.push({
            sourceEl: wrap,
            anchorEl: wrap,
            status: result.status,
            title: variants.length > 1 ? lt("Loesungen") : lt("Loesung"),
            detail: variants.length > 1
              ? variants.map((variant, index) => `${index + 1}. ${variant}`).join("\n")
              : (variants[0] || ""),
            explain: ""
          });
          return out;
        }
        const state = answers[q.id] && typeof answers[q.id] === "object" ? answers[q.id] : {};
        getGapFillFields(q).forEach((field) => {
          const input = card.querySelector(`.gap-fill-input[data-gap-key="${field.key}"], .gap-fill-dropzone[data-gap-key="${field.key}"]`);
          const expectedValues = [field.line.answer, ...(Array.isArray(field.line.alternatives) ? field.line.alternatives : [])];
          const actual = resolveGapFillChoiceValue(q, state[field.key]);
          const ok = expectedValues.some((expected) => compareExpectedValue(actual, expected, field.line.toleranceAbs || 0).ok);
          out.push({
            sourceEl: input,
            anchorEl: input,
            status: ok ? "ok" : (String(actual || "").trim() ? "bad" : "miss"),
            title: field.line.label || field.key,
            detail: t("scenario.source.reference", "Referenz: {expected}", {
              expected: String(field.line.answer)
            }),
            explain: ok
              ? t("scenario.source.gap.correct", "Luecke korrekt gefuellt.")
              : t("scenario.source.expected", "Erwartet: {expected}", {
                expected: String(field.line.answer)
              })
          });
        });
        return out;
      }

      if (q.type === "short_text") {
        const ta = card.querySelector("textarea");
        const questionProgressId = normalizeProgressId(q.id);
        const manualCreditApplied = Boolean(
          questionProgressId && manualCreditQuestionIds.has(questionProgressId)
        );
        const status = manualCreditApplied ? "ok" : result.status;
        const explain = manualCreditApplied
          ? joinTextParts([
            result.explanation,
            t("scenario.review.manual_credit_applied", "Manuell als korrekt anerkannt.")
          ])
          : result.explanation;
        out.push({
          sourceEl: ta,
          anchorEl: ta,
          status,
          title: t("scenario.review.free_text", "Freitext-Feedback"),
          detail: `${lt("Erwartung:")} ${result.expectedDisplay}`,
          explain,
          hasManualShortTextCreditAction: true,
          manualShortTextCreditApplied: manualCreditApplied,
          manualShortTextCreditQuestionId: q.id
        });
        return out;
      }

      out.push({
        sourceEl: card.querySelector(".question-main"),
        anchorEl: card.querySelector(".question-main"),
        status: result.status,
        title: lt("Auswertung"),
        detail: `${lt("Erwartung:")} ${result.expectedDisplay}`,
        explain: result.explanation
      });
      return out;
    }

    function getAnchorPointInCard(cardRect, sourceEl, anchorEl) {
      const el = anchorEl || sourceEl;
      const rect = (el || sourceEl)?.getBoundingClientRect?.();
      if (!rect) {
        return { x: 0, y: 0 };
      }

      const tag = (el?.tagName || "").toUpperCase();
      const type = (el?.type || "").toLowerCase();
      let x = rect.right - cardRect.left;
      let y = rect.top + (rect.height / 2) - cardRect.top;

      if (type === "radio" || type === "checkbox") {
        x = rect.left + (rect.width / 2) - cardRect.left;
      } else if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") {
        x = rect.right - cardRect.left;
      }

      return { x, y };
    }

    function applyInputBubbles(assessments) {
      for (const item of assessments) {
        const cls = markClassFromStatus(item.status);
        const tooltip = tooltipTextFromStatus(item.status);
        if (!item.sourceEl) continue;
        if (item.sourceEl.matches(".choice-row, .ordering-row, .match-row, .match-table-row")) {
          item.sourceEl.classList.add(cls);
          item.sourceEl.title = tooltip;
          item.sourceEl.setAttribute("data-eval-tooltip", "1");
          item.sourceEl.setAttribute("data-eval-tooltip-text", tooltip);
        } else if (item.sourceEl.matches('[data-eval-input="1"]')) {
          item.sourceEl.classList.add(cls);
          item.sourceEl.title = tooltip;
          item.sourceEl.setAttribute("data-eval-tooltip", "1");
          item.sourceEl.setAttribute("data-eval-tooltip-text", tooltip);
        }
      }
    }

    function applyManualShortTextCredit(questionIdRaw) {
      if (!scenarioData || !Array.isArray(lastResults) || !lastResults.length) return;
      const questionId = normalizeProgressId(questionIdRaw);
      if (!questionId) return;
      const progressUpdate = persistEvaluationProgress(scenarioData, lastResults, {
        manualCreditQuestionId: questionId
      });
      renderInlineReview(lastResults, progressUpdate);
    }

    function layoutReviewGraph(card, slot, assessments) {
      slot.innerHTML = `<svg class="review-canvas" aria-hidden="true"></svg><div class="review-list"></div>`;
      const svg = slot.querySelector(".review-canvas");
      const list = slot.querySelector(".review-list");
      const cardRect = card.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      const slotTopInCard = slotRect.top - cardRect.top;
      const slotLeftInCard = slotRect.left - cardRect.left;
      const mainHeight = Math.ceil(card.querySelector(".question-main")?.getBoundingClientRect().height || 0);
      const slotWidth = Math.max(320, Math.ceil(slot.getBoundingClientRect().width));
      const preferredNodeWidth = Math.min(420, Math.max(220, Math.floor(slotWidth * 0.78)));

      const nodes = assessments.map((a) => {
        const node = document.createElement("article");
        node.className = `review-node ${a.status}${a.manualShortTextCreditApplied ? " manual-shorttext-credit" : ""}`;
        node.title = tooltipTextFromStatus(a.status);
        node.setAttribute("data-eval-tooltip", "1");
        node.setAttribute("data-eval-tooltip-text", tooltipTextFromStatus(a.status));
        node.innerHTML =
          `<p class="review-node-title">${esc(a.title || "")}</p>` +
          (a.detail ? `<div class="review-content">${esc(a.detail)}</div>` : "") +
          (a.explain ? `<div class="review-node-explain ${explainClassFromStatus(a.status)}">${esc(a.explain || "")}</div>` : "");
        if (a.hasManualShortTextCreditAction && !a.manualShortTextCreditApplied) {
          const actions = document.createElement("div");
          actions.className = "review-node-actions";
          const actionButton = document.createElement("button");
          actionButton.type = "button";
          actionButton.className = "review-node-credit-btn";
          actionButton.textContent = t(MANUAL_SHORTTEXT_CREDIT_BUTTON_KEY, "So hab ich es gement");
          actionButton.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            applyManualShortTextCredit(a.manualShortTextCreditQuestionId || "");
          });
          actions.appendChild(actionButton);
          node.appendChild(actions);
        }
        node.style.width = `${preferredNodeWidth}px`;
        list.appendChild(node);
        const fallbackSource = a.sourceEl || card.querySelector(".question-main") || card;
        const anchor = getAnchorPointInCard(cardRect, fallbackSource, a.anchorEl || fallbackSource);
        return {
          ...a,
          node,
          sourceX: anchor.x,
          sourceY: anchor.y,
          anchorY: anchor.y - slotTopInCard
        };
      });

      for (const n of nodes) {
        n.height = Math.max(70, Math.ceil(n.node.getBoundingClientRect().height));
        n.width = preferredNodeWidth;
      }

      const gap = 18;
      const sourceYs = nodes.map((n) => n.anchorY);
      const sourceSpread = sourceYs.length ? (Math.max(...sourceYs) - Math.min(...sourceYs)) : 0;
      const sumHeights = nodes.reduce((s, n) => s + n.height, 0);
      const slotHeight = Math.max(mainHeight, sourceSpread + 120, sumHeights + (gap * (nodes.length + 1)));
      slot.style.minHeight = `${Math.ceil(slotHeight)}px`;
      list.style.height = `${Math.ceil(slotHeight)}px`;

      const leftInset = Math.min(64, Math.max(18, Math.floor((slotWidth - preferredNodeWidth) * 0.62)));
      let minX = preferredNodeWidth / 2 + leftInset;
      let maxX = slotWidth - preferredNodeWidth / 2 - 8;
      if (minX > maxX) {
        const centerX = (minX + maxX) / 2;
        minX = centerX;
        maxX = centerX;
      }
      const minY = 6;
      const maxY = slotHeight - 6;
      const baseTargetX = minX + Math.max(10, Math.min(48, (maxX - minX) * 0.38));

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.anchorY = Math.max(n.height / 2 + minY, Math.min(maxY - n.height / 2, n.anchorY));
        n.targetX = Math.max(minX, Math.min(maxX, baseTargetX + Math.max(0, (n.sourceX - slotLeftInCard) * 0.04)));
        n.x = Math.max(minX, Math.min(maxX, n.targetX + ((i % 3) - 1) * 16));
        n.y = Math.max(n.height / 2 + minY, Math.min(maxY - n.height / 2, n.anchorY + ((i % 2) ? 10 : -10)));
        n.vx = 0;
        n.vy = 0;
      }

      for (let iter = 0; iter < 180; iter++) {
        for (const n of nodes) {
          const fx = (n.targetX - n.x) * 0.06;
          const fy = (n.anchorY - n.y) * 0.12;
          n.vx += fx;
          n.vy += fy;
        }

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            const overlapX = (a.width + b.width) / 2 + 14 - Math.abs(dx);
            const overlapY = (a.height + b.height) / 2 + gap - Math.abs(dy);

            if (overlapX > 0 && overlapY > 0) {
              if (overlapX < overlapY) {
                const push = (overlapX / 2) * (dx >= 0 ? 1 : -1);
                a.vx -= push * 0.11;
                b.vx += push * 0.11;
              } else {
                const push = (overlapY / 2) * (dy >= 0 ? 1 : -1);
                a.vy -= push * 0.16;
                b.vy += push * 0.16;
              }
            }

            const repel = Math.max(0, 170 - dist) * 0.0028;
            dx /= dist;
            dy /= dist;
            a.vx -= dx * repel;
            a.vy -= dy * repel;
            b.vx += dx * repel;
            b.vy += dy * repel;
          }
        }

        for (const n of nodes) {
          n.vx *= 0.72;
          n.vy *= 0.72;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(minX, Math.min(maxX, n.x));
          n.y = Math.max(n.height / 2 + minY, Math.min(maxY - n.height / 2, n.y));
        }
      }

      // Final vertical packing pass: guarantee visible spacing between nodes.
      const sortedByY = [...nodes].sort((a, b) => a.y - b.y);
      if (sortedByY.length) {
        sortedByY[0].y = Math.max(sortedByY[0].y, sortedByY[0].height / 2 + minY);
        for (let i = 1; i < sortedByY.length; i++) {
          const prev = sortedByY[i - 1];
          const cur = sortedByY[i];
          const minCenter = prev.y + (prev.height / 2) + gap + (cur.height / 2);
          if (cur.y < minCenter) cur.y = minCenter;
        }

        const last = sortedByY[sortedByY.length - 1];
        const bottomLimit = maxY - (last.height / 2);
        if (last.y > bottomLimit) {
          const overflow = last.y - bottomLimit;
          for (const n of sortedByY) n.y -= overflow;
        }

        const first = sortedByY[0];
        const topLimit = first.height / 2 + minY;
        if (first.y < topLimit) {
          const underflow = topLimit - first.y;
          for (const n of sortedByY) n.y += underflow;
        }

        for (let i = 1; i < sortedByY.length; i++) {
          const prev = sortedByY[i - 1];
          const cur = sortedByY[i];
          const minCenter = prev.y + (prev.height / 2) + gap + (cur.height / 2);
          if (cur.y < minCenter) cur.y = minCenter;
          cur.y = Math.min(cur.y, maxY - cur.height / 2);
        }
      }

      const bySourceY = [...nodes].sort((a, b) => a.sourceY - b.sourceY);
      const midLane = (bySourceY.length - 1) / 2;
      bySourceY.forEach((n, i) => {
        n.routeLane = i - midLane;
      });

      for (const n of nodes) {
        n.node.style.left = `${Math.round(n.x - n.width / 2)}px`;
        n.node.style.top = `${Math.round(n.y - n.height / 2)}px`;
      }

      const cardWidth = Math.ceil(card.getBoundingClientRect().width);
      const cardHeight = Math.ceil(Math.max(card.getBoundingClientRect().height, slotTopInCard + slotHeight + 8));
      svg.style.left = `${-slotLeftInCard}px`;
      svg.style.top = `${-slotTopInCard}px`;
      svg.style.width = `${cardWidth}px`;
      svg.style.height = `${cardHeight}px`;
      svg.setAttribute("viewBox", `0 0 ${cardWidth} ${cardHeight}`);
      svg.setAttribute("preserveAspectRatio", "none");
      svg.innerHTML = "";

      for (const n of nodes) {
        const x1 = n.sourceX;
        const y1 = n.sourceY;
        const x2 = slotLeftInCard + (n.x - n.width / 2);
        const y2 = slotTopInCard + n.y;
        const laneOffset = (n.routeLane || 0) * 6;
        const available = Math.max(14, x2 - x1 - 8);
        const bend = Math.min(available - 2, Math.max(20, available * 0.74));
        const c1x = Math.max(x1 + 8, Math.min(x2 - 12, x1 + (bend * 0.52) + laneOffset));
        const c2x = Math.max(x1 + 10, Math.min(x2 - 7, x1 + bend + laneOffset));
        const ySkew = (n.routeLane || 0) * 2.4;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${y1 + ySkew}, ${c2x} ${y2 - ySkew}, ${x2} ${y2}`);
        path.setAttribute("class", `review-edge ${n.status}`);
        svg.appendChild(path);
      }
    }

    function clearInlineReview() {
      for (const card of document.querySelectorAll(".question")) {
        card.classList.remove("evaluated");
        clearInputMarkers(card);
        const slot = card.querySelector(".review-slot");
        if (!slot) continue;
        slot.style.minHeight = "";
        slot.innerHTML = "";
        slot.classList.add("hidden");
      }
      if (inlineSummary) {
        inlineSummary.innerHTML = "";
        inlineSummary.classList.add("hidden");
      }
      queueCommentModeContextBroadcast();
    }

    function renderInlineReview(results, progressUpdate = null) {
      clearInlineReview();
      const manualCreditQuestionIds = getScenarioManualCreditQuestionIdSet(scenarioData);
      const effectiveResults = (results || []).map((entry) => {
        const question = (scenarioData?.questions || []).find((q) => q?.id === entry?.id);
        if (!question || question.type !== "short_text") return entry;
        const questionProgressId = normalizeProgressId(question.id);
        if (!questionProgressId || !manualCreditQuestionIds.has(questionProgressId)) return entry;
        return { ...entry, status: "ok" };
      });
      const cOk = effectiveResults.filter((r) => r.status === "ok").length;
      const cPartial = effectiveResults.filter((r) => r.status === "partial").length;
      const cBad = effectiveResults.filter((r) => r.status === "bad").length;
      const name = answers._meta_participant || t("scenario.summary.no_name", "(ohne Name)");
      const group = answers._meta_group || t("scenario.summary.no_group", "(ohne Gruppe)");
      const station = answers._meta_stationId || t("scenario.summary.no_station", "(ohne Station)");
      const hasMeta = Boolean(answers._meta_participant || answers._meta_group || answers._meta_stationId);

      if (inlineSummary) {
        inlineSummary.innerHTML = "";
        if (hasMeta) {
          inlineSummary.innerHTML += `<strong>${esc(t("scenario.summary.submission", "Abgabe:"))}</strong> ${esc(name)} | ${esc(t("scenario.summary.group", "Gruppe"))} ${esc(group)} | ${esc(t("scenario.summary.ticket", "Ticket"))} ${esc(station)}<br>`;
        }
        inlineSummary.innerHTML +=
          `<strong>${esc(t("scenario.summary.profile", "Ergebnisprofil:"))}</strong> ${esc(t("scenario.summary.profile_values", "richtig {ok}, teilweise {partial}, falsch/fehlend {bad}, gesamt {total}.", {
            ok: cOk,
            partial: cPartial,
            bad: cBad,
            total: effectiveResults.length
          }))}<br>` +
          `<span class="muted">${esc(t("scenario.summary.graph_hint", "Graph-Ansicht: Jede Eingabe ist mit einer Auswertungs-Node verbunden."))}</span>`;
        if (progressUpdate) {
          const progressParts = [];
          if (Number.isFinite(progressUpdate.scenarioPercent)) {
            progressParts.push(t("scenario.progress.saved", "Szenario-Bewertung gespeichert: {percent}%", {
              percent: Math.round(progressUpdate.scenarioPercent)
            }));
          }
          if (Number.isFinite(progressUpdate.gainedPoints)) {
            if (progressUpdate.progressSuppressed) {
              progressParts.push(t("scenario.progress.suppressed", "Skill-Punkte pausiert: Dieses Ticket zaehlt noch nicht zur Gesamtbewertung"));
            } else if (progressUpdate.gainedPoints > 0) {
              const solvedCount = Math.max(0, Math.floor(Number(progressUpdate.newlySolvedCount) || 0));
              const solvedLabel = solvedCount === 1
                ? t("scenario.progress.solved_one", "neu korrekter Aufgabe")
                : t("scenario.progress.solved_many", "{count} neu korrekten Aufgaben", { count: solvedCount });
              progressParts.push(t("scenario.progress.points_gained", "Skill-Punkte: +{points} aus {label}", {
                points: Math.round(progressUpdate.gainedPoints),
                label: solvedLabel
              }));
            } else {
              progressParts.push(t("scenario.progress.no_new_points", "Keine neuen Skill-Punkte in diesem Durchlauf"));
            }
          }
          inlineSummary.innerHTML +=
            "<br>" +
            (progressParts.length
              ? `<strong>${esc(t("scenario.progress.heading", "Fortschritt:"))}</strong> ${esc(progressParts.join(" | "))}.`
              : `<span class='muted'>${esc(t("scenario.progress.none", "Fortschritt: Keine Bewertung gespeichert."))}</span>`);
        }
        inlineSummary.classList.remove("hidden");
      }

      for (const r of effectiveResults) {
        const card = document.querySelector(`.question[data-qid="${r.id}"]`);
        if (!card) continue;
        const slot = card.querySelector(".review-slot");
        if (!slot) continue;
        const q = (scenarioData?.questions || []).find((x) => x.id === r.id);
        const assessments = buildSourceAssessments(card, q, r, { manualCreditQuestionIds });
        if (!assessments.length) continue;
        applyInputBubbles(assessments);
        card.classList.add("evaluated");
        slot.classList.remove("hidden");
        layoutReviewGraph(card, slot, assessments);
        requestAnimationFrame(() => {
          if (!slot.classList.contains("hidden")) {
            layoutReviewGraph(card, slot, assessments);
          }
        });
      }
      queueCommentModeContextBroadcast();
    }

    function validateBeforeSubmit(data) {
      if (!document.querySelector('input[data-field-id]')) {
        return true;
      }
      const missingMeta = [];
      for (const f of data.submission?.participantFields || []) {
        if (f.required && !String(answers["_meta_" + f.id] || "").trim()) {
          missingMeta.push(f.label);
        }
      }
      if (missingMeta.length) {
        alert(t("scenario.alert.required_fields", "Bitte zuerst Pflichtfelder ausfuellen: {fields}", {
          fields: missingMeta.join(", ")
        }));
        return false;
      }
      return true;
    }

    function onSubmit() {
      if (!scenarioData) return;
      const completion = getScenarioCompletionState(scenarioData);
      updateSubmitButtonState(scenarioData);
      if (completion.missingCount > 0) {
        const missingLabel = completion.missingCount === 1
          ? t("scenario.alert.missing_inputs_one", "Es fehlt noch 1 Eingabe.")
          : t("scenario.alert.missing_inputs_many", "Es fehlen noch {count} Eingaben.", { count: completion.missingCount });
        alert(t("scenario.alert.complete_first", "{label} Bitte erst alles bearbeiten.", {
          label: missingLabel
        }));
        if (completion.firstIncompleteQuestionId) {
          scrollToQuestionById(completion.firstIncompleteQuestionId);
        }
        return;
      }
      if (!validateBeforeSubmit(scenarioData)) return;
      const results = buildScenarioResults(scenarioData);
      const progressUpdate = persistEvaluationProgress(scenarioData, results);
      lastResults = results;
      renderInlineReview(results, progressUpdate);
    }

    function setMetaField(fieldId, value) {
      answers["_meta_" + fieldId] = value;
      const input = document.querySelector(`input[data-field-id="${fieldId}"]`);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      updateSubmitButtonState();
    }

    function findInputsByQid(selector, qid) {
      return [...document.querySelectorAll(selector)].filter((el) => el.dataset.qid === qid);
    }

    function setSingleChoiceAnswer(qid, index) {
      const radios = findInputsByQid("input[type='radio'][data-qid]", qid);
      let matched = false;
      for (const radio of radios) {
        const hit = Number(radio.dataset.optionIndex) === Number(index);
        radio.checked = hit;
        if (hit) {
          matched = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      if (!matched) answers[qid] = Number(index);
    }

    function setOrderingAnswer(qid, items) {
      const order = Array.isArray(items) ? [...items] : [];
      answers[qid] = order;
      markQuestionTouched(qid);
    }

    function setMultiSelectAnswer(qid, indices) {
      const target = new Set((indices || []).map((n) => Number(n)));
      const boxes = findInputsByQid("input[type='checkbox'][data-qid]", qid);
      if (!boxes.length) {
        answers[qid] = target;
        return;
      }
      for (const cb of boxes) {
        const idx = Number(cb.dataset.optionIndex);
        cb.checked = target.has(idx);
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    function setNumberAnswer(qid, value) {
      answers[qid] = String(value);
      const input = document.querySelector(`input[type="number"][data-qid="${qid}"]`);
      if (input) {
        input.value = String(value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    function setMatchPairsAnswer(qid, mapping) {
      const target = mapping && typeof mapping === "object" ? mapping : {};
      answers[qid] = { ...target };
      const selects = findInputsByQid("select[data-qid]", qid);
      selects.forEach((select) => {
        const key = String(select.dataset.pairKey || "");
        if (!key) return;
        select.value = String(target[key] || "");
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    function setTableFillAnswer(qid, values) {
      const target = values && typeof values === "object" ? values : {};
      answers[qid] = { ...target };
      const inputs = findInputsByQid("input[data-qid]", qid).filter((el) => el.classList.contains("table-fill-input"));
      inputs.forEach((input) => {
        const key = String(input.dataset.cellKey || "");
        if (!key) return;
        input.value = String(target[key] || "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      const selects = findInputsByQid("select[data-qid]", qid).filter((el) => el.classList.contains("table-fill-select"));
      selects.forEach((select) => {
        const key = String(select.dataset.cellKey || "");
        if (!key) return;
        select.value = String(target[key] || "");
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    function setGapFillAnswer(qid, values) {
      const target = values && typeof values === "object" ? values : {};
      answers[qid] = { ...target };
      const inputs = findInputsByQid("input[data-qid]", qid).filter((el) => el.classList.contains("gap-fill-input"));
      if (inputs.length) {
        inputs.forEach((input) => {
          const key = String(input.dataset.gapKey || "");
          if (!key) return;
          input.value = String(target[key] || "");
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        return;
      }
      const wrap = document.querySelector(`.gap-fill-code[data-qid="${qid}"]`);
      if (wrap && typeof wrap.refreshGapFill === "function") {
        wrap.refreshGapFill();
        markQuestionTouched(qid);
      }
    }

    function setShortTextAnswer(qid, value) {
      answers[qid] = String(value);
      const ta = document.querySelector(`textarea[data-qid="${qid}"]`);
      if (ta) {
        ta.value = String(value);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    function firstWrongIndex(options, correctIndex) {
      if (!Array.isArray(options) || !options.length) return null;
      for (let i = 0; i < options.length; i++) {
        if (i !== correctIndex) return i;
      }
      return null;
    }

    function getCorrectMultiSelectIndices(q) {
      const indices = [];
      (q.options || []).forEach((opt, i) => {
        if (opt?.correct) indices.push(i);
      });
      return indices;
    }

    function getWrongMultiSelectIndices(q) {
      const correct = [];
      const wrong = [];
      (q.options || []).forEach((opt, i) => {
        if (opt?.correct) correct.push(i);
        else wrong.push(i);
      });
      if (wrong.length) return [wrong[0]];
      if (correct.length > 1) return correct.slice(0, correct.length - 1);
      return [];
    }

    function getWrongMatchPairValue(q, pair) {
      const expected = String(pair?.right || "");
      const options = Array.isArray(q.options) ? q.options : [];
      for (const option of options) {
        const value = typeof option === "string" ? option : String(option?.value || option?.text || "");
        if (normalize(value) !== normalize(expected)) return value;
      }
      return expected ? `${expected}_falsch` : "falsch";
    }

    function getWrongTableFillValue(cell) {
      const expected = cell?.expected;
      const options = Array.isArray(cell?.options) ? cell.options : [];
      for (const option of options) {
        const value = typeof option === "string" ? option : String(option?.value || option?.text || "");
        if (normalize(value) !== normalize(expected)) return value;
      }
      const asNumber = Number(String(expected).replace(",", "."));
      if (Number.isFinite(asNumber)) return String(asNumber + 1);
      return `${String(expected ?? "")}_falsch`;
    }

    function getWrongGapFillValue(q, field) {
      const blocked = new Set(
        [field?.line?.answer, ...(Array.isArray(field?.line?.alternatives) ? field.line.alternatives : [])]
          .map((value) => normalize(value))
      );
      for (const entry of getGapFillChoicePoolEntries(q)) {
        if (!blocked.has(normalize(entry.value))) return entry.value;
      }
      return "__falsch__";
    }

    function buildCorrectShortTextAnswer(q) {
      if (q.inputMode === "code" && String(q.language || "").toLowerCase() === "java") {
        return [
          "int berechneDifferenz (int zaehlerstandAlt, int zaehlerstandNeu) {",
          "    int differenz = -1;",
          "",
          "    if (zaehlerstandAlt >= 0 && zaehlerstandNeu >= 0) {",
          "        if (zaehlerstandAlt <= zaehlerstandNeu) {",
          "            differenz = zaehlerstandNeu - zaehlerstandAlt;",
          "        }",
          "    }",
          "    return differenz;",
          "}"
        ].join("\n");
      }
      const required = Array.isArray(q.requiredKeywords) ? q.requiredKeywords : [];
      const keywords = required.length
        ? t("scenario.debug.short_text.keywords", "Kernpunkte: {keywords}.", {
          keywords: required.join(", ")
        })
        : t("scenario.debug.short_text.keywords_documented", "Kernpunkte sind dokumentiert.");
      return t("scenario.debug.short_text.correct", "Die Aufgabe ist fachlich vollstaendig bearbeitet. {keywords} Die Antwort ist strukturiert, nachvollziehbar und erfuellt die geforderte Mindestlaenge.", {
        keywords
      });
    }

    function buildWrongShortTextAnswer(q) {
      if (q.inputMode === "code") {
        return [
          "int berechneDifferenz (int zaehlerstandAlt, int zaehlerstandNeu) {",
          "    return -1;",
          "}"
        ].join("\n");
      }
      return t("scenario.debug.short_text.wrong", "Kurze falsche Antwort ohne die geforderten Kernaspekte.");
    }

    function fillScenarioForEvaluation(data, mode = "correct") {
      if (!data) return;
      const useCorrect = mode === "correct";
      resetRuntimeState();
      buildPage(data);
      setMetaField("participant", useCorrect
        ? t("scenario.debug.meta.participant.correct", "Dev Richtig")
        : t("scenario.debug.meta.participant.wrong", "Dev Falsch"));
      setMetaField("group", useCorrect ? "LOCAL_OK" : "LOCAL_BAD");
      setMetaField("stationId", data.scenario?.station?.id || "LOCAL-ST");

      (data.questions || []).forEach((q) => {
        if (isStructuralQuestion(q)) return;

        if (q.type === "single_choice") {
          const chosen = useCorrect ? q.correctIndex : firstWrongIndex(q.options || [], q.correctIndex);
          setSingleChoiceAnswer(q.id, Number.isInteger(chosen) ? chosen : 0);
          return;
        }

        if (q.type === "multi_select") {
          setMultiSelectAnswer(q.id, useCorrect ? getCorrectMultiSelectIndices(q) : getWrongMultiSelectIndices(q));
          return;
        }

        if (q.type === "ordering") {
          const order = [...(q.correctOrder || q.items || [])];
          if (!useCorrect && order.length > 1) [order[0], order[1]] = [order[1], order[0]];
          setOrderingAnswer(q.id, order);
          return;
        }

        if (q.type === "match_pairs") {
          const mapping = {};
          (q.pairs || []).forEach((pair, pairIndex) => {
            const key = String(pair?.key || pairIndex);
            mapping[key] = useCorrect ? String(pair?.right || "") : getWrongMatchPairValue(q, pair);
          });
          setMatchPairsAnswer(q.id, mapping);
          return;
        }

        if (q.type === "table_fill") {
          const values = {};
          getTableFillFields(q).forEach((field) => {
            values[field.key] = useCorrect ? field.cell.expected : getWrongTableFillValue(field.cell);
          });
          setTableFillAnswer(q.id, values);
          return;
        }

        if (q.type === "number") {
          const expected = Number(q.expected);
          const tol = Number(q.toleranceAbs || 0);
          const base = Number.isFinite(expected) ? expected : 0;
          setNumberAnswer(q.id, useCorrect ? base : (base + tol + 1 || 1));
          return;
        }

        if (q.type === "gap_fill_code") {
          const values = {};
          getGapFillFields(q).forEach((field) => {
            values[field.key] = useCorrect ? field.line.answer : getWrongGapFillValue(q, field);
          });
          setGapFillAnswer(q.id, values);
          return;
        }

        if (q.type === "short_text") {
          setShortTextAnswer(q.id, useCorrect ? buildCorrectShortTextAnswer(q) : buildWrongShortTextAnswer(q));
        }
      });

      updateSubmitButtonState(data);
      onSubmit();
    }

    function buildPage(data) {
      workspaceLeft.innerHTML = "";
      toggleTaskNavDrawer(false);
      questionMarkerState = loadQuestionMarkerState(data);
      workspaceLeft.appendChild(createScenarioPanel(data));
      const qPanel = document.createElement("section");
      qPanel.className = "panel";
      qPanel.innerHTML = "<div id='inlineSummary' class='summary inline-summary hidden'></div>";
      inlineSummary = qPanel.querySelector("#inlineSummary");
      let visibleQuestionIndex = 0;
      (data.questions || []).forEach((q, idx) => {
        const displayIdx = isStructuralQuestion(q) ? null : visibleQuestionIndex++;
        qPanel.appendChild(renderQuestion(q, displayIdx));
      });
      workspaceLeft.appendChild(qPanel);
      renderTaskNavDrawer(data);
      syncAllQuestionMarkersWithAnswers(data);
      updateDevSubmitToolsVisibility();
      updateSubmitButtonState(data);
    }

    initAppBar();
    initUiLanguageFeature().catch((error) => {
      console.warn("Sprachmenü konnte nicht initialisiert werden.", error);
    });
    document.getElementById("btnSubmit").addEventListener("click", onSubmit);
    if (devFillWrongButton) {
      devFillWrongButton.addEventListener("click", () => fillScenarioForEvaluation(scenarioData, "wrong"));
    }
    if (devFillCorrectButton) {
      devFillCorrectButton.addEventListener("click", () => fillScenarioForEvaluation(scenarioData, "correct"));
    }
    window.addEventListener("resize", () => {
      if (lastResults) renderInlineReview(lastResults);
      refreshActiveTrainingReviewLayout();
    });
    window.addEventListener("orientationchange", () => {
      window.setTimeout(() => {
        refreshActiveTrainingReviewLayout();
      }, 80);
    });
    window.addEventListener("storage", (ev) => {
      const key = String(ev?.key || "");
      if (!key) return;
      if (key === TOOLTIP_VISIBILITY_STORAGE_KEY) {
        applyTooltipPreference(
          ev.newValue == null ? true : (ev.newValue === "1" || ev.newValue === "true"),
          { skipPersist: true }
        );
        return;
      }
      if (key === UI_LANGUAGE_STORAGE_KEY) {
        setUiLanguage(ev.newValue || DEFAULT_UI_LOCALE).catch(() => {});
        return;
      }
      const homeVisible = Boolean(workspaceLeft.querySelector(".home-layout"));
      if (!homeVisible) return;
      const touchesProgress = key.startsWith(`${SKILL_PROGRESS_STORAGE_KEY_PREFIX}::`) ||
        key.startsWith(`${SCENARIO_RATING_STORAGE_KEY_PREFIX}::`);
      const touchesCourseUnlock = key.startsWith(`${COURSE_UNLOCK_STATE_STORAGE_KEY_PREFIX}::`);
      if (touchesCourseUnlock) {
        const folder = sanitizeFolderName(key.split("::").pop() || "");
        if (folder) {
          delete courseUnlockSummaryByFolder[folder];
          ensureCourseUnlockSummaryLoaded(folder, getScenarioGroupForFolder(folder)?.items || null, { forceRefresh: true }).catch(() => {});
        }
        updateScenarioUnlockUi(activeScenarioFolder);
      }
      if (!touchesProgress && !touchesCourseUnlock && key !== HOME_SKILLS_FOLDER_STORAGE_KEY && key !== ACCESS_ENTRIES_STORAGE_KEY) {
        return;
      }
      showHomeContent(activeHomeSkillsFolder || activeScenarioFolder).catch(() => {});
    });
    (async () => {
      await ensureAccessKeyConfigLoaded();
      hydrateScenarioTreeCacheFromStorage();
      hydrateTrainingCacheFromStorage();
      const storedAccess = await loadStoredAccess();
      activeHomeSkillsFolder = loadStoredHomeSkillsFolder();
      if (!storedAccess) {
        renderUnlockScreen();
        refreshScenarioTreeInBackground().catch(() => {});
        return;
      }

      try {
        setUnlockedEntries(storedAccess.entries, storedAccess.activeFolder);
        primeScenarioMenuFromCache();
        warmScenarioTreeFromKnownState().catch(() => {});
        await showHomeContent();
        refreshScenarioTreeInBackground().catch(() => {});
        refreshTrainingCatalogInBackground().catch(() => {});
      } catch (err) {
        renderUnlockScreen(err.message);
      }
    })();
