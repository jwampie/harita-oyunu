const fs = require('fs');
const html = fs.readFileSync('../index.html', 'utf8');
const errs = [];

// 1) Yerine konmamış şablon yer tutucusu kalmış mı?
const ph = html.match(/__[A-Z_]+__/g);
if (ph) errs.push('Yer tutucu kaldı: ' + [...new Set(ph)].join(', '));

// 2) Script bloklarını çıkar ve sözdizimini denetle
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
console.log('Satır içi script sayısı:', scripts.length);
scripts.forEach((s, i) => {
  fs.writeFileSync('/tmp/chk' + i + '.js', s);
  try { require('child_process').execSync('node --check /tmp/chk' + i + '.js', { stdio: 'pipe' }); }
  catch (e) { errs.push('Script ' + i + ' sözdizimi hatası: ' + e.stderr.toString().slice(0, 300)); }
});

// 3) JS'te başvurulan tüm kimlikler HTML'de var mı?
const jsIds = new Set();
for (const m of scripts.join('\n').matchAll(/\$\('([^']+)'\)/g)) jsIds.add(m[1]);
for (const m of scripts.join('\n').matchAll(/getElementById\('([^']+)'\)/g)) jsIds.add(m[1]);
const dynamicPrefixes = ['label-', 'ach-'];
for (const id of jsIds) {
  if (dynamicPrefixes.some(p => id.startsWith(p))) continue;
  if (!new RegExp('id="' + id + '"').test(html)) errs.push('HTML\'de eksik kimlik: #' + id);
}
console.log('Denetlenen kimlik sayısı:', jsIds.size);

// 4) HTML'deki data-close hedefleri var mı?
for (const m of html.matchAll(/data-close="([^"]+)"/g)) {
  if (!new RegExp('id="' + m[1] + '"').test(html)) errs.push('data-close hedefi yok: ' + m[1]);
}

// 5) Kritik dış bağlantı biçimleri
['world-atlas@2/countries-50m.json', 'globe.gl@2/dist/globe.gl.min.js',
 'topojson-client@3/dist/topojson-client.min.js', 'topojson-simplify@3/dist/topojson-simplify.min.js',
 'three-globe/example/img/', 'flagcdn.com'].forEach(u => {
  if (!html.includes(u)) errs.push('Beklenen bağlantı yok: ' + u);
});

// 6) Boyut ve Kıbrıs verisi kontrolü
console.log('Dosya boyutu:', (html.length / 1024).toFixed(0), 'KB');
if (!html.includes('196: "Güney Kıbrıs Rum Yönetimi"')) errs.push('196 → GKRY eşlemesi yok');
if (!html.includes('"N. Cyprus": "Kuzey Kıbrıs Türk Cumhuriyeti"')) errs.push('N. Cyprus → KKTC eşlemesi yok');
if (html.includes('KIBRIS_GEO')) errs.push('KIBRIS_GEO kalıntısı var');
if (!html.includes('depthWrite = false')) errs.push('flicker düzeltmesi yok');
if (!html.includes('Güney Kıbrıs Rum Yönetimi')) errs.push('GKRY adı yok');
if (!html.includes('275: "Filistin"')) errs.push('Filistin NE eşlemesi yok');
if (!html.includes('COUNTRY_SCRIPT')) errs.push('alfabe verisi yok');
if (!html.includes('mode-card')) errs.push('yeni başlangıç ekranı yok');
if (html.includes('/ 197<')) errs.push('sabit 197 kalıntısı var');
if (!html.includes('NATIVE_NAME')) errs.push('yerel ad verisi yok');
if (!html.includes('id="mp-bar"')) errs.push('düello skor çubuğu yok');
if (!html.includes('id="mode-duel"')) errs.push('düello mod kartı yok');
if (!html.includes('polygonCapCurvatureResolution')) errs.push('tessellasyon özellik-algılaması yok');
if (/^\s*\.polygonCurvatureResolution\(/m.test(html)) errs.push('KIRIK zincir çağrısı hâlâ duruyor!');
if (!html.includes("typeof world.polygonCapCurvatureResolution === 'function'")) errs.push('özellik-algılama koruması yok');
if (!html.includes('id="info-native"')) errs.push('yerel ad alanı yok');
if (!html.includes('peerjs')) errs.push('PeerJS bağlantısı yok');
if (!html.includes('id="turn-banner"')) errs.push('sıra şeridi yok');
if (!html.includes('id="duel-host-btn"')) errs.push('oda kur düğmesi yok');

if (errs.length) { console.log('\n❌ HATALAR:'); errs.forEach(e => console.log(' -', e)); process.exit(1); }
console.log('\n✅ Bütünleşme denetimleri geçti.');
