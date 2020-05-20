import {SelectedSpeciesResult} from "./SelectedSpeciesResult";
import React from "react";
import {AnimalData, SpeciesData} from "@cervoio/common-ui-lib/src/animalData";

interface SelectedSpeciesListProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const SelectedSpeciesList: React.FunctionComponent<SelectedSpeciesListProps> = (props) => {
    const selectedSpecies = props.selectedSpeciesIds.map((speciesId) => {
        return props.animalData.species.get(speciesId)
    }).filter((x): x is SpeciesData => x !== undefined);
    selectedSpecies.sort(
        (a, b) => a.commonName.localeCompare(b.commonName)
    );

    return <>
        <h2>Selected species ({props.selectedSpeciesIds.length})</h2>
        <ul>
            {selectedSpecies.map((species) =>
                <SelectedSpeciesResult
                    key={species.id}
                    species={species}
                    onSelectSpecies={props.onSelectSpecies}
                />)
            }
        </ul>
    </>
}