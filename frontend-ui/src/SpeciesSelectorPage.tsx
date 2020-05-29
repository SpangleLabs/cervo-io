import React from "react";
import {ViewSelectorComponent} from "@cervoio/common-ui-lib/src/components/ViewSelector";
import {Selections} from "./components/Selections";
import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";

const styles = require("./SpeciesSelectorPage.css")

interface SpeciesSelectorPageProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
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
        <h1 className={styles.select_title}>
            Find zoos by species
        </h1>
        <ViewSelectorComponent
            animalData={props.animalData}
            selectedSpeciesIds={props.selectedSpeciesIds}
            onSelectSpecies={props.onSelectSpecies}
            selectableSpecies={true}
            selectableCategories={true}
            editableTaxonomy={false}
        />
        <Selections
            animalData={props.animalData}
            selectedSpeciesIds={props.selectedSpeciesIds}
            onSelectSpecies={props.onSelectSpecies}

            postcode={props.postcode}
            postcodeError={props.postcodeError}
            onPostcodeUpdate={props.onPostcodeUpdate}
            loadingDistances={props.loadingDistances}

            selectedZoos={props.selectedZoos}
            onSelectZoos={props.onClickZooMarker}
            zooDistances={props.zooDistances}

            loadingZoos={props.loadingZoos}
        />
    </div>
}