// Анимированный интерфейс АСУ АЗС для экрана платежного терминала
import * as THREE from 'three';

const W = 540, H = 494;
const FONT = '"Onest", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const C = { bg: '#0c1322', panel: '#16213a', line: '#24324f', fg: '#eef3fb', mute: '#8fa0bd', acc: '#2f7cf6', ok: '#23b26d', r95: '#d8262e', b92: '#1f7fd6' };

export function createAsuScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const rr = (x, y, w, h, r, fill, stroke) => {
    g.beginPath(); g.roundRect(x, y, w, h, r);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); }
  };
  const text = (s, x, y, size, color = C.fg, weight = 600, align = 'left') => {
    g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);
  };
  const header = (title, step) => {
    g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    g.fillStyle = C.panel; g.fillRect(0, 0, W, 56);
    text('ИнтеллектКАЗС', 22, 28, 20, C.fg, 700);
    const d = new Date();
    text(d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), W - 22, 28, 18, C.mute, 500, 'right');
    text(title, 22, 96, 28, C.fg, 700);
    if (step) {
      for (let i = 0; i < 5; i++) rr(W - 22 - (5 - i) * 22, 90, 14, 8, 4, i < step ? C.acc : C.line);
    }
  };
  const button = (x, y, w, h, label, sub, active, color = C.acc) => {
    rr(x, y, w, h, 14, active ? color : C.panel, active ? null : C.line);
    text(label, x + w / 2, y + h / 2 - (sub ? 12 : 0), 26, C.fg, 700, 'center');
    if (sub) text(sub, x + w / 2, y + h / 2 + 22, 17, active ? '#e8f0ff' : C.mute, 500, 'center');
  };

  const screens = [
    { dur: 3.2, draw() {
      g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
      const cx = W / 2, cy = 190;
      const cols = ['#27c3e6', '#f6c83b', '#e84fa6', '#1f7fd6', '#f47b29', '#8cc63f'];
      for (let i = 0; i < 6; i++) {
        g.save(); g.translate(cx, cy); g.rotate(i * Math.PI / 3);
        g.fillStyle = cols[i]; g.beginPath(); g.ellipse(0, -46, 16, 40, 0.5, 0, Math.PI * 2); g.fill(); g.restore();
      }
      text('ИнтеллектКАЗС', cx, 316, 34, C.fg, 700, 'center');
      text('Добро пожаловать', cx, 360, 22, C.mute, 500, 'center');
      rr(cx - 140, 400, 280, 58, 29, C.acc);
      text('Коснитесь экрана', cx, 429, 21, C.fg, 600, 'center');
    } },
    { dur: 3.0, draw() {
      header('Выберите колонку', 1);
      button(22, 140, 240, 150, 'ТРК 1', 'свободна', true);
      button(278, 140, 240, 150, 'ТРК 2', 'свободна', false);
      text('Колонка указана на табличке у пистолета', 22, 330, 17, C.mute, 500);
    } },
    { dur: 3.2, draw() {
      header('Выберите топливо', 2);
      button(22, 140, 240, 170, 'АИ-92', '58,40 ₽/л', false, C.b92);
      button(278, 140, 240, 170, 'АИ-95', '63,20 ₽/л', true, C.r95);
      text('ТРК 1', 22, 350, 18, C.mute, 500);
    } },
    { dur: 3.4, draw() {
      header('Сколько заправить?', 3);
      rr(22, 136, W - 44, 92, 14, C.panel, C.line);
      text('2 000 ₽', 44, 182, 40, C.fg, 700);
      text('≈ 31,6 л', W - 44, 182, 22, C.mute, 500, 'right');
      const opts = ['500 ₽', '1 000 ₽', '2 000 ₽', 'Полный бак'];
      opts.forEach((o, i) => { const x = 22 + (i % 2) * 256, y = 248 + Math.floor(i / 2) * 84; button(x, y, 240, 70, o, null, i === 2); });
    } },
    { dur: 3.2, draw(t) {
      header('Оплата', 4);
      const cx = W / 2, cy = 250, pulse = 1 + 0.06 * Math.sin(t * 6);
      g.strokeStyle = C.acc; g.lineWidth = 6; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx - 30, cy, (30 + i * 26) * pulse, -0.8, 0.8); g.stroke(); }
      rr(cx - 120, cy - 60, 70, 110, 10, null, C.fg);
      text('Приложите карту или телефон', cx, 380, 22, C.fg, 600, 'center');
      text('К оплате 2 000 ₽', cx, 420, 19, C.mute, 500, 'center');
    } },
    { dur: 5.0, anim: true, draw(t, p) {
      header('Идет заправка', 5);
      const litres = 31.6 * p, sum = 2000 * p;
      rr(22, 136, W - 44, 190, 16, C.panel, C.line);
      text('АИ-95 · ТРК 1', 44, 172, 20, C.mute, 500);
      text(litres.toFixed(2).replace('.', ',') + ' л', 44, 232, 54, C.fg, 700);
      text(Math.round(sum).toLocaleString('ru-RU') + ' ₽', W - 44, 232, 30, C.fg, 600, 'right');
      rr(44, 284, W - 88, 14, 7, C.line);
      rr(44, 284, Math.max(14, (W - 88) * p), 14, 7, C.ok);
      text('Не отходите от автомобиля', 22, 372, 18, C.mute, 500);
    } },
    { dur: 3.0, draw() {
      header('Спасибо!', 0);
      g.strokeStyle = C.ok; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.arc(W / 2, 220, 64, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(W / 2 - 28, 222); g.lineTo(W / 2 - 6, 244); g.lineTo(W / 2 + 32, 198); g.stroke();
      text('Оплата прошла, возьмите чек', W / 2, 340, 23, C.fg, 600, 'center');
      text('Хорошей дороги', W / 2, 380, 19, C.mute, 500, 'center');
    } },
  ];

  const FADE = 0.35;
  let idx = 0, tIn = 0, settled = false;
  function update(dt) {
    tIn += dt;
    while (tIn > screens[idx].dur) { tIn -= screens[idx].dur; idx = (idx + 1) % screens.length; settled = false; }
    const cur = screens[idx];
    if (settled && !cur.anim && idx !== 4) return;
    cur.draw(tIn, Math.min(1, tIn / (cur.dur * 0.85)));
    if (tIn < FADE) { g.fillStyle = `rgba(12,19,34,${1 - tIn / FADE})`; g.fillRect(0, 0, W, H); }
    else settled = true;
    tex.needsUpdate = true;
  }
  update(0);
  return { texture: tex, update, aspect: W / H };
}
