import {AnimalData} from "@cervoio/common-ui-lib/src/animalData";

export interface ViewProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}