let elapsed = 0
let stopped = true

let interval = null
let lastMeaured = null

const laps = []
let lastLapIndex = -1

function parseLaps() {
    laps.length = 0
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
    document.querySelectorAll("#lap-config input, #lap-config button").forEach((e) => {
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
    let timeBudget = elapsed

    document.querySelectorAll(".checkmark-container").forEach((c) => (c.innerHTML = ""))
    for (let i = 0; i < laps.length; i++) {
        timeBudget -= laps[i].duration * 1000
        if (timeBudget > 0) {
            const container = document.querySelector(
                `#lap-config tbody tr:nth-child(${Math.floor(i / 2) + 1}) .checkmark-container`
            )
            if (container) container.innerHTML = `<i class="fa fa-check"></i>`
            continue
        }

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
    const minutes = Math.max(0, Math.floor(ms / 60000))
        .toString()
        .padStart(2, "0")
    const seconds = Math.max(0, Math.floor((ms / 1000) % 60))
        .toString()
        .padStart(2, "0")
    const tenths = Math.max(0, Math.floor((ms % 1000) / 100))
    return `${minutes}:${seconds}.${tenths}`
}

function stopwatchToggle() {
    stopped = !stopped
    if (!stopped) parseLaps()
    enableLapInputs(false)
    if (stopped) clearInterval(interval)
    else setInterval(tick, 100)
    document.querySelector("button#stop").disabled = !stopped
    tick()
}

function stopwatchReset() {
    elapsed = 0
    laps.length = 0
    lastLapIndex = -1
    clearInterval(interval)
    enableLapInputs(true)
}

function cloneRow(tr) {
    const tbody = tr.parentNode
    tbody.appendChild(tr.cloneNode(true))
}

function deleteRow(tr) {
    const tbody = tr.parentNode
    if (tbody.childElementCount > 1) tr.parentNode.removeChild(tr)
}
