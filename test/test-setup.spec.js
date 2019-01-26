const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const db = require("../dbconnection.js");
const config = require("../config.js");

before(function () {
    chai.use(sinonChai);
    return db.connectionNoDatabase().then(function(conn) {
        return conn.query("DROP DATABASE IF EXISTS `zoo_species_test`;");
    }).then(function() {
        return db.connectionNoDatabase();
    }).then(function(conn) {
        return conn.query("CREATE DATABASE `zoo_species_test`;");
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
})

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
})

afterEach(function () {
    this.sandbox.restore();
})