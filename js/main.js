// Nav scroll
var nav = document.getElementById('nav');
window.addEventListener('scroll', function () {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile menu
var toggle = document.getElementById('navToggle');
var menu = document.getElementById('navMenu');

toggle.addEventListener('click', function () {
  var open = menu.classList.toggle('open');
  toggle.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close mobile menu when a real page link is clicked (not dropdown toggles)
menu.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () {
    if (a.classList.contains('dropdown-toggle')) return;
    menu.classList.remove('open');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Mobile dropdown toggles
menu.querySelectorAll('.dropdown-toggle').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      btn.closest('.nav-dropdown').classList.toggle('open');
    }
  });
});

// Desktop dropdown close on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  }
});
