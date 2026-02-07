'use strict';

// ゲーム状態
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let startTime = null;
let timerInterval = null;
let currentLevel = 0;

// カードの絵柄
const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍑', '🥝', '🥑', '🍍', '🥭'];

// ベストスコア
let bestScores = {
    8: localStorage.getItem('best8') || null,
    12: localStorage.getItem('best12') || null,
    16: localStorage.getItem('best16') || null
};

// 初期化
function init() {
    displayBestScores();
}

// ベストスコア表示
function displayBestScores() {
    document.getElementById('bestEasy').textContent = bestScores[8] || '--:--';
    document.getElementById('bestNormal').textContent = bestScores[12] || '--:--';
    document.getElementById('bestHard').textContent = bestScores[16] || '--:--';
}

// ゲーム開始
function startGame(cardCount) {
    currentLevel = cardCount;
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    startTime = Date.now();
    
    // カード生成
    const pairs = cardCount / 2;
    const selectedEmojis = emojis.slice(0, pairs);
    const gameEmojis = [...selectedEmojis, ...selectedEmojis];
    
    // シャッフル
    for (let i = gameEmojis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameEmojis[i], gameEmojis[j]] = [gameEmojis[j], gameEmojis[i]];
    }
    
    cards = gameEmojis;
    
    // UI更新
    document.getElementById('moves').textContent = moves;
    document.getElementById('pairs').textContent = matchedPairs;
    document.getElementById('totalPairs').textContent = pairs;
    
    // ボード生成
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    board.className = 'game-board';
    
    if (cardCount === 8) board.classList.add('easy');
    else if (cardCount === 12) board.classList.add('normal');
    else board.classList.add('hard');
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-front">${emoji}</div>
            <div class="card-back">❓</div>
        `;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
    
    // タイマー開始
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    showScreen('gameScreen');
}

// カードをめくる
function flipCard() {
    if (flippedCards.length >= 2) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    flippedCards.push(this);
    
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        checkMatch();
    }
}

// マッチ確認
function checkMatch() {
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;
    
    if (cards[index1] === cards[index2]) {
        // マッチ！
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        document.getElementById('pairs').textContent = matchedPairs;
        
        flippedCards = [];
        
        // 全てマッチしたか確認
        if (matchedPairs === cards.length / 2) {
            setTimeout(gameComplete, 500);
        }
    } else {
        // 不一致
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

// タイマー更新
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

// ゲーム完了
function gameComplete() {
    clearInterval(timerInterval);
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    const timeStr = `${minutes}:${seconds}`;
    
    const perfectMoves = cards.length / 2;
    const accuracy = Math.round((perfectMoves / moves) * 100);
    
    document.getElementById('finalTime').textContent = timeStr;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    // 新記録チェック
    const recordMsg = document.getElementById('recordMessage');
    if (!bestScores[currentLevel] || elapsed < parseTime(bestScores[currentLevel])) {
        bestScores[currentLevel] = timeStr;
        localStorage.setItem(`best${currentLevel}`, timeStr);
        recordMsg.textContent = '🎊 新記録達成！';
        displayBestScores();
    } else {
        recordMsg.textContent = '';
    }
    
    // 紙吹雪
    launchConfetti();
    
    showScreen('clearScreen');
}

// 時間を秒に変換
function parseTime(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

// 紙吹雪
function launchConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 4
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            
            if (p.y > canvas.height) {
                particles.splice(index, 1);
            }
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// スタート画面に戻る
function backToStart() {
    if (timerInterval) clearInterval(timerInterval);
    showScreen('startScreen');
}

// リプレイ
function replay() {
    startGame(currentLevel);
}

// 初期化
init();
