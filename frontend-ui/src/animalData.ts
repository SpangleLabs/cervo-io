/**
 * Store data about known species
 */
import {promiseGet} from "@cervoio/common-ui-lib/src/utilities";
import {
    CategoryJson,
    CategoryLevelJson,
    FullCategoryJson,
    FullSpeciesJson,
    SpeciesJson,
    ZooJson
} from "@cervoio/common-lib/src/apiInterfaces";


export class AnimalData {
    species: Map<number, SpeciesData>;
    categories: Map<number, CategoryData>;
    categoryLevels: Promise<CategoryLevelJson[]>;
    baseCategory: Promise<CategoryData[]>;
    validFirstLetters: Promise<string[]>;
    speciesByLetter: Map<string, Promise<SpeciesData[]>>;

    constructor() {
        this.species = new Map<number, SpeciesData>();
        this.categories = new Map<number, CategoryData>();
        this.speciesByLetter = new Map<string, Promise<SpeciesData[]>>();
    }

    promiseCategoryLevels() : Promise<CategoryLevelJson[]> {
        if (!this.categoryLevels) {
            this.categoryLevels = promiseGet("category_levels/");
        }
        return this.categoryLevels;
    }

    promiseBaseCategories() : Promise<CategoryData[]> {
        if (!this.baseCategory) {
            const self = this;
            this.baseCategory = promiseGet("categories/").then(function(data: CategoryJson[]) {
                return data.map(x => self.getOrCreateCategory(x));
            });
        }
        return this.baseCategory;
    }

    promiseValidFirstLetters() : Promise<string[]> {
        if (!this.validFirstLetters) {
            this.validFirstLetters = promiseGet("species/valid_first_letters/");
        }
        return this.validFirstLetters;
    }

    promiseSpeciesByLetter(letter: string) : Promise<SpeciesData[]> {
        if (!this.speciesByLetter.has(letter)) {
            const self = this;
            const speciesPromise = promiseGet(`species/?common_name=${letter}%25`).then(function(data: SpeciesJson[]) {
                return data.map(x => self.getOrCreateSpecies(x));
            });
            this.speciesByLetter.set(letter, speciesPromise);
        }
        return this.speciesByLetter.get(letter);
    }

    promiseSearchSpecies(search: string) : Promise<SpeciesData[]> {
        const self = this;
        return promiseGet(`species/?name=%25${search}%25`).then(function(animals: SpeciesJson[]) {
            return animals.map(x => self.getOrCreateSpecies(x));
        });
    }

    getOrCreateCategory(categoryData: CategoryJson): CategoryData {
        const categoryId = categoryData.category_id;
        if (!this.categories.has(categoryId)) {
            const newCategory = new CategoryData(categoryData, this);
            this.categories.set(categoryId, newCategory);
        }
        return this.categories.get(categoryId);
    }

    getOrCreateSpecies(speciesData: SpeciesJson) : SpeciesData {
        const speciesId = speciesData.species_id;
        if (this.species.has(speciesId)) {
            return this.species.get(speciesId);
        } else {
            const newSpecies = new SpeciesData(speciesData);
            this.species.set(speciesId, newSpecies);
            return newSpecies;
        }
    }
}

export class CategoryData {
    animalData: AnimalData;
    id: number;
    name: string;
    categoryLevelId: number;
    parentCategoryId: number | null;
    _fullDataPromise: Promise<FullCategoryJson> | null;
    subCategories: Promise<CategoryData> | null;
    species: Promise<SpeciesData> | null;

    constructor(categoryData: CategoryJson, animalData: AnimalData) {
        this.animalData = animalData;
        this.id = categoryData.category_id;
        this.name = categoryData.name;
        this.categoryLevelId = categoryData.category_level_id;
        this.parentCategoryId = categoryData.parent_category_id;
        this._fullDataPromise = null;
        this.subCategories = null;
        this.species = null;
    }

    async promiseFullData(): Promise<FullCategoryJson> {
        if (!this._fullDataPromise) {
            this._fullDataPromise = promiseGet("categories/" + this.id).then(function (data: FullCategoryJson[]) {
                return data[0];
            });
        }
        return this._fullDataPromise;
    }

    async getSubCategories(): Promise<CategoryData[]> {
        const self = this;
        return this.promiseFullData().then(function (data: FullCategoryJson) {
            return data.sub_categories.map(x => self.animalData.getOrCreateCategory(x));
        });
    }

    async getSpecies(): Promise<SpeciesData[]> {
        const self = this;
        return this.promiseFullData().then(function (data: FullCategoryJson) {
            return data.species.map(x => self.animalData.getOrCreateSpecies(x));
        });
    }
}

/**
 * Stores species info, and lists of zoos the species appear in
 */
export class SpeciesData {
    id: number;
    commonName: string;
    latinName: string;
    parentCategoryId: number;
    zooList: Promise<ZooJson[]> | null;

    constructor(speciesData: SpeciesJson) {
        this.id = speciesData.species_id;
        this.commonName = speciesData.common_name;
        this.latinName = speciesData.latin_name;
        this.parentCategoryId = speciesData.category_id;
        this.zooList = null;
    }

    async getZooList(): Promise<ZooJson[]> {
        if(this.zooList == null) {
            this.zooList = promiseGet("species/" + this.id).then(function (data: FullSpeciesJson[]) {
                return data[0].zoos;
            });
        }
        return this.zooList;
    }
}