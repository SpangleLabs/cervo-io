import {AnimalData} from "./animalData";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {ViewSelectorComponent} from "./components/viewSelector";
import {SelectionController} from "./selectionController";

/**
 * Handle (and update) which view is active
 */
export class ViewSelector {

    constructor(animalData: AnimalData, selection: SelectionController) {
        ReactDOM.render(<ViewSelectorComponent animalData={animalData} selection={selection} />, document.getElementById("species-selection-wrapper"));
    }
}