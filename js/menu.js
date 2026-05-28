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
