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

// Lightbox: any [data-lightbox] button (Experience recognition, certificates, portfolio screenshots) opens its
// image in a native modal <dialog>. Delegated, so buttons rendered later by other scripts work too.
// Caption comes from data-caption, or the enclosing figure's <figcaption>; alt text from data-alt, or the thumbnail.
// Buttons sharing a data-lightbox-group form a set: the lightbox then shows prev/next buttons, the arrow keys
// step through the set, and each step fires a bubbling "lightbox:show" event on that button (so a carousel can follow).
(function () {
  const dialog = document.querySelector(".xp-lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const img = dialog.querySelector(".xp-lightbox-img");
  const caption = dialog.querySelector(".xp-lightbox-caption");
  let group = [];
  let index = 0;

  function show(trigger) {
    const thumb = trigger.querySelector("img");
    const figure = trigger.closest("figure");
    const figcaption = figure && figure.querySelector("figcaption");

    img.src = trigger.dataset.full || thumb.currentSrc || thumb.src;
    img.alt = trigger.dataset.alt || thumb.alt;
    caption.textContent = trigger.dataset.caption || (figcaption ? figcaption.textContent : "");
    dialog.setAttribute("aria-label", caption.textContent || "Enlarged image");
  }

  function step(delta) {
    if (group.length < 2) return;
    index = (index + delta + group.length) % group.length;
    show(group[index]);
    group[index].dispatchEvent(new CustomEvent("lightbox:show", { bubbles: true }));
  }

  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;

    const name = trigger.dataset.lightboxGroup;
    group = name
      ? Array.from(document.querySelectorAll(`[data-lightbox][data-lightbox-group="${CSS.escape(name)}"]`))
      : [trigger];
    index = Math.max(0, group.indexOf(trigger));
    dialog.classList.toggle("has-nav", group.length > 1);

    show(trigger);
    dialog.showModal();
  });

  dialog.querySelector(".xp-lightbox-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".xp-lightbox-prev").addEventListener("click", () => step(-1));
  dialog.querySelector(".xp-lightbox-next").addEventListener("click", () => step(1));

  dialog.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
  });

  // Any click outside the image and the prev/next buttons (backdrop, empty space, caption) closes the lightbox
  dialog.addEventListener("click", e => {
    if (e.target !== img && !e.target.closest(".xp-lightbox-nav")) dialog.close();
  });

  // Escape is handled natively by <dialog>; return focus to the image now showing (a carousel following
  // the lightbox has made it the active one). The close event arrives asynchronously, so skip the
  // cleanup if the lightbox was already reopened.
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    img.removeAttribute("src");
    if (group[index]) group[index].focus();
  });
})();
