import * as chai from 'chai';
import {expect} from 'chai';
import {CategoriesRouter} from "./categoriesRouter";
import chaiHttp = require('chai-http');
import {MockCategoriesProvider, MockSpeciesProvider} from "../testMockProviders";
import {requestRouter, MockAuthChecker} from "../testMocks";
import {NewCategoryJson} from "../apiInterfaces";
import {Category, FullCategory, Species} from "../testMockRecords";

chai.use(chaiHttp);

describe("Categories router", function() {
    describe("Base category listing", function () {
        it("Format is correct", function (done) {
            const mockCategoryProvider = new MockCategoriesProvider([
                {
                    category_id: 1, category_level_id: 1, name: "Test category", parent_category_id: null
                },
                {
                    category_id: 2, category_level_id: 2, name: "Sub category", parent_category_id: 1
                }]);
            const mockSpeciesProvider = new MockSpeciesProvider([
                {
                    species_id: 1, common_name: "Test species", latin_name: "Examplera testus", category_id: 1, hidden: false
                }
            ]);
            const authChecker = new MockAuthChecker();
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            requestRouter(categoryRouter).get("/categories/").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(1);
                for (let category of res.body) {
                    FullCategory.check(category);
                    expect(category.parent_category_id).to.be.null;
                    expect(category.sub_categories.length).to.be.equal(1);
                    for (let subCategory of category.sub_categories) {
                        Category.check(subCategory);
                        expect(subCategory.parent_category_id).to.be.equal(category.category_id);
                    }
                    expect(category.species.length).to.be.equal(1);
                    for (let species of category.species) {
                        Species.check(species);
                        expect(species.category_id).to.be.equal(category.category_id);
                    }
                }
                expect(res.body);
                done();
            })
        });

        it("Fills out multiple base entries", function (done) {
            const mockCategoryProvider = new MockCategoriesProvider([
                {
                    category_id: 1, category_level_id: 1, name: "Test category1", parent_category_id: null
                },
                {
                    category_id: 2, category_level_id: 2, name: "Sub category", parent_category_id: 1
                },
                {
                    category_id: 3, category_level_id: 1, name: "Test category2", parent_category_id: null
                }]);
            const mockSpeciesProvider = new MockSpeciesProvider([
                {
                    species_id: 1, common_name: "Test species", latin_name: "Examplera testus", category_id: 3, hidden: false
                },
                {
                    species_id: 2, common_name: "Test2", latin_name: "Duo testus", category_id: 3, hidden: false
                }
            ]);
            const authChecker = new MockAuthChecker();
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            requestRouter(categoryRouter).get("/categories/").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(2);
                for (let category of res.body) {
                    FullCategory.check(category);
                    expect(category.parent_category_id).to.be.null;
                }
                const category1 = res.body[0];
                expect(category1.sub_categories.length).to.be.equal(1);
                for (let subCategory of category1.sub_categories) {
                    Category.check(subCategory);
                    expect(subCategory.parent_category_id).to.be.equal(category1.category_id);
                }
                expect(category1.species.length).to.be.equal(0);

                const category2 = res.body[1];
                expect(category2.sub_categories.length).to.be.equal(0);
                expect(category2.species.length).to.be.equal(2);
                for (let species of category2.species) {
                    Species.check(species);
                    expect(species.category_id).to.be.equal(category2.category_id);
                }
                done();
            })
        });

        it("Handles having no base categories", function (done) {
            const mockCategoryProvider = new MockCategoriesProvider([]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            requestRouter(categoryRouter).get("/categories/").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(0);
                done();
            })
        });
    });

    describe("View specific category", function () {
        it("Shows just one category", function (done) {
            const mockCategoryProvider = new MockCategoriesProvider([
                {
                    category_id: 1, category_level_id: 1, name: "Test category1", parent_category_id: null
                },
                {
                    category_id: 2, category_level_id: 2, name: "Sub category", parent_category_id: 1
                },
                {
                    category_id: 3, category_level_id: 2, name: "Sub category2", parent_category_id: 1
                },
                {
                    category_id: 4, category_level_id: 3, name: "Sub sub category", parent_category_id: 2
                }]);
            const mockSpeciesProvider = new MockSpeciesProvider([
                {
                    species_id: 1, common_name: "Test species", latin_name: "Examplera testus", category_id: 2, hidden: false
                },
                {
                    species_id: 2, common_name: "Test2", latin_name: "Duo testus", category_id: 3, hidden: false
                }
            ]);
            const authChecker = new MockAuthChecker();
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            requestRouter(categoryRouter).get("/categories/2").end(function (err, res) {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(200);
                expect(res.type).to.be.equal("application/json");
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.equal(1);
                const category = res.body[0];
                FullCategory.check(category);
                expect(category.parent_category_id).not.to.be.null;
                expect(category.category_id).to.be.equal(2);
                expect(category.sub_categories.length).to.be.equal(1);
                for (let subCategory of category.sub_categories) {
                    Category.check(subCategory);
                    expect(subCategory.parent_category_id).to.be.equal(category.category_id);
                }
                expect(category.species.length).to.be.equal(1);
                const species = category.species[0];
                Species.check(species);
                done();
            })
        })
    });

    describe('Add new category', function () {
        it('should add the category', function (done) {
            const mockCategoryProvider = new MockCategoriesProvider([
                {
                    category_id: 1, category_level_id: 1, name: "Test category", parent_category_id: null
                }]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            const newCategory: NewCategoryJson = {
                category_level_id: 2,
                name: "sub category",
                parent_category_id: 1
            };

            requestRouter(categoryRouter)
                .post("/categories/")
                .set("content-type", "application/json")
                .send(newCategory)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(200);
                    expect(res.type).to.be.equal("application/json");
                    const category = res.body;
                    Category.check(category);
                    expect(mockCategoryProvider.testCategories).to.be.length(2);
                    done();
                })
        });

        it("should return 403 if not authorized as an admin", function(done) {
            const mockCategoryProvider = new MockCategoriesProvider([]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_admin = false;
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            const newCategory: NewCategoryJson = {
                category_level_id: 2,
                name: "sub category",
                parent_category_id: null
            };

            requestRouter(categoryRouter)
                .post("/categories/")
                .set("content-type", "application/json")
                .send(newCategory)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(mockCategoryProvider.testCategories).to.be.length(0);
                    done();
                });
        });

        it("should return 403 if not authorized at all", function(done) {
            const mockCategoryProvider = new MockCategoriesProvider([]);
            const mockSpeciesProvider = new MockSpeciesProvider([]);
            const authChecker = new MockAuthChecker();
            authChecker.is_logged_in = false;
            const categoryRouter = new CategoriesRouter(authChecker, mockCategoryProvider, mockSpeciesProvider);

            const newCategory: NewCategoryJson = {
                category_level_id: 2,
                name: "sub category",
                parent_category_id: null
            };

            requestRouter(categoryRouter)
                .post("/categories/")
                .set("content-type", "application/json")
                .send(newCategory)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body).to.property("error");
                    expect(res.body.error).to.be.equal("Not authorized.");
                    expect(mockCategoryProvider.testCategories).to.be.length(0);
                    done();
                });
        });
    });
});
