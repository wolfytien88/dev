// CYBER VENOM — 賽博毒蛇
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const GRID   = 20;
const COLS   = canvas.width  / GRID;
const ROWS   = canvas.height / GRID;

// Game state
let snake, dir, nextDir, food, score, running, paused;
let speed = 120, moveInterval = 120;
let acc = 0, lastTime = 0;

// Visual state
let particles     = [];
let floatingTexts = [];
let shakeAmp      = 0;

// Combo state
let combo      = 0;
let comboTimer = 0;
const COMBO_WINDOW = 3000;

// Food definitions
const FOOD_DEFS = {
  normal: { color: '#ff2079', glow: '#ff2079', weight: 70, points: 1, ttl: null },
  golden: { color: '#ffd700', glow: '#ff9900', weight: 10, points: 5, ttl: 5000 },
  speed:  { color: '#ff6b00', glow: '#ff6b00', weight:  8, points: 2, ttl: null },
  shrink: { color: '#00f0ff', glow: '#00f0ff', weight:  7, points: 1, ttl: null },
  bomb:   { color: '#1a1a2e', glow: '#ff0000', weight:  5, points: 0, ttl: null },
};

function pickFoodType() {
  const total = Object.values(FOOD_DEFS).reduce((s, d) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const [k, d] of Object.entries(FOOD_DEFS)) {
    r -= d.weight;
    if (r <= 0) return k;
  }
  return 'normal';
}

function randomFood() {
  let pos;
  do { pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  const type = pickFoodType();
  return { ...pos, type, ...FOOD_DEFS[type], born: performance.now() };
}

// Particles
function spawnParticles(gx, gy, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 1.5 + Math.random() * 3.5;
    particles.push({
      x: gx * GRID + GRID / 2, y: gy * GRID + GRID / 2,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      life: 1, decay: 0.022 + Math.random() * 0.028,
      color, size: 2 + Math.random() * 3,
    });
  }
}

function spawnText(gx, gy, text, color) {
  floatingTexts.push({
    x: gx * GRID + GRID / 2, y: gy * GRID - 2,
    text, color, life: 1, vy: -1.2,
  });
}

function triggerShake(amp) { shakeAmp = Math.max(shakeAmp, amp); }

// Game logic
function stepLogic() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    running = false;
    onGameOver();
    return;
  }

  snake.unshift(head);

  if (food && head.x === food.x && head.y === food.y) {
    const ate = eatFood();
    food = randomFood();
    if (!ate) return; // bomb killed game
  } else {
    snake.pop();
  }

  if (combo > 0) {
    comboTimer -= moveInterval;
    if (comboTimer <= 0) combo = 0;
  }
}

function eatFood() {
  const f   = food;

  if (f.type === 'bomb') {
    running = false;
    triggerShake(20);
    spawnParticles(f.x, f.y, '#ff0000', 30);
    snake.forEach((s, i) =>
      setTimeout(() => spawnParticles(s.x, s.y, '#ff2079', 8), i * 12)
    );
    saveScore(score);
    renderLeaderboard();
    return false;
  }

  const mul = 1 + Math.floor(combo / 2);
  const pts = f.points * mul;
  score += pts;
  document.getElementById('score').textContent = score;
  combo++;
  comboTimer = COMBO_WINDOW;

  spawnParticles(f.x, f.y, f.glow, 12 + Math.min(combo, 6) * 3);
  const label = mul > 1 ? `+${pts} x${mul}!` : `+${pts}`;
  spawnText(f.x, f.y, label, f.glow);
  triggerShake(combo >= 4 ? 7 : 3);

  if (f.type === 'speed') {
    const prev = moveInterval;
    moveInterval = Math.max(50, moveInterval - 25);
    setTimeout(() => { moveInterval = speed; }, 3000);
  }
  if (f.type === 'shrink' && snake.length > 3) {
    snake.splice(Math.ceil(snake.length / 2));
    spawnParticles(snake[0].x, snake[0].y, '#00f0ff', 25);
    spawnText(snake[0].x, snake[0].y, 'SHRINK!', '#00f0ff');
  }
  return true;
}

function onGameOver() {
  triggerShake(18);
  snake.forEach((s, i) =>
    setTimeout(() => spawnParticles(s.x, s.y, '#39ff14', 8), i * 15)
  );
  spawnParticles(snake[0].x, snake[0].y, '#ff2079', 35);
  saveScore(score);
  renderLeaderboard();
}

// Render
function renderFrame(t) {
  // Screen shake
  const sx = shakeAmp > 0.1 ? (Math.random() - 0.5) * shakeAmp * 2 : 0;
  const sy = shakeAmp > 0.1 ? (Math.random() - 0.5) * shakeAmp * 2 : 0;
  shakeAmp *= 0.82;

  ctx.save();
  ctx.translate(sx, sy);

  // Background
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

  // Subtle grid
  ctx.strokeStyle = 'rgba(0,240,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * GRID, 0); ctx.lineTo(i * GRID, canvas.height); ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * GRID); ctx.lineTo(canvas.width, i * GRID); ctx.stroke();
  }

  // Food
  if (food) {
    if (food.ttl !== null && t - food.born > food.ttl) food = randomFood();
    const pulse  = food.ttl !== null ? Math.abs(Math.sin(t * 0.008)) * 0.5 + 0.5 : 1;
    const age    = food.ttl !== null ? (t - food.born) / food.ttl : 0;
    const shrink = food.ttl !== null ? Math.max(0, age * 4) : 0;
    const pad    = 3 + shrink;

    ctx.shadowBlur  = 20 * pulse;
    ctx.shadowColor = food.glow;
    ctx.fillStyle   = food.color;
    ctx.beginPath();
    ctx.roundRect(food.x * GRID + pad, food.y * GRID + pad, GRID - pad * 2, GRID - pad * 2, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Snake trail
  snake.forEach((s, i) => {
    if (i === 0) return;
    const alpha = Math.max(0, 0.13 - i * 0.009);
    if (alpha < 0.01) return;
    ctx.fillStyle = `rgba(57,255,20,${alpha.toFixed(3)})`;
    ctx.fillRect(s.x * GRID + 3, s.y * GRID + 3, GRID - 6, GRID - 6);
  });

  // Snake body
  snake.forEach((s, i) => {
    const isHead = i === 0;
    ctx.shadowBlur  = isHead ? 22 : 10;
    ctx.shadowColor = '#39ff14';
    ctx.fillStyle   = isHead ? '#39ff14' : (i % 2 === 0 ? '#28cc10' : '#1eaa0c');
    ctx.beginPath();
    ctx.roundRect(s.x * GRID + 2, s.y * GRID + 2, GRID - 4, GRID - 4, isHead ? 6 : 3);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Particles
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  // Floating texts
  ctx.textAlign = 'center';
  floatingTexts.forEach(ft => {
    ctx.globalAlpha = Math.max(0, ft.life);
    ctx.shadowBlur  = 8;
    ctx.shadowColor = ft.color;
    ctx.fillStyle   = ft.color;
    ctx.font        = 'bold 10px "Share Tech Mono", monospace';
    ctx.fillText(ft.text, ft.x, ft.y);
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur  = 0;

  // Combo bar
  if (combo >= 2 && running) {
    const ratio  = comboTimer / COMBO_WINDOW;
    const danger = comboTimer < 800;
    ctx.fillStyle = danger
      ? `rgba(255,0,0,${0.5 + Math.sin(t * 0.02) * 0.3})`
      : 'rgba(255,107,0,0.65)';
    ctx.fillRect(0, canvas.height - 5, ratio * canvas.width, 5);
  }

  // Game over
  if (!running) {
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const flicker = Math.sin(t * 0.015) > 0.2 ? 1 : 0.6;
    ctx.globalAlpha = flicker;
    ctx.shadowBlur  = 24;
    ctx.shadowColor = '#ff2079';
    ctx.fillStyle   = '#ff2079';
    ctx.font        = '14px "Press Start 2P", monospace';
    ctx.textAlign   = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 16);

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle   = '#00f0ff';
    ctx.font        = '7px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO RESTART', canvas.width / 2, canvas.height / 2 + 14);
    ctx.shadowBlur  = 0;
  }

  ctx.restore();
}

function updateEntities() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x  += p.vx; p.y += p.vy;
    p.vy += 0.08;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y    += ft.vy;
    ft.life -= 0.018;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

// Main RAF loop
function frame(t) {
  if (lastTime === 0) { lastTime = t; requestAnimationFrame(frame); return; }
  const dt = Math.min(t - lastTime, 64);
  lastTime = t;

  if (running && !paused) {
    acc += dt;
    while (acc >= moveInterval && running) {
      stepLogic();
      acc -= moveInterval;
    }
  }

  updateEntities();
  renderFrame(t);
  requestAnimationFrame(frame);
}

// Game management
function start() {
  snake         = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
  dir           = { x: 1, y: 0 };
  nextDir       = { x: 1, y: 0 };
  food          = randomFood();
  score         = 0;
  running       = true;
  paused        = false;
  combo         = 0;
  comboTimer    = 0;
  particles     = [];
  floatingTexts = [];
  shakeAmp      = 0;
  acc           = 0;
  moveInterval  = speed;
  document.getElementById('score').textContent = 0;
  document.getElementById('pauseBtn').textContent = '暫停';
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? '繼續' : '暫停';
}

function setSpeed(v) {
  speed = Number(v);
  if (running) moveInterval = speed;
}

// Leaderboard
function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem('snake_leaderboard') || '[]'); }
  catch (e) { return []; }
}

function saveScore(s) {
  const list = loadLeaderboard();
  list.push({ score: s, time: Date.now() });
  list.sort((a, b) => b.score - a.score);
  localStorage.setItem('snake_leaderboard', JSON.stringify(list.slice(0, 5)));
}

function renderLeaderboard() {
  const list = loadLeaderboard();
  const ol   = document.getElementById('scoresList');
  ol.innerHTML = '';
  if (!list.length) { ol.innerHTML = '<li>NO DATA</li>'; return; }
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.score;
    ol.appendChild(li);
  });
}

// Input
const DIR_MAP = {
  ArrowLeft:  { x: -1, y:  0 }, a: { x: -1, y:  0 },
  ArrowRight: { x:  1, y:  0 }, d: { x:  1, y:  0 },
  ArrowUp:    { x:  0, y: -1 }, w: { x:  0, y: -1 },
  ArrowDown:  { x:  0, y:  1 }, s: { x:  0, y:  1 },
};

document.addEventListener('keydown', e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (DIR_MAP[key]) {
    const nd = DIR_MAP[key];
    if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;
    if (e.key.startsWith('Arrow')) e.preventDefault();
  }
  if (e.key === ' ') { if (!running) start(); e.preventDefault(); }
  if (e.key.toLowerCase() === 'p') togglePause();
});

canvas.addEventListener('click', () => { if (!running) start(); });
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', start);
document.getElementById('speedSelect').addEventListener('change', e => setSpeed(e.target.value));

// roundRect polyfill
CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function (x, y, w, h, r) {
  r = r || 0;
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
};

// Init
renderLeaderboard();
start();
requestAnimationFrame(frame);
