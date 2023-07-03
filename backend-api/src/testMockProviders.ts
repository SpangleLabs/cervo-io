import {CategoriesProvider} from "./models/categoriesProvider";
import {
    CategoryJson, CategoryLevelJson,
    NewCategoryJson,
    NewSpeciesJson, NewUserPostcodeJson, NewZooDistanceJson, NewZooJson, NewZooSpeciesLinkJson, SessionTokenJson,
    SpeciesEntryForZooJson,
    SpeciesJson, UserPostcodeJson, ZooDistanceJson, ZooEntryForSpeciesJson, ZooJson,
    ZooSpeciesLinkJson
} from "@cervoio/common-lib/src/apiInterfaces";
import {SpeciesProvider} from "./models/speciesProvider";
import {LetterJson} from "./dbInterfaces";
import {ZoosProvider} from "./models/zoosProvider";
import {ZooDistancesProvider} from "./models/zooDistancesProvider";
import {UserPostcodesProvider} from "./models/userPostcodesProvider";
import {CategoryLevelsProvider} from "./models/categoryLevelsProvider";
import {SessionsProvider} from "./models/sessionsProvider";
import {ZooSpeciesProvider} from "./models/zooSpeciesProvider";
import {Client} from "pg";


function createNewId(currentIds: number[]) {
    return currentIds.length == 0 ? 1 : Math.max(...currentIds) + 1;
}

function valueMatchesSqlLikeQuery(value: string, query: string): boolean {
    if(query.includes("%")) {
        if(query.startsWith("%")) {
            if(query.endsWith("%")) {
                return value.includes(query.substring(1, query.length-1));
            } else {
                return value.endsWith(query.substring(1));
            }
        } else {
            if(query.endsWith("%")) {
                return value.startsWith(query.substring(0, query.length-1));
            } else {
                throw new Error("Mock can't support this.");
            }
        }
    } else {
        return value == query;
    }
}

export class MockCategoriesProvider extends CategoriesProvider {
    testCategories: CategoryJson[];

    constructor(testCategories: CategoryJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
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
            parent_category_id: newCategory.parent_category_id,
            hidden: newCategory.hidden
        };
        this.testCategories.push(result);
        return Promise.resolve(result);
    }
}

export class MockSpeciesProvider extends SpeciesProvider {
    testSpecies: SpeciesJson[];
    testZooSpecies: ZooSpeciesLinkJson[];

    constructor(testSpecies: SpeciesJson[], testZooSpecies?: ZooSpeciesLinkJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
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
            const species = this.testSpecies.filter(x => x.species_id == speciesLink.species_id)[0];
            results.push(
                {
                    species_id: species.species_id,
                    category_id: species.category_id,
                    common_name: species.common_name,
                    latin_name: species.latin_name,
                    hidden: species.hidden,
                    zoo_species_id: speciesLink.zoo_species_id,
                    zoo_id: zoo_id
                }
            )
        }
        return Promise.all(results);
    }

    addSpecies(newSpecies: NewSpeciesJson): Promise<SpeciesJson> {
        const newId = createNewId(this.testSpecies.map(x => x.species_id));
        const result = {
            species_id: newId,
            common_name: newSpecies.common_name,
            latin_name: newSpecies.latin_name,
            category_id: newSpecies.category_id,
            hidden: newSpecies.hidden
        }
        this.testSpecies.push(result);
        return Promise.resolve(result);
    }

    getFirstLetters(): Promise<LetterJson[]> {
        const letters = this.testSpecies.map(x => {return {letter: x.common_name[0].toUpperCase(), hidden: x.hidden}}).sort();
        const uniqueLetters = letters.filter(function(el,i,a){return i===a.indexOf(el)});
        return Promise.resolve(uniqueLetters);
    }

    getAllSpecies(): Promise<SpeciesJson[]> {
        return Promise.resolve(this.testSpecies);
    }

    getSpeciesByCommonName(search: string): Promise<SpeciesJson[]> {
        return Promise.resolve(this.testSpecies.filter(x => valueMatchesSqlLikeQuery(x.common_name, search)));
    }

    getSpeciesByName(search: string): Promise<SpeciesJson[]> {
        return Promise.resolve(
            this.testSpecies.filter(x => valueMatchesSqlLikeQuery(x.common_name, search) || valueMatchesSqlLikeQuery(x.latin_name, search))
        );
    }

    getSpeciesById(id: number): Promise<SpeciesJson[]> {
        return Promise.resolve(
            this.testSpecies.filter(x => x.species_id == id)
        );
    }
}

export class MockZoosProvider extends ZoosProvider {
    testZoos: ZooJson[];
    testZooSpecies: ZooSpeciesLinkJson[];

    constructor(testZoos: ZooJson[], testZooSpecies?: ZooSpeciesLinkJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
        this.testZoos = testZoos;
        if (!testZooSpecies) {
            testZooSpecies = [];
        }
        this.testZooSpecies = testZooSpecies;
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

    getZoosBySpeciesId(species_id: number): Promise<ZooEntryForSpeciesJson[]> {
        const zooLinksForSpecies = this.testZooSpecies.filter(x => x.species_id == species_id);
        const results: ZooEntryForSpeciesJson[] = [];
        for (let speciesLink of zooLinksForSpecies) {
            const zoo = this.testZoos.filter(x => x.zoo_id == speciesLink.zoo_id)[0];
            results.push(
                {
                    zoo_species_id: speciesLink.zoo_species_id,
                    species_id: species_id,
                    zoo_id: zoo.zoo_id,
                    name: zoo.name,
                    postcode: zoo.postcode,
                    link: zoo.link,
                    latitude: zoo.latitude,
                    longitude: zoo.longitude
                }
            )
        }
        return Promise.all(results);
    }
}

export class MockZooDistanceProvider extends ZooDistancesProvider {
    testZooDistances: ZooDistanceJson[];

    constructor(testZooDistances: ZooDistanceJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
        this.testZooDistances = testZooDistances
    }

    getZooDistanceByZooIdAndUserPostcodeId(zoo_id: number, user_postcode_id: number): Promise<ZooDistanceJson[]> {
        return Promise.all(this.testZooDistances.filter(x => x.zoo_id == zoo_id && x.user_postcode_id == user_postcode_id));
    }

    addZooDistance(ZooDistance: NewZooDistanceJson): Promise<ZooDistanceJson> {
        const newId = createNewId(this.testZooDistances.map(x => x.zoo_distance_id));
        const result = {
            zoo_distance_id: newId,
            zoo_id: ZooDistance.zoo_id,
            user_postcode_id: ZooDistance.user_postcode_id,
            metres: ZooDistance.metres
        }
        this.testZooDistances.push(result);
        return Promise.resolve(result);
    }
}

export class MockUserPostcodeProvider extends UserPostcodesProvider {
    testUserPostcodes: UserPostcodeJson[];

    constructor(testUserPostcodes: UserPostcodeJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
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
        super(
            () => { throw new Error("Mock database."); },
            (null as unknown as Client),
        );
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
    users: {user_id: number, username: string, is_admin: boolean}[];

    constructor(sessionTokens: SessionTokenJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
        this.sessionTokens = sessionTokens;
        this.failedLogins = new Map<string, number>();
        this.validPasswordHashes = new Map<string, {password: string}[]>();
        this.users = sessionTokens.map(x => { return {user_id: x.user_id, username: x.username, is_admin: x.is_admin}});
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

    getUserData(username: string): Promise<{ user_id: number; username: string; is_admin: boolean }[]> {
        return Promise.all(
            this.users.filter(x => x.username == username)
        );
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
            expiry_time: expiryTime, ip_addr: ipAddr, token: authToken, user_id: 0, username: username, is_admin: false
        });
        return Promise.resolve();
    }

    deleteToken(username: string): Promise<void> {
        this.sessionTokens = this.sessionTokens.filter(x => x.username != username);
        return Promise.resolve();
    }
}

export class MockZooSpeciesProvider extends ZooSpeciesProvider {
    testZooSpeciesLinks: ZooSpeciesLinkJson[];

    constructor(testZooSpeciesLinks: ZooSpeciesLinkJson[]) {
        super(
            () => { throw new Error("Mock database.");},
            (null as unknown as Client),
        );
        this.testZooSpeciesLinks = testZooSpeciesLinks;
    }

    addZooSpecies(newZooSpecies: NewZooSpeciesLinkJson): Promise<ZooSpeciesLinkJson> {
        const newId = createNewId(this.testZooSpeciesLinks.map(x => x.zoo_species_id));
        const result = {
            zoo_species_id: newId,
            species_id: newZooSpecies.species_id,
            zoo_id: newZooSpecies.zoo_id
        }
        this.testZooSpeciesLinks.push(result);
        return Promise.resolve(result);
    }

    deleteZooSpecies(deleteLink: ZooSpeciesLinkJson | NewZooSpeciesLinkJson): Promise<void> {
        this.testZooSpeciesLinks = this.testZooSpeciesLinks.filter(x => x.species_id != deleteLink.species_id || x.zoo_id != deleteLink.zoo_id);
        return Promise.resolve();
    }
}
