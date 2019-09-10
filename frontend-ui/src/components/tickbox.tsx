import * as React from "react";
import {BoxChecked, BoxUnchecked} from "./images";

export interface IsSelected {
    selected: boolean
}

export class TickBox extends React.Component<IsSelected, {}> {
    render() {
        if(this.props.selected) {
            return <BoxChecked />
        } else {
            return <BoxUnchecked />
        }
    }
}