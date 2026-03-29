(function initChallengeFallingCardsType(global) {
  "use strict";

  const TYPE_ID = "fallende_karten";
  const MAX_ACTIVE_CARDS = 2;
  const SPAWN_DELAY_MS = 1500;
  const COLUMN_RATIOS = [0.16, 0.34, 0.52, 0.7, 0.84];

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
      const temp = list[index];
      list[index] = list[swapIndex];
      list[swapIndex] = temp;
    }
    return list;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function mount(root, deck, api) {
    const totalCards = Array.isArray(deck.cards) ? deck.cards.length : 0;
    const zoneNodesById = new Map();
    let queuedCards = [];
    let activeCards = [];
    let placedCardsByZoneId = new Map();
    let resolvedCount = 0;
    let spawnIndex = 0;
    let nextSpawnAtMs = 0;
    let animationFrameId = 0;
    let lastFrameMs = 0;
    let dragState = null;

    const board = createNode("div", "challenge-falling-board");
    const head = createNode("div", "challenge-falling-head");
    const kicker = createNode("span", "challenge-falling-kicker", "Live Sortieren");
    const title = createNode("h3", "challenge-falling-title", deck.subtitle || "Fallende Karten");
    const hint = createNode("p", "challenge-falling-hint", deck.description || "Sortiere fallende Karten rechtzeitig in das passende Ziel.");
    const note = createNode("p", "challenge-falling-note", "Maus und Touch funktionieren direkt per Drag & Drop.");
    const playfield = createNode("section", "challenge-falling-playfield");
    const sky = createNode("div", "challenge-falling-sky");
    const failLine = createNode("div", "challenge-falling-fail-line");
    const cardLayer = createNode("div", "challenge-falling-card-layer");
    const zoneRow = createNode("div", "challenge-falling-zones");
    const meta = createNode("div", "challenge-falling-meta");
    const metaRemaining = createNode("span", "challenge-falling-meta-pill", "");
    const metaActive = createNode("span", "challenge-falling-meta-pill", "");
    const metaResolved = createNode("span", "challenge-falling-meta-pill", "");
    meta.append(metaRemaining, metaActive, metaResolved);

    COLUMN_RATIOS.forEach((ratio, index) => {
      const lane = createNode("div", "challenge-falling-lane");
      lane.style.setProperty("--lane-left", `${ratio * 100}%`);
      lane.dataset.laneIndex = String(index);
      sky.appendChild(lane);
    });

    (deck.zones || []).forEach((zone) => {
      const zoneCard = createNode("section", "challenge-falling-zone");
      zoneCard.dataset.zoneId = zone.id;
      const zoneLabel = createNode("strong", "challenge-falling-zone-label", zone.label);
      const zoneHint = createNode("p", "challenge-falling-zone-hint", zone.hint || "");
      const zoneCount = createNode("span", "challenge-falling-zone-count", "0");
      const zoneList = createNode("div", "challenge-falling-zone-list");
      zoneCard.append(zoneLabel, zoneHint, zoneCount, zoneList);
      zoneNodesById.set(zone.id, { card: zoneCard, count: zoneCount, list: zoneList, label: zone.label });
      zoneRow.appendChild(zoneCard);
    });

    head.append(kicker, title, hint);
    playfield.append(sky, failLine, cardLayer, zoneRow);
    board.append(head, playfield, meta, note);
    root.innerHTML = "";
    root.appendChild(board);

    function getPlayfieldMetrics() {
      const playfieldRect = playfield.getBoundingClientRect();
      const zoneRowRect = zoneRow.getBoundingClientRect();
      return {
        width: Math.max(320, playfieldRect.width),
        height: Math.max(420, playfieldRect.height),
        zoneTop: Math.max(0, zoneRowRect.top - playfieldRect.top),
        playfieldRect
      };
    }

    function refreshZone(zoneId) {
      const node = zoneNodesById.get(zoneId);
      if (!node) return;
      const items = placedCardsByZoneId.get(zoneId) || [];
      node.count.textContent = String(items.length);
      node.list.innerHTML = "";
      items.forEach((card) => {
        node.list.appendChild(createNode("span", "challenge-falling-zone-chip", card.label));
      });
    }

    function refreshProgress() {
      metaRemaining.textContent = `Rest: ${Math.max(0, queuedCards.length)}`;
      metaActive.textContent = `Aktiv: ${activeCards.length}`;
      metaResolved.textContent = `Geloest: ${resolvedCount}/${totalCards}`;
      api.setDetailText(`Geloest: ${resolvedCount}/${totalCards} | Aktiv: ${activeCards.length} | Wartend: ${queuedCards.length}`);
    }

    function detachDragListeners() {
      global.removeEventListener("pointermove", handlePointerMove);
      global.removeEventListener("pointerup", handlePointerUp);
      global.removeEventListener("pointercancel", handlePointerUp);
    }

    function clearDragState() {
      if (!dragState) return;
      if (dragState.card) {
        dragState.card.isDragging = false;
        dragState.card.el.classList.remove("is-dragging");
      }
      zoneNodesById.forEach((node) => node.card.classList.remove("is-hovered"));
      detachDragListeners();
      dragState = null;
    }

    function removeCard(cardState) {
      const cardIndex = activeCards.indexOf(cardState);
      if (cardIndex >= 0) {
        activeCards.splice(cardIndex, 1);
      }
      if (cardState?.el?.parentNode) {
        cardState.el.parentNode.removeChild(cardState.el);
      }
      if (dragState?.card === cardState) {
        clearDragState();
      }
      refreshProgress();
    }

    function findZoneIdFromPoint(clientX, clientY) {
      const elements = document.elementsFromPoint(clientX, clientY);
      const target = elements.find((element) => element instanceof HTMLElement && element.dataset && element.dataset.zoneId);
      return target ? String(target.dataset.zoneId || "").trim() : "";
    }

    function positionCard(cardState, clientX, clientY) {
      const metrics = getPlayfieldMetrics();
      const cardWidth = Math.max(160, Number(cardState.width) || 0);
      const cardHeight = Math.max(96, Number(cardState.height) || 0);
      const nextX = clientX - metrics.playfieldRect.left - dragState.offsetX;
      const nextY = clientY - metrics.playfieldRect.top - dragState.offsetY;
      cardState.x = clamp(nextX, 8, metrics.width - cardWidth - 8);
      cardState.y = clamp(nextY, 8, metrics.height - cardHeight - 8);
      cardState.el.style.transform = `translate(${cardState.x}px, ${cardState.y}px)`;
    }

    function finishWrong(cardState, mode, zoneId = "") {
      if (api.session.status !== "running") return;
      const expectedZone = zoneNodesById.get(String(cardState?.data?.targetZoneId || "").trim());
      const chosenZone = zoneNodesById.get(String(zoneId || "").trim());
      if (mode === "miss") {
        api.setStatusText(`Verpasst: ${cardState?.data?.label || "Karte"} hat den unteren Rand erreicht.`, "bad");
        api.finish({
          outcome: "wrong",
          title: "Fallende Karten verfehlt",
          summary: "Mindestens eine Karte hat den Boden erreicht, bevor sie einsortiert wurde.",
          statusText: `Verpasst: ${cardState?.data?.label || "Karte"} hat den unteren Rand erreicht.`,
          statusTone: "bad",
          lines: [
            `Verpasste Karte: ${cardState?.data?.label || "-"}`,
            `Richtiges Ziel: ${expectedZone?.label || cardState?.data?.targetZoneId || "-"}`,
            `Bereits geloest: ${resolvedCount}/${totalCards}`
          ]
        });
        return;
      }
      api.setStatusText(`Daneben: ${cardState?.data?.label || "Karte"} gehoert nicht nach ${chosenZone?.label || zoneId || "dieses Ziel"}.`, "bad");
      api.finish({
        outcome: "wrong",
        title: "Fallende Karten verfehlt",
        summary: "Eine fallende Karte wurde in das falsche Ziel gezogen.",
        statusText: `Daneben: ${cardState?.data?.label || "Karte"} gehoert nicht nach ${chosenZone?.label || zoneId || "dieses Ziel"}.`,
        statusTone: "bad",
        lines: [
          `Karte: ${cardState?.data?.label || "-"}`,
          `Gewaehltes Ziel: ${chosenZone?.label || zoneId || "-"}`,
          `Richtiges Ziel: ${expectedZone?.label || cardState?.data?.targetZoneId || "-"}`
        ]
      });
    }

    function finishSuccessIfDone() {
      if (resolvedCount < totalCards || queuedCards.length || activeCards.length) return;
      api.finish({
        outcome: "success",
        title: "Fallende Karten geschafft",
        summary: "Alle fallenden Karten wurden rechtzeitig in die passenden Ziele gezogen.",
        statusText: "Alle fallenden Karten sind korrekt einsortiert.",
        statusTone: "ok",
        lines: [
          `Karten geloest: ${resolvedCount}/${totalCards}`,
          `Ziele: ${(deck.zones || []).length}`,
          "Keine Karte hat den unteren Rand erreicht."
        ]
      });
    }

    function resolveDrop(cardState, zoneId) {
      const normalizedZoneId = String(zoneId || "").trim();
      if (!normalizedZoneId) return;
      if (normalizedZoneId !== String(cardState.data.targetZoneId || "").trim()) {
        api.playSound("error");
        finishWrong(cardState, "wrong_zone", normalizedZoneId);
        return;
      }
      removeCard(cardState);
      const items = placedCardsByZoneId.get(normalizedZoneId) || [];
      items.push(cardState.data);
      placedCardsByZoneId.set(normalizedZoneId, items);
      refreshZone(normalizedZoneId);
      resolvedCount += 1;
      api.addScore(Math.max(80, Math.round(Number(api.session.remainingMs || 0) / 120)));
      api.setStatusText(`Versorgt: ${cardState.data.label}`, "ok");
      api.playSound("success");
      refreshProgress();
      finishSuccessIfDone();
    }

    function handlePointerMove(event) {
      if (!dragState || api.session.status !== "running") return;
      event.preventDefault();
      const zoneId = findZoneIdFromPoint(event.clientX, event.clientY);
      zoneNodesById.forEach((node) => node.card.classList.toggle("is-hovered", node.card.dataset.zoneId === zoneId));
      positionCard(dragState.card, event.clientX, event.clientY);
    }

    function handlePointerUp(event) {
      if (!dragState) return;
      const zoneId = findZoneIdFromPoint(event.clientX, event.clientY);
      const cardState = dragState.card;
      clearDragState();
      if (!cardState || api.session.status !== "running") return;
      if (zoneId) {
        resolveDrop(cardState, zoneId);
      }
    }

    function bindCardInteractions(cardState) {
      cardState.el.addEventListener("pointerdown", (event) => {
        if (api.session.status !== "running" || dragState) return;
        event.preventDefault();
        const rect = cardState.el.getBoundingClientRect();
        dragState = {
          card: cardState,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top
        };
        cardState.isDragging = true;
        cardState.el.classList.add("is-dragging");
        global.addEventListener("pointermove", handlePointerMove, { passive: false });
        global.addEventListener("pointerup", handlePointerUp, { passive: false });
        global.addEventListener("pointercancel", handlePointerUp, { passive: false });
      });
    }

    function spawnCard() {
      if (!queuedCards.length || activeCards.length >= MAX_ACTIVE_CARDS || api.session.status !== "running") {
        return false;
      }
      const cardData = queuedCards.shift();
      const card = createNode("article", "challenge-falling-card");
      const cardKicker = createNode("span", "challenge-falling-card-kicker", "Fallende Karte");
      const cardTitle = createNode("strong", "challenge-falling-card-title", cardData.label);
      const cardDetail = createNode("p", "challenge-falling-card-detail", cardData.detail || "");
      card.append(cardKicker, cardTitle);
      if (cardDetail.textContent) {
        card.appendChild(cardDetail);
      }
      cardLayer.appendChild(card);
      const metrics = getPlayfieldMetrics();
      const cardWidth = Math.max(176, card.offsetWidth || 0);
      const cardHeight = Math.max(104, card.offsetHeight || 0);
      const spawnColumn = spawnIndex % COLUMN_RATIOS.length;
      const laneRatio = COLUMN_RATIOS[spawnColumn];
      const x = clamp((metrics.width * laneRatio) - (cardWidth / 2), 10, metrics.width - cardWidth - 10);
      const cardState = {
        data: cardData,
        el: card,
        x,
        y: -cardHeight - 8,
        width: cardWidth,
        height: cardHeight,
        speed: 92 + ((spawnIndex % 3) * 12),
        isDragging: false
      };
      spawnIndex += 1;
      card.dataset.cardId = cardData.id;
      card.dataset.spawnColumn = String(spawnColumn);
      card.dataset.targetZoneId = cardData.targetZoneId;
      card.style.transform = `translate(${cardState.x}px, ${cardState.y}px)`;
      activeCards.push(cardState);
      bindCardInteractions(cardState);
      refreshProgress();
      return true;
    }

    function updateAnimation(nowMs) {
      if (api.session.status !== "running") return;
      const deltaMs = lastFrameMs ? Math.min(48, nowMs - lastFrameMs) : 16;
      lastFrameMs = nowMs;
      const metrics = getPlayfieldMetrics();
      const failLineY = Math.max(140, metrics.zoneTop - 24);
      if (nowMs >= nextSpawnAtMs) {
        if (spawnCard()) {
          nextSpawnAtMs = nowMs + SPAWN_DELAY_MS;
        } else if (queuedCards.length) {
          nextSpawnAtMs = nowMs + 180;
        }
      }
      for (const cardState of activeCards.slice()) {
        if (cardState.isDragging) continue;
        cardState.y += cardState.speed * (deltaMs / 1000);
        if (cardState.y + cardState.height >= failLineY) {
          api.playSound("error");
          finishWrong(cardState, "miss");
          return;
        }
        cardState.el.style.transform = `translate(${cardState.x}px, ${cardState.y}px)`;
      }
      animationFrameId = global.requestAnimationFrame(updateAnimation);
    }

    function stopAnimation() {
      if (!animationFrameId) return;
      global.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    function resetRound() {
      stopAnimation();
      clearDragState();
      activeCards.forEach((cardState) => {
        if (cardState.el?.parentNode) {
          cardState.el.parentNode.removeChild(cardState.el);
        }
      });
      activeCards = [];
      queuedCards = shuffle(deck.cards || []);
      placedCardsByZoneId = new Map();
      (deck.zones || []).forEach((zone) => {
        placedCardsByZoneId.set(zone.id, []);
        refreshZone(zone.id);
      });
      resolvedCount = 0;
      spawnIndex = 0;
      nextSpawnAtMs = 0;
      lastFrameMs = 0;
      refreshProgress();
    }

    if (!totalCards || !(deck.zones || []).length) {
      api.setStatusText("Keine Demo-Daten fuer Fallende Karten gefunden.", "warn");
    } else {
      api.setStatusText("Vor dem Start erklaert das Overlay die Runde. Danach ziehst du fallende Karten in die Ziele.", "");
      api.setDetailText("Verpasst du eine Karte oder landest im falschen Ziel, endet die Runde sofort.");
      resetRound();
    }

    return {
      start() {
        if (!totalCards || !(deck.zones || []).length) return;
        resetRound();
        api.setStatusText("Ziehe fallende Karten rechtzeitig in das passende Ziel unten.", "");
        api.setDetailText(`Geloest: ${resolvedCount}/${totalCards} | Aktiv: ${activeCards.length} | Wartend: ${queuedCards.length}`);
        animationFrameId = global.requestAnimationFrame(updateAnimation);
      },
      stop() {
        stopAnimation();
        clearDragState();
      },
      destroy() {
        stopAnimation();
        clearDragState();
      }
    };
  }

  if (!global.ChallengeRuntime || typeof global.ChallengeRuntime.registerType !== "function") {
    throw new Error("ChallengeRuntime ist noch nicht verfuegbar.");
  }

  global.ChallengeRuntime.registerType(TYPE_ID, { mount });
})(window);
