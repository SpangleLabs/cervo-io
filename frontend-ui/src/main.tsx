import {AnimalData} from "./animalData";
import * as React from "react";
import {ViewSelectorComponent} from "./components/viewSelector";
import {SelectedSpeciesComponent} from "./components/selectedSpecies";
import * as ReactDOM from "react-dom";
import {FullZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {MapContainer} from "./components/pageMap";
import config from "./config";

interface MainState {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    zooDistances: Map<number, number>;
    visibleInfoWindowsZoos: FullZooJson[];
}

class MainComponent extends React.Component <{}, MainState> {
    constructor(props: {}) {
        super(props);
        this.state = {animalData: new AnimalData(), selectedSpeciesIds: [], selectedZoos: [], postcode: "", postcodeError: false, zooDistances: new Map(), visibleInfoWindowsZoos: []};
        this.onSelectSpecies = this.onSelectSpecies.bind(this);
        this.onPostcodeUpdate = this.onPostcodeUpdate.bind(this);
        this.onClickZooMarker = this.onClickZooMarker.bind(this);
        this.onCloseInfoWindow = this.onCloseInfoWindow.bind(this);
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
        if(postcode.length <= 3) {
            return;
        }
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
        await this.updateZooDistances(this.state.postcode, selectedZoos);
    }

    async onClickZooMarker(zoo: ZooJson) {
        const fullZoo = await this.state.animalData.promiseFullZoo(zoo.zoo_id);
        this.setState(function(state: MainState) {
            const zooIds = state.visibleInfoWindowsZoos.map(x => x.zoo_id);
            if(!zooIds.includes(zoo.zoo_id)) {
                const newList = state.visibleInfoWindowsZoos.concat([fullZoo]);
                return {visibleInfoWindowsZoos: newList};
            }
            return null;
        });
    }

    async onCloseInfoWindow(zoo: FullZooJson) {
        this.setState(function(state: MainState) {
            const newList = state.visibleInfoWindowsZoos.filter(x => x.zoo_id != zoo.zoo_id);
            return {visibleInfoWindowsZoos: newList};
        });
    }

    render() {
        return <>
            <div id="selector">
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
                    onSelectZoos={this.onClickZooMarker}
                    animalData={this.state.animalData}
                    selectedZoos={this.state.selectedZoos}
                    postcode={this.state.postcode}
                    postcodeError={this.state.postcodeError}
                    onPostcodeUpdate={this.onPostcodeUpdate}
                    zooDistances={this.state.zooDistances}
                />
            </div>
            <MapContainer
                selectedZoos={this.state.selectedZoos}
                google={{apiKey: (config['google_maps_key'])}}
                selectedSpeciesIds={this.state.selectedSpeciesIds}
                visibleInfoWindowsZoos={this.state.visibleInfoWindowsZoos}
                onMarkerClick={this.onClickZooMarker}
                onInfoWindowClose={this.onCloseInfoWindow}
            />
        </>
    }
}

document.addEventListener("DOMContentLoaded", function () {
    ReactDOM.render(<MainComponent />, document.getElementById("main"));
    // let mapElement = document.getElementById('map');
    //
    // GoogleMap.loadGoogleMapsApi().then(function (googleMaps: any) {
    //     const googleMap = GoogleMap.createMap(googleMaps, mapElement);
    //     const map = new PageMap(googleMap);
    //
    //
    //     // const animalData: AnimalData = new AnimalData();
    //     // //const selection = new SelectedSpecies(animalData, map);
    //     // const newSelection = new SelectionController();
    //     //
    //     // new ViewSelector(animalData, newSelection);
    //     //
    //     // new SelectedSpecies(newSelection);
    //
    //     //$("input#postcode").on("input", () => selection.updateZooDistances());
    //     //$("#animals-search form").on("submit", () => {selector.getSearchView().updateSearchResults(); return false;})
    // });
});
