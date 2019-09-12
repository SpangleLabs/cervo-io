//import $ from "jquery";
import {AnimalData} from "./animalData";
//import {SelectedSpecies} from "./selectedSpecies";
import {PageMap} from "./pageMap";
//import {ViewSelector} from "./viewSelector";
import {GoogleMap} from "./Map";
import * as React from "react";
import {ViewSelectorComponent} from "./components/viewSelector";
import {SelectedSpeciesComponent} from "./components/selectedSpecies";
import * as ReactDOM from "react-dom";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";

interface MainProps {
    pageMap: PageMap;
}
interface MainState {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    zooDistances: Map<number, number>;
}

class MainComponent extends React.Component <MainProps, MainState> {
    constructor(props: MainProps) {
        super(props);
        this.state = {animalData: new AnimalData(), selectedSpeciesIds: [], selectedZoos: [], postcode: "", postcodeError: false, zooDistances: new Map()};
        this.onSelectSpecies = this.onSelectSpecies.bind(this);
        this.onPostcodeUpdate = this.onPostcodeUpdate.bind(this);
    }

    async onSelectSpecies(speciesId: number, selected?: boolean) {
        if(selected == undefined) {
            // Toggle species
            if(this.containsSpecies(speciesId)) {
                this.setState(
                    (state) => {
                        const selectedSpeciesIds = state.selectedSpeciesIds.filter((id) => speciesId != id);
                        this.updateSelectedZoos(selectedSpeciesIds);
                        return {selectedSpeciesIds: selectedSpeciesIds}
                    });
            } else {
                this.setState(
                    (state) => {
                        const selectedSpeciesIds = state.selectedSpeciesIds.concat(speciesId);
                        this.updateSelectedZoos(selectedSpeciesIds);
                        return {selectedSpeciesIds: selectedSpeciesIds}
                    });
            }
        } else if(selected) {
            // Add species
            if(!this.containsSpecies(speciesId)) {
                this.setState(
                    (state) => {
                        const selectedSpeciesIds = state.selectedSpeciesIds.concat(speciesId);
                        this.updateSelectedZoos(selectedSpeciesIds);
                        return {selectedSpeciesIds: selectedSpeciesIds}
                    });
            }
        } else {
            // Remove species
            if(this.containsSpecies(speciesId)) {
                this.setState(
                    (state) => {
                        const selectedSpeciesIds = state.selectedSpeciesIds.filter((id) => speciesId != id);
                        this.updateSelectedZoos(selectedSpeciesIds);
                        return {selectedSpeciesIds: selectedSpeciesIds}
                    });
            }
        }
    }

    containsSpecies(speciesId: number): boolean {
        return this.state.selectedSpeciesIds.includes(speciesId);
    }

    async onPostcodeUpdate(e: React.FormEvent<HTMLInputElement>) {
        e.preventDefault();
        const postcodeEntry = e.currentTarget.value;
        this.setState({postcode: postcodeEntry});
        if(postcodeEntry.length === 0) {
            this.setState({postcodeError: false});
            return;
        }
        if(postcodeEntry.length <= 3) {
            this.setState({postcodeError: true});
            return;
        }
        await this.updateZooDistances(postcodeEntry, this.state.selectedZoos);
    }

    async updateZooDistances(postcode: string, selectedZoos: ZooJson[]) {
        try {
            const zooDistances = await this.state.animalData.promiseGetZooDistances(postcode, selectedZoos.map(zoo=>String(zoo.zoo_id)));
            const zooDistanceMap = new Map<number, number>(
                zooDistances.map(x => [x.zoo_id, x.metres])
            );
            this.setState({zooDistances: zooDistanceMap, postcodeError: false});
        } catch {
            this.setState({zooDistances: new Map(), postcodeError: postcode.length !== 0});
        }
    }

    async updateSelectedZoos(selectedSpeciesIds: number[]) {
        const selectedSpecies = selectedSpeciesIds.map((speciesId) => this.state.animalData.species.get(speciesId));
        const selectedZooses = await Promise.all(selectedSpecies.map((species) => species.getZooList()));
        let selectedZoos: ZooJson[] = [];
        for (const zooList of selectedZooses) {
            selectedZoos = selectedZoos.concat(zooList);
        }
        this.setState({selectedZoos: selectedZoos});
        this.updateZooMapMarkers(selectedZoos);
        await this.updateZooDistances(this.state.postcode, selectedZoos);
    }

    updateZooMapMarkers(selectedZoos: ZooJson[]) {
        this.props.pageMap.hideAllMarkers(selectedZoos.map(x => String(x.zoo_id)));
        selectedZoos.forEach(x => this.props.pageMap.getZooMarker(x).setVisible(true));
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
                postcode={this.state.postcode}
                postcodeError={this.state.postcodeError}
                onPostcodeUpdate={this.onPostcodeUpdate}
                zooDistances={this.state.zooDistances}
            />
        </>
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let mapElement = document.getElementById('map');

    GoogleMap.loadGoogleMapsApi().then(function (googleMaps: any) {
        const googleMap = GoogleMap.createMap(googleMaps, mapElement);
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
