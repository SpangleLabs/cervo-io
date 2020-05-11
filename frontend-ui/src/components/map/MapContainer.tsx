import * as React from "react";
import config from "../../config";
import {FullZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {GoogleMap, InfoWindow, LoadScript, Marker} from "@react-google-maps/api";
import {InfoWindowContent} from "./InfoWindowContent";

const styles = require("./MapContainer.css")

interface MapProps {
    google: any;
    selectedZoos: ZooJson[];
    selectedSpeciesIds: number[];
    visibleInfoWindowsZoos: FullZooJson[];
    onMarkerClick: (zoo: ZooJson) => void;
    onInfoWindowClose: (zoo: FullZooJson) => void;
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
            <div id={styles.mapCContainer}>
                <div id={styles.mapContainer}>
                    <LoadScript googleMapsApiKey={config['google_maps_key']} >
                        <GoogleMap
                            zoom={6}
                            center={{lat: 55, lng: -3}}
                            id={styles.map}
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
