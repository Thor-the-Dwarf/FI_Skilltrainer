(function initChallengeData(global) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeZone(rawZone, index = 0) {
    const zone = rawZone && typeof rawZone === "object" ? rawZone : {};
    const fallbackId = `zone_${index + 1}`;
    return Object.freeze({
      id: String(zone.id || fallbackId).trim() || fallbackId,
      label: String(zone.label || `Ziel ${index + 1}`).trim() || `Ziel ${index + 1}`,
      hint: String(zone.hint || "").trim()
    });
  }

  function normalizeCard(rawCard, index = 0, discardZoneId = "discard") {
    const card = rawCard && typeof rawCard === "object" ? rawCard : {};
    const fallbackId = `card_${index + 1}`;
    const targetZoneId = String(card.targetZoneId || card.zoneId || discardZoneId).trim() || discardZoneId;
    return Object.freeze({
      id: String(card.id || fallbackId).trim() || fallbackId,
      label: String(card.label || card.title || `Karte ${index + 1}`).trim() || `Karte ${index + 1}`,
      detail: String(card.detail || card.description || "").trim(),
      targetZoneId
    });
  }

  function normalizeFalseHitOption(rawOption, index = 0) {
    const option = rawOption && typeof rawOption === "object" ? rawOption : {};
    const fallbackId = `option_${index + 1}`;
    return Object.freeze({
      id: String(option.id || fallbackId).trim() || fallbackId,
      label: String(option.label || option.title || `Treffer ${index + 1}`).trim() || `Treffer ${index + 1}`,
      detail: String(option.detail || option.description || "").trim(),
      isFalse: Boolean(option.isFalse)
    });
  }

  function normalizeFalseHitRound(rawRound, index = 0) {
    const round = rawRound && typeof rawRound === "object" ? rawRound : {};
    const options = Array.isArray(round.options)
      ? round.options.map((entry, optionIndex) => normalizeFalseHitOption(entry, optionIndex)).filter(Boolean)
      : [];
    const hasFalseOption = options.some((option) => option.isFalse);
    const normalizedOptions = hasFalseOption
      ? options
      : options.map((option, optionIndex) => Object.freeze({
        ...option,
        isFalse: optionIndex === 0
      }));
    const items = Array.isArray(round.items)
      ? round.items
        .map((entry, itemIndex) => {
          const item = entry && typeof entry === "object" ? entry : {};
          const fallbackId = `item_${itemIndex + 1}`;
          return Object.freeze({
            id: String(item.id || fallbackId).trim() || fallbackId,
            label: String(item.label || item.title || `Schritt ${itemIndex + 1}`).trim() || `Schritt ${itemIndex + 1}`,
            order: Math.max(1, Number(item.order) || itemIndex + 1)
          });
        })
        .filter(Boolean)
      : [];
    return Object.freeze({
      id: String(round.id || `round_${index + 1}`).trim() || `round_${index + 1}`,
      prompt: String(round.prompt || round.question || `Welcher Treffer passt nicht?`).trim() || "Welcher Treffer passt nicht?",
      hint: String(round.hint || round.instructions || "").trim(),
      options: normalizedOptions,
      items
    });
  }

  function normalizeChallengeDeck(rawDeck) {
    const deck = rawDeck && typeof rawDeck === "object" ? rawDeck : {};
    const normalizedTimeLimitMs = Math.max(20000, Number(deck.timeLimitMs) || Math.max(20, Number(deck.timeLimitSec) || 90) * 1000);
    const discardZone = normalizeZone(deck.discardZone || { id: "discard", label: "Ablagestapel" }, 999);
    const zones = Array.isArray(deck.zones)
      ? deck.zones.map((entry, index) => normalizeZone(entry, index)).filter(Boolean)
      : [];
    const cards = Array.isArray(deck.cards)
      ? deck.cards.map((entry, index) => normalizeCard(entry, index, discardZone.id)).filter(Boolean)
      : [];
    const rounds = Array.isArray(deck.rounds)
      ? deck.rounds.map((entry, index) => normalizeFalseHitRound(entry, index)).filter(Boolean)
      : [];

    return Object.freeze({
      id: String(deck.id || "challenge_v1").trim() || "challenge_v1",
      type: String(deck.type || "zuordnen").trim().toLowerCase() || "zuordnen",
      title: String(deck.title || "Challenge V1").trim() || "Challenge V1",
      subtitle: String(deck.subtitle || "").trim(),
      description: String(deck.description || "").trim(),
      kicker: String(deck.kicker || "Localhost Preview").trim() || "Localhost Preview",
      introTitle: String(deck.introTitle || deck.title || "Challenge").trim() || "Challenge",
      introText: String(deck.introText || deck.description || "").trim(),
      timeLimitMs: normalizedTimeLimitMs,
      timeLimitSec: Math.round(normalizedTimeLimitMs / 1000),
      pointsLabel: String(deck.pointsLabel || "Punkte").trim() || "Punkte",
      soundLabel: String(deck.soundLabel || "Sound").trim() || "Sound",
      futureTypes: Array.isArray(deck.futureTypes)
        ? deck.futureTypes.map((entry) => String(entry || "").trim()).filter(Boolean)
        : [],
      tips: Array.isArray(deck.tips)
        ? deck.tips.map((entry) => String(entry || "").trim()).filter(Boolean)
        : [],
      zones,
      discardZone,
      cards,
      rounds
    });
  }

  const LOCALHOST_CHALLENGE_DECKS = Object.freeze([
    normalizeChallengeDeck({
      id: "challenge_zuordnen_v1",
      type: "zuordnen",
      title: "Challenge V1",
      subtitle: "Zuordnen",
      description: "Ziehe Aufgaben in die passende Projektphase oder parke sie unten fuer spaeter, wenn du sie erst spaeter loesen willst.",
      kicker: "Nur lokal sichtbar",
      introTitle: "Zuordnen: Projektphasen lesen",
      introText: "Aus dem Zentrum kommt immer die oberste Karte des offenen Decks. Ziehe sie per Maus oder Touch auf eine passende Zielgruppe. Wenn du sie spaeter bearbeiten willst, lege sie unten in den Spaeter-Stapel; dort wird sie hinten in die offene Queue einsortiert und kommt erneut wieder.",
      timeLimitSec: 95,
      futureTypes: [],
      tips: [
        "Analyse, Umsetzung, Test und Deployment liegen radial um das zentrale Deck.",
        "Der Spaeter-Stapel unten ist keine Endablage, sondern eine offene Requeue nach hinten.",
        "Jede korrekte Einsortierung bringt Punkte, Fehlversuche kosten Punkte und die offene Queue bleibt sichtbar."
      ],
      zones: [
        {
          id: "analyse",
          label: "Analyse",
          hint: "Anforderungen, Abstimmung, Ist-Aufnahme"
        },
        {
          id: "umsetzung",
          label: "Umsetzung",
          hint: "Implementieren, Modellieren, Refactoring"
        },
        {
          id: "test",
          label: "Test",
          hint: "Pruefen, Retest, Abnahme vorbereiten"
        },
        {
          id: "deployment",
          label: "Deployment",
          hint: "Rollout, Uebergabe, Release-Plan"
        }
      ],
      discardZone: {
        id: "discard",
        label: "Spaeter-Stapel",
        hint: "Offene Karten fuer spaeter"
      },
      cards: [
        {
          id: "analyse_anforderungen",
          label: "Anforderungen mit dem Fachbereich klaeren",
          detail: "Vor dem Coding wird abgestimmt, was das Kundenportal wirklich leisten soll.",
          targetZoneId: "analyse"
        },
        {
          id: "analyse_ui_review",
          label: "Mockup mit Stakeholdern durchgehen",
          detail: "Die Oberflaeche wird inhaltlich bewertet, bevor entwickelt wird.",
          targetZoneId: "analyse"
        },
        {
          id: "umsetzung_endpoint",
          label: "REST-Endpunkt fuer Reservierungen bauen",
          detail: "Die Fachlogik wird technisch umgesetzt.",
          targetZoneId: "umsetzung"
        },
        {
          id: "umsetzung_refactor",
          label: "Validierungslogik in eigene Module auslagern",
          detail: "Bestehender Code wird sauberer und wartbarer strukturiert.",
          targetZoneId: "umsetzung"
        },
        {
          id: "test_regression",
          label: "Regressionstest fuer das Buchungsfenster ausfuehren",
          detail: "Vor dem Release wird geprueft, ob bekannte Faelle noch funktionieren.",
          targetZoneId: "test"
        },
        {
          id: "test_retest",
          label: "Fehler nach Hotfix im Staging erneut pruefen",
          detail: "Die Korrektur wird kontrolliert und fachlich abgesichert.",
          targetZoneId: "test"
        },
        {
          id: "deployment_notes",
          label: "Release-Notes an Support und Betrieb uebergeben",
          detail: "Nach dem Build braucht das Team klare Infos fuer den Rollout.",
          targetZoneId: "deployment"
        },
        {
          id: "deployment_rollback",
          label: "Rollback-Plan fuer den Produktivstart dokumentieren",
          detail: "Fuer den Go-live wird eine Rueckfallstrategie vorbereitet.",
          targetZoneId: "deployment"
        },
        {
          id: "analyse_scope",
          label: "Offene Abhaengigkeiten mit dem Product Owner klaeren",
          detail: "Vor der Umsetzung werden offene Punkte und fachliche Grenzen sauber besprochen.",
          targetZoneId: "analyse"
        },
        {
          id: "deployment_handover",
          label: "Betriebsuebergabe fuer den Go-live vorbereiten",
          detail: "Deployment braucht abgestimmte Uebergabe an Betrieb und Support.",
          targetZoneId: "deployment"
        }
      ]
    }),
    normalizeChallengeDeck({
      id: "challenge_falscher_treffer_v1",
      type: "falscher_treffer",
      title: "Challenge V1",
      subtitle: "Falscher Treffer",
      description: "Mehrere Begriffe erscheinen gleichzeitig. Genau einer passt fachlich nicht hinein.",
      kicker: "Nur lokal sichtbar",
      introTitle: "Falscher Treffer: schnell erkennen",
      introText: "Suche in einem kompakten Vierer-Set den unpassenden Treffer. Ein Tap, Klick oder die Tasten 1-4 beziehungsweise A-D entscheiden die Runde sofort.",
      timeLimitSec: 18,
      futureTypes: [],
      tips: [
        "Es gibt immer genau einen unpassenden Treffer.",
        "Maus, Touch und einfache Tastaturkuerzel funktionieren parallel.",
        "Die Runde endet sofort nach der Auswahl oder mit Ablauf des Timers."
      ],
      rounds: [
        {
          id: "release_vorbereitung",
          prompt: "Welcher Treffer passt fachlich nicht in die Release-Vorbereitung?",
          hint: "Drei Begriffe stuetzen den Rollout, einer gehoert bewusst nicht dazu.",
          options: [
            {
              id: "smoke_test",
              label: "Smoke-Test im Staging",
              detail: "Schneller Stabilitaetscheck vor dem Go-live."
            },
            {
              id: "release_notes",
              label: "Release-Notes an Support geben",
              detail: "Hilft Support und Betrieb beim Start."
            },
            {
              id: "rollback_plan",
              label: "Rollback-Plan dokumentieren",
              detail: "Sichert den Produktivstart fachlich ab."
            },
            {
              id: "playlist",
              label: "Roadtrip-Playlist fuers Wochenende sortieren",
              detail: "Privat, bewusst fachfremd und damit der falsche Treffer.",
              isFalse: true
            }
          ]
        }
      ]
    }),
    normalizeChallengeDeck({
      id: "challenge_reihenfolge_sprint_v1",
      type: "reihenfolge_sprint",
      title: "Challenge V1",
      subtitle: "Reihenfolge Sprint",
      description: "Bringe gemischte Schritte unter Zeitdruck in die exakt richtige Reihenfolge.",
      kicker: "Nur lokal sichtbar",
      introTitle: "Reihenfolge Sprint: sauber sortieren",
      introText: "Ordne die Schritte mit Drag & Drop oder per Tastatur in die richtige Reihenfolge. Nur ein exact match gilt als Erfolg.",
      timeLimitMs: 32000,
      futureTypes: [],
      tips: [
        "Ziehe Schritte per Maus oder Touch an die richtige Stelle in der Liste.",
        "Mit ArrowUp und ArrowDown verschiebst du das fokussierte Element.",
        "Mit Enter oder Space pruefst du die aktuelle Reihenfolge."
      ],
      rounds: [
        {
          id: "release_ablauf",
          prompt: "Bringe diese Release-Schritte in die fachlich richtige Reihenfolge.",
          hint: "Von Vorbereitung ueber Absicherung bis zur Rueckmeldung.",
          items: [
            {
              id: "abstimmung",
              label: "Release-Inhalt und Risiken mit dem Team abstimmen",
              order: 1
            },
            {
              id: "tests",
              label: "Smoke- und Regressionstests im Staging abschliessen",
              order: 2
            },
            {
              id: "kommunikation",
              label: "Rollback-Plan und Release-Notes final vorbereiten",
              order: 3
            },
            {
              id: "rollout",
              label: "Produktivstart begleiten und Monitoring beobachten",
              order: 4
            },
            {
              id: "abschluss",
              label: "Go-live kurz dokumentieren und Rueckmeldung geben",
              order: 5
            }
          ]
        }
      ]
    }),
    normalizeChallengeDeck({
      id: "challenge_fallende_karten_v1",
      type: "fallende_karten",
      title: "Challenge V1",
      subtitle: "Fallende Karten",
      description: "Sortiere fallende Karten rechtzeitig in den passenden Zielbereich, bevor sie den Boden erreichen.",
      kicker: "Nur lokal sichtbar",
      introTitle: "Fallende Karten: live einsortieren",
      introText: "Die Karten fallen aus wechselnden Startbahnen nach unten. Ziehe sie per Maus oder Touch schnell in das passende Ziel.",
      timeLimitMs: 46000,
      futureTypes: [],
      tips: [
        "Karten fallen laufend aus unterschiedlichen Startpositionen.",
        "Unten wartet pro Kategorie ein klares Ziel-Feld.",
        "Wer den Boden trifft, beendet die Runde sofort als Fehlversuch."
      ],
      zones: [
        {
          id: "analyse",
          label: "Analyse",
          hint: "Planung, Abstimmung, Aufnahme"
        },
        {
          id: "umsetzung",
          label: "Umsetzung",
          hint: "Build, Coding, Umsetzung"
        },
        {
          id: "test",
          label: "Test",
          hint: "Pruefung, Abnahme, Retest"
        }
      ],
      cards: [
        {
          id: "fall_scope",
          label: "Scope mit Stakeholdern abstimmen",
          detail: "Vor dem Build wird fachlich eingegrenzt.",
          targetZoneId: "analyse"
        },
        {
          id: "fall_ist",
          label: "Ist-Aufnahme im Bestandssystem",
          detail: "Die Ausgangslage wird aufgenommen.",
          targetZoneId: "analyse"
        },
        {
          id: "fall_api",
          label: "API-Endpunkt fuer Reservierung bauen",
          detail: "Technische Umsetzung im Produkt.",
          targetZoneId: "umsetzung"
        },
        {
          id: "fall_refactor",
          label: "Validierungsmodul refaktorieren",
          detail: "Code wird fuer Wartung verbessert.",
          targetZoneId: "umsetzung"
        },
        {
          id: "fall_smoke",
          label: "Smoke-Test im Staging starten",
          detail: "Schneller Check vor der Freigabe.",
          targetZoneId: "test"
        },
        {
          id: "fall_retest",
          label: "Hotfix im Retest verifizieren",
          detail: "Fehlerbehebung wird erneut geprueft.",
          targetZoneId: "test"
        }
      ]
    }),
    normalizeChallengeDeck({
      id: "challenge_quick_code_v1",
      type: "quick_code",
      title: "Challenge V1",
      subtitle: "Quick Code",
      description: "Bilde aus Code- und SQL-Bausteinen unter Zeitdruck die richtige Zeile in der korrekten Reihenfolge.",
      kicker: "Nur lokal sichtbar",
      introTitle: "Quick Code: Zeile zusammensetzen",
      introText: "Waehle die passenden Tokens nacheinander aus. Jede richtige Auswahl fuellt den naechsten Slot, jede falsche beendet die Runde.",
      timeLimitMs: 36000,
      futureTypes: [],
      tips: [
        "Hier wird nicht sortiert, sondern Slot fuer Slot aufgebaut.",
        "Token-Auswahl geht per Touch, Klick oder Tastatur 1-9.",
        "Nur die exakt korrekte Reihenfolge gilt als Erfolg."
      ],
      rounds: [
        {
          id: "quick_sql_where",
          prompt: "Setze die SQL-Zeile korrekt aus den Tokens zusammen.",
          hint: "Filter auf aktive Benutzer, exakt in Reihenfolge.",
          items: [
            {
              id: "sql_select",
              label: "SELECT",
              order: 1
            },
            {
              id: "sql_name",
              label: "name",
              order: 2
            },
            {
              id: "sql_from",
              label: "FROM",
              order: 3
            },
            {
              id: "sql_users",
              label: "users",
              order: 4
            },
            {
              id: "sql_where",
              label: "WHERE",
              order: 5
            },
            {
              id: "sql_active",
              label: "active = 1",
              order: 6
            }
          ]
        }
      ]
    })
  ]);

  function getLocalhostChallengeCatalog() {
    return LOCALHOST_CHALLENGE_DECKS.map((deck) => ({
      id: deck.id,
      type: deck.type,
      title: deck.title,
      subtitle: deck.subtitle,
      description: deck.description,
      kicker: deck.kicker,
      timeLimitSec: deck.timeLimitSec,
      cardCount: deck.cards.length,
      zoneCount: deck.zones.length,
      roundCount: deck.rounds.length,
      optionCount: deck.rounds.reduce((maxCount, round) => Math.max(maxCount, Array.isArray(round?.options) ? round.options.length : 0), 0),
      itemCount: deck.rounds.reduce((maxCount, round) => Math.max(maxCount, Array.isArray(round?.items) ? round.items.length : 0), 0),
      futureTypes: deck.futureTypes.slice()
    }));
  }

  function getLocalhostChallengeDeck(id = "") {
    const normalizedId = String(id || "").trim();
    const deck = LOCALHOST_CHALLENGE_DECKS.find((entry) => entry.id === normalizedId) || LOCALHOST_CHALLENGE_DECKS[0] || null;
    return deck ? clone(deck) : null;
  }

  global.ChallengeData = Object.freeze({
    normalizeChallengeDeck,
    getLocalhostChallengeCatalog,
    getLocalhostChallengeDeck
  });
})(window);
