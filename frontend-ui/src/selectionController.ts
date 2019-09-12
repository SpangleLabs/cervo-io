
export class SelectionController {
    selectedSpeciesIds: number[];
    selectedZooIds: number[];
    onUpdate: () => void;

    constructor(onUpdate: () => void) {
        this.selectedSpeciesIds = [];
        this.onUpdate = onUpdate;
    }

    toggleSpecies(speciesId: number): void {
        if(this.containsSpecies(speciesId)) {
            this.removeSpecies(speciesId);
        } else {
            this.addSpecies(speciesId);
        }
        this.onUpdate();
    }

    addSpecies(speciesId: number) {
        if(!this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.push(speciesId);
        }
        this.onUpdate();
    }

    removeSpecies(speciesId: number) {
        if(this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.splice(this.selectedSpeciesIds.indexOf(speciesId), 1);
        }
        this.onUpdate();
    }

    containsSpecies(speciesId: number): boolean {
        return this.selectedSpeciesIds.indexOf(speciesId) !== -1;
    }
}