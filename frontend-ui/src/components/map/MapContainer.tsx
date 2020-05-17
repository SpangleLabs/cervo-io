import React from "react";
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

    constructor(props: MapProps) {
        super(props);
    }

    render() {
        const infoWindowMap = this.props.visibleInfoWindowsZoos.reduce(function (map, obj) {
            map.set(obj.zoo_id, obj);
            return map;
        }, new Map<number, FullZooJson>());
        const currentMarkers: Map<number, JSX.Element> = new Map(this.props.selectedZoos.map((zoo) => {
            const onClick = () => {
                this.props.onMarkerClick(zoo);
            }
            let child: JSX.Element | null = null;
            const infoWindowZoo = infoWindowMap.get(zoo.zoo_id);
            if (infoWindowZoo !== undefined) {
                const onClickInfo = this.props.onInfoWindowClose.bind(null, infoWindowZoo);
                child = <InfoWindow
                    onCloseClick={onClickInfo}
                    position={{lat: zoo.latitude, lng: zoo.longitude}}
                    >
                    <InfoWindowContent
                        zoo={infoWindowZoo}
                        selectedSpeciesIds={this.props.selectedSpeciesIds}
                    />
                </InfoWindow>;
            }
            return [
                zoo.zoo_id,
                <Marker
                    key={zoo.zoo_id}
                    position={{lat: zoo.latitude, lng: zoo.longitude}}
                    title={zoo.name}
                    onClick={onClick}
                >
                    {child}
                </Marker>
            ]
        }));
        return (
            <div id={styles.mapCContainer}>
                <div id={styles.mapContainer}>
                    <LoadScript googleMapsApiKey={config['google_maps_key']} >
                        <GoogleMap
                            zoom={6}
                            center={{lat: 55, lng: -3}}
                            id={styles.map}
                        >
                            {Array.from(currentMarkers.values())}
                        </GoogleMap>
                    </LoadScript>
                </div>
            </div>
        );
    }
}
