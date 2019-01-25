const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const db = require("../dbconnection");
const fs = require("fs");

before(function () {
    chai.use(sinonChai);
    const setupSQL = fs.readFileSync('../sql/zoo_species.sql').toString();
    db.connection.catch(function(err) {
        return db.connectionNoDatabase;
    }).then(function (conn) {
        return conn.query(setupSQL);
    });
})

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
})

afterEach(function () {
    this.sandbox.restore();
})