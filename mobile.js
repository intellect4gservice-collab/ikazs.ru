/* ============================================================
   ИнтеллектКАЗС — МОБИЛЬНОЕ ПОВЕДЕНИЕ
   Подключается после app.js. Ничего не делает на десктопе.
   ============================================================ */
(function () {
  'use strict';
  var NARROW = matchMedia('(max-width: 740px)');
  var LAYOUT = matchMedia('(max-width: 1040px)');
  var MENU = matchMedia('(max-width: 1040px)');
  var TOUCH = matchMedia('(hover: none)');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var lightMode = reduce || conn.saveData === true || /2g/.test(conn.effectiveType || '');

  /* ---- 1. Меню: тап по строке раскрывает раздел, а не уводит со страницы ---- */
  document.addEventListener('click', function (e) {
    if (!MENU.matches) return;
    var nav = document.getElementById('nav');
    if (!nav || !nav.classList.contains('open')) return;
    var a = e.target.closest('.nav-links .nav-item > a');
    if (!a) return;
    var item = a.parentElement;
    if (!item.querySelector('.drop')) return;
    e.preventDefault();
    e.stopImmediatePropagation();           /* не даём app.js закрыть меню */
    var was = item.classList.contains('m-exp');
    nav.querySelectorAll('.nav-item.m-exp').forEach(function (x) { if (x !== item) x.classList.remove('m-exp'); });
    item.classList.toggle('m-exp', !was);
  }, true);

  /* ---- 1a. «О компании» — единственный раздел, где остаётся блок покупки ---- */
  (function () {
    var about = null;
    document.querySelectorAll('.nav-links .nav-item > a').forEach(function (a) {
      if (/о\s*компании|о\s*нас/i.test(a.textContent || '')) about = a.parentElement;
    });
    if (!about) {                                   /* фолбэк: последний пункт с дропдауном */
      var items = document.querySelectorAll('.nav-links .nav-item');
      about = items[items.length - 1];
    }
    if (about) about.classList.add('m-about');
  })();

  /* ---- 1b. Страховка закрытия: тап вне шапки и Escape ---- */
  function closeMenu() {
    var nav = document.getElementById('nav');
    if (!nav || !nav.classList.contains('open')) return;
    nav.classList.remove('open');
    var b = nav.querySelector('.nav-burger');
    if (b) b.classList.remove('x');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    if (!MENU.matches) return;
    var nav = document.getElementById('nav');
    if (nav && nav.classList.contains('open') && !e.target.closest('.nav')) closeMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- 2. Липкая CTA-панель ---- */  if (!document.querySelector('.m-cta') && !document.body.hasAttribute('data-no-mcta')) {
    var bar = document.createElement('div');
    bar.className = 'm-cta';
    bar.innerHTML =
      '<a class="m-tel" href="tel:+78122193485">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>Позвонить</a>' +
      '<button class="m-call" data-call>Заказать КП</button>';
    document.body.appendChild(bar);

    /* Панель уходит вниз, когда открыто меню, чат или модалка */
    var sync = function () {
      var nav = document.getElementById('nav');
      var busy = (nav && nav.classList.contains('open')) ||
        document.querySelector('.chat-panel.open') ||
        document.querySelector('.call-ov.open');
      bar.classList.toggle('m-hide', !!busy);
    };
    new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    sync();
  }

  /* ---- 3. Таблицы — в скроллируемый контейнер ---- */
  document.querySelectorAll('table').forEach(function (t) {
    if (t.parentElement && t.parentElement.classList.contains('m-tbl')) return;
    var w = document.createElement('div');
    w.className = 'm-tbl';
    t.parentNode.insertBefore(w, t);
    w.appendChild(t);
  });

  if (!TOUCH.matches && !LAYOUT.matches) return;   /* дальше — только мобильное */

  /* ---- 4. Видео: постер → грузим в зоне видимости → «туда-обратно» ----
     Клип начинает двигаться только когда полностью в буфере: до этого виден
     постер. Обратный ход — покадровое смещение currentTime (файл уже в буфере,
     сеет мгновенно). Ушли с экрана — остановились. */
  function lazyVideos(nodes, opts) {
    opts = opts || {};

    function stop(v) {
      v.dataset.mRun = '';
      if (v._raf) { cancelAnimationFrame(v._raf); v._raf = 0; }
      if (!v.paused) v.pause();
    }

    function buffered(v) {
      if (!v.duration || !isFinite(v.duration)) return false;
      for (var i = 0; i < v.buffered.length; i++) {
        if (v.buffered.start(i) <= 0.05 && v.buffered.end(i) >= v.duration - 0.25) return true;
      }
      return false;
    }

    function forward(v) {
      if (!v.dataset.mRun) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    function backward(v) {
      var last = performance.now();
      (function step() {
        v._raf = 0;
        if (!v.dataset.mRun) return;
        var now = performance.now(), dt = (now - last) / 1000;
        last = now;
        var t = v.currentTime - dt;
        if (t <= 0.03) { try { v.currentTime = 0; } catch (e) {} forward(v); return; }
        if (!v.seeking) { try { v.currentTime = t; } catch (e) {} }
        v._raf = requestAnimationFrame(step);
      })();
    }

    function begin(v) {
      if (v.dataset.mRun) return;
      v.dataset.mRun = '1';
      if (!v.dataset.mPong) {
        v.dataset.mPong = '1';
        v.addEventListener('ended', function () { if (v.dataset.mRun) backward(v); });
      }
      forward(v);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (!en.isIntersecting) { stop(v); return; }
        if (lightMode) { io.unobserve(v); return; }      /* экономия трафика — остаётся постер */
        if (!v.dataset.mLoaded) {
          v.dataset.mLoaded = '1';
          v.muted = true; v.loop = false; v.playsInline = true; v.preload = 'auto';
          if (v.dataset.src && !v.currentSrc && !v.querySelector('source')) v.src = v.dataset.src;
          v.load();
          var onProgress = function () {
            if (!buffered(v)) return;
            v.removeEventListener('progress', onProgress);
            v.removeEventListener('canplaythrough', onProgress);
            if (v.dataset.mSeen) begin(v);               /* докачался — поехали, если на экране */
          };
          v.addEventListener('progress', onProgress);
          v.addEventListener('canplaythrough', onProgress);
        }
        v.dataset.mSeen = '1';
        if (buffered(v)) begin(v);                        /* уже в буфере — сразу */
      });
    }, { threshold: 0.45 });

    nodes.forEach(function (v) {
      v.removeAttribute('autoplay');
      v.removeAttribute('loop');
      v.loop = false;
      v.preload = 'none';
      io.observe(v);
    });
  }

  /* Главная: клипы плиток — один проход, без петли */
  lazyVideos([].slice.call(document.querySelectorAll('[data-strip-video]')));

  /* ---- 5. Кино-секция: разворачиваем скролл-скраб в стопку ---- */
  var cine = document.getElementById('cine');
  if (cine && document.documentElement.classList.contains('m-cine-off')) {
    var scenes = [].slice.call(cine.querySelectorAll('.cine-scene'));
    var caps = [].slice.call(cine.querySelectorAll('.cine-cap'));
    scenes.forEach(function (s, i) { if (caps[i]) s.parentNode.insertBefore(caps[i], s.nextSibling); });
    cine.querySelectorAll('.cine-caps, .cine-rail, .cine-num-hud, .cine-cue, .cine-shout').forEach(function (e) { e.remove(); });
    lazyVideos([].slice.call(cine.querySelectorAll('.cine-video')));
  }

  /* ---- 6. Страховка: всё, что шире экрана, сжимаем по ширине ----
     Закрывает разовые inline- и page-ширины (420px, 440px, 760px, svg width=760)
     на страницах, где своих медиазапросов нет. */
  function fitWide() {
    var vw = document.documentElement.clientWidth;
    var nodes = document.querySelectorAll('body *');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var r = el.getBoundingClientRect();
      if (r.width <= vw + 2) continue;
      if (el.closest('.m-tbl, .m-cta')) continue;
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'absolute') continue;   /* декор */
      var scroller = el.parentElement && el.parentElement.closest('[style*="overflow"]');
      if (scroller && /auto|scroll/.test(getComputedStyle(scroller).overflowX)) continue;
      el.dataset.mFit = '1';
      el.style.maxWidth = '100%';
      el.style.minWidth = '0';                                              /* даём grid/flex-треку сжаться */
      if (el.tagName.toLowerCase() === 'svg') { el.style.height = 'auto'; continue; }
      if (/^\d/.test(cs.width)) el.style.width = '100%';
    }
  }
  function fitPass() { fitWide(); fitWide(); }
  fitPass();
  addEventListener('load', fitPass);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPass);
  addEventListener('orientationchange', function () { setTimeout(fitPass, 250); });

  /* ---- 7. 100vh-ловушка: реальная высота вьюпорта в --vh ---- */
  var setVH = function () { document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px'); };
  setVH();
  addEventListener('orientationchange', setVH);
})();
