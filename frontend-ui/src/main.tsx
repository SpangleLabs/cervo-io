//import $ from "jquery";
import {AnimalData} from "./animalData";
//import {SelectedSpecies} from "./selectedSpecies";
import {PageMap} from "./pageMap";
//import {ViewSelector} from "./viewSelector";
import {Map} from "./Map";
import * as React from "react";
import {ViewSelectorComponent} from "./components/viewSelector";
import {SelectedSpeciesComponent} from "./components/selectedSpecies";
import * as ReactDOM from "react-dom";
import {ZooJson} from "../../common-lib/src/apiInterfaces";

interface MainProps {
    pageMap: PageMap;
}
interface MainState {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    selectedZoos: ZooJson[];
}

class MainComponent extends React.Component <MainProps, MainState> {
    constructor(props: MainProps) {
        super(props);
        this.state = {animalData: new AnimalData(), selectedSpeciesIds: [], selectedZoos: []};
        this.onSelectSpecies = this.onSelectSpecies.bind(this);
    }

    onSelectSpecies(speciesId: number, selected?: boolean) {
        if(selected == undefined) {
            // Toggle species
            if(this.containsSpecies(speciesId)) {
                this.setState((state) => { return {selectedSpeciesIds: state.selectedSpeciesIds.filter((id) => speciesId != id)}});
            } else {
                this.setState((state) => { return {selectedSpeciesIds: state.selectedSpeciesIds.concat(speciesId)}});
            }
        } else if(selected) {
            // Add species
            if(!this.containsSpecies(speciesId)) {
                this.setState((state) => { return {selectedSpeciesIds: state.selectedSpeciesIds.concat(speciesId)}});
            }
        } else {
            // Remove species
            if(this.containsSpecies(speciesId)) {
                this.setState((state) => { return {selectedSpeciesIds: state.selectedSpeciesIds.filter((id) => speciesId != id)}});
            }
        }
        this.updateSelectedZoos().then();
    }

    async updateSelectedZoos() {
        const selectedSpecies = this.state.selectedSpeciesIds.map((speciesId) => this.state.animalData.species.get(speciesId));
        const selectedZooses = await Promise.all(selectedSpecies.map((species) => species.getZooList()));
        let selectedZoos: ZooJson[] = [];
        for (const zooList of selectedZooses) {
            selectedZoos = selectedZoos.concat(zooList);
        }
        this.setState({selectedZoos: selectedZoos});
        this.updateZooMapMarkers(selectedZoos);
    }

    updateZooMapMarkers(selectedZoos: ZooJson[]) {
        this.props.pageMap.hideAllMarkers(selectedZoos.map(x => String(x.zoo_id)));
        selectedZoos.forEach(x => this.props.pageMap.getZooMarker(x).setVisible(true));
    }

    containsSpecies(speciesId: number): boolean {
        return this.state.selectedSpeciesIds.includes(speciesId);
    }

    render() {
        return <>
            <a href="faq.html">Frequently asked questions, privacy policy, and terms & conditions</a><br />
            <h1>Select which species you are interested in</h1>
            <ViewSelectorComponent
                selectedSpeciesIds={this.state.selectedSpeciesIds}
                onSelectSpecies={this.onSelectSpecies}
                animalData={this.state.animalData}
            />
            <SelectedSpeciesComponent
                selectedSpeciesIds={this.state.selectedSpeciesIds}
                onSelectSpecies={this.onSelectSpecies}
                animalData={this.state.animalData}
                selectedZoos={this.state.selectedZoos}
                pageMap={this.props.pageMap}
            />
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
