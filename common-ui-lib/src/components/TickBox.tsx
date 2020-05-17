import * as React from "react";
import {BoxUnchecked} from "./images/boxUnchecked";
import {BoxChecked} from "./images/boxChecked";

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
