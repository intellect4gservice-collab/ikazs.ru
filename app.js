/* ИнтеллектКАЗС — interactions (scroll-driven, Apple-way) */
(function () {
  'use strict';

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---- Nav: solidify on scroll ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => { nav.classList.toggle('solid', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Animated counters ---- */
  const fmt = (n) => n.toLocaleString('ru-RU');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400; const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* ---- ROI calculator ---- */
  const ids = ['c-units', 'c-daily', 'c-price-azs', 'c-price-own'];
  const rYear = document.getElementById('r-year');
  const rMonth = document.getElementById('r-month');
  const rPayback = document.getElementById('r-payback');
  const STATION_COST = 4200000;
  const money = (n) => fmt(Math.round(n)) + ' \u20bd';
  function recalc() {
    const units = +document.getElementById('c-units').value || 0;
    const daily = +document.getElementById('c-daily').value || 0;
    const pA = +document.getElementById('c-price-azs').value || 0;
    const pO = +document.getElementById('c-price-own').value || 0;
    const diff = Math.max(pA - pO, 0);
    const litersYear = units * daily * 365;
    const saveYear = litersYear * diff;
    rYear.textContent = saveYear > 0 ? money(saveYear) : '\u2014 \u20bd';
    rMonth.textContent = saveYear > 0 ? money(saveYear / 12) + ' \u0432 \u043c\u0435\u0441\u044f\u0446' : '\u2014 \u20bd \u0432 \u043c\u0435\u0441\u044f\u0446';
    if (saveYear > 0) {
      const months = STATION_COST / (saveYear / 12);
      rPayback.textContent = (months < 1 ? '<1' : Math.round(months)) + ' \u043c\u0435\u0441.';
    } else { rPayback.textContent = '\u2014 \u043c\u0435\u0441.'; }
  }
  if (document.getElementById('c-units')) {
    ids.forEach((id) => { const el = document.getElementById(id); if (el) el.addEventListener('input', recalc); });
    recalc();
  }

  /* ---- Comparison period toggle ---- */
  const cmp = document.getElementById('cmp-toggle');
  if (cmp) {
    const apply = (years) => {
      const save = document.querySelector('[data-base-save]');
      if (save) save.textContent = money(1500000 * years);
      const loss = document.querySelector('[data-base-loss]');
      if (loss) loss.textContent = money(420000 * years);
      document.querySelectorAll('[data-base-hours]').forEach((el) => {
        el.textContent = fmt((+el.dataset.baseHours) * years) + ' \u0447';
      });
    };
    cmp.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        cmp.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        apply(+b.dataset.period);
      });
    });
    apply(1);
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) { other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
      });
      item.classList.toggle('open', !open);
      a.style.maxHeight = open ? null : a.scrollHeight + 'px';
    });
  });

  /* ---- Timeline fill on scroll ---- */
  const tl = document.getElementById('timeline');
  if (tl) {
    const fill = document.getElementById('tl-fill');
    const steps = tl.querySelectorAll('.tl-step');
    const tlIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (fill) fill.style.width = '100%';
        steps.forEach((s, i) => setTimeout(() => s.classList.add('on'), 180 * i));
        tlIO.disconnect();
      });
    }, { threshold: 0.4 });
    tlIO.observe(tl);
  }

  /* ---- Mobile menu ---- */
  const burger = document.querySelector('.nav-burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('x', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open'); burger.classList.remove('x'); document.body.style.overflow = '';
      });
    });
  }

  /* ---- Mega-menu scrim (blur + dim page behind dropdown) ---- */
  if (nav) {
    const scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);
    const links = nav.querySelector('.nav-links');
    if (links) {
      links.querySelectorAll('.nav-item').forEach((it) => {
        const drop = it.querySelector('.drop');
        it.addEventListener('mouseenter', () => {
          if (nav.classList.contains('open')) return;
          scrim.classList.add('on');
          if (drop && window.innerWidth > 1040) {
            const left = it.getBoundingClientRect().left;
            const w = 560;
            const maxLeft = window.innerWidth - w - 30;
            drop.style.paddingLeft = Math.max(24, Math.min(left, maxLeft)) + 'px';
            drop.style.paddingRight = '24px';
          }
        });
      });
      links.addEventListener('mouseleave', () => scrim.classList.remove('on'));
    }
  }

  /* ---- Flip cards on tap (touch) ---- */
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.flip').forEach((f) => {
      f.addEventListener('click', () => f.classList.toggle('flipped'));
    });
  }

  /* ---- Hero / CTA inputs: friendly acknowledgement ---- */
  document.querySelectorAll('.hero-input .pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input && input.value.trim()) { btn.textContent = 'Принято \u2713'; input.value = ''; setTimeout(() => (btn.textContent = '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'), 2200); }
    });
  });
  /* ---- AI Consultant widget (injected on every page) ---- */
  (function () {
    if (document.querySelector('.cons-orb')) return;
    const cap = document.createElement('div');
    cap.className = 'cons-cap';
    cap.textContent = 'Консультант';
    const orb = document.createElement('button');
    orb.className = 'cons-orb';
    orb.setAttribute('aria-label', 'Консультант');
    orb.innerHTML = '<img src="assets/logo-mark.png" alt="" class="cons-orb-mark">';
    const panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.innerHTML =
      '<div class="chat-head"><div class="dot"></div><div><h4>Консультант</h4><div class="st">ИнтеллектКАЗС · на связи</div></div><button class="chat-close" aria-label="Закрыть">×</button></div>' +
      '<div class="chat-body"></div>' +
      '<div class="chat-input"><input type="text" placeholder="Опишите задачу…" aria-label="Сообщение"><button aria-label="Отправить">→</button></div>';
    document.body.appendChild(cap);
    document.body.appendChild(orb);
    document.body.appendChild(panel);

    const body = panel.querySelector('.chat-body');
    const input = panel.querySelector('.chat-input input');
    const sendBtn = panel.querySelector('.chat-input button');
    const add = (text, who) => {
      const m = document.createElement('div');
      m.className = 'msg ' + who;
      m.textContent = text;
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
      return m;
    };
    let greeted = false;
    const open = () => {
      panel.classList.add('open');
      cap.classList.add('hide');
      if (!greeted) { greeted = true; setTimeout(() => add('Здравствуйте! Я консультант ИнтеллектКАЗС. Подберу модель КАЗС, посчитаю окупаемость или отвечу на вопрос — с чего начнём?', 'bot'), 250); }
      setTimeout(() => input.focus(), 320);
    };
    const close = () => { panel.classList.remove('open'); cap.classList.remove('hide'); };
    orb.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
    panel.querySelector('.chat-close').addEventListener('click', close);

    // Override window.ikazsConsultantReply(text) to connect a real chatbot later.
    async function reply(text) {
      if (typeof window.ikazsConsultantReply === 'function') {
        try { return await window.ikazsConsultantReply(text); } catch (e) { /* fall through */ }
      }
      return 'Спасибо! Передал ваш запрос инженеру — он свяжется в течение часа. Можно и сразу позвонить: 8 812 219 34 85.';
    }
    const send = async () => {
      const text = input.value.trim();
      if (!text) return;
      add(text, 'user');
      input.value = '';
      const typing = add('…', 'bot');
      const r = await reply(text);
      typing.textContent = r;
      body.scrollTop = body.scrollHeight;
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  })();

  /* ---- Call-back modal ---- */
  (function () {
    if (document.querySelector('.call-ov')) return;
    const formHTML = '<button class="call-x" aria-label="Закрыть">×</button><h3>Заказать звонок</h3><p>Оставьте контакты — инженер перезвонит в течение часа.</p><form><div class="field-input"><input type="text" placeholder="ФИО" required></div><div class="field-input"><input type="email" placeholder="E-mail" required></div><div class="field-input"><input type="tel" placeholder="Телефон" required></div><button type="submit" class="pill pill-primary">Заказать звонок</button></form>';
    const ov = document.createElement('div');
    ov.className = 'call-ov';
    ov.innerHTML = '<div class="call-modal"></div>';
    document.body.appendChild(ov);
    const modal = ov.querySelector('.call-modal');
    const close = () => ov.classList.remove('open');
    function render() {
      modal.innerHTML = formHTML;
      modal.querySelector('.call-x').addEventListener('click', close);
      modal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        modal.innerHTML = '<button class="call-x" aria-label="Закрыть">×</button><h3>Спасибо!</h3><p>Заявка принята — перезвоним в течение часа.</p>';
        modal.querySelector('.call-x').addEventListener('click', close);
        setTimeout(close, 1000);
      });
    }
    document.addEventListener('click', (e) => { if (e.target.closest('[data-call]')) { e.preventDefault(); render(); ov.classList.add('open'); } });
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();

})();
