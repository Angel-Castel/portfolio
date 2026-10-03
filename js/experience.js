// Experience timeline: the gold line fills top-down as the user scrolls through the section
(function () {
  const section = document.getElementById("experience");
  const timeline = section && section.querySelector(".xp-timeline");
  if (!timeline) return;

  const lit = timeline.querySelector(".xp-line-lit");
  const head = timeline.querySelector(".xp-line-head");
  const nodes = Array.from(timeline.querySelectorAll(".xp-node"));

  // Height of the viewport (as a fraction) where the leading edge of the lit line sits
  const ANCHOR = 0.6;

  let timelineHeight = 0;
  let nodeOffsets = [];
  let inView = false;
  let ticking = false;

  // Layout reads only happen here, on load and on resize
  function measure() {
    const top = timeline.getBoundingClientRect().top;
    timelineHeight = timeline.offsetHeight;
    nodeOffsets = nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return rect.top + rect.height / 2 - top;
    });
  }

  function update() {
    ticking = false;

    const top = timeline.getBoundingClientRect().top;
    const anchor = window.innerHeight * ANCHOR;
    const litPx = Math.min(Math.max(anchor - top, 0), timelineHeight);
    const progress = timelineHeight ? litPx / timelineHeight : 0;

    // Transforms only, so scrolling never triggers a reflow
    lit.style.transform = `scaleY(${progress})`;
    head.style.transform = `translateY(${litPx}px)`;
    timeline.classList.toggle("is-drawing", progress > 0 && progress < 1);

    nodes.forEach((node, i) => {
      node.classList.toggle("is-active", litPx >= nodeOffsets[i]);
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // Only track scroll while the section is near the viewport; still update once on exit
  // so a fast scroll past the section leaves the line fully lit or fully dim
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    requestUpdate();
  }, { rootMargin: "100px 0px" }).observe(section);

  window.addEventListener("scroll", () => {
    if (inView) requestUpdate();
  }, { passive: true });

  window.addEventListener("resize", requestUpdate);

  new ResizeObserver(() => {
    measure();
    requestUpdate();
  }).observe(timeline);

  measure();
  update();
})();
