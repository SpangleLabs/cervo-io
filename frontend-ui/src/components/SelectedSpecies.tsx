import * as React from "react";
import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {SelectedSpeciesResult} from "./SelectedSpeciesResult";
import {PostcodeEntry} from "./PostcodeEntry";
import {SelectedZooResult} from "./SelectedZooResult";

interface SelectedSpeciesComponentProps extends ViewProps {
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    onPostcodeUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    onSelectZoos: (zoo: ZooJson) => void;
    zooDistances: Map<number, number>;
    loadingDistances: boolean;
    loadingZoos: boolean;
}

export class SelectedSpeciesComponent extends React.Component<SelectedSpeciesComponentProps, {}> {
    constructor(props: SelectedSpeciesComponentProps) {
        super(props);
    }

    render() {
        const selectedSpecies = this.props.selectedSpeciesIds.map((speciesId) => {return this.props.animalData.species.get(speciesId)});
        selectedSpecies.sort((a, b) => a.commonName.localeCompare(b.commonName));
        return <><h2>Selected species ({this.props.selectedSpeciesIds.length})</h2>
            <ul>
                {selectedSpecies.map((species) =>
                    <SelectedSpeciesResult
                        key={species.id}
                        species={species}
                        onSelectSpecies={this.props.onSelectSpecies}
                    />)
                }
            </ul>
            <PostcodeEntry
                postcode={this.props.postcode}
                error={this.props.postcodeError}
                onUpdate={this.props.onPostcodeUpdate}
                isLoading={this.props.loadingDistances}
            />
            <h2>Zoos with selected species ({this.props.selectedZoos.length})</h2>
            {this.props.loadingDistances ? <Spinner /> : ""}
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
