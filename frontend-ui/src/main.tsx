//import $ from "jquery";
import {AnimalData} from "./animalData";
//import {SelectedSpecies} from "./selectedSpecies";
import {PageMap} from "./pageMap";
//import {ViewSelector} from "./viewSelector";
import {Map} from "./Map";
import {SelectionController} from "./selectionController";
import * as React from "react";
import {ViewSelectorComponent} from "./components/viewSelector";
import {SelectedSpeciesComponent} from "./components/selectedSpecies";
import * as ReactDOM from "react-dom";

interface MainProps {
    pageMap: PageMap;
}
interface MainState {
    animalData: AnimalData;
    selectionController: SelectionController;
    update: boolean;
}

class MainComponent extends React.Component <MainProps, MainState> {
    constructor(props: MainProps) {
        super(props);
        this.onSelectionUpdate = this.onSelectionUpdate.bind(this);
        this.state = {animalData: new AnimalData(), selectionController: new SelectionController(this.onSelectionUpdate), update: false};
    }

    onSelectionUpdate() {
        this.setState({update: true});
    }

    render() {
        return <>
            <a href="faq.html">Frequently asked questions, privacy policy, and terms & conditions</a><br />
            <h1>Select which species you are interested in</h1>
            <ViewSelectorComponent selection={this.state.selectionController} animalData={this.state.animalData} />
            <SelectedSpeciesComponent selectionController={this.state.selectionController} />
        </>
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let mapElement = document.getElementById('map');

    Map.loadGoogleMapsApi().then(function (googleMaps: any) {
        const googleMap = Map.createMap(googleMaps, mapElement);
        const map = new PageMap(googleMap);

        ReactDOM.render(<MainComponent pageMap={map} />, document.getElementById("selector"));

        // const animalData: AnimalData = new AnimalData();
        // //const selection = new SelectedSpecies(animalData, map);
        // const newSelection = new SelectionController();
        //
        // new ViewSelector(animalData, newSelection);
        //
        // new SelectedSpecies(newSelection);

        //$("input#postcode").on("input", () => selection.updateZooDistances());
        //$("#animals-search form").on("submit", () => {selector.getSearchView().updateSearchResults(); return false;})
    });
});
