import * as chai from 'chai';
import { expect, request } from 'chai';
import chaiHttp = require('chai-http');
import {CategoriesRouter} from "./categoriesRouter";
import {Application} from "express";
import {AbstractRouter} from "./abstractRouter";
import {CategoriesProvider} from "../models/categories";
import {handler404, handler500} from "../index";

const express = require('express');

chai.use(chaiHttp);

function mockApp(router: AbstractRouter) {
    const App: Application = express();

    router.register(App);

    App.use(handler404);
    App.use(handler500);
    return App;
}

class MockCategoriesProvider extends CategoriesProvider {
    constructor() {
        super(() => { throw new Error("Mock database.");});
    }

    getBaseCategories(): Promise<CategoryJson[]> {
        const fakeCategory: CategoryJson = {
            category_id: 1, category_level_id: 1, hidden: false, name: "Test category", parent_category_id: null
        }
        return Promise.all([fakeCategory]);
    }
}

const mockCategoryProvider = new MockCategoriesProvider();
const categoryRouter = new CategoriesRouter(mockCategoryProvider);
const App = mockApp(categoryRouter);

const appRequest = request(App);

describe("Base category listing", function() {
    it("Format is correct", function (done) {
        appRequest.get("/categories/").end(function(err, res) {
            console.log(res.body);
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
            expect(res.body);
            done();
        })
    })
});

after(function () {
    return new Promise(function (resolve) {
        appRequest.close(function() {
            console.log("Closed server");
            resolve();
        })
    });
});