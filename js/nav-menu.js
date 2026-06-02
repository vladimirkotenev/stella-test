// Navbar "Business Scenarios" dropdown.
// Desktop: opens on hover (pure CSS). Mobile (<=767px, fullscreen menu): the trigger taps
// open/close an inline accordion instead of navigating.
(function () {
  var items = document.querySelectorAll('.site-nav__item--has-menu');
  if (!items.length) return;
  var mobile = window.matchMedia('(max-width: 767px)');

  items.forEach(function (item) {
    var trigger = item.querySelector('.site-nav__link--menu');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      if (mobile.matches) {
        e.preventDefault();            // tap toggles the accordion instead of following the link
        item.classList.toggle('is-open');
      }
    });
  });

  // collapse any open accordion when leaving the mobile layout
  mobile.addEventListener('change', function (e) {
    if (!e.matches) items.forEach(function (item) { item.classList.remove('is-open'); });
  });
})();
