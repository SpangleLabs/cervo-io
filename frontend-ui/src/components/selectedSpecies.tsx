import * as React from "react";
import {SpeciesData} from "../animalData";
import {ViewProps} from "./views";
import {TickBox} from "./tickbox";
import {ZooJson} from "../../../common-lib/src/apiInterfaces";

interface SelectedSpeciesComponentProps extends ViewProps {
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    onPostcodeUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    onSelectZoos: (zoo: ZooJson) => void;
    zooDistances: Map<number, number>;
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
    distance: number|undefined;
    onSelect: () => void;
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
    }

    render() {
        let distance = "";
        if(this.props.distance) {
            distance = `(${Math.round(this.props.distance/1000)}km)`;
        }
        return <li>
            <span className="zoo_name clickable" onClick={this.props.onSelect}>{this.props.zoo.name}</span>
            <span className="distance">{distance}</span>
        </li>
    }
}

export class SelectedSpeciesComponent extends React.Component<SelectedSpeciesComponentProps, {}> {
    constructor(props: SelectedSpeciesComponentProps) {
        super(props);
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
                postcode={this.props.postcode}
                error={this.props.postcodeError}
                onUpdate={this.props.onPostcodeUpdate}
            />
            <h2>Zoos with selected species ({this.props.selectedZoos.length})</h2>
            <ul id="selected-zoos">
                {this.props.selectedZoos.map((zoo) =>
                {
                    const onSelect = this.props.onSelectZoos.bind(null, zoo);
                    return <SelectedZooResult
                        zoo={zoo}
                        onSelect={onSelect}
                        distance={this.props.zooDistances.get(zoo.zoo_id)}
                    />
                })}
            </ul>
        </>
    }
}
