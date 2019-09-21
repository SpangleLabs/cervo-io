import {AnimalData} from "./animalData";

export interface ViewProps {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    onSelectSpecies: (speciesId: number, selected?: boolean) => void;
}