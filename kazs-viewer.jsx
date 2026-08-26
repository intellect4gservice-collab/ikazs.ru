const { useEffect, useRef, useState } = React;

// ============================================================
// КАЗС-25 «Татнефть» — интерактивная 3D-сцена (чертёж 7МЗ-25-120)
// Логотипы — плейсхолдеры: заменить официальными SVG при публикации
// ============================================================

const mm = (v) => v / 1000;
const GREEN = '#169c3f', GREEN_L = '#86c440', GREEN_D = '#0a6e30', RED = '#e31e24';

function KazsViewer() {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const [time, setTime] = useState('day');
  const [weather, setWeather] = useState('sun');
  const [view, setView] = useState('iso');
  const [layers, setLayers] = useState({ clad: true, roof: true, rail: true });
  const [shutterOpen, setShutterOpen] = useState(false);
  const [ext, setExt] = useState(false);
  const [tankerBusy, setTankerBusy] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- габариты ----------
    const L = mm(11445), W = mm(2400);
    const baseH = mm(210), wallH = mm(2650);
    const deckH = baseH + wallH, railH = mm(1050);
    const xL = -L / 2;
    const dispLen = mm(2600), techLen = mm(1250);
    const partX = xL + dispLen;
    const tankZoneX0 = partX + techLen;
    const tankZoneLen = L - dispLen - techLen;
    const capK = 0.30, tankR = mm(1050);
    const tankLen = tankZoneLen - mm(400) - 2 * capK * tankR;
    const tankX = tankZoneX0 + tankZoneLen / 2;
    const tankAxisY = baseH + wallH / 2;
    const techX = partX + techLen / 2;

    // ---------- рендер ----------
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x5d88ad, 28, 115);
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 400);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x55606a, 0.5);
    scene.add(hemi);
    const sunL = new THREE.DirectionalLight(0xffe9c4, 1.55);
    sunL.position.set(-12, 16, 10);
    sunL.castShadow = true;
    sunL.shadow.mapSize.set(2048, 2048);
    sunL.shadow.bias = -0.0004;
    const sd = 15;
    Object.assign(sunL.shadow.camera, { left: -sd, right: sd, top: sd, bottom: -sd, near: 0.5, far: 70 });
    scene.add(sunL);
    const fill = new THREE.DirectionalLight(0xbcd4ee, 0.22);
    fill.position.set(10, 6, -10);
    scene.add(fill);

    function envFace(top, bottom) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, top); gr.addColorStop(1, bottom);
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      return c;
    }
    const envTex = new THREE.CubeTexture([
      envFace('#a8d4f5', '#7c93a6'), envFace('#a8d4f5', '#7c93a6'),
      envFace('#dff0ff', '#bcd8f0'), envFace('#5a6066', '#3d4248'),
      envFace('#a8d4f5', '#7c93a6'), envFace('#a8d4f5', '#7c93a6'),
    ]);
    envTex.needsUpdate = true;

    // ---------- текстуры ----------
    function tex(w, h, draw) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); draw(g, w, h);
      const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
    }
    function flame(g, cx, cy, s) {
      g.save();
      g.fillStyle = GREEN_L;
      g.beginPath();
      g.moveTo(cx - 2 * s, cy - 86 * s);
      g.bezierCurveTo(cx - 30 * s, cy - 58 * s, cx - 40 * s, cy - 30 * s, cx - 30 * s, cy - 6 * s);
      g.bezierCurveTo(cx - 24 * s, cy + 9 * s, cx - 26 * s, cy + 22 * s, cx - 38 * s, cy + 34 * s);
      g.bezierCurveTo(cx - 18 * s, cy + 28 * s, cx - 8 * s, cy + 12 * s, cx - 12 * s, cy - 8 * s);
      g.bezierCurveTo(cx - 15 * s, cy - 36 * s, cx - 8 * s, cy - 62 * s, cx - 2 * s, cy - 86 * s);
      g.fill();
      g.fillStyle = RED;
      g.beginPath();
      g.moveTo(cx + 16 * s, cy - 64 * s);
      g.bezierCurveTo(cx - 8 * s, cy - 38 * s, cx - 16 * s, cy - 12 * s, cx - 6 * s, cy + 12 * s);
      g.bezierCurveTo(cx + 0 * s, cy + 27 * s, cx - 2 * s, cy + 42 * s, cx - 14 * s, cy + 56 * s);
      g.bezierCurveTo(cx + 10 * s, cy + 48 * s, cx + 22 * s, cy + 28 * s, cx + 16 * s, cy + 6 * s);
      g.bezierCurveTo(cx + 10 * s, cy - 22 * s, cx + 14 * s, cy - 44 * s, cx + 16 * s, cy - 64 * s);
      g.fill();
      g.restore();
    }
    function logoText(g, cx, cy, size) {
      g.font = '700 ' + size + 'px Arial'; g.textBaseline = 'middle';
      g.textAlign = 'right'; g.fillStyle = RED; g.fillText('ТАТ', cx + size * 0.05, cy);
      g.textAlign = 'left'; g.fillStyle = GREEN; g.fillText('НЕФТЬ', cx + size * 0.08, cy);
    }
    function wave(g, w, h) {
      const grad = g.createLinearGradient(0, h * 0.2, 0, h);
      grad.addColorStop(0, GREEN_L); grad.addColorStop(1, GREEN_D);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(0, h * 0.20);
      g.bezierCurveTo(w * 0.18, h * 0.06, w * 0.30, h * 0.88, w * 0.50, h * 0.88);
      g.bezierCurveTo(w * 0.70, h * 0.88, w * 0.82, h * 0.06, w, h * 0.20);
      g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 5;
      g.beginPath();
      g.moveTo(0, h * 0.20);
      g.bezierCurveTo(w * 0.18, h * 0.06, w * 0.30, h * 0.88, w * 0.50, h * 0.88);
      g.bezierCurveTo(w * 0.70, h * 0.88, w * 0.82, h * 0.06, w, h * 0.20);
      g.stroke();
    }
    const fasciaTex = tex(4096, 256, (g, w, h) => {
      g.fillStyle = '#fbfcfb'; g.fillRect(0, 0, w, h);
      wave(g, w, h); flame(g, w * 0.5 - 240, h * 0.42, 1.0); logoText(g, w * 0.5, h * 0.38, 96);
    });
    const fasciaEndTex = tex(1024, 256, (g, w, h) => {
      g.fillStyle = '#fbfcfb'; g.fillRect(0, 0, w, h);
      wave(g, w, h); flame(g, w * 0.5 - 195, h * 0.42, 0.9); logoText(g, w * 0.5 + 8, h * 0.38, 84);
    });
    // продолжение фриза для доп. отсека: белый верх + зелёный низ (стык с краем волны)
    const extFasciaTex = tex(512, 256, (g, w, h) => {
      g.fillStyle = '#fbfcfb'; g.fillRect(0, 0, w, h);
      const grad = g.createLinearGradient(0, h * 0.2, 0, h);
      grad.addColorStop(0, GREEN_L); grad.addColorStop(1, GREEN_D);
      g.fillStyle = grad; g.fillRect(0, h * 0.20, w, h * 0.80);
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(0, h * 0.20); g.lineTo(w, h * 0.20); g.stroke();
    });
    const priceTex = tex(1024, 224, (g, w, h) => {
      g.fillStyle = GREEN_D; g.fillRect(0, 0, w, h);
      const cell = w / 3;
      [['ДТ', '72.50'], ['92', '59.80'], ['95', '64.90']].forEach((it, i) => {
        const x0 = cell * i + 14;
        g.fillStyle = '#0b0c0d'; g.fillRect(x0, 18, cell - 28, h - 36);
        g.font = '700 56px Arial'; g.textAlign = 'left'; g.textBaseline = 'middle';
        g.fillStyle = RED; g.fillText(it[0], x0 + 20, h / 2);
        g.font = '700 80px Consolas, monospace'; g.fillStyle = '#fff';
        g.fillText(it[1], x0 + 118, h / 2);
      });
    });
    const trkDispTex = tex(512, 300, (g, w, h) => {
      g.fillStyle = '#111417'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#2a2f34'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
      [['СУММА', '1450.00'], ['ЛИТРЫ', '20.00'], ['ЦЕНА', '72.50']].forEach((t, i) => {
        const y = 40 + i * 86;
        g.fillStyle = '#1d2a1f'; g.fillRect(40, y, 300, 58);
        g.fillStyle = '#74e08a'; g.font = '700 44px Consolas, monospace';
        g.textAlign = 'right'; g.fillText(t[1], 330, y + 42);
        g.fillStyle = '#cfd6dc'; g.font = '600 26px Arial'; g.textAlign = 'left';
        g.fillText(t[0], 360, y + 40);
      });
    });
    const trkPanelTex = tex(256, 400, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, GREEN_L); grad.addColorStop(1, GREEN);
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
      flame(g, w - 44, 44, 0.42);
      g.font = '700 20px Arial'; g.textAlign = 'right'; g.fillStyle = '#fff';
      g.fillText('ТАТНЕФТЬ', w - 78, 50);
      g.font = '800 210px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('8', w / 2, h * 0.62);
    });
    const termScreenTex = tex(256, 500, (g, w, h) => {
      g.fillStyle = '#f4f6f8'; g.fillRect(0, 0, w, h);
      g.fillStyle = GREEN; g.fillRect(0, 0, w, 54);
      flame(g, 26, 27, 0.30);
      g.font = '700 22px Arial'; g.fillStyle = '#fff'; g.textAlign = 'left';
      g.fillText('ТАТНЕФТЬ · ОПЛАТА', 50, 35);
      g.fillStyle = '#dfe5ea';
      for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) g.fillRect(14 + c * 58, 80 + r * 44, 48, 32);
    });
    const aluTex = tex(256, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#c4c9cf'); gr.addColorStop(1, '#a7adb4');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const cell = 32;
      for (let iy = 0; iy < h / cell; iy++) for (let ix = 0; ix < w / cell; ix++) {
        g.save();
        g.translate(ix * cell + cell / 2, iy * cell + cell / 2);
        g.rotate(((ix + iy) % 2 ? 1 : -1) * Math.PI / 4);
        g.fillStyle = '#e1e6ea'; g.fillRect(-11, -3.5, 22, 7);
        g.strokeStyle = '#8d949b'; g.lineWidth = 1.5; g.strokeRect(-11, -3.5, 22, 7);
        g.restore();
      }
    });
    aluTex.wrapS = aluTex.wrapT = THREE.RepeatWrapping; aluTex.repeat.set(9, 8);
    // телефон на бортах
    const phoneTex = tex(2048, 256, (g, w, h) => {
      g.fillStyle = '#f4f5f6'; g.fillRect(0, 0, w, h);
      g.font = '700 148px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#23282e';
      g.fillText('8 (812) 219 34 85', w / 2, h / 2 + 6);
    });
    const tankerLogoTex = tex(512, 160, (g, w, h) => {
      g.fillStyle = '#f6f8f7'; g.fillRect(0, 0, w, h);
      flame(g, w * 0.5 - 150, h * 0.52, 0.7); logoText(g, w * 0.5 + 6, h * 0.5, 64);
    });

    // ---------- материалы ----------
    const M = {
      white: new THREE.MeshStandardMaterial({ color: 0xeef0f2, metalness: .45, roughness: .2 }),
      seam: new THREE.MeshStandardMaterial({ color: 0xc6cbd0, metalness: .45, roughness: .35 }),
      roof: new THREE.MeshStandardMaterial({ color: 0x868d95, metalness: .55, roughness: .3 }),
      fasciaSide: new THREE.MeshStandardMaterial({ map: fasciaTex, metalness: .25, roughness: .2, emissive: 0xffffff, emissiveMap: fasciaTex, emissiveIntensity: 0 }),
      fasciaEnd: new THREE.MeshStandardMaterial({ map: fasciaEndTex, metalness: .25, roughness: .2, emissive: 0xffffff, emissiveMap: fasciaEndTex, emissiveIntensity: 0 }),
      fasciaExt: new THREE.MeshStandardMaterial({ map: extFasciaTex, metalness: .25, roughness: .2, emissive: 0xffffff, emissiveMap: extFasciaTex, emissiveIntensity: 0 }),
      fasciaPlain: new THREE.MeshStandardMaterial({ color: 0xf6f8f7, metalness: .35, roughness: .22 }),
      price: new THREE.MeshStandardMaterial({ map: priceTex, metalness: .15, roughness: .22, emissive: 0xffffff, emissiveMap: priceTex, emissiveIntensity: 0 }),
      deckFloor: new THREE.MeshStandardMaterial({ color: 0x81878f, metalness: .5, roughness: .45 }),
      alu: new THREE.MeshStandardMaterial({ map: aluTex, metalness: .9, roughness: .25 }),
      baseDark: new THREE.MeshStandardMaterial({ color: 0x1c1f24, metalness: .45, roughness: .55 }),
      baseGreen: new THREE.MeshStandardMaterial({ color: 0x0c6e33, metalness: .55, roughness: .25 }),
      railM: new THREE.MeshStandardMaterial({ color: 0xa6aeb7, metalness: .95, roughness: .18 }),
      tank: new THREE.MeshStandardMaterial({ color: 0xe9ecef, metalness: .6, roughness: .18 }),
      tankIn: new THREE.MeshStandardMaterial({ color: 0xd6dbe0, metalness: .2, roughness: .55, side: THREE.DoubleSide }),
      steel: new THREE.MeshStandardMaterial({ color: 0x444b54, metalness: .65, roughness: .4 }),
      redEq: new THREE.MeshStandardMaterial({ color: 0xc11f15, metalness: .5, roughness: .22 }),
      black: new THREE.MeshStandardMaterial({ color: 0x16191d, metalness: .45, roughness: .35 }),
      darkGrey: new THREE.MeshStandardMaterial({ color: 0x34393f, metalness: .45, roughness: .35 }),
      midGrey: new THREE.MeshStandardMaterial({ color: 0x60676f, metalness: .45, roughness: .35 }),
      screen: new THREE.MeshStandardMaterial({ map: termScreenTex, metalness: .2, roughness: .15, emissive: 0xffffff, emissiveMap: termScreenTex, emissiveIntensity: 0 }),
      trkDisp: new THREE.MeshStandardMaterial({ map: trkDispTex, metalness: .2, roughness: .18, emissive: 0xffffff, emissiveMap: trkDispTex, emissiveIntensity: 0 }),
      trkPanel: new THREE.MeshStandardMaterial({ map: trkPanelTex, metalness: .2, roughness: .2, emissive: 0xffffff, emissiveMap: trkPanelTex, emissiveIntensity: 0 }),
      cabWhite: new THREE.MeshStandardMaterial({ color: 0xf2f4f6, metalness: .4, roughness: .18 }),
      greenEq: new THREE.MeshStandardMaterial({ color: 0x178c3e, metalness: .5, roughness: .2 }),
      shutter: new THREE.MeshStandardMaterial({ color: 0xc2c7cc, metalness: .75, roughness: .25 }),
      srv: new THREE.MeshStandardMaterial({ color: 0x101316, metalness: .5, roughness: .4 }),
      hose: new THREE.MeshStandardMaterial({ color: 0x141619, metalness: .25, roughness: .55 }),
      led: new THREE.MeshStandardMaterial({ color: 0xb9c0c5, emissive: 0xd6ffe6, emissiveIntensity: 0, metalness: .3, roughness: .4 }),
      lamp: new THREE.MeshStandardMaterial({ color: 0xdde2e6, emissive: 0xfff2cf, emissiveIntensity: 0.05, metalness: .3, roughness: .3 }),
      phone: new THREE.MeshStandardMaterial({ map: phoneTex, metalness: .35, roughness: .25, emissive: 0xffffff, emissiveMap: phoneTex, emissiveIntensity: 0.02 }),
      asphalt: new THREE.MeshStandardMaterial({ color: 0x2b2e33, metalness: .05, roughness: .9 }),
      asphalt2: new THREE.MeshStandardMaterial({ color: 0x26292e, metalness: .05, roughness: .9 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x3f7224, metalness: 0, roughness: 1 }),
      markings: new THREE.MeshStandardMaterial({ color: 0xe5e9ed, metalness: .1, roughness: .6 }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x53412e, metalness: 0, roughness: .95 }),
      pine: new THREE.MeshStandardMaterial({ color: 0x1f5e28, metalness: 0, roughness: .9 }),
      pine2: new THREE.MeshStandardMaterial({ color: 0x2e7032, metalness: 0, roughness: .9 }),
      leaf: new THREE.MeshStandardMaterial({ color: 0x3f7d2c, metalness: 0, roughness: .9 }),
      snowM: new THREE.MeshStandardMaterial({ color: 0xf2f6fa, metalness: .05, roughness: .8 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x171e26, metalness: .9, roughness: .08 }),
      headlight: new THREE.MeshStandardMaterial({ color: 0xf4f7fa, emissive: 0xfff6d8, emissiveIntensity: .12 }),
      taillight: new THREE.MeshStandardMaterial({ color: 0x7a1612, emissive: 0xff2a1e, emissiveIntensity: .15 }),
      puddle: new THREE.MeshStandardMaterial({ color: 0x2e363f, metalness: 1.0, roughness: .04 }),
      cloud: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, flatShading: true }),
      ufoBody: new THREE.MeshStandardMaterial({ color: 0x7e8893, metalness: .95, roughness: .15 }),
      ufoDome: new THREE.MeshStandardMaterial({ color: 0x274b3f, metalness: .7, roughness: .1, emissive: 0x2fe08a, emissiveIntensity: .25 }),
      ufoA: new THREE.MeshStandardMaterial({ color: 0x6cf2ff, emissive: 0x6cf2ff, emissiveIntensity: 1.2 }),
      ufoB: new THREE.MeshStandardMaterial({ color: 0xff5470, emissive: 0xff5470, emissiveIntensity: 1.2 }),
    };
    Object.values(M).forEach((m) => { m.envMap = envTex; m.envMapIntensity = 0.75; });
    M.grass.envMapIntensity = .06; M.asphalt.envMapIntensity = .25; M.asphalt2.envMapIntensity = .25;
    M.pine.envMapIntensity = .06; M.pine2.envMapIntensity = .06; M.leaf.envMapIntensity = .06;
    M.trunk.envMapIntensity = .05; M.cloud.envMapIntensity = 0; M.puddle.envMapIntensity = 2.0;
    M.ufoBody.envMapIntensity = 1.5;

    const root = new THREE.Group(); scene.add(root);
    const box = (w, h, d, m, x, y, z, grp = root) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y, z); g.castShadow = true; g.receiveShadow = true; grp.add(g); return g; };
    const cyl = (rt, rb, h, m, x, y, z, grp = root, seg = 20) => { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); g.position.set(x, y, z); g.castShadow = true; grp.add(g); return g; };
    const plane = (w, h, m, x, y, z, ry, grp = root) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); g.position.set(x, y, z); g.rotation.y = ry; grp.add(g); return g; };

    // ---------- окружение ----------
    const envG = new THREE.Group(); scene.add(envG);
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), M.grass);
    grass.rotation.x = -Math.PI / 2; grass.position.y = -0.01; grass.receiveShadow = true; envG.add(grass);
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), M.asphalt);
    lot.rotation.x = -Math.PI / 2; lot.position.set(0, 0.005, 0); lot.receiveShadow = true; envG.add(lot);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(240, 9), M.asphalt2);
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.004, -21); road.receiveShadow = true; envG.add(road);
    [-14, 14].forEach((rx) => {
      const ramp = new THREE.Mesh(new THREE.PlaneGeometry(7, 8), M.asphalt2);
      ramp.rotation.x = -Math.PI / 2; ramp.position.set(rx, 0.0045, -15); ramp.receiveShadow = true; envG.add(ramp);
    });
    for (let i = -14; i <= 14; i++) box(2.2, 0.012, 0.18, M.markings, i * 8, 0.012, -21, envG);
    [-1, 1].forEach((s) => box(0.16, 0.012, 14, M.markings, s * 8.4, 0.014, 1, envG));
    [-1, 1].forEach((s) => box(1.4, 0.012, 0.22, M.markings, s * 5.5, 0.014, 4.4, envG));

    const treeTops = [];
    let seed = 42; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    function pineTree(x, z, s, mat) {
      const g = new THREE.Group();
      cyl(0.10 * s, 0.14 * s, 0.9 * s, M.trunk, 0, 0.45 * s, 0, g);
      [[1.05, 1.7, 1.5], [0.8, 1.5, 2.4], [0.55, 1.2, 3.2]].forEach(([r, hh, y]) => {
        const c = new THREE.Mesh(new THREE.ConeGeometry(r * s, hh * s, 9), mat);
        c.position.y = y * s; c.castShadow = true; g.add(c);
      });
      g.position.set(x, 0, z); envG.add(g);
      treeTops.push({ x, z, s, type: 'pine' });
    }
    function bushTree(x, z, s) {
      const g = new THREE.Group();
      cyl(0.12 * s, 0.16 * s, 1.1 * s, M.trunk, 0, 0.55 * s, 0, g);
      const f1 = new THREE.Mesh(new THREE.SphereGeometry(1.0 * s, 10, 8), M.leaf); f1.position.y = 1.7 * s; f1.castShadow = true; g.add(f1);
      const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.7 * s, 10, 8), M.leaf); f2.position.set(0.5 * s, 2.1 * s, 0.2 * s); f2.castShadow = true; g.add(f2);
      g.position.set(x, 0, z); envG.add(g);
      treeTops.push({ x, z, s, type: 'bush' });
    }
    for (let i = 0; i < 26; i++) { const x = -30 + rnd() * 60, z = 15 + rnd() * 14; (rnd() > 0.3 ? pineTree(x, z, 0.9 + rnd() * 0.9, rnd() > 0.5 ? M.pine : M.pine2) : bushTree(x, z, 0.8 + rnd() * 0.7)); }
    for (let i = 0; i < 16; i++) { const x = -34 + rnd() * 68, z = -27 - rnd() * 10; (rnd() > 0.35 ? pineTree(x, z, 0.9 + rnd() * 1.0, rnd() > 0.5 ? M.pine : M.pine2) : bushTree(x, z, 0.8 + rnd() * 0.6)); }
    for (let i = 0; i < 8; i++) pineTree(-26 - rnd() * 8, -10 + rnd() * 20, 0.9 + rnd(), M.pine);
    for (let i = 0; i < 8; i++) pineTree(26 + rnd() * 8, -10 + rnd() * 20, 0.9 + rnd(), M.pine2);

    const clouds = [];
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      const n = 4 + Math.floor(rnd() * 3);
      for (let j = 0; j < n; j++) {
        const s = 2 + rnd() * 3.2;
        const m = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), M.cloud);
        m.position.set((j - n / 2) * (s * 0.9), rnd() * 1.2, (rnd() - 0.5) * 2.5);
        m.scale.y = 0.55; g.add(m);
      }
      g.position.set(-90 + rnd() * 180, 19 + rnd() * 9, -45 + rnd() * 70);
      scene.add(g);
      clouds.push({ g, sp: 0.35 + rnd() * 0.5 });
    }

    const puddleG = new THREE.Group(); puddleG.visible = false; scene.add(puddleG);
    [[-6, 3.8], [4, 4.6], [9, -2], [-10, -4], [2, -6.5], [-3, 6.5], [12, 3], [-13, -16], [6, -19.5]].forEach(([px, pz], i) => {
      const r = 0.8 + (i % 3) * 0.5;
      const p = new THREE.Mesh(new THREE.CircleGeometry(r, 22), M.puddle);
      p.rotation.x = -Math.PI / 2; p.rotation.z = i;
      p.scale.set(1.5, 0.7 + (i % 2) * 0.4, 1);
      p.position.set(px, 0.018, pz);
      puddleG.add(p);
    });

    // ---------- станция ----------
    box(L, baseH - mm(60), W, M.baseDark, 0, (baseH - mm(60)) / 2, 0);
    box(L + mm(40), mm(70), W + mm(40), M.baseGreen, 0, baseH - mm(35), 0);
    box(L - mm(60), mm(24), W - mm(60), M.deckFloor, 0, baseH + mm(12), 0);
    box(dispLen - mm(40), mm(32), W - mm(50), M.alu, xL + dispLen / 2, baseH + mm(28), 0);
    [-W / 2 + mm(170), W / 2 - mm(170)].forEach((z) => box(L + mm(250), mm(90), mm(170), M.baseDark, 0, mm(45), z));

    const inner = new THREE.Group(); root.add(inner);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(tankR, tankR, tankLen, 44, 1, true), M.tank);
    tank.rotation.z = Math.PI / 2; tank.position.set(tankX, tankAxisY, 0); tank.castShadow = true; inner.add(tank);
    const tankInner = new THREE.Mesh(new THREE.CylinderGeometry(tankR - mm(30), tankR - mm(30), tankLen - mm(20), 44, 1, true), M.tankIn);
    tankInner.rotation.z = Math.PI / 2; tankInner.position.set(tankX, tankAxisY, 0); inner.add(tankInner);
    [[tankX - tankLen / 2, 1], [tankX + tankLen / 2, -1]].forEach(([cx, s]) => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(tankR, 30, 18, 0, Math.PI * 2, 0, Math.PI / 2), M.tank);
      cap.rotation.z = s * Math.PI / 2; cap.scale.y = capK;
      cap.position.set(cx, tankAxisY, 0); cap.castShadow = true; inner.add(cap);
    });
    const tS = tankX - tankLen / 2;
    [tS + tankLen * 5 / 25, tS + tankLen * 15 / 25].forEach((cx) => {
      const d = new THREE.Mesh(new THREE.CircleGeometry(tankR - mm(25), 40), M.tankIn);
      d.rotation.y = Math.PI / 2; d.position.set(cx, tankAxisY, 0); inner.add(d);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(tankR - mm(28), mm(20), 8, 40), M.steel);
      ring.rotation.y = Math.PI / 2; ring.position.set(cx, tankAxisY, 0); inner.add(ring);
    });
    [tS + tankLen * 0.16, tankX, tS + tankLen * 0.84].forEach((sx) => {
      box(mm(240), tankAxisY - tankR - baseH + mm(40), W * 0.78, M.steel, sx, baseH + (tankAxisY - tankR - baseH) / 2, 0, inner);
    });
    for (let i = 0; i <= 6; i++) {
      const x = tankZoneX0 + (xL + L - tankZoneX0) * i / 6;
      [-W / 2 + mm(45), W / 2 - mm(45)].forEach((z) => box(mm(80), wallH, mm(80), M.steel, x, baseH + wallH / 2, z, inner));
      box(mm(80), mm(80), W - mm(90), M.steel, x, deckH - mm(40), 0, inner);
    }
    // техотсек: красные стояки по бокам, насос внизу, СЕРВЕРНЫЙ ШКАФ в глубине напротив роллеты
    [-mm(440), mm(440)].forEach((dz) => cyl(mm(55), mm(55), wallH - mm(450), M.redEq, techX + mm(420), baseH + (wallH - mm(450)) / 2, dz, inner));
    box(mm(500), mm(160), mm(600), M.redEq, techX + mm(420), baseH + mm(1900), 0, inner);
    box(mm(600), mm(480), mm(700), M.steel, techX - mm(380), baseH + mm(250), -mm(150), inner);
    cyl(mm(110), mm(110), mm(320), M.greenEq, techX - mm(380), baseH + mm(650), -mm(150), inner);
    const srvZ = -mm(560);
    box(mm(820), mm(2050), mm(620), M.srv, techX, baseH + mm(1035), srvZ, inner);
    box(mm(740), mm(1930), mm(30), M.midGrey, techX, baseH + mm(1035), srvZ + mm(325), inner);
    for (let i = 0; i < 7; i++) box(mm(640), mm(20), mm(10), M.black, techX, baseH + mm(360) + i * mm(250), srvZ + mm(338), inner);
    box(mm(70), mm(70), mm(16), M.greenEq, techX + mm(280), baseH + mm(1850), srvZ + mm(340), inner); // индикатор
    const techLight = new THREE.PointLight(0xfff3da, 0, 4.5, 2);
    techLight.position.set(techX, baseH + mm(2200), -mm(100));
    scene.add(techLight);
    const neckX = [tS + tankLen * 0.10, tS + tankLen * 0.40, tS + tankLen * 0.80];
    neckX.forEach((cx) => {
      cyl(mm(260), mm(260), deckH - (tankAxisY + tankR) + mm(20), M.tank, cx, (tankAxisY + tankR + deckH) / 2, 0, inner);
      cyl(mm(55), mm(55), deckH - (tankAxisY + tankR), M.redEq, cx + mm(380), (tankAxisY + tankR + deckH) / 2, mm(300), inner);
    });

    // ---------- обшивка ----------
    const clad = new THREE.Group(); root.add(clad);
    const rows = 2, rowH = wallH / rows, panelW = mm(1900), wallT = mm(50);
    function claddingWall(x0, x1, z, grp) {
      const len = x1 - x0, cx = (x0 + x1) / 2;
      for (let r = 0; r < rows; r++) box(len, rowH - mm(10), wallT, M.white, cx, deckH - rowH * (r + 0.5), z, grp);
      const n = Math.max(1, Math.round(len / panelW));
      for (let i = 0; i <= n; i++) box(mm(20), wallH, wallT + mm(6), M.seam, x0 + len * i / n, baseH + wallH / 2, z, grp);
      for (let r = 1; r < rows; r++) box(len, mm(16), wallT + mm(6), M.seam, cx, deckH - rowH * r, z, grp);
    }
    function claddingEnd(x, grp) {
      for (let r = 0; r < rows; r++) box(wallT, rowH - mm(10), W, M.white, x, deckH - rowH * (r + 0.5), 0, grp);
      box(wallT + mm(6), wallH, mm(20), M.seam, x, baseH + wallH / 2, 0, grp);
      for (let r = 1; r < rows; r++) box(wallT + mm(6), mm(16), W, M.seam, x, deckH - rowH * r, 0, grp);
    }
    const shW = mm(1050), shH = mm(2080), frontZ = W / 2 - wallT / 2;
    // передняя стена — С ПРОЁМОМ под роллету (слева, справа и перемычка сверху)
    claddingWall(partX, techX - shW / 2 - mm(20), frontZ, clad);
    claddingWall(techX + shW / 2 + mm(20), xL + L, frontZ, clad);
    box(shW + mm(40), deckH - (baseH + shH), wallT, M.white, techX, (baseH + shH + deckH) / 2, frontZ, clad);
    claddingWall(partX, xL + L, -W / 2 + wallT / 2, clad);
    claddingEnd(xL + L - wallT / 2, clad);
    for (let r = 0; r < rows; r++) box(wallT, rowH - mm(10), W - mm(40), M.white, partX + wallT / 2, deckH - rowH * (r + 0.5), 0, clad);
    box(wallT + mm(6), mm(16), W - mm(40), M.seam, partX + wallT / 2, deckH - rowH, 0, clad);
    // телефон на обоих бортах (верхний ряд панелей)
    [-1, 1].forEach((s) => {
      plane(mm(4200), mm(520), M.phone, mm(1300), deckH - rowH * 0.5, s * (W / 2 + mm(32)), s > 0 ? 0 : Math.PI, clad);
    });
    // роллета (пивот сверху)
    box(shW + mm(180), mm(240), mm(70), M.midGrey, techX, baseH + shH + mm(120), frontZ + mm(20), clad);
    [-1, 1].forEach((s) => box(mm(70), shH, mm(40), M.midGrey, techX + s * (shW / 2 + mm(40)), baseH + shH / 2, frontZ + mm(28), clad));
    const shutterPivot = new THREE.Group();
    shutterPivot.position.set(techX, baseH + shH, frontZ + mm(10));
    clad.add(shutterPivot);
    for (let i = 0; i < 14; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(shW, shH / 14 - mm(8), mm(26)), M.shutter);
      slat.position.set(0, -shH + shH / 14 * (i + 0.5), 0);
      slat.castShadow = true; shutterPivot.add(slat);
    }
    let shutterT = 0, shutterTarget = 0;

    // ---------- крыша + фриз + LED ----------
    const roofG = new THREE.Group(); root.add(roofG);
    box(L + mm(160), mm(90), W + mm(160), M.roof, 0, deckH + mm(45), 0, roofG);
    for (let i = 0; i <= Math.round(L / panelW); i++) box(mm(16), mm(8), W + mm(160), M.seam, xL + L * i / Math.round(L / panelW), deckH + mm(95), 0, roofG);
    const fH = mm(560);
    [-1, 1].forEach((s) => {
      box(L + mm(200), fH, mm(60), M.fasciaPlain, 0, deckH + mm(60), s * (W / 2 + mm(80)), roofG);
      plane(L + mm(200), fH, M.fasciaSide, 0, deckH + mm(60), s * (W / 2 + mm(112)), s > 0 ? 0 : Math.PI, roofG);
    });
    // торцевые фризы: левый постоянный, правый — скрывается при доп. отсеке
    box(mm(60), fH, W + mm(200), M.fasciaPlain, -(L / 2 + mm(80)), deckH + mm(60), 0, roofG);
    plane(W + mm(200), fH, M.fasciaEnd, -(L / 2 + mm(112)), deckH + mm(60), 0, -Math.PI / 2, roofG);
    const endFasciaR = new THREE.Group(); roofG.add(endFasciaR);
    box(mm(60), fH, W + mm(200), M.fasciaPlain, L / 2 + mm(80), deckH + mm(60), 0, endFasciaR);
    plane(W + mm(200), fH, M.fasciaEnd, L / 2 + mm(112), deckH + mm(60), 0, Math.PI / 2, endFasciaR);
    [-1, 1].forEach((s) => plane(mm(2000), mm(430), M.price, xL + mm(1400), deckH + mm(60), s * (W / 2 + mm(125)), s > 0 ? 0 : Math.PI, roofG));
    const ledY = deckH - mm(230);
    [-1, 1].forEach((s) => box(L + mm(180), mm(45), mm(45), M.led, 0, ledY, s * (W / 2 + mm(85)), roofG));
    box(mm(45), mm(45), W + mm(180), M.led, -(L / 2 + mm(85)), ledY, 0, roofG);
    const endLedR = box(mm(45), mm(45), W + mm(180), M.led, L / 2 + mm(85), ledY, 0, roofG);
    [xL + mm(800), xL + mm(1900)].forEach((lx) => cyl(mm(190), mm(190), mm(60), M.lamp, lx, deckH - mm(30), 0, roofG));
    const spot1 = new THREE.SpotLight(0xfff0cf, 0, 9, Math.PI / 2.6, .5, 1.4);
    spot1.position.set(xL + mm(800), deckH - mm(80), 0); spot1.target.position.set(xL + mm(800), 0, 0);
    scene.add(spot1, spot1.target);
    const spot2 = new THREE.SpotLight(0xfff0cf, 0, 9, Math.PI / 2.6, .5, 1.4);
    spot2.position.set(xL + mm(1900), deckH - mm(80), 0); spot2.target.position.set(xL + mm(1900), 0, 0);
    scene.add(spot2, spot2.target);
    const ledLights = [];
    [[-L / 4, W / 2 + .5], [L / 4, W / 2 + .5], [-L / 4, -W / 2 - .5], [L / 4, -W / 2 - .5]].forEach(([px, pz]) => {
      const p = new THREE.PointLight(0xdfffe9, 0, 7, 2);
      p.position.set(px, ledY, pz); scene.add(p); ledLights.push(p);
    });

    // ---------- ограждение ----------
    const railG = new THREE.Group(); root.add(railG);
    function railRun(x0, x1, z, grp) {
      const len = x1 - x0, cx = (x0 + x1) / 2;
      [railH, railH * 0.6].forEach((hy) => box(len, mm(34), mm(34), M.railM, cx, deckH + mm(90) + hy, z, grp));
      const n = Math.max(1, Math.round(len / mm(950)));
      for (let i = 0; i <= n; i++) box(mm(34), railH, mm(34), M.railM, x0 + len * i / n, deckH + mm(90) + railH / 2, z, grp);
    }
    function railEnd(x, grp) {
      [railH, railH * 0.6].forEach((hy) => box(mm(34), mm(34), W - mm(120), M.railM, x, deckH + mm(90) + hy, 0, grp));
    }
    railRun(partX, xL + L, -W / 2 + mm(60), railG);
    railRun(partX, xL + L, W / 2 - mm(60), railG);
    railEnd(partX, railG);
    const endRailR = new THREE.Group(); railG.add(endRailR);
    railEnd(xL + L, endRailR);

    neckX.forEach((cx) => {
      box(mm(900), mm(50), mm(900), M.roof, cx, deckH + mm(115), 0);
      box(mm(700), mm(70), mm(70), M.redEq, cx + mm(180), deckH + mm(180), mm(150));
      cyl(mm(48), mm(48), mm(820), M.redEq, cx + mm(380), deckH + mm(520), mm(300));
      cyl(mm(150), mm(95), mm(170), M.redEq, cx + mm(380), deckH + mm(990), mm(300));
      cyl(mm(60), mm(60), mm(90), M.redEq, cx + mm(380), deckH + mm(1110), mm(300));
    });

    const ladderG = new THREE.Group(); root.add(ladderG);
    const ladX = xL + L + mm(90);
    [-mm(220), mm(220)].forEach((dz) => cyl(mm(28), mm(28), deckH + railH - mm(150), M.railM, ladX, (deckH + railH - mm(150)) / 2 + mm(80), dz, ladderG));
    for (let i = 0; i < 9; i++) {
      const y = baseH + mm(350) + i * (deckH - baseH - mm(350)) / 8;
      box(mm(30), mm(30), mm(440), M.railM, ladX, y, 0, ladderG);
    }

    // ---------- доп. отсек (фриз и ограждение продолжаются) ----------
    const extG = new THREE.Group(); extG.visible = false; root.add(extG);
    const eX0 = xL + L, eLen = 1.5, eXc = eX0 + eLen / 2, eXe = eX0 + eLen;
    box(eLen, baseH - mm(60), W, M.baseDark, eXc, (baseH - mm(60)) / 2, 0, extG);
    box(eLen + mm(40), mm(70), W + mm(40), M.baseGreen, eXc, baseH - mm(35), 0, extG);
    for (let r = 0; r < rows; r++) {
      [-W / 2 + wallT / 2, W / 2 - wallT / 2].forEach((z) => box(eLen, rowH - mm(10), wallT, M.white, eXc, deckH - rowH * (r + 0.5), z, extG));
      box(wallT, rowH - mm(10), W, M.white, eXe - wallT / 2, deckH - rowH * (r + 0.5), 0, extG);
    }
    [-W / 2 + wallT / 2, W / 2 - wallT / 2].forEach((z) => box(eLen, mm(16), wallT + mm(6), M.seam, eXc, deckH - rowH, z, extG));
    box(wallT + mm(6), mm(16), W, M.seam, eXe - wallT / 2, deckH - rowH, 0, extG);
    box(eLen + mm(120), mm(90), W + mm(160), M.roof, eXc, deckH + mm(45), 0, extG);
    // фриз отсека — продолжение дизайна: зелёная полоса по бокам + торец с лого
    [-1, 1].forEach((s) => {
      box(eLen + mm(160), fH, mm(60), M.fasciaPlain, eXc + mm(60), deckH + mm(60), s * (W / 2 + mm(80)), extG);
      plane(eLen + mm(160), fH, M.fasciaExt, eXc + mm(60), deckH + mm(60), s * (W / 2 + mm(112)), s > 0 ? 0 : Math.PI, extG);
    });
    box(mm(60), fH, W + mm(200), M.fasciaPlain, eXe + mm(80), deckH + mm(60), 0, extG);
    plane(W + mm(200), fH, M.fasciaEnd, eXe + mm(112), deckH + mm(60), 0, Math.PI / 2, extG);
    // LED-полоса продолжается
    [-1, 1].forEach((s) => box(eLen + mm(140), mm(45), mm(45), M.led, eXc + mm(60), ledY, s * (W / 2 + mm(85)), extG));
    box(mm(45), mm(45), W + mm(180), M.led, eXe + mm(85), ledY, 0, extG);
    // ограждение продолжается до края отсека
    const extRail = new THREE.Group(); extG.add(extRail);
    railRun(xL + L, eXe, -W / 2 + mm(60), extRail);
    railRun(xL + L, eXe, W / 2 - mm(60), extRail);
    railEnd(eXe, extRail);
    // дверь в торце отсека
    box(mm(40), mm(2080), mm(980), M.cabWhite, eXe + mm(8), baseH + mm(1040), 0, extG);
    box(mm(26), mm(2000), mm(900), M.white, eXe + mm(30), baseH + mm(1040), 0, extG);
    box(mm(26), mm(220), mm(60), M.black, eXe + mm(48), baseH + mm(1100), mm(330), extG);

    // ---------- отсек ТРК ----------
    const trkX = xL + mm(1650);
    box(mm(1750), mm(120), mm(840), M.midGrey, trkX, baseH + mm(60), 0);
    const cabX = trkX - mm(420);
    box(mm(820), mm(880), mm(640), M.cabWhite, cabX, baseH + mm(120) + mm(440), 0);
    box(mm(820), mm(60), mm(660), M.black, cabX, baseH + mm(140), 0);
    [-1, 1].forEach((s) => box(mm(620), mm(620), mm(20), M.white, cabX, baseH + mm(560), s * mm(322)));
    const stX = trkX + mm(440);
    box(mm(760), mm(2250), mm(520), M.cabWhite, stX, baseH + mm(120) + mm(1125), 0);
    box(mm(780), mm(330), mm(540), M.greenEq, stX, baseH + mm(2220), 0);
    [-1, 1].forEach((s) => plane(mm(700), mm(280), M.trkPanel, stX, baseH + mm(1480), s * mm(262) + (s > 0 ? mm(2) : -mm(2)), s > 0 ? 0 : Math.PI));
    const dbX = stX - mm(380) - mm(160);
    box(mm(70), mm(120), mm(120), M.darkGrey, stX - mm(380) - mm(35), baseH + mm(1640), 0);
    box(mm(320), mm(470), mm(560), M.black, dbX, baseH + mm(1640), 0);
    [-1, 1].forEach((s) => plane(mm(500), mm(400), M.trkDisp, dbX, baseH + mm(1640), s * mm(282), s > 0 ? 0 : Math.PI));
    function nozzle(px, py, pz, side) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(mm(70), mm(170), mm(55)), M.black); body.castShadow = true; g.add(body);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(mm(55), mm(120), mm(45)), M.darkGrey);
      grip.position.set(0, -mm(120), mm(15)); grip.rotation.x = -0.35; grip.castShadow = true; g.add(grip);
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(mm(16), mm(13), mm(220), 10), M.steel);
      spout.position.set(0, mm(130), -mm(40)); spout.rotation.x = 0.5; spout.castShadow = true; g.add(spout);
      g.position.set(px, py, pz); g.rotation.y = side > 0 ? 0 : Math.PI;
      root.add(g);
    }
    [-1, 1].forEach((s) => {
      [-mm(230), 0, mm(230)].forEach((dx) => {
        const hx = stX + dx, faceZ = s * mm(260);
        box(mm(150), mm(560), mm(46), M.darkGrey, hx, baseH + mm(1130), faceZ + s * mm(18));
        cyl(mm(26), mm(26), mm(90), M.steel, hx, baseH + mm(2030), faceZ + s * mm(40));
        const p = [
          new THREE.Vector3(hx, baseH + mm(2000), faceZ + s * mm(60)),
          new THREE.Vector3(hx + mm(60), baseH + mm(1500), faceZ + s * mm(240)),
          new THREE.Vector3(hx + mm(20), baseH + mm(820), faceZ + s * mm(300)),
          new THREE.Vector3(hx - mm(30), baseH + mm(640), faceZ + s * mm(150)),
          new THREE.Vector3(hx, baseH + mm(980), faceZ + s * mm(55)),
        ];
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p), 28, mm(21), 8), M.hose);
        tube.castShadow = true; root.add(tube);
        nozzle(hx, baseH + mm(1170), faceZ + s * mm(62), s);
      });
    });
    const termG = new THREE.Group();
    const tbox = (w, h, d, m, x, y, z) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y, z); g.castShadow = true; termG.add(g); return g; };
    tbox(mm(560), mm(1150), mm(480), M.darkGrey, 0, baseH + mm(575), 0);
    tbox(mm(480), mm(700), mm(20), M.midGrey, 0, baseH + mm(480), -mm(245));
    tbox(mm(420), mm(280), mm(60), M.black, 0, baseH + mm(1000), -mm(240));
    tbox(mm(160), mm(90), mm(30), M.midGrey, -mm(80), baseH + mm(1010), -mm(278));
    tbox(mm(220), mm(40), mm(20), M.black, mm(60), baseH + mm(940), -mm(275));
    tbox(mm(620), mm(950), mm(360), M.cabWhite, 0, baseH + mm(1150) + mm(475), 0);
    tbox(mm(640), mm(60), mm(380), M.greenEq, 0, baseH + mm(1190), 0);
    const tScr = new THREE.Mesh(new THREE.PlaneGeometry(mm(440), mm(820)), M.screen);
    tScr.position.set(0, baseH + mm(1630), -mm(185)); tScr.rotation.y = Math.PI; termG.add(tScr);
    tbox(mm(660), mm(70), mm(400), M.cabWhite, 0, baseH + mm(2130), 0);
    termG.rotation.y = Math.PI / 2;
    termG.position.set(xL + mm(560), 0, 0);
    root.add(termG);

    // ---------- частицы ----------
    const AREA = { x: 36, y: 11, z: 30 };
    const rainCount = 520;
    const rainPos = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * AREA.x, y = Math.random() * AREA.y, z = (Math.random() - 0.5) * AREA.z;
      rainPos.set([x, y, z, x, y - 0.28, z], i * 6);
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xaec6d8, transparent: true, opacity: .55 }));
    rain.visible = false; scene.add(rain);
    const snowCount = 900;
    const snowPos = new Float32Array(snowCount * 3);
    const snowDrift = new Float32Array(snowCount);
    for (let i = 0; i < snowCount; i++) {
      snowPos.set([(Math.random() - 0.5) * AREA.x, Math.random() * AREA.y, (Math.random() - 0.5) * AREA.z], i * 3);
      snowDrift[i] = Math.random() * Math.PI * 2;
    }
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    const snowPts = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: .9 }));
    snowPts.visible = false; scene.add(snowPts);
    const snowG = new THREE.Group(); snowG.visible = false; scene.add(snowG);
    const sB = (w, h, d, x, y, z) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.snowM); g.position.set(x, y, z); g.receiveShadow = true; snowG.add(g); };
    sB(L + mm(180), mm(40), W + mm(180), 0, deckH + mm(110), 0);
    sB(mm(680), mm(30), mm(420), termG.position.x, baseH + mm(2180), termG.position.z);
    sB(mm(800), mm(30), mm(560), stX, baseH + mm(2400), 0);
    const snowGround = new THREE.Mesh(new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ color: 0xeef3f8, roughness: .85, metalness: 0, transparent: true, opacity: .9 }));
    snowGround.rotation.x = -Math.PI / 2; snowGround.position.y = 0.022; snowGround.receiveShadow = true; snowG.add(snowGround);
    treeTops.forEach((t) => {
      if (t.type === 'pine') {
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.6 * t.s, 0.5 * t.s, 9), M.snowM);
        c.position.set(t.x, 3.45 * t.s, t.z); snowG.add(c);
      } else {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.55 * t.s, 8, 6), M.snowM);
        c.position.set(t.x, 2.35 * t.s, t.z); snowG.add(c);
      }
    });

    // ---------- трафик (рубленые формы) ----------
    const trafficG = new THREE.Group(); scene.add(trafficG);
    const vb = (grp, w, h, d, m, x, y, z) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y, z); g.castShadow = true; grp.add(g); return g; };
    function wheelM(grp, x, y, z, r, wd) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, wd, 14), M.black);
      w.rotation.x = Math.PI / 2; w.position.set(x, y, z); w.castShadow = true; grp.add(w);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, wd + 0.02, 10), M.midGrey);
      cap.rotation.x = Math.PI / 2; cap.position.set(x, y, z); grp.add(cap);
    }
    function lightsM(grp, fx, bx, y, zs) {
      zs.forEach((z) => { vb(grp, .08, .14, .22, M.headlight, fx, y, z); vb(grp, .08, .14, .22, M.taillight, bx, y, z); });
    }
    function makeCar(color) {
      const g = new THREE.Group();
      const bodyM = new THREE.MeshStandardMaterial({ color, metalness: .85, roughness: .15, envMap: envTex, envMapIntensity: 1.2 });
      vb(g, 4.3, .85, 1.85, bodyM, 0, .82, 0);
      vb(g, 2.1, .62, 1.7, M.glass, -.2, 1.55, 0);
      vb(g, 2.3, .1, 1.75, bodyM, -.2, 1.9, 0);
      wheelM(g, 1.4, .4, .92, .4, .26); wheelM(g, 1.4, .4, -.92, .4, .26);
      wheelM(g, -1.4, .4, .92, .4, .26); wheelM(g, -1.4, .4, -.92, .4, .26);
      lightsM(g, 2.18, -2.18, .82, [-.55, .55]);
      g.userData.len = 4.4; trafficG.add(g); return g;
    }
    function makeTruck() {
      const g = new THREE.Group();
      const cabM = new THREE.MeshStandardMaterial({ color: 0x2c4576, metalness: .75, roughness: .2, envMap: envTex, envMapIntensity: 1.0 });
      vb(g, 1.7, 1.7, 2.2, cabM, 2.85, 1.35, 0);
      vb(g, 1.5, .7, 2.0, M.glass, 2.9, 2.15, 0);
      vb(g, 5.2, 2.3, 2.35, M.white, -.7, 1.75, 0);
      wheelM(g, 2.9, .5, 1.05, .5, .3); wheelM(g, 2.9, .5, -1.05, .5, .3);
      wheelM(g, -.6, .5, 1.05, .5, .3); wheelM(g, -.6, .5, -1.05, .5, .3);
      wheelM(g, -2.2, .5, 1.05, .5, .3); wheelM(g, -2.2, .5, -1.05, .5, .3);
      lightsM(g, 3.72, -3.35, .9, [-.75, .75]);
      g.userData.len = 7.6; trafficG.add(g); return g;
    }
    const tankerLogoM = new THREE.MeshStandardMaterial({ map: tankerLogoTex, metalness: .2, roughness: .25, envMap: envTex });
    function makeTanker() {
      const g = new THREE.Group();
      const cabM = new THREE.MeshStandardMaterial({ color: 0x12833a, metalness: .8, roughness: .18, envMap: envTex, envMapIntensity: 1.1 });
      vb(g, 1.9, 1.8, 2.3, cabM, 3.9, 1.4, 0);
      vb(g, 1.7, .75, 2.1, M.glass, 3.95, 2.25, 0);
      vb(g, 8.0, .3, 1.4, M.darkGrey, -.5, .62, 0);
      const tk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 6.2, 24), M.white);
      tk.rotation.z = Math.PI / 2; tk.position.set(-.7, 2.0, 0); tk.castShadow = true; g.add(tk);
      [[-3.8, 1], [2.4, -1]].forEach(([cx, s]) => {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.white);
        cap.rotation.z = s * Math.PI / 2; cap.scale.y = .3; cap.position.set(cx, 2.0, 0); cap.castShadow = true; g.add(cap);
      });
      [-1, 1].forEach((s) => {
        const lp = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .8), tankerLogoM);
        lp.position.set(-.7, 2.05, s * 1.02); lp.rotation.y = s > 0 ? 0 : Math.PI; g.add(lp);
      });
      wheelM(g, 3.7, .55, 1.15, .55, .32); wheelM(g, 3.7, .55, -1.15, .55, .32);
      wheelM(g, -2.2, .55, 1.15, .55, .32); wheelM(g, -2.2, .55, -1.15, .55, .32);
      wheelM(g, -3.4, .55, 1.15, .55, .32); wheelM(g, -3.4, .55, -1.15, .55, .32);
      lightsM(g, 4.82, -4.0, .95, [-.8, .8]);
      g.userData.len = 10.2; trafficG.add(g); return g;
    }
    const carColors = [0xb9bec5, 0x7e1a1a, 0x21406e, 0x2b3036, 0xd8d8d8, 0x5c6a22, 0x8a4d18];
    const hwVeh = [];
    for (let i = 0; i < 8; i++) {
      const truck = i % 3 === 0;
      const g = truck ? makeTruck() : makeCar(carColors[i % carColors.length]);
      const dir = i % 2 ? 1 : -1;
      const z = dir > 0 ? -19.2 : -22.8;
      g.position.set(-100 + i * 26 + rnd() * 10, 0, z);
      g.rotation.y = dir > 0 ? 0 : Math.PI;
      hwVeh.push({ g, dir, base: truck ? 6.5 + rnd() * 1.5 : 9.5 + rnd() * 3.5, len: g.userData.len });
    }
    function updateHighway(dt) {
      [1, -1].forEach((dir) => {
        const lane = hwVeh.filter((v) => v.dir === dir).sort((a, b) => (b.g.position.x - a.g.position.x) * dir);
        for (let i = 0; i < lane.length; i++) {
          const v = lane[i];
          let sp = v.base;
          if (i > 0) {
            const front = lane[i - 1];
            const gap = (front.g.position.x - v.g.position.x) * dir - (front.len + v.len) / 2;
            if (gap < 4) sp = Math.min(sp, front.base * 0.6);
            else if (gap < 9) sp = Math.min(sp, front.base * 0.92);
          }
          v.g.position.x += dir * sp * dt;
          if (dir > 0 && v.g.position.x > 120) v.g.position.x = -120;
          if (dir < 0 && v.g.position.x < -120) v.g.position.x = 120;
        }
      });
    }
    const P = (arr, pauseIdx, pauseTime) => ({ pts: arr.map((p) => new THREE.Vector3(p[0], 0, p[1])), pauseIdx, pauseTime });
    const pathA = () => P([[-70, -19.2], [-17, -19.2], [-14, -13], [-11.5, -6], [-9.6, -0.5], [-8.4, 2.5], [-4.1, 2.5], [2, 2.5], [7, 2.4], [10.5, 0], [13, -6.5], [15.5, -13], [19, -19.2], [85, -19.2]], 6, 6.5);
    const pathB = () => P([[-70, -19.2], [-17, -19.2], [-14, -13], [-11.5, -7], [-8.5, -2.6], [-4.1, -2.6], [3, -2.6], [8, -4.2], [11.5, -8], [13.8, -13], [17, -19.2], [85, -19.2]], 5, 6.5);
    const pathTanker = () => P([[-95, -19.2], [-18, -19.2], [-14.5, -13], [-12, -6], [-10.2, -0.5], [-8.8, 2.85], [0.5, 2.85], [7.5, 2.85], [11, 0], [13.5, -6.5], [16, -13], [19.5, -19.2], [95, -19.2]], 6, 5.0);
    const followers = [];
    function follow(g, path, slowSp, fastSp, opts = {}) {
      g.position.copy(path.pts[0]);
      followers.push({ g, path, idx: 1, wait: 0, slowSp, fastSp, done: false, ...opts });
    }
    // занятость стороны роллеты (+z): легковая на pathA в зоне станции
    const sideABusy = () => followers.some((f) => !f.done && !f.isTanker && f.sideA && f.g.position.z > 0.8 && Math.abs(f.g.position.x) < 12);
    const tankerOnA = () => followers.some((f) => !f.done && f.isTanker && (f.g.position.z > 0.5 || f.idx <= 8));
    function updateFollower(v, dt) {
      if (v.wait > 0) { v.wait -= dt; return; }
      // бензовоз ждёт, пока место у роллеты не освободится
      if (v.holdIdx === v.idx && v.holdCheck && v.holdCheck()) return;
      const p = v.g.position, t = v.path.pts[v.idx];
      const dir = new THREE.Vector3().subVectors(t, p); dir.y = 0;
      const d = dir.length();
      const sp = Math.abs(p.z) > 14 ? v.fastSp : v.slowSp;
      const step = sp * dt;
      if (d <= step) {
        p.copy(t);
        if (v.idx === v.path.pauseIdx) v.wait = v.path.pauseTime;
        v.idx++;
        if (v.idx >= v.path.pts.length) { v.done = true; trafficG.remove(v.g); }
      } else {
        dir.normalize(); p.addScaledVector(dir, step);
        v.g.rotation.y = Math.atan2(-dir.z, dir.x);
      }
    }
    let visitTimer = 4, visitSide = 0;
    function spawnVisitor() {
      const g = makeCar(carColors[Math.floor(rnd() * carColors.length)]);
      const useA = (visitSide % 2 === 1) && !tankerOnA();
      follow(g, useA ? pathA() : pathB(), 3.4, 9.5, { sideA: useA });
      visitSide++;
    }

    // ---------- НЛО ----------
    const ufoG = new THREE.Group(); ufoG.visible = false; scene.add(ufoG);
    {
      const dishTop = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2.3, 0.5, 24), M.ufoBody);
      dishTop.position.y = 0.42; dishTop.castShadow = true; ufoG.add(dishTop);
      const dishBot = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.0, 0.38, 24), M.ufoBody);
      dishBot.position.y = -0.02; dishBot.castShadow = true; ufoG.add(dishBot);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.ufoDome);
      dome.position.y = 0.62; ufoG.add(dome);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.26, 16), M.darkGrey);
      hub.position.y = -0.3; ufoG.add(hub);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), i % 2 ? M.ufoA : M.ufoB);
        l.position.set(Math.cos(a) * 1.95, 0.18, Math.sin(a) * 1.95);
        ufoG.add(l);
      }
    }
    const ufoLight = new THREE.PointLight(0x6cf2ff, 0, 9, 2);
    ufoLight.position.y = -0.6; ufoG.add(ufoLight);
    const ufoSpot = new THREE.Vector3(7, 1.6, 6.8);   // площадка дозаправки в стороне от полос машин
    const ufoEnter = new THREE.Vector3(70, 24, 42);
    const ufoExit = new THREE.Vector3(-75, 27, -34);
    let ufoState = 'hidden', ufoTimer = 14;
    function ufoStep(tgt, sp, dt) {
      const d = tgt.clone().sub(ufoG.position);
      const dist = d.length(), st = sp * dt;
      if (dist <= st) { ufoG.position.copy(tgt); return true; }
      ufoG.position.addScaledVector(d.normalize(), st);
      return false;
    }

    // ---------- режимы ----------
    const emissives = [M.fasciaSide, M.fasciaEnd, M.fasciaExt, M.price, M.screen, M.trkDisp, M.trkPanel];
    let isNight = false;
    function applyMode(tm, wm) {
      const night = tm === 'night', sunset = tm === 'sunset';
      isNight = night;
      let bg, sunCol, sunInt, sunPos, hemiInt, fillInt, fogFar, cloudCol;
      if (night) { bg = '#060c17'; sunCol = '#6e84b8'; sunInt = .12; sunPos = [8, 12, -6]; hemiInt = .16; fillInt = .06; fogFar = 85; cloudCol = '#1d2940'; }
      else if (sunset) { bg = '#d97a2e'; sunCol = '#ff6a1c'; sunInt = 1.3; sunPos = [-22, 4, 8]; hemiInt = .32; fillInt = .15; fogFar = 105; cloudCol = '#ffb275'; }
      else { bg = '#5b9ed8'; sunCol = '#ffe9c4'; sunInt = 1.55; sunPos = [-12, 16, 10]; hemiInt = .5; fillInt = .22; fogFar = 115; cloudCol = '#f6fafd'; }
      if (wm === 'rain') { bg = night ? '#050a12' : (sunset ? '#9c6b48' : '#66747f'); sunInt *= .38; hemiInt *= .85; fogFar *= .7; cloudCol = night ? '#16202f' : '#96a1ab'; }
      if (wm === 'snow') { bg = night ? '#0a111c' : (sunset ? '#c8946a' : '#aebcc8'); sunCol = night ? sunCol : '#e8f0fc'; sunInt *= .7; fogFar *= .75; cloudCol = night ? '#222e47' : '#dfe6ec'; }
      scene.background = new THREE.Color(bg);
      scene.fog.color.set(bg); scene.fog.far = fogFar; scene.fog.near = night ? 18 : 28;
      sunL.color.set(sunCol); sunL.intensity = sunInt; sunL.position.set(...sunPos);
      hemi.intensity = hemiInt; fill.intensity = fillInt;
      renderer.toneMappingExposure = night ? 0.95 : (sunset ? 1.0 : 1.0);
      M.cloud.color.set(cloudCol);
      const glow = night ? 1 : 0, dusk = sunset ? 0.35 : 0;
      emissives.forEach((m) => { m.emissiveIntensity = glow * 0.9 + dusk * 0.5; });
      M.led.emissiveIntensity = glow * 2.4 + dusk * 0.9;
      M.lamp.emissiveIntensity = glow * 2.6 + dusk * 0.8 + 0.05;
      M.phone.emissiveIntensity = glow * 0.45 + dusk * 0.15 + 0.02;
      spot1.intensity = spot2.intensity = glow * 2.6 + dusk * 0.8;
      ledLights.forEach((p) => { p.intensity = glow * 1.2 + dusk * 0.35; });
      M.headlight.emissiveIntensity = glow * 1.8 + dusk * 0.7 + 0.1;
      M.taillight.emissiveIntensity = glow * 1.6 + dusk * 0.6 + 0.12;
      const wet = wm === 'rain';
      [M.asphalt, M.asphalt2].forEach((m) => {
        m.roughness = wet ? 0.1 : 0.9;
        m.metalness = wet ? 0.25 : 0.05;
        m.envMapIntensity = wet ? 1.6 : 0.25;
      });
      M.grass.color.set(wet ? 0x35601e : (wm === 'snow' ? 0x5d6e52 : 0x3f7224));
      rain.visible = wet;
      puddleG.visible = wet;
      snowPts.visible = wm === 'snow';
      snowG.visible = wm === 'snow';
    }
    applyMode('day', 'sun');

    // ---------- камера ----------
    const target = new THREE.Vector3(0, 1.6, 0);
    let theta = 2.42, phi = 1.18, radius = 17;
    function applyCam() {
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.cos(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
    }
    applyCam();
    let drag = null, lx = 0, ly = 0;
    const el = renderer.domElement;
    const onDown = (e) => { drag = e.button; lx = e.clientX; ly = e.clientY; };
    const onUp = () => { drag = null; };
    const onMove = (e) => {
      if (drag === null) return;
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      if (drag === 0) { theta += dx * 0.006; phi = Math.max(0.12, Math.min(1.55, phi + dy * 0.006)); }
      else if (drag === 2) {
        const pan = radius * 0.0016;
        const right = new THREE.Vector3().crossVectors(camera.up, new THREE.Vector3().subVectors(target, camera.position).normalize()).normalize();
        target.addScaledVector(right, dx * pan);
        target.y += dy * pan;
      }
      applyCam();
    };
    const onCtx = (e) => e.preventDefault();
    const onWheel = (e) => { e.preventDefault(); radius = Math.max(5, Math.min(80, radius + e.deltaY * 0.012)); applyCam(); };
    let pt = null;
    const onTS = (e) => { if (e.touches.length === 1) pt = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTM = (e) => {
      if (e.touches.length === 1 && pt) {
        const dx = e.touches[0].clientX - pt.x, dy = e.touches[0].clientY - pt.y;
        pt = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        theta += dx * 0.006; phi = Math.max(0.12, Math.min(1.55, phi + dy * 0.006)); applyCam();
      }
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    el.addEventListener('contextmenu', onCtx);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTS, { passive: true });
    el.addEventListener('touchmove', onTM, { passive: true });

    const viewsMap = {
      iso: { t: 2.42, p: 1.18, r: 17 },
      front: { t: Math.PI, p: 1.35, r: 14 },
      side: { t: Math.PI / 2, p: 1.42, r: 18 },
      top: { t: 2.3, p: 0.18, r: 22 },
    };

    // ---------- API ----------
    apiRef.current = {
      applyMode,
      setLayer: (k, v) => {
        if (k === 'clad') clad.visible = v;
        if (k === 'roof') roofG.visible = v;
        if (k === 'rail') railG.visible = v;
      },
      setView: (name) => { const v = viewsMap[name]; if (v) { theta = v.t; phi = v.p; radius = v.r; applyCam(); } },
      setShutter: (open) => { shutterTarget = open ? 1 : 0; },
      setExt: (on) => {
        extG.visible = on;
        ladderG.visible = !on;
        endFasciaR.visible = !on;
        endRailR.visible = !on;
        endLedR.visible = !on;
      },
      callTanker: (onDone) => {
        const g = makeTanker();
        follow(g, pathTanker(), 2.8, 7.5, { isTanker: true, holdIdx: 5, holdCheck: sideABusy, onDone });
      },
    };

    // ---------- цикл ----------
    let raf = 0, tPrev = performance.now(), tAcc = 0, disposed = false;
    function loop() {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      const tNow = performance.now(), dt = Math.min(0.05, (tNow - tPrev) / 1000); tPrev = tNow;
      tAcc += dt;
      // роллета: ход 2 секунды; свет в техотсеке загорается по мере открытия
      if (Math.abs(shutterT - shutterTarget) > 0.001) {
        shutterT += Math.sign(shutterTarget - shutterT) * dt / 2;
        shutterT = Math.max(0, Math.min(1, shutterT));
        shutterPivot.scale.y = 1 - shutterT * 0.93;
      }
      techLight.intensity = shutterT * 1.5;
      // облака
      clouds.forEach((c) => {
        c.g.position.x += c.sp * dt;
        if (c.g.position.x > 110) c.g.position.x = -110;
      });
      // частицы
      if (rain.visible) {
        const a = rainGeo.attributes.position.array;
        for (let i = 0; i < rainCount; i++) {
          let y = a[i * 6 + 1] - 10.5 * dt;
          if (y < 0) { y = AREA.y; a[i * 6] = a[i * 6 + 3] = (Math.random() - 0.5) * AREA.x; a[i * 6 + 2] = a[i * 6 + 5] = (Math.random() - 0.5) * AREA.z; }
          a[i * 6 + 1] = y; a[i * 6 + 4] = y - 0.28;
        }
        rainGeo.attributes.position.needsUpdate = true;
      }
      if (snowPts.visible) {
        const a = snowGeo.attributes.position.array;
        for (let i = 0; i < snowCount; i++) {
          let y = a[i * 3 + 1] - 1.1 * dt;
          snowDrift[i] += dt * 0.8;
          a[i * 3] += Math.sin(snowDrift[i]) * 0.004;
          if (y < 0.05) { y = AREA.y; a[i * 3] = (Math.random() - 0.5) * AREA.x; a[i * 3 + 2] = (Math.random() - 0.5) * AREA.z; }
          a[i * 3 + 1] = y;
        }
        snowGeo.attributes.position.needsUpdate = true;
      }
      // трафик
      updateHighway(dt);
      visitTimer -= dt;
      const activeVisitors = followers.filter((f) => !f.done && !f.isTanker).length;
      if (visitTimer <= 0 && activeVisitors < 2) { spawnVisitor(); visitTimer = 9 + rnd() * 9; }
      for (const f of followers) {
        if (f.done) continue;
        updateFollower(f, dt);
        if (f.done && f.onDone) { f.onDone(); f.onDone = null; }
      }
      // НЛО: мигание + траектория
      ufoG.rotation.y += dt * 1.4;
      M.ufoA.emissiveIntensity = 1.1 + Math.sin(tAcc * 9) * 1.0;
      M.ufoB.emissiveIntensity = 1.1 + Math.cos(tAcc * 9) * 1.0;
      switch (ufoState) {
        case 'hidden':
          ufoTimer -= dt;
          if (ufoTimer <= 0) { ufoG.visible = true; ufoG.position.copy(ufoEnter); ufoState = 'approach'; }
          break;
        case 'approach':
          if (ufoStep(new THREE.Vector3(ufoSpot.x, 8, ufoSpot.z), 17, dt)) ufoState = 'descend';
          break;
        case 'descend':
          ufoLight.intensity = (isNight ? 2.4 : 0.9) * (0.6 + 0.4 * Math.sin(tAcc * 9));
          if (ufoStep(ufoSpot, 2.2, dt)) { ufoState = 'fuel'; ufoTimer = 6; }
          break;
        case 'fuel':
          ufoG.position.y = ufoSpot.y + Math.sin(tAcc * 2.2) * 0.07;
          ufoLight.intensity = (isNight ? 2.6 : 1.0) * (0.6 + 0.4 * Math.sin(tAcc * 12));
          ufoTimer -= dt;
          if (ufoTimer <= 0) ufoState = 'ascend';
          break;
        case 'ascend':
          ufoLight.intensity *= 0.97;
          if (ufoStep(new THREE.Vector3(ufoSpot.x, 12, ufoSpot.z), 4, dt)) ufoState = 'depart';
          break;
        case 'depart':
          if (ufoStep(ufoExit, 22, dt)) {
            ufoG.visible = false; ufoLight.intensity = 0;
            ufoState = 'hidden'; ufoTimer = 40 + rnd() * 35;
          }
          break;
        default: break;
      }
      renderer.render(scene, camera);
    }
    loop();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('contextmenu', onCtx);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTS);
      el.removeEventListener('touchmove', onTM);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => { apiRef.current.applyMode && apiRef.current.applyMode(time, weather); }, [time, weather]);
  useEffect(() => { Object.entries(layers).forEach(([k, v]) => apiRef.current.setLayer && apiRef.current.setLayer(k, v)); }, [layers]);
  useEffect(() => { apiRef.current.setShutter && apiRef.current.setShutter(shutterOpen); }, [shutterOpen]);
  useEffect(() => { apiRef.current.setExt && apiRef.current.setExt(ext); }, [ext]);
  useEffect(() => { apiRef.current.setView && apiRef.current.setView(view); }, [view]);

  const callTanker = () => {
    if (tankerBusy || !apiRef.current.callTanker) return;
    setTankerBusy(true);
    apiRef.current.callTanker(() => setTankerBusy(false));
  };

  const Btn = ({ on, onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      fontSize: '11px', padding: '6px 11px', borderRadius: '980px', fontFamily: 'inherit',
      border: '1px solid ' + (on ? '#0071e3' : 'rgba(255,255,255,0.16)'),
      background: on ? '#0071e3' : 'rgba(255,255,255,0.10)',
      color: on ? '#fff' : '#f5f5f7', fontWeight: on ? 600 : 400,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all .2s',
    }}>{children}</button>
  );
  const Group = ({ label, children }) => (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#a3a3a3', marginBottom: '7px' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#161616', overflow: 'hidden', borderRadius: '8px' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, maxWidth: '300px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(29,29,31,0.92)', padding: '16px', color: '#f5f5f7', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ fontSize: '15px', fontWeight: 600 }}>КАЗС-25 · Татнефть</div>
        <div style={{ fontSize: '11px', color: '#a3a3a3', marginBottom: '8px' }}>7МЗ-25-120 · по сборочному чертежу</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px', fontSize: '11px', marginBottom: '2px', lineHeight: 1.7 }}>
          <span style={{ color: '#a3a3a3' }}>Резервуар</span><span style={{ textAlign: 'right', fontWeight: 600 }}>5/10/10 м³</span>
          <span style={{ color: '#a3a3a3' }}>Габариты</span><span style={{ textAlign: 'right', fontWeight: 600 }}>11 445 × 2 400</span>
          <span style={{ color: '#a3a3a3' }}>Высота</span><span style={{ textAlign: 'right', fontWeight: 600 }}>3 903 мм</span>
        </div>
        <Group label="Время суток">
          <Btn on={time === 'day'} onClick={() => setTime('day')}>День</Btn>
          <Btn on={time === 'sunset'} onClick={() => setTime('sunset')}>Закат</Btn>
          <Btn on={time === 'night'} onClick={() => setTime('night')}>Ночь</Btn>
        </Group>
        <Group label="Погода">
          <Btn on={weather === 'sun'} onClick={() => setWeather('sun')}>Солнечно</Btn>
          <Btn on={weather === 'rain'} onClick={() => setWeather('rain')}>Дождь</Btn>
          <Btn on={weather === 'snow'} onClick={() => setWeather('snow')}>Снег</Btn>
        </Group>
        <Group label="Сцена">
          <Btn on={tankerBusy} onClick={callTanker} disabled={tankerBusy}>Бензовоз</Btn>
          <Btn on={shutterOpen} onClick={() => setShutterOpen(!shutterOpen)}>Роллета</Btn>
          <Btn on={ext} onClick={() => setExt(!ext)}>Отсек доп.</Btn>
        </Group>
        <Group label="Вид">
          <Btn on={view === 'iso'} onClick={() => setView('iso')}>Изометрия</Btn>
          <Btn on={view === 'front'} onClick={() => setView('front')}>Фронт</Btn>
          <Btn on={view === 'side'} onClick={() => setView('side')}>Сбоку</Btn>
          <Btn on={view === 'top'} onClick={() => setView('top')}>Сверху</Btn>
        </Group>
        <Group label="Слои">
          <Btn on={layers.clad} onClick={() => setLayers((l) => ({ ...l, clad: !l.clad }))}>Обшивка</Btn>
          <Btn on={layers.roof} onClick={() => setLayers((l) => ({ ...l, roof: !l.roof }))}>Крыша</Btn>
          <Btn on={layers.rail} onClick={() => setLayers((l) => ({ ...l, rail: !l.rail }))}>Ограждение</Btn>
        </Group>
      </div>
      <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, borderRadius: '980px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.7)', padding: '6px 14px', fontSize: '11px', color: '#e5e5e5', whiteSpace: 'nowrap' }}>
        ЛКМ — вращать · колесо — приближать · ПКМ — двигать
      </div>
      <div style={{ position: 'absolute', bottom: '14px', right: '16px', zIndex: 10, fontSize: '10px', color: '#d4d4d4' }}>
        Интеллект 4 Джи Сервис
      </div>
    </div>
  );
}

window.KazsViewer = KazsViewer;
