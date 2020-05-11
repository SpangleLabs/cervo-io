import React from "react";
import {ViewSelectorComponent} from "@cervoio/common-ui-lib/src/components/ViewSelector";
import {SelectedSpeciesComponent} from "./components/SelectedSpecies";
import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";

interface SpeciesSelectorPageProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => Promise<void>;
    onClickZooMarker: (zoo: ZooJson) => Promise<void>;
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    onPostcodeUpdate: (e: React.FormEvent<HTMLInputElement>) => Promise<void>;
    zooDistances: Map<number, number>;
    loadingDistances: boolean;
    loadingZoos: boolean;
}

export const SpeciesSelectorPage: React.FunctionComponent<SpeciesSelectorPageProps> = (props) => {
    return <div>
        <h1>Select which species you are interested in</h1>
        <ViewSelectorComponent
            animalData={props.animalData}
            selectedSpeciesIds={props.selectedSpeciesIds}
            selectableSpecies={true}
            selectableCategories={true}
            onSelectSpecies={props.onSelectSpecies}
            editableTaxonomy={false}
        />
        <SelectedSpeciesComponent
            selectedSpeciesIds={props.selectedSpeciesIds}
            onSelectSpecies={props.onSelectSpecies}
            onSelectZoos={props.onClickZooMarker}
            animalData={props.animalData}
            selectedZoos={props.selectedZoos}
            postcode={props.postcode}
            postcodeError={props.postcodeError}
            onPostcodeUpdate={props.onPostcodeUpdate}
            zooDistances={props.zooDistances}
            loadingDistances={props.loadingDistances}
            loadingZoos={props.loadingZoos}
        />
    </div>
}