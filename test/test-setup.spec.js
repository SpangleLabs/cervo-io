if (!process.env.CONFIG_FILE) {
    process.env.CONFIG_FILE = "config-test.json";
}

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const db = require("../dbconnection.js");
const config = require("../config.js");
const mysql = require("promise-mysql");

before(function () {
    chai.use(sinonChai);
    return mysql.createConnection({
        host: config["mysql"]["host"],
        user: config["mysql"]["username"],
        password: config["mysql"]["password"]
    }).then(function(conn) {
        conn.query("DROP DATABASE IF EXISTS `zoo_species_test`;");
        conn.query("CREATE DATABASE `zoo_species_test`;");
        return conn.end();
    }).then(function() {
        return require("mysql-import").config({
            host: config["mysql"]["host"],
            user: config["mysql"]["username"],
            password: config["mysql"]["password"],
            database: "zoo_species_test"
        }).import("sql/zoo_species_test.sql");
    }).then(function () {
        console.log("Imported test mysql database.");
    });
});

after(function() {
    db.connection().then(function(conn) {
        conn.end();
    });
});

// beforeEach(function () {
//     this.sandbox = sinon.sandbox.create();
// })
//
// afterEach(function () {
//     this.sandbox.restore();
// })