import { Maze, MazeCell } from "./maze";

export interface MazeRandomizer {
    name: string
    randomize: (maze: Maze) => void
}

const dfs1: MazeRandomizer = {
    name: "dfs1",
    randomize: maze => randomDfs(maze.cells[0])
}

const dfs2: MazeRandomizer = {
    name: "dfs2",
    randomize: maze => randomDfs(takeRandom(maze.cells, false))
}

const submazes: MazeRandomizer = {
    name: "submazes",
    randomize: maze => {
        const subwidth = Math.sqrt(maze.width);
        const subheight = Math.sqrt(maze.height);
        if (!Number.isInteger(subwidth) || !Number.isInteger(subheight))
            throw `MazeRandomizer ${submazes.name} can only be used on square widths/heights`;
        const metamaze = new Maze(subwidth, subheight);
        metamaze.randomize(dfs1);
        for (const metacell of metamaze.cells) {
            const submaze = new Maze(subwidth, subheight);
            submaze.randomize(dfs1);

            for (const subcell of submaze.cells) {
                const mappedCell = maze.cellAt(
                    metacell.x * subwidth + subcell.x,
                    metacell.y * subheight + subcell.y);
                mappedCell.north.blocked = subcell.north.blocked;
                mappedCell.south.blocked = subcell.south.blocked;
                mappedCell.west.blocked = subcell.west.blocked;
                mappedCell.east.blocked = subcell.east.blocked;
            }
        }
        for (let i = 0; i < subwidth - 1; i++) {
            for (let j = 0; j < subheight; j++) {
                const submazeWest = metamaze.cellAt(i, j);
                const submazeEast = metamaze.cellAt(i + 1, j);
                const connectionOffset = randint(0, subheight);
                if (!submazeWest.east.blocked) {
                    const west = maze.cellAt(submazeWest.x * subwidth + subwidth - 1,
                        submazeWest.y * subheight + connectionOffset);
                    const east = maze.cellAt(submazeEast.x * subwidth,
                        submazeEast.y * subheight + connectionOffset);
                    west.connectTo(east);
                }
            }
        }
        for (let i = 0; i < subwidth; i++) {
            for (let j = 0; j < subheight - 1; j++) {
                const submazeNorth = metamaze.cellAt(i, j);
                const submazeSouth = metamaze.cellAt(i, j + 1);
                const connectionOffset = randint(0, subwidth);
                if (!submazeNorth.south.blocked) {
                    const north = maze.cellAt(submazeNorth.x * subwidth + connectionOffset,
                        submazeNorth.y * subheight + subheight - 1);
                    const south = maze.cellAt(submazeSouth.x * subwidth + connectionOffset,
                        submazeSouth.y * subheight);
                    north.connectTo(south);
                }
            }
        }
    }
}

export const mazeRandomizers: Array<MazeRandomizer> = [
    dfs1, dfs2, submazes
]

function randint(a: number, b: number): number {
    if (a >= b) throw "illegal arguments";
    const range = b - a;
    return Math.floor(Math.random() * range + a);
}

function takeRandom<E>(array: Array<E>, remove: boolean): E {
    const index = randint(0, array.length);
    if (remove) return array.splice(index, 1)[0];
    else return array[index];
}

function randomDfs(startAt: MazeCell) {
    const worklist = [startAt];
    const seen = new Set<MazeCell>();
    while (worklist.length > 0) {
        const current = takeRandom(worklist, true);
        seen.add(current);
        current.adjacentCells(false)
            .filter(neighbour => !seen.has(neighbour))
            .forEach(neighbour => {
                seen.add(neighbour);
                worklist.push(neighbour);
                current.connectTo(neighbour);
            });
    }
}