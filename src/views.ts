import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";


export class View {
    constructor(
        public rootElem: JQuery<HTMLElement>,
        public animalData: AnimalData,
        public selection: SelectedSpecies
    ) {
    }
}