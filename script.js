let balance = 5.00;
let gameActive = false;
let bombPositions = [];
let revealedCells = 0;
let multiplier = 1;
let initialBet = 0;
let currentTrack = null;
const achievements = [
    { name: "Reach a net worth of $100", achieved: false },
    { name: "Reach a net worth of $1k", achieved: false },
    { name: "Reach a net worth of $1M", achieved: false },
    { name: "Lose 5 times in a row on the first click", achieved: false },
    { name: "Win 5 times in a row on 24/25 bombs", achieved: false },
    { name: "Rare Sound Achievement", achieved: false }
];
let winStreak = 0;
let lossStreak = 0;

function startGame() {
    if (gameActive) return;

    if (document.getElementById('result').innerText) {
        cashout(); // Auto cashout before starting a new game if there are earnings
    }

    const betAmount = parseFloat(document.getElementById('bet').value);
    if (betAmount > balance || betAmount <= 0) {
        alert("Invalid bet amount.");
        return;
    }

    initialBet = betAmount;
    balance -= initialBet;
    updateBalance();

    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    revealedCells = 0;
    bombPositions = [];
    multiplier = 1;
    document.getElementById('multiplier').innerText = '';

    const bombs = parseInt(document.getElementById('bombs').value);
    document.getElementById('cashoutButton').disabled = false;
    document.getElementById('result').innerText = "";
    gameActive = true;

    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => handleClick(cell, bombPositions.includes(i) ? 'bomb' : 'diamond', i));
        grid.appendChild(cell);
    }

    while (bombPositions.length < bombs) {
        let randomPosition = Math.floor(Math.random() * 25);
        if (!bombPositions.includes(randomPosition)) {
            bombPositions.push(randomPosition);
        }
    }

    playSound('betSound');
}

function handleClick(cell, type, index) {
    if (!gameActive || cell.classList.contains('revealed')) return;

    if (type === 'bomb') {
        cell.innerHTML = "💣";
        cell.classList.add('revealed');
        gameActive = false;
        revealAll();
        document.getElementById('cashoutButton').disabled = true;
        playSound('bombSound');
        document.getElementById('result').innerHTML = `<span style="color: red;">-$${initialBet.toFixed(2)} | -${((initialBet / balance) * 100).toFixed(2)}%</span>`;
        lossStreak++;
        winStreak = 0;
        checkAchievement("Lose 5 times in a row on the first click", lossStreak >= 5);
    } else {
        cell.innerHTML = "💎";
        cell.classList.add('revealed');
        playSound('diamondSound');
        revealedCells++;
        calculateMultiplier();
        if (revealedCells + bombPositions.length === 25) {
            cashout(); // Automatically cash out if all non-bomb tiles are revealed
        }
        lossStreak = 0;
    }
}

function revealAll() {
    const cells = document.querySelectorAll('.cell');
    bombPositions.forEach(index => {
        cells[index].innerHTML = "💣";
        cells[index].classList.add('revealed');
    });
    cells.forEach((cell, index) => {
        if (!cell.classList.contains('revealed')) {
            cell.innerHTML = "💎";
            cell.classList.add('revealed');
        }
    });
}

function calculateMultiplier() {
    let bombs = parseInt(document.getElementById('bombs').value);
    let baseMultiplier = 1.1 + (bombs - 1) * 0.3;
    multiplier = baseMultiplier + (revealedCells * 0.1 + (revealedCells - 1) * 0.1);
    let multiplierElement = document.getElementById('multiplier');
    multiplierElement.innerText = `x${multiplier.toFixed(2)}`;
    multiplierElement.style.animation = 'popAnimation 0.5s ease-in-out';
}

function cashout() {
    if (gameActive) {
        const winnings = initialBet * multiplier;
        balance += winnings;
        updateBalance();
        document.getElementById('result').innerHTML = winnings >= initialBet
            ? `<span style="color: green;">+$${winnings.toFixed(2)} | +${((winnings - initialBet) / initialBet * 100).toFixed(2)}%</span>`
            : `<span style="color: red;">-$${initialBet.toFixed(2)} | -${(initialBet * 100).toFixed(2)}%</span>`;
        gameActive = false;
        revealAll();
        document.getElementById('cashoutButton').disabled = true;
        playSound('cashoutSound');
        winStreak++;
        lossStreak = 0;
        checkAchievement("Reach a net worth of $100", balance >= 100);
        checkAchievement("Reach a net worth of $1k", balance >= 1000);
        checkAchievement("Reach a net worth of $1M", balance >= 1000000);
        checkAchievement("Win 5 times in a row on 24/25 bombs", winStreak >= 5 && parseInt(document.getElementById('bombs').value) >= 24);

        if (Math.random() < 0.01) {
            playSound('rareSound');
            checkAchievement("Rare Sound Achievement", true);
        }
    }
}

function updateBalance() {
    document.getElementById('balance').innerText = balance.toFixed(2);
}

function playSound(soundId) {
    let sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
}

function checkAchievement(name, condition) {
    let achievement = achievements.find(a => a.name === name);
    if (!achievement.achieved && condition) {
        achievement.achieved = true;
        showAchievementNotification(achievement.name);
        updateAchievementsView();
    }
}

function toggleAchievements() {
    let achievementsElement = document.getElementById('achievements');
    achievementsElement.classList.toggle('hidden');
    playSound('achievementsOpeningSound');
    updateAchievementsView();
    achievementsElement.scrollTop = 0; // Fix scroll issue by resetting to top
}

function updateAchievementsView() {
    let list = document.getElementById('achievementsList');
    list.innerHTML = '';
    achievements.forEach(a => {
        let item = document.createElement('li');
        item.classList.add(a.achieved ? 'unlocked' : 'locked');
        item.innerText = `${a.name}`;
        let status = document.createElement('span');
        status.classList.add('status');
        status.innerText = a.achieved ? '🔓' : '🔒';
        item.appendChild(status);
        list.appendChild(item);
    });
}

function showAchievementNotification(name) {
    let notification = document.getElementById('achievementNotification');
    notification.innerText = `Achievement Unlocked: ${name}`;
    notification.classList.add('show');
    playSound('achievementBannerSound');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleSound() {
    const volumeButton = document.getElementById('volumeButton');
    const sounds = document.querySelectorAll('audio');
    if (volumeButton.innerText === '🔊') {
        volumeButton.innerText = '🔇';
        sounds.forEach(sound => sound.muted = true);
    } else {
        volumeButton.innerText = '🔊';
        sounds.forEach(sound => sound.muted = false);
    }
}

function toggleMusic() {
    const musicButton = document.getElementById('musicButton');
    if (musicButton.innerText === '🎵 Lofi' || !currentTrack) {
        // Stop current track
        if (currentTrack) {
            currentTrack.pause();
            currentTrack.currentTime = 0;
        }

        // Randomly select a new track
        const tracks = ['lofiMusic1', 'lofiMusic2', 'lofiMusic3', 'lofiMusic4'];
        const selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];
        currentTrack = document.getElementById(selectedTrack);

        // Play selected track
        currentTrack.play();
        musicButton.innerText = '⏸️ Lofi';
    } else {
        currentTrack.pause();
        musicButton.innerText = '🎵 Lofi';
    }
}

document.getElementById('bombs').addEventListener('input', function (e) {
    if (parseInt(this.value) > 24) this.value = 24;
    if (parseInt(this.value) < 1) this.value = 1;
    playSound('increaseDecreaseSound');
});

document.getElementById('bet').addEventListener('input', function (e) {
    playSound('increaseDecreaseSound');
});
