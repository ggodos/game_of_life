const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const btn_start = document.getElementById("btn-start");
const btn_stop = document.getElementById("btn-stop");
const btn_reset = document.getElementById("btn-reset");
const btn_grid = document.getElementById("btn-grid");

const HEIGHT = 600;
const WIDTH = 800;

ctx.canvas.height = HEIGHT;
ctx.canvas.width = WIDTH;

let cells;
let cycleSpeed = 1000;
let cellSize = 20;
let cellsHeight = Math.floor(HEIGHT / cellSize);
let cells_width = Math.floor(WIDTH / cellSize);
let gameStarted = false;
let isDrawing = false;
let isErasing = false;
let hasGrid = false;

const applyCellSize = (n) => {
  cellSize = n;
  cellsHeight = Math.floor(HEIGHT / cellSize);
  cells_width = Math.floor(WIDTH / cellSize);
};

const applyCycleSpeed = (n) => {
  cycleSpeed = n;
};

const initGame = () => {
  cells = Array(HEIGHT + 1);
  for (let i = 0; i < HEIGHT + 2; i++) {
    cells[i] = Array(WIDTH).fill(false);
  }
  cells[1][1] = true;
  cells[2][2] = true;
  cells[2][3] = true;
  cells[3][1] = true;
  cells[3][2] = true;
};

const startGame = () => {
  if (!gameStarted) {
    gameStarted = true;
    calcLoop();
  }
};

const resetGame = () => {
  gameStarted = false;
  initGame();
};

const switchGrid = () => {
  hasGrid = !hasGrid;
};

const stopGame = () => {
  gameStarted = false;
};

const cellCreate = (y, x) => {
  return { x: x, y: y };
};

const drawCell = (cell) => {
  ctx.fillStyle = "green";
  ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
};

const drawBackground = () => {
  ctx.fillStyle = "#201A23";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const drawGrid = () => {
  for (let y = 0; y <= cellsHeight + 1; y++) {
    for (let x = 0; x <= cells_width + 1; x++) {
      let dy = y * cellSize;
      let dx = x * cellSize;

      // Draw cell border
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + cellSize, dy);
      ctx.lineTo(dx + cellSize, dy - cellSize);
      ctx.lineTo(dx, dy - cellSize);
      ctx.moveTo(dx, dy);
      ctx.closePath();

      ctx.strokeStyle = "gray";
      ctx.stroke();
    }
  }
};

const drawCells = () => {
  for (let y = 0; y < cellsHeight; y++)
    for (let x = 0; x < cells_width; x++)
      if (cells[y][x]) {
        drawCell(cellCreate(y * cellSize, x * cellSize));
      }
};

const calculateCells = () => {
  var tmpCells = cells.map(function (arr) {
    return arr.slice();
  });
  for (var y = 0; y < tmpCells.length; y++) {
    for (var x = 0; x < tmpCells[y].length; x++) {
      const newCoords = [
        { ny: y - 1, nx: x },
        { ny: y + 1, nx: x },
        { ny: y, nx: x - 1 },
        { ny: y, nx: x + 1 },
        { ny: y - 1, nx: x - 1 },
        { ny: y - 1, nx: x + 1 },
        { ny: y + 1, nx: x - 1 },
        { ny: y + 1, nx: x + 1 },
      ];
      var liveNeighbours = 0;
      for (var i = 0; i < newCoords.length; i++) {
        let ny = newCoords[i].ny;
        let nx = newCoords[i].nx;
        if (
          ny < 0 ||
          ny >= cellsHeight ||
          nx < 0 ||
          nx >= cells_width ||
          (ny == y && nx == x)
        ) {
          continue;
        }
        liveNeighbours += tmpCells[ny][nx];
      }
      if (cells[y][x] && liveNeighbours == 2) {
        // Survive
        cells[y][x] = true;
      } else if (liveNeighbours == 3) {
        // Born
        cells[y][x] = true;
      } else if (liveNeighbours < 2 || liveNeighbours > 3) {
        // Die
        cells[y][x] = false;
      }
    }
  }
};

const calcLoop = () => {
  setTimeout(() => {
    if (!gameStarted) {
      return;
    }

    calculateCells();

    calcLoop();
  }, cycleSpeed);
};

const loop = () => {
  drawBackground();
  drawCells();
  if (cellSize > 9 && hasGrid) {
    drawGrid();
  }
  window.requestAnimationFrame(loop);
};

const getCoords = (e) => {
  let rect = e.target.getBoundingClientRect();
  let x = Math.floor((e.clientX - rect.left) / cellSize);
  let y = Math.floor((e.clientY - rect.top) / cellSize);
  return { y, x };
};

const disableDrawing = (e) => {
  switch (e.button) {
    case 0: // left
      isDrawing = false;
      break;
    case 2: // right
      isErasing = false;
      break;
    default:
      break;
  }
};

initGame();
canvas.addEventListener("mousedown", (e) => {
  let c = getCoords(e);
  switch (e.button) {
    case 0: // left
      cells[c.y][c.x] = true;
      isDrawing = true;
      break;
    case 2: // right
      cells[c.y][c.x] = false;
      isErasing = true;
      break;
    default:
      break;
  }
});

canvas.addEventListener("mousemove", (e) => {
  let c = getCoords(e);
  if (isDrawing) {
    cells[c.y][c.x] = true;
  } else if (isErasing) {
    cells[c.y][c.x] = false;
  }
});

canvas.addEventListener("mouseup", disableDrawing);
canvas.addEventListener("mouseleave", disableDrawing);

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

btn_start.onclick = startGame;
btn_stop.onclick = stopGame;
btn_reset.onclick = resetGame;
btn_grid.onclick = switchGrid;

window.requestAnimationFrame(loop);
