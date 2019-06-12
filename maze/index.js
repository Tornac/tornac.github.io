"use strict";

const stopwatch = new Stopwatch();

window.onload = function () {
    displayTime();
    const newMazeForm = document.getElementById("form-new-maze");
    newMazeForm.onsubmit = newMaze;
    newMaze();
};

function newMaze(formEvent = null) {
    if (formEvent !== null) {
        formEvent.preventDefault();
    }

    stopwatch.reset();

    const canvas = document.getElementById("canvas-maze");
    canvas.focus();

    let size = document.getElementById("form-new-maze-size").value;
    let color = document.getElementById("input-color").value;

    const maze = new Maze(size, size);
    maze.onChange = () => maze.draw(canvas, color);
    maze.onPlayerMove = () => stopwatch.start();
    maze.onPlayerVictory = () => {
        stopwatch.stop();
        // without a timeout the canvas will not update
        // before displaying the victory message
        setTimeout(() => alert("You won!"), 250);
    };
    canvas.onkeydown = (keyEvent) => {
        keyEvent.preventDefault();
        maze.movePlayer(keyEvent.key);
    };
    document.getElementById("btn-reset").onclick = () => {
        maze.resetPlayer();
        stopwatch.reset();
        canvas.focus();
    };
    document.getElementById("check-solve").onclick = (event) => {
        maze.showSolution = event.srcElement.checked;
        maze.fireChange();
        setTimeout(() => canvas.focus(), 100);
    };
    maze.randomize();
}

function displayTime() {
    const span = document.getElementById("stopwatch-display");
    const inner = function () {
        const seconds = Math.floor(stopwatch.secondsElapsed());
        span.innerText = `${seconds}s`;
        setTimeout(inner, 100);
    };
    inner();
}