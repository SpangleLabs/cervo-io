import React from "react";
import {SpeciesData} from "../../animalData";
import {SelectableSpeciesEntry} from "../speciesEntry/SelectableSpeciesEntry";

interface SearchResultProps {
    searchTerm: string;
    species: SpeciesData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const SearchResult: React.FunctionComponent<SearchResultProps> = (props) => {
    return <SelectableSpeciesEntry
        species={props.species}
        selectedSpeciesIds={props.selectedSpeciesIds}
        showLatinName={true}
        onSelectSpecies={props.onSelectSpecies}
        searchTerm={props.searchTerm}
    />
}