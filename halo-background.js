(() => {
  const TAU = Math.PI * 2;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
  const COLORS = [
    [247, 83, 171],
    [245, 90, 90],
    [250, 166, 56],
    [245, 222, 64],
    [112, 236, 115],
    [75, 214, 230],
    [86, 123, 255],
    [165, 111, 255]
  ];

  const canvas = document.createElement("canvas");
  canvas.className = "halo-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  document.body.classList.add("halo-canvas-active");

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let rafId = 0;
  let nodes = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function chooseColor(index) {
    return COLORS[index % COLORS.length];
  }

  function nodeCountForViewport() {
    const base = Math.round((w * h) / 95000);
    return Math.max(16, Math.min(30, base));
  }

  function buildNodes() {
    const count = nodeCountForViewport();
    const marginX = Math.max(72, w * 0.08);
    const marginY = Math.max(68, h * 0.1);
    nodes = [];

    for (let i = 0; i < count; i += 1) {
      const color = chooseColor(i);
      const radius = rand(22, 40);
      const haloSize = rand(42, 88);
      const drift = rand(5, 20);
      const driftY = rand(5, 18);
      const period = rand(260, 420);

      nodes.push({
        color,
        radius,
        haloSize,
        ax: rand(marginX, w - marginX),
        ay: rand(marginY, h - marginY),
        driftX: drift,
        driftY: driftY,
        speedX: TAU / period,
        speedY: TAU / (period * rand(0.82, 1.26)),
        phaseX: rand(0, TAU),
        phaseY: rand(0, TAU)
      });
    }
  }

  function computePosition(node, t) {
    const x = node.ax + Math.cos(t * node.speedX + node.phaseX) * node.driftX;
    const y = node.ay + Math.sin(t * node.speedY + node.phaseY) * node.driftY;
    return { x, y };
  }

  function drawLines(positions) {
    const maxDist = Math.min(Math.max(w, h) * 0.82, 920);
    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) continue;
        const alpha = Math.max(0.03, 0.16 - (dist / maxDist) * 0.15);
        ctx.strokeStyle = `rgba(194, 206, 255, ${alpha.toFixed(4)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  function drawHalo(node, pos) {
    const [r, g, b] = node.color;
    const outer = node.radius + node.haloSize;
    const grad = ctx.createRadialGradient(pos.x, pos.y, node.radius, pos.x, pos.y, outer);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
    grad.addColorStop(0.58, `rgba(${r}, ${g}, ${b}, 0.2)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, outer, 0, TAU);
    ctx.arc(pos.x, pos.y, node.radius, 0, TAU, true);
    ctx.fillStyle = grad;
    ctx.fill("evenodd");

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, node.radius, 0, TAU);
    ctx.fillStyle = "rgba(17, 14, 29, 0.98)";
    ctx.fill();
  }

  function draw(timeSec) {
    ctx.clearRect(0, 0, w, h);
    const positions = nodes.map((node) => computePosition(node, timeSec));
    drawLines(positions);
    for (let i = 0; i < nodes.length; i += 1) {
      drawHalo(nodes[i], positions[i]);
    }
  }

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes();
    draw(performance.now() / 1000);
  }

  function tick(ts) {
    draw(ts / 1000);
    if (!REDUCED_MOTION.matches) {
      rafId = requestAnimationFrame(tick);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  REDUCED_MOTION.addEventListener("change", () => {
    cancelAnimationFrame(rafId);
    draw(performance.now() / 1000);
    if (!REDUCED_MOTION.matches) {
      rafId = requestAnimationFrame(tick);
    }
  });

  resize();
  if (!REDUCED_MOTION.matches) {
    rafId = requestAnimationFrame(tick);
  }
})();
