if (!process.env.CONFIG_FILE) {
    process.env.CONFIG_FILE = "config-test.json";
}
import {config} from "./config";
import {connection} from "./dbconnection";
import * as mysql_import from "mysql-import";

//const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

before(function () {
    chai.use(sinonChai);
    return connection(config).then(function(conn) {
        conn.query("DROP DATABASE IF EXISTS `?`;", [config.mysql.database]);
        conn.query("CREATE DATABASE `?`;", [config.mysql.database]);
        return conn.end();
    }).then(function() {
        const importer = mysql_import.config({
            host: config.mysql.host,
            user: config.mysql.username,
            password: config.mysql.password,
            database: config.mysql.database
        });
        return importer.import("sql/zoo_species_test.sql").then(function() { return importer; })
    }).then(function (importer) {
        importer.conn.end();
        console.log("Imported test mysql database.");
    });
});


after(function () {
    console.log("All tests complete");
})

// beforeEach(function () {
//     this.sandbox = sinon.sandbox.create();
// })
//
// afterEach(function () {
//     this.sandbox.restore();
// })