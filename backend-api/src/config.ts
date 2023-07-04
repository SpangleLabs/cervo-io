let configFile = "config.json";
if (process.env.CONFIG_FILE) {
    configFile = process.env.CONFIG_FILE;
}

export interface Config {
    google_distance_api_key: string
}

export const config: Config = require("../"+configFile);
