/**
 * Store data about known species
 */
import {promiseGet} from "./utilities";


export class AnimalData {
    species: {[key: number] : SpeciesData};
    categoryLevels: Promise<CategoryLevelJson[]>;
    baseCategory: Promise<CategoryJson[]>;
    validFirstLetters: Promise<string[]>;
    speciesByLetter: Map<string, Promise<SpeciesJson[]>>;

    constructor() {
        this.species = {};
        this.speciesByLetter = new Map<string, Promise<SpeciesJson[]>>();
    }

    promiseCategoryLevels() : Promise<CategoryLevelJson[]> {
        if (!this.categoryLevels) {
            this.categoryLevels = promiseGet("category_levels/");
        }
        return this.categoryLevels;
    }

    promiseBaseCategories() : Promise<CategoryJson[]> {
        if (!this.baseCategory) {
            this.baseCategory = promiseGet("categories/");
        }
        return this.baseCategory;
    }

    promiseValidFirstLetters() : Promise<string[]> {
        if (!this.validFirstLetters) {
            this.validFirstLetters = promiseGet("species/valid_first_letters/");
        }
        return this.validFirstLetters;
    }

    promiseSpeciesByLetter(letter: string) : Promise<SpeciesJson[]> {
        if (!this.speciesByLetter.has(letter)) {
            this.speciesByLetter.set(letter, promiseGet(`species/?common_name=${letter}%25`));
        }
        return this.speciesByLetter.get(letter);
    }

    getOrCreateSpecies(speciesData: SpeciesJson) : SpeciesData {
        const speciesId = speciesData.species_id;
        if (this.species[speciesId]) {
            return this.species[speciesId];
        } else {
            const newSpecies = new SpeciesData(speciesData);
            this.species[speciesId] = newSpecies;
            return newSpecies;
        }
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