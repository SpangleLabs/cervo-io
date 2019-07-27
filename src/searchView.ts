import $ from "jquery";
import {promiseSpinner} from "./utilities";
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
                self.searchResults.append(
                    `<li class="${speciesClass}">
<span class='selector' onclick='userSelectSpecies(${species.id})'>
    ${commonName} (<span class='latin_name'>${latinName}</span>)
    <img src="images/box_${selected ? "checked" : "unchecked"}.svg" alt="${selected ? "✔" : "➕"}️"/>
</span></li>`);
            }
        });
        return promiseSpinner(this.rootElem, getAndRenderResults);
    }
}