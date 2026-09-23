function update(n){
  const activeMenuItems = document.querySelectorAll('.active-menu-item');

  activeMenuItems.forEach(element => {
    element.classList.remove("active-menu-item");
  });

	document.getElementsByClassName('state')[n].classList.add("active-menu-item");
  document.getElementById('menu-nav').classList.add("active-menu-nav-item");
}

const slideIndexes = {
  "exchange-system": 1,
  "reservation-system": 1,
  "human-capital-system": 1,
  "network-planning-system": 1
};

showSlides("exchange-system", 1);
showSlides("reservation-system", 1);
showSlides("human-capital-system", 1);
showSlides("network-planning-system", 1);

function plusSlides(project, n) {
  slideIndexes[project] += n;
  n = slideIndexes[project];
  showSlides(project, n);
}

function currentSlide(project, n) {
  showSlides(project, n);
}

function showSlides(project, slide) {
  const slides = document.getElementsByClassName(`mySlides-${project}`);
  const dots = document.getElementsByClassName(`dot-${project}`);

  if (slide > slides.length) {
    slide = 1;
    slideIndexes[project] = slide;
  }

  if (slide < 1) {
    slide = slides.length;
    slideIndexes[project] = slide;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active-dot");
  }

  slides[slide - 1].style.display = "block";

  dots[slide - 1].classList.add("active-dot");
}

// Swipe left/right on the portfolio images for screens smaller than 700px
const mobileQuery = window.matchMedia("(max-width: 700px)");
const SWIPE_THRESHOLD = 50;

Object.keys(slideIndexes).forEach(project => {
  const firstSlide = document.querySelector(`.mySlides-${project}`);
  if (!firstSlide) return;

  const container = firstSlide.closest(".slideshow-container");
  let startX = 0;
  let startY = 0;

  container.addEventListener("touchstart", e => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });

  container.addEventListener("touchend", e => {
    if (!mobileQuery.matches) return;

    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    // Ignore short or mostly vertical gestures so page scrolling still works
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

    plusSlides(project, deltaX < 0 ? 1 : -1);
  }, { passive: true });
});
