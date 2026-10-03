// Timelines (Experience, Education): the gold line fills top-down as the user scrolls through the section
document.querySelectorAll(".xp-section .xp-timeline").forEach(timeline => {
  const section = timeline.closest(".xp-section");
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
});

// Recognition images: click opens an enlarged view in a native modal <dialog>
(function () {
  const dialog = document.querySelector(".xp-lightbox");
  const triggers = document.querySelectorAll("#experience .xp-figure-trigger");
  if (!dialog || !triggers.length || typeof dialog.showModal !== "function") return;

  const img = dialog.querySelector(".xp-lightbox-img");
  const caption = dialog.querySelector(".xp-lightbox-caption");
  let lastTrigger = null;

  triggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const thumb = trigger.querySelector("img");
      const figcaption = trigger.closest("figure").querySelector("figcaption");

      img.src = trigger.dataset.full || thumb.currentSrc || thumb.src;
      img.alt = thumb.alt;
      caption.textContent = figcaption ? figcaption.textContent : "";
      dialog.setAttribute("aria-label", caption.textContent || "Enlarged image");

      lastTrigger = trigger;
      dialog.showModal();
    });
  });

  dialog.querySelector(".xp-lightbox-close").addEventListener("click", () => dialog.close());

  // Any click outside the image itself (backdrop, empty space, caption) closes the lightbox
  dialog.addEventListener("click", e => {
    if (e.target !== img) dialog.close();
  });

  // Escape is handled natively by <dialog>; return focus to the image that opened it
  dialog.addEventListener("close", () => {
    img.removeAttribute("src");
    if (lastTrigger) lastTrigger.focus();
  });
})();
