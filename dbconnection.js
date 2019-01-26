const mysql = require('promise-mysql');
const config = require("./config.js");

module.exports = {
    "_conn": null,
    "_connCreate": function() {
        return mysql.createConnection({
            host: config['mysql']['host'],
            user: config['mysql']['username'],
            password: config['mysql']['password'],
            database: config['mysql']['database']
        });
    },
    "connection": (function() {
        if (!this._conn) {
            this._conn = this._connCreate();
        }
        return this._conn;
    }),
    "connectionNoDatabase": function() {
        return mysql.createConnection({
            host: config["mysql"]["host"],
            user: config["mysql"]["username"],
            password: config["mysql"]["password"]
        })
    }
};
