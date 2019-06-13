import { Maze, MazeCell } from "./maze";

export interface MazeRandomizer {
    name: string
    randomize: (maze: Maze) => void
}

const dfs1: MazeRandomizer = {
    name: "dfs1",
    randomize: maze => {
        const worklist = [maze.cells[0]];
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
}

const dfs2: MazeRandomizer = {
    name: "dfs2",
    randomize: maze => {
        const worklist = [takeRandom(maze.cells, false)];
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
}

export const mazeRandomizers: Array<MazeRandomizer> = [
    dfs1, dfs2
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