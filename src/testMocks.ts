import {AbstractRouter} from "./routes/abstractRouter";
import {Application, NextFunction, Request, Response} from "express";
import {handler404} from "./index";
import {CategoriesProvider} from "./models/categoriesProvider";
import {SpeciesProvider} from "./models/speciesProvider";
import {request} from "chai";
import bodyParser = require("body-parser");
import {CategoryLevelsProvider} from "./models/categoryLevelsProvider";

const express = require('express');

const handler500Testing = function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err);
    // render the error page
    res.status(500);
    res.json(err);
};

function mockApp(router: AbstractRouter) {
    const App: Application = express();
    App.use(bodyParser.json());
    App.use(bodyParser.urlencoded({extended: false}));

    router.register(App);

    App.use(handler404);
    App.use(handler500Testing);
    return App;
}

export function requestRouter(router: AbstractRouter) {
    const App = mockApp(router);
    return request(App);
}

export class MockCategoriesProvider extends CategoriesProvider {
    testCategories: CategoryJson[];

    constructor(testCategories: CategoryJson[]) {
        super(() => { throw new Error("Mock database.");});
        this.testCategories = testCategories;
    }

    getBaseCategories(): Promise<CategoryJson[]> {
        return Promise.all(
            this.testCategories.filter( x => x.parent_category_id == null)
        );
    }

    getCategoryById(id: number): Promise<CategoryJson[]> {
        return Promise.all(
            this.testCategories.filter( x => x.category_id == id)
        );
    }

    getCategoriesByParentId(id:number): Promise<CategoryJson[]> {
        return Promise.all(
            this.testCategories.filter(x => x.parent_category_id == id)
        );
    }

    addCategory(newCategory: NewCategoryJson): Promise<CategoryJson> {
        const newId = Math.max(...this.testCategories.map(x => x.category_id))+1;
        const result: CategoryJson = {
            category_id: newId,
            category_level_id: newCategory.category_level_id,
            name: newCategory.name,
            parent_category_id: newCategory.parent_category_id
        }
        this.testCategories.push(result);
        return Promise.resolve(result);
    }
}

export class MockSpeciesProvider extends SpeciesProvider {
    testSpecies: SpeciesJson[];

    constructor(testSpecies: SpeciesJson[]) {
        super(() => { throw new Error("Mock database.");});
        this.testSpecies = testSpecies;
    }

    getSpeciesByCategoryId(id: number): Promise<SpeciesJson[]> {
        return Promise.all(
            this.testSpecies.filter(x => x.category_id == id)
        );
    }
}

export class MockCategoryLevelsProvider extends CategoryLevelsProvider {
    testCategoryLevels: CategoryLevelJson[];

    constructor(testCategoryLevels: CategoryLevelJson[]) {
        super(() => { throw new Error("Mock database."); });
        this.testCategoryLevels = testCategoryLevels
    }

    getAllCategoryLevels(): Promise<CategoryLevelJson[]> {
        return Promise.all(
            this.testCategoryLevels
        );
    }

    getCategoryLevelById(id: number): Promise<CategoryLevelJson[]> {
        return Promise.all(
            this.testCategoryLevels.filter(x => x.category_level_id == id)
        );
    }
}