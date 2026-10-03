// Skills: on first view, the keyboard spins from the middle of the section to the right while shrinking, then
// its keycaps fly like meteorites into the grouped grid, leaving darkened copies behind on the keyboard.
// Plays on every page load, once per load (scrolling back shows the settled grid); simplified on small screens
// or with reduced motion.
(function () {
  const section = document.getElementById("skills");
  const board = section && section.querySelector(".sk-board");
  if (!board) return;

  const keys = Array.from(section.querySelectorAll(".sk-key"));
  const stage = section.querySelector(".sk-stage");
  const layout = section.querySelector(".sk-layout");
  const HOLD = 500;
  const STAGGER = 70;
  const FLIGHT = 950;
  const INTRO = 1600;
  const desktop = window.matchMedia("(min-width: 991px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Fill the keyboard with copies of the keycaps, in a mixed order so neighbouring colors differ
  const clones = new Map();
  keys.forEach((_, n) => {
    const key = keys[(n * 7) % keys.length];
    const socket = document.createElement("span");
    const cap = key.querySelector(".sk-cap").cloneNode(true);
    socket.className = "sk-socket";
    socket.style.cssText = key.style.cssText;
    socket.appendChild(cap);
    board.appendChild(socket);
    clones.set(key, cap);
  });

  // One blank key completes the 5 x 4 plate
  const blank = document.createElement("span");
  const blankCap = document.createElement("span");
  blank.className = "sk-socket";
  blank.style.setProperty("--key", "#2a3344");
  blankCap.className = "sk-cap";
  blank.appendChild(blankCap);
  board.appendChild(blank);

  keys.forEach((key, i) => key.style.setProperty("--i", i));

  function showFinal() {
    section.classList.remove("is-armed");
    board.classList.add("is-open", "is-spent");
  }

  if (reducedMotion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) {
    showFinal();
    return;
  }

  section.classList.add("is-armed");

  // Offset from the keyboard's resting spot (right column) to the middle of the section.
  // Layout offsets ignore transforms, so this stays correct while the intro transform is applied.
  function placeIntro() {
    const dx = (layout.offsetLeft + layout.offsetWidth / 2) - (stage.offsetLeft + stage.offsetWidth / 2);
    const dy = (layout.offsetTop + layout.offsetHeight / 2) - (stage.offsetTop + stage.offsetHeight / 2);
    stage.style.setProperty("--intro-x", `${dx}px`);
    stage.style.setProperty("--intro-y", `${dy}px`);
  }

  if (desktop.matches) {
    // Jump straight into the intro state (no transition), so a reload at Skills doesn't show it sliding in
    placeIntro();
    stage.style.transition = board.style.transition = "none";
    stage.classList.add("is-intro");
    void stage.offsetWidth;
    stage.style.transition = board.style.transition = "";
    window.addEventListener("resize", () => {
      if (stage.classList.contains("is-intro")) placeIntro();
    });
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    if (desktop.matches) {
      // Hold the big keyboard briefly so it's seen even when the page loads already scrolled to Skills,
      // then spin it 360 degrees into its smaller resting position before the keys fly out
      setTimeout(() => {
        stage.classList.remove("is-intro");
        board.classList.add("is-open");
        setTimeout(launchKeys, INTRO);
      }, HOLD);
    } else {
      fadeKeysIn();
    }
  }, { threshold: 0.35 });
  observer.observe(layout);

  function fadeKeysIn() {
    stage.classList.remove("is-intro");
    section.classList.add("is-fading");
    board.classList.add("is-open", "is-spent");
    requestAnimationFrame(() => section.classList.remove("is-armed"));
  }

  function launchKeys() {
    // Read every position first, then start all animations (no interleaved layout reads).
    // Landing spots come from layout offsets, which ignore the hidden state's CSS transform.
    // Positions are aligned on the keycap (the name label sits below it).
    const flights = keys.map(key => {
      const from = clones.get(key).getBoundingClientRect();
      const parent = key.offsetParent.getBoundingClientRect();
      const cap = key.querySelector(".sk-cap");
      return {
        key,
        dx: from.left + from.width / 2 - (parent.left + key.offsetLeft + cap.offsetLeft + cap.offsetWidth / 2),
        dy: from.top + from.height / 2 - (parent.top + key.offsetTop + cap.offsetTop + cap.offsetHeight / 2)
      };
    });

    section.classList.add("is-flying");

    let remaining = flights.length;

    flights.forEach(({ key, dx, dy }, i) => {
      const delay = i * STAGGER;
      const spin = (i % 2 ? 1 : -1) * (25 + (i * 13) % 30);
      const lift = 60 + (i * 17) % 60;

      key.style.setProperty("--trail-angle", `${Math.atan2(dy, dx)}rad`);

      const flight = key.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(0.9) rotate(${spin}deg)`, opacity: 0 },
        { transform: `translate(${dx * 0.92}px, ${dy * 0.92 - 10}px) scale(0.95) rotate(${spin * 0.9}deg)`, opacity: 1, offset: 0.08 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - lift}px) scale(1.05) rotate(${spin * 0.3}deg)`, opacity: 1, offset: 0.55 },
        { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1 }
      ], { duration: FLIGHT, delay, easing: "cubic-bezier(0.3, 0.6, 0.35, 1)", fill: "backwards" });

      key.querySelector(".sk-trail").animate([
        { opacity: 0 },
        { opacity: 0.95, offset: 0.1 },
        { opacity: 0.8, offset: 0.6 },
        { opacity: 0 }
      ], { duration: FLIGHT * 0.9, delay });

      // The copy on the keyboard flashes as the real key launches, then stays behind darkened
      const clone = clones.get(key);
      const press = clone.animate([
        { filter: "brightness(1) saturate(1)", transform: "translateZ(10px)" },
        { filter: "brightness(1.5) saturate(1)", transform: "translateZ(18px)", offset: 0.2 },
        { filter: "brightness(0.35) saturate(0.7)", transform: "translateZ(10px)" }
      ], { duration: 400, delay, easing: "ease-out", fill: "forwards" });

      // .is-spent holds the same dark look as the last frame, so the animation can be released
      press.finished.then(() => {
        clone.classList.add("is-spent");
        press.cancel();
      }, () => {});

      flight.finished.then(() => {
        key.classList.add("is-landed");
        remaining -= 1;
        if (remaining === 0) board.classList.add("is-spent");
      }, () => {});
    });

    // Safe to unhide now: each key is held at its launch point (fill: backwards) until its delay ends
    section.classList.remove("is-armed");
  }
})();
