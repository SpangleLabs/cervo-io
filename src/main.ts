import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import {SearchView} from "./searchView";
import {PageMap} from "./pageMap";
import {ViewSelector} from "./viewSelector";
import {Map} from "./Map";

let map: PageMap;
let selector: ViewSelector;
let selection: SelectedSpecies;

function userUpdatePostcode(): void {
    selection.updateZooDistances();
}

(<any>window).userUpdatePostcode = userUpdatePostcode;

function userSearchButton(): void {
    const searchView: SearchView = <SearchView>selector.views["search"];
    searchView.updateSearchResults();
}

(<any>window).userSearchButton = userSearchButton;

function userToggleInfoWindow(zooId: number): void {
    map.toggleInfoWindow(zooId);
}

(<any>window).userToggleInfoWindow = userToggleInfoWindow;

document.addEventListener("DOMContentLoaded", function () {
    let mapElement = document.getElementById('map');

    Map.loadGoogleMapsApi().then(function (googleMaps: any) {
        const googleMap = Map.createMap(googleMaps, mapElement);
        map = new PageMap(googleMap);
        const animalData: AnimalData = new AnimalData();
        selection = new SelectedSpecies(animalData, map);
        selector = new ViewSelector();
        selector.initialise(animalData, selection);
    });
});
