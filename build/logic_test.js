const fs = require('fs'), vm = require('vm');
const game = fs.readFileSync('tpl_game.js','utf8');
const data = fs.readFileSync('data_final.js','utf8');

// Veriyi çalıştır
const ctx = { encodeURIComponent };
vm.createContext(ctx);
vm.runInContext(data, ctx);

// Oyun kodundan saf fonksiyonları çek
function grabFn(name){
  const m = game.match(new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}'));
  if(!m) throw new Error(name + ' bulunamadı');
  return m[0];
}
vm.runInContext(grabFn('normalize') + '\n' + grabFn('formatPop') + '\n' + grabFn('formatArea') + '\n' + grabFn('formatTime'), ctx);

const t = vm.runInContext(`
(() => {
  const names = CONTINENTS_ORDER.flatMap(c => CONTINENTS[c]);
  const errs = [];
  // 1) Her ülke kendi adıyla eşleşmeli (normalize öz-tutarlılığı)
  for (const n of names) {
    if (normalize(n).length < 2) errs.push('normalize boş: ' + n);
  }
  // 2) Aksan/tire düzeltmesi: kritik adlar
  const cases = [
    ['sao tome ve principe', 'São Tomé ve Príncipe'],
    ['bosna hersek', 'Bosna-Hersek'],
    ['gine bissau', 'Gine-Bissau'],
    ['nukualofa örnek değil', null],
    ['saint kitts ve nevis', 'Saint Kitts ve Nevis'],
    ['kuzey kibris turk cumhuriyeti', 'Kuzey Kıbrıs Türk Cumhuriyeti'],
    ['turkiye', 'Türkiye'],
    ['cekya', 'Çekya'],
  ];
  for (const [typed, target] of cases) {
    if (!target) continue;
    if (normalize(typed) !== normalize(target)) errs.push('eşleşmedi: "' + typed + '" ↛ ' + target + '  (' + normalize(typed) + ' vs ' + normalize(target) + ')');
  }
  // 3) Takma adlar: normalize edilmiş anahtarlar kendi kendine tutarlı mı?
  for (const [a, tgt] of Object.entries(ALIASES)) {
    if (normalize(a) !== a) errs.push('takma ad normalize değil: "' + a + '" → "' + normalize(a) + '"');
    if (!names.includes(tgt)) errs.push('takma ad hedefi yok: ' + tgt);
  }
  // 4) İki ülke adı normalize sonrası çakışıyor mu? (yanlış kabul riski)
  const seen = {};
  for (const n of names) {
    const k = normalize(n);
    if (seen[k]) errs.push('normalize çakışması: ' + n + ' = ' + seen[k]);
    seen[k] = n;
  }
  // 5) Takma ad, başka bir ülkenin gerçek adıyla çakışmamalı
  for (const a of Object.keys(ALIASES)) {
    if (seen[a] && seen[a] !== ALIASES[a]) errs.push('takma ad gerçek adla çakışıyor: ' + a);
  }
  // 6) Biçimleyiciler
  const f1 = formatPop(1410000000), f2 = formatPop(85700000), f3 = formatPop(800), f4 = formatArea(0.49), f5 = formatTime(65);
  return { errs, samples: [f1, f2, f3, f4, f5], nameCount: names.length };
})()
`, ctx);
console.log('Ülke sayısı:', t.nameCount);
console.log('Biçim örnekleri:', t.samples.join(' | '));
if (t.errs.length) { console.log('❌ HATALAR:'); t.errs.forEach(e => console.log(' -', e)); process.exit(1); }
console.log('✅ Mantık testleri geçti.');
