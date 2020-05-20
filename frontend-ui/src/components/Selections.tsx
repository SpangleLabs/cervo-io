import React from "react";
import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {PostcodeEntry} from "./PostcodeEntry";
import {SelectedZoosList} from "./SelectedZoosList";
import {SelectedSpeciesList} from "./SelectedSpeciesList";
import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";

interface SelectionsProps extends ViewProps {
    // selected species list
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
    // postcode entry
    postcode: string;
    postcodeError: boolean;
    onPostcodeUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    loadingDistances: boolean;
    // selected zoos list
    selectedZoos: ZooJson[];
    onSelectZoos: (zoo: ZooJson) => void;
    zooDistances: Map<number, number>;

    // TODO: Not sure
    loadingZoos: boolean;
}

export const Selections: React.FunctionComponent<SelectionsProps> = (props) => {
    return <>
        <SelectedSpeciesList
            animalData={props.animalData}
            selectedSpeciesIds={props.selectedSpeciesIds}
            onSelectSpecies={props.onSelectSpecies}
        />
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
            loadingZoos={props.loadingZoos}
        />
    </>
}
