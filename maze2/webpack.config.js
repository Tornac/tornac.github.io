const path = require("path");

module.exports = {
    entry: "./compiled_js/src/index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    mode: "production"
}