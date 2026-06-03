document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth < 992) return;
  if (typeof gsap === 'undefined') return;

  var consoleEl = document.getElementById('heroConsole');
  if (!consoleEl) return;

  if (gsap.registerPlugin && window.TextPlugin) {
    gsap.registerPlugin(window.TextPlugin);
  }

  var lineData = [
    { cmd: 'status.check',  val: 'Working'    },
    { cmd: 'status.update', val: 'Updated'    },
    { cmd: 'show.alerts',   val: 'No alerts'  },
    { cmd: 'add.task',      val: 'Task added' }
  ];

  var innerEl = document.getElementById('heroConsoleInner');
  var lineEls = consoleEl.querySelectorAll('.hero-console__line');

  // single-line widget: keep only the first line, drop the rest
  for (var d = 1; d < lineEls.length; d++) lineEls[d].style.display = 'none';
  var line = lineEls[0];
  line.style.display = 'block';
  var cmdEl = line.querySelector('.hero-console__cmd');
  var valEl = line.querySelector('.hero-console__val');

  function setLine(cmdText, valText) {
    cmdEl.textContent = cmdText;
    valEl.textContent = valText;
  }

  // Widest phrase across every type state — used to lock the text area width.
  var maxW = 0;
  for (var m = 0; m < lineData.length; m++) {
    setLine(lineData[m].cmd, '');               maxW = Math.max(maxW, innerEl.offsetWidth);
    setLine(lineData[m].cmd + '...', '');        maxW = Math.max(maxW, innerEl.offsetWidth);
    setLine(lineData[m].cmd, lineData[m].val);   maxW = Math.max(maxW, innerEl.offsetWidth);
  }
  setLine('', '');

  // lock the text area to the widest phrase so the box never reflows while typing;
  // the console's overall size comes naturally from the chrome + toolbar around it.
  innerEl.style.width = maxW + 'px';

  // The box reveals via the hero `heroLineIn` cascade (CSS, on .hero-console-wrap) — now a quick
  // 0.55s slide starting at 0.35s. Start typing in sync so text reads in as the box appears,
  // instead of the box sitting empty through the fly-in.
  var loop = gsap.timeline({ repeat: -1, delay: 0.35, defaults: { ease: 'none' } });

  lineData.forEach(function (p) {
    // start each phrase from a blank line
    loop.call(function () { setLine('', ''); });

    // staged reveal: cmd -> cmd... -> cmd -> value
    loop.to(cmdEl, { duration: 0.3, text: p.cmd });
    loop.to(cmdEl, { duration: 0.25, text: p.cmd + '...' }, '+=0.1');
    loop.to(cmdEl, { duration: 0.18, text: p.cmd }, '+=0.35');
    loop.to(valEl, { duration: 0.28, text: p.val }, '+=0.05');

    // hold the full phrase, then clear the whole line instantly before the next one
    loop.to({}, { duration: 1.2 });
    loop.call(function () { setLine('', ''); });
    loop.to({}, { duration: 0.25 });
  });

  var graphEl = document.getElementById('heroGraph');
  var graphScroll = document.getElementById('heroGraphScroll');
  if (graphEl && graphScroll) {
    gsap.set(graphEl, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0 round 12px)' });

    gsap.timeline({ delay: 0.5 })
      .set(graphEl, { autoAlpha: 1 })
      .to(graphEl, { clipPath: 'inset(0 0% 0 0 round 12px)', duration: 0.5, ease: 'power3.out' });

    gsap.to(graphScroll, {
      x: -190,
      duration: 4.67,
      ease: 'none',
      repeat: -1
    });
  }

  function cubicBezierEase(x1, y1, x2, y2) {
    function bx(t) { return 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t; }
    function by(t) { return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t; }
    function dbx(t) { return 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2); }
    return function (p) {
      var t = p;
      for (var i = 0; i < 8; i++) {
        var diff = bx(t) - p;
        if (Math.abs(diff) < 1e-4) break;
        var d = dbx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= diff / d;
      }
      return by(t);
    };
  }
  var easyEase = cubicBezierEase(0.22, 1, 0.36, 1);

  var actionsEl = document.getElementById('heroActions');
  var cursorEl = document.getElementById('heroActionsCursor');
  var actionItems = actionsEl ? actionsEl.querySelectorAll('.hero-actions__item') : [];
  if (actionsEl && cursorEl && actionItems.length) {
    var itemPositions = [];
    for (var ai = 0; ai < actionItems.length; ai++) {
      var item = actionItems[ai];
      itemPositions.push({
        x: 50,
        y: item.offsetTop + item.offsetHeight / 2 - 4
      });
    }
    var actionsHeight = actionsEl.offsetHeight;

    gsap.set(actionsEl, { autoAlpha: 0, height: 0 });
    gsap.set(cursorEl, { x: itemPositions[0].x, y: itemPositions[0].y });
    actionItems[0].classList.add('is-active');

    gsap.timeline({ delay: 0.7 })
      .set(actionsEl, { autoAlpha: 1 })
      .to(actionsEl, { height: actionsHeight, duration: 0.5, ease: 'power3.out' });

    var lastActiveIdx = 0;
    function syncActiveByCursor() {
      var y = gsap.getProperty(cursorEl, 'y');
      var foundIdx = -1;
      for (var i = 0; i < actionItems.length; i++) {
        var top = actionItems[i].offsetTop;
        var bottom = top + actionItems[i].offsetHeight;
        if (y >= top && y < bottom) { foundIdx = i; break; }
      }
      if (foundIdx === lastActiveIdx) return;
      if (lastActiveIdx >= 0) actionItems[lastActiveIdx].classList.remove('is-active');
      if (foundIdx >= 0) actionItems[foundIdx].classList.add('is-active');
      lastActiveIdx = foundIdx;
    }

    var currentIdx = 0;
    function jumpToRandom() {
      var nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * itemPositions.length);
      } while (nextIdx === currentIdx);

      var distance = Math.abs(nextIdx - currentIdx);
      currentIdx = nextIdx;

      var pos = itemPositions[nextIdx];
      gsap.to(cursorEl, {
        x: pos.x,
        y: pos.y,
        duration: 0.35 + distance * 0.04,
        ease: easyEase,
        onUpdate: syncActiveByCursor,
        onComplete: function () {
          gsap.delayedCall(0.55 + Math.random() * 0.5, jumpToRandom);
        }
      });
    }

    gsap.delayedCall(1.6, jumpToRandom);
  }

  // console stays put — only graph + actions keep the scroll-lag float
  var graphWrap = document.getElementById('heroGraphWrap');
  var actionsWrap = document.getElementById('heroActionsWrap');
  if (graphWrap || actionsWrap) {
    var displayedScroll = window.scrollY;
    var lagFactor = 0.15;

    gsap.ticker.add(function () {
      var targetScroll = window.scrollY;
      displayedScroll += (targetScroll - displayedScroll) * lagFactor;
      var offset = targetScroll - displayedScroll;
      var transform = 'translate3d(0,' + offset + 'px,0)';
      if (graphWrap) graphWrap.style.transform = transform;
      if (actionsWrap) actionsWrap.style.transform = transform;
    });
  }
});
