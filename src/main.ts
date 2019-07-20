import config from "./config";
import $ from "jquery";

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

/**
 * Wrapper around the google maps Map class, having handy methods and caches
 */
class PageMap {
    googleMap: google.maps.Map;
    cacheZooMarkers: {[key: string] : google.maps.Marker};
    cacheZooInfoWindows: {[key: string] : google.maps.InfoWindow};

    constructor(googleMap: google.maps.Map) {
        this.googleMap = googleMap;
        this.cacheZooMarkers = {};
        this.cacheZooInfoWindows = {};
    }

    /**
     * Creates a new google maps marker for a given zoo and saves to cache
     * @param zooData data object of the zoo
     */
    getZooMarker(zooData: ZooJson): google.maps.Marker {
        const zooId: number = zooData.zoo_id;
        const zooKey: string = zooId.toString();
        if (!this.cacheZooMarkers[zooKey]) {
            this.cacheZooMarkers[zooKey] = new google.maps.Marker({
                position: new google.maps.LatLng(zooData.latitude, zooData.longitude),
                map: this.googleMap,
                title: zooData.name
            });
            const self = this;
            this.cacheZooMarkers[zooKey].addListener("click", function () {
                self.getZooInfoWindow(zooId).open(self.googleMap, self.cacheZooMarkers[zooKey]);
            });
        }
        return this.cacheZooMarkers[zooKey];
    }

    getZooInfoWindow(zooId: number): google.maps.InfoWindow {
        const zooKey: string = zooId.toString();
        if (!this.cacheZooInfoWindows[zooKey]) {
            this.cacheZooInfoWindows[zooKey] = new google.maps.InfoWindow({
                content: "⏳"
            });
            const self = this;
            promiseGet("zoos/" + zooId).then(function (zoosData: FullZooJson[]) {
                const zooData = zoosData[0];
                let infoContent = `<h1>${zooData.name}</h1>
                        <a href='${zooData.link}'>${zooData.link}</a><br />
                        <span style='font-weight: bold'>Postcode:</span> ${zooData.postcode}<br />
                        <h2>Species:</h2>
                        <ul class='zoo_species'>`;
                for (let zooSpecies of zooData.species) {
                    infoContent += `<li class='zoo_species zoo_species_${zooSpecies.species_id}'>${zooSpecies.common_name} <span class='latin_name'>${zooSpecies.latin_name}</span>`;
                }
                infoContent += "</ul>";
                self.cacheZooInfoWindows[zooKey].setContent(infoContent);
            });
        }
        return this.cacheZooInfoWindows[zooKey];
    }

    userToggleInfoWindow(zooId: number): void {
        const zooKey: string = zooId.toString();
        for (let zooInfoWindowId in this.cacheZooInfoWindows) {
            if (zooInfoWindowId !== zooKey) {
                this.cacheZooInfoWindows[zooInfoWindowId].close();
            }
        }
        for (let zooInfoWindowId in this.cacheZooInfoWindows) {
            if (zooInfoWindowId !== zooKey) {
                this.cacheZooInfoWindows[zooInfoWindowId].close();
            }
        }
        this.getZooInfoWindow(zooId).open(this.googleMap, this.cacheZooMarkers[zooKey]);
    }

    hideAllMarkers(): void {
        // Hide all info windows, except those for zoos currently selected.
        for (let zooKey in this.cacheZooInfoWindows) {
            if (!selection.selectedZooIds.includes(zooKey)) {
                this.cacheZooInfoWindows[zooKey].close();
            }
        }
        // Hide all markers
        for (let zooKey in map.cacheZooMarkers) {
            map.cacheZooMarkers[zooKey].setVisible(false);
        }
        // Unbold species in any zoo marker info windows?
        $("li.zoo_species").removeClass("selected_species");
    }
}

/**
 * Store data about known species
 */
class AnimalData {
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
class SpeciesData {
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

class View {
    rootElem: JQuery<HTMLElement>;

    constructor(rootElem: JQuery<HTMLElement>) {
        this.rootElem = rootElem;
    }
}

/**
 * Load and create base taxonomy categories, cache category levels, categories and taxonomy species
 */
class TaxonomyView extends View {
    cacheCategoryLevel: CategoryLevelJson[];
    categories: {[key: string]: TaxonomyCategory};
    species: {[key: string]: TaxonomySpecies};

    constructor() {
        super($("#animals-taxonomic"));
        this.cacheCategoryLevel = [];
        this.categories = {};
        this.species = {};

        this.rootElem.append(spinner);

        const categoryLevelsPromise = promiseGet("category_levels/");
        const firstCategoryPromise = promiseGet("categories/");
        const self = this;
        Promise.all([categoryLevelsPromise, firstCategoryPromise]).then(function (data: [CategoryLevelJson[], CategoryJson[]]) {
            self.cacheCategoryLevel = data[0];
            const categoryData: CategoryJson[] = data[1];
            for (const itemData of categoryData) {
                const newCategory: TaxonomyCategory = new TaxonomyCategory(itemData, self);
                self.rootElem.find("img.spinner").remove();
                newCategory.loadSubElements(true, false);
            }
        }, function(err) {
            console.log(err);
            self.rootElem.find("img.spinner").remove();
            self.rootElem.append("<span class=\"error\">Failed to connect to API</span>");
        });
    }

    getCategoryLevel(id: number): CategoryLevelJson | null {
        let result = null;
        for (const val of this.cacheCategoryLevel) {
            if (val.category_level_id === id) {
                result = val;
            }
        }
        return result;
    }
}

/**
 * Displays a taxonomy category, in correct location.
 * If necessary, load subcategories and species, potentially recursively.
 * Select/unselect self. Add/remove child species from selection.
 */
class TaxonomyCategory {
    taxonomyView: TaxonomyView;
    id: number;
    name: string;
    levelName: string;
    parentCategoryId: number | null;
    parentCategory: TaxonomyCategory | null;
    selected: boolean;
    uiElement: JQuery<HTMLElement>;
    isOdd: boolean;
    childCategories: TaxonomyCategory[] | null;
    childSpecies: TaxonomySpecies[] | null;

    constructor(categoryData: CategoryJson, taxonomyView: TaxonomyView) {
        this.taxonomyView = taxonomyView;
        this.id = categoryData.category_id;
        this.name = categoryData.name;
        this.levelName = taxonomyView.getCategoryLevel(categoryData.category_level_id).name;
        this.parentCategoryId = categoryData.parent_category_id;
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
        taxonomyView.categories[this.id] = this;
    }

    render(): JQuery<HTMLElement> {
        const categoryLiId: string = "category-" + this.id;
        const parentUI: JQuery<HTMLElement> = this.parentCategory == null ? $("#animals-taxonomic") : this.parentCategory.uiElement.find("ul");
        parentUI.append(
            `<li class='category closed ${this.selected ? "selected" : ""}' id='${categoryLiId}'>
                <span onclick='userExpandCategory(${this.id})'>
                <span class='category_name'>${this.name}</span>
                <span class='category_level'>${this.levelName}</span>
                </span>
                <span class='selector' onclick='userSelectCategory(${this.id})'>
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
        this.uiElement.append(spinner);
        let populatedCategoriesPromise = Promise.resolve([]);
        const self = this;
        if (!this.isPopulated()) {
            self.childCategories = [];
            self.childSpecies = [];
            populatedCategoriesPromise = promiseGet("categories/" + this.id).then(function (categoryObjs: FullCategoryJson[]) {
                const categoryObj = categoryObjs[0];
                // Add base list element
                self.uiElement.append(`<ul class='${self.isOdd ? "even" : "odd"}' style='display: none;'></ul>`);
                // Add subcategories
                for (const itemData of categoryObj.sub_categories) {
                    new TaxonomyCategory(itemData, self.taxonomyView);
                }
                // Add species in category
                for (const itemData of categoryObj.species) {
                    new TaxonomySpecies(itemData, self.taxonomyView);
                }
                // If category contains only 1 subcategory, open the subcategory. (or if recursive is specified)
                let loadCategoryPromises = [];
                if (self.childCategories.length === 1 || recursive) {
                    for(const subCategory of self.childCategories) {
                        loadCategoryPromises.push(subCategory.loadSubElements(expand, recursive));
                    }
                }
                return Promise.all(loadCategoryPromises);
            });
        } else if (recursive) {
            let loadCategoryPromises = [];
            for(const subCategory of self.childCategories) {
                loadCategoryPromises.push(subCategory.loadSubElements(expand, recursive));
            }
            populatedCategoriesPromise = Promise.all(loadCategoryPromises);
        }
        return populatedCategoriesPromise.then(function () {
            if (expand) {
                self.expand();
            }
            self.uiElement.find("img.spinner").remove();
        });
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
                    selection.addSpecies(childSpecies.data.id);
                } else {
                    selection.removeSpecies(childSpecies.data.id);
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

    constructor(speciesData: SpeciesJson, taxonomyView: TaxonomyView) {
        this.data = animalData.getOrCreateSpecies(speciesData);
        this.taxonomyView = taxonomyView;

        this.parentCategory = this.taxonomyView.categories[this.data.parentCategoryId];
        const categorySelected: boolean = this.parentCategory.uiElement.hasClass("selected");
        const alreadySelected: boolean = selection.containsSpecies(this.data.id);
        this.uiElement = this.render(categorySelected || alreadySelected);

        // Add self to parent category and taxonomyView dict
        this.taxonomyView.species[this.data.id] = this; // this is fine
        // If selected, add to selection:
        if(categorySelected) {
            selection.addSpecies(this.data.id);
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

/**
 * Store list of selected species, and update their selected status as appropriate. Get list of zoos for them
 */
class Selection {
    selectedSpeciesIds: number[];
    selectedZooIds: string[];
    updating: boolean;
    triedAgain: boolean;

    constructor() {
        this.selectedSpeciesIds = [];
        this.selectedZooIds = [];
        this.updating = false;
        this.triedAgain = false;
    }

    toggleSpecies(speciesId: number): void {
        if(this.containsSpecies(speciesId)) {
            this.removeSpecies(speciesId);
        } else {
            this.addSpecies(speciesId);
        }
    }

    addSpecies(speciesId: number) {
        // Add to list
        if(!this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.push(speciesId);
        }
        // Update species in listings
        const speciesUI = $(`.species-${speciesId}`);
        const checkbox = speciesUI.find("span.selector img");
        checkbox.attr("src", "images/box_checked.svg");
        checkbox.attr("alt", "✔");
        speciesUI.addClass("selected");
        // Update selection section
        this.update();
    }

    removeSpecies(speciesId: number) {
        // Remove species from list
        if(this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.splice(this.selectedSpeciesIds.indexOf(speciesId), 1);
        }
        // Update species in listings
        const speciesUI = $(`.species-${speciesId}`);
        const checkbox = speciesUI.find("span.selector img");
        checkbox.attr("src", "images/box_unchecked.svg");
        checkbox.attr("alt", "➕");
        speciesUI.removeClass("selected");
        // Update selection section
        this.update();
    }

    containsSpecies(speciesId: number): boolean {
        return this.selectedSpeciesIds.indexOf(speciesId) !== -1;
    }

    listSpeciesCurrentlyDisplayed(): number[] {
        const selectionStyle = $("#zoo_species_selected").text();
        const currentlyDisplayed = [];
        const idRegex = /li\.zoo_species_([0-9]+) /g;
        let match = idRegex.exec(selectionStyle);
        while (match != null) {
            currentlyDisplayed.push(Number(match[1]));
            match = idRegex.exec(selectionStyle);
        }
        return currentlyDisplayed;
    }

    update() {
        if (this.updating) {
            this.triedAgain = true;
            return;
        }
        this.triedAgain = false;
        if (arrayEquals(this.selectedSpeciesIds, this.listSpeciesCurrentlyDisplayed())) {
            return;
        }
        this.updating = true;
        //this.selectedSpeciesIds = [];
        this.selectedZooIds = [];
        // This is for styling selected species in zoo info windows.
        let zooSpeciesSelected = $("#zoo_species_selected");
        zooSpeciesSelected.empty();
        let speciesDataPromises: Promise<{[key: string]: ZooJson}>[] = [];
        // Update style for selected species, and get list of promises for zoo data
        for(const speciesId of this.selectedSpeciesIds) {
            const species = animalData.species[speciesId];
            zooSpeciesSelected.append(`li.zoo_species_${speciesId} { font-weight:bold; }`);
            //self.selectedSpeciesIds.push(speciesId);
            // Generate promises returning dict of zoo id to zoos
            speciesDataPromises.push(species.getZooList().then(function(zooList: ZooJson[]) {
                let selectedZoos: {[key: string]: ZooJson} = {};
                for (const zooData of zooList) {
                    const zooKey = zooData.zoo_id.toString();
                    selectedZoos[zooKey] = zooData;
                }
                return selectedZoos;
            }));
        }
        // Update the selected species list
        const selectedSpeciesElem = $("#selected-species");
        selectedSpeciesElem.empty();
        for(const speciesId of this.selectedSpeciesIds) {
            const species = animalData.species[speciesId];
            selectedSpeciesElem.append(`<li>
<span class='selector' onclick='userSelectSpecies(${speciesId})'>
    <span class="species_name">${species.commonName}</span>
    <span class="latin_name">${species.latinName}</span>
    <img src="../images/box_checked.svg" alt="$✔"/>
</span>
</li>`);
        }
        // Update selected species count
        $("#selected-species-count").text(` (${this.selectedSpeciesIds.length})`);
        // Wait for all species zoo lists to have been retrieved
        const self = this;
        Promise.all(speciesDataPromises).then(function(selectedZooList: {[key: string]: ZooJson}[]) {
            // Merge the list of zoo lists into one object
            const selectedZoos: {[key: string]: ZooJson} = Object.assign({}, ...selectedZooList);
            // Update zoos selected
            let selectedZoosElem = $("#selected-zoos");
            selectedZoosElem.empty();
            self.selectedZooIds = Object.keys(selectedZoos);
            // Update count of zoos
            $("#selected-zoos-count").text(` (${self.selectedZooIds.length})`);
            // Update the list, and map markers
            map.hideAllMarkers();
            for (const zooKey in selectedZoos) {
                const zooData = selectedZoos[zooKey];
                selectedZoosElem.append(`<li id='selected-zoo-${zooData.zoo_id}' onclick='map.userToggleInfoWindow(${zooData.zoo_id})'>${zooData.name} <span class='distance'></span></li>`);
                const marker = map.getZooMarker(zooData);
                marker.setVisible(true);
            }
            return updateZooDistances();
        }).then(function() {
            self.updating = false;
            // Update again, in case user has changed it while we've been updating
            if (self.triedAgain) self.update();
        });
    }
}

/**
 * Create and store list of AlphabetLetter objects
 */
class AlphabetView extends View {
    letters: {[key: string]: AlphabetLetter};
    updating: boolean;
    latestLetter: string | null;

    constructor() {
        super($("#animals-alphabetic"));
        this.letters = {};
        let odd = true;
        for (const letter of "abcdefghijklmnopqrstuvwxyz") {
            this.letters[letter] = new AlphabetLetter(this, letter, odd);
            odd = !odd;
        }
        // Whether it is currently updating, for debouncing
        this.updating = false;
        // Latest letter loaded, for debouncing
        this.latestLetter = null;
        // Get the list of valid first letters, and update the invalid ones.
        const self = this;
        promiseGet("/species/valid_first_letters").then(function(letters) {
            for (const letter of Object.keys(self.letters)) {
                if (!letters.includes(letter.toUpperCase())) {
                    self.letters[letter].disable();
                }
            }
        });
    }
}

/**
 * Get list of species matching letter, display/hide them.
 */
class AlphabetLetter {
    letter: string;
    alphabetView: AlphabetView;
    rootElem: JQuery<HTMLElement>;
    letterListElem: JQuery<HTMLElement>;
    letterResultsElem: JQuery<HTMLElement>;
    letterElem: JQuery<HTMLElement>;
    animals: SpeciesJson[] | null;

    constructor(alphabetView: AlphabetView, letter: string, odd: boolean) {
        this.letter = letter;
        this.alphabetView = alphabetView;
        this.rootElem = alphabetView.rootElem;
        this.letterListElem = $("#letter-list");
        this.letterResultsElem = $("ul#letter-results");
        this.letterListElem.append(`<span id='letter-list-${letter}' class='letter-list ${odd ? "odd" : "even"}'>${letter.toUpperCase()}</span>`);
        this.letterElem = $(`#letter-list-${letter}`);
        this.letterElem.click($.proxy(this.userClick, this));
        // Cache of animal list for this letter
        this.animals = null;
    }

    userClick() {
        if(this.alphabetView.updating) {
            this.alphabetView.latestLetter = this.letter;
            return;
        }
        this.alphabetView.updating = true;
        this.alphabetView.latestLetter = this.letter;
        this.letterResultsElem.empty();
        this.alphabetView.rootElem.find(".letter-list").removeClass("selected");
        this.letterElem.addClass("selected");
        const self = this;
        this.rootElem.append(spinner);
        if(this.animals == null) {
            promiseGet(`species/?common_name=${this.letter}%25`).then(function(animals: SpeciesJson[]) {
                self.animals = animals;
                self.renderList(animals);
                self.alphabetView.updating = false;
                if(self.alphabetView.latestLetter !== self.letter) {
                    self.alphabetView.letters[self.alphabetView.latestLetter].userClick();
                }
            });
        } else {
            this.renderList(this.animals);
            this.alphabetView.updating = false;
            if(self.alphabetView.latestLetter !== self.letter) {
                self.alphabetView.letters[self.alphabetView.latestLetter].userClick();
            }
        }
    }

    renderList(animals: SpeciesJson[]) {
        for (const animal of animals) {
            const species = animalData.getOrCreateSpecies(animal);
            const speciesClass = `species-${species.id}`;
            const selected = selection.containsSpecies(species.id);
            this.letterResultsElem.append(`<li class="${speciesClass}">
                    <span class='selector' onclick='userSelectSpecies(${species.id})'>
                    ${species.commonName}
                        <img src="images/box_${selected ? "checked" : "unchecked"}.svg" alt="${selected ? "✔" : "➕"}️"/>
                    </span></li>`);
            this.letterElem.find(`.${speciesClass}.selector`).click(function() {userSelectSpecies(species.id)});
        }
        this.rootElem.find("img.spinner").remove();
    }

    disable() {
        this.letterElem.addClass("disabled");
        this.letterElem.off();
    }
}

/**
 * Take user input and search for species, list results (highlight search term in names).
 */
class SearchView extends View {
    searchBox: JQuery<HTMLElement>;
    searchResults: JQuery<HTMLElement>;

    constructor() {
        super($("#animals-search"));
        this.searchBox = $("input#animals-search-input");
        this.searchResults = $("ul#search-results");
    }

    updateSearchResults() {
        const value: string = <string>this.searchBox.val();
        const searchRegex = new RegExp(value, "gi");
        const replacement = `<span class='search_term'>$&</span>`;
        const self = this;
        this.rootElem.append(spinner);
        promiseGet(`species/?name=%25${value}%25`).then(function(animals) {
            self.searchResults.empty();
            for (const animal of animals) {
                const species = animalData.getOrCreateSpecies(animal);
                const speciesClass = `species-${species.id}`;
                const selected = selection.containsSpecies(species.id);
                const commonName = species.commonName.replace(searchRegex,replacement);
                const latinName = species.latinName.replace(searchRegex,replacement);
                self.searchResults.append(
                    `<li class="${speciesClass}">
<span class='selector' onclick='userSelectSpecies(${species.id})'>
    ${commonName} (<span class='latin_name'>${latinName}</span>)
    <img src="images/box_${selected ? "checked" : "unchecked"}.svg" alt="${selected ? "✔" : "➕"}️"/>
</span></li>`);
            }
            self.rootElem.find("img.spinner").remove();
        });
    }
}

/**
 * Handle (and update) which view is active
 */
class Selector {
    views: {[key: string]: View};
    viewKeys: string[];
    activeView: string | null;

    constructor() {
        this.views = {
            "taxonomical": new TaxonomyView(),
            "alphabetical": new AlphabetView(),
            "search": new SearchView()
        };
        this.viewKeys = ["taxonomical", "alphabetical", "search"];
        this.activeView = null;
        this.update();
        this.wireUpdates();
    }

    wireUpdates() {
        $("input[name=selector-type]").change($.proxy(this.update, this));
    }

    update() {
        this.activeView = <string>$('input[name=selector-type]:checked').val();
        for(const key of this.viewKeys) {
            if (this.activeView === key) {
                this.views[key].rootElem.show();
            } else {
                this.views[key].rootElem.hide();
            }
        }
    }
}
let map: PageMap;
let googleMap: google.maps.Map;
const animalData: AnimalData = new AnimalData();
let selector: Selector;
let selection: Selection = new Selection();
const spinner: string = `<img class="spinner" src="../images/spinner.svg" alt="⏳"/>`;


let cacheZooDistances: {[key: string]: {[key: string]: number}} = {};
function cacheAddZooDistances(postcode: string, zooDistanceData: ZooDistanceJson[]) {
    if (!cacheZooDistances[postcode]) {
        cacheZooDistances[postcode] = {};
    }
    for (const val of zooDistanceData) {
        cacheZooDistances[postcode][val.zoo_id] = val.metres;
    }
}

/**
 * I pulled this method from somewhere else, tbh
 * @param path API relative path
 * @returns {Promise<object>}
 */
function promiseGet(path: string): Promise<any> {
    const url = config['api_url'] + path;
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        let req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status === 200) {
                // Resolve the promise with the response text
                resolve(JSON.parse(req.responseText));
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    });
}

function arrayEquals<T>(array1: T[], array2: T[]): boolean {
    if (array1 == null || array2 == null) return false;
    if (array1.length !== array2.length) return false;
    array1.sort();
    array2.sort();
    for(let idx = 0; idx < array1.length; idx++) {
        if (array1[idx] !== array2[idx]) return false;
    }
    return true;
}

function userExpandCategory(id: number): void {
    const taxonomyView: TaxonomyView = <TaxonomyView>selector.views["taxonomical"];
    taxonomyView.categories[id].loadSubElements(true, false);
}

function userSelectCategory(categoryId: number): void {
    const taxonomyView: TaxonomyView = <TaxonomyView>selector.views["taxonomical"];
    const category = taxonomyView.categories[categoryId];
    category.select();
    category.loadSubElements(false, true).then(function() {
        //selection.update();
    });
}

function userSelectSpecies(speciesId: number): void {
    selection.toggleSpecies(speciesId);
}

function userUpdatePostcode(): void {
    updateZooDistances();
}

function userSearchButton(): void {
    const searchView: SearchView = <SearchView>selector.views["search"];
    searchView.updateSearchResults();
}

async function updateZooDistances(): Promise<void> {
    //get postcode
    let postcode: string = <string>$("input#postcode").val();
    // Basic postcode sanity check
    if (postcode.length === 0) {
        $("#invalid-postcode").hide();
        return;
    }
    if (postcode.length <= 3) {
        $("#invalid-postcode").show();
        return;
    }
    // check selected zoo list isn't empty
    if (selection.selectedZooIds.length === 0) {
        return;
    }
    //// currentSelectedZooIds;
    return promiseGetZooDistances(postcode, selection.selectedZooIds).then(function(zooDistances: ZooDistanceCache[]) {
        for (const val of zooDistances) {
            $(`#selected-zoo-${val.zoo_id} .distance`).text(`(${val.metres/1000}km)`);
        }
        domReorderZoos(zooDistances);
    })
}

function promiseGetZooDistances(postcode: string, zooKeys: string[]): Promise<ZooDistanceCache[]> {
    let zoosNeedingDistance = zooKeys;
    let foundDistances: ZooDistanceCache[] = [];
    if (cacheZooDistances[postcode]) {
        zoosNeedingDistance = [];
        for (const zooKey of zooKeys) {
            if (cacheZooDistances[postcode][zooKey]) {
                foundDistances.push({
                    zoo_id: Number(zooKey),
                    metres: cacheZooDistances[postcode][zooKey]
                });
            } else {
                zoosNeedingDistance.push(zooKey);
            }
        }
    }
    if (zoosNeedingDistance.length === 0) {
        $("#invalid-postcode").hide();
        return new Promise(function(resolve, reject) {
            resolve(foundDistances);
        })
    }
    //create url to request
    let path = `zoo_distances/${postcode}/`+zoosNeedingDistance.join(",");
    //get response
    return promiseGet(path).then(function(newDistances: ZooDistanceJson[]) {
        $("#invalid-postcode").hide();
        cacheAddZooDistances(postcode, newDistances);
        return foundDistances.concat(newDistances);
    }).catch(function(err) {
        //if response is 500, "invalid postcode"
        $("#invalid-postcode").show();
        return [];
    });
}

function domReorderZoos(distances: ZooDistanceCache[]) {
    const distancesSorted = distances.sort(function(a, b) { return b.metres - a.metres});
    for (const distance of distancesSorted) {
        const zooLi = $(`li#selected-zoo-${distance.zoo_id}`);
        zooLi.parent().prepend(zooLi);
    }
}

$(document).ready(function() {
    selector = new Selector();
});

function initMap() {
    googleMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: {lat: 55, lng: -3}
    });
    map = new PageMap(googleMap);
}
