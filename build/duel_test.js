/* ⚔️ Düello modu simülasyonu: puanlama kurallarını uçtan uca doğrular */
const fs = require('fs'), vm = require('vm');
const data = fs.readFileSync('data_final.js', 'utf8');
const game = fs.readFileSync('tpl_game.js', 'utf8');

/* --- Minimal DOM taklidi --- */
function mkEl() {
  const el = {
    textContent: '', innerHTML: '', value: '', className: '',
    style: {}, dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(){}, focus(){}, click(){}, appendChild(){},
    querySelector(){ return mkEl(); }, querySelectorAll(){ return []; },
    setAttribute(){}, removeAttribute(){}
  };
  return el;
}
const els = new Map();
const getEl = id => { if (!els.has(id)) els.set(id, mkEl()); return els.get(id); };
const timers = [];
const ctx = {
  console, Math, JSON, Object, Array, Map, Set, Number, String, parseInt, isFinite, Date, Promise,
  Infinity, encodeURIComponent, CSS: { escape: s => s },
  document: {
    getElementById: getEl,
    querySelectorAll: () => [],
    createElement: () => mkEl(),
    addEventListener(){},
    head: mkEl(), body: mkEl()
  },
  window: { addEventListener(){}, innerWidth: 1280, innerHeight: 800 },
  requestAnimationFrame: () => 0,
  setTimeout: fn => { timers.push(fn); return timers.length; },
  clearTimeout(){}, setInterval: () => 1, clearInterval(){},
  Image: function(){ return mkEl(); },
  fetch: async () => ({ ok: false }),
  location: { reload(){} },
  URL: { createObjectURL: () => '', revokeObjectURL(){} },
  Blob: function(){},
  topojson: {}, Globe: null
};
vm.createContext(ctx);
vm.runInContext(data, ctx);
vm.runInContext(game, ctx);
const flush = () => { const t = timers.splice(0); t.forEach(fn => fn()); };

const S = vm.runInContext('state', ctx);
const errs = [];
const chk = (cond, msg) => { if (!cond) errs.push(msg); };

/* --- Senaryo başlat --- */
vm.runInContext('startDuel()', ctx);
const mp = S.mp;
const P = mp.players;
chk(S.mode === 'duel' && mp.queue.length === 198 && mp.qi === 1, 'düello kurulumu bozuk');
chk(S.activeCountry === mp.queue[0], 'ilk ülke seçilmedi');

const input = getEl('guess-input');
const answer = () => { input.value = S.activeCountry; vm.runInContext('checkGuess()', ctx); flush(); flush(); };
const wrongTry = () => { input.value = 'kesinlikleyanlisbirsey'; vm.runInContext('checkGuess()', ctx); };

/* 1) P0 doğru bilir: +50, temiz seri 1, sıra P1'e geçer */
answer();
chk(P[0].score === 1050, '1) doğru +50 değil: ' + P[0].score);
chk(P[0].cleanStreak === 1, '1) temiz seri 1 değil');
chk(mp.turn === 1, '1) sıra P1e geçmedi');
chk(S.guessed.size === 1, '1) guessed eklenmedi');

/* 2) P1 önce yanlış (−25) sonra doğru (+50): 1025; temiz seri 0 kalır */
wrongTry();
chk(P[1].score === 975, '2) yanlış −25 değil: ' + P[1].score);
answer();
chk(P[1].score === 1025, '2) düzeltme sonrası 1025 değil: ' + P[1].score);
chk(P[1].cleanStreak === 0, '2) kirli turda temiz seri sıfırlanmadı');
chk(mp.turn === 0, '2) sıra P0a dönmedi');

/* 3) P0 ipucu alır (−20, tek sefer), sonra doğru bilir: temiz seri sıfırlanmış olmalı */
vm.runInContext('showHint()', ctx);
vm.runInContext('showHint()', ctx);   /* ikinci basış ücretsiz */
chk(P[0].score === 1030, '3) ipucu −20 (tek sefer) değil: ' + P[0].score);
answer();
chk(P[0].score === 1080, '3) +50 gelmedi: ' + P[0].score);
chk(P[0].cleanStreak === 0, '3) ipuculu turda temiz seri sıfırlanmadı');

/* 4) P1 pas geçer: −100, ülke "revealed" olur, sıra döner */
const passed = S.activeCountry;
vm.runInContext('duelPass()', ctx); flush();
chk(P[1].score === 925, '4) pas −100 değil: ' + P[1].score);
chk(S.revealed.has(passed), '4) ülke açıklanmadı');
chk(mp.turn === 0, '4) sıra dönmedi');

/* 5) Temiz seri bonusu: P0 üst üste 10 temiz bilir (P1 turlarında kirli +25) */
while (P[0].cleanStreak < 10) {
  if (mp.turn === 0) answer();
  else { wrongTry(); answer(); }      /* P1 hep kirli: seri tutmaz */
}
/* P0: 1080 + 10*50 + 500 bonus = 2080 */
chk(P[0].score === 2080, '5) 10 temiz seri bonusu yanlış: ' + P[0].score + ' (beklenen 2080)');
chk(!S.ended, '5) oyun erken bitti');

/* 6) Eleme: P1 puanı 20ye düşürülür, pas → 0 → P0 kazanır */
P[1].score = 20;
while (mp.turn !== 1) answer();
vm.runInContext('duelPass()', ctx); flush();
chk(S.ended === true, '6) puanı biten kaybetmedi');
chk(P[1].score === 0, '6) puan 0a sabitlenmedi: ' + P[1].score);
chk(getEl('win-title').textContent.includes('1. Oyuncu'), '6) kazanan yanlış: ' + getEl('win-title').textContent);

/* 7) Tükenme senaryosu: taze oyun, kuyruk kısaltılır, yüksek puan kazanır */
els.clear(); timers.length = 0;
vm.runInContext('state.ended = false; state.mp = null; state.guessed = new Set(); state.revealed = new Set(); startDuel()', ctx);
const S2 = vm.runInContext('state', ctx);
S2.mp.queue = S2.mp.queue.slice(0, S2.mp.qi + 1);   /* 2 ülke toplam */
S2.mp.players[0].score = 1300; S2.mp.players[1].score = 900;
getEl('guess-input').value = S2.activeCountry; vm.runInContext('checkGuess()', ctx); flush(); flush();  /* P0 bilir → son ülke P1e */
getEl('guess-input').value = S2.activeCountry; vm.runInContext('checkGuess()', ctx); flush(); flush();  /* P1 bilir → kuyruk bitti */
flush();
chk(S2.ended === true, '7) kuyruk bitince oyun bitmedi');
chk(getEl('win-title').textContent.includes('1. Oyuncu'), '7) yüksek puanlı kazanmadı: ' + getEl('win-title').textContent);

if (errs.length) { console.log('❌ DÜELLO TESTLERİ:'); errs.forEach(e => console.log(' -', e)); process.exit(1); }
console.log('✅ Düello simülasyonu geçti: doğru/yanlış/ipucu/pas puanlaması, temiz seri bonusu, eleme ve tükenme senaryoları.');
