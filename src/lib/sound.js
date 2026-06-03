// Tiny dependency-free arcade sound engine built on the Web Audio API.
// Sounds are synthesized from oscillators, so there are no audio assets to ship.
// The AudioContext is created lazily on the first call (always triggered by a
// user gesture in this app), satisfying browser autoplay policies.

const STORAGE_KEY = 'ttt-muted';

let ctx = null;
let muted = readMuted();
const listeners = new Set();

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function ensureCtx() {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone({ freq, type = 'sine', start = 0, dur = 0.16, gain = 0.16, slideTo = null }) {
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  place: () => tone({ freq: 420, type: 'triangle', dur: 0.12, gain: 0.14, slideTo: 620 }),
  placeO: () => tone({ freq: 320, type: 'triangle', dur: 0.12, gain: 0.14, slideTo: 240 }),
  nav: () => tone({ freq: 540, type: 'sine', dur: 0.07, gain: 0.08 }),
  win: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ freq: f, type: 'triangle', start: i * 0.1, dur: 0.18, gain: 0.16 })
    );
  },
  lose: () => {
    [392, 311.13, 233.08].forEach((f, i) =>
      tone({ freq: f, type: 'sawtooth', start: i * 0.12, dur: 0.2, gain: 0.1 })
    );
  },
  draw: () => {
    [440, 440].forEach((f, i) =>
      tone({ freq: f, type: 'sine', start: i * 0.14, dur: 0.16, gain: 0.1 })
    );
  },
  buy: () => {
    [659.25, 987.77, 1318.51].forEach((f, i) =>
      tone({ freq: f, type: 'triangle', start: i * 0.07, dur: 0.16, gain: 0.14 })
    );
  },
  error: () => tone({ freq: 180, type: 'square', dur: 0.18, gain: 0.08, slideTo: 120 })
};

export function playSound(name) {
  if (muted) return;
  const fn = SOUNDS[name];
  if (fn) {
    try {
      fn();
    } catch {
      /* audio is best-effort; never let it break gameplay */
    }
  }
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
  } catch {
    /* ignore storage failures */
  }
  if (!muted) ensureCtx();
  listeners.forEach((l) => l(muted));
  return muted;
}

export function onMuteChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
