(function initChallengeFalseHitType(global) {
  "use strict";

  const TYPE_ID = "falscher_treffer";
  const KEY_HINTS = ["1 / A", "2 / B", "3 / C", "4 / D"];

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function mount(root, deck, api) {
    const round = Array.isArray(deck.rounds) ? deck.rounds[0] || null : null;
    const options = Array.isArray(round?.options) ? round.options : [];
    const falseOption = options.find((option) => option.isFalse) || options[0] || null;
    let locked = false;

    const board = createNode("div", "challenge-false-board");
    const head = createNode("div", "challenge-false-head");
    const kicker = createNode("span", "challenge-false-kicker", "Schnellmodus");
    const title = createNode("h3", "challenge-false-title", round?.prompt || "Welcher Treffer passt nicht?");
    const hint = createNode("p", "challenge-false-hint", round?.hint || "Genau ein Treffer ist fachlich unpassend.");
    const note = createNode("p", "challenge-false-note", "Auswahl moeglich per Touch, Maus oder Tastatur: 1-4 und A-D.");
    const grid = createNode("div", "challenge-false-grid");
    head.append(kicker, title);
    if (hint.textContent) head.appendChild(hint);
    board.append(head, grid, note);
    root.innerHTML = "";
    root.appendChild(board);

    const optionButtons = options.map((option, index) => {
      const button = createNode("button", "challenge-false-option");
      button.type = "button";
      button.dataset.optionId = option.id;
      button.setAttribute("aria-keyshortcuts", KEY_HINTS[index] || "");
      const key = createNode("span", "challenge-false-option-key", KEY_HINTS[index] || "");
      const body = createNode("div", "challenge-false-option-body");
      const label = createNode("strong", "challenge-false-option-label", option.label);
      const detail = createNode("p", "challenge-false-option-detail", option.detail || "");
      body.append(label);
      if (detail.textContent) body.appendChild(detail);
      button.append(key, body);
      button.addEventListener("click", () => {
        selectOption(option.id, "pointer");
      });
      grid.appendChild(button);
      return button;
    });

    function markOutcome(selectedId, isCorrect) {
      optionButtons.forEach((button) => {
        const optionId = String(button.dataset.optionId || "");
        const isFalse = optionId === String(falseOption?.id || "");
        button.disabled = true;
        button.classList.toggle("is-correct-answer", isFalse);
        button.classList.toggle("is-picked-correct", isCorrect && optionId === selectedId);
        button.classList.toggle("is-picked-wrong", !isCorrect && optionId === selectedId);
      });
    }

    function selectOption(optionId, source = "pointer") {
      if (api.session.status !== "running" || locked) return;
      const selected = options.find((option) => option.id === optionId) || null;
      if (!selected || !falseOption) return;
      locked = true;
      const isCorrect = selected.id === falseOption.id;
      markOutcome(selected.id, isCorrect);
      if (isCorrect) {
        const bonus = Math.max(120, Math.round(Number(api.session.remainingMs || 0) / 70));
        api.addScore(bonus);
        api.setStatusText(`Korrekt: ${selected.label} ist der falsche Treffer.`, "ok");
        api.setDetailText(`Eingabe: ${source}. ${selected.detail || "Der unpassende Begriff wurde sauber erkannt."}`);
        api.playSound("success");
        api.finish({
          outcome: "success",
          title: "Falschen Treffer erkannt",
          summary: "Die Runde ist mit einer schnellen und korrekten Auswahl beendet.",
          statusText: `Korrekt: ${selected.label} ist der falsche Treffer.`,
          statusTone: "ok",
          lines: [
            `Gewaehlter Treffer: ${selected.label}`,
            `Eingabemodus: ${source}`,
            `Punkte nach Auswahl: ${Math.max(0, Number(api.session.score || 0))}`
          ]
        });
        return;
      }

      api.addScore(-40);
      api.setStatusText(`Daneben: ${selected.label} gehoert fachlich dazu.`, "warn");
      api.setDetailText(`Richtig waere gewesen: ${falseOption.label}. ${falseOption.detail || ""}`.trim());
      api.playSound("error");
      api.finish({
        outcome: "wrong",
        title: "Falscher Treffer verfehlt",
        summary: "Die Runde endet sofort nach einer falschen Auswahl.",
        statusText: `Daneben: ${selected.label} gehoert fachlich dazu.`,
        statusTone: "bad",
        lines: [
          `Gewaehlter Treffer: ${selected.label}`,
          `Richtiger Treffer: ${falseOption.label}`,
          `Eingabemodus: ${source}`
        ]
      });
    }

    function handleKeydown(event) {
      if (api.session.status !== "running" || locked) return;
      const key = String(event.key || "").trim().toLowerCase();
      const indexByKey = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3
      };
      if (!Object.prototype.hasOwnProperty.call(indexByKey, key)) return;
      const option = options[indexByKey[key]] || null;
      if (!option) return;
      event.preventDefault();
      selectOption(option.id, "keyboard");
    }

    global.addEventListener("keydown", handleKeydown);

    if (!falseOption) {
      api.setStatusText("Keine Demo-Daten fuer Falscher Treffer gefunden.", "warn");
    } else {
      api.setStatusText("Vor dem Start erklaert das Overlay die Runde. Danach den unpassenden Treffer antippen.", "");
      api.setDetailText("Tastaturkuerzel sind mitgedacht: 1-4 oder A-D.");
    }

    return {
      start() {
        locked = false;
        optionButtons.forEach((button) => {
          button.disabled = false;
          button.classList.remove("is-correct-answer", "is-picked-correct", "is-picked-wrong");
        });
        api.setStatusText("Finde den unpassenden Treffer und tippe, klicke oder druecke 1-4 beziehungsweise A-D.", "");
        api.setDetailText("Die Runde endet sofort nach der Auswahl oder mit Ablauf des Timers.");
      },
      stop() {
        locked = true;
      },
      destroy() {
        global.removeEventListener("keydown", handleKeydown);
      }
    };
  }

  if (!global.ChallengeRuntime || typeof global.ChallengeRuntime.registerType !== "function") {
    throw new Error("ChallengeRuntime ist noch nicht verfuegbar.");
  }

  global.ChallengeRuntime.registerType(TYPE_ID, { mount });
})(window);
