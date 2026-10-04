// Skills: on first view, the keyboard spins from the middle of the section to the right, then
// its keycaps fly like meteorites into the grouped grid, leaving darkened copies behind on the keyboard.
// When the Knowledge card scrolls into view, the keyboard turns left into the space beside it and lights up;
// scrolling back up to the Main programming languages card returns it to the right.
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

  // Offsets from the keyboard's grid spot (right column) to the middle of the skill cards.
  // The keyboard always keeps the vertical offset; the intro adds the horizontal one.
  // Layout offsets ignore transforms, so this stays correct while a transform is applied.
  const groups = section.querySelector(".sk-groups");
  function placeStage() {
    const dx = (layout.offsetLeft + layout.offsetWidth / 2) - (stage.offsetLeft + stage.offsetWidth / 2);
    const dy = (groups.offsetTop + groups.offsetHeight / 2) - (stage.offsetTop + stage.offsetHeight / 2);
    stage.style.setProperty("--intro-x", `${dx}px`);
    stage.style.setProperty("--intro-y", `${dy}px`);
  }

  // Docking: after the keys have flown and Knowledge is in view, the keyboard moves beside Knowledge,
  // centered on its height but never overlapping the cards above (it drops lower if needed),
  // and shrinks if that's the only way to fit before the bottom of the section.
  const knowledge = section.querySelector(".sk-knowledge");
  const REST_SCALE = 1.45;
  const DOCK_SCALE = 1.15;
  const DOCK_GAP = 24;
  const middleCard = section.querySelectorAll(".sk-group")[1];
  let restBoardHeight = null;
  const HEADER = 65; // fixed header covering the top of the viewport
  let keysDone = false;
  let docked = false;

  function placeDock() {
    if (restBoardHeight === null) return;
    // All positions in the coordinates of the cards' container (layout offsets, unaffected by transforms)
    const inner = groups.offsetParent;
    const top = groups.offsetTop + groups.offsetHeight + DOCK_GAP;
    const bottom = section.getBoundingClientRect().bottom - inner.getBoundingClientRect().top - DOCK_GAP;
    const scale = Math.min(DOCK_SCALE, REST_SCALE * (bottom - top) / restBoardHeight);
    const halfHeight = restBoardHeight * scale / REST_SCALE / 2;
    const targetX = groups.offsetLeft + groups.offsetWidth / 2;
    const targetY = Math.min(
      Math.max(knowledge.offsetTop + knowledge.offsetHeight / 2, top + halfHeight),
      bottom - halfHeight
    );
    stage.style.setProperty("--dock-x", `${targetX - (stage.offsetLeft + stage.offsetWidth / 2)}px`);
    stage.style.setProperty("--dock-y", `${targetY - (stage.offsetTop + stage.offsetHeight / 2)}px`);
    stage.style.setProperty("--dock-scale", scale);
  }

  function dock() {
    if (docked || !keysDone || !stage.offsetWidth) return; // keyboard hidden on small screens
    // Measured once, while the keyboard is still at rest on the right
    if (restBoardHeight === null) restBoardHeight = board.getBoundingClientRect().height;
    placeDock();
    docked = true;
    stage.classList.add("is-docked");
    board.classList.remove("is-spent");
    board.querySelectorAll(".sk-cap.is-spent").forEach(cap => cap.classList.remove("is-spent"));
  }

  // Back to the right side, turning the other way, with its keys darkened again
  function undock() {
    if (!docked) return;
    docked = false;
    stage.classList.remove("is-docked");
    board.classList.add("is-spent");
  }

  // At least 15% of the Knowledge card is on screen
  function knowledgeShowing() {
    const rect = knowledge.getBoundingClientRect();
    return rect.top < window.innerHeight - rect.height * 0.15 && rect.bottom > HEADER;
  }

  function keysFinished() {
    keysDone = true;
    // From here on, keycap brightness changes fade instead of switching instantly
    board.classList.add("is-settled");
    if (knowledgeShowing()) dock();
  }

  // Lower edge of the middle card (Main programming languages) is on screen, below the header
  function middleCardEdgeShowing() {
    const bottom = middleCard.getBoundingClientRect().bottom;
    return bottom > HEADER && bottom <= window.innerHeight;
  }

  // Scrolling down to Knowledge docks the keyboard; scrolling up while the lower edge of the middle card
  // is showing returns it right away. Checked at most once per frame.
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function checkDock() {
    scrollTicking = false;
    const y = window.scrollY;
    const goingDown = y > lastScrollY;
    const goingUp = y < lastScrollY;
    lastScrollY = y;
    if (!keysDone) return;

    if (!docked && goingDown && knowledgeShowing()) {
      dock();
    } else if (docked && goingUp && middleCardEdgeShowing()) {
      undock();
    }
  }

  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(checkDock);
  }, { passive: true });

  placeStage();
  window.addEventListener("resize", () => {
    placeStage();
    placeDock();
  });

  function showFinal() {
    section.classList.remove("is-armed");
    board.classList.add("is-open", "is-spent");
    keysFinished();
  }

  if (reducedMotion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) {
    showFinal();
    return;
  }

  section.classList.add("is-armed");

  if (desktop.matches) {
    // Jump straight into the intro state (no transition), so a reload at Skills doesn't show it sliding in
    stage.style.transition = board.style.transition = "none";
    stage.classList.add("is-intro");
    void stage.offsetWidth;
    stage.style.transition = board.style.transition = "";
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    if (desktop.matches) {
      // Hold the big keyboard briefly so it's seen even when the page loads already scrolled to Skills,
      // then spin it 360 degrees across to the right before the keys fly out
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
        if (remaining === 0) {
          board.classList.add("is-spent");
          keysFinished();
        }
      }, () => {});
    });

    // Safe to unhide now: each key is held at its launch point (fill: backwards) until its delay ends
    section.classList.remove("is-armed");
  }
})();
