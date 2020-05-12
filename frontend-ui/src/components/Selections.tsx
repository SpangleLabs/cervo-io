import * as React from "react";
import {ViewProps} from "@cervoio/common-ui-lib/src/views";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {PostcodeEntry} from "./PostcodeEntry";
import {SelectedZoosList} from "./SelectedZoosList";
import {SelectedSpeciesList} from "./SelectedSpeciesList";

interface SelectionsProps extends ViewProps {
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    onSelectSpecies: (speciesId: number, selected?: boolean) => Promise<void>;
    onPostcodeUpdate: (e: React.FormEvent<HTMLInputElement>) => void;
    onSelectZoos: (zoo: ZooJson) => void;
    zooDistances: Map<number, number>;
    loadingDistances: boolean;
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
        />
    </>
}
