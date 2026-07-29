/* ============================================================================
   BÖLÜM 0: OYUN AYARLARI
   ============================================================================ */
const CONFIG = {
  /* Sınır verisi: Natural Earth 1:50m (topojson, ~0,8 MB sıkıştırılmış) */
  topoUrls: [
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    'https://unpkg.com/world-atlas@2/countries-50m.json'
  ],
  /* Kütüphaneler (birincil + yedek CDN) */
  libs: [
    ['https://unpkg.com/globe.gl@2/dist/globe.gl.min.js',
     'https://cdn.jsdelivr.net/npm/globe.gl@2/dist/globe.gl.min.js'],
    ['https://unpkg.com/topojson-client@3/dist/topojson-client.min.js',
     'https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js'],
    ['https://unpkg.com/topojson-simplify@3/dist/topojson-simplify.min.js',
     'https://cdn.jsdelivr.net/npm/topojson-simplify@3/dist/topojson-simplify.min.js']
  ],
  /* Küre dokuları (NASA Blue Marble + ETOPO kabartma + yıldız arka planı) */
  textureBases: [
    'https://unpkg.com/three-globe/example/img/',
    'https://cdn.jsdelivr.net/npm/three-globe/example/img/'
  ],
  /* Sadeleştirme bütçesi: tüm dünya için hedef nokta sayısı.
     Eski oyunda ~16.000 nokta vardı (Vatikan 4 nokta!); ~46.000 nokta,
     kıyıları düzgün gösterirken oyunun akıcılığını korur. */
  targetPoints: 46000,
  /* Bir ülke sadeleştirme sonrası bu sayının altına düşerse
     tam çözünürlüklü 50m verisine geri döner (mikro ülke koruması). */
  minPointsPerCountry: 24,
  /* Ülke katmanı yüksekliği: yarıçapın binde 1,2'si (~7,6 km). Eskiden 0,006
     (~38 km) idi ve yandan bakınca kıyılar dev falezler gibi görünüyordu.
     Daha da alçaltmak, kapak üçgenlerinin küre yüzeyinin altına "batmasına"
     yol açar; bu yüzden tessellasyon da inceltildi (curvatureResolution). */
  polygonAltitude: 0.0012,
  microAltitude: 0.002,     /* mikro ülkeler biraz daha üstte (örtüşme önlenir) */
  curvatureResolution: 2.5, /* kapak yüzeyi kaç derecelik adımlarla küreyi izler */
  timedSeconds: 30 * 60,    /* süreli mod: 30 dakika */
  /* Çevrimiçi düello: PeerJS (WebRTC) — ücretsiz genel sinyal sunucusu üzerinden
     eşler arası bağlantı kurulur; oyun verisi doğrudan iki oyuncu arasında akar. */
  peerJsUrls: ['https://unpkg.com/peerjs@1/dist/peerjs.min.js',
               'https://cdn.jsdelivr.net/npm/peerjs@1/dist/peerjs.min.js'],
  roomPrefix: 'dunya-ulkeleri-duello-',
  onlineTurnSeconds: 60,    /* çevrimiçi tur süresi; dolunca otomatik pas */
  startView: { lat: 39, lng: 35, altitude: 2.2 },  /* açılış: Türkiye merkezli */
  /* WGS84 elipsoidi: kutup basıklığı 1/298,257223563 */
  flattening: 1 / 298.257223563
};

/* ============================================================================
   BÖLÜM 2: YARDIMCI FONKSİYONLAR
   ============================================================================ */
const $ = id => document.getElementById(id);
const tick = () => new Promise(r => setTimeout(r, 0));

/* Türkçe karakterleri ve aksanları sadeleştirerek karşılaştırma anahtarı üretir.
   (Eski sürümde "São Tomé" ve "Bosna-Hersek" gibi adlar aksan/tire yüzünden
   hiç eşleşemiyordu — burada NFD ayrıştırmasıyla düzeltildi.) */
function normalize(s) {
  return s.trim().toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[-'’´`."]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPop(n) {
  if (n >= 1e9) return '≈ ' + (n / 1e9).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' milyar';
  if (n >= 1e6) return '≈ ' + (n / 1e6).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' milyon';
  if (n >= 1e3) return '≈ ' + Math.round(n / 1e3).toLocaleString('tr-TR') + ' bin';
  return '≈ ' + n;
}
function formatArea(a) {
  return (a < 1 ? a.toLocaleString('tr-TR') : Math.round(a).toLocaleString('tr-TR')) + ' km²';
}
function formatTime(sec) {
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}
function flagUrl(name, w) {
  const code = FLAG_MAP[name];
  if (code === 'kktc') return KKTC_FLAG_URL;
  return 'https://flagcdn.com/w' + (w || 80) + '/' + code + '.png';
}
function loadScript(url) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = url; s.onload = () => res(true); s.onerror = () => rej(new Error(url));
    document.head.appendChild(s);
  });
}
async function loadWithFallback(urls) {
  for (const u of urls) { try { await loadScript(u); return true; } catch (e) {} }
  return false;
}
function imgOk(url) {
  return new Promise(res => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => res(true); im.onerror = () => res(false);
    setTimeout(() => res(false), 15000); im.src = url;
  });
}
function countPts(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let n = 0;
  for (const p of polys) for (const r of p) n += r.length;
  return n;
}
/* En büyük parçanın derece cinsinden köşegen uzunluğu (uçuş yakınlığı için) */
function mainSpan(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let best = 0;
  for (const p of polys) {
    const ring = p[0];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const pt of ring) {
      if (pt[0] < x0) x0 = pt[0]; if (pt[0] > x1) x1 = pt[0];
      if (pt[1] < y0) y0 = pt[1]; if (pt[1] > y1) y1 = pt[1];
    }
    const span = Math.max(x1 - x0, y1 - y0);
    if (span > best) best = span;
  }
  return best;
}

/* ============================================================================
   BÖLÜM 3: SINIR VERİSİNİN YÜKLENMESİ VE İYİLEŞTİRİLMESİ
   ----------------------------------------------------------------------------
   1) Natural Earth 1:50m topojson indirilir (iki CDN denenir).
   2) Kayıtlar ISO koduna (yedek: ada) göre oyundaki ülkelere eşlenir.
   3) Küresel (spherical) Visvalingam ağırlıklarıyla, YALNIZCA oyundaki
      ülkelerin kullandığı yaylar üzerinden uyarlanabilir eşik seçilir:
      karmaşık kıyılar detay tutar, sade sınırlar az nokta harcar.
   4) Aynı ülkeye eşlenen parçalar (Fas+Batı Sahra, Somali+Somaliland)
      topojson.merge ile İÇ SINIRLARI SİLİNEREK birleştirilir.
   5) Sadeleştirme bir ülkeyi fazla budarsa (mikro ülkeler) o ülke tam
      çözünürlüklü veriden geri yüklenir → "bozunuma uğramış" sınır kalmaz,
      gerek duymayan ülkeye de fazladan nokta harcanmaz.
   6) Kıbrıs + KKTC de aynı Natural Earth verisinden gelir; Yeşil Hat iki
      ülkenin ortak yayı olduğundan kusursuz hizalıdır. (Kullanıcının OSM
      dosyaları karasularını da kapladığı için kullanılamadı.)
   7) Küresel sarım güvencesi: her halkanın küresel alanı ölçülür; içi
      yarım küreden büyük çıkan (ters sarımlı) halkalar çevrilir. Hiçbir
      ülke sınırı denizlere/okyanuslara taşamaz — mutlak değişmez.
   ============================================================================ */
const ALL_NAMES = CONTINENTS_ORDER.flatMap(c => CONTINENTS[c]);
const CONT_OF = {};
CONTINENTS_ORDER.forEach(c => CONTINENTS[c].forEach(n => { CONT_OF[n] = c; }));

async function loadBorders(setLoad) {
  /* --- indirme --- */
  let text = null;
  for (const u of CONFIG.topoUrls) {
    try { const r = await fetch(u); if (r.ok) { text = await r.text(); break; } } catch (e) {}
  }
  if (!text) throw new Error('Sınır verisi indirilemedi. İnternet bağlantınızı kontrol edin.');
  setLoad(35, 'Sınırlar iyileştiriliyor…'); await tick();

  const topoFull = JSON.parse(text);           /* dokunulmamış kopya (detay geri yükleme) */
  const objName = Object.keys(topoFull.objects)[0];

  /* --- eşleme --- */
  function gameNameOf(g) {
    const idNum = parseInt(g.id, 10);
    if (Number.isFinite(idNum) && idNum >= 0 && NE_ID_TO_GAME[idNum]) return NE_ID_TO_GAME[idNum];
    const nm = g.properties && g.properties.name;
    if (nm && Object.prototype.hasOwnProperty.call(NE_NAME_FIX, nm)) return NE_NAME_FIX[nm];
    return null;
  }
  function groupByGame(topology) {
    const m = new Map();
    for (const g of topology.objects[objName].geometries) {
      const n = gameNameOf(g);
      if (!n) continue;
      if (!m.has(n)) m.set(n, []);
      m.get(n).push(g);
    }
    return m;
  }
  const groupsFull = groupByGame(topoFull);

  /* --- uyarlanabilir sadeleştirme --- */
  const pre = topojson.presimplify(JSON.parse(text), topojson.sphericalTriangleArea);
  const usedArcs = new Set();
  (function collect() {
    for (const g of pre.objects[objName].geometries) {
      if (!gameNameOf(g)) continue;
      (function walk(a) {
        for (const x of a) Array.isArray(x) ? walk(x) : usedArcs.add(x < 0 ? ~x : x);
      })(g.arcs || []);
    }
  })();
  const weights = [];
  usedArcs.forEach(i => { for (const p of pre.arcs[i]) if (isFinite(p[2])) weights.push(p[2]); });
  weights.sort((a, b) => b - a);
  const threshold = weights.length > CONFIG.targetPoints ? weights[CONFIG.targetPoints] : 0;
  const simp = topojson.simplify(pre, threshold);
  const groupsSimp = groupByGame(simp);
  setLoad(50, 'Ülkeler birleştiriliyor…'); await tick();

  /* --- özellik üretimi --- */
  function extract(topology, group) {
    return group.length > 1
      ? topojson.merge(topology, group)
      : topojson.feature(topology, group[0]).geometry;
  }
  const features = [];
  const missing = [];
  let restored = 0;
  for (const name of ALL_NAMES) {
    const gs = groupsSimp.get(name);
    if (!gs || !gs.length) {
      if (OLD_MICRO_FALLBACK[name]) {
        features.push(mkFeature(name, OLD_MICRO_FALLBACK[name]));
        missing.push(name + ' (eski veriyle)');
      } else missing.push(name);
      continue;
    }
    let geometry = extract(simp, gs);
    if (countPts(geometry) < CONFIG.minPointsPerCountry) {
      geometry = extract(topoFull, groupsFull.get(name));   /* tam detaya dön */
      restored++;
    }
    features.push(mkFeature(name, geometry));
  }
  function mkFeature(name, geometry) {
    const span = mainSpan(geometry);
    return {
      type: 'Feature',
      properties: { name, continent: CONT_OF[name], micro: span < 1.2, span },
      geometry
    };
  }

  /* --- KÜRESEL sarım (winding) güvencesi ---
     Küresel yorumda bir halkanın "içi", sarım yönüne göre kürenin iki
     yüzünden biridir: ters sarılmış bir halka, ülke yerine "dünyanın geri
     kalanını" (tüm okyanusları!) tanımlar. Burada her halkanın küresel
     işaretli alanı (Chamberlain–Duquette, d3.geoArea eşleniği) ölçülür ve
     şu KURAL zorlanır:
       • dış halkanın içi YARIM KÜREDEN BÜYÜK OLAMAZ → değilse çevrilir,
       • delikler dışın tersine sarılır.
     Böylece hiçbir ülkenin sınırı denizlere/okyanuslara taşamaz; bu bir
     referans karşılaştırması değil, mutlak bir değişmezdir. (Düzlemsel
     işaret karşılaştırması Rusya gibi 190° boylam kaplayan halkalarda
     yanılabildiği için kullanılmaz.) */
  const RAD = Math.PI / 180, SPHERE_SR = 4 * Math.PI, HEMI_SR = 2 * Math.PI;
  function ringAreaSr(ring) {              /* steradyan, [0, 4π) aralığına oturtulur */
    let s = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const l1 = ring[i][0] * RAD, f1 = ring[i][1] * RAD;
      const l2 = ring[i + 1][0] * RAD, f2 = ring[i + 1][1] * RAD;
      let dl = l2 - l1;                    /* antimeridyen sıçramasına dayanıklı */
      if (dl > Math.PI) dl -= 2 * Math.PI; else if (dl < -Math.PI) dl += 2 * Math.PI;
      s += dl * (2 + Math.sin(f1) + Math.sin(f2));
    }
    s /= 2;
    s %= SPHERE_SR;
    return s < 0 ? s + SPHERE_SR : s;
  }
  let rewound = 0;
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) poly.forEach((ring, ri) => {
      const biggerThanHemi = ringAreaSr(ring) > HEMI_SR;
      if (ri === 0 ? biggerThanHemi : !biggerThanHemi) { ring.reverse(); rewound++; }
    });
  }
  if (rewound) console.info('[Dünya Ülkeleri] Ters sarımlı halka düzeltildi: ' + rewound);

  /* Geliştirici özeti (oyunu etkilemez) */
  const total = features.reduce((s, f) => s + countPts(f.geometry), 0);
  console.info('[Dünya Ülkeleri] ' + features.length + ' ülke yüklendi · ' +
    total.toLocaleString('tr-TR') + ' sınır noktası · tam detaya dönen mikro ülke: ' + restored);
  if (missing.length) console.warn('[Dünya Ülkeleri] Natural Earth eşleşmesi bulunamayan:', missing);

  return { type: 'FeatureCollection', features };
}

/* ============================================================================
   BÖLÜM 4: 3B KÜRENİN KURULMASI
   ----------------------------------------------------------------------------
   Gerçekçilik katmanları:
   • NASA Blue Marble uydu dokusu (gerçek renkler)
   • ETOPO tabanlı kabartma dokusu → dağlar/çukurlar ışıkla belirir (yükselti)
   • WGS84 elipsoit basıklığı: küre Y ekseninde 1/298,257 oranında basılır
     (jeoit sapmaları ±100 m olduğundan bu ölçekte görünmez; bilimsel olarak
     doğru olan elipsoit modeli uygulanır)
   • Atmosfer saçılması ve yıldızlı gökyüzü
   ============================================================================ */
let world = null;
let V3 = null;                 /* three.js Vector3 sınıfı (küreden ödünç alınır) */
let YSCALE = 1 - CONFIG.flattening;

const state = {
  mode: null,                  /* 'timed' | 'free' | 'duel' */
  mp: null,                    /* düello durumu (BÖLÜM 6B) — tekli oyunda null */
  revealed: new Set(),         /* düelloda pas geçilip cevabı açıklanan ülkeler */
  guessed: new Set(),
  wrongCount: 0,
  hintCount: 0,
  streak: 0,                   /* üst üste doğru sayısı (başarımlar için) */
  activeCountry: null,         /* şu an tahmin edilen ülke */
  hoverName: null,
  highlightedCountry: null,
  showingRemaining: false,
  hintShownFor: new Set(),
  startTime: null,
  timeLeft: CONFIG.timedSeconds,
  timerInterval: null,
  ended: false
};
let WORLD = null;
const FEATURE_OF = {};

async function buildGlobe(setLoad) {
  /* Doku CDN'i seç (ulaşılamazsa yedeğe geç) */
  let base = CONFIG.textureBases[0];
  for (const b of CONFIG.textureBases) {
    if (await imgOk(b + 'earth-topology.png')) { base = b; break; }
  }
  setLoad(72, 'Küre dokuları yükleniyor…'); await tick();

  world = Globe({ rendererConfig: { antialias: true, alpha: false } })($('globe'))
    .width(window.innerWidth).height(window.innerHeight)
    .globeImageUrl(base + 'earth-blue-marble.jpg')
    .bumpImageUrl(base + 'earth-topology.png')
    .backgroundImageUrl(base + 'night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#7dd3fc')
    .atmosphereAltitude(0.15)
    .polygonsData(WORLD.features)
    .polygonGeoJsonGeometry(d => d.geometry)
    .polygonAltitude(d => d.properties.micro ? CONFIG.microAltitude : CONFIG.polygonAltitude)
    .polygonCapColor(d => capColor(d))
    .polygonSideColor(() => 'rgba(0, 0, 0, 0)')   /* yan duvarlar görünmez: komşu duvarların z-çakışması önlenir */
    .polygonStrokeColor(d => strokeColor(d))
    .polygonsTransitionDuration(0)
    .polygonLabel(() => '')
    .onPolygonHover(onPolygonHover)
    .onPolygonClick(onPolygonClick)
    .onGlobeClick(closeAllPanels)
    .pointOfView(CONFIG.startView, 0);

  V3 = world.camera().position.constructor;

  /* Kapak tessellasyon inceliği (falez düzeltmesinin tamamlayıcısı):
     yöntem adı globe.gl sürümüne göre değişir; hangisi varsa o kullanılır,
     hiçbiri yoksa sessizce atlanır — oyun bundan bağımsız çalışır.
     (Katman yüksekliği 0,0012; varsayılan 5° tessellasyonda bile kapaklar
     küre yüzeyinin üzerinde kalır, bu ayar yalnızca yüzeyi pürüzsüzleştirir.) */
  try {
    if (typeof world.polygonCapCurvatureResolution === 'function')
      world.polygonCapCurvatureResolution(CONFIG.curvatureResolution);
    else if (typeof world.polygonCurvatureResolution === 'function')
      world.polygonCurvatureResolution(CONFIG.curvatureResolution);
  } catch (e) {}

  /* --- WGS84 basıklığı: küre grubunu Y ekseninde ölçekle --- */
  try {
    const grp = world.scene().children.find(o => o.type === 'Group');
    if (grp) grp.scale.y = YSCALE;
  } catch (e) { console.warn('Elipsoit ölçeği uygulanamadı:', e); }

  /* --- Işık: yönlü ışığı kameraya bağla → kürenin karanlık yüzü kalmaz --- */
  try {
    const scene = world.scene(), cam = world.camera();
    const dir = scene.children.find(o => o.isDirectionalLight);
    if (dir) { scene.add(cam); cam.add(dir); dir.position.set(30, 45, 70); }
  } catch (e) {}

  /* --- Pürüzsüz yakınlaşma/uzaklaşma --- */
  const ctr = world.controls();
  ctr.enableDamping = true;
  ctr.dampingFactor = 0.08;
  ctr.zoomSpeed = 0.7;
  ctr.minDistance = 101.8;      /* ~115 km irtifa: mikro ülkeler seçilebilir */
  ctr.maxDistance = 480;
  ctr.autoRotate = true;        /* başlangıç ekranında yavaşça döner */
  ctr.autoRotateSpeed = 0.35;
  ctr.addEventListener('change', onCameraChange);
  onCameraChange();
  fixPolygonMaterials();                       /* saydam kapak düzeltmesi (ilk kurulum) */
  setTimeout(fixPolygonMaterials, 1500);       /* geç oluşturulan kapaklar için güvence */
}

/* Kamera değişince: işaretçi konumları + dönüş hızı + yakınlık etiketi */
function onCameraChange() {
  markersDirty = true;
  if (!world) return;
  const d = world.camera().position.length();
  const ctr = world.controls();
  ctr.rotateSpeed = Math.min(1, Math.max(0.04, (d - 100) / 120));
  const alt = d / 100 - 1;
  $('zoom-level-label').textContent =
    alt > 1.6 ? 'Genel' : alt > 0.7 ? 'Orta' : alt > 0.25 ? 'Yakın' : 'Çok Yakın';
}

/* --- Renk düzeni: uydu dokusu yarı saydam katmanların altından görünür --- */
function capColor(d) {
  const name = d.properties.name;
  if (name === state.highlightedCountry) return 'rgba(239, 68, 68, 0.85)';
  if (name === state.activeCountry) return 'rgba(245, 158, 11, 0.80)';
  if (state.guessed.has(name))
    return name === state.hoverName ? 'rgba(34, 197, 94, 0.65)' : 'rgba(34, 197, 94, 0.45)';
  if (state.revealed.has(name))    /* düelloda pas geçilen: gri */
    return name === state.hoverName ? 'rgba(148, 163, 184, 0.55)' : 'rgba(148, 163, 184, 0.40)';
  return name === state.hoverName ? 'rgba(56, 189, 248, 0.55)' : 'rgba(23, 49, 88, 0.60)';
}
function strokeColor(d) {
  const name = d.properties.name;
  if (name === state.highlightedCountry) return '#fca5a5';
  if (name === state.activeCountry) return '#fde68a';
  if (state.guessed.has(name)) return '#86efac';
  if (state.revealed.has(name)) return '#cbd5e1';
  return '#0b1220';
}
function repaint() {
  if (!world) return;
  world.polygonCapColor(d => capColor(d)).polygonStrokeColor(d => strokeColor(d));
  fixPolygonMaterials();
}

/* --- Üçgen desenli titreme (flicker) düzeltmesi ---
   Yarı saydam ülke kapaklarında depthWrite açık kalırsa, kürenin eğimini
   izleyen kapak üçgenleri birbirinin derinlik tamponuna yazar ve çizim
   sırasına göre üçgen üçgen parlayıp söner. Çözüm: saydam kapaklarda
   depthWrite kapatılır ve yalnızca ÖN yüzler çizilir (side=FrontSide) —
   böylece her kapak tek katman, tekdüze bir renk olarak karışır. */
function fixPolygonMaterials() {
  if (!world) return;
  try {
    world.scene().traverse(o => {
      if (o.isMesh && o.geometry && /ConicPolygon/i.test(o.geometry.type || '')) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m && m.transparent !== false) { m.depthWrite = false; m.side = 0; /* THREE.FrontSide */ }
        }
      }
    });
  } catch (e) {}
}

/* Enlem/boylamı 3B konuma çevirir (elipsoit ölçeği dahil) */
function llToVec(lat, lng, alt) {
  let p;
  if (world.getCoords) p = world.getCoords(lat, lng, alt);
  else {
    const phi = (90 - lat) * Math.PI / 180, theta = (90 - lng) * Math.PI / 180, r = 100 * (1 + alt);
    p = { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.cos(phi), z: r * Math.sin(phi) * Math.sin(theta) };
  }
  return new V3(p.x, p.y * YSCALE, p.z);
}

function flyTo(name, ms) {
  const c = CENTROIDS[name];
  if (!c || !world) return;
  const f = FEATURE_OF[name];
  const span = f ? f.properties.span : 5;
  const altitude = Math.min(2, Math.max(0.08, span / 45));
  world.pointOfView({ lat: c[1], lng: c[0], altitude }, ms || 900);
}

/* ============================================================================
   BÖLÜM 5: EKRAN-SABİT "KALANLAR" İŞARETÇİLERİ
   ----------------------------------------------------------------------------
   Eski sürümde noktalar SVG içinde olduğundan yakınlaşınca DEVASA büyüyor,
   ülkenin üzerini kapatıyordu. Burada işaretçiler DOM ögesidir: boyutları
   CSS pikseliyle SABİTTİR, her karede yalnızca KONUMLARI yeniden izdüşülür.
   Kürenin arka yüzünde kalanlar ufuk testi ile gizlenir.
   ============================================================================ */
const markerEls = new Map();
let markersDirty = true;

function buildMarkers() {
  const layer = $('markers-layer');
  for (const name of ALL_NAMES) {
    const el = document.createElement('button');
    el.className = 'remain-marker';
    el.textContent = '?';
    el.title = 'Bilinmeyen ülke — tıkla ve tahmin et';
    el.style.display = 'none';
    el.addEventListener('click', e => { e.stopPropagation(); selectCountry(name); });
    layer.appendChild(el);
    markerEls.set(name, el);
  }
}

function markersTick() {
  if (world && markersDirty) updateMarkerPositions();
  requestAnimationFrame(markersTick);
}

function updateMarkerPositions() {
  markersDirty = false;
  const cam = world.camera().position;
  const camLen = cam.length();
  const cosHorizon = 100 / camLen;
  const cx = cam.x / camLen, cy = cam.y / camLen, cz = cam.z / camLen;
  const W = window.innerWidth, H = window.innerHeight;
  for (const [name, el] of markerEls) {
    if (!state.showingRemaining || state.guessed.has(name) || state.revealed.has(name) || state.ended) {
      el.style.display = 'none'; continue;
    }
    const c = CENTROIDS[name];
    if (!c) { el.style.display = 'none'; continue; }
    const v = llToVec(c[1], c[0], 0.012);
    const vl = Math.hypot(v.x, v.y, v.z);
    const facing = (v.x * cx + v.y * cy + v.z * cz) / vl;
    if (facing < cosHorizon - 0.03) { el.style.display = 'none'; continue; }
    v.project(world.camera());
    if (v.z > 1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((v.x + 1) / 2 * W) + 'px';
    el.style.top = ((1 - v.y) / 2 * H) + 'px';
  }
}

$('show-remaining-btn').addEventListener('click', () => {
  state.showingRemaining = !state.showingRemaining;
  const btn = $('show-remaining-btn');
  btn.classList.toggle('active', state.showingRemaining);
  btn.innerHTML = state.showingRemaining
    ? '<span class="dot-icon"></span> Kalanları gizle'
    : '<span class="dot-icon"></span> Kalanları göster';
  markersDirty = true;
});

/* ============================================================================
   BÖLÜM 6: OYUN AKIŞI — seçim, tahmin, ipucu, sürpriz yumurta
   ============================================================================ */
function onPolygonHover(d) {
  state.hoverName = d ? d.properties.name : null;
  $('globe').style.cursor = d ? 'pointer' : 'grab';
  repaint();
  updateTooltip(d);
}

function onPolygonClick(d, ev) {
  const name = d.properties.name;
  if (state.guessed.has(name) || state.revealed.has(name)) { showInfoCard(name, false); return; }
  selectCountry(name);
}

/* forDuel=true yalnızca düello motorundan gelir; düelloda elle ülke seçilemez */
function selectCountry(name, forDuel) {
  if (state.mp && !forDuel) return;
  if (state.guessed.has(name) || state.revealed.has(name) || state.ended) return;
  clearHighlight();
  hideInfoCard();
  state.activeCountry = name;
  repaint();
  const input = $('guess-input');
  input.value = ''; input.className = '';
  $('guess-feedback').textContent = ''; $('guess-feedback').className = '';
  $('show-answer-btn').style.display = 'none';
  $('guess-country-hint').textContent = 'Bu ülkeyi biliyor musun?';
  $('skip-btn').textContent = state.mp ? 'Pas (−100)' : 'Vazgeç';
  $('mp-legend').style.display = state.mp ? 'block' : 'none';
  $('guess-panel').classList.add('visible');
  input.focus();
}

/* Düelloda panel oyuncunun sırasıdır: yalnızca oyun motoru (force) kapatabilir */
function closeGuessPanel(force) {
  if (state.mp && state.activeCountry && !state.ended && !force) return;
  state.activeCountry = null;
  $('guess-panel').classList.remove('visible');
  repaint();
}
function closeAllPanels() {
  closeGuessPanel();
  clearHighlight();
  hideInfoCard();
}

function clearHighlight() {
  if (!state.highlightedCountry) return;
  const li = $('country-list').querySelector('[data-name="' + CSS.escape(state.highlightedCountry) + '"]');
  if (li) li.classList.remove('list-highlighted');
  state.highlightedCountry = null;
  repaint();
}
function highlightCountry(name) {
  clearHighlight();
  state.highlightedCountry = name;
  const li = $('country-list').querySelector('[data-name="' + CSS.escape(name) + '"]');
  if (li) li.classList.add('list-highlighted');
  repaint();
  setTimeout(() => { if (state.highlightedCountry === name) clearHighlight(); }, 3000);
}

function resolveGuess(raw) {
  const n = normalize(raw);
  if (!n || !state.activeCountry) return null;
  if (normalize(state.activeCountry) === n) return state.activeCountry;
  if (ALIASES[n] === state.activeCountry) return state.activeCountry;
  return null;
}

function checkGuess() {
  if (state.mp && state.mp.online && !isMyTurn()) return;   /* çevrimiçi: sıra rakipte */
  const raw = $('guess-input').value;
  if (!raw.trim() || !state.activeCountry || state.ended) return;

  /* Sürpriz yumurta: Türkiye seçiliyken yapımcının adı yazılırsa… (düelloda kapalı) */
  if (!state.mp && state.activeCountry === 'Türkiye' && raw.trim().toLowerCase() === 'melihmavi') {
    ALL_NAMES.forEach(n => { if (!state.guessed.has(n)) { state.guessed.add(n); markListItem(n); } });
    afterCorrect(null);
    return;
  }

  if (resolveGuess(raw)) {
    const name = state.activeCountry;
    state.guessed.add(name);
    state.streak++;
    markListItem(name);
    $('guess-input').className = 'correct';
    const fb = $('guess-feedback');
    if (state.mp) {
      netSend({ t: 'correct' });
      fb.textContent = '✓ Doğru! ' + duelApplyCorrect();
      fb.className = 'ok';
      setTimeout(() => afterCorrect(name), 850);
    } else {
      fb.textContent = '✓ Doğru!'; fb.className = 'ok';
      setTimeout(() => afterCorrect(name), 550);
    }
  } else {
    state.wrongCount++;
    state.streak = 0;
    $('wrong-num').textContent = state.wrongCount;
    const input = $('guess-input');
    input.className = 'wrong';
    const fb = $('guess-feedback');
    if (state.mp) {
      netSend({ t: 'wrong' });
      fb.textContent = 'Yanlış! −25 puan, tekrar dene.'; fb.className = '';
      duelApplyWrong();
    } else {
      fb.textContent = 'Yanlış, tekrar dene!'; fb.className = '';
      $('show-answer-btn').style.display = 'inline-block';
    }
    setTimeout(() => { input.className = ''; }, 400);
  }
}

/* Doğru tahmin sonrası ortak işler (name=null → sürpriz yumurta/tümü) */
function afterCorrect(name) {
  closeGuessPanel(true);
  $('prog-count').textContent = state.guessed.size;
  updateProgressUI();
  checkAchievements();
  markersDirty = true;
  repaint();
  if (name) showInfoCard(name, true);
  if (state.mp) {
    if (!state.ended) { state.mp.turn ^= 1; setTimeout(nextMpTurn, 800); }
    return;
  }
  if (state.guessed.size === ALL_NAMES.length) showWin();
}

function showHint() {
  if (state.mp && state.mp.online && !isMyTurn()) return;
  if (!state.activeCountry) return;
  const name = state.activeCountry;
  /* Düelloda ipucu ülke başına bir kez ücretlendirilir: −20 puan, temiz seriyi bozar */
  if (state.mp && !state.mp.turnHint) {
    state.mp.turnHint = true;
    curPlayer().cleanStreak = 0;
    netSend({ t: 'hint' });
    if (chargePoints(curPlayer(), DUEL.HINT)) return;
  }
  if (!state.hintShownFor.has(name)) { state.hintShownFor.add(name); state.hintCount++; }
  const pattern = name.split(' ').map(w => w[0] + '·'.repeat(Math.max(0, w.length - 1))).join(' ');
  const letters = name.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '').length;
  const fb = $('guess-feedback');
  fb.textContent = '💡 ' + pattern + '  (' + letters + ' harf)';
  fb.className = 'ok';
}

$('guess-btn').addEventListener('click', checkGuess);
$('guess-input').addEventListener('keydown', e => { if (e.key === 'Enter') checkGuess(); });
$('skip-btn').addEventListener('click', () => state.mp ? duelPass() : closeGuessPanel());
$('hint-btn').addEventListener('click', showHint);
$('show-answer-btn').addEventListener('click', () => {
  if (!state.activeCountry) return;
  $('guess-input').value = state.activeCountry;
  checkGuess();
});

/* ============================================================================
   BÖLÜM 6B: ⚔️ 2 KİŞİLİK DÜELLO MODU (aynı cihazda, sıra tabanlı)
   ----------------------------------------------------------------------------
   Kurallar (birebir istenen yapı):
   • Her oyuncu 1000 puanla başlar.
   • Oyun her turda RASTGELE bir ülke seçer, sıradaki oyuncu adını bilmeye çalışır.
   • Doğru bilme +50 · Yanlış deneme −25 · İpucu −20 · Pas −100 (cevap açıklanır).
   • "Temiz seri" = ardarda, hiç yanlış denemeden ve ipucusuz bilinen ülkeler:
     10'da +500, 20'de +1000, 30'da +1500 bonus.
   • Puanı biten (0'a düşen) oyuncu ANINDA kaybeder.
   • Tüm ülkeler tükenirse yüksek puanlı oyuncu kazanır (eşitlikte berabere).
   ============================================================================ */
const DUEL = { START: 1000, CORRECT: 50, WRONG: 25, HINT: 20, PASS: 100,
               BONUS: { 10: 500, 20: 1000, 30: 1500 } };

function curPlayer() { return state.mp.players[state.mp.turn]; }
/* Aynı cihazda her tur "benimdir"; çevrimiçi modda yalnızca kendi sıramda oynayabilirim */
function isMyTurn() { return !state.mp || !state.mp.online || state.mp.turn === state.mp.myIdx; }

function shuffleArr(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Aynı cihazda düello */
function startDuel() {
  initMp({
    online: false,
    players: [{ label: '1. Oyuncu' }, { label: '2. Oyuncu' }],
    queue: shuffleArr(ALL_NAMES.slice()),
    startTurn: 0
  });
}

/* Ortak düello kurulumu (yerel + çevrimiçi) */
function initMp(opts) {
  state.mode = 'duel';
  state.startTime = Date.now();
  state.mp = {
    online: !!opts.online,
    myIdx: (opts.myIdx === undefined ? null : opts.myIdx),
    conn: opts.conn || null,
    players: opts.players.map(p => ({ label: p.label, score: DUEL.START, cleanStreak: 0 })),
    turn: opts.startTurn || 0,
    queue: opts.queue,
    qi: 0,
    turnWrong: false,
    turnHint: false,
    deadline: 0
  };
  $('duel-overlay').classList.remove('visible');
  $('mp-bar').style.display = 'flex';
  $('mp-p0').querySelector('.mp-pname').textContent = state.mp.players[0].label;
  $('mp-p1').querySelector('.mp-pname').textContent = state.mp.players[1].label;
  if (!state.mp.online) hideTurnBanner();
  if (triviaTimer) { clearInterval(triviaTimer); triviaTimer = null; }
  if (world) world.controls().autoRotate = false;
  nextMpTurn();
}

/* Puan düşer; 0'a inen oyuncu oyunu ANINDA kaybeder. true → oyun bitti */
function chargePoints(p, n) {
  p.score -= n;
  if (p.score <= 0) {
    p.score = 0;
    updateMpBar();
    endDuel(1 - state.mp.turn, p.label + ' puanını tüketti.');
    return true;
  }
  updateMpBar();
  return false;
}

function duelApplyCorrect() {
  const p = curPlayer();
  p.score += DUEL.CORRECT;
  let txt = '+' + DUEL.CORRECT;
  if (!state.mp.turnWrong && !state.mp.turnHint) {
    p.cleanStreak++;
    const bonus = DUEL.BONUS[p.cleanStreak];
    if (bonus) {
      p.score += bonus;
      txt += ' · 🔥 Temiz seri ' + p.cleanStreak + '! BONUS +' + bonus;
      $('toast-name').textContent = '🔥 ' + p.label + ' — temiz seri ' + p.cleanStreak + ' → +' + bonus + ' puan!';
      const toast = $('achievement-toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2600);
    }
  } else {
    p.cleanStreak = 0;
  }
  updateMpBar();
  return txt;
}

function duelApplyWrong() {
  state.mp.turnWrong = true;
  curPlayer().cleanStreak = 0;
  chargePoints(curPlayer(), DUEL.WRONG);
}

function duelPass(auto) {
  if (state.mp && state.mp.online && !isMyTurn()) return;
  if (!state.activeCountry || state.ended) return;
  netSend({ t: 'pass' });
  passCore(auto ? '⏱ Süre doldu — otomatik pas (−100)' : null);
}

/* Pas çekirdeği: yerel oyuncu da uzak oyuncu da aynı yoldan geçer */
function passCore(flashText) {
  const country = state.activeCountry;
  if (!country || state.ended) return;
  const p = curPlayer();
  p.cleanStreak = 0;
  if (chargePoints(p, DUEL.PASS)) return;
  state.revealed.add(country);          /* cevap açıklanır, harita gri olur */
  markListItemRevealed(country);
  closeGuessPanel(true);
  showInfoCard(country, false);
  markersDirty = true;
  repaint();
  if (flashText) flashBanner(flashText);
  state.mp.turn ^= 1;
  setTimeout(nextMpTurn, 900);
}

function nextMpTurn() {
  const mp = state.mp;
  if (!mp || state.ended) return;
  stopTurnTimer();
  if (mp.qi >= mp.queue.length) {       /* ülkeler tükendi → yüksek puan kazanır */
    const [a, b] = mp.players;
    endDuel(a.score === b.score ? null : (a.score > b.score ? 0 : 1),
      'Tüm ülkeler oynandı.');
    return;
  }
  const country = mp.queue[mp.qi++];
  mp.turnWrong = false;
  mp.turnHint = false;
  updateMpBar();
  flyTo(country, 1000);
  if (isMyTurn()) {
    selectCountry(country, true);
    $('guess-country-hint').innerHTML = '⚔️ Sıra' +
      (mp.online ? ' <b>SENDE</b>' : ': <b>' + curPlayer().label + '</b>') + ' — İşaretli ülke hangisi?';
  } else {
    /* Seyirci taraf: ülke vurgulanır ve kamera uçar, panel rakiptedir */
    state.activeCountry = country;
    $('guess-panel').classList.remove('visible');
    repaint();
  }
  if (mp.online) startTurnTimer();
}

function updateMpBar() {
  if (!state.mp) return;
  state.mp.players.forEach((p, i) => {
    const el = $('mp-p' + i);
    el.querySelector('.mp-score').textContent = p.score;
    el.querySelector('.mp-streak').textContent = p.cleanStreak >= 3 ? '🔥' + p.cleanStreak : '';
    el.classList.toggle('active', state.mp.turn === i && !state.ended);
  });
  $('mp-remaining').textContent = (state.mp.queue.length - state.mp.qi) + ' ülke kaldı';
}

function endDuel(winnerIdx, reason) {
  state.ended = true;
  stopTurnTimer();
  hideTurnBanner();
  closeGuessPanel(true);
  updateMpBar();
  markersDirty = true;
  const [a, b] = state.mp.players;
  $('win-title').textContent = winnerIdx === null ? '⚔️ Berabere!' : '🏆 ' + state.mp.players[winnerIdx].label + ' Kazandı!';
  $('win-text').innerHTML = a.label + ': <b>' + a.score + '</b> puan · ' + b.label + ': <b>' + b.score + '</b> puan' +
    '<br>' + (reason || '') + '<br><span id="win-stats"></span>';
  $('win-stats') && ($('win-stats').textContent = state.guessed.size + ' ülke doğru bilindi · ' + state.revealed.size + ' pas');
  $('win-overlay').classList.add('visible');
}

/* ============================================================================
   BÖLÜM 6C: 🌐 ÇEVRİMİÇİ DÜELLO — PeerJS (WebRTC) eşler arası bağlantı
   ----------------------------------------------------------------------------
   • Oda kuran oyuncu 5 harflik kod alır; katılan kodu girer. Sinyalleşme
     PeerJS'in ücretsiz genel sunucusundan yapılır, oyun verisi doğrudan iki
     oyuncu arasında (P2P) akar. Hesap/anahtar gerekmez.
   • Protokol: ev sahibi kuyruk + başlangıç sırasını üretir ve 'init' ile
     yollar; her oyuncu YALNIZCA kendi sırasında eylem mesajı gönderir
     ('correct' | 'wrong' | 'hint' | 'pass'), iki taraf da aynı kuralları
     uygulayarak birebir aynı duruma ulaşır (deterministik eşleme).
   • Tur süresi 60 sn; dolarsa sıradaki oyuncunun istemcisi otomatik pas
     gönderir. Bağlantı kopması hükmen galibiyettir.
   ============================================================================ */
const duelNet = { peer: null, conn: null, code: null, nick: '', isHost: false, pending: null };

/* --- sıra şeridi (banner) ve tur sayacı --- */
let mpTimerInterval = null;
let bannerFlash = null;
function showTurnBanner(html) {
  const el = $('turn-banner');
  el.style.display = 'block';
  el.innerHTML = html;
}
function hideTurnBanner() { $('turn-banner').style.display = 'none'; }
function flashBanner(text) {
  bannerFlash = { text: text, until: Date.now() + 2400 };
  if (state.mp && state.mp.online && !state.ended) updateTurnCountdown();
}
function stopTurnTimer() {
  if (mpTimerInterval) { clearInterval(mpTimerInterval); mpTimerInterval = null; }
}
function startTurnTimer() {
  state.mp.deadline = Date.now() + CONFIG.onlineTurnSeconds * 1000;
  stopTurnTimer();
  updateTurnCountdown();
  mpTimerInterval = setInterval(updateTurnCountdown, 500);
}
function updateTurnCountdown() {
  const mp = state.mp;
  if (!mp || !mp.online || state.ended) { stopTurnTimer(); return; }
  const left = Math.max(0, Math.ceil((mp.deadline - Date.now()) / 1000));
  const flash = (bannerFlash && Date.now() < bannerFlash.until) ? bannerFlash.text + '<br>' : '';
  const who = isMyTurn() ? '🎯 <b>Sıra sende!</b>' : '⏳ ' + curPlayer().label + ' düşünüyor…';
  showTurnBanner(flash + who + ' · ' + left + ' sn');
  if (left <= 0) {
    if (isMyTurn()) { stopTurnTimer(); duelPass(true); }
    else if (Date.now() - mp.deadline > 20000) {   /* rakipten 20 sn haber yoksa kopmuş say */
      stopTurnTimer();
      onOpponentGone();
    }
  }
}

/* --- ağ yardımcıları --- */
function netSend(msg) {
  const mp = state.mp;
  if (mp && mp.online && mp.conn) { try { mp.conn.send(msg); } catch (e) {} }
}
function netStatus(html) { $('duel-net-status').innerHTML = html; }
function myNick(def) {
  const v = ($('duel-nick').value || '').trim().slice(0, 12);
  return v || def;
}
function genRoomCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   /* karışan harfler (I,O,0,1) yok */
  let c = '';
  for (let i = 0; i < 5; i++) c += A[Math.floor(Math.random() * A.length)];
  return c;
}
async function ensurePeerJs() {
  if (window.Peer) return true;
  netStatus('Bağlantı kütüphanesi yükleniyor…');
  await loadWithFallback(CONFIG.peerJsUrls);
  return !!window.Peer;
}
function cleanupPeer() {
  try { if (duelNet.conn) duelNet.conn.close(); } catch (e) {}
  try { if (duelNet.peer) duelNet.peer.destroy(); } catch (e) {}
  duelNet.conn = null; duelNet.peer = null; duelNet.pending = null;
}

/* --- oda kurma / katılma --- */
async function duelHost() {
  if (!await ensurePeerJs()) { netStatus('⚠ Bağlantı kütüphanesi yüklenemedi. İnternetini kontrol et.'); return; }
  cleanupPeer();
  duelNet.isHost = true;
  duelNet.code = genRoomCode();
  duelNet.nick = myNick('Ev Sahibi');
  netStatus('Oda kuruluyor…');
  const peer = duelNet.peer = new window.Peer(CONFIG.roomPrefix + duelNet.code);
  peer.on('open', () => {
    netStatus('Oda kodu: <span class="room-code">' + duelNet.code + '</span><br>' +
      'Rakibin bu kodu "Katıl" kutusuna yazsın. Bekleniyor ⏳');
  });
  peer.on('connection', conn => {
    if (duelNet.conn) { try { conn.close(); } catch (e) {} return; }   /* oda dolu */
    wireConn(conn);
  });
  peer.on('error', netError);
}
async function duelJoin() {
  const code = ($('duel-code-input').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length < 4) { netStatus('⚠ Geçerli bir oda kodu gir.'); return; }
  if (!await ensurePeerJs()) { netStatus('⚠ Bağlantı kütüphanesi yüklenemedi. İnternetini kontrol et.'); return; }
  cleanupPeer();
  duelNet.isHost = false;
  duelNet.nick = myNick('Konuk');
  netStatus('Odaya bağlanılıyor…');
  const peer = duelNet.peer = new window.Peer();
  peer.on('open', () => {
    wireConn(peer.connect(CONFIG.roomPrefix + code, { reliable: true }));
  });
  peer.on('error', netError);
}
function wireConn(conn) {
  duelNet.conn = conn;
  conn.on('open', () => {
    if (duelNet.isHost) {
      /* Ev sahibi otoritedir: kuyruğu ve ilk sırayı üretip yollar */
      duelNet.pending = { queue: shuffleArr(ALL_NAMES.slice()), startTurn: Math.random() < 0.5 ? 0 : 1 };
      conn.send({ t: 'init', q: duelNet.pending.queue, st: duelNet.pending.startTurn, n: duelNet.nick });
      netStatus('Rakip bağlandı, başlatılıyor…');
    }
  });
  conn.on('data', onNetMessage);
  conn.on('close', onOpponentGone);
  conn.on('error', onOpponentGone);
}
function onNetMessage(msg) {
  if (!msg || typeof msg.t !== 'string') return;
  if (msg.t === 'init' && !duelNet.isHost && !state.mp) {
    if (!Array.isArray(msg.q) || msg.q.length !== ALL_NAMES.length) return;
    duelNet.conn.send({ t: 'hello', n: duelNet.nick });
    startOnlineMatch(msg.q, msg.st ? 1 : 0, String(msg.n || 'Ev Sahibi').slice(0, 12), 1);
    return;
  }
  if (msg.t === 'hello' && duelNet.isHost && !state.mp && duelNet.pending) {
    startOnlineMatch(duelNet.pending.queue, duelNet.pending.startTurn,
      String(msg.n || 'Konuk').slice(0, 12), 0);
    return;
  }
  if (msg.t === 'bye') { onOpponentGone(); return; }
  applyRemoteAction(msg);
}
function startOnlineMatch(queue, startTurn, oppNick, myIdx) {
  const labels = myIdx === 0 ? [duelNet.nick, oppNick] : [oppNick, duelNet.nick];
  initMp({
    online: true, myIdx: myIdx, conn: duelNet.conn,
    players: [{ label: labels[0] }, { label: labels[1] }],
    queue: queue, startTurn: startTurn
  });
}
function netError(err) {
  const t = err && err.type;
  if (t === 'peer-unavailable') netStatus('⚠ Oda bulunamadı. Kodu kontrol et; oda kuran kişi beklemede olmalı.');
  else if (t === 'unavailable-id') { netStatus('Kod çakıştı, yeni kod deneniyor…'); duelHost(); }
  else if (!state.mp) netStatus('⚠ Bağlantı hatası (' + (t || 'bilinmiyor') + '). Yeniden dene; kurumsal ağlarda P2P engellenebilir.');
}

/* --- rakibin eylemini yerelde birebir uygula (deterministik eşleme) --- */
function applyRemoteAction(msg) {
  const mp = state.mp;
  if (!mp || !mp.online || state.ended) return;
  if (isMyTurn()) return;               /* eylem yalnızca sırası olan rakipten kabul edilir */
  const opp = curPlayer();
  switch (msg.t) {
    case 'correct': {
      const name = state.activeCountry;
      if (!name) return;
      state.guessed.add(name);
      markListItem(name);
      const bonusTxt = duelApplyCorrect();
      flashBanner('✓ ' + opp.label + ' doğru bildi (' + bonusTxt + ')');
      afterCorrect(name);
      break;
    }
    case 'wrong':
      duelApplyWrong();
      flashBanner('✗ ' + opp.label + ' yanlış denedi (−25)');
      break;
    case 'hint':
      if (!mp.turnHint) {
        mp.turnHint = true;
        opp.cleanStreak = 0;
        chargePoints(opp, DUEL.HINT);
      }
      flashBanner('💡 ' + opp.label + ' ipucu aldı (−20)');
      break;
    case 'pass':
      flashBanner('🏳 ' + opp.label + ' pas geçti (−100)');
      passCore(null);
      break;
  }
}
function onOpponentGone() {
  if (!state.mp || !state.mp.online || state.ended) return;
  endDuel(state.mp.myIdx, 'Rakibin bağlantısı koptu — hükmen galibiyet.');
}
window.addEventListener('beforeunload', () => { try { netSend({ t: 'bye' }); } catch (e) {} });

/* ============================================================================
   BÖLÜM 7: BİLGİ KARTI (bayrak + künye) VE FARE İPUCU KUTUSU
   ============================================================================ */
function showInfoCard(name, justGuessed) {
  const info = COUNTRY_INFO[name];
  $('info-flag').src = flagUrl(name, 320);
  $('info-flag').alt = name + ' bayrağı';
  $('info-name').textContent = name;
  /* Yerel ad (endonim): kendi alfabesiyle, Türkçe adla aynıysa gizlenir */
  const native = NATIVE_NAME[name];
  $('info-native').textContent = (native && native !== name) ? native : '';
  $('info-native').style.display = (native && native !== name) ? '' : 'none';
  const rows = [];
  if (info) {
    rows.push(['Başkent', info[0]]);
    rows.push(['Nüfus', formatPop(info[1])]);
    rows.push(['Resmî dil', info[2]]);
    /* Alfabe: yazı sisteminin adı + örnek harfler (görsel tanıma için) */
    const sc = SCRIPTS[COUNTRY_SCRIPT[name] || 'latin'];
    rows.push(['Alfabe', sc[0] + '<div class="script-sample">' + sc[1] + '</div>']);
    rows.push(['Yüzölçümü', formatArea(info[3])]);
  }
  rows.push(['Kıta', CONT_OF[name]]);
  if (info && info[4]) rows.push(['Not', info[4]]);
  $('info-rows').innerHTML = rows.map(r =>
    '<div class="info-row"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>'
  ).join('');
  const card = $('info-card');
  card.classList.toggle('just-guessed', !!justGuessed);
  card.classList.add('visible');
}
function hideInfoCard() { $('info-card').classList.remove('visible'); }
$('info-close').addEventListener('click', hideInfoCard);

const tooltip = $('country-tooltip');
let lastMouse = { x: 0, y: 0 };
document.addEventListener('mousemove', e => {
  lastMouse = { x: e.clientX, y: e.clientY };
  if (tooltip.style.display === 'block') positionTooltip();
});
function positionTooltip() {
  tooltip.style.left = lastMouse.x + 'px';
  tooltip.style.top = lastMouse.y + 'px';
}
function updateTooltip(d) {
  if (!d) { tooltip.style.display = 'none'; return; }
  const name = d.properties.name;
  if (state.guessed.has(name)) {
    tooltip.innerHTML = '<b>' + name + '</b>' +
      '<img src="' + flagUrl(name, 160) + '" alt="' + name + '">' +
      '<div class="tip-sub">Künye için tıkla</div>';
  } else if (state.revealed.has(name)) {
    tooltip.innerHTML = '<b>' + name + '</b>' +
      '<img src="' + flagUrl(name, 160) + '" alt="' + name + '">' +
      '<div class="tip-sub">Pas geçilmişti · künye için tıkla</div>';
  } else if (state.mp) {
    tooltip.innerHTML = '❓ <b>Bilinmeyen ülke</b><div class="tip-sub">Düelloda ülkeyi oyun seçer</div>';
  } else {
    tooltip.innerHTML = '❓ <b>Bilinmeyen ülke</b><div class="tip-sub">Tıkla ve tahmin et</div>';
  }
  tooltip.style.display = 'block';
  positionTooltip();
}

/* ============================================================================
   BÖLÜM 8: KENAR ÇUBUĞU (kıta listesi) VE BAŞARIMLAR
   ============================================================================ */
function buildList() {
  const list = $('country-list');
  list.innerHTML = '';
  CONTINENTS_ORDER.forEach(cont => {
    const group = document.createElement('div');
    group.className = 'continent-group';
    const label = document.createElement('div');
    label.className = 'continent-label';
    label.id = 'label-' + cont.replace(/\s+/g, '');
    label.innerHTML = '<span>' + cont + '</span> <span class="cont-prog">0/' + CONTINENTS[cont].length + ' (%0)</span>';
    const items = document.createElement('div');
    items.className = 'continent-items';
    label.addEventListener('click', () => items.classList.toggle('open'));
    CONTINENTS[cont].forEach(name => {
      const item = document.createElement('div');
      item.className = 'country-item';
      item.dataset.name = name;
      item.textContent = '···';
      item.addEventListener('click', () => {
        if (!state.guessed.has(name) && !state.revealed.has(name)) return;
        flyTo(name);
        highlightCountry(name);
        showInfoCard(name, false);
      });
      items.appendChild(item);
    });
    group.appendChild(label);
    group.appendChild(items);
    list.appendChild(group);
  });
}

function markListItem(name) {
  const el = $('country-list').querySelector('[data-name="' + CSS.escape(name) + '"]');
  if (el) { el.textContent = name; el.classList.add('guessed'); }
}
/* Düelloda pas geçilen ülke listede gri görünür */
function markListItemRevealed(name) {
  const el = $('country-list').querySelector('[data-name="' + CSS.escape(name) + '"]');
  if (el) { el.textContent = name; el.classList.add('revealed'); }
}

function updateProgressUI() {
  CONTINENTS_ORDER.forEach(cont => {
    const total = CONTINENTS[cont].length;
    const g = CONTINENTS[cont].filter(n => state.guessed.has(n)).length;
    const label = $('label-' + cont.replace(/\s+/g, ''));
    if (label) {
      const span = label.querySelector('.cont-prog');
      if (span) span.textContent = g + '/' + total + ' (%' + Math.floor(g / total * 100) + ')';
    }
  });
}

$('sidebar-close').addEventListener('click', () => $('sidebar').classList.remove('open'));
$('sidebar-toggle').addEventListener('click', () => $('sidebar').classList.add('open'));

/* --- Başarımlar (özgün oyundan) --- */
const earnedAchievements = new Set();
function contPct(cont, pct) {
  const total = CONTINENTS[cont].length;
  const g = CONTINENTS[cont].filter(n => state.guessed.has(n)).length;
  return g / total * 100 >= pct;
}
const ACHIEVEMENTS = [
  { id: 'a1', name: 'Pasaport Kontrolü', desc: '5 Ülke Bul', icon: '🛂', cond: () => state.guessed.size >= 5 },
  { id: 'a2', name: 'Sınır Ötesi', desc: '10 Ülke Bul', icon: '🎒', cond: () => state.guessed.size >= 10 },
  { id: 'a3', name: 'Kıtalararası Gezgin', desc: '50 Ülke Bul', icon: '✈️', cond: () => state.guessed.size >= 50 },
  { id: 'a4', name: 'Atlas Hakimi', desc: '100 Ülke Bul', icon: '🗺️', cond: () => state.guessed.size >= 100 },
  { id: 'a5', name: 'Dünya Vatandaşı', desc: '150 Ülke Bul', icon: '🌍', cond: () => state.guessed.size >= 150 },
  { id: 'a6', name: 'Küresel Üstad', desc: 'Hepsini Bul (' + ALL_NAMES.length + ')', icon: '🏆', cond: () => state.guessed.size >= ALL_NAMES.length },
  { id: 'a7', name: 'Yedi Denizlerin Fatihi', desc: 'Her Kıtadan 1 Ülke', icon: '⚓', cond: () => CONTINENTS_ORDER.every(c => CONTINENTS[c].some(n => state.guessed.has(n))) },
  { id: 'a8', name: 'Eski Kıta Yolcusu', desc: 'Avrupa %50', icon: '🏰', cond: () => contPct('Avrupa', 50) },
  { id: 'a9', name: 'Avrupa Fatihi', desc: 'Avrupa %100', icon: '🇪🇺', cond: () => contPct('Avrupa', 100) },
  { id: 'a10', name: 'İpek Yolu Çırağı', desc: 'Asya %50', icon: '🐪', cond: () => contPct('Asya', 50) },
  { id: 'a11', name: 'Asya Hakimi', desc: 'Asya %100', icon: '🐉', cond: () => contPct('Asya', 100) },
  { id: 'a12', name: 'Yeni Dünya Kâşifi', desc: 'K. Amerika %50', icon: '🗽', cond: () => contPct('Kuzey Amerika', 50) },
  { id: 'a13', name: 'Kuzey Yıldızı', desc: 'K. Amerika %100', icon: '⭐', cond: () => contPct('Kuzey Amerika', 100) },
  { id: 'a14', name: 'Latin Rüzgarı', desc: 'G. Amerika %50', icon: '🦜', cond: () => contPct('Güney Amerika', 50) },
  { id: 'a15', name: 'Amazon Efsanesi', desc: 'G. Amerika %100', icon: '🐆', cond: () => contPct('Güney Amerika', 100) },
  { id: 'a16', name: 'Çöl Tilkisi', desc: 'Afrika %50', icon: '🦊', cond: () => contPct('Afrika', 50) },
  { id: 'a17', name: 'Safari Üstadı', desc: 'Afrika %100', icon: '🦁', cond: () => contPct('Afrika', 100) },
  /* --- Gözden geçirmede eklenenler: Okyanusya çifti eksikti + beceri rozetleri --- */
  { id: 'a18', name: 'Ada Kâşifi', desc: 'Okyanusya %50', icon: '🏝️', cond: () => contPct('Okyanusya', 50) },
  { id: 'a19', name: 'Pasifik Hâkimi', desc: 'Okyanusya %100', icon: '🌊', cond: () => contPct('Okyanusya', 100) },
  { id: 'a20', name: 'Komşu Kapısı', desc: 'Türkiye + 8 sınır komşusu', icon: '🚪',
    cond: () => TR_NEIGHBORS.every(n => state.guessed.has(n)) },
  { id: 'a21', name: 'Mikro Gezgin', desc: "Avrupa'nın 6 mikro devleti", icon: '🔎',
    cond: () => EURO_MICROS.every(n => state.guessed.has(n)) },
  { id: 'a22', name: 'Keskin Nişancı', desc: 'Üst üste 25 doğru (yanlışsız)', icon: '🎯',
    cond: () => state.streak >= 25 },
  { id: 'a23', name: 'Şimşek Başlangıç', desc: 'İlk 10 ülkeyi 3 dakikada bul', icon: '⚡',
    cond: () => state.guessed.size >= 10 && state.startTime && (Date.now() - state.startTime) <= 180000 },
  { id: 'a24', name: 'Ada Koleksiyoncusu', desc: '12 ada ülkesi bul', icon: '⛵',
    cond: () => ISLAND_NATIONS.filter(n => state.guessed.has(n)).length >= 12 }
];
const TR_NEIGHBORS = ['Türkiye', 'Yunanistan', 'Bulgaristan', 'Gürcistan', 'Ermenistan',
  'Azerbaycan', 'İran', 'Irak', 'Suriye'];
const EURO_MICROS = ['Vatikan', 'San Marino', 'Monako', 'Lihtenştayn', 'Andorra', 'Malta'];
const ISLAND_NATIONS = ['İzlanda', 'İrlanda', 'Birleşik Krallık', 'Malta',
  'Güney Kıbrıs Rum Yönetimi', 'Kuzey Kıbrıs Türk Cumhuriyeti', 'Japonya', 'Filipinler',
  'Endonezya', 'Sri Lanka', 'Maldivler', 'Tayvan', 'Singapur', 'Bahreyn', 'Madagaskar',
  'Seyşeller', 'Komorlar', 'Mauritius', 'São Tomé ve Príncipe', 'Yeşil Burun Adaları',
  'Küba', 'Haiti', 'Dominik Cumhuriyeti', 'Jamaika', 'Bahamalar', 'Barbados',
  'Trinidad ve Tobago', 'Grenada', 'Saint Lucia', 'Dominika', 'Antigua ve Barbuda',
  'Saint Kitts ve Nevis', 'Saint Vincent ve Grenadinler', 'Yeni Zelanda', 'Fiji',
  'Solomon Adaları', 'Vanuatu', 'Samoa', 'Tonga', 'Kiribati', 'Marshall Adaları',
  'Mikronezya', 'Palau', 'Nauru', 'Tuvalu'];
function initAchievements() {
  const grid = $('achievements-grid');
  ACHIEVEMENTS.forEach(a => {
    const div = document.createElement('div');
    div.className = 'ach-icon';
    div.id = 'ach-' + a.id;
    div.dataset.tooltip = 'KİLİTLİ — ' + a.desc;
    div.textContent = '⬛';
    grid.appendChild(div);
  });
}
function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (earnedAchievements.has(a.id) || !a.cond()) return;
    earnedAchievements.add(a.id);
    const el = $('ach-' + a.id);
    if (el) { el.textContent = a.icon; el.dataset.tooltip = a.name + ' — ' + a.desc; }
    $('toast-name').textContent = '#' + a.name;
    const toast = $('achievement-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  });
}

/* ============================================================================
   BÖLÜM 9: ZAMANLAYICI VE OYUN SONU
   ============================================================================ */
function startTimer() {
  $('timer-box').style.display = '';
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    $('timer').textContent = formatTime(Math.max(0, state.timeLeft));
    $('timer-box').classList.toggle('warn', state.timeLeft <= 300);
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      state.ended = true;
      closeAllPanels();
      markersDirty = true;
      $('timeup-stats').textContent =
        state.guessed.size + ' / ' + ALL_NAMES.length + ' ülke buldun · ' +
        state.wrongCount + ' yanlış · ' + state.hintCount + ' ipucu';
      $('timeup-overlay').classList.add('visible');
    }
  }, 1000);
}

function elapsedText() {
  const sec = Math.floor((Date.now() - state.startTime) / 1000);
  return formatTime(sec);
}
function showWin() {
  $('win-stats').textContent =
    state.wrongCount + ' yanlış tahmin · ' + state.hintCount + ' ipucu · süre: ' + elapsedText();
  $('win-overlay').classList.add('visible');
  if (state.timerInterval) clearInterval(state.timerInterval);
}

$('restart-btn').addEventListener('click', () => location.reload());
$('timeup-restart-btn').addEventListener('click', () => location.reload());
$('timeup-continue-btn').addEventListener('click', () => {
  state.ended = false;
  state.mode = 'free';
  $('timer-box').style.display = 'none';
  $('timeup-overlay').classList.remove('visible');
  markersDirty = true;
});
document.querySelectorAll('.overlay-close').forEach(btn =>
  btn.addEventListener('click', () => $(btn.dataset.close).classList.remove('visible')));
['win-overlay', 'timeup-overlay'].forEach(id =>
  $(id).addEventListener('click', e => { if (e.target === $(id)) $(id).classList.remove('visible'); }));

/* ============================================================================
   BÖLÜM 10: BAŞLATMA — kütüphaneler → veri → küre → başlangıç ekranı
   ============================================================================ */
function setLoad(pct, msg) {
  $('loading-bar').style.width = pct + '%';
  if (msg) $('loading-status').textContent = msg;
}

/* İyileştirilmiş sınır verisini geojson olarak indir (başlangıç ekranındaki bağlantı) */
function exportGeojson() {
  if (!WORLD) return;
  const out = {
    type: 'FeatureCollection',
    features: WORLD.features.map(f => ({
      type: 'Feature',
      properties: {
        name: f.properties.name,
        continent: f.properties.continent,
        baskent: (COUNTRY_INFO[f.properties.name] || [])[0],
        nufus: (COUNTRY_INFO[f.properties.name] || [])[1],
        dil: (COUNTRY_INFO[f.properties.name] || [])[2],
        yuzolcumu_km2: (COUNTRY_INFO[f.properties.name] || [])[3],
        yerel_ad: NATIVE_NAME[f.properties.name] || f.properties.name
      },
      geometry: f.geometry
    }))
  };
  const blob = new Blob([JSON.stringify(out)], { type: 'application/geo+json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dunya_ulkeleri.geojson';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
$('export-link').addEventListener('click', exportGeojson);

/* --- Başlangıç ekranı: dönen coğrafya bilgileri ("Biliyor muydun?") --- */
const TRIVIA = [
  "En küçük ülke Vatikan'dır: 0,49 km² — birçok çiftlikten bile küçük.",
  "Rusya 11 saat dilimine yayılır; bir ucunda sabahken diğerinde gece olur.",
  "Kazakistan, denize kıyısı olmayan en büyük ülkedir.",
  "Endonezya 17 binden fazla adadan oluşur.",
  "Nepal, dikdörtgen olmayan bayrağa sahip tek ülkedir.",
  "Çin ve Rusya, 14'er kara komşusuyla dünya rekorunu paylaşır.",
  "Lesotho, San Marino ve Vatikan: tamamı tek bir ülkeyle çevrili üç ülke.",
  "Afrika, 54 ülkeyle en çok ülke barındıran kıtadır.",
  "Kanada, dünyanın en uzun kıyı şeridine sahiptir (~202.000 km).",
  "Bolivya'nın iki, Güney Afrika'nın üç başkenti vardır.",
  "Dünya nüfusunun yaklaşık %60'ı Asya'da yaşar.",
  "Türkiye, hem Avrupa hem Asya'da toprağı olan sayılı ülkelerden biridir."
];
let triviaTimer = null;
function startTriviaRotation() {
  const el = $('trivia-text');
  if (!el) return;
  let i = Math.floor(Math.random() * TRIVIA.length);
  const show = () => { el.style.opacity = 0; setTimeout(() => { el.textContent = TRIVIA[i % TRIVIA.length]; el.style.opacity = 1; i++; }, 250); };
  el.textContent = TRIVIA[i % TRIVIA.length]; i++;
  triviaTimer = setInterval(show, 7000);
}

function startGame(mode) {
  state.mode = mode;
  state.startTime = Date.now();
  $('start-overlay').classList.remove('visible');
  if (triviaTimer) { clearInterval(triviaTimer); triviaTimer = null; }
  if (world) world.controls().autoRotate = false;
  if (mode === 'timed') startTimer();
}
$('mode-timed').addEventListener('click', () => startGame('timed'));
$('mode-free').addEventListener('click', () => startGame('free'));
/* Düello: önce kurallar ekranı, sonra başlat */
$('mode-duel').addEventListener('click', () => {
  $('start-overlay').classList.remove('visible');
  $('duel-overlay').classList.add('visible');
});
$('duel-start-btn').addEventListener('click', startDuel);
$('duel-cancel-btn').addEventListener('click', () => {
  cleanupPeer();
  netStatus('');
  $('duel-overlay').classList.remove('visible');
  $('start-overlay').classList.add('visible');
});
$('duel-host-btn').addEventListener('click', duelHost);
$('duel-join-btn').addEventListener('click', duelJoin);
$('duel-code-input').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
$('duel-code-input').addEventListener('keydown', e => { if (e.key === 'Enter') duelJoin(); });

window.addEventListener('resize', () => {
  if (world) world.width(window.innerWidth).height(window.innerHeight);
  markersDirty = true;
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllPanels();
});

async function init() {
  try {
    /* Toplam ülke sayısını gösteren tüm alanları doldur (198) */
    document.querySelectorAll('.js-total').forEach(e => { e.textContent = ALL_NAMES.length; });
    setLoad(5, 'Kütüphaneler yükleniyor…');
    for (const lib of CONFIG.libs) {
      if (!await loadWithFallback(lib)) throw new Error('Kütüphane yüklenemedi: ' + lib[0]);
    }
    if (!window.Globe || !window.topojson || !window.topojson.presimplify)
      throw new Error('Kütüphaneler eksik yüklendi. Sayfayı yenileyin.');
    setLoad(15, 'Sınır verisi indiriliyor… (~0,8 MB)');
    WORLD = await loadBorders(setLoad);
    WORLD.features.forEach(f => { FEATURE_OF[f.properties.name] = f; });
    $('prog-count').textContent = '0';
    setLoad(65, '3B küre kuruluyor…');
    await buildGlobe(setLoad);
    buildList();
    initAchievements();
    buildMarkers();
    markersTick();
    updateProgressUI();
    /* Küre hazır olunca başlangıç ekranına geç */
    let shown = false;
    const showStart = () => {
      if (shown) return;
      shown = true;
      setLoad(100, 'Hazır!');
      setTimeout(() => {
        $('loading-overlay').classList.remove('visible');
        $('start-overlay').classList.add('visible');
        startTriviaRotation();
      }, 250);
    };
    if (world.onGlobeReady) world.onGlobeReady(showStart);
    setTimeout(showStart, 3500);   /* güvence: en geç 3,5 sn sonra */
  } catch (err) {
    console.error(err);
    $('loading-status').innerHTML =
      '⚠ ' + (err.message || 'Bir hata oluştu.') +
      '<br><br><button class="primary-btn" onclick="location.reload()">Yeniden Dene</button>';
  }
}
window.addEventListener('DOMContentLoaded', init);
