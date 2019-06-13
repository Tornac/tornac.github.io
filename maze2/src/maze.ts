import { MazeRandomizer } from "./randomizers";

interface MazeCellConnection {
    blocked: boolean
    cell: MazeCell
}

export class MazeCell {
    x: number
    y: number
    north: MazeCellConnection = { blocked: true, cell: null }
    south: MazeCellConnection = { blocked: true, cell: null }
    west: MazeCellConnection = { blocked: true, cell: null }
    east: MazeCellConnection = { blocked: true, cell: null }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    adjacentCells(reachableOnly: boolean): Array<MazeCell> {
        return [this.north, this.south, this.west, this.east]
            .filter(x => {
                if (x.cell === null) return false;
                if (reachableOnly) return !x.blocked;
                return true;
            })
            .map(x => x.cell);
    }

    connectTo(otherCell: MazeCell) {
        const dx = otherCell.x - this.x;
        const dy = otherCell.y - this.y;
        let first = this as MazeCell;
        let second = otherCell;
        if (Math.abs(dx) === 1 && dy === 0) {
            if (dx === -1) [first, second] = [second, first];
            first.east.cell = second;
            first.east.blocked = false;
            second.west.cell = first;
            second.west.blocked = false;
        } else if (Math.abs(dy) === 1 && dx === 0) {
            if (dy === - 1) [first, second] = [second, first];
            first.south.cell = second;
            first.south.blocked = false;
            second.north.cell = first;
            second.north.blocked = false;
        } else {
            throw "could not connect cells";
        }
    }
}

export class Maze {
    width: number
    height: number
    cells: Array<MazeCell>
    playerCell: MazeCell
    goalCell: MazeCell
    onPlayerMove: Function
    onPlayerVictory: Function
    onChange: Function;

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.cells = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.cells.push(new MazeCell(x, y))
            }
        }
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = this.cellAt(x, y);
                if (x > 0) cell.west.cell = this.cellAt(x - 1, y);
                if (y > 0) cell.north.cell = this.cellAt(x, y - 1);
                if (x < width - 1) cell.east.cell = this.cellAt(x + 1, y);
                if (y < height - 1) cell.south.cell = this.cellAt(x, y + 1);
            }
        }
        this.playerCell = this.cells[0];
        this.goalCell = this.cells[this.cells.length - 1];
    }

    cellAt(x: number, y: number) {
        const xValid = x >= 0 && x < this.width
        const yValid = y >= 0 && y < this.height
        if (!(xValid && yValid)) return null
        else return this.cells[x + y * this.width]
    }

    randomize(randomizer: MazeRandomizer) {
        randomizer.randomize(this);
        this.fireChanged();
    }

    solve(): Array<MazeCell> {
        const queue = [this.playerCell];
        const predecessor = new Map();
        const seen = new Set();
        while (queue.length > 0) {
            const current = queue.shift();
            seen.add(current);
            if (current === this.goalCell) break;
            current.adjacentCells(true)
                .filter(neighbour => !seen.has(neighbour))
                .forEach(neighbour => {
                    predecessor.set(neighbour, current);
                    queue.push(neighbour);
                });
        }
        let current = this.goalCell;
        const path = [];
        while (current) {
            path.push(current);
            current = predecessor.get(current);
        }
        return path.reverse();
    }

    draw(canvas: HTMLCanvasElement, showSolution: boolean) {
        const context = canvas.getContext("2d");
        const cellWidth = canvas.width / this.width;
        const cellHeight = canvas.height / this.height;

        // clear canvas
        context.beginPath();
        context.clearRect(0, 0, canvas.width, canvas.height);

        // draw maze cell grid
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "black";
        for (const cell of this.cells) {
            const edges = {
                north: cellHeight * (cell.y),
                south: cellHeight * (cell.y + 1),
                west: cellWidth * (cell.x),
                east: cellWidth * (cell.x + 1)
            }
            if (cell.north.blocked) {
                context.moveTo(edges.west, edges.north);
                context.lineTo(edges.east, edges.north);
            }
            if (cell.south.blocked) {
                context.moveTo(edges.west, edges.south);
                context.lineTo(edges.east, edges.south);
            }
            if (cell.west.blocked) {
                context.moveTo(edges.west, edges.north);
                context.lineTo(edges.west, edges.south);
            }
            if (cell.east.blocked) {
                context.moveTo(edges.east, edges.north);
                context.lineTo(edges.east, edges.south);
            }
        }
        context.stroke();

        // draw solution
        if (showSolution) {
            const solution = this.solve();
            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = "red";
            for (let i = 0; i < solution.length - 1; i++) {
                context.moveTo(
                    (solution[i].x + 0.5) * cellWidth,
                    (solution[i].y + 0.5) * cellHeight);
                context.lineTo(
                    (solution[i + 1].x + 0.5) * cellWidth,
                    (solution[i + 1].y + 0.5) * cellHeight);
            }
            context.stroke();
        }

        // draw player position
        context.beginPath();
        context.fillStyle = "green";
        context.moveTo(
            (this.playerCell.x + 0.5) * cellWidth,
            (this.playerCell.y + 0.5) * cellHeight);
        context.arc(
            (this.playerCell.x + 0.5) * cellWidth,
            (this.playerCell.y + 0.5) * cellHeight,
            Math.min(cellWidth, cellHeight) * 0.35,
            0,
            Math.PI * 2);
        context.fill();

        // draw goal
        context.fillRect(
            (this.goalCell.x + 0.15) * cellWidth,
            (this.goalCell.y + 0.15) * cellHeight,
            cellWidth * 0.7,
            cellHeight * 0.7);
    }

    movePlayer(direction) {
        let connection: MazeCellConnection
        switch (direction) {
            case "north": connection = this.playerCell.north; break;
            case "south": connection = this.playerCell.south; break;
            case "west": connection = this.playerCell.west; break;
            case "east": connection = this.playerCell.east; break;
            default: throw "illegal direction";
        }
        if (!connection.blocked) {
            this.playerCell = connection.cell;
            this.firePlayerMove();
            this.fireChanged();
            if (connection.cell === this.goalCell) {
                this.firePlayerVictory();
            }
        }
    }

    fireChanged() { if (this.onChange) this.onChange(); }
    firePlayerMove() { if (this.onPlayerMove) this.onPlayerMove(); }
    firePlayerVictory() { if (this.onPlayerVictory) this.onPlayerVictory(); }
}
