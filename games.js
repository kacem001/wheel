// Game Night Script
let games = [];
let currentRotation = 0;
let isSpinning = false;
let selectedGame = null;

// Load games from JSON file
window.onload = function () {
    loadGamesFromJSON();
};

// Load data from JSON file via API
async function loadGamesFromJSON() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        games = data.games || [];
        updateGamesList();
        drawWheel();
        console.log('✅ Games loaded from server!');
    } catch (error) {
        console.error('Error loading games:', error);
        // Fallback to localStorage if API fails
        const savedGames = localStorage.getItem('games');
        if (savedGames) {
            games = JSON.parse(savedGames);
            updateGamesList();
            drawWheel();
            console.log('⚠️ Loaded from localStorage (backup)');
        }
    }
}

// Save games to JSON file via API
async function saveGames() {
    try {
        // First get current data
        const getResponse = await fetch('/api/data');
        const data = await getResponse.json();

        // Update games
        data.games = games;

        // Save to server
        const saveResponse = await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await saveResponse.json();
        console.log('✅ Games saved to server!');

        // Also save to localStorage as backup
        localStorage.setItem('games', JSON.stringify(games));

    } catch (error) {
        console.error('❌ Error saving games:', error);
        // Fallback to localStorage if API fails
        localStorage.setItem('games', JSON.stringify(games));
        console.log('⚠️ Saved to localStorage only (server not available)');
    }
}

// Add game
function addGame() {
    const input = document.getElementById('gameInput');
    const gameTitle = input.value.trim();

    if (gameTitle) {
        games.push(gameTitle);
        input.value = '';
        updateGamesList();
        drawWheel();
        saveGames();

        // Add animation feedback
        input.style.transform = 'scale(1.1)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 200);
    }
}

// Allow Enter key to add game
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('gameInput');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addGame();
            }
        });
    }
});

// Update games list
function updateGamesList() {
    const listContainer = document.getElementById('gamesList');
    listContainer.innerHTML = '';

    games.forEach((game, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>🎮 ${game}</span>
            <button class="btn-delete" onclick="deleteGame(${index})">🗑️</button>
        `;
        listContainer.appendChild(item);
    });
}

// Delete game
function deleteGame(index) {
    games.splice(index, 1);
    updateGamesList();
    drawWheel();
    saveGames();
}

// Draw the wheel
function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');

    // Get actual canvas size
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    // Set display size (css pixels)
    const displayWidth = rect.width || canvas.width;
    const displayHeight = rect.height || canvas.height;

    // Set actual size in memory (scaled for retina displays)
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;

    // Scale the context to match
    ctx.scale(scale, scale);

    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    const radius = Math.min(displayWidth, displayHeight) / 2 - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (games.length === 0) {
        // Draw empty wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f0f0f0';
        ctx.fill();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = '#999';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Add games to spin!', centerX, centerY);
        return;
    }

    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
        '#FF8FA3', '#6C5CE7', '#FD79A8', '#A29BFE', '#74B9FF'
    ];

    const anglePerSection = (2 * Math.PI) / games.length;

    // Draw sections
    games.forEach((game, index) => {
        const startAngle = index * anglePerSection + currentRotation;
        const endAngle = startAngle + anglePerSection;

        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSection / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Truncate long game names
        let displayText = game.length > 20 ? game.substring(0, 17) + '...' : game;
        ctx.fillText(displayText, radius - 20, 5);
        ctx.restore();
    });
}

// Spin the wheel
function spinWheel() {
    if (games.length === 0) {
        alert('Please add some games first! 🎮');
        return;
    }

    if (isSpinning) return;

    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.style.opacity = '0.6';

    // Random spin parameters
    const minSpins = 5;
    const maxSpins = 8;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const totalRotation = spins * 2 * Math.PI;
    const duration = 4000; // 4 seconds
    const startTime = Date.now();

    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);

        currentRotation = totalRotation * easeOut;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete - determine winner
            const normalizedRotation = currentRotation % (2 * Math.PI);
            const anglePerSection = (2 * Math.PI) / games.length;
            const pointerAngle = (3 * Math.PI / 2); // Top of wheel
            const selectedIndex = Math.floor((pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI) / anglePerSection);
            const winningIndex = (games.length - selectedIndex - 1 + games.length) % games.length;

            selectedGame = games[winningIndex];
            showResult();

            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.style.opacity = '1';
        }
    }

    animate();
}

// Show result modal
function showResult() {
    const modal = document.getElementById('resultModal');
    const resultGame = document.getElementById('resultGame');
    resultGame.textContent = selectedGame;
    modal.style.display = 'block';

    // Play confetti animation
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    const confetti = ['🎉', '🎊', '⭐', '✨', '🎈', '🎆', '💖', '💕', '🎮', '🕹️'];
    const body = document.body;

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confettiElement = document.createElement('div');
            confettiElement.textContent = confetti[Math.floor(Math.random() * confetti.length)];
            confettiElement.style.position = 'fixed';
            confettiElement.style.left = Math.random() * 100 + '%';
            confettiElement.style.top = '-50px';
            confettiElement.style.fontSize = Math.random() * 20 + 20 + 'px';
            confettiElement.style.zIndex = '9999';
            confettiElement.style.pointerEvents = 'none';
            body.appendChild(confettiElement);

            const duration = Math.random() * 2 + 2;
            confettiElement.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => {
                confettiElement.remove();
            }, duration * 1000);
        }, i * 100);
    }
}

// Confirm choice (remove game and close modal)
function confirmChoice() {
    const index = games.indexOf(selectedGame);
    if (index > -1) {
        games.splice(index, 1);
        updateGamesList();
        drawWheel();
        saveGames();
    }
    closeModal();
}

// Respin
function respin() {
    closeModal();
    setTimeout(() => {
        spinWheel();
    }, 300);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Initial draw
drawWheel();
