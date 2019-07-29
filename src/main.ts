import {AnimalData} from "./animalData";
import {TaxonomyView} from "./taxonomyView";
import {SelectedSpecies} from "./selectedSpecies";
import {SearchView} from "./searchView";
import {PageMap} from "./pageMap";
import {ViewSelector} from "./viewSelector";
import {Map} from "./Map";

let map: PageMap;
let selector: ViewSelector;
let selection: SelectedSpecies;

function userExpandCategory(id: number): void {
    const taxonomyView: TaxonomyView = <TaxonomyView>selector.views["taxonomical"];
    taxonomyView.categories[id].loadSubElements(true, false);
}

(<any>window).userExpandCategory = userExpandCategory;

function userSelectCategory(categoryId: number): void {
    const taxonomyView: TaxonomyView = <TaxonomyView>selector.views["taxonomical"];
    const category = taxonomyView.categories[categoryId];
    category.select();
    category.loadSubElements(false, true).then(function () {
        //selection.update();
    });
}

(<any>window).userSelectCategory = userSelectCategory;

function userSelectSpecies(speciesId: number): void {
    selection.toggleSpecies(speciesId);
}

(<any>window).userSelectSpecies = userSelectSpecies;

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
