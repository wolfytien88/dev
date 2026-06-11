const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
let dir = { x: 1, y: 0 };
let food = randomFood();
let score = 0;
let running = true;
let speed = 120;
let timer;

function randomFood(){
  let pos;
  do { pos = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function gameLoop(){
  if(!running) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)){
    running = false; draw(); showGameOver(); return;
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
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x*grid, food.y*grid, grid, grid);
  snake.forEach((s,i)=>{
    ctx.fillStyle = i===0 ? '#0b6623' : 'green';
    ctx.fillRect(s.x*grid+1, s.y*grid+1, grid-2, grid-2);
  });
  if(!running){
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='white'; ctx.font='20px sans-serif'; ctx.textAlign='center';
    ctx.fillText('遊戲結束 - 按空白鍵重新開始', canvas.width/2, canvas.height/2);
  }
}

function showGameOver(){ clearInterval(timer); }

function start(){
  running = true; score = 0; document.getElementById('score').textContent = score;
  snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
  dir = { x:1, y:0 }; food = randomFood();
  clearInterval(timer); timer = setInterval(gameLoop, speed);
  draw();
}

document.addEventListener('keydown', e=>{
  if(e.key === 'ArrowLeft' && dir.x === 0) dir = { x:-1, y:0 };
  else if(e.key === 'ArrowRight' && dir.x === 0) dir = { x:1, y:0 };
  else if(e.key === 'ArrowUp' && dir.y === 0) dir = { x:0, y:-1 };
  else if(e.key === 'ArrowDown' && dir.y === 0) dir = { x:0, y:1 };
  else if(e.key === ' ' && !running) start();
  else if(e.key === 'a' && dir.x === 0) dir = { x:-1, y:0 };
  else if(e.key === 'd' && dir.x === 0) dir = { x:1, y:0 };
  else if(e.key === 'w' && dir.y === 0) dir = { x:0, y:-1 };
  else if(e.key === 's' && dir.y === 0) dir = { x:0, y:1 };
});

canvas.addEventListener('click', ()=>{ if(!running) start(); });

start();