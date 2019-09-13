import {InfoWindow, Map as GoogleMap, Marker} from 'google-maps-react';
import * as React from "react";
//import config from "../config";
import {ZooJson} from "../../../common-lib/src/apiInterfaces";

interface MapProps {
    google: any;
    selectedZoos: ZooJson[];
    selectedSpeciesIds: number[];
    visibleInfoWindowsZooIds: number[];
}

export class MapContainer extends React.Component<MapProps, {}> {
    render() {
        const currentMarkers: Map<number, JSX.Element> = new Map(this.props.selectedZoos.map((zoo) =>
            [
                zoo.zoo_id,
                <Marker
                    position={{lat: zoo.latitude, lng: zoo.longitude}}
                    title={zoo.name}
                />
            ]));
        const visibleInfoWindows = this.props.visibleInfoWindowsZooIds.map((x) =>
            <InfoWindow
                google={this.props.google}
                map={map}
                marker={currentMarkers.get(x)}
            />
        );
        return (
            <GoogleMap
                google={this.props.google}
                zoom={6}
                center={{lat: 55, lng: -3}}
            >
                {currentMarkers.values()}
                {visibleInfoWindows}
            </GoogleMap>
        );
    }
}
