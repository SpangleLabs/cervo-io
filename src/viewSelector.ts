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

    constructor(animalData: AnimalData, selection: SelectedSpecies) {
        this.views = {
            "taxonomical": new TaxonomyView(animalData, selection),
            "alphabetical": new AlphabetView(animalData, selection),
            "search": new SearchView(animalData, selection)
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