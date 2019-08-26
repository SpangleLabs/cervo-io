export interface NewZooJson {
    name: string;
    postcode: string;
    link: string;
    latitude: number;
    longitude: number;
}

export interface ZooJson extends NewZooJson {
    zoo_id: number;
}

export interface ZooEntryForSpeciesJson extends ZooJson {
    zoo_species_id: number;
    species_id: number;
}

export interface FullZooJson extends ZooJson {
    species: SpeciesEntryForZooJson[];
}

export interface NewSpeciesJson {
    common_name: string;
    latin_name: string;
    category_id: number;
    hidden: boolean;
}

export interface SpeciesJson extends NewSpeciesJson {
    species_id: number;
}

export interface SpeciesEntryForZooJson extends SpeciesJson {
    zoo_species_id: number;
    zoo_id: number;
}

export interface NewZooSpeciesLinkJson {
    zoo_id: number;
    species_id: number;
}

export interface ZooSpeciesLinkJson extends NewZooSpeciesLinkJson {
    zoo_species_id: number;
}

export interface FullSpeciesJson extends SpeciesJson {
    zoos: ZooJson[];
}

export interface NewCategoryLevelJson {
    name: string;
}

export interface CategoryLevelJson extends NewCategoryLevelJson {
    category_level_id: number;
}

export interface NewCategoryJson {
    name: string;
    category_level_id: number;
    parent_category_id: number | null;
}

export interface CategoryJson extends NewCategoryJson {
    category_id: number;
}

export interface FullCategoryJson extends CategoryJson {
    sub_categories: CategoryJson[];
    species: SpeciesJson[];
}

export interface ZooDistanceCache {
    zoo_id: number;
    metres: number;
}

export interface NewZooDistanceJson extends ZooDistanceCache {
    user_postcode_id: number;
}

export interface ZooDistanceJson extends NewZooDistanceJson {
    zoo_distance_id: number;
}

export interface SessionTokenJson {
    user_id: number;
    username: string;
    token: string;
    expiry_time: string;
    ip_addr: string;
    is_admin: boolean
}

export interface NewUserPostcodeJson {
    postcode_sector: string
}

export interface UserPostcodeJson extends NewUserPostcodeJson{
    user_postcode_id: number
}
