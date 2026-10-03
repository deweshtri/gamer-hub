// Themed background chiptune for every game. Load right after pause.js:
//   <script src="music.js" data-theme="sky"></script>
// Music is synthesized live with Web Audio (no files). It starts on the first tap/key (browser autoplay rules),
// and pause.js freezes it automatically because it suspends every AudioContext and timer.
(function () {
  const theme = (document.currentScript && document.currentScript.dataset.theme) || 'sky';
  const PREF_KEY = 'gamerhub_music';

  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10], harmMinor: [0, 2, 3, 5, 7, 8, 11], majPent: [0, 2, 4, 7, 9],
    minPent: [0, 3, 5, 7, 10], hirajoshi: [0, 2, 3, 7, 8],
  };
  // drums/bass/arp are 16-step patterns. bass: r=root o=octave 5=fifth. arp: chord tone index 0-3.
  const THEMES = {
    sky:     { bpm: 150, root: 60, scale: 'major', prog: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']], k: 'x.......x.......', s: '....x.......x...', h: '..x...x...x...x.', bass: 'r...o...r...o.r.', arp: '0.1.2.1.0.1.2.1.', lead: 'square', arpW: 'triangle', dens: 0.5 },
    zombie:  { bpm: 116, root: 50, scale: 'phrygian', prog: [[0, 'm'], [1, 'M'], [0, 'm'], [10, 'm']], k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', bass: 'rrr.rrr.rrr.r.o.', arp: '0..1..2..1..0...', lead: 'triangle', arpW: 'square', dens: 0.3 },
    ttt:     { bpm: 88, root: 62, scale: 'major', prog: [[0, 'M'], [4, 'm'], [9, 'm'], [5, 'M']], k: 'x.........x.....', s: '....x.......x...', h: '..x...x...x...x.', bass: 'r.......o.....r.', arp: '0.2.1.3.0.2.1.3.', lead: 'triangle', arpW: 'triangle', dens: 0.35, pad: true },
    whack:   { bpm: 164, root: 65, scale: 'major', prog: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']], k: 'x...x...x...x...', s: '....x.......x..x', h: '..x...x...x...x.', bass: 'r.o.r.o.r.o.r.o.', arp: '012.012.012.0123', lead: 'square', arpW: 'square', dens: 0.55 },
    memory:  { bpm: 96, root: 57, scale: 'minPent', prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']], k: 'x.......x.......', s: '................', h: '....x.......x...', bass: 'r.......r.......', arp: '0.1.2.3.2.1.0.1.', lead: 'triangle', arpW: 'triangle', dens: 0.3, pad: true },
    penalty: { bpm: 128, root: 60, scale: 'major', prog: [[0, 'M'], [5, 'M'], [7, 'M'], [5, 'M']], k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.', bass: 'r.r.o.r.r.r.o.r.', arp: '', lead: 'square', arpW: 'square', dens: 0.45, pad: true },
    pong:    { bpm: 112, root: 57, scale: 'minor', prog: [[0, 'm'], [8, 'M'], [10, 'M'], [7, 'm']], k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', bass: 'ror.ror.ror.ror.', arp: '0120012001200120', lead: 'square', arpW: 'square', dens: 0.35 },
    rps:     { bpm: 120, root: 62, scale: 'dorian', prog: [[0, 'm'], [5, 'M'], [0, 'm'], [7, 'm']], k: 'x..x..x.x..x..x.', s: '....x.......x...', h: '..x...x...x...x.', bass: 'r..r..o.r..r..o.', arp: '0.1.2...0.1.2...', lead: 'square', arpW: 'triangle', dens: 0.4 },
    drift:   { bpm: 140, root: 52, scale: 'minor', prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']], k: 'x...x...x...x...', s: '....x.......x...', h: 'xxx.xxx.xxx.xxx.', bass: 'rorororororororo', arp: '0121012101210121', lead: 'sawtooth', arpW: 'square', dens: 0.45 },
    ninja:   { bpm: 150, root: 57, scale: 'hirajoshi', prog: [[0, 'm'], [8, 'M'], [7, 'm'], [0, 'm']], k: 'x.....x...x.....', s: '....x.......x.x.', h: 'x.xxx.xxx.xxx.xx', bass: 'r.r.o...r.r.o.r.', arp: '0.2.1.2.0.2.1.2.', lead: 'square', arpW: 'triangle', dens: 0.5 },
    tower:   { bpm: 104, root: 50, scale: 'harmMinor', prog: [[0, 'm'], [8, 'M'], [5, 'm'], [7, 'M']], k: 'x.......x.......', s: '....x.x.....x.xx', h: '................', bass: 'r...r...o...r.r.', arp: '', lead: 'square', arpW: 'square', dens: 0.45, pad: true },
    cyber:   { bpm: 124, root: 53, scale: 'minor', prog: [[0, 'm'], [0, 'm'], [8, 'M'], [7, 'm']], k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x.x.x.', bass: 'r.rr.r.rr.r.rr.r', arp: '0.0.1.0.2.0.1.0.', lead: 'triangle', arpW: 'square', dens: 0.25 },
    fishing: { bpm: 92, root: 62, scale: 'majPent', prog: [[0, 'M'], [5, 'M'], [9, 'm'], [7, 'M']], k: 'x.......x.......', s: '................', h: '....x.......x...', bass: 'r.....o.r.....o.', arp: '0.1.2.1.0.1.2.1.', lead: 'triangle', arpW: 'triangle', dens: 0.35, pad: true },
  };
  const T = THEMES[theme] || THEMES.sky;
  const SC = SCALES[T.scale];

  // deterministic melody per theme
  let seed = [...theme].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rand = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const degToMidi = d => T.root + 12 * Math.floor(d / SC.length) + SC[((d % SC.length) + SC.length) % SC.length];
  const chordTones = bar => { const [off, q] = T.prog[bar % 4]; const r = T.root + off; return [r, r + (q === 'M' ? 4 : 3), r + 7, r + 12]; };
  const melody = [];
  {
    let d = SC.length + 2;
    const half = [];
    for (let i = 0; i < 32; i++) {
      const strong = i % 4 === 0, hit = strong ? rand() < 0.85 : rand() < T.dens * (i % 2 ? 0.6 : 1);
      if (!hit) { half.push(null); continue; }
      d += strong ? Math.round((rand() - 0.5) * 4) : (rand() < 0.5 ? -1 : 1) * (rand() < 0.7 ? 1 : 2);
      d = Math.max(SC.length - 2, Math.min(SC.length * 2 + 2, d));
      half.push(d);
    }
    melody.push(...half, ...half.slice(0, 24));
    for (let i = 24; i < 32; i++) melody.push(half[i] === null ? null : half[i] + (i === 24 ? 2 : -1));
  }

  let ctx = null, master = null, noiseBuf = null, timer = null, nextStep = 0, startAt = 0, playing = false;
  let enabled = true;
  try { enabled = localStorage.getItem(PREF_KEY) !== 'off'; } catch (e) {}
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function env(g, t, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function tone(t, wave, freq, peak, dur, cutoff) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave; o.frequency.setValueAtTime(freq, t);
    let node = o;
    if (cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; o.connect(f); node = f; }
    node.connect(g); g.connect(master); env(g, t, peak, dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, type, freq, peak, dur) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    s.connect(f); f.connect(g); g.connect(master); env(g, t, peak, dur);
    s.start(t); s.stop(t + dur + 0.05);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    o.connect(g); g.connect(master); env(g, t, 0.9, 0.18); o.start(t); o.stop(t + 0.22);
  }

  function playStep(i, t) {
    const sd = 60 / T.bpm / 4, s = i % 16, bar = Math.floor(i / 16), section = Math.floor(bar / 4) % 4, ct = chordTones(bar);
    if (T.k[s] === 'x') kick(t);
    if (T.s[s] === 'x') { noise(t, 'bandpass', 1800, 0.35, 0.12); tone(t, 'triangle', 190, 0.15, 0.06); }
    if (T.h[s] === 'x') noise(t, 'highpass', 8000, 0.09, 0.04);
    const b = T.bass[s];
    if (b && b !== '.') tone(t, T.bpm > 135 ? 'square' : 'sawtooth', mtof(ct[0] - 12 + (b === 'o' ? 12 : b === '5' ? 7 : 0)), 0.22, sd * 1.7, 700);
    if (T.pad && s === 0) for (const n of ct.slice(0, 3)) { tone(t, 'triangle', mtof(n), 0.05, sd * 15); tone(t, 'triangle', mtof(n) * 1.004, 0.035, sd * 15); }
    if (section >= 1 && T.arp && T.arp[s] !== '.' && T.arp[s] !== undefined) tone(t, T.arpW, mtof(ct[+T.arp[s]] + 12), 0.06, sd * 0.9, 3500);
    if (section >= 2) { const d = melody[(bar % 4) * 16 + s]; if (d !== null && d !== undefined) tone(t, T.lead, mtof(degToMidi(d)), T.lead === 'triangle' ? 0.13 : 0.07, sd * 1.8, 2600); }
  }
  function schedule() {
    if (!ctx || !playing) return;
    const sd = 60 / T.bpm / 4;
    while (startAt + nextStep * sd < ctx.currentTime + 0.15) { playStep(nextStep, startAt + nextStep * sd); nextStep++; }
  }
  function start() {
    if (playing || !enabled) return;
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const comp = ctx.createDynamicsCompressor();
        master = ctx.createGain(); master.gain.value = 0.16;
        master.connect(comp); comp.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.setValueAtTime(0.16, ctx.currentTime);
      playing = true; nextStep = 0; startAt = ctx.currentTime + 0.08;
      schedule(); timer = setInterval(schedule, 40);
    } catch (e) { playing = false; }
  }
  function stop() {
    playing = false; clearInterval(timer); timer = null;
    if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }
  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem(PREF_KEY, on ? 'on' : 'off'); } catch (e) {}
    btn.textContent = on ? '♪ ON' : '♪ OFF';
    btn.classList.toggle('off', !on);
    on ? start() : stop();
  }

  const kickoff = () => { if (enabled && !playing) start(); };
  window.addEventListener('pointerdown', kickoff, true);
  window.addEventListener('keydown', kickoff, true);

  const style = document.createElement('style');
  style.textContent = `
    #gh-music-btn { position:fixed; top:8px; z-index:9998; font-family:system-ui,-apple-system,'Segoe UI',sans-serif; font-weight:800; font-size:clamp(13px,2vw,16px); background:#00e5ff; color:#111; border:3px solid #111; border-radius:10px; padding:8px 10px; cursor:pointer; white-space:nowrap; box-shadow:0 4px 0 #111,0 0 14px rgba(0,229,255,0.5); }
    #gh-music-btn.off { background:#555; color:#ddd; box-shadow:0 4px 0 #111; }
    #gh-music-btn:active { transform:translateY(3px); box-shadow:0 1px 0 #111; }
    .topbar .spacer { width:calc(clamp(110px,16vw,150px) + 86px) !important; }
    @media (orientation: landscape) and (max-height: 600px) {
      html #gh-music-btn { top:4px; font-size:12px; padding:4px 8px; border-width:2px; box-shadow:0 3px 0 #111; }
      .topbar .spacer { width:170px !important; }
    }`;
  const btn = document.createElement('button');
  btn.id = 'gh-music-btn'; btn.type = 'button'; btn.title = 'Music on/off';
  btn.textContent = enabled ? '♪ ON' : '♪ OFF';
  btn.classList.toggle('off', !enabled);
  for (const ev of ['pointerdown', 'mousedown', 'touchstart']) btn.addEventListener(ev, e => e.stopPropagation());
  btn.addEventListener('click', e => { e.stopPropagation(); setEnabled(!enabled); btn.blur(); });

  function place() {
    const pb = document.getElementById('gh-pause-btn');
    const right = pb ? window.innerWidth - pb.getBoundingClientRect().left + 8 : 130;
    btn.style.right = right + 'px';
  }
  function mount() {
    document.head.append(style);
    document.body.append(btn);
    place();
    window.addEventListener('resize', place);
    setTimeout(place, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  window.GamerHubMusic = { start, stop, setEnabled, isPlaying: () => playing };
})();
