import $ from "jquery";
import {AnimalData} from "./animalData";
import {SelectedSpecies} from "./selectedSpecies";
import {PageMap} from "./pageMap";
import {ViewSelector} from "./viewSelector";
import {Map} from "./Map";

let selector: ViewSelector;
let selection: SelectedSpecies;

document.addEventListener("DOMContentLoaded", function () {
    let mapElement = document.getElementById('map');

    Map.loadGoogleMapsApi().then(function (googleMaps: any) {
        const googleMap = Map.createMap(googleMaps, mapElement);
        const map = new PageMap(googleMap);
        const animalData: AnimalData = new AnimalData();
        selection = new SelectedSpecies(animalData, map);
        selector = new ViewSelector();
        selector.initialise(animalData, selection);

        $("input#postcode").on("input", () => selection.updateZooDistances());
        $("#animals-search form").on("submit", () => {selector.getSearchView().updateSearchResults(); return false;})
    });
});
