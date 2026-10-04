// Дополненная реальность: iPhone - AR Quick Look (USDZ собирается из текущей модели и цвета, кнопка «Позвонить»),
// Android - Google Scene Viewer (нужен публичный .glb на сайте), компьютер - QR-код для перехода с телефона.
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

const PHONE_TEL = '+78122193485';
const PHONE_TXT = '8 812 219 3485';
const enc = encodeURIComponent;

export function setupAR(ctx) {
  const { root, base, packed } = ctx;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const quickLook = (() => { const a = document.createElement('a'); return !!(a.relList && a.relList.supports && a.relList.supports('ar')); })();
  const mobile = isIOS || isAndroid || window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;

  const btn = root.querySelector('#k3-ar');
  const sheet = root.querySelector('.k3-arsheet');
  const card = sheet.querySelector('.k3-card');
  const titleEl = sheet.querySelector('#k3-ar-title');
  const body = sheet.querySelector('.k3-arbody');
  const close = () => { sheet.hidden = true; ctx.controls && (ctx.controls.enabled = true); };
  sheet.querySelector('.k3-x').addEventListener('click', close);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
  sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const open = (title, html) => {
    titleEl.textContent = title; body.innerHTML = html; sheet.hidden = false;
    ctx.controls && (ctx.controls.enabled = false);
  };

  // ссылка, которую откроет телефон: страница виджета с выбранной линейкой, объемом и цветом
  function shareUrl(extra = {}) {
    const s = ctx.state();
    // всегда чистый адрес виджета на боевом сайте: без ?embed, без параметров страницы-хозяина
    const live = /(^|\.)ikazs\.ru$/i.test(location.hostname);
    const u = new URL(root.dataset.shareUrl || (live ? location.origin + location.pathname : 'https://ikazs.ru/kazs-3d/index.html'));
    u.hash = ''; u.search = '';
    const p = u.searchParams;
    p.set('line', s.line); p.set('v', String(s.volume)); p.set('c', s.color.replace('#', ''));
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return u.href;
  }

  // ---------- компьютер: QR-код
  function showQR() {
    const url = shareUrl({ ar: '1' });
    let svg = '';
    try {
      const q = window.qrcode(0, 'M'); q.addData(url); q.make();
      svg = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    } catch (e) { svg = ''; }
    const s = ctx.state();
    open('Посмотрите КАЗС у себя на площадке', `
      <p class="k3-sum">${s.title}. Наведите камеру телефона на код - откроется эта модель, затем нажмите «Смотреть в AR».</p>
      <div class="k3-qr">${svg || '<p class="k3-err">Не удалось построить QR-код</p>'}</div>
      <p class="k3-note">Работает на iPhone и на Android с сервисами Google Play. Модель встанет на землю в натуральную величину.</p>`);
  }

  // ---------- iPhone: USDZ из текущей сцены
  const usdzCache = new Map();
  let anchor = null;
  const MAPS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap', 'clearcoatMap', 'clearcoatRoughnessMap', 'clearcoatNormalMap'];
  const okImage = (img) => !!img && img.width > 0 && img.height > 0 && (
    (typeof HTMLImageElement !== 'undefined' && img instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement) ||
    (typeof OffscreenCanvas !== 'undefined' && img instanceof OffscreenCanvas) ||
    (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap));
  // копия модели только с тем, что понимает AR Quick Look: стандартные материалы и обычные картинки-текстуры
  function exportable(src, lite) {
    const g = src.clone(true);
    const drop = [];
    g.traverse((o) => {
      if (!o.isMesh) return;
      if (o.isInstancedMesh || o.isSkinnedMesh || !o.geometry || !o.geometry.attributes.position) { drop.push(o); return; }
      const m0 = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m0 || !m0.isMeshStandardMaterial) { drop.push(o); return; }
      const m = m0.clone();
      for (const k of MAPS) {
        const t = m[k];
        if (!t) continue;
        if (t.isCompressedTexture || t.isDataTexture || t.isVideoTexture || !okImage(t.image) || (lite && k !== 'map')) m[k] = null;
      }
      if (lite && m.map && m.map.isCanvasTexture) m.map = null;
      o.material = m;
    });
    drop.forEach((o) => o.parent && o.parent.remove(o));
    g.position.set(0, 0, 0); g.updateMatrixWorld(true);
    return g;
  }
  async function exportUSDZ(group, lite) {
    return new USDZExporter().parseAsync(exportable(group, lite), {
      quickLookCompatible: true, maxTextureSize: lite ? 256 : (isIOS ? 512 : 1024),
      ar: { anchoring: { type: 'plane' }, planeAnchoring: { alignment: 'horizontal' } },
    });
  }
  async function buildUSDZ() {
    const s = ctx.state();
    const key = `${s.line}:${s.volume}:${s.color}`;
    if (usdzCache.has(key)) return usdzCache.get(key);
    const group = ctx.group();
    if (!group) throw new Error('model not ready');
    group.updateMatrixWorld(true);
    let data;
    try { data = await exportUSDZ(group, false); }
    catch (e) { console.warn('USDZ full failed, retry lite', e); data = await exportUSDZ(group, true); }   // запасной вариант: без карт рельефа, текстуры 512
    const url = URL.createObjectURL(new Blob([data], { type: 'model/vnd.usdz+zip' }));
    usdzCache.set(key, url);
    return url;
  }
  function quickLookHref(url) {
    const s = ctx.state();
    const f = new URLSearchParams({ allowsContentScaling: '1', callToAction: 'Позвонить', checkoutTitle: s.title, checkoutSubtitle: 'ИнтеллектКАЗС · ' + PHONE_TXT });
    return url + '#' + f.toString().replace(/\+/g, '%20');
  }
  function launchQuickLook(url) {
    if (!anchor) {
      anchor = document.createElement('a'); anchor.rel = 'ar'; anchor.style.display = 'none';
      anchor.appendChild(document.createElement('img'));
      // нажатие на баннер «Позвонить» внизу экрана AR
      anchor.addEventListener('message', (e) => { if (e.data === '_apple_ar_quicklook_button_tapped') callNow(); }, false);
      root.appendChild(anchor);
    }
    anchor.href = quickLookHref(url);
    anchor.click();
  }
  // ---------- готовые AR-файлы на сервере: kazs-3d/usdz/<линейка>_<объем>_<цвет>.usdz (работают и в Chrome)
  const usdzName = (s) => `${s.line}_${s.volume}_${s.color.replace('#', '').toLowerCase()}`;
  const usdzStatic = (s) => new URL('usdz/' + usdzName(s) + '.usdz', base).href;
  async function staticExists(url) {
    if (packed) return false;
    try { const r = await fetch(url, { method: 'HEAD', cache: 'no-store' }); return r.ok && Number(r.headers.get('content-length') || 1) > 1000; } catch (e) { return false; }
  }
  // собранный файл кладем на сервер, чтобы следующий посетитель (и Chrome) получил его сразу
  async function uploadUSDZ(s, blobUrl) {
    if (packed) return false;
    try {
      const data = await (await fetch(blobUrl)).blob();
      const r = await fetch(new URL('save-usdz.php?k=' + usdzName(s), base).href, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: data });
      const j = await r.json().catch(() => ({}));
      return r.ok && j.ok === true;
    } catch (e) { return false; }
  }
  const chromeLike = /CriOS|FxiOS|EdgiOS|YaBrowser|OPiOS/.test(ua);
  function readyBody(url) {
    body.innerHTML = `<p class="k3-sum">Модель готова. Наведите телефон на ровную площадку и поставьте КАЗС. Двумя пальцами можно уменьшить или увеличить модель. Кнопка «Позвонить» будет внизу экрана.</p>
      <a class="k3-send k3-call" id="k3-ar-go" rel="ar" href="${quickLookHref(url)}"><img alt="" style="display:none">Открыть в AR</a>`;
    const go = body.querySelector('#k3-ar-go');
    go.addEventListener('message', (e) => { if (e.data === '_apple_ar_quicklook_button_tapped') callNow(); }, false);
    go.addEventListener('click', () => setTimeout(close, 300));
  }
  function safariHint() {
    const u = shareUrl({ ar: '1' });
    body.innerHTML = `<p class="k3-sum">Этот вариант модели еще не подготовлен для Chrome. Откройте его в Safari - там AR соберется на месте.</p>
      <a class="k3-send k3-call" href="x-safari-${u}">Открыть в Safari</a>`;
  }
  async function startIOS() {
    const s = ctx.state();
    open('Дополненная реальность', `<p class="k3-sum">Готовим модель для AR…</p><div class="k3-spin" aria-hidden="true"></div>`);
    const st = usdzStatic(s);
    if (await staticExists(st)) { readyBody(st); return; }
    open('Дополненная реальность', `<p class="k3-sum">Готовим модель для AR, это займет 5-20 секунд…</p><div class="k3-spin" aria-hidden="true"></div>`);
    let blobUrl;
    try { blobUrl = await buildUSDZ(); }
    catch (e) {
      console.error(e);
      body.innerHTML = `<p class="k3-err">Не получилось подготовить модель. Обновите страницу и попробуйте еще раз.</p><p class="k3-note">Код ошибки: ${String(e && e.message || e).slice(0, 140).replace(/[<>&]/g, '')}</p>`;
      return;
    }
    const saved = await uploadUSDZ(s, blobUrl);
    if (saved) { readyBody(st); return; }
    if (chromeLike) { safariHint(); return; }
    readyBody(blobUrl);
  }
  // ---------- Android: Scene Viewer
  function startAndroid() {
    if (packed) {
      open('Дополненная реальность', `<p class="k3-sum">В этом превью AR на Android недоступен: Google AR скачивает модель напрямую с сайта. На сайте кнопка откроет модель в камере телефона.</p>`);
      return;
    }
    const s = ctx.state();
    const file = new URL(ctx.file(s.line, s.volume), base).href;
    const back = shareUrl() + '#call';
    const q = `file=${enc(file)}&mode=ar_preferred&resizable=false&title=${enc(s.title)}&link=${enc(back)}`;
    const fallback = `https://arvr.google.com/scene-viewer/1.0?${q}`;
    location.href = `intent://arvr.google.com/scene-viewer/1.0?${q}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${enc(fallback)};end;`;
  }

  // ---------- звонок
  function callNow() {
    try { (window.top || window).location.href = 'tel:' + PHONE_TEL; } catch (e) { location.href = 'tel:' + PHONE_TEL; }
  }
  function showCall() {
    open('ИнтеллектКАЗС', `<p class="k3-sum">Производство контейнерных АЗС. Расскажем про комплектацию, сроки и цену.</p>
      <a class="k3-send k3-call" href="tel:${PHONE_TEL}">Позвонить ${PHONE_TXT}</a>`);
  }

  function start() {
    if (isIOS) return startIOS();
    if (isAndroid) return startAndroid();
    if (mobile) { open('Дополненная реальность', `<p class="k3-sum">Этот браузер не поддерживает AR. Откройте страницу в Safari на iPhone или в Chrome на Android.</p>`); return; }
    showQR();
  }
  btn.addEventListener('click', start);
  btn.title = mobile ? 'Поставить КАЗС на площадку через камеру телефона' : 'Показать QR-код для просмотра в AR с телефона';

  return {
    start, showCall, buildUSDZ, shareUrl, usdzName, uploadUSDZ, staticExists, usdzStatic,
    // параметры из ссылки: ?ar=1 сразу предлагает AR, #call или ?call=1 - карточка звонка
    afterLoad() {
      const p = new URLSearchParams(location.search);
      if (location.hash === '#call' || p.get('call') === '1') showCall();
      else if (p.get('ar') === '1' && mobile) start();
    },
  };
}
