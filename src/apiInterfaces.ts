interface NewZooJson {
    name: string;
    postcode: string;
    link: string;
    latitude: number;  // TODO: missing from fullzoo?
    longitude: number;  // TODO: missing from fullzoo?
}

interface ZooJson extends NewZooJson {
    zoo_id: number;
}

interface ZooEntryForSpeciesJson extends ZooJson {
    zoo_species_id: number;
    species_id: number;
}

interface FullZooJson extends ZooJson {
    species: SpeciesEntryForZooJson[];
}

interface NewSpeciesJson {
    common_name: string;
    latin_name: string;
    category_id: number;
}

interface SpeciesJson extends NewSpeciesJson {
    species_id: number;
}

interface SpeciesEntryForZooJson extends SpeciesJson {
    zoo_species_id: number;
    zoo_id: number;
}

interface NewZooSpeciesLinkJson {
    zoo_id: number;
    species_id: number;
}

interface ZooSpeciesLinkJson extends NewZooSpeciesLinkJson {
    zoo_species_id: number;
}

interface FullSpeciesJson extends SpeciesJson {
    zoos: ZooJson[];
}

interface NewCategoryLevelJson {
    name: string;
}

interface CategoryLevelJson extends NewCategoryLevelJson {
    category_level_id: number;
}

interface NewCategoryJson {
    name: string;
    category_level_id: number;
    parent_category_id: number | null;
}

interface CategoryJson extends NewCategoryJson {
    category_id: number;
    name: string;
    category_level_id: number;
    parent_category_id: number | null;
    hidden?: boolean;  // TODO: seems to be in subcategories?
}

interface FullCategoryJson extends CategoryJson {
    sub_categories: CategoryJson[];
    species: SpeciesJson[];
}

interface ZooDistanceCache {
    zoo_id: number;
    metres: number;
}

interface NewZooDistanceJson extends ZooDistanceCache {
    user_postcode_id: number;  // TODO: this is pointless
}

interface ZooDistanceJson extends NewZooDistanceJson {
    zoo_distance_id: number;
}

interface SessionTokenJson {
    user_id: number;
    username: string;
    token: string;
    expiry_time: string;
    ip_addr: string;
}

interface NewUserPostcodeJson {
    postcode_sector: string
}

interface UserPostcodeJson extends NewUserPostcodeJson{
    user_postcode_id: number
}

interface LetterJson {
    letter: string;
}

interface NewEntryData {
    insertId: number;
}