import $ from "jquery";

import { MazeCell, Maze } from "./maze";
import { Stopwatch } from "./stopwatch";
import { mazeRandomizers } from "./randomizers";
import { makeChart } from "./stats";

const stopwatch = new Stopwatch();

$(function () {
    displayTime(stopwatch);
    newMaze();
    $("#input-size").change(newMaze);
    $("#select-randomizer").change(() => {
        newMaze();
        $("#chart-container").html("");
    });
    $("#btn-show-stats").click(showDifficultyStats);
});

function newMaze() {
    const size = $("#input-size").val() as number;
    const maze = new Maze(size, size);
    
    maze.onPlayerMove = () => stopwatch.start();
    maze.onPlayerVictory = () => {
        stopwatch.stop();
        setTimeout(() => {
            alert("victory");
            newMaze();
        }, 250);
    };
    maze.onChange = () => redrawMaze(maze);
    maze.randomize(findRandomizer());

    window.onkeydown = event => {
        let direction: string = null;
        switch (event.key) {
            case "ArrowUp": direction = "north"; break;
            case "ArrowDown": direction = "south"; break;
            case "ArrowLeft": direction = "west"; break;
            case "ArrowRight": direction = "east"; break;
        }
        console.log("test!");
        if (direction !== null) {
            event.preventDefault();
            maze.movePlayer(direction);
        }
    };

    $("#input-show-solution").change(() => redrawMaze(maze));
}

function redrawMaze(maze: Maze) {
    const canvas = $("canvas")[0] as HTMLCanvasElement;
    const showSolution = $("#input-show-solution").prop("checked");
    maze.draw(canvas, showSolution);
}

function displayTime(stopwatch: Stopwatch) {
    const span = $("#stopwatch");
    const inner = () => {
        const seconds = Math.floor(stopwatch.secondsElapsed());
        span.text(`${seconds}s`);
    };
    setInterval(inner, 100);
}

function showDifficultyStats() {
    makeChart(findRandomizer(), document.querySelector("#chart-container"));
}

function findRandomizer() {
    return mazeRandomizers.find(x => x.name === $("#select-randomizer").val())
}