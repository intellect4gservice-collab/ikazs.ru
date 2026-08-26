/* ============================================================
   ИнтеллектКАЗС — Scroll-scrubbed video sequence
   Five sequential clips pinned in one stage. Scroll position
   maps to: which clip is showing, that clip's currentTime
   (scrub forward AND backward), a per-clip caption that slides
   up from the bottom, the dot rail and the counter.
   ============================================================ */
(function () {
  const cine = document.getElementById('cine');
  if (!cine) return;

  const scenes = [...cine.querySelectorAll('.cine-scene')];
  const videos = scenes.map(s => s.querySelector('video'));
  const caps   = [...cine.querySelectorAll('.cine-cap')];
  const dots   = [...cine.querySelectorAll('.cine-dot')];
  const numEl  = document.getElementById('cineNum');
  const cueEl  = cine.querySelector('.cine-cue');
  const N = scenes.length;
  if (!N) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll budget: a little lead-in, then ~1.15 screens of scrub per clip.
  // The last clip has no hold tail (it ends and the page scrolls on), so the
  // stage is one hold-length shorter than N full segments.
  const SCRUB = 0.45;                    // share of a segment that plays a clip
  const UNITS = (N - 1) + SCRUB;         // total segment-units of scroll
  cine.style.height = (60 + UNITS * 115) + 'vh';
  if (numEl) numEl.querySelector('.tot').textContent = '/ ' + String(N).padStart(2, '0');

  // Lazy native load: only fetch a clip's stream when it's near the
  // viewport, so the first clip appears fast instead of five competing.
  // Scrubbing needs a seekable stream (host must answer HTTP range
  // requests — normal web servers do; some preview hosts report
  // seekable=[0,0]). Where seek is available we scrub by scroll; where
  // it isn't we gracefully fall back to autoplaying the on-screen clip.
  function ensureLoaded(v) {
    if (!v || v.dataset.loaded) return;
    v.dataset.loaded = '1';
    v.loop = true;
    v.muted = true;
    v.preload = 'auto';
    v.src = v.dataset.src;
    v.load();
    v.addEventListener('loadeddata', render, { once: true });
    v.addEventListener('canplay', render, { once: true });
    v.addEventListener('seeked', render);
    v.addEventListener('loadedmetadata', () => {
      render();
      // If the host can't seek this stream, pull it into a blob (which
      // is always seekable) so scroll-scrub works anyway. Harmless if it
      // never finishes on a very slow host — autoplay keeps running.
      if (!canSeek(v)) tryUpgrade(v);
    }, { once: true });
  }

  function tryUpgrade(v) {
    if (v.dataset.upg) return;
    v.dataset.upg = '1';
    fetch(v.dataset.src)
      .then(r => r.blob())
      .then(blob => {
        const wasPlaying = !v.paused;
        v.src = URL.createObjectURL(blob);
        v.load();
        v.addEventListener('loadeddata', () => { if (wasPlaying) v.pause(); render(); }, { once: true });
      })
      .catch(() => {});
  }

  const canSeek = v => !!(v && v.seekable && v.seekable.length && v.seekable.end(0) > 0.5);

  function seek(v, frac) {
    if (!v || !v.duration || !isFinite(v.duration)) return;
    // Don't queue a new seek while one is still in flight — that's what
    // makes scrubbing stutter. Let the rAF loop catch up instead.
    if (v.seeking) return;
    const t = clamp(frac, 0, 1) * (v.duration - 0.05);
    if (Math.abs(v.currentTime - t) > 0.012) {
      try { v.currentTime = t; } catch (e) {}
    }
  }

  // Decoupled scrub loop: keeps nudging the active clip toward the
  // scroll target frame-by-frame, only issuing a seek when the decoder
  // is idle. Smooths out the catch-up after a fast scroll.
  let curIdx = 0, curFrac = 0, scrubRAF = 0;
  function scrubLoop() {
    scrubRAF = 0;
    const v = videos[curIdx];
    if (v && canSeek(v) && v.duration) {
      const t = clamp(curFrac, 0, 1) * (v.duration - 0.05);
      if (!v.seeking && Math.abs(v.currentTime - t) > 0.012) {
        try { v.currentTime = t; } catch (e) {}
      }
      if (Math.abs(v.currentTime - t) > 0.012) scrubRAF = requestAnimationFrame(scrubLoop);
    }
  }
  function scheduleScrub() { if (!scrubRAF) scrubRAF = requestAnimationFrame(scrubLoop); }

  function render() {
    const rect = cine.getBoundingClientRect();
    const total = cine.offsetHeight - window.innerHeight;
    const p = clamp(-rect.top / Math.max(total, 1), 0, 1);

    const fpos = p * UNITS;                   // 0 .. UNITS
    const idx  = clamp(Math.floor(fpos), 0, N - 1);
    const local = clamp(fpos - idx, 0, 1);    // 0 .. 1 within current clip
    const last = N - 1;
    // Each clip plays over the FIRST part of its scroll budget. When it
    // finishes we cut straight to the NEXT clip's opening frame and hold THAT
    // still for the rest of the segment. So a stopped scroll always rests on
    // the exact frame the next clip will continue from — no dissolve between
    // mismatched framings, and no shift when scrolling resumes. The LAST clip
    // has no hold: it plays out and the page carries on scrolling.
    const playing = idx === last ? true : local < SCRUB;
    const nextIdx = Math.min(idx + 1, last);
    // Which clip is on screen, and at which point in it.
    const showIdx = playing ? idx : nextIdx;
    const showFrac = playing ? clamp(local / SCRUB, 0, 1) : (nextIdx > idx ? 0 : 1);

    // ---- Playback: scrub where the stream is seekable, else autoplay ----
    ensureLoaded(videos[idx]);
    if (idx + 1 < N) ensureLoaded(videos[idx + 1]);   // prime the next clip
    curIdx = showIdx; curFrac = showFrac;
    videos.forEach((v, i) => {
      if (!v) return;
      const active = (i === idx) || (i === idx + 1);
      if (!active) { if (!v.paused) v.pause(); return; }
      if (canSeek(v)) {
        if (!v.paused) v.pause();
        if (i === showIdx) scheduleScrub();
        else if (i > showIdx) seek(v, 0);
      } else if (i === showIdx) {
        if (v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
      }
    });

    // ---- Show exactly one clip; the handover is a straight cut placed at the
    //      end of the outgoing clip's motion, where a cut reads as editing. ----
    const showV = videos[showIdx];
    const showReady = !!(showV && showV.readyState >= 2 && showV.videoWidth > 0);
    const visible = showReady ? showIdx : idx;   // don't cut to a blank clip
    scenes.forEach((sc, i) => {
      sc.style.opacity = i === visible ? 1 : 0;
      sc.style.zIndex = i === visible ? 6 : 1;
      const vid = videos[i];
      if (vid) { vid.style.transform = ''; vid.style.filter = ''; }
    });

    // ---- Captions: each one is already in place when its clip begins,
    //      holds, then drives UP and off the top as the next clip's caption
    //      drives up from below into its place. Fully scroll-linked and
    //      reversible; not gated on reduced-motion (the user drives it). ----
    const IN = 0.30, OUT = 0.74, TRAVEL = 340;
    caps.forEach((cp, i) => {
      const d = fpos - i;            // <0 not reached, 0..1 during, >1 passed
      let op = 0, y = TRAVEL;
      if (d < 0) {                   // rising up into place from below
        const k = clamp((d + IN) / IN, 0, 1);
        op = k; y = (1 - k) * TRAVEL;
      } else if (d < OUT) {          // standing
        op = 1; y = 0;
      } else if (i === last) {       // last caption stays put (has the CTA)
        op = 1; y = 0;
      } else {                       // driving up and off the top
        const k = clamp((d - OUT) / (1 - OUT), 0, 1);
        op = 1 - k; y = -k * TRAVEL;
      }
      cp.style.opacity = op;
      cp.style.transform = `translateY(${y.toFixed(1)}px)`;
    });

    // ---- HUD ----
    if (numEl) numEl.querySelector('.cur').textContent = String(visible + 1).padStart(2, '0');
    dots.forEach((dt, i) => dt.classList.toggle('on', i === visible));
    if (cueEl) cueEl.style.opacity = p > 0.03 ? '0' : '1';
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  dots.forEach((dt, i) => dt.addEventListener('click', () => {
    const total = cine.offsetHeight - window.innerHeight;
    const y = cine.offsetTop + ((i + 0.2) / UNITS) * total;
    scrollTo({ top: y, behavior: 'smooth' });
  }));

  render();
})();
