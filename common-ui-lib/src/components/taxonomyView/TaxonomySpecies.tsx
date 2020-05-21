import {SpeciesData} from "../../animalData";
import React from "react";
import {HiddenStatus} from "./admin/HiddenStatus";
import {SelectableSpeciesEntry} from "../speciesEntry/SelectableSpeciesEntry";

interface TaxonomySpeciesProps {
    species: SpeciesData;
    selectedSpeciesIds?: number[];
    onSelectSpecies?: (speciesId: number) => void;
    editableTaxonomy: boolean;
    odd: boolean;
}

export const TaxonomySpecies: React.FunctionComponent<TaxonomySpeciesProps> = (props) => {
    return <SelectableSpeciesEntry
        species={props.species}
        selectedSpeciesIds={props.selectedSpeciesIds}
        showLatinName={true}
        onSelectSpecies={props.onSelectSpecies}
        odd={props.odd}
    >
        {props.editableTaxonomy && <HiddenStatus hidden={props.species.hidden}/>}
    </SelectableSpeciesEntry>
}
