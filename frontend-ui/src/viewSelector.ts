import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import {TaxonomyView} from "./taxonomyView";
import {AlphabetView} from "./alphabetView";
import {SearchView} from "./searchView";
import $ from "jquery";
import {View} from "./views";

/**
 * Handle (and update) which view is active
 */
export class ViewSelector {
    views: {[key: string]: View};
    viewKeys: string[];
    activeView: string | null;

    constructor() {
        this.views = {
            "taxonomical": null,
            "alphabetical": null,
            "search": null
        };
        this.viewKeys = ["taxonomical", "alphabetical", "search"];
        this.activeView = null;
    }

    async initialise(animalData: AnimalData, selection: SelectedSpecies): Promise<void> {
        const viewSelector = this;
        return this.initialiseViews(animalData, selection).then(function() {
            viewSelector.update();
            viewSelector.wireUpdates();
        });
    }

    async initialiseViews(animalData: AnimalData, selection: SelectedSpecies): Promise<void> {
        this.views["taxonomical"] = new TaxonomyView(animalData, selection);
        this.views["alphabetical"] = new AlphabetView(animalData, selection);
        this.views["search"] = new SearchView(animalData, selection);
    }

    wireUpdates() {
        $("input[name=selector-type]").on("change", () => this.update());
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

    getSearchView(): SearchView {
        return <SearchView>this.views["search"];
    }
}