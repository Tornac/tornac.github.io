let elapsed = 0
let stopped = true

let interval = null
let lastMeaured = null

const laps = []
let lastLapIndex = -1

function parseLaps() {
    laps.length = 0
    lastLapIndex = -1

    let parity = 0
    const nodeList = [...document.querySelectorAll("#lap-config tbody input")]
    for (const input of nodeList) {
        let value = parseInt(input.value)
        if (!(value > 0)) break
        parity = (parity + 1) % 2
        laps.push({ duration: value, type: parity ? "RUN" : "WALK" })
    }

    laps.push({ duration: 1, type: "STOP" })
}

function enableLapInputs(enabled) {
    document.querySelectorAll("#lap-config input, #lap-config button").forEach(e => {
        e.disabled = !enabled
    })
}

function tick() {
    const now = new Date()
    if (!stopped && lastMeaured) elapsed += now - lastMeaured
    lastMeaured = now
    document.querySelector("#elapsed").innerHTML = formatTime(elapsed)
    checkLapStatus()
}

function checkLapStatus() {
    console.log(laps)
    let timeBudget = elapsed
    for (let i = 0; i < laps.length; i++) {
        timeBudget -= laps[i].duration * 1000
        if (timeBudget > 0) continue

        let remainingMs = timeBudget + laps[i].duration
        document.querySelector("#remaining").innerHTML = formatTime(-remainingMs)
        document.querySelector("#instruction").innerHTML = laps[i].type

        if (lastLapIndex >= i) break
        if (i > 0) window.navigator.vibrate(500)
        lastLapIndex = i
        break
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, "0")
    const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, "0")
    const tenths = Math.floor((ms % 1000) / 100)
    return `${minutes}:${seconds}.${tenths}`
}

function stopwatchToggle() {
    stopped = !stopped
    parseLaps()
    enableLapInputs(false)
    if (stopped) clearInterval(interval)
    else setInterval(tick, 100)
    enableLapInputs(stopped)
    document.querySelector("button#stop").disabled = !stopped
    tick()
}

function stopwatchReset() {
    elapsed = 0
    laps.length = 0
    lastLapIndex = -1
    clearInterval(interval)
}

function cloneRow(button) {
    const tr = button.parentNode.parentNode
    const tbody = tr.parentNode
    tbody.appendChild(tr.cloneNode(true))
}