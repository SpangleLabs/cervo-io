const fs = require("fs");

let configFile = "config.json";
if (process.env.CONFIG_FILE) {
    configFile = process.env.CONFIG_FILE;
}

const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

module.exports = config;
