// Portfolio: case-study rows rendered from this data array. To add or reorder projects, edit PROJECTS only.
//   company, year   - shown as the eyebrow label ("COMPANY · YEAR")
//   description     - two sentences: the problem it solved and who used it
//   role            - one line
//   tech            - names from TECH below (unknown names get a neutral keycap with their first letter)
//   features        - 3–4 short bullet points
//   screenshots     - base: image path without the size suffix; the -800 / -<w> / -thumb webp files must exist
//   crossLink       - optional { href, text } shown at the bottom of the text panel
// Items marked "TODO: verify" were drafted from the Experience section; check them before publishing.
const PROJECTS = [
  {
    title: "Network planning system",
    company: "Tata Consultancy Services · UPS",
    year: "2024", // TODO: verify (UPS recognition is dated Q2 2024; TCS role since Feb 2023)
    // TODO: verify description, role, tech and the fourth feature
    description: "An internal network planning tool that lets UPS planners build and adjust how small packages are routed through the network. Planners use it to manage planning trees, review errors from planning runs and keep planning configuration up to date.",
    role: "Full stack software engineer building the Angular UI and the Java / Spring Boot services behind it.",
    tech: ["Angular", "React", "Java", "Spring Boot", "GraphQL"],
    features: [
      "Small package planning tree",
      "Planning error logs",
      "Planning configuration",
      "REST and GraphQL APIs behind the planning screens"
    ],
    screenshots: [
      { base: "img/ups/1-ups", large: 1366, width: 1600, height: 859, caption: "Small package planning tree" },
      { base: "img/ups/2-ups", large: 1366, width: 1600, height: 859, caption: "Planning error logs" },
      { base: "img/ups/3-ups", large: 1366, width: 1600, height: 860, caption: "Planning configuration" }
    ],
    crossLink: { href: "#ups-recognition", text: "Recognized by UPS: see Experience ↗" }
  },
  {
    title: "Product exchange system",
    company: "Netlogistik",
    year: "2022", // TODO: verify
    // TODO: verify description, role and tech
    description: "A rewards platform where employees spend the points they earn on products, activities and campaigns. Employees, program responsibles and administrators each work from their own dashboard to track points and manage the catalogues.",
    role: "Full stack developer for the catalogue, exchange flow and user, notification and payment services.",
    tech: ["Angular", "Node.js", "SQL", "Stripe"],
    features: [
      "Role-based dashboards for employees, responsibles and admins",
      "Product catalogue with an exchange flow",
      "Activities and campaigns catalogues"
    ],
    screenshots: [
      { base: "img/net-store/home-user", large: 1366, width: 1366, height: 724, caption: "Employee dashboard" },
      { base: "img/net-store/home-responsible", large: 1366, width: 1366, height: 726, caption: "Responsible dashboard" },
      { base: "img/net-store/home-manager", large: 1366, width: 1366, height: 722, caption: "Admin dashboard" },
      { base: "img/net-store/catalogue-products", large: 1360, width: 1360, height: 638, caption: "Products catalogue" },
      { base: "img/net-store/product-camera-description", large: 1366, width: 1366, height: 724, caption: "Camera description" },
      { base: "img/net-store/product-camera-exchange", large: 1358, width: 1358, height: 723, caption: "Camera exchange" },
      { base: "img/net-store/product-laptop-description", large: 1366, width: 1366, height: 716, caption: "Laptop description" },
      { base: "img/net-store/product-laptop-exchange", large: 1359, width: 1359, height: 722, caption: "Laptop exchange" },
      { base: "img/net-store/catalogue-activities", large: 1366, width: 1366, height: 723, caption: "Activities catalogue" },
      { base: "img/net-store/catalogue-campaigns", large: 1366, width: 1366, height: 726, caption: "Campaigns catalogue" }
    ]
  },
  {
    title: "Parking and desk places reservation system",
    company: "Netlogistik",
    year: "2022", // TODO: verify
    // TODO: verify description, role and tech
    description: "An office booking system that replaced informal desk and parking arrangements with self-service reservations. Employees book a desk or a parking spot for a given date and time, and managers review attendance in a timesheet.",
    role: "Full stack developer for the reservation screens and the services behind them.",
    tech: ["Angular", "Java", "SQL"],
    features: [
      "Desk reservation on an interactive floor plan",
      "Parking reservation with date and time selection",
      "Manager timesheet"
    ],
    screenshots: [
      { base: "img/net-reservation/reservation-desk", large: 928, width: 928, height: 519, caption: "Desk reservation" },
      { base: "img/net-reservation/reservation-parking", large: 933, width: 933, height: 517, caption: "Parking reservation" },
      { base: "img/net-reservation/parking-date", large: 1279, width: 1279, height: 720, caption: "Parking reservation date" },
      { base: "img/net-reservation/manager-timesheet", large: 930, width: 930, height: 516, caption: "Manager timesheet" }
    ]
  },
  {
    title: "Semi-automation of human capital processes system",
    company: "Netlogistik",
    year: "2021", // TODO: verify
    // TODO: verify description, role and tech
    description: "A tool that semi-automates new-employee onboarding, from access requests to payroll, so no registration step gets lost. HR staff use it to follow each registration, confirm payroll and keep employee files in one place.",
    role: "Full stack developer for the registration tracking, payroll confirmation and employee file features.",
    tech: ["React", "Node.js", "SQL"],
    features: [
      "New-employee registration table",
      "Payroll confirmation",
      "Employee files",
      "Registration form"
    ],
    screenshots: [
      { base: "img/net-time/1-table-registration-process", large: 1366, width: 1366, height: 727, caption: "New employees" },
      { base: "img/net-time/2-confirm-payroll-modal", large: 1366, width: 1366, height: 730, caption: "Confirmation popup" },
      { base: "img/net-time/3-table-user", large: 1366, width: 1366, height: 727, caption: "Employee files" },
      { base: "img/net-time/4-user-profile", large: 1366, width: 1366, height: 721, caption: "Registration form" }
    ]
  }
];

// Keycap look for tech chips (same colors and glyphs as the Skills section)
const TECH = {
  "Angular": { icon: "fa-brands fa-angular", key: "#dd0031", glyph: "#ffffff" },
  "React": { icon: "fa-brands fa-react", key: "#61dafb", glyph: "#20232a" },
  "Java": { icon: "fa-brands fa-java", key: "#b07219", glyph: "#ffffff" },
  "Spring Boot": { icon: "fa-solid fa-power-off", key: "#3c7d22", glyph: "#ffffff" },
  "GraphQL": { icon: "fa-solid fa-diagram-project", key: "#e10098", glyph: "#ffffff" },
  "Node.js": { icon: "fa-brands fa-node-js", key: "#339933", glyph: "#ffffff" },
  "SQL": { icon: "fa-solid fa-database", key: "#00758f", glyph: "#ffffff" },
  "Stripe": { icon: "fa-brands fa-stripe-s", key: "#635bff", glyph: "#ffffff" },
  "TypeScript": { legend: "TS", key: "#3178c6", glyph: "#ffffff" }
};

(function () {
  const section = document.getElementById("portfolio");
  const list = section && section.querySelector(".pf-list");
  if (!list) return;

  // Small DOM helper: el("p", { className: "x" }, child, "text", ...)
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "className" || key === "textContent") node[key] = value;
      else if (key === "style") Object.entries(value).forEach(([prop, v]) => node.style.setProperty(prop, v));
      else node.setAttribute(key, value === true ? "" : value);
    });
    children.forEach(child => child && node.append(child));
    return node;
  }

  const src800 = shot => `${shot.base}-800.webp`;
  const srcLarge = shot => `${shot.base}-${shot.large}.webp`;
  const srcThumb = shot => `${shot.base}-thumb.webp`;
  const altText = (project, shot) => `${project.title}: ${shot.caption}`;

  function techChip(name) {
    const tech = TECH[name] || { legend: name.charAt(0), key: "#2a3344", glyph: "#ffffff" };
    const glyph = tech.icon
      ? el("i", { className: tech.icon, "aria-hidden": "true" })
      : el("span", { className: "sk-legend", "aria-hidden": "true", textContent: tech.legend });
    return el("li", { className: "pf-chip", style: { "--key": tech.key, "--glyph": tech.glyph } },
      el("span", { className: "sk-cap sk-cap--mini" }, glyph),
      name);
  }

  function textPanel(project) {
    return el("div", { className: "pf-panel xp-card" },
      el("p", { className: "xp-subhead pf-eyebrow", textContent: `${project.company} · ${project.year}` }),
      el("h3", { className: "pf-title", textContent: project.title }),
      el("p", { className: "pf-desc", textContent: project.description }),
      el("p", { className: "xp-subhead pf-label", textContent: "My role" }),
      el("p", { className: "pf-role", textContent: project.role }),
      el("ul", { className: "pf-tech", "aria-label": "Tech stack" }, ...project.tech.map(techChip)),
      el("p", { className: "xp-subhead pf-label", textContent: "Key features" }),
      el("ul", { className: "xp-list pf-features" }, ...project.features.map(f => el("li", { textContent: f }))),
      project.crossLink && el("a", { className: "pf-crosslink", href: project.crossLink.href, textContent: project.crossLink.text }));
  }

  // One carousel: browser-frame viewport with cross-fading slides, caption + counter, thumbnails (tablet/desktop)
  // and dots (phones). Every slide is a lightbox button; the group makes the lightbox step through this project.
  function carousel(project, p) {
    const shots = project.screenshots;
    const group = `portfolio-${p}`;
    const first = shots[0];

    const slides = shots.map((shot, i) => el("button", {
      type: "button",
      className: "pf-slide",
      "data-lightbox": true,
      "data-lightbox-group": group,
      "data-full": srcLarge(shot),
      "data-caption": shot.caption,
      "data-alt": altText(project, shot),
      "aria-label": `Open full size: ${shot.caption}`
    }, el("img", {
      src: src800(shot),
      srcset: `${src800(shot)} 800w, ${srcLarge(shot)} ${shot.large}w`,
      sizes: "(max-width: 1023px) 92vw, 52vw",
      width: shot.width, height: shot.height,
      alt: altText(project, shot),
      loading: i === 0 ? null : "lazy",
      decoding: "async"
    })));

    const prev = el("button", { type: "button", className: "pf-arrow pf-prev", "aria-label": "Previous screenshot", textContent: "❮" });
    const next = el("button", { type: "button", className: "pf-arrow pf-next", "aria-label": "Next screenshot", textContent: "❯" });

    const viewport = el("div", {
      className: "pf-viewport",
      tabindex: "0",
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": `${project.title} screenshots (use the arrow keys to browse)`,
      style: { "aspect-ratio": `${first.width} / ${first.height}` }
    }, ...slides, prev, next);

    const frame = el("div", { className: "pf-browser xp-card" },
      el("div", { className: "pf-browser-bar", "aria-hidden": "true" },
        el("span", { className: "pf-dot-btn" }), el("span", { className: "pf-dot-btn" }), el("span", { className: "pf-dot-btn" }),
        el("span", { className: "pf-url", textContent: project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") })),
      viewport);

    const captionText = el("span", { className: "pf-caption-text" });
    const counter = el("span", { className: "pf-counter" });
    const caption = el("p", { className: "pf-caption", "aria-live": "polite" }, captionText, counter);

    const thumbs = shots.map((shot, i) => el("button", {
      type: "button", className: "pf-thumb", "aria-label": `Show screenshot ${i + 1}: ${shot.caption}`
    }, el("img", { src: srcThumb(shot), width: 240, height: Math.round(240 * shot.height / shot.width), alt: "", loading: "lazy", decoding: "async" })));
    const dots = shots.map((shot, i) => el("button", {
      type: "button", className: "pf-dot", "aria-label": `Show screenshot ${i + 1}: ${shot.caption}`
    }));

    const media = el("div", { className: "pf-media" },
      el("div", { className: "pf-mobile-title", "aria-hidden": "true" }, el("span", { textContent: project.title })),
      frame,
      caption,
      el("div", { className: "pf-thumbs" }, ...thumbs),
      el("div", { className: "pf-dots" }, ...dots));

    // State
    let current = 0;
    function go(i) {
      current = (i + shots.length) % shots.length;
      slides.forEach((slide, n) => {
        const active = n === current;
        slide.classList.toggle("is-active", active);
        slide.tabIndex = active ? 0 : -1;
        slide.setAttribute("aria-hidden", String(!active));
      });
      [thumbs, dots].forEach(set => set.forEach((b, n) => {
        b.classList.toggle("is-active", n === current);
        if (n === current) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      }));
      // Keep the active thumbnail in view inside the strip (without scrolling the page)
      const thumb = thumbs[current], strip = thumb.parentElement;
      if (strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: "smooth" });
      }
      captionText.textContent = shots[current].caption;
      counter.textContent = `${current + 1} / ${shots.length}`;
      // Images are lazy; fetch the neighbours so arrows feel instant
      [current + 1, current - 1].forEach(n => {
        const img = slides[(n + shots.length) % shots.length].querySelector("img");
        img.loading = "eager";
      });
    }

    prev.addEventListener("click", () => go(current - 1));
    next.addEventListener("click", () => go(current + 1));
    thumbs.forEach((b, n) => b.addEventListener("click", () => go(n)));
    dots.forEach((b, n) => b.addEventListener("click", () => go(n)));

    // Arrow keys while the carousel (or one of its slides/arrows) has focus
    viewport.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { go(current - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { go(current + 1); e.preventDefault(); }
    });

    // The lightbox stepping through this project's screenshots moves the carousel along with it
    viewport.addEventListener("lightbox:show", e => {
      const n = slides.indexOf(e.target);
      if (n >= 0) go(n);
    });

    // Swipe on touch screens
    let startX = 0, startY = 0;
    viewport.addEventListener("touchstart", e => {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });
    viewport.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      go(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    go(0);
    return media;
  }

  PROJECTS.forEach((project, p) => {
    const flip = p % 2 === 1; // media right, text left on every other row
    list.append(el("article", { className: `pf-row${flip ? " pf-row--flip" : ""}` },
      carousel(project, p),
      textPanel(project)));
  });

  // Desktop entrance: each row fades and slides in from its media side, once per page load
  const rows = Array.from(list.querySelectorAll(".pf-row"));
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!desktop || reducedMotion || !("IntersectionObserver" in window)) return;

  section.classList.add("is-armed");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.classList.add("is-revealed");
    });
  }, { threshold: 0.2 });
  rows.forEach(row => observer.observe(row));
})();
