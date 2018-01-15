const RequestPromise = require("request-promise");
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const chaiHttp = require('chai-http');
chai.use(chaiHttp);


const server = require("../../app");

describe("Base category listing", function() {
    it("Should return a list", function * () {
        return expect(RequestPromise({"url":"http://localhost:3000/categories/", "json":true})).to.eventually.be.a("Array");
    })
    it("chai request works", function * () {
        chai.request(server).get("/categories/").end(function(err, res) {
            res.status.should.equal(200);
            res.type.should.equal("application/json");
        })
    })
})