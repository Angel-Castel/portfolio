// Header navigation: active-link tracking (all widths) and the mobile menu panel (<= 990px)
(function () {
  const header = document.querySelector("header");
  const nav = document.getElementById("menu-nav");
  const toggle = header && header.querySelector(".menu-toggle");
  if (!nav || !toggle) return;

  const links = Array.from(nav.querySelectorAll(".state"));
  const mobile = window.matchMedia("(max-width: 990px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const background = document.querySelectorAll("main, footer");

  // Highlights the link for the current section; only touches links inside #menu-nav
  function update(n) {
    links.forEach((link, i) => {
      const active = i === n;
      link.classList.toggle("active-menu-item", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function isOpen() {
    return header.classList.contains("nav-open");
  }

  function focusables() {
    return Array.from(nav.querySelectorAll("a[href]")).concat(toggle);
  }

  function open() {
    header.classList.add("nav-open");
    document.documentElement.classList.add("nav-lock");
    background.forEach((el) => { el.inert = true; });
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    links[0].focus({ preventScroll: true });
  }

  function close(restoreFocus) {
    if (!isOpen()) return;
    header.classList.remove("nav-open");
    document.documentElement.classList.remove("nav-lock");
    background.forEach((el) => { el.inert = false; });
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener("click", () => {
    if (isOpen()) close(true);
    else open();
  });

  // Close first, then smooth-scroll, so the scroll lock is gone before the page moves
  nav.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || !isOpen()) return;
    const target = document.querySelector(link.hash);
    if (!target) return;
    e.preventDefault();
    close(true);
    target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
    history.pushState(null, "", link.getAttribute("href"));
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      close(true);
      return;
    }
    if (e.key !== "Tab") return;
    // Keep focus inside the panel and the close button
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (!items.includes(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  });

  mobile.addEventListener("change", (e) => {
    if (!e.matches) close(false);
  });

  // Active link follows the section crossing a line just below the middle of the viewport
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) update(links.findIndex((link) => link.hash === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -54% 0px" });
    links.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }
})();
