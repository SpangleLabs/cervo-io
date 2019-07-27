import {AnimalData} from "./animalData";
import {TaxonomyView} from "./taxonomyView";
import {SelectedSpecies} from "./selectedSpecies";
import {SearchView} from "./searchView";
import {PageMap} from "./pageMap";
import {ViewSelector} from "./viewSelector";

let map: PageMap;
let googleMap: google.maps.Map;
const animalData: AnimalData = new AnimalData();
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
    category.loadSubElements(false, true).then(function() {
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

function initMap() {
    googleMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: {lat: 55, lng: -3}
    });
    map = new PageMap(googleMap);
    selection = new SelectedSpecies(animalData, map);
    selector = new ViewSelector();
    selector.initialise(animalData, selection);
}
(<any>window).initMap = initMap;