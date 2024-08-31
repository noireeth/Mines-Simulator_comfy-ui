let balance = 5.00;
let gameActive = false;
let bombPositions = [];
let revealedCells = 0;
let multiplier = 1;
let initialBet = 0;
const achievements = [
    { name: "Reach a net worth of $100", achieved: false },
    { name: "Reach a net worth of $1k", achieved: false },
    { name: "Reach a net worth of $1M", achieved: false },
    { name: "Lose 5 times in a row on the first click", achieved: false },
    { name: "Win 5 times in a row on 24/25 bombs", achieved: false },
    { name: "Rare Sound Achievement", achieved: false }
];
let lossStreak = 0;
let winStreak = 0;
const lofiTracks = [
    "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
    "https://www.bensound.com/bensound-music/bensound-dreams.mp3",
    "https://www.bensound.com/bensound-music/bensound-relaxing.mp3"
];

function startGame() {
    const betAmount = parseFloat(document.getElementById('bet').value);
    if (betAmount > balance || betAmount <= 0) {
        alert("Invalid bet amount!");
        return;
    }

    initialBet = betAmount;
    document.getElementById('balance').innerText = (balance - initialBet).toFixed(2);
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
        document.getElementById('result').innerHTML = `<span style="color: red;">-$${initialBet.toFixed(2)} | -${(initialBet * 100).toFixed(2)}%</span>`;
        lossStreak++;
        winStreak = 0;
        checkAchievement("Lose 5 times in a row on the first click", lossStreak >= 5);
        setTimeout(() => {
            multiplier = 1;
            updateBalance(0);
        }, 1500);
    } else {
        cell.innerHTML = "💎";
        cell.classList.add('revealed');
        playSound('diamondSound');
        revealedCells++;
        calculateMultiplier();
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
    let baseMultiplier = 1.1 + (bombs / 25) * 23.65;
    multiplier = (baseMultiplier * Math.pow(1.05, revealedCells)).toFixed(2);
    let multiplierElement = document.getElementById('multiplier');
    multiplierElement.innerText = `x${multiplier}`;
    multiplierElement.style.animation = 'popAnimation 0.5s ease-in-out';
}

function cashout() {
    if (gameActive) {
        const winnings = initialBet * multiplier;
        balance += winnings;
        updateBalance(0);
        document.getElementById('result').innerHTML = winnings >= initialBet
            ? `<span style="color: green;">+$${winnings.toFixed(2)} | +${((multiplier - 1) * 100).toFixed(2)}%</span>`
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

function updateBalance(amount) {
    balance += amount;
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
    let musicPlayer = document.getElementById('lofiMusic');
    if (musicButton.innerText === '🎵 Lofi') {
        musicPlayer.play();
        musicButton.innerText = '⏸️ Lofi';
    } else {
        musicPlayer.pause();
        musicPlayer.src = lofiTracks[Math.floor(Math.random() * lofiTracks.length)];
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
