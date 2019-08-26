import {Boolean, Null, Number, Record, String, Union} from "runtypes";
import {Array} from "runtypes/lib/types/array";

export const Category = Record({
    category_id: Number,
    name: String,
    category_level_id: Number,
    parent_category_id: Number,
});
export const Species = Record({
    species_id: Number,
    common_name: String,
    latin_name: String,
    category_id: Number,
    hidden: Boolean
});
export const FullCategory = Record({
    category_id: Number,
    name: String,
    category_level_id: Number,
    parent_category_id: Union(Number, Null),
    sub_categories: Array(Category),
    species: Array(Species)
});

export const CategoryLevel = Record({
    category_level_id: Number,
    name: String
});

export const SessionToken = Record({
    username: String,
    token: String,
    expiry_time: String,
    ip_addr: String,
    is_admin: Boolean
});

export const ZooEntryForSpecies = Record({
    zoo_species_id: Number,
    species_id: Number,
    zoo_id: Number,
    name: String,
    postcode: String,
    link: String,
    latitude: Number,
    longitude: Number
})
export const FullSpecies = Record({
    species_id: Number,
    common_name: String,
    latin_name: String,
    category_id: Number,
    hidden: Boolean,
    zoos: Array(ZooEntryForSpecies)
});

export const Zoo = Record({
    zoo_id: Number,
    name: String,
    link: String,
    postcode: String,
    latitude: Number,
    longitude: Number
});
export const UserPostcode = Record({
    user_postcode_id: Number,
    postcode_sector: String
});
export const ZooDistance = Record({
    zoo_id: Number,
    metres: Number,
    user_postcode_id: Number,
    zoo_distance_id: Number
});
export const NewZooDistance = Record({
    zoo_id: Number,
    metres: Number,
    user_postcode_id: Number
})

export const ZooSpeciesLink = Record({
    zoo_species_id: Number,
    species_id: Number,
    zoo_id: Number
});

export const SpeciesEntryForZoo = Record({
    species_id: Number,
    category_id: Number,
    common_name: String,
    latin_name: String,
    zoo_id: Number,
    zoo_species_id: Number
});
export const FullZoo = Record({
    zoo_id: Number,
    name: String,
    link: String,
    postcode: String,
    latitude: Number,
    longitude: Number,
    species: Array(SpeciesEntryForZoo)
});
