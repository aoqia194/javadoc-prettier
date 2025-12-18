import { VIEWPORT_HEIGHT } from "./constants";

const EASTER_EGG_TEXT = "christmas";
const SNOWFLAKE_CHARS = ["❄", "❅", "❆"];

export function activateEasterEgg() {
    let keyboardBuffer = "";

    function keyboardListener(e: KeyboardEvent) {
        const focusedElement = document.activeElement as HTMLElement;
        if (!focusedElement) {
            return;
        }

        const isInputFocused =
            focusedElement.tagName === "INPUT" ||
            focusedElement.tagName === "TEXTAREA" ||
            focusedElement.tagName === "SELECT" ||
            focusedElement.isContentEditable;

        if (!isInputFocused) {
            if (e.key && e.key.length === 1) {
                keyboardBuffer += e.key.toLowerCase();
            }

            if (keyboardBuffer.includes(EASTER_EGG_TEXT)) {
                startChristmasTheme();
                keyboardBuffer = "";
                document.removeEventListener("keydown", keyboardListener);
            }

            if (keyboardBuffer.length > EASTER_EGG_TEXT.length) {
                keyboardBuffer = keyboardBuffer.slice(-EASTER_EGG_TEXT.length);
            }
        }
    }
    document.addEventListener("keydown", keyboardListener);
}

function startChristmasTheme() {
    // (document.querySelector(":root") as HTMLElement).style.animation =
    //     "christmas-accent 3s steps(3) infinite";

    createSnowflakeOverlay();
}

const ACTIVE_SNOWFLAKES: HTMLDivElement[] = [];
const SNOWFLAKE_PROPS: WeakMap<WeakKey, SnowflakeProperty> = new WeakMap();
let snowflakeContainer: HTMLDivElement;

function createSnowflakeOverlay() {
    snowflakeContainer = document.createElement("div");
    snowflakeContainer.id = "snowflake-container";
    snowflakeContainer.style.willChange = "contents";
    document.body.appendChild(snowflakeContainer);

    const numFlakes = 50;
    for (let i = 0; i < numFlakes; i++) {
        const flake = getSnowflake();
        const p = SNOWFLAKE_PROPS.get(flake)!;
        p.y = Math.random() * window.innerHeight - window.innerHeight;
    }

    animateSnowflakes();
}

function createSnowflake() {
    const flake = document.createElement("div");
    flake.classList.add("snowflake-object");
    snowflakeContainer.appendChild(flake);
    return flake;
}

function initSnowflake(flake: HTMLDivElement) {
    const char = SNOWFLAKE_CHARS[Math.floor(Math.random() * SNOWFLAKE_CHARS.length)]!;
    const size = Math.random() * 20 + 20;

    flake.textContent = char;

    flake.style.fontSize = `${size}px`;
    flake.style.opacity = `${Math.random() * 0.6 + 0.4}`;
    flake.style.willChange = "transform";

    SNOWFLAKE_PROPS.set(flake, {
        x: Math.random() * window.innerWidth,
        y: -50,
        speed: Math.random() * 1.5 + 0.5,
        drift: (Math.random() - 0.5) * 0.5,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 4,
    });

    updateSnowflakePosition(flake);
}

function updateSnowflakePosition(flake: HTMLDivElement) {
    const p = SNOWFLAKE_PROPS.get(flake)!;
    flake.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px) rotate(${p.rotation}deg)`;
}

function getSnowflake() {
    let flake = createSnowflake();
    initSnowflake(flake);
    ACTIVE_SNOWFLAKES.push(flake);
    return flake;
}

// https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/requestAnimationFrame#examples
function animateSnowflakes() {
    for (let i = ACTIVE_SNOWFLAKES.length - 1; i >= 0; i--) {
        const flake = ACTIVE_SNOWFLAKES[i]!;
        const p = SNOWFLAKE_PROPS.get(flake)!;

        p.x += p.drift;
        p.y += p.speed;
        p.rotation += p.rotationSpeed;

        if (p.y > VIEWPORT_HEIGHT) {
            initSnowflake(flake);
        } else {
            updateSnowflakePosition(flake);
        }
    }

    requestAnimationFrame(animateSnowflakes);
}
