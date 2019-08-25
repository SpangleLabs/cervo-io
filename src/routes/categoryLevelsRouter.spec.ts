import * as chai from 'chai';
import {expect} from 'chai';
import chaiHttp = require('chai-http');
import {requestRouter, MockCategoryLevelsProvider, MockAuthChecker} from "../testMocks";
import {Number, String, Record} from "runtypes";
import {CategoryLevelsRouter} from "./categoryLevelsRouter";

chai.use(chaiHttp);

const CategoryLevel = Record({
    category_level_id: Number,
    name: String
});

describe("Category levels router", function() {
    describe("All category levels listing", function () {
        it("Format is correct", function (done) {
            const mockCategoryLevelsProvider = new MockCategoryLevelsProvider([
                {
                    category_level_id: 1, name: "Level 1"
                },
                {
                    category_level_id: 2, name: "Level 2"
                }]);
            const authChecker = new MockAuthChecker();
            const categoryLevelRouter = new CategoryLevelsRouter(authChecker, mockCategoryLevelsProvider);

            requestRouter(categoryLevelRouter).get("/category_levels/").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(2);
                for (let level of res.body) {
                    CategoryLevel.check(level);
                }
                done();
            })
        });
    });

    describe("View specific category level", function () {
        it("Shows just one category", function (done) {
            const mockCategoryLevelsProvider = new MockCategoryLevelsProvider([
                {
                    category_level_id: 1, name: "Level 1"
                },
                {
                    category_level_id: 2, name: "Level 2"
                }]);
            const authChecker = new MockAuthChecker();
            const categoryLevelRouter = new CategoryLevelsRouter(authChecker, mockCategoryLevelsProvider);

            requestRouter(categoryLevelRouter).get("/category_levels/2").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(1);
                const level = res.body[0];
                CategoryLevel.check(level);
                expect(level.category_level_id).to.be.equal(2);
                expect(level.name).to.be.equal("Level 2");
                done();
            })
        })
    });
});