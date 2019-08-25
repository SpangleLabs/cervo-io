import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {MockAuthChecker, requestRouter} from "../testMocks";
import {IndexRouter} from "./indexRouter";
import {expect} from "chai";

chai.use(chaiHttp);

describe("Index router", function() {
    describe("Index endpoint", function () {
        it('should return an empty object', function (done) {
            const authChecker = new MockAuthChecker();
            const indexRouter = new IndexRouter(authChecker);
            requestRouter(indexRouter).get("/").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("object");
                expect(Object.keys(res.body).length).to.be.equal(0);
                done();
            })
        });
    });
});