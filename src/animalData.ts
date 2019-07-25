/**
 * Store data about known species
 */
import {promiseGet} from "./utilities";


export class AnimalData {
    species: {[key: number] : SpeciesData};

    constructor() {
        this.species = {};
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