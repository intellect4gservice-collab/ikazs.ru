// 3D-просмотрщик КАЗС ИнтеллектКАЗС: линейки, автоповорот, вращение и зум, объем 10-20 м³, день/ночь, цвет, заявка
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createAsuScreen } from './asu.js';
import { createAsuTall } from './asu_tall.js';
import { setupAR } from './ar.js';

const root = document.getElementById('kazs3d');
const BASE = new URL(root.dataset.base || './', document.baseURI).href;
const PACKED = root.dataset.pack === 'b64';
// Линейки КАЗС: у каждой свой набор моделей, грузятся лениво только при выборе линейки
const LINES = {
  lux: { name: 'Люкс', volumes: [10, 15, 20], file: (v) => `models/kazs_${v}.glb`, color: '#0b0c0e' },
  // Премиум: КАЗС-25 с металлокассетами (резервуар 5 + 10 + 10 м³), фирменный желтый
  premium: { name: 'Премиум', volumes: [25], file: (v) => `models/kazs_${v}.glb`, color: '#f2a900' },
};
const QS = new URLSearchParams(location.search);   // ссылка из QR-кода: ?line=premium&v=25&c=f2a900&ar=1
let currentLine = LINES[QS.get('line')] ? QS.get('line') : (LINES[root.dataset.line] ? root.dataset.line : 'lux');
const START_VOLUME = LINES[currentLine].volumes.includes(Number(QS.get('v'))) ? Number(QS.get('v'))
  : (LINES[currentLine].volumes.includes(Number(root.dataset.volume)) ? Number(root.dataset.volume) : LINES[currentLine].volumes[0]);
const IDLE_MS = 2000;
const stage = root.querySelector('.k3-stage');
const statusEl = root.querySelector('.k3-status');
const hintEl = root.querySelector('.k3-hint');
const soonEl = root.querySelector('.k3-soon');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
// В песочнице превью fetch() к blob: запрещен - текстуры грузим через <img>
if (PACKED) { try { window.createImageBitmap = undefined; } catch (e) { /* ignore */ } }

async function fetchBinary(path) {
  if (PACKED) {
    const txt = await (await fetch(new URL(path + '.b64.txt', BASE).href)).text();
    return Uint8Array.from(atob(txt.trim()), (c) => c.charCodeAt(0)).buffer;
  }
  const r = await fetch(new URL(path, BASE).href);
  if (!r.ok) throw new Error(path + ': ' + r.status);
  return r.arrayBuffer();
}

// ---------- рендер
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
// Окружение как в детейлинг-студии: светлые стены и длинные световые панели под потолком
function studioEnvironment() {
  const env = new THREE.Scene();
  const wall = new THREE.MeshBasicMaterial({ color: 0x6b7078, side: THREE.BackSide });
  const room = new THREE.Mesh(new THREE.BoxGeometry(44, 16, 44), wall);
  room.position.y = 6; env.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshBasicMaterial({ color: 0x3c4046 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; env.add(floor);
  const strip = new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 7, 7), side: THREE.DoubleSide });
  for (let i = -3; i <= 3; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.9), strip);
    m.rotation.x = Math.PI / 2; m.position.set(0, 13.8, i * 4.2); env.add(m);
  }
  const soft = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.3), side: THREE.DoubleSide });
  for (const [x, z, ry] of [[-21.8, 0, Math.PI / 2], [21.8, 0, -Math.PI / 2], [0, -21.8, 0], [0, 21.8, Math.PI]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(22, 7), soft);
    m.position.set(x, 6, z); m.rotation.y = ry; env.add(m);
  }
  return env;
}
scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 300);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 2.2;
controls.maxDistance = 60;
controls.zoomSpeed = 1.1;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotateSpeed = 1.0;
controls.zoomToCursor = true;
// встраивание через iframe: колесо без Ctrl листает страницу, вертикальный свайп на телефоне тоже
if (self !== top || /[?&]embed/.test(location.search)) {
  renderer.domElement.style.touchAction = 'pan-y';
  document.querySelector('#kazs3d .k3-stage').style.touchAction = 'pan-y';
  const toast = document.createElement('div'); toast.className = 'k3-toast'; toast.textContent = 'Ctrl + колесо мыши — приблизить';
  document.getElementById('kazs3d').appendChild(toast);
  let tt = 0;
  addEventListener('wheel', (e) => { if (e.ctrlKey || e.metaKey) return; e.stopPropagation(); toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 1200); }, { capture: true, passive: true });
  const h = document.querySelector('#kazs3d .k3-hint'); if (h) h.innerHTML = '<b>Тянуть — вращать.</b> Ctrl + колесо или два пальца — приблизить, правая кнопка — сдвиг.';
}

// свет
const hemi = new THREE.HemisphereLight(0xffffff, 0x9a9ea6, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(-7, 13, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun);

// земля с мягким краем
function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 20, 128, 128, 128);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.55, '#fff'); gr.addColorStop(1, '#000');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const groundMat = new THREE.MeshStandardMaterial({ color: 0xd6d8dc, roughness: 0.92, metalness: 0, transparent: true, alphaMap: radialTexture(), depthWrite: false });
const ground = new THREE.Mesh(new THREE.CircleGeometry(20, 96), groundMat);
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.002; ground.receiveShadow = true;   // тень как раньше: прямо на полу
// ловец тени: плотная тень от солнца поверх пола
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.6, transparent: true, depthWrite: false });
const shadowCatcher = new THREE.Mesh(new THREE.CircleGeometry(20, 96), shadowMat);
shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = 0.0005; shadowCatcher.receiveShadow = true;
// ловец тени и контактная тень отключены: тень снова падает на пол естественно
// мягкая контактная тень под основанием
const contactTex = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 256);
  g.filter = 'blur(22px)'; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(56, 56, 400, 144, 72); g.fill();
  return new THREE.CanvasTexture(c);
})();
const contactMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: contactTex, transparent: true, opacity: 0.8, depthWrite: false });
scene.add(ground);

// постобработка: сглаживание (MSAA), затенение углублений (GTAO), свечение ночью
const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
let gtao = null;
if (!coarse) {
  gtao = new GTAOPass(scene, camera, 1, 1);
  gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 16 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  gtao.blendIntensity = 0.85;
  composer.addPass(gtao);
}
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0, 0.3, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- модели
const draco = new DRACOLoader();
draco.setDecoderPath(new URL('vendor/draco/', BASE).href);
const loader = new GLTFLoader();
loader.setDRACOLoader(draco);

const models = {};
const asu = createAsuScreen();
const asuMat = new THREE.MeshStandardMaterial({ map: asu.texture, emissiveMap: asu.texture, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0 });
// ---------- палитра: фриз, косые вставки с логотипом, колонка с терминалом
const PAINT_ROLES = {
  friz: { owners: ['Object025'], mats: ['черный лукой'] },
  vst: { owners: ['Line090', 'Line109'], mats: ['черный лукой'] },
  trk: { owners: ['Box025', 'Box029', 'колонка', 'sber004', 'Tablo_korpus'], mats: ['черный лукой', 'Material #4711', 'Material #4855', 'Tablo_korpus_chernyi'] },
};
const OWNERS = new Map();
for (const [role, r] of Object.entries(PAINT_ROLES)) for (const o of r.owners) OWNERS.set(o, role);
const paintByLine = { lux: root.dataset.color || LINES.lux.color, premium: LINES.premium.color };
if (/^[0-9a-f]{6}$/i.test(QS.get('c') || '')) paintByLine[currentLine] = '#' + QS.get('c').toLowerCase();
let paintHex = paintByLine[currentLine];
const lastVolByLine = {};
const paintMats = [];
function makePaint(role, line = 'lux') {
  const m = role === 'cas'
    // кассеты Премиум: порошковая краска по металлу, полуматовая
    ? new THREE.MeshPhysicalMaterial({ color: new THREE.Color(paintByLine[line]), metalness: 0.05, roughness: 0.34, clearcoat: 0.35, clearcoatRoughness: 0.25 })
    : new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(paintByLine[line]), metalness: 0, roughness: role !== 'trk' ? 0.05 : 0.18,
      clearcoat: 1, clearcoatRoughness: role !== 'trk' ? 0.02 : 0.06,
    });
  m.name = 'paint_' + role; m.userData.line = line; paintMats.push(m); return m;
}
function ownerOf(o) {
  for (let p = o; p; p = p.parent) { if (OWNERS.has(p.name) || p.name === 'Object031') return p.name; }
  return '';
}
function setPaint(hex) {
  paintHex = hex; paintByLine[currentLine] = hex;
  for (const m of paintMats) if (m.userData.line === currentLine) m.color.set(hex);
  drawBackdrop(modeT);
  root.querySelectorAll('.k3-swatch').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.c === hex)));
}
let current = null;
let currentVolume = START_VOLUME;

function classify(name) {
  if (name.startsWith('LED_lenta')) return 'strip';
  if (name.startsWith('LED_svetilnik')) return 'down';
  if (name.startsWith('Logo')) return 'logo';
  if (name.startsWith('Tablo_ekran')) return 'screen';
  if (name.startsWith('Plashka')) return 'plate';
  if (name === 'Стела_цен' || name === 'ТРК_БИУ_экран') return 'board';
  if (name === 'Светильник') return 'lamp';
  return null;
}

async function loadVolume(line, v) {
  const key = line + ':' + v;
  if (models[key]) return models[key];
  const gltf = await loader.parseAsync(await fetchBinary(LINES[line].file(v)), BASE);
  const group = gltf.scene;
  const mats = [];
  const lamps = [];
  if (line === 'premium') return preparePremium(key, group);
  const paints = { friz: makePaint('friz'), vst: makePaint('vst'), trk: makePaint('trk') };
  const screenMeshes = [];
  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true; o.receiveShadow = true;
      const own = ownerOf(o);
      if (own === 'Object031') { o.visible = false; return; }        // кровельный лист выступал полосой из-под фриза
      if (o.name === 'Shape033' || o.parent?.name === 'Shape033') { o.visible = false; return; }   // накладка с бортиком на основании
      if (own === 'sber004' && o.material.name === 'Material #39') screenMeshes.push(o);
      const role = OWNERS.get(own);
      if (role && !Array.isArray(o.material) && PAINT_ROLES[role].mats.includes(o.material.name)) o.material = paints[role];
      if (!Array.isArray(o.material) && o.material.name === 'белый лукой' && !o.material.userData.matte) {
        o.material.color.set(0xeceef0); o.material.roughness = 0.72; o.material.metalness = 0; o.material.userData.matte = true;
      }
      const list = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of list) {
        for (const key of ['map', 'normalMap', 'emissiveMap', 'roughnessMap', 'metalnessMap']) if (m[key]) m[key].anisotropy = maxAniso;
        const kind = classify(m.name || '');
        if (kind && !m.userData.kind) {
          m.userData.kind = kind;
          m.userData.baseEI = m.emissiveIntensity || 1;
          if (m.emissive && m.emissive.getHex() === 0) m.emissive.set(0xffffff);
          mats.push(m);
        }
        if (kind === 'strip' || kind === 'down') o.castShadow = false;
      }
    }
    if (/^Box03[013]$/.test(o.name)) lamps.push(o);
  });
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  group.position.set(-center.x, -box.min.y, -center.z);
  group.updateMatrixWorld(true);
  // экран терминала: плоскость с живым интерфейсом АСУ поверх штатного стекла
  for (const sm of screenMeshes) {
    const bb = new THREE.Box3().setFromObject(sm);
    const w = bb.max.z - bb.min.z, h = bb.max.y - bb.min.y;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), asuMat);
    plane.rotation.y = -Math.PI / 2;
    const c = bb.getCenter(new THREE.Vector3()); c.x = bb.min.x - 0.0015;
    plane.position.copy(group.worldToLocal(c));
    group.add(plane); sm.visible = false;
  }
  const spots = [];
  for (const l of lamps) {
    const p = new THREE.Vector3(); l.getWorldPosition(p);
    const s = new THREE.SpotLight(0xfff2e0, 0, 9, 0.95, 0.7, 1.6);
    s.position.copy(p).add(new THREE.Vector3(0, -0.05, 0));
    s.target.position.copy(p).add(new THREE.Vector3(0, -3, 0));
    scene.add(s.target); scene.add(s); spots.push(s);
  }
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 1.06, size.z * 1.35), contactMat);
  blob.rotation.x = -Math.PI / 2; blob.position.set(center.x, box.min.y + 0.004, center.z); blob.renderOrder = 1;
  group.visible = false;
  scene.add(group);
  models[key] = { group, mats, spots, size };
  applyMode(modeT, models[key]);
  return models[key];
}

// ---------- линейка Премиум (КАЗС-25): желтые кассеты, логотипы и табло из PNG, вертикальный экран АСУ на терминале
const PREMIUM_PAINT = ['Кассета_жёлтая RAL1003', 'ТРК_боковины_жёлтые', 'Корпус_краска'];
// [файл, вырезка по альфе, свечение]
const PREMIUM_TEX = { 'Логотип': ['tex/logo_dark.png', true, false], 'Логотип_строка': ['tex/logo_line.png', true, false],
  'Стела_цен': ['tex/price_board.png', false, true], 'ТРК_БИУ_экран': ['tex/trk_biu.png', false, true],
  'Табличка': ['tex/sign.png', false, false] };
let asuTall = null;
function preparePremium(key, group) {
  const mats = [], lampMeshes = [];
  const paint = makePaint('cas', 'premium');
  const tl = new THREE.TextureLoader();
  let glass = null;
  group.traverse((o) => {
    if (!glass && o.name && /^Стекло.сенс/.test(o.name)) glass = o;
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (Array.isArray(o.material)) return;
    let m = o.material;
    if (PREMIUM_PAINT.includes(m.name)) { o.material = paint; return; }
    if (m.map) m.map.anisotropy = maxAniso;
    const spec = PREMIUM_TEX[m.name];
    if (spec && !m.userData.texed) {
      const t = tl.load(new URL(spec[0], BASE).href); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
      m.map = t; m.color.set(0xffffff); m.userData.texed = true;
      if (spec[1]) { m.transparent = false; m.alphaTest = 0.4; m.depthWrite = true; m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; }
      else if (spec[2]) { m.emissiveMap = t; m.emissive.set(0xffffff); }
      m.needsUpdate = true;
    }
    if (spec && spec[1]) o.castShadow = false;
    const kind = classify(m.name || '');
    if (kind === 'lamp') { lampMeshes.push(o); o.castShadow = false; }
    if (kind && !m.userData.kind) {
      m.userData.kind = kind; m.userData.baseEI = m.emissiveIntensity || 1;
      if (m.emissive && m.emissive.getHex() === 0) m.emissive.set(0xffffff);
      mats.push(m);
    }
  });
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  group.position.set(-center.x, -box.min.y, -center.z);
  group.updateMatrixWorld(true);
  const wbox = new THREE.Box3().setFromObject(group);
  // экран терминала (смотрит в торец со стороны островка)
  if (glass) {
    if (!asuTall) asuTall = createAsuTall(BASE);
    const bb = new THREE.Box3().setFromObject(glass), c = bb.getCenter(new THREE.Vector3());
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.398 * 0.955, 0.708 * 0.955),
      new THREE.MeshBasicMaterial({ map: asuTall.texture, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    scr.rotation.y = -Math.PI / 2; c.x = bb.min.x - 0.003;
    scr.position.copy(group.worldToLocal(c)); scr.renderOrder = 2; group.add(scr);
  }
  // три светильника навеса: над терминалом и по обе стороны ТРК
  const spots = [];
  for (const l of lampMeshes) {
    const c = new THREE.Box3().setFromObject(l).getCenter(new THREE.Vector3());
    if (c.x > wbox.min.x + 2.6 || c.y < 1.8) continue;
    const s = new THREE.SpotLight(0xfff2e0, 0, 7, Math.PI / 2.6, 0.6, 1.4);
    s.position.copy(c).add(new THREE.Vector3(0, -0.03, 0));
    s.target.position.copy(c).add(new THREE.Vector3(0, -3, 0));
    scene.add(s.target); scene.add(s); spots.push(s);
  }
  group.visible = false;
  scene.add(group);
  models[key] = { group, mats, spots, size };
  applyMode(modeT, models[key]);
  return models[key];
}

// ---------- день / ночь
let modeT = 0, modeTarget = 0;
const C = (h) => new THREE.Color(h);
const DAY = { bg: C(0xe7e9ec), ground: C(0xd3d5d9), sun: C(0xffffff) };
const NIGHT = { bg: C(0x1a2130), ground: C(0x2a3140), sun: C(0xa9bce6) };
const lerp = (a, b, t) => a + (b - a) * t;
// ---------- студийный фон: градиент, виньетка и свечение в цвет КАЗС
const bgCanvas = document.createElement('canvas'); bgCanvas.width = 768; bgCanvas.height = 512;
const bgTex = new THREE.CanvasTexture(bgCanvas); bgTex.colorSpace = THREE.SRGBColorSpace;
scene.background = bgTex;
const BG = {
  day: { top: C(0xc9ced6), mid: C(0xeceef2), bot: C(0xd2d5db), floor: C(0xd0d3d9), glowA: 0.42, vig: 0.26 },
  night: { top: C(0x04060b), mid: C(0x0f1420), bot: C(0x05070c), floor: C(0x0c1018), glowA: 0.6, vig: 0.62 },
};
function glowOf(hex) {
  const c = new THREE.Color(hex), h = {}; c.getHSL(h);
  return new THREE.Color().setHSL(h.h, Math.min(1, h.s * 1.15), THREE.MathUtils.clamp(h.l, 0.42, 0.62));
}
const rgba = (c, a) => { const o = {}; c.getRGB(o, THREE.SRGBColorSpace); return `rgba(${Math.round(o.r * 255)},${Math.round(o.g * 255)},${Math.round(o.b * 255)},${a})`; };
const mixC = (a, b, t) => a.clone().lerp(b, t);
function drawBackdrop(t) {
  const g = bgCanvas.getContext('2d'), W = bgCanvas.width, H = bgCanvas.height;
  const D = BG.day, N = BG.night, glow = glowOf(paintHex);
  const lin = g.createLinearGradient(0, 0, 0, H);
  lin.addColorStop(0, rgba(mixC(D.top, N.top, t), 1));
  lin.addColorStop(0.58, rgba(mixC(D.mid, N.mid, t), 1));
  lin.addColorStop(1, rgba(mixC(D.bot, N.bot, t), 1));
  g.fillStyle = lin; g.fillRect(0, 0, W, H);
  const ga = lerp(D.glowA, N.glowA, t);
  let r = g.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, W * 0.46);
  r.addColorStop(0, rgba(glow, ga)); r.addColorStop(0.55, rgba(glow, ga * 0.35)); r.addColorStop(1, rgba(glow, 0));
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  r = g.createRadialGradient(W / 2, H * 0.9, 0, W / 2, H * 0.9, W * 0.42);
  r.addColorStop(0, rgba(glow, ga * 0.35)); r.addColorStop(1, rgba(glow, 0));
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  r = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(0,0,0,${lerp(D.vig, N.vig, t)})`);
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  bgTex.needsUpdate = true;
  groundMat.color.copy(mixC(D.floor, N.floor, t)).lerp(glow, lerp(0.06, 0.1, t));
}
drawBackdrop(0);

function applyMode(t, only) {
  drawBackdrop(t);
  shadowMat.opacity = lerp(0.8, 0.5, t);
  asuMat.emissiveIntensity = lerp(0.9, 1.6, t);
  renderer.toneMappingExposure = lerp(1.0, 0.95, t);
  scene.environmentIntensity = lerp(1.0, 0.22, t);
  hemi.intensity = lerp(0.9, 0.35, t);
  sun.intensity = lerp(1.7, 0.5, t);
  sun.color.copy(DAY.sun).lerp(NIGHT.sun, t);
  bloom.strength = lerp(0, 0.5, t);
  const list = only ? [only] : Object.values(models);
  for (const m of list) {
    for (const mat of m.mats) {
      const k = mat.userData.kind, b = mat.userData.baseEI;
      const f = k === 'strip' ? lerp(0, 0.6, t)
        : k === 'down' ? lerp(0.05, 0.7, t)
        : k === 'logo' ? lerp(0.35, 1.1, t)
        : k === 'screen' ? lerp(0.8, 5.5, t)
        : k === 'board' ? lerp(1.0, 1.4, t)
        : k === 'lamp' ? lerp(0.8, 1.6, t)
        : lerp(0.25, 1.1, t);
      mat.emissiveIntensity = b * f;
    }
    m.spots.forEach((s) => { s.intensity = lerp(0, 12, t); s.visible = m === current && t > 0.001; });
  }
  root.dataset.mode = t > 0.5 ? 'night' : 'day';
}

// ---------- камера: исходный вид с уровня глаз человека, кадрирование, возврат после бездействия
const EYE = 1.7;                                   // высота глаз, м
const TARGET_HOME = new THREE.Vector3(0, 1.35, 0);
const AZ_HOME = -Math.PI / 4;
let distHome = 16;
let returning = true;
let lastInteraction = -Infinity;
let userTouched = false;

function frameFor(m) {
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  const span = Math.hypot(m.size.x, m.size.z);
  const dH = (span / 2) / Math.tan(fovH / 2) + m.size.z * 0.6;
  const dV = (m.size.y * 1.35) / Math.tan(fovV / 2);
  distHome = THREE.MathUtils.clamp(Math.max(dH, dV), 6, controls.maxDistance);
}
function placeCameraHome() {
  controls.target.copy(TARGET_HOME);
  camera.position.set(TARGET_HOME.x + distHome * Math.sin(AZ_HOME), EYE, TARGET_HOME.z + distHome * Math.cos(AZ_HOME));
  controls.update();
}

async function showVolume(v, line = currentLine) {
  currentVolume = v; currentLine = line; lastVolByLine[line] = v;
  root.dataset.line = line;
  root.querySelectorAll('.k3-vol').forEach((b) => {
    b.hidden = !LINES[line].volumes.includes(Number(b.dataset.v));
    b.setAttribute('aria-checked', String(Number(b.dataset.v) === v));
  });
  {
    paintHex = paintByLine[line];
    root.querySelectorAll('.k3-swatch').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.c === paintHex)));
    drawBackdrop(modeT);
  }
  root.querySelectorAll('.k3-line').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.line === line)));
  const L = LINES[line];
  if (!L.file) {                       // модели линейки еще нет - показываем заглушку
    if (current) { current.group.visible = false; current.spots.forEach((s) => { s.visible = false; }); current = null; }
    shadowCatcher.visible = false; if (gtao) gtao.enabled = false;
    soonEl.querySelector('b').textContent = 'КАЗС ' + L.name;
    soonEl.hidden = false; setStatus('');
    return;
  }
  soonEl.hidden = true;
  shadowCatcher.visible = true; if (gtao) gtao.enabled = true;
  const key = line + ':' + v;
  let m = models[key];
  if (!m) { setStatus('Загружаем модель…'); m = await loadVolume(line, v); setStatus(''); }
  if (currentVolume !== v || currentLine !== line) return;
  if (current) current.group.visible = false;
  m.group.visible = true;
  current = m;
  applyMode(modeT);
  frameFor(m);
  returning = true;          // плавно подстраиваем кадр под новую длину
}
function setStatus(t) { statusEl.textContent = t; statusEl.hidden = !t; }

// ---------- цикл и видимость
let running = false;
const clock = new THREE.Clock();
const sph = new THREE.Spherical();
function tick() {
  if (!running) return;
  requestAnimationFrame(tick);
  const rawDt = clock.getDelta();
  const dt = Math.min(rawDt, 0.05);
  const now = performance.now();
  asu.update(Math.min(rawDt, 1));
  if (asuTall && currentLine === 'premium') asuTall.update(now);
  if (Math.abs(modeT - modeTarget) > 0.0005) {
    modeT += Math.sign(modeTarget - modeT) * Math.min(Math.abs(modeTarget - modeT), dt * 1.4);
    applyMode(modeT);
  }
  if (!returning && userTouched && now - lastInteraction > IDLE_MS && !controlsActive) {
    returning = true;
  }
  if (returning) {
    controls.autoRotate = true;
    const k = 1 - Math.pow(0.001, dt * 0.45);
    controls.target.lerp(TARGET_HOME, k);
    const off = camera.position.clone().sub(controls.target);
    const rh = Math.hypot(off.x, off.z) || 0.001;
    const nrh = lerp(rh, distHome, k);
    const ny = lerp(camera.position.y, EYE, k);
    camera.position.set(controls.target.x + off.x / rh * nrh, ny, controls.target.z + off.z / rh * nrh);
    if (Math.abs(nrh - distHome) < 0.02 && Math.abs(ny - EYE) < 0.01 && controls.target.distanceTo(TARGET_HOME) < 0.01) returning = false;
  }
  controls.update(dt);
  composer.render();
}
function start() { if (!running) { running = true; clock.getDelta(); tick(); } }
function stop() { running = false; }

let controlsActive = false;
controls.addEventListener('start', () => {
  controlsActive = true; returning = false; controls.autoRotate = false;
  if (!userTouched) { userTouched = true; hintEl.classList.add('is-gone'); }
  lastInteraction = performance.now();
});
controls.addEventListener('end', () => { controlsActive = false; lastInteraction = performance.now(); });
renderer.domElement.addEventListener('wheel', () => { lastInteraction = performance.now(); }, { passive: true });

new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) start(); else stop();
}, { threshold: 0.2 }).observe(root);

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  if (current) { frameFor(current); if (!userTouched) returning = true; }
}
new ResizeObserver(resize).observe(stage);

// ---------- UI
root.querySelectorAll('.k3-vol').forEach((b) => b.addEventListener('click', () => showVolume(Number(b.dataset.v))));
function preloadLine(line) {
  const L = LINES[line];
  if (L.file) for (const v of L.volumes) loadVolume(line, v).catch(() => {});
}
root.querySelectorAll('.k3-line').forEach((b) => b.addEventListener('click', async () => {
  const line = b.dataset.line;
  if (line === currentLine) return;
  const vols = LINES[line].volumes;
  await showVolume(lastVolByLine[line] || (vols.includes(currentVolume) ? currentVolume : vols[0]), line);
  preloadLine(line);
}));
root.querySelectorAll('.k3-swatch').forEach((b) => b.addEventListener('click', () => setPaint(b.dataset.c)));
const modeBtn = root.querySelector('.k3-mode');
modeBtn.addEventListener('click', () => {
  modeTarget = modeTarget > 0.5 ? 0 : 1;
  modeBtn.setAttribute('aria-pressed', String(modeTarget === 1));
  modeBtn.querySelector('.k3-mode-label').textContent = modeTarget === 1 ? 'Ночь' : 'День';
  if (reduceMotion) { modeT = modeTarget; applyMode(modeT); }
  start();
});

// ---------- дополненная реальность
const ar = setupAR({
  root, base: BASE, packed: PACKED, controls,
  state: () => ({ line: currentLine, volume: currentVolume, color: paintHex,
    title: `КАЗС ${LINES[currentLine].name}, ${currentVolume} м³` }),
  group: () => (current ? current.group : null),
  file: (line, v) => LINES[line].file(v),
});
window.k3AR = ar;
root.k3ar = ar;

// ---------- старт
(async () => {
  try {
    resize();
    setStatus('Загружаем модель…');
    await showVolume(START_VOLUME, currentLine);
    setStatus('');
    frameFor(current); placeCameraHome();
    preloadLine(currentLine);
    ar.afterLoad();
  } catch (e) {
    console.error(e);
    setStatus('Не удалось загрузить 3D-модель. Обновите страницу.');
  }
})();

// ---------- заявка
(() => {
  const modal = root.querySelector('.k3-modal');
  const form = root.querySelector('#k3-form');
  const done = root.querySelector('.k3-done');
  const err = root.querySelector('#k3-err');
  const sendBtn = root.querySelector('#k3-send');
  const ORDER_URL = root.dataset.orderUrl || '../3d/terminals/order.php';
  const DEMO = root.dataset.order === 'demo';
  let openedAt = 0;
  const colorName = () => root.querySelector('.k3-swatch[aria-checked="true"]')?.getAttribute('aria-label') || paintHex;
  const summary = () => `КАЗС ${LINES[currentLine].name}, ${currentVolume} м³${currentLine === 'premium' ? ' (5 + 10 + 10)' : ''}, цвет: ${colorName()}`;
  function open() {
    root.querySelector('#k3-sum').textContent = summary();
    form.hidden = false; done.hidden = true; err.hidden = true;
    modal.hidden = false; openedAt = performance.now();
    controls.enabled = false;
    setTimeout(() => root.querySelector('#k3-name').focus(), 50);
  }
  function close() { modal.hidden = true; controls.enabled = true; }
  root.querySelector('#k3-order').addEventListener('click', open);
  root.querySelectorAll('.k3-x').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const showErr = (t) => { err.textContent = t; err.hidden = false; };
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); err.hidden = true;
    const name = form.name.value.trim(), phone = form.phone.value.trim(), email = form.email.value.trim();
    if (name.length < 2) return showErr('Укажите ФИО.');
    if (phone.replace(/\D/g, '').length < 10) return showErr('Укажите телефон полностью, например +7 921 000-00-00.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr('Проверьте адрес почты.');
    if (!form.agree.checked) return showErr('Нужно согласие на обработку персональных данных.');
    sendBtn.disabled = true; sendBtn.textContent = 'Отправляем…';
    if (form.website.value) { form.reset(); form.hidden = true; done.hidden = false; sendBtn.disabled = false; sendBtn.textContent = 'Отправить'; return; }
    const model = 'КАЗС ' + LINES[currentLine].name + ', ' + currentVolume + ' м³', color = colorName();
    const site = document.referrer || location.href;
    try {
      if (DEMO) {
        await new Promise((r) => setTimeout(r, 700));
        root.querySelector('#k3-done-note').textContent = 'Это демо-страница: здесь заявка никуда не уходит. На сайте она придет на почту и в Telegram.';
      } else {
        // 1) общий обработчик витрины терминалов: Телеграм + почта, те же ключи на сервере
        let ok = false;
        try {
          const r1 = await fetch(new URL(ORDER_URL, BASE).href, { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind: 'kazs', name, phone, email, model, color, partner: '', site, _honey: '' }) });
          const j1 = await r1.json().catch(() => ({})); ok = r1.ok && j1.success === true;
          if (r1.status === 422) throw new Error('Проверьте ФИО и контакты.');
          if (r1.status === 429) throw new Error('Слишком много заявок подряд. Попробуйте через 10 минут.');
        } catch (e) { if (e.message && e.message.length > 12) throw e; }
        // 2) запасной канал: FormSubmit на почту
        if (!ok) {
          const r = await fetch('https://formsubmit.co/ajax/intellect4gservice@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ 'ФИО': name, 'Телефон': phone, 'Почта': email, 'Модель': model, 'Цвет': color, 'Страница': site,
              _subject: 'Заявка на КАЗС ' + model + ' - ' + name, _template: 'table', _captcha: 'false', _replyto: email }) });
          const j = await r.json().catch(() => ({}));
          if (!(r.ok && (j.success === true || j.success === 'true'))) throw new Error('send');
        }
        root.querySelector('#k3-done-note').textContent = 'Мы свяжемся с вами в ближайшее рабочее время.';
      }
      form.reset(); form.hidden = true; done.hidden = false;
    } catch (ex) {
      if (ex.message && ex.message !== 'send' && ex.message.length > 12) { showErr(ex.message); return; }
      showErr('Не получилось отправить. Позвоните нам: +7 921 382-29-62 или напишите на intellect4gservice@gmail.com.');
    } finally { sendBtn.disabled = false; sendBtn.textContent = 'Отправить'; }
  });
})();
