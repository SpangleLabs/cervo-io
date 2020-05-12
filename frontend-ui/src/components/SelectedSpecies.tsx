import * as React from "react";
import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {SelectedSpeciesResult} from "./SelectedSpeciesResult";
import {PostcodeEntry} from "./PostcodeEntry";
import {SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {SelectedZoosList} from "./SelectedZoosList";

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
        <SelectedZoosList
            selectedZoos={props.selectedZoos}
            onSelectZoos={props.onSelectZoos}
            zooDistances={props.zooDistances}
            loadingDistances={props.loadingDistances}
        />
    </>
}
