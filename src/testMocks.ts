import {AbstractRouter} from "./routes/abstractRouter";
import {Application} from "express";
import {handler404, handler500} from "./index";
import {CategoriesProvider} from "./models/categoriesProvider";
import {SpeciesProvider} from "./models/speciesProvider";

const express = require('express');


export function mockApp(router: AbstractRouter) {
    const App: Application = express();

    router.register(App);

    App.use(handler404);
    App.use(handler500);
    return App;
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

    getCategoriesByParentId(id:number): Promise<CategoryJson[]> {
        return Promise.all(
            this.testCategories.filter(x => x.parent_category_id == id)
        );
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