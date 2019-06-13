const path = require("path");

module.exports = {
    entry: "./compiled_js/index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    mode: "production"
}