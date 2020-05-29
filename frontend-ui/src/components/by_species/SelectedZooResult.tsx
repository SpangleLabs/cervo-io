import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import React from "react";

const styles = require("./SelectedZooResult.css")

interface SelectedZooResultProps {
    zoo: ZooJson;
    distance: number | undefined;
    onSelect: () => void;
}

export const SelectedZooResult: React.FunctionComponent<SelectedZooResultProps> = (props) => {
    let distance = "";
    if (props.distance) {
        distance = `(${Math.round(props.distance / 1000)}km)`;
    }
    return <li>
        <span className={styles.clickable} onClick={props.onSelect}>{props.zoo.name}</span>
        <span className={styles.distance}>{distance}</span>
    </li>
}
