import $ from "jquery";
import {promiseGet} from "./utilities";

/**
 * Wrapper around the google maps Map class, having handy methods and caches
 */
export class PageMap {
    googleMap: google.maps.Map;
    cacheZooMarkers: Map<string, google.maps.Marker>;
    cacheZooInfoWindows: Map<string, google.maps.InfoWindow>;

    constructor(googleMap: google.maps.Map) {
        this.googleMap = googleMap;
        this.cacheZooMarkers = new Map<string, google.maps.Marker>();
        this.cacheZooInfoWindows = new Map<string, google.maps.InfoWindow>();
    }

    /**
     * Creates a new google maps marker for a given zoo and saves to cache
     * @param zooData data object of the zoo
     */
    getZooMarker(zooData: ZooJson): google.maps.Marker {
        const zooId: number = zooData.zoo_id;
        const zooKey: string = zooId.toString();
        if (!this.cacheZooMarkers.has(zooKey)) {
            this.cacheZooMarkers.set(zooKey, new google.maps.Marker({
                position: new google.maps.LatLng(zooData.latitude, zooData.longitude),
                map: this.googleMap,
                title: zooData.name
            }));
            const self = this;
            this.cacheZooMarkers.get(zooKey).addListener("click", function () {
                self.getZooInfoWindow(zooId).open(self.googleMap, self.cacheZooMarkers.get(zooKey));
            });
        }
        return this.cacheZooMarkers.get(zooKey);
    }

    getZooInfoWindow(zooId: number): google.maps.InfoWindow {
        const zooKey: string = zooId.toString();
        if (!this.cacheZooInfoWindows.has(zooKey)) {
            this.cacheZooInfoWindows.set(zooKey, new google.maps.InfoWindow({
                content: "⏳"
            }));
            const self = this;
            promiseGet("zoos/" + zooId).then(function (zoosData: FullZooJson[]) {
                const zooData = zoosData[0];
                let infoContent = `<h1>${zooData.name}</h1>
                        <a href='${zooData.link}'>${zooData.link}</a><br />
                        <span style='font-weight: bold'>Postcode:</span> ${zooData.postcode}<br />
                        <h2>Species:</h2>
                        <ul class='zoo_species'>`;
                for (let zooSpecies of zooData.species) {
                    infoContent += `<li class='zoo_species zoo_species_${zooSpecies.species_id}'>${zooSpecies.common_name} <span class='latin_name'>${zooSpecies.latin_name}</span>`;
                }
                infoContent += "</ul>";
                self.cacheZooInfoWindows.get(zooKey).setContent(infoContent);
            });
        }
        return this.cacheZooInfoWindows.get(zooKey);
    }

    toggleInfoWindow(zooId: number): void {
        const zooKey: string = zooId.toString();
        for (let zooInfoWindowId of this.cacheZooInfoWindows.keys()) {
            if (zooInfoWindowId !== zooKey) {
                this.cacheZooInfoWindows.get(zooInfoWindowId).close();
            }
        }
        // Why a second loop?
        for (let zooInfoWindowId of this.cacheZooInfoWindows.keys()) {
            if (zooInfoWindowId !== zooKey) {
                this.cacheZooInfoWindows.get(zooInfoWindowId).close();
            }
        }
        this.getZooInfoWindow(zooId).open(this.googleMap, this.cacheZooMarkers.get(zooKey));
    }

    hideAllMarkers(exceptionList: string[]): void {
        // Hide all info windows, except those for zoos currently selected.
        for (let zooKey of this.cacheZooInfoWindows.keys()) {
            if (!exceptionList.includes(zooKey)) {
                this.cacheZooInfoWindows.get(zooKey).close();
            }
        }
        // Hide all markers
        for (let zooKey of this.cacheZooMarkers.keys()) {
            this.cacheZooMarkers.get(zooKey).setVisible(false);
        }
        // Unbold species in any zoo marker info windows?
        $("li.zoo_species").removeClass("selected_species");
    }
}