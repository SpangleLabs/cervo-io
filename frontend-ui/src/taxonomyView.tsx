import $ from "jquery";
import {AnimalData} from "./animalData";
import {View} from "./views";
import {SelectedSpecies} from "./selectedSpecies";
import * as ReactDOM from "react-dom";
//import {AlphabetViewComponent} from "./components/alphabetView";
import * as React from "react";
import {TaxonomyViewComponent} from "./components/taxonomyView";


/**
 * Load and create base taxonomy categories, cache category levels, categories and taxonomy species
 */
export class TaxonomyView extends View {

    constructor(animalData: AnimalData, selection: SelectedSpecies) {
        super($("#animals-taxonomic"), animalData, selection);
        ReactDOM.render(<TaxonomyViewComponent animalData={animalData} selection={selection} />, document.getElementById("animals-taxonomic"));
    }
}