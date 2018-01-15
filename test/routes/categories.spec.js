var RequestPromise = require("request-promise");
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);


describe("Base category listing", function() {
    it("Should return a list", function * () {
        return expect(RequestPromise({"url":"http://localhost:3000/categories/", "json":true})).to.eventually.be.a("Array");
    })
})