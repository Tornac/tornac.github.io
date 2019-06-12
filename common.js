/**
 * @param {number} [a] lower bound, inclusive 
 * @param {number} [b] upper bound, exclusive
 * @returns {number} random number between [a] and [b]
 */
function randint(a, b) {
    if (a >= b) throw "Illegal Arguments"
    const range = b - a;
    return Math.floor(Math.random() * range) + a;
}