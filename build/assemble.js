/* Şablonları ve verileri birleştirip nihai index.html'i üretir; veri bütünlüğünü doğrular. */
const fs = require('fs');
const path = require('path');
const B = __dirname;
const UP = '/sessions/focused-upbeat-dijkstra/mnt/uploads';
const OUT = path.join(B, '..');

const readJ = f => JSON.parse(fs.readFileSync(path.join(B, f), 'utf8'));
const continents = readJ('continents.json');
const centroids = readJ('old_centroids.json');
const flagMap = readJ('flag_map.json');
const aliases = readJ('aliases.json');
const oldCounts = readJ('old_counts.json');

/* ============================================================
   OYUN DÜZENLEMELERİ (kullanıcı kararları, Temmuz 2026):
   1) "Kıbrıs" → "Güney Kıbrıs Rum Yönetimi" (TC resmî terminolojisi)
   2) Filistin oyuna eklendi (Asya, NE id 275, bayrak: ps)
   ============================================================ */
const RENAME = { 'Kıbrıs': 'Güney Kıbrıs Rum Yönetimi' };
for (const k of Object.keys(continents)) continents[k] = continents[k].map(n => RENAME[n] || n);
{
  const asya = continents['Asya'];
  if (!asya.includes('Filistin')) {
    const i = asya.indexOf('Filipinler');            /* alfabetik konum */
    asya.splice(i >= 0 ? i + 1 : asya.length, 0, 'Filistin');
  }
}
for (const [oldN, newN] of Object.entries(RENAME)) {
  if (centroids[oldN]) { centroids[newN] = centroids[oldN]; delete centroids[oldN]; }
  if (flagMap[oldN]) { flagMap[newN] = flagMap[oldN]; delete flagMap[oldN]; }
  for (const [a, t] of Object.entries(aliases)) if (t === oldN) aliases[a] = newN;
}
centroids['Filistin'] = [35.26, 31.95];              /* Batı Şeria merkezi */
flagMap['Filistin'] = 'ps';

const ORDER = ["Avrupa", "Asya", "Kuzey Amerika", "Güney Amerika", "Afrika", "Okyanusya"];
const names = ORDER.flatMap(c => continents[c]);
console.log('Toplam ülke:', names.length);

/* --- Eski oyundan mikro ülke yedek geometrileri (eski nokta sayısı ≤ 8) ---
   (Kıbrıs/KKTC artık gömülmüyor: OSM dosyaları karasuları içerdiğinden
    her iki ülke de Natural Earth kara sınırlarından geliyor.) --- */
const vm = require('vm');
const html = fs.readFileSync(path.join(UP, 'index.html'), 'utf8');
const gStart = html.indexOf('=', html.search(/const GEOJSON = /)) + 1;
const oldGeo = vm.runInNewContext('(' + html.slice(gStart, html.indexOf(';\n', gStart)) + ')');
const microFallback = {};
for (const f of oldGeo.features) {
  const n = f.properties.name;
  if (oldCounts[n] <= 8 && !['Kıbrıs', 'Kuzey Kıbrıs Türk Cumhuriyeti'].includes(n)) {
    microFallback[n] = f.geometry;
  }
}
console.log('Mikro yedek geometriler:', Object.keys(microFallback).join(', '));

/* --- Eksik merkez noktaları eski geometriden tamamla --- */
let missingCent = 0;
for (const f of oldGeo.features) {
  const n = RENAME[f.properties.name] || f.properties.name;
  if (!centroids[n]) {
    const ring = (f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates[0])[0];
    let sx = 0, sy = 0;
    ring.forEach(p => { sx += p[0]; sy += p[1]; });
    centroids[n] = [sx / ring.length, sy / ring.length];
    missingCent++;
  }
}
console.log('Sonradan hesaplanan merkez:', missingCent);

/* --- Şablonları birleştir --- */
let data = fs.readFileSync(path.join(B, 'tpl_data.js'), 'utf8');
data = data
  .replace('__CONTINENTS__', JSON.stringify(continents))
  .replace('__CENTROIDS__', JSON.stringify(centroids))
  .replace('__FLAG_MAP__', JSON.stringify(flagMap))
  .replace('__ALIASES_BASE__', JSON.stringify(aliases))
  .replace('__OLD_MICRO__', JSON.stringify(microFallback));

const head = fs.readFileSync(path.join(B, 'tpl_head.html'), 'utf8');
const game = fs.readFileSync(path.join(B, 'tpl_game.js'), 'utf8');
const final = head + '\n<script>\n' + data + '\n</script>\n<script>\n' + game + '\n</script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(OUT, 'index.html'), final);
fs.writeFileSync(path.join(B, 'data_final.js'), data);  /* sözdizimi denetimi için */
console.log('index.html yazıldı:', (final.length / 1024).toFixed(0) + ' KB');

/* ============================ DOĞRULAMA ============================ */
const ctx = {};
vm.runInNewContext(data + '\n;__x = { CONTINENTS, CENTROIDS, FLAG_MAP, ALIASES, COUNTRY_INFO, NE_ID_TO_GAME, NE_NAME_FIX, OLD_MICRO_FALLBACK, KKTC_FLAG_URL, CONTINENTS_ORDER };',
  Object.assign(ctx, { encodeURIComponent }));
const D = ctx.__x;
let errors = [];

/* 1) Ülke sayısı ve tutarlılık */
if (names.length !== 198) errors.push('Ülke sayısı 198 değil: ' + names.length);
for (const n of names) {
  if (!D.FLAG_MAP[n]) errors.push('Bayrak yok: ' + n);
  if (!D.CENTROIDS[n]) errors.push('Merkez yok: ' + n);
  if (!D.COUNTRY_INFO[n]) errors.push('Künye yok: ' + n);
}
/* 2) Fazladan künye anahtarı (ad uyuşmazlığı) var mı? */
for (const k of Object.keys(D.COUNTRY_INFO)) {
  if (!names.includes(k)) errors.push('Künye anahtarı oyunda yok: ' + k);
}
/* 3) NE eşleme kapsamı: HER ülkeye (Kıbrıs çifti dahil) ISO kodu veya ad eşlemesi düşmeli */
const covered = new Set(Object.values(D.NE_ID_TO_GAME));
for (const v of Object.values(D.NE_NAME_FIX)) if (v) covered.add(v);
for (const n of names) {
  if (!covered.has(n)) errors.push('Natural Earth eşlemesi eksik: ' + n);
}
/* 4) Takma adlar geçerli ülkelere işaret ediyor mu? */
for (const [a, t] of Object.entries(D.ALIASES)) {
  if (!names.includes(t)) errors.push('Takma ad hedefi geçersiz: ' + a + ' → ' + t);
}
/* 5) Künye makul mü? (nüfus/alan pozitif; dünya toplamları mantıklı mı) */
let popSum = 0, areaSum = 0;
for (const [n, i] of Object.entries(D.COUNTRY_INFO)) {
  if (!(i[1] > 0) || !(i[3] > 0)) errors.push('Künye hatalı: ' + n);
  popSum += i[1]; areaSum += i[3];
}
console.log('Nüfus toplamı:', (popSum / 1e9).toFixed(2) + ' milyar (beklenen ~8,1)');
console.log('Alan toplamı:', (areaSum / 1e6).toFixed(1) + ' M km² (beklenen ~135)');
if (popSum < 7.5e9 || popSum > 8.8e9) errors.push('Nüfus toplamı şüpheli: ' + popSum);
if (areaSum < 125e6 || areaSum > 142e6) errors.push('Alan toplamı şüpheli: ' + areaSum);
/* 6) ISO kod eşlemesi ↔ bayrak kodu çapraz denetimi (bilinen istisnalar dışında benzersizlik) */
const idNames = Object.values(D.NE_ID_TO_GAME);
const dupTargets = idNames.filter((v, i) => idNames.indexOf(v) !== i);
const allowedDup = new Set(['Fas', 'Sudan']);
for (const d of new Set(dupTargets)) if (!allowedDup.has(d)) errors.push('Beklenmeyen çift ISO eşlemesi: ' + d);
/* 7) Kıbrıs çifti + Filistin NE eşlemesinde doğru hedeflere bağlı mı? */
if (D.NE_ID_TO_GAME[196] !== 'Güney Kıbrıs Rum Yönetimi') errors.push('196 → GKRY eşlemesi yok');
if (D.NE_NAME_FIX['N. Cyprus'] !== 'Kuzey Kıbrıs Türk Cumhuriyeti') errors.push('N. Cyprus → KKTC eşlemesi yok');
if (D.NE_ID_TO_GAME[275] !== 'Filistin') errors.push('275 → Filistin eşlemesi yok');
/* 8) Alfabe verisi: her COUNTRY_SCRIPT anahtarı geçerli ülke + geçerli yazı sistemi */
const SC = vm.runInNewContext(data + ';({ COUNTRY_SCRIPT, SCRIPTS })', { encodeURIComponent });
for (const [n, s] of Object.entries(SC.COUNTRY_SCRIPT)) {
  if (!names.includes(n)) errors.push('Alfabe kaydı oyunda olmayan ülkeye: ' + n);
  if (!SC.SCRIPTS[s]) errors.push('Tanımsız yazı sistemi: ' + s + ' (' + n + ')');
}
if (!SC.SCRIPTS.latin) errors.push('Varsayılan latin yazı sistemi eksik');
console.log('Alfabe kaydı olan ülke:', Object.keys(SC.COUNTRY_SCRIPT).length, '(kalanı Latin)');
/* 9) Yerel adlar (endonimler): anahtarlar geçerli ülkeler olmalı */
const NN = vm.runInNewContext(data + ';NATIVE_NAME', { encodeURIComponent });
for (const n of Object.keys(NN)) {
  if (!names.includes(n)) errors.push('Yerel ad kaydı oyunda olmayan ülkeye: ' + n);
}
console.log('Yerel ad kaydı:', Object.keys(NN).length, '(Türkçeyle aynı olanlar hariç)');

if (errors.length) { console.log('\n❌ HATALAR:'); errors.forEach(e => console.log(' -', e)); process.exit(1); }
console.log('\n✅ Tüm veri doğrulamaları geçti.');
