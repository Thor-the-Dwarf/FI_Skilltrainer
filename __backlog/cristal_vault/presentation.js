import {
  getShapeConfigForSelection,
  resolveSelectionDetailItemsForRuntime
} from "./crystals/shared/selection-runtime.js";

(function () {
  const params = new URLSearchParams(window.location.search);
  const registry = window.cristalVaultCourseRegistry || null;
  const requestedCourseId = params.get("course") || registry?.defaultCourseId || "QuS2";
  const vault = typeof registry?.getCompiledVault === "function"
    ? registry.getCompiledVault(requestedCourseId)
    : registry?.vaultByCourseId?.[requestedCourseId] || window.qus2StoryVaultData;

  if (!vault) {
    console.error("Cristal Vault story data missing.");
    return;
  }

  function hexToRgba(hex, alpha) {
    const normalized = String(hex || "").replace("#", "");

    if (normalized.length !== 6) {
      return `rgba(20, 93, 151, ${alpha})`;
    }

    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function applyCourseTheme() {
    const theme = vault.course?.theme?.presentation;

    if (!theme) {
      return;
    }

    const style = document.documentElement.style;
    style.setProperty("--bg", theme.bg);
    style.setProperty("--bg-deep", theme.bgDeep);
    style.setProperty("--accent", theme.accent);
    style.setProperty("--accent-deep", theme.accentDeep);
    style.setProperty("--warm", theme.warm);
    style.setProperty("--accent-soft", hexToRgba(theme.accent, 0.1));
    style.setProperty("--line", hexToRgba(theme.accentDeep, 0.12));
    style.setProperty("--line-strong", hexToRgba(theme.accentDeep, 0.22));
  }

  const refs = {
    layout: document.querySelector(".presentation-layout"),
    cover: document.querySelector(".presentation-cover"),
    toc: document.querySelector(".presentation-toc"),
    stage: document.querySelector(".presentation-stage"),
    slide: document.querySelector(".presentation-slide"),
    explainer: document.querySelector(".presentation-explainer"),
    connector: document.querySelector(".presentation-connector-layer"),
    coverTransition: document.querySelector(".presentation-cover-transition-layer"),
    vault: document.getElementById("presentationVaultButton"),
    prev: document.getElementById("presentationPrevButton"),
    next: document.getElementById("presentationNextButton"),
    appbarLabel: document.getElementById("presentationAppbarLabel"),
  };

  const slideToCrystalId = {};
  const slideById = new Map();
  const explanationToCrystalIds = new Map();
  const crystalHierarchyVisualCache = new Map();
  const crystalPlaceholderMarkupCache = new Map();

  vault.presentationCristals.forEach((crystal) => {
    crystal.slides.forEach((slide) => {
      slideToCrystalId[slide.id] = crystal.id;
      slideById.set(slide.id, slide);

      slide.explanationIds.forEach((explanationId) => {
        const crystalIds = explanationToCrystalIds.get(explanationId) || new Set();
        crystalIds.add(crystal.id);
        explanationToCrystalIds.set(explanationId, crystalIds);
      });
    });
  });

  const state = {
    viewMode: params.get("view") === "article" ? "article" : "presentation",
    crystalId: null,
    slideId: null,
    isCrystalCoverActive: false,
    activeVariantKind: null,
    articleExplanationId: params.get("explanation") || null,
    activeExplanationId: null,
    explanationCaller: null,
    connectorFrame: 0,
    openTocMenuSlideId: null,
  };

  const TOC_MODE_SPECS = [
    { id: "minimal", label: "Minimal", meta: "1 Folie", variantKind: "minimalSlide", isImplemented: true },
    { id: "kompakt", label: "Kompakt", meta: "2-4 Folien", variantKind: "kompaktSlide", isImplemented: true },
    { id: "ausfuehrlich", label: "Ausführlich", meta: "5-8 Folien", variantKind: "ausfuehrlichSlide", isImplemented: true },
    { id: "umfassend", label: "Umfassend", meta: "8-15 Folien", variantKind: "umfassendSlide", isImplemented: true },
    { id: "story", label: "Story", meta: "Comic-Story", variantKind: "storySlide", isImplemented: false },
  ];
  const DEFAULT_IMPLEMENTED_VARIANT_KIND = "minimalSlide";
  const VARIANT_MASTER_OFFSETS = {
    minimalSlide: 0,
    kompaktSlide: 1,
    ausfuehrlichSlide: 2,
    umfassendSlide: 3,
    storySlide: 4,
  };
  const MINIMAL_MASTER_SPECS = {
    "topic-poster": {
      label: "Topic Poster",
      layout: "stage-bottom",
      description: "Grosses Einstiegsbild unten, Text oben.",
    },
    "subtopic-brief": {
      label: "Subtopic Brief",
      layout: "stage-right",
      description: "Kurze Einordnung links, Placeholder-Buehne rechts.",
    },
    "subtopic-stage": {
      label: "Subtopic Stage",
      layout: "stage-left",
      description: "Buehne links, verdichtete Begleittexte rechts.",
    },
    "support-brief": {
      label: "Support Brief",
      layout: "stage-right",
      description: "Sachliche Briefing-Struktur mit rechter Placeholder-Flaeche.",
    },
    "support-stage": {
      label: "Support Stage",
      layout: "stage-left",
      description: "Links verankerte Bildbuehne mit textlicher Stuetzspur.",
    },
  };
  const MINIMAL_MASTER_SEQUENCE = [
    "topic-poster",
    "subtopic-brief",
    "subtopic-stage",
    "support-brief",
    "support-stage",
  ];

  init();

  function init() {
    /*
    ZIEL:
    Die Praesentation mit lazy Registry-Daten und aufgeloestem Startzustand booten.
    WAS WURDE PROBIERT:
    Theme, URL-Zustand, Events und Initial-Render werden in einer kompakten Startsequenz zusammengezogen.
    WESHALB WURDE SO ENTSCHIEDEN:
    Damit bleibt der Einstieg vorhersehbar und die neue selection-basierte Deep-Link-Variante landet sofort im richtigen Kurskontext.
    */
    applyCourseTheme();
    resolveInitialState();
    bindGlobalEvents();
    render();
    exposeLab();
  }

  function resolveInitialState() {
    /*
    ZIEL:
    crystal-, slide- und jetzt auch selection-basierte Start-URLs auf einen gueltigen Anzeigestatus abbilden.
    WAS WURDE PROBIERT:
    Die Aufloesung prueft nacheinander slide, crystal, selection, explanation und faellt sonst auf die Kursdefaults zurueck.
    WESHALB WURDE SO ENTSCHIEDEN:
    So kann der Vault nur einen leichten selection-Link erzeugen, waehrend die Praesentation spaeter selbst den ersten passenden Kristall und Slide bestimmt.
    */
    const requestedSelectionId = Number.parseInt(params.get("selection") || "", 10);
    const requestedCrystal = params.get("crystal");
    const requestedSlide = params.get("slide");
    const requestedExplanation = params.get("explanation");
    const requestedCover = params.get("cover") === "1";
    const requestedVariant = params.get("variant") || vault.defaults.defaultVariantKind;

    state.activeVariantKind = normalizeVariantKind(requestedVariant);

    if (requestedExplanation && !vault.explanations[requestedExplanation]) {
      state.articleExplanationId = null;
    }

    if (!isImplementedVariant(state.activeVariantKind)) {
      state.activeVariantKind = DEFAULT_IMPLEMENTED_VARIANT_KIND;
    }

    if (requestedSlide && slideToCrystalId[requestedSlide]) {
      state.slideId = requestedSlide;
      state.crystalId = slideToCrystalId[requestedSlide];
    } else if (requestedCrystal && vault.crystalById[requestedCrystal]) {
      state.crystalId = requestedCrystal;
      state.slideId = vault.crystalById[requestedCrystal].slides[0]?.id || null;
    } else if (Number.isInteger(requestedSelectionId) && requestedSelectionId > 0) {
      const selectedCrystal = vault.presentationCristals.find(
        (crystal, crystalIndex) => (crystal.selectionId || crystalIndex + 1) === requestedSelectionId
      ) || null;

      state.crystalId = selectedCrystal?.id || vault.defaults.startingCrystalId;
      state.slideId = selectedCrystal?.slides?.[0]?.id || vault.crystalById[state.crystalId]?.slides?.[0]?.id || null;
    } else if (requestedExplanation && explanationToCrystalIds.has(requestedExplanation)) {
      state.crystalId = Array.from(explanationToCrystalIds.get(requestedExplanation))[0];
      state.slideId = vault.crystalById[state.crystalId].slides[0]?.id || null;
    } else {
      state.crystalId = vault.defaults.startingCrystalId;
      state.slideId = vault.crystalById[state.crystalId].slides[0]?.id || null;
    }

    if (!isArticleView() && requestedCover && state.crystalId) {
      state.isCrystalCoverActive = true;
      state.slideId = null;
    }

    document.body.classList.toggle("is-article-view", isArticleView());
  }

  function bindGlobalEvents() {
    refs.vault?.addEventListener("click", () => {
      window.location.assign(buildVaultUrl());
    });
    refs.prev?.addEventListener("click", () => stepSlide(-1));
    refs.next?.addEventListener("click", () => stepSlide(1));

    refs.stage?.addEventListener("click", (event) => {
      const explanationButton = event.target.closest("[data-explanation-id]");
      if (explanationButton) {
        const explanationId = explanationButton.dataset.explanationId || "";
        if (!explanationId) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (state.activeExplanationId === explanationId) {
          closeExplanation();
        } else {
          state.activeExplanationId = explanationId;
          state.explanationCaller = explanationButton;
        }

        renderExplainer();
        return;
      }
    });

    document.addEventListener("click", handleDelegatedClick);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeTocMenu({ rerender: true });
        closeExplanation();
        renderExplainer();
      }

      if (isArticleView()) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        stepSlide(1);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        stepSlide(-1);
      }
    });

    window.addEventListener("resize", scheduleConnector);
    window.addEventListener("scroll", scheduleConnector, true);
  }

  /*
  ZIEL:
  Alle wiederkehrenden Presenter-Klickziele zentral behandeln, statt sie nach jedem Render erneut an einzelne DOM-Knoten zu binden.
  WAS WURDE PROBIERT:
  Zuvor wurden Cover-, TOC-, Slide- und Varianten-Buttons nach renderCover, renderToc und renderStage jeweils neu gebunden.
  WESHALB WURDE SO ENTSCHIEDEN:
  Event-Delegation reduziert Rebind-Kosten bei häufigen Renders, macht den Miniaturbild-Pfad robuster und vermeidet doppelte Listener auf kurzlebigen DOM-Strukturen.
  */
  function handleDelegatedClick(event) {
    const vaultDetailButton = event.target.closest("[data-vault-detail-nav]");
    if (vaultDetailButton) {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(buildVaultUrl({ openContent: false }));
      return;
    }

    const crystalCoverButton = event.target.closest("[data-crystal-cover-nav]");
    if (crystalCoverButton) {
      event.preventDefault();
      navigateToCrystalCover(crystalCoverButton.dataset.crystalCoverNav || state.crystalId);
      return;
    }

    const slideNavButton = event.target.closest("[data-slide-nav]");
    if (slideNavButton) {
      event.preventDefault();
      navigateToSlide(slideNavButton.dataset.slideNav || state.slideId);
      return;
    }

    const tocMenuTriggerButton = event.target.closest("[data-toc-menu-trigger]");
    if (tocMenuTriggerButton) {
      event.preventDefault();
      event.stopPropagation();
      toggleTocMenu(tocMenuTriggerButton.dataset.tocMenuTrigger || "");
      return;
    }

    const tocModeOptionButton = event.target.closest("[data-toc-mode-option]");
    if (tocModeOptionButton) {
      event.preventDefault();
      event.stopPropagation();
      activatePresentationVariant(tocModeOptionButton.dataset.tocModeOption || "");
      closeTocMenu({ rerender: false });
      render();
      return;
    }

    if (!event.target.closest(".presentation-toc__branch")) {
      closeTocMenu({ rerender: true });
    }

    if (
      !state.activeExplanationId ||
      event.target.closest("[data-explanation-id]") ||
      event.target.closest(".presentation-explainer")
    ) {
      return;
    }

    closeExplanation();
    renderExplainer();
  }

  /*
  ZIEL:
  Eine schlanke Lab-API bereitstellen, die dieselben Presenter-Navigationspfade nutzt wie die echte UI.
  WAS WURDE PROBIERT:
  Zuerst schrieb die Lab-API den Presenter-State direkt selbst um und rief danach render() auf.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die Weiterleitung auf navigateToSlide und navigateToCrystalCover verhindert Logikdrift zwischen Testpfad und realer Bedienung.
  */
  function exposeLab() {
    const labApi = {
      getState() {
        return JSON.parse(JSON.stringify(state));
      },
      openCrystal(crystalId) {
        if (!vault.crystalById[crystalId]) {
          return false;
        }

        navigateToSlide(vault.crystalById[crystalId].slides[0]?.id || null);
        return true;
      },
      selectSlide(slideId) {
        if (!slideToCrystalId[slideId]) {
          return false;
        }

        navigateToSlide(slideId);
        return true;
      },
      openCrystalCover(crystalId) {
        if (!vault.crystalById[crystalId]) {
          return false;
        }

        navigateToCrystalCover(crystalId);
        return true;
      },
    };

    window.cristalVaultPresentationLab = labApi;
    window.qus2VaultPresentationLab = labApi;
  }

  function render() {
    document.body.classList.toggle("is-article-view", isArticleView());
    document.body.classList.toggle("is-crystal-cover-active", isCrystalCoverActive());
    renderCover();
    renderToc();
    renderStage();
    renderExplainer();
    updateAppBar();
    rememberActiveSlideView();
    updateDocumentTitle();
    syncUrl();
  }

  /*
  ZIEL:
  Das kompakte Sidebar-Cover fuer den aktuell aktiven Kristall im Presenter aktuell halten.
  WAS WURDE PROBIERT:
  Das Sidebar-Cover wurde erst als statischer Placeholder und spaeter als datengetriebener Kristall-Renderpfad aufgebaut.
  WESHALB WURDE SO ENTSCHIEDEN:
  Das Sidebar-Cover soll leicht bleiben, aber trotzdem dieselbe Kristallhierarchie wie Stage und Vault andeuten.
  */
  function renderCover() {
    if (!refs.cover) {
      return;
    }

    if (isArticleView()) {
      refs.cover.textContent = "";
      return;
    }

    const crystal = getCurrentCrystal();

    const nextMarkup = renderCrystalPlaceholderMarkup(crystal, "sidebar");
    if (refs.cover.innerHTML !== nextMarkup) {
      refs.cover.innerHTML = nextMarkup;
    }
  }

  /*
  ZIEL:
  Die Presenter-TOC aus Kursdaten und aktuellem Kristallzustand neu zusammensetzen.
  WAS WURDE PROBIERT:
  Zuerst wurden TOC-Inhalte inklusive Event-Bindungen vollständig pro Render aufgebaut.
  WESHALB WURDE SO ENTSCHIEDEN:
  Das Markup wird weiter pro Zustand neu erzeugt, aber die Interaktion laeuft jetzt delegiert, damit Re-Renders nicht immer neue Listener produzieren.
  */
  function renderToc() {
    if (!refs.toc) {
      return;
    }

    if (isArticleView()) {
      refs.toc.textContent = "";
      return;
    }

    const crystal = getCurrentCrystal();

    const nextMarkup = `
      <p class="presentation-toc__label">${escapeHtml(vault.course.title)}</p>
      ${renderCrystalTocGroup(crystal)}
    `;

    if (refs.toc.innerHTML !== nextMarkup) {
      refs.toc.innerHTML = nextMarkup;
    }
  }

  function renderCrystalTocGroup(crystal) {
    return `
      <div class="presentation-toc__group">
        <button class="presentation-toc__link presentation-toc__link--h2 has-active-descendant${isCrystalCoverActive() ? " is-active" : ""}" type="button" data-crystal-cover-nav="${escapeHtml(crystal.id)}">
          ${escapeHtml(crystal.title)}
        </button>
        <div class="presentation-toc__children presentation-toc__children--h3">
          ${crystal.slides.map((slide) => renderSlideTocBranch(crystal, slide)).join("")}
        </div>
      </div>
    `;
  }

  function renderSlideTocBranch(crystal, slide) {
    const isActive = slide.id === state.slideId;
    const isMenuOpen = state.openTocMenuSlideId === slide.id;
    const showChildBeats = shouldShowStoryBeats();

    return `
      <div class="presentation-toc__branch presentation-toc__branch--h3${isMenuOpen ? " is-menu-open" : ""}">
        <div class="presentation-toc__row presentation-toc__row--h3">
          <button
            class="presentation-toc__menu-trigger"
            type="button"
            data-toc-menu-trigger="${escapeHtml(slide.id)}"
            aria-label="Ansichten fuer ${escapeHtml(slide.title)}"
            aria-haspopup="menu"
            aria-expanded="${isMenuOpen ? "true" : "false"}"
          >
            <span class="presentation-toc__menu-dot"></span>
            <span class="presentation-toc__menu-dot"></span>
            <span class="presentation-toc__menu-dot"></span>
          </button>
          <button class="presentation-toc__link presentation-toc__link--h3${isActive ? " is-active" : ""}" type="button" data-slide-nav="${escapeHtml(slide.id)}">
            ${escapeHtml(slide.title)}
          </button>
          ${renderTocModeMenu(slide.id)}
        </div>
        ${
          showChildBeats
            ? `
              <div class="presentation-toc__children presentation-toc__children--h4">
                ${buildComicPlan(crystal, slide).panels
                  .map(
                    (panel) => `
                      <button class="presentation-toc__link presentation-toc__link--h4" type="button" data-slide-nav="${escapeHtml(slide.id)}">
                        ${escapeHtml(panel.title)}
                      </button>
                    `
                  )
                  .join("")}
              </div>
            `
            : ""
        }
      </div>
    `;
  }

  function renderTocModeMenu(slideId) {
    return `
      <div class="presentation-toc__menu" role="menu" data-toc-menu="${escapeHtml(slideId)}">
        ${TOC_MODE_SPECS.map((spec) => `
          <button
            class="presentation-toc__menu-option${spec.variantKind === getActiveVariantKind() ? " is-active" : ""}${spec.isImplemented ? "" : " is-pending"}"
            type="button"
            data-toc-mode-option="${escapeHtml(spec.id)}"
            data-slide-id="${escapeHtml(slideId)}"
            role="menuitemradio"
            aria-checked="${spec.variantKind === getActiveVariantKind() ? "true" : "false"}"
          >
            <span class="presentation-toc__menu-label">${escapeHtml(spec.label)}</span>
            <span class="presentation-toc__menu-meta">${escapeHtml(spec.meta)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderStage() {
    if (!refs.slide) {
      return;
    }

    if (isExplanationArticleView() && getCurrentExplanation()) {
      renderExplanationArticle();
      return;
    }

    if (isCrystalCoverActive()) {
      renderCrystalCoverSlide();
      return;
    }

    renderMinimalSlide();
  }

  /*
  ZIEL:
  Den grossen Stage-Cover-Zustand fuer einen Kristall im separaten Presenter rendern.
  WAS WURDE PROBIERT:
  Der Stage-Cover war erst ein generischer Platzhalter und wurde dann auf dieselbe datengetriebene Kristallhierarchie wie das Sidebar-Cover gehoben.
  WESHALB WURDE SO ENTSCHIEDEN:
  So bleibt der eigentliche Praesentationspfad visuell konsistent, waehrend Stage und Sidebar dieselbe Kristalllogik mit unterschiedlicher Gewichtung nutzen.
  */
  function renderCrystalCoverSlide() {
    const crystal = getCurrentCrystal();

    refs.slide.className = "presentation-slide presentation-slide--crystal-cover";
    refs.slide.innerHTML = `
      <header class="presentation-slide__header">
        <div class="presentation-slide__masthead">
          <div class="presentation-slide__intro">
            <h1 class="presentation-slide__title">${escapeHtml(crystal.title)}</h1>
            <p class="presentation-slide__lead">${escapeHtml(crystal.storyArc)}</p>
          </div>
        </div>
      </header>

      <section class="presentation-crystal-slide__visual">
        ${renderCrystalPlaceholderMarkup(crystal, "stage")}
      </section>
    `;
  }

  function renderStorySlide() {
    const crystal = getCurrentCrystal();
    const slide = getCurrentSlide();
    const comic = buildComicPlan(crystal, slide);

    refs.slide.className = "presentation-slide presentation-slide--story";
    refs.slide.innerHTML = `
      <header class="presentation-slide__header">
        <div class="presentation-slide__masthead">
          <div class="presentation-slide__intro">
            <h1 class="presentation-slide__title">${escapeHtml(slide.title)}</h1>
            <p class="presentation-slide__lead">${escapeHtml(slide.storyLead)}</p>
          </div>
        </div>
      </header>

      <section class="comic-board" data-layout="${escapeHtml(comic.layout)}">
        ${comic.panels.map((panel) => renderComicPanel(panel)).join("")}
      </section>
    `;

    if (state.activeExplanationId) {
      state.explanationCaller =
        refs.slide.querySelector(`[data-explanation-id="${cssEscape(state.activeExplanationId)}"]`) || null;
    }
  }

  function renderMinimalSlide() {
    const crystal = getCurrentCrystal();
    const slide = getCurrentSlide();
    const activeVariantKind = getActiveVariantKind();
    const activeVariantSpec = getVariantSpecByKind(activeVariantKind);
    const variant = slide.variants?.[activeVariantKind] || {};
    const masterId = resolveMinimalMaster(crystal, slide, activeVariantKind);
    const masterSpec = MINIMAL_MASTER_SPECS[masterId] || MINIMAL_MASTER_SPECS["support-brief"];
    const explanationMarkup = renderExplanationTermCollection(slide.explanationIds, slide.id);
    const relatedSlidesMarkup = renderRelatedSlideLinks(slide);
    const sourceSeedsMarkup = renderSourceSeedChips(slide.sourceSeedIds);
    const placeholderLead =
      variant.focus ||
      `${activeVariantSpec?.label || "Variante"}-Placeholder fuer ${slide.title}. Die spaetere Fassung wird hier als eigene Arbeitsfolie ausgearbeitet.`;
    /*
    ZIEL:
    Echte Fassungen sprachlich als fertige Stufen und nicht weiter als Placeholder markieren.
    WAS WURDE PROBIERT:
    Der Renderer liest jetzt Status und Detailfeld der Variante aus und schaltet Beschriftung sowie Fallback-Texte daran um.
    WESHALB WURDE SO ENTSCHIEDEN:
    Sobald erste Slides redaktionell ausgebaut sind, darf die Buehne diesen Fortschritt nicht durch Placeholder-Wording entwerten.
    */
    const variantIsReady = variant.status === "ready";
    const variantSectionLabel = variantIsReady
      ? (activeVariantSpec?.label || "Variante")
      : `${activeVariantSpec?.label || "Variante"}-Placeholder`;
    const placeholderCopy =
      variant.notes ||
      (
        variantIsReady
          ? `${activeVariantSpec?.label || "Variante"} bildet ${slide.title} bereits als nutzbare Fachfassung innerhalb des Kristalls ${crystal.title} ab.`
          : `Dieses Master reserviert die spaetere ${activeVariantSpec?.label || "Variante"}-Fassung fuer ${slide.title} im Kristall ${crystal.title}.`
      );
    const placeholderDetail =
      variant.detail ||
      variant.sourceBrief ||
      `Vorlaeufig bleibt die Folie eine Strukturprobe: Kernthese, Abgrenzung, Verknuepfungen und Visual werden spaeter redaktionell in dieser Masterform konkretisiert.`;
    const placeholderSummary =
      variant.structureNote ||
      slide.summary ||
      `${slide.title} bleibt hier bewusst noch Placeholder, wird aber schon in der spaeteren ${activeVariantSpec?.label || "Minimal"}-Komposition verankert.`;
    const summaryRailMarkup = renderMinimalSummaryRail(slide, crystal, masterSpec, activeVariantKind);
    const bulletItems = Array.isArray(variant.bullets) ? variant.bullets.filter(Boolean) : [];
    const bulletMarkup = bulletItems.length
      ? `<ul class="presentation-slide__beats">${bulletItems.map((item) => `<li class="presentation-slide__bullet">${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<p class="presentation-slide__empty">Fachpunkte folgen spaeter in dieser Stufe.</p>`;
    const variantContextCopy = {
      minimalSlide: variant.context || `Kristall ${crystal.sortKey} ordnet ${slide.title} als eigene Minimalfolie ein.`,
      kompaktSlide: variant.context || `${slide.title} wird hier als Rueckholfassung mit Kernbegriffen, Quellen und Praxisanschluss aufgebaut.`,
      ausfuehrlichSlide: variant.context || `${slide.title} wird hier als Ausbildungsfassung mit sauberem Zusammenhang und mehr Stuetzelementen vorbereitet.`,
      umfassendSlide: variant.context || `${slide.title} wird hier als zugaengliche Tiefenfassung mit weiterer Einordnung und Transfer aufgebaut.`
    };
    const variantTransferCopy = {
      minimalSlide: variant.transfer || "Der Anschluss bleibt in dieser Stufe knapp.",
      kompaktSlide: variant.transfer || "Die verdichtete Stufe fuehrt spaeter in Praxis- und Anschlussfragen.",
      ausfuehrlichSlide: variant.transfer || "Die Ausbildungsfassung verknuepft Grundlagen, Reihenfolge und erste Folgewirkungen.",
      umfassendSlide: variant.transfer || "Die Tiefenfassung bindet Transfer, Anschlusswissen und moegliche Fehlleitungen ein."
    };
    const variantSourceCopy = {
      minimalSlide: variant.sourceBrief || "Die Seed-Basis bleibt vorerst eng an der Kristallquelle.",
      kompaktSlide: variant.sourceBrief || "Die Stufe stuetzt sich auf den fachlichen Kernfall des Kristalls.",
      ausfuehrlichSlide: variant.sourceBrief || "Die Stufe bindet Ausgangslage, Ordnung und Anschluss der Kristallquelle gemeinsam ein.",
      umfassendSlide: variant.sourceBrief || "Die Stufe nutzt die Kristallquelle als Ausgangspunkt und oeffnet sie in Richtung Nachbarwissen."
    };
    const variantVisualCopy = {
      minimalSlide: variant.visualBrief || `Placeholderflaeche fuer spaetere NanoBanana-Grafik im Master ${masterSpec.label}.`,
      kompaktSlide: variant.visualBrief || `Verdichtete Visualfassung fuer ${activeVariantSpec?.label || "Kompakt"} im Master ${masterSpec.label}.`,
      ausfuehrlichSlide: variant.visualBrief || `Ausbildungsvisual mit mehr Kontextspuren im Master ${masterSpec.label}.`,
      umfassendSlide: variant.visualBrief || `Tiefenvisual mit mehr Orientierung und Umfeld im Master ${masterSpec.label}.`
    };
    const variantStructureCopy = {
      minimalSlide: variant.structureNote || "Die Struktur bleibt eng und belastbar.",
      kompaktSlide: variant.structureNote || "Die Struktur verdichtet Begriff, Einordnung und Praxisanschluss.",
      ausfuehrlichSlide: variant.structureNote || "Die Struktur laesst Reihenfolge, Teilaspekte und Folgewirkungen sichtbar werden.",
      umfassendSlide: variant.structureNote || "Die Struktur oeffnet den Stoff fuer Leser mit weniger Vorwissen und mehr Orientierungsbedarf."
    };
    const variantErrorCopy = {
      minimalSlide: variant.errorPattern || "Fehlerbilder werden in dieser Stufe nur angedeutet.",
      kompaktSlide: variant.errorPattern || "Typische Fehlbilder folgen spaeter.",
      ausfuehrlichSlide: variant.errorPattern || "Typische Fehlbilder folgen spaeter.",
      umfassendSlide: variant.errorPattern || "Typische Fehlbilder folgen spaeter."
    };
    const variantLabel = activeVariantSpec?.label || "Variante";
    let insightsMarkup = "";

    if (activeVariantKind === "minimalSlide") {
      insightsMarkup = `
        <article class="presentation-master__card presentation-master__card--context">
          <span class="presentation-master__label">Kontext</span>
          <p class="presentation-master__text">${escapeHtml(variantContextCopy.minimalSlide)}</p>
        </article>

        <article class="presentation-master__card presentation-master__card--links">
          <span class="presentation-master__label">Hyperlinks</span>
          ${
            relatedSlidesMarkup
              ? `<div class="presentation-slide__link-grid">${relatedSlidesMarkup}</div>`
              : `<p class="presentation-slide__empty">Dieser Slide verweist aktuell auf keine weiteren Wiki-Slides.</p>`
          }
        </article>

        <article class="presentation-master__card presentation-master__card--visual-note">
          <span class="presentation-master__label">Visual</span>
          <p class="presentation-master__text presentation-master__text--muted">${escapeHtml(variantVisualCopy.minimalSlide)}</p>
        </article>
      `;
    } else if (activeVariantKind === "kompaktSlide") {
      insightsMarkup = `
        <article class="presentation-master__card">
          <span class="presentation-master__label">Einordnung</span>
          <p class="presentation-master__text">${escapeHtml(variantContextCopy.kompaktSlide)}</p>
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Transfer</span>
          <p class="presentation-master__text">${escapeHtml(variantTransferCopy.kompaktSlide)}</p>
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Kernpunkte</span>
          ${bulletMarkup}
        </article>

        <article class="presentation-master__card presentation-master__card--links">
          <span class="presentation-master__label">Hyperlinks</span>
          ${
            relatedSlidesMarkup
              ? `<div class="presentation-slide__link-grid">${relatedSlidesMarkup}</div>`
              : `<p class="presentation-slide__empty">Weitere Slide-Anschluesse folgen spaeter.</p>`
          }
        </article>
      `;
    } else if (activeVariantKind === "ausfuehrlichSlide") {
      insightsMarkup = `
        <article class="presentation-master__card">
          <span class="presentation-master__label">Zusammenhang</span>
          <p class="presentation-master__text">${escapeHtml(variantContextCopy.ausfuehrlichSlide)}</p>
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Struktur</span>
          <p class="presentation-master__text">${escapeHtml(variantStructureCopy.ausfuehrlichSlide)}</p>
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Fachpunkte</span>
          ${bulletMarkup}
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Quellenbild</span>
          <p class="presentation-master__text">${escapeHtml(variantSourceCopy.ausfuehrlichSlide)}</p>
        </article>

        <article class="presentation-master__card presentation-master__card--links">
          <span class="presentation-master__label">Hyperlinks</span>
          ${
            relatedSlidesMarkup
              ? `<div class="presentation-slide__link-grid">${relatedSlidesMarkup}</div>`
              : `<p class="presentation-slide__empty">Weitere Slide-Anschluesse folgen spaeter.</p>`
          }
        </article>
      `;
    } else {
      insightsMarkup = `
        <article class="presentation-master__card">
          <span class="presentation-master__label">Einordnung</span>
          <p class="presentation-master__text">${escapeHtml(variantContextCopy.umfassendSlide)}</p>
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Fehlerbild</span>
          <p class="presentation-master__text">${escapeHtml(variantErrorCopy.umfassendSlide)}</p>
        </article>

        <article class="presentation-master__card">
          <span class="presentation-master__label">Transfer</span>
          <p class="presentation-master__text">${escapeHtml(variantTransferCopy.umfassendSlide)}</p>
        </article>

        <article class="presentation-master__card presentation-master__card--visual-note">
          <span class="presentation-master__label">Visual</span>
          <p class="presentation-master__text presentation-master__text--muted">${escapeHtml(variantVisualCopy.umfassendSlide)}</p>
        </article>

        <article class="presentation-master__card presentation-master__card--links">
          <span class="presentation-master__label">Hyperlinks</span>
          ${
            relatedSlidesMarkup
              ? `<div class="presentation-slide__link-grid">${relatedSlidesMarkup}</div>`
              : `<p class="presentation-slide__empty">Weitere Slide-Anschluesse folgen spaeter.</p>`
          }
        </article>
      `;
    }

    refs.slide.className = `presentation-slide presentation-slide--structured presentation-slide--${escapeHtml(activeVariantKind)}`;
    refs.slide.innerHTML = `
      <header class="presentation-slide__header">
        <div class="presentation-slide__masthead">
          <div class="presentation-slide__intro">
            <h1 class="presentation-slide__title">${escapeHtml(slide.title)}</h1>
            <p class="presentation-slide__lead">${escapeHtml(placeholderLead)}</p>
          </div>
        </div>
      </header>

      <section class="presentation-master" data-master="${escapeHtml(masterId)}" data-layout="${escapeHtml(masterSpec.layout)}">
        <div class="presentation-master__copy">
          <article class="presentation-master__card presentation-master__card--copy">
            <span class="presentation-master__label">${escapeHtml(variantSectionLabel)}</span>
            <p class="presentation-master__text">${escapeHtml(placeholderCopy)}</p>
            <p class="presentation-master__text">${escapeHtml(placeholderDetail)}</p>
            <p class="presentation-master__text presentation-master__text--muted">${escapeHtml(placeholderSummary)}</p>
          </article>

          <article class="presentation-master__card presentation-master__card--glossary">
            <span class="presentation-master__label">Begriffserklaerungen</span>
            ${
              explanationMarkup
                ? `<div class="presentation-slide__glossary-wrap">${explanationMarkup}</div>`
                : `<p class="presentation-slide__empty">Noch keine Begriffserklaerungen verknuepft.</p>`
            }
          </article>
        </div>

        <aside class="presentation-master__side">
          <article class="presentation-master__card presentation-master__card--master-info">
            <span class="presentation-master__label">Master</span>
            <p class="presentation-master__text">${escapeHtml(masterSpec.label)}</p>
            <p class="presentation-master__text presentation-master__text--muted">${escapeHtml(masterSpec.description)}</p>
          </article>

          <article class="presentation-master__card presentation-master__card--sources">
            <span class="presentation-master__label">Verknuepfte Quellen</span>
            ${
              sourceSeedsMarkup
                ? `<div class="presentation-master__chip-row">${sourceSeedsMarkup}</div>`
                : `<p class="presentation-slide__empty">Noch keine Seed-Zuordnung sichtbar.</p>`
            }
          </article>
        </aside>

        <div class="presentation-master__insights">
          ${insightsMarkup}
        </div>

        <div class="presentation-master__visual">
          <div class="presentation-slide__visual">
            <div class="presentation-slide__visual-label">${escapeHtml(`${slide.visualLabel || slide.title} ${variantLabel}`)}</div>
          </div>
        </div>

        <div class="presentation-master__summary">
          ${summaryRailMarkup}
        </div>
      </section>
    `;

    if (state.activeExplanationId) {
      state.explanationCaller =
        refs.slide.querySelector(`[data-explanation-id="${cssEscape(state.activeExplanationId)}"]`) || null;
    }
  }

  function renderExplanationTerm(explanationId, sourceSlideId) {
    const explanation = vault.explanations[explanationId];
    const activeClass = explanationId === state.activeExplanationId ? " is-active" : "";

    return `
      <span class="presentation-term">
        <button
          class="presentation-term__button${activeClass}"
          type="button"
          data-explanation-id="${escapeHtml(explanationId)}"
          aria-label="Begriffserklaerung fuer ${escapeHtml(explanation?.title || explanationId)} anzeigen"
        >
          ${escapeHtml(explanation?.title || explanationId)}
        </button>
        <a
          class="presentation-term__article"
          href="${escapeHtml(buildExplanationArticleUrl(explanationId, sourceSlideId))}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Artikel
        </a>
      </span>
    `;
  }

  function buildComicPlan(crystal, slide) {
    const lower = `${crystal.title} ${slide.title} ${slide.storyScene} ${slide.storyOutcome}`.toLowerCase();
    const baseMinutes = 8 * 60 + (crystal.dayIndex - 1) * 70 + (slide.orderInCristal - 1) * 24;
    const scenes = resolveSceneSequence(lower, slide.narrativeRole);
    const bubbleTexts = [
      shortenBubbleText(slide.storyScene),
      ...slide.beats.map((beat) => shortenBubbleText(beat)),
      shortenBubbleText(slide.storyOutcome),
    ];
    const layout = resolveComicLayout(slide.narrativeRole, bubbleTexts.length);
    const timeStep = Math.max(5, Math.round((slide.estimatedMinutes || 11) / Math.max(bubbleTexts.length, 1)));

    const panels = bubbleTexts.map((text, index) => ({
      area: `p${index + 1}`,
      time: formatStoryTime(baseMinutes + timeStep * index),
      title:
        index === 0
          ? "Ausgangslage"
          : index === bubbleTexts.length - 1
            ? "Wirkung"
            : `Beat ${index}`,
      text,
      bubbleKind:
        index === 0 ? "thought" : index === bubbleTexts.length - 1 ? "caption" : index % 2 === 0 ? "speech" : "thought",
      scene: scenes[index % scenes.length],
      cast:
        /audit|norm|zertifizierung/.test(lower)
          ? "review"
          : /sicherheit|schutz|risiko|backup|berechtig/.test(lower)
            ? "security"
            : "office",
    }));

    return { layout, panels };
  }

  function resolveSceneSequence(lower, narrativeRole) {
    if (/audit|norm|zertifizierung/.test(lower)) {
      return ["audit-table", "meeting-room", "board-review", "checklist-desk", "process-wall"];
    }

    if (/pdca|verbesserung|lenkung|change|prozess/.test(lower)) {
      return ["process-wall", "meeting-room", "checklist-desk", "board-review", "office-focus"];
    }

    if (/sicherheit|schutz|risiko|backup|berechtig|zugriff|daten/.test(lower)) {
      return ["security-room", "meeting-room", "checklist-desk", "board-review", "process-wall"];
    }

    if (/ticket|rueckstau|abnahme|rolle|fehlerbild/.test(lower)) {
      return ["office-chaos", "ticket-board", "meeting-room", "checklist-desk", "office-focus"];
    }

    if (/pruefung|test|kennzahl|nachweis/.test(lower)) {
      return ["checklist-desk", "board-review", "meeting-room", "process-wall", "office-focus"];
    }

    if (normalizeText(narrativeRole).includes("rahmen")) {
      return ["meeting-room", "board-review", "checklist-desk", "office-focus", "process-wall"];
    }

    return ["office-focus", "meeting-room", "checklist-desk", "board-review", "process-wall"];
  }

  function resolveComicLayout(narrativeRole, panelCount) {
    const normalizedRole = normalizeText(narrativeRole || "");

    if (panelCount >= 5 || normalizedRole.includes("regelkreis") || normalizedRole.includes("verstetigung")) {
      return "five-panel";
    }

    if (normalizedRole.includes("konflikt") || normalizedRole.includes("diagnose")) {
      return "four-panel-tension";
    }

    return "four-panel-flow";
  }

  function renderComicPanel(panel) {
    return `
      <article class="comic-panel comic-panel--${escapeHtml(panel.scene)} comic-panel--${escapeHtml(panel.cast)}" style="grid-area:${escapeHtml(panel.area)}">
        <div class="comic-panel__headline">
          <span class="comic-panel__time">${escapeHtml(panel.time)}</span>
        </div>
        <div class="comic-scene">
          ${renderSceneDrawing(panel.scene)}
        </div>
        <span class="comic-panel__caption">${escapeHtml(panel.title)}</span>
      </article>
    `;
  }

  function renderSceneDrawing(scene) {
    return `
      <div class="comic-room comic-room--${escapeHtml(scene)}">
        <div class="comic-room__wall"></div>
        <div class="comic-room__window"></div>
        <div class="comic-room__board"></div>
        <div class="comic-room__table"></div>
        <div class="comic-room__desk comic-room__desk--one"></div>
        <div class="comic-room__desk comic-room__desk--two"></div>
        <div class="comic-room__monitor comic-room__monitor--one"></div>
        <div class="comic-room__monitor comic-room__monitor--two"></div>
        <div class="comic-room__ticket comic-room__ticket--one"></div>
        <div class="comic-room__ticket comic-room__ticket--two"></div>
        <div class="comic-room__ticket comic-room__ticket--three"></div>
        <div class="comic-room__shield"></div>
        <div class="comic-room__clipboard"></div>
        <div class="comic-room__flow"></div>
        <div class="comic-character comic-character--lead"></div>
        <div class="comic-character comic-character--peer"></div>
        <div class="comic-character comic-character--observer"></div>
      </div>
    `;
  }

  function shortenBubbleText(text) {
    const normalized = String(text || "").trim();
    if (normalized.length <= 86) {
      return normalized;
    }

    return `${normalized.slice(0, 83).trimEnd()}...`;
  }

  function formatStoryTime(totalMinutes) {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function renderExplanationArticle() {
    const explanation = getCurrentExplanation();
    const relatedSlides = getSlidesUsingExplanation(explanation.id);
    const relatedCrystals = Array.from(explanationToCrystalIds.get(explanation.id) || [])
      .map((crystalId) => vault.crystalById[crystalId])
      .filter(Boolean);

    refs.slide.className = "presentation-slide presentation-slide--explanation";
    refs.slide.innerHTML = `
      <header class="presentation-slide__header">
        <h1 class="presentation-slide__title">${escapeHtml(explanation.title)}</h1>
        <p class="presentation-slide__lead">${escapeHtml(explanation.grundsaetzlich)}</p>
      </header>

      <section class="presentation-slide__story">
        <article>
          <strong>Noch klarer</strong>
          <p>${escapeHtml(explanation.nochKlarer)}</p>
        </article>
        <article>
          <strong>Praxis</strong>
          <p>${escapeHtml(explanation.praxis)}</p>
        </article>
      </section>

      <section class="presentation-slide__links">
        <strong>Verwendet in Wiki-Slides</strong>
        <div class="presentation-slide__link-grid">
          ${relatedSlides.map((slide) => `
            <a class="presentation-slide__link" href="${escapeHtml(buildArticleUrl(slide.id))}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(slide.title)}
            </a>
          `).join("")}
        </div>
      </section>

      <section class="presentation-slide__links presentation-slide__links--secondary">
        <strong>Kristallkontext</strong>
        <div class="presentation-slide__link-grid">
          ${relatedCrystals.map((crystal) => `
            <a class="presentation-slide__link" href="${escapeHtml(buildCrystalPresentationUrl(crystal.id))}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(crystal.title)}
            </a>
          `).join("")}
        </div>
      </section>

      <section class="presentation-slide__visual">
        <div class="presentation-slide__visual-label">${escapeHtml(`${explanation.title} Placeholder`)}</div>
      </section>
    `;
  }

  function renderExplainer() {
    if (!refs.explainer || isExplanationArticleView()) {
      clearExplainer();
      return;
    }

    const explanation = state.activeExplanationId ? vault.explanations[state.activeExplanationId] : null;

    if (!explanation) {
      clearExplainer();
      return;
    }

    document.body.classList.add("has-glossary");
    refs.explainer.hidden = false;
    refs.explainer.innerHTML = `
      <div class="presentation-explainer__card">
        <header class="presentation-explainer__header">
          <h2 class="presentation-explainer__title">${escapeHtml(explanation.title)}</h2>
        </header>
        <section class="presentation-explainer__section">
          <span class="presentation-explainer__label">Grundsaetzlich</span>
          <p class="presentation-explainer__text">${escapeHtml(explanation.grundsaetzlich)}</p>
        </section>
        <section class="presentation-explainer__section">
          <span class="presentation-explainer__label">Noch klarer</span>
          <p class="presentation-explainer__text">${escapeHtml(explanation.nochKlarer)}</p>
        </section>
        <section class="presentation-explainer__section">
          <span class="presentation-explainer__label">Praxis</span>
          <p class="presentation-explainer__text">${escapeHtml(explanation.praxis)}</p>
        </section>
      </div>
    `;

    refs.slide.querySelectorAll("[data-explanation-id]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.explanationId === state.activeExplanationId);
    });

    scheduleConnector();
  }

  function clearExplainer() {
    document.body.classList.remove("has-glossary");
    if (refs.explainer) {
      refs.explainer.textContent = "";
      refs.explainer.hidden = true;
    }
    clearConnector();
    if (refs.slide) {
      refs.slide.querySelectorAll("[data-explanation-id]").forEach((button) => {
        button.classList.remove("is-active");
      });
    }
  }

  function updateAppBar() {
    if (!refs.appbarLabel || !refs.prev || !refs.next || isArticleView()) {
      return;
    }

    const slides = getCurrentCrystal().slides;
    if (isCrystalCoverActive()) {
      refs.prev.disabled = true;
      refs.next.disabled = slides.length === 0;
      refs.appbarLabel.textContent = `Kristall-Intro · ${getCurrentCrystal().title}`;
      return;
    }

    const index = slides.findIndex((slide) => slide.id === state.slideId);
    refs.prev.disabled = index <= 0;
    refs.next.disabled = index >= slides.length - 1;
    refs.appbarLabel.textContent = `${index + 1} / ${slides.length} · ${getCurrentCrystal().title}`;
  }

  function rememberActiveSlideView() {
    if (isExplanationArticleView() || !state.slideId || isCrystalCoverActive()) {
      return;
    }

    const storage = getStorage();
    if (!storage) {
      return;
    }

    try {
      const key = vault.defaults.localStorageKey;
      const raw = storage.getItem(key);
      const memory = raw
        ? JSON.parse(raw)
        : {
            version: 1,
            userId: vault.defaults.localUserId,
            slideViews: {},
            taskResults: [],
            crystalProgress: {},
            courseProgress: {},
          };

      memory.slideViews = memory.slideViews || {};
      const viewKey = `${state.slideId}::${getActiveVariantKind()}`;
      memory.slideViews[viewKey] = memory.slideViews[viewKey] || new Date().toISOString();
      storage.setItem(key, JSON.stringify(memory));
    } catch (error) {
      console.warn("Could not persist course presentation progress.", error);
    }
  }

  function stepSlide(direction) {
    if (isArticleView()) {
      return;
    }

    if (isCrystalCoverActive()) {
      if (direction > 0) {
        navigateToSlide(getCurrentCrystal().slides[0]?.id || null);
      }
      return;
    }

    const slides = getCurrentCrystal().slides;
    const index = slides.findIndex((slide) => slide.id === state.slideId);
    const nextIndex = clamp(index + direction, 0, slides.length - 1);

    if (nextIndex === index) {
      return;
    }

    navigateToSlide(slides[nextIndex].id);
  }

  function scheduleConnector() {
    if (state.connectorFrame) {
      cancelAnimationFrame(state.connectorFrame);
    }

    state.connectorFrame = requestAnimationFrame(() => {
      state.connectorFrame = requestAnimationFrame(() => {
        state.connectorFrame = 0;
        renderConnector();
      });
    });
  }

  function renderConnector() {
    if (
      !refs.connector ||
      !refs.layout ||
      !refs.explainer ||
      refs.explainer.hidden ||
      !state.explanationCaller
    ) {
      clearConnector();
      return;
    }

    const titleNode = refs.explainer.querySelector(".presentation-explainer__title");
    if (!titleNode || !refs.slide.contains(state.explanationCaller)) {
      clearConnector();
      return;
    }

    const layoutRect = refs.layout.getBoundingClientRect();
    const startRect = state.explanationCaller.getBoundingClientRect();
    const endRect = titleNode.getBoundingClientRect();
    const startX = startRect.right - layoutRect.left;
    const startY = startRect.top + startRect.height / 2 - layoutRect.top;
    const endX = endRect.left - layoutRect.left;
    const endY = endRect.top + Math.min(endRect.height / 2, 26) - layoutRect.top;
    const deltaX = Math.max(54, (endX - startX) * 0.42);
    const curveLift = Math.max(18, Math.abs(endY - startY) * 0.22);
    const path = `M ${startX} ${startY} C ${startX + deltaX} ${startY - curveLift}, ${endX - deltaX} ${endY + curveLift}, ${endX} ${endY}`;

    refs.connector.hidden = false;
    refs.connector.classList.add("is-visible");
    refs.connector.setAttribute("viewBox", `0 0 ${layoutRect.width} ${layoutRect.height}`);
    refs.connector.innerHTML = `
      <path class="presentation-connector-path" d="${path}"></path>
      <circle class="presentation-connector-dot" cx="${startX}" cy="${startY}" r="4"></circle>
      <circle class="presentation-connector-dot presentation-connector-dot--end" cx="${endX}" cy="${endY}" r="4"></circle>
    `;
  }

  function clearConnector() {
    if (!refs.connector) {
      return;
    }

    refs.connector.hidden = true;
    refs.connector.classList.remove("is-visible");
    refs.connector.innerHTML = "";
  }

  function closeExplanation() {
    state.activeExplanationId = null;
    state.explanationCaller = null;
  }

  function toggleTocMenu(slideId) {
    state.openTocMenuSlideId = state.openTocMenuSlideId === slideId ? null : slideId;
    renderToc();
  }

  function closeTocMenu(options = {}) {
    if (!state.openTocMenuSlideId) {
      return;
    }

    state.openTocMenuSlideId = null;

    if (options.rerender !== false) {
      renderToc();
    }
  }

  /*
  ZIEL:
  Den Fenstertitel nur dann aktualisieren, wenn sich der semantische Presenter-Zustand wirklich geändert hat.
  WAS WURDE PROBIERT:
  Vorher wurde document.title bei jedem Render direkt neu gesetzt, auch wenn derselbe Titel bereits aktiv war.
  WESHALB WURDE SO ENTSCHIEDEN:
  Das vermeidet unnötige DOM-Schreibzugriffe in häufigen Renderpfaden und hält die Presenter-Reaktion etwas ruhiger.
  */
  function updateDocumentTitle() {
    const courseLabel = vault.course.selectorTitle || vault.course.id || "Kurs";
    let nextTitle = "";

    if (isExplanationArticleView()) {
      const explanation = getCurrentExplanation();
      nextTitle = `${explanation.title} | ${vault.course.title}`;
    } else if (isCrystalCoverActive()) {
      nextTitle = `${getCurrentCrystal().title} | ${courseLabel} Praesentation`;
    } else {
      const slide = getCurrentSlide();
      nextTitle = isArticleView()
        ? `${slide.title} | ${vault.course.title}`
        : `${getCurrentCrystal().title} | ${courseLabel} Praesentation`;
    }

    if (document.title !== nextTitle) {
      document.title = nextTitle;
    }
  }

  /*
  ZIEL:
  Die Presenter-URL nur bei echten Zustandsänderungen mit dem aktuellen View abgleichen.
  WAS WURDE PROBIERT:
  Zuerst wurde history.replaceState bei jedem Render direkt ausgeführt.
  WESHALB WURDE SO ENTSCHIEDEN:
  Der Vorabvergleich vermeidet unnötige History-Operationen in häufigen Presenter-Rendern und hält Test- und Laufzeitpfade leichter.
  */
  function syncUrl() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("course", vault.course.id);
      url.searchParams.set("crystal", state.crystalId);

      if (state.slideId) {
        url.searchParams.set("slide", state.slideId);
      } else {
        url.searchParams.delete("slide");
      }

      if (isCrystalCoverActive()) {
        url.searchParams.set("cover", "1");
      } else {
        url.searchParams.delete("cover");
      }

      if (isArticleView()) {
        url.searchParams.set("view", "article");
      } else {
        url.searchParams.delete("view");
      }

      if (state.articleExplanationId) {
        url.searchParams.set("explanation", state.articleExplanationId);
      } else {
        url.searchParams.delete("explanation");
      }

      url.searchParams.set("variant", getActiveVariantKind());

      if (url.toString() !== window.location.href) {
        history.replaceState({}, "", url.toString());
      }
    } catch (error) {
      // Ignore history failures in restricted or test contexts.
    }
  }

  function getCurrentCrystal() {
    return vault.crystalById[state.crystalId];
  }

  /*
  ZIEL:
  Den aktuell aktiven Slide ohne wiederholte lineare Suche aus dem Presenter-Zustand auflösen.
  WAS WURDE PROBIERT:
  Anfangs wurde im aktuellen Kristallarray bei jedem Zugriff per find gesucht.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die zentrale Slide-Map reduziert wiederholte Sucharbeit und vereinheitlicht den Zugriff für Stage, URL-Sync und Hilfsfunktionen.
  */
  function getCurrentSlide() {
    const crystal = getCurrentCrystal();
    return slideById.get(state.slideId) || crystal.slides[0];
  }

  function isCrystalCoverActive() {
    return !isArticleView() && state.isCrystalCoverActive;
  }

  function getCurrentExplanation() {
    return vault.explanations[state.articleExplanationId];
  }

  function getRelatedSlides(slide) {
    return (slide.linksTo || []).map((slideId) => getSlideById(slideId)).filter(Boolean);
  }

  function getSlidesUsingExplanation(explanationId) {
    return vault.presentationCristals
      .flatMap((crystal) =>
        crystal.slides.map((slide) => ({
          ...slide,
          crystalId: crystal.id,
        }))
      )
      .filter((slide) => slide.explanationIds.includes(explanationId))
      .sort((left, right) => {
        if (left.crystalId === state.crystalId && right.crystalId !== state.crystalId) {
          return -1;
        }
        if (left.crystalId !== state.crystalId && right.crystalId === state.crystalId) {
          return 1;
        }
        return left.orderInCristal - right.orderInCristal;
      });
  }

  /*
  ZIEL:
  Beliebige Slides im Presenter konsistent über eine vorbereitete Lookup-Struktur abrufen.
  WAS WURDE PROBIERT:
  Zunächst wurde dafür pro Aufruf über den zugehörigen Kristall erneut im Slides-Array gesucht.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die vorbereitete Map ist einfacher, schneller und vermeidet doppelte Zustandslogik zwischen Slide- und Kristallauflösung.
  */
  function getSlideById(slideId) {
    return slideById.get(slideId) || null;
  }

  function buildCrystalPresentationUrl(crystalId) {
    const crystal = vault.crystalById[crystalId];
    const url = new URL("./presentation.html", window.location.href);
    url.searchParams.set("course", vault.course.id);
    url.searchParams.set("crystal", crystalId);
    url.searchParams.set("slide", crystal?.slides[0]?.id || "");
    url.searchParams.set("variant", getActiveVariantKind());
    return url.toString();
  }

  function buildArticleUrl(slideId) {
    const crystalId = slideToCrystalId[slideId];
    const url = new URL("./presentation.html", window.location.href);
    url.searchParams.set("course", vault.course.id);
    url.searchParams.set("view", "article");
    url.searchParams.set("crystal", crystalId);
    url.searchParams.set("slide", slideId);
    url.searchParams.set("variant", getActiveVariantKind());
    url.searchParams.delete("explanation");
    return url.toString();
  }

  function buildExplanationArticleUrl(explanationId, sourceSlideId) {
    const url = new URL("./presentation.html", window.location.href);
    url.searchParams.set("course", vault.course.id);
    url.searchParams.set("view", "article");
    url.searchParams.set("explanation", explanationId);
    url.searchParams.set("variant", getActiveVariantKind());

    if (sourceSlideId && slideToCrystalId[sourceSlideId]) {
      url.searchParams.set("crystal", slideToCrystalId[sourceSlideId]);
      url.searchParams.set("slide", sourceSlideId);
    } else if (state.crystalId) {
      url.searchParams.set("crystal", state.crystalId);
    }

    return url.toString();
  }

  /*
  ZIEL:
  Einen Ruecksprung in den passenden Vault-Kontext erzeugen.
  WAS WURDE PROBIERT:
  Der Builder setzt Kurs, Selection und optional den Content-Flag so, dass derselbe Kristall im Presenter wiedergefunden wird.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die Praesentation soll nicht blind auf die Startseite fallen, sondern gezielt in den dazugehoerigen Kristallkontext zurueckkehren.
  */
  function buildVaultUrl(options = {}) {
    const openContent = options.openContent !== false;
    const url = new URL("./index.html", window.location.href);
    const currentCrystal = getCurrentCrystal();
    const selectionId = currentCrystal?.selectionId || 1;

    url.searchParams.set("course", vault.course.id);
    url.searchParams.set("selection", String(selectionId));
    url.searchParams.set("detail", "1");

    if (!isArticleView() && openContent) {
      url.searchParams.set("content", "1");
    }

    return url.toString();
  }

  function isArticleView() {
    return state.viewMode === "article";
  }

  function isExplanationArticleView() {
    return isArticleView() && Boolean(state.articleExplanationId);
  }

  function getActiveVariantKind() {
    return state.activeVariantKind || DEFAULT_IMPLEMENTED_VARIANT_KIND;
  }

  function normalizeVariantKind(value) {
    const normalized = String(value || "").trim().toLowerCase();
    const spec = TOC_MODE_SPECS.find(
      (entry) => entry.id === normalized || entry.variantKind.toLowerCase() === normalized
    );
    return spec?.variantKind || DEFAULT_IMPLEMENTED_VARIANT_KIND;
  }

  function isImplementedVariant(variantKind) {
    return TOC_MODE_SPECS.some((spec) => spec.variantKind === variantKind && spec.isImplemented);
  }

  function activatePresentationVariant(modeId) {
    const spec = TOC_MODE_SPECS.find((entry) => entry.id === modeId);
    if (!spec) {
      state.activeVariantKind = DEFAULT_IMPLEMENTED_VARIANT_KIND;
      return;
    }

    state.activeVariantKind = spec.isImplemented ? spec.variantKind : DEFAULT_IMPLEMENTED_VARIANT_KIND;
  }

  function shouldShowStoryBeats() {
    return getActiveVariantKind() === "storySlide";
  }

  function getVariantSpecByKind(variantKind) {
    return TOC_MODE_SPECS.find((spec) => spec.variantKind === variantKind) || null;
  }

  function resolveMinimalMaster(crystal, slide, variantKind = DEFAULT_IMPLEMENTED_VARIANT_KIND) {
    const variantOffset = VARIANT_MASTER_OFFSETS[variantKind] || 0;
    const index = (crystal.dayIndex * 3 + slide.orderInCristal - 1 + variantOffset) % MINIMAL_MASTER_SEQUENCE.length;
    return MINIMAL_MASTER_SEQUENCE[index];
  }

  function renderExplanationTermCollection(explanationIds, sourceSlideId) {
    return (explanationIds || [])
      .map((explanationId) => renderExplanationTerm(explanationId, sourceSlideId))
      .join("");
  }

  function renderRelatedSlideLinks(slide) {
    return getRelatedSlides(slide)
      .map(
        (relatedSlide) => `
          <a class="presentation-slide__link" href="${escapeHtml(buildArticleUrl(relatedSlide.id))}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(relatedSlide.title)}
          </a>
        `
      )
      .join("");
  }

  function renderSourceSeedChips(sourceSeedIds) {
    return (sourceSeedIds || [])
      .map((seedId) => vault.seeds[seedId])
      .filter(Boolean)
      .map(
        (seed) => `
          <span class="presentation-slide__chip">${escapeHtml(seed.label)}</span>
        `
      )
      .join("");
  }

  function renderMinimalSummaryRail(slide, crystal, masterSpec, variantKind) {
    const variant = slide?.variants?.[variantKind] || {};
    const explanations = (slide.explanationIds || [])
      .map((explanationId) => vault.explanations[explanationId]?.title)
      .filter(Boolean);
    const seeds = (slide.sourceSeedIds || [])
      .map((seedId) => vault.seeds[seedId]?.label)
      .filter(Boolean);
    const linkedSlides = getRelatedSlides(slide).map((entry) => entry.title).filter(Boolean);
    const itemsByVariant = {
      minimalSlide: [
        {
          label: "Begriffe",
          text: explanations.length ? explanations.slice(0, 2).join(" · ") : "Placeholder-Begriffe folgen spaeter",
        },
        {
          label: "Quelle",
          text: seeds.length ? seeds.slice(0, 2).join(" · ") : `${crystal.sortKey} · ${masterSpec.label}`,
        },
        {
          label: "Anschluss",
          text: linkedSlides.length ? linkedSlides.slice(0, 2).join(" · ") : "Weitere Wiki-Slide-Verknuepfungen folgen",
        },
      ],
      kompaktSlide: [
        {
          label: "Kernaussage",
          text: slide.summary || "Verdichtete Klammer folgt spaeter.",
        },
        {
          label: "Begriffe",
          text: explanations.length ? explanations.join(" · ") : "Placeholder-Begriffe folgen spaeter",
        },
        {
          label: "Transfer",
          text: variant.transfer || "Die verdichtete Stufe fuehrt spaeter in Praxis- und Anschlussfragen.",
        },
        {
          label: "Anschluss",
          text: linkedSlides.length ? linkedSlides.slice(0, 3).join(" · ") : "Weitere Wiki-Slide-Verknuepfungen folgen",
        },
      ],
      ausfuehrlichSlide: [
        {
          label: "Zusammenhang",
          text: variant.context || slide.summary || "Fachlicher Zusammenhang folgt spaeter.",
        },
        {
          label: "Struktur",
          text: variant.structureNote || "Die Ausbildungsfassung macht Reihenfolge und Teilaspekte sichtbar.",
        },
        {
          label: "Quellenbasis",
          text: variant.sourceBrief || (seeds.length ? seeds.join(" · ") : `${crystal.sortKey} · ${masterSpec.label}`),
        },
        {
          label: "Transfer",
          text: variant.transfer || "Weitere Transferachsen folgen spaeter.",
        },
      ],
      umfassendSlide: [
        {
          label: "Einordnung",
          text: variant.context || slide.summary || "Enzyklopaedische Einordnung folgt spaeter.",
        },
        {
          label: "Fehlerbild",
          text: variant.errorPattern || "Typische Fehlleitungen folgen spaeter.",
        },
        {
          label: "Begriffsraum",
          text: explanations.length ? explanations.join(" · ") : "Placeholder-Begriffe folgen spaeter",
        },
        {
          label: "Querverweise",
          text: linkedSlides.length ? linkedSlides.join(" · ") : "Weitere Wiki-Slide-Verknuepfungen folgen",
        },
      ],
    };
    const items = itemsByVariant[variantKind] || itemsByVariant.minimalSlide;

    return items
      .map(
        (item, index) => `
          <article class="presentation-master__summary-item presentation-master__summary-item--${index + 1}">
            <span class="presentation-master__label">${escapeHtml(item.label)}</span>
            <p class="presentation-master__text">${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  }

  /*
  ZIEL:
  Den Presenter-Cover-Kristall pro Kristall und Kontext nur einmal aufbauen und danach wiederverwendbar ausliefern.
  WAS WURDE PROBIERT:
  Zuerst wurde das Markup bei jedem Render neu zusammengesetzt, obwohl dieselben Sidebar-, Stage- und Transition-Zustände wiederkehren.
  WESHALB WURDE SO ENTSCHIEDEN:
  Das Cache pro Kristall und Kontext spart String-Aufbau, hält den separaten Presenter leichtgewichtig und vermeidet unnötige DOM-Neuzusammenstellung.
  */
  function renderCrystalPlaceholderMarkup(crystal, context) {
    const hierarchyVisual = buildCrystalHierarchyVisual(crystal);
    const cacheKey = `${getCrystalHierarchyCacheKey(crystal)}::${context}`;

    if (crystalPlaceholderMarkupCache.has(cacheKey)) {
      return crystalPlaceholderMarkupCache.get(cacheKey);
    }

    const orbSvgMarkup = buildCrystalOrbSvg(hierarchyVisual, context, cacheKey);
    const showReturnButton = context !== "transition";
    const detailLabel = context === "stage" ? "Zum Kristall-Detail im Vault" : "Kristall-Detail";
    const markup = `
      <div class="presentation-cover__placeholder presentation-cover__placeholder--${escapeHtml(context)}" data-crystal-placeholder="${escapeHtml(context)}">
        <span class="presentation-cover__ratio">1:1</span>

        <div class="presentation-cover__orb-shell">
          <div class="presentation-cover__orb-aura presentation-cover__orb-aura--one"></div>
          <div class="presentation-cover__orb-aura presentation-cover__orb-aura--two"></div>
          <div class="presentation-cover__orb">
            ${orbSvgMarkup}
          </div>
        </div>

        ${
          showReturnButton
            ? `
              <button
                type="button"
                class="presentation-cover__vault-return"
                data-vault-detail-nav="true"
                aria-label="${escapeHtml(detailLabel)}"
              >
                ${escapeHtml(detailLabel)}
              </button>
            `
            : ""
        }
      </div>
    `;

    crystalPlaceholderMarkupCache.set(cacheKey, markup);
    return markup;
  }

  /*
  ZIEL:
  Ein datengetriebenes Miniaturbild erzeugen, das die H1-, H2- und H3-Hierarchie des Kristalls im Presenter visuell andeutet.
  WAS WURDE PROBIERT:
  Zunächst wurde mit festen Facetten- und Bead-Orbits gearbeitet. Danach wurde der Pfad auf echte H2- und H3-Daten aus der Selection-Runtime umgestellt.
  WESHALB WURDE SO ENTSCHIEDEN:
  So bleibt das Cover für kleine und große Kristalle konsistent, ohne einen zweiten, vom eigentlichen Kristallsystem losgelösten Placeholder-Stil pflegen zu müssen.
  */
  function buildCrystalOrbSvg(hierarchyVisual, context, cacheKey) {
    const h2Visible = hierarchyVisual.h2Items.slice(0, context === "sidebar" ? 7 : 12);
    const h3Visible = hierarchyVisual.h3Items.slice(0, context === "sidebar" ? 10 : 18);
    const h2Radius = context === "sidebar" ? 31 : 33;
    const h3Radius = context === "sidebar" ? 41 : 43;
    const center = { x: 50, y: 50 };
    const orbBackgroundGradientId = buildPresenterSvgId("presentationCoverOrbBg", cacheKey);
    const coreGlowGradientId = buildPresenterSvgId("presentationCoverCoreGlow", cacheKey);
    const h2Points = h2Visible.map((item, index) => ({
      item,
      ...getOrbitPoint(index, h2Visible.length, h2Radius, -Math.PI / 2.2)
    }));
    const h3Points = h3Visible.map((item, index) => ({
      item,
      ...getOrbitPoint(index, h3Visible.length, h3Radius, -Math.PI / 2.7)
    }));
    const planePalette = [
      "rgba(211, 164, 255, 0.24)",
      "rgba(169, 255, 191, 0.22)",
      "rgba(168, 212, 255, 0.2)",
      "rgba(255, 193, 220, 0.2)",
      "rgba(215, 255, 149, 0.18)"
    ];
    /*
    ZIEL:
    Die H2-Flächen im Miniaturbild als ruhige, leicht transparente Ebenen sichtbar machen.
    WAS WURDE PROBIERT:
    Vorher gab es nur Orbit-Nodes ohne Flächenbezug. Danach wurden wenige große Ebenen zwischen Zentrum, H2 und H3 aufgespannt.
    WESHALB WURDE SO ENTSCHIEDEN:
    Wenige Flächen lesen sich im kleinen Presenter besser als ein dichtes Polygonnetz und halten das SVG trotzdem leicht.
    */
    const planeMarkup = h2Points
      .slice(0, Math.min(5, h2Points.length))
      .map((point, index) => {
        const nextH2 = h2Points[(index + 1) % h2Points.length] || point;
        const linkedH3 = h3Points[index % Math.max(1, h3Points.length)] || { x: 50, y: 18 };
        const color = planePalette[index % planePalette.length];
        const secondaryColor = setRgbaAlpha(color, 0.11);

        return `
          <polygon
            points="${center.x},${center.y} ${point.x.toFixed(2)},${point.y.toFixed(2)} ${linkedH3.x.toFixed(2)},${linkedH3.y.toFixed(2)}"
            fill="${color}"
            stroke="rgba(255,255,255,0.14)"
            stroke-width="0.16"
          />
          <polygon
            points="${center.x},${center.y} ${nextH2.x.toFixed(2)},${nextH2.y.toFixed(2)} ${linkedH3.x.toFixed(2)},${linkedH3.y.toFixed(2)}"
            fill="${secondaryColor}"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="0.12"
          />
        `;
      })
      .join("");
    /*
    ZIEL:
    Die hierarchische Verbindung zwischen Zentrum, H2 und H3 im Cover sichtbar lassen.
    WAS WURDE PROBIERT:
    Die Linien wurden zunächst nur als dekorative Strahlen gedacht und später an echte H2- und H3-Anker gebunden.
    WESHALB WURDE SO ENTSCHIEDEN:
    Das ergibt mehr logische Lesbarkeit im Miniaturbild, ohne die volle Netzkomplexität des Vaults in den Presenter zu ziehen.
    */
    const lineMarkup = [
      ...h2Points.map(
        (point) => `
          <line
            x1="${center.x}"
            y1="${center.y}"
            x2="${point.x.toFixed(2)}"
            y2="${point.y.toFixed(2)}"
            stroke="rgba(203, 222, 255, 0.14)"
            stroke-width="0.18"
          />
        `
      ),
      ...h3Points.map((point, index) => {
        const anchor = h2Points[index % Math.max(1, h2Points.length)] || center;

        return `
          <line
            x1="${anchor.x.toFixed(2)}"
            y1="${anchor.y.toFixed(2)}"
            x2="${point.x.toFixed(2)}"
            y2="${point.y.toFixed(2)}"
            stroke="rgba(192, 213, 255, 0.12)"
            stroke-width="0.12"
          />
        `;
      })
    ].join("");
    /*
    ZIEL:
    H2-Rune-Nodes und H3-Beads klar voneinander trennen.
    WAS WURDE PROBIERT:
    Zunächst wurden nur vereinzelte Orbit-Elemente gezeigt. Danach wurden H2 mit Rune und H3 als reduzierte Beads getrennt aufgebaut.
    WESHALB WURDE SO ENTSCHIEDEN:
    Im kleinen Cover ist die Hierarchietrennung wichtiger als maximale Detailtreue, deshalb bekommen H2 mehr visuelles Gewicht als H3.
    */
    const h2NodeMarkup = h2Points
      .map(
        (point) => `
          <g>
            <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${context === "sidebar" ? "4.1" : "4.4"}" fill="rgba(201, 127, 255, 0.18)" />
            <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${context === "sidebar" ? "2.15" : "2.35"}" fill="rgba(19, 24, 35, 0.96)" stroke="rgba(232, 241, 255, 0.18)" stroke-width="0.12" />
            <text x="${point.x.toFixed(2)}" y="${(point.y + 0.48).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" fill="#dfe9ff" font-size="${context === "sidebar" ? "1.6" : "1.8"}" font-weight="700">${escapeHtml(point.item.runeSymbol || "ᚠ")}</text>
          </g>
        `
      )
      .join("");
    const h3NodeMarkup = h3Points
      .map(
        (point, index) => `
          <g>
            <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${index % 4 === 0 ? "5.2" : "4.6"}" fill="rgba(167, 255, 163, ${index % 3 === 0 ? "0.18" : "0.12"})" />
            <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${index % 4 === 0 ? "2.1" : "1.7"}" fill="rgba(22, 28, 40, 0.95)" />
          </g>
        `
      )
      .join("");

    return `
      <svg class="presentation-cover__orb-svg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="${orbBackgroundGradientId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(34,52,78,0.86)" />
            <stop offset="54%" stop-color="rgba(16,24,36,0.94)" />
            <stop offset="100%" stop-color="rgba(5,9,16,0.98)" />
          </radialGradient>
          <radialGradient id="${coreGlowGradientId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(184, 219, 255, 0.34)" />
            <stop offset="100%" stop-color="rgba(184, 219, 255, 0)" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="49" fill="url(#${orbBackgroundGradientId})" stroke="rgba(255,255,255,0.08)" stroke-width="0.35" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(190,210,255,0.06)" stroke-width="0.12" />
        <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(190,210,255,0.04)" stroke-width="0.1" />
        ${planeMarkup}
        ${lineMarkup}
        ${h3NodeMarkup}
        ${h2NodeMarkup}
        <circle cx="50" cy="50" r="10.8" fill="url(#${coreGlowGradientId})" />
        <circle cx="50" cy="50" r="7.4" fill="rgba(23,31,46,0.95)" stroke="rgba(216,231,255,0.16)" stroke-width="0.28" />
        <text x="50" y="50.7" text-anchor="middle" dominant-baseline="middle" fill="#dfe9ff" font-size="4.2" font-weight="700">${escapeHtml(hierarchyVisual.h1Rune || "ᚱ")}</text>
      </svg>
    `;
  }

  /*
  ZIEL:
  SVG-Definitionen pro Coverinstanz eindeutig benennen.
  WAS WURDE PROBIERT:
  Vorher wurden feste Gradient-IDs verwendet, die bei gleichzeitigem Sidebar- und Stage-Cover kollidieren konnten.
  WESHALB WURDE SO ENTSCHIEDEN:
  Eindeutige IDs verhindern DOM-Kollisionen, ohne die vorhandene Cover-Struktur ändern zu müssen.
  */
  function buildPresenterSvgId(prefix, suffix) {
    const safeSuffix = String(suffix || "default")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return `${prefix}-${safeSuffix || "default"}`;
  }

  /*
  ZIEL:
  Varianten derselben RGBA-Farbe robust mit anderer Transparenz ableiten.
  WAS WURDE PROBIERT:
  Zuvor wurde die Alpha-Komponente per Regex direkt im Farbstring ersetzt.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die parserbasierte Variante ist weniger fehleranfällig als String-Hacks und hat den zuletzt aufgetretenen Presenter-Fehler beseitigt.
  */
  function setRgbaAlpha(color, alpha) {
    const rgbaMatch = /^rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)$/i.exec(String(color || "").trim());
    if (!rgbaMatch) {
      return color;
    }

    const [, red, green, blue] = rgbaMatch;
    const normalizedAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1;
    return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`;
  }

  function countFacesForSelectionShape(selectionId) {
    switch (Number(selectionId) || 0) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 12:
        return 12;
      case 20:
        return 20;
      default:
        break;
    }

    const shapeConfig = getShapeConfigForSelection(selectionId);

    switch (shapeConfig?.kind) {
      case "tetrahedron":
        return 4;
      case "pyramid":
        return (shapeConfig.sides || 0) + 1;
      case "prism":
        return (shapeConfig.sides || 0) + 2;
      case "prism-cap":
        return ((shapeConfig.sides || 0) * 2) + 1;
      case "bipyramid":
        return (shapeConfig.sides || 0) * 2;
      case "corner-cut-bipyramid":
        return ((shapeConfig.sides || 0) * 2) + 1;
      default:
        return Math.max(1, Number(shapeConfig?.segmentCount) || 1);
    }
  }

  /*
  ZIEL:
  Einen stabilen Schlüssel für Hierarchie- und Markup-Caches bereitstellen.
  WAS WURDE PROBIERT:
  Statt lose nur nach Selection zu cachen, wird der Kristall-Identifier mit der Selection kombiniert.
  WESHALB WURDE SO ENTSCHIEDEN:
  Damit bleiben Cover-Zustände eindeutig, selbst wenn mehrere Kristalle dieselbe Selection-Familie teilen würden.
  */
  function getCrystalHierarchyCacheKey(crystal) {
    return `${crystal?.id || "crystal"}::${Number(crystal?.selectionId) || 1}`;
  }

  /*
  ZIEL:
  Die für den Presenter nötige H1-, H2- und H3-Zusammenfassung aus der eigentlichen Selection-Runtime ableiten.
  WAS WURDE PROBIERT:
  Zuerst gab es nur statische Placeholder-Daten. Danach wurde die Presenter-Hierarchie über resolveSelectionDetailItemsForRuntime aus den echten Selection-Modulen berechnet.
  WESHALB WURDE SO ENTSCHIEDEN:
  So zeigt der Presenter dieselbe fachliche Kristallstruktur wie Vault und DetailView, ohne die komplette schwere Runtime im Cover nachzubauen.
  */
  function buildCrystalHierarchyVisual(crystal) {
    const cacheKey = getCrystalHierarchyCacheKey(crystal);

    if (crystalHierarchyVisualCache.has(cacheKey)) {
      return crystalHierarchyVisualCache.get(cacheKey);
    }

    const selectionId = Number(crystal?.selectionId) || 1;
    const shapeConfig = getShapeConfigForSelection(selectionId);
    const faceCount = countFacesForSelectionShape(selectionId);
    const faceEntries = Array.from({ length: faceCount }, (_, faceIndex) => ({ faceIndex }));
    const detailItems = resolveSelectionDetailItemsForRuntime({
      selectionId,
      metadata: null,
      faceEntries,
      selectionTitle: crystal?.title || `Kristall ${selectionId}`,
      shapeKind: shapeConfig?.kind || null,
      configuredFragmentRuneCounts: null,
      maxDetailFragmentRunes: 10
    });
    const h1Item = detailItems.find((item) => item?.level === "h1") || null;
    const h2Items = detailItems.filter((item) => item?.level === "h2");
    const h3Items = detailItems.filter((item) => item?.level === "h3");

    const hierarchyVisual = {
      h1Rune: h1Item?.runeSymbol || "ᚱ",
      h2Count: h2Items.length,
      h3Count: h3Items.length,
      h2Items,
      h3Items,
      fragmentRunes: h2Items.slice(0, 4).map((item) => item.runeSymbol || "ᚠ"),
      fractalRunes: h3Items.slice(0, 8).map((item) => item.runeSymbol || "ᚾ")
    };

    crystalHierarchyVisualCache.set(cacheKey, hierarchyVisual);
    return hierarchyVisual;
  }

  function getOrbitPoint(index, total, radius, angleOffset) {
    const safeTotal = Math.max(1, total);
    const angle = angleOffset + ((index / safeTotal) * Math.PI * 2);

    return {
      x: 50 + (Math.cos(angle) * radius),
      y: 50 + (Math.sin(angle) * radius)
    };
  }

  /*
  ZIEL:
  Vom Presenter-TOC oder aus einem Slide effizient in den Kristall-Cover-Zustand wechseln.
  WAS WURDE PROBIERT:
  Der Wechsel setzte zunächst immer blind Zustand und Render neu.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die zusätzlichen Guards vermeiden unnötige Voll-Render, wenn bereits derselbe Kristall im Cover aktiv ist.
  */
  function navigateToCrystalCover(crystalId) {
    if (!crystalId || !vault.crystalById[crystalId] || isArticleView()) {
      return;
    }

    if (state.crystalId === crystalId && isCrystalCoverActive()) {
      return;
    }

    const crystal = vault.crystalById[crystalId];
    const originRect = refs.cover?.querySelector('[data-crystal-placeholder="sidebar"]')?.getBoundingClientRect() || null;

    state.crystalId = crystalId;
    state.slideId = null;
    state.isCrystalCoverActive = true;
    state.articleExplanationId = null;
    closeExplanation();
    render();

    const target = refs.slide?.querySelector('[data-crystal-placeholder="stage"]');
    const targetRect = target?.getBoundingClientRect() || null;
    runCrystalCoverTransition({
      crystal,
      fromRect: originRect,
      toRect: targetRect,
      hideTarget: target,
    });
  }

  /*
  ZIEL:
  Zwischen Slides und vom Cover zurück in den Slide-Zustand nur dann umschalten, wenn sich der Zielzustand wirklich ändert.
  WAS WURDE PROBIERT:
  Der Pfad rendert grundsätzlich vollständig, weil Cover, TOC, Stage und Explainer gemeinsam aktualisiert werden müssen.
  WESHALB WURDE SO ENTSCHIEDEN:
  Die frühe Abbruchbedingung spart sinnlose Voll-Render bei Klicks auf bereits aktive Slides und hält den Presenter spürbar direkter.
  */
  function navigateToSlide(slideId) {
    if (!slideId || !slideToCrystalId[slideId]) {
      return;
    }

    const nextCrystalId = slideToCrystalId[slideId];
    if (state.crystalId === nextCrystalId && state.slideId === slideId && !isCrystalCoverActive() && !isArticleView()) {
      return;
    }

    const leavingCrystalCover = isCrystalCoverActive();
    const crystal = vault.crystalById[nextCrystalId];
    const originRect = leavingCrystalCover
      ? refs.slide?.querySelector('[data-crystal-placeholder="stage"]')?.getBoundingClientRect() || null
      : null;

    state.crystalId = nextCrystalId;
    state.slideId = slideId;
    state.isCrystalCoverActive = false;
    state.articleExplanationId = null;
    closeExplanation();
    render();

    if (leavingCrystalCover) {
      const target = refs.cover?.querySelector('[data-crystal-placeholder="sidebar"]');
      const targetRect = target?.getBoundingClientRect() || null;
      runCrystalCoverTransition({
        crystal,
        fromRect: originRect,
        toRect: targetRect,
        hideTarget: target,
      });
    }
  }

  /*
  ZIEL:
  Den Wechsel zwischen Sidebar- und Stage-Cover als leichte Cover-Transition zeigen, ohne den separaten Presenter unnötig schwer zu machen.
  WAS WURDE PROBIERT:
  Der Übergang arbeitet mit einem eigenen Transition-Layer und wiederverwendet das gecachte Transition-Markup.
  WESHALB WURDE SO ENTSCHIEDEN:
  So bleibt die Cover-Animation sichtbar, ohne die eigentlichen Presenter-Zielknoten dauerhaft zu verschieben oder mehrfach neu aufzubauen.
  */
  function runCrystalCoverTransition({ crystal, fromRect, toRect, hideTarget }) {
    if (!refs.coverTransition || !fromRect || !toRect || fromRect.width <= 0 || toRect.width <= 0) {
      if (hideTarget) {
        hideTarget.classList.remove("is-transition-hidden");
      }
      return;
    }

    hideTarget?.classList.add("is-transition-hidden");

    refs.coverTransition.hidden = false;
    refs.coverTransition.classList.add("is-active");
    refs.coverTransition.innerHTML = `
      <div class="presentation-cover-transition-card">
        ${renderCrystalPlaceholderMarkup(crystal, "transition")}
      </div>
    `;

    const card = refs.coverTransition.querySelector(".presentation-cover-transition-card");
    if (!card) {
      hideTarget?.classList.remove("is-transition-hidden");
      refs.coverTransition.hidden = true;
      refs.coverTransition.classList.remove("is-active");
      refs.coverTransition.innerHTML = "";
      return;
    }

    Object.assign(card.style, {
      left: `${fromRect.left}px`,
      top: `${fromRect.top}px`,
      width: `${fromRect.width}px`,
      height: `${fromRect.height}px`,
    });

    if (typeof card.animate !== "function") {
      hideTarget?.classList.remove("is-transition-hidden");
      refs.coverTransition.hidden = true;
      refs.coverTransition.classList.remove("is-active");
      refs.coverTransition.innerHTML = "";
      return;
    }

    const animation = card.animate(
      [
        {
          left: `${fromRect.left}px`,
          top: `${fromRect.top}px`,
          width: `${fromRect.width}px`,
          height: `${fromRect.height}px`,
        },
        {
          left: `${toRect.left}px`,
          top: `${toRect.top}px`,
          width: `${toRect.width}px`,
          height: `${toRect.height}px`,
        },
      ],
      {
        duration: 520,
        easing: "cubic-bezier(0.22, 0.8, 0.2, 1)",
        fill: "forwards",
      }
    );

    animation.finished
      .catch(() => {})
      .finally(() => {
        hideTarget?.classList.remove("is-transition-hidden");
        refs.coverTransition.hidden = true;
        refs.coverTransition.classList.remove("is-active");
        refs.coverTransition.innerHTML = "";
      });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getStorage() {
    try {
      return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    } catch (error) {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }

    return String(value).replace(/["\\]/g, "\\$&");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
})();
