import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {ViewSelectorComponent} from "./components/viewSelector";

/**
 * Handle (and update) which view is active
 */
export class ViewSelector {

    constructor() {
    }

    initialise(animalData: AnimalData, selection: SelectedSpecies): void {
        ReactDOM.render(<ViewSelectorComponent animalData={animalData} selection={selection} />, document.getElementById("species-selection-wrapper"));
    }
}