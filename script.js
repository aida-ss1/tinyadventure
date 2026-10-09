const gameArea = document.getElementById("gameArea");
const world = document.getElementById("world");
const player = document.getElementById("player");
const gameSky = document.querySelector(".game-sky");
const restartButton = document.getElementById("restartButton");

// Находим платформы один раз, а не в каждом кадре
const platforms = document.querySelectorAll("#world .platform");

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

function resetPlayer() {
    x = 50;
    y = groundHeight;
    velocityY = 0;
    jumping = false;
    cameraX = 0;
    keys.clear();

    player.style.left = x + "px";
    player.style.bottom = y + "px";
    world.style.transform = "translateX(0)";

    if (gameSky) {
        gameSky.style.transform = "translateX(0)";
    }
}

if (restartButton) {
    restartButton.addEventListener("click", resetPlayer);
}

document.addEventListener("keydown", (event) => {
    const controls = ["ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD", "KeyW", "Space"];

    if (controls.includes(event.code)) {
        event.preventDefault();
    }

    keys.add(event.code);

    if (["ArrowUp", "KeyW", "Space"].includes(event.code) && !jumping) {
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

        // Движение влево / вправо
        if (keys.has("ArrowLeft") || keys.has("KeyA")) x -= speed;
        if (keys.has("ArrowRight") || keys.has("KeyD")) x += speed;

        // Границы мира
        x = Math.max(0, Math.min(x, world.offsetWidth - player.offsetWidth));

        const previousY = y;

        // Применяем гравитацию
        y += velocityY;
        velocityY -= gravity;

        let onGroundOrPlatform = false;

        // Проверка приземления на землю
        if (y <= groundHeight) {
            y = groundHeight;
            velocityY = 0;
            jumping = false;
            onGroundOrPlatform = true;
        }

        // Проверка платформ
        platforms.forEach((platform) => {
            // Корректный расчет верхнего края платформы относительно нижней границы world
            const platformTop = world.clientHeight - platform.offsetTop;
            const platformLeft = platform.offsetLeft;
            const platformRight = platformLeft + platform.offsetWidth;
            const playerRight = x + player.offsetWidth;

            // Проверка приземления сверху на платформу
            if (
                velocityY <= 0 &&
                previousY >= platformTop &&
                y <= platformTop &&
                playerRight > platformLeft &&
                x < platformRight
            ) {
                y = platformTop;
                velocityY = 0;
                jumping = false;
                onGroundOrPlatform = true;
            }
        });

        // Если игрок не на земле/платформе и не прыгал — он должен падать
        if (!onGroundOrPlatform && !jumping) {
            jumping = true;
        }

        // Обновление позиций
        player.style.left = x + "px";
        player.style.bottom = y + "px";

        // Камера
        const maxCameraX = Math.max(0, world.offsetWidth - gameArea.clientWidth);
        cameraX = Math.max(0, Math.min(x - gameArea.clientWidth * 0.4, maxCameraX));

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