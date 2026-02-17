const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


let isPaused = false;
const pauseBtn = document.getElementById("pauseBtn");



const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Load sprites
const appleImg = new Image();
appleImg.src = "_assets/apple.png";

const headImg = new Image();
headImg.src = "_assets/snake.png";

const bodyImg = new Image();
bodyImg.src = "_assets/tail.png";

const tailEndImg = new Image();
tailEndImg.src = "_assets/tail end.png";

// 🔊 Sounds
const eatSound = new Audio("_assets/sounds/eat.wav");
const gameOverSound = new Audio("_assets/sounds/gameover.wav");
const music = new Audio("_assets/sounds/music.mp3"); // optional

let isMuted = false;
const muteBtn = document.getElementById("muteBtn");

music.loop = true;
music.volume = 0.4; // lower background music volume

let musicStarted = false;


muteBtn.addEventListener("click", function () {
    isMuted = !isMuted;

    eatSound.muted = isMuted;
    gameOverSound.muted = isMuted;
    music.muted = isMuted;

    muteBtn.textContent = isMuted ? "🔇 Sound: OFF" : "🔊 Sound: ON";
});


pauseBtn.addEventListener("click", function () {
    isPaused = !isPaused;

    if (isPaused) {
        pauseBtn.textContent = "▶ Resume";
        music.pause();
    } else {
        pauseBtn.textContent = "⏸ Pause";

        if (!isMuted) {
            music.play();
        }
    }
});




document.addEventListener("keydown", function () {
    if (!musicStarted) {
        music.play();
        musicStarted = true;
    }
});

let snake = [
    { x: 10, y: 10 }
];

let velocityX = 0;
let velocityY = 0;

let apple = {
    x: 5,
    y: 5
};

let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;

// Controls
document.addEventListener("keydown", function (e) {
    switch (e.key.toLowerCase()) {
        case "a":
        case "arrowleft":
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;

        case "d":
        case "arrowright":
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;

        case "w":
        case "arrowup":
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;

        case "s":
        case "arrowdown":
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
    }
});

function gameLoop() {
    if (isPaused) return;

    update();
    draw();
}

function update() {
    const head = {
        x: snake[0].x + velocityX,
        y: snake[0].y + velocityY
    };

    // 🌍 Wrap around walls instead of dying
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    // 🐍 Self collision ONLY
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            resetGame();
            return;
        }
    }

    snake.unshift(head);

    // 🍎 Apple collision
    if (head.x === apple.x && head.y === apple.y) {
        score++;
        eatSound.currentTime = 0;
        eatSound.play();
        apple.x = Math.floor(Math.random() * tileCount);
        apple.y = Math.floor(Math.random() * tileCount);
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw apple
    ctx.drawImage(
        appleImg,
        apple.x * gridSize,
        apple.y * gridSize,
        gridSize,
        gridSize
    );

    for (let i = 0; i < snake.length; i++) {
        let part = snake[i];

        if (i === 0) {
            // 🐍 HEAD (ROTATED)
            ctx.save();

            const centerX = part.x * gridSize + gridSize / 2;
            const centerY = part.y * gridSize + gridSize / 2;

            ctx.translate(centerX, centerY);

            let angle = 0;

            if (velocityX === 1) angle = 0;                 // Right
            if (velocityX === -1) angle = Math.PI;          // Left
            if (velocityY === -1) angle = -Math.PI / 2;     // Up
            if (velocityY === 1) angle = Math.PI / 2;       // Down

            ctx.rotate(angle);

            ctx.drawImage(
                headImg,
                -gridSize / 2,
                -gridSize / 2,
                gridSize,
                gridSize
            );

            ctx.restore();

        } else if (i === snake.length - 1) {
            // Tail end
            ctx.drawImage(
                tailEndImg,
                part.x * gridSize,
                part.y * gridSize,
                gridSize,
                gridSize
            );
        } else {
            // Body
            ctx.drawImage(
                bodyImg,
                part.x * gridSize,
                part.y * gridSize,
                gridSize,
                gridSize
            );
        }
    }

    // Score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    // High Score
    ctx.fillText("High Score: " + highScore, 10, 45);

    if (isPaused) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "start";
    }
    
}

function resetGame() {

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
    }

    gameOverSound.play();

    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        alert("🎉 NEW HIGH SCORE: " + highScore);
    }
    
}

setInterval(gameLoop, 180);

