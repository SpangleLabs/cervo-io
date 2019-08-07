import { App } from "../index";
import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
require("../test-setup");

chai.use(chaiHttp);

const request = chai.request(App);

describe("Base category listing", function() {
    it("Format is correct", function (done) {
        request.get("/categories/").end(function(err, res) {
            expect(err).to.be.null;
            expect(res.status).to.be.equal(200);
            expect(res.type).to.be.equal("application/json");
            expect(res).to.be.json;
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.at.least(1);
            for (let category of res.body) {
                expect(category.category_id).to.be.a("number");
                expect(category.name).to.be.a("string");
                expect(category.category_level_id).to.be.a("number");
                expect(category.parent_category_id).to.be.null;
                expect(category.sub_categories).to.be.an("array");
                expect(category.sub_categories.length).to.be.at.least(1);
                for (let subCategory of category.sub_categories) {
                    expect(subCategory.category_id).to.be.a("number");
                    expect(subCategory.name).to.be.a("string");
                    expect(subCategory.category_level_id).to.be.a("number");
                    expect(subCategory.parent_category_id).to.be.a("number");
                    expect(subCategory.parent_category_id).to.be.equal(category.category_id);
                }
                expect(category.species).to.be.an("array");
                expect(category.species.length).to.be.equal(0);
            }
            expect(res.body)
            done();
        })
    })
});

after(function () {
    return new Promise(function (resolve) {
        request.close(function() {
            console.log("Closed server");
            resolve();
        })
    });
});