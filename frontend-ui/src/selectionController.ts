
export class SelectionController {
    selectedSpeciesIds: number[];
    selectedZooIds: number[];

    constructor() {
        this.selectedSpeciesIds = [];
    }

    toggleSpecies(speciesId: number): void {
        if(this.containsSpecies(speciesId)) {
            this.removeSpecies(speciesId);
        } else {
            this.addSpecies(speciesId);
        }
    }

    addSpecies(speciesId: number) {
        if(!this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.push(speciesId);
        }
    }

    removeSpecies(speciesId: number) {
        if(this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.splice(this.selectedSpeciesIds.indexOf(speciesId), 1);
        }
    }

    containsSpecies(speciesId: number): boolean {
        return this.selectedSpeciesIds.indexOf(speciesId) !== -1;
    }
}