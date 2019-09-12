import * as React from "react";

interface SelectedSpeciesProps {
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
interface SelectedSpeciesState {
    postcodeError: boolean;
}

export class SelectedSpeciesComponent extends React.Component<SelectedSpeciesProps, SelectedSpeciesState> {
    constructor(props: SelectedSpeciesProps) {
        super(props);
        this.state = {postcodeError: false};
    }

    render() {
        return <><h2>Selected species ({this.props.selectedSpeciesIds.length})</h2>
            <ul>{this.props.selectedSpeciesIds.map((e) => <li>{e}</li>)}</ul>
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
