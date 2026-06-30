// Navbar hide-on-scroll-down / show-on-scroll-up. Shared across all pages so the
// behaviour stays identical everywhere (source of truth was index.html).
(function () {
  var nav = document.querySelector('.site-nav');
  // first hero/intro section on the page — keeps the nav visible across it, then
  // the threshold lets it hide. Each page type has its own hero class.
  var hero = document.querySelector('.section_header26, .bk-hero, .header9_component, .about-quote');
  if (!nav) return;

  var lastY = window.pageYOffset || 0;
  var ticking = false;
  var isAnimating = false;
  var unlockTimer = 0;

  function unlock() {
    clearTimeout(unlockTimer);
    isAnimating = false;
  }

  function lock() {
    isAnimating = true;
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlock, 400);
  }

  nav.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'transform') unlock();
  });

  function getThreshold() {
    if (!hero) return nav.offsetHeight;
    return hero.offsetTop + hero.offsetHeight - nav.offsetHeight;
  }

  // Ignore sub-pixel jitter and the easing "tail" of smooth scroll — those
  // near-zero deltas otherwise read as a direction flip and make the nav twitch.
  var DEADZONE = 6;

  function update() {
    var y = window.pageYOffset || 0;

    if (isAnimating) {
      lastY = y;
      ticking = false;
      return;
    }

    var delta = y - lastY;

    // Movement too small to be intentional: keep lastY as the reference so a
    // slow scroll still accumulates past the deadzone instead of being lost.
    if (delta > -DEADZONE && delta < DEADZONE) {
      ticking = false;
      return;
    }

    var threshold = getThreshold();
    var hidden = nav.classList.contains('is-hidden');

    if (delta > 0 && y > threshold && !hidden) {
      nav.classList.add('is-hidden');   // scroll down → hide
      lock();
    } else if (delta < 0 && hidden) {
      nav.classList.remove('is-hidden'); // scroll up → show
      lock();
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
