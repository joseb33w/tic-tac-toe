// Self-contained canvas confetti burst — no dependencies. Spawns a short-lived
// full-screen canvas, animates particles with requestAnimationFrame, then tears
// itself down. Safe to call repeatedly; concurrent bursts share one canvas.

let canvas = null;
let ctx = null;
let particles = [];
let raf = 0;

const COLORS = ['#7c5cff', '#b06bff', '#2ee6d6', '#ff5dab', '#ffcc66', '#41d68b'];

function mount() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '70'
  });
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function teardown() {
  cancelAnimationFrame(raf);
  raf = 0;
  window.removeEventListener('resize', resize);
  if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  canvas = null;
  ctx = null;
  particles = [];
}

function tick() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  particles.forEach((p) => {
    p.vy += 0.16;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });
  particles = particles.filter((p) => p.life > 0 && p.y < h + 40);
  if (particles.length > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    teardown();
  }
}

export function burstConfetti(count = 130) {
  mount();
  const w = window.innerWidth;
  const originY = window.innerHeight * 0.32;
  for (let i = 0; i < count; i++) {
    const angle = Math.PI + Math.random() * Math.PI;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: originY,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.abs(Math.sin(angle) * speed) - 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      size: 7 + Math.random() * 8,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 80 + Math.random() * 50
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
