import {AnimalData} from "../animalData";
import {SelectedSpecies} from "../selectedSpecies";

export interface ViewProps {
    animalData: AnimalData;
    selection: SelectedSpecies;
}