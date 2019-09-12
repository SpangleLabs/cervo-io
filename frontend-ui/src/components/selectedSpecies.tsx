import * as React from "react";
import {SpeciesData} from "../animalData";
import {ViewProps} from "./views";
import {TickBox} from "./tickbox";
import {ZooJson} from "../../../common-lib/src/apiInterfaces";

interface SelectedSpeciesComponentState extends ViewProps {
    selectedZooIds: number[];
}

interface SelectedSpeciesResultProps {
    species: SpeciesData;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
interface PostcodeEntryState {
    postcode: string;
    error: boolean;
}
interface SelectedZooResultProps {
    zoo: ZooJson;
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

class PostcodeEntry extends React.Component<{}, PostcodeEntryState> {
    constructor(props: {}) {
        super(props);
        this.state = {postcode: "", error: false};
        this.onUpdate = this.onUpdate.bind(this);
    }

    onUpdate(e: React.FormEvent<HTMLInputElement>) {
        e.preventDefault();
        const postcodeEntry = e.currentTarget.value;
        if(postcodeEntry.length === 0) {
            this.setState({error: false});
            return;
        }
        if(postcodeEntry.length <= 3) {
            this.setState({error: true, postcode: e.currentTarget.value});
            return;
        }
        this.setState({postcode: e.currentTarget.value})
    }

    render() {
        const errorClass = `error ${this.state.error ? "" : "hidden"}`;
        return <>
            <label>
                Enter your postcode to get distances to selected zoos:
                <input id="postcode" type="text" value={this.state.postcode} onChange={this.onUpdate} />
            </label>
            <span className={errorClass}>Invalid postcode.</span>
        </>
    }
}

class SelectedZooResult extends React.Component<SelectedZooResultProps, {}> {

    onClick() {
        //self.map.toggleInfoWindow(this.props.zoo.id);
    }

    render() {
        const onClick = this.onClick.bind(this);
        return <li>
            <span className="zoo_name clickable" onClick={onClick}>{this.props.zoo.name}</span>
            <span className="distance">?</span>
        </li>
    }
}

export class SelectedSpeciesComponent extends React.Component<SelectedSpeciesComponentState, {}> {
    constructor(props: SelectedSpeciesComponentState) {
        super(props);
    }

    render() {
        const selectedSpecies = this.props.selectedSpeciesIds.map((speciesId) => {return this.props.animalData.species.get(speciesId)});
        const selectedZoos: ZooJson[] = [];//this.props.selectedZooIds.map((zooId) => {return this.props.animalData.zoos.get(zooId)});
        return <><h2>Selected species ({this.props.selectedSpeciesIds.length})</h2>
            <ul>
                {selectedSpecies.map((species) =>
                    <SelectedSpeciesResult
                        species={species}
                        onSelectSpecies={this.props.onSelectSpecies}
                    />)
                }
            </ul>
            <PostcodeEntry />
            <h2>Zoos with selected species ({this.props.selectedZooIds.length})</h2>
            <ul id="selected-zoos">
                {selectedZoos.map((zoo) => <SelectedZooResult zoo={zoo} />)}
            </ul>
        </>
    }
}
