const mysql = require('promise-mysql');
const config = require("./config.js");

module.exports = {
    "connection": function () {

        const mysqlConfig = {
            user: config['mysql']['username'],
            password: config['mysql']['password'],
            database: config['mysql']['database'],
            connectTimeout: 5000
        }

        if ("host" in config["mysql"]) {
            mysqlConfig["host"] = config["mysql"]["host"];
        }
        if ("socketPath" in config["mysql"]) {
            mysqlConfig["socketPath"] = config["mysql"]["socketPath"];
        }

        return mysql.createConnection(mysqlConfig);
    }
};
