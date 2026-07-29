/* 🌐 Çevrimiçi düello simülasyonu: iki sanal istemci, sahte PeerJS ile eşlenir */
const fs = require('fs'), vm = require('vm');
const data = fs.readFileSync('data_final.js', 'utf8');
const game = fs.readFileSync('tpl_game.js', 'utf8');

/* --- Sahte PeerJS (iki bağlam arasında köprü) --- */
const reg = {};
const netQ = [];
class FakeConn {
  constructor() { this.h = {}; this.other = null; this._open = false; }
  on(ev, fn) { this.h[ev] = fn; if (ev === 'open' && this._open) fn(); }
  send(x) { netQ.push({ conn: this.other, msg: JSON.parse(JSON.stringify(x)) }); }
  close() { const o = this.other; if (o && o.h.close) o.h.close(); }
}
class FakePeer {
  constructor(id) {
    this.id = id || ('anon-' + Math.random().toString(36).slice(2));
    this.h = {}; this.pend = []; this._open = true;
    reg[this.id] = this;
  }
  on(ev, fn) {
    this.h[ev] = fn;
    if (ev === 'open' && this._open) fn(this.id);
    if (ev === 'connection') this.pend.splice(0).forEach(fn);
  }
  connect(rid) {
    const a = new FakeConn(), b = new FakeConn();
    a.other = b; b.other = a;
    const remote = reg[rid];
    if (!remote) { if (this.h.error) this.h.error({ type: 'peer-unavailable' }); return a; }
    a._open = true; b._open = true;
    if (remote.h.connection) remote.h.connection(b); else remote.pend.push(b);
    if (a.h.open) a.h.open();
    return a;
  }
  destroy() { delete reg[this.id]; }
}

function makeCtx(tag) {
  function mkEl() {
    return {
      textContent: '', innerHTML: '', value: '', className: '', style: {}, dataset: {},
      classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      addEventListener(){}, focus(){}, click(){}, appendChild(){},
      querySelector(){ return mkEl(); }, querySelectorAll(){ return []; },
      setAttribute(){}, removeAttribute(){}
    };
  }
  const els = new Map();
  const getEl = id => { if (!els.has(id)) els.set(id, mkEl()); return els.get(id); };
  const timers = [];
  const ctx = {
    console, Math, JSON, Object, Array, Map, Set, Number, String, parseInt, isFinite, Date,
    Promise, Infinity, encodeURIComponent, CSS: { escape: s => s },
    document: { getElementById: getEl, querySelectorAll: () => [], createElement: () => mkEl(),
                addEventListener(){}, head: mkEl(), body: mkEl() },
    window: { addEventListener(){}, innerWidth: 1280, innerHeight: 800, Peer: FakePeer },
    requestAnimationFrame: () => 0,
    setTimeout: fn => { timers.push(fn); return timers.length; },
    clearTimeout(){}, setInterval: () => 1, clearInterval(){},
    Image: function(){ return mkEl(); }, fetch: async () => ({ ok: false }),
    location: { reload(){} }, URL: { createObjectURL: () => '', revokeObjectURL(){} }, Blob: function(){},
    topojson: {}, Globe: null
  };
  vm.createContext(ctx);
  vm.runInContext(data, ctx);
  vm.runInContext(game, ctx);
  return {
    tag, ctx, els, getEl,
    flush() { const t = timers.splice(0); t.forEach(fn => fn()); },
    ev(code) { return vm.runInContext(code, ctx); }
  };
}
function drainNet() {
  while (netQ.length) {
    const { conn, msg } = netQ.shift();
    if (conn && conn.h.data) conn.h.data(msg);
  }
}
function settle(H, G, rounds) {
  for (let i = 0; i < (rounds || 6); i++) { drainNet(); H.flush(); G.flush(); }
}

(async () => {
  const errs = [];
  const chk = (c, m) => { if (!c) errs.push(m); };
  const H = makeCtx('host'), G = makeCtx('guest');

  H.getEl('duel-nick').value = 'Eren';
  await H.ev('duelHost()');
  const code = H.ev('duelNet.code');
  chk(typeof code === 'string' && code.length === 5, 'oda kodu üretilmedi');
  chk(H.getEl('duel-net-status').innerHTML.includes(code), 'oda kodu ekranda değil');

  G.getEl('duel-nick').value = 'Melih';
  G.getEl('duel-code-input').value = code.toLowerCase();
  await G.ev('duelJoin()');
  settle(H, G);

  const hs = H.ev('state'), gs = G.ev('state');
  chk(hs.mp && gs.mp, 'eşleşme kurulamadı');
  chk(hs.mp && hs.mp.online && gs.mp && gs.mp.online, 'çevrimiçi bayrağı yok');
  chk(hs.mp.myIdx === 0 && gs.mp.myIdx === 1, 'taraflar yanlış');
  chk(JSON.stringify(hs.mp.queue) === JSON.stringify(gs.mp.queue), 'kuyruklar farklı!');
  chk(hs.mp.turn === gs.mp.turn, 'başlangıç sırası farklı');
  chk(hs.mp.players[0].label === 'Eren' && hs.mp.players[1].label === 'Melih', 'ev sahibi etiketleri yanlış');
  chk(gs.mp.players[0].label === 'Eren' && gs.mp.players[1].label === 'Melih', 'konuk etiketleri yanlış');
  chk(hs.activeCountry === gs.activeCountry && !!hs.activeCountry, 'aktif ülke eşleşmiyor');

  const actor = () => (H.ev('state.mp.turn') === 0 ? H : G);
  const other = () => (actor() === H ? G : H);
  const scores = c => c.ev('state.mp.players.map(p=>p.score).join(",")');
  const sync = m => chk(scores(H) === scores(G) &&
                        H.ev('state.mp.turn') === G.ev('state.mp.turn') &&
                        H.ev('state.mp.qi') === G.ev('state.mp.qi') &&
                        H.ev('state.guessed.size') === G.ev('state.guessed.size') &&
                        H.ev('state.revealed.size') === G.ev('state.revealed.size'),
                        m + ' senkron bozuldu: H[' + scores(H) + ' t' + H.ev('state.mp.turn') + '] G[' + scores(G) + ' t' + G.ev('state.mp.turn') + ']');

  /* 1) doğru bilme */
  let A = actor(), aIdx = A.ev('state.mp.myIdx');
  A.getEl('guess-input').value = A.ev('state.activeCountry');
  A.ev('checkGuess()');
  settle(H, G);
  chk(H.ev('state.mp.players[' + aIdx + '].score') === 1050, '1) +50 (H) değil: ' + scores(H));
  chk(G.ev('state.mp.players[' + aIdx + '].score') === 1050, '1) +50 (G) değil: ' + scores(G));
  sync('1)');

  /* 2) yanlış + düzeltme */
  A = actor(); aIdx = A.ev('state.mp.myIdx');
  const b2 = A.ev('state.mp.players[' + aIdx + '].score');
  A.getEl('guess-input').value = 'tamamenyanlis';
  A.ev('checkGuess()');
  settle(H, G, 2);
  chk(other().ev('state.mp.players[' + aIdx + '].score') === b2 - 25, '2) uzak taraf −25 görmedi');
  A.getEl('guess-input').value = A.ev('state.activeCountry');
  A.ev('checkGuess()');
  settle(H, G);
  chk(H.ev('state.mp.players[' + aIdx + '].score') === b2 + 25, '2) net +25 değil');
  sync('2)');

  /* 3) ipucu tek sefer −20 */
  A = actor(); aIdx = A.ev('state.mp.myIdx');
  const b3 = A.ev('state.mp.players[' + aIdx + '].score');
  A.ev('showHint()'); A.ev('showHint()');
  settle(H, G, 2);
  chk(H.ev('state.mp.players[' + aIdx + '].score') === b3 - 20, '3) ipucu −20 (H) değil');
  chk(G.ev('state.mp.players[' + aIdx + '].score') === b3 - 20, '3) ipucu −20 (G) değil');
  A.getEl('guess-input').value = A.ev('state.activeCountry');
  A.ev('checkGuess()');
  settle(H, G);
  sync('3)');

  /* 4) pas: −100 + iki tarafta açıklama */
  A = actor(); aIdx = A.ev('state.mp.myIdx');
  const b4 = A.ev('state.mp.players[' + aIdx + '].score');
  const passCountry = A.ev('state.activeCountry');
  A.ev('duelPass()');
  settle(H, G);
  chk(H.ev('state.mp.players[' + aIdx + '].score') === b4 - 100, '4) pas −100 değil');
  chk(H.ev('state.revealed.has(' + JSON.stringify(passCountry) + ')'), '4) açıklanmadı (H)');
  chk(G.ev('state.revealed.has(' + JSON.stringify(passCountry) + ')'), '4) açıklanmadı (G)');
  sync('4)');

  /* 5) kopma → hükmen galibiyet */
  const gConn = G.ev('duelNet.conn');
  if (gConn && gConn.h.close) gConn.h.close();
  chk(G.ev('state.ended') === true, '5) kopmada oyun bitmedi');
  chk(G.getEl('win-title').textContent.includes('Melih'), '5) hükmen kazanan yanlış: ' + G.getEl('win-title').textContent);

  if (errs.length) { console.log('❌ ÇEVRİMİÇİ TESTLER:'); errs.forEach(e => console.log(' -', e)); process.exit(1); }
  console.log('✅ Çevrimiçi düello simülasyonu geçti: oda kur/katıl, kuyruk senkronu, dört eylemin iki tarafta birebir eşlenmesi, hükmen galibiyet.');
})().catch(e => { console.error('❌ Çalışma hatası:', e); process.exit(1); });
