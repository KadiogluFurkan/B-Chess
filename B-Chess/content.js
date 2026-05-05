// ==========================================
// B-Chess v1.1 Master — content.js
// 
// UPGRADES IN THIS VERSION:
// 1. Preferences Section: Added "Tercihler" for UI customization.
// 2. Light/Dark Mode: Fully customizable theme support.
// 3. Board Flip (Auto-Sync): Automatically flips the board to match chess.com, or allows manual flipping.
// 4. MultiPV Live Update: Changing the MultiPV slider instantly updates the arrows.
// 5. Enhanced Stability: Minor bug fixes for rapid move sequences.
// ==========================================

// ─────────────────────────────────────────
// 0. CSS THEME INJECTION
// ─────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.innerHTML = `
    :root {
        --bc-bg-main: #1e1e1e;
        --bc-bg-sec: #252526;
        --bc-text-main: #ffffff;
        --bc-text-sub: #d4d4d4;
        --bc-accent: #007acc;
        --bc-border: #444;
    }
    .bc-light-theme {
        --bc-bg-main: #f3f4f6;
        --bc-bg-sec: #ffffff;
        --bc-text-main: #111827;
        --bc-text-sub: #4b5563;
        --bc-accent: #2563eb;
        --bc-border: #d1d5db;
    }
    #bchess-widget {
        color: var(--bc-text-main);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    #bchess-content {
        background: var(--bc-bg-main);
    }
    .bc-panel {
        background: var(--bc-bg-sec);
    }
    .bc-select {
        padding: 4px;
        border-radius: 4px;
        background: var(--bc-bg-main);
        color: var(--bc-text-main);
        border: 1px solid var(--bc-border);
        outline: none;
    }
`;
document.head.appendChild(styleEl);

// ─────────────────────────────────────────
// 1. HTML WIDGET (UI)
// ─────────────────────────────────────────
const widgetHTML = `
<div id="bchess-header" style="background:var(--bc-accent);color:#fff;padding:10px 15px;font-weight:bold;cursor:grab;user-select:none;display:flex;justify-content:space-between;align-items:center;border-radius:10px 10px 0 0;flex-shrink:0;transition: background 0.3s;">
    <span>B-Chess v1.1 Master</span>
    <div style="display:flex;gap:12px;align-items:center;">
        <span id="bchess-minimize" style="cursor:pointer;font-size:18px;">_</span>
        <span id="bchess-close" style="cursor:pointer;font-size:22px;color:#ff6b6b;">&times;</span>
    </div>
</div>

<div id="bchess-content" style="padding:15px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;transition: background 0.3s;">
    <div class="bc-panel" style="padding:14px;border-radius:8px;text-align:center;transition: background 0.3s;">
        <p id="eval-display" style="font-size:28px;font-weight:bold;color:var(--bc-text-main);margin:0;">+0.00</p>
        <p id="eval-bar-text" style="font-size:13px;font-weight:bold;color:#888;margin:4px 0 0;">Motor Bekleniyor...</p>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--bc-text-sub);margin-top:6px;">
            <span id="nps-val">Hz: 0 kn/s</span>
            <span id="depth-info">Derinlik: 0</span>
        </div>
        <div id="turn-badge" style="margin-top:8px;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:bold;background:#2a2a2a;color:#aaa;display:inline-block;">Sira Bekleniyor...</div>
        <div id="turn-method" style="font-size:10px;color:var(--bc-text-sub);margin-top:4px;">Hakem: Hazırlanıyor</div>
    </div>

    <div id="bchess-board-wrapper" style="position:relative;">
        <div id="bchess-board" style="width:100%;height:350px;"></div>
        <div id="bchess-overlay" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-radius:4px;">
            <h2 id="bchess-overlay-title" style="margin:0 0 14px;font-size:22px;font-weight:900;"></h2>
            <button id="bchess-overlay-close" style="background:var(--bc-accent);color:#fff;border:none;padding:8px 20px;border-radius:20px;cursor:pointer;font-weight:bold;">Devam Et</button>
        </div>
    </div>

    <details open>
        <summary class="bc-panel" style="cursor:pointer;font-weight:bold;padding:10px;border-radius:5px;color:var(--bc-text-main);transition: background 0.3s;">Stockfish Ayarlari</summary>
        <div style="padding:10px;display:flex;flex-direction:column;gap:10px;font-size:12px;color:var(--bc-text-sub);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <label>MultiPV (Ok): <b id="multipv-val" style="color:#4caf50;">1</b></label>
                <input type="range" id="engine-multipv" min="1" max="5" value="1" style="width:50%;">
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <label>Derinlik: <b id="depth-val" style="color:#4caf50;">18</b></label>
                <input type="range" id="engine-depth" min="10" max="30" value="18" style="width:50%;">
            </div>
            <button id="start-engine-btn" style="background:#4caf50;color:#fff;border:none;padding:10px;border-radius:5px;cursor:pointer;font-weight:bold;">MOTORU CALISTIR</button>
        </div>
    </details>

    <details open>
        <summary class="bc-panel" style="cursor:pointer;font-weight:bold;padding:10px;border-radius:5px;color:var(--bc-text-main);transition: background 0.3s;">Tercihler</summary>
        <div style="padding:10px;display:flex;flex-direction:column;gap:10px;font-size:12px;color:var(--bc-text-sub);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <label>Tema:</label>
                <select id="pref-theme" class="bc-select">
                    <option value="dark">Karanlık</option>
                    <option value="light">Aydınlık</option>
                </select>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <label>Tahta Yönü:</label>
                <select id="pref-flip" class="bc-select">
                    <option value="auto">Otomatik (Oyuna Göre)</option>
                    <option value="white">Beyaz Aşağıda</option>
                    <option value="black">Siyah Aşağıda</option>
                </select>
            </div>
        </div>
    </details>
</div>
`;

// ─────────────────────────────────────────
// 2. WIDGET SETUP & PREFERENCES
// ─────────────────────────────────────────
const widgetContainer = document.createElement('div');
widgetContainer.id = 'bchess-widget';
widgetContainer.innerHTML = widgetHTML;
document.body.appendChild(widgetContainer);

const contentDiv = document.getElementById('bchess-content');
const widget = document.getElementById('bchess-widget');
const header = document.getElementById('bchess-header');

document.getElementById('bchess-minimize').onclick = () => contentDiv.style.display = contentDiv.style.display === 'none' ? 'flex' : 'none';
document.getElementById('bchess-close').onclick = () => widget.style.display = 'none';

// Live Update for Engine Settings
document.getElementById('engine-multipv').oninput = e => {
    document.getElementById('multipv-val').innerText = e.target.value;
    if (isEngineRunning) analyzePosition(gameTracker.fen()); // Instantly updates arrows
};
document.getElementById('engine-depth').oninput = e => {
    document.getElementById('depth-val').innerText = e.target.value;
    if (isEngineRunning) analyzePosition(gameTracker.fen());
};

// Preferences Logic
document.getElementById('pref-theme').onchange = e => {
    if (e.target.value === 'light') widget.classList.add('bc-light-theme');
    else widget.classList.remove('bc-light-theme');
};

document.getElementById('pref-flip').onchange = e => {
    if (e.target.value !== 'auto' && window.bchessBoard) {
        window.bchessBoard.orientation(e.target.value);
    }
};

let isDraggingWidget = false, wOffX, wOffY;
header.addEventListener('mousedown', e => {
    if (['bchess-close','bchess-minimize'].includes(e.target.id)) return;
    isDraggingWidget = true;
    wOffX = e.clientX - widget.getBoundingClientRect().left;
    wOffY = e.clientY - widget.getBoundingClientRect().top;
});
document.addEventListener('mousemove', e => {
    if (!isDraggingWidget) return;
    widget.style.left = (e.clientX - wOffX) + 'px';
    widget.style.top = (e.clientY - wOffY) + 'px';
    widget.style.right = 'auto';
});
document.addEventListener('mouseup', () => isDraggingWidget = false);

setTimeout(() => {
    window.bchessBoard = window.Chessboard('bchess-board', {
        position: 'start',
        showNotation: true,
        pieceTheme: p => chrome.runtime.getURL('img/chesspieces/wikipedia/' + p + '.png')
    });
}, 1000);

// ─────────────────────────────────────────
// 3. FEN PARSER & TURN INTELLIGENCE
// ─────────────────────────────────────────
function getFenBaseFromDOM() {
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    const pieces = document.querySelectorAll('.piece');
    
    pieces.forEach(p => {
        if (p.classList.contains('ghost') || p.classList.contains('dragging')) return;
        const style = window.getComputedStyle(p);
        if (style.display === 'none') return;
        
        const ct = (p.className.match(/\b([wb][prnbkq])\b/) || [])[1];
        const sqMatch = p.className.match(/\bsquare-([a-h1-8]{2})\b/);
        if (!ct || !sqMatch) return;
        
        const sq = sqMatch[1];
        let col, row;
        
        if (sq[0] >= 'a' && sq[0] <= 'h') {
            col = sq.charCodeAt(0) - 97; 
            row = 8 - parseInt(sq[1], 10);
        } else {
            col = parseInt(sq[0], 10) - 1; 
            row = 8 - parseInt(sq[1], 10); 
        }
        
        if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
            board[row][col] = ct[0] === 'w' ? ct[1].toUpperCase() : ct[1];
        }
    });

    return board.map(row => {
        let e = 0, s = '';
        for (const c of row) { if (!c) e++; else { if (e) { s += e; e = 0; } s += c; } }
        return s + (e || '');
    }).join('/');
}

function guessTurnAndCastling(boardBase) {
    let turn = 'w';
    const highlights = document.querySelectorAll('.highlight');
    let lastMovedColor = null;

    highlights.forEach(hl => {
        const sqMatch = hl.className.match(/\bsquare-([a-h1-8]{2})\b/);
        if (sqMatch) {
            const sq = sqMatch[1];
            const piece = document.querySelector(`.piece.square-${sq}:not(.ghost)`);
            if (piece) {
                const ct = (piece.className.match(/\b([wb])[prnbkq]\b/) || [])[1];
                if (ct) lastMovedColor = ct;
            }
        }
    });

    if (lastMovedColor === 'w') turn = 'b';
    else if (lastMovedColor === 'b') turn = 'w';
    else {
        const activeClockTop = document.querySelector('.clock-top.clock-active, .clock-top .clock-player-turn');
        const activeClockBottom = document.querySelector('.clock-bottom.clock-active, .clock-bottom .clock-player-turn');
        const board = document.querySelector('#board-board, chess-board');
        const isFlipped = board && board.classList.contains('flipped');
        
        if (activeClockBottom) turn = isFlipped ? 'b' : 'w';
        else if (activeClockTop) turn = isFlipped ? 'w' : 'b';
    }

    let castling = '';
    const rows = boardBase.split('/');
    if (rows[0].match(/^r...k..r/)) castling += 'kq';
    else {
        if (rows[0].match(/^r...k/)) castling += 'q';
        if (rows[0].match(/k..r$/)) castling += 'k';
    }
    if (rows[7].match(/^R...K..R/)) castling += 'KQ';
    else {
        if (rows[7].match(/^R...K/)) castling += 'Q';
        if (rows[7].match(/K..R$/)) castling += 'K';
    }
    if (!castling) castling = '-';

    return { turn, castling };
}

function updateTurnUI(turn, method = 'chess.js Güvenli Doğrulama') {
    const badge = document.getElementById('turn-badge');
    const src = document.getElementById('turn-method');
    if (turn === 'w') {
        badge.innerText = 'Beyazin Sirasi';
        badge.style.background = '#1a3a5c'; badge.style.color = '#fff';
    } else {
        badge.innerText = 'Siyahin Sirasi';
        badge.style.background = '#333'; badge.style.color = '#ccc';
    }
    src.innerText = 'Hakem: ' + method;
}

// ─────────────────────────────────────────
// 4. THE MASTER GAME TRACKER (chess.js)
// ─────────────────────────────────────────
let gameTracker = typeof window.Chess === "function" ? new window.Chess() : new Chess();
let fenHistory = [gameTracker.fen()];
let isOverlayDismissed = false;

let stableScrapedBase = null;
let stableCount = 0;
let lastAutoFlipState = null;

function applyValidatedPosition(fullFen, method = 'chess.js Güvenli Doğrulama') {
    const turn = fullFen.split(' ')[1];
    updateTurnUI(turn, method);
    window.bchessBoard?.position(fullFen, false);
    if (isEngineRunning) analyzePosition(fullFen);
}

document.getElementById('bchess-overlay-close').onclick = () => {
    document.getElementById('bchess-overlay').style.display = 'none';
    isOverlayDismissed = true;
};

setInterval(() => {
    // Auto-Flip Logic
    if (document.getElementById('pref-flip').value === 'auto' && window.bchessBoard) {
        const boardEl = document.querySelector('chess-board, #board-board');
        if (boardEl) {
            const isFlipped = boardEl.classList.contains('flipped');
            if (isFlipped !== lastAutoFlipState) {
                lastAutoFlipState = isFlipped;
                window.bchessBoard.orientation(isFlipped ? 'black' : 'white');
            }
        }
    }

    if (document.querySelector('.dragging')) {
        stableCount = 0;
        return;
    }

    const scrapedBase = getFenBaseFromDOM();
    if (!scrapedBase) return;

    const currentBase = gameTracker.fen().split(' ')[0];
    if (scrapedBase === currentBase) {
        stableCount = 0;
        return; 
    }

    const legalMoves = gameTracker.moves({ verbose: true });
    for (let m of legalMoves) {
        gameTracker.move(m);
        const nextFen = gameTracker.fen();
        if (nextFen.split(' ')[0] === scrapedBase) {
            fenHistory.push(nextFen);
            applyValidatedPosition(nextFen);
            stableCount = 0;
            return;
        }
        gameTracker.undo(); 
    }

    const historyIndex = fenHistory.findIndex(f => f.split(' ')[0] === scrapedBase);
    if (historyIndex !== -1) {
        fenHistory = fenHistory.slice(0, historyIndex + 1);
        const revertedFen = fenHistory[fenHistory.length - 1];
        gameTracker.load(revertedFen);
        applyValidatedPosition(revertedFen);
        stableCount = 0;
        return;
    }

    if (scrapedBase === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR') {
        gameTracker.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        fenHistory = [gameTracker.fen()];
        applyValidatedPosition(gameTracker.fen());
        stableCount = 0;
        return;
    }

    if (stableScrapedBase === scrapedBase) {
        stableCount++;
        if (stableCount >= 8) {
            const { turn, castling } = guessTurnAndCastling(scrapedBase);
            const newFen = `${scrapedBase} ${turn} ${castling} - 0 1`;
            const loaded = gameTracker.load(newFen);
            if (loaded) {
                fenHistory = [gameTracker.fen()];
                applyValidatedPosition(gameTracker.fen(), 'Senkronize Edildi (Mid-Game)');
            }
            stableCount = 0;
        }
    } else {
        stableScrapedBase = scrapedBase;
        stableCount = 1;
    }

    const modal = document.querySelector('.board-dialog-component,.game-over-modal,.game-result-modal,[class*="game-over"],.computer-game-over-component');
    const overlay = document.getElementById('bchess-overlay');
    if (modal && !isOverlayDismissed) {
        if (overlay.style.display === 'none') {
            const txt = modal.innerText.toLowerCase();
            const title = document.getElementById('bchess-overlay-title');
            title.innerText = '';
            if (/lost|kaybettin|pes|terk|resignation|abandoned/.test(txt)) {
                title.innerText = 'BEYNİNİ KULLAN'; title.style.color = '#ff4c4c';
            } else if (/won|kazandin|victory/.test(txt)) {
                title.innerText = 'TEBRİKLER! KAZANDINIZ'; title.style.color = '#4caf50';
            } else if (/draw|berabere|stalemate|pat/.test(txt)) {
                title.innerText = 'BERABERE'; title.style.color = '#f39c12';
            }
            if (title.innerText) overlay.style.display = 'flex';
        }
    } else if (!modal) {
        overlay.style.display = 'none';
        isOverlayDismissed = false;
    }
}, 100);

// ─────────────────────────────────────────
// 5. ARROW DRAWING (DYNAMIC PULLBACK & ELEGANT)
// ─────────────────────────────────────────
let currentArrows = {};

function getSquareCenter(squareEl) {
    const wrapper = document.getElementById('bchess-board-wrapper');
    const wRect = wrapper.getBoundingClientRect();
    const sRect = squareEl.getBoundingClientRect();
    return {
        x: sRect.left - wRect.left + sRect.width / 2,
        y: sRect.top - wRect.top + sRect.height / 2
    };
}

function drawArrows() {
    const wrapper = document.getElementById('bchess-board-wrapper');
    const boardEl = document.getElementById('bchess-board');
    if (!wrapper || !boardEl) return;

    const old = document.getElementById('bchess-svg');
    if (old) old.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'bchess-svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;overflow:visible;';

    const colors = {
        1: 'rgba(30,144,255,0.9)', 2: 'rgba(255,165,30,0.9)', 
        3: 'rgba(50,210,80,0.9)', 4: 'rgba(200,50,200,0.9)', 5: 'rgba(255,60,60,0.9)'
    };

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    for (let i = 1; i <= 5; i++) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'bch-arr-' + i);
        marker.setAttribute('markerWidth', '4'); marker.setAttribute('markerHeight', '4');
        marker.setAttribute('refX', '3'); marker.setAttribute('refY', '2');
        marker.setAttribute('orient', 'auto');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', '0 0, 4 2, 0 4');
        poly.setAttribute('fill', colors[i]);
        marker.appendChild(poly);
        defs.appendChild(marker);
    }
    svg.appendChild(defs);

    // Draw arrows in reverse order so the primary PV (1) is always on top
    Object.keys(currentArrows).sort((a,b) => b - a).forEach(mpv => {
        const move = currentArrows[mpv];
        const fromEl = boardEl.querySelector('.square-' + move.from);
        const toEl = boardEl.querySelector('.square-' + move.to);
        if (!fromEl || !toEl) return;

        const p1 = getSquareCenter(fromEl);
        const p2 = getSquareCenter(toEl);

        const dx = p2.x - p1.x, dy = p2.y - p1.y, dist = Math.hypot(dx, dy);
        const pullBack = Math.min(12, dist * 0.25); 
        const ex = p2.x - (dx/dist) * pullBack; 
        const ey = p2.y - (dy/dist) * pullBack;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
        line.setAttribute('x2', ex); line.setAttribute('y2', ey);
        line.setAttribute('stroke', colors[mpv]);
        
        line.setAttribute('stroke-width', mpv === '1' ? '4.5' : '2.5');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('marker-end', 'url(#bch-arr-' + mpv + ')');
        svg.appendChild(line);
    });
    wrapper.appendChild(svg);
}

// ─────────────────────────────────────────
// 6. STOCKFISH ENGINE
// ─────────────────────────────────────────
let engine, isEngineRunning = false;

function initEngine() {
    if (engine) engine.terminate();
    fetch(chrome.runtime.getURL('stockfish.js')).then(r => r.text()).then(script => {
        const blob = new Blob([script], { type: 'application/javascript' });
        engine = new Worker(URL.createObjectURL(blob));
        engine.onmessage = ({ data: line }) => {
            if (line === 'readyok') { 
                analyzePosition(gameTracker.fen()); 
                return; 
            }
            const npsM = line.match(/nps (\d+)/);
            if (npsM) document.getElementById('nps-val').innerText = 'Hz: ' + (parseInt(npsM[1], 10)/1000).toFixed(1) + 'k kn/s';
            
            if (!line.includes('info depth') || !line.includes('score')) return;
            const mpv = (line.match(/multipv (\d+)/) || [null,1])[1];
            const scoreM = line.match(/score (cp|mate) (-?\d+)/);
            const depthM = line.match(/depth (\d+)/);
            const pvM = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);

            if (depthM) document.getElementById('depth-info').innerText = 'Derinlik: ' + depthM[1];
            if (mpv == 1 && scoreM) {
                const currentTurn = gameTracker.fen().split(' ')[1];
                const whiteRel = currentTurn === 'b' ? -parseInt(scoreM[2]) : parseInt(scoreM[2]);
                const scoreEl = document.getElementById('eval-display'), textEl = document.getElementById('eval-bar-text');
                
                if (scoreM[1] === 'cp') {
                    const v = (Math.abs(whiteRel)/100).toFixed(2);
                    scoreEl.innerText = (whiteRel >= 0 ? '+' : '-') + v;
                    scoreEl.style.color = whiteRel >= 0 ? 'var(--bc-text-main)' : '#ff6b6b';
                    textEl.innerText = whiteRel >= 0 ? 'Beyaz Onde' : 'Siyah Onde';
                } else {
                    scoreEl.innerText = 'M' + Math.abs(parseInt(scoreM[2]));
                    textEl.innerText = whiteRel >= 0 ? 'BEYAZ MAT EDIYOR' : 'SIYAH MAT EDIYOR';
                }
            }
            if (pvM) {
                const mv = pvM[1];
                currentArrows[mpv] = { from: mv.slice(0, 2), to: mv.slice(2, 4) };
                drawArrows();
            }
        };
        engine.postMessage('uci'); engine.postMessage('isready');
    });
}

function analyzePosition(fen) {
    if (!isEngineRunning || !engine) return;
    currentArrows = {}; drawArrows();
    engine.postMessage('stop');
    engine.postMessage('setoption name MultiPV value ' + document.getElementById('engine-multipv').value);
    engine.postMessage('position fen ' + fen);
    engine.postMessage('go depth ' + document.getElementById('engine-depth').value);
}

document.getElementById('start-engine-btn').onclick = function () {
    if (!isEngineRunning) {
        initEngine(); isEngineRunning = true;
        this.innerText = 'MOTORU DURDUR'; this.style.background = '#ff4c4c';
    } else {
        engine?.postMessage('stop'); isEngineRunning = false;
        this.innerText = 'MOTORU CALISTIR'; this.style.background = '#4caf50';
        currentArrows = {}; drawArrows();
    }
};