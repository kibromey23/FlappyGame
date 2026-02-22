const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird, pipes, score, frameCount;
let speed = 3;
let scoreMultiplier = 1;
let soundOn = true;
let gameState = "playing";
let highScore = localStorage.getItem("highScore") || 0;

const flapSound = new Audio('flap.wav');
const scoreSound = new Audio('score.wav');

function playSound(sound) {
  if (!soundOn) return;
  sound.currentTime = 0;
  sound.play();
}

function resizeCanvas() {
  const scale = Math.min(window.innerWidth / 400, window.innerHeight / 600);
  canvas.style.width = 400 * scale + 'px';
  canvas.style.height = 600 * scale + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resetGame() {
  bird = { x: 80, y: 200, width: 34, height: 24, gravity: 0.6, lift: -10, velocity: 0 };
  pipes = [];
  score = 0;
  frameCount = 0;
  gameState = "playing";
}

function drawBackground() {
  ctx.fillStyle = document.body.classList.contains('night-mode') ? '#001f3f' : '#70c5ce';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBird() {
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  ctx.fillStyle = 'green';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, 50, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, 50, canvas.height - pipe.bottom);
  });
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial Black';
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("High: " + highScore, 20, 70);
}

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameState = "gameOver";
  }
}

function updatePipes() {
  if (frameCount % 90 === 0) {
    const topHeight = Math.random() * 200 + 50;
    const gap = 140;
    pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: topHeight + gap,
      scored: false
    });
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= speed;

    if (!pipes[i].scored && pipes[i].x + 50 < bird.x) {
      score += scoreMultiplier;
      pipes[i].scored = true;
      playSound(scoreSound);
    }

    if (pipes[i].x + 50 <= 0) {
      pipes.splice(i, 1);
    }
  }
}

function checkCollision() {
  for (let pipe of pipes) {
    if (
      bird.x < pipe.x + 50 &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ) {
      gameState = "gameOver";
    }
  }
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = "center";
  ctx.font = "32px Arial Black";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  ctx.font = "18px Arial";
  ctx.fillText("Tap to Restart", canvas.width / 2, canvas.height / 2 + 40);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

function update() {
  updateBird();
  updatePipes();
  checkCollision();
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawScore();
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "playing") {
    update();
  }

  draw();

  if (gameState === "gameOver") {
    drawGameOver();
  }

  frameCount++;
  requestAnimationFrame(loop);
}

function flap() {
  if (gameState === "gameOver") {
    resetGame();
  } else {
    bird.velocity = bird.lift;
    playSound(flapSound);
  }
}

canvas.addEventListener("pointerdown", flap);

resetGame();
loop();

/* Register Service Worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}