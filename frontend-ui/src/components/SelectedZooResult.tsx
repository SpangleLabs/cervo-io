import {ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import React from "react";

const styles = require("./SelectedZooResult.css")

interface SelectedZooResultProps {
    zoo: ZooJson;
    distance: number|undefined;
    onSelect: () => void;
}

export class SelectedZooResult extends React.Component<SelectedZooResultProps, {}> {
    constructor(props: SelectedZooResultProps) {
        super(props);
    }

    render() {
        let distance = "";
        if(this.props.distance) {
            distance = `(${Math.round(this.props.distance/1000)}km)`;
        }
        return <li>
            <span className={styles.clickable} onClick={this.props.onSelect}>{this.props.zoo.name}</span>
            <span className={styles.distance}>{distance}</span>
        </li>
    }
}
