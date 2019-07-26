import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import {TaxonomyView} from "./taxonomyView";
import {AlphabetView} from "./alphabetView";
import {SearchView} from "./searchView";
import $ from "jquery";
import {View} from "./views";
import {spinner} from "./utilities";

/**
 * Handle (and update) which view is active
 */
export class ViewSelector {
    views: {[key: string]: View};
    viewKeys: string[];
    activeView: string | null;

    constructor(animalData: AnimalData, selection: SelectedSpecies) {
        this.views = {
            "taxonomical": null,
            "alphabetical": new AlphabetView(animalData, selection),
            "search": new SearchView(animalData, selection)
        };
        this.viewKeys = ["taxonomical", "alphabetical", "search"];
        this.activeView = null;
        const viewSelector = this;
        this.initialiseTaxonomyView(animalData, selection).then(function() {
            viewSelector.update();
            viewSelector.wireUpdates();
        });
    }

    initialiseTaxonomyView(animalData: AnimalData, selection: SelectedSpecies): Promise<void> {
        const rootElem = $("#animals-taxonomic");
        rootElem.append(spinner);
        const viewSelector = this;
        return Promise.all([animalData.promiseCategoryLevels(), animalData.promiseBaseCategories()]).then(function (data: [CategoryLevelJson[], CategoryJson[]]) {
            viewSelector.views["taxonomical"] = new TaxonomyView(animalData, selection, data[0], data[1]);
        }, function(err) {
            console.log(err);
            rootElem.find("img.spinner").remove();
            rootElem.append("<span class=\"error\">Failed to connect to API</span>");
        });
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