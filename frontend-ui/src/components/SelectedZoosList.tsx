import {Spinner} from "../../../common-ui-lib/src/components/images";
import {SelectedZooResult} from "./SelectedZooResult";
import * as React from "react";
import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";

interface SelectedZoosListProps {
    selectedZoos: ZooJson[];
    onSelectZoos: (zoo: ZooJson) => void;
    zooDistances: Map<number, number>;
    loadingDistances: boolean
}

export const SelectedZoosList: React.FunctionComponent<SelectedZoosListProps> = (props) => {
    return <>
    <h2>Zoos with selected species ({props.selectedZoos.length})</h2>
        {props.loadingDistances ? <Spinner/> : ""}
        <ul id="selected-zoos">
            {props.selectedZoos.map((zoo) => {
                const onSelect = props.onSelectZoos.bind(null, zoo);
                return <SelectedZooResult
                    key={zoo.zoo_id}
                    zoo={zoo}
                    onSelect={onSelect}
                    distance={props.zooDistances.get(zoo.zoo_id)}
                />
            })}
        </ul>
        </>
}