import $ from "jquery";
import {promiseSpinner} from "./utilities";
import {AnimalData, CategoryData, SpeciesData} from "./animalData";
import {View} from "./views";
import {SelectedSpecies} from "./selectedSpecies";


/**
 * Load and create base taxonomy categories, cache category levels, categories and taxonomy species
 */
export class TaxonomyView extends View {
    cacheCategoryLevel: CategoryLevelJson[];
    categories: {[key: string]: TaxonomyCategory};
    species: {[key: string]: TaxonomySpecies};
    baseTaxoCategories: TaxonomyCategory[];

    constructor(animalData: AnimalData, selection: SelectedSpecies, categoryLevels: CategoryLevelJson[], baseCategories: CategoryData[]) {
        super($("#animals-taxonomic"), animalData, selection);
        this.cacheCategoryLevel = [];
        this.categories = {};
        this.species = {};

        this.cacheCategoryLevel = categoryLevels;
        this.baseTaxoCategories = [];
        for (const categoryData of baseCategories) {
            const newCategory: TaxonomyCategory = new TaxonomyCategory(categoryData, this);
            this.baseTaxoCategories.push(newCategory);
        }
    }

    expandBaseCategories(): Promise<void> {
        const self = this;
        return Promise.all(
            self.baseTaxoCategories.map(x => x.loadSubElements(true, false))
        ).then();
    }

    getCategoryLevel(id: number): CategoryLevelJson | null {
        return this.cacheCategoryLevel.find(x=>x.category_level_id === id);
    }
}

/**
 * Displays a taxonomy category, in correct location.
 * If necessary, load subcategories and species, potentially recursively.
 * Select/unselect self. Add/remove child species from selection.
 */
class TaxonomyCategory {
    taxonomyView: TaxonomyView;
    data: CategoryData;
    name: string;
    levelName: string;
    parentCategoryId: number | null;
    parentCategory: TaxonomyCategory | null;
    selected: boolean;
    uiElement: JQuery<HTMLElement>;
    isOdd: boolean;
    childCategories: TaxonomyCategory[] | null;
    childSpecies: TaxonomySpecies[] | null;

    constructor(categoryData: CategoryData, taxonomyView: TaxonomyView) {
        this.taxonomyView = taxonomyView;
        this.data = categoryData;
        this.name = categoryData.name;
        const categoryLevel = taxonomyView.getCategoryLevel(categoryData.categoryLevelId);
        this.levelName = "{unknown level}";
        if (categoryLevel) {
            this.levelName = categoryLevel.name;
        }
        this.parentCategoryId = categoryData.parentCategoryId;
        this.parentCategory = null;
        this.selected = false;
        if (this.parentCategoryId != null) {
            this.parentCategory = taxonomyView.categories[this.parentCategoryId];
            this.selected = this.parentCategory.uiElement.hasClass("selected");
            this.parentCategory.childCategories.push(this);
        }
        this.uiElement = this.render();
        this.isOdd = this.uiElement.parent("ul").hasClass("odd");
        this.childCategories = null;
        this.childSpecies = null;
        // Add self to root taxonomy view's big category dictionary
        taxonomyView.categories[this.data.id] = this;
    }

    render(): JQuery<HTMLElement> {
        const categoryLiId: string = "category-" + this.data.id;
        const parentUI: JQuery<HTMLElement> = this.parentCategory == null ? $("#animals-taxonomic") : this.parentCategory.uiElement.find("ul");
        parentUI.append(
            `<li class='category closed ${this.selected ? "selected" : ""}' id='${categoryLiId}'>
                <span onclick='userExpandCategory(${this.data.id})'>
                <span class='category_name'>${this.name}</span>
                <span class='category_level'>${this.levelName}</span>
                </span>
                <span class='selector' onclick='userSelectCategory(${this.data.id})'>
                    <img src="images/box_${this.selected ? "checked" : "unchecked"}.svg" alt="${this.selected ? "✔" : "➕"}️"/>
                </span>
                </li>`);
        return $("#" + categoryLiId);
    }

    /**
     * Returns a promise to expand this category
     * @param expand
     * @param recursive
     * @returns {Promise<Array>}
     */
    loadSubElements(expand: boolean, recursive: boolean): Promise<void> {
        let populatedCategoriesPromise: Promise<void[]> = Promise.resolve([]);
        const self = this;
        if (!this.isPopulated()) {
            self.childCategories = [];
            self.childSpecies = [];
            populatedCategoriesPromise = Promise.all([this.data.getSubCategories(), this.data.getSpecies()]).then(function (data: [CategoryData[], SpeciesData[]]) {
                const subCategories = data[0];
                const species = data[1];
                // Add base list element
                self.uiElement.append(`<ul class='${self.isOdd ? "even" : "odd"}' style='display: none;'></ul>`);
                // Add subcategories
                for (const subCategory of subCategories) {
                    new TaxonomyCategory(subCategory, self.taxonomyView);
                }
                // Add species in category
                for (const itemData of species) {
                    new TaxonomySpecies(itemData, self.taxonomyView);
                }
                // If category contains only 1 subcategory, open the subcategory. (or if recursive is specified)
                let loadCategoryPromises: Promise<void>[] = [];
                if (self.childCategories.length === 1 || recursive) {
                    for(const subCategory of self.childCategories) {
                        loadCategoryPromises.push(subCategory.loadSubElements(expand, recursive));
                    }
                }
                return Promise.all(loadCategoryPromises);
            });
        } else if (recursive) {
            let loadCategoryPromises: Promise<void>[] = self.childCategories.map(x => x.loadSubElements(expand, recursive));
            populatedCategoriesPromise = Promise.all(loadCategoryPromises);
        }
        return promiseSpinner(this.uiElement, populatedCategoriesPromise.then(function () {
            if (expand) {
                self.expand();
            }
        }));
    }

    /**
     * Checks if a category has been populated with subcategory and species data
     * @returns {boolean}
     */
    isPopulated(): boolean {
        return this.childCategories != null;
    }

    expand(): void {
        if (this.uiElement.children("ul").is(":visible")) {
            this.uiElement.find("ul").first().hide();
            this.uiElement.addClass("closed");
            this.uiElement.removeClass("open");
        } else {
            this.uiElement.find("ul").first().show();
            this.uiElement.addClass("open");
            this.uiElement.removeClass("closed");
            if (this.childCategories != null
                && this.childCategories.length === 1
                && !this.childCategories[0].uiElement.children("ul").is(":visible")) {
                this.childCategories[0].expand();
            }
        }
    }

    select(isBeingSelected?: boolean) {
        this.selected = typeof isBeingSelected === "undefined" ? !this.selected : isBeingSelected;
        const checkbox = this.uiElement.find("span.selector img");
        checkbox.attr("src", this.selected ? "images/box_checked.svg" : "images/box_unchecked.svg");
        checkbox.attr("alt", this.selected ? "✔" : "➕");
        if (this.selected) {
            this.uiElement.addClass("selected");
        } else {
            this.uiElement.removeClass("selected");
        }
        if (this.isPopulated()) {
            for (const childCategory of this.childCategories) {
                childCategory.select(this.selected);
            }
            for (const childSpecies of this.childSpecies) {
                if(this.selected) {
                    this.taxonomyView.selection.addSpecies(childSpecies.data.id);
                } else {
                    this.taxonomyView.selection.removeSpecies(childSpecies.data.id);
                }
            }
        }
    }
}

/**
 * Displays a species in the taxonomy view
 */
class TaxonomySpecies {
    data: SpeciesData;
    taxonomyView: TaxonomyView;
    parentCategory: TaxonomyCategory;
    uiElement: JQuery<HTMLElement>;

    constructor(speciesData: SpeciesData, taxonomyView: TaxonomyView) {
        this.data = speciesData;
        this.taxonomyView = taxonomyView;

        this.parentCategory = this.taxonomyView.categories[this.data.parentCategoryId];
        const categorySelected: boolean = this.parentCategory.uiElement.hasClass("selected");
        const alreadySelected: boolean = this.taxonomyView.selection.containsSpecies(this.data.id);
        this.uiElement = this.render(categorySelected || alreadySelected);

        // Add self to parent category and taxonomyView dict
        this.taxonomyView.species[this.data.id] = this; // this is fine
        // If selected, add to selection:
        if(categorySelected) {
            this.taxonomyView.selection.addSpecies(this.data.id);
        }
        this.parentCategory.childSpecies.push(this);
    }

    render(selected: boolean): JQuery<HTMLElement> {
        const speciesLiId = `species-${this.data.id}`;
        const parentUlElement = this.parentCategory.uiElement.find("ul");
        parentUlElement.append(`<li class='species ${selected ? "selected" : ""} ${speciesLiId}'>
                <span class='selector' onclick='userSelectSpecies(${this.data.id})'>
                    <span class='species_name'>${this.data.commonName} </span>
                    <span class='latin_name'>${this.data.latinName}</span>
                    <img src="images/box_${selected ? "checked" : "unchecked"}.svg" alt="${selected ? "✔" : "➕"}️"/>
                </span>
                </li>`);
        return $(`#${speciesLiId}`);
    }
}