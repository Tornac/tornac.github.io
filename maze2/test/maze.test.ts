import assert from "assert";
import { MazeCell } from "../src/maze";

describe("maze cell", () => {
    describe("constructor", () => {
        it("should only accept non-negative integers", () => {
            assert.throws(() => new MazeCell(-1, -1), Error, "illegal coordinates");
            assert.throws(() => new MazeCell(1.5, 0), Error, "illegal coordinates");
            assert.throws(() => new MazeCell(0, 1.5), Error, "illegal coordinates");
        });
    });
    describe("#connectTo", () => {
        it("should connect to adjacent cells (north, south)", () => {
            const c1 = new MazeCell(0, 0);
            const c2 = new MazeCell(0, 1);
            c1.connectTo(c2);
            assert(c1.south.blocked === false);
            assert(c2.north.blocked === false);
            for (const direction of ["north", "west", "east"]) assert(c1[direction].blocked === true);
            for (const direction of ["south", "west", "east"]) assert(c2[direction].blocked === true);
        });

        it("should connect to adjacent cells (west, east)", () => {
            const c1 = new MazeCell(0, 0);
            const c2 = new MazeCell(1, 0);
            c1.connectTo(c2);
            assert(c1.east.blocked === false);
            assert(c2.west.blocked === false);
            for (const direction of ["north", "south", "west"]) assert(c1[direction].blocked === true);
            for (const direction of ["north", "south", "east"]) assert(c2[direction].blocked === true);
        });

        it("should not connect to non-adjacent cells", () => {
            const c1 = new MazeCell(0, 0);
            const c2 = new MazeCell(1, 1);
            assert.throws(() => c1.connectTo(c2), Error, "cannot connect non-adjacent cells")
        });
    });
});