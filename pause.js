// Shared pause/resume for every game page. Must load in <head> before the game's own script:
// it virtualizes time (rAF, timers, performance.now, Date.now, audio) so games freeze without per-game code.
(function () {
  let paused = false, pauseStartReal = 0, pausedTotal = 0;
  const realPerfNow = performance.now.bind(performance);
  const realDateNow = Date.now;
  performance.now = () => (paused ? pauseStartReal : realPerfNow()) - pausedTotal;
  Date.now = () => realDateNow() - (pausedTotal + (paused ? realPerfNow() - pauseStartReal : 0));

  // requestAnimationFrame: hold callbacks while paused, shift timestamps by paused time.
  const realRaf = window.requestAnimationFrame.bind(window), realCaf = window.cancelAnimationFrame.bind(window);
  const heldFrames = [], canceled = new Set();
  window.requestAnimationFrame = cb => {
    const id = realRaf(ts => {
      if (canceled.delete(id)) return;
      if (paused) { heldFrames.push({ id, cb }); return; }
      cb(ts - pausedTotal);
    });
    return id;
  };
  window.cancelAnimationFrame = id => { canceled.add(id); realCaf(id); };

  // setTimeout / setInterval: pausable virtual timers.
  const rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  const timers = new Map();
  let nextId = 1;
  const arm = (id, t, delay) => { t.start = realPerfNow(); t.remaining = delay; if (!paused) t.real = rST(() => fire(id), delay); };
  const fire = id => {
    const t = timers.get(id);
    if (!t) return;
    if (t.interval) arm(id, t, t.delay); else timers.delete(id);
    t.fn.apply(window, t.args);
  };
  const add = (fn, delay, args, interval) => {
    if (typeof fn !== 'function') return 0;
    const id = nextId++, d = Math.max(0, +delay || 0);
    const t = { fn, args, delay: interval ? Math.max(4, d) : d, interval };
    timers.set(id, t);
    arm(id, t, t.delay);
    return id;
  };
  const clear = id => { const t = timers.get(id); if (t) { rCT(t.real); timers.delete(id); } };
  window.setTimeout = (fn, delay, ...args) => add(fn, delay, args, false);
  window.setInterval = (fn, delay, ...args) => add(fn, delay, args, true);
  window.clearTimeout = clear;
  window.clearInterval = clear;

  // Web Audio: track contexts so they can be suspended.
  const audioCtxs = [];
  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const Real = window[name];
    if (!Real) continue;
    const Wrapped = function (...a) { const c = new Real(...a); audioCtxs.push(c); return c; };
    Wrapped.prototype = Real.prototype;
    window[name] = Wrapped;
  }
  const suspended = new Set();

  function pause() {
    if (paused) return;
    paused = true;
    pauseStartReal = realPerfNow();
    for (const t of timers.values()) { rCT(t.real); t.remaining = Math.max(0, t.remaining - (pauseStartReal - t.start)); }
    for (const c of audioCtxs) if (c.state === 'running') { suspended.add(c); c.suspend(); }
    document.documentElement.classList.add('gh-paused');
    overlay.style.display = 'flex';
    btn.textContent = '▶ RESUME';
    resumeBtn.focus();
  }
  function resume() {
    if (!paused) return;
    pausedTotal += realPerfNow() - pauseStartReal;
    paused = false;
    for (const [id, t] of timers) arm(id, t, t.remaining);
    for (const c of suspended) c.resume();
    suspended.clear();
    const frames = heldFrames.splice(0);
    for (const f of frames) if (!canceled.delete(f.id)) realRaf(ts => f.cb(ts - pausedTotal));
    document.documentElement.classList.remove('gh-paused');
    overlay.style.display = 'none';
    btn.textContent = '❚❚ PAUSE';
  }
  const toggle = () => (paused ? resume() : pause());

  // UI
  const style = document.createElement('style');
  style.textContent = `
    #gh-pause-btn { font-family:'Press Start 2P',monospace,sans-serif; font-size:0.55rem; letter-spacing:1px; background:rgba(0,0,0,0.55); color:#fff; border:1px solid rgba(255,255,255,0.6); border-radius:4px; padding:0.6em 0.8em; cursor:pointer; white-space:nowrap; z-index:9998; }
    #gh-pause-btn:hover { background:rgba(0,0,0,0.8); }
    #gh-pause-btn.gh-float { position:fixed; top:10px; right:10px; }
    #gh-pause { position:fixed; inset:0; z-index:9999; display:none; flex-direction:column; align-items:center; justify-content:center; gap:18px; background:rgba(0,0,0,0.88); color:#fff; font-family:'Press Start 2P',monospace,sans-serif; text-align:center; padding:1em; }
    #gh-pause h2 { margin:0; font-size:clamp(1.4rem,6vw,2.6rem); letter-spacing:4px; text-shadow:0 0 16px #fff; }
    #gh-pause p { margin:0; font-size:0.6rem; opacity:0.6; line-height:2; }
    #gh-pause button, #gh-pause a { font-family:inherit; font-size:0.75rem; padding:0.9em 1.6em; border-radius:4px; cursor:pointer; text-decoration:none; }
    #gh-pause button { background:#fff; color:#000; border:none; box-shadow:0 4px 0 #888; }
    #gh-pause a { color:#fff; border:1px solid rgba(255,255,255,0.5); font-size:0.6rem; }
    html.gh-paused body > *:not(#gh-pause), html.gh-paused body > *:not(#gh-pause) * { animation-play-state:paused !important; }
  `;
  const btn = document.createElement('button');
  btn.id = 'gh-pause-btn';
  btn.type = 'button';
  btn.textContent = '❚❚ PAUSE';
  btn.title = 'Pause (P)';
  const overlay = document.createElement('div');
  overlay.id = 'gh-pause';
  overlay.innerHTML = '<h2>PAUSED</h2><button type="button">▶ RESUME</button><p>Press P or Esc to resume</p><a href="index.html">← BACK TO HUB</a>';
  const resumeBtn = overlay.querySelector('button');

  const swallow = e => e.stopPropagation();
  for (const el of [btn, overlay]) for (const ev of ['pointerdown', 'mousedown', 'touchstart', 'click']) el.addEventListener(ev, swallow);
  btn.addEventListener('click', e => { e.preventDefault(); toggle(); btn.blur(); });
  resumeBtn.addEventListener('click', resume);

  // While paused, games must not receive input (releases still pass so held keys/touches don't stick).
  // Capture-phase listeners registered here run before any game's.
  const block = e => {
    if (!paused || (e.target instanceof Node && (overlay.contains(e.target) || btn.contains(e.target)))) return;
    e.stopImmediatePropagation();
    if (e.cancelable) e.preventDefault();
  };
  for (const ev of ['pointerdown', 'pointermove', 'mousedown', 'mousemove', 'touchstart', 'touchmove', 'click', 'contextmenu', 'wheel'])
    window.addEventListener(ev, block, { capture: true, passive: false });
  const typing = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  const onKey = e => {
    if (paused) {
      e.stopImmediatePropagation();
      if ((e.code === 'KeyP' || e.code === 'Escape') && !e.repeat) { e.preventDefault(); resume(); }
      else if (!((e.code === 'Enter' || e.code === 'Space') && document.activeElement === resumeBtn) && e.cancelable) e.preventDefault();
      return;
    }
    if (e.type === 'keydown' && e.code === 'KeyP' && !e.repeat && !typing(document.activeElement)) {
      e.stopImmediatePropagation(); e.preventDefault(); pause();
    }
  };
  window.addEventListener('keydown', onKey, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  function mount() {
    document.head.append(style);
    const spacer = document.querySelector('.topbar .spacer');
    if (spacer) spacer.replaceWith(btn);
    else { btn.classList.add('gh-float'); document.body.append(btn); }
    document.body.append(overlay);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  window.GamerHubPause = { pause, resume, isPaused: () => paused };
})();
