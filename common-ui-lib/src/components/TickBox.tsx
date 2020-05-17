import * as React from "react";
import {BoxChecked, BoxUnchecked} from "./images/images";

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
