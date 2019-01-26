const mysql = require('promise-mysql');
const config = require("./config.js");

module.exports = {
    "connection": function () {
        return mysql.createConnection({
            host: config['mysql']['host'],
            user: config['mysql']['username'],
            password: config['mysql']['password'],
            database: config['mysql']['database']
        });
    }
};
