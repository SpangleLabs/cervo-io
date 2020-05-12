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

    // handle ordering of zoos here.
    const cmp:(a: boolean | number | undefined, b: boolean | number | undefined) => number = (a, b) => {
        if (a === undefined && b === undefined) return 0;
        if (a === undefined) return +1;
        if (b === undefined) return -1;
        if (a > b) return +1;
        if (a < b) return -1;
        return 0;
    }
    const compareZoos = (a: ZooJson, b: ZooJson) => {
        return cmp(!props.zooDistances.has(a.zoo_id), !props.zooDistances.has(b.zoo_id))
            || cmp(props.zooDistances.get(a.zoo_id), props.zooDistances.get(b.zoo_id))
            || a.name.localeCompare(b.name)
    }

    const orderedZoos = props.selectedZoos.sort(compareZoos);

    return <>
    <h2>Zoos with selected species ({props.selectedZoos.length})</h2>
        {props.loadingDistances ? <Spinner/> : ""}
        <ul id="selected-zoos">
            {orderedZoos.map((zoo) => {
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