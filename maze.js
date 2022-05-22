let passages = [];

function* generateMaze(pathfind, grid, width, height) {
    yield* buildWalls(pathfind, grid, width, height);

    let minX = 1;
    let minY = 1;
    let maxX = width - 1;
    let maxY = height - 1;
    yield* recusiveDivision(pathfind, grid, minX, minY, maxX, maxY);


    // yield* fixDoors(pathfind, grid);
}

function* fixDoors(pathfind, grid) {
    for (let i = 0; i < passages.length; i++) {
        let [x, y] = passages[i];
        if (grid[x][y].cellType == EMPTY || grid[x][y].cellType == START || grid[x][y].cellType == END) continue;

        grid[x][y].div.classList.add("visited")
        for (let i = 0; i < 2; i++) {
            yield;
        }
        grid[x][y].div.classList.remove("visited")
        grid[x][y].setType(EMPTY);
        yield;
    }
}

function* recusiveDivision(pathfind, grid, minX, minY, maxX, maxY) {
    if (maxX - minX < 3 || maxY - minY < 3) {
        return;
    }

    // for (let x = minX; x < maxX; x++) {
    //     for (let y = minY; y < maxY; y++) {
    //         grid[x][y].div.classList.add("visited")
    //     }
    // }
    // for (let i = 0; i < 50; i++) {
    //     yield;
    // }

    // for (let x = minX; x < maxX; x++) {
    //     for (let y = minY; y < maxY; y++) {
    //         grid[x][y].div.classList.remove("visited")
    //     }
    // }
    // yield;


    if (maxX - minX < maxY - minY) {
        yield* buildHorizonal(pathfind, grid, minX, minY, maxX, maxY);
    } else {
        yield* buildVertical(pathfind, grid, minX, minY, maxX, maxY);
    }
}

function* buildVertical(pathfind, grid, minX, minY, maxX, maxY) {
    let splitX = weightedRandomEven(minX, maxX - 1);
    let splitY = weightedRandomOdd(minY, maxY - 1);
    for (let i = minY; i < maxY; i++) {
        if (i == splitY) {
            continue;
        }
        if (grid[splitX][i].cellType == START || grid[splitX][i].cellType == END) continue;
        if (grid[splitX][i].cellType == WALL) {
            console.log("vert error")
        }
        grid[splitX][i].setType(WALL);
        yield;
    }

    // console.log(minX, splitX - 1, minY, maxY);
    // console.log(splitX + 1, maxX, minY, maxY);
    /*
    [  |  ]
    [     ]
    [  |  ]
    */
   
    yield* recusiveDivision(pathfind, grid, minX, minY, splitX, maxY);
    yield* recusiveDivision(pathfind, grid, splitX + 1, minY, maxX, maxY);
}

function* buildHorizonal(pathfind, grid, minX, minY, maxX, maxY) {
    let splitX = weightedRandomOdd(minX, maxX - 1);
    let splitY = weightedRandomEven(minY, maxY - 1);
    for (let i = minX; i < maxX; i++) {
        if (i == splitX) {
            continue;
        }
        if (grid[i][splitY].cellType == START || grid[i][splitY].cellType == END) continue;
        if (grid[i][splitY].cellType == WALL) {
            console.log("horiz error")
        }
        grid[i][splitY].setType(WALL);
        yield;
    }

    /*
    [     ]
    [-- --]
    [     ]
    */
    yield* recusiveDivision(pathfind, grid, minX, minY, maxX, splitY);
    yield* recusiveDivision(pathfind, grid, minX, splitY + 1, maxX, maxY);
}

function weightedRandomOdd(min, max) {
    if (max - min > 3) {
        min++;
        max--;
    }
    let rand = Math.floor(middleRandom() * (max - min) + min);

    if (rand % 2 == 0) {
        if (rand === max) {
            rand--;
        } else {
            rand++;
        }
    }
    return rand;
}

function weightedRandomEven(min, max) {
    if (max - min > 3) {
        min++;
        max--;
    }
    let rand = Math.floor(middleRandom() * (max - min) + min);

    if (rand % 2 == 1) {
        if (rand === max) {
            rand--;
        } else {
            rand++;
        }
    }
    return rand;
}

function middleRandom() {
    let min = .25;
    let max = .75;
    return Math.random() * (max - min) + min;
}

function* buildWalls(pathfind, grid, width, height) {
    for (let i = Math.floor(width / 2); i > 0; i--) {
        setWall(grid, i, 0);
        setWall(grid, width - i - 1, 0);
        yield;
    }

    for (let i = 0; i < height; i++) {
        setWall(grid, 0, i);
        setWall(grid, width - 1, i);
        yield;
    }

    for (let i = 0; i < width / 2; i++) {
        setWall(grid, i, height - 1);
        setWall(grid, width - i - 1, height - 1);
        yield;
    }
}

function setWall(grid, x, y) {
    let cell = grid[x][y];
    // Ensure we don't set a start or end cell
    if (cell.cellType !== EMPTY) return;

    cell.setType(WALL);
}