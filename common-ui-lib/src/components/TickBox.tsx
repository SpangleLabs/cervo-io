import React from "react";
import {BoxUnchecked} from "./images/BoxUnchecked";
import {BoxChecked} from "./images/BoxChecked";

export interface IsSelected {
    selected: boolean
}

export const TickBox: React.FunctionComponent<IsSelected> = (props) => {
    if (props.selected) {
        return <BoxChecked/>
    } else {
        return <BoxUnchecked/>
    }
}
