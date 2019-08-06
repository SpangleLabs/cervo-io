const fs = require("fs");

let configFile = "config.json";
if (process.env.CONFIG_FILE) {
    configFile = process.env.CONFIG_FILE;
}
interface MySqlConfig {
    host?: string
    socketPath?: string
    username: string
    password: string
    database: string
}
interface Config {
    mysql: MySqlConfig
    google_distance_api_key: string
}

export const config: Config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
