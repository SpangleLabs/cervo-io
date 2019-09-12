import * as React from "react";
import {SpeciesData} from "../animalData";
import {ViewProps} from "./views";
import {TickBox} from "./tickbox";

interface SelectedSpeciesResultProps {
    species: SpeciesData;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
interface SelectedSpeciesState {
    postcodeError: boolean;
}

export class SelectedSpeciesResult extends React.Component<SelectedSpeciesResultProps, {}> {
    constructor(props: SelectedSpeciesResultProps) {
        super(props);
    }

    render() {
        const onClick = this.props.onSelectSpecies.bind(null, this.props.species.id, false);
        return <li>
            <span className="species clickable selected" onClick={onClick}>
                <span className="species_name">{this.props.species.commonName}</span>
                <span className="latin_name">{this.props.species.latinName}</span>
                <TickBox selected={true} />
            </span>
        </li>
    }
}

export class SelectedSpeciesComponent extends React.Component<ViewProps, SelectedSpeciesState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {postcodeError: false};
    }

    render() {
        const selectedSpecies = this.props.selectedSpeciesIds.map((speciesId) => {return this.props.animalData.species.get(speciesId)});
        return <><h2>Selected species ({this.props.selectedSpeciesIds.length})</h2>
            <ul>{selectedSpecies.map((species) =>
                <SelectedSpeciesResult
                    species={species}
                    onSelectSpecies={this.props.onSelectSpecies}
                />)}</ul>
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
