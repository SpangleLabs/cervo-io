import React from "react";
import {SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import {SelectableSpeciesEntry} from "@cervoio/common-ui-lib/src/components/speciesEntry/SelectableSpeciesEntry";

interface SelectedSpeciesResultProps {
    species: SpeciesData;
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}

export const SelectedSpeciesResult: React.FunctionComponent<SelectedSpeciesResultProps> = (props) => {
    return <SelectableSpeciesEntry
        species={props.species}
        showLatinName={true}
        selectedSpeciesIds={[props.species.id]}
        onSelectSpecies={props.onSelectSpecies}
    />
}
