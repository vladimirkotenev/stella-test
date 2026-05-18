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

  var lineEls = consoleEl.querySelectorAll('.hero-console__line');
  var innerEl = document.getElementById('heroConsoleInner');

  function setLineContent(k, cmdText, valText, displayState) {
    var ln = lineEls[k];
    ln.style.display = displayState;
    ln.querySelector('.hero-console__cmd').textContent = cmdText;
    ln.querySelector('.hero-console__val').textContent = valText;
  }

  function measure() {
    return { w: innerEl.offsetWidth, h: innerEl.offsetHeight };
  }

  function setupBuildup(topIdx, phase) {
    for (var k = 0; k < lineEls.length; k++) {
      if (k < topIdx) {
        setLineContent(k, lineData[k].cmd, lineData[k].val, 'block');
      } else if (k === topIdx) {
        if (phase === 'cmd')      setLineContent(k, lineData[k].cmd, '', 'block');
        else if (phase === 'cmdDots') setLineContent(k, lineData[k].cmd + '...', '', 'block');
        else if (phase === 'full') setLineContent(k, lineData[k].cmd, lineData[k].val, 'block');
      } else {
        setLineContent(k, '', '', 'none');
      }
    }
  }

  function setupTeardown(remaining, partial) {
    for (var k = 0; k < lineEls.length; k++) {
      if (k < remaining - 1) {
        setLineContent(k, lineData[k].cmd, lineData[k].val, 'block');
      } else if (k === remaining - 1) {
        if (partial === 'valErased')      setLineContent(k, lineData[k].cmd, '', 'block');
        else if (partial === 'cmdErased') setLineContent(k, '', '', 'none');
        else                              setLineContent(k, lineData[k].cmd, lineData[k].val, 'block');
      } else {
        setLineContent(k, '', '', 'none');
      }
    }
  }

  var typeWidths = [];
  for (var i0 = 0; i0 < lineEls.length; i0++) {
    var ws = {};
    setupBuildup(i0, 'cmd');      ws.cmd = measure();
    setupBuildup(i0, 'cmdDots');  ws.cmdDots = measure();
    setupBuildup(i0, 'full');     ws.full = measure();
    typeWidths.push(ws);
  }

  var eraseWidths = [];
  for (var j0 = lineEls.length - 1; j0 >= 0; j0--) {
    setupTeardown(j0 + 1, 'valErased'); eraseWidths.push(measure());
    setupTeardown(j0 + 1, 'cmdErased'); eraseWidths.push(measure());
  }

  for (var kk = 0; kk < lineEls.length; kk++) {
    setLineContent(kk, '', '', '');
  }

  gsap.set(lineEls, { display: 'none' });
  gsap.set(consoleEl, { autoAlpha: 0, scale: 0.96, transformOrigin: 'left top', width: 0, height: 0 });

  var loop = gsap.timeline({
    repeat: -1,
    delay: 0.4,
    defaults: { ease: 'none' }
  });

  lineEls.forEach(function (line, i) {
    var cmd = line.querySelector('.hero-console__cmd');
    var val = line.querySelector('.hero-console__val');
    var cmdText = lineData[i].cmd;
    var w = typeWidths[i];

    loop.set(line, { display: 'block' });
    loop.set(consoleEl, { height: w.cmd.h });

    if (i === 0) {
      loop.to(consoleEl, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' })
          .to(cmd, { duration: 0.3, text: cmdText }, '<')
          .to(consoleEl, { width: w.cmd.w, duration: 0.3, ease: 'power3.out' }, '<');
    } else {
      loop.to(cmd, { duration: 0.3, text: cmdText })
          .to(consoleEl, { width: w.cmd.w, duration: 0.3, ease: 'power3.out' }, '<');
    }

    loop.to(cmd, { duration: 0.25, text: cmdText + '...' }, '+=0.1')
        .to(consoleEl, { width: w.cmdDots.w, duration: 0.25, ease: 'power3.out' }, '<');

    loop.to(cmd, { duration: 0.18, text: cmdText }, '+=0.35')
        .to(consoleEl, { width: w.cmd.w, duration: 0.18, ease: 'power3.in' }, '<');

    loop.to(val, { duration: 0.28, text: lineData[i].val }, '+=0.05')
        .to(consoleEl, { width: w.full.w, duration: 0.28, ease: 'power3.out' }, '<');
  });

  loop.to({}, { duration: 1 });

  var idx = 0;
  for (var j = lineEls.length - 1; j > 0; j--) {
    var lineE = lineEls[j];
    var cmdE = lineE.querySelector('.hero-console__cmd');
    var valE = lineE.querySelector('.hero-console__val');

    var stepVal = eraseWidths[idx++];
    loop.to(valE, { duration: 0.1, text: '' })
        .to(consoleEl, { width: stepVal.w, duration: 0.1, ease: 'power3.in' }, '<');

    var stepCmd = eraseWidths[idx++];
    loop.to(cmdE, { duration: 0.14, text: '' })
        .to(consoleEl, { width: stepCmd.w, duration: 0.14, ease: 'power3.in' }, '<')
        .set(lineE, { display: 'none' })
        .set(consoleEl, { height: stepCmd.h });
  }

  var firstLine = lineEls[0];
  var firstCmd = firstLine.querySelector('.hero-console__cmd');
  var firstVal = firstLine.querySelector('.hero-console__val');

  var step0Val = eraseWidths[idx++];
  loop.to(firstVal, { duration: 0.1, text: '' })
      .to(consoleEl, { width: step0Val.w, duration: 0.1, ease: 'power3.in' }, '<');

  var step0Cmd = eraseWidths[idx++];
  loop.to(firstCmd, { duration: 0.14, text: '' })
      .to(consoleEl, { width: step0Cmd.w, duration: 0.14, ease: 'power3.in' }, '<')
      .to(consoleEl, { autoAlpha: 0, scale: 0.96, duration: 0.14, ease: 'power3.in' }, '<')
      .set(firstLine, { display: 'none' })
      .set(consoleEl, { height: step0Cmd.h });

  loop.to({}, { duration: 0.4 });

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

  var consoleWrap = document.getElementById('heroConsoleWrap');
  var graphWrap = document.getElementById('heroGraphWrap');
  var actionsWrap = document.getElementById('heroActionsWrap');
  if (consoleWrap || graphWrap || actionsWrap) {
    var displayedScroll = window.scrollY;
    var lagFactor = 0.15;

    gsap.ticker.add(function () {
      var targetScroll = window.scrollY;
      displayedScroll += (targetScroll - displayedScroll) * lagFactor;
      var offset = targetScroll - displayedScroll;
      var transform = 'translate3d(0,' + offset + 'px,0)';
      if (consoleWrap) consoleWrap.style.transform = transform;
      if (graphWrap) graphWrap.style.transform = transform;
      if (actionsWrap) actionsWrap.style.transform = transform;
    });
  }
});
