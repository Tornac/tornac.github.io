"use strict";

class Stopwatch {
    constructor() {
        this.timeStarted = null;
        this.timeStopped = null;
    }

    start() {
        if (this.timeStarted === null) {
            this.timeStarted = new Date();
        }
    }

    stop() {
        if (this.timeStopped === null) {
            this.timeStopped = new Date();
        }
    }

    reset() {
        this.timeStarted = null;
        this.timeStopped = null;
    }

    secondsElapsed() {
        if (this.timeStarted === null) {
            return 0;
        }
        let end = this.timeStopped || new Date();
        return (end - this.timeStarted) / 1000;
    }
}