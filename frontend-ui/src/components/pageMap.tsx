import * as React from "react";
import config from "../config";
import {SpeciesEntryForZooJson, ZooJson} from "../../../common-lib/src/apiInterfaces";
import {GoogleMap, InfoWindow, LoadScript, Marker} from "@react-google-maps/api";

interface MapProps {
    google: any;
    selectedZoos: ZooJson[];
    selectedSpeciesIds: number[];
    visibleInfoWindowsZoos: ZooJson[];
    onMarkerClick: (zoo: ZooJson) => void;
}

export class MapContainer extends React.Component<MapProps, {}> {
    markers: Map<number, google.maps.Marker>;

    constructor(props: MapProps) {
        super(props);
        this.markers = new Map();
        this.addMarker = this.addMarker.bind(this);
    }

    addMarker(zooId: number, marker: google.maps.Marker) {
        this.markers.set(zooId, marker);
    }

    render() {
        const currentMarkers: Map<number, JSX.Element> = new Map(this.props.selectedZoos.map((zoo) =>
        {
            const onClick = this.props.onMarkerClick.bind(null, zoo);
            const onLoad = this.addMarker.bind(null, zoo.zoo_id);
            return [
                zoo.zoo_id,
                <Marker
                    position={{lat: zoo.latitude, lng: zoo.longitude}}
                    title={zoo.name}
                    onLoad={onLoad}
                    onClick={onClick}
                />
            ]
        }));
        const visibleInfoWindows = this.props.visibleInfoWindowsZoos.map((zoo) => {
                const zooSpecies: SpeciesEntryForZooJson[] = [];
                return <InfoWindow anchor={this.markers.get(zoo.zoo_id)}>
                    <h1>{zoo.name}</h1>
                    <a href={zoo.link}>{zoo.link}</a><br/>
                    <span>Postcode: </span>{zoo.postcode}<br/>
                    <h2>Species:</h2>
                    <ul className="zoo_species">
                        {zooSpecies.map((x) => <li className="zoo_species">
                            <span className="common_name">common name</span>
                            <span className="latin_name">latin name</span>
                        </li>)}
                    </ul>
                </InfoWindow>
            }
        );
        return (
            <div id="map-ccontainer">
                <div id="map-container">
                    <LoadScript googleMapsApiKey={config['google_maps_key']} >
                        <GoogleMap
                            zoom={6}
                            center={{lat: 55, lng: -3}}
                            id="map"
                        >
                            {currentMarkers.values()}
                            {visibleInfoWindows}
                        </GoogleMap>
                    </LoadScript>
                </div>
            </div>
        );
    }
}
