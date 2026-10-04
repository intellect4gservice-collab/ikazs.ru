// Вертикальный экран АСУ АЗС для терминала S30 Орион (линейка Премиум)
import * as THREE from 'three';

export function createAsuTall(base) {
  const c = document.createElement('canvas'); c.width = 720; c.height = 1280;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const SCREEN_MS = 3800;
  const markImg = new Image(); markImg.src = new URL('tex/logo_mark.png', base).href;
  const CC = { bg: '#0d1a2e', card: '#16284a', card2: '#1d3560', acc: '#2f7bff', ok: '#22c55e', warn: '#f59e0b', tx: '#ffffff', mu: '#9fb3d1' };
  const FF = '"Onest",system-ui,sans-serif';
  const rr = (x, y, w, h, r, fill) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); };
  const txt = (s, x, y, size, color, weight = 500, align = 'left') => { g.font = `${weight} ${size}px ${FF}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); };
  const ring = (x, y, w, h, r) => { g.lineWidth = 4; g.strokeStyle = CC.acc; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); };
  function header(title, step) {
    g.fillStyle = CC.bg; g.fillRect(0, 0, 720, 1280);
    const grd = g.createLinearGradient(0, 0, 0, 420); grd.addColorStop(0, 'rgba(47,123,255,.28)'); grd.addColorStop(1, 'rgba(47,123,255,0)'); g.fillStyle = grd; g.fillRect(0, 0, 720, 420);
    if (markImg.complete && markImg.naturalWidth) g.drawImage(markImg, 40, 36, 64, 64);
    txt('ИнтеллектКАЗС', 118, 80, 30, CC.tx, 700);
    txt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), 680, 80, 30, CC.mu, 500, 'right');
    if (step) for (let i = 0; i < 6; i++) rr(40 + i * 110, 140, 98, 8, 4, i < step ? CC.acc : 'rgba(255,255,255,.14)');
    txt(title, 40, 240, 50, CC.tx, 700);
  }
  const footer = (label) => { rr(40, 1150, 640, 90, 22, CC.acc); txt(label, 360, 1208, 34, '#fff', 600, 'center'); };
  const pumps = [['1', 'Свободна', CC.ok], ['2', 'Заправка', CC.warn]];
  const fuels = [['ДТ', '58,00'], ['АИ-92', '50,00'], ['АИ-95', '54,00']];
  const screens = [
    () => { header('Выберите колонку', 1); txt('Нажмите номер стороны колонки', 40, 300, 26, CC.mu, 400);
      pumps.forEach(([n, st, col], i) => { const x = 40 + i * 330, y = 360; rr(x, y, 310, 300, 28, i === 0 ? CC.card2 : CC.card); if (i === 0) ring(x, y, 310, 300, 28);
        txt(n, x + 155, y + 175, 120, CC.tx, 700, 'center'); rr(x + 75, y + 215, 160, 46, 23, 'rgba(255,255,255,.08)'); txt(st, x + 155, y + 247, 24, col, 600, 'center'); });
      txt('Касса работает круглосуточно', 360, 1100, 24, CC.mu, 400, 'center'); },
    () => { header('Колонка 1 · топливо', 2); txt('Цена за литр', 40, 300, 26, CC.mu, 400);
      fuels.forEach(([f, p], i) => { const y = 340 + i * 170; rr(40, y, 640, 150, 26, i === 2 ? CC.card2 : CC.card); if (i === 2) ring(40, y, 640, 150, 26);
        txt(f, 80, y + 95, 52, CC.tx, 700); txt(p + ' ₽', 640, y + 95, 44, i === 2 ? '#8fb8ff' : CC.mu, 600, 'right'); });
      footer('Далее'); },
    () => { header('Сколько заправить?', 3);
      ['Литры', 'Рубли', 'Полный бак'].forEach((s, i) => { rr(40 + i * 217, 290, 200, 70, 35, i === 0 ? CC.acc : CC.card); txt(s, 140 + i * 217, 336, 26, '#fff', 600, 'center'); });
      rr(40, 400, 640, 190, 28, CC.card); txt('30 л', 360, 510, 96, CC.tx, 700, 'center'); txt('АИ-95 · 1 620,00 ₽', 360, 565, 30, CC.mu, 500, 'center');
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach((k, i) => { const x = 40 + (i % 3) * 217, y = 620 + Math.floor(i / 3) * 128; rr(x, y, 200, 112, 22, k === 'OK' ? CC.acc : CC.card); txt(k, x + 100, y + 74, 44, '#fff', 600, 'center'); }); },
    () => { header('Способ оплаты', 4);
      [['Банковская карта', 'Visa · Mastercard · МИР'], ['СБП по QR-коду', 'Оплата с телефона'], ['Топливная карта', 'Лукойл · Роснефть · Газпромнефть'], ['Наличные', 'Купюроприёмник, сдача на карту']].forEach(([a, b], i) => {
        const y = 300 + i * 190; rr(40, y, 640, 170, 26, i === 0 ? CC.card2 : CC.card); if (i === 0) ring(40, y, 640, 170, 26);
        txt(a, 80, y + 80, 40, CC.tx, 700); txt(b, 80, y + 128, 26, CC.mu, 400); });
      footer('К оплате 1 620,00 ₽'); },
    (t) => { header('Приложите карту', 5); txt('к считывателю под экраном', 40, 300, 30, CC.mu, 400);
      const p = (t / 1000) % 1.6 / 1.6; for (let i = 0; i < 3; i++) { const k = (p + i / 3) % 1; g.beginPath(); g.arc(360, 700, 120 + k * 230, 0, Math.PI * 2); g.strokeStyle = `rgba(47,123,255,${(1 - k) * .7})`; g.lineWidth = 6; g.stroke(); }
      rr(250, 610, 220, 140, 18, CC.acc); rr(250, 640, 220, 26, 0, 'rgba(0,0,0,.35)'); rr(280, 700, 60, 34, 6, '#f5c542');
      txt('1 620,00 ₽', 360, 1060, 64, CC.tx, 700, 'center'); txt('АИ-95 · 30 л · колонка 1', 360, 1110, 28, CC.mu, 400, 'center'); },
    (t) => { header('Идёт заправка', 6); const k = Math.min(1, t / SCREEN_MS); const L = (30 * k).toFixed(2).replace('.', ',');
      g.beginPath(); g.arc(360, 660, 250, Math.PI * 0.75, Math.PI * 2.25); g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 34; g.lineCap = 'round'; g.stroke();
      g.beginPath(); g.arc(360, 660, 250, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * k)); g.strokeStyle = CC.ok; g.stroke();
      txt(L, 360, 670, 120, CC.tx, 700, 'center'); txt('литров из 30', 360, 730, 30, CC.mu, 400, 'center');
      txt((1620 * k).toFixed(2).replace('.', ',') + ' ₽', 360, 1000, 56, CC.tx, 700, 'center'); txt('Колонка 1 · АИ-95', 360, 1050, 28, CC.mu, 400, 'center'); },
    () => { header('Спасибо!', 6); g.beginPath(); g.arc(360, 600, 150, 0, Math.PI * 2); g.fillStyle = 'rgba(34,197,94,.16)'; g.fill();
      g.beginPath(); g.moveTo(290, 600); g.lineTo(345, 655); g.lineTo(440, 545); g.strokeStyle = CC.ok; g.lineWidth = 22; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
      txt('Заправка завершена', 360, 850, 46, CC.tx, 700, 'center'); txt('Заберите чек · 30 л · 1 620,00 ₽', 360, 905, 28, CC.mu, 400, 'center');
      footer('Хорошей дороги'); },
  ];
  let idx = 0, t0 = performance.now(), last = 0;
  function update(now = performance.now()) {
    if (now - last < 60) return; last = now;
    let t = now - t0; if (t > SCREEN_MS) { idx = (idx + 1) % screens.length; t0 = now; t = 0; }
    screens[idx](t);
    const fade = Math.min(1, t / 350); if (fade < 1) { g.fillStyle = `rgba(13,26,46,${1 - fade})`; g.fillRect(0, 0, 720, 1280); }
    tex.needsUpdate = true;
  }
  update();
  return { texture: tex, update };
}
