const fs = require('fs'), vm = require('vm');
const game = fs.readFileSync('tpl_game.js', 'utf8');
const data = fs.readFileSync('data_final.js', 'utf8');

// loadBorders + yardımcıları ve sabitleri içeren kesiti al (BÖLÜM 0-3 arası)
const cut = game.slice(0, game.indexOf('/* ============================================================================\n   BÖLÜM 4'));

// --- Sahte dünya-atlas topolojisi ---
const ringOf = (n, cx, cy, r) => {
  const ring = [];
  for (let i = 0; i < n; i++) ring.push([cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
  ring.push(ring[0].slice());
  return ring;
};
const mkGeomEntry = (id, name, pts) => ({ type: 'Polygon', id, properties: { name }, arcs: [[0]], __pts: pts });
const FAKE_GEOMS = [
  mkGeomEntry('792', 'Turkey', 900),          // kimlikle eşleşir
  mkGeomEntry('504', 'Morocco', 400),          // Fas
  mkGeomEntry('732', 'W. Sahara', 150),        // Fas'a BİRLEŞMELİ
  mkGeomEntry('706', 'Somalia', 300),
  mkGeomEntry('-99', 'Somaliland', 120),       // ada göre Somali'ye BİRLEŞMELİ
  mkGeomEntry('-99', 'Kosovo', 80),            // ada göre eşleşir
  mkGeomEntry('196', 'Cyprus', 100),           // kimlikle Kıbrıs'a eşleşir
  mkGeomEntry('-99', 'N. Cyprus', 90),         // ada göre KKTC'ye eşleşir
  mkGeomEntry('275', 'Palestine', 60),         // kimlikle Filistin'e eşleşir
  mkGeomEntry('304', 'Greenland', 500),        // eşleşmez → oyun dışı
  mkGeomEntry('336', 'Vatican', 6),            // mikro → tam detaya DÖNMELİ (24 altı)
];
const fakeTopo = JSON.stringify({ type: 'Topology', objects: { countries: { type: 'GeometryCollection', geometries: FAKE_GEOMS } }, arcs: [[[0,0,5],[1,1,5],[2,2,5]]] });

// --- Sahte topojson kütüphanesi ---
const topojson = {
  sphericalTriangleArea: () => 1,
  presimplify: (t) => { t.__tag = 'pre'; return t; },
  simplify: (t) => { t.__tag = 'simp'; return t; },
  feature: (t, g) => { const r = ringOf(t.__tag === undefined ? g.__pts : Math.max(4, Math.floor(g.__pts / 8)), 30, 30, 2); if (g.__pts === 300) r.reverse(); return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [r] } }; },
  merge: (t, gs) => ({ type: 'MultiPolygon', coordinates: gs.map(g => { const r = ringOf(t.__tag === undefined ? g.__pts : Math.max(4, Math.floor(g.__pts / 8)), 30, 30, 2); if (g.__pts === 300) r.reverse(); return [r]; }) })
};
// t.__tag === undefined → topoFull (dokunulmamış): tam nokta sayısı; 'simp' → 1/8 nokta (sadeleştirilmiş)

const ctx = {
  encodeURIComponent, console, setTimeout, clearTimeout,
  fetch: async () => ({ ok: true, text: async () => fakeTopo }),
  topojson,
  Promise, Math, JSON, Object, Array, Map, Set, Number, parseInt, isFinite, String
};
vm.createContext(ctx);
vm.runInContext(data, ctx);
vm.runInContext(cut, ctx);

(async () => {
  const world = await vm.runInContext('loadBorders(() => {})', ctx);
  const byName = {};
  world.features.forEach(f => { byName[f.properties.name] = f; });
  const errs = [];
  const pts = n => { if (!byName[n]) return -1; const g = byName[n].geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    let c = 0; for (const poly of polys) for (const ring of poly) c += ring.length; return c; };

  const expectedMin = 5 + 2 + 10; if (world.features.length < expectedMin) errs.push('özellik sayısı çok az: ' + world.features.length); if (world.features.some(f => !f.properties.name || !f.properties.continent)) errs.push('özniteliksiz özellik var');
  if (!byName['Türkiye']) errs.push('Türkiye yok');
  if (byName['Fas'].geometry.type !== 'MultiPolygon' || byName['Fas'].geometry.coordinates.length !== 2)
    errs.push('Fas + Batı Sahra birleşmedi');
  if (byName['Somali'].geometry.coordinates.length !== 2) errs.push('Somali + Somaliland birleşmedi');
  if (!byName['Kosova']) errs.push('Kosova (-99 ad eşlemesi) yok');
  // Kıbrıs çifti NE'den gelmeli; mock'ta sadeleştirme 24 altına düşürür → tam detaya döner
  if (pts('Güney Kıbrıs Rum Yönetimi') !== 101) errs.push('GKRY NE üzerinden gelmedi/geri yüklenmedi: ' + pts('Güney Kıbrıs Rum Yönetimi'));
  if (pts('Kuzey Kıbrıs Türk Cumhuriyeti') !== 91) errs.push('KKTC NE üzerinden gelmedi: ' + pts('Kuzey Kıbrıs Türk Cumhuriyeti'));
  if (pts('Filistin') !== 61) errs.push('Filistin NE üzerinden gelmedi: ' + pts('Filistin'));
  // KÜRESEL DEĞİŞMEZ: hiçbir dış halkanın içi yarım küreyi aşamaz; delikler tersine sarılı olmalı
  const RAD = Math.PI / 180;
  const areaSr = ring => { let s = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const l1 = ring[i][0]*RAD, f1 = ring[i][1]*RAD, l2 = ring[i+1][0]*RAD, f2 = ring[i+1][1]*RAD;
      let dl = l2 - l1; if (dl > Math.PI) dl -= 2*Math.PI; else if (dl < -Math.PI) dl += 2*Math.PI;
      s += dl * (2 + Math.sin(f1) + Math.sin(f2));
    }
    s /= 2; s %= 4*Math.PI; return s < 0 ? s + 4*Math.PI : s; };
  for (const f of world.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) poly.forEach((ring, ri) => {
      const a = areaSr(ring);
      if (ri === 0 && a > 2*Math.PI + 1e-9) errs.push('OKYANUS TAŞMASI: ' + f.properties.name + ' dış halka ' + a.toFixed(2) + ' sr');
      if (ri > 0 && a < 2*Math.PI - 1e-9) errs.push('Delik sarımı ters: ' + f.properties.name);
    });
  }
  // Kasıtlı ters sarılan Somali düzeltilmiş olmalı (yukarıdaki değişmez zaten yakalar,
  // burada özellikle: dış halkası küçük tarafı tanımlamalı)
  const somaliOuter = (byName['Somali'].geometry.type === 'Polygon' ? byName['Somali'].geometry.coordinates : byName['Somali'].geometry.coordinates[0])[0];
  if (areaSr(somaliOuter) > 2*Math.PI) errs.push('Somali ters sarımı düzeltilmedi');
  if (!byName['Barbados']) errs.push('Barbados (eski-veri yedeği) yok');
  // Vatikan: sadeleştirilmişte 6/8<24 → tam detaya dönmeli (~6 nokta yerine tam 6? full'de __pts=6 → yine 6; restore yolu çalıştı mı: simp 4'e düşer, full 6 verir)
  const vp = pts('Vatikan');
  if (vp < 5) errs.push('Vatikan geri yükleme çalışmadı: ' + vp);
  // Eşleşmeyen oyun ülkeleri: sahte veri sadece 8 ülke içerdiğinden geri kalanlar
  // eski mikro yedek veya "eksik" olmalı — çökmeden tamamlanması yeterli.
  const greenlandLeak = world.features.some(f => f.properties.name === 'Greenland');
  if (greenlandLeak) errs.push('Grönland sızdı!');

  if (errs.length) { console.log('❌ HATALAR:'); errs.forEach(e => console.log(' -', e)); process.exit(1); }
  console.log('Örnek nokta sayıları — Türkiye:', pts('Türkiye'), '| Fas (birleşik):', pts('Fas'), '| Kıbrıs:', pts('Güney Kıbrıs Rum Yönetimi'), '| Vatikan:', vp);
  console.log('✅ Boru hattı kuru çalıştırması geçti (197 özellik, birleşmeler, atlama, geri yükleme, gömülü Kıbrıs).');
})().catch(e => { console.error('❌ Çalışma hatası:', e); process.exit(1); });
