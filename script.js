const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
let dir = { x: 1, y: 0 };
let food = null;
let score = 0;
let running = false; // game started flag
let paused = false;
let speed = 120;
let timer = null;

function randomFood(){
  let pos;
  do { pos = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function gameLoop(){
  if(paused || !running) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)){
    running = false; draw(); onGameOver(); return;
  }
  snake.unshift(head);
  if(head.x === food.x && head.y === food.y){
    score++; document.getElementById('score').textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // cute rounded food
  ctx.fillStyle = '#ff9bb3';
  ctx.beginPath(); ctx.roundRect(food.x*grid+2, food.y*grid+2, grid-4, grid-4, 6); ctx.fill();
  // snake body with gradient
  snake.forEach((s,i)=>{
    const t = i===0 ? '#ff6b81' : (i%2? '#ffd6e0' : '#ffdbe6');
    ctx.fillStyle = t;
    ctx.beginPath(); ctx.roundRect(s.x*grid+2, s.y*grid+2, grid-4, grid-4, 6); ctx.fill();
  });
  if(!running){
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='white'; ctx.font='18px "Baloo 2", sans-serif'; ctx.textAlign='center';
    ctx.fillText('遊戲結束 - 按空白鍵重新開始', canvas.width/2, canvas.height/2);
  }
}

// polyfill for roundRect if not present
CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function(x,y,w,h,r){
  if (typeof r === 'undefined') r = 6;
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
};

function onGameOver(){
  clearInterval(timer); timer = null; saveScore(score); renderLeaderboard();
}

function start(){
  running = true; paused = false; score = 0; document.getElementById('score').textContent = score;
  snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
  dir = { x:1, y:0 }; food = randomFood();
  clearInterval(timer); timer = setInterval(gameLoop, speed);
  draw();
}

function togglePause(){
  if(!running) return;
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? '繼續' : '暫停';
}

function setSpeed(newSpeed){
  speed = Number(newSpeed);
  if(timer){ clearInterval(timer); timer = setInterval(gameLoop, speed); }
}

// leaderboard (localStorage)
function loadLeaderboard(){
  try{ const raw = localStorage.getItem('snake_leaderboard'); return raw? JSON.parse(raw): []; }catch(e){ return []; }
}

function saveScore(s){
  const list = loadLeaderboard(); list.push({score: s, time: Date.now()});
  list.sort((a,b)=>b.score-a.score);
  const top = list.slice(0,5);
  localStorage.setItem('snake_leaderboard', JSON.stringify(top));
}

function renderLeaderboard(){
  const list = loadLeaderboard();
  const ol = document.getElementById('scoresList'); ol.innerHTML='';
  if(list.length===0){ ol.innerHTML='<li>還沒有分數</li>'; return; }
  list.forEach(item=>{ const li = document.createElement('li'); li.textContent = item.score; ol.appendChild(li); });
}

document.addEventListener('keydown', e=>{
  if(e.key === 'ArrowLeft' && dir.x === 0) dir = { x:-1, y:0 };
  else if(e.key === 'ArrowRight' && dir.x === 0) dir = { x:1, y:0 };
  else if(e.key === 'ArrowUp' && dir.y === 0) dir = { x:0, y:-1 };
  else if(e.key === 'ArrowDown' && dir.y === 0) dir = { x:0, y:1 };
  else if(e.key === ' ' && !running) start();
  else if(e.key.toLowerCase() === 'p') togglePause();
  else if(e.key === 'a' && dir.x === 0) dir = { x:-1, y:0 };
  else if(e.key === 'd' && dir.x === 0) dir = { x:1, y:0 };
  else if(e.key === 'w' && dir.y === 0) dir = { x:0, y:-1 };
  else if(e.key === 's' && dir.y === 0) dir = { x:0, y:1 };
});

canvas.addEventListener('click', ()=>{ if(!running) start(); });

// UI bindings
document.getElementById('pauseBtn').addEventListener('click', ()=> togglePause());
document.getElementById('restartBtn').addEventListener('click', ()=> start());
document.getElementById('speedSelect').addEventListener('change', (e)=> setSpeed(e.target.value));

// init
renderLeaderboard();
start();