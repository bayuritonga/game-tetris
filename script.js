const canvas = document.getElementById('board');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

const TETROMINOS = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
];

let currentPiece;
let currentPosition = { x: 3, y: 0 };

let dropInterval = 500; // Interval jatuh dalam milidetik
let lastDropTime = 0;

function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    return TETROMINOS[randomIndex];
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                context.fillStyle = 'blue';
                context.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = 'black';
                context.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    drawPiece();
    drawScore();
}

function drawPiece() {
    currentPiece.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) {
                context.fillStyle = 'red';
                context.fillRect((currentPosition.x + c) * BLOCK_SIZE, (currentPosition.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = 'black';
                context.strokeRect((currentPosition.x + c) * BLOCK_SIZE, (currentPosition.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawScore() {
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 20);
    context.fillText(`High Score: ${highScore}`, 10, 40);
}

function collide(offset) {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                const newX = currentPosition.x + c + offset.x;
                const newY = currentPosition.y + r + offset.y;
                if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) {
                board[currentPosition.y + r][currentPosition.x + c] = value;
            }
        });
    });
}

function rotatePiece() {
    const rotated = currentPiece[0].map((_, index) => currentPiece.map(row => row[index]).reverse());
    if (!collide({ x: 0, y: 0 })) {
        currentPiece = rotated;
    }
}

function removeFullRows() {
    let rowsToRemove = [];
    for (let r = 0; r < ROWS; r++) {
        if (board[r].every(value => value !== 0)) {
            rowsToRemove.push(r);
        }
    }

    rowsToRemove.forEach(row => {
        board.splice(row, 1);
        board.unshift(Array(COLS).fill(0)); // Tambahkan baris kosong di atas
        score += 10; // Tambah skor
        if (score % 100 === 0) {
            dropInterval = Math.max(100, dropInterval - 50); // Kurangi interval jatuh setiap 100 poin, tidak kurang dari 100ms
        }
    });
}

function dropPiece() {
    if (!collide({ x: 0, y: 1 })) {
        currentPosition.y++;
    } else {
        merge();
        removeFullRows(); // Hapus baris penuh setelah potongan jatuh
        currentPiece = randomTetromino();
        currentPosition = { x: 3, y: 0 };
        if (collide({ x: 0, y: 0 })) {
            // Game Over
            if (score > highScore) {
                highScore = score; // Update high score
                localStorage.setItem('highScore', highScore); // Simpan high score ke localStorage
            }
            showGameOverMenu(); // Tampilkan menu Game Over
        }
    }
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0; // Reset skor
    dropInterval = 500; // Reset interval jatuh
    currentPiece = randomTetromino();
    currentPosition = { x: 3, y: 0 };
    drawBoard();
}

function update() {
    const now = Date.now();
    if (now - lastDropTime > dropInterval) {
        dropPiece();
        lastDropTime = now;
    }
    drawBoard();
}

setInterval(update, 50); // Memperbarui tampilan setiap 50ms

function movePiece(direction) {
    if (!collide({ x: direction, y: 0 })) {
        currentPosition.x += direction;
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1); // Gerakkan ke kiri
            break;
        case 'ArrowRight':
            movePiece(1); // Gerakkan ke kanan
            break;
        case 'ArrowDown':
            dropPiece(); // Jatuhkan potongan lebih cepat
            break;
        case 'ArrowUp':
            rotatePiece(); // Putar potongan
            break;
    }
});

// Fungsi untuk memulai permainan
function startGame() {
    document.getElementById('menu').style.display = 'none'; // Sembunyikan menu
    document.getElementById('gameOverMenu').style.display = 'none'; // Sembunyikan menu Game Over
    document.getElementById('tetris').style.display = 'block'; // Tampilkan papan permainan
    resetGame(); // Reset permainan
}

// Fungsi untuk menampilkan menu Game Over
function showGameOverMenu() {
    document.getElementById('tetris').style.display = 'none'; // Sembunyikan papan permainan
    document.getElementById('gameOverMenu').style.display = 'flex'; // Tampilkan menu Game Over
}

// Fungsi untuk restart permainan
function restartGame() {
    document.getElementById('gameOverMenu').style.display = 'none'; // Sembunyikan menu Game Over
    startGame(); // Mulai permainan lagi
}

// Fungsi untuk kembali ke menu
function backToMenu() {
    document.getElementById('gameOverMenu').style.display = 'none'; // Sembunyikan menu Game Over
    document.getElementById('menu').style.display = 'flex'; // Tampilkan menu utama
}

// Event listener untuk tombol mulai
document.getElementById('startButton').addEventListener('click', startGame);

// Event listener untuk tombol restart
document.getElementById('restartButton').addEventListener('click', restartGame);

// Event listener untuk tombol kembali ke menu
document.getElementById('backToMenuButton').addEventListener('click', backToMenu);

// Menampilkan skor tertinggi di menu
document.getElementById('highScoreValue').innerText = highScore;

// Inisialisasi permainan
currentPiece = randomTetromino();