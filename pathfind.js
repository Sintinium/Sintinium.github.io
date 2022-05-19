document.addEventListener("DOMContentLoaded", onDomReady);

let gridWidth = 32;
let gridHeight;
let tileSize = 32;
let spacing = 4;

let EMPTY = 0;
let WALL = 1;
let START = 2;
let END = 3;

let grid;

let startCell;
let endCell;

let isMouseDown = false;
let dragType = EMPTY;

let grabbed = null;

document.addEventListener("mousedown", event => {
    grabbed = null;
    isMouseDown = true;
    let target = event.target;
    let x = parseInt(target.id.split("-")[0]);
    let y = parseInt(target.id.split("-")[1]);
    let cell = grid[x][y];

    if (cell.cellType === START || cell.cellType === END) {
        grabbed = cell;
    } else if (cell.cellType === EMPTY) {
        dragType = WALL;
    } else if (cell.cellType === WALL) {
        dragType = EMPTY;
    }

    handleMouse(target);
});

document.addEventListener("mouseup", () => {
    grabbed = null;
    isMouseDown = false;
});

document.addEventListener("mouseover", event => {
    if (!isMouseDown) {
        return;
    }
    let target = event.target;
    handleMouse(target);
});

function handleMouse(target) {
    clearPath();
    if (target.classList.contains("cell")) {
        let x = parseInt(target.id.split("-")[0]);
        let y = parseInt(target.id.split("-")[1]);
        let cell = grid[x][y];
        if (grabbed == null) {
            cell.setType(dragType);
            return;
        }

        if (grabbed.cellType === START) {
            startCell.setType(EMPTY);
            startCell = cell;
            startCell.setType(START);
            grabbed = startCell;
        }
        if (grabbed.cellType === END) {
            endCell.setType(EMPTY);
            endCell = cell;
            endCell.setType(END);
            grabbed = endCell;
        }
    }
}

function onDomReady() {
    let container = document.getElementsByClassName("container")[0];
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    let tileSize = containerWidth / (gridWidth) - spacing;
    gridHeight = Math.floor(containerHeight / tileSize) - 1 - Math.floor(containerHeight / (containerHeight - 60));

    grid = Array.from(Array(gridWidth), () => new Array(gridHeight));

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            let div = document.createElement("div");
            div.id = `${x}-${y}`;
            div.classList.add("cell");
            div.style.border = "2px solid black";
            div.style.borderRadius = "4px";
            div.style.left = `${x * (tileSize + spacing) + (spacing / 2)}px`;
            div.style.top = `${y * (tileSize + spacing) + (spacing / 2) + 60}px`;
            div.style.width = tileSize + "px";
            div.style.height = tileSize + "px";
            // div.style.padding = `${spacing}px ${spacing}px`;
            // div.style.margin = `${spacing}px ${spacing}px`;
            container.appendChild(div);
            grid[x][y] = new Cell(x, y, div);
        }
    }

    startCell = grid[Math.floor(gridWidth * .25)][Math.floor(gridHeight * .50 - 1)];
    endCell = grid[Math.floor(gridWidth * .75)][Math.floor(gridHeight * .50 - 1)];
    startCell.setType(START);
    endCell.setType(END);
}

function play() {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            grid[i][j].updateBackground();
        }
    }
    let solver = solveAStar();
    let player = function () {
        let next = solver.next();
        if (next.done) {
            return;
        }

        setTimeout(player, 1);
    }
    setTimeout(player, 1);
}

function clearGrid() {
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            let cell = grid[x][y];
            if (cell.cellType !== START && cell.cellType !== END) {
                grid[x][y].setType(EMPTY);
            }
        }
    }
}

function clearPath() {
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            grid[x][y].div.classList.remove("path");
            grid[x][y].div.classList.remove("visited");
        }
    }
}

function setAlgo() {

}

let solveAStar = function* () {
    let path = yield* findPath(startCell, endCell);

    clearPath();

    for (let i = 0; i < path.length; i++) {
        console.log(path[i]);
        path[i].updateBackground()
        path[i].div.classList.add("path");
    }
}

function* findPath() {
    let queue = [];
    let prev = new Map();
    let dist = new Map();
    let visited = [];

    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            dist.set(grid[i][j], Infinity);
        }
    }

    dist.set(startCell, 0);
    queue.push(startCell);

    while (queue.length > 0) {
        let current = queue.shift();
        let n = current.getNeighbors();
        let neighbors = [];
        for (let i = 0; i < n.length; i++) {
            if (!visited.includes(n[i])) {
                neighbors.push(n[i]);
            }
        }

        for (let i = 0; i < neighbors.length; i++) {
            let cell = neighbors[i];
            visited.push(cell);
            queue.push(cell);
            yield cell.div.classList.add("visited");

            let altDist = dist.get(current) + 1;
            if (altDist < dist.get(cell)) {
                dist.set(cell, altDist);
                prev.set(cell, current);
                if (cell.cellType === END) {
                    queue = [];
                    break;
                }
            }
        }
    }

    let shortestPath = cameFrom(prev, endCell);

    let result = [];
    for (let i = 0; i < shortestPath.length; i++) {
        let cell = shortestPath[i];
        if (cell !== startCell && cell !== endCell) {
            result.push(cell);
        }
    }
    return result;
}

function cameFrom(prev, end) {
    console.log(prev)
    let shortestPath = [];
    while (end !== undefined) {
        shortestPath.push(end);
        end = prev.get(end);
    }
    return shortestPath;
}

class Cell {
    constructor(x, y, div) {
        this.x = x;
        this.y = y;
        this.cellType = EMPTY;
        this.div = div;
        // 2d to 1d
        // this.id = x + y * gridWidth;
    }

    setType(type) {
        this.cellType = type;
        this.updateBackground();
    }

    updateBackground() {
        this.div.className = "";
        this.div.classList.add("cell");
        switch (this.cellType) {
            case EMPTY:
                break;
            case WALL:
                this.div.classList.add("wall");
                break;
            case START:
                this.div.classList.add("start");
                break;
            case END:
                this.div.classList.add("end");
                break;
        }
    }

    getNeighbors() {
        let neighbors = [];
        if (this.x > 0) {
            neighbors.push(grid[this.x - 1][this.y]);
        }
        if (this.x < gridWidth - 1) {
            neighbors.push(grid[this.x + 1][this.y]);
        }
        if (this.y > 0) {
            neighbors.push(grid[this.x][this.y - 1]);
        }
        if (this.y < gridHeight - 1) {
            neighbors.push(grid[this.x][this.y + 1]);
        }

        let result = [];
        for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i].cellType !== WALL) {
                result.push(neighbors[i]);
            }
        }
        return result;
    }

    isWalkable() {
        return this.cellType === EMPTY;
    }
}