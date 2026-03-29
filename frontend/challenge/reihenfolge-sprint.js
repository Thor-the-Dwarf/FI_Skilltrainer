(function initChallengeOrderSprintType(global) {
  "use strict";

  const TYPE_ID = "reihenfolge_sprint";

  function createNode(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) node.textContent = String(textContent);
    return node;
  }

  function moveItem(items, fromIndex, toIndex) {
    const list = Array.isArray(items) ? items.slice() : [];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length || fromIndex === toIndex) {
      return list;
    }
    const [item] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, item);
    return list;
  }

  function shuffleUntilDifferent(items) {
    const source = Array.isArray(items) ? items.slice() : [];
    const originalSignature = source.map((item) => item.id).join("|");
    if (source.length < 2) return source;
    let candidate = source.slice();
    let attempts = 0;
    while (candidate.map((item) => item.id).join("|") === originalSignature && attempts < 12) {
      candidate = source.slice();
      for (let index = candidate.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const tmp = candidate[index];
        candidate[index] = candidate[swapIndex];
        candidate[swapIndex] = tmp;
      }
      attempts += 1;
    }
    return candidate;
  }

  function mount(root, deck, api) {
    const round = Array.isArray(deck.rounds) ? deck.rounds[0] || null : null;
    const originalItems = Array.isArray(round?.items) ? round.items.slice().sort((a, b) => a.order - b.order) : [];
    let currentItems = shuffleUntilDifferent(originalItems);
    let dragState = null;
    let focusedItemId = "";

    const board = createNode("div", "challenge-order-board");
    const head = createNode("div", "challenge-order-head");
    const kicker = createNode("span", "challenge-order-kicker", "Exact Match");
    const title = createNode("h3", "challenge-order-title", round?.prompt || "Bringe die Schritte in die richtige Reihenfolge.");
    const hint = createNode("p", "challenge-order-hint", round?.hint || "Sortiere die Schritte unter Zeitdruck.");
    const list = createNode("div", "challenge-order-list");
    const actions = createNode("div", "challenge-order-actions");
    const submitButton = createNode("button", "btn-primary challenge-order-submit", "Reihenfolge pruefen");
    submitButton.type = "button";
    const note = createNode("p", "challenge-order-note", "Drag & Drop fuer Maus/Touch, ArrowUp/ArrowDown fuer Tastatur. Enter oder Space prueft die Liste.");
    actions.appendChild(submitButton);
    head.append(kicker, title);
    if (hint.textContent) head.appendChild(hint);
    board.append(head, list, actions, note);
    root.innerHTML = "";
    root.appendChild(board);

    function clearDragArtifacts() {
      if (dragState?.ghost && dragState.ghost.parentNode) {
        dragState.ghost.parentNode.removeChild(dragState.ghost);
      }
      global.removeEventListener("pointermove", handlePointerMove);
      global.removeEventListener("pointerup", handlePointerUp);
      global.removeEventListener("pointercancel", handlePointerUp);
      document.querySelectorAll(".challenge-order-item").forEach((item) => {
        item.classList.remove("is-drop-before", "is-drop-after", "is-drag-source");
      });
      dragState = null;
    }

    function applyDropIndicator(itemId = "", insertAfter = false) {
      document.querySelectorAll(".challenge-order-item").forEach((item) => {
        const matches = String(item.dataset.orderItemId || "") === itemId;
        item.classList.toggle("is-drop-before", matches && !insertAfter);
        item.classList.toggle("is-drop-after", matches && insertAfter);
      });
    }

    function renderList(focusItemId = "") {
      list.innerHTML = "";
      currentItems.forEach((item, index) => {
        const button = createNode("button", "challenge-order-item");
        button.type = "button";
        button.dataset.orderItemId = item.id;
        const orderBadge = createNode("span", "challenge-order-item-order", String(index + 1));
        const copy = createNode("span", "challenge-order-item-copy");
        const label = createNode("strong", "challenge-order-item-label", item.label);
        const handle = createNode("span", "challenge-order-item-handle", "::");
        copy.append(label);
        button.append(orderBadge, copy, handle);
        button.addEventListener("pointerdown", (event) => {
          if (api.session.status !== "running" || dragState) return;
          event.preventDefault();
          focusedItemId = item.id;
          const rect = button.getBoundingClientRect();
          const ghost = button.cloneNode(true);
          ghost.className = "challenge-order-ghost";
          ghost.style.width = `${rect.width}px`;
          ghost.style.left = `${rect.left}px`;
          ghost.style.top = `${rect.top}px`;
          document.body.appendChild(ghost);
          dragState = {
            itemId: item.id,
            ghost,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            hoverId: "",
            insertAfter: false
          };
          button.classList.add("is-drag-source");
          global.addEventListener("pointermove", handlePointerMove, { passive: false });
          global.addEventListener("pointerup", handlePointerUp, { passive: false });
          global.addEventListener("pointercancel", handlePointerUp, { passive: false });
        });
        button.addEventListener("keydown", (event) => {
          if (api.session.status !== "running") return;
          const currentIndex = currentItems.findIndex((entry) => entry.id === item.id);
          if (event.key === "ArrowUp" && currentIndex > 0) {
            event.preventDefault();
            currentItems = moveItem(currentItems, currentIndex, currentIndex - 1);
            focusedItemId = item.id;
            renderList(item.id);
            api.setStatusText(`Schritt verschoben: ${item.label}`, "");
            api.setDetailText("Mit Enter oder Space pruefst du die Reihenfolge.");
            return;
          }
          if (event.key === "ArrowDown" && currentIndex >= 0 && currentIndex < currentItems.length - 1) {
            event.preventDefault();
            currentItems = moveItem(currentItems, currentIndex, currentIndex + 1);
            focusedItemId = item.id;
            renderList(item.id);
            api.setStatusText(`Schritt verschoben: ${item.label}`, "");
            api.setDetailText("Mit Enter oder Space pruefst du die Reihenfolge.");
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            evaluateOrder("keyboard");
          }
        });
        list.appendChild(button);
      });
      if (focusItemId) {
        const focusTarget = list.querySelector(`[data-order-item-id="${focusItemId}"]`);
        if (focusTarget) {
          global.requestAnimationFrame(() => {
            focusTarget.focus();
          });
        }
      }
    }

    function handlePointerMove(event) {
      if (!dragState || api.session.status !== "running") return;
      event.preventDefault();
      dragState.ghost.style.left = `${event.clientX - dragState.offsetX}px`;
      dragState.ghost.style.top = `${event.clientY - dragState.offsetY}px`;
      dragState.ghost.style.pointerEvents = "none";
      const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest?.("[data-order-item-id]");
      dragState.ghost.style.pointerEvents = "";
      if (!hovered) {
        dragState.hoverId = "";
        applyDropIndicator("", false);
        return;
      }
      const hoverId = String(hovered.dataset.orderItemId || "");
      if (!hoverId || hoverId === dragState.itemId) {
        dragState.hoverId = "";
        applyDropIndicator("", false);
        return;
      }
      const rect = hovered.getBoundingClientRect();
      dragState.hoverId = hoverId;
      dragState.insertAfter = event.clientY > rect.top + (rect.height / 2);
      applyDropIndicator(hoverId, dragState.insertAfter);
    }

    function handlePointerUp() {
      if (!dragState) return;
      const { itemId, hoverId, insertAfter } = dragState;
      clearDragArtifacts();
      if (!hoverId || hoverId === itemId) {
        renderList(itemId);
        return;
      }
      const fromIndex = currentItems.findIndex((entry) => entry.id === itemId);
      const hoverIndex = currentItems.findIndex((entry) => entry.id === hoverId);
      if (fromIndex < 0 || hoverIndex < 0) {
        renderList(itemId);
        return;
      }
      const targetIndex = insertAfter
        ? (fromIndex < hoverIndex ? hoverIndex : hoverIndex + 1)
        : (fromIndex < hoverIndex ? hoverIndex - 1 : hoverIndex);
      currentItems = moveItem(currentItems, fromIndex, Math.max(0, Math.min(currentItems.length - 1, targetIndex)));
      focusedItemId = itemId;
      renderList(itemId);
      const movedItem = currentItems.find((entry) => entry.id === itemId);
      api.setStatusText(`Neu sortiert: ${movedItem?.label || itemId}`, "");
      api.setDetailText("Mit Enter oder Space pruefst du die Reihenfolge.");
    }

    function evaluateOrder(source = "pointer") {
      if (api.session.status !== "running") return;
      const currentIds = currentItems.map((item) => item.id);
      const expectedIds = originalItems.map((item) => item.id);
      const isExactMatch = currentIds.length === expectedIds.length && currentIds.every((id, index) => id === expectedIds[index]);
      if (isExactMatch) {
        const bonus = Math.max(150, Math.round(Number(api.session.remainingMs || 0) / 60));
        api.addScore(bonus);
        api.setStatusText("Reihenfolge korrekt sortiert.", "ok");
        api.setDetailText(`Pruefung via ${source}. Exact match erreicht.`);
        api.playSound("success");
        api.finish({
          outcome: "success",
          title: "Reihenfolge Sprint geschafft",
          summary: "Die Liste steht exakt in der erwarteten Reihenfolge.",
          statusText: "Reihenfolge korrekt sortiert.",
          statusTone: "ok",
          lines: [
            `Eingabemodus: ${source}`,
            `Elemente: ${originalItems.length}`,
            `Punkte nach Pruefung: ${Math.max(0, Number(api.session.score || 0))}`
          ]
        });
        return;
      }

      api.addScore(-50);
      api.setStatusText("Die Reihenfolge ist noch nicht exakt korrekt.", "warn");
      api.setDetailText(`Erwarteter Start: ${originalItems[0]?.label || "-"} | aktueller Start: ${currentItems[0]?.label || "-"}`);
      api.playSound("error");
      api.finish({
        outcome: "wrong",
        title: "Reihenfolge Sprint verfehlt",
        summary: "Nur eine komplett korrekte Reihenfolge gilt in diesem V1-Modus als Erfolg.",
        statusText: "Die Reihenfolge ist noch nicht exakt korrekt.",
        statusTone: "bad",
        lines: [
          `Eingabemodus: ${source}`,
          `Erwarteter Start: ${originalItems[0]?.label || "-"}`,
          `Aktueller Start: ${currentItems[0]?.label || "-"}`
        ]
      });
    }

    submitButton.addEventListener("click", () => {
      evaluateOrder("pointer");
    });

    if (!originalItems.length) {
      api.setStatusText("Keine Demo-Daten fuer Reihenfolge Sprint gefunden.", "warn");
    } else {
      api.setStatusText("Vor dem Start erklaert das Overlay die Runde. Danach sortierst du die Liste exakt.", "");
      api.setDetailText("ArrowUp/ArrowDown verschieben das fokussierte Element.");
    }
    renderList();

    return {
      start() {
        currentItems = shuffleUntilDifferent(originalItems);
        clearDragArtifacts();
        renderList(focusedItemId);
        api.setStatusText("Bringe die Schritte in die exakt richtige Reihenfolge.", "");
        api.setDetailText("Drag & Drop, ArrowUp/ArrowDown und Enter/Space sind aktiv.");
      },
      stop() {
        clearDragArtifacts();
      },
      destroy() {
        clearDragArtifacts();
      }
    };
  }

  if (!global.ChallengeRuntime || typeof global.ChallengeRuntime.registerType !== "function") {
    throw new Error("ChallengeRuntime ist noch nicht verfuegbar.");
  }

  global.ChallengeRuntime.registerType(TYPE_ID, { mount });
})(window);
