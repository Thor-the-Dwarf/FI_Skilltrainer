(function initChallengeAssignType(global) {
  "use strict";

  const TYPE_ID = "zuordnen";

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function shuffle(items) {
    const list = Array.isArray(items) ? items.slice() : [];
    for (let index = list.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const tmp = list[index];
      list[index] = list[swapIndex];
      list[swapIndex] = tmp;
    }
    return list;
  }

  function mount(root, deck, api) {
    const totalCards = Array.isArray(deck.cards) ? deck.cards.length : 0;
    const discardZoneId = String(deck.discardZone?.id || "discard");
    const openQueue = shuffle(deck.cards || []);
    const parkedQueue = [];
    const placedCardsByZoneId = new Map();
    const zoneNodesById = new Map();
    let resolvedCount = 0;
    let mistakes = 0;
    let dragState = null;

    const board = createNode("div", "challenge-assign-board");
    const arena = createNode("div", "challenge-assign-arena");
    const ring = createNode("div", "challenge-assign-ring");
    const core = createNode("section", "challenge-assign-core");
    const deckBadge = createNode("span", "challenge-assign-deck-badge", "0");
    const deckTitle = createNode("h3", "challenge-assign-core-title", "Zentrales Deck");
    const deckHint = createNode("p", "challenge-assign-core-hint", "Ziehe die oberste Karte nach aussen oder parke sie fuer spaeter.");
    const cardLayer = createNode("div", "challenge-assign-card-layer");
    const discardWrap = createNode("div", "challenge-assign-discard-wrap");
    const metaBar = createNode("div", "challenge-assign-meta");
    const metaRemaining = createNode("span", "challenge-assign-meta-pill", "");
    const metaParked = createNode("span", "challenge-assign-meta-pill", "");
    const metaMistakes = createNode("span", "challenge-assign-meta-pill", "");
    metaBar.append(metaRemaining, metaParked, metaMistakes);
    core.append(deckBadge, deckTitle, deckHint);
    arena.append(ring, core, cardLayer);
    board.append(arena, discardWrap, metaBar);
    root.innerHTML = "";
    root.appendChild(board);

    function getActiveCard() {
      return openQueue[0] || null;
    }

    function syncParkedQueueWithFrontCard() {
      const activeCard = getActiveCard();
      while (parkedQueue.length && activeCard && parkedQueue[0]?.id === activeCard.id) {
        parkedQueue.shift();
      }
    }

    function setProgressText() {
      const remainingCount = openQueue.length;
      const parkedCount = parkedQueue.length;
      metaRemaining.textContent = `Offen: ${remainingCount}`;
      metaParked.textContent = `Spaeter: ${parkedCount}`;
      metaMistakes.textContent = `Fehlversuche: ${mistakes}`;
      api.setDetailText(`Korrekt geloest: ${resolvedCount}/${totalCards} | Offen: ${remainingCount} | Spaeter: ${parkedCount}`);
    }

    function createDropZone(zone, index, total, isDiscard = false) {
      const element = createNode("section", `challenge-dropzone${isDiscard ? " is-discard" : ""}`);
      element.dataset.zoneId = zone.id;
      if (!isDiscard) {
        const angle = (-90 + (360 / Math.max(1, total)) * index) * (Math.PI / 180);
        element.style.setProperty("--zone-x", `${Math.cos(angle) * 34}%`);
        element.style.setProperty("--zone-y", `${Math.sin(angle) * 34}%`);
      }
      const label = createNode("strong", "challenge-dropzone-label", zone.label);
      const hint = createNode("p", "challenge-dropzone-hint", zone.hint || "");
      const count = createNode("span", "challenge-dropzone-count", "0");
      const list = createNode("div", `challenge-dropzone-list${isDiscard ? " is-queue" : ""}`);
      element.append(label, hint, count, list);
      if (!isDiscard) {
        placedCardsByZoneId.set(zone.id, []);
      }
      zoneNodesById.set(zone.id, { element, count, list });
      return element;
    }

    (deck.zones || []).forEach((zone, index, source) => {
      ring.appendChild(createDropZone(zone, index, source.length, false));
    });
    discardWrap.appendChild(createDropZone(deck.discardZone || { id: discardZoneId, label: "Spaeter-Stapel" }, 0, 1, true));

    function updateDropZone(zoneId) {
      const node = zoneNodesById.get(zoneId);
      if (!node) return;
      const items = zoneId === discardZoneId
        ? parkedQueue
        : (placedCardsByZoneId.get(zoneId) || []);
      node.count.textContent = String(items.length);
      node.list.innerHTML = "";
      items.forEach((card) => {
        if (zoneId === discardZoneId) {
          const queueItem = createNode("div", "challenge-dropzone-queue-item");
          const queueOrder = createNode("span", "challenge-dropzone-queue-order", String(node.list.children.length + 1));
          const queueLabel = createNode("span", "challenge-dropzone-queue-label", card.label);
          queueItem.append(queueOrder, queueLabel);
          node.list.appendChild(queueItem);
          return;
        }
        const chip = createNode("span", "challenge-dropzone-chip", card.label);
        node.list.appendChild(chip);
      });
    }

    function updateDeckBadge() {
      const remainingCount = openQueue.length;
      deckBadge.textContent = String(remainingCount);
      board.dataset.empty = remainingCount === 0 ? "true" : "false";
    }

    function clearHoveredZones() {
      zoneNodesById.forEach((node) => node.element.classList.remove("is-hovered"));
    }

    function cancelDrag() {
      if (!dragState) return;
      if (dragState.cardEl) {
        dragState.cardEl.classList.remove("is-dragging");
        dragState.cardEl.style.left = "";
        dragState.cardEl.style.top = "";
        dragState.cardEl.style.width = "";
        dragState.cardEl.style.height = "";
        dragState.cardEl.style.pointerEvents = "";
      }
      clearHoveredZones();
      global.removeEventListener("pointermove", handlePointerMove);
      global.removeEventListener("pointerup", handlePointerUp);
      global.removeEventListener("pointercancel", handlePointerUp);
      dragState = null;
    }

    function getDropZoneIdFromPoint(clientX, clientY) {
      const elements = document.elementsFromPoint(clientX, clientY);
      const target = elements.find((element) => element instanceof HTMLElement && element.dataset && element.dataset.zoneId);
      return target ? String(target.dataset.zoneId || "").trim() : "";
    }

    function positionDraggedCard(clientX, clientY) {
      if (!dragState || !dragState.cardEl) return;
      const boardRect = board.getBoundingClientRect();
      dragState.cardEl.style.left = `${clientX - boardRect.left - dragState.offsetX}px`;
      dragState.cardEl.style.top = `${clientY - boardRect.top - dragState.offsetY}px`;
    }

    function handlePointerMove(event) {
      if (!dragState || api.session.status !== "running") return;
      event.preventDefault();
      dragState.cardEl.style.pointerEvents = "none";
      positionDraggedCard(event.clientX, event.clientY);
      const hoveredZoneId = getDropZoneIdFromPoint(event.clientX, event.clientY);
      clearHoveredZones();
      if (hoveredZoneId && zoneNodesById.has(hoveredZoneId)) {
        zoneNodesById.get(hoveredZoneId).element.classList.add("is-hovered");
      }
      dragState.cardEl.style.pointerEvents = "";
    }

    function renderDeckStack() {
      cardLayer.innerHTML = "";
      cardLayer.dataset.depth = "0";
      delete cardLayer.dataset.activeCardId;
      const activeCard = getActiveCard();
      if (!activeCard) {
        const doneState = createNode("div", "challenge-assign-empty-state", "Deck leer. Alle Karten sind geloest.");
        cardLayer.appendChild(doneState);
        return;
      }
      const visibleCards = openQueue.slice(0, Math.min(5, openQueue.length));
      cardLayer.dataset.depth = String(visibleCards.length);
      cardLayer.dataset.activeCardId = activeCard.id;
      for (let index = visibleCards.length - 1; index >= 0; index -= 1) {
        const cardData = visibleCards[index];
        const isActiveCard = index === 0;
        const card = createNode("article", `challenge-assign-card${isActiveCard ? " is-active" : " is-preview"}`);
        card.style.setProperty("--stack-index", String(index));
        card.style.setProperty("--stack-rotate", `${(index % 2 === 0 ? -1 : 1) * index * 1.2}deg`);
        card.dataset.cardId = cardData.id;
        if (isActiveCard) {
          card.tabIndex = 0;
        } else {
          card.setAttribute("aria-hidden", "true");
        }
        const kicker = createNode(
          "span",
          "challenge-assign-card-kicker",
          isActiveCard
            ? `Oben im Deck · ${resolvedCount + 1}/${totalCards}`
            : `Decklage ${index + 1}`
        );
        const title = createNode("h3", "challenge-assign-card-title", cardData.label);
        const detail = createNode(
          "p",
          "challenge-assign-card-detail",
          isActiveCard
            ? (cardData.detail || "")
            : (index === 1 ? "Naechste offene Karte im Stapel." : "Weitere offene Karte im Deck.")
        );
        card.append(kicker, title);
        if (detail.textContent) card.appendChild(detail);
        if (isActiveCard) {
          card.addEventListener("pointerdown", (event) => {
            if (api.session.status !== "running" || dragState) return;
            event.preventDefault();
            const rect = card.getBoundingClientRect();
            dragState = {
              cardEl: card,
              offsetX: event.clientX - rect.left,
              offsetY: event.clientY - rect.top
            };
            card.classList.add("is-dragging");
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            positionDraggedCard(event.clientX, event.clientY);
            global.addEventListener("pointermove", handlePointerMove, { passive: false });
            global.addEventListener("pointerup", handlePointerUp, { passive: false });
            global.addEventListener("pointercancel", handlePointerUp, { passive: false });
          });
        }
        cardLayer.appendChild(card);
      }
    }

    function refreshBoardState() {
      syncParkedQueueWithFrontCard();
      updateDeckBadge();
      zoneNodesById.forEach((_, zoneId) => {
        updateDropZone(zoneId);
      });
      setProgressText();
      renderDeckStack();
    }

    function finishIfDone() {
      if (openQueue.length) return;
      api.finish({
        success: true,
        title: "Alle Karten sind einsortiert",
        summary: "Der lokale Challenge-Flow fuer Zuordnen ist komplett spielbar abgeschlossen.",
        lines: [
          `Karten geloest: ${resolvedCount}/${totalCards}`,
          `Fehlversuche: ${mistakes}`,
          "Der Spaeter-Stapel ist leer und alle Karten sind final zugeordnet."
        ]
      });
    }

    function handleCorrectPlacement(targetZoneId) {
      const activeCard = getActiveCard();
      if (!activeCard) return;
      openQueue.shift();
      const nextItems = placedCardsByZoneId.get(targetZoneId) || [];
      nextItems.push(activeCard);
      placedCardsByZoneId.set(targetZoneId, nextItems);
      resolvedCount += 1;
      api.addScore(140);
      api.setStatusText(
        `Korrekt zugeordnet: ${activeCard.label} -> ${(zoneNodesById.get(targetZoneId)?.element.querySelector(".challenge-dropzone-label")?.textContent || "").trim()}`,
        "ok"
      );
      api.playSound("success");
      refreshBoardState();
      finishIfDone();
    }

    function handleParkPlacement() {
      const activeCard = getActiveCard();
      if (!activeCard) return;
      openQueue.shift();
      openQueue.push(activeCard);
      parkedQueue.push(activeCard);
      api.setStatusText(`Fuer spaeter geparkt: ${activeCard.label}`, "");
      api.setDetailText(`Die Karte liegt jetzt hinten in der offenen Queue und kommt spaeter erneut.`);
      api.playSound("tap");
      refreshBoardState();
    }

    function handleWrongPlacement(targetZoneId) {
      const activeCard = getActiveCard();
      if (!activeCard) return;
      mistakes += 1;
      api.addScore(-25);
      const zoneLabel = zoneNodesById.get(targetZoneId)?.element.querySelector(".challenge-dropzone-label")?.textContent?.trim() || "dieses Ziel";
      api.setStatusText(`Noch nicht korrekt: ${activeCard.label} passt nicht zu ${zoneLabel}.`, "warn");
      api.playSound("error");
      refreshBoardState();
    }

    function handlePointerUp(event) {
      if (!dragState) return;
      const releasedZoneId = getDropZoneIdFromPoint(event.clientX, event.clientY);
      cancelDrag();
      if (!releasedZoneId) {
        api.setStatusText("Keine Zone getroffen. Ziehe die Karte erneut aus der Mitte.", "warn");
        renderDeckStack();
        return;
      }
      if (api.session.status !== "running") {
        renderDeckStack();
        return;
      }
      const activeCard = getActiveCard();
      if (!activeCard) return;
      if (releasedZoneId === discardZoneId) {
        handleParkPlacement();
        return;
      }
      if (releasedZoneId === activeCard.targetZoneId) {
        handleCorrectPlacement(releasedZoneId);
      } else {
        handleWrongPlacement(releasedZoneId);
      }
    }

    refreshBoardState();
    api.setStatusText("Vor dem Start erklaert das Overlay die Runde. Danach kommt die oberste Karte aus dem Zentrum.", "");

    return {
      start() {
        api.setStatusText("Die Runde laeuft. Ziehe die oberste Karte auf ein Ziel oder parke sie unten fuer spaeter.", "");
      },
      stop() {
        cancelDrag();
      },
      destroy() {
        cancelDrag();
      }
    };
  }

  if (!global.ChallengeRuntime || typeof global.ChallengeRuntime.registerType !== "function") {
    throw new Error("ChallengeRuntime ist noch nicht verfuegbar.");
  }

  global.ChallengeRuntime.registerType(TYPE_ID, { mount });
})(window);
