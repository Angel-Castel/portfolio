function update(n){
  const activeMenuItems = document.querySelectorAll('.active-menu-item');

  activeMenuItems.forEach(element => {
    element.classList.remove("active-menu-item");
  });

	document.getElementsByClassName('state')[n].classList.add("active-menu-item");
  document.getElementById('menu-nav').classList.add("active-menu-nav-item");
}
