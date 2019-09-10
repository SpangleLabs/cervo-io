import $ from "jquery";
import {View} from "./views";
import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {AlphabetViewComponent} from "./components/alphabetView";


/**
 * Create and store list of AlphabetLetter objects
 */
export class AlphabetView extends View {

    constructor(animalData: AnimalData, selection: SelectedSpecies) {
        super($("#animals-alphabetic"), animalData, selection);
        ReactDOM.render(<AlphabetViewComponent animalData={animalData} selection={selection} />, document.getElementById("animals-alphabetic"));
    }
}