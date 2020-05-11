import * as React from "react";
import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import {Spinner} from "@cervoio/common-ui-lib/src/components/images";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {SelectedSpeciesResult} from "./SelectedSpeciesResult";
import {PostcodeEntry} from "./PostcodeEntry";
import {SelectedZooResult} from "./SelectedZooResult";
import {SpeciesData} from "@cervoio/common-ui-lib/src/animalData";

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

export const SelectedSpeciesComponent: React.FunctionComponent<SelectedSpeciesComponentProps> = (props) => {
    const selectedSpecies = props.selectedSpeciesIds.map((speciesId) => {
        return props.animalData.species.get(speciesId)
    }).filter((x): x is SpeciesData => x !== undefined);
    selectedSpecies.sort(
        (a, b) => a.commonName.localeCompare(b.commonName)
    );
    return <><h2>Selected species ({props.selectedSpeciesIds.length})</h2>
        <ul>
            {selectedSpecies.map((species) =>
                <SelectedSpeciesResult
                    key={species.id}
                    species={species}
                    onSelectSpecies={props.onSelectSpecies}
                />)
            }
        </ul>
        <PostcodeEntry
            postcode={props.postcode}
            error={props.postcodeError}
            onUpdate={props.onPostcodeUpdate}
            isLoading={props.loadingDistances}
        />
        <h2>Zoos with selected species ({props.selectedZoos.length})</h2>
        {props.loadingDistances ? <Spinner/> : ""}
        <ul id="selected-zoos">
            {props.selectedZoos.map((zoo) => {
                const onSelect = props.onSelectZoos.bind(null, zoo);
                return <SelectedZooResult
                    key={zoo.zoo_id}
                    zoo={zoo}
                    onSelect={onSelect}
                    distance={props.zooDistances.get(zoo.zoo_id)}
                />
            })}
        </ul>
    </>
}
