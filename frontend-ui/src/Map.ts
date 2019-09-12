import config from "./config";
import loadGoogleMapsApi from "load-google-maps-api";

export class GoogleMap {

    static loadGoogleMapsApi(): Promise<typeof google.maps> {
        return loadGoogleMapsApi({key: config["google_maps_key"]});
    }

    static createMap(googleMaps: any, mapElement: HTMLElement): typeof googleMaps.Map {
        return new googleMaps.Map(mapElement, {
            center: {lat: 55, lng: -3},
            zoom: 6
        });
    }
}
