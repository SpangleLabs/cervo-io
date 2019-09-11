import * as React from "react";
import {SelectionController} from "../selectionController";


export class SelectedSpeciesComponent extends React.Component<{selectionController: SelectionController}, {postcodeError: boolean}> {
    constructor(props: {selectionController: SelectionController}) {
        super(props);
        this.state = {postcodeError: false};
    }

    render() {
        return <><h2>Selected species ({this.props.selectionController.selectedSpeciesIds.length})</h2>
            <ul>{this.props.selectionController.selectedSpeciesIds.map((e) => <li>e</li>)}</ul>
            <label>
                Enter your postcode to get distances to selected zoos:
                <input id="postcode" type="text"/>
            </label>
            <span id="invalid-postcode" className="error">Invalid postcode.</span>
            <h2>Zoos with selected species<span id="selected-zoos-count"></span></h2>
            <ul id="selected-zoos"></ul>
        </>
    }
}