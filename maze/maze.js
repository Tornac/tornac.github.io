"use strict";

class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = new MazeCell(x, y);
                this.cells.push(cell);
            }
        }
        this.gameOver = false;
        this.cells[width * height - 1].hasGoal = true;
        this.cells[0].hasPlayer = true;
        this.onChange = null;
        this.onPlayerVictory = null;
        this.onPlayerMove = null;
    }

    draw(canvas, playerColor) {
        console.time("draw canvas");
        const ctx = canvas.getContext("2d");
        const cellWidth = canvas.width / this.width;
        const cellHeight = canvas.height / this.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const cell of this.cells) {
            const north = cell.y * cellHeight;
            const south = (cell.y + 1) * cellHeight;
            const west = cell.x * cellWidth;
            const east = (cell.x + 1) * cellWidth;
            ctx.beginPath();
            if (cell.north === null) {
                ctx.moveTo(west, north);
                ctx.lineTo(east, north);
            }
            if (cell.south === null) {
                ctx.moveTo(west, south);
                ctx.lineTo(east, south);
            }
            if (cell.west === null) {
                ctx.moveTo(west, north);
                ctx.lineTo(west, south);
            }
            if (cell.east === null) {
                ctx.moveTo(east, north);
                ctx.lineTo(east, south);
            }
            ctx.stroke();
            if (cell.hasPlayer) {
                const centerX = (west + east) / 2;
                const centerY = (north + south) / 2;
                const radius = Math.min(cellWidth, cellHeight) / 3;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = playerColor;
                ctx.fill();
            }
            if (cell.hasGoal) {
                const offsetX = cellWidth * 0.2;
                const offsetY = cellWidth * 0.2;
                ctx.fillstyle = "#00AA00";
                ctx.fillRect(west + offsetX, north + offsetY, cellWidth * 0.6, cellWidth * 0.6);
            }
        }
        console.timeEnd("draw canvas");
    }



    movePlayer(direction) {
        if (this.gameOver) return;
        
        const origin = this.cells.find(x => x.hasPlayer);
        let destination = null;
        switch (direction) {
            case "w":
            case "ArrowUp": destination = origin.north; break;
            case "s":
            case "ArrowDown": destination = origin.south; break;
            case "e":
            case "ArrowLeft": destination = origin.west; break;
            case "d":
            case "ArrowRight": destination = origin.east; break;
        }
        if (destination !== null) {
            origin.hasPlayer = false;
            destination.hasPlayer = true;
            this.fireChange();
            this.firePlayerMove();
            if (destination.hasGoal) {
                this.gameOver = true;
                this.firePlayerVictory();
            }
        }
    }

    cellAt(x, y) {
        const xValid = x >= 0 && x < this.width;
        const yValid = y >= 0 && y < this.height;
        if (xValid && yValid) {
            return this.cells[y * this.width + x];
        }
        return null;
    }

    cellsAround(x, y) {
        return [
            this.cellAt(x - 1, y),
            this.cellAt(x + 1, y),
            this.cellAt(x, y - 1),
            this.cellAt(x, y + 1)
        ]
            .filter(x => x !== null);
    }

    randomize() {
        const seen = new Set();
        const stack = [this.cells[0]];
        while (stack.length > 0) {
            shuffle(stack);
            const top = stack.pop();
            seen.add(top);
            this.cellsAround(top.x, top.y)
                .filter(x => x !== null && !seen.has(x))
                .forEach(neighbour => {
                    seen.add(neighbour);
                    stack.push(neighbour);
                    top.connect(neighbour);
                });
        }
        this.fireChange();
    }

    resetPlayer() {
        this.cells.forEach(x => x.hasPlayer = false);
        this.cells[0].hasPlayer = true;
        this.fireChange();
    }

    fireChange() { if (this.onChange) this.onChange(); }
    firePlayerVictory() { if (this.onPlayerVictory) this.onPlayerVictory(); }
    firePlayerMove() { if (this.onPlayerMove) this.onPlayerMove(); }
}

class MazeCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.north = null;
        this.south = null;
        this.west = null;
        this.east = null;
        this.hasPlayer = false;
        this.hasGoal = false;
    }

    connect(cell) {
        let first = this;
        let second = cell;
        const dx = cell.x - this.x;
        const dy = cell.y - this.y;
        if (dx === -1 || dy === -1) {
            [first, second] = [second, first];
        }
        if (Math.abs(dx) === 1 && dy === 0) {
            first.east = second;
            second.west = first;
        } else if (Math.abs(dy) === 1 && dx == 0) {
            first.south = second;
            second.north = first;
        } else {
            throw `could not connect cells ${this} and ${cell}`
        }
    }

    toString() {
        return `MazeCell(${this.x}, ${this.y})`;
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}