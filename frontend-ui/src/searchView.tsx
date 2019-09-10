import $ from "jquery";
//import {promiseSpinner, tickboxImageElem} from "@cervoio/common-ui-lib/src/utilities";
import {View} from "./views";
import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {SearchViewComponent} from "./components/searchView";


/**
 * Take user input and search for species, list results (highlight search term in names).
 */
export class SearchView extends View {

    constructor(animalData: AnimalData, selection: SelectedSpecies) {
        super($("#animals-search"), animalData, selection);
        ReactDOM.render(<SearchViewComponent animalData={animalData} selection={selection}/>, document.getElementById("animals-search"));
    }
}