import $ from "jquery";
import {promiseSpinner, tickboxImageElem} from "@cervoio/common-ui-lib/src/utilities";
import {View} from "./views";
import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";


/**
 * Take user input and search for species, list results (highlight search term in names).
 */
export class SearchView extends View {
    searchBox: JQuery<HTMLElement>;
    searchResults: JQuery<HTMLElement>;

    constructor(animalData: AnimalData, selection: SelectedSpecies) {
        super($("#animals-search"), animalData, selection);
        this.searchBox = $("input#animals-search-input");
        this.searchResults = $("ul#search-results");
    }

    updateSearchResults(): Promise<void> {
        const value: string = <string>this.searchBox.val();
        const searchRegex = new RegExp(value, "gi");
        const replacement = `<span class='search_term'>$&</span>`;
        const self = this;
        const getAndRenderResults = this.animalData.promiseSearchSpecies(value).then(function(animals) {
            self.searchResults.empty();
            for (const species of animals) {
                const speciesClass = `species-${species.id}`;
                const selected = self.selection.containsSpecies(species.id);
                const commonName = species.commonName.replace(searchRegex,replacement);
                const latinName = species.latinName.replace(searchRegex,replacement);
                // Construct html elements
                const li = $("<li />").addClass(speciesClass);
                const selector = $("<span />").addClass("selector").addClass("clickable").on("click", () => self.selection.toggleSpecies(species.id));
                const commonNameElem = $("<span />").addClass("common_name").html(commonName);
                const latinNameElem = $("<span />").addClass("latin_name").html(latinName);
                const img = tickboxImageElem(selected);
                selector.append(commonNameElem, latinNameElem, img).appendTo(li);
                li.appendTo(self.searchResults);
            }
        });
        return promiseSpinner(this.rootElem, getAndRenderResults);
    }
}