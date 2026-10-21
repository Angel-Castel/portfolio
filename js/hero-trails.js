// Hero background: translucent silk ribbons of teal and amber light behind the cut-out globe.
// Each beam is a few twisting ribbons (a translucent fill, bright edges that flare where the ribbon turns edge-on, a
// glowing core) drawn on a sharp offscreen layer, then composited three times: a wide blurred halo, a short blurred
// halo and the sharp layer itself. Segments are grouped by opacity so each beam takes a handful of draw calls.
// Beams live on the 1672x941 art board of the original image, mapped like object-fit: cover anchored right (the
// globe <img> uses the same math in CSS). On desktop a beam near the cursor speeds up, brightens and leans in.
// Calibration: ?debug-trails overlays the original image and each beam's centre line with its number.
(function () {
  const ART_W = 1672;
  const ART_H = 941;
  const TAU = Math.PI * 2;

  const TEAL = { edge: [34, 211, 238], fill: [20, 150, 175], hot: [224, 251, 255] };
  const AMBER = { edge: [245, 158, 11], fill: [190, 100, 20], hot: [255, 243, 196] };

  // Beams in art-board px, back to front. w: ribbon width; layers: ribbons per beam; alpha: overall opacity;
  // amp: drift of the control points; speed: base speed; twist: turns along the beam; core: bright centre line;
  // far: fainter fill and edges, half the cursor reaction; hot: anchored hot spots at a fraction of the run (s) with
  // a radius (r); mobile: kept on phones.
  const BEAMS = [
    // Far
    { id: 1, pts: [[-200, 150], [300, 105], [800, 170], [1250, 70], [1900, 15]], c: TEAL, w: 120, layers: 2, alpha: 0.38, amp: 30, speed: 0.5, twist: 1.6, core: false, far: true, mobile: true },
    { id: 2, pts: [[-200, 770], [350, 815], [900, 880], [1400, 1010], [1900, 1100]], c: AMBER, w: 100, layers: 2, alpha: 0.32, amp: 30, speed: 0.5, twist: 1.4, core: false, far: true, mobile: false },
    { id: 3, pts: [[-200, 560], [380, 610], [880, 700], [1250, 860], [1900, 980]], c: TEAL, w: 90, layers: 2, alpha: 0.34, amp: 30, speed: 0.5, twist: 1.8, core: false, far: true, mobile: false },
    // Main
    { id: 4, pts: [[-200, 260], [220, 320], [540, 420], [790, 340], [1000, 230], [1160, 125], [1500, 40], [1900, 0]], c: TEAL, w: 90, layers: 3, alpha: 1.0, amp: 22, speed: 1.0, twist: 2.4, core: true, hot: [{ s: 0.30, r: 26 }], mobile: true },
    { id: 5, pts: [[-200, 300], [240, 372], [540, 425], [800, 520], [1015, 690], [1250, 800], [1520, 815], [1900, 780]], c: AMBER, w: 72, layers: 3, alpha: 1.0, amp: 22, speed: 1.0, twist: 2.2, core: true, hot: [{ s: 0.29, r: 24 }, { s: 0.56, r: 30 }], mobile: true },
    // Near
    { id: 6, pts: [[-200, 400], [300, 440], [560, 445], [860, 565], [1005, 725], [1300, 872], [1900, 880]], c: TEAL, w: 42, layers: 3, alpha: 0.85, amp: 18, speed: 1.2, twist: 2.8, core: true, mobile: false },
    { id: 7, pts: [[980, -200], [1380, 30], [1640, 230], [1820, 520], [1900, 700]], c: AMBER, w: 70, layers: 3, alpha: 0.9, amp: 20, speed: 1.2, twist: 1.6, core: false, mobile: true }
  ];

  // Composite: two blurred copies of the sharp layer under it (blur in art px)
  const HALOS = [{ blur: 8, alpha: 0.55 }, { blur: 2.5, alpha: 0.6 }];

  // Performance: below 50fps on a laptop with the prototype's settings (220 points, full-resolution halos), so the
  // ribbons draw with at most 1.25 device pixels per CSS px, the halos blur at half that resolution, and each beam
  // uses 140 points
  const SAMPLES = 140;           // points per beam
  const SHARP_DPR_MAX = 1.25;    // device pixel ratio cap for the sharp layer and the visible canvas
  const HALO_RES = 0.5;          // resolution of the halo passes, relative to the sharp layer
  const MOBILE_LAYERS = 2;       // ribbons per beam on phones
  const PHONE_FPS = 30;
  const TEXT_FLOOR = 0.3;        // ribbon brightness right behind the hero text
  const TEXT_PAD = 16;           // CSS px around the text block that count as "behind" it
  const TEXT_FADE = 90;          // CSS px over which that dimming eases off

  const INFLUENCE_RADIUS = 140;  // screen px from the beam's body
  const SPEED_BOOST = 1;         // up to 2x speed
  const GLOW_BOOST = 0.2;        // up to +20% brightness
  const BEND_MAX = 20;           // screen px towards the cursor
  const BEND_RADIUS = 360;       // screen px, falloff of the bend around the cursor
  const EASE = 0.04;             // per 60fps frame, for speed and influence

  const hero = document.getElementById("home");
  const wrapper = hero && hero.querySelector(".hero-bg-wrapper");
  const canvas = wrapper && wrapper.querySelector(".hero-trails");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) {
    document.documentElement.classList.add("no-trails");
    return;
  }

  const sharp = document.createElement("canvas");
  const sctx = sharp.getContext("2d");
  const halo = document.createElement("canvas");
  const hctx = halo.getContext("2d");
  // Browsers without canvas filters (older Safari) get the halo blur by downscaling instead
  const canFilter = typeof hctx.filter === "string";
  const tiny = canFilter ? null : document.createElement("canvas");
  const tctx = tiny && tiny.getContext("2d");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const small = window.matchMedia("(max-width: 767px)");
  const debug = new URLSearchParams(location.search).has("debug-trails");

  // Smooth noise: sines at irrational frequency ratios, roughly -1..1
  const noise = x => Math.sin(x) * 0.5 + Math.sin(x * 1.731 + 1.3) * 0.3 + Math.sin(x * 2.913 + 4.1) * 0.2;
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

  // Art board -> screen (object-fit: cover anchored right)
  let width = 0;
  let height = 0;
  let res = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let textBox = null;            // hero text block in screen px, padded, for the extra dimming behind it

  let beams = [];
  let compact = null;

  // Per-beam state and preallocated buffers; rebuilt only when the screen crosses 768px
  function build() {
    compact = small.matches;
    beams = BEAMS.filter(cfg => !compact || cfg.mobile).map(cfg => ({
      ...cfg,
      layers: compact ? Math.min(cfg.layers, MOBILE_LAYERS) : cfg.layers,
      seed: (cfg.id - 1) * 17.3,
      time: 0,
      speedNow: 1,
      influence: 0,
      cp: cfg.pts.map(() => [0, 0]),
      path: Array.from({ length: SAMPLES }, () => [0, 0, 0, 0]),
      e1x: new Float32Array(SAMPLES),
      e1y: new Float32Array(SAMPLES),
      e2x: new Float32Array(SAMPLES),
      e2y: new Float32Array(SAMPLES),
      tw: new Float32Array(SAMPLES),
      al: new Float32Array(SAMPLES)
    }));
  }

  function measure() {
    width = wrapper.clientWidth;
    height = wrapper.clientHeight;
    res = Math.min(window.devicePixelRatio || 1, SHARP_DPR_MAX);
    canvas.width = sharp.width = Math.max(1, Math.round(width * res));
    canvas.height = sharp.height = Math.max(1, Math.round(height * res));
    halo.width = Math.max(1, Math.round(canvas.width * HALO_RES));
    halo.height = Math.max(1, Math.round(canvas.height * HALO_RES));
    scale = Math.max(width / ART_W, height / ART_H);
    offsetX = width - ART_W * scale;
    offsetY = (height - ART_H * scale) / 2;
    measureText();
    if (compact !== small.matches) build();
  }

  // Hero text block, padded; measured again once its entrance animation has settled
  function measureText() {
    const heroRect = hero.getBoundingClientRect();
    const rects = Array.from(hero.querySelectorAll(".hero-content > *"), el => el.getBoundingClientRect());
    textBox = rects.length ? {
      left: Math.min(...rects.map(r => r.left)) - heroRect.left - TEXT_PAD,
      right: Math.max(...rects.map(r => r.right)) - heroRect.left + TEXT_PAD,
      top: Math.min(...rects.map(r => r.top)) - heroRect.top - TEXT_PAD,
      bottom: Math.max(...rects.map(r => r.bottom)) - heroRect.top + TEXT_PAD
    } : null;
  }

  // Dims the beams on the left 45% of the screen, and further right behind the hero text block (with a soft edge),
  // so the copy keeps a 4.5:1 contrast while the ribbons above and below it stay bright
  function textMask(x, y) {
    const sx = x * scale + offsetX;
    let m = 0.4 + 0.6 * smooth(0.28, 0.45, sx / width);
    if (textBox) {
      const sy = y * scale + offsetY;
      const inside = (1 - smooth(textBox.right, textBox.right + TEXT_FADE, sx)) *
        smooth(textBox.left - TEXT_FADE, textBox.left, sx) *
        smooth(textBox.top - TEXT_FADE, textBox.top, sy) *
        (1 - smooth(textBox.bottom, textBox.bottom + TEXT_FADE, sy));
      m *= 1 - (1 - TEXT_FLOOR) * inside;
    }
    return m;
  }

  // Pointer in art px; null when outside the hero or on touch screens
  let pointer = null;

  // Control points: base + slow drift + a lean towards the cursor
  function shapeControls(b) {
    const t = b.time;
    const reach = BEND_RADIUS / scale;
    const pull = (BEND_MAX / scale) * b.influence;
    b.pts.forEach((p, i) => {
      let x = p[0] + b.amp * noise(t * 0.22 + i * 1.7 + b.seed);
      let y = p[1] + b.amp * 1.4 * noise(t * 0.18 + i * 2.3 + b.seed + 10);
      if (pointer && pull > 0.01) {
        const dx = pointer[0] - x;
        const dy = pointer[1] - y;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.min(pull * (1 - smooth(0, reach, d)), d);
        x += (dx / d) * f;
        y += (dy / d) * f;
      }
      b.cp[i][0] = x;
      b.cp[i][1] = y;
    });
  }

  // Catmull-Rom through the control points -> SAMPLES points with normals: [x, y, nx, ny]
  function samplePath(cp, out) {
    const last = cp.length - 1;
    const P = i => cp[Math.min(Math.max(i - 1, 0), last)];
    const n = out.length;
    for (let k = 0; k < n; k++) {
      const u = (k / (n - 1)) * last;
      const i = Math.min(last - 1, Math.floor(u));
      const t = u - i;
      const p0 = P(i), p1 = P(i + 1), p2 = P(i + 2), p3 = P(i + 3);
      const t2 = t * t, t3 = t2 * t;
      for (let j = 0; j < 2; j++) {
        out[k][j] = 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
          (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      }
    }
    for (let k = 0; k < n; k++) {
      const a = out[Math.max(0, k - 1)];
      const b = out[Math.min(n - 1, k + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      out[k][2] = -dy / L;
      out[k][3] = dx / L;
    }
  }

  // Groups segments into opacity steps of 0.025, so a beam takes a few draw calls instead of hundreds
  function buckets() {
    const map = new Map();
    const fn = a => {
      const k = Math.round(Math.min(1, a) * 40);
      let p = map.get(k);
      if (!p) {
        p = new Path2D();
        map.set(k, p);
      }
      return p;
    };
    fn.flush = (setStyle, draw) => {
      for (const [k, p] of map) {
        setStyle(Math.max(0.004, k / 40));
        draw(p);
      }
    };
    return fn;
  }

  function drawBeam(b) {
    const t = b.time;
    const n = SAMPLES;
    const boost = 1 + GLOW_BOOST * b.influence;
    shapeControls(b);
    samplePath(b.cp, b.path);
    const path = b.path;
    const { e1x, e1y, e2x, e2y, tw, al } = b;
    const L = b.layers;

    for (let k = 0; k < L; k++) {
      const kk = k - (L - 1) / 2;
      for (let i = 0; i < n; i++) {
        const s = i / (n - 1), p = path[i];
        const fade = smooth(0, 0.18, s) * (1 - smooth(0.82, 1, s));
        const off = kk * b.w * 0.35 * (0.7 + 0.3 * noise(t * 0.3 + k * 2.1 + s * 4 + b.seed));
        const twist = Math.cos(b.twist * s * TAU + t * 0.35 + k * 1.15 + b.seed);
        const w = b.w * (0.75 + 0.25 * noise(s * 5 + k + t * 0.2)) * twist;
        e1x[i] = p[0] + p[2] * (off + w / 2);
        e1y[i] = p[1] + p[3] * (off + w / 2);
        e2x[i] = p[0] + p[2] * (off - w / 2);
        e2y[i] = p[1] + p[3] * (off - w / 2);
        tw[i] = Math.abs(twist);
        al[i] = fade * textMask(p[0], p[1]) * b.alpha * boost;
      }

      // Translucent "cloth", denser where the ribbon narrows
      const fill = buckets();
      for (let i = 0; i < n - 1; i++) {
        const a = al[i] * (b.far ? 0.06 : 0.14) * (0.45 + 0.9 * (1 - tw[i]));
        if (a < 0.004) continue;
        const q = fill(a);
        q.moveTo(e1x[i], e1y[i]);
        q.lineTo(e1x[i + 1], e1y[i + 1]);
        q.lineTo(e2x[i + 1], e2y[i + 1]);
        q.lineTo(e2x[i], e2y[i]);
        q.closePath();
      }
      fill.flush(a => { sctx.fillStyle = rgba(b.c.fill, a); }, p => sctx.fill(p));

      // Bright edges, hotter where the ribbon turns edge-on
      sctx.lineWidth = b.far ? 1.0 : 1.3;
      for (const col of [b.c.edge, b.c.hot]) {
        const edges = buckets();
        for (const [ex, ey] of [[e1x, e1y], [e2x, e2y]]) {
          for (let i = 0; i < n - 1; i++) {
            const pinch = 1 - tw[i];
            if ((col === b.c.hot) !== (pinch > 0.8)) continue;
            const a = al[i] * ((b.far ? 0.12 : 0.17) + 0.55 * pinch * pinch);
            if (a < 0.01) continue;
            const q = edges(Math.min(1, a));
            q.moveTo(ex[i], ey[i]);
            q.lineTo(ex[i + 1], ey[i + 1]);
          }
        }
        edges.flush(a => { sctx.strokeStyle = rgba(col, a); }, p => sctx.stroke(p));
      }
    }

    // Glowing core
    if (b.core) {
      sctx.lineWidth = 1.6;
      const core = buckets();
      for (let i = 0; i < n - 1; i++) {
        const s = i / (n - 1), p = path[i], p2 = path[i + 1];
        const a = smooth(0, 0.18, s) * (1 - smooth(0.82, 1, s)) * textMask(p[0], p[1]) * b.alpha * boost * 0.4;
        if (a < 0.01) continue;
        const q = core(a);
        q.moveTo(p[0], p[1]);
        q.lineTo(p2[0], p2[1]);
      }
      core.flush(a => { sctx.strokeStyle = rgba(b.c.hot, a); }, p => sctx.stroke(p));
    }

    // Anchored hot spots (the crossing, the globe's edge), stretched along the beam
    if (b.hot) {
      for (const hs of b.hot) {
        const p = path[Math.round(hs.s * (n - 1))];
        const ang = Math.atan2(p[3], p[2]) - Math.PI / 2;
        const mask = textMask(p[0], p[1]);
        const pulse = (0.75 + 0.25 * Math.sin(t * 0.9 + hs.s * 10)) * mask * mask;
        sctx.save();
        sctx.translate(p[0], p[1]);
        sctx.rotate(ang);
        sctx.scale(2.6, 1);
        const g = sctx.createRadialGradient(0, 0, 0, 0, 0, hs.r);
        g.addColorStop(0, rgba(b.c.hot, 0.7 * pulse * boost));
        g.addColorStop(0.35, rgba(b.c.edge, 0.25 * pulse));
        g.addColorStop(1, rgba(b.c.edge, 0));
        sctx.fillStyle = g;
        sctx.beginPath();
        sctx.arc(0, 0, hs.r, 0, TAU);
        sctx.fill();
        sctx.restore();
      }
    }
  }

  // Blurred copy of the sharp layer into the halo canvas; blur in sharp-layer device px
  function blurInto(radius) {
    hctx.setTransform(1, 0, 0, 1, 0, 0);
    hctx.clearRect(0, 0, halo.width, halo.height);
    if (canFilter) {
      hctx.filter = `blur(${(radius * HALO_RES).toFixed(2)}px)`;
      hctx.drawImage(sharp, 0, 0, halo.width, halo.height);
      hctx.filter = "none";
    } else {
      const f = Math.max(2, radius);
      tiny.width = Math.max(1, Math.round(sharp.width / f));
      tiny.height = Math.max(1, Math.round(sharp.height / f));
      tctx.drawImage(sharp, 0, 0, tiny.width, tiny.height);
      hctx.drawImage(tiny, 0, 0, halo.width, halo.height);
    }
  }

  function render() {
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = "source-over";
    sctx.clearRect(0, 0, sharp.width, sharp.height);
    sctx.setTransform(scale * res, 0, 0, scale * res, offsetX * res, offsetY * res);
    sctx.globalCompositeOperation = "lighter";
    beams.forEach(drawBeam);

    // Composite: wide halo + short halo + the sharp ribbons
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (const h of HALOS) {
      blurInto(h.blur * scale * res);
      ctx.globalAlpha = h.alpha;
      ctx.drawImage(halo, 0, 0, canvas.width, canvas.height);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(sharp, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    if (debug) drawDebug();
  }

  // Influence from the cursor's distance to the beam's body (not just its centre line), in screen px
  function update(b, dt) {
    let target = 0;
    if (pointer) {
      let d = Infinity;
      for (let i = 0; i < SAMPLES; i += 4) d = Math.min(d, Math.hypot(b.path[i][0] - pointer[0], b.path[i][1] - pointer[1]));
      d = Math.max(0, (d - b.w / 2) * scale);
      target = (1 - smooth(0, INFLUENCE_RADIUS, d)) * (b.far ? 0.5 : 1);
    }
    // Ease towards the targets, never jump (frame-rate independent version of "+= diff x 0.04 per frame")
    const k = 1 - Math.pow(1 - EASE, dt * 60);
    b.influence += (target - b.influence) * k;
    b.speedNow += (1 + SPEED_BOOST * target - b.speedNow) * k;
    b.time += dt * b.speed * b.speedNow;
  }

  // Animation loop: runs only while the hero is on screen, the tab is visible and motion is allowed;
  // phones draw at 30fps
  let last = 0;
  let pending = 0;
  let rafId = 0;
  let onScreen = true;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    let dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (compact) {
      pending += dt;
      if (pending < 1 / PHONE_FPS - 0.004) return;
      dt = Math.min(pending, 0.1);
      pending = 0;
    }
    for (const b of beams) update(b, dt);
    render();
  }

  function setRunning() {
    const run = onScreen && !document.hidden && !reducedMotion.matches;
    if (run && !rafId) {
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    } else if (!run && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      if (!rafId) render();
    }, 150);
  });

  hero.addEventListener("pointermove", e => {
    if (!finePointer.matches && !debug) return;
    const rect = hero.getBoundingClientRect();
    pointer = [(e.clientX - rect.left - offsetX) / scale, (e.clientY - rect.top - offsetY) / scale];
    if (debug && !rafId) render();
  });
  hero.addEventListener("pointerleave", () => {
    pointer = null;
  });

  new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    setRunning();
  }).observe(hero);
  document.addEventListener("visibilitychange", setRunning);
  reducedMotion.addEventListener("change", () => {
    setRunning();
    if (!rafId) render();
  });

  // Calibration overlay (?debug-trails): the original image at 40% and each beam's centre line and number
  let debugCanvas = null;
  let debugCtx = null;

  if (debug) {
    const img = document.createElement("img");
    img.src = "img/background/world.png";
    img.alt = "";
    img.className = "hero-trails-debug-img";
    debugCanvas = document.createElement("canvas");
    debugCanvas.className = "hero-trails-debug";
    debugCtx = debugCanvas.getContext("2d");
    wrapper.append(img, debugCanvas);
    window.heroTrails = { beams: () => beams }; // for inspecting speeds and influence from the console
  }

  function drawDebug() {
    const c = debugCtx;
    debugCanvas.width = canvas.width;
    debugCanvas.height = canvas.height;
    c.setTransform(scale * res, 0, 0, scale * res, offsetX * res, offsetY * res);
    c.lineWidth = 1.5 / scale;
    c.font = `bold ${16 / scale}px sans-serif`;
    const left = -offsetX / scale + 20 / scale;
    const top = -offsetY / scale + 20 / scale;
    const bottom = (height - offsetY) / scale - 20 / scale;
    for (const b of beams) {
      c.strokeStyle = "rgba(255, 255, 255, 0.85)";
      c.beginPath();
      b.path.forEach(p => c.lineTo(p[0], p[1]));
      c.stroke();
      b.cp.forEach(p => {
        c.beginPath();
        c.arc(p[0], p[1], 4 / scale, 0, TAU);
        c.stroke();
      });
      // Number on the first on-screen point a third of the way in
      let i = Math.round(SAMPLES * 0.3);
      while (i < SAMPLES - 1 && (b.path[i][0] < left || b.path[i][1] < top || b.path[i][0] > ART_W || b.path[i][1] > bottom)) i++;
      c.fillStyle = "#ffffff";
      c.fillText(`${b.id}  x${b.speedNow.toFixed(2)}`, b.path[i][0] + 8 / scale, b.path[i][1] - 8 / scale);
    }
    if (pointer) {
      c.fillStyle = "#facc15";
      c.fillText(`${Math.round(pointer[0])}, ${Math.round(pointer[1])}`, pointer[0] + 12 / scale, pointer[1] + 24 / scale);
    }
  }

  measure(); // also builds the beams
  render();
  setTimeout(() => {
    measureText();
    if (!rafId) render();
  }, 1700); // after the hero text entrance (css/style.css)

  // Ready: hide the flat fallback image and fade the trails in
  window.heroTrailsReady = true;
  hero.classList.add("has-trails");
  setRunning();
})();
