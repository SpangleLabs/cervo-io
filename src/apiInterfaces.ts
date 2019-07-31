interface ZooJson {
    zoo_id: number;
    name: string;
    postcode: string;
    link: string;
    latitude: number;  // TODO: missing from fullzoo?
    longitude: number;  // TODO: missing from fullzoo?
}

interface SpeciesZooJson extends ZooJson {
    zoo_species_id: number;
    species_id: number;
}

interface FullZooJson extends ZooJson {
    species: ZooSpeciesJson[];
}

interface SpeciesJson {
    species_id: number;
    common_name: string;
    latin_name: string;
    category_id: number;
}

interface ZooSpeciesJson extends SpeciesJson {
    zoo_species_id: number;
    zoo_id: number;
}

interface FullSpeciesJson extends SpeciesJson {
    zoos: ZooJson[];
}

interface CategoryLevelJson {
    category_level_id: number;
    name: string;
}

interface CategoryJson {
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

interface ZooDistanceJson extends ZooDistanceCache {
    user_postcode_id: number;  // TODO: this is pointless
    zoo_distance_id: number;
}