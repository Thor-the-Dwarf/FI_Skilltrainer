(function initChallengeQuickCodeType(global) {
  "use strict";

  const TYPE_ID = "quick_code";
  const KEY_HINTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function shuffleUntilDifferent(items) {
    const source = Array.isArray(items) ? items.slice() : [];
    if (source.length < 2) return source;
    const originalSignature = source.map((item) => item.id).join("|");
    let candidate = source.slice();
    let attempt = 0;
    while (candidate.map((item) => item.id).join("|") === originalSignature && attempt < 12) {
      candidate = source.slice();
      for (let index = candidate.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const temp = candidate[index];
        candidate[index] = candidate[swapIndex];
        candidate[swapIndex] = temp;
      }
      attempt += 1;
    }
    return candidate;
  }

  function mount(root, deck, api) {
    const round = Array.isArray(deck.rounds) ? deck.rounds[0] || null : null;
    const expectedItems = Array.isArray(round?.items)
      ? round.items.slice().sort((a, b) => a.order - b.order)
      : [];
    let availableTokens = [];
    let assembledTokens = [];
    let dragState = null;

    const board = createNode("div", "challenge-quick-board");
    const head = createNode("div", "challenge-quick-head");
    const kicker = createNode("span", "challenge-quick-kicker", "Token Rush");
    const title = createNode("h3", "challenge-quick-title", round?.prompt || "Quick Code");
    const hint = createNode("p", "challenge-quick-hint", round?.hint || "Setze die Bausteine in exakt richtiger Reihenfolge zusammen.");
    const preview = createNode("div", "challenge-quick-preview");
    const slotList = createNode("div", "challenge-quick-slot-list");
    const snippet = createNode("code", "challenge-quick-snippet", "");
    const tokenBank = createNode("div", "challenge-quick-token-bank");
    const note = createNode("p", "challenge-quick-note", "Touch, Maus und Klick sind direkt aktiv. Optional gehen auch 1-9 fuer die sichtbaren Tokens.");
    head.append(kicker, title, hint);
    preview.append(slotList, snippet);
    board.append(head, preview, tokenBank, note);
    root.innerHTML = "";
    root.appendChild(board);

    const slotNodes = [];

    function detachDragListeners() {
      global.removeEventListener("pointermove", handlePointerMove);
      global.removeEventListener("pointerup", handlePointerUp);
      global.removeEventListener("pointercancel", handlePointerUp);
    }

    function clearDragState() {
      if (!dragState) return;
      if (dragState.ghost?.parentNode) {
        dragState.ghost.parentNode.removeChild(dragState.ghost);
      }
      slotNodes.forEach((slotNode) => slotNode.classList.remove("is-drop-target"));
      detachDragListeners();
      dragState = null;
    }

    function buildSlots() {
      slotList.innerHTML = "";
      slotNodes.length = 0;
      expectedItems.forEach((item, index) => {
        const slot = createNode("div", "challenge-quick-slot");
        slot.dataset.slotIndex = String(index);
        const label = createNode("span", "challenge-quick-slot-label", assembledTokens[index]?.label || "...");
        const hintText = createNode("span", "challenge-quick-slot-hint", `Slot ${index + 1}`);
        slot.append(label, hintText);
        slot.dataset.quickSlotActive = index === assembledTokens.length ? "true" : "false";
        slot.classList.toggle("is-active", index === assembledTokens.length && assembledTokens.length < expectedItems.length);
        slot.classList.toggle("is-filled", Boolean(assembledTokens[index]));
        slotList.appendChild(slot);
        slotNodes.push(slot);
      });
      snippet.textContent = assembledTokens.map((item) => item.label).join(" ");
    }

    function buildTokenBank() {
      tokenBank.innerHTML = "";
      availableTokens.forEach((token, index) => {
        const button = createNode("button", "challenge-quick-token");
        button.type = "button";
        button.dataset.tokenId = token.id;
        button.setAttribute("aria-keyshortcuts", KEY_HINTS[index] || "");
        const key = createNode("span", "challenge-quick-token-key", KEY_HINTS[index] || "");
        const label = createNode("code", "challenge-quick-token-label", token.label);
        button.append(key, label);
        button.addEventListener("click", () => {
          selectToken(token.id, "click");
        });
        button.addEventListener("pointerdown", (event) => {
          if (api.session.status !== "running" || dragState) return;
          event.preventDefault();
          const rect = button.getBoundingClientRect();
          const ghost = button.cloneNode(true);
          ghost.className = "challenge-quick-token-ghost";
          ghost.style.width = `${rect.width}px`;
          ghost.style.left = `${rect.left}px`;
          ghost.style.top = `${rect.top}px`;
          document.body.appendChild(ghost);
          dragState = {
            tokenId: token.id,
            ghost,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
          };
          global.addEventListener("pointermove", handlePointerMove, { passive: false });
          global.addEventListener("pointerup", handlePointerUp, { passive: false });
          global.addEventListener("pointercancel", handlePointerUp, { passive: false });
        });
        tokenBank.appendChild(button);
      });
    }

    function refreshBoard() {
      buildSlots();
      buildTokenBank();
      api.setDetailText(`Slots gesetzt: ${assembledTokens.length}/${expectedItems.length} | Tokens offen: ${availableTokens.length}`);
    }

    function getActiveSlot() {
      return slotNodes[assembledTokens.length] || null;
    }

    function finishSuccess() {
      api.finish({
        outcome: "success",
        title: "Quick Code geschafft",
        summary: "Die Zeile wurde aus den kurzen Bausteinen exakt in der richtigen Reihenfolge zusammengesetzt.",
        statusText: "Snippet korrekt zusammengesetzt.",
        statusTone: "ok",
        lines: [
          `Snippet: ${assembledTokens.map((item) => item.label).join(" ")}`,
          `Bausteine: ${expectedItems.length}`,
          `Punkte: ${Math.max(0, Number(api.session.score || 0))}`
        ]
      });
    }

    function finishWrong(selectedToken, source) {
      const expectedToken = expectedItems[assembledTokens.length] || null;
      api.finish({
        outcome: "wrong",
        title: "Quick Code verfehlt",
        summary: "Ein unpassender Baustein beendet die Runde sofort in diesem Prototyp.",
        statusText: `Falsch: ${selectedToken?.label || "Baustein"} passt an dieser Stelle noch nicht.`,
        statusTone: "bad",
        lines: [
          `Eingabemodus: ${source}`,
          `Gewaehlter Baustein: ${selectedToken?.label || "-"}`,
          `Erwarteter Baustein: ${expectedToken?.label || "-"}`
        ]
      });
    }

    function selectToken(tokenId, source = "click") {
      if (api.session.status !== "running") return;
      const selectedToken = availableTokens.find((token) => token.id === tokenId) || null;
      const expectedToken = expectedItems[assembledTokens.length] || null;
      if (!selectedToken || !expectedToken) return;
      if (selectedToken.id !== expectedToken.id) {
        api.addScore(-30);
        api.setStatusText(`Falsch: ${selectedToken.label} passt an dieser Stelle noch nicht.`, "bad");
        api.setDetailText(`Erwartet waere als naechstes: ${expectedToken.label}`);
        api.playSound("error");
        finishWrong(selectedToken, source);
        return;
      }
      assembledTokens.push(selectedToken);
      availableTokens = availableTokens.filter((token) => token.id !== tokenId);
      api.addScore(60);
      api.setStatusText(`Slot ${assembledTokens.length}/${expectedItems.length} korrekt gefuellt.`, "ok");
      api.playSound("success");
      refreshBoard();
      if (assembledTokens.length >= expectedItems.length) {
        finishSuccess();
      }
    }

    function handlePointerMove(event) {
      if (!dragState || api.session.status !== "running") return;
      event.preventDefault();
      dragState.ghost.style.left = `${event.clientX - dragState.offsetX}px`;
      dragState.ghost.style.top = `${event.clientY - dragState.offsetY}px`;
      dragState.ghost.style.pointerEvents = "none";
      const hoveredSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest?.("[data-quick-slot-active='true']");
      dragState.ghost.style.pointerEvents = "";
      slotNodes.forEach((slotNode) => slotNode.classList.toggle("is-drop-target", slotNode === hoveredSlot));
    }

    function handlePointerUp(event) {
      if (!dragState) return;
      const hoveredSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest?.("[data-quick-slot-active='true']");
      const tokenId = dragState.tokenId;
      clearDragState();
      if (hoveredSlot) {
        selectToken(tokenId, "drag");
      }
    }

    function handleKeydown(event) {
      if (api.session.status !== "running") return;
      const key = String(event.key || "").trim();
      const index = KEY_HINTS.indexOf(key);
      if (index < 0) return;
      const button = tokenBank.querySelectorAll("[data-token-id]")[index] || null;
      const tokenId = String(button?.dataset?.tokenId || "").trim();
      if (!tokenId) return;
      event.preventDefault();
      selectToken(tokenId, "keyboard");
    }

    function resetRound() {
      clearDragState();
      assembledTokens = [];
      availableTokens = shuffleUntilDifferent(expectedItems);
      refreshBoard();
    }

    global.addEventListener("keydown", handleKeydown);

    if (!expectedItems.length) {
      api.setStatusText("Keine Demo-Daten fuer Quick Code gefunden.", "warn");
    } else {
      api.setStatusText("Vor dem Start erklaert das Overlay die Runde. Danach setzt du das Snippet Slot fuer Slot zusammen.", "");
      api.setDetailText("Falsche Bausteine beenden die Runde sofort.");
      resetRound();
    }

    return {
      start() {
        if (!expectedItems.length) return;
        resetRound();
        api.setStatusText("Waehle den jeweils passenden Baustein fuer den naechsten freien Slot.", "");
        api.setDetailText(`Slots gesetzt: ${assembledTokens.length}/${expectedItems.length} | Tokens offen: ${availableTokens.length}`);
      },
      stop() {
        clearDragState();
      },
      destroy() {
        clearDragState();
        global.removeEventListener("keydown", handleKeydown);
      }
    };
  }

  if (!global.ChallengeRuntime || typeof global.ChallengeRuntime.registerType !== "function") {
    throw new Error("ChallengeRuntime ist noch nicht verfuegbar.");
  }

  global.ChallengeRuntime.registerType(TYPE_ID, { mount });
})(window);
