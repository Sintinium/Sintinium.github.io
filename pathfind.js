document.addEventListener("DOMContentLoaded", onDomReady);

let pixelsPerTile = 32;
let gridWidth = 64;
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
let grabbedStartPrevious = EMPTY;
let grabbedEndPrevious = EMPTY;

let solver = null;

document.addEventListener("pointerdown", event => {
    let target = event.target;
    if (!target.classList.contains("cell")) {
        return;
    }
    grabbed = null;
    isMouseDown = true;
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

window.addEventListener("resize", () => {
    // onDomReady();
});

document.addEventListener("pointerup", event => {
    grabbed = null;
    isMouseDown = false;
});

document.addEventListener("pointerover", event => {
    let target = event.target;
    if (!target.classList.contains("cell")) {
        return;
    }
    if (!isMouseDown) {
        return;
    }
    handleMouse(target);
});

function handleMouse(target) {
    clearPath();
    if (target.classList.contains("cell")) {
        let x = parseInt(target.id.split("-")[0]);
        let y = parseInt(target.id.split("-")[1]);
        let cell = grid[x][y];
        if (cell.cellType == START || cell.cellType == END) {
            return;
        }
        if (grabbed == null) {
            cell.setType(dragType);
            return;
        }

        let prev = cell.cellType;
        if (grabbed.cellType === START) {
            startCell.setType(grabbedStartPrevious);
            startCell = cell;
            startCell.setType(START);
            grabbed = startCell;
            grabbedStartPrevious = prev;
        }
        if (grabbed.cellType === END) {
            endCell.setType(grabbedEndPrevious);
            endCell = cell;
            endCell.setType(END);
            grabbed = endCell;
            grabbedEndPrevious = prev;
        }
    }
}

function onDomReady() {
    let container = document.getElementsByClassName("container")[0];
    const toRemove = document.getElementsByClassName("cell");
    while (toRemove.length > 0) {
        toRemove[0].parentNode.removeChild(toRemove[0]);
    }
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    gridWidth = Math.floor(containerWidth / pixelsPerTile);
    if (gridWidth % 2 === 0) {
        gridWidth--;
    }
    let tileSize = containerWidth / (gridWidth) - spacing;
    gridHeight = Math.floor(containerHeight / (tileSize + spacing)) - Math.floor(60 / tileSize);
    if (gridHeight % 2 === 0) {
        gridHeight--;
    }

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

    setAlgo();
}

function play() {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            grid[i][j].updateBackground();
        }
    }
    let iter = solver();
    let player = function () {
        let next = iter.next();
        if (next.done) {
            return;
        }

        setTimeout(player, 10);
    }
    setTimeout(player, 10);
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
            grid[x][y].div.classList.remove("open");
        }
    }
}

function createMaze() {
    // clearPath();
    // clearGrid();

    let iter = generateMaze(this, grid, gridWidth, gridHeight);
    let player = function() {
        let next = iter.next();
        if (next.done) {
            return;
        }

        setTimeout(player, 10);
    }
    setTimeout(player, 10);
}

function setAlgo() {
    let algo = document.getElementById("algo").value;
    clearPath();
    switch (algo) {
        case "dijkstra":
            solver = solveDijkstra;
            break;
        case "astar":
            solver = solveAStar;
            break;
    }
}

let solveDijkstra = function* () {
    let path = yield* dijkstra();

    clearPath();

    for (let i = 0; i < path.length; i++) {
        path[i].updateBackground()
        path[i].div.classList.add("path");
    }
}

function* dijkstra() {
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
                n[i].div.classList.add("open");
            }
        }

        for (let i = 0; i < neighbors.length; i++) {
            let cell = neighbors[i];
            visited.push(cell);
            queue.push(cell);
            yield cell.div.classList.add("visited");
            
            let altDist = dist.get(current) + 1;
            if (altDist < dist.get(cell)) {
                cell.div.classList.remove("open");
                dist.set(cell, altDist);
                prev.set(cell, current);
                if (cell.cellType === END) {
                    queue = [];
                    break;
                }
            }
        }
    }

    let shortestPath = dijkstraCameFrom(prev, endCell);

    let result = [];
    for (let i = 0; i < shortestPath.length; i++) {
        let cell = shortestPath[i];
        if (cell !== startCell && cell !== endCell) {
            result.push(cell);
        }
    }
    return result;
}

function dijkstraCameFrom(prev, end) {
    let shortestPath = [];
    while (end !== undefined) {
        shortestPath.push(end);
        end = prev.get(end);
    }
    return shortestPath;
}

let solveAStar = function* () {
    let path = yield* aStar();

    clearPath();

    for (let i = 0; i < path.length; i++) {
        path[i].updateBackground()
        path[i].div.classList.add("path");
    }
}

function* aStar() {
    let gMap = new Map();
    let fMap = new Map();
    let parents = new Map();

    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            gMap.set(grid[i][j], Infinity);
            fMap.set(grid[i][j], Infinity);
        }
    }

    gMap.set(startCell, 0);
    fMap.set(startCell, heuristic(startCell, endCell));

    let findBest = function (nodes) {
        let best = null;
        for (let i = 0; i < nodes.length; i++) {
            if (best == null) {
                best = nodes[i];
            } else if (fMap.get(nodes[i]) < fMap.get(best)) {
                best = nodes[i];
            }
        }
        return best;
    }


    let openList = [];
    let closedList = [];
    openList.push(startCell);

    let current;

    while (openList.length > 0) {
        current = findBest(openList);
        
        if (current.cellType === END) {
            return aStarReconstruct(parents, current);
        }
        
        openList.splice(openList.indexOf(current), 1);
        closedList.push(current);
        current.div.classList.remove("open");
        yield current.div.classList.add("visited");

        let neighbors = current.getNeighbors();
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];

            if (closedList.includes(neighbor)) {
                continue;
            }

            let tentativeG = gMap.get(current) + heuristic(current, neighbor);
            if (openList.includes(neighbor)) {
                if (tentativeG < gMap.get(neighbor)) {
                    gMap.set(neighbor, tentativeG);
                    parents.set(neighbor, current);
                }
            } else {
                gMap.set(neighbor, tentativeG);
                openList.push(neighbor);
                parents.set(neighbor, current);
            }
            fMap.set(neighbor, tentativeG + heuristic(neighbor, endCell));
            neighbor.div.classList.add("open");
        }
    }

    return null;
}

function aStarReconstruct(parents, current) {
    let path = [];
    path.push(current);
    while (parents.has(current)) {
        current = parents.get(current);
        path.unshift(current);
    }
    return path;
}

function heuristic(a, b) {
    // let d = Math.hypot(a.x - b.x, a.y - b.y);
    let d = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    return d;
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
        const c = this;
        let isValidDiagonal = function (dx, dy) {
            return grid[dx][c.y].cellType !== WALL && grid[c.x][dy].cellType !== WALL;
        }
        let neighbors = [];

        let minX = 0;
        let maxX = gridWidth - 1;
        let minY = 0;
        let maxY = gridHeight - 1;
        if (this.x > minX) {
            neighbors.push(grid[this.x - 1][this.y]);
        }
        if (this.x < maxX) {
            neighbors.push(grid[this.x + 1][this.y]);
        }
        if (this.y > minY) {
            neighbors.push(grid[this.x][this.y - 1]);
        }
        if (this.y < maxY) {
            neighbors.push(grid[this.x][this.y + 1]);
        }

        if (this.x > minX && this.y > minY) {
            let dx = this.x - 1;
            let dy = this.y - 1;
            if (isValidDiagonal(dx, dy)) {
                neighbors.push(grid[dx][dy]); // top left
            }
        }
        if (this.x < maxX && this.y > minY) {
            let dx = this.x + 1;
            let dy = this.y - 1;
            if (isValidDiagonal(dx, dy)) {
                neighbors.push(grid[dx][dy]); // top right
            }
        }
        if (this.x > minX && this.y < maxY) {
            let dx = this.x - 1;
            let dy = this.y + 1;
            if (isValidDiagonal(dx, dy)) {
                neighbors.push(grid[dx][dy]); // bottom left
            }
        }
        if (this.x < maxX && this.y < maxY) {
            let dx = this.x + 1;
            let dy = this.y + 1;
            if (isValidDiagonal(dx, dy)) {
                neighbors.push(grid[dx][dy]); // bottom right
            }
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