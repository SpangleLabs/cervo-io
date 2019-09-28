import {CategoryLevelJson} from "@cervoio/common-lib/src/apiInterfaces";
import {AnimalData, CategoryData, SpeciesData} from "./animalData";


export async function create(animalData: AnimalData, onSelectSpecies: (speciesId: number, selected?: boolean) => void): Promise<TaxonomyTreeState> {
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
            selected: false,
            onSelectSpecies: onSelectSpecies
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

export async function treeAddCategory(state: TaxonomyTreeState, categoryParentPath: number[], newCategory: CategoryData): Promise<TaxonomyTreeState> {
    return {
        categoryLevels: state.categoryLevels,
        rootCategories: await Promise.all(state.rootCategories.map(x => categoryAddCategory(x, categoryParentPath, newCategory)))
    }
}

export async function treeAddSpecies(state: TaxonomyTreeState, categoryParentPath: number[], newSpecies: SpeciesData): Promise<TaxonomyTreeState> {
    return {
        categoryLevels: state.categoryLevels,
        rootCategories: await Promise.all(state.rootCategories.map(x => categoryAddSpecies(x, categoryParentPath, newSpecies)))
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
        selected: category.selected,
        onSelectSpecies: category.onSelectSpecies
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
        selected: category.selected,
        onSelectSpecies: category.onSelectSpecies
    }
}

async function categoryAddCategory(category: TaxonomyCategoryState, parentCategoryPath: number[], newCategory: CategoryData): Promise<TaxonomyCategoryState> {
    if(category.data.id != parentCategoryPath[0]) {
        return category;
    }
    if(parentCategoryPath.length == 1) {
        return addCategory(category, newCategory);
    }
    category = await populateCategory(category);
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: await Promise.all(category.subCategories.map(x => categoryAddCategory(x, parentCategoryPath.slice(1), newCategory))),
        species: category.species,
        populated: category.populated,
        expanded: category.expanded,
        selected: category.selected,
        onSelectSpecies: category.onSelectSpecies
    }
}

async function categoryAddSpecies(category: TaxonomyCategoryState, parentCategoryPath: number[], newSpecies: SpeciesData): Promise<TaxonomyCategoryState> {
    if(category.data.id != parentCategoryPath[0]) {
        return category;
    }
    if(parentCategoryPath.length == 1) {
        return addSpecies(category, newSpecies);
    }
    category = await populateCategory(category);
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: await Promise.all(category.subCategories.map(x => categoryAddSpecies(x, parentCategoryPath.slice(1), newSpecies))),
        species: category.species,
        populated: category.populated,
        expanded: category.expanded,
        selected: category.selected,
        onSelectSpecies: category.onSelectSpecies
    }
}

async function selectCategory(category: TaxonomyCategoryState, selected: boolean): Promise<TaxonomyCategoryState> {
    category = await populateCategory(category);
    category.species.map(x => category.onSelectSpecies(x.data.id, selected));
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: await Promise.all(category.subCategories.map(x => selectCategory(x, selected))),
        species: category.species,
        populated: category.populated,
        expanded: category.expanded,
        selected: selected,
        onSelectSpecies: category.onSelectSpecies
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
            selected: category.selected,
            onSelectSpecies: category.onSelectSpecies
        }
    }
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: category.subCategories,
        species: category.species,
        populated: category.populated,
        expanded: !category.expanded,
        selected: category.selected,
        onSelectSpecies: category.onSelectSpecies
    }
}

async function addCategory(parentCategory: TaxonomyCategoryState, newCategory: CategoryData): Promise<TaxonomyCategoryState> {
    parentCategory = await populateCategory(parentCategory);
    const subCategories = parentCategory.subCategories.concat([{
        data: newCategory,
        categoryLevel: await newCategory.getCategoryName(),
        subCategories: [],
        species: [],
        populated: true,
        selected: parentCategory.selected,
        expanded: true,
        onSelectSpecies: parentCategory.onSelectSpecies
    }]);
    subCategories.sort((a, b) => a.data.name.localeCompare(b.data.name));
    return {
        data: parentCategory.data,
        categoryLevel: parentCategory.categoryLevel,
        subCategories: subCategories,
        species: parentCategory.species,
        populated: parentCategory.populated,
        expanded: parentCategory.expanded,
        selected: parentCategory.selected,
        onSelectSpecies: parentCategory.onSelectSpecies
    }
}

async function addSpecies(parentCategory: TaxonomyCategoryState, newSpecies: SpeciesData): Promise<TaxonomyCategoryState> {
    parentCategory = await populateCategory(parentCategory);
    const species = parentCategory.species.concat([{
        data: newSpecies
    }]);
    species.sort((a, b) => a.data.commonName.localeCompare(b.data.commonName));
    return {
        data: parentCategory.data,
        categoryLevel: parentCategory.categoryLevel,
        subCategories: parentCategory.subCategories,
        species: species,
        populated: parentCategory.populated,
        expanded: parentCategory.expanded,
        selected: parentCategory.selected,
        onSelectSpecies: parentCategory.onSelectSpecies
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
            expanded: false,
            onSelectSpecies: category.onSelectSpecies
        }
    }));
    const species = speciesData.map(x => {
        return {
            data: x
        }
    });
    return {
        data: category.data,
        categoryLevel: category.categoryLevel,
        subCategories: subCategories,
        species: species,
        populated: true,
        selected: category.selected,
        expanded: category.expanded,
        onSelectSpecies: category.onSelectSpecies
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
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export interface TaxonomySpeciesState {
    data: SpeciesData;
}
