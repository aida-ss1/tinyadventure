const gameArea = document.getElementById("gameArea");
const world = document.getElementById("world");
const player = document.getElementById("player");
const gameSky = document.querySelector(".game-sky");
const restartButton = document.getElementById("restartButton");
const scoreValue = document.getElementById("scoreValue");

const platforms = document.querySelectorAll("#world .platform");
const stars = document.querySelectorAll("#world .collectible-star");

const keys = new Set();

const speed = 5;
const gravity = 0.6;
const jumpPower = 13;
const groundHeight = 40;

let x = 50;
let y = groundHeight;
let velocityY = 0;
let jumping = false;
let cameraX = 0;
let score = 0;

function resetPlayer() {
    x = 50;
    y = groundHeight;
    velocityY = 0;
    jumping = false;
    cameraX = 0;
    score = 0;

    keys.clear();

    player.style.left = x + "px";
    player.style.bottom = y + "px";

    world.style.transform = "translateX(0)";

    if (gameSky) {
        gameSky.style.transform = "translateX(0)";
    }

    if (scoreValue) {
        scoreValue.textContent = score;
    }

    stars.forEach((star) => {
        star.style.display = "block";
    });
}

if (restartButton) {
    restartButton.addEventListener("click", resetPlayer);
}

document.addEventListener("keydown", (event) => {
    const controls = [
        "ArrowLeft", "ArrowRight",
        "ArrowUp", "KeyA", "KeyD", "KeyW", "Space"
    ];

    if (controls.includes(event.code)) {
        event.preventDefault();
    }

    keys.add(event.code);

    if (
        ["ArrowUp", "KeyW", "Space"].includes(event.code) &&
        !jumping &&
        !event.repeat
    ) {
        velocityY = jumpPower;
        jumping = true;
    }
});

document.addEventListener("keyup", (event) => {
    keys.delete(event.code);
});

window.addEventListener("blur", () => {
    keys.clear();
});

function update() {
    if (gameArea && world && player) {

        // Движение
        if (keys.has("ArrowLeft") || keys.has("KeyA")) {
            x -= speed;
        }

        if (keys.has("ArrowRight") || keys.has("KeyD")) {
            x += speed;
        }

        x = Math.max(
            0,
            Math.min(x, world.offsetWidth - player.offsetWidth)
        );

        const previousY = y;

        // Гравитация
        y += velocityY;
        velocityY -= gravity;

        let landed = false;

        // Приземление на платформы
        if (velocityY <= 0) {
            platforms.forEach((platform) => {
                const platformTop =
                    world.clientHeight - platform.offsetTop;

                const platformLeft = platform.offsetLeft;
                const platformRight =
                    platformLeft + platform.offsetWidth;

                const playerRight = x + player.offsetWidth;

                if (
                    previousY >= platformTop &&
                    y <= platformTop &&
                    playerRight > platformLeft &&
                    x < platformRight
                ) {
                    y = platformTop;
                    velocityY = 0;
                    jumping = false;
                    landed = true;
                }
            });
        }

        // Приземление на землю
        if (y <= groundHeight) {
            y = groundHeight;
            velocityY = 0;
            jumping = false;
            landed = true;
        }

        // Сбор звёзд
        stars.forEach((star) => {
            if (star.style.display === "none") return;

            const starLeft = star.offsetLeft;
            const starRight = starLeft + star.offsetWidth;

            const starBottom =
                world.clientHeight - star.offsetTop - star.offsetHeight;

            const starTop = starBottom + star.offsetHeight;

            const playerRight = x + player.offsetWidth;
            const playerTop = y + player.offsetHeight;

            if (
                playerRight > starLeft &&
                x < starRight &&
                playerTop > starBottom &&
                y < starTop
            ) {
                star.style.display = "none";
                score++;

                if (scoreValue) {
                    scoreValue.textContent = score;
                }
            }
        });

        // Положение персонажа
        player.style.left = x + "px";
        player.style.bottom = y + "px";

        // Камера
        const maxCameraX = Math.max(
            0,
            world.offsetWidth - gameArea.clientWidth
        );

        cameraX = Math.max(
            0,
            Math.min(x - gameArea.clientWidth * 0.4, maxCameraX)
        );

        world.style.transform = `translateX(-${cameraX}px)`;

        if (gameSky) {
            gameSky.style.transform = `translateX(-${cameraX * 0.3}px)`;
        }
    }

    requestAnimationFrame(update);
}

if (gameArea && world && player) {
    resetPlayer();
    update();
}