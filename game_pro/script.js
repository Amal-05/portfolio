// --- Navigation & Global Logic ---
const views = document.querySelectorAll('.view');
const gameCards = document.querySelectorAll('.game-card');
const backBtns = document.querySelectorAll('.back-btn');

let isMuted = false;
let homeMusicInterval;

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('mute-btn');
    btn.innerText = isMuted ? '🔇 Muted' : '🔊 Mute';
}
document.getElementById('mute-btn').addEventListener('pointerdown', toggleMute);

function showView(viewId) {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId !== 'home-view' && homeMusicInterval) { clearInterval(homeMusicInterval); homeMusicInterval = null; } 
    else if (viewId === 'home-view' && !homeMusicInterval) { startHomeMusic(); }

    if(viewId === 'snake-view') initSnakeGame();
    if(viewId === 'tictactoe-view') initTicTacToe();
    if(viewId === 'circle-view') initCircleGame();
    if(viewId === 'reaction-view') initReactionGame();
    if(viewId === 'aim-view') initAimGame();
    if(viewId === 'words-view') initWordsGame();
    if(viewId === 'sort-view') initSortGame();
}

gameCards.forEach(card => card.addEventListener('click', () => { playClick(); showView(card.dataset.target); }));
backBtns.forEach(btn => btn.addEventListener('click', () => { playClick(); clearAllIntervals(); showView('home-view'); }));

function clearAllIntervals() {
    if (snakeFrameId) cancelAnimationFrame(snakeFrameId);
    if (reactionTimeout) clearTimeout(reactionTimeout);
    if (aimTimerInterval) clearInterval(aimTimerInterval);
    if (wordsFrameId) cancelAnimationFrame(wordsFrameId);
    isGameOver = true; drawingCircle = false; wordsGameOver = true;
}

// --- Audio System ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol=0.1) {
    if(isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

const playClick = () => playTone(600, 'sine', 0.1, 0.2);
const playEat = () => playTone(1200, 'square', 0.1, 0.1);
const playOver = () => playTone(150, 'sawtooth', 0.5, 0.2);
const playWin = () => playTone(800, 'triangle', 0.4, 0.2);
const playBloop = () => playTone(500, 'sine', 0.1, 0.2);
const playChime = () => { playTone(523.25, 'sine', 0.5, 0.1); setTimeout(()=>playTone(659.25, 'sine', 0.5, 0.1), 100); };
const playError = () => playTone(200, 'square', 0.2, 0.2);
const playPop = (combo) => playTone(400 + combo * 100, 'sine', 0.1, 0.1);

const melodies = [
    [523.25, null, 659.25, 783.99, null, 659.25, 523.25, 392.00], 
    [440.00, 523.25, 659.25, 523.25, 440.00, 329.63, null, null], 
    [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, null], 
    [349.23, 440.00, 523.25, 440.00, 349.23, null, 261.63, null]  
];
let currentMelody = melodies[Math.floor(Math.random() * melodies.length)];
let melodyIndex = 0, loopCount = 0;
function startHomeMusic() {
    homeMusicInterval = setInterval(() => {
        if (!isMuted && currentMelody[melodyIndex]) playTone(currentMelody[melodyIndex], 'square', 0.15, 0.05);
        melodyIndex++;
        if (melodyIndex >= currentMelody.length) {
            melodyIndex = 0; loopCount++;
            if (loopCount >= 4) { currentMelody = melodies[Math.floor(Math.random() * melodies.length)]; loopCount = 0; }
        }
    }, 250);
}
startHomeMusic();

// --- 1. Snake Game Logic ---
let snakeFrameId; const snakeCanvas = document.getElementById('snake-canvas'), snakeCtx = snakeCanvas.getContext('2d');
let snake = [], food = {}, dx = 25, dy = 0, snakeScore = 0, gameSpeed = 100, lastTime = 0, isGameOver = false;
const CELL = 25;

function initSnakeGame() {
    snake = [ {x: 250, y: 250}, {x: 225, y: 250}, {x: 200, y: 250} ];
    dx = CELL; dy = 0; snakeScore = 0; gameSpeed = 120;
    document.getElementById('snake-score').innerText = snakeScore;
    document.getElementById('snake-game-over').classList.add('hidden');
    isGameOver = false; spawnFood();
    if (snakeFrameId) cancelAnimationFrame(snakeFrameId);
    lastTime = performance.now(); snakeLoop(lastTime);
}

function spawnFood() { food.x = Math.floor(Math.random()*(500/CELL))*CELL; food.y = Math.floor(Math.random()*(500/CELL))*CELL; }

function snakeLoop(time) {
    if (isGameOver) return;
    snakeFrameId = requestAnimationFrame(snakeLoop);
    if (time - lastTime < gameSpeed) return;
    lastTime = time;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { snakeScore += 10; document.getElementById('snake-score').innerText = snakeScore; playEat(); spawnFood(); gameSpeed = Math.max(60, gameSpeed - 3); } else { snake.pop(); }
    if (head.x < 0 || head.x >= 500 || head.y < 0 || head.y >= 500) return endSnakeGame();
    for (let i = 1; i < snake.length; i++) if (head.x === snake[i].x && head.y === snake[i].y) return endSnakeGame();

    snakeCtx.clearRect(0, 0, 500, 500);
    snakeCtx.fillStyle = '#ff7675'; snakeCtx.beginPath(); snakeCtx.arc(food.x+CELL/2, food.y+CELL/2, CELL/2.2, 0, Math.PI*2); snakeCtx.fill();
    snake.forEach((part, index) => { snakeCtx.fillStyle = index === 0 ? '#b2bec3' : '#dfe6e9'; snakeCtx.fillRect(part.x, part.y, CELL-1, CELL-1); });
}
function endSnakeGame() { isGameOver = true; playOver(); document.getElementById('snake-final-score').innerText = snakeScore; document.getElementById('snake-game-over').classList.remove('hidden'); }
document.getElementById('snake-restart').addEventListener('click', () => { playClick(); initSnakeGame(); });

const setDxDy = (nx, ny) => { if(isGameOver) return; if(nx!==0 && dx===0) {dx=nx; dy=0} else if(ny!==0 && dy===0) {dx=0; dy=ny} };
document.addEventListener('keydown', (e) => {
    if(document.getElementById('snake-view').classList.contains('active')){
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
        if (e.key === 'ArrowUp') setDxDy(0, -CELL); else if (e.key === 'ArrowDown') setDxDy(0, CELL); else if (e.key === 'ArrowLeft') setDxDy(-CELL, 0); else if (e.key === 'ArrowRight') setDxDy(CELL, 0);
    }
});
// Mobile D-Pad
document.getElementById('up-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); setDxDy(0,-CELL); });
document.getElementById('down-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); setDxDy(0,CELL); });
document.getElementById('left-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); setDxDy(-CELL,0); });
document.getElementById('right-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); setDxDy(CELL,0); });

// --- 2. Tic Tac Toe (vs AI) ---  [SAME AS BEFORE]
const cells = document.querySelectorAll('.ttt-cell'); let currentTurn = 'X', board = Array(9).fill(''), tttGameOver = false;
function initTicTacToe() { board = Array(9).fill(''); currentTurn = 'X'; tttGameOver = false; document.getElementById('ttt-turn').innerText = 'X (You)'; document.getElementById('ttt-result').classList.add('hidden'); cells.forEach(c => { c.innerText = ''; c.classList.remove('x', 'o'); }); }
const winCombos = [ [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6] ];
function checkWin(b) { for (let combo of winCombos) { if (b[combo[0]] && b[combo[0]] === b[combo[1]] && b[combo[1]] === b[combo[2]]) return b[combo[0]]; } return b.includes('') ? null : 'Draw'; }
function handleTTTEnd(result) { tttGameOver = true; if(result === 'X') { playWin(); document.getElementById('ttt-winner-text').innerText = `You Win!`; } else if(result === 'O') { playOver(); document.getElementById('ttt-winner-text').innerText = `AI Wins!`; } else { playClick(); document.getElementById('ttt-winner-text').innerText = `Draw!`; } document.getElementById('ttt-result').classList.remove('hidden'); }
function updateTTTUI(id, player) { board[id] = player; cells[id].innerText = player; cells[id].classList.add(player.toLowerCase()); }
function aiMove() {
    if(tttGameOver) return;
    for(let i=0; i<9; i++) { if(!board[i]) { board[i] = 'O'; if(checkWin(board) === 'O') { updateTTTUI(i, 'O'); playClick(); const r = checkWin(board); if(r) handleTTTEnd(r); return; } board[i] = ''; } }
    for(let i=0; i<9; i++) { if(!board[i]) { board[i] = 'X'; if(checkWin(board) === 'X') { board[i] = ''; updateTTTUI(i, 'O'); playClick(); const r = checkWin(board); if(r) handleTTTEnd(r); return; } board[i] = ''; } }
    if(!board[4]) { updateTTTUI(4, 'O'); playClick(); const r=checkWin(board); if(r) handleTTTEnd(r); return; }
    for(let i=0; i<9; i++) { if(!board[i]){ updateTTTUI(i, 'O'); playClick(); const r=checkWin(board); if(r) handleTTTEnd(r); return; } }
}
cells.forEach(c => {
    c.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const id = parseInt(c.dataset.index);
        if (board[id] || tttGameOver || currentTurn !== 'X') return;
        playClick(); updateTTTUI(id, 'X'); let result = checkWin(board); if (result) return handleTTTEnd(result);
        currentTurn = 'O'; document.getElementById('ttt-turn').innerText = 'O (AI Thinking...)';
        setTimeout(() => { aiMove(); if(!tttGameOver) { currentTurn = 'X'; document.getElementById('ttt-turn').innerText = 'X (You)'; } }, 400);
    });
});
document.getElementById('ttt-restart').addEventListener('click', () => { playClick(); initTicTacToe(); });

// --- 3. Perfect Circle (Responsive touches) --- 
const circleCanvas = document.getElementById('circle-canvas'), circleCtx = circleCanvas.getContext('2d');
let drawingCircle = false, circlePoints = []; const CIRCLE_CENTER = { x: 250, y: 250 };
function initCircleGame() { circleCtx.clearRect(0, 0, 500, 500); circlePoints = []; document.getElementById('circle-score').innerText = '0%'; }

const getCanvasPt = (clientX, clientY) => {
    const rect = circleCanvas.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 500 / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
};

const startCircle = (clientX, clientY) => {
    drawingCircle = true; circlePoints = []; circleCtx.clearRect(0, 0, 500, 500); circleCtx.beginPath();
    const pt = getCanvasPt(clientX, clientY); circleCtx.moveTo(pt.x, pt.y); circlePoints.push(pt);
}
const moveCircle = (clientX, clientY) => {
    if (!drawingCircle) return;
    const pt = getCanvasPt(clientX, clientY); circlePoints.push(pt);
    circleCtx.lineTo(pt.x, pt.y); circleCtx.strokeStyle = '#fff'; circleCtx.lineWidth = 6; circleCtx.lineCap = 'round'; circleCtx.stroke();
}
const endCircleDrawing = () => { if(!drawingCircle) return; drawingCircle = false; calculateCircleScore(); };

circleCanvas.addEventListener('mousedown', (e) => startCircle(e.clientX, e.clientY));
circleCanvas.addEventListener('mousemove', (e) => moveCircle(e.clientX, e.clientY));
circleCanvas.addEventListener('mouseup', endCircleDrawing); circleCanvas.addEventListener('mouseleave', endCircleDrawing);
circleCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startCircle(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
circleCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); moveCircle(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
circleCanvas.addEventListener('touchend', (e) => { e.preventDefault(); endCircleDrawing(); });

function calculateCircleScore() {
    if (circlePoints.length < 10) return;
    let totalRadius = 0; circlePoints.forEach(p => { totalRadius += Math.sqrt((p.x - CIRCLE_CENTER.x)**2 + (p.y - CIRCLE_CENTER.y)**2); });
    const avgRadius = totalRadius / circlePoints.length;
    let variance = 0; circlePoints.forEach(p => { const r = Math.sqrt((p.x - CIRCLE_CENTER.x)**2 + (p.y - CIRCLE_CENTER.y)**2); variance += Math.abs(r - avgRadius); });
    const avgVariance = variance / circlePoints.length;
    const startObj = circlePoints[0], endObj = circlePoints[circlePoints.length - 1]; const gap = Math.sqrt((startObj.x - endObj.x)**2 + (startObj.y - endObj.y)**2);
    let score = 100 - (avgVariance / avgRadius * 100 * 2) - (gap > 50 ? 20 : 0); score = Math.max(0, Math.min(100, score));
    document.getElementById('circle-score').innerText = score.toFixed(1) + '%';
    playChime();
    circleCtx.beginPath(); circleCtx.arc(CIRCLE_CENTER.x, CIRCLE_CENTER.y, avgRadius, 0, 2 * Math.PI); circleCtx.strokeStyle = 'rgba(116, 235, 213, 0.6)'; circleCtx.lineWidth = 4; circleCtx.stroke();
}
document.getElementById('circle-restart').addEventListener('click', () => { playClick(); initCircleGame(); });

// --- 4. Reaction Time --- 
const reactionBox = document.getElementById('reaction-area'), reactionText = document.getElementById('reaction-text'), reactionView = document.getElementById('reaction-view');
let reactionState = 'waiting', reactionTimeout, reactionStartTime = 0, bestReaction = Infinity;
function initReactionGame() { if (reactionTimeout) clearTimeout(reactionTimeout); reactionState = 'waiting'; reactionView.style.background = '#2d3436'; reactionText.innerText = 'Tap anywhere to Start'; }
function updateReactionState(state, color, text) { reactionState = state; reactionView.style.background = color; reactionText.innerText = text; }
reactionBox.addEventListener('pointerdown', () => {
    if (reactionState === 'waiting') { playClick(); updateReactionState('ready', '#e17055', 'Wait for green...');
        reactionTimeout = setTimeout(() => { updateReactionState('go', '#55efc4', 'Tap!'); playTone(800, 'sine', 0.2, 0.2); reactionStartTime = performance.now(); }, 1500 + Math.random() * 3000);
    } else if (reactionState === 'ready') { clearTimeout(reactionTimeout); updateReactionState('result', '#0984e3', 'Too early!\nTap to restart.'); playFail();
    } else if (reactionState === 'go') { const time = performance.now() - reactionStartTime; updateReactionState('result', '#0984e3', `Time: ${time.toFixed(0)} ms\nTap to restart`); playWin(); if (time < bestReaction) { bestReaction = time; document.getElementById('reaction-best').innerText = `${time.toFixed(0)} ms`; }
    } else if (reactionState === 'result') { initReactionGame(); }
});

// --- 5. Aim Trainer --- 
const aimArea = document.getElementById('aim-area'); let aimScore = 0, aimTimeLeft = 30, aimTimerInterval;
function initAimGame() { document.getElementById('aim-start-screen').classList.remove('hidden'); document.getElementById('aim-end-screen').classList.add('hidden'); document.getElementById('aim-timer').innerText = '30'; document.getElementById('aim-score').innerText = '0'; aimArea.innerHTML = ''; if(aimTimerInterval) clearInterval(aimTimerInterval); }
document.getElementById('aim-start-btn').addEventListener('pointerdown', () => { playClick(); document.getElementById('aim-start-screen').classList.add('hidden'); aimScore = 0; aimTimeLeft = 30; document.getElementById('aim-score').innerText = aimScore; aimTimerInterval = setInterval(() => { aimTimeLeft--; document.getElementById('aim-timer').innerText = aimTimeLeft; if(aimTimeLeft <= 0) endAimGame(); }, 1000); spawnAimTarget(); });
document.getElementById('aim-restart-btn').addEventListener('pointerdown', () => { playClick(); initAimGame(); });
function spawnAimTarget() {
    aimArea.innerHTML = ''; const target = document.createElement('div'); target.classList.add('aim-target');
    const w = aimArea.clientWidth || window.innerWidth, h = aimArea.clientHeight || window.innerHeight - 80;
    target.style.left = `${50 + Math.random() * (w - 100)}px`; target.style.top = `${50 + Math.random() * (h - 100)}px`;
    target.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); playBloop(); aimScore++; document.getElementById('aim-score').innerText = aimScore; target.remove(); if(aimTimeLeft > 0) spawnAimTarget(); });
    aimArea.appendChild(target);
}
function endAimGame() { clearInterval(aimTimerInterval); aimArea.innerHTML = ''; playWin(); document.getElementById('aim-final-score').innerText = aimScore; document.getElementById('aim-end-screen').classList.remove('hidden'); }

// --- 6. Falling Words ---
const wordsArea = document.getElementById('words-area'), wordsInput = document.getElementById('words-input');
const WORD_LIST = ["REACT", "VITE", "GAME", "JAVASCRIPT", "AWESOME", "DEBUG", "FUNCTION", "VARIABLE", "CSS", "CODING", "NEAL", "ENTER", "TYPING"];
let wordsActive = [], wordsScore = 0, wordsCombo = 1, wordsLives = 3, wordsFrameId, wordSpawnTimer = 0, wordsDelay = 2000, wordSpeed = 1.0, wordsGameOver = false;

function initWordsGame() {
    wordsActive = []; wordsScore = 0; wordsCombo = 1; wordsLives = 3; wordsDelay = 2000; wordSpeed = 1.0; wordsGameOver = false; wordsArea.innerHTML = ''; wordsInput.value = '';
    document.getElementById('words-lives').innerText = wordsLives; document.getElementById('words-combo').innerText = wordsCombo; document.getElementById('words-score').innerText = wordsScore;
    document.getElementById('words-start-screen').classList.remove('hidden'); document.getElementById('words-end-screen').classList.add('hidden');
    if(wordsFrameId) cancelAnimationFrame(wordsFrameId);
}
document.getElementById('words-start-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); playClick(); document.getElementById('words-start-screen').classList.add('hidden'); wordsInput.focus(); lastTime = performance.now(); wordsFrameId = requestAnimationFrame(wordsLoop); });
document.getElementById('words-restart-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); playClick(); initWordsGame(); });
function spawnWord() {
    const text = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)], el = document.createElement('div'); el.classList.add('falling-word'); el.innerText = text;
    const w = wordsArea.clientWidth || window.innerWidth, padding = 100, x = padding + Math.random() * (w - 2*padding);
    el.style.left = `${x}px`; el.style.top = `-50px`; wordsArea.appendChild(el); wordsActive.push({ text, el, y: -50 });
}
function wordsLoop(time) {
    if (wordsGameOver) return; wordsFrameId = requestAnimationFrame(wordsLoop); const dt = time - lastTime; lastTime = time;
    wordSpawnTimer += dt; if (wordSpawnTimer > wordsDelay) { spawnWord(); wordSpawnTimer = 0; wordsDelay = Math.max(500, wordsDelay - 50); wordSpeed += 0.05; }
    const h = wordsArea.clientHeight || window.innerHeight;
    for (let i = wordsActive.length - 1; i >= 0; i--) {
        const wObj = wordsActive[i]; wObj.y += (wordSpeed * (dt/16)); wObj.el.style.top = `${wObj.y}px`;
        if (wObj.y > h - 100) {
            wObj.el.remove(); wordsActive.splice(i, 1); wordsLives--; wordsCombo = 1;
            document.getElementById('words-lives').innerText = wordsLives; document.getElementById('words-combo').innerText = wordsCombo;
            playError(); wordsArea.classList.add('shake'); setTimeout(() => wordsArea.classList.remove('shake'), 200);
            if (wordsLives <= 0) { wordsGameOver = true; wordsInput.blur(); playOver(); document.getElementById('words-final-score').innerText = wordsScore; document.getElementById('words-end-screen').classList.remove('hidden'); }
        }
    }
}
wordsInput.addEventListener('input', (e) => {
    if (wordsGameOver) return; const val = e.target.value.toUpperCase(); const matchIndex = wordsActive.findIndex(w => w.text === val);
    if (matchIndex !== -1) {
        playPop(wordsCombo); const wObj = wordsActive[matchIndex];
        wObj.el.style.transition = 'all 0.2s'; wObj.el.style.transform = 'translateX(-50%) scale(2)'; wObj.el.style.opacity = '0';
        setTimeout(() => wObj.el.remove(), 200); wordsActive.splice(matchIndex, 1); wordsInput.value = '';
        wordsScore += 10 * wordsCombo; wordsCombo++; document.getElementById('words-score').innerText = wordsScore; document.getElementById('words-combo').innerText = wordsCombo;
    }
});

// --- 7. Color Stack Sort ---
const sortArea = document.getElementById('sort-area'); let sortTubes = []; const TUBE_COLORS = ['#ff7675', '#74b9ff', '#55efc4', '#fdcb6e']; let selectedTube = null, currentSortLevel = 1;
function initSortGame() { sortTubes = []; selectedTube = null; currentSortLevel = 1; document.getElementById('sort-level').innerText = currentSortLevel; document.getElementById('sort-win-modal').classList.add('hidden'); generateLevel(currentSortLevel); }
document.getElementById('sort-restart').addEventListener('pointerdown', () => { playClick(); selectedTube = null; generateLevel(currentSortLevel); });
document.getElementById('sort-next-level').addEventListener('pointerdown', () => { playClick(); currentSortLevel++; document.getElementById('sort-level').innerText = currentSortLevel; selectedTube = null; document.getElementById('sort-win-modal').classList.add('hidden'); generateLevel(currentSortLevel); });
function generateLevel(level) {
    const numColors = Math.min(TUBE_COLORS.length, 2 + level), totalTubes = numColors + 1; let pool = [];
    for(let i=0; i<numColors; i++) for(let j=0; j<4; j++) pool.push(TUBE_COLORS[i]);
    pool.sort(() => Math.random() - 0.5); sortTubes = [];
    for(let i=0; i<totalTubes; i++) sortTubes.push(i < numColors ? pool.splice(0, 4) : []);
    renderTubes();
}
function renderTubes() {
    sortArea.innerHTML = '';
    sortTubes.forEach((tubeContents, idx) => {
        const el = document.createElement('div'); el.classList.add('tube'); if (selectedTube === idx) el.classList.add('selected');
        tubeContents.forEach(c => { const block = document.createElement('div'); block.classList.add('color-block'); block.style.background = c; el.appendChild(block); });
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); handleTubeClick(idx); });
        sortArea.appendChild(el);
    });
}
function handleTubeClick(idx) {
    if (selectedTube === null) { if (sortTubes[idx].length > 0) { selectedTube = idx; playClick(); renderTubes(); } } 
    else {
        if (selectedTube === idx) { selectedTube = null; playClick(); renderTubes(); return; }
        const src = sortTubes[selectedTube], dest = sortTubes[idx];
        if (src.length > 0 && dest.length < 4) {
            const topSrcColor = src[src.length - 1];
            if (dest.length === 0 || dest[dest.length - 1] === topSrcColor) { dest.push(src.pop()); playBloop(); selectedTube = null; renderTubes(); checkSortWin(); } 
            else { playError(); selectedTube = null; renderTubes(); }
        } else { playError(); selectedTube = null; renderTubes(); }
    }
}
function checkSortWin() {
    let win = true;
    for (let t of sortTubes) { if (t.length > 0) { if (t.length !== 4) { win = false; break; } const c = t[0]; for (let b of t) { if (b !== c) { win = false; break; } } } }
    if (win) { playWin(); document.getElementById('sort-win-modal').classList.remove('hidden'); }
}

isGameOver = true;
