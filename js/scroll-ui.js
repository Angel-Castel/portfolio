// Scroll-driven UI: solid header and reading-progress bar, the hero's scroll cue, and the floating back-to-top button
(function () {
  const header = document.querySelector("header");
  const progress = header && header.querySelector(".header-progress");
  const hero = document.getElementById("home");
  const cue = document.querySelector(".hero-scroll-cue");
  const toTop = document.querySelector(".to-top");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let maxScroll = 0;
  let ticking = false;

  // Layout read only on resize / content size changes, never per scroll frame
  function measure() {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 80);
    if (progress) progress.style.transform = `scaleX(${maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0})`;
    // The cue is a one-time hint: gone for good once the visitor starts scrolling
    if (cue && y > 10) cue.classList.add("is-hidden");
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    requestUpdate();
  });
  new ResizeObserver(() => {
    measure();
    requestUpdate();
  }).observe(document.body);

  measure();
  update();

  if (!toTop || !hero) return;

  // Shown once the hero is fully out of view
  new IntersectionObserver(entries => {
    toTop.classList.toggle("is-visible", !entries[0].isIntersecting);
  }).observe(hero);

  toTop.addEventListener("click", () => {
    hero.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
    history.replaceState(null, "", "#home");
  });
})();
