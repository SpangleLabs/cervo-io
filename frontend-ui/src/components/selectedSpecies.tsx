import * as React from "react";
import {SpeciesData} from "../animalData";
import {ViewProps} from "./views";
import {TickBox} from "./tickbox";
import {ZooJson} from "../../../common-lib/src/apiInterfaces";
import {PageMap} from "../pageMap";

interface SelectedSpeciesComponentProps extends ViewProps {
    selectedZoos: ZooJson[];
    pageMap: PageMap;
}
interface SelectedSpeciesComponentState {
    postcode: string;
    postcodeError: boolean;
}

interface SelectedSpeciesResultProps {
    species: SpeciesData;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}
interface PostcodeEntryProps {
    postcode: string;
    onUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    error: boolean;
}
interface SelectedZooResultProps {
    zoo: ZooJson;
    pageMap: PageMap;
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

class PostcodeEntry extends React.Component<PostcodeEntryProps, {}> {
    constructor(props: PostcodeEntryProps) {
        super(props);
    }

    render() {
        const errorClass = `error ${this.props.error ? "" : "hidden"}`;
        return <>
            <label>
                Enter your postcode to get distances to selected zoos:
                <input id="postcode" type="text" value={this.props.postcode} onChange={this.props.onUpdate} />
            </label>
            <span className={errorClass}>Invalid postcode.</span>
        </>
    }
}

class SelectedZooResult extends React.Component<SelectedZooResultProps, {}> {
    constructor(props: SelectedZooResultProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.pageMap.toggleInfoWindow(this.props.zoo.zoo_id);
    }

    render() {
        const onClick = this.onClick.bind(this);
        return <li>
            <span className="zoo_name clickable" onClick={onClick}>{this.props.zoo.name}</span>
            <span className="distance">?</span>
        </li>
    }
}

export class SelectedSpeciesComponent extends React.Component<SelectedSpeciesComponentProps, SelectedSpeciesComponentState> {
    constructor(props: SelectedSpeciesComponentProps) {
        super(props);
        this.state = {postcode: "", postcodeError: false};
        this.onPostcodeUpdate = this.onPostcodeUpdate.bind(this);
    }

    onPostcodeUpdate(e: React.FormEvent<HTMLInputElement>) {
        e.preventDefault();
        const postcodeEntry = e.currentTarget.value;
        this.setState({postcode: postcodeEntry});
        if(postcodeEntry.length === 0) {
            this.setState({postcodeError: false});
            return;
        }
        if(postcodeEntry.length <= 3) {
            this.setState({postcodeError: true});
            return;
        }
    }

    render() {
        const selectedSpecies = this.props.selectedSpeciesIds.map((speciesId) => {return this.props.animalData.species.get(speciesId)});
        return <><h2>Selected species ({this.props.selectedSpeciesIds.length})</h2>
            <ul>
                {selectedSpecies.map((species) =>
                    <SelectedSpeciesResult
                        species={species}
                        onSelectSpecies={this.props.onSelectSpecies}
                    />)
                }
            </ul>
            <PostcodeEntry
                postcode={this.state.postcode}
                error={this.state.postcodeError}
                onUpdate={this.onPostcodeUpdate}
            />
            <h2>Zoos with selected species ({this.props.selectedZoos.length})</h2>
            <ul id="selected-zoos">
                {this.props.selectedZoos.map((zoo) => <SelectedZooResult zoo={zoo} pageMap={this.props.pageMap} />)}
            </ul>
        </>
    }
}
