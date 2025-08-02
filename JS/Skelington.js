const skelington = document.getElementById('skelington');
const frameWidth = 32;
const upscaleFactor = 2; // Scale factor for the sprite

// Drop configuration
const dropSpeed = 0.4; // seconds
const dropFrameCount = 8;

// Idle configuration
const idleMinTime = 3; // seconds
const idleMaxTime = 10;

// Movement configuration
const moveSpeed = 0.2;
const moveMinDistance = 100; // pixels
const moveMaxDistance = 300;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', () => {
    activateSkeleton();
});

function activateSkeleton() {
    // Drops skelington from the top of the header.
    dropskelington();
    loopSkelington();
}

// SPOOOOOKKAYYY.
function dropSkelington() {
    // Make skelington visible and set its size.
    skelington.style.width = `${frameWidth * upscaleFactor}px`;
    skelington.style.height = `${frameWidth * upscaleFactor}px`;
    skelington.style.visibility = 'visible';

    animateDropFrames();
    // Start the transition for the drop effect.
    skelington.style.transition = `transform ${dropSpeed}s ease`;
    skelington.style.transform = `translateY(${header.offsetHeight - frameWidth * upscaleFactor}px)`; // Adjust based on header height
    console.log("Skelington dropped");
}

function moveSkelington() {
    console.log("Skelington moves...");
}

async function loopSkelington() {
    while (true) {
        const waitTime = (Math.random() * (idleMaxTime - idleMinTime) + idleMinTime) * 1000;
        await sleep(waitTime);
        moveSkelington();
    }
}

function animateDropFrames() {
    const frameDuration = (dropSpeed * 1000) / dropFrameCount; // in ms
    let frame = 0;

    const interval = setInterval(() => {
        drawSpriteFromSheet(frame);
        frame++;
        if (frame >= dropFrameCount) {
            clearInterval(interval);
        }
    }, frameDuration);
}

function drawSpriteFromSheet(index) {
    // draw a sprite at index * frameWidth
    skelington.style.image = `url('Assets/Icons/Skelington.png')`;
}
