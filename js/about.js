// About me: the text block fades in from the right in a short stagger the first time the section is seen,
// and the photo starts its slow zoom at the same moment. Without JS (or with reduced motion) everything
// is simply shown.
(function () {
  const section = document.getElementById("about");
  if (!section) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion && "IntersectionObserver" in window) {
    section.classList.add("is-armed");
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      section.classList.add("is-revealed");
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(section);
  }

  // Footer "Back to top": smooth scroll to the hero (instant with reduced motion)
  const toTop = document.querySelector(".site-footer-top");
  const hero = document.getElementById("home");
  if (toTop && hero) {
    toTop.addEventListener("click", e => {
      e.preventDefault();
      hero.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      history.replaceState(null, "", "#home");
    });
  }
})();
