import {Map, Marker} from 'google-maps-react';
import * as React from "react";
//import config from "../config";
import {ZooJson} from "../../../common-lib/src/apiInterfaces";

interface MapProps {
    google: any;
    selectedZoos: ZooJson[];
    // visibleInfoWindows: Marker[];
}

export class MapContainer extends React.Component<MapProps, {}> {
    render() {
        return (
            <Map
                google={this.props.google}
                zoom={6}
                center={{lat: 55, lng: -3}}
            >
                {
                    this.props.selectedZoos.map((zoo) =>
                        <Marker
                            position={{lat: zoo.latitude, lng: zoo.longitude}}
                            title={zoo.name}
                        />)
                }

                {/*<InfoWindow onClose={this.onInfoWindowClose}>*/}
                {/*    <div>*/}
                {/*        <h1>{this.state.selectedPlace.name}</h1>*/}
                {/*    </div>*/}
                {/*</InfoWindow>*/}
            </Map>
        );
    }
}
