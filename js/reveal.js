// Shared scroll reveal: any [data-reveal] element gets .is-revealed the first time it is seen, once per visit.
// Variants (CSS): "up" (default), "left", "right", "fade", and "heading" (an .xp-heading: eyebrow, then title).
// Stagger with style="--i: n". Content is only hidden while <html> has .js (set in <head>), so it shows without JS.
(function () {
  const items = document.querySelectorAll("[data-reveal]");
  window.revealReady = true;

  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("is-revealed"));
    return;
  }

  // 20% of the element, or 20% of the viewport for elements too tall to ever reach 20% of themselves
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const seen = entry.intersectionRatio >= 0.2 || entry.intersectionRect.height >= window.innerHeight * 0.2;
      if (!seen) return;
      observer.unobserve(entry.target);
      entry.target.classList.add("is-revealed");
    });
  }, { threshold: [0, 0.2, 0.4, 0.6] });

  items.forEach(item => observer.observe(item));
})();
