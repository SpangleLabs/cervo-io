import {AbstractRouter} from "./routes/abstractRouter";
import {Application, NextFunction, Request, Response} from "express";
import {handler404} from "./index";
import {CategoriesProvider} from "./models/categoriesProvider";
import {SpeciesProvider} from "./models/speciesProvider";
import {request} from "chai";
import bodyParser = require("body-parser");
import {CategoryLevelsProvider} from "./models/categoryLevelsProvider";
import {ZoosProvider} from "./models/zoosProvider";
import {SessionsProvider} from "./models/sessionsProvider";
import {ZooDistancesProvider} from "./models/zooDistancesProvider";
import {UserPostcodesProvider} from "./models/userPostcodesProvider";

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
    App.enable('trust proxy');

    router.register(App);

    App.use(handler404);
    App.use(handler500Testing);
    return App;
}

function createNewId(currentIds: number[]) {
    return currentIds.length == 0 ? 1 : Math.max(...currentIds) + 1;
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
        const newId = createNewId(this.testCategories.map(x => x.category_id));
        const result: CategoryJson = {
            category_id: newId,
            category_level_id: newCategory.category_level_id,
            name: newCategory.name,
            parent_category_id: newCategory.parent_category_id
        };
        this.testCategories.push(result);
        return Promise.resolve(result);
    }
}

export class MockSpeciesProvider extends SpeciesProvider {
    testSpecies: SpeciesJson[];
    testZooSpecies: ZooSpeciesLinkJson[];

    constructor(testSpecies: SpeciesJson[], testZooSpecies?: ZooSpeciesLinkJson[]) {
        super(() => { throw new Error("Mock database.");});
        this.testSpecies = testSpecies;
        if (!testZooSpecies) {
            testZooSpecies = [];
        }
        this.testZooSpecies = testZooSpecies;
    }

    getSpeciesByCategoryId(id: number): Promise<SpeciesJson[]> {
        return Promise.all(
            this.testSpecies.filter(x => x.category_id == id)
        );
    }

    getSpeciesByZooId(zoo_id: number): Promise<SpeciesEntryForZooJson[]> {
        const speciesLinksForZoo = this.testZooSpecies.filter(x => x.zoo_id == zoo_id);
        const results: SpeciesEntryForZooJson[] = [];
        for (let speciesLink of speciesLinksForZoo) {
            const species = this.testSpecies.filter(x => speciesLinksForZoo.map(x => x.species_id).indexOf(x.species_id) !== -1)[0];
            results.push(
                {
                    species_id: species.species_id,
                    category_id: species.category_id,
                    common_name: species.common_name,
                    latin_name: species.latin_name,
                    zoo_species_id: speciesLink.zoo_species_id,
                    zoo_id: zoo_id
                }
            )
        }
        return Promise.all(results);
    }
}

export class MockZoosProvider extends ZoosProvider {
    testZoos: ZooJson[];

    constructor(testZoos: ZooJson[]) {
        super(() => { throw new Error("Mock database.");});
        this.testZoos = testZoos;
    }

    getAllZoos(): Promise<ZooJson[]> {
        return Promise.all(
            this.testZoos
        );
    }

    getZooById(id: number): Promise<ZooJson[]> {
        return Promise.all(
            this.testZoos.filter(x => x.zoo_id == id)
        );
    }

    addZoo(newZoo: NewZooJson): Promise<ZooJson> {
        const newId = createNewId(this.testZoos.map(x => x.zoo_id));
        const result: ZooJson = {
            zoo_id: newId,
            name: newZoo.name,
            postcode: newZoo.postcode,
            link: newZoo.link,
            latitude: newZoo.latitude,
            longitude: newZoo.longitude
        };
        this.testZoos.push(result);
        return Promise.resolve(result);
    }
}

export class MockZooDistanceProvider extends ZooDistancesProvider {
    testZooDistances: ZooDistanceJson[];

    constructor(testZooDistances: ZooDistanceJson[]) {
        super(() => { throw new Error("Mock database."); });
        this.testZooDistances = testZooDistances
    }

    getZooDistanceByZooIdAndUserPostcodeId(zoo_id: number, user_postcode_id: number): Promise<ZooDistanceJson[]> {
        return Promise.all(this.testZooDistances.filter(x => x.zoo_id == zoo_id && x.user_postcode_id == user_postcode_id));
    }
}

export class MockUserPostcodeProvider extends UserPostcodesProvider {
    testUserPostcodes: UserPostcodeJson[];

    constructor(testUserPostcodes: UserPostcodeJson[]) {
        super(() => { throw new Error("Mock database."); });
        this.testUserPostcodes = testUserPostcodes
    }

    getUserPostcodeByPostcodeSector(sector: string): Promise<UserPostcodeJson[]> {
        return Promise.all(this.testUserPostcodes.filter(x => x.postcode_sector == sector));
    }

    getUserPostcodeById(id: number): Promise<UserPostcodeJson[]> {
        return Promise.all(this.testUserPostcodes.filter(x => x.user_postcode_id == id));
    }

    addUserPostcode(newUserPostcode: NewUserPostcodeJson): Promise<UserPostcodeJson> {
        const newId = createNewId(this.testUserPostcodes.map(x => x.user_postcode_id));
        const newResult = {
            user_postcode_id: newId,
            postcode_sector: newUserPostcode.postcode_sector
        };
        this.testUserPostcodes.push(newResult);
        return Promise.resolve(newResult);
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

export class MockSessionsProvider extends SessionsProvider {
    sessionTokens: SessionTokenJson[];
    validPasswordHashes: Map<string, {password: string}[]>;
    failedLogins: Map<string, number>;

    constructor(sessionTokens: SessionTokenJson[]) {
        super(() => { throw new Error("Mock database."); });
        this.sessionTokens = sessionTokens;
        this.failedLogins = new Map<string, number>();
        this.validPasswordHashes = new Map<string, {password: string}[]>();
    }

    getSessionToken(authToken: string, ipAddr: string): Promise<SessionTokenJson[]> {
        return Promise.all(
            this.sessionTokens.filter(x => x.token == authToken && x.ip_addr == ipAddr)
        );
    }

    getValidPasswordHash(username: string): Promise<{ password: string }[]> {
        const hashes = this.validPasswordHashes.get(username);
        if(hashes != undefined) {
            return Promise.resolve(hashes);
        } else {
            return Promise.resolve([]);
        }
    }

    setFailedLogin(username: string): Promise<void> {
        let userFailedLogins = this.failedLogins.get(username);
        if (userFailedLogins) {
            this.failedLogins.set(username, userFailedLogins + 1);
        } else {
            this.failedLogins.set(username, 1);
        }
        return Promise.resolve();
    }

    resetFailedLogins(username: string): Promise<void> {
        this.failedLogins.set(username, 0);
        return Promise.resolve();
    }

    createSession(username: string, authToken: string, expiryTime: string, ipAddr: string): Promise<void> {
        this.sessionTokens.push({
            expiry_time: expiryTime, ip_addr: ipAddr, token: authToken, user_id: 0, username: username
        });
        return Promise.resolve();
    }

    deleteToken(username: string): Promise<void> {
        this.sessionTokens = this.sessionTokens.filter(x => x.username != username);
        return Promise.resolve();
    }
}