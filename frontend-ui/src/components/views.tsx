import {AnimalData} from "../animalData";
import {SelectionController} from "../selectionController";

export interface ViewProps {
    animalData: AnimalData;
    selection: SelectionController;
}