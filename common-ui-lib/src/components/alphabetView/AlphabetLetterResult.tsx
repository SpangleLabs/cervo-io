import {SpeciesData} from "../../animalData";
import React from "react";
import {SelectableSpeciesEntry} from "../speciesEntry/SelectableSpeciesEntry";

interface AlphabetLetterResultProps {
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const AlphabetLetterResult: React.FunctionComponent<AlphabetLetterResultProps> = (props) => {
    return <SelectableSpeciesEntry
        species={props.species}
        selectedSpeciesIds={props.selectedSpeciesIds}
        showLatinName={false}
        onSelectSpecies={props.onSelectSpecies}
    />
}
