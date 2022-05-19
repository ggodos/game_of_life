const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const HEIGHT = 600;
const WIDTH = 800;
const CELL_SIZE = 10;
const CELLS_H = HEIGHT / CELL_SIZE;
const CELLS_W = WIDTH / CELL_SIZE;
const CYCLE_MS = 250;

var cells;

let gameStarted = false;
let isDrawing = false;
let isErasing = false;

ctx.canvas.height = HEIGHT;
ctx.canvas.width = WIDTH;

const initGame = () => {
  cells = Array(CELLS_H);
  for (let i = 0; i < CELLS_H; i++) {
    cells[i] = Array(CELLS_W).fill(false);
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

const printCells = () => {
  console.log(cells);
};

const stopGame = () => {
  gameStarted = false;
};

const cellCreate = (y, x) => {
  return { x: x, y: y };
};

const drawCell = (cell) => {
  ctx.fillStyle = "green";
  ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
};

const drawBackground = () => {
  ctx.fillStyle = "#201A23";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const drawCells = () => {
  for (let y = 0; y < CELLS_H; y++)
    for (let x = 0; x < CELLS_W; x++)
      if (cells[y][x]) {
        drawCell(cellCreate(y * CELL_SIZE, x * CELL_SIZE));
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
      var live_neighbours = 0;
      for (var i = 0; i < newCoords.length; i++) {
        let ny = newCoords[i].ny;
        let nx = newCoords[i].nx;
        if (
          ny < 0 ||
          ny >= CELLS_H ||
          nx < 0 ||
          nx >= CELLS_W ||
          (ny == y && nx == x)
        ) {
          continue;
        }
        live_neighbours += tmpCells[ny][nx];
      }
      if (cells[y][x] && live_neighbours == 2) {
        // Survive
        cells[y][x] = true;
      } else if (live_neighbours == 3) {
        // Born
        cells[y][x] = true;
      } else if (live_neighbours < 2 || live_neighbours > 3) {
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
  }, CYCLE_MS);
};

const loop = () => {
  drawBackground();
  drawCells();
  window.requestAnimationFrame(loop);
};

const getCoords = (e) => {
  let rect = e.target.getBoundingClientRect();
  let x = Math.floor((e.clientX - rect.left) / 10);
  let y = Math.floor((e.clientY - rect.top) / 10);
  return { y, x };
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

canvas.addEventListener("mouseup", (e) => {
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
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.requestAnimationFrame(loop);
