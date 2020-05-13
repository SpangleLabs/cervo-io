import {AnimalData, SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {FullZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {MapContainer} from "./components/map/MapContainer";
import config from "./config";
import {getAuthCookie, toggleSelectionMembership} from "@cervoio/common-ui-lib/src/utilities";
import {NavTopBar, NavTopBarOptions} from "./NavTopBar";
import {SpeciesSelectorPage} from "./SpeciesSelectorPage";

const styles = require("./style.css")

interface MainState {
    animalData: AnimalData;
    selectedSpeciesIds: number[];
    selectedZoos: ZooJson[];
    postcode: string;
    postcodeError: boolean;
    zooDistances: Map<number, number>;
    visibleInfoWindowsZoos: FullZooJson[];
    loadingDistances: boolean;
    loadingZoos: boolean;
}

class MainComponent extends React.Component <{}, MainState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            animalData: new AnimalData(getAuthCookie()),
            selectedSpeciesIds: [],
            selectedZoos: [],
            postcode: "",
            postcodeError: false,
            zooDistances: new Map(),
            visibleInfoWindowsZoos: [],
            loadingDistances: false,
            loadingZoos: false
        };
        this.onSelectSpecies = this.onSelectSpecies.bind(this);
        this.onPostcodeUpdate = this.onPostcodeUpdate.bind(this);
        this.onClickZooMarker = this.onClickZooMarker.bind(this);
        this.onCloseInfoWindow = this.onCloseInfoWindow.bind(this);
    }

    async onSelectSpecies(speciesId: number, selected?: boolean) {
        this.setState((state) => {
            const newSelection = toggleSelectionMembership(state.selectedSpeciesIds, speciesId, selected);
            this.updateSelectedZoos(newSelection);
            return {selectedSpeciesIds: newSelection}
        });
    }

    async onPostcodeUpdate(e: React.FormEvent<HTMLInputElement>) {
        e.preventDefault();
        const postcodeEntry = e.currentTarget.value;
        this.setState({postcode: postcodeEntry});
        if (postcodeEntry.length === 0) {
            this.setState({postcodeError: false});
            return;
        }
        if (postcodeEntry.length <= 3) {
            this.setState({postcodeError: true});
            return;
        }
        await this.updateZooDistances(postcodeEntry, this.state.selectedZoos);
    }

    async updateZooDistances(postcode: string, selectedZoos: ZooJson[]) {
        if (postcode.length <= 3) {
            return;
        }
        this.setState({loadingDistances: true});
        try {
            const zooDistances = await this.state.animalData.promiseGetZooDistances(postcode, selectedZoos.map(zoo => String(zoo.zoo_id)));
            const zooDistanceMap = zooDistances.reduce((map, obj) => {
                map.set(obj.zoo_id, obj.metres);
                return map
            }, new Map<number, number>());
            this.setState({zooDistances: zooDistanceMap, postcodeError: false, selectedZoos: selectedZoos});
        } catch {
            this.setState({zooDistances: new Map(), postcodeError: postcode.length !== 0});
        }
        this.setState({loadingDistances: false});
    }

    async updateSelectedZoos(selectedSpeciesIds: number[]) {
        const selectedSpecies = selectedSpeciesIds.map((speciesId) => this.state.animalData.species.get(speciesId)).filter((x): x is SpeciesData => x !== undefined);
        const selectedZooses = await Promise.all(selectedSpecies.map((species) => species.getZooList()));
        // Flatten list of lists
        let selectedZoos: ZooJson[] = [];
        for (const zooList of selectedZooses) {
            selectedZoos = selectedZoos.concat(zooList);
        }
        // Uniqueify
        selectedZoos = selectedZoos.filter(function (value, index, arr) {
            const zooIds = arr.map(x => x.zoo_id);
            return zooIds.indexOf(value.zoo_id) === index
        });
        // Set state
        this.setState({selectedZoos: selectedZoos});
        await this.updateZooDistances(this.state.postcode, selectedZoos);
    }

    async onClickZooMarker(zoo: ZooJson) {
        const fullZoo = await this.state.animalData.promiseFullZoo(zoo.zoo_id);
        this.setState(function (state: MainState) {
            const zooIds = state.visibleInfoWindowsZoos.map(x => x.zoo_id);
            if (!zooIds.includes(zoo.zoo_id)) {
                const newList = state.visibleInfoWindowsZoos.concat([fullZoo]);
                return {visibleInfoWindowsZoos: newList};
            }
            return null;
        });
    }

    async onCloseInfoWindow(zoo: FullZooJson) {
        this.setState(function (state: MainState) {
            const newList = state.visibleInfoWindowsZoos.filter(x => x.zoo_id != zoo.zoo_id);
            return {visibleInfoWindowsZoos: newList};
        });
    }

    render() {
        return <>
            <div id={styles.selector}>
                <NavTopBar selected={NavTopBarOptions.bySpecies}/>
                <SpeciesSelectorPage
                    animalData={this.state.animalData}
                    selectedSpeciesIds={this.state.selectedSpeciesIds}
                    onSelectSpecies={this.onSelectSpecies}

                    postcode={this.state.postcode}
                    postcodeError={this.state.postcodeError}
                    onPostcodeUpdate={this.onPostcodeUpdate}
                    loadingDistances={this.state.loadingDistances}

                    selectedZoos={this.state.selectedZoos}
                    onClickZooMarker={this.onClickZooMarker}
                    zooDistances={this.state.zooDistances}

                    loadingZoos={this.state.loadingZoos}
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
    ReactDOM.render(<MainComponent/>, document.getElementById("main"));
});
