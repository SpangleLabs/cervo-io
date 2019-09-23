import {CategoryLevelJson} from "@cervoio/common-lib/src/apiInterfaces";
import {AnimalData, CategoryData, SpeciesData} from "./animalData";


export async function create(animalData: AnimalData): Promise<TaxonomyTreeState> {
    const categoryLevelsPromise = animalData.promiseCategoryLevels();
    const baseCategoriesPromise = animalData.promiseBaseCategories();
    const [categoryLevels, baseCategories] = await Promise.all([categoryLevelsPromise, baseCategoriesPromise]);
    const rootCategories: TaxonomyCategoryState[] = await Promise.all(baseCategories.map(async function(x) {
        return {
            data: x,
            categoryLevel: await x.getCategoryName(),
            subCategories: [],
            species: [],
            populated: false,
            expanded: false,
            selected: false
        }
    }));
    const expandedRootCategories = await Promise.all(rootCategories.map(expandCategory));
    return {
        categoryLevels: categoryLevels,
        rootCategories: expandedRootCategories
    };
}

export async function treeToggleSelectCategory(state: TaxonomyTreeState, categoryIds: number[]): Promise<TaxonomyTreeState> {
    return {
        categoryLevels: state.categoryLevels,
        rootCategories: await Promise.all(state.rootCategories.map(x => categoryToggleSelectCategory(x, categoryIds)))
    }
}

export async function treeExpandCategory(state: TaxonomyTreeState, categoryIds: number[]): Promise<TaxonomyTreeState> {
    return {
        categoryLevels: state.categoryLevels,
        rootCategories: await Promise.all(state.rootCategories.map(x => categoryExpandCategory(x, categoryIds)))
    }
}

async function categoryToggleSelectCategory(category: TaxonomyCategoryState, categoryIds: number[]): Promise<TaxonomyCategoryState> {
    if(category.data.id != categoryIds[0]) {
        return category;
    }
    if(categoryIds.length == 1) {
        return toggleSelectCategory(category);
    }
    category = await populateCategory(category);
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: await Promise.all(category.subCategories.map(x => categoryToggleSelectCategory(x, categoryIds.slice(1)))),
        species: category.species,
        populated: category.populated,
        expanded: category.expanded,
        selected: category.selected
    }
}

async function categoryExpandCategory(category: TaxonomyCategoryState, categoryIds: number[]): Promise<TaxonomyCategoryState> {
    if(category.data.id != categoryIds[0]) {
        return category;
    }
    if(categoryIds.length == 1) {
        return expandCategory(category);
    }
    category = await populateCategory(category);
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: await Promise.all(category.subCategories.map(x => categoryExpandCategory(x, categoryIds.slice(1)))),
        species: category.species,
        populated: category.populated,
        expanded: category.expanded,
        selected: category.selected
    }
}

function selectSpecies(species: TaxonomySpeciesState, selected: boolean): TaxonomySpeciesState {
    return {
        data: species.data,
        selected: selected
    }
}

async function selectCategory(category: TaxonomyCategoryState, selected: boolean): Promise<TaxonomyCategoryState> {
    category = await populateCategory(category);
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: await Promise.all(category.subCategories.map(x => selectCategory(x, selected))),
        species: category.species.map(x => selectSpecies(x, selected)),
        populated: category.populated,
        expanded: category.expanded,
        selected: selected
    }
}

async function toggleSelectCategory(category: TaxonomyCategoryState): Promise<TaxonomyCategoryState> {
    category = await populateCategory(category);
    return await selectCategory(category, !category.selected);
}

async function expandCategory(category: TaxonomyCategoryState): Promise<TaxonomyCategoryState> {
    category = await populateCategory(category);
    if (category.subCategories.length == 1) {
        const expandedSubCategories = await Promise.all(category.subCategories.map(expandCategory));
        return {
            data: category.data,
            categoryLevel: category.categoryLevel,
            subCategories: expandedSubCategories,
            species: category.species,
            populated: category.populated,
            expanded: !category.expanded,
            selected: category.selected
        }
    }
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: category.subCategories,
        species: category.species,
        populated: category.populated,
        expanded: !category.expanded,
        selected: category.selected
    }
}

async function populateCategory(category: TaxonomyCategoryState): Promise<TaxonomyCategoryState> {
    if (category.populated) {
        return category;
    }
    const [subCategoryData, speciesData] = await Promise.all([category.data.getSubCategories(), category.data.getSpecies()]);
    const subCategories = await Promise.all(subCategoryData.map(async function(x) {
        return {
            data: x,
            categoryLevel: await x.getCategoryName(),
            subCategories: [],
            species: [],
            populated: false,
            selected: category.selected,
            expanded: false
        }
    }));
    const species = speciesData.map(x => {
        return {
            data: x,
            selected: category.selected
        }
    });
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: subCategories,
        species: species,
        populated: true,
        expanded: category.expanded,
        selected: category.selected
    }
}


export interface TaxonomyTreeState {
    categoryLevels: CategoryLevelJson[];
    rootCategories: TaxonomyCategoryState[];
}

export interface TaxonomyCategoryState {
    data: CategoryData;
    categoryLevel: string;
    subCategories: TaxonomyCategoryState[];
    species: TaxonomySpeciesState[];
    populated: boolean;
    selected: boolean;
    expanded: boolean;
}

export interface TaxonomySpeciesState {
    data: SpeciesData;
    selected: boolean;
}
