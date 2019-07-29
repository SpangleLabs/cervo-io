import $ from "jquery";
import {arrayEquals, promiseGet} from "./utilities";
import {AnimalData} from "./animalData";
import {PageMap} from "./pageMap";


/**
 * Store list of selected species, and update their selected status as appropriate. Get list of zoos for them
 */
export class SelectedSpecies {
    selectedSpeciesIds: number[];
    selectedZooIds: string[];
    updating: boolean;
    triedAgain: boolean;

    constructor(public animalData: AnimalData, public map: PageMap) {
        this.selectedSpeciesIds = [];
        this.selectedZooIds = [];
        this.updating = false;
        this.triedAgain = false;
    }

    toggleSpecies(speciesId: number): void {
        if(this.containsSpecies(speciesId)) {
            this.removeSpecies(speciesId);
        } else {
            this.addSpecies(speciesId);
        }
    }

    addSpecies(speciesId: number) {
        // Add to list
        if(!this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.push(speciesId);
        }
        // Update species in listings
        const speciesUI = $(`.species-${speciesId}`);
        const checkbox = speciesUI.find("span.selector img");
        checkbox.attr("src", "images/box_checked.svg");
        checkbox.attr("alt", "✔");
        speciesUI.addClass("selected");
        // Update selection section
        this.update();
    }

    removeSpecies(speciesId: number) {
        // Remove species from list
        if(this.containsSpecies(speciesId)) {
            this.selectedSpeciesIds.splice(this.selectedSpeciesIds.indexOf(speciesId), 1);
        }
        // Update species in listings
        const speciesUI = $(`.species-${speciesId}`);
        const checkbox = speciesUI.find("span.selector img");
        checkbox.attr("src", "images/box_unchecked.svg");
        checkbox.attr("alt", "➕");
        speciesUI.removeClass("selected");
        // Update selection section
        this.update();
    }

    containsSpecies(speciesId: number): boolean {
        return this.selectedSpeciesIds.indexOf(speciesId) !== -1;
    }

    listSpeciesCurrentlyDisplayed(): number[] {
        const selectionStyle = $("#zoo_species_selected").text();
        const currentlyDisplayed = [];
        const idRegex = /li\.zoo_species_([0-9]+) /g;
        let match = idRegex.exec(selectionStyle);
        while (match != null) {
            currentlyDisplayed.push(Number(match[1]));
            match = idRegex.exec(selectionStyle);
        }
        return currentlyDisplayed;
    }

    update() {
        if (this.updating) {
            this.triedAgain = true;
            return;
        }
        this.triedAgain = false;
        if (arrayEquals(this.selectedSpeciesIds, this.listSpeciesCurrentlyDisplayed())) {
            return;
        }
        this.updating = true;
        //this.selectedSpeciesIds = [];
        this.selectedZooIds = [];
        // This is for styling selected species in zoo info windows.
        let zooSpeciesSelected = $("#zoo_species_selected");
        zooSpeciesSelected.empty();
        let speciesDataPromises: Promise<{[key: string]: ZooJson}>[] = [];
        // Update style for selected species, and get list of promises for zoo data
        for(const speciesId of this.selectedSpeciesIds) {
            const species = this.animalData.species.get(speciesId);;
            zooSpeciesSelected.append(`li.zoo_species_${speciesId} { font-weight:bold; }`);
            //self.selectedSpeciesIds.push(speciesId);
            // Generate promises returning dict of zoo id to zoos
            speciesDataPromises.push(species.getZooList().then(function(zooList: ZooJson[]) {
                let selectedZoos: {[key: string]: ZooJson} = {};
                for (const zooData of zooList) {
                    const zooKey = zooData.zoo_id.toString();
                    selectedZoos[zooKey] = zooData;
                }
                return selectedZoos;
            }));
        }
        // Update the selected species list
        const selectedSpeciesElem = $("#selected-species");
        selectedSpeciesElem.empty();
        for(const speciesId of this.selectedSpeciesIds) {
            const species = this.animalData.species.get(speciesId);
            selectedSpeciesElem.append(`<li>
<span class='selector' onclick='userSelectSpecies(${speciesId})'>
    <span class="species_name">${species.commonName}</span>
    <span class="latin_name">${species.latinName}</span>
    <img src="images/box_checked.svg" alt="✔"/>
</span>
</li>`);
        }
        // Update selected species count
        $("#selected-species-count").text(` (${this.selectedSpeciesIds.length})`);
        // Wait for all species zoo lists to have been retrieved
        const self = this;
        Promise.all(speciesDataPromises).then(function(selectedZooList: {[key: string]: ZooJson}[]) {
            // Merge the list of zoo lists into one object
            const selectedZoos: {[key: string]: ZooJson} = Object.assign({}, ...selectedZooList);
            // Update zoos selected
            let selectedZoosElem = $("#selected-zoos");
            selectedZoosElem.empty();
            self.selectedZooIds = Object.keys(selectedZoos);
            // Update count of zoos
            $("#selected-zoos-count").text(` (${self.selectedZooIds.length})`);
            // Update the list, and map markers
            self.map.hideAllMarkers(self.selectedZooIds);
            for (const zooKey in selectedZoos) {
                const zooData = selectedZoos[zooKey];
                selectedZoosElem.append(`<li id='selected-zoo-${zooData.zoo_id}' onclick='userToggleInfoWindow(${zooData.zoo_id})'>${zooData.name} <span class='distance'></span></li>`);
                const marker = self.map.getZooMarker(zooData);
                marker.setVisible(true);
            }
            console.log("Updates zoo list");
            return self.updateZooDistances();
        }).then(function() {
            self.updating = false;
            // Update again, in case user has changed it while we've been updating
            if (self.triedAgain) self.update();
        });
    }

    async updateZooDistances(): Promise<void> {
        //get postcode
        let postcode: string = <string>$("input#postcode").val();
        // Basic postcode sanity check
        if (postcode.length === 0) {
            $("#invalid-postcode").hide();
            return;
        }
        if (postcode.length <= 3) {
            $("#invalid-postcode").show();
            return;
        }
        // check selected zoo list isn't empty
        if (this.selectedZooIds.length === 0) {
            return;
        }
        //// currentSelectedZooIds;
        const self = this;
        return this.promiseGetZooDistances(postcode, this.selectedZooIds).then(function(zooDistances: ZooDistanceCache[]) {
            for (const val of zooDistances) {
                $(`#selected-zoo-${val.zoo_id} .distance`).text(`(${val.metres/1000}km)`);
            }
            self.domReorderZoos(zooDistances);
        })
    }

    promiseGetZooDistances(postcode: string, zooKeys: string[]): Promise<ZooDistanceCache[]> {
        let zoosNeedingDistance = zooKeys;
        let foundDistances: ZooDistanceCache[] = [];
        if (this.cacheZooDistances[postcode]) {
            zoosNeedingDistance = [];
            for (const zooKey of zooKeys) {
                if (this.cacheZooDistances[postcode][zooKey]) {
                    foundDistances.push({
                        zoo_id: Number(zooKey),
                        metres: this.cacheZooDistances[postcode][zooKey]
                    });
                } else {
                    zoosNeedingDistance.push(zooKey);
                }
            }
        }
        if (zoosNeedingDistance.length === 0) {
            $("#invalid-postcode").hide();
            return new Promise(function(resolve, reject) {
                resolve(foundDistances);
            })
        }
        //create url to request
        let path = `zoo_distances/${postcode}/`+zoosNeedingDistance.join(",");
        //get response
        const self = this;
        return promiseGet(path).then(function(newDistances: ZooDistanceJson[]) {
            $("#invalid-postcode").hide();
            self.cacheAddZooDistances(postcode, newDistances);
            return foundDistances.concat(newDistances);
        }).catch(function(err) {
            //if response is 500, "invalid postcode"
            $("#invalid-postcode").show();
            return [];
        });
    }

    domReorderZoos(distances: ZooDistanceCache[]) {
        const distancesSorted = distances.sort(function(a, b) { return b.metres - a.metres});
        for (const distance of distancesSorted) {
            const zooLi = $(`li#selected-zoo-${distance.zoo_id}`);
            zooLi.parent().prepend(zooLi);
        }
    }

    cacheZooDistances: {[key: string]: {[key: string]: number}} = {};
    cacheAddZooDistances(postcode: string, zooDistanceData: ZooDistanceJson[]) {
        if (!this.cacheZooDistances[postcode]) {
            this.cacheZooDistances[postcode] = {};
        }
        for (const val of zooDistanceData) {
            this.cacheZooDistances[postcode][val.zoo_id] = val.metres;
        }
    }
}
