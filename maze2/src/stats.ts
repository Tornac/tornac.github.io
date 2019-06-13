import ApexCharts, { ApexOptions } from "apexcharts";

import { Maze } from "./maze";
import { mazeRandomizers, MazeRandomizer } from "./randomizers";

function mean(array: Array<number>): number {
    if (array.length === 0) throw "illegal argument";
    let sum = 0;
    for (const n of array) sum += n;
    return sum / array.length;
}

function median(array: Array<number>): number {
    if (array.length === 0) throw "illegal argument";
    const sorted = [...array].sort();
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middle] + sorted[middle - 1]) / 2;
    } else {
        return sorted[middle];
    }
}

export function makeChart(randomizer: MazeRandomizer, targetElement: HTMLElement) {
    console.log(`calculating stats for randomizer ${randomizer.name}`)
    const xAxis = [];
    const yAxis = [];
    for (let size = 3; size <= 40; size++) {
        const lengths: Array<number> = [];
        for (let i = 0; i < 100; i++) {
            const maze = new Maze(size, size);
            maze.randomize(randomizer);
            const solution = maze.solve();
            lengths.push(solution.length);
        }
        xAxis.push(size);
        yAxis.push(median(lengths));
    }
    const chartOptions: ApexOptions = {
        chart: {
            type: "line"
        },
        series: [
            {
                name: "median",
                data: yAxis
            }
        ],
        xaxis: {
            categories: xAxis
        }
    }
    targetElement.innerHTML = "";
    const chart = new ApexCharts(targetElement, chartOptions);
    chart.render();
}

