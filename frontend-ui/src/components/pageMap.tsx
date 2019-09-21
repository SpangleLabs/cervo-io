import * as React from "react";
import config from "../config";
import {FullZooJson, ZooJson} from "../../../common-lib/src/apiInterfaces";
import {GoogleMap, InfoWindow, LoadScript, Marker} from "@react-google-maps/api";

interface MapProps {
    google: any;
    selectedZoos: ZooJson[];
    selectedSpeciesIds: number[];
    visibleInfoWindowsZoos: FullZooJson[];
    onMarkerClick: (zoo: ZooJson) => void;
    onInfoWindowClose: (zoo: FullZooJson) => void;
}
interface InfoWindowContentProps {
    zoo: FullZooJson;
    selectedSpeciesIds: number[];
}

export class InfoWindowContent extends React.Component<InfoWindowContentProps, {}> {
    render() {
        return <>
            <h1>{this.props.zoo.name}</h1>
            <a href={this.props.zoo.link}>{this.props.zoo.link}</a><br/>
            <span>Postcode: </span>{this.props.zoo.postcode}<br/>
            <h2>Species:</h2>
            <ul className="zoo_species">
                {this.props.zoo.species.map((species) =>
                    <li>
                        <span className={`zoo_species species ${this.props.selectedSpeciesIds.includes(species.species_id) ? "selected" : ""}`}>
                            <span className="common_name">{species.common_name}</span>
                            <span className="latin_name">{species.latin_name}</span>
                        </span>
                    </li>
                )}
            </ul>
        </>
    }
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
                    key={zoo.zoo_id}
                    position={{lat: zoo.latitude, lng: zoo.longitude}}
                    title={zoo.name}
                    onLoad={onLoad}
                    onClick={onClick}
                />
            ]
        }));
        const self = this;
        const visibleInfoWindows = this.props.visibleInfoWindowsZoos.map(function(zoo: FullZooJson) {
                const onClick = self.props.onInfoWindowClose.bind(null, zoo);
                return <InfoWindow key={zoo.zoo_id} anchor={self.markers.get(zoo.zoo_id)} onCloseClick={onClick}>
                    <InfoWindowContent zoo={zoo} selectedSpeciesIds={self.props.selectedSpeciesIds}/>
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
